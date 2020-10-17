export const getIframeContentWindowVersion = imports => {

	const {
		require: {
			hashMini,
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
			return patch(el, html`
			<div class="col-six">
				<strong>Window</strong><span class="hash">${hashMini($hash)}</span>
				<div>browser: ${decryptKnown($hash)}</div>
				<div>keys (${count(keys)}): ${keys && keys.length ? modal(id, keys.join(', ')) : note.blocked}</div>
				<div>moz: ${''+moz}</div>
				<div>webkit: ${''+webkit}</div>
				<div>apple: ${''+apple}</div>
			`)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}