import { getMatches, getUsers } from '@/lib/data';
import { calculateStandings } from '@/lib/utils';
import StandingsTable from '@/components/standings/StandingsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default async function Home() {
  const users = await getUsers();
  const matches = await getMatches();
  const standings = calculateStandings(matches, users);

  // Default sort: last to first
  const sortedStandings = standings.sort((a, b) => b.rank - a.rank);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Championship Standings
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Track your progress and see who's dominating the league.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-accent" />
            Current Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StandingsTable initialStandings={sortedStandings} />
        </CardContent>
      </Card>
    </div>
  );
}
