export const getHTMLElementVersion = async imports => {

	const {
		require: {
			captureError,
			logTestResult
		}
	} = imports

	try {
		const start = performance.now()
		const keys = []
		for (const key in document.documentElement) {
			keys.push(key)
		}
		logTestResult({ start, test: 'html element', passed: true })
		return { keys }
	}
	catch (error) {
		logTestResult({ test: 'html element', passed: false })
		captureError(error)
		return
	}
}