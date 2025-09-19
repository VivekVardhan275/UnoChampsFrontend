'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { User, Championship } from "@/lib/definitions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Trash2, ListPlus } from "lucide-react";
import { logMatch } from "@/lib/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const FormSchema = z.object({
  championshipId: z.string().min(1, 'Season is required.'),
  participants: z.array(z.object({
    userId: z.string(),
    name: z.string(),
    rank: z.coerce.number().min(1, "Rank is required"),
    points: z.coerce.number().min(0, "Points must be 0 or more"),
  })).min(2, 'At least two players must be selected.')
}).refine(data => {
    const ranks = data.participants.map(p => p.rank);
    return new Set(ranks).size === ranks.length;
}, {
    message: 'Each player must have a unique rank.',
    path: ['participants'],
});

type FormValues = z.infer<typeof FormSchema>;

export default function MatchEntryForm({ allUsers, allChampionships }: { allUsers: User[], allChampionships: Championship[] }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      championshipId: allChampionships[0]?.id || '',
      participants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const selectedUserIds = new Set(fields.map(field => field.userId));

  const handleUserSelection = (user: User, isSelected: boolean) => {
    if (isSelected) {
      append({ userId: user.id, name: user.name, rank: 0, points: 0 });
    } else {
      const index = fields.findIndex(field => field.userId === user.id);
      if (index > -1) {
        remove(index);
      }
    }
  };

  async function onSubmit(data: FormValues) {
    try {
        await logMatch(data);
        toast({
          title: "Match logged successfully!",
          description: "The standings have been updated.",
        });
        form.reset({
            championshipId: allChampionships[0]?.id || '',
            participants: []
        });
    } catch(error) {
        toast({
            variant: "destructive",
            title: "An error occurred.",
            description: (error as Error).message,
        })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>1. Select Season</CardTitle>
                <CardDescription>Choose which season this match belongs to.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="championshipId"
                    render={({ field }) => (
                        <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a season" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {allChampionships.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card>
                <CardHeader>
                    <CardTitle>2. Select Players</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {allUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                            <Checkbox
                                id={`user-${user.id}`}
                                checked={selectedUserIds.has(user.id)}
                                onCheckedChange={(checked) => handleUserSelection(user, !!checked)}
                            />
                            <label
                                htmlFor={`user-${user.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {user.name}
                            </label>
                        </div>
                    ))}
                    {form.formState.errors.participants && !form.formState.errors.participants.root && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.participants.message}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>3. Enter Ranks & Points</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center">
                                <FormLabel>{field.name}</FormLabel>
                                <FormField
                                    control={form.control}
                                    name={`participants.${index}.rank`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input {...field} type="number" placeholder="Rank" /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`participants.${index}.points`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input {...field} type="number" placeholder="Points" /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         {fields.length === 0 && <p className="text-center text-muted-foreground pt-4">Select players to start entering results.</p>}
                    </div>
                     {form.formState.errors.participants?.root && (
                        <p className="mt-4 text-sm font-medium text-destructive">{form.formState.errors.participants.root.message}</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={fields.length < 2 || form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Logging..." : <><ListPlus className="mr-2 h-4 w-4" /> Log Match</> }
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </form>
    </Form>
  );
}
