# FeelBG — materijal za štampu

QR kod i flajer za FeelBG. Ništa iz ovog foldera se ne učitava na sajtu — ovo je
isključivo materijal za štampu i za deljenje.

Brend boje: **Royal Blue `#1e3a8a`**, **Bronze Gold `#b8860b`**, tamno teget
`#0a1128`, krem `#f4efe2`. Fontovi: **Playfair Display** (naslovi) i
**Montserrat / Poppins** (tekst) — isti kao na sajtu, ugrađeni su u PDF-ove.

---

## Šta da pošalješ štampariji

| Fajl | Šta je | Format |
|---|---|---|
| `print/feelbg-flyer-a5-navy-PRINT-bleed.pdf` | **Flajer, teget verzija — glavna** | 154 × 216 mm (A5 + 3 mm bleed) |
| `print/feelbg-flyer-a5-cream-PRINT-bleed.pdf` | Flajer, krem verzija (jeftinija štampa) | 154 × 216 mm (A5 + 3 mm bleed) |
| `print/feelbg-qr-badges-a4-sheet-16up.pdf` | 16 QR kartica na A4, sa linijama za sečenje | A4 |
| `print/feelbg-qr-badge-white-45x60mm.pdf` | Jedna QR kartica, bela | 45 × 60 mm |
| `print/feelbg-qr-badge-navy-45x60mm.pdf` | Jedna QR kartica, teget | 45 × 60 mm |
| `print/feelbg-qr-40mm.pdf` | Samo QR kod, vektorski | 40 × 40 mm |

Svi PDF-ovi su **vektorski**, sa tačnim dimenzijama strane i upisanim
TrimBox/BleedBox — štamparija odmah vidi gde se seče.

### Za štampu kod kuće / u kancelariji
`print/feelbg-flyer-a5-navy.pdf` i `print/feelbg-flyer-a5-cream.pdf` su tačno
A5 (148 × 210 mm), bez bleed-a. Štampaj na 100% (bez „fit to page").

### Za sajt, Instagram, WhatsApp
`print/feelbg-qr.png` (2000 × 2000 px), `print/feelbg-qr.svg` (vektor),
`print/feelbg-qr-transparent.svg` (bez bele pozadine — ide samo na svetlu podlogu).
`.png` fajlovi flajera su pregled, **ne šalji ih u štampariju**.

---

## Preporuka za štampu flajera

- **Papir:** 250–300 g mat kunsdruk. Za teget verziju uzmi mat plastifikaciju —
  tamne pune površine se inače lako isprljaju od prstiju.
- **Boje:** fajlovi su u RGB. Štamparija ih konvertuje u CMYK; zlatna
  `#b8860b` u CMYK-u ispada nešto tamnija/mutnija. Ako hoćeš da zlatna stvarno
  „blista", traži **Pantone 4505 C** ili zlatnu foliju na logotipu i okviru —
  to je najveća razlika u utisku po najmanjem trošku.
- **Tiraž:** teget verzija izgleda skuplje, krem verzija je jeftinija za štampu
  i čitljivija na slabom svetlu (npr. u kafiću uveče).

## QR kod — tehnički detalji

- Vodi na `HTTPS://FEELBG.COM`. Velika slova su namerna: domen i `https` nisu
  osetljivi na velika/mala slova, a velikim slovima kod staje u **verziju 2
  (25 × 25 modula)** umesto 29 × 29 — to znači krupnije module i sigurnije
  skeniranje na maloj površini.
- **Nivo korekcije greške: H (najviši, 30%)** — zato monogram u sredini ne
  smeta čitanju.
- **Najmanja veličina za štampu: 20 mm.** Ispod toga ne idi. Na flajeru je
  28 mm, na kartici 28,5 mm.
- Oko koda mora ostati **bela ivica (quiet zone)** — već je ugrađena u fajl,
  samo nemoj da kropuješ kod ili da ga lepiš na sliku/tamnu podlogu.
- Ne menjaj boje koda. Tamnoplavi moduli na beloj podlozi imaju kontrast koji
  skeneri traže; svetlija zlatna na beloj ne bi radila pouzdano.

Kod je testiran dekodiranjem **iz samih PDF fajlova** (renderovano na 600 dpi,
pa smanjeno na rezolucije koje telefon realno vidi, sa zamućenjem, šumom i
nagibom). Svejedno, pre velikog tiraža odštampaj jedan primerak i probaj
telefonom — to je jedini pravi test.

## Pre nego što pošalješ u štampu — proveri

- **Fotografije na flajeru** (Kalemegdan, klub, kafe) su sa sajta. Ako za neku
  nemaš pravo na komercijalnu upotrebu u štampi, zameni je — u
  `brand/tools/build.py`, lista `PHOTOS`.
- Ako želiš da meriš koliko ljudi skenira, mogu da napravim kod koji vodi na
  `feelbg.com/?utm_source=flyer`. To povećava kod na 29 × 29 modula, pa bi tada
  minimalna veličina štampe bila oko 25 mm.

---

## Kako se fajlovi ponovo generišu

```bash
cd brand/tools
pip install segno pillow pypdfium2 pikepdf opencv-python-headless
python3 mkfonts.py     # skida Playfair/Montserrat/Poppins i ugrađuje ih u fonts.css
python3 build.py       # pravi sve PDF-ove i preglede u brand/print/
python3 scan_test.py   # testira da li se QR čita iz gotovih PDF-ova
```

Tekst flajera je u `build.py` (`ROWS` i funkcija `flyer_body`), boje na vrhu
fajla, a sam QR kod u `qr.py`.
