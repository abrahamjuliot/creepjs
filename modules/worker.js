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
			hashMini,
			hashify,
			patch,
			html,
			note,
			captureError,
			caniuse,
			contentWindow
		}
	} = imports

	return new Promise(resolve => {
		try {
			const worker = newWorker(inlineWorker, { require: [ isFirefox, contentWindow, caniuse, captureError ] })
			if (!worker) {
				return resolve(undefined)
			}
			
			worker.addEventListener('message', async event => {
				const { data, data: { canvas2d } } = event
				data.system = getOS(data.userAgent)
				data.canvas2d = { dataURI: canvas2d, $hash: await hashify(canvas2d) }
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const el = document.getElementById('creep-worker-scope')
				return patch(el, html`
				<div>
					<strong>Worker</strong><span class="hash">${hashMini($hash)}</span>
					<div class="flex-grid">
						<div class="col-six">
							<div>timezone offset: ${data.timezoneOffset != undefined ? ''+data.timezoneOffset : note.unsupported}</div>
							<div>language: ${data.language || note.unsupported}</div>
							<div>platform: ${data.platform || note.unsupported}</div>
							<div>system: ${data.system || note.unsupported}</div>
							<div>userAgent:</div>
							<div class="block-text">
								<div>${data.userAgent || note.unsupported}</div>
							</div>
						</div>
						<div class="col-six">
							<div>hardwareConcurrency: ${data.hardwareConcurrency || note.unsupported}</div>
							<div>js runtime: ${data.jsImplementation}</div>
							<div>canvas 2d:${
								!!data.canvas2d.dataURI ?
								`<span class="sub-hash">${hashMini(data.canvas2d.$hash)}</span>` :
								` ${note.unsupported}`
							}</div>
							<div>webgl vendor: ${data.webglVendor || note.unsupported}</div>
							<div>webgl renderer:</div>
							<div class="block-text">
								<div>${data.webglRenderer || note.unsupported}</div>
							</div>
						</div>
					</div>
				</div>
				`)
			}, false)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}