(async function() {
	// Log performance time
	const timer = (logStart) => {
		logStart && console.log(logStart)
		const start = performance.now()
		return (logEnd) => {
			const end = performance.now() - start
			logEnd && console.log(`${logEnd}: ${end / 1000} seconds`)
			return end
		}
	}

	// Handle Errors
	const errorsCaptured = []
	const captureError = (error, customMessage = null) => {
		const type = {
			Error: true,
			EvalError: true, 
			InternalError: true,
			RangeError: true,
			ReferenceError: true,
			SyntaxError: true,
			TypeError: true,
			URIError: true,
			InvalidStateError: true,
			SecurityError: true
		}
		const hasInnerSpace = s => /.+(\s).+/g.test(s) // ignore AOPR noise
		console.error(error) // log error to educate
		const { name, message } = error
		const trustedMessage = (
			!hasInnerSpace(message) ? undefined :
			!customMessage ? message :
			`${message} [${customMessage}]`
		)
		const trustedName = type[name] ? name : undefined
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

	const caniuse = (api, objChainList = [], args = [], method = false) => {
		if (!api) {
			return undefined
		}
		let i, len = objChainList.length, chain = api
		try {
			for (i = 0; i < len; i++) {
				const obj = objChainList[i]
				chain = chain[obj]
			}
		}
		catch (error) {
			return undefined
		}
		return (
			method && args.length ? chain.apply(api, args) :
			method && !args.length ? chain.apply(api) :
			chain
		)
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

	// instance id
	const instanceId = hashMini(crypto.getRandomValues(new Uint32Array(10)))

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
	const patch = (oldEl, newEl, fn = null) => {
		oldEl.parentNode.replaceChild(newEl, oldEl)
		return typeof fn === 'function' ? fn() : true
	}
	const html = (stringSet, ...expressionSet) => {
		const template = document.createElement('template')
		template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i] || ''}`).join('')
		return templateContent(template) // ie11 fix for template.content
	}

	// template helpers
	const note = { blocked: '<span class="blocked">blocked</span>'}
	const pluralify = len => len > 1 ? 's' : ''
	const toJSONFormat = obj => JSON.stringify(obj, null, '\t')

	// modal component
	const modal = (name, result) => {
		if (!result.length) {
			return ''
		}
		return `
			<style>
			.modal-${name}:checked ~ .modal-container {
				visibility: visible;
				opacity: 1;
				animation: show 0.1s linear both;
			}
			.modal-${name}:checked ~ .modal-container .modal-content {
				animation: enter 0.2s 0.1s ease both
			}
			.modal-${name}:not(:checked) ~ .modal-container {
				visibility: hidden;
			}
			</style>
			<input type="radio" id="toggle-open-${name}" class="modal-${name}" name="modal-${name}"/>
			<label class="modal-open-btn" for="toggle-open-${name}" onclick="">details</label>
			<label class="modal-container" for="toggle-close-${name}" onclick="">
				<label class="modal-content" for="toggle-open-${name}" onclick="">
					<input type="radio" id="toggle-close-${name}" name="modal-${name}"/>
					<label class="modal-close-btn" for="toggle-close-${name}" onclick="">×</label>
					<div>${result}</div>
				</label>
			</label>
		`
	}

	// Detect proxy behavior
	const proxyBehavior = x => typeof x == 'function' ? true : false

	// detect and fingerprint Function API lies
	const native = (result, str) => {
		const chrome = `function ${str}() { [native code] }`
		const chromeGet = `function get ${str}() { [native code] }`
		const firefox = `function ${str}() {\n    [native code]\n}`
		return result == chrome || result == chromeGet || result == firefox
	}
	const hasLiedStringAPI = () => {
		let lies = []

		// detect attempts to rewrite Function.prototype.toString conversion APIs
		const { toString } = Function.prototype
		if (!native(toString, 'toString')) {
			lies.push({ toString })
		}

		// The idea of checking new is inspired by https://adtechmadness.wordpress.com/2019/03/23/javascript-tampering-detection-and-stealth/
		try {
			const str_1 = new Function.prototype.toString
			const str_2 = new Function.prototype.toString()
			const str_3 = new Function.prototype.toString.toString
			const str_4 = new Function.prototype.toString.toString()
			lies.push({
				str_1,
				str_2,
				str_3,
				str_4
			})
		} catch (error) {
			const nativeTypeError = 'TypeError: Function.prototype.toString is not a constructor'
			if ('' + error != nativeTypeError) {
				lies.push({ newErr: '' + error.message })
			}
		}

		return () => lies
	}
	const stringAPILieTypes = hasLiedStringAPI() // compute and cache result
	const hasLiedAPI = (api, name, obj = null) => {
		const { toString: fnToStr } = Function.prototype

		if (typeof api == 'function') {
			let lies = [...stringAPILieTypes()]
			let fingerprint = ''

			// detect attempts to rename the API and/or rewrite toString
			const { name: apiName, toString: apiToString } = api
			if (apiName != name) {
				lies.push({
					apiName: !proxyBehavior(apiName) ? apiName: true
				})
			}
			if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
				lies.push({
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
				lie: lies.length || fingerprint ? { lies, fingerprint } : false 
			}
		}

		if (typeof api == 'object') {
			const apiFunction = Object.getOwnPropertyDescriptor(api, name).get
			let lies = [...stringAPILieTypes()]
			let fingerprint = ''

			// detect attempts to rename the API and/or rewrite toString
			try {
				const { name: apiName, toString: apiToString } = apiFunction
				if (apiName != `get ${name}` && apiName != name) {
					lies.push({
						apiName: !proxyBehavior(apiName) ? apiName: true
					})
				}
				if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
					lies.push({
						apiToString: !proxyBehavior(apiToString) ? apiToString: true
					})
				}

				if (obj) {
					try {
						const definedPropertyValue = Object.getOwnPropertyDescriptor(obj, name).value
						lies.push({
							definedPropertyValue: true
						})
					}
					catch (error) {
						// Native throws error
					}
				}

				// collect string conversion result
				const result = '' + apiFunction

				// fingerprint result if it does not match native code
				if (!native(result, name)) {
					fingerprint = result
				}

				return {
					lie: lies.length || fingerprint ? { lies, fingerprint } : false
				}
			}
			catch (error) {
				captureError(error)
				return false
				
			}
		}

		return false
	}

	// Detect Browser
	const isBrave = 'brave' in navigator ? true : false
	const isFirefox = typeof InstallTrigger !== 'undefined'

	// Collect trash values
	const trashBin = []
	const sendToTrash = (name, val, response = undefined) => {
		const proxyLike = proxyBehavior(val)
		const value = !proxyLike ? val : 'proxy behavior detected'
		trashBin.push({ name, value })
		return response
	}

	// Collect lies detected
	const lieRecords = []
	const documentLie = (name, lieResult, lieTypes) => {
		return lieRecords.push({ name, lieTypes, hash: lieResult, lie: hashMini(lieTypes) })
	}

	// validate
	const isInt = (x) => typeof x == 'number' && x % 1 == 0
	const trustInteger = (name, val) => {
		const trusted = isInt(val) 
		return trusted ? val : sendToTrash(name, val)
	}

	// system
	const getOS = userAgent => {
		const os = (
			// order is important
			/windows phone/ig.test(userAgent) ? 'Windows Phone' :
			/win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
			/android/ig.test(userAgent) ? 'Android' :
			/cros/ig.test(userAgent) ? 'Chrome OS' :
			/linux/ig.test(userAgent) ? 'Linux' :
			/ipad/ig.test(userAgent) ? 'iPad' :
			/iphone/ig.test(userAgent) ? 'iPhone' :
			/ipod/ig.test(userAgent) ? 'iPod' :
			/ios/ig.test(userAgent) ? 'iOS' :
			/mac/ig.test(userAgent) ? 'Mac' :
			'Other'
		)
		return os
	}

	// worker
	const getWorkerScope = instanceId => {
		return new Promise(resolve => {
			try {
				const timeStart = timer()
				const worker = new Worker('worker.js')
				worker.addEventListener('message', async event => {
					const { data, data: { canvas2d } } = event
					data.system = getOS(data.userAgent)
					data.canvas2d = { dataURI: canvas2d, $hash: await hashify(canvas2d) }
					const $hash = await hashify(data)
					resolve({ ...data, $hash })
					const timeEnd = timeStart()
					const el = document.getElementById(`${instanceId}-worker-scope`)
					patch(el, html`
					<div>
						<strong>WorkerGlobalScope: WorkerNavigator/OffscreenCanvas</strong>
						<div>hash: ${$hash}</div>
						${
							Object.keys(data).map(key => {
								const value = data[key]
								return (
									key != 'canvas2d' && key != 'userAgent'? `<div>${key}: ${value ? value : note.blocked}</div>` : ''
								)
							}).join('')
						}
						<div>canvas 2d: ${data.canvas2d.$hash}</div>
						<div class="time">performance: ${timeEnd} milliseconds</div>
					</div>
					`)
					return
				}, false)
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}
	
	// cloudflare
	const getCloudflare = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				const api = 'https://www.cloudflare.com/cdn-cgi/trace'
				const res = await fetch(api)
				const text = await res.text()
				const lines = text.match(/^(?:ip|uag|loc|tls)=(.*)$/igm)
				const data = {}
				lines.forEach(line => {
					const key = line.split('=')[0]
					const value = line.substr(line.indexOf('=') + 1)
					data[key] = value
				})
				data.uag = getOS(data.uag)
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const timeEnd = timeStart()
				const el = document.getElementById(`${instanceId}-cloudflare`)
				patch(el, html`
				<div>
					<strong>Cloudflare</strong>
					<div>hash: ${$hash}</div>
					${
						Object.keys(data).map(key => {
							const value = data[key]
							key = (
								key == 'ip' ? 'ip address' :
								key == 'uag' ? 'system' :
								key == 'loc' ? 'ip location' :
								key == 'tls' ? 'tls version' :
								key
							)
							return `<div>${key}: ${value ? value : note.blocked}</div>`
						}).join('')
					}
					<div class="time">performance: ${timeEnd} milliseconds</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error, 'cloudflare.com: failed or client blocked')
				return resolve(undefined)
			}
		})
	}
	
	// navigator
	const getNavigator = (instanceId, workerScope) => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				const navigatorPrototype = attempt(() => Navigator.prototype)
				const detectLies = (name, value) => {
					const workerScopeValue = caniuse(workerScope, [name])
					if (workerScopeValue) {
						if (name == 'userAgent') {
							const system = getOS(value)
							if (workerScope.system != system) {
								documentLie(name, system, 'mismatches worker scope')
								return sendToTrash(name, system)
							}
						}
						else if (name != 'userAgent' && workerScopeValue != value) {
							documentLie(name, value, 'mismatches worker scope')
							return sendToTrash(name, value)
						}
					}
					const lie = navigatorPrototype ? hasLiedAPI(navigatorPrototype, name, navigator).lie : false
					if (lie) {
						documentLie(name, value, lie)
						return sendToTrash(name, value)
					}
					return value
				}
				const credibleUserAgent = (
					'chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true
				)
				const data = {
					appVersion: attempt(() => {
						const appVersion = detectLies('appVersion', navigator.appVersion)
						return credibleUserAgent ? appVersion : sendToTrash('InvalidAppVersion', 'does not match userAgent')
					}),
					deviceMemory: attempt(() => {
						if ('deviceMemory' in navigator) {
							const deviceMemory = detectLies('deviceMemory', navigator.deviceMemory)
							return deviceMemory ? trustInteger('InvalidDeviceMemory', deviceMemory) : undefined
						}
						return undefined
					}),
					doNotTrack: attempt(() => {
						const doNotTrack = detectLies('doNotTrack', navigator.doNotTrack)
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
						return trusted[doNotTrack] ? doNotTrack : sendToTrash('InvalidDoNotTrack', doNotTrack)
					}),
					hardwareConcurrency: attempt(() => {
						const hardwareConcurrency = detectLies('hardwareConcurrency', navigator.hardwareConcurrency)
						return hardwareConcurrency ? trustInteger('InvalidHardwareConcurrency', hardwareConcurrency): undefined
					}),
					language: attempt(() => {
						const languages = detectLies('languages', navigator.languages)
						const language = detectLies('language', navigator.language)

						if (languages && languages) {
							const langs = /^.{0,2}/g.exec(languages[0])[0]
							const lang = /^.{0,2}/g.exec(language)[0]
							const trusted = langs == lang
							return (
								trusted ? `${languages.join(', ')} (${language})` : 
								sendToTrash('InvalidLanguages', [languages, language].join(' '))
							)
						}

						return undefined
					}),
					maxTouchPoints: attempt(() => {
						if ('maxTouchPoints' in navigator) {
							const maxTouchPoints = detectLies('maxTouchPoints', navigator.maxTouchPoints)
							return maxTouchPoints != undefined ? trustInteger('InvalidMaxTouchPoints', maxTouchPoints) : undefined
						}

						return null
					}),
					platform: attempt(() => {
						const platform = detectLies('platform', navigator.platform)
						const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11']
						const trusted = typeof platform == 'string' && systems.filter(val => platform.toLowerCase().includes(val))[0]
						return trusted ? platform : undefined
					}),
					userAgent: attempt(() => {
						const userAgent = detectLies('userAgent', navigator.userAgent)
						return credibleUserAgent ? userAgent : sendToTrash('InvalidUserAgent', userAgent)
					}),
					vendor: attempt(() => {
						const vendor = detectLies('vendor', navigator.vendor)
						return vendor
					}),
					mimeTypes: attempt(() => {
						const mimeTypes = detectLies('mimeTypes', navigator.mimeTypes)
						return mimeTypes ? [...mimeTypes].map(m => m.type) : undefined
					}),
					plugins: attempt(() => {
						const plugins = detectLies('plugins', navigator.plugins)
						return plugins ? [...navigator.plugins]
							.map(p => ({
								name: p.name,
								description: p.description,
								filename: p.filename,
								version: p.version
							})) : undefined
					}),
					properties: attempt(() => {
						const keys = Object.keys(Object.getPrototypeOf(navigator))
						return keys
					}),
					highEntropyValues: await attempt(async () => { 
						if (!('userAgentData' in navigator)) {
							return undefined
						}
						const data = await navigator.userAgentData.getHighEntropyValues(
							['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
						)
						return data
					})
				}
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const timeEnd = timeStart()
				const id = `${instanceId}-navigator`
				const el = document.getElementById(id)
				const { mimeTypes, plugins, highEntropyValues, properties } = data
				patch(el, html`
				<div>
					<strong>Navigator</strong>
					<div>hash: ${$hash}</div>
					${
						Object.keys(data).map(key => {
							const skip = [
								'mimeTypes',
								'plugins',
								'properties',
								'highEntropyValues'
							].indexOf(key) > -1
							const value = data[key]
							return (
								!skip ? `<div>${key}: ${value != null || value != undefined ? value : note.blocked}</div>` : ''
							)
						}).join('')
					}
					<div>plugins (${''+(plugins.length)}): ${modal(`${id}-plugins`, plugins.map(plugin => plugin.name).join('<br>'))}</div>
					<div>mimeTypes (${''+mimeTypes.length}): ${modal(`${id}-mimeTypes`, mimeTypes.join('<br>'))}</div>
					${highEntropyValues ?  
						Object.keys(highEntropyValues).map(key => {
							const value = highEntropyValues[key]
							return `<div>ua ${key}: ${value ? value : note.blocked}</div>`
						}).join('') :
						`<div>ua architecture:</div>
						<div>ua model:</div>
						<div>ua platform:</div>
						<div>ua platformVersion:</div>
						<div>ua uaFullVersion:</div>`
					}
					<div>properties (${''+properties.length}): ${modal(`${id}-properties`, properties.join(', '))}</div>
					<div class="time">performance: ${timeEnd} milliseconds</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}
	
	// iframe.contentWindow
	const getIframeContentWindowVersion = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				const id = `${instanceId}-content-window-version-test`
				const iframeElement = document.createElement('iframe')
				iframeElement.setAttribute('id', id)
				iframeElement.setAttribute('style', 'display: none')
				document.body.appendChild(iframeElement)
				const iframe = document.getElementById(id)
				const contentWindow = iframe.contentWindow
				const keys = Object.getOwnPropertyNames(contentWindow)
				iframe.parentNode.removeChild(iframe) 
				const $hash = await hashify(keys)
				resolve({ keys, $hash })
				const timeEnd = timeStart()
				const el = document.getElementById(`${instanceId}-iframe-content-window-version`)
				patch(el, html`
				<div>
					<strong>HTMLIFrameElement.contentWindow</strong>
					<div>hash: ${$hash}</div>
					<div>keys: ${keys.length}</div>
					<div class="time">performance: ${timeEnd} milliseconds</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// HTMLElement	
	const getHTMLElementVersion = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				const id = `${instanceId}-html-element-version-test`
				const element = document.createElement('div')
				element.setAttribute('id', id)
				document.body.appendChild(element) 
				const htmlElement = document.getElementById(id)
				const keys = []
				for (const key in htmlElement) {
					keys.push(key)
				}
				const $hash = await hashify(keys)
				resolve({ keys, $hash })
				const timeEnd = timeStart()
				const el = document.getElementById(`${instanceId}-html-element-version`)
				patch(el, html`
				<div>
					<strong>HTMLElement</strong>
					<div>hash: ${$hash}</div>
					<div>keys: ${keys.length}</div>
					<div class="time">performance: ${timeEnd} milliseconds</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// CSSStyleDeclaration
	const computeStyle = type => {
		return new Promise(async resolve => {
			try {
				// get CSSStyleDeclaration
				const cssStyleDeclaration = (
					type == 'getComputedStyle' ? getComputedStyle(document.body) :
					type == 'HTMLElement.style' ? document.body.style :
					type == 'CSSRuleList.style' ? document.styleSheets[0].cssRules[0].style :
					undefined
				)
				if (!cssStyleDeclaration) {
					throw new TypeError('invalid argument string')
				}
				// get properties
				const prototype = Object.getPrototypeOf(cssStyleDeclaration)
				const prototypeProperties = Object.getOwnPropertyNames(prototype)
				const ownEnumerablePropertyNames = []
				const cssVar = /^--.*$/
				Object.keys(cssStyleDeclaration).forEach(key => {
					const numericKey = !isNaN(key)
					const value = cssStyleDeclaration[key]
					const customPropKey = cssVar.test(key)
					const customPropValue = cssVar.test(value)
					if (numericKey && !customPropValue) {
						return ownEnumerablePropertyNames.push(value)
					} else if (!numericKey && !customPropKey) {
						return ownEnumerablePropertyNames.push(key)
					}
					return
				})
				// get properties in prototype chain (required only in chrome)
				const propertiesInPrototypeChain = {}
				const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
				const uncapitalize = str => str.charAt(0).toLowerCase() + str.slice(1)
				const removeFirstChar = str => str.slice(1)
				const caps = /[A-Z]/g
				ownEnumerablePropertyNames.forEach(key => {
					if (propertiesInPrototypeChain[key]) {
						return
					}
					// determine attribute type
					const isNamedAttribute = key.indexOf('-') > -1
					const isAliasAttribute = caps.test(key)
					// reduce key for computation
					const firstChar = key.charAt(0)
					const isPrefixedName = isNamedAttribute && firstChar == '-'
					const isCapitalizedAlias = isAliasAttribute && firstChar == firstChar.toUpperCase()
					key = (
						isPrefixedName ? removeFirstChar(key) :
						isCapitalizedAlias ? uncapitalize(key) :
						key
					)
					// find counterpart in CSSStyleDeclaration object or its prototype chain
					if (isNamedAttribute) {
						const aliasAttribute = key.split('-').map((word, index) => index == 0 ? word : capitalize(word)).join('')
						if (aliasAttribute in cssStyleDeclaration) {
							propertiesInPrototypeChain[aliasAttribute] = true
						} else if (capitalize(aliasAttribute) in cssStyleDeclaration) {
							propertiesInPrototypeChain[capitalize(aliasAttribute)] = true
						}
					} else if (isAliasAttribute) {
						const namedAttribute = key.replace(caps, char => '-' + char.toLowerCase())
						if (namedAttribute in cssStyleDeclaration) {
							propertiesInPrototypeChain[namedAttribute] = true
						} else if (`-${namedAttribute}` in cssStyleDeclaration) {
							propertiesInPrototypeChain[`-${namedAttribute}`] = true
						}
					}
					return
				})
				// compile keys
				const keys = [
					...new Set([
						...prototypeProperties,
						...ownEnumerablePropertyNames,
						...Object.keys(propertiesInPrototypeChain)
					])
				]
				// checks
				const moz = keys.filter(key => (/moz/i).test(key)).length
				const webkit = keys.filter(key => (/webkit/i).test(key)).length
				const prototypeName = (''+prototype).match(/\[object (.+)\]/)[1]
				const data = { keys: keys.sort(), moz, webkit, prototypeName }
				const $hash = await hashify(data)
				return resolve({ ...data, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	const getCSSStyleDeclarationVersion = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				const [
					getComputedStyle,
					htmlElementStyle,
					cssRuleListstyle
				] = await Promise.all([
					computeStyle('getComputedStyle'),
					computeStyle('HTMLElement.style'),
					computeStyle('CSSRuleList.style')
				]).catch(error => {
					console.error(error.message)
				})
				const data = {
					['getComputedStyle']: getComputedStyle,
					['HTMLElement.style']: htmlElementStyle,
					['CSSRuleList.style']: cssRuleListstyle,
					matching: (
						''+getComputedStyle == ''+htmlElementStyle &&
						''+htmlElementStyle == ''+cssRuleListstyle
					)
				}
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const timeEnd = timeStart()
				const el = document.getElementById(`${instanceId}-css-style-declaration-version`)
				patch(el, html`
				<div>
					<strong>CSSStyleDeclaration</strong>
					<div>hash: ${$hash}</div>
					<div>prototype: ${htmlElementStyle.prototypeName}</div>
					${
						Object.keys(data).map(key => {
							const value = data[key]
							return key != 'matching' ? `<div>${key}: ${value ? value.$hash : note.blocked}</div>` : ''
						}).join('')
					}
					<div>keys: ${getComputedStyle.keys.length}, ${htmlElementStyle.keys.length}, ${cssRuleListstyle.keys.length}
					</div>
					<div>moz: ${''+getComputedStyle.moz}, ${''+htmlElementStyle.moz}, ${''+cssRuleListstyle.moz}
					</div>
					<div>webkit: ${''+getComputedStyle.webkit}, ${''+htmlElementStyle.webkit}, ${''+cssRuleListstyle.webkit}
					</div>
					<div>matching: ${data.matching}</div>
					<div class="time">performance: ${timeEnd} milliseconds</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// screen (allow some discrepancies otherwise lie detection triggers at random)
	const getScreen = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				const screenPrototype = attempt(() => Screen.prototype)
				const detectLies = (name, value) => {
					const lie = screenPrototype ? hasLiedAPI(screenPrototype, name, screen).lie : false
					if (lie) {
						documentLie(name, value, lie)
						return sendToTrash(name, value)
					}
					return value
				}
				const width = detectLies('width', screen.width)
				const height = detectLies('height', screen.height)
				const availWidth = detectLies('availWidth', screen.availWidth)
				const availHeight = detectLies('availHeight', screen.availHeight)
				const colorDepth = detectLies('colorDepth', screen.colorDepth)
				const pixelDepth = detectLies('pixelDepth', screen.pixelDepth)
				const data = {
					width: attempt(() => width ? trustInteger('InvalidWidth', width) : undefined),
					outerWidth: attempt(() => outerWidth ? trustInteger('InvalidOuterWidth', outerWidth) : undefined),
					availWidth: attempt(() => availWidth ? trustInteger('InvalidAvailWidth', availWidth) : undefined),
					height: attempt(() => height ? trustInteger('InvalidHeight', height) : undefined),
					outerHeight: attempt(() => outerHeight ? trustInteger('InvalidOuterHeight', outerHeight) : undefined),
					availHeight: attempt(() => availHeight ?  trustInteger('InvalidAvailHeight', availHeight) : undefined),
					colorDepth: attempt(() => colorDepth ? trustInteger('InvalidColorDepth', colorDepth) : undefined),
					pixelDepth: attempt(() => pixelDepth ? trustInteger('InvalidPixelDepth', pixelDepth) : undefined)
				}
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const timeEnd = timeStart()
				const el = document.getElementById(`${instanceId}-screen`)
				patch(el, html`
				<div>
					<strong>Screen</strong>
					<div>hash: ${$hash}</div>
					${
						Object.keys(data).map(key => {
							const value = data[key]
							return `<div>${key}: ${value ? value : note.blocked}</div>`
						}).join('')
					}
					<div class="time">performance: ${timeEnd} milliseconds</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// voices
	const getVoices = instanceId => {	
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				let voices = []
				const respond = async (resolve, voices, timeStart) => {
					voices = voices.map(({ name, lang }) => ({ name, lang }))
					const $hash = await hashify(voices)
					resolve({ voices, $hash })
					const timeEnd = timeStart()
					const id = `${instanceId}-voices`
					const el = document.getElementById(id)
					const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`)
					patch(el, html`
					<div>
						<strong>SpeechSynthesis</strong>
						<div>hash: ${$hash}</div>
						<div>voices (${''+voices.length}): ${modal(id, voiceList.join('<br>'))}</div>
						<div class="time">performance: ${timeEnd} milliseconds</div>
					</div>
					`)
					return
				}
				if (!('speechSynthesis' in window)) {
					return resolve(undefined)
				}
				else if (!('chrome' in window)) {
					voices = await speechSynthesis.getVoices()
					return respond(resolve, voices, timeStart)
				}
				else if (!speechSynthesis.getVoices || speechSynthesis.getVoices() == undefined) {
					return resolve(undefined)
				}
				else if (speechSynthesis.getVoices().length) {
					voices = speechSynthesis.getVoices()
					return respond(resolve, voices, timeStart)
				} else {
					speechSynthesis.onvoiceschanged = () => {
						voices = speechSynthesis.getVoices()
						return resolve(new Promise(resolve => respond(resolve, voices, timeStart)))
					}
				}
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// media devices
	const getMediaDevices = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				if (!('mediaDevices' in navigator)) {
					return resolve(undefined)
				}
				if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
					return resolve(undefined)
				}
				const mediaDevicesEnumerated = await navigator.mediaDevices.enumerateDevices()
				const mediaDevices = mediaDevicesEnumerated.map(({ kind }) => ({ kind }))
				const $hash = await hashify(mediaDevices)
				resolve({ mediaDevices, $hash })
				const timeEnd = timeStart()
				const el = document.getElementById(`${instanceId}-media-devices`)
				patch(el, html`
				<div>
					<strong>MediaDevicesInfo</strong>
					<div>hash: ${$hash}</div>
					<div>devices (${mediaDevices.length}): ${mediaDevices.map(device => device.kind).join(', ')}</div>
					<div class="time">performance: ${timeEnd} milliseconds</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// canvas
	const canvasToDataURL = attempt(() => HTMLCanvasElement.prototype.toDataURL)
	const canvasGetContext = attempt(() => HTMLCanvasElement.prototype.getContext)
	const dataLie = canvasToDataURL ? hasLiedAPI(canvasToDataURL, 'toDataURL').lie : false
	const contextLie = canvasGetContext ? hasLiedAPI(canvasGetContext, 'getContext').lie : false
	
	// 2d canvas
	const getCanvas2d = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				const patchDom = (response, timeEnd) => {
					const { $hash } = response
					const el = document.getElementById(`${instanceId}-canvas-2d`)
					return patch(el, html`
					<div>
						<strong>CanvasRenderingContext2D</strong>
						<div>hash: ${$hash}</div>
						<div class="time">performance: ${timeEnd} milliseconds</div>
					</div>
					`)
				}
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
					const dataURI = (
						isBrave || isFirefox ? sendToTrash('canvas2dDataURI', hashMini(canvas2dDataURI)) : canvas2dDataURI
					)
					const $hash = await hashify(dataURI)
					const response = { dataURI, $hash }
					resolve(response)
					const timeEnd = timeStart()
					patchDom(response, timeEnd)
					return
				}
				// document lie and send to trash
				canvas2dDataURI = canvas.toDataURL()
				const hash = hashMini(canvas2dDataURI)
				if (contextLie) {
					documentLie('canvas2dContextDataURI', hash, contextLie)
					sendToTrash('canvas2dContextDataURI', hash)
				}
				if (dataLie) {
					documentLie('canvas2dDataURI', hash, dataLie)
					sendToTrash('canvas2dDataURI', hash)
				}
				// fingerprint lie
				const data = { contextLie, dataLie }
				const $hash = await hashify(data)
				const response = { ...data, $hash }
				resolve(response)
				const timeEnd = timeStart()
				patchDom(response, timeEnd)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// bitmaprenderer
	const getCanvasBitmapRenderer = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				const patchDom = (response, timeEnd) => {
					const { $hash } = response
					const el = document.getElementById(`${instanceId}-canvas-bitmap-renderer`)
					return patch(el, html`
					<div>
						<strong>ImageBitmapRenderingContext</strong>
						<div>hash: ${$hash}</div>
						<div class="time">performance: ${timeEnd} milliseconds</div>
					</div>
					`)
				}
				const canvas = document.createElement('canvas')
				let canvasBMRDataURI = ''
				if (!dataLie && !contextLie) {
					const context = canvas.getContext('bitmaprenderer')
					const image = new Image()
					image.src = 'bitmap.png'
					return resolve(new Promise(resolve => {
						image.onload = async () => {
							const bitmap = await createImageBitmap(image, 0, 0, image.width, image.height)
							context.transferFromImageBitmap(bitmap)
							canvasBMRDataURI = canvas.toDataURL()
							const dataURI = (
								isBrave || isFirefox ? 
								sendToTrash('canvasBMRDataURI', hashMini(canvasBMRDataURI)) :
								canvasBMRDataURI
							)
							const $hash = await hashify(dataURI)
							const response = { dataURI, $hash }
							resolve(response)
							const timeEnd = timeStart()
							patchDom(response, timeEnd)
						}
					}))	
				}
				// document lie and send to trash
				canvasBMRDataURI = canvas.toDataURL()
				const hash = hashMini(canvasBMRDataURI)
				if (contextLie) {
					documentLie('canvasBMRContextDataURI', hash, contextLie)
					sendToTrash('canvasBMRContextDataURI', hash)
				}
				if (dataLie) {
					documentLie('canvasBMRDataURI', hash, dataLie)
					sendToTrash('canvasBMRDataURI', hash)
				}
				// fingerprint lie
				const data = { contextLie, dataLie }
				const $hash = await hashify(data)
				const response = { ...data, $hash }
				resolve(response)
				const timeEnd = timeStart()
				patchDom(response, timeEnd)
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// webgl
	const getCanvasWebgl = instanceId => {
		return new Promise(async resolve => {
			try {
				const timeStart = timer()
				// detect webgl lies
				const gl = 'WebGLRenderingContext' in window
				const webglGetParameter = gl && attempt(() => WebGLRenderingContext.prototype.getParameter)
				const webglGetExtension = gl && attempt(() => WebGLRenderingContext.prototype.getExtension)
				const webglGetSupportedExtensions = gl && attempt(() => WebGLRenderingContext.prototype.getSupportedExtensions)
				const paramLie = webglGetParameter ? hasLiedAPI(webglGetParameter, 'getParameter').lie : false
				const extLie = webglGetExtension ? hasLiedAPI(webglGetExtension, 'getExtension').lie : false
				const supportedExtLie = webglGetSupportedExtensions ? hasLiedAPI(webglGetSupportedExtensions, 'getSupportedExtensions').lie : false

				// detect webgl2 lies
				const gl2 = 'WebGL2RenderingContext' in window
				const webgl2GetParameter = gl2 && attempt(() => WebGL2RenderingContext.prototype.getParameter)
				const webgl2GetExtension = gl2 && attempt(() => WebGL2RenderingContext.prototype.getExtension)
				const webgl2GetSupportedExtensions = gl2 && attempt(() => WebGL2RenderingContext.prototype.getSupportedExtensions)
				const param2Lie = webgl2GetParameter ? hasLiedAPI(webgl2GetParameter, 'getParameter').lie : false
				const ext2Lie = webgl2GetExtension ? hasLiedAPI(webgl2GetExtension, 'getExtension').lie : false
				const supportedExt2Lie = webgl2GetSupportedExtensions ? hasLiedAPI(webgl2GetSupportedExtensions, 'getSupportedExtensions').lie : false

				// crreate canvas context
				const canvas = document.createElement('canvas')
				const canvas2 = document.createElement('canvas')
				const context = (
					canvas.getContext('webgl') ||
					canvas.getContext('experimental-webgl') ||
					canvas.getContext('moz-webgl') ||
					canvas.getContext('webkit-3d')
				)
				const context2 = canvas2.getContext('webgl2') || canvas2.getContext('experimental-webgl2')
				const getSupportedExtensions = (context, supportedExtLie, title) => {
					return new Promise(async resolve => {
						try {
							if (!context) {
								return resolve({ extensions: [] })
							}
							const extensions = caniuse(context, ['getSupportedExtensions'], [], true) || []
							if (!supportedExtLie) {
								return resolve({
									extensions: ( 
										!proxyBehavior(extensions) ? extensions : 
										sendToTrash(title, 'proxy behavior detected', []) 
									)
								})
							}

							// document lie and send to trash
							if (supportedExtLie) { 
								documentLie(title, extensions, supportedExtLie)
								sendToTrash(title, extensions)
							}
							// Fingerprint lie
							return resolve({
								extensions: [{ supportedExtLie }]
							})
						}
						catch (error) {
							captureError(error)
							return resolve({
								extensions: isBrave ? sendToTrash(title, null, []) : []
							})
						}
					})
				}

				const getSpecs = ([webgl, webgl2], [paramLie, param2Lie, extLie, ext2Lie]) => {
					return new Promise(async resolve => {
						const getShaderPrecisionFormat = (gl, shaderType) => {
							const low = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.LOW_FLOAT))
							const medium = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.MEDIUM_FLOAT))
							const high = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_FLOAT))
							const highInt = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_INT))
							return { low, medium, high, highInt }
						}
						const getMaxAnisotropy = gl => {
							const ext = (
								gl.getExtension('EXT_texture_filter_anisotropic') ||
								gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
								gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
							)
							return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : undefined
						}
						const camelCaseProps = data => {
							const renamed = {}
							Object.keys(data).map(key => {
								const val = data[key]
								const name = key.toLowerCase().split('_').map((word, i) => {
									return i == 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
								}).join('')
								renamed[name] = val
							})
							return renamed
						}
						const getShaderData = (name, shader) => {
							const data = {}
							for (const prop in shader) {
								const obj = shader[prop]
								data[name+'_'+prop+'_Precision'] = obj ? attempt(() => obj.precision) : undefined
								data[name+'_'+prop+'_RangeMax'] = obj ? attempt(() => obj.rangeMax) : undefined
								data[name+'_'+prop+'_RangeMin'] = obj ? attempt(() => obj.rangeMin) : undefined
							}
							return data
						}
						const getWebglSpecs = gl => {
							if (!caniuse(gl, ['getParameter'])) {
								return undefined
							}
							const data =  {
								VERSION: attempt(() => gl.getParameter(gl.VERSION)),
								SHADING_LANGUAGE_VERSION: attempt( () => gl.getParameter(gl.SHADING_LANGUAGE_VERSION)),
								ANTIALIAS: attempt(() => (gl.getContextAttributes() ? gl.getContextAttributes().antialias : undefined)),
								RED_BITS: attempt(() => gl.getParameter(gl.RED_BITS)),
								GREEN_BITS: attempt(() => gl.getParameter(gl.GREEN_BITS)),
								BLUE_BITS: attempt(() => gl.getParameter(gl.BLUE_BITS)),
								ALPHA_BITS: attempt(() => gl.getParameter(gl.ALPHA_BITS)),
								DEPTH_BITS: attempt(() => gl.getParameter(gl.DEPTH_BITS)),
								STENCIL_BITS: attempt(() => gl.getParameter(gl.STENCIL_BITS)),
								MAX_RENDERBUFFER_SIZE: attempt(() => gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)),
								MAX_COMBINED_TEXTURE_IMAGE_UNITS: attempt(() => gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)),
								MAX_CUBE_MAP_TEXTURE_SIZE: attempt(() => gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)),
								MAX_FRAGMENT_UNIFORM_VECTORS: attempt(() => gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)),
								MAX_TEXTURE_IMAGE_UNITS: attempt(() => gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)),
								MAX_TEXTURE_SIZE: attempt(() => gl.getParameter(gl.MAX_TEXTURE_SIZE)),
								MAX_VARYING_VECTORS: attempt(() => gl.getParameter(gl.MAX_VARYING_VECTORS)),
								MAX_VERTEX_ATTRIBS: attempt(() => gl.getParameter(gl.MAX_VERTEX_ATTRIBS)),
								MAX_VERTEX_TEXTURE_IMAGE_UNITS: attempt(() => gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)),
								MAX_VERTEX_UNIFORM_VECTORS: attempt(() => gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)),
								ALIASED_LINE_WIDTH_RANGE: attempt(() => [...gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)]),
								ALIASED_POINT_SIZE_RANGE: attempt(() => [...gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)]),
								MAX_VIEWPORT_DIMS: attempt(() => [...gl.getParameter(gl.MAX_VIEWPORT_DIMS)]),
								MAX_TEXTURE_MAX_ANISOTROPY_EXT: attempt(() => getMaxAnisotropy(gl)),
								...getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(gl, 'VERTEX_SHADER')),
								...getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(gl, 'FRAGMENT_SHADER')),
								MAX_DRAW_BUFFERS_WEBGL: attempt(() => {
									const buffers = gl.getExtension('WEBGL_draw_buffers')
									return buffers ? gl.getParameter(buffers.MAX_DRAW_BUFFERS_WEBGL) : undefined
								})
							}
							const response = camelCaseProps(data)
							if (!paramLie && !extLie) {
								return response
							}
							// document lie and send to trash
							const paramTitle = `webglGetParameter`
							const extTitle = `webglGetExtension`
							if (paramLie) { 
								documentLie(paramTitle, response, paramLie)
								sendToTrash(paramTitle, response)
							}
							if (extLie) {
								documentLie(extTitle, response, extLie)
								sendToTrash(extTitle, response)
							}
							// Fingerprint lie
							return { paramLie, extLie }
						}

						const getWebgl2Specs = gl => {
							if (!caniuse(gl, ['getParameter'])) {
								return undefined
							}
							const data = {
								MAX_VERTEX_UNIFORM_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS)),
								MAX_VERTEX_UNIFORM_BLOCKS: attempt(() => gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS)),
								MAX_VERTEX_OUTPUT_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS)),
								MAX_VARYING_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_VARYING_COMPONENTS)),
								MAX_FRAGMENT_UNIFORM_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS)),
								MAX_FRAGMENT_UNIFORM_BLOCKS: attempt(() => gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS)),
								MAX_FRAGMENT_INPUT_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS)),
								MIN_PROGRAM_TEXEL_OFFSET: attempt(() => gl.getParameter(gl.MIN_PROGRAM_TEXEL_OFFSET)),
								MAX_PROGRAM_TEXEL_OFFSET: attempt(() => gl.getParameter(gl.MAX_PROGRAM_TEXEL_OFFSET)),
								MAX_DRAW_BUFFERS: attempt(() => gl.getParameter(gl.MAX_DRAW_BUFFERS)),
								MAX_COLOR_ATTACHMENTS: attempt(() => gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)),
								MAX_SAMPLES: attempt(() => gl.getParameter(gl.MAX_SAMPLES)),
								MAX_3D_TEXTURE_SIZE: attempt(() => gl.getParameter(gl.MAX_3D_TEXTURE_SIZE)),
								MAX_ARRAY_TEXTURE_LAYERS: attempt(() => gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS)),
								MAX_TEXTURE_LOD_BIAS: attempt(() => gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS)),
								MAX_UNIFORM_BUFFER_BINDINGS: attempt(() => gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS)),
								MAX_UNIFORM_BLOCK_SIZE: attempt(() => gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE)),
								UNIFORM_BUFFER_OFFSET_ALIGNMENT: attempt(() => gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT)),
								MAX_COMBINED_UNIFORM_BLOCKS: attempt(() => gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS)),
								MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS)),
								MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS)),
								MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS)),
								MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: attempt(() => gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS)),
								MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS)),
								MAX_ELEMENT_INDEX: attempt(() => gl.getParameter(gl.MAX_ELEMENT_INDEX)),
								MAX_SERVER_WAIT_TIMEOUT: attempt(() => gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT))
							}
							const response = camelCaseProps(data)
							if (!param2Lie && !ext2Lie) {
								return response
							}
							// document lie and send to trash
							const paramTitle = `webgl2GetParameter`
							const extTitle = `webgl2GetExtension`
							if (param2Lie) { 
								documentLie(paramTitle, response, param2Lie)
								sendToTrash(paramTitle, response)
							}
							if (ext2Lie) {
								documentLie(extTitle, response, ext2Lie)
								sendToTrash(extTitle, response)
							}
							// Fingerprint lie
							return { param2Lie, ext2Lie }
						}
						const data = { webglSpecs: getWebglSpecs(webgl), webgl2Specs: getWebgl2Specs(webgl2) }
						return resolve(data)
					})
				}

				const getUnmasked = (context, [paramLie, extLie], [rendererTitle, vendorTitle]) => {
					return new Promise(async resolve => {
						try {
							if (!context) {
								return resolve({
									vendor: undefined,
									renderer: undefined
								})
							}
							const extension = caniuse(context, ['getExtension'], ['WEBGL_debug_renderer_info'], true)
							const vendor = extension && context.getParameter(extension.UNMASKED_VENDOR_WEBGL)
							const renderer = extension && context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
							const validate = (value, title) => {
								return (
									isBrave ? sendToTrash(title, value) :
									!proxyBehavior(value) ? value : 
									sendToTrash(title, 'proxy behavior detected')
								)
							}
							if (!paramLie && !extLie) {
								return resolve ({
									vendor: validate(vendor, vendorTitle),
									renderer: validate(renderer, rendererTitle)
								})
							}
							// document lie and send to trash
							const webglVendorAndRenderer = `${vendor}, ${renderer}`
							const paramTitle = `${vendorTitle}And${rendererTitle}Parameter`
							const extTitle = `${vendorTitle}And${rendererTitle}Extension`
							if (paramLie) { 
								documentLie(paramTitle, webglVendorAndRenderer, paramLie)
								sendToTrash(paramTitle, webglVendorAndRenderer)
							}
							if (extLie) {
								documentLie(extTitle, webglVendorAndRenderer, extLie)
								sendToTrash(extTitle, webglVendorAndRenderer)
							}
							// Fingerprint lie
							return resolve({
								vendor: { paramLie, extLie },
								renderer: { paramLie, extLie }
							})
						}
						catch (error) {
							captureError(error)
							return resolve({
								vendor: isBrave ? sendToTrash(vendorTitle, null) : undefined,
								renderer: isBrave ? sendToTrash(rendererTitle, null) : undefined
							})
						}
					})
				}
				const getDataURL = (canvas, context, [dataLie, contextLie], [canvasTitle, contextTitle]) => {
					return new Promise(async resolve => {
						try {
							if (!context) {
								resolve(undefined)
							}
							let canvasWebglDataURI = ''
							if (!dataLie && !contextLie) {
								const colorBufferBit = caniuse(context, ['COLOR_BUFFER_BIT'])
								caniuse(context, ['clearColor'], [0.2, 0.4, 0.6, 0.8], true)
								caniuse(context, ['clear'], [colorBufferBit], true)
								canvasWebglDataURI = canvas.toDataURL()
								const dataURI = (
									isBrave || isFirefox ? sendToTrash(canvasTitle, hashMini(canvasWebglDataURI)) : canvasWebglDataURI
								)
								const $hash = await hashify(dataURI)
								return resolve({ dataURI, $hash })
							}
							// document lie and send to trash
							canvasWebglDataURI = canvas.toDataURL()
							const hash = hashMini(canvasWebglDataURI)
							if (contextLie) {
								documentLie(contextTitle, hash, contextLie)
								sendToTrash(contextTitle, hash)
							}
							if (dataLie) {
								documentLie(canvasTitle, hash, dataLie)
								sendToTrash(canvasTitle, hash)
							}
							// fingerprint lie
							const data = { contextLie, dataLie }
							const $hash = await hashify(data)
							return resolve({ ...data, $hash })
						}
						catch (error) {
							captureError(error)
							return resolve({ dataURI: undefined, $hash: undefined })
						}
					})
				}

				const [
					supported,
					supported2,
					unmasked,
					unmasked2,
					dataURI,
					dataURI2,
					specs
				] = await Promise.all([
					getSupportedExtensions(context, supportedExtLie, 'webglSupportedExtensions'),
					getSupportedExtensions(context2, supportedExt2Lie, 'webgl2SupportedExtensions'),
					getUnmasked(context, [paramLie, extLie], ['webglRenderer', 'webglVendor']),
					getUnmasked(context2, [param2Lie, ext2Lie], ['webgl2Renderer', 'webgl2Vendor']),
					getDataURL(canvas, context, [dataLie, contextLie], ['canvasWebglDataURI', 'canvasWebglContextDataURI']),
					getDataURL(canvas2, context2, [dataLie, contextLie], ['canvasWebgl2DataURI', 'canvasWebgl2ContextDataURI']),
					getSpecs([context, context2], [paramLie, param2Lie, extLie, ext2Lie])
				]).catch(error => {
					console.error(error.message)
				})
				const data = {
					supported,
					supported2,
					unmasked,
					unmasked2,
					dataURI,
					dataURI2,
					specs
				}
				data.matchingUnmasked = JSON.stringify(data.unmasked) == JSON.stringify(data.unmasked2)
				data.matchingDataURI = data.dataURI.$hash == data.dataURI2.$hash

				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const timeEnd = timeStart()
				const id = `${instanceId}-canvas-webgl`
				const el = document.getElementById(id)
				const { webglSpecs, webgl2Specs } = specs
				const webglSpecsKeys = Object.keys(webglSpecs)
				const webgl2SpecsKeys = Object.keys(webgl2Specs)
				patch(el, html`
				<div>
					<strong>WebGLRenderingContext/WebGL2RenderingContext</strong>
					<div>hash: ${$hash}</div>
					<div>v1 toDataURL: ${dataURI.$hash ? dataURI.$hash : note.blocked}</div>
					<div>v1 parameters (${''+webglSpecsKeys.length}): ${
						modal(`${id}-p-v1`, webglSpecsKeys.map(key => `${key}: ${webglSpecs[key]}`).join('<br>'))
					}</div>
					<div>v1 extensions (${''+supported.extensions.length}): ${
						modal(`${id}-e-v1`, supported.extensions.join('<br>'))
					}</div>
					<div>v1 renderer: ${
						typeof unmasked.renderer == 'string' ? unmasked.renderer : `lie ${modal(`${id}-r-v1`, toJSONFormat(unmasked.renderer))}`
					}</div>
					<div>v1 vendor: ${
						typeof unmasked.vendor == 'string' ? unmasked.vendor : `lie ${modal(`${id}-v-v1`, toJSONFormat(unmasked.vendor))}`
					}</div>
					<div>v2 toDataURL: ${dataURI2.$hash ? dataURI2.$hash : note.blocked}</div>
					<div>v2 parameters (${''+webgl2SpecsKeys.length}): ${
						modal(`${id}-p-v2`, webgl2SpecsKeys.map(key => `${key}: ${webgl2Specs[key]}`).join('<br>'))
					}</div>
					<div>v2 extensions (${''+supported2.extensions.length}): ${
						modal(`${id}-e-v2`, supported2.extensions.join('<br>'))
					}</div>
					<div>v2 renderer: ${
						typeof unmasked2.renderer == 'string' ? unmasked2.renderer : `lie ${modal(`${id}-r-v2`, toJSONFormat(unmasked2.renderer))}`
					}</div>
					<div>v2 vendor: ${
						typeof unmasked2.vendor == 'string' ? unmasked2.vendor : `lie ${modal(`${id}-v-v2`, toJSONFormat(unmasked2.vendor))}`
					}</div>
					<div>matching renderer/vendor: ${''+data.matchingUnmasked}</div>
					<div>matching data URI: ${''+data.matchingDataURI}</div>
					<div class="time">performance: ${timeEnd} milliseconds</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// maths
	const getMaths = instanceId => {
		return new Promise(async resolve => {
			try {
				const n = 0.123
				const bigN = 5.860847362277284e+38
				const fns = [
					['acos', [n], `acos(${n})`, 1.4474840516030247],
					['acos', [Math.SQRT1_2], 'acos(Math.SQRT1_2)', 0.7853981633974483],
					
					['acosh', [1e308], 'acosh(1e308)', 709.889355822726],
					['acosh', [Math.PI], 'acosh(Math.PI)', 1.811526272460853],
					['acosh', [Math.SQRT2], 'acosh(Math.SQRT2)', 0.881373587019543],

					['asin', [n], `asin(${n})`, 0.12331227519187199],

					['asinh', [1e300], 'asinh(1e308)', 691.4686750787736],
					['asinh', [Math.PI], 'asinh(Math.PI)', 1.8622957433108482],

					['atan', [2], 'atan(2)', 1.1071487177940904],
					['atan', [Math.PI], 'atan(Math.PI)', 1.2626272556789115],

					['atanh', [0.5], 'atanh(0.5)', 0.5493061443340548],

					['atan2', [1e-310, 2], 'atan2(1e-310, 2)', 5e-311],
					['atan2', [Math.PI, 2], 'atan2(Math.PI)', 1.0038848218538872],

					['cbrt', [100], 'cbrt(100)', 4.641588833612779],
					['cbrt', [Math.PI], 'cbrt(Math.PI)', 1.4645918875615231],
					
					['cos', [n], `cos(${n})`, 0.9924450321351935],
					['cos', [Math.PI], 'cos(Math.PI)', -1],
					['cos', [bigN], `cos(${bigN})`, -0.10868049424995659, -0.10868049424995659, -0.9779661551196617], // unique in Tor

					['cosh', [1], 'cosh(1)', 1.5430806348152437],
					['cosh', [Math.PI], 'cosh(Math.PI)', 11.591953275521519],

					['expm1', [1], 'expm1(1)', 1.718281828459045],
					['expm1', [Math.PI], 'expm1(Math.PI)', 22.140692632779267],

					['exp', [n], `exp(${n})`, 1.1308844209474893],
					['exp', [Math.PI], 'exp(Math.PI)', 23.140692632779267],

					['hypot', [1, 2, 3, 4, 5, 6], 'hypot(1, 2, 3, 4, 5, 6)', 9.539392014169456],
					['hypot', [bigN, bigN], `hypot(${bigN}, ${bigN})`, 8.288489826731116e+38, 8.288489826731114e+38],

					['log', [n], `log(${n})`, -2.0955709236097197],
					['log', [Math.PI], 'log(Math.PI)', 1.1447298858494002],

					['log1p', [n], `log1p(${n})`, 0.11600367575630613],
					['log1p', [Math.PI], 'log1p(Math.PI)', 1.4210804127942926],

					['log10', [n], `log10(${n})`, -0.9100948885606021],
					['log10', [Math.PI], 'log10(Math.PI)', 0.4971498726941338, 0.49714987269413385],
					['log10', [Math.E], 'log10(Math.E])', 0.4342944819032518],
					['log10', [Math.LN2], 'log10(Math.LN2)', -0.1591745389548616],
					['log10', [Math.LOG2E], 'log10(Math.LOG2E)', 0.15917453895486158],
					['log10', [Math.LOG10E], 'log10(Math.LOG10E)', -0.36221568869946325],
					['log10', [Math.SQRT1_2], 'log10(Math.SQRT1_2)', -0.15051499783199057],
					['log10', [Math.SQRT2], 'log10(Math.SQRT2)', 0.1505149978319906, 0.15051499783199063],
					
					['sin', [bigN], `sin(${bigN})`, 0.994076732536068, 0.994076732536068, -0.20876350121720488], // unique in Tor
					['sin', [Math.PI], 'sin(Math.PI)', 1.2246467991473532e-16, 1.2246467991473532e-16, 1.2246063538223773e-16], // unique in Tor
					['sin', [Math.E], 'sin(Math.E])', 0.41078129050290885],
					['sin', [Math.LN2], 'sin(Math.LN2)', 0.6389612763136348],
					['sin', [Math.LOG2E], 'sin(Math.LOG2E)', 0.9918062443936637],
					['sin', [Math.LOG10E], 'sin(Math.LOG10E)', 0.4207704833137573],
					['sin', [Math.SQRT1_2], 'sin(Math.SQRT1_2)', 0.6496369390800625],
					['sin', [Math.SQRT2], 'sin(Math.SQRT2)', 0.9877659459927356],
					
					['sinh', [1], 'sinh(1)', 1.1752011936438014],
					['sinh', [Math.PI], 'sinh(Math.PI)', 11.548739357257748],
					['sinh', [Math.E], 'sinh(Math.E])', 7.544137102816975],
					['sinh', [Math.LN2], 'sinh(Math.LN2)', 0.75],
					['sinh', [Math.LOG2E], 'sinh(Math.LOG2E)', 1.9978980091062795],
					['sinh', [Math.LOG10E], 'sinh(Math.LOG10E)', 0.44807597941469024],
					['sinh', [Math.SQRT1_2], 'sinh(Math.SQRT1_2)', 0.7675231451261164],
					['sinh', [Math.SQRT2], 'sinh(Math.SQRT2)', 1.935066822174357],
					
					['sqrt', [n], `sqrt(${n})`, 0.3507135583350036],
					['sqrt', [Math.PI], 'sqrt(Math.PI)', 1.7724538509055159],
					
					['tan', [-1e308], 'tan(-1e308)', 0.5086861259107568],
					['tan', [Math.PI], 'tan(Math.PI)', -1.2246467991473532e-16],

					['tanh', [n], `tanh(${n})`, 0.12238344189440875],
					['tanh', [Math.PI], 'tanh(Math.PI)', 0.99627207622075],

					['pow', [n, -100], `pow(${n}, -100)`, 1.022089333584519e+91, 1.0220893335845176e+91],
					['pow', [Math.PI, -100], 'pow(Math.PI, -100)', 1.9275814160560204e-50, 1.9275814160560185e-50],
					['pow', [Math.E, -100], 'pow(Math.E, -100)', 3.7200759760208555e-44, 3.720075976020851e-44],
					['pow', [Math.LN2, -100], 'pow(Math.LN2, -100)', 8269017203802394, 8269017203802410],
					['pow', [Math.LN10, -100], 'pow(Math.LN10, -100)', 6.003867926738829e-37, 6.003867926738811e-37],
					['pow', [Math.LOG2E, -100], 'pow(Math.LOG2E, -100)', 1.20933355845501e-16, 1.2093335584550061e-16],
					['pow', [Math.LOG10E, -100], 'pow(Math.LOG10E, -100)', 1.6655929347585958e+36, 1.665592934758592e+36],
					['pow', [Math.SQRT1_2, -100], 'pow(Math.SQRT1_2, -100)', 1125899906842616.2, 1125899906842611.5],
					['pow', [Math.SQRT2, -100], 'pow(Math.SQRT2, -100)', 8.881784197001191e-16, 8.881784197001154e-16]
				]
				const data = {}
				fns.forEach(fn => {
					data[fn[2]] = attempt(() => {
						const result = Math[fn[0]](...fn[1])
						const chromeV8 = result == fn[3]
						const firefoxSpiderMonkey = fn[4] ? result == fn[4] : chromeV8
						const other = fn[5] ? result != fn[5] : true
						return { result, chromeV8, firefoxSpiderMonkey, other }
					})
				})
				const $hash = await hashify(data)
				return resolve({...data, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// browser console errors
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
	const getConsoleErrors = instanceId => {
		return new Promise(async resolve => {
			try {
				const errorTests = [
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
				const errors = getErrors([], errorTests)
				const $hash = await hashify(errors)
				return resolve({errors, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// timezone
	const getTimezone = instanceId => {
		return new Promise(async resolve => {
			try {
				const computeTimezoneOffset = () => {
					const toJSONParsed = (x) => JSON.parse(JSON.stringify(x))
					const utc = Date.parse(toJSONParsed(new Date()).split`Z`.join``)
					const now = +new Date()
					return +(((utc - now)/60000).toFixed(2))
				}		
				const dateGetTimezoneOffset = attempt(() => Date.prototype.getTimezoneOffset)
				const timezoneLie = dateGetTimezoneOffset ? hasLiedAPI(dateGetTimezoneOffset, 'getTimezoneOffset').lie : false
				const timezoneOffset = new Date().getTimezoneOffset()
				if (!timezoneLie) {
					const timezoneOffsetComputed = computeTimezoneOffset()
					const matching = timezoneOffsetComputed == timezoneOffset
					const notWithinParentheses = /.*\(|\).*/g
					const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
					const timezone = (''+new Date()).replace(notWithinParentheses, '')
					const data =  {
						timezoneOffsetComputed,
						timezoneOffset,
						matching,
						timezoneLocation,
						timezone
					}
					const $hash = await hashify(data)
					return resolve({...data, $hash })
				}
				// document lie and send to trash
				if (timezoneLie) {
					documentLie('timezoneOffset', timezoneOffset, timezoneLie)
				}
				if (timezoneLie || !trusted) {
					sendToTrash('timezoneOffset', timezoneOffset)
				}
				// Fingerprint lie
				const $hash = await hashify(timezoneLie)
				return resolve({timezoneLie, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// client rects
	const getClientRects = instanceId => {
		return new Promise(async resolve => {
			try {
				const toJSONParsed = (x) => JSON.parse(JSON.stringify(x))
				const rectContainer = document.getElementById('rect-container')
				const removeRectsFromDom = () => rectContainer.parentNode.removeChild(rectContainer)
				const elementGetClientRects = attempt(() => Element.prototype.getClientRects)
				const rectsLie = (
					elementGetClientRects ? hasLiedAPI(elementGetClientRects, 'getClientRects').lie : false
				)
				const rectElems = document.getElementsByClassName('rects')
				const clientRects = [...rectElems].map(el => {
					return toJSONParsed(el.getClientRects()[0])
				})
				if (!rectsLie) {
					removeRectsFromDom()
					const $hash = await hashify(clientRects)
					return resolve({clientRects, $hash })
				}
				// document lie and send to trash
				if (rectsLie) {
					documentLie('clientRects', hashMini(clientRects), rectsLie)
					sendToTrash('clientRects', hashMini(clientRects))
				}
				// Fingerprint lie
				removeRectsFromDom()
				const $hash = await hashify(rectsLie)
				return resolve({rectsLie, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	const getOfflineAudioContext = instanceId => {
		return new Promise(resolve => {
			try {
				if (!('OfflineAudioContext' in window || 'webkitOfflineAudioContext' in window)) {
					return promiseUndefined
				}
				const audioBuffer = 'AudioBuffer' in window
				const audioBufferGetChannelData = audioBuffer && attempt(() => AudioBuffer.prototype.getChannelData)
				const audioBufferCopyFromChannel = audioBuffer && attempt(() => AudioBuffer.prototype.copyFromChannel)
				const channelDataLie = (
					audioBufferGetChannelData ? hasLiedAPI(audioBufferGetChannelData, 'getChannelData').lie : false
				)
				const copyFromChannelLie = (
					audioBufferCopyFromChannel ? hasLiedAPI(audioBufferCopyFromChannel, 'copyFromChannel').lie : false
				)
				const audioContext = OfflineAudioContext || webkitOfflineAudioContext
				const context = new audioContext(1, 44100, 44100)
				const analyser = context.createAnalyser()
				const oscillator = context.createOscillator()
				const dynamicsCompressor = context.createDynamicsCompressor()
				const biquadFilter = context.createBiquadFilter()

				oscillator.type = 'triangle'
				oscillator.frequency.value = 10000

				if (dynamicsCompressor.threshold) { dynamicsCompressor.threshold.value = -50 }
				if (dynamicsCompressor.knee) { dynamicsCompressor.knee.value = 40 }
				if (dynamicsCompressor.ratio) { dynamicsCompressor.ratio.value = 12 }
				if (dynamicsCompressor.reduction) { dynamicsCompressor.reduction.value = -20 }
				if (dynamicsCompressor.attack) { dynamicsCompressor.attack.value = 0 }
				if (dynamicsCompressor.release) { dynamicsCompressor.release.value = 0.25 }

				oscillator.connect(dynamicsCompressor)
				dynamicsCompressor.connect(context.destination)
				oscillator.start(0)
				context.startRendering()

				let copySample = []
				let binsSample = []
				let matching = false
				
				const values = {
					['analyserNode.channelCount']: attempt(() => analyser.channelCount),
					['analyserNode.channelCountMode']: attempt(() => analyser.channelCountMode),
					['analyserNode.channelInterpretation']: attempt(() => analyser.channelInterpretation),
					['analyserNode.context.sampleRate']: attempt(() => analyser.context.sampleRate),
					['analyserNode.fftSize']: attempt(() => analyser.fftSize),
					['analyserNode.frequencyBinCount']: attempt(() => analyser.frequencyBinCount),
					['analyserNode.maxDecibels']: attempt(() => analyser.maxDecibels),
					['analyserNode.minDecibels']: attempt(() => analyser.minDecibels),
					['analyserNode.numberOfInputs']: attempt(() => analyser.numberOfInputs),
					['analyserNode.numberOfOutputs']: attempt(() => analyser.numberOfOutputs),
					['analyserNode.smoothingTimeConstant']: attempt(() => analyser.smoothingTimeConstant),
					['analyserNode.context.listener.forwardX.maxValue']: attempt(() => {
						const chain = ['context', 'listener', 'forwardX', 'maxValue']
						return caniuse(analyser, chain)
					}),
					['biquadFilterNode.gain.maxValue']: attempt(() => biquadFilter.gain.maxValue),
					['biquadFilterNode.frequency.defaultValue']: attempt(() => biquadFilter.frequency.defaultValue),
					['biquadFilterNode.frequency.maxValue']: attempt(() => biquadFilter.frequency.maxValue),
					['dynamicsCompressorNode.attack.defaultValue']: attempt(() => dynamicsCompressor.attack.defaultValue),
					['dynamicsCompressorNode.knee.defaultValue']: attempt(() => dynamicsCompressor.knee.defaultValue),
					['dynamicsCompressorNode.knee.maxValue']: attempt(() => dynamicsCompressor.knee.maxValue),
					['dynamicsCompressorNode.ratio.defaultValue']: attempt(() => dynamicsCompressor.ratio.defaultValue),
					['dynamicsCompressorNode.ratio.maxValue']: attempt(() => dynamicsCompressor.ratio.maxValue),
					['dynamicsCompressorNode.release.defaultValue']: attempt(() => dynamicsCompressor.release.defaultValue),
					['dynamicsCompressorNode.release.maxValue']: attempt(() => dynamicsCompressor.release.maxValue),
					['dynamicsCompressorNode.threshold.defaultValue']: attempt(() => dynamicsCompressor.threshold.defaultValue),
					['dynamicsCompressorNode.threshold.minValue']: attempt(() => dynamicsCompressor.threshold.minValue),
					['oscillatorNode.detune.maxValue']: attempt(() => oscillator.detune.maxValue),
					['oscillatorNode.detune.minValue']: attempt(() => oscillator.detune.minValue),
					['oscillatorNode.frequency.defaultValue']: attempt(() => oscillator.frequency.defaultValue),
					['oscillatorNode.frequency.maxValue']: attempt(() => oscillator.frequency.maxValue),
					['oscillatorNode.frequency.minValue']: attempt(() => oscillator.frequency.minValue)
				}
				
				return resolve(new Promise(resolve => {
					context.oncomplete = async event => {
						try {
							const copy = new Float32Array(44100)
							event.renderedBuffer.copyFromChannel(copy, 0)
							const bins = event.renderedBuffer.getChannelData(0)
							
							copySample = copy ? [...copy].slice(4500, 4600) : [sendToTrash('audioCopy', null)]
							binsSample = bins ? [...bins].slice(4500, 4600) : [sendToTrash('audioSample', null)]
							
							const copyJSON = copy && JSON.stringify([...copy].slice(4500, 4600))
							const binsJSON = bins && JSON.stringify([...bins].slice(4500, 4600))

							matching = binsJSON === copyJSON

							if (!matching) {
								documentLie('audioSampleAndCopyMatch', hashMini(matching), { audioSampleAndCopyMatch: false })
							}
							dynamicsCompressor.disconnect()
							oscillator.disconnect()
							if (isBrave) {
								sendToTrash('audio', binsSample[0])
								return resolve({
									copySample: [undefined],
									binsSample: [undefined],
									matching,
									values
								})
							}
							else if (proxyBehavior(binsSample)) {
								sendToTrash('audio', 'proxy behavior detected')
								return resolve(undefined)
							}
							// document lies and send to trash
							if (copyFromChannelLie) { 
								documentLie('audioBufferCopyFromChannel', (copySample[0] || null), copyFromChannelLie)
								sendToTrash('audioBufferCopyFromChannel', (copySample[0] || null))
							}
							if (channelDataLie) { 
								documentLie('audioBufferGetChannelData', (binsSample[0] || null), channelDataLie)
								sendToTrash('audioBufferGetChannelData', (binsSample[0] || null))
							}
							// Fingerprint lie if it exists
							const response = {
								copySample: copyFromChannelLie ? [copyFromChannelLie] : copySample,
								binsSample: channelDataLie ? [channelDataLie] : binsSample,
								matching,
								values
							}
							const $hash = await hashify(response)
							return resolve({...response, $hash })
						}
						catch (error) {
							captureError(error)
							dynamicsCompressor.disconnect()
							oscillator.disconnect()
							return resolve({
								copySample: [undefined],
								binsSample: [undefined],
								matching,
								values
							})
							const $hash = await hashify(response)
							return resolve({...response, $hash })
						}
					}
				}))
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}
	
	// inspired by Lalit Patel's fontdetect.js
	// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3
	const getFonts = (instanceId, fonts) => {
		return new Promise(async resolve => {
			try {
				const htmlElementPrototype = attempt(() => HTMLElement.prototype)
				const detectLies = (name, value) => {
					const lie = htmlElementPrototype ? hasLiedAPI(htmlElementPrototype, name).lie : false
					if (lie) {
						documentLie(name, value, lie)
						return sendToTrash(name, value)
					}
					return value
				}
				const toInt = val => ~~val // protect against decimal noise
				const baseFonts = ['monospace', 'sans-serif', 'serif']
				const text = 'mmmmmmmmmmlli'
				const baseOffsetWidth = {}
				const baseOffsetHeight = {}
				const style = ` > span {
					position: absolute!important;
					left: -9999px!important;
					font-size: 256px!important;
					font-style: normal!important;
					font-weight: normal!important;
					letter-spacing: normal!important;
					line-break: auto!important;
					line-height: normal!important;
					text-transform: none!important;
					text-align: left!important;
					text-decoration: none!important;
					text-shadow: none!important;
					white-space: normal!important;
					word-break: normal!important;
					word-spacing: normal!important;
				}`
				const baseFontSpan = font => {
					return `<span class="basefont" data-font="${font}" style="font-family: ${font}!important">${text}</span>`
				}
				const systemFontSpan = (font, basefont) => {
					return `<span class="system-font" data-font="${font}" data-basefont="${basefont}" style="font-family: ${`'${font}', ${basefont}`}!important">${text}</span>`
				}
				const fontsElem = document.getElementById('font-detector')
				const stageElem = document.getElementById('font-detector-stage')
				const detectedFonts = {}
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
						// detect and document lies
						const spanLieDetect = [...basefontElems][0]
						const offsetWidth = detectLies('offsetWidth', spanLieDetect.offsetWidth)
						const offsetHeight = detectLies('offsetHeight', spanLieDetect.offsetHeight)
						if (!offsetWidth || !offsetHeight) { return resolve(undefined) }
						// Compute fingerprint
						;[...basefontElems].forEach(span => {
							const { dataset: { font }, offsetWidth, offsetHeight } = span
							baseOffsetWidth[font] = toInt(offsetWidth)
							baseOffsetHeight[font] = toInt(offsetHeight)
							return
						})
						;[...systemFontElems].forEach(span => {
							const { dataset: { font } }= span
							if (!detectedFonts[font]) {
								const { dataset: { basefont }, offsetWidth, offsetHeight } = span
								const widthMatchesBase = toInt(offsetWidth) == baseOffsetWidth[basefont]
								const heightMatchesBase = toInt(offsetHeight) == baseOffsetHeight[basefont]
								const detected = !widthMatchesBase || !heightMatchesBase
								if (detected) { detectedFonts[font] = true }
							}
							return
						})
						return fontsElem.removeChild(testElem)
					}
				)
				const fontList = Object.keys(detectedFonts)
				const $hash = await hashify(fontList)
				return resolve({fonts: fontList, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	const fontList=["Andale Mono","Arial","Arial Black","Arial Hebrew","Arial MT","Arial Narrow","Arial Rounded MT Bold","Arial Unicode MS","Bitstream Vera Sans Mono","Book Antiqua","Bookman Old Style","Calibri","Cambria","Cambria Math","Century","Century Gothic","Century Schoolbook","Comic Sans","Comic Sans MS","Consolas","Courier","Courier New","Geneva","Georgia","Helvetica","Helvetica Neue","Impact","Lucida Bright","Lucida Calligraphy","Lucida Console","Lucida Fax","LUCIDA GRANDE","Lucida Handwriting","Lucida Sans","Lucida Sans Typewriter","Lucida Sans Unicode","Microsoft Sans Serif","Monaco","Monotype Corsiva","MS Gothic","MS Outlook","MS PGothic","MS Reference Sans Serif","MS Sans Serif","MS Serif","MYRIAD","MYRIAD PRO","Palatino","Palatino Linotype","Segoe Print","Segoe Script","Segoe UI","Segoe UI Light","Segoe UI Semibold","Segoe UI Symbol","Tahoma","Times","Times New Roman","Times New Roman PS","Trebuchet MS","Verdana","Wingdings","Wingdings 2","Wingdings 3"],extendedFontList=["Abadi MT Condensed Light","Academy Engraved LET","ADOBE CASLON PRO","Adobe Garamond","ADOBE GARAMOND PRO","Agency FB","Aharoni","Albertus Extra Bold","Albertus Medium","Algerian","Amazone BT","American Typewriter","American Typewriter Condensed","AmerType Md BT","Andalus","Angsana New","AngsanaUPC","Antique Olive","Aparajita","Apple Chancery","Apple Color Emoji","Apple SD Gothic Neo","Arabic Typesetting","ARCHER","ARNO PRO","Arrus BT","Aurora Cn BT","AvantGarde Bk BT","AvantGarde Md BT","AVENIR","Ayuthaya","Bandy","Bangla Sangam MN","Bank Gothic","BankGothic Md BT","Baskerville","Baskerville Old Face","Batang","BatangChe","Bauer Bodoni","Bauhaus 93","Bazooka","Bell MT","Bembo","Benguiat Bk BT","Berlin Sans FB","Berlin Sans FB Demi","Bernard MT Condensed","BernhardFashion BT","BernhardMod BT","Big Caslon","BinnerD","Blackadder ITC","BlairMdITC TT","Bodoni 72","Bodoni 72 Oldstyle","Bodoni 72 Smallcaps","Bodoni MT","Bodoni MT Black","Bodoni MT Condensed","Bodoni MT Poster Compressed","Bookshelf Symbol 7","Boulder","Bradley Hand","Bradley Hand ITC","Bremen Bd BT","Britannic Bold","Broadway","Browallia New","BrowalliaUPC","Brush Script MT","Californian FB","Calisto MT","Calligrapher","Candara","CaslonOpnface BT","Castellar","Centaur","Cezanne","CG Omega","CG Times","Chalkboard","Chalkboard SE","Chalkduster","Charlesworth","Charter Bd BT","Charter BT","Chaucer","ChelthmITC Bk BT","Chiller","Clarendon","Clarendon Condensed","CloisterBlack BT","Cochin","Colonna MT","Constantia","Cooper Black","Copperplate","Copperplate Gothic","Copperplate Gothic Bold","Copperplate Gothic Light","CopperplGoth Bd BT","Corbel","Cordia New","CordiaUPC","Cornerstone","Coronet","Cuckoo","Curlz MT","DaunPenh","Dauphin","David","DB LCD Temp","DELICIOUS","Denmark","DFKai-SB","Didot","DilleniaUPC","DIN","DokChampa","Dotum","DotumChe","Ebrima","Edwardian Script ITC","Elephant","English 111 Vivace BT","Engravers MT","EngraversGothic BT","Eras Bold ITC","Eras Demi ITC","Eras Light ITC","Eras Medium ITC","EucrosiaUPC","Euphemia","Euphemia UCAS","EUROSTILE","Exotc350 Bd BT","FangSong","Felix Titling","Fixedsys","FONTIN","Footlight MT Light","Forte","FrankRuehl","Fransiscan","Freefrm721 Blk BT","FreesiaUPC","Freestyle Script","French Script MT","FrnkGothITC Bk BT","Fruitger","FRUTIGER","Futura","Futura Bk BT","Futura Lt BT","Futura Md BT","Futura ZBlk BT","FuturaBlack BT","Gabriola","Galliard BT","Gautami","Geeza Pro","Geometr231 BT","Geometr231 Hv BT","Geometr231 Lt BT","GeoSlab 703 Lt BT","GeoSlab 703 XBd BT","Gigi","Gill Sans","Gill Sans MT","Gill Sans MT Condensed","Gill Sans MT Ext Condensed Bold","Gill Sans Ultra Bold","Gill Sans Ultra Bold Condensed","Gisha","Gloucester MT Extra Condensed","GOTHAM","GOTHAM BOLD","Goudy Old Style","Goudy Stout","GoudyHandtooled BT","GoudyOLSt BT","Gujarati Sangam MN","Gulim","GulimChe","Gungsuh","GungsuhChe","Gurmukhi MN","Haettenschweiler","Harlow Solid Italic","Harrington","Heather","Heiti SC","Heiti TC","HELV","Herald","High Tower Text","Hiragino Kaku Gothic ProN","Hiragino Mincho ProN","Hoefler Text","Humanst 521 Cn BT","Humanst521 BT","Humanst521 Lt BT","Imprint MT Shadow","Incised901 Bd BT","Incised901 BT","Incised901 Lt BT","INCONSOLATA","Informal Roman","Informal011 BT","INTERSTATE","IrisUPC","Iskoola Pota","JasmineUPC","Jazz LET","Jenson","Jester","Jokerman","Juice ITC","Kabel Bk BT","Kabel Ult BT","Kailasa","KaiTi","Kalinga","Kannada Sangam MN","Kartika","Kaufmann Bd BT","Kaufmann BT","Khmer UI","KodchiangUPC","Kokila","Korinna BT","Kristen ITC","Krungthep","Kunstler Script","Lao UI","Latha","Leelawadee","Letter Gothic","Levenim MT","LilyUPC","Lithograph","Lithograph Light","Long Island","Lydian BT","Magneto","Maiandra GD","Malayalam Sangam MN","Malgun Gothic","Mangal","Marigold","Marion","Marker Felt","Market","Marlett","Matisse ITC","Matura MT Script Capitals","Meiryo","Meiryo UI","Microsoft Himalaya","Microsoft JhengHei","Microsoft New Tai Lue","Microsoft PhagsPa","Microsoft Tai Le","Microsoft Uighur","Microsoft YaHei","Microsoft Yi Baiti","MingLiU","MingLiU_HKSCS","MingLiU_HKSCS-ExtB","MingLiU-ExtB","Minion","Minion Pro","Miriam","Miriam Fixed","Mistral","Modern","Modern No. 20","Mona Lisa Solid ITC TT","Mongolian Baiti","MONO","MoolBoran","Mrs Eaves","MS LineDraw","MS Mincho","MS PMincho","MS Reference Specialty","MS UI Gothic","MT Extra","MUSEO","MV Boli","Nadeem","Narkisim","NEVIS","News Gothic","News GothicMT","NewsGoth BT","Niagara Engraved","Niagara Solid","Noteworthy","NSimSun","Nyala","OCR A Extended","Old Century","Old English Text MT","Onyx","Onyx BT","OPTIMA","Oriya Sangam MN","OSAKA","OzHandicraft BT","Palace Script MT","Papyrus","Parchment","Party LET","Pegasus","Perpetua","Perpetua Titling MT","PetitaBold","Pickwick","Plantagenet Cherokee","Playbill","PMingLiU","PMingLiU-ExtB","Poor Richard","Poster","PosterBodoni BT","PRINCETOWN LET","Pristina","PTBarnum BT","Pythagoras","Raavi","Rage Italic","Ravie","Ribbon131 Bd BT","Rockwell","Rockwell Condensed","Rockwell Extra Bold","Rod","Roman","Sakkal Majalla","Santa Fe LET","Savoye LET","Sceptre","Script","Script MT Bold","SCRIPTINA","Serifa","Serifa BT","Serifa Th BT","ShelleyVolante BT","Sherwood","Shonar Bangla","Showcard Gothic","Shruti","Signboard","SILKSCREEN","SimHei","Simplified Arabic","Simplified Arabic Fixed","SimSun","SimSun-ExtB","Sinhala Sangam MN","Sketch Rockwell","Skia","Small Fonts","Snap ITC","Snell Roundhand","Socket","Souvenir Lt BT","Staccato222 BT","Steamer","Stencil","Storybook","Styllo","Subway","Swis721 BlkEx BT","Swiss911 XCm BT","Sylfaen","Synchro LET","System","Tamil Sangam MN","Technical","Teletype","Telugu Sangam MN","Tempus Sans ITC","Terminal","Thonburi","Traditional Arabic","Trajan","TRAJAN PRO","Tristan","Tubular","Tunga","Tw Cen MT","Tw Cen MT Condensed","Tw Cen MT Condensed Extra Bold","TypoUpright BT","Unicorn","Univers","Univers CE 55 Medium","Univers Condensed","Utsaah","Vagabond","Vani","Vijaya","Viner Hand ITC","VisualUI","Vivaldi","Vladimir Script","Vrinda","Westminster","WHITNEY","Wide Latin","ZapfEllipt BT","ZapfHumnst BT","ZapfHumnst Dm BT","Zapfino","Zurich BlkEx BT","Zurich Ex BT","ZWAdobeF"],googleFonts=["ABeeZee","Abel","Abhaya Libre","Abril Fatface","Aclonica","Acme","Actor","Adamina","Advent Pro","Aguafina Script","Akronim","Aladin","Aldrich","Alef","Alegreya","Alegreya SC","Alegreya Sans","Alegreya Sans SC","Aleo","Alex Brush","Alfa Slab One","Alice","Alike","Alike Angular","Allan","Allerta","Allerta Stencil","Allura","Almarai","Almendra","Almendra Display","Almendra SC","Amarante","Amaranth","Amatic SC","Amethysta","Amiko","Amiri","Amita","Anaheim","Andada","Andika","Angkor","Annie Use Your Telescope","Anonymous Pro","Antic","Antic Didone","Antic Slab","Anton","Arapey","Arbutus","Arbutus Slab","Architects Daughter","Archivo","Archivo Black","Archivo Narrow","Aref Ruqaa","Arima Madurai","Arimo","Arizonia","Armata","Arsenal","Artifika","Arvo","Arya","Asap","Asap Condensed","Asar","Asset","Assistant","Astloch","Asul","Athiti","Atma","Atomic Age","Aubrey","Audiowide","Autour One","Average","Average Sans","Averia Gruesa Libre","Averia Libre","Averia Sans Libre","Averia Serif Libre","B612","B612 Mono","Bad Script","Bahiana","Bahianita","Bai Jamjuree","Baloo","Baloo Bhai","Baloo Bhaijaan","Baloo Bhaina","Baloo Chettan","Baloo Da","Baloo Paaji","Baloo Tamma","Baloo Tammudu","Baloo Thambi","Balthazar","Bangers","Barlow","Barlow Condensed","Barlow Semi Condensed","Barriecito","Barrio","Basic","Battambang","Baumans","Bayon","Be Vietnam","Bebas Neue","Belgrano","Bellefair","Belleza","BenchNine","Bentham","Berkshire Swash","Beth Ellen","Bevan","Big Shoulders Display","Big Shoulders Text","Bigelow Rules","Bigshot One","Bilbo","Bilbo Swash Caps","BioRhyme","BioRhyme Expanded","Biryani","Bitter","Black And White Picture","Black Han Sans","Black Ops One","Blinker","Bokor","Bonbon","Boogaloo","Bowlby One","Bowlby One SC","Brawler","Bree Serif","Bubblegum Sans","Bubbler One","Buda","Buenard","Bungee","Bungee Hairline","Bungee Inline","Bungee Outline","Bungee Shade","Butcherman","Butterfly Kids","Cabin","Cabin Condensed","Cabin Sketch","Caesar Dressing","Cagliostro","Cairo","Calligraffitti","Cambay","Cambo","Candal","Cantarell","Cantata One","Cantora One","Capriola","Cardo","Carme","Carrois Gothic","Carrois Gothic SC","Carter One","Catamaran","Caudex","Caveat","Caveat Brush","Cedarville Cursive","Ceviche One","Chakra Petch","Changa","Changa One","Chango","Charm","Charmonman","Chathura","Chau Philomene One","Chela One","Chelsea Market","Chenla","Cherry Cream Soda","Cherry Swash","Chewy","Chicle","Chilanka","Chivo","Chonburi","Cinzel","Cinzel Decorative","Clicker Script","Coda","Coda Caption","Codystar","Coiny","Combo","Comfortaa","Coming Soon","Concert One","Condiment","Content","Contrail One","Convergence","Cookie","Copse","Corben","Cormorant","Cormorant Garamond","Cormorant Infant","Cormorant SC","Cormorant Unicase","Cormorant Upright","Courgette","Cousine","Coustard","Covered By Your Grace","Crafty Girls","Creepster","Crete Round","Crimson Pro","Crimson Text","Croissant One","Crushed","Cuprum","Cute Font","Cutive","Cutive Mono","DM Sans","DM Serif Display","DM Serif Text","Damion","Dancing Script","Dangrek","Darker Grotesque","David Libre","Dawning of a New Day","Days One","Dekko","Delius","Delius Swash Caps","Delius Unicase","Della Respira","Denk One","Devonshire","Dhurjati","Didact Gothic","Diplomata","Diplomata SC","Do Hyeon","Dokdo","Domine","Donegal One","Doppio One","Dorsa","Dosis","Dr Sugiyama","Duru Sans","Dynalight","EB Garamond","Eagle Lake","East Sea Dokdo","Eater","Economica","Eczar","El Messiri","Electrolize","Elsie","Elsie Swash Caps","Emblema One","Emilys Candy","Encode Sans","Encode Sans Condensed","Encode Sans Expanded","Encode Sans Semi Condensed","Encode Sans Semi Expanded","Engagement","Englebert","Enriqueta","Erica One","Esteban","Euphoria Script","Ewert","Exo","Exo 2","Expletus Sans","Fahkwang","Fanwood Text","Farro","Farsan","Fascinate","Fascinate Inline","Faster One","Fasthand","Fauna One","Faustina","Federant","Federo","Felipa","Fenix","Finger Paint","Fira Code","Fira Mono","Fira Sans","Fira Sans Condensed","Fira Sans Extra Condensed","Fjalla One","Fjord One","Flamenco","Flavors","Fondamento","Fontdiner Swanky","Forum","Francois One","Frank Ruhl Libre","Freckle Face","Fredericka the Great","Fredoka One","Freehand","Fresca","Frijole","Fruktur","Fugaz One","GFS Didot","GFS Neohellenic","Gabriela","Gaegu","Gafata","Galada","Galdeano","Galindo","Gamja Flower","Gayathri","Gentium Basic","Gentium Book Basic","Geo","Geostar","Geostar Fill","Germania One","Gidugu","Gilda Display","Give You Glory","Glass Antiqua","Glegoo","Gloria Hallelujah","Goblin One","Gochi Hand","Gorditas","Gothic A1","Goudy Bookletter 1911","Graduate","Grand Hotel","Gravitas One","Great Vibes","Grenze","Griffy","Gruppo","Gudea","Gugi","Gurajada","Habibi","Halant","Hammersmith One","Hanalei","Hanalei Fill","Handlee","Hanuman","Happy Monkey","Harmattan","Headland One","Heebo","Henny Penny","Hepta Slab","Herr Von Muellerhoff","Hi Melody","Hind","Hind Guntur","Hind Madurai","Hind Siliguri","Hind Vadodara","Holtwood One SC","Homemade Apple","Homenaje","IBM Plex Mono","IBM Plex Sans","IBM Plex Sans Condensed","IBM Plex Serif","IM Fell DW Pica","IM Fell DW Pica SC","IM Fell Double Pica","IM Fell Double Pica SC","IM Fell English","IM Fell English SC","IM Fell French Canon","IM Fell French Canon SC","IM Fell Great Primer","IM Fell Great Primer SC","Iceberg","Iceland","Imprima","Inconsolata","Inder","Indie Flower","Inika","Inknut Antiqua","Irish Grover","Istok Web","Italiana","Italianno","Itim","Jacques Francois","Jacques Francois Shadow","Jaldi","Jim Nightshade","Jockey One","Jolly Lodger","Jomhuria","Jomolhari","Josefin Sans","Josefin Slab","Joti One","Jua","Judson","Julee","Julius Sans One","Junge","Jura","Just Another Hand","Just Me Again Down Here","K2D","Kadwa","Kalam","Kameron","Kanit","Kantumruy","Karla","Karma","Katibeh","Kaushan Script","Kavivanar","Kavoon","Kdam Thmor","Keania One","Kelly Slab","Kenia","Khand","Khmer","Khula","Kirang Haerang","Kite One","Knewave","KoHo","Kodchasan","Kosugi","Kosugi Maru","Kotta One","Koulen","Kranky","Kreon","Kristi","Krona One","Krub","Kulim Park","Kumar One","Kumar One Outline","Kurale","La Belle Aurore","Lacquer","Laila","Lakki Reddy","Lalezar","Lancelot","Lateef","Lato","League Script","Leckerli One","Ledger","Lekton","Lemon","Lemonada","Lexend Deca","Lexend Exa","Lexend Giga","Lexend Mega","Lexend Peta","Lexend Tera","Lexend Zetta","Libre Barcode 128","Libre Barcode 128 Text","Libre Barcode 39","Libre Barcode 39 Extended","Libre Barcode 39 Extended Text","Libre Barcode 39 Text","Libre Baskerville","Libre Caslon Display","Libre Caslon Text","Libre Franklin","Life Savers","Lilita One","Lily Script One","Limelight","Linden Hill","Literata","Liu Jian Mao Cao","Livvic","Lobster","Lobster Two","Londrina Outline","Londrina Shadow","Londrina Sketch","Londrina Solid","Long Cang","Lora","Love Ya Like A Sister","Loved by the King","Lovers Quarrel","Luckiest Guy","Lusitana","Lustria","M PLUS 1p","M PLUS Rounded 1c","Ma Shan Zheng","Macondo","Macondo Swash Caps","Mada","Magra","Maiden Orange","Maitree","Major Mono Display","Mako","Mali","Mallanna","Mandali","Manjari","Mansalva","Manuale","Marcellus","Marcellus SC","Marck Script","Margarine","Markazi Text","Marko One","Marmelad","Martel","Martel Sans","Marvel","Mate","Mate SC","Material Icons","Maven Pro","McLaren","Meddon","MedievalSharp","Medula One","Meera Inimai","Megrim","Meie Script","Merienda","Merienda One","Merriweather","Merriweather Sans","Metal","Metal Mania","Metamorphous","Metrophobic","Michroma","Milonga","Miltonian","Miltonian Tattoo","Mina","Miniver","Miriam Libre","Mirza","Miss Fajardose","Mitr","Modak","Modern Antiqua","Mogra","Molengo","Molle","Monda","Monofett","Monoton","Monsieur La Doulaise","Montaga","Montez","Montserrat","Montserrat Alternates","Montserrat Subrayada","Moul","Moulpali","Mountains of Christmas","Mouse Memoirs","Mr Bedfort","Mr Dafoe","Mr De Haviland","Mrs Saint Delafield","Mrs Sheppards","Mukta","Mukta Mahee","Mukta Malar","Mukta Vaani","Muli","Mystery Quest","NTR","Nanum Brush Script","Nanum Gothic","Nanum Gothic Coding","Nanum Myeongjo","Nanum Pen Script","Neucha","Neuton","New Rocker","News Cycle","Niconne","Niramit","Nixie One","Nobile","Nokora","Norican","Nosifer","Notable","Nothing You Could Do","Noticia Text","Noto Sans","Noto Sans HK","Noto Sans JP","Noto Sans KR","Noto Sans SC","Noto Sans TC","Noto Serif","Noto Serif JP","Noto Serif KR","Noto Serif SC","Noto Serif TC","Nova Cut","Nova Flat","Nova Mono","Nova Oval","Nova Round","Nova Script","Nova Slim","Nova Square","Numans","Nunito","Nunito Sans","Odor Mean Chey","Offside","Old Standard TT","Oldenburg","Oleo Script","Oleo Script Swash Caps","Open Sans","Open Sans Condensed","Oranienbaum","Orbitron","Oregano","Orienta","Original Surfer","Oswald","Over the Rainbow","Overlock","Overlock SC","Overpass","Overpass Mono","Ovo","Oxygen","Oxygen Mono","PT Mono","PT Sans","PT Sans Caption","PT Sans Narrow","PT Serif","PT Serif Caption","Pacifico","Padauk","Palanquin","Palanquin Dark","Pangolin","Paprika","Parisienne","Passero One","Passion One","Pathway Gothic One","Patrick Hand","Patrick Hand SC","Pattaya","Patua One","Pavanam","Paytone One","Peddana","Peralta","Permanent Marker","Petit Formal Script","Petrona","Philosopher","Piedra","Pinyon Script","Pirata One","Plaster","Play","Playball","Playfair Display","Playfair Display SC","Podkova","Poiret One","Poller One","Poly","Pompiere","Pontano Sans","Poor Story","Poppins","Port Lligat Sans","Port Lligat Slab","Pragati Narrow","Prata","Preahvihear","Press Start 2P","Pridi","Princess Sofia","Prociono","Prompt","Prosto One","Proza Libre","Public Sans","Puritan","Purple Purse","Quando","Quantico","Quattrocento","Quattrocento Sans","Questrial","Quicksand","Quintessential","Qwigley","Racing Sans One","Radley","Rajdhani","Rakkas","Raleway","Raleway Dots","Ramabhadra","Ramaraja","Rambla","Rammetto One","Ranchers","Rancho","Ranga","Rasa","Rationale","Ravi Prakash","Red Hat Display","Red Hat Text","Redressed","Reem Kufi","Reenie Beanie","Revalia","Rhodium Libre","Ribeye","Ribeye Marrow","Righteous","Risque","Roboto","Roboto Condensed","Roboto Mono","Roboto Slab","Rochester","Rock Salt","Rokkitt","Romanesco","Ropa Sans","Rosario","Rosarivo","Rouge Script","Rozha One","Rubik","Rubik Mono One","Ruda","Rufina","Ruge Boogie","Ruluko","Rum Raisin","Ruslan Display","Russo One","Ruthie","Rye","Sacramento","Sahitya","Sail","Saira","Saira Condensed","Saira Extra Condensed","Saira Semi Condensed","Saira Stencil One","Salsa","Sanchez","Sancreek","Sansita","Sarabun","Sarala","Sarina","Sarpanch","Satisfy","Sawarabi Gothic","Sawarabi Mincho","Scada","Scheherazade","Schoolbell","Scope One","Seaweed Script","Secular One","Sedgwick Ave","Sedgwick Ave Display","Sevillana","Seymour One","Shadows Into Light","Shadows Into Light Two","Shanti","Share","Share Tech","Share Tech Mono","Shojumaru","Short Stack","Shrikhand","Siemreap","Sigmar One","Signika","Signika Negative","Simonetta","Single Day","Sintony","Sirin Stencil","Six Caps","Skranji","Slabo 13px","Slabo 27px","Slackey","Smokum","Smythe","Sniglet","Snippet","Snowburst One","Sofadi One","Sofia","Song Myung","Sonsie One","Sorts Mill Goudy","Source Code Pro","Source Sans Pro","Source Serif Pro","Space Mono","Special Elite","Spectral","Spectral SC","Spicy Rice","Spinnaker","Spirax","Squada One","Sree Krushnadevaraya","Sriracha","Srisakdi","Staatliches","Stalemate","Stalinist One","Stardos Stencil","Stint Ultra Condensed","Stint Ultra Expanded","Stoke","Strait","Stylish","Sue Ellen Francisco","Suez One","Sumana","Sunflower","Sunshiney","Supermercado One","Sura","Suranna","Suravaram","Suwannaphum","Swanky and Moo Moo","Syncopate","Tajawal","Tangerine","Taprom","Tauri","Taviraj","Teko","Telex","Tenali Ramakrishna","Tenor Sans","Text Me One","Thasadith","The Girl Next Door","Tienne","Tillana","Timmana","Tinos","Titan One","Titillium Web","Tomorrow","Trade Winds","Trirong","Trocchi","Trochut","Trykker","Tulpen One","Turret Road","Ubuntu","Ubuntu Condensed","Ubuntu Mono","Ultra","Uncial Antiqua","Underdog","Unica One","UnifrakturCook","UnifrakturMaguntia","Unkempt","Unlock","Unna","VT323","Vampiro One","Varela","Varela Round","Vast Shadow","Vesper Libre","Vibes","Vibur","Vidaloka","Viga","Voces","Volkhov","Vollkorn","Vollkorn SC","Voltaire","Waiting for the Sunrise","Wallpoet","Walter Turncoat","Warnes","Wellfleet","Wendy One","Wire One","Work Sans","Yanone Kaffeesatz","Yantramanav","Yatra One","Yellowtail","Yeon Sung","Yeseva One","Yesteryear","Yrsa","ZCOOL KuaiLe","ZCOOL QingKe HuangYou","ZCOOL XiaoWei","Zeyada","Zhi Mang Xing","Zilla Slab","Zilla Slab Highlight"],notoFonts=["Noto Naskh Arabic","Noto Sans Armenian","Noto Sans Bengali","Noto Sans Buginese","Noto Sans Canadian Aboriginal","Noto Sans Cherokee","Noto Sans Devanagari","Noto Sans Ethiopic","Noto Sans Georgian","Noto Sans Gujarati","Noto Sans Gurmukhi","Noto Sans Hebrew","Noto Sans JP Regular","Noto Sans KR Regular","Noto Sans Kannada","Noto Sans Khmer","Noto Sans Lao","Noto Sans Malayalam","Noto Sans Mongolian","Noto Sans Myanmar","Noto Sans Oriya","Noto Sans SC Regular","Noto Sans Sinhala","Noto Sans TC Regular","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Thaana","Noto Sans Thai","Noto Sans Tibetan","Noto Sans Yi","Noto Serif Armenian","Noto Serif Khmer","Noto Serif Lao","Noto Serif Thai"];

	// scene
	const scene = html`
	<fingerprint>
		<div id="fingerprint-data">
			<div>
				<visitor><div id="visitor"><div class="visitor-loader"></div></div></visitor>
				Data auto deletes <a href="https://github.com/abrahamjuliot/creepjs/blob/8d6603ee39c9534cad700b899ef221e0ee97a5a4/server.gs#L24" target="_blank">every 7 days</a>
			</div>
			<div id="${instanceId}-lies"></div>
			<div id="${instanceId}-trash"></div>
			<div id="${instanceId}-captured-errors"></div>
			<div id="${instanceId}-worker-scope">
				<strong>WorkerGlobalScope: WorkerNavigator/OffscreenCanvas</strong>
				<div>hash:</div>
				<div>hardwareConcurrency:</div>
				<div>language:</div>
				<div>platform:</div>
				<div>system:</div>
				<div>canvas 2d:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-cloudflare">
				<strong>Cloudflare</strong>
				<div>hash:</div>
				<div>ip address:</div>
				<div>system:</div>
				<div>ip location:</div>
				<div>tls version:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-canvas-2d">
				<strong>CanvasRenderingContext2D</strong>
				<div>hash:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-canvas-bitmap-renderer">
				<strong>ImageBitmapRenderingContext</strong>
				<div>hash:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-canvas-webgl">
				<strong>WebGLRenderingContext/WebGL2RenderingContext</strong>
					<div>hash:</div>
					<div>v1 toDataURL:</div>
					<div>v1 parameters (0):</div>
					<div>v1 extensions (0):</div>
					<div>v1 renderer:</div>
					<div>v1 vendor:</div>
					<div>v2 toDataURL:</div>
					<div>v2 parameters (0):</div>
					<div>v2 extensions (0):</div>
					<div>v2 renderer:</div>
					<div>v2 vendor:</div>
					<div>matching renderer/vendor:</div>
					<div>matching data URI:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-offline-audio-context">
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-client-rects">
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-maths">
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-console-errors">
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-timezone">
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-screen">
				<strong>Screen</strong>
				<div>hash:</div>
				<div>width:</div>
				<div>outerWidth:</div>
				<div>availWidth:</div>
				<div>height:</div>
				<div>outerHeight:</div>
				<div>availHeight:</div>
				<div>colorDepth:</div>
				<div>pixelDepth:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-media-devices">
				<strong>MediaDevicesInfo</strong>
				<div>hash:</div>
				<div>devices (0):</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-iframe-content-window-version">
				<strong>HTMLIFrameElement.contentWindow</strong>
				<div>hash:</div>
				<div>keys:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-html-element-version">
				<strong>HTMLElement</strong>
				<div>hash:</div>
				<div>keys:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-css-style-declaration-version">
				<strong>CSSStyleDeclaration</strong>
				<div>hash:</div>
				<div>prototype:</div>
				<div>getComputedStyle:</div>
				<div>HTMLElement.style:</div>
				<div>CSSRuleList.style:</div>
				<div>keys:</div>
				<div>moz:</div>
				<div>webkit:</div>
				<div>matching:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-navigator">
				<strong>Navigator</strong>
				<div>hash:</div>
				<div>appVersion:</div>
				<div>deviceMemory:</div>
				<div>doNotTrack:</div>
				<div>hardwareConcurrency:</div>
				<div>language:</div>
				<div>maxTouchPoints:</div>
				<div>platform:</div>
				<div>userAgent:</div>
				<div>plugins (0):</div>
				<div>mimeTypes (0):</div>
				<div>ua architecture:</div>
				<div>ua model:</div>
				<div>ua platform:</div>
				<div>ua platformVersion:</div>
				<div>ua uaFullVersion:</div>
				<div>properties (0):</div>
				<div class="time">performance: 0 milliseconds</div> 
			</div>
			<div id="${instanceId}-voices">
				<strong>SpeechSynthesis</strong>
				<div>hash:</div>
				<div>voices (0):</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-fonts">
				<div class="time">performance: 0 milliseconds</div>
			</div>
		</div>

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
	const getLies = (instanceId, lieRecords) => {
		return new Promise(async resolve => {
			if (!lieRecords.length) {
				resolve([])
				// <span class="none">none</span>
				// use modal
			}
			const data = lieRecords.map(lie => ({ name: lie.name, lieTypes: lie.lieTypes }))
			const $hash = await hashify(data)
			return resolve({data, $hash })
		})
	}
	const getTrash = (instanceId, trashBin) => {
		return new Promise(async resolve => {
			if (!trashBin.length) {
				return resolve([])
			}
			const data =  trashBin.map(trash => trash.name)
			const $hash = await hashify(data)
			return resolve({data, $hash })
		})
	}
	const getCapturedErrors = (instanceId, errorsCaptured) => {
		return new Promise(async resolve => {
			if (!errorsCaptured.length) {
				return resolve([])
			}
			const data =  errorsCaptured
			const $hash = await hashify(data)
			return resolve({data, $hash })
		})
	}
	
	// fingerprint
	const fingerprint = async () => {
		// await

		const asyncProcess = timer('')
		const [
			workerScopeComputed,
			cloudflareComputed,
			iframeContentWindowVersionComputed,
			htmlElementVersionComputed,
			cssStyleDeclarationVersionComputed,
			screenComputed,
			voicesComputed,
			mediaDevicesComputed,
			canvas2dComputed,
			canvasBitmapRendererComputed,
			canvasWebglComputed,
			mathsComputed,
			consoleErrorsComputed,
			timezoneComputed,
			clientRectsComputed,
			offlineAudioContextComputed,
			fontsComputed
		] = await Promise.all([
			getWorkerScope(instanceId),
			getCloudflare(instanceId),
			getIframeContentWindowVersion(instanceId),
			getHTMLElementVersion(instanceId),
			getCSSStyleDeclarationVersion(instanceId),
			getScreen(instanceId),
			getVoices(instanceId),
			getMediaDevices(instanceId),
			getCanvas2d(instanceId),
			getCanvasBitmapRenderer(instanceId),
			getCanvasWebgl(instanceId),
			getMaths(instanceId),
			getConsoleErrors(instanceId),
			getTimezone(instanceId),
			getClientRects(instanceId),
			getOfflineAudioContext(instanceId),
			getFonts(instanceId, [...fontList, ...notoFonts])
		]).catch(error => {
			console.error(error.message)
		})
		const navigatorComputed = await getNavigator(instanceId, workerScopeComputed)
		const [
			liesComputed,
			trashComputed,
			capturedErrorsComputed
		] = await Promise.all([
			getLies(instanceId, lieRecords),
			getTrash(instanceId, trashBin),
			getCapturedErrors(instanceId, errorsCaptured)
		]).catch(error => {
			console.error(error.message)
		})
		asyncProcess('Async process complete')

		const fingerprint = {
			workerScope: workerScopeComputed,
			cloudflare: cloudflareComputed,
			navigator: navigatorComputed,
			iframeContentWindowVersion: iframeContentWindowVersionComputed,
			htmlElementVersion: htmlElementVersionComputed,
			cssStyleDeclarationVersion: cssStyleDeclarationVersionComputed,
			screen: screenComputed,
			voices: voicesComputed,
			mediaDevices: mediaDevicesComputed,
			canvas2d: canvas2dComputed,
			canvasBitmapRenderer: canvasBitmapRendererComputed,
			canvasWebgl: canvasWebglComputed,
			maths: mathsComputed,
			consoleErrors: consoleErrorsComputed,
			timezone: timezoneComputed,
			clientRects: clientRectsComputed,
			offlineAudioContext: offlineAudioContextComputed,
			fonts: fontsComputed,
			lies: liesComputed,
			trash: trashComputed,
			capturedErrors: capturedErrorsComputed
		}
		return fingerprint
	}
	// get/post request
	const webapp = 'https://script.google.com/macros/s/AKfycbzKRjt6FPboOEkh1vTXttGyCjp97YBP7z-5bODQmtSkQ9BqDRY/exec'
	
	// patch
	const app = document.getElementById('fp-app')
	patch(app, scene, async () => {
		// fingerprint and render
		const fpElem = document.getElementById('fingerprint')
		const fp = await fingerprint().catch(error => console.error(error))
		// Trusted Fingerprint
		const creep = {
			workerScope: fp.workerScope,
			mediaDevices: fp.mediaDevices,
			canvas2d: fp.canvas2d,
			canvasBitmapRenderer: fp.canvasBitmapRenderer,
			webgl: fp.webgl,
			maths: fp.maths,
			consoleErrors: fp.consoleErrors,
			// avoid random timezone fingerprint values
			timezone: (
				!fp.timezone || !fp.timezone.timezoneLie ? fp.timezone :
				fp.timezone.timezoneLie.lies
			),
			clientRects: fp.clientRects,
			offlineAudioContext: fp.offlineAudioContext,
			fonts: fp.fonts,
			trash: fp.trash,
			// avoid random lie fingerprint values
			lies: !('data' in fp.lies) ? [] : fp.lies.data.map(lie => {
				const { lieTypes, name } = lie
				const types = Object.keys(lieTypes)
				const lies = lieTypes.lies
				return { name, types, lies }
			})
		}
		const log = (message, obj) => console.log(message, JSON.stringify(obj, null, '\t'))
		
		console.log('Trusted Fingerprint (Object):', creep)
		console.log('Loose Id (Object):', fp)
		//log('Loose Id (JSON):', fp)
		
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
				const toLocaleStr = str => {
					const date = new Date(str)
					const dateString = date.toDateString()
					const timeString = date.toLocaleTimeString()
					return `${dateString}, ${timeString}`
				}
				const pluralify = (len) => len > 1 ? 's' : ''
				const plural = pluralify(subIdsLen)
				const hoursAgo = (date1, date2) => Math.abs(date1 - date2) / 36e5
				const hours = hoursAgo(new Date(firstVisit), new Date(latestVisit)).toFixed(1)
				const template = `
					<div>
						<div>First Visit: ${toLocaleStr(firstVisit)} (${hours} hours ago)</div>
						<div>Latest Visit: ${toLocaleStr(latestVisit)}</div>
						${subIdsLen ? `<div>${subIdsLen} Loose fingerprint${plural}</div>` : ''}
						<div>Visits: ${visits}${subIdsLen > 20 ? ` (<strong>Bot</strong>)`: ''}</div>
					</div>
				`
				fetchVisitoDataTimer('Visitor data received')
				return patch(visitorElem, html`${template}`)
			})
			.catch(err => {
				fetchVisitoDataTimer('Error fetching visitor data')
				patch(visitorElem, html`<div>Error loading visitor data</div>`)
				return console.error('Error!', err.message)
			})
		
		const knownStyle = str => `<span class="known">${str}</span>`
		const knownBrowser = () => {
			return (
				isBrave ? knownStyle('Brave Browser') :  
				isFirefox ? knownStyle('Firefox') : 
				false
			)
		}
		// identify known hash
		const identify = (prop, check = null) => {
			if (check == 'identifyBrowser') {
				const browser = knownBrowser()
				if (browser) {
					return browser
				}
			}
			const known = {
				'7757f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5': 'Chromium',
				'21f2f6f397db5fa611029154c35cd96eb9a96c4f1c993d4c3a25da765f2dd13b': 'Firefox' // errors
			}

			const [ data, hash ] = prop
			const iterable = Symbol.iterator in Object(data)
			return (
				!data || (iterable && !data.length) ? note.blocked :
				known[hash] ? `<span class="known">${known[hash]}</span>` : hash
			)
		}
		
		
		// template
		const data = `
			<section>
				<div id="fingerprint-data">

					<div>
						<strong>Fingerprint</strong>
						<div>Trusted Id: ${creepHash}</div>
						<div>Loose Id: ${fpHash}</div>
					</div>

					${
						!trashBin.length ? '<div>trash: <span class="none">none</span></div>': (() => {
							const plural = pluralify(trashBin.length)
							const hash = fp.trash[1]
							return `
							<div class="trash">
								<strong>${trashBin.length} API${plural} counted as trash</strong>
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
							const plural = pluralify(errors.length)
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
					<div>
						<strong>Cloudflare</strong>
						${
							!fp.cloudflare[0] ? `<div>hash: ${note.blocked}</div>`: (() => {
								const [ cloudflare, hash ]  = fp.cloudflare
								return `
								<div>
									<div>hash: ${hash}</div>
									${
										Object.keys(cloudflare).map(key => {
											const value = cloudflare[key]
											key = (
												key == 'ip' ? 'ip address' :
												key == 'uag' ? 'system' :
												key == 'loc' ? 'ip location' :
												key == 'tls' ? 'tls version' :
												key
											)
											return `<div>${key}: ${value ? value : note.blocked}</div>`
										}).join('')
									}
								</div>
								`
							})()
						}
					</div>
					
					<div>
						<strong>CanvasRenderingContext2D</strong>
						<div>toDataURL: ${identify(fp.canvas2d, 'identifyBrowser')}</div>
					</div>
					<div>
						<strong>ImageBitmapRenderingContext</strong>
						<div>toDataURL: ${identify(fp.bitmapRenderer, 'identifyBrowser')}</div>
					</div>
					<div>
						<strong>WebGLRenderingContext/WebGL2RenderingContext</strong>
						${
							!fp.webgl[0] ? `<div>parameters/extensions: ${note.blocked}</div>`: (() => {
								const [ data, hash ] = fp.webgl
								const { renderer, renderer2, vendor, vendor2, extensions, extensions2, matching, specs } = data
								const webglSpecs = caniuse(specs, ['webglSpecs'])
								const webgl2Specs = caniuse(specs, ['webgl2Specs'])
								const validate = (value, checkBrave = false) => {
									const isObj = typeof extensions == 'object'
									const isString = typeof renderer == 'string'
									return checkBrave ? (
										isBrave ? knownStyle('Brave Browser') : 
										isString && value ? value : 
										!value ? note.blocked : identify(fp.webgl)
									) : isObj && value && value.length ? value.length : note.blocked
								}
								const supportedSpecs = (specs, type) => {
									const supported = Object.keys(specs).filter(key => {
										const value = specs[key]
										const validValue = !!value || value === 0
										return validValue
									})
									return `<div>${type} supported parameters: ${supported.length}</div>`
								}
								return `
									<div>parameters/extensions: ${hash}</div>
									<br>
									<div>v1 toDataURL: ${identify(fp.webglDataURL, 'identifyBrowser')}</div>
									${
										!webglSpecs ? `<div>v1 supported parameters: ${note.blocked}</div>` :
										supportedSpecs(webglSpecs, 'v1')
									}
									
									<div>v1 supported extensions: ${validate(extensions)}</div>
									<div>v1 renderer: ${validate(renderer, true)}</div>
									<div>v1 vendor: ${validate(vendor, true)}</div>
									<br>
									<div>v2 toDataURL: ${identify(fp.webgl2DataURL, 'identifyBrowser')}</div>
									${
										!webgl2Specs ? `<div>v2 supported parameters: ${note.blocked}</div>` :
										supportedSpecs(webgl2Specs, 'v2')
									}
									<div>v2 supported extensions: ${validate(extensions2)}</div>
									<div>v2 renderer: ${validate(renderer2, true)}</div>
									<div>v2 vendor: ${validate(vendor2, true)}</div>
									<br>
									<div>matching renderer/vendor: ${matching}</div>
								`
							})()
						}
					</div>

					${
						!fp.audio[0] ? `<div>audio: ${note.blocked}</div>`: (() => {
							const [ audio, hash ]  = fp.audio
							const { copySample, binsSample, matching, values } = audio
							return `
							<div>
								<strong>OfflineAudioContext</strong>
								<div>audio hash: ${hash}</div>
								<div>sample: ${binsSample[0] &&  !isNaN(binsSample[0]) ? binsSample[0] : note.blocked}</div>
								<div>copy: ${copySample[0] && !isNaN(copySample[0]) ? copySample[0] : note.blocked}</div>
								<div>matching: ${matching}</div>
								${
									Object.keys(values).map(key => {
										const value = values[key]
										return `<div>${key}: ${value != undefined ? value : `${note.blocked} or unsupported`}</div>`
									}).join('')
								}
							</div>
							`
						})()
					}

					${
						!fp.cRects[0] ? `<div>client rects: ${note.blocked}</div>`: (() => {
							const [ rects, hash ]  = fp.cRects
							return `
							<div>
								<div>client rects: ${hash}</div>
								<div>x samples:</div>
								${rects && !rects.rectsLie ? rects.map(rect => `<div>${rect.x}</div>`).join('') : note.blocked}
							</div>
							`
						})()
					}
					<div>console error messages: ${identify(fp.consoleErrors, 'identifyBrowser')}
						${
							(() => {
								const errors = fp.consoleErrors[0]
								return Object.keys(errors).map(key => {
									const value = errors[key]
									return `<div>${+key+1}: ${value != undefined ? value : note.blocked}</div>`
								}).join('')
							})()
						}
					</div>	

					${
						!fp.maths[0] ? `<div>maths: ${note.blocked}</div>`: (() => {
							const [ maths, hash ]  = fp.maths
							const createTemplate = (maths, prop) => {
								let counter = 0
								return Object.keys(maths).map((key, i) => {
									const value = maths[key]
									const result = value ? value.result : `${note.blocked}`
									const engine = value ? value[prop] : false
									if (!engine) { counter += 1}
									return `${!engine ? `<div>${counter}: ${key} => ${result}</div>` : ''}`
								})
							}
							const chromeV8Template = createTemplate(maths, 'chromeV8')
							const firefoxSpiderMonkeyTemplate = createTemplate(maths, 'firefoxSpiderMonkey')
							const otherTemplate = createTemplate(maths, 'other')
							return `
							<div>
								<div>maths: ${identify(fp.maths)}</div>
								${
									!!chromeV8Template.filter(str => str.length)[0] ?
									`<br><div>does not match Chrome V8:
										${chromeV8Template.join('')}
									</div>` : ''
								}
								${
									!!firefoxSpiderMonkeyTemplate.filter(str => str.length)[0] ?
									`<br><div>does not match Firefox SpiderMonkey:
										${firefoxSpiderMonkeyTemplate.join('')}
									</div>` : ''
								}
								${
									!!otherTemplate.filter(str => str.length)[0] ?
									`<br><div>does not match Chrome V8 or Firefox SpiderMonkey:
										${otherTemplate.join('')}
									</div>` : ''
								}
							</div>
							`
						})()
					}

					${
						!fp.mediaDevices[0] ? `<div>media devices: ${note.blocked}</div>`: (() => {
							const [ devices, hash ]  = fp.mediaDevices
							return `
							<div>
								<div>media devices: ${hash}</div>
								<div>devices:</div>
								${Object.keys(devices).map(key => `<div>${+key+1}: ${devices[key].kind}</div>`).join('')}
							</div>
							`
						})()
					}

					${
						!fp.timezone[0] ? `<div>timezone: ${note.blocked}</div>`: (() => {
							const [ timezone, hash ]  = fp.timezone
							return `
							<div>
								<div>timezone hash: ${identify(fp.timezone)}</div>
								${
									Object.keys(timezone).map(key => {
										const value = timezone[key]
										return `<div>${key}: ${value != undefined && typeof value != 'object' ? value : note.blocked}</div>`
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
					<div>
						<strong>HTMLIFrameElement.contentWindow</strong>
						${
							!fp.window[0] || !fp.window[0].length ? `<div>api version: ${note.blocked}</div>`: (() => {
								const [ keys, hash ]  = fp.window
								return `
								<div>
									<div>api version: ${hash}</div>
									<div>keys: ${keys.length}</div>
								</div>
								`
							})()
						}
					</div>

					<div>
						<strong>HTMLElement</strong>
						${
							!fp.htmlElement[0] || !fp.htmlElement[0].length ? `<div>api version: ${note.blocked}</div>`: (() => {
								const [ keys, hash ]  = fp.htmlElement
								return `
								<div>
									<div>api version: ${hash}</div>
									<div>keys: ${keys.length}</div>
								</div>
								`
							})()
						}
					</div>

					<div>
						<strong>CSSStyleDeclaration</strong>
						<div>matching keys: ${fp.cssStylesMatch}</div>
						<br>
						${
							!fp.cssComputedStyle[0] || !fp.cssComputedStyle[0].keys.length ? `<div>getComputedStyle: ${note.blocked} or unsupported</div>`: (() => {
								const [ style, hash ]  = fp.cssComputedStyle
								const { methods, properties } = style
								return `
								<div>
									<div>getComputedStyle: ${hash}</div>
									<div>prototype: ${style.prototypeName}</div>
									<div>keys: ${style.keys.length}</div>
									<div>moz: ${style.moz}</div>
									<div>webkit: ${style.webkit}</div>
								</div>
								`
							})()
						}
						<br>
						${
							!fp.cssHtmlElementStyle[0] || !fp.cssHtmlElementStyle[0].keys.length ? `<div>HTMLElement.style: ${note.blocked} or unsupported</div>`: (() => {
								const [ style, hash ]  = fp.cssHtmlElementStyle
								const { methods, properties } = style
								return `
								<div>
									<div>HTMLElement.style: ${hash}</div>
									<div>prototype: ${style.prototypeName}</div>
									<div>keys: ${style.keys.length}</div>
									<div>moz: ${style.moz}</div>
									<div>webkit: ${style.webkit}</div>
								</div>
								`
							})()
						}
						<br>
						${
							!fp.cssRuleListStyle[0] || !fp.cssRuleListStyle[0].keys.length ? `<div>CSSRuleList.style: ${note.blocked} or unsupported</div>`: (() => {
								const [ style, hash ]  = fp.cssRuleListStyle
								const { methods, properties } = style
								return `
								<div>
									<div>CSSRuleList.style: ${hash}</div>
									<div>prototype: ${style.prototypeName}</div>
									<div>keys: ${style.keys.length}</div>
									<div>moz: ${style.moz}</div>
									<div>webkit: ${style.webkit}</div>
								</div>
								`
							})()
						}
					</div>
					<div>
						<strong>Navigator</strong>
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
							${
								version === undefined ? `<div>navigator version: ${note.blocked}</div>`: (() => {
									const len = version.length
									return `
									<div>
										<div>navigator version hash: ${versionHash}</div>
										<div>total properties: ${len}</div>
										${len ? `<div>properties:</div>${version.join(', ')}` : ''}
									</div>
									`
								})()
							}
							<br>
							<div>
								<div>navigator hash: ${hash}</div>
								<div>platform: ${platform ? platform : `${note.blocked} or other`}</div>
								<div>deviceMemory: ${deviceMemory ? deviceMemory : note.blocked}</div>
								<div>hardwareConcurrency: ${hardwareConcurrency ? hardwareConcurrency : note.blocked}</div>
								<div>maxTouchPoints: ${maxTouchPoints !== undefined ? maxTouchPoints : note.blocked}</div>
								<div>language: ${language ? language : note.blocked}</div>
								<div>vendor: ${vendor ? vendor : note.blocked}</div>
								<div>doNotTrack: ${doNotTrack !== undefined ? doNotTrack : note.blocked}</div>
								<div>userAgent: ${userAgent ? userAgent : note.blocked}</div>
								<div>appVersion: ${appVersion ? appVersion : note.blocked}</div>
							</div>
							<br>
							${
								mimeTypes === undefined ? `<div>mimeTypes: ${note.blocked}</div>`: (() => {
									const len = mimeTypes.length
									return `
									<div>
										<div>mimeTypes hash: ${mimeTypesHash}</div>
										<div>total mimeTypes: ${len}</div>
										${len ? `<div>mimeTypes:</div>${mimeTypes.join(', ')}` : ''}
									</div>
									`
								})()
							}
							<br>
							${
								plugins === undefined ? `<div>plugins: ${note.blocked}</div>`: (() => {
									const pluginsList = Object.keys(plugins).map(key => plugins[key].name)
									const len = pluginsList.length
									return `
									<div>
										<div>plugins hash: ${pluginsHash}</div>
										<div>total plugins: ${len}</div>
										${len ? `<div>plugins:</div>${pluginsList.join(', ')}` : ''}
									</div>
									`
								})()
							}
							`
						})()
					}
					<br>
					${
						!fp.highEntropy[0] ? `<div>NavigatorUAData.getHighEntropyValues: ${note.blocked} or unsupported</div>`: (() => {
							const [ ua, hash ]  = fp.highEntropy
							const { architecture, model, platform, platformVersion, uaFullVersion } = ua
							return `
							<div>
								<div>NavigatorUAData.getHighEntropyValues: ${hash}</div>
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
					${
						!fp.voices[0] || !fp.voices[0].length ? `<div>voices: ${note.blocked} or unsupported</div>`: (() => {
							const [ voices, hash ]  = fp.voices
							const voiceList = voices.map(voice => voice.name)
							const len = voices.length
							return `
							<div>
								<div>voices hash: ${hash}</div>
								<div>total voices: ${len}</div>
								${len ? `<div>voices:</div>${voiceList.join(', ')}` : ''}
							</div>
							`
						})()
					}

					${
						!fp.fonts[0] ? `<div>fonts: ${note.blocked}</div>`: (() => {
							const [ fonts, hash ]  = fp.fonts
							const len = fonts.length
							return `
							<div>
								<div>fonts hash: ${hash}</div>
								<div>total fonts: ${len}</div>
								${len ? `<div>fonts:</div>${fonts.join(', ')}` : ''}
							</div>
							`
						})()
					}

					<div>Visitor data auto deletes <a href="https://github.com/abrahamjuliot/creepjs/blob/8d6603ee39c9534cad700b899ef221e0ee97a5a4/server.gs#L24" target="_blank">every 7 days</a>.</div>
				</div>
			</section>
			
		`
		return patch(fpElem, html`${data}`)
	}).catch((e) => console.log(e))
})()