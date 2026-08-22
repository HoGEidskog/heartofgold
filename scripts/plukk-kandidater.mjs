/**
 * Kopierer kandidatbilder fra det indekserte Takeout-arkivet ut i én mappe
 * per prosjekt, klar for manuell gjennomgang.
 *
 * Datovinduet utledes av prosjektets frontmatter:
 *   aar + maned  ->  fra 3 uker før månedsstart til 2 uker etter månedsslutt
 *   aar alene    ->  hele året
 *
 * Skjermbilder – kjent på filnavn eller på at opptakstid er lik opplastingstid –
 * legges i undermappa _skjermbilder i stedet for å utelates, slik
 * at ingenting forsvinner stille. Video kopieres ikke, men listes i
 * _oversikt.txt sammen med metadata for hvert bilde.
 *
 * Bruk:
 *   node scripts/plukk-kandidater.mjs [indeks.jsonl] [ut-mappe]
 */
import { readFile, readdir, mkdir, copyFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const INDEKS = process.argv[2] ?? 'C:/Users/ThorArneJohansen/privat/hog/arkiv/indeks.jsonl';
const UT = process.argv[3] ?? 'C:/Users/ThorArneJohansen/privat/hog/arkiv/kandidater';
const PROSJEKTER = 'src/content/prosjekter';

const MND = {
  januar: 1, februar: 2, mars: 3, april: 4, mai: 5, juni: 6,
  juli: 7, august: 8, september: 9, oktober: 10, november: 11, desember: 12,
};

function felt(fm, navn) {
  const m = fm.match(new RegExp('^' + navn + ':\\s*"?([^"\\n]*)"?\\s*$', 'm'));
  return m ? m[1].trim() : null;
}

// Prosjektene leses fra frontmatter
const pros = [];
for (const f of (await readdir(PROSJEKTER)).filter(f => f.endsWith('.md'))) {
  const fm = (await readFile(path.join(PROSJEKTER, f), 'utf8')).split('---')[1] ?? '';
  const aar = Number(felt(fm, 'aar'));
  if (!Number.isFinite(aar)) continue;
  const mnd = MND[(felt(fm, 'maned') ?? '').toLowerCase()] ?? null;
  pros.push({ slug: f.replace(/\.md$/, ''), tittel: felt(fm, 'tittel') ?? f, aar, mnd });
}

const idx = (await readFile(INDEKS, 'utf8')).trim().split('\n').map(l => JSON.parse(l));

function vindu(p) {
  if (p.mnd) {
    return [
      Date.UTC(p.aar, p.mnd - 1, 1) / 1000 - 21 * 86400,
      Date.UTC(p.aar, p.mnd, 1) / 1000 + 14 * 86400,
    ];
  }
  return [Date.UTC(p.aar, 0, 1) / 1000, Date.UTC(p.aar + 1, 0, 1) / 1000];
}

/**
 * Skjermbilder kjennes på to uavhengige måter: filnavnet (Android og Windows
 * navngir dem forutsigbart) og at opptakstid er lik opplastingstid. Ingen av
 * dem fanger alt alene – navnet fanger skjermbilder tatt og lastet opp på
 * ulike tidspunkt, tidsflagget fanger bilder lagret fra andre apper.
 */
function erSkjermbilde(b) {
  return b.flagg.includes('uten-exif') || /^(skjermbilde|screenshot|skjermdump)/i.test(b.navn);
}

function stempel(b) {
  const d = new Date(b.tatt * 1000);
  const p = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}_${p(d.getUTCHours())}${p(d.getUTCMinutes())}`;
}

await mkdir(UT, { recursive: true });

let totKopiert = 0, totByte = 0, totHoppet = 0;
const sammendrag = [];

for (const p of pros.sort((a, b) => a.aar - b.aar || (a.mnd ?? 0) - (b.mnd ?? 0))) {
  const [fra, til] = vindu(p);
  const treff = idx.filter(b => b.tatt >= fra && b.tatt < til);
  if (!treff.length) continue;

  const bilder = treff.filter(b => b.type === 'bilde' && !erSkjermbilde(b));
  const skjerm = treff.filter(b => b.type === 'bilde' && erSkjermbilde(b));
  const video = treff.filter(b => b.type === 'video');

  const mappe = path.join(UT, p.slug);
  await mkdir(mappe, { recursive: true });
  if (skjerm.length) await mkdir(path.join(mappe, '_skjermbilder'), { recursive: true });

  const linjer = [
    `${p.tittel}`,
    `Prosjekt: ${p.slug}`,
    `Vindu:    ${new Date(fra * 1000).toISOString().slice(0, 10)} til ${new Date(til * 1000).toISOString().slice(0, 10)}`,
    `Innhold:  ${bilder.length} bilder, ${skjerm.length} skjermbilder, ${video.length} video`,
    '',
    'BILDER',
  ];

  for (const [liste, undermappe] of [[bilder, ''], [skjerm, '_skjermbilder']]) {
    if (undermappe && liste.length) linjer.push('', 'SKJERMBILDER (lagt til side)');
    for (const b of liste) {
      const nytt = `${stempel(b)}_${b.navn}`;
      const mal = path.join(mappe, undermappe, nytt);
      let finnes = false;
      try { await stat(mal); finnes = true; } catch { /* ikke kopiert enda */ }
      if (finnes) { totHoppet++; } else {
        await copyFile(b.sti, mal);
        totKopiert++;
        totByte += b.byte ?? 0;
      }
      const detaljer = [
        b.tekst && `"${b.tekst}"`,
        b.personer.length && b.personer.join(', '),
        b.lat && `${b.lat.toFixed(4)},${b.lon.toFixed(4)}`,
        b.favoritt && 'FAVORITT',
      ].filter(Boolean).join('  ');
      linjer.push(`  ${nytt}${detaljer ? '   ' + detaljer : ''}`);
    }
  }

  if (video.length) {
    linjer.push('', 'VIDEO (ikke kopiert - ligger i arkivet)');
    for (const v of video) linjer.push(`  ${stempel(v)}  ${v.sti}`);
  }

  await writeFile(path.join(mappe, '_oversikt.txt'), linjer.join('\n') + '\n');
  sammendrag.push(`${String(bilder.length).padStart(4)} bilder  ${String(skjerm.length).padStart(3)} skjerm  ${String(video.length).padStart(3)} video   ${p.slug}`);
}

console.log(sammendrag.join('\n'));
console.log(`\nKopiert ${totKopiert} filer (${(totByte / 1024 ** 3).toFixed(2)} GB)${totHoppet ? `, hoppet over ${totHoppet} som fantes fra før` : ''}`);
console.log(`Mappe: ${UT}`);
