"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define a Hairstyle type (ensure this matches the structure from getHairstyles)
interface Hairstyle {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  image_urls: string[];
  // Add other relevant fields if needed, e.g., description, materials
}

interface HairstylesDisplayProps {
  initialHairstyles: Hairstyle[];
}

export function HairstylesDisplay({ initialHairstyles }: HairstylesDisplayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [displayedHairstyles, setDisplayedHairstyles] = useState<Hairstyle[]>(initialHairstyles);

  const categories = useMemo(() => {
    const allCategories = initialHairstyles.map(style => style.category);
    return ["all", ...Array.from(new Set(allCategories))];
  }, [initialHairstyles]);

  useEffect(() => {
    let filtered = initialHairstyles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(style =>
        style.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(style => style.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "duration":
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      default:
        break;
    }
    setDisplayedHairstyles(filtered);
  }, [searchTerm, selectedCategory, sortBy, initialHairstyles]);

  return (
    <>
      <div className="mx-auto max-w-5xl py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input 
              id="search" 
              placeholder="Search hairstyles..." 
              className="mt-1" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sort">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
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
        {displayedHairstyles.length > 0 ? (
          displayedHairstyles.map((style) => (
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
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">No hairstyles match your current filters.</p>
        )}
      </div>
    </>
  );
} 