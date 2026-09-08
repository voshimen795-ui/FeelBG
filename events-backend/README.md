# FeelBG club events backend

This is the store behind the "live tonight / upcoming" text that shows up on
a nightlife venue's popup — a Google Sheet + a small Apps Script web app in
front of it, same shape as `referral-backend/`, but its own script and its
own sheet (see the doc comment at the top of `Code.gs` for why).

## Why this exists instead of an API

There is no reliable public API for Belgrade club events. Resident Advisor —
the one platform that actually covers this scene — publishes no developer
API, only unofficial third-party scrapers that break its terms of service
and can stop working without warning. Bandsintown covers touring artists and
needs a written partnership agreement, not one-off club nights. Ticketmaster
doesn't list Serbia as a covered market. So instead of scraping something
that could disappear at any time, this is a place for the FeelBG team to
type the same handful of facts (title, date, time, price, one line of text)
that would otherwise need code changes and a redeploy.

## Deploy (5 minutes, free)

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet — e.g. "FeelBG Events". This is separate from the
   referral spreadsheet; don't reuse that one.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the placeholder `myFunction() {}` code and paste in the full
   contents of `Code.gs` from this folder.
4. Change the `EVENTS_KEY` constant near the top to a private random string
   (this is what stops anyone who finds the script URL from reading or
   writing event rows — it's not a login, just a shared secret).
5. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**, then authorize the script when Google prompts you
   (it's your own script touching your own spreadsheet).
7. Copy the **Web app URL** it gives you (ends in `/exec`).
8. In the Vercel dashboard (Settings → Environment Variables), set:

   | Variable | Value |
   |---|---|
   | `FEELBG_EVENTS_ENDPOINT` | the `/exec` URL from step 7 |
   | `FEELBG_EVENTS_KEY` | the same string you put in `EVENTS_KEY` |

   `ADMIN_PASSWORD` should already be set from the referral/dashboard setup —
   `/admin/events.html` reuses it, there's no separate password to add.
9. Redeploy the site. Every nightlife popup will now check for events; the
   admin form at `/admin/events.html` will be able to add and deactivate them.

Until `FEELBG_EVENTS_ENDPOINT` is set, `/api/events` quietly returns an empty
list — no error, no broken popup, just no events section shown anywhere.

## Updating the script later

If you edit `Code.gs` in the Apps Script editor after the first deploy, you
need **Deploy → Manage deployments → edit (pencil icon) → New version** for
the changes to take effect — saving alone doesn't update the live web app.

## Adding and retiring events

Day to day, none of this needs the Apps Script editor or the spreadsheet
directly — use `/admin/events.html` (same password as `/admin/`):

- **Add an event**: pick the club, fill in title / date / time / price / a
  line of description (English required, Serbian optional), submit. It shows
  up on that club's popup immediately — `/api/events` caches for two minutes
  at most.
- **Retire an event**: find it in the list on the same page and click
  **Deactivate**. Nothing is deleted — the row stays in the sheet with
  `Active` set to `false` — so the history is still there if you ever want
  to check what ran.
- An event also stops showing on its own once its date has passed, whether
  or not it was deactivated — `api/events.js` only ever returns events dated
  today or later.

## What's stored

One row per event: `Id, VenueSlug, Title, TitleSr, Date, Time, Price,
Description, DescriptionSr, TicketUrl, Active, CreatedAt`.

`VenueSlug` is the club's URL slug from `js/venues.js` (`money`, `lasta`,
`leto`, `sindikat`, …) — the admin form fills this in from a dropdown, so it
can never drift from the real venue list. `TicketUrl` is accepted but not
required; the popup doesn't link to it yet (nothing currently sells tickets
for these nights), it's just there so it doesn't need a column-order change
later if that changes.

No personal data is ever involved — this is the venue's own party listing,
not anything about a visitor.
