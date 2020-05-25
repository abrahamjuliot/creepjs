// required: doPost trigger in spreadsheet on form submit 
function getSheetData() {
  const spreadsheet = SpreadsheetApp.openById('[sheed id here]')
  const sheetName = 'db'
  const colStart = 'A'
  const colEnd = 'B'
  const startRow = 2
  const len = spreadsheet.getRange(sheetName+'!A1:A').getValues().filter(String).length
  const range = spreadsheet.getRange(sheetName+'!'+colStart+startRow+':'+colEnd+len)
  const data = range.getValues()
  return data
}
// https://github.com/jamiewilson/form-to-google-sheets
function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)
  try {
    const spreadsheet = SpreadsheetApp.openById('[sheed id here]')
    const sheet = spreadsheet.getSheetByName('db')
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]	
    const nextRow = sheet.getLastRow() + 1	
    const newRow = headers.map(function(header) {	
      return header === 'timestamp' ? new Date() : e.parameter[header]	
    })	
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])	
    const json = JSON.stringify(getSheetData())
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
