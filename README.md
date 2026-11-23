# art / therapy — website (iteration 3)

A four-page static site for **art / therapy** (arttherapy.agency). It's plain HTML, CSS and JavaScript, with no build step.

| Page | What's on it |
|---|---|
| `index.html` (landing) | Intro: **a/t** holds for a second, then *art* and *therapy* open outward from the slash, and a down arrow draws in. Below it: the positioning statement, a capabilities list (hover, focus or tap a capability to see its line of copy and a still), then three featured pieces with a link to all work. Arriving from another page (the wordmark links to `index.html#statement`) skips the intro and opens framed on the statement. |
| `work.html` | All work from the landing-page list, with a sub-navigation: **all / commercial / documentary / live / experiential / music**. Each filter shows only those videos and can be deep-linked, e.g. `work.html#music`. Every project uses the same 16:9 tile size: three across on desktop, two on tablet, one on phone. Videos play inline. |
| `about.html` | Company statement and introduction, a founder quote, "what we bring", the five capabilities, and the three founder bios. |
| `contact.html` | Email, studio location with a live Los Angeles local-time clock, and social links. These come from the first design, simplified. |

## Preview locally

Run a static server from the repo root:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. You need a server, not `file://`, because YouTube and Vimeo players refuse to load in iframes on `file://` pages.

## Structure

```
index.html, work.html, about.html, contact.html
assets/css/styles.css    all styles (tokens at the top under :root)
assets/js/work-data.js   portfolio entries and filter categories (edit this to add, remove or reorder work)
assets/js/work.js        work list, filters, video facades
assets/js/home.js        landing intro animation and capabilities list
assets/js/site.js        shared: header, reveals, studio clock, footer year
assets/img/temp/         TEMPORARY frame grabs (replace before launch)
```

- **Intro timing:** `HOLD_MS` and `OPEN_MS` at the top of `home.js`. Keep `OPEN_MS` equal to the `.mark__grow` transition in the CSS.
- **Featured work on the landing page:** the `data-work-list="ids:…"` attribute in `index.html`.
- **Capability stills:** the `data-still` attribute on each capability button in `index.html`. Each one names a work id.
- **Categories:** the `categories` field on each entry, plus `window.AT_CATEGORIES` at the bottom of `work-data.js`.
- **Brand red:** `--red: #ff4a1c` colours the slash in every wordmark. It's carried over from the first design.
- **Reduced motion:** with `prefers-reduced-motion` turned on, the intro shows the finished wordmark straight away.

## Work content

The list is taken from the planning doc's **LANDING PAGE** list. Titles are the ones each source site uses; Vimeo items use the names on steveconry.com. Category mapping:

| Project | Categories |
|---|---|
| Mochakk "Neckwear" — Bose APT B | music, commercial |
| FUTURE x YE "KEEP IT BURNIN" | music |
| RHODE (temp still) | commercial |
| Audrey Nuna — 88rising Double Happiness, presented by Lexus | live, music, commercial |
| Nona — documentary (placeholder) | documentary |
| W HOTEL "SOUNDS OF LA", NHL SEASON OPENER, CHURCH'S CHICKEN "THAT'S A WRAP" | commercial |
| LAGOON, Joji – Slow Dancing in the Dark, Joji – Run | music |
| Asia Rising (Red Bull TV link-out) | documentary |
| Katseye — Head In The Clouds 2026 | live, experiential, music |
| SNOWGLOBE (placeholder) | live, experiential, music |
| iShowSpeed & Sean O'Malley — TikTok Shop (temp still) | live |
| Kanye & Drake — Free Larry Hoover concert | live, experiential, music |
| CONTROLLED INSANITY "YOUR WORST ENEMY" | commercial |
| ELECTRIC FOREST "TIME" | experiential, documentary |

## Before launch: what has to be replaced

**Content and assets**

- [ ] **RHODE**: the poster is a temp frame from the private Dropbox master. Upload the video publicly and supply approved stills.
- [ ] **Nona Doc**: there is no link in the doc. Supply the link and title.
- [ ] **SnowGlobe**: the doc's link is a password-protected Vimeo showcase. Supply a public link and a still.
- [ ] **TikTok Shop**: the poster is a temp frame that includes the uploader's caption.
- [ ] **Third-party uploads**: *HITC – Katseye* (masymusica) and *Kanye & Drake* (2infinity). Swap them for official sources.
- [ ] **Posters**: these are hot-linked from YouTube, Vimeo and Red Bull for preview. Confirm usage rights, then replace them with optimised local stills. This includes the stills in the landing capabilities list.
- [ ] **Credits**: verify the attribution for every project. Founder experience must be kept distinct from work by the new company.
- [ ] **Founder portraits**: all three are placeholders.

**Copy**

- [ ] **Founder bios**: each first sentence is from the planning doc. The rest is editable draft copy.
- [ ] **Founder titles**: "partner" is used for all three. Confirm.
- [ ] **About page**: the introduction paragraphs and the "what we bring" descriptions are draft copy built from the planning doc. The quote is a founder talking point from the doc.

**Contact and technical**

- [ ] **Email**: `hello@arttherapy.agency` is a placeholder on every page.
- [ ] **Studio city**: "Los Angeles" comes from the first design, which marked it "confirm city". It drives the clock (`data-clock="America/Los_Angeles"`).
- [ ] **Social handles**: Instagram, LinkedIn and Vimeo are listed as text until the handles exist.
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from every page.
- [ ] Test every embed on the production domain. Some videos may be region-locked or restricted by their owners.

## Deploying

Any static host works: Netlify, Vercel, Cloudflare Pages or GitHub Pages. There is no build command and the output directory is the repo root. The domain is **not** assumed to be connected: add `arttherapy.agency` in the host's dashboard, then update DNS at the registrar.
