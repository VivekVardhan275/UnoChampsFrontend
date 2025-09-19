'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getUserByEmail, addUser, addMatch, addChampionship, deleteChampionship as deleteChampionshipFromDb, updateChampionship as updateChampionshipInDb, getChampionships } from './data';
import { sessionCookieName } from './auth';
import type { MatchParticipant, User } from './definitions';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  let user: User | undefined;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to login.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    user = await getUserByEmail(email);

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
  
  if (user?.role === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/');
  }
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

const matchSchema = z.object({
    championshipId: z.string().min(1, 'Season is required.'),
    participants: z.array(z.object({
        userId: z.string(),
        rank: z.coerce.number().min(1, "Rank is required"),
        points: z.coerce.number().min(0, "Points must be 0 or more"),
    })).min(2, 'At least two players must be selected.')
}).refine(data => {
    const ranks = data.participants.map(p => p.rank);
    return new Set(ranks).size === ranks.length;
}, {
    message: 'Each player must have a unique rank.',
    path: ['participants'],
});


export async function logMatch(data: z.infer<typeof matchSchema>) {
    const validatedData = matchSchema.safeParse(data);
    if (!validatedData.success) {
        throw new Error(validatedData.error.flatten().fieldErrors.participants?.[0] || 'Invalid match data.');
    }
    
    try {
        await addMatch({
            championshipId: validatedData.data.championshipId,
            date: new Date().toISOString(),
            participants: validatedData.data.participants,
        });
    } catch(error) {
        throw new Error('Database Error: Failed to log match.');
    }
    
    revalidatePath('/admin');
    revalidatePath('/');
    redirect('/admin');
}

const seasonSchema = z.object({
    name: z.string().min(3, { message: "Season name must be at least 3 characters." }),
});

export async function createSeason(prevState: any, formData: FormData) {
    const validatedFields = seasonSchema.safeParse({
        name: formData.get('name'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Failed to create season.',
        };
    }

    try {
        await addChampionship(validatedFields.data.name);
    } catch (error) {
        return { message: 'Database Error: Failed to create season.' };
    }
    revalidatePath('/admin/seasons');
    return { message: 'Season created successfully.' };
}

export async function updateSeason(id: string, prevState: any, formData: FormData) {
    const validatedFields = seasonSchema.safeParse({
        name: formData.get('name'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Failed to update season.',
        };
    }

    try {
        await updateChampionshipInDb(id, validatedFields.data.name);
    } catch (error) {
        return { message: `Database Error: ${(error as Error).message}` };
    }
    revalidatePath('/admin/seasons');
    revalidatePath(`/admin/seasons/${id}`);
    revalidatePath(`/admin/seasons/${id}/settings`);
    redirect(`/admin/seasons/${id}`);
}

export async function deleteSeason(id: string) {
    try {
        await deleteChampionshipFromDb(id);
        revalidatePath('/admin/seasons');
        return { message: 'Season deleted successfully.' };
    } catch (error) {
        return { message: `Database Error: ${(error as Error).message}` };
    }
}
