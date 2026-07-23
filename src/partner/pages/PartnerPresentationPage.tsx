import PartnerIcon from '../components/ui/PartnerIcon'

const BENEFITS = [
  {
    icon: 'calendar' as const,
    title: 'Termini pod kontrolom',
    text: 'Odmah vidiš što je slobodno i izbjegavaš dogovaranje napamet.',
  },
  {
    icon: 'reservations' as const,
    title: 'Sve uz jednu rezervaciju',
    text: 'Roditelj, dijete, paket, akontacija, alergije i dodaci ostaju povezani.',
  },
  {
    icon: 'animators' as const,
    title: 'Tim zna što slijedi',
    text: 'Animator i osoblje vide svoj dio posla bez dodatnog prepričavanja.',
  },
  {
    icon: 'today' as const,
    title: 'Mirniji radni dan',
    text: 'PlayBam izdvaja što treba riješiti prije nego nastane problem.',
  },
]

const FLOW = [
  ['Upit', 'Brzo zapiši roditelja i željeni termin.'],
  ['Rezervacija', 'Potvrdi paket, datum i broj djece.'],
  ['Akontacija', 'Odmah vidi je li uplata evidentirana.'],
  ['Priprema', 'Dodijeli animatora i provjeri alergije.'],
  ['Završeno', 'Zatvori event i zadrži urednu evidenciju.'],
]

export default function PartnerPresentationPage() {
  const handlePrint = () => window.print()

  return (
    <div className="partner-presentationPage">
      <header className="partner-presentationToolbar">
        <div>
          <h1>Prezentacija za vlasnika igraonice</h1>
          <p>Kratki A4 pregled onoga što PlayBam donosi poslovanju.</p>
        </div>
        <div className="partner-presentationToolbar__actions">
          <a
            href="/partner/presentation/playbam-prezentacija-a4.pdf"
            className="pb-btn pb-btn-primary"
            download
          >
            <PartnerIcon name="presentation" size={18} />
            Preuzmi A4 PDF
          </a>
          <button type="button" className="pb-btn pb-btn-ghost" onClick={handlePrint}>
            Ispis
          </button>
        </div>
      </header>

      <div className="partner-presentationStage">
        <article className="partner-a4" aria-label="PlayBam prezentacija za vlasnike igraonica">
          <header className="partner-a4__brand">
            <img src="/logo.png" alt="VidimoSe.hr" width={1128} height={462} />
            <span>Partner za igraonice</span>
          </header>

          <section className="partner-a4__hero">
            <div>
              <p className="partner-a4__audience">Za vlasnike koji žele voditi igraonicu, a ne loviti poruke.</p>
              <h2>Manje poruka.<br />Manje propusta.<br /><strong>Više kontrole.</strong></h2>
            </div>
            <p className="partner-a4__heroText">
              PlayBam vodi svaku rezervaciju od prvog upita do završenog rođendana — jasno, na jednom mjestu i dostupno na mobitelu.
            </p>
          </section>

          <figure className="partner-a4__visual">
            <img
              src="/partner/presentation/playbam-owner-value.jpg"
              alt="Rasute poruke i papirnati kalendar prelaze u organiziran PlayBam pregled rezervacija."
              width={1600}
              height={901}
            />
          </figure>

          <section className="partner-a4__benefits" aria-labelledby="presentation-benefits">
            <div className="partner-a4__sectionTitle">
              <h3 id="presentation-benefits">Što dobivaš s PlayBamom?</h3>
              <p>Jedan operativni pregled umjesto poruka, papira i pamćenja.</p>
            </div>
            <div className="partner-a4__benefitList">
              {BENEFITS.map((benefit) => (
                <div key={benefit.title} className="partner-a4__benefit">
                  <span><PartnerIcon name={benefit.icon} size={19} /></span>
                  <div>
                    <h4>{benefit.title}</h4>
                    <p>{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="partner-a4__flow" aria-labelledby="presentation-flow">
            <div className="partner-a4__sectionTitle">
              <h3 id="presentation-flow">Jedan jasan flow za svaki rođendan</h3>
              <p>Svatko zna gdje je rezervacija i što je sljedeće.</p>
            </div>
            <ol>
              {FLOW.map(([title, text], index) => (
                <li key={title}>
                  <span>{index + 1}</span>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="partner-a4__why">
            <div>
              <h3>Zašto ga želiš uvesti?</h3>
              <ul>
                <li>brže odgovaraš roditeljima</li>
                <li>smanjuješ mogućnost dvostrukih rezervacija i zaboravljenih akontacija</li>
                <li>manje vremena trošiš na traženje informacija</li>
                <li>svaki rođendan prolazi kroz isti standard pripreme</li>
              </ul>
            </div>
            <blockquote>
              <p>PlayBam ne dodaje administraciju.</p>
              <strong>Zamjenjuje rasute poruke jednim jasnim tokom.</strong>
            </blockquote>
          </section>

          <footer className="partner-a4__footer">
            <div>
              <strong>Želiš vidjeti kako radi na tvojoj igraonici?</strong>
              <span>Prođimo zajedno jednu stvarnu rezervaciju.</span>
            </div>
            <span className="partner-a4__cta">Dogovori kratki demo</span>
          </footer>
        </article>
      </div>
    </div>
  )
}
