'use server';

import type { Championship, Match, User, MatchToCreate } from './definitions';
import { getSession } from './auth';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        // This is a server-side interceptor. It will only work in server components/actions
        // For client-side requests, the token needs to be added there.
        // We will adapt this once we see where it's called from.
        const session = await getSession();
        if (session?.token) {
            config.headers.Authorization = `Bearer ${session.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


async function fetcher(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${endpoint}`;
    
    // We are switching to client-side auth, so server-side token fetching needs adjustment.
    // Let's rely on the components to provide the token for now where needed.
    // For server components, this will become an issue if they need auth.

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    const session = await getSession(); // This will only work on the server
    if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error on ${endpoint}: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
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

export async function findOrCreateUserByName(name: string): Promise<User> {
    return fetcher('/api/users', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function getUsersByName(names: string[]): Promise<User[]> {
    const query = new URLSearchParams(names.map(n => ['name', n])).toString();
    return fetcher(`/api/users/by-names?${query}`);
}

