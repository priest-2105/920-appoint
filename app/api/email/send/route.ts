import { NextResponse } from "next/server"
import { isAdmin } from "@/app/actions/auth"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    // Check if the user is authenticated
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, subject, html } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sendEmail({ to, subject, html })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error in email send route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

