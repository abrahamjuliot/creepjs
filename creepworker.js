const getWorkerData = async () => {
	let canvas2d = undefined
	try {
		const canvasOffscreen2d = new OffscreenCanvas(500, 200)
		const context2d = canvasOffscreen2d.getContext('2d')
		const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
		context2d.font = '14px Arial'
		context2d.fillText(str, 0, 50)
		context2d.fillStyle = 'rgba(100, 200, 99, 0.78)'
		context2d.fillRect(100, 30, 80, 50)
		const getDataURI = async () => {
			const blob = await canvasOffscreen2d.convertToBlob()
			const reader = new FileReader()
			reader.readAsDataURL(blob)
			return new Promise(resolve => {
				reader.onloadend = () => resolve(reader.result)
			})
		}
		canvas2d = await getDataURI() 
	}
	catch (error) { }
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
	const getTimezoneOffsetSeasons = year => {
		const minute = 60000
		const winter = new Date(`1/1/${year}`)
		const spring = new Date(`4/1/${year}`)
		const summer = new Date(`7/1/${year}`)
		const fall = new Date(`10/1/${year}`)
		const winterUTCTime = +new Date(`${year}-01-01`)
		const springUTCTime = +new Date(`${year}-04-01`)
		const summerUTCTime = +new Date(`${year}-07-01`)
		const fallUTCTime = +new Date(`${year}-10-01`)
		const seasons = [
			(+winter - winterUTCTime) / minute,
			(+spring - springUTCTime) / minute,
			(+summer - summerUTCTime) / minute,
			(+fall - fallUTCTime) / minute
		]
		return seasons
	}

	const timezoneOffsetUniqueYearHistory = { }
	// unique years based on work by https://arkenfox.github.io/TZP
	const uniqueYears = [1879, 1884, 1894, 1900, 1921, 1952, 1957, 1976, 2018]
	uniqueYears.forEach(year => {
		return (timezoneOffsetUniqueYearHistory[year] = getTimezoneOffsetSeasons(year))
	})

	const timezoneOffset = computeTimezoneOffset()
	const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
	const { hardwareConcurrency, language, platform, userAgent, deviceMemory } = navigator
	const jsEngine = {
		[-3.3537128705376014]: 'V8',
		[-3.353712870537601]: 'SpiderMonkey',
		[-3.353712870537602]: 'JavaScriptCore'
	}
	const mathResult = Math.tan(10*Math.LOG2E)
	const jsImplementation = jsEngine[mathResult] || 'unknown'

	return {
		jsImplementation,
		timezoneOffset,
		timezoneHistoryLocation: timezoneOffsetUniqueYearHistory,
		timezoneLocation,
		deviceMemory,
		hardwareConcurrency,
		language,
		platform,
		userAgent,
		canvas2d,
		webglRenderer,
		webglVendor
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
	const broadcast = new BroadcastChannel('creep_service')
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