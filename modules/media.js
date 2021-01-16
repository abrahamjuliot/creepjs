export const getMedia = imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			caniuse,
			logTestResult,
			getPromiseRaceFulfilled
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const start = performance.now()
			const phantomNavigator = phantomDarkness ? phantomDarkness.navigator : navigator
			if (!caniuse(() => phantomNavigator.mediaDevices.enumerateDevices)) {
				logTestResult({ test: 'media devices', passed: false })
				return resolve()
			}
			let mediaDevicesEnumerated
			mediaDevicesEnumerated = await getPromiseRaceFulfilled({
				promise: phantomNavigator.mediaDevices.enumerateDevices(),
				responseType: Array
			})
			if (!mediaDevicesEnumerated) {
				// try window.navigator
				mediaDevicesEnumerated = await getPromiseRaceFulfilled({
					promise: navigator.mediaDevices.enumerateDevices(),
					responseType: Array
				})
				if (!mediaDevicesEnumerated) {
					logTestResult({ test: 'media devices', passed: false })
					captureError(new Error('Promise failed'), `enumerateDevices blocked or failed to fulfill`)
					return resolve()
				}
			}
			const mediaDevices = (
				mediaDevicesEnumerated ? 
				mediaDevicesEnumerated
					.map(({ kind }) => ({ kind }))
					.sort((a, b) => (a.kind > b.kind) ? 1 : -1) :
				undefined
			)
			logTestResult({ start, test: 'media', passed: true })
			return resolve({ mediaDevices })
		}
		catch (error) {
			logTestResult({ test: 'media', passed: false })
			captureError(error)
			return resolve()
		}
	})
}