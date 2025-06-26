"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { AdminAppointmentsList } from "@/components/admin-appointments-list"
import { AdminAppointmentsCalendar } from "@/components/admin-appointments-calendar"
import { useToast } from "@/hooks/use-toast"

interface AdminAppointmentsWrapperProps {
  view: "list" | "calendar"
}

interface Appointment {
  id: string
  customer_id: string
  hairstyle_id: string
  appointment_date: string
  status: string
  payment_id: string
  payment_status: string
  payment_amount: string
  google_calendar_event_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  is_guest_booking: boolean
}

export function AdminAppointmentsWrapper({ view }: AdminAppointmentsWrapperProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true)
        const supabase = createSupabaseClient()
        
        // First check if we can access the table at all
        const { data: testData, error: testError } = await supabase
          .from("appointments")
          .select("id")
          .limit(1)

        console.log('Test query response:', { testData, testError })

        if (testError) {
          console.error('Table access error:', testError)
          if (testError.code === 'PGRST301') {
            toast({
              title: "Access Denied",
              description: "You don't have permission to view appointments. Please check your RLS policies.",
              variant: "destructive",
            })
          }
          throw testError
        }

        // Try to get the user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Current session:', session)

        console.log('Starting to fetch appointments...')
        const { data, error } = await supabase
          .from("appointments")
          .select(`
            *,
            customers (id, first_name, last_name, email, phone),
            hairstyles (id, name, price, duration, category, image_urls)
          `)
          .order("appointment_date", { ascending: true })

        console.log('Raw response:', { data, error })

        if (error) {
          console.error('Supabase error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw error
        }

        if (!data) {
          console.log('No data returned from Supabase')
          setAppointments([])
          return
        }

        console.log('Successfully fetched appointments:', data)
        setAppointments(data)
      } catch (err) {
        console.error("Failed to load appointments:", err)
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [toast])

  if (loading) {
    return <div className="py-8 text-center">Loading appointments...</div>
  }

  console.log('Current appointments state:', appointments)

  if (view === "list") {
    return <AdminAppointmentsList appointments={appointments} />
  }
  
  return <AdminAppointmentsCalendar appointments={appointments} />
}
