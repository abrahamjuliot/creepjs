import { captureError, attempt, caniuse } from './captureErrors.js'
const source = 'creepworker.js'

const getDedicatedWorker = phantomDarkness => {
	return new Promise(resolve => {
		try {
			if (phantomDarkness && !phantomDarkness.Worker) {
				return resolve()
			}
			else if (
				phantomDarkness && phantomDarkness.Worker.prototype.constructor.name != 'Worker'
			) {
				throw new Error('Worker tampered with by client')
			}
			const worker = (
				phantomDarkness ? phantomDarkness.Worker : Worker
			)
			const dedicatedWorker = new worker(source)
			dedicatedWorker.onmessage = message => {
				dedicatedWorker.terminate()
				return resolve(message.data)
			}
		}
		catch(error) {
			console.error(error)
			captureError(error)
			return resolve()
		}
	})
}

const getSharedWorker = phantomDarkness => {
	return new Promise(resolve => {
		try {
			if (phantomDarkness && !phantomDarkness.SharedWorker) {
				return resolve()
			}
			else if (
				phantomDarkness && phantomDarkness.SharedWorker.prototype.constructor.name != 'SharedWorker'
			) {
				throw new Error('SharedWorker tampered with by client')
			}

			const worker = (
				phantomDarkness ? phantomDarkness.SharedWorker : SharedWorker
			)
			const sharedWorker = new worker(source)
			sharedWorker.port.start()
			sharedWorker.port.addEventListener('message', message => {
				sharedWorker.port.close()
				return resolve(message.data)
			})
		}
		catch(error) {
			console.error(error)
			captureError(error)
			return resolve()
		}
	})
}

const getServiceWorker = () => {
	return new Promise(async resolve => {
		try {
			if (!('serviceWorker' in navigator)) {
				return resolve()
			}
			else if (navigator.serviceWorker.__proto__.constructor.name != 'ServiceWorkerContainer') {
				throw new Error('ServiceWorkerContainer tampered with by client')
			}

			await navigator.serviceWorker.register(source)
			.catch(error => {
				console.error(error)
				return resolve()
			})
			const registration = await navigator.serviceWorker.ready
			.catch(error => {
				console.error(error)
				return resolve()
			})

			if (!('BroadcastChannel' in window)) {
				return resolve() // no support in Safari and iOS
			}

			const broadcast = new BroadcastChannel('creep_service_primary')
			broadcast.onmessage = message => {
				registration.unregister()
				broadcast.close()
				return resolve(message.data)
			}
			broadcast.postMessage({ type: 'fingerprint'})
			return setTimeout(() => resolve(), 1000)
		}
		catch(error) {
			console.error(error)
			captureError(error)
			return resolve()
		}
	})
}

export const getBestWorkerScope = async imports => {	
	const {
		require: {
			getOS,
			captureError,
			caniuse,
			phantomDarkness,
			getUserAgentPlatform,
			documentLie,
			logTestResult
		}
	} = imports
	try {
		await new Promise(setTimeout).catch(e => {})
		const start = performance.now()
		let scope = 'ServiceWorkerGlobalScope'
		let type = 'service' // loads fast but is not available in frames
		let workerScope = await getServiceWorker()
			.catch(error => console.error(error.message))
		if (!caniuse(() => workerScope.userAgent)) {
			scope = 'SharedWorkerGlobalScope'
			type = 'shared' // no support in Safari, iOS, and Chrome Android
			workerScope = await getSharedWorker(phantomDarkness)
			.catch(error => console.error(error.message))
		}
		if (!caniuse(() => workerScope.userAgent)) {
			scope = 'WorkerGlobalScope'
			type = 'dedicated' // simulators & extensions can spoof userAgent
			workerScope = await getDedicatedWorker(phantomDarkness)
			.catch(error => console.error(error.message))
		}
		if (caniuse(() => workerScope.userAgent)) {
			const { canvas2d } = workerScope || {}
			workerScope.system = getOS(workerScope.userAgent)
			workerScope.device = getUserAgentPlatform({ userAgent: workerScope.userAgent })
			workerScope.canvas2d = { dataURI: canvas2d }
			workerScope.type = type
			workerScope.scope = scope

			// detect lies 
			
			const { fontSystemClass, system } = workerScope || {}
			const fontSystemLie = fontSystemClass && (
				/^((i(pad|phone|os))|mac)$/i.test(system) && fontSystemClass != 'Apple'  ? true :
					/^(windows)$/i.test(system) && fontSystemClass != 'Windows'  ? true :
						/^(linux|chrome os)$/i.test(system) && fontSystemClass != 'Linux'  ? true :
							/^(android)$/i.test(system) && fontSystemClass != 'Android'  ? true :
								false
			)
			if (fontSystemLie) {
				workerScope.lied = true
				workerScope.lies.system = `${fontSystemClass} fonts and ${system} user agent do not match`
				documentLie(workerScope.scope, workerScope.lies.system)
			}
			

			if (workerScope.lies.locale) {
				documentLie(workerScope.scope, workerScope.lies.locale)
			}

			logTestResult({ start, test: `${type} worker`, passed: true })
			return { ...workerScope }
		}
		return
	}
	catch (error) {
		logTestResult({ test: 'worker', passed: false })
		captureError(error, 'workers failed or blocked by client')
		return
	}
}

export const workerScopeHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
	if (!fp.workerScope) {
		return `
		<div class="col-six undefined">
			<strong>Worker</strong>
			<div>canvas 2d: ${note.blocked}</div>
			<div>fontFaceSet (0): ${note.blocked}</div>
			<div>timezone offset: ${note.blocked}</div>
			<div>location: ${note.blocked}</div>
			<div>language: ${note.blocked}</div>
			<div>deviceMemory: ${note.blocked}</div>
			<div>hardwareConcurrency: ${note.blocked}</div>
			<div>platform: ${note.blocked}</div>
			<div>system: ${note.blocked}</div>
			<div>webgl vendor: ${note.blocked}</div>
			<div>userAgentData:</div>
			<div class="block-text">${note.blocked}</div>
		</div>
		<div class="col-six undefined">
			<div>device:</div>
			<div class="block-text">${note.blocked}</div>
			<div>userAgent:</div>
			<div class="block-text">${note.blocked}</div>
			<div>webgl renderer:</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
	}
	const { workerScope: data } = fp

	const {
		lied,
		locale,
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
		fontSystemClass,
		fontListLen,
		userAgentData,
		type,
		system,
		device,
		$hash
	} = data || {}

	return `
	<div class="ellipsis"><span class="aside-note">${type || ''} worker</span></div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Worker</strong><span class="hash">${hashSlice($hash)}</span>
		<div>canvas 2d:${
			canvas2d && canvas2d.dataURI ?
			`<span class="sub-hash">${hashMini(canvas2d.dataURI)}</span>` :
			` ${note.unsupported}`
		}</div>
		<div class="help" title="FontFaceSet.check()">fontFaceSet (${fontFaceSetFonts ? count(fontFaceSetFonts) : '0'}/${''+fontListLen}): ${
			fontFaceSetFonts.length ? modal(
				'creep-worker-fonts-check', fontFaceSetFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
				hashMini(fontFaceSetFonts)
			) : note.unsupported
		}</div>
		<div>timezone offset: ${timezoneOffset != undefined ? ''+timezoneOffset : note.unsupported}</div>
		<div>location: ${timezoneLocation}</div>
		<div>language: ${language || note.unsupported}</div>
		<div>deviceMemory: ${deviceMemory || note.unsupported}</div>
		<div>hardwareConcurrency: ${hardwareConcurrency || note.unsupported}</div>
		<div>platform: ${platform || note.unsupported}</div>
		<div>system: ${system || note.unsupported}</div>
		<div>webgl vendor: ${webglVendor || note.unsupported}</div>
		<div>userAgentData:</div>
		<div class="block-text">
			<div>
			${((userAgentData) => {
				const {
					architecture,
					brandsVersion,
					uaFullVersion,
					mobile,
					model,
					platformVersion,
					platform
				} = userAgentData || {}
				return !userAgentData ? note.unsupported : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${platform} ${platformVersion} ${architecture}
					${model ? `<br>${model}` : ''}
					${mobile ? '<br>mobile' : ''}
				`
			})(userAgentData)}	
			</div>
		</div>
	</div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text">
			<div>${data.device || note.unsupported}</div>
		</div>
		<div>userAgent:</div>
		<div class="block-text">
			<div>${data.userAgent || note.unsupported}</div>
		</div>
		<div>unmasked renderer:</div>
		<div class="block-text">
			<div>${data.webglRenderer || note.unsupported}</div>
		</div>
	</div>
	`
}