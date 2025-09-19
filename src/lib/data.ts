'use server';

import type { User, Match, Championship } from './definitions';

// In a real app, you would fetch this from a database.
// For this example, we use an in-memory store.

let users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', password: 'password123', avatarUrl: 'https://picsum.photos/seed/avatar1/200/200', role: 'ADMIN' },
  { id: '2', name: 'Bob', email: 'bob@example.com', password: 'password123', avatarUrl: 'https://picsum.photos/seed/avatar2/200/200', role: 'PLAYER' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', password: 'password123', avatarUrl: 'https://picsum.photos/seed/avatar3/200/200', role: 'PLAYER' },
  { id: '4', name: 'Diana', email: 'diana@example.com', password: 'password123', avatarUrl: 'https://picsum.photos/seed/avatar4/200/200', role: 'PLAYER' },
  { id: '5', name: 'Eve', email: 'eve@example.com', password: 'password123', avatarUrl: 'https://picsum.photos/seed/avatar5/200/200', role: 'PLAYER' },
];

let matches: Match[] = [
  {
    id: 'match1',
    championshipId: 'championship1',
    date: '2024-07-20T19:00:00Z',
    participants: [
      { userId: '1', rank: 1, points: 100 },
      { userId: '2', rank: 2, points: 50 },
      { userId: '3', rank: 3, points: 25 },
      { userId: '4', rank: 4, points: 10 },
    ],
  },
  {
    id: 'match2',
    championshipId: 'championship1',
    date: '2024-07-21T19:00:00Z',
    participants: [
      { userId: '2', rank: 1, points: 100 },
      { userId: '4', rank: 2, points: 50 },
      { userId: '1', rank: 3, points: 25 },
      { userId: '3', rank: 4, points: 10 },
    ],
  },
  {
    id: 'match3',
    championshipId: 'championship1',
    date: '2024-07-22T19:00:00Z',
    participants: [
      { userId: '3', rank: 1, points: 100 },
      { userId: '1', rank: 2, points: 50 },
      { userId: '2', rank: 3, points: 25 },
      { userId: '4', rank: 4, points: 10 },
    ],
  },
  {
    id: 'match4',
    championshipId: 'championship1',
    date: '2024-07-23T19:00:00Z',
    participants: [
      { userId: '4', rank: 1, points: 100 },
      { userId: '3', rank: 2, points: 50 },
      { userId: '1', rank: 3, points: 25 },
      { userId: '2', rank: 4, points: 10 },
    ],
  },
  {
    id: 'match5',
    championshipId: 'championship1',
    date: '2024-07-24T19:00:00Z',
    participants: [
      { userId: '1', rank: 1, points: 100 },
      { userId: '4', rank: 2, points: 50 },
      { userId: '3', rank: 3, points: 25 },
      { userId: '5', rank: 4, points: 10 },
    ],
  },
];

let championships: Championship[] = [
  { id: 'championship1', name: 'Summer Season 2024' },
];


export async function getUsers(): Promise<User[]> {
  return Promise.resolve(users);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return Promise.resolve(users.find(u => u.id === id));
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return Promise.resolve(users.find(u => u.email === email));
}

export async function getMatches(): Promise<Match[]> {
  return Promise.resolve(matches);
}

export async function getMatchesByUserId(userId: string): Promise<Match[]> {
  return Promise.resolve(matches.filter(m => m.participants.some(p => p.userId === userId)));
}

export async function getChampionships(): Promise<Championship[]> {
  return Promise.resolve(championships);
}

// Note: These mutations would interact with a database in a real application.
// They are simplified for this mock data setup.

export async function addUser(user: Omit<User, 'id' | 'avatarUrl' | 'role'>): Promise<User> {
  const newUser: User = {
    ...user,
    id: (users.length + 2).toString(),
    avatarUrl: `https://picsum.photos/seed/avatar${users.length + 2}/200/200`,
    role: 'PLAYER',
  };
  users.push(newUser);
  return Promise.resolve(newUser);
}

export async function addMatch(match: Omit<Match, 'id'>): Promise<Match> {
  const newMatch: Match = {
    ...match,
    id: `match${matches.length + 2}`,
  };
  matches.push(newMatch);
  return Promise.resolve(newMatch);
}
