"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Get all customers (admin only)
export async function getCustomers() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("customers").select("*").order("last_name")

  if (error) {
    console.error("Error fetching customers:", error)
    throw new Error("Failed to fetch customers")
  }

  return data
}

// Get a customer by ID
export async function getCustomerById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching customer:", error)
    throw new Error("Failed to fetch customer")
  }

  return data
}

// Get a customer by email
export async function getCustomerByEmail(email: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("customers").select("*").eq("email", email).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "No rows returned"
    console.error("Error fetching customer by email:", error)
    throw new Error("Failed to fetch customer by email")
  }

  return data || null
}

// Create a new customer
export async function createCustomer(customer: any) {
  const supabase = createServerSupabaseClient()

  // Check if customer already exists
  const existingCustomer = await getCustomerByEmail(customer.email)

  if (existingCustomer) {
    return existingCustomer
  }

  const { data, error } = await supabase.from("customers").insert([customer]).select()

  if (error) {
    console.error("Error creating customer:", error)
    throw new Error("Failed to create customer")
  }

  revalidatePath("/admin/customers")

  return data[0]
}

// Update a customer
export async function updateCustomer(id: string, customer: any) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("customers").update(customer).eq("id", id).select()

  if (error) {
    console.error("Error updating customer:", error)
    throw new Error("Failed to update customer")
  }

  revalidatePath("/admin/customers")

  return data[0]
}
