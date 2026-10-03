# Cup'O'Chino — Single Page Animated Coffee Brand Website

A single-page scrolling website for the Cup'O'Chino specialty coffee brand (Bengaluru), built with semantic HTML5, CSS3 custom properties, and vanilla JavaScript + GSAP 3. The design uses an editorial cream-and-forest palette inspired by the provided Theme 2 reference, with all hero and journey imagery drawn as SVG/CSS. The centerpiece is a scroll-driven GSAP `ScrollTrigger` sequence that walks the user through the full coffee journey.

**Project code:** WDEV-COC010
**Category:** Web Development
**Stack:** HTML5 · CSS3 · Vanilla JS · GSAP 3 (CDN)

---

## Package Contents

Everything is bundled in a single self-contained folder named **`cupochino-website/`**. Unzip the delivery archive (`cupochino-website.zip`) and you will get the following tree — no other files, no missing pieces, no external dependencies to download:

```
cupochino-website/
├── index.html                          ← entry point, open this in a browser
├── style.css                           ← all styles
├── main.js                             ← all GSAP animations & interactions
├── README.md                           ← this file
└── assets/
    ├── icons/
    │   ├── icon-clock.svg
    │   ├── icon-phone.svg
    │   ├── icon-box.svg
    │   ├── icon-instagram.svg
    │   ├── icon-twitter.svg
    │   └── icon-facebook.svg
    └── illustrations/
        ├── coffee-beans.svg
        ├── roaster-drum.svg
        ├── grinder.svg
        ├── portafilter.svg
        ├── espresso-machine.svg
        ├── coffee-cup-steam.svg
        └── about-cup.svg
```

**Total: 4 root files + 13 SVG assets = 17 files in 3 folders.** Keep the folder structure intact — `index.html` references `./style.css`, `./main.js`, and `./assets/...` using relative paths. Moving files around will break the references.

---

## How to Run

The site is fully static. No build tools, no backend, no `npm install`.

**Option 1 — Open directly:**
Double-click `index.html` (or open it with your browser). The site will load and run.

**Option 2 — Local server (recommended for the Google Maps embed):**
Some browsers restrict iframes when files are loaded via the `file://` protocol. To avoid this, run a quick local server from the project root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

Any other static server works equally well (e.g. `npx serve`, VS Code Live Server).

---

## Dependencies (loaded via CDN)

All third-party assets are pulled from CDNs at runtime. There is nothing to install.

### GSAP 3

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollToPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/MotionPathPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/DrawSVGPlugin.min.js"></script>
```

GSAP `3.13.0` includes the formerly premium plugins in its public package. This site registers `ScrollTrigger`, `ScrollToPlugin`, `SplitText`, `MotionPathPlugin`, and `DrawSVGPlugin`; it uses `SplitText` for headline reveals and `DrawSVGPlugin` for coffee/steam stroke animation. Compact native fallbacks remain in `main.js`, so a missing optional plugin does not hide the content.

GSAP source and licensing reference: [GSAP on npm](https://www.npmjs.com/package/gsap), [DrawSVG docs](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/), and [SplitText docs](https://gsap.com/docs/v3/Plugins/SplitText/).

### Google Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Lato:wght@400;600&display=swap" rel="stylesheet">
```

- **Playfair Display** — 700 Bold + 400 Italic (headings, taglines, pull quotes)
- **Lato** — 400 Regular + 600 SemiBold (body, subheadings, nav)

---

## Replacing Placeholder Content

All copy lives in `index.html`. Search for these landmarks to locate each block:

### Brand name & tagline
- **Hero headline** — search `<h1 class="hero-title">` (around line 70). Update the heading text and the `.hero-tagline` paragraph directly below it.
- **Footer brand** — search `<div class="footer-brand">` in the footer section.
- **Nav logo** — search `<a class="nav-logo">` near the top of `index.html`.

### Address & Google Maps embed
- Search `id="location"` (around line 760). The `<iframe>`'s `src` attribute holds the embed URL.
- To get your own embed: open Google Maps → search your address → click **Share** → **Embed a map** → copy the iframe `src`.
- Update the `.address-block` `<p>` tags below the map with your real street address.
- Update the `href` on the "Get Directions" button (`<a class="btn-directions">`) to your Google Maps short URL.

### Contact details (phone, email, hours, delivery)
- Search `class="info-row"` (around line 700). The three info cards are siblings — Hours, Contact, Delivery — and each has a `<div class="info-card-content">` block with the editable text.

### Social media links
- Search `<div class="footer-socials">` in the footer section. Update each `<a href="#">` with your real Instagram, Twitter (X), and Facebook URLs.

### Testimonials
- Search `class="testimonial"` (around line 800). Three `<blockquote>` blocks — update the quote text and the `<cite>` attribution.

### Menu items
- Search `class="menu-card"` (around line 480). Six cards, each with a front face (`.card-face.front`) and back face (`.card-face.back`). Update name, tagline, description, flavour notes, and intensity dots (1–5 dots filled).

### Process steps
- Search `class="timeline-step"` (around line 600). Four steps; each has a step number, icon SVG (inline), heading, and description paragraph.

---

## Browser Compatibility

Tested and supported on the **latest two versions** of:

- Google Chrome
- Mozilla Firefox
- Safari (macOS 13+ and iOS 15+)
- Microsoft Edge

**Not supported:** Internet Explorer (any version). The site uses CSS custom properties, `clamp()`, `backdrop-filter`, modern flex/grid, and ES2017+ JavaScript — none of which IE handles.

The site degrades gracefully if GSAP fails to load from CDN: all content remains readable, only the scroll animations are skipped.

---

## Mobile Animation Fallback (below 768px)

The pinned, scroll-scrubbed journey animation in Section 2 is **disabled on screens narrower than 768px**. Pinning a `600vh` container and running a five-stage SVG animation at 60fps is too heavy for low-end mobile devices and causes scroll jank.

On mobile, the journey section is replaced with a **static vertical timeline** showing the same five stages (Bean Pour → Roasting → Grinding → Tamping → Extraction), each fading in with a simple `opacity / y` tween as it scrolls into view. The fallback is implemented in `main.js` inside `initJourney()` — it checks `window.innerWidth < 768` and routes to the static timeline branch.

If you resize the browser across the breakpoint, the page reload picks up the correct mode. Both modes share the same copy and stage names.

### `prefers-reduced-motion`

Users who have requested reduced motion in their OS settings get the static layout on all viewport sizes, plus all decorative GSAP loops (steam particles, drum rotation, blade spin, testimonial auto-rotate) are paused. This is handled by a `prefers-reduced-motion: reduce` media query in `style.css` plus an early-exit check in `main.js`.

---

## Notes on the Journey Animation

The five stages are scroll-scrubbed against a 600vh container that's pinned for its full duration. Each stage occupies 120vh of scroll distance:

| Scroll range | Stage |
| ------------ | ----- |
| 0vh – 120vh   | Bean Pour |
| 120vh – 240vh | Roasting (drum rotates, beans shift colour green → brown) |
| 240vh – 360vh | Grinding (beans curve into grinder, blades spin, grounds fall) |
| 360vh – 480vh | Tamping (tamper descends, pressure arc draws) |
| 480vh – 600vh | Extraction (espresso stream draws, cup fills, steam curls, completion text) |

A fixed progress indicator on the right edge shows which stage is active, updated via `ScrollTrigger` `onEnter` / `onLeaveBack` callbacks.

---

## Acceptance Checklist Status

All items from the spec's acceptance checklist are implemented. Re-run them by opening `index.html` and scrolling through. Notable points:

- Hero, About, and newsletter text reveals use `SplitText` when loaded
- Espresso stream and cup steam use `DrawSVGPlugin` when loaded
- Requested GSAP plugins are loaded from the public GSAP 3.13.0 distribution and registered in `main.js`
- Newsletter form `console.log`s the email and shows the visual success state — no data is transmitted

---

## License & Credits

Built as a single-deliverable static site. All SVG illustrations are original geometric compositions written in code for this project. Fonts via Google Fonts (SIL Open Font License). GSAP via the free GSAP 3 core distribution.

© 2026 Cup'O'Chino. All rights reserved.
