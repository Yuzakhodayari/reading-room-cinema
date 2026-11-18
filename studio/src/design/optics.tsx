import React, { useId } from "react";
import { noise2D } from "@remotion/noise";
import { evolvePath } from "@remotion/paths";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONTS, TABULAR_NUM_STYLE } from "./fonts";
import {
  fluidCameraSpring,
  interpolateRegisterOKLCH,
  LAYOUT,
  RegisterId,
  RegisterPalette,
  REGISTERS,
  resolveRegisterPalette,
  studioSpring,
} from "./tokens";

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ============================================================================
// 1. 2.5D Camera Rig & Three Depth Planes (z = -120, z = 0, z = +85)
// ============================================================================

export type DepthPlaneZ = -120 | 0 | 85 | number;

export type CameraMovePreset =
  | "static"
  | "dolly-creep"
  | "dolly-pullback"
  | "pan-ledger-right"
  | "pan-ledger-left"
  | "rack-focus-fg"
  | "rack-focus-bg"
  | "dutch-disequilibrium"
  | "verdict-slam";

export interface ShakeImpactTrigger {
  hitFrame: number;
  /** Normalized impulse intensity in [0.4, 1.0] for <=6-word verdict slams */
  intensity?: number;
  wordCount?: number;
}

export interface CameraRigMoveSpec {
  preset?: CameraMovePreset;
  /** Exponential dolly scale [S0, S1], default [1.0, 1.042] */
  dollyRange?: [number, number];
  panFrom?: [number, number];
  panTo?: [number, number];
  /** Micro-float amplitude in px (2.0px archival, 0.0px precision telemetry) */
  floatAmplitudePx?: number;
  /** Dutch tilt angle in degrees, strictly clamped to [-1.15, +1.15] */
  dutchDeg?: number;
  /** Restore dutch angle to 0 deg starting at this frame via fluidCameraSpring */
  dutchRestoreFrame?: number;
  /** Thin-lens focal plane z in [-120..+85] (static or [fromZ, toZ]) */
  focusZ?: number | [number, number];
  focusTransitionFrames?: [number, number];
  fStop?: number;
  shakeImpact?: ShakeImpactTrigger | readonly ShakeImpactTrigger[];
  seed?: number;
}

export interface DepthPlaneProps {
  z?: DepthPlaneZ;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

interface CameraRigContextValue {
  frame: number;
  fps: number;
  panX: number;
  panY: number;
  floatX: number;
  floatY: number;
  focusZ: number;
  fStop: number;
}

const CameraRigContext = React.createContext<CameraRigContextValue>({
  frame: 0,
  fps: 30,
  panX: 0,
  panY: 0,
  floatX: 0,
  floatY: 0,
  focusZ: 0,
  fStop: 5.6,
});

export const DepthPlane: React.FC<DepthPlaneProps> = ({
  z = 0,
  children,
  style,
  className,
}) => {
  const ctx = React.useContext(CameraRigContext);
  const parallax = 1 + z / 1000;
  const tx = -ctx.panX * parallax + ctx.floatX * parallax;
  const ty = -ctx.panY * parallax + ctx.floatY * parallax;

  const denom = Math.max(0.8, ctx.fStop) * 12.5;
  const sigma = Math.min(14.0, Math.abs(z - ctx.focusZ) / denom);
  const filter = sigma > 0.15 ? `blur(${sigma.toFixed(2)}px)` : "none";

  return (
    <AbsoluteFill
      className={className}
      style={{
        transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`,
        filter,
        pointerEvents: "none",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

function normalizeMoveSpec(
  move?: CameraMovePreset | CameraRigMoveSpec
): CameraRigMoveSpec {
  if (!move) return { preset: "dolly-creep" };
  if (typeof move === "string") return { preset: move };
  return move;
}

export function evaluateShakeImpulse(
  frame: number,
  fps: number,
  triggers?: ShakeImpactTrigger | readonly ShakeImpactTrigger[]
): { dx: number; dy: number; dThetaDeg: number } {
  if (!triggers) return { dx: 0, dy: 0, dThetaDeg: 0 };
  const list: readonly ShakeImpactTrigger[] = Array.isArray(triggers)
    ? triggers
    : [triggers as ShakeImpactTrigger];

  let dx = 0;
  let dy = 0;
  let dThetaDeg = 0;

  for (let i = 0; i < list.length; i++) {
    const trig = list[i];
    // Verdict anvil recoil applies strictly to <=6 word verdict slams when wordCount is specified
    if (trig.wordCount !== undefined && trig.wordCount > 6) {
      continue;
    }
    if (frame < trig.hitFrame) continue;
    const u = Math.max(0, (frame - trig.hitFrame) / Math.max(1, fps));
    if (u > 0.6) continue;
    const intensity = clamp(trig.intensity ?? 0.85, 0.4, 1.0);
    dx += 6.5 * intensity * Math.exp(-16 * u) * Math.sin(46 * u);
    dy += -8.8 * intensity * Math.exp(-16 * u) * Math.cos(62 * u);
    dThetaDeg += 0.22 * intensity * Math.exp(-18 * u) * Math.sin(34 * u);
  }

  return {
    dx: Math.abs(dx) < 0.04 ? 0 : dx,
    dy: Math.abs(dy) < 0.04 ? 0 : dy,
    dThetaDeg: Math.abs(dThetaDeg) < 0.01 ? 0 : dThetaDeg,
  };
}

export interface CameraRig25DProps {
  move?: CameraMovePreset | CameraRigMoveSpec;
  /** Optional Plane z = -120 background archival ledger / context map */
  backgroundPlane?: React.ReactNode;
  /** Primary Plane z = 0 chart / court ruling / schematic (or explicit <DepthPlane> children) */
  children?: React.ReactNode;
  /** Optional Plane z = +85 foreground callouts / verdict stamps */
  foregroundPlane?: React.ReactNode;
  /** Set true when children already declare their own <DepthPlane> wrappers */
  manualPlanes?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const CameraRig25D: React.FC<CameraRig25DProps> = ({
  move,
  backgroundPlane,
  children,
  foregroundPlane,
  manualPlanes = false,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const spec = normalizeMoveSpec(move);
  const preset = spec.preset ?? "dolly-creep";
  const totalFrames = Math.max(1, durationInFrames);
  const timelineProgress = interpolate(frame, [0, totalFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 1. Exponential dollyPush S(p) = S0 * (S1 / S0)^p for constant optical velocity
  let defaultDolly: [number, number] = [1.0, 1.042];
  if (preset === "static") defaultDolly = [1.0, 1.0];
  else if (preset === "dolly-pullback") defaultDolly = [1.055, 1.0];
  else if (preset === "verdict-slam") defaultDolly = [1.018, 1.052];

  const [s0Raw, s1Raw] = spec.dollyRange ?? defaultDolly;
  const s0 = Math.max(0.5, s0Raw);
  const s1 = Math.max(0.5, s1Raw);
  const dollyScale = s0 * Math.pow(s1 / s0, timelineProgress);

  // 2. Fluid-head pan trajectory
  let defaultPanFrom: [number, number] = [0, 0];
  let defaultPanTo: [number, number] = [0, 0];
  if (preset === "pan-ledger-right") {
    defaultPanFrom = [-28, 0];
    defaultPanTo = [28, 0];
  } else if (preset === "pan-ledger-left") {
    defaultPanFrom = [28, 0];
    defaultPanTo = [-28, 0];
  }

  const panFrom = spec.panFrom ?? defaultPanFrom;
  const panTo = spec.panTo ?? defaultPanTo;
  const glideProgress =
    panFrom[0] !== panTo[0] || panFrom[1] !== panTo[1]
      ? fluidCameraSpring(frame, fps, 0)
      : timelineProgress;

  const panX = panFrom[0] + (panTo[0] - panFrom[0]) * glideProgress;
  const panY = panFrom[1] + (panTo[1] - panFrom[1]) * glideProgress;

  // 3. Seeded deterministic micro-float
  const seed = spec.seed ?? 17;
  const floatAmp =
    spec.floatAmplitudePx ?? (preset === "static" ? 0 : 1.8);
  const floatFreqDenom = Math.max(1, 6.5 * fps);
  const floatX =
    floatAmp > 0 ? floatAmp * noise2D("cx", frame / floatFreqDenom, seed) : 0;
  const floatY =
    floatAmp > 0
      ? floatAmp * 0.75 * noise2D("cy", frame / floatFreqDenom, seed + 13)
      : 0;

  // 4. Dutch micro-tilt clamped to [-1.15, +1.15] deg
  const baseDutch = clamp(
    spec.dutchDeg ?? (preset === "dutch-disequilibrium" ? -0.95 : 0),
    -1.15,
    1.15
  );
  const restoreMix =
    spec.dutchRestoreFrame !== undefined
      ? fluidCameraSpring(frame, fps, spec.dutchRestoreFrame)
      : preset === "dutch-disequilibrium"
      ? fluidCameraSpring(frame, fps, Math.round(totalFrames * 0.45))
      : 0;
  const dutchAngle = baseDutch * (1 - clamp(restoreMix, 0, 1));

  // 5. Thin-lens focusPull
  let focusZ = 0;
  if (typeof spec.focusZ === "number") {
    focusZ = spec.focusZ;
  } else if (Array.isArray(spec.focusZ)) {
    const [fStart, fEnd] = spec.focusTransitionFrames ?? [
      Math.round(totalFrames * 0.2),
      Math.round(totalFrames * 0.55),
    ];
    const rackSpring = fluidCameraSpring(frame, fps, fStart);
    const linearGuard = interpolate(frame, [fStart, Math.max(fStart + 1, fEnd)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const mix = clamp(rackSpring * 0.7 + linearGuard * 0.3, 0, 1);
    focusZ = spec.focusZ[0] + (spec.focusZ[1] - spec.focusZ[0]) * mix;
  } else if (preset === "rack-focus-fg") {
    const mix = fluidCameraSpring(frame, fps, Math.round(totalFrames * 0.22));
    focusZ = -120 + (85 - -120) * mix;
  } else if (preset === "rack-focus-bg") {
    const mix = fluidCameraSpring(frame, fps, Math.round(totalFrames * 0.22));
    focusZ = 85 + (-120 - 85) * mix;
  }

  // 6. Damped multi-harmonic verdict impulse
  const defaultShake: ShakeImpactTrigger | undefined =
    preset === "verdict-slam" ? { hitFrame: 8, intensity: 0.9 } : undefined;
  const shake = evaluateShakeImpulse(
    frame,
    fps,
    spec.shakeImpact ?? defaultShake
  );

  const totalRotateDeg = dutchAngle + shake.dThetaDeg;
  const ctxValue: CameraRigContextValue = {
    frame,
    fps,
    panX,
    panY,
    floatX,
    floatY,
    focusZ,
    fStop: spec.fStop ?? 5.6,
  };

  return (
    <CameraRigContext.Provider value={ctxValue}>
      <AbsoluteFill
        className={className}
        style={{
          transform: `translate3d(${shake.dx.toFixed(2)}px, ${shake.dy.toFixed(
            2
          )}px, 0) scale(${dollyScale.toFixed(5)}) rotate(${totalRotateDeg.toFixed(
            3
          )}deg)`,
          transformOrigin: "50% 50%",
          ...style,
        }}
      >
        {manualPlanes ? (
          children
        ) : (
          <>
            {backgroundPlane !== undefined && (
              <DepthPlane z={-120}>{backgroundPlane}</DepthPlane>
            )}
            <DepthPlane z={0}>{children}</DepthPlane>
            {foregroundPlane !== undefined && (
              <DepthPlane z={85}>{foregroundPlane}</DepthPlane>
            )}
          </>
        )}
      </AbsoluteFill>
    </CameraRigContext.Provider>
  );
};

// ============================================================================
// 2. Achromatic Glass Loupe (<OpticalLoupe>)
// ============================================================================

export interface OpticalLoupeProps {
  /** Focal center X in stage coordinates (px) */
  x: number;
  /** Focal center Y in stage coordinates (px) */
  y: number;
  /** Loupe circle radius in px (default 210, clamped [90, 340]) */
  radius?: number;
  /** Optical magnification factor in [1.85, 2.40] (default 2.05) */
  zoom?: number;
  register?: RegisterId | RegisterPalette;
  /** Dim exterior stage by 18% and blur by 3.2px when mounted over a full stage */
  dimExterior?: boolean;
  stageWidth?: number;
  stageHeight?: number;
  label?: string;
  enterFrame?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const OpticalLoupe: React.FC<OpticalLoupeProps> = ({
  x,
  y,
  radius = 210,
  zoom = 2.05,
  register = "archival_parchment",
  dimExterior = false,
  stageWidth = LAYOUT.width,
  stageHeight = LAYOUT.height,
  label,
  enterFrame = 0,
  children,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = resolveRegisterPalette(register);

  const safeR = clamp(radius, 90, 340);
  const diameter = safeR * 2;
  const safeZoom = clamp(zoom, 1.85, 2.4);

  const reveal = studioSpring(frame, fps, "editorialSnap", enterFrame);
  const opacity = interpolate(frame - enterFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scalePop = 0.88 + 0.12 * reveal;

  if (opacity <= 0.001) return null;

  const bezelColor = palette.bezelHex;
  const isSteelBezel = palette.id === "drafting_blueprint";
  const bezelGradient = isSteelBezel
    ? "linear-gradient(135deg, #BFD3E6 0%, #7A9BB8 45%, #3B5B78 78%, #A8C2DA 100%)"
    : "linear-gradient(135deg, #E2C68D 0%, #B08D57 46%, #6E5229 80%, #CFAF72 100%)";

  // Magnified coordinate lock: translate(R, R) scale(M) translate(-x, -y)
  const innerTransform = `translate3d(${safeR}px, ${safeR}px, 0) scale(${safeZoom}) translate3d(${-x}px, ${-y}px, 0)`;

  return (
    <>
      {dimExterior && (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(12, 16, 22, ${(0.18 * opacity).toFixed(3)})`,
            backdropFilter: `blur(${(3.2 * opacity).toFixed(2)}px)`,
            WebkitBackdropFilter: `blur(${(3.2 * opacity).toFixed(2)}px)`,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        className={className}
        style={{
          position: "absolute",
          left: x - safeR,
          top: y - safeR,
          width: diameter,
          height: diameter,
          opacity,
          transform: `scale(${scalePop.toFixed(4)})`,
          transformOrigin: "50% 50%",
          pointerEvents: "none",
          ...style,
        }}
      >
        {/* Brushed Brass / Brushed Steel Outer Bezel */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            padding: "4px",
            background: bezelGradient,
            boxShadow: `0 28px 56px rgba(8, 10, 14, 0.42), 0 8px 18px rgba(8, 10, 14, 0.26), 0 0 0 1px ${bezelColor}`,
          }}
        >
          {/* Clipped Optical Lens Interior */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: palette.bg.elevated,
            }}
          >
            {/* Cloned Scene Subtree at M in [1.85x..2.4x] */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: stageWidth,
                height: stageHeight,
                transformOrigin: "0 0",
                transform: innerTransform,
              }}
            >
              {children}
            </div>

            {/* Achromatic Warm/Cool Dispersion Rim + Crescent Specular Reflection */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                boxShadow:
                  "inset 1.5px 1.5px 0 rgba(255, 214, 158, 0.34), inset -1.5px -1.5px 0 rgba(142, 196, 238, 0.34), inset 0 0 22px rgba(12, 16, 22, 0.18)",
                background:
                  "linear-gradient(135deg, rgba(255, 250, 240, 0.15) 0%, rgba(255, 250, 240, 0.04) 28%, transparent 52%, rgba(191, 214, 234, 0.08) 100%)",
              }}
            />

            {/* Precision Reticle Ticks at 12 / 3 / 6 / 9 o'clock */}
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${diameter} ${diameter}`}
              style={{ position: "absolute", inset: 0 }}
            >
              <line
                x1={safeR}
                y1={6}
                x2={safeR}
                y2={16}
                stroke={palette.ink.muted}
                strokeWidth={1.2}
                opacity={0.55}
              />
              <line
                x1={safeR}
                y1={diameter - 16}
                x2={safeR}
                y2={diameter - 6}
                stroke={palette.ink.muted}
                strokeWidth={1.2}
                opacity={0.55}
              />
              <line
                x1={6}
                y1={safeR}
                x2={16}
                y2={safeR}
                stroke={palette.ink.muted}
                strokeWidth={1.2}
                opacity={0.55}
              />
              <line
                x1={diameter - 16}
                y1={safeR}
                x2={diameter - 6}
                y2={safeR}
                stroke={palette.ink.muted}
                strokeWidth={1.2}
                opacity={0.55}
              />
            </svg>
          </div>
        </div>

        {/* Optional Magnification Tag */}
        {label && (
          <div
            style={{
              position: "absolute",
              bottom: -14,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "3px 10px",
              borderRadius: "999px",
              backgroundColor: palette.bg.elevated,
              border: `1px solid ${bezelColor}`,
              color: palette.ink.primary,
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(8, 10, 14, 0.25)",
              ...TABULAR_NUM_STYLE,
            }}
          >
            {label} · {safeZoom.toFixed(2)}x
          </div>
        )}
      </div>
    </>
  );
};

// ============================================================================
// 3. Chisel-Nib Felt Highlighter (<HighlighterStroke>)
// ============================================================================

export interface HighlighterStrokeProps {
  width: number;
  height?: number;
  /** Normalized sweep progress in [0, 1] */
  progress: number;
  color?: string;
  register?: RegisterId | RegisterPalette;
  blendMode?: "multiply" | "screen" | "normal";
  seed?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const HighlighterStroke: React.FC<HighlighterStrokeProps> = ({
  width,
  height = 34,
  progress,
  color,
  register = "page_editorial",
  blendMode,
  seed = 42,
  style,
  className,
}) => {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "_");
  const filterId = `rr-felt-nib-${reactId}-${seed}`;
  const palette = resolveRegisterPalette(register);

  const clampedP = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
  if (clampedP <= 0.002 || width <= 2) return null;

  const resolvedColor = color ?? palette.accent.highlighterWash;
  const resolvedBlend = blendMode ?? palette.accent.highlighterBlend;

  const padX = 10;
  const padY = 8;
  const svgW = Math.max(16, Math.round(width + padX * 2));
  const svgH = Math.max(16, Math.round(height + padY * 2));
  const midY = svgH * 0.52;

  // Build 7-segment organic wrist-arc path with deterministic @remotion/noise wobble
  const segments = 6;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const px = padX + u * width;
    const wristArc = -1.8 * Math.sin(Math.PI * u);
    const nibWobble = noise2D("nib", i * 0.35, seed) * 1.4;
    pts.push([px, midY + wristArc + nibWobble]);
  }

  let pathD = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cx = ((prev[0] + curr[0]) * 0.5).toFixed(2);
    const cy = ((prev[1] + curr[1]) * 0.5).toFixed(2);
    pathD += ` Q ${prev[0].toFixed(2)} ${prev[1].toFixed(2)} ${cx} ${cy}`;
  }
  const lastPt = pts[pts.length - 1];
  pathD += ` L ${lastPt[0].toFixed(2)} ${lastPt[1].toFixed(2)}`;

  const evolved = evolvePath(clampedP, pathD);

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      className={className}
      style={{
        display: "block",
        overflow: "visible",
        mixBlendMode: resolvedBlend,
        pointerEvents: "none",
        ...style,
      }}
    >
      <defs>
        <filter id={filterId} x="-8%" y="-20%" width="116%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={seed}
            result="paperFiber"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="paperFiber"
            scale={1.5}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Chisel-nib 14-degree beveled felt stroke */}
      <g transform={`skewX(-14)`} style={{ transformOrigin: `${svgW / 2}px ${midY}px` }}>
        <path
          d={pathD}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={height * 0.88}
          strokeLinecap="butt"
          strokeLinejoin="round"
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
          filter={`url(#${filterId})`}
        />
        {/* Subtle wet-edge capillary pooling along lower nib edge */}
        <path
          d={pathD}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={Math.max(2, height * 0.14)}
          strokeLinecap="butt"
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
          transform={`translate(0, ${(height * 0.36).toFixed(1)})`}
          opacity={0.45}
        />
      </g>
    </svg>
  );
};

// ============================================================================
// 4. Six-Plane Atmospheric Compositing Stack (<ReadingRoomStage>)
// ============================================================================

export interface ReadingRoomStageProps {
  register?: RegisterId | RegisterPalette;
  /** Optional source register for 18-frame perceptual OKLCH RegisterBridge cross-dissolve */
  transitionFromRegister?: RegisterId | RegisterPalette;
  transitionStartFrame?: number;
  transitionDurationFrames?: number;
  folioLabel?: string;
  chapterTitle?: string;
  sourceCitation?: string;
  cameraMove?: CameraMovePreset | CameraRigMoveSpec;
  showChrome?: boolean;
  showGrid?: boolean;
  showGrain?: boolean;
  showVignette?: boolean;
  backgroundPlane?: React.ReactNode;
  foregroundPlane?: React.ReactNode;
  loupeOverlay?: React.ReactNode;
  highlighterOverlay?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const RegisterSubstrateGrid: React.FC<{
  palette: RegisterPalette;
  panX: number;
  panY: number;
}> = ({ palette, panX, panY }) => {
  // Plane 1 moves at 0.94x camera pan parallax
  const gx = (-panX * 0.94).toFixed(2);
  const gy = (-panY * 0.94).toFixed(2);
  const regId = palette.id;

  if (regId === "archival_parchment") {
    return (
      <div
        style={{
          position: "absolute",
          inset: "-96px",
          transform: `translate3d(${gx}px, ${gy}px, 0)`,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, ${palette.rule.hairline} 1px, transparent 1px)`,
            backgroundSize: "100% 48px",
            opacity: 0.28,
          }}
        />
        {/* Double vertical accounting margin rules at x = 96px & x = 101px (offset by +96px inset) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 192,
            width: "1px",
            backgroundColor: palette.accent.liability,
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 197,
            width: "1px",
            backgroundColor: palette.accent.liability,
            opacity: 0.2,
          }}
        />
      </div>
    );
  }

  if (regId === "midnight_telemetry") {
    const patternId = "rr-telemetry-reticle-120";
    return (
      <svg
        style={{
          position: "absolute",
          left: -120,
          top: -120,
          width: LAYOUT.width + 240,
          height: LAYOUT.height + 240,
          transform: `translate3d(${gx}px, ${gy}px, 0)`,
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id={patternId}
            width={120}
            height={120}
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke={palette.rule.hairline}
              strokeWidth={1}
              opacity={0.75}
            />
            <path
              d="M -3.5 0 L 3.5 0 M 0 -3.5 L 0 3.5"
              stroke={palette.rule.oxford}
              strokeWidth={1.1}
              opacity={0.48}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    );
  }

  if (regId === "drafting_blueprint") {
    return (
      <div
        style={{
          position: "absolute",
          inset: "-120px",
          transform: `translate3d(${gx}px, ${gy}px, 0)`,
          pointerEvents: "none",
        }}
      >
        {/* 24px minor architectural grid + 120px major cyanotype grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, ${palette.rule.oxford} 1px, transparent 1px),
              linear-gradient(to bottom, ${palette.rule.oxford} 1px, transparent 1px),
              linear-gradient(to right, ${palette.rule.hairline} 1px, transparent 1px),
              linear-gradient(to bottom, ${palette.rule.hairline} 1px, transparent 1px)
            `,
            backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
            opacity: 0.62,
          }}
        />
        {/* Outer 96px blueprint frame witness border with 6px millimeter ticks */}
        <div
          style={{
            position: "absolute",
            left: 120 + LAYOUT.safeMargin,
            top: 120 + LAYOUT.mastheadRuleY,
            width: LAYOUT.width - LAYOUT.safeMargin * 2,
            height: LAYOUT.citationBaselineY - LAYOUT.mastheadRuleY - 16,
            border: `1px solid ${palette.rule.oxford}`,
            opacity: 0.55,
          }}
        />
      </div>
    );
  }

  if (regId === "vintage_newsreel") {
    return (
      <div
        style={{
          position: "absolute",
          inset: "-80px",
          transform: `translate3d(${gx}px, ${gy}px, 0)`,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(to right, ${palette.rule.hairline} 1px, transparent 1px),
            linear-gradient(to bottom, ${palette.rule.hairline} 1px, transparent 1px)
          `,
          backgroundSize: "96px 96px",
          opacity: 0.36,
        }}
      />
    );
  }

  // Default: page_editorial milk-paper coordinate grid
  return (
    <div
      style={{
        position: "absolute",
        inset: "-80px",
        transform: `translate3d(${gx}px, ${gy}px, 0)`,
        pointerEvents: "none",
        backgroundImage: `
          linear-gradient(to right, ${palette.rule.hairline} 1px, transparent 1px),
          linear-gradient(to bottom, ${palette.rule.hairline} 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        opacity: 0.52,
      }}
    />
  );
};

export const ReadingRoomStage: React.FC<ReadingRoomStageProps> = ({
  register = REGISTERS.page_editorial,
  transitionFromRegister,
  transitionStartFrame = 0,
  transitionDurationFrames = 18,
  folioLabel,
  chapterTitle,
  sourceCitation,
  cameraMove = "dolly-creep",
  showChrome = true,
  showGrid = true,
  showGrain = true,
  showVignette = true,
  backgroundPlane,
  foregroundPlane,
  loupeOverlay,
  highlighterOverlay,
  children,
  style,
  className,
}) => {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "_");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const targetPalette = resolveRegisterPalette(register);
  const bridgeProgress = transitionFromRegister
    ? interpolate(
        frame,
        [
          transitionStartFrame,
          transitionStartFrame + Math.max(1, transitionDurationFrames),
        ],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  const palette = transitionFromRegister
    ? interpolateRegisterOKLCH(
        transitionFromRegister,
        targetPalette,
        bridgeProgress
      )
    : targetPalette;

  // Compute camera pan for Plane 1 (0.94x substrate grid parallax)
  const moveSpec = normalizeMoveSpec(cameraMove);
  const pFrom =
    moveSpec.panFrom ??
    (moveSpec.preset === "pan-ledger-right"
      ? [-28, 0]
      : moveSpec.preset === "pan-ledger-left"
      ? [28, 0]
      : [0, 0]);
  const pTo =
    moveSpec.panTo ??
    (moveSpec.preset === "pan-ledger-right"
      ? [28, 0]
      : moveSpec.preset === "pan-ledger-left"
      ? [-28, 0]
      : [0, 0]);
  const panGlide =
    pFrom[0] !== pTo[0] || pFrom[1] !== pTo[1]
      ? fluidCameraSpring(frame, fps, 0)
      : 0;
  const stagePanX = pFrom[0] + (pTo[0] - pFrom[0]) * panGlide;
  const stagePanY = pFrom[1] + (pTo[1] - pFrom[1]) * panGlide;

  // Masthead hairline draw (+0f inkSweep) and folio fade (+3f editorialSnap)
  const ruleSweep = studioSpring(frame, fps, "inkSweep", 0);
  const chromeOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stepped 2-frame 16mm monochrome grain seed (holds on 2s for VP9/AV1 preservation)
  const grainSeed = (Math.floor(frame / 2) * 37) % 997;
  const grainFilterId = `rr-grain-16mm-${reactId}`;

  const hasHeader = Boolean(showChrome && (chapterTitle || folioLabel));
  const hasFooter = Boolean(showChrome && sourceCitation);

  return (
    <AbsoluteFill
      className={className}
      style={{
        backgroundColor: palette.bg.canvas,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* PLANE 0: Substrate Illumination (Tungsten Lamp Key-Light) */}
      <AbsoluteFill
        style={{
          background: palette.isDark
            ? "radial-gradient(115% 90% at 50% 40%, rgba(255, 250, 240, 0.045) 0%, transparent 72%)"
            : "radial-gradient(115% 90% at 50% 40%, rgba(255, 252, 245, 0.55) 0%, transparent 74%)",
          pointerEvents: "none",
        }}
      />

      {/* PLANE 1: Register Gridlines at 0.94x Camera Pan Parallax */}
      {showGrid && (
        <RegisterSubstrateGrid
          palette={palette}
          panX={stagePanX}
          panY={stagePanY}
        />
      )}

      {/* PLANE 2: 2.5D Camera Rig & Three Depth Planes */}
      <CameraRig25D
        move={cameraMove}
        backgroundPlane={backgroundPlane}
        foregroundPlane={foregroundPlane}
      >
        {children}
      </CameraRig25D>

      {/* Invariant Editorial Skeleton: Masthead Folio Header (y=44), 1px Rule (y=76), Citation Footer (y=1036) */}
      {hasHeader && (
        <div
          style={{
            position: "absolute",
            left: LAYOUT.safeMargin,
            right: LAYOUT.safeMargin,
            top: LAYOUT.mastheadY,
            opacity: chromeOpacity,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: 1.2,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                color: palette.ink.secondary,
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
                  lineHeight: 1.2,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: palette.ink.muted,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {folioLabel}
              </span>
            )}
          </div>

          {/* 1px Masthead Hairline Divider at y = 76px */}
          <div
            style={{
              marginTop: "15px",
              width: "100%",
              height: "1px",
              backgroundColor: palette.rule.hairline,
              transform: `scaleX(${clamp(ruleSweep, 0, 1).toFixed(4)})`,
              transformOrigin: "0% 50%",
            }}
          />
        </div>
      )}

      {hasFooter && (
        <div
          style={{
            position: "absolute",
            left: LAYOUT.safeMargin,
            right: LAYOUT.safeMargin,
            top: LAYOUT.citationBaselineY - 14,
            opacity: chromeOpacity,
            display: "flex",
            alignItems: "baseline",
            gap: "6px",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "13.5px",
              fontWeight: 500,
              color: palette.ink.muted,
            }}
          >
            §
          </span>
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: "13.5px",
              fontWeight: 400,
              lineHeight: 1.3,
              letterSpacing: "0.01em",
              color: palette.ink.muted,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {sourceCitation}
          </span>
        </div>
      )}

      {/* PLANE 3: Optional Achromatic Optical Loupe */}
      {loupeOverlay}

      {/* PLANE 4: Optional Chisel-Nib Ink Highlighter Layer */}
      {highlighterOverlay}

      {/* PLANE 5A: cos^4(theta) Natural Optical Vignette */}
      {showVignette && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 82% 78% at 50% 48%, transparent 46%, ${palette.vignetteRgba} 100%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* PLANE 5B: Stepped 2-Frame 16mm Monochrome Celluloid Grain (~0.03 Opacity) */}
      {showGrain && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: palette.grainOpacity,
            mixBlendMode: palette.isDark ? "overlay" : "multiply",
            pointerEvents: "none",
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
      )}
    </AbsoluteFill>
  );
};
