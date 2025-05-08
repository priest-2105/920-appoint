"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function GoogleCalendarSettingsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [settings, setSettings] = useState({
    enabled: true,
    checkAvailability: true,
    addEvents: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          toast({
            title: "Authentication Error",
            description: "Please log in to access this page.",
            variant: "destructive",
          })
          return
        }

        // Get current settings
        const response = await fetch("/api/settings/google-calendar-settings")
        if (!response.ok) {
          throw new Error("Failed to fetch settings")
        }
        const data = await response.json()
        // If no settings exist, use our default enabled settings
        setSettings(data || {
          enabled: true,
          checkAvailability: true,
          addEvents: true,
        })
        setIsConnected(true)
      } catch (error) {
        console.error("Error checking connection:", error)
        toast({
          title: "Error",
          description: "Failed to check Google Calendar connection status.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [toast, supabase])

  const handleSettingChange = async (key: keyof typeof settings, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value }
      console.log("Updating settings to:", newSettings)

      const response = await fetch("/api/settings/google-calendar-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Failed to update settings:", error)
        throw new Error("Failed to update settings")
      }

      setSettings(newSettings)
      toast({
        title: "Settings Updated",
        description: "Google Calendar settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating Google Calendar settings:", error)
      toast({
        title: "Error",
        description: "Failed to update Google Calendar settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Google Calendar Settings</h2>
        <p className="text-muted-foreground">
          Configure how your Google Calendar integrates with the booking system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>
            Control how Google Calendar is used in your booking system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Google Calendar Integration</Label>
              <p className="text-sm text-muted-foreground">
                Turn on Google Calendar integration for your booking system.
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => handleSettingChange("enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Check Availability</Label>
              <p className="text-sm text-muted-foreground">
                Check Google Calendar for existing events when showing available times.
              </p>
            </div>
            <Switch
              checked={settings.checkAvailability}
              onCheckedChange={(checked) => handleSettingChange("checkAvailability", checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Add Events to Calendar</Label>
              <p className="text-sm text-muted-foreground">
                Automatically add new bookings to your Google Calendar.
              </p>
            </div>
            <Switch
              checked={settings.addEvents}
              onCheckedChange={(checked) => handleSettingChange("addEvents", checked)}
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
