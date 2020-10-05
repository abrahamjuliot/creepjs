export const decrypt = async ({ require: [ hashMini ] }) => {
	const useragentResponse = await fetch('./useragent.json').catch(error => console.error(error))
	const useragentData = await useragentResponse.json().catch(error => console.error(error))
	
	return hash => {
		const report = useragentData.filter(report => report.id == hash)[0]
		if (report && report.decoded) {
			const { uaSystem, decoded } = report
			return `${decoded} (${hashMini(hash)}${!uaSystem.length || uaSystem.length > 1 ? '' : `, matches ${uaSystem[0]}`})`
		}
		else {
			return 'unknown'
		}
	}
}