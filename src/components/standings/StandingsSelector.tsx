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
import { Trophy, Loader2 } from 'lucide-react';
import StandingsTable from '@/components/standings/StandingsTable';
import type { Championship, Match, User } from '@/lib/definitions';
import { calculateStandings } from '@/lib/utils';
import { format } from 'date-fns';
import { getMatchesByChampionshipId } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function StandingsSelector({
  championships,
  users,
}: {
  championships: Championship[];
  users: User[];
}) {
  const { token } = useAuth();
  const [selectedChampionship, setSelectedChampionship] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<string>('all');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  useEffect(() => {
    // Default to the latest season if championships are available
    if (championships.length > 0) {
      const sortedChampionships = [...championships].sort((a, b) => b.name.localeCompare(a.name));
      setSelectedChampionship(sortedChampionships[0].id);
    }
  }, [championships]);

  useEffect(() => {
    if (selectedChampionship && token) {
      const fetchMatches = async () => {
        setIsLoadingMatches(true);
        const matches = await getMatchesByChampionshipId(selectedChampionship, token);
        setFilteredMatches(matches.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsLoadingMatches(false);
      };
      fetchMatches();
    }
  }, [selectedChampionship, token]);

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
    setFilteredMatches([]);
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
          disabled={!selectedChampionship || isLoadingMatches}
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            {isLoadingMatches ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading Games...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select a Game" />
            )}
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
