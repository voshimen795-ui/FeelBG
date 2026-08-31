/**
 * FeelBG referral + outbound-click logging backend — Google Apps Script Web App.
 *
 * Deploy steps: see README.md in this folder. Once deployed, paste the web
 * app URL into js/referral-config.js as FEELBG_REFERRAL_LOG_ENDPOINT, and
 * change DASHBOARD_KEY below to a private string, copied into
 * FEELBG_REFERRAL_DASHBOARD_KEY in the same config file, so only your
 * dashboard can read the log back out.
 *
 * This one script handles both jobs on purpose. Referral codes and outbound
 * clicks are the same question asked twice — did this venue get business out
 * of us — so they share one sheet, one transport and one dashboard rather
 * than growing a second pipeline that would have to be kept in step.
 */

var SHEET_NAME = 'Referrals';
var DASHBOARD_KEY = 'change-me-to-a-private-key';

// Where redemption notifications go. Change this if needed — it defaults to
// the address that requested this build.
var OWNER_EMAIL = 'voshimen795@gmail.com';

/**
 * Column order. Append-only: adding a name to the end is safe, reordering or
 * removing one silently corrupts every row already in the sheet.
 *
 * The first five are the original referral columns and keep their positions.
 * The last four arrived with outbound-click tracking; rows written before that
 * simply have them blank.
 */
var COLUMNS = [
  'Timestamp', 'Code', 'Venue', 'Action', 'Received At',
  'Venue ID', 'Lang', 'Source', 'Device'
];

/**
 * Actions this endpoint will record.
 *
 * The write side is necessarily unauthenticated — a tracker running in a
 * visitor's browser cannot hold a secret — so the whitelist is what stops the
 * sheet filling up with arbitrary strings from anyone who finds the URL. An
 * unrecognised action is dropped rather than stored.
 */
var ALLOWED_ACTIONS = {
  // Referral flow (original)
  qr_scan: true,
  code_generated: true,
  whatsapp_booking_initiated: true,
  directions_clicked: true,
  voucher_viewed: true,
  code_redeemed: true,
  // Outbound / engagement tracking
  venue_view: true,
  reserve_clicked: true,
  phone_clicked: true,
  website_clicked: true
};

/** Longest string accepted in any single field, to bound abuse. */
var MAX_FIELD = 120;

function clean_(value) {
  return String(value == null ? '' : value).slice(0, MAX_FIELD);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    return sheet;
  }
  // A sheet created before the tracking columns existed still has the original
  // five headers. Widen it in place so the new cells are labelled; the rows
  // themselves need no migration because the added columns are appended.
  var width = sheet.getLastColumn();
  if (width < COLUMNS.length) {
    sheet.getRange(1, width + 1, 1, COLUMNS.length - width)
      .setValues([COLUMNS.slice(width)]);
  }
  return sheet;
}

function notifyOwnerOfRedemption_(body) {
  if (!OWNER_EMAIL) return;
  var venue = body.venue || '(unknown venue)';
  var code = body.code || '(unknown code)';
  var when = body.ts ? new Date(body.ts) : new Date();
  var subject = 'FeelBG: code ' + code + ' redeemed at ' + venue;
  var message = 'A referral code was just marked as redeemed.\n\n' +
    'Venue: ' + venue + '\n' +
    'Code: ' + code + '\n' +
    'Redeemed at: ' + when.toString() + '\n\n' +
    'This is for your commission records — see the full log in your ' +
    'Referrals sheet or at /admin/.';
  try {
    MailApp.sendEmail(OWNER_EMAIL, subject, message);
  } catch (err) {
    // Swallow — a failed notification shouldn't fail the logging request.
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = clean_(body.action);
    if (!ALLOWED_ACTIONS[action]) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'unknown action' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var sheet = getSheet_();
    var ts = body.ts ? new Date(body.ts) : new Date();
    sheet.appendRow([
      ts,
      clean_(body.code),
      clean_(body.venue),
      action,
      new Date(),
      clean_(body.venueId),
      clean_(body.lang),
      clean_(body.source),
      clean_(body.device)
    ]);
    if (action === 'code_redeemed') notifyOwnerOfRedemption_(body);
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
      action: values[i][3],
      // Blank on every row written before tracking existed. The dashboard
      // falls back to the venue name when the id is missing, so old rows
      // still group correctly.
      venueId: values[i][5] || '',
      lang: values[i][6] || '',
      source: values[i][7] || '',
      device: values[i][8] || ''
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, rows: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}
