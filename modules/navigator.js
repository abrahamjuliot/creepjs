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
			logTestResult,
			getPluginLies
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
				if (!('userAgentData' in phantomNavigator) || !phantomNavigator.userAgentData) {
					return undefined
				}
				const data = await phantomNavigator.userAgentData.getHighEntropyValues(
					['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
				)
				const { brands, mobile } = phantomNavigator.userAgentData || {}
				if (!data.brands) {
					data.brands = brands
				}
				if (!data.mobile) {
					data.mobile = mobile
				}
				const dataSorted = Object.keys(data).sort().reduce((acc, key) => {
					acc[key] = data[key]
					return acc
				},{})
				return dataSorted
			}, 'highEntropyValues failed'),
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
				if (!('bluetooth' in phantomNavigator) || !phantomNavigator.bluetooth) {
					return undefined
				}
				const available = await navigator.bluetooth.getAvailability()
				return available
			}, 'bluetoothAvailability failed'),
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


export const navigatorHTML = ({ fp, hashSlice, hashMini, note, modal, count }) => {
	if (!fp.navigator) {
		return `
		<div class="col-six undefined">
			<strong>Navigator</strong>
			<div>properties (0): ${note.blocked}</div>
			<div>bluetooth: ${note.blocked}</div>
			<div>deviceMemory: ${note.blocked}</div>
			<div>doNotTrack: ${note.blocked}</div>
			<div>globalPrivacyControl:${note.blocked}</div>
			<div>hardwareConcurrency: ${note.blocked}</div>
			<div>keyboard: ${note.blocked}</div>
			<div>language: ${note.blocked}</div>
			<div>maxTouchPoints: ${note.blocked}</div>
			<div>mimeTypes (0): ${note.blocked}</div>
			<div>platform: ${note.blocked}</div>
			<div>plugins (0): ${note.blocked}</div>
			<div>system: ${note.blocked}</div>
			<div>ua architecture: ${note.blocked}</div>
			<div>ua model: ${note.blocked}</div>
			<div>ua platform: ${note.blocked}</div>
			<div>ua platformVersion: ${note.blocked}</div>
			<div>ua uaFullVersion: ${note.blocked}</div>
			<div>vendor: ${note.blocked}</div>
		</div>
		<div class="col-six">
			<div>device:</div>
			<div class="block-text">${note.blocked}</div>
			<div>userAgent:</div>
			<div class="block-text">${note.blocked}</div>
			<div>appVersion:</div>
			<div class="block-text">${note.blocked}</div>
			<div>oscpu:</div>
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
			highEntropyValues,
			language,
			maxTouchPoints,
			mimeTypes,
			oscpu,
			platform,
			plugins,
			properties,
			system,
			device,
			userAgent,
			vendor,
			keyboard,
			bluetoothAvailability,
			lied
		}
	} = fp
	const id = 'creep-navigator'
	const blocked = {
		[null]: !0,
		[undefined]: !0,
		['']: !0
	}
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
		<div>bluetooth: ${
			typeof bluetoothAvailability == 'undefined' ? note.unsupported : 
			!bluetoothAvailability ? 'unavailable' : 'available'
		}</div>
		<div>deviceMemory: ${!blocked[deviceMemory] ? deviceMemory : note.blocked}</div>
		<div>doNotTrack: ${''+doNotTrack}</div>
		<div>globalPrivacyControl: ${
			''+globalPrivacyControl == 'undefined' ? note.unsupported : ''+globalPrivacyControl
		}</div>
		<div>hardwareConcurrency: ${!blocked[hardwareConcurrency] ? hardwareConcurrency : note.blocked}</div>
		<div>keyboard: ${
			!keyboard ? note.unsupported :
			modal(
				`${id}-keyboard`,
				Object.keys(keyboard).map(key => `${key}: ${keyboard[key]}`).join('<br>'),
				hashMini(keyboard)
			)
		}</div>
		<div>language: ${!blocked[language] ? language : note.blocked}</div>
		<div>maxTouchPoints: ${!blocked[maxTouchPoints] ? ''+maxTouchPoints : note.blocked}</div>
		<div>mimeTypes (${count(mimeTypes)}): ${
			!blocked[''+mimeTypes] ? 
			modal(
				`${id}-mimeTypes`,
				mimeTypes.join('<br>'),
				hashMini(mimeTypes)
			) :
			note.blocked
		}</div>
		<div>platform: ${!blocked[platform] ? platform : note.blocked}</div>
		<div>plugins (${count(plugins)}): ${
			!blocked[''+plugins] ?
			modal(
				`${id}-plugins`,
				plugins.map(plugin => plugin.name).join('<br>'),
				hashMini(plugins)
			) :
			note.blocked
		}</div>
		<div>system: ${system}</div>
		${highEntropyValues ?  
			Object.keys(highEntropyValues).map(key => {
				const value = highEntropyValues[key]
				if (key == 'brands' && value && value.length) {
					const brands = value.filter(obj => !/Not;A Brand/.test(obj.brand)).map(obj => `${obj.brand} ${obj.version}`)
					const primaryBrands = brands.length > 1 ? brands.filter(brand => !/Chromium/.test(brand)) : brands
					return `<div>ua brand: ${primaryBrands.join(',')}</div>`
				}
				return `<div>ua ${key}: ${''+value != 'undefined' && value !== '' ? ''+value : note.unsupported}</div>`
			}).join('') : `
			<div>ua architecture: ${note.unsupported}</div>
			<div>ua brand: ${note.unsupported}</div>
			<div>ua mobile: ${note.unsupported}</div>
			<div>ua model: ${note.unsupported}</div>
			<div>ua platform: ${note.unsupported}</div>
			<div>ua platformVersion: ${note.unsupported}</div>
			<div>ua uaFullVersion: ${note.unsupported} </div>`
		}
		<div>vendor: ${!blocked[vendor] ? vendor : note.blocked}</div>
	</div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text">
			<div>${!blocked[device] ? device : note.blocked}</div>
		</div>
		<div>userAgent:</div>
		<div class="block-text">
			<div>${!blocked[userAgent] ? userAgent : note.blocked}</div>
		</div>
		<div>appVersion:</div>
		<div class="block-text">
			<div>${!blocked[appVersion] ? appVersion : note.blocked}</div>
		</div>
		<div>oscpu:</div>
		<div class="block-text">
			<div>${!blocked[oscpu] ? oscpu : note.unsupported}</div>
		</div>
	</div>
	`	
}