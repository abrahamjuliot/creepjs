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

export const htmlElementVersionHTML = ({ fp, modal, note, hashSlice, count }) => {
	if (!fp.htmlElementVersion) {
		return `
		<div class="col-six undefined">
			<strong>HTMLElement</strong>
			<div>keys (0): ${note.blocked}</div>
			<div>
				<div>${note.blocked}</div>
			</div>
		</div>`
	}
	const {
		htmlElementVersion: {
			$hash,
			keys
		}
	} = fp

	return `
	<div class="col-six">
		<strong>HTMLElement</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-html-element-version', keys.join(', ')) : note.blocked}</div>
		<div class="blurred" id="html-element-samples">
			<div>0% of engine</div>
		</div>
	</div>
	`
}