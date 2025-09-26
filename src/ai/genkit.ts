/**
 * Copyright 2025 Pathfinder AI Contributors
 *
 * Licensed under the MIT License or Apache 2.0 License.
 * See LICENSE-MIT or LICENSE-APACHE for details.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import type {PromptAction, PromptOptions} from 'genkit';

const API_KEY = "AIzaSyAmsiE5yJAn8UyP0QemsA-fZ4bbKI0DvFU";

if (!API_KEY) {
  console.warn(
    'GEMINI_API_KEY environment variable not set. AI features may not work.'
  );
}

// Initialize the AI instance
export const ai = genkit({
  plugins: [googleAI({apiKey: API_KEY})],
});

// Define a list of models to try in order of preference.
const MODELS_TO_TRY = [
  'gemini-1.5-flash-latest',
];


//
// Custom prompt wrapper with simplified error handling and model fallback.
//
export async function definePromptWithFallback<
  I extends z.ZodTypeAny,
  O extends z.ZodTypeAny,
>(
  options: Omit<PromptOptions<I, O>, 'model'>,
  input: z.infer<I>
): Promise<{ output: z.infer<O> }> {
  
  for (const modelName of MODELS_TO_TRY) {
    const model = googleAI.model(modelName);
    const prompt = ai.definePrompt({...options, model: model as any});
    
    try {
      console.log(`- Attempting to use model: "${modelName}"`);
      const res = await prompt(input);
      console.log(`- Success with model: "${modelName}"`);
      return res as { output: z.infer<O> };

    } catch (err: any) {
      const isRetryableError = err.message?.includes('NOT_FOUND') || err.message?.includes('429');

      if (isRetryableError) {
        console.warn(`- Model "${modelName}" failed or is not available. Trying next model...`);
        continue; // Go to the next iteration of the loop
      }

      console.error(`- PROMPT FAILED with a non-retryable error on model "${modelName}". Error: ${err.message}`);
      // For non-retryable errors, we rethrow to stop the process.
      throw new Error(
        `Genkit prompt '${options.name}' failed with model '${modelName}'. Please check API key, project permissions, and model availability. Original error: ${err.message}`
      );
    }
  }

  // If the loop completes without a successful response, throw an error.
  throw new Error(
    `Genkit prompt '${options.name}' failed after trying all available models: [${MODELS_TO_TRY.join(', ')}]. Please check your API key and project permissions.`
  );
}