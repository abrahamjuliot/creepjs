export const getVoices = imports => {

	const {
		require: {
			hashMini,
			hashify,
			patch,
			html,
			note,
			count,
			modal,
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
				resolve({ voices, ...check, $hash })
				const id = 'creep-voices'
				const el = document.getElementById(id)
				const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`)
				return patch(el, html`
				<div class="col-six">
					<strong>SpeechSynthesis</strong><span class="hash">${hashMini($hash)}</span>
					<div>microsoft: ${''+check.microsoft}</div>
					<div>google: ${''+check.google}</div>
					<div>chrome OS: ${''+check.chromeOS}</div>
					<div>android: ${''+check.android}</div>
					<div>voices (${count(voices)}): ${voiceList && voiceList.length ? modal(id, voiceList.join('<br>')) : note.unsupported}</div>
				</div>
				`)
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