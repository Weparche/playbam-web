import { Link } from 'react-router-dom'

import { usePartnerAuth } from '../context/PartnerAuthContext'
import { usePartnerData } from '../context/PartnerDataContext'
import PartnerIcon, { type IconName } from '../components/ui/PartnerIcon'

type HelpSection = {
  icon: IconName
  title: string
  steps: string[]
}

function HelpSections({ sections }: { sections: HelpSection[] }) {
  return (
    <div className="partner-help">
      {sections.map((section) => (
        <section key={section.title} className="partner-panel partner-helpCard">
          <div className="partner-helpCard__head">
            <span className="partner-helpCard__icon">
              <PartnerIcon name={section.icon} size={20} />
            </span>
            <h2 className="partner-helpCard__title">{section.title}</h2>
          </div>
          <ol className="partner-helpSteps">
            {section.steps.map((step, i) => (
              <li key={i} className="partner-helpStep">
                {step}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

const OWNER_SECTIONS: HelpSection[] = [
  {
    icon: 'today',
    title: 'Danas - tvoja polazna točka',
    steps: [
      'Blok "Treba te" prikazuje što čeka tebe: potvrde, akontacije i evente bez animatora. Klikni stavku da je odmah riješiš.',
      'Ispod je raspored za danas i sutra. Oznake na svakom redu pokazuju je li sve spremno: animator, akontacija i alergije.',
      'Brojke o prihodu i tjednu su tu samo za pregled - fokus je na onome što treba napraviti.',
    ],
  },
  {
    icon: 'plus',
    title: 'Upis nove rezervacije',
    steps: [
      'Pritisni "Nova rezervacija" (gumb u kutu ili plutajući + na mobitelu).',
      'Za novog roditelja prebaci na "Novi roditelj" i upiši samo ime i mobitel - ostalo možeš kasnije.',
      'Odaberi paket, datum i slobodan termin, upiši ime i dob djeteta te broj djece.',
      'Po želji označi dodatke (torta, baloni...) i upiši napomenu. Ukupna cijena i akontacija računaju se same.',
    ],
  },
  {
    icon: 'reservations',
    title: 'Rezervacije i detalj',
    steps: [
      'U "Rezervacije" filtriraj po statusu (čeka potvrdu, potvrđeno...) ili pretraži po roditelju i djetetu.',
      'Otvori rezervaciju za detalje. Konzola predlaže JEDNU sljedeću akciju - npr. "Potvrdi", pa "Akontacija plaćena", pa "Dodijeli animatora".',
      'Roditelja nazoveš ili pošalješ SMS jednim dodirom. Na dnu (mobitel) je traka s glavnom akcijom.',
      'Checklist pripreme i bilješke drže sve na jednom mjestu.',
    ],
  },
  {
    icon: 'calendar',
    title: 'Kalendar i dostupnost',
    steps: [
      'Prebacuj prikaz između Dan / Tjedan / Mjesec; gumb "Danas" te vraća na današnji dan.',
      'Kad te roditelj pita "imate li slobodno?", otvori Dan i pogledaj "Slobodni termini".',
      'Klik na slobodan termin otvara upis rezervacije s već ispunjenim datumom i vremenom.',
    ],
  },
  {
    icon: 'settings',
    title: 'Ponuda i postavke',
    steps: [
      'Pod "Ponuda i postavke" uređuješ pakete, dodatke, animatore i kupce - svaka izmjena je u skočnom obrascu.',
      'U Postavkama podesi trajanje slota, pauzu za čišćenje, broj paralelnih rođendana, zadanu akontaciju i valutu.',
      'Brisanje uvijek traži potvrdu, a spremanje javlja kratku poruku da je sve sačuvano.',
    ],
  },
  {
    icon: 'check',
    title: 'Tijek rezervacije ukratko',
    steps: [
      'Potvrdi novi upit.',
      'Naplati akontaciju i označi je plaćenom.',
      'Dodijeli animatora (predloženi su oni slobodni za taj termin).',
      'Nakon rođendana označi "Završeno".',
    ],
  },
]

const ANIMATOR_SECTIONS: HelpSection[] = [
  {
    icon: 'today',
    title: 'Moji eventi (Danas)',
    steps: [
      'Na početnoj vidiš svoje evente za danas: vrijeme, ime i dob djeteta, broj djece i adresu igraonice.',
      'Ako dijete ima alergije ili postoji napomena, jasno su istaknute - pročitaj ih prije dolaska.',
    ],
  },
  {
    icon: 'check',
    title: 'Tijek tvog eventa',
    steps: [
      'Kad krećeš prema igraonici, pritisni "Krećem" da vlasnik zna da si na putu.',
      'Kad rođendan završi, pritisni "Event završen".',
    ],
  },
  {
    icon: 'calendar',
    title: 'Kalendar',
    steps: [
      'U Kalendaru pregledaj svoj raspored po danu, tjednu ili mjesecu.',
      'Gumb "Danas" te uvijek vraća na današnji dan.',
    ],
  },
  {
    icon: 'settings',
    title: 'Postavke i odjava',
    steps: [
      'U Postavkama su tvoji osnovni podaci i podaci igraonice.',
      'Tu se i odjaviš kad završiš.',
    ],
  },
]

export default function PartnerHelpPage() {
  const { isAnimator } = usePartnerAuth()
  const { playroom } = usePartnerData()

  const sections = isAnimator ? ANIMATOR_SECTIONS : OWNER_SECTIONS

  return (
    <>
      <header className="partner-topbar">
        <div>
          <h1 className="partner-topbar__title">Pomoć</h1>
          <p className="partner-topbar__meta">
            {isAnimator ? 'Kratke upute za animatore' : 'Kratke upute za vlasnika'} · {playroom.name}
          </p>
        </div>
      </header>

      <p className="partner-help__lead">
        {isAnimator
          ? 'Sve što trebaš za rad na rođendanu - na jednom mjestu.'
          : 'Brzi vodič kroz svakodnevni rad u konzoli. Sve je posloženo tako da rezervaciju upišeš i središ u par dodira.'}
      </p>

      <HelpSections sections={sections} />

      <section className="partner-panel partner-helpCard">
        <div className="partner-helpCard__head">
          <span className="partner-helpCard__icon">
            <PartnerIcon name="home" size={20} />
          </span>
          <h2 className="partner-helpCard__title">Trebaš još pomoći?</h2>
        </div>
        <p className="partner-fieldHelp" style={{ marginBottom: 0 }}>
          Za dodatna pitanja javi se timu VidimoSe.hr. Možeš se uvijek{' '}
          <Link to="/" className="partner-section__link">
            vratiti na VidimoSe.hr
          </Link>
          .
        </p>
      </section>
    </>
  )
}
