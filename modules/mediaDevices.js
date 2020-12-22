// media devices
export const getMediaDevices = imports => {

	const {
		require: {
			hashify,
			captureError,
			phantomDarkness,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const phantomNavigator = phantomDarkness ? phantomDarkness.navigator : navigator
			if (!('mediaDevices' in phantomNavigator)) {
				logTestResult({ test: 'media devices', passed: false })
				return resolve()
			}
			if (!phantomNavigator.mediaDevices || !phantomNavigator.mediaDevices.enumerateDevices) {
				logTestResult({ test: 'media devices', passed: false })
				return resolve()
			}
			const mediaDevicesEnumerated = await phantomNavigator.mediaDevices.enumerateDevices()
			const mediaDevices = (
				mediaDevicesEnumerated ? mediaDevicesEnumerated
					.map(({ kind }) => ({ kind })).sort((a, b) => (a.kind > b.kind) ? 1 : -1) :
				undefined
			)
			const $hash = await hashify(mediaDevices)
			logTestResult({ test: 'media devices', passed: true })
			return resolve({ mediaDevices, $hash })
		}
		catch (error) {
			logTestResult({ test: 'media devices', passed: false })
			captureError(error)
			return resolve()
		}
	})
}