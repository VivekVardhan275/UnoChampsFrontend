import { getChampionshipById, getMatchesByChampionshipId, getUsers } from "@/lib/api";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import MatchList from "@/components/admin/MatchList";

export default async function SeasonDetailsPage({ params }: { params: { id: string } }) {
    const season = await getChampionshipById(params.id);
    if (!season) {
        notFound();
    }
    
    const [matches, users] = await Promise.all([
      getMatchesByChampionshipId(params.id),
      getUsers()
    ]);
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/seasons">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{season.name}</h1>
                        <p className="text-muted-foreground">Manage games played in this season.</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href={`/admin/seasons/${season.id}/settings`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Season Settings
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Games in {season.name}</CardTitle>
                    <CardDescription>
                        {matches.length > 0 
                            ? `Found ${matches.length} game${matches.length > 1 ? 's' : ''}.` 
                            : "No games have been logged for this season yet."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <MatchList matches={matches} users={users} seasonId={season.id} />
                </CardContent>
            </Card>
        </div>
    )
}
