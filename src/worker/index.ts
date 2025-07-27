import { captureError } from '../errors'
import { createLieDetector, documentLie } from '../lies'
import { getWebGLRendererConfidence, compressWebGLRenderer } from '../trash'
import { createTimer, queueEvent, getOS, getUserAgentPlatform, decryptUserAgent, computeWindowsRelease, JS_ENGINE, logTestResult, isUAPostReduction, performanceLogger, hashSlice, IS_WORKER_SCOPE, IS_BLINK, getReportedPlatform } from '../utils/helpers'
import { HTMLNote } from '../utils/html'

export const enum Scope {
	WORKER = 0,
	WINDOW,
}

export let WORKER_TYPE = ''
export let WORKER_NAME = ''

export async function spawnWorker() {
	const ask = (fn) => {
		try {
			return fn()
		} catch (e) {
			return
		}
	}

	function getWorkerPrototypeLies(scope: Window & typeof globalThis) {
		const lieDetector = createLieDetector(scope)
		const {
			searchLies,
		} = lieDetector

		searchLies(() => Function, {
			target: [
				'toString',
			],
			ignore: [
				'caller',
				'arguments',
			],
		})
		// @ts-expect-error
		searchLies(() => WorkerNavigator, {
			target: [
				'deviceMemory',
				'hardwareConcurrency',
				'language',
				'languages',
				'platform',
				'userAgent',
			],
		})
		// return lies list and detail
		const props = lieDetector.getProps()
		const propsSearched = lieDetector.getPropsSearched()
		return {
			lieDetector,
			lieList: Object.keys(props).sort(),
			lieDetail: props,
			lieCount: Object.keys(props).reduce((acc, key) => acc + props[key].length, 0),
			propsSearched,
		}
	}

	const getUserAgentData = async (navigator) => {
		if (!('userAgentData' in navigator)) {
			return
		}
		const data = await navigator.userAgentData.getHighEntropyValues(
			['platform', 'platformVersion', 'architecture', 'bitness', 'model', 'uaFullVersion'],
		)
		const { brands, mobile } = navigator.userAgentData || {}
		const compressedBrands = (brands, captureVersion = false) => brands
			.filter((obj) => !/Not/.test(obj.brand)).map((obj) => `${obj.brand}${captureVersion ? ` ${obj.version}` : ''}`)
		const removeChromium = (brands) => (
			brands.length > 1 ? brands.filter((brand) => !/Chromium/.test(brand)) : brands
		)

		// compress brands
		if (!data.brands) {
			data.brands = brands
		}
		data.brandsVersion = compressedBrands(data.brands, true)
		data.brands = compressedBrands(data.brands)
		data.brandsVersion = removeChromium(data.brandsVersion)
		data.brands = removeChromium(data.brands)

		if (!data.mobile) {
			data.mobile = mobile
		}
		const dataSorted = Object.keys(data).sort().reduce((acc, key) => {
			acc[key] = data[key]
			return acc
		}, {})
		return dataSorted
	}

	const getWebglData = () => ask(() => {
		// @ts-ignore
		const canvasOffscreenWebgl = new OffscreenCanvas(256, 256)
		const contextWebgl = canvasOffscreenWebgl.getContext('webgl')
		const rendererInfo = contextWebgl.getExtension('WEBGL_debug_renderer_info')
		return {
			webglVendor: contextWebgl.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL),
			webglRenderer: contextWebgl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL),
		}
	})

	const computeTimezoneOffset = () => {
		const date = new Date().getDate()
		const month = new Date().getMonth()
		// @ts-ignore
		const year = Date().split` `[3] // current year
		const format = (n) => (''+n).length == 1 ? `0${n}` : n
		const dateString = `${month+1}/${format(date)}/${year}`
		const dateStringUTC = `${year}-${format(month+1)}-${format(date)}`
		// @ts-ignore
		const utc = Date.parse(new Date(dateString))
		const now = +new Date(dateStringUTC)
		return +(((utc - now)/60000).toFixed(0))
	}

	const getLocale = () => {
		const constructors = [
			'Collator',
			'DateTimeFormat',
			'DisplayNames',
			'ListFormat',
			'NumberFormat',
			'PluralRules',
			'RelativeTimeFormat',
		]
		// @ts-ignore
		const locale = constructors.reduce((acc, name) => {
			try {
				const obj = new Intl[name]
				if (!obj) {
					return acc
				}
				const { locale } = obj.resolvedOptions() || {}
				return [...acc, locale]
			} catch (error) {
				return acc
			}
		}, [])

		return [...new Set(locale)]
	}

	const getWorkerData = async () => {
		const timer = createTimer()
		await queueEvent(timer)

		const userAgentData = await getUserAgentData(navigator).catch((error) => console.error(error))

		// webgl
		const { webglVendor, webglRenderer } = getWebglData() || {}

		// timezone & locale
		const timezoneOffset = computeTimezoneOffset()
		// eslint-disable-next-line new-cap
		const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
		const locale = getLocale()

		// navigator
		const {
			hardwareConcurrency,
			language,
			languages,
			platform,
			userAgent,
			// @ts-expect-error
			deviceMemory,
		} = navigator || {}

		// prototype lies
		await queueEvent(timer)
		const {
			// lieDetector: lieProps,
			lieList,
			lieDetail,
			// lieCount,
			// propsSearched,
		} = getWorkerPrototypeLies(self) // execute and destructure the list and detail
		// const prototypeLies = JSON.parse(JSON.stringify(lieDetail))
		const protoLieLen = lieList.length

		// match engine locale to system locale to determine if locale entropy is trusty
		let systemCurrencyLocale
		const lang = (''+language).split(',')[0]
		try {
			systemCurrencyLocale = (1).toLocaleString((lang || undefined), {
				style: 'currency',
				currency: 'USD',
				currencyDisplay: 'name',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			})
		} catch (e) {}
		const engineCurrencyLocale = (1).toLocaleString(undefined, {
			style: 'currency',
			currency: 'USD',
			currencyDisplay: 'name',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})
		const localeEntropyIsTrusty = engineCurrencyLocale == systemCurrencyLocale
		const localeIntlEntropyIsTrusty = new Set((''+language).split(',')).has(''+locale)

		const { href, pathname } = self.location || {}
		const locationPathNameLie = (
			!href ||
			!pathname ||
			!/^\/(docs|creepjs|public)|\/init.js$/.test(pathname) ||
			!new RegExp(`${pathname}$`).test(href)
		)

		return {
			lied: protoLieLen || +locationPathNameLie,
			lies: {
				proto: protoLieLen ? lieDetail : false,
			},
			locale: ''+locale,
			systemCurrencyLocale,
			engineCurrencyLocale,
			localeEntropyIsTrusty,
			localeIntlEntropyIsTrusty,
			timezoneOffset,
			timezoneLocation,
			deviceMemory,
			hardwareConcurrency,
			language,
			languages: ''+languages,
			platform,
			userAgent,
			webglRenderer,
			webglVendor,
			userAgentData,
		}
	}

	// Compute and communicate from worker scope
	const onEvent = (eventType, fn) => addEventListener(eventType, fn)
	const send = (source) => {
		return getWorkerData().then((data) => source.postMessage(data))
	}
	if (IS_WORKER_SCOPE) {
		globalThis.ServiceWorkerGlobalScope ? onEvent('message', (e) => send(e.source)) :
		globalThis.SharedWorkerGlobalScope ? onEvent('connect', (e) => send(e.ports[0])) :
		send(self) // DedicatedWorkerGlobalScope
	}

	return IS_WORKER_SCOPE ? Scope.WORKER : Scope.WINDOW
}

export default async function getBestWorkerScope() {
	try {
		const timer = createTimer()
		await queueEvent(timer)

		const ask = (fn) => {
			try {
				return fn()
			} catch (e) {
				return
			}
		}

		const hasConstructor = (x, name) => x && x.__proto__.constructor.name == name
		const getDedicatedWorker = ({ scriptSource }) => new Promise((resolve) => {
			const giveUpOnWorker = setTimeout(() => {
				return resolve(null)
			}, 3000)

			const dedicatedWorker = ask(() => new Worker(scriptSource))
			if (!hasConstructor(dedicatedWorker, 'Worker')) return resolve(null)

			dedicatedWorker.onmessage = (event) => {
				dedicatedWorker.terminate()
				clearTimeout(giveUpOnWorker)
				return resolve(event.data)
			}
		})
		const getSharedWorker = ({ scriptSource }) => new Promise((resolve) => {
			const giveUpOnWorker = setTimeout(() => {
				return resolve(null)
			}, 3000)

			const sharedWorker = ask(() => new SharedWorker(scriptSource))
			if (!hasConstructor(sharedWorker, 'SharedWorker')) return resolve(null)

			sharedWorker.port.start()

			sharedWorker.port.onmessage = (event) => {
				sharedWorker.port.close()
				clearTimeout(giveUpOnWorker)
				return resolve(event.data)
			}
		})
		const getServiceWorker = ({ scriptSource }) => new Promise((resolve) => {
			const giveUpOnWorker = setTimeout(() => {
				return resolve(null)
			}, 4000)

			if (!ask(() => navigator.serviceWorker.register)) return resolve(null)

			return navigator.serviceWorker.register(scriptSource).then((registration) => {
				if (!hasConstructor(registration, 'ServiceWorkerRegistration')) return resolve(null)

				return navigator.serviceWorker.ready.then((registration) => {
					// @ts-ignore
					registration.active.postMessage(undefined)

					navigator.serviceWorker.onmessage = (event) => {
						registration.unregister()
						clearTimeout(giveUpOnWorker)
						return resolve(event.data)
					}
				})
			}).catch((error) => {
				console.error(error)
				clearTimeout(giveUpOnWorker)
				return resolve(null)
			})
		})

		const scriptSource = './init.js'
		WORKER_NAME = 'ServiceWorkerGlobalScope'
		WORKER_TYPE = 'service' // loads fast but is not available in frames
		let workerScope = await getServiceWorker({ scriptSource }).catch((error) => {
			captureError(error)
			console.error(error.message)
			return
		})

		if (!(workerScope || {}).userAgent) {
			WORKER_NAME = 'SharedWorkerGlobalScope'
			WORKER_TYPE = 'shared' // no support in Safari, iOS, and Chrome Android
			workerScope = await getSharedWorker({ scriptSource }).catch((error) => {
				captureError(error)
				console.error(error.message)
				return
			})
		}

		if (!(workerScope || {}).userAgent) {
			WORKER_NAME = 'DedicatedWorkerGlobalScope'
			WORKER_TYPE = 'dedicated' // device emulators can easily spoof dedicated scope
			workerScope = await getDedicatedWorker({ scriptSource }).catch((error) => {
				captureError(error)
				console.error(error.message)
				return
			})
		}
		if (!(workerScope || {}).userAgent) {
			return
		}
		workerScope.system = getOS(workerScope.userAgent)
		workerScope.device = getUserAgentPlatform({ userAgent: workerScope.userAgent })

		// detect lies
		const {
			system,
			userAgent,
			userAgentData,
			platform,
			deviceMemory,
			hardwareConcurrency,
		} = workerScope || {}

		// navigator lies
		// skip language and languages to respect valid engine language switching bug in Chrome
		// these are more likely navigator lies, so don't trigger lied worker scope
		const workerScopeMatchLie = 'does not match worker scope'
		if (platform != navigator.platform) {
			documentLie('Navigator.platform', workerScopeMatchLie)
		}
		if (userAgent != navigator.userAgent) {
			documentLie('Navigator.userAgent', workerScopeMatchLie)
		}
		if (hardwareConcurrency && (hardwareConcurrency != navigator.hardwareConcurrency)) {
			documentLie('Navigator.hardwareConcurrency', workerScopeMatchLie)
		}
		// @ts-ignore
		if (deviceMemory && (deviceMemory != navigator.deviceMemory)) {
			documentLie('Navigator.deviceMemory', workerScopeMatchLie)
		}

		// prototype lies
		if (workerScope.lies.proto) {
			const { proto } = workerScope.lies
			const keys = Object.keys(proto)
			keys.forEach((key) => {
				const api = `WorkerGlobalScope.${key}`
				const lies = proto[key]
				lies.forEach((lie) => documentLie(api, lie))
			})
		}

		// user agent os lie
		const [userAgentOS, platformOS] = getReportedPlatform(userAgent, platform)
		if (userAgentOS != platformOS) {
			workerScope.lied = true
			workerScope.lies.os = `${platformOS} platform and ${userAgentOS} user agent do not match`
			documentLie('WorkerGlobalScope', workerScope.lies.os)
		}

		// user agent engine lie
		const decryptedName = decryptUserAgent({
			ua: userAgent,
			os: system,
			isBrave: false, // default false since we are only looking for JS runtime and version
		})
		const userAgentEngine = (
			(/safari/i.test(decryptedName) || /iphone|ipad/i.test(userAgent)) ? 'JavaScriptCore' :
				/firefox/i.test(userAgent) ? 'SpiderMonkey' :
					/chrome/i.test(userAgent) ? 'V8' :
						undefined
		)
		if (userAgentEngine != JS_ENGINE) {
			workerScope.lied = true
			workerScope.lies.engine = `${JS_ENGINE} JS runtime and ${userAgentEngine} user agent do not match`
			documentLie('WorkerGlobalScope', workerScope.lies.engine)
		}
		// user agent version lie
		const getVersion = (x) => (/\d+/.exec(x) || [])[0]
		const userAgentVersion = getVersion(decryptedName)
		const userAgentDataVersion = getVersion(userAgentData ? userAgentData.uaFullVersion : '')
		const versionSupported = userAgentDataVersion && userAgentVersion
		const versionMatch = userAgentDataVersion == userAgentVersion
		if (versionSupported && !versionMatch) {
			workerScope.lied = true
			workerScope.lies.version = `userAgentData version ${userAgentDataVersion} and user agent version ${userAgentVersion} do not match`
			documentLie('WorkerGlobalScope', workerScope.lies.version)
		}

		// platformVersion lie
		const FEATURE_CASE = IS_BLINK && CSS.supports('accent-color: initial')
		const getPlatformVersionLie = (device, userAgentData) => {
			if (!/windows|mac/i.test(device) || !userAgentData?.platformVersion) {
				return false
			}

			if (userAgentData.platform == 'macOS') {
				return FEATURE_CASE ? /_/.test(userAgentData.platformVersion) : false
			}

			const reportedVersionNumber = (/windows ([\d|\.]+)/i.exec(device)||[])[1]
			const windows10OrHigherReport = +reportedVersionNumber == 10
			const { platformVersion } = userAgentData
			const versionMap: Record<string, string> = {
				'6.1': '7',
				'6.2': '8',
				'6.3': '8.1',
				'10.0': '10',
			}
			const version = versionMap[platformVersion]
			if (!FEATURE_CASE && version) {
				return version != reportedVersionNumber
			}

			const parts = platformVersion.split('.')
			if (parts.length != 3) return true

			const windows10OrHigherPlatform = +parts[0] > 0
			return (
				(windows10OrHigherPlatform && !windows10OrHigherReport) ||
				(!windows10OrHigherPlatform && windows10OrHigherReport)
			)
		}
		const windowsVersionLie = getPlatformVersionLie(workerScope.device, userAgentData)
		if (windowsVersionLie) {
			workerScope.lied = true
			workerScope.lies.platformVersion = `platform version is fake`
			documentLie('WorkerGlobalScope', workerScope.lies.platformVersion)
		}

		// capture userAgent version
		workerScope.userAgentVersion = userAgentVersion
		workerScope.userAgentDataVersion = userAgentDataVersion
		workerScope.userAgentEngine = userAgentEngine

		const gpu = {
			...(getWebGLRendererConfidence(workerScope.webglRenderer) || {}),
			compressedGPU: compressWebGLRenderer(workerScope.webglRenderer),
		}

		logTestResult({ time: timer.stop(), test: `${WORKER_TYPE} worker`, passed: true })
		return {
			...workerScope,
			gpu,
			uaPostReduction: isUAPostReduction(workerScope.userAgent),
		}
	} catch (error) {
		logTestResult({ test: 'worker', passed: false })
		captureError(error, 'workers failed or blocked by client')
		return
	}
}

export function workerScopeHTML(fp) {
	if (!fp.workerScope) {
		return `
		<div class="col-six undefined">
			<strong>Worker</strong>
			<div>lang/timezone:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>gpu:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>
		<div class="col-six undefined">
			<div>userAgent:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>device:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>userAgentData:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`
	}
	const { workerScope: data } = fp

	const {
		lied,
		locale,
		systemCurrencyLocale,
		engineCurrencyLocale,
		localeEntropyIsTrusty,
		localeIntlEntropyIsTrusty,
		timezoneOffset,
		timezoneLocation,
		deviceMemory,
		hardwareConcurrency,
		language,
		// languages,
		platform,
		userAgent,
		uaPostReduction,
		webglRenderer,
		webglVendor,
		gpu,
		userAgentData,
		system,
		device,
		$hash,
	} = data || {}

	const {
		parts,
		warnings,
		gibbers,
		confidence,
		grade: confidenceGrade,
		compressedGPU,
	} = gpu || {}

	return `
	<span class="time">${performanceLogger.getLog()[`${WORKER_TYPE} worker`]}</span>
	<span class="aside-note-bottom">${WORKER_NAME || ''}</span>

	<div class="relative col-six${lied ? ' rejected' : ''}">

		<strong>Worker</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help">lang/timezone:</div>
		<div class="block-text help" title="WorkerNavigator.language\nWorkerNavigator.languages\nIntl.Collator.resolvedOptions()\nIntl.DateTimeFormat.resolvedOptions()\nIntl.DisplayNames.resolvedOptions()\nIntl.ListFormat.resolvedOptions()\nIntl.NumberFormat.resolvedOptions()\nIntl.PluralRules.resolvedOptions()\nIntl.RelativeTimeFormat.resolvedOptions()\nNumber.toLocaleString()\nIntl.DateTimeFormat().resolvedOptions().timeZone\nDate.getDate()\nDate.getMonth()\nDate.parse()">
			${
				localeEntropyIsTrusty ? `${language} (${systemCurrencyLocale})` :
					`${language} (<span class="bold-fail">${engineCurrencyLocale}</span>)`
			}
			${
				locale === language ? '' : localeIntlEntropyIsTrusty ? ` ${locale}` :
					` <span class="bold-fail">${locale}</span>`
			}
			<br>${timezoneLocation} (${''+timezoneOffset})
		</div>

		<div class="relative">${
			confidence ? `<span class="confidence-note">confidence: <span class="scale-up grade-${confidenceGrade}">${confidence}</span></span>` : ''
		}gpu:</div>
		<div class="block-text help" title="${
			confidence ? `\nWebGLRenderingContext.getParameter()\ngpu compressed: ${compressedGPU}\nknown parts: ${parts || 'none'}\ngibberish: ${gibbers || 'none'}\nwarnings: ${warnings.join(', ') || 'none'}` : 'WebGLRenderingContext.getParameter()'
		}">
			${webglVendor ? webglVendor : ''}
			${webglRenderer ? `<br>${webglRenderer}` : HTMLNote.UNSUPPORTED}
		</div>

	</div>
	<div class="col-six${lied ? ' rejected' : ''}">

		<div class="relative">userAgent:${!uaPostReduction ? '' : `<span class="confidence-note">ua reduction</span>`}</div>
		<div class="block-text help" title="WorkerNavigator.userAgent">
			<div>${userAgent || HTMLNote.UNSUPPORTED}</div>
		</div>

		<div>device:</div>
		<div class="block-text help" title="WorkerNavigator.deviceMemory\nWorkerNavigator.hardwareConcurrency\nWorkerNavigator.platform\nWorkerNavigator.userAgent">
			${`${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : HTMLNote.BLOCKED}
			${
				hardwareConcurrency && deviceMemory ? `<br>cores: ${hardwareConcurrency}, ram: ${deviceMemory}` :
				hardwareConcurrency && !deviceMemory ? `<br>cores: ${hardwareConcurrency}` :
				!hardwareConcurrency && deviceMemory ? `<br>ram: ${deviceMemory}` : ''
			}
		</div>

		<div>userAgentData:</div>
		<div class="block-text help" title="WorkerNavigator.userAgentData\nNavigatorUAData.getHighEntropyValues()">
			<div>
			${((userAgentData) => {
				const {
					architecture,
					bitness,
					brandsVersion,
					uaFullVersion,
					mobile,
					model,
					platformVersion,
					platform,
				} = userAgentData || {}

				// @ts-ignore
				const windowsRelease = computeWindowsRelease({ platform, platformVersion })

				return !userAgentData ? HTMLNote.UNSUPPORTED : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${windowsRelease || `${platform} ${platformVersion}`} ${architecture ? `${architecture}${bitness ? `_${bitness}` : ''}` : ''}
					${model ? `<br>${model}` : ''}
					${mobile ? '<br>mobile' : ''}
				`
			})(userAgentData)}
			</div>
		</div>

	</div>
	`
}
