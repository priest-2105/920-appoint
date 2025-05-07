"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Scissors, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createSupabaseClient } from "@/lib/supabase"
import { signOut, isAdmin } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function MainNav() {
  const [user, setUser] = useState<any>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndAdminStatus = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: userData } = await supabase.auth.getUser()
        setUser(userData.user)
        
        if (userData.user) {
          // Check admin status directly from customers table
          const { data: customerData, error } = await supabase
            .from('customers')
            .select('is_admin')
            .eq('id', userData.user.id)
            .single()
          
          console.log("Customer data:", customerData)
          console.log("Admin check error:", error)
          
          if (error) {
            console.error("Error checking admin status:", error)
            setIsAdminUser(false)
          } else {
            const isAdmin = customerData?.is_admin === true
            console.log("Setting admin status to:", isAdmin)
            setIsAdminUser(isAdmin)
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setIsAdminUser(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndAdminStatus()
  }, [])

  // Add a debug effect to log admin status changes
  useEffect(() => {
    console.log("Admin status updated:", isAdminUser)
  }, [isAdminUser])

  const handleSignOut = async () => {
    console.log("Starting client-side sign out process...")
    try {
      // Clear local state first
      console.log("Clearing local user state...")
      setUser(null)
      setIsAdminUser(false)
      console.log("Local user state cleared")
      
      // Sign out from server
      console.log("Calling server-side sign out...")
      const result = await signOut()
      console.log("Sign out result:", result)
      
      if (!result.success) {
        console.error("Sign out failed:", result.error)
        throw new Error(result.error || "Failed to sign out")
      }

      // Show success message
      console.log("Showing success toast...")
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })

      // Force a hard refresh to clear any cached state
      console.log("Initiating page refresh...")
      window.location.href = "/"
    } catch (error) {
      console.error("Error in handleSignOut:", error)
      toast({
        title: "Error",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Scissors className="h-6 w-6" />
        <span className="font-bold inline-block">StyleSync</span>
      </Link>
      <nav className="hidden gap-6 md:flex">
        <Link
          href="/hairstyles"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Hairstyles
        </Link>
        <Link
          href="/pricing"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Pricing
        </Link>
        <Link
          href="/about"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Contact
        </Link>
        {user && (
          <Link
            href="/my-appointments"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            My Appointments
          </Link>
        )}
        {isAdminUser && (
          <Link
            href="/admin/dashboard"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Admin
          </Link>
        )}
      </nav>
      <div className="flex-1 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex items-center space-x-2 mb-8">
              <Scissors className="h-6 w-6" />
              <span className="font-bold">StyleSync</span>
            </div>
            <nav className="flex flex-col gap-4">
              <Link
                href="/hairstyles"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Hairstyles
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Contact
              </Link>
              {user && (
                <Link
                  href="/my-appointments"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  My Appointments
                </Link>
              )}
              {isAdminUser && (
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Admin
                </Link>
              )}
              {!isLoading && (
                <>
                  {user ? (
                    <Button variant="default" onClick={handleSignOut}>
                      Sign Out jjibn
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button variant="default" asChild>
                        <Link href="/book">Book Now</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
