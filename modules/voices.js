export const getVoices = imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			logTestResult
		}
	} = imports
		
	return new Promise(async resolve => {
		try {
			const start = performance.now()
			const win = phantomDarkness ? phantomDarkness : window
			if (!('speechSynthesis' in win)) {
				return resolve()
			}
			const awaitVoices = () => {
				const data = win.speechSynthesis.getVoices()
				if (!data.length) {
					return
				}
				const voices = data.map(({ name, lang }) => ({ name, lang }))
				const check = {
					microsoft: voices.filter(key => (/microsoft/i).test(key.name)).length,
					google: voices.filter(key => (/google/i).test(key.name)).length,
					chromeOS: voices.filter(key => (/chrome os/i).test(key.name)).length,
					android: voices.filter(key => (/android/i).test(key.name)).length
				}
				logTestResult({ start, test: 'speech', passed: true })
				return resolve({ voices, ...check, })
			}
			awaitVoices()
			win.speechSynthesis.onvoiceschanged = awaitVoices
		}
		catch (error) {
			logTestResult({ test: 'speech', passed: false })
			captureError(error)
			return resolve(undefined)
		}
	})
}