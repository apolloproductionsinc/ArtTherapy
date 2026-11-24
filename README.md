# Art Supply Studios — website

A four-page static site for **Art Supply Studios** (formerly art / therapy; the domain arttherapy.agency and the placeholder email have not been changed). It's plain HTML, CSS and JavaScript, with no build step.

| Page | What's on it |
|---|---|
| `index.html` (landing) | The top half of the first screen is a window that flips through selected work (a 3D flip every 3.6 s, with prev / pause / next; it pauses on hover, on focus and off screen, and doesn't autoplay with reduced motion). Below it are the large **ART SUPPLY STUDIOS** wordmark and a down arrow. Then come the positioning statement, the capabilities list on a full-bleed black panel with film grain (hover a capability for its line of copy), and three featured pieces. |
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
assets/js/home.js        landing flip window and capabilities list
assets/js/site.js        shared: header, reveals, studio clock, footer year
assets/img/temp/         TEMPORARY frame grabs (replace before launch)
```

- **Flip window:** set the project ids in the `data-flip` attribute in `index.html`. The timing is `INTERVAL_MS` in `home.js`.
- **Featured work on the landing page:** the `data-work-list="ids:…"` attribute in `index.html`.
- **Categories:** the `categories` field on each entry, plus `window.AT_CATEGORIES` at the bottom of `work-data.js`.
- **Logo:** "Art Supply Studios" set in Archivo (Google Fonts) at 112% width, bold, uppercase (`.logo` / `--font-logo` in the CSS). It's a type-only wordmark; commission or license a final logo before launch if needed.
- **Brand red:** `--red: #ff4a1c` colours every "/" on the site, carried over from the first design. `AT.redSlashes()` in `site.js` wraps any slash in page text automatically.
- **Reduced motion:** with `prefers-reduced-motion` turned on, the flip window swaps without animation and doesn't advance on its own.

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

- [ ] **Email**: `hello@arttherapy.agency` is a placeholder on every page, and it still uses the old name.
- [ ] **Name and domain**: the site now says Art Supply Studios. Check that the name is cleared for use, then update the domain (arttherapy.agency) and the social handles to match.
- [ ] **Studio city**: "Los Angeles" comes from the first design, which marked it "confirm city". It drives the clock (`data-clock="America/Los_Angeles"`).
- [ ] **Social handles**: Instagram, LinkedIn and Vimeo are listed as text until the handles exist.
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from every page.
- [ ] Test every embed on the production domain. Some videos may be region-locked or restricted by their owners.

## Deploying

Any static host works: Netlify, Vercel, Cloudflare Pages or GitHub Pages. There is no build command and the output directory is the repo root. The domain is **not** assumed to be connected: add `arttherapy.agency` in the host's dashboard, then update DNS at the registrar.
