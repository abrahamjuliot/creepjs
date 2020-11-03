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

Tested:
- Tor Browser (SL 1 & 2)
- Firefox (RFP)
- ungoogled-chromium (fingerprint deception)
- Brave Browser (Standard/Strict)
- uBlock Origin (aopr)
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

### Signatures
- you may optionally sign your fingerprint with 4-64 characters
- signatures can be memorable descriptors 
- in low entropy browsers, a signature can signal to others that the fingerprint is shared

### New feature scaling
- scaling should occur no more than once per week
- new weekly features may render fingerprints anew
- view deploy [history](https://github.com/abrahamjuliot/creepjs/commits/master/docs/creep.js)

## Formulas
### Trust Score
A failing trust score is unique and can be used to connect fingerprints.

- start at `100%`
- less than 2 loose fingerprints: subtract `0`
- less than 11 loose fingerprints: subtract `total*1`
- 11+ loose fingerprints: subtract `total*5`
- trash: subtract `total*15.5`
- lies: subtract `total*31`
- errors: subtract `total*5.2`

### Bot Detection
Bots leak unusual behavior and can be denied service.
- 10 loose fingerprints within 48 hours

## Browser Detection
- a guess attempt is made to decrypt the browser vendor, version and platform
- this guess does not affect the fingerprint
- fingerprints with lies are ignored
- system is guessed only when `WorkerNavigator.userAgent` system is an exact match to the current samples 
- decoded samples are auto gathered and manually reviewed

### Tests
1. js Math implementation (SpiderMonkey, JavaScriptCore, V8)
2. js engine via console errors
3. HTMLElement version
4. system styles
5. CSS style version
6. contentWindow version

## Definitions
### Trash
- unusual results
- forgivable lies

### Lies
- prototype tampering
- failed math calculations

### Errors 
- invalid results
- blocked features

### Loose Fingerprint
- collects as much entropy as possible

### Fingerprint
- adapts to browsers and distrusts known noise vectors
- aims to ignore entropy unique to a browser version release
- gathers compressed and static entropy