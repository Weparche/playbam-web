import { useEffect, useRef, useState } from 'react'

import { faqItems } from '../../lib/landing-data'
import { useScrollReveal } from './useScrollReveal'

function FAQRow({ question, answer, isOpen, onToggle, id }: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  id: string
}) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!innerRef.current) return
    const measure = () => {
      if (innerRef.current) setHeight(innerRef.current.scrollHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(innerRef.current)
    return () => ro.disconnect()
  }, [answer])

  return (
    <div className="ew-faq__item">
      <button
        className="ew-faq__question"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${id}`}
        onClick={onToggle}
      >
        <span>{question}</span>
        <svg
          className={`ew-faq__chevron${isOpen ? ' ew-faq__chevron--open' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        id={`faq-answer-${id}`}
        className="ew-faq__answer"
        role="region"
        style={{
          height: isOpen ? `${height}px` : '0px',
          transition: 'height 600ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div ref={innerRef} className="ew-faq__answer-inner">{answer}</div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const headerRef = useScrollReveal()
  const listRef = useScrollReveal()

  return (
    <section id="cesta-pitanja" className="ew-section">
      <div className="ew-container">
        <div ref={headerRef} className="ew-reveal">
          <div className="ew-eyebrow" style={{ marginBottom: 24 }}>Pitanja</div>
          <h2 className="ew-h2" style={{ maxWidth: '22ch' }}>Što roditelji najčešće pitaju.</h2>
        </div>

        <div ref={listRef} className="ew-faq__list ew-reveal">
          {faqItems.map((item, i) => (
            <FAQRow
              key={item.question}
              id={String(i)}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
