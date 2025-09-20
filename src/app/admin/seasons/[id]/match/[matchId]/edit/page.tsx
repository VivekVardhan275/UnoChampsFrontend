
'use client';

import { useEffect, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import MatchEntryForm from "@/components/admin/MatchEntryForm";
import { Button } from "@/components/ui/button";
import { Championship, Match, User } from "@/lib/definitions";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { getMatchesByChampionshipId, getChampionships } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

type EnrichedParticipant = Match['participants'][0] & { user: User };
type EnrichedMatch = Omit<Match, 'participants'> & { participants: EnrichedParticipant[] };

export default function EditMatchPage() {
    const params = useParams<{ id: string; matchId: string }>();
    const { token, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [match, setMatch] = useState<EnrichedMatch | null>(null);
    const [allChampionships, setAllChampionships] = useState<Championship[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const decodedSeasonId = decodeURIComponent(params.id as string);
    const decodedMatchId = decodeURIComponent(params.matchId as string);

    useEffect(() => {
        if (!token || isAuthLoading) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [championshipsData, { matches, users }] = await Promise.all([
                    getChampionships(token),
                    getMatchesByChampionshipId(decodedSeasonId, token)
                ]);

                setAllChampionships(championshipsData);
                
                const foundMatch = matches.find(m => m.id === decodedMatchId);
                
                if (foundMatch) {
                    const userMap = new Map(users.map(u => [u.id, u]));
                    const enrichedParticipants = foundMatch.participants
                        .map(p => ({ ...p, user: userMap.get(p.userId)! }))
                        .filter(p => p.user);
                    
                    setMatch({
                        ...foundMatch,
                        participants: enrichedParticipants as EnrichedParticipant[],
                    });
                }
            } catch (error) {
                console.error("Failed to fetch match data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [decodedSeasonId, decodedMatchId, token, isAuthLoading]);

    if (isLoading || isAuthLoading) {
        return (
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div>
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-5 w-72" />
                    </div>
                </div>
                 <div className="space-y-6 max-w-2xl mx-auto">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-96 w-full" />
                 </div>
            </div>
        );
    }
    
    if (!match) {
        notFound();
        return null;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/seasons/${params.id}`}>
                        <ArrowLeft />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Match: {match.name}</h1>
                    <p className="text-muted-foreground">Update the participants and ranks for this game.</p>
                </div>
            </div>
            <MatchEntryForm allChampionships={allChampionships} match={match} />
        </div>
    )
}
