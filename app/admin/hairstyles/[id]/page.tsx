"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, X, GripVertical } from "lucide-react"
import { getHairstyleById, createHairstyle, updateHairstyle } from "@/app/actions/hairstyles"
import { uploadImage } from "@/lib/cloudinary"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid';

interface DisplayImage {
  id: string; 
  url: string; 
  file?: File; 
  isNew: boolean; 
  publicId?: string; 
}

const MAX_IMAGES = 4;

export default function EditHairstylePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const id = params.id
  const isNew = id === "new"

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentImages, setCurrentImages] = useState<DisplayImage[]>([])

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    category: "",
    description: "",
    materials: "",
    image_urls: [] as string[],
    is_active: true,
  })

  useEffect(() => {
    const fetchHairstyle = async () => {
      if (isNew) {
        setIsLoading(false)
        setCurrentImages([])
        setFormData(prev => ({ 
          ...prev, 
          name: "", price: "", duration: "", category: "", description: "", materials: "",
          image_urls: [], 
          is_active: true 
        }));
        return
      }
      setIsLoading(true); // Set loading true at the start of fetch
      try {
        const hairstyle = await getHairstyleById(id)
        if (hairstyle) {
          const fetchedImageUrls = Array.isArray(hairstyle.image_urls) ? hairstyle.image_urls : [];
          setFormData({
            name: hairstyle.name,
            price: hairstyle.price.toString(),
            duration: hairstyle.duration.toString(),
            category: hairstyle.category,
            description: hairstyle.description || "",
            materials: hairstyle.materials || "",
            image_urls: fetchedImageUrls,
            is_active: hairstyle.is_active,
          });
          const existingImages: DisplayImage[] = fetchedImageUrls.map((url: string) => ({
            id: uuidv4(), // Assign a new uuid for list key purposes, original URL might not be unique if duplicated by mistake
            url: url,
            isNew: false,
            // Basic publicId extraction - adapt if your Cloudinary URLs/public_ids have a different structure
            publicId: url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf(".")) || uuidv4(), 
          }));
          setCurrentImages(existingImages);
        } else {
          toast({
            title: "Error",
            description: "Hairstyle not found. You will be redirected.",
            variant: "destructive",
          });
          router.push("/admin/hairstyles");
        }
      } catch (error) {
        console.error("Error fetching hairstyle:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load hairstyle details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchHairstyle()
  }, [id, isNew, toast, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const availableSlots = MAX_IMAGES - currentImages.length;
      if (files.length > availableSlots) {
        toast({
          title: "Limit Reached",
          description: `You can only upload up to ${MAX_IMAGES} images. ${availableSlots > 0 ? `${availableSlots} more allowed.` : 'No more images allowed.'}`, 
          variant: "destructive",
        });
      }
      const newDisplayImages: DisplayImage[] = files.slice(0, availableSlots).map(file => ({
        id: uuidv4(),
        url: URL.createObjectURL(file),
        file: file,
        isNew: true,
      }));
      setCurrentImages(prev => [...prev, ...newDisplayImages]);
      e.target.value = ""; // Reset file input
    }
  }

  const removeImage = (idToRemove: string) => {
    const imageToRemove = currentImages.find(img => img.id === idToRemove);
    setCurrentImages(prev => prev.filter(image => image.id !== idToRemove));
    
    // If it was an existing image (not new), also remove its URL from formData.image_urls
    // This marks it for deletion from the database array upon saving.
    if (imageToRemove && !imageToRemove.isNew) {
      setFormData(prev => ({
        ...prev,
        image_urls: prev.image_urls.filter(url => url !== imageToRemove.url)
      }));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const uploadedImageUrls: { id: string, newUrl: string }[] = [];
      const finalImageUrls: string[] = [];

      // Upload new images
      for (const image of currentImages) {
        if (image.isNew && image.file) {
          try {
            const uploadResult = await uploadImage(image.file);
            uploadedImageUrls.push({ id: image.id, newUrl: uploadResult.url });
          } catch (uploadError) {
            console.error("Error uploading one of the images:", uploadError);
            toast({
              title: "Image Upload Error",
              description: `Failed to upload image ${image.file.name}. Please try again.`, 
              variant: "destructive"
            });
            setIsSaving(false);
            return; // Stop submission if an image fails to upload
          }
        }
      }

      // Construct the final list of URLs in the current order
      currentImages.forEach(image => {
        if (image.isNew) {
          const uploaded = uploadedImageUrls.find(u => u.id === image.id);
          if (uploaded) {
            finalImageUrls.push(uploaded.newUrl);
          }
        } else {
          // It's an existing image, add its original URL if it wasn't removed
          // The check for removal is implicitly handled by `currentImages` being the source of truth
          finalImageUrls.push(image.url);
        }
      });
      
      const hairstyleData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        duration: Number.parseInt(formData.duration),
        image_urls: finalImageUrls, // Use the ordered list of final URLs
      };
      // Remove `image_url` if it exists as we are using `image_urls`
      delete (hairstyleData as any).image_url; 

      if (isNew) {
        await createHairstyle(hairstyleData);
        toast({
          title: "Hairstyle Created",
          description: "The hairstyle has been successfully created.",
        });
      } else {
        await updateHairstyle(id, hairstyleData);
        toast({
          title: "Hairstyle Updated",
          description: "The hairstyle has been successfully updated.",
        });
      }
      router.push("/admin/hairstyles");
    } catch (error) {
      console.error("Error saving hairstyle:", error);
      toast({
        title: "Save Error",
        description: `Failed to ${isNew ? "create" : "update"} hairstyle. ${error instanceof Error ? error.message : 'Please try again.'}`, 
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
              <CardTitle>Images (Max {MAX_IMAGES})</CardTitle>
              <CardDescription>Upload images of the hairstyle. The first image will be the cover.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {currentImages.map((image, index) => (
                  <div key={image.id} className="relative aspect-video group">
                    <img
                      src={image.url}
                      alt={`Hairstyle image ${index + 1}`}
                      className="object-cover w-full h-full rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 z-10 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 rounded-b-lg">Cover</div>
                    )}
                  </div>
                ))}
              </div>

              {currentImages.length < MAX_IMAGES && (
                <div className="w-full mt-4">
                  <Label htmlFor="images" className="sr-only">Upload Images</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
              )}
               {currentImages.length === 0 && (
                 <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg bg-muted mt-4">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to browse or drag and drop images here.</p>
                  </div>
               )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving ? (isNew ? "Creating..." : "Saving...") : isNew ? "Create Hairstyle" : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
