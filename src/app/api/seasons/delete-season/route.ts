
import { NextRequest, NextResponse } from "next/server";
import { deleteChampionshipFromApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function DELETE(req: NextRequest) {
    const authorization = req.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.split('Bearer ')[1];

    const { searchParams } = new URL(req.url);
    const season = searchParams.get('season');

    if (!season) {
        return NextResponse.json({ message: 'Missing season query parameter' }, { status: 400 });
    }

    try {
        const updatedSeasons = await deleteChampionshipFromApi(season, token);
        
        revalidatePath('/admin/seasons');

        return NextResponse.json(updatedSeasons, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Error in delete-season route:", errorMessage);
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
