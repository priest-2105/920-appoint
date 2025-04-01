import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin-sidebar"

export const metadata: Metadata = {
  title: "Admin Dashboard - StyleSync",
  description: "Manage your hairstyle booking business",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/admin/dashboard" className="lg:hidden">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Site</Link>
            </Button>
            <Button variant="ghost" size="sm">
              Logout
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
      </div>
    </div>
  )
}

