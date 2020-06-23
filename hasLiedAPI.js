// detect and fingerprint Function API lies
const native = (result, str) => {
	const chrome = `function ${str}() { [native code] }`
	const firefox = `function ${str}() {\n    [native code]\n}`
	return result == chrome || result == firefox
}
function hasLiedStringAPI() {
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
			lieTypes.push({ newErr: '' + error })
		}
	}

	return () => lieTypes
}
const stringAPILieTypes = hasLiedStringAPI() // compute and cache result
function hasLiedAPI(api, name) {
	let lieTypes = [...stringAPILieTypes()]
	let fingerprint = ''

	// detect attempts to rename the API and/or rewrite toString
	const { toString: fnToStr } = Function.prototype
	const { name: apiName, toString: apiToString } = api
	if (apiName != name) {
		lieTypes.push({ apiName })
	}
	if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
		lieTypes.push({ apiToString })
	}

	// collect string conversion result
	const result = '' + api

	// fingerprint result if it does not match native code
	if (!native(result, name)) {
		fingerprint = result
	}
	
	return {
		lie: lieTypes.length || fingerprint ? { lieTypes, fingerprint } : false, 
	}
}

// Detect proxy behavior
// https://stackoverflow.com/questions/36372611
const proxyBehavior = (obj) => {
	const target = (Math.random().toString(36)+'00000000000000000').slice(2, 8+2)
	try {
		window.postMessage(obj, target)
		return false
	}
	catch(error) {
		cloneable = error.code != 25 // data clone error
		return !cloneable
	}
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