import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: hairstyle, error } = await supabase
      .from("hairstyles")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching hairstyle:", error)
      return NextResponse.json(
        { error: "Failed to fetch hairstyle" },
        { status: 500 }
      )
    }

    if (!hairstyle) {
      return NextResponse.json(
        { error: "Hairstyle not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(hairstyle)
  } catch (error) {
    console.error("Error in hairstyle API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 