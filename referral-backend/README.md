# FeelBG referral logging backend

This is the free-tier logging backend for the referral system: a Google
Sheet + a small Apps Script web app in front of it. Every WhatsApp booking,
directions click, and voucher view logs a row (timestamp, code, venue,
action) — no accounts, no personal data.

The referral codes, WhatsApp prefill, and voucher screen on the site all
work **without** this backend deployed — they just won't be logged anywhere
but the visitor's own browser (`localStorage`), so `/partner-report.html`
would only be able to show that one device's activity. Deploying this gets
you a real cross-device log for commission invoicing.

## Deploy (5 minutes, free)

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet. Name it whatever you like, e.g. "FeelBG Referrals".
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the placeholder `myFunction() {}` code and paste in the full
   contents of `Code.gs` from this folder.
4. Change the `DASHBOARD_KEY` constant near the top to a private random
   string (this is what stops random visitors from reading your referral
   data — it's not a real login, just a shared secret in the URL).
5. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**, then authorize the script when Google prompts you
   (it's your own script touching your own spreadsheet).
7. Copy the **Web app URL** it gives you (ends in `/exec`).
8. Open `js/referral-config.js` in the FeelBG repo and set:
   ```js
   window.FEELBG_REFERRAL_LOG_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';
   window.FEELBG_REFERRAL_DASHBOARD_KEY = 'the-same-string-you-put-in-DASHBOARD_KEY';
   ```
9. Commit, push, redeploy the site. Referral events will now append rows to
   your spreadsheet, and `/partner-report.html` will read from it.

## Updating the script later

If you edit `Code.gs` in the Apps Script editor after the first deploy, you
need **Deploy → Manage deployments → edit (pencil icon) → New version** for
the changes to take effect — saving alone doesn't update the live web app.

## What gets logged

Each row: `Timestamp, Code, Venue, Action, Received At`. `Action` is one of
`code_generated`, `whatsapp_booking_initiated`, `directions_clicked`,
`voucher_viewed`, `qr_scan`, `code_redeemed`. No names, phone numbers, or
other personal data are ever sent — only the anonymous code, the venue name,
and the action.

## Redemption emails

Every visitor who has an active code sees a small gold circle on every page
of the site, which shows their code(s) again and lets them (or the venue
staff) tap "Mark as Redeemed". The moment that happens, if this backend is
deployed, `doPost` in `Code.gs` calls `MailApp.sendEmail(...)` and you get an
email at `OWNER_EMAIL` (top of `Code.gs`, defaults to the address this build
was requested from — change it if that's wrong) with the venue, the code,
and the timestamp. This uses Apps Script's built-in `MailApp` — no extra
setup, no API keys, and it's inside the free daily quota (100 emails/day on
a plain Gmail account, which this use case won't come close to).

Without this backend deployed, "Mark as Redeemed" still works — it clears
the code from the visitor's badge and logs the event to their own browser —
but you won't get an email, since a static site has no way to send one on
its own.

## Per-venue QR codes / share links

`window.FeelBGReferral.getShareLink(venueName)` (from `js/referral.js`, in
the browser console or wired into a future admin UI) returns a URL like
`https://feelbg.com/restaurants.html?ref=FBG-KAF-4X7K`. Feed that URL into
any free QR code generator (e.g. the built-in one at qr-code-generator.com)
and print it for the venue's entrance or till. When a visitor scans it and
later completes a WhatsApp booking during that same visit, the booking is
attributed to the scanned code instead of a freshly minted one — this is
what covers "just walked in" foot traffic.
