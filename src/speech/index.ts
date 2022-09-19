import { captureError } from '../errors'
import { lieProps } from '../lies'
import { hashMini } from '../utils/crypto'
import { createTimer, queueEvent, logTestResult, IS_BLINK, performanceLogger, hashSlice, Analysis, LowerEntropy } from '../utils/helpers'
import { HTMLNote, count, modal } from '../utils/html'

export default async function getVoices() {
	// Don't run voice immediately. This is unstable
	// wait a bit for services to load
	await new Promise((resolve) => setTimeout(() => resolve(undefined), 50))
	return new Promise(async (resolve) => {
		try {
			const timer = createTimer()
			await queueEvent(timer)

			// use window since iframe is unstable in FF
			const supported = 'speechSynthesis' in window
			supported && speechSynthesis.getVoices() // warm up
			if (!supported) {
				logTestResult({ test: 'speech', passed: false })
				return resolve(null)
			}

			const voicesLie = !!lieProps['SpeechSynthesis.getVoices']

			const giveUpOnVoices = setTimeout(() => {
				logTestResult({ test: 'speech', passed: false })
				return resolve(null)
			}, 300)

			const getVoices = () => {
				const data = speechSynthesis.getVoices()
				const localServiceDidLoad = (data || []).find((x) => x.localService)
				if (!data || !data.length || (IS_BLINK && !localServiceDidLoad)) {
					return
				}
				clearTimeout(giveUpOnVoices)

				// filter first occurrence of unique voiceURI data
				const getUniques = (
					data: SpeechSynthesisVoice[],
					voiceURISet: Set<string>,
				): SpeechSynthesisVoice[] => data
					.filter((x) => {
						const { voiceURI } = x
						if (!voiceURISet.has(voiceURI)) {
							voiceURISet.add(voiceURI)
							return true
						}
						return false
					})

				const dataUnique = getUniques(data, new Set())

				// https://wicg.github.io/speech-api/#speechsynthesisvoice-attributes
				const local = dataUnique.filter((x) => x.localService).map((x) => x.name)
				const remote = dataUnique.filter((x) => !x.localService).map((x) => x.name)
				const languages = [...new Set(dataUnique.map((x) => x.lang))]
				const defaultLocalVoices = dataUnique.filter((x) => x.default && x.localService)

				let defaultVoiceName = ''
				let defaultVoiceLang = ''
				if (defaultLocalVoices.length === 1) {
					const { name, lang } = defaultLocalVoices[0]
					defaultVoiceName = name
					defaultVoiceLang = (lang || '').replace(/_/, '-')
				}

				// eslint-disable-next-line new-cap
				const { locale: localeLang } = Intl.DateTimeFormat().resolvedOptions()
				if (defaultVoiceLang &&
					defaultVoiceLang.split('-')[0] !== localeLang.split('-')[0]) {
					// this is not trash
					Analysis.voiceLangMismatch = true
					LowerEntropy.TIME_ZONE = true
				}

				logTestResult({ time: timer.stop(), test: 'speech', passed: true })
				return resolve({
					local,
					remote,
					languages,
					defaultVoiceName,
					defaultVoiceLang,
					lied: voicesLie,
				})
			}

			getVoices()
			if (speechSynthesis.addEventListener) {
				return speechSynthesis.addEventListener('voiceschanged', getVoices)
			}
			speechSynthesis.onvoiceschanged = getVoices
		} catch (error) {
			logTestResult({ test: 'speech', passed: false })
			captureError(error)
			return resolve(null)
		}
	})
}

export function voicesHTML(fp) {
	if (!fp.voices) {
		return `
		<div class="col-four undefined">
			<strong>Speech</strong>
			<div>local (0): ${HTMLNote.BLOCKED}</div>
			<div>remote (0): ${HTMLNote.BLOCKED}</div>
			<div>lang (0): ${HTMLNote.BLOCKED}</div>
			<div>default:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`
	}
	const {
		voices: {
			$hash,
			local,
			remote,
			languages,
			defaultVoiceName,
			defaultVoiceLang,
			lied,
		},
	} = fp

	const icon = {
		'Linux': '<span class="icon linux"></span>',
		'Apple': '<span class="icon apple"></span>',
		'Windows': '<span class="icon windows"></span>',
		'Android': '<span class="icon android"></span>',
		'CrOS': '<span class="icon cros"></span>',
	}
	const system: Record<string, string> = {
		'Chrome OS': icon.CrOS,
		'Maged': icon.Apple,
		'Microsoft': icon.Windows,
		'English United States': icon.Android,
		'English (United States)': icon.Android,
	}
	const systemVoice = Object.keys(system).find((key) => local.find((voice: string) => voice.includes(key))) || ''

	return `
	<div class="relative col-four${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().speech}</span>
		<strong>Speech</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SpeechSynthesis.getVoices()\nSpeechSynthesisVoice.localService">local (${count(local)}): ${
			!local || !local.length ? HTMLNote.UNSUPPORTED :
			modal(
				'creep-voices-local',
				local.join('<br>'),
				`${system[systemVoice] || ''}${hashMini(local)}`,
			)
		}</div>
		<div class="help" title="SpeechSynthesis.getVoices()">remote (${count(remote)}): ${
			!remote || !remote.length ? HTMLNote.UNSUPPORTED :
			modal(
				'creep-voices-remote',
				remote.join('<br>'),
				hashMini(remote),
			)
		}</div>
		<div class="help" title="SpeechSynthesis.getVoices()\nSpeechSynthesisVoice.lang">lang (${count(languages)}): ${
			!languages || !languages.length ? HTMLNote.BLOCKED :
				languages.length == 1 ? languages[0] : modal(
					'creep-voices-languages',
					languages.join('<br>'),
					hashMini(languages),
				)
		}</div>
		<div class="help" title="SpeechSynthesis.getVoices()\nSpeechSynthesisVoice.default">default:</div>
		<div class="block-text">
			${
				!defaultVoiceName ? HTMLNote.UNSUPPORTED :
					`${defaultVoiceName}${defaultVoiceLang ? ` [${defaultVoiceLang}]`: ''}`
			}
		</div>
	</div>
	`
}
