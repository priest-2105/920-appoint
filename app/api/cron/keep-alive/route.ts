import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// This endpoint will be called by a cron job to keep the Supabase database active
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Simple query to ping the database
    const { data, error } = await supabase.from("settings").select("key").limit(1)

    if (error) {
      console.error("Error pinging Supabase:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Supabase database pinged successfully",
    })
  } catch (error) {
    console.error("Error in keep-alive route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

