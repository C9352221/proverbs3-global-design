# Book Development Services — Proverbs 3 Global Design

## Overview
A new service line that helps authors prepare manuscripts for Kindle Direct Publishing (KDP) — paperback, hardcover, and Kindle ebook. Leverages your direct experience publishing "Faith to Build" (4 languages) and "The Road to Michelin."

## Why this works
- You already know KDP inside and out
- Authors hate the technical side (formatting, covers, metadata, uploads)
- Most authors have a manuscript in Word and no idea what to do next
- Same Stripe + onboarding flow you already use for web design — easy to add

---

## Service Tiers

### Tier 1 — Manuscript Prep ($497)
**For authors who have a finished manuscript and just need it KDP-ready.**
- Manuscript review (Word/Google Doc → clean format)
- Format for KDP paperback (6x9 standard)
- Format for Kindle ebook (.epub)
- Front matter (title page, copyright, dedication)
- Table of contents auto-generated
- Chapter formatting & consistent styling
- One revision round
- Delivery: print-ready PDF + Kindle .epub

### Tier 2 — Author Launch Package ($997)
**Everything in Tier 1, plus the visual + publishing side.**
- Custom book cover design (front, back, spine for paperback)
- KDP account setup walkthrough
- Metadata writing (book description, keywords, categories)
- Author bio + author photo formatting
- ISBN guidance (free KDP ISBN vs purchased)
- Hardcover format (9x6) included
- Two revision rounds
- Upload to KDP on author's behalf (with their account)

### Tier 3 — Complete Publishing Package ($1,997)
**Full white-glove from manuscript to launch day.**
- Everything in Tier 2
- Professional cover design (multiple concepts)
- Light copy editing (typos, formatting, consistency)
- Kindle, paperback, and hardcover all formatted
- Author website page (1-page on Proverbs 3 framework)
- Pre-launch email template
- Amazon A+ Content design (visual product page enhancements)
- Launch day checklist
- 30 days of post-launch support

### Add-Ons (à la carte)
- **Multi-language edition** (Spanish, Italian, etc.) — $397/language
- **Marketing graphics** (social media launch kit) — $197
- **Author headshot retouching** — $97
- **Additional revision rounds** — $97 each

### Specialty Service — Sermon-to-Book ($797 add-on or standalone)
**For ministers who have preached the message but never written it down.**

This is your unfair advantage — you've already done it yourself (Book 1 "The Vine" came from your Kingdom Freedom Conference messages).

**How it works:**
1. Minister provides 4-10 YouTube links to their sermons/messages on a single theme
2. You pull transcripts (using your existing tools)
3. Organize the content into book chapters
4. Edit for readability (spoken → written voice)
5. Add scripture references, callouts, study questions
6. Hand off as a polished manuscript ready for any of the 3 KDP tiers

**Pricing:**
- Sermon-to-Book only (manuscript hand-off): **$797**
- Sermon-to-Book + Tier 2 Author Launch: **$1,597** (save $197)
- Sermon-to-Book + Tier 3 Complete Publishing: **$2,597** (save $197)

**Why this is huge:**
- Pastors have YEARS of preaching content sitting on YouTube doing nothing
- They want to publish but "I don't have time to write a book"
- You hand them a finished book without them writing a single word
- No other KDP service offers this

---

## Website Implementation

### New Pages to Create
1. **`books.html`** — Main book services landing page
   - Hero: "From Manuscript to Published Author"
   - Your story (briefly mention your own books as proof)
   - Three tier cards (mirrors `shop.html` design)
   - "What's the difference?" comparison table
   - FAQ section
   - CTA: "Start Your Book Project"

2. **`book-onboarding.html`** — Intake form
   - Author name, contact info
   - Book title and genre
   - Word count
   - Current manuscript status (draft, polished, edited)
   - Target launch date
   - Tier selected
   - File upload field (or "send manuscript link")
   - Notes/special requests

3. **`book-thank-you.html`** — Post-payment page
   - Confirmation
   - Next steps timeline
   - Link to book-onboarding form
   - "What to expect" section

### Pages to Update
- **`index.html`** — Add "Book Services" to nav, add a section on the homepage promoting books alongside web design
- **`services.html`** — Add Book Development as a service category
- **`shop.html`** — Either add book tiers here OR keep web design separate and link to `books.html`

---

## Stripe Setup
Create 3 new payment links in Stripe (matching the existing pattern):
- **Manuscript Prep $497** → `buy.stripe.com/[new-link]`
- **Author Launch $997** → `buy.stripe.com/[new-link]`
- **Complete Publishing $1,997** → `buy.stripe.com/[new-link]`

Add-on payment links for the à la carte services.

Post-payment redirect → `book-thank-you.html` → `book-onboarding.html`

---

## Marketing Angles

### Target Audience
1. **Pastors and ministry leaders** — PRIMARY target. Most have years of sermons and zero time to write. The Sermon-to-Book service is your hook.
2. **First-time Christian/inspirational authors** — your existing audience overlap
3. **Memoirists** — people with a story to tell who aren't tech-savvy
4. **Business professionals** — authority/lead-gen books

### Lead Sources
- **Your podcast** — mention book services as a guest takeaway
- **Facebook/Instagram** — show before/after manuscript transformations
- **Alfano Ministries audience** — natural cross-promotion
- **Word of mouth** — first 3 clients become testimonials

### Authority Builders
- Show your own published books on the page (Faith to Build, The Road to Michelin)
- "I've published in 4 languages" credibility
- Real KDP screenshots of your books
- Testimonials from your first clients (offer first 3 at 50% off in exchange for testimonials)

---

## Workflow / Delivery Process

### Standard Delivery Steps (Tier 2 example)
1. **Day 0:** Client pays via Stripe → completes onboarding form → uploads manuscript
2. **Day 1-2:** Initial review, send back any obvious issues
3. **Day 3-7:** Format manuscript (paperback + Kindle)
4. **Day 5:** Send 2 cover concepts
5. **Day 8:** Client picks cover, you finalize
6. **Day 10:** Send proof for client review
7. **Day 12:** Final revisions
8. **Day 14:** Upload to KDP (with client's account)
9. **Day 15:** KDP review (24-72 hrs by Amazon)
10. **Day 18:** Book goes live → launch checklist sent

### Tools You Already Use
- **Microsoft Word / Google Docs** — manuscript intake
- **Adobe / Canva** — cover design
- **Calibre or Vellum** — ebook formatting (Vellum is industry standard)
- **KDP dashboard** — uploads
- **yt-dlp + transcript tools** — sermon-to-book content extraction
- **GHL** — client communication and follow-up

---

## Pricing Logic

| Tier | Price | Your Time | Hourly Rate |
|------|-------|-----------|-------------|
| Tier 1 | $497 | ~6 hrs | $83/hr |
| Tier 2 | $997 | ~12 hrs | $83/hr |
| Tier 3 | $1,997 | ~24 hrs | $83/hr |

**Note:** You can scale up rates as you build a portfolio. Most KDP-prep services charge $1,500-$5,000 for what's in Tier 2.

---

## Phase 1 — MVP Launch (This Week)
1. ☐ Create `books.html` page (modeled on `shop.html`)
2. ☐ Create 3 Stripe payment links
3. ☐ Create `book-onboarding.html` form (FormSubmit.co or GHL form)
4. ☐ Add "Book Services" link to nav on all pages
5. ☐ Soft launch to your existing email list / podcast audience
6. ☐ Offer first 3 clients 50% off in exchange for testimonials

## Phase 2 — Build Authority (Month 1)
1. ☐ Get first 3 client testimonials
2. ☐ Add testimonial section to `books.html`
3. ☐ Create 2-3 social media posts showing before/after manuscripts
4. ☐ Write a blog post: "How I Published My Book in 4 Languages"
5. ☐ Promote on Alfano Ministries Facebook + Instagram

## Phase 3 — Scale (Months 2-3)
1. ☐ Launch "Multi-language edition" service for international authors
2. ☐ Create author training/course as a low-ticket front-end ($47-97)
3. ☐ Partner with podcast guests to publish their books
4. ☐ Reach out to other ministries with strong YouTube channels — pitch the Sermon-to-Book service
5. ☐ Hire a virtual assistant for formatting work as volume grows

---

## Open Questions
- Do you want to keep this on `provb3global.com` or spin up a separate domain (e.g. `kdpready.com`)?
- Will you do the cover design yourself or outsource to a designer?
- Do you want to include light editing or stay strictly formatting/design?
- Will you handle the KDP upload using the client's account, or guide them through it?
