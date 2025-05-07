"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { HeroSection } from "@/components/hero-section"
import { FeaturedHairstyles } from "@/components/featured-hairstyles"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"
import { createSupabaseClient } from "@/lib/supabase"
import { signOut } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function Home() {
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
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
          <nav className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/my-appointments">My Appointments</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                    <Link href="/book">
                      <Button size="sm">Book Now</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/book">
                      <Button size="sm">Book Now</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <HeroSection />
        <FeaturedHairstyles />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
