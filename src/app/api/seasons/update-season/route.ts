import { NextRequest, NextResponse } from "next/server";
import { updateChampionshipInApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function PUT(req: NextRequest) {
    const authorization = req.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.split('Bearer ')[1];

    const { searchParams } = new URL(req.url);
    const currentSeason = searchParams.get('current-season');
    const newSeason = searchParams.get('new-season');

    if (!currentSeason || !newSeason) {
        return NextResponse.json({ message: 'Missing current-season or new-season query parameter' }, { status: 400 });
    }

    try {
        const updatedSeasons = await updateChampionshipInApi(currentSeason, newSeason, token);
        
        revalidatePath('/admin/seasons');
        revalidatePath(`/admin/seasons/${encodeURIComponent(newSeason)}/settings`);

        return NextResponse.json(updatedSeasons, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Error in update-season route:", errorMessage);
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
