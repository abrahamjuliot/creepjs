export const getCanvasBitmapRenderer = imports => {

	const {
		require: {
			hashify,
			captureError,
			caniuse,
			lieProps,
			contentWindow,
			hyperNestedIframeWindow
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const dataLie = lieProps['HTMLCanvasElement.toDataURL']
			const contextLie = lieProps['HTMLCanvasElement.getContext']
			let lied = dataLie || contextLie
			if (hyperNestedIframeWindow.document.createElement('canvas').toDataURL() != document.createElement('canvas').toDataURL()) {
				lied = true
			}
			const doc = contentWindow ? contentWindow.document : document
			const canvas = doc.createElement('canvas')
			const context = canvas.getContext('bitmaprenderer')
			const image = new Image()
			image.src = 'bitmap.png'
			return resolve(new Promise(resolve => {
				image.onload = async () => {
					if (!caniuse(() => createImageBitmap)) {
						return resolve(undefined)
					}
					const bitmap = await createImageBitmap(image, 0, 0, image.width, image.height)
					context.transferFromImageBitmap(bitmap)
					const dataURI = canvas.toDataURL()
					const $hash = await hashify(dataURI)
					const response = { dataURI, lied, $hash }
					return resolve(response)
				}
			}))	
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}