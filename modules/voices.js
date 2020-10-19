export const getVoices = imports => {

	const {
		require: {
			hashify,
			captureError
		}
	} = imports
		
	return new Promise(async resolve => {
		try {
			let voices = []
			const respond = async (resolve, voices) => {
				voices = voices.map(({ name, lang }) => ({ name, lang }))
				const check = {}
				check.microsoft = voices.filter(key => (/microsoft/i).test(key.name)).length
				check.google = voices.filter(key => (/google/i).test(key.name)).length
				check.chromeOS = voices.filter(key => (/chrome os/i).test(key.name)).length
				check.android = voices.filter(key => (/android/i).test(key.name)).length
				const $hash = await hashify(voices)
				return resolve({ voices, ...check, $hash })
			}
			if (!('speechSynthesis' in window)) {
				return resolve(undefined)
			}
			else if (!('chrome' in window)) {
				voices = await speechSynthesis.getVoices()
				return respond(resolve, voices)
			}
			else if (!speechSynthesis.getVoices || speechSynthesis.getVoices() == undefined) {
				return resolve(undefined)
			}
			else if (speechSynthesis.getVoices().length) {
				voices = speechSynthesis.getVoices()
				return respond(resolve, voices)
			} else {
				speechSynthesis.onvoiceschanged = () => {
					voices = speechSynthesis.getVoices()
					return resolve(new Promise(resolve => respond(resolve, voices)))
				}
			}
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}