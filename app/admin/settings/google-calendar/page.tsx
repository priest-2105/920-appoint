"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"

export default function GoogleCalendarSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    enabled: false,
    checkAvailability: false,
    addEvents: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const response = await fetch("/api/settings/google-calendar-status")
        const data = await response.json()

        if (data.settings) {
          setSettings({
            enabled: data.settings.enabled || false,
            checkAvailability: data.settings.checkAvailability || false,
            addEvents: data.settings.addEvents || false,
          })
        }
      } catch (error) {
        console.error("Error checking Google Calendar settings:", error)
        toast({
          title: "Error",
          description: "Failed to load Google Calendar settings.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkSettings()
  }, [toast])

  const handleSettingChange = async (setting: string, value: boolean) => {
    try {
      const newSettings = {
        ...settings,
        [setting]: value,
      }

      setSettings(newSettings)

      const response = await fetch("/api/settings/google-calendar-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      toast({
        title: "Success",
        description: "Google Calendar settings updated successfully.",
      })
    } catch (error) {
      console.error("Error updating Google Calendar settings:", error)
      toast({
        title: "Error",
        description: "Failed to update Google Calendar settings.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Google Calendar Integration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Status</CardTitle>
          <CardDescription>
            Your Google Calendar is connected and ready to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Connected to Google Calendar</p>
              <p className="text-sm text-muted-foreground">
                Your Google Calendar is connected and ready to use
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Settings</CardTitle>
          <CardDescription>Configure how Google Calendar integration works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Google Calendar Integration</Label>
              <p className="text-sm text-muted-foreground">Turn on or off all Google Calendar features</p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => handleSettingChange("enabled", checked)}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="checkAvailability">Check Availability</Label>
                  <p className="text-sm text-muted-foreground">
                    Check your Google Calendar for conflicts when customers book appointments
                  </p>
                </div>
                <Switch
                  id="checkAvailability"
                  checked={settings.checkAvailability}
                  onCheckedChange={(checked) => handleSettingChange("checkAvailability", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="addEvents">Add Appointments to Calendar</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically add new appointments to your Google Calendar
                  </p>
                </div>
                <Switch
                  id="addEvents"
                  checked={settings.addEvents}
                  onCheckedChange={(checked) => handleSettingChange("addEvents", checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
