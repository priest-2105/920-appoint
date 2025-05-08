import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export async function sendAdminHairstyleNotification(hairstyle: any, action: "created" | "updated") {
  try {
    // This would typically be done server-side, but for demo purposes we'll call it here
    // In a real implementation, this would be part of the server action that processes the hairstyle
    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "admin@920appoint.com", // Replace with your actual admin email
        subject: `Hairstyle ${action === "created" ? "Created" : "Updated"} - 920Appoint`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Hairstyle ${action === "created" ? "Created" : "Updated"}</h1>
        <p>A hairstyle has been ${action === "created" ? "added to" : "updated in"} your catalog. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${hairstyle.name}</p>
          <p><strong>Category:</strong> ${hairstyle.category}</p>
          <p><strong>Price:</strong> £${hairstyle.price}</p>
          <p><strong>Duration:</strong> ${hairstyle.duration} minutes</p>
          <p><strong>Description:</strong> ${hairstyle.description || "N/A"}</p>
          <p><strong>Materials:</strong> ${hairstyle.materials || "N/A"}</p>
        </div>
        <p>You can view and manage hairstyles in your admin dashboard.</p>
      </div>`,
      }),
    })

    if (!response.ok) {
      console.error("Failed to send admin notification")
    }
  } catch (error) {
    console.error("Error sending admin notification:", error)
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
