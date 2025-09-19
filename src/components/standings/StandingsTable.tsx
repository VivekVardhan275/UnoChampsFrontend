'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Standing } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Swords, Trophy, Medal } from 'lucide-react';
import { Badge } from '../ui/badge';

type SortKey = 'rank' | 'name' | 'totalPoints' | 'gamesPlayed' | 'first' | 'second' | 'third';

const SortableHeader = ({
  children,
  sortKey,
  sortConfig,
  requestSort,
}: {
  children: React.ReactNode;
  sortKey: SortKey;
  sortConfig: { key: SortKey; direction: 'ascending' | 'descending' } | null;
  requestSort: (key: SortKey) => void;
}) => {
  const isSorted = sortConfig?.key === sortKey;
  const direction = isSorted ? sortConfig.direction : 'descending';

  return (
    <TableHead>
      <Button variant="ghost" onClick={() => requestSort(sortKey)}>
        {children}
        <ArrowUpDown className={`ml-2 h-4 w-4 ${isSorted ? '' : 'text-muted-foreground'}`} />
      </Button>
    </TableHead>
  );
};

export default function StandingsTable({ initialStandings }: { initialStandings: Standing[] }) {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: 'ascending' | 'descending';
  } | null>(null);

  useEffect(() => {
    // Reset sort when initialStandings change
    setSortConfig(null);
  }, [initialStandings]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedStandings = useMemo(() => {
    let sortableItems = [...initialStandings];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
            case 'name':
                aValue = a.player.name;
                bValue = b.player.name;
                break;
            case 'first':
                aValue = a.finishes.first;
                bValue = b.finishes.first;
                break;
            case 'second':
                aValue = a.finishes.second;
                bValue = b.finishes.second;
                break;
            case 'third':
                aValue = a.finishes.third;
                bValue = b.finishes.third;
                break;
            default:
                aValue = a[sortConfig.key];
                bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [initialStandings, sortConfig]);

  if (sortedStandings.length === 0) {
    return <p className="text-muted-foreground text-center">No standings to display for this selection.</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader sortKey="rank" sortConfig={sortConfig} requestSort={requestSort}>Rank</SortableHeader>
            <TableHead>Player</TableHead>
            <SortableHeader sortKey="totalPoints" sortConfig={sortConfig} requestSort={requestSort}>Total Points</SortableHeader>
            <SortableHeader sortKey="gamesPlayed" sortConfig={sortConfig} requestSort={requestSort}>Games</SortableHeader>
            <SortableHeader sortKey="first" sortConfig={sortConfig} requestSort={requestSort}>1st</SortableHeader>
            <SortableHeader sortKey="second" sortConfig={sortConfig} requestSort={requestSort}>2nd</SortableHeader>
            <SortableHeader sortKey="third" sortConfig={sortConfig} requestSort={requestSort}>3rd</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStandings.map((standing, index) => (
            <TableRow key={standing.player.id}>
              <TableCell className="font-medium text-lg">{standing.rank}</TableCell>
              <TableCell>
                <Link href={`/players/${standing.player.id}`} className="flex items-center gap-3 group">
                  <Avatar>
                    <AvatarImage src={standing.player.avatarUrl} data-ai-hint="person portrait" />
                    <AvatarFallback>{standing.player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium group-hover:text-primary transition-colors">{standing.player.name}</span>
                   {standing.player.role === 'ADMIN' && <Badge variant="secondary">Admin</Badge>}
                </Link>
              </TableCell>
              <TableCell className="font-semibold text-primary text-lg">{standing.totalPoints.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Swords className="h-4 w-4" />
                  <span>{standing.gamesPlayed}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{standing.finishes.first}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Medal className="h-4 w-4 text-slate-400" />
                  <span>{standing.finishes.second}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Medal className="h-4 w-4 text-orange-400" />
                  <span>{standing.finishes.third}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
