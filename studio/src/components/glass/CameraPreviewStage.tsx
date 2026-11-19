import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { COLORS } from "../../design/tokens";

export type PreviewMode =
  | "light-editorial"
  | "simulated-room"
  | "camera-video"
  | "dark-desk"
  | "transparent";

export interface CameraPreviewStageProps {
  previewMode?: PreviewMode;
  cameraSrc?: string;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * CameraPreviewStage provides multi-mode backdrops for previewing overlays.
 * - 'transparent': Zero background; pure alpha for DaVinci Resolve ProRes 4444 / WebM renders.
 * - 'simulated-room': Photorealistic creator studio lighting with architectural bookshelves, warm key/cool fill & mullions for testing optical glass refraction.
 * - 'camera-video': Live creator video feed via cameraSrc, with presenter framing fallback.
 * - 'dark-desk': High-contrast investigative coordinate desk.
 */
export const CameraPreviewStage: React.FC<CameraPreviewStageProps> = ({
  previewMode = "simulated-room",
  cameraSrc,
  children,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { width = 1920, height = 1080 } = useVideoConfig();

  // Subtle natural camera breathing drift
  const driftX = Math.sin(frame * 0.02) * 12;
  const driftY = Math.cos(frame * 0.015) * 8;

  if (previewMode === "transparent") {
    return (
      <AbsoluteFill
        className={className}
        style={{
          width,
          height,
          backgroundColor: "transparent",
          ...style,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      className={className}
      style={{
        width,
        height,
        backgroundColor:
          previewMode === "light-editorial" ? COLORS.paperLight : COLORS.navyDeep,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* 1. Backdrop Layer */}
      {previewMode === "light-editorial" && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {/* Subtle Page Milk-Canvas Coordinate Grid */}
          <div
            style={{
              position: "absolute",
              inset: "-80px",
              backgroundImage: `
                linear-gradient(to right, ${COLORS.gridLine} 1px, transparent 1px),
                linear-gradient(to bottom, ${COLORS.gridLine} 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
              transform: `translate3d(${driftX * 0.4}px, ${driftY * 0.4}px, 0)`,
              opacity: 0.9,
            }}
          />
          {/* Soft Milk Canvas Depth (#FAF8F3 -> #F2F0EA) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 92% 84% at 50% 45%, rgba(250, 248, 243, 0.25) 0%, rgba(242, 240, 234, 0.88) 100%)",
            }}
          />
        </AbsoluteFill>
      )}

      {previewMode === "dark-desk" && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {/* Subtle coordinate grid on deep navy */}
          <div
            style={{
              position: "absolute",
              inset: "-80px",
              backgroundImage: `
                linear-gradient(to right, ${COLORS.gridLineDark} 1px, transparent 1px),
                linear-gradient(to bottom, ${COLORS.gridLineDark} 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
              transform: `translate3d(${driftX * 0.5}px, ${driftY * 0.5}px, 0)`,
              opacity: 0.85,
            }}
          />
          {/* Navy Vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 90% 80% at 50% 45%, rgba(28, 43, 58, 0.38) 0%, rgba(15, 25, 35, 0.96) 100%)",
            }}
          />
        </AbsoluteFill>
      )}

      {previewMode === "simulated-room" && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {/* Room Base: Deep Reading Room nocturne slate (zero pure #000000) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(142deg, #0C131C 0%, #152130 48%, #0B111A 100%)",
            }}
          />

          {/* Subtle Receding 1px Architectural Perspective & Coordinate Grid */}
          <div
            style={{
              position: "absolute",
              inset: "-80px",
              backgroundImage: `
                linear-gradient(to right, rgba(191, 214, 234, 0.055) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(191, 214, 234, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "96px 96px",
              transform: `translate3d(${(driftX * 0.35).toFixed(2)}px, ${(
                driftY * 0.35
              ).toFixed(2)}px, 0)`,
            }}
          />

          {/* Subtle Diagonal Architectural Window-Light Beams (Crisp Refraction Signal) */}
          <div
            style={{
              position: "absolute",
              inset: "-120px",
              backgroundImage:
                "repeating-linear-gradient(122deg, rgba(191, 214, 234, 0.025) 0px, rgba(191, 214, 234, 0.025) 38px, transparent 38px, transparent 116px)",
              transform: `translate3d(${(driftX * 0.25).toFixed(2)}px, 0, 0)`,
            }}
          />

          {/* Reading Room Bookshelf Bays & Warm Brass-Lit Architectural Paneling (Left) */}
          <div
            style={{
              position: "absolute",
              left: "4%",
              top: "8%",
              width: "44%",
              height: "78%",
              transform: `translate3d(${(driftX * 0.45).toFixed(2)}px, ${(
                driftY * 0.3
              ).toFixed(2)}px, 0)`,
              filter: "blur(1.5px)",
              opacity: 0.92,
            }}
          >
            {/* Vertical Dark Walnut / Slate Architectural Uprights */}
            {[0, 1, 2, 3, 4].map((colIdx) => (
              <div
                key={`upright-${colIdx}`}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${colIdx * 23}%`,
                  width: "12px",
                  background:
                    "linear-gradient(90deg, rgba(14, 21, 30, 0.92) 0%, rgba(30, 44, 60, 0.78) 65%, rgba(250, 236, 212, 0.14) 100%)",
                  borderRight: "1px solid rgba(250, 236, 212, 0.10)",
                }}
              />
            ))}

            {/* Horizontal Brass-Lit Shelf Bays */}
            {[16, 38, 60, 82].map((topPct, shelfIdx) => (
              <div
                key={`shelf-${shelfIdx}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: "8%",
                  top: `${topPct}%`,
                  height: "14px",
                  background:
                    "linear-gradient(180deg, rgba(250, 236, 212, 0.26) 0%, rgba(212, 168, 102, 0.16) 24%, rgba(16, 24, 34, 0.92) 100%)",
                  boxShadow: "0 4px 16px rgba(250, 236, 212, 0.12)",
                }}
              />
            ))}

            {/* Fluted Acoustic Wainscot Vertical Ribbing */}
            <div
              style={{
                position: "absolute",
                inset: "0 8% 0 0",
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(250, 236, 212, 0.03) 0px, rgba(250, 236, 212, 0.03) 2px, transparent 2px, transparent 22px)",
              }}
            />
          </div>

          {/* Cool Architectural Window Mullions & Daylight Sheen (Right Third Behind Glass) */}
          <div
            style={{
              position: "absolute",
              right: "4%",
              top: "7%",
              width: "36%",
              height: "76%",
              transform: `translate3d(${(-driftX * 0.4).toFixed(2)}px, ${(
                driftY * 0.25
              ).toFixed(2)}px, 0)`,
              border: "1px solid rgba(191, 214, 234, 0.16)",
              borderRadius: "6px",
              background:
                "linear-gradient(155deg, rgba(79, 179, 174, 0.12) 0%, rgba(62, 106, 148, 0.08) 48%, rgba(15, 25, 35, 0.25) 100%)",
              filter: "blur(1px)",
            }}
          >
            {/* Window Mullion Crossbars — give backdrop-filter luminous crisp bands to refract */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "2px",
                background:
                  "linear-gradient(180deg, rgba(191, 214, 234, 0.26) 0%, rgba(79, 179, 174, 0.18) 100%)",
              }}
            />
            {[28, 56, 80].map((pct) => (
              <div
                key={`mullion-${pct}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${pct}%`,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, rgba(191, 214, 234, 0.14) 0%, rgba(250, 248, 243, 0.24) 55%, rgba(79, 179, 174, 0.16) 100%)",
                }}
              />
            ))}
          </div>

          {/* Warm Tungsten Practical Desk Lamp Rim (Left Key Accent) */}
          <div
            style={{
              position: "absolute",
              top: "-8%",
              left: "-6%",
              width: "50%",
              height: "78%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(250, 236, 212, 0.16) 0%, rgba(217, 152, 68, 0.07) 44%, transparent 72%)",
              transform: `translate3d(${(driftX * 0.65).toFixed(2)}px, ${(
                driftY * 0.65
              ).toFixed(2)}px, 0)`,
            }}
          />

          {/* Cool Practical Backlight Gradient (Right: crisp cyan/slate fill) */}
          <div
            style={{
              position: "absolute",
              bottom: "-6%",
              right: "-4%",
              width: "48%",
              height: "74%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(79, 179, 174, 0.14) 0%, rgba(62, 106, 148, 0.07) 48%, transparent 74%)",
              transform: `translate3d(${(-driftX * 0.5).toFixed(2)}px, ${(
                -driftY * 0.5
              ).toFixed(2)}px, 0)`,
            }}
          />

          {/* Studio Desk Horizon Line & Subtle Brass Edge Glint */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "148px",
              background:
                "linear-gradient(180deg, rgba(22, 34, 48, 0.72) 0%, rgba(12, 19, 28, 0.94) 100%)",
              borderTop: "1px solid rgba(250, 236, 212, 0.20)",
            }}
          />

          {/* Soft-Focus Atmospheric Presenter Shoulder Framing (Left Third, Clean Depth) */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "11%",
              width: "460px",
              height: "680px",
              background:
                "linear-gradient(160deg, rgba(26, 38, 52, 0.72) 0%, rgba(14, 21, 30, 0.88) 65%, rgba(11, 17, 25, 0.94) 100%)",
              borderRadius: "230px 230px 0 0",
              borderTop: "1.5px solid rgba(250, 236, 212, 0.18)",
              borderRight: "1px solid rgba(79, 179, 174, 0.16)",
              filter: "blur(8px)",
              opacity: 0.78,
            }}
          />

          {/* Refined Studio Vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 96% 88% at 50% 48%, transparent 46%, rgba(8, 13, 20, 0.72) 100%)",
            }}
          />
        </AbsoluteFill>
      )}

      {previewMode === "camera-video" && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {cameraSrc ? (
            <Video
              src={cameraSrc}
              objectFit="cover"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          ) : (
            // Creator Framing Guide Backdrop when no video provided
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #111317 0%, #1a1e24 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "15%",
                  bottom: "0",
                  width: "580px",
                  height: "820px",
                  borderRadius: "290px 290px 0 0",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px dashed rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255, 255, 255, 0.35)",
                  fontFamily: "sans-serif",
                  fontSize: "14px",
                  letterSpacing: "0.08em",
                }}
              >
                <span>[CREATOR TALKING HEAD REGION]</span>
                <span style={{ fontSize: "12px", marginTop: "8px" }}>
                  Card overlays anchor to the right
                </span>
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* 2. Micro Dither Noise (Prevents gradient banding during compression) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.03,
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      >
        <filter id="preview-stage-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#preview-stage-noise)" />
      </svg>

      {/* 3. Children (Liquid Glass Objects / Overlay Layers) */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
