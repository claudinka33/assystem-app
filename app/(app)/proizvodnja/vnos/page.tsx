import { createClient } from "@/lib/supabase/server";
import VnosForm from "./form";
import type { Delavec, Stroj, Izdelek, Zica } from "@/lib/types/database";

export default async function VnosPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [delavciRes, strojiRes, izdelkiRes, ziceRes] = await Promise.all([
    supabase
      .from("delavci")
      .select("*")
      .eq("aktiven", true)
      .eq("oddelek", "proizvodnja")
      .order("priimek"),
    supabase
      .from("stroji")
      .select("*")
      .neq("stanje", "ukinjen")
      .order("sifra"),
    supabase
      .from("izdelki")
      .select("*")
      .eq("aktiven", true)
      .order("sifra"),
    supabase.from("zice").select("*").eq("aktivna", true).order("koda"),
  ]);

  // Zadnjih 10 vnosov za pregled
  const recentRes = await supabase
    .from("proizvodnja")
    .select(
      `id, datum, izmena, kolicina_kos, norma_kos, ucinkovitost, nalog,
       delavci(ime, priimek),
       stroji(sifra, naziv),
       izdelki(sifra, ime)`
    )
    .order("ustvarjen_dne", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vnos proizvodnje</h1>
        <p className="text-slate-500 mt-1">
          Dnevni vnos količin po delavcu, stroju in izdelku
        </p>
      </div>

      {params.success && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
          ✅ {params.success}
        </div>
      )}
      {params.error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          ❌ {params.error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VnosForm
            delavci={(delavciRes.data ?? []) as Delavec[]}
            stroji={(strojiRes.data ?? []) as Stroj[]}
            izdelki={(izdelkiRes.data ?? []) as Izdelek[]}
            zice={(ziceRes.data ?? []) as Zica[]}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">
              Zadnji vnosi (10)
            </h3>
            {(recentRes.data ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">
                Še ni vnosov. Vpiši prvega.
              </p>
            ) : (
              <ul className="space-y-2">
                {(recentRes.data ?? []).map((v) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const r = v as any;
                  return (
                    <li
                      key={r.id}
                      className="text-sm border-b border-slate-100 pb-2 last:border-0"
                    >
                      <div className="font-medium">
                        {r.kolicina_kos.toLocaleString("sl-SI")} kos
                        {r.ucinkovitost && (
                          <span
                            className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                              r.ucinkovitost >= 100
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {r.ucinkovitost}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.delavci?.ime} {r.delavci?.priimek} •{" "}
                        {r.stroji?.sifra} • {r.izdelki?.ime}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(r.datum).toLocaleDateString("sl-SI")} •{" "}
                        {r.izmena}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
