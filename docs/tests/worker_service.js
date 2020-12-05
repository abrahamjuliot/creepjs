const getWorkerData =  async () => {
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
	const { hardwareConcurrency, language, platform, userAgent } = navigator
	const data = {
		hardwareConcurrency,
		userAgent,
		canvas2d,
		webglRenderer,
		webglVendor
	}
	return data
}

// ServiceWorkerGlobalScope
const broadcast = new BroadcastChannel('creep_service')
broadcast.onmessage = async event => {
	if (event.data && event.data.type == 'fingerprint') {
		const data = await getWorkerData()
		broadcast.postMessage(data)
	}
}