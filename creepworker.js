const ask = fn => { try { return fn() } catch (e) { return } }
const createTimer = () => {
	let start = 0
	const log = []
	return {
		stop: () => {
			if (start) {
				log.push(performance.now() - start)
				return log.reduce((acc, n) => acc += n, 0)
			}
			return start
		},
		start: () => {
			start = performance.now()
			return start
		}
	}
}

const queueEvent = timer => {
	timer.stop()
	return new Promise(resolve => setTimeout(() => resolve(timer.start()), 0))
		.catch(e => { })
}

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
								return (props[apiName] = res.lieTypes)
							}
							return
						} catch (error) {
							console.log(error)
							const lie = `failed prototype test execution`
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

	searchLies(() => WorkerNavigator, {
		target: [
			'deviceMemory',
			'hardwareConcurrency',
			'language',
			'languages',
			'platform',
			'userAgent'
		]
	})
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

const getUserAgentData = async navigator => {
	if (!('userAgentData' in navigator)) {
		return
	}
	const data = await navigator.userAgentData.getHighEntropyValues(
		['platform', 'platformVersion', 'architecture', 'bitness',  'model', 'uaFullVersion']
	)
	const { brands, mobile } = navigator.userAgentData || {}
	const compressedBrands = (brands, captureVersion = false) => brands
		.filter(obj => !/Not/.test(obj.brand)).map(obj => `${obj.brand}${captureVersion ? ` ${obj.version}` : ''}`)
	const removeChromium = brands => (
		brands.length > 1 ? brands.filter(brand => !/Chromium/.test(brand)) : brands
	)

	// compress brands
	if (!data.brands) {
		data.brands = brands
	}
	data.brandsVersion = compressedBrands(data.brands, true)
	data.brands = compressedBrands(data.brands)
	data.brandsVersion = removeChromium(data.brandsVersion)
	data.brands = removeChromium(data.brands)

	if (!data.mobile) {
		data.mobile = mobile
	}
	const dataSorted = Object.keys(data).sort().reduce((acc, key) => {
		acc[key] = data[key]
		return acc
	},{})
	return dataSorted
}

const getWebglData = () => ask(() => {
	const canvasOffscreenWebgl = new OffscreenCanvas(256, 256)
	const contextWebgl = canvasOffscreenWebgl.getContext('webgl')
	const rendererInfo = contextWebgl.getExtension('WEBGL_debug_renderer_info')
	return {
		webglVendor: contextWebgl.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL),
		webglRenderer: contextWebgl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)
	}
})

const computeTimezoneOffset = () => {
	const date = new Date().getDate()
	const month = new Date().getMonth()
	const year = Date().split` `[3] // current year
	const format = n => (''+n).length == 1 ? `0${n}` : n
	const dateString = `${month+1}/${format(date)}/${year}`
	const dateStringUTC = `${year}-${format(month+1)}-${format(date)}`
	const utc = Date.parse(
		new Date(dateString)
	)
	const now = +new Date(dateStringUTC)
	return +(((utc - now)/60000).toFixed(0))
}

const getLocale = () => {
	const constructors = [
		'Collator',
		'DateTimeFormat',
		'DisplayNames',
		'ListFormat',
		'NumberFormat',
		'PluralRules',
		'RelativeTimeFormat'
	]
	const locale = constructors.reduce((acc, name) => {
		try {
			const obj = new Intl[name]
			if (!obj) {
				return acc
			}
			const { locale } = obj.resolvedOptions() || {}
			return [...acc, locale]
		}
		catch (error) {
			return acc
		}
	}, [])

	return [...new Set(locale)]
}

const getWorkerData = async () => {
	const timer = createTimer()
	await queueEvent(timer)

	const userAgentData = await getUserAgentData(navigator).catch(error => console.error(error))

	// webgl
	const { webglVendor, webglRenderer } = getWebglData() || {}

	// timezone & locale
	const timezoneOffset = computeTimezoneOffset()
	const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
	const locale = getLocale()

	// navigator
	const {
		hardwareConcurrency,
		language,
		languages,
		platform,
		userAgent,
		deviceMemory
	} = navigator || {}

	// scope keys
	const scopeKeys = Object.getOwnPropertyNames(self)

	// prototype lies
	await queueEvent(timer)
	const {
		lieDetector: lieProps,
		lieList,
		lieDetail,
		lieCount,
		propsSearched
	} = getPrototypeLies(globalThis) // execute and destructure the list and detail
	const prototypeLies = JSON.parse(JSON.stringify(lieDetail))
	const protoLieLen = lieList.length

	// match engine locale to system locale to determine if locale entropy is trusty
	let systemCurrencyLocale
	const lang = (''+language).split(',')[0]
	try {
		systemCurrencyLocale = (1).toLocaleString((lang || undefined), {
			style: 'currency',
			currency: 'USD',
			currencyDisplay: 'name',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		})
	} catch (e) {}
	const engineCurrencyLocale = (1).toLocaleString(undefined, {
		style: 'currency',
		currency: 'USD',
		currencyDisplay: 'name',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	})
	const localeEntropyIsTrusty = engineCurrencyLocale == systemCurrencyLocale
	const localeIntlEntropyIsTrusty = new Set((''+language).split(',')).has(''+locale)

	const { href, pathname } = self.location || {}
	const locationPathNameLie = (
		!href ||
		!pathname ||
		!/^(\/docs|\/creepjs|)\/creepworker.js$/.test(pathname) ||
		!new RegExp(`${pathname}$`).test(href)
	)

	return {
		scopeKeys,
		lied: protoLieLen || +locationPathNameLie,
		lies: {
			proto: protoLieLen ? lieDetail : false
		},
		locale: ''+locale,
		systemCurrencyLocale,
		engineCurrencyLocale,
		localeEntropyIsTrusty,
		localeIntlEntropyIsTrusty,
		timezoneOffset,
		timezoneLocation,
		deviceMemory,
		hardwareConcurrency,
		language,
		languages: ''+languages,
		platform,
		userAgent,
		webglRenderer,
		webglVendor,
		userAgentData
	}
}

// Compute and communicate from worker scope
const onEvent = (eventType, fn) => addEventListener(eventType, fn)
const send = async source => source.postMessage(await getWorkerData())
if (!globalThis.document && globalThis.WorkerGlobalScope) {
	globalThis.ServiceWorkerGlobalScope ? onEvent('message', e => send(e.source)) :
	globalThis.SharedWorkerGlobalScope ? onEvent('connect', e => send(e.ports[0])) :
	send(self) // DedicatedWorkerGlobalScope
}