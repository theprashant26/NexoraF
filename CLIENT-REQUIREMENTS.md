# Nexora Institute website — client requirements

This is the single document to send to the institute. It covers every piece of verified content,
legal copy, integration, and image asset the website needs before launch.

Please do not send unverified claims, placeholder information, or images the institute does not
hold usage rights for.

---

## 1. Brand assets

| Asset | Filename | Size | Format | Max size | Notes |
|---|---|---|---|---|---|
| Transparent logo | `nexora-logo-transparent.png` | 1200 × 1200 px | PNG | 250 KB | Replaces the supplied JPEG |
| Master logo | `nexora-logo-master.svg` | Vector | SVG | 100 KB | Preferred for web use |
| Horizontal lockup | `nexora-horizontal-lockup.png` | 1600 × 400 px | PNG or SVG | 300 KB | Transparent background |
| Favicon mark | `nexora-favicon.png` | 512 × 512 px | PNG or SVG | 50 KB | Monogram only, transparent |

Also needed:

- Approved brand fonts, if different from the current Bricolage Grotesque / Karla / IBM Plex Mono set.
- Approved brand colour references, if the current cobalt-on-paper palette needs to change.
- Correct spelling, capitalization, and the final institute tagline.

---

## 2. Institute information

- Official institute name.
- Official registered address.
- Branch or campus addresses, if more than one location exists.
- Official phone number, WhatsApp number, and admissions number.
- Official email address and admissions email address.
- Office hours and holiday schedule.
- Google Maps location or approved map embed URL.
- Social media profile URLs.
- Official website domain.
- Copyright wording and preferred copyright year.

---

## 3. Programme information

Please verify all 21 programme records in `assets/data/programmes.json`:

- Division name.
- Programme name.
- Certificate title.
- Programme code.
- Approved group or sector.
- Key learning areas.
- Programme introduction paragraph.
- Duration and learning hours.
- Learning mode: classroom, online, hybrid, or other.
- Eligibility requirements.
- Required documents.
- Fees, taxes, instalments, and payment instructions.
- Assessment and completion rules.
- Certificate or diploma wording.

Do not provide employment guarantees, salary guarantees, placement percentages, or recognition
claims unless the applicable approval and written legal copy are supplied.

---

## 4. Admissions content

- Confirmed eligibility requirements.
- Confirmed document checklist.
- Enrolment process and responsible contact person.
- Application deadlines, if applicable.
- Fees and payment process.
- Refund and cancellation policy.
- Approved FAQ answers.
- Admissions phone and email.
- Final enquiry form destination or API endpoint.
- Confirmation email or WhatsApp message content after submission.

---

## 5. Compliance and legal content

Please provide approved copy for:

- Recognition and affiliation statement.
- Programme certificate wording.
- Privacy policy.
- Terms and conditions.
- Refund and cancellation policy.
- Cookie or tracking notice, if analytics are used.
- Consent wording for enquiry forms.
- Data retention and enquiry handling process.
- Confirmation that all claims on the website are legally approved.

The following two statements must remain on the site unless replaced by approved legal copy with
the same meaning:

> Unless specifically stated otherwise, certificates and diplomas issued by Nexora Institute are
> institute-level professional training credentials and should not be represented as government,
> university, UGC, AICTE, statutory-board or professional-licensing qualifications without the
> applicable approval, affiliation or recognition.

> Completion of a programme does not by itself guarantee employment, appointment or a specific salary.

---

## 6. Photography

Send original, high-resolution images where possible. Avoid WhatsApp-compressed images,
screenshots, watermarked stock images, and images the institute cannot license for web and social use.

Supplied photography replaces the local SVG placeholders in `assets/img/placeholders/` without any
layout change, as long as the exact dimensions below are matched.

### Image slots

The design is deliberately light on photography — the programme index and the
learning-group columns are typographic, not image-led. That means far fewer
photographs are needed than a card-based layout would require.

| Slot ID | Page | Section | Filename | Exact size (px) | Ratio | Format | Max size | What it should show |
|---|---|---|---|---|---|---|---|---|
| `home-hero-01` | Home | Masthead band | `nx-home-hero-01.jpg` | 2400 × 900 | 8:3 | WebP + JPEG | 260 KB | Wide, calm shot of a real training environment. It runs full width under the headline, so keep the subject off-centre and leave room at the sides |
| `home-tile-01`…`04` | Home | Inside Nexora | `nx-home-tile-01.jpg` … `-04.jpg` | 1600 × 1200 | 4:3 | WebP + JPEG | 160 KB each | Classroom, materials or equipment, a learner mid-task, a group session |
| `programme-banner-01` | Programme detail | Banner | `nx-programme-banner-01.jpg` | 1920 × 720 | 8:3 | WebP + JPEG | 220 KB | Wide sector-relevant training environment |
| `gallery-01`…`06` | Gallery | Tiles | `nx-gallery-01.jpg` … `-06.jpg` | 1600 × 1200 | 4:3 | WebP + JPEG | 160 KB each | Two campus, two learning, two people — these are the filter categories |
| `about-team-01` | About | Faculty portrait | `nx-about-team-01.jpg` | 800 × 1000 | 4:5 | WebP + JPEG | 140 KB | Trainer or representative — only with approved name and role |
| `contact-map-01` | Contact | Location image | `nx-contact-map-01.jpg` | 1400 × 700 | 2:1 | WebP + JPEG | 120 KB | Verified campus location or exterior |
| `og-share-01` | All | Social share card | `nx-og-share-01.jpg` | 1200 × 630 | 1.91:1 | JPEG or PNG | 180 KB | Approved Nexora social-share composition |

That is **13 photographs in total**, plus the optional faculty portrait.

Photographs sit on a warm off-white page with no colour overlay applied, so
natural, well-lit frames work best. Very dark or heavily filtered images will
look out of place against the paper background.

### Naming pattern

`nx-[page]-[slot]-[number].jpg` — for example `nx-home-hero-01.jpg`, `nx-gallery-03.jpg`.

The repository currently ships four generic SVG placeholders rather than one per slot,
since every placeholder would otherwise look identical. Supplied photographs are saved
under the filenames in the table above and the markup is pointed at them.

### Also required with the photography

- Photographer credit or usage permission confirmation.
- Correct names and roles wherever people are identifiable.
- Alt-text suggestions for important images.
- Written confirmation that the institute can use the images on the website and on social media.

---

## 7. Forms and integrations

- Final enquiry form endpoint (replaces `FORM_ENDPOINT` in `assets/js/forms.js`).
- CRM or email recipient details.
- Required form fields, if different from name, phone, email, programme, city, and message.
- WhatsApp integration number, if required.
- Spam protection preference — the forms currently use a honeypot field only.
- Success message wording.
- Error message wording.
- Auto-reply email content.
- Consent and privacy wording for below the submit button.
- Analytics or conversion tracking IDs, if required.

---

## 8. SEO and launch

- Final production domain (replaces the placeholder in `robots.txt` and `sitemap.xml`).
- Preferred page titles and meta descriptions, if different from the current copy.
- Official social-share image.
- Google Business Profile URL.
- Search Console access or sitemap submission contact.
- Analytics platform and tracking ID.
- Preferred redirect rules.
- Hosting provider: Netlify, Vercel, cPanel, or other.
- SSL confirmation.
- Final approval contact and launch approval date.

---

## 9. Placeholder tokens still in the code

Every item below appears on the live site as `{{PLACEHOLDER: …}}` until it is supplied.

| Token | Where it appears |
|---|---|
| `production domain` | `robots.txt`, `sitemap.xml`, `index.html` structured data |
| `form endpoint` | `assets/js/forms.js` |
| `institute address`, `phone`, `email` | Footer (`assets/js/nav.js`), `contact.html` |
| `whatsapp number`, `office hours`, `verified map location` | `contact.html` |
| `social profiles` | Footer (`assets/js/nav.js`) |
| `eligibility requirements`, `required documents` | `admissions.html` |
| `admissions fee and duration information` | `admissions.html` FAQ |
| `enrolment process and responsible contact person` | `admissions.html` FAQ |
| `consent and privacy wording` | `admissions.html`, `contact.html` |
| `programme duration`, `programme fees`, `programme eligibility`, `learning mode` | `programme.html` |
| `privacy policy content`, `terms and conditions content`, `refund and cancellation policy` | `disclaimer.html` |

---

## 10. Final approval checklist

- [ ] All institute information is verified.
- [ ] All 21 programme records are approved.
- [ ] Fees, duration, eligibility, and documents are approved.
- [ ] Recognition and compliance copy is approved.
- [ ] Privacy, terms, and refund copy is approved.
- [ ] Contact details are correct.
- [ ] Form submissions have been tested against the live endpoint.
- [ ] Images have written usage permission.
- [ ] Images meet the exact dimensions and file-size targets.
- [ ] Mobile layouts have been reviewed.
- [ ] Desktop layouts have been reviewed.
- [ ] Reduced-motion and keyboard navigation have been checked.
- [ ] All placeholder tokens have been removed.
- [ ] Client has approved the final website for launch.
