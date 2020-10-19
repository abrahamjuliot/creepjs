export const getHTMLElementVersion = imports => {

	const {
		require: {
			instanceId,
			hashify,
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
			return resolve({ keys, $hash })
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}