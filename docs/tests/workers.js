(async () => {
// https://stackoverflow.com/a/22429679
const hashMini = (x) => {
	if (!x) return x
	const json = `${JSON.stringify(x)}`
	const hash = json.split('').reduce((hash, char, i) => {
		return Math.imul(31, hash) + json.charCodeAt(i) | 0
	}, 0x811c9dc5)
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

// template views
const patch = (oldEl, newEl) => oldEl.parentNode.replaceChild(newEl, oldEl)
const html = (str, ...expressionSet) => {
	const template = document.createElement('template')
	template.innerHTML = str.map((s, i) => `${s}${expressionSet[i] || ''}`).join('')
	return document.importNode(template.content, true)
}

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

function getDedicatedWorker(frame, src, fn = getWorkerData) {
	return new Promise((resolve) => {
		const Wkr = frame ? frame.Worker : Worker
		if (!Wkr || Wkr.prototype.constructor.name !== 'Worker') resolve({})

		try {
			let worker
			if (src === 'blob') {
				worker = new Wkr(
					URL.createObjectURL(
						new Blob(
							[`! async function() { postMessage(await ${fn.toString()}()); close() }()`],
							{ type: 'application/javascript' },
						),
					),
				)
			} else if (src === 'nested-blob') {
				worker = new Wkr(
					URL.createObjectURL(
						new Blob(
							[
								`
								! async function() {
									const worker = new Worker(
										URL.createObjectURL(
											new Blob(
												[${`(async function() { postMessage(await ${fn.toString()}()); close() })()`}],
												{ type: 'application/javascript' },
											),
										),
									)
									worker.onmessage = (message) => {
										worker.terminate()
										postMessage(message.data)
										close()
									}

								}()
								`,
							],
							{ type: 'application/javascript' },
						),
					),
				)
			} else {
				worker = new Wkr(src)
			}
			worker.onmessage = (message) => {
				worker.terminate()
				resolve(message.data)
			}
		} catch (error) {
			console.error(error)
			resolve({})
		}
	})
}

function getSharedWorker(frame, src, fn = getWorkerData) {
	return new Promise((resolve) => {
		const Wkr = frame ? frame.SharedWorker : SharedWorker
		if (!Wkr || Wkr.prototype.constructor.name !== 'SharedWorker') resolve({})

		try {
			let worker
			if (src === 'blob') {
				worker = new Wkr(
					URL.createObjectURL(
						new Blob(
							[`! function() { onconnect = async (message) => { const port = message.ports[0]; port.postMessage(await ${fn.toString()}()) } }()`],
							{ type: 'application/javascript' },
						),
					),
				)
			} else {
				worker = new Wkr(src)
			}
			worker.port.start()
			worker.port.onmessage = (message) => {
				worker.port.close()
				resolve(message.data)
			}
		} catch (error) {
			console.error(error)
			return resolve({})
		}
	})
}

async function getServiceWorker(channelName, src) {
	return new Promise(async (resolve) => {
		const worker = navigator.serviceWorker
		// @ts-expect-error if unsupported
		if (!worker || worker.__proto__.constructor.name !== 'ServiceWorkerContainer') resolve({})
		await worker.register(src, { scope: '../tests/' }).catch((error) => {
			console.error(error)
			return resolve({})
		})
		const broadcast = new BroadcastChannel(channelName)
		broadcast.onmessage = (message) => {
			worker.getRegistration(src).then((x) => x && x.unregister())
			broadcast.close()
			resolve(message.data)
		}
		broadcast.postMessage({ type: 'fingerprint' })
	}).catch((err) => {
		console.error(err)
		return {}
	})
}

// Continue in window scope

// gpu brand
function getGpuBrand(gpu) {
	if (!gpu) return
	const gpuBrandMatcher = /(adreno|amd|apple|intel|llvm|mali|microsoft|nvidia|parallels|powervr|samsung|swiftshader|virtualbox|vmware)/i

	const brand = (
		/radeon/i.test(gpu) ? 'AMD' :
			/geforce/i.test(gpu) ? 'NVIDIA' :
					(gpuBrandMatcher.exec(gpu)?.[0] || 'Other')
	)

	return brand
}

// operating system
const getOS = (userAgent) => {
	const os = (
		// order is important
		/windows phone/ig.test(userAgent) ? 'Windows Phone' :
			/win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
				/android/ig.test(userAgent) ? 'Android' :
					/cros/ig.test(userAgent) ? 'Chrome OS' :
						/linux/ig.test(userAgent) ? 'Linux' :
							/ipad/ig.test(userAgent) ? 'iPad' :
								/iphone/ig.test(userAgent) ? 'iPhone' :
									/ipod/ig.test(userAgent) ? 'iPod' :
										/ios/ig.test(userAgent) ? 'iOS' :
											/mac/ig.test(userAgent) ? 'Mac' :
												'Other'
	)
	return os
}

const start = performance.now()

// Create inline workers
const scriptEl = document.createElement('script')
scriptEl.textContent = `! async function() {
	window.inlineWorkers = await Promise.all([
		${getDedicatedWorker.toString()}(window, 'nested-blob', ${getWorkerData.toString()}),
		${getSharedWorker.toString()}(window, 'blob', ${getWorkerData.toString()}),
		${getServiceWorker.toString()}('service', 'worker_service.js'),
	])
}()`
document.body.appendChild(scriptEl)

const getWorkers = () => new Promise((resolve) => {
	const wait = setTimeout(() => {
		clearInterval(check)
		document.body.removeChild(scriptEl)
		resolve([undefined, undefined, undefined])
	}, 6000)

	const check = setInterval(() => {
		if ('inlineWorkers' in window) {
			clearTimeout(wait)
			clearInterval(check)
			document.body.removeChild(scriptEl) // cleanup
			resolve(window.inlineWorkers)
		}
	}, 10)
}).finally(() => {
	if ('inlineWorkers' in window) {
		// @ts-expect-error undefined if not available
		delete inlineWorkers // cleanup
	}
})

const [
	windowScope,
	[dedicatedWorkerInline, sharedWorkerInline, serviceWorker],
] = await Promise.all([
	getWorkerData(),
	getWorkers(),
]).catch((error) => {
	console.error(error.message)
	return []
})

const perf = performance.now() - start

console.groupCollapsed(`Window:`)
	console.log(windowScope)
console.groupEnd()

console.groupCollapsed(`Dedicated:`)
	console.log(dedicatedWorkerInline)
console.groupEnd()

console.groupCollapsed(`Shared:`)
	console.log(sharedWorkerInline)
console.groupEnd()

console.groupCollapsed(`Service:`)
	console.log(serviceWorker)
console.groupEnd()

// Remove unstable keys for hash comparison
function generateStableData(data) {
	if (!data) return data;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { bug, stackSize, windowScope, workerScope, ...stabilizedData } = data
	return stabilizedData
}

// same file
const windowHash = hashMini(generateStableData(windowScope))

// Get hashes
const dedicatedInlineHash = hashMini(generateStableData(dedicatedWorkerInline))
const sharedInlineHash = hashMini(generateStableData(sharedWorkerInline))
const serviceHash = hashMini(generateStableData(serviceWorker))

// template helpers
const red = '#ca656e2b'
const voidHash = 'ac6c4fe7'
const emptyHash = 'ac6c4be7' // array
const styleHash = (controlHash, hash) => {
	return `
	style="
		background: ${hash === undefined || hash === voidHash ? '#bbbbbb1f' : hash !== controlHash ? red : 'none'}
	"
`
}

const HTMLNote = {
	UNKNOWN: '<span class="blocked">unknown</span>',
	UNSUPPORTED: '<span class="blocked">unsupported</span>',
	BLOCKED: '<span class="blocked">blocked</span>',
	LIED: '<span class="lies">lied</span>',
	SECRET: '<span class="blocked">secret</span>',
}

// Generate template
const el = document.getElementById('fingerprint-data')
const workerHash = {}
function computeTemplate(worker, name) {
	const RawValueMap = {
		bug: true,
		hardware: true,
		fontsCheck: true,
		fontsLoad: true,
		fontsText: true,
		memory: true,
		network: true,
		platform: true,
		stackSize: true,
		timezone: true,
		timingResolution: true,
	}
	Object.keys(worker || {}).forEach((key) => {
		return (
			workerHash[name] = {
				...workerHash[name],
				[key]: (
					RawValueMap[key] && worker[key] ? (String(worker[key]) || HTMLNote.UNSUPPORTED) :
						key === 'gpu' && worker[key] ? `${hashMini(worker[key])} (${getGpuBrand(worker[key])})` :
						key === 'languages' && worker[key] ? `${hashMini(worker[key])} (${worker[key][0]})` :
						key === 'storage' && worker[key] ? `${hashMini(worker[key])} (${+(worker[key] / (1024 ** 3)).toFixed(1)})` :
						key === 'ua' && worker[key] ? `${hashMini(worker[key])} (${getOS(worker[key][0])})` :
						key === 'uaData' && worker[key] ? `${hashMini(worker[key])}${worker[key].platform ? ` (${worker[key].platform})`: ''}` :
						worker[key] ? hashMini(worker[key]) : HTMLNote.UNSUPPORTED
				),
			}
		)
	})
	const hash = workerHash[name]
	const failStyle = `
		style="
			color: #fff;
			background: #ca656eb8;
		"
	`
	// use for custom tests
	const CustomMap = {
		clientCode: true,
		windowScope: true,
		workerScope: true,
		stackSize: true,
		bug: true,
	}

	// translate hashes to HTML
	const HashValueMap = {
		[voidHash]: HTMLNote.UNKNOWN,
	}

	Object.keys(hash || {}).forEach((key) => {
		const failsWindow = (String(hash[key]) !== String(workerHash.window[key]))
		const failsDedicatedWorker = workerHash.dedicated && (String(hash[key]) !== String(workerHash.dedicated[key]))
		const failsScope = !CustomMap[key] && (failsWindow || failsDedicatedWorker)

		const failsCode = key === 'clientCode' && hash[key] !== emptyHash
		const failsFeatures = (
			(name === 'window' && key === 'workerScope' && hash[key] !== emptyHash) ||
			(name !== 'window' && key === 'windowScope' && hash[key] !== emptyHash)
		)

		if (failsScope || failsCode || failsFeatures) {
			hash[key] = `<span ${failStyle}>${hash[key]}</span>`
			return
		}

		if (hash[key] === emptyHash) {
			hash[key] = HTMLNote.UNKNOWN
			return
		}

		const html = HashValueMap[hash[key]]
		if (html) {
			hash[key] = html
		}
	})

	return `
		<div>ua: ${(hash || {}).ua || HTMLNote.UNSUPPORTED}</div>
		<div>data: ${(hash || {}).uaData || HTMLNote.UNSUPPORTED}</div>
		<div>platform: ${(hash || {}).platform || HTMLNote.UNSUPPORTED}</div>
		<div>font A: ${(hash || {}).fontsText || HTMLNote.UNSUPPORTED}</div>
		<div>font B: ${(hash || {}).fontsCheck || HTMLNote.UNSUPPORTED}</div>
		<div>font C: ${(hash || {}).fontsLoad || HTMLNote.UNSUPPORTED}</div>
		<div>canvas: ${(hash || {}).canvas || HTMLNote.UNSUPPORTED}</div>
		<div>gpu: ${(hash || {}).gpu || HTMLNote.UNSUPPORTED}</div>
		<div>hardware: ${(hash || {}).hardware || HTMLNote.UNSUPPORTED}</div>
		<div>gb: ${(hash || {}).storage || HTMLNote.UNSUPPORTED}</div>
		<div>network: ${(hash || {}).network || HTMLNote.UNSUPPORTED}</div>
		<div>tz: ${(hash || {}).timezone || HTMLNote.UNSUPPORTED}</div>
		<div>langs: ${(hash || {}).languages || HTMLNote.UNSUPPORTED}</div>
		<div>window: ${(hash || {}).windowScope || HTMLNote.UNSUPPORTED}</div>
		<div>worker: ${(hash || {}).workerScope || HTMLNote.UNSUPPORTED}</div>
		<div>code: ${(hash || {}).clientCode || HTMLNote.UNSUPPORTED}</div>
		<div>stack: ${(hash || {}).stackSize || HTMLNote.UNSUPPORTED}</div>
		<div>timing: ${(hash || {}).timingResolution || HTMLNote.UNSUPPORTED}</div>
		<div>bug: ${(hash || {}).bug || HTMLNote.UNSUPPORTED}</div>
	`
}

patch(el, html`
<div id="fingerprint-data">
	<style>.worker { font-size: 13px !important; } .aside-note { top: -4px; } }</style>
	<div class="flex-grid visitor-info">
		<span class="aside-note">${perf.toFixed(2)} ms</span>
		<strong>Window compared to WorkerGlobalScope</strong>
	</div>
	<div class="flex-grid relative">
		<div ${styleHash(windowHash, windowHash)}>
			<strong>Window</strong>
			<span class="hash">${windowHash}</span>
			${computeTemplate(windowScope, 'window')}
		</div>
	</div>

	<div class="flex-grid relative">
		<div class="col-four" ${styleHash(windowHash, dedicatedInlineHash)}>
			<strong>Dedicated</strong>
			<span class="hash">${dedicatedInlineHash}</span>
			<div class="worker">${computeTemplate(dedicatedWorkerInline, 'dedicated')}</div>
		</div>
		<div class="col-four" ${styleHash(windowHash, sharedInlineHash)}>
			<strong>Shared</strong>
			<span class="hash">${sharedInlineHash}</span>
			<div class="worker">${computeTemplate(sharedWorkerInline, 'shared')}</div>
		</div>
		<div class="col-four" ${styleHash(windowHash, serviceHash)}>
			<strong>Service</strong>
			<span class="hash">${serviceHash}</span>
			<div class="worker">${computeTemplate(serviceWorker, 'service')}</div>
		</div>
	</div>
</div>
`)
})()
