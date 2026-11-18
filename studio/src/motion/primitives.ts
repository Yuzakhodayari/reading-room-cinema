import { CSSProperties } from "react";
import { Easing, interpolate, spring, SpringConfig } from "remotion";
import {
  buoyancyHarmonics,
  clamp01,
  clampRange,
  conveyorRatchet,
  criticallyDampedSpring,
  dampedPendulum,
  deterministicHashSigned,
  deterministicSignal1D,
  dominoCascade,
  elasticCableSnap,
  gearInterlock,
  guillotineDrop,
  hydraulicPressCurve,
  origamiFold3D,
  pneumaticStamp,
  radarSweep,
  seismicShockwave,
  solariFlapStepper,
  staggerDelayFrames,
} from "./physicsModels";

export {
  buoyancyHarmonics,
  clamp01,
  clampRange,
  conveyorRatchet,
  criticallyDampedSpring,
  dampedPendulum,
  deterministicHashSigned,
  deterministicSignal1D,
  dominoCascade,
  elasticCableSnap,
  gearInterlock,
  guillotineDrop,
  hydraulicPressCurve,
  origamiFold3D,
  pneumaticStamp,
  radarSweep,
  seismicShockwave,
  solariFlapStepper,
  staggerDelayFrames,
};

// ============================================================================
// 1. Canonical Action Inventories (58 Entries + 42 Exits + 98 In-Place + 36 Camera = 234)
// ============================================================================

export const ENTRY_ACTIONS = [
  // Preserved legacy 21 entry primitives (exact order & behavior)
  "pop-out",
  "elastic-open",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "whip-slide",
  "curtain-wipe",
  "iris-reveal",
  "paper-unfold",
  "flip-x",
  "flip-y",
  "stamp-slam",
  "blur-snap",
  "zoom-burst",
  "shutter-flash",
  "bounce-drop",
  "skew-wipe",
  "accordion-unfold",
  "rubber-snap",
  "zoom-punch",
  // Mechanical & Hydraulic Entries (13)
  "hydraulic-press-down",
  "hydraulic-lift-up",
  "pneumatic-stamp-in",
  "pneumatic-lock-left",
  "pneumatic-lock-right",
  "guillotine-drop",
  "vault-door-swing",
  "solari-flap-cascade",
  "gantry-lower",
  "ratchet-step-in",
  "piston-thrust",
  "turnstile-spin-in",
  "scale-beam-drop",
  // Archival, Legal & Paper Entries (12)
  "origami-valley-unfold",
  "origami-mountain-unfold",
  "origami-diagonal-unfold",
  "dossier-slide-desk",
  "microfilm-snap",
  "blueprint-unroll-x",
  "blueprint-unroll-y",
  "wax-seal-press",
  "notary-emboss",
  "ledger-page-turn",
  "redaction-bar-reveal",
  "laser-etch-wipe",
  // 3D Optical, Signal & Data Entries (12)
  "receipt-feed-up",
  "carbon-copy-peel",
  "hinge-drop-top",
  "hinge-swing-left",
  "isometric-rise",
  "orthographic-extrude",
  "loupe-pop-focus",
  "prism-refract-in",
  "card-deal-arc",
  "radar-sweep-reveal",
  "crt-beam-open",
  "sonar-ping-appear",
] as const;

export type EntryAction = (typeof ENTRY_ACTIONS)[number];

export const EXIT_ACTIONS = [
  // Preserved legacy 12 exit primitives (exact order & behavior)
  "fade-out",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "pop-down",
  "blur-fade",
  "curtain-close",
  "iris-close",
  "fade-blur-out",
  "skew-wipe",
  "zoom-punch",
  // Physical & Mechanical Exits (15)
  "shatter-voronoi",
  "paper-tear-split",
  "guillotine-sever",
  "trapdoor-drop",
  "sink-underwater",
  "incinerate-ash-edge",
  "shredder-strip-down",
  "domino-topple-out",
  "cable-snap-recoil",
  "vacuum-collapse",
  "hydraulic-retract",
  "hydraulic-crush-out",
  "pendulum-swing-off",
  "magnet-pull-off",
  "conveyor-carry-right",
  // Editorial, Archival & Optical Exits (15)
  "origami-fold-away",
  "solari-flip-blank",
  "dossier-close-fold",
  "microfilm-whip-next",
  "crt-line-collapse",
  "defocus-bokeh-out",
  "redact-blackout-exit",
  "ink-bleed-dissolve",
  "blueprint-roll-tight",
  "depth-recede-behind",
  "split-barn-doors",
  "stamp-void-dismiss",
  "ticker-scroll-off",
  "radar-fade-decay",
  "glass-evaporate",
] as const;

export type ExitAction = (typeof EXIT_ACTIONS)[number];

export const IN_PLACE_ACTIONS = [
  // Preserved legacy 24 in-place primitives (exact order & behavior)
  "highlight-sweep",
  "underline-draw",
  "circle-telestrator",
  "lens-zoom",
  "tilt-3d",
  "float-idle",
  "pulse-warning",
  "nudge",
  "shake-alert",
  "focus-dim",
  "ken-burns",
  "split-compare",
  "glow-rim",
  "glitch-jitter",
  "card-tilt-3d",
  "spotlight-vignette",
  "split-push-left",
  "split-push-right",
  "parallax-hover",
  "dial-rotate",
  "magnifier-pan",
  "border-trace",
  "orbit-float",
  "card-flip-180",
  // Mechanical & Gauge Physics Loops (20)
  "pendulum-tick-1hz",
  "pendulum-heavy-settle",
  "turbine-spin-rpm",
  "watt-meter-spin",
  "needle-redline-flutter",
  "piston-reciprocate",
  "conveyor-belt-march",
  "conveyor-ratchet-reverse",
  "gear-mesh-cw",
  "gear-mesh-ccw",
  "balance-scale-oscillate",
  "hydraulic-pressure-tremor",
  "check-valve-chatter",
  "gavel-double-tap",
  "solari-digit-flutter",
  "crane-trolley-shuttle",
  "escapement-step-12fps",
  "gyro-gimbal-precess",
  "domino-chain-ripple",
  "cable-tension-hum",
  // Archival, Legal & Editorial Inspection Loops (20)
  "archive-page-breath",
  "loupe-scan-row",
  "caliper-measure-span",
  "red-pen-strike",
  "margin-bracket-draw",
  "footnote-zoom-callout",
  "watermark-shimmer",
  "caustic-edge-sweep",
  "paper-grain-breathe",
  "halftone-pulse",
  "redact-bar-slide",
  "audit-row-step",
  "crosshair-track",
  "bounding-box-lock",
  "split-loupe-ab",
  "stamp-recoil-hold",
  "ink-highlighter-double",
  "notary-seal-glint",
  "microfilm-frame-step",
  "docket-tab-riffle",
  // Fiscal, Household & Verdict Loops (17)
  "capital-flow-dash",
  "yield-spread-widen",
  "debt-clock-blur",
  "sankey-particle-stream",
  "contagion-ripple",
  "vault-drain-vortex",
  "pik-snowball-compound",
  "escrow-mercury-climb",
  "paycheck-erode-pulse",
  "covenant-vice-squeeze",
  "auction-tail-tremor",
  "rollover-wall-lean",
  "scrip-token-flicker",
  "budget-guillotine-hover",
  "veto-ink-slash",
  "balance-sheet-shear",
  "tranche-waterfall-step",
  // Geopolitics, Maritime, Grid & Compute Loops (17)
  "radar-cone-360",
  "sonar-ripple-ring",
  "seabed-current-sway",
  "buoyancy-hull-heave",
  "buoyancy-cargo-slosh",
  "cable-packet-pulse",
  "transformer-hum-60hz",
  "grid-frequency-droop",
  "server-led-blink-seeded",
  "euv-laser-burst",
  "drone-hover-bob",
  "anchor-drag-scrape",
  "blockade-ring-constrict",
  "seismic-aftershock-decay",
  "chokepoint-gate-clamp",
  "gpu-thermal-shimmer",
  "vls-cell-arm-pulse",
] as const;

export type InPlaceAction = (typeof IN_PLACE_ACTIONS)[number];

export const CAMERA_ACTIONS = [
  // Virtual Camera Frustum & Optical Moves (18)
  "camera-dolly-in",
  "camera-dolly-out",
  "camera-truck-left",
  "camera-truck-right",
  "camera-pedestal-up",
  "camera-pedestal-down",
  "camera-whip-pan-left",
  "camera-whip-pan-right",
  "camera-rack-focus-near",
  "camera-rack-focus-far",
  "camera-dutch-tilt-left",
  "camera-dutch-tilt-right",
  "camera-vertigo-contra-zoom",
  "camera-isometric-orbit-cw",
  "camera-isometric-orbit-ccw",
  "camera-macro-table-drift",
  "camera-split-diopter-shift",
  "camera-seismic-jolt",
  // Depth-Sandwich & Physics Trajectories (18)
  "depth-pass-behind-shoulders",
  "depth-emerge-over-shoulder",
  "depth-orbit-presenter",
  "bezier-dock-shoulder-left",
  "bezier-dock-shoulder-right",
  "bezier-dock-bottom-bar",
  "ballistic-lob-arc",
  "parabolic-interceptor-arc",
  "catenary-sag-settle",
  "catenary-cut-whip",
  "spring-tether-pull",
  "buoyancy-surface-bob",
  "subsea-sink-drift",
  "centrifuge-spiral-out",
  "vortex-funnel-in",
  "magnetic-snap-grid",
  "orthographic-explode-layers",
  "orthographic-collapse-stack",
] as const;

export const TRAJECTORY_ACTIONS = CAMERA_ACTIONS;

export type CameraAction = (typeof CAMERA_ACTIONS)[number];
export type TrajectoryAction = CameraAction;

export type MotionAction = EntryAction | ExitAction | InPlaceAction | CameraAction;

const ENTRY_SET = new Set<string>(ENTRY_ACTIONS);
const EXIT_SET = new Set<string>(EXIT_ACTIONS);
const IN_PLACE_SET = new Set<string>(IN_PLACE_ACTIONS);
const CAMERA_SET = new Set<string>(CAMERA_ACTIONS);

export function isEntryAction(action: string): action is EntryAction {
  return ENTRY_SET.has(action);
}

export function isExitAction(action: string): action is ExitAction {
  return EXIT_SET.has(action);
}

export function isInPlaceAction(action: string): action is InPlaceAction {
  return IN_PLACE_SET.has(action);
}

export function isCameraAction(action: string): action is CameraAction {
  return CAMERA_SET.has(action);
}

export function isTrajectoryAction(action: string): action is TrajectoryAction {
  return CAMERA_SET.has(action);
}

export function isMotionAction(action: string): action is MotionAction {
  return (
    ENTRY_SET.has(action) ||
    EXIT_SET.has(action) ||
    IN_PLACE_SET.has(action) ||
    CAMERA_SET.has(action)
  );
}

// ============================================================================
// 2. Transform & Optical Channel Interfaces + Deterministic CSS Compiler
// ============================================================================

export interface ClipInsetBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MotionTransform {
  transform?: string;
  opacity?: number;
  filter?: string;
  clipPath?: string;
  boxShadow?: string;
  transformOrigin?: string;

  // Optional decomposed numeric channels (backward-compatible extension)
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  skewX?: number;
  skewY?: number;
  perspectivePx?: number;
  blurPx?: number;
  brightness?: number;
  contrast?: number;
  grayscalePct?: number;
  clipInset?: ClipInsetBox;
  highlightProgress?: number;
  progress?: number;
}

export interface MotionChannelInput {
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  skewX?: number;
  skewY?: number;
  perspectivePx?: number;
  opacity?: number;
  blurPx?: number;
  brightness?: number;
  contrast?: number;
  grayscalePct?: number;
  clipInset?: ClipInsetBox;
  clipPath?: string;
  boxShadow?: string;
  transformOrigin?: string;
  highlightProgress?: number;
  progress?: number;
}

function safeNum(v: number | undefined, fallback: number): number {
  return v !== undefined && Number.isFinite(v) ? v : fallback;
}

/**
 * Deterministically compiles numeric 2D/3D spatial & optical channels into a
 * valid CSS `MotionTransform` while preserving all structured numeric fields.
 */
export function compileMotionChannels(ch: MotionChannelInput): MotionTransform {
  const out: MotionTransform = {};
  const tParts: string[] = [];

  const tx = ch.translateX !== undefined ? safeNum(ch.translateX, 0) : undefined;
  const ty = ch.translateY !== undefined ? safeNum(ch.translateY, 0) : undefined;
  const tz = ch.translateZ !== undefined ? safeNum(ch.translateZ, 0) : undefined;
  const rot = ch.rotate !== undefined ? safeNum(ch.rotate, 0) : undefined;
  const rx = ch.rotateX !== undefined ? safeNum(ch.rotateX, 0) : undefined;
  const ry = ch.rotateY !== undefined ? safeNum(ch.rotateY, 0) : undefined;
  const skX = ch.skewX !== undefined ? safeNum(ch.skewX, 0) : undefined;
  const skY = ch.skewY !== undefined ? safeNum(ch.skewY, 0) : undefined;
  const sc = ch.scale !== undefined ? safeNum(ch.scale, 1) : undefined;
  const scX = ch.scaleX !== undefined ? safeNum(ch.scaleX, 1) : undefined;
  const scY = ch.scaleY !== undefined ? safeNum(ch.scaleY, 1) : undefined;

  const needs3D =
    (rx !== undefined && Math.abs(rx) > 1e-4) ||
    (ry !== undefined && Math.abs(ry) > 1e-4) ||
    (tz !== undefined && Math.abs(tz) > 1e-4);

  if (needs3D || ch.perspectivePx !== undefined) {
    const persp = Math.max(200, safeNum(ch.perspectivePx, 1100));
    out.perspectivePx = persp;
    tParts.push(`perspective(${Math.round(persp)}px)`);
  }

  if (tx !== undefined || ty !== undefined || tz !== undefined) {
    const xVal = tx ?? 0;
    const yVal = ty ?? 0;
    const zVal = tz ?? 0;
    if (tx !== undefined) out.translateX = xVal;
    if (ty !== undefined) out.translateY = yVal;
    if (tz !== undefined) out.translateZ = zVal;
    tParts.push(
      `translate3d(${xVal.toFixed(2)}px, ${yVal.toFixed(2)}px, ${zVal.toFixed(2)}px)`
    );
  }

  if (rx !== undefined) {
    out.rotateX = rx;
    tParts.push(`rotateX(${rx.toFixed(2)}deg)`);
  }
  if (ry !== undefined) {
    out.rotateY = ry;
    tParts.push(`rotateY(${ry.toFixed(2)}deg)`);
  }
  if (rot !== undefined) {
    out.rotate = rot;
    tParts.push(`rotate(${rot.toFixed(2)}deg)`);
  }
  if (skX !== undefined) {
    out.skewX = skX;
    tParts.push(`skewX(${skX.toFixed(2)}deg)`);
  }
  if (skY !== undefined) {
    out.skewY = skY;
    tParts.push(`skewY(${skY.toFixed(2)}deg)`);
  }

  if (scX !== undefined || scY !== undefined) {
    const base = sc ?? 1;
    const finalX = (scX ?? 1) * base;
    const finalY = (scY ?? 1) * base;
    out.scaleX = finalX;
    out.scaleY = finalY;
    if (sc !== undefined) out.scale = sc;
    tParts.push(`scale(${finalX.toFixed(4)}, ${finalY.toFixed(4)})`);
  } else if (sc !== undefined) {
    out.scale = sc;
    tParts.push(`scale(${sc.toFixed(4)})`);
  }

  if (tParts.length > 0) {
    out.transform = tParts.join(" ");
  }

  if (ch.opacity !== undefined) {
    out.opacity = clamp01(ch.opacity);
  }

  const fParts: string[] = [];
  if (ch.blurPx !== undefined) {
    const b = Math.max(0, safeNum(ch.blurPx, 0));
    out.blurPx = b;
    fParts.push(`blur(${b.toFixed(2)}px)`);
  }
  if (ch.brightness !== undefined) {
    const br = clampRange(safeNum(ch.brightness, 1), 0.1, 2.2);
    out.brightness = br;
    fParts.push(`brightness(${br.toFixed(3)})`);
  }
  if (ch.contrast !== undefined) {
    const ct = clampRange(safeNum(ch.contrast, 1), 0.2, 2.2);
    out.contrast = ct;
    fParts.push(`contrast(${ct.toFixed(3)})`);
  }
  if (ch.grayscalePct !== undefined) {
    const gs = clampRange(safeNum(ch.grayscalePct, 0), 0, 100);
    out.grayscalePct = gs;
    fParts.push(`grayscale(${gs.toFixed(1)}%)`);
  }
  if (fParts.length > 0) {
    out.filter = fParts.join(" ");
  }

  if (ch.clipPath !== undefined) {
    out.clipPath = ch.clipPath;
  } else if (ch.clipInset !== undefined) {
    const top = clampRange(safeNum(ch.clipInset.top, 0), 0, 100);
    const right = clampRange(safeNum(ch.clipInset.right, 0), 0, 100);
    const bottom = clampRange(safeNum(ch.clipInset.bottom, 0), 0, 100);
    const left = clampRange(safeNum(ch.clipInset.left, 0), 0, 100);
    out.clipInset = { top, right, bottom, left };
    out.clipPath = `inset(${top.toFixed(2)}% ${right.toFixed(2)}% ${bottom.toFixed(2)}% ${left.toFixed(2)}%)`;
  }

  if (ch.boxShadow !== undefined) out.boxShadow = ch.boxShadow;
  if (ch.transformOrigin !== undefined) out.transformOrigin = ch.transformOrigin;
  if (ch.highlightProgress !== undefined) {
    out.highlightProgress = clamp01(ch.highlightProgress);
  }
  if (ch.progress !== undefined) {
    out.progress = clamp01(ch.progress);
  }

  return out;
}

/**
 * Standard spring configs for motions (strictly critically-damped on cinema additions)
 */
export const MOTION_SPRINGS: Record<string, SpringConfig> = {
  snappy: { damping: 20, mass: 0.8, stiffness: 140, overshootClamping: true },
  elastic: { damping: 12, mass: 0.7, stiffness: 180, overshootClamping: false },
  slam: { damping: 26, mass: 1.2, stiffness: 160, overshootClamping: true },
  gentle: { damping: 28, mass: 1.0, stiffness: 85, overshootClamping: true },
  nudge: { damping: 14, mass: 0.5, stiffness: 200, overshootClamping: false },
  editorial: { damping: 26, mass: 0.9, stiffness: 135, overshootClamping: true },
  hydraulic: { damping: 34, mass: 1.35, stiffness: 150, overshootClamping: true },
  origami: { damping: 24, mass: 0.85, stiffness: 125, overshootClamping: true },
  camera: { damping: 30, mass: 1.1, stiffness: 92, overshootClamping: true },
  ratchet: { damping: 28, mass: 0.75, stiffness: 190, overshootClamping: true },
  verdict: { damping: 32, mass: 1.25, stiffness: 175, overshootClamping: true },
};

// ============================================================================
// 3. Entry Motion Evaluator (58 Primitives)
// ============================================================================

/**
 * Calculate deterministic transform and filter styles for entry transitions.
 */
export function calcEntryMotion(
  action: EntryAction,
  progress: number // normalized 0.0 -> 1.0
): MotionTransform {
  const p = clamp01(progress);
  const inv = 1 - p;
  const easeOutCubic = 1 - Math.pow(inv, 3);
  const easeOutQuint = 1 - Math.pow(inv, 5);

  switch (action) {
    // --- Legacy 21 Preserved Primitives ---
    case "pop-out":
      return {
        transform: `scale(${0.4 + 0.6 * p})`,
        scale: 0.4 + 0.6 * p,
        opacity: p,
      };
    case "elastic-open": {
      const sc = p < 0.8 ? p * 1.3 : 1 + (1 - p) * 0.2;
      return {
        transform: `scale(${sc})`,
        scale: sc,
        opacity: Math.min(1, p * 2),
      };
    }
    case "slide-left":
      return {
        transform: `translate3d(${inv * 120}px, 0, 0)`,
        translateX: inv * 120,
        opacity: p,
      };
    case "slide-right":
      return {
        transform: `translate3d(${-inv * 120}px, 0, 0)`,
        translateX: -inv * 120,
        opacity: p,
      };
    case "slide-up":
      return {
        transform: `translate3d(0, ${inv * 80}px, 0)`,
        translateY: inv * 80,
        opacity: p,
      };
    case "slide-down":
      return {
        transform: `translate3d(0, ${-inv * 80}px, 0)`,
        translateY: -inv * 80,
        opacity: p,
      };
    case "whip-slide":
      return {
        transform: `translate3d(${inv * 240}px, 0, 0) skewX(${-inv * 12}deg)`,
        translateX: inv * 240,
        skewX: -inv * 12,
        opacity: p,
      };
    case "curtain-wipe":
      return {
        clipPath: `inset(0 ${inv * 100}% 0 0)`,
        clipInset: { top: 0, right: inv * 100, bottom: 0, left: 0 },
        opacity: 1,
      };
    case "iris-reveal":
      return {
        clipPath: `circle(${p * 150}% at 50% 50%)`,
        opacity: 1,
      };
    case "paper-unfold":
      return {
        transform: `perspective(800px) rotateX(${inv * -85}deg) scale(${0.85 + 0.15 * p})`,
        rotateX: inv * -85,
        scale: 0.85 + 0.15 * p,
        perspectivePx: 800,
        opacity: p,
        brightness: 0.7 + 0.3 * p,
        filter: `brightness(${0.7 + 0.3 * p})`,
      };
    case "flip-x":
      return {
        transform: `perspective(600px) rotateX(${inv * 90}deg)`,
        rotateX: inv * 90,
        perspectivePx: 600,
        opacity: p,
      };
    case "flip-y":
      return {
        transform: `perspective(600px) rotateY(${inv * -90}deg)`,
        rotateY: inv * -90,
        perspectivePx: 600,
        opacity: p,
      };
    case "stamp-slam": {
      const slamScale = 1.35 - 0.35 * p;
      const rot = inv * -6;
      return {
        transform: `scale(${slamScale}) rotate(${rot}deg)`,
        scale: slamScale,
        rotate: rot,
        opacity: p,
        blurPx: p < 0.6 ? 1 : 0,
        filter: p < 0.6 ? "blur(1px)" : "blur(0px)",
      };
    }
    case "blur-snap":
      return {
        transform: `scale(${0.92 + 0.08 * p})`,
        scale: 0.92 + 0.08 * p,
        blurPx: inv * 16,
        filter: `blur(${inv * 16}px)`,
        opacity: p,
      };
    case "zoom-burst":
      return {
        transform: `scale(${0.75 + 0.25 * p})`,
        scale: 0.75 + 0.25 * p,
        opacity: p,
      };
    case "shutter-flash": {
      // Soft 4-frame luminance dip & gentle settle (zero harsh white strobe)
      const dipBrightness = 0.86 + 0.14 * p;
      return {
        transform: `scale(${0.97 + 0.03 * p})`,
        scale: 0.97 + 0.03 * p,
        brightness: dipBrightness,
        filter: `brightness(${dipBrightness.toFixed(3)})`,
        opacity: p,
      };
    }
    case "bounce-drop": {
      let y = 0;
      if (p < 0.62) {
        const t = p / 0.62;
        y = -120 * (1 - t * t);
      } else if (p < 0.84) {
        const t = (p - 0.62) / 0.22;
        y = -16 * Math.sin(t * Math.PI);
      } else if (p < 0.999) {
        const t = (p - 0.84) / 0.16;
        y = -5 * Math.sin(t * Math.PI);
      }
      const squash = p < 0.999 ? Math.exp(-Math.pow((p - 0.62) / 0.07, 2)) * 0.06 : 0;
      const scaleY = 1 - squash;
      const scaleX = 1 + squash * 0.7;
      return {
        transform: `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`,
        translateY: y,
        scaleX,
        scaleY,
        opacity: Math.min(1, p * 4),
      };
    }
    case "skew-wipe": {
      const eased = easeOutCubic;
      return {
        clipPath: `inset(0 ${((1 - eased) * 100).toFixed(2)}% 0 0)`,
        clipInset: { top: 0, right: (1 - eased) * 100, bottom: 0, left: 0 },
        transform: `translate3d(${((1 - eased) * 40).toFixed(2)}px, 0, 0) skewX(${((1 - eased) * -14).toFixed(2)}deg)`,
        translateX: (1 - eased) * 40,
        skewX: (1 - eased) * -14,
        opacity: Math.min(1, p * 2.5),
      };
    }
    case "accordion-unfold": {
      const eased = easeOutCubic;
      const insetVal = (1 - eased) * 42;
      const insetY = insetVal.toFixed(2);
      return {
        transform: `perspective(900px) rotateX(${((1 - eased) * 40).toFixed(2)}deg) scaleY(${(0.15 + 0.85 * eased).toFixed(4)})`,
        perspectivePx: 900,
        rotateX: (1 - eased) * 40,
        scaleY: 0.15 + 0.85 * eased,
        clipPath: `inset(${insetY}% 0 ${insetY}% 0)`,
        clipInset: { top: insetVal, right: 0, bottom: insetVal, left: 0 },
        opacity: Math.min(1, p * 2),
      };
    }
    case "rubber-snap": {
      const osc = p >= 0.999 ? 0 : Math.sin(p * Math.PI * 3) * Math.exp(-p * 3.5) * 0.24;
      const baseScale = 0.55 + 0.45 * Math.min(1, p * 1.4);
      const sx = baseScale + osc;
      const sy = baseScale - osc * 0.7;
      return {
        transform: `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`,
        scaleX: sx,
        scaleY: sy,
        opacity: Math.min(1, p * 2.5),
      };
    }
    case "zoom-punch": {
      const eased = easeOutCubic;
      const punchScale = 1.38 - 0.38 * eased;
      const blurPx = (1 - eased) * 8;
      const bright = 1 + (1 - eased) * 0.3;
      return {
        transform: `scale(${punchScale.toFixed(4)})`,
        scale: punchScale,
        blurPx,
        brightness: bright,
        filter: `blur(${blurPx.toFixed(2)}px) brightness(${bright.toFixed(3)})`,
        opacity: Math.min(1, p * 2.5),
      };
    }

    // --- Mechanical & Hydraulic Entries (13) ---
    case "hydraulic-press-down": {
      const st = hydraulicPressCurve(p * 30, 30, {
        startFrame: 0,
        durationFrames: 30,
        strokePx: 140,
        minScaleY: 0.94,
        poissonBulge: 0.04,
      });
      const settle = clamp01((p - 0.82) / 0.18);
      const sy = st.compressionScaleY + (1 - st.compressionScaleY) * settle;
      const sx = st.bulgeScaleX + (1 - st.bulgeScaleX) * settle;
      return compileMotionChannels({
        translateX: st.strainX,
        translateY: -140 + st.displacement,
        scaleX: sx,
        scaleY: sy,
        opacity: clamp01(p * 3.2),
      });
    }
    case "hydraulic-lift-up": {
      const st = hydraulicPressCurve(p * 30, 30, {
        startFrame: 0,
        durationFrames: 30,
        strokePx: 130,
        yieldRatio: 0.52,
        lockRatio: 0.78,
        minScaleY: 0.96,
        poissonBulge: 0.03,
      });
      return compileMotionChannels({
        translateX: st.strainX * 0.6,
        translateY: 130 - st.displacement,
        scaleY: 0.96 + 0.04 * (st.displacement / 130),
        opacity: clamp01(p * 2.8),
      });
    }
    case "pneumatic-stamp-in": {
      const st = pneumaticStamp(p * 18, 30, { startFrame: 0, durationFrames: 18 });
      return compileMotionChannels({
        translateY: st.anvilRecoilY,
        scale: st.scale,
        rotate: st.rotationDeg,
        blurPx: st.blurPx,
        opacity: st.opacity,
      });
    }
    case "pneumatic-lock-left": {
      const st = pneumaticStamp(p * 16, 30, {
        startFrame: 0,
        durationFrames: 16,
        startScale: 1.08,
        initialTiltDeg: -1.8,
      });
      return compileMotionChannels({
        translateX: (1 - easeOutQuint) * 160 + st.anvilRecoilY * 0.8,
        scaleX: st.scale,
        skewX: (1 - easeOutQuint) * -6,
        opacity: clamp01(p * 2.8),
      });
    }
    case "pneumatic-lock-right": {
      const st = pneumaticStamp(p * 16, 30, {
        startFrame: 0,
        durationFrames: 16,
        startScale: 1.08,
        initialTiltDeg: 1.8,
      });
      return compileMotionChannels({
        translateX: -(1 - easeOutQuint) * 160 - st.anvilRecoilY * 0.8,
        scaleX: st.scale,
        skewX: (1 - easeOutQuint) * 6,
        opacity: clamp01(p * 2.8),
      });
    }
    case "guillotine-drop": {
      const st = guillotineDrop(p * 18, 30, {
        startFrame: 0,
        durationFrames: 18,
        dropHeightPx: 220,
        lockRatio: 0.58,
      });
      return compileMotionChannels({
        translateX: st.latchShearX,
        translateY: st.translateY,
        clipInset: { top: 0, right: 0, bottom: (1 - st.clipProgress) * 65, left: 0 },
        opacity: clamp01(p * 4),
      });
    }
    case "vault-door-swing": {
      const sp = criticallyDampedSpring(p * 24, 30, {
        startFrame: 0,
        durationFrames: 24,
        zeta: 1.15,
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateY: (1 - sp.progress) * -78,
        translateZ: -(1 - sp.progress) * 48,
        scale: 0.92 + 0.08 * sp.progress,
        brightness: 0.82 + 0.18 * sp.progress,
        transformOrigin: "left center",
        opacity: clamp01(p * 2.4),
      });
    }
    case "solari-flap-cascade": {
      const st = solariFlapStepper(p * 22, 30, {
        startFrame: 0,
        durationFrames: 22,
        flapCount: 5,
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: st.flapAngleDeg,
        brightness: st.brightness,
        transformOrigin: "center top",
        opacity: clamp01(p * 3.5),
      });
    }
    case "gantry-lower": {
      const sp = criticallyDampedSpring(p * 24, 30, {
        startFrame: 0,
        durationFrames: 24,
        zeta: 1.08,
      });
      const cableSway = p >= 0.999 ? 0 : Math.sin(p * Math.PI * 2.5) * (1 - p) * 2.2;
      return compileMotionChannels({
        translateX: cableSway * 3,
        translateY: -(1 - sp.progress) * 145,
        rotate: cableSway * 0.8,
        opacity: clamp01(p * 2.6),
      });
    }
    case "ratchet-step-in": {
      const steps = 4;
      const st = conveyorRatchet(p * 24, 30, {
        startFrame: 0,
        stepDistancePx: 32,
        stepPeriodFrames: 6,
        maxSteps: steps,
      });
      return compileMotionChannels({
        translateX: -steps * 32 + st.offsetX,
        opacity: clamp01(p * 3),
      });
    }
    case "piston-thrust": {
      const thrust = p < 0.55 ? Math.pow(p / 0.55, 2.2) : 1;
      const recoil =
        p >= 0.55 && p < 0.999
          ? Math.sin(((p - 0.55) / 0.45) * Math.PI * 2) * Math.exp(-(p - 0.55) * 8) * -6
          : 0;
      return compileMotionChannels({
        translateY: (1 - thrust) * 110 + recoil,
        scaleY: 1 + (p >= 0.52 && p < 0.72 ? 0.035 * Math.sin(((p - 0.52) / 0.2) * Math.PI) : 0),
        opacity: clamp01(p * 3.2),
      });
    }
    case "turnstile-spin-in": {
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateY: (1 - easeOutCubic) * 110,
        scale: 0.86 + 0.14 * easeOutCubic,
        opacity: clamp01(p * 2.5),
      });
    }
    case "scale-beam-drop": {
      const pend = dampedPendulum(p * 30, 30, {
        startFrame: 0,
        initialAngleDeg: 14,
        armLengthPx: 45,
        damping: 3.4,
        frequencyHz: 1.8,
      });
      return compileMotionChannels({
        translateY: -(1 - easeOutCubic) * 76 + pend.bobY * (1 - p),
        rotate: pend.angleDeg * (1 - p),
        opacity: clamp01(p * 2.6),
      });
    }

    // --- Archival, Legal & Paper Entries (12) ---
    case "origami-valley-unfold": {
      const st = origamiFold3D(p * 20, 30, {
        startFrame: 0,
        durationFrames: 20,
        creaseMode: "valley",
        direction: "unfold",
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: st.rotateXDeg,
        rotateY: st.rotateYDeg,
        translateZ: st.translateZPx,
        scale: st.scale,
        brightness: st.shadingBrightness,
        clipInset: { top: st.clipInsetPct, right: 0, bottom: st.clipInsetPct * 0.5, left: 0 },
        opacity: clamp01(p * 2.4),
      });
    }
    case "origami-mountain-unfold": {
      const st = origamiFold3D(p * 20, 30, {
        startFrame: 0,
        durationFrames: 20,
        creaseMode: "mountain",
        direction: "unfold",
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: st.rotateXDeg,
        rotateY: st.rotateYDeg,
        translateZ: st.translateZPx,
        scale: st.scale,
        brightness: st.shadingBrightness,
        clipInset: { top: 0, right: st.clipInsetPct * 0.6, bottom: st.clipInsetPct, left: 0 },
        opacity: clamp01(p * 2.4),
      });
    }
    case "origami-diagonal-unfold": {
      const st = origamiFold3D(p * 20, 30, {
        startFrame: 0,
        durationFrames: 20,
        creaseMode: "diagonal",
        direction: "unfold",
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: st.rotateXDeg,
        rotateY: st.rotateYDeg,
        translateZ: st.translateZPx,
        scale: st.scale,
        brightness: st.shadingBrightness,
        clipInset: {
          top: st.clipInsetPct * 0.5,
          right: st.clipInsetPct * 0.5,
          bottom: 0,
          left: 0,
        },
        opacity: clamp01(p * 2.4),
      });
    }
    case "dossier-slide-desk": {
      const friction = 1 - Math.pow(inv, 4);
      return compileMotionChannels({
        translateX: -(1 - friction) * 95,
        translateY: (1 - friction) * 28,
        rotate: (1 - friction) * -3.2,
        opacity: clamp01(p * 2.6),
      });
    }
    case "microfilm-snap": {
      const whip = 1 - Math.pow(inv, 4.5);
      return compileMotionChannels({
        translateX: (1 - whip) * 185,
        blurPx: (1 - whip) * 11,
        contrast: 1 + (1 - whip) * 0.14,
        opacity: clamp01(p * 3),
      });
    }
    case "blueprint-unroll-x": {
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateY: (1 - easeOutCubic) * 18,
        translateX: -(1 - easeOutCubic) * 24,
        clipInset: { top: 0, right: (1 - easeOutCubic) * 100, bottom: 0, left: 0 },
        transformOrigin: "left center",
        opacity: clamp01(p * 3.5),
      });
    }
    case "blueprint-unroll-y": {
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: -(1 - easeOutCubic) * 18,
        translateY: -(1 - easeOutCubic) * 20,
        clipInset: { top: 0, right: 0, bottom: (1 - easeOutCubic) * 100, left: 0 },
        transformOrigin: "center top",
        opacity: clamp01(p * 3.5),
      });
    }
    case "wax-seal-press": {
      const st = pneumaticStamp(p * 18, 30, {
        startFrame: 0,
        durationFrames: 18,
        startScale: 1.24,
        impactRatio: 0.44,
        initialTiltDeg: 3.5,
      });
      return compileMotionChannels({
        scale: st.scale,
        rotate: st.rotationDeg,
        translateY: st.anvilRecoilY * 0.6,
        brightness: 0.92 + 0.08 * p,
        opacity: st.opacity,
      });
    }
    case "notary-emboss": {
      const press = Math.sin(p * Math.PI);
      return compileMotionChannels({
        scale: 0.95 + 0.05 * easeOutCubic - press * 0.018,
        contrast: 1 + press * 0.08,
        brightness: 0.94 + 0.06 * easeOutCubic,
        opacity: clamp01(p * 2.5),
      });
    }
    case "ledger-page-turn": {
      return compileMotionChannels({
        perspectivePx: 1200,
        rotateY: -(1 - easeOutCubic) * 82,
        skewY: (1 - easeOutCubic) * 3.5,
        brightness: 0.84 + 0.16 * easeOutCubic,
        transformOrigin: "left center",
        opacity: clamp01(p * 2.4),
      });
    }
    case "redaction-bar-reveal": {
      return compileMotionChannels({
        clipInset: { top: 0, right: 0, bottom: 0, left: 0 },
        clipPath: `polygon(0% 0%, ${(easeOutQuint * 100).toFixed(2)}% 0%, ${(
          Math.max(0, easeOutQuint * 106 - 6)
        ).toFixed(2)}% 100%, 0% 100%)`,
        translateX: (1 - easeOutQuint) * -14,
        opacity: clamp01(p * 4),
      });
    }
    case "laser-etch-wipe": {
      const sweep = easeOutQuint * 100;
      const lead = Math.min(100, sweep + 4);
      return compileMotionChannels({
        clipPath: `polygon(0% 0%, ${lead.toFixed(2)}% 0%, ${sweep.toFixed(2)}% 100%, 0% 100%)`,
        brightness: 1 + (1 - easeOutQuint) * 0.12,
        opacity: clamp01(p * 4),
      });
    }

    // --- 3D Optical, Signal & Data Entries (12) ---
    case "receipt-feed-up": {
      const st = conveyorRatchet(p * 24, 30, {
        startFrame: 0,
        stepDistancePx: 22,
        stepPeriodFrames: 6,
        maxSteps: 4,
      });
      return compileMotionChannels({
        translateY: 88 - st.offsetX,
        clipInset: { top: (1 - easeOutCubic) * 75, right: 0, bottom: 0, left: 0 },
        opacity: clamp01(p * 3),
      });
    }
    case "carbon-copy-peel": {
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: (1 - easeOutCubic) * 32,
        rotateY: (1 - easeOutCubic) * -18,
        translateY: (1 - easeOutCubic) * -28,
        skewX: (1 - easeOutCubic) * 5,
        opacity: clamp01(p * 2.2),
      });
    }
    case "hinge-drop-top": {
      const sp = criticallyDampedSpring(p * 22, 30, {
        startFrame: 0,
        durationFrames: 22,
        zeta: 1.06,
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: -(1 - sp.progress) * 76,
        transformOrigin: "center top",
        brightness: 0.85 + 0.15 * sp.progress,
        opacity: clamp01(p * 2.5),
      });
    }
    case "hinge-swing-left": {
      const sp = criticallyDampedSpring(p * 22, 30, {
        startFrame: 0,
        durationFrames: 22,
        zeta: 1.06,
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateY: (1 - sp.progress) * 74,
        transformOrigin: "left center",
        brightness: 0.85 + 0.15 * sp.progress,
        opacity: clamp01(p * 2.5),
      });
    }
    case "isometric-rise": {
      return compileMotionChannels({
        perspectivePx: 1100,
        translateY: (1 - easeOutCubic) * 64,
        rotateX: (1 - easeOutCubic) * 28,
        rotate: (1 - easeOutCubic) * -12,
        scale: 0.9 + 0.1 * easeOutCubic,
        opacity: clamp01(p * 2.4),
      });
    }
    case "orthographic-extrude": {
      return compileMotionChannels({
        translateY: (1 - easeOutQuint) * 36,
        scaleY: 0.25 + 0.75 * easeOutQuint,
        scaleX: 0.96 + 0.04 * easeOutQuint,
        transformOrigin: "center bottom",
        opacity: clamp01(p * 2.8),
      });
    }
    case "loupe-pop-focus": {
      return compileMotionChannels({
        scale: 1.18 - 0.18 * easeOutCubic,
        blurPx: (1 - easeOutCubic) * 14,
        contrast: 1 + (1 - easeOutCubic) * 0.1,
        opacity: clamp01(p * 2.4),
      });
    }
    case "prism-refract-in": {
      return compileMotionChannels({
        perspectivePx: 1100,
        translateX: (1 - easeOutCubic) * 32,
        rotateY: (1 - easeOutCubic) * -16,
        skewX: (1 - easeOutCubic) * -7,
        blurPx: (1 - easeOutCubic) * 7,
        brightness: 0.92 + 0.08 * easeOutCubic,
        opacity: clamp01(p * 2.4),
      });
    }
    case "card-deal-arc": {
      const arcY = -36 * 4 * p * (1 - p);
      return compileMotionChannels({
        translateX: -(1 - easeOutCubic) * 190,
        translateY: (1 - easeOutCubic) * 54 + arcY,
        rotate: -(1 - easeOutCubic) * 14,
        scale: 0.92 + 0.08 * easeOutCubic,
        opacity: clamp01(p * 2.8),
      });
    }
    case "radar-sweep-reveal": {
      const radPct = easeOutCubic * 150;
      return compileMotionChannels({
        clipPath: `circle(${radPct.toFixed(2)}% at 0% 50%)`,
        brightness: 0.9 + 0.1 * easeOutCubic,
        opacity: clamp01(p * 3),
      });
    }
    case "crt-beam-open": {
      const hOpen = p < 0.45 ? clamp01(p / 0.45) : 1;
      const vOpen = p < 0.35 ? 0.04 : clamp01(0.04 + ((p - 0.35) / 0.65) * 0.96);
      return compileMotionChannels({
        scaleX: 0.1 + 0.9 * hOpen,
        scaleY: vOpen,
        brightness: 1 + (1 - vOpen) * 0.18,
        opacity: clamp01(p * 4),
      });
    }
    case "sonar-ping-appear": {
      const ring = Math.sin(p * Math.PI);
      return compileMotionChannels({
        scale: 0.82 + 0.18 * easeOutCubic,
        blurPx: (1 - easeOutCubic) * 5,
        boxShadow: `0 0 ${(22 * ring).toFixed(1)}px rgba(47, 143, 139, ${(0.36 * ring).toFixed(3)})`,
        opacity: clamp01(p * 2.5),
      });
    }
    default:
      return { opacity: p };
  }
}

// ============================================================================
// 4. Exit Motion Evaluator (42 Primitives)
// ============================================================================

/**
 * Calculate deterministic transform and filter styles for exit transitions.
 */
export function calcExitMotion(
  action: ExitAction,
  progress: number // normalized 0.0 -> 1.0 (0 = start exit, 1 = fully exited)
): MotionTransform {
  const p = clamp01(progress);
  const remaining = 1 - p;
  const easeInCubic = p * p * p;
  const easeInOut = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  switch (action) {
    // --- Legacy 12 Preserved Primitives ---
    case "fade-out":
      return { opacity: remaining };
    case "slide-left":
      return {
        transform: `translate3d(${-p * 120}px, 0, 0)`,
        translateX: -p * 120,
        opacity: remaining,
      };
    case "slide-right":
      return {
        transform: `translate3d(${p * 120}px, 0, 0)`,
        translateX: p * 120,
        opacity: remaining,
      };
    case "slide-up":
      return {
        transform: `translate3d(0, ${-p * 80}px, 0)`,
        translateY: -p * 80,
        opacity: remaining,
      };
    case "slide-down":
      return {
        transform: `translate3d(0, ${p * 80}px, 0)`,
        translateY: p * 80,
        opacity: remaining,
      };
    case "pop-down":
      return {
        transform: `scale(${1 - p * 0.3})`,
        scale: 1 - p * 0.3,
        opacity: remaining,
      };
    case "blur-fade":
      return {
        blurPx: p * 18,
        filter: `blur(${p * 18}px)`,
        opacity: remaining,
      };
    case "curtain-close":
      return {
        clipPath: `inset(0 0 0 ${p * 100}%)`,
        clipInset: { top: 0, right: 0, bottom: 0, left: p * 100 },
        opacity: 1,
      };
    case "iris-close":
      return {
        clipPath: `circle(${remaining * 150}% at 50% 50%)`,
        opacity: 1,
      };
    case "fade-blur-out":
      return {
        transform: `scale(${(1 - p * 0.08).toFixed(4)}) translate3d(0, ${(-p * 10).toFixed(2)}px, 0)`,
        scale: 1 - p * 0.08,
        translateY: -p * 10,
        blurPx: p * 20,
        filter: `blur(${(p * 20).toFixed(2)}px)`,
        opacity: remaining,
      };
    case "skew-wipe":
      return {
        clipPath: `inset(0 0 0 ${(p * 100).toFixed(2)}%)`,
        clipInset: { top: 0, right: 0, bottom: 0, left: p * 100 },
        transform: `translate3d(${(-p * 40).toFixed(2)}px, 0, 0) skewX(${(p * 14).toFixed(2)}deg)`,
        translateX: -p * 40,
        skewX: p * 14,
        opacity: clamp01(1 - p * 0.4),
      };
    case "zoom-punch":
      return {
        transform: `scale(${(1 + p * 0.35).toFixed(4)})`,
        scale: 1 + p * 0.35,
        blurPx: p * 14,
        filter: `blur(${(p * 14).toFixed(2)}px)`,
        opacity: remaining,
      };

    // --- Physical & Mechanical Exits (15) ---
    case "shatter-voronoi": {
      const spread = p * p;
      const c1 = (spread * 48).toFixed(2);
      const c2 = (100 - spread * 46).toFixed(2);
      return compileMotionChannels({
        perspectivePx: 1100,
        scale: 1 + spread * 0.14,
        rotate: spread * -5.5,
        rotateX: spread * 18,
        blurPx: spread * 6,
        clipPath: `polygon(${c1}% 0%, ${c2}% ${c1}%, 100% ${c2}%, ${c2}% 100%, ${c1}% ${c2}%, 0% ${c1}%)`,
        opacity: clamp01(1 - Math.pow(p, 1.35)),
      });
    }
    case "paper-tear-split": {
      const tear = easeInOut * 50;
      const jag = Math.sin(p * Math.PI * 6) * 2.5 * p;
      return compileMotionChannels({
        translateY: p * 28,
        rotate: p * -3.8,
        skewX: jag,
        clipInset: { top: 0, right: tear, bottom: 0, left: tear * 0.6 },
        opacity: clamp01(1 - Math.pow(p, 1.5)),
      });
    }
    case "guillotine-sever": {
      const cut = clamp01(Math.pow(p, 1.8) * 1.15) * 100;
      const drop = p > 0.35 ? Math.pow((p - 0.35) / 0.65, 2) * 165 : 0;
      return compileMotionChannels({
        translateY: drop,
        skewY: p * -4.2,
        clipInset: { top: cut, right: 0, bottom: 0, left: 0 },
        opacity: clamp01(1 - Math.pow(p, 1.7)),
      });
    }
    case "trapdoor-drop": {
      const fall = p * p;
      return compileMotionChannels({
        perspectivePx: 1100,
        translateY: fall * 240,
        rotateX: -fall * 58,
        scale: 1 - fall * 0.12,
        transformOrigin: "center top",
        opacity: clamp01(1 - Math.pow(p, 1.5)),
      });
    }
    case "sink-underwater": {
      const sway = Math.sin(p * Math.PI * 2.5) * 10 * p;
      return compileMotionChannels({
        translateX: sway,
        translateY: p * 115,
        rotate: Math.sin(p * Math.PI * 2) * 3.5 * p,
        blurPx: p * 9,
        brightness: 1 - p * 0.32,
        opacity: remaining,
      });
    }
    case "incinerate-ash-edge": {
      const ash = easeInOut * 100;
      return compileMotionChannels({
        translateY: -p * 26,
        scale: 1 - p * 0.06,
        brightness: 1 - p * 0.42,
        contrast: 1 + p * 0.25,
        blurPx: p * 4.5,
        clipInset: { top: 0, right: 0, bottom: ash, left: 0 },
        opacity: clamp01(1 - Math.pow(p, 1.4)),
      });
    }
    case "shredder-strip-down": {
      const feed = easeInOut * 150;
      const stripCrop = clampRange(p * 96, 0, 98);
      const jitter = Math.sin(p * Math.PI * 10) * 1.2 * (1 - p);
      return compileMotionChannels({
        translateX: jitter,
        translateY: feed,
        clipPath: `polygon(4% 0%, 96% 0%, ${(100 - stripCrop * 0.35).toFixed(2)}% ${(
          100 - stripCrop
        ).toFixed(2)}%, ${(stripCrop * 0.35).toFixed(2)}% ${(100 - stripCrop).toFixed(2)}%)`,
        opacity: clamp01(1 - Math.pow(p, 1.5)),
      });
    }
    case "domino-topple-out": {
      const st = dominoCascade(p * 24, 30, {
        startFrame: 0,
        durationFrames: 24,
        index: 4,
        count: 5,
        finalAngleDeg: 82,
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        translateX: st.pivotShiftX,
        rotate: st.angleDeg * 0.65,
        rotateX: st.angleDeg * 0.45,
        transformOrigin: "center bottom",
        opacity: clamp01(1 - Math.pow(p, 1.8)),
      });
    }
    case "cable-snap-recoil": {
      const st = elasticCableSnap(p * 24, 30, {
        startFrame: 0,
        durationFrames: 24,
        snapRatio: 0.42,
        pullDistancePx: 38,
      });
      const whipOff = p > 0.42 ? Math.pow((p - 0.42) / 0.58, 2) * 210 : 0;
      return compileMotionChannels({
        translateX: st.displacement + whipOff,
        scaleX: st.stretchScaleX,
        scaleY: st.stretchScaleY,
        skewX: st.whipSkewDeg,
        opacity: p <= 0.42 ? 1 : clamp01(1 - (p - 0.42) / 0.58),
      });
    }
    case "vacuum-collapse": {
      return compileMotionChannels({
        scaleX: Math.max(0.02, 1 - easeInCubic * 0.96),
        scaleY: Math.max(0.02, 1 - Math.pow(p, 2.2) * 0.96),
        rotate: easeInCubic * 14,
        blurPx: easeInCubic * 8,
        opacity: clamp01(1 - Math.pow(p, 1.4)),
      });
    }
    case "hydraulic-retract": {
      const retract = easeInOut;
      return compileMotionChannels({
        translateY: -retract * 155,
        scaleY: 1 - retract * 0.14,
        clipInset: { top: 0, right: 0, bottom: retract * 88, left: 0 },
        opacity: clamp01(1 - Math.pow(p, 1.6)),
      });
    }
    case "hydraulic-crush-out": {
      const st = hydraulicPressCurve(p * 28, 30, {
        startFrame: 0,
        durationFrames: 28,
        strokePx: 48,
        minScaleY: 0.06,
        poissonBulge: 0.22,
      });
      return compileMotionChannels({
        translateX: st.strainX,
        translateY: st.displacement,
        scaleX: st.bulgeScaleX,
        scaleY: st.compressionScaleY,
        transformOrigin: "center bottom",
        opacity: clamp01(1 - Math.pow(p, 1.85)),
      });
    }
    case "pendulum-swing-off": {
      const swing = p * p;
      return compileMotionChannels({
        translateX: swing * 180,
        translateY: swing * 65,
        rotate: -swing * 38,
        transformOrigin: "center top",
        opacity: remaining,
      });
    }
    case "magnet-pull-off": {
      const pull = Math.pow(p, 2.6);
      return compileMotionChannels({
        translateX: -pull * 260,
        scaleX: 1 + pull * 0.18,
        scaleY: 1 - pull * 0.08,
        skewX: pull * 9,
        blurPx: pull * 6,
        opacity: clamp01(1 - Math.pow(p, 1.5)),
      });
    }
    case "conveyor-carry-right": {
      const st = conveyorRatchet(p * 24, 30, {
        startFrame: 0,
        stepDistancePx: 52,
        stepPeriodFrames: 6,
        maxSteps: 4,
      });
      return compileMotionChannels({
        translateX: st.offsetX,
        opacity: remaining,
      });
    }

    // --- Editorial, Archival & Optical Exits (15) ---
    case "origami-fold-away": {
      const st = origamiFold3D(p * 20, 30, {
        startFrame: 0,
        durationFrames: 20,
        creaseMode: "mountain",
        direction: "fold",
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: st.rotateXDeg,
        rotateY: st.rotateYDeg,
        translateZ: st.translateZPx,
        scale: st.scale,
        brightness: st.shadingBrightness,
        clipInset: { top: st.clipInsetPct * 0.6, right: 0, bottom: st.clipInsetPct, left: 0 },
        opacity: clamp01(1 - Math.pow(p, 1.45)),
      });
    }
    case "solari-flip-blank": {
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: p * 88,
        brightness: 1 - p * 0.22,
        transformOrigin: "center bottom",
        opacity: clamp01(1 - Math.pow(p, 1.5)),
      });
    }
    case "dossier-close-fold": {
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateY: easeInOut * -82,
        translateX: -easeInOut * 36,
        brightness: 1 - easeInOut * 0.18,
        transformOrigin: "left center",
        opacity: clamp01(1 - Math.pow(p, 1.5)),
      });
    }
    case "microfilm-whip-next": {
      const whip = Math.pow(p, 2.2);
      return compileMotionChannels({
        translateX: -whip * 240,
        blurPx: whip * 14,
        opacity: remaining,
      });
    }
    case "crt-line-collapse": {
      const vSquash = p < 0.55 ? Math.max(0.03, 1 - (p / 0.55) * 0.97) : 0.03;
      const hSquash = p < 0.55 ? 1 : Math.max(0.02, 1 - ((p - 0.55) / 0.45) * 0.98);
      return compileMotionChannels({
        scaleX: hSquash,
        scaleY: vSquash,
        brightness: 1 + Math.sin(p * Math.PI) * 0.16,
        opacity: clamp01(1 - Math.pow(p, 1.8)),
      });
    }
    case "defocus-bokeh-out": {
      return compileMotionChannels({
        scale: 1 + easeInOut * 0.12,
        blurPx: easeInOut * 24,
        brightness: 1 - easeInOut * 0.08,
        opacity: remaining,
      });
    }
    case "redact-blackout-exit": {
      const wipe = easeInOut * 100;
      return compileMotionChannels({
        brightness: 1 - p * 0.45,
        clipInset: { top: 0, right: wipe, bottom: 0, left: 0 },
        opacity: clamp01(1 - Math.pow(p, 1.7)),
      });
    }
    case "ink-bleed-dissolve": {
      return compileMotionChannels({
        scale: 1 + p * 0.05,
        blurPx: p * 12,
        contrast: 1 + p * 0.22,
        grayscalePct: p * 60,
        opacity: remaining,
      });
    }
    case "blueprint-roll-tight": {
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateY: -easeInOut * 22,
        translateX: -easeInOut * 20,
        clipInset: { top: 0, right: easeInOut * 100, bottom: 0, left: 0 },
        transformOrigin: "left center",
        opacity: clamp01(1 - Math.pow(p, 1.7)),
      });
    }
    case "depth-recede-behind": {
      return compileMotionChannels({
        perspectivePx: 1100,
        translateZ: -easeInOut * 180,
        translateY: easeInOut * 18,
        scale: 1 - easeInOut * 0.22,
        blurPx: easeInOut * 10,
        brightness: 1 - easeInOut * 0.16,
        opacity: remaining,
      });
    }
    case "split-barn-doors": {
      const side = easeInOut * 50;
      return compileMotionChannels({
        scaleX: 1 + p * 0.04,
        clipInset: { top: 0, right: side, bottom: 0, left: side },
        opacity: clamp01(1 - Math.pow(p, 1.8)),
      });
    }
    case "stamp-void-dismiss": {
      return compileMotionChannels({
        translateY: easeInCubic * 70,
        rotate: -easeInOut * 9,
        scale: 1 - easeInOut * 0.16,
        grayscalePct: p * 75,
        opacity: remaining,
      });
    }
    case "ticker-scroll-off": {
      return compileMotionChannels({
        translateX: -p * 220,
        clipInset: { top: 0, right: 0, bottom: 0, left: p * 92 },
        opacity: remaining,
      });
    }
    case "radar-fade-decay": {
      return compileMotionChannels({
        rotate: p * 28,
        scale: 1 - p * 0.08,
        blurPx: p * 7,
        brightness: 1 - p * 0.3,
        opacity: clamp01(Math.exp(-p * 3.4) * remaining),
      });
    }
    case "glass-evaporate": {
      return compileMotionChannels({
        translateY: -easeInOut * 24,
        scale: 1 + easeInOut * 0.06,
        blurPx: easeInOut * 16,
        brightness: 1 + Math.sin(p * Math.PI) * 0.06,
        opacity: remaining,
      });
    }
    default:
      return { opacity: remaining };
  }
}

// ============================================================================
// 5. Camera, Depth-Sandwich & Physics Trajectory Evaluator (36 Primitives)
// ============================================================================

/**
 * Evaluates virtual 2.5D camera frustum moves, presenter depth-sandwich passes,
 * and closed-form ballistic/catenary/buoyancy trajectories.
 */
export function calcCameraMotion(
  action: CameraAction,
  frame: number,
  fps: number = 30,
  actionStartFrame: number = 0,
  actionDuration: number = 60
): MotionTransform {
  const safeFps = Math.max(1, Number.isFinite(fps) && fps > 0 ? fps : 30);
  const safeDur = Math.max(1, Number.isFinite(actionDuration) && actionDuration > 0 ? actionDuration : 60);
  const safeFrame = Number.isFinite(frame) ? frame : 0;
  const safeStart = Number.isFinite(actionStartFrame) ? actionStartFrame : 0;
  const localFrame = Math.max(0, safeFrame - safeStart);
  const p = clamp01(localFrame / safeDur);
  const smooth = interpolate(p, [0, 1], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tSec = localFrame / safeFps;

  switch (action) {
    // --- Virtual Camera Frustum & Optical Moves (18) ---
    case "camera-dolly-in":
      return compileMotionChannels({
        scale: 1 + smooth * 0.085,
        translateY: -smooth * 6,
        progress: p,
      });
    case "camera-dolly-out":
      return compileMotionChannels({
        scale: 1.085 - smooth * 0.085,
        translateY: (1 - smooth) * -6,
        progress: p,
      });
    case "camera-truck-left":
      return compileMotionChannels({
        translateX: -smooth * 56,
        scale: 1.03,
        progress: p,
      });
    case "camera-truck-right":
      return compileMotionChannels({
        translateX: smooth * 56,
        scale: 1.03,
        progress: p,
      });
    case "camera-pedestal-up":
      return compileMotionChannels({
        translateY: -smooth * 44,
        scale: 1.025,
        progress: p,
      });
    case "camera-pedestal-down":
      return compileMotionChannels({
        translateY: smooth * 44,
        scale: 1.025,
        progress: p,
      });
    case "camera-whip-pan-left": {
      const bell = Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateX: -smooth * 140,
        skewX: bell * 9.5,
        blurPx: bell * 6.5,
        progress: p,
      });
    }
    case "camera-whip-pan-right": {
      const bell = Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateX: smooth * 140,
        skewX: -bell * 9.5,
        blurPx: bell * 6.5,
        progress: p,
      });
    }
    case "camera-rack-focus-near":
      return compileMotionChannels({
        scale: 1.04 - smooth * 0.04,
        blurPx: (1 - smooth) * 10,
        contrast: 0.96 + smooth * 0.04,
        progress: p,
      });
    case "camera-rack-focus-far":
      return compileMotionChannels({
        scale: 1 + smooth * 0.035,
        blurPx: smooth * 7.5,
        brightness: 1 - smooth * 0.06,
        progress: p,
      });
    case "camera-dutch-tilt-left":
      return compileMotionChannels({
        rotate: -smooth * 3.6,
        scale: 1 + smooth * 0.04,
        progress: p,
      });
    case "camera-dutch-tilt-right":
      return compileMotionChannels({
        rotate: smooth * 3.6,
        scale: 1 + smooth * 0.04,
        progress: p,
      });
    case "camera-vertigo-contra-zoom":
      return compileMotionChannels({
        perspectivePx: 950,
        translateZ: -smooth * 85,
        scale: 1 + smooth * 0.14,
        rotateX: smooth * 2.4,
        progress: p,
      });
    case "camera-isometric-orbit-cw":
      return compileMotionChannels({
        perspectivePx: 1150,
        rotateX: 14 + Math.cos(p * Math.PI) * 3,
        rotateY: -12 + smooth * 24,
        scale: 0.98 + Math.sin(p * Math.PI) * 0.03,
        progress: p,
      });
    case "camera-isometric-orbit-ccw":
      return compileMotionChannels({
        perspectivePx: 1150,
        rotateX: 14 + Math.cos(p * Math.PI) * 3,
        rotateY: 12 - smooth * 24,
        scale: 0.98 + Math.sin(p * Math.PI) * 0.03,
        progress: p,
      });
    case "camera-macro-table-drift": {
      const driftX = deterministicSignal1D(211, tSec * 0.55) * 14;
      const driftY = deterministicSignal1D(307, tSec * 0.45) * 9;
      return compileMotionChannels({
        perspectivePx: 1100,
        translateX: driftX,
        translateY: driftY,
        rotateX: 6 + Math.sin(tSec * 0.7) * 1.5,
        scale: 1.05,
        progress: p,
      });
    }
    case "camera-split-diopter-shift": {
      const shift = Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateX: (smooth - 0.5) * 28,
        scale: 1 + shift * 0.045,
        contrast: 1 + shift * 0.05,
        progress: p,
      });
    }
    case "camera-seismic-jolt": {
      const st = seismicShockwave(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDur,
        amplitudePx: 12,
        shearAmplitudeDeg: 1.9,
      });
      return compileMotionChannels({
        translateX: st.offsetX,
        translateY: st.offsetY,
        skewX: st.shearDeg,
        scale: 1 + st.scaleJitter,
        progress: p,
      });
    }

    // --- Depth-Sandwich & Physics Trajectories (18) ---
    case "depth-pass-behind-shoulders": {
      const dip = Math.sin(p * Math.PI);
      return compileMotionChannels({
        perspectivePx: 1100,
        translateX: -140 + smooth * 280,
        translateZ: -dip * 90,
        scale: 1 - dip * 0.09,
        blurPx: dip * 2.2,
        brightness: 1 - dip * 0.08,
        progress: p,
      });
    }
    case "depth-emerge-over-shoulder": {
      const sp = criticallyDampedSpring(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDur,
        zeta: 1.1,
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        translateX: (1 - sp.progress) * -72,
        translateY: (1 - sp.progress) * 34,
        translateZ: (1 - sp.progress) * -110,
        scale: 0.86 + 0.14 * sp.progress,
        blurPx: (1 - sp.progress) * 4.5,
        opacity: clamp01(sp.progress * 2.2),
        progress: sp.progress,
      });
    }
    case "depth-orbit-presenter": {
      const theta = p * Math.PI * 2;
      const zMod = (1 - Math.cos(theta)) * 0.5;
      return compileMotionChannels({
        perspectivePx: 1100,
        translateX: Math.sin(theta) * 95,
        translateY: Math.cos(theta * 2) * 12,
        translateZ: -zMod * 80,
        rotateY: -Math.sin(theta) * 14,
        scale: 1 - zMod * 0.08,
        progress: p,
      });
    }
    case "bezier-dock-shoulder-left":
      return compileMotionChannels({
        translateX: -smooth * 210,
        translateY: -smooth * 64 + Math.sin(p * Math.PI) * -18,
        scale: 1 - smooth * 0.16,
        progress: p,
      });
    case "bezier-dock-shoulder-right":
      return compileMotionChannels({
        translateX: smooth * 210,
        translateY: -smooth * 64 + Math.sin(p * Math.PI) * -18,
        scale: 1 - smooth * 0.16,
        progress: p,
      });
    case "bezier-dock-bottom-bar":
      return compileMotionChannels({
        translateY: smooth * 120,
        scale: 1 - smooth * 0.1,
        progress: p,
      });
    case "ballistic-lob-arc": {
      const u = smooth;
      const x = (1 - u) * -140 + u * 0;
      const y = (1 - u) * 40 - 92 * 4 * u * (1 - u);
      const heading = (1 - u) * 12 * Math.cos(u * Math.PI);
      return compileMotionChannels({
        translateX: x,
        translateY: y,
        rotate: heading,
        progress: p,
      });
    }
    case "parabolic-interceptor-arc": {
      const u = Math.pow(p, 0.85);
      const x = (1 - u) * -180;
      const y = (1 - u) * 95 - 110 * 4 * u * (1 - u);
      const dy = -95 - 440 * (1 - 2 * u);
      const angle = (Math.atan2(dy, 180) * 180) / Math.PI * (1 - u);
      return compileMotionChannels({
        translateX: x,
        translateY: y,
        rotate: clampRange(angle, -45, 45),
        progress: p,
      });
    }
    case "catenary-sag-settle": {
      const sag = Math.cosh((p - 0.5) * 2.2) - Math.cosh(1.1);
      const damp = Math.exp(-p * 3.2) * Math.sin(p * Math.PI * 3) * 8;
      return compileMotionChannels({
        translateY: -sag * 24 + damp,
        rotate: Math.cos(p * Math.PI * 3) * Math.exp(-p * 3.5) * 2.2,
        progress: p,
      });
    }
    case "catenary-cut-whip": {
      const st = elasticCableSnap(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDur,
        snapRatio: 0.48,
      });
      return compileMotionChannels({
        translateX: st.displacement,
        scaleX: st.stretchScaleX,
        scaleY: st.stretchScaleY,
        skewX: st.whipSkewDeg,
        progress: p,
      });
    }
    case "spring-tether-pull": {
      const sp = criticallyDampedSpring(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDur,
        zeta: 1.02,
        from: -115,
        to: 0,
      });
      return compileMotionChannels({
        translateX: sp.value,
        scaleX: 1 + Math.abs(sp.velocity) * 0.0004,
        progress: sp.progress,
      });
    }
    case "buoyancy-surface-bob": {
      const b = buoyancyHarmonics(safeFrame, safeFps, {
        startFrame: safeStart,
        heaveAmplitudePx: 7.5,
        surgeAmplitudePx: 4.2,
        rollAmplitudeDeg: 2.1,
      });
      return compileMotionChannels({
        translateX: b.surgeX,
        translateY: b.heaveY,
        rotate: b.rollDeg,
        progress: p,
      });
    }
    case "subsea-sink-drift": {
      const sway = Math.sin(tSec * 1.4) * 9;
      return compileMotionChannels({
        translateX: sway,
        translateY: smooth * 48,
        rotate: Math.cos(tSec * 1.1) * 1.8,
        brightness: 1 - smooth * 0.1,
        progress: p,
      });
    }
    case "centrifuge-spiral-out": {
      const r = smooth * 36;
      const ang = p * Math.PI * 3;
      return compileMotionChannels({
        translateX: Math.cos(ang) * r,
        translateY: Math.sin(ang) * r * 0.55,
        rotate: smooth * 18,
        progress: p,
      });
    }
    case "vortex-funnel-in": {
      const r = (1 - smooth) * 54;
      const ang = p * Math.PI * 4;
      return compileMotionChannels({
        translateX: Math.cos(ang) * r,
        translateY: Math.sin(ang) * r * 0.5 + smooth * 14,
        scale: 0.92 + 0.08 * smooth,
        rotate: (1 - smooth) * -24,
        progress: p,
      });
    }
    case "magnetic-snap-grid": {
      const snap = Math.pow(smooth, 0.55);
      const click = p > 0.82 && p < 0.99 ? Math.sin(((p - 0.82) / 0.17) * Math.PI * 2) * 1.8 : 0;
      return compileMotionChannels({
        translateX: Math.round(((1 - snap) * -64) / 8) * 8 + click,
        translateY: Math.round(((1 - snap) * 32) / 8) * 8,
        progress: p,
      });
    }
    case "orthographic-explode-layers":
      return compileMotionChannels({
        perspectivePx: 1200,
        translateY: -smooth * 28,
        translateZ: smooth * 46,
        rotateX: smooth * 22,
        rotateY: -smooth * 18,
        scale: 1 + smooth * 0.04,
        progress: p,
      });
    case "orthographic-collapse-stack":
      return compileMotionChannels({
        perspectivePx: 1200,
        translateY: (1 - smooth) * -28,
        translateZ: (1 - smooth) * 46,
        rotateX: (1 - smooth) * 22,
        rotateY: -(1 - smooth) * 18,
        scale: 1 + (1 - smooth) * 0.04,
        progress: p,
      });
    default:
      return { progress: p };
  }
}
// ============================================================================
// 6. In-Place, Mechanical & Physics Loop Evaluator (98 Primitives)
// ============================================================================

/**
 * Calculate deterministic in-place continuous or periodic motions.
 */
export function calcInPlaceMotion(
  action: InPlaceAction,
  frame: number,
  fps: number,
  actionStartFrame: number = 0,
  actionDuration: number = 30
): MotionTransform & { highlightProgress?: number; progress?: number } {
  const safeFps = Math.max(1, Number.isFinite(fps) && fps > 0 ? fps : 30);
  const safeDuration = Math.max(
    1,
    Number.isFinite(actionDuration) && actionDuration > 0 ? actionDuration : 1
  );
  const safeFrame = Number.isFinite(frame) ? frame : 0;
  const safeStart = Number.isFinite(actionStartFrame) ? actionStartFrame : 0;
  const localFrame = Math.max(0, safeFrame - safeStart);
  const p = clamp01(localFrame / safeDuration);
  const tSec = safeFrame / safeFps;
  const localSec = localFrame / safeFps;

  switch (action) {
    // --- Legacy 24 Preserved Primitives ---
    case "highlight-sweep": {
      const sweepP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      return { highlightProgress: sweepP, progress: sweepP };
    }
    case "underline-draw": {
      const lineP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      });
      return {
        transform: `scaleX(${lineP})`,
        scaleX: lineP,
        progress: lineP,
      };
    }
    case "circle-telestrator": {
      const strokeP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return { progress: strokeP };
    }
    case "lens-zoom": {
      const zoom = 1 + Math.sin(p * Math.PI) * 0.08;
      return {
        transform: `scale(${zoom})`,
        scale: zoom,
        boxShadow: `0 20px 40px rgba(28,43,58,${0.18 + Math.sin(p * Math.PI) * 0.14})`,
      };
    }
    case "tilt-3d": {
      const rotY = Math.sin(tSec * 1.5) * 6;
      const rotX = Math.cos(tSec * 1.2) * 4;
      return {
        transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        perspectivePx: 1000,
        rotateX: rotX,
        rotateY: rotY,
      };
    }
    case "float-idle": {
      const floatY = Math.sin(tSec * 2.2) * 5;
      return {
        transform: `translate3d(0, ${floatY}px, 0)`,
        translateY: floatY,
      };
    }
    case "pulse-warning": {
      const pulse = 1 + Math.sin(tSec * 6) * 0.025;
      const glowAlpha = 0.24 + Math.sin(tSec * 6) * 0.18;
      return {
        transform: `scale(${pulse})`,
        scale: pulse,
        boxShadow: `0 0 24px rgba(163, 64, 46, ${glowAlpha})`,
      };
    }
    case "nudge": {
      const nudgeY =
        localFrame < safeDuration ? Math.sin((localFrame / safeDuration) * Math.PI) * -8 : 0;
      return {
        transform: `translate3d(0, ${nudgeY}px, 0)`,
        translateY: nudgeY,
      };
    }
    case "shake-alert": {
      const intensity = Math.max(0, 1 - localFrame / safeDuration);
      const shakeX = Math.sin(localFrame * 2.8) * 8 * intensity;
      return {
        transform: `translate3d(${shakeX}px, 0, 0)`,
        translateX: shakeX,
      };
    }
    case "focus-dim": {
      const dimOpacity = interpolate(p, [0, 1], [1, 0.32], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return {
        opacity: dimOpacity,
        grayscalePct: p * 40,
        filter: `grayscale(${p * 40}%)`,
      };
    }
    case "ken-burns": {
      const kbScale = 1.0 + (safeFrame / (safeFps * 10)) * 0.08;
      const kbX = Math.sin(safeFrame * 0.01) * 15;
      return {
        transform: `scale(${kbScale}) translate3d(${kbX}px, 0, 0)`,
        scale: kbScale,
        translateX: kbX,
      };
    }
    case "split-compare":
      return { progress: p };
    case "glow-rim": {
      const glowR = 12 + Math.sin(tSec * 3) * 8;
      return {
        boxShadow: `0 0 ${glowR}px rgba(255, 255, 255, 0.35)`,
      };
    }
    case "glitch-jitter": {
      if (localFrame < safeDuration && localFrame % 3 === 0) {
        const jx = ((localFrame * 37) % 7) - 3;
        const jy = ((localFrame * 53) % 5) - 2;
        return {
          transform: `translate3d(${jx}px, ${jy}px, 0)`,
          translateX: jx,
          translateY: jy,
          filter: `drop-shadow(2px 0 0 rgba(163,64,46,0.55)) drop-shadow(-2px 0 0 rgba(28,43,58,0.45))`,
        };
      }
      return {};
    }
    case "card-tilt-3d": {
      const ramp = Math.min(1, p * 1.5);
      const rx = ramp * (2.5 + Math.cos(tSec * 1.1) * 4.5);
      const ry = ramp * (-4.0 + Math.sin(tSec * 1.3) * 6.5);
      const lift = 1 + ramp * 0.025;
      return {
        transform: `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${lift.toFixed(4)})`,
        perspectivePx: 1200,
        rotateX: rx,
        rotateY: ry,
        scale: lift,
        boxShadow: `${(-ry * 2.2).toFixed(1)}px ${(18 + rx * 2).toFixed(1)}px 48px rgba(28, 43, 58, 0.24)`,
        progress: p,
      };
    }
    case "spotlight-vignette": {
      const easeP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      return {
        transform: `scale(${(1 + easeP * 0.035).toFixed(4)})`,
        scale: 1 + easeP * 0.035,
        brightness: 1 + easeP * 0.06,
        contrast: 1 + easeP * 0.04,
        filter: `brightness(${(1 + easeP * 0.06).toFixed(3)}) contrast(${(1 + easeP * 0.04).toFixed(3)})`,
        boxShadow: `0 24px 64px rgba(15, 25, 35, ${(0.28 * easeP).toFixed(3)}), 0 0 28px rgba(143, 180, 217, ${(0.28 * easeP).toFixed(3)})`,
        progress: easeP,
      };
    }
    case "split-push-left": {
      const easeP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      return {
        transform: `translate3d(${(-easeP * 180).toFixed(2)}px, 0, 0) scale(${(1 - easeP * 0.06).toFixed(4)})`,
        translateX: -easeP * 180,
        scale: 1 - easeP * 0.06,
        progress: easeP,
      };
    }
    case "split-push-right": {
      const easeP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      return {
        transform: `translate3d(${(easeP * 180).toFixed(2)}px, 0, 0) scale(${(1 - easeP * 0.06).toFixed(4)})`,
        translateX: easeP * 180,
        scale: 1 - easeP * 0.06,
        progress: easeP,
      };
    }
    case "parallax-hover": {
      const px = Math.sin(tSec * 1.4) * 8 + Math.cos(tSec * 0.7) * 4;
      const py = Math.cos(tSec * 1.7) * 6 + Math.sin(tSec * 0.9) * 3;
      const rx = Math.sin(tSec * 1.2) * 3.5;
      const ry = Math.cos(tSec * 1.1) * 4.5;
      return {
        transform: `perspective(1000px) translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`,
        perspectivePx: 1000,
        translateX: px,
        translateY: py,
        rotateX: rx,
        rotateY: ry,
        progress: p,
      };
    }
    case "dial-rotate": {
      const easeP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
      return {
        transform: `rotate(${(easeP * 360).toFixed(2)}deg)`,
        rotate: easeP * 360,
        progress: easeP,
      };
    }
    case "magnifier-pan": {
      const env = Math.sin(p * Math.PI);
      const zoom = 1 + env * 0.14;
      const panX = Math.sin(p * Math.PI * 2) * 18 * env;
      const panY = Math.cos(p * Math.PI * 2) * 8 * env;
      return {
        transform: `scale(${zoom.toFixed(4)}) translate3d(${panX.toFixed(2)}px, ${panY.toFixed(2)}px, 0)`,
        scale: zoom,
        translateX: panX,
        translateY: panY,
        contrast: 1 + env * 0.06,
        filter: `contrast(${(1 + env * 0.06).toFixed(3)})`,
        boxShadow: `0 24px 56px rgba(28, 43, 58, ${(0.20 + env * 0.16).toFixed(3)})`,
        progress: p,
      };
    }
    case "border-trace": {
      const traceP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      return {
        boxShadow: `0 0 ${(16 * Math.sin(traceP * Math.PI)).toFixed(1)}px rgba(143, 180, 217, 0.44)`,
        progress: traceP,
      };
    }
    case "orbit-float": {
      const theta = tSec * 1.8;
      const ox = Math.cos(theta) * 9;
      const oy = Math.sin(theta * 2) * 4.5;
      const rot = Math.sin(theta) * 1.4;
      return {
        transform: `translate3d(${ox.toFixed(2)}px, ${oy.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`,
        translateX: ox,
        translateY: oy,
        rotate: rot,
        progress: p,
      };
    }
    case "card-flip-180": {
      const easeP = interpolate(localFrame, [0, safeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
      const lift = 1 + Math.sin(easeP * Math.PI) * 0.08;
      return {
        transform: `perspective(1000px) rotateY(${(easeP * 180).toFixed(2)}deg) scale(${lift.toFixed(4)})`,
        perspectivePx: 1000,
        rotateY: easeP * 180,
        scale: lift,
        progress: easeP,
      };
    }

    // --- Mechanical & Gauge Physics Loops (20) ---
    case "pendulum-tick-1hz": {
      const st = dampedPendulum(safeFrame, safeFps, {
        startFrame: safeStart,
        initialAngleDeg: 10,
        armLengthPx: 54,
        damping: 0,
        frequencyHz: 1.0,
      });
      return compileMotionChannels({
        translateX: st.bobX,
        translateY: st.bobY,
        rotate: st.angleDeg,
        transformOrigin: "center top",
        progress: p,
      });
    }
    case "pendulum-heavy-settle": {
      const st = dampedPendulum(safeFrame, safeFps, {
        startFrame: safeStart,
        initialAngleDeg: 22,
        armLengthPx: 72,
        damping: 1.85,
        frequencyHz: 1.25,
      });
      return compileMotionChannels({
        translateX: st.bobX,
        translateY: st.bobY,
        rotate: st.angleDeg,
        transformOrigin: "center top",
        progress: p,
      });
    }
    case "turbine-spin-rpm":
      return compileMotionChannels({
        rotate: (localSec * 240) % 360,
        progress: p,
      });
    case "watt-meter-spin":
      return compileMotionChannels({
        perspectivePx: 900,
        rotateY: (localSec * 145) % 360,
        rotateX: 18,
        progress: p,
      });
    case "needle-redline-flutter": {
      const flutter = deterministicSignal1D(733, localFrame * 0.9) * 3.8 + Math.sin(localFrame * 1.9) * 2.2;
      return compileMotionChannels({
        rotate: 26 * p + flutter,
        transformOrigin: "center bottom",
        progress: p,
      });
    }
    case "piston-reciprocate": {
      const theta = localSec * Math.PI * 3.6;
      const stroke = Math.cos(theta) * 14 - 0.18 * Math.cos(2 * theta) * 14;
      return compileMotionChannels({
        translateY: stroke,
        scaleY: 1 - Math.sin(theta) * 0.015,
        progress: p,
      });
    }
    case "conveyor-belt-march": {
      const st = conveyorRatchet(safeFrame, safeFps, {
        startFrame: safeStart,
        stepDistancePx: 18,
        stepPeriodFrames: 12,
      });
      return compileMotionChannels({
        translateX: (st.offsetX % 72) - 36,
        progress: p,
      });
    }
    case "conveyor-ratchet-reverse": {
      const st = conveyorRatchet(safeFrame, safeFps, {
        startFrame: safeStart,
        stepDistancePx: 18,
        stepPeriodFrames: 12,
        direction: -1,
      });
      return compileMotionChannels({
        translateX: (st.offsetX % 72) + 36,
        progress: p,
      });
    }
    case "gear-mesh-cw": {
      const st = gearInterlock(safeFrame, safeFps, {
        startFrame: safeStart,
        teethCount: 12,
        stepPeriodFrames: 14,
        direction: 1,
      });
      return compileMotionChannels({
        rotate: st.angleDeg % 360,
        progress: p,
      });
    }
    case "gear-mesh-ccw": {
      const st = gearInterlock(safeFrame, safeFps, {
        startFrame: safeStart,
        teethCount: 12,
        stepPeriodFrames: 14,
        direction: -1,
      });
      return compileMotionChannels({
        rotate: st.angleDeg % 360,
        progress: p,
      });
    }
    case "balance-scale-oscillate": {
      const tilt = Math.sin(localSec * 2.6) * Math.exp(-localSec * 0.65) * 9.5;
      return compileMotionChannels({
        rotate: tilt,
        translateY: Math.abs(tilt) * 0.35,
        progress: p,
      });
    }
    case "hydraulic-pressure-tremor": {
      const st = hydraulicPressCurve(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDuration,
        strokePx: 10,
        minScaleY: 0.96,
        poissonBulge: 0.03,
      });
      return compileMotionChannels({
        translateX: st.strainX * 1.4,
        translateY: st.displacement * 0.4,
        scaleX: st.bulgeScaleX,
        scaleY: st.compressionScaleY,
        progress: p,
      });
    }
    case "check-valve-chatter": {
      const chatter = Math.abs(Math.sin(localFrame * 1.7)) * 4.5 * (1 - p * 0.4);
      return compileMotionChannels({
        translateX: chatter,
        rotate: chatter * 0.4,
        progress: p,
      });
    }
    case "gavel-double-tap": {
      const tap1 = Math.exp(-Math.pow((p - 0.26) / 0.07, 2));
      const tap2 = Math.exp(-Math.pow((p - 0.54) / 0.07, 2));
      const strike = tap1 + tap2 * 1.15;
      return compileMotionChannels({
        translateY: strike * 9,
        rotate: -8 * (1 - p) + strike * 11,
        scale: 1 - strike * 0.025,
        progress: p,
      });
    }
    case "solari-digit-flutter": {
      const st = solariFlapStepper(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDuration,
        flapCount: 6,
      });
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: st.flapAngleDeg * 0.45,
        brightness: st.brightness,
        progress: p,
      });
    }
    case "crane-trolley-shuttle": {
      const shuttle = Math.sin(p * Math.PI * 2) * 34;
      const sway = Math.cos(p * Math.PI * 2) * 2.6;
      return compileMotionChannels({
        translateX: shuttle,
        rotate: sway,
        transformOrigin: "center top",
        progress: p,
      });
    }
    case "escapement-step-12fps": {
      const stepped = Math.floor((localFrame / 2.5)) * 15;
      return compileMotionChannels({
        rotate: stepped % 360,
        progress: p,
      });
    }
    case "gyro-gimbal-precess":
      return compileMotionChannels({
        perspectivePx: 1100,
        rotateX: Math.sin(tSec * 1.9) * 11,
        rotateY: Math.cos(tSec * 1.5) * 14,
        rotate: Math.sin(tSec * 0.8) * 4,
        progress: p,
      });
    case "domino-chain-ripple": {
      const st = dominoCascade(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDuration,
        index: 2,
        count: 5,
        leanAngleDeg: 18,
      });
      return compileMotionChannels({
        translateX: st.pivotShiftX * 0.5,
        rotate: st.angleDeg,
        transformOrigin: "center bottom",
        progress: st.progress,
      });
    }
    case "cable-tension-hum": {
      const humY = Math.sin(localFrame * 2.7) * 2.2 * Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateY: humY,
        scaleX: 1 + Math.sin(p * Math.PI) * 0.03,
        progress: p,
      });
    }

    // --- Archival, Legal & Editorial Inspection Loops (20) ---
    case "archive-page-breath":
      return compileMotionChannels({
        scale: 1 + Math.sin(tSec * 1.2) * 0.008,
        translateY: Math.cos(tSec * 1.1) * 1.8,
        progress: p,
      });
    case "loupe-scan-row": {
      const scanX = (p - 0.5) * 64;
      const lift = Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateX: scanX,
        scale: 1 + lift * 0.09,
        contrast: 1 + lift * 0.05,
        progress: p,
      });
    }
    case "caliper-measure-span": {
      const span = interpolate(p, [0, 0.7, 1], [0.92, 1.04, 1.0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return compileMotionChannels({
        scaleX: span,
        progress: p,
      });
    }
    case "red-pen-strike": {
      const slash = interpolate(p, [0, 0.65, 1], [0, 1, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.18, 0.9, 0.25, 1),
      });
      return compileMotionChannels({
        skewX: -slash * 2.5,
        highlightProgress: slash,
        progress: slash,
      });
    }
    case "margin-bracket-draw":
      return compileMotionChannels({
        translateX: Math.sin(p * Math.PI) * 4,
        highlightProgress: p,
        progress: p,
      });
    case "footnote-zoom-callout": {
      const env = Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateY: -env * 12,
        scale: 1 + env * 0.11,
        boxShadow: `0 18px 44px rgba(28, 43, 58, ${(0.14 + env * 0.16).toFixed(3)})`,
        progress: p,
      });
    }
    case "watermark-shimmer": {
      const glint = 0.96 + Math.sin(tSec * 2.1) * 0.04;
      return compileMotionChannels({
        brightness: glint,
        opacity: 0.92 + Math.sin(tSec * 2.1) * 0.08,
        progress: p,
      });
    }
    case "caustic-edge-sweep": {
      const glow = Math.sin(p * Math.PI);
      return compileMotionChannels({
        brightness: 1 + glow * 0.05,
        boxShadow: `0 0 ${(20 * glow).toFixed(1)}px rgba(143, 180, 217, ${(0.34 * glow).toFixed(3)})`,
        progress: p,
      });
    }
    case "paper-grain-breathe":
      return compileMotionChannels({
        scale: 1 + Math.sin(tSec * 0.95) * 0.006,
        brightness: 0.99 + Math.cos(tSec * 0.95) * 0.015,
        progress: p,
      });
    case "halftone-pulse":
      return compileMotionChannels({
        contrast: 1 + Math.sin(tSec * 2.4) * 0.06,
        scale: 1 + Math.sin(tSec * 2.4) * 0.012,
        progress: p,
      });
    case "redact-bar-slide":
      return compileMotionChannels({
        clipInset: { top: 0, right: (1 - p) * 35, bottom: 0, left: 0 },
        highlightProgress: p,
        progress: p,
      });
    case "audit-row-step": {
      const rowIdx = Math.min(4, Math.floor(p * 5));
      return compileMotionChannels({
        translateY: rowIdx * 6 - 12,
        highlightProgress: p,
        progress: p,
      });
    }
    case "crosshair-track": {
      const cx = deterministicSignal1D(501, tSec * 1.1) * 16;
      const cy = deterministicSignal1D(607, tSec * 1.1) * 10;
      return compileMotionChannels({
        translateX: cx,
        translateY: cy,
        progress: p,
      });
    }
    case "bounding-box-lock": {
      const lock = interpolate(p, [0, 0.5, 1], [1.08, 0.99, 1.0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return compileMotionChannels({
        scale: lock,
        progress: p,
      });
    }
    case "split-loupe-ab":
      return compileMotionChannels({
        translateX: Math.sin(p * Math.PI * 2) * 22,
        contrast: 1.04,
        progress: p,
      });
    case "stamp-recoil-hold": {
      const recoil = Math.exp(-localSec * 5.5) * Math.sin(localSec * 18) * 0.03;
      return compileMotionChannels({
        scale: 1 + recoil,
        rotate: recoil * 18,
        progress: p,
      });
    }
    case "ink-highlighter-double": {
      const pass1 = clamp01(p * 2);
      const pass2 = clamp01((p - 0.5) * 2);
      return compileMotionChannels({
        translateY: pass2 > 0 ? 2 : 0,
        highlightProgress: clamp01(0.6 * pass1 + 0.4 * pass2),
        progress: p,
      });
    }
    case "notary-seal-glint":
      return compileMotionChannels({
        rotate: Math.sin(p * Math.PI) * 2.5,
        brightness: 1 + Math.sin(p * Math.PI) * 0.09,
        progress: p,
      });
    case "microfilm-frame-step": {
      const steppedX = Math.floor(p * 4) * -8;
      return compileMotionChannels({
        translateX: steppedX,
        contrast: 1.05,
        progress: p,
      });
    }
    case "docket-tab-riffle": {
      const riffle = Math.sin(localFrame * 1.6) * (1 - p) * 5;
      return compileMotionChannels({
        perspectivePx: 1000,
        rotateX: riffle,
        translateY: -Math.abs(riffle) * 0.6,
        progress: p,
      });
    }

    // --- Fiscal, Household & Verdict Loops (17) ---
    case "capital-flow-dash": {
      const surge = Math.sin(tSec * 2.8) * 6;
      return compileMotionChannels({
        translateX: surge,
        highlightProgress: p,
        progress: p,
      });
    }
    case "yield-spread-widen": {
      const widen = interpolate(p, [0, 1], [1, 1.12], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
      return compileMotionChannels({
        scaleY: widen,
        progress: p,
      });
    }
    case "debt-clock-blur": {
      const accel = p * p;
      return compileMotionChannels({
        translateY: -Math.sin(localFrame * 1.8) * 2.2 * accel,
        blurPx: accel * 2.4,
        progress: p,
      });
    }
    case "sankey-particle-stream":
      return compileMotionChannels({
        translateX: Math.sin(p * Math.PI) * 8,
        brightness: 1 + Math.sin(tSec * 3.2) * 0.04,
        progress: p,
      });
    case "contagion-ripple": {
      const ripple = Math.sin(tSec * 4.2) * Math.exp(-p * 1.6);
      return compileMotionChannels({
        scale: 1 + ripple * 0.03,
        boxShadow: `0 0 ${(22 * Math.abs(ripple)).toFixed(1)}px rgba(163, 64, 46, ${(
          0.32 * Math.abs(ripple)
        ).toFixed(3)})`,
        progress: p,
      });
    }
    case "vault-drain-vortex":
      return compileMotionChannels({
        translateY: p * 12,
        scale: 1 - p * 0.045,
        rotate: Math.sin(p * Math.PI * 2) * -2.2,
        progress: p,
      });
    case "pik-snowball-compound": {
      const rate = 0.22;
      const growth = (Math.pow(1 + rate, p * 6) - 1) / (Math.pow(1 + rate, 6) - 1);
      return compileMotionChannels({
        scale: 1 + growth * 0.14,
        rotate: growth * 4.5,
        progress: growth,
      });
    }
    case "escrow-mercury-climb": {
      const climb = interpolate(p, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      return compileMotionChannels({
        translateY: -climb * 14,
        scaleY: 1 + climb * 0.05,
        transformOrigin: "center bottom",
        progress: climb,
      });
    }
    case "paycheck-erode-pulse": {
      const shrink = 1 - p * 0.07;
      const throb = Math.sin(tSec * 4.5) * 0.012;
      return compileMotionChannels({
        scaleX: shrink + throb,
        opacity: 0.94 + Math.cos(tSec * 4.5) * 0.06,
        progress: p,
      });
    }
    case "covenant-vice-squeeze": {
      const st = hydraulicPressCurve(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDuration,
        strokePx: 8,
        minScaleY: 0.92,
        poissonBulge: 0.05,
      });
      return compileMotionChannels({
        scaleX: 2 - st.bulgeScaleX,
        scaleY: 1 + (1 - st.compressionScaleY) * 0.4,
        translateX: st.strainX,
        progress: p,
      });
    }
    case "auction-tail-tremor": {
      const tremor = deterministicSignal1D(911, localFrame * 1.1) * 3.5 * Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateX: tremor,
        skewX: tremor * 0.4,
        progress: p,
      });
    }
    case "rollover-wall-lean":
      return compileMotionChannels({
        perspectivePx: 1000,
        rotateX: -p * 9,
        skewX: p * 2.8,
        transformOrigin: "center bottom",
        progress: p,
      });
    case "scrip-token-flicker": {
      const dip = 0.92 + Math.abs(Math.cos(tSec * 3.8)) * 0.08;
      return compileMotionChannels({
        brightness: dip,
        opacity: 0.9 + Math.abs(Math.sin(tSec * 3.8)) * 0.1,
        progress: p,
      });
    }
    case "budget-guillotine-hover": {
      const tensionY = Math.sin(tSec * 5.2) * 2.2 - 4;
      return compileMotionChannels({
        translateY: tensionY,
        progress: p,
      });
    }
    case "veto-ink-slash": {
      const slash = interpolate(p, [0, 0.45, 1], [0, 1, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return compileMotionChannels({
        skewX: -slash * 4,
        translateX: slash * 3,
        highlightProgress: slash,
        progress: slash,
      });
    }
    case "balance-sheet-shear": {
      const shear = Math.sin(p * Math.PI) * 5.5;
      return compileMotionChannels({
        skewY: shear,
        translateY: shear * 1.4,
        progress: p,
      });
    }
    case "tranche-waterfall-step": {
      const tier = Math.min(3, Math.floor(p * 4));
      return compileMotionChannels({
        translateY: tier * 7,
        progress: p,
      });
    }

    // --- Geopolitics, Maritime, Grid & Compute Loops (17) ---
    case "radar-cone-360": {
      const st = radarSweep(safeFrame, safeFps, {
        startFrame: safeStart,
        periodFrames: Math.max(24, safeDuration),
      });
      return compileMotionChannels({
        rotate: st.azimuthDeg,
        brightness: 0.95 + st.pingIntensity * 0.1,
        progress: st.sweepNormalized,
      });
    }
    case "sonar-ripple-ring": {
      const wave = (localFrame % 30) / 30;
      const pulse = Math.sin(wave * Math.PI);
      return compileMotionChannels({
        scale: 1 + wave * 0.04,
        boxShadow: `0 0 ${(26 * pulse).toFixed(1)}px rgba(47, 143, 139, ${(0.35 * pulse).toFixed(3)})`,
        progress: p,
      });
    }
    case "seabed-current-sway":
      return compileMotionChannels({
        translateX: Math.sin(tSec * 1.15) * 6.5,
        skewX: Math.cos(tSec * 1.15) * 2.1,
        progress: p,
      });
    case "buoyancy-hull-heave": {
      const st = buoyancyHarmonics(safeFrame, safeFps, {
        startFrame: safeStart,
        heaveAmplitudePx: 6.8,
        surgeAmplitudePx: 3.4,
        rollAmplitudeDeg: 2.2,
      });
      return compileMotionChannels({
        translateX: st.surgeX,
        translateY: st.heaveY,
        rotate: st.rollDeg,
        progress: p,
      });
    }
    case "buoyancy-cargo-slosh": {
      const st = buoyancyHarmonics(safeFrame, safeFps, {
        startFrame: safeStart,
        heaveAmplitudePx: 4.5,
        sloshTiltDeg: 3.6,
        baseFrequencyHz: 0.72,
      });
      return compileMotionChannels({
        translateY: st.waterlineOffset,
        rotate: st.surfaceTiltDeg,
        skewX: st.surfaceTiltDeg * 0.5,
        progress: p,
      });
    }
    case "cable-packet-pulse": {
      const beat = 0.5 + 0.5 * Math.sin(tSec * 7.5);
      return compileMotionChannels({
        scaleX: 1 + beat * 0.015,
        brightness: 1 + beat * 0.08,
        boxShadow: `0 0 ${(14 * beat).toFixed(1)}px rgba(47, 143, 139, ${(0.32 * beat).toFixed(3)})`,
        progress: p,
      });
    }
    case "transformer-hum-60hz": {
      const buzz = Math.sin(safeFrame * 2.9) * 1.1;
      return compileMotionChannels({
        translateX: buzz,
        scaleY: 1 + Math.cos(safeFrame * 2.9) * 0.006,
        progress: p,
      });
    }
    case "grid-frequency-droop": {
      const droop = Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateY: droop * 10,
        rotate: -droop * 2.4,
        brightness: 1 - droop * 0.09,
        progress: p,
      });
    }
    case "server-led-blink-seeded": {
      const hash = deterministicHashSigned(1337, Math.floor(safeFrame / 3));
      const lit = hash > 0 ? 1.07 : 0.96;
      return compileMotionChannels({
        brightness: lit,
        progress: p,
      });
    }
    case "euv-laser-burst": {
      const burst = Math.pow(0.5 + 0.5 * Math.sin(tSec * 8.0), 4);
      return compileMotionChannels({
        scale: 1 + burst * 0.018,
        brightness: 1 + burst * 0.12,
        contrast: 1 + burst * 0.06,
        progress: p,
      });
    }
    case "drone-hover-bob": {
      const dx = deterministicSignal1D(808, tSec * 1.5) * 5.5;
      const dy = Math.sin(tSec * 2.6) * 4.2;
      return compileMotionChannels({
        translateX: dx,
        translateY: dy,
        rotate: dx * 0.35,
        progress: p,
      });
    }
    case "anchor-drag-scrape": {
      const jerk = Math.abs(deterministicSignal1D(419, localFrame * 0.45)) * 6;
      return compileMotionChannels({
        translateX: p * 26 - jerk,
        rotate: -4 + jerk * 0.5,
        progress: p,
      });
    }
    case "blockade-ring-constrict": {
      const squeeze = 1 - Math.sin(p * Math.PI) * 0.075;
      return compileMotionChannels({
        scale: squeeze,
        rotate: p * 12,
        progress: p,
      });
    }
    case "seismic-aftershock-decay": {
      const st = seismicShockwave(localFrame, safeFps, {
        startFrame: 0,
        durationFrames: safeDuration,
        amplitudePx: 10,
        shearAmplitudeDeg: 1.6,
      });
      return compileMotionChannels({
        translateX: st.offsetX,
        translateY: st.offsetY,
        skewX: st.shearDeg,
        scale: 1 + st.scaleJitter,
        progress: p,
      });
    }
    case "chokepoint-gate-clamp": {
      const clampAmt = Math.sin(p * Math.PI) * 0.08;
      return compileMotionChannels({
        scaleX: 1 - clampAmt,
        scaleY: 1 + clampAmt * 0.35,
        progress: p,
      });
    }
    case "gpu-thermal-shimmer":
      return compileMotionChannels({
        translateY: -Math.abs(Math.sin(tSec * 3.4)) * 2.5,
        skewX: Math.sin(tSec * 5.1) * 0.9,
        brightness: 1 + Math.sin(tSec * 3.4) * 0.04,
        progress: p,
      });
    case "vls-cell-arm-pulse": {
      const arm = Math.sin(p * Math.PI);
      return compileMotionChannels({
        translateY: -arm * 4,
        boxShadow: `0 0 ${(18 * arm).toFixed(1)}px rgba(163, 64, 46, ${(0.36 * arm).toFixed(3)})`,
        progress: p,
      });
    }
    default:
      return {};
  }
}

// ============================================================================
// 7. Timing, Stagger, Reading Hold & Style Composition Helpers
// ============================================================================

/**
 * Deterministic helper to count up a numeric value with formatting.
 */
export function countUpValue(
  frame: number,
  startFrame: number,
  duration: number,
  fromVal: number,
  toVal: number,
  fps: number = 30
): number {
  const safeDuration = Math.max(1, duration);
  const elapsed = Math.max(0, frame - startFrame);
  if (elapsed <= 0) return fromVal;
  if (elapsed >= safeDuration) return toVal;

  const progress = spring({
    frame: elapsed,
    fps,
    config: MOTION_SPRINGS.snappy,
    durationInFrames: safeDuration,
  });

  return fromVal + (toVal - fromVal) * progress;
}

/**
 * Returns stagger offset in frames for child items.
 */
export function staggerOffset(
  index: number,
  gapFrames: number = 3,
  startFrame: number = 0
): number {
  return startFrame + index * gapFrames;
}

/**
 * Progress fill calculation for bars or gauges.
 */
export function progressFill(
  frame: number,
  startFrame: number,
  duration: number
): number {
  const safeDuration = Math.max(1, duration);
  return interpolate(frame, [startFrame, startFrame + safeDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
}

/**
 * Minimum hold frames calculated from Latin/CJK character counts.
 * Formula: letters / 15 + 1.5s
 */
export function readingDuration(text: string, fps: number = 30): number {
  const letters = text.replace(/\s+/g, "").length;
  const seconds = letters / 15 + 1.5;
  return Math.ceil(seconds * fps);
}

/**
 * Holds motion on a stepped FPS grid (e.g. 12 fps stop-motion aesthetic).
 */
export function steppedHold(
  currentFrame: number,
  targetFps: number = 12,
  baseFps: number = 30
): number {
  const safeTarget = Math.max(1, targetFps);
  const safeBase = Math.max(1, baseFps);
  const step = safeBase / safeTarget;
  return Math.floor(currentFrame / step) * step;
}

function hasRawNumericTransform(t: MotionTransform): boolean {
  return (
    t.translateX !== undefined ||
    t.translateY !== undefined ||
    t.translateZ !== undefined ||
    t.scale !== undefined ||
    t.scaleX !== undefined ||
    t.scaleY !== undefined ||
    t.rotate !== undefined ||
    t.rotateX !== undefined ||
    t.rotateY !== undefined ||
    t.skewX !== undefined ||
    t.skewY !== undefined
  );
}

function hasRawNumericFilter(t: MotionTransform): boolean {
  return (
    t.blurPx !== undefined ||
    t.brightness !== undefined ||
    t.contrast !== undefined ||
    t.grayscalePct !== undefined
  );
}

/**
 * Combines multiple MotionTransform objects (either pre-compiled CSS strings or
 * raw numeric 2D/3D/optical channels) into a valid CSSProperties object.
 */
export function combineMotionStyles(
  ...transforms: (MotionTransform | undefined)[]
): CSSProperties {
  const style: CSSProperties = {};
  const transformParts: string[] = [];
  const filterParts: string[] = [];
  let hasOpacity = false;
  let opacityProduct = 1;

  for (let i = 0; i < transforms.length; i++) {
    const t = transforms[i];
    if (!t) continue;

    if (t.transform) {
      transformParts.push(t.transform);
    } else if (hasRawNumericTransform(t)) {
      const compiled = compileMotionChannels(t);
      if (compiled.transform) transformParts.push(compiled.transform);
    }

    if (t.filter) {
      filterParts.push(t.filter);
    } else if (hasRawNumericFilter(t)) {
      const compiled = compileMotionChannels(t);
      if (compiled.filter) filterParts.push(compiled.filter);
    }

    if (t.opacity !== undefined && Number.isFinite(t.opacity)) {
      hasOpacity = true;
      opacityProduct *= clamp01(t.opacity);
    }

    if (t.clipPath !== undefined) {
      style.clipPath = t.clipPath;
    } else if (t.clipInset !== undefined) {
      const compiled = compileMotionChannels({ clipInset: t.clipInset });
      if (compiled.clipPath) style.clipPath = compiled.clipPath;
    }

    if (t.boxShadow !== undefined) style.boxShadow = t.boxShadow;
    if (t.transformOrigin !== undefined) style.transformOrigin = t.transformOrigin;
  }

  if (hasOpacity) {
    style.opacity = clamp01(opacityProduct);
  }
  if (transformParts.length > 0) {
    style.transform = transformParts.join(" ");
  }
  if (filterParts.length > 0) {
    style.filter = filterParts.join(" ");
  }

  return style;
}

// ============================================================================
// 8. Showrunner & 30-Episode Novelty Vault Catalog (234 Primitives)
// ============================================================================

export const MOTION_DOMAIN_TAGS = [
  "fiscal",
  "mechanical",
  "legal",
  "maritime",
  "grid",
  "compute",
  "archival",
  "verdict",
  "household",
  "geopolitics",
] as const;

export type MotionDomainTag = (typeof MOTION_DOMAIN_TAGS)[number];

export const MOTION_PRIMITIVE_KINDS = [
  "entry",
  "exit",
  "in-place",
  "camera",
] as const;

export type MotionPrimitiveKind = (typeof MOTION_PRIMITIVE_KINDS)[number];

export const MOTION_INTENSITIES = [
  "subtle",
  "moderate",
  "kinetic",
  "peak",
] as const;

export type MotionIntensity = (typeof MOTION_INTENSITIES)[number];

export interface MotionPrimitiveMetadata {
  id: MotionAction;
  kind: MotionPrimitiveKind;
  domainTags: readonly MotionDomainTag[];
  intensity: MotionIntensity;
  recommendedSfx: string;
  description: string;
}

type CatalogTuple = readonly [
  MotionAction,
  MotionPrimitiveKind,
  readonly MotionDomainTag[],
  MotionIntensity,
  string,
  string,
];

const RAW_CATALOG_TUPLES: readonly CatalogTuple[] = [
  // --- Entries (58) ---
  ["pop-out", "entry", ["household", "fiscal"], "moderate", "sticker-pop", "Crisp editorial scale-up reveal from 0.40 to 1.00"],
  ["elastic-open", "entry", ["household", "compute"], "kinetic", "sticker-pop", "Tactile spring expansion with micro settle"],
  ["slide-left", "entry", ["fiscal", "archival"], "moderate", "paper-slide", "Horizontal card arrival from right margin"],
  ["slide-right", "entry", ["fiscal", "archival"], "moderate", "paper-slide", "Horizontal card arrival from left margin"],
  ["slide-up", "entry", ["fiscal", "household"], "subtle", "glass-enter", "Calm vertical rise from lower baseline"],
  ["slide-down", "entry", ["legal", "archival"], "subtle", "glass-enter", "Measured vertical descent from upper header"],
  ["whip-slide", "entry", ["geopolitics", "compute"], "kinetic", "map-whoosh", "High-velocity lateral slide with shear"],
  ["curtain-wipe", "entry", ["archival", "legal"], "moderate", "paper-slide", "Left-to-right rectangular inset curtain reveal"],
  ["iris-reveal", "entry", ["archival", "geopolitics"], "moderate", "newsreel-click", "Circular optical aperture iris opening"],
  ["paper-unfold", "entry", ["archival", "legal", "fiscal"], "moderate", "paper-flip-fast", "3D perspective ledger sheet unfold with shading"],
  ["flip-x", "entry", ["mechanical", "fiscal"], "moderate", "paper-flip-fast", "Horizontal axis 90-degree perspective card flip"],
  ["flip-y", "entry", ["mechanical", "legal"], "moderate", "paper-flip-fast", "Vertical axis 90-degree perspective card flip"],
  ["stamp-slam", "entry", ["verdict", "legal"], "peak", "warning-thud", "High-authority verdict stamp descent with tilt"],
  ["blur-snap", "entry", ["archival", "fiscal", "compute"], "subtle", "glass-enter", "Optical defocus pull into crisp registration"],
  ["zoom-burst", "entry", ["fiscal", "geopolitics"], "moderate", "glass-expand", "Focused radial scale arrival from 0.75"],
  ["shutter-flash", "entry", ["archival", "legal"], "moderate", "camera-shutter", "Soft silver-gelatin luminance dip and settle"],
  ["bounce-drop", "entry", ["household", "mechanical"], "kinetic", "sticker-pop", "Gravity drop with two-cycle squash settle"],
  ["skew-wipe", "entry", ["compute", "grid"], "kinetic", "flash-cut", "Angled shear wipe with cubic deceleration"],
  ["accordion-unfold", "entry", ["archival", "legal"], "moderate", "paper-flip-fast", "Symmetric vertical pleat expansion"],
  ["rubber-snap", "entry", ["household", "mechanical"], "kinetic", "sticker-pop", "Anisotropic damped elastic snap"],
  ["zoom-punch", "entry", ["verdict", "geopolitics"], "peak", "flash-cut", "High-impact optical punch from 1.38 scale"],
  ["hydraulic-press-down", "entry", ["mechanical", "fiscal", "grid"], "peak", "warning-thud", "High-pressure hydraulic platen descent to hard lock"],
  ["hydraulic-lift-up", "entry", ["mechanical", "grid"], "moderate", "glass-expand", "Pressurized cylinder rise with platen lock"],
  ["pneumatic-stamp-in", "entry", ["verdict", "legal", "mechanical"], "peak", "warning-thud", "Pneumatic 1.32x cylinder impact with iron anvil recoil"],
  ["pneumatic-lock-left", "entry", ["mechanical", "grid"], "kinetic", "data-tick", "Lateral pneumatic bolt lock from right"],
  ["pneumatic-lock-right", "entry", ["mechanical", "grid"], "kinetic", "data-tick", "Lateral pneumatic bolt lock from left"],
  ["guillotine-drop", "entry", ["verdict", "legal", "fiscal"], "peak", "warning-thud", "Gravity blade drop into zero-bounce latch shear"],
  ["vault-door-swing", "entry", ["fiscal", "verdict", "mechanical"], "moderate", "glass-expand", "Heavy overdamped 3D left-hinge vault swing"],
  ["solari-flap-cascade", "entry", ["fiscal", "mechanical", "archival"], "moderate", "data-tick", "Split-flap Treasury board 5-card gravity cascade"],
  ["gantry-lower", "entry", ["maritime", "mechanical", "grid"], "moderate", "paper-slide", "Port crane cable lowering with damped sway"],
  ["ratchet-step-in", "entry", ["mechanical", "fiscal"], "moderate", "data-tick", "Four-tooth discrete ratchet pawl advance"],
  ["piston-thrust", "entry", ["mechanical", "grid"], "kinetic", "warning-thud", "Accelerated cylinder stroke with top-dead-center recoil"],
  ["turnstile-spin-in", "entry", ["mechanical", "household"], "moderate", "paper-flip-fast", "3D rotary turnstile gate entry"],
  ["scale-beam-drop", "entry", ["legal", "verdict", "fiscal"], "moderate", "glass-dock", "Balance-scale pan drop with damped pendulum settle"],
  ["origami-valley-unfold", "entry", ["archival", "legal"], "moderate", "paper-flip-fast", "3D valley-crease rigid sheet unfold with Lambertian shade"],
  ["origami-mountain-unfold", "entry", ["archival", "fiscal"], "moderate", "paper-flip-fast", "3D mountain-crease rigid sheet unfold"],
  ["origami-diagonal-unfold", "entry", ["archival", "geopolitics"], "moderate", "paper-flip-fast", "Diagonal chart map fold-out in 1100px perspective"],
  ["dossier-slide-desk", "entry", ["archival", "legal", "geopolitics"], "subtle", "paper-slide", "Mahogany desk friction slide with slight yaw"],
  ["microfilm-snap", "entry", ["archival", "fiscal"], "kinetic", "newsreel-click", "Microfiche reel carriage whip into crisp frame"],
  ["blueprint-unroll-x", "entry", ["grid", "mechanical", "archival"], "moderate", "paper-slide", "Horizontal architectural schematic unroll"],
  ["blueprint-unroll-y", "entry", ["grid", "legal", "archival"], "moderate", "paper-slide", "Vertical statutory scroll unroll"],
  ["wax-seal-press", "entry", ["legal", "verdict", "archival"], "moderate", "warning-thud", "Sovereign seal impression with micro-recoil"],
  ["notary-emboss", "entry", ["legal", "archival", "household"], "subtle", "type-click", "Paper relief emboss compression and contrast rise"],
  ["ledger-page-turn", "entry", ["fiscal", "archival", "household"], "moderate", "paper-flip-fast", "Bound folio left-spine 3D page turn"],
  ["redaction-bar-reveal", "entry", ["legal", "archival", "geopolitics"], "moderate", "marker-sweep", "Angled declassification polygon wipe"],
  ["laser-etch-wipe", "entry", ["compute", "grid"], "kinetic", "telestrator-draw", "Precision lithography diagonal polygon etch wipe"],
  ["receipt-feed-up", "entry", ["household", "fiscal"], "moderate", "type-click", "Thermal printer stepped ratchet paper feed"],
  ["carbon-copy-peel", "entry", ["archival", "household", "fiscal"], "moderate", "paper-slide", "3D oblique carbon voucher sheet peel"],
  ["hinge-drop-top", "entry", ["mechanical", "archival"], "moderate", "glass-dock", "Top-hinged placard swing down to vertical rest"],
  ["hinge-swing-left", "entry", ["legal", "archival"], "moderate", "glass-dock", "Left-spine exhibit panel swing open"],
  ["isometric-rise", "entry", ["grid", "compute", "maritime"], "moderate", "glass-expand", "Isometric diorama plinth elevation"],
  ["orthographic-extrude", "entry", ["fiscal", "grid", "compute"], "moderate", "glass-expand", "Bottom-anchored vertical column extrusion"],
  ["loupe-pop-focus", "entry", ["archival", "legal"], "subtle", "camera-shutter", "Magnifier lens pull from 1.18x defocus to sharp 1.0x"],
  ["prism-refract-in", "entry", ["compute", "fiscal"], "moderate", "glass-enter", "Smoked-glass oblique refractive settle"],
  ["card-deal-arc", "entry", ["household", "fiscal"], "moderate", "paper-flip-fast", "Parabolic tabletop card deal trajectory"],
  ["radar-sweep-reveal", "entry", ["geopolitics", "maritime"], "moderate", "map-whoosh", "Azimuthal aperture reveal from left origin"],
  ["crt-beam-open", "entry", ["compute", "grid", "geopolitics"], "kinetic", "data-tick", "Horizontal raster line expanding into full telemetry frame"],
  ["sonar-ping-appear", "entry", ["maritime", "geopolitics"], "moderate", "alert-ping", "Hydrophone teal ring bloom and sharp lock"],

  // --- Exits (42) ---
  ["fade-out", "exit", ["archival", "fiscal", "household"], "subtle", "glass-exit", "Clean linear opacity dissolve"],
  ["slide-left", "exit", ["fiscal", "archival"], "moderate", "paper-slide", "Lateral exit off left margin"],
  ["slide-right", "exit", ["fiscal", "archival"], "moderate", "paper-slide", "Lateral exit off right margin"],
  ["slide-up", "exit", ["fiscal", "household"], "subtle", "glass-exit", "Vertical lift exit upward"],
  ["slide-down", "exit", ["household", "fiscal"], "subtle", "glass-exit", "Vertical drop exit downward"],
  ["pop-down", "exit", ["household", "compute"], "moderate", "glass-exit", "Crisp scale-down recession to 0.70"],
  ["blur-fade", "exit", ["archival", "fiscal"], "subtle", "glass-exit", "Optical defocus dissolve"],
  ["curtain-close", "exit", ["archival", "legal"], "moderate", "paper-slide", "Left-to-right inset curtain wipe closed"],
  ["iris-close", "exit", ["archival", "geopolitics"], "moderate", "newsreel-click", "Circular aperture iris contraction"],
  ["fade-blur-out", "exit", ["fiscal", "archival", "household"], "subtle", "glass-exit", "Signature Reading Room slight lift and defocus exit"],
  ["skew-wipe", "exit", ["compute", "grid"], "kinetic", "flash-cut", "Sheared lateral wipe dismissal"],
  ["zoom-punch", "exit", ["verdict", "geopolitics"], "kinetic", "flash-cut", "Forward scale expansion into optical blur"],
  ["shatter-voronoi", "exit", ["verdict", "fiscal", "household"], "peak", "warning-thud", "Faceted polygon fracture and radial disperse"],
  ["paper-tear-split", "exit", ["legal", "household", "archival"], "kinetic", "paper-flip-fast", "Jagged shear contract tear and drop"],
  ["guillotine-sever", "exit", ["verdict", "legal", "fiscal"], "peak", "warning-thud", "Top-down blade crop sever with gravity fall"],
  ["trapdoor-drop", "exit", ["verdict", "household", "fiscal"], "kinetic", "warning-thud", "Hinged floor release and quadratic plunge"],
  ["sink-underwater", "exit", ["maritime", "household", "fiscal"], "moderate", "glass-exit", "Viscous fluid sway, darkening, and submergence"],
  ["incinerate-ash-edge", "exit", ["fiscal", "verdict"], "kinetic", "paper-slide", "Upward thermal char crop and contrast ash fade"],
  ["shredder-strip-down", "exit", ["legal", "archival", "compute"], "kinetic", "paper-flip-fast", "Downward feed through paper shredder polygon jaws"],
  ["domino-topple-out", "exit", ["fiscal", "geopolitics", "mechanical"], "kinetic", "warning-thud", "Hyperbolic inverted-pendulum topple off stage"],
  ["cable-snap-recoil", "exit", ["maritime", "grid", "mechanical"], "peak", "flash-cut", "Hookean tension build followed by sudden whip recoil"],
  ["vacuum-collapse", "exit", ["compute", "fiscal"], "kinetic", "glass-exit", "Anisotropic implosion to center point"],
  ["hydraulic-retract", "exit", ["mechanical", "grid"], "moderate", "glass-dock", "Upward cylinder retraction behind header"],
  ["hydraulic-crush-out", "exit", ["mechanical", "household", "verdict"], "peak", "warning-thud", "High-tonnage vertical compression flatten with Poisson bulge"],
  ["pendulum-swing-off", "exit", ["mechanical", "fiscal"], "moderate", "map-whoosh", "Arcing pivot release off right edge"],
  ["magnet-pull-off", "exit", ["mechanical", "compute", "fiscal"], "kinetic", "map-whoosh", "Inverse-square lateral acceleration off left edge"],
  ["conveyor-carry-right", "exit", ["mechanical", "maritime", "household"], "moderate", "data-tick", "Four-step belt ratchet carry out"],
  ["origami-fold-away", "exit", ["archival", "legal"], "moderate", "paper-flip-fast", "3D mountain-crease fold collapse"],
  ["solari-flip-blank", "exit", ["fiscal", "mechanical"], "moderate", "data-tick", "Split-flap 88-degree flip down to blank slate"],
  ["dossier-close-fold", "exit", ["archival", "legal", "geopolitics"], "subtle", "paper-slide", "Left-spine folder cover close"],
  ["microfilm-whip-next", "exit", ["archival", "fiscal"], "kinetic", "newsreel-click", "Fast horizontal reel advance blur"],
  ["crt-line-collapse", "exit", ["compute", "grid", "geopolitics"], "moderate", "data-tick", "Vertical raster squash to thin phosphor line"],
  ["defocus-bokeh-out", "exit", ["archival", "household"], "subtle", "glass-exit", "Soft lens expansion into 24px bokeh dissolve"],
  ["redact-blackout-exit", "exit", ["legal", "geopolitics", "archival"], "moderate", "marker-sweep", "Heavy classification bar sweep dismissal"],
  ["ink-bleed-dissolve", "exit", ["archival", "legal"], "subtle", "glass-exit", "Desaturated archival ink dispersion"],
  ["blueprint-roll-tight", "exit", ["grid", "mechanical", "archival"], "moderate", "paper-slide", "Leftward schematic roll-up"],
  ["depth-recede-behind", "exit", ["geopolitics", "fiscal"], "subtle", "glass-exit", "Z-axis recession into background depth plane"],
  ["split-barn-doors", "exit", ["mechanical", "archival"], "moderate", "paper-slide", "Symmetric bilateral inset door closure"],
  ["stamp-void-dismiss", "exit", ["verdict", "legal", "household"], "moderate", "glass-exit", "Desaturated downward voided voucher drop"],
  ["ticker-scroll-off", "exit", ["fiscal", "compute"], "moderate", "data-tick", "Continuous tape feed exit left"],
  ["radar-fade-decay", "exit", ["maritime", "geopolitics"], "subtle", "alert-ping", "Exponential phosphor wake decay"],
  ["glass-evaporate", "exit", ["household", "compute", "fiscal"], "subtle", "glass-exit", "Smoked-glass upward mist dispersion"],

  // --- In-Place, Mechanical & Physics Loops (98) ---
  ["highlight-sweep", "in-place", ["archival", "legal", "fiscal"], "subtle", "marker-sweep", "Editorial highlighter progress sweep"],
  ["underline-draw", "in-place", ["legal", "archival", "verdict"], "subtle", "telestrator-draw", "Left-to-right rule underline stroke"],
  ["circle-telestrator", "in-place", ["archival", "fiscal", "geopolitics"], "moderate", "telestrator-draw", "Hand-drawn telestrator callout progress"],
  ["lens-zoom", "in-place", ["archival", "legal"], "subtle", "glass-expand", "Gentle 8% optical inspection swell"],
  ["tilt-3d", "in-place", ["compute", "fiscal"], "subtle", "glass-enter", "Continuous 3D perspective card gimbal"],
  ["float-idle", "in-place", ["household", "fiscal"], "subtle", "glass-dock", "Calm sinusoidal vertical suspension"],
  ["pulse-warning", "in-place", ["verdict", "fiscal", "grid"], "moderate", "alert-ping", "Brick-red risk rim pulse"],
  ["nudge", "in-place", ["household", "verdict"], "moderate", "data-tick", "Crisp 8px vertical salience impulse"],
  ["shake-alert", "in-place", ["verdict", "household"], "kinetic", "warning-thud", "Damped horizontal fault alert tremor"],
  ["focus-dim", "in-place", ["archival", "legal"], "subtle", "glass-dock", "Background layer desaturation and 32% dim"],
  ["ken-burns", "in-place", ["archival", "geopolitics"], "subtle", "camera-shutter", "Slow documentary rostrum pan and zoom"],
  ["split-compare", "in-place", ["fiscal", "household"], "moderate", "paper-slide", "Normalized A/B comparison wipe scalar"],
  ["glow-rim", "in-place", ["compute", "fiscal"], "subtle", "glass-enter", "Perimeter specular bevel breathing"],
  ["glitch-jitter", "in-place", ["compute", "geopolitics"], "kinetic", "flash-cut", "Stepped deterministic chromatic offset"],
  ["card-tilt-3d", "in-place", ["fiscal", "archival"], "subtle", "glass-expand", "Elevated 1200px perspective exhibition tilt"],
  ["spotlight-vignette", "in-place", ["archival", "verdict", "legal"], "moderate", "riser-subtle", "Focused contrast lift with ice-blue halo"],
  ["split-push-left", "in-place", ["fiscal", "legal"], "moderate", "paper-slide", "180px left dock displacement for split screen"],
  ["split-push-right", "in-place", ["fiscal", "legal"], "moderate", "paper-slide", "180px right dock displacement for split screen"],
  ["parallax-hover", "in-place", ["geopolitics", "maritime"], "subtle", "glass-dock", "Multi-harmonic 3D floating parallax"],
  ["dial-rotate", "in-place", ["mechanical", "grid"], "moderate", "data-tick", "Full 360-degree eased gauge rotation"],
  ["magnifier-pan", "in-place", ["archival", "legal", "fiscal"], "moderate", "paper-slide", "1.14x optical loupe orbital inspection"],
  ["border-trace", "in-place", ["fiscal", "legal", "compute"], "subtle", "telestrator-draw", "Perimeter SVG stroke-dashoffset trace"],
  ["orbit-float", "in-place", ["compute", "maritime"], "subtle", "glass-dock", "Figure-eight Lissajous drift"],
  ["card-flip-180", "in-place", ["fiscal", "verdict", "household"], "kinetic", "paper-flip-fast", "180-degree Y-axis reveal flip with lift"],
  ["pendulum-tick-1hz", "in-place", ["mechanical", "fiscal"], "subtle", "type-click", "Undamped 1Hz horological pendulum arc"],
  ["pendulum-heavy-settle", "in-place", ["mechanical", "verdict"], "moderate", "glass-dock", "Heavy brass bob damped swing to rest"],
  ["turbine-spin-rpm", "in-place", ["grid", "mechanical"], "kinetic", "riser-subtle", "Continuous synchronous generator rotor spin"],
  ["watt-meter-spin", "in-place", ["grid", "household"], "moderate", "data-tick", "Oblique induction utility disk rotation"],
  ["needle-redline-flutter", "in-place", ["grid", "fiscal", "mechanical"], "kinetic", "alert-ping", "High-pressure gauge needle redline tremor"],
  ["piston-reciprocate", "in-place", ["mechanical", "grid"], "kinetic", "type-click", "Crank-slider two-harmonic reciprocating stroke"],
  ["conveyor-belt-march", "in-place", ["mechanical", "household", "maritime"], "moderate", "data-tick", "Forward stepped belt ratchet advance"],
  ["conveyor-ratchet-reverse", "in-place", ["mechanical", "fiscal"], "moderate", "data-tick", "Reverse pawl-locked belt step"],
  ["gear-mesh-cw", "in-place", ["mechanical", "grid"], "moderate", "type-click", "12-tooth cycloidal Geneva clockwise indexing"],
  ["gear-mesh-ccw", "in-place", ["mechanical", "grid"], "moderate", "type-click", "12-tooth cycloidal Geneva counter-clockwise indexing"],
  ["balance-scale-oscillate", "in-place", ["legal", "verdict", "fiscal"], "moderate", "glass-dock", "Jurisprudential weigh-beam damped tilt"],
  ["hydraulic-pressure-tremor", "in-place", ["mechanical", "fiscal"], "kinetic", "ambient-tension-drone", "High-tonnage platen micro-strain before yield"],
  ["check-valve-chatter", "in-place", ["mechanical", "grid", "maritime"], "moderate", "type-click", "Backflow check-valve seat vibration"],
  ["gavel-double-tap", "in-place", ["legal", "verdict"], "peak", "warning-thud", "Dual judicial gavel strike impulse"],
  ["solari-digit-flutter", "in-place", ["fiscal", "archival"], "moderate", "data-tick", "6-step split-flap drum leaf flutter"],
  ["crane-trolley-shuttle", "in-place", ["maritime", "mechanical"], "moderate", "paper-slide", "STS port crane gantry shuttle and cable swing"],
  ["escapement-step-12fps", "in-place", ["mechanical", "archival"], "subtle", "type-click", "12fps quantized watch escapement tick"],
  ["gyro-gimbal-precess", "in-place", ["geopolitics", "maritime", "compute"], "moderate", "ambient-tension-drone", "3-axis inertial navigation gimbal precession"],
  ["domino-chain-ripple", "in-place", ["fiscal", "geopolitics"], "kinetic", "data-tick", "Contagion lean wave across neighboring tiles"],
  ["cable-tension-hum", "in-place", ["maritime", "grid", "mechanical"], "moderate", "ambient-tension-drone", "Taut catenary wire resonant vibration"],
  ["archive-page-breath", "in-place", ["archival", "legal"], "subtle", "paper-slide", "Calm vellum folio micro-settle hold"],
  ["loupe-scan-row", "in-place", ["archival", "fiscal", "legal"], "moderate", "paper-slide", "Horizontal Table 9 ledger line magnification"],
  ["caliper-measure-span", "in-place", ["mechanical", "archival", "grid"], "subtle", "type-click", "Vernier jaw span lock around target"],
  ["red-pen-strike", "in-place", ["legal", "verdict", "household"], "moderate", "marker-sweep", "Auditor brick-red line strike-through"],
  ["margin-bracket-draw", "in-place", ["legal", "archival"], "subtle", "telestrator-draw", "Statutory margin callout bracket reveal"],
  ["footnote-zoom-callout", "in-place", ["fiscal", "legal", "archival"], "moderate", "glass-expand", "10-K footnote elevation with shadow depth"],
  ["watermark-shimmer", "in-place", ["fiscal", "archival", "legal"], "subtle", "chapter-chime", "Subtle security intaglio luminance wave"],
  ["caustic-edge-sweep", "in-place", ["compute", "maritime"], "subtle", "glass-enter", "Ice-blue smoked-glass bevel refraction pass"],
  ["paper-grain-breathe", "in-place", ["archival", "household"], "subtle", "paper-slide", "Warm archival stock micro-breathing"],
  ["halftone-pulse", "in-place", ["archival", "geopolitics"], "subtle", "newsreel-click", "1930s broadsheet contrast pulse"],
  ["redact-bar-slide", "in-place", ["legal", "geopolitics"], "moderate", "marker-sweep", "Classification bar horizontal reveal"],
  ["audit-row-step", "in-place", ["fiscal", "household", "legal"], "subtle", "data-tick", "Five-row discrete ledger inspection step"],
  ["crosshair-track", "in-place", ["geopolitics", "maritime"], "moderate", "data-tick", "Smooth C2 optical reticle target lock"],
  ["bounding-box-lock", "in-place", ["geopolitics", "compute"], "moderate", "camera-shutter", "LiDAR / SAR target frame acquisition"],
  ["split-loupe-ab", "in-place", ["archival", "fiscal"], "moderate", "paper-slide", "Oscillating before/after forensic lens"],
  ["stamp-recoil-hold", "in-place", ["verdict", "legal"], "moderate", "warning-thud", "Post-impact iron stamp damped ring"],
  ["ink-highlighter-double", "in-place", ["archival", "legal", "household"], "subtle", "marker-sweep", "Two-pass yellow/teal editorial marker stroke"],
  ["notary-seal-glint", "in-place", ["legal", "verdict"], "subtle", "chapter-chime", "Embossed foil seal specular glint"],
  ["microfilm-frame-step", "in-place", ["archival", "fiscal"], "moderate", "newsreel-click", "Four-frame stepped archive advance"],
  ["docket-tab-riffle", "in-place", ["legal", "archival"], "moderate", "paper-flip-fast", "Court binder index tab riffle"],
  ["capital-flow-dash", "in-place", ["fiscal", "geopolitics"], "moderate", "data-tick", "Cross-border TIC liquidity surge"],
  ["yield-spread-widen", "in-place", ["fiscal", "geopolitics"], "moderate", "riser-subtle", "Sovereign bond spread vertical divergence"],
  ["debt-clock-blur", "in-place", ["fiscal", "verdict"], "kinetic", "data-tick", "Accelerating odometer blur under compounding"],
  ["sankey-particle-stream", "in-place", ["fiscal", "household", "compute"], "subtle", "data-tick", "Continuous revenue tributary flow"],
  ["contagion-ripple", "in-place", ["fiscal", "geopolitics"], "kinetic", "alert-ping", "Radial balance-sheet shockwave ring"],
  ["vault-drain-vortex", "in-place", ["fiscal", "household"], "moderate", "ambient-tension-drone", "Trust-fund reserve drawdown sink"],
  ["pik-snowball-compound", "in-place", ["fiscal", "verdict"], "kinetic", "riser-subtle", "Exponential payment-in-kind debt growth"],
  ["escrow-mercury-climb", "in-place", ["household", "fiscal"], "moderate", "riser-subtle", "Insurance & tax escrow column rise"],
  ["paycheck-erode-pulse", "in-place", ["household", "fiscal"], "moderate", "alert-ping", "Real wage bar contraction throb"],
  ["covenant-vice-squeeze", "in-place", ["fiscal", "legal", "household"], "kinetic", "warning-thud", "Lateral credit vice compression"],
  ["auction-tail-tremor", "in-place", ["fiscal", "geopolitics"], "moderate", "data-tick", "Treasury auction weak-demand tail jitter"],
  ["rollover-wall-lean", "in-place", ["fiscal", "verdict"], "moderate", "ambient-tension-drone", "Maturity wall ominous forward lean"],
  ["scrip-token-flicker", "in-place", ["household", "compute", "archival"], "subtle", "data-tick", "Expiring allowance / cloud-credit decay"],
  ["budget-guillotine-hover", "in-place", ["legal", "verdict", "fiscal"], "moderate", "ambient-tension-drone", "Poised fiscal blade tension hover"],
  ["veto-ink-slash", "in-place", ["legal", "verdict"], "kinetic", "marker-sweep", "Executive veto pen diagonal strike"],
  ["balance-sheet-shear", "in-place", ["fiscal", "verdict"], "moderate", "paper-slide", "Asset/liability vertical fault shear"],
  ["tranche-waterfall-step", "in-place", ["fiscal", "legal"], "subtle", "data-tick", "Four-tier seniority waterfall cascade"],
  ["radar-cone-360", "in-place", ["geopolitics", "maritime"], "moderate", "alert-ping", "Continuous 360-degree maritime radar sweep"],
  ["sonar-ripple-ring", "in-place", ["maritime", "geopolitics"], "subtle", "alert-ping", "Periodic seabed acoustic ping"],
  ["seabed-current-sway", "in-place", ["maritime", "compute"], "subtle", "ambient-tension-drone", "Subsea fiber-optic cable benthic drift"],
  ["buoyancy-hull-heave", "in-place", ["maritime", "geopolitics"], "moderate", "ambient-tension-drone", "Multi-harmonic vessel hull heave and roll"],
  ["buoyancy-cargo-slosh", "in-place", ["maritime", "fiscal"], "moderate", "paper-slide", "LNG / tanker free-surface liquid tilt"],
  ["cable-packet-pulse", "in-place", ["compute", "maritime", "grid"], "subtle", "data-tick", "Optical repeater telemetry pulse"],
  ["transformer-hum-60hz", "in-place", ["grid", "mechanical"], "subtle", "ambient-tension-drone", "60Hz substation magnetostriction buzz"],
  ["grid-frequency-droop", "in-place", ["grid", "compute"], "moderate", "alert-ping", "Under-frequency load sag and dim"],
  ["server-led-blink-seeded", "in-place", ["compute", "grid"], "subtle", "data-tick", "Deterministic SplitMix32 rack status blink"],
  ["euv-laser-burst", "in-place", ["compute", "geopolitics"], "kinetic", "camera-shutter", "High-harmonic tin-droplet EUV pulse"],
  ["drone-hover-bob", "in-place", ["geopolitics", "household"], "subtle", "ambient-tension-drone", "Quadcopter inspection station-keeping drift"],
  ["anchor-drag-scrape", "in-place", ["maritime", "geopolitics"], "kinetic", "warning-thud", "Seabed fluke drag and snag jerk"],
  ["blockade-ring-constrict", "in-place", ["geopolitics", "maritime"], "moderate", "riser-subtle", "Chokepoint exclusion ring tightening"],
  ["seismic-aftershock-decay", "in-place", ["geopolitics", "grid", "verdict"], "peak", "warning-thud", "P-wave jolt and S-wave shear decay to zero"],
  ["chokepoint-gate-clamp", "in-place", ["maritime", "geopolitics"], "moderate", "glass-dock", "Canal lock bilateral constriction"],
  ["gpu-thermal-shimmer", "in-place", ["compute", "grid"], "subtle", "ambient-tension-drone", "Datacenter rack convective heat wave"],
  ["vls-cell-arm-pulse", "in-place", ["geopolitics", "maritime"], "moderate", "alert-ping", "Naval vertical launch cell status pulse"],

  // --- Camera, Depth-Sandwich & Physics Trajectories (36) ---
  ["camera-dolly-in", "camera", ["archival", "fiscal", "verdict"], "subtle", "glass-expand", "Smooth 8.5% editorial optical push-in"],
  ["camera-dolly-out", "camera", ["archival", "geopolitics"], "subtle", "glass-dock", "Wide contextual pull-back reveal"],
  ["camera-truck-left", "camera", ["archival", "geopolitics"], "subtle", "paper-slide", "Lateral camera track left across board"],
  ["camera-truck-right", "camera", ["archival", "geopolitics"], "subtle", "paper-slide", "Lateral camera track right across board"],
  ["camera-pedestal-up", "camera", ["fiscal", "grid"], "subtle", "paper-slide", "Vertical camera column elevation"],
  ["camera-pedestal-down", "camera", ["fiscal", "maritime"], "subtle", "paper-slide", "Vertical camera descent into trench"],
  ["camera-whip-pan-left", "camera", ["geopolitics", "verdict"], "kinetic", "map-whoosh", "Fast lateral pan left with motion blur and skew"],
  ["camera-whip-pan-right", "camera", ["geopolitics", "verdict"], "kinetic", "map-whoosh", "Fast lateral pan right with motion blur and skew"],
  ["camera-rack-focus-near", "camera", ["archival", "legal"], "subtle", "camera-shutter", "Optical focus pull to foreground exhibit"],
  ["camera-rack-focus-far", "camera", ["geopolitics", "archival"], "subtle", "camera-shutter", "Focus transfer to background horizon"],
  ["camera-dutch-tilt-left", "camera", ["verdict", "geopolitics"], "moderate", "riser-subtle", "Measured -3.6deg investigative cant"],
  ["camera-dutch-tilt-right", "camera", ["verdict", "geopolitics"], "moderate", "riser-subtle", "Measured +3.6deg investigative cant"],
  ["camera-vertigo-contra-zoom", "camera", ["verdict", "fiscal"], "kinetic", "riser-subtle", "Simultaneous Z-recede and focal scale expansion"],
  ["camera-isometric-orbit-cw", "camera", ["grid", "compute", "maritime"], "moderate", "map-whoosh", "Clockwise 24-degree isometric table orbit"],
  ["camera-isometric-orbit-ccw", "camera", ["grid", "compute", "maritime"], "moderate", "map-whoosh", "Counter-clockwise 24-degree isometric orbit"],
  ["camera-macro-table-drift", "camera", ["archival", "legal"], "subtle", "paper-slide", "C2-continuous overhead rostrum drift"],
  ["camera-split-diopter-shift", "camera", ["legal", "fiscal"], "moderate", "glass-dock", "Dual-plane diopter framing shift"],
  ["camera-seismic-jolt", "camera", ["verdict", "geopolitics", "grid"], "peak", "warning-thud", "Full-frame P/S-wave shock impulse"],
  ["depth-pass-behind-shoulders", "camera", ["fiscal", "geopolitics"], "moderate", "map-whoosh", "Z-plane traverse behind presenter matte"],
  ["depth-emerge-over-shoulder", "camera", ["household", "fiscal"], "moderate", "glass-enter", "Critically-damped emergence from behind shoulder"],
  ["depth-orbit-presenter", "camera", ["compute", "fiscal"], "moderate", "glass-expand", "Elliptical 3D depth orbit around speaker"],
  ["bezier-dock-shoulder-left", "camera", ["household", "fiscal"], "moderate", "glass-dock", "Curved glide into upper-left safe anchor"],
  ["bezier-dock-shoulder-right", "camera", ["household", "fiscal"], "moderate", "glass-dock", "Curved glide into upper-right safe anchor"],
  ["bezier-dock-bottom-bar", "camera", ["fiscal", "legal"], "subtle", "glass-dock", "Smooth descent into lower-third dock"],
  ["ballistic-lob-arc", "camera", ["geopolitics", "mechanical"], "kinetic", "map-whoosh", "Parabolic projectile trajectory with tangent heading"],
  ["parabolic-interceptor-arc", "camera", ["geopolitics", "maritime"], "kinetic", "map-whoosh", "Steep defense interceptor climb and apex turn"],
  ["catenary-sag-settle", "camera", ["grid", "maritime"], "subtle", "glass-dock", "Hyperbolic cosine transmission line settle"],
  ["catenary-cut-whip", "camera", ["maritime", "grid"], "peak", "flash-cut", "Severed cable tension release trajectory"],
  ["spring-tether-pull", "camera", ["mechanical", "fiscal"], "moderate", "paper-slide", "Critically-damped tether tow into lock"],
  ["buoyancy-surface-bob", "camera", ["maritime", "geopolitics"], "subtle", "ambient-tension-drone", "Open-ocean waterline heave and surge"],
  ["subsea-sink-drift", "camera", ["maritime", "compute"], "subtle", "glass-exit", "Abyssal plain slow descent with current sway"],
  ["centrifuge-spiral-out", "camera", ["compute", "fiscal"], "kinetic", "map-whoosh", "Expanding outward spiral dispersion"],
  ["vortex-funnel-in", "camera", ["fiscal", "verdict"], "kinetic", "map-whoosh", "Contracting liquidity sink spiral"],
  ["magnetic-snap-grid", "camera", ["compute", "grid", "archival"], "moderate", "data-tick", "Quantized 8px grid capture with lock click"],
  ["orthographic-explode-layers", "camera", ["compute", "grid", "mechanical"], "moderate", "glass-expand", "Isometric Z-stack layer separation"],
  ["orthographic-collapse-stack", "camera", ["compute", "grid", "mechanical"], "moderate", "glass-dock", "Isometric Z-stack reassembly into unit"],
];

export const MOTION_PRIMITIVE_CATALOG: readonly MotionPrimitiveMetadata[] =
  RAW_CATALOG_TUPLES.map((row) => ({
    id: row[0],
    kind: row[1],
    domainTags: row[2],
    intensity: row[3],
    recommendedSfx: row[4],
    description: row[5],
  }));

export interface MotionCatalogQuery {
  domain?: MotionDomainTag;
  kind?: MotionPrimitiveKind;
  intensity?: MotionIntensity;
  excludePeak?: boolean;
}

const INTENSITY_RANK: Record<MotionIntensity, number> = {
  subtle: 1,
  moderate: 2,
  kinetic: 3,
  peak: 4,
};

/**
 * Query primitives by domain (`fiscal`, `mechanical`, `legal`, `maritime`, `grid`,
 * `compute`, `archival`, `verdict`, `household`, `geopolitics`), kind, and intensity.
 */
export function queryMotionPrimitives(
  query: MotionCatalogQuery = {}
): MotionPrimitiveMetadata[] {
  const results: MotionPrimitiveMetadata[] = [];
  for (let i = 0; i < MOTION_PRIMITIVE_CATALOG.length; i++) {
    const item = MOTION_PRIMITIVE_CATALOG[i];
    if (query.kind && item.kind !== query.kind) continue;
    if (query.intensity && item.intensity !== query.intensity) continue;
    if (query.excludePeak && INTENSITY_RANK[item.intensity] >= 4) continue;
    if (query.domain) {
      let hasDomain = false;
      for (let d = 0; d < item.domainTags.length; d++) {
        if (item.domainTags[d] === query.domain) {
          hasDomain = true;
          break;
        }
      }
      if (!hasDomain) continue;
    }
    results.push(item);
  }
  return results;
}

// ============================================================================
// 9. 390+ Motion Alias Dictionary & Fuzzy/Phase Token Resolver
// ============================================================================

export const ENTRY_MOTION_ALIASES: Readonly<Record<string, EntryAction>> = {
  // Preserved legacy aliases
  enter: "slide-up",
  "fade-blur": "blur-snap",
  "fade-in": "blur-snap",
  appear: "blur-snap",
  reveal: "curtain-wipe",
  pop: "pop-out",
  "pop-in": "pop-out",
  "scale-in": "pop-out",
  "scale-up": "pop-out",
  "zoom-in": "zoom-burst",
  "burst-in": "zoom-burst",
  "punch-in": "zoom-punch",
  slam: "stamp-slam",
  "slam-in": "stamp-slam",
  "slam-stamp": "stamp-slam",
  stamp: "pneumatic-stamp-in",
  "verdict-stamp": "pneumatic-stamp-in",
  "iron-stamp": "pneumatic-stamp-in",
  "anvil-stamp": "pneumatic-stamp-in",
  "elastic-in": "elastic-open",
  "spring-in": "elastic-open",
  "rubber-in": "rubber-snap",
  "snap-in": "blur-snap",
  "focus-in": "loupe-pop-focus",
  "blur-in": "blur-snap",
  "defocus-in": "blur-snap",
  "rise-up": "slide-up",
  "float-up": "slide-up",
  "lift-in": "slide-up",
  "drop-in": "slide-down",
  "fall-in": "bounce-drop",
  "gravity-drop": "bounce-drop",
  "slide-from-right": "slide-left",
  "slide-from-left": "slide-right",
  "slide-from-bottom": "slide-up",
  "slide-from-top": "slide-down",
  "enter-left": "slide-left",
  "enter-right": "slide-right",
  "enter-up": "slide-up",
  "enter-down": "slide-down",
  "whip-in": "whip-slide",
  "fast-slide": "whip-slide",
  "wipe-in": "curtain-wipe",
  "wipe-right": "curtain-wipe",
  "wipe-left": "skew-wipe",
  "curtain-open": "curtain-wipe",
  "iris-open": "iris-reveal",
  "circle-open": "iris-reveal",
  "aperture-open": "iris-reveal",
  unfold: "paper-unfold",
  "sheet-unfold": "paper-unfold",
  "pleat-open": "accordion-unfold",
  "accordion-open": "accordion-unfold",
  "flip-in-x": "flip-x",
  "flip-in-y": "flip-y",
  "card-flip-in": "flip-y",
  "shutter-in": "shutter-flash",
  "flash-in": "shutter-flash",
  // Mechanical, Hydraulic & Legal Entry Aliases
  "hydraulic-press": "hydraulic-press-down",
  "hydraulic-crush-in": "hydraulic-press-down",
  "press-down": "hydraulic-press-down",
  "hydraulic-rise": "hydraulic-lift-up",
  "jack-up": "hydraulic-lift-up",
  "pneumatic-in": "pneumatic-stamp-in",
  "bolt-left": "pneumatic-lock-left",
  "bolt-right": "pneumatic-lock-right",
  "air-lock-left": "pneumatic-lock-left",
  "air-lock-right": "pneumatic-lock-right",
  guillotine: "guillotine-drop",
  "guillotine-in": "guillotine-drop",
  "blade-drop": "guillotine-drop",
  "vault-open": "vault-door-swing",
  "vault-swing": "vault-door-swing",
  "safe-door-open": "vault-door-swing",
  "solari-in": "solari-flap-cascade",
  "split-flap-in": "solari-flap-cascade",
  "board-flip-in": "solari-flap-cascade",
  "crane-lower": "gantry-lower",
  "hoist-down": "gantry-lower",
  "ratchet-in": "ratchet-step-in",
  "step-in": "ratchet-step-in",
  "piston-in": "piston-thrust",
  "cylinder-thrust": "piston-thrust",
  turnstile: "turnstile-spin-in",
  "revolve-in": "turnstile-spin-in",
  "scale-drop": "scale-beam-drop",
  "weigh-in": "scale-beam-drop",
  "origami-in": "origami-valley-unfold",
  "origami-unfold": "origami-valley-unfold",
  "origami-quarter-unfold": "origami-diagonal-unfold",
  "valley-unfold": "origami-valley-unfold",
  "mountain-unfold": "origami-mountain-unfold",
  "map-unfold": "origami-diagonal-unfold",
  "dossier-in": "dossier-slide-desk",
  "file-toss": "dossier-slide-desk",
  "clipping-toss": "dossier-slide-desk",
  "desk-slide": "dossier-slide-desk",
  "microfiche-in": "microfilm-snap",
  "reel-snap": "microfilm-snap",
  "unroll-x": "blueprint-unroll-x",
  "unroll-y": "blueprint-unroll-y",
  "scroll-unroll": "blueprint-unroll-y",
  "schematic-unroll": "blueprint-unroll-x",
  "wax-seal": "wax-seal-press",
  "seal-stamp": "wax-seal-press",
  emboss: "notary-emboss",
  "foil-press": "notary-emboss",
  "page-turn": "ledger-page-turn",
  "book-open": "ledger-page-turn",
  "folio-open": "ledger-page-turn",
  declassify: "redaction-bar-reveal",
  "unredact-in": "redaction-bar-reveal",
  "laser-etch": "laser-etch-wipe",
  "laser-wipe": "laser-etch-wipe",
  "etch-in": "laser-etch-wipe",
  "path-stroke-draw": "laser-etch-wipe",
  "draw-path": "laser-etch-wipe",
  "receipt-print": "receipt-feed-up",
  "ticker-print": "receipt-feed-up",
  "thermal-feed": "receipt-feed-up",
  "peel-in": "carbon-copy-peel",
  "sticker-peel": "carbon-copy-peel",
  "hinge-top": "hinge-drop-top",
  "hinge-left": "hinge-swing-left",
  "iso-rise": "isometric-rise",
  "diorama-rise": "isometric-rise",
  "monolith-tilt-up": "isometric-rise",
  extrude: "orthographic-extrude",
  "bar-grow-baseline": "orthographic-extrude",
  "column-grow": "orthographic-extrude",
  "loupe-in": "loupe-pop-focus",
  "glass-refract": "prism-refract-in",
  "liquid-glass-in": "prism-refract-in",
  "deal-card": "card-deal-arc",
  "toss-card": "card-deal-arc",
  "radar-in": "radar-sweep-reveal",
  "oscilloscope-lock": "crt-beam-open",
  "crt-open": "crt-beam-open",
  "terminal-boot": "crt-beam-open",
  "matrix-row-cascade": "ratchet-step-in",
  "sankey-flood-in": "curtain-wipe",
  "node-graph-bloom": "zoom-burst",
  "satellite-lock-reticle": "loupe-pop-focus",
  "sonar-in": "sonar-ping-appear",
  "depth-emerge-behind": "prism-refract-in",
  "parallax-stride-in": "slide-left",
};

export const EXIT_MOTION_ALIASES: Readonly<Record<string, ExitAction>> = {
  // Preserved legacy aliases
  exit: "fade-blur-out",
  "glass-exit": "fade-blur-out",
  "fade-blur": "fade-blur-out",
  fade: "fade-out",
  dissolve: "fade-out",
  vanish: "fade-blur-out",
  disappear: "fade-out",
  "exit-left": "slide-left",
  "exit-right": "slide-right",
  "exit-up": "slide-up",
  "exit-down": "slide-down",
  "slide-out-left": "slide-left",
  "slide-out-right": "slide-right",
  "slide-out-up": "slide-up",
  "slide-out-down": "slide-down",
  "scale-out": "pop-down",
  "shrink-out": "pop-down",
  "pop-out-exit": "pop-down",
  "blur-out": "blur-fade",
  "defocus-out": "defocus-bokeh-out",
  "bokeh-out": "defocus-bokeh-out",
  "wipe-out": "curtain-close",
  "wipe-close": "curtain-close",
  "circle-close": "iris-close",
  "aperture-close": "iris-close",
  // Physical, Mechanical & Editorial Exit Aliases
  shatter: "shatter-voronoi",
  fracture: "shatter-voronoi",
  "break-apart": "shatter-voronoi",
  "vaporize-slice": "incinerate-ash-edge",
  vaporize: "glass-evaporate",
  evaporate: "glass-evaporate",
  tear: "paper-tear-split",
  "rip-apart": "paper-tear-split",
  "contract-tear": "paper-tear-split",
  "guillotine-cut": "guillotine-sever",
  "blade-sever": "guillotine-sever",
  "chop-off": "guillotine-sever",
  trapdoor: "trapdoor-drop",
  "floor-drop": "trapdoor-drop",
  "cliff-edge-freefall": "trapdoor-drop",
  freefall: "trapdoor-drop",
  sink: "sink-underwater",
  submerge: "sink-underwater",
  drown: "sink-underwater",
  burn: "incinerate-ash-edge",
  ash: "incinerate-ash-edge",
  shred: "shredder-strip-down",
  shredder: "shredder-strip-down",
  "paper-shred": "shredder-strip-down",
  topple: "domino-topple-out",
  "domino-out": "domino-topple-out",
  "cable-snap": "cable-snap-recoil",
  "wire-snap": "cable-snap-recoil",
  "whip-recoil": "cable-snap-recoil",
  implode: "vacuum-collapse",
  vacuum: "vacuum-collapse",
  retract: "hydraulic-retract",
  "piston-retract": "hydraulic-retract",
  crush: "hydraulic-crush-out",
  flatten: "hydraulic-crush-out",
  "press-crush": "hydraulic-crush-out",
  "swing-off": "pendulum-swing-off",
  "magnet-off": "magnet-pull-off",
  "yank-left": "magnet-pull-off",
  "belt-out": "conveyor-carry-right",
  "conveyor-out": "conveyor-carry-right",
  "origami-out": "origami-fold-away",
  "fold-out": "origami-fold-away",
  "fold-close": "origami-fold-away",
  "solari-out": "solari-flip-blank",
  "flip-blank": "solari-flip-blank",
  "close-dossier": "dossier-close-fold",
  "folder-close": "dossier-close-fold",
  "reel-whip-out": "microfilm-whip-next",
  "crt-off": "crt-line-collapse",
  "tv-off": "crt-line-collapse",
  "redact-out": "redact-blackout-exit",
  "blackout-exit": "redact-blackout-exit",
  "ink-dissolve": "ink-bleed-dissolve",
  "roll-up": "blueprint-roll-tight",
  "scroll-close": "blueprint-roll-tight",
  "recede-z": "depth-recede-behind",
  "barn-doors": "split-barn-doors",
  "void-stamp": "stamp-void-dismiss",
  "reject-drop": "stamp-void-dismiss",
  "tape-off": "ticker-scroll-off",
  "radar-decay": "radar-fade-decay",
};

export const IN_PLACE_MOTION_ALIASES: Readonly<Record<string, InPlaceAction>> = {
  // Preserved legacy aliases
  focus: "spotlight-vignette",
  highlight: "highlight-sweep",
  "marker-sweep": "highlight-sweep",
  dock: "float-idle",
  "zoom-burst": "lens-zoom",
  "highlight-chisel": "highlight-sweep",
  "flip-180": "card-flip-180",
  "flip-3d": "card-flip-180",
  "veto-strike": "veto-ink-slash",
  "spillway-overflow": "sankey-particle-stream",
  "counter-surge": "capital-flow-dash",
  underline: "underline-draw",
  telestrator: "circle-telestrator",
  "circle-draw": "circle-telestrator",
  magnify: "lens-zoom",
  loupe: "magnifier-pan",
  "inspect-pan": "magnifier-pan",
  gimbal: "tilt-3d",
  hover: "float-idle",
  float: "float-idle",
  idle: "float-idle",
  breathe: "archive-page-breath",
  "page-breath": "archive-page-breath",
  pulse: "pulse-warning",
  "warning-pulse": "pulse-warning",
  "alert-pulse": "pulse-warning",
  bump: "nudge",
  tap: "nudge",
  shake: "shake-alert",
  tremor: "hydraulic-pressure-tremor",
  vibrate: "transformer-hum-60hz",
  dim: "focus-dim",
  "background-dim": "focus-dim",
  rostrum: "ken-burns",
  "doc-pan": "ken-burns",
  compare: "split-compare",
  "ab-wipe": "split-compare",
  shimmer: "watermark-shimmer",
  bevel: "glow-rim",
  rim: "glow-rim",
  jitter: "glitch-jitter",
  spotlight: "spotlight-vignette",
  vignette: "spotlight-vignette",
  "dock-left": "split-push-left",
  "dock-right": "split-push-right",
  "push-left": "split-push-left",
  "push-right": "split-push-right",
  parallax: "parallax-hover",
  spin: "turbine-spin-rpm",
  rotate: "dial-rotate",
  "gauge-spin": "dial-rotate",
  "trace-border": "border-trace",
  orbit: "orbit-float",
  // Domain Mechanical, Legal, Fiscal & Geopolitical Loop Aliases
  pendulum: "pendulum-tick-1hz",
  "clock-tick": "pendulum-tick-1hz",
  "heavy-pendulum": "pendulum-heavy-settle",
  turbine: "turbine-spin-rpm",
  rotor: "turbine-spin-rpm",
  "watt-meter-eddy": "watt-meter-spin",
  "utility-meter": "watt-meter-spin",
  redline: "needle-redline-flutter",
  "gauge-flutter": "needle-redline-flutter",
  piston: "piston-reciprocate",
  conveyor: "conveyor-belt-march",
  "belt-march": "conveyor-belt-march",
  "ratchet-back": "conveyor-ratchet-reverse",
  "gear-cw": "gear-mesh-cw",
  "gear-ccw": "gear-mesh-ccw",
  "geneva-drive-index": "gear-mesh-cw",
  escapement: "escapement-step-12fps",
  "weigh-scale": "balance-scale-oscillate",
  "lever-fulcrum-see-saw": "balance-scale-oscillate",
  "valve-chatter": "check-valve-chatter",
  gavel: "gavel-double-tap",
  "court-gavel": "gavel-double-tap",
  "solari-flutter": "solari-digit-flutter",
  "crane-shuttle": "crane-trolley-shuttle",
  "port-crane-loop": "crane-trolley-shuttle",
  gyro: "gyro-gimbal-precess",
  "domino-cascade-wave": "domino-chain-ripple",
  "domino-wave": "domino-chain-ripple",
  "cable-hum": "cable-tension-hum",
  "scan-row": "loupe-scan-row",
  "table9-scan": "loupe-scan-row",
  caliper: "caliper-measure-span",
  strikeout: "red-pen-strike",
  "redline-strike": "red-pen-strike",
  bracket: "margin-bracket-draw",
  "footnote-pop": "footnote-zoom-callout",
  "10k-callout": "footnote-zoom-callout",
  caustic: "caustic-edge-sweep",
  "paper-breathe": "paper-grain-breathe",
  halftone: "halftone-pulse",
  "redact-slide": "redact-bar-slide",
  "row-step": "audit-row-step",
  reticle: "crosshair-track",
  crosshair: "crosshair-track",
  "lidar-lock": "bounding-box-lock",
  "sar-lock": "bounding-box-lock",
  "double-highlight": "ink-highlighter-double",
  "seal-glint": "notary-seal-glint",
  "docket-riffle": "docket-tab-riffle",
  "tic-flow": "capital-flow-dash",
  "spread-widen": "yield-spread-widen",
  "debt-odometer": "debt-clock-blur",
  "sankey-flow": "sankey-particle-stream",
  contagion: "contagion-ripple",
  "trust-drain": "vault-drain-vortex",
  "oasi-drain": "vault-drain-vortex",
  "pik-compound": "pik-snowball-compound",
  "debt-snowball": "pik-snowball-compound",
  "escrow-rise": "escrow-mercury-climb",
  "wage-erode": "paycheck-erode-pulse",
  "allowance-shrink": "paycheck-erode-pulse",
  "covenant-squeeze": "covenant-vice-squeeze",
  "auction-tremor": "auction-tail-tremor",
  "maturity-lean": "rollover-wall-lean",
  "scrip-blink": "scrip-token-flicker",
  "guillotine-hover": "budget-guillotine-hover",
  "ledger-shear": "balance-sheet-shear",
  "fault-line-shear": "balance-sheet-shear",
  "tranche-step": "tranche-waterfall-step",
  "radar-sweep": "radar-cone-360",
  "radar-loop": "radar-cone-360",
  sonar: "sonar-ripple-ring",
  "benthic-sway": "seabed-current-sway",
  "hull-heave": "buoyancy-hull-heave",
  "ship-roll": "buoyancy-hull-heave",
  "tanker-slosh": "buoyancy-cargo-slosh",
  "fiber-pulse": "cable-packet-pulse",
  "substation-hum": "transformer-hum-60hz",
  "grid-droop": "grid-frequency-droop",
  "brownout-sag": "grid-frequency-droop",
  "rack-blink": "server-led-blink-seeded",
  "server-led-blink-random": "server-led-blink-seeded",
  "euv-pulse": "euv-laser-burst",
  "drone-bob": "drone-hover-bob",
  "anchor-scrape": "anchor-drag-scrape",
  "blockade-squeeze": "blockade-ring-constrict",
  seismic: "seismic-aftershock-decay",
  shockwave: "seismic-aftershock-decay",
  "shockwave-radial-displace": "seismic-aftershock-decay",
  "canal-clamp": "chokepoint-gate-clamp",
  "heat-shimmer": "gpu-thermal-shimmer",
  "vls-pulse": "vls-cell-arm-pulse",
};

export const CAMERA_MOTION_ALIASES: Readonly<Record<string, CameraAction>> = {
  "camera-focus": "camera-dolly-in",
  "push-in": "camera-dolly-in",
  "dolly-in": "camera-dolly-in",
  "pull-out": "camera-dolly-out",
  "dolly-out": "camera-dolly-out",
  "pull-back": "camera-dolly-out",
  "truck-left": "camera-truck-left",
  "truck-right": "camera-truck-right",
  "pan-left": "camera-truck-left",
  "pan-right": "camera-truck-right",
  "pedestal-up": "camera-pedestal-up",
  "pedestal-down": "camera-pedestal-down",
  "crane-up": "camera-pedestal-up",
  "crane-down": "camera-pedestal-down",
  "whip-pan-left": "camera-whip-pan-left",
  "whip-pan-right": "camera-whip-pan-right",
  "whip-left": "camera-whip-pan-left",
  "whip-right": "camera-whip-pan-right",
  "rack-focus": "camera-rack-focus-near",
  "rack-near": "camera-rack-focus-near",
  "rack-far": "camera-rack-focus-far",
  "dutch-left": "camera-dutch-tilt-left",
  "dutch-right": "camera-dutch-tilt-right",
  "dutch-tilt": "camera-dutch-tilt-left",
  "vertigo-zoom": "camera-vertigo-contra-zoom",
  "zolly-in": "camera-vertigo-contra-zoom",
  "iso-orbit-cw": "camera-isometric-orbit-cw",
  "iso-orbit-ccw": "camera-isometric-orbit-ccw",
  "table-drift": "camera-macro-table-drift",
  "rostrum-drift": "camera-macro-table-drift",
  "split-diopter": "camera-split-diopter-shift",
  "camera-shake": "camera-seismic-jolt",
  "behind-speaker": "depth-pass-behind-shoulders",
  "z-pass-behind-shoulders": "depth-pass-behind-shoulders",
  "pass-behind-presenter": "depth-pass-behind-shoulders",
  "z-emerge-over-shoulder": "depth-emerge-over-shoulder",
  "over-shoulder-emerge": "depth-emerge-over-shoulder",
  "depth-orbit-around-presenter": "depth-orbit-presenter",
  "shoulder-dock-left": "bezier-dock-shoulder-left",
  "shoulder-dock-right": "bezier-dock-shoulder-right",
  "bottom-dock-glide": "bezier-dock-bottom-bar",
  "lob-arc": "ballistic-lob-arc",
  "projectile-arc": "ballistic-lob-arc",
  "interceptor-arc": "parabolic-interceptor-arc",
  "missile-arc": "parabolic-interceptor-arc",
  "catenary-sag": "catenary-sag-settle",
  "cable-whip-arc": "catenary-cut-whip",
  "tether-pull": "spring-tether-pull",
  "surface-bob": "buoyancy-surface-bob",
  "ocean-bob": "buoyancy-surface-bob",
  "abyssal-drift": "subsea-sink-drift",
  "spiral-out": "centrifuge-spiral-out",
  "spiral-in": "vortex-funnel-in",
  "funnel-sink": "vortex-funnel-in",
  "grid-snap": "magnetic-snap-grid",
  "explode-layers": "orthographic-explode-layers",
  "collapse-layers": "orthographic-collapse-stack",
};

function buildUnifiedAliases(): Record<string, MotionAction> {
  const merged: Record<string, MotionAction> = {};
  const addMap = (src: Readonly<Record<string, MotionAction>>) => {
    const keys = Object.keys(src);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (merged[k] === undefined) {
        merged[k] = src[k];
      }
    }
  };
  addMap(ENTRY_MOTION_ALIASES);
  addMap(IN_PLACE_MOTION_ALIASES);
  addMap(EXIT_MOTION_ALIASES);
  addMap(CAMERA_MOTION_ALIASES);
  return merged;
}

export const MOTION_ALIASES: Readonly<Record<string, MotionAction>> = buildUnifiedAliases();

function normalizeMotionKey(raw: string): string {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface ResolveMotionOptions {
  preferredKind?: MotionPrimitiveKind;
  isPunchline?: boolean;
  applyEditorialSoftening?: boolean;
}

/**
 * Resolves any canonical primitive or fuzzy/LLM motion token (390+ aliases)
 * deterministically into a valid `MotionAction`.
 */
export function resolveMotionPrimitive(
  rawToken: string,
  preferredKind?: MotionPrimitiveKind,
  options?: Omit<ResolveMotionOptions, "preferredKind">
): MotionAction {
  const norm = normalizeMotionKey(rawToken);
  const kind = preferredKind;
  const isPunchline = options?.isPunchline ?? false;
  const soften = options?.applyEditorialSoftening ?? false;

  const maybeSoften = (tok: MotionAction): MotionAction => {
    if (!soften) return tok;
    if (tok === "shutter-flash") return "blur-snap";
    if (tok === "shake-alert" && !isPunchline) return "nudge";
    if (tok === "whip-slide") return "slide-left";
    if (tok === "elastic-open" && !isPunchline) return "pop-out";
    return tok;
  };

  if (kind === "entry") {
    if (isEntryAction(norm)) return maybeSoften(norm);
    if (ENTRY_MOTION_ALIASES[norm]) return maybeSoften(ENTRY_MOTION_ALIASES[norm]);
  } else if (kind === "exit") {
    if (isExitAction(norm)) return norm;
    if (EXIT_MOTION_ALIASES[norm]) return EXIT_MOTION_ALIASES[norm];
  } else if (kind === "in-place") {
    if (isInPlaceAction(norm)) return maybeSoften(norm);
    if (IN_PLACE_MOTION_ALIASES[norm]) return maybeSoften(IN_PLACE_MOTION_ALIASES[norm]);
  } else if (kind === "camera") {
    if (isCameraAction(norm)) return norm;
    if (CAMERA_MOTION_ALIASES[norm]) return CAMERA_MOTION_ALIASES[norm];
  }

  if (isMotionAction(norm)) return maybeSoften(norm);
  if (MOTION_ALIASES[norm]) return maybeSoften(MOTION_ALIASES[norm]);

  // Deterministic stem heuristic fallback within preferredKind so zero LLM tokens ever fail
  if (kind === "exit" || norm.indexOf("out") !== -1 || norm.indexOf("exit") !== -1 || norm.indexOf("close") !== -1) {
    if (norm.indexOf("shred") !== -1) return "shredder-strip-down";
    if (norm.indexOf("guillotine") !== -1 || norm.indexOf("sever") !== -1) return "guillotine-sever";
    if (norm.indexOf("tear") !== -1) return "paper-tear-split";
    if (norm.indexOf("fold") !== -1) return "origami-fold-away";
    return "fade-blur-out";
  }
  if (kind === "camera" || norm.indexOf("camera") !== -1 || norm.indexOf("dolly") !== -1 || norm.indexOf("shoulder") !== -1) {
    if (norm.indexOf("whip") !== -1) return "camera-whip-pan-left";
    if (norm.indexOf("orbit") !== -1) return "camera-isometric-orbit-cw";
    return "camera-dolly-in";
  }
  if (kind === "in-place") {
    if (norm.indexOf("pendulum") !== -1) return "pendulum-tick-1hz";
    if (norm.indexOf("gear") !== -1) return "gear-mesh-cw";
    if (norm.indexOf("radar") !== -1) return "radar-cone-360";
    return "highlight-sweep";
  }

  if (norm.indexOf("stamp") !== -1 || norm.indexOf("slam") !== -1) return "pneumatic-stamp-in";
  if (norm.indexOf("unroll") !== -1) return "blueprint-unroll-x";
  if (norm.indexOf("fold") !== -1) return "origami-valley-unfold";
  if (norm.indexOf("flap") !== -1 || norm.indexOf("solari") !== -1) return "solari-flap-cascade";
  return "blur-snap";
}

export const resolveMotionToken = resolveMotionPrimitive;

export interface ParsedMotionChain {
  enter: EntryAction;
  inPlace?: InPlaceAction;
  camera?: CameraAction;
  exit?: ExitAction;
}

/**
 * Parses a composable `enter -> inPlace/camera -> exit` chain string into typed primitives.
 */
export function parseMotionChain(
  chain: string,
  options?: { defaultEnter?: EntryAction; defaultExit?: ExitAction; isPunchline?: boolean }
): ParsedMotionChain {
  const parts = (chain || "")
    .split("->")
    .map((s) => s.trim())
    .filter(Boolean);

  let enter: EntryAction = options?.defaultEnter ?? "blur-snap";
  let inPlace: InPlaceAction | undefined;
  let camera: CameraAction | undefined;
  let exit: ExitAction | undefined;
  let hasEnter = false;

  for (let i = 0; i < parts.length; i++) {
    const key = normalizeMotionKey(parts[i]);
    if (!hasEnter && (isEntryAction(key) || ENTRY_MOTION_ALIASES[key])) {
      enter = isEntryAction(key) ? key : ENTRY_MOTION_ALIASES[key];
      hasEnter = true;
    } else if (!camera && (isCameraAction(key) || CAMERA_MOTION_ALIASES[key])) {
      camera = isCameraAction(key) ? key : CAMERA_MOTION_ALIASES[key];
      hasEnter = true;
    } else if (!inPlace && (isInPlaceAction(key) || IN_PLACE_MOTION_ALIASES[key])) {
      inPlace = isInPlaceAction(key) ? key : IN_PLACE_MOTION_ALIASES[key];
      hasEnter = true;
    } else if (!exit && (isExitAction(key) || EXIT_MOTION_ALIASES[key])) {
      exit = isExitAction(key) ? key : EXIT_MOTION_ALIASES[key];
    }
  }

  return {
    enter,
    ...(inPlace ? { inPlace } : {}),
    ...(camera ? { camera } : {}),
    ...(exit ? { exit } : options?.defaultExit ? { exit: options.defaultExit } : {}),
  };
}

/**
 * Returns the total number of deterministic motion primitives in the catalog (234).
 */
export function getMotionPrimitiveCount(): number {
  return MOTION_PRIMITIVE_CATALOG.length;
}

/**
 * Returns the number of unique canonical primitive IDs across all motion kinds (228).
 */
export function getUniqueMotionPrimitiveCount(): number {
  const seen = new Set<string>();
  for (let i = 0; i < MOTION_PRIMITIVE_CATALOG.length; i++) {
    seen.add(MOTION_PRIMITIVE_CATALOG[i].id);
  }
  return seen.size;
}

/**
 * Returns the total number of distinct aliased motion tokens supported by `resolveMotionPrimitive`
 * (combining phase-specific & unified alias mappings + canonical self-tokens).
 */
export function getMotionAliasCount(): number {
  const keys = new Set<string>();
  const addKeys = (obj: Readonly<Record<string, string>>) => {
    const k = Object.keys(obj);
    for (let i = 0; i < k.length; i++) {
      keys.add(k[i]);
    }
  };
  addKeys(ENTRY_MOTION_ALIASES);
  addKeys(EXIT_MOTION_ALIASES);
  addKeys(IN_PLACE_MOTION_ALIASES);
  addKeys(CAMERA_MOTION_ALIASES);
  for (let i = 0; i < MOTION_PRIMITIVE_CATALOG.length; i++) {
    keys.add(MOTION_PRIMITIVE_CATALOG[i].id);
  }
  return keys.size;
}
