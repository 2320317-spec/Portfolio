# Portfolio Website — Design Spec

**Date:** 2026-07-15
**Owner:** Myke Lhowelle S. Marundan
**Purpose:** Internship-required professional portfolio; doubles as a learn-by-building web development project.

## 1. Goals & Requirements

### Internship rubric (must-haves)
1. **About Me** — academic background, core technical skills, immediate career goals.
2. **2–3 projects in detail**, each written with the **STAR method** (Situation, Task, Action, Result).
3. **Resume & contact** — downloadable PDF resume; clickable LinkedIn, GitHub, professional email.
4. **Live deployment** — publicly accessible URL (developer track: GitHub Pages).

### Personal goals
- Learn web development while building: Myke can read HTML/CSS/some JS but cannot yet write from scratch. Every technique used must be explainable by Myke afterward.
- Award-site aesthetic inspired by nithinmwarrier.com: huge typography, editorial layout, rich animation.
- Animations are a **core feature**, not decoration (explicitly the #1 attraction).

## 2. Technical Approach

- **Vanilla HTML + CSS + JavaScript.** No frameworks, no build tools, no npm. Every line understandable.
- **Multi-page site** (Approach A): home page + one case-study page per project.
- **One external library, added last:** Lenis (smooth scroll), introduced only after all hand-built animations are understood. Loaded via `<script>` tag.
- **Fonts:** Google Fonts via `<link>` — Archivo Black (display), Archivo (body).
- **Deployment:** GitHub Pages from a public GitHub repo (github.com/2320317-spec). Relative paths so the site works locally and on Pages.

### File structure
```
Personal_Website_2/
├── index.html
├── projects/
│   ├── booking-website.html
│   ├── sentrycore.html
│   └── mazebot.html
├── css/
│   └── style.css          (single shared stylesheet)
├── js/
│   ├── main.js            (nav, marquee, hovers, misc)
│   └── animations.js      (cascade, reveals, scrub, letter-zoom)
├── assets/
│   ├── images/            (project screenshots, diagrams)
│   └── resume/            (resume PDF)
└── docs/superpowers/specs/ (this spec + plans)
```

## 3. Design Tokens

| Token | Value | Used for |
|---|---|---|
| Cream | `#F2EEE9` | Main background |
| Ink | `#141414` | Text, dark sections, marquee band |
| Royal Violet | `#2E2447` | Footer background, section tags, stat numbers, accents (~10% of the site) |
| Watermark Violet | `#453768` | Tone-on-tone giant name in footer |
| Muted Lavender | `#A99CC9` | Small text on violet backgrounds |
| Display font | Archivo Black | Hero name, headings, watermark, stats |
| Body font | Archivo (400/600) | Paragraphs, labels, chips |

Recurring styling motifs: faint graph-grid background texture on cream sections; small uppercase letter-spaced editorial labels; pill-shaped chips and buttons; tone-on-tone watermark text.

## 4. Home Page (`index.html`) — top to bottom

1. **Hero (cream):** giant two-line name `MYKE LHOWELLE / MARUNDAN` (letter-cascade on load), label "Full Stack Developer", meta row "Based in Batangas" / "Student · Intern".
2. **Marquee band (ink):** infinite scrolling strip — `FULL STACK • WEB APPS • IOT • AI • ROBOTICS`.
3. **About (cream):** bold 1–2 sentence statement (mask reveal), supporting paragraph (background, journey, career goals), skill chips. *(Rubric #1)*
4. **Dark statement section (ink):** scroll-linked word highlight (scrub) on a statement like "Building web, hardware, and AI projects that actually work." Optional floating tool icons.
5. **Selected Projects (cream):** 2×2 grid — each cell: year top, project name center, category bottom; hover reveals project image + cursor-following "View project" pill. Cells: Booking Website `Full Stack Web`, sentryCORE `IoT × AI`, MazeBot `Robotics`, and a 4th "More on GitHub →" cell. *(Rubric #2 entry points)*
6. **Footer (royal violet):** giant watermark name with proximity letter-zoom; "Let's build something…" statement; links: Email, GitHub, LinkedIn, **Resume PDF download**; credit line "Designed & coded by Myke Lhowelle S. Marundan". *(Rubric #3)*

## 5. Case-Study Pages — shared skeleton + custom blocks

**Shared skeleton (all three):**
back-to-home link + `01/03` position marker → giant title (cascade) → meta (year, category, role) → tech chips → buttons (Live site ↗ / GitHub repo ↗, omit Live where N/A) → full-width hero image → numbered STAR sections (`01 Situation`, `02 Task`, `03 Action`, `04 Result`) → Result big-stat row → **Next project →** violet band chaining 01→02→03→01.

**Custom blocks per project (inside Action unless noted):**

| Project | Page | Custom blocks |
|---|---|---|
| Booking Website (`Full Stack Web`) | `booking-website.html` | Code snippet block; extra screenshots |
| sentryCORE (`IoT × AI`) — headline project | `sentrycore.html` | **Hardware manifest** chips (Arduino, servo, 4×4 keypad, 16×2 LCD, camera); **system architecture diagram** (keypad/camera → Arduino → web interface → local LLM via LM Studio → servo); demo video/GIF block |
| MazeBot (`Robotics`) | `mazebot.html` | Hardware manifest chips; **algorithm block** (how the bot navigates); demo video/GIF block |

STAR text, screenshots, stats, and demo media are provided by Myke during the build (a dedicated content-entry step in the plan). The 16×2 LCD assumption should be verified against the actual part.

## 6. Animation System (9 animations — all approved)

| # | Animation | Where | Technique |
|---|---|---|---|
| 1 | Letter cascade | Hero + case-study titles, on load | JS splits text into per-letter `<span>`s; staggered CSS animation delays |
| 2 | Mask reveal | Section headings, About statement | Text inside `overflow:hidden` wrapper slides up; staggered per line |
| 3 | Scroll reveal | Every section/card entering viewport | IntersectionObserver adds a class; CSS transition fades/raises |
| 4 | Hover effects | Links, buttons, grid cells | CSS `:hover` + `transition`: underline sweep, color invert, translate + arrow |
| 5 | Marquee | Band under hero | Duplicated text; CSS keyframes translateX(-50%) loop |
| 6 | Smooth scroll | Whole site, **added last** | Lenis library (only external dependency) |
| 7 | Scroll-linked word highlight | Dark statement section | JS splits into word spans; scroll progress % lights up that % of words; reverses on scroll-up |
| 8 | Project hover reveal | Projects grid | Image at `opacity:0` → `1` (0.3s); cursor-following pill via mousemove |
| 9 | Proximity letter zoom | Footer watermark | mousemove distance-per-letter; scale `1 + MAX·closeness²`. Tuned subtle: `MAX 0.18`, `RADIUS 170px`, lift 4px, transition 0.18s |

**Accessibility & touch:** respect `prefers-reduced-motion` (reduce/disable animations); on touch devices hover effects degrade gracefully (grid cells navigate on tap, letter-zoom off).

## 7. Responsive Behavior

- Type scales with `clamp()` — hero fills the screen at every width.
- Projects grid: 2×2 → single column on mobile.
- Layout uses flexbox/grid throughout; no horizontal page scroll.
- Case-study STAR grid stacks the number above content on narrow screens.

## 8. Content Data

| Item | Value |
|---|---|
| Display name | Myke Lhowelle S. Marundan (hero: MYKE LHOWELLE / MARUNDAN) |
| Role line | Full Stack Developer |
| Location | Batangas |
| GitHub | https://github.com/2320317-spec |
| LinkedIn | https://www.linkedin.com/in/myke-lhowelle-undefined-259729405 |
| Email | professional email — Myke provides during build |
| Resume PDF | Myke provides during build |
| STAR content ×3 | Myke provides during build (guided) |

## 9. Learning Approach (how we build)

- Build in small vertical steps: structure → style → animate, one section at a time, with plain-language explanation before each new concept.
- Myke personally tunes animation parameters (the "four knobs" lesson) after each effect works.
- Keep `docs/LEARNING.md` — a running glossary of every concept used (spans/stagger, IntersectionObserver, transitions, clamp, etc.) that Myke can revise from before presenting the portfolio.
- Milestone check: Myke should be able to explain any line when asked; unexplainable code is a bug in the process.

## 10. Verification

- Each feature verified visually in the browser as built (companion server or live-reload).
- Responsive check at mobile/tablet/desktop widths via devtools before calling any page done.
- Pre-deploy: click every link, download the resume, run Lighthouse (target: no red flags), test on one real phone.
- Post-deploy: verify the public GitHub Pages URL end-to-end.

## 11. Out of Scope

- Frameworks (React etc.) — possible future rebuild project.
- Backend/server code, contact forms (mailto: link instead), CMS, blog, dark-mode toggle.
- Paid fonts/assets; everything must be free.
