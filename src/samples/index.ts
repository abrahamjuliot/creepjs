import { Analysis, getGpuBrand } from '../utils/helpers'
import { patch, html, HTMLNote } from '../utils/html'
import { WORKER_NAME } from '../worker'

// get GCD Samples
export async function getSamples() {
	const samples = window.sessionStorage && sessionStorage.getItem('samples')

	if (samples) {
		return {
			samples: JSON.parse(samples),
			samplesDidLoadFromSession: true,
		}
	}

	const url = (
		/\.github\.io/.test(location.origin) ? './data/samples.json' :
			'../docs/data/samples.json'
	)

	const cloudSamples = await fetch(url).then((res) => res.json()).catch((error) => {
		console.error(error)
		return
	})

	if (cloudSamples && window.sessionStorage) {
		sessionStorage.setItem('samples', JSON.stringify(cloudSamples))
	}

	return {
		samples: cloudSamples,
		samplesDidLoadFromSession: false,
	}
}

export default async function renderSamples(samples, { fp, styleSystemHash }) {
	if (!samples) {
		return
	}

	const {
		window: windowSamples,
		math: mathSamples,
		error: errorSamples,
		html: htmlSamples,
		style: styleSamples,
	} = samples || {}

	const computeData = (hash, data) => {
		let systems = []
		let poolTotal = 0
		const metricTotal = Object.keys(data).reduce((acc, item) => acc+= data[item].length, 0)
		const decryption = Object.keys(data).find((key) => data[key].find((item) => {
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
			decryption,
		}
	}
	const decryptHash = (hash, data) => {
		const { systems, poolTotal, metricTotal, decryption } = computeData(hash, data)
		const getIcon = (name) => `<span class="icon ${name}"></span>`
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
			android: '<span class="icon android"></span>',
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

		const formatPercent = (n) => n.toFixed(2).replace('.00', '')
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
			uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100),
		}
	}

	const renderWindowSamples = (fp) => {
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
				<div class="window-features-class-rating">${uniqueEngine}% of ${browserHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`)
	}

	const renderMathSamples = (fp) => {
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
				<div class="math-class-rating">${uniqueEngine}% of ${engineHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`)
	}

	const renderErrorSamples = (fp) => {
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
				<div class="console-errors-class-rating">${uniqueEngine}% of ${engineHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`)
	}

	const renderHTMLElementSamples = (fp) => {
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
				<div class="html-element-version-class-rating">${uniqueEngine}% of ${engineRendererHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`)
	}

	const renderSystemStylesSamples = (fp, styleSystemHash) => {
		const id = document.getElementById(`system-style-samples`)
		if (!fp.css || !id) {
			return
		}
		const { engineRendererSystemHTML } = decryptHash(styleSystemHash, styleSamples)
		return patch(id, html`
			<div>
				<div>${engineRendererSystemHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`)
	}

	renderWindowSamples(fp)
	renderMathSamples(fp)
	renderErrorSamples(fp)
	renderHTMLElementSamples(fp)
	renderSystemStylesSamples(fp, styleSystemHash)

	return
}

export function getRawFingerprint(fp) {
	try {
		const {
			canvas2d,
			canvasWebgl,
			capturedErrors,
			clientRects,
			cssMedia,
			features,
			fonts,
			headless,
			intl,
			lies,
			navigator: nav,
			offlineAudioContext,
			resistance,
			screen: screenFp,
			svg,
			timezone,
			trash,
			voices,
			workerScope: wkr,
		} = fp || {}

		const analysisFP = {
			device: (() => {
				const { width, height } = cssMedia?.screenQuery || {}
				return [
					wkr?.gpu?.compressedGPU || canvasWebgl?.gpu?.compressedGPU || null,
					wkr?.deviceMemory || nav?.deviceMemory || null,
					wkr?.hardwareConcurrency || nav?.hardwareConcurrency || null,
					fonts?.platformVersion || null,
					width || null,
					height || null,
					typeof screenFp?.touch == 'boolean' ? screenFp.touch : null,
					nav?.maxTouchPoints !== undefined ? nav.maxTouchPoints : null,
					typeof nav?.bluetoothAvailability == 'boolean' ? nav.bluetoothAvailability : null,
				]
			})(),
			voices: voices?.local?.slice(0, 3),
			voicesDefault: voices?.defaultVoiceName ? [
				voices?.defaultVoiceName,
				voices?.defaultVoiceLang || null,
			] : undefined,
			headless: headless?.$hash?.slice(0, 16),
			...(() => {
				if (!headless) return {}
				const { headless: hl, likeHeadless: ldl, stealth: s } = headless
				const data = { ...hl, ...ldl, ...s }
				return Object.keys(data).reduce((acc, key) => {
					acc[`headless${key[0].toUpperCase()}${key.slice(1)}`] = data[key]
					return acc
				}, {} as Record<string, string>)
			})(),
			headlessRating: headless?.headlessRating,
			headlessLikeRating: headless?.likeHeadlessRating,
			headlessStealthRating: headless?.stealthRating,
			headlessPlatformEstimate: headless?.platformEstimate?.[0],
			headlessSystemFont: headless?.systemFonts,
			engine: resistance?.engine,
			resistance: resistance?.$hash.slice(0, 16),
			resistanceExt: resistance?.extension || null,
			audio: offlineAudioContext?.$hash?.slice(0, 16),
			canvas: canvas2d?.$hash?.slice(0, 16),
			webgl: canvasWebgl?.$hash?.slice(0, 16),
			errors: capturedErrors?.data.length !== 0 ? capturedErrors?.data.slice(0, 6) : undefined,
			emojiDOMRect: clientRects?.domrectSystemSum,
			emojiSetDOMRect: clientRects?.emojiSet?.join(''),
			emojiSVGRect: svg?.svgrectSystemSum,
			emojiSetSVGRect: svg?.emojiSet?.join(''),
			emojiPixels: fonts?.pixelSizeSystemSum,
			emojiSetPixels: fonts?.emojiSet?.join(''),
			emojiTextMetrics: canvas2d?.textMetricsSystemSum,
			emojiSetTextMetrics: canvas2d?.emojiSet?.join(''),
			features: features?.version,
			...(() => {
				const vendor = (
					wkr?.webglVendor ||
					canvasWebgl?.parameters.UNMASKED_VENDOR_WEBGL
				)
				const renderer = (
					wkr?.webglRenderer ||
					canvasWebgl?.parameters.UNMASKED_RENDERER_WEBGL
				)
				const gpu = [vendor || null, renderer || null]
				const gpuBrand = getGpuBrand(renderer)

				return { gpu, gpuBrand }
			})(),
			...(() => {
				const {
					['any-hover']: cssAnyHover,
					['any-pointer']: cssAnyPointer,
					['color-gamut']: cssColorGamut,
					['device-aspect-ratio']: cssDeviceAspectRatio,
					['device-screen']: cssDeviceScreen,
					['display-mode']: cssDisplayMode,
					['forced-colors']: cssForcedColors,
					['hover']: cssHover,
					['inverted-colors']: cssInvertedColors,
					['monochrome']: cssMonochrome,
					['orientation']: cssOrientation,
					['pointer']: cssPointer,
					['prefers-color-scheme']: cssColorScheme,
					['prefers-reduced-motion']: cssReducedMotion,
				} = cssMedia?.mediaCSS || {}
				return {
					cssMedia: cssMedia?.$hash?.slice(0, 16),
					cssAnyHover,
					cssAnyPointer,
					cssColorGamut,
					cssDeviceAspectRatio,
					cssDeviceScreen,
					cssDisplayMode,
					cssForcedColors,
					cssHover,
					cssInvertedColors,
					cssMonochrome,
					cssOrientation,
					cssPointer,
					cssColorScheme,
					cssReducedMotion,
				}
			})(),
			fonts: fonts?.$hash?.slice(0, 16),
			fontList: fonts?.fontFaceLoadFonts,
			fontPlatformVersion: fonts?.platformVersion,
			userAgent: wkr?.userAgent || nav?.userAgent,
			userAgentDevice: [
				wkr?.device || nav?.device || null,
				wkr?.platform || nav?.platform || null,
				wkr?.system || nav?.system || null,
			],
			userAgentData: (() => {
				const data = wkr?.userAgentData || nav?.userAgentData
				if (!data) return

				const {
					platform,
					platformVersion,
					bitness,
					architecture,
					model,
					mobile,
				} = data || {}

				return [
					platform || null,
					platformVersion || null,
					bitness || null,
					architecture || null,
					model || null,
					typeof mobile == 'boolean' ? mobile : null,
				]
			})(),
			lies: lies?.totalLies !== 0 ? lies?.$hash?.slice(0, 16) : undefined,
			lieKeys: lies?.totalLies !== 0 ? Object.keys(lies.data || {}) : undefined,
			trash: (
				trash?.trashBin.length !== 0 ?
				trash?.trashBin
					.map((x: { name: string, value: string }) => [x.name, x.value].join(': ')).slice(0, 10):
					undefined
			),
			timezone: (() => {
				if (!timezone) return

				const {
					location,
					zone,
					locationEpoch,
					offset,
					offsetComputed,
				} = timezone || {}

				const {
					locale,
					language,
					languages,
					timezoneLocation,
					timezoneOffset,
					localeEntropyIsTrusty,
					localeIntlEntropyIsTrusty,
				} = wkr || {}

				return [
					timezoneLocation || location || null,
					zone || null,
					locationEpoch || null,
					timezoneOffset || offsetComputed || null,
					offset || null,
					locale || intl?.locale || null,
					language || null,
					languages || null,
					typeof localeEntropyIsTrusty == 'boolean' ? localeEntropyIsTrusty : null,
					typeof localeIntlEntropyIsTrusty == 'boolean' ? localeIntlEntropyIsTrusty : null,
				]
			})(),
			screen: (() => {
				if (!screenFp) return

				const {
					availHeight,
					availWidth,
					colorDepth,
					height,
					pixelDepth,
					touch,
					width,
				} = screenFp || {}
				return [
					width,
					height,
					availWidth,
					availHeight,
					colorDepth,
					pixelDepth,
					touch,
					nav?.maxTouchPoints !== undefined ? nav.maxTouchPoints : null,
					window.devicePixelRatio || null,
				]
			})(),
			permDenied: nav?.permissions?.denied,
			permGranted: nav?.permissions?.granted,
			workerEnabled: WORKER_NAME,
			...Analysis,
		}

		return analysisFP
	} catch (err) {
		console.error(err)
		return { fpErr: err }
	}
}
