import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Statistika
  const [delavciRes, strojiRes, izdelkiRes, proizvodnjaRes] = await Promise.all([
    supabase.from("delavci").select("id", { count: "exact", head: true }),
    supabase.from("stroji").select("id", { count: "exact", head: true }),
    supabase.from("izdelki").select("id", { count: "exact", head: true }),
    supabase
      .from("proizvodnja")
      .select("id", { count: "exact", head: true })
      .gte("datum", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
  ]);

  const stats = [
    { label: "Delavci", value: delavciRes.count ?? 0, href: "#" },
    { label: "Stroji", value: strojiRes.count ?? 0, href: "#" },
    { label: "Izdelki", value: izdelkiRes.count ?? 0, href: "#" },
    {
      label: "Vnosi v zadnjih 7 dneh",
      value: proizvodnjaRes.count ?? 0,
      href: "/proizvodnja/tedensko",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Domov</h1>
        <p className="text-slate-500 mt-1">
          Pregled poslovanja AS system aplikacije
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl p-5 border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all"
          >
            <div className="text-3xl font-bold text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Hitra dejanja
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/proizvodnja/vnos"
            className="flex items-center justify-between p-4 rounded-lg bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            <div>
              <div className="font-medium text-slate-900">
                ➕ Nov vnos proizvodnje
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                Dnevni vnos količin po delavcu
              </div>
            </div>
            <div className="text-brand-600">→</div>
          </Link>
          <Link
            href="/proizvodnja/tedensko"
            className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div>
              <div className="font-medium text-slate-900">
                📊 Tedensko poročilo
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                Pregled Pon–Pet po delavcu in stroju
              </div>
            </div>
            <div className="text-slate-400">→</div>
          </Link>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900">
        <strong>Faza 1 — proizvodnja.</strong> Trenutno je v aplikaciji samo modul
        Proizvodnja. Naslednji moduli (Montaža, CRM, Nabava, Računovodstvo …) bodo
        dodani postopoma.
      </div>
    </div>
  );
}
