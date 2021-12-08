// special thanks to https://arh.antoinevastel.com/reports/stats/menu.html for stats
export const getNavigator = async (imports, workerScope) => {

	const {
		require: {
			getOS,
			hashMini,
			captureError,
			attempt,
			caniuse,
			gibberish,
			sendToTrash,
			trustInteger,
			documentLie,
			lieProps,
			phantomDarkness,
			dragonOfDeath,
			getUserAgentPlatform,
			braveBrowser,
			decryptUserAgent,
			logTestResult,
			getPluginLies,
			isUAPostReduction,
			getUserAgentRestored
		}
	} = imports

	try {
		const start = performance.now()
		let lied = (
			lieProps['Navigator.appVersion'] ||
			lieProps['Navigator.deviceMemory'] ||
			lieProps['Navigator.doNotTrack'] ||
			lieProps['Navigator.hardwareConcurrency'] ||
			lieProps['Navigator.language'] ||
			lieProps['Navigator.languages'] ||
			lieProps['Navigator.maxTouchPoints'] ||
			lieProps['Navigator.oscpu'] ||
			lieProps['Navigator.platform'] ||
			lieProps['Navigator.userAgent'] ||
			lieProps['Navigator.vendor'] ||
			lieProps['Navigator.plugins'] ||
			lieProps['Navigator.mimeTypes']
		) || false
		const phantomNavigator = phantomDarkness ? phantomDarkness.navigator : navigator
		const detectLies = (name, value) => {
			const workerScopeValue = caniuse(() => workerScope, [name])
			const workerScopeMatchLie = 'does not match worker scope'
			if (workerScopeValue) {
				if (name == 'userAgent') {
					const navigatorUserAgent = value
					const system = getOS(navigatorUserAgent)
					if (workerScope.system != system) {
						lied = true
						documentLie(`Navigator.${name}`, workerScopeMatchLie)
					}
					else if (workerScope.userAgent != navigatorUserAgent) {
						lied = true
						documentLie(`Navigator.${name}`, workerScopeMatchLie)
					}
					return value
				}
				else if (name != 'userAgent' && workerScopeValue != value) {
					lied = true
					documentLie(`Navigator.${name}`, workerScopeMatchLie)
					return value
				}
			}
			return value
		}
		const credibleUserAgent = (
			'chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true
		)

		const data = {
			platform: attempt(() => {
				const { platform } = phantomNavigator
				const navigatorPlatform = navigator.platform
				const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11']
				const trusted = typeof navigatorPlatform == 'string' && systems.filter(val => navigatorPlatform.toLowerCase().includes(val))[0]
				detectLies('platform', navigatorPlatform)
				if (!trusted) {
					sendToTrash(`platform`, `${navigatorPlatform} is unusual`)
				}
				if (platform != navigatorPlatform) {
					lied = true
					const nestedIframeLie = `Expected "${navigatorPlatform}" in nested iframe and got "${platform}"`
					documentLie(`Navigator.platform`, nestedIframeLie)
				}

				// user agent os lie
				const { userAgent } = navigator
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
					lied = true
					documentLie(
						`Navigator.platform`,
						`${platformOS} platform and ${userAgentOS} user agent do not match`
					)
				}

				return platform
			}),
			system: attempt(() => getOS(phantomNavigator.userAgent), 'userAgent system failed'),
			userAgentParsed: await attempt(async () => {
				const reportedUserAgent = caniuse(() => navigator.userAgent)
				const reportedSystem = getOS(reportedUserAgent)
				const isBrave = await braveBrowser()
				const report = decryptUserAgent({
					ua: reportedUserAgent,
					os: reportedSystem,
					isBrave
				})
				return report
			}),
			device: attempt(() => getUserAgentPlatform({ userAgent: phantomNavigator.userAgent }), 'userAgent device failed'),
			userAgent: attempt(() => {
				const { userAgent } = phantomNavigator
				const navigatorUserAgent = navigator.userAgent
				detectLies('userAgent', navigatorUserAgent)
				if (!credibleUserAgent) {
					sendToTrash('userAgent', `${navigatorUserAgent} does not match appVersion`)
				}
				if (/\s{2,}|^\s|\s$/g.test(navigatorUserAgent)) {
					sendToTrash('userAgent', `extra spaces detected`)
				}
				const gibbers = gibberish(navigatorUserAgent)
				if (!!gibbers.length) {
					sendToTrash(`userAgent is gibberish`, navigatorUserAgent)
				}
				if (userAgent != navigatorUserAgent) {
					lied = true
					const nestedIframeLie = `Expected "${navigatorUserAgent}" in nested iframe and got "${userAgent}"`
					documentLie(`Navigator.userAgent`, nestedIframeLie)
				}
				return userAgent.trim().replace(/\s{2,}/, ' ')
			}, 'userAgent failed'),
			uaPostReduction: isUAPostReduction((navigator || {}).userAgent),
			appVersion: attempt(() => {
				const { appVersion } = phantomNavigator
				const navigatorAppVersion = navigator.appVersion
				detectLies('appVersion', appVersion)
				if (!credibleUserAgent) {
					sendToTrash('appVersion', `${navigatorAppVersion} does not match userAgent`)
				}
				if ('appVersion' in navigator && !navigatorAppVersion) {
					sendToTrash('appVersion', 'Living Standard property returned falsy value')
				}
				if (/\s{2,}|^\s|\s$/g.test(navigatorAppVersion)) {
					sendToTrash('appVersion', `extra spaces detected`)
				}
				if (appVersion != navigatorAppVersion) {
					lied = true
					const nestedIframeLie = `Expected "${navigatorAppVersion}" in nested iframe and got "${appVersion}"`
					documentLie(`Navigator.appVersion`, nestedIframeLie)
				}
				return appVersion.trim().replace(/\s{2,}/, ' ')
			}, 'appVersion failed'),
			deviceMemory: attempt(() => {
				if (!('deviceMemory' in navigator)) {
					return undefined
				}
				const { deviceMemory } = phantomNavigator
				const navigatorDeviceMemory = navigator.deviceMemory
				const trusted = {
					'0.25': true,
					'0.5': true,
					'1': true,
					'2': true,
					'4': true,
					'8': true
				}
				if (!trusted[navigatorDeviceMemory]) {
					sendToTrash('deviceMemory', `${navigatorDeviceMemory} is not a valid value [0.25, 0.5, 1, 2, 4, 8]`)
				}
				if (deviceMemory != navigatorDeviceMemory) {
					lied = true
					const nestedIframeLie = `Expected ${navigatorDeviceMemory} in nested iframe and got ${deviceMemory}`
					documentLie(`Navigator.deviceMemory`, nestedIframeLie)
				}
				return deviceMemory
			}, 'deviceMemory failed'),
			doNotTrack: attempt(() => {
				const { doNotTrack } = phantomNavigator
				const navigatorDoNotTrack = navigator.doNotTrack
				const trusted = {
					'1': !0,
					'true': !0,
					'yes': !0,
					'0': !0,
					'false': !0,
					'no': !0,
					'unspecified': !0,
					'null': !0,
					'undefined': !0
				}
				if (!trusted[navigatorDoNotTrack]) {
					sendToTrash('doNotTrack - unusual result', navigatorDoNotTrack)
				}
				return doNotTrack
			}, 'doNotTrack failed'),
			globalPrivacyControl: attempt(() => {
				if (!('globalPrivacyControl' in navigator)) {
					return undefined
				}
				const { globalPrivacyControl } = navigator
				const trusted = {
					'1': !0,
					'true': !0,
					'yes': !0,
					'0': !0,
					'false': !0,
					'no': !0,
					'unspecified': !0,
					'null': !0,
					'undefined': !0
				}
				if (!trusted[globalPrivacyControl]) {
					sendToTrash('globalPrivacyControl - unusual result', globalPrivacyControl)
				}
				return globalPrivacyControl
			}, 'globalPrivacyControl failed'),
			hardwareConcurrency: attempt(() => {
				if (!('hardwareConcurrency' in navigator)) {
					return undefined
				}
				const hardwareConcurrency = (
					dragonOfDeath ?
						dragonOfDeath.navigator.hardwareConcurrency :
						phantomNavigator.hardwareConcurrency
				)
				const navigatorHardwareConcurrency = navigator.hardwareConcurrency
				detectLies('hardwareConcurrency', navigatorHardwareConcurrency)
				trustInteger('hardwareConcurrency - invalid return type', navigatorHardwareConcurrency)
				if (hardwareConcurrency != navigatorHardwareConcurrency) {
					lied = true
					const nestedIframeLie = `Expected ${navigatorHardwareConcurrency} in nested iframe and got ${hardwareConcurrency}`
					documentLie(`Navigator.hardwareConcurrency`, nestedIframeLie)
				}
				return hardwareConcurrency
			}, 'hardwareConcurrency failed'),
			language: attempt(() => {
				const { language, languages } = phantomNavigator
				const navigatorLanguage = navigator.language
				const navigatorLanguages = navigator.languages
				// disregard detectLies in workers to respect valid engine language switching
				//detectLies('language', navigatorLanguage)
				//detectLies('languages', '' + navigatorLanguages)
				if ('' + language != '' + navigatorLanguage) {
					lied = true
					const nestedIframeLie = `Expected "${navigatorLanguage}" in nested iframe and got "${language}"`
					documentLie(`Navigator.language`, nestedIframeLie)
				}

				const lang = ('' + language).split(',')[0]
				let currencyLanguage
				try {
					currencyLanguage = (1).toLocaleString((lang || undefined), {
						style: 'currency',
						currency: 'USD',
						currencyDisplay: 'name',
						minimumFractionDigits: 0,
						maximumFractionDigits: 0
					})
				} catch (e) { }
				const currencyLocale = (1).toLocaleString(undefined, {
					style: 'currency',
					currency: 'USD',
					currencyDisplay: 'name',
					minimumFractionDigits: 0,
					maximumFractionDigits: 0
				})

				const languageLie = currencyLocale != currencyLanguage
				if (languageLie) {
					lied = true
					documentLie(
						`Navigator.language`,
						`${currencyLocale} locale and ${currencyLanguage} language do not match`
					)
				}

				if (navigatorLanguage && navigatorLanguages) {
					const lang = /^.{0,2}/g.exec(navigatorLanguage)[0]
					const langs = /^.{0,2}/g.exec(navigatorLanguages[0])[0]
					if (langs != lang) {
						sendToTrash('language/languages', `${[navigatorLanguage, navigatorLanguages].join(' ')} mismatch`)
					}
					return `${languages.join(', ')} (${language})`
				}

				return `${language} ${languages}`
			}, 'language(s) failed'),
			maxTouchPoints: attempt(() => {
				if (!('maxTouchPoints' in navigator)) {
					return null
				}
				const { maxTouchPoints } = phantomNavigator
				const navigatorMaxTouchPoints = navigator.maxTouchPoints
				if (maxTouchPoints != navigatorMaxTouchPoints) {
					lied = true
					const nestedIframeLie = `Expected ${navigatorMaxTouchPoints} in nested iframe and got ${maxTouchPoints}`
					documentLie(`Navigator.maxTouchPoints`, nestedIframeLie)
				}

				return maxTouchPoints
			}, 'maxTouchPoints failed'),
			vendor: attempt(() => {
				const { vendor } = phantomNavigator
				const navigatorVendor = navigator.vendor
				if (vendor != navigatorVendor) {
					lied = true
					const nestedIframeLie = `Expected "${navigatorVendor}" in nested iframe and got "${vendor}"`
					documentLie(`Navigator.vendor`, nestedIframeLie)
				}
				return vendor
			}, 'vendor failed'),
			mimeTypes: attempt(() => {
				const mimeTypes = phantomNavigator.mimeTypes
				return mimeTypes ? [...mimeTypes].map(m => m.type) : []
			}, 'mimeTypes failed'),
			oscpu: attempt(() => {
				const { oscpu } = phantomNavigator
				const navigatorOscpu = navigator.oscpu
				if (oscpu != navigatorOscpu) {
					lied = true
					const nestedIframeLie = `Expected "${navigatorOscpu}" in nested iframe and got "${oscpu}"`
					documentLie(`Navigator.oscpu`, nestedIframeLie)
				}
				return oscpu
			}, 'oscpu failed'),
			plugins: attempt(() => {
				const navigatorPlugins = navigator.plugins
				const plugins = phantomNavigator.plugins
				if (!(navigatorPlugins instanceof PluginArray)) {
					return
				}
				const response = plugins ? [...phantomNavigator.plugins]
					.map(p => ({
						name: p.name,
						description: p.description,
						filename: p.filename,
						version: p.version
					})) : []

				const { lies } = getPluginLies(navigatorPlugins, navigator.mimeTypes)
				if (lies.length) {
					lied = true
					lies.forEach(lie => {
						return documentLie(`Navigator.plugins`, lie)
					})
				}

				if (!!response.length) {
					response.forEach(plugin => {
						const { name, description } = plugin
						const nameGibbers = gibberish(name)
						const descriptionGibbers = gibberish(description)
						if (!!nameGibbers.length) {
							sendToTrash(`plugin name is gibberish`, name)
						}
						if (!!descriptionGibbers.length) {
							sendToTrash(`plugin description is gibberish`, description)
						}
						return
					})
				}
				return response
			}, 'plugins failed'),
			properties: attempt(() => {
				const keys = Object.keys(Object.getPrototypeOf(phantomNavigator))
				return keys
			}, 'navigator keys failed'),
			userAgentData: await attempt(async () => {
				if (!('userAgentData' in phantomNavigator)) {
					return
				}
				const data = await phantomNavigator.userAgentData.getHighEntropyValues(
					['platform', 'platformVersion', 'architecture', 'bitness', 'model', 'uaFullVersion']
				)
				const { brands, mobile } = phantomNavigator.userAgentData || {}
				const compressedBrands = (brands, captureVersion = false) => brands
					.filter(obj => !/Not/.test(obj.brand)).map(obj => `${obj.brand}${captureVersion ? ` ${obj.version}` : ''}`)
				const removeChromium = brands => (
					brands.length > 1 ? brands.filter(brand => !/Chromium/.test(brand)) : brands
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
				},{})
				return dataSorted
			}, 'userAgentData failed'),
			keyboard: await attempt(async () => {
				if (!('keyboard' in navigator && navigator.keyboard)) {
					return
				}
				const keys = [
					'Backquote',
					'Backslash',
					'Backspace',
					'BracketLeft',
					'BracketRight',
					'Comma',
					'Digit0',
					'Digit1',
					'Digit2',
					'Digit3',
					'Digit4',
					'Digit5',
					'Digit6',
					'Digit7',
					'Digit8',
					'Digit9',
					'Equal',
					'IntlBackslash',
					'IntlRo',
					'IntlYen',
					'KeyA',
					'KeyB',
					'KeyC',
					'KeyD',
					'KeyE',
					'KeyF',
					'KeyG',
					'KeyH',
					'KeyI',
					'KeyJ',
					'KeyK',
					'KeyL',
					'KeyM',
					'KeyN',
					'KeyO',
					'KeyP',
					'KeyQ',
					'KeyR',
					'KeyS',
					'KeyT',
					'KeyU',
					'KeyV',
					'KeyW',
					'KeyX',
					'KeyY',
					'KeyZ',
					'Minus',
					'Period',
					'Quote',
					'Semicolon',
					'Slash'
				]
				const keyoardLayoutMap = await navigator.keyboard.getLayoutMap()
				const writingSystemKeys = keys
					.reduce((acc, key) => {
						acc[key] = keyoardLayoutMap.get(key)
						return acc
					}, {})
				return writingSystemKeys
			}),
			bluetoothAvailability: await attempt(async () => {
				if (
					!('bluetooth' in phantomNavigator) ||
					!phantomNavigator.bluetooth ||
					!phantomNavigator.bluetooth.getAvailability) {
					return undefined
				}
				const available = await navigator.bluetooth.getAvailability()
				return available
			}, 'bluetoothAvailability failed'),
			mediaCapabilities: await attempt(async () => {
				const codecs = [
					'audio/ogg; codecs=vorbis',
					'audio/ogg; codecs=flac',
					'audio/mp4; codecs="mp4a.40.2"',
					'audio/mpeg; codecs="mp3"',
					'video/ogg; codecs="theora"',
					'video/mp4; codecs="avc1.42E01E"'
				]

				const getMediaConfig = (codec, video, audio) => ({
					type: 'file',
					video: !/^video/.test(codec) ? undefined : {
						contentType: codec,
						...video
					},
					audio: !/^audio/.test(codec) ? undefined : {
						contentType: codec,
						...audio
					}
				})

				const getMediaCapabilities = async () => {
					const video = {
						width: 1920,
						height: 1080,
						bitrate: 120000,
						framerate: 60
					}
					const audio = {
						channels: 2,
						bitrate: 300000,
						samplerate: 5200
					}
					try {
						const decodingInfo = codecs.map(codec => {
							const config = getMediaConfig(codec, video, audio)
							const info = navigator.mediaCapabilities.decodingInfo(config)
								.then(support => ({
									codec,
									...support
								}))
								.catch(error => console.error(codec, error))
							return info
						})
						const data = await Promise.all(decodingInfo)
							.catch(error => console.error(error))
						const codecsSupported = data.reduce((acc, support) => {
							const { codec, supported, smooth, powerEfficient } = support || {}
							if (!supported) { return acc }
							return {
								...acc,
								[codec]: [
									...(smooth ? ['smooth'] : []),
									...(powerEfficient ? ['efficient'] : [])
								]
							}
						}, {})
						return codecsSupported
					}
					catch (error) {
						return
					}
				}
				const mediaCapabilities = await getMediaCapabilities()
				return mediaCapabilities
			}, 'mediaCapabilities failed'),
		
			permissions: await attempt(async () => {
				const getPermissionState = name => navigator.permissions.query({ name })
					.then(res => ({ name, state: res.state }))
					.catch(error => ({ name, state: 'unknown' }))

				// https://w3c.github.io/permissions/#permission-registry
				const permissions = !('permissions' in navigator) ? undefined : await Promise.all([
						getPermissionState('accelerometer'),
						getPermissionState('ambient-light-sensor'),
						getPermissionState('background-fetch'),
						getPermissionState('background-sync'),
						getPermissionState('bluetooth'),
						getPermissionState('camera'),
						getPermissionState('clipboard'),
						getPermissionState('device-info'),
						getPermissionState('display-capture'),
						getPermissionState('gamepad'),
						getPermissionState('geolocation'),
						getPermissionState('gyroscope'),
						getPermissionState('magnetometer'),
						getPermissionState('microphone'),
						getPermissionState('midi'),
						getPermissionState('nfc'),
						getPermissionState('notifications'),
						getPermissionState('persistent-storage'),
						getPermissionState('push'),
						getPermissionState('screen-wake-lock'),
						getPermissionState('speaker'),
						getPermissionState('speaker-selection')
					]).then(permissions => permissions.reduce((acc, perm) => {
						const { state, name } = perm || {}
						if (acc[state]) {
							acc[state].push(name)
							return acc
						}
						acc[state] = [name]
						return acc
					}, {})).catch(error => console.error(error))
				return permissions
			}, 'permissions failed'),

			webgpu: await attempt(async () => {
				if (!('gpu' in navigator)) {
					return
				}
				const { limits, features } = await navigator.gpu.requestAdapter()

				return {
					features: [...features.values()],
					limits: (limits => {
						const data = {}
						for (const prop in limits) {
							data[prop] = limits[prop]
						}
						return data
					})(limits)
				}
			}, 'webgpu failed')
		}
		logTestResult({ start, test: 'navigator', passed: true })
		return { ...data, lied }
	}
	catch (error) {
		logTestResult({ test: 'navigator', passed: false })
		captureError(error, 'Navigator failed or blocked by client')
		return
	}
}

export const navigatorHTML = ({ fp, hashSlice, hashMini, note, modal, count, computeWindowsRelease }) => {
	if (!fp.navigator) {
		return `
		<div class="col-six undefined">
			<strong>Navigator</strong>
			<div>properties (0): ${note.blocked}</div>
			<div>codecs (0): ${note.blocked}</div>
			<div>dnt: ${note.blocked}</div>
			<div>gpc:${note.blocked}</div>
			<div>keyboard: ${note.blocked}</div>
			<div>lang: ${note.blocked}</div>
			<div>mimeTypes (0): ${note.blocked}</div>
			<div>permissions (0): ${note.blocked}</div>
			<div>plugins (0): ${note.blocked}</div>
			<div>vendor: ${note.blocked}</div>
			<div>webgpu: ${note.blocked}</div>
			<div>userAgentData:</div>
			<div class="block-text">${note.blocked}</div>
		</div>
		<div class="col-six">
			<div>device:</div>
			<div class="block-text">${note.blocked}</div>
			<div>ua parsed: ${note.blocked}</div>
			<div>userAgent:</div>
			<div class="block-text">${note.blocked}</div>
			<div>appVersion:</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
	}
	const {
		navigator: {
			$hash,
			appVersion,
			deviceMemory,
			doNotTrack,
			globalPrivacyControl,
			hardwareConcurrency,
			language,
			maxTouchPoints,
			mediaCapabilities,
			mimeTypes,
			oscpu,
			permissions,
			platform,
			plugins,
			properties,
			system,
			device,
			userAgent,
			uaPostReduction,
			userAgentData,
			userAgentParsed,
			vendor,
			keyboard,
			bluetoothAvailability,
			webgpu,
			lied
		}
	} = fp
	const id = 'creep-navigator'
	const blocked = {
		[null]: !0,
		[undefined]: !0,
		['']: !0
	}
	const codecKeys = Object.keys(mediaCapabilities || {})
	const permissionsKeys = Object.keys(permissions || {})
	const permissionsGranted = (
		permissions && permissions.granted ? permissions.granted.length : 0
	)
	return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Navigator</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>properties (${count(properties)}): ${
		modal(
			`${id}-properties`,
			properties.join(', '),
			hashMini(properties)
		)
		}</div>
		<div class="help" title="MediaCapabilities.decodingInfo()">codecs (${''+codecKeys.length}): ${
		!mediaCapabilities || !codecKeys.length ? note.unsupported :
			modal(
				`${id}-media-codecs`,
				Object.keys(mediaCapabilities).map(key => `${key}: ${mediaCapabilities[key].join(', ')}`).join('<br>'),
				hashMini(mediaCapabilities)
			)
		}</div>
		<div class="help" title="Navigator.doNotTrack">dnt: ${'' + doNotTrack}</div>
		<div class="help" title="Navigator.globalPrivacyControl">gpc: ${
		'' + globalPrivacyControl == 'undefined' ? note.unsupported : '' + globalPrivacyControl
		}</div>
		<div>keyboard: ${
		!keyboard ? note.unsupported :
			modal(
				`${id}-keyboard`,
				Object.keys(keyboard).map(key => `${key}: ${keyboard[key]}`).join('<br>'),
				hashMini(keyboard)
			)
		}</div>
		<div class="help" title="Navigator.language\nNavigator.languages">lang: ${!blocked[language] ? language : note.blocked}</div>
		<div>mimeTypes (${count(mimeTypes)}): ${
		!blocked['' + mimeTypes] ?
			modal(
				`${id}-mimeTypes`,
				mimeTypes.join('<br>'),
				hashMini(mimeTypes)
			) :
			note.blocked
		}</div>
		<div class="help" title="Permissions.query()">permissions (${''+permissionsGranted}): ${
			!permissions || !permissionsKeys ? note.unsupported : modal(
				'creep-permissions',
				permissionsKeys.map(key => `<div class="perm perm-${key}"><strong>${key}</strong>:<br>${permissions[key].join('<br>')}</div>`).join(''),
				hashMini(permissions)
			)
		}</div>
		<div>plugins (${count(plugins)}): ${
		!blocked['' + plugins] ?
			modal(
				`${id}-plugins`,
				plugins.map(plugin => plugin.name).join('<br>'),
				hashMini(plugins)
			) :
			note.blocked
		}</div>
		<div>vendor: ${!blocked[vendor] ? vendor : note.blocked}</div>
		<div>webgpu: ${!webgpu ? note.unsupported :
			modal(
				`${id}-webgpu`,
				(webgpu => {
					const { limits, features } = webgpu
					return `
					<div>
						<strong>Features</strong><br>${features.join('<br>')}
					</div>
					<div>
						<br><strong>Limits</strong><br>${Object.keys(limits).map(x => `${x}: ${limits[x]}`).join('<br>')}
					</div>
					`
				})(webgpu),
				hashMini(webgpu)
			)
		}</div>
		<div>userAgentData:</div>
		<div class="block-text help" title="Navigator.userAgentData\nNavigatorUAData.getHighEntropyValues()">
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
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text help" title="Navigator.deviceMemory\nNavigator.hardwareConcurrency\nNavigator.maxTouchPoints\nNavigator.oscpu\nNavigator.platform\nNavigator.userAgent\nBluetooth.getAvailability()">
			${oscpu ? oscpu : ''}
			${`${oscpu ? '<br>' : ''}${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : note.blocked}${
				hardwareConcurrency && deviceMemory ? `<br>cores: ${hardwareConcurrency}, ram: ${deviceMemory}` :
				hardwareConcurrency && !deviceMemory ? `<br>cores: ${hardwareConcurrency}` :
				!hardwareConcurrency && deviceMemory ? `<br>ram: ${deviceMemory}` : ''
			}${typeof maxTouchPoints != 'undefined' ? `, touch: ${''+maxTouchPoints}` : ''}${bluetoothAvailability ? `, bluetooth` : ''}
		</div>
		<div>ua parsed: ${userAgentParsed || note.blocked}</div>
		<div class="relative">userAgent:${!uaPostReduction ? '' : `<span class="confidence-note">ua reduction</span>`}</div>
		<div class="block-text">
			<div>${userAgent || note.blocked}</div>
		</div>
		<div>appVersion:</div>
		<div class="block-text">
			<div>${appVersion || note.blocked}</div>
		</div>
	</div>
	`
}