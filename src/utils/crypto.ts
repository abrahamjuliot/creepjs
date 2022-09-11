import { isFontOSBad } from '../fonts'
import { WORKER_TYPE } from '../worker'
import { getReportedPlatform } from './helpers'

// https://stackoverflow.com/a/22429679
const hashMini = (x) => {
	const json = `${JSON.stringify(x)}`
	const hash = json.split('').reduce((hash, char, i) => {
		return Math.imul(31, hash) + json.charCodeAt(i) | 0
	}, 0x811c9dc5)
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

// instance id
const instanceId = (
	String.fromCharCode(Math.random() * 26 + 97) +
	Math.random().toString(36).slice(-7)
)

// https://stackoverflow.com/a/53490958
// https://stackoverflow.com/a/43383990
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
const hashify = (x, algorithm = 'SHA-256') => {
	const json = `${JSON.stringify(x)}`
	const jsonBuffer = new TextEncoder().encode(json)
	return crypto.subtle.digest(algorithm, jsonBuffer).then((hashBuffer) => {
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		const hashHex = hashArray.map((b) => ('00' + b.toString(16)).slice(-2)).join('')
		return hashHex
	})
}

async function cipher(data: any): Promise<string[]> {
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const key = await crypto.subtle.generateKey(
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt'],
	)
	const json = JSON.stringify(data)
	const encoded = new TextEncoder().encode(json)
	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		encoded,
	)
	const message = btoa(String.fromCharCode.apply(
		null,
		new Uint8Array(ciphertext) as unknown as number[],
	))
	const vector = btoa(String.fromCharCode.apply(
		null,
		iv as unknown as number[],
	))
	const { k: keyData } = await crypto.subtle.exportKey('jwk', key)

	return [message, vector, keyData!]
}


const getBotHash = (fp, imports) => {
	const { getFeaturesLie, computeWindowsRelease } = imports
	const outsideFeaturesVersion = getFeaturesLie(fp)
	const workerScopeIsBlocked = (
		!fp.workerScope ||
		!fp.workerScope.userAgent ||
		// only accept shared and service types
		// device emulators can easily spoof dedicated scope
		WORKER_TYPE == 'dedicated'
	)
	const liedWorkerScope = !!(fp.workerScope && fp.workerScope.lied)
	let liedPlatformVersion = false
	if (fp.workerScope && fp.fonts) {
		const { platformVersion, platform } = fp.workerScope.userAgentData || {}
		const { platformVersion: fontPlatformVersion } = fp.fonts || {}
		const windowsRelease = computeWindowsRelease({
			platform,
			platformVersion,
			fontPlatformVersion,
		})

		const windowsPlatformVersionLie = (
			windowsRelease &&
			fontPlatformVersion &&
			!(''+windowsRelease).includes(fontPlatformVersion)
		)
		// use font platform (window scope) to detect userAgent (worker scope) lies
		const macOrWindowsPlatformVersionLie = (
			/macOS|Windows/.test(fontPlatformVersion) &&
			(platform && !fontPlatformVersion.includes(platform))
		)
		liedPlatformVersion = (
			windowsPlatformVersionLie ||
			macOrWindowsPlatformVersionLie
		)
	}

	const { totalLies } = fp.lies || {}
	const { fontFaceLoadFonts } = fp.fonts || {}
	const { userAgent } = fp.workerScope || {}
	const { stealth } = fp.headless || {}
	const [workerUserAgentOS] = userAgent ? getReportedPlatform(userAgent) : []
	const maxLieCount = 100
	const extremeLieCount = (
		isFontOSBad(workerUserAgentOS, fontFaceLoadFonts) ||
		((totalLies || 0) > maxLieCount) ||
		Object.values(stealth || {}).some((x) => x === true) // stealth lies are severe
	)
	const functionToStringHasProxy = (
		!!( stealth || {})['Function.prototype.toString has invalid TypeError'] ||
		!!( stealth || {})['Function.prototype.toString leaks Proxy behavior']
	)

	// Pattern conditions that warrant rejection
	const botPatterns = {
		// custom order is important
		liedWorkerScope, // lws
		liedPlatformVersion, // lpv
		functionToStringHasProxy, // ftp
		outsideFeaturesVersion, // ofv
		extremeLieCount, // elc
		excessiveLooseFingerprints: false, // elf (compute on server)
		workerScopeIsBlocked, // wsb
		crowdBlendingScoreIsLow: false, // csl
	}

	const botHash = Object.keys(botPatterns)
		.map((key) => botPatterns[key] ? '1' : '0').join('')
	return { botHash, badBot: Object.keys(botPatterns).find((key) => botPatterns[key]) }
}

const getFuzzyHash = async (fp) => {
	// requires update log (below) when adding new keys to fp
	const metricKeys = [
		'canvas2d.dataURI',
		'canvas2d.emojiSet',
		'canvas2d.emojiURI',
		'canvas2d.liedTextMetrics',
		'canvas2d.mods',
		'canvas2d.paintURI',
		'canvas2d.paintCpuURI',
		'canvas2d.textMetricsSystemSum',
		'canvas2d.textURI',
		'canvasWebgl.dataURI',
		'canvasWebgl.dataURI2',
		'canvasWebgl.extensions',
		'canvasWebgl.gpu',
		'canvasWebgl.parameterOrExtensionLie',
		'canvasWebgl.parameters',
		'canvasWebgl.pixels',
		'canvasWebgl.pixels2',
		'capturedErrors.data',
		'clientRects.domrectSystemSum',
		'clientRects.elementBoundingClientRect',
		'clientRects.elementClientRects',
		'clientRects.emojiSet',
		'clientRects.rangeBoundingClientRect',
		'clientRects.rangeClientRects',
		'consoleErrors.errors',
		'css.computedStyle',
		'css.system',
		'cssMedia.matchMediaCSS',
		'cssMedia.mediaCSS',
		'cssMedia.screenQuery',
		'features.cssFeatures',
		'features.cssVersion',
		'features.jsFeatures',
		'features.jsFeaturesKeys',
		'features.jsVersion',
		'features.version',
		'features.versionRange',
		'features.windowFeatures',
		'features.windowVersion',
		'fonts.apps',
		'fonts.emojiSet',
		'fonts.fontFaceLoadFonts',
		'fonts.pixelSizeSystemSum',
		'fonts.platformVersion',
		'headless.chromium',
		'headless.headless',
		'headless.headlessRating',
		'headless.likeHeadless',
		'headless.likeHeadlessRating',
		'headless.platformEstimate',
		'headless.stealth',
		'headless.stealthRating',
		'headless.systemFonts',
		'htmlElementVersion.keys',
		'intl.dateTimeFormat',
		'intl.displayNames',
		'intl.listFormat',
		'intl.locale',
		'intl.numberFormat',
		'intl.pluralRules',
		'intl.relativeTimeFormat',
		'lies.data',
		'lies.totalLies',
		'maths.data',
		'media.mimeTypes',
		'navigator.appVersion',
		'navigator.bluetoothAvailability',
		'navigator.device',
		'navigator.deviceMemory',
		'navigator.doNotTrack',
		'navigator.globalPrivacyControl',
		'navigator.hardwareConcurrency',
		'navigator.language',
		'navigator.maxTouchPoints',
		'navigator.mimeTypes',
		'navigator.oscpu',
		'navigator.permissions',
		'navigator.platform',
		'navigator.plugins',
		'navigator.properties',
		'navigator.system',
		'navigator.uaPostReduction',
		'navigator.userAgent',
		'navigator.userAgentData',
		'navigator.userAgentParsed',
		'navigator.vendor',
		'navigator.webgpu',
		'offlineAudioContext.binsSample',
		'offlineAudioContext.compressorGainReduction',
		'offlineAudioContext.copySample',
		'offlineAudioContext.floatFrequencyDataSum',
		'offlineAudioContext.floatTimeDomainDataSum',
		'offlineAudioContext.noise',
		'offlineAudioContext.sampleSum',
		'offlineAudioContext.totalUniqueSamples',
		'offlineAudioContext.values',
		'resistance.engine',
		'resistance.extension',
		'resistance.extensionHashPattern',
		'resistance.mode',
		'resistance.privacy',
		'resistance.security',
		'screen.availHeight',
		'screen.availWidth',
		'screen.colorDepth',
		'screen.height',
		'screen.pixelDepth',
		'screen.touch',
		'screen.width',
		'svg.bBox',
		'svg.computedTextLength',
		'svg.emojiSet',
		'svg.extentOfChar',
		'svg.subStringLength',
		'svg.svgrectSystemSum',
		'timezone.location',
		'timezone.locationEpoch',
		'timezone.locationMeasured',
		'timezone.offset',
		'timezone.offsetComputed',
		'timezone.zone',
		'trash.trashBin',
		'voices.defaultVoiceLang',
		'voices.defaultVoiceName',
		'voices.languages',
		'voices.local',
		'voices.remote',
		'windowFeatures.apple',
		'windowFeatures.keys',
		'windowFeatures.moz',
		'windowFeatures.webkit',
		'workerScope.device',
		'workerScope.deviceMemory',
		'workerScope.engineCurrencyLocale',
		'workerScope.gpu',
		'workerScope.hardwareConcurrency',
		'workerScope.language',
		'workerScope.languages',
		'workerScope.lies',
		'workerScope.locale',
		'workerScope.localeEntropyIsTrusty',
		'workerScope.localeIntlEntropyIsTrusty',
		'workerScope.platform',
		'workerScope.system',
		'workerScope.systemCurrencyLocale',
		'workerScope.timezoneLocation',
		'workerScope.timezoneOffset',
		'workerScope.uaPostReduction',
		'workerScope.userAgent',
		'workerScope.userAgentData',
		'workerScope.userAgentDataVersion',
		'workerScope.userAgentEngine',
		'workerScope.userAgentVersion',
		'workerScope.webglRenderer',
		'workerScope.webglVendor',
	]
	// construct map of all metrics
	const metricsAll = Object.keys(fp).sort().reduce((acc, sectionKey) => {
		const section = fp[sectionKey]
		const sectionMetrics = Object.keys(section || {}).sort().reduce((acc, key) => {
			if (key == '$hash' || key == 'lied') {
				return acc
			}
			return {...acc, [`${sectionKey}.${key}`]: section[key] }
		}, {})
		return {...acc, ...sectionMetrics}
	}, {})

	// reduce to 64 bins
	const maxBins = 64
	const metricKeysReported = Object.keys(metricsAll)
	const binSize = Math.ceil(metricKeys.length/maxBins)

	// update log
	const devMode = window.location.host != 'abrahamjuliot.github.io'
	if (devMode && (''+metricKeysReported != ''+metricKeys)) {
		const newKeys = metricKeysReported.filter((key) => !metricKeys.includes(key))
		const oldKeys = metricKeys.filter((key) => !metricKeysReported.includes(key))

		if (newKeys.length || oldKeys.length) {
			newKeys.length && console.warn('added fuzzy key(s):\n', newKeys.join('\n'))
			oldKeys.length && console.warn('removed fuzzy key(s):\n', oldKeys.join('\n'))

			console.groupCollapsed('update keys for accurate fuzzy hashing:')
			console.log(metricKeysReported.map((x) => `'${x}',`).join('\n'))
			console.groupEnd()
		}
	}

	// compute fuzzy fingerprint master
	const fuzzyFpMaster = metricKeys.reduce((acc, key, index) => {
		if (!index || ((index % binSize) == 0)) {
			const keySet = metricKeys.slice(index, index + binSize)
			return {...acc, [''+keySet]: keySet.map((key) => metricsAll[key]) }
		}
		return acc
	}, {})

	// hash each bin
	await Promise.all(
		Object.keys(fuzzyFpMaster).map((key) => hashify(fuzzyFpMaster[key]).then((hash) => {
			fuzzyFpMaster[key] = hash // swap values for hash
			return hash
		})),
	)

	// create fuzzy hash
	const fuzzyBits = 64
	const fuzzyFingerprint = Object.keys(fuzzyFpMaster)
		.map((key) => fuzzyFpMaster[key][0])
		.join('')
		.padEnd(fuzzyBits, '0')

	return fuzzyFingerprint
}

export { hashMini, instanceId, hashify, getBotHash, getFuzzyHash, cipher }
