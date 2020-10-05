// https://stackoverflow.com/a/22429679
const hashMini = str => {
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

// instance id
const instanceId = hashMini(crypto.getRandomValues(new Uint32Array(10)))

// https://stackoverflow.com/a/53490958
// https://stackoverflow.com/a/43383990
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
const hashify = async (x) => {
	const json = `${JSON.stringify(x)}`
	const jsonBuffer = new TextEncoder().encode(json)
	const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
	return hashHex
}

export { hashMini, instanceId, hashify }