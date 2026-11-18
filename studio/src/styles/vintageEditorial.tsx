import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SfxCue } from "../components/SfxCue";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import { ReadingRoomStage } from "../design/optics";
import {
  CINEMA_SPRINGS,
  COLORS,
  LAYOUT,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  REGISTERS,
  STYLE_FAMILIES,
} from "../design/tokens";
import { steppedHold } from "../motion/primitives";

export type VintagePaletteMode = "page" | "over-footage" | "card";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// ============================================================================
// 1. Newsreel1920s (1.37:1 Gate, Nitrate Surround #0D0C0B, Gate Weave, Slate)
// ============================================================================
export interface Newsreel1920sProps {
  children?: React.ReactNode;
  placeDate?: string;
  headline?: string;
  reelCode?: string;
  metricBadge?: string;
  tickerCaption?: string;
  atFrame?: number;
}

export const Newsreel1920s: React.FC<Newsreel1920sProps> = ({
  children,
  placeDate = "GENEVA · 1927",
  headline,
  reelCode = "REEL 04 · NITRATE 35MM",
  metricBadge,
  tickerCaption,
  atFrame = 0,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const weaveX = Math.sin(rawFrame * 1.7) * 1.5;
  const weaveY = Math.cos(rawFrame * 2.1) * 1.8;
  const flicker =
    1.0 + Math.sin(rawFrame * 3.4) * 0.035 + ((rawFrame * 19) % 7) * 0.004;

  const elapsed = Math.max(0, rawFrame - atFrame);
  const placeCardSpring = spring({
    frame: elapsed,
    fps,
    config: CINEMA_SPRINGS.editorialSnap,
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: REGISTERS.vintage_newsreel.bg.recessed,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {rawFrame === atFrame && (
        <SfxCue cue="newsreel-click" atFrame={atFrame} volume={0.65} />
      )}

      {/* 1.37:1 Academy Ratio Gate (Responsive inside embedded containers or full 1480x1080) */}
      <div
        style={{
          position: "relative",
          width: "82%",
          maxWidth: "1480px",
          height: "92%",
          maxHeight: "1020px",
          borderRadius: "24px",
          overflow: "hidden",
          backgroundColor: REGISTERS.vintage_newsreel.bg.canvas,
          border: `2px solid ${REGISTERS.vintage_newsreel.rule.oxford}`,
          transform: `translate3d(${weaveX.toFixed(2)}px, ${weaveY.toFixed(2)}px, 0)`,
          filter: `sepia(0.32) contrast(1.12) brightness(${flicker.toFixed(3)})`,
        }}
      >
        {/* Child Content or Default Archival Newsreel Frame */}
        <div style={{ width: "100%", height: "100%" }}>
          {children ?? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "88px",
                boxSizing: "border-box",
                textAlign: "center",
              }}
            >
              {metricBadge && (
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "46px",
                    fontWeight: 700,
                    color: REGISTERS.vintage_newsreel.accent.capital,
                    marginBottom: "18px",
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {metricBadge}
                </div>
              )}
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: "38px",
                  lineHeight: 1.28,
                  color: REGISTERS.vintage_newsreel.ink.primary,
                  maxWidth: "920px",
                }}
              >
                {headline ?? "Archival Silver-Nitrate Dispatch"}
              </div>
            </div>
          )}
        </div>

        {/* Procedural Film Scratch Lines */}
        {rawFrame % 14 < 6 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "32%",
              width: "1px",
              backgroundColor: "rgba(239, 230, 207, 0.24)",
              pointerEvents: "none",
            }}
          />
        )}
        {rawFrame % 18 < 4 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "68%",
              width: "1.5px",
              backgroundColor: "rgba(239, 230, 207, 0.18)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Vintage Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 45%, rgba(13, 12, 11, 0.84) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Place Card: Top Left Inside Gate */}
        <div
          style={{
            position: "absolute",
            top: "36px",
            left: "44px",
            backgroundColor: "rgba(20, 18, 16, 0.90)",
            border: `2px solid ${REGISTERS.vintage_newsreel.ink.primary}`,
            padding: "8px 20px",
            transform: `translate3d(${((1 - placeCardSpring) * -48).toFixed(2)}px, 0, 0)`,
            opacity: placeCardSpring,
            zIndex: 30,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.condensed,
              fontSize: "19px",
              letterSpacing: "0.16em",
              color: REGISTERS.vintage_newsreel.ink.primary,
              fontWeight: 700,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {placeDate}
          </div>
          {headline && (
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "14px",
                color: REGISTERS.vintage_newsreel.ink.secondary,
                marginTop: "2px",
              }}
            >
              {headline}
            </div>
          )}
        </div>

        {/* Reel Code Stamp Top Right */}
        <div
          style={{
            position: "absolute",
            top: "38px",
            right: "44px",
            fontFamily: FONTS.mono,
            fontSize: "11.5px",
            letterSpacing: "0.1em",
            color: REGISTERS.vintage_newsreel.ink.muted,
            ...TABULAR_NUM_STYLE,
          }}
        >
          {reelCode}
        </div>

        {tickerCaption && (
          <div
            style={{
              position: "absolute",
              bottom: "28px",
              left: "44px",
              right: "44px",
              backgroundColor: "rgba(20, 18, 16, 0.86)",
              borderTop: `1px solid ${REGISTERS.vintage_newsreel.rule.oxford}`,
              padding: "10px 18px",
              fontFamily: FONTS.mono,
              fontSize: "13px",
              color: REGISTERS.vintage_newsreel.ink.secondary,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {tickerCaption}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. SilentFilmCard (Ornate Art-Deco Filigree Intertitle Card)
// ============================================================================
export interface SilentFilmCardProps {
  title: string;
  dialogue?: string;
  actLabel?: string;
  yearTag?: string;
  sourceNote?: string;
  atFrame?: number;
}

export const SilentFilmCard: React.FC<SilentFilmCardProps> = ({
  title,
  dialogue,
  actLabel = "ARCHIVAL INTERTITLE",
  yearTag,
  sourceNote,
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - atFrame);
  const pushScale = interpolate(elapsed, [0, 150], [1.0, 1.038], CLAMP);
  const fade = interpolate(elapsed, [0, 10], [0, 1], CLAMP);

  const cream = STYLE_FAMILIES.vintage1920s.intertitleCream;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: STYLE_FAMILIES.vintage1920s.cardBlack,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "1320px",
          height: "860px",
          border: `3px solid ${cream}`,
          boxShadow: `inset 0 0 0 10px ${STYLE_FAMILIES.vintage1920s.cardBlack}, inset 0 0 0 12px ${cream}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "76px 96px",
          boxSizing: "border-box",
          textAlign: "center",
          opacity: fade,
          transform: `scale(${pushScale.toFixed(4)})`,
        }}
      >
        {/* Art-Deco Filigree Corner Ornaments */}
        <svg
          viewBox="0 0 1320 860"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <g stroke={cream} strokeWidth="2" fill="none" opacity={0.78}>
            <path d="M 28 76 L 28 28 L 76 28 M 38 56 L 56 38" />
            <path d="M 1292 76 L 1292 28 L 1244 28 M 1282 56 L 1264 38" />
            <path d="M 28 784 L 28 832 L 76 832 M 38 804 L 56 822" />
            <path d="M 1292 784 L 1292 832 L 1244 832 M 1282 804 L 1264 822" />
          </g>
        </svg>

        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "13px",
            letterSpacing: "0.22em",
            color: REGISTERS.vintage_newsreel.ink.muted,
            textTransform: "uppercase",
            marginBottom: "28px",
            ...TABULAR_NUM_STYLE,
          }}
        >
          {actLabel}
          {yearTag ? ` · ${yearTag}` : ""}
        </div>

        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: title.length > 72 ? "38px" : "46px",
            color: cream,
            letterSpacing: "0.05em",
            fontWeight: 700,
            lineHeight: 1.28,
            maxWidth: "960px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            width: "160px",
            height: "1.5px",
            backgroundColor: REGISTERS.vintage_newsreel.bezelHex,
            marginTop: "28px",
            marginBottom: dialogue ? "28px" : "0px",
          }}
        />

        {dialogue && (
          <div
            style={{
              fontFamily: FONTS.serif,
              fontStyle: "italic",
              fontSize: "26px",
              lineHeight: 1.42,
              color: REGISTERS.vintage_newsreel.ink.secondary,
              maxWidth: "880px",
              ...TABULAR_NUM_STYLE,
            }}
          >
            “{dialogue}”
          </div>
        )}

        {sourceNote && (
          <div
            style={{
              position: "absolute",
              bottom: "36px",
              fontFamily: FONTS.mono,
              fontSize: "12px",
              letterSpacing: "0.12em",
              color: REGISTERS.vintage_newsreel.ink.muted,
            }}
          >
            {sourceNote}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. CollageCutout (12fps Stop-Motion Torn Clipping + Masking Tape + Page Mode)
// ============================================================================
export interface CollageCutoutProps {
  children?: React.ReactNode;
  rotation?: number;
  width?: number | string;
  height?: number | string;
  eyebrow?: string;
  title?: string;
  metric?: string;
  caption?: string;
  sourceCitation?: string;
  paletteMode?: VintagePaletteMode;
  atFrame?: number;
}

export const CollageCutout: React.FC<CollageCutoutProps> = ({
  children,
  rotation = -3.5,
  width,
  height,
  eyebrow = "ARCHIVE CLIPPING",
  title,
  metric,
  caption,
  sourceCitation,
  paletteMode = "card",
  atFrame = 0,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const frame = steppedHold(rawFrame, 12, fps);
  const elapsed = Math.max(0, frame - atFrame);

  const jitterX = ((frame * 13) % 5) - 2;
  const jitterY = ((frame * 17) % 5) - 2;

  const enter = spring({
    frame: elapsed,
    fps: 12,
    config: CINEMA_SPRINGS.editorialSnap,
  });

  const cutoutNode = (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width,
        height,
        transform: `translate3d(${jitterX}px, ${jitterY}px, 0) rotate(${rotation}deg) scale(${enter.toFixed(4)})`,
        opacity: enter > 0.01 ? 1 : 0,
        backgroundColor: COLORS.paperLight,
        padding: "10px",
        borderRadius: "4px",
        border: `1.5px solid ${COLORS.paperBorder}`,
        boxShadow: "0 18px 38px rgba(28, 43, 58, 0.16)",
        userSelect: "none",
      }}
    >
      {/* Translucent Archival Masking Tape Strip */}
      <div
        style={{
          position: "absolute",
          top: "-11px",
          left: "50%",
          width: "92px",
          height: "22px",
          transform: "translateX(-50%) rotate(1.8deg)",
          backgroundColor: "rgba(233, 196, 106, 0.42)",
          border: "1px solid rgba(176, 141, 87, 0.35)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
        {children ?? (
          <div style={{ padding: "24px 30px", maxWidth: "480px" }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.09em",
                color: COLORS.brickRed,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </div>
            {title && (
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: "28px",
                  fontWeight: 700,
                  color: COLORS.navy,
                  marginTop: "8px",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>
            )}
            {metric && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "34px",
                  fontWeight: 700,
                  color: COLORS.brickRed,
                  marginTop: "12px",
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {metric}
              </div>
            )}
            {caption && (
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "15px",
                  color: REGISTERS.page_editorial.ink.secondary,
                  marginTop: "8px",
                  lineHeight: 1.45,
                }}
              >
                {caption}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (paletteMode !== "page") {
    return cutoutNode;
  }

  return (
    <ReadingRoomStage
      register="archival_parchment"
      chapterTitle={eyebrow}
      folioLabel="12FPS PRESS CUTOUT"
      sourceCitation={sourceCitation}
      cameraMove="static"
    >
      <div
        style={{
          position: "absolute",
          left: LAYOUT.safeMargin,
          right: LAYOUT.safeMargin,
          top: 132,
          bottom: 108,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "64px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "13px",
              fontWeight: 700,
              color: REGISTERS.archival_parchment.accent.liability,
              letterSpacing: "0.1em",
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              margin: "14px 0 0 0",
              fontFamily: FONTS.serif,
              fontSize: "54px",
              lineHeight: 1.1,
              color: REGISTERS.archival_parchment.ink.primary,
            }}
          >
            {title ?? "Primary Press Clipping"}
          </h1>
          {caption && (
            <p
              style={{
                margin: "20px 0 0 0",
                fontFamily: FONTS.sans,
                fontSize: "21px",
                lineHeight: 1.5,
                color: REGISTERS.archival_parchment.ink.secondary,
              }}
            >
              {caption}
            </p>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>{cutoutNode}</div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// 4. SpyTitleSequence (Classified Navy Chapter Dossier + Metadata Strip)
// ============================================================================
export interface SpyTitleSequenceProps {
  title: string;
  codeName?: string;
  subtitle?: string;
  dossierId?: string;
  clearance?: string;
  subjectMetric?: string;
  sourceCitation?: string;
  atFrame?: number;
}

export const SpyTitleSequence: React.FC<SpyTitleSequenceProps> = ({
  title,
  codeName = "Chapter Brief",
  subtitle,
  dossierId = "FOLIO NO. RR-2026-09",
  clearance = "PRIMARY RECORD BRIEFING",
  subjectMetric,
  sourceCitation,
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - atFrame);

  const barProgress = interpolate(elapsed, [0, 22], [0, 100], CLAMP);
  const metaFade = interpolate(elapsed, [12, 28], [0, 1], CLAMP);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: `linear-gradient(145deg, ${PAGE_PALETTE.navyDeep} 0%, ${PAGE_PALETTE.navy} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "88px",
        boxSizing: "border-box",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Subtle Drafting Coordinate Hairlines */}
      <div
        style={{
          position: "absolute",
          inset: "48px",
          border: "1px solid rgba(169, 196, 222, 0.20)",
          pointerEvents: "none",
        }}
      />

      {/* Top Dossier Header Bar */}
      <div
        style={{
          position: "absolute",
          top: "72px",
          left: "88px",
          right: "88px",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: FONTS.mono,
          fontSize: "12px",
          letterSpacing: "0.14em",
          color: OVER_FOOTAGE_PALETTE.accentPrimary,
          opacity: metaFade,
          ...TABULAR_NUM_STYLE,
        }}
      >
        <span>{dossierId}</span>
        <span>{clearance}</span>
      </div>

      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: "13px",
          color: OVER_FOOTAGE_PALETTE.accentPrimary,
          backgroundColor: "rgba(15, 25, 35, 0.48)",
          letterSpacing: "0.18em",
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: "22px",
          padding: "6px 16px",
          border: `1px solid ${OVER_FOOTAGE_PALETTE.accentPrimary}`,
          borderRadius: "999px",
        }}
      >
        {codeName}
      </div>

      <div style={{ position: "relative", maxWidth: "1180px", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: FONTS.serif,
            fontSize: title.length > 48 ? "60px" : "74px",
            fontWeight: 700,
            color: OVER_FOOTAGE_PALETTE.textHeadline,
            letterSpacing: "-0.015em",
            lineHeight: 1.12,
            margin: 0,
          }}
        >
          {title}
        </h1>

        {/* Sliding Deep Navy Redaction Bar */}
        <div
          style={{
            position: "absolute",
            inset: "-6px -12px",
            backgroundColor: PAGE_PALETTE.navyDeep,
            transform: `scaleX(${Math.max(0, 1 - barProgress / 100).toFixed(4)})`,
            transformOrigin: "right center",
          }}
        />
      </div>

      {(subtitle || subjectMetric) && (
        <div
          style={{
            marginTop: "28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            opacity: metaFade,
            maxWidth: "880px",
            textAlign: "center",
          }}
        >
          {subjectMetric && (
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "34px",
                fontWeight: 700,
                color: OVER_FOOTAGE_PALETTE.brickRedText,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {subjectMetric}
            </div>
          )}
          {subtitle && (
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: "20px",
                lineHeight: 1.48,
                color: OVER_FOOTAGE_PALETTE.textBody,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      {sourceCitation && (
        <div
          style={{
            position: "absolute",
            bottom: "72px",
            left: "88px",
            fontFamily: FONTS.mono,
            fontSize: "12.5px",
            color: OVER_FOOTAGE_PALETTE.textMuted,
            opacity: metaFade,
          }}
        >
          § {sourceCitation}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. StainedGlassFrame (Milk #FAF8F3 + Soft Blue & Blush Lead-Came Sanctuary)
// ============================================================================
export interface StainedGlassFrameProps {
  children?: React.ReactNode;
  eyebrow?: string;
  title?: string;
  metric?: string;
  body?: string;
  sourceCitation?: string;
}

export const StainedGlassFrame: React.FC<StainedGlassFrameProps> = ({
  children,
  eyebrow = "INSTITUTIONAL COVENANT",
  title,
  metric,
  body,
  sourceCitation,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: PAGE_PALETTE.paperLight,
        border: `10px solid ${PAGE_PALETTE.navy}`,
        boxSizing: "border-box",
        boxShadow: "inset 0 0 48px rgba(28, 43, 58, 0.12)",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <polygon points="0,0 440,0 320,260 0,340" fill="rgba(169, 196, 222, 0.42)" />
        <polygon points="440,0 960,0 740,185 320,260" fill="rgba(62, 106, 148, 0.14)" />
        <polygon points="0,340 320,260 390,540 0,680" fill={PAGE_PALETTE.paper} />

        <polygon points="960,0 1480,0 1600,260 1180,185" fill={PAGE_PALETTE.riskFill} />
        <polygon points="1480,0 1920,0 1920,340 1600,260" fill="rgba(28, 43, 58, 0.10)" />
        <polygon points="1600,260 1920,340 1920,680 1530,540" fill="rgba(169, 196, 222, 0.34)" />

        <polygon points="0,680 390,540 320,820 0,1080" fill={PAGE_PALETTE.riskFill} />
        <polygon points="0,1080 320,820 740,895 440,1080" fill="rgba(62, 106, 148, 0.12)" />
        <polygon points="440,1080 740,895 960,1080" fill="rgba(169, 196, 222, 0.36)" />

        <polygon points="1530,540 1920,680 1920,1080 1600,820" fill={PAGE_PALETTE.paper} />
        <polygon points="1180,895 1600,820 1920,1080 1480,1080" fill="rgba(47, 143, 139, 0.14)" />
        <polygon points="960,1080 1180,895 1480,1080" fill={PAGE_PALETTE.riskFill} />

        <polygon
          points="440,210 1480,210 1600,340 1600,740 1480,870 440,870 320,740 320,340"
          fill={PAGE_PALETTE.paperLight}
          stroke={PAGE_PALETTE.gold}
          strokeWidth="2.5"
        />

        <g stroke={PAGE_PALETTE.navy} strokeWidth="6" strokeLinejoin="round" fill="none">
          <polyline points="0,340 320,260 440,0" />
          <polyline points="440,0 740,185 960,0 1180,185 1480,0" />
          <polyline points="1480,0 1600,260 1920,340" />
          <polyline points="0,680 390,540 320,260" />
          <polyline points="1920,680 1530,540 1600,260" />
          <polyline points="0,1080 320,820 390,540" />
          <polyline points="1920,1080 1600,820 1530,540" />
          <polyline points="440,1080 740,895 960,1080 1180,895 1480,1080" />
          <line x1="320" y1="820" x2="740" y2="895" />
          <line x1="1600" y1="820" x2="1180" y2="895" />
          <line x1="320" y1="820" x2="440" y2="1080" />
          <line x1="1600" y1="820" x2="1480" y2="1080" />
          <line x1="320" y1="260" x2="740" y2="185" />
          <line x1="1600" y1="260" x2="1180" y2="185" />
          <polygon points="440,210 1480,210 1600,340 1600,740 1480,870 440,870 320,740 320,340" />
        </g>
      </svg>

      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children ?? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "140px 420px",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: PAGE_PALETTE.brickRed,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </div>
            <h2
              style={{
                margin: "16px 0 0 0",
                fontFamily: FONTS.serif,
                fontSize: "48px",
                lineHeight: 1.15,
                color: PAGE_PALETTE.navy,
              }}
            >
              {title ?? "Orthodoxy vs. Arithmetic"}
            </h2>
            {metric && (
              <div
                style={{
                  marginTop: "20px",
                  fontFamily: FONTS.mono,
                  fontSize: "52px",
                  fontWeight: 700,
                  color: PAGE_PALETTE.brickRed,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {metric}
              </div>
            )}
            {body && (
              <p
                style={{
                  margin: "16px 0 0 0",
                  fontFamily: FONTS.sans,
                  fontSize: "19px",
                  lineHeight: 1.5,
                  color: REGISTERS.page_editorial.ink.secondary,
                }}
              >
                {body}
              </p>
            )}
            {sourceCitation && (
              <div
                style={{
                  marginTop: "22px",
                  fontFamily: FONTS.mono,
                  fontSize: "12px",
                  color: REGISTERS.page_editorial.ink.muted,
                }}
              >
                § {sourceCitation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 6. DepressionLedger1930s (Cotton-Rag Double-Entry 1933 Accounting Book)
// ============================================================================
export interface LedgerLine1930 {
  account: string;
  debit: string;
  credit: string;
  isRedInk?: boolean;
}

export interface DepressionLedger1930sProps {
  title?: string;
  folioYear?: string;
  lines?: LedgerLine1930[];
  summaryCallout?: string;
  sourceCitation?: string;
  atFrame?: number;
}

export const DepressionLedger1930s: React.FC<DepressionLedger1930sProps> = ({
  title = "General Farm & Mortgage Ledger — Nominal Debt Lock",
  folioYear = "FOLIO 1933 · DEFLATION AUDIT",
  lines = [
    { account: "Wheat & Cotton Gross Receipts (Spot)", debit: "$412.00", credit: "—", isRedInk: true },
    { account: "1928 Fixed Mortgage Note (Contractual)", debit: "—", credit: "$1,450.00", isRedInk: true },
    { account: "County Property Tax Assessment", debit: "—", credit: "$184.50" },
    { account: "Net Household Solvency Balance", debit: "-$1,222.50", credit: "FORECLOSURE", isRedInk: true },
  ],
  summaryCallout = "Prices fell 48% while fixed debt principal fell 0%.",
  sourceCitation = "Irving Fisher, Debt-Deflation Theory of Great Depressions (1933)",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - atFrame);
  const enter = spring({ frame: elapsed, fps, config: CINEMA_SPRINGS.archivalSettle });
  const pal = REGISTERS.archival_parchment;

  return (
    <ReadingRoomStage
      register="archival_parchment"
      chapterTitle="ARCHIVAL DOUBLE-ENTRY LEDGER"
      folioLabel={folioYear}
      sourceCitation={sourceCitation}
      cameraMove="dolly-creep"
    >
      <div
        style={{
          position: "absolute",
          left: LAYOUT.safeMargin,
          right: LAYOUT.safeMargin,
          top: 124,
          bottom: 104,
          backgroundColor: pal.bg.elevated,
          border: `2px solid ${pal.rule.oxford}`,
          borderRadius: "10px",
          padding: "44px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: enter,
          boxShadow: "0 24px 52px rgba(24, 22, 20, 0.12)",
          userSelect: "none",
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `2px double ${pal.rule.oxford}`, paddingBottom: "16px" }}>
            <h2 style={{ margin: 0, fontFamily: FONTS.serif, fontSize: "38px", color: pal.ink.primary }}>
              {title}
            </h2>
            <span style={{ fontFamily: FONTS.mono, fontSize: "14px", fontWeight: 700, color: pal.accent.liability, ...TABULAR_NUM_STYLE }}>
              {folioYear}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 0.75fr 0.75fr",
              padding: "14px 12px",
              borderBottom: `1.5px solid ${pal.rule.oxford}`,
              fontFamily: FONTS.mono,
              fontSize: "12.5px",
              fontWeight: 700,
              letterSpacing: "0.09em",
              color: pal.ink.muted,
            }}
          >
            <span>LEDGER ACCOUNT</span>
            <span style={{ textAlign: "right" }}>RECEIPTS / DR.</span>
            <span style={{ textAlign: "right" }}>FIXED CLAIM / CR.</span>
          </div>

          {lines.map((ln, idx) => {
            const rowReveal = interpolate(elapsed, [4 + idx * 4, 14 + idx * 4], [0, 1], CLAMP);
            return (
              <div
                key={`dl-row-${idx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 0.75fr 0.75fr",
                  padding: "20px 12px",
                  borderBottom: `1px solid ${pal.rule.hairline}`,
                  backgroundColor: ln.isRedInk ? "rgba(140, 29, 24, 0.06)" : "transparent",
                  opacity: rowReveal,
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: FONTS.serif, fontSize: "23px", fontWeight: ln.isRedInk ? 700 : 500, color: pal.ink.primary }}>
                  {ln.account}
                </span>
                <span style={{ textAlign: "right", fontFamily: FONTS.mono, fontSize: "23px", fontWeight: 700, color: ln.isRedInk ? pal.accent.liability : pal.ink.primary, ...TABULAR_NUM_STYLE }}>
                  {ln.debit}
                </span>
                <span style={{ textAlign: "right", fontFamily: FONTS.mono, fontSize: "23px", fontWeight: 700, color: ln.isRedInk ? pal.accent.liability : pal.ink.secondary, ...TABULAR_NUM_STYLE }}>
                  {ln.credit}
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            backgroundColor: pal.bg.recessed,
            borderLeft: `4px solid ${pal.accent.liability}`,
            padding: "16px 24px",
            fontFamily: FONTS.sans,
            fontSize: "19px",
            fontWeight: 600,
            color: pal.ink.primary,
          }}
        >
          {summaryCallout}
        </div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// 7. CompanyScripVoucher (1912 Non-Transferable Company Commissary Scrip)
// ============================================================================
export interface CompanyScripVoucherProps {
  issuerName?: string;
  denomination?: string;
  serialNumber?: string;
  restrictionClause?: string;
  deductionSummary?: string;
  sourceCitation?: string;
  atFrame?: number;
}

export const CompanyScripVoucher: React.FC<CompanyScripVoucherProps> = ({
  issuerName = "ISLAND CREEK COAL & COMMISSARY CO.",
  denomination = "$5.00 SCRIP",
  serialNumber = "NO. 004819-B",
  restrictionClause = "PAYABLE IN MERCHANDISE ONLY AT COMPANY STORE · NON-TRANSFERABLE",
  deductionSummary = "Rent, lamp oil, powder & doctor fees deducted prior to payout.",
  sourceCitation = "U.S. Immigration & Coal Commission Scrip Inquiry (1912)",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: Math.max(0, frame - atFrame), fps, config: CINEMA_SPRINGS.editorialSnap });
  const pal = REGISTERS.archival_parchment;

  return (
    <ReadingRoomStage
      register="archival_parchment"
      chapterTitle="CLOSED-LOOP SCRIP ARTIFACT"
      folioLabel={serialNumber}
      sourceCitation={sourceCitation}
      cameraMove="dolly-creep"
    >
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top: 190,
          bottom: 180,
          backgroundColor: pal.bg.recessed,
          border: `3px solid ${pal.rule.oxford}`,
          boxShadow: `inset 0 0 0 8px ${pal.bg.elevated}, inset 0 0 0 10px ${pal.accent.capital}, 0 26px 56px rgba(24, 22, 20, 0.16)`,
          borderRadius: "12px",
          padding: "52px 68px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: enter,
          transform: `scale(${(0.95 + 0.05 * enter).toFixed(4)})`,
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: "14px", fontWeight: 700, color: pal.accent.liability, letterSpacing: "0.12em", ...TABULAR_NUM_STYLE }}>
            {serialNumber}
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: pal.accent.capital, letterSpacing: "0.14em" }}>
            CLOSED-LOOP CREDIT VOUCHER
          </span>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FONTS.serif, fontSize: "34px", fontWeight: 700, letterSpacing: "0.06em", color: pal.ink.primary }}>
            {issuerName}
          </div>
          <div style={{ fontFamily: FONTS.condensed, fontSize: "92px", fontWeight: 700, color: pal.accent.capital, marginTop: "10px", lineHeight: 1, ...TABULAR_NUM_STYLE }}>
            {denomination}
          </div>
          <div
            style={{
              marginTop: "20px",
              display: "inline-block",
              padding: "8px 20px",
              border: `1.5px solid ${pal.accent.liability}`,
              color: pal.accent.liability,
              fontFamily: FONTS.mono,
              fontSize: "13.5px",
              fontWeight: 700,
              letterSpacing: "0.09em",
            }}
          >
            {restrictionClause}
          </div>
        </div>

        <div style={{ textAlign: "center", fontFamily: FONTS.sans, fontSize: "18px", color: pal.ink.secondary }}>
          {deductionSummary}
        </div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// 8. BrettonWoodsCable (Stepped Diplomatic / Treasury Teletype Cable)
// ============================================================================
export interface BrettonWoodsCableProps {
  origin?: string;
  destination?: string;
  cableDate?: string;
  subject?: string;
  messageLines?: string[];
  parityFigure?: string;
  sourceCitation?: string;
  atFrame?: number;
}

export const BrettonWoodsCable: React.FC<BrettonWoodsCableProps> = ({
  origin = "DEPT. OF THE TREASURY · WASHINGTON",
  destination = "CENTRAL BANK DESKS · GENEVA / LONDON",
  cableDate = "15 AUG 1971 · 20:15 EST",
  subject = "SUSPENSION OF DOLLAR GOLD CONVERTIBILITY WINDOW",
  messageLines = [
    "STOP. CONVERTIBILITY AT $35.00 PER FINE TROY OUNCE SUSPENDED IMMEDIATELY.",
    "STOP. FOREIGN OFFICIAL RESERVES REDIRECTED TO TREASURY BILL ROLLOVER.",
    "STOP. DOMESTIC PURCHASING POWER DECOUPLED FROM BULLION ANCHOR.",
  ],
  parityFigure = "$35.00 / OZ WINDOW CLOSED",
  sourceCitation = "FRUS Monetary Archive · Camp David Communiqué",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - atFrame);
  const pal = REGISTERS.archival_parchment;

  const fullBody = messageLines.join("\n");
  const typedChars = Math.floor(interpolate(elapsed, [4, 54], [0, fullBody.length], CLAMP));
  const visibleText = fullBody.slice(0, typedChars);

  return (
    <ReadingRoomStage
      register="archival_parchment"
      chapterTitle="DIPLOMATIC TELETYPE DISPATCH"
      folioLabel={cableDate}
      sourceCitation={sourceCitation}
      cameraMove="static"
    >
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 136,
          bottom: 118,
          backgroundColor: pal.bg.elevated,
          border: `2px solid ${pal.rule.oxford}`,
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", borderBottom: `2px solid ${pal.rule.oxford}`, paddingBottom: "18px", fontFamily: FONTS.mono, fontSize: "13px", color: pal.ink.secondary, ...TABULAR_NUM_STYLE }}>
            <div>FROM: {origin}</div>
            <div style={{ textAlign: "right" }}>DATE: {cableDate}</div>
            <div>TO: {destination}</div>
            <div style={{ textAlign: "right", color: pal.accent.liability, fontWeight: 700 }}>PRIORITY: FLASH URGENT</div>
          </div>

          <div style={{ marginTop: "24px", fontFamily: FONTS.mono, fontSize: "22px", fontWeight: 700, color: pal.ink.primary, letterSpacing: "0.04em" }}>
            RE: {subject}
          </div>

          <pre
            style={{
              margin: "28px 0 0 0",
              whiteSpace: "pre-wrap",
              fontFamily: FONTS.mono,
              fontSize: "21px",
              lineHeight: 1.75,
              color: pal.ink.primary,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {visibleText}
          </pre>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${pal.rule.hairline}`, paddingTop: "18px" }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: "12px", color: pal.ink.muted }}>
            WESTERN UNION / TREASURY CIPHER VERIFIED
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: "22px", fontWeight: 700, color: pal.accent.liability, border: `2px solid ${pal.accent.liability}`, padding: "6px 16px", ...TABULAR_NUM_STYLE }}>
            {parityFigure}
          </span>
        </div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// 9. BroadsheetFrontpage (Multi-Column Archival Broadsheet Press Edition)
// ============================================================================
export interface BroadsheetFrontpageProps {
  masthead?: string;
  editionDate?: string;
  bannerHeadline?: string;
  deckSubhead?: string;
  leadBody?: string;
  sideMetricLabel?: string;
  sideMetricValue?: string;
  sourceCitation?: string;
  atFrame?: number;
}

export const BroadsheetFrontpage: React.FC<BroadsheetFrontpageProps> = ({
  masthead = "THE FINANCIAL CHRONICLE",
  editionDate = "VOL. CXIV · SPECIAL FISCAL EDITION",
  bannerHeadline = "Sovereign Interest Surpasses Defense Outlays Across G7 Ledgers",
  deckSubhead = "Mandatory debt service locks statutory budgets prior to discretionary votes.",
  leadBody = "Primary treasury statements confirm net interest settlements have crossed historical parity with national defense appropriations, compressing fiscal headroom across every domestic agency.",
  sideMetricLabel = "NET INTEREST SHARE",
  sideMetricValue = "18.4%",
  sourceCitation = "Archival Press & Treasury Monthly Statement",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: Math.max(0, frame - atFrame), fps, config: CINEMA_SPRINGS.archivalSettle });
  const pal = REGISTERS.archival_parchment;

  return (
    <ReadingRoomStage
      register="archival_parchment"
      showChrome={false}
      cameraMove="dolly-creep"
    >
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 64,
          bottom: 64,
          backgroundColor: pal.bg.elevated,
          border: `2px solid ${pal.rule.oxford}`,
          padding: "36px 52px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: enter,
          userSelect: "none",
        }}
      >
        <div>
          <div style={{ textAlign: "center", borderBottom: `3px double ${pal.rule.oxford}`, paddingBottom: "14px" }}>
            <div style={{ fontFamily: FONTS.serif, fontSize: "44px", fontWeight: 700, letterSpacing: "0.08em", color: pal.ink.primary }}>
              {masthead}
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "12px", letterSpacing: "0.14em", color: pal.ink.muted, marginTop: "6px", ...TABULAR_NUM_STYLE }}>
              {editionDate}
            </div>
          </div>

          <h1 style={{ margin: "26px 0 12px 0", fontFamily: FONTS.serif, fontSize: "52px", lineHeight: 1.08, color: pal.ink.primary }}>
            {bannerHeadline}
          </h1>
          <div style={{ fontFamily: FONTS.serif, fontStyle: "italic", fontSize: "23px", color: pal.ink.secondary, paddingBottom: "22px", borderBottom: `1px solid ${pal.rule.oxford}` }}>
            {deckSubhead}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.45fr 0.55fr", gap: "36px", marginTop: "28px", alignItems: "stretch" }}>
            <div style={{ fontFamily: FONTS.sans, fontSize: "21px", lineHeight: 1.6, color: pal.ink.primary, paddingRight: "24px", borderRight: `1px solid ${pal.rule.hairline}` }}>
              {leadBody}
            </div>
            <div style={{ backgroundColor: pal.bg.recessed, border: `1.5px solid ${pal.rule.oxford}`, padding: "28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: pal.accent.liability, letterSpacing: "0.1em" }}>
                {sideMetricLabel}
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "64px", fontWeight: 700, color: pal.ink.primary, marginTop: "10px", ...TABULAR_NUM_STYLE }}>
                {sideMetricValue}
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", color: pal.ink.muted, borderTop: `1px solid ${pal.rule.hairline}`, paddingTop: "12px" }}>
          § {sourceCitation}
        </div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// 10. MicroficheReaderStage (Backlit Cyanotype Archival Microfilm Platen)
// ============================================================================
export interface MicroficheReaderStageProps {
  rollIndex?: string;
  documentTitle?: string;
  keyExcerpt?: string;
  keyFigure?: string;
  coordinates?: string;
  sourceCitation?: string;
  atFrame?: number;
}

export const MicroficheReaderStage: React.FC<MicroficheReaderStageProps> = ({
  rollIndex = "MICROFILM REEL 88-C · FRAME 0412",
  documentTitle = "Archived Federal Reserve Open Market Committee Transcript",
  keyExcerpt = "When debt service compounds faster than real output growth, liquidity injections preserve nominal par at the cost of household purchasing power.",
  keyFigure = "2.0% FLOOR VS. REAL WAGE DRIFT",
  coordinates = "X: +142.4mm · Y: -038.0mm",
  sourceCitation = "National Archives Microfiche Vault",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: Math.max(0, frame - atFrame), fps, config: CINEMA_SPRINGS.editorialSnap });
  const pal = REGISTERS.drafting_blueprint;

  return (
    <ReadingRoomStage
      register="drafting_blueprint"
      chapterTitle={rollIndex}
      folioLabel={coordinates}
      sourceCitation={sourceCitation}
      cameraMove="dolly-creep"
    >
      <div
        style={{
          position: "absolute",
          left: 132,
          right: 132,
          top: 132,
          bottom: 112,
          backgroundColor: pal.bg.elevated,
          border: `2px solid ${pal.accent.solvent}`,
          borderRadius: "14px",
          padding: "52px 64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "inset 0 0 44px rgba(10, 23, 38, 0.72)",
          opacity: enter,
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: "12.5px", color: pal.accent.solvent, ...TABULAR_NUM_STYLE }}>
          <span>OPTICAL MAGNIFICATION · 24X PLATEN</span>
          <span>{coordinates}</span>
        </div>

        <div>
          <h2 style={{ margin: 0, fontFamily: FONTS.serif, fontSize: "44px", color: pal.ink.primary, lineHeight: 1.15 }}>
            {documentTitle}
          </h2>
          <p style={{ margin: "24px 0 0 0", fontFamily: FONTS.mono, fontSize: "21px", lineHeight: 1.6, color: pal.ink.secondary, borderLeft: `3px solid ${pal.accent.capital}`, paddingLeft: "24px" }}>
            {keyExcerpt}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${pal.rule.oxford}`, paddingTop: "18px" }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: "13px", color: pal.ink.muted }}>
            CYANOTYPE ARCHIVAL SCAN · VERIFIED
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: "22px", fontWeight: 700, color: pal.accent.capital, ...TABULAR_NUM_STYLE }}>
            {keyFigure}
          </span>
        </div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// VINTAGE_EDITORIAL_STYLES Registry (10 Archival & Historical Style Recipes)
// ============================================================================
export interface VintageEditorialStyleRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
}

export const VINTAGE_EDITORIAL_STYLES: readonly VintageEditorialStyleRecipe[] = [
  {
    id: "vintage-newsreel",
    name: "1920s 1.37:1 Silver-Nitrate Newsreel Gate",
    componentName: "Newsreel1920s",
    defaultFraming: "fullscreen-cutaway",
    description: "Academy-ratio 35mm gate with deterministic weave, scratches, and place-date slate on #0D0C0B nitrate.",
  },
  {
    id: "vintage-silent-film",
    name: "Art-Deco Filigree Silent Film Intertitle",
    componentName: "SilentFilmCard",
    defaultFraming: "fullscreen-cutaway",
    description: "Ornate SVG corner filigree intertitle card with serif dialogue and subtle optical push.",
  },
  {
    id: "vintage-collage",
    name: "12fps Stop-Motion Archival Press Cutout",
    componentName: "CollageCutout",
    defaultFraming: "over-footage",
    description: "Quantized 12fps paper clipping with translucent masking tape and optional full-page exhibit stage.",
  },
  {
    id: "vintage-spy-titles",
    name: "Classified Deep-Navy Chapter Cover Dossier",
    componentName: "SpyTitleSequence",
    defaultFraming: "fullscreen-cutaway",
    description: "Sliding deep-navy redaction bar reveal with folio clearance header and subject metric.",
  },
  {
    id: "vintage-stained-glass",
    name: "Geometric Lead-Came Sanctuary Mosaic",
    componentName: "StainedGlassFrame",
    defaultFraming: "fullscreen-cutaway",
    description: "Milk-paper, soft slate-blue, and blush geometric stained-glass frame with lead-came structural lines.",
  },
  {
    id: "vintage-1930s-depression-ledger",
    name: "1933 Double-Entry Cotton-Rag Deflation Ledger",
    componentName: "DepressionLedger1930s",
    defaultFraming: "fullscreen-cutaway",
    description: "Irving Fisher 1933 double-entry farm & mortgage ledger showing falling receipts against fixed nominal debt.",
  },
  {
    id: "vintage-company-scrip-voucher",
    name: "1912 Closed-Loop Company Store Scrip Voucher",
    componentName: "CompanyScripVoucher",
    defaultFraming: "fullscreen-cutaway",
    description: "Engraved non-transferable coal commissary voucher illustrating closed-loop purchasing restrictions.",
  },
  {
    id: "vintage-bretton-woods-cable",
    name: "1944/1971 Treasury Teletype Diplomatic Cable",
    componentName: "BrettonWoodsCable",
    defaultFraming: "fullscreen-cutaway",
    description: "Character-stepped monospace Treasury cable dispatch with gold-window parity stamp.",
  },
  {
    id: "vintage-broadsheet-frontpage",
    name: "Archival Multi-Column Broadsheet Front Page",
    componentName: "BroadsheetFrontpage",
    defaultFraming: "fullscreen-cutaway",
    description: "Double-ruled broadsheet masthead, serif banner headline, lead dispatch column, and key figure box.",
  },
  {
    id: "vintage-microfiche-reader",
    name: "Backlit Cyanotype Microfiche Platen Reader",
    componentName: "MicroficheReaderStage",
    defaultFraming: "fullscreen-cutaway",
    description: "24x optical microfiche scan on Prussian cyanotype substrate with X-Y coordinate readout.",
  },
] as const;
