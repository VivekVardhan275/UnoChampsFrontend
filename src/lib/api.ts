'use server';

import type { Championship, Match, User, MatchToCreate } from './definitions';

// In-memory data store
let users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Alice/200/200' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Bob/200/200' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', role_of_user: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Charlie/200/200' },
    { id: '99', name: 'Admin', email: 'admin@unostat.com', role: 'ADMIN', avatarUrl: 'https://picsum.photos/seed/Admin/200/200' },
];
let matches: Match[] = [];
let championships: Championship[] = [
    { id: '1', name: 'Season 1'},
    { id: '2', name: '2024 Championship'},
];
let nextUserId = 4;
let nextMatchId = 1;
let nextChampionshipId = 3;


export async function getUsers(): Promise<User[]> {
  return Promise.resolve(users);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return Promise.resolve(users.find(u => u.id === id));
}

export async function getMatches(): Promise<Match[]> {
  return Promise.resolve(matches);
}

export async function getMatchById(id: string): Promise<Match | undefined> {
    return Promise.resolve(matches.find(m => m.id === id));
}

export async function getMatchesByUserId(userId: string): Promise<Match[]> {
    return Promise.resolve(matches.filter(m => m.participants.some(p => p.userId === userId)));
}

export async function getMatchesByChampionshipId(championshipId: string): Promise<Match[]> {
    return Promise.resolve(matches.filter(m => m.championshipId === championshipId));
}

export async function getChampionships(): Promise<Championship[]> {
  return Promise.resolve(championships);
}

export async function getChampionshipById(id: string): Promise<Championship | undefined> {
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
        id: (nextChampionshipId++).toString(),
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
