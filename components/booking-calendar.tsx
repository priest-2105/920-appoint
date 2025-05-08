"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { getAvailableTimeSlots } from "@/app/actions/availability"
import { format, parse, setHours, setMinutes } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface BookingCalendarProps {
  hairstyleDuration: number
  onDateTimeSelect: (date: Date) => void
  initialSelectedDate?: Date | null
}

export function BookingCalendar({ hairstyleDuration, onDateTimeSelect, initialSelectedDate }: BookingCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(initialSelectedDate || new Date())
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (selectedDay && hairstyleDuration > 0) {
      setIsLoadingTimes(true)
      setSelectedTime(null)
      const dateString = format(selectedDay, "yyyy-MM-dd")
      getAvailableTimeSlots(dateString, hairstyleDuration)
        .then(slots => {
          setAvailableTimes(slots)
        })
        .catch(error => {
          console.error("Error fetching time slots:", error)
          toast({
            title: "Error",
            description: "Could not load available times for this day. Please try another date.",
            variant: "destructive"
          })
          setAvailableTimes([])
        })
        .finally(() => {
          setIsLoadingTimes(false)
        })
    }
  }, [selectedDay, hairstyleDuration, toast])

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDay) {
      const [hours, minutes] = time.split(":").map(Number)
      const dateTime = setMinutes(setHours(selectedDay, hours), minutes)
      onDateTimeSelect(dateTime)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div>
        <h3 className="text-lg font-medium mb-2">Select a Day</h3>
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={setSelectedDay}
          className="rounded-md border"
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <h3 className="text-lg font-medium mb-2">
          Available Times for {selectedDay ? format(selectedDay, "MMMM d, yyyy") : ""}
        </h3>
        {isLoadingTimes ? (
          <p>Loading times...</p>
        ) : availableTimes.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableTimes.map(time => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => handleTimeSelect(time)}
                className="w-full"
              >
                {time}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No available slots for this day or selection.
          </p>
        )}
      </div>
    </div>
  )
}
