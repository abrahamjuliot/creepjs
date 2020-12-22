export const getVoices = imports => {

	const {
		require: {
			hashify,
			captureError,
			phantomDarkness,
			logTestResult
		}
	} = imports
		
	return new Promise(async resolve => {
		try {
			const win = phantomDarkness ? phantomDarkness : window
			let voices = []
			const respond = async (resolve, voices) => {
				voices = voices.map(({ name, lang }) => ({ name, lang }))
				const check = {}
				check.microsoft = voices.filter(key => (/microsoft/i).test(key.name)).length
				check.google = voices.filter(key => (/google/i).test(key.name)).length
				check.chromeOS = voices.filter(key => (/chrome os/i).test(key.name)).length
				check.android = voices.filter(key => (/android/i).test(key.name)).length
				const $hash = await hashify(voices)
				logTestResult({ test: 'speech', passed: true })
				return resolve({ voices, ...check, $hash })
			}
			if (!('speechSynthesis' in win)) {
				logTestResult({ test: 'speech', passed: false })
				return resolve()
			}
			else if (!('chrome' in win)) {
				voices = await win.speechSynthesis.getVoices()
				return respond(resolve, voices)
			}
			else if (!win.speechSynthesis.getVoices || win.speechSynthesis.getVoices() == undefined) {
				logTestResult({ test: 'speech', passed: false })
				return resolve()
			}
			else if (win.speechSynthesis.getVoices().length) {
				voices = win.speechSynthesis.getVoices()
				return respond(resolve, voices)
			} else {
				win.speechSynthesis.onvoiceschanged = () => {
					voices = win.speechSynthesis.getVoices()
					return resolve(new Promise(resolve => respond(resolve, voices)))
				}
			}
		}
		catch (error) {
			logTestResult({ test: 'speech', passed: false })
			captureError(error)
			return resolve(undefined)
		}
	})
}