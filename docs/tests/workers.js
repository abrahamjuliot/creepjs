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

// Tests
const isWorker = !globalThis.document && !!globalThis.WorkerGlobalScope
const isSharedWorker = !!globalThis.SharedWorkerGlobalScope
const isServiceWorker = !!globalThis.ServiceWorkerGlobalScope

// WorkerGlobalScope
async function getWorkerGlobalScope() {
	postMessage(await getWorkerData())
	close()
}

function getDedicatedWorker(phantomDarkness, src, fn = getWorkerData) {
	return new Promise((resolve) => {
		const Wkr = phantomDarkness ? phantomDarkness.Worker : Worker
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

// SharedWorkerGlobalScope
function getSharedWorkerGlobalScope() {
	// @ts-expect-error if not supported
	onconnect = async (message) => {
		const port = message.ports[0]
		port.postMessage(await getWorkerData())
	}
}

function getSharedWorker(phantomDarkness, src, fn = getWorkerData) {
	return new Promise((resolve) => {
		const Wkr = phantomDarkness ? phantomDarkness.SharedWorker : SharedWorker
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

// ServiceWorkerGlobalScope
function getServiceWorkerGlobalScope() {
	const broadcast = new BroadcastChannel('same-file')
	broadcast.onmessage = async (event) => {
		if (event.data && event.data.type == 'fingerprint') {
			const data = await getWorkerData()
			broadcast.postMessage(data)
		}
	}
}

async function getServiceWorker(channelName, src) {
	return new Promise(async (resolve) => {
		const worker = navigator.serviceWorker
		// @ts-expect-error if __proto__ is not supported
		if (!worker || worker.__proto__.constructor.name !== 'ServiceWorkerContainer') resolve({})
		try {
			await worker.register(src, { scope: '../tests/' }).catch((error) => {
				console.error(error)
				return resolve({})
			})
			worker.ready.then((registration) => {
				const broadcast = new BroadcastChannel(channelName)
				broadcast.onmessage = (message) => {
					registration.unregister()
					broadcast.close()
					return resolve(message.data)
				}
				return broadcast.postMessage({ type: 'fingerprint' })
			}).catch((error) => {
				console.error(error)
				return resolve({})
			})
		} catch (error) {
			console.error(error)
			return resolve({})
		}
	})
}

// WorkerGlobalScope
if (isWorker) {
	return (
		isServiceWorker ? getServiceWorkerGlobalScope() :
			isSharedWorker ? getSharedWorkerGlobalScope() :
				getWorkerGlobalScope()
	)
}

// Window
// frame
const ghost = () => `
	height: 100vh;
	width: 100vw;
	position: absolute;
	left:-10000px;
	visibility: hidden;
`
const getRandomValues = () => {
	const id = [...crypto.getRandomValues(new Uint32Array(10))]
		.map((n) => n.toString(36)).join('')
	return id
}

const getPhantomIframe = () => {
	try {
		const numberOfIframes = window.length
		const frag = new DocumentFragment()
		const div = document.createElement('div')
		const id = getRandomValues()
		div.setAttribute('id', id)
		frag.appendChild(div)
		div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
		document.body.appendChild(frag)
		const iframeWindow = window[numberOfIframes]
		return { iframeWindow, div }
	} catch (error) {
		console.error(error)
		return { iframeWindow: window, div: undefined }
	}
}
const { iframeWindow: phantomDarkness, div: parentPhantom } = getPhantomIframe()

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

// system
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
		${getServiceWorker.toString()}('inline', 'w_service_inline.js'),
	])
}()`
document.body.appendChild(scriptEl)

const getInlineWorkers = () => new Promise((resolve) => {
	const wait = setTimeout(() => {
		clearInterval(check)
		resolve([undefined, undefined, undefined])
	}, 6000)

	const check = setInterval(() => {
		if ('inlineWorkers' in window) {
			clearTimeout(wait)
			clearInterval(check)
			resolve(window.inlineWorkers)
		}
	}, 10)
})

// @ts-expect-error if unsupported
const currentScriptSrc = document.currentScript.src
const [
	windowScope,
	dedicatedWorker,
	sharedWorker,
	serviceWorker,
	[dedicatedWorkerInline, sharedWorkerInline, serviceWorkerInline],
	dedicatedWorkerFile,
	sharedWorkerFile,
	serviceWorkerFile,
	dedicatedWorkerBlob,
	sharedWorkerBlob,
	dedicatedWorkerNestedBlob,
] = await Promise.all([
	getWorkerData(),
	getDedicatedWorker(phantomDarkness, currentScriptSrc),
	getSharedWorker(phantomDarkness, currentScriptSrc),
	getServiceWorker('same-file', currentScriptSrc),
	getInlineWorkers(),
	getDedicatedWorker(phantomDarkness, 'w_dedicated.js'),
	getSharedWorker(phantomDarkness, 'w_shared.js'),
	getServiceWorker('separate-file', 'w_service.js'),
	getDedicatedWorker(phantomDarkness, 'blob'),
	getSharedWorker(phantomDarkness, 'blob'),
	getDedicatedWorker(phantomDarkness, 'nested-blob'),
]).catch((error) => {
	console.error(error.message)
	return []
})

const perf = performance.now() - start

if (parentPhantom) {
	// @ts-expect-error if null
	parentPhantom.parentNode.removeChild(parentPhantom)
}

const red = '#ca656e2b'

// same file
const windowHash = hashMini(windowScope)
const dedicatedHash = hashMini(dedicatedWorker)
const sharedHash = hashMini(sharedWorker)
const serviceHash = hashMini(serviceWorker)

// inline
const dedicatedInlineHash = hashMini(dedicatedWorkerInline)
const sharedInlineHash = hashMini(sharedWorkerInline)
const serviceInlineHash = hashMini(serviceWorkerInline)

// separate file
const dedicatedFileHash = hashMini(dedicatedWorkerFile)
const sharedFileHash = hashMini(sharedWorkerFile)
const serviceFileHash = hashMini(serviceWorkerFile)

// blob
const dedicatedBlobHash = hashMini(dedicatedWorkerBlob)
const sharedBlobHash = hashMini(sharedWorkerBlob)

// nested-blob
const dedicatedNestedBlobHash = hashMini(dedicatedWorkerNestedBlob)

const style = (controlHash, hash) => {
	return `
	style="
		background: ${hash == 'undefined' ? '#bbbbbb1f' : hash != controlHash ? red : 'none'}
	"
`
}

// template helpers
const HTMLNote = {
	UNKNOWN: '<span class="blocked">unknown</span>',
	UNSUPPORTED: '<span class="blocked">unsupported</span>',
	BLOCKED: '<span class="blocked">blocked</span>',
	LIED: '<span class="lies">lied</span>',
	SECRET: '<span class="blocked">secret</span>',
}

const el = document.getElementById('fingerprint-data')
const workerHash = {}
function computeTemplate(worker, name) {
	const RawValueMap = {
		hardware: true,
		fonts: true,
		memory: true,
		permission: true,
		platform: true,
		timezone: true,
		uaData: true,
	}
	Object.keys(worker || []).forEach((key) => {
		return (
			workerHash[name] = {
				...workerHash[name],
				[key]: (
					RawValueMap[key] ? worker[key] :
						key === 'gpu' && worker[key] ? `${hashMini(worker[key])} (${getGpuBrand(worker[key])})` :
							key === 'userAgent' && worker[key] ? `${hashMini(worker[key])} (${getOS(worker[key])})` :
								key === 'languages' && worker[key] ? `${hashMini(worker[key])} (${worker[key].split(',')[0]})` :
									key === 'storage' && worker[key] ? `${hashMini(worker[key])} (${+(worker[key] / (1024 ** 3)).toFixed(1)} GB)` :
										key === 'code' && worker[key] ? `${hashMini(worker[key])} (${worker[key].length})` :
											worker[key] ? hashMini(worker[key]) : HTMLNote.UNSUPPORTED
				),
			}
		)
	})
	const hash = workerHash[name]
	const style = `
		style="
			color: #fff;
			background: #ca656eb8;
			padding: 0 2px;
		"
	`
	if (workerHash.dedicated && hash) {
		Object.keys(hash).forEach((key) => {
			if (String(hash[key]) !== String(workerHash.window[key])) {
				hash[key] = `<span ${style}>${hash[key]}</span>`
			}
		})
	}
	return `
		<div>ua: ${(hash || {}).userAgent || HTMLNote.BLOCKED}</div>
		<div>platform: ${(hash || {}).platform || HTMLNote.BLOCKED}</div>
		<div>data: ${(hash || {}).uaData || HTMLNote.UNSUPPORTED}</div>
		<div>hardware: ${(hash || {}).hardware || HTMLNote.UNSUPPORTED}</div>
		<div>canvas: ${(hash || {}).canvas || HTMLNote.UNSUPPORTED}</div>
		<div>fonts: ${(hash || {}).fonts || HTMLNote.UNSUPPORTED}</div>
		<div>gpu: ${(hash || {}).gpu || HTMLNote.UNSUPPORTED}</div>
		<div>tz: ${(hash || {}).timezone || HTMLNote.BLOCKED}</div>
		<div>langs: ${(hash || {}).languages || HTMLNote.BLOCKED}</div>
		<div>code: ${(hash || {}).clientCode || HTMLNote.BLOCKED}</div>
		<div>bytes: ${(hash || {}).storage || HTMLNote.UNSUPPORTED}</div>
		<div>perm: ${(hash || {}).permission || HTMLNote.UNSUPPORTED}</div>
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
		<span class="aside-note">worker.js</span>
		<div ${style(windowHash, windowHash)}>
			<strong>Window</strong>
			<span class="hash">${windowHash}</span>
			${computeTemplate(windowScope, 'window')}
		</div>
	</div>
	<div class="flex-grid relative">
		<span class="aside-note">same file</span>
		<div class="col-four" ${style(windowHash, dedicatedHash)}>
			<strong>Dedicated</strong>
			<span class="hash">${dedicatedHash}</span>
			<div class="worker">${computeTemplate(dedicatedWorker, 'dedicated')}</div>
		</div>
		<div class="col-four" ${style(windowHash, sharedHash)}>
			<strong>Shared</strong>
			<span class="hash">${sharedHash}</span>
			<div class="worker">${computeTemplate(sharedWorker, 'shared')}</div>
		</div>
		<div class="col-four" ${style(windowHash, serviceHash)}>
			<strong>Service</strong>
			<span class="hash">${serviceHash}</span>
			<div class="worker">${computeTemplate(serviceWorker, 'service')}</div>
		</div>
	</div>

	<div class="flex-grid relative">
		<span class="aside-note">inline script tag</span>
		<div class="col-four" ${style(windowHash, dedicatedInlineHash)}>
			<strong>Dedicated</strong>
			<span class="hash">${dedicatedInlineHash}</span>
			<div class="worker">${computeTemplate(dedicatedWorkerInline, 'dedicated-inline')}</div>
		</div>
		<div class="col-four" ${style(windowHash, sharedInlineHash)}>
			<strong>Shared</strong>
			<span class="hash">${sharedInlineHash}</span>
			<div class="worker">${computeTemplate(sharedWorkerInline, 'shared-inline')}</div>
		</div>
		<div class="col-four" ${style(windowHash, serviceInlineHash)}>
			<strong>Service</strong>
			<span class="hash">${serviceInlineHash}</span>
			<div class="worker">${computeTemplate(serviceWorkerInline, 'service-inline')}</div>
		</div>
	</div>

	<div class="flex-grid relative">
		<span class="aside-note">separate files</span>
		<div class="col-four" ${style(windowHash, dedicatedFileHash)}>
			<strong>Dedicated</strong>
			<span class="hash">${dedicatedFileHash}</span>
			<div class="worker">${computeTemplate(dedicatedWorkerFile, 'dedicated-file')}</div>
		</div>
		<div class="col-four" ${style(windowHash, sharedFileHash)}>
			<strong>Shared</strong>
			<span class="hash">${sharedFileHash}</span>
			<div class="worker">${computeTemplate(sharedWorkerFile, 'shared-file')}</div>
		</div>
		<div class="col-four" ${style(windowHash, serviceFileHash)}>
			<strong>Service</strong>
			<span class="hash">${serviceFileHash}</span>
			<div class="worker">${computeTemplate(serviceWorkerFile, 'service-file')}</div>
		</div>
	</div>
	<div class="flex-grid relative">
		<span class="aside-note">inline blob</span>
		<div class="col-six" ${style(windowHash, dedicatedBlobHash)}>
			<strong>Dedicated</strong>
			<span class="hash">${dedicatedBlobHash}</span>
			<div class="worker">${computeTemplate(dedicatedWorkerBlob, 'dedicated-blob')}</div>
		</div>
		<div class="col-six" ${style(windowHash, sharedBlobHash)}>
			<strong>Shared</strong>
			<span class="hash">${sharedBlobHash}</span>
			<div class="worker">${computeTemplate(sharedWorkerBlob, 'shared-blob')}</div>
		</div>
	</div>
	<div class="flex-grid relative">
		<span class="aside-note">nested inline blob</span>
		<div class="col-six" ${style(windowHash, dedicatedNestedBlobHash)}>
			<strong>Dedicated</strong>
			<span class="hash">${dedicatedNestedBlobHash}</span>
			<div class="worker">${computeTemplate(dedicatedWorkerNestedBlob, 'dedicated-nest-blob')}</div>
		</div>
	</div>
</div>
`)
})()
