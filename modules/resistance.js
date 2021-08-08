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
		// - this technique gets a small sample of known lie patterns
		// - patterns vary based on extensions settings, version, browser
		const prototypeLiesLen = Object.keys(prototypeLies).length

		// patterns based on settings
		const disabled = 'c767712b'
		const pattern = {
			noscript: {
				contentDocumentHash: ['0b637a33', '37e2f32e'],
				contentWindowHash: ['0b637a33', '37e2f32e'],
				getContextHash: ['0b637a33', disabled]
			},
			trace: {
				contentDocumentHash: ['ca9d9c2f'],
				contentWindowHash: ['ca9d9c2f'],
				createElementHash: ['77dea834'],
				getElementByIdHash: ['77dea834'],
				getImageDataHash: ['77dea834'],
				toBlobHash: ['77dea834'],
				toDataURLHash: ['77dea834']
			},
			cydec: {
				// [FF, FF Anti OFF, Chrome, Chrome Anti Off, no iframe Chrome, no iframe Chrome Anti Off]
				contentDocumentHash: ['945b0c78', '15771efa', '403a1a21', '55e9b959'],
				contentWindowHash: ['945b0c78', '15771efa', '403a1a21', '55e9b959'],
				createElementHash: ['cc7cb598', '4237b44c', '1466aaf0', '0cb0c682', '73c662d9', '72b1ee2b'],
				getElementByIdHash: ['cc7cb598', '4237b44c', '1466aaf0', '0cb0c682', '73c662d9', '72b1ee2b'],
				getImageDataHash: ['db60d7f9', '15771efa', 'db60d7f9', '55e9b959'],
				toBlobHash: ['044f14c2', '15771efa', 'afec348d', '55e9b959', '0dbbf456'],
				toDataURLHash: ['ecb498d9', '6b838fb6', 'ecb498d9', 'd19104ec', 'ecb498d9', '6985d315']
			},
			canvasblocker: {
				contentDocumentHash: ['6f901c5a'],
				contentWindowHash: ['6f901c5a'],
				appendHash: ['6f901c5a'],
				getImageDataHash: ['6f901c5a', 'a2971888', disabled],
				toBlobHash: ['6f901c5a', '9f1c3dfe', disabled],
				toDataURLHash: ['6f901c5a', disabled]
			},
			chameleon: {
				appendHash: ['77dea834'],
				insertAdjacentElementHash: ['77dea834'],
				insertAdjacentHTMLHash: ['77dea834'],
				insertAdjacentTextHash: ['77dea834'],
				prependHash: ['77dea834'],
				replaceWithHash: ['77dea834'],
				appendChildHash: ['77dea834'],
				insertBeforeHash: ['77dea834'],
				replaceChildHash: ['77dea834']
			},
			duckduckgo: {
				toDataURLHash: ['fd00bf5d', '8ee7df22'],
				toBlobHash: ['fd00bf5d', '8ee7df22'],
				getImageDataHash: ['fd00bf5d', '8ee7df22'],
				getByteFrequencyDataHash: ['fd00bf5d', '8ee7df22', disabled],
				getByteTimeDomainDataHash: ['fd00bf5d', '8ee7df22', disabled],
				getFloatFrequencyDataHash: ['fd00bf5d', '8ee7df22', disabled],
				getFloatTimeDomainDataHash: ['fd00bf5d', '8ee7df22', disabled],
				copyFromChannelHash: ['fd00bf5d', '8ee7df22', disabled],
				getChannelDataHash: ['fd00bf5d', '8ee7df22', disabled],
				hardwareConcurrencyHash: ['dfd41ab4'],
				availHeightHash: ['dfd41ab4'],
				availLeftHash: ['dfd41ab4'],
				availTopHash: ['dfd41ab4'],
				availWidthHash: ['dfd41ab4'],
				colorDepthHash: ['dfd41ab4'],
				pixelDepthHash: ['dfd41ab4']
			},
			// mode: Learn to block new trackers from your browsing
			privacybadger: {
				getImageDataHash: ['0cb0c682'],
				toDataURLHash: ['0cb0c682']
			},
			privacypossum: {
				hardwareConcurrencyHash: ['452924d5'],
				availWidthHash: ['452924d5'],
				colorDepthHash: ['452924d5']
			}
		}

		/*
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
			getContextHash: hashMini(prototypeLies['HTMLCanvasElement.getContext']),
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
		
		data.extensionHashPattern = Object.keys(hash).reduce((acc, key) => {
			const val = hash[key]
			if (val == disabled) {
				return acc
			}
			acc[key.replace('Hash', '')] = val
			return acc
		}, {})

		const getExtension = (pattern, hash) => {
			const {
				noscript,
				trace,
				cydec,
				canvasblocker,
				chameleon,
				duckduckgo,
				privacybadger,
				privacypossum
			} = pattern
			if (prototypeLiesLen) {
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
					return 'CyDec'
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
				if (prototypeLiesLen >= 10 &&
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
				if (prototypeLiesLen >= 2 &&
					privacybadger.getImageDataHash.includes(hash.getImageDataHash) &&
					privacybadger.toDataURLHash.includes(hash.toDataURLHash)) {
					return 'Privacy Badger'
				}
				if (prototypeLiesLen >= 3 &&
					privacypossum.hardwareConcurrencyHash.includes(hash.hardwareConcurrencyHash) &&
					privacypossum.availWidthHash.includes(hash.availWidthHash) &&
					privacypossum.colorDepthHash.includes(hash.colorDepthHash)) {
					return 'Privacy Possum'
				}
				if (prototypeLiesLen >= 2 &&
					noscript.contentDocumentHash.includes(hash.contentDocumentHash) &&
					noscript.contentWindowHash.includes(hash.contentDocumentHash) &&
					noscript.getContextHash.includes(hash.getContextHash)) {
					return 'NoScript'
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

export const resistanceHTML = ({ fp, modal, note, hashMini, hashSlice }) => {
	if (!fp.resistance) {
		return `
		<div class="col-six undefined">
			<strong>Resistance</strong>
			<div>privacy: ${note.blocked}</div>
			<div>security: ${note.blocked}</div>
			<div>mode: ${note.blocked}</div>
			<div>extension: ${note.blocked}</div>
		</div>`
	}
	const {
		resistance: data
	} = fp
	const {
		$hash,
		privacy,
		security,
		mode,
		extension,
		extensionHashPattern,
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
		<div>extension: ${
			!Object.keys(extensionHashPattern || {}).length ? note.unknown :
			modal(
				'creep-extension',
				'<strong>Pattern</strong><br><br>'
				+Object.keys(extensionHashPattern).map(key => `${key}: ${''+extensionHashPattern[key]}`).join('<br>'),
				(extension ? `${extensionIcon}${extension}` : hashMini(extensionHashPattern))
			)
		}</div>
	</div>
	`
}