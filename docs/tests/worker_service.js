(function() {
async function getWorkerData() {
	// get client code
	function getClientCode() {
		if (globalThis.document) return []
		const limit = 50
		const [p1, p2] = (1).constructor.toString().split((1).constructor.name)
		const isEngine = (fn) => {
			if (typeof fn !== 'function') return true
			return (''+fn === p1 + fn.name + p2 || ''+fn === p1 + (fn.name || '').replace('get ', '') + p2)
		}
		const isClient = (obj, key) => {
			if (/_$/.test(key)) return true
			const d = Object.getOwnPropertyDescriptor(obj, key)
			return !d || !isEngine(d.get || d.value)
		}
		let clientCode = Object.keys(self).slice(-limit).filter((x) => isClient(self, x))
		Object.getOwnPropertyNames(self).slice(-limit).forEach((x) => {
			if (!clientCode.includes(x) && isClient(self, x)) clientCode.push(x)
		})
		clientCode = [...clientCode, ...Object.getOwnPropertyNames(self.navigator)]
		const navProto = Object.getPrototypeOf(self.navigator)
		Object.getOwnPropertyNames(navProto).forEach((x) => {
			if (!clientCode.includes(x) && isClient(navProto, x)) clientCode.push(x)
		})
		return clientCode
	}

	// get ua data
	async function getUaData() {
		if (!('userAgentData' in navigator)) return null
		// @ts-expect-error if unsupported
		return navigator.userAgentData
			.getHighEntropyValues(['platform', 'platformVersion'])
			.then(({ platform, platformVersion}) => {
				if (platform === undefined && platformVersion === undefined) return null
				return String([platform, platformVersion])
			})
	}

	const [
		uaData,
		clientCode,
	] = await Promise.all([
		getUaData(),
		getClientCode(),
	]).catch(() => [])

	// eslint-disable-next-line new-cap
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
	// @ts-expect-error undefined if not supported
	const { deviceMemory, hardwareConcurrency, language, languages, platform, userAgent } = navigator
	const data = {
		timezone,
		languages: String([language, ...languages]),
		hardware: String([deviceMemory || null, hardwareConcurrency || null]),
		userAgent,
		platform,
		uaData,
		clientCode,
	}
	return data
}

! async function() {
  const broadcast = new BroadcastChannel('inline')
		broadcast.onmessage = async (event) => {
			if (event.data && event.data.type == 'fingerprint') {
				broadcast.postMessage(await getWorkerData())
			}
		}
}()
})()
