const express = require('express')
const fs = require('fs')
const path = require('path')
const staticPath = path.join(__dirname, '/')
const app = express()

app.use(express.static(staticPath))

app.post('/', (req, res) => {
	const { distrust, math, html, win, style, system, ua: userAgent } = req.query
	
	if (JSON.parse(distrust.toLowerCase())) {
		console.log('distrust')
		return
	}

	fs.readFile('useragent.json', (err, file) => {
		if (err) { throw err }
		const data = JSON.parse(file)

		const foundMath = data.filter(item => item.id == math)[0]
		const foundHTML = data.filter(item => item.id == html)[0]
		const foundWindow = data.filter(item => item.id == win)[0]
		const foundStyle = data.filter(item => item.id == style)[0]
		const foundSystem = data.filter(item => item.id == system)[0]

		const log = []

		if (!foundMath) {
			data.push({
				id: math,
				type: 'js Math implementation',
				isNew: true,
				userAgent
			})
			log.push('math')
		}
		if (!foundHTML) {
			data.push({
				id: html,
				type: 'HTMLElement version',
				isNew: true,
				userAgent
			})
			log.push('html')
		}
		if (!foundWindow) {
			data.push({
				id: win,
				type: 'contentWindow version',
				isNew: true,
				userAgent
			})
			log.push('win')
		}
		if (!foundStyle) {
			data.push({
				id: style,
				type: 'CSS style version',
				isNew: true,
				userAgent
			})
			log.push('style')
		}
		if (!foundSystem) {
			data.push({
				id: system,
				type: 'system styles',
				isNew: true,
				userAgent
			})
			log.push('system')
		}

		const newHashCaptured = (
			!foundMath ||
			!foundHTML ||
			!foundWindow ||
			!foundStyle ||
			!foundSystem
		)

		if (newHashCaptured) {
			const json = JSON.stringify(data, null, 2)
			fs.writeFile('useragent.json', json, err => {
				if (err) { throw err }
				console.log(`updated ${log.join(', ')}`)
			})
		}
	})
})

app.listen(8000, () => console.log('⚡'))
