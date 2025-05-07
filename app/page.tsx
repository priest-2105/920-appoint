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
    console.log("Starting client-side sign out process...")
    try {
      const supabase = createSupabaseClient()
      
      
      console.log("Attempting to sign out...")
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Error during sign out:", error)
        throw new Error(error.message)
      }
      console.log("Successfully signed out from auth")

      // Clear local state
      console.log("Clearing local user state...")
      setUser(null)
      console.log("Local user state cleared")

      // Show success message
      console.log("Showing success toast...")
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })

      // Refresh the page state and navigate
      console.log("Refreshing page state...")
      router.refresh()
      router.push("/")
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
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
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
