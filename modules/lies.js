import { captureError } from './captureErrors.js'

// Collect lies detected
const createlieRecords = () => {
	const records = {}
	return {
		getRecords: () => records,
		documentLie: (name, lie) => {
			const isArray = lie instanceof Array
			if (records[name]) {
				if (isArray) {
					return (records[name] = [...records[name], ...lie])
				}
				return records[name].push(lie)
			}
			return isArray ? (records[name] = lie) : (records[name] = [lie])
		}
	}
}

const lieRecords = createlieRecords()
const { documentLie } = lieRecords

const ghost = () => `
	height: 100vh;
	width: 100vw;
	position: absolute;
	left:-10000px;
	visibility: hidden;
`
const getRandomValues = () => {
	const id = [...crypto.getRandomValues(new Uint32Array(10))]
		.map(n => n.toString(36)).join('')
	return id
}

const getBehemothIframe = win => {
	try {
		const isChrome = (3.141592653589793 ** -100) == 1.9275814160560204e-50
		if (!isChrome) {
			return win
		}
		const div = win.document.createElement('div')
		div.setAttribute('id', getRandomValues())
		div.setAttribute('style', ghost())
		div.innerHTML = `<div><iframe></iframe></div>`
		win.document.body.appendChild(div)
		const iframe = [...[...div.childNodes][0].childNodes][0]
		if (!iframe) {
			return
		}
		const { contentWindow } = iframe || {}
		const div2 = contentWindow.document.createElement('div')
		div2.innerHTML = `<div><iframe></iframe></div>`
		contentWindow.document.body.appendChild(div2)
		const iframe2 = [...[...div2.childNodes][0].childNodes][0]
		return iframe2.contentWindow
	}
	catch (error) {
		captureError(error, 'client blocked behemoth iframe')
		return win
	}
}

const getPhantomIframe = () => {
	try {
		const numberOfIframes = window.length
		const frag = new DocumentFragment()
		const div = document.createElement('div')
		const id = getRandomValues()
		div.setAttribute('id', id)
		frag.appendChild(div)
		div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
		document.body.appendChild(frag)
		const iframeWindow = window[numberOfIframes]
		const phantomWindow = getBehemothIframe(iframeWindow)
		return { iframeWindow: phantomWindow, div }
	}
	catch (error) {
		captureError(error, 'client blocked phantom iframe')
		return { iframeWindow: window, div: undefined }
	}
}
const { iframeWindow: phantomDarkness, div: parentPhantom } = getPhantomIframe()

const getDragonIframe = ({ numberOfNests, kill = false, context = window }) => {
	try {
		let parent, total = numberOfNests
		return (function getIframeWindow(win, {
			previous = context
		} = {}) {
			if (!win) {
				if (kill) {
					parent.parentNode.removeChild(parent)
				}
				console.log(`\ndragon fire is valid up to ${total - numberOfNests} fiery flames`)
				return { iframeWindow: previous, parent }
			}
			const numberOfIframes = win.length
			const div = win.document.createElement('div')
			win.document.body.appendChild(div)
			div.innerHTML = '<iframe></iframe>'
			const iframeWindow = win[numberOfIframes]
			if (total == numberOfNests) {
				parent = div
				parent.setAttribute('style', 'display:none')
			}
			numberOfNests--
			if (!numberOfNests) {
				if (kill) {
					parent.parentNode.removeChild(parent)
				}
				return { iframeWindow, parent }
			}
			return getIframeWindow(iframeWindow, {
				previous: win
			})
		})(context)
	}
	catch (error) {
		captureError(error, 'client blocked dragon iframe')
		return { iframeWindow: window, parent: undefined }
	}
}

const { iframeWindow: dragonFire, parent: parentDragon } = getDragonIframe({ numberOfNests: 2 })

const { iframeWindow: dragonOfDeath } = getDragonIframe({ numberOfNests: 4, kill: true })

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
			return true
		} catch (error) {
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
			} catch (error) {
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
			// begin tests
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
			const isChrome = 3.141592653589793 ** -100 == 1.9275814160560204e-50
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
		Designed for Firefox Proxies
		
		Trying to bypass this? We can also check if empty Proxies return 'Uncaught InternalError: too much recursion'

		x = new Proxy({}, {})
		Object.setPrototypeOf(x, x)+''

		This generates the same error:
		x = new Proxy({}, {})
		x.__proto__ = x
		x++

		In Blink, we can force a custom stack trace and then check each line
		you = () => {
			const x = Function.prototype.toString
			return Object.setPrototypeOf(x, x) + 1
		}
		can = () => you()
		run = () => can()
		but = () => run()
		u = () => but()
		cant = () => u()
		hide = () => cant()
		hide()
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
			[`failed illegal error`]: obj ? getIllegalTypeErrorLie(obj, name) : false,
			[`failed undefined properties`]: obj ? getUndefinedValueLie(obj, name) : false,
			[`failed call interface error`]: getCallInterfaceTypeErrorLie(apiFunction, proto),
			[`failed apply interface error`]: getApplyInterfaceTypeErrorLie(apiFunction, proto),
			[`failed new instance error`]: getNewInstanceTypeErrorLie(apiFunction),
			[`failed class extends error`]: getClassExtendsTypeErrorLie(apiFunction),
			[`failed null conversion error`]: getNullConversionTypeErrorLie(apiFunction),
			[`failed toString`]: getToStringLie(apiFunction, name, iframeWindow),
			[`failed "prototype" in function`]: getPrototypeInFunctionLie(apiFunction),
			[`failed descriptor`]: getDescriptorLie(apiFunction),
			[`failed own property`]: getOwnPropertyLie(apiFunction),
			[`failed descriptor keys`]: getDescriptorKeysLie(apiFunction),
			[`failed own property names`]: getOwnPropertyNamesLie(apiFunction),
			[`failed own keys names`]: getOwnKeysLie(apiFunction),
			[`failed object toString error`]: getNewObjectToStringTypeErrorLie(apiFunction),
			[`failed at incompatible proxy error`]: getIncompatibleProxyTypeErrorLie(apiFunction),
			[`failed at toString incompatible proxy error`]: getToStringIncompatibleProxyTypeErrorLie(apiFunction),
			[`failed at too much recursion error`]: getTooMuchRecursionLie(apiFunction)
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
		let propsSearched = [] // list of properties searched
		return {
			getProps: () => props,
			getPropsSearched: () => propsSearched,
			searchLies: (fn, {
				target = [],
				ignore = []
			} = {}) => {
				let obj
				// check if api is blocked or not supported
				try {
					obj = fn()
					if (!isSupported(obj)) {
						return
					}
				} catch (error) {
					return
				}

				const interfaceObject = !!obj.prototype ? obj.prototype : obj
				Object.getOwnPropertyNames(interfaceObject)
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
										documentLie(apiName, res.lieTypes)
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
									const lie = [`failed descriptor.value undefined`]
									documentLie(apiName, lie)
									return (
										props[apiName] = lie
									)
								}
							} catch (error) { }
							// else search getter function
							const getterFunction = Object.getOwnPropertyDescriptor(proto, name).get
							res = getLies(getterFunction, proto, obj) // send the obj for special tests
							if (res.lied) {
								documentLie(apiName, res.lieTypes)
								return (props[apiName] = res.lieTypes)
							}
							return
						} catch (error) {
							const lie = `failed prototype test execution`
							documentLie(apiName, lie)
							return (
								props[apiName] = [lie]
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
	searchLies(() => AudioBuffer, {
		target: [
			'copyFromChannel',
			'getChannelData'
		]
	})
	searchLies(() => BiquadFilterNode, {
		target: [
			'getFrequencyResponse'
		]
	})
	searchLies(() => CanvasRenderingContext2D, {
		target: [
			'getImageData',
			'getLineDash',
			'isPointInPath',
			'isPointInStroke',
			'measureText',
			'quadraticCurveTo'
		]
	})
	searchLies(() => Date, {
		target: [
			'getDate',
			'getDay',
			'getFullYear',
			'getHours',
			'getMinutes',
			'getMonth',
			'getTime',
			'getTimezoneOffset',
			'setDate',
			'setFullYear',
			'setHours',
			'setMilliseconds',
			'setMonth',
			'setSeconds',
			'setTime',
			'toDateString',
			'toJSON',
			'toLocaleDateString',
			'toLocaleString',
			'toLocaleTimeString',
			'toString',
			'toTimeString',
			'valueOf'
		]
	})
	searchLies(() => Intl.DateTimeFormat, {
		target: [
			'format',
			'formatRange',
			'formatToParts',
			'resolvedOptions'
		]
	})
	searchLies(() => Document, {
		target: [
			'createElement',
			'createElementNS',
			'getElementById',
			'getElementsByClassName',
			'getElementsByName',
			'getElementsByTagName',
			'getElementsByTagNameNS',
			'referrer',
			'write',
			'writeln'
		],
		ignore: [
			// Firefox returns undefined on getIllegalTypeErrorLie test
			'onreadystatechange',
			'onmouseenter',
			'onmouseleave'
		]
	})
	searchLies(() => DOMRect)
	searchLies(() => DOMRectReadOnly)
	searchLies(() => Element, {
		target: [
			'append',
			'appendChild',
			'getBoundingClientRect',
			'getClientRects',
			'insertAdjacentElement',
			'insertAdjacentHTML',
			'insertAdjacentText',
			'insertBefore',
			'prepend',
			'replaceChild',
			'replaceWith',
			'setAttribute'
		]
	})
	searchLies(() => Function, {
		target: [
			'toString',
		],
		ignore: [
			'caller',
			'arguments'
		]
	})
	searchLies(() => HTMLCanvasElement)
	searchLies(() => HTMLElement, {
		target: [
			'clientHeight',
			'clientWidth',
			'offsetHeight',
			'offsetWidth',
			'scrollHeight',
			'scrollWidth'
		],
		ignore: [
			// Firefox returns undefined on getIllegalTypeErrorLie test
			'onmouseenter',
			'onmouseleave'
		]
	})
	searchLies(() => HTMLIFrameElement, {
		target: [
			'contentDocument',
			'contentWindow',
		]
	})
	searchLies(() => IntersectionObserverEntry, {
		target: [
			'boundingClientRect',
			'intersectionRect',
			'rootBounds'
		]
	})
	searchLies(() => Math, {
		target: [
			'acos',
			'acosh',
			'asinh',
			'atan',
			'atan2',
			'atanh',
			'cbrt',
			'cos',
			'cosh',
			'exp',
			'expm1',
			'log',
			'log10',
			'log1p',
			'sin',
			'sinh',
			'sqrt',
			'tan',
			'tanh'
		]
	})
	searchLies(() => MediaDevices, {
		target: [
			'enumerateDevices',
			'getDisplayMedia',
			'getUserMedia'
		]
	})
	searchLies(() => Navigator, {
		target: [
			'appCodeName',
			'appName',
			'appVersion',
			'buildID',
			'connection',
			'deviceMemory',
			'getBattery',
			'getGamepads',
			'getVRDisplays',
			'hardwareConcurrency',
			'language',
			'languages',
			'maxTouchPoints',
			'mimeTypes',
			'oscpu',
			'platform',
			'plugins',
			'product',
			'productSub',
			'sendBeacon',
			'serviceWorker',
			'userAgent',
			'vendor',
			'vendorSub'
		]
	})
	searchLies(() => Node, {
		target: [
			'appendChild',
			'insertBefore',
			'replaceChild'
		]
	})
	searchLies(() => OffscreenCanvasRenderingContext2D, {
		target: [
			'getImageData',
			'getLineDash',
			'isPointInPath',
			'isPointInStroke',
			'measureText',
			'quadraticCurveTo'
		]
	})
	searchLies(() => Range, {
		target: [
			'getBoundingClientRect',
			'getClientRects',
		]
	})
	searchLies(() => Intl.RelativeTimeFormat, {
		target: [
			'resolvedOptions'
		]
	})
	searchLies(() => Screen)
	searchLies(() => speechSynthesis, {
		target: [
			'getVoices'
		]
	})
	searchLies(() => SVGRect)
	searchLies(() => TextMetrics)
	searchLies(() => WebGLRenderingContext, {
		target: [
			'bufferData',
			'getParameter',
			'readPixels'
		]
	})
	searchLies(() => WebGL2RenderingContext, {
		target: [
			'bufferData',
			'getParameter',
			'readPixels'
		]
	})

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
		lieDetector,
		lieList: Object.keys(props).sort(),
		lieDetail: props,
		lieCount: Object.keys(props).reduce((acc, key) => acc + props[key].length, 0),
		propsSearched
	}
}

// start program
const start = performance.now()
const {
	lieDetector: lieProps,
	lieList,
	lieDetail,
	lieCount,
	propsSearched
} = getPrototypeLies(phantomDarkness) // execute and destructure the list and detail
const prototypeLies = JSON.parse(JSON.stringify(lieDetail))
const perf = performance.now() - start


console.log(`${propsSearched.length} API properties analyzed in ${(perf).toFixed(2)}ms (${lieList.length} corrupted)`)

const getPluginLies = (plugins, mimeTypes) => {
	const lies = [] // collect lie types
	const pluginsOwnPropertyNames = Object.getOwnPropertyNames(plugins).filter(name => isNaN(+name))
	const mimeTypesOwnPropertyNames = Object.getOwnPropertyNames(mimeTypes).filter(name => isNaN(+name))

	// cast to array
	plugins = [...plugins]
	mimeTypes = [...mimeTypes]

	// get intitial trusted mimeType names
	const trustedMimeTypes = new Set(mimeTypesOwnPropertyNames)

	// get initial trusted plugin names
	const excludeDuplicates = arr => [...new Set(arr)]
	const mimeTypeEnabledPlugins = excludeDuplicates(
		mimeTypes.map(mimeType => mimeType.enabledPlugin)
	)
	const trustedPluginNames = new Set(pluginsOwnPropertyNames)
	const mimeTypeEnabledPluginsNames = mimeTypeEnabledPlugins.map(plugin => plugin && plugin.name)
	const trustedPluginNamesArray = [...trustedPluginNames]
	trustedPluginNamesArray.forEach(name => {
		const validName = new Set(mimeTypeEnabledPluginsNames).has(name)
		if (!validName) {
			trustedPluginNames.delete(name)
		}
	})

	// 1. Expect plugin name to be in plugins own property names
	/* [1-2 are unstable tests as of Chrome 94]
	plugins.forEach(plugin => {
		if (!trustedPluginNames.has(plugin.name)) {
			lies.push('missing plugin name')
		}
	})

	// 2. Expect MimeType Plugins to match Plugins
	const getPluginPropertyValues = plugin => {
		return [
			plugin.description,
			plugin.filename,
			plugin.length,
			plugin.name
		]
	}
	const pluginList = plugins.map(getPluginPropertyValues).sort()
	const enabledpluginList = mimeTypeEnabledPlugins.map(getPluginPropertyValues).sort()
	const mismatchingPlugins = '' + pluginList != '' + enabledpluginList
	if (mismatchingPlugins) {
		lies.push('mismatching plugins')
	}
	*/

	// 3. Expect MimeType object in plugins
	const invalidPlugins = plugins.filter(plugin => {
		try {
			const validMimeType = Object.getPrototypeOf(plugin[0]).constructor.name == 'MimeType'
			if (!validMimeType) {
				trustedPluginNames.delete(plugin.name)
			}
			return !validMimeType
		} catch (error) {
			trustedPluginNames.delete(plugin.name)
			return true // sign of tampering
		}
	})
	if (invalidPlugins.length) {
		lies.push('missing mimetype')
	}

	// 4. Expect valid MimeType(s) in plugin
	const pluginMimeTypes = plugins
		.map(plugin => Object.values(plugin))
		.flat()
	const pluginMimeTypesNames = pluginMimeTypes.map(mimetype => mimetype.type)
	pluginMimeTypesNames.forEach(name => {
		const validName = trustedMimeTypes.has(name)
		if (!validName) {
			trustedMimeTypes.delete(name)
		}
	})

	plugins.forEach(plugin => {
		const pluginMimeTypes = Object.values(plugin).map(mimetype => mimetype.type)
		return pluginMimeTypes.forEach(mimetype => {
			if (!trustedMimeTypes.has(mimetype)) {
				lies.push('invalid mimetype')
				return trustedPluginNames.delete(plugin.name)
			}
		})
	})

	return {
		validPlugins: plugins.filter(plugin => trustedPluginNames.has(plugin.name)),
		validMimeTypes: mimeTypes.filter(mimeType => trustedMimeTypes.has(mimeType.type)),
		lies: [...new Set(lies)] // remove duplicates
	}
}

// disregard Function.prototype.toString lies when determining if the API can be trusted
const getNonFunctionToStringLies = x => !x ? x : x.filter(x => !/object toString|toString incompatible proxy/.test(x)).length

const getLies = imports => {

	const {
		require: {
			lieRecords
		}
	} = imports

	const records = lieRecords.getRecords()
	return new Promise(resolve => {
		const totalLies = Object.keys(records).reduce((acc, key) => {
			acc += records[key].length
			return acc
		}, 0)
		return resolve({ data: records, totalLies })
	})
}

const liesHTML = ({ fp, hashSlice, modal }) => {
	const { lies: { data, totalLies, $hash } } = fp
	return `
	<div class="col-four${totalLies ? ' lies' : ''}">
		<strong>Lies</strong>${totalLies ? `<span class="hash">${hashSlice($hash)}</span>` : ''}
		<div>unmasked (${!totalLies ? '0' : '' + totalLies}): ${
		totalLies ? modal('creep-lies', Object.keys(data).sort().map(key => {
			const lies = data[key]
			return `
				<br>
				<div style="padding:5px">
					<strong>${key}</strong>:
					${lies.map(lie => `<div>- ${lie}</div>`).join('')}
				</div>
				`
		}).join('')) : ''
		}</div>
	</div>`
}

export { documentLie, phantomDarkness, parentPhantom, lieProps, prototypeLies, lieRecords, getLies, dragonFire, parentDragon, dragonOfDeath, getPluginLies, getNonFunctionToStringLies, liesHTML }