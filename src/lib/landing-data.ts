/* Placeholder data for VidimoSe.hr landing page */

export type InvitationTemplate = {
  id: string
  theme: string
  /** Ilustracija teme (ispod naslova u sekciji Kreiraj pozivnicu). */
  image: string
  childName: string
  age: string
  date: string
  venue: string
  address: string
  time: string
}

export type VenuePackage = {
  name: string
  price: number
  minChildren: number
  includes: string[]
}

export type Venue = {
  id: string
  slug: string
  name: string
  city: string
  address: string
  phone: string
  rating: number
  reviewCount: number
  pricePerChild: number
  ageRange: string
  ageMin: number
  ageMax: number
  maxChildren: number
  description: string
  amenities: string[]
  coverPhoto: string
  photos: string[]
  packages: VenuePackage[]
}

export type Testimonial = {
  quote: string
  name: string
  childAge: string
  city: string
  monogram: string
}

export type FAQItem = {
  question: string
  answer: string
}

export const invitationTemplates: InvitationTemplate[] = [
  {
    id: 'safari',
    theme: 'Safari',
    image: '/safari.png',
    childName: 'Luka',
    age: '5',
    date: 'Subota, 21. lipnja',
    venue: 'Džungla Park',
    address: 'Vukovarska 47, Zagreb',
    time: '16:00 — 18:00',
  },
  {
    id: 'unicorn',
    theme: 'Unicorn',
    image: '/unicorns.png',
    childName: 'Mia',
    age: '4',
    date: 'Nedjelja, 8. lipnja',
    venue: 'Čarobni Kutak',
    address: 'Ilica 220, Zagreb',
    time: '15:00 — 17:30',
  },
  {
    id: 'svemir',
    theme: 'Svemir',
    image: '/space.png',
    childName: 'Filip',
    age: '7',
    date: 'Subota, 14. lipnja',
    venue: 'Rocket Room',
    address: 'Avenija Dubrovnik 12, Zagreb',
    time: '14:00 — 16:30',
  },
  {
    id: 'princess',
    theme: 'Princeza',
    image: '/princess.png',
    childName: 'Petra',
    age: '6',
    date: 'Subota, 28. lipnja',
    venue: 'Arena Junior',
    address: 'Kneza Branimira 88, Split',
    time: '10:00 — 12:30',
  },
]

export const venues: Venue[] = [
  {
    id: 'habyland',
    slug: 'habyland-zagreb',
    name: 'Habyland',
    city: 'Zagreb',
    address: 'Avenija Dubrovnik 15 (Velesajam, Paviljon 25), 10020 Zagreb',
    phone: '+385 1 6187 715',
    rating: 4.7,
    reviewCount: 180,
    pricePerChild: 11,
    ageRange: '0–12',
    ageMin: 0,
    ageMax: 12,
    maxChildren: 30,
    description: 'Jedna od najvećih igraonica u Zagrebu s 1.250 m² prostora — trampolini, napuhanci, tobogani, labirint, arkadne igre i tematski kutak za bebe. TÜV certificirana oprema i profesionalni animatori za svaki paket.',
    amenities: ['Parking', 'Ugostiteljstvo', 'Animatori', 'Trampolini', 'Klima', 'Video nadzor', 'TÜV certifikat'],
    coverPhoto: 'https://habyland.com/wp-content/uploads/2024/12/DJECJA-IGRAONICA-HABYLAND-3-scaled-1920x1200.jpg',
    photos: [
      'https://habyland.com/wp-content/uploads/2024/12/habyland-igraonica-i-rodendani-za-djecu-zagreb-8-1920x1200.jpg',
      'https://habyland.com/wp-content/uploads/2024/12/habyland-igraonica-i-rodendani-za-djecu-zagreb-17-1920x1200.jpg',
      'https://habyland.com/wp-content/uploads/2024/12/habyland-igraonica-i-rodendani-za-djecu-zagreb-13-1920x1200.jpg',
      'https://habyland.com/wp-content/uploads/2024/12/habyland-igraonica-i-rodendani-za-djecu-zagreb-33-1920x1200.jpg',
    ],
    packages: [
      { name: 'Speedy', price: 170, minChildren: 15, includes: ['2h igranje', 'animatori', 'dekoracija', 'sokovi i snacks'] },
      { name: 'Fun Fun Funny', price: 230, minChildren: 20, includes: ['2.5h igranje', 'animatori', 'pizza', 'sokovi', 'dekoracija'] },
      { name: 'Habyland Magic', price: 350, minChildren: 25, includes: ['3h igranje', 'puni catering', 'torta', '2 animatora', 'foto rekviziti', 'dekoracija'] },
    ],
  },
  {
    id: 'igrandia',
    slug: 'igrandia-zagreb',
    name: 'iGRANDiA',
    city: 'Zagreb',
    address: 'Ulica Velimira Škorpika 11, 10090 Zagreb (Family Mall, 1. kat)',
    phone: '+385 1 353 5785',
    rating: 4.6,
    reviewCount: 1401,
    pricePerChild: 20,
    ageRange: '1.5–12',
    ageMin: 1,
    ageMax: 12,
    maxChildren: 35,
    description: '3.500 m² igraonice u Family Mallu — mega napuhanac "Kraljevstvo", 5-katna džungla s tobogānima, Sky Rider zipline, Minecraft poligon, Vodeni svijet i 10+ tematskih soba za roleplay. Besplatan parking ispred.',
    amenities: ['Parking', 'Trampolini', 'Tematske sobe', 'Animatori', 'Torta po narudžbi', 'Kafić za roditelje', 'Klima'],
    coverPhoto: 'https://igrandia.hr/wp-content/uploads/2025/07/02-Igrandia-napuhanac-e1753173406817.jpg',
    photos: [
      'https://igrandia.hr/wp-content/uploads/2024/04/07-Igrandia-bazen-s-plavim-loptama-e1753173573515.webp',
      'https://igrandia.hr/wp-content/uploads/2025/07/01-Igrandia-Minecraft-poligon-e1753173892533.webp',
      'https://igrandia.hr/wp-content/uploads/2025/12/Vodeni_svijet-465x465.jpg',
      'https://igrandia.hr/wp-content/uploads/2025/11/Pjescanik_s_mramornim_kuglicama-465x465.jpg',
    ],
    packages: [
      { name: 'Super Cool', price: 200, minChildren: 10, includes: ['2h igranje', 'animatori', 'dekoracija', 'napitak za djecu'] },
      { name: 'Kids Escape Room', price: 230, minChildren: 10, includes: ['Escape room avantura', 'igranje', 'animatori', 'catering'] },
      { name: 'Minecraft Party', price: 320, minChildren: 10, includes: ['Tematska Minecraft soba', '2.5h', 'puni catering', 'animator', 'torta po izboru'] },
    ],
  },
  {
    id: 'ententini',
    slug: 'ententini-zagreb',
    name: 'EnTenTini',
    city: 'Zagreb',
    address: 'Koledinečka ulica 5, 10000 Zagreb (Dubrava)',
    phone: '01 2912 347',
    rating: 4.6,
    reviewCount: 80,
    pricePerChild: 9,
    ageRange: '3–10',
    ageMin: 3,
    ageMax: 10,
    maxChildren: 20,
    description: 'Ugodna igraonica u Dubravi s obstacle coursem, toboganom i odvojenim prostorom za roditelje s kavom. Dva animatora uključena u svaki paket, sladoledna torta i fotografija. Odlično za mlađe predškolce.',
    amenities: ['Animatori', 'Kafić za roditelje', 'Torta po narudžbi', 'Klima', 'Svlačionice'],
    coverPhoto: 'https://ententini.hr/wp-content/uploads/2016/02/slide2-1.jpg',
    photos: [
      'https://ententini.hr/wp-content/uploads/2016/02/slide3-1.jpg',
      'https://ententini.hr/wp-content/uploads/2016/02/slide4-1.jpg',
      'https://ententini.hr/wp-content/uploads/2016/02/slide5-1.jpg',
      'https://ententini.hr/wp-content/uploads/2016/02/slide2-1.jpg',
    ],
    packages: [
      { name: 'Cool Ročkas', price: 170, minChildren: 20, includes: ['2h igranje', '2 animatora', 'sladoledna torta', 'snacks', 'fotografija', 'dekoracija'] },
      { name: 'Super Cool Ročkas', price: 200, minChildren: 20, includes: ['2h igranje', '2 animatora', 'torta', 'pizze i kolači', 'dekoracija', 'poklon vrećice'] },
      { name: 'Naj Naj Ročkas', price: 260, minChildren: 20, includes: ['2h igranje', '2 animatora', 'torta', 'catering', '4 add-ona po izboru (disco, bounce castle...)'] },
    ],
  },
  {
    id: 'time2play',
    slug: 'time2play-zagreb',
    name: 'Time2Play',
    city: 'Zagreb',
    address: 'Lanište 1e, 10020 Zagreb (Novi Zagreb)',
    phone: '095 525 2369',
    rating: 4.5,
    reviewCount: 60,
    pricePerChild: 16,
    ageRange: '3–12',
    ageMin: 3,
    ageMax: 12,
    maxChildren: 20,
    description: 'Moderna igraonica u Novom Zagrebu s PS4, VR sustavima, sportskom zonom i kreativnim radionicama. Svaki paket all-inclusive — torta, dekoracija i animatori su uvijek uključeni. WhatsApp rezervacije.',
    amenities: ['Animatori', 'Torta po narudžbi', 'PS4 i VR zone', 'Parking', 'Klima', 'Svlačionice'],
    coverPhoto: 'https://time2play.hr/images/made/images/uploads/IMG_6290_1200_800_90_s_c1.JPG',
    photos: [
      'https://time2play.hr/images/made/images/uploads/poc-igraonica_1200_800_90_s_c1.jpg',
      'https://time2play.hr/images/made/images/uploads/P2000457_1200_800_90_s_c1.JPG',
      'https://time2play.hr/images/made/images/uploads/P1990803_1200_800_90_s_c1.JPG',
      'https://time2play.hr/images/made/images/uploads/poc-igraonica_800_600_80_s_c1.jpg',
    ],
    packages: [
      { name: 'Time2Start', price: 240, minChildren: 15, includes: ['2h igranje', 'animatori', 'torta', 'dekoracija', 'napitak'] },
      { name: 'Time2Dance', price: 270, minChildren: 15, includes: ['Disco/ples tema', '2h igranje', 'animatori', 'torta', 'dekoracija'] },
      { name: 'Time2Bday', price: 280, minChildren: 15, includes: ['Tematska proslava', 'VR zona', '2h igranje', 'puni catering', 'animator'] },
    ],
  },
  {
    id: 'fijubriju',
    slug: 'fijubriju-zagreb',
    name: 'Fiju Briju',
    city: 'Zagreb',
    address: 'Ulica Hrvatskog proljeća 24, 10000 Zagreb (Dubrava)',
    phone: '091 30 777 11',
    rating: 4.7,
    reviewCount: 82,
    pricePerChild: 9,
    ageRange: '4–12',
    ageMin: 4,
    ageMax: 12,
    maxChildren: 20,
    description: 'Moderni dječji klub u Dubravi s profesionalnim osobljem, alarmnim sustavom i video nadzorom. Karaoke, bubble i fog machine, light show — i mobilna animacija za vanjska slavlja. Nude i "Fiju Briju To Go".',
    amenities: ['Animatori', 'Torta po narudžbi', 'Karaoke', 'Bubble/Fog Machine', 'Klima', 'Video nadzor', 'Wi-Fi'],
    coverPhoto: 'https://fijubriju.hr/wp-content/uploads/2020/05/Fiju-Briju1.png',
    photos: [
      'https://picsum.photos/seed/fiju1/800/500',
      'https://picsum.photos/seed/fiju2/800/500',
      'https://picsum.photos/seed/fiju3/800/500',
      'https://picsum.photos/seed/fiju4/800/500',
    ],
    packages: [
      { name: 'Tulum', price: 170, minChildren: 20, includes: ['2h igranje', '2 animatora', 'sokovi i snacks', 'dekoracija', 'karaoke', 'foto na USB'] },
      { name: 'Tulum+', price: 190, minChildren: 20, includes: ['2h igranje', '2 animatora', 'sokovi i snacks', 'dekoracija', 'karaoke', 'Ledo torta', 'foto na USB'] },
      { name: 'Tulum Maxi', price: 220, minChildren: 20, includes: ['2h igranje', '2 animatora', 'pizza', 'Ledo torta', 'dekoracija', 'karaoke', 'foto na USB'] },
    ],
  },
  {
    id: 'jumbo',
    slug: 'jumbo-igraonica-zagreb',
    name: 'Igraonica Jumbo',
    city: 'Zagreb',
    address: 'Zagrebačka avenija 94, 10010 Zagreb (Špansko)',
    phone: '098 138 0498',
    rating: 4.5,
    reviewCount: 90,
    pricePerChild: 17,
    ageRange: '5–12',
    ageMin: 5,
    ageMax: 12,
    maxChildren: 20,
    description: '750 m² igraonice u Španskom s velikim labirintom, 4 tobogana, trampolinima, Air Hockeyem, laserskim pištoljima i disco/foam partijima. Dvije privatne animacijske dvorane od 50 m². Isključivo rezervacije za rođendane.',
    amenities: ['Parking', 'Ugostiteljstvo', 'Animatori', 'Trampolini', 'Air Hockey', 'Labirinti', 'Klima'],
    coverPhoto: 'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/djecja-igraonica-jumbo-zajednicka-dvorana-labirint-1.jpg',
    photos: [
      'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/djecja-igraonica-jumbo-zajednicka-dvorana-napuhanac.jpg',
      'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/djecja-igraonica-jumbo-zajednicka-dvorana-tobogani.jpg',
      'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/djecja-igraonica-jumbo-zajednicka-dvorana-bazen-s-lopticama.jpg',
      'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/djecja-igraonica-jumbo-animacijske-dvorane-desna-1.jpg',
    ],
    packages: [
      { name: 'Standard 2h', price: 350, minChildren: 20, includes: ['2h igranje', '2 animatora', 'pizza', 'Ledo torta', 'pozivnice', 'face painting', 'foto na USB', 'poklon za slavlje'] },
      { name: 'Extended 3h', price: 390, minChildren: 20, includes: ['3h igranje (pon–pet)', '2 animatora', 'pizza', 'Ledo torta', 'pozivnice', 'face painting', 'foto na USB', 'poklon za slavlje'] },
      { name: 'Extra animator', price: 420, minChildren: 20, includes: ['2h igranje', '3 animatora', 'pizza', 'Ledo torta', 'pozivnice', 'face painting', 'foto na USB', 'poklon za slavlje'] },
    ],
  },
  {
    id: 'jungleplay2',
    slug: 'jungle-play-2-zagreb',
    name: 'Jungle Play 2',
    city: 'Zagreb',
    address: 'Zagrebačka avenija 94, 10010 Zagreb (Špansko)',
    phone: '098 138 0498',
    rating: 4.6,
    reviewCount: 75,
    pricePerChild: 17,
    ageRange: '4–12',
    ageMin: 4,
    ageMax: 12,
    maxChildren: 20,
    description: '750 m² prostora u Španskom s dva velika labirinta, 6 tobogana u bazene s lopticama, trampolinima i Air Hockeyem. Isti kompleks kao Igraonica Jumbo — mlađa djeca (od 4 god.) dobrodošla. Rezervacije 3–4 tjedna unaprijed.',
    amenities: ['Parking', 'Ugostiteljstvo', 'Animatori', 'Trampolini', 'Air Hockey', 'Labirinti', 'Klima'],
    coverPhoto: 'https://www.igraonice.hr/media/images/modules/igraonice/igraonica/original/djecija-igraonica-jungle-play-2.jpg',
    photos: [
      'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/dvorana-3-kids-club-jungle-slika-1.jpg',
      'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/dvorana-jungle-play-2-slika-10.jpg',
      'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/dvorana-jungle-play-2-slika-11.jpg',
      'https://www.igraonice.hr/media/images/modules/igraonice/galerije/original/dvorana-jungle-play-2-slika-12.jpg',
    ],
    packages: [
      { name: 'Standard 2h', price: 350, minChildren: 20, includes: ['2h igranje', '2 animatora', 'pizza', 'Ledo torta', 'pozivnice', 'face painting', 'foto na USB', 'poklon za slavlje'] },
      { name: 'Extra animator', price: 380, minChildren: 20, includes: ['2h igranje', '3 animatora', 'pizza', 'Ledo torta', 'pozivnice', 'face painting', 'foto na USB', 'poklon za slavlje'] },
      { name: 'Extra torta', price: 370, minChildren: 20, includes: ['2h igranje', '2 animatora', 'pizza', '2 Ledo torte', 'pozivnice', 'face painting', 'foto na USB', 'poklon za slavlje'] },
    ],
  },
  {
    id: 'plavisvijet',
    slug: 'plavi-svijet-zagreb',
    name: 'Plavi Svijet',
    city: 'Zagreb',
    address: 'Ulica Ede Murtića 2B, 10020 Zagreb (Središće)',
    phone: '099 868 6260',
    rating: 4.5,
    reviewCount: 55,
    pricePerChild: 23,
    ageRange: '0–12',
    ageMin: 0,
    ageMax: 12,
    maxChildren: 30,
    description: 'Kreativna igraonica kraj Muzeja suvremene umjetnosti s edukativnim igračkama, obstacle courseom i ekskluzivnim rezerviranjem cijelog prostora za goste. Poseban Baby paket za najmlađe i Teen paket od 10 godina.',
    amenities: ['Kreativne radionice', 'Animatori', 'Ekskluzivni prostor', 'Klima', 'WC za bebe', 'Kuhinja za bebe'],
    coverPhoto: 'https://plavisvijet.com/wp-content/uploads/2024/02/dan-u-igraonici-7.jpg',
    photos: [
      'https://plavisvijet.com/wp-content/uploads/2024/02/dan-u-igraonici-9.jpg',
      'https://plavisvijet.com/wp-content/uploads/2024/02/dan-u-igraonici-6.jpg',
      'https://plavisvijet.com/wp-content/uploads/2024/02/dan-u-igraonici-4.jpg',
      'https://plavisvijet.com/wp-content/uploads/2024/02/dan-u-igraonici-8.jpg',
    ],
    packages: [
      { name: 'Mini', price: 230, minChildren: 10, includes: ['2h igranje', 'animator', 'kreativne radionice', 'ekskluzivan prostor'] },
      { name: 'Midi', price: 270, minChildren: 20, includes: ['2h igranje', 'animator', 'kreativne radionice', 'ekskluzivan prostor'] },
      { name: 'Baby / Teen', price: 310, minChildren: 15, includes: ['Specijaliziran format po dobi', '2h', 'animator', 'ekskluzivan prostor', 'poklon setovi'] },
    ],
  },
]

export const testimonials: Testimonial[] = [
  {
    quote: 'Pozivnica je bila gotova dok sam čekala kavu. Kad su je roditelji dobili na WhatsApp, svi su komentirali koliko lijepo izgleda.',
    name: 'Ivana M.',
    childAge: 'Lara, 5 godina',
    city: 'Zagreb',
    monogram: 'IM',
  },
  {
    quote: 'Print verziju smo ubacili u ormariće u vrtiću, a ista pozivnica je otišla i linkom. Nema zbunjivanja, nema duplih info.',
    name: 'Ana K.',
    childAge: 'Matej, 4 godine',
    city: 'Split',
    monogram: 'AK',
  },
  {
    quote: 'Tražila sam igraonicu koja prima djecu od 3 godine i da ima parking. Našla za 5 minuta umjesto da zovem po cijelom gradu.',
    name: 'Marina P.',
    childAge: 'Noa, 3 godine',
    city: 'Rijeka',
    monogram: 'MP',
  },
]

export const faqItems: FAQItem[] = [
  {
    question: 'Je li pozivnica besplatna?',
    answer: 'Da, osnovna digitalna pozivnica je potpuno besplatna. Možeš je kreirati, podijeliti linkom i pratiti tko dolazi bez ikakve naknade. Premium teme i napredne opcije dostupne su uz simboličnu nadoplatu.',
  },
  {
    question: 'Kako gosti potvrđuju dolazak?',
    answer: 'Na digitalnoj pozivnici klikom na gumb "Dolazimo" ili "Ne možemo". Na printanoj pozivnici skeniraju QR kod koji ih vodi na istu stranicu za potvrdu. Sve potvrde vidiš na jednom mjestu u svom dashboardu.',
  },
  {
    question: 'Mogu li printati pozivnicu?',
    answer: 'Apsolutno. Svaka pozivnica koju napraviš automatski ima i PDF verziju optimiziranu za print. Samo klikni "Preuzmi PDF", isprintaj kod kuće ili u kopirnici, i podijeli u vrtiću.',
  },
  {
    question: 'Kako se plaća igraonica?',
    answer: 'Plaćanje se dogovara direktno s igraonicom. VidimoSe.hr ti pomaže pronaći i usporediti opcije, ali rezervacija i plaćanje idu kroz igraonicu. Radimo na integraciji online rezervacija.',
  },
  {
    question: 'Mogu li dodati vlastitu igraonicu?',
    answer: 'Da! Ako imaš igraonicu i želiš biti vidljiv roditeljima, javi nam se putem kontakt forme. Dodavanje je besplatno za sve igraonice u Hrvatskoj.',
  },
  {
    question: 'Radi li u cijeloj Hrvatskoj?',
    answer: 'Pozivnice rade svugdje — nema ograničenja po lokaciji. Baza igraonica trenutno pokriva veće gradove (Zagreb, Split, Rijeka, Osijek, Zadar), a aktivno dodajemo nove svaki tjedan.',
  },
]
