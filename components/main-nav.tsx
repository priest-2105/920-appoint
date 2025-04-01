"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Scissors, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createSupabaseClient } from "@/lib/supabase"
import { signOut } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function MainNav() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
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
        {user && user.email === "admin@stylesync.com" && (
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
              {user && user.email === "admin@stylesync.com" && (
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
                      Sign Out
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

