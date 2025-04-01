"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("id")
  const [appointment, setAppointment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        setIsLoading(false)
        return
      }

      try {
        // In a real app, this would fetch the appointment details from the server
        // For demo purposes, we'll create a mock appointment
        const mockAppointment = {
          id: appointmentId,
          status: "confirmed",
          appointment_date: new Date().toISOString(),
          customer: {
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
          },
          hairstyle: {
            name: "Modern Fade",
            price: 35,
            duration: 45,
          },
        }

        setAppointment(mockAppointment)
      } catch (error) {
        console.error("Error fetching appointment:", error)
        toast({
          title: "Error",
          description: "Failed to load appointment details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointment()
  }, [appointmentId, toast])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="container z-40 bg-background">
          <div className="flex h-20 items-center justify-between py-6">
            <MainNav />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Appointment Not Found</CardTitle>
              <CardDescription>We couldn't find the appointment you're looking for.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

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
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Booking Confirmed!</h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Your appointment has been successfully booked.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-md py-8">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
                <CardDescription className="text-center">
                  Your booking reference is: #{appointment.id.substring(0, 8).toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Appointment Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Appointment Time</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.appointment_date), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">123 Hair Street, London, UK</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="font-medium">Appointment Details</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Service:</span>
                      <span className="text-sm font-medium">{appointment.hairstyle.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Duration:</span>
                      <span className="text-sm font-medium">{appointment.hairstyle.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Price:</span>
                      <span className="text-sm font-medium">£{appointment.hairstyle.price}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    A confirmation email has been sent to {appointment.customer.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Need to make changes? Contact us at{" "}
                    <a href="mailto:info@stylesync.com" className="underline">
                      info@stylesync.com
                    </a>
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href="/">
                    <Button className="w-full">Return to Home</Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    Add to Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

