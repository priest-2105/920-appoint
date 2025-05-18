import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    console.log("Email API route called")
    const { to, subject, html } = await request.json()
    console.log("Request data:", { to, subject, htmlLength: html?.length })

    if (!to || !subject || !html) {
      console.log("Missing fields:", { to: !!to, subject: !!subject, html: !!html })
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("Attempting to send email to:", to)
    const { data, error } = await resend.emails.send({
      from: "920Appoint <onboarding@resend.dev>",
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      )
    }

    console.log("Email sent successfully:", data)
    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error("Error in email API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
