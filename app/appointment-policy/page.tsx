"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function AppointmentPolicyPage() {
  const [policy, setPolicy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const supabase = createSupabaseClient()

        const { data, error } = await supabase.from("settings").select("*").eq("key", "appointment_policy").single()

        if (error) {
          throw error
        }

        setPolicy(data.value)
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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
        </div>
      </header>
      <main className="flex-1 py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Appointment Policy</h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Please review our appointment policies before booking
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading policy...</p>
            </div>
          ) : policy ? (
            <div className="mx-auto max-w-3xl py-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{policy.cancellationPolicy}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cancellations must be made at least {policy.cancellationTimeFrame} hours before your appointment.
                    Late cancellations may incur a fee of {policy.cancellationFee}% of the service price.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>No-Show Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{policy.noShowPolicy}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No-shows may be charged {policy.noShowFee}% of the service price.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Late Arrival Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{policy.lateArrivalPolicy}</p>
                </CardContent>
              </Card>

              {policy.depositRequired && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deposit Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>A deposit of {policy.depositAmount}% of the service price is required to secure your booking.</p>
                    <p className="mt-2">{policy.refundPolicy}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Reschedule Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{policy.reschedulePolicy}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Rescheduling must be done at least {policy.rescheduleTimeFrame} hours before your appointment.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <p>No policy information available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
