const detectChromium = () => (
	Math.acos(0.123) == 1.4474840516030247 &&
	Math.acosh(Math.SQRT2) == 0.881373587019543 &&
	Math.atan(2) == 1.1071487177940904 &&
	Math.atanh(0.5) == 0.5493061443340548 &&
	Math.cbrt(Math.PI) == 1.4645918875615231 &&
	Math.cos(21 * Math.LN2) == -0.4067775970251724 &&
	Math.cosh(492 * Math.LOG2E) == 9.199870313877772e+307 &&
	Math.expm1(1) == 1.718281828459045 &&
	Math.hypot(6 * Math.PI, -100) == 101.76102278593319 &&
	Math.log10(Math.PI) == 0.4971498726941338 &&
	Math.sin(Math.PI) == 1.2246467991473532e-16 &&
	Math.sinh(Math.PI) == 11.548739357257748 &&
	Math.tan(10 * Math.LOG2E) == -3.3537128705376014 &&
	Math.tanh(0.123) == 0.12238344189440875 &&
	Math.pow(Math.PI, -100) == 1.9275814160560204e-50
)

const getNewObjectToStringTypeErrorLie = apiFunction => {
	try {
		const you = () => Object.create(apiFunction).toString()
		const cant = () => you()
		const hide = () => cant()
		hide()
		// error must throw
		return true
	} catch (error) {
		const stackLines = error.stack.split('\n')
		const validScope = !/at Object\.apply/.test(stackLines[1])
		// Stack must be valid
		const validStackSize = (
			error.constructor.name == 'TypeError' && stackLines.length >= 5
		)
		// Chromium must throw error 'at Function.toString'... and not 'at Object.apply'
		const isChromium = 'chrome' in window || detectChromium()
		if (validStackSize && isChromium && (
			!validScope ||
			!/at Function\.toString/.test(stackLines[1]) ||
			!/at you/.test(stackLines[2]) ||
			!/at cant/.test(stackLines[3]) ||
			!/at hide/.test(stackLines[4])
		)) {
			return true
		}
		return !validStackSize
	}
}


export const getHeadlessFeatures = async (imports, workerScope) => {

	const {
		require: {
			parentPhantom,
			hashMini,
			isChrome,
			captureError,
			logTestResult
		}
	} = imports

	try {
		const start = performance.now()
		const isChromium = detectChromium() || isChrome
		const mimeTypes = Object.keys({ ...navigator.mimeTypes })
		const data = {
			chromium: isChromium,
			likeHeadless: {
				['trust token feature is disabled']: (
					!('hasTrustToken' in document) ||
					!('trustTokenOperationError' in XMLHttpRequest.prototype) ||
					!('setTrustToken' in XMLHttpRequest.prototype) ||
					!('trustToken' in HTMLIFrameElement.prototype)
				),
				['navigator.webdriver is on']: 'webdriver' in navigator && !!navigator.webdriver,
				['chrome plugins array is empty']: isChromium && navigator.plugins.length === 0,
				['chrome mimeTypes array is empty']: isChromium && mimeTypes.length === 0,
				['notification permission is denied']: isChromium && Notification.permission == 'denied',
				['chrome system color ActiveText is rgb(255, 0, 0)']: isChromium && (() => {
					let rendered = parentPhantom
					if (!parentPhantom) {
						rendered = document.createElement('div')
						document.body.appendChild(rendered)
					}
					rendered.setAttribute('style', `background-color: ActiveText`)
					const { backgroundColor: activeText } = getComputedStyle(rendered)
					if (!parentPhantom) {
						rendered.parentNode.removeChild(rendered)
					}
					return activeText === 'rgb(255, 0, 0)'
				})(parentPhantom),
				['prefers light color scheme']: matchMedia('(prefers-color-scheme: light)').matches
			},
			headless: {
				['chrome window.chrome is undefined']: isChromium && !('chrome' in window),
				['chrome permission state is inconsistent']: isChromium && await (async () => {
					const res = await navigator.permissions.query({ name: 'notifications' })
					return (
						res.state == 'prompt' && Notification.permission === 'denied'
					)
				})(),
				['userAgent contains HeadlessChrome']: (
					/HeadlessChrome/.test(navigator.userAgent) ||
					/HeadlessChrome/.test(navigator.appVersion)
				),
				['worker userAgent contains HeadlessChrome']: !!workerScope && (
					/HeadlessChrome/.test(workerScope.userAgent)
				)
			},
			stealth: {
				['srcdoc throws an error']: (() => {
					try {
						const { srcdoc } = document.createElement('iframe')
						return !!srcdoc
					}
					catch (error) {
						return true
					}
				})(),
				['srcdoc triggers a window Proxy']: (() => {
					const iframe = document.createElement('iframe')
					iframe.srcdoc = '' + hashMini(crypto.getRandomValues(new Uint32Array(10)))
					return !!iframe.contentWindow
				})(),
				['index of chrome is too high']: (() => {
					const control = (
						'cookieStore' in window ? 'cookieStore' :
							'ondevicemotion' in window ? 'ondevicemotion' :
								'speechSynthesis'
					)
					const propsInWindow = []
					for (const prop in window) { propsInWindow.push(prop) }
					const chromeIndex = propsInWindow.indexOf('chrome')
					const controlIndex = propsInWindow.indexOf(control)
					return chromeIndex > controlIndex
				})(),
				['chrome.runtime functions are invalid']: (() => {
					if (!('chrome' in window && 'runtime' in chrome)) {
						return false
					}
					try {
						if ('prototype' in chrome.runtime.sendMessage ||
							'prototype' in chrome.runtime.connect) {
							return true
						}
						new chrome.runtime.sendMessage
						new chrome.runtime.connect
						return true
					}
					catch (error) {
						return error.constructor.name != 'TypeError' ? true : false
					}
				})(),
				['Permissions.prototype.query leaks Proxy behavior']: (() => {
					try {
						class Blah extends Permissions.prototype.query { }
						return true
					}
					catch (error) {
						return /\[object Function\]/.test(error.message)
					}
				})(),
				['Function.prototype.toString leaks Proxy behavior']: (() => {
					try {
						class Blah extends Function.prototype.toString { }
						return true
					}
					catch (error) {
						return /\[object Function\]/.test(error.message)
					}
				})(),
				['Function.prototype.toString has invalid TypeError']: (() => {
					const liedToString = (
						getNewObjectToStringTypeErrorLie(Function.prototype.toString) ||
						getNewObjectToStringTypeErrorLie(() => { })
					)
					return liedToString
				})()
			}
		}

		const { likeHeadless, headless, stealth } = data
		const likeHeadlessKeys = Object.keys(likeHeadless)
		const headlessKeys = Object.keys(headless)
		const stealthKeys = Object.keys(stealth)

		const likeHeadlessRating = +((likeHeadlessKeys.filter(key => likeHeadless[key]).length / likeHeadlessKeys.length) * 100).toFixed(0)
		const headlessRating = +((headlessKeys.filter(key => headless[key]).length / headlessKeys.length) * 100).toFixed(0)
		const stealthRating = +((stealthKeys.filter(key => stealth[key]).length / stealthKeys.length) * 100).toFixed(0)

		logTestResult({ start, test: 'headless', passed: true })
		return { ...data, likeHeadlessRating, headlessRating, stealthRating }
	}
	catch (error) {
		logTestResult({ test: 'headless', passed: false })
		captureError(error)
		return
	}
}

export const headlesFeaturesHTML = ({ fp, modal, note, hashMini, hashSlice }) => {
	if (!fp.headless) {
		return `
		<div class="col-six">
			<strong>Headless</strong>
			<div>chromium: ${note.blocked}</div>
			<div>0% like headless: ${note.blocked}</div>
			<div>0% headless: ${note.blocked}</div>
			<div>0% stealth: ${note.blocked}</div>
		</div>`
	}
	const {
		headless: data
	} = fp
	const {
		$hash,
		chromium,
		likeHeadless,
		likeHeadlessRating,
		headless,
		headlessRating,
		stealth,
		stealthRating
	} = data || {}
	
	return `
	<div class="col-six">
		<style>
			.like-headless-rating {
				background: linear-gradient(90deg, var(${likeHeadlessRating < 100 ? '--grey-glass' : '--error'}) ${likeHeadlessRating}%, #fff0 ${likeHeadlessRating}%, #fff0 100%);
			}
			.headless-rating {
				background: linear-gradient(90deg, var(--error) ${headlessRating}%, #fff0 ${headlessRating}%, #fff0 100%);
			}
			.stealth-rating {
				background: linear-gradient(90deg, var(--error) ${stealthRating}%, #fff0 ${stealthRating}%, #fff0 100%);
			}
		</style>
		<strong>Headless</strong><span class="hash">${hashSlice($hash)}</span>
		<div>chromium: ${''+chromium}</div>
		<div class="like-headless-rating">${''+likeHeadlessRating}% like headless: ${
			modal(
				'creep-like-headless',
				'<strong>Like Headless</strong><br><br>'
				+Object.keys(likeHeadless).map(key => `${key}: ${''+likeHeadless[key]}`).join('<br>'),
				hashMini(likeHeadless)
			)
		}</div>
		<div class="headless-rating">${''+headlessRating}% headless: ${
			modal(
				'creep-headless',
				'<strong>Headless</strong><br><br>'
				+Object.keys(headless).map(key => `${key}: ${''+headless[key]}`).join('<br>'),
				hashMini(headless)
			)
		}</div>
		<div class="stealth-rating">${''+stealthRating}% stealth: ${
			modal(
				'creep-stealth',
				'<strong>Stealth</strong><br><br>'
				+Object.keys(stealth).map(key => `${key}: ${''+stealth[key]}`).join('<br>'),
				hashMini(stealth)
			)
		}</div>
	</div>`
}