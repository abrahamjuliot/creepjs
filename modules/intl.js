export const getIntl = async imports => {

	const {
		require: {
			captureError,
			logTestResult
		}
	} = imports

	try {
		const start = performance.now()
		
		logTestResult({ start, test: 'intl', passed: true })
		return
	}
	catch (error) {
		logTestResult({ test: 'intl', passed: false })
		captureError(error)
		return
	}
}

export const intlHTML = ({ fp, modal, note, hashSlice, count }) => {
	if (!fp.htmlElementVersion) {
		return `
		<div class="col-six undefined">
			<strong>Intl</strong>
			<div>locale: ${note.blocked}</div>
		</div>`
	}
	const {
		intl: {
			$hash,
			locale
		}
	} = fp
	
	return `
	<div class="col-six">
		<strong>Intl</strong><span class="hash">${hashSlice($hash)}</span>
		<div>locale: ${locale}</div>
	</div>
	`
}