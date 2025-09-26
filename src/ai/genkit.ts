/**
 * src/ai/genkit.ts
 *
 * Simplified GenKit wrapper to ensure stability.
 *  - Uses a single, stable model ('gemini-pro').
 *  - Uses a single, hardcoded API key.
 *  - Simple error handling.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import type { PromptAction, PromptOptions } from 'genkit';

const API_KEY = "AIzaSyAmsiE5yJAn8UyP0QemsA-fZ4bbKI0DvFU";

if (!API_KEY) {
  console.warn(
    'API key is not set in src/ai/genkit.ts. AI features may not work.'
  );
}

// Initialize the AI instance
export let ai = genkit({
  plugins: [googleAI({ apiKey: API_KEY })],
});

// Define a single, stable model to use for all prompts.
const STABLE_MODEL = 'gemini-pro';

/**
 * A simplified prompt wrapper. It uses one stable model and provides clear errors.
 */
export async function definePromptWithFallback<
  I extends z.ZodTypeAny,
  O extends z.ZodTypeAny,
>(
  options: Omit<PromptOptions<I, O>, 'model'>,
  input: z.infer<I>
): Promise<{ output: z.infer<O> }> {
  
  // Define the prompt with the stable model
  const prompt = ai.definePrompt({ ...options, model: STABLE_MODEL as any });

  try {
    console.log(`- Attempting to use model: "${STABLE_MODEL}"`);
    const res = await prompt(input);
    console.log(`- Success with model: "${STABLE_MODEL}"`);
    return res as { output: z.infer<O> };
  } catch (err: any) {
    console.error(`- PROMPT FAILED with model "${STABLE_MODEL}". Error: ${err.message}`);
    // Rethrow a more specific error to make debugging easier.
    throw new Error(
      `Genkit prompt '${options.name}' failed with model '${STABLE_MODEL}'. Please check API key, project permissions, and model availability. Original error: ${err.message}`
    );
  }
}
