export const getPrediction = ({hash, data}) => {
	const getBaseDeviceName = devices => {
		// ex: find Android 10 in [Android 10, Android 10 Blah Blah]
		return devices.find(a => devices.filter(b => b.includes(a)).length == devices.length)
	}
	let systems = [], devices = [], gpus = []
	const decrypted = Object.keys(data).find(key => data[key].find(item => {
		if (!(item.id == hash)) {
			return false
		}
		devices = item.devices || []
		systems = item.systems || []
		gpus = item.gpus || []
		return true
	}))
	const prediction = {
		decrypted,
		system: systems.length == 1 ? systems[0] : undefined,
		device: (
			devices.length == 1 ? devices[0] : getBaseDeviceName(devices)
		),
		gpu: gpus.length == 1 ? gpus[0] : undefined
	}
	return prediction
}

export const renderPrediction = ({decryptionData, crowdBlendingScore, patch, html, note, bot = false}) => {
	const {
		jsRuntime,
		jsEngine,
		htmlVersion,
		windowVersion,
		styleVersion,
		styleSystem,
		emojiSystem,
		audioSystem,
		canvasSystem,
		textMetricsSystem,
		webglSystem,
		gpuSystem,
		fontsSystem,
		voicesSystem,
		screenSystem,
		pendingReview
	} = decryptionData

	const iconSet = new Set()
	const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`
	const htmlIcon = cssClass => `<span class="icon ${cssClass}"></span>`
	const getTemplate = ({title, agent, showVersion = false}) => {
		const { decrypted, system, device } = agent || {}
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
		const icons = [
			systemIcon,
			browserIcon
		].join('')

		const unknown = ''+[...new Set([decrypted, system, device])] == ''
		const renderBlankIfKnown = unknown ? ` ${note.unknown}` : ''
		const renderIfKnown = unknown ? ` ${note.unknown}` : decrypted
		return (
			device ? `<span class="help" title="${device}">${icons}${title}<strong>*</strong></span>` :
				showVersion ? `${icons}${title}: ${renderIfKnown}` :
					`${icons}${title}${renderBlankIfKnown}`
		)
	}

	const unknownHTML = title => `${getBlankIcons()}${title}`
	const devices = new Set([
		(jsRuntime || {}).device,
		(emojiSystem || {}).device,
		(audioSystem || {}).device,
		(canvasSystem || {}).device,
		(textMetricsSystem || {}).device,
		(webglSystem || {}).device,
		(gpuSystem || {}).device,
		(fontsSystem || {}).device,
		(voicesSystem || {}).device,
		(screenSystem || {}).device
	])
	devices.delete(undefined)
	const getBaseDeviceName = devices => {
		return devices.find(a => devices.filter(b => b.includes(a)).length == devices.length)
	}
	const getOldestWindowOS = devices => {
		// FF RFP is ingnored in samples data since it returns Windows 10
		// So, if we have multiples versions of Windows, the lowest is the most accurate
		const windowsCore = (
			devices.length == devices.filter(x => /windows/i.test(x)).length
		)
		if (windowsCore) {
			return (
				devices.includes('Windows 7') ? 'Windows 7' :
				devices.includes('Windows 7 (64-bit)') ? 'Windows 7 (64-bit)' :
				devices.includes('Windows 8') ? 'Windows 8' :
				devices.includes('Windows 8 (64-bit)') ? 'Windows 8 (64-bit)' :
				devices.includes('Windows 8.1') ? 'Windows 8.1' :
				devices.includes('Windows 8.1 (64-bit)') ? 'Windows 8.1 (64-bit)' :
				devices.includes('Windows 10') ? 'Windows 10' :
				devices.includes('Windows 10 (64-bit)') ? 'Windows 10 (64-bit)' :
					undefined
			)
		}
		return undefined
	}
	const deviceCollection = [...devices]
	const deviceName = (
		getOldestWindowOS(deviceCollection) ||
		getBaseDeviceName(deviceCollection)
	)
	const el = document.getElementById('browser-detection')
	return patch(el, html`
	<div class="flex-grid relative">
		${
			pendingReview ? `<span class="aside-note-bottom">pending review: <span class="renewed">${pendingReview}</span></span>` : ''
		}
		${
			bot ? `<span class="aside-note"><span class="renewed">magic</span></span>` :
				crowdBlendingScore ? `<span class="aside-note">crowd blending score: <span class="${crowdBlendingScore < 100 ? 'entropy-high' : 'entropy-low'}">${crowdBlendingScore}%</span></span>` : ''
		}
		<div class="col-eight">
			<strong>Prediction</strong>
			<div class="ellipsis relative">${
				deviceName ? `<strong>*</strong>${deviceName}` : getBlankIcons()
			}</div>
			<div class="ellipsis relative">
				<span id="window-entropy"></span>${
				getTemplate({title: 'self', agent: windowVersion, showVersion: true})
			}</div>
			<div class="ellipsis relative">
				<span id="style-entropy"></span>${
				getTemplate({title: 'system styles', agent: styleSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="styleVersion-entropy"></span>${
				getTemplate({title: 'computed styles', agent: styleVersion})
			}</div>
			<div class="ellipsis relative">
				<span id="html-entropy"></span>${
				getTemplate({title: 'html element', agent: htmlVersion})
			}</div>
			<div class="ellipsis relative">
				<span id="math-entropy"></span>${
				getTemplate({title: 'js runtime', agent: jsRuntime})
			}</div>
			<div class="ellipsis relative">
				<span id="error-entropy"></span>${
				getTemplate({title: 'js engine', agent: jsEngine})
			}</div>
			<div class="ellipsis relative">
				<span id="emoji-entropy"></span>${
				!Object.keys(emojiSystem || {}).length ? unknownHTML('emojis') : 
					getTemplate({title: 'emojis', agent: emojiSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="audio-entropy"></span>${
				!Object.keys(audioSystem || {}).length ? unknownHTML('audio') : 
					getTemplate({title: 'audio', agent: audioSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="canvas-entropy"></span>${
				!Object.keys(canvasSystem || {}).length ? unknownHTML('canvas') : 
					getTemplate({title: 'canvas', agent: canvasSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="textMetrics-entropy"></span>${
				!Object.keys(textMetricsSystem || {}).length ? unknownHTML('textMetrics') : 
					getTemplate({title: 'textMetrics', agent: textMetricsSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="webgl-entropy"></span>${
				!Object.keys(webglSystem || {}).length ? unknownHTML('webgl') : 
					getTemplate({title: 'webgl', agent: webglSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="gpu-entropy"></span>${
				!Object.keys(gpuSystem || {}).length ? unknownHTML('gpu') : 
					getTemplate({title: 'gpu', agent: gpuSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="fonts-entropy"></span>${
				!Object.keys(fontsSystem || {}).length ? unknownHTML('fonts') : 
					getTemplate({title: 'fonts', agent: fontsSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="voices-entropy"></span>${
				!Object.keys(voicesSystem || {}).length ? unknownHTML('voices') : 
					getTemplate({title: 'voices', agent: voicesSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="screen-entropy"></span>${
				!Object.keys(screenSystem || {}).length ? unknownHTML('screen') : 
					getTemplate({title: 'screen', agent: screenSystem})
			}</div>
		</div>
		<div class="col-four icon-prediction-container">
			${[...iconSet].map(icon => {
				return `<div class="icon-prediction ${icon}"></div>`
			}).join('')}
			${
				gpuSystem && ((''+gpuSystem.gpu) != 'undefined') ? 
				`<div class="icon-prediction block-text-borderless">gpu:<br>${gpuSystem.gpu}</div>` : ''
			}
		</div>
	</div>
	`)
}

export const predictionErrorPatch = ({error, patch, html}) => {
	const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`
	const el = document.getElementById('browser-detection')
	return patch(el, html`
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
				<div>${getBlankIcons()}audio</div>
				<div>${getBlankIcons()}canvas</div>
				<div>${getBlankIcons()}textMetrics</div>
				<div>${getBlankIcons()}webgl</div>
				<div>${getBlankIcons()}gpu</div>
				<div>${getBlankIcons()}fonts</div>
				<div>${getBlankIcons()}voices</div>
				<div>${getBlankIcons()}screen</div>
			</div>
			<div class="col-four icon-prediction-container">
			</div>
		</div>
	`)
}