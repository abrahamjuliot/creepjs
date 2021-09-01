export const renderSamples = async ({samples, templateImports}) => {

	if (!samples) {
		return
	}

	const {
		window: windowSamples,
		math: mathSamples,
		error: errorSamples,
		html: htmlSamples,
		style: styleSamples
	} = samples || {}

	const computeData = (hash, data) => {
		let systems = []
		let poolTotal = 0
		const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0)
		const decryption = Object.keys(data).find(key => data[key].find(item => {
			if (!(item.id == hash)) {
				return false
			}
			systems = item.systems
			poolTotal = data[key].length
			return true
		}))

		return {
			systems,
			poolTotal,
			metricTotal,
			decryption
		}
	}
	const decryptHash = (hash, data) => {
		const { systems, poolTotal, metricTotal, decryption } = computeData(hash, data)
		const getIcon = name => `<span class="icon ${name}"></span>`
		const browserIcon = (
			!decryption ? '' :
				/edgios|edge/i.test(decryption) ? getIcon('edge') :
					/brave/i.test(decryption) ? getIcon('brave') :
						/vivaldi/i.test(decryption) ? getIcon('vivaldi') :
							/duckduckgo/i.test(decryption) ? getIcon('duckduckgo') :
								/yandex/i.test(decryption) ? getIcon('yandex') :
									/opera/i.test(decryption) ? getIcon('opera') :
										/crios|chrome/i.test(decryption) ? getIcon('chrome') :
											/tor browser/i.test(decryption) ? getIcon('tor') :
												/palemoon/i.test(decryption) ? getIcon('palemoon') :
													/fxios|firefox/i.test(decryption) ? getIcon('firefox') :
														/safari/i.test(decryption) ? getIcon('safari') :
															''
		)

		const icon = {
			blink: '<span class="icon blink"></span>',
			v8: '<span class="icon v8"></span>',
			webkit: '<span class="icon webkit"></span>',
			gecko: '<span class="icon gecko"></span>',
			goanna: '<span class="icon goanna"></span>',
			tor: '<span class="icon tor"></span>',
			firefox: '<span class="icon firefox"></span>',
			cros: '<span class="icon cros"></span>',
			linux: '<span class="icon linux"></span>',
			apple: '<span class="icon apple"></span>',
			windows: '<span class="icon windows"></span>',
			android: '<span class="icon android"></span>'
		}
		const engineIcon = (
			!decryption ? '' :
				/SpiderMonkey/.test(decryption) ? icon.firefox :
					/JavaScriptCore/.test(decryption) ? icon.webkit :
						/V8/.test(decryption) ? icon.v8 :
							''
		)
		const engineRendererIcon = (
			!decryption ? '' :
				/Gecko/.test(decryption) ? icon.gecko :
					/WebKit/.test(decryption) ? icon.webkit :
						/Blink/.test(decryption) ? icon.blink :
							/Goanna/.test(decryption) ? icon.goanna :
								''
		)
		const systemIcon = (
			(!decryption || (systems.length != 1)) ? '' :
				/windows/i.test(systems[0]) ? icon.windows :
					/linux/i.test(systems[0]) ? icon.linux :
						/ipad|iphone|ipod|ios|mac/i.test(systems[0]) ? icon.apple :
							/android/i.test(systems[0]) ? icon.android :
								/chrome os/i.test(systems[0]) ? icon.cros :
									''
		)

		const formatPercent = n => n.toFixed(2).replace('.00', '')
		return {
			decryption: decryption || 'unknown',
			browserHTML: (
				!decryption ? undefined : 
					`${browserIcon}${decryption}`
			),
			engineHTML: (
				!decryption ? undefined : 
					`${engineIcon}${decryption}`
			),
			engineRendererHTML: (
				!decryption ? undefined : 
					`${engineRendererIcon}${decryption}`
			),
			engineRendererSystemHTML: (
				!decryption ? undefined : 
					`${engineRendererIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
			),
			engineSystem: (
				!decryption ? undefined : 
					`${engineIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
			),
			uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
			uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
		}
	}

	

	const renderWindowSamples = ({ fp, note, patch, html }) => {
		const id = document.getElementById(`window-features-samples`)
		if (!fp.windowFeatures || !id) {
			return
		}
		const { windowFeatures: { $hash } } = fp
		const { browserHTML, uniqueEngine } = decryptHash($hash, windowSamples)
		return patch(id, html`
			<div>
				<style>
					.window-features-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="window-features-class-rating">${uniqueEngine}% of ${browserHTML || note.unknown}</div>
			</div>
		`)
	}

	const renderMathSamples = ({ fp, note, patch, html }) => {
		const id = document.getElementById(`math-samples`)
		if (!fp.maths || !id) {
			return
		}
		const { maths: { $hash } } = fp
		const { engineHTML, uniqueEngine } = decryptHash($hash, mathSamples)
		return patch(id, html`
			<div>
				<style>
					.math-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="math-class-rating">${uniqueEngine}% of ${engineHTML || note.unknown}</div>
			</div>
		`)
	}

	const renderErrorSamples = ({ fp, note, patch, html }) => {
		const id = document.getElementById(`error-samples`)
		if (!fp.consoleErrors || !id) {
			return
		}
		const { consoleErrors: { $hash } } = fp
		const { engineHTML, uniqueEngine } = decryptHash($hash, errorSamples)
		return patch(id, html`
			<div>
				<style>
					.console-errors-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="console-errors-class-rating">${uniqueEngine}% of ${engineHTML || note.unknown}</div>
			</div>
		`)
	}

	const renderHTMLElementSamples = ({ fp, note, patch, html }) => {
		const id = document.getElementById(`html-element-samples`)
		if (!fp.htmlElementVersion || !id) {
			return
		}
		const { htmlElementVersion: { $hash } } = fp
		const { engineRendererHTML, uniqueEngine } = decryptHash($hash, htmlSamples)
		return patch(id, html`
			<div>
				<style>
					.html-element-version-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="html-element-version-class-rating">${uniqueEngine}% of ${engineRendererHTML || note.unknown}</div>
			</div>
		`)
	}

	const renderSystemStylesSamples = ({ fp, note, patch, html, styleSystemHash }) => {
		const id = document.getElementById(`system-style-samples`)
		if (!fp.css || !id) {
			return
		}
		const { engineRendererSystemHTML, uniqueEngine } = decryptHash(styleSystemHash, styleSamples)
		return patch(id, html`
			<div>
				<div>${engineRendererSystemHTML || note.unknown}</div>
			</div>
		`)
	}

	renderWindowSamples(templateImports)
	renderMathSamples(templateImports)
	renderErrorSamples(templateImports)
	renderHTMLElementSamples(templateImports)
	renderSystemStylesSamples(templateImports)

	return
}