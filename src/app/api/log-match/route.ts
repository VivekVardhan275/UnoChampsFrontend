import { addMatchToApi } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const authorization = req.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.split('Bearer ')[1];

    try {
        const body = await req.json();
        const { season, gameName, members, ranks, points } = body;

        if (!season || !gameName || !members || !ranks || !points) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const apiPayload = { gameName, members, ranks, points };

        await addMatchToApi(season, apiPayload, token);
        
        // Revalidate paths to update UI
        revalidatePath('/admin/log-match');
        revalidatePath('/');
        if (season) {
            revalidatePath(`/admin/seasons/${season}`);
        }

        return NextResponse.json({ message: 'Match logged successfully' }, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Error in log-match route:", errorMessage);
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
