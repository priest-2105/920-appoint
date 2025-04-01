"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { createSupabaseClient } from "@/lib/supabase"
import { updateCustomer } from "@/app/actions/customers"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          router.push("/login?redirect=/profile")
          return
        }

        setUser(data.user)
        fetchCustomer(data.user.id)
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/login?redirect=/profile")
      }
    }

    const fetchCustomer = async (userId: string) => {
      try {
        const supabase = createSupabaseClient()

        const { data, error } = await supabase.from("customers").select("*").eq("id", userId).single()

        if (error) {
          throw error
        }

        setCustomer(data)
        setFormData({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || "",
        })
      } catch (error) {
        console.error("Error fetching customer:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateCustomer(customer.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      })

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="container z-40 bg-background">
          <div className="flex h-20 items-center justify-between py-6">
            <MainNav />
          </div>
        </header>
        <main className="flex-1 py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container flex items-center justify-center px-4 md:px-6">
            <p>Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
          <nav className="flex items-center gap-2">
            <Link href="/my-appointments">
              <Button variant="ghost" size="sm">
                My Appointments
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">My Profile</h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                View and update your profile information
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-md py-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={formData.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">
                  Want to change your password?{" "}
                  <Link href="/reset-password" className="underline">
                    Reset Password
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

