/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      /* =====================================================
         HOMEOS WARM PREMIUM COLORS
         ===================================================== */

      colors: {

        homeos: {
          bg: '#FBF7F3',
          surface: '#FFFFFF',
          'surface-soft': '#FFF9F6',

          primary: '#C96243',
          'primary-hover': '#AE4F35',
          'primary-soft': '#F4D8CC',
          'primary-light': '#F8E7E0',

          /* Main text */
          text: '#241D1A',

          /* Secondary text - darker for better readability */
          'text-secondary': '#5F5752',

          /* Muted text */
          muted: '#9A908A',

          border: '#E8DDD6',
          'border-light': '#F0E7E2',

          success: '#4FA77B',
          'success-soft': '#E4F3EB',

          warning: '#E7A84B',
          'warning-soft': '#FFF1D8',

          danger: '#D95C5C',
          'danger-soft': '#FBE6E6',

          info: '#668BC4',
          'info-soft': '#E9F0FA',
        },


        /* ===================================================
           COMPATIBILITY: OLD CYBER CLASSES
           Existing JSX using cyber-* won't break.
           They now point to the new warm palette.
           =================================================== */

        cyber: {
          bg: '#FBF7F3',
          slate: '#FFF9F6',
          card: '#FFFFFF',
          'card-hover': '#FFF5F0',

          border: '#E8DDD6',
          'border-light': '#E0D1C8',

          cyan: '#C96243',
          'cyan-hover': '#AE4F35',
          'cyan-glow': 'rgba(201, 98, 67, 0.15)',

          blue: '#668BC4',
          'blue-hover': '#5578AF',

          coral: '#D95C5C',
          'coral-hover': '#C94E4E',

          white: '#241D1A',

          /* Secondary text */
          muted: '#5F5752',

          /* Muted/subtle text */
          subtle: '#9A908A',

          dim: '#B0A49D',
        },


        /* ===================================================
           STATUS
           =================================================== */

        status: {
          running: '#4FA77B',
          idle: '#9A908A',
          service: '#D95C5C',
          warning: '#E7A84B',
          info: '#668BC4',
        },


        /* ===================================================
           COMPATIBILITY: NAVY
           =================================================== */

        navy: {
          DEFAULT: '#FFFFFF',
          deep: '#FBF7F3',
          secondary: '#FFF5F0',

          50: '#FFF9F6',
          100: '#F8EDE7',
          200: '#F0E1DA',
          300: '#E4D3CA',
          400: '#D0BDB2',
          500: '#B59E92',
          600: '#927B70',

          /* Secondary text tone */
          700: '#5F5752',

          800: '#403630',
          900: '#241D1A',
          950: '#17110E',
        },


        /* ===================================================
           COMPATIBILITY: CHARCOAL
           =================================================== */

        charcoal: {
          DEFAULT: '#241D1A',

          50: '#FFF9F6',
          100: '#F8EDE7',
          200: '#EADCD4',
          300: '#D2C2B9',
          400: '#B0A098',
          500: '#8C7D75',

          /* Secondary text tone */
          600: '#5F5752',

          700: '#514740',
          800: '#342B27',
          900: '#241D1A',
        },


        /* ===================================================
           COMPATIBILITY: GOLD
           =================================================== */

        gold: {
          DEFAULT: '#C96243',
          50: '#FFF7F3',
          100: '#FCEAE3',
          200: '#F7D7CB',
          300: '#E9B09D',
          400: '#D77A5B',
          500: '#C96243',
          600: '#AE4F35',
        },


        /* ===================================================
           CREAM
           =================================================== */

        cream: {
          DEFAULT: '#FFFFFF',
          50: '#FBF7F3',
          100: '#FFF9F6',
          200: '#F8EDE7',
          300: '#F0E1DA',
          400: '#DCCBC1',
          500: '#BDA99E',
        },


        /* ===================================================
           SOFT BLUE
           =================================================== */

        softblue: {
          DEFAULT: '#EEF3FA',
          50: '#F7F9FC',
          100: '#EEF3FA',
          200: '#DDE7F4',
          300: '#B9CCE5',
          400: '#668BC4',
        },


        /* ===================================================
           WARM COMPATIBILITY
           =================================================== */

        warm: {
          surface: '#FFFFFF',
          border: '#E8DDD6',
          white: '#FFFFFF',
        },
      },


      /* =====================================================
         TYPOGRAPHY
         ===================================================== */

      fontFamily: {

        sans: [
          'DM Sans',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],

        display: [
          'DM Sans',
          'Inter',
          'sans-serif',
        ],

        editorial: [
          'Playfair Display',
          'Georgia',
          'Times New Roman',
          'serif',
        ],
      },


      /* =====================================================
         PREMIUM SHADOWS
         ===================================================== */

      boxShadow: {

        'cyber-sm':
          '0 2px 8px rgba(61, 43, 34, 0.06)',

        cyber:
          '0 8px 30px rgba(61, 43, 34, 0.08)',

        'cyber-lg':
          '0 18px 50px rgba(61, 43, 34, 0.12)',

        'cyan-glow':
          '0 0 20px rgba(201, 98, 67, 0.18)',

        'blue-glow':
          '0 0 20px rgba(102, 139, 196, 0.18)',

        'coral-glow':
          '0 0 20px rgba(217, 92, 92, 0.18)',

        homeos:
          '0 8px 30px rgba(61, 43, 34, 0.08)',

        'homeos-lg':
          '0 18px 50px rgba(61, 43, 34, 0.12)',
      },
    },
  },

  plugins: [],
};