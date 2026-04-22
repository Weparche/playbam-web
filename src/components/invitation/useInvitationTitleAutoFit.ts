import { useLayoutEffect, type DependencyList, type RefObject } from 'react'

type FitMode = 'hero' | 'preview'

const MAX_LINES = 2
const MIN_FS = 8.5

/**
 * Naslov se može prirodno prelomiti u do 2 retka. Smanjuje font dok ukupna visina
 * ne stane u proračunatu visinu (omjer prema hero okviru ili kartici u previewu).
 */
export function useInvitationTitleAutoFit(
  titleRef: RefObject<HTMLElement | null>,
  frameRef: RefObject<HTMLElement | null> | null,
  wrapRef: RefObject<HTMLElement | null> | null,
  mode: FitMode,
  deps: DependencyList,
) {
  useLayoutEffect(() => {
    const el = titleRef.current
    if (!el) {
      return undefined
    }

    const run = () => {
      el.style.fontSize = ''
      void el.offsetHeight

      const frame = frameRef?.current
      const wrap = wrapRef?.current

      let maxBoxPx: number
      if (mode === 'hero' && frame) {
        const section = frame.closest?.('.pb-inviteHero') as HTMLElement | null
        const isBirthTab = section?.getAttribute('data-theme-tab') === 'birth'
        const isMobile = window.innerWidth <= 640
        const birthMobileBoost = isBirthTab && isMobile ? 1.3 : 1
        maxBoxPx = Math.min(frame.clientHeight * 0.3 * birthMobileBoost, 168 * birthMobileBoost)
      } else if (wrap && wrap.clientHeight > 16) {
        maxBoxPx = Math.min(wrap.clientHeight * 0.42, 112)
      } else {
        maxBoxPx = Math.min(window.innerWidth * 0.34, 104)
      }

      let fs = parseFloat(window.getComputedStyle(el).fontSize)
      let guard = 96
      while (guard-- > 0 && fs > MIN_FS) {
        const cs = window.getComputedStyle(el)
        const lhParsed = parseFloat(cs.lineHeight)
        const lh = Number.isFinite(lhParsed) && cs.lineHeight !== 'normal' ? lhParsed : fs * 1.14
        const targetMaxH = Math.min(maxBoxPx, lh * MAX_LINES * 1.12)

        const h = el.scrollHeight
        const fitsHeight = h <= targetMaxH + 2
        const fitsWidth = el.scrollWidth <= el.clientWidth + 3

        if (fitsHeight && fitsWidth) {
          break
        }

        fs -= 0.55
        el.style.fontSize = `${fs}px`
      }
    }

    run()
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes full dep list
  }, deps)
}
