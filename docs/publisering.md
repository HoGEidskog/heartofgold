# Publisering av heartofgold.no

Fire steg. Jeg gjør alt forarbeidet; du gjør det som krever innlogging.
Regn med 30–45 minutter til sammen, og noen timer ekstra før DNS er ferdig utbredt.

---

## Steg 1 · GitHub-repo

GitHub er både lageret for nettstedet og motoren bak redigeringsløsningen. Uten det virker ikke CMS-et.

1. Opprett konto på github.com hvis du ikke har (gratis).
2. Nytt repository: **github.com/new**
   - Navn: `heartofgold`
   - **Public** (kreves for gratis Cloudflare Pages-bygg og for at CMS-innlogging skal gå enkelt)
   - Ikke huk av for README, .gitignore eller lisens – repoet skal være tomt
3. På den tomme repo-siden: **uploading an existing file**
4. Pakk ut `heartofgold-nettsted.zip` og dra **innholdet** i mappa inn i nettleseren
   (ikke selve zip-fila, og ikke mappa – innholdet).
5. Commit.

> Merk: nettstedet er allerede et ferdig git-repo med én commit. Bruker du GitHub Desktop
> eller git på kommandolinjen, kan du pushe direkte i stedet.

---

## Steg 2 · Cloudflare Pages

1. Opprett konto på **dash.cloudflare.com** (gratis).
2. Workers & Pages → Create → Pages → **Connect to Git** → koble til GitHub → velg `heartofgold`.
3. Byggeinnstillinger:

   | Felt | Verdi |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node-versjon (miljøvariabel `NODE_VERSION`) | `22` |

4. Save and Deploy. Etter et par minutter ligger siden på `heartofgold.pages.dev`.

**Her kan du stoppe og se på resultatet.** Alt videre handler om domenet.

---

## Steg 3 · Domenet heartofgold.no

Domenet peker i dag på Blogger. To måter:

**A. Flytt DNS til Cloudflare (anbefalt)**
Gir gratis SSL, raskere oppslag, og er nødvendig for innloggingstjenesten til CMS-et i steg 4.

1. Cloudflare → Add a site → `heartofgold.no` → Free plan
2. Cloudflare leser eksisterende DNS og gir deg to navnetjenere
3. Logg inn hos registraren (Domeneshop, Domainname, One.com …) og bytt navnetjenere til Cloudflares
4. Tilbake i Pages-prosjektet: Custom domains → Set up a domain → `heartofgold.no`, og gjenta for `www.heartofgold.no`

**B. Behold DNS hos registraren**
Legg inn en CNAME fra `www` til `heartofgold.pages.dev`, og ALIAS/ANAME på rotdomenet hvis
registraren støtter det. Enklere, men mindre fleksibelt.

Utbredelse tar fra noen minutter til et døgn.

---

## Steg 4 · Redigeringsløsningen (CMS)

Sveltia CMS ligger klart på `/admin`, men trenger to ting:

**4a. En innloggingstjeneste.** GitHub krever en mellomtjener for innlogging fra nettleseren.
Cloudflare kjører den gratis:

1. Deploy `sveltia/sveltia-cms-auth` som en Worker (ferdig oppskrift i repoets README)
2. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - Homepage URL: `https://www.heartofgold.no`
   - Authorization callback URL: workerens adresse + `/callback`
3. Legg Client ID og Client Secret inn som secrets på workeren

**4b. Fyll ut `public/admin/config.yml`:**

```yaml
backend:
  name: github
  repo: DITT-BRUKERNAVN/heartofgold
  branch: main
  base_url: https://ADRESSEN-TIL-WORKEREN.workers.dev
```

Deretter går Siv til `heartofgold.no/admin`, logger inn med GitHub, og kan legge ut nyheter og
bilder fra mobilen. Hver endring bygger siden på nytt automatisk, live etter omtrent ett minutt.

---

## Etterpå

- Sjekk at gamle lenker virker: `heartofgold.no/p/history.html` skal havne på `/prosjekter`
- Meld inn nettstedet i Google Search Console
- Slett eller arkiver den gamle Blogger-bloggen når alt er verifisert
