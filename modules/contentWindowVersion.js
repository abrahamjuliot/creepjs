export const getWindowFeatures = imports => {

	const {
		require: {
			hashify,
			captureError,
			phantomDarkness,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const start = performance.now()
			const keys = Object.getOwnPropertyNames(phantomDarkness)
			const moz = keys.filter(key => (/moz/i).test(key)).length
			const webkit = keys.filter(key => (/webkit/i).test(key)).length
			const apple = keys.filter(key => (/apple/i).test(key)).length
			const data = { keys, apple, moz, webkit } 
			logTestResult({ start, test: 'window', passed: true })
			return resolve({ ...data })
		}
		catch (error) {
			logTestResult({ test: 'window', passed: false })
			captureError(error)
			return resolve()
		}
	})
}