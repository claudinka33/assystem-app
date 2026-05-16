import { login, signup } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl font-bold mb-4">
              AS
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AS system</h1>
            <p className="text-slate-500 text-sm mt-1">Prijava v aplikacijo</p>
          </div>

          {params.error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {params.error}
            </div>
          )}
          {params.message && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              {params.message}
            </div>
          )}

          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                E-pošta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Geslo
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                formAction={login}
                className="w-full py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors"
              >
                Prijava
              </button>
              <button
                formAction={signup}
                className="w-full py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Ustvari nov račun
              </button>
            </div>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Za prvi račun: vpiši svoj email + geslo (min. 6 znakov) in klikni
            "Ustvari nov račun".
          </p>
        </div>
      </div>
    </main>
  );
}
