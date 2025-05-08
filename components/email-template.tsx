import type React from "react"

interface EmailTemplateProps {
  firstName: string
  appointmentDate: string
  appointmentTime: string
  serviceName: string
  duration: number
  price: number
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  firstName,
  appointmentDate,
  appointmentTime,
  serviceName,
  duration,
  price,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
    <div style={{ background: "#3b82f6", padding: "20px", textAlign: "center", color: "white" }}>
      <h1 style={{ margin: 0 }}>920Appoint</h1>
    </div>

    <div style={{ padding: "20px" }}>
      <h2>Appointment Confirmation</h2>
      <p>Dear {firstName},</p>
      <p>Your appointment has been confirmed. Here are the details:</p>

      <div style={{ backgroundColor: "#f3f4f6", padding: "15px", borderRadius: "5px", margin: "20px 0" }}>
        <p>
          <strong>Service:</strong> {serviceName}
        </p>
        <p>
          <strong>Date:</strong> {appointmentDate}
        </p>
        <p>
          <strong>Time:</strong> {appointmentTime}
        </p>
        <p>
          <strong>Duration:</strong> {duration} minutes
        </p>
        <p>
          <strong>Price:</strong> £{price}
        </p>
      </div>

      <p>Location: 123 Hair Street, London, UK</p>
      <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>
      <p>We look forward to seeing you!</p>
      <p>
        Best regards,
        <br />
        920Appoint Team
      </p>
    </div>

    <div
      style={{ backgroundColor: "#f3f4f6", padding: "10px", textAlign: "center", color: "#6b7280", fontSize: "12px" }}
    >
      <p>© {new Date().getFullYear()} 920Appoint. All rights reserved.</p>
      <p>123 Hair Street, London, UK</p>
    </div>
  </div>
)
