import type { CSSProperties } from "react";
import { loadFont as loadIBMPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

// 1. Inter - Primary Editorial & Modern UI Sans
export const interFont = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

// 2. IBM Plex Mono - Primary Technical & Ledger Data Readouts
export const ibmPlexMonoFont = loadIBMPlexMono("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

// 3. Newsreader - Journalistic Headings, Court Syllabi & Document Titles
export const newsreaderFont = loadNewsreader("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

export const newsreaderItalicFont = loadNewsreader("italic", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

// 4. Space Grotesk - Futuristic / Cyber / Modern Display
export const spaceGroteskFont = loadSpaceGrotesk("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

// 5. Oswald - Bold Condensed Editorial & Cold Open Impact
export const oswaldFont = loadOswald("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

export const FONTS = {
  sans: `${interFont.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  mono: `${ibmPlexMonoFont.fontFamily}, 'SF Mono', 'Cascadia Code', Consolas, monospace`,
  serif: `${newsreaderFont.fontFamily}, 'Newsreader', 'Times New Roman', Georgia, serif`,
  display: `${spaceGroteskFont.fontFamily}, -apple-system, sans-serif`,
  condensed: `${oswaldFont.fontFamily}, 'Impact', 'Arial Black', sans-serif`,
};

export type FontRole = keyof typeof FONTS;

/**
 * Enforces fixed-width lining numerals across ledgers, tickers, and inline statistics
 * so frame-by-frame count-ups never jitter horizontally.
 */
export const TABULAR_NUM_STYLE: CSSProperties = {
  fontVariantNumeric: "tabular-nums lining-nums",
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
};

/**
 * Optical letter-spacing calculator calibrated for 1920x1080 broadcast & editorial plates.
 * Micro eyebrows open up for legibility; large display & monolith sizes tighten optically.
 */
export function getOpticalTracking(
  px: number | string,
  role: FontRole = "sans"
): string {
  const parsed =
    typeof px === "number" ? px : parseFloat(String(px).replace(/[^0-9.-]/g, ""));
  const sizePx = Number.isFinite(parsed) && parsed > 0 ? parsed : 16;

  if (role === "mono") {
    if (sizePx <= 12) return "0.06em";
    if (sizePx <= 18) return "0.02em";
    if (sizePx <= 36) return "-0.01em";
    return "-0.02em";
  }

  if (role === "condensed") {
    if (sizePx <= 16) return "0.06em";
    if (sizePx <= 42) return "0.02em";
    if (sizePx <= 96) return "0.005em";
    return "-0.012em";
  }

  // Editorial curve for sans / serif / display
  let em: number;
  if (sizePx <= 11) {
    em = 0.075;
  } else if (sizePx <= 14) {
    // 11px -> +0.075em, 14px -> +0.02em
    const t = (sizePx - 11) / 3;
    em = 0.075 - t * 0.055;
  } else if (sizePx <= 20) {
    // 14px -> +0.02em, 20px -> -0.006em
    const t = (sizePx - 14) / 6;
    em = 0.02 - t * 0.026;
  } else if (sizePx <= 48) {
    // 20px -> -0.006em, 48px -> -0.024em
    const t = (sizePx - 20) / 28;
    em = -0.006 - t * 0.018;
  } else if (sizePx <= 120) {
    // 48px -> -0.024em, 120px -> -0.038em
    const t = (sizePx - 48) / 72;
    em = -0.024 - t * 0.014;
  } else {
    em = -0.04;
  }

  if (role === "serif" && sizePx >= 24) {
    em += 0.004;
  }

  const rounded = Math.round(em * 1000) / 1000;
  return `${rounded}em`;
}

export interface SplitNumberUnit {
  raw: string;
  /** Normalized sign: "+", "-", or "" */
  sign: "" | "+" | "-";
  /** Detected currency symbol such as "$", "€", "£", "¥" */
  currency: string;
  /** Combined leading prefix (e.g. "$", "-$", "+", "~$") */
  prefix: string;
  /** Core formatted digits or ratio string (e.g. "40.5", "42", "100:1", "1,250.75") */
  digits: string;
  /** Trimmed trailing unit/multiplier/rate suffix (e.g. "T", "B", "bps", "%", "GW", "TWh", "/MW-day") */
  suffix: string;
  /** Untrimmed trailing suffix preserving any original leading space (e.g. " bps", " GW") */
  rawSuffix: string;
  /** Signed primary numeric value (-42 for "-$42B", 40.5 for "$40.5T", 100 for "100:1") */
  numericValue: number | null;
  /** Denominator value when `isRatio` is true (e.g. 1 for "100:1") */
  secondaryRatioValue: number | null;
  /** Detected fractional digits on the primary number */
  decimals: number;
  /** True when input had whitespace between digits and unit (e.g. "+67 bps", "14.2 GW") */
  hasSpaceBeforeSuffix: boolean;
  isNegative: boolean;
  isRatio: boolean;
}

const NUMBER_UNIT_PATTERN =
  /^([~≈]?)([+\-−]?)\s*([$€£¥]?)\s*([+\-−]?)\s*(\d[\d,]*(?:\.\d+)?)(?::(\d[\d,]*(?:\.\d+)?))?(\s*.*)$/;

/**
 * Splits financial, macroeconomic, energy, and ratio figures into crisp typographic parts.
 * Examples:
 * - "$40.5T"         -> { prefix: "$", digits: "40.5", suffix: "T", numericValue: 40.5 }
 * - "-$42B"          -> { prefix: "-$", digits: "42", suffix: "B", numericValue: -42 }
 * - "+67 bps"        -> { prefix: "+", digits: "67", suffix: "bps", hasSpaceBeforeSuffix: true }
 * - "100:1"          -> { prefix: "", digits: "100:1", suffix: "", isRatio: true }
 * - "+833%"          -> { prefix: "+", digits: "833", suffix: "%", numericValue: 833 }
 * - "$269.92/MW-day" -> { prefix: "$", digits: "269.92", suffix: "/MW-day", decimals: 2 }
 */
export function splitNumberUnit(raw: string): SplitNumberUnit {
  const trimmed = raw.trim();
  const match = trimmed.match(NUMBER_UNIT_PATTERN);

  if (!match) {
    return {
      raw,
      sign: "",
      currency: "",
      prefix: "",
      digits: trimmed,
      suffix: "",
      rawSuffix: "",
      numericValue: null,
      secondaryRatioValue: null,
      decimals: 0,
      hasSpaceBeforeSuffix: false,
      isNegative: false,
      isRatio: false,
    };
  }

  const approx = match[1] ?? "";
  const signBefore = match[2] ?? "";
  const currency = match[3] ?? "";
  const signAfter = match[4] ?? "";
  const primaryDigits = match[5] ?? "";
  const ratioDigits = match[6];
  const trailingRaw = match[7] ?? "";

  const rawSign = signBefore || signAfter;
  const isNegative = rawSign === "-" || rawSign === "−";
  const sign: "" | "+" | "-" = isNegative ? "-" : rawSign === "+" ? "+" : "";

  const prefix = `${approx}${sign}${currency}`;
  const isRatio = ratioDigits !== undefined && ratioDigits.length > 0;
  const digits = isRatio ? `${primaryDigits}:${ratioDigits}` : primaryDigits;

  const decimalMatch = primaryDigits.split(".")[1];
  const decimals = decimalMatch ? decimalMatch.length : 0;

  const unsignedPrimary = Number(primaryDigits.replace(/,/g, ""));
  const numericValue = Number.isFinite(unsignedPrimary)
    ? isNegative
      ? -unsignedPrimary
      : unsignedPrimary
    : null;

  const parsedRatio =
    isRatio && ratioDigits !== undefined
      ? Number(ratioDigits.replace(/,/g, ""))
      : NaN;
  const secondaryRatioValue =
    isRatio && Number.isFinite(parsedRatio) ? parsedRatio : null;

  const hasSpaceBeforeSuffix =
    trailingRaw.length > 0 && /^\s+/.test(trailingRaw) && trailingRaw.trim().length > 0;
  const suffix = trailingRaw.trim();

  return {
    raw,
    sign,
    currency,
    prefix,
    digits,
    suffix,
    rawSuffix: suffix ? (hasSpaceBeforeSuffix ? ` ${suffix}` : suffix) : "",
    numericValue,
    secondaryRatioValue,
    decimals,
    hasSpaceBeforeSuffix,
    isNegative,
    isRatio,
  };
}

export const parseNumberUnit = splitNumberUnit;

const SHORT_BIND_WORDS = new Set<string>([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "or",
  "vs",
  "vs.",
  "no.",
  "sec.",
  "table",
  "fig.",
  "act",
  "part",
  "§",
]);

/**
 * Prevents typographic orphans and awkward number/citation splits by inserting
 * deterministic non-breaking spaces (\u00A0) between unit labels, section numbers,
 * and final trailing word pairs.
 */
export function preventOrphanWords(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const tokens = trimmed.split(/\s+/);
  if (tokens.length <= 1) return trimmed;

  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const next = tokens[i + 1];
    if (next !== undefined) {
      const lower = current.toLowerCase();
      const nextIsShortNumberOrUnit =
        /^(?:\d[\d,.%]*|I|II|III|IV|V|VI|VII|VIII|IX|X|T|B|M|GW|TWh|MW|bps)$/i.test(
          next.replace(/[.,;:!?)]+$/, "")
        );
      const currentIsCurrencyNumber = /^[$€£¥+-]?\d/.test(current);
      const nextIsScaleWord = /^(?:trillion|billion|million|percent|bps|GW|TWh|MW)$/i.test(
        next.replace(/[.,;:!?)]+$/, "")
      );

      if (
        (SHORT_BIND_WORDS.has(lower) && nextIsShortNumberOrUnit) ||
        (currentIsCurrencyNumber && nextIsScaleWord)
      ) {
        tokens[i + 1] = `${current}\u00A0${next}`;
        continue;
      }
    }
    out.push(current);
  }

  if (out.length >= 3) {
    const last = out[out.length - 1];
    const prev = out[out.length - 2];
    if (prev.length + 1 + last.length <= 24) {
      out.splice(out.length - 2, 2, `${prev}\u00A0${last}`);
    }
  } else if (out.length === 2 && out[0].length + out[1].length <= 16) {
    return `${out[0]}\u00A0${out[1]}`;
  }

  return out.join(" ");
}
