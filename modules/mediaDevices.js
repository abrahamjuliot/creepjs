// media devices
export const getMediaDevices = imports => {

	const {
		require: {
			hashify,
			captureError,
			contentWindow,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const contentWindowNavigator = contentWindow ? contentWindow.navigator : navigator
			if (!('mediaDevices' in contentWindowNavigator)) {
				logTestResult({ test: 'media devices', passed: false })
				return resolve()
			}
			if (!contentWindowNavigator.mediaDevices || !contentWindowNavigator.mediaDevices.enumerateDevices) {
				logTestResult({ test: 'media devices', passed: false })
				return resolve()
			}
			const mediaDevicesEnumerated = await contentWindowNavigator.mediaDevices.enumerateDevices()
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