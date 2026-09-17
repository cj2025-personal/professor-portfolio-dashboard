/** @type {import('tailwindcss').Config} */

/*
 * Every value below resolves to a variable in src/archivyn-tokens.css — the
 * canonical Archivyn sheet. Nothing here invents a colour: the two in-between
 * neutral steps use color-mix() over existing tokens rather than a new hex, so
 * the sheet stays the single source of truth.
 *
 * `brand` replaces the old `crimson` scale. It is the navy family, because in
 * Archivyn navy carries primary/CTA and red is fenced to the signature stripe
 * (see .ark-stripe in index.css). The old `primary` scale was unused — removed.
 */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--ark-info-soft)',
          100: 'var(--ark-navy-soft)',
          200: 'color-mix(in srgb, var(--ark-navy) 25%, white)',
          300: 'color-mix(in srgb, var(--ark-navy) 40%, white)',
          400: 'var(--ark-blue)',
          500: 'var(--ark-blue)',
          600: 'var(--ark-navy)',
          700: 'var(--ark-blue-deep)',
          800: 'var(--ark-navy-ink)',
          900: 'var(--ark-navy-ink)',
        },
        // Signature red — stripe, kickers, key CTAs only. Never a section accent.
        signal: {
          red: 'var(--ark-red)',
          danger: 'var(--ark-danger)',
          'danger-soft': 'var(--ark-danger-soft)',
          success: 'var(--ark-success)',
          'success-soft': 'var(--ark-success-soft)',
          warning: 'var(--ark-warning)',
          'warning-soft': 'var(--ark-warning-soft)',
        },
        // Tailwind's stock grey ramp is replaced wholesale: the token sheet
        // requires navy-biased neutrals ("never pure gray or black"), so every
        // existing gray-* class in the components picks this up for free.
        gray: {
          50: 'var(--ark-bg)',
          100: 'var(--ark-border-soft)',
          200: 'var(--ark-border)',
          300: 'color-mix(in srgb, var(--ark-text-faint) 35%, white)',
          400: 'color-mix(in srgb, var(--ark-text-faint) 65%, white)',
          500: 'var(--ark-text-faint)',
          600: 'var(--ark-text-muted)',
          700: 'var(--ark-text-muted)',
          800: 'var(--ark-text)',
          900: 'var(--ark-text)',
        },
        surface: {
          DEFAULT: 'var(--ark-surface)',
          2: 'var(--ark-surface-2)',
        },
        // Error and success states across the app used Tailwind's stock red /
        // green. The sheet's rule is "one meaning, one color", so both scales
        // are re-pointed at the semantic tokens. Darker steps are color-mix
        // over the same token rather than a second, slightly-different red.
        red: {
          50: 'var(--ark-danger-soft)',
          100: 'var(--ark-danger-soft)',
          200: 'color-mix(in srgb, var(--ark-danger) 30%, white)',
          400: 'var(--ark-danger)',
          500: 'var(--ark-danger)',
          600: 'var(--ark-danger)',
          700: 'color-mix(in srgb, var(--ark-danger) 82%, black)',
          800: 'color-mix(in srgb, var(--ark-danger) 68%, black)',
        },
        green: {
          50: 'var(--ark-success-soft)',
          100: 'var(--ark-success-soft)',
          200: 'color-mix(in srgb, var(--ark-success) 30%, white)',
          400: 'var(--ark-success)',
          500: 'var(--ark-success)',
          600: 'var(--ark-success)',
          700: 'var(--ark-success-strong)',
          800: 'var(--ark-success-strong)',
        },
        // The discussion and auth screens still carried stock Tailwind blue for
        // primary actions, which sat next to a navy .btn-primary. 600/700 map to
        // the button pair so an action looks the same wherever it appears; the
        // lighter steps stay in the info family for badges and focus rings.
        blue: {
          50: 'var(--ark-info-soft)',
          100: 'var(--ark-info-soft)',
          200: 'color-mix(in srgb, var(--ark-info) 30%, white)',
          400: 'var(--ark-blue)',
          500: 'var(--ark-blue)',
          600: 'var(--ark-navy)',
          700: 'var(--ark-blue-deep)',
          800: 'var(--ark-info-strong)',
          900: 'var(--ark-navy-ink)',
        },
        // Yellow and orange both meant "caution" and were rendering as two
        // different cautions. The sheet's rule is one meaning, one colour, so
        // both resolve to the warning token.
        yellow: {
          50: 'var(--ark-warning-soft)',
          100: 'var(--ark-warning-soft)',
          200: 'color-mix(in srgb, var(--ark-warning) 25%, white)',
          300: 'color-mix(in srgb, var(--ark-warning) 40%, white)',
          400: 'var(--ark-warning)',
          500: 'var(--ark-warning)',
          600: 'var(--ark-warning)',
          700: 'var(--ark-warning)',
          800: 'color-mix(in srgb, var(--ark-warning) 80%, black)',
        },
        orange: {
          50: 'var(--ark-warning-soft)',
          100: 'var(--ark-warning-soft)',
          200: 'color-mix(in srgb, var(--ark-warning) 25%, white)',
          300: 'color-mix(in srgb, var(--ark-warning) 40%, white)',
          400: 'var(--ark-warning)',
          500: 'var(--ark-warning)',
          600: 'var(--ark-warning)',
          700: 'color-mix(in srgb, var(--ark-warning) 85%, black)',
          800: 'color-mix(in srgb, var(--ark-warning) 80%, black)',
        },
      },
      fontFamily: {
        sans: ['var(--ark-font-ui)'],
        // `serif` is kept as an alias so existing utilities keep resolving;
        // the slot now holds a condensed display face, not a serif.
        serif: ['var(--ark-font-display)'],
        display: ['var(--ark-font-display)'],
      },
      borderRadius: {
        lg: 'var(--ark-radius-sm)',        /* 8px  */
        control: 'var(--ark-radius-control)', /* 10px */
        xl: 'var(--ark-radius-card)',      /* 12px */
        '2xl': 'var(--ark-radius-panel)',  /* 18px */
        '3xl': 'var(--ark-radius-modal)',  /* 24px */
      },
      boxShadow: {
        sm: 'var(--ark-shadow-sm)',
        DEFAULT: 'var(--ark-shadow-sm)',
        md: 'var(--ark-shadow-md)',
        lg: 'var(--ark-shadow-lg)',
        xl: 'var(--ark-shadow-lg)',
      },
      maxWidth: {
        content: 'var(--ark-width-content)',
        reading: 'var(--ark-width-reading)',
      },
    },
  },
  plugins: [],
}
