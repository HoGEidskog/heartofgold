# Status – nytt nettsted for Heart of Gold

Sist oppdatert: 22.08.2026

## Hvor vi er nå
Nettstedet er live på **heartofgold.pages.dev** og bygger automatisk ved hver push til `main`.
Bare ett steg av publiseringen gjenstår: domenet.

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
- **Designretning:** «Fargesprut» – lyst og moderne
- **Plattform:** Astro (statisk) → GitHub → Cloudflare Pages. Gratis, reklamefritt, eget domene
- **CMS:** Sveltia CMS på `/admin`, GitHub-innlogging for Siv og Thor Arne
- **Prosjektsider:** hvert prosjekt har egen adresse med bildegalleri. Oversikten på
  `/prosjekter/` beholder full tekst, men viser bare ett utvalgt bilde per prosjekt
- **Farger hentet fra logoen.** Paletten hadde turkisgrønt og sterk korall, toner
  logoen ikke inneholder. Verdiene er trukket ut av logofila og mørknet så vidt at
  tekst oppå dem holder kontrastkravet. Ligger i `src/styles/global.css`
- **Robert er tonet ned.** Hovedformålet er å gjøre gode ting for andre, og det har
  hovedfokus. Minnesiden ligger urørt på `/robert`, men nås fra tre diskré steder i
  stedet for fra hovedmenyen
- **Jubileumskavalkade på forsiden.** Slås av med `"jubileum": false` i
  `src/data/nettsted.json`, eller fra CMS-et under Innstillinger. Da forsvinner både
  seksjonen og JavaScript-en
- **Tilbakelenke på mobil** i stedet for å måtte åpne menyen. Den følger historikken
  når man kom fra en annen side på nettstedet, så scroll-posisjonen beholdes. Kommer
  noen rett fra et søk, faller den tilbake på stien og sier hvor den fører

## Innhold som er migrert
- **31 prosjekter, 2001–2026**, med beløp, mottaker og medvirkende musikere
- Registrerte bidrag: **728 427 kr** (regnes ut fra `belop` i frontmatter, ikke hardkodet)
- Sider: forside, om oss, Robert, prosjekter (+ 31 undersider), aktiviteter
  (+ 4 typesider), Nepal, aktuelt, bilder, støtt oss, kontakt, vedtekter, 404
- **Vipps: #86319**
- RSS, sitemap, favicon, robots.txt, omdirigering fra alle gamle Blogger-URL-er
- Testet uten horisontal overflyt på 320, 390, 700, 820 og 1440 piksler

### Bilder
Alle **15** bildene fra `bildemanifest.md` hentes fra Blogger-arkivet under bygging av
`scripts/hent-bilder.mjs`, skaleres til maks 1600 px og legges i `public/bilder/`.
Skriptet feiler stille, så bygget stopper aldri på et gammelt bilde.

Bildene er **ikke** committet – de hentes på nytt ved hvert bygg. Det betyr at
`src/data/arkivbilder.json` skal ligge **tom** i git; den fylles ved bygging. Bygger du
lokalt, blir fila fylt på disk – ikke commit den i den tilstanden, ellers peker
HTML-en på filer som ikke finnes dersom nedlastingen skulle svikte.

Manifestet inneholder også målene på hvert bilde. De brukes til å luke ut det som
ikke tåler å vises stort – jubileumskavalkaden hopper over alt under 400 px og alt
mer avlangt enn 2:1.

Seks bilder hentet fra Facebook ligger derimot **committet** i `public/bilder/`, siden
de ikke kan hentes på nytt automatisk: tre fra quizen i 2026, konsertplakaten fra 2024,
et udatert bilde fra Magnor og logoen.

> **Merk:** `publisering.md` sier at Blogger-bloggen kan slettes når alt er verifisert.
> Gjør ikke det før arkivbildene enten er committet eller erstattet med originaler –
> ellers forsvinner alle 15 ved neste bygg.

## Gjenstår

### Publisering
Steg 3 over.

**Domenet:** heartofgold.no peker i dag på en «Parked»-side hos One.com (104.37.39.71),
altså ikke lenger på Blogger. Den gamle siden lever bare på
heartofgoldeidskog.blogspot.com. Autoritativ spørring mot One.coms navnetjenere viser
**ingen MX-oppføringer, ingen TXT/SPF og ingen mail/webmail/imap/smtp-subdomener** –
foreningen har altså ikke e-post på domenet, og navnetjenerbyttet er risikofritt.

### Innhold (fase 2)
- **Seks beløp mangler:** 2014 (strikkedugnaden), 2016 (gavekortene), 2021, 2022,
  2023, 2025 (romjulspub). De to første var trolig aldri pengeinnsamlinger.
  Siv fylte inn 2024 (29 150) og 2025-konserten (26 659) 23.08.2026
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

### Logoen er ekte, men for liten
Foreningens egen logo er i bruk overalt: i toppen, i hero på forsiden, som favicon og
som apple-touch-icon. Den ligger i `public/bilder/logo-hjerte.png`, og både
`Logo.astro` og forsiden peker på samme fil – et bytte er én filutskifting.

Kilden er hentet fra Facebook og er bare **339 px bred** etter beskjæring. Derfor vises
den aldri større enn det: 339 px i hero, 34 px i toppen. Det er nok til de bruksområdene,
men ikke til delingsbilder eller store flater.

Bakgrunnen er fjernet med flomfyll fra bildekanten, ikke på farge alene. Det er med
vilje: de hvite hjertekonturene og teksten er utsparinger i designet, og et enkelt
fargefilter ville gjort dem gjennomsiktige slik at bakgrunnen slo gjennom.

**Originalfilen bør skaffes** fra den som designet logoen – helst vektor, ellers PNG
med transparens på minst 1000 px. Da bør fargeverdiene i `global.css` sjekkes på nytt,
særlig cyanen, som bare utgjør 5 % av flaten og derfor er det svakeste målepunktet.

Foreningen har tre logovarianter i omløp: fargesprut-hjertet (den som brukes), et
oransje hjerte med «Heart of Gold» under, og et banner med rosa/blå gradient og teksten
«gjør verden bedre for noen». Verdt å avklare med Siv hvilken som er *den*.

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

### Facebook er tømt
Siden hadde **8 bilder** i bildefanen. Seks er hentet ned og lagt inn; de to som ble
igjen er logovarianter vi ikke bruker. Bildene fra quizen i 2026 var 1152×2048 – langt
bedre enn Blogger-arkivet.

**Ingen artistlister der.** Plakaten for 2024 sier bare «60 lokale aktører i aksjon.
Sangere, musikere, dansere», uten navn, og innlegget om 2025-konserten sier «mange
flinke musikere og band». Facebook er verken kilden til prosjektbilder for 2001–2023
eller til artistlistene.

Neste steg for bilder er Facebooks egen dataeksport (Meta Business Suite →
Last ned informasjonen din, mediekvalitet **Høy**), som gir originalene i stedet for
komprimerte visningsversjoner. Google Photos-eksporten er den andre kilden.

Merk at nedlasting fra Facebook krever at Chrome får lov til å laste ned flere filer
fra samme side. Uten det stopper det etter den første.

### Bilder som ikke vises noe sted
Portrettene av Siv og Bjørn Olav (`portrett-siv.jpg`, `portrett-bjorn-olav.jpg`) lastes
ned og ligger på serveren, men brukes ingen steder. De er merket `skjulIGalleri: true`,
så de var tiltenkt et sted – antakelig Om oss, som i dag ikke har bilder i det hele
tatt. Portrettet av Bjørn Olav er bare 121×170 og tåler ikke å vises stort.

`quiz-magnor-ukjent-ar.jpg` viser en quizkveld på Magnor med Heart of Gold-banneret på
veggen, men året er ikke fastslått. Det kan være 2020 på ungdomslokalet eller 2023 på
Magnor Torg. Bildet er committet, men ikke knyttet til noe prosjekt.

`hog-gullhjerte.jpg` fra Blogger-arkivet ligger i galleriet. Det er en eldre logovariant
og brukes ikke som logo – den rollen har `logo-hjerte.png`.

## Arbeidsform
Hver push til `main` går rett i produksjon – det finnes ingen mellomstasjon.
Test lokalt med `npm run dev` først. Skal du prøve noe større, bruk en branch og
la Cloudflare lage en forhåndsvisning.
