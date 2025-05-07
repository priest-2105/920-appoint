"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendAdminHairstyleNotification } from "@/lib/utils"

// Get all hairstyles
export async function getHairstyles() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("hairstyles").select("*").eq("is_active", true).order("name")

  if (error) {
    console.error("Error fetching hairstyles:", error)
    throw new Error("Failed to fetch hairstyles")
  }

  return data
}

// Get a single hairstyle by ID
export async function getHairstyleById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("hairstyles").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching hairstyle:", error)
    throw new Error("Failed to fetch hairstyle")
  }

  return data
}

// Create a new hairstyle (admin only)
export async function createHairstyle(hairstyle: any) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("hairstyles").insert([hairstyle]).select()

  if (error) {
    console.error("Error creating hairstyle:", error)
    throw new Error("Failed to create hairstyle")
  }

  // Send admin notification
  try {
    await sendAdminHairstyleNotification(data[0], "created")
  } catch (error) {
    console.error("Error sending admin notification:", error)
    // Don't throw here, we still want to create the hairstyle
  }

  revalidatePath("/admin/hairstyles")
  revalidatePath("/hairstyles")

  return data[0]
}

// Update a hairstyle (admin only)
export async function updateHairstyle(id: string, hairstyle: any) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("hairstyles").update(hairstyle).eq("id", id).select()

  if (error) {
    console.error("Error updating hairstyle:", error)
    throw new Error("Failed to update hairstyle")
  }

  // Send admin notification
  try {
    await sendAdminHairstyleNotification(data[0], "updated")
  } catch (error) {
    console.error("Error sending admin notification:", error)
    // Don't throw here, we still want to update the hairstyle
  }

  revalidatePath("/admin/hairstyles")
  revalidatePath("/hairstyles")
  revalidatePath(`/admin/hairstyles/${id}`)

  return data[0]
}

// Delete a hairstyle (admin only)
export async function deleteHairstyle(id: string) {
  const supabase = createServerSupabaseClient()

  // Instead of actually deleting, we'll set is_active to false
  const { error } = await supabase.from("hairstyles").update({ is_active: false }).eq("id", id)

  if (error) {
    console.error("Error deleting hairstyle:", error)
    throw new Error("Failed to delete hairstyle")
  }

  revalidatePath("/admin/hairstyles")
  revalidatePath("/hairstyles")

  return { success: true }
}
