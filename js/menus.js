'use strict';
/**
 * Real menus, transcribed from what each restaurant publishes.
 *
 * Source per venue is recorded in `source` and `updated`. Nothing here is
 * invented: if a dish, a price or a portion weight is not on the venue's own
 * menu it is not in this file, and a venue with no menu simply has no entry —
 * the card then shows no menu button rather than an empty sheet.
 *
 * Shape
 *   name    Serbian name, exactly as the restaurant prints it. This is the
 *           string a visitor points at when ordering, so it stays Serbian in
 *           every language of the site.
 *   en      the venue's own English gloss. Dva Jelena and Temperament print
 *           one; Zlatni Bokal's menu is Serbian only, so those glosses are
 *           translations of the printed description, marked in `source`.
 *   price   number, Serbian dinars. Menus are priced in RSD and that is what
 *           the visitor pays, so the sheet shows RSD and does not convert —
 *           a converted figure would be out of date the week it was written.
 *   unit    portion weight or count, when the menu states one.
 *   pork    the menu's own pig mark. Kept because a large share of FeelBG's
 *           visitors need it, and guessing it from a dish name is not safe.
 *   half    the menu's own half-portion mark (charged at 70%).
 *
 * Section headings are keys into MENU_SECTION_LABELS below, so the course
 * names translate with the rest of the site while the dishes do not.
 */
(function () {
    var MENUS = {};

    /* ============================================================
       DVA JELENA — Skadarska 32
       Transcribed from the restaurant's own 2026 food menu (PDF),
       which prints every dish in Serbian and English.
       ============================================================ */
    MENUS.dva_jelena = {
        source: 'Restaurant’s own 2026 menu',
        updated: '2026',
        cover: 200, // KUVER / couvert
        notes: ['halfPortion', 'porkMark', 'allergens'],
        sections: [
            {
                key: 'coldStarters',
                items: [
                    { name: 'Posluženje "Dva Jelena"', en: 'Collection of appetizers served with pickled vegetables', price: 2590 },
                    { name: 'Pršuta', en: 'Traditional smoked beef or pork ham, served with olives', price: 1090, unit: '100g' },
                    { name: 'Čvarci', en: 'Pork cracklings served with pickled onion', price: 690, unit: '100g', pork: true },
                    { name: '"Gostiljski sir"', en: 'Serbian cheese from Zlatibor', price: 1190, unit: '100g' },
                    { name: 'Kajmak', en: 'Serbian cream cheese spread', price: 490, unit: '90g' },
                    { name: 'Mladi sir', en: 'Serbian cottage cheese', price: 420, unit: '100g' },
                    { name: 'Zlatarski sir', en: 'Serbian cheese from Zlatar', price: 640, unit: '100g' },
                    { name: 'Paprika u pavlaci', en: 'Pickled bell peppers in sour cream', price: 460 },
                    { name: 'Urnebes', en: 'Cream cheese with garlic and ground paprika spread', price: 440, unit: '90g' },
                    { name: 'Kulen', en: 'Traditional pork sausage', price: 990, unit: '100g', pork: true },
                    { name: 'Pirotska peglana', en: 'Traditional delicacy sausage', price: 1700, unit: '100g' },
                    { name: 'Tanjir sireva', en: 'Cheese plate', price: 1390, unit: '200g' },
                    { name: 'Hercegovački sir iz mješine', en: 'Sack cheese from Hercegovina', price: 790 },
                    { name: 'Pršuta od Moravke', en: 'Moravka ham', price: 1600, unit: '100g', pork: true },
                    { name: 'Kulen od Moravke', en: 'Moravka sausage', price: 990, unit: '100g', pork: true },
                    { name: 'Salama provansa', en: 'Provence-style local ham', price: 1090, unit: '100g', pork: true },
                    { name: 'Vrat od Moravke', en: 'Smoked Moravka pork neck', price: 1090, unit: '100g', pork: true },
                    { name: 'Njeguška kobasica', en: 'Spicy Moravka sausage', price: 1090, unit: '100g', pork: true }
                ]
            },
            {
                key: 'warmStarters',
                items: [
                    { name: 'Domaća pita sa sirom', en: 'Traditional cheese pie', price: 560 },
                    { name: 'Proja', en: 'Traditional corn bread', price: 460, unit: '3 pcs' },
                    { name: 'Šampinjoni iz užarenog tiganja', en: 'Stirred fried champignons on iceberg salad, thyme, pepper and olive oil dressing', price: 890 },
                    { name: 'Pohovane paprike sa sirom', en: 'Deep fried peppers stuffed with cheese, tartar sauce', price: 790 },
                    { name: 'Pohovani kačkavalj', en: 'Fried cheese served with tartar sauce', price: 890 },
                    { name: 'Prebranac', en: 'Baked beans with onion, garlic and sweet ground paprika', price: 550 },
                    { name: 'Mućkalica', en: '"Ratatouille" with marinated grilled pork loin', price: 1290, pork: true, half: true },
                    { name: 'Grilovani sir', en: 'Grilled cheese', price: 990, unit: '150g' }
                ]
            },
            {
                key: 'soups',
                items: [
                    { name: 'Bistra pileća supa sa domaćim rezancima', en: 'Homemade chicken soup', price: 420 },
                    { name: 'Teleća čorba', en: 'Homemade veal soup with cream', price: 490 },
                    { name: 'Paradajz čorba', en: 'Tomato potage', price: 420 }
                ]
            },
            {
                key: 'mainSalads',
                items: [
                    { name: 'Biftek salata', en: 'Beef salad', price: 1890 },
                    { name: 'Cezar salata sa piletinom', en: 'Caesar salad with grilled chicken breasts', price: 1490 },
                    { name: 'Kapreze salata', en: 'Caprese salad', price: 1090 }
                ]
            },
            {
                key: 'game',
                items: [
                    { name: 'Srneća leđa', en: 'Venison loin, medium-rare, forest fruit or forest mushroom sauce, walnut-raisin pasta', price: 2950 },
                    { name: 'Srneći gulaš', en: 'Venison goulash served with walnut-raisin pasta', price: 2490 }
                ]
            },
            {
                key: 'fish',
                items: [
                    { name: 'Pastrmka na žaru', en: 'Grilled fresh trout served with potatoes and chard', price: 1590, unit: '350g' },
                    { name: 'Filet lososa na žaru', en: 'Grilled salmon fillet served with broccoli and carrots', price: 2690, unit: '250g' }
                ]
            },
            {
                key: 'mains',
                items: [
                    { name: 'Teleće pečenje', en: 'Roasted boneless veal served with baked potatoes', price: 2790, unit: '300g', half: true },
                    { name: 'Jagnjeće pečenje', en: 'Roasted lamb leg, boneless, with baked potatoes', price: 2790, unit: '300g', half: true },
                    { name: 'Svinjska rebra', en: 'Pork ribs with BBQ sauce served with french fries', price: 2190, unit: '350g', pork: true, half: true },
                    { name: 'Karađorđeva', en: 'Deep fried pork fillet stuffed with kaymak, french fries and tartar sauce', price: 1590, pork: true },
                    { name: 'Lovačke šnicle', en: '"Hunter schnitzel" served with mashed potatoes', price: 1490, pork: true },
                    { name: 'Krsmanović', en: 'Pork fillet stuffed with ham and cheese, mushroom and pepper demi-glace, steamed vegetables', price: 1690, pork: true },
                    { name: 'Pohovana šnicla', en: 'Like "Wiener Schnitzel" served with french fries', price: 1390 },
                    { name: 'Pileći medaljoni', en: 'Chicken medallions stuffed with ham and cheese, rolled in bacon, farmer-style potato', price: 1390, half: true },
                    { name: 'Biftek u sosu po izboru', en: 'Grilled beef with sauce of your choice, jacket potato', price: 3900, unit: '300g' },
                    { name: 'Čika Đura', en: 'Tagliata, grilled beef loin on roasted peppers with Zlatar cheese in herbed olive oil', price: 2490 },
                    { name: 'Ramstek', en: 'Grilled aged beef loin served with jacket potato', price: 2690, unit: '300g' },
                    { name: 'Ćuretina u mlincima', en: 'Turkey breast baked in handmade pasta "mlinci" — for two', price: 2690 },
                    { name: 'Dinstani juneći obrazi', en: 'Braised ox cheek served with mashed potato', price: 2190 }
                ]
            },
            {
                key: 'grill',
                items: [
                    { name: 'Šumadijska tepsija', en: 'Meat selection to share, french fries and kaymak, in a clay dish', price: 5900, unit: '1600g', pork: true, half: true },
                    { name: 'Šumadijska tepsija bez svinjskog mesa', en: 'Pork-free meat selection to share, french fries and kaymak', price: 8900, unit: '1600g', half: true },
                    { name: 'Ćevapi', en: 'Beef "ćevapi" served with baked potato', price: 1490, unit: '400g', half: true },
                    { name: 'Ćevapi na kajmaku', en: 'Beef "ćevapi" with kaymak, baked potato', price: 1640, unit: '400g', half: true },
                    { name: 'Pljeskavica', en: 'Beef "pljeskavica" served with baked potato', price: 1490, unit: '300g' },
                    { name: 'Pljeskavica na kajmaku', en: 'Beef "pljeskavica" with kaymak, baked potato', price: 1640, unit: '300g' },
                    { name: 'Pileći file', en: 'Grilled chicken fillet served with potato', price: 1190, unit: '300g', half: true },
                    { name: 'Pileći karabatak', en: 'Grilled boneless chicken thigh, baked potato', price: 1190, unit: '300g', half: true },
                    { name: 'Gurmanska pljeskavica', en: 'Beef "pljeskavica" stuffed with pancetta and cheese, baked potato', price: 1540, unit: '350g' },
                    { name: 'Gurmanska pljeskavica na kajmaku', en: 'Beef "pljeskavica" with pancetta, cheese and kaymak, baked potato', price: 1690, unit: '350g' },
                    { name: 'Gurmanski uštipci', en: 'Beef "uštipci" stuffed with pancetta and cheese, baked potato', price: 1540, unit: '350g', half: true },
                    { name: 'Kobasice', en: 'Homemade smoked pork sausage, baked potatoes and mustard', price: 1290, unit: '300g', pork: true, half: true },
                    { name: 'Dimljeni vrat', en: 'Smoked pork collar steak served with baked potato', price: 1590, unit: '300g', pork: true, half: true },
                    { name: 'Bela vešalica', en: 'Pork loin served with baked potato', price: 1440, unit: '300g', pork: true, half: true },
                    { name: 'Ražnići od svinjskog mesa', en: 'Pork skewers served with baked potato', price: 1190, unit: '300g', pork: true, half: true }
                ]
            },
            {
                key: 'sides',
                items: [
                    { name: 'Pomfrit', en: 'French fries', price: 390 },
                    { name: 'Pire krompir', en: 'Mashed potatoes', price: 250 },
                    { name: 'Krompir u ljusci', en: 'Jacket potato', price: 350 },
                    { name: 'Mlinci', en: 'Baked local dough', price: 650 },
                    { name: 'Pirinač', en: 'Rice', price: 280 },
                    { name: 'Grilovano povrće', en: 'Grilled vegetables, thyme and olive oil dressing', price: 590 },
                    { name: 'Sos po izboru', en: 'Forest, mushroom, cheese or pepper sauce', price: 450 }
                ]
            },
            {
                key: 'sideSalads',
                items: [
                    { name: 'Ajvar', en: 'Roasted red pepper spread', price: 650 },
                    { name: 'Vitaminska', en: 'Mixed chopped vegetables', price: 440 },
                    { name: 'Tarator', en: 'Like tzatziki', price: 490 },
                    { name: 'Šopska', en: 'Tomato, cucumber, onion and grated cheese', price: 540 },
                    { name: 'Cvekla', en: 'Beetroot', price: 420 },
                    { name: 'Grčka', en: 'Greek salad', price: 1090 },
                    { name: 'Paradajz', en: 'Sliced tomato with onions', price: 460 },
                    { name: 'Srpska', en: 'Tomato, cucumber, onion and hot pepper', price: 480 },
                    { name: 'Masline', en: 'Olives', price: 490 },
                    { name: 'Paradajz sa sirom', en: 'Sliced tomato with cheese and onion', price: 520 },
                    { name: 'Svež kupus', en: 'Fresh cabbage', price: 420 },
                    { name: 'Mešana letnja', en: 'Mixed summer salad', price: 440 },
                    { name: 'Pečene paprike', en: 'Roasted pepper with garlic', price: 460 },
                    { name: 'Mešana zimska', en: 'Mixed winter salad', price: 420 },
                    { name: 'Ljuta papričica', en: 'Fresh or roasted chilli pepper, one piece', price: 140 },
                    { name: 'Kiseli kupus', en: 'Sauerkraut (seasonal)', price: 420 },
                    { name: 'Kolekcija zelenih', en: 'Lettuce', price: 440 },
                    { name: 'Turšija', en: 'Pickled vegetables (seasonal)', price: 540 },
                    { name: 'Bašta', en: 'Mixed fresh vegetables, salad to share — for two', price: 990 }
                ]
            },
            {
                key: 'desserts',
                items: [
                    { name: 'Domaća torta, parče', en: 'Homemade cake — "Beogradska" creamy fruit, "Dva Jelena", or "Skadarska" creamy chocolate', price: 630 },
                    { name: 'Vinogradarske palačinke', en: 'Baked crepes with raisins and walnuts — 30 minutes', price: 1090 },
                    { name: 'Palačinke sa eurokremom', en: 'Crepes with chocolate hazelnut cream', price: 480 },
                    { name: 'Palačinke sa nutelom', en: 'Crepes with nutella', price: 480 },
                    { name: 'Palačinke sa marmeladom', en: 'Crepes with apricot or plum marmalade', price: 480 },
                    { name: 'Palačinke sa orasima', en: 'Crepes with walnuts and sugar', price: 480 },
                    { name: 'Baklava orah', en: 'Baklava with walnuts', price: 630 },
                    { name: 'Baklava suva šljiva', en: 'Baklava with prunes', price: 630 },
                    { name: 'Sladoled', en: 'Ice cream, three scoops', price: 650 }
                ]
            }
        ]
    };

    /* ============================================================
       ZLATNI BOKAL — Skadarska 26
       Transcribed from the printed menu. The menu is Serbian only,
       so the English lines are translations of its own descriptions.
       ============================================================ */
    MENUS.zlatni_bokal = {
        source: 'Printed menu, Serbian original — English lines translated',
        updated: '2026',
        notes: ['allergens'],
        sections: [
            {
                key: 'soups',
                items: [
                    { name: 'Teleća čorba', en: 'Veal broth', price: 520 },
                    { name: 'Riblja čorba', en: 'Fish stew', price: 480 },
                    { name: 'Domaća supa', en: 'Homemade clear soup', price: 480 }
                ]
            },
            {
                key: 'fish',
                items: [
                    { name: 'Fileti pastrmke iz pušnice', en: 'Smokehouse trout fillets with sautéed vegetables', price: 1490 },
                    { name: 'Fileti brancina sa roštilja', en: 'Grilled sea bass fillets with chard and potato', price: 1980 },
                    { name: 'Losos na žaru', en: 'Grilled salmon with sautéed vegetables and risotto', price: 2340 }
                ]
            },
            {
                key: 'mains',
                items: [
                    { name: 'Biftek "Zlatni Bokal"', en: 'Beef fillet with butter and walnut, baby potatoes, spinach purée', price: 3440 },
                    { name: 'Biftek u ulju', en: 'Beef fillet in oil', price: 3240 },
                    { name: 'Piletina na zlatiborski način', en: 'Chicken rolled in bacon with pršut and kačkavalj, in kaymak sauce', price: 1340 },
                    { name: 'Manastirska piletina', en: 'Chicken fillet stuffed with beef pršut and kačkavalj, breaded in walnuts', price: 1280 },
                    { name: 'Punjeni ćureći file', en: 'Turkey fillet with spinach and feta, rolled in pancetta, smoked cheese sauce', price: 1380 },
                    { name: 'Karađorđeva šnicla', en: 'Rolled pork stuffed with kaymak, breaded', price: 1420, pork: true },
                    { name: 'Bečka šnicla', en: 'Wiener schnitzel', price: 1480 },
                    { name: 'Praseće pečenje', en: 'Roast suckling pig', price: 1640, pork: true }
                ]
            },
            {
                key: 'grill',
                items: [
                    { name: 'Ćevapi "Zlatni Bokal"', en: 'Ćevapi served on burek pastry', price: 1260 },
                    { name: 'Skadarlijska gurmanska pljeskavica', en: 'Gourmet pljeskavica with urnebes and kaymak', price: 1340 },
                    { name: 'Srpska pljeskavica', en: 'Pljeskavica with kaymak and baker’s potato', price: 1240 },
                    { name: 'Leskovački uštipci', en: 'Uštipci with urnebes, kaymak and baker’s potato', price: 1340 },
                    { name: 'Mešano meso', en: 'Mixed grill', price: 1360 },
                    { name: 'Svinjska rebarca na kajmaku', en: 'Pork ribs on kaymak', price: 1340, pork: true },
                    { name: 'Domaća kobasica', en: 'Homemade sausage', price: 1260 },
                    { name: 'Opanak "Zlatni Bokal"', en: 'House "opanak" grill plate', price: 1390 },
                    { name: 'Srpska daska za dve osobe', en: 'Serbian board for two', price: 3660 },
                    { name: 'Punjena vešalica', en: 'Stuffed pork loin, to share', price: 2840, pork: true }
                ]
            },
            {
                key: 'sideSalads',
                items: [
                    { name: 'Letnji miks za dvoje', en: 'Summer mix for two', price: 920 },
                    { name: 'Ajvar cepkani domaći', en: 'Homemade hand-chopped ajvar', price: 520 },
                    { name: 'Bašta salata za dvoje', en: 'Garden salad for two', price: 820 },
                    { name: 'Šopska salata', en: 'Šopska salad', price: 460 },
                    { name: 'Srpska salata', en: 'Serbian salad', price: 440 },
                    { name: 'Pečena paprika', en: 'Roasted pepper', price: 420 },
                    { name: 'Ljuta papričica', en: 'Chilli pepper', price: 120 },
                    { name: 'Kupus salata', en: 'Cabbage salad', price: 360 },
                    { name: 'Paradajz salata', en: 'Tomato salad', price: 440 },
                    { name: 'Grčka salata', en: 'Greek salad', price: 720 },
                    { name: 'Prolećna salata', en: 'Spring salad', price: 440 },
                    { name: 'Moravska salata', en: 'Moravska salad', price: 480 }
                ]
            },
            {
                key: 'bread',
                items: [
                    { name: 'Somun', en: 'Somun flatbread', price: 100 },
                    { name: 'Domaći integralni hleb', en: 'Homemade wholemeal bread', price: 100 },
                    { name: 'Proja', en: 'Corn bread', price: 100 },
                    { name: 'Štapići sa belim lukom', en: 'Garlic bread sticks', price: 120 },
                    { name: 'Korpica hleba', en: 'Bread basket', price: 420 }
                ]
            },
            {
                key: 'desserts',
                items: [
                    { name: 'Baklava sa pistaćima', en: 'Baklava with pistachios', price: 520 },
                    { name: 'Čoko trikolore torta', en: 'Chocolate tricolore cake', price: 530 },
                    { name: 'Tri leće', en: 'Tres leches', price: 480 },
                    { name: 'Ledena kocka', en: '"Ice cube" cake', price: 480 },
                    { name: 'Pavlova torta', en: 'Pavlova', price: 520 }
                ]
            }
        ]
    };

    /* ============================================================
       TEMPERAMENT — Karađorđeva 2-4, Beton Hala
       Transcribed from restorantemperament.com/en/menu.
       This is a partial menu: only the courses legible on the pages
       supplied. Missing courses are named in `incomplete` so the
       sheet can say so rather than imply this is the whole card.
       ============================================================ */
    MENUS.temperament = {
        source: 'restorantemperament.com — partial',
        updated: '2026',
        incomplete: true,
        notes: ['allergens'],
        sections: [
            {
                key: 'coldStarters',
                items: [
                    { name: 'Predjelo "Temperament"', en: '"Temperament" appetizer platter', price: 2380 },
                    { name: 'Delicious plata Italija–Španija', en: 'Italian–Spanish delicacy platter', price: 2320 },
                    { name: 'Burata sa blanširanim čeri paradajzom', en: 'Burrata with blanched cherry tomatoes', price: 1690 },
                    { name: 'Biftek tartar sa aromatičnim puterom', en: 'Beef steak tartare with aromatic butter', price: 2780 }
                ]
            },
            {
                key: 'warmStarters',
                items: [
                    { name: 'Pohovana punjena paprika', en: 'Fried stuffed pepper', price: 780 },
                    { name: 'Bruskete sa mocarelom', en: 'Bruschetta with mozzarella', price: 800 }
                ]
            },
            {
                key: 'pasta',
                items: [
                    { name: 'Taljatele sa biftekom', en: 'Tagliatelle with beef steak', price: 2280 },
                    { name: 'Rizoto sa piletinom i tikvicama', en: 'Zucchini and chicken risotto', price: 1420 }
                ]
            },
            {
                key: 'bread',
                items: [
                    { name: 'Korpica hleba', en: 'Basket of bread', price: 420 },
                    { name: 'Domaći integralni hleb', en: 'Homemade whole wheat bread', price: 145 },
                    { name: 'Lepinja', en: 'Flatbread', price: 190 }
                ]
            }
        ]
    };

    window.FEELBG_MENUS = MENUS;

    if (typeof module !== 'undefined' && module.exports) module.exports = MENUS;
})();
