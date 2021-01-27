// special thanks to https://arh.antoinevastel.com/reports/stats/menu.html for stats
export const getNavigator = (imports, workerScope) => {

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
			logTestResult,
			getPluginLies
		}
	} = imports

	return new Promise(async resolve => {
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
					return platform
				}),
				system: attempt(() => getOS(phantomNavigator.userAgent), 'userAgent system failed'),
				device: attempt(() => getUserAgentPlatform({ userAgent: phantomNavigator.userAgent }), 'userAgent device failed'),
				userAgent: attempt(() => {
					const { userAgent } = phantomNavigator
					const navigatorUserAgent = navigator.userAgent
					detectLies('userAgent', navigatorUserAgent)
					if (!credibleUserAgent) {
						sendToTrash('userAgent', `${navigatorUserAgent} does not match appVersion`)
					}
					if (/\s{2,}|^\s|\s$/g.test(navigatorUserAgent)) {
						sendToTrash('userAgent', `extra spaces in "${navigatorUserAgent.replace(/\s{2,}|^\s|\s$/g, '[...]')}"`)
					}
					const gibbers = gibberish(navigatorUserAgent)
					if (!!gibbers.length) {	
						sendToTrash(`userAgent contains gibberish`, `[${gibbers.join(', ')}] ${navigatorUserAgent}`)	
					}
					if (userAgent != navigatorUserAgent) {
						lied = true
						const nestedIframeLie = `Expected "${navigatorUserAgent}" in nested iframe and got "${userAgent}"`
						documentLie(`Navigator.userAgent`, nestedIframeLie)
					}
					return userAgent.trim().replace(/\s{2,}/, ' ')
				}, 'userAgent failed'),
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
						sendToTrash('appVersion', `extra spaces in "${navigatorAppVersion.replace(/\s{2,}|^\s|\s$/g, '[...]')}"`)
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
						'0': true,
						'1': true, 
						'2': true,
						'4': true, 
						'6': true, 
						'8': true
					}
					trustInteger('deviceMemory - invalid return type', navigatorDeviceMemory)
					if (!trusted[navigatorDeviceMemory]) {
						sendToTrash('deviceMemory', `${navigatorDeviceMemory} is not within set [0, 1, 2, 4, 6, 8]`)
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
					detectLies('language', navigatorLanguage)
					detectLies('languages', navigatorLanguages)
					if (language != navigatorLanguage) {
						lied = true
						const nestedIframeLie = `Expected "${navigatorLanguage}" in nested iframe and got "${language}"`
						documentLie(`Navigator.language`, nestedIframeLie)
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
				plugins: attempt(() => {
					const navigatorPlugins = navigator.plugins
					const ownProperties = Object.getOwnPropertyNames(navigatorPlugins).filter(name => isNaN(+name))
					const ownPropertiesSet = new Set(ownProperties)
					const plugins = phantomNavigator.plugins
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
								sendToTrash(`plugin name contains gibberish`, `[${nameGibbers.join(', ')}] ${name}`)	
							}
							if (!!descriptionGibbers.length) {	
								sendToTrash(`plugin description contains gibberish`, `[${descriptionGibbers.join(', ')}] ${description}`)
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
				highEntropyValues: await attempt(async () => { 
					if (!('userAgentData' in phantomNavigator)) {
						return undefined
					}
					const data = await phantomNavigator.userAgentData.getHighEntropyValues(
						['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
					)
					return data
				}, 'highEntropyValues failed')
			}
			logTestResult({ start, test: 'navigator', passed: true })
			return resolve({ ...data, lied })
		}
		catch (error) {
			logTestResult({ test: 'navigator', passed: false })
			captureError(error, 'Navigator failed or blocked by client')
			return resolve(undefined)
		}
	})
}