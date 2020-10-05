export const getIframeContentWindowVersion = imports => {

	const {
		require: {
			hashify,
			patch,
			html,
			note,
			count,
			modal,
			decryptKnown,
			captureError,
			contentWindow
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const keys = Object.getOwnPropertyNames(contentWindow)
			const moz = keys.filter(key => (/moz/i).test(key)).length
			const webkit = keys.filter(key => (/webkit/i).test(key)).length
			const apple = keys.filter(key => (/apple/i).test(key)).length
			const data = { keys, apple, moz, webkit } 
			const $hash = await hashify(data)
			resolve({ ...data, $hash })
			const id = 'creep-iframe-content-window-version'
			const el = document.getElementById(id)
			patch(el, html`
			<div>
				<strong>HTMLIFrameElement.contentWindow</strong>
				<div class="ellipsis">hash: ${$hash}</div>
				<div class="ellipsis">browser: ${decryptKnown($hash)}</div>
				<div>keys (${count(keys)}): ${keys && keys.length ? modal(id, keys.join(', ')) : note.blocked}</div>
				<div>moz: ${''+moz}</div>
				<div>webkit: ${''+webkit}</div>
				<div>apple: ${''+apple}</div>
			`)
			return
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}