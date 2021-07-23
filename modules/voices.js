export const getVoices = imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			logTestResult,
			caniuse,
		}
	} = imports
		
	return new Promise(async resolve => {
		try {
			const win = phantomDarkness ? phantomDarkness : window
			const supported = 'speechSynthesis' in win
			supported && speechSynthesis.getVoices() // warm up
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			if (!supported) {
				logTestResult({ test: 'speech', passed: false })
				return resolve()
			}
			let success = false
			const getVoices = () => {
				const data = win.speechSynthesis.getVoices()
				if (!data || !data.length) {
					return
				}
				success = true
				const voices = data.map(({ name, lang }) => ({ name, lang }))
				const defaultVoice = caniuse(() => data.find(voice => voice.default).name)
				logTestResult({ start, test: 'speech', passed: true })
				return resolve({ voices, defaultVoice })
			}
			
			getVoices()
			win.speechSynthesis.onvoiceschanged = getVoices // Chrome support
			
			// handle pending resolve
			const wait = 1000
			setTimeout(() => {
				if (success) {
					return
				}
				logTestResult({ test: 'speech', passed: false })
				return resolve()
			}, wait)
		}
		catch (error) {
			logTestResult({ test: 'speech', passed: false })
			captureError(error)
			return resolve()
		}
	})
}

export const voicesHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
	if (!fp.voices) {
		return `
		<div class="col-four undefined">
			<strong>Speech</strong>
			<div>voices (0): ${note.blocked}</div>
			<div>default: ${note.blocked}</div>
		</div>`
	}
	const {
		voices: {
			$hash,
			defaultVoice,
			voices
		}
	} = fp
	const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`)
	return `
	<div class="col-four">
		<strong>Speech</strong><span class="hash">${hashSlice($hash)}</span>
		<div>voices (${count(voices)}): ${
			!voiceList || !voiceList.length ? note.unsupported :
			modal(
				'creep-voices',
				voiceList.join('<br>'),
				hashMini(voices)
			)
		}</div>
		<div>default:${
			!defaultVoice ? ` ${note.unsupported}` :
			`<span class="sub-hash">${hashMini(defaultVoice)}</span>`
		}</div>
	</div>
	`
}