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
		device: devices.length == 1 ? devices[0] : getBaseDeviceName(devices),
		gpu: gpus.length == 1 ? gpus[0] : undefined
	}
	return prediction
}

export const renderPrediction = ({decryptionData, patch, html, note, bot = false}) => {
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
			/ipad|iphone|ipod|ios|mac/i.test(system) ? iconSet.add('apple') && htmlIcon('apple') :
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
			device ? `${icons}${title}<strong>*</strong>` :
				showVersion ? `${icons}${title}: ${renderIfKnown}` :
					`${icons}${title}${renderBlankIfKnown}`
		)
	}

	const unknownHTML = title => `${getBlankIcons()}${title} ${note.unknown}`
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
	
	const deviceName = getBaseDeviceName([...devices])
	const el = document.getElementById('browser-detection')
	return patch(el, html`
	<div class="flex-grid relative">
		<div class="ellipsis">${
			pendingReview ? `<span class="aside-note-bottom">pending review: <span class="renewed">${pendingReview}</span></span>` : ''
		}
		</div>
		<div class="ellipsis">
			<span class="aside-note"><span class="${bot ? 'renewed' : ''}">${bot ? 'magic' : ''}</span></span>
		</div>
		<div class="col-eight">
			<strong>Prediction</strong>
			<div>${deviceName ? `<strong>*</strong>${deviceName}` : getBlankIcons()}</div>
			<div class="ellipsis">${
				getTemplate({title: 'window object', agent: windowVersion, showVersion: true})
			}</div>
			<div class="ellipsis">${
				getTemplate({title: 'system styles', agent: styleSystem})
			}</div>
			<div class="ellipsis">${
				getTemplate({title: 'computed styles', agent: styleVersion})
			}</div>
			<div class="ellipsis">${
				getTemplate({title: 'html element', agent: htmlVersion})
			}</div>
			<div class="ellipsis">${
				getTemplate({title: 'js runtime', agent: jsRuntime})
			}</div>
			<div class="ellipsis">${
				getTemplate({title: 'js engine', agent: jsEngine})
			}</div>
			<div class="ellipsis">${
				!Object.keys(emojiSystem || {}).length ? unknownHTML('emojis') : 
					getTemplate({title: 'emojis', agent: emojiSystem})
			}</div>
			<div class="ellipsis">${
				!Object.keys(audioSystem || {}).length ? unknownHTML('audio') : 
					getTemplate({title: 'audio', agent: audioSystem})
			}</div>
			<div class="ellipsis">${
				!Object.keys(canvasSystem || {}).length ? unknownHTML('canvas') : 
					getTemplate({title: 'canvas', agent: canvasSystem})
			}</div>
			<div class="ellipsis">${
				!Object.keys(textMetricsSystem || {}).length ? unknownHTML('textMetrics') : 
					getTemplate({title: 'textMetrics', agent: textMetricsSystem})
			}</div>
			<div class="ellipsis">${
				!Object.keys(webglSystem || {}).length ? unknownHTML('webgl') : 
					getTemplate({title: 'webgl', agent: webglSystem})
			}</div>
			<div class="ellipsis">${
				!Object.keys(gpuSystem || {}).length ? unknownHTML('gpu') : 
					getTemplate({title: 'gpu', agent: gpuSystem})
			}</div>
			<div class="ellipsis">${
				!Object.keys(fontsSystem || {}).length ? unknownHTML('fonts') : 
					getTemplate({title: 'fonts', agent: fontsSystem})
			}</div>
			<div class="ellipsis">${
				!Object.keys(voicesSystem || {}).length ? unknownHTML('voices') : 
					getTemplate({title: 'voices', agent: voicesSystem})
			}</div>
			<div class="ellipsis">${
				!Object.keys(screenSystem || {}).length || !screenSystem.system ? unknownHTML('screen') : 
					getTemplate({title: 'screen', agent: screenSystem})
			}</div>
		</div>
		<div class="col-four icon-container">
			${[...iconSet].map(icon => {
				return `<div class="icon-item ${icon}"></div>`
			}).join('')}
			${
				gpuSystem && ((''+gpuSystem.gpu) != 'undefined') ? 
				`<div class="icon-item block-text-borderless">gpu:<br>${gpuSystem.gpu}</div>` : ''
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
			<div class="col-four icon-container">
			</div>
		</div>
	`)
}