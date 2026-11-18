import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { SfxCue } from "../components/SfxCue";
import {
  FONTS,
  getOpticalTracking,
  preventOrphanWords,
  splitNumberUnit,
  TABULAR_NUM_STYLE,
} from "../design/fonts";
import {
  COLORS,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  STYLE_FAMILIES,
} from "../design/tokens";
import {
  countUpValue,
  MOTION_SPRINGS,
  readingDuration,
  steppedHold,
} from "../motion/primitives";
import {
  type AnyTimedWord,
  connectWhisperWordsToBeat,
  getActiveWordIndex,
  groupWordsIntoPhrases,
  type PhraseChunk,
  resolveBeatTimedWords,
  type ResolvedTimedWord,
  sliceTimedWordsForBeat,
  synthesizeTimedWords,
  type TimedWord,
  type WhisperWord,
} from "./prosodySync";

export {
  connectWhisperWordsToBeat,
  groupWordsIntoPhrases,
  resolveBeatTimedWords,
  sliceTimedWordsForBeat,
  synthesizeTimedWords,
};
export type {
  AnyTimedWord,
  PhraseChunk,
  ResolvedTimedWord,
  TimedWord,
  WhisperWord,
};

export const TYPOGRAPHY_MODES = [
  // Original 7 modes (100% preserved)
  "word-pop",
  "karaoke-highlight",
  "typewriter",
  "stamp-slam",
  "split-lines",
  "marker-sweep",
  "red-correction",
  // 25 Cinema Stenography & Kinetic Typography Modes
  "solari-split-flap",
  "redacted-declassify",
  "stenographer-ribbon",
  "verdict-anvil-slam",
  "burstiness-staccato-cuts",
  "chisel-highlighter-sweep",
  "behind-presenter-monolith",
  "ledger-tabular-rollup",
  "court-syllabus-italic",
  "telestrator-grease-math",
  "footnote-loupe-zoom",
  "stock-ticker-crawl",
  "antithesis-split-lock",
  "erosion-decay-fade",
  "veto-fountain-strike",
  "typewriter-1941-ribbon",
  "blueprint-dimension-callout",
  "chapter-roman-folio",
  "debt-odometer-inline",
  "whisper-focus-spotlight",
  "margin-redline-gloss",
  "statute-clause-box",
  "question-inversion-turn",
  "silent-black-aphorism",
  "cascading-evidence-stack",
] as const;

export type TypographyMode = (typeof TYPOGRAPHY_MODES)[number];
export type KineticTextMode = TypographyMode;

export const TypographyModeSchema = z.enum(TYPOGRAPHY_MODES);

export function isTypographyMode(value: string): value is TypographyMode {
  return (TYPOGRAPHY_MODES as readonly string[]).includes(value);
}

export interface KineticTextProps {
  text: string;
  mode?: TypographyMode;
  timedWords?: ReadonlyArray<AnyTimedWord>;
  /** Optional global timeline beat window to auto-slice & rebase Whisper `words.json` */
  beatStartFrame?: number;
  beatEndFrame?: number;
  atFrame?: number;
  duration?: number;
  correctionText?: string; // Used by 'red-correction' and 'veto-fountain-strike'
  correctionFrame?: number;
  folioLabel?: string; // Optional header label for 'chapter-roman-folio' / 'statute-clause-box'
  glossNote?: string; // Optional marginalia note for 'margin-redline-gloss'
  paletteMode?: "page" | "over-footage";
  fontSize?: number | string;
  fontFamily?: string;
  fontWeight?: number | string;
  color?: string;
  highlightColor?: string;
  enableSfx?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const FLAP_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%+-.:/";

function isDarkTextColor(hexOrCss: string): boolean {
  const m = hexOrCss.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return false;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}

function parseSizePx(fontSize: number | string, fallback: number = 36): number {
  if (typeof fontSize === "number" && Number.isFinite(fontSize)) return fontSize;
  const parsed = parseFloat(String(fontSize).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function splitAntithesisPair(text: string): [string, string] {
  const trimmed = text.trim();
  const explicitArrows = [" -> ", " → ", " vs. ", " vs ", " | "];
  for (const sep of explicitArrows) {
    const idx = trimmed.indexOf(sep);
    if (idx > 0) {
      return [
        trimmed.slice(0, idx).trim(),
        trimmed.slice(idx + sep.length).trim(),
      ];
    }
  }

  const pivotRegex =
    /\s+(while|but|yet|whereas|instead of|versus)\s+/i;
  const match = trimmed.match(pivotRegex);
  if (match && match.index !== undefined && match.index > 0) {
    const left = trimmed.slice(0, match.index).trim();
    const right = trimmed.slice(match.index + match[0].length).trim();
    if (left && right) return [left, right];
  }

  const semiIdx = trimmed.indexOf(";");
  if (semiIdx > 2 && semiIdx < trimmed.length - 3) {
    return [trimmed.slice(0, semiIdx).trim(), trimmed.slice(semiIdx + 1).trim()];
  }

  const commaIdx = trimmed.indexOf(",");
  if (commaIdx > 4 && commaIdx < trimmed.length - 4) {
    return [trimmed.slice(0, commaIdx).trim(), trimmed.slice(commaIdx + 1).trim()];
  }

  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }
  return [trimmed, "COUNTER-RECORD"];
}

function splitVetoReplacement(
  text: string,
  correctionText: string
): { prefixContext: string; struckWord: string; replacementWord: string } {
  const trimmed = text.trim();
  const arrowMatch = trimmed.match(/^(.*?)\s*(?:->|→|=>)\s*(.+)$/);
  if (arrowMatch && arrowMatch[1] && arrowMatch[2]) {
    return {
      prefixContext: "",
      struckWord: arrowMatch[1].trim(),
      replacementWord: arrowMatch[2].trim(),
    };
  }

  const notButMatch = trimmed.match(/^(.*\bnot\s+(?:a|an|the)?\s*)([A-Za-z0-9$%-]+)[.,;:]?\s+(?:it(?:'s| is)\s+(?:a|an|the)?\s*)?(.+)$/i);
  if (notButMatch && notButMatch[2] && notButMatch[3]) {
    return {
      prefixContext: notButMatch[1].trim(),
      struckWord: notButMatch[2].trim(),
      replacementWord: notButMatch[3].trim(),
    };
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= 3) {
    return {
      prefixContext: "",
      struckWord: trimmed,
      replacementWord: correctionText !== "REVISED" ? correctionText : "ALLOWANCE",
    };
  }

  const tailWord = words[words.length - 1].replace(/[.,;!?]+$/, "");
  return {
    prefixContext: words.slice(0, -1).join(" "),
    struckWord: tailWord,
    replacementWord: correctionText,
  };
}

/**
 * KineticText 32-Mode Cinema Typography, Stenography & Whisper Word-Sync Engine
 * Connects real Whisper `words.json` (`startFrame`, `endFrame`, `word`) directly to beat windows
 * and falls back to the deterministic Syllable & Punctuation Prosody Estimator when absent.
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  mode = "word-pop",
  timedWords,
  beatStartFrame,
  beatEndFrame,
  atFrame = 0,
  duration,
  correctionText = "REVISED",
  correctionFrame,
  folioLabel,
  glossNote,
  paletteMode,
  fontSize = 36,
  fontFamily = FONTS.sans,
  fontWeight = 700,
  color = COLORS.navy,
  highlightColor = COLORS.gold,
  enableSfx = true,
  className,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalDuration = Math.max(1, duration ?? readingDuration(text, fps));
  const sizePx = parseSizePx(fontSize, 36);

  const isLightSurface =
    paletteMode === "page" ||
    (paletteMode !== "over-footage" && isDarkTextColor(color));

  // Dual-Palette WCAG AAA (>= 7.5:1) color tokens
  const inkPrimary = isLightSurface ? color : OVER_FOOTAGE_PALETTE.textHeadline;
  const inkSecondary = isLightSurface ? "#384858" : OVER_FOOTAGE_PALETTE.textMuted;
  const aaaBrickRed = isLightSurface ? "#842B1C" : "#F29B86";
  const surfaceCardBg = isLightSurface
    ? PAGE_PALETTE.paper
    : "rgba(15, 25, 35, 0.78)";
  const surfaceBorder = isLightSurface
    ? PAGE_PALETTE.paperBorder
    : OVER_FOOTAGE_PALETTE.glassInnerHairline;

  const resolvedWords: ResolvedTimedWord[] = React.useMemo(
    () =>
      resolveBeatTimedWords({
        text,
        timedWords,
        atFrame,
        durationFrames: totalDuration,
        fps,
        beatStartFrame,
        beatEndFrame,
      }),
    [text, timedWords, atFrame, totalDuration, fps, beatStartFrame, beatEndFrame]
  );

  const phrases: PhraseChunk[] = React.useMemo(
    () => groupWordsIntoPhrases(resolvedWords, 3),
    [resolvedWords]
  );

  const baseStyle: React.CSSProperties = {
    fontFamily,
    fontSize,
    fontWeight,
    color,
    display: "inline-flex",
    flexWrap: "wrap",
    gap: "0.28em",
    lineHeight: 1.25,
    letterSpacing: getOpticalTracking(sizePx, "sans"),
    userSelect: "none",
    ...TABULAR_NUM_STYLE,
    ...style,
  };

  // ==========================================================================
  // 1. Word Pop Mode
  // ==========================================================================
  if (mode === "word-pop") {
    return (
      <div className={className} style={baseStyle}>
        {resolvedWords.map((item, idx) => {
          if (frame < item.start) return null;
          const elapsed = frame - item.start;
          const pop = spring({
            frame: elapsed,
            fps,
            config: MOTION_SPRINGS.snappy,
            durationInFrames: 10,
          });

          return (
            <span
              key={`${item.word}-${idx}`}
              style={{
                display: "inline-block",
                transform: `scale(${0.62 + 0.38 * pop})`,
                opacity: pop,
                color: item.isNumeric ? highlightColor : color,
                fontWeight: item.isEmphasis ? 800 : fontWeight,
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // 2. Karaoke Highlight Mode
  // ==========================================================================
  if (mode === "karaoke-highlight") {
    const dimColor = isLightSurface
      ? "rgba(28, 43, 58, 0.42)"
      : "rgba(250, 236, 212, 0.44)";
    return (
      <div className={className} style={baseStyle}>
        {resolvedWords.map((item, idx) => {
          const endBound = item.end ?? item.start + 10;
          const isPast = frame >= endBound;
          const isActive = frame >= item.start && frame < endBound;

          let wordColor = dimColor;
          let wordScale = 1.0;

          if (isActive) {
            wordColor = highlightColor;
            wordScale = 1.06;
          } else if (isPast) {
            wordColor = color;
          }

          return (
            <span
              key={`${item.word}-${idx}`}
              style={{
                display: "inline-block",
                color: wordColor,
                transform: `scale(${wordScale})`,
                willChange: "transform, color",
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // 3. Typewriter Mode
  // ==========================================================================
  if (mode === "typewriter") {
    if (text.trim() === "") {
      return (
        <div className={className} style={{ ...baseStyle, display: "inline-block" }} />
      );
    }
    const charsTotal = text.length;
    const typeDur = Math.max(1, Math.min(totalDuration, charsTotal * 2));
    const charCount = Math.floor(
      interpolate(frame - atFrame, [0, typeDur], [0, charsTotal], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
    const visibleChars = text.slice(0, charCount);
    const cursorVisible = frame >= atFrame && Math.floor(frame / 12) % 2 === 0;

    return (
      <>
        {enableSfx &&
          frame >= atFrame &&
          frame < atFrame + typeDur &&
          frame % 4 === 0 && (
            <SfxCue cue="type-click" atFrame={frame} volume={0.4} />
          )}
        <div className={className} style={{ ...baseStyle, display: "inline-block" }}>
          <span>{visibleChars}</span>
          <span
            style={{
              opacity: cursorVisible ? 1 : 0,
              color: highlightColor,
              marginLeft: "2px",
            }}
          >
            |
          </span>
        </div>
      </>
    );
  }

  // ==========================================================================
  // 4. Stamp Slam Mode
  // ==========================================================================
  if (mode === "stamp-slam") {
    const elapsed = Math.max(0, frame - atFrame);
    const slam = spring({
      frame: elapsed,
      fps,
      config: MOTION_SPRINGS.slam,
      durationInFrames: 14,
    });
    const slamScale = 1.4 - 0.4 * slam;
    const rot = (1 - slam) * -5;

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="warning-thud" atFrame={atFrame} volume={0.65} />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            transform: `scale(${slamScale}) rotate(${rot}deg)`,
            opacity: slam,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {text}
        </div>
      </>
    );
  }

  // ==========================================================================
  // 5. Split Lines Mode
  // ==========================================================================
  if (mode === "split-lines") {
    const rawLines = text.indexOf("\n") !== -1
      ? text.split("\n")
      : phrases.length > 1
      ? phrases.map((p) => p.text)
      : [text];
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {rawLines.map((line, lIdx) => {
          const lineStart = atFrame + lIdx * 6;
          const elapsed = Math.max(0, frame - lineStart);
          const lineSpring = spring({
            frame: elapsed,
            fps,
            config: MOTION_SPRINGS.snappy,
            durationInFrames: 14,
          });

          return (
            <div
              key={`line-${lIdx}`}
              style={{
                overflow: "hidden",
                display: "block",
              }}
            >
              <div
                style={{
                  transform: `translate3d(0, ${(1 - lineSpring) * 100}%, 0)`,
                  opacity: lineSpring,
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // 6. Marker Sweep Mode
  // ==========================================================================
  if (mode === "marker-sweep") {
    const sweepProgress = interpolate(
      frame - atFrame,
      [0, Math.max(1, Math.min(30, totalDuration))],
      [0, 100],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="marker-sweep" atFrame={atFrame} volume={0.6} />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            position: "relative",
            display: "inline-block",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: "-4px -8px",
              backgroundColor: highlightColor,
              opacity: 0.36,
              width: `${sweepProgress}%`,
              borderRadius: "3px",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>{text}</span>
        </div>
      </>
    );
  }

  // ==========================================================================
  // 7. Red Correction Mode (Reading Room Brick-Red Correction)
  // ==========================================================================
  if (mode === "red-correction") {
    const strikeStart = atFrame + 6;
    const strikeDur = 10;
    const strikeProgress = interpolate(
      frame - strikeStart,
      [0, strikeDur],
      [0, 100],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    const corrStart = correctionFrame ?? strikeStart + strikeDur + 2;
    const corrElapsed = Math.max(0, frame - corrStart);
    const corrSpring = spring({
      frame: corrElapsed,
      fps,
      config: MOTION_SPRINGS.slam,
      durationInFrames: 10,
    });

    return (
      <>
        {enableSfx && frame === strikeStart && (
          <SfxCue cue="telestrator-draw" atFrame={strikeStart} volume={0.55} />
        )}
        {enableSfx && frame === corrStart && (
          <SfxCue cue="paper-slide" atFrame={corrStart} volume={0.65} />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            alignItems: "center",
            flexWrap: "wrap",
            gap: "18px",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                opacity: frame >= strikeStart + strikeDur ? 0.52 : 1,
                display: "inline-block",
              }}
            >
              {text}
            </span>
            {frame >= strikeStart && (
              <div
                style={{
                  position: "absolute",
                  top: "52%",
                  left: "-4px",
                  height: "4px",
                  width: `calc(${strikeProgress}% + 8px)`,
                  maxWidth: "calc(100% + 8px)",
                  backgroundColor: aaaBrickRed,
                  transform: "translateY(-50%) rotate(-2.2deg)",
                  borderRadius: "2px",
                  zIndex: 2,
                }}
              />
            )}
          </div>

          {frame >= corrStart && (
            <div
              style={{
                color: isLightSurface
                  ? "#7E281A"
                  : OVER_FOOTAGE_PALETTE.textHeadline,
                transform: `scale(${1.2 - 0.2 * corrSpring})`,
                opacity: corrSpring,
                backgroundColor: isLightSurface ? COLORS.riskFill : "#842B1C",
                padding: "4px 14px",
                borderRadius: "6px",
                border: `1.5px solid ${
                  isLightSurface ? COLORS.riskBorder : OVER_FOOTAGE_PALETTE.riskBorder
                }`,
                fontWeight: 800,
                whiteSpace: "nowrap",
                boxShadow: "0 6px 18px rgba(15, 25, 35, 0.16)",
              }}
            >
              {correctionText}
            </div>
          )}
        </div>
      </>
    );
  }

  // ==========================================================================
  // 8. Solari Split-Flap (Mechanical Departure / Fed Boardroom Split-Flap)
  // ==========================================================================
  if (mode === "solari-split-flap") {
    const displayStr = text.trim().toUpperCase().slice(0, 44);
    const chars = displayStr.split("");
    const settleSpan = Math.min(26, Math.max(8, Math.floor(totalDuration * 0.55)));

    return (
      <>
        {enableSfx &&
          frame >= atFrame &&
          frame < atFrame + settleSpan &&
          frame % 3 === 0 && (
            <SfxCue cue="data-tick" atFrame={frame} volume={0.35} />
          )}
        <div
          className={className}
          style={{
            ...baseStyle,
            fontFamily: FONTS.mono,
            gap: "4px",
            alignItems: "center",
          }}
        >
          {chars.map((targetChar, cIdx) => {
            if (targetChar === " ") {
              return (
                <span
                  key={`sp-${cIdx}`}
                  style={{ display: "inline-block", width: "0.42em" }}
                />
              );
            }
            const lockFrame =
              atFrame + Math.floor((cIdx / Math.max(1, chars.length)) * settleSpan);
            const isLocked = frame >= lockFrame;
            const cycleIdx =
              (cIdx * 11 + Math.max(0, Math.floor((frame - atFrame) * 1.5))) %
              FLAP_ALPHABET.length;
            const shownChar = isLocked ? targetChar : FLAP_ALPHABET[cycleIdx];
            const settleSpring = spring({
              frame: Math.max(0, frame - lockFrame),
              fps,
              config: MOTION_SPRINGS.snappy,
              durationInFrames: 7,
            });
            const tiltDeg = isLocked ? (1 - settleSpring) * -42 : -22;

            return (
              <span
                key={`flap-${cIdx}`}
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "0.78em",
                  padding: "0.1em 0.14em",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(180deg, #162433 0%, #162433 49%, #0F1923 51%, #13202E 100%)",
                  border: "1px solid rgba(191, 214, 234, 0.28)",
                  color: /\d|[$%+-]/.test(targetChar) && isLocked
                    ? OVER_FOOTAGE_PALETTE.accentPrimary
                    : OVER_FOOTAGE_PALETTE.textHeadline,
                  transform: `perspective(360px) rotateX(${tiltDeg.toFixed(1)}deg)`,
                  boxShadow: "0 4px 10px rgba(15, 25, 35, 0.28)",
                  lineHeight: 1.05,
                }}
              >
                {shownChar}
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "50%",
                    height: "1px",
                    backgroundColor: "rgba(15, 25, 35, 0.85)",
                    pointerEvents: "none",
                  }}
                />
              </span>
            );
          })}
        </div>
      </>
    );
  }

  // ==========================================================================
  // 9. Redacted Declassify (FOIA Classified Bar Wipe Synced to Words)
  // ==========================================================================
  if (mode === "redacted-declassify") {
    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="newsreel-click" atFrame={atFrame} volume={0.5} />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            fontFamily: FONTS.mono,
            rowGap: "8px",
            columnGap: "0.34em",
          }}
        >
          {resolvedWords.map((item, idx) => {
            const revealElapsed = Math.max(0, frame - item.startFrame);
            const wipe = spring({
              frame: revealElapsed,
              fps,
              config: MOTION_SPRINGS.snappy,
              durationInFrames: 11,
            });
            const barRemaining = Math.max(0, 1 - wipe);

            return (
              <span
                key={`redact-${idx}`}
                style={{
                  position: "relative",
                  display: "inline-block",
                  padding: "1px 4px",
                  borderRadius: "3px",
                  backgroundColor: item.isEmphasis
                    ? isLightSurface
                      ? "rgba(255, 213, 79, 0.28)"
                      : "rgba(191, 214, 234, 0.16)"
                    : "transparent",
                  color: item.isNumeric ? aaaBrickRed : inkPrimary,
                  fontWeight: item.isEmphasis ? 700 : 600,
                }}
              >
                {item.word}
                {barRemaining > 0.01 && (
                  <span
                    style={{
                      position: "absolute",
                      inset: "-1px -2px",
                      backgroundColor: isLightSurface
                        ? PAGE_PALETTE.navy
                        : PAGE_PALETTE.navyDeep,
                      border: `1px solid ${
                        isLightSurface
                          ? PAGE_PALETTE.navyDeep
                          : "rgba(191, 214, 234, 0.35)"
                      }`,
                      borderRadius: "2px",
                      transform: `scaleX(${barRemaining.toFixed(3)})`,
                      transformOrigin: "right center",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      </>
    );
  }

  // ==========================================================================
  // 10. Stenographer Ribbon (Courtroom Stenotype Paper Feed + Live Caret)
  // ==========================================================================
  if (mode === "stenographer-ribbon") {
    const activeIdx = getActiveWordIndex(resolvedWords, frame);
    return (
      <>
        {enableSfx &&
          activeIdx >= 0 &&
          resolvedWords[activeIdx] &&
          frame === resolvedWords[activeIdx].startFrame && (
            <SfxCue cue="type-click" atFrame={frame} volume={0.32} />
          )}
        <div
          className={className}
          style={{
            ...baseStyle,
            display: "inline-flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "stretch",
            gap: "14px",
            padding: "14px 20px",
            borderRadius: "8px",
            backgroundColor: surfaceCardBg,
            border: `1px solid ${surfaceBorder}`,
            fontFamily: FONTS.mono,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingRight: "12px",
              borderRight: `1.5px dashed ${aaaBrickRed}`,
              fontSize: "11px",
              fontWeight: 700,
              color: inkSecondary,
            }}
          >
            <span>STENO</span>
            <span>{String(Math.max(1, activeIdx + 1)).padStart(2, "0")}</span>
          </div>
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              gap: "0.32em",
              alignItems: "baseline",
            }}
          >
            {resolvedWords.map((item, idx) => {
              if (frame < item.startFrame) return null;
              const strike = spring({
                frame: frame - item.startFrame,
                fps,
                config: MOTION_SPRINGS.snappy,
                durationInFrames: 6,
              });
              const isCurrent = idx === activeIdx;
              return (
                <span
                  key={`steno-${idx}`}
                  style={{
                    display: "inline-block",
                    transform: `translate3d(0, ${((1 - strike) * 5).toFixed(2)}px, 0)`,
                    opacity: 0.45 + 0.55 * strike,
                    color: item.isNumeric ? aaaBrickRed : inkPrimary,
                    textDecoration: isCurrent ? "underline" : "none",
                    textUnderlineOffset: "4px",
                  }}
                >
                  {item.word}
                </span>
              );
            })}
            <span
              style={{
                display: "inline-block",
                color: aaaBrickRed,
                fontWeight: 700,
                opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.25,
              }}
            >
              ▪
            </span>
          </div>
        </div>
      </>
    );
  }

  // ==========================================================================
  // 11. Verdict Anvil Slam (Heavy Judicial Block Drop + Shockwave Rules)
  // ==========================================================================
  if (mode === "verdict-anvil-slam") {
    const elapsed = Math.max(0, frame - atFrame);
    const anvil = spring({
      frame: elapsed,
      fps,
      config: MOTION_SPRINGS.slam,
      durationInFrames: 12,
    });
    const tremor =
      elapsed > 4 && elapsed < 16
        ? Math.sin((elapsed - 4) * 2.8) * Math.exp(-(elapsed - 4) * 0.42) * 4
        : 0;
    const ruleExpand = interpolate(elapsed, [2, 16], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="warning-thud" atFrame={atFrame} volume={0.72} />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            display: "inline-flex",
            flexDirection: "column",
            gap: "10px",
            fontFamily: FONTS.condensed,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: getOpticalTracking(sizePx * 1.15, "condensed"),
            transform: `translate3d(0, ${((1 - anvil) * -44 + tremor).toFixed(2)}px, 0) scale(${(1.24 - 0.24 * anvil).toFixed(3)})`,
            opacity: anvil,
          }}
        >
          <div
            style={{
              height: "3px",
              width: "100%",
              backgroundColor: aaaBrickRed,
              transform: `scaleX(${ruleExpand.toFixed(3)})`,
              transformOrigin: "center",
            }}
          />
          <div style={{ padding: "2px 6px", lineHeight: 1.08 }}>
            {preventOrphanWords(text)}
          </div>
          <div
            style={{
              height: "3px",
              width: "100%",
              backgroundColor: inkPrimary,
              transform: `scaleX(${ruleExpand.toFixed(3)})`,
              transformOrigin: "center",
            }}
          />
        </div>
      </>
    );
  }

  // ==========================================================================
  // 12. Burstiness Staccato Cuts (Rapid 1-Phrase-at-a-Time Maxinomics Montage)
  // ==========================================================================
  if (mode === "burstiness-staccato-cuts") {
    const safePhrases =
      phrases.length > 0
        ? phrases
        : [
            {
              index: 0,
              text,
              words: resolvedWords,
              startFrame: atFrame,
              endFrame: atFrame + totalDuration,
              hasNumeric: false,
              isEmphasis: true,
            },
          ];

    let activePhrase = safePhrases[0];
    for (let i = 0; i < safePhrases.length; i++) {
      if (frame >= safePhrases[i].startFrame) {
        activePhrase = safePhrases[i];
      }
    }

    if (frame < activePhrase.startFrame) return null;

    const cutElapsed = Math.max(0, frame - activePhrase.startFrame);
    const snap = spring({
      frame: cutElapsed,
      fps,
      config: MOTION_SPRINGS.snappy,
      durationInFrames: 6,
    });
    const isPunchPhrase =
      activePhrase.index === safePhrases.length - 1 || activePhrase.hasNumeric;

    return (
      <>
        {enableSfx && frame === activePhrase.startFrame && (
          <SfxCue
            cue={isPunchPhrase ? "sticker-pop" : "newsreel-click"}
            atFrame={frame}
            volume={0.42}
          />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: isPunchPhrase ? FONTS.display : fontFamily,
            fontSize: isPunchPhrase ? sizePx * 1.24 : sizePx * 1.08,
            fontWeight: 800,
            letterSpacing: getOpticalTracking(sizePx * 1.2, "display"),
            color: activePhrase.hasNumeric ? aaaBrickRed : inkPrimary,
            transform: `scale(${(0.86 + 0.14 * snap).toFixed(3)})`,
            opacity: Math.min(1, snap * 1.4),
          }}
        >
          <span>{activePhrase.text}</span>
          <span
            style={{
              marginTop: "6px",
              fontFamily: FONTS.mono,
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: inkSecondary,
            }}
          >
            {String(activePhrase.index + 1).padStart(2, "0")} /{" "}
            {String(safePhrases.length).padStart(2, "0")}
          </span>
        </div>
      </>
    );
  }

  // ==========================================================================
  // 13. Chisel Highlighter Sweep (Angled Chisel-Tip Marker Synced Word-by-Word)
  // ==========================================================================
  if (mode === "chisel-highlighter-sweep") {
    const chiselFill = isLightSurface
      ? "rgba(255, 213, 79, 0.48)"
      : "rgba(255, 213, 79, 0.34)";
    const anyEmphasis = resolvedWords.some((w) => w.isEmphasis);

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="marker-sweep" atFrame={atFrame} volume={0.55} />
        )}
        <div className={className} style={{ ...baseStyle, rowGap: "6px" }}>
          {resolvedWords.map((item, idx) => {
            const shouldMark = anyEmphasis ? item.isEmphasis : true;
            const markProgress = shouldMark
              ? interpolate(
                  frame,
                  [item.startFrame, Math.max(item.startFrame + 1, item.endFrame)],
                  [0, 100],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )
              : 0;

            return (
              <span
                key={`chisel-${idx}`}
                style={{
                  position: "relative",
                  display: "inline-block",
                  padding: "0 2px",
                }}
              >
                {shouldMark && markProgress > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      left: "-3px",
                      bottom: "4%",
                      height: "78%",
                      width: `calc(${markProgress.toFixed(1)}% + 6px)`,
                      maxWidth: "calc(100% + 6px)",
                      backgroundColor: chiselFill,
                      borderRight:
                        markProgress < 99
                          ? "2.5px solid rgba(226, 168, 24, 0.85)"
                          : "none",
                      transform: "skewX(-12deg)",
                      borderRadius: "2px",
                      zIndex: 0,
                      pointerEvents: "none",
                    }}
                  />
                )}
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    fontWeight: item.isEmphasis ? 800 : fontWeight,
                  }}
                >
                  {item.word}
                </span>
              </span>
            );
          })}
        </div>
      </>
    );
  }

  // ==========================================================================
  // 14. Behind-Presenter Monolith (Ultra-Large Depth-Sandwich Display Scale)
  // ==========================================================================
  if (mode === "behind-presenter-monolith") {
    const monolithPx = sizePx >= 72 ? sizePx : 124;
    const elapsed = Math.max(0, frame - atFrame);
    const rise = spring({
      frame: elapsed,
      fps,
      config: MOTION_SPRINGS.gentle,
      durationInFrames: 20,
    });
    const monolithWords = text.trim().split(/\s+/).slice(0, 6);
    const topLine = monolithWords.slice(0, Math.ceil(monolithWords.length / 2)).join(" ");
    const bottomLine = monolithWords.slice(Math.ceil(monolithWords.length / 2)).join(" ");

    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexDirection: "column",
          gap: "4px",
          fontFamily: FONTS.condensed,
          fontSize: monolithPx,
          fontWeight: 700,
          lineHeight: 0.94,
          textTransform: "uppercase",
          letterSpacing: getOpticalTracking(monolithPx, "condensed"),
          transform: `translate3d(0, ${((1 - rise) * 38).toFixed(2)}px, 0)`,
          opacity: rise,
        }}
      >
        <span>{topLine}</span>
        {bottomLine && (
          <span style={{ color: highlightColor }}>{bottomLine}</span>
        )}
        <div
          style={{
            marginTop: "10px",
            height: "4px",
            width: `${(rise * 100).toFixed(1)}%`,
            backgroundColor: aaaBrickRed,
            borderRadius: "2px",
          }}
        />
      </div>
    );
  }

  // ==========================================================================
  // 15. Ledger Tabular Rollup (Treasury Table 9 Accounting Row + CountUp)
  // ==========================================================================
  if (mode === "ledger-tabular-rollup") {
    const tokens = text.trim().split(/\s+/);
    let figureIdx = -1;
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (/\d/.test(tokens[i])) {
        figureIdx = i;
        break;
      }
    }

    const rawFigure = figureIdx >= 0 ? tokens[figureIdx].replace(/[.,;]+$/, "") : "";
    const parsedFig = rawFigure ? splitNumberUnit(rawFigure) : null;
    const descriptionText =
      figureIdx >= 0
        ? tokens.filter((_, idx) => idx !== figureIdx).join(" ")
        : text;

    const rollDuration = Math.min(34, Math.max(12, Math.floor(totalDuration * 0.55)));
    const rolledValue =
      parsedFig && parsedFig.numericValue !== null
        ? countUpValue(frame, atFrame, rollDuration, 0, parsedFig.numericValue, fps)
        : null;

    const formattedRoll =
      rolledValue !== null && parsedFig
        ? `${parsedFig.prefix}${Math.abs(rolledValue).toLocaleString("en-US", {
            minimumFractionDigits: parsedFig.decimals,
            maximumFractionDigits: parsedFig.decimals,
          })}${parsedFig.rawSuffix}`
        : "RECORDED";

    const rowEnter = spring({
      frame: Math.max(0, frame - atFrame),
      fps,
      config: MOTION_SPRINGS.snappy,
      durationInFrames: 14,
    });

    return (
      <>
        {enableSfx &&
          rolledValue !== null &&
          frame >= atFrame &&
          frame < atFrame + rollDuration &&
          frame % 4 === 0 && (
            <SfxCue cue="data-tick" atFrame={frame} volume={0.35} />
          )}
        <div
          className={className}
          style={{
            ...baseStyle,
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "18px",
            width: "100%",
            minWidth: "420px",
            padding: "14px 20px",
            borderRadius: "8px",
            backgroundColor: surfaceCardBg,
            border: `1px solid ${surfaceBorder}`,
            opacity: rowEnter,
            transform: `translate3d(0, ${((1 - rowEnter) * 14).toFixed(2)}px, 0)`,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.serif,
              fontWeight: 600,
              color: inkPrimary,
              textWrap: "balance",
            }}
          >
            {preventOrphanWords(descriptionText || rawFigure)}
          </span>
          <span
            style={{
              flexGrow: 1,
              minWidth: "32px",
              borderBottom: `1.5px dotted ${inkSecondary}`,
              opacity: 0.65,
            }}
          />
          <span
            style={{
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: sizePx * 1.12,
              color: parsedFig?.isNegative ? aaaBrickRed : inkPrimary,
              borderBottom: `4px double ${aaaBrickRed}`,
              paddingBottom: "2px",
              whiteSpace: "nowrap",
              ...TABULAR_NUM_STYLE,
            }}
          >
            {formattedRoll}
          </span>
        </div>
      </>
    );
  }

  // ==========================================================================
  // 16. Court Syllabus Italic (Slip-Opinion Italic + Double Margin Rule)
  // ==========================================================================
  if (mode === "court-syllabus-italic") {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexDirection: "column",
          gap: "8px",
          paddingLeft: "20px",
          borderLeft: `4px double ${aaaBrickRed}`,
          fontFamily: FONTS.serif,
          fontStyle: "italic",
          fontWeight: 500,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontStyle: "normal",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: aaaBrickRed,
            textTransform: "uppercase",
          }}
        >
          {folioLabel ?? "§ SYLLABUS · RECORD HOLDING"}
        </span>
        <div
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            gap: "0.28em",
            lineHeight: 1.38,
          }}
        >
          {resolvedWords.map((item, idx) => {
            const inkFade = interpolate(
              frame,
              [item.startFrame - 2, item.startFrame + 6],
              [0.18, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <span
                key={`syl-${idx}`}
                style={{
                  opacity: inkFade,
                  fontWeight: item.isEmphasis ? 700 : 500,
                  color: inkPrimary,
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 17. Telestrator Grease Math (SVG Grease-Pencil Loop Around Key Term/Figure)
  // ==========================================================================
  if (mode === "telestrator-grease-math") {
    let targetIdx = resolvedWords.findIndex((w) => w.isNumeric);
    if (targetIdx === -1) {
      targetIdx = Math.max(0, resolvedWords.length - 1);
    }
    const targetWord = resolvedWords[targetIdx];
    const drawStart = targetWord ? targetWord.startFrame : atFrame + 6;
    const strokeProgress = interpolate(frame, [drawStart, drawStart + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const dashTotal = 320;
    const dashOffset = dashTotal * (1 - strokeProgress);

    return (
      <>
        {enableSfx && frame === drawStart && (
          <SfxCue cue="telestrator-draw" atFrame={drawStart} volume={0.58} />
        )}
        <div className={className} style={{ ...baseStyle, rowGap: "8px" }}>
          {resolvedWords.map((item, idx) => {
            const isTarget = idx === targetIdx;
            return (
              <span
                key={`tele-${idx}`}
                style={{
                  position: "relative",
                  display: "inline-block",
                  padding: isTarget ? "2px 8px" : undefined,
                  fontWeight: isTarget ? 800 : fontWeight,
                  color: isTarget ? aaaBrickRed : inkPrimary,
                }}
              >
                {item.word}
                {isTarget && strokeProgress > 0 && (
                  <svg
                    viewBox="0 0 120 52"
                    preserveAspectRatio="none"
                    style={{
                      position: "absolute",
                      inset: "-6px -10px",
                      width: "calc(100% + 20px)",
                      height: "calc(100% + 12px)",
                      overflow: "visible",
                      pointerEvents: "none",
                    }}
                  >
                    <path
                      d="M 10 26 C 8 9, 112 7, 112 25 C 112 44, 12 46, 16 23 C 18 14, 96 12, 106 20"
                      fill="none"
                      stroke={aaaBrickRed}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeDasharray={dashTotal}
                      strokeDashoffset={dashOffset}
                    />
                  </svg>
                )}
              </span>
            );
          })}
        </div>
      </>
    );
  }

  // ==========================================================================
  // 18. Footnote Loupe Zoom (Archival Optical Loupe Magnifying Key Clause)
  // ==========================================================================
  if (mode === "footnote-loupe-zoom") {
    const activeIdx = Math.max(0, getActiveWordIndex(resolvedWords, frame));
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          fontFamily: FONTS.serif,
          alignItems: "baseline",
          rowGap: "8px",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            color: aaaBrickRed,
            marginRight: "6px",
          }}
        >
          [FN.1]
        </span>
        {resolvedWords.map((item, idx) => {
          const dist = Math.abs(idx - activeIdx);
          const inLoupe = frame >= atFrame && dist === 0;
          const loupeSpring = spring({
            frame: inLoupe ? Math.max(0, frame - item.startFrame) : 0,
            fps,
            config: MOTION_SPRINGS.snappy,
            durationInFrames: 9,
          });
          const scale = inLoupe ? 1 + 0.22 * loupeSpring : 1;

          return (
            <span
              key={`loupe-${idx}`}
              style={{
                display: "inline-block",
                padding: inLoupe ? "2px 10px" : "2px 2px",
                borderRadius: "999px",
                backgroundColor: inLoupe ? surfaceCardBg : "transparent",
                border: inLoupe ? `1.5px solid ${aaaBrickRed}` : "1.5px solid transparent",
                boxShadow: inLoupe
                  ? "0 8px 20px rgba(15, 25, 35, 0.20)"
                  : "none",
                transform: `scale(${scale.toFixed(3)})`,
                opacity: dist > 2 && frame < item.startFrame ? 0.55 : 1,
                fontWeight: inLoupe || item.isEmphasis ? 700 : 500,
                color: inLoupe && item.isNumeric ? aaaBrickRed : inkPrimary,
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // 19. Stock Ticker Crawl (Institutional Live Tape Strip)
  // ==========================================================================
  if (mode === "stock-ticker-crawl") {
    const crawlDur = Math.max(12, Math.floor(totalDuration * 0.65));
    const slideX = interpolate(frame - atFrame, [0, crawlDur], [64, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const tapeOpacity = interpolate(frame - atFrame, [0, 8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexWrap: "nowrap",
          alignItems: "center",
          gap: "14px",
          padding: "10px 18px",
          borderRadius: "6px",
          backgroundColor: PAGE_PALETTE.navyDeep,
          border: `1px solid ${OVER_FOOTAGE_PALETTE.accentPrimary}`,
          fontFamily: FONTS.mono,
          textTransform: "uppercase",
          overflow: "hidden",
          opacity: tapeOpacity,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "3px 8px",
            borderRadius: "4px",
            backgroundColor: "#842B1C",
            color: OVER_FOOTAGE_PALETTE.textHeadline,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            flexShrink: 0,
          }}
        >
          ● TAPE
        </span>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.42em",
            transform: `translate3d(${slideX.toFixed(1)}px, 0, 0)`,
            whiteSpace: "nowrap",
            color: OVER_FOOTAGE_PALETTE.textHeadline,
          }}
        >
          {resolvedWords.map((item, idx) => (
            <React.Fragment key={`tape-${idx}`}>
              <span
                style={{
                  color: item.isNumeric
                    ? OVER_FOOTAGE_PALETTE.accentPrimary
                    : OVER_FOOTAGE_PALETTE.textHeadline,
                  fontWeight: item.isNumeric ? 700 : 600,
                }}
              >
                {item.word}
              </span>
              {item.pauseAfterFrames >= 4 && (
                <span style={{ color: "#F29B86" }}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 20. Antithesis Split-Lock (Thesis vs. Counter-Reality Two-Column Lockup)
  // ==========================================================================
  if (mode === "antithesis-split-lock") {
    const [leftClaim, rightReality] = splitAntithesisPair(text);
    const leftIn = spring({
      frame: Math.max(0, frame - atFrame),
      fps,
      config: MOTION_SPRINGS.snappy,
      durationInFrames: 12,
    });
    const dividerIn = interpolate(frame - (atFrame + 7), [0, 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const rightIn = spring({
      frame: Math.max(0, frame - (atFrame + 13)),
      fps,
      config: MOTION_SPRINGS.slam,
      durationInFrames: 12,
    });

    return (
      <>
        {enableSfx && frame === atFrame + 13 && (
          <SfxCue cue="glass-dock" atFrame={atFrame + 13} volume={0.52} />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "22px",
            padding: "16px 24px",
            borderRadius: "10px",
            backgroundColor: surfaceCardBg,
            border: `1px solid ${surfaceBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              opacity: leftIn,
              transform: `translate3d(${((1 - leftIn) * -20).toFixed(2)}px, 0, 0)`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: inkSecondary,
                textTransform: "uppercase",
              }}
            >
              PREMISE
            </span>
            <span style={{ color: inkPrimary, textWrap: "balance" }}>
              {preventOrphanWords(leftClaim)}
            </span>
          </div>

          <div
            style={{
              width: "2px",
              alignSelf: "stretch",
              minHeight: "48px",
              backgroundColor: aaaBrickRed,
              transform: `scaleY(${dividerIn.toFixed(3)})`,
              transformOrigin: "top center",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              opacity: rightIn,
              transform: `translate3d(${((1 - rightIn) * 20).toFixed(2)}px, 0, 0)`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: aaaBrickRed,
                textTransform: "uppercase",
              }}
            >
              RECORD REALITY
            </span>
            <span
              style={{
                color: aaaBrickRed,
                fontWeight: 800,
                textWrap: "balance",
              }}
            >
              {preventOrphanWords(rightReality)}
            </span>
          </div>
        </div>
      </>
    );
  }

  // ==========================================================================
  // 21. Erosion Decay Fade (Deterministic Fiscal / Purchasing-Power Erosion)
  // ==========================================================================
  if (mode === "erosion-decay-fade") {
    const erodeStart = atFrame + Math.floor(totalDuration * 0.42);
    return (
      <div className={className} style={baseStyle}>
        {resolvedWords.map((item, idx) => {
          if (frame < item.startFrame) return null;
          const enterP = spring({
            frame: frame - item.startFrame,
            fps,
            config: MOTION_SPRINGS.snappy,
            durationInFrames: 9,
          });
          // Earlier non-numeric words erode softly after midpoint while key numbers hold sharp
          const wordErodeTrigger = erodeStart + idx * 3;
          const rawErode = item.isNumeric
            ? 0
            : interpolate(
                frame,
                [wordErodeTrigger, wordErodeTrigger + 28],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
          const seedAngle = (idx * 73 + 19) * 0.17;
          const driftX = Math.sin(seedAngle) * rawErode * 4;
          const driftY = rawErode * (5 + (idx % 3) * 2.5);
          const finalOpacity = enterP * (1 - rawErode * 0.56);

          return (
            <span
              key={`erode-${idx}`}
              style={{
                display: "inline-block",
                transform: `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0)`,
                opacity: finalOpacity,
                filter:
                  rawErode > 0.05
                    ? `blur(${(rawErode * 1.1).toFixed(2)}px)`
                    : undefined,
                color: item.isNumeric ? aaaBrickRed : inkPrimary,
                fontWeight: item.isNumeric ? 800 : fontWeight,
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // 22. Veto Fountain Strike (Fountain-Pen Slash + Editorial Caret Replacement)
  // ==========================================================================
  if (mode === "veto-fountain-strike") {
    const { prefixContext, struckWord, replacementWord } = splitVetoReplacement(
      text,
      correctionText
    );
    const slashStart = atFrame + 7;
    const slashDur = 11;
    const slashP = interpolate(frame - slashStart, [0, slashDur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const revealStart = correctionFrame ?? slashStart + slashDur + 2;
    const replSpring = spring({
      frame: Math.max(0, frame - revealStart),
      fps,
      config: MOTION_SPRINGS.snappy,
      durationInFrames: 12,
    });

    return (
      <>
        {enableSfx && frame === slashStart && (
          <SfxCue cue="telestrator-draw" atFrame={slashStart} volume={0.6} />
        )}
        {enableSfx && frame === revealStart && (
          <SfxCue cue="sticker-pop" atFrame={revealStart} volume={0.5} />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            alignItems: "baseline",
            gap: "0.36em",
          }}
        >
          {prefixContext && <span>{prefixContext}</span>}

          <span
            style={{
              position: "relative",
              display: "inline-block",
              padding: "0 4px",
              opacity: slashP >= 1 ? 0.54 : 1,
            }}
          >
            {struckWord}
            {slashP > 0 && (
              <svg
                viewBox="0 0 140 36"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  inset: "-2px -6px",
                  width: "calc(100% + 12px)",
                  height: "calc(100% + 4px)",
                  overflow: "visible",
                  pointerEvents: "none",
                }}
              >
                <path
                  d="M 4 28 Q 68 15, 136 8"
                  fill="none"
                  stroke={aaaBrickRed}
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  strokeDasharray={160}
                  strokeDashoffset={160 * (1 - slashP)}
                />
                <path
                  d="M 10 32 Q 74 20, 132 14"
                  fill="none"
                  stroke={aaaBrickRed}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity={0.78}
                  strokeDasharray={150}
                  strokeDashoffset={150 * (1 - slashP)}
                />
              </svg>
            )}
          </span>

          {frame >= revealStart && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: "6px",
                fontFamily: FONTS.serif,
                fontWeight: 800,
                color: aaaBrickRed,
                transform: `translate3d(0, ${((1 - replSpring) * 10).toFixed(2)}px, 0) scale(${(0.9 + 0.1 * replSpring).toFixed(3)})`,
                opacity: replSpring,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "0.72em",
                  color: inkSecondary,
                }}
              >
                ∧
              </span>
              <span
                style={{
                  borderBottom: `2.5px solid ${aaaBrickRed}`,
                  paddingBottom: "1px",
                }}
              >
                {replacementWord}
              </span>
            </span>
          )}
        </div>
      </>
    );
  }

  // ==========================================================================
  // 23. Typewriter 1941 Ribbon (Bichrome Black/Crimson Stepped Hammer Strikes)
  // ==========================================================================
  if (mode === "typewriter-1941-ribbon") {
    const steppedFrame = steppedHold(frame, 15, fps);
    const totalChars = text.length;
    const typeSpan = Math.max(1, Math.min(totalDuration - 6, totalChars * 2));
    const shownCount = Math.floor(
      interpolate(steppedFrame - atFrame, [0, typeSpan], [0, totalChars], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );

    // Precompute token crimson-ribbon flags so numbers & all-caps words strike in red ink
    const charCrimsonFlags: boolean[] = [];
    const tokensWithSpaces = text.match(/\S+|\s+/g) ?? [];
    for (const tok of tokensWithSpaces) {
      const isCrimson =
        !/^\s+$/.test(tok) &&
        (/\d|[$%+-]/.test(tok) ||
          (tok.length >= 3 && tok === tok.toUpperCase() && /[A-Z]/.test(tok)));
      for (let k = 0; k < tok.length; k++) {
        charCrimsonFlags.push(isCrimson);
      }
    }

    const visibleSlice = text.slice(0, shownCount).split("");

    return (
      <>
        {enableSfx &&
          frame >= atFrame &&
          frame < atFrame + typeSpan &&
          frame % 3 === 0 && (
            <SfxCue
              cue="type-click"
              atFrame={frame}
              volume={0.42}
              playbackRate={0.92}
            />
          )}
        <div
          className={className}
          style={{
            ...baseStyle,
            display: "inline-block",
            fontFamily: FONTS.mono,
            letterSpacing: "0.02em",
            lineHeight: 1.38,
          }}
        >
          {visibleSlice.map((ch, idx) => {
            const jitterY = ((idx * 17) % 3) - 1;
            const isRedRibbon = Boolean(charCrimsonFlags[idx]);
            return (
              <span
                key={`tw41-${idx}`}
                style={{
                  display: ch === " " ? "inline" : "inline-block",
                  transform:
                    ch === " " ? undefined : `translateY(${jitterY * 0.55}px)`,
                  color: isRedRibbon ? aaaBrickRed : inkPrimary,
                  fontWeight: isRedRibbon ? 700 : 600,
                }}
              >
                {ch}
              </span>
            );
          })}
          <span
            style={{
              display: "inline-block",
              width: "0.52em",
              height: "1.05em",
              verticalAlign: "text-bottom",
              marginLeft: "2px",
              backgroundColor: aaaBrickRed,
              opacity: Math.floor(frame / 10) % 2 === 0 ? 0.85 : 0.15,
            }}
          />
        </div>
      </>
    );
  }

  // ==========================================================================
  // 24. Blueprint Dimension Callout (CAD Witness Lines + Outward Extension)
  // ==========================================================================
  if (mode === "blueprint-dimension-callout") {
    const dimSpring = spring({
      frame: Math.max(0, frame - atFrame),
      fps,
      config: MOTION_SPRINGS.snappy,
      durationInFrames: 16,
    });
    const bpAccent = isLightSurface
      ? PAGE_PALETTE.navy
      : STYLE_FAMILIES.blueprintManual.draftingAmber;

    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexDirection: "column",
          gap: "6px",
          padding: "12px 20px",
          borderRadius: "6px",
          backgroundColor: isLightSurface
            ? PAGE_PALETTE.paper
            : "rgba(15, 25, 35, 0.86)",
          border: `1px solid ${bpAccent}`,
          fontFamily: FONTS.mono,
          opacity: dimSpring,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          <span
            style={{
              width: "2px",
              height: "12px",
              backgroundColor: bpAccent,
            }}
          />
          <span style={{ fontSize: "10px", color: bpAccent }}>◄</span>
          <span
            style={{
              flexGrow: 1,
              height: "1.5px",
              backgroundColor: bpAccent,
              transform: `scaleX(${dimSpring.toFixed(3)})`,
              transformOrigin: "center",
            }}
          />
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: aaaBrickRed,
            }}
          >
            SPEC · DIM
          </span>
          <span
            style={{
              flexGrow: 1,
              height: "1.5px",
              backgroundColor: bpAccent,
              transform: `scaleX(${dimSpring.toFixed(3)})`,
              transformOrigin: "center",
            }}
          />
          <span style={{ fontSize: "10px", color: bpAccent }}>►</span>
          <span
            style={{
              width: "2px",
              height: "12px",
              backgroundColor: bpAccent,
            }}
          />
        </div>
        <div
          style={{
            textAlign: "center",
            color: inkPrimary,
            fontWeight: 700,
            textWrap: "balance",
          }}
        >
          {preventOrphanWords(text)}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 25. Chapter Roman Folio (Classical Archival Book-Plate Header)
  // ==========================================================================
  if (mode === "chapter-roman-folio") {
    const folioEnter = spring({
      frame: Math.max(0, frame - atFrame),
      fps,
      config: MOTION_SPRINGS.gentle,
      durationInFrames: 18,
    });

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="chapter-chime" atFrame={atFrame} volume={0.5} />
        )}
        <div
          className={className}
          style={{
            ...baseStyle,
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "12px",
            opacity: folioEnter,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontFamily: FONTS.mono,
              fontSize: "11.5px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: aaaBrickRed,
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "1px",
                backgroundColor: aaaBrickRed,
                transform: `scaleX(${folioEnter.toFixed(3)})`,
              }}
            />
            <span>{folioLabel ?? "FOLIO · I"}</span>
            <span
              style={{
                width: "44px",
                height: "1px",
                backgroundColor: aaaBrickRed,
                transform: `scaleX(${folioEnter.toFixed(3)})`,
              }}
            />
          </div>

          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: sizePx * 1.18,
                fontWeight: 700,
                letterSpacing: getOpticalTracking(sizePx * 1.18, "serif"),
                color: inkPrimary,
                transform: `translate3d(0, ${((1 - folioEnter) * 28).toFixed(2)}px, 0)`,
                textWrap: "balance",
              }}
            >
              {preventOrphanWords(text)}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ==========================================================================
  // 26. Debt Odometer Inline (Mechanical Rolling Digit Drums Inside Prose)
  // ==========================================================================
  if (mode === "debt-odometer-inline") {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          alignItems: "center",
          rowGap: "8px",
        }}
      >
        {resolvedWords.map((item, wIdx) => {
          const hasDigits = /\d/.test(item.word);
          if (!hasDigits) {
            const wOpacity = interpolate(
              frame,
              [item.startFrame - 2, item.startFrame + 6],
              [0.25, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <span key={`odo-w-${wIdx}`} style={{ opacity: wOpacity }}>
                {item.word}
              </span>
            );
          }

          const rollSpring = spring({
            frame: Math.max(0, frame - item.startFrame),
            fps,
            config: MOTION_SPRINGS.snappy,
            durationInFrames: 18,
          });
          const chars = item.word.split("");

          return (
            <span
              key={`odo-drum-${wIdx}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: PAGE_PALETTE.navyDeep,
                border: `1px solid ${OVER_FOOTAGE_PALETTE.accentPrimary}`,
                fontFamily: FONTS.mono,
                fontWeight: 700,
                color: OVER_FOOTAGE_PALETTE.textHeadline,
                boxShadow: "inset 0 2px 6px rgba(15, 25, 35, 0.7)",
                lineHeight: 1.1,
              }}
            >
              {chars.map((ch, cIdx) => {
                if (!/\d/.test(ch)) {
                  return (
                    <span
                      key={`odo-sym-${cIdx}`}
                      style={{ color: OVER_FOOTAGE_PALETTE.accentPrimary }}
                    >
                      {ch}
                    </span>
                  );
                }
                const targetDigit = parseInt(ch, 10);
                const currentSlot = rollSpring * targetDigit;
                return (
                  <span
                    key={`odo-d-${cIdx}`}
                    style={{
                      display: "inline-block",
                      height: "1.1em",
                      overflow: "hidden",
                      width: "0.62em",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        transform: `translate3d(0, ${(-currentSlot * 1.1).toFixed(3)}em, 0)`,
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                        <span
                          key={d}
                          style={{ height: "1.1em", lineHeight: "1.1em" }}
                        >
                          {d}
                        </span>
                      ))}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // 27. Whisper Focus Spotlight (Optical Depth-of-Field Word Focus Pull)
  // ==========================================================================
  if (mode === "whisper-focus-spotlight") {
    const activeIdx = getActiveWordIndex(resolvedWords, frame);
    return (
      <div className={className} style={{ ...baseStyle, rowGap: "6px" }}>
        {resolvedWords.map((item, idx) => {
          const isSpokenNow = idx === activeIdx;
          const isNeighbor = activeIdx >= 0 && Math.abs(idx - activeIdx) === 1;
          const isPast = activeIdx >= 0 && idx < activeIdx;

          let wordOpacity = 0.34;
          let blurPx = 1.3;
          let liftY = 0;

          if (isSpokenNow) {
            wordOpacity = 1;
            blurPx = 0;
            liftY = -2;
          } else if (isNeighbor) {
            wordOpacity = 0.78;
            blurPx = 0.25;
          } else if (isPast) {
            wordOpacity = 0.9;
            blurPx = 0;
          }

          return (
            <span
              key={`spot-${idx}`}
              style={{
                position: "relative",
                display: "inline-block",
                opacity: wordOpacity,
                filter: blurPx > 0 ? `blur(${blurPx}px)` : "none",
                transform: `translate3d(0, ${liftY}px, 0)`,
                color: isSpokenNow && item.isEmphasis ? aaaBrickRed : inkPrimary,
                fontWeight: isSpokenNow || item.isEmphasis ? 800 : fontWeight,
              }}
            >
              {item.word}
              {isSpokenNow && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: "-2px",
                    height: "2.5px",
                    backgroundColor: aaaBrickRed,
                    borderRadius: "2px",
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // ==========================================================================
  // 28. Margin Redline Gloss (Legal Marginalia Redline Bar + Italic Gloss)
  // ==========================================================================
  if (mode === "margin-redline-gloss") {
    const barDraw = interpolate(frame - atFrame, [0, 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const glossIn = spring({
      frame: Math.max(0, frame - (atFrame + 8)),
      fps,
      config: MOTION_SPRINGS.snappy,
      durationInFrames: 14,
    });
    const resolvedGloss =
      glossNote ??
      (resolvedWords.some((w) => w.isNumeric)
        ? "Primary-record figure verified"
        : "Editorial margin annotation");

    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "stretch",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "4px",
            borderRadius: "2px",
            backgroundColor: aaaBrickRed,
            transform: `scaleY(${barDraw.toFixed(3)})`,
            transformOrigin: "top center",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span style={{ color: inkPrimary, textWrap: "pretty" }}>{text}</span>
          <span
            style={{
              fontFamily: FONTS.serif,
              fontStyle: "italic",
              fontSize: Math.max(13, Math.round(sizePx * 0.54)),
              fontWeight: 600,
              color: aaaBrickRed,
              opacity: glossIn,
              transform: `translate3d(${((1 - glossIn) * 10).toFixed(2)}px, 0, 0)`,
            }}
          >
            ↳ {resolvedGloss}
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 29. Statute Clause Box (U.S. Code § Statutory Indenture Callout)
  // ==========================================================================
  if (mode === "statute-clause-box") {
    const boxIn = spring({
      frame: Math.max(0, frame - atFrame),
      fps,
      config: MOTION_SPRINGS.snappy,
      durationInFrames: 14,
    });

    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexDirection: "column",
          gap: "10px",
          padding: "16px 22px",
          borderRadius: "8px",
          backgroundColor: surfaceCardBg,
          border: `1.5px solid ${surfaceBorder}`,
          borderTop: `4px solid ${aaaBrickRed}`,
          opacity: boxIn,
          transform: `translate3d(0, ${((1 - boxIn) * 14).toFixed(2)}px, 0)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: aaaBrickRed,
            textTransform: "uppercase",
          }}
        >
          <span>{folioLabel ?? "STATUTE CLAUSE · § 1(a)"}</span>
          <span style={{ color: inkSecondary }}>ENACTED RECORD</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            fontFamily: FONTS.serif,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "0.68em",
              fontWeight: 700,
              color: inkSecondary,
              flexShrink: 0,
            }}
          >
            (1)
          </span>
          <span style={{ color: inkPrimary, lineHeight: 1.38, textWrap: "pretty" }}>
            {preventOrphanWords(text)}
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 30. Question Inversion Turn (Rhetorical Pivot Flip + Inflection Arc)
  // ==========================================================================
  if (mode === "question-inversion-turn") {
    const turnP = spring({
      frame: Math.max(0, frame - atFrame),
      fps,
      config: MOTION_SPRINGS.snappy,
      durationInFrames: 15,
    });
    const arcDraw = interpolate(frame - (atFrame + 8), [0, 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexDirection: "column",
          gap: "6px",
          fontFamily: FONTS.serif,
          transform: `perspective(840px) rotateX(${((1 - turnP) * -52).toFixed(2)}deg)`,
          opacity: turnP,
        }}
      >
        <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.28em" }}>
          {resolvedWords.map((item, idx) => {
            const isInterrogative =
              idx === 0 &&
              /^(why|how|where|what|who|when|which)\b/i.test(item.cleanWord);
            const hasQuestionMark = item.word.indexOf("?") !== -1;
            return (
              <span
                key={`qturn-${idx}`}
                style={{
                  fontStyle: isInterrogative ? "italic" : "normal",
                  fontWeight: isInterrogative || hasQuestionMark ? 800 : 600,
                  color:
                    isInterrogative || hasQuestionMark ? aaaBrickRed : inkPrimary,
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
        <div
          style={{
            height: "2.5px",
            width: "100%",
            background: `linear-gradient(90deg, transparent 0%, ${aaaBrickRed} 100%)`,
            transform: `scaleX(${arcDraw.toFixed(3)})`,
            transformOrigin: "left center",
          }}
        />
      </div>
    );
  }

  // ==========================================================================
  // 31. Silent Black Aphorism (1920s Archival Charcoal-Black Intertitle Card)
  // ==========================================================================
  if (mode === "silent-black-aphorism") {
    const stepped = steppedHold(frame, 12, fps);
    const fadeP = interpolate(stepped - atFrame, [0, 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const v1920 = STYLE_FAMILIES.vintage1920s;

    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "28px 42px",
          borderRadius: "4px",
          backgroundColor: v1920.cardBlack, // #0D0C0B (never #000000!)
          border: `2px double ${v1920.sepiaGlow}`,
          outline: `1px solid ${v1920.filmBorder}`,
          outlineOffset: "-7px",
          fontFamily: FONTS.serif,
          color: v1920.intertitleCream, // #EFE6CF (15.4:1 WCAG AAA!)
          opacity: fadeP,
        }}
      >
        <span
          style={{
            fontSize: "12px",
            letterSpacing: "0.25em",
            color: v1920.sepiaGlow,
            marginBottom: "8px",
          }}
        >
          ✦ ✦ ✦
        </span>
        <span
          style={{
            fontStyle: "italic",
            lineHeight: 1.35,
            maxWidth: "760px",
            textWrap: "balance",
          }}
        >
          “{preventOrphanWords(text)}”
        </span>
      </div>
    );
  }

  // ==========================================================================
  // 32. Cascading Evidence Stack (Staggered Forensic Exhibit Strips)
  // ==========================================================================
  if (mode === "cascading-evidence-stack") {
    const stackItems =
      phrases.length > 1
        ? phrases.slice(0, 4)
        : [
            {
              index: 0,
              text,
              words: resolvedWords,
              startFrame: atFrame,
              endFrame: atFrame + totalDuration,
              hasNumeric: resolvedWords.some((w) => w.isNumeric),
              isEmphasis: true,
            },
          ];

    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          display: "inline-flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {stackItems.map((chunk, sIdx) => {
          if (frame < chunk.startFrame) return null;
          const dropSpring = spring({
            frame: frame - chunk.startFrame,
            fps,
            config: MOTION_SPRINGS.snappy,
            durationInFrames: 11,
          });
          const exhibitLetter = String.fromCharCode(65 + (sIdx % 26));

          return (
            <div
              key={`exh-${sIdx}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 16px",
                marginLeft: `${sIdx * 12}px`,
                borderRadius: "6px",
                backgroundColor: surfaceCardBg,
                border: `1px solid ${surfaceBorder}`,
                borderLeft: `3.5px solid ${
                  chunk.hasNumeric ? aaaBrickRed : highlightColor
                }`,
                transform: `translate3d(0, ${((1 - dropSpring) * -14).toFixed(2)}px, 0)`,
                opacity: dropSpring,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "10.5px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: aaaBrickRed,
                  flexShrink: 0,
                }}
              >
                EXH.{exhibitLetter}
              </span>
              <span
                style={{
                  color: chunk.hasNumeric ? aaaBrickRed : inkPrimary,
                  fontWeight: chunk.hasNumeric ? 800 : fontWeight,
                }}
              >
                {chunk.text}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return <div style={baseStyle}>{text}</div>;
};
