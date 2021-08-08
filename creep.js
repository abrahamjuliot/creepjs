import { isChrome, braveBrowser, getBraveMode, isFirefox, getOS, decryptUserAgent, getUserAgentPlatform, logTestResult, getPromiseRaceFulfilled } from './modules/helpers.js'
import { patch, html, note, count, modal, getMismatchStyle } from './modules/html.js'
import { hashMini, instanceId, hashify } from './modules/crypto.js'

import { captureError, attempt, caniuse, timer, errorsCaptured, getCapturedErrors, errorsHTML } from './modules/captureErrors.js'
import { sendToTrash, proxyBehavior, gibberish, trustInteger, trashBin, getTrash, trashHTML } from './modules/trash.js'
import { documentLie, phantomDarkness, parentPhantom, lieProps, prototypeLies, lieRecords, getLies, dragonFire, parentDragon, dragonOfDeath, getPluginLies, getNonFunctionToStringLies, liesHTML } from './modules/lies.js'

import { getOfflineAudioContext, audioHTML, getKnownAudio } from './modules/audio.js'
import { getCanvas2d, canvasHTML } from './modules/canvas2d.js'
import { getCanvasWebgl, webglHTML } from './modules/canvasWebgl.js'
import { getCSS, cssHTML } from './modules/computedStyle.js'
import { getCSSMedia, cssMediaHTML } from './modules/css.js'
import { getConsoleErrors, consoleErrorsHTML } from './modules/consoleErrors.js'
import { getWindowFeatures, windowFeaturesHTML } from './modules/contentWindowVersion.js'
import { getFonts, fontsHTML } from './modules/fonts.js'
import { getHeadlessFeatures, headlesFeaturesHTML } from './modules/headless.js'
import { getHTMLElementVersion, htmlElementVersionHTML } from './modules/htmlElementVersion.js'
import { getMaths, mathsHTML } from './modules/maths.js'
import { getMedia, mediaHTML } from './modules/media.js'
import { getNavigator, navigatorHTML } from './modules/navigator.js'
import { getClientRects, clientRectsHTML } from './modules/rects.js'
import { getScreen, screenHTML } from './modules/screen.js'
import { getTimezone, timezoneHTML } from './modules/timezone.js'
import { getVoices, voicesHTML } from './modules/voices.js'
import { getWebRTCData, webrtcHTML } from './modules/webrtc.js'
import { getBestWorkerScope, workerScopeHTML } from './modules/worker.js'
import { getSVG, svgHTML } from './modules/svg.js'
import { getResistance, resistanceHTML } from './modules/resistance.js'
import { getIntl, intlHTML } from './modules/intl.js'
import { getCSSFeaturesLie, getEngineFeatures, featuresHTML } from './modules/features.js'

const imports = {
	require: {
		// helpers
		isChrome,
		braveBrowser,
		getBraveMode,
		isFirefox,
		getOS,
		decryptUserAgent,
		getUserAgentPlatform,
		logTestResult,
		getPromiseRaceFulfilled,
		// crypto
		instanceId,
		hashMini,
		hashify,
		// html
		patch,
		html,
		note,
		count,
		modal,
		getMismatchStyle,
		// captureErrors
		captureError,
		attempt,
		caniuse,
		// trash
		sendToTrash,
		proxyBehavior,
		gibberish,
		trustInteger,
		// lies
		documentLie,
		// filter out lies on Function.prototype.toString (this is a false positive on native APIs void of tampering)
		lieProps: (() => {
			const props = lieProps.getProps()
			return Object.keys(props).reduce((acc, key) => {
				acc[key] = getNonFunctionToStringLies(props[key])
				return acc
			}, {})
		})(),
		prototypeLies,
		// collections
		errorsCaptured,
		trashBin,
		lieRecords,
		phantomDarkness,
		parentPhantom,
		dragonFire,
		dragonOfDeath,
		parentDragon,
		getPluginLies,
		getKnownAudio
	}
}
// worker.js

;(async imports => {
	'use strict';

	const {
		require: {
			instanceId,
			hashMini,
			patch,
			html,
			note,
			count,
			modal,
			caniuse,
			isFirefox
		}
	} = imports
	
	const fingerprint = async () => {
		const timeStart = timer()
		
		const [
			windowFeaturesComputed,
			htmlElementVersionComputed,
			cssComputed,
			cssMediaComputed,
			screenComputed,
			voicesComputed,
			canvas2dComputed,
			canvasWebglComputed,
			mathsComputed,
			consoleErrorsComputed,
			timezoneComputed,
			clientRectsComputed,
			offlineAudioContextComputed,
			fontsComputed,
			workerScopeComputed,
			mediaComputed,
			webRTCDataComputed,
			svgComputed,
			resistanceComputed,
			intlComputed
		] = await Promise.all([
			getWindowFeatures(imports),
			getHTMLElementVersion(imports),
			getCSS(imports),
			getCSSMedia(imports),
			getScreen(imports),
			getVoices(imports),
			getCanvas2d(imports),
			getCanvasWebgl(imports),
			getMaths(imports),
			getConsoleErrors(imports),
			getTimezone(imports),
			getClientRects(imports),
			getOfflineAudioContext(imports),
			getFonts(imports),
			getBestWorkerScope(imports),
			getMedia(imports),
			getWebRTCData(imports),
			getSVG(imports),
			getResistance(imports),
			getIntl(imports)
		]).catch(error => console.error(error.message))
		
		const [
			navigatorComputed,
			headlessComputed,
			featuresComputed
		] = await Promise.all([
			getNavigator(imports, workerScopeComputed),
			getHeadlessFeatures(imports, workerScopeComputed),
			getEngineFeatures({
				imports,
				cssComputed, 
				windowFeaturesComputed
			})
		]).catch(error => console.error(error.message))
		
		const [
			liesComputed,
			trashComputed,
			capturedErrorsComputed
		] = await Promise.all([
			getLies(imports),
			getTrash(imports),
			getCapturedErrors(imports)
		]).catch(error => console.error(error.message))
		
		//const start = performance.now()
		const [
			windowHash,
			headlessHash,
			htmlHash,
			cssMediaHash,
			cssHash,
			styleHash,
			systemHash,
			screenHash,
			voicesHash,
			canvas2dHash,
			canvasWebglHash,
			pixelsHash,
			pixels2Hash,
			mathsHash,
			consoleErrorsHash,
			timezoneHash,
			rectsHash,
			emojiHash,
			audioHash,
			fontsHash,
			workerHash,
			mediaHash,
			webRTCHash,
			navigatorHash,
			liesHash,
			trashHash,
			errorsHash,
			svgHash,
			resistanceHash,
			intlHash,
			featuresHash
		] = await Promise.all([
			hashify(windowFeaturesComputed),
			hashify(headlessComputed),
			hashify(htmlElementVersionComputed.keys),
			hashify(cssMediaComputed),
			hashify(cssComputed),
			hashify(cssComputed.computedStyle),
			hashify(cssComputed.system),
			hashify(screenComputed),
			hashify(voicesComputed),
			hashify(canvas2dComputed),
			hashify(canvasWebglComputed),
			caniuse(() => canvasWebglComputed.pixels.length) ? hashify(canvasWebglComputed.pixels) : undefined,
			caniuse(() => canvasWebglComputed.pixels2.length) ? hashify(canvasWebglComputed.pixels2) : undefined,
			hashify(mathsComputed.data),
			hashify(consoleErrorsComputed.errors),
			hashify(timezoneComputed),
			hashify(clientRectsComputed),
			hashify(clientRectsComputed.emojiSet),
			hashify(offlineAudioContextComputed),
			hashify(fontsComputed),
			hashify(workerScopeComputed),
			hashify(mediaComputed),
			hashify(webRTCDataComputed),
			hashify(navigatorComputed),
			hashify(liesComputed),
			hashify(trashComputed),
			hashify(capturedErrorsComputed),
			hashify(svgComputed),
			hashify(resistanceComputed),
			hashify(intlComputed),
			hashify(featuresComputed)
		]).catch(error => console.error(error.message))
		
		//console.log(performance.now()-start)
		
		const timeEnd = timeStart()

		if (parentPhantom) {
			parentPhantom.parentNode.removeChild(parentPhantom)
		}
		if (parentDragon) {
			parentDragon.parentNode.removeChild(parentDragon)
		}
		
		const fingerprint = {
			workerScope: !workerScopeComputed ? undefined : { ...workerScopeComputed, $hash: workerHash},
			webRTC: !webRTCDataComputed ? undefined : {...webRTCDataComputed, $hash: webRTCHash},
			navigator: !navigatorComputed ? undefined : {...navigatorComputed, $hash: navigatorHash},
			windowFeatures: !windowFeaturesComputed ? undefined : {...windowFeaturesComputed, $hash: windowHash},
			headless: !headlessComputed ? undefined : {...headlessComputed, $hash: headlessHash},
			htmlElementVersion: !htmlElementVersionComputed ? undefined : {...htmlElementVersionComputed, $hash: htmlHash},
			cssMedia: !cssMediaComputed ? undefined : {...cssMediaComputed, $hash: cssMediaHash},
			css: !cssComputed ? undefined : {...cssComputed, $hash: cssHash},
			screen: !screenComputed ? undefined : {...screenComputed, $hash: screenHash},
			voices: !voicesComputed ? undefined : {...voicesComputed, $hash: voicesHash},
			media: !mediaComputed ? undefined : {...mediaComputed, $hash: mediaHash},
			canvas2d: !canvas2dComputed ? undefined : {...canvas2dComputed, $hash: canvas2dHash},
			canvasWebgl: !canvasWebglComputed ? undefined : {...canvasWebglComputed, pixels: pixelsHash, pixels2: pixels2Hash, $hash: canvasWebglHash},
			maths: !mathsComputed ? undefined : {...mathsComputed, $hash: mathsHash},
			consoleErrors: !consoleErrorsComputed ? undefined : {...consoleErrorsComputed, $hash: consoleErrorsHash},
			timezone: !timezoneComputed ? undefined : {...timezoneComputed, $hash: timezoneHash},
			clientRects: !clientRectsComputed ? undefined : {...clientRectsComputed, $hash: rectsHash},
			offlineAudioContext: !offlineAudioContextComputed ? undefined : {...offlineAudioContextComputed, $hash: audioHash},
			fonts: !fontsComputed ? undefined : {...fontsComputed, $hash: fontsHash},
			lies: !liesComputed ? undefined : {...liesComputed, $hash: liesHash},
			trash: !trashComputed ? undefined : {...trashComputed, $hash: trashHash},
			capturedErrors: !capturedErrorsComputed ? undefined : {...capturedErrorsComputed, $hash: errorsHash},
			svg: !svgComputed ? undefined : {...svgComputed, $hash: svgHash },
			resistance: !resistanceComputed ? undefined : {...resistanceComputed, $hash: resistanceHash},
			intl: !intlComputed ? undefined : {...intlComputed, $hash: intlHash},
			features: !featuresComputed ? undefined : {...featuresComputed, $hash: featuresHash},
		}
		return { fingerprint, systemHash, styleHash, emojiHash, timeEnd }
	}
	
	// fingerprint and render
	const { fingerprint: fp, systemHash, styleHash, emojiHash, timeEnd } = await fingerprint().catch(error => console.error(error))
	
	console.log('%c✔ loose fingerprint passed', 'color:#4cca9f')

	console.groupCollapsed('Loose Fingerprint')
	console.log(fp)
	console.groupEnd()

	console.groupCollapsed('Loose Fingerprint JSON')
	console.log('diff check at https://www.diffchecker.com/diff\n\n', JSON.stringify(fp, null, '\t'))
	console.groupEnd()
	
	// Trusted Fingerprint
	const isBrave = await braveBrowser()
	const braveMode = getBraveMode()
	const braveFingerprintingBlocking = isBrave && (braveMode.standard || braveMode.strict)
	const getBraveUnprotectedParameters = parameters => {
		const blocked = new Set([			
			'FRAGMENT_SHADER.HIGH_FLOAT.precision',
			'FRAGMENT_SHADER.HIGH_FLOAT.rangeMax',
			'FRAGMENT_SHADER.HIGH_FLOAT.rangeMin',
			'FRAGMENT_SHADER.HIGH_INT.precision',
			'FRAGMENT_SHADER.HIGH_INT.rangeMax',
			'FRAGMENT_SHADER.HIGH_INT.rangeMin',
			'FRAGMENT_SHADER.LOW_FLOAT.precision',
			'FRAGMENT_SHADER.LOW_FLOAT.rangeMax',
			'FRAGMENT_SHADER.LOW_FLOAT.rangeMin',
			'FRAGMENT_SHADER.MEDIUM_FLOAT.precision',
			'FRAGMENT_SHADER.MEDIUM_FLOAT.rangeMax',
			'FRAGMENT_SHADER.MEDIUM_FLOAT.rangeMin',
			'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
			'MAX_COMBINED_UNIFORM_BLOCKS',
			'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
			'MAX_DRAW_BUFFERS_WEBGL',
			'MAX_FRAGMENT_INPUT_COMPONENTS',
			'MAX_FRAGMENT_UNIFORM_BLOCKS',
			'MAX_FRAGMENT_UNIFORM_COMPONENTS',
			'MAX_TEXTURE_MAX_ANISOTROPY_EXT',
			'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
			'MAX_UNIFORM_BUFFER_BINDINGS',
			'MAX_VARYING_COMPONENTS',
			'MAX_VERTEX_OUTPUT_COMPONENTS',
			'MAX_VERTEX_UNIFORM_BLOCKS',
			'MAX_VERTEX_UNIFORM_COMPONENTS',
			'SHADING_LANGUAGE_VERSION',
			'UNMASKED_RENDERER_WEBGL',
			'UNMASKED_VENDOR_WEBGL',
			'VERSION',
			'VERTEX_SHADER.HIGH_FLOAT.precision',
			'VERTEX_SHADER.HIGH_FLOAT.rangeMax',
			'VERTEX_SHADER.HIGH_FLOAT.rangeMin',
			'VERTEX_SHADER.HIGH_INT.precision',
			'VERTEX_SHADER.HIGH_INT.rangeMax',
			'VERTEX_SHADER.HIGH_INT.rangeMin',
			'VERTEX_SHADER.LOW_FLOAT.precision',
			'VERTEX_SHADER.LOW_FLOAT.rangeMax',
			'VERTEX_SHADER.LOW_FLOAT.rangeMin',
			'VERTEX_SHADER.MEDIUM_FLOAT.precision',
			'VERTEX_SHADER.MEDIUM_FLOAT.rangeMax',
			'VERTEX_SHADER.MEDIUM_FLOAT.rangeMin'
		])
		const safeParameters = Object.keys(parameters).reduce((acc, curr) => {
			if (blocked.has(curr)) {
				return acc
			}
			acc[curr] = parameters[curr]
			return acc
		}, {})
		return safeParameters
	}
	const trashLen = fp.trash.trashBin.length
	const liesLen = !('totalLies' in fp.lies) ? 0 : fp.lies.totalLies
	const errorsLen = fp.capturedErrors.data.length

	// limit to known audio
	const { offlineAudioContext } = fp || {}
	const { compressorGainReduction, sampleSum } = offlineAudioContext || {}
	const knownSums = getKnownAudio()[compressorGainReduction]
	const unknownAudio = (
		sampleSum && compressorGainReduction && knownSums && !knownSums.includes(sampleSum)
	)
	const unknownFirefoxAudio = isFirefox && unknownAudio

	const hardenEntropy = (workerScope, prop) => {
		return (
			!workerScope ? prop : 
				(workerScope.localeEntropyIsTrusty && workerScope.localeIntlEntropyIsTrusty) ? prop : 
					undefined
		)
	}

	const privacyResistFingerprinting = (
		fp.resistance && /^(tor browser|firefox)$/i.test(fp.resistance.privacy)
	)

	const creep = {
		navigator: ( 
			!fp.navigator || fp.navigator.lied ? undefined : {
				bluetoothAvailability: fp.navigator.bluetoothAvailability,
				device: fp.navigator.device,
				deviceMemory: fp.navigator.deviceMemory,
				hardwareConcurrency: fp.navigator.hardwareConcurrency,
				keyboard: fp.navigator.keyboard,
				// distrust language if worker locale is not trusty
				language: hardenEntropy(fp.workerScope, fp.navigator.language),
				maxTouchPoints: fp.navigator.maxTouchPoints,
				mediaCapabilities: fp.navigator.mediaCapabilities,
				mimeTypes: fp.navigator.mimeTypes,
				oscpu: fp.navigator.oscpu,
				platform: fp.navigator.platform,
				plugins: fp.navigator.plugins,
				system: fp.navigator.system,
				userAgentData: {
					...(fp.navigator.userAgentData || {}),
					// loose
					brandsVersion: undefined, 
					uaFullVersion: undefined
				},
				vendor: fp.navigator.vendor
			}
		),
		screen: ( 
			!fp.screen || fp.screen.lied || privacyResistFingerprinting ? undefined : 
				hardenEntropy(
					fp.workerScope, {
						height: fp.screen.height,
						width: fp.screen.width,
						pixelDepth: fp.screen.pixelDepth,
						colorDepth: fp.screen.colorDepth,
						lied: fp.screen.lied
					}
				)
		),
		workerScope: !fp.workerScope || fp.workerScope.lied ? undefined : {
			canvas2d: (
				(fp.canvas2d && fp.canvas2d.lied) ? undefined : // distrust ungoogled-chromium, brave, firefox, tor browser 
				fp.workerScope.canvas2d
			),
			textMetrics: fp.workerScope.textMetrics,
			deviceMemory: (
				braveFingerprintingBlocking ? undefined : fp.workerScope.deviceMemory
			),
			hardwareConcurrency: (
				braveFingerprintingBlocking ? undefined : fp.workerScope.hardwareConcurrency
			),
			// system locale in blink
			language: fp.workerScope.language,
			languages: fp.workerScope.languages, 
			platform: fp.workerScope.platform,
			system: fp.workerScope.system,
			device: fp.workerScope.device,
			timezoneLocation: hardenEntropy(fp.workerScope, fp.workerScope.timezoneLocation),
			['webgl renderer']: (
				braveFingerprintingBlocking ? undefined : fp.workerScope.webglRenderer
			),
			['webgl vendor']: (
				braveFingerprintingBlocking ? undefined : fp.workerScope.webglVendor
			),
			fontFaceSetFonts: fp.workerScope.fontFaceSetFonts,
			userAgentData: {
				...fp.workerScope.userAgentData,
				// loose
				brandsVersion: undefined, 
				uaFullVersion: undefined
			},
			mediaCapabilities: fp.workerScope.mediaCapabilities,
		},
		media: fp.media,
		canvas2d: ( 
			!fp.canvas2d || fp.canvas2d.lied ? undefined : {
				dataURI: fp.canvas2d.dataURI,
				blob: fp.canvas2d.blob,
				blobOffscreen: fp.canvas2d.blobOffscreen,
				imageData: fp.canvas2d.imageData,
				textMetrics: fp.canvas2d.textMetrics,
				lied: fp.canvas2d.lied
			} 
		),
		canvasWebgl: !fp.canvasWebgl ? undefined : (
			braveFingerprintingBlocking ? {
				parameters: getBraveUnprotectedParameters(fp.canvasWebgl.parameters)
			} : fp.canvasWebgl.lied ? undefined : fp.canvasWebgl
		),
		cssMedia: !fp.cssMedia ? undefined : {
			reducedMotion: caniuse(() => fp.cssMedia.mediaCSS['prefers-reduced-motion']),
			colorScheme: (
				braveFingerprintingBlocking ? undefined :
				caniuse(() => fp.cssMedia.mediaCSS['prefers-color-scheme'])
			),
			monochrome: caniuse(() => fp.cssMedia.mediaCSS.monochrome),
			invertedColors: caniuse(() => fp.cssMedia.mediaCSS['inverted-colors']),
			forcedColors: caniuse(() => fp.cssMedia.mediaCSS['forced-colors']),
			anyHover: caniuse(() => fp.cssMedia.mediaCSS['any-hover']),
			hover: caniuse(() => fp.cssMedia.mediaCSS.hover),
			anyPointer: caniuse(() => fp.cssMedia.mediaCSS['any-pointer']),
			pointer: caniuse(() => fp.cssMedia.mediaCSS.pointer),
			colorGamut: caniuse(() => fp.cssMedia.mediaCSS['color-gamut']),
			screenQuery: privacyResistFingerprinting ? undefined : hardenEntropy(fp.workerScope, caniuse(() => fp.cssMedia.screenQuery)),
		},
		css: !fp.css ? undefined : {
			interfaceName: caniuse(() => fp.css.computedStyle.interfaceName),
			system: caniuse(() => fp.css.system)
		},
		maths: !fp.maths || fp.maths.lied ? undefined : fp.maths,
		consoleErrors: fp.consoleErrors,
		timezone: !fp.timezone || fp.timezone.lied ? undefined : {
			locationMeasured: hardenEntropy(fp.workerScope, fp.timezone.locationMeasured),
			lied: fp.timezone.lied
		},
		svg: !fp.svg || fp.svg.lied ? undefined : fp.svg,
		clientRects: !fp.clientRects || fp.clientRects.lied ? undefined : fp.clientRects,
		offlineAudioContext: !fp.offlineAudioContext ? undefined : (
			braveFingerprintingBlocking ? {
				values: fp.offlineAudioContext.values,
				compressorGainReduction: fp.offlineAudioContext.compressorGainReduction
			} : 
				fp.offlineAudioContext.lied || unknownFirefoxAudio ? undefined : 
					fp.offlineAudioContext
		),
		fonts: !fp.fonts || fp.fonts.lied ? undefined : fp.fonts,
		// skip trash since it is random
		lies: !!liesLen,
		capturedErrors: !!errorsLen,
		resistance: fp.resistance || undefined
	}

	console.log('%c✔ stable fingerprint passed', 'color:#4cca9f')

	console.groupCollapsed('Stable Fingerprint')
	console.log(creep)
	console.groupEnd()

	console.groupCollapsed('Stable Fingerprint JSON')
	console.log('diff check at https://www.diffchecker.com/diff\n\n', JSON.stringify(creep, null, '\t'))
	console.groupEnd()

	// get/post request
	const webapp = 'https://creepjs-6bd8e.web.app/fingerprint'

	const [fpHash, creepHash] = await Promise.all([hashify(fp), hashify(creep)])
	.catch(error => { 
		console.error(error.message)
	})

	// expose results to the window
	window.Fingerprint = JSON.parse(JSON.stringify(fp))
	window.Creep = JSON.parse(JSON.stringify(creep))

	// session
	const computeSession = fp => {
		const data = {
			revisedKeys: [],
			initial: undefined,
			loads: undefined
		}
		try {
			const currentFingerprint = Object.keys(fp)
			.reduce((acc, key) => {
				if (!fp[key]) {
					return acc
				}
				acc[key] = fp[key].$hash
				return acc
			}, {})
			const initialFingerprint = JSON.parse(sessionStorage.getItem('initialFingerprint'))
			if (initialFingerprint) {
				data.initial = hashMini(initialFingerprint)
				data.loads = 1+(+sessionStorage.getItem('loads'))
				sessionStorage.setItem('loads', data.loads)
				const revisedKeys = Object.keys(currentFingerprint)
					.filter(key => currentFingerprint[key] != initialFingerprint[key])
				if (revisedKeys.length) {
					data.revisedKeys = revisedKeys
				}
			}
			else {
				sessionStorage.setItem('initialFingerprint', JSON.stringify(currentFingerprint))
				sessionStorage.setItem('loads', 1)
				data.initial = hashMini(currentFingerprint)
				data.loads = 1
			}
			return data
		}
		catch (error) {
			console.error(error)
			return data
		}
	}
	
	// patch dom
	const hashSlice = x => x.slice(0, 8)
	const templateImports = {
		fp,
		hashSlice,
		hashMini,
		note,
		modal,
		count,
		getMismatchStyle
	}
	const hasTrash = !!trashLen
	const { lies: hasLied, capturedErrors: hasErrors } = creep

	const el = document.getElementById('fingerprint-data')
	patch(el, html`
	<div id="fingerprint-data">
		<div class="fingerprint-header-container">
			<div class="fingerprint-header">
				<strong>Your ID:</strong><span class="trusted-fingerprint ellipsis main-hash">${hashSlice(creepHash)}</span>
				<div class="ellipsis"><span class="time">${timeEnd.toFixed(2)} ms</span></div>
			</div>
		</div>
		<div id="creep-browser" class="visitor-info">
			<div class="flex-grid">
				<div class="col-six">
					<strong id="loader">Loading...</strong>
					<div>trust score: <span class="blurred">100%</span></div>
					<div>visits: <span class="blurred">1</span></div>
					<div>first: <span class="blurred">##/##/####, 00:00:00 AM</span></div>
					<div>last: <span class="blurred">##/##/####, 00:00:00 AM</span></div>
					<div>persistence: <span class="blurred">0.0 hours/span></div>
				</div>
				<div class="col-six">
					<div>has trash: <span class="blurred">false</span></div>
					<div>has lied: <span class="blurred">false</span></div>
					<div>has errors: <span class="blurred">false</span></div>
					<div>loose fingerprint: <span class="blurred">00000000</span></div>
					<div>loose count: <span class="blurred">1</span></div>
					<div>bot: <span class="blurred">false</span></div>
				</div>
			</div>
			<div id="signature">
			</div>
			<div class="flex-grid">
				<div class="col-four">
					<strong>Session ID</strong>
					<div>0</div>
				</div>
				<div class="col-four">
					<strong>Session Loads</strong>
					<div>0</div>
				</div>
				<div class="col-four">
					<strong>Session Switched</strong>
					<div>none</div>
				</div>
			</div>
		</div>
		<div class="flex-grid">
			${trashHTML(templateImports)}
			${liesHTML(templateImports)}
			${errorsHTML(templateImports)}
		</div>
		<div class="flex-grid">
			${webrtcHTML(templateImports)}
			${timezoneHTML(templateImports)}
			${intlHTML(templateImports)}			
		</div>
		<div id="browser-detection" class="flex-grid">
			<div class="col-eight">
				<strong>Loading...</strong>
				<div>client user agent:</div>
				<div>window object:</div>
				<div>system styles:</div>
				<div>computed styles:</div>
				<div>html element:</div>
				<div>js runtime (math):</div>
				<div>js engine (error):</div>
				<div>emojis:</div>
				<div>audio:</div>
			</div>
			<div class="col-four icon-container">
			</div>
		</div>
		<div id="headless-resistance-detection-results" class="flex-grid">
			${headlesFeaturesHTML(templateImports)}
			${resistanceHTML(templateImports)}
		</div>
		<div class="flex-grid relative">${workerScopeHTML(templateImports)}</div>
		<div class="flex-grid">${webglHTML(templateImports)}</div>
		<div class="flex-grid">
			${canvasHTML(templateImports)}
			${fontsHTML(templateImports)}
		</div>
		<div class="flex-grid">
			${audioHTML(templateImports)}
			${voicesHTML(templateImports)}
			${mediaHTML(templateImports)}
		</div>
		<div class="flex-grid">
			${clientRectsHTML(templateImports)}
			${svgHTML(templateImports)}
		</div>
		<div class="flex-grid">${screenHTML(templateImports)}</div>
		<div class="flex-grid">${featuresHTML(templateImports)}</div>
		<div class="flex-grid">
			${cssMediaHTML(templateImports)}
			${cssHTML(templateImports, systemHash)}
		</div>
		<div>
			<div class="flex-grid">
				${mathsHTML(templateImports)}
				${consoleErrorsHTML(templateImports)}
			</div>
			<div class="flex-grid">
				${windowFeaturesHTML(templateImports)}
				${htmlElementVersionHTML(templateImports)}
			</div>
		</div>
		<div class="flex-grid">${navigatorHTML(templateImports)}</div>
		<div>
			<strong>Tests</strong>
			<div>
				<a class="tests" href="./tests/workers.html">Workers</a>
				<br><a class="tests" href="./tests/iframes.html">Iframes</a>
				<br><a class="tests" href="./tests/fonts.html">Fonts</a>
				<br><a class="tests" href="./tests/timezone.html">Timezone</a>
				<br><a class="tests" href="./tests/window.html">Window Version</a>
				<br><a class="tests" href="./tests/screen.html">Screen</a>
				<br><a class="tests" href="./tests/prototype.html">Prototype</a>
				<br><a class="tests" href="./tests/domrect.html">DOMRect</a>
				<br><a class="tests" href="./tests/emojis.html">Emojis</a>
				<br><a class="tests" href="./tests/math.html">Math</a>
				<br><a class="tests" href="./tests/machine.html">Machine</a>
			</div>
		</div>
	</div>
	`, () => {
		// fetch data from server
		const id = 'creep-browser'
		const visitorElem = document.getElementById(id)
		const fetchVisitorDataTimer = timer()
		const request = `${webapp}?id=${creepHash}&subId=${fpHash}&hasTrash=${hasTrash}&hasLied=${hasLied}&hasErrors=${hasErrors}`
		
		fetch(request)
		.then(response => response.json())
		.then(async data => {

			console.groupCollapsed('Server Response')
			console.log(JSON.stringify(data, null, '\t'))
			fetchVisitorDataTimer('response time')
			console.groupEnd()
		
			const { firstVisit, lastVisit: latestVisit, looseFingerprints: subIds, visits,looseSwitchCount: switchCount,  hasTrash, hasLied, hasErrors, signature } = data
			
			const toLocaleStr = str => {
				const date = new Date(str)
				const dateString = date.toLocaleDateString()
				const timeString = date.toLocaleTimeString()
				return `${dateString}, ${timeString}`
			}
			const hoursAgo = (date1, date2) => Math.abs(date1 - date2) / 36e5
			const hours = hoursAgo(new Date(firstVisit), new Date(latestVisit)).toFixed(1)

			const computeTrustScore = ({ switchCount, errorsLen, trashLen, liesLen }) => {
				const score = {
					errorsRisk: 5.2,
					trashRisk: 15.5,
					liesRisk: 31,
					reward: 20,
					get switchCountPointLoss() {
						return -Math.round(
							switchCount < 2 ? -score.reward :
							switchCount < 11 ? switchCount * 0.1 :
							switchCount * 0.2
						)
					},
					get errorsPointLoss() {
						return -Math.round(errorsLen * score.errorsRisk)
					},
					get trashPointLoss() {
						return -Math.round(trashLen * score.trashRisk)
					},
					get liesPointLoss() {
						return -Math.round(liesLen * score.liesRisk)
					},
					get total() {
						const points = Math.round(
							100 +
							score.switchCountPointLoss +
							score.errorsPointLoss +
							score.trashPointLoss + 
							score.liesPointLoss
						)
						return points < 0 ? 0 : points > 100 ? 100 : points
					},
					get grade() {
						const total = score.total
						return (
							total > 95 ? 'A+' :
							total == 95 ? 'A' :
							total >= 90 ? 'A-' :
							total > 85 ? 'B+' :
							total == 85 ? 'B' :
							total >= 80 ? 'B-' :
							total > 75 ? 'C+' :
							total == 75 ? 'C' :
							total >= 70 ? 'C-' :
							total > 65 ? 'D+' :
							total == 65 ? 'D' :
							total >= 60 ? 'D-' :
							total > 55 ? 'F+' :
							total == 55 ? 'F' :
							'F-'
						)
					}
				}
				return score
			}

			const {
				switchCountPointLoss,
				errorsPointLoss,
				trashPointLoss,
				liesPointLoss,
				grade,
				total: scoreTotal
			} = computeTrustScore({
				switchCount,
				errorsLen,
				trashLen,
				liesLen
			})
			const percentify = x => {
				return `<span class="scale-up grade-${x < 0 ? 'F' : x > 0 ? 'A' : ''}">${
					x > 0 ? `+${x}% reward` : x < 0 ? `${x}%` : ''
				}</span>`
			}

			const renewedDate = '2021-8-1'
			const addDays = (date, n) => {
				const d = new Date(date)
				d.setDate(d.getDate() + n)
				return d
			}
			const shouldStyle = d => {
				const endNoticeDate = addDays(renewedDate, 7)
				const daysRemaining = Math.round((+endNoticeDate - +new Date()) / (1000 * 3600 * 24))
				return daysRemaining >= 0
			}
			
			const template = `
				<div class="visitor-info">
					<div class="ellipsis">
						<span class="aside-note">fingerprints renewed <span class="${shouldStyle(renewedDate) ? 'renewed' : ''}">${
							new Date(renewedDate).toLocaleDateString()
						}</span></span>
					</div>
					<div class="flex-grid">
						<div class="col-six">
							<strong>Browser</strong>
							<div>trust score: <span class="unblurred">
								${scoreTotal}% <span class="scale-down grade-${grade.charAt(0)}">${grade}</span>
							</span></div>
							<div>visits: <span class="unblurred">${visits}</span></div>
							<div class="ellipsis">first: <span class="unblurred">${toLocaleStr(firstVisit)}</span></div>
							<div class="ellipsis">last: <span class="unblurred">${toLocaleStr(latestVisit)}</span></div>
							<div>persistence: <span class="unblurred">${hours} hours</span></div>
						</div>
						<div class="col-six">
							<div>has trash: <span class="unblurred">${
								(''+hasTrash) == 'true' ?
								`true ${percentify(trashPointLoss)}` : 
								'false'
							}</span></div>
							<div>has lied: <span class="unblurred">${
								(''+hasLied) == 'true' ? 
								`true ${percentify(liesPointLoss)}` : 
								'false'
							}</span></div>
							<div>has errors: <span class="unblurred">${
								(''+hasErrors) == 'true' ? 
								`true ${percentify(errorsPointLoss)}` : 
								'false'
							}</span></div>
							<div class="ellipsis">loose fingerprint: <span class="unblurred">${hashSlice(fpHash)}</span></div>
							<div class="ellipsis">loose switched: <span class="unblurred">${switchCount}x ${percentify(switchCountPointLoss)}</span></div>
							<div class="ellipsis">bot: <span class="unblurred">${
								caniuse(() => fp.headless.headlessRating) ? 'true (headless)' :
								caniuse(() => fp.headless.stealthRating) ? 'true (stealth)' :
								switchCount > 9 && hours < 48 ? 'true (10 loose in 48 hours)' : 'false'
							}</span></div>
						</div>
					</div>
					${
						signature ? 
						`
						<div class="fade-right-in" id="signature">
							<div class="ellipsis"><strong>signed</strong>: <span>${signature}</span></div>
						</div>
						` :
						`<form class="fade-right-in" id="signature">
							<input id="signature-input" type="text" placeholder="add a signature to your fingerprint" title="sign your fingerprint" required minlength="4" maxlength="64">
							<input type="submit" value="Sign">
						</form>
						`
					}
					${
						(() => {
							const { initial, loads, revisedKeys } = computeSession(fp)
							
							return `
								<div class="flex-grid">
									<div class="col-four">
										<strong>Session ID</strong>
										<div><span class="sub-hash">${initial}</span></div>
									</div>
									<div class="col-four">
										<strong>Session Loads</strong>
										<div>${loads}</div>
									</div>
									<div class="col-four">
										<strong>Session Switched</strong>
										<div>${
											!revisedKeys.length ? 'none' :
											modal(
												`creep-revisions`,
												revisedKeys.join('<br>'),
												hashMini(revisedKeys)
											)
										}</div>
									</div>
								</div>
							`	
						})()
					}
				</div>
			`
			patch(visitorElem, html`${template}`, () => {
				if (signature) {
					return
				}
				const form = document.getElementById('signature')
				form.addEventListener('submit', async () => {
					event.preventDefault()

					
					const input = document.getElementById('signature-input').value
					const submit = confirm(`Are you sure? This cannot be undone.\n\nsignature: ${input}`)

					if (!submit) {
						return
					}

					const signatureRequest = `https://creepjs-6bd8e.web.app/sign?id=${creepHash}&signature=${input}`

					// animate out
					form.classList.remove('fade-right-in')
					form.classList.add('fade-down-out')

					// fetch/animate in
					return fetch(signatureRequest)
					.then(response => response.json())
					.then(data => {
						return setTimeout(() => {
							patch(form, html`
								<div class="fade-right-in" id="signature">
									<div class="ellipsis"><strong>signed</strong>: <span>${input}</span></div>
								</div>
							`)
							return console.log('Signed: ', JSON.stringify(data, null, '\t'))
						}, 300)
					})
					.catch(error => {
						patch(form, html`
							<div class="fade-right-in" id="signature">
								<div class="ellipsis"><strong style="color:crimson">${error}</strong></div>
							</div>
						`)
						return console.error('Error!', error.message)
					})
				})
			})

			const {
				maths,
				consoleErrors,
				htmlElementVersion,
				windowFeatures,
				css,
				clientRects,
				offlineAudioContext,
				resistance,
				navigator
			} = fp || {}
			const {
				computedStyle,
				system
			} = css || {}
			const { userAgentParsed: report } = navigator || {}

			const el = document.getElementById('browser-detection')
			const rejectSamplePatch = (el, html) => patch(el, html`
				<div class="flex-grid rejected">
					<div class="col-eight">
						<strong>Sample Rejected</strong>
						<div>client user agent:</div>
						<div>window object:</div>
						<div>system styles:</div>
						<div>computed styles:</div>
						<div>html element:</div>
						<div>js runtime (math):</div>
						<div>js engine (error):</div>
						<div class="ellipsis">emojis:</div>
						<div class="ellipsis">audio:</div>
					</div>
					<div class="col-four icon-container">
					</div>
				</div>
			`)
			
			const liedVersion = getCSSFeaturesLie(fp)

			if (
				!fp.workerScope ||
				fp.workerScope.lied ||
				!fp.workerScope.userAgent ||
				liedVersion
				//|| ('BroadcastChannel' in window && fp.workerScope.type == 'dedicated')
			) {
				return rejectSamplePatch(el, html)
			}

			const sender = {
				e: 3.141592653589793 ** -100,
				l: +new Date(new Date(`7/1/1113`))
			}
			
			const isTorBrowser = resistance.privacy == 'Tor Browser'
			//console.log(emojiHash) // Tor Browser check
			const {
				compressorGainReduction: gain,
				sampleSum,
				floatFrequencyDataSum: freqSum,
				floatTimeDomainDataSum: timeSum,
				values: audioValues
			} = offlineAudioContext || {}
			const valuesHash = hashMini(audioValues)
			const decryptRequest = `https://creepjs-6bd8e.web.app/decrypt?${[
				`sender=${sender.e}_${sender.l}`,
				`isTorBrowser=${isTorBrowser}`,
				`isBrave=${isBrave}`,
				`mathId=${maths.$hash}`,
				`errorId=${consoleErrors.$hash}`,
				`htmlId=${htmlElementVersion.$hash}`,
				`winId=${windowFeatures.$hash}`,
				`styleId=${styleHash}`,
				`styleSystemId=${systemHash}`,
				`emojiId=${!clientRects || clientRects.lied ? 'undefined' : emojiHash}`,
				`audioId=${
						!offlineAudioContext ||
						offlineAudioContext.lied ||
						unknownFirefoxAudio ? 'undefined' : 
							`${sampleSum}_${gain}_${freqSum}_${timeSum}_${valuesHash}`
				}`,
				`ua=${encodeURIComponent(fp.workerScope.userAgent)}`
			].join('&')}`

			return fetch(decryptRequest)
			.then(response => response.json())
			.then(data => {
				const {
					jsRuntime,
					jsEngine,
					htmlVersion,
					windowVersion,
					styleVersion,
					styleSystem,
					emojiSystem,
					audioSystem
				} = data
				
				const iconSet = new Set()
				const htmlIcon = cssClass => `<span class="icon ${cssClass}"></span>`
				const getTemplate = agent => {
					const { decrypted, system } = agent || {}
					const browserIcon = (
						/edgios|edge/i.test(decrypted) ? iconSet.add('edge') && htmlIcon('edge') :
						/brave/i.test(decrypted) ? iconSet.add('brave') && htmlIcon('brave') :
						/vivaldi/i.test(decrypted) ? iconSet.add('vivaldi') && htmlIcon('vivaldi') :
						/duckduckgo/i.test(decrypted) ? iconSet.add('duckduckgo') && htmlIcon('duckduckgo') :
						/yandex/i.test(decrypted) ? iconSet.add('yandex') && htmlIcon('yandex') :
						/opera/i.test(decrypted) ? iconSet.add('opera') && htmlIcon('opera') :
						/crios|chrome/i.test(decrypted) ? iconSet.add('chrome') && htmlIcon('chrome') :
						/tor browser/i.test(decrypted) ? iconSet.add('tor') && htmlIcon('tor') :
						/palemoon/i.test(decrypted) ? iconSet.add('palemoon') && htmlIcon('palemoon') :
						/fxios|firefox/i.test(decrypted) ? iconSet.add('firefox') && htmlIcon('firefox') :
						/v8/i.test(decrypted) ? iconSet.add('v8') && htmlIcon('v8') :
						/gecko/i.test(decrypted) ? iconSet.add('gecko') && htmlIcon('gecko') :
						/goanna/i.test(decrypted) ? iconSet.add('goanna') && htmlIcon('goanna') :
						/spidermonkey/i.test(decrypted) ? iconSet.add('firefox') && htmlIcon('firefox') :
						/safari/i.test(decrypted) ? iconSet.add('safari') && htmlIcon('safari') :
						/webkit/i.test(decrypted) ? iconSet.add('webkit') && htmlIcon('webkit') :
						/blink/i.test(decrypted) ? iconSet.add('blink') && htmlIcon('blink') : ''
					)
					const systemIcon = (
						/chrome os/i.test(system) ? iconSet.add('cros') && htmlIcon('cros') :
						/linux/i.test(system) ? iconSet.add('linux') && htmlIcon('linux') :
						/android/i.test(system) ? iconSet.add('android') && htmlIcon('android') :
						/ipad|iphone|ipod|ios|mac/i.test(system) ? iconSet.add('apple') && htmlIcon('apple') :
						/windows/i.test(system) ? iconSet.add('windows') && htmlIcon('windows') : ''
					)
					const icons = [
						browserIcon,
						systemIcon
					].join('')
					return (
						system ? `${icons}${decrypted} on ${system}` :
						`${icons}${decrypted}`
					)
				}
				
				const fakeUserAgent = (
					/\d+/.test(windowVersion.decrypted) &&
					windowVersion.decrypted != report
				)

				patch(el, html`
				<div class="flex-grid relative">
					<div class="ellipsis">
						<span class="aside-note-bottom">pending review: <span class="${data.pendingReview ? 'renewed' : ''}">${data.pendingReview || '0'}</span></span>
					</div>
					<div class="col-eight">
						<strong>Version</strong>
						<div>client user agent:
							<span class="${fakeUserAgent ? 'lies' : ''}">${report}</span>
						</div>
						<div class="ellipsis">window object: ${getTemplate(windowVersion)}</div>
						<div class="ellipsis">system styles: ${getTemplate(styleSystem)}</div>
						<div class="ellipsis">computed styles: ${getTemplate(styleVersion)}</div>
						<div class="ellipsis">html element: ${getTemplate(htmlVersion)}</div>
						<div class="ellipsis">js runtime (math): ${getTemplate(jsRuntime)}</div>
						<div class="ellipsis">js engine (error): ${getTemplate(jsEngine)}</div>
						<div class="ellipsis">emojis: ${!Object.keys(emojiSystem || {}).length ? note.unknown : getTemplate(emojiSystem)}</div>
						<div class="ellipsis">audio: ${!Object.keys(audioSystem || {}).length ? note.unknown : getTemplate(audioSystem)}</div>
					</div>
					<div class="col-four icon-container">
						${[...iconSet].map(icon => {
							return `<div class="icon-item ${icon}"></div>`
						}).join('')}
					</div>
				</div>
				`)
				return
			})
			.catch(error => {
				console.error('Error!', error.message)
				return rejectSamplePatch(el, html)
			})
		})
		.catch(error => {
			fetchVisitorDataTimer('Error fetching version data')
			patch(document.getElementById('browser-detection'), html`
				<style>
					.rejected {
						background: #ca656e14 !important;
					}
				</style>
				<div class="flex-grid rejected">
					<div class="col-eight">
						${error}
					</div>
					<div class="col-four icon-container">
					</div>
				</div>
			`)
			return console.error('Error!', error.message)
		})
	})
})(imports)