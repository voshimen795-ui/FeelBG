'use strict';
/* Long-form editorial copy for the attraction cards.
 *
 * English lives in js/venues.js alongside the rest of the venue data (hook,
 * about, why, insider, pills) — this file carries the other eight languages,
 * plus the section labels in all nine.
 *
 * Keys follow the existing venue convention: venue.<slug>.<field>, where the
 * slug comes from CardRenderer.venueSlug(). Note that the slug strips
 * diacritics as underscores, so Topčider Park is top_ider_park and Gardoš
 * Tower is gardo_tower — those are correct, not typos.
 *
 * Pills are one string with | between tags; CardRenderer splits them.
 */
(function() {
    var T = window.FEELBG_TRANSLATIONS;
    if (!T) return;

    var labels = {
en: {'attraction.why':'Why it\'s worth it','attraction.insider':'Insider'},
sr: {'attraction.why':'Zašto vredi','attraction.insider':'Iz prve ruke'},
tr: {'attraction.why':'Neden değer','attraction.insider':'Yerel ipucu'},
de: {'attraction.why':'Warum es sich lohnt','attraction.insider':'Insider-Tipp'},
fr: {'attraction.why':'Pourquoi ça vaut le détour','attraction.insider':'Le tuyau'},
it: {'attraction.why':'Perché vale','attraction.insider':'Dritta locale'},
ru: {'attraction.why':'Почему стоит','attraction.insider':'Совет местного'},
el: {'attraction.why':'Γιατί αξίζει','attraction.insider':'Συμβουλή ντόπιου'},
he: {'attraction.why':'למה זה שווה','attraction.insider':'טיפ מקומי'},
    };

    var v = {
sr: {
'venue.kalemegdan_fortress.hook':'Sa platoa kod Pobednika gledaš tačno u šav gde zelena Sava ulazi u mutni Dunav — dve boje vode koje se dugo ne pomešaju.',
'venue.kalemegdan_fortress.about':'Tvrđava je slojevita: rimski temelji, srednjovekovni srpski bedemi, austrijske kapije i osmanska turbeta, sve nabijeno na jedno brdo. Šetaš Gornji i Donji grad, pored Sahat-kule i Despotove kapije, Zoo vrta i terena za košarku na kojima i dalje igraju klinci iz kraja.',
'venue.kalemegdan_fortress.why':'Nijedno drugo mesto u gradu ne pokazuje tako jasno zašto je Beograd rušen četrdesetak puta — i svaki put ponovo zidan na istoj steni.',
'venue.kalemegdan_fortress.insider':'Dođi 45 minuta pre zalaska i skreni levo od Pobednika, na bedem iznad Kule Nebojše — svi se guraju kod spomenika, a bolji ugao na ušće je dvadeset metara dalje.',
'venue.kalemegdan_fortress.pills':'ušće|zalazak sunca|besplatan ulaz',

'venue.skadarlija_bohemian_quarter.hook':'Kaldrma je postavljena 1968. da izgleda kao 1890 — i posle dva pića prestane da te zanima.',
'venue.skadarlija_bohemian_quarter.about':'Trista metara ulice uzbrdo, sa obe strane kafane iz 19. veka, tamburaši koji idu od stola do stola i portretisti koji te završe za dvadeset minuta. Uveče se stolovi izvuku napolje i cela ulica postane jedna dugačka trpezarija.',
'venue.skadarlija_bohemian_quarter.why':'Ovo je jedini deo Beograda gde muzika i dalje dolazi do tvog stola, a ne iz zvučnika.',
'venue.skadarlija_bohemian_quarter.insider':'Kreni odozdo, iz Cetinjske, i penji se — kafane pri vrhu su turističke, a one na sredini uzbrdice još drže staru publiku.',
'venue.skadarlija_bohemian_quarter.pills':'kafane|tamburaši uživo|kaldrma',

'venue.ada_ciganlija.hook':'Rečno ostrvo koje je 1967. pretvoreno u poluostrvo i jezero — sedam kilometara plaže na dvadeset minuta od Trga republike.',
'venue.ada_ciganlija.about':'Šljunkovita obala, žuti splavovi, biciklistička staza oko celog jezera, tereni za odbojku, kajak, veslanje i bandži skok sa mosta. U julu ovuda prođe i sto hiljada ljudi dnevno, a zimi je prazna i savršena za trčanje.',
'venue.ada_ciganlija.why':'Ovde Beograd zaista provodi leto — dođi u nedelju popodne ako hoćeš grad kakav jeste, a ne kakav je na razglednici.',
'venue.ada_ciganlija.insider':'Zapadni kraj jezera, iza teniskih terena, ima tihe travnate uvale bez muzike — tamo idu ljudi koji žive u gradu, a ne oni koji su došli na jedan dan.',
'venue.ada_ciganlija.pills':'kupanje|biciklistička staza|leto',

'venue.saint_sava_temple.hook':'Mozaik u kupoli ima četrdeset miliona kockica zlata i stakla — a postavljen je tek 2020, posle osamdeset godina golog betona.',
'venue.saint_sava_temple.about':'Spolja beli mermer ispod kupole od 4.000 tona, koja je 1989. sklopljena na zemlji i podignuta u komadu. Unutra je jedna ogromna prostorija bez ijednog stuba, a ispod nje kripta prekrivena freskama u sasvim drugom, toplijem tonu.',
'venue.saint_sava_temple.why':'Malo koja građevina na svetu ti pokazuje srednjovekovnu vizantijsku formu izvedenu inženjeringom dvadesetog veka.',
'venue.saint_sava_temple.insider':'Većina uđe, pogleda gore i izađe — siđi u kriptu: devet vrsta mermera, druga akustika i skoro niko unutra.',
'venue.saint_sava_temple.pills':'zlatni mozaik|kripta|besplatan ulaz',

'venue.nikola_tesla_museum.hook':'Urna sa Teslinim pepelom je ovde — pozlaćena sfera u sobi na spratu, dvadeset metara od aparature kojom kroz publiku puštaju naizmeničnu struju.',
'venue.nikola_tesla_museum.about':'Muzej čuva preko 160.000 originalnih dokumenata i Tesline lične stvari, ali suština je demonstracija: vodič uključi Teslin kalem i deli fluorescentne cevi koje se upale u ruci, bez ijedne žice. Obilazak traje oko 45 minuta, ide u grupama i po jezicima.',
'venue.nikola_tesla_museum.why':'Jedini muzej na svetu posvećen Tesli — i jedina adresa na kojoj su i njegova zaostavština i njegov pepeo.',
'venue.nikola_tesla_museum.insider':'Grupe kreću na pun sat i brzo se popune, naročito posle podne — idi na prvu jutarnju ili rezerviši, inače čekaš na trotoaru u Krunskoj.',
'venue.nikola_tesla_museum.pills':'demonstracija uživo|originalna arhiva|vođena tura',

'venue.top_ider_park.hook':'Platan kod Miloševog konaka posađen je oko 1830. i danas mu je obim debla preko šest metara.',
'venue.top_ider_park.about':'Park je počeo kao dvorsko imanje kneza Miloša — njegov konak iz 1831. i dalje stoji na istom mestu, sa česmom i obeliskom ispred. Iza njega su livade, stari drvoredi i staza koja se penje ka Košutnjaku, pa je pun trkača, roštilja i ljudi sa psima.',
'venue.top_ider_park.why':'Najstariji uređeni park u Beogradu i jedino mesto gde vidiš kako je izgledala kneževska rezidencija pre nego što je grad narastao oko nje.',
'venue.top_ider_park.insider':'Nedeljom ujutru je prazan, a popodne postane porodični izlet u dimu sa roštilja — biraj termin prema tome zašto si došao.',
'venue.top_ider_park.pills':'konak kneza Miloša|stari platani|trčanje',

'venue.gardo_tower.hook':'Kula je podignuta 1896. za hiljadu godina Mađarske — na tadašnjoj granici carstva, koja je išla tačno kroz današnji Beograd.',
'venue.gardo_tower.about':'Stoji na brdu iznad starog Zemuna, na ostacima srednjovekovne tvrđave. Penješ se do nje kroz uske ulice niskih kuća, a sa vrha ti se otvore Dunav, Veliko ratno ostrvo i cela silueta Beograda preko vode.',
'venue.gardo_tower.why':'Najbolji pogled na Beograd koji ne dolazi iz Beograda — vidiš grad spolja, kako se vekovima gledao sa druge strane granice.',
'venue.gardo_tower.insider':'Ispod kule, sa strane ka reci, je staro zemunsko groblje i nekoliko klupa na kojima skoro nikad nema nikoga — isti pogled, bez karte i bez gužve na stepenicama.',
'venue.gardo_tower.pills':'panorama|stari Zemun|Dunav',

'venue.national_museum.hook':'Ovde se čuva Miroslavljevo jevanđelje iz 1180 — najstarija sačuvana srpska knjiga, dva sprata ispod Van Goga.',
'venue.national_museum.about':'Tri sprata: arheologija od praistorije do Rima u prizemlju, srednjovekovna Srbija na prvom, evropsko i srpsko slikarstvo na drugom. Zgrada je bila zatvorena petnaest godina i ponovo otvorena 2018, pa je postavka nova iako je zbirka stara skoro dva veka.',
'venue.national_museum.why':'Jedina zbirka u zemlji koja te za sat i po vodi od vinčanskih figurina do Sezana.',
'venue.national_museum.insider':'Nedeljom je ulaz besplatan, pa je tada i najveća gužva — ako hoćeš srednjovekovne sale za sebe, dođi u utorak ujutru čim otvore.',
'venue.national_museum.pills':'Miroslavljevo jevanđelje|tri sprata|nedeljom besplatno',

'venue.zemun_quay.hook':'Labudovi na ovom delu Dunava su stalni stanari — komšiluk ih hrani svako jutro, cele godine.',
'venue.zemun_quay.about':'Dva kilometra ravne šetnice uz vodu: splavovi, kafići i riblji restorani sa jedne strane, otvoren Dunav sa druge. Ide od Hotela Jugoslavija do Gardoša i cela je popločana, pa je puna biciklista, roleraša i kolica.',
'venue.zemun_quay.why':'Najbolji zalazak u gradu, jer gledaš pravo na zapad preko otvorene vode, bez zgrada koje seku horizont.',
'venue.zemun_quay.insider':'Riblji restorani na keju su sasvim u redu, ali Zemunci odu dva bloka unutra, na Glavnu — ista riba, upola cene i bez turističkog cenovnika.',
'venue.zemun_quay.pills':'zalazak sunca|šetnica uz Dunav|riblji restorani',

'venue.belgrade_fortress_military_museum.hook':'Tenkovi stoje napolju na bedemu, možeš da im priđeš i staviš ruku na njih — među njima i delovi američkog nevidljivog aviona oborenog 1999.',
'venue.belgrade_fortress_military_museum.about':'Spoljna postavka je artiljerija poređana duž kalemegdanskih zidina, od turskih topova do sovjetskih haubica. Unutra je oko 3.000 eksponata kroz oružje, uniforme i zastave, od rimskih šlemova do ratova devedesetih.',
'venue.belgrade_fortress_military_museum.why':'Nigde drugde nije na jednom mestu sabrana oprema svih vojski koje su držale ovo brdo.',
'venue.belgrade_fortress_military_museum.insider':'Spoljna postavka je besplatna i uvek dostupna — ako imaš samo dvadeset minuta, prošetaj liniju topova na bedemu i preskoči unutrašnjost.',
'venue.belgrade_fortress_military_museum.pills':'tenkovi napolju|ostaci F-117|unutar tvrđave',
},
de: {
'venue.kalemegdan_fortress.hook':'Von der Terrasse am Sieger-Denkmal blickst du genau auf die Naht, an der die grüne Save in die trübe Donau drückt — zwei Wasserfarben, die sich lange nicht mischen.',
'venue.kalemegdan_fortress.about':'Die Festung liegt in Schichten übereinander: römische Fundamente, mittelalterliche serbische Wälle, österreichische Tore und osmanische Grabmäler, alles auf einem Hügel. Du läufst durch Ober- und Unterstadt, vorbei am Uhrturm und am Despotentor, am Zoo und an Basketballplätzen, auf denen immer noch die Kinder aus dem Viertel spielen.',
'venue.kalemegdan_fortress.why':'Kein anderer Ort der Stadt macht so deutlich, warum Belgrad rund vierzig Mal zerstört wurde — und jedes Mal auf demselben Felsen wieder aufgebaut.',
'venue.kalemegdan_fortress.insider':'Komm 45 Minuten vor Sonnenuntergang und geh links am Sieger vorbei, auf den Wall über dem Nebojša-Turm — alle drängen sich am Denkmal, der bessere Blick auf den Zusammenfluss liegt zwanzig Meter weiter.',
'venue.kalemegdan_fortress.pills':'Zusammenfluss|Sonnenuntergang|freier Eintritt',

'venue.skadarlija_bohemian_quarter.hook':'Das Kopfsteinpflaster wurde 1968 verlegt, damit es aussieht wie 1890 — und nach zwei Gläsern ist dir das egal.',
'venue.skadarlija_bohemian_quarter.about':'Dreihundert Meter Straße bergauf, links und rechts Kafanas aus dem 19. Jahrhundert, Tamburizza-Kapellen, die von Tisch zu Tisch ziehen, und Porträtzeichner, die in zwanzig Minuten fertig sind. Abends kommen die Tische auf die Gasse und die ganze Straße wird zu einem langen Esszimmer.',
'venue.skadarlija_bohemian_quarter.why':'Der einzige Teil Belgrads, in dem die Musik noch an deinen Tisch kommt statt aus einem Lautsprecher.',
'venue.skadarlija_bohemian_quarter.insider':'Fang unten an, von der Cetinjska, und geh bergauf — die Kafanas ganz oben sind die für Touristen, die auf halber Höhe haben noch ihre Stammgäste.',
'venue.skadarlija_bohemian_quarter.pills':'Kafanas|Live-Tamburizza|Kopfsteinpflaster',

'venue.ada_ciganlija.hook':'Eine Flussinsel, die 1967 zur Halbinsel und zum See wurde — sieben Kilometer Strand, zwanzig Minuten vom Platz der Republik.',
'venue.ada_ciganlija.about':'Kiesufer, gelbe schwimmende Bars, ein Radrundweg um den ganzen See, Volleyballfelder, Kajaks, Ruderboote und ein Bungeesprung von der Brücke. Im Juli kommen hunderttausend Menschen am Tag, im Winter ist es leer und ideal zum Laufen.',
'venue.ada_ciganlija.why':'Hier verbringt Belgrad tatsächlich seinen Sommer — komm an einem Sonntagnachmittag, wenn du die Stadt sehen willst, wie sie ist, und nicht wie sie auf Fotos aussieht.',
'venue.ada_ciganlija.insider':'Am Westende des Sees, hinter den Tennisplätzen, gibt es stille Wiesenbuchten ohne Musik — dorthin gehen die, die hier wohnen, nicht die Tagesgäste.',
'venue.ada_ciganlija.pills':'Baden im See|Radrundweg|Sommer',

'venue.saint_sava_temple.hook':'Das Kuppelmosaik besteht aus vierzig Millionen Gold- und Glassteinchen — und kam erst 2020 hinauf, nach achtzig Jahren nacktem Beton.',
'venue.saint_sava_temple.about':'Außen weißer Marmor unter einer 4.000 Tonnen schweren Kuppel, die 1989 am Boden zusammengesetzt und in einem Stück hochgezogen wurde. Innen ein einziger riesiger Raum ganz ohne Säulen, darunter eine Krypta voller Fresken in einem völlig anderen, wärmeren Ton.',
'venue.saint_sava_temple.why':'Nur wenige Bauwerke zeigen eine mittelalterliche byzantinische Form, ausgeführt mit Ingenieurskunst des zwanzigsten Jahrhunderts.',
'venue.saint_sava_temple.insider':'Die meisten gehen hinein, schauen nach oben und wieder hinaus — geh stattdessen in die Krypta: neun Marmorsorten, andere Akustik und fast niemand da.',
'venue.saint_sava_temple.pills':'Goldmosaik|die Krypta|freier Eintritt',

'venue.nikola_tesla_museum.hook':'Die Urne mit Teslas Asche steht hier — eine vergoldete Kugel in einem Raum im Obergeschoss, zwanzig Meter von der Apparatur entfernt, mit der Wechselstrom durch das Publikum geschickt wird.',
'venue.nikola_tesla_museum.about':'Das Museum bewahrt über 160.000 Originaldokumente und Teslas persönliche Dinge auf, aber der Kern ist die Vorführung: Der Guide schaltet eine Tesla-Spule ein und verteilt Leuchtstoffröhren, die in der Hand angehen, ohne jedes Kabel. Die Führung dauert etwa 45 Minuten, in Gruppen und nach Sprachen.',
'venue.nikola_tesla_museum.why':'Das weltweit einzige Tesla gewidmete Museum — und die einzige Adresse, an der sein Nachlass und seine Asche zusammenliegen.',
'venue.nikola_tesla_museum.insider':'Die Führungen starten zur vollen Stunde und sind schnell voll, vor allem nachmittags — nimm die erste am Morgen oder buche vorher, sonst wartest du auf dem Gehweg in der Krunska.',
'venue.nikola_tesla_museum.pills':'Live-Vorführung|Originalarchiv|Führung',

'venue.top_ider_park.hook':'Die Platane am Konak von Fürst Miloš wurde um 1830 gepflanzt, ihr Stamm misst heute über sechs Meter im Umfang.',
'venue.top_ider_park.about':'Der Park begann als Hofgut von Fürst Miloš — sein Konak von 1831 steht noch an derselben Stelle, mit Brunnen und Obelisk davor. Dahinter Wiesen, alte Alleen und ein Weg, der Richtung Košutnjak ansteigt, deshalb ist er voller Läufer, Grillplätze und Hundebesitzer.',
'venue.top_ider_park.why':'Belgrads ältester angelegter Park und der einzige Ort, an dem man sieht, wie eine serbische Fürstenresidenz aussah, bevor die Stadt um sie herum wuchs.',
'venue.top_ider_park.insider':'Sonntagmorgen ist er leer, am Nachmittag ein Familienausflug im Grillrauch — such dir die Zeit danach aus, weshalb du gekommen bist.',
'venue.top_ider_park.pills':'Konak von Miloš|alte Platanen|Laufen',

'venue.gardo_tower.hook':'Der Turm entstand 1896 zum tausendjährigen Bestehen Ungarns — an der damaligen Reichsgrenze, die mitten durch das heutige Belgrad verlief.',
'venue.gardo_tower.about':'Er steht auf dem Hügel über dem alten Zemun, auf den Resten einer mittelalterlichen Festung. Man steigt durch enge Gassen mit niedrigen Häusern hinauf, und von oben liegen die Donau, die Große Kriegsinsel und die ganze Silhouette Belgrads jenseits des Wassers.',
'venue.gardo_tower.why':'Der beste Blick auf Belgrad, der nicht aus Belgrad kommt — man sieht die Stadt von außen, so wie sie jahrhundertelang von jenseits einer Grenze betrachtet wurde.',
'venue.gardo_tower.insider':'Unterhalb des Turms zur Flussseite liegen der alte Zemuner Friedhof und ein paar Bänke, auf denen fast nie jemand sitzt — derselbe Blick, ohne Ticket und ohne Gedränge auf der Treppe.',
'venue.gardo_tower.pills':'Panorama|Altes Zemun|Donau',

'venue.national_museum.hook':'Hier wird das Miroslav-Evangeliar von 1180 aufbewahrt — das älteste erhaltene serbische Buch, zwei Stockwerke unter einem Van Gogh.',
'venue.national_museum.about':'Drei Etagen: Archäologie von der Vorgeschichte bis Rom im Erdgeschoss, mittelalterliches Serbien im ersten, europäische und serbische Malerei im zweiten Stock. Das Haus war fünfzehn Jahre geschlossen und wurde 2018 wieder eröffnet, die Präsentation ist also neu, auch wenn die Sammlung fast zwei Jahrhunderte alt ist.',
'venue.national_museum.why':'Die einzige Sammlung des Landes, die dich in neunzig Minuten von Vinča-Figurinen zu Cézanne bringt.',
'venue.national_museum.insider':'Sonntags ist der Eintritt frei und genau dann am vollsten — wenn du die mittelalterlichen Säle für dich willst, komm Dienstagmorgen zur Öffnung.',
'venue.national_museum.pills':'Miroslav-Evangeliar|drei Etagen|sonntags frei',

'venue.zemun_quay.hook':'Die Schwäne auf diesem Donauabschnitt sind Dauergäste — die Nachbarschaft füttert sie jeden Morgen, das ganze Jahr.',
'venue.zemun_quay.about':'Zwei Kilometer flache Uferpromenade: schwimmende Bars, Cafés und Fischrestaurants auf der einen Seite, offene Donau auf der anderen. Sie führt vom Hotel Jugoslavija bis Gardoš und ist durchgehend gepflastert, deshalb voller Radfahrer, Skater und Kinderwagen.',
'venue.zemun_quay.why':'Der beste Sonnenuntergang der Stadt, weil man genau nach Westen über offenes Wasser schaut, ohne Häuser im Horizont.',
'venue.zemun_quay.insider':'Die Fischrestaurants am Kai sind in Ordnung, aber die Zemuner gehen zwei Blocks landeinwärts in die Glavna — derselbe Fisch, halber Preis, keine Touristenkarte.',
'venue.zemun_quay.pills':'Sonnenuntergang|Donaupromenade|Fischrestaurants',

'venue.belgrade_fortress_military_museum.hook':'Die Panzer stehen draußen auf dem Wall, man kann hingehen und die Hand darauflegen — darunter Wrackteile des amerikanischen Tarnkappenjets, der 1999 abgeschossen wurde.',
'venue.belgrade_fortress_military_museum.about':'Die Außenausstellung ist Artillerie entlang der Kalemegdan-Mauern, von osmanischen Kanonen bis zu sowjetischen Haubitzen. Drinnen rund 3.000 Exponate aus Waffen, Uniformen und Fahnen, von römischen Helmen bis zu den Kriegen der Neunziger.',
'venue.belgrade_fortress_military_museum.why':'Nirgendwo sonst liegt die Ausrüstung all der Armeen, die diesen Hügel gehalten haben, an einem Ort beisammen.',
'venue.belgrade_fortress_military_museum.insider':'Die Außenausstellung ist kostenlos und immer zugänglich — wenn du nur zwanzig Minuten hast, geh die Geschützlinie auf dem Wall ab und lass das Innere aus.',
'venue.belgrade_fortress_military_museum.pills':'Panzer im Freien|F-117-Wrackteile|in der Festung',
},
fr: {
'venue.kalemegdan_fortress.hook':'Depuis la terrasse du Vainqueur, tu regardes droit sur la ligne où la Save verte entre dans le Danube trouble — deux couleurs d\'eau qui mettent longtemps à se mélanger.',
'venue.kalemegdan_fortress.about':'La forteresse est un empilement : fondations romaines, remparts serbes médiévaux, portes autrichiennes et türbe ottomanes, le tout sur une seule colline. On traverse la Ville haute et la Ville basse, la tour de l\'Horloge et la porte du Despote, le zoo et des terrains de basket où jouent encore les gamins du quartier.',
'venue.kalemegdan_fortress.why':'Aucun autre endroit de la ville ne montre aussi clairement pourquoi Belgrade a été détruite une quarantaine de fois — et reconstruite à chaque fois sur le même rocher.',
'venue.kalemegdan_fortress.insider':'Viens 45 minutes avant le coucher du soleil et prends à gauche du Vainqueur, sur le rempart au-dessus de la tour Nebojša — tout le monde s\'agglutine devant la statue, le meilleur angle sur le confluent est vingt mètres plus loin.',
'venue.kalemegdan_fortress.pills':'confluent|coucher de soleil|entrée libre',

'venue.skadarlija_bohemian_quarter.hook':'Les pavés ont été posés en 1968 pour ressembler à 1890 — et au bout de deux verres, ça ne te fait plus rien.',
'venue.skadarlija_bohemian_quarter.about':'Trois cents mètres de rue en montée, bordée de kafanas du XIXe siècle, avec des orchestres de tamburica qui passent de table en table et des portraitistes qui finissent en vingt minutes. Le soir, les tables sortent dans la rue et toute la ruelle devient une seule longue salle à manger.',
'venue.skadarlija_bohemian_quarter.why':'C\'est le seul endroit de Belgrade où la musique arrive encore jusqu\'à ta table au lieu de sortir d\'une enceinte.',
'venue.skadarlija_bohemian_quarter.insider':'Commence par le bas, depuis Cetinjska, et monte — les kafanas d\'en haut sont celles des touristes, celles du milieu gardent encore leurs habitués.',
'venue.skadarlija_bohemian_quarter.pills':'kafanas|tamburica live|pavés',

'venue.ada_ciganlija.hook':'Une île fluviale devenue presqu\'île et lac en 1967 — sept kilomètres de plage, à vingt minutes de la place de la République.',
'venue.ada_ciganlija.about':'Rive de galets, bars flottants jaunes, boucle cyclable autour du lac, terrains de volley, kayak, aviron et saut à l\'élastique depuis le pont. En juillet il passe cent mille personnes par jour ; en hiver c\'est vide et parfait pour courir.',
'venue.ada_ciganlija.why':'C\'est ici que Belgrade passe réellement son été — viens un dimanche après-midi si tu veux la ville telle qu\'elle est, pas telle qu\'elle se photographie.',
'venue.ada_ciganlija.insider':'À l\'extrémité ouest du lac, derrière les courts de tennis, il y a des criques d\'herbe tranquilles sans musique — c\'est là que vont ceux qui habitent ici, pas ceux venus pour la journée.',
'venue.ada_ciganlija.pills':'baignade|boucle cyclable|été',

'venue.saint_sava_temple.hook':'La mosaïque de la coupole compte quarante millions d\'éclats d\'or et de verre — et elle n\'a été posée qu\'en 2020, après quatre-vingts ans de béton nu.',
'venue.saint_sava_temple.about':'Dehors, du marbre blanc sous une coupole de 4 000 tonnes assemblée au sol en 1989 puis hissée d\'un seul bloc. Dedans, une seule salle immense sans une colonne, et en dessous une crypte couverte de fresques dans un registre tout autre, plus chaud.',
'venue.saint_sava_temple.why':'Peu d\'édifices au monde donnent à voir une forme byzantine médiévale exécutée avec l\'ingénierie du XXe siècle.',
'venue.saint_sava_temple.insider':'La plupart entrent, lèvent les yeux et ressortent — descends plutôt dans la crypte : neuf marbres différents, une autre acoustique, et presque personne.',
'venue.saint_sava_temple.pills':'mosaïque d\'or|la crypte|entrée libre',

'venue.nikola_tesla_museum.hook':'L\'urne contenant les cendres de Tesla est ici — une sphère dorée dans une pièce à l\'étage, à vingt mètres du dispositif qui fait passer du courant alternatif devant le public.',
'venue.nikola_tesla_museum.about':'Le musée conserve plus de 160 000 documents originaux et les effets personnels de Tesla, mais l\'essentiel est la démonstration : le guide met en route une bobine Tesla et distribue des tubes fluorescents qui s\'allument dans la main, sans aucun fil. La visite dure environ 45 minutes, en groupes, par langue.',
'venue.nikola_tesla_museum.why':'C\'est le seul musée au monde consacré à Tesla — et la seule adresse à réunir ses archives et ses cendres.',
'venue.nikola_tesla_museum.insider':'Les visites partent à l\'heure pile et se remplissent vite, surtout l\'après-midi — prends la première du matin ou réserve, sinon tu attends sur le trottoir de Krunska.',
'venue.nikola_tesla_museum.pills':'démonstration live|archives originales|visite guidée',

'venue.top_ider_park.hook':'Le platane près de la résidence de Miloš a été planté vers 1830 ; son tronc fait aujourd\'hui plus de six mètres de circonférence.',
'venue.top_ider_park.about':'Le parc est né comme domaine de cour du prince Miloš — sa résidence de 1831 est toujours là, fontaine et obélisque devant. Derrière, des prairies, de vieilles allées d\'arbres et un chemin qui monte vers Košutnjak, d\'où les coureurs, les barbecues et les promeneurs de chiens.',
'venue.top_ider_park.why':'C\'est le plus ancien parc aménagé de Belgrade et le seul endroit où voir à quoi ressemblait une résidence princière serbe avant que la ville ne pousse autour.',
'venue.top_ider_park.insider':'Le dimanche matin il est vide ; l\'après-midi c\'est un pique-nique de famille dans la fumée des grills — choisis ton créneau selon ce que tu es venu chercher.',
'venue.top_ider_park.pills':'résidence de Miloš|vieux platanes|course à pied',

'venue.gardo_tower.hook':'La tour a été élevée en 1896 pour le millénaire de la Hongrie — sur la frontière de l\'empire d\'alors, qui passait exactement par l\'actuelle Belgrade.',
'venue.gardo_tower.about':'Elle est sur la colline au-dessus du vieux Zemun, sur les restes d\'une forteresse médiévale. On y monte par des ruelles étroites bordées de maisons basses, et d\'en haut on a le Danube, la Grande île de guerre et toute la silhouette de Belgrade de l\'autre côté de l\'eau.',
'venue.gardo_tower.why':'C\'est la meilleure vue sur Belgrade qui ne soit pas prise depuis Belgrade — on voit la ville de l\'extérieur, comme on l\'a regardée pendant des siècles depuis l\'autre côté d\'une frontière.',
'venue.gardo_tower.insider':'Sous la tour, côté fleuve, il y a le vieux cimetière de Zemun et quelques bancs où il n\'y a presque jamais personne — même vue, sans billet et sans queue dans l\'escalier.',
'venue.gardo_tower.pills':'panorama|vieux Zemun|Danube',

'venue.national_museum.hook':'C\'est ici qu\'est conservé l\'Évangéliaire de Miroslav de 1180 — le plus ancien livre serbe conservé, deux étages sous un Van Gogh.',
'venue.national_museum.about':'Trois niveaux : archéologie de la préhistoire à Rome au rez-de-chaussée, Serbie médiévale au premier, peinture européenne et serbe au deuxième. Le bâtiment est resté fermé quinze ans et a rouvert en 2018 : l\'accrochage est neuf même si la collection a près de deux siècles.',
'venue.national_museum.why':'La seule collection du pays qui te mène des figurines de Vinča à Cézanne en quatre-vingt-dix minutes.',
'venue.national_museum.insider':'L\'entrée est gratuite le dimanche, et c\'est aussi le jour le plus chargé — si tu veux les salles médiévales pour toi, viens le mardi matin à l\'ouverture.',
'venue.national_museum.pills':'Évangéliaire de Miroslav|trois niveaux|gratuit le dimanche',

'venue.zemun_quay.hook':'Les cygnes de ce bout de Danube sont des résidents permanents — le quartier les nourrit tous les matins, toute l\'année.',
'venue.zemun_quay.about':'Deux kilomètres de promenade plate au bord de l\'eau : bars flottants, cafés et restaurants de poisson d\'un côté, Danube ouvert de l\'autre. Elle va de l\'hôtel Jugoslavija à Gardoš, pavée sur toute sa longueur, d\'où les vélos, les rollers et les poussettes.',
'venue.zemun_quay.why':'Le meilleur coucher de soleil de la ville, parce qu\'on regarde plein ouest par-dessus l\'eau libre, sans immeuble pour couper l\'horizon.',
'venue.zemun_quay.insider':'Les restaurants de poisson du quai sont corrects, mais les gens de Zemun marchent deux rues à l\'intérieur, dans la Glavna — même poisson, moitié prix, pas de carte pour touristes.',
'venue.zemun_quay.pills':'coucher de soleil|promenade du Danube|restaurants de poisson',

'venue.belgrade_fortress_military_museum.hook':'Les chars sont dehors sur les remparts, on peut s\'en approcher et poser la main dessus — dont des débris de l\'avion furtif américain abattu en 1999.',
'venue.belgrade_fortress_military_museum.about':'L\'exposition extérieure, c\'est de l\'artillerie alignée le long des murs de Kalemegdan, du canon ottoman à l\'obusier soviétique. À l\'intérieur, quelque 3 000 pièces entre armes, uniformes et drapeaux, des casques romains aux guerres des années 1990.',
'venue.belgrade_fortress_military_museum.why':'Nulle part ailleurs l\'équipement de toutes les armées qui ont tenu cette colline n\'est réuni au même endroit.',
'venue.belgrade_fortress_military_museum.insider':'L\'artillerie extérieure est gratuite et toujours accessible — si tu n\'as que vingt minutes, longe la ligne de canons sur le rempart et saute l\'intérieur.',
'venue.belgrade_fortress_military_museum.pills':'chars en plein air|débris du F-117|dans la forteresse',
},
it: {
'venue.kalemegdan_fortress.hook':'Dalla terrazza del Vincitore guardi esattamente la cucitura dove la Sava verde entra nel Danubio torbido — due colori d\'acqua che ci mettono un po\' a mescolarsi.',
'venue.kalemegdan_fortress.about':'La fortezza è stratificata: fondamenta romane, mura serbe medievali, porte austriache e türbe ottomane, tutto ammassato su una collina. Si attraversano Città Alta e Città Bassa, la Torre dell\'Orologio e la Porta del Despota, lo zoo e campi da basket dove giocano ancora i ragazzini del quartiere.',
'venue.kalemegdan_fortress.why':'Nessun altro punto della città rende così evidente perché Belgrado sia stata distrutta una quarantina di volte — e ricostruita ogni volta sulla stessa roccia.',
'venue.kalemegdan_fortress.insider':'Arriva 45 minuti prima del tramonto e vai a sinistra del Vincitore, sul bastione sopra la Torre Nebojša — tutti si accalcano davanti alla statua, l\'angolo migliore sulla confluenza è venti metri più in là.',
'venue.kalemegdan_fortress.pills':'confluenza|tramonto|ingresso libero',

'venue.skadarlija_bohemian_quarter.hook':'Il selciato è stato posato nel 1968 per sembrare del 1890 — e dopo due bicchieri smetti di farci caso.',
'venue.skadarlija_bohemian_quarter.about':'Trecento metri di strada in salita, ai lati kafane dell\'Ottocento, orchestrine di tamburica che passano di tavolo in tavolo e ritrattisti che chiudono in venti minuti. La sera i tavoli escono in strada e tutto il vicolo diventa un\'unica lunga sala da pranzo.',
'venue.skadarlija_bohemian_quarter.why':'È l\'unica parte di Belgrado in cui la musica arriva ancora al tuo tavolo invece che da una cassa.',
'venue.skadarlija_bohemian_quarter.insider':'Parti dal basso, da Cetinjska, e sali — le kafane in cima sono quelle per turisti, quelle a metà salita tengono ancora i loro clienti di sempre.',
'venue.skadarlija_bohemian_quarter.pills':'kafane|tamburica dal vivo|selciato',

'venue.ada_ciganlija.hook':'Un\'isola fluviale trasformata in penisola e lago nel 1967 — sette chilometri di spiaggia a venti minuti da piazza della Repubblica.',
'venue.ada_ciganlija.about':'Riva di ghiaia, bar galleggianti gialli, un anello ciclabile intorno al lago, campi da beach volley, kayak, canottaggio e un bungee jumping dal ponte. A luglio passano centomila persone al giorno; d\'inverno è vuota e perfetta per correre.',
'venue.ada_ciganlija.why':'È qui che Belgrado passa davvero l\'estate — vieni una domenica pomeriggio se vuoi la città com\'è, non come viene in fotografia.',
'venue.ada_ciganlija.insider':'All\'estremità ovest del lago, dietro i campi da tennis, ci sono insenature d\'erba silenziose senza musica — è lì che va chi vive in città, non chi è venuto per la giornata.',
'venue.ada_ciganlija.pills':'bagno nel lago|anello ciclabile|estate',

'venue.saint_sava_temple.hook':'Il mosaico della cupola è fatto di quaranta milioni di tessere d\'oro e vetro — ed è salito solo nel 2020, dopo ottant\'anni di cemento nudo.',
'venue.saint_sava_temple.about':'Fuori marmo bianco sotto una cupola da 4.000 tonnellate, montata a terra nel 1989 e sollevata in un pezzo solo. Dentro un unico ambiente enorme senza colonne, e sotto una cripta coperta di affreschi in un registro tutto diverso, più caldo.',
'venue.saint_sava_temple.why':'Pochi edifici al mondo mostrano una forma bizantina medievale realizzata con l\'ingegneria del Novecento.',
'venue.saint_sava_temple.insider':'Quasi tutti entrano, guardano in alto ed escono — scendi invece nella cripta: nove marmi diversi, un\'altra acustica e quasi nessuno.',
'venue.saint_sava_temple.pills':'mosaico d\'oro|la cripta|ingresso libero',

'venue.nikola_tesla_museum.hook':'L\'urna con le ceneri di Tesla è qui — una sfera dorata in una stanza al piano di sopra, a venti metri dall\'apparato con cui fanno passare corrente alternata davanti al pubblico.',
'venue.nikola_tesla_museum.about':'Il museo conserva oltre 160.000 documenti originali e gli effetti personali di Tesla, ma il cuore è la dimostrazione: la guida accende una bobina di Tesla e distribuisce tubi fluorescenti che si accendono in mano, senza alcun filo. La visita dura circa 45 minuti, in gruppi, per lingua.',
'venue.nikola_tesla_museum.why':'È l\'unico museo al mondo dedicato a Tesla — e l\'unico indirizzo che tiene insieme il suo archivio e le sue ceneri.',
'venue.nikola_tesla_museum.insider':'I gruppi partono a ogni ora piena e si riempiono, soprattutto nel pomeriggio — prendi il primo della mattina o prenota, altrimenti aspetti sul marciapiede di Krunska.',
'venue.nikola_tesla_museum.pills':'dimostrazione dal vivo|archivio originale|visita guidata',

'venue.top_ider_park.hook':'Il platano accanto alla residenza di Miloš è stato piantato intorno al 1830 e oggi il tronco supera i sei metri di circonferenza.',
'venue.top_ider_park.about':'Il parco nasce come tenuta di corte del principe Miloš — la sua residenza del 1831 è ancora dov\'era, con fontana e obelisco davanti. Dietro ci sono prati, vecchi viali alberati e un sentiero che sale verso Košutnjak, per questo è pieno di corridori, grigliate e gente con i cani.',
'venue.top_ider_park.why':'È il più antico parco progettato di Belgrado e l\'unico posto dove vedere com\'era una residenza principesca serba prima che la città le crescesse intorno.',
'venue.top_ider_park.insider':'La domenica mattina è vuoto, il pomeriggio diventa una gita di famiglia nel fumo delle griglie — scegli l\'orario in base a cosa sei venuto a fare.',
'venue.top_ider_park.pills':'residenza di Miloš|platani secolari|corsa',

'venue.gardo_tower.hook':'La torre è del 1896, costruita per il millennio dell\'Ungheria — sul confine dell\'impero di allora, che passava esattamente per l\'odierna Belgrado.',
'venue.gardo_tower.about':'Sta sulla collina sopra la vecchia Zemun, sui resti di una fortezza medievale. Ci si sale per stradine strette di case basse, e dall\'alto arrivano il Danubio, la Grande Isola della Guerra e tutto il profilo di Belgrado oltre l\'acqua.',
'venue.gardo_tower.why':'È la vista migliore su Belgrado che non venga da dentro Belgrado — vedi la città da fuori, come è stata guardata per secoli dall\'altra parte di un confine.',
'venue.gardo_tower.insider':'Sotto la torre, sul lato del fiume, ci sono il vecchio cimitero di Zemun e qualche panchina dove non c\'è quasi mai nessuno — stessa vista, senza biglietto e senza coda sulle scale.',
'venue.gardo_tower.pills':'panorama|vecchia Zemun|Danubio',

'venue.national_museum.hook':'Qui è custodito il Vangelo di Miroslav del 1180 — il più antico libro serbo conservato, due piani sotto un Van Gogh.',
'venue.national_museum.about':'Tre piani: archeologia dalla preistoria a Roma al piano terra, Serbia medievale al primo, pittura europea e serba al secondo. L\'edificio è rimasto chiuso quindici anni e ha riaperto nel 2018, quindi l\'allestimento è nuovo anche se la collezione ha quasi due secoli.',
'venue.national_museum.why':'È l\'unica raccolta del paese che in novanta minuti ti porta dalle figurine di Vinča a Cézanne.',
'venue.national_museum.insider':'La domenica l\'ingresso è gratuito, ed è anche il giorno più affollato — se vuoi le sale medievali per te, vieni martedì mattina all\'apertura.',
'venue.national_museum.pills':'Vangelo di Miroslav|tre piani|domenica gratis',

'venue.zemun_quay.hook':'I cigni di questo tratto di Danubio sono residenti fissi — il quartiere li nutre ogni mattina, tutto l\'anno.',
'venue.zemun_quay.about':'Due chilometri di lungofiume in piano: bar galleggianti, caffè e ristoranti di pesce da un lato, Danubio aperto dall\'altro. Va dall\'Hotel Jugoslavija a Gardoš ed è lastricato per intero, quindi è pieno di bici, pattini e passeggini.',
'venue.zemun_quay.why':'È il tramonto migliore della città perché guardi dritto a ovest sull\'acqua aperta, senza palazzi a tagliare l\'orizzonte.',
'venue.zemun_quay.insider':'I ristoranti di pesce sul lungofiume vanno bene, ma quelli di Zemun camminano due isolati verso l\'interno, in Glavna — stesso pesce, metà prezzo, nessun menù per turisti.',
'venue.zemun_quay.pills':'tramonto|lungofiume|ristoranti di pesce',

'venue.belgrade_fortress_military_museum.hook':'I carri armati stanno fuori sui bastioni, ci si può avvicinare e appoggiarci la mano — tra cui i rottami del caccia stealth americano abbattuto nel 1999.',
'venue.belgrade_fortress_military_museum.about':'L\'esposizione all\'aperto è artiglieria allineata lungo le mura di Kalemegdan, dai cannoni ottomani agli obici sovietici. Dentro ci sono circa 3.000 pezzi tra armi, uniformi e bandiere, dagli elmi romani alle guerre degli anni Novanta.',
'venue.belgrade_fortress_military_museum.why':'Da nessun\'altra parte l\'equipaggiamento di tutti gli eserciti che hanno tenuto questa collina sta in un unico posto.',
'venue.belgrade_fortress_military_museum.insider':'L\'artiglieria esterna è gratuita e sempre accessibile — se hai solo venti minuti, percorri la linea dei cannoni sul bastione e salta l\'interno.',
'venue.belgrade_fortress_military_museum.pills':'carri all\'aperto|rottami dell\'F-117|dentro la fortezza',
},
tr: {
'venue.kalemegdan_fortress.hook':'Zafer Anıtı\'nın olduğu terastan, yeşil Sava\'nın bulanık Tuna\'ya girdiği dikişe tam tepeden bakıyorsun — uzun süre karışmayan iki su rengi.',
'venue.kalemegdan_fortress.about':'Kale katman katman: Roma temelleri, orta çağ Sırp surları, Avusturya kapıları ve Osmanlı türbeleri, hepsi tek bir tepede üst üste. Yukarı ve Aşağı Şehir\'i, Saat Kulesi\'ni ve Despot Kapısı\'nı, hayvanat bahçesini ve mahallenin çocuklarının hâlâ oynadığı basketbol sahalarını geçiyorsun.',
'venue.kalemegdan_fortress.why':'Belgrad\'ın neden kırk kez yıkıldığını — ve her seferinde aynı kayanın üstüne yeniden kurulduğunu — şehirde başka hiçbir yer bu kadar açık göstermiyor.',
'venue.kalemegdan_fortress.insider':'Gün batımından 45 dakika önce gel ve Zafer Anıtı\'nın solundan, Nebojša Kulesi\'nin üstündeki sura geç — herkes heykelin dibinde toplanıyor, kavuşuma bakan iyi açı yirmi metre ileride.',
'venue.kalemegdan_fortress.pills':'nehirlerin kavuşumu|gün batımı|ücretsiz giriş',

'venue.skadarlija_bohemian_quarter.hook':'Arnavut kaldırımı 1890 gibi görünsün diye 1968\'de döşendi — ve iki kadeh sonra bunu dert etmiyorsun.',
'venue.skadarlija_bohemian_quarter.about':'Üç yüz metrelik yokuş bir sokak, iki yanında 19. yüzyıldan kalma kafanalar, masadan masaya dolaşan tamburitsa takımları ve yirmi dakikada portreni bitiren ressamlar. Akşam masalar sokağa çıkıyor ve bütün sokak tek bir uzun yemek odasına dönüşüyor.',
'venue.skadarlija_bohemian_quarter.why':'Belgrad\'da müziğin hâlâ hoparlörden değil, doğrudan masana geldiği tek yer.',
'venue.skadarlija_bohemian_quarter.insider':'Aşağıdan, Cetinjska\'dan başla ve yokuş yukarı çık — en tepedekiler turist kafanaları, yokuşun ortasındakiler hâlâ eski müdavimlerini tutuyor.',
'venue.skadarlija_bohemian_quarter.pills':'kafanalar|canlı tamburitsa|arnavut kaldırımı',

'venue.ada_ciganlija.hook':'1967\'de yarımadaya ve göle çevrilmiş bir nehir adası — Cumhuriyet Meydanı\'na yirmi dakika, yedi kilometre plaj.',
'venue.ada_ciganlija.about':'Çakıl kıyı, sarı yüzen barlar, gölün etrafını dolaşan bisiklet parkuru, voleybol sahaları, kano, kürek ve köprüden bungee jumping. Temmuzda günde yüz bin kişi geliyor; kışın bomboş ve koşmak için ideal.',
'venue.ada_ciganlija.why':'Belgrad yazı gerçekten burada geçiriyor — şehri fotoğraftaki hâliyle değil, olduğu gibi görmek istiyorsan pazar öğleden sonra gel.',
'venue.ada_ciganlija.insider':'Gölün batı ucunda, tenis kortlarının arkasında müziksiz, sessiz çimen koyları var — burada yaşayanlar oraya gidiyor, günübirlik gelenler değil.',
'venue.ada_ciganlija.pills':'gölde yüzmek|bisiklet parkuru|yaz',

'venue.saint_sava_temple.hook':'Kubbedeki mozaik kırk milyon altın ve cam parçasından oluşuyor — ve seksen yıllık çıplak betondan sonra ancak 2020\'de yerine kondu.',
'venue.saint_sava_temple.about':'Dışarıda beyaz mermer, üstünde 1989\'da yerde monte edilip tek parça hâlinde kaldırılan 4.000 tonluk bir kubbe. İçeride tek bir sütunu olmayan devasa bir mekân, altında ise bambaşka, daha sıcak bir tonda fresklerle kaplı bir kripta.',
'venue.saint_sava_temple.why':'Dünyada çok az yapı, orta çağ Bizans formunu yirminci yüzyıl mühendisliğiyle kurulmuş hâlde gösterir.',
'venue.saint_sava_temple.insider':'Çoğu kişi girip yukarı bakıp çıkıyor — onun yerine kriptaya in: dokuz çeşit mermer, bambaşka bir akustik ve neredeyse kimse yok.',
'venue.saint_sava_temple.pills':'altın mozaik|kripta|ücretsiz giriş',

'venue.nikola_tesla_museum.hook':'Tesla\'nın küllerini taşıyan kavanoz burada — üst kattaki bir odada duran altın kaplama bir küre; kalabalığın önünden alternatif akım geçirdikleri düzeneğe yirmi metre.',
'venue.nikola_tesla_museum.about':'Müzede 160.000\'den fazla orijinal belge ve Tesla\'nın kişisel eşyaları var, ama işin kalbi gösteri: rehber Tesla bobinini çalıştırıyor ve elinde kablosuz yanan floresan tüpler dağıtıyor. Tur yaklaşık 45 dakika sürüyor, gruplar hâlinde ve dile göre.',
'venue.nikola_tesla_museum.why':'Dünyada Tesla\'ya adanmış tek müze — ve hem arşivinin hem küllerinin bulunduğu tek adres.',
'venue.nikola_tesla_museum.insider':'Turlar saat başı kalkıyor ve özellikle öğleden sonra doluyor — sabahın ilk turuna gir ya da önceden yer ayırt, yoksa Krunska\'da kaldırımda beklersin.',
'venue.nikola_tesla_museum.pills':'canlı gösteri|orijinal arşiv|rehberli tur',

'venue.top_ider_park.hook':'Miloš\'un konağının yanındaki çınar 1830 civarında dikildi; gövdesinin çevresi bugün altı metreyi geçiyor.',
'venue.top_ider_park.about':'Park, Prens Miloš\'un saray arazisi olarak başladı — 1831 tarihli konağı hâlâ aynı yerde duruyor, önünde çeşme ve dikilitaşla. Arkasında çayırlar, eski ağaçlı yollar ve Košutnjak\'a tırmanan bir patika var; bu yüzden koşucu, mangal ve köpek gezdirenlerle dolu.',
'venue.top_ider_park.why':'Belgrad\'ın en eski düzenlenmiş parkı ve bir Sırp prens konağının, şehir etrafında büyümeden önce nasıl göründüğünü görebileceğin tek yer.',
'venue.top_ider_park.insider':'Pazar sabahı bomboş, öğleden sonra mangal dumanı içinde aile pikniğine dönüşüyor — ne için geldiğine göre saatini seç.',
'venue.top_ider_park.pills':'Miloš\'un konağı|asırlık çınarlar|koşu',

'venue.gardo_tower.hook':'Kule 1896\'da Macaristan\'ın bininci yılı için dikildi — o zamanki imparatorluk sınırında, ki bu sınır tam bugünkü Belgrad\'ın içinden geçiyordu.',
'venue.gardo_tower.about':'Eski Zemun\'un üstündeki tepede, orta çağ kalesinin kalıntıları üzerinde duruyor. Alçak evlerin olduğu dar sokaklardan tırmanıyorsun ve tepeden Tuna, Büyük Savaş Adası ve suyun karşısındaki bütün Belgrad silueti açılıyor.',
'venue.gardo_tower.why':'Belgrad\'ın içinden çekilmemiş en iyi Belgrad manzarası — şehri dışarıdan, yüzyıllarca sınırın öbür yanından bakıldığı gibi görüyorsun.',
'venue.gardo_tower.insider':'Kulenin altında, nehir tarafında eski Zemun mezarlığı ve neredeyse hiç kimsenin oturmadığı birkaç bank var — aynı manzara, biletsiz ve merdivende sırasız.',
'venue.gardo_tower.pills':'panorama|eski Zemun|Tuna',

'venue.national_museum.hook':'1180 tarihli Miroslav İncili burada saklanıyor — günümüze ulaşmış en eski Sırp kitabı, bir Van Gogh\'un iki kat altında.',
'venue.national_museum.about':'Üç kat: zeminde tarih öncesinden Roma\'ya arkeoloji, birinci katta orta çağ Sırbistanı, ikincide Avrupa ve Sırp resmi. Bina on beş yıl kapalı kaldı ve 2018\'de yeniden açıldı, yani koleksiyon iki yüzyıla yakın olsa da sergileme yepyeni.',
'venue.national_museum.why':'Ülkede seni doksan dakikada Vinča figürinlerinden Cézanne\'a götüren tek koleksiyon.',
'venue.national_museum.insider':'Pazar günleri giriş ücretsiz ve en kalabalık gün de o — orta çağ salonlarını kendine istiyorsan salı sabahı açılışta gel.',
'venue.national_museum.pills':'Miroslav İncili|üç kat|pazar ücretsiz',

'venue.zemun_quay.hook':'Tuna\'nın bu bölümündeki kuğular kalıcı sakinler — mahalle onları yıl boyu her sabah besliyor.',
'venue.zemun_quay.about':'İki kilometrelik düz kıyı yürüyüşü: bir yanda yüzen barlar, kafeler ve balık restoranları, öbür yanda açık Tuna. Hotel Jugoslavija\'dan Gardoš\'a kadar gidiyor ve baştan sona taş döşeli, bu yüzden bisikletli, patenli ve bebek arabalı dolu.',
'venue.zemun_quay.why':'Şehrin en iyi gün batımı, çünkü ufku kesen bina olmadan, açık suyun üstünden tam batıya bakıyorsun.',
'venue.zemun_quay.insider':'Kıyıdaki balık restoranları fena değil, ama Zemunlular iki blok içeri, Glavna\'ya yürüyor — aynı balık, yarı fiyat, turist menüsü yok.',
'venue.zemun_quay.pills':'gün batımı|Tuna kıyısı|balık restoranları',

'venue.belgrade_fortress_military_museum.hook':'Tanklar dışarıda, surların üstünde duruyor; yanına gidip elini üstüne koyabiliyorsun — aralarında 1999\'da düşürülen Amerikan hayalet uçağının parçaları da var.',
'venue.belgrade_fortress_military_museum.about':'Açık hava sergisi, Kalemegdan surları boyunca dizilmiş topçu: Osmanlı toplarından Sovyet obüslerine. İçeride silah, üniforma ve bayraklar arasında yaklaşık 3.000 parça var; Roma miğferlerinden doksanların savaşlarına.',
'venue.belgrade_fortress_military_museum.why':'Bu tepeyi tutmuş bütün orduların teçhizatı başka hiçbir yerde tek bir yerde bir arada değil.',
'venue.belgrade_fortress_military_museum.insider':'Açık hava topçu sergisi ücretsiz ve her zaman açık — sadece yirmi dakikan varsa surdaki top hattını yürü, içeriyi atla.',
'venue.belgrade_fortress_military_museum.pills':'açık havada tanklar|F-117 parçaları|kalenin içinde',
},
ru: {
'venue.kalemegdan_fortress.hook':'С террасы у Победника смотришь ровно на шов, где зелёная Сава входит в мутный Дунай — два цвета воды, которые долго не смешиваются.',
'venue.kalemegdan_fortress.about':'Крепость лежит слоями: римские основания, средневековые сербские валы, австрийские ворота и османские тюрбе — всё на одном холме. Ты проходишь Верхний и Нижний город, Часовую башню и Деспотовы ворота, зоопарк и баскетбольные площадки, где до сих пор играют местные дети.',
'venue.kalemegdan_fortress.why':'Нигде в городе так наглядно не видно, почему Белград разрушали около сорока раз — и каждый раз отстраивали на той же скале.',
'venue.kalemegdan_fortress.insider':'Приходи за 45 минут до заката и сверни влево от Победника, на вал над башней Небойша — все толпятся у памятника, а лучший ракурс на слияние в двадцати метрах дальше.',
'venue.kalemegdan_fortress.pills':'слияние рек|закат|бесплатный вход',

'venue.skadarlija_bohemian_quarter.hook':'Булыжник уложили в 1968 году, чтобы выглядело как 1890-й — и после двух бокалов это перестаёт иметь значение.',
'venue.skadarlija_bohemian_quarter.about':'Триста метров улицы в гору, по обе стороны кафаны XIX века, оркестры тамбурицы, переходящие от стола к столу, и портретисты, которые управляются за двадцать минут. Вечером столы выносят на улицу, и весь переулок превращается в одну длинную столовую.',
'venue.skadarlija_bohemian_quarter.why':'Единственная часть Белграда, где музыка по-прежнему приходит к твоему столу, а не из колонки.',
'venue.skadarlija_bohemian_quarter.insider':'Начинай снизу, от Цетиньской, и поднимайся — кафаны наверху туристические, а те, что на середине подъёма, ещё держат своих старых завсегдатаев.',
'venue.skadarlija_bohemian_quarter.pills':'кафаны|живая тамбурица|булыжник',

'venue.ada_ciganlija.hook':'Речной остров, который в 1967 году превратили в полуостров и озеро — семь километров пляжа в двадцати минутах от площади Республики.',
'venue.ada_ciganlija.about':'Галечный берег, жёлтые плавучие бары, велодорожка вокруг всего озера, волейбольные площадки, каяки, гребля и банджи-джампинг с моста. В июле здесь проходит до ста тысяч человек в день, зимой пусто и отлично для бега.',
'venue.ada_ciganlija.why':'Именно здесь Белград на самом деле проводит лето — приходи в воскресенье днём, если хочешь город такой, какой он есть, а не какой он на открытке.',
'venue.ada_ciganlija.insider':'Западный конец озера, за теннисными кортами, — тихие травяные заводи без музыки: туда идут те, кто здесь живёт, а не приехавшие на день.',
'venue.ada_ciganlija.pills':'купание|велодорожка|лето',

'venue.saint_sava_temple.hook':'Мозаика купола — сорок миллионов кусочков золота и стекла, и появилась она только в 2020 году, после восьмидесяти лет голого бетона.',
'venue.saint_sava_temple.about':'Снаружи белый мрамор под куполом в 4 000 тонн, который в 1989 году собрали на земле и подняли целиком. Внутри — один огромный зал без единой колонны, а под ним крипта, покрытая фресками в совсем другом, более тёплом регистре.',
'venue.saint_sava_temple.why':'Мало где в мире можно увидеть средневековую византийскую форму, построенную инженерией двадцатого века.',
'venue.saint_sava_temple.insider':'Большинство заходит, смотрит вверх и выходит — спустись в крипту: девять сортов мрамора, другая акустика и почти никого.',
'venue.saint_sava_temple.pills':'золотая мозаика|крипта|бесплатный вход',

'venue.nikola_tesla_museum.hook':'Урна с прахом Теслы здесь — позолоченная сфера в комнате на втором этаже, в двадцати метрах от установки, которой пропускают переменный ток мимо публики.',
'venue.nikola_tesla_museum.about':'В музее больше 160 000 подлинных документов и личные вещи Теслы, но суть — демонстрация: экскурсовод включает катушку Теслы и раздаёт люминесцентные лампы, которые загораются в руке без единого провода. Экскурсия идёт около 45 минут, группами и по языкам.',
'venue.nikola_tesla_museum.why':'Единственный в мире музей Теслы — и единственный адрес, где вместе и его архив, и его прах.',
'venue.nikola_tesla_museum.insider':'Группы уходят каждый час и быстро набираются, особенно после обеда — иди на первую утреннюю или бронируй, иначе будешь ждать на тротуаре на Крунской.',
'venue.nikola_tesla_museum.pills':'живая демонстрация|подлинный архив|экскурсия',

'venue.top_ider_park.hook':'Платан у конака князя Милоша посажен около 1830 года, и обхват его ствола сегодня больше шести метров.',
'venue.top_ider_park.about':'Парк начинался как придворное имение князя Милоша — его конак 1831 года стоит на том же месте, с фонтаном и обелиском перед ним. За ним луга, старые аллеи и тропа, поднимающаяся к Кошутняку, поэтому здесь полно бегунов, мангалов и людей с собаками.',
'venue.top_ider_park.why':'Старейший регулярный парк Белграда и единственное место, где видно, как выглядела сербская княжеская резиденция до того, как город вырос вокруг неё.',
'venue.top_ider_park.insider':'В воскресенье утром пусто, а к полудню это семейный пикник в дыму от мангалов — выбирай время по тому, зачем пришёл.',
'venue.top_ider_park.pills':'конак Милоша|старые платаны|бег',

'venue.gardo_tower.hook':'Башню поставили в 1896 году к тысячелетию Венгрии — на тогдашней границе империи, которая проходила ровно через нынешний Белград.',
'venue.gardo_tower.about':'Она стоит на холме над старым Земуном, на остатках средневековой крепости. Поднимаешься по узким улицам с низкими домами, а сверху открываются Дунай, Большой Военный остров и весь силуэт Белграда за водой.',
'venue.gardo_tower.why':'Лучший вид на Белград, который снят не из Белграда — ты видишь город снаружи, так, как на него веками смотрели с другой стороны границы.',
'venue.gardo_tower.insider':'Под башней, со стороны реки, старое земунское кладбище и несколько скамеек, где почти никогда никого нет — тот же вид, без билета и без очереди на лестнице.',
'venue.gardo_tower.pills':'панорама|старый Земун|Дунай',

'venue.national_museum.hook':'Здесь хранится Мирославово евангелие 1180 года — древнейшая сохранившаяся сербская книга, двумя этажами ниже Ван Гога.',
'venue.national_museum.about':'Три этажа: археология от доисторических времён до Рима на первом, средневековая Сербия на втором, европейская и сербская живопись на третьем. Здание было закрыто пятнадцать лет и открылось в 2018 году, так что экспозиция новая, хотя коллекции почти два века.',
'venue.national_museum.why':'Единственное собрание в стране, которое за полтора часа проводит от винчанских фигурок до Сезанна.',
'venue.national_museum.insider':'По воскресеньям вход свободный — и именно тогда тут больше всего людей; хочешь средневековые залы для себя, приходи во вторник к открытию.',
'venue.national_museum.pills':'Мирославово евангелие|три этажа|воскресенье бесплатно',

'venue.zemun_quay.hook':'Лебеди на этом отрезке Дуная — постоянные жители: их кормят соседи каждое утро, круглый год.',
'venue.zemun_quay.about':'Два километра ровной набережной: плавучие бары, кафе и рыбные рестораны с одной стороны, открытый Дунай с другой. Идёт от отеля «Югославия» до Гардоша, вымощена целиком, поэтому полна велосипедистов, роллеров и колясок.',
'venue.zemun_quay.why':'Лучший закат в городе, потому что смотришь строго на запад через открытую воду, и горизонт не режут дома.',
'venue.zemun_quay.insider':'Рыбные рестораны на набережной нормальные, но земунцы уходят на два квартала вглубь, на Главную — та же рыба, вдвое дешевле и без туристического меню.',
'venue.zemun_quay.pills':'закат|набережная Дуная|рыбные рестораны',

'venue.belgrade_fortress_military_museum.hook':'Танки стоят снаружи на валу, к ним можно подойти и положить руку — среди них обломки американского самолёта-невидимки, сбитого в 1999 году.',
'venue.belgrade_fortress_military_museum.about':'Уличная экспозиция — артиллерия вдоль стен Калемегдана, от османских пушек до советских гаубиц. Внутри около 3 000 экспонатов: оружие, форма и знамёна, от римских шлемов до войн девяностых.',
'venue.belgrade_fortress_military_museum.why':'Больше нигде снаряжение всех армий, державших этот холм, не собрано в одном месте.',
'venue.belgrade_fortress_military_museum.insider':'Уличная артиллерия бесплатна и доступна всегда — если у тебя двадцать минут, пройди линию орудий по валу и пропусти внутреннюю часть.',
'venue.belgrade_fortress_military_museum.pills':'танки под открытым небом|обломки F-117|внутри крепости',
},
el: {
'venue.kalemegdan_fortress.hook':'Από το πλάτωμα του Νικητή κοιτάς ακριβώς τη ραφή όπου ο πράσινος Σάβος μπαίνει στον θολό Δούναβη — δύο χρώματα νερού που αργούν να σμίξουν.',
'venue.kalemegdan_fortress.about':'Το φρούριο είναι στρωματωμένο: ρωμαϊκά θεμέλια, μεσαιωνικά σερβικά τείχη, αυστριακές πύλες και οθωμανικοί τάφοι, όλα πάνω σε έναν λόφο. Περπατάς την Άνω και την Κάτω Πόλη, το Ρολόι και την Πύλη του Δεσπότη, τον ζωολογικό κήπο και γήπεδα μπάσκετ όπου ακόμα παίζουν τα παιδιά της γειτονιάς.',
'venue.kalemegdan_fortress.why':'Πουθενά αλλού στην πόλη δεν φαίνεται τόσο καθαρά γιατί το Βελιγράδι γκρεμίστηκε καμιά σαρανταριά φορές — και ξαναχτίστηκε κάθε φορά στον ίδιο βράχο.',
'venue.kalemegdan_fortress.insider':'Έλα 45 λεπτά πριν τη δύση και στρίψε αριστερά από τον Νικητή, στο τείχος πάνω από τον πύργο Νεμπόισα — όλοι στριμώχνονται στο άγαλμα, ενώ η καλύτερη γωνία στη συμβολή είναι είκοσι μέτρα πιο πέρα.',
'venue.kalemegdan_fortress.pills':'συμβολή ποταμών|ηλιοβασίλεμα|ελεύθερη είσοδος',

'venue.skadarlija_bohemian_quarter.hook':'Το καλντερίμι στρώθηκε το 1968 για να μοιάζει με 1890 — και μετά από δύο ποτά παύει να σε απασχολεί.',
'venue.skadarlija_bohemian_quarter.about':'Τριακόσια μέτρα δρόμου στον ανήφορο, εκατέρωθεν kafane του 19ου αιώνα, ορχήστρες tamburica που πηγαίνουν από τραπέζι σε τραπέζι και πορτρετίστες που τελειώνουν σε είκοσι λεπτά. Το βράδυ τα τραπέζια βγαίνουν στον δρόμο και όλο το σοκάκι γίνεται μία μακριά τραπεζαρία.',
'venue.skadarlija_bohemian_quarter.why':'Το μόνο κομμάτι του Βελιγραδίου όπου η μουσική έρχεται ακόμα στο τραπέζι σου αντί να βγαίνει από ηχείο.',
'venue.skadarlija_bohemian_quarter.insider':'Ξεκίνα από κάτω, από την Cetinjska, και ανέβα — οι kafane στην κορυφή είναι οι τουριστικές, αυτές στη μέση της ανηφόρας κρατούν ακόμα τους παλιούς θαμώνες.',
'venue.skadarlija_bohemian_quarter.pills':'kafane|ζωντανή tamburica|καλντερίμι',

'venue.ada_ciganlija.hook':'Ένα ποτάμιο νησί που το 1967 έγινε χερσόνησος και λίμνη — εφτά χιλιόμετρα παραλίας, είκοσι λεπτά από την πλατεία Δημοκρατίας.',
'venue.ada_ciganlija.about':'Βοτσαλωτή ακτή, κίτρινα πλωτά μπαρ, ποδηλατόδρομος γύρω από όλη τη λίμνη, γήπεδα βόλεϊ, καγιάκ, κωπηλασία και bungee από τη γέφυρα. Τον Ιούλιο περνούν εκατό χιλιάδες άνθρωποι τη μέρα· τον χειμώνα είναι άδεια και ιδανική για τρέξιμο.',
'venue.ada_ciganlija.why':'Εδώ περνάει πραγματικά το καλοκαίρι του το Βελιγράδι — έλα Κυριακή απόγευμα αν θες την πόλη όπως είναι, όχι όπως βγαίνει στη φωτογραφία.',
'venue.ada_ciganlija.insider':'Στο δυτικό άκρο της λίμνης, πίσω από τα γήπεδα τένις, υπάρχουν ήσυχοι χορταριασμένοι κολπίσκοι χωρίς μουσική — εκεί πάνε όσοι ζουν εδώ, όχι όσοι ήρθαν για τη μέρα.',
'venue.ada_ciganlija.pills':'κολύμπι στη λίμνη|ποδηλατόδρομος|καλοκαίρι',

'venue.saint_sava_temple.hook':'Το ψηφιδωτό του τρούλου έχει σαράντα εκατομμύρια ψηφίδες χρυσού και γυαλιού — και μπήκε μόλις το 2020, μετά από ογδόντα χρόνια γυμνού μπετόν.',
'venue.saint_sava_temple.about':'Απ\' έξω λευκό μάρμαρο κάτω από έναν τρούλο 4.000 τόνων, που συναρμολογήθηκε στο έδαφος το 1989 και σηκώθηκε ολόκληρος. Μέσα ένας τεράστιος ενιαίος χώρος χωρίς ούτε μία κολόνα, και από κάτω μια κρύπτη γεμάτη τοιχογραφίες σε εντελώς άλλο, θερμότερο τόνο.',
'venue.saint_sava_temple.why':'Ελάχιστα κτίρια στον κόσμο σου δείχνουν μεσαιωνική βυζαντινή μορφή φτιαγμένη με μηχανική του εικοστού αιώνα.',
'venue.saint_sava_temple.insider':'Οι περισσότεροι μπαίνουν, κοιτούν ψηλά και φεύγουν — κατέβα στην κρύπτη: εννιά είδη μαρμάρου, άλλη ακουστική και σχεδόν κανείς.',
'venue.saint_sava_temple.pills':'χρυσό ψηφιδωτό|η κρύπτη|ελεύθερη είσοδος',

'venue.nikola_tesla_museum.hook':'Η τεφροδόχος του Τέσλα είναι εδώ — μια επιχρυσωμένη σφαίρα σε δωμάτιο του επάνω ορόφου, είκοσι μέτρα από τη διάταξη με την οποία περνούν εναλλασσόμενο ρεύμα μπροστά από το κοινό.',
'venue.nikola_tesla_museum.about':'Το μουσείο φυλάει πάνω από 160.000 πρωτότυπα έγγραφα και τα προσωπικά αντικείμενα του Τέσλα, αλλά ο πυρήνας είναι η επίδειξη: ο ξεναγός ανάβει πηνίο Τέσλα και μοιράζει λάμπες φθορισμού που ανάβουν στο χέρι σου, χωρίς κανένα καλώδιο. Η ξενάγηση κρατά περίπου 45 λεπτά, σε γκρουπ και ανά γλώσσα.',
'venue.nikola_tesla_museum.why':'Το μοναδικό μουσείο στον κόσμο αφιερωμένο στον Τέσλα — και η μόνη διεύθυνση που έχει μαζί το αρχείο του και τις στάχτες του.',
'venue.nikola_tesla_museum.insider':'Τα γκρουπ ξεκινούν κάθε ακριβή ώρα και γεμίζουν, ειδικά το απόγευμα — πάρε το πρώτο του πρωινού ή κλείσε θέση, αλλιώς περιμένεις στο πεζοδρόμιο της Krunska.',
'venue.nikola_tesla_museum.pills':'ζωντανή επίδειξη|πρωτότυπο αρχείο|ξενάγηση',

'venue.top_ider_park.hook':'Ο πλάτανος δίπλα στο κονάκι του Μίλος φυτεύτηκε γύρω στο 1830 και σήμερα ο κορμός του ξεπερνά τα έξι μέτρα περίμετρο.',
'venue.top_ider_park.about':'Το πάρκο ξεκίνησε ως αυλικό κτήμα του ηγεμόνα Μίλος — το κονάκι του, του 1831, στέκει ακόμα στη θέση του, με κρήνη και οβελίσκο μπροστά. Πίσω του λιβάδια, παλιές δεντροστοιχίες και μονοπάτι που ανεβαίνει προς το Κοσούτνιακ, γι\' αυτό γεμίζει δρομείς, ψησταριές και κόσμο με σκύλους.',
'venue.top_ider_park.why':'Το παλαιότερο διαμορφωμένο πάρκο του Βελιγραδίου και το μόνο μέρος όπου βλέπεις πώς έμοιαζε μια σερβική ηγεμονική κατοικία πριν μεγαλώσει η πόλη γύρω της.',
'venue.top_ider_park.insider':'Κυριακή πρωί είναι άδειο· το απόγευμα γίνεται οικογενειακή εκδρομή μέσα στον καπνό της ψησταριάς — διάλεξε ώρα ανάλογα με το τι ήρθες να κάνεις.',
'venue.top_ider_park.pills':'κονάκι του Μίλος|αιωνόβιοι πλάτανοι|τρέξιμο',

'venue.gardo_tower.hook':'Ο πύργος υψώθηκε το 1896 για τα χίλια χρόνια της Ουγγαρίας — πάνω στα τότε σύνορα της αυτοκρατορίας, που περνούσαν ακριβώς μέσα από το σημερινό Βελιγράδι.',
'venue.gardo_tower.about':'Στέκει στον λόφο πάνω από το παλιό Ζέμουν, στα ερείπια μεσαιωνικού φρουρίου. Ανεβαίνεις από στενά δρομάκια με χαμηλά σπίτια, και από ψηλά ανοίγονται ο Δούναβης, το Μεγάλο Πολεμικό Νησί και όλο το περίγραμμα του Βελιγραδίου απέναντι από το νερό.',
'venue.gardo_tower.why':'Η καλύτερη θέα του Βελιγραδίου που δεν είναι τραβηγμένη μέσα από το Βελιγράδι — βλέπεις την πόλη απ\' έξω, όπως την κοιτούσαν επί αιώνες από την άλλη πλευρά ενός συνόρου.',
'venue.gardo_tower.insider':'Κάτω από τον πύργο, προς το ποτάμι, είναι το παλιό νεκροταφείο του Ζέμουν και μερικά παγκάκια όπου σχεδόν ποτέ δεν κάθεται κανείς — ίδια θέα, χωρίς εισιτήριο και χωρίς ουρά στη σκάλα.',
'venue.gardo_tower.pills':'πανόραμα|παλιό Ζέμουν|Δούναβης',

'venue.national_museum.hook':'Εδώ φυλάσσεται το Ευαγγέλιο του Μίροσλαβ του 1180 — το αρχαιότερο σωζόμενο σερβικό βιβλίο, δύο ορόφους κάτω από έναν Βαν Γκογκ.',
'venue.national_museum.about':'Τρεις όροφοι: αρχαιολογία από την προϊστορία ως τη Ρώμη στο ισόγειο, μεσαιωνική Σερβία στον πρώτο, ευρωπαϊκή και σερβική ζωγραφική στον δεύτερο. Το κτίριο έμεινε κλειστό δεκαπέντε χρόνια και άνοιξε ξανά το 2018, οπότε η έκθεση είναι καινούργια αν και η συλλογή είναι σχεδόν δύο αιώνων.',
'venue.national_museum.why':'Η μόνη συλλογή στη χώρα που σε πάει από τα ειδώλια της Βίντσα στον Σεζάν μέσα σε ενενήντα λεπτά.',
'venue.national_museum.insider':'Την Κυριακή η είσοδος είναι ελεύθερη, και τότε έχει και τον περισσότερο κόσμο — αν θες τις μεσαιωνικές αίθουσες δικές σου, έλα Τρίτη πρωί με το άνοιγμα.',
'venue.national_museum.pills':'Ευαγγέλιο του Μίροσλαβ|τρεις όροφοι|δωρεάν Κυριακή',

'venue.zemun_quay.hook':'Οι κύκνοι σε αυτό το κομμάτι του Δούναβη είναι μόνιμοι κάτοικοι — η γειτονιά τούς ταΐζει κάθε πρωί, όλο τον χρόνο.',
'venue.zemun_quay.about':'Δύο χιλιόμετρα επίπεδης παραποτάμιας διαδρομής: πλωτά μπαρ, καφέ και ψαροταβέρνες από τη μία, ανοιχτός Δούναβης από την άλλη. Πάει από το ξενοδοχείο Jugoslavija ως το Γκάρντος και είναι πλακόστρωτη σε όλο το μήκος, γι\' αυτό γεμάτη ποδήλατα, πατίνια και καροτσάκια.',
'venue.zemun_quay.why':'Το καλύτερο ηλιοβασίλεμα της πόλης, γιατί κοιτάς κατευθείαν δυτικά πάνω από ανοιχτό νερό, χωρίς κτίρια να κόβουν τον ορίζοντα.',
'venue.zemun_quay.insider':'Οι ψαροταβέρνες στην προκυμαία είναι εντάξει, αλλά οι ντόπιοι περπατούν δύο τετράγωνα προς τα μέσα, στη Glavna — ίδιο ψάρι, μισή τιμή, χωρίς τουριστικό μενού.',
'venue.zemun_quay.pills':'ηλιοβασίλεμα|παραποτάμιος περίπατος|ψαροταβέρνες',

'venue.belgrade_fortress_military_museum.hook':'Τα τανκς είναι έξω στα τείχη και μπορείς να πλησιάσεις και να τα ακουμπήσεις — ανάμεσά τους και συντρίμμια του αμερικανικού stealth που καταρρίφθηκε το 1999.',
'venue.belgrade_fortress_military_museum.about':'Η υπαίθρια έκθεση είναι πυροβολικό παραταγμένο κατά μήκος των τειχών του Καλεμέγκνταν, από οθωμανικά κανόνια ως σοβιετικά οβιδοβόλα. Μέσα υπάρχουν περίπου 3.000 εκθέματα σε όπλα, στολές και σημαίες, από ρωμαϊκά κράνη ως τους πολέμους της δεκαετίας του \'90.',
'venue.belgrade_fortress_military_museum.why':'Πουθενά αλλού δεν βρίσκεται μαζεμένος στον ίδιο χώρο ο εξοπλισμός όλων των στρατών που κράτησαν αυτόν τον λόφο.',
'venue.belgrade_fortress_military_museum.insider':'Η υπαίθρια έκθεση είναι δωρεάν και πάντα ανοιχτή — αν έχεις μόνο είκοσι λεπτά, περπάτα τη γραμμή των κανονιών στο τείχος και παράλειψε το εσωτερικό.',
'venue.belgrade_fortress_military_museum.pills':'τανκς σε ανοιχτό χώρο|συντρίμμια F-117|μέσα στο φρούριο',
},
he: {
'venue.kalemegdan_fortress.hook':'מהרחבה שליד פסל המנצח אתה מביט בדיוק בתפר שבו הסאבה הירוקה נכנסת לדנובה העכורה — שני צבעי מים שלוקח להם זמן להתערבב.',
'venue.kalemegdan_fortress.about':'המצודה בנויה שכבות: יסודות רומיים, חומות סרביות מימי הביניים, שערים אוסטריים וטורבות עות\'מאניות, הכול על גבעה אחת. עוברים בעיר העליונה והתחתונה, ליד מגדל השעון ושער הדספוט, גן החיות ומגרשי כדורסל שילדי השכונה עדיין משחקים בהם.',
'venue.kalemegdan_fortress.why':'שום מקום אחר בעיר לא ממחיש כך למה בלגרד נהרסה כארבעים פעם — ונבנתה מחדש בכל פעם על אותו סלע.',
'venue.kalemegdan_fortress.insider':'בוא 45 דקות לפני השקיעה ופנה שמאלה מפסל המנצח, אל החומה שמעל מגדל נבויישה — כולם נדחסים ליד הפסל, והזווית הטובה על מפגש הנהרות נמצאת עשרים מטר משם.',
'venue.kalemegdan_fortress.pills':'מפגש הנהרות|שקיעה|כניסה חופשית',

'venue.skadarlija_bohemian_quarter.hook':'אבני המרצפת הונחו ב-1968 כדי להיראות כמו 1890 — ואחרי שתי כוסות זה כבר לא מטריד אותך.',
'venue.skadarlija_bohemian_quarter.about':'שלוש מאות מטר של רחוב במעלה ההר, משני הצדדים קפאנות מהמאה ה-19, תזמורות טמבוריצה שעוברות משולחן לשולחן וציירי פורטרטים שמסיימים בעשרים דקות. בערב מוציאים את השולחנות לרחוב וכל הסמטה הופכת לחדר אוכל אחד ארוך.',
'venue.skadarlija_bohemian_quarter.why':'החלק היחיד בבלגרד שבו המוזיקה עדיין מגיעה אל השולחן שלך ולא יוצאת מרמקול.',
'venue.skadarlija_bohemian_quarter.insider':'התחל מלמטה, מרחוב צטיניסקה, ועלה — הקפאנות בראש ההר הן התיירותיות, אלה שבאמצע העלייה עדיין שומרות על הקבועים הוותיקים.',
'venue.skadarlija_bohemian_quarter.pills':'קפאנות|טמבוריצה חיה|אבני מרצפת',

'venue.ada_ciganlija.hook':'אי בנהר שהפך ב-1967 לחצי אי ולאגם — שבעה קילומטרים של חוף, עשרים דקות מכיכר הרפובליקה.',
'venue.ada_ciganlija.about':'חוף חלוקים, ברים צהובים צפים, שביל אופניים סביב כל האגם, מגרשי כדורעף, קיאקים, חתירה וקפיצת בנג\'י מהגשר. ביולי עוברים כאן מאה אלף איש ביום; בחורף ריק ומושלם לריצה.',
'venue.ada_ciganlija.why':'כאן בלגרד באמת מעבירה את הקיץ — בוא ביום ראשון אחר הצהריים אם אתה רוצה את העיר כמו שהיא, לא כמו שהיא נראית בתמונה.',
'venue.ada_ciganlija.insider':'בקצה המערבי של האגם, מאחורי מגרשי הטניס, יש מפרצי דשא שקטים בלי מוזיקה — לשם הולכים מי שגרים כאן, לא מי שבאו ליום אחד.',
'venue.ada_ciganlija.pills':'רחצה באגם|שביל אופניים|קיץ',

'venue.saint_sava_temple.hook':'פסיפס הכיפה עשוי מארבעים מיליון חלקיקי זהב וזכוכית — והוא הותקן רק ב-2020, אחרי שמונים שנה של בטון חשוף.',
'venue.saint_sava_temple.about':'מבחוץ שיש לבן מתחת לכיפה במשקל 4,000 טון, שהורכבה על הקרקע ב-1989 והורמה בחתיכה אחת. בפנים חלל אחד ענק בלי עמוד אחד, ומתחתיו קריפטה מכוסה פרסקאות בגוון אחר לגמרי, חמים יותר.',
'venue.saint_sava_temple.why':'מעט מבנים בעולם מראים צורה ביזנטית מימי הביניים שבוצעה בהנדסה של המאה העשרים.',
'venue.saint_sava_temple.insider':'רוב האנשים נכנסים, מרימים מבט ויוצאים — רד במקום זה לקריפטה: תשעה סוגי שיש, אקוסטיקה אחרת וכמעט אף אחד.',
'venue.saint_sava_temple.pills':'פסיפס זהב|הקריפטה|כניסה חופשית',

'venue.nikola_tesla_museum.hook':'כד האפר של טסלה נמצא כאן — כדור מצופה זהב בחדר בקומה העליונה, עשרים מטר מהמתקן שמעביר זרם חילופין מול הקהל.',
'venue.nikola_tesla_museum.about':'המוזיאון שומר על יותר מ-160,000 מסמכים מקוריים ועל חפציו האישיים של טסלה, אבל הלב הוא ההדגמה: המדריך מפעיל סליל טסלה ומחלק נורות פלואורסצנט שנדלקות ביד, בלי שום חוט. הסיור נמשך כ-45 דקות, בקבוצות ולפי שפה.',
'venue.nikola_tesla_museum.why':'המוזיאון היחיד בעולם המוקדש לטסלה — והכתובת היחידה שבה נמצאים גם הארכיון שלו וגם אפרו.',
'venue.nikola_tesla_museum.insider':'הקבוצות יוצאות בכל שעה עגולה ומתמלאות, במיוחד אחרי הצהריים — קח את הראשונה של הבוקר או הזמן מראש, אחרת תחכה על המדרכה ברחוב קרונסקה.',
'venue.nikola_tesla_museum.pills':'הדגמה חיה|ארכיון מקורי|סיור מודרך',

'venue.top_ider_park.hook':'הדולב שליד ארמון מילוש ניטע סביב 1830, והיקף הגזע שלו היום עולה על שישה מטרים.',
'venue.top_ider_park.about':'הפארק התחיל כאחוזת החצר של הנסיך מילוש — הקונאק שלו מ-1831 עדיין עומד באותו מקום, עם מזרקה ואובליסק לפניו. מאחוריו אחו, שדרות עצים ותיקות ושביל שמטפס לעבר קושוטניאק, ולכן הוא מלא רצים, מנגלים ואנשים עם כלבים.',
'venue.top_ider_park.why':'הפארק המתוכנן הוותיק בבלגרד והמקום היחיד שבו רואים איך נראה מעון נסיכים סרבי לפני שהעיר צמחה סביבו.',
'venue.top_ider_park.insider':'ביום ראשון בבוקר ריק, ואחר הצהריים זה פיקניק משפחתי בעשן מנגלים — בחר את השעה לפי מה שבאת לעשות.',
'venue.top_ider_park.pills':'הקונאק של מילוש|דולבים עתיקים|ריצה',

'venue.gardo_tower.hook':'המגדל הוקם ב-1896 לציון אלף שנה להונגריה — על גבול האימפריה דאז, שעבר בדיוק דרך בלגרד של היום.',
'venue.gardo_tower.about':'הוא עומד על הגבעה מעל זמון העתיקה, על שרידי מצודה מימי הביניים. מטפסים אליו דרך סמטאות צרות של בתים נמוכים, ומלמעלה נפרשים הדנובה, אי המלחמה הגדול וכל קו הרקיע של בלגרד מעבר למים.',
'venue.gardo_tower.why':'זה המבט הטוב ביותר על בלגרד שלא צולם מתוך בלגרד — רואים את העיר מבחוץ, כפי שהביטו בה מאות שנים מעברו השני של גבול.',
'venue.gardo_tower.insider':'מתחת למגדל, בצד הנהר, נמצאים בית הקברות הישן של זמון וכמה ספסלים שכמעט אף אחד לא יושב עליהם — אותו נוף, בלי כרטיס ובלי תור במדרגות.',
'venue.gardo_tower.pills':'פנורמה|זמון העתיקה|הדנובה',

'venue.national_museum.hook':'כאן נשמרת הבשורה של מירוסלב משנת 1180 — הספר הסרבי העתיק ביותר ששרד, שתי קומות מתחת לוואן גוך.',
'venue.national_museum.about':'שלוש קומות: ארכיאולוגיה מהפרהיסטוריה ועד רומא בקומת הקרקע, סרביה של ימי הביניים בראשונה, ציור אירופי וסרבי בשנייה. הבניין היה סגור חמש עשרה שנה ונפתח מחדש ב-2018, כך שהתצוגה חדשה גם אם האוסף בן כמעט מאתיים שנה.',
'venue.national_museum.why':'האוסף היחיד בארץ שלוקח אותך מפסלוני וינצ\'ה עד סזאן בתשעים דקות.',
'venue.national_museum.insider':'בימי ראשון הכניסה חופשית, וזה גם היום העמוס ביותר — אם אתה רוצה את אולמות ימי הביניים לעצמך, בוא ביום שלישי בבוקר עם הפתיחה.',
'venue.national_museum.pills':'הבשורה של מירוסלב|שלוש קומות|ראשון חינם',

'venue.zemun_quay.hook':'הברבורים בקטע הזה של הדנובה הם תושבי קבע — השכונה מאכילה אותם כל בוקר, כל השנה.',
'venue.zemun_quay.about':'שני קילומטרים של טיילת מישורית לאורך המים: ברים צפים, בתי קפה ומסעדות דגים מצד אחד, דנובה פתוחה מהצד השני. היא נמשכת ממלון יוגוסלביה עד גרדוש ומרוצפת לכל אורכה, ולכן מלאה אופניים, גלגיליות ועגלות.',
'venue.zemun_quay.why':'השקיעה הטובה בעיר, כי מביטים ישר מערבה מעל מים פתוחים, בלי בניינים שחותכים את האופק.',
'venue.zemun_quay.insider':'מסעדות הדגים על הטיילת בסדר גמור, אבל תושבי זמון הולכים שני רחובות פנימה, לרחוב גלאבנה — אותו דג, חצי מחיר, בלי תפריט לתיירים.',
'venue.zemun_quay.pills':'שקיעה|טיילת הדנובה|מסעדות דגים',

'venue.belgrade_fortress_military_museum.hook':'הטנקים עומדים בחוץ על החומה, אפשר לגשת ולהניח עליהם יד — וביניהם שברי מטוס החמקן האמריקאי שהופל ב-1999.',
'venue.belgrade_fortress_military_museum.about':'התצוגה החיצונית היא ארטילריה לאורך חומות קלמגדן, מתותחים עות\'מאניים ועד הוביצרים סובייטיים. בפנים כ-3,000 פריטים של נשק, מדים ודגלים, מקסדות רומיות ועד מלחמות שנות התשעים.',
'venue.belgrade_fortress_military_museum.why':'בשום מקום אחר לא מרוכז במקום אחד הציוד של כל הצבאות שהחזיקו בגבעה הזאת.',
'venue.belgrade_fortress_military_museum.insider':'התצוגה החיצונית חינם ופתוחה תמיד — אם יש לך רק עשרים דקות, לך לאורך קו התותחים על החומה ודלג על הפנים.',
'venue.belgrade_fortress_military_museum.pills':'טנקים בחוץ|שברי F-117|בתוך המצודה',
},
    };

    Object.assign(T['en'], labels.en);
    if (T['us']) Object.assign(T['us'], labels.en);
    for (var lang in labels) {
        if (T[lang]) Object.assign(T[lang], labels[lang]);
    }
    for (var lang2 in v) {
        if (T[lang2]) Object.assign(T[lang2], v[lang2]);
    }
})();
