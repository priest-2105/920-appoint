"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { getAvailableTimeSlots } from "@/app/actions/appointments"
import { format, addDays } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface BookingCalendarProps {
  onDateSelect: (date: Date) => void
  hairstyleId?: string
}

export function BookingCalendar({ onDateSelect, hairstyleId }: BookingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (date && hairstyleId) {
      fetchAvailableSlots()
    } else {
      setAvailableTimeSlots([])
    }

    async function fetchAvailableSlots() {
      setIsLoading(true)
      try {
        const slots = await getAvailableTimeSlots(date.toISOString())
        setAvailableTimeSlots(slots)
      } catch (error) {
        console.error("Error fetching available slots:", error)
        toast({
          title: "Error",
          description: "Failed to load available time slots. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }, [date, hairstyleId, toast])

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    setSelectedTime(null)
  }

  const handleTimeSelect = (slot: any) => {
    setSelectedTime(slot.start)
    onDateSelect(new Date(slot.start))
  }

  // Disable past dates and weekends
  const disabledDays = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Disable past dates
    if (date < today) return true

    // Disable dates more than 2 months in the future
    const twoMonthsFromNow = addDays(today, 60)
    if (date > twoMonthsFromNow) return true

    // Disable weekends (0 is Sunday, 6 is Saturday)
    const day = date.getDay()
    return day === 0 || day === 6
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={disabledDays}
          className="rounded-md border"
        />
      </div>
      <div>
        <h3 className="mb-4 font-medium">Available Time Slots</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading available slots...</p>
        ) : date ? (
          availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableTimeSlots.map((slot) => (
                <Card
                  key={slot.start}
                  className={`cursor-pointer transition-colors ${selectedTime === slot.start ? "border-primary bg-primary/10" : ""}`}
                  onClick={() => handleTimeSelect(slot)}
                >
                  <CardContent className="flex items-center justify-center p-3">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{format(new Date(slot.start), "h:mm a")}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No available slots for this date. Please select another date.</p>
          )
        ) : (
          <p className="text-muted-foreground">Please select a date first</p>
        )}
      </div>
    </div>
  )
}

