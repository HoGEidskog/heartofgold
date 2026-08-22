# Slik settes redigeringsløsningen opp

Målet: Siv og Thor Arne logger inn på `heartofgold.no/admin`, skriver en nyhet
med bilde fra mobilen, og trykker publiser. Ett minutt senere er det ute.

Regn med 20–30 minutter. Alt gjøres én gang.

---

## Hvorfor det trengs en innloggingstjeneste

Nettstedet er statisk – det finnes ingen server som kan holde på passord.
CMS-et lagrer i stedet endringene rett i GitHub-repoet, og logger deg inn med
GitHub-kontoen din.

GitHub tillater ikke at en nettside logger inn direkte fra nettleseren. Det må
gå gjennom en mellomtjener som holder på hemmeligheten. Den tjeneren er noen få
linjer kode og kjører gratis hos Cloudflare.

Ingenting av dette koster penger.

---

## Steg 1 · Siv trenger en GitHub-konto

Uten konto, ingen innlogging.

1. Siv oppretter konto på **github.com/signup** (gratis)
2. Hun sender brukernavnet sitt til deg
3. Du åpner **github.com/HoGEidskog/heartofgold/settings/access**
   → *Add people* → skriv inn brukernavnet → velg rollen **Write** → *Add*
4. Siv får en e-postinvitasjon hun må godta

> **Merk:** Rollen må være Write. Read holder ikke – hun må kunne lagre.

Dette steget krever at du er logget inn som **HoGEidskog**, siden det er den
kontoen som eier repoet.

---

## Steg 2 · Deploy innloggingstjenesten

1. Gå til **github.com/sveltia/sveltia-cms-auth**
2. Trykk knappen **Deploy to Cloudflare Workers** i readmen
3. Logg inn med Cloudflare-kontoen (`Heart.of.gold.eidskog@gmail.com`)
4. Følg veiviseren. Cloudflare lager en kopi av koden og setter den i drift

Når den er ferdig, får du en adresse. Den ser slik ut:

```
https://sveltia-cms-auth.NOE-HER.workers.dev
```

**Skriv den ned.** Du trenger den i steg 3 og 4.

---

## Steg 3 · Opprett OAuth-appen på GitHub

Dette er «nøkkelen» CMS-et bruker for å be om innlogging.

1. Gå til **github.com/settings/developers** → *OAuth Apps* → **New OAuth App**
2. Fyll ut:

   | Felt | Verdi |
   |---|---|
   | Application name | `Heart of Gold CMS` |
   | Homepage URL | `https://heartofgold.pages.dev` |
   | Authorization callback URL | worker-adressen fra steg 2, med `/callback` bak |

   Callback-adressen blir altså noe slikt:
   `https://sveltia-cms-auth.NOE-HER.workers.dev/callback`

3. Trykk *Register application*
4. På siden som kommer opp: kopier **Client ID**
5. Trykk **Generate a new client secret** og kopier verdien

> **Client secret vises bare én gang.** Får du den ikke lagret, må du lage en ny.
> Den skal ikke deles, ikke sendes på e-post, og aldri legges i repoet.

**Hvem skal eie appen?** Logg inn som **HoGEidskog** når du oppretter den, så
tilhører den foreningen og ikke en privatperson. Den virker teknisk sett like
godt fra din egen konto, men da forsvinner den om du en gang slutter.

---

## Steg 4 · Koble nøkkelen til tjenesten

1. Gå til **dash.cloudflare.com** → *Workers & Pages* → `sveltia-cms-auth`
2. *Settings* → *Variables and Secrets*
3. Legg inn tre stykker:

   | Navn | Verdi | Type |
   |---|---|---|
   | `GITHUB_CLIENT_ID` | Client ID fra steg 3 | Text |
   | `GITHUB_CLIENT_SECRET` | Client secret fra steg 3 | **Secret** |
   | `ALLOWED_DOMAINS` | `heartofgold.pages.dev, heartofgold.no, *.heartofgold.no` | Text |

   Navnene må skrives nøyaktig slik, med store bokstaver og understrek.

4. Trykk *Deploy* så endringene trer i kraft

`ALLOWED_DOMAINS` bestemmer hvilke nettsteder som får bruke innloggingen. Uten
den kan hvem som helst koble sin egen side til tjenesten deres. Listen over
dekker både dagens adresse og domenet når det kommer.

---

## Steg 5 · Si fra til meg

Send meg worker-adressen, så fyller jeg den inn i `public/admin/config.yml` og
pusher. Ett minutt senere virker innloggingen.

Feltet som skal fylles ut ser slik ut i dag:

```yaml
backend:
  name: github
  repo: HoGEidskog/heartofgold
  branch: main
  base_url: https://AUTH-WORKER-ADRESSE.workers.dev   # ← denne
```

Vil du gjøre det selv, er det bare å bytte ut adressen og pushe.

---

## Slik bruker Siv det

1. Gå til **heartofgold.pages.dev/admin** (senere `heartofgold.no/admin`)
2. Trykk *Sign in with GitHub* og logg inn
3. Velg det som skal endres, skriv, og trykk *Publish*

Nettstedet bygger seg selv på nytt. Endringen er ute etter omtrent ett minutt.

Det virker like godt fra mobil som fra PC. Bilder kan lastes opp rett fra
kamerarullen.

**Det hun kan redigere:**

- **Nyheter** – legge ut nytt under Aktuelt
- **Prosjekter** – beløp, medvirkende, bilder, bildegalleri
- **Nytt fra Nepal** – oppdateringer og hilsener
- **Bildegalleri** – bildene på Bilder-siden
- **Innstillinger** – blant annet å slå av jubileumskavalkaden når året er omme

Alt som lagres, havner i GitHub som en vanlig endring. Går noe galt, kan det
rulles tilbake.

---

## Når domenet kommer

Da må to ting oppdateres:

1. **Homepage URL** i OAuth-appen → `https://www.heartofgold.no`
2. `ALLOWED_DOMAINS` er allerede klargjort for det, og trenger ingen endring

---

## Hvis noe ikke virker

**«Authentication aborted» eller tom side etter innlogging**
Callback-adressen i OAuth-appen stemmer ikke med worker-adressen. Sjekk at den
slutter på `/callback` og at det ikke er skrivefeil.

**«Not allowed» ved innlogging**
`ALLOWED_DOMAINS` mangler adressen du er inne på. Husk at `heartofgold.pages.dev`
må stå der så lenge domenet ikke er koblet på.

**Siv får «404» eller kan ikke lagre**
Hun har ikke Write-tilgang, eller har ikke godtatt invitasjonen fra steg 1.

**Innloggingen henger**
Sjekk at både `GITHUB_CLIENT_ID` og `GITHUB_CLIENT_SECRET` er lagt inn, og at
secret-en er lagret som Secret og ikke som vanlig tekst.
