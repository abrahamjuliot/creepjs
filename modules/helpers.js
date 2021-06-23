// Detect Browser
const mathPI = 3.141592653589793
const isChrome = mathPI ** -100 == 1.9275814160560204e-50
const isFirefox = mathPI ** -100 == 1.9275814160560185e-50

const braveBrowser = async () => {
	const brave = (
		'brave' in navigator &&
		Object.getPrototypeOf(navigator.brave).constructor.name == 'Brave' &&
		navigator.brave.isBrave.toString() == 'function isBrave() { [native code] }'
	)
	if (brave) {
		return true
	}
	const chromium = 3.141592653589793 ** -100 == 1.9275814160560204e-50
	const storageQuotaIs2Gb = (
		'storage' in navigator && navigator.storage ?
		(2147483648 == (await navigator.storage.estimate()).quota) :
		false
	)
	return chromium && storageQuotaIs2Gb
}

function getBraveMode() {
	const mode = {
		unknown: false,
		allow: false,
		standard: false,
		strict: false
	}
	try {
		// strict mode adds float frequency data AnalyserNode
		const strictMode = () => {
			const audioContext = (
				'OfflineAudioContext' in window ? OfflineAudioContext : 
				'webkitOfflineAudioContext' in window ? webkitOfflineAudioContext :
				undefined
			)
			if (!audioContext) {
				return false
			}
			const context = new audioContext(1, 1, 44100)
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
			.filter(plugin => chromePlugins.test(plugin.name)).length == 2
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

// system
const getOS = userAgent => {
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
const appleRelease = /(ppc |intel |)(mac|mac |)os (x |x|)\d+/i
const otherOS = /((symbianos|nokia|blackberry|morphos|mac).+)|\/linux|freebsd|symbos|series \d+|win\d+|unix|hp-ux|bsdi|bsd|x86_64/i
const extraSpace = /\s{2,}/

const isDevice = (list, device) => list.filter(x => device.test(x)).length

const getUserAgentPlatform = ({ userAgent, excludeBuild = true }) => {
	if (!userAgent) {
		return 'unknown'
	}
	userAgent = userAgent.trim().replace(/\s{2,}/, ' ').replace(nonPlatformParenthesis, '')
	if (parenthesis.test(userAgent)) {
		const platformSection = userAgent.match(parenthesis)[0]
		const identifiers = platformSection.slice(1, -1).replace(/,/g, ';').split(';').map(x => x.trim())

		if (isDevice(identifiers, android)) {
			return identifiers
				.map(x => androidRelease.test(x) ? androidRelease.exec(x)[0].replace('-', ' ') : x)
				.filter(x => !(androidNoise.test(x)))
				.join(' ')
				.replace((excludeBuild ? androidBuild : ''), '')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, windows)) {
			return identifiers
				.filter(x => !(windowsNoise.test(x)))
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
				.filter(x => !(crosNoise.test(x)))
				.join(' ')
				.replace((excludeBuild ? crosBuild : ''), '')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, linux)) {
			return identifiers
				.filter(x => !(linuxNoise.test(x)))
				.join(' ')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, apple)) {
			return identifiers
				.map(x => appleRelease.test(x) ? appleRelease.exec(x)[0] : x)
				.filter(x => !(appleNoise.test(x)))
				.join(' ')
				.replace(/\slike mac.+/ig, '')
				.trim().replace(/\s{2,}/, ' ')
		} else {
			const other = identifiers.filter(x => otherOS.test(x))
			if (other.length) {
				return other.join(' ').trim().replace(/\s{2,}/, ' ')
			}
			return identifiers.join(' ')
		}
	} else {
		return 'unknown'
	}
}

const logTestResult = ({ test, passed, start = false }) => {
	const color = passed ? '#4cca9f' : 'lightcoral'
	const result = passed ? 'passed' : 'failed'
	const symbol = passed ? '✔' : '-'
	return console.log(
		`%c${symbol}${
		start ? ` (${(performance.now() - start).toFixed(2)}ms)` : ''
		} ${test} ${result}`, `color:${color}`
	)
}

const getPromiseRaceFulfilled = async ({
	promise,
	responseType,
	limit = 1000
}) => {
	const slowPromise = new Promise(resolve => setTimeout(resolve, limit))
	const response = await Promise.race([slowPromise, promise])
		.then(response => response instanceof responseType ? response : 'pending')
		.catch(error => 'rejected')
	return (
		response == 'rejected' || response == 'pending' ? undefined : response
	)
}

export { isChrome, braveBrowser, getBraveMode, isFirefox, getOS, decryptUserAgent, getUserAgentPlatform, logTestResult, getPromiseRaceFulfilled }
