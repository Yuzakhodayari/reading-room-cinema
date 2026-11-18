import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SfxCue } from "../components/SfxCue";
import {
  FONTS,
  getOpticalTracking,
  preventOrphanWords,
  TABULAR_NUM_STYLE,
} from "../design/fonts";
import { OVER_FOOTAGE_PALETTE, PAGE_PALETTE } from "../design/tokens";
import { MOTION_SPRINGS } from "../motion/primitives";

export type HeadlineVariant =
  | "newspaper-cutout"
  | "broadcast-lower-third"
  | "spy-title"
  | "chapter-card";

export interface EditorialHeadlineProps {
  variant?: HeadlineVariant;
  title: string;
  subtitle?: string;
  category?: string;
  /** Optional Dual-Palette override (`page` #FAF8F3 milk canvas vs `over-footage` #0F1923 smoked-navy glass) */
  paletteMode?: "page" | "over-footage";
  atFrame?: number;
  duration?: number;
  fontSize?: number | string;
  enableSfx?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const BALANCED_WRAP_STYLE: React.CSSProperties = {
  textWrap: "balance",
  overflowWrap: "break-word",
  ...TABULAR_NUM_STYLE,
};

const PRETTY_SUBTITLE_STYLE: React.CSSProperties = {
  textWrap: "pretty",
  overflowWrap: "break-word",
  ...TABULAR_NUM_STYLE,
};

/**
 * EditorialHeadline Component
 * Four canonical headline treatments upgraded with orphan-free balanced line wrapping
 * and WCAG AAA (>= 7.0:1) contrast across both `page` (#FAF8F3) and `over-footage` (#0F1923 glass) modes:
 * - newspaper-cutout: Scissor-cut tactile print or smoked-glass dossier card
 * - broadcast-lower-third: Editorial broadcast lower-third with dateline badge
 * - spy-title: Redacted declassified brief
 * - chapter-card: Centered architectural act title card
 */
export const EditorialHeadline: React.FC<EditorialHeadlineProps> = ({
  variant = "broadcast-lower-third",
  title,
  subtitle,
  category = "SPECIAL INVESTIGATION",
  paletteMode,
  atFrame = 0,
  duration = 90,
  fontSize,
  enableSfx = true,
  className,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const balancedTitle = React.useMemo(() => preventOrphanWords(title), [title]);
  const balancedSubtitle = React.useMemo(
    () => (subtitle ? preventOrphanWords(subtitle) : undefined),
    [subtitle]
  );

  if (frame < atFrame) return null;
  if (frame >= atFrame + duration) return null;

  const elapsed = Math.max(0, frame - atFrame);
  const enterSpring = spring({
    frame: elapsed,
    fps,
    config: MOTION_SPRINGS.snappy,
    durationInFrames: 14,
  });

  // WCAG AAA brick-red on #FAF8F3/#F2F0EA (#842B1C = 8.1:1 - 8.7:1) & AAA slate (#384858 = 8.25:1)
  const aaaBrickRedPage = "#842B1C";
  const aaaSubtitlePage = "#2C3B4B";

  // 1. Newspaper Cutout
  if (variant === "newspaper-cutout") {
    const isGlass = paletteMode === "over-footage";
    const rot = -1.1 + (1 - enterSpring) * -3.6;
    const resolvedSize = fontSize ?? 42;

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="paper-slide" atFrame={atFrame} volume={0.6} />
        )}
        <div
          className={className}
          style={{
            display: "inline-block",
            transform: `translate3d(0, ${(1 - enterSpring) * 32}px, 0) rotate(${rot}deg) scale(${0.92 + 0.08 * enterSpring})`,
            opacity: enterSpring,
            background: isGlass
              ? `linear-gradient(145deg, rgba(15, 25, 35, 0.90) 0%, rgba(28, 43, 58, 0.86) 100%)`
              : PAGE_PALETTE.paperLight,
            backdropFilter: isGlass ? "blur(14px) saturate(160%)" : undefined,
            WebkitBackdropFilter: isGlass ? "blur(14px) saturate(160%)" : undefined,
            color: isGlass ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.navy,
            padding: "32px 44px",
            borderRadius: "8px",
            boxShadow: isGlass
              ? "0 22px 48px rgba(15, 25, 35, 0.44)"
              : "0 18px 40px rgba(28, 43, 58, 0.14)",
            border: `1px solid ${
              isGlass ? OVER_FOOTAGE_PALETTE.glassBorder : PAGE_PALETTE.paperBorder
            }`,
            maxWidth: "860px",
            userSelect: "none",
            ...style,
          }}
        >
          {category && (
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: getOpticalTracking(11.5, "mono"),
                color: isGlass ? "#F29B86" : aaaBrickRedPage,
                borderBottom: `2px solid ${
                  isGlass ? OVER_FOOTAGE_PALETTE.accentPrimary : PAGE_PALETTE.navy
                }`,
                paddingBottom: "6px",
                marginBottom: "12px",
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          )}
          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: resolvedSize,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: getOpticalTracking(resolvedSize, "serif"),
              color: isGlass ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.navy,
              textShadow: isGlass ? OVER_FOOTAGE_PALETTE.textShadow : undefined,
              ...BALANCED_WRAP_STYLE,
            }}
          >
            {balancedTitle}
          </div>
          {balancedSubtitle && (
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: "16.5px",
                color: isGlass ? OVER_FOOTAGE_PALETTE.textBody : aaaSubtitlePage,
                marginTop: "12px",
                lineHeight: 1.5,
                fontWeight: 500,
                textShadow: isGlass ? OVER_FOOTAGE_PALETTE.textShadow : undefined,
                ...PRETTY_SUBTITLE_STYLE,
              }}
            >
              {balancedSubtitle}
            </div>
          )}
        </div>
      </>
    );
  }

  // 2. Broadcast Lower Third
  if (variant === "broadcast-lower-third") {
    const isGlass = paletteMode === "over-footage";
    const resolvedSize = fontSize ?? 28;

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="glass-dock" atFrame={atFrame} volume={0.6} />
        )}
        <div
          className={className}
          style={{
            position: "absolute",
            bottom: "64px",
            left: "64px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            transform: `translate3d(${(1 - enterSpring) * -48}px, 0, 0)`,
            opacity: enterSpring,
            zIndex: 40,
            userSelect: "none",
            ...style,
          }}
        >
          {/* Header Slug Bar (#842B1C with #FAF8F3 = 8.73:1 WCAG AAA) */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: aaaBrickRedPage,
              color: PAGE_PALETTE.paperLight,
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: getOpticalTracking(11, "mono"),
              padding: "4px 12px",
              textTransform: "uppercase",
              alignSelf: "flex-start",
              borderRadius: "6px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: PAGE_PALETTE.paperLight,
              }}
            />
            {category}
          </div>

          {/* Main Content Card */}
          <div
            style={{
              background: isGlass
                ? `linear-gradient(135deg, rgba(15, 25, 35, 0.88) 0%, rgba(28, 43, 58, 0.84) 100%)`
                : "rgba(250, 248, 243, 0.97)",
              backdropFilter: "blur(12px) saturate(160%)",
              WebkitBackdropFilter: "blur(12px) saturate(160%)",
              border: `1px solid ${
                isGlass ? OVER_FOOTAGE_PALETTE.glassBorder : PAGE_PALETTE.paperBorder
              }`,
              borderLeft: `4px solid ${
                isGlass ? OVER_FOOTAGE_PALETTE.accentPrimary : PAGE_PALETTE.navy
              }`,
              padding: "18px 28px",
              borderRadius: "10px",
              boxShadow: isGlass
                ? "0 18px 42px rgba(15, 25, 35, 0.42)"
                : "0 16px 36px rgba(28, 43, 58, 0.14)",
              maxWidth: "820px",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: resolvedSize,
                fontWeight: 700,
                color: isGlass ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.navy,
                letterSpacing: getOpticalTracking(resolvedSize, "sans"),
                lineHeight: 1.24,
                textShadow: isGlass ? OVER_FOOTAGE_PALETTE.textShadow : undefined,
                ...BALANCED_WRAP_STYLE,
              }}
            >
              {balancedTitle}
            </div>
            {balancedSubtitle && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: isGlass ? OVER_FOOTAGE_PALETTE.textMuted : "#384858",
                  marginTop: "6px",
                  letterSpacing: "0.025em",
                  lineHeight: 1.42,
                  textShadow: isGlass ? OVER_FOOTAGE_PALETTE.textShadow : undefined,
                  ...PRETTY_SUBTITLE_STYLE,
                }}
              >
                {balancedSubtitle}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // 3. Spy Title (Declassified Dossier - supports both Dark Navy Glass & Light Page Dossier)
  if (variant === "spy-title") {
    const isPageMode = paletteMode === "page";
    const resolvedSize = fontSize ?? 38;
    const revealProgress = interpolate(elapsed, [4, 22], [0, 100], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="newsreel-click" atFrame={atFrame} volume={0.6} />
        )}
        <div
          className={className}
          style={{
            display: "inline-flex",
            flexDirection: "column",
            gap: "14px",
            padding: "36px 46px",
            background: isPageMode
              ? PAGE_PALETTE.paperLight
              : `linear-gradient(145deg, ${PAGE_PALETTE.navyDeep} 0%, ${PAGE_PALETTE.navy} 100%)`,
            border: `1.5px solid ${
              isPageMode ? PAGE_PALETTE.navy : OVER_FOOTAGE_PALETTE.accentPrimary
            }`,
            borderRadius: "12px",
            boxShadow: isPageMode
              ? "0 20px 44px rgba(28, 43, 58, 0.14)"
              : "0 22px 48px rgba(15, 25, 35, 0.34)",
            maxWidth: "880px",
            opacity: enterSpring,
            userSelect: "none",
            ...style,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              borderBottom: `1px solid ${
                isPageMode ? PAGE_PALETTE.paperBorder : "rgba(191, 214, 234, 0.36)"
              }`,
              paddingBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11.5px",
                color: isPageMode ? aaaBrickRedPage : OVER_FOOTAGE_PALETTE.accentPrimary,
                fontWeight: 700,
                letterSpacing: getOpticalTracking(11.5, "mono"),
                textTransform: "uppercase",
              }}
            >
              {category}
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 600,
                color: isPageMode ? "#384858" : OVER_FOOTAGE_PALETTE.textMuted,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Record Brief
            </span>
          </div>

          <div style={{ position: "relative", display: "inline-block" }}>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: resolvedSize,
                fontWeight: 700,
                lineHeight: 1.18,
                color: isPageMode
                  ? PAGE_PALETTE.navy
                  : OVER_FOOTAGE_PALETTE.textHeadline,
                letterSpacing: getOpticalTracking(resolvedSize, "serif"),
                ...BALANCED_WRAP_STYLE,
              }}
            >
              {balancedTitle}
            </div>

            {/* Sliding Redaction Bar Reveal */}
            <div
              style={{
                position: "absolute",
                inset: "-2px -4px",
                backgroundColor: isPageMode
                  ? PAGE_PALETTE.navy
                  : PAGE_PALETTE.navyDeep,
                transform: `scaleX(${Math.max(0, 1 - revealProgress / 100)})`,
                transformOrigin: "right center",
                pointerEvents: "none",
              }}
            />
          </div>

          {balancedSubtitle && (
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: "16px",
                color: isPageMode ? aaaSubtitlePage : OVER_FOOTAGE_PALETTE.textBody,
                lineHeight: 1.48,
                maxWidth: "760px",
                ...PRETTY_SUBTITLE_STYLE,
              }}
            >
              {balancedSubtitle}
            </div>
          )}
        </div>
      </>
    );
  }

  // 4. Chapter Card (Architectural Act Plate - supports both Page Milk & Over-Footage Navy)
  if (variant === "chapter-card") {
    const isPageMode = paletteMode === "page";
    const resolvedSize = fontSize ?? 56;

    return (
      <>
        {enableSfx && frame === atFrame && (
          <SfxCue cue="chapter-chime" atFrame={atFrame} volume={0.6} />
        )}
        <div
          className={className}
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "18px",
            padding: "52px 72px",
            background: isPageMode
              ? PAGE_PALETTE.paperLight
              : `linear-gradient(145deg, ${PAGE_PALETTE.navyDeep} 0%, ${PAGE_PALETTE.navy} 100%)`,
            border: `1.5px solid ${
              isPageMode ? PAGE_PALETTE.paperBorder : OVER_FOOTAGE_PALETTE.accentPrimary
            }`,
            borderRadius: "16px",
            boxShadow: isPageMode
              ? "0 24px 52px rgba(28, 43, 58, 0.12)"
              : "0 24px 52px rgba(15, 25, 35, 0.34)",
            transform: `scale(${0.93 + 0.07 * enterSpring})`,
            opacity: enterSpring,
            userSelect: "none",
            ...style,
          }}
        >
          {category && (
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                letterSpacing: "0.14em",
                color: isPageMode
                  ? aaaBrickRedPage
                  : OVER_FOOTAGE_PALETTE.accentPrimary,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          )}

          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: resolvedSize,
              fontWeight: 700,
              color: isPageMode
                ? PAGE_PALETTE.navy
                : OVER_FOOTAGE_PALETTE.textHeadline,
              letterSpacing: getOpticalTracking(resolvedSize, "serif"),
              lineHeight: 1.14,
              maxWidth: "960px",
              ...BALANCED_WRAP_STYLE,
            }}
          >
            {balancedTitle}
          </div>

          {balancedSubtitle && (
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: "18px",
                color: isPageMode ? aaaSubtitlePage : OVER_FOOTAGE_PALETTE.textBody,
                maxWidth: "740px",
                lineHeight: 1.5,
                ...PRETTY_SUBTITLE_STYLE,
              }}
            >
              {balancedSubtitle}
            </div>
          )}
        </div>
      </>
    );
  }

  return null;
};
