// Cloudinary integration for image uploads
export async function uploadImage(file: File) {
  try {
    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "stylesync") // Replace with your Cloudinary upload preset

    // Upload the image to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/your-cloud-name/image/upload`, // Replace with your Cloudinary cloud name
      {
        method: "POST",
        body: formData,
      },
    )

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()

    // Return the secure URL of the uploaded image
    return {
      url: data.secure_url,
      publicId: data.public_id,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
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
