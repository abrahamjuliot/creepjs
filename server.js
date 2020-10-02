const express = require('express')
const fs = require('fs')
const path = require('path')
const staticPath = path.join(__dirname, '/')
const app = express()

app.use(express.static(staticPath))


const updateReport = (report, [uaSystem, userAgent]) => {
	let updatedReport = false
	const newUaSystem = report.uaSystem.indexOf(uaSystem) == -1
	const newUserAgent = report.userAgent.indexOf(userAgent) == -1
	if (newUaSystem) {
		report.isUpdated = true
		updatedReport = true
		report.time = new Date().toLocaleString()
		report.uaSystem.push(uaSystem)
		console.log('updated uaSystem')
	}
	if (newUserAgent) {
		report.isUpdated = true
		updatedReport = true
		report.time = new Date().toLocaleString()
		report.userAgent.push(userAgent)
		console.log('updated userAgent')
	}
	return { report, updatedReport }
}

app.post('/', (req, res) => {
	const { distrust, math, html, win, style, system, ua: userAgent, uaSystem } = req.query
	
	if (JSON.parse(distrust.toLowerCase())) {
		console.log('distrust')
		return
	}
	try {
		fs.readFile('useragent.json', (err, file) => {
			if (err) { throw err }
			const data = JSON.parse(file)

			let foundMath = data.filter(item => item.id == math)[0]
			let foundHTML = data.filter(item => item.id == html)[0]
			let foundWindow = data.filter(item => item.id == win)[0]
			let foundStyle = data.filter(item => item.id == style)[0]
			let foundSystem = data.filter(item => item.id == system)[0]

			const log = []
			let updated = false

			if (!foundMath) {
				data.push({
					id: math,
					type: 'js Math implementation',
					isNew: true,
					uaSystem: [uaSystem],
					userAgent: [userAgent],
					time: new Date().toLocaleString()
				})
				updated = true
				log.push('math')
			}
			else {
				const { report, updatedReport } = updateReport(foundMath, [uaSystem, userAgent])
				foundMath= report
				if (updatedReport) {
					updated = true
				}
			}

			if (!foundHTML) {
				data.push({
					id: html,
					type: 'HTMLElement version',
					isNew: true,
					uaSystem: [uaSystem],
					userAgent: [userAgent],
					time: new Date().toLocaleString()
				})
				updated = true
				log.push('html')
			}
			else {
				const { report, updatedReport } = updateReport(foundHTML, [uaSystem, userAgent])
				foundHTML = report
				if (updatedReport) {
					updated = true
				}
			}

			if (!foundWindow) {
				data.push({
					id: win,
					type: 'contentWindow version',
					isNew: true,
					uaSystem: [uaSystem],
					userAgent: [userAgent],
					time: new Date().toLocaleString()
				})
				updated = true
				log.push('win')
			}
			else {
				const { report, updatedReport } = updateReport(foundWindow, [uaSystem, userAgent])
				foundWindow = report
				if (updatedReport) {
					updated = true
				}
			}

			if (!foundStyle) {
				data.push({
					id: style,
					type: 'CSS style version',
					isNew: true,
					uaSystem: [uaSystem],
					userAgent: [userAgent],
					time: new Date().toLocaleString()
				})
				updated = true
				log.push('style')
			}
			else {
				const { report, updatedReport } = updateReport(foundStyle, [uaSystem, userAgent])
				foundStyle = report
				if (updatedReport) {
					updated = true
				}
			}

			if (!foundSystem) {
				data.push({
					id: system,
					type: 'system styles',
					isNew: true,
					uaSystem: [uaSystem],
					userAgent: [userAgent],
					time: new Date().toLocaleString()
				})
				updated = true
				log.push('system')
			}
			else {
				const { report, updatedReport } = updateReport(foundSystem, [uaSystem, userAgent])
				foundSystem = report
				if (updatedReport) {
					updated = true
				}
			}

			const totalPendingUpdates = data.filter(item => item.isUpdated).length
			const totalPendingNew = data.filter(item => item.isNew).length

			if (updated) {
				data.sort((a, b) => new Date(b.time) - new Date(a.time))
				const json = JSON.stringify(data, null, 2)
				return fs.writeFile('useragent.json', json, err => {
					if (err) { throw err }
					console.log(`updated ${log.join(', ')}`)
				})
			}
			return (
				totalPendingUpdates || totalPendingNew ?
				console.log(`${totalPendingUpdates} updates and ${totalPendingNew} new`) :
				console.log('no updates')
			)
		})
	}
	catch (error) {
		console.log('failed file read')
	}
})

app.listen(8000, () => console.log('⚡'))
