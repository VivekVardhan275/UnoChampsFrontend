'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getUserByEmail, addUser, addMatch } from './data';
import { sessionCookieName } from './auth';
import type { MatchParticipant } from './definitions';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to login.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await getUserByEmail(email);

    if (!user || user.password !== password) {
      return { message: 'Invalid email or password.' };
    }
    
    const session = { userId: user.id };
    cookies().set(sessionCookieName, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

  } catch (error) {
    return { message: 'Database Error: Failed to login.' };
  }

  revalidatePath('/');
  redirect('/');
}

export async function logout() {
  cookies().delete(sessionCookieName);
  revalidatePath('/');
  redirect('/login');
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});


export async function register(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
    
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to register.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await getUserByEmail(email);
    if(existingUser) {
        return { message: 'An account with this email already exists.' };
    }

    const newUser = await addUser({ name, email, password });
    
    const session = { userId: newUser.id };
    cookies().set(sessionCookieName, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

  } catch (error) {
    return { message: 'Database Error: Failed to register.' };
  }

  revalidatePath('/');
  redirect('/');
}

export async function logMatch(data: { participants: MatchParticipant[] }) {
    if(!data.participants || data.participants.length < 2) {
        throw new Error('A match must have at least 2 participants.');
    }
    
    try {
        await addMatch({
            championshipId: 'championship1', // Assuming a single championship for now
            date: new Date().toISOString(),
            participants: data.participants,
        });
    } catch(error) {
        throw new Error('Database Error: Failed to log match.');
    }
    
    revalidatePath('/');
    revalidatePath('/admin');
    redirect('/admin');
}
