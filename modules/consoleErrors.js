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

export const consoleErrorsHTML = ({ fp, modal, note, hashSlice }) => {
	if (!fp.consoleErrors) {
		return `
		<div class="col-six undefined">
			<strong>Error</strong>
			<div>results: ${note.blocked}</div>
			<div>
				<div>${note.blocked}</div>
			</div>
		</div>`
	}
	const {
		consoleErrors: {
			$hash,
			errors
		}
	} = fp

	const results = Object.keys(errors).map(key => {
		const value = errors[key]
		return `${+key+1}: ${value}`
	})
	return `
	<div class="col-six">
		<strong>Error</strong><span class="hash">${hashSlice($hash)}</span>
		<div>results: ${modal('creep-console-errors', results.join('<br>'))}</div>
		<div class="blurred" id="error-samples">
			<div>0% of engine</div>
		</div>
	</div>
	`	
}