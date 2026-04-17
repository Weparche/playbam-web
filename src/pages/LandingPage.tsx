import type { ReactNode } from 'react'

import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import LinkButton from '../components/ui/LinkButton'

type Step = {
  number: string
  title: string
  description: string
  icon: ReactNode
}

type InvitePreview = {
  title: string
  accent: string
  note: string
}

type VenueCard = {
  name: string
  location: string
  description: string
  age: string
  price: string
}

type ValueItem = {
  title: string
  description: string
  icon: ReactNode
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Kreiraj pozivnicu',
    description: 'Odaberi stil, unesi detalje i složi pozivnicu koja izgleda lijepo odmah na mobitelu.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5v-11Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 8h8M8 11.5h8M8 15h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Podijeli roditeljima',
    description: 'Pošalji poveznicu u nekoliko sekundi i podijeli sve bitne informacije na elegantan način.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 8a3 3 0 1 0-2.83-4H12a3 3 0 0 0 .17 1L8.5 7.1a3 3 0 0 0-1.5-.4 3 3 0 1 0 1.5 5.6l3.67 2.1A3 3 0 0 0 12 15a3 3 0 1 0 .17 1l-3.67-2.1a3 3 0 0 0 0-3.8l3.67-2.1A3 3 0 0 0 15 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Pronađi igraonicu',
    description: 'Pregledaj opcije, usporedi detalje i brzo suzi izbor na ono što stvarno odgovara vašem danu.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21s-6-3.86-6-9a6 6 0 1 1 12 0c0 5.14-6 9-6 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
]

const invitePreviews: InvitePreview[] = [
  {
    title: 'Safari party',
    accent: 'pb-homeInviteCard--sun',
    note: 'Topli tonovi, kratki unos i spremno za dijeljenje.',
  },
  {
    title: 'Mali astronauti',
    accent: 'pb-homeInviteCard--sky',
    note: 'Moderan izgled koji na mobitelu djeluje kao mini event page.',
  },
  {
    title: 'Slatki studio',
    accent: 'pb-homeInviteCard--rose',
    note: 'Nježno, veselo i dovoljno premium za roditelje koji žele uredan dojam.',
  },
]

const venueCards: VenueCard[] = [
  {
    name: 'Mini Planet',
    location: 'Zagreb, Trešnjevka',
    description: 'Svijetla igraonica s kreativnim kutcima i privatnom party zonom.',
    age: '3-7 godina',
    price: 'od 190 EUR',
  },
  {
    name: 'Rocket Room',
    location: 'Zagreb, Novi Zagreb',
    description: 'Aktivan prostor za male istraživače s animatorom i fleksibilnim terminima.',
    age: '4-9 godina',
    price: 'od 230 EUR',
  },
  {
    name: 'Luna Park Studio',
    location: 'Split, centar',
    description: 'Boutique prostor za manja slavljenja, fotogeničan i jednostavan za organizaciju.',
    age: '2-6 godina',
    price: 'od 170 EUR',
  },
]

const values: ValueItem[] = [
  {
    title: 'Sve na jednom mjestu',
    description: 'Pozivnica i pregled igraonica povezani su u isti jednostavan flow.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 8h8M8 12h5M8 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Manje stresa za roditelje',
    description: 'Odmah vidiš što možeš napraviti i gdje dalje kliknuti, bez suvišnih koraka.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21c4.97 0 9-3.58 9-8s-4.03-8-9-8-9 3.58-9 8 4.03 8 9 8Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 12.5 11 15l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Brža organizacija',
    description: 'Jasan mobile-first dizajn pomaže da sve riješiš i dok si u pokretu.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12a9 9 0 1 1-3.18-6.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Uredan i moderan dojam',
    description: 'Playbam djeluje kao suvremen proizvod kojem je lako vjerovati već u prvih par sekundi.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="m9.5 12 1.7 1.7L14.8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <span className="pb-homeEyebrow">{children}</span>
}

export default function LandingPage() {
  return (
    <>
      <a className="pb-skipLink" href="#main">
        Preskoči na sadržaj
      </a>

      <Navbar />

      <main id="main" className="pb-home">
        <section className="pb-homeHero">
          <div className="pb-container pb-homeHero__inner">
            <div className="pb-homeHero__content">
              <SectionEyebrow>Playbam za moderne dječje rođendane</SectionEyebrow>

              <h1 className="pb-homeHero__title">
                Pozivnica i idealna igraonica, bez kaosa u organizaciji.
              </h1>

              <p className="pb-homeHero__text">
                Playbam pomaže roditeljima da brzo izrade lijepu digitalnu pozivnicu i
                pregledno istraže igraonice za dječji rođendan na jednom mjestu.
              </p>

              <div className="pb-homeHero__actions">
                <LinkButton variant="amber" href="/kreiraj-pozivnicu" className="pb-homeHero__button">
                  Izradi pozivnicu
                </LinkButton>
                <LinkButton variant="primary" href="#igraonice" className="pb-homeHero__button">
                  Pretraži igraonice
                </LinkButton>
              </div>

              <div className="pb-homeHero__badges" aria-label="Glavne prednosti">
                <span className="pb-homeBadge">Brzo i jednostavno</span>
                <span className="pb-homeBadge">Moderno dijeljenje pozivnice</span>
                <span className="pb-homeBadge">Pregled igraonica na jednom mjestu</span>
              </div>
            </div>

            <div className="pb-homeHero__visual" aria-hidden="true">
              <div className="pb-homeShowcase">
                <div className="pb-homeShowcase__invite">
                  <div className="pb-homeShowcase__inviteTop">
                    <span className="pb-homeMiniPill">Nova pozivnica</span>
                    <span className="pb-homeMiniDots">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                  <div className="pb-homeShowcase__inviteBody">
                    <div className="pb-homeShowcase__inviteArt" />
                    <div className="pb-homeShowcase__inviteCard">
                      <div className="pb-homeShowcase__inviteTitle">Noina 5. proslava</div>
                      <div className="pb-homeShowcase__inviteMeta">Subota, 24. svibnja u 17:00</div>
                      <div className="pb-homeShowcase__inviteMeta">Podijeli s roditeljima u 1 kliku</div>
                    </div>
                  </div>
                </div>

                <div className="pb-homeShowcase__venue">
                  <div className="pb-homeShowcase__venueTop">
                    <span className="pb-homeMiniPill pb-homeMiniPill--soft">Top izbor</span>
                    <span className="pb-homeShowcase__price">od 190 EUR</span>
                  </div>
                  <div className="pb-homeShowcase__venueTitle">Mini Planet</div>
                  <div className="pb-homeShowcase__venueMeta">Trešnjevka • 3-7 godina</div>
                  <div className="pb-homeShowcase__venueChips">
                    <span>Privatna sala</span>
                    <span>Animator</span>
                    <span>Parking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="kako-radi" className="pb-section pb-homeSection">
          <div className="pb-container">
            <div className="pb-homeSection__head">
              <SectionEyebrow>Kako funkcionira</SectionEyebrow>
              <h2 className="pb-homeSection__title">Tri kratka koraka do mirnije organizacije</h2>
              <p className="pb-homeSection__text">
                Prvi fokus je brz: pozivnica za poslati i pregled igraonica za lakšu odluku.
              </p>
            </div>

            <div className="pb-homeSteps">
              {steps.map((step) => (
                <article key={step.number} className="pb-homeSteps__card">
                  <div className="pb-homeSteps__icon">{step.icon}</div>
                  <div className="pb-homeSteps__number">{step.number}</div>
                  <h3 className="pb-homeSteps__title">{step.title}</h3>
                  <p className="pb-homeSteps__text">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pozivnice" className="pb-section pb-homeSection pb-homeSection--warm">
          <div className="pb-container">
            <div className="pb-homeFeature">
              <div className="pb-homeFeature__copy">
                <SectionEyebrow>Pozivnice</SectionEyebrow>
                <h2 className="pb-homeSection__title">Digitalna pozivnica koja izgleda lijepo i dijeli se bez muke</h2>
                <p className="pb-homeSection__text">
                  Fokus je na brzom uređivanju, urednom prikazu na mobitelu i dojmu koji roditeljima odmah ulijeva povjerenje.
                </p>
                <div className="pb-homeFeature__list">
                  <div className="pb-homeFeature__listItem">Lijep i moderan dizajn bez prenatrpanosti</div>
                  <div className="pb-homeFeature__listItem">Brzo uređivanje ključnih detalja</div>
                  <div className="pb-homeFeature__listItem">Jednostavno dijeljenje poveznice roditeljima</div>
                </div>
                <LinkButton variant="amber" href="/kreiraj-pozivnicu" className="pb-homeFeature__cta">
                  Kreiraj svoju pozivnicu
                </LinkButton>
              </div>

              <div className="pb-homeInvites" aria-label="Primjeri pozivnica">
                {invitePreviews.map((invite) => (
                  <article key={invite.title} className={`pb-homeInviteCard ${invite.accent}`}>
                    <div className="pb-homeInviteCard__tag">Preview</div>
                    <h3 className="pb-homeInviteCard__title">{invite.title}</h3>
                    <p className="pb-homeInviteCard__note">{invite.note}</p>
                    <div className="pb-homeInviteCard__meta">
                      <span>Uredi naslov</span>
                      <span>Dodaj datum</span>
                      <span>Podijeli link</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="igraonice" className="pb-section pb-homeSection">
          <div className="pb-container">
            <div className="pb-homeFeature pb-homeFeature--reverse">
              <div className="pb-homeFeature__copy">
                <SectionEyebrow>Igraonice</SectionEyebrow>
                <h2 className="pb-homeSection__title">Pregledaj igraonice na način koji štedi vrijeme</h2>
                <p className="pb-homeSection__text">
                  Umjesto nepreglednog istraživanja, Playbam na homepageu odmah pokazuje kako će pretraga izgledati: jasno, čitko i usporedivo.
                </p>
                <div className="pb-homeFilters" aria-label="Vizualni filteri">
                  <span>Grad</span>
                  <span>Dob djeteta</span>
                  <span>Budžet</span>
                  <span>Termin</span>
                </div>
                <LinkButton variant="primary" href="#finalni-cta" className="pb-homeFeature__cta">
                  Pogledaj igraonice
                </LinkButton>
              </div>

              <div className="pb-homeVenues">
                {venueCards.map((venue) => (
                  <article key={venue.name} className="pb-homeVenueCard">
                    <div className="pb-homeVenueCard__top">
                      <div>
                        <h3 className="pb-homeVenueCard__title">{venue.name}</h3>
                        <div className="pb-homeVenueCard__location">{venue.location}</div>
                      </div>
                      <div className="pb-homeVenueCard__price">{venue.price}</div>
                    </div>
                    <p className="pb-homeVenueCard__description">{venue.description}</p>
                    <div className="pb-homeVenueCard__meta">
                      <span>{venue.age}</span>
                      <span>Kapacitet do 20 djece</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="zasto-playbam" className="pb-section pb-homeSection pb-homeSection--alt">
          <div className="pb-container">
            <div className="pb-homeSection__head">
              <SectionEyebrow>Zašto Playbam</SectionEyebrow>
              <h2 className="pb-homeSection__title">Jasno iskustvo za roditelje koji žele brzo riješiti bitno</h2>
              <p className="pb-homeSection__text">
                Nema viška blokova ni nejasnih koraka. Homepage vodi ravno prema dvije glavne stvari koje roditelj želi napraviti.
              </p>
            </div>

            <div className="pb-homeValues">
              {values.map((value) => (
                <article key={value.title} className="pb-homeValues__card">
                  <div className="pb-homeValues__icon">{value.icon}</div>
                  <h3 className="pb-homeValues__title">{value.title}</h3>
                  <p className="pb-homeValues__text">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-section pb-homeSection">
          <div className="pb-container">
            <div className="pb-homeTrust">
              <div className="pb-homeTrust__copy">
                <SectionEyebrow>Povjerenje</SectionEyebrow>
                <h2 className="pb-homeSection__title">Roditeljima treba jednostavniji početak organizacije</h2>
                <p className="pb-homeSection__text">
                  Zato homepage ne obećava previše, nego odmah pokazuje dvije najvažnije stvari: kako će izgledati pozivnica i kako će izgledati pregled igraonica.
                </p>
              </div>

              <div className="pb-homeTrust__panel">
                <div className="pb-homeTrustQuote">
                  <p>
                    “Kad je prvi ekran jasan, lakše je odlučiti što dalje. To je osjećaj koji želimo dati roditeljima čim otvore Playbam.”
                  </p>
                  <span>Neutralan trust placeholder</span>
                </div>
                <div className="pb-homeTrustStats">
                  <div className="pb-homeTrustStats__item">
                    <strong>2 glavna koraka</strong>
                    <span>Pozivnica i igraonica bez lutanja po stranici</span>
                  </div>
                  <div className="pb-homeTrustStats__item">
                    <strong>Mobile-first pristup</strong>
                    <span>Veliki CTA-i, čitke kartice i jasan vertikalni flow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="finalni-cta" className="pb-section pb-homeSection">
          <div className="pb-container">
            <div className="pb-homeFinalCta">
              <SectionEyebrow>Spremno za dalje</SectionEyebrow>
              <h2 className="pb-homeFinalCta__title">Kreni od onoga što ti sada treba</h2>
              <p className="pb-homeFinalCta__text">
                Izradi pozivnicu odmah ili prvo istraži igraonice pa odluči bez žurbe.
              </p>
              <div className="pb-homeFinalCta__actions">
                <LinkButton variant="amber" href="/kreiraj-pozivnicu" className="pb-homeHero__button">
                  Izradi pozivnicu
                </LinkButton>
                <LinkButton variant="ghost" href="#igraonice" className="pb-homeHero__button">
                  Istraži igraonice
                </LinkButton>
              </div>
            </div>
          </div>
        </section>

        <div className="pb-homeStickyBar" aria-label="Brze akcije">
          <LinkButton variant="amber" href="/kreiraj-pozivnicu" className="pb-homeStickyBar__button">
            Izradi pozivnicu
          </LinkButton>
          <LinkButton variant="primary" href="#igraonice" className="pb-homeStickyBar__button">
            Igraonice
          </LinkButton>
        </div>

        <Footer />
      </main>
    </>
  )
}
