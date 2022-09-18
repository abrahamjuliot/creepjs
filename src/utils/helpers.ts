import { PlatformClassifier } from './types'

// @ts-expect-error
export const IS_WORKER_SCOPE = !self.document && self.WorkerGlobalScope

// Detect Browser
function getEngine() {
	const x = [].constructor
	try {
		(-1).toFixed(-1)
	} catch (err) {
		return err.message.length + (x+'').split(x.name).join('').length
	}
}

const ENGINE_IDENTIFIER = getEngine()
const IS_BLINK = ENGINE_IDENTIFIER == 80
const IS_GECKO = ENGINE_IDENTIFIER == 58
const IS_WEBKIT = ENGINE_IDENTIFIER == 77
const JS_ENGINE = ({
	80: 'V8',
	58: 'SpiderMonkey',
	77: 'JavaScriptCore',
})[ENGINE_IDENTIFIER] || null

const LIKE_BRAVE = IS_BLINK && 'flat' in Array.prototype /* Chrome 69 */ && !('ReportingObserver' in self /* Brave */)

// @ts-expect-error
const LIKE_BRAVE_RESISTANCE = LIKE_BRAVE && navigator?.keyboard === null

function braveBrowser() {
	const brave = (
		'brave' in navigator &&
		// @ts-ignore
		Object.getPrototypeOf(navigator.brave).constructor.name == 'Brave' &&
		// @ts-ignore
		navigator.brave.isBrave.toString() == 'function isBrave() { [native code] }'
	)
	return brave
}

function getBraveMode() {
	const mode = {
		unknown: false,
		allow: false,
		standard: false,
		strict: false,
	}
	try {
		// strict mode adds float frequency data AnalyserNode
		const strictMode = () => {
			try {
				window.OfflineAudioContext = (
					// @ts-ignore
					OfflineAudioContext || webkitOfflineAudioContext
				)
			} catch (err) { }

			if (!window.OfflineAudioContext) {
				return false
			}
			const context = new OfflineAudioContext(1, 1, 44100)
			const analyser = context.createAnalyser()
			const data = new Float32Array(analyser.frequencyBinCount)
			analyser.getFloatFrequencyData(data)
			const strict = new Set(data).size > 1 // native only has -Infinity
			return strict
		}

		if (strictMode()) {
			mode.strict = true
			return mode
		}
		// standard and strict mode do not have chrome plugins
		const chromePlugins = /(Chrom(e|ium)|Microsoft Edge) PDF (Plugin|Viewer)/
		const pluginsList = [...navigator.plugins]
		const hasChromePlugins = pluginsList
			.filter((plugin) => chromePlugins.test(plugin.name)).length == 2
		if (pluginsList.length && !hasChromePlugins) {
			mode.standard = true
			return mode
		}
		mode.allow = true
		return mode
	} catch (e) {
		mode.unknown = true
		return mode
	}
}

const getBraveUnprotectedParameters = (parameters) => {
	const blocked = new Set([
		'FRAGMENT_SHADER.HIGH_FLOAT.precision',
		'FRAGMENT_SHADER.HIGH_FLOAT.rangeMax',
		'FRAGMENT_SHADER.HIGH_FLOAT.rangeMin',
		'FRAGMENT_SHADER.HIGH_INT.precision',
		'FRAGMENT_SHADER.HIGH_INT.rangeMax',
		'FRAGMENT_SHADER.HIGH_INT.rangeMin',
		'FRAGMENT_SHADER.LOW_FLOAT.precision',
		'FRAGMENT_SHADER.LOW_FLOAT.rangeMax',
		'FRAGMENT_SHADER.LOW_FLOAT.rangeMin',
		'FRAGMENT_SHADER.MEDIUM_FLOAT.precision',
		'FRAGMENT_SHADER.MEDIUM_FLOAT.rangeMax',
		'FRAGMENT_SHADER.MEDIUM_FLOAT.rangeMin',
		'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_COMBINED_UNIFORM_BLOCKS',
		'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
		'MAX_DRAW_BUFFERS_WEBGL',
		'MAX_FRAGMENT_INPUT_COMPONENTS',
		'MAX_FRAGMENT_UNIFORM_BLOCKS',
		'MAX_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_TEXTURE_MAX_ANISOTROPY_EXT',
		'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
		'MAX_UNIFORM_BUFFER_BINDINGS',
		'MAX_VARYING_COMPONENTS',
		'MAX_VERTEX_OUTPUT_COMPONENTS',
		'MAX_VERTEX_UNIFORM_BLOCKS',
		'MAX_VERTEX_UNIFORM_COMPONENTS',
		'SHADING_LANGUAGE_VERSION',
		'UNMASKED_RENDERER_WEBGL',
		'UNMASKED_VENDOR_WEBGL',
		'VERSION',
		'VERTEX_SHADER.HIGH_FLOAT.precision',
		'VERTEX_SHADER.HIGH_FLOAT.rangeMax',
		'VERTEX_SHADER.HIGH_FLOAT.rangeMin',
		'VERTEX_SHADER.HIGH_INT.precision',
		'VERTEX_SHADER.HIGH_INT.rangeMax',
		'VERTEX_SHADER.HIGH_INT.rangeMin',
		'VERTEX_SHADER.LOW_FLOAT.precision',
		'VERTEX_SHADER.LOW_FLOAT.rangeMax',
		'VERTEX_SHADER.LOW_FLOAT.rangeMin',
		'VERTEX_SHADER.MEDIUM_FLOAT.precision',
		'VERTEX_SHADER.MEDIUM_FLOAT.rangeMax',
		'VERTEX_SHADER.MEDIUM_FLOAT.rangeMin',
	])
	const safeParameters = Object.keys(parameters).reduce((acc, curr) => {
		if (blocked.has(curr)) {
			return acc
		}
		acc[curr] = parameters[curr]
		return acc
	}, {})
	return safeParameters
}


// system
const getOS = (userAgent) => {
	const os = (
		// order is important
		/windows phone/ig.test(userAgent) ? 'Windows Phone' :
			/win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
				/android/ig.test(userAgent) ? 'Android' :
					/cros/ig.test(userAgent) ? 'Chrome OS' :
						/linux/ig.test(userAgent) ? 'Linux' :
							/ipad/ig.test(userAgent) ? 'iPad' :
								/iphone/ig.test(userAgent) ? 'iPhone' :
									/ipod/ig.test(userAgent) ? 'iPod' :
										/ios/ig.test(userAgent) ? 'iOS' :
											/mac/ig.test(userAgent) ? 'Mac' :
												'Other'
	)
	return os
}

function getReportedPlatform(userAgent: string, platform?: string): PlatformClassifier[] {
	// user agent os lie
		const userAgentOS = (
			// order is important
			/win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? PlatformClassifier.WINDOWS :
				/android|linux|cros/ig.test(userAgent) ? PlatformClassifier.LINUX :
					/(i(os|p(ad|hone|od)))|mac/ig.test(userAgent) ? PlatformClassifier.APPLE :
						PlatformClassifier.OTHER
		)

		if (!platform) return [userAgentOS]

		const platformOS = (
			// order is important
			/win/ig.test(platform) ? PlatformClassifier.WINDOWS :
				/android|arm|linux/ig.test(platform) ? PlatformClassifier.LINUX :
					/(i(os|p(ad|hone|od)))|mac/ig.test(platform) ? PlatformClassifier.APPLE :
						PlatformClassifier.OTHER
		)
		return [userAgentOS, platformOS]
}
const { userAgent: navUserAgent, platform: navPlatform } = self.navigator || {}
const [USER_AGENT_OS, PLATFORM_OS] = getReportedPlatform(navUserAgent, navPlatform)

const decryptUserAgent = ({ ua, os, isBrave }) => {
	const apple = /ipad|iphone|ipod|ios|mac/ig.test(os)
	const isOpera = /OPR\//g.test(ua)
	const isVivaldi = /Vivaldi/g.test(ua)
	const isDuckDuckGo = /DuckDuckGo/g.test(ua)
	const isYandex = /YaBrowser/g.test(ua)
	const paleMoon = ua.match(/(palemoon)\/(\d+)./i)
	const edge = ua.match(/(edgios|edg|edge|edga)\/(\d+)./i)
	const edgios = edge && /edgios/i.test(edge[1])
	const chromium = ua.match(/(crios|chrome)\/(\d+)./i)
	const firefox = ua.match(/(fxios|firefox)\/(\d+)./i)
	const likeSafari = (
		/AppleWebKit/g.test(ua) &&
		/Safari/g.test(ua)
	)
	const safari = (
		likeSafari &&
		!firefox &&
		!chromium &&
		!edge &&
		ua.match(/(version)\/(\d+)\.(\d|\.)+\s(mobile|safari)/i)
	)

	if (chromium) {
		const browser = chromium[1]
		const version = chromium[2]
		const like = (
			isOpera ? ' Opera' :
				isVivaldi ? ' Vivaldi' :
					isDuckDuckGo ? ' DuckDuckGo' :
						isYandex ? ' Yandex' :
							edge ? ' Edge' :
								isBrave ? ' Brave' : ''
		)
		return `${browser} ${version}${like}`
	} else if (edgios) {
		const browser = edge[1]
		const version = edge[2]
		return `${browser} ${version}`
	} else if (firefox) {
		const browser = paleMoon ? paleMoon[1] : firefox[1]
		const version = paleMoon ? paleMoon[2] : firefox[2]
		return `${browser} ${version}`
	} else if (apple && safari) {
		const browser = 'Safari'
		const version = safari[2]
		return `${browser} ${version}`
	}
	return 'unknown'
}


const getUserAgentPlatform = ({ userAgent, excludeBuild = true }) => {
	if (!userAgent) {
		return 'unknown'
	}

	// patterns
	const nonPlatformParenthesis = /\((khtml|unlike|vizio|like gec|internal dummy|org\.eclipse|openssl|ipv6|via translate|safari|cardamon).+|xt\d+\)/ig
	const parenthesis = /\((.+)\)/
	const android = /((android).+)/i
	const androidNoise = /^(linux|[a-z]|wv|mobile|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|windows|(rv:|trident|webview|iemobile).+/i
	const androidBuild = /build\/.+\s|\sbuild\/.+/i
	const androidRelease = /android( |-)\d+/i
	const windows = /((windows).+)/i
	const windowsNoise = /^(windows|ms(-|)office|microsoft|compatible|[a-z]|x64|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|outlook|ms(-|)office|microsoft|trident|\.net|msie|httrack|media center|infopath|aol|opera|iemobile|webbrowser).+/i
	const windows64bitCPU = /w(ow|in)64/i
	const cros = /cros/i
	const crosNoise = /^([a-z]|x11|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|trident).+/i
	const crosBuild = /\d+\.\d+\.\d+/i
	const linux = /linux|x11|ubuntu|debian/i
	const linuxNoise = /^([a-z]|x11|unknown|compatible|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|java|oracle|\+http|http|unknown|mozilla|konqueror|valve).+/i
	const apple = /(cpu iphone|cpu os|iphone os|mac os|macos|intel os|ppc mac).+/i
	const appleNoise = /^([a-z]|macintosh|compatible|mimic|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2}|rv|\d+\.\d+)$|(rv:|silk|valve).+/i
	const appleRelease = /(ppc |intel |)(mac|mac |)os (x |x|)(\d{2}(_|\.)\d{1,2}|\d{2,})/i
	const otherOS = /((symbianos|nokia|blackberry|morphos|mac).+)|\/linux|freebsd|symbos|series \d+|win\d+|unix|hp-ux|bsdi|bsd|x86_64/i

	const isDevice = (list, device) => list.filter((x) => device.test(x)).length

	userAgent = userAgent.trim().replace(/\s{2,}/, ' ').replace(nonPlatformParenthesis, '')

	if (parenthesis.test(userAgent)) {
		const platformSection = userAgent.match(parenthesis)[0]
		const identifiers = platformSection.slice(1, -1).replace(/,/g, ';').split(';').map((x) => x.trim())

		if (isDevice(identifiers, android)) {
			return identifiers
				// @ts-ignore
				.map((x) => androidRelease.test(x) ? androidRelease.exec(x)[0].replace('-', ' ') : x)
				.filter((x) => !(androidNoise.test(x)))
				.join(' ')
				.replace((excludeBuild ? androidBuild : ''), '')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, windows)) {
			return identifiers
				.filter((x) => !(windowsNoise.test(x)))
				.join(' ')
				.replace(/\sNT (\d+\.\d+)/, (match, version) => {
					return (
						version == '10.0' ? ' 10' :
							version == '6.3' ? ' 8.1' :
								version == '6.2' ? ' 8' :
									version == '6.1' ? ' 7' :
										version == '6.0' ? ' Vista' :
											version == '5.2' ? ' XP Pro' :
												version == '5.1' ? ' XP' :
													version == '5.0' ? ' 2000' :
														version == '4.0' ? match :
															' ' + version
					)
				})
				.replace(windows64bitCPU, '(64-bit)')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, cros)) {
			return identifiers
				.filter((x) => !(crosNoise.test(x)))
				.join(' ')
				.replace((excludeBuild ? crosBuild : ''), '')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, linux)) {
			return identifiers
				.filter((x) => !(linuxNoise.test(x)))
				.join(' ')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, apple)) {
			return identifiers
				.map((x) => {
					if (appleRelease.test(x)) {
						// @ts-ignore
						const release = appleRelease.exec(x)[0]
						const versionMap = {
							'10_7': 'Lion',
							'10_8': 'Mountain Lion',
							'10_9': 'Mavericks',
							'10_10': 'Yosemite',
							'10_11': 'El Capitan',
							'10_12': 'Sierra',
							'10_13': 'High Sierra',
							'10_14': 'Mojave',
							'10_15': 'Catalina',
							'11': 'Big Sur',
							'12': 'Monterey',
							'13': 'Ventura',
						}
						const version = (
							(/(\d{2}(_|\.)\d{1,2}|\d{2,})/.exec(release) || [])[0] ||
							''
						).replace(/\./g, '_')
						const isOSX = /^10/.test(version)
						const id = isOSX ? version : (/^\d{2,}/.exec(version) || [])[0]
						const codeName = versionMap[id]
						return codeName ? `macOS ${codeName}` : release
					}
					return x
				})
				.filter((x) => !(appleNoise.test(x)))
				.join(' ')
				.replace(/\slike mac.+/ig, '')
				.trim().replace(/\s{2,}/, ' ')
		} else {
			const other = identifiers.filter((x) => otherOS.test(x))
			if (other.length) {
				return other.join(' ').trim().replace(/\s{2,}/, ' ')
			}
			return identifiers.join(' ')
		}
	} else {
		return 'unknown'
	}
}

const computeWindowsRelease = ({ platform, platformVersion, fontPlatformVersion }) => {
	if ((platform != 'Windows') || !(IS_BLINK && CSS.supports('accent-color', 'initial'))) {
		return
	}
	const platformVersionNumber = +(/(\d+)\./.exec(platformVersion)||[])[1]

	// https://github.com/WICG/ua-client-hints/issues/220#issuecomment-870858413
	// https://docs.microsoft.com/en-us/microsoft-edge/web-platform/how-to-detect-win11
	// https://docs.microsoft.com/en-us/microsoft-edge/web-platform/user-agent-guidance
	const release: Record<string, string> = {
		'0.1.0': '7',
		'0.2.0': '8',
		'0.3.0': '8.1',
		'1.0.0': '10 (1507)',
		'2.0.0': '10 (1511)',
		'3.0.0': '10 (1607)',
		'4.0.0': '10 (1703)',
		'5.0.0': '10 (1709)',
		'6.0.0': '10 (1803)',
		'7.0.0': '10 (1809)',
		'8.0.0': '10 (1903|1909)',
		'10.0.0': '10 (2004|20H2|21H1)',
		'11.0.0': '10',
		'12.0.0': '10',
	}

	const oldFontPlatformVersionNumber = (/7|8\.1|8/.exec(fontPlatformVersion)||[])[0]
	const version = (
		platformVersionNumber >= 13 ? '11' :
			platformVersionNumber == 0 && oldFontPlatformVersionNumber ? oldFontPlatformVersionNumber :
				(release[platformVersion] || 'Unknown')
	)
	return (
		`Windows ${version} [${platformVersion}]`
	)
}

// attempt windows 11 userAgent
const attemptWindows11UserAgent = ({ userAgent, userAgentData, fontPlatformVersion }) => {
	const { platformVersion, platform } = userAgentData || {}
	// @ts-ignore
	const windowsRelease = computeWindowsRelease({ platform, platformVersion })
	return (
		/Windows 11/.test(''+windowsRelease) || /Windows 11/.test(fontPlatformVersion) ?
		(''+userAgent).replace('Windows NT 10.0', 'Windows 11') :
			userAgent
	)
}

// attempt restore from User-Agent Reduction
const isUAPostReduction = (userAgent) => {
	const matcher = /Mozilla\/5\.0 \((Macintosh; Intel Mac OS X 10_15_7|Windows NT 10\.0; Win64; x64|(X11; (CrOS|Linux) x86_64)|(Linux; Android 10(; K|)))\) AppleWebKit\/537\.36 \(KHTML, like Gecko\) Chrome\/\d+\.0\.0\.0( Mobile|) Safari\/537\.36/
	const unifiedPlatform = (matcher.exec(userAgent)||[])[1]
	return IS_BLINK && !!unifiedPlatform
}

const getUserAgentRestored = ({ userAgent, userAgentData, fontPlatformVersion }) => {
	if (!userAgentData/* || !isUAPostReduction(userAgent)*/) {
		return
	}
	const { brands, uaFullVersion, platformVersion, model: deviceModel, bitness } = userAgentData

	const isGoogleChrome = (
		/X11; CrOS/.test(userAgent) ||
		!!(brands || []).find((x) => x == 'Google Chrome')
	)
	const versionNumber = +(/(\d+)\./.exec(platformVersion)||[])[1]
	const windowsFontVersion = (/8\.1|8|7/.exec(fontPlatformVersion) || [])[0]
	const windowsVersion = (
		versionNumber >= 13 ? '11' :
		versionNumber == 0 ? (windowsFontVersion || '7/8/8.1') : '10'
	)
	const windowsVersionMap = {
		'7': 'NT 6.1',
		'8': 'NT 6.2',
		'8.1': 'NT 6.3',
		'10': 'NT 10.0',
	}
	const macVersion = platformVersion.replace(/\./g, '_')
	const userAgentRestored = userAgent
		.replace(/(Chrome\/)([^\s]+)/, (match, p1, p2) => `${p1}${isGoogleChrome ? uaFullVersion : p2}`)
		.replace(/Windows NT 10.0/, `Windows ${windowsVersionMap[windowsVersion] || windowsVersion}`)
		.replace(/(X11; CrOS x86_64)/, (match, p1) => `${p1} ${platformVersion}`)
		.replace(/(Linux; Android )(10)(; K|)/, (match, p1, p2, p3) => {
			return `${p1}${versionNumber}${
				!p3 ? '' : deviceModel ? `; ${deviceModel}` : '; K'
			}`
		})
		.replace(/(Macintosh; Intel Mac OS X )(10_15_7)/, (match, p1) => {
			const isOSX = /^10/.test(macVersion)
			return `${isOSX ? p1 : p1.replace('X ', '')}${macVersion}`
		})
		.replace(/(; Win64; x64| x86_64)/, (match, p1) => bitness === '64' ? p1 : '')

	return userAgentRestored
}

const createPerformanceLogger = () => {
	const log: Record<string, string> = {}
	let total = 0
	return {
		logTestResult: ({ test, passed, time = 0 }) => {
			total += time
			const timeString = `${time.toFixed(2)}ms`
			log[test] = timeString
			const color = passed ? '#4cca9f' : 'lightcoral'
			const result = passed ? 'passed' : 'failed'
			const symbol = passed ? '✔' : '-'
			return console.log(
				`%c${symbol}${
				time ? ` (${timeString})` : ''
				} ${test} ${result}`, `color:${color}`,
			)
		},
		getLog: () => log,
		getTotal: () => total,
	}
}
const performanceLogger = createPerformanceLogger()
const { logTestResult } = performanceLogger

const getPromiseRaceFulfilled = async ({
	promise,
	responseType,
	limit = 1000,
}) => {
	const slowPromise = new Promise((resolve) => setTimeout(resolve, limit))
	const response = await Promise.race([slowPromise, promise])
		.then((response) => response instanceof responseType ? response : 'pending')
		.catch((error) => 'rejected')
	return (
		response == 'rejected' || response == 'pending' ? undefined : response
	)
}

const createTimer = () => {
	let start = 0
	const log = []
	return {
		stop: () => {
			if (start) {
				log.push(performance.now() - start)
				return log.reduce((acc, n) => acc += n, 0)
			}
			return start
		},
		start: () => {
			start = performance.now()
			return start
		},
	}
}

const queueEvent = (timer, delay = 0) => {
	timer.stop()
	return new Promise((resolve) => setTimeout(() => resolve(timer.start()), delay))
		.catch((e) => { })
}

const formatEmojiSet = (emojiSet, limit = 3) => {
	const maxLen = (limit * 2) + 3
	const list = (emojiSet || [])
	return list.length > maxLen ? `${emojiSet.slice(0, limit).join('')}...${emojiSet.slice(-limit).join('')}` :
		list.join('')
}

const EMOJIS = [
	[128512], [9786], [129333, 8205, 9794, 65039], [9832], [9784], [9895], [8265], [8505], [127987, 65039, 8205, 9895, 65039], [129394], [9785], [9760], [129489, 8205, 129456], [129487, 8205, 9794, 65039], [9975], [129489, 8205, 129309, 8205, 129489], [9752], [9968], [9961], [9972], [9992], [9201], [9928], [9730], [9969], [9731], [9732], [9976], [9823], [9937], [9000], [9993], [9999],

	[128105, 8205, 10084, 65039, 8205, 128139, 8205, 128104],
	[128104, 8205, 128105, 8205, 128103, 8205, 128102],
	[128104, 8205, 128105, 8205, 128102],

	// android 11
	[128512],
	[169], [174], [8482],
	[128065, 65039, 8205, 128488, 65039],

	// other
	[10002], [9986], [9935], [9874], [9876], [9881], [9939], [9879], [9904], [9905], [9888], [9762], [9763], [11014], [8599], [10145], [11013], [9883], [10017], [10013], [9766], [9654], [9197], [9199], [9167], [9792], [9794], [10006], [12336], [9877], [9884], [10004], [10035], [10055], [9724], [9642], [10083], [10084], [9996], [9757], [9997], [10052], [9878], [8618], [9775], [9770], [9774], [9745], [10036], [127344], [127359],
].map((emojiCode) => String.fromCodePoint(...emojiCode))

const CSS_FONT_FAMILY = `
	'Segoe Fluent Icons',
	'Ink Free',
	'Bahnschrift',
	'Segoe MDL2 Assets',
	'HoloLens MDL2 Assets',
	'Leelawadee UI',
	'Javanese Text',
	'Segoe UI Emoji',
	'Aldhabi',
	'Gadugi',
	'Myanmar Text',
	'Nirmala UI',
	'Lucida Console',
	'Cambria Math',
	'Bai Jamjuree',
	'Chakra Petch',
	'Charmonman',
	'Fahkwang',
	'K2D',
	'Kodchasan',
	'KoHo',
	'Sarabun',
	'Srisakdi',
	'Galvji',
	'MuktaMahee Regular',
	'InaiMathi Bold',
	'American Typewriter Semibold',
	'Futura Bold',
	'SignPainter-HouseScript Semibold',
	'PingFang HK Light',
	'Kohinoor Devanagari Medium',
	'Luminari',
	'Geneva',
	'Helvetica Neue',
	'Droid Sans Mono',
	'Dancing Script',
	'Roboto',
	'Ubuntu',
	'Liberation Mono',
	'Source Code Pro',
	'DejaVu Sans',
	'OpenSymbol',
	'Chilanka',
	'Cousine',
	'Arimo',
	'Jomolhari',
	'MONO',
	'Noto Color Emoji',
	sans-serif !important
`

const hashSlice = (x) => !x ? x : x.slice(0, 8)

const ANALYSIS: Record<string, unknown> = {}

export { IS_BLINK, IS_GECKO, IS_WEBKIT, JS_ENGINE, LIKE_BRAVE, LIKE_BRAVE_RESISTANCE, ENGINE_IDENTIFIER, braveBrowser, getBraveMode, getBraveUnprotectedParameters, getOS, getReportedPlatform, USER_AGENT_OS, PLATFORM_OS, decryptUserAgent, getUserAgentPlatform, computeWindowsRelease, attemptWindows11UserAgent, isUAPostReduction, getUserAgentRestored, logTestResult, performanceLogger, getPromiseRaceFulfilled, queueEvent, createTimer, formatEmojiSet, EMOJIS, CSS_FONT_FAMILY, hashSlice, ANALYSIS }
