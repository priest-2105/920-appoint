import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

// This endpoint will be called periodically to keep the Supabase connection alive
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Simple query to ping the database
    const { data, error } = await supabase.from("settings").select("key").limit(1)

    if (error) {
      console.error("Error pinging Supabase:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error("Error in keep-alive route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

