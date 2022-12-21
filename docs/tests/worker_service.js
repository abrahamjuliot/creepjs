(function() {
async function getWorkerData() {
	const Platform = {
		WINDOWS: 'Windows',
		APPLE: 'Apple',
		OTHER: 'Other',
	}
	const FontMap = {
		'Segoe UI': Platform.WINDOWS,
		'Helvetica Neue': Platform.APPLE,
	}

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

	// get storage
	async function getStorage() {
		if (!('storage' in navigator && 'estimate' in navigator.storage)) return null
		return navigator.storage.estimate().then(({ quota }) => quota)
	}

	// get client code
	function getClientCode() {
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

	// get ua data
	async function getUaData() {
		if (!('userAgentData' in navigator)) return null
		// @ts-expect-error if unsupported
		return navigator.userAgentData.getHighEntropyValues([
			'brands',
			'mobile',
			'architecture',
			'bitness',
			'model',
			'platform',
			'platformVersion',
			'uaFullVersion',
			'wow64',
			'fullVersionList',
		])
	}

	function getNetworkInfo() {
		if (!('connection' in navigator)) return null
		// @ts-expect-error undefined if not supported
		const { effectiveType, rtt, type } = navigator.connection
		return [
			effectiveType,
			rtt === 0 ? 0 : rtt > 0 ? -1 : -2,
			type || 'null',
		]
	}

	function checkFonts(fonts) {
		const scope = self.document ? document : self
		if (!('fonts' in scope && 'check' in scope.fonts) || scope.fonts.check(`12px 'abc123'`)) return
		return fonts.filter((x) => scope.fonts.check(`12px '${x}'`))
	}

	async function loadFonts(fonts) {
		const list = []
		await Promise.all(
			fonts.map((x) => new FontFace(x, `local("${x}")`)
				.load()
				.then((x) => list.push(x.family))
				.catch(() => null),
			),
		)
		return list
	}

	function getMaxCallStackSize() {
		const fn = () => {
			try {
				return 1 + fn()
			} catch (err) {
				return 1
			}
		}
		;[...Array(10)].forEach(() => fn()) // stabilize
		return fn()
	}

	function getTimingResolution() {
		const maxRuns = 5000
		let valA = 1
		let valB = 1
		let res
		for (let i = 0; i < maxRuns; i++) {
			const a = performance.now()
			const b = performance.now()
			if (a < b) {
				res = b - a
				if (res > valA && res < valB) {
					valB = res
				} else if (res < valA) {
					valB = valA
					valA = res
				}
			}
		}
		return valA
	}

	async function getNotificationBug() {
		if (!navigator.userAgent.includes('Chrome')) return null
		if (!('permissions' in navigator && 'query' in navigator.permissions)) return null
		return navigator.permissions.query({ name: 'notifications' }).then((res) => {
			return String([res.state, self.Notification.permission])
		})
	}


	const [
		uaData,
		storage,
		[canvas, fontsText],
		gpu,
		clientCode,
		network,
		fontsCheck,
		fontsLoad,
		stackSize,
		timingResolution,
		bug,
	] = await Promise.all([
		getUaData(),
		getStorage(),
		getCanvas(),
		getGpu(),
		getClientCode(),
		getNetworkInfo(),
		checkFonts(['Segoe UI', 'Helvetica Neue']),
		loadFonts(['Segoe UI', 'Helvetica Neue']),
		getMaxCallStackSize(),
		getTimingResolution(),
		getNotificationBug(),
	]).catch(() => [])

	// eslint-disable-next-line new-cap
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	const {
		// @ts-expect-error undefined if not supported
		deviceMemory,
		hardwareConcurrency,
		language,
		languages,
		platform,
		userAgent,
		appVersion,
	} = navigator
	const data = {
		timezone,
		languages: [language, ...languages],
		hardware: [deviceMemory || 'null', hardwareConcurrency || 'null'],
		ua: [userAgent, appVersion],
		platform,
		uaData,
		clientCode,
		storage,
		canvas,
		fontsCheck: FontMap[fontsCheck] || (fontsCheck ? Platform.OTHER : undefined),
		fontsLoad: FontMap[fontsLoad] || (fontsLoad ? Platform.OTHER : undefined),
		fontsText: FontMap[fontsText] || (fontsText ? Platform.OTHER : undefined),
		gpu,
		network,
		windowScope: [
			'HTMLDocument' in self,
			'HTMLElement' in self,
			'Window' in self,
		].filter((x) => x),
		workerScope: [
			'WorkerGlobalScope' in self,
			'WorkerNavigator' in self,
			'WorkerLocation' in self,
		].filter((x) => x),
		stackSize,
		timingResolution,
		bug,
	}
	return data
}

! async function() {
  const broadcast = new BroadcastChannel('service')
		broadcast.onmessage = async (event) => {
			if (event.data && event.data.type == 'fingerprint') {
				broadcast.postMessage(await getWorkerData())
			}
		}
}()
})()
