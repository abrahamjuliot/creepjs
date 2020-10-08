// special thanks to https://arh.antoinevastel.com/reports/stats/menu.html for stats
export const getNavigator = (imports, workerScope) => {

	const {
		require: {
			getOS,
			hashify,
			patch,
			html,
			note,
			count,
			modal,
			captureError,
			attempt,
			caniuse,
			sendToTrash,
			gibberish,
			trustInteger,
			documentLie,
			lieProps,
			contentWindow
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
			)

			const contentWindowNavigator = contentWindow ? contentWindow.navigator : navigator
			const navigatorPrototype = attempt(() => Navigator.prototype)
			const detectLies = (name, value) => {
				const workerScopeValue = caniuse(() => workerScope, [name])
				const workerScopeMatchLie = { fingerprint: '', lies: [{ ['does not match worker scope']: false }] }
				if (workerScopeValue) {
					if (name == 'userAgent') {
						const system = getOS(value)
						if (workerScope.system != system) {
							lied = true
							documentLie(`Navigator.${name}`, system, workerScopeMatchLie)
							return value
						}
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
						sendToTrash('platform', `[${navigatorPlatform}] does not match iframe`)
					}
					return platform
				}),
				system: attempt(() => getOS(contentWindowNavigator.userAgent), 'userAgent system failed'),
				userAgent: attempt(() => {
					const { userAgent } = contentWindowNavigator
					const navigatorUserAgent = navigator.userAgent
					const gibbers = gibberish(navigatorUserAgent)
					detectLies('userAgent', navigatorUserAgent)
					if (!!gibbers.length) {
						sendToTrash(`userAgent contains gibberish`, `[${gibbers.join(', ')}] ${navigatorUserAgent}`)
					}
					if (!credibleUserAgent) {
						sendToTrash('userAgent', `${navigatorUserAgent} does not match appVersion`)
					}
					if (userAgent != navigatorUserAgent) {
						sendToTrash('userAgent', `[${navigatorUserAgent}] does not match iframe`)
					}
					return userAgent
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
					if (appVersion != navigatorAppVersion) {
						sendToTrash('appVersion', `[${navigatorAppVersion}] does not match iframe`)
					}
					return appVersion
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
						sendToTrash('deviceMemory', `[${navigatorDeviceMemory}] does not match iframe`)
					}
					return deviceMemory
				}, 'deviceMemory failed'),
				doNotTrack: attempt(() => {
					const { doNotTrack } = contentWindowNavigator
					const navigatorDoNotTrack = navigator.doNotTrack
					const trusted = {
						'1': true,
						'true': true, 
						'yes': true,
						'0': true, 
						'false': true, 
						'no': true, 
						'unspecified': true, 
						'null': true,
						'undefined': true
					}
					if (!trusted[navigatorDoNotTrack]) {
						sendToTrash('doNotTrack - unusual result', navigatorDoNotTrack)
					}
					return doNotTrack
				}, 'doNotTrack failed'),
				hardwareConcurrency: attempt(() => {
					if (!('hardwareConcurrency' in navigator)) {
						return undefined
					}
					const { hardwareConcurrency } = contentWindowNavigator
					const navigatorHardwareConcurrency = navigator.hardwareConcurrency
					detectLies('hardwareConcurrency', navigatorHardwareConcurrency)
					trustInteger('hardwareConcurrency - invalid return type', navigatorHardwareConcurrency)
					if (hardwareConcurrency != navigatorHardwareConcurrency) {
						sendToTrash('hardwareConcurrency', `[${navigatorHardwareConcurrency}] does not match iframe`)
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
						sendToTrash('language', `[${navigatorLanguage}] does not match iframe`)
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
						sendToTrash('maxTouchPoints', `[${navigatorMaxTouchPoints}] does not match iframe`)
					}
					return maxTouchPoints
				}, 'maxTouchPoints failed'),
				vendor: attempt(() => {
					const { vendor } = contentWindowNavigator
					const navigatorVendor = navigator.vendor
					if (vendor != navigatorVendor) {
						sendToTrash('vendor', `[${navigatorVendor}] does not match iframe`)
					}
					return vendor
				}, 'vendor failed'),
				mimeTypes: attempt(() => {
					const mimeTypes = contentWindowNavigator.mimeTypes
					return mimeTypes ? [...mimeTypes].map(m => m.type) : []
				}, 'mimeTypes failed'),
				plugins: attempt(() => {
					const plugins = contentWindowNavigator.plugins
					const response = plugins ? [...contentWindowNavigator.plugins]
						.map(p => ({
							name: p.name,
							description: p.description,
							filename: p.filename,
							version: p.version
						})) : []
					
					if (!!response.length) {
						response.forEach(plugin => {
							const { name } = plugin
							const gibbers = gibberish(name)
							if (!!gibbers.length) {
								sendToTrash(`plugin contains gibberish`, `[${gibbers.join(', ')}] ${name}`)
							}
							return
						})
					}
					return response
				}, 'mimeTypes failed'),
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
			resolve({ ...data, $hash })
			const id = 'creep-navigator'
			const el = document.getElementById(id)
			const { mimeTypes, plugins, highEntropyValues, properties } = data
			const blocked = {
				[null]: true,
				[undefined]: true,
				['']: true
			}
			return patch(el, html`
			<div>
				<strong>Navigator</strong>
				<div class="ellipsis">hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
				${
					Object.keys(data).map(key => {
						const skip = [
							'mimeTypes',
							'plugins',
							'properties',
							'highEntropyValues'
						].indexOf(key) > -1
						const ua = [
							'appVersion',
							'userAgent'
						].indexOf(key) > -1
						const value = data[key]
						return (
							!skip && !ua ? `<div>${key}: ${!blocked[value] ? value : key == 'doNotTrack' ? value : note.blocked}</div>` : 
							!skip ? `
								<div>${key}:</div>
								<div class="user-agent">
									<div>${!blocked[value] ? value : note.blocked}</div>
								</div>
							` : ''
						)
					}).join('')
				}
				<div>plugins (${count(plugins)}): ${!blocked[''+plugins] ? modal(`${id}-plugins`, plugins.map(plugin => plugin.name).join('<br>')) : note.blocked}</div>
				<div>mimeTypes (${count(mimeTypes)}): ${!blocked[''+mimeTypes] ? modal(`${id}-mimeTypes`, mimeTypes.join('<br>')): note.blocked}</div>
				${highEntropyValues ?  
					Object.keys(highEntropyValues).map(key => {
						const value = highEntropyValues[key]
						return `<div class="ellipsis">ua ${key}: ${value ? value : note.blocked}</div>`
					}).join('') :
					`<div class="ellipsis">ua architecture: ${note.unsupported}</div>
					<div class="ellipsis">ua model: ${note.unsupported}</div>
					<div class="ellipsis">ua platform: ${note.unsupported}</div>
					<div class="ellipsis">ua platformVersion: ${note.unsupported}</div>
					<div class="ellipsis">ua uaFullVersion: ${note.unsupported} </div>`
				}
				<div>properties (${count(properties)}): ${modal(`${id}-properties`, properties.join(', '))}</div>
			</div>
			`)
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}