import { getChampionshipById, getMatchesByChampionshipId, getUsers } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Pen, Trophy, Medal } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function SeasonDetailsPage({ params }: { params: { id: string } }) {
    const season = await getChampionshipById(params.id);
    if (!season) {
        notFound();
    }
    
    const matches = await getMatchesByChampionshipId(params.id);
    const users = await getUsers();
    const userMap = new Map(users.map(u => [u.id, u]));

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
                    {matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match, index) => (
                        <Card key={match.id}>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg">Game #{matches.length - index}</h3>
                                    <p className="text-sm text-muted-foreground">{format(new Date(match.date), 'MMMM d, yyyy')}</p>
                                </div>
                                <Button variant="secondary" disabled>
                                    <Pen className="mr-2 h-4 w-4"/>
                                    Edit Game (soon)
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                {match.participants.sort((a,b) => a.rank - b.rank).map(p => {
                                    const user = userMap.get(p.userId);
                                    return (
                                        <div key={p.userId} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                {p.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                                                {p.rank === 2 && <Medal className="h-5 w-5 text-slate-400" />}
                                                {p.rank > 2 && <div className="w-5 h-5 flex items-center justify-center font-bold text-muted-foreground">{p.rank}</div>}
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user?.avatarUrl} />
                                                    <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user?.name}</span>
                                            </div>
                                            <div className="font-semibold text-primary">{p.points.toLocaleString()} pts</div>
                                        </div>
                                    )
                                })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
