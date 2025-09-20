'use client';

import { useState } from 'react';
import { Championship } from "@/lib/definitions";
import { Button } from "../ui/button";
import { Pen, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SeasonsList({ seasons }: { seasons: Championship[] }) {
    const { toast } = useToast();
    const { token } = useAuth();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!token) {
            toast({
                title: "Error",
                description: "Authentication token not found.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(id);
        try {
            const response = await fetch(`/api/seasons/delete-season?season=${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete season.');
            }

            toast({
                title: "Success",
                description: "Season deleted successfully.",
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
    
    if (seasons.length === 0) {
        return <p className="text-muted-foreground text-center">No seasons found.</p>
    }

    return (
        <div className="space-y-2">
            {seasons.sort((a, b) => b.name.localeCompare(a.name)).map(season => (
                <div key={season.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <Link href={`/admin/seasons/${encodeURIComponent(season.id)}`} className="font-medium hover:underline flex-grow">
                        {season.name}
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/seasons/${encodeURIComponent(season.id)}`}>
                                <Pen className="h-4 w-4" />
                                <span className="sr-only">Manage Matches</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/seasons/${encodeURIComponent(season.id)}/settings`}>
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Season Settings</span>
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the season and corresponding games played in that particular season
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(season.id)}
                                    disabled={isDeleting === season.id}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    {isDeleting === season.id ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </div>
                </div>
            ))}
        </div>
    )
}
