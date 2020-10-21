export const decrypt = ({ require: [ userAgentData, hashMini ] }) => {
	return (hash, { decryptSystem = false } = {}) => {
		const report = userAgentData.filter(report => report.id == hash)[0]
		if (report && report.decoded) {
			const { uaSystem, decoded } = report
			return `${decoded}${!decryptSystem || !uaSystem.length || uaSystem.length > 1 ? '' : ` on ${uaSystem[0]}`}`
		}
		else {
			return 'unknown'
		}
	}
}