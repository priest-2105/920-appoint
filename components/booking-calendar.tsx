"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { getAvailableTimeSlots } from "@/app/actions/availability"
import { format, parse, setHours, setMinutes, startOfDay } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { checkAvailability } from "@/lib/google-calendar"

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
    const fetchTimeSlots = async () => {
      if (!selectedDay || hairstyleDuration <= 0) {
        console.log("No day selected or invalid duration")
        return
      }

      setIsLoadingTimes(true)
      setSelectedTime(null)
      const dateString = format(selectedDay, "yyyy-MM-dd")
      
      console.log("Fetching time slots for:", dateString, "Duration:", hairstyleDuration)
      
      try {
        // Get base available time slots
        const slots = await getAvailableTimeSlots(dateString, hairstyleDuration)
        console.log("Received base time slots:", slots)

        if (!slots || slots.length === 0) {
          console.log("No base time slots available")
          setAvailableTimes([])
          return
        }

        // Check Google Calendar integration status
        const response = await fetch("/api/settings/google-calendar-status")
        const data = await response.json()
        console.log("Google Calendar status:", data)
        
        if (data.connected && data.settings?.enabled && data.settings?.checkAvailability) {
          console.log("Google Calendar integration is enabled, checking availability...")
          
          // Check each slot against Google Calendar
          const availableSlots = await Promise.all(
            slots.map(async (time) => {
              const [hours, minutes] = time.split(":").map(Number)
              
              // Create a new date object for the selected day
              const slotDate = new Date(selectedDay)
              slotDate.setHours(hours, minutes, 0, 0)
              
              // Create end time
              const endDate = new Date(slotDate.getTime() + hairstyleDuration * 60000)
              
              console.log(`Checking availability for slot: ${time} (${slotDate.toISOString()} - ${endDate.toISOString()})`)
              
              try {
                const isAvailable = await checkAvailability(
                  slotDate.toISOString(),
                  endDate.toISOString()
                )
                console.log(`Slot ${time} availability:`, isAvailable)
                return isAvailable ? time : null
              } catch (error) {
                console.error(`Error checking availability for slot ${time}:`, error)
                return time // If there's an error, assume the slot is available
              }
            })
          )
          
          // Filter out null values (unavailable slots)
          const filteredSlots = availableSlots.filter((slot): slot is string => slot !== null)
          console.log("Final available slots after Google Calendar check:", filteredSlots)
          setAvailableTimes(filteredSlots)
        } else {
          console.log("Google Calendar integration not enabled or not checking availability, using all slots")
          setAvailableTimes(slots)
        }
      } catch (error) {
        console.error("Error fetching time slots:", error)
        toast({
          title: "Error",
          description: "Could not load available times for this day. Please try another date.",
          variant: "destructive"
        })
        setAvailableTimes([])
      } finally {
        setIsLoadingTimes(false)
      }
    }

    fetchTimeSlots()
  }, [selectedDay, hairstyleDuration, toast])

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDay) {
      const [hours, minutes] = time.split(":").map(Number)
      const dateTime = new Date(selectedDay)
      dateTime.setHours(hours, minutes, 0, 0)
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
          disabled={(date) => date < startOfDay(new Date())}
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
