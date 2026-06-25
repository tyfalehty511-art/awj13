'use server';
/**
 * @fileOverview A Genkit flow to generate engaging product descriptions using AI.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().min(1).describe('The name of the product.'),
  productType: z.enum(['digital', 'physical']).describe('The type of the product (digital or physical).'),
  keyFeatures: z.array(z.string().min(1)).min(1).describe('A list of key features or selling points of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().min(1).describe('An engaging and detailed product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an AI assistant specialized in writing compelling and engaging product descriptions for e-commerce stores.

Your task is to create a detailed and attractive product description based on the provided product information.
Highlight the key features in an exciting way to entice potential customers.

Product Name: {{{productName}}}
Product Type: {{{productType}}}

Key Features:
{{#each keyFeatures}}
- {{{this}}}
{{/each}}`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await productDescriptionPrompt(input);
    if (!output) {
      throw new Error('Failed to generate product description.');
    }
    return output;
  }
);
