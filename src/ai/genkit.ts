/**
 * Copyright 2025 Pathfinder AI Contributors
 *
 * Licensed under the MIT License or Apache 2.0 License.
 * See LICENSE-MIT or LICENSE-APACHE for details.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import type {PromptOptions} from 'genkit';

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB6rQ4AlwpFvq3q3Ms7FcfL0E2g8yP_VOA';

if (!API_KEY) {
  console.warn(
    'GEMINI_API_KEY environment variable not set. AI features may not work.'
  );
}

// Initialize the AI instance
export const ai = genkit({
  plugins: [googleAI({apiKey: API_KEY})],
});


const STABLE_MODEL = 'gemini-1.5-flash-latest';


//
// Custom prompt wrapper with simplified error handling.
//
export async function definePromptWithFallback<
  I extends z.ZodTypeAny,
  O extends z.ZodTypeAny,
>(options: Omit<PromptOptions<I, O>, 'model'>, input: z.infer<I>) {
  
  const model = googleAI.model(STABLE_MODEL);
  const prompt = ai.definePrompt({...options, model: model as any});
  
  try {
    console.log(`- Using model ${STABLE_MODEL}`);
    const {output} = await prompt(input);
    return {output};
  } catch (err: any) {
    console.error(`- Model ${STABLE_MODEL} failed.`, err);
    // Rethrow the original error for better debugging in the console.
    throw err;
  }
}
