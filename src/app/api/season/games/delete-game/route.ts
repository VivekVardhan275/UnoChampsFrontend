
import { deleteMatchFromApi } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

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
        const body = await req.json();
        
        await deleteMatchFromApi(season, body, token);
        
        revalidatePath(`/admin/seasons/${encodeURIComponent(season)}`);
        revalidatePath('/');

        return NextResponse.json({ message: 'Game deleted successfully' }, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Error in delete-game route:", errorMessage);
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
