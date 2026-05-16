import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SEGMENT_LABELS } from "@/lib/types/database";

// Pomocna: vrni ponedeljek za podan datum
function ponedeljek(d: Date): Date {
  const day = d.getDay(); // 0 = nedelja, 1 = pon ...
  const diff = (day + 6) % 7;
  const result = new Date(d);
  result.setDate(d.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatSL(d: Date): string {
  return d.toLocaleDateString("sl-SI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export default async function TedenskoPage({
  searchParams,
}: {
  searchParams: Promise<{ teden?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Določi teden (privzeto: trenutni)
  const izbrani = params.teden ? new Date(params.teden) : new Date();
  const pon = ponedeljek(izbrani);
  const pet = new Date(pon);
  pet.setDate(pon.getDate() + 4);

  const prejsnji = new Date(pon);
  prejsnji.setDate(pon.getDate() - 7);
  const naslednji = new Date(pon);
  naslednji.setDate(pon.getDate() + 7);

  // Vnosi v tem tednu (Pon–Pet)
  const { data: vnosi } = await supabase
    .from("proizvodnja")
    .select(
      `id, datum, izmena, ure_dela, kolicina_kos, norma_kos, ucinkovitost, nalog, potrjeno,
       delavci(id, ime, priimek),
       stroji(id, sifra, naziv, segment, operacija),
       izdelki(id, sifra, ime, segment)`
    )
    .gte("datum", formatDate(pon))
    .lte("datum", formatDate(pet))
    .order("datum")
    .order("izmena");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (vnosi ?? []) as any[];

  // Agregacije
  const skupajKos = rows.reduce((a, r) => a + (r.kolicina_kos ?? 0), 0);
  const skupajNorma = rows.reduce((a, r) => a + (r.norma_kos ?? 0), 0);
  const skupajUr = rows.reduce((a, r) => a + Number(r.ure_dela ?? 0), 0);
  const povpUcink =
    skupajNorma > 0 ? Math.round((skupajKos / skupajNorma) * 10000) / 100 : 0;

  // Po delavcih
  type Agg = {
    kljuc: string;
    naziv: string;
    kos: number;
    norma: number;
    ure: number;
  };
  const poDelavcu = new Map<string, Agg>();
  const poStroju = new Map<string, Agg>();
  const poIzdelku = new Map<string, Agg & { segment: string }>();

  for (const r of rows) {
    const dKljuc = r.delavci?.id ?? "—";
    const dNaziv = r.delavci ? `${r.delavci.ime} ${r.delavci.priimek}` : "—";
    if (!poDelavcu.has(dKljuc))
      poDelavcu.set(dKljuc, {
        kljuc: dKljuc,
        naziv: dNaziv,
        kos: 0,
        norma: 0,
        ure: 0,
      });
    const dAgg = poDelavcu.get(dKljuc)!;
    dAgg.kos += r.kolicina_kos ?? 0;
    dAgg.norma += r.norma_kos ?? 0;
    dAgg.ure += Number(r.ure_dela ?? 0);

    const sKljuc = r.stroji?.id ?? "—";
    const sNaziv = r.stroji
      ? `${r.stroji.sifra} — ${r.stroji.naziv}`
      : "—";
    if (!poStroju.has(sKljuc))
      poStroju.set(sKljuc, {
        kljuc: sKljuc,
        naziv: sNaziv,
        kos: 0,
        norma: 0,
        ure: 0,
      });
    const sAgg = poStroju.get(sKljuc)!;
    sAgg.kos += r.kolicina_kos ?? 0;
    sAgg.norma += r.norma_kos ?? 0;
    sAgg.ure += Number(r.ure_dela ?? 0);

    const iKljuc = r.izdelki?.id ?? "—";
    const iNaziv = r.izdelki?.ime ?? "—";
    const iSeg = r.izdelki?.segment ?? "";
    if (!poIzdelku.has(iKljuc))
      poIzdelku.set(iKljuc, {
        kljuc: iKljuc,
        naziv: iNaziv,
        kos: 0,
        norma: 0,
        ure: 0,
        segment: iSeg,
      });
    const iAgg = poIzdelku.get(iKljuc)!;
    iAgg.kos += r.kolicina_kos ?? 0;
    iAgg.norma += r.norma_kos ?? 0;
    iAgg.ure += Number(r.ure_dela ?? 0);
  }

  return (
    <div className="space-y-6">
      {/* Header z izbiro tedna */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tedensko poročilo</h1>
          <p className="text-slate-500 mt-1">
            Pon {formatSL(pon)} – Pet {formatSL(pet)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/proizvodnja/tedensko?teden=${formatDate(prejsnji)}`}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-100"
          >
            ← Prejšnji teden
          </Link>
          <Link
            href="/proizvodnja/tedensko"
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-100"
          >
            Ta teden
          </Link>
          <Link
            href={`/proizvodnja/tedensko?teden=${formatDate(naslednji)}`}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-100"
          >
            Naslednji teden →
          </Link>
        </div>
      </div>

      {/* Agregati */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Skupna proizvodnja"
          value={`${skupajKos.toLocaleString("sl-SI")} kos`}
        />
        <Stat
          label="Skupna norma"
          value={`${skupajNorma.toLocaleString("sl-SI")} kos`}
        />
        <Stat
          label="Povprečna učinkovitost"
          value={skupajNorma > 0 ? `${povpUcink}%` : "—"}
          tone={
            skupajNorma === 0
              ? "neutral"
              : povpUcink >= 100
              ? "good"
              : povpUcink >= 80
              ? "warn"
              : "bad"
          }
        />
        <Stat
          label="Skupaj delovnih ur"
          value={`${skupajUr.toLocaleString("sl-SI")} h`}
        />
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">
            V tem tednu (Pon–Pet) še ni vnosov proizvodnje.
          </p>
          <Link
            href="/proizvodnja/vnos"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            Vnesi prvega
          </Link>
        </div>
      ) : (
        <>
          {/* Po delavcih */}
          <Tabela
            title="Po delavcih"
            agg={[...poDelavcu.values()].sort((a, b) => b.kos - a.kos)}
          />
          {/* Po strojih */}
          <Tabela
            title="Po strojih"
            agg={[...poStroju.values()].sort((a, b) => b.kos - a.kos)}
          />
          {/* Po izdelkih */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <h2 className="font-semibold text-slate-900 px-5 py-3 border-b border-slate-200">
              Po izdelkih
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Izdelek</th>
                    <th className="text-left px-4 py-2 font-medium">Segment</th>
                    <th className="text-right px-4 py-2 font-medium">
                      Količina
                    </th>
                    <th className="text-right px-4 py-2 font-medium">Norma</th>
                    <th className="text-right px-4 py-2 font-medium">Učink.</th>
                  </tr>
                </thead>
                <tbody>
                  {[...poIzdelku.values()]
                    .sort((a, b) => b.kos - a.kos)
                    .map((a) => {
                      const u =
                        a.norma > 0
                          ? Math.round((a.kos / a.norma) * 10000) / 100
                          : null;
                      return (
                        <tr
                          key={a.kljuc}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-2">{a.naziv}</td>
                          <td className="px-4 py-2 text-slate-500">
                            {SEGMENT_LABELS[
                              a.segment as keyof typeof SEGMENT_LABELS
                            ] ?? a.segment}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {a.kos.toLocaleString("sl-SI")}
                          </td>
                          <td className="px-4 py-2 text-right text-slate-500">
                            {a.norma.toLocaleString("sl-SI")}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {u == null ? "—" : `${u}%`}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vsi vnosi */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <h2 className="font-semibold text-slate-900 px-5 py-3 border-b border-slate-200">
              Vsi vnosi ({rows.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Datum</th>
                    <th className="text-left px-4 py-2 font-medium">Izmena</th>
                    <th className="text-left px-4 py-2 font-medium">Delavec</th>
                    <th className="text-left px-4 py-2 font-medium">Stroj</th>
                    <th className="text-left px-4 py-2 font-medium">Izdelek</th>
                    <th className="text-right px-4 py-2 font-medium">Kos</th>
                    <th className="text-right px-4 py-2 font-medium">Učink.</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-4 py-2">
                        {new Date(r.datum).toLocaleDateString("sl-SI")}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {r.izmena === "prva"
                          ? "1."
                          : r.izmena === "druga"
                          ? "2."
                          : "Nad."}
                      </td>
                      <td className="px-4 py-2">
                        {r.delavci?.ime} {r.delavci?.priimek}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {r.stroji?.sifra}
                      </td>
                      <td className="px-4 py-2">{r.izdelki?.ime}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {r.kolicina_kos.toLocaleString("sl-SI")}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {r.ucinkovitost == null ? "—" : `${r.ucinkovitost}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  const colorClass =
    tone === "good"
      ? "text-emerald-600"
      : tone === "warn"
      ? "text-amber-600"
      : tone === "bad"
      ? "text-red-600"
      : "text-slate-900";
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function Tabela({
  title,
  agg,
}: {
  title: string;
  agg: { kljuc: string; naziv: string; kos: number; norma: number; ure: number }[];
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <h2 className="font-semibold text-slate-900 px-5 py-3 border-b border-slate-200">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Naziv</th>
              <th className="text-right px-4 py-2 font-medium">Količina</th>
              <th className="text-right px-4 py-2 font-medium">Norma</th>
              <th className="text-right px-4 py-2 font-medium">Učinkovitost</th>
              <th className="text-right px-4 py-2 font-medium">Ure</th>
            </tr>
          </thead>
          <tbody>
            {agg.map((a) => {
              const u =
                a.norma > 0
                  ? Math.round((a.kos / a.norma) * 10000) / 100
                  : null;
              return (
                <tr key={a.kljuc} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{a.naziv}</td>
                  <td className="px-4 py-2 text-right">
                    {a.kos.toLocaleString("sl-SI")}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-500">
                    {a.norma.toLocaleString("sl-SI")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {u == null ? (
                      "—"
                    ) : (
                      <span
                        className={
                          u >= 100
                            ? "text-emerald-600 font-medium"
                            : u >= 80
                            ? "text-amber-600"
                            : "text-red-600"
                        }
                      >
                        {u}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-500">
                    {a.ure} h
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
