# Final prompt za Claude Code — VidimoSe.hr landing redesign

> **Uz ovaj prompt priloži:** `hero-a-refined.html` (vizualna referenca za hero sekciju)

---

## 1. Projekt

Redizajn **isključivo landing (home) stranice** aplikacije `https://playbam-web.pages.dev/` (brand: **VidimoSe.hr**, interni naziv projekta: **PlayBam**). Platforma je za roditelje u Hrvatskoj koji organiziraju dječje rođendane.

Landing u ovoj iteraciji komunicira **dvije funkcionalnosti**:

1. **Kreiranje digitalnih i printanih pozivnica** — ista pozivnica postaje i link (WhatsApp/Viber) i PDF za printanje koji ide u vrtićki ormarić
2. **Pretraživanje igraonica** po gradu, dobi djeteta i cijeni

Sve ostalo **ne stavljati** na landing.

## 2. Ciljna publika

- Roditelji 28–45, većinom mame
- Djeca 2–12 godina
- Mobile-first (~70% prometa s mobitela)
- Traže alat koji štedi vrijeme, ne novu igračku za klinca

---

## 3. Estetska direkcija: **Editorial Warmth**

Commit je napravljen. Ne odstupaj od ove estetike.

**Inspiracija:** boutique parenting magazin (Kinfolk / Cereal / Apartamento). Rođendan kao *kulturni moment*, ne kao party-store event.

**Ključna rečenica:** *"Ono što će korisnik pamtiti je osjećaj da ovo nije napravljeno na brzinu — da je netko odabrao svaku tipografsku i bojnu odluku s namjerom."*

**Principi:**
- Smireno u strukturi, bogato u detaljima
- Velika serif tipografija kao glavni vizualni element
- Suptilni grain overlay preko toplih tonova (ne čisto bijela pozadina)
- Asimetrične kompozicije s generalno desnostranim visualom
- Italic serif za naglaske, nikad za cijeli paragraf
- Motion je sporiji i duži (1s+ tranzicije) — ne spring, ne bounce

---

## 4. Tehnički stack

- **Next.js 14+** (App Router) + **TypeScript**
- **Tailwind CSS** s custom design tokenima (NE koristi defaultne boje)
- **shadcn/ui** samo kao bazna mehanika (Dialog, Accordion, Sheet) — **svaka komponenta obavezno restilizirana**, ne smije izgledati kao default shadcn
- **Motion** (Framer Motion) za animacije
- **Lucide React** za ikone — tretiraj ih kao suptilan akcent
- **next/font** za self-hosting Google Fontova (performance)
- **Mobile-first**, breakpointi 640 / 768 / 1024 / 1280
- **Lighthouse ≥ 90**, LCP < 2.5s
- **WCAG AA**, full keyboard support, reduced-motion respect
- **SEO + Schema.org** (LocalBusiness / Event), hrvatski primarni
- **i18n-ready** (struktura spremna za engleski, ne implementiraš sad)

---

## 5. Design tokeni — koristi točno ove vrijednosti

### 5.1 Google Fonts

Uvezi sljedeći font stack (koristi `next/font/google`):

```
Fraunces (variable: opsz 9–144, wght 300–900, SOFT 0–100, italic axis)
Work Sans (variable: wght 300–700)
```

CSS varijable: `--font-fraunces`, `--font-work-sans`

**Pravila:**
- Svi naslovi (H1–H3) u Fraunces
- Body, UI elementi, eyebrow, CTA gumbi u Work Sans
- Za naglaske u naslovima koristi **italic Fraunces** s fino niskim fontVariationSettings (`"opsz" 144, "SOFT" 30–50`) i bojom `--color-accent`
- **NE koristiti** bold (700+) Fraunces nigdje — drži se weight 300–400 za display, čak i za velike H1

### 5.2 Paleta (light mode)

```css
--color-bg-primary:    #F3EDE3;  /* cream — glavna pozadina */
--color-bg-secondary:  #E8DFD0;  /* deeper cream — nakon hero, notes, alternirajuće sekcije */
--color-bg-card:       #EDE2CF;  /* card bg za invitation mockupe */
--color-bg-elevated:   #FFFFFF;  /* samo za digital preview, nigdje drugdje */

--color-text-primary:    #2B2520;  /* ink — svi naslovi i primarni text */
--color-text-secondary:  #5C4E42;  /* warm brown — body paragrafi */
--color-text-tertiary:   #8A6E52;  /* muted bronze — eyebrow, meta, captions */

--color-accent:        #A04F2B;  /* burnt sienna — italic naglasci, brojevi, highlight */
--color-accent-soft:   #C9A687;  /* clay — borderi, decor */

--color-border:        #C9A687;  /* clay borders */
--color-border-subtle: rgba(43, 37, 32, 0.08);
```

### 5.3 Paleta (dark mode)

```css
--color-bg-primary:    #1A1614;  /* deep warm charcoal */
--color-bg-secondary:  #221D18;
--color-bg-card:       #2A2520;
--color-bg-elevated:   #322A24;

--color-text-primary:    #F3EDE3;
--color-text-secondary:  #C9B8A4;
--color-text-tertiary:   #8A7A64;

--color-accent:        #D97D4A;  /* brighter sienna za kontrast */
--color-accent-soft:   #6B5942;

--color-border:        rgba(201, 166, 135, 0.25);
--color-border-subtle: rgba(243, 237, 227, 0.08);
```

Dark mode obavezan, aktivira se kroz `prefers-color-scheme` + manual toggle u navbaru (persist u localStorage).

### 5.4 Grain overlay

Svaka pozadina (light i dark) **obavezno ima suptilni SVG noise overlay**:

```css
.grain-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.14 0 0 0 0 0.12 0 0 0 0.25 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.35;
  pointer-events: none;
  mix-blend-mode: multiply;
}
```

Za dark mode promijeniti `feColorMatrix` vrijednosti tako da je šum svjetliji (dodavanje, ne multiply).

### 5.5 Tipografska skala

| Role         | Size (clamp)                    | Weight | Line-height | Letter-spacing | Font     |
|--------------|---------------------------------|--------|-------------|----------------|----------|
| H1 hero      | `clamp(48px, 6.2vw, 88px)`      | 350    | 0.98        | -0.02em        | Fraunces |
| H2 section   | `clamp(36px, 4.5vw, 56px)`      | 350    | 1.05        | -0.015em       | Fraunces |
| H3           | `clamp(24px, 2.8vw, 32px)`      | 400    | 1.15        | -0.01em        | Fraunces |
| Body large   | 19px                            | 400    | 1.55        | 0              | Work Sans|
| Body         | 16px                            | 400    | 1.65        | 0              | Work Sans|
| Eyebrow      | 12px                            | 400    | 1           | 0.24em UPPER   | Work Sans|
| Caption/meta | 13px                            | 400    | 1.5         | 0.02em         | Work Sans|

### 5.6 Spacing, radius, shadows

- **Border-radius:** namjerno skromno. `2px` za CTA gumbe i card borders. `8px` za digital preview (zbog "phone" karaktera). **NIGDJE** nemoj koristiti `rounded-xl` / `rounded-full` osim za pills (tag chipovi).
- **Shadows:** layered, topli. Primjer za kartice:
  ```
  box-shadow: 0 30px 60px -20px rgba(43,37,32,0.2), 0 4px 12px rgba(43,37,32,0.08);
  ```
  Nikad `shadow-sm/md/lg` iz Tailwinda — definiraj custom u config-u.
- **Container max-width:** 1280px s `px-6 md:px-12` padding
- **Vertikalni ritam:** velikodušan — sekcije `py-24 md:py-32`

### 5.7 Motion principi

- **Durations:** 600–1200ms (sporije od industry standarda)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` ili `ease-out`
- **Hero load:** staggered reveal — eyebrow (0ms), H1 (150ms), sub (300ms), CTAs (450ms), visual (300ms, s desne strane slide-in od 40px)
- **Scroll reveal:** opacity 0 → 1, translateY 24px → 0, 800ms, triggered pri 20% viewporta
- **Hover na kartice:** **ne** lift, umjesto toga blagi promjena boje bordera i shift content-a 2-3px
- **Reduced motion:** obavezno `prefers-reduced-motion: reduce` varijanta koja drastično skraćuje ili uklanja animacije

---

## 6. Page struktura

### 6.1 Navbar (sticky, transparent → subtle bg on scroll)

- Lijevo: **logo "VidimoSe"** u Fraunces italic, `font-weight: 500`, 22px
- Desno (desktop): `Pozivnice · Igraonice · Kako radi · Prijava` + primarni CTA `Napravi pozivnicu`
- Mobile: hamburger → full-screen sheet s istim linkovima, **Fraunces large** za menu itemse
- Na scroll > 40px: dodaj suptilni `border-bottom: 1px solid var(--color-border-subtle)` i `backdrop-filter: blur(8px)` s poluprozirnom pozadinom

### 6.2 Hero — **spec po vizualnoj referenci `hero-a-refined.html`**

Lijeva kolona (grid 1.05fr / 0.95fr, gap 80px):

- **Eyebrow** s leading crticom: `Rođendani · Bez stresa` (12px, uppercase, 0.24em letter-spacing, tertiary color)
- **H1** (ponuditi mi 3 varijante — vidi sekciju 8)
- **Subtitle** 19px, secondary color, max-width 46ch
- **Dva CTA-a:** primarni (solid dark `#2B2520`, cream text, 2px radius) + sekundarni (ghost, underline)
- **Social proof traka** 64px ispod CTA-a: *"Više od 500 roditelja · 80+ igraonica diljem Hrvatske"* u tertiary color, 13px

Desna kolona — **ključna interakcija, čitaj pažljivo:**

Dvije pozivnice preklopljene u istom visual containeru:

1. **Digitalna verzija** — "phone card" s chat headerom (avatar "M", "Maja poslala pozivnicu", "vidimose.hr/lara-6"), pozivnicom u kreminoj boji, i dva RSVP gumba ispod (`Dolazimo` / `Ne možemo`)
2. **Print verzija** — papirnata kartica s grain teksturom, blagim tiltom od -2°, sjenom pozadinske kartice koja sugerira debljinu, i QR-om/footer linijom "vidimose.hr · potvrdi dolazak"

**Interakcijska logika (OBAVEZNO):**

- **NEMA auto-rotacije.** Po defaultu vidi se digitalna verzija.
- Ispod visual containera dva interaktivna **dot-toggle gumba** s inline labelama:
  - `● Digitalno` / `○ Za print`
- **Na hover** jednog dota → preview se prebacuje na tu verziju (smooth 1s crossfade + scale 0.97→1 + translateY 8px→0)
- **Na klik** dota → lock na tu verziju (perzistira dok korisnik ne klikne drugi)
- **Caption iznad dots** se mijenja s verzijom:
  - Digitalno: *"Ovako je gosti dobivaju linkom"*
  - Print: *"Ovako ide u vrtićki ormarić"*
- **Accessibility:**
  - Dots su `<button>` elementi s `aria-pressed` i `aria-controls`
  - Caption ima `aria-live="polite"`
  - Keyboard: Tab za fokus, Enter/Space za toggle, Arrow keys za switch
  - Focus ring: 2px solid `--color-accent`, offset 4px

### 6.3 Sekcija "Isti dizajn, dva formata" (mini-notes odmah ispod hero-a)

Na `--color-bg-secondary` pozadini, s border-top u `--color-border`:

Dvije kolone (1:1 gap 48px):

- **01** (veliki Fraunces italic number 36px u accent boji) + naslov *"Isti dizajn, dva formata."* + paragraf: *"Kad napraviš pozivnicu, dobiješ link za slanje u WhatsApp grupu i PDF spreman za pisač. Bez copy-pasteanja, bez preformatiranja u Wordu. Gosti u telefonu vide isto što dijete u ormariću."*
- **02** + naslov *"Gosti potvrđuju dolazak u oba slučaja."* + paragraf: *"Na digitalnoj pozivnici klik, na printanoj QR kod. Prati tko dolazi, koliko ih je, imaju li alergija — sve na jednom mjestu."*

Ova sekcija je **esencijalna** — zadržava kontekst rotacije iz hero-a.

### 6.4 Sekcija "Kreiraj pozivnicu" (templatei)

- Asimetrični naslov H2 (poravnat lijevo, šira kolona)
- Kratki opis desno (max 2 rečenice, secondary color)
- Ispod: **galerija od 4 realistična mockup pozivnica** kao React komponente (ne lorem)
  - Teme: `Safari · Unicorn · Svemir · Sport`
  - Svaki mockup drugačiji layout, ne iste rame s različitim bojama
  - Na hover: zamjena s "print" verzijom iste teme (reafirmira dualnost)
- 3 benefit pointa (ikone 16px + sentence): *Gotova za 2 minute · Dijeli linkom · Gosti potvrđuju dolazak*
- CTA: `Isprobaj besplatno`

### 6.5 Sekcija "Pronađi igraonicu"

- H2 naslov + opis
- **Interaktivni search mockup** (funkcionalan):
  - Input za grad (s placeholder "Zagreb, Split, Rijeka...")
  - Chipovi za dob djeteta: `3–5` · `6–8` · `9–12` (toggle, multi-select)
  - Range slider za cijenu (20€ — 200€/dijete)
  - Sve se stilizira kao editorial UI, ne generic SaaS — borderi u `--color-border`, 2px radius
- **Grid 3×2 kartica igraonica** (placeholder data):
  - Slika (placeholder ilustracije ili SVG pattern, nikad stock fotka)
  - Naziv igraonice (Fraunces italic 22px)
  - Grad · rating · cijena/dijete (Work Sans 13px tertiary)
  - Hover: blagi border color shift
- CTA: `Istraži sve igraonice`

### 6.6 "Kako radi" — 3 koraka

- Veliki brojevi `01 / 02 / 03` u Fraunces italic (72px, accent color)
- Koraci: *Odaberi datum i temu · Pozovi goste linkom · Rezerviraj igraonicu*
- Među koracima — **tanka decorative crta** (dotted, accent-soft color), ne default dots

### 6.7 Testimonials

- 3 kartice u row-u (stack na mobile)
- Svaka kartica: citat u Fraunces italic 20px, autor u Work Sans 13px (ime, dob djeteta, grad)
- **Bez fotki** — koristi monogrami u krugovima (`--color-accent-soft` bg, tertiary text color, 44px)
- Kartice: `--color-bg-card` bg, 1px `--color-border`, radius 2px, padding 32px

### 6.8 FAQ (accordion)

- 5–6 pitanja:
  1. Je li pozivnica besplatna?
  2. Kako gosti potvrđuju dolazak?
  3. Mogu li printati pozivnicu?
  4. Kako se plaća igraonica?
  5. Mogu li dodati vlastitu igraonicu?
  6. Radi li u cijeloj Hrvatskoj?
- Accordion s glatkom height animacijom (Motion `height: auto` trick), 600ms ease-out
- Chevron se rotira 180° na open
- Pitanja u Fraunces 22px, odgovori u Work Sans 16px secondary

### 6.9 Finalni CTA banner

- Full-bleed sekcija, `--color-bg-primary` s pojačanim grain overlay-om
- Centriran sadržaj, max-width 720px
- **H2** u Fraunces: *"Sljedeći rođendan ne mora biti projekt."*
- Kratki sub u 19px
- Jedan CTA: `Započni besplatno`

### 6.10 Footer

- `--color-bg-secondary` bg
- 4 kolone: Logo+opis · Proizvod · Tvrtka · Pravno
- Social ikone 18px u `--color-text-tertiary`, hover na primary
- Bottom bar: © 2026 VidimoSe.hr · Hrvatska · EUR

---

## 7. Hard bans — provjeri prije predaje

- ❌ Inter, Roboto, Poppins, Space Grotesk, Montserrat — bilo gdje u kodu
- ❌ Defaultni shadcn izgled (v0 look)
- ❌ `rounded-xl`, `rounded-2xl`, `rounded-full` osim za pills
- ❌ Tailwind defaultne boje (`blue-500`, `indigo-*`, `slate-*`...) — sve mora biti kroz CSS varijable
- ❌ Stock fotografije bilo gdje
- ❌ Emojiji kao glavni vizualni element
- ❌ Auto-rotating karuseli, popup modali na load
- ❌ Parallax
- ❌ Spring animacije (`type: "spring"` u Motion) — koristi `ease-out` cubic
- ❌ `text-center` na cijelim sekcijama (osim finalni CTA banner)
- ❌ Bold tekst unutar paragrafa za naglasak — koristi italic Fraunces span

---

## 8. Prije pisanja koda — odgovori mi na ovo

**Ponudi mi 3 varijante H1 naslova na hrvatskom**, u duhu Editorial Warmth (kratko, elevated, malo poetski, ne korporativno). Polazne opcije:

1. *"Rođendan kao mali ritual."*
2. *"Jedno poslijepodne. Nebrojeno priprema. Sve na jednom mjestu."*
3. *"Lijepa pozivnica. Prava igraonica. Rođendan bez drame."*

Predloži te tri ili bolje tvoje — pa ću odabrati. Tek nakon moje potvrde kreni kodirati.

---

## 9. Output koji očekujem

1. **Kompletan Next.js projekt** (`create-next-app` init, App Router, TS)
2. **`app/page.tsx`** = landing
3. **`components/landing/`** — razdvojene komponente:
   - `Navbar.tsx` · `Hero.tsx` · `HeroInvitationPreview.tsx` (interaktivni toggle) · `DualFormatNotes.tsx` · `InvitationsSection.tsx` · `VenuesSection.tsx` · `HowItWorks.tsx` · `Testimonials.tsx` · `FAQ.tsx` · `CTABanner.tsx` · `Footer.tsx`
4. **`components/invitations/`** — 4 template mockup komponente (Safari, Unicorn, Svemir, Sport), svaka s `<InvitationDigital />` i `<InvitationPrint />` pod-varijantom
5. **`tailwind.config.ts`** s custom bojama, fontovima, shadowima, animacijama
6. **`app/globals.css`** s CSS varijablama za light + dark, grain overlay utility
7. **`lib/data.ts`** s placeholder podacima (templatei, igraonice, testimonials, FAQ)
8. **`README.md`** s:
   - Obrazloženje design direkcije
   - Paleta + tipografija (hex + font URL)
   - Build/dev instrukcije
   - Accessibility checklist

**Kod piši inkrementalno**, komponentu po komponentu. Komentiraj ključne design odluke inline. Svaku komponentu napravi i dark-mode verified prije idući dalje.

---

## 10. Pristup referenci

Priložena datoteka `hero-a-refined.html` je **vjerodostojan vizualni spec** za hero sekciju. Koristi je za:
- Točan izgled digital/print preview-a
- Točne vrijednosti shadowa, tiltova, grain intensiteta
- Tipografsku hijerarhiju u pozivnici
- Layout proporcije hero-a

**NE kopiraj CSS kao-je** — prepiši sve u Tailwind utilities + custom tokens. Ali krajnji vizualni rezultat mora izgledati identično referenci (ili bolje).

---

**Cilj:** landing koji roditelj otvori na mobitelu u metrou, u 10 sekundi razumije što platforma radi, i pritisne CTA bez friction-a. Landing koji se može pokazati dizajn direktoru boutique agencije bez stida.
