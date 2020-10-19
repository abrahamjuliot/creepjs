export const getCanvas2d = imports => {
	
	const {
		require: {
			hashify,
			captureError,
			lieProps
		}
	} = imports
	
	return new Promise(async resolve => {
		try {
			const dataLie = lieProps['HTMLCanvasElement.toDataURL']
			const contextLie = lieProps['HTMLCanvasElement.getContext']
			let lied = dataLie || contextLie
			const canvas = document.createElement('canvas')
			let canvas2dDataURI = ''
			const context = canvas.getContext('2d')
			const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
			context.font = '14px Arial'
			context.fillText(str, 0, 50)
			context.fillStyle = 'rgba(100, 200, 99, 0.78)'
			context.fillRect(100, 30, 80, 50)
			canvas2dDataURI = canvas.toDataURL()
			const dataURI = canvas2dDataURI
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