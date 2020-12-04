const express = require('express')
const fs = require('fs')
const path = require('path')
const staticPath = path.join(__dirname, '/')
const app = express()

app.use(express.static(staticPath))

app.listen(3000, () => console.log('⚡'))