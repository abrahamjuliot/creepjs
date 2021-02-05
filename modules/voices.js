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
			const getVoices = async () => {
				const data = await win.speechSynthesis.getVoices()
				if (!data.length) {
					return
				}
				success = true
				const voices = data.map(({ name, lang }) => ({ name, lang }))
				const defaultVoice = caniuse(() => data.find(voice => voice.default).name)
				logTestResult({ start, test: 'speech', passed: true })
				return resolve({ voices, defaultVoice })
			}
			
			await getVoices()
			win.speechSynthesis.onvoiceschanged = getVoices
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