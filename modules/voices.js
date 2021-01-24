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
			const start = performance.now()
			const win = phantomDarkness ? phantomDarkness : window
			if (!('speechSynthesis' in win)) {
				logTestResult({ test: 'speech', passed: false })
				return resolve()
			}
			let success = false
			const awaitVoices = () => {
				const data = win.speechSynthesis.getVoices()
				if (!data.length) {
					return
				}
				success = true
				const voices = data.map(({ name, lang }) => ({ name, lang }))
				const defaultVoice = caniuse(() => data.find(voice => voice.default).name)
				logTestResult({ start, test: 'speech', passed: true })
				return resolve({ voices, defaultVoice })
			}
			
			awaitVoices()
			win.speechSynthesis.onvoiceschanged = awaitVoices
			setTimeout(() => {
				return !success ? resolve() : undefined
			}, 100)
		}
		catch (error) {
			logTestResult({ test: 'speech', passed: false })
			captureError(error)
			return resolve()
		}
	})
}