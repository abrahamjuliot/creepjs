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

	const getUserAgentData = async navigator => {
		if (!('userAgentData' in navigator)) {
			return
		}
		const data = await navigator.userAgentData.getHighEntropyValues(
			['platform', 'platformVersion', 'architecture',  'model']
		)
		const { brands, mobile } = navigator.userAgentData || {}
		const compressedBrands = brands
			.filter(obj => !/Not/.test(obj.brand)).map(obj => `${obj.brand}`)
		const primaryBrands = (
			compressedBrands.length > 1 ? compressedBrands.filter(brand => !/Chromium/.test(brand)) : 
				compressedBrands
		)

		if (!data.brands) {
			data.brands = primaryBrands
		}
		if (!data.mobile) {
			data.mobile = mobile
		}
		const dataSorted = Object.keys(data).sort().reduce((acc, key) => {
			acc[key] = data[key]
			return acc
		},{})
		return dataSorted
	}
	let canvasOffscreen2d = undefined
	try {
		canvasOffscreen2d = new OffscreenCanvas(500, 200)
		const context2d = canvasOffscreen2d.getContext('2d')
		const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
		context2d.font = '14px Arial'
		context2d.fillText(str, 0, 50)
		context2d.fillStyle = 'rgba(100, 200, 99, 0.78)'
		context2d.fillRect(100, 30, 80, 50)
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

	const platformFonts = getPlatformFonts()
	const fontFaceSetFonts = getFontFaceSetFonts(platformFonts)
	
	const [
		canvas2d,
		userAgentData
	] = await Promise.all([
		getDataURI(canvasOffscreen2d),
		getUserAgentData(navigator)
	]).catch(error => console.error(error))

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
	const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
	const { hardwareConcurrency, language, platform, userAgent, deviceMemory } = navigator

	return {
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