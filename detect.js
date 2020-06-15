function detectFunctionSpoofing(api, name) {
	const hashMini = str => {
	    const json = `${JSON.stringify(str)}`
	    let i, len, hash = 0x811c9dc5
	    for (i = 0, len = json.length; i < len; i++) {
	        hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	    }
	    return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	}
	
	let spoofTypes = []
	let fingerprint = ''
	
	const nativeCode = `function ${name}() { [native code] }`
	const { name: apiName, toString: apiToString, toLocaleString: apiToLocaleString } = api
	
	// detect attempts to rename the API and/or rewrite string conversion APIs
	if (apiName != name) { spoofTypes.push({ apiName }) }
	if (apiToString !== Function.prototype.toString) { spoofTypes.push({ apiToString }) }
	if (apiToLocaleString !== Function.prototype.toLocaleString) { spoofTypes.push({ apiToLocaleString }) }
	
	// collect string conversion result
	const result = ''+api
	
	// fingerprint result if it does not match native code
	if (result != nativeCode) { fingerprint = result }
	
	return {
		spoofed:  spoofTypes.length || fingerprint ? true : false,
		hash: hashMini({ spoofTypes, fingerprint })
	}
}

const { spoofed, hash } = detectFunctionSpoofing(HTMLCanvasElement.prototype.toDataURL, 'toDataURL')

spoofed && console.log(`Spoofing detected: ${hash}`)


