import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// This would be fetched from Supabase in a real implementation
const featuredStyles = [
  {
    id: 1,
    name: "Modern Fade",
    price: "£35",
    duration: "45 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Classic Bob",
    price: "£45",
    duration: "60 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Textured Pixie",
    price: "£40",
    duration: "45 min",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export function FeaturedHairstyles() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Popular Hairstyles</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Browse our most requested styles and book your appointment today.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {featuredStyles.map((style) => (
            <Card key={style.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <img
                  src={style.image || "/placeholder.svg"}
                  alt={style.name}
                  width={300}
                  height={200}
                  className="object-cover w-full h-48"
                />
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl">{style.name}</CardTitle>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-medium">{style.price}</span>
                  <span className="text-sm text-muted-foreground">{style.duration}</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Link href={`/book?style=${style.id}`} className="w-full">
                  <Button className="w-full">Book This Style</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Link href="/hairstyles">
            <Button variant="outline" size="lg">
              View All Hairstyles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

