"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { createServerSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AppointmentPolicyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    cancellationPolicy: "",
    cancellationTimeFrame: "24", // hours
    cancellationFee: "50", // percentage
    noShowPolicy: "",
    noShowFee: "100", // percentage
    lateArrivalPolicy: "",
    depositRequired: false,
    depositAmount: "20", // percentage
    refundPolicy: "",
    reschedulePolicy: "",
    rescheduleTimeFrame: "24", // hours
  })

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("settings").select("*").eq("key", "appointment_policy").single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "No rows returned"
          throw error
        }

        if (data) {
          setFormData(data.value)
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
    setFormData({
      ...formData,
      [name]: value,
    })
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
      const supabase = createServerSupabaseClient()

      const { data: existingPolicy } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "appointment_policy")
        .single()

      if (existingPolicy) {
        // Update existing policy
        await supabase
          .from("settings")
          .update({ value: formData, updated_at: new Date().toISOString() })
          .eq("key", "appointment_policy")
      } else {
        // Create new policy
        await supabase.from("settings").insert([{ key: "appointment_policy", value: formData }])
      }

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
              <CardTitle>Cancellation Policy</CardTitle>
              <CardDescription>Define your policy for appointment cancellations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={handleChange}
                  rows={4}
                  placeholder="E.g., Customers must cancel at least 24 hours before their appointment to avoid a cancellation fee."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cancellationTimeFrame">Cancellation Time Frame (hours)</Label>
                  <Input
                    id="cancellationTimeFrame"
                    name="cancellationTimeFrame"
                    type="number"
                    value={formData.cancellationTimeFrame}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancellationFee">Cancellation Fee (% of service price)</Label>
                  <Input
                    id="cancellationFee"
                    name="cancellationFee"
                    type="number"
                    value={formData.cancellationFee}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>No-Show Policy</CardTitle>
              <CardDescription>Define your policy for clients who don't show up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noShowPolicy">No-Show Policy</Label>
                <Textarea
                  id="noShowPolicy"
                  name="noShowPolicy"
                  value={formData.noShowPolicy}
                  onChange={handleChange}
                  rows={4}
                  placeholder="E.g., Clients who fail to show up for their appointment will be charged the full service price."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noShowFee">No-Show Fee (% of service price)</Label>
                <Input
                  id="noShowFee"
                  name="noShowFee"
                  type="number"
                  value={formData.noShowFee}
                  onChange={handleChange}
                />
              </div>
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
                  placeholder="E.g., If you arrive more than 15 minutes late, we may need to reschedule your appointment."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deposit & Refund Policy</CardTitle>
              <CardDescription>Define your deposit and refund policies</CardDescription>
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
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit Amount (% of service price)</Label>
                  <Input
                    id="depositAmount"
                    name="depositAmount"
                    type="number"
                    value={formData.depositAmount}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="refundPolicy">Refund Policy</Label>
                <Textarea
                  id="refundPolicy"
                  name="refundPolicy"
                  value={formData.refundPolicy}
                  onChange={handleChange}
                  rows={4}
                  placeholder="E.g., Deposits are non-refundable but may be applied to a rescheduled appointment."
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
                  placeholder="E.g., Appointments can be rescheduled up to 24 hours before the scheduled time."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rescheduleTimeFrame">Reschedule Time Frame (hours)</Label>
                <Input
                  id="rescheduleTimeFrame"
                  name="rescheduleTimeFrame"
                  type="number"
                  value={formData.rescheduleTimeFrame}
                  onChange={handleChange}
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
