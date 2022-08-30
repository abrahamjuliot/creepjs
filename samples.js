/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const fetch = require('node-fetch')

// This only needs to be manually updated weekly
const URL = 'https://script.google.com/macros/s/AKfycbw26MLaK1PwIGzUiStwweOeVfl-sEmIxFIs5Ax7LMoP1Cuw-s0llN-aJYS7F8vxQuVG-A/exec'
const FILE_PATH = 'docs/data/samples.json'

// @ts-expect-error if not supported
fetch(URL)
  .then((res) => res.json())
  .then((data) => {
    fs.writeFile(FILE_PATH, JSON.stringify(data), (err) => {
      if (err) throw err
      console.log('samples updated!')
    })
  })
  .catch((err) => console.log(err))

