import { isChrome, isBrave, isFirefox, getOS, decryptUserAgent, getUserAgentPlatform, logTestResult, getPromiseRaceFulfilled } from './modules/helpers.js'
import { patch, html, note, count, modal } from './modules/html.js'
import { hashMini, instanceId, hashify } from './modules/crypto.js'

import { captureError, attempt, caniuse, timer, errorsCaptured, getCapturedErrors } from './modules/captureErrors.js'
import { sendToTrash, proxyBehavior, gibberish, trustInteger, trashBin, getTrash } from './modules/trash.js'
import { documentLie, phantomDarkness, parentPhantom, lieProps, lieRecords, getLies, dragonFire, parentDragon, dragonOfDeath, getPluginLies } from './modules/lies.js'

import { getOfflineAudioContext } from './modules/audio.js'
import { getCanvas2d } from './modules/canvas2d.js'
import { getCanvasWebgl } from './modules/canvasWebgl.js'
import { getCSS } from './modules/computedStyle.js'
import { getCSSMedia } from './modules/css.js'
import { getConsoleErrors } from './modules/consoleErrors.js'
import { getWindowFeatures } from './modules/contentWindowVersion.js'
import { getFonts, fontList } from './modules/fonts.js'
import { getHTMLElementVersion } from './modules/htmlElementVersion.js'
import { getMaths } from './modules/maths.js'
import { getMedia } from './modules/media.js'
import { getNavigator } from './modules/navigator.js'
import { getClientRects } from './modules/rects.js'
import { getScreen } from './modules/screen.js'
import { getTimezone } from './modules/timezone.js'
import { getVoices } from './modules/voices.js'
import { getWebRTCData } from './modules/webrtc.js'
import { getBestWorkerScope } from './modules/worker.js'

const imports = {
	require: {
		// helpers
		isChrome,
		isBrave,
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
		
		/*
		const windowFeaturesComputed = await getWindowFeatures(imports)
		const htmlElementVersionComputed = await getHTMLElementVersion(imports)
		const cssComputed = await getCSS(imports)
		const screenComputed = await getScreen(imports)
		const voicesComputed = await getVoices(imports)
		const canvas2dComputed = await getCanvas2d(imports)
		const canvasWebglComputed = await getCanvasWebgl(imports)
		const mathsComputed = await getMaths(imports)
		const consoleErrorsComputed = await getConsoleErrors(imports)
		const timezoneComputed = await getTimezone(imports)
		const clientRectsComputed = await getClientRects(imports)
		const offlineAudioContextComputed = await getOfflineAudioContext(imports)
		const fontsComputed = await getFonts(imports, [...fontList])
			.catch(error => { console.error(error.message)})
		const workerScopeComputed = await getBestWorkerScope(imports)
		const mediaComputed = await getMedia(imports)
		const webRTCDataComputed = await getWebRTCData(imports)
		const navigatorComputed = await getNavigator(imports, workerScopeComputed)
			.catch(error => console.error(error.message))
		*/
		
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
			webRTCDataComputed
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
			getWebRTCData(imports)
		]).catch(error => console.error(error.message))

		const navigatorComputed = await getNavigator(imports, workerScopeComputed)
			.catch(error => console.error(error.message))
		
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
			htmlHash,
			cssMediaHash,
			cssHash,
			screenHash,
			voicesHash,
			canvas2dHash,
			canvasWebglHash,
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
			errorsHash
		] = await Promise.all([
			hashify(windowFeaturesComputed),
			hashify(htmlElementVersionComputed.keys),
			hashify(cssMediaComputed),
			hashify(cssComputed),
			hashify(screenComputed),
			hashify(voicesComputed),
			hashify(canvas2dComputed),
			hashify(canvasWebglComputed),
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
			hashify(capturedErrorsComputed)
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
			htmlElementVersion: !htmlElementVersionComputed ? undefined : {...htmlElementVersionComputed, $hash: htmlHash },
			cssMedia: !cssMediaComputed ? undefined : {...cssMediaComputed, $hash: cssMediaHash },
			css: !cssComputed ? undefined : {...cssComputed, $hash: cssHash },
			screen: !screenComputed ? undefined : {...screenComputed, $hash: screenHash },
			voices: !voicesComputed ? undefined : {...voicesComputed, $hash: voicesHash },
			media: !mediaComputed ? undefined : {...mediaComputed, $hash: mediaHash },
			canvas2d: !canvas2dComputed ? undefined : {...canvas2dComputed, $hash: canvas2dHash },
			canvasWebgl: !canvasWebglComputed ? undefined : {...canvasWebglComputed, $hash: canvasWebglHash },
			maths: !mathsComputed ? undefined : {...mathsComputed, $hash: mathsHash },
			consoleErrors: !consoleErrorsComputed ? undefined : {...consoleErrorsComputed, $hash: consoleErrorsHash },
			timezone: !timezoneComputed ? undefined : {...timezoneComputed, $hash: timezoneHash },
			clientRects: !clientRectsComputed ? undefined : {...clientRectsComputed, $hash: rectsHash },
			offlineAudioContext: !offlineAudioContextComputed ? undefined : {...offlineAudioContextComputed, $hash: audioHash },
			fonts: !fontsComputed ? undefined : {...fontsComputed, $hash: fontsHash },
			lies: !liesComputed ? undefined : {...liesComputed, $hash: liesHash },
			trash: !trashComputed ? undefined : {...trashComputed, $hash: trashHash },
			capturedErrors: !capturedErrorsComputed ? undefined : {...capturedErrorsComputed, $hash: errorsHash },
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
	const distrust = { distrust: { brave: isBrave, firefox: isFirefox } }
	const trashLen = fp.trash.trashBin.length
	const liesLen = !('data' in fp.lies) ? 0 : fp.lies.data.length
	const errorsLen = fp.capturedErrors.data.length
	const creep = {
		navigator: ( 
			!fp.navigator || fp.navigator.lied ? undefined : {
				device: fp.navigator.device,
				deviceMemory: isBrave ? distrust : fp.navigator.deviceMemory,
				doNotTrack: fp.navigator.doNotTrack,
				hardwareConcurrency: isBrave ? distrust : fp.navigator.hardwareConcurrency,
				maxTouchPoints: fp.navigator.maxTouchPoints,
				mimeTypes: fp.navigator.mimeTypes,
				plugins: isBrave ? distrust : fp.navigator.plugins,
				platform: fp.navigator.platform,
				system: fp.navigator.system,
				vendor: fp.navigator.vendor
			}
		),
		screen: ( 
			!fp.screen || fp.screen.lied || (!!liesLen && isFirefox) ? undefined : {
				height: fp.screen.height,
				width: fp.screen.width,
				pixelDepth: fp.screen.pixelDepth,
				colorDepth: fp.screen.colorDepth
			}
		),
		workerScope: fp.workerScope ? {
			canvas2d: (
				(fp.canvas2d && fp.canvas2d.lied) ? undefined : // distrust ungoogled-chromium, brave, firefox, tor browser 
				fp.workerScope.canvas2d
			),
			deviceMemory: (
				!!liesLen && isBrave ? distrust : 
				fp.workerScope.deviceMemory
			),
			hardwareConcurrency: (
				!!liesLen && isBrave ? distrust : 
				fp.workerScope.hardwareConcurrency
			),
			language: fp.workerScope.language,
			platform: fp.workerScope.platform,
			system: fp.workerScope.system,
			device: fp.workerScope.device,
			timezoneLocation: fp.workerScope.timezoneLocation,
			['webgl renderer']: (
				!!liesLen && isBrave ? distrust : 
				fp.workerScope.webglRenderer
			),
			['webgl vendor']: (
				!!liesLen && isBrave ? distrust : 
				fp.workerScope.webglVendor
			)
		} : undefined,
		media: fp.media,
		canvas2d: ( 
			!fp.canvas2d || fp.canvas2d.lied ? undefined : 
			fp.canvas2d
		),
		canvasWebgl: ( 
			!fp.canvasWebgl || fp.canvasWebgl.lied ? undefined : 
			fp.canvasWebgl
		),
		cssMedia: !fp.cssMedia ? undefined : {
			reducedMotion: caniuse(() => fp.cssMedia.mediaCSS.reducedMotion),
			colorScheme: caniuse(() => fp.cssMedia.mediaCSS.colorScheme),
			monochrome: caniuse(() => fp.cssMedia.mediaCSS.monochrome),
			invertedColors: caniuse(() => fp.cssMedia.mediaCSS.invertedColors),
			forcedColors: caniuse(() => fp.cssMedia.mediaCSS.forcedColors),
			anyHover: caniuse(() => fp.cssMedia.mediaCSS.anyHover),
			hover: caniuse(() => fp.cssMedia.mediaCSS.hover),
			anyPointer: caniuse(() => fp.cssMedia.mediaCSS.anyPointer),
			pointer: caniuse(() => fp.cssMedia.mediaCSS.pointer),
			colorGamut: caniuse(() => fp.cssMedia.mediaCSS.colorGamut),
			screenQuery: caniuse(() => fp.cssMedia.screenQuery),
		},
		css: !fp.css ? undefined : {
			prototype: caniuse(() => fp.css.getComputedStyle.prototypeName),
			system: caniuse(() => fp.css.system)
		},
		maths: !fp.maths || fp.maths.lied ? undefined : fp.maths,
		consoleErrors: fp.consoleErrors,
		timezone: !fp.timezone || fp.timezone.lied ? undefined : {
			locationMeasured: fp.timezone.locationMeasured
		},
		clientRects: !fp.clientRects || fp.clientRects.lied ? undefined : fp.clientRects,
		offlineAudioContext: (
			!!liesLen && isBrave && !!fp.offlineAudioContext ? fp.offlineAudioContext.values :
			!fp.offlineAudioContext || fp.offlineAudioContext.lied ? undefined :
			fp.offlineAudioContext
		),
		fonts: !fp.fonts || fp.fonts.lied ? undefined : fp.fonts,
		// skip trash since it is random
		lies: !('data' in fp.lies) ? false : !!liesLen,
		capturedErrors: !!errorsLen,
		voices: fp.voices,
		webRTC: !fp.webRTC ? undefined : {
			sdpcapabilities: fp.webRTC.sdpcapabilities,
			capabilities: fp.webRTC.capabilities,
			foundation: fp.webRTC.foundation,
			protocol: fp.webRTC.protocol,
			type: fp.webRTC.type,
		}
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
	
	const hasTrash = !!trashLen
	const { lies: hasLied, capturedErrors: hasErrors } = creep

	// patch dom	
	const el = document.getElementById('fingerprint-data')
	patch(el, html`
	<div id="fingerprint-data">
		<div class="fingerprint-header-container">
			<div class="fingerprint-header">
				<strong>Your ID:</strong><span class="trusted-fingerprint ellipsis main-hash">${hashMini(creepHash)}</span>
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
		</div>
		<div class="flex-grid">
			${(() => {
				const { trash: { trashBin, $hash  } } = fp
				const trashLen = trashBin.length
				return `
				<div class="col-four${trashLen ? ' trash': ''}">
					<strong>Trash</strong>${
						trashLen ? `<span class="hash">${hashMini($hash)}</span>` : ''
					}
					<div>gathered (${!trashLen ? '0' : ''+trashLen }): ${
						trashLen ? modal(
							'creep-trash',
							trashBin.map((trash,i) => `${i+1}: ${trash.name}: ${trash.value}`).join('<br>')
						) : ''
					}</div>
				</div>`
			})()}
			${(() => {
				const { lies: { data, totalLies, $hash } } = fp 
				const toJSONFormat = obj => JSON.stringify(obj, null, '\t')
				const sanitize = str => str.replace(/\</g, '&lt;')
				return `
				<div class="col-four${totalLies ? ' lies': ''}">
					<strong>Lies</strong>${totalLies ? `<span class="hash">${hashMini($hash)}</span>` : ''}
					<div>unmasked (${!totalLies ? '0' : ''+totalLies }): ${
						totalLies ? modal('creep-lies', Object.keys(data).map(key => {
							const { name, lieTypes: { lies, fingerprint } } = data[key]
							const lieFingerprint = !!fingerprint ? { hash: hashMini(fingerprint), json: sanitize(toJSONFormat(fingerprint)) } : undefined
							return `
							<div style="padding:5px">
								<strong>${name}</strong>:
								${lies.length ? lies.map(lie => `<br>${Object.keys(lie)[0]}`).join(''): ''}
								${
									lieFingerprint ? `
										<br>Tampering code leaked a fingerprint: ${lieFingerprint.hash}
										<br>Unexpected code: ${lieFingerprint.json}`: 
									''
								}
							</div>
							`
						}).join('')) : ''
					}</div>
				</div>`
			})()}
			${(() => {
				const { capturedErrors: { data, $hash  } } = fp
				const len = data.length
				return `
				<div class="col-four${len ? ' errors': ''}">
					<strong>Errors</strong>${len ? `<span class="hash">${hashMini($hash)}</span>` : ''}
					<div>captured (${!len ? '0' : ''+len}): ${
						len ? modal('creep-captured-errors', Object.keys(data).map((key, i) => `${i+1}: ${data[key].trustedName} - ${data[key].trustedMessage} `).join('<br>')) : ''
					}</div>
				</div>
				`
			})()}
		</div>
		<div class="flex-grid">
			${!fp.webRTC ?
				`<div class="col-six">
					<strong>WebRTC</strong>
					<div>ip address: ${note.blocked}</div>
					<div>ip candidate: ${note.blocked}</div>
					<div>ip connection: ${note.blocked}</div>
					<div>type: ${note.blocked}</div>
					<div>foundation: ${note.blocked}</div>
					<div>protocol: ${note.blocked}</div>
					<div>sdp capabilities: ${note.blocked}</div>
					<div>get capabilities: ${note.blocked}</div>
				</div>` :
			(() => {
				const { webRTC } = fp
				const {
					ipaddress,
					candidate,
					connection,
					type,
					foundation,
					protocol,
					capabilities,
					sdpcapabilities,
					$hash
				} = webRTC
				const id = 'creep-webrtc'
				return `
				<div class="col-six">
					<strong>WebRTC</strong><span class="hash">${hashMini($hash)}</span>
					<div>ip address: ${ipaddress ? ipaddress : note.unsupported}</div>
					<div>ip candidate: ${candidate ? candidate : note.unsupported}</div>
					<div>ip connection: ${connection ? connection : note.unsupported}</div>
					<div>type: ${type ? type : note.unsupported}</div>
					<div>foundation: ${foundation ? foundation : note.unsupported}</div>
					<div>protocol: ${protocol ? protocol : note.unsupported}</div>
					<div>sdp capabilities: ${
						!sdpcapabilities ? note.unsupported :
						modal(
							`${id}-sdpcapabilities`,
							sdpcapabilities.join('<br>'),
							hashMini(sdpcapabilities)
						)
					}</div>
					<div>get capabilities: ${
						!capabilities.receiver && !capabilities.sender ? note.unsupported :
						modal(
							`${id}-capabilities`,
							Object.keys(capabilities).map(modeKey => {
								const mode = capabilities[modeKey]
								if (!mode) {
									return ''
								}
								return `
									<br><div>mimeType [channels] (clockRate) * sdpFmtpLine</div>
									${
										Object.keys(mode).map(media => Object.keys(mode[media])
											.map(key => {
												return `<br><div><strong>${modeKey} ${media} ${key}</strong>:</div>${
													mode[media][key].map(obj => {
														const {
															channels,
															clockRate,
															mimeType,
															sdpFmtpLine,
															uri
														} = obj
														return `
															<div>
															${mimeType||''}
															${channels ? `[${channels}]`: ''}
															${clockRate ? `(${clockRate})`: ''}
															${sdpFmtpLine ? `<br>* ${sdpFmtpLine}` : ''}
															${uri||''}
															</div>
														`
													}).join('')
												}`
											}).join('')
										).join('')
									}
								`
							}).join(''),
							hashMini(capabilities)
						)
					}</div>
				</div>
				`
			})()}
			${!fp.timezone ?
				`<div class="col-six">
					<strong>Timezone</strong>
					<div>zone: ${note.blocked}</div>
					<div>offset: ${note.blocked}</div>
					<div>offset computed: ${note.blocked}</div>
					<div>location: ${note.blocked}</div>
					<div>measured: ${note.blocked}</div>
					<div>epoch: ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					timezone: {
						$hash,
						zone,
						location,
						locationMeasured,
						locationEpoch,
						offset,
						offsetComputed,
						lied
					}
				} = fp
				return `
				<div class="col-six">
					<strong>Timezone</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
					<div>zone: ${zone}</div>
					<div>offset: ${''+offset}</div>
					<div>offset computed: ${''+offsetComputed}</div>
					<div>location: ${location}</div>
					<div>measured: ${locationMeasured}</div>
					<div>epoch: ${locationEpoch}</div>
				</div>
				`
			})()}			
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
				<strong>Worker</strong><span class="hash">${hashMini(data.$hash)}</span>
				<div>timezone offset: ${data.timezoneOffset != undefined ? ''+data.timezoneOffset : note.unsupported}</div>
				<div>location: ${data.timezoneLocation}</div>
				<div>language: ${data.language || note.unsupported}</div>
				<div>deviceMemory: ${data.deviceMemory || note.unsupported}</div>
				<div>hardwareConcurrency: ${data.hardwareConcurrency || note.unsupported}</div>
				<div>platform: ${data.platform || note.unsupported}</div>
				<div>system: ${data.system || note.unsupported}${
					/android/i.test(data.system) && !/arm/i.test(data.platform) && /linux/i.test(data.platform) ?
					' [emulator]' : ''
				}</div>
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
				<div>webgl renderer:</div>
				<div class="block-text">
					<div>${data.webglRenderer || note.unsupported}</div>
				</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.canvasWebgl ?
			`<div class="col-six">
				<strong>Canvas webgl</strong>
				<div>matching renderer/vendor: ${note.blocked}</div>
				<div>matching data URI: ${note.blocked}</div>
				<div>webgl: ${note.blocked}</div>
				<div>parameters (0): ${note.blocked}</div>
				<div>extensions (0): ${note.blocked}</div>
				<div>vendor: ${note.blocked}</div>
				<div>renderer: ${note.blocked}</div>
				<div class="block-text">${note.blocked}</div>
			</div>
			<div class="col-six">
				<div>webgl2: ${note.blocked}</div>
				<div>parameters (0): ${note.blocked}</div>
				<div>extensions (0): ${note.blocked}</div>
				<div>vendor: ${note.blocked}</div>
				<div>renderer: ${note.blocked}</div>
				<div class="block-text">${note.blocked}</div>
			</div>` :
		(() => {
			const { canvasWebgl: data } = fp
			const id = 'creep-canvas-webgl'
			const {
				$hash,
				dataURI,
				dataURI2,
				lied,
				matchingDataURI,
				matchingUnmasked,
				specs: { webglSpecs, webgl2Specs },
				supported,
				supported2,
				unmasked,
				unmasked2
			} = data
			const webglSpecsKeys = webglSpecs ? Object.keys(webglSpecs) : []
			const webgl2SpecsKeys = webgl2Specs ? Object.keys(webgl2Specs) : []
			return `
			<div class="col-six">
				<strong>Canvas webgl</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>matching renderer/vendor: ${''+matchingUnmasked}</div>
				<div>matching data URI: ${''+matchingDataURI}</div>
				<div>webgl:<span class="sub-hash">${hashMini(dataURI)}</span></div>
				<div>parameters (${count(webglSpecsKeys)}): ${
					!webglSpecsKeys.length ? note.unsupported :
					modal(
						`${id}-p-v1`,
						webglSpecsKeys.map(key => `${key}: ${webglSpecs[key]}`).join('<br>'),
						hashMini(webglSpecs)
					)
				}</div>
				<div>extensions (${count(supported.extensions)}): ${
					!caniuse(() => supported, ['extensions', 'length']) ? note.unsupported : 
					modal(
						`${id}-e-v1`,
						supported.extensions.join('<br>'),
						hashMini(supported.extensions)
					)
				}</div>
				<div>vendor: ${!unmasked.vendor ? note.unsupported : unmasked.vendor}</div>
				<div>renderer:</div>
				<div class="block-text">
					<div>${!unmasked.renderer ? note.unsupported : unmasked.renderer}</div>	
				</div>
			</div>
			<div class="col-six">
				<div>webgl2:<span class="sub-hash">${hashMini(dataURI2)}</span></div>
				<div>parameters (${count(webgl2SpecsKeys)}): ${
					!webgl2SpecsKeys.length ? note.unsupported :
					modal(
						`${id}-p-v2`,
						webgl2SpecsKeys.map(key => `${key}: ${webgl2Specs[key]}`).join('<br>'),
						hashMini(webgl2Specs)
					)
				}</div>
				<div>extensions (${count(supported2.extensions)}): ${
					!caniuse(() => supported2, ['extensions', 'length']) ? note.unsupported : 
					modal(
						`${id}-e-v2`,
						supported2.extensions.join('<br>'),
						hashMini(supported2.extensions)
					)
				}</div>
				<div>vendor: ${!unmasked2.vendor ? note.unsupported : unmasked2.vendor }</div>
				<div>renderer:</div>
				<div class="block-text">
					<div>${!unmasked2.renderer ? note.unsupported : unmasked2.renderer}</div>	
				</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.canvas2d ?
			`<div class="col-six">
				<strong>Canvas 2d</strong> <span>${note.blocked}</span>
			</div>` :
		(() => {
			const { canvas2d: { lied, $hash } } = fp
			return `
			<div class="col-six">
				<strong>Canvas 2d</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
			</div>
			`
		})()}
			<div class="col-six">
			</div>
		</div>
		<div class="flex-grid">
		${!fp.offlineAudioContext ?
			`<div class="col-four">
				<strong>Audio</strong>
				<div>sample: ${note.blocked}</div>
				<div>copy: ${note.blocked}</div>
				<div>matching: ${note.blocked}</div>
				<div>values: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				offlineAudioContext: {
					$hash,
					binsSample,
					copySample,
					lied,
					matching,
					values
				}
			} = fp
			return `
			<div class="col-four">
				<strong>Audio</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>sample:${''+binsSample[0] == 'undefined' ? ` ${note.unsupported}` : `<span class="sub-hash">${hashMini(binsSample[0])}</span>`}</div>
				<div>copy:${''+copySample[0] == 'undefined' ? ` ${note.unsupported}`  : `<span class="sub-hash">${hashMini(copySample[0])}</span>`}</div>
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
				<div>microsoft: ${note.blocked}</div>
				<div>google: ${note.blocked}</div>
				<div>chrome OS: ${note.blocked}</div>
				<div>android: ${note.blocked}</div>
				<div>voices (0): ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				voices: {
					$hash,
					android,
					chromeOS,
					google,
					microsoft,
					voices
				}
			} = fp
			const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`)
			return `
			<div class="col-four">
				<strong>Speech</strong><span class="hash">${hashMini($hash)}</span>
				<div>microsoft: ${''+microsoft}</div>
				<div>google: ${''+google}</div>
				<div>chrome OS: ${''+chromeOS}</div>
				<div>android: ${''+android}</div>
				<div>voices (${count(voices)}): ${voiceList && voiceList.length ? modal('creep-voices', voiceList.join('<br>')) : note.unsupported}</div>
			</div>
			`
		})()}
		${!fp.media ?
			`<div class="col-four">
				<strong>Media</strong>
				<div>devices (0): ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				media: {
					mediaDevices,
					$hash
				}
			} = fp

			return `
			<div class="col-four">
				<strong>Media</strong><span class="hash">${hashMini($hash)}</span>
				<div>devices (${count(mediaDevices)}):${mediaDevices && mediaDevices.length ? modal('creep-media-devices', mediaDevices.map(device => device.kind).join('<br>')) : note.blocked}</div>
			</div>
			`
		})()}
		</div>
		
		<div class="flex-grid">
		${!fp.clientRects ?
			`<div class="col-six">
				<strong>DOMRect</strong>
				<div>elements: ${note.blocked}</div>
				<div>emojis v13.0: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				clientRects: {
					$hash,
					clientRects,
					emojiRects,
					lied
				}
			} = fp
			const id = 'creep-client-rects'
			const getRectHash = rect => {
				const {emoji,...excludeEmoji} = rect
				return hashMini(excludeEmoji)
			}
			return `
			<div class="col-six">
				<strong>DOMRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>elements: ${
					modal(
						`${id}-elements`,
						clientRects.map(domRect => Object.keys(domRect).map(key => `<div>${key}: ${domRect[key]}</div>`).join('')).join('<br>'),
						hashMini(clientRects)
					)
				}</div>
				<div>emojis v13.0: ${
					modal(
						`${id}-emojis`,
						`<div>${emojiRects.map(rect => `${rect.emoji}: ${getRectHash(rect)}`).join('<br>')}</div>`,
						hashMini(emojiRects)
					)
				}</div>
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
				<strong>Fonts</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>results (${fonts ? count(fonts) : '0'}): ${fonts.length ? modal('creep-fonts', fonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>')) : note.blocked}</div>
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
				<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>device: ${device ? device : note.blocked}</div>
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
				<div class="screen-frame" style="width:${deviceWidth}px;height:${deviceHeight}px;">
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
				<strong>CSS Media Queries</strong><span class="hash">${hashMini($hash)}</span>
				<div>@media: ${
					!mediaCSS ? note.blocked :
					modal(
						'creep-css-media',
						Object.keys(mediaCSS).map(key => `${key}: ${mediaCSS[key] || note.unsupported}`).join('<br>'),
						hashMini(mediaCSS)
					)
				}</div>
				<div>@import: ${
					!importCSS ? note.blocked : 
					modal(
						'creep-css-import',
						Object.keys(importCSS).map(key => `${key}: ${importCSS[key] || note.unsupported}`).join('<br>'),
						hashMini(importCSS)
					)
				}</div>
				<div>matchMedia: ${
					!matchMediaCSS ? note.blocked : 
					modal(
						'creep-css-match-media',
						Object.keys(matchMediaCSS).map(key => `${key}: ${matchMediaCSS[key] || note.unsupported}`).join('<br>'),
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
				<div>prototype: ${note.blocked}</div>
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
			const { prototypeName } = computedStyle
			return `
			<div class="col-six">
				<strong>Computed Style</strong><span class="hash">${hashMini($hash)}</span>
				<div>keys (${!computedStyle ? '0' : count(computedStyle.keys)}): ${
					!computedStyle ? note.blocked : 
					modal(
						'creep-computed-style',
						computedStyle.keys.join(', '),
						hashMini(computedStyle)
					)
				}</div>
				<div>prototype: ${prototypeName}</div>
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
				const id = 'creep-maths'
				const header = `<div>Match to Win10 64bit Chromium > Firefox > Tor Browser > Mac10 Safari<br>[CR][FF][TB][SF]</div>`
				const results = Object.keys(data).map(key => {
					const value = data[key]
					const { result, chrome, firefox, torBrowser, safari } = value
					return `${chrome ? '[CR]' : '[--]'}${firefox ? '[FF]' : '[--]'}${torBrowser ? '[TB]' : '[--]'}${safari ? '[SF]' : '[--]'} ${key} => ${result}`
				})
				return `
				<div class="col-six">
					<strong>Math</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
					<div>results: ${modal(id, header+results.join('<br>'))}</div>
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
					<strong>Error</strong><span class="hash">${hashMini($hash)}</span>
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
					<strong>Window</strong><span class="hash">${hashMini($hash)}</span>
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
					<strong>HTMLElement</strong><span class="hash">${hashMini($hash)}</span>
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
				<strong>Navigator</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
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
				<div>system: ${system}${
					/android/i.test(system) && !/arm/i.test(platform) && /linux/i.test(platform) ?
					' [emulator]' : ''
				}</div>
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
				<br><a class="tests" href="./tests/extensions.html">Extensions</a>
				<br><a class="tests" href="./tests/prototype.html">Prototype</a>
				<br><a class="tests" href="./tests/domrect.html">DOMRect</a>
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

			// trust score
			const score = (100-(
				(switchCount < 1 ? 0 : switchCount < 11 ? switchCount * 0.1 : switchCount * 0.2 ) +
				(errorsLen * 5.2) +
				(trashLen * 15.5) +
				(liesLen * 31)
			)).toFixed(0)
			const template = `
				<div class="visitor-info">
					<div class="ellipsis"><span class="aside-note">script modified 2021-1-3</span></div>
					<div class="flex-grid">
						<div class="col-six">
							<strong>Browser</strong>
							<div>trust score: <span class="unblurred">${
								score > 95 ? `${score}% <span class="grade-A">A+</span>` :
								score == 95 ? `${score}% <span class="grade-A">A</span>` :
								score >= 90 ? `${score}% <span class="grade-A">A-</span>` :
								score > 85 ? `${score}% <span class="grade-B">B+</span>` :
								score == 85 ? `${score}% <span class="grade-B">B</span>` :
								score >= 80 ? `${score}% <span class="grade-B">B-</span>` :
								score > 75 ? `${score}% <span class="grade-C">C+</span>` :
								score == 75 ? `${score}% <span class="grade-C">C</span>` :
								score >= 70 ? `${score}% <span class="grade-C">C-</span>` :
								score > 65 ? `${score}% <span class="grade-D">D+</span>` :
								score == 65 ? `${score}% <span class="grade-D">D</span>` :
								score >= 60 ? `${score}% <span class="grade-D">D-</span>` :
								score > 55 ? `${score}% <span class="grade-F">F+</span>` :
								score == 55 ? `${score}% <span class="grade-F">F</span>` :
								`${score < 0 ? 0 : score}% <span class="grade-F">F-</span>`
							}</span></div>
							<div>visits: <span class="unblurred">${visits}</span></div>
							<div class="ellipsis">first: <span class="unblurred">${toLocaleStr(firstVisit)}</span></div>
							<div class="ellipsis">last: <span class="unblurred">${toLocaleStr(latestVisit)}</span></div>
							<div>persistence: <span class="unblurred">${hours} hours</span></div>
						</div>
						<div class="col-six">
							<div>has trash: <span class="unblurred">${
								(''+hasTrash) == 'true' ?
								`true (${hashMini(fp.trash.$hash)})` : 
								'false'
							}</span></div>
							<div>has lied: <span class="unblurred">${
								(''+hasLied) == 'true' ? 
								`true (${hashMini(fp.lies.$hash)})` : 
								'false'
							}</span></div>
							<div>has errors: <span class="unblurred">${
								(''+hasErrors) == 'true' ? 
								`true (${hashMini(fp.capturedErrors.$hash)})` : 
								'false'
							}</span></div>
							<div class="ellipsis">loose fingerprint: <span class="unblurred">${hashMini(fpHash)}</span></div>
							<div class="ellipsis">loose switched: <span class="unblurred">${switchCount}x</span></div>
							<div class="ellipsis">bot: <span class="unblurred">${switchCount > 9 && hours < 48 ? 'true (10 loose in 48 hours)' : 'false'}</span></div>
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
				getComputedStyle,
				system
			} = css || {}

			const [
				styleHash,
				systemHash
			] = await Promise.all([
				hashify(getComputedStyle),
				hashify(system)
			])
				
			const decryptRequest = `https://creepjs-6bd8e.web.app/decrypt?${[
				`isBrave=${isBrave}`,
				`mathId=${maths.$hash}`,
				`errorId=${consoleErrors.$hash}`,
				`htmlId=${htmlElementVersion.$hash}`,
				`winId=${windowFeatures.$hash}`,
				`styleId=${styleHash}`,
				`styleSystemId=${systemHash}`,
				`ua=${encodeURIComponent(caniuse(() => fp.workerScope.userAgent))}`
			].join('&')}`

			return fetch(decryptRequest)
			.then(response => response.json())
			.then(data => {
				const el = document.getElementById('browser-detection')
				const {
					jsRuntime,
					jsEngine,
					htmlVersion,
					windowVersion,
					styleVersion,
					styleSystem,
				} = data
				const reportedUserAgent = caniuse(() => navigator.userAgent)
				const reportedSystem = getOS(reportedUserAgent)
				const report = decryptUserAgent({
					ua: reportedUserAgent,
					os: reportedSystem,
					isBrave
				})
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
							<span class="${fakeUserAgent ? 'lies' : ''}">${report}${fakeUserAgent ?` (fake)` : ''}</span>
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