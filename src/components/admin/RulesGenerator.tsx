'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateGameRules } from '@/ai/flows/generate-game-rules';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Copy, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  gameName: z.string().default('UNO'),
  numberOfPlayers: z.coerce.number().min(2).max(10),
  ruleVariation: z.string().min(10, {
    message: 'Please describe the rule variation in at least 10 characters.',
  }),
});

export default function RulesGenerator() {
  const [generatedRules, setGeneratedRules] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: 'UNO',
      numberOfPlayers: 4,
      ruleVariation: 'Standard rules with stacking +2 and +4 cards.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedRules('');
    try {
      const result = await generateGameRules(values);
      setGeneratedRules(result.rules);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating rules',
        description: 'The AI model could not be reached. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedRules);
    toast({
        title: "Copied to clipboard!",
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Rule Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="gameName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Players</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ruleVariation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Variation</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Stacking allowed', 'Jump-in rule active'"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the specific rule you want to generate.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate Rules'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Generated Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                AI-generated content may be inaccurate or unsafe. Always review and vet the rules before publishing.
              </AlertDescription>
            </Alert>
          <Textarea
            readOnly
            value={isLoading ? 'Generating, please wait...' : generatedRules}
            className="h-64 resize-none"
            placeholder="Generated rules will appear here..."
          />
        </CardContent>
        <CardFooter>
            <Button variant="outline" onClick={copyToClipboard} disabled={!generatedRules || isLoading}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Rules
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
