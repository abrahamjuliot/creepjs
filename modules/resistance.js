export const getResistance = async imports => {

	const {
		require: {
			isFirefox,
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
				'FileSystemWritableFileStream': 'FileSystemWritableFileStream' in window,
				'Serial': 'Serial' in window,
				'ReportingObserver': 'ReportingObserver' in window
			}
			data.mode = (
				braveMode.allow ? 'allow' :
				braveMode.standard ? 'standard' :
				braveMode.strict ? 'strict' :
				'unknown'
			)
		}
		
		// Firefox/Tor Browser
		const regex = n => new RegExp(`${n}+$`)
		const delay = (ms, baseNumber, baseDate = null) => new Promise(resolve => setTimeout(() => {
			const date = baseDate ? baseDate : +new Date()
			const value = regex(baseNumber).test(date) ? regex(baseNumber).exec(date)[0] : date
			return resolve(value)
		}, ms))
		const getTimerPrecision = async () => {
			const baseDate = +new Date()
			const baseNumber = +('' + baseDate).slice(-1)

			const a = await delay(0, baseNumber, baseDate)
			const b = await delay(1, baseNumber)
			const c = await delay(2, baseNumber)
			const d = await delay(3, baseNumber)
			const e = await delay(4, baseNumber)
			const f = await delay(5, baseNumber)
			const g = await delay(6, baseNumber)
			const h = await delay(7, baseNumber)
			const i = await delay(8, baseNumber)
			const j = await delay(9, baseNumber)

			const lastCharA = ('' + a).slice(-1)
			const lastCharB = ('' + b).slice(-1)
			const lastCharC = ('' + c).slice(-1)
			const lastCharD = ('' + d).slice(-1)
			const lastCharE = ('' + e).slice(-1)
			const lastCharF = ('' + f).slice(-1)
			const lastCharG = ('' + g).slice(-1)
			const lastCharH = ('' + h).slice(-1)
			const lastCharI = ('' + i).slice(-1)
			const lastCharJ = ('' + j).slice(-1)

			const protection = (
				lastCharA == lastCharB &&
				lastCharA == lastCharC &&
				lastCharA == lastCharD &&
				lastCharA == lastCharE &&
				lastCharA == lastCharF &&
				lastCharA == lastCharG &&
				lastCharA == lastCharH &&
				lastCharA == lastCharI &&
				lastCharA == lastCharJ
			)
			const baseLen = ('' + a).length
			const collection = [a, b, c, d, e, f, g, h, i, j]
			return {
				protection,
				delays: collection.map(n => ('' + n).length > baseLen ? ('' + n).slice(-baseLen) : n),
				precision: protection ? Math.min(...collection.map(val => ('' + val).length)) : undefined,
				precisionValue: protection ? lastCharA : undefined
			}
		}
		const { protection } = await getTimerPrecision()

		if (isFirefox && protection) {
			const features = {
				'OfflineAudioContext': 'OfflineAudioContext' in window,
				'RTCRtpTransceiver':  'RTCRtpTransceiver' in window,
				'MediaDevices': 'MediaDevices' in window,
				'WebGL2RenderingContext': 'WebGL2RenderingContext' in window,
				'Credential': 'Credential' in window,
				'WebAssembly': 'WebAssembly' in window,
				'maxTouchPoints': 'maxTouchPoints' in navigator
			}
			const featureKeys = Object.keys(features)
			const torBrowser = (
				(featureKeys.filter(key => !features[key]).length/featureKeys.length*100) > 50
			)
			const safer = !features.WebAssembly
			data.privacy = torBrowser ? 'Tor Browser' : 'Firefox'
			data.security = {
				'reduceTimerPrecision': true,
				...features
			}
			data.mode = (
				!torBrowser ? 'resistFingerprinting' :
					safer ? 'safer' :
						'standard' 
			)
		}

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
			mode
		} = data || {}
		
		const securitySettings = !security || Object.keys(security).reduce((acc, curr) => {
			if (security[curr]) {
				acc[curr] = 'enabled'
				return acc
			}
			acc[curr] = 'disabled'
			return acc
		}, {})

		const icon = (
			/brave/i.test(privacy) ? '<span class="icon brave"></span>' :
				/tor/i.test(privacy) ? '<span class="icon tor"></span>' :
					/firefox/i.test(privacy) ? '<span class="icon firefox"></span>' :
						''
		)
		
		return `
		<div class="col-six">
			<strong>Resistance</strong><span class="hash">${hashSlice($hash)}</span>
			<div>privacy: ${privacy ? `${icon}${privacy}` : 'unknown'}</div>
			<div>security: ${
				!security ? 'unknown' :
				modal(
					'creep-resistance',
					'<strong>Security</strong><br><br>'
					+Object.keys(securitySettings).map(key => `${key}: ${''+securitySettings[key]}`).join('<br>'),
					hashMini(security)
				)
			}</div>
			<div>mode: ${mode || 'none'}</div>
		</div>
		`
	})()}
`