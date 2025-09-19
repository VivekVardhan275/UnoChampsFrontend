import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ListPlus, Shield } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="hidden md:flex flex-col gap-2 sticky top-20">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5"/>
                Admin Panel
            </h2>
            <nav className="flex flex-col gap-1">
                <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/admin">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                    </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/admin/log-match">
                        <ListPlus className="mr-2 h-4 w-4" />
                        Log Match Result
                    </Link>
                </Button>
            </nav>
        </aside>
        <div className="w-full">
            {children}
        </div>
    </div>
  );
}
