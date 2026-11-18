#!/usr/bin/env node
/**
 * Procedural Royalty-Free Documentary Music Stem Synthesizer for Reading Room Cinema.
 *
 * Synthesizes 12 distinct, restrained documentary score beds into `studio/public/music/`:
 *   - 8.0s seamless zero-click equal-power crossfade loops
 *   - 48,000 Hz, 16-bit stereo RIFF PCM WAV (~1.54 MB each)
 *   - Warm filtered analog pads, soft felt-piano & marimba Dorian/minor fifth plucks,
 *     muted sub-pulses, and subtle tape warmth (zero harsh chiptune buzz).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MUSIC_DIR = path.resolve(__dirname, "../public/music");

const SR = 48000;
const LOOP_SEC = 8.0;
const XFADE_SEC = 2.0;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class PinkNoise {
  constructor(rng) {
    this.rng = rng;
    this.b0 = 0;
    this.b1 = 0;
    this.b2 = 0;
    this.b3 = 0;
    this.b4 = 0;
    this.b5 = 0;
    this.b6 = 0;
  }
  next() {
    const white = this.rng() * 2 - 1;
    this.b0 = 0.99886 * this.b0 + white * 0.0555179;
    this.b1 = 0.99332 * this.b1 + white * 0.0750759;
    this.b2 = 0.96900 * this.b2 + white * 0.1538520;
    this.b3 = 0.86650 * this.b3 + white * 0.3104856;
    this.b4 = 0.55000 * this.b4 + white * 0.5329522;
    this.b5 = -0.7616 * this.b5 - white * 0.0168980;
    const pink =
      this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;
    this.b6 = white * 0.115926;
    return pink * 0.11;
  }
}

class Biquad {
  constructor() {
    this.z1 = 0;
    this.z2 = 0;
  }
  process(x, mode, fc, q) {
    const clampedFc = Math.max(20, Math.min(SR * 0.45, fc));
    const w0 = (2 * Math.PI * clampedFc) / SR;
    const cosW = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * Math.max(0.12, q));
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    if (mode === "lpf") {
      b1 = 1 - cosW;
      b0 = b1 * 0.5;
      b2 = b0;
    } else if (mode === "hpf") {
      b0 = (1 + cosW) * 0.5;
      b1 = -(1 + cosW);
      b2 = b0;
    } else {
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
    }
    const invA0 = 1 / (1 + alpha);
    const a1 = -2 * cosW * invA0;
    const a2 = (1 - alpha) * invA0;
    const y = b0 * invA0 * x + this.z1;
    this.z1 = b1 * invA0 * x - a1 * y + this.z2;
    this.z2 = b2 * invA0 * x - a2 * y;
    return y;
  }
}

function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Warm analog-style soft oscillator (fundamental + gentle 2nd/3rd harmonics, zero harsh aliasing).
 */
function warmPadVoice(t, freq, detuneHz, lfoRateHz, phaseOffset = 0) {
  const w1 = 2 * Math.PI * (freq - detuneHz) * t + phaseOffset;
  const w2 = 2 * Math.PI * (freq + detuneHz) * t - phaseOffset * 0.7;
  const breath = 0.78 + 0.22 * Math.sin(2 * Math.PI * lfoRateHz * t + phaseOffset);
  const fund = (Math.sin(w1) + Math.sin(w2)) * 0.44;
  const second = Math.sin(2 * Math.PI * freq * 2 * t + phaseOffset * 0.5) * 0.11 * breath;
  const third = Math.sin(2 * Math.PI * freq * 3 * t) * 0.035 * breath;
  return Math.tanh((fund + second + third) * 1.15) * breath;
}

/**
 * Felt-piano / rosewood marimba damped modal pluck.
 */
function feltPluckSample(dt, freq, timbre = "felt") {
  if (dt < 0 || dt > 2.4) return 0;
  const attack = dt < 0.006 ? 0.5 * (1 - Math.cos((Math.PI * dt) / 0.006)) : 1.0;
  if (timbre === "marimba") {
    // Rosewood bar modes (1.0, 3.98, 9.2 damped rapidly)
    const m1 = Math.sin(2 * Math.PI * freq * dt) * Math.exp(-dt * 5.8);
    const m2 = Math.sin(2 * Math.PI * freq * 3.98 * dt) * Math.exp(-dt * 26.0) * 0.26;
    const mallet = Math.sin(2 * Math.PI * freq * 2.0 * dt) * Math.exp(-dt * 42.0) * 0.14;
    return (m1 + m2 + mallet) * attack;
  }
  // Soft wool-felt piano string with rapid upper-harmonic damping
  const p1 = Math.sin(2 * Math.PI * freq * dt) * Math.exp(-dt * 2.6);
  const p2 = Math.sin(2 * Math.PI * freq * 2.001 * dt) * Math.exp(-dt * 5.4) * 0.28;
  const p3 = Math.sin(2 * Math.PI * freq * 3.003 * dt) * Math.exp(-dt * 11.5) * 0.08;
  const hammer = Math.sin(2 * Math.PI * (freq * 0.5) * dt) * Math.exp(-dt * 38.0) * 0.12;
  return (p1 + p2 + p3 + hammer) * attack;
}

/**
 * Muted analog sub-pulse heartbeat.
 */
function mutedSubPulse(dt, freq) {
  if (dt < 0 || dt > 0.9) return 0;
  const attack = dt < 0.012 ? dt / 0.012 : 1.0;
  const pitchDrop = freq + 18 * Math.exp(-dt * 28);
  const body = Math.sin(2 * Math.PI * pitchDrop * dt) * Math.exp(-dt * 5.2);
  const overtone = Math.sin(2 * Math.PI * freq * 2 * dt) * Math.exp(-dt * 11.0) * 0.18;
  return Math.tanh((body + overtone) * 1.25) * attack;
}

/**
 * Render an 8.0s equal-power crossfaded stereo stem from a declarative score recipe.
 */
function renderDocumentaryStem(recipe) {
  const N = Math.floor(LOOP_SEC * SR);
  const X = Math.floor(XFADE_SEC * SR);
  const total = N + X;

  const rawL = new Float32Array(total);
  const rawR = new Float32Array(total);

  const rngL = mulberry32(recipe.seed);
  const rngR = mulberry32(recipe.seed + 7919);
  const pinkL = new PinkNoise(rngL);
  const pinkR = new PinkNoise(rngR);
  const lpPadL = new Biquad();
  const lpPadR = new Biquad();
  const airBpL = new Biquad();
  const airBpR = new Biquad();
  const masterHpL = new Biquad();
  const masterHpR = new Biquad();

  const stepSec = LOOP_SEC / recipe.stepsPerLoop; // Exact subdivision of 8.0s
  const chordFreqs = recipe.padMidi.map(midiToHz);

  // Pre-schedule note events across [0, LOOP_SEC + XFADE_SEC] (including 1 loop before t=0 for carry-over decay)
  const noteEvents = [];
  if (recipe.pattern && recipe.pattern.length > 0) {
    const totalSteps = Math.ceil((LOOP_SEC + XFADE_SEC) / stepSec) + recipe.stepsPerLoop;
    for (let s = -recipe.stepsPerLoop; s < totalSteps; s++) {
      const idx = ((s % recipe.pattern.length) + recipe.pattern.length) % recipe.pattern.length;
      const midi = recipe.pattern[idx];
      if (midi !== null && midi !== undefined) {
        const onset = s * stepSec;
        const pan = ((idx * 37) % 9 - 4) * 0.09; // Subtle stereo spread [-0.36..+0.36]
        const vel = 0.78 + ((idx * 17) % 5) * 0.05;
        noteEvents.push({ onset, freq: midiToHz(midi), pan, vel });
      }
    }
  }

  const pulseEvents = [];
  if (recipe.pulseEverySteps > 0) {
    const pulseStepSec = stepSec * recipe.pulseEverySteps;
    const count = Math.ceil((LOOP_SEC + XFADE_SEC) / pulseStepSec) + 2;
    const subFreq = midiToHz(recipe.subMidi);
    for (let p = -2; p < count; p++) {
      pulseEvents.push({ onset: p * pulseStepSec, freq: subFreq });
    }
  }

  for (let i = 0; i < total; i++) {
    // Shift time by -XFADE_SEC so [XFADE_SEC .. XFADE_SEC + LOOP_SEC] is the primary cycle
    // and [0 .. XFADE_SEC] seamlessly crossfades with [N .. N + X]
    const t = i / SR;

    // 1. Warm pad layer
    let padL = 0;
    let padR = 0;
    for (let v = 0; v < chordFreqs.length; v++) {
      const f = chordFreqs[v];
      const spread = (v - (chordFreqs.length - 1) * 0.5) * 0.22;
      const voice = warmPadVoice(
        t,
        f,
        recipe.detuneHz,
        recipe.lfoCyclesPerLoop / LOOP_SEC,
        v * 1.15
      );
      padL += voice * (0.5 - spread * 0.5);
      padR += voice * (0.5 + spread * 0.5);
    }
    const padCutoff =
      recipe.padCutoffHz *
      (0.86 + 0.14 * Math.sin((2 * Math.PI * recipe.lfoCyclesPerLoop * t) / LOOP_SEC));
    padL = lpPadL.process(padL * recipe.padGain, "lpf", padCutoff, 0.78);
    padR = lpPadR.process(padR * recipe.padGain, "lpf", padCutoff, 0.78);

    // 2. Pluck / felt-piano / marimba arpeggio layer
    let pluckL = 0;
    let pluckR = 0;
    for (let e = 0; e < noteEvents.length; e++) {
      const ev = noteEvents[e];
      const dt = t - ev.onset;
      if (dt >= 0 && dt < 2.2) {
        const s = feltPluckSample(dt, ev.freq, recipe.timbre) * ev.vel * recipe.pluckGain;
        pluckL += s * (0.5 - ev.pan * 0.5);
        pluckR += s * (0.5 + ev.pan * 0.5);
      }
    }

    // 3. Muted sub-pulse + subtle clockwork brush if enabled
    let pulse = 0;
    for (let p = 0; p < pulseEvents.length; p++) {
      const pev = pulseEvents[p];
      const dt = t - pev.onset;
      if (dt >= 0 && dt < 0.85) {
        pulse += mutedSubPulse(dt, pev.freq) * recipe.pulseGain;
      }
    }

    // 4. Subtle tape/room velvet air (very low level, zero hiss harshness)
    const airL = airBpL.process(pinkL.next(), "bpf", recipe.airCenterHz, 1.4) * recipe.airGain;
    const airR = airBpR.process(pinkR.next(), "bpf", recipe.airCenterHz * 1.03, 1.4) * recipe.airGain;

    // 5. Optional brushed clockwork tick on step grid
    let brush = 0;
    if (recipe.clockTickGain > 0) {
      const stepPhase = (t % stepSec) / stepSec;
      const stepDt = (t % stepSec);
      if (stepDt < 0.025) {
        const env = Math.exp(-stepDt * 180) * (stepPhase < 0.5 ? 1 : 0);
        brush = (pinkL.next() * 0.7 + Math.sin(2 * Math.PI * 1650 * stepDt) * 0.3) * env * recipe.clockTickGain;
      }
    }

    const mixL = Math.tanh((padL + pluckL + pulse + airL + brush * 0.9) * 1.08);
    const mixR = Math.tanh((padR + pluckR + pulse + airR + brush * 1.1) * 1.08);

    rawL[i] = masterHpL.process(mixL, "hpf", 34, 0.707);
    rawR[i] = masterHpR.process(mixR, "hpf", 34, 0.707);
  }

  // Equal-power crossfade tail [N .. N+X) into head [0 .. X) for 100% click-free seamless looping
  const outL = new Float32Array(N);
  const outR = new Float32Array(N);
  let peak = 1e-9;

  for (let i = 0; i < N; i++) {
    if (i < X) {
      const u = i / X;
      const fadeIn = Math.sin(0.5 * Math.PI * u);
      const fadeOut = Math.cos(0.5 * Math.PI * u);
      outL[i] = fadeIn * rawL[i] + fadeOut * rawL[N + i];
      outR[i] = fadeIn * rawR[i] + fadeOut * rawR[N + i];
    } else {
      outL[i] = rawL[i];
      outR[i] = rawR[i];
    }
    peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
  }

  // Normalize to target peak dBFS
  const targetLinear = Math.pow(10, recipe.targetPeakDb / 20);
  const gain = targetLinear / peak;
  for (let i = 0; i < N; i++) {
    outL[i] *= gain;
    outR[i] *= gain;
  }

  // Micro 32-sample endpoint continuity polish so sample[N-1] -> sample[0] step is near-zero
  const polish = 32;
  const endAvgL = 0.5 * (outL[0] + outL[N - 1]);
  const endAvgR = 0.5 * (outR[0] + outR[N - 1]);
  for (let k = 0; k < polish; k++) {
    const w = 1 - k / polish;
    outL[k] = outL[k] * (1 - w * 0.5) + endAvgL * (w * 0.5);
    outR[k] = outR[k] * (1 - w * 0.5) + endAvgR * (w * 0.5);
    outL[N - 1 - k] = outL[N - 1 - k] * (1 - w * 0.5) + endAvgL * (w * 0.5);
    outR[N - 1 - k] = outR[N - 1 - k] * (1 - w * 0.5) + endAvgR * (w * 0.5);
  }

  return { L: outL, R: outR };
}

function encodeWav16Stereo(L, R, sampleRate = SR) {
  const numFrames = L.length;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    const sL = Math.max(-0.995, Math.min(0.995, L[i]));
    const sR = Math.max(-0.995, Math.min(0.995, R[i]));
    buf.writeInt16LE(Math.round(sL < 0 ? sL * 0x8000 : sL * 0x7fff), offset);
    buf.writeInt16LE(Math.round(sR < 0 ? sR * 0x8000 : sR * 0x7fff), offset + 2);
    offset += 4;
  }
  return buf;
}

export const MUSIC_STEM_RECIPES = [
  {
    filename: "01-archival-pulse.wav",
    seed: 1011,
    // D Dorian (D2, A2, F3, C4, E4)
    padMidi: [38, 45, 53, 60, 64],
    subMidi: 38,
    stepsPerLoop: 16,
    pattern: [62, null, 69, null, 64, null, 69, 60, 62, null, 67, null, 64, null, 57, null],
    timbre: "felt",
    padCutoffHz: 780,
    detuneHz: 0.22,
    lfoCyclesPerLoop: 1,
    padGain: 0.34,
    pluckGain: 0.28,
    pulseEverySteps: 4,
    pulseGain: 0.28,
    airCenterHz: 420,
    airGain: 0.025,
    clockTickGain: 0.0,
    targetPeakDb: -10.5,
  },
  {
    filename: "02-ledger-investigation.wav",
    seed: 2027,
    // A Aeolian / Dorian fifths (A2, E3, B3, E4) — default investigative bed
    padMidi: [45, 52, 59, 64],
    subMidi: 33,
    stepsPerLoop: 16,
    pattern: [57, null, 64, 59, null, 64, 60, null, 57, null, 64, 67, null, 64, 59, null],
    timbre: "felt",
    padCutoffHz: 860,
    detuneHz: 0.18,
    lfoCyclesPerLoop: 2,
    padGain: 0.32,
    pluckGain: 0.31,
    pulseEverySteps: 2,
    pulseGain: 0.26,
    airCenterHz: 510,
    airGain: 0.022,
    clockTickGain: 0.015,
    targetPeakDb: -10.5,
  },
  {
    filename: "03-midnight-telemetry.wav",
    seed: 3039,
    // C minor 9th nocturnal synth pad (C2, G2, Eb3, Bb3, D4)
    padMidi: [36, 43, 51, 58, 62],
    subMidi: 36,
    stepsPerLoop: 24,
    pattern: [
      60, null, 67, null, 62, null, 63, null, 67, null, 58, null,
      60, null, 67, null, 70, null, 67, null, 62, null, 55, null,
    ],
    timbre: "felt",
    padCutoffHz: 940,
    detuneHz: 0.28,
    lfoCyclesPerLoop: 2,
    padGain: 0.38,
    pluckGain: 0.22,
    pulseEverySteps: 6,
    pulseGain: 0.3,
    airCenterHz: 620,
    airGain: 0.026,
    clockTickGain: 0.0,
    targetPeakDb: -10.5,
  },
  {
    filename: "04-clockwork-mechanism.wav",
    seed: 4049,
    // E Dorian precision mechanism (E2, B2, F#3, B3, D4)
    padMidi: [40, 47, 54, 59, 62],
    subMidi: 40,
    stepsPerLoop: 32,
    pattern: [
      64, 71, 66, 71, 67, 71, 66, 62, 64, 71, 66, 71, 74, 71, 66, 59,
      64, 71, 66, 71, 67, 71, 66, 62, 64, 69, 66, 62, 59, null, 66, null,
    ],
    timbre: "marimba",
    padCutoffHz: 720,
    detuneHz: 0.15,
    lfoCyclesPerLoop: 2,
    padGain: 0.25,
    pluckGain: 0.3,
    pulseEverySteps: 4,
    pulseGain: 0.24,
    airCenterHz: 880,
    airGain: 0.018,
    clockTickGain: 0.032,
    targetPeakDb: -10.5,
  },
  {
    filename: "05-sovereign-tension.wav",
    seed: 5051,
    // F# Phrygian / minor fifth tension (F#2, C#3, G3, C#4, F#4)
    padMidi: [42, 49, 55, 61, 66],
    subMidi: 30,
    stepsPerLoop: 16,
    pattern: [54, 54, null, 61, 55, null, 61, null, 54, 54, null, 62, 61, null, 55, null],
    timbre: "felt",
    padCutoffHz: 680,
    detuneHz: 0.31,
    lfoCyclesPerLoop: 2,
    padGain: 0.4,
    pluckGain: 0.22,
    pulseEverySteps: 2,
    pulseGain: 0.36,
    airCenterHz: 340,
    airGain: 0.03,
    clockTickGain: 0.02,
    targetPeakDb: -10.0,
  },
  {
    filename: "06-subsea-drone.wav",
    seed: 6067,
    // Deep Eb minor benthic drone (Eb2, Bb2, F3, Gb3, Bb3)
    padMidi: [39, 46, 53, 54, 58],
    subMidi: 27,
    stepsPerLoop: 8,
    pattern: [63, null, null, 70, null, 65, null, null],
    timbre: "felt",
    padCutoffHz: 520,
    detuneHz: 0.34,
    lfoCyclesPerLoop: 1,
    padGain: 0.46,
    pluckGain: 0.18,
    pulseEverySteps: 4,
    pulseGain: 0.28,
    airCenterHz: 260,
    airGain: 0.036,
    clockTickGain: 0.0,
    targetPeakDb: -11.5,
  },
  {
    filename: "07-industrial-march.wav",
    seed: 7079,
    // G minor steady heavy infrastructure pulse (G2, D3, A3, Bb3, D4)
    padMidi: [43, 50, 57, 58, 62],
    subMidi: 31,
    stepsPerLoop: 16,
    pattern: [55, null, 62, 55, 58, null, 62, null, 55, null, 65, 62, 57, null, 50, null],
    timbre: "marimba",
    padCutoffHz: 820,
    detuneHz: 0.24,
    lfoCyclesPerLoop: 2,
    padGain: 0.34,
    pluckGain: 0.28,
    pulseEverySteps: 2,
    pulseGain: 0.38,
    airCenterHz: 460,
    airGain: 0.024,
    clockTickGain: 0.024,
    targetPeakDb: -10.0,
  },
  {
    filename: "08-quiet-reckoning.wav",
    seed: 8089,
    // B minor sparse reflective felt piano & warm cello-register pad (B2, F#3, A3, D4, F#4)
    padMidi: [47, 54, 57, 62, 66],
    subMidi: 35,
    stepsPerLoop: 8,
    pattern: [59, null, 66, null, 62, null, 69, null],
    timbre: "felt",
    padCutoffHz: 640,
    detuneHz: 0.16,
    lfoCyclesPerLoop: 1,
    padGain: 0.33,
    pluckGain: 0.32,
    pulseEverySteps: 4,
    pulseGain: 0.18,
    airCenterHz: 390,
    airGain: 0.02,
    clockTickGain: 0.0,
    targetPeakDb: -12.0,
  },
  {
    filename: "09-toy-model-marimba.wav",
    seed: 9091,
    // F Lydian/Dorian clean analytical marimba fifths (F2, C3, G3, A3, D4)
    padMidi: [41, 48, 55, 57, 62],
    subMidi: 41,
    stepsPerLoop: 16,
    pattern: [65, 72, 67, null, 69, 72, 62, null, 65, 72, 74, 72, 67, null, 60, null],
    timbre: "marimba",
    padCutoffHz: 960,
    detuneHz: 0.14,
    lfoCyclesPerLoop: 2,
    padGain: 0.24,
    pluckGain: 0.38,
    pulseEverySteps: 4,
    pulseGain: 0.22,
    airCenterHz: 700,
    airGain: 0.016,
    clockTickGain: 0.012,
    targetPeakDb: -10.5,
  },
  {
    filename: "10-speculative-horizon.wav",
    seed: 10103,
    // Bbmaj9 / G minor open horizon (G2, D3, F3, A3, D4)
    padMidi: [43, 50, 53, 57, 62],
    subMidi: 31,
    stepsPerLoop: 16,
    pattern: [62, null, 69, null, 70, null, 65, null, 62, null, 74, null, 69, null, 65, null],
    timbre: "felt",
    padCutoffHz: 1080,
    detuneHz: 0.26,
    lfoCyclesPerLoop: 1,
    padGain: 0.38,
    pluckGain: 0.27,
    pulseEverySteps: 4,
    pulseGain: 0.22,
    airCenterHz: 580,
    airGain: 0.022,
    clockTickGain: 0.0,
    targetPeakDb: -11.0,
  },
  {
    filename: "11-verdict-drone.wav",
    seed: 11117,
    // Low D fifth solemn courtroom / drop-silence hold (D2, A2, D3, A3)
    padMidi: [38, 45, 50, 57],
    subMidi: 26,
    stepsPerLoop: 8,
    pattern: [50, null, null, null, 57, null, null, null],
    timbre: "felt",
    padCutoffHz: 460,
    detuneHz: 0.25,
    lfoCyclesPerLoop: 1,
    padGain: 0.44,
    pluckGain: 0.16,
    pulseEverySteps: 8,
    pulseGain: 0.3,
    airCenterHz: 240,
    airGain: 0.028,
    clockTickGain: 0.0,
    targetPeakDb: -13.5,
  },
  {
    filename: "12-epilogue-warmth.wav",
    seed: 12127,
    // Warm Cadd9 / A minor7 resolution (C3, G3, B3, D4, E4)
    padMidi: [48, 55, 59, 62, 64],
    subMidi: 36,
    stepsPerLoop: 16,
    pattern: [60, null, 67, null, 64, null, 62, null, 60, null, 71, null, 67, null, 64, null],
    timbre: "felt",
    padCutoffHz: 1020,
    detuneHz: 0.2,
    lfoCyclesPerLoop: 1,
    padGain: 0.36,
    pluckGain: 0.3,
    pulseEverySteps: 4,
    pulseGain: 0.2,
    airCenterHz: 480,
    airGain: 0.02,
    clockTickGain: 0.0,
    targetPeakDb: -11.0,
  },
];

export function generateAllMusicStems(outDir = MUSIC_DIR) {
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];
  for (const recipe of MUSIC_STEM_RECIPES) {
    const { L, R } = renderDocumentaryStem(recipe);
    const wavBuf = encodeWav16Stereo(L, R, SR);
    const fullPath = path.join(outDir, recipe.filename);
    fs.writeFileSync(fullPath, wavBuf);
    results.push({
      filename: recipe.filename,
      samples: L.length,
      durationSec: L.length / SR,
      bytes: wavBuf.length,
    });
  }
  return results;
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  console.log(
    `Synthesizing ${MUSIC_STEM_RECIPES.length} seamless 8.0s 48kHz stereo documentary music stems into ${MUSIC_DIR}...`
  );
  const generated = generateAllMusicStems(MUSIC_DIR);
  for (const item of generated) {
    console.log(
      `  ✓ ${item.filename} (${item.durationSec.toFixed(1)}s, ${(item.bytes / (1024 * 1024)).toFixed(2)} MB)`
    );
  }
  console.log("All 12 documentary music beds generated successfully.");
}
