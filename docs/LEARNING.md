# Learning Log — Portfolio Project

Concepts I used and can explain. One line each; details in the linked code.

## Task 1 — Skeleton
- **HTML head vs body:** head = invisible setup (fonts, styles, metadata); body = visible content.
- **CSS custom properties (`--cream` etc.):** design tokens declared once on `:root`, used everywhere with `var()`. Change the token, the whole site updates.
- **CSS reset:** browsers add default margins/styles; we zero them so the design starts from a known state.
- **`clamp(min, preferred, max)`:** fluid sizing — grows/shrinks with the screen but never past the limits.
- **`prefers-reduced-motion`:** OS-level accessibility setting; we disable animations for users who ask for that.

## Task 3 — Letter cascade
- **The DOM:** the browser's live object model of the HTML; JS edits the DOM, the page updates.
- **Stagger:** one animation, each element delayed a bit more than the last (`--i * 40ms`). The whole "cascade" is just that.
- **`DOMContentLoaded`:** run JS only after the HTML is parsed, so the elements we look for exist.
- **Graceful no-op pattern:** every init function checks for its elements and does nothing if absent — same scripts safely load on every page.

## Bug #1 — The vanishing space (systematic debugging)
- **Symptom:** name rendered as one glued word, wrapping mid-word.
- **Evidence:** the space `<span>` existed in the DOM but measured 0px wide (a letter = 51px).
- **Root cause:** HTML whitespace collapsing — a span whose only content is a regular space gets trimmed to nothing. Bonus: bare inline-block letters also let lines break mid-word.
- **Fix at the root:** wrap each word in a `white-space: nowrap` span, keep real spaces as text between words — restores natural spacing AND natural word wrapping.
- **Second finding:** the 12.5vw font size borrowed from the inspiration never fit MY 13-character name; sized to 9.5vw measured against my own content. Design to your content, not someone else's.
- **Process:** evidence → hypothesis → minimal console test (0px → 17px) → root fix → measured verification. Never guess-and-patch.

## Task 4 — Marquee
- **The infinite-loop illusion:** duplicate the text, slide the strip left exactly 50%, restart instantly — copy #2 lands where copy #1 began, so the jump is invisible.
- **`@keyframes` vs `transition`:** keyframes = self-running timeline (no trigger); transition = reaction to a property change (hover, class toggle).
- **`aria-hidden="true"`:** hides the duplicate copy from screen readers so blind users don't hear everything twice.

## Task 5 — About + scroll/mask reveals
- **IntersectionObserver:** hand the browser elements and it "rings the doorbell" when they enter the screen — no scroll-event spam, efficient by design.
- **JS decides WHEN, CSS decides HOW:** JS only toggles a class (`is-visible`); the animation itself lives entirely in CSS. Clean separation of concerns.
- **Stagger via `--d`:** a custom property used as `transition-delay` lets sibling elements offset from one another with one shared rule.

## Bug #2 — The frozen laboratory
- **Symptom:** reveals never fired in the automated preview; transitions stuck at starting values even with correct classes and rules.
- **Proof:** disabling transitions entirely made styles apply instantly → CSS logic was correct all along.
- **Root cause:** the preview environment was a throttled renderer producing no animation frames — IntersectionObserver and transitions starve without frames.
- **Lesson:** sometimes the bug is in the test equipment, not the code. Prove it with a controlled experiment; final verification belongs in a real browser.

## Task 6 — Scroll-linked word highlight
- **Trigger vs scrub:** a trigger fires once (reveal); a scrub is welded to scroll position and runs both directions, like dragging a video timeline.
- **The measure → normalize → map recipe:** read position with `getBoundingClientRect()`, convert to a 0–1 progress number, then map progress onto the effect (60% progress = 60% of words lit). Reusable for endless scroll effects.
- **`scroll-behavior: smooth` is an animation too:** programmatic `scrollTo` glides instead of jumping — pass `behavior: 'instant'` when you need to jump (e.g. in tests).
- **Split-into-spans, third appearance:** cascade (by letter), scrub (by word). Same core trick, different unit and driver.

## Task 7 — Projects grid + hover reveal
- **CSS Grid vs flexbox:** flexbox = one dimension (a row OR a column); grid = two dimensions (`1fr 1fr` → equal columns, cells flow automatically).
- **Layering with position:** parent `relative` = anchor; child `absolute; inset: 0` = stretched over the parent. The hover image is always present at `opacity: 0` — hover just flips it, so it's instant.
- **Mouse coordinate conversion:** `e.clientX - rect.left` turns screen coordinates into inside-this-element coordinates. That's the whole cursor-following trick.
- **`(hover: none)` media query:** phones can't hover — give them a permanent faint image and hide cursor-only UI. Feature-detect, don't device-detect.

## Bug #3 — The stale cache
- **Symptom (recurring):** freshly edited JS wouldn't run after navigation; functions existed on the server but not in the running page.
- **Root cause:** our dev server sent no `Cache-Control` header, so the browser used "heuristic caching" and served old copies of files.
- **Fix at the root:** dev server now sends `Cache-Control: no-store` — browsers must always fetch fresh during development.
- **Lesson:** HTTP caching is a real protocol layer between your editor and your browser. When code "doesn't update," check what the browser actually loaded (hard refresh = Ctrl+Shift+R bypasses cache).

## Task 8 — Footer + letter zoom + underline sweep
- **DRY payoff:** `splitLetters()` from Task 3 reused unchanged for the watermark — one function now powers two different animations (load cascade + mouse zoom).
- **Proximity math:** distance → closeness (0–1) → `scale = 1 + MAX × closeness²`. Squaring the closeness makes falloff feel organic. Four numbers define the whole personality.
- **`::after` pseudo-elements:** CSS can conjure a phantom child element — the underline is drawn by CSS, no extra HTML. `transform-origin` right→left flip makes it exit the opposite way it entered.
- **Tone-on-tone:** the watermark is a lighter shade of the footer's own violet — presence without shouting. Cheap trick, expensive look.

## Task 8b — Jelly (spring physics)
- **Why a transition can't do jelly:** a CSS transition glides to the target and stops. Jelly overshoots, springs back, wobbles, settles. That needs simulation, not interpolation.
- **The whole engine is 3 lines, run every frame:**
  `v += (target - c) * STIFFNESS` (spring pull) → `v *= DAMPING` (friction) → `c += v` (move).
  Momentum carries past the target = overshoot; friction shrinks each bounce = settle.
- **Verified numbers:** target scale 1.18, actual peak 1.24 (33% overshoot) at frame ~10, settled by frame ~40. Physics proven by simulating the loop in the console.
- **`requestAnimationFrame`:** "run my function before the next repaint" (~60×/sec). The loop stops itself when every spring is at rest and wakes on mousemove — never burn frames on nothing.
- **Mouse sets targets, physics does the rest:** the cursor never sets sizes directly. Decoupling input from motion is why it feels alive.
- **New knobs:** `STIFFNESS` 0.12 (snap speed), `DAMPING` 0.72 (wobble length — lower = jigglier).
- **`e.pageX` vs `e.clientX`:** page coordinates include scroll, so cached letter centers stay correct anywhere on the page.

## Task 8c — Long shadow
- **A long shadow is a stack, not a shadow:** 40 copies of the glyph, each nudged 0.01em further down-right, welded into a solid slab. The step must be much finer than the stroke width or gaps show (1.4px steps vs ~20px strokes = solid).
- **CSS can't loop, so JS writes the value:** `buildLongShadow()` returns the string; CSS applies it via `var(--long-shadow)`. Same JS-computes/CSS-renders split as the reveals.
- **`text-shadow` inherits:** declared once on `.watermark`, every `.letter` paints its own slab — and drags it along when the jelly springs fire.
- **`em` beats `px` for anything tied to type:** the shadow is 0.4em, so it scales with the responsive font instead of dwarfing the text on phones (56px on desktop, 19px on mobile — automatically).
- **Single source of truth:** JS publishes `--shadow-reach`; the CSS margin is derived from it. Retune the knobs and the spacing follows — no silent collisions.
- **`max(3rem, calc(...))`:** picks whichever is bigger — the em-based clearance on desktop, or a 3rem floor for layout breathing room on phones. One line covers both worlds.
- **Whoever casts the shadow reserves the room:** spacing moved onto `.watermark` instead of the CTA below it. Responsibility belongs with the cause.

## Task 8d — Rising from the ground (three iterations to the right animation)
- **v1 — grow:** `scaleY(0→1)` from the baseline. Read as *inflating*, not rising. Rejected by eye.
- **v2 — rise behind a mask:** letters parked below a clip-path ground line, translating up. Closer, but the story was still "sliding out of a slot."
- **v3 — extrusion (final):** the ground IS the background. A flat letter is invisible because its face is painted the background color and casts no shadow — **camouflage, not clipping**. Scroll extrudes it: face travels up-left along the shadow axis while the shadow grows beneath it.
- **The invariant that sells it:** face offset `(1−p)·reach` + shadow length `p·reach` always sum to `reach` — the slab's far end stays welded to the ground point while the face climbs. Verified: p=0.5 → face 28.2px out, slab 20 of 40 steps.
- **The shadow tells the story.** What reads as "rising" isn't the movement — it's the lengthening shadow. Animate the *evidence* of height, not just the height.
- **Camouflage needs no mask:** at rest, face color === background color (`rgb(46,36,71)` both, read from the design tokens so a palette change can't break it) and `text-shadow: none`. Nothing is hidden; it's just invisible.
- **Precompute, then index:** 41 shadow strings built once; each frame just picks `SHADOWS[idx]` and only touches the DOM when the index changes. Never rebuild strings at 60fps.
- **The design call that survived all three versions:** hover-to-reveal was rejected — it would hide the name until someone mouses over it, forever on phones. Scroll reveals it for everyone. **Never put essential content behind an interaction.**
- **Two springs, one letter:** `sprout` (scroll-driven extrusion) and `hover` (mouse jelly), combined at paint time as `translate(off, off+lift) scale(grow)`. Independent inputs, shared physics.
- **Staggering a scrub:** each letter gets its own slice of the scroll window — verified 30% scroll → `.67 .56 .44 .33 .22 .11 0…`, a wave front rolling through the word.
- **Overshoot for free:** spring peaks at ~1.15, so faces pop slightly past home and settle — a bounce nobody scripted.
- **Iterating on feel is normal:** three versions to match the picture in Myke's head. Each rejection was informative ("it grows" → "it slides" → "it *rises*"). Naming what's wrong is design skill.
- **Knobs:** `SPREAD` 0.55 (stagger share), `SHADOW_STEPS` 40 + `SHADOW_STEP_EM` 0.01 (slab length), `STIFFNESS`/`DAMPING` (bounce).

## Task 8e — Pinning the footer (the award-site scroll trick)
- **What a "pin" actually is:** a wrapper taller than its `position: sticky` child. The child freezes to the viewport while the wrapper's extra height scrolls past. No scroll-jacking, no library — the page never lies about how much scroll is left, because the scroll is real.
- **`overflow-x: hidden` silently kills `position: sticky`.** Setting it forces `overflow-y` to compute to `auto`, making body a scroll container, so sticky sticks to *body* instead of the viewport. Fix: **`overflow-x: clip`** — clips without creating a scroll container, so `overflow-y` stays `visible`. Verified before/after.
- **Measure the element you're driving from.** While pinned, the watermark doesn't move — its own rect reads the same number forever. The progress has to come from the *pin wrapper's* travel: `-pin.top / (pin.height − footer.height)`.
- **A pinned element must fit the viewport** or its bottom is simply cut off. Mine measured 744px against a 720px screen — trimmed padding to fit. Verified 720/720 desktop and 812/812 mobile.
- **`svh` not `vh` for pinned height:** `vh` is the *large* viewport height; the moment a phone's address bar slides in, a `100vh` footer is taller than the screen and loses its bottom. `svh` assumes chrome is showing.
- **Finish before the pin releases** (`FINISH_AT 0.85`): the name reaches full height with scroll to spare, so it gets a beat to just stand there instead of completing on the last pixel.
- **Reduced motion must unwind the pin too.** With no animation to watch, a pinned screen is a full viewport of dead frozen scrolling — *worse* than no effect. `height: auto` + `position: static` gives those users a plain footer.
- **Knob:** `.footer-pin { height: 200svh }` — 100svh of frozen scroll. Lower = snappier reveal.

## Task 8f — Clearances, and the wiggle bug they exposed
- **Dead zones (`LEAD_IN` .15 / `LEAD_OUT` .2):** never start an animation on the same pixel the pin locks, or end it on the pixel it releases — scroll jitter at the edges makes it twitch. Budget the travel: 120px frozen → 520px rising → 160px frozen. The same idea as ScrollTrigger's start/end offsets.
- **Mapping a range inside a range:** `progress = (raw − LEAD_IN) / (1 − LEAD_IN − LEAD_OUT)`, clamped. Squeeze the animation into the middle slice of the scroll.
- **The real wiggle was a physics bug, not jitter.** Clamping the shadow at 40 steps while the overshooting face kept moving meant `face + shadow` no longer equalled `reach` — the slab's far end *lifted off the ground* by 8.7px on every bounce. Measured old drift −8.7px vs new −0.2px.
- **An invariant is only true if it's true everywhere.** I clamped one term of `face + shadow == reach` and not the other, so it silently broke at exactly the moment anyone would notice. Overshoot is a legitimate state: a letter standing taller than rest must cast a *longer* shadow (46 steps, not 40).
- **"It looks a bit off" is a bug report.** Myke saw an 8.7px drift by eye and called it wiggling; measuring turned a vague feel into an exact number and a root cause.

## Bug #4 — The zero-height viewport
- **Symptom:** `travel` came back as −871px; the footer appeared taller than its own pin wrapper.
- **Cause:** the automated preview pane's viewport had collapsed to `innerHeight: 0`, so `100svh` resolved to `0px` and the pin had no height. Environment, not code (cousin of Bug #2).
- **The tell:** two sign errors cancelled and the progress curve *looked* plausible. A passing test on garbage input is worse than a failing one — sanity-check the inputs (`travelIsPositive`), not just the outputs.
- **The guard earned its keep:** `if (travel > 0)` meant the real site degraded to a plain reveal instead of dividing by nonsense. Defensive guards are for the states you didn't imagine.

## Bug #5 — Measuring the wrong element (the statement scrub)
- **Symptom:** the words were already lit by the time the statement scrolled into view. It looked like a timing preference; it was a bug.
- **Root cause:** progress was driven by the **section's** top, but the thing animating is the **text**, centred inside a section 2.3x taller than it — so the formula tracked a point ~360px above the actual target. Measured: the sweep *started* with the text's middle at 130% down the screen (below the fold), was halfway at 102% (still invisible), and *finished* at 75% — before the text ever reached the centre. The entire animation played to an empty screen.
- **Fix:** measure the element you're animating. Progress now maps the **text's own middle**: 60% down the screen → start, 25% → fully lit. Verified: 0/9 lit at 60%, 3/9 at dead centre, 9/9 at 25%, and the text is fully on screen the whole way.
- **The rule:** *drive the animation from the thing that moves.* A parent's rect is not a proxy for a child's position — any padding, centring, or min-height silently offsets it.
- **Knobs:** `CENTRE_START` 0.60 / `CENTRE_END` 0.25 — where on the screen the sweep begins and ends, in viewport fractions.
- **"It feels early" is a measurement, not an opinion.** Myke described a feeling; the numbers turned it into an off-by-360px bug with a one-line fix.

## Task 9 — Case-study template (multi-page)
- **Relative paths:** `../css/style.css` = "up one folder, then css/". Pages in `projects/` reach shared assets with `../`; the home page uses plain `css/`.
- **One stylesheet, many pages:** every page links the same style.css, so a token change (`--violet`) updates the whole site at once.
- **Animations came free:** the new page has zero new JS. `data-cascade` and `data-reveal` just work because each init function finds its own elements and no-ops when absent.
- **Component classes (`.cs-*`) beat per-page styles:** Tasks 10–11 copy this skeleton and inherit the look — a mini design system.

## Curtain page transition
- **You can't animate across page loads** — a navigation destroys the page. Trick: animate BEFORE leaving (intercept click, `preventDefault`, navigate on `transitionend`) and AFTER arriving (start covered, fall away).
- **The sessionStorage handshake:** the leaving page sets a flag; the next page reads + deletes it. Direct visitors never see a curtain — only curtain exits get curtain entries.
- **Inject with JS, not HTML:** the overlay is built by `initCurtain()`, so every page (present and future) gets it with zero markup changes.
- **`cover` → `leave`, not cover → uncover:** panels fall in from the top, then continue past the bottom — the curtain passes through, like the reference.
- **Guards matter:** external links, downloads, `target="_blank"`, same-page anchors all skip the curtain; reduced-motion users skip it entirely; bfcache restores (`pageshow`) reset it.

## Curtain fix — the white flash (FOUC)
- **Symptom:** a white blink between the curtain covering and the new page's curtain appearing.
- **Cause:** the new page PAINTS before its JS runs — scripts at the end of body are too late to cover the first frame.
- **Fix:** a 3-line inline script in `<head>` (runs before first paint) stamps `curtain-in` on `<html>`; CSS paints a solid violet shield from frame one. `initCurtain()` then swaps shield → panels (same color = invisible handoff).
- **Guard:** the shield must come down on EVERY path — including reduced-motion and stale flags — or users stare at violet forever.
- **Concept:** this is FOUC (flash of unstyled content) fighting; the inline-head-script trick is the same one dark-mode toggles use.

## Task 10 — sentryCORE page
- **Template reuse checklist:** copy the page, then change title, meta description, position marker, cascade lines, meta row, chips, actions, custom blocks, next-link. Everything else is shared components.
- **Diagrams from divs, not images:** the architecture flow is styled `<span>`s in a flex row — crisp at any zoom, editable in seconds, themeable by tokens, and it wraps on phones (verified: 3 rows at mobile width) instead of shrinking to unreadable.
- **`role="img"` + `aria-label`:** screen readers get one clean sentence describing the flow instead of five floating words and arrows.
