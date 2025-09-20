
'use client';

import { useState } from 'react';
import { Match, User } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Pen, Trash2, Trophy, Medal } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MatchList({ matches, users, seasonId }: { matches: Match[], users: User[], seasonId: string }) {
    const { toast } = useToast();
    const { token } = useAuth();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const userMap = new Map(users.map(u => [u.id, u]));

    const handleDelete = async (match: Match) => {
        if (!token) {
            toast({
                title: "Error",
                description: "Authentication token not found.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(match.id);
        
        const userMap = new Map(users.map(u => [u.id, u]));
        const members = match.participants.map(p => userMap.get(p.userId)?.name).filter(Boolean) as string[];

        const payload = {
            gameName: match.name,
            members: members,
            ranks: match.participants.map(p => p.rank.toString()),
            points: match.participants.map(p => p.points.toString()),
        };

        try {
            const response = await fetch(`/api/season/games/delete-game?season=${encodeURIComponent(seasonId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete game.');
            }

            toast({
                title: "Success",
                description: "Game deleted successfully.",
            });
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(null);
        }
    }
    
    if (matches.length === 0) {
        return <p className="text-muted-foreground text-center">No games to display for this season.</p>
    }

    return (
        <div className="space-y-6">
        {matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match) => (
            <Card key={match.id}>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg">{match.name}</h3>
                        <p className="text-sm text-muted-foreground">{format(new Date(match.date), 'MMMM d, yyyy')}</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="secondary" asChild>
                            <Link href={`/admin/seasons/${encodeURIComponent(seasonId)}/match/${encodeURIComponent(match.id)}/edit`}>
                                <Pen className="mr-2 h-4 w-4"/>
                                Edit Game
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this game result.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(match)}
                                    disabled={isDeleting === match.id}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    {isDeleting === match.id ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
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
        </div>
    );
}
