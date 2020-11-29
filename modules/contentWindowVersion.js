export const getIframeContentWindowVersion = imports => {

	const {
		require: {
			hashify,
			captureError,
			contentWindow,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const keys = Object.getOwnPropertyNames(contentWindow)
			const moz = keys.filter(key => (/moz/i).test(key)).length
			const webkit = keys.filter(key => (/webkit/i).test(key)).length
			const apple = keys.filter(key => (/apple/i).test(key)).length
			const data = { keys, apple, moz, webkit } 
			const $hash = await hashify(data)
			logTestResult({ test: 'window', passed: true })
			return resolve({ ...data, $hash })
		}
		catch (error) {
			logTestResult({ test: 'window', passed: false })
			captureError(error)
			return resolve()
		}
	})
}