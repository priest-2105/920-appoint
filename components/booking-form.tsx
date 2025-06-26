"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase"

interface BookingFormProps {
  onSubmit: (data: any) => void
  price?: number
}

export function BookingForm({ onSubmit, price }: BookingFormProps) {
  const [user, setUser] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    createAccount: false,
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createSupabaseClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
        setFormData((prev) => ({
          ...prev,
          email: data.user.email || "",
        }))
      }
    }
    fetchUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords match if creating account
    if (formData.createAccount && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match. Please try again.")
      return
    }
    
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
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          disabled={!!user}
          onChange={handleChange}
          required
        />
        {user && (
          <div className="text-xs text-muted-foreground mt-1">Logged in as: {user.email}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
      </div>
      {!user && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="createAccount"
            checked={formData.createAccount}
            onCheckedChange={checked => setFormData({ ...formData, createAccount: checked })}
          />
          <Label htmlFor="createAccount">
            Create an account for faster bookings in the future (optional)
          </Label>
        </div>
      )}
      {formData.createAccount && (
        <div className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="password">Create Password</Label>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required={formData.createAccount}
            />
            <button
              type="button"
              className="absolute right-2 top-9 z-10 p-1 text-muted-foreground"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required={formData.createAccount}
            />
            <button
              type="button"
              className="absolute right-2 top-9 z-10 p-1 text-muted-foreground"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
      {price && (
        <div className="my-4 flex items-center justify-center">
          <span className="text-3xl font-bold text-primary">£{price}</span>
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
