'use server';

/**
 * @fileOverview A multilingual website translation AI agent.
 *
 * - translateWebsiteContent - A function that handles the website content translation process.
 * - TranslateWebsiteContentInput - The input type for the translateWebsiteContent function.
 * - TranslateWebsiteContentOutput - The return type for the translateWebsiteContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateWebsiteContentInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for the translation.'),
});

export type TranslateWebsiteContentInput = z.infer<typeof TranslateWebsiteContentInputSchema>;

const TranslateWebsiteContentOutputSchema = z.object({
  translatedText: z.string().describe('The translated text in the target language.'),
});

export type TranslateWebsiteContentOutput = z.infer<typeof TranslateWebsiteContentOutputSchema>;

export async function translateWebsiteContent(
  input: TranslateWebsiteContentInput
): Promise<TranslateWebsiteContentOutput> {
  return translateWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateWebsiteContentPrompt',
  input: {schema: TranslateWebsiteContentInputSchema},
  output: {schema: TranslateWebsiteContentOutputSchema},
  prompt: `Translate the following text into {{targetLanguage}}:

{{{text}}}`,
});

const translateWebsiteContentFlow = ai.defineFlow(
  {
    name: 'translateWebsiteContentFlow',
    inputSchema: TranslateWebsiteContentInputSchema,
    outputSchema: TranslateWebsiteContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
