import { Link } from 'react-router-dom'

import LegalDocLayout from '../components/landing/LegalDocLayout'

export default function PrivacyPage() {
  return (
    <LegalDocLayout title="Zaštita privatnosti i osobnih podataka" breadcrumbLabel="Privatnost">
      <p className="ew-legal__updated">Zadnja izmjena: 8. svibnja 2026.</p>

      <p>
        Ova politika opisuje kako obrađujemo osobne podatke u svezi s VidimoSe.hr — u skladu s{' '}
        <strong>Uredbom (EU) 2016/679</strong> (GDPR), <strong>Zakonom o provedbi Opće uredbe o
          zaštiti podataka</strong> te <strong>Zakonom o elektroničkim komunikacijama</strong> u dijelu
        koji se odnosi na kolačiće i slične tehnologije.
      </p>

      <h2 className="ew-legal__h2">1. Voditelj obrade</h2>
      <p>Voditelj obrade osobnih podataka u vezi s radom platforme VidimoSe.hr je:</p>
      <ul className="ew-legal__list">
        <li>
          <strong>Nepar — obrt za digitalna rješenja i usluge</strong>, vl. Ivan Gorupić, MBO 99267101
        </li>
        <li>
          E‑pošta obrta za pitanja o privatnosti:{' '}
          <a className="ew-legal__a" href="mailto:nepar@nepar.hr">
            nepar@nepar.hr
          </a>
        </li>
        <li>
          Opći kontakt aplikacije:{' '}
          <a className="ew-legal__a" href="mailto:info@vidimose.hr">
            info@vidimose.hr
          </a>
        </li>
      </ul>

      <h2 className="ew-legal__h2">2. Uloga organizatora i zajednička obrada</h2>
      <p>
        Kao <strong>korisnik / organizator</strong> ako unosite osobna imena ili kontakte gostiju u
        pozivnice, u odnosu prema tim osobama možete biti voditelj obrade — mi vam pružamo platformu
        te u dijelu u kojem obrađujemo podatke po vašem nalogu možemo nastupati kao izvršitelj obrade
        prema ugovoru na koji se sklapate prihvaćanjem uvjeta pružanja usluge.
      </p>

      <h2 className="ew-legal__h2">3. Kategorije osobnih podataka</h2>
      <p>Ovisno o tome što nam pružite ili što nastane korištenjem usluge, može uključivati:</p>
      <ul className="ew-legal__list">
        <li>identifikacijske i kontakt podatke (npr. e‑pošta za prijavu, ime prikaza);</li>
        <li>sadržaj pozivnica koje unesete (imena, datumi, lokacije, poruke);</li>
        <li>tehničke podatke (IP adresa, vrsta preglednika, vremenske oznake, dnevnici sigurnosti);</li>
        <li>podatke o potvrdama dolaska (RSVP) i interakcijama u okviru funkcionalnosti platforme;</li>
        <li>
          podatke povezane s kolačićima — vidi posebnu stranicu:{' '}
          <Link className="ew-legal__a" to="/kolacici">
            Kolačići
          </Link>
          .
        </li>
      </ul>

      <h2 className="ew-legal__h2">4. Svrhe i pravne osnove obrade</h2>
      <ul className="ew-legal__list">
        <li>
          <strong>Pružanje usluge</strong> — izvršenje ugovora / predugovorne radnje (čl. 6. st. 1.
          pkt b GDPR).
        </li>
        <li>
          <strong>Sigurnost, sprječavanje zlouporabe, analitika ili poboljšanje usluge</strong> gdje je
          to nužno — legitimni interes (čl. 6. st. 1. pkt f), uz proporcionalnost i, gdje je predviđeno,
          mogućnost prigovora.
        </li>
        <li>
          <strong>Marketing / analitika izvan nužnih kolačića</strong> — samo uz vašu suglasnost
          (čl. 6. st. 1. pkt a GDPR; čl. 7), npr. putem suglasnosti na banneru kad je u uporabi.
        </li>
        <li>
          <strong>Ispunjavanje zakonskih obveza</strong> (npr. računovodstvo, odgovori nadležnim
          tijelima — čl. 6. st. 1. pkt c).
        </li>
      </ul>

      <h2 className="ew-legal__h2">5. Razdoblje čuvanja</h2>
      <p>
        Podatke čuvamo dok postoji aktivni račun ili sve dok je razumno potrebno za pružanje usluge,
        pravnu zaštitu, dokaz ili dok ne zatražite brisanje, osim ako zakon propisuje dulji rok — npr.
        računovodstveni dokumenti.
      </p>

      <h2 className="ew-legal__h2">6. Prijenos izvan EGP-a</h2>
      <p>
        Ako koristimo pružatelje iz trećih zemalja (npr. oblak), primjenjujemo odgovarajuće zaštitne
        mjere iz čl. 46. GDPR-a (npr. standardne ugovorne klauzule) ili druge mehanizme koje zakon
        dopušta.
      </p>

      <h2 className="ew-legal__h2">7. Vaša prava</h2>
      <p>Imate pravo:</p>
      <ul className="ew-legal__list">
        <li>pristupa podacima o vama,</li>
        <li>ispravka i dopune,</li>
        <li>brisanja (&bdquo;pravo na zaborav&rdquo;), uz zakonske iznimke,</li>
        <li>ograničenje obrade,</li>
        <li>podnošenje pritužbe nadzornom tijelu,</li>
        <li>prenosivosti gdje primjenjivo,</li>
        <li>prigovora na obradu temeljenu na legitimnom interesu,</li>
        <li>povući pristanak kad je obrada na pristanku.</li>
      </ul>
      <p>
        Zamolbe možete uputiti na e‑poštne adrese voditelja. Imate pravo podnijeti pritužbu Agenciji
        za zaštitu osobnih podataka (AZOP), Zagreb.
      </p>

      <h2 className="ew-legal__h2">8. Zaštita podataka mladih</h2>
      <p>
        Usluga je namijenjena roditeljima i skrbnicima kao korisnicima koji organiziraju djeću
        proslave. Nemamo namjeru obrađivati podatke djece izravno u marketinškoj svrhi; ako smatrate da
        je došlo do prikupljanja koje krši ovo načelo, javite nam se.
      </p>

      <h2 className="ew-legal__h2">9. Kontakt za zaštitu podataka</h2>
      <p>Za sve upite o obradi osobnih podataka:</p>
      <ul className="ew-legal__list">
        <li>
          <a className="ew-legal__a" href="mailto:nepar@nepar.hr">
            nepar@nepar.hr
          </a>
        </li>
      </ul>
    </LegalDocLayout>
  )
}
