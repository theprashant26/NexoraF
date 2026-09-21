# Nexora Institute website

A static HTML5 website for Nexora Institute of Professional Studies.

## Run locally

Serve the project directory through any static web server. The programme listing, programme detail pages, and admissions select load JSON with `fetch`, so opening HTML directly with `file://` is not supported.

Example with Python:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## Structure

- `index.html`: home page
- `about.html`: institute and programme approach
- `programmes.html`: searchable, filterable programme index
- `programme.html?code=MIRTC`: shared programme detail template
- `admissions.html`: process, FAQ, and enquiry form
- `gallery.html`: filterable gallery and lightbox
- `contact.html`: contact form and contact placeholders
- `disclaimer.html`: recognition, career, terms, and privacy information
- `assets/data/programmes.json`: source of truth for all 21 programmes
- `assets/js/`: navigation, data, rendering, forms, gallery, SEO, and GSAP motion
- `assets/css/`: tokens, base, components, layout, and import layer

## Add a programme

Add one complete object to `assets/data/programmes.json` using the existing schema: `id`, `number`, `division`, `code`, `certificate`, `programme`, `group`, `keyAreas`, and `slug`. The listing, detail page, admissions select, related programmes, sitemap, and static crawlable list should then be updated or checked together.

## Swap images

Replace the local SVG files in `assets/img/placeholders/` with approved client images using the filenames and exact dimensions listed in `IMAGE-REQUIREMENTS.md`. Keep explicit width, height, aspect ratio, descriptive alt text, and the teal overlay treatment. Add WebP and JPEG sources when photographic assets arrive.

## Placeholders to resolve

- `{{PLACEHOLDER: production domain}}`: replace in `robots.txt`, `sitemap.xml`, and canonical deployment configuration.
- `{{PLACEHOLDER: form endpoint}}`: replace the centralized endpoint constant in `assets/js/forms.js`.
- `{{PLACEHOLDER: learning modes}}`: confirm the supported learning modes for the home stat strip.
- `{{PLACEHOLDER: institute address}}`, phone, email, office hours, and verified map location: add confirmed contact details.
- `{{PLACEHOLDER: eligibility requirements}}` and required documents: add verified admissions information.
- `{{PLACEHOLDER: programme duration}}`, fees, and eligibility: add verified programme-specific information.
- `{{PLACEHOLDER: admissions fee and duration information}}`: add verified FAQ content.
- `{{PLACEHOLDER: privacy policy content}}` and terms and conditions content: add approved legal copy.
- Brand PNG, SVG master, horizontal lockup, and favicon: replace the supplied JPEG when delivered.

## Compliance

Do not add claims of government, university, UGC, AICTE, statutory-board, professional-licensing recognition, guaranteed employment, guaranteed appointment, or guaranteed salary without verified applicable approval and approved copy.
