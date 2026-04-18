import localFont from "next/font/local";
import {
  DM_Sans,
  Figtree,
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Inter,
  Lexend,
  Manrope,
  Outfit,
  Plus_Jakarta_Sans,
  Public_Sans,
  Spectral,
} from "next/font/google";

export const dollyPro = localFont({
  src: "../../public/fonts/Dolly/DollyPro-Bold.woff2",
  weight: "700",
  style: "normal",
  display: "swap",
  variable: "--font-dolly-pro",
});

export const dollyProSmallCaps = localFont({
  src: "../../public/fonts/Dolly/DollyPro-RegularSmallCaps.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-dolly-pro-smallcaps",
});

export const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
  variable: "--font-spectral",
});

export const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Picker-only fonts: not preloaded (only fetched when the user selects them).
// Theme-default fonts (Spectral, Lexend, Geist, Inter) stay preloaded above.
export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-ibm-plex-sans",
});

export const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-public-sans",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-dm-sans",
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-plus-jakarta-sans",
});

export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-manrope",
});

export const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-outfit",
});

export const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-figtree",
});

export const fontVariables = [
  dollyPro.variable,
  dollyProSmallCaps.variable,
  spectral.variable,
  lexend.variable,
  geist.variable,
  geistMono.variable,
  inter.variable,
  ibmPlexSans.variable,
  publicSans.variable,
  dmSans.variable,
  plusJakartaSans.variable,
  manrope.variable,
  outfit.variable,
  figtree.variable,
].join(" ");
