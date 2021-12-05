# CreepJS

[https://abrahamjuliot.github.io/creepjs](https://abrahamjuliot.github.io/creepjs)

The purpose of this project is to shed light on weaknesses and privacy leaks among modern anti-fingerprinting extensions and browsers.

1. Detect and ignore API tampering (API lies)
2. Fingerprint lie types
3. Fingerprint extension code
4. Fingerprint browser privacy settings
5. Employ large-scale validation, but allow possible inconsistencies
6. Feature detect and fingerprint [new APIs](https://www.javascripture.com/) that reveal high entropy
7. Rely only on APIs that are the most difficult to spoof when generating a pure fingerprint

Tests are focused on:
- Tor Browser (SL 1 & 2)
- Firefox (RFP)
- ungoogled-chromium (fingerprint deception)
- Brave Browser (Standard/Strict)
- puppeteer-extra
- Bromite
- uBlock Origin (aopr)
- NoScript
- DuckDuckGo Privacy Essentials
- Privacy Badger
- Privacy Possom
- Random User-Agent
- User Agent Switcher and Manager
- CanvasBlocker
- Trace
- CyDec
- Chameleon
- ScriptSafe
- Windscribe

## Rules
### Data
- data collected: user agent string, encrypted fingerprints and booleans
- data retention: auto deletes 30 days after last visit
- visit tracking: limited to data retention and new feature scaling

### New feature scaling
- scaling should occur no more than once per week
- new weekly features may render fingerprints anew
- view deploy [history](https://github.com/abrahamjuliot/creepjs/commits/master/docs/creep.js)

### Signatures
- you may optionally sign your fingerprint with 4-64 characters
- signatures can be memorable descriptors 
- in low entropy browsers, a signature can signal to others that the fingerprint is shared

## Fingerprint Tracing Formulas

### Trust Score
A failing trust score is unique

- start at `100%`
- less than 2 loose fingerprints: reward `20%` extra credit
- 2 - 10 loose fingerprints: subtract `total*0.1`
- 11+ loose fingerprints: subtract `total*0.2`
- trash: subtract `total*15.5`
- lies: subtract `total*31`
- errors: subtract `total*5.2`

### Crowd-Blending Score
A metric with only 1 reporter is unique

- Metric scores decline by metric uniqueness
- Final score is the minimum of all metrics scores
- Blocked or openly poisoned metrics collectively subtract 25% from the final score
- Scoring formula: `100-(numberOfRequiredReporters ** (numberOfRequiredReporters - numberOfReporters))`
 - Where the number of required reporters is 4:
	* Blocked/Openly Poisoned `-100%`
	* 1 reporter `-64%`
	* 2 reporters `-16%`
	* 3 reporters `-4%`
	* 4+ reporters is considered a perfect score
- Unique metrics get 2 weeks to improve their score before auto-deletion

### Bot Detection
Bots leak unusual behavior and can be denied service.
- 10 loose fingerprints within 48 hours
- Headless rating > 0
- Stealth rating > 0

## Browser Prediction
- a prediction is made to decrypt the browser vendor, version, renderer, engine, system, device and gpu
- this prediction does not affect the fingerprint
- data is auto matched to fingerprint ids gathered from `WorkerNavigator.userAgent` and other stable metrics
- decoded samples from the server are auto computed or manually reviewed
- each sample goes through a number of client and server checks before it is considered trustworthy
- samples that are poisoned can self learn and heal themselves
- samples aging 45 days since last timestamp visit are auto discarded (random samples that never return are eventually auto removed)
- if the worker scope is blocked and the fingerprint ids exist in the database, the prediction can still be made

### Tests
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
12. Canvas
13. TextMetrics
14. WebGL
15. GPU Params (WebGL Parameters)
16. GPU Model (WebGL Renderer)
17. Fonts
18. Voices
19. Screen
20. Resistance (Known Patterns)

#### Supported
- layout rendering engines: `Gecko`, `Goanna`, `Blink`, `WebKit`
- JS runtime engines: `SpiderMonkey`, `JavaScriptCore`, `V8`

## Definitions
### Trash
- unusual results
- forgivable lies (invalid metrics capable of being restored)
- failed calculations that may reasonably occur at random (loose fingerprint metrics)

### Lies
- prototype tampering
- mismatch in worker scope or iframe
- failed math calculations

### Errors 
- ungracefully blocked features that break the web
- failed executions

## Interact with the fingerprint objects
- `window.Fingerprint`
- `window.Creep`

### Fingerprint
- collects as much entropy as possible
- permits loose metrics

### Creep
- adapts to browsers and distrusts known noise vectors
- aims to ignore entropy unique to a browser version release
- gathers compressed and static entropy

---
Contributions are welcome.