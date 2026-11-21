# Glonari Homes — Site Structure

Page list, navigation, and per-page sections. Approved English copy for each section lives in `Glonari_Homes_All_Pages_v3.4.md` (main source since 2026-11-21; it replaces the older `.docx`) — this file does not duplicate it, only the structure. Visual rules live in `DESIGN-SYSTEM-HOMES.md`. Build status lives in `PROJECT-STATUS.md`.

## Navigation (as built, every page)

- **Header nav:** Home · How It Works · Living With Glonari · Find Your Home · Glonari Properties · FAQs
- **Header CTA** (always visible, not in the nav list): Find My Glonari Home → `find-your-home.html`
- **Footer columns:** *Explore* — the six pages above; *Legal* — Privacy, Legal & Disclosures, Contact (the last three still `#`). Tagline: "AI for Human Prosperity™".
- **Footer disclosure** (verbatim from the document, every page): "Glonari Homes is a proposed program. Figures on this site are estimated examples and modeled scenarios, subject to definitive agreements and approval. They are not guarantees or cash sale proceeds. Investment values can change. Credit is not assured. Property availability and GPA liquidity are not guaranteed. Conceptual images or examples do not establish actual operating inventory. This website is not an offer to sell, lease, or finance property or to sell securities."

`find-your-home.html` is now a top-level nav item and also the target of the header CTA.

## Visitor journey (from the architecture doc)

Each page answers one visitor question:

| Page | Visitor's question | What they leave with |
|---|---|---|
| Home | Why would I want this? | A home that costs less and builds toward something |
| How It Works | How can that possibly work? | The four parts, my role, where the money comes from |
| Living With Glonari | What is life like, and where can it lead? | Security, flexibility, a path to ownership |
| Already Own a Home? | Can I get this where I live now? | The Home Module and how to join the waitlist |
| Find Your Home | What do I qualify for? | A first conversation with Gia |
| FAQs | What about...? | Short, honest answers |

Intended reading order: Home → How It Works → Living With Glonari → Find Your Home, with FAQs catching everything else and homeowners branching to Already Own a Home? from the menu.

## Pages

### 1. Home — `docs/index.html` — ✅ rebuilt to the 2026-11-12 document

1. Hero (scene, layered; new copy)
2. Why Glonari? (wipe scene, "More Than a Place to Live.")
3. The cost (pinned numbers: $7,469 · $8,333 · −$2,500 · $5,833), then **Cost compared** (new full screen, paper: two ledger tables + two footnotes), then the "Important" note
4. Find your home — no pin: headline + phrase left, one arch with a video right (plays once at 40% visible, stays on the last frame; poster under reduced motion), then a quiet paper strip (two paragraphs, "Explore Your Home Options", eligibility note). Home pinned scenes: hero, problem, econ, cta.
5. Meet Gia (chat: two Gia lines, no user message; three statements; AI disclaimer)
6. Your future (dark band; the three panels on the gold line carry the three statements)
7. Final invitation

### 2. How It Works — `docs/how-it-works.html` — ✅ brought to the document text 2026-11-14 (awaiting owner review)

9 screens (01, 02, 02B, 03, 04, 04B, 05, 06, 07). Page files: `css/how-it-works.css`, `js/how-it-works.js`. Pinned scenes: exactly three (01, 05, 07). Anchors `#ch-01`, `#ch-02`, `#ch-02b`, `#ch-03`, `#ch-04`, `#ch-04b`, `#ch-05`…`#ch-07`; fixed left rail of 9 (compact "01 / 09" at ≤1100px). One dark band: 04.

1. Introduction (scene) — layered terrace / "HOW IT WORKS" / family cut-out; "A Better Way to Live. Built Around You."; button → 02
2. Who does what? — four role cards (Properties, Homes, Gia, You), dealt onto the table
3. Choose your home — headline + tall photo with a survey line; button → Find Your Home
4. Understand the cost (dark) — fee sentences, ledger of the three figures, note; button → `find-your-home.html#cost-illustration`
5. Who can join? (scene) — café parallax opener, text below
6. The journey — four nodes on a gold line (no pin)
7. Next step (scene) — family parallax opener, text + "Find My Home" below

### 3. Living With Glonari — `docs/living-with-glonari.html` — ✅ rebuilt 2026-11-12 to Page 03 of the v2 document (awaiting owner review)

8 blocks (7 screens + `#next-move`; `#three-years` removed 2026-11-21). Page files: `css/living.css`, `js/living.js`. Pinned scenes: exactly three (01, 02, 07). Anchors kept for the home page: `#gia-goes-with-you`, `#when-life-changes`.

1. Hero (scene) — garden, kitchen, "LIVING", family; "The Life You Make at Home."; button → `#gia-goes-with-you`
2. Everyday life with Gia (`#gia-goes-with-you`, scene, paper) — one room, four views behind the glass, Gia's chat keeps its history
3. Feeling at home (`#feeling-at-home`, pause, paper) — wide strip, the light comes on with the scroll
4. When life changes (`#when-life-changes`, pause, paper) — self-playing stage: tabs | photo stack + Gia pill | Gia steps
5+6. The possibility of ownership / What stays with you? (`#ownership`, `#what-stays-with-you`, one dark chapter, no pin) — two gold lines that never touch, sentences laid out along them
5b. Your next move (`#next-move`, paper pause, no pin, order set by the owner: after the dark chapter, before the final) — headline + sentence on paper, the door at dusk full width, two tracks on one grid (Traditional Home grey, 4 steps / Glonari Home on a gold line drawn by the scroll, 3 steps), 16px note; hard edges brown→paper→brown
7. Final invitation (`#final-invitation`, scene, dark) — night villa, headline, line, "Explore Your Home" → Find Your Home

### 4. Find Your Home — `docs/find-your-home.html` — ✅ built (Page 04 of the document, 6 screens)

Page files: `css/find.css`, `js/find.js`. Media are `placeholder-find-…` until the real ones arrive (see `PROJECT-STATUS.md`).

1. Hero (scene, pin) — street, title between street and home, home; "The Home You Have in Mind."; a quiet paper bar under the photo holds the paragraph, the "Glonari Properties may evaluate…" disclaimer and "Start Exploring" → `#where`
2. Where would you like to live? (`#where`, pause, paper) — huge headline, lead, abstract map with a gold route and unnamed rings
3. The first questions (`#priorities`, scene ≥1024px, paper) — five read-only questions replace each other, a square arch with a gold outline opens upward; list with small arches below 1024px / reduced motion
4. Do I qualify? (`#options`, **the page's only dark band**, hard edges, no pin) — gold rule, then a step: statement a (cols 1-7, large) and the two condition paragraphs b (cols 8-12, 22px, bottom-aligned, hanging 104px below a)
5. Your home cost estimate (pause, paper) — invisible anchor `#cost-illustration` (linked from How It Works only); house cut-out from the home page, ground line, "estimated" underlined on scroll; two paragraphs bottom-aligned
6. What happens next? (`#next`, scene, pin) — family parallax, paper panel with the closing lines and the button "Request a Consultation" with the line "Request a personal consultation through your Glonari representative." under it (placeholder `href="#"`)

Pinned scenes: 01, 03, 06 (03 can lose its pin if three feel heavy: the questions then change with normal scroll).

### 6. FAQs — `docs/faqs.html` — ✅ brought to v3.4 2026-11-22 (Page 06, 28 questions; two photo pauses are placeholders)

Page files: `css/faqs.css`, `js/faqs.js`. No pins, no dark band. Questions without an approved answer show "The final terms will be set out in the program agreements."

1. Introduction (`#intro`) — type only + group index (five links to the groups)
2–6. Groups `#faq-01…05` (Living in a Glonari Home · Monthly payments · GPA and investment · Gia & Everyday Living · Leaving or moving) — number + title left (sticky ≥1024px), `details` questions right, first open; photo pause after 02 and after 03
7. Final (`#final`) — "Know the Terms. Make the Choice That Fits You.", buttons to Find Your Home and How It Works

### 7. Glonari Properties & GPA — `docs/glonari-properties.html` — ✅ brought to v3.4 2026-11-21 (Page 05, 8 screens; 02B photo is a placeholder)

Page files: `css/properties.css`, `js/properties.js`. Calmer and stricter than Home. Pinned scenes: exactly two (01, 04). One dark band: 05. Eyebrows are numbers only (02 / 08 … 08 / 08). Properties 04B and Class A/B are not built; there is no GPA-and-credit-line page.

1. Hero (scene) — the Already-Own-a-Home hero whole (word "PROPERTIES" temporary), h1, two paragraphs, "Explore Glonari Properties" → `#company`
2. The company (`#company`, pause) — street photo bleeding left, text lower right
2B. A better home, a more productive asset (`#better`, pause, new) — heading + lead, full-width band, three rising statements, note
3. What are GPA shares? (type only: gold line across, row of two columns, small note)
4. Where value may come from (scene) — $1,000,000 + $579,071 = $1,579,071 with labels; disclaimer strip under the scene
5. Understanding NAV+ (dark band, no pin) — $100 → $402.32 across the full width, both caveats under it (v3.4: no measures block)
6. Can shares be sold? (pause) — opening paragraph, panorama, one large line, small note
7. Advanced investment strategies — type only, one button "Review the Investment Materials" (`href="#"`)

## Cross-page links already referenced from the home page

- `how-it-works.html`
- `living-with-glonari.html#when-life-changes` and `#gia-goes-with-you`
- `find-your-home.html` (plain)

When each stub page is built, keep these anchors (`#value`, `#ownership`, `#qualify`) or update the home page links to match the final section IDs.
