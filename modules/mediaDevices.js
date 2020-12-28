// media devices
export const getMediaDevices = imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const start = performance.now()
			const phantomNavigator = phantomDarkness ? phantomDarkness.navigator : navigator
			if (!phantomNavigator.mediaDevices ||
				!phantomNavigator.mediaDevices.enumerateDevices) {
				return resolve()
			}
			const mediaDevicesEnumerated = await phantomNavigator.mediaDevices.enumerateDevices()
			.catch(error => {
				logTestResult({ test: 'media devices', passed: false })
				captureError(error)
				return resolve()
			})
			const mediaDevices = (
				mediaDevicesEnumerated ? 
				mediaDevicesEnumerated
					.map(({ kind }) => ({ kind }))
					.sort((a, b) => (a.kind > b.kind) ? 1 : -1) :
				undefined
			)
			logTestResult({ start, test: 'media devices', passed: true })
			return resolve({ mediaDevices })
		}
		catch (error) {
			logTestResult({ test: 'media devices', passed: false })
			captureError(error)
			return resolve()
		}
	})
}