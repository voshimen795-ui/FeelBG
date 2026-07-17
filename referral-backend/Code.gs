/**
 * FeelBG referral logging backend — Google Apps Script Web App.
 *
 * Deploy steps: see README.md in this folder. Once deployed, paste the web
 * app URL into js/referral-config.js as FEELBG_REFERRAL_LOG_ENDPOINT, and
 * change DASHBOARD_KEY below to a private string, copied into
 * FEELBG_REFERRAL_DASHBOARD_KEY in the same config file, so only your
 * dashboard can read the log back out.
 */

var SHEET_NAME = 'Referrals';
var DASHBOARD_KEY = 'change-me-to-a-private-key';

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Code', 'Venue', 'Action', 'Received At']);
  }
  return sheet;
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
    var ts = body.ts ? new Date(body.ts) : new Date();
    sheet.appendRow([ts, body.code || '', body.venue || '', body.action || '', new Date()]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var key = (e.parameter && e.parameter.key) || '';
  if (DASHBOARD_KEY && key !== DASHBOARD_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    rows.push({
      ts: new Date(values[i][0]).getTime(),
      code: values[i][1],
      venue: values[i][2],
      action: values[i][3]
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, rows: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}
