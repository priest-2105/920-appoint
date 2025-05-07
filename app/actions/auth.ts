"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Sign up a new user
export async function signUp(email: string, password: string, userData: any) {
  const supabase = createServerSupabaseClient()

  try {
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (authError) {
      console.error("Error signing up:", authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("No user data returned from signup")
    }

    // Create the customer record
    const { error: customerError } = await supabase.from("customers").insert([
      {
        id: authData.user.id,
        email: email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        is_admin: false, // Explicitly set is_admin to false for new users
      },
    ])

    if (customerError) {
      console.error("Error creating customer record:", customerError)
      // If customer creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error("Failed to create user profile")
    }

    return { success: true, user: authData.user }
  } catch (error) {
    console.error("Signup error:", error)
    throw error
  }
}

// Sign in a user
export async function signIn(email: string, password: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Error signing in:", error)
    throw new Error(error.message)
  }

  return { success: true, user: data.user }
}

// Get the current user
export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting current user:", error)
    return null
  }

  return data.user
}

// Check if the current user is an admin
export async function isAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("customers")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (error || !data) {
    return false
  }

  return data.is_admin === true
}
