import { Link } from 'react-router-dom'

import LegalDocLayout from '../components/landing/LegalDocLayout'

export default function TermsPage() {
  return (
    <LegalDocLayout title="Uvjeti korištenja" breadcrumbLabel="Uvjeti korištenja">
      <p className="ew-legal__updated">Zadnja izmjena: 8. svibnja 2026.</p>

      <h2 className="ew-legal__h2">1. Opći podaci</h2>
      <p>
        Ovi uvjeti reguliraju korištenje web stranice i usluga na domeni VidimoSe.hr (u daljnjem
        tekstu: &bdquo;platforma&rdquo;). Korištenjem platforme potvrđujete da ste upoznati s ovim
        uvjetima i da ih prihvaćate. Ako se ne slažete, molimo ne koristite platformu.
      </p>
      <p>
        Pružatelj platforme je obrt <strong>Nepar</strong> (digitalna rješenja i usluge), voditelj Ivan
        Gorupić — detalji u{' '}
        <Link className="ew-legal__a" to="/impressum">
          Impressumu
        </Link>
        .
      </p>

      <h2 className="ew-legal__h2">2. Opis usluge</h2>
      <p>
        VidimoSe omogućuje izradu digitalnih pozivnica za dječje proslave te povezani sadržaj (npr.
        prikaz javnog dijela pozivnice, osnovne funkcije za goste ovisno o postavkama). Sadržaj
        pozivnice (tekst, ime, datum, lokacija, teme) određuje organizator / korisnik koji kreira
        pozivnicu.
      </p>

      <h2 className="ew-legal__h2">3. Korisnički računi i sigurnost</h2>
      <p>
        Ako se prijavljujete ili stvarate račun, dužni ste unijeti točne podatke i čuvati pristupne
        podatke u povjerljivosti. Odgovorni ste za sve aktivnosti pod svojim računom, osim ako dokažete
        neovlašteni pristup izvan vaše kontrole.
      </p>

      <h2 className="ew-legal__h2">4. Zabranjeni sadržaj i postupanje</h2>
      <p>Zabranjeno je korištenje platforme za:</p>
      <ul className="ew-legal__list">
        <li>obilježavanje, uhođenje ili uznemiravanje trećih osoba;</li>
        <li>širenje nezakonitog, uvredljivog, prijevarnog ili lažnog sadržaja;</li>
        <li>pokušaj zaobilaženja sigurnosnih mjera, škodljivog softvera ili automatiziranog zlouporabe;</li>
        <li>korištenje u svrhe koje krše važeće zakone Republike Hrvatske ili EU.</li>
      </ul>
      <p>
        Pružatelj ima pravo privremeno ili trajno ograničiti ili ukinuti pristup u slučaju teškog ili
        ponovljenog kršenja ovih uvjeta.
      </p>

      <h2 className="ew-legal__h2">5. Intelektualno vlasništvo</h2>
      <p>
        Prava na platformski softver, dizajn i službene materijale ostaju kod pružatelja. Za sadržaj
        koji objavite kao korisnik zadržavate pravo vlasništva, ali pružatelju dajete neisključivu
        licencu koja je nužna za pružanje i prikaz usluge (hosting, obrada, tehnička reprodukcija u
        granicama rada sustava).
      </p>

      <h2 className="ew-legal__h2">6. Dostupnost i izmjene</h2>
      <p>
        Pružatelj teži visokoj dostupnosti, ali ne jamči neprekid ili nepostojanje grešaka.
        Zadržavamo pravo mijenjati ili ukinuti pojedine funkcije uz razumnu najavu kad je to moguće.
        O značajnim izmjenama uvjeta obavijestit ćemo prikladno na stranici ili kroz uslugu.
      </p>

      <h2 className="ew-legal__h2">7. Odgovornost</h2>
      <p>
        U maksimalnoj mjeri dopuštenoj zakonom, pružatelj nije odgovoran za neizravnu štetu ili
        izgubljenu dobit nastalu korištenjem platforme. Odgovornost za sadržaj pozivnica i događaje
        koji proizlaze iz osobnog odnosa između organizatora i gostiju u prvom redu snosi organizator.
      </p>

      <h2 className="ew-legal__h2">8. Rješavanje sporova</h2>
      <p>
        Na sve neuređeno primjenjuju se propisi Republike Hrvatske. Za potrošačke sporove moguće je
        obratiti se platformi za online rješavanje sporova Europske komisije (OS), uz postojeće
        hrvatske natpore. Parnična nadležnost, osim obveznih iznimki, je u Zagrebu.
      </p>

      <h2 className="ew-legal__h2">9. Kontakt</h2>
      <p>
        Pitanja o uvjetima:{' '}
        <a className="ew-legal__a" href="mailto:info@vidimose.hr">
          info@vidimose.hr
        </a>
        .
      </p>
    </LegalDocLayout>
  )
}
