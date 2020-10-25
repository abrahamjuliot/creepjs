export const getHTMLElementVersion = imports => {

	const {
		require: {
			hashify,
			instanceId,
			captureError,
			parentNest
		}
	} = imports

	return new Promise(async resolve => {
		try {
			
			let htmlElementRendered
			if (parentNest &&  parentNest.el) {
				htmlElementRendered = parentNest.el
			}
			else {
				const id = `${instanceId}-html-element-version-test`
				const htmlElement = document.createElement('div')
				htmlElement.setAttribute('id', id)
				htmlElement.setAttribute('style', 'display:none;')
				document.body.appendChild(htmlElement)
				htmlElementRendered = document.getElementById(id)
			}

			const keys = []
			for (const key in htmlElementRendered) {
				keys.push(key)
			}

			if (!parentNest) {
				htmlElementRendered.parentNode.removeChild(htmlElementRendered)
			}

			const $hash = await hashify(keys)
			return resolve({ keys, $hash })
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}