import { useScrollReveal } from './useScrollReveal'

export default function DualFormatNotes() {
  const ref1 = useScrollReveal()
  const ref2 = useScrollReveal()

  return (
    <section className="ew-notes ew-grain">
      <div className="ew-container ew-notes__grid">
        <div ref={ref1} className="ew-reveal">
          <div className="ew-notes__number">01</div>
          <h3 className="ew-notes__title">Isti dizajn, dva formata.</h3>
          <p className="ew-notes__text">
            Kad napraviš pozivnicu, dobiješ link za slanje u WhatsApp grupu i PDF spreman za pisač.
            Bez copy-pasteanja, bez preformatiranja u Wordu. Gosti u telefonu vide isto što dijete u ormariću.
          </p>
        </div>
        <div ref={ref2} className="ew-reveal">
          <div className="ew-notes__number">02</div>
          <h3 className="ew-notes__title">Gosti potvrđuju dolazak u oba slučaja.</h3>
          <p className="ew-notes__text">
            Na digitalnoj pozivnici klik, na printanoj QR kod. Prati tko dolazi, koliko ih je,
            imaju li alergija — sve na jednom mjestu.
          </p>
        </div>
      </div>
    </section>
  )
}
