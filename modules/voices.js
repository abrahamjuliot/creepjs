export const getVoices = imports => {

	const {
		require: {
			captureError,
			logTestResult,
			sendToTrash,
			lieProps
		}
	} = imports
		
	return new Promise(async resolve => {
		try {
			// use window since phantomDarkness is unstable in FF
			const supported = 'speechSynthesis' in window
			supported && speechSynthesis.getVoices() // warm up
			await new Promise(setTimeout).catch(e => {})
			const start = performance.now()
			if (!supported) {
				logTestResult({ test: 'speech', passed: false })
				return resolve()
			}
			let success = false
			const voiceslie = !!lieProps['SpeechSynthesis.getVoices']

			const getVoices = () => {
				const data = speechSynthesis.getVoices()
				if (!data || !data.length) {
					return
				}
				success = true
				const filterFirstOccurenceOfUniqueVoiceURIData = ({data, voiceURISet}) => data.filter(x => {
					const { voiceURI, name } = x
					if (!voiceURISet.has(voiceURI)) {
						voiceURISet.add(voiceURI)
						return true
					}
					sendToTrash(`speechSynthesis`, `'${name}' does not have a unique voiceURI`)
					return false
				})

				const dataUnique = filterFirstOccurenceOfUniqueVoiceURIData({ data, voiceURISet: new Set() })

				const local = dataUnique.filter(x => x.localService).map(x => x.name)
				const remote = dataUnique.filter(x => !x.localService).map(x => x.name)
				const languages = [...new Set(dataUnique.map(x => x.lang))]
				const { name: defaultName, lang: defaultLang } = dataUnique.find(voice => voice.default) || {}
				
				logTestResult({ start, test: 'speech', passed: true })
				return resolve({
					local,
					remote,
					languages,
					defaultName,
					defaultLang,
					lied: voiceslie
				})
			}
			
			getVoices()
			speechSynthesis.onvoiceschanged = getVoices // Chrome support
			
			// handle pending resolve
			const wait = 3000
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
			<div>local (0): ${note.blocked}</div>
			<div>remote (0): ${note.blocked}</div>
			<div>languages (0): ${note.blocked}</div>
			<div>default:</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
	}
	const {
		voices: {
			$hash,
			local,
			remote,
			languages,
			defaultName,
			defaultLang,
			lied
		}
	} = fp

	const icon = {
		'Linux': '<span class="icon linux"></span>',
		'Apple': '<span class="icon apple"></span>',
		'Windows': '<span class="icon windows"></span>',
		'Android': '<span class="icon android"></span>',
		'CrOS': '<span class="icon cros"></span>'
	}
	const system = {
		'Chrome OS': icon.CrOS,
		'Maged': icon.Apple,
		'Microsoft': icon.Windows,
		'English United States': icon.Android,
		'English (United States)': icon.Android
	}
	const systemVoice = Object.keys(system).find(key => local.find(voice => voice.includes(key)))
	
	return `
	<div class="col-four${lied ? ' rejected' : ''}">
		<strong>Speech</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>local (${count(local)}): ${
			!local || !local.length ? note.unsupported :
			modal(
				'creep-voices-local',
				local.join('<br>'),
				`${system[systemVoice] || ''}${hashMini(local)}`
			)
		}</div>
		<div>remote (${count(remote)}): ${
			!remote || !remote.length ? note.unsupported :
			modal(
				'creep-voices-remote',
				remote.join('<br>'),
				hashMini(remote)
			)
		}</div>
		<div>languages (${count(languages)}): ${
			!languages || !languages.length ? note.blocked :
				languages.length == 1 ? languages[0] : modal(
					'creep-voices-languages',
					languages.join('<br>'),
					hashMini(languages)
				)
		}</div>
		<div>default:</div>
		<div class="block-text">
			${!defaultName ? note.unsupported : `${defaultName}${defaultLang ? ` (${defaultLang})`: ''}`}
		</div>
	</div>
	`
}