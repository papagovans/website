import { Inter, Prompt } from "next/font/google";

/* Served from this site, not Google's: no extra domains to connect to, and
   cached for a year. Inter is one variable file for every weight; Prompt
   carries only the three weights the CSS uses. Only Prompt is preloaded:
   it sets the headline, so it and the hero photo get the early bandwidth,
   and Inter (body text) follows. Shared by the layout and the global 404. */
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
export const prompt = Prompt({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-prompt", display: "swap" });

