export const getResistance = async imports => {

	const {
		require: {
			getBraveMode,
			braveBrowser,
			captureError,
			logTestResult
		}
	} = imports

	try {
		await new Promise(setTimeout)
		const start = performance.now()
		const data = {
			privacy: undefined,
			security: undefined,
			mode: undefined
		}
		// Brave
		const isBrave = await braveBrowser()
		if (isBrave) {
			const braveMode = getBraveMode()
			data.privacy = 'Brave'
			data.security = {
				'File System Access API disabled': !('FileSystemWritableFileStream' in window),
				'Web Serial API disabled': !('Serial' in window),
				'Reporting API disabled': !('ReportingObserver' in window)
			}
			data.mode = (
				braveMode.allow ? 'allow' :
				braveMode.standard ? 'standard' :
				braveMode.strict ? 'strict' :
				'unknown'
			)
		}
		
		// Firefox/TB

		logTestResult({ start, test: 'resistance', passed: true })
		return data
	}
	catch (error) {
		logTestResult({ test: 'resistance', passed: false })
		captureError(error)
		return
	}
}

export const resistanceHTML = ({fp, modal, note, hashMini, hashSlice}) => `
	${!fp.resistance ?
		`<div class="col-six">
			<strong>Resistance</strong>
			<div>privacy: ${note.blocked}</div>
			<div>security: ${note.blocked}</div>
			<div>mode: ${note.blocked}</div>
		</div>` :
	(() => {
		const {
			resistance: data
		} = fp
		const {
			$hash,
			privacy,
			security,
			mode,
			extensions
		} = data || {}
		
		return `
		<div class="col-six">
			<strong>Resistance</strong><span class="hash">${hashSlice($hash)}</span>
			<div>privacy: ${privacy || 'unknown'}</div>
			<div>security: ${
				!security ? 'unknown' :
				modal(
					'creep-resistance',
					'<strong>Security</strong><br><br>'
					+Object.keys(security).map(key => `${key}: ${''+security[key]}`).join('<br>'),
					hashMini(security)
				)
			}</div>
			<div>mode: ${mode || 'none'}</div>
		</div>
		`
	})()}
`