# Status – nytt nettsted for Heart of Gold

Sist oppdatert: 22.08.2026

## Hvor vi er nå
Fase 1 er ferdig bygget. Vi står midt i publiseringen, på steg 1 av 4.

| Steg | Status |
|---|---|
| 1. GitHub-repo | **Ferdig.** github.com/HoGEidskog/heartofgold, alle 64 filer inne |
| 2. Cloudflare Pages | **Ferdig.** Live på heartofgold.pages.dev. Astro-preset, npm run build → dist, NODE_VERSION 22. Bygger automatisk ved hver commit |
| 3. Domenet heartofgold.no | Gjenstår. Ligger hos **One.com** (ns01/ns02.no.brand.one.com) |
| 4. CMS-innlogging | Gjenstår. Krever OAuth-app på GitHub og en gratis Cloudflare Worker |

Cloudflare-konto: Heart.of.gold.eidskog@gmail.com, konto-ID bf3b2116a2cfcff9b2e601a8aebab689.
Verifisert live: forsiden, prosjektsiden og omdirigering fra /p/history.html.

Se `claude/publisering.md` for detaljerte steg.

## Valg som er tatt
- **Designretning:** C «Fargesprut» – lyst og moderne, bygget på det fargerike hjertet fra Facebook-logoen
- **Plattform:** Astro (statisk) → GitHub → Cloudflare Pages. Gratis, reklamefritt, eget domene
- **CMS:** Sveltia CMS på `/admin`, GitHub-innlogging for Siv og Thor Arne
- **Konto:** GitHub-brukeren **HoGEidskog** eier repoet

## Innhold som er migrert
- **32 prosjekter, 2001–2026**, med beløp, mottaker og medvirkende musikere
- Registrerte bidrag: **672 618 kr**
- Sider: forside, om oss, Robert, prosjekter, aktuelt, bilder, støtt oss, kontakt, vedtekter, 404
- **Vipps: #86319**
- RSS, sitemap, favicon, robots.txt, omdirigering fra alle gamle Blogger-URL-er
- Testet uten horisontal overflyt på 390, 820 og 1440 piksler

## Gjenstår
### Publisering
Steg 1–4 over.

### Innhold (fase 2)
- Sju beløp mangler: 2021, 2022, 2023, 2024, 2025 (konsert), 2025 (romjulspub)
- Artistlister for konsertene i 2024 og 2025 – ligger som bilder i Facebook-innlegg
- Logo i høy oppløsning
- Bilder fra Blogger-arkivet (15 stk) og Facebook
- Organisasjonsnummer, hvis foreningen er registrert

## Filer
- `heartofgold-nettsted.zip` – hele kildekoden, klar for opplasting
- Kildekoden er også et ferdig git-repo med én commit
