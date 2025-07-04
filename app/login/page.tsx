"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setUser } from "@/lib/store/features/authSlice"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Rehydrate authentication state from local storage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      dispatch(setUser(userData))
    }
  }, [dispatch])

  useEffect(() => {
    if (!isAuthenticated) {
      const checkSession = async () => {
        console.log("=== Login Page Session Check ===")
        try {
          const supabase = createSupabaseClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          console.log("Session data:", session)
          
          if (session?.user) {
            console.log("✅ Session found, updating Redux store...")
            // Get customer data
            const { data: customerData, error: customerError } = await supabase
              .from('customers')
              .select('*')
              .eq('id', session.user.id)
              .single()

            console.log("Customer data:", customerData)
            console.log("Customer error:", customerError)

            if (customerData) {
              // Update Redux store with combined user and customer data
              const userData = { ...session.user, ...customerData }
              dispatch(setUser(userData))

              // Use userData directly
              if (userData.is_admin) {
                console.log("Redirecting to admin dashboard")
                router.push("/admin/dashboard")
              } else {
                console.log("Redirecting to home")
                router.push("/")
              }
            }
          } else {
            setIsCheckingSession(false)
          }
        } catch (error) {
          console.error("❌ Session check error:", error)
          setIsCheckingSession(false)
        }
      }
      checkSession()
    } else {
      setIsCheckingSession(false)
    }
  }, [dispatch, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log("=== Login Form Submit ===")

    try {
      console.log("🔍 Attempting login...")
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log("❌ Login error:", error)
        throw error
      }

      console.log("✅ Login successful, user data:", data)

      if (data.user) {
        console.log("🔍 Fetching customer data...")
        // Get additional user data from customers table
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', data.user.id)
          .single()

        console.log("Customer data:", customerData)
        console.log("Customer error:", customerError)

        if (customerError) {
          throw customerError
        }

        // Combine auth user with customer data
        const userData = {
          ...data.user,
          ...customerData,
        }

        console.log(" Updating Redux store with userData:", userData)
        // Update Redux store
        dispatch(setUser(userData))
        console.log("admin status", userData.is_admin)

        // Persist user data in local storage
        localStorage.setItem('user', JSON.stringify(userData))

        toast({
          title: "Success",
          description: "You have been successfully logged in.",
        })
      
        if (userData.is_admin) {
          console.log("Redirecting to admin dashboard")
          router.push("/admin/dashboard/")
        } else {
          console.log("Redirecting to home")
          router.push("/")
        }
      }
    } catch (error: any) {
      console.error(" Login error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to log in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If we're checking the session, show loading
  if (isCheckingSession) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <p>Checking session...</p>
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <Button disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="hover:text-brand underline underline-offset-4"
          >
            Forgot your password?
          </Link>
        </p>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="hover:text-brand underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
