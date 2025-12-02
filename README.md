# CreepJS

> **Disclaimer**  
This repository is a standalone project and has no affiliation with any external websites, organizations, or projects that may use a similar name or reference this repo.


[https://abrahamjuliot.github.io/creepjs](https://abrahamjuliot.github.io/creepjs)

The purpose of this project is to shed light on weaknesses and privacy leaks among modern anti-fingerprinting extensions and browsers.

1. Detect and ignore JavaScript tampering (prototype lies)
2. Fingerprint lie patterns
3. Fingerprint extension code
4. Fingerprint browser privacy settings
5. Use large-scale validation and collect inconsistencies
6. Feature detect and fingerprint [new APIs](https://www.javascripture.com/) that contain high entropy
7. For fingerprinting, use APIs that are the most difficult to fake

Tests are focused on:

- Tor Browser (SL 1 & 2)
- Firefox (RFP)
- ungoogled-chromium (fingerprint deception)
- Brave Browser (Standard/Strict)
- puppeteer-extra
- FakeBrowser
- Bromite
- uBlock Origin (aopr)
- NoScript
- DuckDuckGo Privacy Essentials
- JShelter (JavaScript Restrictor)
- Privacy Badger
- Privacy Possum
- Random User-Agent
- User Agent Switcher and Manager
- CanvasBlocker
- Trace
- CyDec
- Chameleon
- ScriptSafe
- Windscribe

## Tests

1. contentWindow (Self) object
2. CSS System Styles
3. CSS Computed Styles
4. HTMLElement
5. JS Runtime (Math)
6. JS Engine (Console Errors)
7. Emojis (DomRect)
8. DomRect
9. SVG
10. Audio
11. MimeTypes
12. Canvas (Image, Blob, Paint, Text, Emoji)
13. TextMetrics
14. WebGL
15. GPU Params (WebGL Parameters)
16. GPU Model (WebGL Renderer)
17. Fonts
18. Voices
19. Screen
20. Resistance (Known Patterns)
21. Device of Timezone

## Supported

- layout rendering engines: `Gecko`, `Goanna`, `Blink`, `WebKit`
- JS runtime engines: `SpiderMonkey`, `JavaScriptCore`, `V8`

## Interact with the fingerprint objects

- `window.Fingerprint`
- `window.Creep`

## Develop

Contributions are welcome.

🟫 install `pnpm install`<br>
🟩 build `pnpm build:dev`<br>
🟪 watch `pnpm watch:dev`<br>
🟦 release to GitHub pages `pnpm build`<br>

If you would like to test on a secure connection, GitHub Codespaces is supported. It is discouraged to host a copy of this repo on a personal site. The goal of this project is to conduct research and provide education, not to create a fingerprinting library.
