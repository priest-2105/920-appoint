"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCustomers } from "@/app/actions/customers"
import { useToast } from "@/hooks/use-toast"

export default function AdminEmailPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
  })

  const emailTemplates = {
    appointmentPolicy: {
      subject: "920Appoint - Appointment Policy",
      message: `To secure your appointment, kindly note that £20 (non-refundable) deposit payment is required.

DEPOSIT GOES TOWARDS YOUR SERVICE
NO DEPOSIT = NO APPOINTMENT

Kofoworola Bailey
62688251
04-29-09

Appointment Policy

Hey there! We really appreciate your time and want to make everything smooth for you.
Here's a quick rundown:

- Please give us 4 days' notice to reschedule—no refunds for late changes.
- No-shows won't get a refund either.
- We have a 20-minute grace period, but arriving late might mean rescheduling or an extra charge.
- If you can, drop off your extensions before your appointment to save time also please ensure you blow dry your hair before your appointment
- Cash only for payments, please—no transfers!
- Don't forget to get the exact length with pre-stretched extensions.

Thanks a bunch! Can't wait to see you!`
    }
  }

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers()
        setCustomers(data)
      } catch (error) {
        console.error("Error fetching customers:", error)
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      to: value,
    })
  }

  const handleTemplateSelect = (template: keyof typeof emailTemplates) => {
    const selectedTemplate = emailTemplates[template]
    setFormData({
      ...formData,
      subject: selectedTemplate.subject,
      message: selectedTemplate.message
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    try {
      console.log("Sending email to:", formData.to)
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">920Appoint</h1>
            <div>${formData.message.replace(/\n/g, "<br>")}</div>
            <p>Best regards,<br>920Appoint Team</p>
          </div>`,
        }),
      })

      const data = await response.json()
      console.log("Email API response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      toast({
        title: "Email Sent",
        description: "Your email has been sent successfully.",
      })

      // Reset form
      setFormData({
        to: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Email Customers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Email</CardTitle>
          <CardDescription>Send custom emails to your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Recipient</Label>
              <Select value={formData.to} onValueChange={handleSelectChange}>
                <SelectTrigger id="to">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading customers...
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.email}>
                          {customer.first_name} {customer.last_name} ({customer.email})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Email Template</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTemplateSelect('appointmentPolicy')}
                >
                  Appointment Policy
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={10}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSending || !formData.to}>
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
