"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { logout, checkSession } from "@/lib/store/features/authSlice"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useEffect } from 'react'

export function MainNav() {
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Dispatch checkSession thunk on component mount
    dispatch(checkSession())
  }, [dispatch])

  // Ensure the component correctly checks the Redux state for user authentication and admin status
  const isAdmin = user?.is_admin

  console.log("MainNav - isAuthenticated:", isAuthenticated)
  console.log("MainNav - user:", user)

  const handleSignOut = async () => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      // Clear Redux state
      dispatch(logout())
      
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      })

      router.replace("/")
    } catch (error: any) {
      console.error("Sign out error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4 lg:space-x-6">
        <Link
          href="/"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Home
        </Link>
        <Link
          href="/hairstyles"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Hairstyles
        </Link>
        <Link
          href="/appointment-policy"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Policy
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {isAdmin && (
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </Link>
            )}
            <Link href="/my-appointments">
              <Button variant="ghost" size="sm">
                My Appointments
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
        )}
        <Link href="/book">
          <Button size="sm">Book Now</Button>
        </Link>
      </div>
    </div>
  )
}
