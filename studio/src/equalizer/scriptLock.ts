import { z } from "zod";

/**
 * Pillar #15 — Stage 0 Deterministic Script Lock (`scriptLock.ts`)
 *
 * Pure TypeScript, zero-Node-crypto, browser/Remotion & Node identical tokenizer,
 * SHA-256 content locker, WhisperX / syllable-prosody word aligner, FactCatalog
 * extractor, non-breaking lexical unit binder, and burstiness cadence classifier.
 */

export type SentenceId = `S${string}`;
export type TokenId = `S${string}.T${string}`;
export type FactId = `F${string}`;

export const BURSTINESS_CLASSES = [
  "STACCATO_PUNCH",
  "SHORT_PIVOT",
  "ANALYTICAL_CLAIM",
  "DENSE_MECHANISM",
] as const;

export type BurstinessClass = (typeof BURSTINESS_CLASSES)[number];
export const BurstinessClassSchema = z.enum(BURSTINESS_CLASSES);

export const FACT_KINDS = [
  "CURRENCY",
  "PERCENT",
  "YEAR_OR_DATE",
  "PHYSICAL_UNIT",
  "MULTIPLIER",
  "LEGAL_OR_DOC_CITE",
] as const;

export type FactKind = (typeof FACT_KINDS)[number];
export const FactKindSchema = z.enum(FACT_KINDS);

export const ALIGNMENT_SOURCES = [
  "WHISPERX_FORCED",
  "SYNTHETIC_SYLLABLE_CLOCK",
] as const;

export type AlignmentSource = (typeof ALIGNMENT_SOURCES)[number];
export const AlignmentSourceSchema = z.enum(ALIGNMENT_SOURCES);

export interface TimedWordInput {
  readonly word: string;
  readonly startMs?: number;
  readonly endMs?: number;
  readonly startSec?: number;
  readonly endSec?: number;
  readonly startFrame?: number;
  readonly endFrame?: number;
}

export interface ScriptToken {
  readonly id: TokenId;
  readonly text: string;
  readonly gluedText: string;
  readonly normalized: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly pauseAfterMs: number;
  readonly isClauseBoundary: boolean;
  readonly factId?: FactId;
}

export interface ExtractedFact {
  readonly id: FactId;
  readonly verbatim: string;
  readonly gluedDisplay: string;
  readonly kind: FactKind;
  readonly numericValue?: number;
  readonly unitNormalized?: string;
  readonly sentenceId: SentenceId;
  readonly tokenSpan: readonly [TokenId, TokenId];
}

export interface SentenceLock {
  readonly id: SentenceId;
  readonly paragraphIndex: number;
  readonly verbatim: string;
  readonly gluedVerbatim: string;
  readonly wordCount: number;
  readonly startMs: number;
  readonly endMs: number;
  readonly cadenceClass: BurstinessClass;
  readonly tokens: readonly ScriptToken[];
  readonly factIds: readonly FactId[];
}

export interface ScriptLock {
  readonly schemaVersion: "1.0.0";
  readonly scriptSha256: string;
  readonly fps: number;
  readonly totalDurationMs: number;
  readonly alignmentSource: AlignmentSource;
  readonly sentences: readonly SentenceLock[];
  readonly facts: Readonly<Record<string, ExtractedFact>>;
  readonly factList: readonly ExtractedFact[];
}

export interface CreateScriptLockOptions {
  readonly fps?: number;
  readonly wordsPerMinute?: number;
  readonly initialLeadInMs?: number;
}

export const ScriptTokenSchema = z
  .object({
    id: z.string().regex(/^S\d{3,4}\.T\d{2,3}$/),
    text: z.string().min(1),
    gluedText: z.string().min(1),
    normalized: z.string(),
    startMs: z.number().min(0),
    endMs: z.number().min(0),
    pauseAfterMs: z.number().min(0),
    isClauseBoundary: z.boolean(),
    factId: z
      .string()
      .regex(/^F\d{3,4}$/)
      .optional(),
  })
  .strict();

export const ExtractedFactSchema = z
  .object({
    id: z.string().regex(/^F\d{3,4}$/),
    verbatim: z.string().min(1),
    gluedDisplay: z.string().min(1),
    kind: FactKindSchema,
    numericValue: z.number().optional(),
    unitNormalized: z.string().optional(),
    sentenceId: z.string().regex(/^S\d{3,4}$/),
    tokenSpan: z.tuple([
      z.string().regex(/^S\d{3,4}\.T\d{2,3}$/),
      z.string().regex(/^S\d{3,4}\.T\d{2,3}$/),
    ]),
  })
  .strict();

export const SentenceLockSchema = z
  .object({
    id: z.string().regex(/^S\d{3,4}$/),
    paragraphIndex: z.number().int().min(0),
    verbatim: z.string().min(1),
    gluedVerbatim: z.string().min(1),
    wordCount: z.number().int().min(1),
    startMs: z.number().min(0),
    endMs: z.number().min(0),
    cadenceClass: BurstinessClassSchema,
    tokens: z.array(ScriptTokenSchema).min(1),
    factIds: z.array(z.string().regex(/^F\d{3,4}$/)),
  })
  .strict();

export const ScriptLockSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    scriptSha256: z.string().regex(/^[0-9a-f]{64}$/),
    fps: z.number().int().min(24).max(120),
    totalDurationMs: z.number().min(0),
    alignmentSource: AlignmentSourceSchema,
    sentences: z.array(SentenceLockSchema).min(1),
    facts: z.record(z.string(), ExtractedFactSchema),
    factList: z.array(ExtractedFactSchema),
  })
  .strict();

// ============================================================================
// Pure TypeScript FIPS 180-4 SHA-256 (Browser/Remotion + Node Identical)
// ============================================================================

const SHA256_K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr32(value: number, shift: number): number {
  return (value >>> shift) | (value << (32 - shift));
}

function encodeUtf8Bytes(input: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let code = input.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + (((code & 0x3ff) << 10) | (next & 0x3ff));
        i++;
        bytes.push(
          0xf0 | (code >> 18),
          0x80 | ((code >> 12) & 0x3f),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f),
        );
      } else {
        bytes.push(0xef, 0xbf, 0xbd);
      }
    } else {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes;
}

function toHexWord32(value: number): string {
  const unsigned = value >>> 0;
  let hex = unsigned.toString(16);
  while (hex.length < 8) {
    hex = "0" + hex;
  }
  return hex;
}

/**
 * Computes FIPS 180-4 SHA-256 hex digest deterministically in pure TypeScript.
 */
export function sha256Hex(input: string): string {
  const bytes = encodeUtf8Bytes(input);
  const bitLength = bytes.length * 8;

  bytes.push(0x80);
  while ((bytes.length + 8) % 64 !== 0) {
    bytes.push(0x00);
  }

  const highBits = Math.floor(bitLength / 0x100000000);
  const lowBits = bitLength >>> 0;
  bytes.push(
    (highBits >>> 24) & 0xff,
    (highBits >>> 16) & 0xff,
    (highBits >>> 8) & 0xff,
    highBits & 0xff,
    (lowBits >>> 24) & 0xff,
    (lowBits >>> 16) & 0xff,
    (lowBits >>> 8) & 0xff,
    lowBits & 0xff,
  );

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Array<number>(64);

  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let j = 0; j < 16; j++) {
      const idx = offset + j * 4;
      w[j] =
        ((bytes[idx] << 24) |
          (bytes[idx + 1] << 16) |
          (bytes[idx + 2] << 8) |
          bytes[idx + 3]) |
        0;
    }
    for (let j = 16; j < 64; j++) {
      const w15 = w[j - 15];
      const w2 = w[j - 2];
      const s0 = rotr32(w15, 7) ^ rotr32(w15, 18) ^ (w15 >>> 3);
      const s1 = rotr32(w2, 17) ^ rotr32(w2, 19) ^ (w2 >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let j = 0; j < 64; j++) {
      const capS1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + capS1 + ch + SHA256_K[j] + w[j]) | 0;
      const capS0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (capS0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  return (
    toHexWord32(h0) +
    toHexWord32(h1) +
    toHexWord32(h2) +
    toHexWord32(h3) +
    toHexWord32(h4) +
    toHexWord32(h5) +
    toHexWord32(h6) +
    toHexWord32(h7)
  );
}

// ============================================================================
// Formatting, Glue & Lexical Helpers
// ============================================================================

export function padDigits(num: number, minWidth: number): string {
  let str = String(Math.max(0, Math.floor(num)));
  while (str.length < minWidth) {
    str = "0" + str;
  }
  return str;
}

export function formatSentenceId(index1Based: number): SentenceId {
  return `S${padDigits(index1Based, 3)}`;
}

export function formatTokenId(
  sentenceIndex1Based: number,
  tokenIndex1Based: number,
): TokenId {
  return `S${padDigits(sentenceIndex1Based, 3)}.T${padDigits(tokenIndex1Based, 2)}`;
}

export function formatFactId(index1Based: number): FactId {
  return `F${padDigits(index1Based, 3)}`;
}

/**
 * Classifies sentence burstiness cadence strictly by word count:
 * - `STACCATO_PUNCH`: <= 6 words (hard-cut visual slam rule)
 * - `SHORT_PIVOT`: 7..12 words
 * - `ANALYTICAL_CLAIM`: 13..24 words
 * - `DENSE_MECHANISM`: >= 25 words
 */
export function classifySentenceBurstiness(wordCount: number): BurstinessClass {
  if (wordCount <= 6) {
    return "STACCATO_PUNCH";
  }
  if (wordCount <= 12) {
    return "SHORT_PIVOT";
  }
  if (wordCount <= 24) {
    return "ANALYTICAL_CLAIM";
  }
  return "DENSE_MECHANISM";
}

/**
 * Binds currency magnitudes, physical units, dates, legal citations, and table
 * numbers with Unicode non-breaking spaces (`\u00A0`) so multi-line layout never
 * strands units or case parties on an orphan line.
 */
export function applyNonBreakingUnitGlue(text: string): string {
  const nbsp = "\u00A0";
  return text
    .replace(
      /(\$[\d,]+(?:\.\d+)?)\s+(trillion|billion|million|thousand|hundred)\b/gi,
      `$1${nbsp}$2`,
    )
    .replace(
      /(\b\d[\d,]*(?:\.\d+)?)\s+(percent|bps|basis\s+points|GW|gigawatts?|TWh|terawatt-hours?|MW-day|megawatt-days?|MW|megawatts?|kW|kilowatts?|W|watts?|nm|nanometers?)\b/gi,
      `$1${nbsp}$2`,
    )
    .replace(/\b(per)\s+(megawatt-day|MW-day)\b/gi, `$1${nbsp}$2`)
    .replace(/\b(Table|Form|Unit|Section|Chapter|Act|Article)\s+(\d+[A-Za-z]?)\b/g, `$1${nbsp}$2`)
    .replace(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,4})\b/g,
      `$1${nbsp}$2`,
    )
    .replace(/\b(v\.|vs\.)\s+([A-Z][A-Za-z0-9'.-]+)/g, `$1${nbsp}$2`);
}

export function normalizeWordToken(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^[^a-z0-9$%-]+|[^a-z0-9%]+$/g, "")
    .replace(/,/g, "");
}

// ============================================================================
// Spoken English Number Parser (for "eighty-six percent", "two trillion", etc.)
// ============================================================================

const SPOKEN_ONES_TEENS: Readonly<Record<string, number>> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  a: 1,
};

const SPOKEN_TENS: Readonly<Record<string, number>> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const SCALE_MULTIPLIERS: Readonly<Record<string, number>> = {
  hundred: 100,
  thousand: 1e3,
  million: 1e6,
  billion: 1e9,
  trillion: 1e12,
  k: 1e3,
  m: 1e6,
  b: 1e9,
  t: 1e12,
};

export function parseSpokenOrNumericValue(phrase: string): number | undefined {
  const cleaned = phrase
    .toLowerCase()
    .replace(/[$,%]/g, "")
    .trim();

  const directDigitMatch = /^(-?\d[\d,]*(?:\.\d+)?)(?:\s*(trillion|billion|million|thousand|hundred|t|b|m|k))?$/i.exec(
    cleaned,
  );
  if (directDigitMatch) {
    const base = parseFloat(directDigitMatch[1].replace(/,/g, ""));
    if (isNaN(base)) {
      return undefined;
    }
    const scaleKey = directDigitMatch[2] ? directDigitMatch[2].toLowerCase() : "";
    const mult = scaleKey && SCALE_MULTIPLIERS[scaleKey] ? SCALE_MULTIPLIERS[scaleKey] : 1;
    return base * mult;
  }

  // Handle "ninety-nine-point-nine" or "eighty-six" or "four thousand"
  const parts = cleaned.split(/[\s-]+/).filter((p) => p.length > 0);
  if (parts.length === 0) {
    return undefined;
  }

  const pointIdx = parts.indexOf("point");
  if (pointIdx !== -1) {
    const intVal = parseSpokenOrNumericValue(parts.slice(0, pointIdx).join(" "));
    const fracVal = parseSpokenOrNumericValue(parts.slice(pointIdx + 1).join(" "));
    if (intVal !== undefined && fracVal !== undefined) {
      return parseFloat(`${intVal}.${fracVal}`);
    }
  }

  let total = 0;
  let current = 0;
  let matchedAny = false;

  for (let i = 0; i < parts.length; i++) {
    const word = parts[i];
    if (SPOKEN_ONES_TEENS[word] !== undefined) {
      current += SPOKEN_ONES_TEENS[word];
      matchedAny = true;
    } else if (SPOKEN_TENS[word] !== undefined) {
      current += SPOKEN_TENS[word];
      matchedAny = true;
    } else if (word === "hundred") {
      current = (current === 0 ? 1 : current) * 100;
      matchedAny = true;
    } else if (SCALE_MULTIPLIERS[word] !== undefined && SCALE_MULTIPLIERS[word] >= 1000) {
      total += (current === 0 ? 1 : current) * SCALE_MULTIPLIERS[word];
      current = 0;
      matchedAny = true;
    } else {
      return undefined;
    }
  }

  return matchedAny ? total + current : undefined;
}

// ============================================================================
// Paragraph & Sentence Segmentation (Decimal + Legal/Geo Abbreviation Safe)
// ============================================================================

const NON_TERMINAL_ABBREVIATIONS = new Set<string>([
  "v.",
  "vs.",
  "gov.",
  "mr.",
  "mrs.",
  "ms.",
  "dr.",
  "prof.",
  "sen.",
  "rep.",
  "gen.",
  "adm.",
  "col.",
  "st.",
  "no.",
  "fig.",
  "sec.",
  "art.",
  "inc.",
  "corp.",
  "ltd.",
  "co.",
  "jan.",
  "feb.",
  "mar.",
  "apr.",
  "jun.",
  "jul.",
  "aug.",
  "sep.",
  "sept.",
  "oct.",
  "nov.",
  "dec.",
]);

function stripMarkdownInlineDecorators(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitParagraphIntoSentences(paragraph: string): string[] {
  const rawWords = paragraph.split(/\s+/).filter((w) => w.length > 0);
  if (rawWords.length === 0) {
    return [];
  }

  const sentences: string[] = [];
  let buffer: string[] = [];

  for (let i = 0; i < rawWords.length; i++) {
    const word = rawWords[i];
    buffer.push(word);

    const strippedQuotes = word.replace(/["')\]”’]+$/g, "");
    const endsWithPunct = /[.?!]$/.test(strippedQuotes);
    if (!endsWithPunct) {
      continue;
    }

    const lowerToken = strippedQuotes.toLowerCase();
    // Never break on known abbreviations like "v.", "Gov.", "Jan."
    if (NON_TERMINAL_ABBREVIATIONS.has(lowerToken)) {
      continue;
    }

    // Single uppercase initial like "J." in "J. P. Morgan"
    if (/^[A-Z]\.$/.test(strippedQuotes)) {
      continue;
    }

    // Multi-dot acronym like "D.C." or "U.S.": only split if next token starts a new sentence
    if (/^(?:[A-Za-z]\.){2,}$/.test(strippedQuotes)) {
      const nextWord = i + 1 < rawWords.length ? rawWords[i + 1] : "";
      const nextClean = nextWord.replace(/^["'([“‘]+/, "");
      const isLikelySentenceStart =
        nextClean.length === 0 ||
        /^(In|On|At|By|For|From|With|Without|When|While|Once|If|So|And|But|Yet|Now|Right|Look|Watch|Open|Pull|Take|Picture|Keep|Think|Scale|Put|Which|Bring|None|Every|All|Some|Since|Back|Early|Two|Here)\b/.test(
          nextClean,
        );
      if (!isLikelySentenceStart) {
        continue;
      }
    }

    sentences.push(buffer.join(" "));
    buffer = [];
  }

  if (buffer.length > 0) {
    sentences.push(buffer.join(" "));
  }

  return sentences;
}

// ============================================================================
// Prosody & Whisper Word Alignment
// ============================================================================

export function estimateSyllableWeight(tokenText: string): number {
  const clean = tokenText.replace(/[^A-Za-z0-9.$%]/g, "");
  if (clean.length === 0) {
    return 1;
  }
  // Numeric / currency strings take multiple spoken syllables ("$269.92" -> ~6)
  if (/\d/.test(clean)) {
    const digitChars = clean.replace(/[^0-9]/g, "").length;
    const hasCurrency = clean.indexOf("$") !== -1 ? 1.2 : 0;
    const hasDecimal = clean.indexOf(".") !== -1 ? 1.1 : 0;
    const hasPercent = clean.indexOf("%") !== -1 ? 1.4 : 0;
    return Math.max(1.4, digitChars * 0.85 + hasCurrency + hasDecimal + hasPercent);
  }

  const alpha = clean.toLowerCase().replace(/[^a-z]/g, "");
  if (alpha.length <= 3) {
    return 1;
  }
  const withoutSilentE = alpha.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  const vowelGroups = withoutSilentE.match(/[aeiouy]{1,2}/g);
  return Math.max(1, vowelGroups ? vowelGroups.length : 1);
}

function isTokenClauseBoundary(tokenText: string): boolean {
  const stripped = tokenText.replace(/["')\]”’]+$/g, "");
  return /[,;:—.?!]$/.test(stripped) || stripped.endsWith("--");
}

function clausePauseAfterMs(
  tokenText: string,
  isSentenceEnd: boolean,
  cadenceClass: BurstinessClass,
): number {
  if (isSentenceEnd) {
    if (cadenceClass === "STACCATO_PUNCH") {
      return 520;
    }
    if (cadenceClass === "SHORT_PIVOT") {
      return 380;
    }
    return 320;
  }
  const stripped = tokenText.replace(/["')\]”’]+$/g, "");
  if (/[:;—]$/.test(stripped)) {
    return 210;
  }
  if (/,$/.test(stripped)) {
    return 135;
  }
  return 24;
}

interface NormalizedWhisperWord {
  readonly norm: string;
  readonly startMs: number;
  readonly endMs: number;
}

function normalizeTimedWords(
  timedWords: readonly TimedWordInput[],
  fps: number,
): NormalizedWhisperWord[] {
  const out: NormalizedWhisperWord[] = [];
  for (let i = 0; i < timedWords.length; i++) {
    const item = timedWords[i];
    let startMs = 0;
    let endMs = 0;
    if (typeof item.startMs === "number" && typeof item.endMs === "number") {
      startMs = item.startMs;
      endMs = item.endMs;
    } else if (typeof item.startSec === "number" && typeof item.endSec === "number") {
      startMs = Math.round(item.startSec * 1000);
      endMs = Math.round(item.endSec * 1000);
    } else if (typeof item.startFrame === "number" && typeof item.endFrame === "number") {
      startMs = Math.round((item.startFrame / fps) * 1000);
      endMs = Math.round((item.endFrame / fps) * 1000);
    }
    out.push({
      norm: normalizeWordToken(item.word),
      startMs: Math.max(0, startMs),
      endMs: Math.max(startMs + 40, endMs),
    });
  }
  return out;
}

// ============================================================================
// FactCatalog Extraction (Episode 01 & Full Season 1 Patterns)
// ============================================================================

interface RawFactCandidate {
  readonly startTokenIdx: number;
  readonly endTokenIdx: number;
  readonly verbatim: string;
  readonly kind: FactKind;
  readonly numericValue?: number;
  readonly unitNormalized?: string;
  readonly priority: number;
}

function normalizeUnitTag(rawUnit: string): string {
  const lower = rawUnit.toLowerCase().replace(/\s+/g, "-");
  if (lower === "gw" || lower.indexOf("gigawatt") === 0) return "GW";
  if (lower === "twh" || lower.indexOf("terawatt-hour") === 0) return "TWh";
  if (lower === "mw-day" || lower.indexOf("megawatt-day") !== -1) return "MW-day";
  if (lower === "mw" || lower.indexOf("megawatt") === 0) return "MW";
  if (lower === "kw" || lower.indexOf("kilowatt") === 0) return "kW";
  if (lower === "w" || lower.indexOf("watt") === 0) return "W";
  if (lower === "nm" || lower.indexOf("nanometer") === 0) return "nm";
  if (lower === "bps" || lower.indexOf("basis-point") === 0) return "bps";
  if (lower.indexOf("ration-point") !== -1 || lower === "points") return "points";
  return rawUnit;
}

interface CharSpan {
  readonly startChar: number;
  readonly endChar: number;
  readonly tokenIdx: number;
}

function mapCharRangeToTokenSpan(
  charSpans: readonly CharSpan[],
  startChar: number,
  endChar: number,
): [number, number] | undefined {
  let first = -1;
  let last = -1;
  for (let i = 0; i < charSpans.length; i++) {
    const cs = charSpans[i];
    if (cs.endChar > startChar && cs.startChar < endChar) {
      if (first === -1) {
        first = cs.tokenIdx;
      }
      last = cs.tokenIdx;
    }
  }
  return first !== -1 && last !== -1 ? [first, last] : undefined;
}

function collectPatternMatches(
  sentenceText: string,
  charSpans: readonly CharSpan[],
  regex: RegExp,
  priority: number,
  builder: (match: RegExpExecArray) => {
    kind: FactKind;
    numericValue?: number;
    unitNormalized?: string;
    verbatimOverride?: string;
  } | null,
): RawFactCandidate[] {
  const found: RawFactCandidate[] = [];
  regex.lastIndex = 0;
  let match: RegExpExecArray | null = regex.exec(sentenceText);
  while (match !== null) {
    const built = builder(match);
    if (built) {
      const span = mapCharRangeToTokenSpan(
        charSpans,
        match.index,
        match.index + match[0].length,
      );
      if (span) {
        const cleanVerbatim = (built.verbatimOverride ?? match[0])
          .replace(/^[,;:\s]+|[,;:.?!\s]+$/g, "")
          .trim();
        if (cleanVerbatim.length > 0) {
          found.push({
            startTokenIdx: span[0],
            endTokenIdx: span[1],
            verbatim: cleanVerbatim,
            kind: built.kind,
            numericValue: built.numericValue,
            unitNormalized: built.unitNormalized,
            priority,
          });
        }
      }
    }
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    match = regex.exec(sentenceText);
  }
  return found;
}

export function extractSentenceFactCandidates(
  sentenceText: string,
  rawTokens: readonly string[],
): RawFactCandidate[] {
  const charSpans: CharSpan[] = [];
  let cursor = 0;
  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];
    const foundAt = sentenceText.indexOf(tok, cursor);
    const startChar = foundAt !== -1 ? foundAt : cursor;
    const endChar = startChar + tok.length;
    charSpans.push({ startChar, endChar, tokenIdx: i });
    cursor = endChar;
  }

  const candidates: RawFactCandidate[] = [];

  // 1. Currencies: "$40.5 trillion", "$269.92 per megawatt-day", "-$42B", "$3,400"
  const currencyRegex =
    /-?\$[\d,]+(?:\.\d+)?(?:\s*(?:trillion|billion|million|thousand|T|B|M|k))?(?:\s+per\s+(?:megawatt-day|MW-day)|\/MW-day)?/gi;
  const currencyMatches = collectPatternMatches(
    sentenceText,
    charSpans,
    currencyRegex,
    100,
    (m) => {
      const raw = m[0];
      const coreNumStr = raw
        .replace(/\s+per\s+(?:megawatt-day|MW-day)|\/MW-day/gi, "")
        .trim();
      const numericValue = parseSpokenOrNumericValue(coreNumStr);
      const hasMwDay = /megawatt-day|MW-day/i.test(raw);
      return {
        kind: "CURRENCY",
        numericValue,
        unitNormalized: hasMwDay ? "USD/MW-day" : "USD",
      };
    },
  );
  for (let i = 0; i < currencyMatches.length; i++) candidates.push(currencyMatches[i]);

  // Spoken dollar amounts: "two trillion dollars", "four thousand dollars", "zero dollars"
  const spokenCurrencyRegex =
    /\b((?:zero|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)(?:[\s-]+(?:one|two|three|four|five|six|seven|eight|nine|hundred|thousand|million|billion|trillion))*)\s+dollars\b/gi;
  const spokenCurrencyMatches = collectPatternMatches(
    sentenceText,
    charSpans,
    spokenCurrencyRegex,
    92,
    (m) => ({
      kind: "CURRENCY",
      numericValue: parseSpokenOrNumericValue(m[1]),
      unitNormalized: "USD",
    }),
  );
  for (let i = 0; i < spokenCurrencyMatches.length; i++) {
    candidates.push(spokenCurrencyMatches[i]);
  }

  // 2. Ratios & Multipliers: "100:1", "10x", "two-thirds", or >=200% spikes ("833 percent")
  const ratioRegex = /\b(\d+)\s*:\s*(\d+)\b|\b(\d+(?:\.\d+)?)x\b|\btwo-thirds\b/gi;
  const ratioMatches = collectPatternMatches(
    sentenceText,
    charSpans,
    ratioRegex,
    95,
    (m) => {
      if (m[0].toLowerCase() === "two-thirds") {
        return { kind: "MULTIPLIER", numericValue: 0.6667, unitNormalized: "ratio" };
      }
      if (m[1] && m[2]) {
        const denom = parseFloat(m[2]);
        return {
          kind: "MULTIPLIER",
          numericValue: denom !== 0 ? parseFloat(m[1]) / denom : parseFloat(m[1]),
          unitNormalized: "ratio",
        };
      }
      return {
        kind: "MULTIPLIER",
        numericValue: m[3] ? parseFloat(m[3]) : undefined,
        unitNormalized: "x",
      };
    },
  );
  for (let i = 0; i < ratioMatches.length; i++) candidates.push(ratioMatches[i]);

  // 3. Percentages (numeric & spoken): "84.1 percent", "833%", "eighty-six percent", "ninety-nine-point-nine percent"
  const digitPercentRegex = /\b(\d[\d,]*(?:\.\d+)?)\s*(?:%|percent)\b/gi;
  const digitPercentMatches = collectPatternMatches(
    sentenceText,
    charSpans,
    digitPercentRegex,
    96,
    (m) => {
      const val = parseFloat(m[1].replace(/,/g, ""));
      const isSpikeMultiplier = !isNaN(val) && val >= 200;
      return {
        kind: isSpikeMultiplier ? "MULTIPLIER" : "PERCENT",
        numericValue: isNaN(val) ? undefined : val,
        unitNormalized: "%",
      };
    },
  );
  for (let i = 0; i < digitPercentMatches.length; i++) {
    candidates.push(digitPercentMatches[i]);
  }

  const spokenPercentRegex =
    /\b((?:one\s+hundred|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[\s-]+(?:point|zero|one|two|three|four|five|six|seven|eight|nine|hundred))*)\s+percent\b/gi;
  const spokenPercentMatches = collectPatternMatches(
    sentenceText,
    charSpans,
    spokenPercentRegex,
    90,
    (m) => {
      const val = parseSpokenOrNumericValue(m[1]);
      return {
        kind: val !== undefined && val >= 200 ? "MULTIPLIER" : "PERCENT",
        numericValue: val,
        unitNormalized: "%",
      };
    },
  );
  for (let i = 0; i < spokenPercentMatches.length; i++) {
    candidates.push(spokenPercentMatches[i]);
  }

  // 4. Physical Units: GW, TWh, MW-day, kW, W, nm, bps, ration points
  const unitRegex =
    /\b((?:\d[\d,]*(?:\.\d+)?|a\s+thousand|one|five|ten|sixteen))\s*(GW|gigawatts?|TWh|terawatt-hours?|MW-day|megawatt-days?|MW|megawatts?|kW|kilowatts?|W|watts?|nm|nanometers?|bps|basis\s+points|ration\s+points)\b/gi;
  const unitMatches = collectPatternMatches(
    sentenceText,
    charSpans,
    unitRegex,
    94,
    (m) => ({
      kind: "PHYSICAL_UNIT",
      numericValue: parseSpokenOrNumericValue(m[1]),
      unitNormalized: normalizeUnitTag(m[2]),
    }),
  );
  for (let i = 0; i < unitMatches.length; i++) candidates.push(unitMatches[i]);

  // 5. Primary Documents, Statutes, Court Rulings & Institutional Exhibits
  const legalCiteRegex =
    /\b([A-Z][A-Za-z'.-]+\s+v\.\s+[A-Z][A-Za-z'.-]+|Table\s+\d+|Form\s+\d+|Monthly\s+Treasury\s+Statement|Congressional\s+Budget\s+Office|Fair\s+Labor\s+Standards\s+Act|GENIUS\s+Act|Permanent\s+Fund\s+Dividend|American\s+Equity\s+Fund|Universal\s+Basic\s+Compute|International\s+Energy\s+Agency|Alaska\s+Supreme\s+Court|Ministry\s+of\s+Food|Three\s+Mile\s+Island|PJM)\b/g;
  const legalMatches = collectPatternMatches(
    sentenceText,
    charSpans,
    legalCiteRegex,
    98,
    () => ({
      kind: "LEGAL_OR_DOC_CITE",
    }),
  );
  for (let i = 0; i < legalMatches.length; i++) candidates.push(legalMatches[i]);

  // 6. Dates & Years: "October 29, 2026", "December 1, 1941", "July 2026", "fiscal 2026", "1930s", "2036"
  const fullDateRegex =
    /\b(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:\d{1,2},\s+)?(19\d{2}|20\d{2})|(?:late|early|fiscal|Q[1-4])\s+(19\d{2}|20\d{2})|(19\d{2}s|20\d{2}s)|(19\d{2}|20\d{2}))\b/g;
  const dateMatches = collectPatternMatches(
    sentenceText,
    charSpans,
    fullDateRegex,
    80,
    (m) => {
      const yearDigits = /\b(19\d{2}|20\d{2})/.exec(m[0]);
      return {
        kind: "YEAR_OR_DATE",
        numericValue: yearDigits ? parseInt(yearDigits[1], 10) : undefined,
        unitNormalized: "year",
      };
    },
  );
  for (let i = 0; i < dateMatches.length; i++) candidates.push(dateMatches[i]);

  // Deduplicate overlapping token spans by highest priority then widest span, sorted by token position
  candidates.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    const lenA = a.endTokenIdx - a.startTokenIdx;
    const lenB = b.endTokenIdx - b.startTokenIdx;
    if (lenB !== lenA) {
      return lenB - lenA;
    }
    return a.startTokenIdx - b.startTokenIdx;
  });

  const occupiedTokens = new Set<number>();
  const accepted: RawFactCandidate[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    let overlaps = false;
    for (let t = cand.startTokenIdx; t <= cand.endTokenIdx; t++) {
      if (occupiedTokens.has(t)) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) {
      for (let t = cand.startTokenIdx; t <= cand.endTokenIdx; t++) {
        occupiedTokens.add(t);
      }
      accepted.push(cand);
    }
  }

  accepted.sort((a, b) => a.startTokenIdx - b.startTokenIdx);
  return accepted;
}

// ============================================================================
// Primary Entry Point: `createScriptLock`
// ============================================================================

/**
 * Tokenizes a markdown script deterministically into an immutable `ScriptLock`
 * (`scriptSha256`, `SentenceLock[]`, `ScriptToken[]`, `ExtractedFact` catalog,
 * non-breaking unit glue, and burstiness cadence classes).
 */
export function createScriptLock(
  markdownText: string,
  timedWords?: readonly TimedWordInput[],
  options?: CreateScriptLockOptions,
): ScriptLock {
  const fps = options?.fps ?? 60;
  const wordsPerMinute = options?.wordsPerMinute ?? 155;
  const initialLeadInMs = options?.initialLeadInMs ?? 120;

  const canonicalScript = markdownText.replace(/\r\n/g, "\n").trim();
  const scriptSha256 = sha256Hex(canonicalScript);

  const rawParagraphs = canonicalScript
    .split(/\n\s*\n+/)
    .map((p) => stripMarkdownInlineDecorators(p))
    .filter((p) => p.length > 0);

  const normalizedWhisper =
    timedWords && timedWords.length > 0 ? normalizeTimedWords(timedWords, fps) : [];
  const hasWhisper = normalizedWhisper.length > 0;
  const alignmentSource: AlignmentSource = hasWhisper
    ? "WHISPERX_FORCED"
    : "SYNTHETIC_SYLLABLE_CLOCK";

  // Average syllable duration calibrated so mean 1.45 syllables/word matches target WPM
  const msPerWordMean = 60000 / Math.max(90, wordsPerMinute);
  const msPerSyllableUnit = msPerWordMean / 1.55;

  const sentences: SentenceLock[] = [];
  const factsRecord: Record<string, ExtractedFact> = {};
  const factList: ExtractedFact[] = [];

  let sentenceCounter = 0;
  let factCounter = 0;
  let clockCursorMs = initialLeadInMs;
  let whisperCursor = 0;

  for (let pIdx = 0; pIdx < rawParagraphs.length; pIdx++) {
    const paraSentences = splitParagraphIntoSentences(rawParagraphs[pIdx]);
    for (let sLocal = 0; sLocal < paraSentences.length; sLocal++) {
      const sentenceText = paraSentences[sLocal];
      const rawWords = sentenceText.split(/\s+/).filter((w) => w.length > 0);
      if (rawWords.length === 0) {
        continue;
      }

      sentenceCounter++;
      const sentenceId = formatSentenceId(sentenceCounter);
      const wordCount = rawWords.length;
      const cadenceClass = classifySentenceBurstiness(wordCount);
      const gluedVerbatim = applyNonBreakingUnitGlue(sentenceText);

      // Extract facts on this sentence
      const rawFacts = extractSentenceFactCandidates(sentenceText, rawWords);
      const tokenIdxToFactId: Record<number, FactId> = {};
      const sentenceFactIds: FactId[] = [];

      // Pre-allocate token timings
      const tokenStarts: number[] = new Array<number>(wordCount);
      const tokenEnds: number[] = new Array<number>(wordCount);
      const tokenPauses: number[] = new Array<number>(wordCount);

      if (hasWhisper) {
        for (let tIdx = 0; tIdx < wordCount; tIdx++) {
          const normTarget = normalizeWordToken(rawWords[tIdx]);
          let matchedWhisperIdx = -1;
          const maxLookahead = Math.min(normalizedWhisper.length, whisperCursor + 8);
          for (let candIdx = whisperCursor; candIdx < maxLookahead; candIdx++) {
            const wNorm = normalizedWhisper[candIdx].norm;
            if (
              wNorm === normTarget ||
              (normTarget.length >= 3 &&
                (wNorm.indexOf(normTarget) === 0 || normTarget.indexOf(wNorm) === 0))
            ) {
              matchedWhisperIdx = candIdx;
              break;
            }
          }

          if (matchedWhisperIdx !== -1) {
            const hit = normalizedWhisper[matchedWhisperIdx];
            const startMs = Math.max(clockCursorMs, hit.startMs);
            const endMs = Math.max(startMs + 45, hit.endMs);
            tokenStarts[tIdx] = startMs;
            tokenEnds[tIdx] = endMs;
            clockCursorMs = endMs;
            whisperCursor = matchedWhisperIdx + 1;
          } else {
            const durMs = Math.max(
              70,
              Math.round(estimateSyllableWeight(rawWords[tIdx]) * msPerSyllableUnit),
            );
            const startMs = clockCursorMs;
            const endMs = startMs + durMs;
            tokenStarts[tIdx] = startMs;
            tokenEnds[tIdx] = endMs;
            clockCursorMs = endMs;
          }
        }

        for (let tIdx = 0; tIdx < wordCount; tIdx++) {
          const isLastInSentence = tIdx === wordCount - 1;
          if (!isLastInSentence) {
            tokenPauses[tIdx] = Math.max(0, tokenStarts[tIdx + 1] - tokenEnds[tIdx]);
          } else {
            const nextWhisper =
              whisperCursor < normalizedWhisper.length
                ? normalizedWhisper[whisperCursor]
                : undefined;
            tokenPauses[tIdx] = nextWhisper
              ? Math.max(0, nextWhisper.startMs - tokenEnds[tIdx])
              : clausePauseAfterMs(rawWords[tIdx], true, cadenceClass);
            clockCursorMs = tokenEnds[tIdx] + tokenPauses[tIdx];
          }
        }
      } else {
        for (let tIdx = 0; tIdx < wordCount; tIdx++) {
          const isLastInSentence = tIdx === wordCount - 1;
          const weight = estimateSyllableWeight(rawWords[tIdx]);
          const durMs = Math.max(80, Math.round(weight * msPerSyllableUnit));
          const pauseMs = clausePauseAfterMs(
            rawWords[tIdx],
            isLastInSentence,
            cadenceClass,
          );
          const extraParagraphBreath =
            isLastInSentence && sLocal === paraSentences.length - 1 ? 160 : 0;

          tokenStarts[tIdx] = clockCursorMs;
          tokenEnds[tIdx] = clockCursorMs + durMs;
          tokenPauses[tIdx] = pauseMs + extraParagraphBreath;
          clockCursorMs = tokenEnds[tIdx] + tokenPauses[tIdx];
        }
      }

      // Build extracted facts with exact TokenId spans
      for (let fIdx = 0; fIdx < rawFacts.length; fIdx++) {
        const rf = rawFacts[fIdx];
        factCounter++;
        const factId = formatFactId(factCounter);
        const startTokenId = formatTokenId(sentenceCounter, rf.startTokenIdx + 1);
        const endTokenId = formatTokenId(sentenceCounter, rf.endTokenIdx + 1);

        const extractedFact: ExtractedFact = {
          id: factId,
          verbatim: rf.verbatim,
          gluedDisplay: applyNonBreakingUnitGlue(rf.verbatim),
          kind: rf.kind,
          ...(rf.numericValue !== undefined ? { numericValue: rf.numericValue } : {}),
          ...(rf.unitNormalized !== undefined
            ? { unitNormalized: rf.unitNormalized }
            : {}),
          sentenceId,
          tokenSpan: [startTokenId, endTokenId],
        };

        factsRecord[factId] = extractedFact;
        factList.push(extractedFact);
        sentenceFactIds.push(factId);

        for (let t = rf.startTokenIdx; t <= rf.endTokenIdx; t++) {
          tokenIdxToFactId[t] = factId;
        }
      }

      const tokens: ScriptToken[] = [];
      for (let tIdx = 0; tIdx < wordCount; tIdx++) {
        const tokenId = formatTokenId(sentenceCounter, tIdx + 1);
        const rawTok = rawWords[tIdx];
        const attachedFactId = tokenIdxToFactId[tIdx];
        tokens.push({
          id: tokenId,
          text: rawTok,
          gluedText: applyNonBreakingUnitGlue(rawTok),
          normalized: normalizeWordToken(rawTok),
          startMs: tokenStarts[tIdx],
          endMs: tokenEnds[tIdx],
          pauseAfterMs: tokenPauses[tIdx],
          isClauseBoundary: isTokenClauseBoundary(rawTok),
          ...(attachedFactId ? { factId: attachedFactId } : {}),
        });
      }

      sentences.push({
        id: sentenceId,
        paragraphIndex: pIdx,
        verbatim: sentenceText,
        gluedVerbatim,
        wordCount,
        startMs: tokens[0].startMs,
        endMs: tokens[tokens.length - 1].endMs,
        cadenceClass,
        tokens,
        factIds: sentenceFactIds,
      });
    }
  }

  const totalDurationMs =
    sentences.length > 0
      ? sentences[sentences.length - 1].endMs +
        sentences[sentences.length - 1].tokens[
          sentences[sentences.length - 1].tokens.length - 1
        ].pauseAfterMs
      : 0;

  return {
    schemaVersion: "1.0.0",
    scriptSha256,
    fps,
    totalDurationMs,
    alignmentSource,
    sentences,
    facts: factsRecord,
    factList,
  };
}

interface ScriptLockLookupIndex {
  readonly sentenceIndexById: Map<string, number>;
  readonly tokenById: Map<string, ScriptToken>;
}

const SCRIPT_LOCK_INDEX_CACHE = new WeakMap<ScriptLock, ScriptLockLookupIndex>();

function getOrBuildScriptLockIndex(scriptLock: ScriptLock): ScriptLockLookupIndex {
  const existing = SCRIPT_LOCK_INDEX_CACHE.get(scriptLock);
  if (existing) {
    return existing;
  }
  const sentenceIndexById = new Map<string, number>();
  const tokenById = new Map<string, ScriptToken>();
  for (let i = 0; i < scriptLock.sentences.length; i++) {
    const sent = scriptLock.sentences[i];
    sentenceIndexById.set(sent.id, i);
    for (let j = 0; j < sent.tokens.length; j++) {
      const tok = sent.tokens[j];
      tokenById.set(tok.id, tok);
    }
  }
  const created: ScriptLockLookupIndex = { sentenceIndexById, tokenById };
  SCRIPT_LOCK_INDEX_CACHE.set(scriptLock, created);
  return created;
}

/**
 * Resolves a slice of `SentenceLock` items covering `[startSentenceId, endSentenceId]` inclusive.
 */
export function getSentenceSpan(
  scriptLock: ScriptLock,
  sentenceRange: readonly [string, string],
): readonly SentenceLock[] {
  const index = getOrBuildScriptLockIndex(scriptLock);
  const startIdx = index.sentenceIndexById.get(sentenceRange[0]);
  const endIdx = index.sentenceIndexById.get(sentenceRange[1]);
  if (startIdx === undefined || endIdx === undefined || endIdx < startIdx) {
    return [];
  }
  return scriptLock.sentences.slice(startIdx, endIdx + 1);
}

/**
 * Looks up a `ScriptToken` by `TokenId` (`"S095.T24"`).
 */
export function findTokenById(
  scriptLock: ScriptLock,
  tokenId: string,
): ScriptToken | undefined {
  return getOrBuildScriptLockIndex(scriptLock).tokenById.get(tokenId);
}
