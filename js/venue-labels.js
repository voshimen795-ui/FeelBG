'use strict';
/* Shared category labels.
 *
 * Every venue has a cuisineLabel ("Specialty Coffee", "Shopping Centre"…)
 * that shows on its card. The older venues each have their own translation
 * key, but most labels repeat across many venues, so the newer ones share
 * one key per label instead: label.<slug of the English label>.
 *
 * CardRenderer.cuisineKey() decides which of the two a venue uses — the
 * per-venue key when one exists, this shared one otherwise — so adding a
 * venue whose label already appears here needs no new translation at all.
 */
(function () {
    var T = window.FEELBG_TRANSLATIONS;
    if (!T) return;

    var labels = {
en: {
'label.riverside_park':'Riverside Park','label.nature_reserve':'Nature Reserve',
'label.historic_fortress':'Historic Fortress','label.bohemian_street':'Bohemian Street','label.beach_recreation':'Beach · Recreation','label.science_museum':'Science Museum','label.royal_park':'Royal Park','label.historic_tower':'Historic Tower','label.art_history_museum':'Art & History Museum','label.riverside_walk':'Riverside Walk','label.military_museum':'Military Museum',
'label.specialty_coffee':'Specialty Coffee','label.coffee_roastery':'Coffee Roastery',
'label.cafe_garden':'Cafe · Garden','label.cafe_bar':'Cafe · Bar',
'label.cafe_patisserie':'Cafe · Patisserie','label.cafe_wine_bar':'Cafe · Wine Bar',
'label.club_techno':'Club · Techno','label.club_rooftop':'Club · Rooftop',
'label.splav_electronic':'Raft · Electronic','label.splav_party':'Raft · Party',
'label.bar_living_room':'Bar · Living Room',
'label.history_museum':'History Museum','label.modern_art_museum':'Modern Art Museum',
'label.ethnographic_museum':'Ethnographic Museum',
'label.orthodox_church':'Orthodox Church','label.cathedral_church':'Cathedral Church',
'label.chapel_holy_spring':'Chapel · Holy Spring',
'label.city_park':'City Park','label.forest_park':'Forest Park','label.botanical_garden':'Botanical Garden',
'label.shopping_centre':'Shopping Centre',
},
sr: {
'label.riverside_park':'Park uz reku','label.nature_reserve':'Rezervat prirode',
'label.historic_fortress':'Istorijska tvrđava','label.bohemian_street':'Boemska ulica','label.beach_recreation':'Plaža · Rekreacija','label.science_museum':'Muzej nauke','label.royal_park':'Kraljevski park','label.historic_tower':'Istorijska kula','label.art_history_museum':'Muzej umetnosti i istorije','label.riverside_walk':'Šetalište uz reku','label.military_museum':'Vojni muzej',
'label.specialty_coffee':'Specialty kafa','label.coffee_roastery':'Pržionica kafe',
'label.cafe_garden':'Kafić · Bašta','label.cafe_bar':'Kafić · Bar',
'label.cafe_patisserie':'Kafić · Poslastičarnica','label.cafe_wine_bar':'Kafić · Vinski bar',
'label.club_techno':'Klub · Tehno','label.club_rooftop':'Klub · Krov',
'label.splav_electronic':'Splav · Elektronska','label.splav_party':'Splav · Žurka',
'label.bar_living_room':'Bar · Dnevna soba',
'label.history_museum':'Istorijski muzej','label.modern_art_museum':'Muzej savremene umetnosti',
'label.ethnographic_museum':'Etnografski muzej',
'label.orthodox_church':'Pravoslavna crkva','label.cathedral_church':'Saborna crkva',
'label.chapel_holy_spring':'Kapela · Sveta voda',
'label.city_park':'Gradski park','label.forest_park':'Šumski park','label.botanical_garden':'Botanička bašta',
'label.shopping_centre':'Tržni centar',
},
tr: {
'label.riverside_park':'Nehir Kıyısı Parkı','label.nature_reserve':'Doğa Rezervi',
'label.historic_fortress':'Tarihi Kale','label.bohemian_street':'Bohem Sokak','label.beach_recreation':'Plaj · Rekreasyon','label.science_museum':'Bilim Müzesi','label.royal_park':'Kraliyet Parkı','label.historic_tower':'Tarihi Kule','label.art_history_museum':'Sanat ve Tarih Müzesi','label.riverside_walk':'Nehir Kıyısı Yürüyüşü','label.military_museum':'Askeri Müze',
'label.specialty_coffee':'Specialty Kahve','label.coffee_roastery':'Kahve Kavurma Atölyesi',
'label.cafe_garden':'Kafe · Bahçe','label.cafe_bar':'Kafe · Bar',
'label.cafe_patisserie':'Kafe · Pastane','label.cafe_wine_bar':'Kafe · Şarap Barı',
'label.club_techno':'Kulüp · Tekno','label.club_rooftop':'Kulüp · Çatı',
'label.splav_electronic':'Nehir Teknesi · Elektronik','label.splav_party':'Nehir Teknesi · Parti',
'label.bar_living_room':'Bar · Oturma Odası',
'label.history_museum':'Tarih Müzesi','label.modern_art_museum':'Modern Sanat Müzesi',
'label.ethnographic_museum':'Etnografya Müzesi',
'label.orthodox_church':'Ortodoks Kilisesi','label.cathedral_church':'Katedral Kilisesi',
'label.chapel_holy_spring':'Şapel · Kutsal Pınar',
'label.city_park':'Şehir Parkı','label.forest_park':'Orman Parkı','label.botanical_garden':'Botanik Bahçesi',
'label.shopping_centre':'Alışveriş Merkezi',
},
de: {
'label.riverside_park':'Uferpark','label.nature_reserve':'Naturreservat',
'label.historic_fortress':'Historische Festung','label.bohemian_street':'Bohème-Straße','label.beach_recreation':'Strand · Freizeit','label.science_museum':'Wissenschaftsmuseum','label.royal_park':'Königlicher Park','label.historic_tower':'Historischer Turm','label.art_history_museum':'Kunst- und Geschichtsmuseum','label.riverside_walk':'Uferpromenade','label.military_museum':'Militärmuseum',
'label.specialty_coffee':'Specialty Coffee','label.coffee_roastery':'Kaffeerösterei',
'label.cafe_garden':'Café · Garten','label.cafe_bar':'Café · Bar',
'label.cafe_patisserie':'Café · Konditorei','label.cafe_wine_bar':'Café · Weinbar',
'label.club_techno':'Club · Techno','label.club_rooftop':'Club · Dachterrasse',
'label.splav_electronic':'Flussboot · Elektronisch','label.splav_party':'Flussboot · Party',
'label.bar_living_room':'Bar · Wohnzimmer',
'label.history_museum':'Historisches Museum','label.modern_art_museum':'Museum für zeitgenössische Kunst',
'label.ethnographic_museum':'Ethnografisches Museum',
'label.orthodox_church':'Orthodoxe Kirche','label.cathedral_church':'Kathedrale',
'label.chapel_holy_spring':'Kapelle · Heilige Quelle',
'label.city_park':'Stadtpark','label.forest_park':'Waldpark','label.botanical_garden':'Botanischer Garten',
'label.shopping_centre':'Einkaufszentrum',
},
fr: {
'label.riverside_park':'Parc au bord du fleuve','label.nature_reserve':'Réserve naturelle',
'label.historic_fortress':'Forteresse historique','label.bohemian_street':'Rue bohème','label.beach_recreation':'Plage · Loisirs','label.science_museum':'Musée des sciences','label.royal_park':'Parc royal','label.historic_tower':'Tour historique','label.art_history_museum':'Musée d\'art et d\'histoire','label.riverside_walk':'Promenade fluviale','label.military_museum':'Musée militaire',
'label.specialty_coffee':'Café de spécialité','label.coffee_roastery':'Torréfacteur',
'label.cafe_garden':'Café · Jardin','label.cafe_bar':'Café · Bar',
'label.cafe_patisserie':'Café · Pâtisserie','label.cafe_wine_bar':'Café · Bar à vin',
'label.club_techno':'Club · Techno','label.club_rooftop':'Club · Rooftop',
'label.splav_electronic':'Péniche · Électro','label.splav_party':'Péniche · Fête',
'label.bar_living_room':'Bar · Salon',
'label.history_museum':'Musée d\'histoire','label.modern_art_museum':'Musée d\'art contemporain',
'label.ethnographic_museum':'Musée ethnographique',
'label.orthodox_church':'Église orthodoxe','label.cathedral_church':'Cathédrale',
'label.chapel_holy_spring':'Chapelle · Source sacrée',
'label.city_park':'Parc urbain','label.forest_park':'Parc forestier','label.botanical_garden':'Jardin botanique',
'label.shopping_centre':'Centre commercial',
},
it: {
'label.riverside_park':'Parco sul fiume','label.nature_reserve':'Riserva naturale',
'label.historic_fortress':'Fortezza storica','label.bohemian_street':'Via bohémien','label.beach_recreation':'Spiaggia · Svago','label.science_museum':'Museo della scienza','label.royal_park':'Parco reale','label.historic_tower':'Torre storica','label.art_history_museum':'Museo d\'arte e storia','label.riverside_walk':'Lungofiume','label.military_museum':'Museo militare',
'label.specialty_coffee':'Caffè specialty','label.coffee_roastery':'Torrefazione',
'label.cafe_garden':'Caffè · Giardino','label.cafe_bar':'Caffè · Bar',
'label.cafe_patisserie':'Caffè · Pasticceria','label.cafe_wine_bar':'Caffè · Enoteca',
'label.club_techno':'Club · Techno','label.club_rooftop':'Club · Rooftop',
'label.splav_electronic':'Chiatta · Elettronica','label.splav_party':'Chiatta · Festa',
'label.bar_living_room':'Bar · Salotto',
'label.history_museum':'Museo storico','label.modern_art_museum':'Museo d\'arte contemporanea',
'label.ethnographic_museum':'Museo etnografico',
'label.orthodox_church':'Chiesa ortodossa','label.cathedral_church':'Cattedrale',
'label.chapel_holy_spring':'Cappella · Sorgente sacra',
'label.city_park':'Parco cittadino','label.forest_park':'Parco forestale','label.botanical_garden':'Orto botanico',
'label.shopping_centre':'Centro commerciale',
},
ru: {
'label.riverside_park':'Парк на берегу','label.nature_reserve':'Природный заповедник',
'label.historic_fortress':'Историческая крепость','label.bohemian_street':'Богемная улица','label.beach_recreation':'Пляж · Отдых','label.science_museum':'Музей науки','label.royal_park':'Королевский парк','label.historic_tower':'Историческая башня','label.art_history_museum':'Музей искусства и истории','label.riverside_walk':'Набережная','label.military_museum':'Военный музей',
'label.specialty_coffee':'Спешелти-кофе','label.coffee_roastery':'Обжарочная кофе',
'label.cafe_garden':'Кафе · Сад','label.cafe_bar':'Кафе · Бар',
'label.cafe_patisserie':'Кафе · Кондитерская','label.cafe_wine_bar':'Кафе · Винный бар',
'label.club_techno':'Клуб · Техно','label.club_rooftop':'Клуб · Крыша',
'label.splav_electronic':'Сплав · Электроника','label.splav_party':'Сплав · Вечеринка',
'label.bar_living_room':'Бар · Гостиная',
'label.history_museum':'Исторический музей','label.modern_art_museum':'Музей современного искусства',
'label.ethnographic_museum':'Этнографический музей',
'label.orthodox_church':'Православная церковь','label.cathedral_church':'Соборная церковь',
'label.chapel_holy_spring':'Часовня · Святой источник',
'label.city_park':'Городской парк','label.forest_park':'Лесопарк','label.botanical_garden':'Ботанический сад',
'label.shopping_centre':'Торговый центр',
},
el: {
'label.riverside_park':'Παραποτάμιο πάρκο','label.nature_reserve':'Φυσικό καταφύγιο',
'label.historic_fortress':'Ιστορικό φρούριο','label.bohemian_street':'Μποέμ δρόμος','label.beach_recreation':'Παραλία · Αναψυχή','label.science_museum':'Μουσείο Επιστημών','label.royal_park':'Βασιλικό πάρκο','label.historic_tower':'Ιστορικός πύργος','label.art_history_museum':'Μουσείο Τέχνης και Ιστορίας','label.riverside_walk':'Παραποτάμιος περίπατος','label.military_museum':'Στρατιωτικό Μουσείο',
'label.specialty_coffee':'Specialty καφές','label.coffee_roastery':'Καφεκοπτείο',
'label.cafe_garden':'Καφέ · Κήπος','label.cafe_bar':'Καφέ · Μπαρ',
'label.cafe_patisserie':'Καφέ · Ζαχαροπλαστείο','label.cafe_wine_bar':'Καφέ · Wine bar',
'label.club_techno':'Κλαμπ · Techno','label.club_rooftop':'Κλαμπ · Ταράτσα',
'label.splav_electronic':'Πλωτό · Ηλεκτρονική','label.splav_party':'Πλωτό · Πάρτι',
'label.bar_living_room':'Μπαρ · Σαλόνι',
'label.history_museum':'Μουσείο Ιστορίας','label.modern_art_museum':'Μουσείο Σύγχρονης Τέχνης',
'label.ethnographic_museum':'Εθνογραφικό Μουσείο',
'label.orthodox_church':'Ορθόδοξη εκκλησία','label.cathedral_church':'Καθεδρικός ναός',
'label.chapel_holy_spring':'Παρεκκλήσι · Αγίασμα',
'label.city_park':'Πάρκο πόλης','label.forest_park':'Δασικό πάρκο','label.botanical_garden':'Βοτανικός κήπος',
'label.shopping_centre':'Εμπορικό κέντρο',
},
he: {
'label.riverside_park':'פארק על הנהר','label.nature_reserve':'שמורת טבע',
'label.historic_fortress':'מצודה היסטורית','label.bohemian_street':'רחוב בוהמייני','label.beach_recreation':'חוף · פנאי','label.science_museum':'מוזיאון מדע','label.royal_park':'פארק מלכותי','label.historic_tower':'מגדל היסטורי','label.art_history_museum':'מוזיאון אמנות והיסטוריה','label.riverside_walk':'טיילת נהר','label.military_museum':'מוזיאון צבאי',
'label.specialty_coffee':'קפה בוטיק','label.coffee_roastery':'קלייה מקומית',
'label.cafe_garden':'בית קפה · גינה','label.cafe_bar':'בית קפה · בר',
'label.cafe_patisserie':'בית קפה · קונדיטוריה','label.cafe_wine_bar':'בית קפה · בר יין',
'label.club_techno':'מועדון · טכנו','label.club_rooftop':'מועדון · גג',
'label.splav_electronic':'ארמדה · אלקטרונית','label.splav_party':'ארמדה · מסיבה',
'label.bar_living_room':'בר · סלון',
'label.history_museum':'מוזיאון היסטוריה','label.modern_art_museum':'מוזיאון לאמנות עכשווית',
'label.ethnographic_museum':'מוזיאון אתנוגרפי',
'label.orthodox_church':'כנסייה אורתודוקסית','label.cathedral_church':'כנסיית קתדרלה',
'label.chapel_holy_spring':'קפלה · מעיין קדוש',
'label.city_park':'פארק עירוני','label.forest_park':'פארק יער','label.botanical_garden':'גן בוטני',
'label.shopping_centre':'קניון',
},
    };

    Object.assign(T['en'], labels.en);
    if (T['us']) Object.assign(T['us'], labels.en);
    for (var lang in labels) {
        if (T[lang]) Object.assign(T[lang], labels[lang]);
    }
})();
