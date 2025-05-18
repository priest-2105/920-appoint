"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface AppointmentPolicy {
  contactInfo: {
    name: string
    phone: string
    date: string
  }
  depositRequired: boolean
  depositAmount: string
  refundPolicy: string
  lateArrivalPolicy: string
  reschedulePolicy: string
  additionalNotes: string[]
}

export default function AppointmentPolicyPage() {
  const [policy, setPolicy] = useState<AppointmentPolicy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const supabase = createSupabaseClient()

        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "appointment_policy")
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setPolicy(data.value as AppointmentPolicy)
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
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{policy.contactInfo.name}</p>
                  <p>{policy.contactInfo.phone}</p>
                  <p>{policy.contactInfo.date}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deposit Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">£{policy.depositAmount} Non-Refundable Deposit Required</p>
                  <p className="mt-2">{policy.refundPolicy}</p>
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

              <Card>
                <CardHeader>
                  <CardTitle>Reschedule Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{policy.reschedulePolicy}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-2">
                    {policy.additionalNotes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
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
