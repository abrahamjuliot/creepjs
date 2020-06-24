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
		const type = {
			EvalError: 'EvalError', 
			InternalError: 'InternalError',
			RangeError: 'RangeError',
			ReferenceError: 'ReferenceError',
			SyntaxError: 'SyntaxError',
			TypeError: 'TypeError',
			URIError: 'URIError'
		}
		const hasInnerSpace = s => /.+(\s).+/g.test(s) // ignore AOPR noise
		console.error(error) // log error to educate
		const { name, message } = error
		const trustedMessage = hasInnerSpace(message) ? message: undefined
		const trustName = type[name] ? name : undefined
		const lineNumber = error.stack.split('\n')[4]
		const index = lineNumber.indexOf('at ')
		const lineAndIndex = lineNumber.slice(index + 2, lineNumber.length)
		errorsCaptured.push(
			{ name, trustedMessage, lineAndIndex }
		)
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
			cloneable = error.code != 25 // data clone error
			return !cloneable
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
				lieTypes.push({ newErr: '' + error.message })
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
			lieTypes.push({
				apiName: !proxyBehavior(apiName) ? apiName: true
			})
		}
		if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
			lieTypes.push({
				apiToString: !proxyBehavior(apiToString) ? apiToString: true
			})
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
		const hasInnerSpace = s => /.+(\s).+/g.test(s)
		return hasInnerSpace(str)
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
	const documentLie = (name, lieResult, lieTypes) => {
		return lieRecords.push({ name, lieTypes, hash: lieResult, lie: hashMini(lieTypes) })
	}
	
	// validate
	const isInt = (x) => typeof x == 'number' && x % 1 == 0
	const trustIntegerWithinRange = (name, val, min, max) => {
		const trusted = isInt(val) && val >= min && val <= max 
		return trusted ? val : sendToTrash(name, val)
	}

	// navigator
	const nav = () => {
		const credibleUserAgent = (
			'chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true
			// todo: additional checks
		)
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
				if ('maxTouchPoints' in navigator) {
					const { maxTouchPoints } = navigator 
					return trustIntegerWithinRange('maxTouchPoints', maxTouchPoints, 0, 100)
				}
				return null
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
			}),
			version: attempt(() => {
				const keys = Object.keys(Object.getPrototypeOf(navigator))
				return keys
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
		const { width, height, availWidth, availHeight, colorDepth, pixelDepth } = screen
		return {
			width: attempt(() => trustIntegerWithinRange('width', width, 10, 10000)),
			outerWidth: attempt(() => trustIntegerWithinRange('outerWidth', outerWidth, 10, width+20)),
			availWidth: attempt(() => trustIntegerWithinRange('availWidth', availWidth, 10, width)),
			innerWidth: attempt(() => trustIntegerWithinRange('innerWidth', innerWidth, 10, width)),
			height: attempt(() => trustIntegerWithinRange('height', height, 10, 10000)),
			outerHeight: attempt(() => trustIntegerWithinRange('outerHeight', outerHeight, 10, height+20)),
			availHeight: attempt(() => trustIntegerWithinRange('availHeight', availHeight, 10, height)),
			innerHeight: attempt(() => trustIntegerWithinRange('innerHeight', innerHeight, 10, height)),
			colorDepth: attempt(() => trustIntegerWithinRange('colorDepth', colorDepth, 2, 1000)),
			pixelDepth: attempt(() => trustIntegerWithinRange('pixelDepth', pixelDepth, 2, 1000))
		}
	}

	// voices
	const getVoices = () => {
		const undfn = new Promise(resolve => resolve(undefined))
		/* block till Tor Browser fix */
		return undfn
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
	const canvasToDataURL = attempt(() => HTMLCanvasElement.prototype.toDataURL)
	const canvasGetContext = attempt(() => HTMLCanvasElement.prototype.getContext)
	const dataLie = canvasToDataURL ? hasLiedAPI(canvasToDataURL, 'toDataURL').lie : false
	const contextLie = canvasGetContext ? hasLiedAPI(canvasGetContext, 'getContext').lie : false
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
			return isBrave ? sendToTrash('canvas2dDataURI', hashMini(canvas2dDataURI)) : canvas2dDataURI
		}
		
		// document lie and send to trash
		canvas2dDataURI = canvas.toDataURL()
		const canvas2dContextDataURI = canvas2dDataURI
		if (contextLie) {
			const contextHash = hashMini(canvas2dContextDataURI)
			documentLie('canvas2dContextDataURI', contextHash, contextLie)
			sendToTrash('canvas2dContextDataURI', contextHash)
		}
		if (dataLie) {
			const dataHash = hashMini(canvas2dDataURI)
			documentLie('canvas2dDataURI', dataHash, dataLie)
			sendToTrash('canvas2dDataURI', dataHash)
		}
		
		// fingerprint lie
		return { dataLie, contextLie }
	}

	// webgl
	const webgl = () => {
		const webglGetParameter = attempt(() => WebGLRenderingContext.prototype.getParameter)
		const webglGetExtension = attempt(() => WebGLRenderingContext.prototype.getExtension)
		const paramLie = webglGetParameter ? hasLiedAPI(webglGetParameter, 'getParameter').lie : false
		const extLie = webglGetExtension ? hasLiedAPI(webglGetExtension, 'getExtension').lie : false
		const canvas = document.createElement('canvas')
		const context = canvas.getContext('webgl')

		return {
			unmasked: (() => {
				try {
					const extension = context.getExtension('WEBGL_debug_renderer_info')
					const vendor = extension && context.getParameter(extension.UNMASKED_VENDOR_WEBGL)
					const renderer = extension && context.getParameter(extension.UNMASKED_RENDERER_WEBGL)

					if (!paramLie && !extLie) {
						if (!credibleRenderer(renderer)) {
							return {
								vendor: sendToTrash('webglVendor', vendor),
								renderer: sendToTrash('webglRenderer', renderer)
							}
						}
						
						return {
							vendor: (
								isBrave && isBrave.blockingFingerprintingStrict ? sendToTrash('webglVendor', vendor) : 
								!proxyBehavior(vendor) ? vendor : 
								sendToTrash('webglVendor', 'proxy behavior detected')
							),
							renderer: (
								isBrave && isBrave.blockingFingerprintingStrict ? sendToTrash('webglRenderer', renderer) :
								!proxyBehavior(renderer) ? renderer : 
								sendToTrash('webglRenderer', 'proxy behavior detected')
							)
						}
					}

					// document lie and send to trash
					const webglVendorAndRendererParameter = `${vendor}, ${renderer}`
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
						vendor: isBrave && isBrave.blockingFingerprintingStrict ? sendToTrash('webglVendor', null) : undefined,
						renderer: isBrave && isBrave.blockingFingerprintingStrict ? sendToTrash('webglRenderer', null) : undefined
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
						return isBrave ? sendToTrash('canvasWebglDataURI', hashMini(canvasWebglDataURI)) : canvasWebglDataURI
					}
					
					// document lie and send to trash
					canvasWebglDataURI = canvas.toDataURL()
					const canvasWebglContextDataURI = canvasWebglDataURI
					if (contextLie) {
						contextHash = hashMini(canvasWebglContextDataURI)
						documentLie('canvasWebglContextDataURI', contextHash, contextLie)
						sendToTrash('canvasWebglContextDataURI', contextHash)
					}
					if (dataLie) {
						const dataHash = hashMini(canvasWebglDataURI)
						documentLie('canvasWebglDataURI', dataHash, dataLie)
						sendToTrash('canvasWebglDataURI', dataHash)
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
		const dateGetTimezoneOffset = attempt(() => Date.prototype.getTimezoneOffset)
		const timezoneLie = dateGetTimezoneOffset ? hasLiedAPI(dateGetTimezoneOffset, 'getTimezoneOffset').lie : false

		const timezoneOffset_1 = new Date().getTimezoneOffset()
		if (!timezoneLie) {
			const notWithinParentheses = /.*\(|\).*/g
			const utc = Date.parse(new Date().toJSON().split`Z`.join``)
			const now = +new Date()
			const timezoneOffset_2 = (utc - now)/60000
			const trusted = timezoneOffset_1 == timezoneOffset_2
			const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
			const timezone = (''+new Date()).replace(notWithinParentheses, '')
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
		const rectContainer = document.getElementById('rect-container')
		const removeRectsFromDom = () => rectContainer.parentNode.removeChild(rectContainer)
		const elementGetClientRects = attempt(() => Element.prototype.getClientRects)
		const rectsLie = (
			elementGetClientRects ? hasLiedAPI(elementGetClientRects, 'getClientRects').lie : false
		)
		const cRectProps = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left']
		const rectElems = document.getElementsByClassName('rects')
		const clientRects = [...rectElems].map(el => el.getClientRects()[0].toJSON())

		if (!rectsLie) {
			removeRectsFromDom()
			return clientRects
		}
		
		// document lie and send to trash
		if (rectsLie) {
			documentLie('clientRects', hashMini(clientRects), rectsLie)
			sendToTrash('clientRects', hashMini(clientRects))
		}

		// Fingerprint lie
		removeRectsFromDom()
		return { rectsLie }
	}

	// scene
	const scene = html`
	<fingerprint>
		<div id="fingerprint"></div>
		
		<div id="rect-container">
			<style>
			.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#F72585;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#7209B7;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#3A0CA3;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#4361EE;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#4CC9F0;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#F72585;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#4361EE}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#3A0CA3}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#7209B7}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#F72585}
			</style>
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
		const navVersion = navComputed ? navComputed.version : undefined
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
		
		// Compile property names sent to the trashBin (exclude trash values)
		const trashComputed = trashBin.map(trash => trash.name)

		// Compile name and lie type values from lie records (exclude random lie results)
		const liesComputed = lieRecords.map(lie => {
			const { name, lieTypes } = lie
			return { name, lieTypes }
		})

		// await hash values
		const hashTimer = timer('hashing values...')
		const [
			navHash, // order must match
			mimeTypesHash,
			pluginsHash,
			navVersionHash,
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
			errorsCapturedHash,
			trashHash,
			liesHash
		] = await Promise.all([
			hashify(navComputed),
			hashify(mimeTypes),
			hashify(plugins),
			hashify(navVersion),
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
			hashify(errorsCaptured),
			hashify(trashComputed),
			hashify(liesComputed)
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
			navVersion: [navVersion, navVersionHash],
			voices: [voicesComputed, voicesHash],
			mediaDevices: [mediaDevicesComputed, mediaDeviceHash],
			screen: [screenComputed, screenHash],
			webglDataURL: [webglDataURLComputed, weglDataURLHash],
			consoleErrors: [consoleErrorsComputed, consoleErrorsHash],
			cRects: [cRectsComputed, cRectsHash],
			maths: [mathsComputed, mathsHash],
			canvas: [canvasComputed, canvasHash],
			errorsCaptured: [errorsCaptured, errorsCapturedHash],
			trash: [trashComputed, trashHash],
			lies: [liesComputed, liesHash]
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

		// Purified Fingerprint
		const creep = {
			timezone: fp.timezone,
			renderer: fp.webgl[0].renderer,
			vendor: fp.webgl[0].vendor,
			webglDataURL: fp.webglDataURL,
			consoleErrors: fp.consoleErrors,
			trash: fp.trash,
			lies: fp.lies,
			cRects: fp.cRects,
			maths: fp.maths,
			canvas: fp.canvas
		}
		const log = (message, obj) => console.log(message, JSON.stringify(obj, null, '\t'))

		console.log('Fingerprint Id (Object)', fp)
		log('Fingerprint Id (JSON)', fp)
		
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
		
		// symbol notes
		const note = { blocked: '<span class="blocked">blocked</span>'}

		// identify known hash
		const identify = prop => {
			const torBrowser = (
				/* geo.enabled can be set to true or false:
				Geolocation is in window of Firefox
				Geolocation is not in the window of Tor Browser
				*/
				!('Geolocation' in window)
			)
			const catchTorBrowser = (
				torBrowser ? 'Tor Browser' : 'Firefox'
			)
			const catchTorBrowserResist = (
				torBrowser ? 'Tor Browser (pending permission or blocked temporarily)' : 'Firefox (privacy.resistFingerprinting)'
			)
			const catchTorBrowserAllow = (
				torBrowser ? 'Tor Browser' : 'Firefox (privacy.resistFingerprinting)'
			)
			const known = {
				'0df25df426d0ce052d04482c0c2cd4d874ae7a4da4feb430be36150a770f3b6b': 'Browser Plugs',
				'65069db4579c03d49fde85983c905817c8798cad3ad6b39dd93df24bde1449c9': 'Browser Plugs',
				'3ac278638742f3475dcd69559fd1d12e01eefefffe3df66f9129d35635fc3311': 'Browser Plugs',
				'e9f96e6b7f0b93f9d7677f0e270c97d6fa12cbbe3134ab5f906d152f57953e72': 'Browser Plugs',
				'0c3156fbce7624886a6a5485d3fabfb8038f9b656de01100392b2cebf354106d': 'Browser Plugs',
				'94e40669f496f2cef69cc289f3ee50dc442ced21fb42a88bc223270630002556': 'Canvas Fingerprint Defender',
				'ea43a000cd99bbe3fcd6861a2a5b9da1cba4c75c5ed7756f19562a8b5e034018': 'Privacy Possom',
				'1a2e56badfca47209ba445811f27e848b4c2dae58224445a4af3d3581ffe7561': 'Privacy Possom',
				'e5c60fb55b35e96ec8482d4cfccb2e3b8245ef2a148c96a473ee7e526a2f21c5': 'Privacy Badger or similar',
				'785acfe6b266709e167dcc85fdd5697798cfdb1dcb9bed4eab42f422117ebaab': 'Trace',
				'c53d59bceea14b20c5b2a0680457314fc04f71c240604ced26ff37f42242ff0e': 'Trace',
				'96fc9e8167ed27c6f45442df78619601955728422a111e02c08cd5af94378d34': 'Trace',
				'7757f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5': 'Chromium',
				'21f2f6f397db5fa611029154c35cd96eb9a96c4f1c993d4c3a25da765f2dd13b': catchTorBrowser,
				'e086050038b44b8dcb9d0565da3ff448a0162da7023469d347303479f981f5fd': catchTorBrowserAllow,
				'0a1a099e6b0a7365acfdf38ed79c9cde9ec0617b0c39b6366dad4d1a4aa6fcaf': catchTorBrowser,
				'99dfbc2000c9c81588259515fed8a1f6fbe17bf9964c850560d08d0bfabc1fff': catchTorBrowserResist
			}

			const [ data, hash ] = prop
			const iterable = Symbol.iterator in Object(data)
			return (
				!data || (iterable && !data.length) ? note.blocked :
				known[hash] ? `<span class="known">${known[hash]}</span>` : hash
			)
		}
		const pluralify = (len) => len > 1 ? 's' : ''
		// template
		const data = `
			<section>
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
						!trashBin.length ? '<div>trash: ✔️ [none]</div>': (() => {
							const plural = pluralify(trashBin.length)
							const hash = fp.trash[1]
							return `
							<div class="trash">
								<strong>🤮 ${trashBin.length} API${plural} are counted as trash</strong>
								<div>trash hash: ${hash}</div>
								${trashBin.map(item => `<div>${item.name} - ${item.value}</div>`).join('')}
							</div>
							`
						})()
					}

					${
						!lieRecords.length ? '<div>lies: ✔️ [none]</div>': (() => {
							const plural = pluralify(lieRecords.length)
							const hash = fp.lies[1]
							return `
							<div class="lies">
								<strong>🤥 ${lieRecords.length} API lie${plural} detected</strong>
								<div>lie hash: ${hash}</div>
								${lieRecords.map(item => `<div>${item.name} Lie Fingerprint: ${item.lie}</div>`).join('')}
							</div>
							`
						})()
					}

					${
						!fp.errorsCaptured[0].length ? `<div>errors captured: ✔️ [none]</div>`: (() => {
							const [ errors, hash ]  = fp.errorsCaptured
							return `
							<div class="errors">
								<div>🧐 errors captured hash: ${hash}</div>
								${
									errors.map(err => {
										return `
										<div>
											${err.name}: ${err.trustedMessage} - ${err.lineAndIndex}
										</div>`
									}).join('')
								}
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
							isBrave && isBrave.blockingFingerprintingStrict ? 'Brave Browser' : 
							isString && renderer ? renderer : 
							!renderer ? note.blocked : identify(fp.webgl)
						)
					})()}</div>
					<div>webgl vendor: ${(() => {
						const [ data, hash ] = fp.webgl
						const { vendor } = data
						const isString = typeof vendor == 'string'
						return (
							isBrave && isBrave.blockingFingerprintingStrict ? 'Brave Browser' : 
							isString && vendor ? vendor : 
							!vendor ? note.blocked : identify(fp.webgl)
						)
					})()}</div>
					<div>client rects: ${identify(fp.cRects)}</div>
					<div>console errors: ${identify(fp.consoleErrors)}</div>	
					<div>maths: ${identify(fp.maths)}</div>
					<div>media devices: ${identify(fp.mediaDevices)}</div>
					<div>timezone: ${identify(fp.timezone)}</div>
					
					<div>voices: ${identify(fp.voices)}</div>

					${
						!fp.screen[0] ? `<div>screen: ${note.blocked}</div>`: (() => {
							const [ scrn, hash ]  = fp.screen
							return `
							<div>
								<div>screen hash: ${hash}</div>
								${
									Object.entries(scrn).map(([key, value]) => {
										return `<div>${key}: ${value ? value : note.blocked}</div>`
									}).join('')
								}
							</div>
							`
						})()
					}
					
					${
						!fp.nav[0] ? `<div>navigator: ${note.blocked}</div>`: (() => {
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
								<div>version: ${identify(fp.navVersion)}</div>
								<div>platform: ${platform ? platform : `${note.blocked} or other`}</div>
								<div>deviceMemory: ${deviceMemory ? deviceMemory : note.blocked}</div>
								<div>hardwareConcurrency: ${hardwareConcurrency ? hardwareConcurrency : note.blocked}</div>
								<div>maxTouchPoints: ${maxTouchPoints !== undefined ? maxTouchPoints : note.blocked}</div>
								<div>userAgent: ${userAgent ? userAgent : note.blocked}</div>
								<div>appVersion: ${appVersion ? appVersion : note.blocked}</div>
								<div>language: ${language ? language : note.blocked}</div>
								<div>vendor: ${vendor ? vendor : note.blocked}</div>
								<div>doNotTrack: ${doNotTrack !== undefined ? doNotTrack : note.blocked}</div>
								<div>mimeTypes: ${identify(fp.mimeTypes)}</div>
								<div>plugins: ${identify(fp.plugins)}</div>
							</div>
							`
						})()
					}

					${
						!fp.highEntropy[0] ? `<div>high entropy: ${note.blocked} or unsupported</div>`: (() => {
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

				</div>
			</section>
		`
		return patch(fpElem, html`${data}`)
	}).catch((e) => console.log(e))
})()