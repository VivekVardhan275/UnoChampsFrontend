'use client';

import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import StandingsTable from '@/components/standings/StandingsTable';
import type { Championship, Match, User } from '@/lib/definitions';
import { calculateStandings } from '@/lib/utils';

export default function StandingsSelector({
  championships,
  matches,
  users,
}: {
  championships: Championship[];
  matches: Match[];
  users: User[];
}) {
  const [selectedChampionship, setSelectedChampionship] = useState<string>(
    championships[0]?.id || ''
  );
  const [selectedMatch, setSelectedMatch] = useState<string>('all'); // 'all' for season standings

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => match.championshipId === selectedChampionship);
  }, [matches, selectedChampionship]);

  const standings = useMemo(() => {
    let matchesToCalculate: Match[] = [];
    if (selectedMatch === 'all') {
      matchesToCalculate = filteredMatches;
    } else {
      const match = filteredMatches.find((m) => m.id === selectedMatch);
      if (match) {
        matchesToCalculate = [match];
      }
    }
    const calculated = calculateStandings(matchesToCalculate, users);
    return calculated.sort((a, b) => a.rank - b.rank);

  }, [selectedChampionship, selectedMatch, filteredMatches, users]);

  const handleChampionshipChange = (championshipId: string) => {
    setSelectedChampionship(championshipId);
    setSelectedMatch('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedChampionship}
          onValueChange={handleChampionshipChange}
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select a Season" />
          </SelectTrigger>
          <SelectContent>
            {championships.map((championship) => (
              <SelectItem key={championship.id} value={championship.id}>
                {championship.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedMatch}
          onValueChange={setSelectedMatch}
          disabled={!selectedChampionship}
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select a Game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games (Season Standings)</SelectItem>
            {filteredMatches.map((match, index) => (
              <SelectItem key={match.id} value={match.id}>
                Game #{index + 1} - {new Date(match.date).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-accent" />
            {selectedMatch === 'all'
              ? 'Current Season Leaderboard'
              : `Game #${filteredMatches.findIndex(m => m.id === selectedMatch) + 1} Results`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StandingsTable initialStandings={standings} />
        </CardContent>
      </Card>
    </div>
  );
}
