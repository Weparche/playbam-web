import { test, expect } from '@playwright/test'

import {
  buildBookingInquiryMessage,
  buildWhatsappUrl,
  normalizeWhatsappPhone,
} from '../src/components/venues/bookingInquiryUtils'

test.describe('booking inquiry utils', () => {
  test('normalizes Croatian WhatsApp numbers', () => {
    expect(normalizeWhatsappPhone('091 234 5678')).toBe('385912345678')
    expect(normalizeWhatsappPhone('+385 91 234 5678')).toBe('385912345678')
    expect(normalizeWhatsappPhone('')).toBeNull()
  })

  test('builds message without empty optional fields', () => {
    const message = buildBookingInquiryMessage({
      parentName: 'Ana',
      parentPhone: '091 111 2222',
      childName: 'Luka',
      desiredDate: '2026-06-12',
      desiredTime: 'Popodne',
      childrenCount: '12',
      packageName: 'Magic',
      theme: '',
      venueUrl: 'https://vidimose.hr/igraonice/habyland-zagreb',
    })

    expect(message).toContain('Pozdrav, šaljem upit za dječji rođendan preko VidimoSe.hr.')
    expect(message).toContain('Paket/interes: Magic')
    expect(message).not.toContain('Tema:')
    expect(message).toContain('https://vidimose.hr/igraonice/habyland-zagreb')
  })

  test('builds encoded wa.me url and handles missing phone', () => {
    const url = buildWhatsappUrl('091 234 5678', 'šaljem čisti upit')

    expect(url).toContain('https://wa.me/385912345678?text=')
    expect(url).toContain('%C5%A1aljem')
    expect(buildWhatsappUrl('', 'test')).toBeNull()
  })
})

test.describe('venue booking inquiry flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.open = (url?: string | URL) => {
        ;(window as Window & { __lastWhatsappUrl?: string }).__lastWhatsappUrl = String(url ?? '')
        return null
      }
    })
    await page.goto('/igraonice/habyland-zagreb')
  })

  test('general CTA opens modal without preselected package and validates required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Pošalji upit za rođendan' }).first().click()

    await expect(page.getByRole('dialog', { name: /Pošaljite upit za Habyland/ })).toBeVisible()
    await expect(page.getByLabel(/Paket\/interes/)).toHaveValue('')

    await page.getByRole('button', { name: 'Otvori WhatsApp upit' }).click()
    await expect(page.getByText('Upišite ime roditelja.')).toBeVisible()
  })

  test('package CTA opens modal with selected package', async ({ page }) => {
    await page.getByRole('button', { name: 'Pošalji upit za ovaj paket' }).nth(1).click()

    await expect(page.getByRole('dialog', { name: /Pošaljite upit za Habyland/ })).toBeVisible()
    await expect(page.getByLabel(/Paket\/interes/)).toHaveValue('Fun Fun Funny')
  })

  test('submits a structured WhatsApp inquiry', async ({ page }) => {
    await page.getByRole('button', { name: 'Pošalji upit za rođendan' }).first().click()

    await page.getByLabel(/Ime roditelja/).fill('Ana Horvat')
    await page.getByLabel(/Telefon roditelja/).fill('091 111 2222')
    await page.getByLabel(/Ime slavljenika/).fill('Luka')
    await page.getByLabel(/Željeni datum/).fill('2026-06-12')
    await page.getByLabel(/Okvirno vrijeme/).selectOption('Popodne')
    await page.getByLabel(/Broj djece/).fill('14')
    await page.getByLabel(/Tema rođendana/).fill('Svemir')
    await page.getByRole('button', { name: 'Otvori WhatsApp upit' }).click()

    const whatsappUrl = await page.evaluate(() => (window as Window & { __lastWhatsappUrl?: string }).__lastWhatsappUrl)
    expect(whatsappUrl).toContain('https://wa.me/38516187715?text=')
    expect(whatsappUrl).toContain('%C5%A1aljem')

    const message = new URL(whatsappUrl ?? '').searchParams.get('text') ?? ''
    expect(message).toContain('Roditelj: Ana Horvat')
    expect(message).toContain('Tema: Svemir')
    expect(message).not.toContain('Email:')
    expect(message).toContain('https://vidimose.hr/igraonice/habyland-zagreb')
  })
})
