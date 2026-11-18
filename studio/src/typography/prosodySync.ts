import { z } from "zod";

/**
 * Whisper `words.json` word item emitted by `tools/transcribe.py`.
 */
export const WhisperWordSchema = z.object({
  word: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSec: z.number().optional(),
  endSec: z.number().optional(),
});

export const WhisperWordsFileSchema = z.object({
  text: z.string().optional(),
  language: z.string().optional(),
  durationSec: z.number().optional(),
  words: z.array(WhisperWordSchema),
});

export type WhisperWord = z.infer<typeof WhisperWordSchema> & {
  start?: number;
  end?: number;
  syllables?: number;
  pauseAfterFrames?: number;
  isNumeric?: boolean;
  isEmphasis?: boolean;
};

/**
 * Backward-compatible `TimedWord` interface supporting both legacy Remotion
 * `{ word, start, end }` callers and Whisper `{ word, startFrame, endFrame }` arrays.
 */
export interface TimedWord {
  word: string;
  /** Beat-local or timeline start frame */
  start: number;
  /** Beat-local or timeline end frame */
  end?: number;
  /** Explicit frame alias matching Whisper `words.json` */
  startFrame?: number;
  /** Explicit frame alias matching Whisper `words.json` */
  endFrame?: number;
  startSec?: number;
  endSec?: number;
  syllables?: number;
  pauseAfterFrames?: number;
  isNumeric?: boolean;
  isEmphasis?: boolean;
}

export type AnyTimedWord = TimedWord | WhisperWord;

/**
 * Fully normalized word timing record with guaranteed frame bounds and prosodic metadata.
 */
export interface ResolvedTimedWord extends TimedWord {
  word: string;
  cleanWord: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
  syllables: number;
  pauseAfterFrames: number;
  isNumeric: boolean;
  isEmphasis: boolean;
  isBurstinessPunch: boolean;
}

export interface PhraseChunk {
  index: number;
  text: string;
  words: ResolvedTimedWord[];
  startFrame: number;
  endFrame: number;
  hasNumeric: boolean;
  isEmphasis: boolean;
}

export interface SynthesizeProsodyOptions {
  /** Beat-local frame offset where speech begins (default: 0) */
  startFrame?: number;
}

export interface BeatSyncOptions {
  fps?: number;
  /** Beat-local frame offset added after rebasing (default: 0) */
  atFrame?: number;
  /** Rebase global timeline frames `[beatStartFrame, beatEndFrame]` to `[atFrame, ...]` (default: true) */
  rebaseToLocal?: boolean;
}

const UNSTRESSED_FUNCTION_WORDS = new Set<string>([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "at",
  "for",
  "and",
  "or",
  "by",
  "as",
  "is",
  "it",
  "be",
  "are",
  "was",
  "from",
  "with",
  "that",
]);

const NUMERIC_SCALE_WORDS = new Set<string>([
  "trillion",
  "trillions",
  "billion",
  "billions",
  "million",
  "millions",
  "thousand",
  "percent",
  "percentage",
  "bps",
  "basis",
  "gw",
  "twh",
  "mwh",
  "mw",
  "mw-day",
  "zero",
]);

const NON_TERMINAL_ABBREVS = new Set<string>([
  "u.s.",
  "u.k.",
  "e.g.",
  "i.e.",
  "vs.",
  "dr.",
  "mr.",
  "mrs.",
  "ms.",
  "no.",
  "fig.",
  "sec.",
  "st.",
  "inc.",
  "corp.",
  "jan.",
  "feb.",
  "mar.",
  "apr.",
  "aug.",
  "sept.",
  "oct.",
  "nov.",
  "dec.",
]);

const PHRASE_BREAK_LEADERS = new Set<string>([
  "while",
  "but",
  "yet",
  "because",
  "until",
  "where",
  "when",
  "which",
  "versus",
  "vs",
  "vs.",
  "instead",
  "across",
  "under",
  "inside",
  "against",
]);

function stripEdgePunctuation(token: string): string {
  return token.replace(/^[^A-Za-z0-9$€£¥+-]+|[^A-Za-z0-9%]+$/g, "");
}

/**
 * Detects whether a token carries numeric figures, currencies, ratios, or fiscal/energy units.
 */
export function isNumericOrUnitToken(word: string): boolean {
  const clean = stripEdgePunctuation(word);
  if (!clean) return false;
  if (/\d/.test(clean)) return true;
  if (/^[$€£¥]/.test(clean)) return true;
  return NUMERIC_SCALE_WORDS.has(clean.toLowerCase());
}

function estimateDigitGroupSyllables(digitRun: string): number {
  const digitsOnly = digitRun.replace(/,/g, "");
  const len = digitsOnly.length;
  if (len <= 0) return 0;
  if (len === 1) return digitsOnly === "7" ? 2 : 1;
  if (len === 2) return 2;
  if (len === 3) return 4; // e.g. "833" -> "eight hundred thirty-three" (~4-5 rapid syllables)
  if (len === 4) return 4; // e.g. "1941" -> "nineteen forty-one"
  return Math.min(8, Math.ceil(len * 1.25));
}

/**
 * Deterministic spoken-syllable estimator handling prose, acronyms, currencies,
 * decimals (`$40.5`), ratios (`100:1`), percentages (`+833%`), and units (`bps`, `TWh`).
 */
export function estimateWordSyllables(word: string): number {
  const trimmed = word.trim();
  if (!trimmed) return 1;

  let syllables = 0;

  // Currency or explicit sign spoken aloud ("dollars", "minus", "plus")
  if (/[$€£¥]/.test(trimmed)) syllables += 1;
  if (/^[+\-−]\d|^[+\-−][$€£¥]/.test(trimmed)) syllables += 1;
  if (/%/.test(trimmed)) syllables += 2; // "percent"

  // Numeric runs including decimals and ratios
  const numericParts = trimmed.match(/\d[\d,]*(?:[.:]\d[\d,]*)*/g);
  if (numericParts) {
    for (const part of numericParts) {
      if (part.indexOf(".") !== -1) {
        const sub = part.split(".");
        syllables += estimateDigitGroupSyllables(sub[0] ?? "");
        syllables += 1; // "point"
        for (let i = 1; i < sub.length; i++) {
          syllables += Math.max(1, (sub[i] ?? "").length);
        }
      } else if (part.indexOf(":") !== -1) {
        const sub = part.split(":");
        syllables += estimateDigitGroupSyllables(sub[0] ?? "");
        syllables += 1; // "to"
        syllables += estimateDigitGroupSyllables(sub[1] ?? "");
      } else {
        syllables += estimateDigitGroupSyllables(part);
      }
    }
  }

  // Alphabetic segments (words, unit suffixes like TWh / bps / MW-day, or initialisms)
  const alphaMatches = trimmed.match(/[A-Za-z]+/g);
  if (alphaMatches) {
    for (const alpha of alphaMatches) {
      const lower = alpha.toLowerCase();
      if (lower === "bps") {
        syllables += 3; // "basis points"
        continue;
      }
      if (lower === "twh" || lower === "gwh" || lower === "mwh") {
        syllables += 4;
        continue;
      }
      if (lower === "gw" || lower === "mw") {
        syllables += 3;
        continue;
      }
      if (alpha.length >= 2 && alpha.length <= 5 && alpha === alpha.toUpperCase()) {
        // Pronounced letter-by-letter initialism (CBO, GDP, IRS, PJM)
        syllables += alpha.length;
        continue;
      }

      // Standard English vowel-cluster heuristic
      if (lower.length <= 3) {
        syllables += lower === "area" || lower === "via" ? 2 : 1;
        continue;
      }

      let wordSyl = 0;
      const vowelGroups = lower.match(/[aeiouy]+/g);
      wordSyl += vowelGroups ? vowelGroups.length : 1;

      // Silent trailing 'e' (excluding syllabic '-le' such as "table", "double")
      if (
        lower.endsWith("e") &&
        !lower.endsWith("le") &&
        !/[aeiouy]e$/.test(lower) &&
        wordSyl > 1
      ) {
        wordSyl -= 1;
      }

      // Silent '-ed' after voiceless/voiced non-coronal consonants ("taxed", "dropped")
      if (
        lower.length > 4 &&
        lower.endsWith("ed") &&
        !/[td]ed$/.test(lower) &&
        wordSyl > 1
      ) {
        wordSyl -= 1;
      }

      // Diaeresis / hiatus clusters ("trillion" -> 2-3, "treasury", "ratio")
      if (/(?:ia|io|iu|ua|uo)/.test(lower) && !/(?:tion|sion|cia)/.test(lower)) {
        wordSyl += 1;
      }

      syllables += Math.max(1, wordSyl);
    }
  }

  return Math.max(1, syllables);
}

/**
 * Computes deterministic post-word prosodic pause frames:
 * - Comma / semicolon / colon: +4f (at 30fps)
 * - Em-dash / double hyphen:   +5f (at 30fps)
 * - Sentence-final . ? ! …:    +8f (at 30fps)
 */
export function detectTrailingPauseFrames(word: string, fps: number = 30): number {
  const trimmed = word.trim();
  if (!trimmed) return 0;

  const fpsScale = Math.max(0.5, fps / 30);
  const lower = trimmed.toLowerCase();

  if (NON_TERMINAL_ABBREVS.has(lower)) {
    return Math.max(1, Math.round(2 * fpsScale));
  }

  // Strip closing quotes/brackets when inspecting punctuation
  const core = trimmed.replace(/['"”’)\]]+$/g, "");

  if (/[.?!…]+$/.test(core)) {
    return Math.max(1, Math.round(8 * fpsScale));
  }
  if (/(?:[—–]|--)$/.test(core)) {
    return Math.max(1, Math.round(5 * fpsScale));
  }
  if (/[,;:]$/.test(core)) {
    return Math.max(1, Math.round(4 * fpsScale));
  }
  return 0;
}

/**
 * Deterministic Syllable & Punctuation Prosody Estimator.
 * Synthesizes natural word-level frame timings when Whisper `timedWords` is absent:
 * - Weights spoken duration by syllable count & numeric density (`$40.5 trillion` >> `the`)
 * - Inserts +4f comma pauses and +8f period/question pauses
 * - Applies `<= 6`-word burstiness punch holds so short Maxinomics/Fisher beats land crisp and hold!
 */
export function synthesizeTimedWords(
  text: string,
  durationFrames: number,
  fps: number = 30,
  options?: SynthesizeProsodyOptions
): ResolvedTimedWord[] {
  const startOffset = options?.startFrame ?? 0;
  const safeDuration = Math.max(1, Math.round(durationFrames));
  const safeFps = Math.max(1, fps);

  const rawTokens = text.trim() ? text.trim().split(/\s+/) : [];
  if (rawTokens.length === 0) {
    return [];
  }

  const wordCount = rawTokens.length;
  const isBurstinessPunch = wordCount <= 6;

  // Compute prosodic speaking weights and inter-word punctuation pauses
  const metas = rawTokens.map((token, idx) => {
    const cleanWord = stripEdgePunctuation(token) || token;
    const lowerClean = cleanWord.toLowerCase();
    const syllables = estimateWordSyllables(token);
    const isNumeric = isNumericOrUnitToken(token);
    const isAllCaps =
      cleanWord.length >= 3 &&
      /[A-Z]/.test(cleanWord) &&
      cleanWord === cleanWord.toUpperCase();
    const isLastWord = idx === wordCount - 1;
    const isFunctionWord =
      !isLastWord && !isNumeric && UNSTRESSED_FUNCTION_WORDS.has(lowerClean);

    let speakWeight: number;
    if (isFunctionWord) {
      speakWeight = 0.66;
    } else if (isNumeric) {
      // Numbers & units require deliberate vocal articulation
      speakWeight = syllables * 1.32 + 0.35;
    } else {
      speakWeight = syllables * 1.0;
    }

    if (isAllCaps && !isNumeric) {
      speakWeight *= 1.15;
    }
    if (isBurstinessPunch && isLastWord) {
      // Punchline terminal word receives extra rhetorical weight
      speakWeight *= 1.35;
    }

    // Inter-word pause applies after words 0..N-2; final word transitions into beat tail hold
    const rawPauseAfter = isLastWord ? 0 : detectTrailingPauseFrames(token, safeFps);

    return {
      word: token,
      cleanWord,
      syllables,
      isNumeric,
      isEmphasis: isNumeric || isAllCaps || (isBurstinessPunch && isLastWord),
      speakWeight,
      rawPauseAfter,
    };
  });

  // Reserve clean tail reading hold:
  // <=6-word burstiness beats finish speaking around 58%-66% and hold the punchline cleanly!
  // Longer sentences finish speaking around 86% so the final word still reads comfortably.
  const activeRatio = isBurstinessPunch
    ? wordCount <= 2
      ? 0.52
      : wordCount <= 4
      ? 0.58
      : 0.65
    : 0.86;

  const activeBudgetFrames = Math.max(
    wordCount,
    Math.min(safeDuration, Math.round(safeDuration * activeRatio))
  );

  const totalRawPauses = metas.reduce((acc, m) => acc + m.rawPauseAfter, 0);
  const minSpeakBudget = wordCount * 2;

  // Preserve exact +4f comma and +8f period pauses whenever budget allows; scale gracefully on micro-beats
  const maxAllowedPauseTotal = Math.max(0, activeBudgetFrames - minSpeakBudget);
  const pauseScale =
    totalRawPauses > 0 && totalRawPauses > maxAllowedPauseTotal
      ? maxAllowedPauseTotal / totalRawPauses
      : 1;

  const scaledPauses = metas.map((m) => Math.floor(m.rawPauseAfter * pauseScale));
  const usedPauseFrames = scaledPauses.reduce((acc, p) => acc + p, 0);
  const speakFramesBudget = Math.max(wordCount, activeBudgetFrames - usedPauseFrames);
  const totalSpeakWeight = metas.reduce((acc, m) => acc + m.speakWeight, 0) || 1;

  // Distribute integer speaking frames deterministically via largest-remainder rounding
  const exactAllocations = metas.map(
    (m) => (m.speakWeight / totalSpeakWeight) * speakFramesBudget
  );
  const intAllocations = exactAllocations.map((val) => Math.max(1, Math.floor(val)));
  let allocatedSum = intAllocations.reduce((acc, v) => acc + v, 0);

  if (allocatedSum < speakFramesBudget) {
    const remainders = exactAllocations
      .map((val, i) => ({ i, rem: val - Math.floor(val) }))
      .sort((a, b) => b.rem - a.rem || a.i - b.i);
    let idx = 0;
    while (allocatedSum < speakFramesBudget && remainders.length > 0) {
      intAllocations[remainders[idx % remainders.length].i] += 1;
      allocatedSum += 1;
      idx += 1;
    }
  } else if (allocatedSum > speakFramesBudget) {
    for (let i = intAllocations.length - 1; i >= 0 && allocatedSum > speakFramesBudget; i--) {
      if (intAllocations[i] > 1) {
        const reduceBy = Math.min(intAllocations[i] - 1, allocatedSum - speakFramesBudget);
        intAllocations[i] -= reduceBy;
        allocatedSum -= reduceBy;
      }
    }
  }

  const beatEndLimit = startOffset + safeDuration;
  const resolved: ResolvedTimedWord[] = [];
  let cursor = startOffset;

  for (let i = 0; i < metas.length; i++) {
    const m = metas[i];
    const dur = intAllocations[i];
    const pauseAfter = scaledPauses[i];
    const isLast = i === metas.length - 1;

    const wStart = Math.min(cursor, Math.max(startOffset, beatEndLimit - (metas.length - i)));
    // On <=6-word burstiness punches, extend the final punch word's active highlight half-way into the punch hold
    const rawEnd =
      isLast && isBurstinessPunch
        ? Math.min(
            beatEndLimit,
            wStart + dur + Math.max(4, Math.floor((beatEndLimit - (wStart + dur)) * 0.55))
          )
        : Math.min(beatEndLimit, wStart + dur);
    const wEnd = Math.max(wStart + 1, rawEnd);

    resolved.push({
      word: m.word,
      cleanWord: m.cleanWord,
      start: wStart,
      end: wEnd,
      startFrame: wStart,
      endFrame: wEnd,
      syllables: m.syllables,
      pauseAfterFrames: isLast
        ? Math.max(0, beatEndLimit - wEnd)
        : pauseAfter,
      isNumeric: m.isNumeric,
      isEmphasis: m.isEmphasis,
      isBurstinessPunch,
    });

    cursor = wStart + dur + pauseAfter;
  }

  return resolved;
}

function extractRawWordFrames(
  item: AnyTimedWord,
  fps: number,
  fallbackDurationFrames: number = 8
): { startFrame: number; endFrame: number } {
  let rawStart: number;
  if (typeof item.startFrame === "number" && Number.isFinite(item.startFrame)) {
    rawStart = item.startFrame;
  } else if (typeof item.start === "number" && Number.isFinite(item.start)) {
    rawStart = item.start;
  } else if (typeof item.startSec === "number" && Number.isFinite(item.startSec)) {
    rawStart = Math.round(item.startSec * fps);
  } else {
    rawStart = 0;
  }

  let rawEnd: number;
  if (typeof item.endFrame === "number" && Number.isFinite(item.endFrame)) {
    rawEnd = item.endFrame;
  } else if (typeof item.end === "number" && Number.isFinite(item.end)) {
    rawEnd = item.end;
  } else if (typeof item.endSec === "number" && Number.isFinite(item.endSec)) {
    rawEnd = Math.round(item.endSec * fps);
  } else {
    rawEnd = rawStart + fallbackDurationFrames;
  }

  return {
    startFrame: Math.round(rawStart),
    endFrame: Math.max(Math.round(rawStart) + 1, Math.round(rawEnd)),
  };
}

/**
 * Connects real Whisper `words.json` (`startFrame`, `endFrame`, `word`) directly to any
 * beat window `[beatStartFrame, beatEndFrame]`, rebasing cleanly to beat-local Remotion frames.
 */
export function connectWhisperWordsToBeat(
  words: ReadonlyArray<AnyTimedWord>,
  beatStartFrame: number,
  beatEndFrame: number,
  options?: BeatSyncOptions
): ResolvedTimedWord[] {
  const fps = options?.fps ?? 30;
  const atFrame = options?.atFrame ?? 0;
  const rebaseToLocal = options?.rebaseToLocal ?? true;
  const windowStart = Math.min(beatStartFrame, beatEndFrame);
  const windowEnd = Math.max(windowStart + 1, beatEndFrame);
  const beatDuration = windowEnd - windowStart;

  const matching: Array<{ raw: AnyTimedWord; s: number; e: number }> = [];
  for (const item of words) {
    const trimmedWord = item.word.trim();
    if (!trimmedWord) continue;
    const { startFrame: s, endFrame: e } = extractRawWordFrames(item, fps);
    const midpoint = (s + e) * 0.5;
    // Include words whose spoken midpoint falls inside [windowStart - 1, windowEnd + 1]
    if (midpoint >= windowStart - 1 && midpoint <= windowEnd + 1) {
      matching.push({ raw: { ...item, word: trimmedWord }, s, e });
    }
  }

  if (matching.length === 0) {
    return [];
  }

  const isBurstinessPunch = matching.length <= 6;

  return matching.map((entry, idx) => {
    const nextEntry = matching[idx + 1];
    const localStart = rebaseToLocal
      ? Math.max(atFrame, entry.s - windowStart + atFrame)
      : entry.s;
    const maxBound = rebaseToLocal ? atFrame + beatDuration : windowEnd;
    const localEnd = rebaseToLocal
      ? Math.min(maxBound, Math.max(localStart + 1, entry.e - windowStart + atFrame))
      : Math.max(localStart + 1, entry.e);

    const nextStart = nextEntry
      ? rebaseToLocal
        ? Math.max(localEnd, nextEntry.s - windowStart + atFrame)
        : nextEntry.s
      : maxBound;

    const cleanWord = stripEdgePunctuation(entry.raw.word) || entry.raw.word;
    const isNumeric = isNumericOrUnitToken(entry.raw.word);
    const isAllCaps =
      cleanWord.length >= 3 &&
      /[A-Z]/.test(cleanWord) &&
      cleanWord === cleanWord.toUpperCase();

    return {
      word: entry.raw.word,
      cleanWord,
      start: localStart,
      end: localEnd,
      startFrame: localStart,
      endFrame: localEnd,
      syllables: estimateWordSyllables(entry.raw.word),
      pauseAfterFrames: Math.max(0, nextStart - localEnd),
      isNumeric,
      isEmphasis:
        isNumeric ||
        isAllCaps ||
        (isBurstinessPunch && idx === matching.length - 1),
      isBurstinessPunch,
    };
  });
}

export const sliceTimedWordsForBeat = connectWhisperWordsToBeat;

export interface ResolveBeatWordsParams {
  text: string;
  timedWords?: ReadonlyArray<AnyTimedWord>;
  atFrame?: number;
  durationFrames: number;
  fps?: number;
  beatStartFrame?: number;
  beatEndFrame?: number;
}

/**
 * Unified prosody resolver:
 * 1. If `timedWords` + `[beatStartFrame, beatEndFrame]` are provided, slices & rebases Whisper words.
 * 2. Else if beat-local `timedWords` are provided, normalizes them directly.
 * 3. Else synthesizes syllable-, number-, punctuation-, and burstiness-weighted timings from `text`.
 */
export function resolveBeatTimedWords(
  params: ResolveBeatWordsParams
): ResolvedTimedWord[] {
  const {
    text,
    timedWords,
    atFrame = 0,
    durationFrames,
    fps = 30,
    beatStartFrame,
    beatEndFrame,
  } = params;

  if (timedWords && timedWords.length > 0) {
    if (beatStartFrame !== undefined && beatEndFrame !== undefined) {
      const sliced = connectWhisperWordsToBeat(
        timedWords,
        beatStartFrame,
        beatEndFrame,
        { fps, atFrame, rebaseToLocal: true }
      );
      if (sliced.length > 0) {
        return sliced;
      }
    } else {
      const nonEmpty = timedWords.filter((w) => w.word.trim().length > 0);
      if (nonEmpty.length > 0) {
        const isBurstinessPunch = nonEmpty.length <= 6;
        return nonEmpty.map((item, idx) => {
          const next = nonEmpty[idx + 1];
          const currBounds = extractRawWordFrames(item, fps, 8);
          const nextBounds = next ? extractRawWordFrames(next, fps, 8) : null;
          const endResolved =
            item.end === undefined &&
            item.endFrame === undefined &&
            item.endSec === undefined &&
            nextBounds
              ? Math.max(currBounds.startFrame + 1, nextBounds.startFrame)
              : currBounds.endFrame;
          const cleanWord = stripEdgePunctuation(item.word) || item.word.trim();
          const isNumeric = isNumericOrUnitToken(item.word);
          const isAllCaps =
            cleanWord.length >= 3 &&
            /[A-Z]/.test(cleanWord) &&
            cleanWord === cleanWord.toUpperCase();

          return {
            word: item.word.trim(),
            cleanWord,
            start: currBounds.startFrame,
            end: endResolved,
            startFrame: currBounds.startFrame,
            endFrame: endResolved,
            syllables: item.syllables ?? estimateWordSyllables(item.word),
            pauseAfterFrames: nextBounds
              ? Math.max(0, nextBounds.startFrame - endResolved)
              : Math.max(0, atFrame + durationFrames - endResolved),
            isNumeric,
            isEmphasis:
              Boolean(item.isEmphasis) ||
              isNumeric ||
              isAllCaps ||
              (isBurstinessPunch && idx === nonEmpty.length - 1),
            isBurstinessPunch,
          };
        });
      }
    }
  }

  return synthesizeTimedWords(text, durationFrames, fps, { startFrame: atFrame });
}

/**
 * Chunks resolved timed words into punchy rhetorical phrases (1-3 words by default)
 * aligned to punctuation pauses, conjunction pivots, and numeric highlights.
 */
export function groupWordsIntoPhrases(
  words: ReadonlyArray<ResolvedTimedWord>,
  maxWordsPerPhrase: number = 3
): PhraseChunk[] {
  if (words.length === 0) return [];
  const cap = Math.max(1, maxWordsPerPhrase);

  const chunks: PhraseChunk[] = [];
  let buffer: ResolvedTimedWord[] = [];

  const flush = (): void => {
    if (buffer.length === 0) return;
    const first = buffer[0];
    const last = buffer[buffer.length - 1];
    chunks.push({
      index: chunks.length,
      text: buffer.map((w) => w.word).join(" "),
      words: buffer,
      startFrame: first.startFrame,
      endFrame: last.endFrame,
      hasNumeric: buffer.some((w) => w.isNumeric),
      isEmphasis: buffer.some((w) => w.isEmphasis),
    });
    buffer = [];
  };

  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const lowerClean = current.cleanWord.toLowerCase();

    if (buffer.length > 0 && PHRASE_BREAK_LEADERS.has(lowerClean)) {
      flush();
    }

    buffer.push(current);

    const hasPunctuationBreak = /[,;:.?!—–]$/.test(
      current.word.replace(/['"”’)\]]+$/g, "")
    );
    const hitCap = buffer.length >= cap;
    const hasSignificantPause = current.pauseAfterFrames >= 4;

    if (hasPunctuationBreak || hitCap || hasSignificantPause) {
      flush();
    }
  }
  flush();

  // Extend each phrase's hold window until the next phrase starts so staccato cuts have zero dead black flicker
  for (let i = 0; i < chunks.length - 1; i++) {
    chunks[i] = {
      ...chunks[i],
      endFrame: Math.max(chunks[i].endFrame, chunks[i + 1].startFrame),
    };
  }

  return chunks;
}

/**
 * Returns the index of the currently spoken word (or held word during brief inter-word pauses).
 */
export function getActiveWordIndex(
  words: ReadonlyArray<ResolvedTimedWord>,
  frame: number
): number {
  if (words.length === 0) return -1;
  if (frame < words[0].startFrame) return -1;

  for (let i = words.length - 1; i >= 0; i--) {
    if (frame >= words[i].startFrame) {
      return i;
    }
  }
  return -1;
}
