export const getResistance = async imports => {

	const {
		require: {
			isFirefox,
			isChrome,
			getBraveMode,
			braveBrowser,
			prototypeLies,
			hashMini,
			captureError,
			logTestResult
		}
	} = imports

	try {
		await new Promise(setTimeout).catch(e => {})
		const start = performance.now()
		const data = {
			privacy: undefined,
			security: undefined,
			mode: undefined,
			extension: undefined,
			engine: (
				isChrome ? 'Blink' :
					isFirefox ? 'Gecko' :
						''
			)
		}
		// Brave
		const isBrave = await braveBrowser()
		if (isBrave) {
			const braveMode = getBraveMode()
			data.privacy = 'Brave'
			data.security = {
				'FileSystemWritableFileStream': 'FileSystemWritableFileStream' in window,
				'Serial': 'Serial' in window,
				'ReportingObserver': 'ReportingObserver' in window
			}
			data.mode = (
				braveMode.allow ? 'allow' :
				braveMode.standard ? 'standard' :
				braveMode.strict ? 'strict' :
				undefined
			)
		}
		
		// Firefox/Tor Browser
		const regex = n => new RegExp(`${n}+$`)
		const delay = (ms, baseNumber, baseDate = null) => new Promise(resolve => setTimeout(() => {
			const date = baseDate ? baseDate : +new Date()
			const value = regex(baseNumber).test(date) ? regex(baseNumber).exec(date)[0] : date
			return resolve(value)
		}, ms))
		const getTimerPrecision = async () => {
			const baseDate = +new Date()
			const baseNumber = +('' + baseDate).slice(-1)

			const a = await delay(0, baseNumber, baseDate)
			const b = await delay(1, baseNumber)
			const c = await delay(2, baseNumber)
			const d = await delay(3, baseNumber)
			const e = await delay(4, baseNumber)
			const f = await delay(5, baseNumber)
			const g = await delay(6, baseNumber)
			const h = await delay(7, baseNumber)
			const i = await delay(8, baseNumber)
			const j = await delay(9, baseNumber)

			const lastCharA = ('' + a).slice(-1)
			const lastCharB = ('' + b).slice(-1)
			const lastCharC = ('' + c).slice(-1)
			const lastCharD = ('' + d).slice(-1)
			const lastCharE = ('' + e).slice(-1)
			const lastCharF = ('' + f).slice(-1)
			const lastCharG = ('' + g).slice(-1)
			const lastCharH = ('' + h).slice(-1)
			const lastCharI = ('' + i).slice(-1)
			const lastCharJ = ('' + j).slice(-1)

			const protection = (
				lastCharA == lastCharB &&
				lastCharA == lastCharC &&
				lastCharA == lastCharD &&
				lastCharA == lastCharE &&
				lastCharA == lastCharF &&
				lastCharA == lastCharG &&
				lastCharA == lastCharH &&
				lastCharA == lastCharI &&
				lastCharA == lastCharJ
			)
			const baseLen = ('' + a).length
			const collection = [a, b, c, d, e, f, g, h, i, j]
			return {
				protection,
				delays: collection.map(n => ('' + n).length > baseLen ? ('' + n).slice(-baseLen) : n),
				precision: protection ? Math.min(...collection.map(val => ('' + val).length)) : undefined,
				precisionValue: protection ? lastCharA : undefined
			}
		}
		const { protection } = isChrome ? {} : await getTimerPrecision()

		if (isFirefox && protection) {
			const features = {
				'OfflineAudioContext': 'OfflineAudioContext' in window, // dom.webaudio.enabled
				'WebGL2RenderingContext': 'WebGL2RenderingContext' in window, // webgl.enable-webgl2
				'WebAssembly': 'WebAssembly' in window, // javascript.options.wasm
				'maxTouchPoints': 'maxTouchPoints' in navigator,
				'RTCRtpTransceiver':  'RTCRtpTransceiver' in window,
				'MediaDevices': 'MediaDevices' in window,
				'Credential': 'Credential' in window
			}
			const featureKeys = Object.keys(features)
			const targetSet = new Set([
				'RTCRtpTransceiver',
				'MediaDevices',
				'Credential'
			])
			const torBrowser = featureKeys.filter(key => targetSet.has(key) && !features[key]).length == targetSet.size
			const safer = !features.WebAssembly
			data.privacy = torBrowser ? 'Tor Browser' : 'Firefox'
			data.security = {
				'reduceTimerPrecision': true,
				...features
			}
			data.mode = (
				!torBrowser ? 'resistFingerprinting' :
					safer ? 'safer' :
						'standard' 
			)
		}

		// extension
		// this technique gets a small sample of known lie patterns
		// patterns vary based on extensions settings, version, and browser
		const prototypeLiesLen = Object.keys(prototypeLies).length

		// patterns based on settings
		const pattern = {
			noscript: {
				contentDocumentHash: ['0b637a33'],
				contentWindowHash: ['0b637a33']
			},
			trace: {
				contentDocumentHash: ['14952998'],
				contentWindowHash: ['14952998'],
				createElementHash: ['a3d61a73'],
				getElementByIdHash: ['a3d61a73'],
				getImageDataHash: ['cb6efb80'],
				toBlobHash: ['a3d61a73'],
				toDataURLHash: ['a3d61a73', '9983cdd9']
			},
			cydec: {
				contentDocumentHash: ['55e9b959', 'ae84b862'],
				contentWindowHash: ['55e9b959', 'ae84b862'],
				createElementHash: ['a5df9a1c', '9abf76a5'],
				getElementByIdHash: ['a5df9a1c', '9abf76a5'],
				getImageDataHash: ['55e9b959', 'bb4cd3c5', 'e2080b52', 'a267c9e6'],
				toBlobHash: ['55e9b959', 'ae84b862', 'b2f68fce'],
				toDataURLHash: ['55e9b959', 'ae84b862', '586998e6', '52ffa2f2', 'af080ebf', '621990c8']
			},
			canvasblocker: {
				contentDocumentHash: ['37e2f32e'],
				contentWindowHash: ['37e2f32e'],
				appendHash: ['0b637a33'],
				getImageDataHash: ['0b637a33', '684e0b40', 'c767712b'],
				toBlobHash: ['0b637a33', 'c767712b'],
				toDataURLHash: ['0b637a33', 'c767712b', '98266d99']
			},
			chameleon: {
				appendHash: ['a3d61a73'],
				insertAdjacentElementHash: ['a3d61a73'],
				insertAdjacentHTMLHash: ['a3d61a73'],
				insertAdjacentTextHash: ['a3d61a73'],
				prependHash: ['a3d61a73'],
				replaceWithHash: ['a3d61a73'],
				appendChildHash: ['a3d61a73'],
				insertBeforeHash: ['a3d61a73'],
				replaceChildHash: ['a3d61a73']
			},
			duckduckgo: {
				toDataURLHash: ['fd00bf5d', '55e9b959', '26a1c0c3'],
				toBlobHash: ['fd00bf5d', '55e9b959'],
				getImageDataHash: ['209cb4ea', 'a267c9e6'],
				getByteFrequencyDataHash: ['fd00bf5d', '55e9b959'],
				getByteTimeDomainDataHash: ['fd00bf5d', '55e9b959'],
				getFloatFrequencyDataHash: ['fd00bf5d', '55e9b959'],
				getFloatTimeDomainDataHash: ['fd00bf5d', '55e9b959'],
				copyFromChannelHash: ['fd00bf5d', '55e9b959'],
				getChannelDataHash: ['fd00bf5d', '55e9b959'],
				hardwareConcurrencyHash: ['dfd41ab4'],
				availHeightHash: ['dfd41ab4'],
				availLeftHash: ['dfd41ab4'],
				availTopHash: ['dfd41ab4'],
				availWidthHash: ['dfd41ab4'],
				colorDepthHash: ['dfd41ab4'],
				pixelDepthHash: ['dfd41ab4']
			}
		}

		/*
		Privacy Badger
		Privacy Possom
		Random User-Agent
		User Agent Switcher and Manager
		ScriptSafe
		Windscribe
		*/
		
		const hash = {
			// iframes
			contentDocumentHash: hashMini(prototypeLies['HTMLIFrameElement.contentDocument']),
			contentWindowHash: hashMini(prototypeLies['HTMLIFrameElement.contentWindow']),
			createElementHash: hashMini(prototypeLies['Document.createElement']),
			getElementByIdHash: hashMini(prototypeLies['Document.getElementById']),
			appendHash: hashMini(prototypeLies['Element.append']),
			insertAdjacentElementHash: hashMini(prototypeLies['Element.insertAdjacentElement']),
			insertAdjacentHTMLHash: hashMini(prototypeLies['Element.insertAdjacentHTML']),
			insertAdjacentTextHash: hashMini(prototypeLies['Element.insertAdjacentText']),
			prependHash: hashMini(prototypeLies['Element.prepend']),
			replaceWithHash: hashMini(prototypeLies['Element.replaceWith']),
			appendChildHash: hashMini(prototypeLies['Node.appendChild']),
			insertBeforeHash: hashMini(prototypeLies['Node.insertBefore']),
			replaceChildHash: hashMini(prototypeLies['Node.replaceChild']),
			// canvas
			toDataURLHash: hashMini(prototypeLies['HTMLCanvasElement.toDataURL']),
			toBlobHash: hashMini(prototypeLies['HTMLCanvasElement.toBlob']),
			getImageDataHash: hashMini(prototypeLies['CanvasRenderingContext2D.getImageData']),
			// Audio
			getByteFrequencyDataHash: hashMini(prototypeLies['AnalyserNode.getByteFrequencyData']),
			getByteTimeDomainDataHash: hashMini(prototypeLies['AnalyserNode.getByteTimeDomainData']),
			getFloatFrequencyDataHash: hashMini(prototypeLies['AnalyserNode.getFloatFrequencyData']),
			getFloatTimeDomainDataHash: hashMini(prototypeLies['AnalyserNode.getFloatTimeDomainData']),
			copyFromChannelHash: hashMini(prototypeLies['AudioBuffer.copyFromChannel']),
			getChannelDataHash: hashMini(prototypeLies['AudioBuffer.getChannelData']),
			// Hardware
			hardwareConcurrencyHash: hashMini(prototypeLies['Navigator.hardwareConcurrency']),
			// Screen
			availHeightHash: hashMini(prototypeLies['Screen.availHeight']),
			availLeftHash: hashMini(prototypeLies['Screen.availLeft']),
			availTopHash: hashMini(prototypeLies['Screen.availTop']),
			availWidthHash: hashMini(prototypeLies['Screen.availWidth']),
			colorDepthHash: hashMini(prototypeLies['Screen.colorDepth']),
			pixelDepthHash: hashMini(prototypeLies['Screen.pixelDepth'])
		}
		//console.log(hash)

		const getExtension = (pattern, hash) => {
			const {
				noscript,
				trace,
				cydec,
				canvasblocker,
				chameleon,
				duckduckgo
			} = pattern
			if (prototypeLiesLen) {
				if (prototypeLiesLen == 2 &&
					noscript.contentDocumentHash.includes(hash.contentDocumentHash) &&
					noscript.contentWindowHash.includes(hash.contentDocumentHash)) {
					return 'NoScript'
				}
				if (prototypeLiesLen >= 7 &&
					trace.contentDocumentHash.includes(hash.contentDocumentHash) &&
					trace.contentWindowHash.includes(hash.contentWindowHash) &&
					trace.createElementHash.includes(hash.createElementHash) &&
					trace.getElementByIdHash.includes(hash.getElementByIdHash) &&
					trace.toDataURLHash.includes(hash.toDataURLHash) &&
					trace.toBlobHash.includes(hash.toBlobHash) &&
					trace.getImageDataHash.includes(hash.getImageDataHash)) {
					return 'Trace'
				}
				if (prototypeLiesLen >= 7 &&
					cydec.contentDocumentHash.includes(hash.contentDocumentHash) &&
					cydec.contentWindowHash.includes(hash.contentWindowHash) &&
					cydec.createElementHash.includes(hash.createElementHash) &&
					cydec.getElementByIdHash.includes(hash.getElementByIdHash) &&
					cydec.toDataURLHash.includes(hash.toDataURLHash) &&
					cydec.toBlobHash.includes(hash.toBlobHash) &&
					cydec.getImageDataHash.includes(hash.getImageDataHash)) {
					return 'Cydec'
				}
				if (prototypeLiesLen >= 6 &&
					canvasblocker.contentDocumentHash.includes(hash.contentDocumentHash) &&
					canvasblocker.contentWindowHash.includes(hash.contentWindowHash)  &&
					canvasblocker.appendHash.includes(hash.appendHash) &&
					canvasblocker.toDataURLHash.includes(hash.toDataURLHash) &&
					canvasblocker.toBlobHash.includes(hash.toBlobHash) &&
					canvasblocker.getImageDataHash.includes(hash.getImageDataHash)) {
					return 'CanvasBlocker'
				}
				if (prototypeLiesLen >= 9 &&
					chameleon.appendHash.includes(hash.appendHash) &&
					chameleon.insertAdjacentElementHash.includes(hash.insertAdjacentElementHash) &&
					chameleon.insertAdjacentHTMLHash.includes(hash.insertAdjacentHTMLHash) &&
					chameleon.insertAdjacentTextHash.includes(hash.insertAdjacentTextHash) &&
					chameleon.prependHash.includes(hash.prependHash) &&
					chameleon.replaceWithHash.includes(hash.replaceWithHash) &&
					chameleon.appendChildHash.includes(hash.appendChildHash) &&
					chameleon.insertBeforeHash.includes(hash.insertBeforeHash) &&
					chameleon.replaceChildHash.includes(hash.replaceChildHash)) {
					return 'Chameleon'
				}
				if (prototypeLiesLen >= 16 &&
					duckduckgo.toDataURLHash.includes(hash.toDataURLHash) &&
					duckduckgo.toBlobHash.includes(hash.toBlobHash) &&
					duckduckgo.getImageDataHash.includes(hash.getImageDataHash) &&
					duckduckgo.getByteFrequencyDataHash.includes(hash.getByteFrequencyDataHash) &&
					duckduckgo.getByteTimeDomainDataHash.includes(hash.getByteTimeDomainDataHash) &&
					duckduckgo.getFloatFrequencyDataHash.includes(hash.getFloatFrequencyDataHash) &&
					duckduckgo.getFloatTimeDomainDataHash.includes(hash.getFloatTimeDomainDataHash) &&
					duckduckgo.copyFromChannelHash.includes(hash.copyFromChannelHash) &&
					duckduckgo.getChannelDataHash.includes(hash.getChannelDataHash) &&
					duckduckgo.hardwareConcurrencyHash.includes(hash.hardwareConcurrencyHash) &&
					duckduckgo.availHeightHash.includes(hash.availHeightHash) &&
					duckduckgo.availLeftHash.includes(hash.availLeftHash) &&
					duckduckgo.availTopHash.includes(hash.availTopHash) &&
					duckduckgo.availWidthHash.includes(hash.availWidthHash) &&
					duckduckgo.colorDepthHash.includes(hash.colorDepthHash) &&
					duckduckgo.pixelDepthHash.includes(hash.pixelDepthHash)) {
					return 'DuckDuckGo'
				}
				return
			}
			return
		}
		
		data.extension = getExtension(pattern, hash)

		logTestResult({ start, test: 'resistance', passed: true })
		return data
	}
	catch (error) {
		logTestResult({ test: 'resistance', passed: false })
		captureError(error)
		return
	}
}

export const resistanceHTML = ({fp, modal, note, hashMini, hashSlice}) => `
	${!fp.resistance ?
		`<div class="col-six">
			<strong>Resistance</strong>
			<div>privacy: ${note.blocked}</div>
			<div>security: ${note.blocked}</div>
			<div>mode: ${note.blocked}</div>
		</div>` :
	(() => {
		const {
			resistance: data
		} = fp
		const {
			$hash,
			privacy,
			security,
			mode,
			extension,
			engine
		} = data || {}
		
		const securitySettings = !security || Object.keys(security).reduce((acc, curr) => {
			if (security[curr]) {
				acc[curr] = 'enabled'
				return acc
			}
			acc[curr] = 'disabled'
			return acc
		}, {})

		const browserIcon = (
			/brave/i.test(privacy) ? '<span class="icon brave"></span>' :
				/tor/i.test(privacy) ? '<span class="icon tor"></span>' :
					/firefox/i.test(privacy) ? '<span class="icon firefox"></span>' :
						''
		)

		const extensionIcon = (
			/blink/i.test(engine) ? '<span class="icon chrome-extension"></span>' :
				/gecko/i.test(engine) ? '<span class="icon firefox-addon"></span>' :
					''
		)

		return `
		<div class="col-six">
			<strong>Resistance</strong><span class="hash">${hashSlice($hash)}</span>
			<div>privacy: ${privacy ? `${browserIcon}${privacy}` : note.unknown}</div>
			<div>security: ${
				!security ? note.unknown :
				modal(
					'creep-resistance',
					'<strong>Security</strong><br><br>'
					+Object.keys(securitySettings).map(key => `${key}: ${''+securitySettings[key]}`).join('<br>'),
					hashMini(security)
				)
			}</div>
			<div>mode: ${mode || note.unknown}</div>
			<div>extension: ${extension ? `${extensionIcon}${extension}` : note.unknown}</div>
		</div>
		`
	})()}
`