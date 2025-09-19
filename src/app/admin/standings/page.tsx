import { getMatches, getUsers, getChampionships } from '@/lib/data';
import StandingsSelector from '@/components/standings/StandingsSelector';

export default async function AdminStandingsPage() {
  const users = await getUsers();
  const matches = await getMatches();
  const championships = await getChampionships();

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
        championships={championships}
        matches={matches}
        users={users}
      />
    </div>
  );
}
