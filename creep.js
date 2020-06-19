(function () {
	const timer = (logStart) => {
		console.log(logStart)
		const start = Date.now()
		return (logEnd) => {
			const end = Date.now() - start
			console.log(`${logEnd}: ${end / 1000} seconds`)
		}
	}
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

	const hashMini = str => {
	    const json = `${JSON.stringify(str)}`
	    let i, len, hash = 0x811c9dc5
	    for (i = 0, len = json.length; i < len; i++) {
	        hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	    }
	    return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	}

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

	// detect and fingerprint Function API lies
	const native = (x) => `function ${x}() { [native code] }`
	function hasLiedStringAPI() {
		let lieTypes = []
		// detect attempts to rewrite Function string conversion APIs
		const fnToStr = Function.prototype.toString
		const fnToLStr = Function.prototype.toLocaleString
		const fnStr = String
		const fnStringify = JSON.stringify
		if (fnToStr != native('toString')) {
			lieTypes.push({ fnToStr })
		}
		if (fnToLStr != native('toLocaleString')) {
			lieTypes.push({ fnToLStr })
		}
		if (fnStr != native('String')) {
			lieTypes.push({ fnStr })
		}
		if (fnStringify != native('stringify')) {
			lieTypes.push({ fnStringify })
		}
		return () => lieTypes
	}
	const stringAPILieTypes = hasLiedStringAPI() // compute and cache result
	function hasLiedAPI(api, name) {
		let lieTypes = [...stringAPILieTypes()]
		let fingerprint = ''

		// detect attempts to rename the API and/or rewrite string conversion APIs on this API object
		const {
			toString: fnToStr,
			toLocaleString: fnToLStr
		} = Function.prototype
		const {
			name: apiName,
			toString: apiToString,
			toLocaleString: apiToLocaleString
		} = api
		if (apiName != name) {
			lieTypes.push({ apiName })
		}
		if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
			lieTypes.push({ apiToString })
		}
		if (apiToLocaleString !== fnToLStr) {
			lieTypes.push({ apiToLocaleString })
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
		} catch (err) {
			const nativeTypeError = 'TypeError: Function.prototype.toString is not a constructor'
			if ('' + err != nativeTypeError) {
				lieTypes.push({ newErr: '' + err })
			}
		}

		// collect string conversion result
		const result = '' + api

		// fingerprint result if it does not match native code
		if (result != native(name)) {
			fingerprint = result
		}
		
		return {
			lie: lieTypes.length || fingerprint ? { lieTypes, fingerprint } : false, 
		}
	}

	// navigator
	const nav = () => {
		let {
			userAgent,
			appVersion,
			platform,
			deviceMemory: dMem,
			hardwareConcurrency: hCon,
			maxTouchPoints: maxTP
		} = navigator
		const trust = (
			userAgent.includes(appVersion)
		) ? true : false
		if (!trust) {
			userAgent = appVersion = platform = undefined
		}
		return {
			appVersion,
			deviceMemory: isNaN(dMem) ? undefined : dMem,
			doNotTrack: navigator.doNotTrack,
			hardwareConcurrency: isNaN(hCon) ? undefined : hCon,
			language: `${navigator.languages.join(', ')} (${navigator.language})`,
			maxTouchPoints: isNaN(maxTP) ? undefined : maxTP,
			platform,
			userAgent,
			vendor: navigator.vendor || undefined,
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
		try {
			const { userAgentData } = navigator
			return !userAgentData ? undefined : 
				attempt(() => navigator.userAgentData.getHighEntropyValues(
					['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
				))
		}
		catch(error) {
			return captureError(error)
		}
	}

	// screen
	const screenFp = () => {
		let {
			width,
			height,
			availWidth,
			availHeight,
			availTop,
			availLeft,
			colorDepth,
			pixelDepth
		} = screen
		if (availWidth > width || availHeight > height) {
			width = height = availWidth = availHeight = availTop = availLeft = undefined // distrust
		}
		return {
			width,
			height,
			availWidth,
			availHeight,
			availTop,
			availLeft,
			colorDepth,
			pixelDepth
		}
	}

	// voices
	const getVoices = () => {
		try {
			const promise = new Promise(resolve => {
				if (typeof speechSynthesis === 'undefined') {
					return resolve(undefined)
				} 
				else if (!speechSynthesis.getVoices) {
					return resolve(undefined)
				}
				else if (speechSynthesis.getVoices().length) {
					return resolve(voices)
				} else {
					speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices())
				}
			})
			return promise
		}
		catch(error) {
			return captureError(error)
		}
	}

	// media devices
	const getMediaDevices = () => {
		try {
			if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
				new Promise(resolve => resolve(undefined))
			}
			return attempt(() => navigator.mediaDevices.enumerateDevices())
		}
		catch(error) {
			return captureError(error)
		}
	}

	// canvas
	const canvas = () => {
		const { lie: dataLie } = hasLiedAPI(HTMLCanvasElement.prototype.toDataURL, 'toDataURL')
		const { lie: contextLie } = hasLiedAPI(HTMLCanvasElement.prototype.getContext, 'getContext')
		if (!dataLie && !contextLie) {
			const canvas = document.createElement('canvas')
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
			return canvas.toDataURL()
		}
		
		dataLie && console.log('Lie detected (toDataURL):', hashMini(dataLie))
		contextLie && console.log('Lie detected (getContext):', hashMini(contextLie))

		return { dataLie, contextLie }
	}

	// webgl
	const webgl = () => {
		const { lie: paramLie } = hasLiedAPI(WebGLRenderingContext.prototype.getParameter, 'getParameter')
		const { lie: extLie } = hasLiedAPI(WebGLRenderingContext.prototype.getExtension, 'getExtension')
		if (!paramLie && !extLie) {
			const canvas = document.createElement('canvas')
			const context = canvas.getContext('webgl')
			return {
				unmasked: () => {
					const extension = context.getExtension('WEBGL_debug_renderer_info')
					const vendor = context.getParameter(extension.UNMASKED_VENDOR_WEBGL)
					const renderer = context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
					return {
						vendor,
						renderer
					}
				},
				dataURL: () => {
					context.clearColor(0.2, 0.4, 0.6, 0.8)
					context.clear(context.COLOR_BUFFER_BIT)
					return canvas.toDataURL()
				}
			}
		}

		paramLie && console.log('Lie detected (getParameter):', hashMini(paramLie))
		extLie && console.log('Lie detected (getExtension):', hashMini(extLie))

		return {
			unmasked: () => ({ vendor: undefined, renderer: undefined }),
			dataURL: () => { paramLie, extLie }
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
		if (!timezoneLie) {
			const time = /(\d{1,2}:\d{1,2}:\d{1,2}\s)/ig
			return [
				(new Date()).getTimezoneOffset(),
				Intl.DateTimeFormat().resolvedOptions().timeZone,
				(new Date('1/1/2001').toTimeString()).replace(time, '')
			].join(', ')
		}

		timezoneLie && console.log('Lie detected (getTimezoneOffset):', hashMini(timezoneLie))

		return { timezoneLie }
	}

	// client rects
	const cRects = () => {
		const { lie: rectsLie } = hasLiedAPI(Element.prototype.getClientRects, 'getClientRects')
		if (!rectsLie) {
			const cRectProps = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left']
			const rectElems = document.getElementsByClassName('rects')
			const rectFp = [...rectElems].map(el => el.getClientRects()[0].toJSON())
			return rectFp
		}

		rectsLie && console.log('Lie detected (getClientRects):', hashMini(rectsLie))

		return { rectsLie }
	}

	// scene
	const scene = html`
	<fingerprint>
		<div id="fingerprint"></div>
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
		const { mimeTypes, plugins } = navComputed
		const screenComputed = attempt(() => screenFp())
		const canvasComputed = attempt(() => canvas())
		const gl = attempt(() => webgl())
		const webglComputed = {
			vendor: attempt(() => gl.unmasked().vendor),
			renderer: attempt(() => gl.unmasked().renderer)
		}
		const webglDataURLComputed = attempt(() => gl.dataURL())
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
		const voicesComputed = voices.map(({ name, lang }) => ({ name, lang }))
		const mediaDevicesComputed = !mediaDevices ? undefined : mediaDevices.map(({ kind }) => ({ kind })) // chrome randomizes groupId
		// await hash values
		const [
			mimeTypesHash, // order must match
			pluginsHash,
			voicesHash,
			mediaDeviceHash,
			highEntropyHash,
			screenHash,
			weglDataURLHash,
			consoleErrorsHash,
			cRectsHash,
			mathsHash,
			canvasHash,
			errorsCapturedHash
		] = await Promise.all([
			hashify(mimeTypes),
			hashify(plugins),
			hashify(voicesComputed),
			hashify(mediaDevicesComputed),
			hashify(highEntropy),
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
		const fingerprint = {
			nav: navComputed,
			highEntropy: [highEntropy, highEntropyHash],
			timezone: timezoneComputed,
			webgl: webglComputed,
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
		const { nav, webgl } = fp

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

		console.log('Fingerprint Id', fp)
		console.log('Creepy Id', fp)

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
		const responseData = await getData().catch(errs)
		console.log('Response data:', responseData)

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
					<div>Fingerprint Id: ${fpHash}</div>
					<div>Creepy Id: ${creepHash}</div>
					<div>canvas: ${fp.canvas[1]}</div>
					<div>webglDataURL: ${fp.webglDataURL[1]}</div>
					<div>webgl renderer: ${webgl.renderer}</div>
					<div>webgl vendor: ${webgl.vendor}</div>
					<div>client rects: ${fp.cRects[1]}</div>
					<div>console errors: ${fp.consoleErrors[1]}</div>
					<div>errors captured: ${fp.errorsCaptured[1]}</div>	
					<div>maths: ${fp.maths[1]}</div>
					<div>media devices: ${fp.mediaDevices[1]}</div>
					<div>timezone: ${fp.timezone}</div>
					<div>mimeTypes: ${fp.mimeTypes[1]}</div>
					<div>plugins: ${fp.plugins[1]}</div>
					<div>voices: ${fp.voices[1]}</div>

					<div>screen: ${fp.screen[1]}</div>
					<div>platform: ${nav.platform}</div>
					<div>deviceMemory: ${nav.deviceMemory}</div>
					<div>hardwareConcurrency: ${nav.hardwareConcurrency}</div>
					<div>maxTouchPoints: ${nav.maxTouchPoints}</div>
					<div>userAgent: ${nav.userAgent}</div>
					<div>appVersion: ${nav.appVersion}</div>
					<div>language: ${nav.language}</div>
					<div>vendor: ${nav.vendor}</div>
					<div>doNotTrack: ${nav.doNotTrack}</div>


					${(
						!fp.highEntropy[0] ? '': `
						<div>high entropy hash: ${fp.highEntropy[1]}</div>
						<div>ua architecture: ${fp.highEntropy[0].architecture}</div>
						<div>ua model: ${fp.highEntropy[0].model || undefined}</div>
						<div>ua platform: ${fp.highEntropy[0].platform}</div>
						<div>ua platform version: ${fp.highEntropy[0].platformVersion}</div>
						<div>ua full version: ${fp.highEntropy[0].uaFullVersion}</div>
						`
					)}
					
					<span>view the console for details</span>
				</div>
			</section>
		`
		return patch(fpElem, html`${data}`)
	}).catch((e) => console.log(e))
})()
