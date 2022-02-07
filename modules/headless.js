export const getHeadlessFeatures = async (imports, workerScope) => {

	const {
		require: {
			queueEvent,
			createTimer,
			parentPhantom,
			instanceId,
			isChrome,
			getTooMuchRecursionLie,
			getNewObjectToStringTypeErrorLie,
			captureError,
			logTestResult
		}
	} = imports

	try {
		const timer = createTimer()
		await queueEvent(timer)
		const mimeTypes = Object.keys({ ...navigator.mimeTypes })
		const data = {
			chromium: isChrome,
			likeHeadless: {
				['navigator.webdriver is on']: 'webdriver' in navigator && !!navigator.webdriver,
				['chrome plugins array is empty']: isChrome && navigator.plugins.length === 0,
				['chrome mimeTypes array is empty']: isChrome && mimeTypes.length === 0,
				['notification permission is denied']: (
					isChrome &&
					'Notification' in window &&
					(Notification.permission == 'denied')
				),
				['chrome system color ActiveText is rgb(255, 0, 0)']: isChrome && (() => {
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
				['chrome window.chrome is undefined']: isChrome && !('chrome' in window),
				['chrome permission state is inconsistent']: (
					isChrome &&
					'permissions' in navigator &&
					await (async () => {
						const res = await navigator.permissions.query({ name: 'notifications' })
						return (
							res.state == 'prompt' &&
							'Notification' in window &&
							Notification.permission === 'denied'
						)
					})()
				),
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
					iframe.srcdoc = instanceId
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
					return getTooMuchRecursionLie(Permissions.prototype.query)
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
					const apiFunction = Function.prototype.toString
					const liedToString = (
						getNewObjectToStringTypeErrorLie(apiFunction) ||
						getNewObjectToStringTypeErrorLie(() => { }) ||
						getTooMuchRecursionLie(apiFunction)
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

		logTestResult({ time: timer.stop(), test: 'headless', passed: true })
		return { ...data, likeHeadlessRating, headlessRating, stealthRating }
	}
	catch (error) {
		logTestResult({ test: 'headless', passed: false })
		captureError(error)
		return
	}
}

export const headlesFeaturesHTML = ({ fp, modal, note, hashMini, hashSlice, performanceLogger }) => {
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
	<div class="relative col-six">
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
		<span class="aside-note">${performanceLogger.getLog().headless}</span>
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