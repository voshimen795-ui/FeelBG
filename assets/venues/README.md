# Venue photographs

Cards whose venue has no `image` fall back to a tinted panel with the venue's
initial. That is deliberate — a placeholder that looks like a placeholder,
rather than a stock photo of some other building standing in for the real one.

## Getting the photos

`tools/fetch-venue-photos.mjs` pulls freely-licensed photographs from Wikimedia
Commons, which is the only large library where the licence and the author come
back from the API alongside the file, so the credits can be generated instead
of guessed.

```sh
node tools/fetch-venue-photos.mjs                # list candidates, write nothing
node tools/fetch-venue-photos.mjs --download     # save the top match per venue
node tools/fetch-venue-photos.mjs --download --apply   # ...and point venues.js at them
```

Review mode is the default on purpose. A Commons search can return a photo of
the right city and the wrong building, so the script prints each candidate with
its Commons page URL and only accepts files whose own title mentions the venue.
Read the list, open the ones you are unsure about, then run it again with
`--download`. `--only="Avala,Ušće Park"` narrows it to specific venues.

Files land in `assets/venues/<slug>.jpg` at 2560px wide by default
(`--width=3840` for true 4K). 2560 is the recommendation: it is already
retina-sharp for every card and hero on this site, and 4K originals run 3-6 MB
each, which is more page weight than the sharpness is worth.

**Licences carry obligations.** Most Commons files are CC BY or CC BY-SA, both
of which require the author to be credited wherever the photo appears. The
script writes `CREDITS.md` next to the files with the author, licence and
source for each one — keep it in step with what ships, and put the credits
somewhere on the site.

## Still needed

Commons will not have a usable photo of a nightclub, a cafe or a shopping
centre — those need a photo from the venue itself, your own camera, or a stock
licence. The landmarks are the ones it covers well.

### Parks (8)

- [ ] Tašmajdan Park — Palilula
- [ ] Košutnjak Forest — Čukarica
- [ ] Jevremovac Botanical Garden — Stari Grad
- [ ] Ušće Park — Novi Beograd
- [ ] Zvezdara Forest — Zvezdara
- [ ] Pionirski Park — Stari Grad
- [ ] Great War Island — Zemun
- [ ] Banjica Forest — Voždovac

### Churches (5)

- [ ] Ružica Church — Stari Grad
- [ ] St. Petka Chapel — Stari Grad
- [ ] Saborna Crkva — Stari Grad
- [ ] St. Mark's Church — Palilula
- [ ] Alexander Nevsky Church — Dorćol

### Museums (3)

- [ ] Museum of Yugoslavia — Savski Venac
- [ ] Museum of Contemporary Art — Novi Beograd
- [ ] Ethnographic Museum — Stari Grad

### Shopping centres (6)

- [ ] Ušće Shopping Center — Novi Beograd
- [ ] Galerija Belgrade — Savski Venac
- [ ] Rajićeva Shopping Center — Stari Grad
- [ ] Delta City — Novi Beograd
- [ ] BEO Shopping Center — Voždovac
- [ ] Stadion Shopping Center — Voždovac

### Clubs (5)

- [ ] Drugstore — Savski Venac
- [ ] Klub 20/44 — Novi Beograd
- [ ] Freestyler — Novi Beograd
- [ ] Stefan Braun — Stari Grad
- [ ] Ben Akiba — Stari Grad

### Cafes (2)

- [ ] Kafeterija — Stari Grad
- [ ] Pržionica D59B — Dorćol

Drop a file into `assets/venues/` and set the venue's `image` field in
`js/venues.js` to its path; nothing else needs changing.
