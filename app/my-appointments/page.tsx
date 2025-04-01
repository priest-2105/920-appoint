"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Scissors } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          router.push("/login?redirect=/my-appointments")
          return
        }

        setUser(data.user)
        fetchAppointments(data.user.id)
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/login?redirect=/my-appointments")
      }
    }

    const fetchAppointments = async (userId: string) => {
      try {
        const supabase = createSupabaseClient()

        const { data, error } = await supabase
          .from("appointments")
          .select(`
            *,
            hairstyles (id, name, price, duration, category, image_url)
          `)
          .eq("customer_id", userId)
          .order("appointment_date", { ascending: false })

        if (error) {
          throw error
        }

        setAppointments(data || [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast({
          title: "Error",
          description: "Failed to load your appointments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", appointmentId)
        .eq("customer_id", user.id)

      if (error) {
        throw error
      }

      // Update the local state
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status: "cancelled" } : appointment,
        ),
      )

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      })
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to cancel your appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
          <nav className="flex items-center gap-2">
            <Link href="/book">
              <Button size="sm">Book New Appointment</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">My Appointments</h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                View and manage your upcoming and past appointments
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-5xl py-8">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-6 space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading your appointments...</p>
                  </div>
                ) : (
                  <>
                    {appointments.filter(
                      (appointment) =>
                        new Date(appointment.appointment_date) > new Date() && appointment.status !== "cancelled",
                    ).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">You don't have any upcoming appointments</p>
                        <Button asChild>
                          <Link href="/book">Book an Appointment</Link>
                        </Button>
                      </div>
                    ) : (
                      appointments
                        .filter(
                          (appointment) =>
                            new Date(appointment.appointment_date) > new Date() && appointment.status !== "cancelled",
                        )
                        .map((appointment) => (
                          <Card key={appointment.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-center">
                                <CardTitle>{appointment.hairstyles.name}</CardTitle>
                                <Badge variant="outline" className={`${getStatusColor(appointment.status)} text-white`}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Badge>
                              </div>
                              <CardDescription>
                                Appointment #{appointment.id.substring(0, 8).toUpperCase()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">Date</p>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">Time</p>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(appointment.appointment_date), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Scissors className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">Service Details</p>
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.hairstyles.duration} minutes • £{appointment.hairstyles.price}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  {appointment.status !== "cancelled" && (
                                    <Button variant="destructive" onClick={() => cancelAppointment(appointment.id)}>
                                      Cancel Appointment
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </>
                )}
              </TabsContent>
              <TabsContent value="past" className="mt-6 space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading your appointments...</p>
                  </div>
                ) : (
                  <>
                    {appointments.filter(
                      (appointment) =>
                        new Date(appointment.appointment_date) <= new Date() || appointment.status === "cancelled",
                    ).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">You don't have any past appointments</p>
                      </div>
                    ) : (
                      appointments
                        .filter(
                          (appointment) =>
                            new Date(appointment.appointment_date) <= new Date() || appointment.status === "cancelled",
                        )
                        .map((appointment) => (
                          <Card key={appointment.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-center">
                                <CardTitle>{appointment.hairstyles.name}</CardTitle>
                                <Badge variant="outline" className={`${getStatusColor(appointment.status)} text-white`}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Badge>
                              </div>
                              <CardDescription>
                                Appointment #{appointment.id.substring(0, 8).toUpperCase()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">Date</p>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">Time</p>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(appointment.appointment_date), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Scissors className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">Service Details</p>
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.hairstyles.duration} minutes • £{appointment.hairstyles.price}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  {appointment.status === "completed" && (
                                    <Button variant="outline" asChild>
                                      <Link href={`/book?style=${appointment.hairstyles.id}`}>Book Again</Link>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

