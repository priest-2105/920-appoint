"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  customer_id: string
  service_id: string
  date: string
  time: string
  status: string
  created_at: string
  customer: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  service: {
    name: string
    duration: number
    price: number
  }
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseClient()
        
        // Fetch appointments with customer and service details
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            *,
            customer:customers(first_name, last_name, email, phone),
            service:services(name, duration, price)
          `)
          .order('date', { ascending: true })

        if (appointmentsError) throw appointmentsError

        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })

        if (customersError) throw customersError

        setAppointments(appointmentsData || [])
        setCustomers(customersData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => router.push("/")}>View Site</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => apt.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => apt.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {appointment.customer.first_name} {appointment.customer.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service.name} - {new Date(appointment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
