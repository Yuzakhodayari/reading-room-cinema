import type { CSSProperties } from "react";
import { FontRole, splitNumberUnit, TABULAR_NUM_STYLE } from "./fonts";

export type FontMetricFamily = FontRole;

export interface TextMeasureOptions {
  fontFamily?: string | FontMetricFamily;
  fontWeight?: number | string;
  italic?: boolean;
  letterSpacingEm?: number;
  uppercase?: boolean;
}

// Calibrated per-character em-width tables (at weight 400) for zero-DOM deterministic layout
const SANS_GLYPH_WIDTHS: Record<string, number> = {
  " ": 0.28,
  "\u00A0": 0.28,
  i: 0.25,
  l: 0.25,
  I: 0.29,
  j: 0.26,
  t: 0.36,
  f: 0.34,
  r: 0.37,
  s: 0.49,
  c: 0.51,
  e: 0.55,
  a: 0.55,
  o: 0.57,
  n: 0.57,
  u: 0.57,
  h: 0.57,
  k: 0.53,
  v: 0.51,
  x: 0.51,
  y: 0.52,
  z: 0.49,
  b: 0.58,
  d: 0.58,
  p: 0.58,
  q: 0.58,
  g: 0.57,
  m: 0.85,
  w: 0.77,
  A: 0.67,
  B: 0.66,
  C: 0.69,
  D: 0.71,
  E: 0.61,
  F: 0.58,
  G: 0.73,
  H: 0.72,
  J: 0.51,
  K: 0.66,
  L: 0.57,
  M: 0.85,
  N: 0.72,
  O: 0.75,
  P: 0.64,
  Q: 0.76,
  R: 0.67,
  S: 0.64,
  T: 0.6,
  U: 0.71,
  V: 0.66,
  W: 0.93,
  X: 0.66,
  Y: 0.64,
  Z: 0.61,
  "0": 0.58,
  "1": 0.58,
  "2": 0.58,
  "3": 0.58,
  "4": 0.58,
  "5": 0.58,
  "6": 0.58,
  "7": 0.58,
  "8": 0.58,
  "9": 0.58,
  $: 0.58,
  "€": 0.58,
  "£": 0.58,
  "%": 0.84,
  "+": 0.58,
  "-": 0.38,
  "–": 0.56,
  "—": 0.92,
  ".": 0.27,
  ",": 0.27,
  ":": 0.29,
  ";": 0.29,
  "/": 0.36,
  "(": 0.35,
  ")": 0.35,
  "[": 0.35,
  "]": 0.35,
  "'": 0.23,
  '"': 0.42,
  "§": 0.54,
};

const SERIF_GLYPH_SCALE = 0.965;
const CONDENSED_GLYPH_SCALE = 0.79;
const DISPLAY_GLYPH_SCALE = 1.02;
const MONO_CELL_EM = 0.605;

export function detectFontMetricFamily(raw?: string): FontMetricFamily {
  if (!raw) return "sans";
  const lower = raw.toLowerCase();
  if (
    lower === "mono" ||
    lower.indexOf("mono") !== -1 ||
    lower.indexOf("consolas") !== -1
  ) {
    return "mono";
  }
  if (
    lower === "serif" ||
    lower.indexOf("newsreader") !== -1 ||
    lower.indexOf("georgia") !== -1 ||
    lower.indexOf("times") !== -1
  ) {
    return "serif";
  }
  if (
    lower === "condensed" ||
    lower.indexOf("oswald") !== -1 ||
    lower.indexOf("impact") !== -1
  ) {
    return "condensed";
  }
  if (lower === "display" || lower.indexOf("space grotesk") !== -1) {
    return "display";
  }
  return "sans";
}

function resolveNumericWeight(weight?: number | string): number {
  if (typeof weight === "number" && Number.isFinite(weight)) return weight;
  if (weight === "bold") return 700;
  if (weight === "normal" || !weight) return 400;
  const parsed = Number(weight);
  return Number.isFinite(parsed) ? parsed : 500;
}

/**
 * Deterministic character-width table estimator in pixels (zero DOM race).
 */
export function estimateTextWidth(
  text: string,
  fontSize: number,
  options: TextMeasureOptions = {}
): number {
  if (!text || fontSize <= 0) return 0;

  const source = options.uppercase ? text.toUpperCase() : text;
  const family = detectFontMetricFamily(options.fontFamily);
  const weight = resolveNumericWeight(options.fontWeight);
  const letterSpacingEm = options.letterSpacingEm ?? 0;

  // Weight expansion: 400 -> 1.00, 700 -> 1.048, 800 -> 1.065
  const weightFactor = 1 + Math.max(0, (weight - 400) / 400) * 0.062;
  const italicPadEm = options.italic ? 0.08 : 0;

  let totalEm = 0;

  if (family === "mono") {
    totalEm = source.length * MONO_CELL_EM;
  } else {
    const familyScale =
      family === "serif"
        ? SERIF_GLYPH_SCALE
        : family === "condensed"
        ? CONDENSED_GLYPH_SCALE
        : family === "display"
        ? DISPLAY_GLYPH_SCALE
        : 1.0;

    for (let i = 0; i < source.length; i++) {
      const ch = source[i];
      const base = SANS_GLYPH_WIDTHS[ch];
      if (base !== undefined) {
        // Tabular digits stay uniform 0.58em even in serif/sans when tnum is active
        const isDigit = ch >= "0" && ch <= "9";
        totalEm += isDigit ? 0.58 * weightFactor : base * familyScale * weightFactor;
      } else {
        const code = source.charCodeAt(i);
        // Wide CJK / symbol fallback vs standard Latin uppercase/lowercase fallback
        const fallback = code > 0x2e80 ? 1.0 : ch === ch.toUpperCase() ? 0.68 : 0.55;
        totalEm += fallback * familyScale * weightFactor;
      }
    }
  }

  const trackingTotalEm = Math.max(0, source.length - 1) * letterSpacingEm;
  return (totalEm + trackingTotalEm + italicPadEm) * fontSize;
}

function isShortOrYearToken(token: string): boolean {
  const clean = token.replace(/[.,;:!?)"'\]]+$/g, "").replace(/^[("'[]+/g, "");
  if (clean.length <= 4) return true;
  // Solitary 4-digit year (e.g. 1912, 1938, 2036) or short unit suffix
  if (/^(?:18|19|20)\d{2}s?$/.test(clean)) return true;
  if (/^(?:GW|MW|TWh|bps|USD|GDP|CPI|PFD|CBO|SEC|IRS)$/i.test(clean)) return true;
  return false;
}

/**
 * Dynamic-programming Knuth-Plass quadratic minimum-raggedness line breaker
 * with strict orphan prevention (never leaves a single short word or year alone on the last line).
 */
export function balanceLinesDP(
  words: readonly string[],
  measureFn: (line: string) => number,
  maxWidth: number
): { fitsAllWords: boolean; lines: string[] } {
  const n = words.length;
  if (n === 0) return { fitsAllWords: true, lines: [] };
  if (n === 1) {
    const fits = measureFn(words[0]) <= maxWidth;
    return { fitsAllWords: fits, lines: [words[0]] };
  }

  // Verify every individual word fits inside maxWidth
  for (let i = 0; i < n; i++) {
    if (measureFn(words[i]) > maxWidth) {
      return { fitsAllWords: false, lines: [words.join(" ")] };
    }
  }

  const idealW = maxWidth * 0.88;
  const dp: number[] = new Array<number>(n + 1).fill(Infinity);
  const nextIdx: number[] = new Array<number>(n + 1).fill(n);
  dp[n] = 0;

  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j <= n; j++) {
      const candidate = words.slice(i, j).join(" ");
      const lineW = measureFn(candidate);
      if (lineW > maxWidth) {
        break;
      }

      const isLastLine = j === n;
      const wordCountOnLine = j - i;

      let orphanPenalty = 0;
      if (isLastLine && n >= 3 && wordCountOnLine === 1) {
        const loneToken = words[i];
        const penaltyScale = isShortOrYearToken(loneToken) ? 0.82 : 0.48;
        orphanPenalty = Math.pow(maxWidth * penaltyScale, 2);
      } else if (
        isLastLine &&
        n >= 4 &&
        wordCountOnLine === 2 &&
        isShortOrYearToken(words[j - 1]) &&
        lineW < maxWidth * 0.24
      ) {
        orphanPenalty = Math.pow(maxWidth * 0.32, 2);
      }

      const slackPenalty = isLastLine
        ? Math.pow(Math.max(0, idealW * 0.52 - lineW), 2)
        : Math.pow(idealW - lineW, 2);

      const cost = slackPenalty + orphanPenalty + dp[j];
      if (cost < dp[i]) {
        dp[i] = cost;
        nextIdx[i] = j;
      }
    }
  }

  if (!Number.isFinite(dp[0])) {
    return { fitsAllWords: false, lines: [words.join(" ")] };
  }

  const lines: string[] = [];
  let cursor = 0;
  while (cursor < n) {
    const end = nextIdx[cursor];
    if (end <= cursor) {
      lines.push(words.slice(cursor).join(" "));
      break;
    }
    lines.push(words.slice(cursor, end).join(" "));
    cursor = end;
  }

  return { fitsAllWords: true, lines };
}

export interface FitTextSpec {
  text: string;
  fontFamily?: string | FontMetricFamily;
  fontWeight?: number | string;
  italic?: boolean;
  uppercase?: boolean;
  maxWidth: number;
  maxHeight: number;
  maxLines?: number;
  minFontSize?: number;
  maxFontSize: number;
  lineHeight?: number;
  letterSpacingEm?: number;
  /** Default 0.96 (4% safety guard against subpixel & italic overhang clipping) */
  safetyFactor?: number;
}

export interface FitTextResult {
  fontSize: number;
  lines: string[];
  lineHeightPx: number;
  totalHeightPx: number;
  widestLinePx: number;
  wasClampedToMin: boolean;
}

/**
 * Deterministic binary-search optimal fontSize solver inside (maxWidth, maxHeight)
 * with a 4% safety guard (safetyFactor = 0.96) and DP balanced line breaking.
 */
export function fitAndBalanceText(spec: FitTextSpec): FitTextResult {
  const safety = spec.safetyFactor ?? 0.96;
  const lineHeight = spec.lineHeight ?? 1.18;
  const maxLines = Math.max(1, spec.maxLines ?? 6);
  const targetW = Math.max(16, spec.maxWidth * safety);
  const targetH = Math.max(12, spec.maxHeight * safety);

  const normalized = spec.text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return {
      fontSize: spec.maxFontSize,
      lines: [],
      lineHeightPx: spec.maxFontSize * lineHeight,
      totalHeightPx: 0,
      widestLinePx: 0,
      wasClampedToMin: false,
    };
  }

  // Respect explicit non-breaking spaces (\u00A0) inside individual tokens while splitting on normal whitespace
  const words = normalized.split(/ +/);
  const minSize = Math.max(8, spec.minFontSize ?? Math.round(spec.maxFontSize * 0.48));
  const maxSize = Math.max(minSize, spec.maxFontSize);

  const evaluateAtSize = (
    size: number
  ): { fits: boolean; lines: string[]; widest: number } => {
    const lsEm = spec.letterSpacingEm ?? (size >= 40 ? -0.02 : -0.008);
    const measure = (line: string): number =>
      estimateTextWidth(line, size, {
        fontFamily: spec.fontFamily,
        fontWeight: spec.fontWeight,
        italic: spec.italic,
        uppercase: spec.uppercase,
        letterSpacingEm: lsEm,
      });

    const dpRes = balanceLinesDP(words, measure, targetW);
    if (!dpRes.fitsAllWords) {
      return { fits: false, lines: dpRes.lines, widest: targetW + 1 };
    }

    const totalH = dpRes.lines.length * size * lineHeight;
    let widest = 0;
    for (let i = 0; i < dpRes.lines.length; i++) {
      const w = measure(dpRes.lines[i]);
      if (w > widest) widest = w;
    }

    const fits =
      dpRes.lines.length <= maxLines && totalH <= targetH && widest <= targetW;
    return { fits, lines: dpRes.lines, widest };
  };

  let lo = minSize;
  let hi = maxSize;
  let bestSize = minSize;
  const minEval = evaluateAtSize(minSize);
  let bestLines = minEval.lines;
  let bestWidest = minEval.widest;
  let anyFit = minEval.fits;

  for (let iter = 0; iter < 12; iter++) {
    const mid = (lo + hi) * 0.5;
    const res = evaluateAtSize(mid);
    if (res.fits) {
      anyFit = true;
      bestSize = mid;
      bestLines = res.lines;
      bestWidest = res.widest;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const quantizedSize = Math.floor(bestSize * 2) / 2;
  const finalEval = evaluateAtSize(quantizedSize);
  const resolvedLines = finalEval.lines.length > 0 ? finalEval.lines : bestLines;
  const lineHeightPx = Number((quantizedSize * lineHeight).toFixed(2));

  return {
    fontSize: quantizedSize,
    lines: resolvedLines,
    lineHeightPx,
    totalHeightPx: Number((resolvedLines.length * lineHeightPx).toFixed(2)),
    widestLinePx: Number(
      (finalEval.fits ? finalEval.widest : bestWidest).toFixed(2)
    ),
    wasClampedToMin: !anyFit,
  };
}

export const fitText = fitAndBalanceText;

// ============================================================================
// Tabular-Numeral / Currency-Prefix / Unit-Suffix Formatter
// ============================================================================

export interface FormatTabularOptions {
  decimals?: number;
  currency?: string;
  unit?: string;
  forceSign?: boolean;
  useGrouping?: boolean;
}

export interface FormattedTabularFigure {
  formatted: string;
  sign: "" | "+" | "-";
  currency: string;
  prefix: string;
  digits: string;
  unit: string;
  hasSpaceBeforeUnit: boolean;
  isNegative: boolean;
  numericStyle: CSSProperties;
  prefixSuperStyle: CSSProperties;
  unitSuperStyle: CSSProperties;
}

function formatFixedWithCommas(absValue: number, decimals: number, useGrouping: boolean): string {
  const fixed = absValue.toFixed(Math.max(0, Math.min(6, decimals)));
  if (!useGrouping) return fixed;
  const parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/**
 * Formats raw numbers or strings ("-$42B", "+833%", "$269.92/MW-day", 40.5)
 * into tabular-numeral locked parts with super-aligned currency prefix and unit suffix styles.
 */
export function formatTabularFigure(
  input: string | number,
  options: FormatTabularOptions = {}
): FormattedTabularFigure {
  const useGrouping = options.useGrouping ?? true;

  let sign: "" | "+" | "-" = "";
  let currency = options.currency ?? "";
  let digits = "";
  let unit = options.unit ?? "";
  let hasSpaceBeforeUnit = false;
  let isNegative = false;

  if (typeof input === "number") {
    const safeNum = Number.isFinite(input) ? input : 0;
    isNegative = safeNum < 0;
    sign = isNegative ? "-" : options.forceSign && safeNum > 0 ? "+" : "";
    const decimals =
      options.decimals !== undefined
        ? options.decimals
        : Math.abs(safeNum % 1) > 1e-6
        ? 1
        : 0;
    digits = formatFixedWithCommas(Math.abs(safeNum), decimals, useGrouping);
    hasSpaceBeforeUnit = /^(?:bps|GW|MW|TWh|yrs|wks)$/i.test(unit.trim());
    unit = unit.trim();
  } else {
    const parsed = splitNumberUnit(input);
    isNegative = parsed.isNegative;
    sign =
      parsed.sign ||
      (options.forceSign && parsed.numericValue !== null && parsed.numericValue > 0
        ? "+"
        : "");
    currency = options.currency ?? parsed.currency;
    unit = options.unit ?? parsed.suffix;
    hasSpaceBeforeUnit =
      options.unit !== undefined
        ? /^(?:bps|GW|MW|TWh|yrs|wks)$/i.test(options.unit.trim())
        : parsed.hasSpaceBeforeSuffix;

    if (
      !parsed.isRatio &&
      parsed.numericValue !== null &&
      options.decimals !== undefined
    ) {
      digits = formatFixedWithCommas(
        Math.abs(parsed.numericValue),
        options.decimals,
        useGrouping
      );
    } else {
      digits = parsed.digits;
    }
  }

  const prefix = `${sign}${currency}`;
  const unitChunk = unit ? (hasSpaceBeforeUnit ? ` ${unit}` : unit) : "";
  const formatted = `${prefix}${digits}${unitChunk}`;

  return {
    formatted,
    sign,
    currency,
    prefix,
    digits,
    unit,
    hasSpaceBeforeUnit,
    isNegative,
    numericStyle: {
      ...TABULAR_NUM_STYLE,
      fontVariantNumeric: "tabular-nums lining-nums slashed-zero",
      fontFeatureSettings: '"tnum" 1, "lnum" 1, "zero" 1',
    },
    prefixSuperStyle: {
      fontSize: "0.58em",
      verticalAlign: "0.24em",
      marginRight: "0.04em",
      letterSpacing: "-0.02em",
    },
    unitSuperStyle: {
      fontSize: "0.58em",
      verticalAlign: "0.24em",
      marginLeft: hasSpaceBeforeUnit ? "0.14em" : "0.04em",
      letterSpacing: "-0.01em",
    },
  };
}
