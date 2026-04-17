/* Placeholder data for VidimoSe.hr landing page */

export type InvitationTemplate = {
  id: string
  theme: string
  childName: string
  age: string
  date: string
  venue: string
  address: string
  time: string
}

export type Venue = {
  name: string
  city: string
  rating: number
  pricePerChild: number
  ageRange: string
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
    childName: 'Filip',
    age: '7',
    date: 'Subota, 14. lipnja',
    venue: 'Rocket Room',
    address: 'Avenija Dubrovnik 12, Zagreb',
    time: '14:00 — 16:30',
  },
  {
    id: 'sport',
    theme: 'Sport',
    childName: 'Petra',
    age: '6',
    date: 'Subota, 28. lipnja',
    venue: 'Arena Junior',
    address: 'Kneza Branimira 88, Split',
    time: '10:00 — 12:30',
  },
]

export const venues: Venue[] = [
  { name: 'Mini Planet', city: 'Zagreb', rating: 4.8, pricePerChild: 19, ageRange: '3–7' },
  { name: 'Rocket Room', city: 'Zagreb', rating: 4.6, pricePerChild: 23, ageRange: '4–10' },
  { name: 'Čarobni Kutak', city: 'Zagreb', rating: 4.9, pricePerChild: 22, ageRange: '2–6' },
  { name: 'Luna Park Studio', city: 'Split', rating: 4.7, pricePerChild: 17, ageRange: '3–8' },
  { name: 'Balončić', city: 'Rijeka', rating: 4.5, pricePerChild: 15, ageRange: '3–9' },
  { name: 'Veseli Zeko', city: 'Osijek', rating: 4.4, pricePerChild: 14, ageRange: '2–7' },
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
