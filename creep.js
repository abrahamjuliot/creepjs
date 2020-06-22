(function () {
	// Log performance time
	const timer = (logStart) => {
		console.log(logStart)
		const start = Date.now()
		return (logEnd) => {
			const end = Date.now() - start
			console.log(`${logEnd}: ${end / 1000} seconds`)
		}
	}

	// Handle Errors
	const errorsCaptured = []
	const captureError = (error) => {
		console.error(error)
		const { name, message } = error
		const stack = JSON.stringify(error.stack)
		errorsCaptured.push({ name, message, stack })
		return undefined
	}
	const attempt = fn => {
		try {
			return fn()
		} catch (error) {
			return captureError(error)
		}
	}

	// https://stackoverflow.com/a/22429679
	const hashMini = str => {
	    const json = `${JSON.stringify(str)}`
	    let i, len, hash = 0x811c9dc5
	    for (i = 0, len = json.length; i < len; i++) {
	        hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	    }
	    return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	}

	// https://stackoverflow.com/a/53490958
	// https://stackoverflow.com/a/43383990
	// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
	const hashify = async (x) => {
		const json = `${JSON.stringify(x)}`
		const jsonBuffer = new TextEncoder('utf-8').encode(json)
		const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
		return hashHex
	}

	// ie11 fix for template.content
	function templateContent(template) {
		// template {display: none !important} /* add css if template is in dom */
		if ('content' in document.createElement('template')) {
			return document.importNode(template.content, true)
		} else {
			const frag = document.createDocumentFragment()
			const children = template.childNodes
			for (let i = 0, len = children.length; i < len; i++) {
				frag.appendChild(children[i].cloneNode(true))
			}
			return frag
		}
	}

	// tagged template literal (JSX alternative)
	const patch = async (oldEl, newEl, fn = null) => {
		oldEl.parentNode.replaceChild(newEl, oldEl);
		return typeof fn === 'function' ? await fn() : true
	}
	const html = (stringSet, ...expressionSet) => {
		const template = document.createElement('template')
		template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i] || ''}`).join('')
		return templateContent(template) // ie11 fix for template.content
	}
	// Detect proxy behavior
	const proxyBehavior = (obj) => {
		const target = (Math.random().toString(36)+'00000000000000000').slice(2, 8+2)
		try {
			window.postMessage(obj, target)
			return false
		}
		catch(error) {
			const clonable = !error.message.includes('could not be cloned')
			const json = JSON.stringify(obj)
			const emptyJSON = json === '{}' || json == undefined
			return  emptyJSON && !clonable
		}
	}

	// detect and fingerprint Function API lies
	const native = (result, str) => {
		const chrome = `function ${str}() { [native code] }`
		const firefox = `function ${str}() {\n    [native code]\n}`
		return result == chrome || result == firefox
	}
	const hasLiedStringAPI = () => {
		let lieTypes = []
		// detect attempts to rewrite Function.prototype.toString conversion APIs
		const { toString } = Function.prototype
		if (!native(toString, 'toString')) {
			lieTypes.push({ toString })
		}

		// The idea of checking new is inspired by https://adtechmadness.wordpress.com/2019/03/23/javascript-tampering-detection-and-stealth/
		try {
			const str_1 = new Function.prototype.toString
			const str_2 = new Function.prototype.toString()
			const str_3 = new Function.prototype.toString.toString
			const str_4 = new Function.prototype.toString.toString()
			lieTypes.push({
				str_1,
				str_2,
				str_3,
				str_4
			})
		} catch (error) {
			const nativeTypeError = 'TypeError: Function.prototype.toString is not a constructor'
			if ('' + error != nativeTypeError) {
				lieTypes.push({ newErr: '' + error })
			}
		}

		return () => lieTypes
	}
	const stringAPILieTypes = hasLiedStringAPI() // compute and cache result
	const hasLiedAPI = (api, name) => {
		let lieTypes = [...stringAPILieTypes()]
		let fingerprint = ''

		// detect attempts to rename the API and/or rewrite toString
		const { toString: fnToStr } = Function.prototype
		const { name: apiName, toString: apiToString } = api
		if (apiName != name) {
			lieTypes.push({ apiName })
		}
		if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
			lieTypes.push({ apiToString })
		}

		// collect string conversion result
		const result = '' + api

		// fingerprint result if it does not match native code
		if (!native(result, name)) {
			fingerprint = result
		}
		
		return {
			lie: lieTypes.length || fingerprint ? { lieTypes, fingerprint } : false, 
		}
	}

	// Detect renderer lie @Brave Browser and Privacy Possom
	const credibleRenderer = (str) => {
		const spaces = s => s.match(/\s/g).length
		const hasAngle = s => /ANGLE\s\(.+\)/.test(s)
		return hasAngle(str) && spaces(str) >= 3
	}
	// Detect Brave Browser and strict fingerprinting blocking
	brave = () => {
		if ('brave' in navigator) {
			const canvas = document.createElement('canvas')
			const webglContext = canvas.getContext('webgl')
			const extension = webglContext.getExtension('WEBGL_debug_renderer_info')
			const renderer = extension && webglContext.getParameter(extension.UNMASKED_RENDERER_WEBGL)
			return {
				blockingFingerprintingStrict: !extension ? true : renderer ? !credibleRenderer(renderer): false
			}
		}
		return false
	}
	const isBrave = brave() // compute and cache result

	// Collect trash values
	const trashBin = []
	const sendToTrash = (name, val) => {
		const proxyLike = proxyBehavior(val)
		const value = !proxyLike ? val : 'proxy behavior detected'
		trashBin.push({ name, value })
		return undefined
	}

	// Collect lies detected
	const lieRecords = []
	const compress = (x) => {
		return JSON.stringify(x).replace(/((\n|\r|\s|:|\"|\,|\{|\}|\[|\]|\(|\))+)/gm, '').toLowerCase()
	}
	const documentLie = (name, lie, lieDetail) => {
		console.warn(`Lie detected (${name}):`, lieDetail)
		return lieRecords.push({ name, hash: hashMini({ lie, lieDetail }) })
	}
	
	// validate
	const isInt = (x) => typeof x == 'number' && x % 1 == 0
	const trustIntegerWithinRange = (name, val, min, max) => {
		const trusted = isInt(val) && val >= min && val <= max 
		return trusted ? val : sendToTrash(name, val)
	}

	// navigator
	const nav = () => {
		const credibleUserAgent = navigator.userAgent.includes(navigator.appVersion)
		return {
			appVersion: attempt(() => {
				const { appVersion } = navigator
				return credibleUserAgent ? appVersion : sendToTrash('appVersion', 'does not match userAgent')
			}),
			deviceMemory: attempt(() => {
				const { deviceMemory } = navigator
				return deviceMemory ? trustIntegerWithinRange('deviceMemory', deviceMemory, 1, 100) : undefined
			}),
			doNotTrack: attempt(() => {
				const { doNotTrack } = navigator
				const dntValues = [1, '1', true, 'yes', 0, '0', false, 'no', 'unspecified', 'null']
				const trusted = dntValues.filter(val => val === doNotTrack )[0]
				return trusted ? doNotTrack : doNotTrack ? sendToTrash('doNotTrack', doNotTrack) : undefined
			}),
			hardwareConcurrency: attempt(() => {
				const { hardwareConcurrency } = navigator 
				return trustIntegerWithinRange('hardwareConcurrency', hardwareConcurrency, 1, 100)
			}),
			language: attempt(() => {
				const { languages, language } = navigator
				const langs = /^.{0,2}/g.exec(languages[0])[0]
				const lang = /^.{0,2}/g.exec(language)[0]
				const trusted = langs == lang
				return (
					trusted ? `${languages.join(', ')} (${language})` : 
					sendToTrash('languages', [languages, language].join(' '))
				)
			}),
			maxTouchPoints: attempt(() => {
				const { maxTouchPoints } = navigator 
				return trustIntegerWithinRange('maxTouchPoints', maxTouchPoints, 0, 100)
			}),
			platform: attempt(() => {
				const { platform } = navigator
				const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11']
				const trusted = systems.filter(val => platform.toLowerCase().includes(val))[0]
				return trusted ? platform : sendToTrash('platform', platform)
			}),
			userAgent: attempt(() => {
				const { userAgent } = navigator
				return credibleUserAgent ? userAgent : sendToTrash('userAgent', userAgent)
			}),
			vendor: attempt(() => navigator.vendor),
			mimeTypes: attempt(() => [...navigator.mimeTypes].map(m => m.type)),
			plugins: attempt(() => {
				return [...navigator.plugins]
					.map(p => ({
						name: p.name,
						description: p.description,
						filename: p.filename,
						version: p.version
					}))
			})
		}
	}

	// client hints
	const highEntropyValues = () => {
		const undfnd = new Promise(resolve => resolve(undefined))
		try {
			if (!('userAgentData' in navigator)) {
				return undfnd
			}
			return !navigator.userAgentData ? undfnd : 
				attempt(() => navigator.userAgentData.getHighEntropyValues(
					['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
				))
		}
		catch(error) {
			captureError(error)
			return new Promise(resolve => resolve(undefined))
		}
	}

	// screen
	const screenFp = () => {
		const { width, height, availWidth, availHeight, availTop, availLeft, colorDepth, pixelDepth } = screen
		return {
			width: attempt(() => trustIntegerWithinRange('width', width, 10, 10000)),
			height: attempt(() => trustIntegerWithinRange('height', height, 10, 10000)),
			availWidth: attempt(() => trustIntegerWithinRange('availWidth', availWidth, 10, width)),
			availHeight: attempt(() => trustIntegerWithinRange('availHeight', availHeight, 10, height)),
			availTop: attempt(() => trustIntegerWithinRange('availTop', availTop, 0, 10000)),
			availLeft: attempt(() => trustIntegerWithinRange('availLeft', availLeft, 0, 10000)),
			colorDepth: attempt(() => trustIntegerWithinRange('colorDepth', colorDepth, 2, 1000)),
			pixelDepth: attempt(() => trustIntegerWithinRange('pixelDepth', pixelDepth, 2, 1000))
		}
	}

	// voices
	const getVoices = () => {
		const undfn = new Promise(resolve => resolve(undefined))
		/* block till Tor Browser fix */
		// return undfn
		try {
			const promise = new Promise(resolve => {
				try {
					if (typeof speechSynthesis === 'undefined') {
						return resolve(undefined)
					} 
					else if (!speechSynthesis.getVoices || speechSynthesis.getVoices() == undefined) {
						return resolve(undefined)
					}
					else if (speechSynthesis.getVoices().length) {
						const voices = speechSynthesis.getVoices()
						return resolve(voices)
					} else {
						speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices())
					}
				}
				catch(error) {
					captureError(error)
					return resolve(undefined)
				}
			})
			
			return promise
		}
		catch(error) {
			captureError(error)
			return undfn
		}
	}

	// media devices
	const getMediaDevices = () => {
		const undfn = new Promise(resolve => resolve(undefined))
		
		if (!('mediaDevices' in navigator)) {
			return undfn
		}
		try {
			if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
				return undfn
			}
			return attempt(() => navigator.mediaDevices.enumerateDevices())
		}
		catch(error) {
			captureError(error)
			return undfn
		}
	}

	// canvas
	const { lie: dataLie } = hasLiedAPI(HTMLCanvasElement.prototype.toDataURL, 'toDataURL')
	const { lie: contextLie } = hasLiedAPI(HTMLCanvasElement.prototype.getContext, 'getContext')
	const canvas = () => {
		const canvas = document.createElement('canvas')
		let canvas2dDataURI = ''
		if (!dataLie && !contextLie) {
			const context = canvas.getContext('2d')
			const str = '%$%^LGFWE($HIF)'
			context.font = '20px Arial'
			context.fillText(str, 100, 100)
			context.fillStyle = 'red'
			context.fillRect(100, 30, 80, 50)
			context.font = '32px Times New Roman'
			context.fillStyle = 'blue'
			context.fillText(str, 20, 70)
			context.font = '20px Arial'
			context.fillStyle = 'green'
			context.fillText(str, 10, 50)
			canvas2dDataURI = canvas.toDataURL()
			return isBrave ? sendToTrash('canvas2dDataURI', hashMini(canvas2dDataURI)+' (hash of data URI)') : canvas2dDataURI
		}
		
		// document lie and send to trash
		canvas2dDataURI = canvas.toDataURL()
		const canvas2dContextDataURI = canvas2dDataURI
		if (contextLie) {
			documentLie('canvas2dContextDataURI', hashMini(canvas2dContextDataURI)+' (hash of data URI)', contextLie)
			sendToTrash('canvas2dContextDataURI', hashMini(canvas2dContextDataURI)+' (hash of data URI)')
		}
		if (dataLie) {
			documentLie('canvas2dDataURI', hashMini(canvas2dDataURI)+' (hash of data URI)', dataLie)
			sendToTrash('canvas2dDataURI', hashMini(canvas2dDataURI)+' (hash of data URI)')
		}
		
		// fingerprint lie
		return { dataLie, contextLie }
	}

	// webgl
	const webgl = () => {
		const { lie: paramLie } = hasLiedAPI(WebGLRenderingContext.prototype.getParameter, 'getParameter')
		const { lie: extLie } = hasLiedAPI(WebGLRenderingContext.prototype.getExtension, 'getExtension')
		const canvas = document.createElement('canvas')
		const context = canvas.getContext('webgl')

		return {
			unmasked: (() => {
				try {
					const extension = context.getExtension('WEBGL_debug_renderer_info')
					const vendor = context.getParameter(extension.UNMASKED_VENDOR_WEBGL)
					const renderer = context.getParameter(extension.UNMASKED_RENDERER_WEBGL)

					if (!paramLie && !extLie) {
						if (!credibleRenderer(renderer)) {
							return {
								vendor: sendToTrash('webglVendor', vendor),
								renderer: sendToTrash('webglRenderer', renderer)
							}
						}
						return {
							vendor: isBrave ? sendToTrash('webglVendor', vendor) : vendor,
							renderer: isBrave ? sendToTrash('webglRenderer', renderer) : renderer
						}
					}

					// document lie and send to trash
					const webglVendorAndRendererParameter = { vendor, renderer }
					const webglVendorAndRendererExtension = webglVendorAndRendererParameter
					if (paramLie) { 
						documentLie('webglVendorAndRendererParameter', webglVendorAndRendererParameter, paramLie)
						sendToTrash('webglVendorAndRendererParameter', webglVendorAndRendererParameter)
					}
					if (extLie) {
						documentLie('webglVendorAndRendererExtension', webglVendorAndRendererExtension, extLie)
						sendToTrash('webglVendorAndRendererExtension', webglVendorAndRendererExtension)
					}
					// Fingerprint lie
					return {
						vendor: { paramLie, extLie },
						renderer: { paramLie, extLie }
					}
				}
				catch(error) {
					captureError(error)
					return {
						vendor: undefined,
						renderer: undefined
					}
				}
			})(),
			dataURL: (() => {
				try {
					let canvasWebglDataURI = ''

					if (!dataLie && !contextLie) {
						context.clearColor(0.2, 0.4, 0.6, 0.8)
						context.clear(context.COLOR_BUFFER_BIT)
						canvasWebglDataURI = canvas.toDataURL()
						return isBrave ? sendToTrash('canvasWebglDataURI', hashMini(canvasWebglDataURI)+' (hash of data URI)') : canvasWebglDataURI
					}

					// document lie and send to trash
					canvasWebglDataURI = canvas.toDataURL()
					const canvasWebglContextDataURI = canvasWebglDataURI
					if (contextLie) {
						documentLie('canvasWebglContextDataURI', hashMini(canvasWebglContextDataURI)+' (hash of data URI)', contextLie)
						sendToTrash('canvasWebglContextDataURI', hashMini(canvasWebglContextDataURI)+' (hash of data URI)')
					}
					if (dataLie) {
						documentLie('canvasWebglDataURI', hashMini(canvasWebglDataURI)+' (hash of data URI)', dataLie)
						sendToTrash('canvasWebglDataURI', hashMini(canvasWebglDataURI)+' (hash of data URI)')
					}

					// fingerprint lie
					return { dataLie, contextLie }
				}
				catch(error) {
					return captureError(error)
				}
			})()
		}
		
	}

	// maths
	const maths = () => {
		const n = 0.123124234234234242
		const fns = [
			['acos', [n]],
			['acosh', [1e308]],
			['asin', [n]],
			['asinh', [1e300]],
			['asinh', [1]],
			['atan', [2]],
			['atanh', [0.5]],
			['atan2', [90, 15]],
			['atan2', [1e-310, 2]],
			['cbrt', [100]],
			['cosh', [100]],
			['expm1', [1]],
			['sin', [1]],
			['sinh', [1]],
			['tan', [-1e308]],
			['tanh', [1e300]],
			['cosh', [1]],
			['sin', [Math.PI]],
			['pow', [Math.PI, -100]]
		]
		return fns.map(fn => ({
			[fn[0]]: attempt(() => Math[fn[0]](...fn[1]))
		}))
	}

	// browser console errors
	const consoleErrs = () => {
		const getErrors = (errs, errFns) => {
			let i, len = errFns.length
			for (i = 0; i < len; i++) {
				try {
					errFns[i]()
				} catch (err) {
					errs.push(err.message)
				}
			}
			return errs
		}
		const errFns = [
			() => eval('alert(")'),
			() => eval('const foo;foo.bar'),
			() => eval('null.bar'),
			() => eval('abc.xyz = 123'),
			() => eval('const foo;foo.bar'),
			() => eval('(1).toString(1000)'),
			() => eval('[...undefined].length'),
			() => eval('var x = new Array(-1)'),
			() => eval('const a=1; const a=2;')
		]
		return getErrors([], errFns)
	}

	// timezone
	const timezone = () => {
		const { lie: timezoneLie } = hasLiedAPI(Date.prototype.getTimezoneOffset, 'getTimezoneOffset')
		const timezoneOffset_1 = new Date().getTimezoneOffset()
		if (!timezoneLie) {
			const withinParentheses = /(?<=\().+?(?=\))/g
			const utc = Date.parse(new Date().toJSON().split`Z`.join``)
			const now = +new Date()
			const timezoneOffset_2 = (utc - now)/60000
			const trusted = timezoneOffset_1 == timezoneOffset_2
			const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
			const timezone = withinParentheses.exec(''+new Date())[0]
			return trusted ? `${timezoneOffset_1}, ${timezoneLocation}, ${timezone}` : undefined
		}

		// document lie and send to trash
		const timezoneOffset = timezoneOffset_1
		if (timezoneLie) {
			documentLie('timezoneOffset', timezoneOffset, timezoneLie)
			sendToTrash('timezoneOffset', timezoneOffset)
		}

		// Fingerprint lie
		return { timezoneLie }
	}

	// client rects
	const cRects = () => {
		const { lie: rectsLie } = hasLiedAPI(Element.prototype.getClientRects, 'getClientRects')
		const cRectProps = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left']
		const rectElems = document.getElementsByClassName('rects')
		const clientRects = [...rectElems].map(el => el.getClientRects()[0].toJSON())

		if (!rectsLie) {
			return clientRects
		}
		
		// document lie and send to trash
		const timezoneOffset = timezoneOffset_1
		if (rectsLie) {
			documentLie('clientRects', clientRects, rectsLie)
			sendToTrash('clientRects', clientRects)
		}

		// Fingerprint lie
		return { rectsLie }
	}

	// scene
	const scene = html`
	<fingerprint>
		<div id="fingerprint">Loading...</div>
		<style>
		#rect-container{opacity:0;position:relative;border:1px solid #F72585}.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#F72585;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#7209B7;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#3A0CA3;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#4361EE;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#4CC9F0;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#F72585;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#4361EE}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#3A0CA3}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#7209B7}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#F72585}
		</style>
		<div id="rect-container">
			<div id="cRect1" class="rects"></div>
			<div id="cRect2" class="rects"></div>
			<div id="cRect3" class="rects"></div>
			<div id="cRect4" class="rects absolute"></div>
			<div id="cRect5" class="rects"></div>
			<div id="cRect6" class="rects"></div>
			<div id="cRect7" class="rects absolute"></div>
			<div id="cRect8" class="rects absolute"></div>
			<div id="cRect9" class="rects absolute"></div>
			<div id="cRect10" class="rects absolute"></div>
		</div>
	</fingerprint>
	`

	// fingerprint
	const fingerprint = async () => {
		// attempt to compute values
		const navComputed = attempt(() => nav())
		const mimeTypes = navComputed ? navComputed.mimeTypes : undefined
		const plugins = navComputed ? navComputed.plugins : undefined
		const screenComputed = attempt(() => screenFp())
		const canvasComputed = attempt(() => canvas())
		const gl = attempt(() => webgl())
		const webglComputed = {
			vendor: attempt(() => gl.unmasked.vendor),
			renderer: attempt(() => gl.unmasked.renderer)
		}
		const webglDataURLComputed = attempt(() => gl.dataURL)
		const consoleErrorsComputed = attempt(() => consoleErrs())
		const timezoneComputed = attempt(() => timezone())
		const cRectsComputed = attempt(() => cRects())
		const mathsComputed = attempt(() => maths())
		
		// await voices, media, and client hints, then compute
		const [
			voices,
			mediaDevices,
			highEntropy
		] = await Promise.all([
			getVoices(),
			getMediaDevices(),
			highEntropyValues()
		]).catch(error => { 
			console.error(error.message)
		})
		
		const voicesComputed = !voices ? undefined : voices.map(({ name, lang }) => ({ name, lang }))
		const mediaDevicesComputed = !mediaDevices ? undefined : mediaDevices.map(({ kind }) => ({ kind })) // chrome randomizes groupId
		// await hash values
		const hashTimer = timer('hashing values...')
		const [
			navHash, // order must match
			mimeTypesHash,
			pluginsHash,
			voicesHash,
			mediaDeviceHash,
			highEntropyHash,
			timezoneHash,
			webglHash,
			screenHash,
			weglDataURLHash,
			consoleErrorsHash,
			cRectsHash,
			mathsHash,
			canvasHash,
			errorsCapturedHash
		] = await Promise.all([
			hashify(navComputed),
			hashify(mimeTypes),
			hashify(plugins),
			hashify(voicesComputed),
			hashify(mediaDevicesComputed),
			hashify(highEntropy),
			hashify(timezoneComputed),
			hashify(webglComputed),
			hashify(screenComputed),
			hashify(webglDataURLComputed),
			hashify(consoleErrorsComputed),
			hashify(cRectsComputed),
			hashify(mathsComputed),
			hashify(canvasComputed),
			hashify(errorsCaptured)
		]).catch(error => { 
			console.error(error.message)
		})
		hashTimer('Hashing complete')

		const fingerprint = {
			nav: [navComputed, navHash],
			highEntropy: [highEntropy, highEntropyHash],
			timezone: [timezoneComputed, timezoneHash],
			webgl: [webglComputed, webglHash],
			mimeTypes: [mimeTypes, mimeTypesHash],
			plugins: [plugins, pluginsHash],
			voices: [voicesComputed, voicesHash],
			mediaDevices: [mediaDevicesComputed, mediaDeviceHash],
			screen: [screenComputed, screenHash],
			webglDataURL: [webglDataURLComputed, weglDataURLHash],
			consoleErrors: [consoleErrorsComputed, consoleErrorsHash],
			cRects: [cRectsComputed, cRectsHash],
			maths: [mathsComputed, mathsHash],
			canvas: [canvasComputed, canvasHash],
			errorsCaptured: [errorsCaptured, errorsCapturedHash]
		}
		return fingerprint
	}
	// get/post requests
	const webapp = 'https://script.google.com/macros/s/AKfycbzKRjt6FPboOEkh1vTXttGyCjp97YBP7z-5bODQmtSkQ9BqDRY/exec'
	async function postData(formData) {
		const response = await fetch(webapp, { method: 'POST', body: formData })
		return response.json()
	}
	async function getData() {
		const response = await fetch(webapp)
		return response.json()
	}

	// patch
	const app = document.getElementById('fp-app')
	patch(app, scene, async () => {
		// fingerprint and render
		const fpElem = document.getElementById('fingerprint')
		const fp = await fingerprint().catch((e) => console.log(e))

		// creep by detecting lies
		const creep = {
			timezone: fp.timezone,
			renderer: webgl.renderer,
			vendor: webgl.vendor,
			webglDataURL: fp.webglDataURL,
			consoleErrors: fp.consoleErrors,
			cRects: fp.cRects,
			maths: fp.maths,
			canvas: fp.canvas
		}
		const log = (message, obj) => console.log(message, JSON.stringify(obj, null, '\t'))

		log('Fingerprint Id', fp)
		console.log('Trash Bin', trashBin)
		console.log('Lie Records', lieRecords)
		
		const [fpHash, creepHash] = await Promise.all([hashify(fp), hashify(creep)])
		.catch(error => { 
			console.error(error.message)
		})
		// post hash to database
		const formData = new FormData()
		formData.append('id', creepHash)
		formData.append('visits', 1)
		const errs = err => console.error('Error!', err.message)
		postData(formData).catch(errs)

		// get data from server
		//const responseData = await getData().catch(errs)
		//console.log('Response data:', responseData)
		fetch(webapp)
			.then(response => response.json())
  			.then(data => console.log(data))
		
		// identify known hash
		const identify = prop => {
			const known = {
				'0df25df426d0ce052d04482c0c2cd4d874ae7a4da4feb430be36150a770f3b6b': 'Browser Plugs',
				'65069db4579c03d49fde85983c905817c8798cad3ad6b39dd93df24bde1449c9': 'Browser Plugs',
				'3ac278638742f3475dcd69559fd1d12e01eefefffe3df66f9129d35635fc3311': 'Browser Plugs',
				'e9f96e6b7f0b93f9d7677f0e270c97d6fa12cbbe3134ab5f906d152f57953e72': 'Browser Plugs',
				'0c3156fbce7624886a6a5485d3fabfb8038f9b656de01100392b2cebf354106d': 'Browser Plugs',
				'94e40669f496f2cef69cc289f3ee50dc442ced21fb42a88bc223270630002556': 'Canvas Fingerprint Defender',
				'32cfbc8d166d60a416d942a678dd707119474a541969ad95c0968ae5df32bdcb': 'Privacy Possom',
				'1a2e56badfca47209ba445811f27e848b4c2dae58224445a4af3d3581ffe7561': 'Privacy Possom',
				'107362a28208c432abd04f7d571f64ea1089c14db531e1c1375b83ae9ca0ba6a': 'Privacy Badger or similar',
				'785acfe6b266709e167dcc85fdd5697798cfdb1dcb9bed4eab42f422117ebaab': 'Trace',
				'015523301c35459c43d145f3bc2b3edc6c4f3d2963a2d67bbd10cf634d84bacb': 'Trace',
				'7757f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5': 'Chromium',
				'21f2f6f397db5fa611029154c35cd96eb9a96c4f1c993d4c3a25da765f2dd13b': 'Firefox',
				'e086050038b44b8dcb9d0565da3ff448a0162da7023469d347303479f981f5fd': 'Firefox',
				'0a1a099e6b0a7365acfdf38ed79c9cde9ec0617b0c39b6366dad4d1a4aa6fcaf': 'Firefox',
				'99dfbc2000c9c81588259515fed8a1f6fbe17bf9964c850560d08d0bfabc1fff': 'Tor Browser'
			}

			const [ data, hash ] = prop
			const iterable = Symbol.iterator in Object(data)
			return !data || (iterable && !data.length) ? '[blocked]' : known[hash] ? known[hash] : hash
		}
		const pluralify = (len) => len > 1 ? 's' : ''
		// template
		const data = `
			<section>
				<style>
					#fingerprint-data {
						box-sizing: border-box;
						margin: 0 auto;
					  	max-width: 700px;
					}
					#fingerprint-data > div {
					  	color: #2c2f33;
						overflow-wrap: break-word;
						padding: 10px;
						margin: 10px 0;
						box-shadow: 0px 2px 2px 0px #cfd0d1;
					}
					#fingerprint-data h1,
					#fingerprint-data h2 {
						color: #2d3657;
						text-align: center;
					}
					.device {
						background: #7289da3b;
					}
				</style>
				
				<div id="fingerprint-data">
					<h1 class="visit">Your Fingerprint</h1>
					<h2 class="visit">last visit: ${'compute client side'}</h2>
					<h3 class="visit">total visits: ${'compute client side + 1'}</h3>
					<div>Purified Fingerprint Id: ${creepHash}</div>
					<div>Fingerprint Id: ${fpHash}</div>

					${
						!isBrave || !isBrave.blockingFingerprintingStrict? '': (() => {
							return `
							<div>
								<div>Brave Browser is Blocking Fingerprinting in Strict Mode</div>
							</div>
							`
						})()
					}

					${
						!trashBin.length ? '': (() => {
							const plural = pluralify(trashBin.length)
							return `
							<div>
								<div>${trashBin.length} API${plural} ignored and considered trash: </div>
								${trashBin.map(item => `<div>${item.name} - ${item.value}</div>`).join('')}
							</div>
							`
						})()
					}

					${
						!lieRecords.length ? '': (() => {
							const plural = pluralify(lieRecords.length)
							return `
							<div>
								<div>${lieRecords.length} API lie${plural} detected: </div>
								${lieRecords.map(item => `<div>${item.name} - ${item.hash} (hash of value)</div>`).join('')}
							</div>
							`
						})()
					}

					<div>canvas: ${
						isBrave ? 'Brave Browser' : identify(fp.canvas)
					}</div>
					<div>webglDataURL: ${
						isBrave ? 'Brave Browser' : identify(fp.webglDataURL)
					}</div>
					<div>webgl renderer: ${(() => {
						const [ data, hash ] = fp.webgl
						const { renderer } = data
						const isString = typeof renderer == 'string'
						return (
							isBrave ? 'Brave Browser' : 
							isString && renderer ? renderer : 
							!renderer ? '[blocked]' : identify(fp.webgl)
						)
					})()}</div>
					<div>webgl vendor: ${(() => {
						const [ data, hash ] = fp.webgl
						const { vendor } = data
						const isString = typeof vendor == 'string'
						return (
							isBrave ? 'Brave Browser' : 
							isString && vendor ? vendor : 
							!vendor ? '[blocked]' : identify(fp.webgl)
						)
					})()}</div>
					<div>client rects: ${identify(fp.cRects)}</div>
					<div>console errors: ${identify(fp.consoleErrors)}</div>
					<div>errors captured: ${fp.errorsCaptured[0].length ? fp.errorsCaptured[1] : '[none]'}</div>	
					<div>maths: ${identify(fp.maths)}</div>
					<div>media devices: ${identify(fp.mediaDevices)}</div>
					<div>timezone: ${identify(fp.timezone)}</div>
					
					<div>voices: ${identify(fp.voices)}</div>

					${
						!fp.screen[0] ? '<div>screen: [blocked]</div>': (() => {
							const [ scrn, hash ]  = fp.screen
							const { width, height, availWidth, availHeight, availTop, availLeft, colorDepth, pixelDepth } = scrn
							return `
							<div>
								<div>screen hash: ${hash}</div>
								<div>width: ${width !== undefined ? width : '[blocked]'}</div>
								<div>height: ${height !== undefined ? height : '[blocked]'}</div>
								<div>availWidth: ${availWidth !== undefined ? availWidth : '[blocked]'}</div>
								<div>availHeight: ${availHeight !== undefined ? availHeight : '[blocked]'}</div>
								<div>availTop: ${availTop !== undefined ? availTop : '[blocked]'}</div>
								<div>availLeft: ${availLeft !== undefined ? availLeft : '[blocked]'}</div>
								<div>colorDepth: ${colorDepth !== undefined ? colorDepth : '[blocked]'}</div>
								<div>pixelDepth: ${pixelDepth !== undefined ? pixelDepth : '[blocked]'}</div>
							</div>
							`
						})()
					}
					
					${
						!fp.nav[0] ? '<div>navigator: [blocked]</div>': (() => {
							const [ nav, hash ]  = fp.nav
							const {
								platform,
								deviceMemory,
								hardwareConcurrency,
								maxTouchPoints,
								userAgent,
								appVersion,
								language,
								vendor,
								doNotTrack
							} = nav
							return `
							<div>
								<div>navigator hash: ${hash}</div>
								<div>platform: ${platform ? platform : '[blocked or other]'}</div>
								<div>deviceMemory: ${deviceMemory ? deviceMemory : '[blocked]'}</div>
								<div>hardwareConcurrency: ${hardwareConcurrency ? hardwareConcurrency : '[blocked]'}</div>
								<div>maxTouchPoints: ${maxTouchPoints !== undefined ? maxTouchPoints : '[blocked]'}</div>
								<div>userAgent: ${userAgent ? userAgent : '[blocked]'}</div>
								<div>appVersion: ${appVersion ? appVersion : '[blocked]'}</div>
								<div>language: ${language ? language : '[blocked]'}</div>
								<div>vendor: ${vendor ? vendor : '[blocked]'}</div>
								<div>doNotTrack: ${doNotTrack !== undefined ? doNotTrack : '[blocked]'}</div>
								<div>mimeTypes: ${identify(fp.mimeTypes)}</div>
								<div>plugins: ${identify(fp.plugins)}</div>
							</div>
							`
						})()
					}

					${
						!fp.highEntropy[0] ? '<div>high entropy: [blocked or unsupported]</div>': (() => {
							const [ ua, hash ]  = fp.highEntropy
							const { architecture, model, platform, platformVersion, uaFullVersion } = ua
							return `
							<div>
								<div>high entropy hash: ${hash}</div>
								<div>ua architecture: ${architecture}</div>
								<div>ua model: ${model}</div>
								<div>ua platform: ${platform}</div>
								<div>ua platform version: ${platformVersion}</div>
								<div>ua full version: ${uaFullVersion}</div>
							</div>
							`
						})()
					}

					<span>view the console for details</span>
				</div>
			</section>
		`
		return patch(fpElem, html`${data}`)
	}).catch((e) => console.log(e))
})()
