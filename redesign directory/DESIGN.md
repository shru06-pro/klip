---
name: Editorial Pastel Utility
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e5'
  on-surface: '#1b1b1e'
  on-surface-variant: '#48454e'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#79757f'
  outline-variant: '#cac4cf'
  surface-tint: '#635885'
  primary: '#605583'
  on-primary: '#ffffff'
  primary-container: '#796e9d'
  on-primary-container: '#fffbff'
  inverse-primary: '#cdbff3'
  secondary: '#63568e'
  on-secondary: '#ffffff'
  secondary-container: '#cdbefd'
  on-secondary-container: '#564a81'
  tertiary: '#5c5b65'
  on-tertiary: '#ffffff'
  tertiary-container: '#75737e'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cdbff3'
  on-primary-fixed: '#1f143e'
  on-primary-fixed-variant: '#4b406c'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#cdbefd'
  on-secondary-fixed: '#1e1146'
  on-secondary-fixed-variant: '#4a3e74'
  tertiary-fixed: '#e4e1ed'
  tertiary-fixed-dim: '#c8c5d1'
  on-tertiary-fixed: '#1b1b24'
  on-tertiary-fixed-variant: '#474650'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e5'
typography:
  display-hero:
    fontFamily: Newsreader
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-italic:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-base:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-medium:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-eyebrow:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.2em
  code-link:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system reimagines the utilitarian link shortener as an intimate, editorial stationery object. It rejects the hyper-sterilized, aggressive dashboard aesthetic of legacy utilities in favor of tactile calm, literary elegance, and understated playfulness. 

The emotional signature is intentional, serene, and warm: the interface feels like personal stationery, high-end independent publishing, or a boutique physical desk space. The aesthetic leans into a hybrid of warm minimalism and soft editorial tactile design—pairing literary serif typography with smooth pill shapes, airy whitespace, and delicate lavender accents. Interactions must feel silent, graceful, and satisfying, emphasizing micro-delight over noise.

## Colors

The palette relies on warm natural surfaces, soft lilac undertones, and warm deep graphite typography. High-contrast pure black and sterile blue-tinted whites are strictly avoided.

- **Canvas & Surface:**
  - Base Background (`#F8F6F2`): A soft, unbleached linen canvas that anchors all views.
  - Surface (`#FFFFFF`): Elevated floating islands, input capsules, and modular cards.
- **Typography & Boundaries:**
  - Ink (`#27272A`): Deep slate-graphite for primary text and dominant icon states.
  - Muted Text (`#6B6B73`): Subdued gray with warm undertones for metadata, subcopy, and inactive icons.
  - Border Hairline (`#E7E4DE`): Gentle structural dividers and pill borders that soften the container bounds.
- **Accent Suite:**
  - Primary Lavender (`#8478A8`): Main CTAs, active highlights, key metrics, and brand anchor points.
  - Lavender Soft (`#A99BD8`): Interactive hover states, subtle gradient stops, and secondary focal elements.
  - Lavender Tint (`#EEEAF7`): Selection fills, chip backgrounds, and pill hover highlights.
- **Functional Semantics:**
  - Success / Active (`#7C9A85`): Muted sage for copied confirmations, active redirects, and positive health metrics.
  - Danger / Deletion (`#C97B84`): Dusty blush-rose for destructive prompts, expiration alerts, and error indicators.

## Typography

Typography drives the editorial tension between humanistic literature and precision utility:

- **Editorial Headlines (`Newsreader`):** Used with generous line height and optical sizing. Incorporate italic weights selectively on hero terms, evocative statements, or key brand claims to produce an intimate, literary atmosphere.
- **Interface Structure (`DM Sans`):** Clean, geometric, low-contrast grotesque for input values, descriptions, tooltips, and data labels. Ensures swift visual processing across mobile and desktop.
- **Technical Precision (`JetBrains Mono`):** Applied to the shortened links themselves, analytics metrics, timestamps, and section eyebrows. Eyebrow headers must always be transformed to full uppercase with `0.2em` tracking.

## Layout & Spacing

The layout is anchored around centered, calm compositions with an 8-point baseline rhythm and wide breathing margins:

- **Grid Architecture:** Desktop views use an asymmetrical 12-column fluid grid constrained to a maximum content width of `1120px` to maintain an intimate scale. Tablet uses 8 columns, and mobile uses a single-column stack.
- **Hero Staging:** The primary URL input functions as a standalone, centered centerpiece with generous top and bottom margins, ensuring immediate visual focus without visual clutter.
- **Rhythm & Whitespace:** Generous vertical intervals (`space-xl` and above) are used between content blocks to maintain an uncluttered, boutique feel.

## Elevation & Depth

Depth is established through soft ambient diffusion rather than harsh drop shadows or dense stacking:

- **Base Ambient Shadow:** Surfaces sit slightly off the `#F8F6F2` canvas using low-opacity, warm-tinted diffusion: `0 8px 30px rgba(39, 39, 42, 0.04), 0 2px 8px rgba(132, 120, 168, 0.03)`.
- **Active & Float Elevation:** Interactive capsules, floating action triggers, and active shorten cards elevate upon hover: `0 14px 40px rgba(132, 120, 168, 0.08), 0 4px 12px rgba(39, 39, 42, 0.03)`.
- **Low-Contrast Ghost Outlines:** All elevated cards and pill containers must include a crisp `1px` border in `#E7E4DE` to provide edge clarity on light displays.

## Shapes

The design system is built entirely on continuous pill forms and ultra-rounded organic surfaces. 

- **Primary Interactive Elements:** Inputs, buttons, tags, chips, and notification capsules use a 9999px border-radius (pill).
- **Cards and Panels:** Structural cards, sheets, and popovers utilize `rounded-lg` (2rem) and `rounded-xl` (3rem), reinforcing a friendly, approachable, and tactile physical silhouette.

## Components

- **Shortener Input Capsule:**
  - A unified, floating pill container (`rounded-full`) with a `#FFFFFF` fill, `#E7E4DE` border, and baseline ambient shadow.
  - Contains the primary URL text input, custom alias toggle, and the action button nested entirely within the pill frame.
  - Focus state shifts the border to `#8478A8` with a subtle diffuse glow: `0 0 0 3px #EEEAF7`.

- **Buttons:**
  - *Primary Button:* Solid `#8478A8` pill with `#FFFFFF` text. Micro-interaction expands slightly with a soft background transition to `#A99BD8`.
  - *Secondary Button:* Pill container with `#EEEAF7` background, `#8478A8` text, and zero border.
  - *Ghost / Action Icon:* Circular capsule (`rounded-full`) in `#FFFFFF` with `#E7E4DE` border, ideal for copy, share, and QR actions.

- **URL List Item & Cards:**
  - Rounded-xl (`2rem`) container with `#FFFFFF` background, fine `#E7E4DE` border, and generous inner padding (`space-lg`).
  - Left region highlights the customized short link in `code-link` typography; right region features soft micro-chips for click counts, creation date, and status badges.
  - Hover triggers an ambient lift and displays quick actions (copy, QR trigger, edit alias).

- **Chips & Tags:**
  - Full-pill micro-capsules (`rounded-full`) using `#EEEAF7` background with `#8478A8` text for tags, and `#7C9A85` tint for healthy link statuses.
  - Eyebrows and categories inside chips adopt uppercase tracked typography (`label-eyebrow`).

- **Copy Feedback Animation:**
  - When copying a link, the target button transitions from `#8478A8` to `#7C9A85` with an instant check icon replacement, accompanied by a subtle floating toast pill reading "Saved to clipboard."

- **QR Flyout Modal:**
  - Centered sheet with `rounded-xl` curvature, carrying a high-contrast minimalist QR frame with soft lilac decorative corners and a one-click download pill button.