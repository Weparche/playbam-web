export default function PhoneMockup() {
  return (
    <div className="pb-phone" aria-hidden="true">
      <div className="pb-phone__frame">
        <div className="pb-phone__top">
          <div className="pb-phone__dot" />
          <div className="pb-phone__titlePill" />
        </div>

        <div className="pb-phone__screen">
          <div className="pb-phone__heroCard" />
          <div className="pb-phone__row">
            <div className="pb-phone__miniCard" />
            <div className="pb-phone__miniCard pb-phone__miniCard--accent" />
          </div>
          <div className="pb-phone__list">
            <div className="pb-phone__listItem" />
            <div className="pb-phone__listItem" />
            <div className="pb-phone__listItem pb-phone__listItem--short" />
          </div>
        </div>

        <div className="pb-phone__shine" />
      </div>
    </div>
  )
}

