import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const appointmentId = params.id

    // Fetch appointment with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        *,
        customer:customers(*),
        hairstyle:hairstyles(*)
      `)
      .eq("id", appointmentId)
      .single()

    if (appointmentError) {
      console.error("Error fetching appointment:", appointmentError)
      return NextResponse.json(
        { error: "Failed to fetch appointment" },
        { status: 500 }
      )
    }

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error in appointment API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 