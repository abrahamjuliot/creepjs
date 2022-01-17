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

### Fingerprint Hashing

- FP-ID: `SHA-256` hashing of stable fingerprint (Creep)
- Fuzzy: fuzzy hashing of first loose fingerprint
- Diffs: fuzzy hashing of current loose fingerprint
- Shadow: fuzzy hashing diffs history

```
FP-ID...: 9368a2b8913acba5633aa8f353bfd546aaaf77fd57c1416580e90fc41666feb2
Fuzzy...: 98fcf569e50680c3dcfb8e53e34874e2b2075c415208a1c05292119ec4000000
Diffs...: 50ed3569e50680c3dcfb8e00e3387c5fb2075c415408a2006292119ec4000000
Shadow..: 1111100000000000000000110010011100000000010001101000000000000000
```

### Trust Score
A failing trust score is unique

- start at `100`
- less than 2 loose fingerprints: reward `5` extra credit
- 0 shadow bits (session metric revisions): reward `10` extra credit
- 2 - 10 loose fingerprints: subtract `total*0.1`
- 11+ loose fingerprints: subtract `total*0.2`
- shadow bits: subtract `(total/64)*31`
- trash: subtract `total*5.5`
- lies: subtract `total*31`
- errors: subtract `total*3.5`

### Crowd-Blending Score
A metric with only 1 reporter is unique

- Metric scores decline by metric uniqueness
- Final score is the minimum of all metrics scores
- Blocked or openly poisoned metrics collectively reduce the final score by 25%
- Scoring formula: `100-(numberOfRequiredReporters ** (numberOfRequiredReporters - numberOfReporters))`
 - Where the number of required reporters is 4:
	* Blocked/Openly Poisoned `-100`
	* 1 reporter `-64`
	* 2 reporters `-16`
	* 3 reporters `-4`
	* 4+ reporters is considered a perfect score
- Unique metrics get 2 weeks to improve their score before auto-deletion

### Bot Detection
Bots leak unusual behavior and can be denied services

- Excessive loose fingerprints
- User agent version or platform does not match features
- worker scope tampering

#### bot hash/level
- `10000000:smart-enemy:lws` (lied worker scope)
- `01000000:crafty-attacker:lpv` (lied platform version)
- `00100000:stealth-hacker:ftp` (function toString proxy)
- `00010000:clumsy-spy:ofv` (ua outside features version)
- `00001000:bold-fraud:elc` (extreme lie count)
- `00000100:hyper-client:elf` (excessive loose fingerprints)
- `00000010:locked-down:wsb` (worker scope blocked)
- `00000001:stranger:csl` (crowd-blending score low)
- `00000000:friend` (none of the above)

### Shadow
Loose metric revision patterns can follow stable fingerprints like a shadow

- Shadow: a string of 64 characters used to capture the history of fuzzy fingerprint diffs
- Diffs or revisions may include browser updates, user settings and/or API tampering

## Browser Prediction
- A prediction is made to decrypt the browser vendor, version, renderer, engine, system, device and gpu
- This prediction does not affect the fingerprint
- Data is auto matched to fingerprint ids gathered from `WorkerNavigator.userAgent` and other stable metrics
- Decoded samples from the server are auto computed or manually reviewed
- Each sample goes through a number of client and server checks before it is considered trustworthy
- Samples that are poisoned can self learn and heal themselves
- Samples aging 45 days since last timestamp visit are auto discarded (random samples that never return are eventually auto removed)
- If the worker scope is blocked and the fingerprint ids exist in the database, the prediction can still be made

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