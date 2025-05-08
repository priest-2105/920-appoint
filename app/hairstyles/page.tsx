import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { getHairstyles } from "@/app/actions/hairstyles"
import { HairstylesDisplay } from "@/components/hairstyles-display"

interface Hairstyle {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  image_urls: string[];
  is_active?: boolean;
  materials?: string | null;
}

export default async function HairstylesPage() {
  const hairstyles: Hairstyle[] = await getHairstyles();

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
            <HairstylesDisplay initialHairstyles={hairstyles} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
