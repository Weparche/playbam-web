export default function Footer() {
  return (
    <footer className="pb-footer" id="footer">
      <div className="pb-container pb-footer__inner">
        <div className="pb-footer__brandWrap">
          <div className="pb-footer__brand">VidimoSe</div>
          <p className="pb-footer__text">
            Jednostavniji početak organizacije dječjeg rođendana.
          </p>
        </div>

        <div className="pb-footer__col">
          <div className="pb-footer__label">Navigacija</div>
          <a className="pb-footer__link" href="/#pozivnice">
            Pozivnice
          </a>
          <a className="pb-footer__link" href="/#igraonice">
            Igraonice
          </a>
          <a className="pb-footer__link" href="/#cesta-pitanja">
            Česta pitanja
          </a>
          <a className="pb-footer__link" href="mailto:kontakt@vidimose.hr">
            Kontakt
          </a>
        </div>

        <div className="pb-footer__col">
          <div className="pb-footer__label">Pravno</div>
          <a className="pb-footer__link" href="#">
            Privatnost
          </a>
          <a className="pb-footer__link" href="#">
            Uvjeti
          </a>
        </div>
      </div>
    </footer>
  )
}
