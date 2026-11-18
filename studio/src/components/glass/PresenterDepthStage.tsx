import React, { useId } from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
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
  headBox: { x: 410, y: 168, width: 220, height: 268 },
  torsoBox: { x: 248, y: 428, width: 544, height: 652 },
  leftShoulderAnchor: [292, 462],
  rightShoulderAnchor: [748, 462],
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
 * Crisp vector + rim-lit studio presenter silhouette for standalone/exam renders
 * proving true 4-plane depth occlusion without requiring external MP4 assets.
 */
const SimulatedPresenterCutout: React.FC<{
  bounds: PresenterRigBounds;
  breathY: number;
  showRimGuides: boolean;
}> = ({ bounds, breathY, showRimGuides }) => {
  const cx = bounds.headBox.x + bounds.headBox.width * 0.5;
  const headTop = bounds.headBox.y;
  const shoulderY = bounds.torsoBox.y + 34;
  const leftX = bounds.torsoBox.x;
  const rightX = bounds.torsoBox.x + bounds.torsoBox.width;

  // Smooth anatomically proportioned head-neck-shoulders-torso SVG silhouette
  const headRx = bounds.headBox.width * 0.44;
  const headRy = bounds.headBox.height * 0.48;
  const headCy = headTop + headRy;
  const neckHalfW = headRx * 0.46;
  const neckTopY = headCy + headRy * 0.82;

  const torsoPath = [
    `M ${(cx - neckHalfW).toFixed(1)} ${neckTopY.toFixed(1)}`,
    `L ${(cx - neckHalfW - 8).toFixed(1)} ${(shoulderY - 14).toFixed(1)}`,
    `C ${(cx - 120).toFixed(1)} ${(shoulderY - 8).toFixed(1)}, ${(
      leftX + 34
    ).toFixed(1)} ${(shoulderY + 24).toFixed(1)}, ${leftX.toFixed(1)} ${(
      shoulderY + 130
    ).toFixed(1)}`,
    `L ${(leftX - 18).toFixed(1)} 1090`,
    `L ${(rightX + 18).toFixed(1)} 1090`,
    `L ${rightX.toFixed(1)} ${(shoulderY + 130).toFixed(1)}`,
    `C ${(rightX - 34).toFixed(1)} ${(shoulderY + 24).toFixed(1)}, ${(
      cx + 120
    ).toFixed(1)} ${(shoulderY - 8).toFixed(1)}, ${(
      cx +
      neckHalfW +
      8
    ).toFixed(1)} ${(shoulderY - 14).toFixed(1)}`,
    `L ${(cx + neckHalfW).toFixed(1)} ${neckTopY.toFixed(1)}`,
    "Z",
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
        filter: "drop-shadow(0 18px 38px rgba(6, 10, 16, 0.72))",
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id="rr-presenter-body-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E2B3A" />
          <stop offset="48%" stopColor="#131C26" />
          <stop offset="100%" stopColor="#0E151E" />
        </linearGradient>
        <linearGradient id="rr-presenter-rim-warm" x1="0%" y1="0%" x2="100%" y2="40%">
          <stop offset="0%" stopColor="#FAECD4" stopOpacity="0.62" />
          <stop offset="38%" stopColor="#BFD6EA" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#4FB3AE" stopOpacity="0.44" />
        </linearGradient>
      </defs>

      {/* Occluding Torso & Suit Silhouette */}
      <path
        d={torsoPath}
        fill="url(#rr-presenter-body-fill)"
        stroke="url(#rr-presenter-rim-warm)"
        strokeWidth={2.2}
      />

      {/* Subtle Editorial Lapel V-Lines so Silhouette Reads Crisp & Architectural */}
      <path
        d={`M ${(cx - neckHalfW - 6).toFixed(1)} ${(shoulderY - 8).toFixed(
          1
        )} L ${cx.toFixed(1)} ${(shoulderY + 210).toFixed(1)} L ${(
          cx +
          neckHalfW +
          6
        ).toFixed(1)} ${(shoulderY - 8).toFixed(1)}`}
        fill="none"
        stroke="rgba(191, 214, 234, 0.16)"
        strokeWidth={1.5}
      />

      {/* Occluding Head Silhouette with Tungsten Key & Ice Rim */}
      <ellipse
        cx={cx}
        cy={headCy}
        rx={headRx}
        ry={headRy}
        fill="url(#rr-presenter-body-fill)"
        stroke="url(#rr-presenter-rim-warm)"
        strokeWidth={2.2}
      />

      {showRimGuides && (
        <g opacity={0.45}>
          <circle
            cx={bounds.leftShoulderAnchor[0]}
            cy={bounds.leftShoulderAnchor[1]}
            r={4}
            fill={OVER_FOOTAGE_PALETTE.accentWarm}
          />
          <circle
            cx={bounds.rightShoulderAnchor[0]}
            cy={bounds.rightShoulderAnchor[1]}
            r={4}
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
  driftX: number;
}> = ({ spec, preset, driftX }) => {
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

  return (
    <div
      style={{
        position: "absolute",
        left: isCenteredColossus ? 180 : 340,
        top: isCenteredColossus ? 120 : 148,
        right: 96,
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
            fontSize: "14px",
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
          fontSize: isCenteredColossus ? "248px" : "212px",
          fontWeight: 700,
          lineHeight: 0.92,
          letterSpacing: "-0.035em",
          color: figureColor,
          opacity: 0.92,
          textShadow: "0 16px 44px rgba(6, 10, 18, 0.75)",
          ...TABULAR_NUM_STYLE,
        }}
      >
        {spec.figure}
      </div>

      {spec.sublabel && (
        <div
          style={{
            marginTop: "14px",
            fontFamily: FONTS.serif,
            fontSize: "28px",
            fontStyle: "italic",
            color: OVER_FOOTAGE_PALETTE.textMuted,
            textShadow: OVER_FOOTAGE_PALETTE.textShadow,
          }}
        >
          {spec.sublabel}
        </div>
      )}
    </div>
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
