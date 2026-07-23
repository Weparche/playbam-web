import { Link } from 'react-router-dom'

import { usePartnerAuth } from '../context/PartnerAuthContext'
import { usePartnerData } from '../context/PartnerDataContext'
import PartnerIcon, { type IconName } from '../components/ui/PartnerIcon'

type FlowStep = {
  icon: IconName
  title: string
  description: string
  action?: string
  to?: string
}

type HelpGuide = {
  icon: IconName
  title: string
  summary: string
  steps: string[]
  action?: string
  to?: string
}

const OWNER_FLOW: FlowStep[] = [
  {
    icon: 'plus',
    title: 'Upiši rezervaciju',
    description: 'Roditelj, dijete, paket i termin — dovoljno je za početak.',
    action: 'Nova rezervacija',
    to: '/partner/reservations?new=1',
  },
  {
    icon: 'check',
    title: 'Potvrdi upit',
    description: 'Provjeri detalje i potvrdi roditelju da termin vrijedi.',
    action: 'Otvori rezervacije',
    to: '/partner/reservations',
  },
  {
    icon: 'reservations',
    title: 'Evidentiraj akontaciju',
    description: 'Kad uplata sjedne, označi je plaćenom na detalju rezervacije.',
  },
  {
    icon: 'animators',
    title: 'Dodijeli animatora',
    description: 'Odaberi slobodnu osobu i potvrdi tko vodi rođendan.',
    action: 'Pregled animatora',
    to: '/partner/animators',
  },
  {
    icon: 'today',
    title: 'Pripremi i završi',
    description: 'Provjeri alergije i checklistu, a nakon eventa označi završeno.',
    action: 'Nadzorna ploča',
    to: '/partner',
  },
]

const OWNER_GUIDES: HelpGuide[] = [
  {
    icon: 'today',
    title: 'Što prvo provjeriti svaki dan?',
    summary: 'Tri kratke provjere prije nego krene gužva.',
    steps: [
      'Na Nadzornoj ploči prvo otvori stavke u bloku “Treba te”.',
      'Provjeri današnje i sutrašnje evente, posebno akontaciju, animatora i alergije.',
      'Riješi stavke redom; brojke o prihodu mogu pričekati.',
    ],
    action: 'Idi na Nadzornu ploču',
    to: '/partner',
  },
  {
    icon: 'plus',
    title: 'Kako upisati novu rezervaciju?',
    summary: 'Od poziva roditelja do spremljenog termina.',
    steps: [
      'Otvori “Nova rezervacija”. Na mobitelu koristi plutajući gumb +.',
      'Odaberi postojećeg roditelja ili upiši ime i mobitel novog roditelja.',
      'Odaberi paket, datum i slobodan termin te upiši podatke o djetetu.',
      'Dodaj tortu, balone ili napomenu. Cijena i akontacija računaju se automatski.',
    ],
    action: 'Upiši rezervaciju',
    to: '/partner/reservations?new=1',
  },
  {
    icon: 'calendar',
    title: 'Kako brzo odgovoriti: “Imate li termin?”',
    summary: 'Najbrži put do točnog slobodnog vremena.',
    steps: [
      'Otvori Kalendar i prebaci se na prikaz Dan.',
      'Odaberi datum koji roditelju odgovara i pogledaj “Slobodni termini”.',
      'Dodirni slobodan termin; nova rezervacija otvorit će se s već ispunjenim vremenom.',
    ],
    action: 'Provjeri kalendar',
    to: '/partner/calendar',
  },
  {
    icon: 'reservations',
    title: 'Gdje mijenjam status rezervacije?',
    summary: 'Detalj rezervacije uvijek predlaže sljedeću radnju.',
    steps: [
      'U Rezervacijama pronađi roditelja ili dijete i otvori detalj.',
      'Koristi glavnu ponuđenu akciju: potvrdi, označi akontaciju ili dodijeli animatora.',
      'Na mobitelu je glavna akcija uvijek dostupna u traci pri dnu zaslona.',
      'Poziv i SMS roditelju dostupni su na istom ekranu.',
    ],
    action: 'Otvori rezervacije',
    to: '/partner/reservations',
  },
  {
    icon: 'settings',
    title: 'Kako urediti ponudu i pravila?',
    summary: 'Paketi, dodaci, radno vrijeme i akontacija na jednom mjestu.',
    steps: [
      'U Paketima i Dodacima uredi što roditelj može rezervirati i po kojoj cijeni.',
      'U Animatorima održavaj dostupnost i maksimalan broj evenata po danu.',
      'U Postavkama podesi trajanje termina, pauzu za čišćenje i zadanu akontaciju.',
    ],
    action: 'Otvori postavke',
    to: '/partner/settings',
  },
]

const ANIMATOR_FLOW: FlowStep[] = [
  {
    icon: 'today',
    title: 'Provjeri event',
    description: 'Vrijeme, lokacija, broj djece, alergije i napomene.',
    action: 'Moji eventi',
    to: '/partner',
  },
  {
    icon: 'clock',
    title: 'Označi “Krećem”',
    description: 'Vlasnik odmah vidi da si na putu prema igraonici.',
  },
  {
    icon: 'check',
    title: 'Završi event',
    description: 'Nakon rođendana označi “Event završen”.',
  },
]

const ANIMATOR_GUIDES: HelpGuide[] = [
  {
    icon: 'today',
    title: 'Prije polaska',
    summary: 'Sve bitno stane u jednu kratku provjeru.',
    steps: [
      'Otvori današnji event i provjeri vrijeme, adresu i broj djece.',
      'Obavezno pročitaj alergije i posebne napomene.',
      'Kad kreneš prema igraonici, pritisni “Krećem”.',
    ],
  },
  {
    icon: 'calendar',
    title: 'Moj raspored',
    summary: 'Pregled svih dodijeljenih evenata.',
    steps: [
      'U Kalendaru prebacuj prikaz između dana, tjedna i mjeseca.',
      'Gumb “Danas” vraća te na aktualni datum.',
    ],
    action: 'Otvori kalendar',
    to: '/partner/calendar',
  },
]

function HelpFlow({ steps }: { steps: FlowStep[] }) {
  return (
    <ol className={`partner-helpFlow${steps.length <= 3 ? ' partner-helpFlow--compact' : ''}`}>
      {steps.map((step, index) => (
        <li key={step.title} className="partner-helpFlow__step">
          <div className="partner-helpFlow__marker" aria-hidden="true">
            <span>{index + 1}</span>
            <PartnerIcon name={step.icon} size={18} />
          </div>
          <div className="partner-helpFlow__body">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            {step.to && step.action ? (
              <Link to={step.to} className="partner-helpLink">
                {step.action}
                <PartnerIcon name="chevronRight" size={16} />
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

function HelpGuides({ guides }: { guides: HelpGuide[] }) {
  return (
    <div className="partner-helpGuides">
      {guides.map((guide) => (
        <details key={guide.title} className="partner-helpGuide">
          <summary>
            <span className="partner-helpGuide__icon">
              <PartnerIcon name={guide.icon} size={20} />
            </span>
            <span className="partner-helpGuide__copy">
              <strong>{guide.title}</strong>
              <small>{guide.summary}</small>
            </span>
            <span className="partner-helpGuide__chevron">
              <PartnerIcon name="chevronRight" size={18} />
            </span>
          </summary>
          <div className="partner-helpGuide__content">
            <ol>
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {guide.to && guide.action ? (
              <Link to={guide.to} className="partner-helpLink">
                {guide.action}
                <PartnerIcon name="chevronRight" size={16} />
              </Link>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  )
}

export default function PartnerHelpPage() {
  const { isAnimator } = usePartnerAuth()
  const { playroom } = usePartnerData()
  const flow = isAnimator ? ANIMATOR_FLOW : OWNER_FLOW
  const guides = isAnimator ? ANIMATOR_GUIDES : OWNER_GUIDES

  return (
    <div className="partner-helpPage">
      <header className="partner-helpHero">
        <div className="partner-helpHero__copy">
          <p className="partner-helpHero__context">{playroom.name} · {isAnimator ? 'za animatore' : 'za vlasnike igraonica'}</p>
          <h1>{isAnimator ? 'Tvoj event, bez nagađanja.' : 'Od upita do gotovog rođendana.'}</h1>
          <p>
            {isAnimator
              ? 'Provjeri detalje, javi da krećeš i zatvori event — sve na jednom mjestu.'
              : 'PlayBam te vodi kroz svaku rezervaciju. Kreni od sljedeće radnje, a detalje otvori tek kad ih zatrebaš.'}
          </p>
          {!isAnimator ? (
            <div className="partner-helpHero__actions">
              <Link to="/partner/reservations?new=1" className="pb-btn pb-btn-primary">
                <PartnerIcon name="plus" size={18} />
                Nova rezervacija
              </Link>
              <a href="#brzi-vodici" className="pb-btn pb-btn-ghost">
                Pronađi odgovor
              </a>
            </div>
          ) : null}
        </div>
        <div className="partner-helpHero__visual" aria-hidden="true">
          <img
            src="/partner/help-flow.jpg"
            alt=""
            width={1440}
            height={769}
            decoding="async"
          />
        </div>
      </header>

      <section className="partner-helpSection" aria-labelledby="help-flow-title">
        <div className="partner-helpSection__head">
          <div>
            <h2 id="help-flow-title">{isAnimator ? 'Tijek tvog eventa' : 'Tijek rezervacije'}</h2>
            <p>{isAnimator ? 'Tri koraka koja ponavljaš za svaki rođendan.' : 'Pet koraka koji drže svaki rođendan pod kontrolom.'}</p>
          </div>
        </div>
        <HelpFlow steps={flow} />
      </section>

      {!isAnimator ? (
        <aside className="partner-helpPrep" aria-labelledby="help-prep-title">
          <div className="partner-helpPrep__icon">
            <PartnerIcon name="alert" size={22} />
          </div>
          <div>
            <h2 id="help-prep-title">Prije svakog rođendana provjeri 4 stvari</h2>
            <ul>
              <li>akontacija evidentirana</li>
              <li>animator potvrđen</li>
              <li>alergije pročitane</li>
              <li>torta i dodaci spremni</li>
            </ul>
          </div>
          <Link to="/partner" className="partner-helpLink">
            Današnji eventi
            <PartnerIcon name="chevronRight" size={16} />
          </Link>
        </aside>
      ) : null}

      <section id="brzi-vodici" className="partner-helpSection" aria-labelledby="help-guides-title">
        <div className="partner-helpSection__head">
          <div>
            <h2 id="help-guides-title">Brzi vodiči</h2>
            <p>Otvori samo pitanje koje trenutno rješavaš.</p>
          </div>
        </div>
        <HelpGuides guides={guides} />
      </section>

      <section className="partner-helpSupport">
        <div>
          <h2>Trebaš još pomoći?</h2>
          <p>Javi se PlayBam timu i napiši na kojem si koraku zapeo/la.</p>
        </div>
        <Link to="/" className="pb-btn pb-btn-ghost">
          Natrag na PlayBam
        </Link>
      </section>
    </div>
  )
}
