"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Link } from "next/link"

interface BookingFormProps {
  onSubmit: (data: any) => void
}

export function BookingForm({ onSubmit }: BookingFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    createAccount: false,
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="createAccount"
          name="createAccount"
          checked={formData.createAccount}
          onCheckedChange={(checked) =>
            setFormData({
              ...formData,
              createAccount: checked as boolean,
            })
          }
        />
        <Label htmlFor="createAccount">Create an account for faster bookings in the future (optional)</Label>
      </div>
      {formData.createAccount && (
        <div className="space-y-2">
          <Label htmlFor="password">Create Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={formData.createAccount}
          />
        </div>
      )}
      <div className="text-xs text-muted-foreground mt-4">
        By continuing, you agree to our{" "}
        <Link href="/appointment-policy" className="underline underline-offset-2" target="_blank">
          Appointment Policy
        </Link>
        .
      </div>
      <Button type="submit" className="w-full">
        Continue to Payment
      </Button>
    </form>
  )
}

