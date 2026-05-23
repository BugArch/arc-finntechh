import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseReqResClient } from "@/lib/supabase/server-client";

// Our AdaptiveFolio routes — always allowed, no auth required
const ADAPTIVEFOLIO_ROUTES = [
  '/onboarding',
  '/dashboard',
  '/decisions',
  '/transactions',
  '/opportunities',
  '/tax',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow our AdaptiveFolio routes through
  if (ADAPTIVEFOLIO_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next({
      request: { headers: request.headers },
    })
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createSupabaseReqResClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();

  // Skip redirect logic for API routes
  if (pathname.startsWith("/api")) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};