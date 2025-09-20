'use server';

import axios from 'axios';
import type { Championship, Match, User, MatchToCreate } from './definitions';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// In-memory data store for non-auth data
let users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Alice/200/200' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Bob/200/200' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Charlie/200/200' },
    { id: '99', name: 'Admin', email: 'admin@unostat.com', role: 'ADMIN', avatarUrl: 'https://picsum.photos/seed/Admin/200/200' },
];
let championships: Championship[] = [];
let matches: Match[] = [
    {
        id: '101',
        name: 'Game 1',
        championshipId: 'Season 1',
        date: new Date('2024-05-10').toISOString(),
        participants: [
            { userId: '1', rank: 1, points: 20 },
            { userId: '2', rank: 2, points: 10 },
            { userId: '3', rank: 3, points: 0 },
        ]
    },
    {
        id: '102',
        name: 'Game 2',
        championshipId: 'Season 1',
        date: new Date('2024-05-12').toISOString(),
        participants: [
            { userId: '3', rank: 1, points: 20 },
            { userId: '1', rank: 2, points: 10 },
            { userId: '2', rank: 3, points: 0 },
        ]
    },
    {
        id: '103',
        name: 'Tournament Opener',
        championshipId: '2024 Championship',
        date: new Date('2024-06-01').toISOString(),
        participants: [
            { userId: '2', rank: 1, points: 10 },
            { userId: '1', rank: 2, points: 0 },
        ]
    }
];

let nextUserId = 100;
let nextMatchId = 104;
let nextChampionshipId = 3;


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

export async function getMatchesByChampionshipId(championshipId: string): Promise<Match[]> {
    const championshipMatches = matches.filter(m => m.championshipId === championshipId);

    const matchesWithUsers = await Promise.all(championshipMatches.map(async (match) => {
        const participantsWithUsers = await Promise.all(match.participants.map(async (p) => {
            const user = await getUserById(p.userId);
            return { ...p, user: user! };
        }));
        return { ...match, participants: participantsWithUsers };
    }));

    return Promise.resolve(matchesWithUsers);
}

export async function getChampionships(token?: string | null): Promise<Championship[]> {
    if (!token) {
        console.error("Authentication token is missing.");
        return Promise.resolve([
            { id: 'Season 1', name: 'Season 1'},
            { id: '2024 Championship', name: '2024 Championship'},
        ]);
    }

    try {
        const response = await axios.get(`${backendUrl}/api/seasons/get-seasons`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const seasons = response.data.map((season: { seasonName: string }) => ({
            id: season.seasonName,
            name: season.seasonName,
        }));
        return seasons;
    } catch (error) {
        console.error('Failed to fetch championships:', error);
        return [];
    }
}

export async function getChampionshipById(id: string): Promise<Championship | undefined> {
    // This will now filter the hardcoded championships. To make it work with the API,
    // we would need a getChampionshipById endpoint. For now, it uses mock data.
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

export async function findOrCreateUserByName(name: string): Promise<User> {
    let user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) {
        user = {
            id: (nextUserId++).toString(),
            name: name,
            email: `${name.toLowerCase().replace(/\s/g, '')}@example.com`,
            role: 'PLAYER',
            avatarUrl: `https://picsum.photos/seed/${name}/200/200`
        };
        users.push(user);
    }
    return Promise.resolve(user);
}

export async function getUsersByName(names: string[]): Promise<User[]> {
    const lowercasedNames = names.map(n => n.toLowerCase());
    return Promise.resolve(users.filter(u => lowercasedNames.includes(u.name.toLowerCase())));
}
