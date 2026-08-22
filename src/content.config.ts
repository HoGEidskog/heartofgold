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
    type: z.enum(['konsert', 'quiz', 'dugnad', 'stotte', 'annet']).default('annet'),
    // Knytter prosjektet til et langvarig arbeid, f.eks. skolen og barnehjemmet
    // i Nepal. Samler dem på en egen side uten å ta dem ut av tidslinjen.
    serie: z.enum(['nepal']).optional(),
    // Id-ene til hjelpere som bidro. Brukes til å telle opp på /gode-hjelpere
    // og til å takke dem på prosjektsiden.
    hjelpere: z.array(z.string()).default([]),
    medvirkende: z.array(z.string()).default([]),
    konferansier: z.string().optional(),
    bilde: z.string().optional(),
    bildetekst: z.string().optional(),
    bildekreditering: z.string().optional(),
    // Galleriet for prosjektsiden. Det utvalgte bildet over vises i oversikten.
    bilder: z
      .array(
        z.object({
          fil: z.string(),
          tekst: z.string().optional(),
          kreditering: z.string().optional(),
        }),
      )
      .default([]),
    utfylt: z.boolean().default(true),
  }),
});

// Oppdateringer fra Nepal – hilsener, bilder og nytt om hvordan pengene brukes.
// Dette er ikke innsamlinger, og hører derfor ikke hjemme i prosjekttidslinjen.
const nepal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/nepal' }),
  schema: z.object({
    tittel: z.string(),
    dato: z.coerce.date(),
    ingress: z.string().optional(),
    bilde: z.string().optional(),
    bildetekst: z.string().optional(),
    bilder: z
      .array(z.object({ fil: z.string(), tekst: z.string().optional(), kreditering: z.string().optional() }))
      .default([]),
  }),
});

// Bedrifter og folk som har stilt opp med lokale, premier, servering eller varer.
// Logo er valgfri – uten den vises navnet som et tekstkort, og siden ser like hel ut.
const hjelpere = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hjelpere' }),
  schema: z.object({
    navn: z.string(),
    bidrag: z.array(z.enum(['lokale', 'premier', 'servering', 'varer', 'penger'])).default([]),
    logo: z.string().optional(),
    bilde: z.string().optional(),
    bildetekst: z.string().optional(),
    lenke: z.string().optional(),
    // Styrer rekkefølgen. Lavere tall først, ellers alfabetisk.
    rekkefolge: z.number().default(50),
  }),
});

export const collections = { nyheter, prosjekter, nepal, hjelpere };
