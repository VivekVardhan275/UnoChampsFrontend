'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { format } from 'date-fns';

export default function StandingsSelector({
  championships,
  matches,
  users,
}: {
  championships: Championship[];
  matches: Match[];
  users: User[];
}) {
  const [selectedChampionship, setSelectedChampionship] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<string>('all'); // 'all' for season standings

  useEffect(() => {
    // Default to the latest season if championships are available
    if (championships.length > 0) {
      // Assuming the last one in the list is the latest.
      // If there's a date field, sorting by it would be more reliable.
      setSelectedChampionship(championships[championships.length - 1].id);
    }
  }, [championships]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => match.championshipId === selectedChampionship)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
  
  const selectedMatchObject = filteredMatches.find(m => m.id === selectedMatch);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedChampionship}
          onValueChange={handleChampionshipChange}
          disabled={championships.length === 0}
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
            {filteredMatches.map((match) => (
              <SelectItem key={match.id} value={match.id}>
                {match.name} - {format(new Date(match.date), 'MMM d, yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-primary" />
            {selectedMatch === 'all'
              ? 'Current Season Leaderboard'
              : selectedMatchObject?.name ? `${selectedMatchObject.name} Results` : 'Game Results'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StandingsTable 
            initialStandings={standings} 
            isSeasonStandings={selectedMatch === 'all'} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
