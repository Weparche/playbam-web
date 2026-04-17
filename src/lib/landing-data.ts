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
    id: 'imaginarium',
    slug: 'imaginarium-zagreb',
    name: 'Imaginarium',
    city: 'Zagreb',
    address: 'Folnegovićeva 7, 10000 Zagreb',
    phone: '+385 1 234 5678',
    rating: 4.9,
    reviewCount: 142,
    pricePerChild: 18,
    ageRange: '2–8',
    ageMin: 2,
    ageMax: 8,
    maxChildren: 30,
    description: 'Jedna od najvećih unutarnjih igraonica u Zagrebu s trampolinima, toboganjem, crawl tunelima i kreativnim kutkom za likovne radionice. Savršena za djecu od 2 do 8 godina.',
    amenities: ['Parking', 'Ugostiteljstvo', 'Animatori', 'Torta po narudžbi', 'Svlačionice', 'Klima', 'Wi-Fi', 'WC za bebe'],
    coverPhoto: 'https://picsum.photos/seed/imag-cover/900/500',
    photos: [
      'https://picsum.photos/seed/imag-1/800/500',
      'https://picsum.photos/seed/imag-2/800/500',
      'https://picsum.photos/seed/imag-3/800/500',
      'https://picsum.photos/seed/imag-4/800/500',
    ],
    packages: [
      { name: 'Mini paket', price: 320, minChildren: 10, includes: ['2h igranje', 'sok za svu djecu', 'stolovi i stolice'] },
      { name: 'Standard', price: 520, minChildren: 15, includes: ['2.5h igranje', 'sok + pizza', 'animator 1h', 'dekoracija balona'] },
      { name: 'Premium', price: 780, minChildren: 20, includes: ['3h igranje', 'catering po izboru', 'torta', 'animator 2h', 'foto kutić', 'dekoracija'] },
    ],
  },
  {
    id: 'bumbar',
    slug: 'bumbar-igraonica-zagreb',
    name: 'Bumbar Igraonica',
    city: 'Zagreb',
    address: 'Remetinska cesta 139a, 10000 Zagreb',
    phone: '+385 1 345 6789',
    rating: 4.7,
    reviewCount: 98,
    pricePerChild: 16,
    ageRange: '1–7',
    ageMin: 1,
    ageMax: 7,
    maxChildren: 25,
    description: 'Topla i ugodna igraonica u Remetincu, posebno prilagođena najmlađima. Mekani parkovi, bazen s lopticama i odvojena zona za bebe čine je omiljenim mjestom obitelji s malenom djecom.',
    amenities: ['Parking', 'Kuhinja za bebe', 'Dojilište', 'Klima', 'Svlačionice', 'WC za bebe', 'Torta po narudžbi'],
    coverPhoto: 'https://picsum.photos/seed/bumbar-cover/900/500',
    photos: [
      'https://picsum.photos/seed/bumbar-1/800/500',
      'https://picsum.photos/seed/bumbar-2/800/500',
      'https://picsum.photos/seed/bumbar-3/800/500',
      'https://picsum.photos/seed/bumbar-4/800/500',
    ],
    packages: [
      { name: 'Osnovni', price: 280, minChildren: 8, includes: ['2h igranje', 'voćni sok', 'stolice i stolovi'] },
      { name: 'Obiteljski', price: 440, minChildren: 12, includes: ['2.5h igranje', 'sok + sendviči', 'dekoracija', 'animator 1h'] },
      { name: 'Sve uključeno', price: 680, minChildren: 18, includes: ['3h igranje', 'puni catering', 'torta', 'animator 2h', 'poklon vrećice'] },
    ],
  },
  {
    id: 'lanterna',
    slug: 'lanterna-igraonica-zagreb',
    name: 'Lanterna',
    city: 'Zagreb',
    address: 'Maksimirska 132, 10000 Zagreb',
    phone: '+385 1 456 7890',
    rating: 4.8,
    reviewCount: 117,
    pricePerChild: 20,
    ageRange: '3–10',
    ageMin: 3,
    ageMax: 10,
    maxChildren: 35,
    description: 'Tematski uređena igraonica kraj Maksimira s pet različitih soba — piratska lađa, svemirska stanica, dvorac princeza, džungla i sportska arena. Svaka soba nudi poseban doživljaj.',
    amenities: ['Parking', 'Ugostiteljstvo', 'Animatori', 'Tematske sobe', 'Klima', 'Roštilj terasa', 'Torta po narudžbi', 'Foto zid'],
    coverPhoto: 'https://picsum.photos/seed/lant-cover/900/500',
    photos: [
      'https://picsum.photos/seed/lant-1/800/500',
      'https://picsum.photos/seed/lant-2/800/500',
      'https://picsum.photos/seed/lant-3/800/500',
      'https://picsum.photos/seed/lant-4/800/500',
    ],
    packages: [
      { name: 'Avantura', price: 360, minChildren: 10, includes: ['2h igranje', '1 tematska soba', 'sok', 'stolovi'] },
      { name: 'Istraživač', price: 580, minChildren: 15, includes: ['3h igranje', '2 tematske sobe', 'sok + hrana', 'animator 1.5h'] },
      { name: 'Junački', price: 880, minChildren: 20, includes: ['3.5h igranje', 'sve sobe', 'puni catering', 'torta', 'animator 2.5h', 'foto kutić'] },
    ],
  },
  {
    id: 'fun-planet',
    slug: 'fun-planet-zagreb',
    name: 'Fun Planet',
    city: 'Zagreb',
    address: 'Avenija Dubrovnik 16, 10000 Zagreb',
    phone: '+385 1 567 8901',
    rating: 4.6,
    reviewCount: 83,
    pricePerChild: 22,
    ageRange: '4–12',
    ageMin: 4,
    ageMax: 12,
    maxChildren: 40,
    description: 'Moderni centar za djecu školske dobi uz Aveniju Dubrovnik. Trampolinski park, laserski labirint, rock-climbing stjena i igraonice s konzolama — idealno za malo stariju djecu.',
    amenities: ['Parking', 'Kafić za roditelje', 'Klima', 'Svlačionice', 'Ugostiteljstvo', 'Wi-Fi', 'Animatori'],
    coverPhoto: 'https://picsum.photos/seed/funpl-cover/900/500',
    photos: [
      'https://picsum.photos/seed/funpl-1/800/500',
      'https://picsum.photos/seed/funpl-2/800/500',
      'https://picsum.photos/seed/funpl-3/800/500',
      'https://picsum.photos/seed/funpl-4/800/500',
    ],
    packages: [
      { name: 'Play paket', price: 400, minChildren: 12, includes: ['2h igranje', 'trampolini + labirint', 'napitak', 'stolovi'] },
      { name: 'Fun paket', price: 620, minChildren: 18, includes: ['2.5h igranje', 'sve atrakcije', 'pizza + pića', 'animator'] },
      { name: 'Planet paket', price: 950, minChildren: 25, includes: ['3h igranje', 'ekskluzivno područje', 'catering', 'torta', 'animator 2h', 'dekoracija'] },
    ],
  },
  {
    id: 'carobna-suma',
    slug: 'carobna-suma-zagreb',
    name: 'Čarobna Šuma',
    city: 'Zagreb',
    address: 'Ilica 330, 10110 Zagreb',
    phone: '+385 1 678 9012',
    rating: 4.8,
    reviewCount: 76,
    pricePerChild: 19,
    ageRange: '2–7',
    ageMin: 2,
    ageMax: 7,
    maxChildren: 20,
    description: 'Bajkovita igraonica na zapadnom dijelu Ilice s drvenom arhitekturom, mekim materijalima i prirodnim motivima. Mali prostor, veliki osjećaj — svaki detalj osmišljen s ljubavlju za malu djecu.',
    amenities: ['Parking u blizini', 'Kuhinja za bebe', 'Klima', 'WC za bebe', 'Animatori', 'Torta po narudžbi', 'Dojilište'],
    coverPhoto: 'https://picsum.photos/seed/csuma-cover/900/500',
    photos: [
      'https://picsum.photos/seed/csuma-1/800/500',
      'https://picsum.photos/seed/csuma-2/800/500',
      'https://picsum.photos/seed/csuma-3/800/500',
      'https://picsum.photos/seed/csuma-4/800/500',
    ],
    packages: [
      { name: 'Šumski piknik', price: 290, minChildren: 8, includes: ['2h igranje', 'sok i voće', 'dekoracija'] },
      { name: 'Bajka', price: 470, minChildren: 12, includes: ['2.5h igranje', 'sok + kolač', 'animator 1h', 'poklon vrećice'] },
      { name: 'Čarobna noć', price: 700, minChildren: 16, includes: ['3h igranje', 'puni catering', 'torta', 'animator 2h', 'foto rekviziti', 'dekoracija'] },
    ],
  },
  {
    id: 'mini-planet',
    slug: 'mini-planet-zagreb',
    name: 'Mini Planet',
    city: 'Zagreb',
    address: 'Savska cesta 56, 10000 Zagreb',
    phone: '+385 1 789 0123',
    rating: 4.8,
    reviewCount: 209,
    pricePerChild: 19,
    ageRange: '3–7',
    ageMin: 3,
    ageMax: 7,
    maxChildren: 28,
    description: 'Centralno smještena igraonica na Savskoj s najboljim omjerom cijena-kvaliteta u gradu. Tobogani, baloni, kreativne radionice i prostor za roditelje — sve na jednom katnom prostoru od 500 m².',
    amenities: ['Javni prijevoz', 'Ugostiteljstvo', 'Klima', 'Animatori', 'Kreativne radionice', 'Torta po narudžbi', 'Svlačionice', 'Wi-Fi'],
    coverPhoto: 'https://picsum.photos/seed/mplan-cover/900/500',
    photos: [
      'https://picsum.photos/seed/mplan-1/800/500',
      'https://picsum.photos/seed/mplan-2/800/500',
      'https://picsum.photos/seed/mplan-3/800/500',
      'https://picsum.photos/seed/mplan-4/800/500',
    ],
    packages: [
      { name: 'Starter', price: 300, minChildren: 10, includes: ['2h igranje', 'sok', 'stolovi'] },
      { name: 'Popularni', price: 490, minChildren: 14, includes: ['2.5h igranje', 'sok + pizza', 'animator 1h', 'dekoracija'] },
      { name: 'All Star', price: 750, minChildren: 20, includes: ['3h igranje', 'catering', 'torta', 'animator 2h', 'foto zid', 'dekoracija', 'poklon vrećice'] },
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
