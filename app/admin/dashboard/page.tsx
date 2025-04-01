import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, DollarSign, Users } from "lucide-react"
import { AdminAppointmentsList } from "@/components/admin-appointments-list"
import { AdminRevenueChart } from "@/components/admin-revenue-chart"
import { getAppointments } from "@/app/actions/appointments"
import { getCustomers } from "@/app/actions/customers"

export default async function AdminDashboardPage() {
  const appointments = await getAppointments()
  const customers = await getCustomers()

  // Calculate total revenue
  const totalRevenue = appointments.reduce((total, appointment) => {
    return total + (appointment.payment_amount || 0)
  }, 0)

  // Calculate total bookings
  const totalBookings = appointments.length

  // Calculate average appointment duration
  const totalDuration = appointments.reduce((total, appointment) => {
    return total + (appointment.hairstyles?.duration || 0)
  }, 0)

  const avgDuration = totalBookings > 0 ? Math.round(totalDuration / totalBookings) : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {totalBookings} bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {appointments.filter((a) => a.status === "confirmed").length} confirmed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                customers.filter((c) => appointments.some((a) => a.customer_id === c.id && a.status !== "cancelled"))
                  .length
              }{" "}
              with bookings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Appointment Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration}m</div>
            <p className="text-xs text-muted-foreground">Per appointment</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminRevenueChart appointments={appointments} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  You have{" "}
                  {
                    appointments.filter(
                      (a) => new Date(a.appointment_date).toDateString() === new Date().toDateString(),
                    ).length
                  }{" "}
                  appointments today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAppointmentsList appointments={appointments} limit={5} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>View and manage all your upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAppointmentsList appointments={appointments} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed analytics about your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Analytics dashboard coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

