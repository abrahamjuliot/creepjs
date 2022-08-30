import { HTMLNote, patch, html } from '../utils/html';

export function getBlankIcons() {
	return `<span class="icon"></span><span class="icon"></span><span class="icon"></span>`
}

// This is the Dragon Fire Magic that runs when the API is locked
export default function getPrediction({ hash, data }) {
	const getBaseDeviceName = (devices: string[]) => {
		// ex: find Android 10 in [Android 10, Android 10 Blah Blah]
		return devices.find((a) => devices.filter((b) => b.includes(a)).length == devices.length)
	}
	let systems: string[] = []
	let devices: string[] = []
	let gpus: string[] = []
	let gpuBrands: string[] = []
	const decrypted = Object.keys(data).find((key) => data[key].find((item) => {
		if (item.id !== hash && ''+item.id !== ''+hash) return false

		devices = item.devices || []
		systems = item.systems || []
		gpus = item.gpus || []
		gpuBrands = item.gpuBrands || []

		return true
	}))

	// This gets us what the API returns
	const prediction = {
		decrypted,
		system: systems.length == 1 ? systems[0] : undefined,
		device: (
			devices.length == 1 ? devices[0] : getBaseDeviceName(devices)
		),
		gpu: gpus.length == 1 ? gpus[0] : undefined,
		gpuBrand: gpuBrands.length == 1 ? gpuBrands[0] : undefined,
	}

	return prediction
}

export function renderPrediction({
	decryptionData,
	crowdBlendingScore,
	bot = false,
}) {
	const {
		jsRuntime,
		jsEngine,
		htmlVersion,
		windowVersion,
		styleVersion,
		resistance,
		styleSystem,
		emojiSystem,
		domRectSystem,
		svgSystem,
		mimeTypesSystem,
		audioSystem,
		canvasSystem,
		canvasPaintSystem,
		canvasTextSystem,
		canvasEmojiSystem,
		textMetricsSystem,
		webglSystem,
		gpuSystem,
		gpuModelSystem,
		fontsSystem,
		voicesSystem,
		screenSystem,
		deviceOfTimezone,
		pendingReview,
	} = decryptionData || {}

	const iconSet = new Set()
	const htmlIcon = (cssClass: string) => `<span class="icon ${cssClass}"></span>`

	const getTemplate = ({ title, agent, showVersion = false }) => {
		const { decrypted, system, device, gpuBrand, score } = agent || {}
		const browserIcon = (
			/edgios|edge/i.test(decrypted) ? iconSet.add('edge') && htmlIcon('edge') :
				/brave/i.test(decrypted) ? iconSet.add('brave') && htmlIcon('brave') :
					/vivaldi/i.test(decrypted) ? iconSet.add('vivaldi') && htmlIcon('vivaldi') :
						/duckduckgo/i.test(decrypted) ? iconSet.add('duckduckgo') && htmlIcon('duckduckgo') :
							/yandex/i.test(decrypted) ? iconSet.add('yandex') && htmlIcon('yandex') :
								/opera/i.test(decrypted) ? iconSet.add('opera') && htmlIcon('opera') :
									/crios|chrome/i.test(decrypted) ? iconSet.add('chrome') && htmlIcon('chrome') :
										/tor browser/i.test(decrypted) ? iconSet.add('tor') && htmlIcon('tor') :
											/palemoon/i.test(decrypted) ? iconSet.add('palemoon') && htmlIcon('palemoon') :
												/fxios|firefox/i.test(decrypted) ? iconSet.add('firefox') && htmlIcon('firefox') :
													/v8/i.test(decrypted) ? iconSet.add('v8') && htmlIcon('v8') :
														/gecko/i.test(decrypted) ? iconSet.add('gecko') && htmlIcon('gecko') :
															/goanna/i.test(decrypted) ? iconSet.add('goanna') && htmlIcon('goanna') :
																/spidermonkey/i.test(decrypted) ? iconSet.add('firefox') && htmlIcon('firefox') :
																	/safari/i.test(decrypted) ? iconSet.add('safari') && htmlIcon('safari') :
																		/webkit|javascriptcore/i.test(decrypted) ? iconSet.add('webkit') && htmlIcon('webkit') :
																			/blink/i.test(decrypted) ? iconSet.add('blink') && htmlIcon('blink') : htmlIcon('')
		)
		const systemIcon = (
			/chrome os/i.test(system) ? iconSet.add('cros') && htmlIcon('cros') :
				/linux/i.test(system) ? iconSet.add('linux') && htmlIcon('linux') :
					/android/i.test(system) ? iconSet.add('android') && htmlIcon('android') :
						/ipad|iphone|ipod|ios|mac|apple/i.test(system) ? iconSet.add('apple') && htmlIcon('apple') :
							/windows/i.test(system) ? iconSet.add('windows') && htmlIcon('windows') : htmlIcon('')
		)

		const gpuBrandIconMap: Record<string, boolean> = {
			AMD: true,
			NVIDIA: true,
			APPLE: true,
			INTEL: true,
			MICROSOFT: true,
			SWIFTSHADER: true,
			ADRENO: true,
			MALI: true,
			POWERVR: true,
			SAMSUNG: true,
			PARALLELS: true,
			VMWARE: true,
			VIRTUALBOX: true,
			LLVM: true,
		}

		const gpuBrandIcon = (
			gpuBrandIconMap[gpuBrand] ? iconSet.add('chip') && htmlIcon('chip') : htmlIcon('')
		)

		const icons = [
			systemIcon,
			browserIcon,
			gpuBrandIcon,
		].join('')

		const UNKNOWN = '' + [...new Set([decrypted, system, device, gpuBrand])] == ''
		const renderIfKnown = (decrypted: string) => UNKNOWN ? ` ${HTMLNote.UNKNOWN}` : `<span class="user-agent">${decrypted}</span>`
		const renderFailingScore = (title, score) => {
			return (
				!score || (score > 36) ? title : `<span class="high-entropy">${title}</span>`
			)
		}

		const helpTitle: string = (
			device && gpuBrand ? [gpuBrand, device].join(':') :
				device ? device : gpuBrand
		)

		return (
			device || gpuBrand ? `<span class="help" title="${helpTitle}">
				${renderFailingScore(`${icons}${title}`, score)}<span>${device && gpuBrand ? '**' : '*'}</span>
			</span>` :
				showVersion ? renderFailingScore(`${icons}${renderIfKnown(decrypted)}`, score) :
					renderFailingScore(`${icons}${title}`, score)
		)
	}

	const unknownHTML = (title: string) => `${getBlankIcons()}<span class="blocked-entropy">${title}</span>`

	const gpuBrands = new Set([
		(jsRuntime || {}).gpuBrand,
		(emojiSystem || {}).gpuBrand,
		(domRectSystem || {}).gpuBrand,
		(svgSystem || {}).gpuBrand,
		(mimeTypesSystem || {}).gpuBrand,
		(audioSystem || {}).gpuBrand,
		(canvasSystem || {}).gpuBrand,
		(canvasPaintSystem || {}).gpuBrand,
		(canvasTextSystem || {}).gpuBrand,
		(canvasEmojiSystem || {}).gpuBrand,
		(textMetricsSystem || {}).gpuBrand,
		(webglSystem || {}).gpuBrand,
		(gpuSystem || {}).gpuBrand,
		(gpuModelSystem || {}).gpuBrand,
		(fontsSystem || {}).gpuBrand,
		(voicesSystem || {}).gpuBrand,
		(screenSystem || {}).gpuBrand,
		(deviceOfTimezone || {}).gpuBrand,
	])
	gpuBrands.delete(undefined)

	const gpus = new Set([
		(jsRuntime || {}).gpu,
		(emojiSystem || {}).gpu,
		(domRectSystem || {}).gpu,
		(svgSystem || {}).gpu,
		(mimeTypesSystem || {}).gpu,
		(audioSystem || {}).gpu,
		(canvasSystem || {}).gpu,
		(canvasPaintSystem || {}).gpu,
		(canvasTextSystem || {}).gpu,
		(canvasEmojiSystem || {}).gpu,
		(textMetricsSystem || {}).gpu,
		(webglSystem || {}).gpu,
		(gpuSystem || {}).gpu,
		(gpuModelSystem || {}).gpu,
		(fontsSystem || {}).gpu,
		(voicesSystem || {}).gpu,
		(screenSystem || {}).gpu,
		(deviceOfTimezone || {}).gpu,
	])
	gpus.delete(undefined)

	const devices = new Set([
		(jsRuntime || {}).device,
		(emojiSystem || {}).device,
		(domRectSystem || {}).device,
		(svgSystem || {}).device,
		(mimeTypesSystem || {}).device,
		(audioSystem || {}).device,
		(canvasSystem || {}).device,
		(canvasPaintSystem || {}).device,
		(canvasTextSystem || {}).device,
		(canvasEmojiSystem || {}).device,
		(textMetricsSystem || {}).device,
		(webglSystem || {}).device,
		(gpuSystem || {}).device,
		(gpuModelSystem || {}).device,
		(fontsSystem || {}).device,
		(voicesSystem || {}).device,
		(screenSystem || {}).device,
		(deviceOfTimezone || {}).device,
	])
	devices.delete(undefined)

	const getBaseDeviceName = (devices: string[]) => {
		return devices.find((a) => devices.filter((b) => b.includes(a)).length == devices.length)
	}
	const getRFPWindowOS = (devices: string[]) => {
		// FF RFP is ignored in samples data since it returns Windows 10
		// So, if we have multiples versions of Windows, prefer the lowest then Windows 11
		const windowsCoreRatio = devices.filter((x) => /windows/i.test(x)).length / devices.length
		const windowsCore = windowsCoreRatio > 0.5
		if (windowsCore) {
			return (
				devices.includes('Windows 7 (64-bit)') ? 'Windows 7 (64-bit)' :
					devices.includes('Windows 7') ? 'Windows 7' :

						devices.includes('Windows 8 (64-bit)') ? 'Windows 8 (64-bit)' :
							devices.includes('Windows 8') ? 'Windows 8' :

								devices.includes('Windows 8.1 (64-bit)') ? 'Windows 8.1 (64-bit)' :
									devices.includes('Windows 8.1') ? 'Windows 8.1' :

										devices.includes('Windows 11 (64-bit)') ? 'Windows 11 (64-bit)' :
											devices.includes('Windows 11') ? 'Windows 11' :

												devices.includes('Windows 10 (64-bit)') ? 'Windows 10 (64-bit)' :
													devices.includes('Windows 10') ? 'Windows 10' :
														undefined
			)
		}
		return undefined
	}

	const gpuBrandName = String([...gpuBrands])
	const gpuName = String([...gpus])
	const deviceCollection = [...devices]
	const deviceName = (
		getRFPWindowOS(deviceCollection) ||
		getBaseDeviceName(deviceCollection)
	)
	// Crowd-Blending Score Grade
	const crowdBlendingScoreGrade = (
		crowdBlendingScore >= 90 ? 'A' :
			crowdBlendingScore >= 80 ? 'B' :
				crowdBlendingScore >= 70 ? 'C' :
					crowdBlendingScore >= 60 ? 'D' :
						'F'
	)

	const hasValue = (data) => Object.values(data || {}).find((x) => typeof x != 'undefined')

	const el = document.getElementById('browser-detection')
	return patch(el, html`
	<div class="flex-grid relative">
		${
			pendingReview ? `<span class="aside-note-bottom">pending review: <span class="renewed">${pendingReview}</span></span>` : ''
		}
		${
			bot ? `<span class="time"><span class="renewed">locked</span></span>` :
				typeof crowdBlendingScore == 'number' ? `<span class="time">crowd-blending score: ${'' + crowdBlendingScore}% <span class="scale-up grade-${crowdBlendingScoreGrade}">${crowdBlendingScoreGrade}</span></span>` : ''
		}
		<div class="col-six">
			<strong>Prediction</strong>
			<div class="ellipsis relative">${
				deviceName && gpuBrandName ?
					`<span class="user-agent"><span>**</span>${[gpuBrandName, deviceName].join(':')}</span>` :
						gpuBrandName || deviceName ?
							`<span class="user-agent"><span>*</span>${gpuBrandName || deviceName}</span>` :
								getBlankIcons()
			}</div>
			<div class="ellipsis relative"><span id="window-entropy"></span>${
				getTemplate({ title: 'self', agent: windowVersion, showVersion: true })
			}</div>
			<div class="ellipsis relative"><span id="style-entropy"></span>${
				getTemplate({ title: 'system styles', agent: styleSystem })
			}</div>
			<div class="ellipsis relative"><span id="styleVersion-entropy"></span>${
				getTemplate({ title: 'computed styles', agent: styleVersion })
			}</div>
			<div class="ellipsis relative"><span id="html-entropy"></span>${
				getTemplate({ title: 'html element', agent: htmlVersion })
			}</div>
			<div class="ellipsis relative"><span id="math-entropy"></span>${
				getTemplate({ title: 'js runtime', agent: jsRuntime })
			}</div>
			<div class="ellipsis relative"><span id="error-entropy"></span>${
				getTemplate({ title: 'js engine', agent: jsEngine })
			}</div>
			<div class="ellipsis relative"><span id="emoji-entropy"></span>${
				!hasValue(emojiSystem) ? unknownHTML('domRect emojis') :
					getTemplate({ title: 'domRect emojis', agent: emojiSystem })
			}</div>
			<div class="ellipsis relative"><span id="domRect-entropy"></span>${
				!hasValue(domRectSystem) ? unknownHTML('domRect') :
					getTemplate({ title: 'domRect', agent: domRectSystem })
			}</div>
			<div class="ellipsis relative"><span id="svg-entropy"></span>${
				!hasValue(svgSystem) ? unknownHTML('svg emojis') :
					getTemplate({ title: 'svg emojis', agent: svgSystem })
			}</div>
			<div class="ellipsis relative"><span id="mimeTypes-entropy"></span>${
				!hasValue(mimeTypesSystem) ? unknownHTML('mimeTypes') :
					getTemplate({ title: 'mimeTypes', agent: mimeTypesSystem })
			}</div>
			<div class="ellipsis relative"><span id="audio-entropy"></span>${
				!hasValue(audioSystem) ? unknownHTML('audio') :
					getTemplate({ title: 'audio', agent: audioSystem })
			}</div>
			<div class="ellipsis relative"><span id="canvas-entropy"></span>${
				!hasValue(canvasSystem) ? unknownHTML('canvas image') :
					getTemplate({ title: 'canvas image', agent: canvasSystem })
			}</div>
			<div class="ellipsis relative"><span id="canvasPaint-entropy"></span>${
				!hasValue(canvasPaintSystem) ? unknownHTML('canvas paint') :
					getTemplate({ title: 'canvas paint', agent: canvasPaintSystem })
			}</div>
			<div class="ellipsis relative"><span id="canvasText-entropy"></span>${
				!hasValue(canvasTextSystem) ? unknownHTML('canvas text') :
					getTemplate({ title: 'canvas text', agent: canvasTextSystem })
			}</div>
			<div class="ellipsis relative"><span id="canvasEmoji-entropy"></span>${
				!hasValue(canvasEmojiSystem) ? unknownHTML('canvas emoji') :
					getTemplate({ title: 'canvas emoji', agent: canvasEmojiSystem })
			}</div>
			<div class="ellipsis relative"><span id="textMetrics-entropy"></span>${
				!hasValue(textMetricsSystem) ? unknownHTML('textMetrics') :
					getTemplate({ title: 'textMetrics', agent: textMetricsSystem })
			}</div>
			<div class="ellipsis relative"><span id="webgl-entropy"></span>${
				!hasValue(webglSystem) ? unknownHTML('webgl') :
					getTemplate({ title: 'webgl', agent: webglSystem })
			}</div>
			<div class="ellipsis relative"><span id="gpu-entropy"></span>${
				!hasValue(gpuSystem) ? unknownHTML('gpu params') :
					getTemplate({ title: 'gpu params', agent: gpuSystem })
			}</div>
			<div class="ellipsis relative"><span id="gpuModel-entropy"></span>${
				!hasValue(gpuModelSystem) ? unknownHTML('gpu model') :
					getTemplate({ title: 'gpu model', agent: gpuModelSystem })
			}</div>
			<div class="ellipsis relative"><span id="fonts-entropy"></span>${
				!hasValue(fontsSystem) ? unknownHTML('fonts') :
					getTemplate({ title: 'fonts', agent: fontsSystem })
			}</div>
			<div class="ellipsis relative"><span id="voices-entropy"></span>${
				!hasValue(voicesSystem) ? unknownHTML('voices') :
					getTemplate({ title: 'voices', agent: voicesSystem })
			}</div>
			<div class="ellipsis relative"><span id="screen-entropy"></span>${
				!hasValue(screenSystem) ? unknownHTML('screen') :
					getTemplate({ title: 'screen', agent: screenSystem })
			}</div>
			<div class="ellipsis relative"><span id="resistance-entropy"></span>${
				!hasValue(resistance) ? unknownHTML('resistance') :
					getTemplate({ title: 'resistance', agent: resistance })
			}</div>
			<div class="ellipsis relative"><span id="deviceOfTimezone-entropy"></span>${
				!hasValue(deviceOfTimezone) ? unknownHTML('device of timezone') :
					getTemplate({ title: 'device of timezone', agent: deviceOfTimezone })
			}</div>
		</div>
		<div class="col-six icon-prediction-container">
			${
				[...iconSet].map((icon) => {
					return `<div class="icon-prediction ${icon}"></div>`
				}).join('')
			}
			${
				gpuName ?
					`<div class="icon-prediction block-text-borderless">gpu:<br>${gpuName}</div>` : ''
			}
		</div>
	</div>
	`)
}

export function predictionErrorPatch(error: string): void {
	const el = document.getElementById('browser-detection')
	if (!el) return

	patch(el, html`
		<div class="flex-grid rejected">
			<div class="col-eight">
				<strong>Prediction Failed: ${error}</strong>
				<div>${getBlankIcons()}</div>
				<div class="ellipsis">${getBlankIcons()}window object:</div>
				<div>${getBlankIcons()}system styles</div>
				<div>${getBlankIcons()}computed styles</div>
				<div>${getBlankIcons()}html element</div>
				<div>${getBlankIcons()}js runtime</div>
				<div>${getBlankIcons()}js engine</div>
				<div>${getBlankIcons()}emojis</div>
				<div>${getBlankIcons()}domRect</div>
				<div>${getBlankIcons()}svg</div>
				<div>${getBlankIcons()}mimeTypes</div>
				<div>${getBlankIcons()}audio</div>
				<div>${getBlankIcons()}canvas image</div>
				<div>${getBlankIcons()}canvas paint</div>
				<div>${getBlankIcons()}canvas text</div>
				<div>${getBlankIcons()}canvas emoji</div>
				<div>${getBlankIcons()}textMetrics</div>
				<div>${getBlankIcons()}webgl</div>
				<div>${getBlankIcons()}gpu params</div>
				<div>${getBlankIcons()}gpu model</div>
				<div>${getBlankIcons()}fonts</div>
				<div>${getBlankIcons()}voices</div>
				<div>${getBlankIcons()}screen</div>
				<div>${getBlankIcons()}resistance</div>
				<div>${getBlankIcons()}device of timezone</div>
			</div>
			<div class="col-four icon-prediction-container">
			</div>
		</div>
	`)
}
