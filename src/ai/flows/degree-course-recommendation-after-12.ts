/**
 * Copyright 2025 Pathfinder AI Contributors
 *
 * Licensed under the MIT License or Apache 2.0 License.
 * See LICENSE-MIT or LICENSE-APACHE for details.
 */

'use server';
/**
 * @fileOverview Recommends degree courses after class 12 based on stream, aptitude, and career goals.
 *
 * - recommendDegreeCourses - A function that recommends degree courses.
 * - DegreeCourseRecommendationInput - The input type for the recommendDegreeCourses function.
 * - DegreeCourseRecommendationOutput - The return type for the recommendDegreeCourses function.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
    DegreeCourseRecommendationInput,
    DegreeCourseRecommendationOutput,
    DegreeCourseRecommendationInputSchema,
    DegreeCourseRecommendationOutputSchema
} from './types';

export async function recommendDegreeCourses(
  input: DegreeCourseRecommendationInput
): Promise<DegreeCourseRecommendationOutput> {
  
  const degreePrompt = ai.definePrompt(
    {
      name: 'degreeCourseRecommendationPrompt',
      model: 'gemini-1.5-flash-latest',
      input: {schema: DegreeCourseRecommendationInputSchema},
      output: {schema: DegreeCourseRecommendationOutputSchema},
      prompt: `You are an expert academic advisor. Recommend suitable degree courses after class 12 based on the following information:

  Stream: {{{stream}}}
  Aptitude and Academic Performance: {{{aptitude}}}
  Career Goals: {{{careerGoals}}}

  Provide a list of recommended courses and detailed rationales for each, incorporating information from past successful student paths. Focus on degree courses and not specific colleges.

  Your output should be in JSON format.
  `,
    }
  );

  const { output } = await degreePrompt(input);
  return output!;
}
