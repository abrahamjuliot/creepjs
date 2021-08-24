export const getWindowFeatures = async imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			isFirefox,
			logTestResult
		}
	} = imports

	try {
		const start = performance.now()
		const win = phantomDarkness || window
		let keys = Object.getOwnPropertyNames(win)
			.filter(key => !/_|\d{3,}/.test(key)) // clear out known ddg noise

		// if Firefox, remove the 'Event' key and push to end for consistent order
		// and disregard keys known to be missing in RFP mode
		const firefoxKeyMovedByInspect = 'Event'
		const varyingKeysMissingInRFP = ['PerformanceNavigationTiming', 'Performance']
		if (isFirefox) {
			const index = keys.indexOf(firefoxKeyMovedByInspect)
			if (index != -1) {
				keys = keys.slice(0, index).concat(keys.slice(index + 1))
				keys = [...keys, firefoxKeyMovedByInspect]
			}
			varyingKeysMissingInRFP.forEach(key => {
				const index = keys.indexOf(key)
				if (index != -1) {
					keys = keys.slice(0, index).concat(keys.slice(index + 1))
				}
				return keys
			})
		}
		
		const moz = keys.filter(key => (/moz/i).test(key)).length
		const webkit = keys.filter(key => (/webkit/i).test(key)).length
		const apple = keys.filter(key => (/apple/i).test(key)).length
		const data = { keys, apple, moz, webkit }
		logTestResult({ start, test: 'window', passed: true })
		return { ...data }
	}
	catch (error) {
		logTestResult({ test: 'window', passed: false })
		captureError(error)
		return
	}
}

export const windowFeaturesHTML = ({ fp, modal, note, hashSlice, count }) => {
	if (!fp.windowFeatures) {
		return `
		<div class="col-six undefined">
			<strong>Window</strong>
			<div>keys (0): ${note.blocked}</div>
			<div>
				<div>${note.blocked}</div>
			</div>
		</div>`
	}
	const {
		windowFeatures: {
			$hash,
			keys
		}
	} = fp
	
	return `
	<div class="col-six">
		<strong>Window</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-iframe-content-window-version', keys.join(', ')) : note.blocked}</div>
		<div class="blurred" id="window-features-samples">
			<div>0% of version</div>
		</div>
	</div>
	`	
}