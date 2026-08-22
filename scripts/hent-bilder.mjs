/**
 * Henter bildearkivet fra den gamle Blogger-siden ved bygging.
 *
 * Googles bildeserver er ikke tilgjengelig fra alle nettverk, men Cloudflares
 * byggemiljø når den fint. Skriptet laster ned bildene, skalerer dem til
 * maks 1600 piksler og skriver dem til public/bilder/.
 *
 * Skriptet er bevisst «snilt»: klarer det ikke å hente et bilde, hopper det
 * videre og lar bygget gå gjennom uansett. Nettstedet skal aldri falle
 * fordi et gammelt bilde er borte.
 *
 * Når foreningen har levert originalbilder i god kvalitet, kan hele denne
 * filen slettes sammen med prebuild-linjen i package.json.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BASE = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl';
const UT = 'public/bilder';
const MANIFEST = 'src/data/arkivbilder.json';

const BILDER = [
  { fil: 'hog-gullhjerte.jpg',        kilde: 'AVvXsEjAc3lrfEE1RSixWvdSGuEfdwtprzEYb1OWLx3a71vj24DGtGQ5SDYmf_t12XNSqPqyXKBaOqXitSeHw6v00Yp3Aw2_9ZIlgLu7A3H1V-Ywh31Xli55t5BUnFS5aoJwNFU/s1600/AAAA+HoG_hvit.jpg', tekst: 'Heart of Gold-logoen' },
  { fil: '2018-quizkveld.jpg',        kilde: 'AVvXsEhxngwCos7k9BxuVfVXtAfIOkFWy_dWS9SyVcjkX6CLSxNgbWsioebQffCEHZlx6JBvGMasl0qIQhun8dXVce4Q-dgQLYP7Y0HK2E9CNBDUYWUk-OrcFiBV6OX1-aWsm31N7oQlv1YmnoRT/s1600/quiz.jpg', tekst: 'Quizkveld til inntekt for Nepal', aar: '2018', prosjekt: '2018-02-nepal' },
  { fil: '2017-sykehusklovnene.jpg',  kilde: 'AVvXsEiyOjr0_ooKpmdFw3ix_mcAh0iYIc4qjRPr8IzZTfPpGteZKS-pP39lB1GPs5p9dPiHOCzM09yPvTYt7K33z2qeNbh1erVvL2eKOG7ofimgVACLBFGWoOVJMzG7E116fuhqVPseuxQ3pzdq/s1600/klovner-1-%25E2%2592%25B8-Foto-Lisa-Selin.jpg', tekst: 'Sykehusklovnene', aar: '2017', prosjekt: '2017-sykehusklovnene', kreditering: 'Lisa Selin' },
  { fil: '2016-gavekort-oslo.jpg',    kilde: 'AVvXsEghVL7shH5g4EzSoYdVHzJ5F0440ep6IFkHmzabJlrS1TT4NZteBMRBI1XyXNv1Kwud3jmROzw7P27ykSdqlCzU6ISTv23gqTKkoHYInaGCBS_v89PnI0s3QqwI_FYklRecMwoiYL9DNbM_/s1600/AAAAAAAAAAAAAAAAAAAAAAAAA.jpg', tekst: 'Gavekort til uteliggere i Oslo', aar: '2016', prosjekt: '2016-08-gavekort-oslo' },
  { fil: '2015-flyktninger-a.jpg',    kilde: 'AVvXsEgaXqevtbaIhvuGf7PBNM2Tfi1oLBj8-0TujMbOJneYAFJ82i1H_FRxctEkIcW5keLnvO2pqcNYHuQD0a2VBPf5hkzkU7mGoT8a_5UdKgrY2Rvc9Dl7bDGOcy5IaF1NbawMLbgK95d_sH7x/s1600/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg', tekst: 'T-skjorter og armbånd til inntekt for flyktninger', aar: '2015', prosjekt: '2015-flyktninger' },
  { fil: '2015-flyktninger-b.jpg',    kilde: 'AVvXsEiGWnRXHzkbRfLoENLy3l-QDzttOd0GGUERVqPAkkPfJxD4T5gFdRwWJO116f2H8a6yp3TvHdqfh3nmi_rCxozFnEIaQbd8nY0kkbO8FMUWMy3jOAMjfDG9k2lRBUV88N7H3eQLYLQWjPe3/s1600/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg', tekst: 'Innsats for andre ved Eidskog ungdomsskole', aar: '2015' },
  { fil: '2014-strikkeaksjon.jpg',    kilde: 'AVvXsEjzdW1API886bB4u8BRoofEwGG86v_0pQiLepBdOJ46lV0uA0BAbeG-KrX_eZaV8-IkkFpTDqRrO0qcaSbbVb0VrOAFSrugRwOu4QKNcnvTulLFTF3yuLGkwFYxaNRJVnoaoLmSYFUv1zPq/s1600/aaaaaaaaaaaaaaa.jpg', tekst: '360 babyluer til Leger Uten Grenser', aar: '2014', prosjekt: '2014-strikkeaksjon' },
  { fil: '2013-elveparken.jpg',       kilde: 'AVvXsEjbXjlJaIies9OZkK3x5O7PwUOriZitSjjJyW6q39EcAn3ZeKSlSuXiQxoJfh9-0mcdfdtAMWEnhQsDpZ5iwZbOoUG1mRxcrtw0jXoK_xs6hXVEweiBgfFokwDC3LDRuuq_sEsHCpheJAlC/s1600/12.jpg', tekst: 'Konsert i Elveparken', aar: '2013', prosjekt: '2013-frivilligsentral' },
  { fil: '2009-heart-of-gold.jpg',    kilde: 'AVvXsEiR-xEHqBvjxuC4nIgaNysAMc02O3quWSxDC9HeLis3KJjRCqqtHXFHPimPL9yC96m7PVqoQdYG5W2yoehPa1IQaZW3SKH5IlA9ijCb3iL6yYYoueoXQtGVy4TIyLV_i_nG7JOuwjo8a9PP/s1600/hog1.jpg', tekst: 'Heart of Gold-konsert', aar: '2009', prosjekt: '2009-fattighuset' },
  { fil: '2007-magnordagen.jpg',      kilde: 'AVvXsEgAUQFzKFzxZU4Kt5Bm7X368Ho4wZVxQJLsauRBGR7ZnHmbea16mfOZqPeSRhcLIRyEakzftNvgEbFWH3r0_8X21X2mQUI_j137OUbdDuUc0sTzx749ILohPJsbYqe_SYtJYvTsWJHsDG6V/s1600/heart+1.JPG', tekst: 'Fra konserten i 2007', aar: '2007', prosjekt: '2007-magnor-skole' },
  { fil: '2004-frelsesarmeen.jpg',    kilde: 'AVvXsEgFlnCzdWoHmg18WGb-qIG9pZTlAr1Xxqrt1JaQoI_qvaYqyMpG6hruFesFYc4WptQPdYcVlq9HNJ48LtiDjKhuvDxgH9UqNCW1RyQXKtxxIor4dgNPB0dv9iE1pr9MrtPpnejxAr8qVBMI/s1600/fa.jpg', tekst: 'Suppebussen til Frelsesarmeen', aar: '2004', prosjekt: '2004-suppebussen' },
  { fil: '2002-en-hand-a-holde-i.jpg',kilde:'AVvXsEj1gwvirBKJiVDrWVtg_HIZyPmAwFLAJAhLz5D12CfNdXS8DjRncc1KNksWL3MStMkFKcAa3m9WIhdL7TEswNrSLOAzc2k49sHbxZc5JAHbBhbvsYC-M8rJ2lHn2VUywXRLrPq9B7K1VI-j/s1600/hand%C3%A5+holde.jpg', tekst: 'Støtteforeningen En hånd å holde i', aar: '2002', prosjekt: '2002-en-hand-a-holde-i' },
  { fil: '2001-siv-og-linda.jpg',     kilde: 'AVvXsEhoEPHq_ldcdg60D0weUwZB8sZ-H9uMVWA3ORNb4OXdW5YkXkcbWqIG133GqfZ-AV8BnCm_gkGdqdY2G4E5FtQmdPdaTZGAv14UbHMOHnyka1Lz52vT2vJJMhd1de7EAHiOOytVqncLoX6Y/s1600/siv+og+linda.jpg', tekst: 'Siv og Linda på den aller første konserten', aar: '2001', prosjekt: '2001-ulleval' },
  { fil: 'portrett-siv.jpg',          kilde: 'AVvXsEhA76s_zPllV_K2_iy2tN_rJewcH08piLTCpF82AlK-jUbY2FLB4-FBT9qJWX3zb5EGQA48WKMriFizlYVWVj3M-6a2lwXCHZ4Q1s_A7Onl_qUHZ470NarYsNEnRQEPY_qcYuytfgDyT-l4/s1600/siv(2).jpg', tekst: 'Siv Monica Berg', skjulIGalleri: true },
  { fil: 'portrett-bjorn-olav.jpg',   kilde: 'AVvXsEgU4PfvKfNSj66-1s7-TowwDMcl-ffFlW0XW0apue8dEcSI95dtlSRy2-5hfhUpJEypy04FTh8gk0eFn3f8ceioGNPsXT-dVf3OM915rMyecHgAX1FGi_2kb0Vv_rSmIclE4L2_aOcB6bDS/s1600/botan333.jpg', tekst: 'Bjørn Olav Rønhovde', skjulIGalleri: true },
];

await mkdir(UT, { recursive: true });
await mkdir(path.dirname(MANIFEST), { recursive: true });

const hentet = [];
let nye = 0, hoppet = 0, feilet = 0;

for (const b of BILDER) {
  const mal = path.join(UT, b.fil);
  if (existsSync(mal)) {
    // Målene skal med i manifestet også når bildet lå der fra før
    const m = await sharp(mal).metadata();
    b.bredde = m.width; b.hoyde = m.height;
    hentet.push(b); hoppet++;
    continue;
  }
  try {
    const svar = await fetch(`${BASE}/${b.kilde}`, { signal: AbortSignal.timeout(20000) });
    if (!svar.ok) throw new Error('HTTP ' + svar.status);
    const raa = Buffer.from(await svar.arrayBuffer());
    const ut = await sharp(raa)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
    await writeFile(mal, ut);
    const m = await sharp(ut).metadata();
    b.bredde = m.width; b.hoyde = m.height;
    hentet.push(b); nye++;
    console.log(`  hentet  ${b.fil}  ${Math.round(ut.length / 1024)} kB`);
  } catch (e) {
    feilet++;
    console.warn(`  hoppet over ${b.fil}: ${e.message}`);
  }
}

const manifest = {
  bilder: hentet.map(b => ({
    fil: `/bilder/${b.fil}`,
    tekst: b.tekst,
    aar: b.aar ?? null,
    prosjekt: b.prosjekt ?? null,
    kreditering: b.kreditering ?? null,
    skjulIGalleri: b.skjulIGalleri ?? false,
    // Målene brukes til å luke ut bilder som er for små eller for avlange
    // til å vises store, f.eks. i jubileumskavalkaden
    bredde: b.bredde ?? null,
    hoyde: b.hoyde ?? null,
  })),
};
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Bildearkiv: ${nye} nye, ${hoppet} fantes fra før, ${feilet} feilet. ${hentet.length} i manifest.`);
