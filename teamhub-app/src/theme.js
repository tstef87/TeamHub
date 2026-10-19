// src/theme.js
// MUI themes that mirror the Radix maroon ("red") + gray scales in index.css.
// MUI derives hover/focus shades from hex values, so the values are copied here
// instead of using var(--red-9). If you change index.css, update them to match.
import { createTheme } from "@mui/material/styles";

const palettes = {
  light: {
    mode: "light",
    primary: {
      main: "#9e1b32", // --red-9
      dark: "#8c0024", // --red-10
      light: "#de9899", // --red-8
      contrastText: "#ffffff",
    },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#1e2021", secondary: "#626566" }, // --gray-12, --gray-11
    divider: "#d7d9da", // --gray-6
  },
  dark: {
    mode: "dark",
    primary: {
      main: "#c92140", // --red-8 (more legible than red-9 on near-black)
      dark: "#9e1b32", // --red-9
      light: "#ff8d93", // --red-11
      contrastText: "#ffffff",
    },
    background: { default: "#010101", paper: "#141515" }, // --gray-1, --gray-2
    text: { primary: "#edeeee", secondary: "#b2b4b5" }, // --gray-12, --gray-11
    divider: "#383a3b", // --gray-6
  },
};

export function getTheme(appearance) {
  return createTheme({
    palette: palettes[appearance === "dark" ? "dark" : "light"],
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: "inherit", // use the font Radix Themes already sets
      button: { textTransform: "none", fontWeight: 500 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      // Flat, bordered surfaces instead of shadows; no dark-mode elevation tint.
      MuiPaper: {
        defaultProps: { variant: "outlined" },
        styleOverrides: { root: { backgroundImage: "none" } },
      },
    },
  });
}

export default getTheme;