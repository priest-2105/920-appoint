// Cloudinary integration for image uploads
export async function uploadImage(file: File) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("Cloudinary cloud name or upload preset is not configured in environment variables.");
      throw new Error("Image upload configuration error.");
    }

    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)

    // Upload the image to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse Cloudinary error response" }));
      console.error("Cloudinary API Error:", errorData);
      throw new Error(`Failed to upload image. Status: ${response.status}. Message: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json()

    // Return the secure URL of the uploaded image
    return {
      url: data.secure_url,
      publicId: data.public_id,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    // Ensure a generic error is thrown if it's not already an Error instance or doesn't have a message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload image due to an unexpected error.");
  }
}

// Delete an image from Cloudinary
export async function deleteImage(publicId: string) {
  try {
    // In a real implementation, this would call a server-side function
    // that uses the Cloudinary API to delete the image
    // For security reasons, you should not expose your Cloudinary API secret in client-side code

    // Example server-side implementation:
    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    })

    if (!response.ok) {
      throw new Error("Failed to delete image")
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}
