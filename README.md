# CreepJS

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

## Fingerprinting APIs
Service is limited to the [CreepJS](https://abrahamjuliot.github.io/creepjs) GitHub page.

> Prediction API: https://creepjs-api.web.app/decrypt

`/decrypt` captures hash strings in a data model and renders the data to cloud storage. The data model follows a set of instructions on how to respond if the metric appears again. This includes reject, merge, timestamp, modify, log data, and self-learn from patterns. Some patterns are configured to trigger a manual review.

Data that is newly discovered starts out with a very low score. The score will improve if the same data reappears with unique visits. The data will be placed in a queue for auto-deletion if the score remains low for two weeks. If the data is falsified, it should be difficult for it to build up any degree of trust over time. Data with a timestamp older than 40 days are also automatically deleted. This is designed to make it difficult for abnormal data to blend in.

> Fingerprint API: https://creepjs-api.web.app/fp

`/fp` computes a fingerprint profile derived from unique patterns. If certain suspicious patterns are detected, then the Prediction API will go into "locked" mode, in which case all further learning and data merging on the server will be shut down.

> Rate-Limits

Every hour, the API grants a maximum number of tokens to every incoming network. These tokens are then spent on request. If the network consumes all tokens in a given hour, then it gets put on timeout.

### Data
- data collected: worker scope user agent, webgl gpu renderer, js runtime engine, hashed browser fingerprints (`stable`, `loose`, `fuzzy`, & `shadow`), encrypted ip, encrypted system location, dates, and other metrics displayed on the website
- data retention:
    - browser fingerprint auto deletes:
        - 30 days after last visit
        - 30 days after we change the fingerprint
    - prediction data auto deletes:
        - if it fails to establish a good crowd-blending score within 2 weeks
        - 40 days after last seen
    - web tracing and traffic history auto discards:
        - after 60 days

#### Example Data Models
##### Prediction Samples

Purpose: learn and predict browser engine and platform version, device, and gpu
```js
{
	cleanup: false,
	decrypted: "Blink",
	devicePrimary: "Windows 10 (64-bit)",
	deviceTrust: `{
		"Windows:Windows 10 (64-bit)": ["6a9","fe3","bb7"],
		"Windows:Windows 7 (64-bit)": ["8a3"],
		"Windows:Windows 11 (64-bit)": ["e4a"]
	}`,
	devices: [
		"Windows:Windows 10 (64-bit)",
		"Windows:Windows 7 (64-bit)",
		"Windows:Windows 11 (64-bit)"
	],
	gpus: [],
	healEvents: [],
	highEntropyLossYield: false,
	highEntropyLost: true,
	id: "01aa0cc74cd124b8985d7e386e5499b34770353cab321e214a2aae122b4c1995",
	lock: false,
	logger: [
		"8eff_75d6295c_345026a9: Blink (2/5/1984, 2:54:02 AM)"
	],
	reporter: `{
		"dates": ["2/5/1984","2/10/1984","2/17/1984","2/22/1984"],
		"ips": ["8eff","66fa","6ac2","5887"]
	}`,
	reporterTrustScore: 100,
	reviewed: true,
	suggested: "no change",
	systemCore: "unknown",
	systems: [
		"Windows"
	],
	systemWatch: [
		"Windows:Windows:460191600000:8/2/1984:703722......:18"
	],
	timestamp: "1984-08-01T07:00:00.000Z",
	trash: false,
	type: "Canvas System",
	userAgents: [
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36"
	]
}
```

##### Fingerprints

Purpose: identify browser visit history and activity
```js
{
	bot: 0.125,
	botHash: "00000001",
	botLevel: "stranger:csl",
	crowdBlendingScore: 36,
	fingerprint: "18ce59ae1e65397c81b38da98e6eed23a8f6d4bd3a2a349ed800f7daebd6f9dc",
	firstVisit: "1984-08-01T07:00:00.000Z",
	fuzzyInit: "1879e559e5de22c3dceb603775ff8062bb274c41547f9fc0b38e919fc4000000",
	fuzzyLast: "1879e559e5de22c3dceb603775ff8062bb274c41547f9fc0b38e919fc4000000",
	lastVisit: "1984-08-01T07:00:00.000Z",
	lastVisitEpoch: 460191600000,
	looseFingerprints: [
		"f331fd21a4f8dec8054ffaec88c32723f840f6a6174303cd787fb676a513bbf6"
	],
	looseSwitchCount: 0,
	maxErrors: 0,
	maxLies: 0,
	maxTrash: 0,
	score: 100,
	scoreData: `{
		"switchCountPointGain": 5,
		"errorsPointGain": 0,
		"trashPointGain": 0,
		"liesPointGain": 0,
		"shadowBitsPointGain": 10,
		"grade": "A+"
	}`,
	shadow: "0000000000000000000000000000000000000000000000000000000000000000",
	shadowBits: 0,
	signature: "",
	timeHoursAlive: 0,
	timeHoursFromLastVisit: 0,
	timeHoursIdleMax: 0,
	timeHoursIdleMin: 0,
	visits: 1,
	benchmark: 565.4,
	resistance: ''
}
```

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

> The trust score shows the level of trust computed from the browser fingerprint values and revision indicators. If the score is 100%, there is a high level of trust in the reported values. Values should not be trusted when the score is low. No attempt is made to score how well a browser performs against fingerprint traceability and linkability. It is not always beneficial to have a high trust score, and sometimes a low trust score is not bad.

- start at `100`
- less than 2 loose fingerprints: reward `5` extra credit
- 0 shadow bits (revision indicator): reward `10` extra credit
- 2 - 10 loose fingerprints (revision indicator): subtract `total*0.1`
- 11+ loose fingerprints: subtract `total*0.2`
- shadow bits: subtract `(total/64)*31`
- trash: subtract `total*5.5`
- lies: subtract `total*31`
- errors: subtract `total*3.5`

#### Definitions
##### Trash
- unusual results or rare data
- forgivable lies: invalid metrics that can either be restored or used to create a better fingerprint
```js
platform = 'Cat OS'
gpu = '   Cat Adaptor'
// ¯\_(ツ)_/¯
```
- failed calculations that may reasonably occur at random (loose fingerprint metrics)
```js
userAgent = 'Chrome 102'
features = '101' // I disabled a feature
gpu = '^5zeD4 Cat Titan V' // We can forgive this
```

##### Lies
- JS tampering of native API functions via `Proxy` or `Object.defineProperty()`
- `Window` scope values not matching `WorkerGlobalScope` values
- top-level `Window` values not matching `HTMLIFrameElement.contentWindow` values
- failed `Math` calculations or invalid `DOMRect` coordinates
- Inconsistent results when rendering the same data repeatedly.
##### Errors
- ungracefully blocked features that break the web
- failed executions
```js
Performance.now = function() {
	// break the web
	throw new Error('Crash the code before it starts!')
}
```

##### Shadow Bits
- tracks the amount of `1` values (bits) in the shadow fingerprint
```js
bits = 4
totalBins = 64
shadowBits = bits/totalBins // 0.0625
```

### Crowd-Blending Score
A metric with only 1 reporter is unique

> In the prediction section, the crowd blending score is a site indicator that scores how well certain metrics blend in with other fingerprints (strictly collected on the same site).

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

> Do we really know you are a bot? No, but we can have fun trying!

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
- `00000010:locked-down:wsb` (service & shared worker scopes blocked)
- `00000001:stranger:csl` (crowd-blending score low)
- `00000000:friend` (none of the above)

```js
// Cute cat trap. Works every time!
let clientIsBadBot = false
let banned = false
// How long did the client pause to admire the cute cat?
const catTime = await getClientTimeWithCuteCat()
if (catTime < 10000 /* 10 seconds */) {
  clientIsBadBot = true
}
if (catTime < 1000) {
  // client should get banned! Proceed with caution
  // Agent could be extraterrestrial and friendly
  banned = true
}
```
![image](https://user-images.githubusercontent.com/6946045/178409285-49b345f7-c9ef-4d25-a07b-41db8fc46711.png)

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

#### Supported
- layout rendering engines: `Gecko`, `Goanna`, `Blink`, `WebKit`
- JS runtime engines: `SpiderMonkey`, `JavaScriptCore`, `V8`
## Interact with the fingerprint objects
- `window.Fingerprint`
- `window.Creep`

### Fingerprint (loose fingerprint)
The loose fingerprint is used to detect rapid and excessive fingerprints

- collects as much entropy as possible, including data with instability caused by fingerprinting resistance: JS tampering patterns, random poison, known noise, invalid data, and more
- does not collect data containing a high amount of instability: viewport size, performance, network speed,
- skips slow metrics: webrtc data

### Creep (FP ID)
This is the main fingerprint, the creep

- adapts to browsers and distrusts known noise vectors
- aims to ignore entropy unique to a browser version release
- gathers compressed and static entropy

## Develop

Contributions are welcome.

🟫 install `yarn install`<br>
🟩 build `yarn build:dev`<br>
🟪 watch `yarn watch:dev`<br>
🟦 release to GitHub pages `yarn build`<br>

