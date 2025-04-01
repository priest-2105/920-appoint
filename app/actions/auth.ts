"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Sign up a new user
export async function signUp(email: string, password: string, userData: any) {
  const supabase = createServerSupabaseClient()

  // Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
      },
    },
  })

  if (authError) {
    console.error("Error signing up:", authError)
    throw new Error(authError.message)
  }

  // Create the customer record
  if (authData.user) {
    const { error: customerError } = await supabase.from("customers").insert([
      {
        id: authData.user.id,
        email: email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
      },
    ])

    if (customerError) {
      console.error("Error creating customer record:", customerError)
      // Don't throw here, the auth user was created successfully
    }
  }

  return { success: true, user: authData.user }
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

// Sign out a user
export async function signOut() {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    throw new Error(error.message)
  }

  redirect("/")
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

  // Check if the user has the admin role
  // This would typically be stored in user metadata or a separate table
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .eq("email", "admin@stylesync.com") // Simple check for demo purposes
    .single()

  if (error || !data) {
    return false
  }

  return true
}

