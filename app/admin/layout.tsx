"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { MainNav } from "@/components/main-nav"
import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin-sidebar"

export const metadata: Metadata = {
  title: "Admin Dashboard - StyleSync",
  description: "Manage your hairstyle booking business",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const supabase = createSupabaseClient()
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log("No user found, redirecting to login")
          router.push("/login")
          return
        }

        // Check if user is admin
        const { data: customerData, error } = await supabase
          .from('customers')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (error || !customerData?.is_admin) {
          console.log("User is not an admin, redirecting to home")
          router.push("/")
          return
        }

        console.log("Admin access verified")
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/")
      }
    }

    checkAdminStatus()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-sm text-muted-foreground">Verifying admin access</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/admin/dashboard" className="lg:hidden">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Site</Link>
            </Button>
            <Button variant="ghost" size="sm">
              Logout
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
      </div>
    </div>
  )
}
