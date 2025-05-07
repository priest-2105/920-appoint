import { NextResponse } from "next/server"
import { getTokens } from "@/lib/google-calendar"
import { createServerSupabaseClient } from "@/lib/supabase"

// Handle callback from Google OAuth
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(`${url.origin}/admin/settings?error=No authorization code received`)
    }

    // Exchange code for tokens
    const tokens = await getTokens(code)

    // Store tokens in Supabase settings table
    const supabase = createServerSupabaseClient()

    // Check if Google Calendar settings already exist
    const { data: existingSettings } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "google_calendar_credentials")
      .single()

    if (existingSettings) {
      // Update existing settings
      await supabase
        .from("settings")
        .update({
          value: tokens,
          updated_at: new Date().toISOString(),
        })
        .eq("key", "google_calendar_credentials")
    } else {
      // Create new settings
      await supabase.from("settings").insert([
        {
          key: "google_calendar_credentials",
          value: tokens,
        },
      ])
    }

    return NextResponse.redirect(`${url.origin}/admin/settings?success=Google Calendar connected successfully`)
  } catch (error) {
    console.error("Error in Google callback route:", error)
    return NextResponse.redirect(`${url.origin}/admin/settings?error=Failed to authenticate with Google`)
  }
}
