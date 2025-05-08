"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendAdminHairstyleNotification } from "@/lib/utils"

// Basic UUID v4 regex pattern
const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

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
  // Validate if the ID is a valid UUID
  if (!UUID_V4_REGEX.test(id)) {
    const errorMessage = `Invalid ID format: "${id}". A valid UUID is expected.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const supabase = createServerSupabaseClient()
  console.log(`Fetching hairstyle with ID: ${id}`)

  const { data, error } = await supabase.from("hairstyles").select("*").eq("id", id).single()

  if (error) {
    console.error(`Supabase error fetching hairstyle (ID: ${id}):`, error)
    throw new Error(`Failed to fetch hairstyle with ID: ${id}. Supabase error: ${error.message}`)
  }

  if (!data) {
    console.warn(`No hairstyle found with ID: ${id}, but Supabase returned no error. This scenario might indicate an unexpected issue with .single() or data shaping.`)
    throw new Error(`No hairstyle found with ID: ${id}, and Supabase did not return an explicit error, though data is null.`)
  }

  return data
}

// Create a new hairstyle (admin only)
// Expected hairstyle object structure includes:
// { name: string, price: number, duration: number, category: string, description?: string, materials?: string, image_urls?: string[], is_active?: boolean }
export async function createHairstyle(hairstyle: any) {
  const supabase = createServerSupabaseClient()

  // Ensure image_urls is an array, even if empty or undefined
  const hairstyleData = {
    ...hairstyle,
    image_urls: Array.isArray(hairstyle.image_urls) ? hairstyle.image_urls : [],
  };

  const { data, error } = await supabase.from("hairstyles").insert([hairstyleData]).select()

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
// Expected hairstyle object structure mirrors createHairstyle
export async function updateHairstyle(id: string, hairstyle: any) {
  const supabase = createServerSupabaseClient()

  // Ensure image_urls is an array if provided, otherwise don't include it in the update payload
  // to avoid overwriting with an empty array if not part of the update.
  const updateData: any = { ...hairstyle };
  if (hairstyle.hasOwnProperty('image_urls')) {
    updateData.image_urls = Array.isArray(hairstyle.image_urls) ? hairstyle.image_urls : [];
  } else {
    // If image_urls is not in the partial update, remove it to avoid accidental overwrite
    delete updateData.image_urls;
  }

  const { data, error } = await supabase.from("hairstyles").update(updateData).eq("id", id).select()

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
