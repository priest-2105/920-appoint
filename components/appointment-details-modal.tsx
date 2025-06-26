"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, CreditCard, User, Scissors, FileText, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

interface AppointmentDetailsModalProps {
  appointmentId: string | null
  onClose: () => void
}

export function AppointmentDetailsModal({ appointmentId, onClose }: AppointmentDetailsModalProps) {
  const { toast } = useToast()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAppointment() {
      if (!appointmentId) return

      try {
        setLoading(true)
        const supabase = createSupabaseClient()
        
        console.log('Fetching appointment with ID:', appointmentId)
        
        // First get the appointment
        const { data: appointmentData, error: appointmentError } = await supabase
          .from("appointments")
          .select("*")
          .eq("id", appointmentId)
          .single()

        console.log('Appointment query result:', { appointmentData, appointmentError })

        if (appointmentError) throw appointmentError

        console.log('Found appointment:', appointmentData)
        console.log('Customer ID from appointment:', appointmentData.customer_id)

        // Check current user's auth status and admin privileges
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        console.log('Current authenticated user:', currentUser)
        console.log('User auth error:', userError)

        if (currentUser) {
          // Check if current user is admin
          const { data: adminCheck, error: adminError } = await supabase
            .from("customers")
            .select("is_admin")
            .eq("id", currentUser.id)
            .single()

          console.log('Admin check for current user:', {
            userId: currentUser.id,
            isAdmin: adminCheck?.is_admin,
            error: adminError
          })
        }

        // Then get the customer using the customer_id from the appointment
        console.log('Attempting to fetch customer with ID:', appointmentData.customer_id)
        
        // First, let's check if this customer_id exists in the customers table
        const { data: customerCheck, error: customerCheckError } = await supabase
          .from("customers")
          .select("id")
          .eq("id", appointmentData.customer_id)
          .maybeSingle()

        console.log('Customer existence check:', {
          customerId: appointmentData.customer_id,
          exists: !!customerCheck,
          error: customerCheckError
        })

        if (!customerCheck) {
          console.error('Customer ID does not exist in customers table:', appointmentData.customer_id)
          // Try to find customer by email if this is a guest booking
          if (appointmentData.is_guest_booking) {
            console.log('This is a guest booking, customer might not be in customers table')
          }
        }
        
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("id, first_name, last_name, email, phone, is_admin")
          .eq("id", appointmentData.customer_id)
          .maybeSingle()

        console.log('Raw customer query response:', {
          data: customerData,
          error: customerError,
          query: `SELECT id, first_name, last_name, email, phone, is_admin FROM customers WHERE id = '${appointmentData.customer_id}'`
        })

        // Also get the hairstyle using the hairstyle_id from the appointment
        console.log('Attempting to fetch hairstyle with ID:', appointmentData.hairstyle_id)
        
        const { data: hairstyleData, error: hairstyleError } = await supabase
          .from("hairstyles")
          .select("id, name, description, price, duration, category, materials")
          .eq("id", appointmentData.hairstyle_id)
          .maybeSingle()

        console.log('Raw hairstyle query response:', {
          data: hairstyleData,
          error: hairstyleError,
          query: `SELECT id, name, description, price, duration, category, materials FROM hairstyles WHERE id = '${appointmentData.hairstyle_id}'`
        })

        if (customerError) {
          console.error('Error fetching customer:', customerError)
          // Continue with appointment data even if customer fetch fails
          setAppointment({
            ...appointmentData,
            customers: null,
            hairstyles: hairstyleError ? null : hairstyleData
          })
        } else {
          console.log('Successfully fetched customer:', customerData)
          // Combine the data
          setAppointment({
            ...appointmentData,
            customers: customerData,
            hairstyles: hairstyleError ? null : hairstyleData
          })
        }
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
  }, [appointmentId, toast])

  return (
    <Dialog 
      open={!!appointmentId} 
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Appointment Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center">Loading appointment details...</div>
        ) : !appointment ? (
          <div className="p-8 text-center">Appointment not found</div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  )
} 