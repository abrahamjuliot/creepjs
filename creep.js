(function() {
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
			Error: true,
			EvalError: true, 
			InternalError: true,
			RangeError: true,
			ReferenceError: true,
			SyntaxError: true,
			TypeError: true,
			URIError: true
		}
		const hasInnerSpace = s => /.+(\s).+/g.test(s) // ignore AOPR noise
		console.error(error) // log error to educate
		const { name, message } = error
		const trustedMessage = hasInnerSpace(message) ? message: undefined
		const trustedName = type[name] ? name : undefined
		const lineNumber = error.stack.split('\n')[2]
		const index = lineNumber.indexOf('at ')
		const lineAndIndex = lineNumber.slice(index + 2, lineNumber.length)
		errorsCaptured.push(
			{ trustedName, trustedMessage }
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
		const jsonBuffer = new TextEncoder().encode(json)
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
		try {
			window.postMessage(obj, location)
			return false
		} catch (error) {
			const cloneable = error.code != 25 // data clone error	
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

	// Detect Brave Browser and strict fingerprinting blocking
	const brave = () => 'brave' in navigator ? true : false
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
	const trustInteger = (name, val) => {
		const trusted = isInt(val) 
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
				return deviceMemory ? trustInteger('deviceMemory', deviceMemory) : undefined
			}),
			doNotTrack: attempt(() => {
				const { doNotTrack } = navigator
				const trusted = {
					'1': true,
					'true': true, 
					'yes': true,
					'0': true, 
					'false': true, 
					'no': true, 
					'unspecified': true, 
					'null': true
				}
				return trusted[doNotTrack] ? doNotTrack : doNotTrack ? sendToTrash('doNotTrack', doNotTrack) : undefined
			}),
			hardwareConcurrency: attempt(() => {
				const { hardwareConcurrency } = navigator 
				return trustInteger('hardwareConcurrency', hardwareConcurrency)
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
					return trustInteger('maxTouchPoints', maxTouchPoints)
				}
				return null
			}),
			platform: attempt(() => {
				const { platform } = navigator
				const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11']
				const trusted = systems.filter(val => platform.toLowerCase().includes(val))[0]
				return trusted ? platform : undefined
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
			return !('userAgentData' in navigator) ? undfnd : 
				attempt(() => navigator.userAgentData.getHighEntropyValues(
					['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
				))
		}
		catch(error) {
			captureError(error)
			return new Promise(resolve => resolve(undefined))
		}
	}

	// screen (allow some discrepancies otherwise lie detection triggers at random)
	const screenFp = () => {	
		const { width, height, availWidth, availHeight, colorDepth, pixelDepth } = screen
		return {
			width: attempt(() => trustInteger('width', width)),
			outerWidth: attempt(() => trustInteger('outerWidth', outerWidth)),
			availWidth: attempt(() => trustInteger('availWidth', availWidth)),
			height: attempt(() => trustInteger('height', height)),
			outerHeight: attempt(() => trustInteger('outerHeight', outerHeight)),
			availHeight: attempt(() => trustInteger('availHeight', availHeight)),
			colorDepth: attempt(() => trustInteger('colorDepth', colorDepth)),
			pixelDepth: attempt(() => trustInteger('pixelDepth', pixelDepth))
		}
	}

	// voices
	const getVoices = () => {
		const undfn = new Promise(resolve => resolve(undefined))
		
		try {
			if (!('chrome' in window)) {
				return speechSynthesis.getVoices()
			}
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
						return {
							vendor: (
								isBrave ? sendToTrash('webglVendor', vendor) : 
								!proxyBehavior(vendor) ? vendor : 
								sendToTrash('webglVendor', 'proxy behavior detected')
							),
							renderer: (
								isBrave ? sendToTrash('webglRenderer', renderer) :
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
						vendor: isBrave ? sendToTrash('webglVendor', null) : undefined,
						renderer: isBrave ? sendToTrash('webglRenderer', null) : undefined
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
						const contextHash = hashMini(canvasWebglContextDataURI)
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
		const computeTimezoneOffset = () => {
			const toJSONParsed = (x) => JSON.parse(JSON.stringify(x))
			const utc = Date.parse(toJSONParsed(new Date()).split`Z`.join``)
			const now = +new Date()
			return +(((utc - now)/60000).toFixed(2))
		}		
		const dateGetTimezoneOffset = attempt(() => Date.prototype.getTimezoneOffset)
		const timezoneLie = dateGetTimezoneOffset ? hasLiedAPI(dateGetTimezoneOffset, 'getTimezoneOffset').lie : false
		const timezoneOffset = new Date().getTimezoneOffset()
		let trusted = true
		if (!timezoneLie) {
			const timezoneOffsetComputed = computeTimezoneOffset()
			trusted = timezoneOffsetComputed == timezoneOffset
			const notWithinParentheses = /.*\(|\).*/g
			const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
			const timezone = (''+new Date()).replace(notWithinParentheses, '')
			return trusted ? { timezoneOffsetComputed, timezoneOffset, timezoneLocation, timezone } : undefined
		}

		// document lie and send to trash
		if (timezoneLie) {
			documentLie('timezoneOffset', timezoneOffset, timezoneLie)
		}
		if (timezoneLie || !trusted) {
			sendToTrash('timezoneOffset', timezoneOffset)
		}

		// Fingerprint lie
		return { timezoneLie }
	}

	// client rects
	const cRects = () => {
		const toJSONParsed = (x) => JSON.parse(JSON.stringify(x))
		const rectContainer = document.getElementById('rect-container')
		const removeRectsFromDom = () => rectContainer.parentNode.removeChild(rectContainer)
		const elementGetClientRects = attempt(() => Element.prototype.getClientRects)
		const rectsLie = (
			elementGetClientRects ? hasLiedAPI(elementGetClientRects, 'getClientRects').lie : false
		)
		const cRectProps = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left']
		const rectElems = document.getElementsByClassName('rects')
		const clientRects = [...rectElems].map(el => {
			return toJSONParsed(el.getClientRects()[0])
		})

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


	const style = ` > span{position:absolute;left:-9999px;fontSize:100px;fontStyle:normal;fontWeight:normal;letterSpacing:normal;lineBreak:auto;lineHeight:normal;textTransform:none;textAlign:left;textDecoration:none;textShadow:none;whiteSpace:normal;wordBreak:normal;wordSpacing:normal}`

	const fontDetector = () => {
		const toInt = val => ~~val // protect against decimal noise
		const baseFonts = ['monospace', 'sans-serif', 'serif']
		const text = 'mmmmmmmmmmlli'
		const baseOffsetWidth = {}
		const baseOffsetHeight = {}
		const baseFontSpan = font => {
			return `<span class="basefont" data-font="${font}" style="font-family: '${font}'">${text}</span>`
		}
		const systemFontSpan = (font, basefont) => {
			return `<span class="system-font" data-font="${font}" data-basefont="${basefont}" style="font-family: ${`'${font}', '${basefont}'`}">${text}</span>`
		}
		const detect = fonts => {
			const fontsElem = document.getElementById('font-detector')
			const stageElem = document.getElementById('font-detector-stage')
			const detectedFonts = []
			patch(stageElem, html`
					<div id="font-detector-test">
						<style>#font-detector-test${style}</style>
						${baseFonts.map(font => baseFontSpan(font)).join('')}
						${
								fonts.map(font => {
									const template = `
									${systemFontSpan(font, baseFonts[0])}
									${systemFontSpan(font, baseFonts[1])}
									${systemFontSpan(font, baseFonts[2])}
									`
									return template
								}).join('')
						}
					</div>
				`,
				() => {
					const testElem = document.getElementById('font-detector-test')
					const basefontElems = document.querySelectorAll('#font-detector-test .basefont')
					const systemFontElems = document.querySelectorAll('#font-detector-test .system-font')
					;[...basefontElems].forEach(span => {
						const { dataset: { font }, offsetWidth, offsetHeight } = span
						baseOffsetWidth[font] = toInt(offsetWidth)
						baseOffsetHeight[font] = toInt(offsetHeight)
						return
					})
					;[...systemFontElems].forEach(span => {
						const { dataset: { basefont, font }, offsetWidth, offsetHeight } = span
						const widthMatchesBase = toInt(offsetWidth) == baseOffsetWidth[basefont]
						const heightMatchesBase = toInt(offsetHeight) == baseOffsetHeight[basefont]
						const detected = !widthMatchesBase || !heightMatchesBase
						if (detected) { detectedFonts.push(font) }
						return
					})
					return fontsElem.removeChild(testElem)
				}
			)
			return [...new Set(detectedFonts)] // remove dups
		}
		return detect
	}
	const detectFonts = fontDetector()

	const fontList=["Andale Mono","Arial","Arial Black","Arial Hebrew","Arial MT","Arial Narrow","Arial Rounded MT Bold","Arial Unicode MS","Bitstream Vera Sans Mono","Book Antiqua","Bookman Old Style","Calibri","Cambria","Cambria Math","Century","Century Gothic","Century Schoolbook","Comic Sans","Comic Sans MS","Consolas","Courier","Courier New","Geneva","Georgia","Helvetica","Helvetica Neue","Impact","Lucida Bright","Lucida Calligraphy","Lucida Console","Lucida Fax","LUCIDA GRANDE","Lucida Handwriting","Lucida Sans","Lucida Sans Typewriter","Lucida Sans Unicode","Microsoft Sans Serif","Monaco","Monotype Corsiva","MS Gothic","MS Outlook","MS PGothic","MS Reference Sans Serif","MS Sans Serif","MS Serif","MYRIAD","MYRIAD PRO","Palatino","Palatino Linotype","Segoe Print","Segoe Script","Segoe UI","Segoe UI Light","Segoe UI Semibold","Segoe UI Symbol","Tahoma","Times","Times New Roman","Times New Roman PS","Trebuchet MS","Verdana","Wingdings","Wingdings 2","Wingdings 3"],extendedFontList=["Abadi MT Condensed Light","Academy Engraved LET","ADOBE CASLON PRO","Adobe Garamond","ADOBE GARAMOND PRO","Agency FB","Aharoni","Albertus Extra Bold","Albertus Medium","Algerian","Amazone BT","American Typewriter","American Typewriter Condensed","AmerType Md BT","Andalus","Angsana New","AngsanaUPC","Antique Olive","Aparajita","Apple Chancery","Apple Color Emoji","Apple SD Gothic Neo","Arabic Typesetting","ARCHER","ARNO PRO","Arrus BT","Aurora Cn BT","AvantGarde Bk BT","AvantGarde Md BT","AVENIR","Ayuthaya","Bandy","Bangla Sangam MN","Bank Gothic","BankGothic Md BT","Baskerville","Baskerville Old Face","Batang","BatangChe","Bauer Bodoni","Bauhaus 93","Bazooka","Bell MT","Bembo","Benguiat Bk BT","Berlin Sans FB","Berlin Sans FB Demi","Bernard MT Condensed","BernhardFashion BT","BernhardMod BT","Big Caslon","BinnerD","Blackadder ITC","BlairMdITC TT","Bodoni 72","Bodoni 72 Oldstyle","Bodoni 72 Smallcaps","Bodoni MT","Bodoni MT Black","Bodoni MT Condensed","Bodoni MT Poster Compressed","Bookshelf Symbol 7","Boulder","Bradley Hand","Bradley Hand ITC","Bremen Bd BT","Britannic Bold","Broadway","Browallia New","BrowalliaUPC","Brush Script MT","Californian FB","Calisto MT","Calligrapher","Candara","CaslonOpnface BT","Castellar","Centaur","Cezanne","CG Omega","CG Times","Chalkboard","Chalkboard SE","Chalkduster","Charlesworth","Charter Bd BT","Charter BT","Chaucer","ChelthmITC Bk BT","Chiller","Clarendon","Clarendon Condensed","CloisterBlack BT","Cochin","Colonna MT","Constantia","Cooper Black","Copperplate","Copperplate Gothic","Copperplate Gothic Bold","Copperplate Gothic Light","CopperplGoth Bd BT","Corbel","Cordia New","CordiaUPC","Cornerstone","Coronet","Cuckoo","Curlz MT","DaunPenh","Dauphin","David","DB LCD Temp","DELICIOUS","Denmark","DFKai-SB","Didot","DilleniaUPC","DIN","DokChampa","Dotum","DotumChe","Ebrima","Edwardian Script ITC","Elephant","English 111 Vivace BT","Engravers MT","EngraversGothic BT","Eras Bold ITC","Eras Demi ITC","Eras Light ITC","Eras Medium ITC","EucrosiaUPC","Euphemia","Euphemia UCAS","EUROSTILE","Exotc350 Bd BT","FangSong","Felix Titling","Fixedsys","FONTIN","Footlight MT Light","Forte","FrankRuehl","Fransiscan","Freefrm721 Blk BT","FreesiaUPC","Freestyle Script","French Script MT","FrnkGothITC Bk BT","Fruitger","FRUTIGER","Futura","Futura Bk BT","Futura Lt BT","Futura Md BT","Futura ZBlk BT","FuturaBlack BT","Gabriola","Galliard BT","Gautami","Geeza Pro","Geometr231 BT","Geometr231 Hv BT","Geometr231 Lt BT","GeoSlab 703 Lt BT","GeoSlab 703 XBd BT","Gigi","Gill Sans","Gill Sans MT","Gill Sans MT Condensed","Gill Sans MT Ext Condensed Bold","Gill Sans Ultra Bold","Gill Sans Ultra Bold Condensed","Gisha","Gloucester MT Extra Condensed","GOTHAM","GOTHAM BOLD","Goudy Old Style","Goudy Stout","GoudyHandtooled BT","GoudyOLSt BT","Gujarati Sangam MN","Gulim","GulimChe","Gungsuh","GungsuhChe","Gurmukhi MN","Haettenschweiler","Harlow Solid Italic","Harrington","Heather","Heiti SC","Heiti TC","HELV","Herald","High Tower Text","Hiragino Kaku Gothic ProN","Hiragino Mincho ProN","Hoefler Text","Humanst 521 Cn BT","Humanst521 BT","Humanst521 Lt BT","Imprint MT Shadow","Incised901 Bd BT","Incised901 BT","Incised901 Lt BT","INCONSOLATA","Informal Roman","Informal011 BT","INTERSTATE","IrisUPC","Iskoola Pota","JasmineUPC","Jazz LET","Jenson","Jester","Jokerman","Juice ITC","Kabel Bk BT","Kabel Ult BT","Kailasa","KaiTi","Kalinga","Kannada Sangam MN","Kartika","Kaufmann Bd BT","Kaufmann BT","Khmer UI","KodchiangUPC","Kokila","Korinna BT","Kristen ITC","Krungthep","Kunstler Script","Lao UI","Latha","Leelawadee","Letter Gothic","Levenim MT","LilyUPC","Lithograph","Lithograph Light","Long Island","Lydian BT","Magneto","Maiandra GD","Malayalam Sangam MN","Malgun Gothic","Mangal","Marigold","Marion","Marker Felt","Market","Marlett","Matisse ITC","Matura MT Script Capitals","Meiryo","Meiryo UI","Microsoft Himalaya","Microsoft JhengHei","Microsoft New Tai Lue","Microsoft PhagsPa","Microsoft Tai Le","Microsoft Uighur","Microsoft YaHei","Microsoft Yi Baiti","MingLiU","MingLiU_HKSCS","MingLiU_HKSCS-ExtB","MingLiU-ExtB","Minion","Minion Pro","Miriam","Miriam Fixed","Mistral","Modern","Modern No. 20","Mona Lisa Solid ITC TT","Mongolian Baiti","MONO","MoolBoran","Mrs Eaves","MS LineDraw","MS Mincho","MS PMincho","MS Reference Specialty","MS UI Gothic","MT Extra","MUSEO","MV Boli","Nadeem","Narkisim","NEVIS","News Gothic","News GothicMT","NewsGoth BT","Niagara Engraved","Niagara Solid","Noteworthy","NSimSun","Nyala","OCR A Extended","Old Century","Old English Text MT","Onyx","Onyx BT","OPTIMA","Oriya Sangam MN","OSAKA","OzHandicraft BT","Palace Script MT","Papyrus","Parchment","Party LET","Pegasus","Perpetua","Perpetua Titling MT","PetitaBold","Pickwick","Plantagenet Cherokee","Playbill","PMingLiU","PMingLiU-ExtB","Poor Richard","Poster","PosterBodoni BT","PRINCETOWN LET","Pristina","PTBarnum BT","Pythagoras","Raavi","Rage Italic","Ravie","Ribbon131 Bd BT","Rockwell","Rockwell Condensed","Rockwell Extra Bold","Rod","Roman","Sakkal Majalla","Santa Fe LET","Savoye LET","Sceptre","Script","Script MT Bold","SCRIPTINA","Serifa","Serifa BT","Serifa Th BT","ShelleyVolante BT","Sherwood","Shonar Bangla","Showcard Gothic","Shruti","Signboard","SILKSCREEN","SimHei","Simplified Arabic","Simplified Arabic Fixed","SimSun","SimSun-ExtB","Sinhala Sangam MN","Sketch Rockwell","Skia","Small Fonts","Snap ITC","Snell Roundhand","Socket","Souvenir Lt BT","Staccato222 BT","Steamer","Stencil","Storybook","Styllo","Subway","Swis721 BlkEx BT","Swiss911 XCm BT","Sylfaen","Synchro LET","System","Tamil Sangam MN","Technical","Teletype","Telugu Sangam MN","Tempus Sans ITC","Terminal","Thonburi","Traditional Arabic","Trajan","TRAJAN PRO","Tristan","Tubular","Tunga","Tw Cen MT","Tw Cen MT Condensed","Tw Cen MT Condensed Extra Bold","TypoUpright BT","Unicorn","Univers","Univers CE 55 Medium","Univers Condensed","Utsaah","Vagabond","Vani","Vijaya","Viner Hand ITC","VisualUI","Vivaldi","Vladimir Script","Vrinda","Westminster","WHITNEY","Wide Latin","ZapfEllipt BT","ZapfHumnst BT","ZapfHumnst Dm BT","Zapfino","Zurich BlkEx BT","Zurich Ex BT","ZWAdobeF"],googleFonts=["ABeeZee","Abel","Abhaya Libre","Abril Fatface","Aclonica","Acme","Actor","Adamina","Advent Pro","Aguafina Script","Akronim","Aladin","Aldrich","Alef","Alegreya","Alegreya SC","Alegreya Sans","Alegreya Sans SC","Aleo","Alex Brush","Alfa Slab One","Alice","Alike","Alike Angular","Allan","Allerta","Allerta Stencil","Allura","Almarai","Almendra","Almendra Display","Almendra SC","Amarante","Amaranth","Amatic SC","Amethysta","Amiko","Amiri","Amita","Anaheim","Andada","Andika","Angkor","Annie Use Your Telescope","Anonymous Pro","Antic","Antic Didone","Antic Slab","Anton","Arapey","Arbutus","Arbutus Slab","Architects Daughter","Archivo","Archivo Black","Archivo Narrow","Aref Ruqaa","Arima Madurai","Arimo","Arizonia","Armata","Arsenal","Artifika","Arvo","Arya","Asap","Asap Condensed","Asar","Asset","Assistant","Astloch","Asul","Athiti","Atma","Atomic Age","Aubrey","Audiowide","Autour One","Average","Average Sans","Averia Gruesa Libre","Averia Libre","Averia Sans Libre","Averia Serif Libre","B612","B612 Mono","Bad Script","Bahiana","Bahianita","Bai Jamjuree","Baloo","Baloo Bhai","Baloo Bhaijaan","Baloo Bhaina","Baloo Chettan","Baloo Da","Baloo Paaji","Baloo Tamma","Baloo Tammudu","Baloo Thambi","Balthazar","Bangers","Barlow","Barlow Condensed","Barlow Semi Condensed","Barriecito","Barrio","Basic","Battambang","Baumans","Bayon","Be Vietnam","Bebas Neue","Belgrano","Bellefair","Belleza","BenchNine","Bentham","Berkshire Swash","Beth Ellen","Bevan","Big Shoulders Display","Big Shoulders Text","Bigelow Rules","Bigshot One","Bilbo","Bilbo Swash Caps","BioRhyme","BioRhyme Expanded","Biryani","Bitter","Black And White Picture","Black Han Sans","Black Ops One","Blinker","Bokor","Bonbon","Boogaloo","Bowlby One","Bowlby One SC","Brawler","Bree Serif","Bubblegum Sans","Bubbler One","Buda","Buenard","Bungee","Bungee Hairline","Bungee Inline","Bungee Outline","Bungee Shade","Butcherman","Butterfly Kids","Cabin","Cabin Condensed","Cabin Sketch","Caesar Dressing","Cagliostro","Cairo","Calligraffitti","Cambay","Cambo","Candal","Cantarell","Cantata One","Cantora One","Capriola","Cardo","Carme","Carrois Gothic","Carrois Gothic SC","Carter One","Catamaran","Caudex","Caveat","Caveat Brush","Cedarville Cursive","Ceviche One","Chakra Petch","Changa","Changa One","Chango","Charm","Charmonman","Chathura","Chau Philomene One","Chela One","Chelsea Market","Chenla","Cherry Cream Soda","Cherry Swash","Chewy","Chicle","Chilanka","Chivo","Chonburi","Cinzel","Cinzel Decorative","Clicker Script","Coda","Coda Caption","Codystar","Coiny","Combo","Comfortaa","Coming Soon","Concert One","Condiment","Content","Contrail One","Convergence","Cookie","Copse","Corben","Cormorant","Cormorant Garamond","Cormorant Infant","Cormorant SC","Cormorant Unicase","Cormorant Upright","Courgette","Cousine","Coustard","Covered By Your Grace","Crafty Girls","Creepster","Crete Round","Crimson Pro","Crimson Text","Croissant One","Crushed","Cuprum","Cute Font","Cutive","Cutive Mono","DM Sans","DM Serif Display","DM Serif Text","Damion","Dancing Script","Dangrek","Darker Grotesque","David Libre","Dawning of a New Day","Days One","Dekko","Delius","Delius Swash Caps","Delius Unicase","Della Respira","Denk One","Devonshire","Dhurjati","Didact Gothic","Diplomata","Diplomata SC","Do Hyeon","Dokdo","Domine","Donegal One","Doppio One","Dorsa","Dosis","Dr Sugiyama","Duru Sans","Dynalight","EB Garamond","Eagle Lake","East Sea Dokdo","Eater","Economica","Eczar","El Messiri","Electrolize","Elsie","Elsie Swash Caps","Emblema One","Emilys Candy","Encode Sans","Encode Sans Condensed","Encode Sans Expanded","Encode Sans Semi Condensed","Encode Sans Semi Expanded","Engagement","Englebert","Enriqueta","Erica One","Esteban","Euphoria Script","Ewert","Exo","Exo 2","Expletus Sans","Fahkwang","Fanwood Text","Farro","Farsan","Fascinate","Fascinate Inline","Faster One","Fasthand","Fauna One","Faustina","Federant","Federo","Felipa","Fenix","Finger Paint","Fira Code","Fira Mono","Fira Sans","Fira Sans Condensed","Fira Sans Extra Condensed","Fjalla One","Fjord One","Flamenco","Flavors","Fondamento","Fontdiner Swanky","Forum","Francois One","Frank Ruhl Libre","Freckle Face","Fredericka the Great","Fredoka One","Freehand","Fresca","Frijole","Fruktur","Fugaz One","GFS Didot","GFS Neohellenic","Gabriela","Gaegu","Gafata","Galada","Galdeano","Galindo","Gamja Flower","Gayathri","Gentium Basic","Gentium Book Basic","Geo","Geostar","Geostar Fill","Germania One","Gidugu","Gilda Display","Give You Glory","Glass Antiqua","Glegoo","Gloria Hallelujah","Goblin One","Gochi Hand","Gorditas","Gothic A1","Goudy Bookletter 1911","Graduate","Grand Hotel","Gravitas One","Great Vibes","Grenze","Griffy","Gruppo","Gudea","Gugi","Gurajada","Habibi","Halant","Hammersmith One","Hanalei","Hanalei Fill","Handlee","Hanuman","Happy Monkey","Harmattan","Headland One","Heebo","Henny Penny","Hepta Slab","Herr Von Muellerhoff","Hi Melody","Hind","Hind Guntur","Hind Madurai","Hind Siliguri","Hind Vadodara","Holtwood One SC","Homemade Apple","Homenaje","IBM Plex Mono","IBM Plex Sans","IBM Plex Sans Condensed","IBM Plex Serif","IM Fell DW Pica","IM Fell DW Pica SC","IM Fell Double Pica","IM Fell Double Pica SC","IM Fell English","IM Fell English SC","IM Fell French Canon","IM Fell French Canon SC","IM Fell Great Primer","IM Fell Great Primer SC","Iceberg","Iceland","Imprima","Inconsolata","Inder","Indie Flower","Inika","Inknut Antiqua","Irish Grover","Istok Web","Italiana","Italianno","Itim","Jacques Francois","Jacques Francois Shadow","Jaldi","Jim Nightshade","Jockey One","Jolly Lodger","Jomhuria","Jomolhari","Josefin Sans","Josefin Slab","Joti One","Jua","Judson","Julee","Julius Sans One","Junge","Jura","Just Another Hand","Just Me Again Down Here","K2D","Kadwa","Kalam","Kameron","Kanit","Kantumruy","Karla","Karma","Katibeh","Kaushan Script","Kavivanar","Kavoon","Kdam Thmor","Keania One","Kelly Slab","Kenia","Khand","Khmer","Khula","Kirang Haerang","Kite One","Knewave","KoHo","Kodchasan","Kosugi","Kosugi Maru","Kotta One","Koulen","Kranky","Kreon","Kristi","Krona One","Krub","Kulim Park","Kumar One","Kumar One Outline","Kurale","La Belle Aurore","Lacquer","Laila","Lakki Reddy","Lalezar","Lancelot","Lateef","Lato","League Script","Leckerli One","Ledger","Lekton","Lemon","Lemonada","Lexend Deca","Lexend Exa","Lexend Giga","Lexend Mega","Lexend Peta","Lexend Tera","Lexend Zetta","Libre Barcode 128","Libre Barcode 128 Text","Libre Barcode 39","Libre Barcode 39 Extended","Libre Barcode 39 Extended Text","Libre Barcode 39 Text","Libre Baskerville","Libre Caslon Display","Libre Caslon Text","Libre Franklin","Life Savers","Lilita One","Lily Script One","Limelight","Linden Hill","Literata","Liu Jian Mao Cao","Livvic","Lobster","Lobster Two","Londrina Outline","Londrina Shadow","Londrina Sketch","Londrina Solid","Long Cang","Lora","Love Ya Like A Sister","Loved by the King","Lovers Quarrel","Luckiest Guy","Lusitana","Lustria","M PLUS 1p","M PLUS Rounded 1c","Ma Shan Zheng","Macondo","Macondo Swash Caps","Mada","Magra","Maiden Orange","Maitree","Major Mono Display","Mako","Mali","Mallanna","Mandali","Manjari","Mansalva","Manuale","Marcellus","Marcellus SC","Marck Script","Margarine","Markazi Text","Marko One","Marmelad","Martel","Martel Sans","Marvel","Mate","Mate SC","Material Icons","Maven Pro","McLaren","Meddon","MedievalSharp","Medula One","Meera Inimai","Megrim","Meie Script","Merienda","Merienda One","Merriweather","Merriweather Sans","Metal","Metal Mania","Metamorphous","Metrophobic","Michroma","Milonga","Miltonian","Miltonian Tattoo","Mina","Miniver","Miriam Libre","Mirza","Miss Fajardose","Mitr","Modak","Modern Antiqua","Mogra","Molengo","Molle","Monda","Monofett","Monoton","Monsieur La Doulaise","Montaga","Montez","Montserrat","Montserrat Alternates","Montserrat Subrayada","Moul","Moulpali","Mountains of Christmas","Mouse Memoirs","Mr Bedfort","Mr Dafoe","Mr De Haviland","Mrs Saint Delafield","Mrs Sheppards","Mukta","Mukta Mahee","Mukta Malar","Mukta Vaani","Muli","Mystery Quest","NTR","Nanum Brush Script","Nanum Gothic","Nanum Gothic Coding","Nanum Myeongjo","Nanum Pen Script","Neucha","Neuton","New Rocker","News Cycle","Niconne","Niramit","Nixie One","Nobile","Nokora","Norican","Nosifer","Notable","Nothing You Could Do","Noticia Text","Noto Sans","Noto Sans HK","Noto Sans JP","Noto Sans KR","Noto Sans SC","Noto Sans TC","Noto Serif","Noto Serif JP","Noto Serif KR","Noto Serif SC","Noto Serif TC","Nova Cut","Nova Flat","Nova Mono","Nova Oval","Nova Round","Nova Script","Nova Slim","Nova Square","Numans","Nunito","Nunito Sans","Odor Mean Chey","Offside","Old Standard TT","Oldenburg","Oleo Script","Oleo Script Swash Caps","Open Sans","Open Sans Condensed","Oranienbaum","Orbitron","Oregano","Orienta","Original Surfer","Oswald","Over the Rainbow","Overlock","Overlock SC","Overpass","Overpass Mono","Ovo","Oxygen","Oxygen Mono","PT Mono","PT Sans","PT Sans Caption","PT Sans Narrow","PT Serif","PT Serif Caption","Pacifico","Padauk","Palanquin","Palanquin Dark","Pangolin","Paprika","Parisienne","Passero One","Passion One","Pathway Gothic One","Patrick Hand","Patrick Hand SC","Pattaya","Patua One","Pavanam","Paytone One","Peddana","Peralta","Permanent Marker","Petit Formal Script","Petrona","Philosopher","Piedra","Pinyon Script","Pirata One","Plaster","Play","Playball","Playfair Display","Playfair Display SC","Podkova","Poiret One","Poller One","Poly","Pompiere","Pontano Sans","Poor Story","Poppins","Port Lligat Sans","Port Lligat Slab","Pragati Narrow","Prata","Preahvihear","Press Start 2P","Pridi","Princess Sofia","Prociono","Prompt","Prosto One","Proza Libre","Public Sans","Puritan","Purple Purse","Quando","Quantico","Quattrocento","Quattrocento Sans","Questrial","Quicksand","Quintessential","Qwigley","Racing Sans One","Radley","Rajdhani","Rakkas","Raleway","Raleway Dots","Ramabhadra","Ramaraja","Rambla","Rammetto One","Ranchers","Rancho","Ranga","Rasa","Rationale","Ravi Prakash","Red Hat Display","Red Hat Text","Redressed","Reem Kufi","Reenie Beanie","Revalia","Rhodium Libre","Ribeye","Ribeye Marrow","Righteous","Risque","Roboto","Roboto Condensed","Roboto Mono","Roboto Slab","Rochester","Rock Salt","Rokkitt","Romanesco","Ropa Sans","Rosario","Rosarivo","Rouge Script","Rozha One","Rubik","Rubik Mono One","Ruda","Rufina","Ruge Boogie","Ruluko","Rum Raisin","Ruslan Display","Russo One","Ruthie","Rye","Sacramento","Sahitya","Sail","Saira","Saira Condensed","Saira Extra Condensed","Saira Semi Condensed","Saira Stencil One","Salsa","Sanchez","Sancreek","Sansita","Sarabun","Sarala","Sarina","Sarpanch","Satisfy","Sawarabi Gothic","Sawarabi Mincho","Scada","Scheherazade","Schoolbell","Scope One","Seaweed Script","Secular One","Sedgwick Ave","Sedgwick Ave Display","Sevillana","Seymour One","Shadows Into Light","Shadows Into Light Two","Shanti","Share","Share Tech","Share Tech Mono","Shojumaru","Short Stack","Shrikhand","Siemreap","Sigmar One","Signika","Signika Negative","Simonetta","Single Day","Sintony","Sirin Stencil","Six Caps","Skranji","Slabo 13px","Slabo 27px","Slackey","Smokum","Smythe","Sniglet","Snippet","Snowburst One","Sofadi One","Sofia","Song Myung","Sonsie One","Sorts Mill Goudy","Source Code Pro","Source Sans Pro","Source Serif Pro","Space Mono","Special Elite","Spectral","Spectral SC","Spicy Rice","Spinnaker","Spirax","Squada One","Sree Krushnadevaraya","Sriracha","Srisakdi","Staatliches","Stalemate","Stalinist One","Stardos Stencil","Stint Ultra Condensed","Stint Ultra Expanded","Stoke","Strait","Stylish","Sue Ellen Francisco","Suez One","Sumana","Sunflower","Sunshiney","Supermercado One","Sura","Suranna","Suravaram","Suwannaphum","Swanky and Moo Moo","Syncopate","Tajawal","Tangerine","Taprom","Tauri","Taviraj","Teko","Telex","Tenali Ramakrishna","Tenor Sans","Text Me One","Thasadith","The Girl Next Door","Tienne","Tillana","Timmana","Tinos","Titan One","Titillium Web","Tomorrow","Trade Winds","Trirong","Trocchi","Trochut","Trykker","Tulpen One","Turret Road","Ubuntu","Ubuntu Condensed","Ubuntu Mono","Ultra","Uncial Antiqua","Underdog","Unica One","UnifrakturCook","UnifrakturMaguntia","Unkempt","Unlock","Unna","VT323","Vampiro One","Varela","Varela Round","Vast Shadow","Vesper Libre","Vibes","Vibur","Vidaloka","Viga","Voces","Volkhov","Vollkorn","Vollkorn SC","Voltaire","Waiting for the Sunrise","Wallpoet","Walter Turncoat","Warnes","Wellfleet","Wendy One","Wire One","Work Sans","Yanone Kaffeesatz","Yantramanav","Yatra One","Yellowtail","Yeon Sung","Yeseva One","Yesteryear","Yrsa","ZCOOL KuaiLe","ZCOOL QingKe HuangYou","ZCOOL XiaoWei","Zeyada","Zhi Mang Xing","Zilla Slab","Zilla Slab Highlight"]

	// scene
	const scene = html`
	<fingerprint>
		<visitor><div id="visitor">Loading visitor data...</div></visitor>
		<div id="fingerprint"></div>
		<div id="font-detector"><div id="font-detector-stage"></div></div>
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
		const fontsProcess = timer('Computing fonts...')
		const fontsComputed = attempt(() => {
			return detectFonts([...fontList, ...extendedFontList])
		})
		fontsProcess('Fonts complete')

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
		const hashProcess = timer('hashing values...')
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
			fontsHash,
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
			hashify(fontsComputed),
			hashify(mathsComputed),
			hashify(canvasComputed),
			hashify(errorsCaptured),
			hashify(trashComputed),
			hashify(liesComputed)
		]).catch(error => { 
			console.error(error.message)
		})
		hashProcess('Hashing complete')

		navComputed.mimeTypesHash = mimeTypesHash
		navComputed.versionHash = navVersionHash
		navComputed.pluginsHash = pluginsHash

		const fingerprint = {
			nav: [navComputed, navHash],
			highEntropy: [highEntropy, highEntropyHash],
			timezone: [timezoneComputed, timezoneHash],
			webgl: [webglComputed, webglHash],
			voices: [voicesComputed, voicesHash],
			mediaDevices: [mediaDevicesComputed, mediaDeviceHash],
			screen: [screenComputed, screenHash],
			webglDataURL: [webglDataURLComputed, weglDataURLHash],
			consoleErrors: [consoleErrorsComputed, consoleErrorsHash],
			cRects: [cRectsComputed, cRectsHash],
			fonts: [fontsComputed, fontsHash],
			maths: [mathsComputed, mathsHash],
			canvas: [canvasComputed, canvasHash],
			errorsCaptured: [errorsCaptured, errorsCapturedHash],
			trash: [trashComputed, trashHash],
			lies: [liesComputed, liesHash]
		}
		return fingerprint
	}
	// get/post request
	const webapp = 'https://script.google.com/macros/s/AKfycbzKRjt6FPboOEkh1vTXttGyCjp97YBP7z-5bODQmtSkQ9BqDRY/exec'
	async function postData(formData) {
		const response = await fetch(webapp, { method: 'POST', body: formData })
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
			//timezone: fp.timezone, // subject to randomization
			voices: fp.voices,
			navVersion: fp.nav[0].navVersion,
			renderer: fp.webgl[0].renderer,
			vendor: fp.webgl[0].vendor,
			webglDataURL: fp.webglDataURL,
			consoleErrors: fp.consoleErrors,
			trash: fp.trash,
			lies: fp.lies,
			errorsCaptured: fp.errorsCaptured,
			cRects: fp.cRects,
			fonts: fp.fonts,
			maths: fp.maths,
			canvas: fp.canvas
		}
		const log = (message, obj) => console.log(message, JSON.stringify(obj, null, '\t'))
		
		console.log('Pure Fingerprint (Object):', creep)
		console.log('Fingerprint Id (Object):', fp)
		log('Fingerprint Id (JSON):', fp)
		
		const [fpHash, creepHash] = await Promise.all([hashify(fp), hashify(creep)])
		.catch(error => { 
			console.error(error.message)
		})

		// fetch data from server
		const visitorElem = document.getElementById('visitor')
		const fetchVisitoDataTimer = timer('Fetching visitor data...')
		fetch(`${webapp}?id=${creepHash}&subId=${fpHash}`)
			.then(response => response.json())
			.then(data => {
				const { firstVisit, latestVisit, subIds, visits } = data
				const subIdsLen = Object.keys(subIds).length
				const toLocaleStr = str => new Date(str).toLocaleString()
				const pluralify = (len) => len > 1 ? 's' : ''
				const plural = pluralify(subIdsLen)
				const template = `
					<div>First Visit: ${toLocaleStr(firstVisit)} (x days ago)</div>
					<div>Latest Visit: ${toLocaleStr(latestVisit)}</div>
					${subIdsLen ? `<div>${subIdsLen} sub fingerprint${plural} detected</div>` : ''}
					<div>Visits: ${visits}</div>
				`
				fetchVisitoDataTimer('Visitor data received')
				return patch(visitorElem, html`${template}`)
			})
			.catch(err => {
				fetchVisitoDataTimer('Error fetching visitor data')
				patch(visitorElem, html`<div>Error loading visitor data</div>`)
				return console.error('Error!', err.message)
			})
		
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
				torBrowser ? 'Tor Browser (pending permission or blocked)' : 'Firefox (privacy.resistFingerprinting)'
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
				'235354122e45f69510264fc45ebd5a161eb15ada33702d85ee96a23b28ba2295': 'CyDec',
				'94e40669f496f2cef69cc289f3ee50dc442ced21fb42a88bc223270630002556': 'Canvas Fingerprint Defender',
				'ea43a000cd99bbe3fcd6861a2a5b9da1cba4c75c5ed7756f19562a8b5e034018': 'Privacy Possom',
				'1a2e56badfca47209ba445811f27e848b4c2dae58224445a4af3d3581ffe7561': 'Privacy Possom',
				'e5c60fb55b35e96ec8482d4cfccb2e3b8245ef2a148c96a473ee7e526a2f21c5': 'Privacy Badger or similar',
				'bdcb3de585b3a521cff31e571d854a0bb76c23da7a0105c4806aba01a086f238': 'ScriptSafe',
				'45f81b1215784751b96b83e2f41cd58dfa5242ba8bc59a4caf6ada3cf7b2391d': 'ScriptSafe',
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
					<div>Purified Id: ${creepHash}</div>
					<div>Fingerprint Id: ${fpHash}</div>

					${
						!trashBin.length ? '<div>trash: <span class="none">none</span></div>': (() => {
							const plural = pluralify(trashBin.length)
							const hash = fp.trash[1]
							return `
							<div class="trash">
								<strong>${trashBin.length} API${plural} are counted as trash</strong>
								<div>hash: ${hash}</div>
								${trashBin.map(item => `<div>${item.name}: ${item.value}</div>`).join('')}
							</div>
							`
						})()
					}

					${
						!lieRecords.length ? '<div>lies: <span class="none">none</span></div>': (() => {
							const plural = pluralify(lieRecords.length)
							const hash = fp.lies[1]
							return `
							<div class="lies">
								<strong>${lieRecords.length} API lie${plural} detected</strong>
								<div>hash: ${hash}</div>
								${lieRecords.map(item => `<div>${item.name} Lie Fingerprint: ${item.lie}</div>`).join('')}
							</div>
							`
						})()
					}

					${
						!fp.errorsCaptured[0].length ? `<div>errors captured: <span class="none">none</span></div>`: (() => {
							const [ errors, hash ]  = fp.errorsCaptured
							const plural = pluralify(errors)
							return `
							<div class="errors">
								<strong>${errors.length} error${plural} captured</strong>
								<div>hash: ${hash}</div>
								${
									errors.map(err => {
										return `
										<div>
											${err.trustedName}: ${err.trustedMessage}
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
					<div>
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
								!renderer ? note.blocked : identify(fp.webgl)
							)
						})()}</div>
						<div>webgl vendor: ${(() => {
							const [ data, hash ] = fp.webgl
							const { vendor } = data
							const isString = typeof vendor == 'string'
							return (
								isBrave ? 'Brave Browser' : 
								isString && vendor ? vendor : 
								!vendor ? note.blocked : identify(fp.webgl)
							)
						})()}</div>
					</div>
					<div>client rects: ${identify(fp.cRects)}</div>
					<div>console errors: ${identify(fp.consoleErrors)}</div>	
					<div>maths: ${identify(fp.maths)}</div>
					<div>fonts: ${identify(fp.fonts)}</div>
					<div>media devices: ${identify(fp.mediaDevices)}</div>
					
					${
						!fp.timezone[0] ? `<div>timezone: ${note.blocked}</div>`: (() => {
							const [ timezone, hash ]  = fp.timezone
							return `
							<div>
								<div>timezone hash: ${identify(fp.timezone)}</div>
								${
									Object.keys(timezone).map(key => {
										const value = timezone[key]
										return `<div>${key}: ${value != undefined ? value : note.blocked}</div>`
									}).join('')
								}
							</div>
							`
						})()
					}
					${
						!fp.voices[0] ? `<div>voices: ${note.blocked}</div>`: (() => {
							const [ voices, hash ]  = fp.voices
							return `
							<div>
								<div>voices hash: ${hash}</div>
								${
									voices.map(voice => {
										return `<div>${voice.name}</div>`
									}).join('')
								}
							</div>
							`
						})()
					}

					${
						!fp.screen[0] ? `<div>screen: ${note.blocked}</div>`: (() => {
							const [ scrn, hash ]  = fp.screen
							return `
							<div>
								<div>screen hash: ${hash}</div>
								${
									Object.keys(scrn).map(key => {
										const value = scrn[key]
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
								mimeTypes,
								mimeTypesHash,
								version,
								versionHash,
								plugins,
								pluginsHash,
								userAgent,
								appVersion,
								language,
								vendor,
								doNotTrack
							} = nav
							return `
							<div>
								<div>navigator hash: ${hash}</div>
								<div>version: ${version !== undefined ? versionHash : note.blocked}</div>
								<div>platform: ${platform ? platform : `${note.blocked} or other`}</div>
								<div>deviceMemory: ${deviceMemory ? deviceMemory : note.blocked}</div>
								<div>hardwareConcurrency: ${hardwareConcurrency ? hardwareConcurrency : note.blocked}</div>
								<div>maxTouchPoints: ${maxTouchPoints !== undefined ? maxTouchPoints : note.blocked}</div>
								<div>userAgent: ${userAgent ? userAgent : note.blocked}</div>
								<div>appVersion: ${appVersion ? appVersion : note.blocked}</div>
								<div>language: ${language ? language : note.blocked}</div>
								<div>vendor: ${vendor ? vendor : note.blocked}</div>
								<div>doNotTrack: ${doNotTrack !== undefined ? doNotTrack : note.blocked}</div>
								<div>mimeTypes: ${mimeTypes !== undefined ? mimeTypesHash : note.blocked}</div>
								<div>plugins: ${plugins !== undefined ? pluginsHash : note.blocked}</div>
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