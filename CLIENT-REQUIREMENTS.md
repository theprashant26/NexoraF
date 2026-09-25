# Nexora Institute website — what we still need

Everything else has been supplied and is live on the site. Nothing is outstanding from the institute
or the graphic team — what remains is the backend work listed below.

Last updated 25 September 2026.

---

## 1. Deferred to the backend phase

The institute has confirmed these will be handled when the backend work starts. They are listed here
so nothing is lost, not as open questions.

| Item | Where it shows on the site today |
|---|---|
| Where enquiry submissions go | The enquiry and admission forms validate and confirm, but send nowhere |
| Official email address | Footer, mobile menu, Contact page |
| WhatsApp number | Contact page |
| Real phone number | **+91 98765 43210** is a stand-in and is live on every page |
| Payment provider and checkout URL | Payment page says online payment is not connected yet |
| Student portal — wanted or not | Sign-in and register pages say the portal is not live |
| Social profile links | Footer of every page |
| Transparent logo and favicon mark | A working favicon has been generated from the existing JPEG |
| Enquiry data retention period | Privacy policy |
| Student academic record retention period | Privacy policy |
| Transfer request period | Important information |
| Enquiry response target | Admissions FAQ |
| Production domain | `robots.txt`, `sitemap.xml`, home page search data |

**The phone number is the one to watch.** It looks like a real number, so a routine placeholder check
will not catch it. It must be replaced before launch.

For the payment gateway, the two return URLs are already built — register these with the provider:

- success → `payment-status.html?status=success&ref=<their reference>`
- failure → `payment-status.html?status=failed&ref=<their reference>`

---

## Settled — no action needed

Kept here so nobody reopens them.

| | |
|---|---|
| **Programme list** | 24 programmes. The client's 21 divisions, plus Healthcare, Driver Services and Electrical Engineering, which were shared earlier and are staying. |
| **Levels** | 3 months (Basic Certificate, 120 hours), 6 months (Advanced Certificate, 240 hours), 1 year (Professional Diploma, 480 hours). |
| **Fees** | ₹45,000 / ₹85,000 / ₹1,89,000 for Metro & Rail, Railway, Aviation, Hospitality and Travel & Tourism. ₹25,000 for Pharmaceutical and ₹35,500 for Medical at 3 months, ₹35,000 for everything else; ₹65,500 and ₹1,35,500 at the longer levels. |
| **Instalments** | 3-month programmes publish a fixed split. The 6-month and 1-year programmes are EMI on request, arranged with the Admissions Department. |
| **Codes for the new divisions** | `INFTC`, `AGITC`, `INSTC` — confirmed. |
| **Key learning areas for the new divisions** | Confirmed as written. |
| **Certificate titles** | The four renamed divisions keep their existing certificate wording for now. |
| **Photography** | All 24 programmes have their own supplied banner. |

---

## Final approval checklist

- [ ] Everything in section 1, as backend work completes
- [ ] Institute has approved every claim published on the site
- [ ] Client has reviewed the site on both mobile and desktop

---

## A standing note on what may be published

Please do not ask for any of the following to be added unless the approval or recognition document
exists and the wording has been formally approved:

government approval · university affiliation · UGC recognition · AICTE approval · statutory-board
recognition · professional licensing · guaranteed employment · guaranteed placement · guaranteed
salary · placement percentages · industry accreditation

The two statements below are published on the site and must stay unless replaced by approved wording
with the same meaning:

> Unless specifically stated otherwise, certificates and diplomas issued by Nexora Institute are
> institute-level professional training credentials and should not be represented as government,
> university, UGC, AICTE, statutory-board or professional-licensing qualifications without the
> applicable approval, affiliation or recognition.

> Completion of a programme does not by itself guarantee employment, appointment or a specific salary.
