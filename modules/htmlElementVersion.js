export const getHTMLElementVersion = imports => {

	const {
		require: {
			captureError,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const start = performance.now()
			const keys = []
			for (const key in document.documentElement) {
				keys.push(key)
			}
			logTestResult({ start, test: 'html element', passed: true })
			return resolve({ keys })
		}
		catch (error) {
			logTestResult({ test: 'html element', passed: false })
			captureError(error)
			return resolve()
		}
	})
}