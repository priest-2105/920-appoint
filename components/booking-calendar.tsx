"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { getAvailableTimeSlots } from "@/app/actions/availability"
import { format, parse, setHours, setMinutes, startOfDay, isValid } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { checkAvailability } from "@/lib/google-calendar"

interface BookingCalendarProps {
  hairstyleId: string
  onDateTimeSelect: (date: Date) => void
  initialSelectedDate?: Date | null
}

export function BookingCalendar({ hairstyleId, onDateTimeSelect, initialSelectedDate }: BookingCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(initialSelectedDate || new Date())
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [hairstyleDuration, setHairstyleDuration] = useState<number>(0)
  const { toast } = useToast()

  // Fetch hairstyle duration when hairstyleId changes
  useEffect(() => {
    const fetchHairstyleDuration = async () => {
      if (!hairstyleId) return
      
      try {
        const response = await fetch(`/api/hairstyles/${hairstyleId}`)
        if (!response.ok) throw new Error('Failed to fetch hairstyle')
        const data = await response.json()
        setHairstyleDuration(data.duration)
      } catch (error) {
        console.error('Error fetching hairstyle duration:', error)
        toast({
          title: "Error",
          description: "Could not load hairstyle details. Please try again.",
          variant: "destructive"
        })
      }
    }

    fetchHairstyleDuration()
  }, [hairstyleId, toast])

  // Helper function to create a valid date
  const createValidDate = (baseDate: Date, hours: number, minutes: number): Date | null => {
    try {
      const newDate = new Date(baseDate)
      newDate.setHours(hours, minutes, 0, 0)
      return isValid(newDate) ? newDate : null
    } catch (error) {
      console.error("Error creating date:", error)
      return null
    }
  }

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
        let googleCalendarEnabled = false
        try {
          const response = await fetch("/api/settings/google-calendar-status")
          if (response.ok) {
            const data = await response.json()
            console.log("Google Calendar status:", data)
            googleCalendarEnabled = data.connected && data.settings?.enabled && data.settings?.checkAvailability
          }
        } catch (error) {
          console.warn("Could not check Google Calendar status:", error)
          // Continue without Google Calendar integration
        }
        
        if (googleCalendarEnabled) {
          console.log("Google Calendar integration is enabled, checking availability...")
          
          // Check each slot against Google Calendar
          const availableSlots = await Promise.all(
            slots.map(async (time) => {
              try {
                const [hours, minutes] = time.split(":").map(Number)
                
                // Validate time components
                if (isNaN(hours) || isNaN(minutes)) {
                  console.error(`Invalid time format for slot: ${time}`)
                  return null
                }

                // Validate hairstyle duration
                if (typeof hairstyleDuration !== "number" || isNaN(hairstyleDuration)) {
                  console.error(`Invalid hairstyle duration: ${hairstyleDuration}`)
                  return null
                }

                // Create and validate start date
                const startDate = createValidDate(selectedDay, hours, minutes)
                if (!startDate) {
                  console.error(`Invalid start date for time slot: ${time}`)
                  return null
                }

                // Create and validate end date
                const endDate = new Date(startDate)
                const currentMinutes = endDate.getMinutes()
                const newMinutes = currentMinutes + hairstyleDuration
                
                // Log the date manipulation details
                console.log(`Time slot ${time} - Start: ${startDate.toISOString()}, Current minutes: ${currentMinutes}, Adding: ${hairstyleDuration}, New minutes: ${newMinutes}`)
                
                endDate.setMinutes(newMinutes)
                
                if (!isValid(endDate)) {
                  console.error(`Invalid end date for time slot: ${time}`, {
                    startDate: startDate.toISOString(),
                    duration: hairstyleDuration,
                    endDate: endDate.toISOString(),
                    hours,
                    minutes,
                    currentMinutes,
                    newMinutes
                  })
                  return null
                }

                console.log(`Checking availability for slot: ${time} (${startDate.toISOString()} - ${endDate.toISOString()})`)
                
                const isAvailable = await checkAvailability(
                  startDate.toISOString(),
                  endDate.toISOString()
                )
                console.log(`Slot ${time} availability:`, isAvailable)
                return isAvailable ? time : null
              } catch (error) {
                console.error(`Error checking availability for slot ${time}:`, error)
                return null // Return null for any errors to exclude the slot
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
      try {
        const [hours, minutes] = time.split(":").map(Number)
        const dateTime = createValidDate(selectedDay, hours, minutes)
        if (dateTime && isValid(dateTime)) {
          onDateTimeSelect(dateTime)
        } else {
          console.error("Invalid date created for time selection")
          toast({
            title: "Error",
            description: "Could not select this time slot. Please try another.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error handling time selection:", error)
        toast({
          title: "Error",
          description: "Could not select this time slot. Please try another.",
          variant: "destructive"
        })
      }
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
