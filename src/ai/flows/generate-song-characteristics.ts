'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating song characteristics.
 *
 * It includes:
 * - generateSongCharacteristics: The main function to generate characteristics for a song.
 * - GenerateSongCharacteristicsInput: The input type for the function.
 * - GenerateSongCharacteristicsOutput: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSongCharacteristicsInputSchema = z.object({
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The artist of the song.'),
});
export type GenerateSongCharacteristicsInput = z.infer<typeof GenerateSongCharacteristicsInputSchema>;

const GenerateSongCharacteristicsOutputSchema = z.object({
  characteristics: z.array(z.string()).length(10).describe('A list of 10 characteristics for the song.'),
});
export type GenerateSongCharacteristicsOutput = z.infer<typeof GenerateSongCharacteristicsOutputSchema>;

export async function generateSongCharacteristics(input: GenerateSongCharacteristicsInput): Promise<GenerateSongCharacteristicsOutput> {
  return generateSongCharacteristicsFlow(input);
}

const generateCharacteristicsPrompt = ai.definePrompt({
  name: 'generateSongCharacteristicsPrompt',
  input: {schema: GenerateSongCharacteristicsInputSchema},
  output: {schema: GenerateSongCharacteristicsOutputSchema},
  prompt: `You are a music expert and analyst. Given a song title and artist, provide a list of 10 characteristics that describe the song.

These characteristics can include genre, subgenre, mood, instrumentation, tempo, era, style, and other descriptive tags.

Song Title: {{title}}
Artist: {{artist}}

Return a JSON object with a "characteristics" field containing an array of 10 string values.
  `,
});

const generateSongCharacteristicsFlow = ai.defineFlow(
  {
    name: 'generateSongCharacteristicsFlow',
    inputSchema: GenerateSongCharacteristicsInputSchema,
    outputSchema: GenerateSongCharacteristicsOutputSchema,
  },
  async input => {
    const {output} = await generateCharacteristicsPrompt(input);
    return output!;
  }
);
