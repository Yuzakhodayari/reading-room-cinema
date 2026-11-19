import React, { useId } from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fitAndBalanceText } from "../../design/fitText";
import { FONTS, TABULAR_NUM_STYLE } from "../../design/fonts";
import {
  CINEMA_SPRINGS,
  LAYOUT,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
} from "../../design/tokens";

export type DepthSandwichPreset =
  | "behind-shoulder-billboard"
  | "dual-shoulder-wings"
  | "halo-arc-gauge"
  | "pass-through-conveyor"
  | "over-shoulder-dossier-stack"
  | "subsea-horizon-split"
  | "colossus-prop-backdrop"
  | "spotlight-dim-sandwich";

export type PresenterDepthMode =
  | "simulated-depth"
  | "masked-video"
  | "behind-only-alpha"
  | "front-only-alpha";

export interface BoundingBox2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PresenterRigBounds {
  headBox: BoundingBox2D;
  torsoBox: BoundingBox2D;
  leftShoulderAnchor: [number, number];
  rightShoulderAnchor: [number, number];
}

export const DEFAULT_PRESENTER_RIG_BOUNDS: PresenterRigBounds = {
  headBox: { x: 326, y: 178, width: 208, height: 254 },
  torsoBox: { x: 168, y: 426, width: 524, height: 654 },
  leftShoulderAnchor: [212, 464],
  rightShoulderAnchor: [648, 464],
};

export interface HeroBackdropFigureSpec {
  figure: string;
  eyebrow?: string;
  sublabel?: string;
  tone?: "cream" | "teal" | "liability";
}

export interface PresenterDepthStageProps {
  /** Render mode: live alpha-masked video, crisp standalone simulated depth, or DaVinci alpha stem */
  mode?: PresenterDepthMode;
  preset?: DepthSandwichPreset;
  /** Full-frame A-roll video source (Plane 0 background + Plane 2 subject when paired with personMaskSrc) */
  cameraSrc?: string;
  /** Optional pre-keyed ProRes 4444 / WebM VP9 alpha presenter video for Plane 2 */
  presenterAlphaSrc?: string;
  /** Optional grayscale/luminance person segmentation mask video (aroll_person_mask.mp4) */
  personMaskSrc?: string;
  /** Optional custom Plane 0 background override */
  backgroundPlate?: React.ReactNode;
  /** Plane 1: Midground graphics occluded by the presenter's head & shoulders (giant numbers, walls, maps) */
  behindPresenter?: React.ReactNode;
  /** Optional declarative giant monolithic figure rendered automatically in Plane 1 behind presenter */
  heroBackdropFigure?: HeroBackdropFigureSpec;
  /** Plane 3: Foreground smoked-navy liquid glass overlays floating in front of presenter */
  foregroundGlass?: React.ReactNode;
  /** Additional Plane 3 foreground children */
  children?: React.ReactNode;
  /** Presenter silhouette / matte anchor bounds (defaults to left-center Reading Room framing) */
  rigBounds?: PresenterRigBounds;
  /** Extra room-dimming factor [0..0.75] behind presenter while keeping presenter 100% lit */
  backgroundDimOpacity?: number;
  showSimulatedRimGuides?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Sharp editorial studio presenter silhouette for standalone/exam renders:
 * sculpted head/hairline/jaw contour, tailored notched suit lapels, crisp shirt collar V,
 * tie knot/blade contour, studio shoulder shading, and warm-tungsten / cool-cyan rim lighting.
 */
const SimulatedPresenterCutout: React.FC<{
  bounds: PresenterRigBounds;
  breathY: number;
  showRimGuides: boolean;
}> = ({ bounds, breathY, showRimGuides }) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cx = bounds.headBox.x + bounds.headBox.width * 0.5;
  const headTop = bounds.headBox.y;
  const headW = bounds.headBox.width;
  const headH = bounds.headBox.height;

  const shoulderY = bounds.torsoBox.y + 38;
  const leftX = bounds.torsoBox.x;
  const rightX = bounds.torsoBox.x + bounds.torsoBox.width;
  const [lShX, lShY] = bounds.leftShoulderAnchor;
  const [rShX, rShY] = bounds.rightShoulderAnchor;

  const neckW = headW * 0.17;
  const collarW = headW * 0.245;
  const collarTopY = headTop + headH * 0.89;
  const sternumY = shoulderY + 236;

  // Tailored torso & suit jacket outer contour
  const torsoPath = [
    `M ${(cx - neckW).toFixed(1)} ${(headTop + headH * 0.78).toFixed(1)}`,
    `L ${(cx - collarW).toFixed(1)} ${(collarTopY + 8).toFixed(1)}`,
    `C ${(cx - collarW - 58).toFixed(1)} ${(shoulderY - 12).toFixed(1)}, ${(
      lShX + 26
    ).toFixed(1)} ${(lShY - 18).toFixed(1)}, ${lShX.toFixed(1)} ${(lShY + 12).toFixed(1)}`,
    `C ${(leftX + 18).toFixed(1)} ${(lShY + 48).toFixed(1)}, ${(leftX + 4).toFixed(
      1
    )} ${(lShY + 132).toFixed(1)}, ${(leftX - 8).toFixed(1)} ${(lShY + 240).toFixed(
      1
    )}`,
    `L ${(leftX - 24).toFixed(1)} 1094`,
    `L ${(rightX + 24).toFixed(1)} 1094`,
    `L ${(rightX + 8).toFixed(1)} ${(rShY + 240).toFixed(1)}`,
    `C ${(rightX - 4).toFixed(1)} ${(rShY + 132).toFixed(1)}, ${(rightX - 18).toFixed(
      1
    )} ${(rShY + 48).toFixed(1)}, ${rShX.toFixed(1)} ${(rShY + 12).toFixed(1)}`,
    `C ${(rShX - 26).toFixed(1)} ${(rShY - 18).toFixed(1)}, ${(
      cx +
      collarW +
      58
    ).toFixed(1)} ${(shoulderY - 12).toFixed(1)}, ${(cx + collarW).toFixed(1)} ${(
      collarTopY + 8
    ).toFixed(1)}`,
    `L ${(cx + neckW).toFixed(1)} ${(headTop + headH * 0.78).toFixed(1)}`,
    "Z",
  ].join(" ");

  // Sculpted editorial head + tailored hair crown/part + cheekbone + tapered jawline + ear hints
  const headPath = [
    // Chin apex
    `M ${cx.toFixed(1)} ${(headTop + headH * 0.965).toFixed(1)}`,
    // Left jaw & cheekbone
    `C ${(cx - headW * 0.13).toFixed(1)} ${(headTop + headH * 0.955).toFixed(1)}, ${(
      cx - headW * 0.275
    ).toFixed(1)} ${(headTop + headH * 0.855).toFixed(1)}, ${(
      cx - headW * 0.335
    ).toFixed(1)} ${(headTop + headH * 0.67).toFixed(1)}`,
    // Left ear hint
    `C ${(cx - headW * 0.405).toFixed(1)} ${(headTop + headH * 0.64).toFixed(1)}, ${(
      cx - headW * 0.415
    ).toFixed(1)} ${(headTop + headH * 0.495).toFixed(1)}, ${(
      cx - headW * 0.365
    ).toFixed(1)} ${(headTop + headH * 0.46).toFixed(1)}`,
    // Left temple notch into sculpted hair silhouette
    `L ${(cx - headW * 0.382).toFixed(1)} ${(headTop + headH * 0.33).toFixed(1)}`,
    `C ${(cx - headW * 0.415).toFixed(1)} ${(headTop + headH * 0.20).toFixed(1)}, ${(
      cx - headW * 0.34
    ).toFixed(1)} ${(headTop + headH * 0.065).toFixed(1)}, ${(
      cx - headW * 0.19
    ).toFixed(1)} ${(headTop + headH * 0.032).toFixed(1)}`,
    // Hair side-part sweep & natural upper crown contour
    `C ${(cx - headW * 0.09).toFixed(1)} ${(headTop - 4).toFixed(1)}, ${(
      cx + headW * 0.13
    ).toFixed(1)} ${(headTop - 5).toFixed(1)}, ${(
      cx + headW * 0.295
    ).toFixed(1)} ${(headTop + headH * 0.075).toFixed(1)}`,
    // Right hair temple taper
    `C ${(cx + headW * 0.395).toFixed(1)} ${(headTop + headH * 0.17).toFixed(1)}, ${(
      cx + headW * 0.405
    ).toFixed(1)} ${(headTop + headH * 0.30).toFixed(1)}, ${(
      cx + headW * 0.375
    ).toFixed(1)} ${(headTop + headH * 0.40).toFixed(1)}`,
    `L ${(cx + headW * 0.362).toFixed(1)} ${(headTop + headH * 0.46).toFixed(1)}`,
    // Right ear hint
    `C ${(cx + headW * 0.415).toFixed(1)} ${(headTop + headH * 0.495).toFixed(1)}, ${(
      cx + headW * 0.405
    ).toFixed(1)} ${(headTop + headH * 0.64).toFixed(1)}, ${(
      cx + headW * 0.335
    ).toFixed(1)} ${(headTop + headH * 0.67).toFixed(1)}`,
    // Right cheekbone & jawline back to chin
    `C ${(cx + headW * 0.275).toFixed(1)} ${(headTop + headH * 0.855).toFixed(1)}, ${(
      cx + headW * 0.13
    ).toFixed(1)} ${(headTop + headH * 0.955).toFixed(1)}, ${cx.toFixed(1)} ${(
      headTop +
      headH * 0.965
    ).toFixed(1)}`,
    "Z",
  ].join(" ");

  // Shirt V-opening
  const shirtVPath = [
    `M ${(cx - neckW * 1.15).toFixed(1)} ${(collarTopY + 4).toFixed(1)}`,
    `L ${cx.toFixed(1)} ${sternumY.toFixed(1)}`,
    `L ${(cx + neckW * 1.15).toFixed(1)} ${(collarTopY + 4).toFixed(1)}`,
    `Q ${cx.toFixed(1)} ${(collarTopY + 24).toFixed(1)}, ${(cx - neckW * 1.15).toFixed(1)} ${(
      collarTopY + 4
    ).toFixed(1)}`,
    "Z",
  ].join(" ");

  // Left & Right Shirt Collar Flaps
  const leftCollarPath = [
    `M ${(cx - neckW * 1.12).toFixed(1)} ${(collarTopY + 2).toFixed(1)}`,
    `L ${(cx - neckW * 1.38).toFixed(1)} ${(collarTopY + 40).toFixed(1)}`,
    `L ${(cx - 9).toFixed(1)} ${(collarTopY + 26).toFixed(1)}`,
    "Z",
  ].join(" ");
  const rightCollarPath = [
    `M ${(cx + neckW * 1.12).toFixed(1)} ${(collarTopY + 2).toFixed(1)}`,
    `L ${(cx + neckW * 1.38).toFixed(1)} ${(collarTopY + 40).toFixed(1)}`,
    `L ${(cx + 9).toFixed(1)} ${(collarTopY + 26).toFixed(1)}`,
    "Z",
  ].join(" ");

  // Windsor Tie Knot + Blade Contour
  const tieKnotTopY = collarTopY + 14;
  const tieKnotBotY = tieKnotTopY + 24;
  const tieKnotPath = [
    `M ${(cx - 13).toFixed(1)} ${tieKnotTopY.toFixed(1)}`,
    `L ${(cx + 13).toFixed(1)} ${tieKnotTopY.toFixed(1)}`,
    `L ${(cx + 8.5).toFixed(1)} ${tieKnotBotY.toFixed(1)}`,
    `L ${(cx - 8.5).toFixed(1)} ${tieKnotBotY.toFixed(1)}`,
    "Z",
  ].join(" ");
  const tieBladePath = [
    `M ${(cx - 7.5).toFixed(1)} ${tieKnotBotY.toFixed(1)}`,
    `L ${(cx + 7.5).toFixed(1)} ${tieKnotBotY.toFixed(1)}`,
    `L ${(cx + 15.5).toFixed(1)} ${(sternumY - 34).toFixed(1)}`,
    `L ${cx.toFixed(1)} ${sternumY.toFixed(1)}`,
    `L ${(cx - 15.5).toFixed(1)} ${(sternumY - 34).toFixed(1)}`,
    "Z",
  ].join(" ");

  // Tailored Notched Suit Lapels (Left & Right)
  const leftLapelPath = [
    `M ${(cx - collarW).toFixed(1)} ${(collarTopY + 8).toFixed(1)}`,
    `L ${(cx - collarW - 36).toFixed(1)} ${(shoulderY + 54).toFixed(1)}`,
    `L ${(cx - collarW - 18).toFixed(1)} ${(shoulderY + 68).toFixed(1)}`,
    `L ${(cx - collarW - 44).toFixed(1)} ${(shoulderY + 86).toFixed(1)}`,
    `L ${(cx - 4).toFixed(1)} ${(sternumY + 6).toFixed(1)}`,
    `L ${(cx - neckW * 1.15).toFixed(1)} ${(collarTopY + 4).toFixed(1)}`,
    "Z",
  ].join(" ");

  const rightLapelPath = [
    `M ${(cx + collarW).toFixed(1)} ${(collarTopY + 8).toFixed(1)}`,
    `L ${(cx + collarW + 36).toFixed(1)} ${(shoulderY + 54).toFixed(1)}`,
    `L ${(cx + collarW + 18).toFixed(1)} ${(shoulderY + 68).toFixed(1)}`,
    `L ${(cx + collarW + 44).toFixed(1)} ${(shoulderY + 86).toFixed(1)}`,
    `L ${(cx + 4).toFixed(1)} ${(sternumY + 6).toFixed(1)}`,
    `L ${(cx + neckW * 1.15).toFixed(1)} ${(collarTopY + 4).toFixed(1)}`,
    "Z",
  ].join(" ");

  // Subtle interior hairline contour for editorial hair volume separation
  const hairlineCurvePath = [
    `M ${(cx - headW * 0.37).toFixed(1)} ${(headTop + headH * 0.34).toFixed(1)}`,
    `C ${(cx - headW * 0.28).toFixed(1)} ${(headTop + headH * 0.21).toFixed(1)}, ${(
      cx - headW * 0.08
    ).toFixed(1)} ${(headTop + headH * 0.20).toFixed(1)}, ${(
      cx + headW * 0.06
    ).toFixed(1)} ${(headTop + headH * 0.22).toFixed(1)}`,
    `C ${(cx + headW * 0.22).toFixed(1)} ${(headTop + headH * 0.24).toFixed(1)}, ${(
      cx + headW * 0.32
    ).toFixed(1)} ${(headTop + headH * 0.29).toFixed(1)}, ${(
      cx + headW * 0.365
    ).toFixed(1)} ${(headTop + headH * 0.38).toFixed(1)}`,
  ].join(" ");

  return (
    <svg
      width={LAYOUT.width}
      height={LAYOUT.height}
      viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate3d(0, ${breathY.toFixed(2)}px, 0)`,
        filter: "drop-shadow(0 20px 42px rgba(6, 10, 18, 0.78))",
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id={`${uid}-suit`} x1="0%" y1="0%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#223142" />
          <stop offset="35%" stopColor="#16212E" />
          <stop offset="72%" stopColor="#101822" />
          <stop offset="100%" stopColor="#0B121A" />
        </linearGradient>
        <radialGradient id={`${uid}-shoulder-key`} cx="24%" cy="22%" r="62%">
          <stop offset="0%" stopColor="#FAECD4" stopOpacity="0.13" />
          <stop offset="48%" stopColor="#3E6A94" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0E1620" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-head-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E2C3B" />
          <stop offset="52%" stopColor="#121B25" />
          <stop offset="100%" stopColor="#0B1119" />
        </linearGradient>
        <linearGradient id={`${uid}-shirt`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#26384B" />
          <stop offset="100%" stopColor="#15212E" />
        </linearGradient>
        <linearGradient id={`${uid}-lapel`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1D2B3B" />
          <stop offset="100%" stopColor="#0F1721" />
        </linearGradient>
        <linearGradient id={`${uid}-tie`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2C4259" />
          <stop offset="55%" stopColor="#1A2837" />
          <stop offset="100%" stopColor="#101924" />
        </linearGradient>
        <linearGradient id={`${uid}-rim-dual`} x1="0%" y1="15%" x2="100%" y2="25%">
          <stop offset="0%" stopColor="#FAECD4" stopOpacity="0.82" />
          <stop offset="28%" stopColor="#FAECD4" stopOpacity="0.28" />
          <stop offset="52%" stopColor="#BFD6EA" stopOpacity="0.08" />
          <stop offset="76%" stopColor="#4FB3AE" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#4FB3AE" stopOpacity="0.76" />
        </linearGradient>
      </defs>

      {/* 1. Tailored Suit Jacket & Shoulders */}
      <path
        d={torsoPath}
        fill={`url(#${uid}-suit)`}
        stroke={`url(#${uid}-rim-dual)`}
        strokeWidth={2.2}
      />
      {/* Warm Key-Light Shoulder Shading Overlay */}
      <path d={torsoPath} fill={`url(#${uid}-shoulder-key)`} />

      {/* Subtle Shoulder/Sleeve Armhole Tailoring Seams */}
      <path
        d={`M ${(lShX + 22).toFixed(1)} ${(lShY + 34).toFixed(1)} Q ${(cx - 110).toFixed(
          1
        )} ${(shoulderY + 185).toFixed(1)} ${(leftX + 58).toFixed(1)} 1094`}
        fill="none"
        stroke="rgba(250, 236, 212, 0.09)"
        strokeWidth={1.4}
      />
      <path
        d={`M ${(rShX - 22).toFixed(1)} ${(rShY + 34).toFixed(1)} Q ${(cx + 110).toFixed(
          1
        )} ${(shoulderY + 185).toFixed(1)} ${(rightX - 58).toFixed(1)} 1094`}
        fill="none"
        stroke="rgba(79, 179, 174, 0.11)"
        strokeWidth={1.4}
      />

      {/* 2. Shirt Collar V & Neck Interior */}
      <path
        d={shirtVPath}
        fill={`url(#${uid}-shirt)`}
        stroke="rgba(191, 214, 234, 0.22)"
        strokeWidth={1.2}
      />

      {/* 3. Tailored Windsor Tie Knot & Blade */}
      <path
        d={tieBladePath}
        fill={`url(#${uid}-tie)`}
        stroke="rgba(191, 214, 234, 0.24)"
        strokeWidth={1.2}
      />
      <path
        d={tieKnotPath}
        fill={`url(#${uid}-tie)`}
        stroke="rgba(250, 236, 212, 0.30)"
        strokeWidth={1.3}
      />

      {/* 4. Shirt Collar Points */}
      <path
        d={leftCollarPath}
        fill={`url(#${uid}-shirt)`}
        stroke="rgba(250, 236, 212, 0.28)"
        strokeWidth={1.25}
      />
      <path
        d={rightCollarPath}
        fill={`url(#${uid}-shirt)`}
        stroke="rgba(79, 179, 174, 0.24)"
        strokeWidth={1.25}
      />

      {/* 5. Tailored Notched Suit Lapels */}
      <path
        d={leftLapelPath}
        fill={`url(#${uid}-lapel)`}
        stroke="rgba(250, 236, 212, 0.24)"
        strokeWidth={1.35}
      />
      <path
        d={rightLapelPath}
        fill={`url(#${uid}-lapel)`}
        stroke="rgba(79, 179, 174, 0.24)"
        strokeWidth={1.35}
      />

      {/* Center Jacket Placket Seam */}
      <line
        x1={cx}
        y1={sternumY + 6}
        x2={cx}
        y2={1094}
        stroke="rgba(191, 214, 234, 0.12)"
        strokeWidth={1.3}
      />

      {/* 6. Sculpted Head, Hairline & Jawline Silhouette */}
      <path
        d={headPath}
        fill={`url(#${uid}-head-fill)`}
        stroke={`url(#${uid}-rim-dual)`}
        strokeWidth={2.2}
      />
      <path
        d={hairlineCurvePath}
        fill="none"
        stroke="rgba(191, 214, 234, 0.14)"
        strokeWidth={1.2}
        strokeLinecap="round"
      />

      {showRimGuides && (
        <g opacity={0.55}>
          <circle
            cx={bounds.leftShoulderAnchor[0]}
            cy={bounds.leftShoulderAnchor[1]}
            r={4.5}
            fill={OVER_FOOTAGE_PALETTE.accentWarm}
          />
          <circle
            cx={bounds.rightShoulderAnchor[0]}
            cy={bounds.rightShoulderAnchor[1]}
            r={4.5}
            fill={OVER_FOOTAGE_PALETTE.chartSecondary}
          />
        </g>
      )}
    </svg>
  );
};

const BuiltInHeroBackdropBillboard: React.FC<{
  spec: HeroBackdropFigureSpec;
  preset: DepthSandwichPreset;
  bounds: PresenterRigBounds;
  driftX: number;
}> = ({ spec, preset, bounds, driftX }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: CINEMA_SPRINGS.archivalSettle });
  const translateY = interpolate(rise, [0, 1], [64, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const figureColor =
    spec.tone === "liability"
      ? OVER_FOOTAGE_PALETTE.brickRedText
      : spec.tone === "teal"
      ? OVER_FOOTAGE_PALETTE.chartSecondary
      : OVER_FOOTAGE_PALETTE.textHeadline;

  const isCenteredColossus =
    preset === "colossus-prop-backdrop" || preset === "halo-arc-gauge";

  const headRightEdge = bounds.headBox.x + bounds.headBox.width;
  const billboardLeft = Math.max(558, Math.min(610, Math.round(headRightEdge + 26)));
  const billboardMaxW = Math.max(460, 1215 - billboardLeft);

  const fittedFigure = fitAndBalanceText({
    text: spec.figure,
    fontFamily: "mono",
    fontWeight: 700,
    maxWidth: billboardMaxW,
    maxHeight: isCenteredColossus ? 210 : 185,
    maxLines: 1,
    minFontSize: 68,
    maxFontSize: isCenteredColossus ? 196 : 168,
    lineHeight: 0.94,
    letterSpacingEm: -0.035,
  });

  const fittedSublabel = spec.sublabel
    ? fitAndBalanceText({
        text: spec.sublabel,
        fontFamily: "serif",
        fontWeight: 500,
        italic: true,
        maxWidth: Math.min(620, billboardMaxW),
        maxHeight: 62,
        maxLines: 2,
        minFontSize: 16,
        maxFontSize: 22,
        lineHeight: 1.28,
      })
    : null;

  const plinthLeft = Math.max(120, Math.round(bounds.torsoBox.x - 16));
  const plinthWidth = billboardLeft + billboardMaxW - plinthLeft + 24;

  return (
    <>
      {/* Plane-1 Architectural Monolith Plinth & Datum Wall Passing Behind Presenter (Plane 2) */}
      <div
        style={{
          position: "absolute",
          left: plinthLeft,
          top: 146,
          width: plinthWidth,
          height: 304,
          borderTop: "1px solid rgba(191, 214, 234, 0.22)",
          borderBottom: "1px solid rgba(191, 214, 234, 0.16)",
          background:
            "linear-gradient(90deg, rgba(22, 34, 48, 0.62) 0%, rgba(16, 26, 38, 0.44) 68%, rgba(15, 25, 35, 0.04) 100%)",
          opacity: opacity * 0.92,
          transform: `translate3d(${(driftX * 0.45).toFixed(2)}px, ${translateY.toFixed(
            2
          )}px, 0)`,
          pointerEvents: "none",
        }}
      >
        {/* Horizontal Datum Bar Clearly Occluded Behind Presenter's Neck & Head */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 40,
            top: "220px",
            height: "2px",
            background: `linear-gradient(90deg, ${figureColor} 0%, rgba(191, 214, 234, 0.34) 70%, transparent 100%)`,
            opacity: 0.55,
          }}
        />
      </div>

      {/* Monumental Typography — 100% Legible in Upper-Center / Right-Center Wall */}
      <div
        style={{
          position: "absolute",
          left: billboardLeft,
          top: 168,
          width: billboardMaxW,
          opacity,
          transform: `translate3d(${(driftX * 0.5).toFixed(2)}px, ${translateY.toFixed(
            2
          )}px, 0)`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {spec.eyebrow && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "13.5px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: OVER_FOOTAGE_PALETTE.accentPrimary,
              marginBottom: "8px",
              textShadow: OVER_FOOTAGE_PALETTE.textShadow,
            }}
          >
            {spec.eyebrow}
          </div>
        )}

        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: `${fittedFigure.fontSize}px`,
            fontWeight: 700,
            lineHeight: 0.94,
            letterSpacing: "-0.035em",
            color: figureColor,
            opacity: 0.96,
            whiteSpace: "nowrap",
            textShadow: "0 16px 44px rgba(6, 10, 18, 0.78)",
            ...TABULAR_NUM_STYLE,
          }}
        >
          {fittedFigure.lines[0] ?? spec.figure}
        </div>

        {fittedSublabel && fittedSublabel.lines.length > 0 && (
          <div
            style={{
              marginTop: "14px",
              maxWidth: `${Math.min(620, billboardMaxW)}px`,
              fontFamily: FONTS.serif,
              fontSize: `${fittedSublabel.fontSize}px`,
              fontStyle: "italic",
              lineHeight: `${fittedSublabel.lineHeightPx}px`,
              color: OVER_FOOTAGE_PALETTE.textMuted,
              textShadow: OVER_FOOTAGE_PALETTE.textShadow,
            }}
          >
            {fittedSublabel.lines.map((line, i) => (
              <div key={`sub-${i}`}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

/**
 * Pillar #10 Presenter Depth-Sandwich Stage (<PresenterDepthStage>):
 * Composites 4 optical Z-planes:
 *   Plane 0 (z = 0):  Room Background Plate (live A-roll video or warm/cool studio backplate)
 *   Plane 1 (z = 10): Midground Behind-Presenter Graphics (giant numbers, rising walls, maps)
 *   Plane 2 (z = 20): Masked Presenter Cutout Layer (live alpha/mask video or crisp simulated silhouette)
 *   Plane 3 (z = 30): Foreground Smoked-Navy Liquid Glass Overlays (safe right-third / dock / top-bar)
 */
export const PresenterDepthStage: React.FC<PresenterDepthStageProps> = ({
  mode,
  preset = "behind-shoulder-billboard",
  cameraSrc,
  presenterAlphaSrc,
  personMaskSrc,
  backgroundPlate,
  behindPresenter,
  heroBackdropFigure,
  foregroundGlass,
  children,
  rigBounds = DEFAULT_PRESENTER_RIG_BOUNDS,
  backgroundDimOpacity,
  showSimulatedRimGuides = false,
  style,
  className,
}) => {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "_");
  const frame = useCurrentFrame();
  const { width = LAYOUT.width, height = LAYOUT.height } = useVideoConfig();

  const resolvedMode: PresenterDepthMode =
    mode ??
    (cameraSrc || presenterAlphaSrc ? "masked-video" : "simulated-depth");

  // Subtle deterministic breathing & parallax drift
  const driftX = Math.sin(frame * 0.02) * 10;
  const driftY = Math.cos(frame * 0.016) * 6;
  const presenterBreathY = Math.sin(frame * 0.045) * 2.2;

  // Stepped 2-frame 16mm grain seed
  const grainSeed = (Math.floor(frame / 2) * 37) % 997;
  const grainFilterId = `rr-depth-stage-grain-${reactId}`;

  // DaVinci Resolve Lane V2 export: pure alpha behind-presenter graphics only
  if (resolvedMode === "behind-only-alpha") {
    return (
      <AbsoluteFill
        className={className}
        style={{
          width,
          height,
          backgroundColor: "transparent",
          overflow: "hidden",
          ...style,
        }}
      >
        {heroBackdropFigure && (
          <BuiltInHeroBackdropBillboard
            spec={heroBackdropFigure}
            preset={preset}
            bounds={rigBounds}
            driftX={driftX}
          />
        )}
        {behindPresenter}
      </AbsoluteFill>
    );
  }

  // DaVinci Resolve Lane V4 export: pure alpha foreground glass only
  if (resolvedMode === "front-only-alpha") {
    return (
      <AbsoluteFill
        className={className}
        style={{
          width,
          height,
          backgroundColor: "transparent",
          overflow: "hidden",
          ...style,
        }}
      >
        {foregroundGlass}
        {children}
      </AbsoluteFill>
    );
  }

  const effectiveDim =
    backgroundDimOpacity ??
    (preset === "spotlight-dim-sandwich" ? 0.52 : 0.14);

  return (
    <AbsoluteFill
      className={className}
      style={{
        width,
        height,
        backgroundColor: PAGE_PALETTE.navyDeep,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* ================================================================== */}
      {/* PLANE 0 (z = 0): Studio Background Plate / Full-Frame A-Roll       */}
      {/* ================================================================== */}
      <AbsoluteFill style={{ zIndex: 0, pointerEvents: "none" }}>
        {backgroundPlate ? (
          backgroundPlate
        ) : resolvedMode === "masked-video" && cameraSrc ? (
          <Video
            src={cameraSrc}
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <>
            {/* Simulated Reading Room Nocturne Studio Backplate (zero #000000) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(142deg, #0F1923 0%, #162433 48%, #0E1620 100%)",
              }}
            />
            {/* Warm Tungsten Practical Key-Light (Left) */}
            <div
              style={{
                position: "absolute",
                top: "-12%",
                left: "-8%",
                width: "56%",
                height: "86%",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(250, 236, 212, 0.14) 0%, rgba(229, 169, 60, 0.05) 48%, transparent 74%)",
                transform: `translate3d(${(driftX * 0.7).toFixed(2)}px, ${(
                  driftY * 0.7
                ).toFixed(2)}px, 0)`,
              }}
            />
            {/* Cool Slate Bookcase & Architectural Depth Grid */}
            <div
              style={{
                position: "absolute",
                inset: "-80px",
                backgroundImage: `
                  linear-gradient(to right, rgba(169, 196, 222, 0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(169, 196, 222, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: "96px 96px",
                transform: `translate3d(${(driftX * 0.35).toFixed(2)}px, ${(
                  driftY * 0.35
                ).toFixed(2)}px, 0)`,
              }}
            />
            {preset === "subsea-horizon-split" && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "46%",
                  background:
                    "linear-gradient(180deg, rgba(47, 143, 139, 0.18) 0%, rgba(15, 25, 35, 0.78) 100%)",
                  borderTop: "1px solid rgba(79, 179, 174, 0.42)",
                }}
              />
            )}
          </>
        )}

        {/* Optional Room Dimmer Behind Presenter */}
        {effectiveDim > 0.01 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: `rgba(11, 16, 23, ${Math.min(
                0.78,
                effectiveDim
              ).toFixed(3)})`,
            }}
          />
        )}
      </AbsoluteFill>

      {/* ================================================================== */}
      {/* PLANE 1 (z = 10): Midground Behind-Presenter Graphics              */}
      {/* ================================================================== */}
      <AbsoluteFill
        style={{
          zIndex: 10,
          transform: `translate3d(${(driftX * 0.45).toFixed(2)}px, ${(
            driftY * 0.35
          ).toFixed(2)}px, 0)`,
          pointerEvents: "none",
        }}
      >
        {preset === "halo-arc-gauge" && (
          <svg
            width={LAYOUT.width}
            height={LAYOUT.height}
            viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
            style={{ position: "absolute", inset: 0 }}
          >
            <circle
              cx={rigBounds.headBox.x + rigBounds.headBox.width * 0.5}
              cy={rigBounds.torsoBox.y + 40}
              r={330}
              fill="none"
              stroke="rgba(191, 214, 234, 0.24)"
              strokeWidth={2}
              strokeDasharray="8 8"
            />
            <circle
              cx={rigBounds.headBox.x + rigBounds.headBox.width * 0.5}
              cy={rigBounds.torsoBox.y + 40}
              r={275}
              fill="none"
              stroke="rgba(79, 179, 174, 0.34)"
              strokeWidth={3}
            />
          </svg>
        )}

        {heroBackdropFigure && (
          <BuiltInHeroBackdropBillboard
            spec={heroBackdropFigure}
            preset={preset}
            bounds={rigBounds}
            driftX={driftX}
          />
        )}

        {behindPresenter}
      </AbsoluteFill>

      {/* ================================================================== */}
      {/* PLANE 2 (z = 20): Masked Presenter Cutout / Studio Silhouette      */}
      {/* ================================================================== */}
      <AbsoluteFill style={{ zIndex: 20, pointerEvents: "none" }}>
        {presenterAlphaSrc ? (
          <Video
            src={presenterAlphaSrc}
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : resolvedMode === "masked-video" && cameraSrc && personMaskSrc ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              WebkitMaskImage: `url(${personMaskSrc})`,
              maskImage: `url(${personMaskSrc})`,
              WebkitMaskSize: "cover",
              maskSize: "cover",
            }}
          >
            <Video
              src={cameraSrc}
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <SimulatedPresenterCutout
            bounds={rigBounds}
            breathY={presenterBreathY}
            showRimGuides={showSimulatedRimGuides}
          />
        )}
      </AbsoluteFill>

      {/* ================================================================== */}
      {/* PLANE 3 (z = 30): Foreground Smoked-Navy Liquid Glass Overlays     */}
      {/* ================================================================== */}
      <AbsoluteFill style={{ zIndex: 30 }}>
        {foregroundGlass}
        {children}
      </AbsoluteFill>

      {/* ================================================================== */}
      {/* PLANE 4 (z = 40): Optical Vignette & Stepped 2-Frame 16mm Grain    */}
      {/* ================================================================== */}
      <AbsoluteFill
        style={{
          zIndex: 40,
          background:
            "radial-gradient(ellipse 92% 84% at 50% 48%, transparent 48%, rgba(8, 13, 20, 0.44) 100%)",
          pointerEvents: "none",
        }}
      />
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.03,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          zIndex: 41,
        }}
      >
        <filter id={grainFilterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves={2}
            seed={grainSeed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainFilterId})`} />
      </svg>
    </AbsoluteFill>
  );
};

export { CameraPreviewStage } from "./CameraPreviewStage";
export type { CameraPreviewStageProps, PreviewMode } from "./CameraPreviewStage";
