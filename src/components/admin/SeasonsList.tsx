'use client';

import { useState } from 'react';
import { Championship } from "@/lib/definitions";
import { Button } from "../ui/button";
import { Pen, Trash2 } from "lucide-react";
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
import { deleteSeason } from "@/lib/actions";
import { useToast } from '@/hooks/use-toast';

export default function SeasonsList({ seasons }: { seasons: Championship[] }) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        const result = await deleteSeason(id);
        if (result?.message) {
             toast({
                title: result.message.includes("Error") ? "Error" : "Success",
                description: result.message,
                variant: result.message.includes("Error") ? "destructive" : "default",
            });
        }
        setIsDeleting(null);
    }
    
    if (seasons.length === 0) {
        return <p className="text-muted-foreground text-center">No seasons found.</p>
    }

    return (
        <div className="space-y-2">
            {seasons.map(season => (
                <div key={season.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <span className="font-medium">{season.name}</span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/seasons/${season.id}/edit`}>
                                <Pen className="h-4 w-4" />
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
                                    This action cannot be undone. This will permanently delete the season.
                                    You cannot delete a season if it has matches associated with it.
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