import { test, expect } from '@playwright/test'

test('landing house ad links to the digital price list', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/')
  const link = page.getByRole('link', { name: /Provjeri opcije/ })
  await expect(link).toHaveCount(1)
  await expect(link).toHaveAttribute('href', 'https://digitalnicjenik.nepar.hr/?utm_source=vidimose.hr&utm_medium=house_ad&utm_campaign=nepar_digitalni_cjenik&utm_content=after-cta')
  await expect(link).toHaveAttribute('rel', 'sponsored noopener')
  const text = await page.locator('body').innerText()
  expect(text).not.toContain('39,90')
  expect(text).not.toContain('89,90')
})
