const source = 'creepworker.js'

const getDedicatedWorker = contentWindow => {
	return new Promise(resolve => {
		try {
			const worker = (
				contentWindow ? contentWindow.Worker : Worker
			)
			const dedicatedWorker = new worker(source)
			dedicatedWorker.onmessage = message => {
				dedicatedWorker.terminate()
				return resolve(message.data)
			}
		}
		catch(error) {
			return resolve()
		}
	})
}

const getSharedWorker = contentWindow => {
	return new Promise(resolve => {
		try {
			const worker = (
				contentWindow ? contentWindow.SharedWorker : SharedWorker
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
			return resolve()
		}
	})
}

const getServiceWorker = () => {
	return new Promise(async resolve => {
		try {
			navigator.serviceWorker.register(source).catch(error => {
				console.error(error)
				return resolve()
			})
			navigator.serviceWorker.ready.then(registration => {
				const broadcast = new BroadcastChannel('creep_service_primary')
				broadcast.onmessage = message => {
					registration.unregister()
					broadcast.close()
					return resolve(message.data)
				}
				return broadcast.postMessage({ type: 'fingerprint'})
			}).catch(error => {
				console.error(error)
				return resolve()
			})
		}
		catch(error) {
			console.error(error)
			return resolve()
		}
	})
}

export const getBestWorkerScope = imports => {	
	const {
		require: {
			getOS,
			hashify,
			captureError,
			caniuse,
			contentWindow,
			getUserAgentPlatform,
			logTestResult
		}
	} = imports
	return new Promise(async resolve => {
		try {
			let type = 'service' // loads fast but is not available in frames
			let workerScope = await getServiceWorker()
				.catch(error => console.error(error.message))
			if (!caniuse(() => workerScope.userAgent)) {
				type = 'shared' // no support in Safari, iOS, and Chrome Android
				workerScope = await getSharedWorker(contentWindow)
				.catch(error => console.error(error.message))
			}
			if (!caniuse(() => workerScope.userAgent))) {
				type = 'dedicated' // simulators & extensions can spoof userAgent
				workerScope = await getDedicatedWorker(contentWindow)
				.catch(error => console.error(error.message))
			}
			if (caniuse(() => workerScope.userAgent))) {
				const { canvas2d, timezoneHistoryLocation } = workerScope || {}
				workerScope.system = getOS(workerScope.userAgent)
				workerScope.device = getUserAgentPlatform({ userAgent: workerScope.userAgent })
				workerScope.canvas2d = { dataURI: canvas2d, $hash: await hashify(canvas2d) }
				workerScope.timezoneHistoryLocation = await hashify(timezoneHistoryLocation)
				workerScope.type = type
				const $hash = await hashify(workerScope)
				logTestResult({ test: `${type} worker`, passed: true })
				return resolve({ ...workerScope, $hash })
			}
			return resolve()
		}
		catch (error) {
			logTestResult({ test: 'worker', passed: false })
			captureError(error, 'workers failed or blocked by client')
			return resolve()
		}
	})
}