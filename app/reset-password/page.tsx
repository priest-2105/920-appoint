"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { createSupabaseClient } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const verifyResetToken = async () => {
      const code = searchParams.get("code")
      const type = searchParams.get("type")

      if (!code || type !== "recovery") {
        setIsValid(false)
        toast({
          title: "Invalid Reset Link",
          description: "The password reset link is invalid or has expired.",
          variant: "destructive",
        })
        return
      }

      try {
        const supabase = createSupabaseClient()
        const { error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: "recovery",
        })

        if (error) {
          throw error
        }

        setIsValid(true)
      } catch (error) {
        console.error("Error verifying reset token:", error)
        setIsValid(false)
        toast({
          title: "Invalid Reset Link",
          description: "The password reset link is invalid or has expired.",
          variant: "destructive",
        })
      }
    }

    verifyResetToken()
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      })

      router.push("/login")
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        title: "Reset Failed",
        description: "There was an error resetting your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
        </div>
      </header>
      <main className="flex-1 py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container flex items-center justify-center px-4 md:px-6">
          <div className="mx-auto w-full max-w-sm space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>Create a new password for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isValid ? (
                  <div className="space-y-4 text-center">
                    <p className="text-muted-foreground">The password reset link is invalid or has expired.</p>
                    <p className="text-muted-foreground">Please request a new password reset link.</p>
                    <Button asChild className="w-full">
                      <Link href="/forgot-password">Request New Link</Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="text-sm text-muted-foreground text-center">
                  Remember your password?{" "}
                  <Link href="/login" className="underline">
                    Sign in
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
