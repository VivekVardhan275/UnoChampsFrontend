'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

import { 
    addMatchToApi, 
    addChampionship as addChampionshipToApi,
    deleteChampionship as deleteChampionshipFromApi,
    updateChampionship as updateChampionshipInApi,
    deleteMatch as deleteMatchFromApi,
    updateMatch as updateMatchInApi,
    getUsers, // Assuming this stays as a mock/internal utility
} from './api';
import type { User } from './definitions';
import { getSession } from './auth';


// This function simulates finding a user or creating one if they don't exist.
// In a real backend, this would be a single API call. For now, it uses the mock user list.
export async function findOrCreateUserByName(name: string): Promise<User> {
    const allUsers = await getUsers();
    let user = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) {
         user = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            email: `${name.toLowerCase().replace(/\s/g, '')}@example.com`,
            role: 'PLAYER',
            avatarUrl: `https://picsum.photos/seed/${name}/200/200`
        };
        // This part is tricky without a backend; we can't really "add" a user here
        // in a way that persists across requests without a proper backend endpoint.
        // For the purpose of getting user IDs for match logging, this is okay for now.
    }
    return user;
}


const matchSchema = z.object({
    championshipId: z.string().min(1, 'Season is required.'),
    name: z.string().min(1, 'Game name is required.'),
    date: z.date({ required_error: 'A date for the match is required.' }),
    multiplier: z.coerce.number().min(1, "Multiplier must be at least 1."),
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
    const session = await getSession();
    if (!session?.token) {
        throw new Error('Authentication token not found.');
    }

    const validatedData = matchSchema.safeParse(data);
    if (!validatedData.success) {
        throw new Error(validatedData.error.flatten().fieldErrors.participants?.[0] || 'Invalid match data.');
    }
    
    try {
        const { championshipId, name, date, participants } = validatedData.data;

        // The API expects arrays of strings for members, ranks, and points.
        const apiPayload = {
            gameName: `${name} ${format(date, 'dd/MM/yyyy')}`,
            members: participants.map(p => p.name),
            ranks: participants.map(p => p.rank.toString()),
            points: participants.map(p => p.points.toString()),
        };

        await addMatchToApi(championshipId, apiPayload, session.token);

    } catch(error) {
        if (error instanceof Error) {
            throw new Error(`Database Error: Failed to log match. ${error.message}`);
        }
        throw new Error('Database Error: Failed to log match.');
    }
    
    revalidatePath('/admin/log-match');
    revalidatePath(`/admin/seasons/${data.championshipId}`);
    revalidatePath('/');
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
    return { message: 'Season updated successfully.' };
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
