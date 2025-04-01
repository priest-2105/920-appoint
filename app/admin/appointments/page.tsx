import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminAppointmentsList } from "@/components/admin-appointments-list"
import { AdminAppointmentsCalendar } from "@/components/admin-appointments-calendar"

export default function AdminAppointmentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Appointments</h1>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>View and manage all your upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAppointmentsList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>View your appointments in a calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAppointmentsCalendar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

