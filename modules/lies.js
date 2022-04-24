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
const getRandomValues = () => (
	String.fromCharCode(Math.random() * 26 + 97) +
	Math.random().toString(36).slice(-7)
)

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

//const { iframeWindow: dragonFire, parent: parentDragon } = getDragonIframe({ numberOfNests: 2 })
//const { iframeWindow: dragonOfDeath } = getDragonIframe({ numberOfNests: 4, kill: true })

const getPrototypeLies = scope => {
	const getEngine = () => {
		const mathPI = 3.141592653589793
		const compute = n => mathPI ** -100 == +`1.9275814160560${n}e-50`
		return {
			isChrome: compute(204),
			isFirefox: compute(185),
			isSafari: compute(206)
		}
	}
	const getRandomValues = () => (
		String.fromCharCode(Math.random() * 26 + 97) +
		Math.random().toString(36).slice(-7)
	)
	const randomId = getRandomValues()
	// Lie Tests
	// object constructor descriptor should return undefined properties
	const getUndefinedValueLie = (obj, name) => {
		const objName = obj.name
		const objNameUncapitalized = self[objName.charAt(0).toLowerCase() + objName.slice(1)]
		const hasInvalidValue = !!objNameUncapitalized && (
			typeof Object.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined' ||
			typeof Reflect.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined'
		)
		return hasInvalidValue
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
		const hasInvalidError = !!illegal.find(prop => {
			try {
				prop == '' ? Object(proto[name]) : Object[prop](proto[name])
				return true // failed to throw
			} catch (error) {
				return error.constructor.name != 'TypeError'
			}
		})
		return hasInvalidError
	}

	// calling the interface prototype on the function should throw a TypeError
	const getCallInterfaceTypeErrorLie = (apiFunction, proto) => {
		try {
			new apiFunction()
			apiFunction.call(proto)
			return true
		} catch (error) {
			return error.constructor.name != 'TypeError'
		}
	}

	// applying the interface prototype on the function should throw a TypeError
	const getApplyInterfaceTypeErrorLie = (apiFunction, proto) => {
		try {
			new apiFunction()
			apiFunction.apply(proto)
			return true
		} catch (error) {
			return error.constructor.name != 'TypeError'
		}
	}

	// creating a new instance of the function should throw a TypeError
	const getNewInstanceTypeErrorLie = apiFunction => {
		try {
			new apiFunction()
			return true
		} catch (error) {
			return error.constructor.name != 'TypeError'
		}
	}

	// extending the function on a fake class should throw a TypeError and message "not a constructor"
	const getClassExtendsTypeErrorLie = apiFunction => {
		try {
			const { isSafari } = getEngine()
			const shouldExitInSafari13 = (
				/version\/13/i.test((navigator || {}).userAgent) && isSafari
			)
			if (shouldExitInSafari13) {
				return false
			}
			// begin tests
			class Fake extends apiFunction { }
			return true
		} catch (error) {
			// Native has TypeError and 'not a constructor' message in FF & Chrome
			return (
				error.constructor.name != 'TypeError' ||
				!/not a constructor/i.test(error.message)
			)
		}
	}

	// setting prototype to null and converting to a string should throw a TypeError
	const getNullConversionTypeErrorLie = apiFunction => {
		const nativeProto = Object.getPrototypeOf(apiFunction)
		try {
			Object.setPrototypeOf(apiFunction, null) + ''
			return true
		} catch (error) {
			return error.constructor.name != 'TypeError'
		} finally {
			// restore proto
			Object.setPrototypeOf(apiFunction, nativeProto)
		}
	}

	// toString() and toString.toString() should return a native string in all frames
	const getToStringLie = (apiFunction, name, scope) => {
        /*
        Accepted strings:
        'function name() { [native code] }'
        'function name() {\n    [native code]\n}'
        'function get name() { [native code] }'
        'function get name() {\n    [native code]\n}'
        'function () { [native code] }'
        `function () {\n    [native code]\n}`
        */
		let scopeToString, scopeToStringToString
		try {
			scopeToString = scope.Function.prototype.toString.call(apiFunction)
		} catch (e) { }
		try {
			scopeToStringToString = scope.Function.prototype.toString.call(apiFunction.toString)
		} catch (e) { }

		const apiFunctionToString = (
			scopeToString ?
				scopeToString :
					apiFunction.toString()
		)
		const apiFunctionToStringToString = (
			scopeToStringToString ?
				scopeToStringToString :
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
	const getPrototypeInFunctionLie = apiFunction => 'prototype' in apiFunction

	// "arguments", "caller", "prototype", "toString"  should not exist in descriptor
	const getDescriptorLie = apiFunction => {
		const hasInvalidDescriptor = (
			Object.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
			Reflect.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
			Object.getOwnPropertyDescriptor(apiFunction, 'caller') ||
			Reflect.getOwnPropertyDescriptor(apiFunction, 'caller') ||
			Object.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
			Reflect.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
			Object.getOwnPropertyDescriptor(apiFunction, 'toString') ||
			Reflect.getOwnPropertyDescriptor(apiFunction, 'toString')
		)
		return hasInvalidDescriptor
	}

	// "arguments", "caller", "prototype", "toString" should not exist as own property
	const getOwnPropertyLie = apiFunction => {
		const hasInvalidOwnProperty = (
			apiFunction.hasOwnProperty('arguments') ||
			apiFunction.hasOwnProperty('caller') ||
			apiFunction.hasOwnProperty('prototype') ||
			apiFunction.hasOwnProperty('toString')
		)
		return hasInvalidOwnProperty
	}

	// descriptor keys should only contain "name" and "length"
	const getDescriptorKeysLie = apiFunction => {
		const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(apiFunction))
		const hasInvalidKeys = '' + descriptorKeys != 'length,name' && '' + descriptorKeys != 'name,length'
		return hasInvalidKeys
	}

	// own property names should only contain "name" and "length"
	const getOwnPropertyNamesLie = apiFunction => {
		const ownPropertyNames = Object.getOwnPropertyNames(apiFunction)
		const hasInvalidNames = !(
			'' + ownPropertyNames == 'length,name' ||
			'' + ownPropertyNames == 'name,length'
		)
		return hasInvalidNames
	}

	// own keys names should only contain "name" and "length"
	const getOwnKeysLie = apiFunction => {
		const ownKeys = Reflect.ownKeys(apiFunction)
		const hasInvalidKeys = !(
			'' + ownKeys == 'length,name' ||
			'' + ownKeys == 'name,length'
		)
		return hasInvalidKeys
	}

	// calling toString() on an object created from the function should throw a TypeError
	const getNewObjectToStringTypeErrorLie = apiFunction => {
		try {
			const you = () => Object.create(apiFunction).toString()
			const cant = () => you()
			const hide = () => cant()
			hide()
			// error must throw
			return true
		} catch (error) {
			const stackLines = error.stack.split('\n')
			const validScope = !/at Object\.apply/.test(stackLines[1])
			// Stack must be valid
			const validStackSize = (
				error.constructor.name == 'TypeError' && stackLines.length >= 5
			)
			// Chromium must throw error 'at Function.toString'... and not 'at Object.apply'
			const { isChrome } = getEngine()
			if (validStackSize && isChrome && (
				!validScope ||
				!/at Function\.toString/.test(stackLines[1]) ||
				!/at you/.test(stackLines[2]) ||
				!/at cant/.test(stackLines[3]) ||
				!/at hide/.test(stackLines[4])
			)) {
				return true
			}
			return !validStackSize
		}
	}

	/* Proxy Detection */
	// arguments or caller should not throw 'incompatible Proxy' TypeError
	const tryIncompatibleProxy = fn => {
		const { isFirefox } = getEngine()
		try {
			fn()
			return true // failed to throw
		} catch (error) {
			return (
				error.constructor.name != 'TypeError' ||
				(isFirefox && /incompatible\sProxy/.test(error.message))
			)
		}
	}
	const getIncompatibleProxyTypeErrorLie = apiFunction => {
		return (
			tryIncompatibleProxy(() => apiFunction.arguments) ||
			tryIncompatibleProxy(() => apiFunction.caller)
		)
	}
	const getToStringIncompatibleProxyTypeErrorLie = apiFunction => {
		return (
			tryIncompatibleProxy(() => apiFunction.toString.arguments) ||
			tryIncompatibleProxy(() => apiFunction.toString.caller)
		)
	}

	// checking proxy instanceof proxy should throw a valid TypeError
	const getInstanceofCheckLie = apiFunction => {
		const proxy = new Proxy(apiFunction, {})
		const { isChrome } = getEngine()
		if (!isChrome) {
			return false
		}
		const hasValidStack = (error, type = 'Function') => {
			const { message, name, stack } = error
			const validName = name == 'TypeError'
			const validMessage = message == `Function has non-object prototype 'undefined' in instanceof check`
			const targetStackLine = ((stack || '').split('\n') || [])[1]
			const validStackLine = (
				targetStackLine.startsWith(`    at ${type}.[Symbol.hasInstance]`) ||
				targetStackLine.startsWith('    at [Symbol.hasInstance]') // Chrome 102
			)
			return validName && validMessage && validStackLine
		}
		try {
			proxy instanceof proxy
			return true // failed to throw
		}
		catch (error) {
			// expect Proxy.[Symbol.hasInstance]
			if (!hasValidStack(error, 'Proxy')) {
				return true
			}
			try {
				apiFunction instanceof apiFunction
				return true // failed to throw
			}
			catch (error) {
				// expect Function.[Symbol.hasInstance] 
				return !hasValidStack(error)
			}
		}
	}

	// defining properties should not throw an error
	const getDefinePropertiesLie = (apiFunction) => {
		const { isChrome } = getEngine()
		if (!isChrome) {
			return false // chrome only test
		}
		try {
			const _apiFunction = apiFunction
			Object.defineProperty(_apiFunction, '', {})+''
			Object.defineProperties(_apiFunction, {})+''
			return false
		} catch (error) {
			return true // failed at Error
		}
	}

	// setPrototypeOf error tests
	const spawnError = (apiFunction, method) => {
		if (method == 'setPrototypeOf') {
			return Object.setPrototypeOf(apiFunction, Object.create(apiFunction)) + ''
		} else {
			apiFunction.__proto__ = apiFunction
			return apiFunction++
		}
	}
	const hasValidError = error => {
		const { isChrome, isFirefox } = getEngine()
		const { name, message } = error
		const hasRangeError = name == 'RangeError'
		const hasInternalError = name == 'InternalError'
		const chromeLie = isChrome && (
			message != `Maximum call stack size exceeded` || !hasRangeError
		)
		const firefoxLie = isFirefox && (
			message != `too much recursion` || !hasInternalError
		)
		return (hasRangeError || hasInternalError) && !(chromeLie || firefoxLie) 
	}


	const getTooMuchRecursionLie = ({ apiFunction, method = 'setPrototypeOf' }) => {
		const nativeProto = Object.getPrototypeOf(apiFunction)
		const proxy = new Proxy(apiFunction, {})
		try {
			spawnError(proxy, method)
			return true // failed to throw
		} catch (error) {
			return !hasValidError(error)
		} finally {
			Object.setPrototypeOf(proxy, nativeProto) // restore
		}
	}

	const getChainCycleLie = ({ apiFunction, method = 'setPrototypeOf' }) => {
		const nativeProto = Object.getPrototypeOf(apiFunction)
		try {
			spawnError(apiFunction, method)
			return true // failed to throw
		} catch (error) {
			const { isChrome, isFirefox } = getEngine()
			const { name, message, stack } = error
			const targetStackLine = ((stack || '').split('\n') || [])[1]
			const hasTypeError = name == 'TypeError'
			const chromeLie = isChrome && (
				message != `Cyclic __proto__ value` || (
					method == '__proto__' && (
						!targetStackLine.startsWith(`    at Function.set __proto__ [as __proto__]`) &&
						!targetStackLine.startsWith(`    at set __proto__ [as __proto__]`) // Chrome 102
					)
				)
			)
			const firefoxLie = isFirefox && (
				message != `can't set prototype: it would cause a prototype chain cycle`
			)
			if (!hasTypeError || chromeLie || firefoxLie) {
				return true // failed Error
			}
		} finally {
			Object.setPrototypeOf(apiFunction, nativeProto) // restore
		}
	}

	const getReflectSetProtoLie = ({ apiFunction, randomId }) => {
		if (!randomId) {
			randomId = getRandomValues()
		}
		const nativeProto = Object.getPrototypeOf(apiFunction)
		try {
			if (Reflect.setPrototypeOf(apiFunction, Object.create(apiFunction))) {
				return true // failed value (expected false)
			} else {
				try {
					randomId in apiFunction
					return false
				} catch (error) {
					return true  // failed at Error 
				}
			}
		} catch (error) {
			return true // failed at Error
		} finally {
			Object.setPrototypeOf(apiFunction, nativeProto) // restore
		}
	}

	const getReflectSetProtoProxyLie = ({ apiFunction, randomId }) => {
		if (!randomId) {
			randomId = getRandomValues()
		}
		const nativeProto = Object.getPrototypeOf(apiFunction)
		const proxy = new Proxy(apiFunction, {})
		try {
			if (!Reflect.setPrototypeOf(proxy, Object.create(proxy))) {
				return true // failed value (expected true)
			} else {
				try {
					randomId in apiFunction
					return true // failed to throw
				} catch (error) {
					return !hasValidError(error)
				}
			}
		} catch (error) {
			return true // failed at Error
		} finally {
			Object.setPrototypeOf(proxy, nativeProto) // restore
		}
	}

	// API Function Test
	const getLies = ({ apiFunction, proto, obj = null, lieProps }) => {
		if (typeof apiFunction != 'function') {
			return {
				lied: false,
				lieTypes: []
			}
		}
		const name = apiFunction.name.replace(/get\s/, '')
		let lies = {
			// custom lie string names
			[`failed illegal error`]: obj ? getIllegalTypeErrorLie(obj, name) : false,
			[`failed undefined properties`]: obj ? getUndefinedValueLie(obj, name) : false,
			[`failed call interface error`]: getCallInterfaceTypeErrorLie(apiFunction, proto),
			[`failed apply interface error`]: getApplyInterfaceTypeErrorLie(apiFunction, proto),
			[`failed new instance error`]: getNewInstanceTypeErrorLie(apiFunction),
			[`failed class extends error`]: getClassExtendsTypeErrorLie(apiFunction),
			[`failed null conversion error`]: getNullConversionTypeErrorLie(apiFunction),
			[`failed toString`]: getToStringLie(apiFunction, name, scope),
			[`failed "prototype" in function`]: getPrototypeInFunctionLie(apiFunction),
			[`failed descriptor`]: getDescriptorLie(apiFunction),
			[`failed own property`]: getOwnPropertyLie(apiFunction),
			[`failed descriptor keys`]: getDescriptorKeysLie(apiFunction),
			[`failed own property names`]: getOwnPropertyNamesLie(apiFunction),
			[`failed own keys names`]: getOwnKeysLie(apiFunction),
			[`failed object toString error`]: getNewObjectToStringTypeErrorLie(apiFunction),
			// Proxy Detection
			[`failed at incompatible proxy error`]: getIncompatibleProxyTypeErrorLie(apiFunction),
			[`failed at toString incompatible proxy error`]: getToStringIncompatibleProxyTypeErrorLie(apiFunction),
			[`failed at too much recursion error`]: getChainCycleLie({ apiFunction })
		}
		// conditionally use advanced detection
		const detectProxies = (
			name == 'toString' || !!lieProps['Function.toString']
		)
		if (detectProxies) {
			lies = {
				...lies,
				// Advanced Proxy Detection
				[`failed at too much recursion __proto__ error`]: getChainCycleLie({ apiFunction, method: '__proto__' }),
				[`failed at chain cycle error`]: getTooMuchRecursionLie({ apiFunction }),
				[`failed at chain cycle __proto__ error`]: getTooMuchRecursionLie({ apiFunction, method: '__proto__' }),
				[`failed at reflect set proto`]: getReflectSetProtoLie({ apiFunction, randomId }),
				[`failed at reflect set proto proxy`]: getReflectSetProtoProxyLie({ apiFunction, randomId }),
				[`failed at instanceof check error`]: getInstanceofCheckLie(apiFunction),
				[`failed at define properties`]: getDefinePropertiesLie(apiFunction)
			}
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
									res = getLies({
										apiFunction: proto[name],
										proto,
										lieProps: props
									})
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
							res = getLies({
								apiFunction: getterFunction,
								proto,
								obj,
								lieProps: props
							}) // send the obj for special tests
							
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

	// search lies: remove target to search all properties
	// test Function.toString first to determine the depth of the search
	searchLies(() => Function, {
		target: [
			'toString',
		],
		ignore: [
			'caller',
			'arguments'
		]
	})
	// other APIs
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
			'quadraticCurveTo',
			'font'
		]
	})
	searchLies(() => CSSStyleDeclaration, {
		target: [
			'setProperty'
		]
	})
	searchLies(() => CSS2Properties, { // Gecko
		target: [
			'setProperty'
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
	searchLies(() => FontFace, {
		target: [
			'family',
			'load',
			'status'
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
	searchLies(() => OffscreenCanvas, {
		target: [
			'convertToBlob',
			'getContext'
		]
	})
	searchLies(() => OffscreenCanvasRenderingContext2D, {
		target: [
			'getImageData',
			'getLineDash',
			'isPointInPath',
			'isPointInStroke',
			'measureText',
			'quadraticCurveTo',
			'font'
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
	searchLies(() => String, {
		target: [
			'fromCodePoint'
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
		propsSearched,
		proxyDetectionMethods: [
			getTooMuchRecursionLie,
			getNewObjectToStringTypeErrorLie,
			getChainCycleLie,
			getReflectSetProtoLie,
			getReflectSetProtoProxyLie,
			getInstanceofCheckLie,
			getDefinePropertiesLie,
		]
	}
}

// start program
const start = performance.now()
const {
	lieDetector: lieProps,
	lieList,
	lieDetail,
	lieCount,
	propsSearched,
	proxyDetectionMethods
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

const liesHTML = ({ fp, hashSlice, modal }, pointsHTML) => {
	const { lies: { data, totalLies, $hash } } = fp
	return `
	<div class="${totalLies ? ' lies' : ''}">lies (${!totalLies ? '0' : '' + totalLies}): ${
		!totalLies ? 'none' : modal(
			'creep-lies', 
			Object.keys(data).sort().map(key => {
				const lies = data[key]
				return `
					<br>
					<div style="padding:5px">
						<strong>${key}</strong>:
						${lies.map(lie => `<div>- ${lie}</div>`).join('')}
					</div>
					`
			}).join(''),
			hashSlice($hash)
		)
	}${pointsHTML}</div>`
}

export { documentLie, phantomDarkness, parentPhantom, lieProps, prototypeLies, lieRecords, getLies, proxyDetectionMethods, getPluginLies, getNonFunctionToStringLies, liesHTML }