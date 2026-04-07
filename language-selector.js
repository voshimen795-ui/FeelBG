/* ============================================
   LANGUAGE/FLAG SELECTOR
   Choose Your Language on First Visit
   ============================================ */

'use strict';

// ============================================
// LANGUAGE SELECTOR CLASS
// ============================================

class LanguageSelector {
    constructor() {
        this.languages = [
            { code: 'en', name: 'English', flag: '🇬🇧', country: 'United Kingdom' },
            { code: 'tr', name: 'Türkçe', flag: '🇹🇷', country: 'Turkey' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪', country: 'Germany' },
            { code: 'fr', name: 'Français', flag: '🇫🇷', country: 'France' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹', country: 'Italy' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺', country: 'Russia' },
            { code: 'el', name: 'Ελληνικά', flag: '🇬🇷', country: 'Greece' },
            { code: 'us', name: 'English (US)', flag: '🇺🇸', country: 'United States' },
            { code: 'sr', name: 'Српски', flag: '🇷🇸', country: 'Serbia' },
            { code: 'he', name: 'עברית', flag: '🇮🇱', country: 'Israel' }
        ];
        
        this.translations = {
            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.restaurants': 'Restaurants',
                'nav.cafes': 'Cafes',
                'nav.nightlife': 'Nightlife',
                'nav.attractions': 'Attractions',
                'nav.about': 'About',
                
                // Hero Section
                'hero.welcome': 'Welcome to Belgrade',
                'hero.title': 'Discover the Heart',
                'hero.of': 'of',
                'hero.titleAccent': 'SERBIA',
                'hero.description': 'Experience Belgrade\'s finest restaurants, hidden cafes, vibrant nightlife, and unforgettable attractions. Your personal guide to the city\'s best kept secrets.',
                'hero.search': 'Search restaurants, cafes, places...',
                'hero.exploreRestaurants': 'Explore Restaurants',
                'hero.viewAttractions': 'View Attractions',
                'hero.restaurants': 'Restaurants',
                'hero.cafes': 'Cafes & Bars',
                'hero.attractions': 'Attractions',
                'hero.tourists': 'Happy Tourists',
                'hero.scrollDown': 'Explore More',
                
                // Categories
                'categories.subtitle': 'What to Explore',
                'categories.title': 'Discover Belgrade',
                'categories.description': 'From world-class dining to vibrant nightlife - explore everything Belgrade has to offer',
                'categories.restaurants': 'Restaurants',
                'categories.restaurantsDesc': 'Discover amazing Serbian and international cuisine',
                'categories.restaurantsCount': '250+ Places',
                'categories.cafes': 'Cafes & Bars',
                'categories.cafesDesc': 'Cozy cafes and trendy bars for every mood',
                'categories.cafesCount': '150+ Spots',
                'categories.nightlife': 'Nightlife',
                'categories.nightlifeDesc': 'Experience the city that never sleeps',
                'categories.nightlifeCount': '80+ Clubs',
                'categories.attractions': 'Attractions',
                'categories.attractionsDesc': 'Historic sites and modern landmarks',
                'categories.attractionsCount': '50+ Places',
                
                // Featured Section
                'featured.subtitle': 'Handpicked for You',
                'featured.title': 'Featured This Week',
                'featured.description': 'The best places recommended by locals and loved by tourists',
                
                // Hidden Gems Section
                'gems.subtitle': 'Off the Beaten Path',
                'gems.title': "Belgrade's Hidden Gems",
                'gems.description': "Secret parks, quiet viewpoints, and nature escapes the guidebooks never mention",
                'gems.badge.nature': 'Nature',
                'gems.badge.viewpoint': 'Viewpoint',
                'gems.badge.park': 'Park',
                'gems.badge.secret': 'Secret Spot',
                'gems.badge.history': 'History',
                'gems.topčider.name': 'Topčider Park',
                'gems.topčider.desc': "A royal park with century-old plane trees, a stream, and deer roaming freely — Belgrade's green lung.",
                'gems.gardoš.name': 'Gardoš Tower',
                'gems.gardoš.desc': 'A medieval tower in Zemun with the most breathtaking panoramic view of the Danube and Belgrade skyline.',
                'gems.košutnjak.name': 'Košutnjak Forest',
                'gems.košutnjak.desc': 'A vast urban forest with hiking trails, a film studio, and hidden clearings perfect for peaceful morning walks.',
                'gems.ada.name': 'Ada Ciganlija Beach',
                'gems.ada.desc': "Belgrade's 'sea' — a river island transformed into a 4km-long beach with crystal-clear water. Locals' favourite summer escape.",
                'gems.rose.name': 'Rose Garden, Kalemegdan',
                'gems.rose.desc': 'Hidden within the fortress grounds, a quiet rose garden blooms in spring — the most romantic secret in the city.',
                'gems.avala.name': 'Avala Mountain',
                'gems.avala.desc': 'Just 16km from Belgrade, this mountain peak with a TV tower offers forested trails and a breathtaking city panorama.',

                // Events Section
                'events.subtitle': "What's Happening Now",
                'events.title': 'Live Events & Belgrade News',
                'events.description': 'Concerts, festivals, live music and the latest from the city that never stops',
                'events.tag.concert': 'Concert',
                'events.tag.festival': 'Festival',
                'events.tag.music': 'Live Music',
                'events.tag.culture': 'Culture',
                'events.tag.food': 'Food Fest',
                'events.e1.title': 'Sava Center Summer Concert Series',
                'events.e1.desc': 'The iconic Sava Center hosts a spectacular summer concert series featuring top Serbian and Balkan acts under the stars.',
                'events.e2.title': 'EXIT Festival Preview Night',
                'events.e2.desc': "The legendary EXIT Festival kicks off with a preview night — buses from Belgrade's Trg Nikole Pašića depart hourly.",
                'events.e3.title': 'Skadarlija Jazz Night',
                'events.e3.desc': "Every Friday, Skadarlija's cobblestone streets come alive with open-air jazz, traditional gusle players, and brass bands.",
                'events.e4.title': 'Belgrade Design Week',
                'events.e4.desc': "Savamala's galleries and warehouses open for a week-long celebration of Serbian design, art installations and fashion.",
                'events.e5.title': 'Belgrade Street Food Festival',
                'events.e5.desc': 'Over 80 vendors from across Serbia and the Balkans gather for a 3-day open-air feast of grilled meats, pastries, and rakija.',
                'events.status.live': '🔴 Live Tonight',
                'events.status.upcoming': '📅 This Weekend',
                'events.status.news': '📰 Breaking',
                'events.thumb.concert': 'Concert',
                'events.thumb.festival': 'Festival',
                'events.thumb.music': 'Jazz',
                'events.thumb.culture': 'Design',
                'events.thumb.food': 'Food Fest',

                // Footer
                'footer.text': 'Your trusted guide to discovering the best of Belgrade. Recommended by locals, loved by tourists.',
                'footer.explore': 'Explore',
                'footer.popularAreas': 'Popular Areas',
                'footer.usefulInfo': 'Useful Info',
                'footer.contact': 'Contact Us',
                'footer.aboutFeelbg': 'About FeelBG',
                'footer.forBusiness': 'For Business',
                'footer.travelTips': 'Travel Tips',
                'footer.copyright': '© 2025 FeelBG - Discover Belgrade. All rights reserved.',
                'footer.privacy': 'Privacy Policy',
                'footer.terms': 'Terms of Service'
            },
            tr: {
                // Navigation
                'nav.home': 'Ana Sayfa',
                'nav.restaurants': 'Restoranlar',
                'nav.cafes': 'Kafeler',
                'nav.nightlife': 'Gece Hayatı',
                'nav.attractions': 'Gezilecek Yerler',
                'nav.about': 'Hakkımızda',
                
                // Hero Section
                'hero.welcome': 'Belgrad\'a Hoş Geldiniz',
                'hero.title': 'Sırbistan\'ın Kalbini',
                'hero.of': '',
                'hero.titleAccent': 'Keşfedin',
                'hero.description': 'Belgrad\'ın en iyi restoranlarını, gizli kafelerini, canlı gece hayatını ve unutulmaz cazibelerini deneyimleyin. Şehrin en iyi saklı sırlarına kişisel rehberiniz.',
                'hero.search': 'Restoran, kafe, mekan ara...',
                'hero.exploreRestaurants': 'Restoranları Keşfet',
                'hero.viewAttractions': 'Gezilecek Yerleri Gör',
                'hero.restaurants': 'Restoran',
                'hero.cafes': 'Kafe & Bar',
                'hero.attractions': 'Cazibe',
                'hero.tourists': 'Mutlu Turist',
                'hero.scrollDown': 'Daha Fazla Keşfet',
                
                // Categories
                'categories.subtitle': 'Neyi Keşfedelim',
                'categories.title': 'Belgrad\'ı Keşfet',
                'categories.description': 'Dünya standartlarında yemekten canlı gece hayatına - Belgrad\'ın sunduğu her şeyi keşfedin',
                'categories.restaurants': 'Restoranlar',
                'categories.restaurantsDesc': 'Muhteşem Sırp ve uluslararası mutfağı keşfedin',
                'categories.restaurantsCount': '250+ Mekan',
                'categories.cafes': 'Kafeler & Barlar',
                'categories.cafesDesc': 'Her ruh haline uygun rahat kafeler ve şık barlar',
                'categories.cafesCount': '150+ Mekan',
                'categories.nightlife': 'Gece Hayatı',
                'categories.nightlifeDesc': 'Hiç uyumayan şehri deneyimleyin',
                'categories.nightlifeCount': '80+ Kulüp',
                'categories.attractions': 'Gezilecek Yerler',
                'categories.attractionsDesc': 'Tarihi yerler ve modern simgeler',
                'categories.attractionsCount': '50+ Yer',
                
                // Featured Section
                'featured.subtitle': 'Sizin İçin Seçildi',
                'featured.title': 'Bu Haftanın Öne Çıkanları',
                'featured.description': 'Yerel halk tarafından önerilen ve turistler tarafından sevilen en iyi yerler',
                
                // Footer
                'footer.text': 'Belgrad\'ın en iyisini keşfetmek için güvenilir rehberiniz. Yerliler tarafından önerilir, turistler tarafından sevilir.',
                'footer.explore': 'Keşfet',
                'footer.popularAreas': 'Popüler Bölgeler',
                'footer.usefulInfo': 'Yararlı Bilgiler',
                'footer.contact': 'İletişim',
                'footer.aboutFeelbg': 'FeelBG Hakkında',
                'footer.forBusiness': 'İşletmeler İçin',
                'footer.travelTips': 'Seyahat İpuçları',
                'footer.copyright': '© 2025 FeelBG - Belgrad\'ı Keşfet. Tüm hakları saklıdır.',
                'footer.privacy': 'Gizlilik Politikası',
                'footer.terms': 'Kullanım Şartları'
            },
            de: {
                // Navigation
                'nav.home': 'Startseite',
                'nav.restaurants': 'Restaurants',
                'nav.cafes': 'Cafés',
                'nav.nightlife': 'Nachtleben',
                'nav.attractions': 'Sehenswürdigkeiten',
                'nav.about': 'Über uns',
                
                // Hero Section
                'hero.welcome': 'Willkommen in Belgrad',
                'hero.title': 'Entdecken Sie das Herz',
                'hero.of': '',
                'hero.titleAccent': 'SERBIENS',
                'hero.description': 'Erleben Sie Belgrads beste Restaurants, versteckte Cafés, lebendiges Nachtleben und unvergessliche Attraktionen. Ihr persönlicher Führer zu den bestgehüteten Geheimnissen der Stadt.',
                'hero.search': 'Restaurants, Cafés, Orte suchen...',
                'hero.exploreRestaurants': 'Restaurants erkunden',
                'hero.viewAttractions': 'Sehenswürdigkeiten',
                'hero.restaurants': 'Restaurants',
                'hero.cafes': 'Cafés & Bars',
                'hero.attractions': 'Attraktionen',
                'hero.tourists': 'Glückliche Touristen',
                'hero.scrollDown': 'Mehr entdecken',
                
                // Categories
                'categories.subtitle': 'Was zu erkunden',
                'categories.title': 'Belgrad entdecken',
                'categories.description': 'Von erstklassigen Restaurants bis zum pulsierenden Nachtleben - entdecken Sie alles, was Belgrad zu bieten hat',
                'categories.restaurants': 'Restaurants',
                'categories.restaurantsDesc': 'Entdecken Sie erstaunliche serbische und internationale Küche',
                'categories.restaurantsCount': '250+ Orte',
                'categories.cafes': 'Cafés & Bars',
                'categories.cafesDesc': 'Gemütliche Cafés und trendige Bars für jede Stimmung',
                'categories.cafesCount': '150+ Orte',
                'categories.nightlife': 'Nachtleben',
                'categories.nightlifeDesc': 'Erleben Sie die Stadt, die niemals schläft',
                'categories.nightlifeCount': '80+ Clubs',
                'categories.attractions': 'Sehenswürdigkeiten',
                'categories.attractionsDesc': 'Historische Stätten und moderne Wahrzeichen',
                'categories.attractionsCount': '50+ Orte',
                
                // Featured Section
                'featured.subtitle': 'Handverlesen für Sie',
                'featured.title': 'Diese Woche vorgestellt',
                'featured.description': 'Die besten Orte, empfohlen von Einheimischen und geliebt von Touristen',
                
                // Footer
                'footer.text': 'Ihr vertrauenswürdiger Führer zur Entdeckung des Besten von Belgrad. Von Einheimischen empfohlen, von Touristen geliebt.',
                'footer.explore': 'Erkunden',
                'footer.popularAreas': 'Beliebte Gegenden',
                'footer.usefulInfo': 'Nützliche Infos',
                'footer.contact': 'Kontakt',
                'footer.aboutFeelbg': 'Über FeelBG',
                'footer.forBusiness': 'Für Unternehmen',
                'footer.travelTips': 'Reisetipps',
                'footer.copyright': '© 2025 FeelBG - Belgrad entdecken. Alle Rechte vorbehalten.',
                'footer.privacy': 'Datenschutz',
                'footer.terms': 'Nutzungsbedingungen'
            },
            fr: {
                // Navigation
                'nav.home': 'Accueil',
                'nav.restaurants': 'Restaurants',
                'nav.cafes': 'Cafés',
                'nav.nightlife': 'Vie Nocturne',
                'nav.attractions': 'Attractions',
                'nav.about': 'À propos',
                
                // Hero Section
                'hero.welcome': 'Bienvenue à Belgrade',
                'hero.title': 'Découvrez le Cœur',
                'hero.of': 'de la',
                'hero.titleAccent': 'SERBIE',
                'hero.description': 'Découvrez les meilleurs restaurants de Belgrade, ses cafés cachés, sa vie nocturne animée et ses attractions inoubliables. Votre guide personnel des secrets les mieux gardés de la ville.',
                'hero.search': 'Rechercher restaurants, cafés, lieux...',
                'hero.exploreRestaurants': 'Explorer les Restaurants',
                'hero.viewAttractions': 'Voir les Attractions',
                'hero.restaurants': 'Restaurants',
                'hero.cafes': 'Cafés & Bars',
                'hero.attractions': 'Attractions',
                'hero.tourists': 'Touristes Heureux',
                'hero.scrollDown': 'Explorer Plus',
                
                // Categories
                'categories.subtitle': 'Quoi Explorer',
                'categories.title': 'Découvrir Belgrade',
                'categories.description': 'De la gastronomie de classe mondiale à la vie nocturne animée - explorez tout ce que Belgrade a à offrir',
                'categories.restaurants': 'Restaurants',
                'categories.restaurantsDesc': 'Découvrez une cuisine serbe et internationale incroyable',
                'categories.restaurantsCount': '250+ Lieux',
                'categories.cafes': 'Cafés & Bars',
                'categories.cafesDesc': 'Cafés confortables et bars branchés pour toutes les humeurs',
                'categories.cafesCount': '150+ Endroits',
                'categories.nightlife': 'Vie Nocturne',
                'categories.nightlifeDesc': 'Découvrez la ville qui ne dort jamais',
                'categories.nightlifeCount': '80+ Clubs',
                'categories.attractions': 'Attractions',
                'categories.attractionsDesc': 'Sites historiques et monuments modernes',
                'categories.attractionsCount': '50+ Lieux',
                
                // Featured Section
                'featured.subtitle': 'Sélectionné pour vous',
                'featured.title': 'À la une cette semaine',
                'featured.description': 'Les meilleurs endroits recommandés par les locaux et aimés par les touristes',
                
                // Footer
                'footer.text': 'Votre guide de confiance pour découvrir le meilleur de Belgrade. Recommandé par les locaux, aimé par les touristes.',
                'footer.explore': 'Explorer',
                'footer.popularAreas': 'Zones Populaires',
                'footer.usefulInfo': 'Infos Utiles',
                'footer.contact': 'Contact',
                'footer.aboutFeelbg': 'À propos de FeelBG',
                'footer.forBusiness': 'Pour les Entreprises',
                'footer.travelTips': 'Conseils de Voyage',
                'footer.copyright': '© 2025 FeelBG - Découvrir Belgrade. Tous droits réservés.',
                'footer.privacy': 'Politique de Confidentialité',
                'footer.terms': 'Conditions d\'Utilisation'
            },
            it: {
                // Navigation
                'nav.home': 'Home',
                'nav.restaurants': 'Ristoranti',
                'nav.cafes': 'Caffè',
                'nav.nightlife': 'Vita Notturna',
                'nav.attractions': 'Attrazioni',
                'nav.about': 'Chi Siamo',
                
                // Hero Section
                'hero.welcome': 'Benvenuti a Belgrado',
                'hero.title': 'Scopri il Cuore',
                'hero.of': 'della',
                'hero.titleAccent': 'SERBIA',
                'hero.description': 'Scopri i migliori ristoranti di Belgrado, i caffè nascosti, la vivace vita notturna e le attrazioni indimenticabili. La tua guida personale ai segreti meglio custoditi della città.',
                'hero.search': 'Cerca ristoranti, caffè, luoghi...',
                'hero.exploreRestaurants': 'Esplora Ristoranti',
                'hero.viewAttractions': 'Vedi Attrazioni',
                'hero.restaurants': 'Ristoranti',
                'hero.cafes': 'Caffè e Bar',
                'hero.attractions': 'Attrazioni',
                'hero.tourists': 'Turisti Felici',
                'hero.scrollDown': 'Scopri di Più',
                
                // Categories
                'categories.subtitle': 'Cosa Esplorare',
                'categories.title': 'Scopri Belgrado',
                'categories.description': 'Dalla ristorazione di classe mondiale alla vivace vita notturna - esplora tutto ciò che Belgrado ha da offrire',
                'categories.restaurants': 'Ristoranti',
                'categories.restaurantsDesc': 'Scopri l\'incredibile cucina serba e internazionale',
                'categories.restaurantsCount': '250+ Luoghi',
                'categories.cafes': 'Caffè & Bar',
                'categories.cafesDesc': 'Caffè accoglienti e bar alla moda per ogni umore',
                'categories.cafesCount': '150+ Posti',
                'categories.nightlife': 'Vita Notturna',
                'categories.nightlifeDesc': 'Vivi la città che non dorme mai',
                'categories.nightlifeCount': '80+ Club',
                'categories.attractions': 'Attrazioni',
                'categories.attractionsDesc': 'Siti storici e monumenti moderni',
                'categories.attractionsCount': '50+ Luoghi',
                
                // Featured Section
                'featured.subtitle': 'Selezionati per te',
                'featured.title': 'In evidenza questa settimana',
                'featured.description': 'I migliori posti raccomandati dai locali e amati dai turisti',
                
                // Footer
                'footer.text': 'La tua guida di fiducia per scoprire il meglio di Belgrado. Consigliato dai locali, amato dai turisti.',
                'footer.explore': 'Esplora',
                'footer.popularAreas': 'Zone Popolari',
                'footer.usefulInfo': 'Info Utili',
                'footer.contact': 'Contatti',
                'footer.aboutFeelbg': 'Chi è FeelBG',
                'footer.forBusiness': 'Per le Aziende',
                'footer.travelTips': 'Consigli di Viaggio',
                'footer.copyright': '© 2025 FeelBG - Scopri Belgrado. Tutti i diritti riservati.',
                'footer.privacy': 'Privacy Policy',
                'footer.terms': 'Termini di Servizio'
            },
            ru: {
                // Navigation
                'nav.home': 'Главная',
                'nav.restaurants': 'Рестораны',
                'nav.cafes': 'Кафе',
                'nav.nightlife': 'Ночная жизнь',
                'nav.attractions': 'Достопримечательности',
                'nav.about': 'О нас',
                
                // Hero Section
                'hero.welcome': 'Добро пожаловать в Белград',
                'hero.title': 'Откройте для себя сердце',
                'hero.of': '',
                'hero.titleAccent': 'Сербии',
                'hero.description': 'Откройте для себя лучшие рестораны Белграда, скрытые кафе, яркую ночную жизнь и незабываемые достопримечательности. Ваш личный путеводитель по самым сокровенным секретам города.',
                'hero.search': 'Поиск ресторанов, кафе, мест...',
                'hero.exploreRestaurants': 'Исследовать рестораны',
                'hero.viewAttractions': 'Посмотреть достопримечательности',
                'hero.restaurants': 'Рестораны',
                'hero.cafes': 'Кафе и бары',
                'hero.attractions': 'Достопримечательности',
                'hero.tourists': 'Довольных туристов',
                'hero.scrollDown': 'Узнать больше',
                
                // Categories
                'categories.subtitle': 'Что исследовать',
                'categories.title': 'Откройте для себя Белград',
                'categories.description': 'От ресторанов мирового класса до яркой ночной жизни - исследуйте все, что может предложить Белград',
                'categories.restaurants': 'Рестораны',
                'categories.restaurantsDesc': 'Откройте для себя удивительную сербскую и международную кухню',
                'categories.restaurantsCount': '250+ Мест',
                'categories.cafes': 'Кафе & Бары',
                'categories.cafesDesc': 'Уютные кафе и модные бары на любой вкус',
                'categories.cafesCount': '150+ Мест',
                'categories.nightlife': 'Ночная жизнь',
                'categories.nightlifeDesc': 'Испытайте город, который никогда не спит',
                'categories.nightlifeCount': '80+ Клубов',
                'categories.attractions': 'Достопримечательности',
                'categories.attractionsDesc': 'Исторические места и современные достопримечательности',
                'categories.attractionsCount': '50+ Мест',
                
                // Featured Section
                'featured.subtitle': 'Отобрано для вас',
                'featured.title': 'Избранное на этой неделе',
                'featured.description': 'Лучшие места, рекомендованные местными жителями и любимые туристами',
                
                // Footer
                'footer.text': 'Ваш надежный гид по открытию лучшего в Белграде. Рекомендован местными жителями, любим туристами.',
                'footer.explore': 'Исследовать',
                'footer.popularAreas': 'Популярные районы',
                'footer.usefulInfo': 'Полезная информация',
                'footer.contact': 'Контакты',
                'footer.aboutFeelbg': 'О FeelBG',
                'footer.forBusiness': 'Для бизнеса',
                'footer.travelTips': 'Советы путешественникам',
                'footer.copyright': '© 2025 FeelBG - Откройте для себя Белград. Все права защищены.',
                'footer.privacy': 'Политика конфиденциальности',
                'footer.terms': 'Условия использования'
            },
            el: {
                // Navigation
                'nav.home': 'Αρχική',
                'nav.restaurants': 'Εστιατόρια',
                'nav.cafes': 'Καφέ',
                'nav.nightlife': 'Νυχτερινή Ζωή',
                'nav.attractions': 'Αξιοθέατα',
                'nav.about': 'Σχετικά',
                
                // Hero Section
                'hero.welcome': 'Καλώς ήρθατε στο Βελιγράδι',
                'hero.title': 'Ανακαλύψτε την Καρδιά',
                'hero.of': 'της',
                'hero.titleAccent': 'Σερβίας',
                'hero.description': 'Ζήστε την εμπειρία των καλύτερων εστιατορίων του Βελιγραδίου, κρυφών καφέ, ζωντανής νυχτερινής ζωής και αξέχαστων αξιοθέατων. Ο προσωπικός σας οδηγός στα καλύτερα κρυμμένα μυστικά της πόλης.',
                'hero.search': 'Αναζήτηση εστιατορίων, καφέ, μέρων...',
                'hero.exploreRestaurants': 'Εξερευνήστε Εστιατόρια',
                'hero.viewAttractions': 'Δείτε Αξιοθέατα',
                'hero.restaurants': 'Εστιατόρια',
                'hero.cafes': 'Καφέ & Μπαρ',
                'hero.attractions': 'Αξιοθέατα',
                'hero.tourists': 'Ευχαριστημένοι Τουρίστες',
                'hero.scrollDown': 'Ανακαλύψτε Περισσότερα',
                
                // Categories
                'categories.subtitle': 'Τι να Εξερευνήσετε',
                'categories.title': 'Ανακαλύψτε το Βελιγράδι',
                'categories.description': 'Από γεύματα παγκόσμιας κλάσης έως ζωντανή νυχτερινή ζωή - εξερευνήστε όλα όσα έχει να προσφέρει το Βελιγράδι',
                'categories.restaurants': 'Εστιατόρια',
                'categories.restaurantsDesc': 'Ανακαλύψτε την καταπληκτική σερβική και διεθνή κουζίνα',
                'categories.restaurantsCount': '250+ Μέρη',
                'categories.cafes': 'Καφέ & Μπαρ',
                'categories.cafesDesc': 'Άνετα καφέ και μοντέρνα μπαρ για κάθε διάθεση',
                'categories.cafesCount': '150+ Σημεία',
                'categories.nightlife': 'Νυχτερινή Ζωή',
                'categories.nightlifeDesc': 'Βιώστε την πόλη που δεν κοιμάται ποτέ',
                'categories.nightlifeCount': '80+ Κλαμπ',
                'categories.attractions': 'Αξιοθέατα',
                'categories.attractionsDesc': 'Ιστορικοί χώροι και σύγχρονα ορόσημα',
                'categories.attractionsCount': '50+ Μέρη',
                
                // Featured Section
                'featured.subtitle': 'Επιλεγμένα για εσάς',
                'featured.title': 'Προτεινόμενα αυτή την εβδομάδα',
                'featured.description': 'Τα καλύτερα μέρη που προτείνονται από ντόπιους και αγαπιούνται από τουρίστες',
                
                // Footer
                'footer.text': 'Ο αξιόπιστος οδηγός σας για την ανακάλυψη του καλύτερου του Βελιγραδίου. Συνιστάται από ντόπιους, αγαπημένο από τουρίστες.',
                'footer.explore': 'Εξερευνήστε',
                'footer.popularAreas': 'Δημοφιλείς Περιοχές',
                'footer.usefulInfo': 'Χρήσιμες Πληροφορίες',
                'footer.contact': 'Επικοινωνία',
                'footer.aboutFeelbg': 'Σχετικά με το FeelBG',
                'footer.forBusiness': 'Για Επιχειρήσεις',
                'footer.travelTips': 'Συμβουλές Ταξιδιού',
                'footer.copyright': '© 2025 FeelBG - Ανακαλύψτε το Βελιγράδι. Όλα τα δικαιώματα διατηρούνται.',
                'footer.privacy': 'Πολιτική Απορρήτου',
                'footer.terms': 'Όροι Χρήσης'
            },
            us: {
                // Navigation
                'nav.home': 'Home',
                'nav.restaurants': 'Restaurants',
                'nav.cafes': 'Cafes',
                'nav.nightlife': 'Nightlife',
                'nav.attractions': 'Attractions',
                'nav.about': 'About',
                
                // Hero Section
                'hero.welcome': 'Welcome to Belgrade',
                'hero.title': 'Discover the Heart',
                'hero.of': 'of',
                'hero.titleAccent': 'SERBIA',
                'hero.description': 'Experience Belgrade\'s finest restaurants, hidden cafes, vibrant nightlife, and unforgettable attractions. Your personal guide to the city\'s best kept secrets.',
                'hero.search': 'Search restaurants, cafes, places...',
                'hero.exploreRestaurants': 'Explore Restaurants',
                'hero.viewAttractions': 'View Attractions',
                'hero.restaurants': 'Restaurants',
                'hero.cafes': 'Cafes & Bars',
                'hero.attractions': 'Attractions',
                'hero.tourists': 'Happy Tourists',
                'hero.scrollDown': 'Explore More',
                
                // Categories
                'categories.subtitle': 'What to Explore',
                'categories.title': 'Discover Belgrade',
                'categories.description': 'From world-class dining to vibrant nightlife - explore everything Belgrade has to offer',
                'categories.restaurants': 'Restaurants',
                'categories.restaurantsDesc': 'Discover amazing Serbian and international cuisine',
                'categories.restaurantsCount': '250+ Places',
                'categories.cafes': 'Cafes & Bars',
                'categories.cafesDesc': 'Cozy cafes and trendy bars for every mood',
                'categories.cafesCount': '150+ Spots',
                'categories.nightlife': 'Nightlife',
                'categories.nightlifeDesc': 'Experience the city that never sleeps',
                'categories.nightlifeCount': '80+ Clubs',
                'categories.attractions': 'Attractions',
                'categories.attractionsDesc': 'Historic sites and modern landmarks',
                'categories.attractionsCount': '50+ Places',
                
                // Featured Section
                'featured.subtitle': 'Handpicked for You',
                'featured.title': 'Featured This Week',
                'featured.description': 'The best places recommended by locals and loved by tourists',
                
                // Footer
                'footer.text': 'Your trusted guide to discovering the best of Belgrade. Recommended by locals, loved by tourists.',
                'footer.explore': 'Explore',
                'footer.popularAreas': 'Popular Areas',
                'footer.usefulInfo': 'Useful Info',
                'footer.contact': 'Contact Us',
                'footer.aboutFeelbg': 'About FeelBG',
                'footer.forBusiness': 'For Business',
                'footer.travelTips': 'Travel Tips',
                'footer.copyright': '© 2025 FeelBG - Discover Belgrade. All rights reserved.',
                'footer.privacy': 'Privacy Policy',
                'footer.terms': 'Terms of Service'
            },
            sr: {
                // Navigation
                'nav.home': 'Почетна',
                'nav.restaurants': 'Ресторани',
                'nav.cafes': 'Кафеи',
                'nav.nightlife': 'Ноћни живот',
                'nav.attractions': 'Атракције',
                'nav.about': 'О нама',
                
                // Hero Section
                'hero.welcome': 'Добродошли у Београд',
                'hero.title': 'Откријте срце',
                'hero.of': '',
                'hero.titleAccent': 'СРБИЈЕ',
                'hero.description': 'Доживите најбоље ресторане Београда, скривене кафее, живахан ноћни живот и незаборавне атракције. Ваш лични водич кроз најбоље чуване тајне града.',
                'hero.search': 'Претражите ресторане, кафее, места...',
                'hero.exploreRestaurants': 'Истражите ресторане',
                'hero.viewAttractions': 'Погледајте атракције',
                'hero.restaurants': 'Ресторани',
                'hero.cafes': 'Кафеи',
                'hero.attractions': 'Атракције',
                'hero.tourists': 'Срећни туристи',
                'hero.scrollDown': 'Истражите више',
                
                // Categories
                'categories.subtitle': 'Шта истражити',
                'categories.title': 'Откријте Београд',
                'categories.description': 'Од светске кухиње до живахног ноћног живота - истражите све што Београд нуди',
                'categories.restaurants': 'Ресторани',
                'categories.restaurantsDesc': 'Откријте невероватну српску и међународну кухињу',
                'categories.restaurantsCount': '250+ Места',
                'categories.cafes': 'Кафеи & Барови',
                'categories.cafesDesc': 'Удобни кафеи и модерни барови за свако расположење',
                'categories.cafesCount': '150+ Места',
                'categories.nightlife': 'Ноћни живот',
                'categories.nightlifeDesc': 'Доживите град који никада не спава',
                'categories.nightlifeCount': '80+ Клубова',
                'categories.attractions': 'Атракције',
                'categories.attractionsDesc': 'Историјска места и модерни симболи',
                'categories.attractionsCount': '50+ Места',
                
                // Featured Section
                'featured.subtitle': 'Одабрано за вас',
                'featured.title': 'Препоручено ове недеље',
                'featured.description': 'Најбоља места препоручена од стране локалаца и вољена од стране туриста',
                
                // Footer
                'footer.text': 'Ваш поуздан водич за откривање најбољег у Београду. Препоручују локалци, воле туристи.',
                'footer.explore': 'Истражите',
                'footer.popularAreas': 'Популарна подручја',
                'footer.usefulInfo': 'Корисне информације',
                'footer.contact': 'Контактирајте нас',
                'footer.aboutFeelbg': 'О FeelBG',
                'footer.forBusiness': 'За бизнис',
                'footer.travelTips': 'Савети за путовање',
                'footer.copyright': '© 2025 FeelBG - Откријте Београд. Сва права задржана.',
                'footer.privacy': 'Политика приватности',
                'footer.terms': 'Услови коришћења'
            },
            he: {
                // Navigation
                'nav.home': 'בית',
                'nav.restaurants': 'מסעדות',
                'nav.cafes': 'בתי קפה',
                'nav.nightlife': 'חיי לילה',
                'nav.attractions': 'אטרקציות',
                'nav.about': 'אודות',
                
                // Hero Section
                'hero.welcome': 'ברוכים הבאים לבלגרד',
                'hero.title': 'גלו את הלב',
                'hero.of': 'של',
                'hero.titleAccent': 'סרביה',
                'hero.description': 'חוו את המסעדות הטובות ביותר של בלגרד, בתי קפה נסתרים, חיי לילה תוססים ואטרקציות בלתי נשכחות. המדריך האישי שלכם לסודות העיר.',
                'hero.search': 'חפש מסעדות, בתי קפה, מקומות...',
                'hero.exploreRestaurants': 'חקור מסעדות',
                'hero.viewAttractions': 'צפה באטרקציות',
                'hero.restaurants': 'מסעדות',
                'hero.cafes': 'בתי קפה',
                'hero.attractions': 'אטרקציות',
                'hero.tourists': 'תיירים מאושרים',
                'hero.scrollDown': 'גלה עוד',
                
                // Categories
                'categories.subtitle': 'מה לחקור',
                'categories.title': 'גלה את בלגרד',
                'categories.description': 'ממסעדות ברמה עולמית לחיי לילה תוססים - חקור את כל מה שבלגרד מציעה',
                'categories.restaurants': 'מסעדות',
                'categories.restaurantsDesc': 'גלו מטבח סרבי ובינלאומי מדהים',
                'categories.restaurantsCount': '250+ מקומות',
                'categories.cafes': 'בתי קפה ובארים',
                'categories.cafesDesc': 'בתי קפה נעימים וברים אופנתיים לכל מצב רוח',
                'categories.cafesCount': '150+ מקומות',
                'categories.nightlife': 'חיי לילה',
                'categories.nightlifeDesc': 'חוו את העיר שלא ישנה לעולם',
                'categories.nightlifeCount': '80+ מועדונים',
                'categories.attractions': 'אטרקציות',
                'categories.attractionsDesc': 'אתרים היסטוריים וציוני דרך מודרניים',
                'categories.attractionsCount': '50+ מקומות',
                
                // Featured Section
                'featured.subtitle': 'נבחר עבורכם',
                'featured.title': 'מומלצים השבוע',
                'featured.description': 'המקומות הטובים ביותר שמומלצים על ידי מקומיים ואהובים על ידי תיירים',
                
                // Footer
                'footer.text': 'המדריך המהימן שלך לגילוי הטוב ביותר בבלגרד. מומלץ על ידי מקומיים, נאהב על ידי תיירים.',
                'footer.explore': 'חקור',
                'footer.popularAreas': 'אזורים פופולריים',
                'footer.usefulInfo': 'מידע שימושי',
                'footer.contact': 'צור קשר',
                'footer.aboutFeelbg': 'אודות FeelBG',
                'footer.forBusiness': 'לעסקים',
                'footer.travelTips': 'טיפים לטיול',
                'footer.copyright': '© 2025 FeelBG - גלה את בלגרד. כל הזכויות שמורות.',
                'footer.privacy': 'מדיניות פרטיות',
                'footer.terms': 'תנאי שירות'
            }
        };
        
        this.selectedLanguage = null;
        this.init();
    }

    init() {
        // Check if language already selected
        const stored = localStorage.getItem('feelbg_language');
        
        if (!stored) {
            // Show selector on first visit
            setTimeout(() => {
                this.showLanguageModal();
            }, 500);
        } else {
            this.selectedLanguage = JSON.parse(stored);
            this.addLanguageIndicator();
            // Translate page immediately if language is already set
            this.translatePage(this.selectedLanguage.code);
        }
        
        // Setup dropdown functionality
        this.setupDropdownToggle();
    }
    
    setupDropdownToggle() {
        const indicator = document.getElementById('language-indicator');
        const menu = document.getElementById('language-menu');
        
        if (!indicator || !menu) return;
        
        // Toggle menu on click
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            menu.classList.toggle('active');
        });
        
        // Handle language selection
        menu.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                e.preventDefault();
                const code = option.dataset.code;
                const language = this.languages.find(l => l.code === code);
                
                if (language) {
                    this.selectLanguage(language);
                    menu.classList.remove('active');
                }
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!indicator.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }

    showLanguageModal() {
        const modal = document.createElement('div');
        modal.className = 'language-modal';
        modal.innerHTML = `
            <div class="language-modal__overlay"></div>
            <div class="language-modal__content">
                <div class="language-modal__header">
                    <h2>🌍 Welcome to Belgrade!</h2>
                    <p>Choose your language / Изаберите језик / Dil seçin</p>
                </div>
                
                <div class="language-grid">
                    ${this.languages.map(lang => `
                        <button class="language-card" data-code="${lang.code}" data-name="${lang.name}">
                            <div class="language-flag">${lang.flag}</div>
                            <div class="language-name">${lang.name}</div>
                            <div class="language-country">${lang.country}</div>
                        </button>
                    `).join('')}
                </div>
                
                <p class="language-note">
                    <i class="fas fa-info-circle"></i>
                    You can change this later in settings
                </p>
            </div>
        `;

        document.body.appendChild(modal);
        this.addLanguageModalStyles();
        this.setupLanguageModalEvents(modal);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    setupLanguageModalEvents(modal) {
        const cards = modal.querySelectorAll('.language-card');
        
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const code = card.dataset.code;
                const name = card.dataset.name;
                const language = this.languages.find(l => l.code === code);
                
                // Animate selection
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                // Save selection after animation
                setTimeout(() => {
                    this.selectLanguage(language);
                    modal.classList.add('closing');
                    
                    setTimeout(() => {
                        modal.remove();
                        document.body.style.overflow = '';
                        this.showWelcomeToast(language);
                    }, 400);
                }, 300);
            });
        });
    }

    selectLanguage(language) {
        this.selectedLanguage = language;
        localStorage.setItem('feelbg_language', JSON.stringify(language));
        this.addLanguageIndicator();
        this.translatePage(language.code);
        
        console.log(`Language selected: ${language.name} (${language.code})`);
    }

    translatePage(langCode) {
        const translations = this.translations[langCode] || this.translations['en'];
        
        // Add translation attributes to elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
    }

    addLanguageIndicator() {
        // Update existing indicator
        const indicator = document.getElementById('language-indicator');
        const flagImg = document.getElementById('current-flag');
        if (indicator && flagImg) {
            const flagMap = {
                'en': 'gb',
                'us': 'us',
                'tr': 'tr',
                'de': 'de',
                'fr': 'fr',
                'it': 'it',
                'ru': 'ru',
                'el': 'gr',
                'sr': 'rs',
                'he': 'il'
            };
            const countryCode = flagMap[this.selectedLanguage.code] || 'us';
            flagImg.src = `https://flagcdn.com/w80/${countryCode}.png`;
            flagImg.alt = countryCode.toUpperCase();
            indicator.title = this.selectedLanguage.name;
        }
    }

    showWelcomeToast(language) {
        const welcomeMessages = {
            'en': 'Welcome to FeelBG!',
            'tr': 'FeelBG\'ye Hoş Geldiniz!',
            'de': 'Willkommen bei FeelBG!',
            'fr': 'Bienvenue chez FeelBG!',
            'it': 'Benvenuto a FeelBG!',
            'ru': 'Добро пожаловать в FeelBG!',
            'el': 'Καλώς ήρθατε στο FeelBG!',
            'us': 'Welcome to FeelBG!'
        };

        const message = welcomeMessages[language.code] || welcomeMessages['en'];
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 1.25rem 2rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border-radius: 1rem;
            box-shadow: 0 12px 48px rgba(16, 185, 129, 0.4);
            z-index: 10002;
            animation: slideInUp 0.5s ease;
            font-weight: 600;
            font-size: 1.125rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        `;
        toast.innerHTML = `
            <span style="font-size: 2rem;">${language.flag}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.5s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 500);
        }, 4000);
    }

    addLanguageModalStyles() {
        if (document.getElementById('language-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'language-modal-styles';
        style.textContent = `
            .language-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                animation: fadeIn 0.5s ease;
            }

            .language-modal.closing {
                animation: fadeOut 0.4s ease;
            }

            .language-modal__overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(184, 134, 11, 0.9) 100%);
                backdrop-filter: blur(10px);
            }

            .language-modal__content {
                position: relative;
                background: white;
                border-radius: 2rem;
                padding: 3rem 2.5rem;
                max-width: 900px;
                width: 100%;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
                animation: zoomIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                max-height: 90vh;
                overflow-y: auto;
            }

            .language-modal__header {
                text-align: center;
                margin-bottom: 3rem;
            }

            .language-modal__header h2 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #1e3a8a 0%, #b8860b 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.75rem;
                font-weight: 900;
            }

            .language-modal__header p {
                font-size: 1.125rem;
                color: #6b7280;
                font-weight: 500;
            }

            .language-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .language-card {
                background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
                border: 3px solid #e5e7eb;
                border-radius: 1.5rem;
                padding: 2rem 1.5rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .language-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(184, 134, 11, 0.05) 100%);
                opacity: 0;
                transition: opacity 0.3s;
            }

            .language-card:hover {
                transform: translateY(-10px) scale(1.05);
                border-color: #b8860b;
                box-shadow: 0 20px 50px rgba(184, 134, 11, 0.3);
            }

            .language-card:hover::before {
                opacity: 1;
            }

            .language-card.selected {
                background: linear-gradient(135deg, #1e3a8a 0%, #b8860b 100%);
                border-color: #b8860b;
                transform: scale(1.1);
                box-shadow: 0 25px 60px rgba(184, 134, 11, 0.5);
            }

            .language-card.selected .language-flag {
                transform: scale(1.3);
            }

            .language-card.selected .language-name,
            .language-card.selected .language-country {
                color: white;
            }

            .language-flag {
                font-size: 4rem;
                margin-bottom: 1rem;
                transition: all 0.3s;
                line-height: 1;
            }

            .language-name {
                font-size: 1.25rem;
                font-weight: 700;
                color: #1e3a8a;
                margin-bottom: 0.5rem;
                transition: color 0.3s;
            }

            .language-country {
                font-size: 0.875rem;
                color: #6b7280;
                font-weight: 500;
                transition: color 0.3s;
            }

            .language-note {
                text-align: center;
                color: #6b7280;
                font-size: 0.938rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .language-note i {
                color: #3b82f6;
            }

            .flag-icon {
                font-size: 1.5rem;
                line-height: 1;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }

            @keyframes zoomIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes slideOutDown {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(30px);
                }
            }

            @media (max-width: 768px) {
                .language-modal__content {
                    padding: 2rem 1.5rem;
                }

                .language-modal__header h2 {
                    font-size: 2rem;
                }

                .language-grid {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .language-card {
                    padding: 1.5rem 1rem;
                }

                .language-flag {
                    font-size: 3rem;
                }

                .language-name {
                    font-size: 1rem;
                }
            }

            @media (max-width: 480px) {
                .language-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }

    getCurrentLanguage() {
        return this.selectedLanguage;
    }

    changeLanguage(code) {
        const language = this.languages.find(l => l.code === code);
        if (language) {
            this.selectLanguage(language);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.languageSelector = new LanguageSelector();
});


