"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { getHairstyles, deleteHairstyle } from "@/app/actions/hairstyles"
import { useToast } from "@/hooks/use-toast"

// Define a type for Hairstyle (adjust fields as necessary based on your actual data structure)
interface Hairstyle {
  id: string; // Assuming ID is a string (UUID)
  name: string;
  price: number;
  duration: number;
  category: string;
  image_urls: string[]; // Changed from image_url
  materials: string | null;
  is_active?: boolean; 
}

export function AdminHairstylesList() {
  const [styles, setStyles] = useState<Hairstyle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [styleToDelete, setStyleToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchHairstyles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedHairstyles = await getHairstyles()
      setStyles(fetchedHairstyles || [])
    } catch (err) {
      console.error("Failed to fetch hairstyles:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching hairstyles.")
      toast({
        title: "Error",
        description: "Failed to load hairstyles. Please try again.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchHairstyles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = (id: string) => {
    setStyleToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (styleToDelete === null) return

    try {
      await deleteHairstyle(styleToDelete)
      // Optimistically update UI or re-fetch
      // For now, re-fetching to ensure data consistency after delete and path revalidation.
      await fetchHairstyles() 
      toast({
        title: "Success",
        description: "Hairstyle has been deleted.",
      })
    } catch (err) {
      console.error("Failed to delete hairstyle:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete hairstyle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setStyleToDelete(null)
    }
  }

  if (isLoading) {
    return <p>Loading hairstyles...</p>;
  }

  if (error && styles.length === 0) {
    return <p>Error loading hairstyles: {error}. Please try refreshing the page.</p>;
  }

  if (!isLoading && styles.length === 0 && !error) {
    return <p>No hairstyles found. <Link href="/admin/hairstyles/new" className="underline">Add a new one?</Link></p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Materials</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {styles.map((style) => (
            <TableRow key={style.id}>
              <TableCell>
                <img
                  src={(style.image_urls && style.image_urls.length > 0 ? style.image_urls[0] : "/placeholder.svg")}
                  alt={style.name}
                  width={60}
                  height={40}
                  className="rounded object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{style.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{style.category}</Badge>
              </TableCell>
              <TableCell>{style.duration} min</TableCell>
              <TableCell>£{style.price}</TableCell>
              <TableCell>
                {style.materials ? (
                  <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
                    {style.materials.length > 30 ? `${style.materials.substring(0, 30)}...` : style.materials}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">None specified</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/hairstyles/${style.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(style.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hairstyle and remove it from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
