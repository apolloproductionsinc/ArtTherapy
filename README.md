# art / therapy — website (iteration 2)

A single-page site for **art / therapy** (arttherapy.agency). It's plain HTML, CSS and JavaScript, with no build step and no dependencies.

The look is white, airy, sculptural and editorial. Work scrolls vertically and can be filtered by category, and videos play inline.

## Preview locally

Pick any static server and run it from the repo root:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Or:

```bash
npx serve .
```

You need a server, not `file://`, because YouTube and Vimeo players refuse to load in iframes on `file://` pages.

## Structure

```
index.html              page markup: header, hero, work, capabilities, about, contact
assets/css/styles.css   all styles (design tokens at the top under :root)
assets/js/work-data.js  ← portfolio entries: edit this to add, remove or reorder work
assets/js/main.js       filters, layout rhythm, video facades, reveals, mobile nav
assets/img/favicon.svg
```

### Adding or editing work

Each project is one object in `assets/js/work-data.js`. The file's header comment documents every field. The main ones:

- `title`: the title as the source site lists it. For Vimeo links that's the name on steveconry.com; for YouTube it's the video title.
- `categories`: any of `music`, `docs`, `commercial`, `case-studies`, `experiential`, `livestream`. A project can have several.
- `embed`: `{ type: "youtube", id, start }`, `{ type: "vimeo", id, hash }` or `{ type: "tiktok", id }`. Leave it out to make the poster link to the source instead, as Red Bull TV does.
- `thumb`: the poster image. Use `null` to show a mineral placeholder.
- `placeholder: true`: marks the asset as still to come.

Layout widths are worked out automatically from the order of the visible items. They follow the `PATTERN` array in `main.js` and are recalculated whenever the filter changes.

### Filters and navigation

The header links Music, Docs, Commercial, Case Studies, Experiential and Livestream use the same filter as the bar above the work list. Filters can be deep-linked, for example `/#work-music` or `/#work-livestream`. **all work** resets the filter.

## Landing-page content source

The work list comes from section **6. Website + Capabilities → LANDING PAGE** of the shared planning doc, in the doc's order. The one exception is that Bose opens the page, so it leads with a 16:9 piece.

| Doc label | Title used on site | Source |
|---|---|---|
| BOSE APT B – Mochakk | Mochakk Drops "Neckwear" (Live) \| APT B \| Bose Studios | YouTube (Bose) |
| Future & Ye | FUTURE x YE "KEEP IT BURNIN" | Vimeo, name per steveconry.com |
| RHODE | RHODE (**temp still**, video pending) | Dropbox master only |
| LEXUS – Audrey Nuna | Audrey Nuna Live at 88rising Double Happiness (Changes, Baby Blues) — Presented by Lexus | YouTube (88rising) |
| Nona Doc | Nona — documentary (**placeholder**) | no link in doc |
| W Hotels | W HOTEL "SOUNDS OF LA" | Vimeo, name per steveconry.com |
| NHL – Stanley Cup | NHL SEASON OPENER | Vimeo, name per steveconry.com |
| Church's Chicken | CHURCH'S CHICKEN "THAT'S A WRAP" | Vimeo, name per steveconry.com |
| Rich Brian – Lagoon | LAGOON | YouTube (88rising) |
| 88Rising – Asia Rising (documentary) | Asia Rising | Red Bull TV (link-out) |
| Slow Dancing In The Dark | Joji - SLOW DANCING IN THE DARK | YouTube (88rising) |
| Run | Joji - Run (Official Video) | YouTube (88rising) |
| HITC – Katseye | Katseye Head In The Clouds Festival 2026 | YouTube (masymusica) |
| Snowglobe | SNOWGLOBE (**placeholder**) | password-protected Vimeo showcase |
| TikTok Shop – iShowSpeed & Sean O'Malley | iShowSpeed & Sean O'Malley (**temp still**) | TikTok (@sportscenternext) |
| Kanye & Drake | KANYE & DRAKE - FREE LARRY HOOVER CONCERT | YouTube (2infinity) |

## Before launch: what has to be replaced

**Content and assets**

- [ ] **RHODE**: the doc only links a private Dropbox `.mov` master. The poster is a **temp still** grabbed from that file (`assets/img/temp/rhode-temp.jpg`). Upload the video publicly to Vimeo or YouTube and supply approved stills.
- [ ] **Nona Doc**: there is no link in the doc. Supply the video link and title.
- [ ] **SnowGlobe**: the doc link is a *password-protected* Vimeo pitch showcase. Supply a public link and a still.
- [ ] **Case Studies**: *Asia Rising*, plus two **temporary** fills taken from the doc's hero case-study list: CONTROLLED INSANITY "YOUR WORST ENEMY" and ELECTRIC FOREST "TIME" (both Vimeo, named as on steveconry.com). Case-study write-ups are still to come; Yonex 2026/27 and 88rising are the other candidates in the doc.
- [ ] **Third-party uploads**: *HITC – Katseye* (masymusica) and *Kanye & Drake* (2infinity) are fan or third-party channels. Swap them for official uploads where they exist. The Kanye & Drake title has the uploader's suffix "(FULL CONCERT) [WITH TIMESTAMPS]" trimmed.
- [ ] **Posters/stills**: these are currently hot-linked from YouTube, Vimeo and Red Bull CDNs for preview. Confirm usage rights, then replace them with optimised local stills (WebP or AVIF, about 1600px wide). SnowGlobe has no poster yet. TikTok uses a **temp still** (`assets/img/temp/tiktok-speed-omalley-temp.jpg`) that includes the uploader's burned-in caption. Everything in `assets/img/temp/` must be replaced before launch.
- [ ] **Credits and roles**: the work section says "Selected work from the founders' collective experience. Credits and roles to be confirmed." Verify the attribution for every project, as the planning doc asks. That means separating work by the new company from the founders' prior experience.
- [ ] **Founder portraits**: all three are placeholders.

**Copy**

- [ ] **Founder bios**: each first sentence is from the planning doc. The second sentence, and "across the US and Asia" for Grace, come from the website brief and are **editable draft copy**.
- [ ] **Founder titles**: "partner" is used for all three, following "Partner, Partner, Partner titles" in the doc. Confirm.
- [ ] **About intro paragraph**: draft copy.
- [ ] **Capabilities**: the wording is from the planning doc. GUIDE uses the doc version, not the longer version in the brief.

**Contact and technical**

- [ ] **Email**: `hello@arttherapy.agency` is a **placeholder** and is labelled as one on the page. Replace it in `index.html`.
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from `index.html` at launch.
- [ ] Add a social/OG share image (`og:image`) once there is approved imagery.
- [ ] Test every embed in a normal browser on the production domain. Some videos may be region-locked or restricted by their owners, and every item also links out to its source.

## Deploying to arttherapy.agency

The site is static, so any static host works: Netlify, Vercel, Cloudflare Pages, GitHub Pages or S3 + CloudFront. Point the host at the repo root; there is no build command and the output directory is `/`.

The domain is **not** assumed to be connected. Once a host is chosen, add `arttherapy.agency` in the host's dashboard and update DNS at the registrar. For GitHub Pages, also add a `CNAME` file containing `arttherapy.agency`.
