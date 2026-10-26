export const DIGITAL_CJENIK_HREF =
  'https://digitalnicjenik.nepar.hr/?utm_source=vidimose.hr&utm_medium=house_ad&utm_campaign=nepar_digitalni_cjenik&utm_content=after-cta'

export default function DigitalCjenikHouseAd() {
  return (
    <aside className="ew-house-ad" aria-label="NEPAR digitalni cjenik">
      <div className="ew-container ew-house-ad__inner">
        <div>
          <h2>NEPAR alat za poduzetnike</h2>
          <p>Objavi digitalni cjenik bez izrade novog weba.</p>
        </div>
        <a href={DIGITAL_CJENIK_HREF} target="_blank" rel="sponsored noopener">
          Provjeri opcije
          <span className="ew-sr-only"> (otvara se u novoj kartici)</span>
        </a>
      </div>
    </aside>
  )
}
