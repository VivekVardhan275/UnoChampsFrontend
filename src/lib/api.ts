'use server';

import axios from 'axios';
import type { Championship, Match, User, MatchToCreate } from './definitions';
import { findOrCreateUserByName } from './actions';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

// In-memory data store for non-auth data
let users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Alice/200/200' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Bob/200/200' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Charlie/200/200' },
    { id: '99', name: 'Admin', email: 'admin@unostat.com', role: 'ADMIN', avatarUrl: 'https://picsum.photos/seed/Admin/200/200' },
];
let championships: Championship[] = [];
let matches: Match[] = [];

let nextUserId = 100;
let nextMatchId = 104;


export async function getUsers(): Promise<User[]> {
  // In a real app, you'd fetch this from your backend
  return Promise.resolve(users.filter(u => u.role === 'PLAYER'));
}

export async function getUserById(id: string): Promise<User | undefined> {
  return Promise.resolve(users.find(u => u.id === id));
}

export async function getMatches(): Promise<Match[]> {
  return Promise.resolve(matches);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
    const match = matches.find(m => m.id === id);
    if (!match) return undefined;
    
    const participantUsers = await Promise.all(match.participants.map(p => getUserById(p.userId)));
    
    return Promise.resolve({
        ...match,
        participants: match.participants.map((p, i) => ({
            ...p,
            user: participantUsers[i]!
        }))
    });
}

export async function getMatchesByUserId(userId: string): Promise<Match[]> {
    return Promise.resolve(matches.filter(m => m.participants.some(p => p.userId === userId)));
}

type ApiGame = {
    gameName: string;
    season: { seasonName: string };
    members: string[];
    ranks: string[];
    points: string[];
};

export async function getMatchesByChampionshipId(championshipId: string, token: string | null): Promise<Match[]> {
    if (!token) {
        console.error("Authentication token is missing for getMatchesByChampionshipId.");
        return [];
    }

    try {
        const response = await axios.get(`${backendUrl}/api/season/games/get-games`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { season: championshipId }
        });

        if (!response.data || !Array.isArray(response.data)) {
            console.error('API did not return an array of games.');
            return [];
        }

        const apiGames: ApiGame[] = response.data;
        
        const transformedMatches: Match[] = await Promise.all(apiGames.map(async (game) => {
            const participants = [];
            for (let i = 0; i < game.members.length; i++) {
                const memberName = game.members[i];
                const rank = parseInt(game.ranks[i], 10);
                const points = parseInt(game.points[i], 10);
                const user = await findOrCreateUserByName(memberName);
                participants.push({
                    userId: user.id,
                    rank: rank,
                    points: points,
                });
            }
            
            const dateMatch = game.gameName.match(/(\d{2}\/\d{2}\/\d{4})/);
            let date = new Date();
            if (dateMatch) {
                const [day, month, year] = dateMatch[0].split('/');
                date = new Date(`${year}-${month}-${day}`);
            }

            return {
                id: `${championshipId}-${game.gameName}`,
                name: game.gameName,
                championshipId: championshipId,
                date: date.toISOString(),
                participants: participants,
            };
        }));
        
        return transformedMatches;
    } catch (error) {
        console.error('Failed to fetch games for season:', error);
        return [];
    }
}

export async function getChampionships(token?: string | null): Promise<Championship[]> {
    if (!token) {
        console.error("Authentication token is missing.");
        return [];
    }

    try {
        const response = await axios.get(`${backendUrl}/api/seasons/get-seasons`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const seasons: Championship[] = response.data.map((season: { seasonName: string }) => ({
            id: season.seasonName,
            name: season.seasonName,
        }));
        // Update mock championships so other functions can see them
        championships = seasons;
        return seasons;
    } catch (error) {
        console.error('Failed to fetch championships:', error);
        return []
    }
}

export async function getChampionshipById(id: string): Promise<Championship | undefined> {
    // This function will now have to rely on the championships fetched by getChampionships
    return Promise.resolve(championships.find(c => c.id === id));
}

export async function addMatch(match: MatchToCreate): Promise<Match> {
    const newMatch: Match = {
        ...match,
        id: (nextMatchId++).toString(),
    };
    matches.push(newMatch);
    return Promise.resolve(newMatch);
}

export async function updateMatch(id: string, data: Partial<MatchToCreate>): Promise<Match> {
    const matchIndex = matches.findIndex(m => m.id === id);
    if (matchIndex === -1) {
        throw new Error("Match not found");
    }
    const updatedMatch = { ...matches[matchIndex], ...data };
    matches[matchIndex] = updatedMatch;
    return Promise.resolve(updatedMatch);
}

export async function deleteMatch(id: string): Promise<void> {
    matches = matches.filter(m => m.id !== id);
    return Promise.resolve();
}

export async function addChampionship(name: string): Promise<Championship> {
    const newChampionship: Championship = {
        id: name, // Using name as ID for consistency with GET endpoint
        name,
    };
    championships.push(newChampionship);
    return Promise.resolve(newChampionship);
}

export async function updateChampionship(id: string, name: string): Promise<Championship> {
    const champIndex = championships.findIndex(c => c.id === id);
    if (champIndex === -1) {
        throw new Error("Championship not found.");
    }
    championships[champIndex].name = name;
    championships[champIndex].id = name;
    return Promise.resolve(championships[champIndex]);
}

export async function deleteChampionship(id: string): Promise<void> {
    if (matches.some(m => m.championshipId === id)) {
        throw new Error("Cannot delete a season with matches associated with it.");
    }
    championships = championships.filter(c => c.id !== id);
    return Promise.resolve();
}

export async function getUsersByName(names: string[]): Promise<User[]> {
    const lowercasedNames = names.map(n => n.toLowerCase());
    return Promise.resolve(users.filter(u => lowercasedNames.includes(u.name.toLowerCase())));
}
