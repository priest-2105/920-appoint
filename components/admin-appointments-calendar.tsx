"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

// This would be fetched from Supabase in a real implementation
const appointments = [
  {
    id: "APP123",
    customer: "John Smith",
    hairstyle: "Modern Fade",
    date: new Date(2025, 3, 1, 10, 0),
    status: "confirmed",
  },
  {
    id: "APP124",
    customer: "Sarah Johnson",
    hairstyle: "Classic Bob",
    date: new Date(2025, 3, 1, 13, 0),
    status: "confirmed",
  },
  {
    id: "APP125",
    customer: "Michael Brown",
    hairstyle: "Textured Pixie",
    date: new Date(2025, 3, 2, 11, 0),
    status: "pending",
  },
  {
    id: "APP126",
    customer: "Emma Wilson",
    hairstyle: "Long Layers",
    date: new Date(2025, 3, 2, 15, 0),
    status: "confirmed",
  },
  {
    id: "APP127",
    customer: "David Lee",
    hairstyle: "Blunt Cut",
    date: new Date(2025, 3, 3, 9, 0),
    status: "cancelled",
  },
  {
    id: "APP128",
    customer: "Jessica Taylor",
    hairstyle: "Curly Shag",
    date: new Date(2025, 3, 3, 14, 0),
    status: "confirmed",
  },
]

export function AdminAppointmentsCalendar() {
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
      default:
        return "bg-gray-500"
    }
  }

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(
      (appointment) =>
        appointment.date.getDate() === date.getDate() &&
        appointment.date.getMonth() === date.getMonth() &&
        appointment.date.getFullYear() === date.getFullYear(),
    )
  }

  const businessHours = Array.from({ length: 9 }, (_, i) => i + 9) // 9am to 5pm

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
                (appointment) => appointment.date.getHours() === hour,
              )

              return (
                <div key={hour} className="h-20 border rounded-md p-1 relative">
                  {dayAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className={`absolute inset-1 overflow-hidden cursor-pointer ${getStatusColor(appointment.status)}`}
                    >
                      <CardContent className="p-2 text-white">
                        <div className="font-medium text-xs">{format(appointment.date, "h:mm a")}</div>
                        <div className="font-medium text-xs truncate">{appointment.customer}</div>
                        <div className="text-xs truncate">{appointment.hairstyle}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
