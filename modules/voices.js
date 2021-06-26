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
			const wait = 300
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

export const voicesHTML = () => {
	
}