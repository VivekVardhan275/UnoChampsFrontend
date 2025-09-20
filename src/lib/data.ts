'use server';

import type { User, Match, Championship, MatchToCreate } from './definitions';

// In a real app, you would fetch this from a database.
// For this example, we use an in-memory store.

let users: User[] = [];

let matches: Match[] = [];

let championships: Championship[] = [];


export async function getUsers(): Promise<User[]> {
  return Promise.resolve(users);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return Promise.resolve(users.find(u => u.id === id));
}

export async function getUserByName(name: string): Promise<User | undefined> {
    return Promise.resolve(users.find(u => u.name.toLowerCase() === name.toLowerCase()));
}

export async function getUsersByName(names: string[]): Promise<User[]> {
    const lowerCaseNames = names.map(name => name.toLowerCase());
    return Promise.resolve(users.filter(u => lowerCaseNames.includes(u.name.toLowerCase())));
}


export async function getUserByEmail(email: string): Promise<User | undefined> {
  return Promise.resolve(users.find(u => u.email === email));
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
  // sort by name descending
  return Promise.resolve(championships.sort((a,b) => b.name.localeCompare(a.name)));
}

export async function getChampionshipById(id: string): Promise<Championship | undefined> {
    return Promise.resolve(championships.find(c => c.id === id));
}

// Note: These mutations would interact with a database in a real application.
// They are simplified for this mock data setup.

export async function addUser(user: Omit<User, 'id' | 'avatarUrl' | 'role'>): Promise<User> {
  const newUser: User = {
    ...user,
    id: (users.length + 2).toString(),
    email: user.email || `${user.name.toLowerCase().replace(/\s/g, '')}@example.com`,
    avatarUrl: `https://picsum.photos/seed/people${users.length + 2}/200/200`,
    role: 'PLAYER',
  };
  users.push(newUser);
  return Promise.resolve(newUser);
}

export async function findOrCreateUserByName(name: string): Promise<User> {
    let user = await getUserByName(name);
    if (!user) {
        user = await addUser({ name, email: '' }); // email is auto-generated
    }
    return user;
}


export async function addMatch(match: MatchToCreate): Promise<Match> {
  const newMatch: Match = {
    ...match,
    id: `match${matches.length + 2}`,
  };
  matches.push(newMatch);
  return Promise.resolve(newMatch);
}

export async function updateMatch(id: string, data: MatchToCreate): Promise<Match> {
    const index = matches.findIndex(m => m.id === id);
    if (index === -1) {
        throw new Error("Match not found");
    }
    matches[index] = { ...matches[index], ...data };
    return Promise.resolve(matches[index]);
}


export async function addChampionship(name: string): Promise<Championship> {
    const newChampionship: Championship = {
        id: `championship${championships.length + 2}`,
        name,
    };
    championships.push(newChampionship);
    return Promise.resolve(newChampionship);
}

export async function updateChampionship(id: string, name: string): Promise<Championship> {
    const index = championships.findIndex(c => c.id === id);
    if (index === -1) {
        throw new Error('Championship not found');
    }
    championships[index].name = name;
    return Promise.resolve(championships[index]);
}

export async function deleteChampionship(id: string): Promise<{ success: boolean }> {
    const hasMatches = matches.some(match => match.championshipId === id);
    if (hasMatches) {
        throw new Error('Cannot delete a season with existing matches.');
    }
    const index = championships.findIndex(c => c.id === id);
    if (index === -1) {
        throw new Error('Championship not found');
    }
    championships.splice(index, 1);
    return Promise.resolve({ success: true });
}

export async function deleteMatch(id: string): Promise<{ success: boolean }> {
    const index = matches.findIndex(match => match.id === id);
    if (index === -1) {
        throw new Error('Match not found');
    }
    matches.splice(index, 1);
    return Promise.resolve({ success: true });
}
