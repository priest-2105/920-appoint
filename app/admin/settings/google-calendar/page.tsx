"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Check, X } from "lucide-react"

export default function GoogleCalendarSettingsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    enabled: false,
    checkAvailability: false,
    addEvents: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/settings/google-calendar-status")
        const data = await response.json()

        setIsConnected(data.connected)

        if (data.settings) {
          setSettings({
            enabled: data.settings.enabled || false,
            checkAvailability: data.settings.checkAvailability || false,
            addEvents: data.settings.addEvents || false,
          })
        }
      } catch (error) {
        console.error("Error checking Google Calendar connection:", error)
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
  }, [toast])

  const handleConnect = () => {
    window.location.href = "/api/auth/google"
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/settings/google-calendar-disconnect", {
        method: "POST",
      })

      if (response.ok) {
        setIsConnected(false)
        setSettings({
          enabled: false,
          checkAvailability: false,
          addEvents: false,
        })

        toast({
          title: "Success",
          description: "Google Calendar disconnected successfully.",
        })
      } else {
        throw new Error("Failed to disconnect")
      }
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar.",
        variant: "destructive",
      })
    }
  }

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
          <CardTitle>Connect Google Calendar</CardTitle>
          <CardDescription>
            Connect your Google Calendar to check availability and add appointments automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${isConnected ? "bg-green-100" : "bg-red-100"}`}>
              {isConnected ? <Check className="h-6 w-6 text-green-600" /> : <X className="h-6 w-6 text-red-600" />}
            </div>
            <div>
              <p className="font-medium">
                {isConnected ? "Connected to Google Calendar" : "Not connected to Google Calendar"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? "Your Google Calendar is connected and ready to use"
                  : "Connect your Google Calendar to enable automatic availability checking and appointment creation"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isConnected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect Google Calendar
            </Button>
          ) : (
            <Button onClick={handleConnect}>
              <Calendar className="mr-2 h-4 w-4" />
              Connect Google Calendar
            </Button>
          )}
        </CardFooter>
      </Card>

      {isConnected && (
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
      )}
    </div>
  )
}
