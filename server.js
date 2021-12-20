const express = require('express')
const fs = require('fs')
const path = require('path')
const staticPath = path.join(__dirname, '/')
const app = express()

// redirect /tests/ to /docs/tests
app.use('*', (req, res, next) => {
	const testRoute = /^\/tests\//i.test(req.originalUrl)
	if (testRoute) {
		const url = `/docs${req.originalUrl}`
		return res.redirect(url)
	}
	return next()
})

/*
// for use in fonts.js test file (see font logger)
app.use(express.json())
app.use('/font-logger', (req, res, next) => {
	const { fonts } = req.body || {}
	const filename = `${new Date().toISOString()}__fonts.txt`
	fs.writeFile(filename, fonts.join('\n'), error => error ? console.log(error) : console.log(`file saved!`))
	res.send({ status: 'file saved!'})
	return next()
})
*/

app.use(express.static(staticPath))

app.listen(8000, () => console.log('⚡'))