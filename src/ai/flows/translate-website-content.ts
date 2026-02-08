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
  texts: z.array(z.string()).describe('The texts to be translated.'),
  targetLanguage: z.string().describe('The target language for the translation.'),
});

export type TranslateWebsiteContentInput = z.infer<typeof TranslateWebsiteContentInputSchema>;

const TranslateWebsiteContentOutputSchema = z.object({
  translatedTexts: z.array(z.string()).describe('The translated texts in the target language, in the same order as the input texts.'),
});

export type TranslateWebsiteContentOutput = z.infer<typeof TranslateWebsiteContentOutputSchema>;

export async function translateWebsiteContent(
  input: TranslateWebsiteContentInput
): Promise<TranslateWebsiteContentOutput> {
  if (input.texts.length === 0) {
    return { translatedTexts: [] };
  }
  return translateWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateWebsiteContentPrompt',
  input: {schema: TranslateWebsiteContentInputSchema},
  output: {schema: TranslateWebsiteContentOutputSchema},
  prompt: `Translate each of the following texts into {{targetLanguage}}.
    
Return a response that is only the translated texts, in the same order as the input.

Texts to translate:
{{#each texts}}
- "{{this}}"
{{/each}}
`,
});

const translateWebsiteContentFlow = ai.defineFlow(
  {
    name: 'translateWebsiteContentFlow',
    inputSchema: TranslateWebsiteContentInputSchema,
    outputSchema: TranslateWebsiteContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    // Ensure the output array has the same length as the input array
    if (output && output.translatedTexts.length === input.texts.length) {
        return output;
    }

    // Handle cases where the model fails to return a correct array
    // and return the original texts as a fallback.
    return { translatedTexts: input.texts };
  }
);
