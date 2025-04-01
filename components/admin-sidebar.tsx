import Link from "next/link"
import { Calendar, Home, Image, Settings, Users, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Scissors } from "lucide-react"

export function AdminSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <Scissors className="h-6 w-6" />
            <span>StyleSync Admin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link href="/admin/dashboard" passHref>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/appointments" passHref>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                Appointments
              </Button>
            </Link>
            <Link href="/admin/hairstyles" passHref>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Image className="h-4 w-4" />
                Hairstyles
              </Button>
            </Link>
            <Link href="/admin/customers" passHref>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Customers
              </Button>
            </Link>
            <Link href="/admin/email" passHref>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </Link>
            <Link href="/admin/settings" passHref>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link href="/admin/settings/appointment-policy" passHref>
              <Button variant="ghost" className="w-full justify-start gap-2 pl-8 text-xs">
                Appointment Policy
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

