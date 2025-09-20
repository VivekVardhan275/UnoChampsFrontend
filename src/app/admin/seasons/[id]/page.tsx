'use client';

import { getChampionshipById, getMatchesByChampionshipId, getUsers } from "@/lib/api";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import MatchList from "@/components/admin/MatchList";
import { useEffect, useState } from "react";
import { Championship, Match, User } from "@/lib/definitions";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function SeasonDetailsPage() {
    const params = useParams<{ id: string }>();
    const { token, isLoading: isAuthLoading } = useAuth();
    const [season, setSeason] = useState<Championship | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && token && params.id) {
            const fetchData = async () => {
                try {
                    const [seasonData, matchesData, usersData] = await Promise.all([
                        getChampionshipById(params.id),
                        getMatchesByChampionshipId(params.id, token),
                        getUsers()
                    ]);
                    
                    if (!seasonData) {
                        notFound();
                        return;
                    }
                    
                    setSeason(seasonData);
                    setMatches(matchesData);
                    setUsers(usersData);
                } catch (error) {
                    console.error("Failed to fetch season details", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        } else if (!isAuthLoading) {
             setIsLoading(false);
        }
    }, [params.id, token, isAuthLoading]);

    if (isLoading || isAuthLoading || !season) {
        return (
            <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10" />
                        <div>
                            <Skeleton className="h-9 w-48 mb-2" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-40 mb-2" />
                        <Skeleton className="h-5 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="space-y-4">
                           <Skeleton className="h-24 w-full" />
                           <Skeleton className="h-24 w-full" />
                       </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
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
