import 'server-only';
import { cookies } from 'next/headers';
import { getUserById } from './data';
import type { User } from './definitions';

export const sessionCookieName = 'unostat_session';

export async function getUser(): Promise<User | null> {
  const cookieStore = cookies();
  const session = cookieStore.get(sessionCookieName);
  
  if (!session?.value) {
    return null;
  }
  
  try {
    const { userId } = JSON.parse(session.value);
    if (!userId) {
      return null;
    }
    const user = await getUserById(userId);
    return user || null;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    return null;
  }
}
