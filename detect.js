function detectFunctionSpoofing(api, name) {
	let spoofTypes = []
	let fingerprint = []
	
	const nativeCode = `function ${name}() { [native code] }`
	const { name: apiName, toString: apiToString, toLocaleString: apiToLocaleString } = api
	
	// detect attempts to rename the API and/or rewrite string conversion APIs
	if (apiName != name) { spoofTypes.push({ apiName }) }
	if (apiToString !== Function.prototype.toString) { spoofTypes.push({ apiToString }) }
	if (apiToLocaleString !== Function.prototype.toLocaleString) { spoofTypes.push({ apiToLocaleString }) }
	
	// collect string conversion results
	const a_localString = api.toLocaleString()
	const b_toString = api.toString()
	const c_jsonStringify = JSON.stringify(`${api}`)
	const d_quotes = ''+api
	const e_string = String(api)
	const f_template = `${HTMLCanvasElement.prototype.toDataURL}`
	
	// fingerprint result if it does not match native code
	if (a_localString != nativeCode) { fingerprint.push({ a_localString }) }
	if (b_toString != nativeCode) { fingerprint.push({ b_toString }) }
	if (c_jsonStringify != JSON.stringify(`${nativeCode}`)) {
		fingerprint.push({ c_jsonStringify: JSON.parse(c_jsonStringify) })
	}
	if (d_quotes != nativeCode) { fingerprint.push({ d_quotes }) }
	if (e_string != nativeCode) { fingerprint.push({ e_string }) }
	if (f_template != nativeCode) { fingerprint.push({ f_template }) }
	
	return { spoofTypes, fingerprint }
}

const { spoofTypes, fingerprint } = detectFunctionSpoofing(HTMLCanvasElement.prototype.toDataURL, 'toDataURL')

spoofTypes.length && console.log('Spoofing detected:', spoofTypes)
fingerprint.length && console.log('Spoofing detected (Fingerprint):', fingerprint)


