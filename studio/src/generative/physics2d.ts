import {
  BomVaporizerMechanismConfig,
  CircularCarouselMechanismConfig,
  HydraulicSpillwayMechanismConfig,
  MechanismConfig,
  SandErosionMechanismConfig,
  TensionSnapMechanismConfig,
  TorqueScaleMechanismConfig,
} from "./blueprintTypes";

/**
 * Pillar #13 — Deterministic Random-Access 2D Physics & Mechanism Lab
 *
 * Every evaluator is a pure closed-form mathematical function of (config, frame, fps, totalFrames).
 * Zero Math.random(), zero mutable state across frames, O(1) random-access evaluation
 * across parallel Remotion headless Chromium workers.
 */

export function clamp01(val: number): number {
  if (val <= 0) return 0;
  if (val >= 1) return 1;
  return val;
}

export function clampRange(val: number, minVal: number, maxVal: number): number {
  return Math.max(minVal, Math.min(maxVal, val));
}

/**
 * Deterministic string-to-uint32 hash (FNV-1a 32-bit) for stable seeds.
 */
export function hashStringSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministic Mulberry32 PRNG returning values in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Analytical second-order damped harmonic step response y(t) in [0..~1.08..1.0]
 * for natural frequency omegaN (rad/s) and damping ratio zeta (0 < zeta < 1).
 */
export function dampedStepResponse(
  elapsedSec: number,
  omegaN: number,
  zeta: number
): number {
  if (elapsedSec <= 0) return 0;
  const safeZeta = clampRange(zeta, 0.05, 0.999);
  const omegaD = omegaN * Math.sqrt(1 - safeZeta * safeZeta);
  const decay = Math.exp(-safeZeta * omegaN * elapsedSec);
  const sinCoeff = safeZeta / Math.sqrt(1 - safeZeta * safeZeta);
  return (
    1 -
    decay *
      (Math.cos(omegaD * elapsedSec) + sinCoeff * Math.sin(omegaD * elapsedSec))
  );
}

// ============================================================================
// 1. Torque Balance Scale State & Evaluator
// ============================================================================

export interface TorqueScaleState {
  kind: "torque-scale";
  id: string;
  /** Positive = right pan heavier (tilts clockwise), Negative = left pan heavier (tilts counter-clockwise) */
  tiltDeg: number;
  angularVelocityDegPerSec: number;
  leftPanOffsetX: number;
  leftPanOffsetY: number;
  rightPanOffsetX: number;
  rightPanOffsetY: number;
  imbalanceRatio: number;
  heavierSide: "left" | "right" | "balanced";
  strainNormalized: number;
}

export function evaluateTorqueScale(
  config: TorqueScaleMechanismConfig,
  frame: number,
  fps: number,
  totalFrames: number = 180
): TorqueScaleState {
  const safeFps = Math.max(1, fps);
  const safeTotal = Math.max(30, totalFrames);
  const releaseFrame = Math.round(
    clampRange(config.releaseAtProgress ?? 0.1, 0, 0.85) * safeTotal
  );
  const maxTilt = config.maxTiltDeg ?? 21;
  const halfBeam = (config.beamSpanPx ?? 380) * 0.5;

  const eps = 0.0001;
  const wL = Math.max(0, config.leftWeight);
  const wR = Math.max(0, config.rightWeight);
  const maxW = Math.max(wL, wR, eps);
  const minW = Math.max(Math.min(wL, wR), eps);
  const imbalanceRatio = maxW / minW;

  // Logarithmic torque compression so both 3:1 and 200:1 scales articulate cleanly without pegging prematurely
  const logDelta = Math.log((wR + eps) / (wL + eps));
  const normalizedTorque = Math.tanh(logDelta * 0.42); // [-1, 1]; <0 means left heavier, >0 means right heavier
  const targetTiltDeg = normalizedTorque * maxTilt;

  const elapsedSec = Math.max(0, (frame - releaseFrame) / safeFps);
  const omegaN = 5.2;
  const zeta = 0.82;
  const step = dampedStepResponse(elapsedSec, omegaN, zeta);
  const stepNext = dampedStepResponse(elapsedSec + 1 / safeFps, omegaN, zeta);

  const tiltDeg = targetTiltDeg * step;
  const angularVelocityDegPerSec = targetTiltDeg * (stepNext - step) * safeFps;

  const rad = (tiltDeg * Math.PI) / 180;
  // Positive rad = right side drops (+Y), left side rises (-Y)
  const rightPanOffsetY = Math.sin(rad) * halfBeam;
  const leftPanOffsetY = -rightPanOffsetY;
  const horizShrink = (1 - Math.cos(rad)) * halfBeam;
  const leftPanOffsetX = horizShrink;
  const rightPanOffsetX = -horizShrink;

  let heavierSide: "left" | "right" | "balanced" = "balanced";
  if (Math.abs(wL - wR) > eps * 10) {
    heavierSide = wL > wR ? "left" : "right";
  }

  return {
    kind: "torque-scale",
    id: config.id,
    tiltDeg,
    angularVelocityDegPerSec,
    leftPanOffsetX,
    leftPanOffsetY,
    rightPanOffsetX,
    rightPanOffsetY,
    imbalanceRatio,
    heavierSide,
    strainNormalized: clamp01(Math.abs(tiltDeg) / Math.max(1, maxTilt)),
  };
}

// ============================================================================
// 2. Hydraulic Pipe & Tiered Dam Spillway State & Evaluator
// ============================================================================

export interface HydraulicParticleState {
  index: number;
  /** Normalized position along flow path [0..1] */
  u: number;
  /** Lateral pipe offset [-1..1] */
  lateralOffset: number;
  /** Whether sliced/diverted at withholding guillotine */
  divertedByGuillotine: boolean;
  /** Active opacity [0..1] */
  opacity: number;
  radiusPx: number;
}

export interface HydraulicSpillwayState {
  kind: "hydraulic-spillway";
  id: string;
  cumulativeVolume: number;
  tierFills: number[];
  tierUnits: number[];
  tierOverflowing: boolean[];
  guillotineActive: boolean;
  guillotineBladeDrop: number;
  effectiveDownstreamRatio: number;
  particles: HydraulicParticleState[];
}

export function evaluateHydraulicSpillway(
  config: HydraulicSpillwayMechanismConfig,
  frame: number,
  fps: number,
  totalFrames: number = 180
): HydraulicSpillwayState {
  const safeFps = Math.max(1, fps);
  const safeTotal = Math.max(30, totalFrames);
  const progress = clamp01(frame / safeTotal);

  const guillotineTrigger = config.guillotineAtProgress;
  const guillotineActive =
    guillotineTrigger !== undefined && progress >= guillotineTrigger;

  let guillotineBladeDrop = 0;
  if (guillotineTrigger !== undefined && progress >= guillotineTrigger) {
    const dropElapsed = ((progress - guillotineTrigger) * safeTotal) / safeFps;
    guillotineBladeDrop = clamp01(dampedStepResponse(dropElapsed, 18.0, 0.9));
  }

  const retention = guillotineActive
    ? clamp01(config.postGuillotineRetention ?? 0.63)
    : 1.0;

  // Smooth S-curve volume delivery across the beat so basins visibly fill and overflow
  const rampProgress = clamp01((progress - 0.06) / 0.82);
  const smoothInflow =
    rampProgress * rampProgress * (3 - 2 * rampProgress) * config.totalInflowUnits;

  let remainingVolume = smoothInflow * (guillotineTrigger !== undefined ? 1 : retention);
  const tierFills: number[] = [];
  const tierUnits: number[] = [];
  const tierOverflowing: boolean[] = [];

  for (let i = 0; i < config.tierCapacities.length; i++) {
    const cap = Math.max(0.0001, config.tierCapacities[i]);
    const absorbed = Math.min(cap, Math.max(0, remainingVolume));
    tierUnits.push(absorbed);
    tierFills.push(clamp01(absorbed / cap));
    tierOverflowing.push(remainingVolume > cap + 0.001);
    remainingVolume = Math.max(0, remainingVolume - cap);
  }

  const count = Math.max(0, Math.min(120, config.particleCount ?? 34));
  const baseSeed = config.seed ?? hashStringSeed(config.id);
  const prng = mulberry32(baseSeed);
  const particles: HydraulicParticleState[] = [];

  for (let i = 0; i < count; i++) {
    const phaseSeed = prng();
    const lateral = prng() * 2 - 1;
    const speedJitter = 0.85 + prng() * 0.32;
    const gateRoll = prng();
    const radiusPx = 3.0 + prng() * 2.2;

    const u = (phaseSeed + (frame / safeFps) * 0.52 * speedJitter) % 1;
    const pastGate = u > 0.48;
    const diverted = guillotineActive && pastGate && gateRoll > retention;

    particles.push({
      index: i,
      u,
      lateralOffset: lateral,
      divertedByGuillotine: diverted,
      opacity: diverted ? Math.max(0.12, 1 - (u - 0.48) * 3.4) : 0.9,
      radiusPx,
    });
  }

  return {
    kind: "hydraulic-spillway",
    id: config.id,
    cumulativeVolume: smoothInflow,
    tierFills,
    tierUnits,
    tierOverflowing,
    guillotineActive,
    guillotineBladeDrop,
    effectiveDownstreamRatio: retention,
    particles,
  };
}

// ============================================================================
// 3. Conveyor & BOM Stack Vaporizer (Deterministic Gravity + Damped Bounce zeta=0.92)
// ============================================================================

export interface VaporEmberParticle {
  dx: number;
  dy: number;
  opacity: number;
  radiusPx: number;
}

export interface BomSlicePhysicsState {
  id: string;
  baseHeightPx: number;
  currentHeightPx: number;
  /** Top Y offset from bottom of stack (upward positive or screen-top offset) */
  bottomOffsetPx: number;
  vaporizeProgress: number;
  opacity: number;
  driftX: number;
  squashScaleX: number;
  squashScaleY: number;
  embers: VaporEmberParticle[];
}

export interface BomVaporizerState {
  kind: "bom-vaporizer";
  id: string;
  totalInitialHeightPx: number;
  totalCurrentHeightPx: number;
  vaporizedShareRatio: number;
  slices: BomSlicePhysicsState[];
}

export function evaluateBomVaporizer(
  config: BomVaporizerMechanismConfig,
  frame: number,
  fps: number,
  totalFrames: number = 180
): BomVaporizerState {
  const safeFps = Math.max(1, fps);
  const safeTotal = Math.max(30, totalFrames);
  const progress = clamp01(frame / safeTotal);

  const totalStackPx = config.totalStackPx ?? 320;
  const gravity = config.gravityPxPerSec2 ?? 1850;
  const zeta = clampRange(config.dampingZeta ?? 0.92, 0.2, 0.995);
  const seedBase = config.seed ?? hashStringSeed(config.id);

  const sumRatios = config.slices.reduce((acc, s) => acc + s.heightRatio, 0) || 1;

  // Compute each slice's vaporization state first (ordered bottom-to-top: index 0 = bottom foundation)
  let cumulativeRestingBottom = 0;
  let cumulativeTargetBottom = 0;
  let vaporizedHeightAccum = 0;

  const sliceStates: BomSlicePhysicsState[] = [];

  for (let i = 0; i < config.slices.length; i++) {
    const spec = config.slices[i];
    const baseHeightPx = (spec.heightRatio / sumRatios) * totalStackPx;
    const triggerProg = spec.vaporizeAtProgress ?? 0.34 + i * 0.05;

    let vapP = 0;
    if (spec.vaporizable && progress > triggerProg) {
      vapP = clamp01((progress - triggerProg) / 0.16);
    }

    const easedVap = vapP * vapP * (3 - 2 * vapP);
    const currentHeightPx = baseHeightPx * (1 - easedVap);
    if (spec.vaporizable) {
      vaporizedHeightAccum += baseHeightPx * easedVap;
    }

    // Gap opened beneath this slice due to lower vaporized slices
    const dropGapPx = cumulativeRestingBottom - cumulativeTargetBottom;
    let settledBottom = cumulativeRestingBottom;
    let squashX = 1;
    let squashY = 1;

    if (!spec.vaporizable && dropGapPx > 0.25) {
      // Find earliest vaporization start among lower vaporizable slices
      let earliestLowerTrigger = 1;
      for (let j = 0; j < i; j++) {
        if (config.slices[j].vaporizable) {
          earliestLowerTrigger = Math.min(
            earliestLowerTrigger,
            config.slices[j].vaporizeAtProgress ?? 0.34 + j * 0.05
          );
        }
      }
      const dropStartFrame = Math.round((earliestLowerTrigger + 0.08) * safeTotal);
      const dropElapsedSec = Math.max(0, (frame - dropStartFrame) / safeFps);

      // Free-fall duration t_fall = sqrt(2 * h / g), followed by zeta = 0.92 damped impact bounce
      const fallDurationSec = Math.sqrt((2 * dropGapPx) / Math.max(200, gravity));
      if (dropElapsedSec <= 0) {
        settledBottom = cumulativeRestingBottom;
      } else if (dropElapsedSec < fallDurationSec) {
        const fallen = 0.5 * gravity * dropElapsedSec * dropElapsedSec;
        settledBottom = Math.max(
          cumulativeTargetBottom,
          cumulativeRestingBottom - fallen
        );
      } else {
        const bounceSec = dropElapsedSec - fallDurationSec;
        const impactVel = gravity * fallDurationSec;
        const omegaN = 22.0;
        const omegaD = omegaN * Math.sqrt(1 - zeta * zeta);
        const decay = Math.exp(-zeta * omegaN * bounceSec);
        // Upward rebound arch with zeta = 0.92 high damping
        const reboundHeight =
          Math.abs(Math.sin(omegaD * bounceSec)) *
          decay *
          Math.min(26, impactVel * 0.032);
        settledBottom = cumulativeTargetBottom + reboundHeight;

        const impactPulse = Math.exp(-Math.pow(bounceSec * 14, 2)) * 0.055;
        squashY = 1 - impactPulse;
        squashX = 1 + impactPulse * 0.75;
      }
    } else if (spec.vaporizable) {
      settledBottom =
        cumulativeTargetBottom + (cumulativeRestingBottom - cumulativeTargetBottom) * (1 - easedVap);
    }

    // Deterministic vapor embers when slice is actively vaporizing
    const embers: VaporEmberParticle[] = [];
    if (vapP > 0.02 && vapP < 0.99) {
      const prng = mulberry32(seedBase + i * 977);
      for (let k = 0; k < 10; k++) {
        const dir = prng() > 0.5 ? 1 : -1;
        const speedX = (28 + prng() * 85) * dir;
        const liftY = -(18 + prng() * 54);
        embers.push({
          dx: speedX * vapP,
          dy: liftY * vapP,
          opacity: Math.sin(vapP * Math.PI) * 0.85,
          radiusPx: 2.2 + prng() * 2.8,
        });
      }
    }

    sliceStates.push({
      id: spec.id,
      baseHeightPx,
      currentHeightPx,
      bottomOffsetPx: settledBottom,
      vaporizeProgress: vapP,
      opacity: spec.vaporizable ? clamp01(1 - easedVap * 1.05) : 1,
      driftX: spec.vaporizable ? easedVap * (i % 2 === 0 ? 34 : -34) : 0,
      squashScaleX: squashX,
      squashScaleY: squashY,
      embers,
    });

    cumulativeRestingBottom += baseHeightPx;
    cumulativeTargetBottom += currentHeightPx;
  }

  return {
    kind: "bom-vaporizer",
    id: config.id,
    totalInitialHeightPx: totalStackPx,
    totalCurrentHeightPx: cumulativeTargetBottom,
    vaporizedShareRatio: clamp01(vaporizedHeightAccum / Math.max(1, totalStackPx)),
    slices: sliceStates,
  };
}

// ============================================================================
// 4. Perishable Decay Sand-Timer / Countdown Erosion State & Evaluator
// ============================================================================

export interface SandGrainState {
  index: number;
  /** Vertical drop progress [0..1] from aperture to floor */
  fallProgress: number;
  lateralJitterPx: number;
  opacity: number;
  radiusPx: number;
}

export interface SandErosionState {
  kind: "sand-erosion";
  id: string;
  remainingRatio: number;
  remainingUnits: number;
  lowerAccumulatedRatio: number;
  streamActive: boolean;
  isExhausted: boolean;
  grains: SandGrainState[];
}

export function evaluateSandErosion(
  config: SandErosionMechanismConfig,
  frame: number,
  fps: number,
  totalFrames: number = 180
): SandErosionState {
  const safeFps = Math.max(1, fps);
  const safeTotal = Math.max(30, totalFrames);
  const progress = clamp01(frame / safeTotal);

  const startP = clampRange(config.startAtProgress ?? 0.08, 0, 0.85);
  const exhaustP = clampRange(config.exhaustAtProgress ?? 0.78, startP + 0.1, 0.98);
  const floorUnits = config.floorUnits ?? 0;
  const spanUnits = Math.max(0, config.initialUnits - floorUnits);

  const rawDrain = clamp01((progress - startP) / (exhaustP - startP));
  // Slight accelerated gravity funnel curve (drains faster near vortex throat)
  const drainCurve = Math.pow(rawDrain, 1.15);
  const remainingRatio = clamp01(1 - drainCurve);
  const remainingUnits = floorUnits + spanUnits * remainingRatio;

  const isExhausted = progress >= exhaustP;
  const streamActive = progress >= startP && !isExhausted;
  const lowerAccumulatedRatio = config.perishable
    ? clamp01(Math.sin(rawDrain * Math.PI) * 0.22) // Perishable compute/seat-miles evaporate instead of banking!
    : clamp01(drainCurve);

  const grainCount = Math.max(0, Math.min(120, config.grainCount ?? 28));
  const prng = mulberry32(config.seed ?? hashStringSeed(config.id));
  const grains: SandGrainState[] = [];

  for (let i = 0; i < grainCount; i++) {
    const phase = prng();
    const jitter = (prng() * 2 - 1) * 7.5;
    const r = 1.8 + prng() * 1.8;
    const fallProgress = (phase + (frame / safeFps) * 1.65) % 1;

    grains.push({
      index: i,
      fallProgress,
      lateralJitterPx: jitter * fallProgress,
      opacity: streamActive ? 0.88 * (1 - fallProgress * 0.25) : 0,
      radiusPx: r,
    });
  }

  return {
    kind: "sand-erosion",
    id: config.id,
    remainingRatio,
    remainingUnits,
    lowerAccumulatedRatio,
    streamActive,
    isExhausted,
    grains,
  };
}

// ============================================================================
// 5. Circular Carousel Orbit (SPV Round-Trip GPU Accounting Loops)
// ============================================================================

export interface CarouselNodeState {
  nodeId: string;
  angleRad: number;
  offsetX: number;
  offsetY: number;
  depthScale: number;
  zIndexOffset: number;
}

export interface CarouselPulseState {
  index: number;
  angleRad: number;
  offsetX: number;
  offsetY: number;
}

export interface CircularCarouselState {
  kind: "circular-carousel";
  id: string;
  completedLoops: number;
  inflatedCapitalMultiple: number;
  nodes: CarouselNodeState[];
  pulses: CarouselPulseState[];
}

export function evaluateCircularCarousel(
  config: CircularCarouselMechanismConfig,
  frame: number,
  fps: number,
  _totalFrames: number = 180
): CircularCarouselState {
  void _totalFrames;
  const safeFps = Math.max(1, fps);
  const rx = config.radiusX ?? 250;
  const ry = config.radiusY ?? 115;
  const rpm = config.revolutionsPerMinute ?? 9.5;
  const angularVel = (rpm * 2 * Math.PI) / 60;
  const elapsedSec = frame / safeFps;
  const baseTheta = elapsedSec * angularVel;

  const nodeCount = Math.max(1, config.nodeIds.length);
  const nodes: CarouselNodeState[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const theta = baseTheta + (i * 2 * Math.PI) / nodeCount - Math.PI * 0.5;
    const ox = Math.cos(theta) * rx;
    const oy = Math.sin(theta) * ry;
    // Front of ellipse (sin(theta) > 0) scales slightly larger for 2.5D depth
    const depthNorm = (Math.sin(theta) + 1) * 0.5; // 0..1
    nodes.push({
      nodeId: config.nodeIds[i],
      angleRad: theta,
      offsetX: ox,
      offsetY: oy,
      depthScale: 0.9 + depthNorm * 0.16,
      zIndexOffset: Math.round(depthNorm * 20),
    });
  }

  const pulseCount = Math.max(1, Math.min(32, config.pulseCount ?? 6));
  const pulses: CarouselPulseState[] = [];
  for (let p = 0; p < pulseCount; p++) {
    // Pulses orbit 2.4x faster than nodes to show rapid capital round-tripping
    const pTheta = baseTheta * 2.4 + (p * 2 * Math.PI) / pulseCount;
    pulses.push({
      index: p,
      angleRad: pTheta,
      offsetX: Math.cos(pTheta) * rx,
      offsetY: Math.sin(pTheta) * ry,
    });
  }

  const completedLoops = (elapsedSec * rpm * 2.4) / 60;
  const baseMult = config.baseCapitalMultiple ?? 1.0;
  const inflatedCapitalMultiple = baseMult + completedLoops * 0.85;

  return {
    kind: "circular-carousel",
    id: config.id,
    completedLoops,
    inflatedCapitalMultiple,
    nodes,
    pulses,
  };
}

// ============================================================================
// 6. Tension Cable Stretch & Sudden Snap Recoil (Subsea Anchor Sabotage)
// ============================================================================

export interface TensionSnapState {
  kind: "tension-snap";
  id: string;
  phase: "taut" | "stretching" | "snapped";
  tensionNormalized: number;
  apexDeflectionY: number;
  highStrainTremorPx: number;
  isSnapped: boolean;
  recoilDecay: number;
  leftEndRecoil: { dx: number; dy: number; whipDeg: number };
  rightEndRecoil: { dx: number; dy: number; whipDeg: number };
  throughputRatio: number;
  sparkBurstAlpha: number;
}

export function evaluateTensionSnap(
  config: TensionSnapMechanismConfig,
  frame: number,
  fps: number,
  totalFrames: number = 180
): TensionSnapState {
  const safeFps = Math.max(1, fps);
  const safeTotal = Math.max(30, totalFrames);
  const progress = clamp01(frame / safeTotal);

  const pullStart = clampRange(config.pullStartProgress ?? 0.18, 0.02, 0.75);
  const snapAt = clampRange(config.snapAtProgress ?? 0.58, pullStart + 0.12, 0.92);
  const maxDeflect = config.maxDeflectionPx ?? 74;
  const spanPx = config.spanPx ?? 520;
  const freqHz = config.recoilFreqHz ?? 6.2;
  const recoilDamping = config.recoilDamping ?? 3.4;

  if (progress < pullStart) {
    const gentleSway = Math.sin((frame / safeFps) * 2.1) * 2.4;
    return {
      kind: "tension-snap",
      id: config.id,
      phase: "taut",
      tensionNormalized: 0.12,
      apexDeflectionY: gentleSway,
      highStrainTremorPx: 0,
      isSnapped: false,
      recoilDecay: 0,
      leftEndRecoil: { dx: 0, dy: 0, whipDeg: 0 },
      rightEndRecoil: { dx: 0, dy: 0, whipDeg: 0 },
      throughputRatio: 1.0,
      sparkBurstAlpha: 0,
    };
  }

  if (progress < snapAt) {
    const stretchP = clamp01((progress - pullStart) / (snapAt - pullStart));
    // Hookean anchor drag buildup with slight non-linear stiffening near yield limit
    const stiffCurve = Math.pow(stretchP, 0.85);
    const tremor =
      stretchP > 0.65
        ? Math.sin(frame * 1.9) * (stretchP - 0.65) * 9.5
        : 0;
    return {
      kind: "tension-snap",
      id: config.id,
      phase: "stretching",
      tensionNormalized: clamp01(0.15 + stiffCurve * 0.85),
      apexDeflectionY: stiffCurve * maxDeflect,
      highStrainTremorPx: tremor,
      isSnapped: false,
      recoilDecay: 0,
      leftEndRecoil: { dx: 0, dy: 0, whipDeg: 0 },
      rightEndRecoil: { dx: 0, dy: 0, whipDeg: 0 },
      throughputRatio: clamp01(1 - stretchP * 0.22),
      sparkBurstAlpha: 0,
    };
  }

  // Snapped phase: immediate severing + damped sinusoidal whip recoil on both cable ends
  const snapFrame = Math.round(snapAt * safeTotal);
  const postSnapSec = Math.max(0, (frame - snapFrame) / safeFps);
  const decay = Math.exp(-recoilDamping * postSnapSec);
  const osc = Math.cos(2 * Math.PI * freqHz * postSnapSec);
  const retractPx = spanPx * 0.14 * (1 - decay * 0.35);
  const whipY = -maxDeflect * 0.72 * decay * osc;
  const whipDeg = 28 * decay * osc;
  const sparkAlpha = clamp01(Math.exp(-postSnapSec * 8.5));

  return {
    kind: "tension-snap",
    id: config.id,
    phase: "snapped",
    tensionNormalized: 0,
    apexDeflectionY: maxDeflect,
    highStrainTremorPx: 0,
    isSnapped: true,
    recoilDecay: decay,
    leftEndRecoil: {
      dx: -retractPx,
      dy: whipY,
      whipDeg: -whipDeg,
    },
    rightEndRecoil: {
      dx: retractPx,
      dy: -whipY * 0.88,
      whipDeg: whipDeg * 0.92,
    },
    throughputRatio: 0,
    sparkBurstAlpha: sparkAlpha,
  };
}

// ============================================================================
// Unified Random-Access Mechanism Dispatcher
// ============================================================================

export type EvaluatedMechanismState =
  | TorqueScaleState
  | HydraulicSpillwayState
  | BomVaporizerState
  | SandErosionState
  | CircularCarouselState
  | TensionSnapState;

export function evaluateMechanismAtFrame(
  config: MechanismConfig,
  frame: number,
  fps: number,
  totalFrames: number = 180
): EvaluatedMechanismState {
  switch (config.kind) {
    case "torque-scale":
      return evaluateTorqueScale(config, frame, fps, totalFrames);
    case "hydraulic-spillway":
      return evaluateHydraulicSpillway(config, frame, fps, totalFrames);
    case "bom-vaporizer":
      return evaluateBomVaporizer(config, frame, fps, totalFrames);
    case "sand-erosion":
      return evaluateSandErosion(config, frame, fps, totalFrames);
    case "circular-carousel":
      return evaluateCircularCarousel(config, frame, fps, totalFrames);
    case "tension-snap":
      return evaluateTensionSnap(config, frame, fps, totalFrames);
  }
}
