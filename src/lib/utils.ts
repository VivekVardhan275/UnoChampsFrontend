import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Match, User, Standing } from '@/lib/definitions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function calculateStandings(matches: Match[], users: User[]): Standing[] {
  const playerStats: { [key: string]: { totalPoints: number; gamesPlayed: number; finishes: { [key: number]: number } } } = {};

  users.forEach(user => {
    playerStats[user.id] = {
      totalPoints: 0,
      gamesPlayed: 0,
      finishes: {},
    };
  });

  matches.forEach(match => {
    match.participants.forEach(participant => {
      if (playerStats[participant.userId]) {
        playerStats[participant.userId].totalPoints += participant.points;
        playerStats[participant.userId].gamesPlayed += 1;
        
        const rank = participant.rank;
        playerStats[participant.userId].finishes[rank] = (playerStats[participant.userId].finishes[rank] || 0) + 1;
      }
    });
  });

  let standings: Omit<Standing, 'rank'>[] = users
    .filter(user => playerStats[user.id] && playerStats[user.id].gamesPlayed > 0)
    .map(user => {
      const stats = playerStats[user.id];
      return {
        player: user,
        totalPoints: stats.totalPoints,
        gamesPlayed: stats.gamesPlayed,
        finishes: {
          first: stats.finishes[1] || 0,
          second: stats.finishes[2] || 0,
          third: stats.finishes[3] || 0,
        },
        finishMap: stats.finishes,
      };
    });

  const maxRank = Math.max(...matches.flatMap(m => m.participants.map(p => p.rank)), 0);

  standings.sort((a, b) => {
    // 1. Sort by total points (descending)
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    // 2. Tie-breaker: "countback"
    for (let i = 1; i <= maxRank; i++) {
      const aFinishes = a.finishMap[i] || 0;
      const bFinishes = b.finishMap[i] || 0;
      if (bFinishes !== aFinishes) {
        return bFinishes - aFinishes;
      }
    }
    
    return a.player.name.localeCompare(b.player.name);
  });
  
  return standings.map((standing, index) => ({
    ...standing,
    rank: index + 1,
  }));
}
