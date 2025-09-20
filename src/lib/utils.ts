import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Match, User, Standing } from '@/lib/definitions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function calculateStandings(matches: Match[], users: User[], championshipId?: string): Standing[] {
  const playerStats: { [key: string]: { totalPoints: number; gamesPlayed: number; finishes: { [key: number]: number } } } = {};

  // If a championshipId is provided, filter matches by it. Otherwise, use all provided matches.
  const filteredMatches = championshipId ? matches.filter(m => m.championshipId === championshipId) : matches;

  const relevantUserIds = new Set<string>();
  filteredMatches.forEach(match => {
    match.participants.forEach(p => relevantUserIds.add(p.userId));
  });

  // Instead of filtering the passed-in 'users', get the user objects that correspond to the participants
  // in the filtered matches. This is crucial for single-game views.
  const relevantUsers = users.filter(u => relevantUserIds.has(u.id));

  // Initialize stats for only the players who are in the relevant matches.
  relevantUsers.forEach(user => {
    playerStats[user.id] = {
      totalPoints: 0,
      gamesPlayed: 0,
      finishes: {},
    };
  });

  // Tally stats from the filtered matches.
  filteredMatches.forEach(match => {
    match.participants.forEach(participant => {
      // Only process participants who are in our list of relevant users.
      if (playerStats[participant.userId]) {
        playerStats[participant.userId].totalPoints += participant.points;
        playerStats[participant.userId].gamesPlayed += 1;
        
        const rank = participant.rank;
        playerStats[participant.userId].finishes[rank] = (playerStats[participant.userId].finishes[rank] || 0) + 1;
      }
    });
  });

  let standings: Omit<Standing, 'rank'>[] = relevantUsers
    .map(user => {
        const stats = playerStats[user.id];
        // Only include players who have actually played a game in the selection.
        if (!stats || stats.gamesPlayed === 0) return null;

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
    })
    .filter((s): s is Omit<Standing, 'rank'> => s !== null);


  const maxRank = Math.max(...filteredMatches.flatMap(m => m.participants.map(p => p.rank)), 0);

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
