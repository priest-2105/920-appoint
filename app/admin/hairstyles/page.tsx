import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { AdminHairstylesList } from "@/components/admin-hairstyles-list"

export default function AdminHairstylesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Hairstyles</h1>
        <Link href="/admin/hairstyles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Hairstyle
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Hairstyles</CardTitle>
          <CardDescription>Add, edit, or remove hairstyles from your catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminHairstylesList />
        </CardContent>
      </Card>
    </div>
  )
}
