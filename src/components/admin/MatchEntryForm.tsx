'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { User, Championship } from "@/lib/definitions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Trash2, ListPlus, UserPlus, Check, ChevronsUpDown } from "lucide-react";
import { logMatch } from "@/lib/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const FormSchema = z.object({
  championshipId: z.string().min(1, 'Season is required.'),
  date: z.date({ required_error: 'A date for the match is required.' }),
  participants: z.array(z.object({
    userId: z.string().min(1, "Player is required."),
    rank: z.coerce.number().min(1, "Rank is required"),
    points: z.coerce.number().min(0, "Points must be 0 or more"),
  })).min(2, 'At least two players must be selected.')
}).refine(data => {
    const ranks = data.participants.map(p => p.rank);
    return new Set(ranks).size === ranks.length;
}, {
    message: 'Each player must have a unique rank.',
    path: ['participants'],
}).refine(data => {
    const userIds = data.participants.map(p => p.userId);
    return new Set(userIds).size === userIds.length;
}, {
    message: 'Each player can only be added once.',
    path: ['participants'],
});


type FormValues = z.infer<typeof FormSchema>;

export default function MatchEntryForm({ allUsers, allChampionships }: { allUsers: User[], allChampionships: Championship[] }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      championshipId: allChampionships[0]?.id || '',
      date: new Date(),
      participants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const selectedUserIds = new Set(fields.map(field => field.userId));

  async function onSubmit(data: FormValues) {
    try {
        await logMatch(data);
        toast({
          title: "Match logged successfully!",
          description: "The standings have been updated and you have been redirected to the season's game list.",
        });
        form.reset({
            championshipId: allChampionships[0]?.id || '',
            date: new Date(),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>1. Match Details</CardTitle>
                <CardDescription>Choose the season this match belongs to and the date it was played.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="championshipId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Season</FormLabel>
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
                     <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Match Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>2. Participants & Results</CardTitle>
                <CardDescription>Add players who participated and enter their final rank and points.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {fields.length > 0 && (
                         <div className="grid grid-cols-[1fr_80px_80px_auto] gap-4 items-center font-semibold text-muted-foreground px-2">
                            <FormLabel>Player</FormLabel>
                            <FormLabel>Rank</FormLabel>
                            <FormLabel>Points</FormLabel>
                         </div>
                    )}
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_80px_80px_auto] gap-4 items-start">
                            <FormField
                                control={form.control}
                                name={`participants.${index}.userId`}
                                render={({ field }) => (
                                    <FormItem>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                    ? allUsers.find(
                                                        (user) => user.id === field.value
                                                      )?.name
                                                    : "Select player"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search player..." />
                                                    <CommandList>
                                                        <CommandEmpty>No player found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {allUsers.map((user) => (
                                                            <CommandItem
                                                                value={user.name}
                                                                key={user.id}
                                                                disabled={selectedUserIds.has(user.id)}
                                                                onSelect={() => {
                                                                    form.setValue(`participants.${index}.userId`, user.id);
                                                                }}
                                                            >
                                                                <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    user.id === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                                )}
                                                                />
                                                                {user.name}
                                                            </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`participants.${index}.rank`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input {...field} type="number" placeholder="Rank" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`participants.${index}.points`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input {...field} type="number" placeholder="Points" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => append({ userId: '', rank: fields.length + 1, points: 0 })}
                    >
                       <UserPlus className="mr-2 h-4 w-4" /> Add Player
                    </Button>
                </div>
                 {form.formState.errors.participants?.root && (
                    <p className="mt-4 text-sm font-medium text-destructive">{form.formState.errors.participants.root.message}</p>
                )}
                 {form.formState.errors.participants && !form.formState.errors.participants.root && (
                    <p className="mt-4 text-sm font-medium text-destructive">{form.formState.errors.participants.message}</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">{fields.length} player{fields.length === 1 ? '' : 's'} in this match.</p>
                <Button type="submit" disabled={fields.length < 2 || form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Logging..." : <><ListPlus className="mr-2 h-4 w-4" /> Log Match</> }
                </Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
