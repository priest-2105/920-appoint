import Link from "next/link"
import { Scissors } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 md:py-12">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6" />
          <span className="font-bold">920Appoint</span>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy
          </Link>
          <Link href="/appointment-policy" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Appointment Policy
          </Link>
          <Link href="/contact" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Contact
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} 920Appoint. All rights reserved.</p>
      </div>
    </footer>
  )
}
