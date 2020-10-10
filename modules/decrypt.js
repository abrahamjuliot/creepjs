export const decrypt = ({ require: [ userAgentData, hashMini ] }) => {
	return hash => {
		const report = userAgentData.filter(report => report.id == hash)[0]
		if (report && report.decoded) {
			const { uaSystem, decoded } = report
			return `${decoded} (${hashMini(hash)}${!uaSystem.length || uaSystem.length > 1 ? '' : `, matches ${uaSystem[0]}`})`
		}
		else {
			return 'unknown'
		}
	}
}