const express = require('express')
const fs = require('fs')
const path = require('path')
const staticPath = path.join(__dirname, '/')
const app = express()

app.use(express.static(staticPath))

app.post('/', (req, res) => {
	const { math: hash, ua: userAgent } = req.query
	// read
	fs.readFile('math.json', (err, file) => {
		if (err) { throw err }
		const data = JSON.parse(file)
		const found = data.filter(item => item.id == hash)[0]
		if (!found) {
			data.push({ id: hash, userAgent }) // update
			const json = JSON.stringify(data, null, 2)
			fs.writeFile('math.json', json, err => {
				if (err) { throw err }
				console.log('file updated')
			})
		}
	})
})

app.listen(3000, () => console.log('⚡'))

