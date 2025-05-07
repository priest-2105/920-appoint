"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, X } from "lucide-react"
import { getHairstyleById, createHairstyle, updateHairstyle } from "@/app/actions/hairstyles"
import { uploadImage } from "@/lib/cloudinary"
import { useToast } from "@/hooks/use-toast"

export default function EditHairstylePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id
  const isNew = id === "new"

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    category: "",
    description: "",
    materials: "", // Add materials field
    image_url: "",
    is_active: true,
  })

  useEffect(() => {
    const fetchHairstyle = async () => {
      if (isNew) {
        setIsLoading(false)
        return
      }

      try {
        const hairstyle = await getHairstyleById(id)

        if (hairstyle) {
          setFormData({
            name: hairstyle.name,
            price: hairstyle.price.toString(),
            duration: hairstyle.duration.toString(),
            category: hairstyle.category,
            description: hairstyle.description || "",
            materials: hairstyle.materials || "", // Add materials field
            image_url: hairstyle.image_url || "",
            is_active: hairstyle.is_active,
          })

          if (hairstyle.image_url) {
            setImagePreview(hairstyle.image_url)
          }
        }
      } catch (error) {
        console.error("Error fetching hairstyle:", error)
        toast({
          title: "Error",
          description: "Failed to load hairstyle details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHairstyle()
  }, [id, isNew, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create a preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({
      ...formData,
      image_url: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let imageUrl = formData.image_url

      // Upload image if a new one was selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile)
        imageUrl = uploadResult.url
      }

      const hairstyleData = {
        name: formData.name,
        price: Number.parseFloat(formData.price),
        duration: Number.parseInt(formData.duration),
        category: formData.category,
        description: formData.description,
        materials: formData.materials, // Add materials field
        image_url: imageUrl,
        is_active: formData.is_active,
      }

      if (isNew) {
        await createHairstyle(hairstyleData)
        toast({
          title: "Hairstyle Created",
          description: "The hairstyle has been successfully created.",
        })
      } else {
        await updateHairstyle(id, hairstyleData)
        toast({
          title: "Hairstyle Updated",
          description: "The hairstyle has been successfully updated.",
        })
      }

      router.push("/admin/hairstyles")
    } catch (error) {
      console.error("Error saving hairstyle:", error)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} hairstyle. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isNew ? "Add New Hairstyle" : "Edit Hairstyle"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hairstyle Details</CardTitle>
              <CardDescription>Enter the details of the hairstyle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (£)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short">Short</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials">Materials Used</Label>
                <Textarea
                  id="materials"
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List the materials used for this hairstyle (e.g., products, tools)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
              <CardDescription>Upload an image of the hairstyle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Hairstyle preview"
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      type="button"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag and drop an image, or click to browse</p>
                  </div>
                )}

                <div className="w-full">
                  <Label htmlFor="image" className="sr-only">
                    Upload Image
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={imagePreview ? "hidden" : ""}
                  />
                  {imagePreview && (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      type="button"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (isNew ? "Creating..." : "Saving...") : isNew ? "Create Hairstyle" : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
