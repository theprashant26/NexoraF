# Nexora Institute website

A static, build-free HTML site for Nexora Institute of Professional Studies. No framework, no
bundler, no `npm install` — just files a web server can hand out.

Send [CLIENT-REQUIREMENTS.md](CLIENT-REQUIREMENTS.md) to the institute to collect verified content,
legal copy, integrations, and image assets. That is the only requirements document.

## Run locally

Serve the project directory through any static web server. The programme index, the programme
detail template, and the admissions programme select all load JSON with `fetch`, so opening the
HTML directly from the filesystem (`file://`) will not work.

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## The design

An editorial system built on **two surfaces that alternate down every page** — warm paper and warm
charcoal. This is not a theme toggle and there is no switcher: each section declares its own
surface, and the rhythm is fixed in the markup.

- **Surfaces** — paper `#F6F4EF`, a second paper `#EDE9E0` for banding, charcoal slab `#23211D`,
  and one saturated cobalt block reserved for the call to action. The chrome (header, mega menu,
  drawer, footer) is charcoal on every page, so the sticky header reads as one consistent band
  whether the section under it is light or dark.
- **Palette** — ink `#1A1A18` on paper, off-white `#F2EFE7` on charcoal. Cobalt `#2340D8` is the
  brand colour on light; on charcoal it is replaced by periwinkle `#8AA0FF`, which is the only
  thing bright enough to read there. Coral `#E84921` is for warnings only.
- **Type** — Bricolage Grotesque for display, Karla for body, IBM Plex Mono for labels, programme
  codes, buttons, and figures. The mono is doing real work here; it is what makes the index read
  as an index.
- **Structure** — hairline rules and shared borders, never drop shadows. Elevation, where it
  exists, is a hard offset block.
- **Shape** — near-square. Radii top out at 6px; there are no pills.
- **Signature block** — the programme listing is a ruled contents index, one row per programme,
  rather than a grid of cards.

To rebrand, change `assets/css/tokens.css`. Every colour, size, radius, and easing lives there.

### Which sections are dark

| Page | Charcoal sections |
|---|---|
| Home | Masthead, the "our position" statement, the four-step route |
| About | Masthead, "what programmes include" |
| Programmes | Masthead |
| Programme detail | Masthead, programme recognition |
| Admissions | Masthead, FAQ |
| Gallery / Contact / Disclaimer | Masthead |
| 404 | Whole page |

Add `nx-surface-slab` to a `<section>` to make it charcoal; every component inside it already has
a dark variant. Contrast on both surfaces is verified to WCAG AA.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — masthead, learning groups, statement, sample index, commitments, route, tiles, CTA |
| `about.html` | Institute and programme approach |
| `programmes.html` | The full searchable, filterable index of all 21 programmes |
| `programme.html?code=MIRTC` | Shared programme detail template |
| `admissions.html` | Four-step route, enquiry form, FAQ |
| `gallery.html` | Filterable tiles with lightbox |
| `contact.html` | Contact details and contact form |
| `disclaimer.html` | Recognition, career, privacy, and terms statements |
| `404.html` | Not-found page |

## Structure

```
assets/
  css/     tokens → base → components → layout, imported by main.css
  js/      nav, data, programmes, forms, gallery, motion, seo
  data/    programmes.json — source of truth for all 21 programmes
  img/     SVG placeholders, swapped for client photography
  brand/   logo
```

### CSS

`main.css` is the only stylesheet the pages link. It imports, in cascade order:

- `tokens.css` — colours, type scale, spacing, radii, easing, z-layers.
- `base.css` — reset, typography, containers, rules, surfaces, motion initial states.
- `components.css` — buttons, index rows, panels, header, footer, forms, accordion, lightbox.
- `layout.css` — page-level compositions and all responsive rules.

### JavaScript

Each file is a plain IIFE attaching to a shared `window.NX` namespace. Load order matters:
`nav.js` renders the chrome, then `motion.js` animates it.

- `nav.js` — renders the header, mega menu, mobile drawer, and footer into `[data-nx-site-header]`
  and `[data-nx-site-footer]` mount points on every page.
- `data.js` — one memoised `fetch` of `programmes.json`, plus HTML escaping.
- `programmes.js` — index filter/search and the programme detail template.
- `forms.js` — validation, honeypot, and submission for both forms.
- `gallery.js` — category filters and the shared lightbox.
- `motion.js` — the GSAP system (see below).
- `seo.js` — fills in canonical and Open Graph tags on pages that do not declare them.

## Motion

GSAP 3 with ScrollTrigger, loaded from CDN and orchestrated entirely by `assets/js/motion.js`.
The vocabulary is editorial rather than cinematic — there is no preloader, no custom cursor, no
marquee, and nothing is pinned, so the page always scrolls at its natural speed.

| Hook | Effect |
|---|---|
| `data-mast` | The one scripted entrance: kicker, rule draw, headline wipe, band reveal |
| `data-wipe` | A heading opens left to right behind its own mask |
| `data-draw` | A hairline rule draws from the left |
| `data-reveal` | Fade and rise, batched by ScrollTrigger |
| `data-deal` | Ruled rows deal in from the left, staggered |
| `data-count` | A figure counts up |
| `data-media-reveal` | An image opens from the bottom edge |

Headings are wiped rather than split into words, so text stays selectable and reads normally to
assistive technology.

Two rules hold the system together:

1. **Nothing is hidden unless something can bring it back.** An inline script adds `nx-js` to
   `<html>`; only then do the pre-hidden states apply. If GSAP fails to load, `motion.js` removes
   the class and everything paints normally.
2. **`prefers-reduced-motion` is respected.** Animation is skipped, but behaviour users depend on
   — accordions, the lightbox, the sticky header — is bound regardless.

Content rendered after page load should call `NX.motion.reveal(container)` or
`NX.motion.deal(container)`.

## Add a programme

Add one complete object to `assets/data/programmes.json` using the existing schema: `id`, `number`,
`division`, `code`, `certificate`, `programme`, `group`, `keyAreas`, `slug`. `group` must be one of
the four existing values, or the filters will not match it.

Then update, together:

- `sitemap.xml` — add the `programme.html?code=…` entry,
- the `<noscript>` list in `programmes.html`,
- the mega-menu division list in `assets/js/nav.js`, if the division is new.

## Swap images

The design needs 13 photographs in total — the index and the learning-group columns are
typographic, not image-led. Replace the SVG placeholders in `assets/img/placeholders/` with
approved client images using the filenames and dimensions in section 6 of
[CLIENT-REQUIREMENTS.md](CLIENT-REQUIREMENTS.md). Keep the explicit `width`, `height`, and
descriptive `alt` on every `<img>`, and add `<picture>` with WebP and JPEG sources.

Photographs are shown with no colour overlay, so natural, well-lit frames suit the paper
background best.

## Before launch

Search the project for `{{PLACEHOLDER` — every match is something the institute still needs to
supply. Section 9 of the requirements document lists them all with their locations.

## Compliance

Do not add claims of government, university, UGC, AICTE, statutory-board, or professional-licensing
recognition, or of guaranteed employment, appointment, or salary, without verified applicable
approval and approved legal copy. The recognition statement and the career notice appear in the
footer on every page and must stay unless replaced with approved wording of the same meaning.
