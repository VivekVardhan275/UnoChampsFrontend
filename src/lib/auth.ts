import 'server-only';
import { cookies } from 'next/headers';
import type { User } from './definitions';
import { getUserById } from './api';

export const sessionCookieName = 'unostat_session';

type SessionData = {
    userId: string;
    token: string;
    user: User;
}

export async function getSession(): Promise<SessionData | null> {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(sessionCookieName);
    if (!sessionCookie) {
        return null;
    }
    try {
        return JSON.parse(sessionCookie.value);
    } catch (error) {
        console.error('Failed to parse session cookie:', error);
        return null;
    }
}

export async function getUser(): Promise<User | null> {
    const session = await getSession();
    if (!session?.user) {
        return null;
    }
    // You might want to re-validate the user against the DB/API here
    // For now, we trust the cookie's user object.
    return session.user;
}