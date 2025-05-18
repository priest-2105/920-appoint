"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Clock, CreditCard, User, Scissors, FileText } from "lucide-react"

interface Appointment {
  id: string
  customer_id: string
  hairstyle_id: string
  appointment_date: string
  status: string
  payment_id: string | null
  payment_status: string | null
  payment_amount: number | null
  google_calendar_event_id: string | null
  notes: string | null
  is_guest_booking: boolean
  created_at: string
  updated_at: string
  customers?: {
    first_name: string
    last_name: string
    email: string
    phone: string | null
  } | null
  hairstyles?: {
    name: string
    description: string | null
    price: number
    duration: number
    category: string
    materials: string | null
  } | null
}

export default function AppointmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const supabase = createSupabaseClient()
        const { data, error } = await supabase
          .from("appointments")
          .select(`
            *,
            customers!inner (
              first_name,
              last_name,
              email,
              phone
            ),
            hairstyles!inner (
              name,
              description,
              price,
              duration,
              category,
              materials
            )
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error
        setAppointment(data)
      } catch (error) {
        console.error("Error fetching appointment:", error)
        toast({
          title: "Error",
          description: "Failed to load appointment details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [params.id, toast])

  if (loading) {
    return <div className="p-8 text-center">Loading appointment details...</div>
  }

  if (!appointment) {
    return <div className="p-8 text-center">Appointment not found</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Appointment Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                {appointment.customers ? (
                  <>
                    <div className="font-medium">
                      {appointment.customers.first_name} {appointment.customers.last_name}
                      {appointment.is_guest_booking && (
                        <Badge variant="secondary" className="ml-2">Guest</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.customers.email}
                      {appointment.customers.phone && ` • ${appointment.customers.phone}`}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">Customer information not available</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <div>
                {appointment.hairstyles ? (
                  <>
                    <div className="font-medium">{appointment.hairstyles.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.hairstyles.duration} mins • ${appointment.hairstyles.price}
                    </div>
                    {appointment.hairstyles.materials && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Materials: {appointment.hairstyles.materials}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground">Service information not available</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(appointment.appointment_date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            <div>
              <Badge variant={
                appointment.status === 'confirmed' ? 'default' :
                appointment.status === 'pending' ? 'secondary' :
                appointment.status === 'cancelled' ? 'destructive' :
                'outline'
              }>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                {appointment.payment_status ? (
                  <>
                    <Badge variant={
                      appointment.payment_status === 'completed' ? 'default' :
                      appointment.payment_status === 'pending' ? 'secondary' :
                      appointment.payment_status === 'refunded' ? 'destructive' :
                      'outline'
                    }>
                      {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                    </Badge>
                    {appointment.payment_amount && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Amount: ${appointment.payment_amount}
                      </div>
                    )}
                    {appointment.payment_id && (
                      <div className="text-sm text-muted-foreground">
                        Payment ID: {appointment.payment_id}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">No payment information</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {appointment.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="text-sm">{appointment.notes}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 