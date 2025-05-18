"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getAppointmentPolicy, saveAppointmentPolicy, type AppointmentPolicy } from "@/app/actions/appointment-policy"

export default function AppointmentPolicyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<AppointmentPolicy>({
    contactInfo: {
      name: "",
      phone: "",
      date: ""
    },
    depositRequired: false,
    depositAmount: "",
    refundPolicy: "",
    lateArrivalPolicy: "",
    reschedulePolicy: "",
    additionalNotes: [""]
  })

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const policy = await getAppointmentPolicy()
        if (policy) {
          setFormData(policy)
        }
      } catch (error) {
        console.error("Error fetching appointment policy:", error)
        toast({
          title: "Error",
          description: "Failed to load appointment policy. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolicy()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1]
      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          [field]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await saveAppointmentPolicy(formData)
      toast({
        title: "Policy Saved",
        description: "The appointment policy has been successfully saved.",
      })
    } catch (error) {
      console.error("Error saving appointment policy:", error)
      toast({
        title: "Error",
        description: "Failed to save appointment policy. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Appointment Policy</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Your business contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactInfo.name">Name</Label>
                  <Input
                    id="contactInfo.name"
                    name="contactInfo.name"
                    value={formData.contactInfo.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactInfo.phone">Phone</Label>
                  <Input
                    id="contactInfo.phone"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deposit Policy</CardTitle>
              <CardDescription>Define your deposit requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="depositRequired"
                  checked={formData.depositRequired}
                  onCheckedChange={(checked) => handleSwitchChange("depositRequired", checked)}
                />
                <Label htmlFor="depositRequired">Require deposit for bookings</Label>
              </div>

              {formData.depositRequired && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="depositAmount">Deposit Amount (£)</Label>
                    <Input
                      id="depositAmount"
                      name="depositAmount"
                      type="number"
                      value={formData.depositAmount}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refundPolicy">Deposit Policy</Label>
                    <Textarea
                      id="refundPolicy"
                      name="refundPolicy"
                      value={formData.refundPolicy}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Important information for clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.additionalNotes.map((note, index) => (
                <div key={index} className="space-y-2">
                  <Label>Note {index + 1}</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => {
                      const newNotes = [...formData.additionalNotes]
                      newNotes[index] = e.target.value
                      setFormData({ ...formData, additionalNotes: newNotes })
                    }}
                    rows={2}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Late Arrival Policy</CardTitle>
              <CardDescription>Define your policy for clients who arrive late</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lateArrivalPolicy">Late Arrival Policy</Label>
                <Textarea
                  id="lateArrivalPolicy"
                  name="lateArrivalPolicy"
                  value={formData.lateArrivalPolicy}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reschedule Policy</CardTitle>
              <CardDescription>Define your policy for rescheduling appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reschedulePolicy">Reschedule Policy</Label>
                <Textarea
                  id="reschedulePolicy"
                  name="reschedulePolicy"
                  value={formData.reschedulePolicy}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Policy"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
