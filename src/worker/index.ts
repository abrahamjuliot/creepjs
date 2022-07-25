import { captureError } from '../errors'
import { documentLie } from '../lies'
import { getWebGLRendererConfidence, compressWebGLRenderer } from '../trash'
import { hashMini } from '../utils/crypto'
import { createTimer, queueEvent, getOS, getUserAgentPlatform, decryptUserAgent, computeWindowsRelease, JS_ENGINE, logTestResult, isUAPostReduction, performanceLogger, hashSlice } from '../utils/helpers'
import { HTMLNote, count, modal } from '../utils/html'

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
			}, 3000)

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

		const scriptSource = 'creepworker.js'
		let scope = 'ServiceWorkerGlobalScope'
		let type = 'service' // loads fast but is not available in frames
		let workerScope = await getServiceWorker({ scriptSource }).catch((error) => {
			captureError(error)
			console.error(error.message)
			return
		})

		if (!(workerScope || {}).userAgent) {
			scope = 'SharedWorkerGlobalScope'
			type = 'shared' // no support in Safari, iOS, and Chrome Android
			workerScope = await getSharedWorker({ scriptSource }).catch((error) => {
				captureError(error)
				console.error(error.message)
				return
			})
		}

		if (!(workerScope || {}).userAgent) {
			scope = 'WorkerGlobalScope'
			type = 'dedicated' // device emulators can easily spoof dedicated scope
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
		workerScope.type = type
		workerScope.scope = scope

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
				const api = `${workerScope.scope}.${key}`
				const lies = proto[key]
				lies.forEach((lie) => documentLie(api, lie))
			})
		}

		// user agent os lie
		const userAgentOS = (
			// order is important
			/win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
				/android|linux|cros/ig.test(userAgent) ? 'Linux' :
					/(i(os|p(ad|hone|od)))|mac/ig.test(userAgent) ? 'Apple' :
						'Other'
		)
		const platformOS = (
			// order is important
			/win/ig.test(platform) ? 'Windows' :
				/android|arm|linux/ig.test(platform) ? 'Linux' :
					/(i(os|p(ad|hone|od)))|mac/ig.test(platform) ? 'Apple' :
						'Other'
		)
		const osLie = userAgentOS != platformOS
		if (osLie) {
			workerScope.lied = true
			workerScope.lies.os = `${platformOS} platform and ${userAgentOS} user agent do not match`
			documentLie(workerScope.scope, workerScope.lies.os)
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
			documentLie(workerScope.scope, workerScope.lies.engine)
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
			documentLie(workerScope.scope, workerScope.lies.version)
		}

		// windows platformVersion lie
		// https://docs.microsoft.com/en-us/microsoft-edge/web-platform/how-to-detect-win11
		const getWindowsVersionLie = (device, userAgentData) => {
			if (!/windows/i.test(device) || !userAgentData || !userAgentData.platformVersion) {
				return false
			}
			const reportedVersionNumber = +(/windows ([\d|\.]+)/i.exec(device)||[])[1]
			const windows1OrHigherReport = reportedVersionNumber == 10
			const { platformVersion } = userAgentData

			// userAgentData version format changed in Chrome 95
			// https://github.com/WICG/ua-client-hints/issues/220#issuecomment-870858413
			const chrome95AndAbove = (
				((3.141592653589793 ** -100) == 1.9275814160560204e-50) && CSS.supports('app-region: initial')
			)
			const versionMap = {
				'6.1': '7',
				'6.1.0': '7',
				'6.2': '8',
				'6.2.0': '8',
				'6.3': '8.1',
				'6.3.0': '8.1',
				'10.0': '10',
				'10.0.0': '10',
			}
			let versionNumber = versionMap[platformVersion]
			if (!chrome95AndAbove && versionNumber) {
				return versionNumber != (''+reportedVersionNumber)
			}
			versionNumber = +(/(\d+)\./.exec(''+platformVersion)||[])[1]
			const windows10OrHigherPlatform = versionNumber > 0
			return (
				(windows10OrHigherPlatform && !windows1OrHigherReport) ||
				(!windows10OrHigherPlatform && windows1OrHigherReport)
			)
		}
		const windowsVersionLie = getWindowsVersionLie(workerScope.device, userAgentData)
		if (windowsVersionLie) {
			workerScope.lied = true
			workerScope.lies.platformVersion = `Windows platformVersion ${(userAgentData||{}).platformVersion} does not match user agent version ${workerScope.device}`
			documentLie(workerScope.scope, workerScope.lies.platformVersion)
		}

		// capture userAgent version
		workerScope.userAgentVersion = userAgentVersion
		workerScope.userAgentDataVersion = userAgentDataVersion
		workerScope.userAgentEngine = userAgentEngine

		const gpu = {
			...(getWebGLRendererConfidence(workerScope.webglRenderer) || {}),
			compressedGPU: compressWebGLRenderer(workerScope.webglRenderer),
		}

		logTestResult({ time: timer.stop(), test: `${type} worker`, passed: true })
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
			<div>keys (0): ${HTMLNote.BLOCKED}</div>
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
		scopeKeys,
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
		type,
		scope,
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
	<span class="time">${performanceLogger.getLog()[`${type} worker`]}</span>
	<span class="aside-note-bottom">${scope || ''}</span>

	<div class="relative col-six${lied ? ' rejected' : ''}">

		<strong>Worker</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(scopeKeys)}): ${
			scopeKeys && scopeKeys.length ? modal(
				'creep-worker-scope-version',
				scopeKeys.join(', '),
				hashMini(scopeKeys),
			) : HTMLNote.BLOCKED
		}</div>
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
