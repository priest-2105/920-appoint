"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar, MoreHorizontal, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { updateAppointmentStatus } from "@/app/actions/appointments"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { AppointmentDetailsModal } from "@/components/appointment-details-modal"

interface AdminAppointmentsListProps {
  appointments: any[]
  limit?: number
}

export function AdminAppointmentsList({ appointments, limit }: AdminAppointmentsListProps) {
  const [displayAppointments, setDisplayAppointments] = useState(limit ? appointments.slice(0, limit) : appointments)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus)

      // Update the local state
      setDisplayAppointments(
        displayAppointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: newStatus } : appointment,
        ),
      )

      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Details</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayAppointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No appointments found
              </TableCell>
            </TableRow>
          ) : (
            displayAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {appointment.customers?.first_name} {appointment.customers?.last_name}
                        {appointment.is_guest_booking && (
                          <Badge variant="secondary" className="ml-2 text-xs">Guest</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.customers?.email}
                        {appointment.customers?.phone && ` • ${appointment.customers.phone}`}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{appointment.hairstyles?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {appointment.hairstyles?.duration} mins • ${appointment.hairstyles?.price}
                    </div>
                    {appointment.hairstyles?.materials && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Materials: {appointment.hairstyles.materials}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {new Date(appointment.appointment_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(appointment.appointment_date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    appointment.status === 'confirmed' ? 'default' :
                    appointment.status === 'pending' ? 'secondary' :
                    appointment.status === 'cancelled' ? 'destructive' :
                    'outline'
                  }>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {appointment.payment_status ? (
                        <Badge variant={
                          appointment.payment_status === 'completed' ? 'default' :
                          appointment.payment_status === 'pending' ? 'secondary' :
                          appointment.payment_status === 'refunded' ? 'destructive' :
                          'outline'
                        }>
                          {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No payment</span>
                      )}
                    </div>
                    {appointment.payment_amount && (
                      <div className="text-xs text-muted-foreground">
                        ${appointment.payment_amount}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {appointment.notes ? (
                    <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {appointment.notes}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No notes</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedAppointmentId(appointment.id)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Send reminder</DropdownMenuItem>
                      {appointment.is_guest_booking && (
                        <DropdownMenuItem>Convert to account</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "confirmed")}>
                        Mark as confirmed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "completed")}>
                        Mark as completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, "cancelled")}>
                        Cancel appointment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Delete appointment</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <AppointmentDetailsModal 
        appointmentId={selectedAppointmentId} 
        onClose={() => {
          console.log('Closing modal, current appointment ID:', selectedAppointmentId)
          setSelectedAppointmentId(null)
          document.body.style.overflow = 'auto'
        }} 
      />
    </>
  )
}
