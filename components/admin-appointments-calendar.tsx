"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AdminAppointmentsCalendarProps {
  appointments?: any[]
}

export function AdminAppointmentsCalendar({ appointments = [] }: AdminAppointmentsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(currentDate, { weekStartsOn: 1 }))

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const prevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

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

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date)
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const businessHours = Array.from({ length: 9 }, (_, i) => i + 9) // 9am to 5pm

  const getAppointmentPosition = (appointmentDate: Date) => {
    const hour = appointmentDate.getHours()
    const minutes = appointmentDate.getMinutes()
    const position = ((hour - 9) * 60 + minutes) / 60 // Convert to hours from 9am
    return position * 5 // 5rem per hour
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          {format(currentWeek, "MMMM d, yyyy")} - {format(addDays(currentWeek, 6), "MMMM d, yyyy")}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {/* Time column */}
        <div className="space-y-2">
          <div className="h-10"></div> {/* Empty cell for header alignment */}
          {businessHours.map((hour) => (
            <div key={hour} className="h-20 flex items-center justify-end pr-2 text-sm text-muted-foreground">
              {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? "PM" : "AM"}
            </div>
          ))}
        </div>

        {/* Days columns */}
        {weekDays.map((day) => (
          <div key={day.toString()} className="space-y-2">
            <div className="text-center h-10 flex flex-col justify-center">
              <div className="font-medium">{format(day, "EEE")}</div>
              <div className="text-sm text-muted-foreground">{format(day, "d")}</div>
            </div>

            {businessHours.map((hour) => {
              const dayAppointments = getAppointmentsForDay(day).filter(
                (appointment) => {
                  const appointmentDate = new Date(appointment.appointment_date)
                  return appointmentDate.getHours() === hour
                }
              )

              return (
                <div key={hour} className="h-20 border rounded-md p-1 relative">
                  {dayAppointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.appointment_date)
                    const position = getAppointmentPosition(appointmentDate)
                    
                    return (
                      <Card
                        key={appointment.id}
                        className={`absolute inset-x-1 overflow-hidden cursor-pointer ${getStatusColor(appointment.status)}`}
                        style={{ top: `${position}rem`, height: '4rem' }}
                      >
                        <CardContent className="p-2 text-white">
                          <div className="font-medium text-xs">{format(appointmentDate, "h:mm a")}</div>
                          <div className="font-medium text-xs truncate">
                            {appointment.customers?.first_name} {appointment.customers?.last_name}
                          </div>
                          <div className="text-xs truncate">{appointment.hairstyles?.name}</div>
                          <div className="text-xs truncate">${appointment.payment_amount}</div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
