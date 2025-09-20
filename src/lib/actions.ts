'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { sessionCookieName } from './auth';
import { 
    addMatch as addMatchToApi, 
    addChampionship as addChampionshipToApi,
    deleteChampionship as deleteChampionshipFromApi,
    updateChampionship as updateChampionshipInApi,
    deleteMatch as deleteMatchFromApi,
    findOrCreateUserByName,
    updateMatch as updateMatchInApi,
} from './api';

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
    const role = formData.get('role') === 'ADMIN' ? 'admin' : 'player';

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
        return { message: data.message || 'Invalid credentials.' };
    }

    const session = {
        userId: data.username, // Assuming username is the unique ID from your API
        token: data.token,
        user: {
            name: data.username,
            email: data.email,
            role: data.typeOfUser,
        }
    };

    cookies().set(sessionCookieName, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });

    revalidatePath('/');
    
    if (data.typeOfUser === 'ADMIN') {
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
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
    });

    const data = await response.json();

    if (!data.success) {
        return { message: data.message || 'Failed to register.' };
    }
    
    const session = {
        userId: data.username,
        token: data.token,
        user: {
            name: data.username,
            email: data.email,
            role: data.typeOfUser,
        }
    };
    cookies().set(sessionCookieName, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

    revalidatePath('/');
    redirect('/');
}

const matchSchema = z.object({
    championshipId: z.string().min(1, 'Season is required.'),
    name: z.string().min(1, 'Game name is required.'),
    date: z.date({ required_error: 'A date for the match is required.' }),
    participants: z.array(z.object({
        name: z.string().min(1, "Player name is required."),
        rank: z.coerce.number().min(1, "Rank is required"),
        points: z.coerce.number().min(0, "Points must be 0 or more"),
    })).min(2, 'At least two players must be selected.')
}).refine(data => {
    const ranks = data.participants.map(p => p.rank);
    return new Set(ranks).size === ranks.length;
}, {
    message: 'Each player must have a unique rank.',
    path: ['participants'],
}).refine(data => {
    const names = data.participants.map(p => p.name.toLowerCase().trim());
    return new Set(names).size === names.length;
}, {
    message: 'Each player can only be added once.',
    path: ['participants'],
});


export async function logMatch(data: z.infer<typeof matchSchema>) {
    const validatedData = matchSchema.safeParse(data);
    if (!validatedData.success) {
        throw new Error(validatedData.error.flatten().fieldErrors.participants?.[0] || 'Invalid match data.');
    }
    
    try {
        const participantPromises = validatedData.data.participants.map(async (p) => {
            const user = await findOrCreateUserByName(p.name);
            return {
                userId: user.id,
                rank: p.rank,
                points: p.points,
            };
        });

        const participantsWithUserIds = await Promise.all(participantPromises);

        await addMatchToApi({
            championshipId: validatedData.data.championshipId,
            name: validatedData.data.name,
            date: validatedData.data.date.toISOString(),
            participants: participantsWithUserIds,
        });
    } catch(error) {
        throw new Error('Database Error: Failed to log match.');
    }
    
    revalidatePath('/admin/log-match');
    revalidatePath(`/admin/seasons/${data.championshipId}`);
    revalidatePath('/');
    redirect(`/admin/seasons/${data.championshipId}`);
}

export async function updateMatch(matchId: string, data: z.infer<typeof matchSchema>) {
    const validatedData = matchSchema.safeParse(data);
    if (!validatedData.success) {
        throw new Error(validatedData.error.flatten().fieldErrors.participants?.[0] || 'Invalid match data.');
    }
    
    try {
        const participantPromises = validatedData.data.participants.map(async (p) => {
            const user = await findOrCreateUserByName(p.name);
            return {
                userId: user.id,
                rank: p.rank,
                points: p.points,
            };
        });

        const participantsWithUserIds = await Promise.all(participantPromises);

        await updateMatchInApi(matchId, {
            championshipId: validatedData.data.championshipId,
            name: validatedData.data.name,
            date: validatedData.data.date.toISOString(),
            participants: participantsWithUserIds,
        });
    } catch(error) {
        throw new Error('Database Error: Failed to update match.');
    }
    
    revalidatePath(`/admin/seasons/${data.championshipId}`);
    revalidatePath(`/admin/seasons/${data.championshipId}/match/${matchId}/edit`);
    revalidatePath('/');
    redirect(`/admin/seasons/${data.championshipId}`);
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
        await addChampionshipToApi(validatedFields.data.name);
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
        await updateChampionshipInApi(id, validatedFields.data.name);
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
        await deleteChampionshipFromApi(id);
        revalidatePath('/admin/seasons');
        return { message: 'Season deleted successfully.' };
    } catch (error) {
        return { message: `Database Error: ${(error as Error).message}` };
    }
}

export async function deleteMatch(id: string, seasonId: string) {
    try {
        await deleteMatchFromApi(id);
        revalidatePath(`/admin/seasons/${seasonId}`);
        revalidatePath('/');
        return { message: 'Game deleted successfully.' };
    } catch(error) {
        return { message: `Database Error: ${(error as Error).message}` };
    }
}