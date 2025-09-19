'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createSeason, updateSeason } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PlusCircle, Save } from 'lucide-react';
import { Championship } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
       {pending 
            ? (isEditing ? 'Saving...' : 'Creating...') 
            : (isEditing ? <><Save /> Save Changes</> : <><PlusCircle/> Create Season</>)
       }
    </Button>
  );
}

export default function SeasonForm({ season }: { season?: Championship }) {
    const { toast } = useToast();
    const isEditing = !!season;

    const action = isEditing ? updateSeason.bind(null, season.id) : createSeason;
    const [state, dispatch] = useActionState(action, undefined);

    useEffect(() => {
        if(state?.message && !state.errors) {
            toast({
                title: state.message.includes("Error") ? "Error" : "Success",
                description: state.message,
                variant: state.message.includes("Error") ? "destructive" : "default",
            });
        }
    }, [state, toast]);

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Season Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Spring Championship 2025"
                    required
                    defaultValue={season?.name}
                />
                {state?.errors?.name && (
                    <p className="text-sm font-medium text-destructive">{state.errors.name}</p>
                )}
            </div>

            {state?.message && state.errors && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
            
            <SubmitButton isEditing={isEditing} />
        </form>
    );
}
