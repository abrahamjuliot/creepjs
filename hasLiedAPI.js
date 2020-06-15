function hasLiedAPI(api, name) {
	const hashMini = str => {
	    const json = `${JSON.stringify(str)}`
	    let i, len, hash = 0x811c9dc5
	    for (i = 0, len = json.length; i < len; i++) {
	        hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	    }
	    return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	}
	const native = (x) => `function ${x}() { [native code] }`
	let lieTypes = []
	let fingerprint = ''
	
	const { name: apiName, toString: apiToString, toLocaleString: apiToLocaleString } = api
	const fnToStr = Function.prototype.toString
	const fnToLStr = Function.prototype.toLocaleString
	const fnStr = String
	const fnStringify = JSON.stringify
	
	// detect attempts to rewrite Function string conversion APIs
	if (fnToStr != native('toString')) { lieTypes.push({ fnToStr }) }
	if (fnToLStr != native('toLocaleString')) { lieTypes.push({ fnToLStr }) }
	if (fnStr != native('String')) { lieTypes.push({ fnStr }) }
	if (fnStringify != native('stringify')) { lieTypes.push({ fnStringify }) }
	
	// detect attempts to rename the API and/or rewrite string conversion API on this
	if (apiName != name) { lieTypes.push({ apiName }) }
	if (apiToString !== fnToStr) { lieTypes.push({ apiToString }) }
	if (apiToLocaleString !== fnToLStr) { lieTypes.push({ apiToLocaleString }) }
	
	// collect string conversion result
	const result = ''+api
	
	// fingerprint result if it does not match native code
	if (result != native(name)) { fingerprint = result }
	
	return {
		lied: lieTypes.length || fingerprint ? true : false,
		hash: hashMini({ lieTypes, fingerprint })
	}
}

const { lied, hash } = hasLiedAPI(HTMLCanvasElement.prototype.toDataURL, 'toDataURL')

lied && console.log(`API Lie Detected: ${hash}`)