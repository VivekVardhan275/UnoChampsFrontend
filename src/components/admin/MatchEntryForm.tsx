'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Trash2, ListPlus, UserPlus, Eye, ArrowLeft } from "lucide-react";
import { logMatch, updateMatch } from "@/lib/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Championship, Match, User } from "@/lib/definitions";
import { getUsersByName } from "@/lib/data";

const ParticipantSchema = z.object({
  name: z.string().min(1, "Player name is required."),
  rank: z.coerce.number().min(1, "Rank is required"),
});

const FormSchema = z.object({
  championshipId: z.string().min(1, 'Season is required.'),
  name: z.string().min(1, 'Game name is required.'),
  date: z.date({ required_error: 'A date for the match is required.' }),
  multiplier: z.coerce.number().min(1, "Multiplier must be at least 1."),
  participants: z.array(ParticipantSchema).min(2, 'At least two players must be selected.')
}).refine(data => {
    const ranks = data.participants.map(p => p.rank);
    return new Set(ranks).size === ranks.length;
}, {
    message: 'Each player must have a unique rank.',
    path: ['participants'],
}).refine(data => {
    const names = data.participants.map(p => p.name.toLowerCase().trim());
    return new Set(names).size === names.length;
}, {
    message: 'Each player can only be added once.',
    path: ['participants'],
});


type FormValues = z.infer<typeof FormSchema>;
type ParticipantWithPoints = z.infer<typeof ParticipantSchema> & { points: number };

export default function MatchEntryForm({ allChampionships, match }: { allChampionships: Championship[], match?: Match & { participants: ({ user: User } & Match['participants'][0])[]} }) {
  const isEditing = !!match;
  const [step, setStep] = useState<'entry' | 'preview'>('entry');
  const [previewData, setPreviewData] = useState<{ formValues: FormValues; calculatedParticipants: ParticipantWithPoints[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      championshipId: match?.championshipId || allChampionships[0]?.id || '',
      name: match?.name || '',
      date: match ? new Date(match.date) : new Date(),
      participants: [],
      multiplier: 10, // Assuming a default multiplier, you might want to fetch this if it's part of the match
    },
  });

  useEffect(() => {
    if (isEditing && match) {
      const fetchParticipantDetails = async () => {
        const participantUsers = await getUsersByName(match.participants.map(p => p.userId));
        const userMap = new Map(participantUsers.map(u => [u.id, u]));

        form.reset({
          championshipId: match.championshipId,
          name: match.name,
          date: new Date(match.date),
          multiplier: 10, // You need to decide how to get this. Maybe it's constant, or stored with the match
          participants: match.participants.sort((a,b) => a.rank - b.rank).map(p => ({
            name: userMap.get(p.userId)?.name || '',
            rank: p.rank,
          }))
        });
      }
      fetchParticipantDetails();
    }
  }, [isEditing, match, form]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const handlePreview = (data: FormValues) => {
    const totalPlayers = data.participants.length;
    const calculatedParticipants = data.participants.map(p => ({
        ...p,
        points: (totalPlayers - p.rank) * data.multiplier
    })).sort((a, b) => a.rank - b.rank);

    setPreviewData({ formValues: data, calculatedParticipants });
    setStep('preview');
  };

  async function onSubmit() {
    if (!previewData) return;

    const { formValues, calculatedParticipants } = previewData;
    
    const dataToSubmit = {
        ...formValues,
        participants: calculatedParticipants.map(({ name, rank, points }) => ({
            name,
            rank,
            points
        }))
    }

    try {
        if(isEditing && match) {
            await updateMatch(match.id, dataToSubmit);
            toast({
                title: "Match updated successfully!",
                description: "The standings have been updated.",
            });
        } else {
            await logMatch(dataToSubmit);
            toast({
            title: "Match logged successfully!",
            description: "The standings have been updated.",
            });
        }
        
        if(!isEditing) {
            form.reset({
                championshipId: allChampionships[0]?.id || '',
                name: '',
                date: new Date(),
                participants: [],
                multiplier: 10,
            });
        }

        setStep('entry');
        setPreviewData(null);
    } catch(error) {
        toast({
            variant: "destructive",
            title: "An error occurred.",
            description: (error as Error).message,
        })
    }
  }

  if (step === 'preview' && previewData) {
    const { formValues, calculatedParticipants } = previewData;
    const championship = allChampionships.find(c => c.id === formValues.championshipId);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setStep('entry')}><ArrowLeft /></Button>
                <div>
                    <h2 className="text-2xl font-bold">Review Match Details</h2>
                    <p className="text-muted-foreground">Confirm the results below before saving.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{formValues.name}</CardTitle>
                    <CardDescription>
                        Playing in <strong>{championship?.name}</strong> on <strong>{format(formValues.date, "PPP")}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                        <span className="font-semibold text-muted-foreground">Point Multiplier</span>
                        <span className="font-bold text-lg">{formValues.multiplier}x</span>
                    </div>
                     {calculatedParticipants.map(p => {
                        return (
                            <div key={p.name} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center font-bold text-muted-foreground">{p.rank}</div>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{p.name}</span>
                                </div>
                                <div className="font-semibold text-primary">{p.points.toLocaleString()} pts</div>
                            </div>
                        )
                    })}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button variant="ghost" onClick={() => setStep('entry')}>
                        <ArrowLeft className="mr-2" /> Back to Edit
                    </Button>
                    <Button onClick={onSubmit} disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting 
                            ? (isEditing ? "Saving..." : "Logging...") 
                            : (isEditing ? <><Save className="mr-2 h-4 w-4" /> Save Changes</> : <><ListPlus className="mr-2 h-4 w-4" /> Log Match</>)
                         }
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handlePreview)} className="space-y-6 max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>1. Match Details</CardTitle>
                <CardDescription>Choose the season, date, and point multiplier for this match.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="championshipId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Season</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing}>
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
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Game Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g. Game #1" disabled={isEditing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-end">
                            <FormLabel>Match Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start pl-3 text-left font-normal",
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
                     <FormField
                        control={form.control}
                        name="multiplier"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Point Multiplier</FormLabel>
                                <FormControl><Input {...field} type="number" placeholder="e.g. 10" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>2. Participants & Ranks</CardTitle>
                <CardDescription>Add players who participated and enter their final rank. Points will be calculated automatically.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {fields.length > 0 && (
                         <div className="grid grid-cols-[1fr_80px_auto] gap-4 items-center font-semibold text-muted-foreground px-2">
                            <FormLabel>Player Name</FormLabel>
                            <FormLabel>Rank</FormLabel>
                         </div>
                    )}
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_80px_auto] gap-4 items-start">
                             <FormField
                                control={form.control}
                                name={`participants.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter player name" />
                                        </FormControl>
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
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => append({ name: '', rank: fields.length + 1 })}
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
                <Button type="submit">
                    <Eye className="mr-2 h-4 w-4" /> Preview & Calculate Points
                </Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
