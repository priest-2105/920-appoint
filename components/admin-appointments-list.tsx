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

interface AdminAppointmentsListProps {
  appointments: any[]
  limit?: number
}

export function AdminAppointmentsList({ appointments, limit }: AdminAppointmentsListProps) {
  const [displayAppointments, setDisplayAppointments] = useState(limit ? appointments.slice(0, limit) : appointments)
  const { toast } = useToast()

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Hairstyle</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayAppointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
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
                    </div>
                    <div className="text-xs text-muted-foreground">{appointment.customers?.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{appointment.hairstyles?.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{format(new Date(appointment.appointment_date), "MMM d, yyyy")}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(appointment.appointment_date), "h:mm a")}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getStatusColor(appointment.status)} text-white`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>£{appointment.payment_amount || appointment.hairstyles?.price}</TableCell>
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
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Send reminder</DropdownMenuItem>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

