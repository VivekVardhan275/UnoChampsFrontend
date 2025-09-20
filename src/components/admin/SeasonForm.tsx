'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { addChampionshipToApi, updateChampionship as updateChampionshipInApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PlusCircle, Save, Loader2 } from 'lucide-react';
import { Championship } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const seasonSchema = z.object({
    name: z.string().min(3, { message: "Season name must be at least 3 characters." }),
});

type FormValues = z.infer<typeof seasonSchema>;

export default function SeasonForm({ season }: { season?: Championship }) {
    const { toast } = useToast();
    const { token } = useAuth();
    const router = useRouter();
    const isEditing = !!season;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(seasonSchema),
        defaultValues: {
            name: season?.name || ''
        }
    });

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        if (!token) {
            setServerError("Authentication error. Please log in again.");
            return;
        }

        setIsSubmitting(true);
        setServerError(null);

        try {
            if (isEditing && season) {
                // Keep the existing update logic for editing for now.
                // This would be refactored similarly if an update endpoint existed.
                await updateChampionshipInApi(season.id, data.name);
                 toast({
                    title: "Success",
                    description: "Season updated successfully.",
                });
                router.refresh();
            } else {
                // Use the new client-side API call for creation.
                await addChampionshipToApi(data.name, token);
                toast({
                    title: "Success",
                    description: "Season created successfully.",
                });
                reset({ name: '' }); // Reset form on successful creation
                router.refresh(); // Refresh the page to show the new season
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setServerError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Season Name</Label>
                <Input
                    id="name"
                    {...register("name")}
                    placeholder=""
                    required
                    defaultValue={season?.name}
                />
                {errors.name && (
                    <p className="text-sm font-medium text-destructive">{errors.name.message}</p>
                )}
            </div>

            {serverError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
               {isSubmitting 
                    ? <><Loader2 className="animate-spin" /> {isEditing ? 'Saving...' : 'Creating...'}</>
                    : (isEditing ? <><Save /> Save Changes</> : <><PlusCircle/> Create Season</>)
               }
            </Button>
        </form>
    );
}
