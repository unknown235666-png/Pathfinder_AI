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

//
// API Key Setup
//
const API_KEYS = [
  'AIzaSyB6rQ4AlwpFvq3q3Ms7FcfL0E2g8yP_VOA',
].filter(Boolean) as string[];

if (API_KEYS.length === 0) {
  console.warn(
    'GEMINI_API_KEY environment variable not set, and no fallback keys provided. AI features may not work.'
  );
}

let currentApiKeyIndex = 0;

export let ai = genkit({
  plugins: [googleAI({apiKey: API_KEYS[currentApiKeyIndex]})],
});

function getNextApiKey() {
    currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
    const nextKey = API_KEYS[currentApiKeyIndex];
    console.log(`- Switching to next API Key (index: ${currentApiKeyIndex})`);
    // Re-initialize the ai plugin with the new key
    ai = genkit({
        plugins: [googleAI({apiKey: nextKey})],
    });
    return nextKey;
}


//
// Ordered by speed and free quota generosity
//
const MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
];

let currentModelIndex = 0;


//
// Round-robin model selector
//
function getNextModel() {
  const model = MODELS[currentModelIndex % MODELS.length];
  currentModelIndex++;
  return model;
}

//
// Custom prompt wrapper with:
//  - Round-robin load balancing for both models and API keys
//  - Automatic fallback on quota/500 errors
//
export async function definePromptWithFallback<
  I extends z.ZodTypeAny,
  O extends z.ZodTypeAny,
>(options: Omit<PromptOptions<I, O>, 'model'>, input: z.infer<I>) {
  let modelAttempts = 0;
  const initialApiKeyIndex = currentApiKeyIndex;

  while(modelAttempts < MODELS.length * API_KEYS.length) {
    const modelName = getNextModel();
    const currentApiKey = API_KEYS[currentApiKeyIndex];
    
    // After trying all models, switch to the next API key
    if(modelAttempts > 0 && modelAttempts % MODELS.length === 0) {
        getNextApiKey();
        // If we have cycled through all keys, stop.
        if (currentApiKeyIndex === initialApiKeyIndex) {
             console.error("All API keys have been tried and failed.");
             break;
        }
    }

    const model = googleAI.model(modelName);
    const prompt = ai.definePrompt({...options, model: model as any});
    modelAttempts++;

    try {
      console.log(`- Attempt ${modelAttempts}: Using model ${modelName} with API Key index ${currentApiKeyIndex}`);
      const {output} = await prompt(input);
      return {output};
    } catch (err: any) {
      const isRetryableError =
        (err.status && (err.status === 429 || err.status >= 500)) ||
        (err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('API key not valid')));

      if (isRetryableError) {
        console.warn(`  - Model ${modelName} with API Key index ${currentApiKeyIndex} failed (Retryable Error). Trying next combination...`);
      } else {
        console.error(`- Model ${modelName} failed (Non-Retryable Error).`, err);
        throw err;
      }
    }
  }


  throw new Error(
    'All available AI models and API keys failed or exceeded their quotas. Please try again later.'
  );
}
