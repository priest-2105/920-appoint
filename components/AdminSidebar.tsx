import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';

export default function AdminSidebar() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="w-64 h-screen sticky top-0 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex flex-col p-4 space-y-1">
        <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md">
          Dashboard
        </Link>
       
        <Link href="/admin/hairstyles" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary rounded-md">
          Manage Hairstyles
        </Link>  

        <Link href="/admin/appointments" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary rounded-md">
          Appointments
        </Link>

        <Link href="/admin/email" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary rounded-md">
          Email
        </Link> 
        
        <Link href="/admin/settings/appointment-policy" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary rounded-md">
          Appointment Policy
      </Link>

        <Link href="/admin/settings/google-calendar" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary rounded-md">
        Calendar
        </Link>
      </nav>
    </div>
  );
} 