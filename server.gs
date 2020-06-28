// !mportant: redeploy

// required: doPost trigger in spreadsheet on form submit 
function getSheetData() {
  const spreadsheet = SpreadsheetApp.openById('1Ob6WhJG7D0F735HKchd1IUESCAQ-Ww6dtBSRR5Y3kHk')
  const sheetName = 'db'
  const colStart = 'A'
  const colEnd = 'D'
  const startRow = 2
  const len = spreadsheet.getRange(sheetName+'!A1:A').getValues().filter(String).length
  const range = spreadsheet.getRange(sheetName+'!'+colStart+startRow+':'+colEnd+len)
  const data = range.getValues()
  return { spreadsheet, sheetName, startRow, data }
}
          
function logger(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('log')
  return (log) => {	
    const nextRow = sheet.getLastRow() + 1
    const timestamp = new Date()
    return sheet.getRange(nextRow, 1, 1, 2).setValues([[timestamp, log]])       
  } 
}

function createJSONFile() {
  const filename = 'db.json.txt'
  const timestamp = new Date()
  const obj = {}
  obj['init'] = {
    firstVisit: timestamp,
    latestVisit: timestamp,
    visits: 1,
    subIds: { ['init']: 1 }
  }
  const json = JSON.stringify(obj)
  const files = DriveApp.getFilesByName(filename)
  if (files.hasNext()) { return files.next().setContent(json) }
  else { return DriveApp.createFile(filename, json) }
}
          
function getData() {
  const files = DriveApp.getFilesByName('db.json.txt')
  if (files.hasNext()) {
    const file = files.next()
    const content = file.getBlob().getDataAsString()
    const json = JSON.parse(content)
    return json
  }
}
          
function setData(obj) {
  const json = JSON.stringify(obj)
  const filename = 'db.json.txt'        
  const files = DriveApp.getFilesByName(filename)
  if (files.hasNext()) { return files.next().setContent(json) }
  else { return DriveApp.createFile(filename, json) }
}
          
function doGet(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(3000)
  try {
    //const { data } = getSheetData()
    const { parameter: { id } } = e
    const db = getData()[id] 
    const json = JSON.stringify(db)
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON)
  }
  catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': JSON.stringify(err) }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    lock.releaseLock()
  }
}          

// https://github.com/jamiewilson/form-to-google-sheets
function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(3000)
  try {
    const { spreadsheet, sheetName, startRow, data } = getSheetData()
    const log = logger(spreadsheet)
    const sheet = spreadsheet.getSheetByName(sheetName)
    let found = false
    
    // if the id is not new, increment visits
    for (let i in data) {
      const row = data[i]
      const id = row[2]
      const visits = Number(row[3]) || 1
      if (id == e.parameter.id) {
        //log('not new')
        const matchingRowIndex = (Number(i)+startRow).toFixed(0)
        const range = `B${matchingRowIndex}:D${matchingRowIndex}`
        spreadsheet.getRange(range).setValues([[new Date(), id, visits+1]]) // new date/increment visits
        found = true
        break
      }
    }
    
    // if the the id is new, insert the data
    if (!found) {	
        const nextRow = sheet.getLastRow() + 1
        const timestamp = new Date()
        sheet.getRange(nextRow, 1, 1, 4).setValues([[timestamp, timestamp, e.parameter.id, 1]])
    }
    
    // get database
    const db = getData()
    const { parameter: { id: fingerprintId, subId } } = e
    const timestamp = new Date()
    
    if (db[fingerprintId]) {
      // update
      
      const dbId = db[fingerprintId]
      const { subIds } = dbId
      if (subIds[subId]) { subIds[subId]++ }
      else { subIds[subId] = 1 }
      dbId.latestVisit = timestamp
      dbId.visits++
      dbId.subIds = subIds
      db[fingerprintId] = dbId
    }
    else {
      // create JSON
      db[fingerprintId] = {
        firstVisit: timestamp,
        latestVisit: timestamp,
        visits: 1,
        subIds: { [subId]: 1 }
      }
    }
    
    // set database
    setData(db)
     
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': JSON.stringify(err) }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    lock.releaseLock()
  }
}
