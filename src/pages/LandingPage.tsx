import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PhoneMockup from '../components/marketing/PhoneMockup'
import FeatureStep from '../components/marketing/FeatureStep'
import ValueCard from '../components/marketing/ValueCard'
import InvitationPreviewCard from '../components/marketing/InvitationPreviewCard'
import FaqItem from '../components/marketing/FaqItem'
import LinkButton from '../components/ui/LinkButton'

function Icon({ children }: { children: ReactNode }) {
  return (
    <div className="pb-icon" aria-hidden="true">
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = useMemo(
    () => [
      {
        q: 'Treba li aplikaciju za otvoriti pozivnicu?',
        a: (
          <>
            Ne. Gosti mogu vidjeti sve informacije iz web pozivnice, bez
            instaliranja aplikacije.
          </>
        ),
      },
      {
        q: 'Mogu li gosti potvrditi dolazak bez aplikacije?',
        a: (
          <>
            U demo verziji potvrdu simuliramo odmah na stranici. U stvarnoj
            aplikaciji potvrde se šalju kroz Playbam.
          </>
        ),
      },
      {
        q: 'Mogu li promijeniti termin?',
        a: (
          <>
            Da. Nakon što napravite rezervaciju, možete promijeniti termin
            unutar aplikacije (ovisno o dostupnosti).
          </>
        ),
      },
      {
        q: 'Kako radi rezervacija?',
        a: (
          <>
            Pronađete igraonicu, odaberete slobodan termin i pošaljete
            digitalne pozivnice gostima u par klikova.
          </>
        ),
      },
    ],
    [],
  )

  return (
    <>
      <a className="pb-skipLink" href="#main">
        Preskoči na sadržaj
      </a>

      <Navbar />

      <main id="main">
        {/* HERO */}
        <section className="pb-hero">
          <div className="pb-container pb-hero__inner">
            <div className="pb-hero__left">
              <div className="pb-hero__chipRow">
                <span className="pb-chip">
                  Playbam.hr za roditelje i dječje rođendane
                </span>
              </div>

              <h1 className="pb-hero__title">
                Rezerviraj dječji rođendan u par klikova
              </h1>

              <p className="pb-hero__subtitle">
                Igraonice, slobodni termini, paketi i digitalne pozivnice —
                sve na jednom mjestu.
              </p>

              <div className="pb-hero__ctaRow">
                <LinkButton variant="primary" href="#download">
                  Preuzmi aplikaciju
                </LinkButton>
                <LinkButton variant="ghost" href="/pozivnica-demo">
                  Pogledaj demo pozivnicu
                </LinkButton>
              </div>

              <div className="pb-hero__micro">
                Brzo rezerviraj, pošalji pozivnice i prati sve potvrde dolaska.
              </div>
            </div>

            <div className="pb-hero__right">
              <PhoneMockup />
            </div>
          </div>
        </section>

        {/* KAKO RADI */}
        <section id="kako-radi" className="pb-section">
          <div className="pb-container">
            <header className="pb-sectionHeader pb-sectionHeader--center">
              <h2 className="pb-title">Kako radi</h2>
              <p className="pb-subtitle pb-text-center">
                Tri koraka do rođendana koji teče bez stresa.
              </p>
            </header>

            <div className="pb-stepsGrid">
              <FeatureStep
                step="01"
                title="Pronađi igraonicu"
                description="U par sekundi pregledaj lokacije, pakete i dostupne opcije."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 21s-7-4.5-7-11a7 7 0 0 1 14 0c0 6.5-7 11-7 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 11.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </Icon>
                }
              />

              <FeatureStep
                step="02"
                title="Odaberi slobodan termin"
                description="Biraj datum i vrijeme, vidi pakete i potvrdi rezervaciju."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 2v4M16 2v4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3 9h18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 13h4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Icon>
                }
              />

              <FeatureStep
                step="03"
                title="Pošalji digitalnu pozivnicu gostima"
                description="Gosti dobivaju web pozivnicu i mogu potvrditi dolazak."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 7h16v14H4V7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 7l8 6 8-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 3h6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Icon>
                }
              />
            </div>
          </div>
        </section>

        {/* ŠTO DOBIVAŠ */}
        <section id="sto-dobivas" className="pb-section pb-section--alt">
          <div className="pb-container">
            <header className="pb-sectionHeader pb-sectionHeader--center">
              <h2 className="pb-title">Što dobivaš</h2>
              <p className="pb-subtitle pb-text-center">
                Sve što ti treba za organizaciju rođendana na jednom mjestu.
              </p>
            </header>

            <div className="pb-valuesGrid">
              <ValueCard
                title="Slobodni termini"
                description="Brzo provjeri dostupnost i rezerviraj bez izgubljenog vremena."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 3h10v4H7V3Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 7h14v14H5V7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 11h6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Icon>
                }
              />
              <ValueCard
                title="Cijene paketa"
                description="Transparentne cijene paketa i što dobivaš u svakom terminu."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 1v22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Icon>
                }
              />
              <ValueCard
                title="Uzrasti"
                description="Programi i paketi prilagođeni djeci različitih uzrasta."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 12c2.3 0 4-1.7 4-4S14.3 4 12 4 8 5.7 8 8s1.7 4 4 4Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M4 20c1.2-3.7 4.2-6 8-6s6.8 2.3 8 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Icon>
                }
              />
              <ValueCard
                title="Lokacija i parking"
                description="Jednostavno dođi: lokacija, upute i informacije o parkingu."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 21s-7-4.5-7-11a7 7 0 0 1 14 0c0 6.5-7 11-7 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 21h18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Icon>
                }
              />
              <ValueCard
                title="Digitalne pozivnice"
                description="Slikovita web pozivnica koja se automatski prikazuje gostima."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 6h16v16H4V6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 6l8 7 8-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Icon>
                }
              />
              <ValueCard
                title="Potvrde dolaska"
                description="Praćenje tko dolazi — da planiranje bude lakše."
                icon={
                  <Icon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6 9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Icon>
                }
              />
            </div>
          </div>
        </section>

        {/* DIGITALNE POZIVNICE */}
        <section id="digitalne-pozivnice" className="pb-section">
          <div className="pb-container">
            <div className="pb-twoCol">
              <div className="pb-twoCol__left">
                <header className="pb-sectionHeader">
                  <h2 className="pb-title">Digitalne pozivnice</h2>
                  <p className="pb-subtitle">
                    Pozvani ne trebaju imati aplikaciju. Sve informacije (datum, vrijeme,
                    lokacija i tema) vide odmah kroz web pozivnicu.
                  </p>
                </header>

                <div className="pb-bullets">
                  <div className="pb-bullet">
                    <span className="pb-bullet__dot" aria-hidden="true" />
                    Web pozivnica se otvara na mobitelu i desktopu
                  </div>
                  <div className="pb-bullet">
                    <span className="pb-bullet__dot" aria-hidden="true" />
                    Jednostavna potvrda “Dolazim / Ne dolazim”
                  </div>
                  <div className="pb-bullet">
                    <span className="pb-bullet__dot" aria-hidden="true" />
                    Karta i lokacija placeholder do završne integracije
                  </div>
                </div>

                <div className="pb-ctaRow pb-ctaRow--stack">
                  <LinkButton variant="primary" href="/pozivnica-demo">
                    Otvori demo pozivnicu
                  </LinkButton>
                  <LinkButton variant="ghost" href="#download">
                    Preuzmi aplikaciju
                  </LinkButton>
                </div>
              </div>

              <div className="pb-twoCol__right">
                <InvitationPreviewCard />
              </div>
            </div>
          </div>
        </section>

        {/* DOWNLOAD APP */}
        <section id="download" className="pb-section pb-download">
          <div className="pb-container">
            <div className="pb-download__grid">
              <div className="pb-download__left">
                <h2 className="pb-title">Preuzmi Playbam</h2>
                <p className="pb-subtitle">
                  Brza rezervacija, paketi i pozivnice u jednoj aplikaciji.
                </p>

                <div className="pb-download__badges">
                  <a
                    className="pb-storeBadge pb-storeBadge--google pb-hover"
                    href="https://play.google.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="pb-storeBadge__brand">Google Play</span>
                    <span className="pb-storeBadge__title">Preuzmi</span>
                  </a>

                  <a
                    className="pb-storeBadge pb-storeBadge--apple pb-storeBadge--disabled"
                    href="#"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="pb-storeBadge__brand">App Store</span>
                    <span className="pb-storeBadge__title">Uskoro</span>
                  </a>
                </div>

                <div className="pb-download__note">
                  U demo-u je web pozivnica dostupna i bez aplikacije.
                </div>
              </div>

              <div className="pb-download__right">
                <div className="pb-downloadCard pb-hover">
                  <div className="pb-downloadCard__top">
                    <div className="pb-downloadCard__dot" aria-hidden="true" />
                    <div className="pb-downloadCard__label">Što dobivaš odmah</div>
                  </div>
                  <div className="pb-downloadCard__list">
                    <div className="pb-downloadCard__item">Slobodni termini</div>
                    <div className="pb-downloadCard__item">Paketi po cijeni</div>
                    <div className="pb-downloadCard__item">Digitalne pozivnice</div>
                    <div className="pb-downloadCard__item">Potvrde dolaska</div>
                  </div>
                  <div className="pb-downloadCard__cta">
                    <LinkButton variant="amber" href="/pozivnica-demo">
                      Pogledaj demo pozivnicu
                    </LinkButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="pb-section pb-section--alt">
          <div className="pb-container">
            <header className="pb-sectionHeader pb-sectionHeader--center">
              <h2 className="pb-title">FAQ</h2>
              <p className="pb-subtitle pb-text-center">Brzi odgovori na najčešća pitanja.</p>
            </header>

            <div className="pb-faq">
              {faqs.map((it, idx) => (
                <FaqItem
                  key={it.q}
                  question={it.q}
                  answer={it.a}
                  isOpen={openFaq === idx}
                  onToggle={() => setOpenFaq((cur) => (cur === idx ? null : idx))}
                />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}

