import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Enable settings
    const enabledSettings = {
      enabled: true,
      checkAvailability: true,
      addEvents: true,
    }

    // First try to update existing settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from("settings")
      .update({ value: enabledSettings })
      .eq("key", "google_calendar_settings")
      .select()
      .single()

    if (updateError) {
      // If update fails (no existing record), insert new settings
      const { data: newSettings, error: insertError } = await supabase
        .from("settings")
        .insert([
          {
            key: "google_calendar_settings",
            value: enabledSettings,
          },
        ])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({
        message: "Settings created and enabled successfully",
        settings: newSettings.value
      })
    }

    return NextResponse.json({
      message: "Settings updated and enabled successfully",
      settings: updatedSettings.value
    })
  } catch (error) {
    console.error("Error enabling Google Calendar settings:", error)
    return NextResponse.json(
      { error: "Failed to enable settings" },
      { status: 500 }
    )
  }
} 