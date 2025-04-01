import { NextResponse } from "next/server"
import { sendAdminPaymentNotification } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { payment, amount } = await request.json()

    // In a real implementation, you would fetch the appointment and customer details
    // For demo purposes, we'll create mock data
    const mockAppointment = {
      id: `app-${Date.now()}`,
    }

    const mockCustomer = {
      first_name: "Guest",
      last_name: "Customer",
      email: "guest@example.com",
    }

    // Send the admin notification
    await sendAdminPaymentNotification(mockAppointment, mockCustomer, {
      ...payment,
      amount: amount,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in notify-admin-payment route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

