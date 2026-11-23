/*
 * art / therapy — selected work data
 * ------------------------------------------------------------------
 * One entry per project, in the order they appear on the page
 * (doc order, except Bose opens so the page leads with a 16:9 piece).
 * Source: "6. Website + Capabilities → LANDING PAGE" in the shared
 * planning doc. Titles are written the way the source site lists them:
 *   - Vimeo links  → the project name used on steveconry.com
 *   - YouTube      → the video title on YouTube
 *   - Red Bull TV  → the film title on redbull.tv
 *
 * Fields
 *   id          unique slug
 *   kicker      short client / artist label (from the planning doc)
 *   title       title as listed on the source site
 *   categories  any of: music, docs, commercial, case-studies,
 *               experiential, livestream
 *   aspect      "16/9" | "1/1" | "9/16" | "4/5" …
 *   source      { name, by, url }   shown as "watch on <name>"
 *   embed       { type: "youtube"|"vimeo"|"vimeo-showcase"|"tiktok", … }
 *               omit for link-only or placeholder entries
 *   thumb       poster image URL (null → mineral placeholder)
 *   placeholder true when the asset still has to be supplied
 *   note        internal pre-launch note (never rendered)
 *
 * IMPORTANT: posters are hot-linked from the hosting platforms for
 * preview only. Confirm usage rights and replace with optimised local
 * stills before launch. See README → "Before launch".
 */
window.AT_WORK = [
  {
    id: "bose-apt-b-mochakk",
    kicker: "Bose — APT B",
    title: "Mochakk Drops “Neckwear” (Live) | APT B | Bose Studios",
    categories: ["music", "commercial"],
    aspect: "16/9",
    source: { name: "YouTube", by: "Bose", url: "https://www.youtube.com/watch?v=XBS-O26LSN4" },
    embed: { type: "youtube", id: "XBS-O26LSN4" },
    thumb: "https://i.ytimg.com/vi/XBS-O26LSN4/maxresdefault.jpg"
  },
  {
    id: "future-ye-keep-it-burnin",
    kicker: "Future & Ye",
    title: "FUTURE x YE “KEEP IT BURNIN”",
    categories: ["music"],
    aspect: "1/1",
    source: { name: "Vimeo", by: "Steve Conry", url: "https://vimeo.com/708373344" },
    embed: { type: "vimeo", id: "708373344" },
    thumb: "https://i.vimeocdn.com/video/1429417255-a67bf162df56a43d5a49f76eaca6300b6fdf747f1aad3ce38f9b5c3293630c25-d_1280?region=us",
    note: "Name per steveconry.com/future-x-ye-1"
  },
  {
    id: "rhode",
    kicker: "Rhode",
    title: "RHODE",
    categories: ["commercial"],
    aspect: "16/9",
    source: null,
    placeholder: true,
    tone: "chalk",
    note: "Only link in the doc is a private Dropbox master (.mov). Needs a public Vimeo/YouTube upload or approved stills before it can be embedded."
  },
  {
    id: "lexus-audrey-nuna",
    kicker: "Lexus — Audrey Nuna",
    title: "Audrey Nuna Live at 88rising Double Happiness (Changes, Baby Blues) — Presented by Lexus",
    categories: ["livestream", "music", "commercial"],
    aspect: "16/9",
    source: { name: "YouTube", by: "88rising", url: "https://youtu.be/V39pL_Zzul4?t=14" },
    embed: { type: "youtube", id: "V39pL_Zzul4", start: 14 },
    thumb: "https://i.ytimg.com/vi/V39pL_Zzul4/maxresdefault.jpg"
  },
  {
    id: "nona-doc",
    kicker: "Nona",
    title: "Nona — documentary",
    categories: ["docs"],
    aspect: "16/9",
    source: null,
    placeholder: true,
    tone: "blue",
    note: "Listed in the doc as “Nona Doc” with no link. Supply a link/title."
  },
  {
    id: "w-hotels-sounds-of-la",
    kicker: "W Hotels",
    title: "W HOTEL “SOUNDS OF LA”",
    categories: ["commercial"],
    aspect: "16/9",
    source: { name: "Vimeo", by: "Steve Conry", url: "https://vimeo.com/791315113/1f76f159c7" },
    embed: { type: "vimeo", id: "791315113", hash: "1f76f159c7" },
    thumb: "https://i.vimeocdn.com/video/1592228467-52722d31878405b9fe122763531142eefdb758cdb355f40e290e53697abdca6f-d_1280?region=us",
    note: "Name per steveconry.com/w-hotels-2 (Vimeo itself titles this “W HOTELS (DC)”). Unlisted video — embed uses its privacy hash."
  },
  {
    id: "nhl-season-opener",
    kicker: "NHL",
    title: "NHL SEASON OPENER",
    categories: ["commercial"],
    aspect: "16/9",
    source: { name: "Vimeo", by: "Steve Conry", url: "https://vimeo.com/876605838" },
    embed: { type: "vimeo", id: "876605838" },
    thumb: "https://i.vimeocdn.com/video/1743390951-e238e168ef8d81d558b251741ac76fe320f04950c2826043397e98bd35763034-d_1280?region=us",
    note: "Doc label: “NHL - Stanley Cup”. Name per steveconry.com/nhl-season-opener"
  },
  {
    id: "churchs-chicken",
    kicker: "Church’s Chicken",
    title: "CHURCH’S CHICKEN “THAT’S A WRAP”",
    categories: ["commercial"],
    aspect: "16/9",
    source: { name: "Vimeo", by: "Steve Conry", url: "https://vimeo.com/985312713" },
    embed: { type: "vimeo", id: "985312713" },
    thumb: "https://i.vimeocdn.com/video/1900820915-f6e75b0299efecb440333f2fdb42179c058882e564a112ce3ac7f93802af7052-d_1280?region=us",
    note: "Name per steveconry.com/churchs-chicken"
  },
  {
    id: "rich-brian-lagoon",
    kicker: "Rich Brian",
    title: "LAGOON",
    categories: ["music"],
    aspect: "16/9",
    source: { name: "YouTube", by: "88rising", url: "https://www.youtube.com/watch?v=dyoV1IwGobU" },
    embed: { type: "youtube", id: "dyoV1IwGobU" },
    thumb: "https://i.ytimg.com/vi/dyoV1IwGobU/maxresdefault.jpg"
  },
  {
    id: "asia-rising",
    kicker: "88rising — documentary",
    title: "Asia Rising",
    categories: ["docs", "case-studies"],
    aspect: "16/9",
    source: { name: "Red Bull TV", by: "Red Bull", url: "https://www.redbull.tv/en/page/page:rrn:content:films:f7e4ecf5-6329-5859-b30b-48c5ae6f61f8/asia-rising-1" },
    thumb: "https://img.redbull.com/images/c_limit,w_1500,h_1000/f_auto,q_auto/redbullcom/tv/FO-1YSGJEEGW5N11/FO-1YSGJEEGW5N11-featureMedia",
    note: "Red Bull TV does not offer an embeddable player — this entry links out. Planning doc lists Red Bull “Asia Rising” as a hero case study (“how it was made”)."
  },
  {
    id: "joji-slow-dancing",
    kicker: "Joji",
    title: "Joji - SLOW DANCING IN THE DARK",
    categories: ["music"],
    aspect: "16/9",
    source: { name: "YouTube", by: "88rising", url: "https://www.youtube.com/watch?v=K3Qzzggn--s" },
    embed: { type: "youtube", id: "K3Qzzggn--s" },
    thumb: "https://i.ytimg.com/vi/K3Qzzggn--s/maxresdefault.jpg"
  },
  {
    id: "joji-run",
    kicker: "Joji",
    title: "Joji - Run (Official Video)",
    categories: ["music"],
    aspect: "16/9",
    source: { name: "YouTube", by: "88rising", url: "https://www.youtube.com/watch?v=K09_5IsgGe8" },
    embed: { type: "youtube", id: "K09_5IsgGe8" },
    thumb: "https://i.ytimg.com/vi/K09_5IsgGe8/maxresdefault.jpg"
  },
  {
    id: "hitc-katseye",
    kicker: "Head In The Clouds — live festival",
    title: "Katseye Head In The Clouds Festival 2026",
    categories: ["livestream", "experiential", "music"],
    aspect: "16/9",
    source: { name: "YouTube", by: "masymusica", url: "https://youtu.be/fH-tHySA0g8?t=83" },
    embed: { type: "youtube", id: "fH-tHySA0g8", start: 83 },
    thumb: "https://i.ytimg.com/vi/fH-tHySA0g8/maxresdefault.jpg",
    note: "Uploaded by a third-party channel (masymusica). Swap for an official upload if one exists."
  },
  {
    id: "snowglobe",
    kicker: "SnowGlobe \u2014 live festival",
    title: "SNOWGLOBE",
    categories: ["livestream", "experiential", "music"],
    aspect: "16/9",
    source: null,
    placeholder: true,
    tone: "stone",
    note: "Doc link (vimeo.com/showcase/12444402?video=1228718671) is a PASSWORD-PROTECTED pitch showcase, so it can't be embedded publicly. Supply a public Vimeo/YouTube link + still, then restore: source { name: \"Vimeo\", by: \"Steve Conry\", url }, embed { type: \"vimeo\", id, hash? }."
  },
  {
    id: "tiktok-shop-speed-omalley",
    kicker: "TikTok Shop",
    title: "iShowSpeed & Sean O’Malley",
    categories: ["livestream"],
    aspect: "9/16",
    source: { name: "TikTok", by: "@sportscenternext", url: "https://www.tiktok.com/@sportscenternext/video/7579046961634970910" },
    embed: { type: "tiktok", id: "7579046961634970910" },
    thumb: null,
    tone: "blue",
    note: "TikTok does not expose a usable poster; supply a still."
  },
  {
    id: "kanye-drake-larry-hoover",
    kicker: "Kanye & Drake — live",
    title: "KANYE & DRAKE - FREE LARRY HOOVER CONCERT",
    categories: ["livestream", "experiential", "music"],
    aspect: "16/9",
    source: { name: "YouTube", by: "2infinity", url: "https://youtu.be/JV_mGICwVtk?t=1851" },
    embed: { type: "youtube", id: "JV_mGICwVtk", start: 1851 },
    thumb: "https://i.ytimg.com/vi/JV_mGICwVtk/maxresdefault.jpg",
    note: "Full YouTube title: “KANYE & DRAKE - FREE LARRY HOOVER CONCERT (FULL CONCERT) [WITH TIMESTAMPS]” — uploader suffix trimmed. Third-party upload; swap for an official source."
  },
  {
    id: "case-study-placeholder-01",
    kicker: "Case study",
    title: "Case study — forthcoming",
    categories: ["case-studies"],
    aspect: "16/9",
    source: null,
    placeholder: true,
    tone: "stone",
    note: "Placeholder. Doc candidates: Yonex 2026/2027, Controlled Insanity, 88rising, Electric Forest."
  },
  {
    id: "case-study-placeholder-02",
    kicker: "Case study",
    title: "Case study — forthcoming",
    categories: ["case-studies"],
    aspect: "16/9",
    source: null,
    placeholder: true,
    tone: "chalk",
    note: "Placeholder."
  }
];

window.AT_CATEGORIES = [
  { id: "music", label: "music" },
  { id: "docs", label: "docs" },
  { id: "commercial", label: "commercial" },
  { id: "case-studies", label: "case studies" },
  { id: "experiential", label: "experiential" },
  { id: "livestream", label: "livestream" }
];
