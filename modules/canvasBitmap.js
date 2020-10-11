export const getCanvasBitmapRenderer = imports => {

	const {
		require: {
			hashMini,
			hashify,
			patch,
			html,
			note,
			captureError,
			caniuse,
			lieProps
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const dataLie = lieProps['HTMLCanvasElement.toDataURL']
			const contextLie = lieProps['HTMLCanvasElement.getContext']
			let lied = dataLie || contextLie
			const patchDom = (lied, response) => {
				const { $hash } = response
				const el = document.getElementById('creep-canvas-bitmap-renderer')
				return patch(el, html`
				<div class="col-six">
					<strong>Canvas bitmaprenderer</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				</div>
				`)
			}
			const canvas = document.createElement('canvas')
			let canvasBMRDataURI = ''
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
					canvasBMRDataURI = canvas.toDataURL()
					const dataURI = canvasBMRDataURI
					const $hash = await hashify(dataURI)
					const response = { dataURI, lied, $hash }
					resolve(response)
					return patchDom(lied, response)
				}
			}))	
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}