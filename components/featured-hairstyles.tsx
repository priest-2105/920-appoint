"use client" // This component now fetches data, so it needs to be a client component

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react" // Added useEffect and useState
import { getHairstyles } from "@/app/actions/hairstyles" // Import the action

// Define a type for Hairstyle (consistent with other definitions)
interface Hairstyle {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string; // Add category if you want to display it or filter by it
  image_urls: string[];
  // Add other fields if needed, e.g., description, materials
}

const MAX_FEATURED_STYLES = 3; // Or however many you want to show

export function FeaturedHairstyles() {
  const [featuredStyles, setFeaturedStyles] = useState<Hairstyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all active hairstyles and then slice or filter for featured ones
        // Or, if you have a specific way to mark hairstyles as "featured" in your DB,
        // you might create a new action like getFeaturedHairstyles()
        const allStyles = await getHairstyles(); 
        // For now, let's take the first few as "featured"
        setFeaturedStyles(allStyles.slice(0, MAX_FEATURED_STYLES));
      } catch (err) {
        console.error("Error fetching featured hairstyles:", err);
        setError(err instanceof Error ? err.message : "Could not load featured styles.");
      }
      setIsLoading(false);
    };
    fetchFeatured();
  }, []);

  if (isLoading) {
    // Optional: Add a loading state, e.g., skeletons
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Popular Hairstyles</h2>
          <p>Loading popular styles...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Popular Hairstyles</h2>
          <p className="text-destructive">Error: {error}</p>
        </div>
      </section>
    );
  }

  if (featuredStyles.length === 0) {
    // Optional: Message if no featured styles are found (e.g., if all are inactive or DB is empty)
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Popular Hairstyles</h2>
          <p>No popular styles available at the moment.</p>
        </div>
      </section>
    );
  }

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
                  src={(style.image_urls && style.image_urls.length > 0 ? style.image_urls[0] : "/placeholder.svg")}
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
