"use strict";

var FEELBG_VENUES = {
    restaurants: [
        {
            name: "Temperament",
            cuisine: "serbian",
            cuisineLabel: "Modern Serbian",
            price: "moderate",
            priceLabel: "€15–25 per person",
            area: "Stari Grad",
            address: "Karađorđeva 2-4, Beton Hala",
            rating: 4.7,
            badge: "popular",
            description:
                "Contemporary Serbian restaurant with creative dishes and modern ambiance",
            lat: 44.8135,
            lng: 20.4528,
            image: "slike/temperament.jpg",
        },
        {
            name: "Zlatni Bokal",
            cuisine: "serbian",
            cuisineLabel: "Traditional Serbian",
            price: "moderate",
            priceLabel: "€12–22 per person",
            area: "Stari Grad",
            address: "Skadarska 26, Skadarlija",
            rating: 4.8,
            badge: "topRated",
            description:
                "Golden Goblet - authentic Skadarlija kafana with traditional Serbian cuisine",
            lat: 44.8185,
            lng: 20.4632,
            image: "slike/Zlatni Bokal.jpg",
        },
        {
            name: "Dva Jelena",
            cuisine: "serbian",
            cuisineLabel: "Traditional Serbian",
            price: "moderate",
            priceLabel: "€10–20 per person",
            area: "Stari Grad",
            address: "Skadarska 32, Skadarlija",
            rating: 4.7,
            badge: "popular",
            description:
                "Two Deer — legendary Skadarlija kafana with tamburitza music",
            lat: 44.818,
            lng: 20.464,
            image: "slike/logo/dva jelena.jpg",
        },
    ],

    cafes: [
        {
            name: "Smokvica",
            cuisine: "coffee",
            cuisineLabel: "Specialty Coffee",
            price: "moderate",
            priceLabel: "€8–16 per person",
            area: "Dorćol",
            address: "Kralja Petra 73, Dorćol",
            rating: 4.6,
            badge: "popular",
            description:
                "Courtyard cafe and all-day brunch spot behind a quiet Dorcol facade",
            lat: 44.8218,
            lng: 20.4562,
            image: "slike/logo/smokvica.jpg"
        },
        {
            name: "Supermarket Concept Store",
            cuisine: "coffee",
            cuisineLabel: "Specialty Coffee",
            price: "moderate",
            priceLabel: "€9–18 per person",
            area: "Vračar",
            address: "Višnjićeva 10, Vračar",
            rating: 4.5,
            description:
                "Concept store, cafe and healthy kitchen under one roof",
            lat: 44.8039,
            lng: 20.4712,
            image: "slike/logo/supermarket.jpg"
        },
        {
            name: "Manufaktura",
            cuisine: "coffee",
            cuisineLabel: "Cafe · Garden",
            price: "moderate",
            priceLabel: "€10–20 per person",
            area: "Stari Grad",
            address: "Kralja Petra 13-15, Stari Grad",
            rating: 4.5,
            badge: "trending",
            description:
                "Famous red-umbrella courtyard, coffee by day and rakija by night",
            lat: 44.8205,
            lng: 20.456,
            image: "slike/logo/manufaktura.jpg"
        },
        {
            name: "Comunale Caffe",
            cuisine: "coffee",
            cuisineLabel: "Cafe · Bar",
            price: "budget",
            priceLabel: "€5–12 per person",
            area: "Vračar",
            address: "Njegoševa, Vračar",
            rating: 4.4,
            description:
                "Neighbourhood cafe bar that runs from morning coffee straight into evening drinks",
            lat: 44.802,
            lng: 20.469,
            image: "slike/logo/comunale.jpg"
        },
        {
            name: "Kafeterija",
            cuisine: "coffee",
            cuisineLabel: "Specialty Coffee",
            price: "budget",
            priceLabel: "€4–10 per person",
            area: "Stari Grad",
            address: "Kralja Petra, Stari Grad",
            rating: 4.6,
            badge: "topRated",
            description:
                "Small-batch roasters and the reference point for third-wave coffee in Belgrade",
            lat: 44.8188,
            lng: 20.4553,
            image: ""
        },
        {
            name: "Pržionica D59B",
            cuisine: "coffee",
            cuisineLabel: "Coffee Roastery",
            price: "budget",
            priceLabel: "€4–10 per person",
            area: "Dorćol",
            address: "Dobračina 59b, Dorćol",
            rating: 4.6,
            description:
                "Working roastery with a counter — the coffee is roasted in the room you drink it in",
            lat: 44.8234,
            lng: 20.4626,
            image: ""
        },
        {
            name: "Hotel Moskva",
            cuisine: "cocktail",
            cuisineLabel: "Cafe · Patisserie",
            price: "upscale",
            priceLabel: "€10–22 per person",
            area: "Stari Grad",
            address: "Balkanska 1, Stari Grad",
            rating: 4.6,
            badge: "popular",
            description:
                "1908 hotel cafe famous for its Moskva schnitte cake and marble room",
            lat: 44.8123,
            lng: 20.4585,
            image: "slike/logo/hotel moskva.jpg"
        },
        {
            name: "Frans",
            cuisine: "wine",
            cuisineLabel: "Cafe · Wine Bar",
            price: "moderate",
            priceLabel: "€12–24 per person",
            area: "Vračar",
            address: "Bulevar oslobođenja, Vračar",
            rating: 4.4,
            description:
                "French-leaning cafe that turns into a wine bar after dark",
            lat: 44.7962,
            lng: 20.4696,
            image: "slike/logo/frans.jpg"
        },
    ],

    nightlife: [
        {
            name: "Money",
            cuisine: "electronic",
            cuisineLabel: "Club · Electronic",
            price: "upscale",
            priceLabel: "€12–20 entry",
            area: "Savski Venac",
            address: "Savski Venac, Belgrade Waterfront",
            rating: 4.8,
            badge: "topRated",
            description:
                "Premier nightclub at Belgrade Waterfront with top electronic DJs",
            lat: 44.8148,
            lng: 20.4480,
            image: "assets/images/money-club.jpg",
        },
        {
            name: "Lasta",
            cuisine: "mainstream",
            cuisineLabel: "Splav · Party",
            price: "moderate",
            priceLabel: "€5–15 entry",
            area: "Novi Beograd",
            address: "Savski Kej, Novi Beograd",
            rating: 4.7,
            badge: "popular",
            description:
                "Legendary floating nightclub on the Sava with top DJs and open-air dancing",
            lat: 44.8150,
            lng: 20.4200,
            image: "slike/lasta.jpg",
        },
        {
            name: "Leto",
            cuisine: "mainstream",
            cuisineLabel: "Splav · Lounge",
            price: "moderate",
            priceLabel: "€8–16 entry",
            area: "Novi Beograd",
            address: "Savski kej, Novi Beograd",
            rating: 4.5,
            description:
                "Riverside beach club on the Sava — daybeds by day, DJs after dark",
            lat: 44.8145,
            lng: 20.421,
            image: ""
        },
        {
            name: "Sindikat",
            cuisine: "electronic",
            cuisineLabel: "Club · Techno",
            price: "moderate",
            priceLabel: "€8–15 entry",
            area: "Savamala",
            address: "Savamala, Belgrade",
            rating: 4.6,
            badge: "trending",
            description:
                "Underground techno club in a converted Savamala warehouse, serious sound system and a devoted late-night crowd",
            lat: 44.8168,
            lng: 20.4571,
            image: ""
        }
    ],

    attractions: [
        {
            name: "Kalemegdan Fortress",
            cuisine: "historic",
            cuisineLabel: "Historic Fortress",
            area: "Stari Grad",
            address: "Kalemegdan Park, Stari Grad",
            rating: 4.9,
            badge: "topRated",
            description:
                "Ancient fortress at the confluence of the Sava and Danube rivers",
            lat: 44.8227,
            lng: 20.4513,
            image: "assets/atractions/kalis.jfif",
            hook:
                "From the Victor terrace you look straight down at the seam where the green Sava pushes into the brown Danube — two colours of water that take a while to mix.",
            about:
                "The fortress is layered: Roman foundations, medieval Serbian ramparts, Austrian gates and Ottoman tombs stacked on one hill. You walk the Upper and Lower Town, past the Clock Tower and Despot's Gate, the zoo, and basketball courts the neighbourhood kids still use.",
            why:
                "Nowhere else in the city makes it so obvious why Belgrade was destroyed some forty times — and rebuilt on the same rock every time.",
            insider:
                "Come 45 minutes before sunset and go left of the Victor statue, onto the rampart above Nebojsa Tower — everyone crowds the monument, but the better angle on the confluence is twenty metres further along.",
            pills: ["confluence", "sunset", "free entry"]
        },
        {
            name: "Skadarlija Bohemian Quarter",
            cuisine: "cultural",
            cuisineLabel: "Bohemian Street",
            area: "Stari Grad",
            address: "Skadarska ulica, Skadarlija",
            rating: 4.8,
            badge: "popular",
            description:
                "Cobblestone street lined with kafanas, art galleries and street musicians",
            lat: 44.8183,
            lng: 20.4638,
            image: "assets/atractions/skadarl.jpg",
            hook:
                "The cobblestones were laid in 1968 to look like 1890 — and two drinks in, you stop caring.",
            about:
                "Three hundred metres of uphill street lined with 19th-century kafanas, tamburitza bands moving from table to table, and portrait artists who finish in twenty minutes. In the evening the tables come out onto the street and the whole lane turns into one long dining room.",
            why:
                "It is the only part of Belgrade where the music still arrives at your table instead of out of a speaker.",
            insider:
                "Start at the bottom, from Cetinjska, and walk up — the kafanas at the top are the tourist ones, the ones halfway up still keep their old regulars.",
            pills: ["kafanas", "live tamburitza", "cobblestones"]
        },
        {
            name: "Ada Ciganlija",
            cuisine: "nature",
            cuisineLabel: "Beach · Recreation",
            area: "Čukarica",
            address: "Ada Ciganlija, Čukarica",
            rating: 4.9,
            badge: "topRated",
            description:
                "Belgrade's Sea — river island paradise with beaches, sports and cafés",
            lat: 44.7833,
            lng: 20.4,
            image: "assets/images/ada-ciganlija.jpg",
            hook:
                "A river island that was turned into a peninsula and a lake in 1967 — seven kilometres of beach, twenty minutes from Republic Square.",
            about:
                "Gravel shoreline, yellow floating bars, a cycling loop around the whole lake, volleyball courts, kayaks, rowing and a bungee jump off the bridge. In July it takes a hundred thousand people a day; in winter it is empty and perfect for running.",
            why:
                "This is where Belgrade actually spends its summer — come on a Sunday afternoon if you want the city as it is rather than as it photographs.",
            insider:
                "The western end of the lake, behind the tennis courts, has quiet grass coves with no music — that is where people who live here go, not the ones who came for the day.",
            pills: ["lake swimming", "cycling loop", "summer"]
        },
        {
            name: "Saint Sava Temple",
            cuisine: "religious",
            cuisineLabel: "Orthodox Church",
            area: "Vračar",
            address: "Krušedolska 2a, Vračar",
            rating: 4.9,
            badge: "topRated",
            description:
                "One of the largest Orthodox churches in the world with stunning gold mosaics",
            lat: 44.7981,
            lng: 20.4691,
            image: "assets/atractions/sveti.jpg",
            hook:
                "The dome mosaic is forty million pieces of gold and glass — and it only went up in 2020, after eighty years of bare concrete.",
            about:
                "Outside, white marble under a 4,000-tonne dome that was assembled on the ground in 1989 and lifted into place in one piece. Inside it is a single vast room with no columns, and underneath it a crypt church covered in frescoes in a completely different, warmer register.",
            why:
                "Few buildings anywhere let you see a medieval Byzantine form executed with twentieth-century engineering.",
            insider:
                "Most people walk in, look up and leave — go down to the crypt instead: nine colours of marble, different acoustics, and almost nobody there.",
            pills: ["gold mosaic", "the crypt", "free entry"]
        },
        {
            name: "Nikola Tesla Museum",
            cuisine: "museum",
            cuisineLabel: "Science Museum",
            area: "Vračar",
            address: "Krunska 51, Vračar",
            rating: 4.8,
            badge: "popular",
            description:
                "The world's only museum dedicated to inventor Nikola Tesla with interactive exhibits",
            lat: 44.8052,
            lng: 20.4707,
            image: "assets/atractions/nidza.jpg",
            hook:
                "The urn holding Tesla's ashes is here — a gilded sphere in an upstairs room, twenty metres from the rig they use to run alternating current past the crowd.",
            about:
                "The museum keeps over 160,000 original documents and Tesla's personal effects, but the heart of it is the demonstration: the guide fires up a Tesla coil and hands out fluorescent tubes that light in your hand, with no wire attached. The tour runs about 45 minutes, in groups, by language.",
            why:
                "It is the only museum in the world dedicated to Tesla — and the only address holding both his archive and his ashes.",
            insider:
                "Tours leave on the hour and fill up, especially after lunch — take the first one of the morning or book ahead, or you will be waiting on the pavement in Krunska.",
            pills: ["live demonstration", "original archive", "guided tour"]
        },
        {
            name: "Topčider Park",
            cuisine: "nature",
            cuisineLabel: "Royal Park",
            area: "Topčider",
            address: "Topčiderski park, Topčider",
            rating: 4.7,
            description:
                "Royal park with 200-year-old plane trees and elegant pavilions",
            lat: 44.7837,
            lng: 20.446,
            image: "assets/images/topcider-park.jpg",
            hook:
                "The plane tree by Milos's residence was planted around 1830 and its trunk is now over six metres around.",
            about:
                "The park began as Prince Milos's court estate — his 1831 residence still stands where it was, with a fountain and an obelisk in front of it. Behind that are meadows, old tree-lined avenues and a path climbing towards Kosutnjak, so it fills with runners, barbecues and dog walkers.",
            why:
                "It is Belgrade's oldest landscaped park and the only place to see what a Serbian princely residence looked like before the city grew around it.",
            insider:
                "Sunday morning it is empty; by afternoon it is a family picnic under barbecue smoke — pick your slot depending on what you came for.",
            pills: ["Milos's residence", "ancient plane trees", "running"]
        },
        {
            name: "Gardoš Tower",
            cuisine: "historic",
            cuisineLabel: "Historic Tower",
            area: "Zemun",
            address: "Gardoš, Zemun",
            rating: 4.7,
            badge: "popular",
            description:
                "Millennium Tower with panoramic views of the Danube and old Zemun",
            lat: 44.8483,
            lng: 20.4097,
            image: "assets/atractions/gardos.jpg",
            hook:
                "The tower went up in 1896 for Hungary's thousand-year anniversary — on what was then the empire's border, running straight through what is now Belgrade.",
            about:
                "It stands on the hill above old Zemun, on the remains of a medieval fortress. You climb to it through narrow streets of low houses, and from the top you get the Danube, Great War Island and the whole Belgrade skyline across the water.",
            why:
                "It is the best view of Belgrade that is not taken from inside Belgrade — you see the city from outside, the way it was watched from across a border for centuries.",
            insider:
                "Below the tower on the river side there is the old Zemun cemetery and a few benches almost nobody uses — same view, no ticket, no queue on the stairs.",
            pills: ["panorama", "old Zemun", "Danube"]
        },
        {
            name: "National Museum",
            cuisine: "museum",
            cuisineLabel: "Art & History Museum",
            area: "Stari Grad",
            address: "Trg Republike 1a, Stari Grad",
            rating: 4.6,
            description:
                "Serbia's largest museum with 400,000+ artifacts spanning 3,000 years",
            lat: 44.8167,
            lng: 20.4594,
            image: "assets/atractions/muzej nac.jpg",
            hook:
                "This is where the Miroslav Gospel from 1180 is kept — the oldest surviving Serbian book, two floors below a Van Gogh.",
            about:
                "Three floors: archaeology from prehistory to Rome on the ground floor, medieval Serbia on the first, European and Serbian painting on the second. The building was shut for fifteen years and reopened in 2018, so the display is new even though the collection is nearly two centuries old.",
            why:
                "It is the only collection in the country that takes you from Vinca figurines to Cezanne in ninety minutes.",
            insider:
                "Entry is free on Sundays, which is also when it is fullest — if you want the medieval rooms to yourself, come Tuesday morning right at opening.",
            pills: ["Miroslav Gospel", "three floors", "free Sundays"]
        },
        {
            name: "Zemun Quay",
            cuisine: "nature",
            cuisineLabel: "Riverside Walk",
            area: "Zemun",
            address: "Kej oslobođenja, Zemun",
            rating: 4.7,
            badge: "trending",
            description:
                "Charming riverside promenade with cafés, swans and Danube sunsets",
            lat: 44.8397,
            lng: 20.4011,
            image: "assets/atractions/zemun.jpeg",
            hook:
                "The swans on this stretch of the Danube are permanent residents — the neighbourhood feeds them every morning, all year.",
            about:
                "Two kilometres of flat riverside promenade: floating bars, cafes and fish restaurants on one side, open Danube on the other. It runs from Hotel Jugoslavija to Gardos and is paved the whole way, so it fills with cyclists, skaters and prams.",
            why:
                "It is the best sunset in the city because you face due west across open water, with no buildings cutting the horizon.",
            insider:
                "The fish restaurants on the quay are fine, but people from Zemun walk two blocks inland to Glavna — same fish, half the price, no tourist menu.",
            pills: ["sunset walk", "Danube promenade", "fish restaurants"]
        },
        {
            name: "Belgrade Fortress Military Museum",
            cuisine: "museum",
            cuisineLabel: "Military Museum",
            area: "Stari Grad",
            address: "Kalemegdan bb, Stari Grad",
            rating: 4.5,
            description:
                "Outdoor tanks and artillery plus indoor exhibits tracing Serbia's military history",
            lat: 44.823,
            lng: 20.4518,
            image: "assets/atractions/miltary.jfif",
            hook:
                "The tanks sit outside on the ramparts where you can walk up and put a hand on them — including wreckage from the American stealth fighter shot down in 1999.",
            about:
                "The outdoor display is artillery lined along the Kalemegdan walls, from Ottoman cannon to Soviet howitzers. Inside there are some 3,000 exhibits across weapons, uniforms and flags, from Roman helmets to the wars of the 1990s.",
            why:
                "Nowhere else puts the kit of the many different armies that held this hill in one place.",
            insider:
                "The outdoor artillery is free and always open — if you only have twenty minutes, walk the rampart line and skip the interior.",
            pills: ["outdoor tanks", "F-117 wreckage", "inside the fortress"]
        },
        {
            name: "Museum of Yugoslavia",
            cuisine: "museum",
            cuisineLabel: "History Museum",
            area: "Savski Venac",
            address: "Mihaila Mike Jankovića 6, Dedinje",
            rating: 4.7,
            badge: "popular",
            description:
                "Tito's mausoleum and the relay batons, gifts and objects of a country that no longer exists",
            lat: 44.788,
            lng: 20.451,
            image: ""
        },
        {
            name: "Museum of Contemporary Art",
            cuisine: "museum",
            cuisineLabel: "Modern Art Museum",
            area: "Novi Beograd",
            address: "Ušće 10, Novi Beograd",
            rating: 4.6,
            description:
                "Yugoslav modernist landmark at the confluence, holding 20th-century art of the region",
            lat: 44.8155,
            lng: 20.4415,
            image: ""
        },
        {
            name: "Ethnographic Museum",
            cuisine: "museum",
            cuisineLabel: "Ethnographic Museum",
            area: "Stari Grad",
            address: "Studentski trg 13, Stari Grad",
            rating: 4.5,
            description:
                "Folk costume, craft and village life across the Balkans, floor by floor",
            lat: 44.818,
            lng: 20.457,
            image: ""
        },
        {
            name: "Ružica Church",
            cuisine: "religious",
            cuisineLabel: "Orthodox Church",
            area: "Stari Grad",
            address: "Kalemegdan, Stari Grad",
            rating: 4.7,
            badge: "trending",
            description:
                "Ivy-covered church inside the fortress walls, with chandeliers made from spent shell casings",
            lat: 44.8241,
            lng: 20.4535,
            image: ""
        },
        {
            name: "St. Petka Chapel",
            cuisine: "religious",
            cuisineLabel: "Chapel · Holy Spring",
            area: "Stari Grad",
            address: "Kalemegdan, Stari Grad",
            rating: 4.6,
            description:
                "Mosaic-lined chapel built over a spring people still queue to drink from",
            lat: 44.8243,
            lng: 20.4538,
            image: ""
        },
        {
            name: "Saborna Crkva",
            cuisine: "religious",
            cuisineLabel: "Cathedral Church",
            area: "Stari Grad",
            address: "Kralja Petra 5, Stari Grad",
            rating: 4.6,
            description:
                "Belgrade's 1840 cathedral, burial place of Serbian princes and Vuk Karadžić",
            lat: 44.8199,
            lng: 20.4525,
            image: ""
        },
        {
            name: "St. Mark's Church",
            cuisine: "religious",
            cuisineLabel: "Orthodox Church",
            area: "Palilula",
            address: "Bulevar kralja Aleksandra 17, Tašmajdan",
            rating: 4.7,
            badge: "popular",
            description:
                "Serbo-Byzantine church modelled on Gračanica, holding Emperor Dušan's tomb",
            lat: 44.8107,
            lng: 20.4707,
            image: ""
        },
        {
            name: "Alexander Nevsky Church",
            cuisine: "religious",
            cuisineLabel: "Orthodox Church",
            area: "Dorćol",
            address: "Cara Dušana 63a, Dorćol",
            rating: 4.5,
            description:
                "Quiet Dorcol parish church with a Russian dedication and a shaded churchyard",
            lat: 44.8258,
            lng: 20.4614,
            image: ""
        },
        {
            name: "Tašmajdan Park",
            cuisine: "nature",
            cuisineLabel: "City Park",
            area: "Palilula",
            address: "Beogradska, Tašmajdan",
            rating: 4.6,
            description:
                "Park built over a Roman quarry and a wartime shelter, now benches, chess and fountains",
            lat: 44.8103,
            lng: 20.4713,
            image: ""
        },
        {
            name: "Košutnjak Forest",
            cuisine: "nature",
            cuisineLabel: "Forest Park",
            area: "Čukarica",
            address: "Košutnjak, Čukarica",
            rating: 4.7,
            badge: "popular",
            description:
                "330 hectares of oak and beech forest with running trails and the old royal hunting ground",
            lat: 44.769,
            lng: 20.43,
            image: ""
        },
        {
            name: "Jevremovac Botanical Garden",
            cuisine: "nature",
            cuisineLabel: "Botanical Garden",
            area: "Stari Grad",
            address: "Takovska 43, Stari Grad",
            rating: 4.6,
            description:
                "University garden from 1889 with a cast-iron glasshouse and a Japanese section",
            lat: 44.8177,
            lng: 20.4747,
            image: ""
        },
        {
            name: "Ušće Shopping Center",
            cuisine: "shopping",
            cuisineLabel: "Shopping Centre",
            area: "Novi Beograd",
            address: "Bulevar Mihajla Pupina 4, Novi Beograd",
            rating: 4.5,
            badge: "popular",
            description:
                "The largest mall in the region, at the confluence next to Ušće Tower",
            lat: 44.8162,
            lng: 20.4373,
            image: ""
        },
        {
            name: "Galerija Belgrade",
            cuisine: "shopping",
            cuisineLabel: "Shopping Centre",
            area: "Savski Venac",
            address: "Bulevar Vudroa Vilsona 14, Belgrade Waterfront",
            rating: 4.5,
            badge: "trending",
            description:
                "Waterfront mall with a rooftop terrace over the Sava and 300-plus shops",
            lat: 44.8098,
            lng: 20.4463,
            image: ""
        },
        {
            name: "Rajićeva Shopping Center",
            cuisine: "shopping",
            cuisineLabel: "Shopping Centre",
            area: "Stari Grad",
            address: "Kneza Mihaila 54, Stari Grad",
            rating: 4.4,
            description:
                "Glass mall dropped into the old town, its entrance right on the pedestrian street",
            lat: 44.8168,
            lng: 20.4573,
            image: ""
        },
        {
            name: "Delta City",
            cuisine: "shopping",
            cuisineLabel: "Shopping Centre",
            area: "Novi Beograd",
            address: "Jurija Gagarina 16, Novi Beograd",
            rating: 4.4,
            description:
                "New Belgrade's long-standing mall, cinema and food court included",
            lat: 44.8074,
            lng: 20.4014,
            image: ""
        },
        {
            name: "BEO Shopping Center",
            cuisine: "shopping",
            cuisineLabel: "Shopping Centre",
            area: "Voždovac",
            address: "Vojislava Ilića 141, Voždovac",
            rating: 4.3,
            description:
                "Voždovac mall with a supermarket, cinema and the neighbourhood's weekend crowd",
            lat: 44.7794,
            lng: 20.49,
            image: ""
        },
        {
            name: "Stadion Shopping Center",
            cuisine: "shopping",
            cuisineLabel: "Shopping Centre",
            area: "Voždovac",
            address: "Zaplanjska 32, Voždovac",
            rating: 4.3,
            description:
                "Mall built into the stand of a football stadium — the pitch sits on its roof",
            lat: 44.7717,
            lng: 20.477,
            image: ""
        },
        {
            name: "Avala",
            cuisine: "nature",
            cuisineLabel: "Forest Park",
            area: "Voždovac",
            address: "Avala, Beli Potok",
            rating: 4.8,
            badge: "popular",
            description:
                "Forested hill south of the city with the Monument to the Unknown Hero and the Avala Tower at the top",
            lat: 44.6897,
            lng: 20.515,
            image: "assets/images/avala-mountain.jpg"
            },
        {
            name: "Ušće Park",
            cuisine: "nature",
            cuisineLabel: "Riverside Park",
            area: "Novi Beograd",
            address: "Ušće, Novi Beograd",
            rating: 4.6,
            description:
                "Flat riverside park where the Sava meets the Danube, with cycle paths, fountains and summer concerts",
            lat: 44.818,
            lng: 20.444,
            image: ""
            },
        {
            name: "Zvezdara Forest",
            cuisine: "nature",
            cuisineLabel: "Forest Park",
            area: "Zvezdara",
            address: "Zvezdarska šuma, Zvezdara",
            rating: 4.5,
            description:
                "Belgrade's second-largest forest, laced with running trails and quiet enough to hear the birds",
            lat: 44.792,
            lng: 20.506,
            image: ""
            },
        {
            name: "Pionirski Park",
            cuisine: "nature",
            cuisineLabel: "City Park",
            area: "Stari Grad",
            address: "Dragoslava Jovanovića, Stari Grad",
            rating: 4.5,
            description:
                "Small formal park between the Old and New Palace, with chestnut avenues and benches in the shade",
            lat: 44.8125,
            lng: 20.4638,
            image: ""
            },
        {
            name: "Great War Island",
            cuisine: "nature",
            cuisineLabel: "Nature Reserve",
            area: "Zemun",
            address: "Veliko ratno ostrvo, Zemun",
            rating: 4.6,
            badge: "trending",
            description:
                "Protected river island at the confluence, reachable by pontoon bridge in summer — herons, willows and the Lido beach",
            lat: 44.832,
            lng: 20.44,
            image: ""
            },
        {
            name: "Banjica Forest",
            cuisine: "nature",
            cuisineLabel: "Forest Park",
            area: "Voždovac",
            address: "Banjička šuma, Voždovac",
            rating: 4.4,
            description:
                "Neighbourhood pine forest with an outdoor gym, a marked running loop and dogs off the lead",
            lat: 44.757,
            lng: 20.474,
            image: ""
            }
    ],
};

if (typeof window !== "undefined") {
    window.FEELBG_VENUES = FEELBG_VENUES;
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = FEELBG_VENUES;
}
