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
export const getConsoleErrors = imports => {

	const {
		require: {
			hashify,
			patch,
			html,
			modal,
			decryptKnown,
			captureError
		}
	} = imports

	return new Promise(async resolve => {
		try {
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
			const $hash = await hashify(errors)
			resolve({errors, $hash })
			const id = 'creep-console-errors'
			const el = document.getElementById(id)
			const results = Object.keys(errors).map(key => {
				const value = errors[key]
				return `${+key+1}: ${value}`
			})
			patch(el, html`
			<div>
				<strong>Error</strong>
				<div class="ellipsis">hash: ${$hash}</div>
				<div>results: ${modal(id, results.join('<br>'))}
				<div class="ellipsis">js engine: ${decryptKnown($hash)}</div>
			</div>
			`)
			return
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}