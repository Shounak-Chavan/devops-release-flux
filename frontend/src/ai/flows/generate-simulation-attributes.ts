'use server';
/**
 * @fileOverview This file provides a Genkit flow to generate feature flag evaluation attributes
 *               from a natural language user scenario description. It exports the wrapper function,
 *               and the input and output types for the flow.
 *
 * - generateSimulationAttributes - A function that processes a user scenario to generate attributes.
 * - GenerateSimulationAttributesInput - The input type for the generateSimulationAttributes function.
 * - GenerateSimulationAttributesOutput - The return type for the generateSimulationAttributes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSimulationAttributesInputSchema = z.object({
  scenarioDescription: z.string().describe('A natural language description of a user scenario for feature flag evaluation.'),
});
export type GenerateSimulationAttributesInput = z.infer<typeof GenerateSimulationAttributesInputSchema>;

const GenerateSimulationAttributesOutputSchema = z.object({
  attributes: z.record(z.string(), z.any()).describe('A JSON object containing key-value pairs of attributes extracted from the scenario description.'),
});
export type GenerateSimulationAttributesOutput = z.infer<typeof GenerateSimulationAttributesOutputSchema>;

export async function generateSimulationAttributes(input: GenerateSimulationAttributesInput): Promise<GenerateSimulationAttributesOutput> {
  return generateSimulationAttributesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSimulationAttributesPrompt',
  input: { schema: GenerateSimulationAttributesInputSchema },
  output: { schema: GenerateSimulationAttributesOutputSchema },
  prompt: `You are an AI assistant specialized in generating feature flag evaluation attributes from natural language descriptions.
Given a user scenario, extract all relevant attributes that could be used for feature flag evaluation and return them as a JSON object under the 'attributes' key.
Consider common attributes for feature flag evaluation such as 'userId', 'tier' (e.g., 'premium', 'free'), 'region' (e.g., 'US', 'EU'), 'country', 'deviceType' (e.g., 'mobile', 'desktop'), 'platform' (e.g., 'iOS', 'Android', 'Web'), 'appVersion', 'customerSegment'.
If an attribute is not explicitly mentioned but can be reasonably inferred from the scenario, include it.
If no relevant attributes are found, return an empty JSON object {} for the 'attributes' key.

Scenario: {{{scenarioDescription}}}

JSON Output:`,
});

const generateSimulationAttributesFlow = ai.defineFlow(
  {
    name: 'generateSimulationAttributesFlow',
    inputSchema: GenerateSimulationAttributesInputSchema,
    outputSchema: GenerateSimulationAttributesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
