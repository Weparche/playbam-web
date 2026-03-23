import Navbar from '../components/layout/Navbar'
import InvitationCard from '../components/invitation/InvitationCard'
import Card from '../components/ui/Card'
import LinkButton from '../components/ui/LinkButton'

export default function InvitationDemoPage() {
  return (
    <>
      <Navbar />

      <main className="pb-main pb-main--demo">
        <div className="pb-container">
          <div className="pb-backRow">
            <a className="pb-backLink" href="/">
              ← Nazad na Playbam.hr
            </a>
          </div>

          <Card className="pb-fallbackCard" hover>
            <div className="pb-fallbackCard__inner">
              <div className="pb-fallbackCard__title">Nemaš aplikaciju? Sve informacije vidi ovdje.</div>
              <div className="pb-fallbackCard__ctaRow">
                <LinkButton
                  variant="primary"
                  href="#download"
                  className="pb-fallbackCard__cta"
                >
                  Preuzmi aplikaciju
                </LinkButton>
                <LinkButton
                  variant="ghost"
                  href="/"
                  className="pb-fallbackCard__cta pb-fallbackCard__cta--ghost"
                >
                  Pogledaj landing
                </LinkButton>
              </div>
            </div>
          </Card>

          <InvitationCard />
        </div>
      </main>

      <footer className="pb-footer">
        <div className="pb-container pb-footer__inner">
          <div className="pb-footer__brand">Playbam.hr</div>
          <div className="pb-footer__col">
            <div className="pb-footer__label">Kontakt</div>
            <a className="pb-footer__link" href="mailto:kontakt@playbam.hr">
              kontakt@playbam.hr
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
    </>
  )
}

