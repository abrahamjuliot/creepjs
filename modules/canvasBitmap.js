export const getCanvasBitmapRenderer = imports => {

	const {
		require: {
			hashify,
			captureError,
			caniuse,
			lieProps,
			phantomDarkness,
			dragonFire,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const dataLie = lieProps['HTMLCanvasElement.toDataURL']
			const contextLie = lieProps['HTMLCanvasElement.getContext']
			let lied = (dataLie || contextLie) || false
			if (dragonFire &&
				dragonFire.document.createElement('canvas').toDataURL() != document.createElement('canvas').toDataURL()) {
				lied = true
			}
			const doc = phantomDarkness ? phantomDarkness.document : document
			const canvas = doc.createElement('canvas')
			const context = canvas.getContext('bitmaprenderer')
			const image = new Image()
			image.src = 'bitmap.png'
			return resolve(new Promise(resolve => {
				image.onload = async () => {
					if (!caniuse(() => createImageBitmap)) {
						logTestResult({ test: 'canvas bitmaprenderer', passed: false })
						return resolve()
					}
					const bitmap = await createImageBitmap(image, 0, 0, image.width, image.height)
					context.transferFromImageBitmap(bitmap)
					const dataURI = canvas.toDataURL()
					const $hash = await hashify(dataURI)
					const response = { dataURI, lied, $hash }
					logTestResult({ test: 'canvas bitmaprenderer', passed: true })
					return resolve(response)
				}
			}))	
		}
		catch (error) {
			logTestResult({ test: 'canvas bitmaprenderer', passed: false })
			captureError(error)
			return resolve()
		}
	})
}