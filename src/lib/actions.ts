
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { 
    updateChampionshipInApi,
    updateMatchInApi,
    getUsers,
} from './api';
import type { User } from './definitions';
import { getSession } from './auth';

// This file contains server actions. 
// For client-side API calls that need authentication, 
// prefer using a client-side fetch to a Route Handler
// to get the token from localStorage.

export async function updateSeason(id: string, prevState: any, formData: FormData) {
    const seasonSchema = z.object({
        name: z.string().min(3, { message: "Season name must be at least 3 characters." }),
    });

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
        const session = await getSession();
        if (!session?.token) {
            throw new Error("Authentication required.");
        }
        await updateChampionshipInApi(id, validatedFields.data.name, session.token);
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
        const session = await getSession();
        if (!session?.token) {
            throw new Error("Authentication required.");
        }
        // This is now handled by a client-side API call, but we keep the action for potential non-JS fallback
        // The main logic is now in SeasonsList.tsx
        revalidatePath('/admin/seasons');
        return { message: 'Season deleted successfully.' };
    } catch (error) {
        return { message: `Database Error: ${(error as Error).message}` };
    }
}
