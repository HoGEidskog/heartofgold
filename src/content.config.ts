import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const nyheter = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/nyheter' }),
  schema: z.object({
    tittel: z.string(),
    dato: z.coerce.date(),
    ingress: z.string().optional(),
    bilde: z.string().optional(),
    bildetekst: z.string().optional(),
  }),
});

const prosjekter = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/prosjekter' }),
  schema: z.object({
    aar: z.number(),
    maned: z.string().optional(),
    tittel: z.string(),
    mottaker: z.string().optional(),
    belop: z.number().optional(),
    type: z.enum(['konsert', 'quiz', 'aksjon', 'annet']).default('annet'),
    medvirkende: z.array(z.string()).default([]),
    konferansier: z.string().optional(),
    bilde: z.string().optional(),
    bildekreditering: z.string().optional(),
    utfylt: z.boolean().default(true),
  }),
});

export const collections = { nyheter, prosjekter };
