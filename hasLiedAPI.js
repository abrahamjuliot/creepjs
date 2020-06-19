// detect and fingerprint Function API lies
const native = (x) => `function ${x}() { [native code] }`
function hasLiedStringAPI() {
	let lieTypes = []
	// detect attempts to rewrite Function string conversion APIs
	const fnToStr = Function.prototype.toString
	const fnToLStr = Function.prototype.toLocaleString
	const fnStr = String
	const fnStringify = JSON.stringify
	if (fnToStr != native('toString')) {
		lieTypes.push({ fnToStr })
	}
	if (fnToLStr != native('toLocaleString')) {
		lieTypes.push({ fnToLStr })
	}
	if (fnStr != native('String')) {
		lieTypes.push({ fnStr })
	}
	if (fnStringify != native('stringify')) {
		lieTypes.push({ fnStringify })
	}
	return () => lieTypes
}
const stringAPILieTypes = hasLiedStringAPI() // compute and cache result
function hasLiedAPI(api, name) {
	let lieTypes = [...stringAPILieTypes()]
	let fingerprint = ''

	// detect attempts to rename the API and/or rewrite string conversion APIs on this API object
	const {
		name: apiName,
		toString: apiToString,
		toLocaleString: apiToLocaleString
	} = api
	if (apiName != name) {
		lieTypes.push({ apiName })
	}
	if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
		lieTypes.push({ apiToString })
	}
	if (apiToLocaleString !== fnToLStr) {
		lieTypes.push({ apiToLocaleString })
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
	} catch (err) {
		const nativeTypeError = 'TypeError: Function.prototype.toString is not a constructor'
		if ('' + err != nativeTypeError) {
			lieTypes.push({ newErr: '' + err })
		}
	}

	// collect string conversion result
	const result = '' + api

	// fingerprint result if it does not match native code
	if (result != native(name)) {
		fingerprint = result
	}
	
	return {
		lie: lieTypes.length || fingerprint ? { lieTypes, fingerprint } : false, 
	}
}