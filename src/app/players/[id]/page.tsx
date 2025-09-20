'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateStandings } from '@/lib/utils';
import { Trophy, Medal, Swords, Hash, Star } from 'lucide-react';
import { format } from 'date-fns';
import { getMatches, getUserById, getMatchesByChampionshipId, getUsers } from '@/lib/api';
import { Match, Standing, User } from '@/lib/definitions';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ icon, title, value, isLoading }: { icon: React.ReactNode, title: string, value?: string | number, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
             {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

const LoadingSkeleton = () => (
     <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
)

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const seasonId = searchParams.get('season');
  const { token, isLoading: isAuthLoading } = useAuth();
  
  const [player, setPlayer] = useState<User | null>(null);
  const [playerStanding, setPlayerStanding] = useState<Standing | null>(null);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedPlayer = await getUserById(params.id);
        if (!fetchedPlayer) {
          notFound();
          return;
        }
        setPlayer(fetchedPlayer);

        let matches: Match[] = [];
        let users: User[] = [];

        if (seasonId && token) {
            const seasonData = await getMatchesByChampionshipId(seasonId, token);
            matches = seasonData.matches;
            users = seasonData.users;
        } else {
            matches = await getMatches();
            users = await getUsers();
        }

        const filteredMatches = matches.filter(m => m.participants.some(p => p.userId === fetchedPlayer.id));
        setPlayerMatches(filteredMatches);
        
        const standings = calculateStandings(matches, users);
        const standing = standings.find(s => s.player.id === fetchedPlayer.id);
        setPlayerStanding(standing || null);

      } catch (error) {
        console.error("Failed to fetch player data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

  }, [params.id, seasonId, token, isAuthLoading]);

  if (isLoading || isAuthLoading || !player) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary">
          <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="person portrait" />
          <AvatarFallback className="text-5xl">{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{player.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{player.email}</p>
          {seasonId && <p className="mt-1 text-md font-semibold text-primary">Stats for: {decodeURIComponent(seasonId)}</p>}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard isLoading={isLoading} icon={<Hash className="h-4 w-4 text-muted-foreground" />} title="Rank" value={playerStanding?.rank ?? 'N/A'} />
            <StatCard isLoading={isLoading} icon={<Star className="h-4 w-4 text-muted-foreground" />} title="Total Points" value={playerStanding?.totalPoints.toLocaleString() ?? 0} />
            <StatCard isLoading={isLoading} icon={<Swords className="h-4 w-4 text-muted-foreground" />} title="Games Played" value={playerStanding?.gamesPlayed ?? 0} />
            <StatCard isLoading={isLoading} icon={<Trophy className="h-4 w-4 text-yellow-500" />} title="1st Place" value={playerStanding?.finishes.first ?? 0} />
            <StatCard isLoading={isLoading} icon={<Medal className="h-4 w-4 text-slate-400" />} title="2nd Place" value={playerStanding?.finishes.second ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match History {seasonId ? `(in ${decodeURIComponent(seasonId)})` : '(All Time)'}</CardTitle>
        </CardHeader>
        <CardContent>
          {playerMatches.length > 0 ? (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Points Awarded</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {playerMatches.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(match => {
                    const participant = match.participants.find(p => p.userId === player.id);
                    if (!participant) return null;
                    return (
                    <TableRow key={match.id}>
                        <TableCell>{format(new Date(match.date), 'MMMM d, yyyy')}</TableCell>
                        <TableCell className="font-medium">{match.name}</TableCell>
                        <TableCell className="font-medium">{participant.rank}</TableCell>
                        <TableCell className="text-primary font-semibold">{participant.points}</TableCell>
                    </TableRow>
                    )
                })}
                </TableBody>
            </Table>
          ) : (
             <p className="text-muted-foreground text-center">No matches played in this period.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
