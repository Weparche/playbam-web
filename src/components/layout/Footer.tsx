export default function Footer() {
  return (
    <footer className="pb-footer">
      <div className="pb-container pb-footer__inner">
        <div className="pb-footer__brand">VidimoSe.hr</div>
        <div className="pb-footer__col">
          <div className="pb-footer__label">Kontakt</div>
          <a className="pb-footer__link" href="mailto:kontakt@vidimose.hr">
            kontakt@vidimose.hr
          </a>
        </div>
        <div className="pb-footer__col">
          <div className="pb-footer__label">Linkovi</div>
          <a className="pb-footer__link" href="#">
            Privatnost
          </a>
          <a className="pb-footer__link" href="#">
            Uvjeti korištenja
          </a>
        </div>
      </div>
    </footer>
  )
}
