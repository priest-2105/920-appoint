"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export interface AppointmentPolicy {
  contactInfo: {
    name: string
    phone: string
    date: string
  }
  depositRequired: boolean
  depositAmount: string
  refundPolicy: string
  lateArrivalPolicy: string
  reschedulePolicy: string
  additionalNotes: string[]
}

export async function getAppointmentPolicy() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "appointment_policy")
      .single()

    if (error) {
      console.error("Error fetching appointment policy:", error)
      throw error
    }

    return data?.value as AppointmentPolicy
  } catch (error) {
    console.error("Error in getAppointmentPolicy:", error)
    throw error
  }
}

export async function saveAppointmentPolicy(policy: AppointmentPolicy) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if policy already exists
    const { data: existingPolicy } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "appointment_policy")
      .single()

    if (existingPolicy) {
      // Update existing policy
      const { error } = await supabase
        .from("settings")
        .update({ 
          value: policy,
          updated_at: new Date().toISOString()
        })
        .eq("key", "appointment_policy")

      if (error) throw error
    } else {
      // Create new policy
      const { error } = await supabase
        .from("settings")
        .insert([{ 
          key: "appointment_policy", 
          value: policy 
        }])

      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in saveAppointmentPolicy:", error)
    throw error
  }
} 