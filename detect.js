function detectFunctionSpoofing(api, name) {
	let spoofTypes = []
	let fingerprint = []
	
	const nativeCode = `function ${name}() { [native code] }`
	const { name: apiName, toString: apiToString, toLocaleString: apiToLocaleString } = api
	
	if (apiName != name) { spoofTypes.push({ apiName }) }
	if (apiToString !== Function.prototype.toString) { spoofTypes.push({ apiToString }) }
	if (apiToLocaleString !== Function.prototype.toLocaleString) { spoofTypes.push({ apiToLocaleString }) }
	
	const { a, b, c} = { a: api.toLocaleString(), b: api.toString(), c: JSON.stringify(`${api}`) }
	if (a != nativeCode) { fingerprint.push({ a }) }
	if (b != nativeCode) { fingerprint.push({ b }) }
	if (c != JSON.stringify(`${nativeCode}`)) { fingerprint.push({ c: JSON.parse(c) }) }
	
	return { spoofTypes, fingerprint }
}

const { spoofTypes, fingerprint } = detectFunctionSpoofing(HTMLCanvasElement.prototype.toDataURL, 'toDataURL')

spoofTypes.length && console.log('Spoofing detected:', spoofTypes)
fingerprint.length && console.log('Spoofing detected (Fingerprint):', fingerprint)


