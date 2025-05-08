import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function enableCalendarSettings() {
  try {
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

      console.log("Created new settings with enabled values:", newSettings)
    } else {
      console.log("Updated existing settings to enabled values:", updatedSettings)
    }

    console.log("Google Calendar settings have been enabled successfully!")
  } catch (error) {
    console.error("Error enabling Google Calendar settings:", error)
  }
}

// Run the function
enableCalendarSettings() 