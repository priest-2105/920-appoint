import { NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/google-calendar"

// Redirect to Google OAuth consent screen
export async function GET() {
  try {
    const authUrl = getAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error in Google auth route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
