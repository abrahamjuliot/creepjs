const getWorkerData = async () => {

	const getAppleFonts = () => [
		'Helvetica Neue'
	]

	const getWindowsFonts = () => [
		'Cambria Math',
		'Lucida Console',
		'MS Serif',
		'Segoe UI'
	]

	const getLinuxFonts = () => [
		'Arimo', // ubuntu, chrome os
		'Cousine', // ubuntu, chrome os
		'MONO', // ubuntu, chrome os (not TB)
		'Jomolhari', // chrome os
		'Ubuntu', // ubuntu (not TB)
		'Chilanka', // ubuntu (not TB)
	]

	const getAndroidFonts = () => [
		'Dancing Script', // android FF
	]

	const getGeneralFonts = () => [
		// Windows
		'Consolas', //FF and Chrome (not TB)
		'HELV', // FF (not TB)
		'Marlett', // chrome
		// Linux 
		'Noto Sans JP', // TB linux
		// Apple
		'Arial Hebrew', // safari + chrome (not FF or TB)
		'Arial Rounded MT Bold', // not TB
		'Geneva', // mac
		'Apple Chancery', // mac (not TB)
		'Apple Color Emoji', // ios, chrome, safari (TB, not FF)
		// Android
		'Roboto', // android FF, Chrome OS
		'Droid Sans Mono', // FF android
		'Cutive Mono', // some android FF
		// Other
		'Liberation Mono', // Chrome OS
		'Noto Sans Yi', // TB on linux and windows, chrome OS, FF android, Safari
		'Monaco', // android + mac
		'Palatino', // android + mac + ios
		'Baskerville', // android + mac
		'Tahoma' // android, mac, windows (not ios, not chrome os 90)
	]

	const getPlatformFonts = () => [
		...getAppleFonts(),
		...getWindowsFonts(),
		...getLinuxFonts(),
		...getAndroidFonts(),
		...getGeneralFonts()
	].sort()

	const getFontFaceSetFonts = list => {
		const controlledErrorMessage = 'FontFaceSet.check blocked or not supported'
		try {
			if (!('fonts' in globalThis)) {
				return []
			}
			const gibberish = '&WY2tR*^ftCiMX9LD5m%iZSWCVSg'
			if (fonts.check(`12px '${gibberish}'`)) {
				throw new Error(controlledErrorMessage)
			} 
			fonts.clear() // clear loaded or added fonts
			const supportedFonts = list.filter(font => fonts.check(`12px '${font}'`))
			return supportedFonts
		} catch (error) {
			if (error.message != controlledErrorMessage) {
				console.error(error)
			}
			return []
		}
	}

	// fontFaceSetFonts and fontSystemClass
	const platformFonts = getPlatformFonts()
	const fontFaceSetFonts = getFontFaceSetFonts(platformFonts)
	const apple = new Set(getAppleFonts())
	const linux = new Set(getLinuxFonts())
	const windows = new Set(getWindowsFonts())
	const android = new Set(getAndroidFonts())
	const fontSystemClass = [...fontFaceSetFonts.reduce((acc, font) => {
		if (!acc.has('Apple') && apple.has(font)) {
			acc.add('Apple')
			return acc
		}
		if (!acc.has('Linux') && linux.has(font)) {
			acc.add('Linux')
			return acc
		}
		if (!acc.has('Windows') && windows.has(font)) {
			acc.add('Windows')
			return acc
		}
		if (!acc.has('Android') && android.has(font)) {
			acc.add('Android')
			return acc
		}
		return acc
	}, new Set())]
	const chromeOnAndroid = (
		''+((fontFaceSetFonts || []).sort()) == 'Baskerville,Monaco,Palatino,Tahoma'
	)
	if (!fontSystemClass.length && chromeOnAndroid) {
		fontSystemClass.push('Android')
	}

	// userAgentData
	const getUserAgentData = async navigator => {
		if (!('userAgentData' in navigator)) {
			return
		}
		const data = await navigator.userAgentData.getHighEntropyValues(
			['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
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

	// canvas2d
	let canvasOffscreen2d = undefined
	try {
		canvasOffscreen2d = new OffscreenCanvas(186, 30)
		const context2d = canvasOffscreen2d.getContext('2d')
		canvasOffscreen2d.width  = 186
		canvasOffscreen2d.height = 30
		const str = `😃🙌🧠🦄🐉🌊🍧🏄‍♀️🌠🔮`
		context2d.font = '14px Arial'
		context2d.fillText(str, 0, 20)
		context2d.fillStyle = 'rgba(0, 0, 0, 0)'
		context2d.fillRect(0, 0, 186, 30)
	}
	catch (error) { }
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
	
	const [
		canvas2d,
		userAgentData
	] = await Promise.all([
		getDataURI(canvasOffscreen2d),
		getUserAgentData(navigator)
	]).catch(error => console.error(error))

	// webglVendor and webglRenderer
	let webglVendor
	let webglRenderer
	try {
		const canvasOffscreenWebgl = new OffscreenCanvas(256, 256)
		const contextWebgl = canvasOffscreenWebgl.getContext('webgl')
		const renererInfo = contextWebgl.getExtension('WEBGL_debug_renderer_info')
		webglVendor = contextWebgl.getParameter(renererInfo.UNMASKED_VENDOR_WEBGL)
		webglRenderer = contextWebgl.getParameter(renererInfo.UNMASKED_RENDERER_WEBGL)
	}
	catch (error) { }

	// timezoneOffset
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
	const timezoneOffset = computeTimezoneOffset()

	// timeZone
	const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone

	// navigator
	const { hardwareConcurrency, language, platform, userAgent, deviceMemory } = navigator

	// locale
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
	const locale = getLocale()

	const localLie = (
		(locale.length && locale.length != 1) || 
		locale[0].toLocaleLowerCase() != language.toLocaleLowerCase()
	)
	return {
		lied: (
			localLie
		),
		lies: {
			locale: localLie ? `${''+locale} locale and ${language} language do not match` : undefined
		},
		locale: ''+locale,
		timezoneOffset,
		timezoneLocation,
		deviceMemory,
		hardwareConcurrency,
		language,
		platform,
		userAgent,
		canvas2d,
		webglRenderer,
		webglVendor,
		fontFaceSetFonts,
		fontSystemClass: fontSystemClass.length == 1 ? fontSystemClass[0] : undefined,
		fontListLen: platformFonts.length,
		userAgentData
	}
}

// Tests
const isWorker = !globalThis.document && !!globalThis.WorkerGlobalScope
const isSharedWorker = !!globalThis.SharedWorkerGlobalScope
const isServiceWorker = !!globalThis.ServiceWorkerGlobalScope

// WorkerGlobalScope
const getWorkerGlobalScope = async () => {
	const data = await getWorkerData()
	postMessage(data)
	close()
}

// SharedWorkerGlobalScope
const getSharedWorkerGlobalScope = () => {
	onconnect = async message => {
		const port = message.ports[0]
		const data = await getWorkerData()
		port.postMessage(data)
	}
}

// ServiceWorkerGlobalScope
const getServiceWorkerGlobalScope = () => {
	const broadcast = new BroadcastChannel('creep_service_primary')
	broadcast.onmessage = async event => {
		if (event.data && event.data.type == 'fingerprint') {
			const data = await getWorkerData()
			broadcast.postMessage(data)
		}
	}
}

// WorkerGlobalScope
if (isWorker) {
	isServiceWorker ? getServiceWorkerGlobalScope() :
	isSharedWorker ? getSharedWorkerGlobalScope() :
	getWorkerGlobalScope()
}