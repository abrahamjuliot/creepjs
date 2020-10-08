// media devices
export const getMediaDevices = imports => {

	const {
		require: {
			isFirefox,
			hashify,
			patch,
			html,
			note,
			count,
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
			resolve({ mediaDevices, $hash })
			const el = document.getElementById('creep-media-devices')
			return patch(el, html`
			<div>
				<strong>MediaDevicesInfo</strong>
				<div class="ellipsis">hash: ${$hash}</div>
				<div>devices (${count(mediaDevices)}): ${mediaDevices ? mediaDevices.map(device => device.kind).join(', ') : note.blocked}</div>
			</div>
			`)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}