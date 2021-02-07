const getErrors = errFns => {
	const errors = []
	let i, len = errFns.length
	for (i = 0; i < len; i++) {
		try {
			errFns[i]()
		} catch (err) {
			errors.push(err.message)
		}
	}
	return errors
}
export const getConsoleErrors = async imports => {

	const {
		require: {
			hashify,
			captureError,
			logTestResult
		}
	} = imports

	try {
		const start = performance.now()
		const errorTests = [
			() => new Function('alert(")')(),
			() => new Function('const foo;foo.bar')(),
			() => new Function('null.bar')(),
			() => new Function('abc.xyz = 123')(),
			() => new Function('const foo;foo.bar')(),
			() => new Function('(1).toString(1000)')(),
			() => new Function('[...undefined].length')(),
			() => new Function('var x = new Array(-1)')(),
			() => new Function('const a=1; const a=2;')()
		]
		const errors = getErrors(errorTests)
		logTestResult({ start, test: 'console errors', passed: true })
		return { errors }
	}
	catch (error) {
		logTestResult({ test: 'console errors', passed: false })
		captureError(error)
		return
	}
}