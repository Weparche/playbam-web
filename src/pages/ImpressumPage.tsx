import { Link } from 'react-router-dom'

import LegalDocLayout from '../components/landing/LegalDocLayout'

export default function ImpressumPage() {
  return (
    <LegalDocLayout title="Impressum" breadcrumbLabel="Impressum">
      <p className="ew-legal__updated">Zadnja izmjena: 8. svibnja 2026.</p>

      <h2 className="ew-legal__h2">Pružatelj usluge i operater stranice</h2>
      <p>
        Internetska stranica i usluga <strong>VidimoSe.hr</strong> u vlasništvu su i pod operativnim
        upravljanjem obrta:
      </p>
      <ul className="ew-legal__list">
        <li>
          <strong>Nepar — obrt za digitalna rješenja i usluge</strong>
        </li>
        <li>vl. Ivan Gorupić</li>
        <li>
          MB obrta (MBO): <strong>99267101</strong>
        </li>
        <li>
          Kontakt obrta — e‑pošta:{' '}
          <a className="ew-legal__a" href="mailto:nepar@nepar.hr">
            nepar@nepar.hr
          </a>
        </li>
        <li>
          Web obrta:{' '}
          <a className="ew-legal__a" href="https://nepar.hr" target="_blank" rel="noopener noreferrer">
            nepar.hr
          </a>
        </li>
      </ul>
      <p>
        Sjedište / poslovni podaci dostupni su u nadležnim obrtnim registrima ili na pisani zahtjev —
        sve na što ste zakonski ovlašteni dobije se putem obrtnog kontakta.
      </p>

      <h2 className="ew-legal__h2">Kontakt za korisničku podršku (VidimoSe)</h2>
      <p>
        Za pitanja vezana uz korištenje platforme VidimoSe (pozivnice, račun, funkcionalnosti)
        koristite:{' '}
        <a className="ew-legal__a" href="mailto:info@vidimose.hr">
          info@vidimose.hr
        </a>
        .
      </p>

      <h2 className="ew-legal__h2">Nadležnosti u području informacijskog društva</h2>
      <p>
        U skladu s propisima Republike Hrvatske o pružanju usluga informacijskog društva, za sadržaj
        koji korisnici sami unose (npr. tekst pozivnice, podaci o događaju) odgovoran je korisnik —
        pružatelj platforme djeluje kao posrednik u smislu primjene relevantnih propisa, uz obvezu
        uklanjanja ili ograničavanja sadržaja kad je to zakonski propisano.
      </p>

      <h2 className="ew-legal__h2">Intelektualno vlasništvo</h2>
      <p>
        Elementi dizajna, logotip, tekstovi i programski kod stranice VidimoSe.hr zaštićeni su
        autorskim pravima i drugim pravima intelektualnog vlasništva, osim gdje je drukčije navedeno.
        Zabranjena je neovlaštena reprodukcija ili komercijalna uporaba bez pisanog dopuštenja nositelja
        prava.
      </p>

      <p className="ew-legal__note">
        Detaljnije pravne napomene:{' '}
        <Link className="ew-legal__a" to="/uvjeti-koristenja">
          Uvjeti korištenja
        </Link>{' '}
        ·{' '}
        <Link className="ew-legal__a" to="/privatnost">
          Zaštita privatnosti
        </Link>{' '}
        ·{' '}
        <Link className="ew-legal__a" to="/kolacici">
          Politika kolačića
        </Link>
        .
      </p>
    </LegalDocLayout>
  )
}
