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

const getFirefox = () => 3.141592653589793 ** -100 == 1.9275814160560185e-50

const getPrototypeLies = globalScope => {
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
	const getToStringLie = (apiFunction, name, globalScope) => {
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
			iframeToString = globalScope.Function.prototype.toString.call(apiFunction)
		} catch (e) { }
		try {
			iframeToStringToString = globalScope.Function.prototype.toString.call(apiFunction.toString)
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
			[`failed toString`]: getToStringLie(apiFunction, name, globalScope),
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
							res = getLies(getterFunction, proto, obj) // send the obj for special tests
							if (res.lied) {
								return (props[apiName] = res.lieTypes)
							}
							return
						} catch (error) {
							/*
							const lie = `failed prototype test execution`
							return (
								props[apiName] = [lie]
							)*/
							// allow fail in worker scope (unsupported properties)
							return
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
	searchLies(() => Intl.DateTimeFormat, {
		target: [
			'formatRange',
			'formatToParts',
			'resolvedOptions'
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
	searchLies(() => WorkerNavigator, {
		target: [
			'appVersion',
			'deviceMemory',
			'hardwareConcurrency',
			'language',
			'languages',
			'platform',
			'userAgent'
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
	searchLies(() => OffscreenCanvas, {
		target: [
			'convertToBlob',
			'getContext'
		]
	})
	searchLies(() => Intl.RelativeTimeFormat, {
		target: [
			'resolvedOptions'
		]
	})
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

const getEmojis = () => [
	[128512],[9786],[129333, 8205, 9794, 65039],[9832],[9784],[9895],[8265],[8505],[127987, 65039, 8205, 9895, 65039],[129394],[9785],[9760],[129489, 8205, 129456],[129487, 8205, 9794, 65039],[9975],[129489, 8205, 129309, 8205, 129489],[9752],[9968],[9961],[9972],[9992],[9201],[9928],[9730],[9969],[9731],[9732],[9976],[9823],[9937],[9000],[9993],[9999],

	[128105, 8205, 10084, 65039, 8205, 128139, 8205, 128104],
	[128104, 8205, 128105, 8205, 128103, 8205, 128102],
	[128104, 8205, 128105, 8205, 128102],

	// android 11
	[128512],
	[169], [174], [8482],
	[128065, 65039, 8205, 128488, 65039],
	
	// other
	[10002],[9986],[9935],[9874],[9876],[9881],[9939],[9879],[9904],[9905],[9888],[9762],[9763],[11014],[8599],[10145],[11013],[9883],[10017],[10013],[9766],[9654],[9197],[9199],[9167],[9792],[9794],[10006],[12336],[9877],[9884],[10004],[10035],[10055],[9724],[9642],[10083],[10084],[9996],[9757],[9997],[10052],[9878],[8618],[9775],[9770],[9774],[9745],[10036],[127344],[127359]
].map(emojiCode => String.fromCodePoint(...emojiCode))

const codecs = [
	'audio/ogg; codecs=vorbis',
	'audio/ogg; codecs=flac',
	'audio/mp4; codecs="mp4a.40.2"',
	'audio/mpeg; codecs="mp3"',
	'video/ogg; codecs="theora"',
	'video/mp4; codecs="avc1.42E01E"'
]

const getMediaConfig = (codec, video, audio) => ({
    type: 'file',
    video: !/^video/.test(codec) ? undefined : {
        contentType: codec,
        ...video
    },
    audio: !/^audio/.test(codec) ? undefined : {
        contentType: codec,
        ...audio
    }
})

const getMediaCapabilities = async () => {
	const video = {
		width: 1920,
		height: 1080,
		bitrate: 120000,
		framerate: 60
	}
	const audio = {
		channels: 2,
		bitrate: 300000,
		samplerate: 5200
	}
	try {
		const decodingInfo = codecs.map(codec => {
			const config = getMediaConfig(codec, video, audio)
			const info = navigator.mediaCapabilities.decodingInfo(config)
				.then(support => ({
					codec,
					...support
				}))
				.catch(error => console.error(codec, error))
			return info
		})
		const data = await Promise.all(decodingInfo).catch(error => console.error(error))
		const codecsSupported = data.reduce((acc, support) => {
			const { codec, supported, smooth, powerEfficient } = support || {}
			if (!supported) { return acc }
			return {
				...acc,
				[codec]: [
					...(smooth ? ['smooth'] : []),
					...(powerEfficient ? ['efficient'] : [])
				]
			}
		}, {})
		return codecsSupported
	}
	catch (error) {
		return
	}
}

const getPermissionState = name => {
	if (!('permissions' in navigator)) {
		return
	}
	return navigator.permissions.query({ name })
    .then(res => ({ name, state: res.state }))
    .catch(error => ({ name, state: 'unknown' }))
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

const getWindowsFontMap = () => ({
	// https://docs.microsoft.com/en-us/typography/fonts/windows_11_font_list
	'7': [
		'Cambria Math',
		'Lucida Console'
	],
	'8': [
		'Aldhabi',
		'Gadugi',
		'Myanmar Text',
		'Nirmala UI'
	],
	'8.1': [
		'Leelawadee UI',
		'Javanese Text',
		'Segoe UI Emoji'
	],
	'10': [
		'HoloLens MDL2 Assets', // 10 (v1507) +
		'Segoe MDL2 Assets', // 10 (v1507) +
		'Bahnschrift', // 10 (v1709) +-
		'Ink Free', // 10 (v1803) +-
	],
	'11': ['Segoe Fluent Icons']
})

const getMacOSFontMap = () => ({
	// Mavericks and below
	'10.9': [
		'Helvetica Neue',
		'Geneva' // mac (not iOS)
	],
	// Yosemite
	'10.10': [
		'Kohinoor Devanagari Medium',
		'Luminari'
	],
	// El Capitan
	'10.11': [
		'PingFang HK Light'
	],
	// Sierra: https://support.apple.com/en-ie/HT206872
	'10.12': [
		'American Typewriter Semibold',
		'Futura Bold',
		'SignPainter-HouseScript Semibold'
	],
	// High Sierra: https://support.apple.com/en-me/HT207962
	// Mojave: https://support.apple.com/en-us/HT208968
	'10.13-10.14': [
		'InaiMathi Bold'
	],
	// Catalina: https://support.apple.com/en-us/HT210192
	// Big Sur: https://support.apple.com/en-sg/HT211240
	'10.15-11': [
		'Galvji',
		'MuktaMahee Regular'
	],
	// Monterey: https://www.apple.com/my/macos/monterey/features/
	// https://apple.stackexchange.com/questions/429548/request-for-list-of-fonts-folder-contents-on-monterey
	//'12': []
})

const getDesktopAppFontMap = () => ({
	// docs.microsoft.com/en-us/typography/font-list/ms-outlook
	'Microsoft Outlook': ['MS Outlook'],
	// https://community.adobe.com/t5/postscript-discussions/zwadobef-font/m-p/3730427#M785
	'Adobe Acrobat': ['ZWAdobeF'],
	// https://wiki.documentfoundation.org/Fonts
	'LibreOffice': [
		'Amiri',
		'KACSTOffice',
		'Liberation Mono',
		'Source Code Pro'
	],
	// https://superuser.com/a/611804
	'OpenOffice': [
		'DejaVu Sans',
		'Gentium Book Basic',
		'OpenSymbol'
	]
})

const getAppleFonts = () => {
	const macOSFontMap = getMacOSFontMap()
	return Object.keys(macOSFontMap).map(key => macOSFontMap[key]).flat()
}

const getWindowsFonts = () => {
	const windowsFontMap = getWindowsFontMap()
	return Object.keys(windowsFontMap).map(key => windowsFontMap[key]).flat()
}

const getDesktopAppFonts = () => {
	const desktopAppFontMap = getDesktopAppFontMap()
	return Object.keys(desktopAppFontMap).map(key => desktopAppFontMap[key]).flat()
}

const getLinuxFonts = () => [
	'Arimo', // ubuntu, chrome os
	'Chilanka', // ubuntu (not TB)
	'Cousine', // ubuntu, chrome os
	'Jomolhari', // chrome os
	'MONO', // ubuntu, chrome os (not TB)
	'Noto Color Emoji', // Linux
	'Ubuntu', // ubuntu (not TB)
]

const getAndroidFonts = () => [
	'Dancing Script', // android
	'Droid Sans Mono', // Android
	'Roboto' // Android, Chrome OS
]

const getFontList = () => [
	...getAppleFonts(),
	...getWindowsFonts(),
	...getLinuxFonts(),
	...getAndroidFonts(),
	...getDesktopAppFonts()
].sort()

const getFontFaceLoadFonts = async fontList => {
	if (!self.FontFace) {
		return
	}
	try {
		const fontFaceList = fontList.map(font => new FontFace(font, `local("${font}")`))
		const responseCollection = await Promise
			.allSettled(fontFaceList.map(font => font.load()))
		const fonts = responseCollection.reduce((acc, font) => {
			if (font.status == 'fulfilled') {
				return [...acc, font.value.family]
			}
			return acc
		}, [])
		return fonts
	} catch (error) {
		console.error(error)
		return []
	}
}

const getPlatformVersion = fonts => {
	if (!fonts) {
		return
	}
	const getWindows = ({ fonts, fontMap }) => {
		const fontVersion = {
			['11']: fontMap['11'].find(x => fonts.includes(x)),
			['10']: fontMap['10'].find(x => fonts.includes(x)),
			['8.1']: fontMap['8.1'].find(x => fonts.includes(x)),
			['8']: fontMap['8'].find(x => fonts.includes(x)),
			// require complete set of Windows 7 fonts
			['7']: fontMap['7'].filter(x => fonts.includes(x)).length == fontMap['7'].length
		}
		const hash = (
			'' + Object.keys(fontVersion).sort().filter(key => !!fontVersion[key])
		)
		const hashMap = {
			'10,11,7,8,8.1': '11',
			'10,7,8,8.1': '10',
			'7,8,8.1': '8.1',
			'11,7,8,8.1': '8.1', // missing 10
			'7,8': '8',
			'10,7,8': '8', // missing 8.1
			'10,11,7,8': '8', // missing 8.1
			'7': '7',
			'7,8.1': '7',
			'10,7,8.1': '7', // missing 8
			'10,11,7,8.1': '7', // missing 8
		}
		const version = hashMap[hash]
		return version ? `Windows ${version}` : undefined
	}

	const getMacOS = ({ fonts, fontMap }) => {
		const fontVersion = {
			['10.15-11']: fontMap['10.15-11'].find(x => fonts.includes(x)),
			['10.13-10.14']: fontMap['10.13-10.14'].find(x => fonts.includes(x)),
			['10.12']: fontMap['10.12'].find(x => fonts.includes(x)),
			['10.11']: fontMap['10.11'].find(x => fonts.includes(x)),
			['10.10']: fontMap['10.10'].find(x => fonts.includes(x)),
			// require complete set of 10.9 fonts
			['10.9']: fontMap['10.9'].filter(x => fonts.includes(x)).length == fontMap['10.9'].length
		}
		const hash = (
			'' + Object.keys(fontVersion).sort().filter(key => !!fontVersion[key])
		)
		const hashMap = {
			'10.10,10.11,10.12,10.13-10.14,10.15-11,10.9': '10.15-11',
			'10.10,10.11,10.12,10.13-10.14,10.9': '10.13-10.14',
			'10.10,10.11,10.12,10.9': 'Sierra', // 10.12
			'10.10,10.11,10.9': 'El Capitan', // 10.11
			'10.10,10.9': 'Yosemite', // 10.10
			'10.9': 'Mavericks' // 10.9
		}
		const version = hashMap[hash]
		return version ? `macOS ${version}` : undefined
	}

	return  (
		getWindows({ fonts, fontMap: getWindowsFontMap() }) ||
		getMacOS({ fonts, fontMap: getMacOSFontMap() })
	)
}

const getDesktopApps = fonts => {
	if (!fonts) {
		return
	}
	const desktopAppFontMap = getDesktopAppFontMap()
	const apps = Object.keys(desktopAppFontMap).reduce((acc, key) => {
		const appFontSet = desktopAppFontMap[key]
		const match = appFontSet.filter(x => fonts.includes(x)).length == appFontSet.length
		return match ? [...acc, key] : acc
	}, [])
	return apps
}

const getFontSystemClass = fonts => {
	if (!fonts) {
		return
	}
	const windows = new Set(['Lucida Console'])
	const apple = new Set(['Helvetica Neue'])
	const linux = new Set(getLinuxFonts())
	const android = new Set(getAndroidFonts())
	const fontSystemClass = [...fonts.reduce((acc, font) => {
		if (!acc.has('Windows') && windows.has(font)) {
			acc.add('Windows')
			return acc
		}
		if (!acc.has('Apple') && apple.has(font)) {
			acc.add('Apple')
			return acc
		}
		if (!acc.has('Linux') && linux.has(font)) {
			acc.add('Linux')
			return acc
		}
		if (!acc.has('Android') && android.has(font)) {
			acc.add('Android')
			return acc
		}
		return acc
	}, new Set())]
	return fontSystemClass.length == 1 ? fontSystemClass[0] : undefined
}

const get2dCanvasData = async () => {
	if (!self.OffscreenCanvas) {
		return
	}
	const getDataURI = async canvasOffscreen2d => {
		if (!canvasOffscreen2d) {
			return
		}
		const blob = await canvasOffscreen2d.convertToBlob()
		const reader = new FileReader()
		reader.readAsDataURL(blob)
		return new Promise(resolve => {
			reader.onloadend = () => resolve(reader.result)
		})
	}
	const width = 186
	const height = 30
	const canvasOffscreen2d = new OffscreenCanvas(width, height)
	const context2d = canvasOffscreen2d.getContext('2d')
	canvasOffscreen2d.width = width
	canvasOffscreen2d.height = height
	const str = `😃🙌🧠🦄🐉🌊🍧🏄‍♀️🌠🔮`
	context2d.font = '14px Arial'
	context2d.fillText(str, 0, 20)
	context2d.fillStyle = 'rgba(0, 0, 0, 0)'
	context2d.fillRect(0, 0, width, height)
	const canvas2dDataURI = await getDataURI(canvasOffscreen2d)

	// get fonts
	const emojis = getEmojis()
	const measureFonts = (context, font, emojis) => {
		context.font = `256px ${font}`
		const metrics = context.measureText(emojis.join(''))
		return {
			ascent: metrics.actualBoundingBoxAscent,
			descent: metrics.actualBoundingBoxDescent,
			left: metrics.actualBoundingBoxLeft,
			right: metrics.actualBoundingBoxRight,
			width: metrics.width,
			fontAscent: metrics.fontBoundingBoxAscent,
			fontDescent: metrics.fontBoundingBoxDescent
		}
	}
	const baseFonts = ['monospace', 'sans-serif', 'serif']
	const fontShortList = [
		'Segoe UI Emoji', // Windows
		'Apple Color Emoji', // Apple
		'Noto Color Emoji',  // Linux, Android, Chrome OS
	]
	const families = fontShortList.reduce((acc, font) => {
		baseFonts.forEach(baseFont => acc.push(`'${font}', ${baseFont}`))
		return acc
	}, [])
	const base = baseFonts.reduce((acc, font) => {
		acc[font] = measureFonts(context2d, font, emojis)
		return acc
	}, {})
	const detectedEmojiFonts = families.reduce((acc, family) => {
		const basefont = /, (.+)/.exec(family)[1]
		const dimensions = measureFonts(context2d, family, emojis)
		const font = /\'(.+)\'/.exec(family)[1]
		const found = (
			dimensions.ascent != base[basefont].ascent ||
			dimensions.descent != base[basefont].descent ||
			dimensions.left != base[basefont].left ||
			dimensions.right != base[basefont].right ||
			dimensions.width != base[basefont].width ||
			dimensions.fontAscent != base[basefont].fontAscent ||
			dimensions.fontDescent != base[basefont].fontDescent
		)
		if (found) {
			acc.add(font)
		}
		return acc
	}, new Set())
	
	// get emoji set and system
	context2d.font = `200px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif`
	const pattern = new Set()
	const emojiSet = emojis.reduce((emojiSet, emoji) => {
		const {
			actualBoundingBoxAscent,
			actualBoundingBoxDescent,
			actualBoundingBoxLeft,
			actualBoundingBoxRight,
			fontBoundingBoxAscent,
			fontBoundingBoxDescent,
			width
		} = context2d.measureText(emoji) || {}
		const dimensions = [
			actualBoundingBoxAscent,
			actualBoundingBoxDescent,
			actualBoundingBoxLeft,
			actualBoundingBoxRight,
			fontBoundingBoxAscent,
			fontBoundingBoxDescent,
			width
		].join(',')
		if (!pattern.has(dimensions)) {
			pattern.add(dimensions)
			emojiSet.add(emoji)
		}
		return emojiSet
	}, new Set())

	// textMetrics System Sum
	const textMetricsSum = 0.00001 * [...pattern].map(x => {
		return x.split(',').reduce((acc, x) => acc += (+x||0), 0)
	}).reduce((acc, x) => acc += x, 0)

	const amplifySum = (n, fontSet) => {
		const { size } = fontSet
		if (size > 1) {
			return n / +`1e${size}00` // ...e-200
		}
		return (
			!size ? n * -1e150 : // -...e+148
				size > 1 ? n / +`1e${size}00` : // ...e-200
					fontSet.has('Segoe UI Emoji') ? n :
						fontSet.has('Apple Color Emoji') ? n / 1e64 : // ...e-66
							n * 1e64 // ...e+62
		)
	} 

	const textMetricsSystemSum = amplifySum(textMetricsSum, detectedEmojiFonts)

	return {
		canvas2dDataURI,
		textMetricsSystemSum,
		emojiSet: [...emojiSet],
		emojiFonts: [...detectedEmojiFonts]
	}
}

const getWebglData = () => {
	if (!self.OffscreenCanvas) {
		return
	}
	const canvasOffscreenWebgl = new OffscreenCanvas(256, 256)
	const contextWebgl = canvasOffscreenWebgl.getContext('webgl')
	const renererInfo = contextWebgl.getExtension('WEBGL_debug_renderer_info')
	return {
		webglVendor: contextWebgl.getParameter(renererInfo.UNMASKED_VENDOR_WEBGL),
		webglRenderer: contextWebgl.getParameter(renererInfo.UNMASKED_RENDERER_WEBGL)
	}
}

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

	const [
		fontFaceLoadFonts,
		canvasData,
		userAgentData,
		mediaCapabilities,
		// https://w3c.github.io/permissions/#permission-registry
		permissions
	] = await Promise.all([
		getFontFaceLoadFonts(getFontList()),
		get2dCanvasData(),
		getUserAgentData(navigator),
		getMediaCapabilities(),
		Promise.all([
			getPermissionState('accelerometer'),
			getPermissionState('ambient-light-sensor'),
			getPermissionState('background-fetch'),
			getPermissionState('background-sync'),
			getPermissionState('bluetooth'),
			getPermissionState('camera'),
			getPermissionState('clipboard'),
			getPermissionState('device-info'),
			getPermissionState('display-capture'),
			getPermissionState('gamepad'),
			getPermissionState('geolocation'),
			getPermissionState('gyroscope'),
			getPermissionState('magnetometer'),
			getPermissionState('microphone'),
			getPermissionState('midi'),
			getPermissionState('nfc'),
			getPermissionState('notifications'),
			getPermissionState('persistent-storage'),
			getPermissionState('push'),
			getPermissionState('screen-wake-lock'),
			getPermissionState('speaker'),
			getPermissionState('speaker-selection')
		])
	]).catch(error => console.error(error))

	// fonts
	const fontPlatformVersion = getPlatformVersion(fontFaceLoadFonts)
	const fontApps = getDesktopApps(fontFaceLoadFonts)
	const fontSystemClass = getFontSystemClass(fontFaceLoadFonts)

	// canvas and emojis
	const {
		canvas2dDataURI: canvas2d,
		textMetricsSystemSum,
		emojiSet,
		emojiFonts
	} = canvasData || {}
	
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
	const protoLie = lieList.length

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

	return {
		scopeKeys,
		lied: protoLie,
		lies: {
			proto: protoLie ? lieDetail : false
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
		mediaCapabilities,
		platform,
		permissions: !('permissions' in navigator) ? undefined : permissions.reduce((acc, perm) => {
			const { state, name } = perm
			if (acc[state]) {
				acc[state].push(name)
				return acc
			}
			acc[state] = [name]
			return acc
		}, {}),
		userAgent,
		canvas2d,
		textMetricsSystemSum,
		emojiSet,
		emojiFonts,
		webglRenderer,
		webglVendor,
		fontFaceLoadFonts,
		fontSystemClass,
		fontPlatformVersion,
		fontApps,
		fontListLen: getFontList().length,
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