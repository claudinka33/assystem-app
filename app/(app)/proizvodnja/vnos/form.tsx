"use client";

import { useState, useMemo, useTransition } from "react";
import { vnesiProizvodnjo } from "./actions";
import type {
  Delavec,
  Stroj,
  Izdelek,
  Zica,
  Izmena,
} from "@/lib/types/database";
import { SEGMENT_LABELS, OPERACIJA_LABELS } from "@/lib/types/database";

interface Props {
  delavci: Delavec[];
  stroji: Stroj[];
  izdelki: Izdelek[];
  zice: Zica[];
}

export default function VnosForm({ delavci, stroji, izdelki, zice }: Props) {
  const danes = new Date().toISOString().slice(0, 10);

  const [datum, setDatum] = useState(danes);
  const [izmena, setIzmena] = useState<Izmena>("prva");
  const [delavecId, setDelavecId] = useState("");
  const [strojId, setStrojId] = useState("");
  const [izdelekId, setIzdelekId] = useState("");
  const [zicaId, setZicaId] = useState("");
  const [ureDela, setUreDela] = useState(7);
  const [kolicina, setKolicina] = useState<number | "">("");
  const [nalog, setNalog] = useState("");
  const [opombe, setOpombe] = useState("");
  const [isPending, startTransition] = useTransition();

  // Izbrani stroj
  const stroj = useMemo(
    () => stroji.find((s) => s.id === strojId),
    [strojId, stroji]
  );

  // Izračun norme: kos/min × 60 × ure dela
  const norma = useMemo(() => {
    if (!stroj || !stroj.norma_kos_min) return 0;
    return Math.round(stroj.norma_kos_min * 60 * ureDela);
  }, [stroj, ureDela]);

  // Učinkovitost
  const ucinkovitost = useMemo(() => {
    if (typeof kolicina !== "number" || norma === 0) return null;
    return Math.round((kolicina / norma) * 10000) / 100;
  }, [kolicina, norma]);

  // Filtriraj izdelke po segmentu stroja
  const izdelkiFiltrirani = useMemo(() => {
    if (!stroj) return izdelki;
    return izdelki.filter((i) => i.segment === stroj.segment);
  }, [stroj, izdelki]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("norma_kos", String(norma));

    startTransition(async () => {
      await vnesiProizvodnjo(fd);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        📋 Nov vnos proizvodnje
      </h2>

      {/* Datum + izmena */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Datum
          </label>
          <input
            type="date"
            name="datum"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Izmena
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["prva", "druga", "nadure"] as const).map((iz) => (
              <button
                key={iz}
                type="button"
                onClick={() => setIzmena(iz)}
                className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                  izmena === iz
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                {iz === "prva" ? "1." : iz === "druga" ? "2." : "Nadure"}
              </button>
            ))}
            <input type="hidden" name="izmena" value={izmena} />
          </div>
        </div>
      </div>

      {/* Delavec */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Delavec
        </label>
        <select
          name="delavec_id"
          value={delavecId}
          onChange={(e) => setDelavecId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
        >
          <option value="">— izberi delavca —</option>
          {delavci.map((d) => (
            <option key={d.id} value={d.id}>
              {d.ime} {d.priimek}
              {d.vloga_v_proizvodnji === "vodja_proizvodnje" ? " (vodja)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Stroj */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Stroj
        </label>
        <select
          name="stroj_id"
          value={strojId}
          onChange={(e) => {
            setStrojId(e.target.value);
            setIzdelekId(""); // resetiraj izdelek ob spremembi stroja
          }}
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
        >
          <option value="">— izberi stroj —</option>
          {stroji.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sifra} — {s.naziv} ({OPERACIJA_LABELS[s.operacija]},{" "}
              {SEGMENT_LABELS[s.segment]})
              {s.stanje !== "aktiven" ? ` [${s.stanje}]` : ""}
            </option>
          ))}
        </select>
        {stroj && stroj.norma_kos_min > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            Norma stroja: {stroj.norma_kos_min} kos/min ={" "}
            {(stroj.norma_kos_min * 60).toLocaleString("sl-SI")} kos/h
          </p>
        )}
      </div>

      {/* Izdelek */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Izdelek
          {stroj && (
            <span className="text-xs text-slate-500 font-normal ml-2">
              (filtrirano po segmentu: {SEGMENT_LABELS[stroj.segment]})
            </span>
          )}
        </label>
        <select
          name="izdelek_id"
          value={izdelekId}
          onChange={(e) => setIzdelekId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
        >
          <option value="">— izberi izdelek —</option>
          {izdelkiFiltrirani.map((i) => (
            <option key={i.id} value={i.id}>
              {i.sifra} — {i.ime}
            </option>
          ))}
        </select>
      </div>

      {/* Žica (neobvezno) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Žica / material{" "}
          <span className="text-xs text-slate-400 font-normal">(neobvezno)</span>
        </label>
        <select
          name="zica_id"
          value={zicaId}
          onChange={(e) => setZicaId(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
        >
          <option value="">— brez —</option>
          {zice.map((z) => (
            <option key={z.id} value={z.id}>
              {z.koda}
            </option>
          ))}
        </select>
      </div>

      {/* Ure + količina */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ure dela
          </label>
          <input
            type="number"
            name="ure_dela"
            step="0.25"
            min="0"
            max="24"
            value={ureDela}
            onChange={(e) => setUreDela(Number(e.target.value))}
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Količina (kos)
          </label>
          <input
            type="number"
            name="kolicina_kos"
            min="0"
            value={kolicina}
            onChange={(e) =>
              setKolicina(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none text-lg font-semibold"
          />
        </div>
      </div>

      {/* Norma + učinkovitost (info) */}
      <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Norma za {ureDela}h
          </div>
          <div className="text-xl font-semibold text-slate-900 mt-1">
            {norma > 0 ? norma.toLocaleString("sl-SI") : "—"} kos
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Učinkovitost
          </div>
          <div
            className={`text-xl font-semibold mt-1 ${
              ucinkovitost == null
                ? "text-slate-400"
                : ucinkovitost >= 100
                ? "text-emerald-600"
                : ucinkovitost >= 80
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {ucinkovitost == null ? "—" : `${ucinkovitost}%`}
          </div>
        </div>
      </div>

      {/* Nalog + opombe */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Delovni nalog{" "}
          <span className="text-xs text-slate-400 font-normal">(neobvezno)</span>
        </label>
        <input
          type="text"
          name="nalog"
          value={nalog}
          onChange={(e) => setNalog(e.target.value)}
          placeholder="npr. 20012"
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Opombe{" "}
          <span className="text-xs text-slate-400 font-normal">(neobvezno)</span>
        </label>
        <textarea
          name="opombe"
          value={opombe}
          onChange={(e) => setOpombe(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold text-lg transition-colors"
      >
        {isPending ? "Shranjujem…" : "💾 Shrani vnos"}
      </button>
    </form>
  );
}
