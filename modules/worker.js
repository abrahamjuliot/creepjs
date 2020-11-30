// worker
// https://stackoverflow.com/a/20693860
// https://stackoverflow.com/a/10372280
// https://stackoverflow.com/a/9239272
const newWorker = (fn, { require: [ isFirefox, contentWindow, caniuse, captureError ] }) => {
	
	const response = `(${''+fn})(${''+caniuse})`
	try {
		const blobURL = URL.createObjectURL(new Blob(
			[response],
			{ type: 'application/javascript' }
		))

		let worker
		if (contentWindow && !isFirefox) { // firefox throws an error
			worker = contentWindow.Worker
		}
		else {
			worker = Worker
		}
		const workerInstance = new worker(blobURL)
		URL.revokeObjectURL(blobURL)
		
		return workerInstance
	}
	catch (error) {
		captureError(error, 'worker Blob failed or blocked by client')
		// try backup
		try {
			const uri = `data:application/javascript,${encodeURIComponent(response)}`
			return new worker(uri)
		}
		catch (error) {
			captureError(error, 'worker URI failed or blocked by client')
			return undefined
		}
	}
}
// inline worker scope
const inlineWorker = async caniuse => {
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
	let webglVendor = undefined
	let webglRenderer = undefined
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
		const seasons = {
			jan: (+winter - winterUTCTime) / minute,
			apr: (+spring - springUTCTime) / minute,
			jul: (+summer - summerUTCTime) / minute,
			oct: (+fall - fallUTCTime) / minute
		}
		return seasons
	}
	const currentYear = Date().split ` ` [3]
	const seasons1984 = getTimezoneOffsetSeasons(1984)
	const seasonsToday = getTimezoneOffsetSeasons(currentYear)
	const timezoneOffset = computeTimezoneOffset()
	const hardwareConcurrency = caniuse(() => navigator, ['hardwareConcurrency'])
	const language = caniuse(() => navigator, ['language'])
	const platform = caniuse(() => navigator, ['platform'])
	const userAgent = caniuse(() => navigator, ['userAgent'])
	const jsEngine = {
		[-3.3537128705376014]: 'V8',
		[-3.353712870537601]: 'SpiderMonkey',
		[-3.353712870537602]: 'JavaScriptCore'
	}
	const mathResult = Math.tan(10*Math.LOG2E)
	const jsImplementation = jsEngine[mathResult] || 'unknown'

	postMessage({
		jsImplementation,
		timezoneOffset,
		seasons1984,
		seasonsToday,
		hardwareConcurrency,
		language,
		platform,
		userAgent,
		canvas2d,
		webglRenderer,
		webglVendor
	})
	close()
}

export const getWorkerScope = imports => {
	
	const {
		require: {
			isFirefox,
			getOS,
			hashify,
			captureError,
			caniuse,
			contentWindow,
			getUserAgentPlatform,
			logTestResult
		}
	} = imports

	return new Promise(resolve => {
		try {
			const worker = newWorker(inlineWorker, { require: [ isFirefox, contentWindow, caniuse, captureError ] })
			if (!worker) {
				logTestResult({ test: 'worker', passed: false })
				return resolve()
			}
			worker.addEventListener('message', async event => {
				const { data, data: { canvas2d } } = event
				data.system = getOS(data.userAgent)
				data.device = getUserAgentPlatform({ userAgent: data.userAgent })
				data.canvas2d = { dataURI: canvas2d, $hash: await hashify(canvas2d) }
				const $hash = await hashify(data)
				logTestResult({ test: 'worker', passed: true })
				return resolve({ ...data, $hash })
			}, false)
		}
		catch (error) {
			logTestResult({ test: 'worker', passed: false })
			captureError(error)
			return resolve()
		}
	})
}