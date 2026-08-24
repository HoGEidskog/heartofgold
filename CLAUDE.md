# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Nettstedet til foreningen Heart of Gold i Eidskog. Alt innhold, alle feltnavn og alle
kodekommentarer er på norsk – hold deg til det, også i commit-meldinger (imperativ:
«Legg inn …», «Rett …»).

## Kommandoer

    npm install
    npm run dev        # http://localhost:4321
    npm run build      # kjører prebuild først, bygger til dist/
    npm run preview

Det finnes ingen tester, ingen linter og ingen typesjekk utover `astro check`
(ikke satt opp som script). Verifiser endringer med `npm run dev`.

`prebuild` kjører `scripts/hent-bilder.mjs`, som laster ned det gamle Blogger-arkivet.
Skriptet feiler stille – bygget stopper aldri på et bilde som ikke lar seg hente.

Arkivskriptene arbeider mot et privat Google Takeout-uttrekk **utenfor repoet**
(`privat/hog/arkiv/`), ikke mot noe i prosjektet:

    node scripts/indekser-arkiv.mjs [takeout-mappe] [ut-fil] [--exif]
    node scripts/plukk-kandidater.mjs [indeks.jsonl] [ut-mappe]

## Publisering

Hver push til `main` bygger og går rett i produksjon på Cloudflare Pages – det finnes
ingen mellomstasjon. Skal du prøve noe større, bruk en branch og la Cloudflare lage en
forhåndsvisning.

## Arkitektur

Statisk Astro-side (`output`-standard, ingen adapter, ingen klientrammeverk – kun små
`<script>`-blokker i enkeltsider). Redigeres av foreningen selv gjennom Sveltia CMS på
`/admin`, som skriver rett til markdown-filene i `src/content/` og JSON i `src/data/`.

### Innholdsmodellen

Fire collections i `src/content.config.ts` (zod-skjema, `glob`-loader):
`prosjekter`, `nyheter`, `nepal`, `hjelpere`. `prosjekter` er kjernen – alt annet
henger på den.

Innholdet nås langs tre akser, alle utledet av felt på prosjektene:

| Akse | Felt | Side |
|---|---|---|
| Tid – når skjedde det | `aar` + `maned` | `/prosjekter` (tidslinje) |
| Form – hvordan ble pengene skaffet | `type` | `/aktiviteter/[type]` |
| Mottaker – hvem gikk de til | `serie` | `/nepal` |

`type` og `serie` er ortogonale: quizene går til Nepal, men det gjorde konserten i 2016
og Montessoriskolens julemarknad også. Nepal er derfor ikke en aktivitetstype.

Legger du til en aktivitetstype må **både** enum-en i `src/content.config.ts` og
`AKTIVITETER` i `src/lib/aktiviteter.ts` oppdateres – lista der styrer navn, farge,
tekst og rekkefølge på `/aktiviteter`, og `finnAktivitet()` faller tilbake på siste
element (`annet`) for ukjente verdier.

### Bilder

`src/lib/prosjektbilder.ts` (`bilderFor`) er den ene stedet som avgjør hvilke bilder et
prosjekt har. Den slår sammen tre kilder – `bilde` i frontmatter (utvalgt),
`bilder`-lista (CMS-galleri) og arkivbilder hentet ved bygging – dedupliserer på
filnavn og velger utvalgt bilde automatisk når redaktøren ikke har satt ett.
Alle sider som viser prosjektbilder går gjennom denne funksjonen.

`/bilder` er et samlegalleri som i tillegg trekker inn Nepal-oppdateringene og
`src/data/galleri.json`, slik at et bilde lagt inn ett sted også dukker opp der.

Alle bilder er committet i `public/bilder/`, og `src/data/arkivbilder.json` er en vanlig
statisk fil som redigeres for hånd. Bygget henter ingenting utenfra. Slik har det ikke
alltid vært: fram til august 2026 ble de 15 arkivbildene lastet ned fra Bloggers
bildeserver ved hvert bygg av et `prebuild`-skript. Det er fjernet, fordi Blogger-bloggen
skal tas ned – lar du bygget avhenge av en kilde utenfor repoet, forsvinner bildene stille
den dagen kilden dør.

### Video

Nepal-oppdateringene har et `videoer`-felt: `fil`, `plakat`, `tekst`, `kreditering`.
Lokale klipp legges i `public/videoer/`, men `fil` tar like gjerne en full URL — feltet
er med vilje en URL og ikke en repo-sti, slik at klippene kan flyttes til ekstern
lagring uten at koden endres. Sveltia CMS har innebygd støtte for Cloudflare R2, og en
`media_libraries.cloudflare_r2`-blokk i `config.yml` er da alt som skal til.

To ting styrer avspilleren: `preload="none"` gjør at ingen videobytes lastes ned før
noen trykker play, og `plakat` er stillbildet som vises i mellomtiden. Uten plakat står
ruta svart.

**Cloudflare Pages tåler maks 25 MiB per fil**, og det er en hard grense. En rå
telefonvideo på ett minutt er gjerne 125 MB og må kodes om — 720p ved ~1,5 Mbit/s gir
omtrent 11 MB. Legges en for stor fil inn, feiler publiseringen; forrige vellykkede
utgave blir stående, så nettstedet går ikke ned.

### Tall og beløp

Totalsummer regnes alltid ut fra `belop` i frontmatter (`reduce` over collection-en) –
aldri hardkod et beløp i en side. Prosjekter uten `belop` telles opp og nevnes som
manglende, så tallet aldri framstår som fasit.

### Faste sider

`/om-oss` henter brødteksten fra `src/content/sider/om-oss.md`, som redigeres i CMS-et under
«Faste sider». Sida importerer markdownen direkte — ikke gjennom en content collection — og
bruker `compiledContent()` for å få HTML-en som streng:

```js
const innhold = (await compiledContent()).replaceAll('{{totalt}}', rundet);
```

Grunnen til strengen er `{{totalt}}`: redaktøren skriver den plassholderen i teksten, og sida
bytter den ut med det utregnede beløpet. Uten det ville noen før eller siden skrevet tallet for
hånd, og det ville gått ut på dato ved neste `belop` som legges inn.

`/kontakt` følger samme mønster, men uten plassholder — der holder `<Content />` fra samme
direkte import. Kontaktboksene er en liste i frontmatter, så de kan legges til og fjernes
fra CMS-et.

**Bunnteksten leser fra `src/content/sider/kontakt.md`.** E-post, navn, telefonnumre og
Facebook-lenka sto tidligere hardkodet i `Footer.astro` i tillegg til på kontaktsida. Endres
et nummer nå, slår det gjennom begge steder. Legger du kontaktopplysninger et tredje sted,
hent dem herfra.

Resten av de faste sidene (`robert`, `vedtekter`, `stott-oss`) har fortsatt teksten hardkodet
i `.astro`-fila. Skal de gjøres redigerbare, er mønsteret over det som skal følges:
markdownfil i `src/content/sider/`, direkte import, og en ny oppføring under `sider` i
`public/admin/config.yml`.

### Design

Ett designsystem i `src/styles/global.css` («Fargesprut»): CSS-variabler for farger
(hentet fra logoen og mørknet til kontrastkrav), typografi og mål. Sidespesifikk CSS
ligger i `<style>` i hver `.astro`-fil. Ingen CSS-rammeverk.

`src/data/nettsted.json` styrer jubileumskavalkaden på forsiden – `"jubileum": false`
fjerner både seksjonen og JavaScript-en.

## CMS-en må holdes i takt med skjemaet

`public/admin/config.yml` speiler feltene i `src/content.config.ts` og `src/data/*.json`
manuelt. Endrer du et felt i skjemaet, endre det samme stedet i config.yml – ellers
lager CMS-et innhold som ikke validerer ved bygging.

## Dokumentasjon

`docs/` inneholder status, publiseringsoppskrift, CMS-oppsett og bildemanifest.
`docs/status.md` er den beste inngangen til hva som gjenstår og hvorfor valgene er tatt.
Notatene der er arbeidsdokumenter, ikke bindende regler.
