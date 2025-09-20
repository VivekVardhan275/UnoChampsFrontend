'use client';
import MatchEntryForm from "@/components/admin/MatchEntryForm";
import { getChampionships } from "@/lib/api";
import { Championship } from "@/lib/definitions";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LogMatchPage() {
    const { token, isLoading: isAuthLoading } = useAuth();
    const [championships, setChampionships] = useState<Championship[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && token) {
            getChampionships(token)
                .then(setChampionships)
                .finally(() => setIsLoading(false));
        } else if (!isAuthLoading && !token) {
            setIsLoading(false);
        }
    }, [token, isAuthLoading]);

    if (isLoading || isAuthLoading) {
        return (
             <div className="space-y-6">
                <div className="text-center">
                    <Skeleton className="h-9 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                </div>
                 <div className="space-y-6 max-w-2xl mx-auto">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </div>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Log New Match Result</h1>
                <p className="text-muted-foreground">Select the season, date, and participants for the new match.</p>
            </div>
            <MatchEntryForm allChampionships={championships} />
        </div>
    )
}
