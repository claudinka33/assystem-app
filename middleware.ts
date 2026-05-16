import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Vsi pathi razen:
     * - _next/static (static datoteke)
     * - _next/image (slike)
     * - favicon.ico, sitemap.xml, robots.txt
     * - vse z .png .jpg .svg ... končnico
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
