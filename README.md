# UPFOREX Vision — Aurora Experience

Open the extracted `index.html` in Chrome or Edge. Keep all CSS, JavaScript and assets together. No npm, API key or additional library is needed for the standalone preview.

## What's new
- Cinematic first-screen hero: staged line-by-line heading entrance, blue/green atmospheric lighting, grid and scanner layers, orbiting signal, globe with moving connection arcs and a cursor-responsive view angle. All network and market visuals are illustrative, not live quotes or a service availability map.
- Four floating market controls select the corresponding existing market tab and scroll to the candlestick explorer. These are real accessible buttons, not decorative overlays.
- Mouse-follow ambient light and enhanced damped card tilt, border lighting, image parallax, icon elevation and magnetic buttons. Pointer effects are fine-pointer only; reduced motion and pause remain supported.
- Slim reading-progress line below the sticky navigation and a scroll cue. The existing account cards, platform, market explorer, trading tools, education, partnership, reviews, magazine-style blogs, CTA and footer remain in place. Their named-section HTML and footer HTML are unchanged. Original 95 anchors are preserved and two internal jump links are added.
- Globe dots are batched into a smaller number of Canvas paint operations; no new 3D runtime or large assets were added. No claim of measured production speed or superiority over a competitor.

## Files changed
`index.html`, `script.js`, `hover.js`; new `aurora.css` and `aurora.js`. Existing CSS and images are preserved. See `AURORA_TEST_RESULTS.json` for current checks. Earlier verification reports are historical and archived in `previous-edition-tests/`.

## Tests
The browser environment blocks `file://` navigation, so Chromium smoke tests used identical embedded HTML/CSS/JS/assets. No JS errors or horizontal overflow were observed at 1440, 1024, 768, 390, and 360 pixels. Hero pointer lighting/parallax, market selection and scrolling, all 24 market/period combinations, review arrows, account-card hover/reset, pause/resume and reduced-motion behavior passed the targeted checks. The first extended test timed out while testing the animated layout; shorter checks completed successfully. Local asset paths and original hrefs were verified. External destinations, full Angular integration, and real-device performance have not been certified.

## Production integration
This is a standalone non-indexable design preview. Do not replace your Angular project with this folder. Use existing routing, live market providers, blog CMS, review integration and multilingual SSR. Preserve the approved legal footer and risk statement. Review marketing content before publishing. See `ANGULAR_INTEGRATION.md` for integration context.
