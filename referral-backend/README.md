# FeelBG referral logging backend

This is the free-tier logging backend for the referral system: a Google
Sheet + a small Apps Script web app in front of it. Every WhatsApp booking,
directions click, and voucher view logs a row (timestamp, code, venue,
action) — no accounts, no personal data.

The referral codes, WhatsApp prefill, and voucher screen on the site all
work **without** this backend deployed — they just won't be logged anywhere
but the visitor's own browser (`localStorage`), so `/admin/`
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
   your spreadsheet, and `/admin/` will read from it.

## The /admin dashboard

`/admin/` reads this same log and shows venue traffic: page views, outbound
clicks (reserve, phone, website, directions) and the conversion between them.

It is gated by a real password, checked server-side in `api/admin.js`, so set
three environment variables in the Vercel dashboard (Settings → Environment
Variables) and redeploy:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | whatever you want to type at `/admin/` |
| `FEELBG_SHEETS_ENDPOINT` | the same `/exec` URL from step 7 above |
| `FEELBG_SHEETS_KEY` | the same string you put in `DASHBOARD_KEY` |

Keep these out of `js/referral-config.js`. That file ships to every visitor —
which is exactly why the old `/partner-report.html` could not really protect
anything, and why it now just redirects to `/admin/`.

Until `FEELBG_SHEETS_ENDPOINT` is set the dashboard loads and says so rather
than showing an empty page that looks like "no traffic yet".

## Updating the script later

If you edit `Code.gs` in the Apps Script editor after the first deploy, you
need **Deploy → Manage deployments → edit (pencil icon) → New version** for
the changes to take effect — saving alone doesn't update the live web app.

## What gets logged

Each row: `Timestamp, Code, Venue, Action, Received At, Venue ID, Lang, Source, Device`.

`Action` is one of:

- **Referral flow** — `qr_scan`, `code_generated`, `whatsapp_booking_initiated`,
  `voucher_viewed`, `code_redeemed`
- **Traffic** — `venue_view` (someone opened a venue page), `reserve_clicked`,
  `phone_clicked`, `website_clicked`, `directions_clicked` (someone left for the venue)

`Venue ID` is the venue's URL slug and is what `/admin/` groups on. The `Venue`
column keeps the display name, both for readability and because rows written
before the slug existed have nothing else — but the name alone is not a safe
key, since the detail popup passes the *translated* title and would otherwise
split one venue into a row per language.

`Source` is a coarse label for where the visit came from (`google`, `instagram`,
`direct`, …), resolved once per session from the referring page; `Lang` is the
chosen UI language; `Device` is `mobile` or `desktop`.

**No personal data is ever sent** — no name, phone number, IP address, cookie or
visitor id, and no third-party analytics script. Events are counted, never
joined back to a person, which is what keeps this outside the scope of a consent
banner: a row contains nothing that identifies who produced it.

Actions not on the list above are rejected by `doPost`. The write endpoint is
necessarily open — a tracker running in a visitor's browser cannot hold a secret
— so that whitelist, plus a 120-character cap per field, is what stops the sheet
filling up with arbitrary strings.

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
