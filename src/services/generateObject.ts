import {config} from 'dotenv';
config();
import { generateObject } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';


const { object } = await generateObject({
  model: google('gemini-1.5-flash'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(JSON.stringify(object, null, 2));