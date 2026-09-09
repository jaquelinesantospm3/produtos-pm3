import type { Config } from "tailwindcss";

/**
 * Tokens do conceito "dossiê oficial": fundo claro de papel, tinta quase preta,
 * um único accent violeta e uma cor por status de produto.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pm3: {
          bg: "#F7F6F2",
          surface: "#FFFFFF",
          ink: "#221F1B",
          muted: "#726C63",
          faint: "#A39C90",
          line: "#E4E0D7",
          "line-strong": "#D2CCBE",
          accent: "#5B3DF5",
          "accent-soft": "#EFEBFF",
          "accent-ink": "#3B26B0",
          ativo: "#2F7A4F",
          "ativo-soft": "#E4F3E9",
          lancamento: "#B8790F",
          "lancamento-soft": "#FBF0DD",
          pausado: "#726C63",
          "pausado-soft": "#EDEAE3",
          descontinuado: "#B23B3B",
          "descontinuado-soft": "#F8E7E6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: {
        prosa: "62ch",
      },
    },
  },
  plugins: [],
};

export default config;
