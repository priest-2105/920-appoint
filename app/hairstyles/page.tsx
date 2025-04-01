import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getHairstyles } from "@/app/actions/hairstyles"

export default async function HairstylesPage() {
  const hairstyles = await getHairstyles()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/book">
              <Button size="sm">Book Now</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Hairstyles</h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Browse our collection of hairstyles and find your perfect look.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl py-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input id="search" placeholder="Search hairstyles..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <Select defaultValue="name">
                    <SelectTrigger id="sort" className="mt-1">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-3">
              {hairstyles.map((style) => (
                <Card key={style.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <img
                      src={style.image_url || "/placeholder.svg?height=200&width=300"}
                      alt={style.name}
                      width={300}
                      height={200}
                      className="object-cover w-full h-48"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl">{style.name}</CardTitle>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-medium">£{style.price}</span>
                      <span className="text-sm text-muted-foreground">{style.duration} min</span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted">
                        {style.category}
                      </span>
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

