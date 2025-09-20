import { getUserById, getMatchesByUserId, getMatches, getUsers } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateStandings } from '@/lib/utils';
import { Trophy, Medal, Swords, Hash, Star } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
)

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const player = await getUserById(params.id);
  
  if (!player) {
    notFound();
  }

  const [allUsers, allMatches] = await Promise.all([
      getUsers(),
      getMatches()
  ]);

  const standings = calculateStandings(allMatches, allUsers);
  const playerStanding = standings.find(s => s.player.id === player.id);

  const playerMatches = await getMatchesByUserId(player.id);

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
        </div>
      </div>
      
      {playerStanding && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard icon={<Hash className="h-4 w-4 text-muted-foreground" />} title="Rank" value={playerStanding.rank} />
            <StatCard icon={<Star className="h-4 w-4 text-muted-foreground" />} title="Total Points" value={playerStanding.totalPoints.toLocaleString()} />
            <StatCard icon={<Swords className="h-4 w-4 text-muted-foreground" />} title="Games Played" value={playerStanding.gamesPlayed} />
            <StatCard icon={<Trophy className="h-4 w-4 text-yellow-500" />} title="1st Place" value={playerStanding.finishes.first} />
            <StatCard icon={<Medal className="h-4 w-4 text-slate-400" />} title="2nd Place" value={playerStanding.finishes.second} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
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
                    <TableCell className="font-medium">{participant.rank}</TableCell>
                    <TableCell className="text-primary font-semibold">{participant.points}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
