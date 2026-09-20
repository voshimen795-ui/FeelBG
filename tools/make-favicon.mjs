#!/usr/bin/env node
/**
 * Build the site icons from the FeelBG monogram.
 *
 *   node tools/make-favicon.mjs           # write the icons
 *   node tools/make-favicon.mjs --check   # verify the committed icons are current
 *
 * Google shows a favicon next to every result, and until this existed no page
 * on the site declared one — so the search listing carried the generic grey
 * globe instead of the mark. Google looks for `<link rel="icon">` in the home
 * page head and for /favicon.ico at the root, wants a square that is a
 * multiple of 48px, and needs the file crawlable. This produces all of that
 * from assets/images/logo/feelbg-monogram-f.png, the gold "F" disc the header
 * already uses.
 *
 * Output (committed, because vercel.json runs no build step):
 *   favicon.ico                              16 + 32 + 48, what /favicon.ico probes hit
 *   assets/images/logo/favicon-96.png        the <link rel="icon"> Google reads
 *   assets/images/logo/favicon-192.png       high-DPI, and Android home screens
 *   assets/images/logo/apple-touch-icon.png  180x180, flattened onto navy
 *
 * Why it resizes by hand: the container has no ImageMagick, no PIL and the
 * project has no image dependency, so there is a small PNG codec below. It
 * only needs to read one known file — 8-bit RGBA, non-interlaced — and
 * writes the same, so it asserts that rather than covering the format.
 *
 * Requires Node 18+. No dependencies.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'assets', 'images', 'logo', 'feelbg-monogram-f.png');
const CHECK = process.argv.slice(2).includes('--check');

/* The navy the monogram sits on, for icons that cannot be transparent.
   Matches --color-navy in css/tokens.css. */
const NAVY = [10, 22, 51];

/* ------------------------------------------------------------------ *
 * PNG
 * ------------------------------------------------------------------ */

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
    }
    return table;
})();

function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
}

/** Decode an 8-bit RGBA, non-interlaced PNG into {width, height, pixels}. */
function decodePng(buf) {
    if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error('not a PNG');
    let offset = 8;
    let header = null;
    const idat = [];
    while (offset < buf.length) {
        const length = buf.readUInt32BE(offset);
        const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
        const data = buf.subarray(offset + 8, offset + 8 + length);
        if (type === 'IHDR') {
            header = {
                width: data.readUInt32BE(0), height: data.readUInt32BE(4),
                bitDepth: data[8], colorType: data[9], interlace: data[12],
            };
        } else if (type === 'IDAT') {
            idat.push(data);
        } else if (type === 'IEND') {
            break;
        }
        offset += 12 + length;
    }
    if (!header) throw new Error('no IHDR');
    const { width, height, bitDepth, colorType, interlace } = header;
    if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
        throw new Error(`unsupported PNG: bitDepth ${bitDepth}, colorType ${colorType}, `
            + `interlace ${interlace} — expected 8-bit RGBA, non-interlaced`);
    }

    const raw = inflateSync(Buffer.concat(idat));
    const bpp = 4;
    const stride = width * bpp;
    const pixels = Buffer.alloc(height * stride);

    /* Reverse the per-scanline filters (PNG spec 9.2). Each row is prefixed
       with its filter type and predicts from the pixel to the left (a) and
       the row above (b, and c for the pixel above-left). */
    for (let y = 0; y < height; y++) {
        const filter = raw[y * (stride + 1)];
        const src = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
        const row = pixels.subarray(y * stride, (y + 1) * stride);
        const prev = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;
        for (let x = 0; x < stride; x++) {
            const a = x >= bpp ? row[x - bpp] : 0;
            const b = prev ? prev[x] : 0;
            const c = prev && x >= bpp ? prev[x - bpp] : 0;
            let value;
            switch (filter) {
                case 0: value = src[x]; break;
                case 1: value = src[x] + a; break;
                case 2: value = src[x] + b; break;
                case 3: value = src[x] + ((a + b) >> 1); break;
                case 4: {
                    const p = a + b - c;
                    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
                    value = src[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
                    break;
                }
                default: throw new Error(`unknown filter ${filter} on row ${y}`);
            }
            row[x] = value & 0xff;
        }
    }
    return { width, height, pixels };
}

function encodePng({ width, height, pixels }) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 6;   // colour type: RGBA
    const stride = width * 4;
    const raw = Buffer.alloc(height * (stride + 1));
    for (let y = 0; y < height; y++) {
        raw[y * (stride + 1)] = 0;  // filter: none
        pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    }
    return Buffer.concat([
        PNG_SIG,
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

/* ------------------------------------------------------------------ *
 * Resampling
 * ------------------------------------------------------------------ */

/**
 * Box-filter downscale. Alpha is premultiplied before averaging and undone
 * after: averaging straight RGBA pulls the colour of fully transparent
 * pixels into the edge, which on this mark would ring the gold rim with a
 * dark halo.
 */
function resize(image, size) {
    const { width: sw, height: sh, pixels: src } = image;
    const out = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
        const y0 = Math.floor((y * sh) / size);
        const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * sh) / size));
        for (let x = 0; x < size; x++) {
            const x0 = Math.floor((x * sw) / size);
            const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * sw) / size));
            let r = 0, g = 0, b = 0, a = 0, n = 0;
            for (let sy = y0; sy < y1; sy++) {
                for (let sx = x0; sx < x1; sx++) {
                    const i = (sy * sw + sx) * 4;
                    const alpha = src[i + 3] / 255;
                    r += src[i] * alpha;
                    g += src[i + 1] * alpha;
                    b += src[i + 2] * alpha;
                    a += src[i + 3];
                    n++;
                }
            }
            const o = (y * size + x) * 4;
            const meanAlpha = a / n;
            if (meanAlpha > 0) {
                const undo = 255 / meanAlpha;  // divide the mean back out
                out[o] = Math.min(255, Math.round((r / n) * undo));
                out[o + 1] = Math.min(255, Math.round((g / n) * undo));
                out[o + 2] = Math.min(255, Math.round((b / n) * undo));
            }
            out[o + 3] = Math.round(meanAlpha);
        }
    }
    return { width: size, height: size, pixels: out };
}

/** Composite over an opaque colour. iOS ignores alpha and would render the
    transparent corners black, so the touch icon is flattened here instead. */
function flatten(image, [br, bg, bb]) {
    const { width, height, pixels } = image;
    const out = Buffer.alloc(pixels.length);
    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3] / 255;
        out[i] = Math.round(pixels[i] * a + br * (1 - a));
        out[i + 1] = Math.round(pixels[i + 1] * a + bg * (1 - a));
        out[i + 2] = Math.round(pixels[i + 2] * a + bb * (1 - a));
        out[i + 3] = 255;
    }
    return { width, height, pixels: out };
}

/* ------------------------------------------------------------------ *
 * ICO
 *
 * A PNG-payload ICO, which every browser since IE7 reads. Sizes are stored
 * as a single byte, so 256 is written as 0 — irrelevant here, but the reason
 * the field is masked.
 * ------------------------------------------------------------------ */

function encodeIco(images) {
    const payloads = images.map((img) => encodePng(img));
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);              // reserved
    header.writeUInt16LE(1, 2);              // type: icon
    header.writeUInt16LE(images.length, 4);
    const directory = Buffer.alloc(16 * images.length);
    let dataOffset = header.length + directory.length;
    images.forEach((img, i) => {
        const e = 16 * i;
        directory[e] = img.width & 0xff;
        directory[e + 1] = img.height & 0xff;
        directory[e + 2] = 0;                // palette colours: none
        directory[e + 3] = 0;                // reserved
        directory.writeUInt16LE(1, e + 4);   // colour planes
        directory.writeUInt16LE(32, e + 6);  // bits per pixel
        directory.writeUInt32LE(payloads[i].length, e + 8);
        directory.writeUInt32LE(dataOffset, e + 12);
        dataOffset += payloads[i].length;
    });
    return Buffer.concat([header, directory, ...payloads]);
}

/* ------------------------------------------------------------------ */

const source = decodePng(readFileSync(SOURCE));
if (source.width !== source.height) {
    throw new Error(`${path.basename(SOURCE)} is ${source.width}x${source.height}; `
        + 'the icon source must be square');
}

const outputs = [
    /* 96 and 192 are multiples of 48, which is what Google asks for. */
    ['assets/images/logo/favicon-96.png', encodePng(resize(source, 96))],
    ['assets/images/logo/favicon-192.png', encodePng(resize(source, 192))],
    ['assets/images/logo/apple-touch-icon.png', encodePng(flatten(resize(source, 180), NAVY))],
    ['favicon.ico', encodeIco([16, 32, 48].map((s) => resize(source, s)))],
];

let stale = 0;
for (const [rel, buffer] of outputs) {
    const file = path.join(ROOT, rel);
    let current = null;
    try { current = readFileSync(file); } catch { /* not written yet */ }
    if (current && current.equals(buffer)) {
        if (!CHECK) console.log(`  unchanged  ${rel}`);
        continue;
    }
    stale++;
    if (CHECK) {
        console.error(`  STALE      ${rel}`);
        continue;
    }
    writeFileSync(file, buffer);
    console.log(`  ${current ? 'updated' : 'wrote'}    ${rel} (${buffer.length} bytes)`);
}

if (CHECK && stale) {
    console.error(`\n${stale} icon(s) out of date — run: node tools/make-favicon.mjs\n`);
    process.exit(1);
}
console.log(CHECK
    ? `${outputs.length} icon(s) are up to date.`
    : `\nDone — ${outputs.length} icon(s) from ${path.relative(ROOT, SOURCE)}.`);
