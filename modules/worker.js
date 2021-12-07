import { captureError, attempt, caniuse } from './captureErrors.js'
const source = 'creepworker.js'

const getDedicatedWorker = phantomDarkness => {
	return new Promise(resolve => {
		try {
			if (phantomDarkness && !phantomDarkness.Worker) {
				return resolve()
			}
			else if (
				phantomDarkness && phantomDarkness.Worker.prototype.constructor.name != 'Worker'
			) {
				throw new Error('Worker tampered with by client')
			}
			const worker = (
				phantomDarkness ? phantomDarkness.Worker : Worker
			)
			const dedicatedWorker = new worker(source)
			dedicatedWorker.onmessage = message => {
				dedicatedWorker.terminate()
				return resolve(message.data)
			}
		}
		catch(error) {
			console.error(error)
			captureError(error)
			return resolve()
		}
	})
}

const getSharedWorker = phantomDarkness => {
	return new Promise(resolve => {
		try {
			if (phantomDarkness && !phantomDarkness.SharedWorker) {
				return resolve()
			}
			else if (
				phantomDarkness && phantomDarkness.SharedWorker.prototype.constructor.name != 'SharedWorker'
			) {
				throw new Error('SharedWorker tampered with by client')
			}

			const worker = (
				phantomDarkness ? phantomDarkness.SharedWorker : SharedWorker
			)
			const sharedWorker = new worker(source)
			sharedWorker.port.start()
			sharedWorker.port.addEventListener('message', message => {
				sharedWorker.port.close()
				return resolve(message.data)
			})
		}
		catch(error) {
			console.error(error)
			captureError(error)
			return resolve()
		}
	})
}

const getServiceWorker = () => {
	return new Promise(async resolve => {
		try {
			if (!('serviceWorker' in navigator)) {
				return resolve()
			}
			else if (navigator.serviceWorker.__proto__.constructor.name != 'ServiceWorkerContainer') {
				throw new Error('ServiceWorkerContainer tampered with by client')
			}

			await navigator.serviceWorker.register(source)
			.catch(error => {
				console.error(error)
				return resolve()
			})
			//const registration = await navigator.serviceWorker.ready
			const registration = await navigator.serviceWorker.getRegistration(source)
			.catch(error => {
				console.error(error)
				return resolve()
			})
			if (!registration) {
				return resolve()
			}

			if (!('BroadcastChannel' in window)) {
				return resolve() // no support in Safari and iOS
			}

			const broadcast = new BroadcastChannel('creep_service_primary')
			broadcast.onmessage = message => {
				registration.unregister()
				broadcast.close()
				return resolve(message.data)
			}
			broadcast.postMessage({ type: 'fingerprint'})
			return setTimeout(() => resolve(), 1000)
		}
		catch(error) {
			console.error(error)
			captureError(error)
			return resolve()
		}
	})
}

export const getBestWorkerScope = async imports => {	
	const {
		require: {
			getOS,
			decryptUserAgent,
			captureError,
			caniuse,
			phantomDarkness,
			getUserAgentPlatform,
			documentLie,
			logTestResult,
			compressWebGLRenderer,
			getWebGLRendererConfidence 
		}
	} = imports
	try {
		await new Promise(setTimeout).catch(e => {})
		const start = performance.now()
		let scope = 'ServiceWorkerGlobalScope'
		let type = 'service' // loads fast but is not available in frames
		let workerScope = await getServiceWorker()
			.catch(error => console.error(error.message))
		if (!caniuse(() => workerScope.userAgent)) {
			scope = 'SharedWorkerGlobalScope'
			type = 'shared' // no support in Safari, iOS, and Chrome Android
			workerScope = await getSharedWorker(phantomDarkness)
			.catch(error => console.error(error.message))
		}
		if (!caniuse(() => workerScope.userAgent)) {
			scope = 'WorkerGlobalScope'
			type = 'dedicated' // simulators & extensions can spoof userAgent
			workerScope = await getDedicatedWorker(phantomDarkness)
			.catch(error => console.error(error.message))
		}
		if (caniuse(() => workerScope.userAgent)) {
			const { canvas2d } = workerScope || {}
			workerScope.system = getOS(workerScope.userAgent)
			workerScope.device = getUserAgentPlatform({ userAgent: workerScope.userAgent })
			workerScope.canvas2d = { dataURI: canvas2d }
			workerScope.type = type
			workerScope.scope = scope

			// detect lies 
			const {
				fontSystemClass,
				textMetricsSystemClass,
				system,
				userAgent,
				userAgentData,
				platform
			} = workerScope || {}
			
			// font system lie
			const fontSystemLie = fontSystemClass && (
				/^((i(pad|phone|os))|mac)$/i.test(system) && fontSystemClass != 'Apple'  ? true :
					/^(windows)$/i.test(system) && fontSystemClass != 'Windows'  ? true :
						/^(linux|chrome os)$/i.test(system) && fontSystemClass != 'Linux'  ? true :
							/^(android)$/i.test(system) && fontSystemClass != 'Android'  ? true :
								false
			)
			if (fontSystemLie) {
				workerScope.lied = true
				workerScope.lies.systemFonts = `${fontSystemClass} fonts and ${system} user agent do not match`
				documentLie(workerScope.scope, workerScope.lies.systemFonts)
			}

			// text metrics system lie
			const textMetricsSystemLie = textMetricsSystemClass && (
				/^((i(pad|phone|os))|mac)$/i.test(system) && textMetricsSystemClass != 'Apple'  ? true :
					/^(windows)$/i.test(system) && textMetricsSystemClass != 'Windows'  ? true :
						/^(linux|chrome os)$/i.test(system) && textMetricsSystemClass != 'Linux'  ? true :
							/^(android)$/i.test(system) && textMetricsSystemClass != 'Android'  ? true :
								false
			)
			if (textMetricsSystemLie) {
				workerScope.lied = true
				workerScope.lies.systemTextMetrics = `${textMetricsSystemClass} text metrics and ${system} user agent do not match`
				documentLie(workerScope.scope, workerScope.lies.systemTextMetrics)
			}

			// prototype lies
			if (workerScope.lies.proto) {
				const { proto } = workerScope.lies
				const keys = Object.keys(proto)
				keys.forEach(key => {
					const api = `${workerScope.scope}.${key}`
					const lies = proto[key]
					lies.forEach(lie => documentLie(api, lie))
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
				isBrave: false // default false since we are only looking for JS runtime and version
			})
			const userAgentEngine = (
				(/safari/i.test(decryptedName) || /iphone|ipad/i.test(userAgent)) ? 'JavaScriptCore' :
					/firefox/i.test(userAgent) ? 'SpiderMonkey' :
						/chrome/i.test(userAgent) ? 'V8' :
							undefined
			)
			const jsRuntimeEngine = {
				'1.9275814160560204e-50': 'V8',
				'1.9275814160560185e-50': 'SpiderMonkey',
				'1.9275814160560206e-50': 'JavaScriptCore'
			}
			const mathPI = 3.141592653589793
			const engine = jsRuntimeEngine[mathPI ** -100]
			if (userAgentEngine != engine) {
				workerScope.lied = true
				workerScope.lies.engine = `${engine} JS runtime and ${userAgentEngine} user agent do not match`
				documentLie(workerScope.scope, workerScope.lies.engine)
			}
			// user agent version lie
			const getVersion = x => /\s(\d+)/i.test(x) && /\s(\d+)/i.exec(x)[1]
			const userAgentVersion = getVersion(decryptedName)
			const userAgentDataVersion = (
				userAgentData &&
				userAgentData.brandsVersion &&
				userAgentData.brandsVersion.length ? 
				getVersion(userAgentData.brandsVersion) :
				undefined
			)
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
				if (!/windows/i.test(device) || !userAgentData) {
					return false
				}
				const reportedVersionNumber = +(/windows ([\d|\.]+)/i.exec(device)||[])[1]
				const windows1OrHigherReport = reportedVersionNumber == 10
				const { platformVersion, brandsVersion } = userAgentData

				const brandsVersionNumber = +(/\d+/.exec(''+(brandsVersion||[])[0])||[])[0]
				const versionMap = {
					'6.1': '7',
					'6.1.0': '7',
					'6.2': '8',
					'6.2.0': '8',
					'6.3': '8.1',
					'6.3.0': '8.1',
					'10.0': '10',
					'10.0.0': '10'
				}
				let versionNumber = versionMap[platformVersion]
				if ((brandsVersionNumber < 95) && versionNumber) {
					return versionNumber != (''+reportedVersionNumber)
				}
				versionNumber = +(/(\d+)\./.exec(''+platformVersion)||[])[1]
				const windows10OrHigherPlatform = versionNumber > 0
				return (
					(windows10OrHigherPlatform && !windows1OrHigherReport) ||
					(!windows10OrHigherPlatform && windows1OrHigherReport)
				)
			}
			const windowsVersionLie  = getWindowsVersionLie(workerScope.device, userAgentData)
			if (windowsVersionLie) {
				workerScope.lied = true
				workerScope.lies.platformVersion = `Windows platformVersion ${(userAgentData||{}).platformVersion} does not match user agent version ${workerScope.device}`
				documentLie(workerScope.scope, workerScope.lies.platformVersion)
			}			
			
			// capture userAgent version
			workerScope.userAgentVersion = userAgentVersion
			workerScope.userAgentDataVersion = userAgentDataVersion
			workerScope.userAgentEngine = userAgentEngine

			logTestResult({ start, test: `${type} worker`, passed: true })
			return {
				...workerScope,
				gpu: {
					...(getWebGLRendererConfidence(workerScope.webglRenderer) || {}),
					compressedGPU: compressWebGLRenderer(workerScope.webglRenderer)
				}
			}
		}
		return
	}
	catch (error) {
		logTestResult({ test: 'worker', passed: false })
		captureError(error, 'workers failed or blocked by client')
		return
	}
}

export const workerScopeHTML = ({ fp, note, count, modal, hashMini, hashSlice, computeWindowsRelease }) => {
	if (!fp.workerScope) {
		return `
		<div class="col-six undefined">
			<strong>Worker</strong>
			<div>canvas 2d: ${note.blocked}</div>
			<div>textMetrics: ${note.blocked}</div>
			<div>fontFaceSet (0): ${note.blocked}</div>
			<div>keys (0): ${note.blocked}</div>
			<div>permissions (0): ${note.blocked}</div>
			<div>codecs (0):${note.blocked}</div>
			<div>timezone: ${note.blocked}</div>
			<div>language: ${note.blocked}</div>
			<div>gpu:</div>
			<div class="block-text">${note.blocked}</div>
		</div>
		<div class="col-six undefined">
			<div>device:</div>
			<div class="block-text">${note.blocked}</div>
			<div>userAgent:</div>
			<div class="block-text">${note.blocked}</div>
			<div>userAgentData:</div>
			<div class="block-text">${note.blocked}</div>
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
		languages,
		mediaCapabilities,
		platform,
		userAgent,
		permissions,
		canvas2d,
		textMetrics,
		textMetricsSystemSum,
		textMetricsSystemClass,
		webglRenderer,
		webglVendor,
		gpu,
		fontFaceSetFonts,
		fontSystemClass,
		fontListLen,
		userAgentData,
		type,
		scope,
		system,
		device,
		$hash
	} = data || {}

	const icon = {
		'Linux': '<span class="icon linux"></span>',
		'Apple': '<span class="icon apple"></span>',
		'Windows': '<span class="icon windows"></span>',
		'Android': '<span class="icon android"></span>'
	}
	
	const systemFontClassIcon = icon[fontSystemClass]
	const systemTextMetricsClassIcon = icon[textMetricsSystemClass]
	const fontFaceSetHash = hashMini(fontFaceSetFonts)
	const textMetricsHash = hashMini(textMetrics)
	const codecKeys = Object.keys(mediaCapabilities || {})
	const permissionsKeys = Object.keys(permissions || {})
	const permissionsGranted = (
		permissions && permissions.granted ? permissions.granted.length : 0
	)

	const {
		parts,
		warnings,
		gibbers,
		confidence,
		grade: confidenceGrade,
		compressedGPU
	} = gpu || {}


	return `
	<div class="ellipsis"><span class="aside-note">${scope || ''}</span></div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Worker</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="OffscreenCanvas.convertToBlob()\nFileReader.readAsDataURL()">canvas 2d:${
			canvas2d && canvas2d.dataURI ?
			`<span class="sub-hash">${hashMini(canvas2d.dataURI)}</span>` :
			` ${note.unsupported}`
		}</div>
		<div class="help" title="OffscreenCanvasRenderingContext2D.measureText()">textMetrics: ${
			!textMetrics ? note.blocked : modal(
				'creep-worker-text-metrics',
				`<div>system: ${textMetricsSystemSum}</div><br>` +
				Object.keys(textMetrics).map(key => `<span>${key}: ${typeof textMetrics[key] == 'undefined' ? note.unsupported : textMetrics[key]}</span>`).join('<br>'),
				systemTextMetricsClassIcon ? `${systemTextMetricsClassIcon}${textMetricsHash}` :
					textMetricsHash
			)	
		}</div>
		<div class="help" title="FontFaceSet.check()">fontFaceSet (${fontFaceSetFonts ? count(fontFaceSetFonts) : '0'}/${''+fontListLen}): ${
			fontFaceSetFonts.length ? modal(
				'creep-worker-fonts-check', 
				fontFaceSetFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
				systemFontClassIcon ? `${systemFontClassIcon}${fontFaceSetHash}` : fontFaceSetHash
			) : note.unsupported
		}</div>
		<div>keys (${count(scopeKeys)}): ${
			scopeKeys && scopeKeys.length ? modal(
				'creep-worker-scope-version',
				scopeKeys.join(', '),
				hashMini(scopeKeys)
			) : note.blocked
		}</div>
		<div class="help" title="Permissions.query()">permissions (${''+permissionsGranted}): ${
			!permissions || !permissionsKeys ? note.unsupported : modal(
				'creep-worker-permissions',
				permissionsKeys.map(key => `<div class="perm perm-${key}"><strong>${key}</strong>:<br>${permissions[key].join('<br>')}</div>`).join(''),
				hashMini(permissions)
			)
		}</div>
		<div class="help" title="MediaCapabilities.decodingInfo()">codecs (${''+codecKeys.length}): ${
		!mediaCapabilities || !codecKeys.length ? note.unsupported :
			modal(
				`creep-worker-media-codecs`,
				Object.keys(mediaCapabilities).map(key => `${key}: ${mediaCapabilities[key].join(', ')}`).join('<br>'),
				hashMini(mediaCapabilities)
			)
		}</div>
		<div class="help" title="Intl.DateTimeFormat().resolvedOptions().timeZone\nDate.getDate()\nDate.getMonth()\nDate.parse()">timezone: ${timezoneLocation} (${''+timezoneOffset})</div>
		<div class="help" title="WorkerNavigator.language\nWorkerNavigator.languages\nIntl.Collator.resolvedOptions()\nIntl.DateTimeFormat.resolvedOptions()\nIntl.DisplayNames.resolvedOptions()\nIntl.ListFormat.resolvedOptions()\nIntl.NumberFormat.resolvedOptions()\nIntl.PluralRules.resolvedOptions()\nIntl.RelativeTimeFormat.resolvedOptions()\nNumber.toLocaleString()">lang:
			${
				localeEntropyIsTrusty ? `${language} (${systemCurrencyLocale})` : 
					`${language} (<span class="bold-fail">${engineCurrencyLocale}</span>)`
			}
			${
				locale === language ? '' : localeIntlEntropyIsTrusty ? ` ${locale}` : 
					` <span class="bold-fail">${locale}</span>`
			}
		</div>
		<div class="relative">${
			confidence ? `<span class="confidence-note">confidence: <span class="scale-up grade-${confidenceGrade}">${confidence}</span></span>` : ''
		}gpu:</div>
		<div class="block-text help" title="${
			confidence ? `\nWebGLRenderingContext.getParameter()\ngpu compressed: ${compressedGPU}\nknown parts: ${parts || 'none'}\ngibberish: ${gibbers || 'none'}\nwarnings: ${warnings.join(', ') || 'none'}` : 'WebGLRenderingContext.getParameter()'
		}">
			${webglVendor ? webglVendor : ''}
			${webglRenderer ? `<br>${webglRenderer}` : note.unsupported}
		</div>
	</div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text help" title="WorkerNavigator.deviceMemory\nWorkerNavigator.hardwareConcurrency\nWorkerNavigator.platform\nWorkerNavigator.userAgent">
			${`${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : note.blocked}
			${
				hardwareConcurrency && deviceMemory ? `<br>cores: ${hardwareConcurrency}, ram: ${deviceMemory}` :
				hardwareConcurrency && !deviceMemory ? `<br>cores: ${hardwareConcurrency}` :
				!hardwareConcurrency && deviceMemory ? `<br>ram: ${deviceMemory}` : ''
			}
		</div>
		<div>userAgent:</div>
		<div class="block-text help" title="WorkerNavigator.userAgent">
			<div>${userAgent || note.unsupported}</div>
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
					platform
				} = userAgentData || {}

				const brandsVersionNumber = +(/\d+/.exec(''+(brandsVersion||[])[0])||[])[0]
				const windowsRelease = (
					brandsVersionNumber > 94 ? computeWindowsRelease(platform, platformVersion) :
						undefined
				)

				return !userAgentData ? note.unsupported : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${windowsRelease ? windowsRelease : `${platform} ${platformVersion}`} ${architecture ? `${architecture}${bitness ? `_${bitness}` : ''}` : ''}
					${model ? `<br>${model}` : ''}
					${mobile ? '<br>mobile' : ''}
				`
			})(userAgentData)}	
			</div>
		</div>
	</div>
	`
}