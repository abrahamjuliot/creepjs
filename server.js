const express = require('express')
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

app.use(express.static(staticPath))

app.listen(8000, () => console.log('⚡'))