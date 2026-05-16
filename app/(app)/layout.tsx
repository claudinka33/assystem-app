import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/login/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white text-sm font-bold flex items-center justify-center">
                AS
              </div>
              <span className="font-semibold text-slate-900">AS system</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 hidden sm:block">
                {user.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100"
                >
                  Odjava
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto">
              <NavLink href="/dashboard">Domov</NavLink>
              <NavLink href="/proizvodnja/vnos">Vnos proizvodnje</NavLink>
              <NavLink href="/proizvodnja/tedensko">Tedensko poročilo</NavLink>
            </div>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
          AS system — verzija 0.1 (development)
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-brand-50 rounded-t-lg whitespace-nowrap"
    >
      {children}
    </Link>
  );
}
