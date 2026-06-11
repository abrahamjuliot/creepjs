/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const https = require('https')

// This only needs to be manually updated weekly
const URL = 'https://script.google.com/macros/s/AKfycbw26MLaK1PwIGzUiStwweOeVfl-sEmIxFIs5Ax7LMoP1Cuw-s0llN-aJYS7F8vxQuVG-A/exec'
const FILE_PATH = 'docs/data/samples.json'

https.get(URL, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    try {
      const json = JSON.parse(data)
      fs.writeFile(FILE_PATH, JSON.stringify(json), (err) => {
        if (err) throw err
        console.log('samples updated!')
      })
    } catch (e) {
      console.error(e)
    }
  })
}).on('error', (err) => console.error(err))

