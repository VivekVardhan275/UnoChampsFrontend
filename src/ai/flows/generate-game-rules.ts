'use server';

/**
 * @fileOverview Generates game rules using AI.
 *
 * - generateGameRules - A function that generates game rules.
 * - GenerateGameRulesInput - The input type for the generateGameRules function.
 * - GenerateGameRulesOutput - The return type for the generateGameRules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGameRulesInputSchema = z.object({
  gameName: z.string().describe('The name of the game.'),
  numberOfPlayers: z
    .number()
    .min(2)
    .max(10)
    .describe('The number of players for the game.'),
  ruleVariation: z.string().describe('The specific rule variation to generate.'),
});
export type GenerateGameRulesInput = z.infer<typeof GenerateGameRulesInputSchema>;

const GenerateGameRulesOutputSchema = z.object({
  rules: z.string().describe('The generated game rules.'),
});
export type GenerateGameRulesOutput = z.infer<typeof GenerateGameRulesOutputSchema>;

export async function generateGameRules(input: GenerateGameRulesInput): Promise<GenerateGameRulesOutput> {
  return generateGameRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGameRulesPrompt',
  input: {schema: GenerateGameRulesInputSchema},
  output: {schema: GenerateGameRulesOutputSchema},
  prompt: `You are an expert game rule generator.

You will generate game rules for the game {{gameName}} with {{numberOfPlayers}} players.

The specific rule variation to generate is: {{ruleVariation}}.

Here are the generated rules:`,
});

const generateGameRulesFlow = ai.defineFlow(
  {
    name: 'generateGameRulesFlow',
    inputSchema: GenerateGameRulesInputSchema,
    outputSchema: GenerateGameRulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
