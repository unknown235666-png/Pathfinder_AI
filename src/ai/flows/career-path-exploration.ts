/**
 * Copyright 2025 Pathfinder AI Contributors
 *
 * Licensed under the MIT License or Apache 2.0 License.
 * See LICENSE-MIT or LICENSE-APACHE for details.
 */

'use server';

/**
 * @fileOverview A career path exploration AI agent.
 *
 * - careerPathExploration - A function that handles the career path exploration process.
 * - CareerPathExplorationInput - The input type for the careerPathExploration function.
 * - CareerPathExplorationOutput - The return type for the careerPathExploration function.
 */

import {ai} from '@/ai/genkit';
import {
  CareerPathExplorationInput,
  CareerPathExplorationOutput,
  CareerPathExplorationInputSchema,
  CareerPathExplorationOutputSchema
} from './types';
import { googleAI } from '@genkit-ai/googleai';


export async function careerPathExploration(
  input: CareerPathExplorationInput
): Promise<CareerPathExplorationOutput> {

  const careerPathPrompt = ai.definePrompt({
    name: 'careerPathExplorationPrompt',
    model: googleAI.model('gemini-pro'),
    input: {schema: CareerPathExplorationInputSchema},
    output: {schema: CareerPathExplorationOutputSchema},
    prompt: `You are an expert career counselor.

You will provide potential career paths, required skills, and job market trends related to the chosen degree course.

Degree Course: {{{degreeCourse}}}`,
  });

  const {output} = await careerPathPrompt(input);
  return output!;
}
