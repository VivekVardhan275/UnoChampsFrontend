'use client';
import { getMatches, getUsers, getChampionships } from '@/lib/api';
import StandingsSelector from '@/components/standings/StandingsSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Championship, Match, User } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminStandingsPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<{
    users: User[];
    matches: Match[];
    championships: Championship[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    if (!isAuthLoading && token) {
      const fetchData = async () => {
        try {
          const [users, matches, championships] = await Promise.all([
            getUsers(),
            getMatches(),
            getChampionships(token),
          ]);
          setData({ users, matches, championships });
        } catch (error) {
          console.error("Failed to fetch page data", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else if (!isAuthLoading && !token) {
      // Handle case where there is no token but auth is not loading
      setIsLoading(false);
    }
  }, [isAuthLoading, token]);


  if (isLoading || isAuthLoading) {
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
          Select a season and a game to see who's dominating the league.
        </p>
      </div>

      <StandingsSelector
        championships={data?.championships || []}
        matches={data?.matches || []}
        users={data?.users || []}
      />
    </div>
  );
}
