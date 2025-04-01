import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-7 w-40 bg-muted animate-pulse rounded-md"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hairstyle Details</CardTitle>
            <CardDescription>Enter the details of the hairstyle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
              <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
              <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
              <div className="h-32 w-full bg-muted animate-pulse rounded-md"></div>
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
              <div className="aspect-video w-full rounded-lg bg-muted animate-pulse"></div>
              <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

