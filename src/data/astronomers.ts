/** Biografie astronomów — zarys kim byli i co najważniejszego zrobili */

export interface AstronomerBio {
  titleId: string;
  fullName: string;
  born: string;
  died: string;
  nationality: string;
  portrait: string; // emoji
  summary: string;
  keyAchievements: string[];
  funFact: string;
}

export const ASTRONOMER_BIOS: AstronomerBio[] = [
  {
    titleId: "t01",
    fullName: "Klaudiusz Ptolemeusz",
    born: "ok. 100 n.e.",
    died: "ok. 170 n.e.",
    nationality: "Greko-Egipcjanin",
    portrait: "🌍",
    summary:
      "Astronom, matematyk i geograf z Aleksandrii. Stworzył geocentryczny model wszechświata, który dominował w nauce przez ponad 1400 lat.",
    keyAchievements: [
      "Napisał Almagest — encyklopedię astronomiczną starożytności",
      "Skatalogował 1022 gwiazdy w 48 konstelacjach",
      "Opracował model epicykli tłumaczący ruchy planet",
      "Stworzył Geografię — mapę znanego świata",
    ],
    funFact: "Jego model geocentryczny był tak dokładny, że pozwalał przewidywać pozycje planet z zaledwie kilkuminutowym błędem.",
  },
  {
    titleId: "t02",
    fullName: "Mikołaj Kopernik",
    born: "1473",
    died: "1543",
    nationality: "Polak",
    portrait: "☀️",
    summary:
      "Polski astronom i matematyk, twórca heliocentrycznej teorii Układu Słonecznego. Zrewolucjonizował naukę, umieszczając Słońce w centrum.",
    keyAchievements: [
      "Sformułował teorię heliocentryczną w De revolutionibus",
      "Przeniósł Ziemię z centrum wszechświata na orbitę wokół Słońca",
      "Wyjaśnił precesję równonocy",
      "Wpłynął na rewolucję naukową XVI-XVII wieku",
    ],
    funFact: "Kopernik z wykształcenia był lekarzem i prawnikiem kanonicznym — astronomią zajmował się niejako hobbystycznie.",
  },
  {
    titleId: "t03",
    fullName: "Tycho Brahe",
    born: "1546",
    died: "1601",
    nationality: "Duńczyk",
    portrait: "📐",
    summary:
      "Duński astronom znany z najdokładniejszych obserwacji nieba przed wynalezieniem teleskopu. Jego dane stały się fundamentem prac Keplera.",
    keyAchievements: [
      "Prowadził najdokładniejsze obserwacje pozycji gwiazd i planet gołym okiem",
      "Zbudował obserwatorium Uraniborg na wyspie Hven",
      "Zaobserwował supernową SN 1572 (Gwiazda Tychona)",
      "Zaproponował kompromisowy model geo-heliocentryczny",
    ],
    funFact: "Stracił nos w pojedynku na szpady i nosił protezę ze stopu złota i srebra. Miał też ulubionego łosia, który zmarł po wypiciu zbyt dużo piwa.",
  },
  {
    titleId: "t04",
    fullName: "Galileo Galilei",
    born: "1564",
    died: "1642",
    nationality: "Włoch",
    portrait: "🔭",
    summary:
      "Włoski fizyk i astronom, ojciec nowoczesnej astronomii obserwacyjnej. Jako pierwszy użył teleskopu do systematycznych obserwacji nieba.",
    keyAchievements: [
      "Odkrył 4 największe księżyce Jowisza (galileuszowe)",
      "Zaobserwował fazy Wenus — dowód na heliocentryzm",
      "Odkrył góry i kratery na Księżycu",
      "Opisał pierścienie Saturna i plamy słoneczne",
    ],
    funFact: "Został skazany przez Inkwizycję za obronę heliocentryzmu. Legenda mówi, że po wyroku szepnął 'A jednak się kręci' — choć najpewniej to mit.",
  },
  {
    titleId: "t05",
    fullName: "Johannes Kepler",
    born: "1571",
    died: "1630",
    nationality: "Niemiec",
    portrait: "🪐",
    summary:
      "Niemiecki matematyk i astronom, który na podstawie danych Tychona Brahe sformułował trzy prawa ruchu planet — fundament mechaniki nieba.",
    keyAchievements: [
      "Sformułował trzy prawa ruchu planet (eliptyczne orbity)",
      "Wykorzystał dane Tychona do rewolucji w astronomii",
      "Wydał Astronomia Nova i Harmonices Mundi",
      "Opracował optykę teleskopu astronomicznego",
    ],
    funFact: "Kepler musiał bronić swojej matki przed oskarżeniem o czary — proces trwał 6 lat i zakończył się uniewinnieniem.",
  },
  {
    titleId: "t06",
    fullName: "Isaac Newton",
    born: "1643",
    died: "1727",
    nationality: "Anglik",
    portrait: "🍎",
    summary:
      "Angielski fizyk, matematyk i astronom. Sformułował prawo powszechnego ciążenia i trzy zasady dynamiki — fundamenty fizyki klasycznej.",
    keyAchievements: [
      "Sformułował prawo powszechnego ciążenia",
      "Zbudował pierwszy teleskop zwierciadlany (newtonowski)",
      "Opisał rozkład światła białego na pryzmacie",
      "Opublikował Principia — jedno z najważniejszych dzieł nauki",
    ],
    funFact: "Legenda o jabłku jest prawdopodobnie prawdziwa — Newton sam opowiadał tę historię pod koniec życia.",
  },
  {
    titleId: "t07",
    fullName: "William Herschel",
    born: "1738",
    died: "1822",
    nationality: "Niemiec/Brytyjczyk",
    portrait: "🌌",
    summary:
      "Kompozytor, który został astronomem. Odkrywca Urana i promieniowania podczerwonego. Skatalogował tysiące mgławic i gromad gwiezdnych.",
    keyAchievements: [
      "Odkrył planetę Uran (1781) — pierwsza planeta odkryta teleskopem",
      "Skatalogował ponad 2500 mgławic i gromad gwiezdnych",
      "Odkrył promieniowanie podczerwone",
      "Zbudował największe teleskopy swojej epoki (1,2 m apertura)",
    ],
    funFact: "Jego siostra Caroline była również wybitną astronomką — odkryła 8 komet i otrzymała Złoty Medal Królewskiego Towarzystwa Astronomicznego.",
  },
  {
    titleId: "t08",
    fullName: "Charles Messier",
    born: "1730",
    died: "1817",
    nationality: "Francuz",
    portrait: "💫",
    summary:
      "Francuski astronom znany z katalogu 110 obiektów głębokiego nieba. Ironicznie, katalog stworzył aby NIE mylić mgławic z kometami.",
    keyAchievements: [
      "Stworzył słynny Katalog Messiera (M1-M110)",
      "Odkrył 13 komet osobiście",
      "Jego katalog to dziś podstawa dla amatorów astronomii",
      "Zaobserwował wiele mgławic, gromad i galaktyk jako pierwszy",
    ],
    funFact: "Messier był łowcą komet — katalog mgławic stworzył właściwie 'przy okazji', żeby wiedzieć które rozmyte plamy na niebie NIE są kometami.",
  },
  {
    titleId: "t09",
    fullName: "Edwin Hubble",
    born: "1889",
    died: "1953",
    nationality: "Amerykanin",
    portrait: "🔴",
    summary:
      "Amerykański astronom, który udowodnił istnienie galaktyk poza Drogą Mleczną i odkrył ekspansję wszechświata — zmieniając nasze rozumienie kosmosu.",
    keyAchievements: [
      "Udowodnił, że Andromeda to osobna galaktyka (1924)",
      "Odkrył prawo Hubble'a — ekspansję wszechświata",
      "Stworzył klasyfikację galaktyk (sekwencja Hubble'a)",
      "Kosmiczny Teleskop Hubble'a nosi jego imię",
    ],
    funFact: "Przed astronomią był bokserem i prawnikiem. Mógł walczyć zawodowo, ale wybrał gwiazdy zamiast ringu.",
  },
  {
    titleId: "t10",
    fullName: "Stephen Hawking",
    born: "1942",
    died: "2018",
    nationality: "Brytyjczyk",
    portrait: "🕳️",
    summary:
      "Brytyjski fizyk teoretyczny, który pomimo ALS dokonał przełomowych odkryć w kosmologii. Popularyzator nauki i ikona kultury.",
    keyAchievements: [
      "Przewidział promieniowanie Hawkinga z czarnych dziur",
      "Współtworzył twierdzenia o singularnościach (z Penrose'em)",
      "Napisał Krótką historię czasu — bestseller popularnonaukowy",
      "Badał paradoks informacji czarnych dziur",
    ],
    funFact: "Lekarze dali mu 2 lata życia w wieku 21 lat. Żył jeszcze 55 lat, zdobywając po drodze 12 doktoratów honoris causa.",
  },
  {
    titleId: "t11",
    fullName: "Carl Sagan",
    born: "1934",
    died: "1996",
    nationality: "Amerykanin",
    portrait: "🌠",
    summary:
      "Amerykański astronom i genialny popularyzator nauki. Twórca serialu Cosmos i autor słynnego pale blue dot.",
    keyAchievements: [
      "Stworzył serial Cosmos: A Personal Voyage (1980)",
      "Zaproponował złotą płytę Voyagera — posłanie ludzkości",
      "Badał atmosfery planet w Układzie Słonecznym",
      "Przekonał NASA do zrobienia zdjęcia Pale Blue Dot",
    ],
    funFact: "Jego zdanie 'miliardy i miliardy' stało się tak kultowe, że użył go jako tytuł swojej ostatniej książki — mimo że nigdy tak naprawdę go nie powiedział w Cosmos.",
  },
  {
    titleId: "t12",
    fullName: "Wielki Obserwator",
    born: "—",
    died: "—",
    nationality: "Społeczność Astrostr",
    portrait: "👑",
    summary:
      "Najwyższy tytuł w społeczności Astrostr. Zarezerwowany dla tych, którzy swoją pasją, wiedzą i zaangażowaniem zasłużyli na miano legendy.",
    keyAchievements: [
      "Zdobył ponad 10 000 punktów grywalizacji",
      "Ukończył dziesiątki osiągnięć w każdej kategorii",
      "Aktywny członek społeczności od samego początku",
      "Inspiracja dla innych astronomów-amatorów",
    ],
    funFact: "Ten tytuł jest tak rzadki, że na razie nikt go jeszcze nie osiągnął. Może to będziesz Ty?",
  },
];
