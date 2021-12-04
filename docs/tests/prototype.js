(async () => {

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


	/* Prototype lies */

	const getIframe = () => {
		try {
			const numberOfIframes = window.length
			const frag = new DocumentFragment()
			const div = document.createElement('div')
			frag.appendChild(div)
			const ghost = () => `
			height: 100vh;
			width: 100vw;
			position: absolute;
			left:-10000px;
			visibility: hidden;
		`
			div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
			document.body.appendChild(frag)
			const iframeWindow = window[numberOfIframes]
			return { iframeWindow, div }
		}
		catch (error) {
			return { iframeWindow: window, div: undefined }
		}
	}
	const { iframeWindow, div: iframeContainerDiv } = getIframe()

	const chromium = (
		Math.acos(0.123) == 1.4474840516030247 &&
		Math.acosh(Math.SQRT2) == 0.881373587019543 &&
		Math.atan(2) == 1.1071487177940904 &&
		Math.atanh(0.5) == 0.5493061443340548 &&
		Math.cbrt(Math.PI) == 1.4645918875615231 &&
		Math.cos(21 * Math.LN2) == -0.4067775970251724 &&
		Math.cosh(492 * Math.LOG2E) == 9.199870313877772e+307 &&
		Math.expm1(1) == 1.718281828459045 &&
		Math.hypot(6 * Math.PI, -100) == 101.76102278593319 &&
		Math.log10(Math.PI) == 0.4971498726941338 &&
		Math.sin(Math.PI) == 1.2246467991473532e-16 &&
		Math.sinh(Math.PI) == 11.548739357257748 &&
		Math.tan(10 * Math.LOG2E) == -3.3537128705376014 &&
		Math.tanh(0.123) == 0.12238344189440875 &&
		Math.pow(Math.PI, -100) == 1.9275814160560204e-50
	)

	const getFirefox = () => 3.141592653589793 ** -100 == 1.9275814160560185e-50

	const getPrototypeLies = iframeWindow => {
		// Lie Tests
		// object constructor descriptor should return undefined properties
		const getUndefinedValueLie = (obj, name) => {
			const objName = obj.name
			const objNameUncapitalized = window[objName.charAt(0).toLowerCase() + objName.slice(1)]
			const hasInvalidValue = !!objNameUncapitalized && (
				typeof Object.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined' ||
				typeof Reflect.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined'
			)
			return hasInvalidValue ? true : false
		}

		// accessing the property from the prototype should throw a TypeError
		const getIllegalTypeErrorLie = (obj, name) => {
			const proto = obj.prototype
			try {
				proto[name]
				//console.log(obj.name, name)
				return true
			}
			catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
			const illegal = [
				'',
				'is',
				'call',
				'seal',
				'keys',
				'bind',
				'apply',
				'assign',
				'freeze',
				'values',
				'entries',
				'toString',
				'isFrozen',
				'isSealed',
				'constructor',
				'isExtensible',
				'getPrototypeOf',
				'preventExtensions',
				'propertyIsEnumerable',
				'getOwnPropertySymbols',
				'getOwnPropertyDescriptors'
			]
			const lied = !!illegal.find(prop => {
				try {
					prop == '' ? Object(proto[name]) : Object[prop](proto[name])
					return true
				}
				catch (error) {
					return error.constructor.name != 'TypeError' ? true : false
				}
			})
			return lied
		}

		// calling the interface prototype on the function should throw a TypeError
		const getCallInterfaceTypeErrorLie = (apiFunction, proto) => {
			try {
				new apiFunction()
				apiFunction.call(proto)
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
		}

		// applying the interface prototype on the function should throw a TypeError
		const getApplyInterfaceTypeErrorLie = (apiFunction, proto) => {
			try {
				new apiFunction()
				apiFunction.apply(proto)
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
		}

		// creating a new instance of the function should throw a TypeError
		const getNewInstanceTypeErrorLie = apiFunction => {
			try {
				new apiFunction()
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
		}

		// extending the function on a fake class should throw a TypeError and message "not a constructor"
		const getClassExtendsTypeErrorLie = apiFunction => {
			try {
				const shouldExitInSafari13 = (
					/version\/13/i.test((navigator || {}).userAgent) &&
					((3.141592653589793 ** -100) == 1.9275814160560206e-50)
				)
				if (shouldExitInSafari13) {
					return false
				}
				class Fake extends apiFunction { }
				return true
			} catch (error) {
				// Native has TypeError and 'not a constructor' message in FF & Chrome
				return error.constructor.name != 'TypeError' ? true :
					!/not a constructor/i.test(error.message) ? true : false
			}
		}

		// setting prototype to null and converting to a string should throw a TypeError
		const getNullConversionTypeErrorLie = apiFunction => {
			const nativeProto = Object.getPrototypeOf(apiFunction)
			try {
				Object.setPrototypeOf(apiFunction, null) + ''
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			} finally {
				// restore proto
				Object.setPrototypeOf(apiFunction, nativeProto)
			}
		}

		// toString() and toString.toString() should return a native string in all frames
		const getToStringLie = (apiFunction, name, iframeWindow) => {
			/*
			Accepted strings:
			'function name() { [native code] }'
			'function name() {\n    [native code]\n}'
			'function get name() { [native code] }'
			'function get name() {\n    [native code]\n}'
			'function () { [native code] }'
			`function () {\n    [native code]\n}`
			*/

			let iframeToString, iframeToStringToString
			try {
				iframeToString = iframeWindow.Function.prototype.toString.call(apiFunction)
			} catch (e) { }
			try {
				iframeToStringToString = iframeWindow.Function.prototype.toString.call(apiFunction.toString)
			} catch (e) { }

			const apiFunctionToString = (
				iframeToString ?
					iframeToString :
					apiFunction.toString()
			)
			const apiFunctionToStringToString = (
				iframeToStringToString ?
					iframeToStringToString :
					apiFunction.toString.toString()
			)
			const trust = name => ({
				[`function ${name}() { [native code] }`]: true,
				[`function get ${name}() { [native code] }`]: true,
				[`function () { [native code] }`]: true,
				[`function ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
				[`function get ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
				[`function () {${'\n'}    [native code]${'\n'}}`]: true
			})
			return (
				!trust(name)[apiFunctionToString] ||
				!trust('toString')[apiFunctionToStringToString]
			)
		}

		// "prototype" in function should not exist
		const getPrototypeInFunctionLie = apiFunction => 'prototype' in apiFunction ? true : false

		// "arguments", "caller", "prototype", "toString"  should not exist in descriptor
		const getDescriptorLie = apiFunction => {
			const hasInvalidDescriptor = (
				!!Object.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
				!!Reflect.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
				!!Object.getOwnPropertyDescriptor(apiFunction, 'caller') ||
				!!Reflect.getOwnPropertyDescriptor(apiFunction, 'caller') ||
				!!Object.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
				!!Reflect.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
				!!Object.getOwnPropertyDescriptor(apiFunction, 'toString') ||
				!!Reflect.getOwnPropertyDescriptor(apiFunction, 'toString')
			)
			return hasInvalidDescriptor ? true : false
		}

		// "arguments", "caller", "prototype", "toString" should not exist as own property
		const getOwnPropertyLie = apiFunction => {
			const hasInvalidOwnProperty = (
				apiFunction.hasOwnProperty('arguments') ||
				apiFunction.hasOwnProperty('caller') ||
				apiFunction.hasOwnProperty('prototype') ||
				apiFunction.hasOwnProperty('toString')
			)
			return hasInvalidOwnProperty ? true : false
		}

		// descriptor keys should only contain "name" and "length"
		const getDescriptorKeysLie = apiFunction => {
			const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(apiFunction))

			/* // backdoor path
			const createDescriptorKeys = Object.keys(
				Object.getOwnPropertyDescriptors(Object.create(apiFunction).__proto__)
			) */

			const hasInvalidKeys = '' + descriptorKeys != 'length,name' && '' + descriptorKeys != 'name,length'
			return hasInvalidKeys ? true : false
		}

		// own property names should only contain "name" and "length"
		const getOwnPropertyNamesLie = apiFunction => {
			const ownPropertyNames = Object.getOwnPropertyNames(apiFunction)
			const hasInvalidNames = (
				'' + ownPropertyNames != 'length,name' && '' + ownPropertyNames != 'name,length'
			)
			return hasInvalidNames ? true : false
		}

		// own keys names should only contain "name" and "length"
		const getOwnKeysLie = apiFunction => {
			const ownKeys = Reflect.ownKeys(apiFunction)
			const hasInvalidKeys = '' + ownKeys != 'length,name' && '' + ownKeys != 'name,length'
			return hasInvalidKeys ? true : false
		}

		// calling toString() on an object created from the function should throw a TypeError
		const getNewObjectToStringTypeErrorLie = apiFunction => {
			try {
				Object.create(apiFunction).toString()
				return true
			} catch (error) {
				const stackLines = error.stack.split('\n')
				const traceLines = stackLines.slice(1)
				const objectApply = /at Object\.apply/
				const functionToString = /at Function\.toString/
				const validLines = !traceLines.find(line => objectApply.test(line))
				// Stack must be valid
				const validStack = (
					error.constructor.name == 'TypeError' && stackLines.length > 1
				)
				// Chromium must throw error 'at Function.toString' and not 'at Object.apply'
				const isChrome = 'chrome' in window || chromium
				if (validStack && isChrome && (!functionToString.test(stackLines[1]) || !validLines)) {
					return true
				}
				return !validStack
			}
		}

		// arguments or caller should not throw 'incompatible Proxy' TypeError
		const tryIncompatibleProxy = (isFirefox, fn) => {
			try {
				fn()
				return true
			} catch (error) {
				return (
					error.constructor.name != 'TypeError' ||
					(isFirefox && /incompatible\sProxy/.test(error.message)) ? true : false
				)
			}
		}
		const getIncompatibleProxyTypeErrorLie = apiFunction => {
			const isFirefox = getFirefox()
			return (
				tryIncompatibleProxy(isFirefox, () => apiFunction.arguments) ||
				tryIncompatibleProxy(isFirefox, () => apiFunction.arguments)
			)
		}
		const getToStringIncompatibleProxyTypeErrorLie = apiFunction => {
			const isFirefox = getFirefox()
			return (
				tryIncompatibleProxy(isFirefox, () => apiFunction.toString.arguments) ||
				tryIncompatibleProxy(isFirefox, () => apiFunction.toString.caller)
			)
		}

		// setting prototype to itself should not throw 'Uncaught InternalError: too much recursion'
		/*
			Trying to bypass this? We can also check if empty Proxies return 'Uncaught InternalError: too much recursion'
			x = new Proxy({}, {})
			Object.setPrototypeOf(x, x)+''
		*/
		const getTooMuchRecursionLie = apiFunction => {
			const isFirefox = getFirefox()
			const nativeProto = Object.getPrototypeOf(apiFunction)
			try {
				Object.setPrototypeOf(apiFunction, apiFunction) + ''
				return true
			} catch (error) {
				return (
					error.constructor.name != 'TypeError' ||
						(isFirefox && /too much recursion/.test(error.message)) ? true : false
				)
			} finally {
				// restore proto
				Object.setPrototypeOf(apiFunction, nativeProto)
			}
		}

		// API Function Test
		const getLies = (apiFunction, proto, obj = null) => {
			if (typeof apiFunction != 'function') {
				return {
					lied: false,
					lieTypes: []
				}
			}
			const name = apiFunction.name.replace(/get\s/, '')
			const lies = {
				// custom lie string names
				[`a: accessing the property from the prototype should throw a TypeError`]: obj ? getIllegalTypeErrorLie(obj, name) : false,
				[`b: object constructor descriptor should return undefined properties`]: obj ? getUndefinedValueLie(obj, name) : false,
				[`c: calling the interface prototype on the function should throw a TypeError`]: getCallInterfaceTypeErrorLie(apiFunction, proto),
				[`d: applying the interface prototype on the function should throw a TypeError`]: getApplyInterfaceTypeErrorLie(apiFunction, proto),
				[`e: creating a new instance of the function should throw a TypeError`]: getNewInstanceTypeErrorLie(apiFunction),
				[`f: extending the function on a fake class should throw a TypeError`]: getClassExtendsTypeErrorLie(apiFunction),
				[`g: setting prototype to null and converting to a string should throw a TypeError`]: getNullConversionTypeErrorLie(apiFunction),
				[`h: toString() and toString.toString() should return a native string in all frames`]: getToStringLie(apiFunction, name, iframeWindow),
				[`i: "prototype" in function should not exist`]: getPrototypeInFunctionLie(apiFunction),
				[`j: "arguments", "caller", "prototype", "toString"  should not exist in descriptor`]: getDescriptorLie(apiFunction),
				[`k: "arguments", "caller", "prototype", "toString" should not exist as own property`]: getOwnPropertyLie(apiFunction),
				[`l: descriptor keys should only contain "name" and "length"`]: getDescriptorKeysLie(apiFunction),
				[`m: own property names should only contain "name" and "length"`]: getOwnPropertyNamesLie(apiFunction),
				[`n: own keys names should only contain "name" and "length"`]: getOwnKeysLie(apiFunction),
				[`o: calling toString() on an object created from the function should throw a TypeError`]: getNewObjectToStringTypeErrorLie(apiFunction),
				[`p: arguments or caller should not throw 'incompatible Proxy' TypeError`]: getIncompatibleProxyTypeErrorLie(apiFunction),
				[`q: arguments or caller on toString should not throw 'incompatible Proxy' TypeError`]: getToStringIncompatibleProxyTypeErrorLie(apiFunction),
				[`r: setting prototype to itself should throw a TypeError not 'InternalError: too much recursion'`]: getTooMuchRecursionLie(apiFunction)
			}
			const lieTypes = Object.keys(lies).filter(key => !!lies[key])
			return {
				lied: lieTypes.length,
				lieTypes
			}
		}

		// Lie Detector
		const createLieDetector = () => {
			const isSupported = obj => typeof obj != 'undefined' && !!obj
			const props = {} // lie list and detail
			const propsSearched = [] // list of properties searched
			return {
				getProps: () => props,
				getPropsSearched: () => propsSearched,
				searchLies: (fn, { target = [], ignore = [] } = {}) => {
					let obj
					// check if api is blocked or not supported
					try {
						obj = fn()
						if (!isSupported(obj)) {
							return
						}
					}
					catch (error) {
						return
					}

					const interfaceObject = !!obj.prototype ? obj.prototype : obj
						;[...new Set([
							...Object.getOwnPropertyNames(interfaceObject),
							...Object.keys(interfaceObject) // backup
						])].sort().forEach(name => {
							const skip = (
								name == 'constructor' ||
								(target.length && !new Set(target).has(name)) ||
								(ignore.length && new Set(ignore).has(name))
							)
							if (skip) {
								return
							}
							const objectNameString = /\s(.+)\]/
							const apiName = `${
								obj.name ? obj.name : objectNameString.test(obj) ? objectNameString.exec(obj)[1] : undefined
								}.${name}`
							propsSearched.push(apiName)
							try {
								const proto = obj.prototype ? obj.prototype : obj
								let res // response from getLies

								// search if function
								try {
									const apiFunction = proto[name] // may trigger TypeError
									if (typeof apiFunction == 'function') {
										res = getLies(proto[name], proto)
										if (res.lied) {
											return (props[apiName] = res.lieTypes)
										}
										return
									}
									// since there is no TypeError and the typeof is not a function,
									// handle invalid values and ingnore name, length, and constants
									if (
										name != 'name' &&
										name != 'length' &&
										name[0] !== name[0].toUpperCase()) {
										return (
											props[apiName] = [`y: descriptor.value should remain undefined`]
										)
									}
								} catch (error) { }
								// else search getter function
								const getterFunction = Object.getOwnPropertyDescriptor(proto, name).get
								res = getLies(getterFunction, proto, obj) // send the obj for special tests
								if (res.lied) {
									return (props[apiName] = res.lieTypes)
								}
								return
							} catch (error) {
								return (
									props[apiName] = [`z: prototype tests should not fail execution`]
								)
							}
						})
				}
			}
		}

		const lieDetector = createLieDetector()
		const {
			searchLies
		} = lieDetector

		// search for lies: remove target to search all properties
		searchLies(() => AnalyserNode)
		searchLies(() => AudioBuffer)
		searchLies(() => BiquadFilterNode)
		searchLies(() => CanvasRenderingContext2D)
		searchLies(() => Date)
		searchLies(() => Intl.DateTimeFormat)
		searchLies(() => Document, {
			ignore: [
				// Firefox false positive on getIllegalTypeErrorLie test
				'onreadystatechange',
				'onmouseenter',
				'onmouseleave'
			]
		})
		searchLies(() => DOMRect)
		searchLies(() => DOMRectReadOnly)
		searchLies(() => Element)
		searchLies(() => Function, {
			ignore: [
				// Chrome false positive on getIllegalTypeErrorLie test
				'caller',
				'arguments'
			]
		})
		searchLies(() => HTMLCanvasElement)
		searchLies(() => HTMLElement, {
			ignore: [
				// Firefox false positive on getIllegalTypeErrorLie test
				'onmouseenter',
				'onmouseleave'
			]
		})
		searchLies(() => HTMLIFrameElement)
		searchLies(() => IntersectionObserverEntry)
		searchLies(() => Math)
		searchLies(() => MediaDevices)
		searchLies(() => Navigator)
		searchLies(() => Node)
		searchLies(() => OffscreenCanvasRenderingContext2D)
		searchLies(() => Range)
		searchLies(() => Intl.RelativeTimeFormat)
		searchLies(() => Screen)
		searchLies(() => speechSynthesis)
		searchLies(() => SVGRect)
		searchLies(() => TextMetrics)
		searchLies(() => WebGLRenderingContext)
		searchLies(() => WebGL2RenderingContext)

		/* potential targets:
			RTCPeerConnection
			Plugin
			PluginArray
			MimeType
			MimeTypeArray
			Worker
			History 
		*/

		// return lies list and detail 
		const props = lieDetector.getProps()
		const propsSearched = lieDetector.getPropsSearched()
		return {
			lieList: Object.keys(props).sort(),
			lieDetail: props,
			lieCount: Object.keys(props).reduce((acc, key) => acc + props[key].length, 0),
			propsSearched
		}
	}

	// start program
	const start = performance.now()
	const { lieList, lieDetail, lieCount, propsSearched } = getPrototypeLies(iframeWindow) // execute and destructure the list and detail
	if (iframeContainerDiv) {
		iframeContainerDiv.parentNode.removeChild(iframeContainerDiv)
	}
	const perf = performance.now() - start

	// check lies later in any function
	//lieList.includes('HTMLCanvasElement.toDataURL') // returns true or false
	//lieDetail['HTMLCanvasElement.toDataURL'] // returns the list of lies

	console.log(lieDetail)

	const [
		searchedHash,
		corruptedHash,
		lieHash
	] = await Promise.all([
		hashify(propsSearched),
		hashify(lieList),
		hashify(lieDetail)
	])

	const pluralify = (len, options) => len == 1 ? options[0] : options[1]
	const lieLen = lieList.length
	const propsSearchLen = propsSearched.length
	const el = document.getElementById('fingerprint-data')
	patch(el, html`
	<div id="fingerprint-data">
		<style>
			.failure {
				padding: 20px;
				font-size: 12px !important
			}
			.pass {
				color: #2da568;
				background: #2da5681a;
				padding: 2px 6px;
			}
			.fail {
				background: #ca656e30;
				width: 30px;
				text-align: center;
				padding: 0 7px;
				color: #b5434d;
				border-radius: 3px;
			}
		</style>
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Prototype</strong>
			<div>${'' + lieCount} lies detected in ${lieLen ? `${'' + lieLen} of ` : ''}${'' + propsSearchLen} propert${pluralify(propsSearchLen, ['y', 'ies'])}</div>
			<br>
			<div>${'' + propsSearchLen} searched: ${searchedHash.slice(0, 8)}</div>
			${
		lieLen ?
			`<div>${'' + lieLen} corrupted: ${corruptedHash.slice(0, 8)}</div>
				<div>${'' + lieCount} lie${pluralify(lieCount, ['', 's'])}: ${lieHash.slice(0, 8)}</div>` :
			''
		}
			
		</div>
		<div>
		${
		lieLen ? Object.keys(lieDetail).map(key => {
			return `<span class="fail">${lieDetail[key].length}</span> ${key}`
		}).join('<br>') :
			'<span class="pass">&#10004; passed</span>'
		}
		</div>
		<div>
		${
		lieLen ? Object.keys(lieDetail).map(key => {
			return `${key}:
					<div class="failure">
						${lieDetail[key].map(lie => `<div>${lie}</div>`).join('')}
					</div>
				`
		}).join('<br>') :
			''
		}
		</div>
	</div>
`)
})()