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
			<div>0% of samples</div>
			<div>0% of class</div>
			<div>engine: ${note.blocked}</div>
			<div>results: ${note.blocked}</div>
		</div>`
	}
	const {
		consoleErrors: {
			$hash,
			errors
		}
	} = fp

	const decryptionData = {"V8":[{"id":"4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945","systems":["Linux"]},{"id":"7757f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5","systems":["Android","Chrome OS","Linux","Mac","Other","Windows"]},{"id":"7857f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5","systems":["Windows"]},{"id":"9950c83857654391aed7d172ef75efba4ccbab1a011ed54835251bd863d56ae7","systems":["Windows"]},{"id":"a8c7362bfa3851b0ea294c075f5708b73b679b484498989d7fde311441ed3322","systems":["Android","Chrome OS","Linux","Mac","Other","Windows","Windows Phone","iPhone"]}],"SpiderMonkey":[{"id":"5311d4b7dea48bb3b239b398e1f206b242bfab7b8e51dbf4743919266e48a2d2","systems":["Android","Linux","Mac","Windows"]},{"id":"5bb681a23d4554883f1b12ebe55bacdf625d5190145fad659daaa7e100bafcf0","systems":["Linux","Windows"]},{"id":"7c95559c6754c42c0d87fa0339f8a7cc5ed092e7e91ae9e50d3212f7486fcbeb","systems":["Android","Linux","Mac","Other","Windows"]}],"JavaScriptCore":[{"id":"c6c22e37dc19b13318a1d6dddf87e359c724cdc1ad1da7b21cf0bc4a76d431e8","systems":["Mac"]},{"id":"d420d594c5a7f7f9a93802eebc3bec3fba0ea2dde91843f6c4746121ef5da140","systems":["Mac","iPad","iPhone"]},{"id":"f4d88b59fb7c64d87deb760c851349a5fe47f9fe8ba06599594eab2502c54d97","systems":["iPhone"]}]}

	const decryptHash = (hash, data) => {
		let systems = []
		let poolTotal = 0
		const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0)
		const decryption = Object.keys(data).find(key => data[key].find(item => {
			if (!(item.id == hash)) {
				return false
			}
			systems = item.systems
			poolTotal = data[key].length
			return true
		}))

		const icon = {
			blink: '<span class="icon blink"></span>',
			webkit: '<span class="icon webkit"></span>',
			firefox: '<span class="icon firefox"></span>'
		}

		const engineIcon = (
			!decryption ? '' :
				/SpiderMonkey/.test(decryption) ? icon.firefox :
					/JavaScriptCore/.test(decryption) ? icon.webkit :
						/V8/.test(decryption) ? icon.blink :
								''
		)

		const formatPercent = n => n.toFixed(2).replace('.00', '')
		return {
			engine: decryption || 'unknown',
			engineHTML: (
				!decryption ? undefined : 
					`${engineIcon}${decryption}`
			),
			uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
			uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
		}
	}

	const { engine, engineHTML, uniqueMetric, uniqueEngine } = decryptHash($hash, decryptionData)
	const results = Object.keys(errors).map(key => {
		const value = errors[key]
		return `${+key+1}: ${value}`
	})
	return `
	<div class="col-six">
		<style>
			.console-errors-metric-rating {
				background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
			}
			.console-errors-class-rating {
				background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
			}
		</style>
		<strong>Error</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="console-errors-metric-rating help" title="% of console errors samples">${uniqueMetric}% of samples</div>
		<div class="console-errors-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
		<div>engine: ${engineHTML || note.unknown}</div>
		<div>results: ${modal('creep-console-errors', results.join('<br>'))}</div>
	</div>
	`	
}