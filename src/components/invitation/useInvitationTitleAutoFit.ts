import { useLayoutEffect, type DependencyList, type RefObject } from 'react'

import type { TitleSize } from '../create/createTypes'

type FitMode = 'hero' | 'preview'

const MAX_LINES = 2

const TITLE_SIZE_MIN_FS: Record<TitleSize, number> = {
  lg: 11.5,
  md: 10,
  sm: 8.5,
}

/** Omjer dopuštene visine okvira naslova po veličini (lg = najviše prostora). */
const TITLE_SIZE_MAX_BOX_SCALE: Record<TitleSize, number> = {
  lg: 1.14,
  md: 1,
  sm: 0.86,
}

/**
 * Naslov se može prirodno prelomiti u do 2 retka. Smanjuje font od CSS veličine (lg/md/sm)
 * dok ukupna visina ne stane u proračunatu visinu.
 */
export function useInvitationTitleAutoFit(
  titleRef: RefObject<HTMLElement | null>,
  frameRef: RefObject<HTMLElement | null> | null,
  wrapRef: RefObject<HTMLElement | null> | null,
  mode: FitMode,
  titleSize: TitleSize,
  deps: DependencyList,
) {
  useLayoutEffect(() => {
    const el = titleRef.current
    if (!el) {
      return undefined
    }

    const minFs = TITLE_SIZE_MIN_FS[titleSize] ?? 8.5
    const maxBoxScale = TITLE_SIZE_MAX_BOX_SCALE[titleSize] ?? 1

    const run = () => {
      el.style.fontSize = ''
      void el.offsetHeight

      const frame = frameRef?.current
      const wrap = wrapRef?.current

      let maxBoxPx: number
      if (mode === 'hero' && frame) {
        const section = frame.closest?.('.pb-inviteHero') as HTMLElement | null
        const isBirthTab = section?.getAttribute('data-theme-tab') === 'birth'
        const card = frame.closest?.('.pb-inviteCard--storybook') as HTMLElement | null
        const inCreatePreview = Boolean(frame.closest?.('.pb-createLivePreview'))
        const isOnLiveInvitePage =
          Boolean(card) && !inCreatePreview && Boolean(frame.closest?.('.pb-invitePage'))
        const isNarrow = window.innerWidth <= 979
        const mobileTitleBoost = isNarrow && (isBirthTab || isOnLiveInvitePage) ? 1.3 : 1
        maxBoxPx = Math.min(frame.clientHeight * 0.3 * mobileTitleBoost, 168 * mobileTitleBoost) * maxBoxScale
      } else if (wrap && wrap.clientHeight > 16) {
        maxBoxPx = Math.min(wrap.clientHeight * 0.42, 112) * maxBoxScale
      } else {
        maxBoxPx = Math.min(window.innerWidth * 0.34, 104) * maxBoxScale
      }

      let fs = parseFloat(window.getComputedStyle(el).fontSize)
      const maxFs = fs
      let guard = 96
      while (guard-- > 0 && fs > minFs) {
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

        fs -= titleSize === 'lg' ? 0.5 : titleSize === 'md' ? 0.45 : 0.38
        el.style.fontSize = `${fs}px`
      }

      if (fs < minFs) {
        fs = minFs
        el.style.fontSize = `${fs}px`
      } else if (fs > maxFs) {
        el.style.fontSize = `${maxFs}px`
      }
    }

    run()
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes full dep list
  }, [titleSize, ...deps])
}
