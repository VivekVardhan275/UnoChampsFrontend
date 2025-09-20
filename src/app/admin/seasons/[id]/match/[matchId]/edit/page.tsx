

import MatchEntryForm from "@/components/admin/MatchEntryForm";
import { Button } from "@/components/ui/button";
import { Championship, Match, User } from "@/lib/definitions";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function EditMatchPage({ params }: { params: { id: string; matchId: string } }) {
    
    const mockChampionships: Championship[] = [
        { id: 'Summer Season 2024', name: 'Summer Season 2024' },
        { id: 'Winter Season 2025', name: 'Winter Season 2025' },
    ];

    const mockUser1: User = { id: '1', name: 'Alice', email: 'alice@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Alice/200/200' };
    const mockUser2: User = { id: '2', name: 'Bob', email: 'bob@example.com', role: 'PLAYER', avatarUrl: 'https://picsum.photos/seed/Bob/200/200' };

    const mockMatch: Match & { participants: ({ user: User } & Match['participants'][0])[]} = {
        id: "mock-match-123",
        name: "Game #1",
        championshipId: "Summer Season 2024",
        date: new Date().toISOString(),
        participants: [
            { userId: '1', rank: 1, points: 10, user: mockUser1 },
            { userId: '2', rank: 2, points: 0, user: mockUser2 },
        ]
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/seasons/${params.id}`}>
                        <ArrowLeft />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Match: {mockMatch.name}</h1>
                    <p className="text-muted-foreground">Update the participants and ranks for this game.</p>
                </div>
            </div>
            <MatchEntryForm allChampionships={mockChampionships} match={mockMatch} />
        </div>
    )
}
