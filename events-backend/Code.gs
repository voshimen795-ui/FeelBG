/**
 * FeelBG club events backend — Google Apps Script Web App.
 *
 * Deploy steps: see README.md in this folder. Once deployed, paste the web
 * app URL and EVENTS_KEY into the FEELBG_EVENTS_ENDPOINT / FEELBG_EVENTS_KEY
 * environment variables in the Vercel dashboard — api/events.js is the only
 * thing that talks to this script; the browser never sees this URL.
 *
 * A separate script from referral-backend/Code.gs on purpose. That one is an
 * append-only log — every row is one click, written once and never touched
 * again — which is the wrong shape for "type in a party, then switch it off
 * once it's over". This sheet is small and gets edited: rows are added and
 * later flipped inactive, so it gets its own script, its own sheet and its
 * own key rather than growing a second job inside the referral log.
 */

var SHEET_NAME = 'Events';
var EVENTS_KEY = 'change-me-to-a-private-key';

/**
 * Column order. Append-only like the referral sheet: add a name to the end,
 * never reorder or remove one, or every row already written silently shifts.
 */
var COLUMNS = [
  'Id', 'VenueSlug', 'Title', 'TitleSr', 'Date', 'Time', 'Price',
  'Description', 'DescriptionSr', 'TicketUrl', 'Active', 'CreatedAt'
];

/** Longest string accepted in a short field vs. a description. */
var MAX_SHORT = 120;
var MAX_LONG = 300;

function clean_(value, max) {
  return String(value == null ? '' : value).slice(0, max || MAX_SHORT);
}

function checkKey_(key) {
  return !!EVENTS_KEY && key === EVENTS_KEY;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
  }
  return sheet;
}

/** A Sheet cell holding a date-looking string is auto-converted to a real
 *  Date by Google Sheets, so the Date column can come back as either — this
 *  always hands back a plain 'YYYY-MM-DD' string either way. */
function isoDate_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, 'Etc/GMT', 'yyyy-MM-dd');
  return String(value == null ? '' : value).slice(0, 10);
}

/**
 * Writes are server-to-server only — api/events.js is the sole caller, with
 * ADMIN_PASSWORD already checked on that side — but the key is still
 * required here too, so a leaked script URL alone can't be used to write
 * rows into the sheet.
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (!checkKey_(body.key)) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    var sheet = getSheet_();

    if (body.action === 'add_event') {
      var ev = body.event || {};
      var id = Utilities.getUuid();
      sheet.appendRow([
        id,
        clean_(ev.venueSlug),
        clean_(ev.title),
        clean_(ev.titleSr),
        clean_(ev.date, 10),
        clean_(ev.time, 40),
        clean_(ev.price, 40),
        clean_(ev.description, MAX_LONG),
        clean_(ev.descriptionSr, MAX_LONG),
        clean_(ev.ticketUrl, MAX_LONG),
        true,
        new Date()
      ]);
      return json_({ ok: true, id: id });
    }

    if (body.action === 'deactivate_event') {
      var targetId = clean_(body.id);
      var values = sheet.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][0]) === targetId) {
          sheet.getRange(i + 1, 11).setValue(false); // Active column
          return json_({ ok: true });
        }
      }
      return json_({ ok: false, error: 'not_found' });
    }

    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Also key-gated: this is the FeelBG team's own unpublished event copy,
 *  not something to leave open at a guessable URL. */
function doGet(e) {
  var key = (e.parameter && e.parameter.key) || '';
  if (!checkKey_(key)) {
    return json_({ ok: false, error: 'unauthorized' });
  }
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    rows.push({
      id: r[0],
      venueSlug: r[1],
      title: r[2],
      titleSr: r[3],
      date: isoDate_(r[4]),
      time: r[5],
      price: r[6],
      description: r[7],
      descriptionSr: r[8],
      ticketUrl: r[9],
      // Blank (never-written) reads as active — only an explicit `false`
      // written by deactivate_event above turns a row off.
      active: r[10] !== false
    });
  }
  return json_({ ok: true, rows: rows });
}
