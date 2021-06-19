import { isChrome, braveBrowser, getBraveMode, isFirefox, getOS, decryptUserAgent, getUserAgentPlatform, logTestResult, getPromiseRaceFulfilled } from './modules/helpers.js'
import { patch, html, note, count, modal } from './modules/html.js'
import { hashMini, instanceId, hashify } from './modules/crypto.js'

import { captureError, attempt, caniuse, timer, errorsCaptured, getCapturedErrors, errorsHTML } from './modules/captureErrors.js'
import { sendToTrash, proxyBehavior, gibberish, trustInteger, trashBin, getTrash, trashHTML } from './modules/trash.js'
import { documentLie, phantomDarkness, parentPhantom, lieProps, prototypeLies, lieRecords, getLies, dragonFire, parentDragon, dragonOfDeath, getPluginLies, liesHTML } from './modules/lies.js'

import { getOfflineAudioContext, audioHTML } from './modules/audio.js'
import { getCanvas2d, canvasHTML } from './modules/canvas2d.js'
import { getCanvasWebgl, webglHTML } from './modules/canvasWebgl.js'
import { getCSS, cssHTML } from './modules/computedStyle.js'
import { getCSSMedia, cssMediaHTML } from './modules/css.js'
import { getConsoleErrors, consoleErrorsHTML } from './modules/consoleErrors.js'
import { getWindowFeatures, windowFeaturesHTML } from './modules/contentWindowVersion.js'
import { getFonts, fontList, fontsHTML } from './modules/fonts.js'
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
		lieProps: lieProps.getProps(),
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
		getPluginLies
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
			caniuse
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
			resistanceComputed
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
			getFonts(imports, [...fontList]),
			getBestWorkerScope(imports),
			getMedia(imports),
			getWebRTCData(imports),
			getSVG(imports),
			getResistance(imports)
		]).catch(error => console.error(error.message))
		
		const [
			navigatorComputed,
			headlessComputed
		] = await Promise.all([
			getNavigator(imports, workerScopeComputed),
			getHeadlessFeatures(imports, workerScopeComputed)
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
			resistanceHash
		] = await Promise.all([
			hashify(windowFeaturesComputed),
			hashify(headlessComputed),
			hashify(htmlElementVersionComputed.keys),
			hashify(cssMediaComputed),
			hashify(cssComputed),
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
			hashify(resistanceComputed)
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
			workerScope: !workerScopeComputed ? undefined : { ...workerScopeComputed, $hash: workerHash },
			webRTC: !webRTCDataComputed ? undefined : {...webRTCDataComputed, $hash: webRTCHash },
			navigator: !navigatorComputed ? undefined : {...navigatorComputed, $hash: navigatorHash },
			windowFeatures: !windowFeaturesComputed ? undefined : {...windowFeaturesComputed, $hash: windowHash },
			headless: !headlessComputed ? undefined : {...headlessComputed, $hash: headlessHash },
			htmlElementVersion: !htmlElementVersionComputed ? undefined : {...htmlElementVersionComputed, $hash: htmlHash },
			cssMedia: !cssMediaComputed ? undefined : {...cssMediaComputed, $hash: cssMediaHash },
			css: !cssComputed ? undefined : {...cssComputed, $hash: cssHash },
			screen: !screenComputed ? undefined : {...screenComputed, $hash: screenHash },
			voices: !voicesComputed ? undefined : {...voicesComputed, $hash: voicesHash },
			media: !mediaComputed ? undefined : {...mediaComputed, $hash: mediaHash },
			canvas2d: !canvas2dComputed ? undefined : {...canvas2dComputed, $hash: canvas2dHash },
			canvasWebgl: !canvasWebglComputed ? undefined : {...canvasWebglComputed, pixels: pixelsHash, pixels2: pixels2Hash, $hash: canvasWebglHash },
			maths: !mathsComputed ? undefined : {...mathsComputed, $hash: mathsHash },
			consoleErrors: !consoleErrorsComputed ? undefined : {...consoleErrorsComputed, $hash: consoleErrorsHash },
			timezone: !timezoneComputed ? undefined : {...timezoneComputed, $hash: timezoneHash },
			clientRects: !clientRectsComputed ? undefined : {...clientRectsComputed, $hash: rectsHash },
			offlineAudioContext: !offlineAudioContextComputed ? undefined : {...offlineAudioContextComputed, $hash: audioHash },
			fonts: !fontsComputed ? undefined : {...fontsComputed, $hash: fontsHash },
			lies: !liesComputed ? undefined : {...liesComputed, $hash: liesHash },
			trash: !trashComputed ? undefined : {...trashComputed, $hash: trashHash },
			capturedErrors: !capturedErrorsComputed ? undefined : {...capturedErrorsComputed, $hash: errorsHash },
			svg: !svgComputed ? undefined : {...svgComputed, $hash: svgHash },
			resistance: !resistanceComputed ? undefined : {...resistanceComputed, $hash: resistanceHash },
		}
		return { fingerprint, timeEnd }
	}
	
	// fingerprint and render
	const { fingerprint: fp, timeEnd } = await fingerprint().catch(error => console.error(error))
	
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
	const navigatorHighEntropy = !fp.navigator ? {} : {
		device: fp.navigator.device,
		doNotTrack: fp.navigator.doNotTrack,
		globalPrivacyControl: fp.navigator.globalPrivacyControl,
		keyboard: fp.navigator.keyboard,
		language: fp.navigator.language,
		maxTouchPoints: fp.navigator.maxTouchPoints,
		mimeTypes: fp.navigator.mimeTypes,
		platform: fp.navigator.platform,
		system: fp.navigator.system,
		vendor: fp.navigator.vendor,
		lied: fp.navigator.lied
	}
	const creep = {
		navigator: ( 
			!fp.navigator ? undefined : (
				braveFingerprintingBlocking ? navigatorHighEntropy : 
				fp.navigator.lied ? undefined : {
					deviceMemory: fp.navigator.deviceMemory,
					hardwareConcurrency: fp.navigator.hardwareConcurrency,
					plugins: fp.navigator.plugins,
					...navigatorHighEntropy
				}
			)
		),
		screen: ( 
			!fp.screen || fp.screen.lied || (!!liesLen && isFirefox) ? undefined : {
				height: fp.screen.height,
				width: fp.screen.width,
				pixelDepth: fp.screen.pixelDepth,
				colorDepth: fp.screen.colorDepth,
				lied: fp.screen.lied
			}
		),
		workerScope: fp.workerScope ? {
			canvas2d: (
				(fp.canvas2d && fp.canvas2d.lied) ? undefined : // distrust ungoogled-chromium, brave, firefox, tor browser 
				fp.workerScope.canvas2d
			),
			deviceMemory: (
				braveFingerprintingBlocking ? undefined : fp.workerScope.deviceMemory
			),
			hardwareConcurrency: (
				braveFingerprintingBlocking ? undefined : fp.workerScope.hardwareConcurrency
			),
			language: fp.workerScope.language,
			platform: fp.workerScope.platform,
			system: fp.workerScope.system,
			device: fp.workerScope.device,
			timezoneLocation: fp.workerScope.timezoneLocation,
			['webgl renderer']: (
				braveFingerprintingBlocking ? undefined : fp.workerScope.webglRenderer
			),
			['webgl vendor']: (
				braveFingerprintingBlocking ? undefined : fp.workerScope.webglVendor
			)
		} : undefined,
		media: fp.media,
		canvas2d: ( 
			!fp.canvas2d || fp.canvas2d.lied ? undefined : {
				dataURI: fp.canvas2d.dataURI,
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
			screenQuery: caniuse(() => fp.cssMedia.screenQuery),
		},
		css: !fp.css ? undefined : {
			interfaceName: caniuse(() => fp.css.computedStyle.interfaceName),
			system: caniuse(() => fp.css.system)
		},
		maths: !fp.maths || fp.maths.lied ? undefined : fp.maths,
		consoleErrors: fp.consoleErrors,
		timezone: !fp.timezone || fp.timezone.lied ? undefined : {
			locationMeasured: fp.timezone.locationMeasured,
			lied: fp.timezone.lied
		},
		svg: !fp.svg || fp.svg.lied ? undefined : fp.svg,
		clientRects: !fp.clientRects || fp.clientRects.lied ? undefined : fp.clientRects,
		offlineAudioContext: !fp.offlineAudioContext ? undefined : (
			braveFingerprintingBlocking ? {
				values: fp.offlineAudioContext.values,
				compressorGainReduction: fp.offlineAudioContext.compressorGainReduction
			} : fp.offlineAudioContext.lied ? undefined : fp.offlineAudioContext
		),
		fonts: !fp.fonts || fp.fonts.lied ? undefined : fp.fonts,
		// skip trash since it is random
		lies: !!liesLen,
		capturedErrors: !!errorsLen
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
	window.Fingerprint = fp
	window.Creep = creep

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
	const hasTrash = !!trashLen
	const { lies: hasLied, capturedErrors: hasErrors } = creep

	const hashSlice = x => x.slice(0, 8)
	
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
			${trashHTML({ fp, hashSlice, modal })}
			${liesHTML({ fp, hashSlice, modal })}
			${errorsHTML({ fp, hashSlice, modal })}
		</div>
		<div class="flex-grid">
			${webrtcHTML({ fp, hashSlice, hashMini, note, modal })}
			${timezoneHTML({ fp, note, hashSlice })}			
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
			</div>
			<div class="col-four icon-container">
			</div>
		</div>

		<div id="headless-resistance-detection-results" class="flex-grid">
			${!fp.headless ?
				`<div class="col-six">
					<strong>Headless</strong>
					<div>chromium: ${note.blocked}</div>
					<div>like headless: ${note.blocked}</div>
					<div>0% matched</div>
					<div>headless: ${note.blocked}</div>
					<div>0% detected</div>
					<div>stealth: ${note.blocked}</div>
					<div>0% detected</div>
				</div>` :
			(() => {
				const {
					headless: data
				} = fp
				const {
					$hash,
					chromium,
					likeHeadless,
					likeHeadlessRating,
					headless,
					headlessRating,
					stealth,
					stealthRating
				} = data || {}
				
				return `
				<div class="col-six">
					<style>
						.like-headless-rating {
							background: linear-gradient(90deg, var(${likeHeadlessRating < 100 ? '--grey-glass' : '--error'}) ${likeHeadlessRating}%, #fff0 ${likeHeadlessRating}%, #fff0 100%);
						}
						.headless-rating {
							background: linear-gradient(90deg, var(--error) ${headlessRating}%, #fff0 ${headlessRating}%, #fff0 100%);
						}
						.stealth-rating {
							background: linear-gradient(90deg, var(--error) ${stealthRating}%, #fff0 ${stealthRating}%, #fff0 100%);
						}
					</style>
					<strong>Headless</strong><span class="hash">${hashSlice($hash)}</span>
					<div>chromium: ${''+chromium}</div>
					<div>like headless: ${
						modal(
							'creep-like-headless',
							'<strong>Like Headless</strong><br><br>'
							+Object.keys(likeHeadless).map(key => `${key}: ${''+likeHeadless[key]}`).join('<br>'),
							hashMini(likeHeadless)
						)
					}</div>
					<div class="like-headless-rating">${''+likeHeadlessRating}% matched</div>
					<div>headless: ${
						modal(
							'creep-headless',
							'<strong>Headless</strong><br><br>'
							+Object.keys(headless).map(key => `${key}: ${''+headless[key]}`).join('<br>'),
							hashMini(headless)
						)
					}</div>
					<div class="headless-rating">${''+headlessRating}% detected</div>
					<div>stealth: ${
						modal(
							'creep-stealth',
							'<strong>Stealth</strong><br><br>'
							+Object.keys(stealth).map(key => `${key}: ${''+stealth[key]}`).join('<br>'),
							hashMini(stealth)
						)
					}</div>
					<div class="stealth-rating">${''+stealthRating}% detected</div>
				</div>
				${resistanceHTML({fp, modal, note, hashMini, hashSlice})}
				`
			})()}
		</div>

		<div class="flex-grid relative">
			<div class="ellipsis"><span class="aside-note">${
				fp.workerScope && fp.workerScope.type ? fp.workerScope.type : ''
			} worker</span></div>
		${!fp.workerScope ?
			`<div class="col-six">
				<strong>Worker</strong>
				<div>timezone offset: ${note.blocked}</div>
				<div>location: ${note.blocked}</div>
				<div>language: ${note.blocked}</div>
				<div>deviceMemory: ${note.blocked}</div>
				<div>hardwareConcurrency: ${note.blocked}</div>
				<div>platform: ${note.blocked}</div>
				<div>system: ${note.blocked}</div>
				<div>canvas 2d: ${note.blocked}</div>
				<div>webgl vendor: ${note.blocked}</div>
			</div>
			<div class="col-six">
				<div>device:</div>
				<div class="block-text">${note.blocked}</div>
				<div>userAgent:</div>
				<div class="block-text">${note.blocked}</div>
				<div>webgl renderer:</div>
				<div class="block-text">${note.blocked}</div>
			</div>` :
		(() => {
			const { workerScope: data } = fp
			return `
			<div class="col-six">
				<strong>Worker</strong><span class="hash">${hashSlice(data.$hash)}</span>
				<div>timezone offset: ${data.timezoneOffset != undefined ? ''+data.timezoneOffset : note.unsupported}</div>
				<div>location: ${data.timezoneLocation}</div>
				<div>language: ${data.language || note.unsupported}</div>
				<div>deviceMemory: ${data.deviceMemory || note.unsupported}</div>
				<div>hardwareConcurrency: ${data.hardwareConcurrency || note.unsupported}</div>
				<div>platform: ${data.platform || note.unsupported}</div>
				<div>system: ${data.system || note.unsupported}</div>
				<div>canvas 2d:${
					data.canvas2d && data.canvas2d.dataURI ?
					`<span class="sub-hash">${hashMini(data.canvas2d.dataURI)}</span>` :
					` ${note.unsupported}`
				}</div>
				<div>webgl vendor: ${data.webglVendor || note.unsupported}</div>
			</div>
			<div class="col-six">
				<div>device:</div>
				<div class="block-text">
					<div>${data.device || note.unsupported}</div>
				</div>
				<div>userAgent:</div>
				<div class="block-text">
					<div>${data.userAgent || note.unsupported}</div>
				</div>
				<div>unmasked renderer:</div>
				<div class="block-text">
					<div>${data.webglRenderer || note.unsupported}</div>
				</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.canvasWebgl ?
			`<div class="col-four">
				<strong>WebGL</strong>
				<div>images: ${note.blocked}</div>
				<div>pixels: ${note.blocked}</div>
				<div>params (0): ${note.blocked}</div>
				<div>exts (0): ${note.blocked}</div>
			</div>
			<div class="col-four">
				<div>unmasked renderer: ${note.blocked}</div>
				<div class="block-text">${note.blocked}</div>
			</div>
			<div class="col-four"><image /></div>` :
		(() => {
			const { canvasWebgl: data } = fp
			const id = 'creep-canvas-webgl'
			
			const {
				$hash,
				dataURI,
				dataURI2,
				pixels,
				pixels2,
				lied,
				extensions,
				parameters
			} = data
			
			const paramKeys = parameters ? Object.keys(parameters).sort() : []
			return `
			<div class="col-four">
				<strong>WebGL</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div>images:${
					!dataURI ? ' '+note.blocked : `<span class="sub-hash">${hashMini(dataURI)}</span>${!dataURI2 || dataURI == dataURI2 ? '' : `<span class="sub-hash">${hashMini(dataURI2)}</span>`}`
				}</div>
				<div>pixels:${
					!pixels ? ' '+note.unsupported : `<span class="sub-hash">${hashSlice(pixels)}</span>${!pixels2 || pixels == pixels2 ? '' : `<span class="sub-hash">${hashSlice(pixels2)}</span>`}`
				}</div>
				<div>params (${count(paramKeys)}): ${
					!paramKeys.length ? note.unsupported :
					modal(
						`${id}-parameters`,
						paramKeys.map(key => `${key}: ${parameters[key]}`).join('<br>'),
						hashMini(parameters)
					)
				}</div>
				<div>exts (${count(extensions)}): ${
					!extensions.length ? note.unsupported : 
					modal(
						`${id}-extensions`,
						extensions.sort().join('<br>'),
						hashMini(extensions)
					)
				}</div>
			</div>
			<div class="col-four">
				<div>unmasked renderer:</div>
				<div class="block-text">
					<div>${
						!parameters.UNMASKED_RENDERER_WEBGL ? note.unsupported :
						parameters.UNMASKED_RENDERER_WEBGL
					}</div>	
				</div>
			</div>
			<div class="col-four"><image ${!dataURI ? '' : `width="100%" src="${dataURI}"`}/></div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.canvas2d ?
			`<div class="col-six">
				<strong>Canvas 2d</strong> <span>${note.blocked}</span>
				<div>0% rgba noise</div>
			</div>` :
		(() => {
			const { canvas2d: { lied, mods, $hash } } = fp
			const { pixels, rgba } = mods || {}
			const modPercent = pixels ? Math.round((pixels/400)*100) : 0
			return `
			<div class="col-six">
				<style>
					.rgba-noise-rating {
						background: linear-gradient(90deg, var(${modPercent < 50 ? '--grey-glass' : '--error'}) ${modPercent}%, #fff0 ${modPercent}%, #fff0 100%);
					}
				</style>
				<strong>Canvas 2d</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div class="rgba-noise-rating">${modPercent}% rgba noise${rgba ? ` (${rgba})` : ''}</div>
			</div>
			`
		})()}
		${!fp.fonts ?
			`<div class="col-six">
				<strong>Fonts</strong>
				<div>results (0): ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				fonts: {
					$hash,
					fonts,
					lied
				}
			} = fp
			return `
			<div class="col-six">
				<strong>Fonts</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div>results (${fonts ? count(fonts) : '0'}): ${fonts.length ? modal('creep-fonts', fonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>')) : note.blocked}</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.offlineAudioContext ?
			`<div class="col-four">
				<strong>Audio</strong>
				<div>sum: ${note.blocked}</div>
				<div>gain: ${note.blocked}</div>
				<div>freq: ${note.blocked}</div>
				<div>time: ${note.blocked}</div>
				<div>buffer noise: ${note.blocked}</div>
				<div>unique: ${note.blocked}</div>
				<div>data: ${note.blocked}</div>
				<div>copy: ${note.blocked}</div>
				<div>values: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				offlineAudioContext: {
					$hash,
					totalUniqueSamples,
					compressorGainReduction,
					floatFrequencyDataSum,
					floatTimeDomainDataSum,
					sampleSum,
					binsSample,
					copySample,
					lied,
					noise,
					values
				}
			} = fp
			const known = {
				[-20.538286209106445]: 124.04347527516074, // Chrome on Windows/Android
				[-31.509262084960938]: 35.7383295930922 // Firefox on Windows
			}
			const knownSum = known[compressorGainReduction]
			const style = (a, b) => b.map((char, i) => char != a[i] ? `<span class="bold-fail">${char}</span>` : char).join('')

			return `
			<div class="col-four">
				<style>
					.bold-fail {
						color: #ca656e;
					}
				</style>
				<strong>Audio</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div>sum: ${
					sampleSum && compressorGainReduction && knownSum ?
					style((''+knownSum).split(''), (''+sampleSum).split('')) :
					sampleSum
				}</div>
				<div>gain: ${compressorGainReduction}</div>
				<div>freq: ${floatFrequencyDataSum}</div>
				<div>time: ${floatTimeDomainDataSum}</div>
				<div>buffer noise: ${!noise ? 0 : `${noise.toFixed(4)}...`}</div>
				<div>unique: ${totalUniqueSamples}</div>
				<div>data:${
					''+binsSample[0] == 'undefined' ? ` ${note.unsupported}` : 
					`<span class="sub-hash">${hashMini(binsSample)}</span>`
				}</div>
				<div>copy:${
					''+copySample[0] == 'undefined' ? ` ${note.unsupported}` : 
					`<span class="sub-hash">${hashMini(copySample)}</span>`
				}</div>
				<div>values: ${
					modal(
						'creep-offline-audio-context',
						Object.keys(values).map(key => `<div>${key}: ${values[key]}</div>`).join(''),
						hashMini(values)
					)
				}</div>
			</div>
			`
		})()}
		${!fp.voices ?
			`<div class="col-four">
				<strong>Speech</strong>
				<div>voices (0): ${note.blocked}</div>
				<div>default: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				voices: {
					$hash,
					defaultVoice,
					voices
				}
			} = fp
			const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`)
			return `
			<div class="col-four">
				<strong>Speech</strong><span class="hash">${hashSlice($hash)}</span>
				<div>voices (${count(voices)}): ${
					!voiceList || !voiceList.length ? note.unsupported :
					modal(
						'creep-voices',
						voiceList.join('<br>'),
						hashMini(voices)
					)
				}</div>
				<div>default:${
					!defaultVoice ? ` ${note.unsupported}` :
					`<span class="sub-hash">${hashMini(defaultVoice)}</span>`
				}</div>
			</div>
			`
		})()}
		${!fp.media ?
			`<div class="col-four">
				<strong>Media</strong>
				<div>devices (0): ${note.blocked}</div>
				<div>constraints: ${note.blocked}</div>
				<div>mimes (0): ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				media: {
					mediaDevices,
					constraints,
					mimeTypes,
					$hash
				}
			} = fp

			const header = `
			<style>
				.audiop, .videop, .medias, .mediar, .blank-false {
					padding: 2px 8px;
				}
				.audiop {
					background: #657fca26;
				}
				.medias {
					background: #657fca54;
				}
				.videop {
					background: #ca65b424;
				}
				.mediar {
					background: #ca65b459;
				}
				.audiop.pb, .videop.pb, .guide.pr {
					color: #8f8ff1 !important;
				}
				.audiop.mb, .videop.mb, .guide.mb {
					color: #98cee4 !important;
				}
				.medias.tr, .mediar.tr, .guide.tr {
					color: #c778ba !important;
				}
			</style>
			<div>
			<br><span class="audiop">audioPlayType</span>
			<br><span class="videop">videoPlayType</span>
			<br><span class="medias">mediaSource</span>
			<br><span class="mediar">mediaRecorder</span>
			<br><span class="guide pr">P (Probably)</span>
			<br><span class="guide mb">M (Maybe)</span>
			<br><span class="guide tr">T (True)</span>
			</div>`
			const invalidMimeTypes = !mimeTypes || !mimeTypes.length
			const mimes = invalidMimeTypes ? undefined : mimeTypes.map(type => {
				const { mimeType, audioPlayType, videoPlayType, mediaSource, mediaRecorder } = type
				return `
					${audioPlayType == 'probably' ? '<span class="audiop pb">P</span>' : audioPlayType == 'maybe' ? '<span class="audiop mb">M</span>': '<span class="blank-false">-</span>'}${videoPlayType == 'probably' ? '<span class="videop pb">P</span>' : videoPlayType == 'maybe' ? '<span class="videop mb">M</span>': '<span class="blank-false">-</span>'}${mediaSource ? '<span class="medias tr">T</span>'  : '<span class="blank-false">-</span>'}${mediaRecorder ? '<span class="mediar tr">T</span>'  : '<span class="blank-false">-</span>'}: ${mimeType}
				`	
			})

			return `
			<div class="col-four">
				<strong>Media</strong><span class="hash">${hashSlice($hash)}</span>
				<div>devices (${count(mediaDevices)}): ${
					!mediaDevices || !mediaDevices.length ? note.blocked : 
					modal(
						'creep-media-devices',
						mediaDevices.join('<br>'),
						hashMini(mediaDevices)
					)
				}</div>
				<div>constraints: ${
					!constraints || !constraints.length ? note.blocked : 
					modal(
						'creep-media-constraints',
						constraints.join('<br>'),
						hashMini(constraints)
					)
				}</div>
				<div>mimes (${count(mimeTypes)}): ${
					invalidMimeTypes ? note.blocked : 
					modal(
						'creep-media-mimeTypes',
						header+mimes.join('<br>'),
						hashMini(mimeTypes)
					)
				}</div>
			</div>
			`
		})()}
		</div>
		
		<div class="flex-grid">
		${!fp.clientRects ?
			`<div class="col-six">
				<strong>DOMRect</strong>
				<div>element: ${note.blocked}</div>
				<div>range: ${note.blocked}</div>
				<div>emojis v13.0: ${note.blocked}</div>
				<div>emoji system: ${note.blocked}</div>
				<div>emoji set:</div>
				div class="block-text">${note.blocked}</div>
			</div>` :
		(() => {
			const {
				clientRects: {
					$hash,
					elementClientRects,
					elementBoundingClientRect,
					rangeClientRects,
					rangeBoundingClientRect,
					emojiRects,
					emojiSet,
					emojiSystem,
					lied
				}
			} = fp
			const id = 'creep-client-rects'
			const getRectHash = rect => {
				const {emoji,...excludeEmoji} = rect
				return hashMini(excludeEmoji)
			}
			const icon = {
				blink: '<span class="icon blink"></span>',
				webkit: '<span class="icon webkit"></span>',
				tor: '<span class="icon tor"></span>',
				gecko: '<span class="icon firefox"></span>',
				cros: '<span class="icon cros"></span>',
				linux: '<span class="icon linux"></span>',
				apple: '<span class="icon apple"></span>',
				windows: '<span class="icon windows"></span>',
				android: '<span class="icon android"></span>'
			}
			const systemHash = {
				'1184f08f': `${icon.blink}${icon.android}Blink on Android`,
				'76104904': `${icon.blink}${icon.android}Blink on Android`, // Android 10
				'e7a730b1': `${icon.blink}${icon.cros}Blink on Chrome OS`,
				'f6864be8': `${icon.blink}${icon.cros}Blink on Chrome OS`, // CloudReady
				'c3e18b8c': `${icon.gecko}${icon.android}Gecko on Android`,
				'e7abe267': `${icon.gecko}${icon.android}Gecko on Android`, // Android 10
				'8ff13414': `${icon.blink}${icon.windows}Blink on Windows`,
				'ce1c9851': `${icon.gecko}${icon.windows}Gecko on Windows`,
				'502234c4': `${icon.tor}${icon.windows}Tor Browser on Windows`,
				'611b43d6': `${icon.tor}${icon.windows}Tor Browser on Windows`,
				'906ca515': `${icon.webkit}${icon.apple}WebKit on Mac`,
				'769cf0ec': `${icon.blink}${icon.apple}Blink on Mac`,
				'961d672e': `${icon.gecko}${icon.apple}Gecko on Mac`,
				'a03514e3': `${icon.tor}${icon.apple}Tor Browser on Mac`
			}

			return `
			<div class="col-six">
				<strong>DOMRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div>element:${
					[...new Set([
						hashMini(elementClientRects),
						hashMini(elementBoundingClientRect)
					])].map(hash => `<span class="sub-hash">${hash}</span>`).join('')
				}</div>
				<div>range:${
					[...new Set([
						hashMini(rangeClientRects),
						hashMini(rangeBoundingClientRect)
					])].map(hash => `<span class="sub-hash">${hash}</span>`).join('')
				}</div>
				<div>emojis v13.0: ${
					modal(
						`${id}-emojis`,
						`<div>${emojiRects.map(rect => `${rect.emoji}: ${getRectHash(rect)}`).join('<br>')}</div>`,
						hashMini(emojiRects)
					)
				}</div>
				<div>emoji system: ${systemHash[emojiSystem] || emojiSystem}</div>
				<div>emoji set:</div>
				<div class="block-text">${emojiSet.join('')}</div>
			</div>
			`
		})()}
		${!fp.fonts ?
			`<div class="col-six">
				<strong>SVG</strong>
				<div>bBox: ${note.blocked}</div>
				<div>subStringLength: ${note.blocked}</div>
				<div>extentOfChar: ${note.blocked}</div>
				<div>computedTextLength: ${note.blocked}</div>
				<div>totalLength: ${note.blocked}</div>
				<div>pointAtLength: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				svg: {
					$hash,
					bBox,
					subStringLength,
					extentOfChar,
					computedTextLength,
					totalLength,
					pointAtLength,
					lied
				}
			} = fp
			const getHashTemplate = x => {
				return x ? `<span class="sub-hash">${hashMini(x)}</span>` : ` ${note.blocked}`
			}
			return `
			<div class="col-six">
				<strong>SVG</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div>bBox:${getHashTemplate(bBox)}</div>
				<div>subStringLength:${getHashTemplate(subStringLength)}</div>
				<div>extentOfChar:${getHashTemplate(extentOfChar)}</div>
				<div>computedTextLength:${getHashTemplate(computedTextLength)}</div>
				<div>totalLength:${getHashTemplate(totalLength)}</div>
				<div>pointAtLength:${getHashTemplate(pointAtLength)}</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.screen ?
			`<div class="col-six">
				<strong>Screen</strong>
				<div>device: ${note.blocked}</div>
				<div>width: ${note.blocked}</div>
				<div>outerWidth: ${note.blocked}</div>
				<div>availWidth: ${note.blocked}</div>
				<div>height: ${note.blocked}</div>
				<div>outerHeight: ${note.blocked}</div>
				<div>availHeight: ${note.blocked}</div>
				<div>colorDepth: ${note.blocked}</div>
				<div>pixelDepth: ${note.blocked}</div>
			</div>
			<div class="col-six screen-container">
			</div>` :
		(() => {
			const {
				screen: data
			} = fp
			const {
				device,
				width,
				outerWidth,
				availWidth,
				height,
				outerHeight,
				availHeight,
				colorDepth,
				pixelDepth,
				$hash,
				lied
			} = data
			const getDeviceDimensions = (width, height, diameter = 180) => {
				const aspectRatio = width / height
				const isPortrait = height > width
				const deviceHeight = isPortrait ? diameter : diameter / aspectRatio
				const deviceWidth = isPortrait ? diameter * aspectRatio : diameter
				return { deviceHeight, deviceWidth }
			}
			const { deviceHeight, deviceWidth } = getDeviceDimensions(width, height)
			return `
			<div class="col-six">
				<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div>device: ${device ? device : note.unknown}</div>
				<div>width: ${width ? width : note.blocked}</div>
				<div>outerWidth: ${outerWidth ? outerWidth : note.blocked}</div>
				<div>availWidth: ${availWidth ? availWidth : note.blocked}</div>
				<div>height: ${height ? height : note.blocked}</div>
				<div>outerHeight: ${outerHeight ? outerHeight : note.blocked}</div>
				<div>availHeight: ${availHeight ? availHeight : note.blocked}</div>
				<div>colorDepth: ${colorDepth ? colorDepth : note.blocked}</div>
				<div>pixelDepth: ${pixelDepth ? pixelDepth : note.blocked}</div>
			</div>
			<div class="col-six screen-container">
				<style>.screen-frame { width:${deviceWidth}px;height:${deviceHeight}px; }</style>
				<div class="screen-frame">
					<div class="screen-glass"></div>
				</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.css ?
			`<div class="col-six">
				<strong>CSS Media Queries</strong><
				<div>@media: ${note.blocked}</div>
				<div>@import: ${note.blocked}</div>
				<div>matchMedia: ${note.blocked}</div>
				<div>screen query: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				cssMedia: data
			} = fp
			const {
				$hash,
				importCSS,
				mediaCSS,
				matchMediaCSS,
				screenQuery
			} = data

			return `
			<div class="col-six">
				<strong>CSS Media Queries</strong><span class="hash">${hashSlice($hash)}</span>
				<div>@media: ${
					!mediaCSS || !Object.keys(mediaCSS).filter(key => !!mediaCSS[key]).length ? 
					note.blocked :
					modal(
						'creep-css-media',
						`<strong>@media</strong><br><br>${Object.keys(mediaCSS).map(key => `${key}: ${mediaCSS[key] || note.unsupported}`).join('<br>')}`,
						hashMini(mediaCSS)
					)
				}</div>
				<div>@import: ${
					!importCSS || !Object.keys(importCSS).filter(key => !!importCSS[key]).length ? 
					note.unsupported :
					modal(
						'creep-css-import',
						`<strong>@import</strong><br><br>${Object.keys(importCSS).map(key => `${key}: ${importCSS[key] || note.unsupported}`).join('<br>')}`,
						hashMini(importCSS)
					)
				}</div>
				<div>matchMedia: ${
					!matchMediaCSS || !Object.keys(matchMediaCSS).filter(key => !!matchMediaCSS[key]).length ? 
					note.blocked : 
					modal(
						'creep-css-match-media',
						`<strong>matchMedia</strong><br><br>${Object.keys(matchMediaCSS).map(key => `${key}: ${matchMediaCSS[key] || note.unsupported}`).join('<br>')}`,
						hashMini(matchMediaCSS)
					)
				}</div>
				<div>screen query: ${!screenQuery ? note.blocked : `${screenQuery.width} x ${screenQuery.height}`}</div>
			</div>
			`
		})()}
		${!fp.css ?
			`<div class="col-six">
				<strong>Computed Style</strong>
				<div>keys (0): ${note.blocked}</div>
				<div>interface: ${note.blocked}</div>
				<div>system styles: ${note.blocked}</div>
				<div class="gradient"></div>
			</div>` :
		(() => {
			const {
				css: data
			} = fp
			const {
				$hash,
				computedStyle,
				system
			} = data
			const colorsLen = system.colors.length
			const gradientColors = system.colors.map((color, index) => {
				const name = Object.values(color)[0]
				return (
					index == 0 ? `${name}, ${name} ${((index+1)/colorsLen*100).toFixed(2)}%` : 
					index == colorsLen-1 ? `${name} ${((index-1)/colorsLen*100).toFixed(2)}%, ${name} 100%` : 
					`${name} ${(index/colorsLen*100).toFixed(2)}%, ${name} ${((index+1)/colorsLen*100).toFixed(2)}%`
				)
			})
			const id = 'creep-css-style-declaration-version'
			const { interfaceName } = computedStyle
			return `
			<div class="col-six">
				<strong>Computed Style</strong><span class="hash">${hashSlice($hash)}</span>
				<div>keys (${!computedStyle ? '0' : count(computedStyle.keys)}): ${
					!computedStyle ? note.blocked : 
					modal(
						'creep-computed-style',
						computedStyle.keys.join(', '),
						hashMini(computedStyle)
					)
				}</div>
				<div>interface: ${interfaceName}</div>
				<div>system styles: ${
					system && system.colors ? modal(
						`${id}-system-styles`,
						[
							...system.colors.map(color => {
								const key = Object.keys(color)[0]
								const val = color[key]
								return `
									<div><span style="display:inline-block;border:1px solid #eee;border-radius:3px;width:12px;height:12px;background:${val}"></span> ${key}: ${val}</div>
								`
							}),
							...system.fonts.map(font => {
								const key = Object.keys(font)[0]
								const val = font[key]
								return `
									<div>${key}: <span style="padding:0 5px;border-radius:3px;font:${val}">${val}</span></div>
								`
							}),
						].join(''),
						hashMini(system)
					) : note.blocked
				}</div>
				<style>.gradient { background: repeating-linear-gradient(to right, ${gradientColors.join(', ')}); }</style>
				<div class="gradient"></div>
			</div>
			`
		})()}
		</div>
		<div>
			<div class="flex-grid">
			${!fp.maths ?
				`<div class="col-six">
					<strong>Math</strong>
					<div>results: ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					maths: {
						data,
						$hash,
						lied
					}
				} = fp

				const header = `
				<style>
					.math-chromium,
					.math-firefox,
					.math-tor-browser,
					.math-safari,
					.math-blank-false {
						padding: 2px 8px;
					}
					.math-chromium {
						background: #657fca26;
					}
					.math-firefox {
						background: #657fca54;
					}
					.math-tor-browser {
						background: #ca65b424;
					}
					.math-safari {
						background: #ca65b459;
					}
				</style>
				<div>
				<br><span class="math-chromium">C - Chromium</span>
				<br><span class="math-firefox">F - Firefox</span>
				<br><span class="math-tor-browser">T - Tor Browser</span>
				<br><span class="math-safari">S - Safari</span>
				</div>`

				const results = Object.keys(data).map(key => {
					const value = data[key]
					const { result, chrome, firefox, torBrowser, safari } = value
					return `
					${chrome ? '<span class="math-chromium">C</span>' : '<span class="math-blank-false">-</span>'}${firefox ? '<span class="math-firefox">F</span>' : '<span class="math-blank-false">-</span>'}${torBrowser ? '<span class="math-tor-browser">T</span>' : '<span class="math-blank-false">-</span>'}${safari ? '<span class="math-safari">S</span>' : '<span class="math-blank-false">-</span>'} ${key}`
				})

				return `
				<div class="col-six">
					<strong>Math</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
					<div>results: ${
						!data ? note.blocked : 
						modal(
							'creep-maths',
							header+results.join('<br>')
						)
					}</div>
				</div>
				`
			})()}
			${!fp.consoleErrors ?
				`<div class="col-six">
					<strong>Error</strong>
					<div>results: ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					consoleErrors: {
						$hash,
						errors
					}
				} = fp
				const results = Object.keys(errors).map(key => {
					const value = errors[key]
					return `${+key+1}: ${value}`
				})
				return `
				<div class="col-six">
					<strong>Error</strong><span class="hash">${hashSlice($hash)}</span>
					<div>results: ${modal('creep-console-errors', results.join('<br>'))}</div>
				</div>
				`
			})()}
			</div>
			<div class="flex-grid">
			${!fp.windowFeatures?
				`<div class="col-six">
					<strong>Window</strong>
					<div>keys (0): ${note.blocked}</div>
					<div>moz: ${note.blocked}</div>
					<div>webkit: ${note.blocked}</div>
					<div>apple: ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					windowFeatures: {
						$hash,
						apple,
						keys,
						moz,
						webkit
					}
				} = fp
				return `
				<div class="col-six">
					<strong>Window</strong><span class="hash">${hashSlice($hash)}</span>
					<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-iframe-content-window-version', keys.join(', ')) : note.blocked}</div>
					<div>moz: ${''+moz}</div>
					<div>webkit: ${''+webkit}</div>
					<div>apple: ${''+apple}</div>
				</div>
				`
			})()}
			${!fp.htmlElementVersion ?
				`<div class="col-six">
					<strong>HTMLElement</strong>
					<div>keys (0): ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					htmlElementVersion: {
						$hash,
						keys
					}
				} = fp
				return `
				<div class="col-six">
					<strong>HTMLElement</strong><span class="hash">${hashSlice($hash)}</span>
					<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-html-element-version', keys.join(', ')) : note.blocked}</div>
				</div>
				`
			})()}
			</div>
		</div>
		<div class="flex-grid">
		${!fp.navigator ?
			`<div class="col-six">
				<strong>Navigator</strong>
				<div>deviceMemory: ${note.blocked}</div>
				<div>doNotTrack: ${note.blocked}</div>
				<div>globalPrivacyControl:${note.blocked}</div>
				<div>hardwareConcurrency: ${note.blocked}</div>
				<div>language: ${note.blocked}</div>
				<div>maxTouchPoints: ${note.blocked}</div>
				<div>vendor: ${note.blocked}</div>
				<div>plugins (0): ${note.blocked}</div>
				<div>mimeTypes (0): ${note.blocked}</div>
				<div>platform: ${note.blocked}</div>
				<div>system: ${note.blocked}</div>
				<div>ua architecture: ${note.blocked}</div>
				<div>ua model: ${note.blocked}</div>
				<div>ua platform: ${note.blocked}</div>
				<div>ua platformVersion: ${note.blocked}</div>
				<div>ua uaFullVersion: ${note.blocked}</div>
				<div>properties (0): ${note.blocked}</div>
			</div>
			<div class="col-six">
				<div>device:</div>
				<div class="block-text">${note.blocked}</div>
				<div>userAgent:</div>
				<div class="block-text">${note.blocked}</div>
				<div>appVersion:</div>
				<div class="block-text">${note.blocked}</div>
			</div>` :
		(() => {
			const {
				navigator: {
					$hash,
					appVersion,
					deviceMemory,
					doNotTrack,
					globalPrivacyControl,
					hardwareConcurrency,
					highEntropyValues,
					language,
					maxTouchPoints,
					mimeTypes,
					platform,
					plugins,
					properties,
					system,
					device,
					userAgent,
					vendor,
					keyboard,
					lied
				}
			} = fp
			const id = 'creep-navigator'
			const blocked = {
				[null]: !0,
				[undefined]: !0,
				['']: !0
			}
			return `
			<div class="col-six">
				<strong>Navigator</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div>deviceMemory: ${!blocked[deviceMemory] ? deviceMemory : note.blocked}</div>
				<div>doNotTrack: ${''+doNotTrack}</div>
				<div>globalPrivacyControl: ${
					''+globalPrivacyControl == 'undefined' ? note.unsupported : ''+globalPrivacyControl
				}</div>
				<div>hardwareConcurrency: ${!blocked[hardwareConcurrency] ? hardwareConcurrency : note.blocked}</div>
				<div>language: ${!blocked[language] ? language : note.blocked}</div>
				<div>maxTouchPoints: ${!blocked[maxTouchPoints] ? ''+maxTouchPoints : note.blocked}</div>
				<div>vendor: ${!blocked[vendor] ? vendor : note.blocked}</div>
				<div>plugins (${count(plugins)}): ${
					!blocked[''+plugins] ?
					modal(
						`${id}-plugins`,
						plugins.map(plugin => plugin.name).join('<br>'),
						hashMini(plugins)
					) :
					note.blocked
				}</div>
				<div>mimeTypes (${count(mimeTypes)}): ${
					!blocked[''+mimeTypes] ? 
					modal(
						`${id}-mimeTypes`,
						mimeTypes.join('<br>'),
						hashMini(mimeTypes)
					) :
					note.blocked
				}</div>
				<div>platform: ${!blocked[platform] ? platform : note.blocked}</div>
				<div>system: ${system}</div>
				${highEntropyValues ?  
					Object.keys(highEntropyValues).map(key => {
						const value = highEntropyValues[key]
						return `<div>ua ${key}: ${value ? value : note.unsupported}</div>`
					}).join('') :
					`<div>ua architecture: ${note.unsupported}</div>
					<div>ua model: ${note.unsupported}</div>
					<div>ua platform: ${note.unsupported}</div>
					<div>ua platformVersion: ${note.unsupported}</div>
					<div>ua uaFullVersion: ${note.unsupported} </div>`
				}
				<div>properties (${count(properties)}): ${
					modal(
						`${id}-properties`,
						properties.join(', '),
						hashMini(properties)
					)
				}</div>
				<div>keyboard: ${
					!keyboard ? note.unsupported :
					modal(
						`${id}-keyboard`,
						Object.keys(keyboard).map(key => `${key}: ${keyboard[key]}`).join('<br>'),
						hashMini(keyboard)
					)
				}</div>
			</div>
			<div class="col-six">
				<div>device:</div>
				<div class="block-text">
					<div>${!blocked[device] ? device : note.blocked}</div>
				</div>
				<div>userAgent:</div>
				<div class="block-text">
					<div>${!blocked[userAgent] ? userAgent : note.blocked}</div>
				</div>
				<div>appVersion:</div>
				<div class="block-text">
					<div>${!blocked[appVersion] ? appVersion : note.blocked}</div>
				</div>
			</div>
			`
		})()}
		</div>
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

			const template = `
				<div class="visitor-info">
					<div class="ellipsis"><span class="aside-note">script modified 2021-5-2</span></div>
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
				css
			} = fp || {}
			const {
				computedStyle,
				system
			} = css || {}

			const [
				styleHash,
				systemHash
			] = await Promise.all([
				hashify(computedStyle),
				hashify(system)
			])
			const el = document.getElementById('browser-detection')

			const reportedUserAgent = caniuse(() => navigator.userAgent)
			const reportedSystem = getOS(reportedUserAgent)
			const report = decryptUserAgent({
				ua: reportedUserAgent,
				os: reportedSystem,
				isBrave
			})

			if (!fp.workerScope || !fp.workerScope.userAgent || fp.workerScope.type == 'dedicated') {
				return patch(el, html`
					<div class="flex-grid">
						<div class="col-eight">
							<strong>Version</strong>
							<div>client user agent:<span> ${report}</span></div>
							<div>window object:<span class="sub-hash">${hashSlice(windowFeatures.$hash)}</span></div>
							<div>system styles:<span class="sub-hash">${hashSlice(systemHash)}</span></div>
							<div>computed styles:<span class="sub-hash">${hashSlice(styleHash)}</span></div>
							<div>html element:<span class="sub-hash">${hashSlice(htmlElementVersion.$hash)}</span></div>
							<div>js runtime (math):<span class="sub-hash">${hashSlice(consoleErrors.$hash)}</span></div>
							<div>js engine (error):<span class="sub-hash">${hashSlice(maths.$hash)}</span></div>
						</div>
						<div class="col-four icon-container">
							<span class="block-text">${
								hashMini({
									windowFeatures: windowFeatures.$hash,
									htmlElementVersion: htmlElementVersion.$hash,
									consoleErrors: consoleErrors.$hash,
									maths: maths.$hash,
									systemHash,
									styleHash
								})
							}</span>
						</div>
					</div>
				`)
			}

			const decryptRequest = `https://creepjs-6bd8e.web.app/decrypt?${[
				`isBrave=${isBrave}`,
				`mathId=${maths.$hash}`,
				`errorId=${consoleErrors.$hash}`,
				`htmlId=${htmlElementVersion.$hash}`,
				`winId=${windowFeatures.$hash}`,
				`styleId=${styleHash}`,
				`styleSystemId=${systemHash}`,
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
				} = data
				
				const iconSet = new Set()
				const htmlIcon = cssClass => `<span class="icon ${cssClass}"></span>`
				const getTemplate = agent => {
					const { decrypted, system } = agent
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
				<div class="flex-grid">
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
					</div>
					<div class="col-four icon-container">
						${[...iconSet].map(icon => {
							return `<div class="icon-item ${icon}"></div>`
						}).join('')}
					</div>
				</div>
				`)
				return console.log(`user agents pending review: ${data.pendingReview}`)
			})
			.catch(error => {
				return console.error('Error!', error.message)
			})
		})
		.catch(error => {
			fetchVisitorDataTimer('Error fetching version data')
			patch(document.getElementById('loader'), html`<strong style="color:crimson">${error}</strong>`)
			return console.error('Error!', error.message)
		})
	})
})(imports)