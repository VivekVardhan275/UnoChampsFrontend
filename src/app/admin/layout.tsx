'use client';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ListPlus, Shield, SlidersHorizontal, Swords, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      redirect('/');
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8">
        <aside className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight flex items-center justify-center gap-2 mb-2 border-b pb-2">
                <Shield className="h-5 w-5"/>
                Admin Panel
            </h2>
            <nav className="grid grid-cols-2 sm:flex sm:flex-row sm:justify-center gap-2">
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
                <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/admin/seasons">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Manage Seasons
                    </Link>
                </Button>
                 <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/admin/standings">
                        <Swords className="mr-2 h-4 w-4" />
                        View Standings
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
