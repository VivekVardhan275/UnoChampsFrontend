'use client';

import { getChampionships } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SeasonForm from "@/components/admin/SeasonForm";
import SeasonsList from "@/components/admin/SeasonsList";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Championship } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

export default function SeasonsPage() {
    const { token, isLoading: isAuthLoading } = useAuth();
    const [seasons, setSeasons] = useState<Championship[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && token) {
            getChampionships(token)
                .then(setSeasons)
                .finally(() => setIsLoading(false));
        } else if (!isAuthLoading && !token) {
            setIsLoading(false);
        }
    }, [token, isAuthLoading]);

    if (isLoading || isAuthLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-9 w-1/2 mb-2" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="flex flex-col gap-8">
                    <Card className="max-w-lg mx-auto w-full">
                        <CardHeader>
                             <Skeleton className="h-7 w-1/3 mb-2" />
                             <Skeleton className="h-5 w-2/3" />
                        </CardHeader>
                        <CardContent className="py-8">
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card className="max-w-lg mx-auto w-full">
                        <CardHeader>
                             <Skeleton className="h-7 w-1/3 mb-2" />
                             <Skeleton className="h-5 w-1/2" />
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4 mt-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Season Management</h1>
                <p className="text-muted-foreground">Create, edit, and manage championship seasons.</p>
            </div>
            <div className="flex flex-col gap-8">
                <Card className="max-w-lg mx-auto w-full">
                    <CardHeader>
                        <CardTitle>Create New Season</CardTitle>
                        <CardDescription>Add a new season to the championship.</CardDescription>
                    </CardHeader>
                    <CardContent className="py-8">
                        <SeasonForm />
                    </CardContent>
                </Card>
                 <Card className="max-w-lg mx-auto w-full">
                    <CardHeader>
                        <CardTitle>Existing Seasons</CardTitle>
                         <CardDescription>View and manage all current and past seasons.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SeasonsList seasons={seasons} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
