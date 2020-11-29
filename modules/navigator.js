// special thanks to https://arh.antoinevastel.com/reports/stats/menu.html for stats
export const getNavigator = (imports, workerScope) => {

	const {
		require: {
			getOS,
			hashify,
			hashMini,
			captureError,
			attempt,
			caniuse,
			gibberish,
			sendToTrash,
			trustInteger,
			documentLie,
			lieProps,
			contentWindow,
			hyperNestedIframeWindow,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
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

			const contentWindowNavigator = contentWindow ? contentWindow.navigator : navigator
			const detectLies = (name, value) => {
				const workerScopeValue = caniuse(() => workerScope, [name])
				const workerScopeMatchLie = { fingerprint: '', lies: [{ ['does not match worker scope']: false }] }
				if (workerScopeValue) {
					if (name == 'userAgent') {
						const navigatorUserAgent = value
						const system = getOS(navigatorUserAgent)
						if (workerScope.system != system) {
							lied = true
							documentLie(`Navigator.${name}`, system, workerScopeMatchLie)
						}
						if (workerScope.userAgent != navigatorUserAgent) {
							lied = true
							documentLie(`Navigator.${name}`, navigatorUserAgent, workerScopeMatchLie)
						}
						return value
					}
					else if (name != 'userAgent' && workerScopeValue != value) {
						lied = true
						documentLie(`Navigator.${name}`, value, workerScopeMatchLie)
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
					const { platform } = contentWindowNavigator
					const navigatorPlatform = navigator.platform
					const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11']
					const trusted = typeof navigatorPlatform == 'string' && systems.filter(val => navigatorPlatform.toLowerCase().includes(val))[0]
					detectLies('platform', navigatorPlatform)
					if (!trusted) {
						sendToTrash(`platform`, `${navigatorPlatform} is unusual`)
					}
					if (platform != navigatorPlatform) {
						lied = true
						const nestedIframeLie = {
							fingerprint: '',
							lies: [{ [`Expected "${navigatorPlatform}" in nested iframe and got "${platform}"`]: true }]
						}
						documentLie(`Navigator.platform`, hashMini({platform, navigatorPlatform}), nestedIframeLie)
					}
					return platform
				}),
				system: attempt(() => getOS(contentWindowNavigator.userAgent), 'userAgent system failed'),
				userAgent: attempt(() => {
					const { userAgent } = contentWindowNavigator
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
						const nestedIframeLie = {
							fingerprint: '',
							lies: [{ [`Expected "${navigatorUserAgent}" in nested iframe and got "${userAgent}"`]: true }]
						}
						documentLie(`Navigator.userAgent`, hashMini({userAgent, navigatorUserAgent}), nestedIframeLie)
					}
					return userAgent.trim().replace(/\s{2,}/, ' ')
				}, 'userAgent failed'),
				appVersion: attempt(() => {
					const { appVersion } = contentWindowNavigator
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
						const nestedIframeLie = {
							fingerprint: '',
							lies: [{ [`Expected "${navigatorAppVersion}" in nested iframe and got "${appVersion}"`]: true }]
						}
						documentLie(`Navigator.appVersion`, hashMini({appVersion, navigatorAppVersion}), nestedIframeLie)
					}
					return appVersion.trim().replace(/\s{2,}/, ' ')
				}, 'appVersion failed'),
				deviceMemory: attempt(() => {
					if (!('deviceMemory' in navigator)) {
						return undefined
					}
					const { deviceMemory } = contentWindowNavigator
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
						const nestedIframeLie = {
							fingerprint: '',
							lies: [{ [`Expected ${navigatorDeviceMemory} in nested iframe and got ${deviceMemory}`]: true }]
						}
						documentLie(`Navigator.deviceMemory`, hashMini({deviceMemory, navigatorDeviceMemory}), nestedIframeLie)
					}
					return deviceMemory
				}, 'deviceMemory failed'),
				doNotTrack: attempt(() => {
					const { doNotTrack } = contentWindowNavigator
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
						hyperNestedIframeWindow ?
						hyperNestedIframeWindow.navigator.hardwareConcurrency :
						contentWindowNavigator.hardwareConcurrency
					)
					const navigatorHardwareConcurrency = navigator.hardwareConcurrency
					detectLies('hardwareConcurrency', navigatorHardwareConcurrency)
					trustInteger('hardwareConcurrency - invalid return type', navigatorHardwareConcurrency)
					if (hardwareConcurrency != navigatorHardwareConcurrency) {
						lied = true
						const nestedIframeLie = {
							fingerprint: '',
							lies: [{ [`Expected ${navigatorHardwareConcurrency} in nested iframe and got ${hardwareConcurrency}`]: true }]
						}
						documentLie(`Navigator.hardwareConcurrency`, hashMini({hardwareConcurrency, navigatorHardwareConcurrency}), nestedIframeLie)
					}
					return hardwareConcurrency
				}, 'hardwareConcurrency failed'),
				language: attempt(() => {
					const { language, languages } = contentWindowNavigator
					const navigatorLanguage = navigator.language
					const navigatorLanguages = navigator.languages
					detectLies('language', navigatorLanguage)
					detectLies('languages', navigatorLanguages)
					if (language != navigatorLanguage) {
						lied = true
						const nestedIframeLie = {
							fingerprint: '',
							lies: [{ [`Expected "${navigatorLanguage}" in nested iframe and got "${language}"`]: true }]
						}
						documentLie(`Navigator.language`, hashMini({language, navigatorLanguage}), nestedIframeLie)
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
					const { maxTouchPoints } = contentWindowNavigator
					const navigatorMaxTouchPoints = navigator.maxTouchPoints	
					if (maxTouchPoints != navigatorMaxTouchPoints) {	
						lied = true
						const nestedIframeLie = {
							fingerprint: '',
							lies: [{ [`Expected ${navigatorMaxTouchPoints} in nested iframe and got ${maxTouchPoints}`]: true }]
						}
						documentLie(`Navigator.maxTouchPoints`, hashMini({maxTouchPoints, navigatorMaxTouchPoints}), nestedIframeLie)	
					}

					return maxTouchPoints
				}, 'maxTouchPoints failed'),
				vendor: attempt(() => {
					const { vendor } = contentWindowNavigator
					const navigatorVendor = navigator.vendor
					if (vendor != navigatorVendor) {
						lied = true
						const nestedIframeLie = {
							fingerprint: '',
							lies: [{ [`Expected "${navigatorVendor}" in nested iframe and got "${vendor}"`]: true }]
						}
						documentLie(`Navigator.vendor`, hashMini({vendor, navigatorVendor}), nestedIframeLie)
					}
					return vendor
				}, 'vendor failed'),
				mimeTypes: attempt(() => {
					const mimeTypes = contentWindowNavigator.mimeTypes
					return mimeTypes ? [...mimeTypes].map(m => m.type) : []
				}, 'mimeTypes failed'),
				plugins: attempt(() => {
					const navigatorPlugins = navigator.plugins
					const ownProperties = Object.getOwnPropertyNames(navigatorPlugins).filter(name => isNaN(+name))
					const ownPropertiesSet = new Set(ownProperties)
					const plugins = contentWindowNavigator.plugins
					const response = plugins ? [...contentWindowNavigator.plugins]
						.map(p => ({
							name: p.name,
							description: p.description,
							filename: p.filename,
							version: p.version
						})) : []

					const mimeTypesDescriptions = new Set([...navigator.mimeTypes].map(mime => mime.description))
					mimeTypesDescriptions.delete('')
					const mimeTypesDescriptionsString = `${[...mimeTypesDescriptions].join(', ')}`
					const pluginsList = [...navigator.plugins].filter(plugin => plugin.description != '')
					const validPluginList = pluginsList.filter(plugin => !!caniuse(() => plugin[0].description))
					
					const mimeTypePluginNames = ''+[...new Set([...navigator.mimeTypes].map(mimeType => mimeType.enabledPlugin.name))].sort()
					const rawPluginNames = ''+[...new Set([...navigator.plugins].map(plugin => plugin.name))].sort()
					if (mimeTypePluginNames != rawPluginNames) {
						lied = true
						const pluginsLie = {
							fingerprint: '',
							lies: [{ [`Expected MimeType Plugins to match Plugins: "${mimeTypePluginNames}" should match "${rawPluginNames}"`]: true }]
						}
						documentLie(`Navigator.plugins`, hashMini({mimeTypePluginNames, rawPluginNames}), pluginsLie)
					}

					const nonMimetypePlugins = pluginsList
						.filter(plugin => !caniuse(() => plugin[0].description))
						.map(plugin => plugin.description)
					if (!!nonMimetypePlugins.length) {
						lied = true
						const pluginsLie = {
							fingerprint: '',
							lies: [{ [`Expected a MimeType object in plugins [${nonMimetypePlugins.join(', ')}]`]: true }]
						}
						documentLie(`Navigator.plugins`, hashMini(nonMimetypePlugins), pluginsLie)
					}

					const nonMatchingMimetypePlugins = validPluginList
						.filter(plugin => plugin[0].description != plugin.description)
						.map(plugin => [plugin.description, plugin[0].description])
					if (!!nonMatchingMimetypePlugins.length) {
						lied = true
						const pluginsLie = {
							fingerprint: '',
							lies: [{ [`Expected plugin MimeType description to match plugin description: ${
								nonMatchingMimetypePlugins
									.map(description => `${description[0]} should match ${description[1]}`)
									.join(', ')
							}`]: true }]
						}
						documentLie(`Navigator.plugins`, hashMini(nonMatchingMimetypePlugins), pluginsLie)
					}
					
					const invalidPrototypeMimeTypePlugins = validPluginList
						.filter(plugin => !mimeTypesDescriptions.has(plugin[0].description))
						.map(plugin => [plugin[0].description, mimeTypesDescriptionsString])
					if (!!invalidPrototypeMimeTypePlugins.length) {
						lied = true
						const pluginsLie = {
							fingerprint: '',
							lies: [{ [`Expected plugin MimeType description to match a MimeType description: ${
								invalidPrototypeMimeTypePlugins
									.map(description => `${description[0]} is not in [${description[1]}]`)
									.join(', ')
							}`]: true }]
						}
						documentLie(`Navigator.plugins`, hashMini(invalidPrototypeMimeTypePlugins), pluginsLie)
					}
					
					const invalidMimetypePlugins = validPluginList
						.filter(plugin => !mimeTypesDescriptions.has(plugin.description))
						.map(plugin => [plugin.description, mimeTypesDescriptionsString])
					if (!!invalidMimetypePlugins.length) {
						lied = true
						const pluginsLie = {
							fingerprint: '',
							lies: [{ [`Expected plugin description to match a MimeType description: ${
								invalidMimetypePlugins
									.map(description => `${description[0]} is not in [${description[1]}]`)
									.join(', ')
							}`]: true }]
						}
						documentLie(`Navigator.plugins`, hashMini(invalidMimetypePlugins), pluginsLie)
					}

					if (!!response.length) {	
						response.forEach(plugin => {	
							const { name, description } = plugin

							if (!ownPropertiesSet.has(name)) {
								lied = true
								const pluginsLie = {
									fingerprint: '',
									lies: [{ [`Expected name "${name}" in plugins own properties and got [${ownProperties.join(', ')}]`]: true }]
								}
								documentLie(`Navigator.plugins`, hashMini(ownProperties), pluginsLie)
							}

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
					const keys = Object.keys(Object.getPrototypeOf(contentWindowNavigator))
					return keys
				}, 'navigator keys failed'),
				highEntropyValues: await attempt(async () => { 
					if (!('userAgentData' in contentWindowNavigator)) {
						return undefined
					}
					const data = await contentWindowNavigator.userAgentData.getHighEntropyValues(
						['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
					)
					return data
				}, 'highEntropyValues failed')
			}
			const $hash = await hashify(data)
			logTestResult({ test: 'navigator', passed: true })
			return resolve({ ...data, lied, $hash })
		}
		catch (error) {
			logTestResult({ test: 'navigator', passed: false })
			captureError(error, 'Navigator failed or blocked by client')
			return resolve(undefined)
		}
	})
}