# Nexora Institute website

A static, build-free HTML site for Nexora Institute of Professional Studies. No framework, no
bundler, no `npm install` — just files a web server can hand out.

Content and photography from the institute have been applied.
[CLIENT-REQUIREMENTS.md](CLIENT-REQUIREMENTS.md) now lists only what is still outstanding — send
that to the institute to chase the remainder.

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
| Home | The "our position" statement, the four-step route |
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
- `slider.js` — the masthead slider.
- `motion.js` — the GSAP system (see below).
- `seo.js` — fills in canonical and Open Graph tags on pages that do not declare them.

## Masthead slider

`assets/js/slider.js` drives the image slider that forms the **background of the
home hero**. It is deliberately independent of GSAP — the crossfade is a CSS
opacity transition, so it keeps working if the animation library never loads, and
with no JavaScript at all the first slide is already marked `is-active` in the
markup.

- Auto-advances every 6s, with a real pause button, and pauses on hover, on
  keyboard focus, and while the tab is hidden.
- Under `prefers-reduced-motion` it does not auto-advance at all, and the pause
  button is hidden because it would have nothing to do.
- Arrow keys, swipe, dots and prev/next all work; a visually hidden live region
  announces the slide, but only when the viewer moved it, not the timer.

### The scrim

Text sits over photography here, which normally means a dark overlay — but this
hero is meant to be light. So `.nx-mast__scrim` is a **light** wash of the paper
colour instead, and the headline stays dark ink.

The gradient is held at exactly `90deg`. A tilted gradient makes the alpha behind
any given element unpredictable, and the whole contrast argument rests on knowing
that number. Stops were chosen against the worst case — a pure black photograph:

| Text colour | Minimum alpha to pass AA |
|---|---:|
| `--nx-ink` `#1A1A18` | 0.53 |
| `--nx-ink-2` `#56534C` | 0.82 |
| `--nx-ink-3` `#6A665D` | 0.94 |

`--nx-ink-3` would need an almost opaque wash, so no faint ink is used over the
scrim: `.nx-mast .nx-label` and `.nx-mast .nx-figure__label` are promoted to full
ink. The slider controls and the ghost button carry their own light backing,
because they sit out in the open part of the gradient.

Verified against a pure black slide at 400–1900px: lowest ratio 5.20, no
failures. Any real photograph is more forgiving than that.

If you change the gradient stops, re-run that check — the promoted text colours
and the stop values are a matched pair.

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
`division`, `code`, `certificate`, `programme`, `group`, `keyAreas`, `slug`, `fee`,
`duration`, `instalments`, `eligibility`, `learningMode`, `certificateTitle`, `feeConfirmed`.
`group` must be one of the four existing values, or the filters
will not match it. Fees are plain integers in rupees; the programme page formats them with Indian
digit grouping.

Then update, together:

- `sitemap.xml` — add the `programme.html?code=…` entry,
- the `<noscript>` list in `programmes.html`,
- the mega-menu division list in `assets/js/nav.js`, if the division is new.

## Images

Photography lives in `assets/img/nexora/`, renamed to plain kebab-case on the way in — the supplied
filenames carried spaces, ampersands and a `9120` typo, all of which are trouble in a URL.

| On the site | Supplied as |
|---|---|
| `hero-01.jpg` … `hero-03.jpg` | `2400-by-1600.jpg`, `…-Slide-2.jpg`, `…-Slide-3.jpg` |
| `tile-classroom.jpg` | `1600-By-1200 Classroom environment at Nexora Institute.jpg` |
| `tile-materials.jpg` | `1600-By-1200-Learning-materials-and-equipment.jpg` |
| `tile-learner.jpg` | `1600-By-1200-Learner-in-a-practical-session.jpg` |
| `tile-group.jpg` | `1600-by-1200-Group-learning-session.jpg` |
| `tile-instructor.jpg` | `1600-by-1200-Instructor-in-a-practical-setting.jpg` |
| `tile-campus.jpg` | `Campus-detail.jpg` |
| `banner-<code>.jpg` | `<Programme>-1920-by-720.jpg`, one per programme |

Each programme's banner is set in `programmes.json` via `banner` and `bannerAlt`, so the detail
template picks it up automatically — no markup change when a banner is swapped.

All files were re-encoded at JPEG quality 82, progressive, which took the set from 9.1 MB to
6.6 MB with no visible change. Re-run that if new images arrive at full export quality:

```python
from PIL import Image
im = Image.open(path).convert("RGB")
im.save(path, "JPEG", quality=82, optimize=True, progressive=True)
```

`proactive-safety-bg@2x.jpg` was supplied but matches no slot and is unused.

## Swap images

Photography is supplied and live; see the **Images** section above for the file mapping. To replace
one, drop the new file in `assets/img/nexora/` under the same name and re-run the optimiser. Keep
the explicit `width` and `height` on every `<img>` so the page does not shift while images load.

Programme banners need no markup change — set `banner` and `bannerAlt` on the programme in
`assets/data/programmes.json` and the detail template picks it up.

## Before launch

Two sweeps, not one:

```bash
grep -rn "{{PLACEHOLDER" --include=*.html --include=*.js --include=*.txt --include=*.xml .
grep -rn "9876543210"    --include=*.html --include=*.js .
```

The first finds anything the institute has not supplied yet. The second finds the stand-in phone
number `+91 98765 43210`, which a placeholder sweep would sail straight past because it looks like
real data.

Note the sweep greps for the number itself rather than a `DUMMY` comment. Comments in HTML and JS
are served to the public in view-source, and a client site should not advertise which of its
details are fake. Any future stand-in should be tracked the same way — by its value, listed here,
not by a marker in the shipped file.

[CLIENT-REQUIREMENTS.md](CLIENT-REQUIREMENTS.md) lists every outstanding item.

### Fees

`assets/data/programmes.json` carries `fee`, `firstInstalment` and `feeConfirmed` for all 21
programmes. All are confirmed by the institute, in three tiers:

| Fee | At registration | Then | Programmes |
|---:|---:|---|---|
| ₹44,999 | ₹14,999 | 2 × ₹15,000 | Aviation, Metro Rail, Railway, Hotel, Travel & Tourism |
| ₹35,000 | ₹11,666 | 2 × ₹11,667 | The other fifteen |
| ₹19,999 | ₹9,999 | 2 × ₹5,000 | Pharmaceutical |

Each programme carries `fee`, `durationMonths` and an `instalments` array whose entries must sum to
`fee`. The programme page renders the array, collapsing to "2 × ₹15,000" when the later payments are
equal. The first instalment is part of the total fee, not an additional registration charge. Keep
`feeConfirmed` on any programme you add — it is the guard against an unsigned-off price reaching
a live page:

```bash
python -c "import json;print([p['code'] for p in json.load(open('assets/data/programmes.json')) if not p['feeConfirmed']])"
```

## Compliance

Do not add claims of government, university, UGC, AICTE, statutory-board, or professional-licensing
recognition, or of guaranteed employment, appointment, or salary, without verified applicable
approval and approved legal copy. The recognition statement and the career notice appear in the
footer on every page and must stay unless replaced with approved wording of the same meaning.
