// Detect proxy behavior
const proxyBehavior = x => {
	if (typeof x == 'function') { return true }
	return false
}

// detect and fingerprint Function API lies
const native = (result, str) => {
	const chrome = `function ${str}() { [native code] }`
	const chromeGet = `function get ${str}() { [native code] }`
	const firefox = `function ${str}() {\n    [native code]\n}`
	return result == chrome || result == chromeGet || result == firefox
}
const hasLiedStringAPI = () => {
	let lieTypes = []

	// detect attempts to rewrite Function.prototype.toString conversion APIs
	const { toString } = Function.prototype
	if (!native(toString, 'toString')) {
		lieTypes.push({ toString })
	}

	// The idea of checking new is inspired by https://adtechmadness.wordpress.com/2019/03/23/javascript-tampering-detection-and-stealth/
	try {
		const str_1 = new Function.prototype.toString
		const str_2 = new Function.prototype.toString()
		const str_3 = new Function.prototype.toString.toString
		const str_4 = new Function.prototype.toString.toString()
		lieTypes.push({
			str_1,
			str_2,
			str_3,
			str_4
		})
	} catch (error) {
		const nativeTypeError = 'TypeError: Function.prototype.toString is not a constructor'
		if ('' + error != nativeTypeError) {
			lieTypes.push({ newErr: '' + error.message })
		}
	}

	return () => lieTypes
}
const stringAPILieTypes = hasLiedStringAPI() // compute and cache result
const hasLiedAPI = (api, name) => {
	const { toString: fnToStr } = Function.prototype

	if (typeof api == 'function') {
		let lieTypes = [...stringAPILieTypes()]
		let fingerprint = ''

		// detect attempts to rename the API and/or rewrite toString
		const { name: apiName, toString: apiToString } = api
		if (apiName != name) {
			lieTypes.push({
				apiName: !proxyBehavior(apiName) ? apiName: true
			})
		}
		if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
			lieTypes.push({
				apiToString: !proxyBehavior(apiToString) ? apiToString: true
			})
		}

		// collect string conversion result
		const result = '' + api

		// fingerprint result if it does not match native code
		if (!native(result, name)) {
			fingerprint = result
		}
		
		return {
			lie: lieTypes.length || fingerprint ? { lieTypes, fingerprint } : false 
		}
	}

	if (typeof api == 'object') {
		const apiFunction = Object.getOwnPropertyDescriptor(api, name).get
		let lieTypes = [...stringAPILieTypes()]
		let fingerprint = ''

		// detect attempts to rename the API and/or rewrite toString
		const { name: apiName, toString: apiToString } = apiFunction
		if (apiName != `get ${name}` && apiName != name) {
			lieTypes.push({
				apiName: !proxyBehavior(apiName) ? apiName: true
			})
		}
		if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
			lieTypes.push({
				apiToString: !proxyBehavior(apiToString) ? apiToString: true
			})
		}

		// collect string conversion result
		const result = '' + apiFunction

		// fingerprint result if it does not match native code
		if (!native(result, name)) {
			fingerprint = result
		}

		return {
			lie: lieTypes.length || fingerprint ? { lieTypes, fingerprint } : false
		}
	}

	return false
}


// Intercept Proxies (concept)
// https://hacks.mozilla.org/2015/07/es6-in-depth-proxies-and-reflect/
const interceptedProxies = new WeakSet()
Proxy = new Proxy(Proxy, {
    construct(...args) {
		// https://stackoverflow.com/a/53208015
        const newProxy = Reflect.construct(...args)
        interceptedProxies.add(newProxy)
		console.log(args[1])
        return newProxy
    }
})
const obj1 = ({})
const obj2 = new Proxy({}, {})
console.log(interceptedProxies.has(obj2))