import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Book Your Perfect Hairstyle
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Browse our collection of trending hairstyles, select a convenient time, and book your appointment in
                minutes.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/book">
                <Button size="lg" className="px-8">
                  Book Now
                </Button>
              </Link>
              <Link href="/hairstyles">
                <Button size="lg" variant="outline" className="px-8">
                  Browse Styles
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block bg-muted rounded-xl overflow-hidden">
            <img
              src="/placeholder.svg?height=550&width=450"
              alt="Stylish haircut"
              width={550}
              height={450}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

