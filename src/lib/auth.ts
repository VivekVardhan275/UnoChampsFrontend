import 'server-only';
import { cookies } from 'next/headers';
import type { User } from './definitions';

export const sessionCookieName = 'unostat_session';

// This type now represents what we store in localStorage on the client.
export type SessionData = {
    userId: string;
    token: string;
    user: User;
}

// This function will now only be used by server components that might need it,
// but the primary source of truth for auth state will be client-side.
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

// This function is for server components to get user info if needed.
export async function getUser(): Promise<User | null> {
    const session = await getSession();
    if (!session?.user) {
        return null;
    }
    return session.user;
}
