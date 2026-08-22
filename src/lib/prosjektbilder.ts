/**
 * Samler bildene som hører til et prosjekt, fra tre kilder:
 *
 *   1. `bilde` i frontmatter – det utvalgte bildet, valgt av redaktøren
 *   2. `bilder` i frontmatter – galleriet, lagt inn gjennom CMS-et
 *   3. arkivbilder hentet fra den gamle Blogger-siden ved bygging
 *
 * Er ikke noe utvalgt bilde satt, brukes det første i galleriet, ellers det
 * første arkivbildet. Slik får hvert prosjekt et fornuftig oversiktsbilde
 * uten at noen trenger å velge det manuelt.
 */

export type Bilde = {
  fil: string;
  tekst: string;
  kreditering: string | null;
};

type Arkivbilde = {
  fil: string;
  tekst: string | null;
  aar: string | null;
  prosjekt: string | null;
  kreditering: string | null;
};

export function bilderFor(
  id: string,
  data: {
    bilde?: string;
    bildetekst?: string;
    bildekreditering?: string;
    bilder?: { fil: string; tekst?: string; kreditering?: string }[];
  },
  arkiv: Arkivbilde[],
): { utvalgt: Bilde | null; alle: Bilde[] } {
  const fraArkiv: Bilde[] = arkiv
    .filter(b => b.prosjekt === id)
    .map(b => ({ fil: b.fil, tekst: b.tekst ?? '', kreditering: b.kreditering ?? null }));

  const fraGalleri: Bilde[] = (data.bilder ?? []).map(b => ({
    fil: b.fil,
    tekst: b.tekst ?? '',
    kreditering: b.kreditering ?? null,
  }));

  const utvalgt: Bilde | null = data.bilde
    ? {
        fil: data.bilde,
        tekst: data.bildetekst ?? '',
        kreditering: data.bildekreditering ?? null,
      }
    : (fraGalleri[0] ?? fraArkiv[0] ?? null);

  // Samme fil kan opptre både som utvalgt og i galleriet. Første forekomst vinner,
  // slik at teksten redaktøren har skrevet på det utvalgte bildet blir stående.
  const sett = new Set<string>();
  const alle: Bilde[] = [];
  for (const b of [...(utvalgt ? [utvalgt] : []), ...fraGalleri, ...fraArkiv]) {
    if (sett.has(b.fil)) continue;
    sett.add(b.fil);
    alle.push(b);
  }

  return { utvalgt, alle };
}
