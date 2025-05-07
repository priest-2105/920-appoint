"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setUser } from "@/lib/store/features/authSlice"
import { MainNav } from "@/components/main-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const checkAuth = async () => {
      console.log("=== Admin Layout Auth Check ===")
      console.log("Current Redux State:", { isAuthenticated, user })
      
      try {
        // If we already have the user data in Redux and they're an admin, we can skip the check
        if (isAuthenticated && user?.is_admin) {
          console.log("✅ User already authenticated and is admin in Redux state")
          setIsLoading(false)
          return
        }

        console.log("🔍 Checking Supabase session...")
        const supabase = createSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        console.log("Session data:", session)

        if (!session?.user) {
          console.log("❌ No session found, redirecting to login")
          // router.replace("/login")
          return
        }

        console.log("✅ Session found, checking customer data...")
        // Get customer data
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', session.user.id)
          .single()

        console.log("Customer data:", customerData)
        console.log("Customer error:", customerError)

        if (customerError || !customerData) {
          console.log("❌ Error fetching customer data:", customerError)
          // router.replace("/login")
          return
        }

        if (!customerData.is_admin) {
          console.log("❌ User is not an admin, redirecting to home")
          // router.replace("/")
          return
        }

        console.log("✅ User is admin, updating Redux store...")
        // Update Redux store with user data
        dispatch(setUser({ ...session.user, ...customerData }))
        console.log("✅ Redux store updated, showing dashboard")
        setIsLoading(false)
      } catch (error) {
        console.error("❌ Auth check error:", error)
        // router.replace("/login")
      }
    }

    checkAuth()
  }, [dispatch, router, isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
