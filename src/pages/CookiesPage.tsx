import { Link } from 'react-router-dom'

import LegalDocLayout from '../components/landing/LegalDocLayout'

export default function CookiesPage() {
  return (
    <LegalDocLayout title="Politika kolačića" breadcrumbLabel="Kolačići">
      <p className="ew-legal__updated">Zadnja izmjena: 8. svibnja 2026.</p>

      <p>
        Ova stranica objašnjava kako VidimoSe.hr koristi kolačiće i slične tehnologije (lokalnu
        pohranu, piksele) u skladu s <strong>Zakonom o elektroničkim komunikacijama</strong> i GDPR-om.
      </p>

      <h2 className="ew-legal__h2">Što su kolačići</h2>
      <p>
        Kolačići su male datoteke koje se spremaju na vaš uređaj kad posjetite stranicu. Omogućuju
        prepoznavanje preglednika, pamćenje postavki i — uz suglasnost — statistiku ili marketing.
      </p>

      <h2 className="ew-legal__h2">Koje kolačiće koristimo</h2>
      <h3 className="ew-legal__h3">Strogo nužni</h3>
      <p>
        Potrebni su za osnovno funkcioniranje (npr. sigurnosna sesija, spremanje jezika ili
        postavki suglasnosti, zaštita od napada). Prema hrvatskom zakonodavstvu ne zahtijevaju posebnu
        suglasnost korisnika.
      </p>
      <h3 className="ew-legal__h3">Funkcionalni</h3>
      <p>
        Poboljšavaju iskustvo (npr. pamćenje odabira u sučelju). Uključuju se samo ako su za to
        predviđeni i gdje je primjenjivo — na temelju legitimnog interesa ili suglasnosti, ovisno o
        implementaciji.
      </p>
      <h3 className="ew-legal__h3">Analitika i treće strane</h3>
      <p>
        Ako uvedemo alate trećih strana (npr. anonimizirana web analitika ili ugrađene karte), ovdje će
        biti ažurirana tablica s nazivom, svrhom i trajanjem. Do tada se oslanjamo na nužne kolačiće i
        podatke koje sami unesete u obrascima.
      </p>

      <h2 className="ew-legal__h2">Upravljanje suglasnostima</h2>
      <p>
        Prilikom prvog posjeta možete prihvatiti ili odbiti neobavezne kolačiće putem bannera (kad je
        aktivan). Postavke možete promijeniti brisanjem kolačića preglednika ili u postavkama stranice
        ako nudimo link &bdquo;Postavke kolačića&rdquo;.
      </p>

      <h2 className="ew-legal__h2">Kako onemogućiti kolačiće u pregledniku</h2>
      <p>
        Većina preglednika omogućuje blokiranje ili brisanje kolačića u izborniku privatnosti.
        Napominjemo da nužni kolačići često omogućuju prijavu i osnovne funkcije — bez njih dijelovi
        usluge možda neće raditi.
      </p>

      <h2 className="ew-legal__h2">Osobni podaci i privatnost</h2>
      <p>
        Detalji o obradi osobnih podataka:{' '}
        <Link className="ew-legal__a" to="/privatnost">
          Zaštita privatnosti
        </Link>
        .
      </p>

      <h2 className="ew-legal__h2">Kontakt</h2>
      <p>
        Pitanja o kolačićima:{' '}
        <a className="ew-legal__a" href="mailto:info@vidimose.hr">
          info@vidimose.hr
        </a>{' '}
        ili{' '}
        <a className="ew-legal__a" href="mailto:nepar@nepar.hr">
          nepar@nepar.hr
        </a>
        .
      </p>
    </LegalDocLayout>
  )
}
