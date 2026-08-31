/**
 * URL slugs for venue pages.
 *
 * This is deliberately NOT the same thing as `CardRenderer.venueSlug()`. That
 * one maps a name to a translation key (`venue.zlatni_bokal.desc`), is ASCII-only
 * and turns every diacritic into an underscore — Ušće Park becomes `u_e_park`.
 * Those keys are already written into venue-translations.js and
 * attraction-translations.js, so that function must keep behaving exactly as it
 * does. Changing it would silently break every translated venue.
 *
 * A URL wants the opposite: transliterate rather than destroy, and use hyphens.
 * Ušće Park becomes `usce-park`, which is both readable and searchable.
 *
 * Venues carry their slug as an explicit `slug` field in js/venues.js rather
 * than deriving it at render time. A URL is a permanent promise — deriving it
 * from the name means a rename silently breaks every inbound link and loses
 * whatever ranking the page had.
 */

// Serbian Latin diacritics. NFD normalisation alone gets č → c but leaves đ
// untouched, because đ is a distinct letter rather than d + a combining mark.
//
// đ maps to "dj", not "d". When Serbian speakers type without diacritics they
// write "tvrdjava", "Djordje", "Karadjordjeva" — "dj" is the conventional ASCII
// rendering and therefore the one people actually search for. The other four
// letters have no such digraph convention and map to a single character.
const TRANSLITERATE = {
    č: 'c', ć: 'c', š: 's', ž: 'z', đ: 'dj',
    Č: 'c', Ć: 'c', Š: 's', Ž: 'z', Đ: 'dj',
};

export function slugify(name) {
    return String(name)
        .split('')
        .map((ch) => TRANSLITERATE[ch] ?? ch)
        .join('')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        // Drop apostrophes rather than hyphenating them, so "St. Mark's Church"
        // reads st-marks-church and not st-mark-s-church.
        .replace(/['‘’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/** The slug to publish a venue under. */
export function venueUrlSlug(venue) {
    return venue.slug || slugify(venue.name);
}
