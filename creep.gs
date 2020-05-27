// required: doPost trigger in spreadsheet on form submit 
function getSheetData() {
  const spreadsheet = SpreadsheetApp.openById('1Ob6WhJG7D0F735HKchd1IUESCAQ-Ww6dtBSRR5Y3kHk')
  const sheetName = 'db'
  const colStart = 'A'
  const colEnd = 'C'
  const startRow = 2
  const len = spreadsheet.getRange(sheetName+'!A1:A').getValues().filter(String).length
  const range = spreadsheet.getRange(sheetName+'!'+colStart+startRow+':'+colEnd+len)
  const data = range.getValues()
  return { spreadsheet, sheetName, startRow, data }
}

function doGet(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(3000)
  try {
    const { data } = getSheetData()        
    const json = JSON.stringify(data)
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
    const sheet = spreadsheet.getSheetByName(sheetName)
    let found = false
    // if the id is not new, increment visits
    for (let i in data) {
      const row = data[i]
      const timestamp = row[0]
      const id = row[1]
      const visits = Number(row[2]) || 1
      if (id == e.parameter.id) {
        const matchingRowIndex = (Number(i)+startRow).toFixed(0)
        const range = `A${matchingRowIndex}:C${matchingRowIndex}`
        spreadsheet.getRange(range).setValues([[new Date(), id, visits+1]]) // new date/increment visits
        found = true
        break
      }
    }
    // if the the id is new, insert the data
    if (!found) {
        console.log('here')
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]	
        const nextRow = sheet.getLastRow() + 1	
        const newRow = headers.map(header => header === 'timestamp' ? new Date() : e.parameter[header])
        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])
    }  
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