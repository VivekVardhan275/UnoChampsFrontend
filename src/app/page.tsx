'use client';
import { getUsers, getChampionships } from '@/lib/api';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import StandingsSelector from '@/components/standings/StandingsSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Championship, Match, User } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<{
    users: User[];
    championships: Championship[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        redirect('/login');
      } else if (user.role === 'ADMIN') {
        redirect('/admin');
      } else {
        const fetchData = async () => {
          try {
            // Fetch users (mocked) and championships (real API)
            const [users, championships] = await Promise.all([
              getUsers(),
              getChampionships(token),
            ]);
            setData({ users, championships });
          } catch (error) {
            console.error("Failed to fetch page data", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchData();
      }
    }
  }, [user, isAuthLoading, token]);

  if (isAuthLoading || isLoading || !data) {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 w-full sm:w-[280px]" />
                <Skeleton className="h-10 w-full sm:w-[280px]" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Championship Standings
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Select a season to see who's dominating the league.
        </p>
      </div>

      <StandingsSelector
        championships={data.championships}
        users={data.users}
      />
    </div>
  );
}
