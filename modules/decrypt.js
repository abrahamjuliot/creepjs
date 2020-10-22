export const decrypt = ({ require: [ userAgentData, hashMini, getOS ] }) => {
	let userAgent = ''
	try {
		userAgent = navigator.userAgent
	}
	catch (error) { }
	const system = getOS(userAgent)

	return hash => {
		const report = userAgentData.filter(report => report.id == hash)[0]
		if (report && report.decoded) {
			const { uaSystem, decoded } = report
			return `${decoded}${uaSystem.length && uaSystem.length == 1 && system == uaSystem[0] ? ` on ${uaSystem[0]}` : ''}`
		}
		else {
			return 'unknown'
		}
	}
}