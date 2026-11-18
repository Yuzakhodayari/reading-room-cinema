import { Easing, interpolate } from "remotion";

/**
 * Pillar #2 — Pure Frame-Deterministic Mathematical Motion & Physics Solvers
 *
 * Every solver is a pure function `f(frame, fps, opts)` with:
 * - ZERO `Math.random()` (uses stateless SplitMix32 integer hashing where micro-strain is needed)
 * - ZERO CSS transitions or keyframes
 * - Finite clamping and zero-duration / zero-fps guards across all boundaries
 */

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function clampRange(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.max(lo, Math.min(hi, value));
}

/**
 * Stateless SplitMix32 integer hash returning a deterministic value in [-1, 1].
 * Never mutates state and never calls Math.random().
 */
export function deterministicHashSigned(seed: number, step: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b9) ^ Math.imul(step | 0, 0x85ebca6b)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h = (h ^ (h >>> 16)) >>> 0;
  return (h / 2147483647.5) - 1.0;
}

/**
 * Smooth C2-continuous deterministic 1D signal in [-1, 1] for mechanical strain & camera breath.
 */
export function deterministicSignal1D(seed: number, coord: number): number {
  if (!Number.isFinite(coord)) return 0;
  const i0 = Math.floor(coord);
  const frac = coord - i0;
  // Quintic smoothstep: 6t^5 - 15t^4 + 10t^3
  const u = frac * frac * frac * (frac * (frac * 6 - 15) + 10);
  const v0 = deterministicHashSigned(seed, i0);
  const v1 = deterministicHashSigned(seed, i0 + 1);
  return v0 + (v1 - v0) * u;
}

// ============================================================================
// 1. Critically-Damped & Overdamped Editorial Spring (zeta >= 1.0)
// ============================================================================

export interface CriticalSpringOptions {
  startFrame?: number;
  durationFrames?: number;
  /** Damping ratio; strictly clamped to >= 1.0 so zero underdamped bounce can occur */
  zeta?: number;
  /** Natural angular frequency (rad/s) when not normalized by durationFrames */
  omega?: number;
  /** Normalized initial velocity (1/s) */
  initialVelocity?: number;
  from?: number;
  to?: number;
}

export interface CriticalSpringResult {
  value: number;
  progress: number;
  velocity: number;
  settled: boolean;
}

/**
 * Exact closed-form analytical solution to x'' + 2*zeta*omega*x' + omega^2*x = omega^2
 * strictly enforcing zeta >= 1.0 (critically damped or overdamped).
 */
export function criticallyDampedSpring(
  frame: number,
  fps: number,
  opts: CriticalSpringOptions = {}
): CriticalSpringResult {
  const safeFps = Math.max(1, Number.isFinite(fps) ? fps : 30);
  const startFrame = opts.startFrame ?? 0;
  const from = opts.from ?? 0;
  const to = opts.to ?? 1;
  const span = to - from;

  if (frame <= startFrame) {
    return { value: from, progress: 0, velocity: 0, settled: false };
  }

  const zeta = Math.max(1.0, opts.zeta ?? 1.05);
  const elapsedSec = (frame - startFrame) / safeFps;

  // If durationFrames is specified, scale omega so 99.7% settle occurs at durationFrames
  let omega = Math.max(0.5, opts.omega ?? 14.0);
  if (opts.durationFrames !== undefined) {
    const safeDurSec = Math.max(1 / safeFps, opts.durationFrames / safeFps);
    omega = (5.8 * zeta) / safeDurSec;
  }

  if (opts.durationFrames !== undefined && frame >= startFrame + Math.max(1, opts.durationFrames)) {
    return { value: to, progress: 1, velocity: 0, settled: true };
  }

  const v0 = opts.initialVelocity ?? 0;
  let rawProgress = 0;
  let normVelocity = 0;

  if (zeta <= 1.0001) {
    // Exact critically damped solution (zeta = 1)
    const expTerm = Math.exp(-omega * elapsedSec);
    const c2 = omega - v0;
    rawProgress = 1 - (1 + c2 * elapsedSec) * expTerm;
    normVelocity = (v0 + omega * c2 * elapsedSec) * expTerm;
  } else {
    // Exact overdamped solution (zeta > 1)
    const radical = Math.sqrt(zeta * zeta - 1);
    const r1 = -omega * (zeta - radical);
    const r2 = -omega * (zeta + radical);
    const denom = r1 - r2;
    const c1 = Math.abs(denom) > 1e-6 ? (v0 + r2) / denom : -1;
    const c2 = -1 - c1;
    const e1 = Math.exp(r1 * elapsedSec);
    const e2 = Math.exp(r2 * elapsedSec);
    rawProgress = 1 + c1 * e1 + c2 * e2;
    normVelocity = c1 * r1 * e1 + c2 * r2 * e2;
  }

  const progress = clamp01(rawProgress);
  const settled = progress >= 0.9985 && Math.abs(normVelocity) < 0.02;
  const finalProgress = settled ? 1 : progress;

  return {
    value: from + span * finalProgress,
    progress: finalProgress,
    velocity: settled ? 0 : normVelocity * span,
    settled,
  };
}

// ============================================================================
// 2. Hydraulic Press / Crush Curve
// ============================================================================

export interface HydraulicPressOptions {
  startFrame?: number;
  durationFrames?: number;
  /** Fraction of duration where slow high-pressure build yields into sudden collapse */
  yieldRatio?: number;
  /** Fraction of duration where steel platen hits hard mechanical stop */
  lockRatio?: number;
  /** Maximum travel distance in pixels */
  strokePx?: number;
  /** Minimum compressed vertical scale at full platen stop */
  minScaleY?: number;
  /** Lateral Poisson bulge factor under compression */
  poissonBulge?: number;
  seed?: number;
}

export interface HydraulicPressState {
  displacement: number;
  compressionScaleY: number;
  bulgeScaleX: number;
  pressure: number;
  strainX: number;
  locked: boolean;
}

/**
 * Slow high-pressure compression creep -> sudden structural buckling yield -> hard platen stop.
 */
export function hydraulicPressCurve(
  frame: number,
  fps: number,
  opts: HydraulicPressOptions = {}
): HydraulicPressState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const safeDur = Math.max(1, opts.durationFrames ?? 30);
  const u = clamp01((frame - startFrame) / safeDur);

  const yieldRatio = clampRange(opts.yieldRatio ?? 0.62, 0.2, 0.85);
  const lockRatio = clampRange(opts.lockRatio ?? 0.82, yieldRatio + 0.06, 0.96);
  const strokePx = opts.strokePx ?? 120;
  const minScaleY = clampRange(opts.minScaleY ?? 0.14, 0.02, 1);
  const poisson = clampRange(opts.poissonBulge ?? 0.16, 0, 0.45);
  const seed = opts.seed ?? 109;

  const creepFraction = 0.22;
  let normTravel = 0;
  let pressure = 0;
  let strainX = 0;

  if (u <= 0) {
    return {
      displacement: 0,
      compressionScaleY: 1,
      bulgeScaleX: 1,
      pressure: 0,
      strainX: 0,
      locked: false,
    };
  }

  if (u < yieldRatio) {
    // Phase 1: Slow high-pressure hydraulic ramp + micro-strain
    const r = clamp01(u / yieldRatio);
    pressure = Math.pow(r, 1.85);
    normTravel = creepFraction * Math.pow(r, 1.35);
    strainX = deterministicSignal1D(seed, frame * 0.85) * 1.15 * pressure;
  } else if (u < lockRatio) {
    // Phase 2: Sudden structural buckling collapse
    const r = clamp01((u - yieldRatio) / Math.max(0.001, lockRatio - yieldRatio));
    const snap = interpolate(r, [0, 1], [0, 1], {
      easing: Easing.bezier(0.55, 0.02, 0.92, 0.98),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    normTravel = creepFraction + (1 - creepFraction) * snap;
    pressure = 1 - 0.35 * snap;
    strainX = deterministicSignal1D(seed, frame * 1.2) * 0.8 * (1 - r);
  } else {
    // Phase 3: Hard mechanical platen stop (zero penetration past 1.0, crisp platen shudder)
    const r = clamp01((u - lockRatio) / Math.max(0.001, 1 - lockRatio));
    const platenShudder = r >= 0.99 ? 0 : Math.sin(r * Math.PI * 3) * Math.exp(-r * 6) * 0.012;
    normTravel = 1 - Math.abs(platenShudder);
    pressure = 0.65 * Math.exp(-r * 4);
    strainX = 0;
  }

  const clampedTravel = clamp01(normTravel);
  return {
    displacement: clampedTravel * strokePx,
    compressionScaleY: 1 - (1 - minScaleY) * clampedTravel,
    bulgeScaleX: 1 + poisson * clampedTravel,
    pressure: clamp01(pressure),
    strainX,
    locked: u >= lockRatio,
  };
}

// ============================================================================
// 3. Solari Split-Flap Stepper
// ============================================================================

export interface SolariFlapOptions {
  startFrame?: number;
  durationFrames?: number;
  flapCount?: number;
  maxLeafAngleDeg?: number;
}

export interface SolariFlapState {
  stepIndex: number;
  stepProgress: number;
  flapAngleDeg: number;
  brightness: number;
  clickImpulse: number;
  settled: boolean;
}

/**
 * Mechanical airport / Treasury board split-flap drum stepper with gravity leaf fall.
 */
export function solariFlapStepper(
  frame: number,
  fps: number,
  opts: SolariFlapOptions = {}
): SolariFlapState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const safeDur = Math.max(1, opts.durationFrames ?? 20);
  const flapCount = Math.max(1, Math.round(opts.flapCount ?? 5));
  const maxAngle = opts.maxLeafAngleDeg ?? 88;

  if (frame <= startFrame) {
    return {
      stepIndex: 0,
      stepProgress: 0,
      flapAngleDeg: -maxAngle,
      brightness: 0.84,
      clickImpulse: 0,
      settled: false,
    };
  }

  const u = clamp01((frame - startFrame) / safeDur);
  if (u >= 0.999) {
    return {
      stepIndex: flapCount,
      stepProgress: 1,
      flapAngleDeg: 0,
      brightness: 1,
      clickImpulse: 0,
      settled: true,
    };
  }

  // Reserve final 18% of duration for final card settle
  const flipPhaseRatio = 0.82;
  if (u < flipPhaseRatio) {
    const scaled = (u / flipPhaseRatio) * flapCount;
    const stepIndex = Math.min(flapCount - 1, Math.floor(scaled));
    const local = scaled - stepIndex;
    // Gravity t^2 leaf acceleration from -maxAngle -> 0 per card click
    const fall = local * local;
    const angle = -maxAngle * (1 - fall);
    const clickImpulse = Math.exp(-Math.pow((local - 0.92) / 0.08, 2));
    const brightness = 0.86 + 0.14 * fall;
    return {
      stepIndex,
      stepProgress: local,
      flapAngleDeg: angle,
      brightness,
      clickImpulse,
      settled: false,
    };
  }

  const settleT = clamp01((u - flipPhaseRatio) / (1 - flipPhaseRatio));
  const pawlSettle = Math.sin(settleT * Math.PI * 2) * Math.exp(-settleT * 5) * 2.4;
  return {
    stepIndex: flapCount,
    stepProgress: 1,
    flapAngleDeg: pawlSettle,
    brightness: 1,
    clickImpulse: Math.exp(-settleT * 8) * 0.5,
    settled: settleT >= 0.98,
  };
}

// ============================================================================
// 4. Damped Pendulum Kinematics
// ============================================================================

export interface PendulumOptions {
  startFrame?: number;
  initialAngleDeg?: number;
  armLengthPx?: number;
  damping?: number;
  frequencyHz?: number;
  phaseRad?: number;
}

export interface PendulumState {
  angleDeg: number;
  angularVelocity: number;
  bobX: number;
  bobY: number;
  settled: boolean;
}

/**
 * Circular-arc damped pendulum solver computing pivot-true bobX/bobY and angleDeg.
 */
export function dampedPendulum(
  frame: number,
  fps: number,
  opts: PendulumOptions = {}
): PendulumState {
  const safeFps = Math.max(1, Number.isFinite(fps) ? fps : 30);
  const startFrame = opts.startFrame ?? 0;
  const theta0Deg = opts.initialAngleDeg ?? 24;
  const armLengthPx = Math.max(0, opts.armLengthPx ?? 90);
  const gamma = Math.max(0, opts.damping ?? 2.6);
  const freqHz = Math.max(0.15, opts.frequencyHz ?? 1.45);
  const omegaD = freqHz * Math.PI * 2;
  const phase = opts.phaseRad ?? 0;

  const t = Math.max(0, (frame - startFrame) / safeFps);
  const env = Math.exp(-gamma * t);
  const angleDeg = theta0Deg * env * Math.cos(omegaD * t + phase);
  const angularVelocity =
    -theta0Deg * env * (gamma * Math.cos(omegaD * t + phase) + omegaD * Math.sin(omegaD * t + phase));

  const settled = env < 0.003;
  const cleanAngleDeg = settled ? 0 : angleDeg;
  const rad = (cleanAngleDeg * Math.PI) / 180;

  return {
    angleDeg: cleanAngleDeg,
    angularVelocity: settled ? 0 : angularVelocity,
    bobX: armLengthPx * Math.sin(rad),
    bobY: armLengthPx * (1 - Math.cos(rad)),
    settled,
  };
}

// ============================================================================
// 5. Domino Tip Cascade
// ============================================================================

export interface DominoCascadeOptions {
  startFrame?: number;
  durationFrames?: number;
  index?: number;
  count?: number;
  leanAngleDeg?: number;
  finalAngleDeg?: number;
  spacingPx?: number;
}

export interface DominoCascadeState {
  angleDeg: number;
  pivotShiftX: number;
  contactImpulse: number;
  fallen: boolean;
  progress: number;
}

/**
 * Chain-propagating inverted-pendulum domino topple with hard neighbor-lean stop.
 */
export function dominoCascade(
  frame: number,
  fps: number,
  opts: DominoCascadeOptions = {}
): DominoCascadeState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const safeDur = Math.max(1, opts.durationFrames ?? 30);
  const count = Math.max(1, Math.round(opts.count ?? 5));
  const index = clampRange(Math.round(opts.index ?? 0), 0, count - 1);
  const isLast = index === count - 1;
  const targetAngle = isLast ? (opts.finalAngleDeg ?? 76) : (opts.leanAngleDeg ?? 32);
  const spacingPx = opts.spacingPx ?? 36;

  const u = clamp01((frame - startFrame) / safeDur);
  const propagationWindow = 0.68;
  const hitStart = count > 1 ? (index / count) * propagationWindow : 0;
  const fallWindow = Math.max(0.14, 1 - propagationWindow);

  if (u <= hitStart) {
    return {
      angleDeg: 0,
      pivotShiftX: 0,
      contactImpulse: 0,
      fallen: false,
      progress: 0,
    };
  }

  const local = clamp01((u - hitStart) / fallWindow);
  // Inverted pendulum hyperbolic acceleration: (cosh(2.1*t) - 1) / (cosh(2.1) - 1)
  const coshMax = Math.cosh(2.1) - 1;
  const rawFall = clamp01((Math.cosh(2.1 * local) - 1) / coshMax);

  // Micro arrest recoil on neighbor contact
  const impactSpot = local >= 0.92 ? (local - 0.92) / 0.08 : 0;
  const recoil = local >= 0.92 && local < 0.999 ? Math.sin(impactSpot * Math.PI) * -1.4 : 0;
  const angleDeg = clampRange(targetAngle * rawFall + recoil, 0, 88);
  const contactImpulse = Math.exp(-Math.pow((local - 0.94) / 0.06, 2));

  return {
    angleDeg,
    pivotShiftX: Math.sin((angleDeg * Math.PI) / 180) * spacingPx,
    contactImpulse,
    fallen: local >= 0.95,
    progress: rawFall,
  };
}

// ============================================================================
// 6. Gear Tooth Interlock Stepping (Geneva / Escapement Indexing)
// ============================================================================

export interface GearInterlockOptions {
  startFrame?: number;
  teethCount?: number;
  stepPeriodFrames?: number;
  dwellRatio?: number;
  gearRatio?: number;
  direction?: 1 | -1;
}

export interface GearInterlockState {
  angleDeg: number;
  drivenAngleDeg: number;
  toothIndex: number;
  dwellPhase: boolean;
  backlashDeg: number;
}

/**
 * Intermittent Geneva-wheel / escapement gear tooth indexing with counter-meshed partner angle.
 */
export function gearInterlock(
  frame: number,
  fps: number,
  opts: GearInterlockOptions = {}
): GearInterlockState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const teeth = Math.max(3, Math.round(opts.teethCount ?? 12));
  const stepPeriod = Math.max(2, opts.stepPeriodFrames ?? 15);
  const dwellRatio = clampRange(opts.dwellRatio ?? 0.45, 0.05, 0.88);
  const ratio = opts.gearRatio ?? 1.0;
  const dir = opts.direction ?? 1;

  const elapsed = Math.max(0, frame - startFrame);
  const toothPitchDeg = 360 / teeth;
  const toothIndex = Math.floor(elapsed / stepPeriod);
  const cyclePos = (elapsed % stepPeriod) / stepPeriod;
  const movePortion = 1 - dwellRatio;

  let intraTooth = 1;
  let backlashDeg = 0;
  let dwellPhase = true;

  if (cyclePos < movePortion) {
    dwellPhase = false;
    const m = clamp01(cyclePos / Math.max(0.001, movePortion));
    // Cycloidal cam profile: m - sin(2*pi*m)/(2*pi) -> zero velocity/accel at pin entry & exit
    intraTooth = m - Math.sin(2 * Math.PI * m) / (2 * Math.PI);
  } else {
    const d = clamp01((cyclePos - movePortion) / Math.max(0.001, dwellRatio));
    backlashDeg = d >= 0.98 ? 0 : Math.sin(d * Math.PI * 2.5) * Math.exp(-d * 6.5) * 0.85 * dir;
  }

  const angleDeg = dir * (toothIndex + intraTooth) * toothPitchDeg + backlashDeg;
  const drivenAngleDeg = -angleDeg * ratio + toothPitchDeg * 0.5;

  return {
    angleDeg,
    drivenAngleDeg,
    toothIndex,
    dwellPhase,
    backlashDeg,
  };
}

// ============================================================================
// 7. Pneumatic Stamp (1.32 -> 1.00 impact + iron anvil micro-recoil)
// ============================================================================

export interface PneumaticStampOptions {
  startFrame?: number;
  durationFrames?: number;
  startScale?: number;
  impactRatio?: number;
  initialTiltDeg?: number;
}

export interface PneumaticStampState {
  scale: number;
  anvilRecoilY: number;
  rotationDeg: number;
  impactImpulse: number;
  blurPx: number;
  opacity: number;
}

/**
 * High-velocity pneumatic cylinder stamp (1.32 -> 1.00) with iron anvil stop & 2-cycle micro-recoil.
 */
export function pneumaticStamp(
  frame: number,
  fps: number,
  opts: PneumaticStampOptions = {}
): PneumaticStampState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const safeDur = Math.max(1, opts.durationFrames ?? 14);
  const startScale = opts.startScale ?? 1.32;
  const impactRatio = clampRange(opts.impactRatio ?? 0.36, 0.18, 0.72);
  const tilt0 = opts.initialTiltDeg ?? -4.2;

  if (frame <= startFrame) {
    return {
      scale: startScale,
      anvilRecoilY: -18,
      rotationDeg: tilt0,
      impactImpulse: 0,
      blurPx: 3.5,
      opacity: 0,
    };
  }

  const u = clamp01((frame - startFrame) / safeDur);
  if (u >= 0.999) {
    return {
      scale: 1,
      anvilRecoilY: 0,
      rotationDeg: 0,
      impactImpulse: 0,
      blurPx: 0,
      opacity: 1,
    };
  }

  if (u < impactRatio) {
    // High-pressure cylinder drive down to anvil
    const r = clamp01(u / impactRatio);
    const drive = r * r * (2 - r);
    return {
      scale: startScale - (startScale - 1.0) * drive,
      anvilRecoilY: -18 * (1 - drive),
      rotationDeg: tilt0 * (1 - drive),
      impactImpulse: Math.pow(r, 4) * 0.6,
      blurPx: (1 - drive) * 3.5,
      opacity: clamp01(r * 2.4),
    };
  }

  // Anvil contact & high-stiffness micro-recoil (1.00 -> 0.984 -> 1.006 -> 1.00)
  const after = clamp01((u - impactRatio) / Math.max(0.001, 1 - impactRatio));
  const decay = Math.exp(-after * 6.2);
  const anvilOsc = -Math.sin(after * Math.PI * 2.8) * decay;
  const scale = 1.0 + anvilOsc * 0.018;
  const anvilRecoilY = Math.sin(after * Math.PI * 3.2) * decay * 3.2;
  const impactImpulse = Math.exp(-after * 9.0);

  return {
    scale,
    anvilRecoilY,
    rotationDeg: anvilOsc * 0.45,
    impactImpulse,
    blurPx: 0,
    opacity: 1,
  };
}

// ============================================================================
// 8. Guillotine Drop with Frame-Lock Stop
// ============================================================================

export interface GuillotineOptions {
  startFrame?: number;
  durationFrames?: number;
  dropHeightPx?: number;
  lockRatio?: number;
}

export interface GuillotineState {
  translateY: number;
  velocity: number;
  latchShearX: number;
  clipProgress: number;
  locked: boolean;
}

/**
 * Constant-gravity drop into a zero-bounce mechanical frame lock + horizontal pin-latch shear.
 */
export function guillotineDrop(
  frame: number,
  fps: number,
  opts: GuillotineOptions = {}
): GuillotineState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const safeDur = Math.max(1, opts.durationFrames ?? 14);
  const dropHeightPx = Math.max(1, opts.dropHeightPx ?? 210);
  const lockRatio = clampRange(opts.lockRatio ?? 0.56, 0.25, 0.88);

  if (frame <= startFrame) {
    return {
      translateY: -dropHeightPx,
      velocity: 0,
      latchShearX: 0,
      clipProgress: 0,
      locked: false,
    };
  }

  const u = clamp01((frame - startFrame) / safeDur);
  if (u >= 0.999) {
    return {
      translateY: 0,
      velocity: 0,
      latchShearX: 0,
      clipProgress: 1,
      locked: true,
    };
  }

  if (u < lockRatio) {
    const r = clamp01(u / lockRatio);
    const fall = r * r;
    return {
      translateY: -dropHeightPx * (1 - fall),
      velocity: 2 * r * dropHeightPx,
      latchShearX: 0,
      clipProgress: clamp01(fall * 1.05),
      locked: false,
    };
  }

  // Locked hard at y = 0 (zero upward bounce; brief horizontal latch-pin shear)
  const post = clamp01((u - lockRatio) / Math.max(0.001, 1 - lockRatio));
  const latchShearX = Math.sin(post * Math.PI * 4) * Math.exp(-post * 7.5) * 2.6;
  return {
    translateY: 0,
    velocity: 0,
    latchShearX,
    clipProgress: 1,
    locked: true,
  };
}

// ============================================================================
// 9. Buoyancy / Slosh Harmonics
// ============================================================================

export interface BuoyancyOptions {
  startFrame?: number;
  heaveAmplitudePx?: number;
  surgeAmplitudePx?: number;
  rollAmplitudeDeg?: number;
  sloshTiltDeg?: number;
  baseFrequencyHz?: number;
  damping?: number;
  phaseOffset?: number;
}

export interface BuoyancyState {
  heaveY: number;
  surgeX: number;
  rollDeg: number;
  surfaceTiltDeg: number;
  waterlineOffset: number;
}

/**
 * Coupled multi-harmonic fluid displacement heave, surge, hull roll, and slosh tilt.
 */
export function buoyancyHarmonics(
  frame: number,
  fps: number,
  opts: BuoyancyOptions = {}
): BuoyancyState {
  const safeFps = Math.max(1, Number.isFinite(fps) ? fps : 30);
  const startFrame = opts.startFrame ?? 0;
  const t = Math.max(0, (frame - startFrame) / safeFps);

  const heaveAmp = opts.heaveAmplitudePx ?? 6.5;
  const surgeAmp = opts.surgeAmplitudePx ?? 3.8;
  const rollAmp = opts.rollAmplitudeDeg ?? 1.8;
  const sloshAmp = opts.sloshTiltDeg ?? 2.4;
  const w0 = Math.max(0.1, opts.baseFrequencyHz ?? 0.55) * Math.PI * 2;
  const damping = Math.max(0, opts.damping ?? 0);
  const phi = opts.phaseOffset ?? 0;

  const env = damping > 0 ? Math.exp(-damping * t) : 1;
  // Golden-ratio & sqrt(2) modal separation avoids mechanical loop periodicity
  const wRoll = w0 * 0.618034;
  const wSurge = w0 * 0.707107;
  const wSlosh = w0 * 1.27202;

  const heaveY =
    env * heaveAmp * (0.72 * Math.sin(w0 * t + phi) + 0.28 * Math.cos(w0 * 1.618 * t + phi * 0.5));
  const surgeX = env * surgeAmp * Math.cos(wSurge * t + phi + 0.6);
  const rollDeg =
    env * rollAmp * (0.78 * Math.sin(wRoll * t + phi + 0.35) + 0.22 * Math.sin(w0 * 1.15 * t));
  const surfaceTiltDeg = -env * sloshAmp * Math.cos(wSlosh * t + phi);

  return {
    heaveY,
    surgeX,
    rollDeg,
    surfaceTiltDeg,
    waterlineOffset: heaveY * 0.6,
  };
}

// ============================================================================
// 10. Conveyor Ratchet Steps
// ============================================================================

export interface ConveyorRatchetOptions {
  startFrame?: number;
  stepDistancePx?: number;
  stepPeriodFrames?: number;
  advanceRatio?: number;
  maxSteps?: number;
  direction?: 1 | -1;
}

export interface ConveyorRatchetState {
  offsetX: number;
  stepIndex: number;
  beltVelocity: number;
  pawlCatchRecoil: number;
  isDwelling: boolean;
}

/**
 * Discrete belt/platen ratchet step advance with pawl-catch recoil & flat inspection dwell.
 */
export function conveyorRatchet(
  frame: number,
  fps: number,
  opts: ConveyorRatchetOptions = {}
): ConveyorRatchetState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const stepDist = opts.stepDistancePx ?? 48;
  const period = Math.max(2, opts.stepPeriodFrames ?? 12);
  const advRatio = clampRange(opts.advanceRatio ?? 0.42, 0.1, 0.85);
  const dir = opts.direction ?? 1;
  const maxSteps = opts.maxSteps;

  const elapsed = Math.max(0, frame - startFrame);
  const rawStep = Math.floor(elapsed / period);
  if (maxSteps !== undefined && rawStep >= maxSteps) {
    return {
      offsetX: dir * maxSteps * stepDist,
      stepIndex: maxSteps,
      beltVelocity: 0,
      pawlCatchRecoil: 0,
      isDwelling: true,
    };
  }

  const cycle = (elapsed % period) / period;
  let intra = 1;
  let recoil = 0;
  let velocity = 0;
  let isDwelling = true;

  if (cycle < advRatio) {
    isDwelling = false;
    const r = clamp01(cycle / Math.max(0.001, advRatio));
    intra = 1 - Math.pow(1 - r, 3);
    velocity = 3 * Math.pow(1 - r, 2) * stepDist * dir;
  } else {
    const d = clamp01((cycle - advRatio) / Math.max(0.001, 1 - advRatio));
    recoil = d >= 0.96 ? 0 : -Math.sin(d * Math.PI * 2) * Math.exp(-d * 6) * 2.1 * dir;
  }

  return {
    offsetX: dir * (rawStep + intra) * stepDist + recoil,
    stepIndex: rawStep,
    beltVelocity: velocity,
    pawlCatchRecoil: recoil,
    isDwelling,
  };
}

// ============================================================================
// 11. Seismic Shockwave Decay
// ============================================================================

export interface SeismicOptions {
  startFrame?: number;
  durationFrames?: number;
  amplitudePx?: number;
  shearAmplitudeDeg?: number;
  seed?: number;
}

export interface SeismicState {
  offsetX: number;
  offsetY: number;
  shearDeg: number;
  scaleJitter: number;
  envelope: number;
}

/**
 * Two-stage P-wave primary jolt + S-wave shear wave packet decaying to exact rest.
 */
export function seismicShockwave(
  frame: number,
  fps: number,
  opts: SeismicOptions = {}
): SeismicState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const safeDur = Math.max(1, opts.durationFrames ?? 28);
  const amp = opts.amplitudePx ?? 11;
  const shearAmp = opts.shearAmplitudeDeg ?? 1.8;
  const seed = opts.seed ?? 409;

  if (frame < startFrame || frame >= startFrame + safeDur) {
    return { offsetX: 0, offsetY: 0, shearDeg: 0, scaleJitter: 0, envelope: 0 };
  }

  const u = clamp01((frame - startFrame) / safeDur);
  // P-wave immediate vertical shock + S-wave delayed shear packet (u * exp(-5.2*u))
  const pWave = Math.exp(-u * 14);
  const sWave = u * 4.2 * Math.exp(-u * 5.2);
  // Smooth fade-to-zero window over final 15% guarantees exact 0 at u=1
  const tailWindow = u > 0.85 ? (1 - u) / 0.15 : 1;
  const envelope = clamp01((0.45 * pWave + 0.85 * sWave) * tailWindow);

  const phase = frame - startFrame;
  const offsetX =
    amp * envelope * (0.7 * Math.sin(phase * 2.35) + 0.3 * deterministicSignal1D(seed, phase * 0.9));
  const offsetY =
    amp * 0.65 * (pWave * -Math.cos(phase * 3.1) + sWave * Math.sin(phase * 1.9)) * tailWindow;
  const shearDeg = shearAmp * envelope * Math.cos(phase * 2.1);
  const scaleJitter = 0.014 * pWave * tailWindow * Math.cos(phase * 3.4);

  return {
    offsetX,
    offsetY,
    shearDeg,
    scaleJitter,
    envelope,
  };
}

// ============================================================================
// 12. Radar Sweep
// ============================================================================

export interface RadarSweepOptions {
  startFrame?: number;
  periodFrames?: number;
  targetBearingDeg?: number;
}

export interface RadarSweepState {
  azimuthDeg: number;
  sweepNormalized: number;
  pingIntensity: number;
  phosphorGlow: number;
  beamCos: number;
  beamSin: number;
}

/**
 * Constant-velocity azimuth sweep with exponential phosphor wake & target contact ping.
 */
export function radarSweep(
  frame: number,
  fps: number,
  opts: RadarSweepOptions = {}
): RadarSweepState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const period = Math.max(4, opts.periodFrames ?? 60);
  const targetDeg = ((opts.targetBearingDeg ?? 65) % 360 + 360) % 360;

  const elapsed = Math.max(0, frame - startFrame);
  const sweepNormalized = (elapsed % period) / period;
  const azimuthDeg = sweepNormalized * 360;

  // Angular distance behind beam for phosphor persistence wake
  const wakeDeg = ((azimuthDeg - targetDeg) % 360 + 360) % 360;
  const pingIntensity = Math.exp(-wakeDeg / 26);
  const phosphorGlow = 0.35 + 0.65 * Math.exp(-wakeDeg / 95);
  const rad = (azimuthDeg * Math.PI) / 180;

  return {
    azimuthDeg,
    sweepNormalized,
    pingIntensity: clamp01(pingIntensity),
    phosphorGlow: clamp01(phosphorGlow),
    beamCos: Math.cos(rad),
    beamSin: Math.sin(rad),
  };
}

// ============================================================================
// 13. Elastic Cable Tension & Snap Recoil
// ============================================================================

export interface CableSnapOptions {
  startFrame?: number;
  durationFrames?: number;
  snapRatio?: number;
  pullDistancePx?: number;
  maxStretch?: number;
}

export interface CableSnapState {
  displacement: number;
  stretchScaleX: number;
  stretchScaleY: number;
  whipSkewDeg: number;
  tension: number;
  snapped: boolean;
}

/**
 * Hookean cable elongation & high-frequency taut hum -> tensile snap -> damped whip recoil.
 */
export function elasticCableSnap(
  frame: number,
  fps: number,
  opts: CableSnapOptions = {}
): CableSnapState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const safeDur = Math.max(1, opts.durationFrames ?? 28);
  const snapRatio = clampRange(opts.snapRatio ?? 0.54, 0.15, 0.85);
  const pullPx = opts.pullDistancePx ?? 34;
  const maxStretch = clampRange(opts.maxStretch ?? 0.14, 0.02, 0.35);

  if (frame <= startFrame) {
    return {
      displacement: 0,
      stretchScaleX: 1,
      stretchScaleY: 1,
      whipSkewDeg: 0,
      tension: 0,
      snapped: false,
    };
  }

  const u = clamp01((frame - startFrame) / safeDur);
  if (u >= 0.999) {
    return {
      displacement: 0,
      stretchScaleX: 1,
      stretchScaleY: 1,
      whipSkewDeg: 0,
      tension: 0,
      snapped: true,
    };
  }

  if (u < snapRatio) {
    // Taut Hookean tension ramp + wire hum
    const r = clamp01(u / snapRatio);
    const tension = Math.pow(r, 1.4);
    const hum = Math.sin((frame - startFrame) * 2.9) * 1.4 * tension;
    return {
      displacement: -pullPx * tension + hum,
      stretchScaleX: 1 + maxStretch * tension,
      stretchScaleY: 1 - maxStretch * 0.48 * tension,
      whipSkewDeg: -3.2 * tension,
      tension,
      snapped: false,
    };
  }

  // Sudden tensile release & damped transverse whip oscillation back to rest
  const post = clamp01((u - snapRatio) / Math.max(0.001, 1 - snapRatio));
  const decay = Math.exp(-post * 5.8) * (1 - post);
  const osc = Math.cos(post * Math.PI * 3.5) * decay;
  return {
    displacement: pullPx * 0.65 * osc,
    stretchScaleX: 1 - maxStretch * 0.75 * osc,
    stretchScaleY: 1 + maxStretch * 0.45 * osc,
    whipSkewDeg: 7.5 * Math.sin(post * Math.PI * 3.5) * decay,
    tension: 0,
    snapped: true,
  };
}

// ============================================================================
// 14. Origami 3D Perspective Fold
// ============================================================================

export interface OrigamiFoldOptions {
  startFrame?: number;
  durationFrames?: number;
  creaseMode?: "valley" | "mountain" | "diagonal";
  maxFoldDeg?: number;
  direction?: "unfold" | "fold";
}

export interface OrigamiFoldState {
  rotateXDeg: number;
  rotateYDeg: number;
  translateZPx: number;
  scale: number;
  clipInsetPct: number;
  shadingBrightness: number;
  settled: boolean;
}

/**
 * Multi-crease 3D rigid-panel perspective fold with foreshortened clipInset & Lambertian paper shading.
 */
export function origamiFold3D(
  frame: number,
  fps: number,
  opts: OrigamiFoldOptions = {}
): OrigamiFoldState {
  void fps;
  const startFrame = opts.startFrame ?? 0;
  const safeDur = Math.max(1, opts.durationFrames ?? 18);
  const mode = opts.creaseMode ?? "valley";
  const maxDeg = clampRange(opts.maxFoldDeg ?? 74, 15, 88);
  const isFoldOut = opts.direction === "fold";

  const rawU = clamp01((frame - startFrame) / safeDur);
  const eased = interpolate(rawU, [0, 1], [0, 1], {
    easing: Easing.bezier(0.18, 0.92, 0.28, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // foldFactor = 1 means fully folded; 0 means flat open sheet
  const foldFactor = isFoldOut ? eased : 1 - eased;

  let rx = 0;
  let ry = 0;
  if (mode === "valley") {
    rx = maxDeg * foldFactor;
    ry = -maxDeg * 0.24 * Math.sin(foldFactor * Math.PI * 0.85);
  } else if (mode === "mountain") {
    rx = -maxDeg * foldFactor;
    ry = maxDeg * 0.28 * foldFactor;
  } else {
    rx = maxDeg * 0.68 * foldFactor;
    ry = -maxDeg * 0.72 * foldFactor;
  }

  const rad = (Math.max(Math.abs(rx), Math.abs(ry)) * Math.PI) / 180;
  // Lambertian paper shading (0.86..1.00 — calm editorial paper shadow, zero flash)
  const shadingBrightness = 0.86 + 0.14 * Math.cos(rad * 0.85);
  const clipInsetPct = clampRange(foldFactor * 34, 0, 48);
  const translateZPx = -foldFactor * 64;
  const scale = 1 - foldFactor * 0.12;

  return {
    rotateXDeg: rx,
    rotateYDeg: ry,
    translateZPx,
    scale,
    clipInsetPct,
    shadingBrightness,
    settled: isFoldOut ? rawU >= 0.999 : rawU >= 0.999,
  };
}

// ============================================================================
// 15. Logarithmic Group Stagger (staggerDelayFrames)
// ============================================================================

export interface LogarithmicStaggerOptions {
  startFrame?: number;
  baseGapFrames?: number;
  maxTotalDelayFrames?: number;
  /** Logarithmic compression curvature (> 0). Higher compresses tail items faster. */
  curvature?: number;
}

/**
 * Computes deterministic logarithmic group stagger offsets in frames.
 * Early items separate clearly while large groups (10–30 ledger rows) never drag past maxTotalDelayFrames.
 */
export function staggerDelayFrames(
  index: number,
  totalCount: number = 8,
  opts: LogarithmicStaggerOptions = {}
): number {
  const startFrame = opts.startFrame ?? 0;
  const safeIndex = Math.max(0, Math.floor(Number.isFinite(index) ? index : 0));
  const safeTotal = Math.max(1, Math.floor(Number.isFinite(totalCount) ? totalCount : 1));

  if (safeIndex === 0 || safeTotal <= 1) {
    return startFrame;
  }

  const baseGap = Math.max(1, opts.baseGapFrames ?? 4);
  const maxTotal = Math.max(
    baseGap,
    opts.maxTotalDelayFrames ?? Math.min(36, baseGap * Math.min(safeTotal - 1, 9))
  );
  const curvature = Math.max(0.15, opts.curvature ?? 0.65);

  const clampedIdx = Math.min(safeIndex, safeTotal - 1);
  const denom = Math.log(1 + curvature * (safeTotal - 1));
  if (denom <= 1e-6) {
    return startFrame;
  }

  const normalized = Math.log(1 + curvature * clampedIdx) / denom;
  const linearCeiling = clampedIdx * baseGap;
  const delay = Math.min(linearCeiling, maxTotal * normalized);

  return startFrame + Math.round(delay);
}
