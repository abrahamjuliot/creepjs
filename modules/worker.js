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

	postMessage({
		['timezone offset']: timezoneOffset,
		hardwareConcurrency,
		language,
		platform,
		userAgent,
		canvas2d,
		['webgl renderer']: webglRenderer,
		['webgl vendor']: webglVendor
	})
	close()
}

export const getWorkerScope = imports => {
	
	const {
		require: {
			isFirefox,
			getOS,
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
				patch(el, html`
				<div>
					<strong>WorkerGlobalScope</strong>
					<div class="ellipsis">hash: ${$hash}</div>
					${
						Object.keys(data).map(key => {
							const value = data[key]
							return (
								key != 'canvas2d' && key != 'userAgent'? `<div class="ellipsis">${key}: ${value != undefined ? value : note.unsupported}</div>` : ''
							)
						}).join('')
					}
					<div class="ellipsis">canvas 2d: ${!!data.canvas2d.dataURI ? data.canvas2d.$hash : note.unsupported}</div>
				</div>
				`)
				return
			}, false)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}