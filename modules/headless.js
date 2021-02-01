const detectChromium = () => (
	Math.acos(0.123) == 1.4474840516030247 &&
	Math.acosh(Math.SQRT2) == 0.881373587019543 &&
	Math.atan(2) == 1.1071487177940904 &&
	Math.atanh(0.5) == 0.5493061443340548 &&
	Math.cbrt(Math.PI) == 1.4645918875615231 &&
	Math.cos(21*Math.LN2) == -0.4067775970251724 &&
	Math.cosh(492*Math.LOG2E) == 9.199870313877772e+307 &&
	Math.expm1(1) == 1.718281828459045 &&
	Math.hypot(6*Math.PI, -100) == 101.76102278593319 &&
	Math.log10(Math.PI) == 0.4971498726941338 &&
	Math.sin(Math.PI) == 1.2246467991473532e-16 &&
	Math.sinh(Math.PI) == 11.548739357257748 &&
	Math.tan(10*Math.LOG2E) == -3.3537128705376014 &&
	Math.tanh(0.123) == 0.12238344189440875 &&
	Math.pow(Math.PI, -100) == 1.9275814160560204e-50
)

const getNewObjectToStringTypeErrorLie = apiFunction => {
	try {
		Object.create(apiFunction).toString()
		return true
	} catch (error) {
		const stackLines = error.stack.split('\n')
		const traceLines = stackLines.slice(1)
		const objectApply = /at Object\.apply/
		const functionToString = /at Function\.toString/
		const validLines = !traceLines.find(line => objectApply.test(line))
		// Stack must be valid
		const validStack = (
			error.constructor.name == 'TypeError' && stackLines.length > 1
		)
		// Chromium must throw error 'at Function.toString' and not 'at Object.apply'
		const isChrome = 'chrome' in window || detectChromium()
		if (validStack && isChrome && (!functionToString.test(stackLines[1]) || !validLines)) {
			return true
		}
		return !validStack
	}
}


export const getHeadlessFeatures = imports => {

	const {
		require: {
			hashMini,
			captureError,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const start = performance.now()
			const isChrome = detectChromium()
			const permissionStatus = await navigator.permissions.query({ name:'notifications' })
			const headlessPermissions = (
				Notification.permission == 'denied' && permissionStatus.state === 'prompt'
			)
			const mimeTypes = Object.keys({...navigator.mimeTypes})
			const data = {
				chromium: isChrome,
				hasTrustToken: 'hasTrustToken' in document,
				webdriver: 'webdriver' in navigator,
				headless: {
					chrome: isChrome && !('chrome' in window),
					permissions: isChrome && headlessPermissions,
					plugins: isChrome && navigator.plugins.length === 0,
					mimeTypes: isChrome && mimeTypes.length === 0
				},
				stealth: {
					srcdocError: (() => {
						try {
							const { srcdoc } = document.createElement('iframe')
							return !!srcdoc
						}
						catch (error) {
							return true
						}
					})(),
					srcdocProxy: (() => {
						const iframe = document.createElement('iframe')
						iframe.srcdoc = '' + hashMini(crypto.getRandomValues(new Uint32Array(10)))
						return !!iframe.contentWindow
					})(),
					invalidChromeIndex: (() => {
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
					toStringProxy: (() => {
						const liedToString = (
							getNewObjectToStringTypeErrorLie(Function.prototype.toString) ||
							getNewObjectToStringTypeErrorLie(() => {})
						)
						return liedToString
					})()
				}
			}

			const { headless, stealth } = data
			const headlessTests = Object.keys(headless).map(key => headless[key])
			const stealthTests = Object.keys(stealth).map(key => stealth[key])
			const headlessRating = (headlessTests.filter(test => test).length / headlessTests.length) * 100
			const stealthRating = (stealthTests.filter(test => test).length / stealthTests.length) * 100 

			logTestResult({ start, test: 'headless', passed: true })
			return resolve({ ...data, headlessRating, stealthRating })
		}
		catch (error) {
			logTestResult({ test: 'headless', passed: false })
			captureError(error)
			return resolve()
		}
	})
}