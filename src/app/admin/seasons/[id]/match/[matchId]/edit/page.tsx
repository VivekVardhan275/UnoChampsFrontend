import MatchEntryForm from "@/components/admin/MatchEntryForm";
import { getChampionships, getMatchById } from "@/lib/api";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditMatchPage({ params }: { params: { id: string, matchId: string } }) {
    const [championships, match] = await Promise.all([
        getChampionships(),
        getMatchById(decodeURIComponent(params.matchId))
    ]);

    if (!match) {
        notFound();
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
            <MatchEntryForm allChampionships={championships} match={match} />
        </div>
    )
}
