export const getCanvas2d = imports => {
	
	const {
		require: {
			hashify,
			hashMini,
			captureError,
			lieProps,
			documentLie,
			phantomDarkness,
			dragonOfDeath,
			logTestResult
		}
	} = imports
	
	return new Promise(async resolve => {
		try {
			const dataLie = lieProps['HTMLCanvasElement.toDataURL']
			const contextLie = lieProps['HTMLCanvasElement.getContext']
			let lied = (dataLie || contextLie) || false
			const doc = phantomDarkness ? phantomDarkness.document : document
			const canvas = doc.createElement('canvas')
			const context = canvas.getContext('2d')
			const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
			context.font = '14px Arial'
			context.fillText(str, 0, 50)
			context.fillStyle = 'rgba(100, 200, 99, 0.78)'
			context.fillRect(100, 30, 80, 50)
			const dataURI = canvas.toDataURL()
			if (dragonOfDeath) {
				const result1 = hashMini(dragonOfDeath.document.createElement('canvas').toDataURL())
				const result2 = hashMini(document.createElement('canvas').toDataURL())
				if (result1 != result2) {
					lied = true
					const iframeLie = { fingerprint: '', lies: [{ [`Expected ${result1} in nested iframe and got ${result2}`]: true }] }
					documentLie(`HTMLCanvasElement.toDataURL`, hashMini({result1, result2}), iframeLie)
				}
			}
			const $hash = await hashify(dataURI)
			const response = { dataURI, lied, $hash }
			logTestResult({ test: 'canvas 2d', passed: true })
			return resolve(response)
		}
		catch (error) {
			logTestResult({ test: 'canvas 2d', passed: false })
			captureError(error)
			return resolve()
		}
	})
}