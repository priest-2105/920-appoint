"use client"

import { useState } from "react"
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

// This would be fetched from Supabase in a real implementation
const hairstyles = [
  {
    id: 1,
    name: "Modern Fade",
    price: 35,
    duration: 45,
    category: "Short",
    image_url: "/placeholder.svg?height=200&width=300",
    materials: "Scissors, Clippers, Comb",
  },
  {
    id: 2,
    name: "Classic Bob",
    price: 45,
    duration: 60,
    category: "Medium",
    image_url: "/placeholder.svg?height=200&width=300",
    materials: "Scissors, Comb",
  },
  {
    id: 3,
    name: "Textured Pixie",
    price: 40,
    duration: 45,
    category: "Short",
    image_url: "/placeholder.svg?height=200&width=300",
    materials: "Scissors, Texturizing Shears, Styling Wax",
  },
  {
    id: 4,
    name: "Long Layers",
    price: 55,
    duration: 75,
    category: "Long",
    image_url: "/placeholder.svg?height=200&width=300",
    materials: "Scissors, Comb",
  },
  {
    id: 5,
    name: "Blunt Cut",
    price: 40,
    duration: 45,
    category: "Medium",
    image_url: "/placeholder.svg?height=200&width=300",
    materials: "Scissors",
  },
  {
    id: 6,
    name: "Curly Shag",
    price: 50,
    duration: 60,
    category: "Medium",
    image_url: "/placeholder.svg?height=200&width=300",
    materials: "Diffuser, Curl Cream",
  },
]

export function AdminHairstylesList() {
  const [styles, setStyles] = useState(hairstyles)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [styleToDelete, setStyleToDelete] = useState<number | null>(null)

  const handleDelete = (id: number) => {
    setStyleToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (styleToDelete !== null) {
      setStyles(styles.filter((style) => style.id !== styleToDelete))
      setDeleteDialogOpen(false)
      setStyleToDelete(null)
    }
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
                  src={style.image_url || "/placeholder.svg"}
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
