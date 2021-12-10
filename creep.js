import { isChrome, braveBrowser, getBraveMode, getBraveUnprotectedParameters, isFirefox, getOS, decryptUserAgent, getUserAgentPlatform, computeWindowsRelease, attemptWindows11UserAgent, isUAPostReduction, getUserAgentRestored, logTestResult, getPromiseRaceFulfilled } from './modules/helpers.js'
import { patch, html, note, count, modal, getMismatchStyle } from './modules/html.js'
import { hashMini, instanceId, hashify } from './modules/crypto.js'

import { captureError, attempt, caniuse, timer, errorsCaptured, getCapturedErrors, errorsHTML } from './modules/captureErrors.js'
import { sendToTrash, proxyBehavior, gibberish, trustInteger, compressWebGLRenderer, getWebGLRendererParts, hardenWebGLRenderer, getWebGLRendererConfidence, trashBin, getTrash, trashHTML } from './modules/trash.js'
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
import { getFeaturesLie, getEngineFeatures, featuresHTML } from './modules/features.js'
import { renderSamples } from './modules/samples.js'
import { getPrediction, renderPrediction, predictionErrorPatch } from './modules/prediction.js'

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
		compressWebGLRenderer,
		getWebGLRendererParts,
		hardenWebGLRenderer,
		getWebGLRendererConfidence,
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
		getKnownAudio,
		attemptWindows11UserAgent,
		isUAPostReduction,
		getUserAgentRestored
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

	const isBrave = isChrome ? await braveBrowser() : false
	const braveMode = isBrave ? getBraveMode() : {}
	const braveFingerprintingBlocking = isBrave && (braveMode.standard || braveMode.strict)

	const fingerprint = async () => {
		const timeStart = timer()
		const fingerprintTimeStart = timer()
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
		
		const fingerprintTimeEnd = fingerprintTimeStart()
		console.log(`Fingerprinting complete in ${(fingerprintTimeEnd).toFixed(2)}ms`)

		// GPU Prediction
		const { parameters: gpuParameter } = canvasWebglComputed || {}
		const reducedGPUParameters = {
			...(
				braveFingerprintingBlocking ? getBraveUnprotectedParameters(gpuParameter) :
					gpuParameter
			),
			RENDERER: undefined,
			SHADING_LANGUAGE_VERSION: undefined,
			UNMASKED_RENDERER_WEBGL: undefined,
			UNMASKED_VENDOR_WEBGL: undefined,
			VERSION: undefined,
			VENDOR: undefined
		}

		//console.log(hashMini(reducedGPUParameters))

		// Hashing
		const hashStartTime = timer()
		const [
			windowHash,
			headlessHash,
			htmlHash,
			cssMediaHash,
			cssHash,
			styleHash,
			styleSystemHash,
			screenHash,
			voicesHash,
			canvas2dHash,
			canvas2dImageHash,
			canvasWebglHash,
			canvasWebglImageHash,
			canvasWebglParametersHash,
			pixelsHash,
			pixels2Hash,
			mathsHash,
			consoleErrorsHash,
			timezoneHash,
			rectsHash,
			emojiHash,
			domRectHash,
			audioHash,
			fontsHash,
			workerHash,
			mediaHash,
			mimeTypesHash,
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
			hashify((htmlElementVersionComputed || {}).keys),
			hashify(cssMediaComputed),
			hashify(cssComputed),
			hashify((cssComputed || {}).computedStyle),
			hashify((cssComputed || {}).system),
			hashify(screenComputed),
			hashify(voicesComputed),
			hashify(canvas2dComputed),
			hashify((canvas2dComputed || {}).dataURI),
			hashify(canvasWebglComputed),
			hashify((canvasWebglComputed || {}).dataURI),
			hashify(reducedGPUParameters),
			caniuse(() => canvasWebglComputed.pixels.length) ? hashify(canvasWebglComputed.pixels) : undefined,
			caniuse(() => canvasWebglComputed.pixels2.length) ? hashify(canvasWebglComputed.pixels2) : undefined,
			hashify((mathsComputed || {}).data),
			hashify((consoleErrorsComputed || {}).errors),
			hashify(timezoneComputed),
			hashify(clientRectsComputed),
			hashify((clientRectsComputed || {}).emojiSet),
			hashify([
				(clientRectsComputed || {}).elementBoundingClientRect,
				(clientRectsComputed || {}).elementClientRects,
				(clientRectsComputed || {}).rangeBoundingClientRect,
				(clientRectsComputed || {}).rangeClientRects
			]),
			hashify(offlineAudioContextComputed),
			hashify(fontsComputed),
			hashify(workerScopeComputed),
			hashify(mediaComputed),
			hashify((mediaComputed || {}).mimeTypes),
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
		const hashTimeEnd = hashStartTime()
		const timeEnd = timeStart()

		console.log(`Hashing complete in ${(hashTimeEnd).toFixed(2)}ms`)

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
		return {
			fingerprint,
			styleSystemHash,
			styleHash,
			emojiHash,
			domRectHash,
			mimeTypesHash,
			canvas2dImageHash,
			canvasWebglImageHash,
			canvasWebglParametersHash,
			timeEnd
		}
	}
	
	// fingerprint and render
	const {
		fingerprint: fp,
		styleSystemHash,
		styleHash,
		emojiHash,
		domRectHash,
		mimeTypesHash,
		canvas2dImageHash,
		canvasWebglImageHash,
		canvasWebglParametersHash,
		timeEnd
	} = await fingerprint().catch(error => console.error(error))
	
	console.log('%c✔ loose fingerprint passed', 'color:#4cca9f')

	console.groupCollapsed('Loose Fingerprint')
	console.log(fp)
	console.groupEnd()

	console.groupCollapsed('Loose Fingerprint JSON')
	console.log('diff check at https://www.diffchecker.com/diff\n\n', JSON.stringify(fp, null, '\t'))
	console.groupEnd()
	
	// Trusted Fingerprint
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

	// harden gpu
	const hardenGPU = canvasWebgl => {
		const { gpu: { confidence, compressedGPU } } = canvasWebgl
		const goodConfidence = confidence != 'low'
		return (
			!goodConfidence ? {} : {
				UNMASKED_RENDERER_WEBGL: compressedGPU,
				UNMASKED_VENDOR_WEBGL: canvasWebgl.parameters.UNMASKED_VENDOR_WEBGL
			}
		)
	}

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
			webglRenderer: (
				(fp.workerScope.gpu.confidence != 'low') ? fp.workerScope.gpu.compressedGPU : undefined
			),
			webglVendor: (
				(fp.workerScope.gpu.confidence != 'low') ? fp.workerScope.webglVendor : undefined
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
				parameters: {
					...getBraveUnprotectedParameters(fp.canvasWebgl.parameters),
					...hardenGPU(fp.canvasWebgl)
				}
			} : fp.canvasWebgl.lied ? undefined : {
				...fp.canvasWebgl,
				parameters: {
					...fp.canvasWebgl.parameters,
					...hardenGPU(fp.canvasWebgl)
				}
			}
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
	const webapp = 'https://creepjs-api.web.app/fp'

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
		getMismatchStyle,
		patch,
		html,
		styleSystemHash,
		computeWindowsRelease
	}
	const hasTrash = !!trashLen
	const { lies: hasLied, capturedErrors: hasErrors } = creep
	const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`
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
				<div>${getBlankIcons()}</div>
				<div>${getBlankIcons()}self:</div>
				<div>${getBlankIcons()}system styles</div>
				<div>${getBlankIcons()}computed styles</div>
				<div>${getBlankIcons()}html element</div>
				<div>${getBlankIcons()}js runtime</div>
				<div>${getBlankIcons()}js engine</div>
				<div>${getBlankIcons()}emojis</div>
				<div>${getBlankIcons()}domRect</div>
				<div>${getBlankIcons()}svg</div>
				<div>${getBlankIcons()}mimeTypes</div>
				<div>${getBlankIcons()}audio</div>
				<div>${getBlankIcons()}canvas</div>
				<div>${getBlankIcons()}textMetrics</div>
				<div>${getBlankIcons()}webgl</div>
				<div>${getBlankIcons()}gpu params</div>
				<div>${getBlankIcons()}gpu model</div>
				<div>${getBlankIcons()}fonts</div>
				<div>${getBlankIcons()}voices</div>
				<div>${getBlankIcons()}screen</div>
				<div>${getBlankIcons()}resistance</div>
			</div>
			<div class="col-four icon-prediction-container">
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
			${cssHTML(templateImports)}
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

		// fetch fingerprint data from server
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

			const renewedDate = '11/14/2021'
			const addDays = (date, n) => {
				const d = new Date(date)
				d.setDate(d.getDate() + n)
				return d
			}
			const shouldStyle = renewedDate => {
				const endNoticeDate = addDays(renewedDate, 7)
				const daysRemaining = Math.round((+endNoticeDate - +new Date()) / (1000 * 3600 * 24))
				return daysRemaining >= 0
			}

			// Bot Detection
			const getBot = ({ fp, hours, hasLied, switchCount }) => {
				const userAgentReportIsOutsideOfFeaturesVersion = getFeaturesLie(fp)
				const userShouldGetThrottled = (switchCount > 20) && ((hours/switchCount) <= 7) // 
				const excessiveLooseFingerprints = hasLied && userShouldGetThrottled
				const workerScopeIsTrashed = !fp.workerScope || !fp.workerScope.userAgent
				const liedWorkerScope = !!(fp.workerScope && fp.workerScope.lied)
				// Patern conditions that warrant rejection
				const botPatterns = {
					excessiveLooseFingerprints,
					userAgentReportIsOutsideOfFeaturesVersion,
					workerScopeIsTrashed,
					liedWorkerScope
				}
				const totalBotPatterns = Object.keys(botPatterns).length
				const totalBotTriggers = (
					Object.keys(botPatterns).filter(key => botPatterns[key]).length
				)
				const botProbability = totalBotTriggers / totalBotPatterns
				const isBot = !!botProbability
				const botPercentString = `${(botProbability*100).toFixed(0)}%`
				if (isBot) {
					console.warn('bot patterns: ', botPatterns)
				}
				return {
					isBot,
					botPercentString
				}
			}
			
			const { isBot, botPercentString } = getBot({fp, hours, hasLied, switchCount}) 
			
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
							<div class="ellipsis">bot: <span class="unblurred">${botPercentString}</span></div>
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

					const signatureRequest = `https://creepjs-api.web.app/sign?id=${creepHash}&signature=${input}`

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
				canvas2d,
				canvasWebgl,
				screen: screenFp,
				fonts,
				voices,
				svg,
				media
			} = fp || {}
			const {
				computedStyle,
				system
			} = css || {}
			const isTorBrowser = resistance.privacy == 'Tor Browser'
			const isRFP = resistance.privacy == 'Firefox'
			const isBravePrivacy = resistance.privacy == 'Brave'
			//console.log(emojiHash) // Tor Browser check
			const screenMetrics = (
				!screenFp || screenFp.lied || isRFP || isTorBrowser ? 'undefined' : 
					`${screenFp.width}x${screenFp.height}`
			)
			const {
				compressorGainReduction: gain,
				sampleSum,
				floatFrequencyDataSum: freqSum,
				floatTimeDomainDataSum: timeSum,
				values: audioValues
			} = offlineAudioContext || {}
			const valuesHash = hashMini(audioValues)
			const audioMetrics = `${sampleSum}_${gain}_${freqSum}_${timeSum}_${valuesHash}`

			const getBestGPUModel = ({ canvasWebgl, workerScope }) => {
				const gpuHasGoodConfidence = data => {
					return (
						(data.gpu || {}).confidence &&
						(data.gpu.confidence != 'low')
					)
				}
				if (!canvasWebgl || canvasWebgl.parameterOrExtensionLie) {
					return 'undefined'
				}
				else if (workerScope && gpuHasGoodConfidence(workerScope)) {
					return workerScope.webglRenderer
				}
				else if (canvasWebgl && !canvasWebgl.parameterOrExtensionLie && gpuHasGoodConfidence(canvasWebgl)) {
					return ''+((canvasWebgl.parameters || {}).UNMASKED_RENDERER_WEBGL)
				}
				return 'undefined'
			}
			const gpuModel = encodeURIComponent(
				getBestGPUModel({ canvasWebgl, workerScope: fp.workerScope })
			)

			if (!isBot) {
				const sender = {
					e: 3.141592653589793 ** -100,
					l: +new Date(new Date(`7/1/1113`))
				}
				
				const { userAgent, userAgentData } = fp.workerScope || {}

				const workerScopeUserAgent = (
					getUserAgentRestored({ userAgent, userAgentData }) ||
					attemptWindows11UserAgent({ userAgent, userAgentData })
				)

				const decryptRequest = `https://creepjs-api.web.app/decrypt?${[
					`sender=${sender.e}_${sender.l}`,
					`isTorBrowser=${isTorBrowser}`,
					`isRFP=${isRFP}`,
					`isBrave=${isBrave}`,
					`resistanceId=${resistance.$hash}`,
					`mathId=${maths.$hash}`,
					`errorId=${consoleErrors.$hash}`,
					`htmlId=${htmlElementVersion.$hash}`,
					`winId=${windowFeatures.$hash}`,
					`styleId=${styleHash}`,
					`styleSystemId=${styleSystemHash}`,
					`emojiId=${!clientRects || clientRects.lied ? 'undefined' : emojiHash}`,
					`domRectId=${!clientRects || clientRects.lied ? 'undefined' : domRectHash}`,
					`svgId=${!svg || svg.lied ? 'undefined' : svg.$hash}`,
					`mimeTypesId=${!media || media.lied ? 'undefined' : mimeTypesHash}`,
					`audioId=${
							!offlineAudioContext ||
							offlineAudioContext.lied ||
							unknownFirefoxAudio ? 'undefined' : 
								audioMetrics
					}`,
					`canvasId=${
						!canvas2d || canvas2d.lied ? 'undefined' :
							canvas2dImageHash
					}`,
					`textMetricsId=${
						!canvas2d || canvas2d.liedTextMetrics || ((+canvas2d.textMetricsSystemSum) == 0) ? 'undefined' : 
							canvas2d.textMetricsSystemSum
					}`,
					`webglId=${
						!canvasWebgl || (canvas2d || {}).lied || canvasWebgl.lied ? 'undefined' :
							canvasWebglImageHash
					}`,
					`gpuId=${
						!canvasWebgl || canvasWebgl.parameterOrExtensionLie ? 'undefined' :
							canvasWebglParametersHash
					}`,
					`gpu=${gpuModel}`,
					`fontsId=${!fonts || fonts.lied ? 'undefined' : fonts.$hash}`,
					`voicesId=${!voices || voices.lied ? 'undefined' : voices.$hash}`,
					`screenId=${screenMetrics}`,
					`ua=${encodeURIComponent(workerScopeUserAgent)}`
				].join('&')}`

				const decryptionResponse = await fetch(decryptRequest)
					.catch(error => {
						console.error(error)
						predictionErrorPatch({error, patch, html})
						return
					})
				if (!decryptionResponse) {
					return
				}
				const decryptionData = await decryptionResponse.json()
				
				// Crowd-Blending Score
				
				const scoreKeys = [
					'windowVersion',
					'jsRuntime',
					'jsEngine',
					'htmlVersion',
					'styleVersion',
					'resistance',
					'styleSystem',
					'emojiSystem',
					'domRectSystem',
					'svgSystem',
					'mimeTypesSystem',
					'audioSystem',
					'canvasSystem',
					'textMetricsSystem',
					'webglSystem',
					'gpuSystem',
					'gpuModelSystem',
					'fontsSystem',
					'voicesSystem',
					'screenSystem'
				]

				const decryptionDataScores = scoreKeys.reduce((acc, key) => {
					const { score } = decryptionData[key] || {}
					const reporters = (
						score == 36 ? 1:
						score == 84 ? 2 :
						score == 96 ? 3 :
						score == 100 ? 4 :
							0
					)
					acc.metrics = [...(acc.metrics||[]), { key, score: (score||0), reporters }]
					acc.scores = [...(acc.scores||[]), (score||0)]
					return acc
				}, {})

				const { metrics: scoreMetrics } = decryptionDataScores
				const scoreMetricsMap = Object.keys(scoreMetrics).reduce((acc, key) => {
					const scoreMetricData = scoreMetrics[key]
					const { score , reporters } = scoreMetricData
					acc[scoreMetricData.key] = { score, reporters }
					return acc
				}, {})
				
				const blockedOrOpenlyPoisonedMetric = decryptionDataScores.scores.includes(0)
				const validScores = decryptionDataScores.scores.filter(n => !!n)
				const crowdBlendingScoreMin = Math.min(...validScores)
				const crowdBlendingScore = blockedOrOpenlyPoisonedMetric ? (0.75 * crowdBlendingScoreMin) : crowdBlendingScoreMin

				console.groupCollapsed(`Crowd-Blending Score: ${crowdBlendingScore}%`)
					console.table(scoreMetricsMap)
				console.groupEnd()

				renderPrediction({
					decryptionData,
					crowdBlendingScore,
					patch,
					html,
					note
				})
			}
		

			// get GCD Samples
			const webapp = 'https://script.google.com/macros/s/AKfycbw26MLaK1PwIGzUiStwweOeVfl-sEmIxFIs5Ax7LMoP1Cuw-s0llN-aJYS7F8vxQuVG-A/exec'
			const decryptionResponse = await fetch(webapp)
				.catch(error => {
					console.error(error)
					return
				})
			const decryptionSamples = (
				decryptionResponse ? await decryptionResponse.json() : undefined
			)

			// prevent Error: value for argument "documentPath" must point to a document
			const cleanGPUString = x => !x ? x : (''+x).replace(/\//g,'')
			
			const {
				window: winSamples,
				math: mathSamples,
				error: errorSamples,
				html: htmlSamples,
				style: styleSamples,
				resistance: resistanceSamples,
				styleVersion: styleVersionSamples,
				emoji: emojiSamples,
				domRect: domRectSamples,
				svg: svgSamples,
				mimeTypes: mimeTypesSamples,
				audio: audioSamples,
				canvas: canvasSamples,
				textMetrics: textMetricsSamples,
				webgl: webglSamples,
				fonts: fontsSamples,
				voices: voicesSamples,
				screen: screenSamples,
				gpu: gpuSamples,
				gpuModel: gpuModelSamples
			} = decryptionSamples || {}

			if (isBot && !decryptionSamples) {
				predictionErrorPatch({error: 'Failed prediction fetch', patch, html})
			}
			
			if (isBot && decryptionSamples) {
				// Perform Dragon Fire Magic
				const decryptionData = {
					windowVersion: getPrediction({ hash: (windowFeatures || {}).$hash, data: winSamples }),
					jsRuntime: getPrediction({ hash: (maths || {}).$hash, data: mathSamples }),
					jsEngine: getPrediction({ hash: (consoleErrors || {}).$hash, data: errorSamples }),
					htmlVersion: getPrediction({ hash: (htmlElementVersion || {}).$hash, data: htmlSamples }),
					styleVersion: getPrediction({ hash: styleHash, data: styleVersionSamples }),
					styleSystem: getPrediction({ hash: styleSystemHash, data: styleSamples }),
					resistance: getPrediction({ hash: (resistance || {}).$hash, data: resistanceSamples }),
					emojiSystem: getPrediction({ hash: emojiHash, data: emojiSamples }),
					domRectSystem: getPrediction({ hash: domRectHash, data: domRectSamples }),
					svgSystem: getPrediction({ hash: (svg || {}).$hash, data: svgSamples }),
					mimeTypesSystem: getPrediction({ hash: mimeTypesHash, data: mimeTypesSamples }),
					audioSystem: getPrediction({ hash: audioMetrics, data: audioSamples }),
					canvasSystem: getPrediction({ hash: canvas2dImageHash, data: canvasSamples }),
					textMetricsSystem: getPrediction({
						hash: (canvas2d || {}).textMetricsSystemSum,
						data: textMetricsSamples
					}),
					webglSystem: getPrediction({ hash: canvasWebglImageHash, data: webglSamples }),
					gpuSystem: getPrediction({ hash: canvasWebglParametersHash, data: gpuSamples }),
					gpuModelSystem: getPrediction({ hash: cleanGPUString(gpuModel), data: gpuModelSamples }),
					fontsSystem: getPrediction({ hash: (fonts || {}).$hash, data: fontsSamples }),
					voicesSystem: getPrediction({ hash: (voices || {}).$hash, data: voicesSamples }),
					screenSystem: getPrediction({ hash: screenMetrics, data: screenSamples })
				}

				renderPrediction({
					decryptionData,
					patch,
					html,
					note,
					bot: true
				})
			}
			
			// render entropy notes
			if (decryptionSamples) {
				const getEntropy = (hash, data) => {
					let classTotal = 0
					const metricTotal = Object.keys(data)
						.reduce((acc, key) => acc+= data[key].length, 0)
					const decryption = Object.keys(data).find(key => data[key].find(item => {
						if ((item.id == hash) && (item.reporterTrustScore > 36)) {
							const trustedSamples = data[key].filter(sample => {
								return (sample.reporterTrustScore > 36)
							})
							classTotal = trustedSamples.length
							return true
						}
						return false
					}))
					return {
						classTotal,
						decryption,
						metricTotal
					}
				}
				const entropyHash = {
					window: (windowFeatures || {}).$hash,
					math: (maths || {}).$hash,
					error: (consoleErrors || {}).$hash,
					html: (htmlElementVersion || {}).$hash,
					style: styleSystemHash,
					resistance: (resistance || {}).$hash,
					styleVersion: styleHash,
					emoji: emojiHash,
					domRect: domRectHash,
					svg: (svg || {}).$hash,
					mimeTypes: mimeTypesHash,
					audio: audioMetrics,
					canvas: canvas2dImageHash,
					textMetrics: (canvas2d || {}).textMetricsSystemSum,
					webgl: canvasWebglImageHash,
					fonts: (fonts || {}).$hash,
					voices: (voices || {}).$hash,
					screen: screenMetrics,
					gpu: canvasWebglParametersHash,
					gpuModel
				}
				const entropyDescriptors = {
					window: 'window object',
					math: 'engine math runtime',
					error: 'engine console errors',
					html: 'html element',
					style: 'system styles',
					resistance: 'resistance patterns',
					styleVersion: 'computed styles',
					emoji: 'domrect emojis',
					domRect: 'domrect metrics',
					svg: 'svg metrics',
					mimeTypes: 'media mimeTypes',
					audio: 'audio metrics',
					canvas: 'canvas image',
					textMetrics: 'textMetrics',
					webgl: 'webgl image',
					fonts: 'system fonts',
					voices: 'voices',
					screen: 'screen metrics',
					gpu: 'webgl parameters',
					gpuModel: 'webgl renderer'
				}
				Object.keys(decryptionSamples).forEach((key,i) => {
					const hash = (
						key == 'gpuModel' ? cleanGPUString(decodeURIComponent(entropyHash[key])) :
							entropyHash[key]
					)
					const {
						classTotal,
						decryption,
						metricTotal
					} = getEntropy(hash, decryptionSamples[key])
					const el = document.getElementById(`${key}-entropy`)
					const deviceMetric = (
						(key == 'screen') || (key == 'fonts') || (key == 'gpuModel')
					)
					const uniquePercent = !classTotal ? 0 : (1/classTotal)*100
					const signal = (
						uniquePercent == 0 ? 'entropy-unknown' :
						uniquePercent < 1 ? 'entropy-high' :
						uniquePercent > 10 ? 'entropy-low' :
							''
					)
					const animate = `style="animation: fade-up .3s ${100*i}ms ease both;"`
					return patch(el, html`
						<span ${animate} class="${signal} entropy-note help" title="1 of ${classTotal || Infinity}${deviceMetric ? ' in x device' : ` in ${decryption || 'unknown'}`}${` (trusted ${entropyDescriptors[key]})`}">
							${(uniquePercent).toFixed(2)}%
						</span>
					`)
				})
			}
			
			return renderSamples({ samples: decryptionSamples, templateImports })
		})
		.catch(error => {
			fetchVisitorDataTimer('Error fetching vistor data')
			patch(document.getElementById('browser-detection'), html`
				<style>
					.rejected {
						background: #ca656e14 !important;
					}
				</style>
				<div class="flex-grid rejected">
					<div class="col-eight">
						${'prediction service unavailable'}
					</div>
					<div class="col-four icon-prediction-container">
					</div>
				</div>
			`)
			return console.error('Error!', error.message)
		})
	})
})(imports)