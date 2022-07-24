import { attempt, caniuse, captureError } from './captureErrors.js'
import { hashMini } from './crypto.js'
import { createTimer, queueEvent, getOS, braveBrowser, decryptUserAgent, getUserAgentPlatform, isUAPostReduction, logTestResult, computeWindowsRelease, hashSlice, performanceLogger } from './helpers.js'
import { HTMLNote, count, modal } from './html.js'
import { lieProps, documentLie, getPluginLies } from './lies.js'
import { sendToTrash, gibberish } from './trash.js'

// special thanks to https://arh.antoinevastel.com/reports/stats/menu.html for stats
export default async function getNavigator() {
	try {
		const timer = createTimer()
		await queueEvent(timer)
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

		const credibleUserAgent = (
			'chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true
		)
		const data = {
			platform: attempt(() => {
				const { platform } = navigator
				const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11']
				const trusted = typeof platform == 'string' && systems.filter((val) => platform.toLowerCase().includes(val))[0]

				if (!trusted) {
					sendToTrash(`platform`, `${platform} is unusual`)
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
						`${platformOS} platform and ${userAgentOS} user agent do not match`,
					)
				}

				return platform
			}),
			system: attempt(() => getOS(navigator.userAgent), 'userAgent system failed'),
			userAgentParsed: await attempt(async () => {
				const reportedUserAgent = caniuse(() => navigator.userAgent)
				const reportedSystem = getOS(reportedUserAgent)
				const isBrave = await braveBrowser()
				const report = decryptUserAgent({
					ua: reportedUserAgent,
					os: reportedSystem,
					isBrave,
				})
				return report
			}),
			device: attempt(() => getUserAgentPlatform({ userAgent: navigator.userAgent }), 'userAgent device failed'),
			userAgent: attempt(() => {
				const { userAgent } = navigator

				if (!credibleUserAgent) {
					sendToTrash('userAgent', `${userAgent} does not match appVersion`)
				}
				if (/\s{2,}|^\s|\s$/g.test(userAgent)) {
					sendToTrash('userAgent', `extra spaces detected`)
				}
				const gibbers = gibberish(userAgent)
				if (!!gibbers.length) {
					sendToTrash(`userAgent is gibberish`, userAgent)
				}

				return userAgent.trim().replace(/\s{2,}/, ' ')
			}, 'userAgent failed'),
			uaPostReduction: isUAPostReduction((navigator || {}).userAgent),
			appVersion: attempt(() => {
				const { appVersion } = navigator

				if (!credibleUserAgent) {
					sendToTrash('appVersion', `${appVersion} does not match userAgent`)
				}
				if ('appVersion' in navigator && !appVersion) {
					sendToTrash('appVersion', 'Living Standard property returned falsy value')
				}
				if (/\s{2,}|^\s|\s$/g.test(appVersion)) {
					sendToTrash('appVersion', `extra spaces detected`)
				}

				return appVersion.trim().replace(/\s{2,}/, ' ')
			}, 'appVersion failed'),
			deviceMemory: attempt(() => {
				if (!('deviceMemory' in navigator)) {
					return undefined
				}
				// @ts-ignore
				const { deviceMemory } = navigator
				const trusted = {
					'0.25': true,
					'0.5': true,
					'1': true,
					'2': true,
					'4': true,
					'8': true,
				}
				if (!trusted[deviceMemory]) {
					sendToTrash('deviceMemory', `${deviceMemory} is not a valid value [0.25, 0.5, 1, 2, 4, 8]`)
				}
				return deviceMemory
			}, 'deviceMemory failed'),
			doNotTrack: attempt(() => {
				const { doNotTrack } = navigator
				const trusted = {
					'1': !0,
					'true': !0,
					'yes': !0,
					'0': !0,
					'false': !0,
					'no': !0,
					'unspecified': !0,
					'null': !0,
					'undefined': !0,
				}
				if (!trusted[doNotTrack]) {
					sendToTrash('doNotTrack - unusual result', doNotTrack)
				}
				return doNotTrack
			}, 'doNotTrack failed'),
			globalPrivacyControl: attempt(() => {
				if (!('globalPrivacyControl' in navigator)) {
					return undefined
				}
				// @ts-ignore
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
					'undefined': !0,
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
				return navigator.hardwareConcurrency
			}, 'hardwareConcurrency failed'),
			language: attempt(() => {
				const { language, languages } = navigator
				const lang = ('' + language).split(',')[0]
				let currencyLanguage
				try {
					currencyLanguage = (1).toLocaleString((lang || undefined), {
						style: 'currency',
						currency: 'USD',
						currencyDisplay: 'name',
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					})
				} catch (e) { }
				const currencyLocale = (1).toLocaleString(undefined, {
					style: 'currency',
					currency: 'USD',
					currencyDisplay: 'name',
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				})

				const languageLie = currencyLocale != currencyLanguage
				if (languageLie) {
					lied = true
					documentLie(
						`Navigator.language`,
						`${currencyLocale} locale and ${currencyLanguage} language do not match`,
					)
				}

				if (language && languages) {
					// @ts-ignore
					const lang = /^.{0,2}/g.exec(language)[0]
					// @ts-ignore
					const langs = /^.{0,2}/g.exec(languages[0])[0]
					if (langs != lang) {
						sendToTrash('language/languages', `${[language, languages].join(' ')} mismatch`)
					}
					return `${languages.join(', ')} (${language})`
				}

				return `${language} ${languages}`
			}, 'language(s) failed'),
			maxTouchPoints: attempt(() => {
				if (!('maxTouchPoints' in navigator)) {
					return null
				}
				return navigator.maxTouchPoints
			}, 'maxTouchPoints failed'),
			vendor: attempt(() => navigator.vendor, 'vendor failed'),
			mimeTypes: attempt(() => {
				const { mimeTypes } = navigator
				return mimeTypes ? [...mimeTypes].map((m) => m.type) : []
			}, 'mimeTypes failed'),
			// @ts-ignore
			oscpu: attempt(() => navigator.oscpu, 'oscpu failed'),
			plugins: attempt(() => {
				// https://html.spec.whatwg.org/multipage/system-state.html#pdf-viewing-support
				const { plugins } = navigator
				if (!(plugins instanceof PluginArray)) {
					return
				}
				const response = plugins ? [...plugins]
					.map((p) => ({
						name: p.name,
						description: p.description,
						filename: p.filename,
						// @ts-ignore
						version: p.version,
					})) : []

				const { lies } = getPluginLies(plugins, navigator.mimeTypes)
				if (lies.length) {
					lied = true
					lies.forEach((lie) => {
						return documentLie(`Navigator.plugins`, lie)
					})
				}

				if (response.length) {
					response.forEach((plugin) => {
						const { name, description } = plugin
						const nameGibbers = gibberish(name)
						const descriptionGibbers = gibberish(description)
						if (nameGibbers.length) {
							sendToTrash(`plugin name is gibberish`, name)
						}
						if (descriptionGibbers.length) {
							sendToTrash(`plugin description is gibberish`, description)
						}
						return
					})
				}
				return response
			}, 'plugins failed'),
			properties: attempt(() => {
				const keys = Object.keys(Object.getPrototypeOf(navigator))
				return keys
			}, 'navigator keys failed'),
		}

		const getUserAgentData = () => attempt(async () => {
			// @ts-ignore
			if (!navigator.userAgentData ||
				// @ts-ignore
				!navigator.userAgentData.getHighEntropyValues) {
				return
			}
			// @ts-ignore
			const data = await navigator.userAgentData.getHighEntropyValues(
				['platform', 'platformVersion', 'architecture', 'bitness', 'model', 'uaFullVersion'],
			)
			// @ts-ignore
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
		}, 'userAgentData failed')

		const getBluetoothAvailability = () => attempt(() => {
			if (
				!('bluetooth' in navigator) ||
				// @ts-ignore
				!navigator.bluetooth ||
				// @ts-ignore
				!navigator.bluetooth.getAvailability) {
				return undefined
			}
			// @ts-ignore
			return navigator.bluetooth.getAvailability()
		}, 'bluetoothAvailability failed')

		const getPermissions = () => attempt(async () => {
			const getPermissionState = (name) => navigator.permissions.query({ name })
				.then((res) => ({ name, state: res.state }))
				.catch((error) => ({ name, state: 'unknown' }))

			// https://w3c.github.io/permissions/#permission-registry
			const permissions = !('permissions' in navigator) ? undefined : Promise.all([
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
					getPermissionState('speaker-selection'),
				]).then((permissions) => permissions.reduce((acc, perm) => {
					const { state, name } = perm || {}
					if (acc[state]) {
						acc[state].push(name)
						return acc
					}
					acc[state] = [name]
					return acc
				}, {})).catch((error) => console.error(error))
			return permissions
		}, 'permissions failed')

		const getWebgpu = () => attempt(async () => {
			if (!('gpu' in navigator)) {
				return
			}
			// @ts-ignore
			const { limits, features } = await navigator.gpu.requestAdapter()

			return {
				features: [...features.values()],
				limits: ((limits) => {
					const data = {}
					// eslint-disable-next-line guard-for-in
					for (const prop in limits) {
						data[prop] = limits[prop]
					}
					return data
				})(limits),
			}
		}, 'webgpu failed')

		// @ts-ignore
		const [
			userAgentData,
			bluetoothAvailability,
			permissions,
			webgpu,
		] = await Promise.all([
			getUserAgentData(),
			getBluetoothAvailability(),
			getPermissions(),
			getWebgpu(),
		]).catch((error) => console.error(error))
		logTestResult({ time: timer.stop(), test: 'navigator', passed: true })
		return {
			...data,
			userAgentData,
			bluetoothAvailability,
			permissions,
			webgpu,
			lied,
		}
	} catch (error) {
		logTestResult({ test: 'navigator', passed: false })
		captureError(error, 'Navigator failed or blocked by client')
		return
	}
}

export function navigatorHTML(fp) {
	if (!fp.navigator) {
		return `
		<div class="col-six undefined">
			<strong>Navigator</strong>
			<div>properties (0): ${HTMLNote.BLOCKED}</div>
			<div>dnt: ${HTMLNote.BLOCKED}</div>
			<div>gpc:${HTMLNote.BLOCKED}</div>
			<div>lang: ${HTMLNote.BLOCKED}</div>
			<div>mimeTypes (0): ${HTMLNote.BLOCKED}</div>
			<div>permissions (0): ${HTMLNote.BLOCKED}</div>
			<div>plugins (0): ${HTMLNote.BLOCKED}</div>
			<div>vendor: ${HTMLNote.BLOCKED}</div>
			<div>webgpu: ${HTMLNote.BLOCKED}</div>
			<div>userAgentData:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>
		<div class="col-six">
			<div>device:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>ua parsed: ${HTMLNote.BLOCKED}</div>
			<div>userAgent:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>appVersion:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
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
			bluetoothAvailability,
			webgpu,
			lied,
		},
	} = fp
	const id = 'creep-navigator'
	const blocked = {
		['null']: !0,
		['undefined']: !0,
		['']: !0,
	}
	const permissionsKeys = Object.keys(permissions || {})
	const permissionsGranted = (
		permissions && permissions.granted ? permissions.granted.length : 0
	)
	return `
	<span class="time">${performanceLogger.getLog().navigator}</span>
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Navigator</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>properties (${count(properties)}): ${
		modal(
			`${id}-properties`,
			properties.join(', '),
			hashMini(properties),
		)
		}</div>
		<div class="help" title="Navigator.doNotTrack">dnt: ${'' + doNotTrack}</div>
		<div class="help" title="Navigator.globalPrivacyControl">gpc: ${
		'' + globalPrivacyControl == 'undefined' ? HTMLNote.UNSUPPORTED : '' + globalPrivacyControl
		}</div>
		<div class="help" title="Navigator.language\nNavigator.languages">lang: ${!blocked[language] ? language : HTMLNote.BLOCKED}</div>
		<div>mimeTypes (${count(mimeTypes)}): ${
		!blocked['' + mimeTypes] ?
			modal(
				`${id}-mimeTypes`,
				mimeTypes.join('<br>'),
				hashMini(mimeTypes),
			) :
			HTMLNote.BLOCKED
		}</div>
		<div class="help" title="Permissions.query()">permissions (${''+permissionsGranted}): ${
			!permissions || !permissionsKeys ? HTMLNote.UNSUPPORTED : modal(
				'creep-permissions',
				permissionsKeys.map((key) => `<div class="perm perm-${key}"><strong>${key}</strong>:<br>${permissions[key].join('<br>')}</div>`).join(''),
				hashMini(permissions),
			)
		}</div>
		<div>plugins (${count(plugins)}): ${
		!blocked['' + plugins] ?
			modal(
				`${id}-plugins`,
				plugins.map((plugin) => plugin.name).join('<br>'),
				hashMini(plugins),
			) :
			HTMLNote.BLOCKED
		}</div>
		<div>vendor: ${!blocked[vendor] ? vendor : HTMLNote.BLOCKED}</div>
		<div>webgpu: ${!webgpu ? HTMLNote.UNSUPPORTED :
			modal(
				`${id}-webgpu`,
				((webgpu) => {
					const { limits, features } = webgpu
					return `
					<div>
						<strong>Features</strong><br>${features.join('<br>')}
					</div>
					<div>
						<br><strong>Limits</strong><br>${Object.keys(limits).map((x) => `${x}: ${limits[x]}`).join('<br>')}
					</div>
					`
				})(webgpu),
				hashMini(webgpu),
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
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text help" title="Navigator.deviceMemory\nNavigator.hardwareConcurrency\nNavigator.maxTouchPoints\nNavigator.oscpu\nNavigator.platform\nNavigator.userAgent\nBluetooth.getAvailability()">
			${oscpu ? oscpu : ''}
			${`${oscpu ? '<br>' : ''}${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : HTMLNote.BLOCKED}${
				hardwareConcurrency && deviceMemory ? `<br>cores: ${hardwareConcurrency}, ram: ${deviceMemory}` :
				hardwareConcurrency && !deviceMemory ? `<br>cores: ${hardwareConcurrency}` :
				!hardwareConcurrency && deviceMemory ? `<br>ram: ${deviceMemory}` : ''
			}${typeof maxTouchPoints != 'undefined' ? `, touch: ${''+maxTouchPoints}` : ''}${bluetoothAvailability ? `, bluetooth` : ''}
		</div>
		<div>ua parsed: ${userAgentParsed || HTMLNote.BLOCKED}</div>
		<div class="relative">userAgent:${!uaPostReduction ? '' : `<span class="confidence-note">ua reduction</span>`}</div>
		<div class="block-text">
			<div>${userAgent || HTMLNote.BLOCKED}</div>
		</div>
		<div>appVersion:</div>
		<div class="block-text">
			<div>${appVersion || HTMLNote.BLOCKED}</div>
		</div>
	</div>
	`
}
