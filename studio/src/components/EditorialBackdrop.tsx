import React, { useId } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import {
  COLORS,
  LAYOUT,
  RegisterId,
  RegisterPalette,
  REGISTERS,
  resolveRegisterPalette,
} from "../design/tokens";

export interface EditorialBackdropProps {
  driftSpeed?: number;
  showGrid?: boolean;
  tone?: "light" | "dark";
  register?: RegisterId | RegisterPalette;
  folioLabel?: string;
  chapterTitle?: string;
  sourceCitation?: string;
  showGrain?: boolean;
}

export const EditorialBackdrop: React.FC<EditorialBackdropProps> = ({
  driftSpeed = 0.15,
  showGrid = true,
  tone = "light",
  register,
  folioLabel,
  chapterTitle,
  sourceCitation,
  showGrain = true,
}) => {
  const frame = useCurrentFrame();
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "_");
  const filterId = `editorial-noise-${reactId}`;

  // Subtle continuous slow camera drift on the desk surface
  const driftY = (frame * driftSpeed) % 80;
  const driftX = (frame * (driftSpeed * 0.4)) % 80;

  const palette: RegisterPalette | null = register
    ? resolveRegisterPalette(register)
    : null;

  const isLight = palette ? !palette.isDark : tone === "light";
  const bg = palette
    ? palette.bg.canvas
    : isLight
    ? COLORS.paperLight
    : COLORS.navyDeep;
  const gridColor = palette
    ? palette.rule.hairline
    : isLight
    ? COLORS.gridLine
    : COLORS.gridLineDark;

  const vignette = palette
    ? `radial-gradient(ellipse 84% 78% at 50% 46%, transparent 46%, ${palette.vignetteRgba} 100%)`
    : isLight
    ? "radial-gradient(ellipse 92% 84% at 50% 45%, rgba(250, 248, 243, 0.25) 0%, rgba(242, 240, 234, 0.88) 100%)"
    : "radial-gradient(ellipse 90% 80% at 50% 45%, rgba(28, 43, 58, 0.38) 0%, rgba(15, 25, 35, 0.96) 100%)";

  // Stepped 2-frame 16mm grain seed for broadcast encoder preservation
  const grainSeed = (Math.floor(frame / 2) * 37) % 997;
  const grainOpacity = palette ? palette.grainOpacity : isLight ? 0.026 : 0.032;

  const headerInk = palette
    ? palette.ink.secondary
    : isLight
    ? COLORS.paperMuted
    : COLORS.goldWarm;
  const ruleInk = palette
    ? palette.rule.hairline
    : isLight
    ? COLORS.paperBorder
    : COLORS.gridLineDark;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        overflow: "hidden",
      }}
    >
      {/* 1. Subtle editorial reading-room / register coordinate grid */}
      {showGrid && (
        <div
          style={{
            position: "absolute",
            inset: "-80px",
            backgroundImage:
              palette?.id === "archival_parchment"
                ? `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`
                : `
              linear-gradient(to right, ${gridColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
            `,
            backgroundSize:
              palette?.id === "archival_parchment"
                ? "100% 48px"
                : palette?.id === "midnight_telemetry" ||
                  palette?.id === "drafting_blueprint"
                ? "120px 120px"
                : "80px 80px",
            transform: `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(
              2
            )}px, 0)`,
            opacity: palette ? (isLight ? 0.42 : 0.58) : isLight ? 0.9 : 0.85,
            pointerEvents: "none",
          }}
        />
      )}

      {/* 2. Optional shared spatial skeleton masthead & source baseline */}
      {(chapterTitle || folioLabel) && (
        <div
          style={{
            position: "absolute",
            left: LAYOUT.safeMargin,
            right: LAYOUT.safeMargin,
            top: LAYOUT.mastheadY,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                color: headerInk,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {chapterTitle ? `[ ${chapterTitle} ]` : ""}
            </span>
            {folioLabel && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: headerInk,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {folioLabel}
              </span>
            )}
          </div>
          <div
            style={{
              marginTop: "15px",
              width: "100%",
              height: "1px",
              backgroundColor: ruleInk,
            }}
          />
        </div>
      )}

      {sourceCitation && (
        <div
          style={{
            position: "absolute",
            left: LAYOUT.safeMargin,
            top: LAYOUT.citationBaselineY - 14,
            fontFamily: FONTS.sans,
            fontSize: "13.5px",
            color: headerInk,
            pointerEvents: "none",
            ...TABULAR_NUM_STYLE,
          }}
        >
          <span style={{ fontFamily: FONTS.mono, marginRight: "6px" }}>§</span>
          {sourceCitation}
        </div>
      )}

      {/* 3. Soft radial warmth / cos^4 optical vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: vignette,
          pointerEvents: "none",
        }}
      />

      {/* 4. Stepped 2-frame 16mm anti-banding paper grain texture filter */}
      {showGrain && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: grainOpacity,
            pointerEvents: "none",
            mixBlendMode: isLight ? "multiply" : "overlay",
          }}
        >
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.78"
              numOctaves={2}
              seed={grainSeed}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter={`url(#${filterId})`}
          />
        </svg>
      )}
    </AbsoluteFill>
  );
};

export { REGISTERS };
