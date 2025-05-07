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
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if the user is an admin
    // In a real app, you would check a role or permission
    // For demo purposes, we'll check if the email is admin@stylesync.com
    if (session.user.email !== "admin@stylesync.com") {
      // Redirect to home if not an admin
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/booking-confirmation/:path*"],
}
