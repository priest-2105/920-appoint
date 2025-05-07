import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Check if the user is an admin by querying the customers table
    const { data: customerData, error } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (error || !customerData?.is_admin) {
      // Redirect to home if not an admin
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/booking-confirmation/:path*"],
}
