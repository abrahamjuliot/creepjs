(function() {
async function getWorkerData() {
	function measureText(context, font) {
		context.font = `16px ${font}`;
		const {
			actualBoundingBoxAscent,
			actualBoundingBoxDescent,
			actualBoundingBoxLeft,
			actualBoundingBoxRight,
			fontBoundingBoxAscent,
			fontBoundingBoxDescent,
			width,
		} = context.measureText('mwmwmwmwlli');
		return [
			actualBoundingBoxAscent,
			actualBoundingBoxDescent,
			actualBoundingBoxLeft,
			actualBoundingBoxRight,
			fontBoundingBoxAscent,
			fontBoundingBoxDescent,
			width,
		];
	}

	function detectFonts(context) {
		const detected = [];
		const fallbackFont = measureText(context, 'monospace')
		;[`'Segoe UI', monospace`, `'Helvetica Neue', monospace`].forEach((fontFamily) => {
			const dimensions = measureText(context, fontFamily);
			const font = /'(.+)'/.exec(fontFamily)?.[1] || '';

			if (String(dimensions) !== String(fallbackFont)) detected.push(font);
		})
		return detected;
	}

	// Get Canvas
	async function getCanvas() {
		let canvasData
		let fonts
		try {
			const canvas = new OffscreenCanvas(500, 200)
			const context = canvas.getContext('2d')
			// @ts-expect-error if not supported
			context.font = '14px Arial'
			// @ts-expect-error if not supported
			context.fillText('😃', 0, 20)
			// @ts-expect-error if not supported
			context.fillStyle = 'rgba(0, 0, 0, 0)'
			// @ts-expect-error if not supported
			context.fillRect(0, 0, canvas.width, canvas.height)
			const getDataURI = async () => {
				// @ts-expect-error if not supported
				const blob = await canvas.convertToBlob()
				const reader = new FileReader()
				reader.readAsDataURL(blob)
				return new Promise((resolve) => {
					reader.onloadend = () => resolve(reader.result)
				})
			}
			canvasData = await getDataURI()
			fonts = detectFonts(context)
		} finally {
			return [canvasData, fonts]
		}
	}

	// get gpu
	function getGpu() {
		let gpu
		try {
			const context = new OffscreenCanvas(0, 0).getContext('webgl')
			// @ts-expect-error if not supported
			const rendererInfo = context.getExtension('WEBGL_debug_renderer_info')
			// @ts-expect-error if not supported
			gpu = context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)
		} finally {
			return gpu
		}
	}

	// get client code
	function getClientCode() {
		if (globalThis.document) return []
		const limit = 50
		const [p1, p2] = (1).constructor.toString().split((1).constructor.name)
		const isEngine = (fn) => {
			if (typeof fn !== 'function') return true
			return (''+fn === p1 + fn.name + p2 || ''+fn === p1 + (fn.name || '').replace('get ', '') + p2)
		}
		const isClient = (obj, key) => {
			if (/_$/.test(key)) return true
			const d = Object.getOwnPropertyDescriptor(obj, key)
			return !d || !isEngine(d.get || d.value)
		}
		let clientCode = Object.keys(self).slice(-limit).filter((x) => isClient(self, x))
		Object.getOwnPropertyNames(self).slice(-limit).forEach((x) => {
			if (!clientCode.includes(x) && isClient(self, x)) clientCode.push(x)
		})
		clientCode = [...clientCode, ...Object.getOwnPropertyNames(self.navigator)]
		const navProto = Object.getPrototypeOf(self.navigator)
		Object.getOwnPropertyNames(navProto).forEach((x) => {
			if (!clientCode.includes(x) && isClient(navProto, x)) clientCode.push(x)
		})
		return clientCode
	}

	// get storage
	async function getStorage() {
		if (!('storage' in navigator && 'estimate' in navigator.storage)) return null
		return navigator.storage.estimate().then(({ quota }) => quota)
	}

	// get ua data
	async function getUaData() {
		if (!('userAgentData' in navigator)) return null
		// @ts-expect-error if unsupported
		return navigator.userAgentData
			.getHighEntropyValues(['platform', 'platformVersion'])
			.then(({ platform, platformVersion}) => {
				if (platform === undefined && platformVersion === undefined) return null
				return String([platform, platformVersion])
			})
	}

	// notification bug
	async function getPermission() {
		if (!('permissions' in navigator && 'query' in navigator.permissions)) return null
		return navigator.permissions.query({ name: 'notifications' }).then((res) => {
			return String([res.state, self.Notification.permission])
		})
	}

	const [
		uaData,
		storage,
		[canvas, fonts],
		permission,
		gpu,
		clientCode,
	] = await Promise.all([
		getUaData(),
		getStorage(),
		getCanvas(),
		getPermission(),
		getGpu(),
		getClientCode(),
	]).catch(() => [])

	// eslint-disable-next-line new-cap
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	// @ts-expect-error undefined if not supported
	const { deviceMemory, hardwareConcurrency, language, languages, platform, userAgent } = navigator
	const data = {
		timezone,
		languages: String([language, ...languages]),
		hardware: String([deviceMemory || null, hardwareConcurrency || null]),
		userAgent,
		platform,
		uaData,
		canvas,
		fonts,
		gpu,
		storage,
		clientCode,
		permission,
	}
	return data
}

! async function() {
  // @ts-expect-error if not supported
  onconnect = async (message) => {
    const port = message.ports[0]
    port.postMessage(await getWorkerData())
  }
}()
})()
