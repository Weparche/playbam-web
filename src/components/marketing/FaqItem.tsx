import type { ReactNode } from 'react'

type Props = {
  question: string
  answer: ReactNode
  isOpen: boolean
  onToggle: () => void
}

export default function FaqItem({ question, answer, isOpen, onToggle }: Props) {
  return (
    <div className={['pb-faqItem', isOpen ? 'is-open' : ''].join(' ')}>
      <button className="pb-faqItem__q" type="button" onClick={onToggle}>
        <span>{question}</span>
        <span className="pb-faqItem__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div className="pb-faqItem__a" role="region" aria-hidden={isOpen ? 'false' : 'true'}>
        <div className="pb-faqItem__aInner">{answer}</div>
      </div>
    </div>
  )
}

