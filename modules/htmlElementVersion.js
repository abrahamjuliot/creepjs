export const getHTMLElementVersion = imports => {

	const {
		require: {
			instanceId,
			hashMini,
			hashify,
			patch,
			html,
			note,
			count,
			modal,
			decryptKnown,
			captureError
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const id = `${instanceId}-html-element-version-test`
			const htmlElement = document.createElement('div')
			htmlElement.setAttribute('id', id)
			htmlElement.setAttribute('style', 'display:none;')
			document.body.appendChild(htmlElement) 
			const htmlElementRendered = document.getElementById(id)
			const keys = []
			for (const key in htmlElementRendered) {
				keys.push(key)
			}
			htmlElementRendered.parentNode.removeChild(htmlElementRendered)
			const $hash = await hashify(keys)
			resolve({ keys, $hash })
			const elId = 'creep-html-element-version'
			const el = document.getElementById(elId)
			return patch(el, html`
			<div class="col-six">
				<strong>HTMLElement</strong><span class="hash">${hashMini($hash)}</span>
				<div class="ellipsis">browser: ${decryptKnown($hash)}</div>
				<div>keys (${count(keys)}): ${keys && keys.length ? modal(elId, keys.join(', ')) : note.blocked}</div>
			</div>
			`)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}