# Status – nytt nettsted for Heart of Gold

Sist oppdatert: 22.08.2026

## Hvor vi er nå
Nettstedet er live på **heartofgold.pages.dev** og bygger automatisk ved hver push til `main`.
Det gjenstår to steg av publiseringen: domenet og innloggingen til redigeringsløsningen.

| Steg | Status |
|---|---|
| 1. GitHub-repo | **Ferdig.** github.com/HoGEidskog/heartofgold |
| 2. Cloudflare Pages | **Ferdig.** Astro-preset, `npm run build` → `dist`, NODE_VERSION 22 |
| 3. Domenet heartofgold.no | Gjenstår. Ligger hos **One.com** (ns01/ns02.no.brand.one.com) |
| 4. CMS-innlogging | **Ferdig.** Sveltia CMS på /admin, GitHub-innlogging via Cloudflare Worker |

Cloudflare-konto: Heart.of.gold.eidskog@gmail.com, konto-ID bf3b2116a2cfcff9b2e601a8aebab689.
Innloggingstjeneste: `sveltia-cms-auth.heart-of-gold-eidskog.workers.dev`.
Se `docs/publisering.md` for stegene, og `docs/cms-oppsett.md` for redigeringsløsningen.

### Tilgang
GitHub-brukeren **HoGEidskog** eier repoet. **thoraj** er lagt til med `write`.
OAuth-appen «Heart of Gold CMS» ligger under HoGEidskog sine Developer settings.

Siv trenger egen GitHub-konto med rollen **Write** på repoet før hun kommer inn
i CMS-et. Uten det logger hun inn, men får ikke lagret – og feilmeldingen sier
ikke hva som er galt.

## Struktur
Innholdet nås langs tre akser, som svarer på hvert sitt spørsmål:

| Akse | Spørsmål | Hvor |
|---|---|---|
| Tid | Når skjedde det? | `/prosjekter` – tidslinjen |
| Form | Hvordan ble pengene skaffet? | `/aktiviteter` – konsert, quiz, dugnad, støtte |
| Mottaker | Hvem gikk de til? | `/nepal` – den største hjertesaken |

Feltet `type` i frontmatter styrer aksen for form, `serie` styrer mottakerakse.
Nepal er ikke en aktivitetstype: quizene går dit, men det gjorde konserten i
2016 og Montessoriskolens julemarknad også.

## Valg som er tatt
- **Designretning:** C «Fargesprut» – lyst og moderne
- **Plattform:** Astro (statisk) → GitHub → Cloudflare Pages. Gratis, reklamefritt, eget domene
- **CMS:** Sveltia CMS på `/admin`, GitHub-innlogging for Siv og Thor Arne
- **Prosjektsider:** hvert prosjekt har egen adresse med bildegalleri. Oversikten på
  `/prosjekter/` beholder full tekst, men viser bare ett utvalgt bilde per prosjekt

## Innhold som er migrert
- **31 prosjekter, 2001–2026**, med beløp, mottaker og medvirkende musikere
- Registrerte bidrag: **672 618 kr** (regnes ut fra `belop` i frontmatter, ikke hardkodet)
- Sider: forside, om oss, Robert, prosjekter (+ 31 undersider), aktiviteter
  (+ 4 typesider), Nepal, aktuelt, bilder, støtt oss, kontakt, vedtekter, 404
- **Vipps: #86319**
- RSS, sitemap, favicon, robots.txt, omdirigering fra alle gamle Blogger-URL-er
- Testet uten horisontal overflyt på 390, 820 og 1440 piksler

### Bilder
Alle **15** bildene fra `bildemanifest.md` hentes fra Blogger-arkivet under bygging av
`scripts/hent-bilder.mjs`, skaleres til maks 1600 px og legges i `public/bilder/`.
Skriptet feiler stille, så bygget stopper aldri på et gammelt bilde.

Bildene er **ikke** committet – de hentes på nytt ved hvert bygg. Det betyr at
`src/data/arkivbilder.json` skal ligge **tom** i git; den fylles ved bygging. Bygger du
lokalt, blir fila fylt på disk – ikke commit den i den tilstanden, ellers peker
HTML-en på filer som ikke finnes dersom nedlastingen skulle svikte.

> **Merk:** `publisering.md` sier at Blogger-bloggen kan slettes når alt er verifisert.
> Gjør ikke det før bildene enten er committet eller erstattet med originaler –
> ellers forsvinner alle 15 ved neste bygg.

## Gjenstår

### Publisering
Steg 3 og 4 over.

**Domenet:** heartofgold.no peker i dag på en «Parked»-side hos One.com (104.37.39.71),
altså ikke lenger på Blogger. Den gamle siden lever bare på
heartofgoldeidskog.blogspot.com. Autoritativ spørring mot One.coms navnetjenere viser
**ingen MX-oppføringer, ingen TXT/SPF og ingen mail/webmail/imap/smtp-subdomener** –
foreningen har altså ikke e-post på domenet, og navnetjenerbyttet er risikofritt.

### Innhold (fase 2)
- **Åtte beløp mangler:** 2014 (strikkedugnaden), 2016 (gavekortene), 2021, 2022,
  2023, 2024, 2025 (konsert), 2025 (romjulspub). De to første var trolig aldri
  pengeinnsamlinger
- **Bussen til Valfjellet** er nevnt, men finnes ikke i noen arkiver. Trenger år,
  beløp og mottaker før den kan legges inn
- **Artistlister for 2024 og 2025.** De finnes ikke på Facebook – verken som
  bilder eller tekst. Plakaten for 2024 sier bare «60 lokale aktører»
- **Logo i høy oppløsning.** Se eget avsnitt under
- **Videoer til Nepal-siden.** Legges i Cloudflare R2, ikke i git. R2 er gratis
  opp til 10 GB, og utgående trafikk koster ingenting
- **Sivs navn i vedtektene** står fortsatt med det gamle etternavnet to steder.
  Vedtektene er et vedtatt dokument, så ordlyden er foreningens avgjørelse
- Organisasjonsnummer, og eventuelt kontonummer på Støtt oss-siden

## Kjente svakheter

### Logoen
Logoen i koden (`src/components/Logo.astro` og `public/favicon.svg`) er et **selvtegnet
SVG-hjerte med gradient** – ikke foreningens egen logo. Den ekte er et konturhjerte med
«Heart of Gold» skrevet inni, oppå en malt fargesprut i gult, magenta og blått.

Facebook har den bare som **640×452 JPEG, 14 kB, på hvit bakgrunn**. Ingen større
variant finnes der. Det holder til header og favicon, men ikke til delingsbilder eller
større flater, og bakgrunnen er ikke gjennomsiktig. Originalfilen bør skaffes fra den
som designet logoen – helst vektor, ellers PNG med transparens på minst 1000 px.

### Bildekvaliteten fra Blogger
Dette er originalene Blogger har; `/s1600/` gir ikke mer.

| Bilde | Oppløsning |
|---|---|
| 2018-quizkveld | 1600×1599 |
| 2017-sykehusklovnene | 1600×1065 |
| 2015-flyktninger a/b | 959×960 |
| 2014-strikkeaksjon | 924×915 |
| 2013-elveparken | 698×465 |
| 2007-magnordagen | 640×427 |
| 2004-frelsesarmeen | 615×410 |
| 2009-heart-of-gold | 500×375 |
| hog-gullhjerte (logo) | 327×328 |
| 2002-en-hand-a-holde-i | 563×136 |
| portrett-bjorn-olav | 121×170 |
| 2001-siv-og-linda | **80×75** |

Bildet fra 2001 er en ren miniatyr og bør neppe vises før originalen finnes.
Når originalbilder i god kvalitet er på plass, kan `scripts/hent-bilder.mjs` og
`prebuild`-linjen i `package.json` slettes.

### Facebook som bildekilde
Gjennomgang av siden 22.08.2026: **bare 8 bilder** ligger i bildefanen – quiz-plakat,
et trubadurbilde, vinnerlaget «Agata Quizti», fargesprut-logoen (to ganger), en oransje
hjertelogo, konsertplakaten for 26.10.2024 og ett mørkt arrangementsbilde.

**Ingen artistlister.** Plakaten for 2024 sier bare «60 lokale aktører i aksjon.
Sangere, musikere, dansere», uten navn. Facebook er altså ikke kilden til
prosjektbilder for 2001–2023, og heller ikke til artistlistene.

Neste steg for bilder er Facebooks egen dataeksport (Meta Business Suite →
Last ned informasjonen din, mediekvalitet **Høy**), som gir originalene i stedet for
komprimerte visningsversjoner.

### Bilder som ikke vises noe sted
Portrettene av Siv og Bjørn Olav (`portrett-siv.jpg`, `portrett-bjorn-olav.jpg`) lastes
ned og ligger på serveren, men brukes ingen steder. De er merket `skjulIGalleri: true`,
så de var tiltenkt et sted – antakelig Om oss, som i dag ikke har bilder i det hele
tatt. Portrettet av Bjørn Olav er bare 121×170 og tåler ikke å vises stort.
Det samme gjelder `hog-gullhjerte.jpg`, som ligger i galleriet uten å brukes som logo.

## Arbeidsform
Hver push til `main` går rett i produksjon – det finnes ingen mellomstasjon.
Test lokalt med `npm run dev` først. Skal du prøve noe større, bruk en branch og
la Cloudflare lage en forhåndsvisning.
