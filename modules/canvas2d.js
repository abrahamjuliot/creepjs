export const getCanvas2d = imports => {
	
	const {
		require: {
			hashify,
			captureError,
			lieProps,
			contentWindow
		}
	} = imports
	
	return new Promise(async resolve => {
		try {
			const dataLie = lieProps['HTMLCanvasElement.toDataURL']
			const contextLie = lieProps['HTMLCanvasElement.getContext']
			let lied = dataLie || contextLie
			const doc = contentWindow ? contentWindow.document : document
			const canvas = doc.createElement('canvas')
			const context = canvas.getContext('2d')
			const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
			context.font = '14px Arial'
			context.fillText(str, 0, 50)
			context.fillStyle = 'rgba(100, 200, 99, 0.78)'
			context.fillRect(100, 30, 80, 50)
			const dataURI = canvas.toDataURL()
			const $hash = await hashify(dataURI)
			const response = { dataURI, lied, $hash }
			return resolve(response)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}