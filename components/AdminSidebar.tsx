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
        <Link href="/admin/users" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary rounded-md">
          Users
        </Link>
        <Link href="/admin/settings" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary rounded-md">
          Settings
        </Link>
        {/* Add more admin links as needed */}
      </nav>
    </div>
  );
} 