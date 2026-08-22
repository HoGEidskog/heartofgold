# heartofgold.no

Nettstedet til foreningen Heart of Gold i Eidskog. Bygget med [Astro](https://astro.build),
publiseres som statiske filer på Cloudflare Pages. Redigeres via Sveltia CMS på `/admin`.

## Kom i gang lokalt

    npm install
    npm run dev        # http://localhost:4321
    npm run build      # bygger til dist/

## Hvor innholdet ligger

| Hva | Sti |
|---|---|
| Nyheter | `src/content/nyheter/*.md` |
| Prosjekter (ett år/tiltak per fil) | `src/content/prosjekter/*.md` |
| Bildegalleri | `src/data/galleri.json` |
| Bilder | `public/bilder/` |
| Faste sider (om oss, Robert, vedtekter …) | `src/pages/*.astro` |
| Design/farger | `src/styles/global.css` |
| Omdirigering fra gamle Blogger-URL-er | `public/_redirects` |

## CMS

`public/admin/config.yml` må fylles ut ved oppsett:

- `repo:` – GitHub-brukernavn/reponavn
- `base_url:` – adressen til sveltia-cms-auth-workeren

## Å gjøre (fase 2)

- Vipps-nummer og eventuelt kontonummer i `src/pages/stott-oss.astro`
- Organisasjonsnummer samme sted
- Bilder fra Blogger-arkivet og Facebook inn i `public/bilder/`
- Fyll ut prosjektene for 2023–2026 (ligger som plassholdere med `utfylt: false`)
