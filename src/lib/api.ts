'use server';

import type { Championship, Match, User, MatchToCreate } from './definitions';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('unostat_session');
    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            return session.token;
        } catch (error) {
            console.error('Failed to parse session cookie:', error);
            return undefined;
        }
    }
    return undefined;
}


async function fetcher(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${endpoint}`;
    const token = await getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error on ${endpoint}: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        // Handle cases where response might be empty
        const text = await response.text();
        return text ? JSON.parse(text) : null;

    } catch (error) {
        console.error(`Network or fetch error for endpoint ${endpoint}:`, error);
        throw new Error(`Network error when fetching ${endpoint}.`);
    }
}


export async function getUsers(): Promise<User[]> {
  return fetcher('/api/players');
}

export async function getUserById(id: string): Promise<User | undefined> {
  return fetcher(`/api/players/${id}`);
}

export async function getMatches(): Promise<Match[]> {
  return fetcher('/api/matches');
}

export async function getMatchById(id: string): Promise<Match | undefined> {
    return fetcher(`/api/matches/${id}`);
}

export async function getMatchesByUserId(userId: string): Promise<Match[]> {
    return fetcher(`/api/matches/player/${userId}`);
}

export async function getMatchesByChampionshipId(championshipId: string): Promise<Match[]> {
    return fetcher(`/api/matches/championship/${championshipId}`);
}

export async function getChampionships(): Promise<Championship[]> {
  return fetcher('/api/championships');
}

export async function getChampionshipById(id: string): Promise<Championship | undefined> {
    return fetcher(`/api/championships/${id}`);
}

export async function addMatch(match: MatchToCreate): Promise<Match> {
    return fetcher('/api/matches', {
        method: 'POST',
        body: JSON.stringify(match)
    });
}

export async function updateMatch(id: string, data: Partial<MatchToCreate>): Promise<Match> {
    return fetcher(`/api/matches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export async function deleteMatch(id: string): Promise<void> {
    return fetcher(`/api/matches/${id}`, { method: 'DELETE' });
}

export async function addChampionship(name: string): Promise<Championship> {
    return fetcher('/api/championships', {
        method: 'POST',
        body: JSON.stringify({ name })
    });
}

export async function updateChampionship(id: string, name: string): Promise<Championship> {
    return fetcher(`/api/championships/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
    });
}

export async function deleteChampionship(id: string): Promise<void> {
    return fetcher(`/api/championships/${id}`, { method: 'DELETE' });
}

// These functions from the old data.ts are related to user creation during match logging
// and need a backend endpoint. Assuming a simple endpoint for finding/creating users.
// We'll stub this for now and it would need to be implemented on the backend.
export async function findOrCreateUserByName(name: string): Promise<User> {
    // This function would ideally be a single API call to a dedicated endpoint
    // For now, we simulate it, but this is not robust.
    // A proper backend would handle the "find or create" logic atomically.
    const users = await getUsers();
    let user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (user) {
        return user;
    }
    // This part is problematic without a proper user creation endpoint that isn't registration
    // Assuming a generic /api/users endpoint for creation for now.
    return fetcher('/api/users', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function getUsersByName(names: string[]): Promise<User[]> {
    // Assuming the backend can handle a query like this.
    // e.g., /api/users?names=name1,name2
    const query = new URLSearchParams(names.map(n => ['name', n])).toString();
    return fetcher(`/api/users/by-names?${query}`);
}