---
name: Premium Retail Intelligence
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#494550'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7a7581'
  outline-variant: '#cbc4d1'
  surface-tint: '#68519a'
  primary: '#2a1059'
  on-primary: '#ffffff'
  primary-container: '#402970'
  on-primary-container: '#ac94e2'
  inverse-primary: '#d1bcff'
  secondary: '#6c5e00'
  on-secondary: '#ffffff'
  secondary-container: '#fee016'
  on-secondary-container: '#716200'
  tertiary: '#212223'
  on-tertiary: '#ffffff'
  tertiary-container: '#363738'
  on-tertiary-container: '#a0a0a1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d1bcff'
  on-primary-fixed: '#230653'
  on-primary-fixed-variant: '#503981'
  secondary-fixed: '#ffe33b'
  secondary-fixed-dim: '#e2c600'
  on-secondary-fixed: '#211b00'
  on-secondary-fixed-variant: '#524700'
  tertiary-fixed: '#e3e2e3'
  tertiary-fixed-dim: '#c7c6c7'
  on-tertiary-fixed: '#1b1c1d'
  on-tertiary-fixed-variant: '#464748'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  surface-white: '#FFFFFF'
  deep-purple: '#402970'
  accent-yellow: '#F8DA08'
  rich-black: '#242526'
  soft-gray: '#F0F0F0'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 40px
---

## Brand & Style

The design system is a sophisticated fusion of **Corporate Modern** and **Minimalist** aesthetics. It is designed to transform complex retail data into a premium, authoritative, and user-friendly intelligence interface. Taking inspiration from the vibrant Sri Lankan e-commerce landscape, the system balances energy with executive-level clarity.

The visual narrative focuses on "Intelligence through Clarity." It leverages high-contrast brand colors to highlight critical insights while maintaining a clean, white-space-heavy environment that prevents cognitive overload. The emotional response should be one of confidence, reliability, and precision.

## Colors

The palette is anchored by a regal **Deep Purple**, signifying authority and luxury, and a vibrant **Accent Yellow** used sparingly for "calls to intelligence" and critical interaction points. 

- **Primary (Deep Purple):** Used for navigation sidebars, primary buttons, and headers to establish brand presence.
- **Secondary (Accent Yellow):** Reserved for high-priority alerts, active states, and specific data highlights.
- **Neutral / Surface:** A combination of white and soft gray creates a "layered paper" effect, separating different analytical modules without the need for heavy lines.
- **Text:** Rich Black is used for primary content to ensure maximum readability and a premium editorial feel.

## Typography

This design system uses a multi-font strategy to differentiate between brand expression, content readability, and technical data:

- **Plus Jakarta Sans (Headlines):** Chosen for its modern, friendly, yet professional geometric structure. It provides the "premium" feel requested.
- **Inter (Body):** The industry standard for legibility in data-heavy applications. Used for all prose, descriptions, and UI controls.
- **JetBrains Mono (Labels/Data):** Used for technical metadata, SKU numbers, and retail metrics to provide a distinct "intelligence" look that separates hard data from UI text.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The main content area utilizes a 12-column grid with a maximum width of 1440px to maintain readability on ultra-wide monitors.

- **Desktop:** 12 columns, 24px margins, 16px gutters. Sidebar is fixed at 280px.
- **Tablet:** 8 columns, 16px margins, 16px gutters.
- **Mobile:** 4 columns, 16px margins, 12px gutters.

The spacing rhythm is based on an **8px linear scale**. Use larger gaps (40px+) between major sections to emphasize the minimalist, "premium" breathing room.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** supplemented by **Ambient Shadows**. 

1. **Level 0 (Background):** Soft Gray (#F0F0F0) acts as the canvas.
2. **Level 1 (Cards/Modules):** Pure White (#FFFFFF) surfaces with a very soft, diffused shadow (0px 4px 20px rgba(64, 41, 112, 0.05)).
3. **Level 2 (Popovers/Modals):** Pure White with a more defined shadow and a subtle Deep Purple 1px border at 10% opacity.

Avoid heavy borders; use changes in surface color and subtle shadows to define boundaries.

## Shapes

The shape language is **Rounded**, reflecting the approachable and modern nature of the brand. 

- **Buttons & Inputs:** 0.5rem (8px) corner radius.
- **Cards & Containers:** 1rem (16px) corner radius.
- **Chips & Tags:** Fully rounded (pill-shaped) to distinguish them from actionable buttons.

This consistent rounding softens the "data-heavy" nature of retail intelligence, making the platform feel more like a modern consumer tool than a legacy enterprise system.

## Components

### Buttons
- **Primary:** Deep Purple background, White text. High-emphasis.
- **Secondary:** White background, Deep Purple border (1px), Deep Purple text.
- **Action/Alert:** Accent Yellow background, Rich Black text. Use only for "Inspiration" or "Critical Warning" states.

### Cards
Cards should have no visible border. Use the Level 1 elevation (white background + soft shadow). Headers within cards should use `label-md` for categories and `headline-md` for titles.

### Input Fields
Inputs use a 1px border of `soft-gray`. On focus, the border transitions to `deep-purple` with a subtle 2px outer glow of the same color at 20% opacity.

### Chips/Status Indicators
- **Positive:** Soft Green tint with dark green text.
- **Warning:** Secondary Yellow tint with Rich Black text.
- **Neutral/Technical:** Soft Gray tint with `jetbrainsMono` font.

### Data Visualization
Charts should primarily use shades of Deep Purple and Accent Yellow. For multi-series data, introduce a secondary palette of muted teals and corals that do not compete with the primary brand colors.