// media devices
export const getMediaDevices = imports => {

	const {
		require: {
			isFirefox,
			hashMini,
			hashify,
			instanceId,
			patch,
			html,
			modal,
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
			const id = 'creep-media-devices'
			const el = document.getElementById(id)
			return patch(el, html`
			<div class="col-six">
				<strong>Media Devices</strong><span class="hash">${hashMini($hash)}</span>
				<div>devices (${count(mediaDevices)}):${mediaDevices && mediaDevices.length ? modal(id, mediaDevices.map(device => device.kind).join('<br>')) : note.blocked}</div>
			</div>
			`)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}