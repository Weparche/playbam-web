import { Link } from 'react-router-dom'

import { useScrollReveal } from './useScrollReveal'

const FEATURES = [
  {
    id: 'rsvp',
    number: '01',
    title: 'Prati tko dolazi',
    text: 'Gosti potvrde u par sekundi. Ti vidiš tko dolazi, tko je u dvomislju i tko ne može.',
  },
  {
    id: 'wishlist',
    number: '02',
    title: 'Lista želja',
    text: 'Gosti rezerviraju poklon ili se prijave na grupni dar. Manje duplih igračaka, manje stresa.',
  },
  {
    id: 'chat',
    number: '03',
    title: 'Live chat',
    text: 'Poruke između tebe i gostiju s pristupom. Bez WhatsApp grupe koja pobjegne.',
  },
  {
    id: 'details',
    number: '04',
    title: 'Detalji tuluma',
    text: 'Kontakt, mobitel, parking i ostalo što ne stane na pozivnicu. Na jednom sigurnom mjestu.',
  },
] as const

function InvitationPreview() {
  return (
    <div className="ew-featuresPreview" aria-hidden="true">
      <span className="ew-featuresPreview__confetti ew-featuresPreview__confetti--one" />
      <span className="ew-featuresPreview__confetti ew-featuresPreview__confetti--two" />
      <span className="ew-featuresPreview__confetti ew-featuresPreview__confetti--three" />
      <div className="ew-featuresPreview__chrome">
        <div className="ew-featuresPreview__avatar">L</div>
        <div className="ew-featuresPreview__pass">
          <span className="ew-featuresPreview__passLabel">Party pass</span>
          <span className="ew-featuresPreview__url">vidimose.hr/p/luka-7</span>
        </div>
        <span className="ew-featuresPreview__sticker">7</span>
      </div>

      <div className="ew-featuresPreview__body">
        <div className="ew-featuresPreview__block" data-feature="rsvp">
          <p className="ew-featuresPreview__label">
            <span className="ew-featuresPreview__labelIcon">🎈</span>
            Potvrda dolaska
          </p>
          <div className="ew-featuresPreview__rsvpRow">
            <span className="ew-featuresPreview__rsvpPill is-going">🎈 Dolazimo</span>
            <span className="ew-featuresPreview__rsvpPill is-maybe">🤷 Možda</span>
            <span className="ew-featuresPreview__rsvpPill is-no">🙅 Ne dolazimo</span>
          </div>
          <p className="ew-featuresPreview__meta">
            <strong>12</strong> dolazi · <strong>3</strong> možda · <strong>2</strong> ne dolaze
          </p>
        </div>

        <div className="ew-featuresPreview__block" data-feature="wishlist">
          <p className="ew-featuresPreview__label">
            <span className="ew-featuresPreview__labelIcon">🎁</span>
            Lista želja
          </p>
          <ul className="ew-featuresPreview__wishlist">
            <li>
              <span className="ew-featuresPreview__wishIcon">🚀</span>
              <span>Lego raketa</span>
              <span className="ew-featuresPreview__tag is-free">Dostupno</span>
            </li>
            <li>
              <span className="ew-featuresPreview__wishIcon">📚</span>
              <span>Knjiga o svemiru</span>
              <span className="ew-featuresPreview__tag is-reserved">Rezervirano</span>
            </li>
            <li>
              <span className="ew-featuresPreview__wishIcon">⭐</span>
              <span>Grupni poklon</span>
              <span className="ew-featuresPreview__tag is-group">Sudjeluj</span>
            </li>
          </ul>
        </div>

        <div className="ew-featuresPreview__block" data-feature="chat">
          <p className="ew-featuresPreview__label">
            <span className="ew-featuresPreview__labelIcon">💬</span>
            Poruke
          </p>
          <div className="ew-featuresPreview__chat">
            <div className="ew-featuresPreview__chatBubble is-guest">
              <span className="ew-featuresPreview__chatWho">Ana M.</span>
              <span>Jel parking iza zgrade?</span>
            </div>
            <div className="ew-featuresPreview__chatBubble is-parent">
              <span className="ew-featuresPreview__chatWho">Mama Luka</span>
              <span>Da, ulaz B. Javim se ujutro.</span>
            </div>
          </div>
        </div>

        <div className="ew-featuresPreview__block" data-feature="details">
          <p className="ew-featuresPreview__label">
            <span className="ew-featuresPreview__labelIcon">📍</span>
            Za dan tuluma
          </p>
          <dl className="ew-featuresPreview__details">
            <div>
              <dt><span>👋</span> Kontakt</dt>
              <dd>Mama Luka</dd>
            </div>
            <div>
              <dt><span>📱</span> Mobitel</dt>
              <dd>091 234 5678</dd>
            </div>
            <div>
              <dt><span>🅿️</span> Parking</dt>
              <dd>Iza zgrade, ulaz B</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default function InvitationFeaturesSection() {
  const headerRef = useScrollReveal()
  const bodyRef = useScrollReveal()

  return (
    <section id="zajedno" className="ew-section ew-section--surface-secondary ew-features ew-grain" aria-labelledby="ew-features-heading">
      <div className="ew-container">
        <div ref={headerRef} className="ew-features__header ew-reveal">
          <div className="ew-eyebrow">Više od lijepe slike</div>
          <h2 id="ew-features-heading" className="ew-h2 ew-features__title">
            Sve na <em>jednom linku.</em>
          </h2>
          <p className="ew-features__lead">
            Pozivnica je prvi dojam. Ispod nje ide ono što roditelji stvarno trebaju: potvrde dolaska,
            lista želja, chat i praktični detalji za dan tuluma.
          </p>
        </div>

        <div ref={bodyRef} className="ew-features__body ew-reveal">
          <ol className="ew-features__list">
            {FEATURES.map((feature) => (
              <li key={feature.id} className="ew-features__item" data-feature={feature.id}>
                <span className="ew-features__number" aria-hidden="true">
                  {feature.number}
                </span>
                <div className="ew-features__itemCopy">
                  <h3 className="ew-features__itemTitle">{feature.title}</h3>
                  <p className="ew-features__itemText">{feature.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="ew-features__visual">
            <InvitationPreview />
            <p className="ew-featuresPreview__caption">
              Primjer kako izgleda tvoja stranica nakon što gosti dobiju pristup.
            </p>
          </div>
        </div>

        <div className="ew-features__footer ew-reveal">
          <p className="ew-features__privacy">
            Gosti odmah vide javni dio pozivnice. RSVP, lista želja, chat i kontakt otvaraju se nakon
            tvoje prijave i odobrenja.
          </p>
          <Link to="/kreiraj-pozivnicu" className="ew-btn-primary">
            Napravi pozivnicu
          </Link>
        </div>
      </div>
    </section>
  )
}
