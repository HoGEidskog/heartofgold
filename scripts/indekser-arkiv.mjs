/**
 * Indekserer et Google Takeout-uttrekk av Google Foto.
 *
 * Leser sidecar-JSON ved siden av hver mediefil og skriver én linje per bilde
 * til en JSONL-indeks. Indeksen inneholder GPS og personmerking fra private
 * bilder og skal ligge utenfor repoet.
 *
 * Bruk:
 *   node scripts/indekser-arkiv.mjs [takeout-mappe] [ut-fil] [--exif]
 *
 * --exif leser i tillegg kameramerke/modell og pikseldimensjoner fra selve
 * filene. Krever pakken «exifr» og gjør kjøringen betydelig tregere.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROT = process.argv[2] ?? 'C:/Users/ThorArneJohansen/privat/hog/arkiv/takeout';
const UT = process.argv[3] ?? 'C:/Users/ThorArneJohansen/privat/hog/arkiv/indeks.jsonl';
const MED_EXIF = process.argv.includes('--exif');

const MEDIA = new Set([
  '.jpg', '.jpeg', '.png', '.heic', '.heif', '.gif', '.webp', '.tif', '.tiff',
  '.mp4', '.mov', '.m4v', '.avi', '.3gp', '.mts', '.mpg', '.mkv',
]);
const VIDEO = new Set(['.mp4', '.mov', '.m4v', '.avi', '.3gp', '.mts', '.mpg', '.mkv']);

// Takeout-JSON som ikke hører til en enkelt mediefil
const IKKE_SIDECAR = /^(metadata|print-subscriptions|shared_album_comments|user-generated-memory-titles)\.json$/i;

let exifr = null;
if (MED_EXIF) {
  try {
    exifr = (await import('exifr')).default;
  } catch {
    console.warn('exifr ikke installert – hopper over EXIF. Kjør: npm i -D exifr');
  }
}

/**
 * Google forkorter og forvrenger sidecar-navn på flere måter. Vi prøver de
 * kjente variantene i tur og orden, og faller til slutt tilbake på prefiks.
 */
function finnSidecar(filnavn, jsonIMappe) {
  const kandidater = [];
  kandidater.push(`${filnavn}.json`);
  kandidater.push(`${filnavn}.supplemental-metadata.json`);

  // Google kutter sidecar-navnet ved 51 tegn, midt i «supplemental-metadata»
  const full = `${filnavn}.supplemental-metadata`;
  for (let n = 51; n >= filnavn.length + 2 && n < full.length; n--) {
    kandidater.push(`${full.slice(0, n)}.json`);
  }

  // Duplikater: «bilde(1).jpg» får sidecar «bilde.jpg(1).json»
  const dup = filnavn.match(/^(.*?)\((\d+)\)(\.[^.]+)$/);
  if (dup) {
    const [, base, nr, ext] = dup;
    kandidater.push(`${base}${ext}(${nr}).json`);
    kandidater.push(`${base}${ext}(${nr}).supplemental-metadata.json`);
    kandidater.push(`${base}${ext}.supplemental-metadata(${nr}).json`);
  }

  // «-edited»-varianter deler sidecar med originalen
  const red = filnavn.match(/^(.*?)-(edited|redigert)(\.[^.]+)$/i);
  if (red) {
    kandidater.push(`${red[1]}${red[3]}.json`);
    kandidater.push(`${red[1]}${red[3]}.supplemental-metadata.json`);
  }

  for (const k of kandidater) {
    if (jsonIMappe.has(k.toLowerCase())) return jsonIMappe.get(k.toLowerCase());
  }

  // Siste utvei: prefiksmatch på de første 40 tegnene
  const p = filnavn.slice(0, 40).toLowerCase();
  for (const [navn, ekte] of jsonIMappe) {
    if (navn.startsWith(p)) return ekte;
  }
  return null;
}

function tidspunkt(v) {
  const t = Number(v?.timestamp);
  return Number.isFinite(t) && t > 0 ? t : null;
}

const linjer = [];
const tellPerAar = new Map();
let antMedia = 0, antVideo = 0, antBevegelse = 0, utenSidecar = 0, mistenkelig = 0, uexif = 0, totalByte = 0;

async function gaaGjennom(mappe) {
  let oppf;
  try {
    oppf = await readdir(mappe, { withFileTypes: true });
  } catch {
    return;
  }

  const jsonIMappe = new Map();
  for (const o of oppf) {
    if (o.isFile() && o.name.toLowerCase().endsWith('.json') && !IKKE_SIDECAR.test(o.name)) {
      jsonIMappe.set(o.name.toLowerCase(), o.name);
    }
  }

  const mappenavn = path.basename(mappe);
  const erAarsmappe = /^(Photos from|Bilder fra)\s+\d{4}$/i.test(mappenavn);

  // Live Photo / bevegelsesbilde: en .MP4 med samme basenavn som en .jpg er
  // bevegelsesdelen av stillbildet, ikke en selvstendig video. Den har ingen
  // egen sidecar og skal ikke telles som eget medium.
  const stillbildeBasenavn = new Set();
  for (const o of oppf) {
    if (!o.isFile()) continue;
    const e = path.extname(o.name).toLowerCase();
    if (MEDIA.has(e) && !VIDEO.has(e)) {
      stillbildeBasenavn.add(path.basename(o.name, path.extname(o.name)).toLowerCase());
    }
  }

  for (const o of oppf) {
    if (o.isDirectory()) {
      await gaaGjennom(path.join(mappe, o.name));
      continue;
    }
    if (!o.isFile()) continue;

    const ext = path.extname(o.name).toLowerCase();
    if (!MEDIA.has(ext)) continue;

    if (VIDEO.has(ext) && stillbildeBasenavn.has(path.basename(o.name, path.extname(o.name)).toLowerCase())) {
      antBevegelse++;
      continue;
    }

    const full = path.join(mappe, o.name);
    antMedia++;
    if (VIDEO.has(ext)) antVideo++;

    let meta = null;
    const sidecar = finnSidecar(o.name, jsonIMappe);
    if (sidecar) {
      try {
        meta = JSON.parse(await readFile(path.join(mappe, sidecar), 'utf8'));
      } catch { /* ødelagt JSON – behandles som manglende */ }
    }
    if (!meta) utenSidecar++;

    const tatt = tidspunkt(meta?.photoTakenTime);
    const laget = tidspunkt(meta?.creationTime);

    let st = null;
    try { st = await stat(full); } catch { /* ignorer */ }
    if (st) totalByte += st.size;

    // Faller tilbake på filens tidsstempel når sidecar mangler
    const taatt = tatt ?? (st ? Math.floor(st.mtimeMs / 1000) : null);
    const dato = taatt ? new Date(taatt * 1000) : null;
    const aar = dato ? dato.getUTCFullYear() : null;

    // Flagg: dato utenfor rimelig område, eller lik opplastingstid (EXIF manglet)
    const naa = Math.floor(Date.now() / 1000);
    const flaggMistenkeligDato = !taatt || aar < 1995 || taatt > naa + 86400;
    const flaggUtenExif = tatt != null && laget != null && Math.abs(tatt - laget) < 60;
    if (flaggMistenkeligDato) mistenkelig++;
    if (flaggUtenExif) uexif++;

    let kamera = null, bredde = null, hoyde = null;
    if (exifr && !VIDEO.has(ext)) {
      try {
        const e = await exifr.parse(full, ['Make', 'Model', 'ExifImageWidth', 'ExifImageHeight']);
        if (e) {
          kamera = [e.Make, e.Model].filter(Boolean).join(' ').trim() || null;
          bredde = e.ExifImageWidth ?? null;
          hoyde = e.ExifImageHeight ?? null;
        }
      } catch { /* ikke alle filer har lesbar EXIF */ }
    }

    if (aar) tellPerAar.set(aar, (tellPerAar.get(aar) ?? 0) + 1);

    linjer.push(JSON.stringify({
      sti: full.split(path.sep).join('/'),
      navn: o.name,
      type: VIDEO.has(ext) ? 'video' : 'bilde',
      byte: st?.size ?? null,
      tatt: taatt,
      dato: dato ? dato.toISOString().slice(0, 10) : null,
      aar,
      maned: dato ? dato.getUTCMonth() + 1 : null,
      lastetOpp: laget,
      album: erAarsmappe ? null : mappenavn,
      tekst: meta?.description?.trim() || null,
      personer: meta?.people?.map(p => p.name).filter(Boolean) ?? [],
      favoritt: meta?.favorited === true,
      lat: meta?.geoData?.latitude || null,
      lon: meta?.geoData?.longitude || null,
      kamera, bredde, hoyde,
      flagg: [
        !meta && 'uten-sidecar',
        flaggMistenkeligDato && 'mistenkelig-dato',
        flaggUtenExif && 'uten-exif',
      ].filter(Boolean),
    }));
  }
}

console.log(`Leser ${ROT} ...`);
await gaaGjennom(ROT);
await writeFile(UT, linjer.join('\n') + '\n');

const aar = [...tellPerAar.entries()].sort((a, b) => a[0] - b[0]);
console.log(`\n${antMedia} mediefiler (${antMedia - antVideo} bilder, ${antVideo} video), ${(totalByte / 1024 ** 3).toFixed(1)} GB`);
console.log(`  bevegelsesvideo hoppet over: ${antBevegelse}`);
console.log(`  uten sidecar:      ${utenSidecar}`);
console.log(`  mistenkelig dato:  ${mistenkelig}`);
console.log(`  trolig uten EXIF:  ${uexif}`);
console.log(`\nPer år:`);
for (const [a, n] of aar) console.log(`  ${a}  ${String(n).padStart(6)}  ${'#'.repeat(Math.min(60, Math.ceil(n / 20)))}`);
console.log(`\nSkrevet til ${UT}`);
