'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import { 
    addChampionship as addChampionshipToApi,
    deleteChampionship as deleteChampionshipFromApi,
    updateChampionship as updateChampionshipInApi,
    deleteMatch as deleteMatchFromApi,
    updateMatch as updateMatchInApi,
    getUsers,
} from './api';
import type { User } from './definitions';
import { getSession } from './auth';

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
