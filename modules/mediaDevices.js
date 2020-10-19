// media devices
export const getMediaDevices = imports => {

	const {
		require: {
			isFirefox,
			hashify,
			captureError,
			contentWindow
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const contentWindowNavigator = contentWindow && !isFirefox ? contentWindow.navigator : navigator
			if (!('mediaDevices' in contentWindowNavigator)) {
				return resolve(undefined)
			}
			if (!contentWindowNavigator.mediaDevices || !contentWindowNavigator.mediaDevices.enumerateDevices) {
				return resolve(undefined)
			}
			const mediaDevicesEnumerated = await contentWindowNavigator.mediaDevices.enumerateDevices()
			const mediaDevices = (
				mediaDevicesEnumerated ? mediaDevicesEnumerated
					.map(({ kind }) => ({ kind })).sort((a, b) => (a.kind > b.kind) ? 1 : -1) :
				undefined
			)
			const $hash = await hashify(mediaDevices)
			return resolve({ mediaDevices, $hash })
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}