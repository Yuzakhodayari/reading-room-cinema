#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SFX_DIR = path.resolve(__dirname, "../public/sfx");

fs.mkdirSync(SFX_DIR, { recursive: true });

const SAMPLE_RATE = 48000;

/**
 * Encode mono or stereo floating-point samples [-1.0, 1.0] to a 16-bit 48kHz RIFF WAV buffer.
 */
function encodeWav(samplesOrStereo, sampleRate = SAMPLE_RATE) {
  const isStereo =
    samplesOrStereo &&
    typeof samplesOrStereo === "object" &&
    !ArrayBuffer.isView(samplesOrStereo) &&
    samplesOrStereo.L &&
    samplesOrStereo.R;

  const numChannels = isStereo ? 2 : 1;
  const numFrames = isStereo ? samplesOrStereo.L.length : samplesOrStereo.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  if (isStereo) {
    const { L, R } = samplesOrStereo;
    for (let i = 0; i < numFrames; i++) {
      const sL = Math.max(-0.99, Math.min(0.99, L[i]));
      const sR = Math.max(-0.99, Math.min(0.99, R[i]));
      buffer.writeInt16LE(Math.round(sL < 0 ? sL * 0x8000 : sL * 0x7fff), offset);
      buffer.writeInt16LE(Math.round(sR < 0 ? sR * 0x8000 : sR * 0x7fff), offset + 2);
      offset += 4;
    }
  } else {
    for (let i = 0; i < numFrames; i++) {
      const s = Math.max(-0.99, Math.min(0.99, samplesOrStereo[i]));
      const val = s < 0 ? s * 0x8000 : s * 0x7fff;
      buffer.writeInt16LE(Math.round(val), offset);
      offset += 2;
    }
  }
  return buffer;
}

// Legacy LCG noise generator (preserved for bit-identical baseline 20 WAVs)
function createNoiseGen(seed = 12345) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s / 2147483647) * 2 - 1;
  };
}

// Mulberry32 deterministic PRNG in [0, 1)
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

// Paul Kellet 7-pole pink noise generator
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
    const w = this.rng() * 2 - 1;
    this.b0 = 0.99886 * this.b0 + w * 0.0555179;
    this.b1 = 0.99332 * this.b1 + w * 0.0750759;
    this.b2 = 0.96900 * this.b2 + w * 0.1538520;
    this.b3 = 0.86650 * this.b3 + w * 0.3104856;
    this.b4 = 0.55000 * this.b4 + w * 0.5329522;
    this.b5 = -0.7616 * this.b5 - w * 0.0168980;
    const out = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + w * 0.5362;
    this.b6 = w * 0.115926;
    return out * 0.12;
  }
}

// Direct-Form-II-Transposed RBJ biquad filter (lowpass, highpass, bandpass)
function createBiquadFilter() {
  let z1 = 0;
  let z2 = 0;
  return {
    process(input, fc, q = 1.0, type = "bandpass", fs = SAMPLE_RATE) {
      const clampedFc = Math.max(20, Math.min(fs * 0.45, fc));
      const omega = (2 * Math.PI * clampedFc) / fs;
      const alpha = Math.sin(omega) / (2 * Math.max(0.12, q));
      const cosw = Math.cos(omega);

      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      if (type === "bandpass" || type === "bpf") {
        b0 = alpha;
        b1 = 0;
        b2 = -alpha;
      } else if (type === "lowpass" || type === "lpf") {
        b1 = 1 - cosw;
        b0 = b1 * 0.5;
        b2 = b0;
      } else if (type === "highpass" || type === "hpf") {
        b0 = (1 + cosw) * 0.5;
        b1 = -(1 + cosw);
        b2 = b0;
      }

      const invA0 = 1 / (1 + alpha);
      const a1 = -2 * cosw * invA0;
      const a2 = (1 - alpha) * invA0;
      const y = b0 * invA0 * input + z1;
      z1 = b1 * invA0 * input - a1 * y + z2;
      z2 = b2 * invA0 * input - a2 * y;
      return y;
    },
  };
}

// Click-free fade-in/fade-out and peak normalization helper
function finalizeMono(buf, targetPeakDb = -6.0, fadeInMs = 1.5, fadeOutMs = 8.0) {
  const n = buf.length;
  const fi = Math.min(n >> 2, Math.max(1, Math.floor((fadeInMs / 1000) * SAMPLE_RATE)));
  const fo = Math.min(n >> 2, Math.max(1, Math.floor((fadeOutMs / 1000) * SAMPLE_RATE)));
  for (let i = 0; i < fi; i++) {
    buf[i] *= 0.5 * (1 - Math.cos((Math.PI * i) / fi));
  }
  for (let i = 0; i < fo; i++) {
    buf[n - 1 - i] *= 0.5 * (1 - Math.cos((Math.PI * i) / fo));
  }
  let peak = 1e-9;
  for (let i = 0; i < n; i++) {
    peak = Math.max(peak, Math.abs(buf[i]));
  }
  const gain = Math.pow(10, targetPeakDb / 20) / peak;
  for (let i = 0; i < n; i++) {
    buf[i] *= gain;
  }
  return buf;
}

function finalizeStereo(L, R, targetPeakDb = -6.0, fadeInMs = 2.0, fadeOutMs = 10.0) {
  const n = L.length;
  const fi = Math.min(n >> 2, Math.max(1, Math.floor((fadeInMs / 1000) * SAMPLE_RATE)));
  const fo = Math.min(n >> 2, Math.max(1, Math.floor((fadeOutMs / 1000) * SAMPLE_RATE)));
  for (let i = 0; i < fi; i++) {
    const w = 0.5 * (1 - Math.cos((Math.PI * i) / fi));
    L[i] *= w;
    R[i] *= w;
  }
  for (let i = 0; i < fo; i++) {
    const w = 0.5 * (1 - Math.cos((Math.PI * i) / fo));
    L[n - 1 - i] *= w;
    R[n - 1 - i] *= w;
  }
  let peak = 1e-9;
  for (let i = 0; i < n; i++) {
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const gain = Math.pow(10, targetPeakDb / 20) / peak;
  for (let i = 0; i < n; i++) {
    L[i] *= gain;
    R[i] *= gain;
  }
  return { L, R };
}

// Modal resonator bank: modes = [[freqHz, tauSec, amp], ...]
function modalBankSample(t, modes, detune = 1.0) {
  let sum = 0;
  for (let m = 0; m < modes.length; m++) {
    const [freq, tau, amp] = modes[m];
    sum += amp * Math.exp(-t / tau) * Math.sin(2 * Math.PI * freq * detune * t);
  }
  return sum;
}

// =========================================================================
// DETUNED MULTI-VARIANT FAMILY BUILDERS (_v1..v4 + base)
// =========================================================================

function synthPaperSlideVariant(seed, detune) {
  const N = Math.floor(0.34 * SAMPLE_RATE);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const rng = mulberry32(seed);
  const pink = new PinkNoise(rng);
  const fBody = createBiquadFilter();
  const fAir = createBiquadFilter();
  const hp = createBiquadFilter();
  const lp = createBiquadFilter();
  for (let i = 0; i < N; i++) {
    const u = i / N;
    const velvet = rng() < 2200 / SAMPLE_RATE ? (rng() > 0.5 ? 0.55 : -0.55) : 0;
    const src = pink.next() * 0.72 + velvet * 0.28;
    const body = fBody.process(src, (620 + 480 * Math.sin(Math.PI * u)) * detune, 2.4, "bpf");
    const air = fAir.process(src, (3900 - 1500 * u * u) * detune, 1.6, "bpf");
    const env =
      Math.pow(Math.sin(Math.PI * u), 1.4) * (1 + 0.12 * Math.sin(2 * Math.PI * 19 * (i / SAMPLE_RATE)));
    const sig = lp.process(hp.process((body + air * 0.65) * env, 180, 0.707, "hpf"), 7200, 0.707, "lpf");
    L[i] = sig * (0.95 + 0.08 * u);
    R[i] = sig * (1.05 - 0.08 * u);
  }
  return finalizeStereo(L, R, -7.5, 2.0, 12.0);
}

function synthFeltHighlighterVariant(seed, detune) {
  const N = Math.floor(0.39 * SAMPLE_RATE);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const rng = mulberry32(seed);
  const pink = new PinkNoise(rng);
  const fNib = createBiquadFilter();
  const fPaper = createBiquadFilter();
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    const u = i / N;
    const touch = Math.exp(-t / 0.0032) * Math.cos(2 * Math.PI * 1150 * detune * t) * 0.24;
    const p = pink.next();
    const nib = fNib.process(p, (3550 + 580 * u) * detune, 3.6, "bpf");
    const pap = fPaper.process(p, 960 * detune, 1.8, "bpf") * 0.38;
    const attack = Math.min(1, t / 0.012);
    const release = u > 0.9 ? 0.5 * (1 + Math.cos(Math.PI * ((u - 0.9) / 0.1))) : 1;
    const sig = touch + (nib + pap) * attack * release;
    const pan = -0.1 + 0.2 * u;
    L[i] = sig * (0.5 - pan * 0.5);
    R[i] = sig * (0.5 + pan * 0.5);
  }
  return finalizeStereo(L, R, -8.5, 1.5, 10.0);
}

function synthOdometerTickVariant(seed, detune) {
  const N = Math.floor(0.036 * SAMPLE_RATE);
  const buf = new Float32Array(N);
  const rng = mulberry32(seed);
  const hp = createBiquadFilter();
  const modes = [
    [420, 0.005, 0.45],
    [1880, 0.0034, 0.72],
    [4650, 0.0017, 0.34],
  ];
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    const click = hp.process((rng() * 2 - 1) * Math.exp(-t / 0.0018), 2800, 0.85, "hpf") * 0.38;
    buf[i] = click + modalBankSample(t, modes, detune);
  }
  return finalizeMono(buf, -7.5, 0.6, 4.0);
}

function synthSolariFlapVariant(seed, detune) {
  const N = Math.floor(0.11 * SAMPLE_RATE);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const rng = mulberry32(seed);
  const pink = new PinkNoise(rng);
  const bpCard = createBiquadFilter();
  const bpSnap = createBiquadFilter();
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    // Split-flap PVC leaf release at t=0 + leaf slap at t=24ms
    const hit1 = Math.exp(-t / 0.005) * bpCard.process(pink.next(), 1350 * detune, 2.2, "bpf") * 0.85;
    const dt2 = t - 0.024;
    const hit2 =
      dt2 >= 0
        ? Math.exp(-dt2 / 0.0075) *
          (bpSnap.process(pink.next(), 2450 * detune, 2.6, "bpf") * 1.1 +
            Math.sin(2 * Math.PI * 640 * detune * dt2) * Math.exp(-dt2 / 0.009) * 0.45)
        : 0;
    const sig = hit1 + hit2;
    L[i] = sig * 1.03;
    R[i] = sig * 0.97;
  }
  return finalizeStereo(L, R, -6.5, 0.8, 8.0);
}

function synthTypewriterStrikeVariant(seed, detune) {
  const N = Math.floor(0.085 * SAMPLE_RATE);
  const buf = new Float32Array(N);
  const rng = mulberry32(seed);
  const pink = new PinkNoise(rng);
  const bp = createBiquadFilter();
  const modes = [
    [540, 0.009, 0.5],
    [2320, 0.0042, 0.78],
    [5200, 0.0019, 0.42],
  ];
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    const platenImpact = bp.process(pink.next(), 3100 * detune, 2.0, "bpf") * Math.exp(-t / 0.0048);
    const escapement =
      t >= 0.028
        ? Math.sin(2 * Math.PI * 3900 * detune * (t - 0.028)) * Math.exp(-(t - 0.028) / 0.003) * 0.22
        : 0;
    buf[i] = platenImpact * 0.9 + modalBankSample(t, modes, detune) * 0.65 + escapement;
  }
  return finalizeMono(buf, -6.5, 0.6, 6.0);
}

function synthArchivalStampVariant(seed, detune) {
  const N = Math.floor(0.44 * SAMPLE_RATE);
  const hitIdx = Math.floor(0.035 * SAMPLE_RATE);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const rng = mulberry32(seed);
  const pink = new PinkNoise(rng);
  const fWhoosh = createBiquadFilter();
  const fWood = createBiquadFilter();
  const fSnap = createBiquadFilter();
  let phase = 0;
  for (let i = 0; i < N; i++) {
    if (i < hitIdx) {
      const u = i / hitIdx;
      const w = fWhoosh.process(pink.next(), 200 + 700 * u * u, 1.1, "lpf") * u * u * 0.28;
      L[i] = w;
      R[i] = w;
    } else {
      const t = (i - hitIdx) / SAMPLE_RATE;
      const fInst = (46 + 92 * Math.exp(-t / 0.022)) * detune;
      phase += (2 * Math.PI * fInst) / SAMPLE_RATE;
      const thud = Math.tanh(1.6 * Math.sin(phase)) * Math.exp(-t / 0.085) * 0.85;
      const n = pink.next();
      const wood = fWood.process(n, 780 * detune, 1.2, "bpf") * Math.exp(-t / 0.014) * 0.9;
      const snap = fSnap.process(n, 2650 * detune, 1.5, "bpf") * Math.exp(-t / 0.006) * 0.6;
      L[i] = (thud + wood + snap) * 1.02;
      R[i] = (thud + wood * 0.96 + snap * 1.04) * 0.98;
    }
  }
  return finalizeStereo(L, R, -4.5, 1.5, 14.0);
}

// =========================================================================
// 96 PROCEDURAL STUDIO FOLEY GENERATORS
// =========================================================================

export const SFX = {
  // -----------------------------------------------------------------------
  // ORIGINAL 20 BASELINE WAVS (100% PRESERVED)
  // -----------------------------------------------------------------------
  "glass-enter.wav": () => {
    const dur = 0.28;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const envMain = Math.exp(-t * 22);
      const envSub = Math.exp(-t * 14);
      const tone1 = Math.sin(2 * Math.PI * 1850 * t);
      const tone2 = Math.sin(2 * Math.PI * 3700 * t) * 0.35;
      const tone3 = Math.sin(2 * Math.PI * 5550 * t) * 0.15;
      const sub = Math.sin(2 * Math.PI * (90 - t * 80) * t) * 0.45 * envSub;
      buf[i] = (tone1 + tone2 + tone3) * envMain * 0.55 + sub;
    }
    return buf;
  },

  "glass-expand.wav": () => {
    const dur = 0.32;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    let phase = 0;
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const p = t / dur;
      const env = Math.sin(p * Math.PI) * Math.exp(-t * 4);
      const freq = 520 + Math.pow(p, 1.8) * 980;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const tone = Math.sin(phase) + Math.sin(phase * 2) * 0.25;
      buf[i] = tone * env * 0.6;
    }
    return buf;
  },

  "glass-dock.wav": () => {
    const dur = 0.22;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    let phase = 0;
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 28);
      const freq = 840 * Math.exp(-t * 16) + 240;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const click = i < 180 ? Math.sin((i / 180) * Math.PI) * 0.35 : 0;
      buf[i] = Math.sin(phase) * env * 0.55 + click;
    }
    return buf;
  },

  "glass-exit.wav": () => {
    const dur = 0.2;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(4411);
    const filter = createBiquadFilter();
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 24);
      const n = filter.process(noise(), 3200, 1.5, "bandpass");
      const tone = Math.sin(2 * Math.PI * (1600 - t * 3000) * t) * 0.2;
      buf[i] = (n * 0.7 + tone) * env * 0.65;
    }
    return buf;
  },

  "marker-sweep.wav": () => {
    const dur = 0.38;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(9821);
    const filter = createBiquadFilter();
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const p = t / dur;
      const env = Math.sin(Math.PI * Math.pow(p, 0.75));
      const raw = noise();
      const filtered = filter.process(raw, 1850 + Math.sin(t * 40) * 120, 2.2, "bandpass");
      buf[i] = filtered * env * 0.75;
    }
    return buf;
  },

  "paper-slide.wav": () => {
    const dur = 0.35;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(3141);
    const filter = createBiquadFilter();
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const p = t / dur;
      const env = Math.sin(Math.PI * p) * (1 - 0.2 * p);
      const raw = noise();
      const filtered = filter.process(raw, 1100 + p * 400, 1.2, "bandpass");
      buf[i] = filtered * env * 0.7;
    }
    return buf;
  },

  "data-tick.wav": () => {
    const dur = 0.06;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 90);
      const tone = Math.sin(2 * Math.PI * 2600 * t);
      buf[i] = tone * env * 0.6;
    }
    return buf;
  },

  "warning-thud.wav": () => {
    const dur = 0.55;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    let phase = 0;
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 7.5);
      const freq = 68 * Math.exp(-t * 4.5) + 32;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const sub = Math.sin(phase);
      const saturation = Math.tanh(sub * 1.4);
      buf[i] = saturation * env * 0.85;
    }
    return buf;
  },

  "flash-cut.wav": () => {
    const dur = 0.12;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(7771);
    const filter = createBiquadFilter();
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 55);
      const click = i < 120 ? Math.sin((i / 120) * Math.PI) * 0.9 : 0;
      const tail = filter.process(noise(), 3400, 2.5, "bandpass") * 0.35;
      buf[i] = (click + tail) * env * 0.75;
    }
    return buf;
  },

  "telestrator-draw.wav": () => {
    const dur = 0.4;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(8882);
    const filter = createBiquadFilter();
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const p = t / dur;
      const env = Math.sin(Math.PI * p);
      const raw = noise();
      const filtered = filter.process(raw, 1400 + Math.sin(t * 60) * 300, 2.0, "bandpass");
      buf[i] = filtered * env * 0.7;
    }
    return buf;
  },

  "sticker-pop.wav": () => {
    const dur = 0.14;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    let phase = 0;
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 32);
      const freq = 440 * Math.exp(-t * 24) + 110;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      buf[i] = Math.sin(phase) * env * 0.65;
    }
    return buf;
  },

  "newsreel-click.wav": () => {
    const dur = 0.1;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const click1 = i < 180 ? Math.sin((i / 180) * Math.PI) * Math.exp(-t * 70) : 0;
      const click2 = i > 400 && i < 650 ? Math.sin(((i - 400) / 250) * Math.PI) * 0.6 : 0;
      const resonance = Math.sin(2 * Math.PI * 1450 * t) * Math.exp(-t * 60) * 0.25;
      buf[i] = (click1 + click2 + resonance) * 0.7;
    }
    return buf;
  },

  "map-whoosh.wav": () => {
    const dur = 0.45;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(5432);
    const filter = createBiquadFilter();
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const p = t / dur;
      const env = Math.pow(Math.sin(Math.PI * p), 1.8);
      const freq = 280 + Math.sin(Math.PI * p) * 620;
      const filtered = filter.process(noise(), freq, 1.4, "bandpass");
      buf[i] = filtered * env * 0.8;
    }
    return buf;
  },

  "type-click.wav": () => {
    const dur = 0.05;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 110);
      const click = Math.sin(2 * Math.PI * 3400 * t) * 0.6;
      const thud = Math.sin(2 * Math.PI * 720 * t) * 0.35;
      buf[i] = (click + thud) * env * 0.65;
    }
    return buf;
  },

  "ambient-tension-drone.wav": () => {
    const dur = 12.0;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(2026);
    const airFilter = createBiquadFilter();
    const rawNoise = new Float32Array(len);
    for (let i = 0; i < len; i++) rawNoise[i] = noise();
    const filteredAir = new Float32Array(len);
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < len; i++) {
        filteredAir[i] = airFilter.process(rawNoise[i], 220, 0.85, "lowpass");
      }
    }
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const swell1 = 0.72 + 0.28 * Math.sin(2 * Math.PI * (1 / 12) * t);
      const swell2 = 0.78 + 0.22 * Math.cos(2 * Math.PI * (2 / 12) * t);
      const sub = Math.sin(2 * Math.PI * 55.0 * t) * 0.34;
      const detuneLow =
        (Math.sin(2 * Math.PI * (55.0 + 1 / 12) * t) +
          Math.sin(2 * Math.PI * (55.0 - 1 / 12) * t)) *
        0.14;
      const fifth = Math.sin(2 * Math.PI * 82.5 * t) * 0.22 * swell1;
      const octave = Math.sin(2 * Math.PI * (110.0 + 2 / 12) * t) * 0.16 * swell2;
      const darkSus = Math.sin(2 * Math.PI * 164.75 * t) * 0.09 * swell1;
      const upperBreath = Math.sin(2 * Math.PI * 220.25 * t) * 0.04 * swell2;
      const air = filteredAir[i] * 0.12 * swell2;
      buf[i] = (sub + detuneLow + fifth + octave + darkSus + upperBreath + air) * 0.55;
    }
    return buf;
  },

  "riser-subtle.wav": () => {
    const dur = 1.8;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(6017);
    const filter = createBiquadFilter();
    let phase1 = 0;
    let phase2 = 0;
    const tailSamples = Math.floor(0.12 * SAMPLE_RATE);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const p = t / dur;
      const attack = Math.min(1, t / 0.12);
      const swell = Math.pow(p, 1.85) * attack;
      const tail =
        i > len - tailSamples
          ? 0.5 * (1 + Math.cos((Math.PI * (i - (len - tailSamples))) / tailSamples))
          : 1.0;
      const freq = 65 + Math.pow(p, 1.9) * 95;
      phase1 += (2 * Math.PI * freq) / SAMPLE_RATE;
      phase2 += (2 * Math.PI * freq * 1.5) / SAMPLE_RATE;
      const tone = Math.sin(phase1) * 0.45 + Math.sin(phase2) * 0.22;
      const cutoff = 220 + Math.pow(p, 2.1) * 2100;
      const breath = filter.process(noise(), cutoff, 1.3, "bandpass") * 0.55;
      buf[i] = (tone + breath) * swell * tail * 0.65;
    }
    return buf;
  },

  "chapter-chime.wav": () => {
    const dur = 0.8;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const attackSamples = Math.floor(0.008 * SAMPLE_RATE);
    const fadeOutSamples = Math.floor(0.05 * SAMPLE_RATE);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const attack = i < attackSamples ? 0.5 * (1 - Math.cos((Math.PI * i) / attackSamples)) : 1.0;
      const fadeOut =
        i > len - fadeOutSamples
          ? 0.5 * (1 + Math.cos((Math.PI * (i - (len - fadeOutSamples))) / fadeOutSamples))
          : 1.0;
      const env = Math.exp(-t * 4.8) * attack * fadeOut;
      const root = Math.sin(2 * Math.PI * 523.25 * t) * 0.55;
      const subOct = Math.sin(2 * Math.PI * 261.63 * t) * 0.35 * Math.exp(-t * 2.5);
      const fifth = Math.sin(2 * Math.PI * 784.88 * t) * 0.22 * Math.exp(-t * 7.5);
      const shimmer = Math.sin(2 * Math.PI * 1046.5 * t) * 0.1 * Math.exp(-t * 11.0);
      buf[i] = (root + subOct + fifth + shimmer) * env * 0.6;
    }
    return buf;
  },

  "paper-flip-fast.wav": () => {
    const dur = 0.25;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(9104);
    const filter = createBiquadFilter();
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const p = t / dur;
      const flick = t < 0.045 ? Math.sin((t / 0.045) * Math.PI) * 0.45 : 0;
      const sweepEnv =
        t >= 0.03
          ? Math.sin(Math.PI * Math.min(1, (t - 0.03) / (dur - 0.03))) * Math.exp(-(t - 0.03) * 9)
          : 0;
      const cutoff = 1600 + p * 1400;
      const filtered = filter.process(noise(), cutoff, 1.8, "bandpass");
      buf[i] = filtered * (flick + sweepEnv) * 0.8;
    }
    return buf;
  },

  "alert-ping.wav": () => {
    const dur = 0.35;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const attackSamples = Math.floor(0.004 * SAMPLE_RATE);
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const attack = i < attackSamples ? 0.5 * (1 - Math.cos((Math.PI * i) / attackSamples)) : 1.0;
      const env = Math.exp(-t * 12.5) * attack;
      const p1 = Math.sin(2 * Math.PI * 1318.5 * t) * 0.65;
      const p2 = Math.sin(2 * Math.PI * 1975.5 * t) * 0.22 * Math.exp(-t * 16);
      const p3 = Math.sin(2 * Math.PI * 2637.0 * t) * 0.12 * Math.exp(-t * 22);
      buf[i] = (p1 + p2 + p3) * env * 0.65;
    }
    return buf;
  },

  "camera-shutter.wav": () => {
    const dur = 0.14;
    const len = Math.floor(SAMPLE_RATE * dur);
    const buf = new Float32Array(len);
    const noise = createNoiseGen(3319);
    const filter = createBiquadFilter();
    for (let i = 0; i < len; i++) {
      const t = i / SAMPLE_RATE;
      const curtain1 = t < 0.022 ? Math.sin((t / 0.022) * Math.PI) * 0.85 : 0;
      const curtain2 =
        t >= 0.048 && t < 0.072 ? Math.sin(((t - 0.048) / 0.024) * Math.PI) * 0.65 : 0;
      const bodyThud = Math.sin(2 * Math.PI * 380 * t) * Math.exp(-t * 55) * 0.45;
      const mechClick = filter.process(noise(), 3100, 2.2, "bandpass") * (curtain1 + curtain2) * 0.9;
      const tailFade = Math.exp(-Math.max(0, t - 0.06) * 45);
      buf[i] = (mechClick + bodyThud) * tailFade * 0.75;
    }
    return buf;
  },

  // -----------------------------------------------------------------------
  // DETUNED MULTI-VARIANT FAMILIES (29 WAVS: 6 FAMILIES x _v1..v4 + 5 BASES)
  // -----------------------------------------------------------------------
  "paper-slide_v1.wav": () => synthPaperSlideVariant(1101, 0.968),
  "paper-slide_v2.wav": () => synthPaperSlideVariant(1102, 0.989),
  "paper-slide_v3.wav": () => synthPaperSlideVariant(1103, 1.012),
  "paper-slide_v4.wav": () => synthPaperSlideVariant(1104, 1.034),

  "felt-highlighter.wav": () => synthFeltHighlighterVariant(2100, 1.0),
  "felt-highlighter_v1.wav": () => synthFeltHighlighterVariant(2101, 0.966),
  "felt-highlighter_v2.wav": () => synthFeltHighlighterVariant(2102, 0.988),
  "felt-highlighter_v3.wav": () => synthFeltHighlighterVariant(2103, 1.013),
  "felt-highlighter_v4.wav": () => synthFeltHighlighterVariant(2104, 1.036),

  "odometer-tick.wav": () => synthOdometerTickVariant(3100, 1.0),
  "odometer-tick_v1.wav": () => synthOdometerTickVariant(3101, 0.965),
  "odometer-tick_v2.wav": () => synthOdometerTickVariant(3102, 0.988),
  "odometer-tick_v3.wav": () => synthOdometerTickVariant(3103, 1.014),
  "odometer-tick_v4.wav": () => synthOdometerTickVariant(3104, 1.038),

  "solari-flap.wav": () => synthSolariFlapVariant(4100, 1.0),
  "solari-flap_v1.wav": () => synthSolariFlapVariant(4101, 0.97),
  "solari-flap_v2.wav": () => synthSolariFlapVariant(4102, 0.99),
  "solari-flap_v3.wav": () => synthSolariFlapVariant(4103, 1.012),
  "solari-flap_v4.wav": () => synthSolariFlapVariant(4104, 1.035),

  "typewriter-strike.wav": () => synthTypewriterStrikeVariant(5100, 1.0),
  "typewriter-strike_v1.wav": () => synthTypewriterStrikeVariant(5101, 0.967),
  "typewriter-strike_v2.wav": () => synthTypewriterStrikeVariant(5102, 0.989),
  "typewriter-strike_v3.wav": () => synthTypewriterStrikeVariant(5103, 1.013),
  "typewriter-strike_v4.wav": () => synthTypewriterStrikeVariant(5104, 1.037),

  "archival-stamp.wav": () => synthArchivalStampVariant(6100, 1.0),
  "archival-stamp_v1.wav": () => synthArchivalStampVariant(6101, 0.968),
  "archival-stamp_v2.wav": () => synthArchivalStampVariant(6102, 0.99),
  "archival-stamp_v3.wav": () => synthArchivalStampVariant(6103, 1.012),
  "archival-stamp_v4.wav": () => synthArchivalStampVariant(6104, 1.035),
};

// =========================================================================
// DOMAIN FOLEY & STUDIO EXTENSION CUES (47 WAVS -> 96 TOTAL)
// =========================================================================

Object.assign(SFX, {
  // -----------------------------------------------------------------------
  // 19 EXPLICIT DOMAIN FOLEY CUES
  // -----------------------------------------------------------------------

  // 1. fountain-pen-slash (0.28s): steel nib scratch + ink slash across rag paper
  "fountain-pen-slash.wav": () => {
    const N = Math.floor(0.28 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7101);
    const pink = new PinkNoise(rng);
    const bpNib = createBiquadFilter();
    const bpFiber = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const env = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.82)), 1.25);
      const scratch = (rng() < 3400 / SAMPLE_RATE ? (rng() - 0.5) * 1.4 : 0) + pink.next();
      const nib = bpNib.process(scratch, 4200 + 1300 * u, 3.2, "bpf");
      const fiber = bpFiber.process(scratch, 1450 + 400 * Math.sin(u * 9), 1.9, "bpf") * 0.55;
      const sig = (nib + fiber) * env;
      L[i] = sig * (1.08 - 0.16 * u);
      R[i] = sig * (0.92 + 0.16 * u);
    }
    return finalizeStereo(L, R, -7.0, 1.5, 10.0);
  },

  // 2. gavel-wood-hit (0.42s): hardwood sounding block crack + walnut cavity resonance
  "gavel-wood-hit.wav": () => {
    const N = Math.floor(0.42 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7102);
    const pink = new PinkNoise(rng);
    const bpCrack = createBiquadFilter();
    const modes = [
      [185, 0.055, 0.72],
      [490, 0.028, 0.88],
      [1180, 0.014, 0.64],
      [2840, 0.0055, 0.48],
    ];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const crack = bpCrack.process(pink.next(), 2200, 1.6, "bpf") * Math.exp(-t / 0.007) * 1.1;
      const wood = modalBankSample(t, modes, 1.0);
      const room = modalBankSample(Math.max(0, t - 0.011), modes, 0.994) * 0.18;
      L[i] = Math.tanh((crack + wood + room * 0.8) * 1.3);
      R[i] = Math.tanh((crack * 0.96 + wood + room * 1.2) * 1.3);
    }
    return finalizeStereo(L, R, -4.5, 0.8, 16.0);
  },

  // 3. guillotine-slice (0.48s): descending steel shear hiss + heavy block thud
  "guillotine-slice.wav": () => {
    const N = Math.floor(0.48 * SAMPLE_RATE);
    const chopIdx = Math.floor(0.22 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7103);
    const pink = new PinkNoise(rng);
    const bpBlade = createBiquadFilter();
    let subPhase = 0;
    for (let i = 0; i < N; i++) {
      if (i < chopIdx) {
        const u = i / chopIdx;
        const shear =
          bpBlade.process(pink.next(), 2600 + 2800 * u * u, 4.2, "bpf") * Math.pow(u, 1.4) * 0.75;
        const ring = Math.sin(2 * Math.PI * (1920 + 420 * u) * (i / SAMPLE_RATE)) * u * 0.12;
        L[i] = shear + ring;
        R[i] = (shear + ring) * 0.96;
      } else {
        const dt = (i - chopIdx) / SAMPLE_RATE;
        const fSub = 52 + 88 * Math.exp(-dt / 0.02);
        subPhase += (2 * Math.PI * fSub) / SAMPLE_RATE;
        const thud = Math.tanh(Math.sin(subPhase) * 1.6) * Math.exp(-dt / 0.075) * 0.9;
        const metalRing =
          (Math.sin(2 * Math.PI * 1680 * dt) * 0.35 + Math.sin(2 * Math.PI * 3890 * dt) * 0.2) *
          Math.exp(-dt / 0.045);
        L[i] = thud + metalRing * 1.05;
        R[i] = thud + metalRing * 0.95;
      }
    }
    return finalizeStereo(L, R, -5.0, 2.0, 14.0);
  },

  // 4. vault-bolt-lock (0.52s): heavy machined steel deadbolt slide + lock clunk
  "vault-bolt-lock.wav": () => {
    const N = Math.floor(0.52 * SAMPLE_RATE);
    const lockIdx = Math.floor(0.18 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7104);
    const pink = new PinkNoise(rng);
    const bpSlide = createBiquadFilter();
    const modes = [
      [112, 0.085, 0.85],
      [338, 0.045, 0.65],
      [940, 0.025, 0.55],
      [2480, 0.012, 0.42],
    ];
    for (let i = 0; i < N; i++) {
      if (i < lockIdx) {
        const u = i / lockIdx;
        const scrape = bpSlide.process(pink.next(), 900 + 650 * u, 2.5, "bpf") * Math.sin(Math.PI * u) * 0.6;
        L[i] = scrape;
        R[i] = scrape * 0.94;
      } else {
        const dt = (i - lockIdx) / SAMPLE_RATE;
        const clunk = modalBankSample(dt, modes, 1.0);
        const transient = bpSlide.process(pink.next(), 1800, 1.4, "bpf") * Math.exp(-dt / 0.008) * 0.7;
        L[i] = Math.tanh((clunk + transient) * 1.35);
        R[i] = Math.tanh((clunk * 0.97 + transient * 1.03) * 1.35);
      }
    }
    return finalizeStereo(L, R, -5.0, 2.0, 16.0);
  },

  // 5. hydraulic-press (0.68s): pressurized oil-cylinder descent + heavy compression stop
  "hydraulic-press.wav": () => {
    const N = Math.floor(0.68 * SAMPLE_RATE);
    const stopIdx = Math.floor(0.42 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7105);
    const pink = new PinkNoise(rng);
    const bpHiss = createBiquadFilter();
    let motorPhase = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      if (i < stopIdx) {
        const u = i / stopIdx;
        const mFreq = 135 - 28 * u;
        motorPhase += (2 * Math.PI * mFreq) / SAMPLE_RATE;
        const motor = (Math.sin(motorPhase) * 0.35 + Math.sin(motorPhase * 2) * 0.18) * Math.sin(Math.PI * Math.pow(u, 0.6));
        const hiss = bpHiss.process(pink.next(), 1900 + 600 * u, 2.0, "bpf") * 0.42;
        L[i] = motor + hiss;
        R[i] = motor + hiss * 0.94;
      } else {
        const dt = (i - stopIdx) / SAMPLE_RATE;
        const seal = Math.sin(2 * Math.PI * (58 + 50 * Math.exp(-dt / 0.025)) * dt) * Math.exp(-dt / 0.09) * 0.85;
        const bleed = bpHiss.process(pink.next(), 3400, 2.8, "bpf") * Math.exp(-dt / 0.05) * 0.55;
        L[i] = Math.tanh((seal + bleed) * 1.25);
        R[i] = Math.tanh((seal + bleed * 1.06) * 1.25);
      }
    }
    return finalizeStereo(L, R, -5.5, 3.0, 18.0);
  },

  // 6. pneumatic-servo (0.26s): crisp solenoid click + compressed-air release
  "pneumatic-servo.wav": () => {
    const N = Math.floor(0.26 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const rng = mulberry32(7106);
    const pink = new PinkNoise(rng);
    const bpAir = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const click = Math.sin(2 * Math.PI * 2900 * t) * Math.exp(-t / 0.0035) * 0.55;
      const servo = Math.sin(2 * Math.PI * (620 + 480 * Math.min(1, t / 0.08)) * t) * Math.exp(-t / 0.065) * 0.32;
      const hiss = bpAir.process(pink.next(), 4400 - 1800 * (t / 0.26), 1.8, "bpf") * Math.exp(-t / 0.085) * 0.75;
      buf[i] = click + servo + hiss;
    }
    return finalizeMono(buf, -7.0, 1.0, 10.0);
  },

  // 7. server-rack-hum (2.40s): datacenter blade airflow + 120Hz PSU harmonic bed
  "server-rack-hum.wav": () => {
    const N = Math.floor(2.4 * SAMPLE_RATE);
    const X = Math.floor(0.4 * SAMPLE_RATE);
    const rawL = new Float32Array(N + X);
    const rawR = new Float32Array(N + X);
    const rngL = mulberry32(7107);
    const rngR = mulberry32(7108);
    const pL = new PinkNoise(rngL);
    const pR = new PinkNoise(rngR);
    const bpL = createBiquadFilter();
    const bpR = createBiquadFilter();
    for (let i = 0; i < N + X; i++) {
      const t = i / SAMPLE_RATE;
      const psu =
        Math.sin(2 * Math.PI * 120 * t) * 0.18 +
        Math.sin(2 * Math.PI * 240 * t) * 0.09 +
        Math.sin(2 * Math.PI * 415 * t) * 0.06;
      const fanL = bpL.process(pL.next(), 680, 1.1, "bpf") * 0.55;
      const fanR = bpR.process(pR.next(), 705, 1.1, "bpf") * 0.55;
      rawL[i] = psu + fanL;
      rawR[i] = psu + fanR;
    }
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      if (i < X) {
        const u = i / X;
        L[i] = Math.sin(0.5 * Math.PI * u) * rawL[i] + Math.cos(0.5 * Math.PI * u) * rawL[N + i];
        R[i] = Math.sin(0.5 * Math.PI * u) * rawR[i] + Math.cos(0.5 * Math.PI * u) * rawR[N + i];
      } else {
        L[i] = rawL[i];
        R[i] = rawR[i];
      }
    }
    return finalizeStereo(L, R, -14.0, 8.0, 8.0);
  },

  // 8. substation-60hz-buzz (1.80s): 500kV transformer magnetostriction (60/120/180/300Hz)
  "substation-60hz-buzz.wav": () => {
    const N = Math.floor(1.8 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const rng = mulberry32(7109);
    const pink = new PinkNoise(rng);
    const bpCorona = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const env = Math.sin(Math.PI * Math.min(1, u * 6)) * (u > 0.85 ? Math.sin(((1 - u) / 0.15) * 0.5 * Math.PI) : 1);
      const mag =
        Math.sin(2 * Math.PI * 60 * t) * 0.36 +
        Math.sin(2 * Math.PI * 120 * t) * 0.44 +
        Math.sin(2 * Math.PI * 180 * t) * 0.22 +
        Math.sin(2 * Math.PI * 300 * t) * 0.11 +
        Math.sin(2 * Math.PI * 420 * t) * 0.05;
      const corona = bpCorona.process(pink.next(), 3600, 3.0, "bpf") * (0.08 + 0.06 * Math.abs(Math.sin(2 * Math.PI * 120 * t)));
      buf[i] = Math.tanh((mag + corona) * 1.15) * env;
    }
    return finalizeMono(buf, -11.0, 12.0, 20.0);
  },

  // 9. radar-sonar-ping (1.15s): naval active sonar 1.48kHz ping + benthic ocean tail
  "radar-sonar-ping.wav": () => {
    const N = Math.floor(1.15 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7110);
    const pink = new PinkNoise(rng);
    const bpTailL = createBiquadFilter();
    const bpTailR = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const att = t < 0.006 ? 0.5 * (1 - Math.cos((Math.PI * t) / 0.006)) : 1;
      const ping =
        (Math.sin(2 * Math.PI * 1480 * t) * 0.78 + Math.sin(2 * Math.PI * 2960 * t) * 0.14 * Math.exp(-t * 14)) *
        Math.exp(-t * 5.2) *
        att;
      const echo =
        t > 0.26
          ? Math.sin(2 * Math.PI * 1474 * (t - 0.26)) * Math.exp(-(t - 0.26) * 4.2) * 0.2
          : 0;
      const water = pink.next() * Math.exp(-t * 2.8) * 0.22;
      L[i] = ping + echo * 0.8 + bpTailL.process(water, 1480, 5.5, "bpf");
      R[i] = ping * 0.96 + echo * 1.2 + bpTailR.process(water, 1492, 5.5, "bpf");
    }
    return finalizeStereo(L, R, -7.5, 2.0, 24.0);
  },

  // 10. subsea-cable-snap (0.72s): steel armor wire whip-snap + deep hydrophone thud
  "subsea-cable-snap.wav": () => {
    const N = Math.floor(0.72 * SAMPLE_RATE);
    const snapIdx = Math.floor(0.14 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7111);
    const pink = new PinkNoise(rng);
    const lpWater = createBiquadFilter();
    let whipPhase = 0;
    for (let i = 0; i < N; i++) {
      if (i < snapIdx) {
        const u = i / snapIdx;
        // Straining steel wire creak before snap
        const strain = Math.sin(2 * Math.PI * (310 + 190 * u * u) * (i / SAMPLE_RATE)) * u * 0.28;
        L[i] = strain;
        R[i] = strain * 0.95;
      } else {
        const dt = (i - snapIdx) / SAMPLE_RATE;
        const fWhip = 1400 * Math.exp(-dt * 11) + 64;
        whipPhase += (2 * Math.PI * fWhip) / SAMPLE_RATE;
        const whip = Math.sin(whipPhase) * Math.exp(-dt * 7.5) * 0.72;
        const rumble = lpWater.process(pink.next(), 240, 1.2, "lpf") * Math.exp(-dt * 3.8) * 1.1;
        L[i] = Math.tanh((whip + rumble) * 1.3);
        R[i] = Math.tanh((whip * 0.88 + rumble * 1.08) * 1.3);
      }
    }
    return finalizeStereo(L, R, -5.0, 2.0, 20.0);
  },

  // 11. vls-launch-whoosh (0.95s): Mk 41 hatch pop + solid rocket booster whoosh
  "vls-launch-whoosh.wav": () => {
    const N = Math.floor(0.95 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7112);
    const pinkL = new PinkNoise(rng);
    const pinkR = new PinkNoise(rng);
    const bpL = createBiquadFilter();
    const bpR = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const hatch = Math.sin(2 * Math.PI * (140 - 70 * Math.min(1, t * 20)) * t) * Math.exp(-t * 32) * 0.65;
      const thrustEnv = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.68)), 1.3);
      const fc = 260 + 1650 * Math.pow(u, 0.85);
      const plumeL = bpL.process(pinkL.next(), fc, 0.95, "bpf") * thrustEnv;
      const plumeR = bpR.process(pinkR.next(), fc * 1.04, 0.95, "bpf") * thrustEnv;
      const pan = -0.25 + 0.5 * u;
      L[i] = hatch + plumeL * (0.6 - pan * 0.4);
      R[i] = hatch + plumeR * (0.6 + pan * 0.4);
    }
    return finalizeStereo(L, R, -5.5, 2.0, 22.0);
  },

  // 12. drone-pass-by (1.10s): Doppler rotor harmonic pass-by L -> R
  "drone-pass-by.wav": () => {
    const N = Math.floor(1.1 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7113);
    const pink = new PinkNoise(rng);
    const bpAir = createBiquadFilter();
    let phase = 0;
    for (let i = 0; i < N; i++) {
      const u = i / N;
      // Smooth S-curve Doppler drop from 1.18x -> 0.82x around midpoint u=0.5
      const doppler = 1.0 - 0.18 * Math.tanh((u - 0.5) * 7.5);
      const baseFreq = 168 * doppler;
      phase += (2 * Math.PI * baseFreq) / SAMPLE_RATE;
      const buzz =
        Math.sin(phase) * 0.45 +
        Math.sin(phase * 2) * 0.28 +
        Math.sin(phase * 3) * 0.16 +
        Math.sin(phase * 4) * 0.08;
      const distEnv = Math.pow(Math.sin(Math.PI * u), 1.6);
      const air = bpAir.process(pink.next(), 950 * doppler, 1.5, "bpf") * 0.3;
      const pan = -0.65 + 1.3 * u;
      const sig = (buzz + air) * distEnv;
      L[i] = sig * (0.5 - pan * 0.5);
      R[i] = sig * (0.5 + pan * 0.5);
    }
    return finalizeStereo(L, R, -7.5, 8.0, 18.0);
  },

  // 13. coin-brass-clink (0.38s): 1912 Island Creek brass scrip token modal ring
  "coin-brass-clink.wav": () => {
    const N = Math.floor(0.38 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    // Inharmonic circular brass disk modes
    const modes = [
      [2180, 0.065, 0.65],
      [3890, 0.052, 0.52],
      [6140, 0.036, 0.38],
      [8420, 0.022, 0.22],
    ];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const hit1 = modalBankSample(t, modes, 1.0);
      const hit2 = t >= 0.052 ? modalBankSample(t - 0.052, modes, 1.028) * 0.55 : 0;
      buf[i] = hit1 + hit2;
    }
    return finalizeMono(buf, -7.0, 0.5, 12.0);
  },

  // 14. anvil-iron-clank (0.56s): heavy cast-iron industrial strike
  "anvil-iron-clank.wav": () => {
    const N = Math.floor(0.56 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(7114);
    const pink = new PinkNoise(rng);
    const bpHit = createBiquadFilter();
    const modes = [
      [295, 0.095, 0.65],
      [812, 0.12, 0.82],
      [1745, 0.085, 0.58],
      [3310, 0.048, 0.42],
      [5180, 0.024, 0.25],
    ];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const transient = bpHit.process(pink.next(), 2900, 1.8, "bpf") * Math.exp(-t / 0.005) * 0.85;
      const ring = modalBankSample(t, modes, 1.0);
      L[i] = Math.tanh((transient + ring) * 1.25);
      R[i] = Math.tanh((transient * 0.94 + modalBankSample(t, modes, 1.002)) * 1.25);
    }
    return finalizeStereo(L, R, -5.0, 0.6, 18.0);
  },

  // 15. jet-gate-retract (0.64s): electromechanical boarding/customs gate retract
  "jet-gate-retract.wav": () => {
    const N = Math.floor(0.64 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const rng = mulberry32(7115);
    const pink = new PinkNoise(rng);
    const bpTrack = createBiquadFilter();
    let servoPhase = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const unlock = Math.sin(2 * Math.PI * 980 * t) * Math.exp(-t / 0.012) * 0.5;
      const fServo = 340 + 210 * Math.sin(Math.PI * u);
      servoPhase += (2 * Math.PI * fServo) / SAMPLE_RATE;
      const motor = Math.sin(servoPhase) * Math.sin(Math.PI * u) * 0.34;
      const roller = bpTrack.process(pink.next(), 1250 + 500 * u, 2.2, "bpf") * Math.sin(Math.PI * u) * 0.5;
      const latchEnd =
        u > 0.86 ? Math.sin(2 * Math.PI * 620 * (t - 0.86 * 0.64)) * Math.exp(-(t - 0.86 * 0.64) / 0.015) * 0.45 : 0;
      buf[i] = unlock + motor + roller + latchEnd;
    }
    return finalizeMono(buf, -6.5, 1.5, 12.0);
  },

  // 16. crowd-cut-mute (0.46s): diffuse room/floor murmur abruptly vacuum-gated to dead silence
  "crowd-cut-mute.wav": () => {
    const N = Math.floor(0.46 * SAMPLE_RATE);
    const gateIdx = Math.floor(0.32 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rngL = mulberry32(7116);
    const rngR = mulberry32(7117);
    const pL = new PinkNoise(rngL);
    const pR = new PinkNoise(rngR);
    const f1L = createBiquadFilter();
    const f2L = createBiquadFilter();
    const f1R = createBiquadFilter();
    const f2R = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      if (i < gateIdx) {
        const mod1 = 0.7 + 0.3 * Math.sin(2 * Math.PI * 6.5 * t);
        const mod2 = 0.7 + 0.3 * Math.cos(2 * Math.PI * 9.2 * t);
        const nL = pL.next();
        const nR = pR.next();
        L[i] = f1L.process(nL, 520, 2.2, "bpf") * mod1 + f2L.process(nL, 1380, 2.6, "bpf") * mod2 * 0.6;
        R[i] = f1R.process(nR, 545, 2.2, "bpf") * mod2 + f2R.process(nR, 1420, 2.6, "bpf") * mod1 * 0.6;
      } else {
        // Crisp 18ms vacuum gate closure + low thump
        const dt = (i - gateIdx) / SAMPLE_RATE;
        const gate = Math.exp(-dt / 0.0045);
        const thump = Math.sin(2 * Math.PI * 76 * dt) * Math.exp(-dt / 0.018) * 0.35;
        L[i] = L[gateIdx - 1] * gate + thump;
        R[i] = R[gateIdx - 1] * gate + thump;
      }
    }
    return finalizeStereo(L, R, -7.0, 6.0, 4.0);
  },

  // 17. sub-bass-drop (0.92s): controlled documentary sub-bass drop (92Hz -> 34Hz + 2nd harmonic)
  "sub-bass-drop.wav": () => {
    const N = Math.floor(0.92 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    let phase = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const att = t < 0.008 ? 0.5 * (1 - Math.cos((Math.PI * t) / 0.008)) : 1;
      const freq = 34 + 58 * Math.exp(-t / 0.24);
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const env = Math.exp(-t / 0.38) * att;
      // 2nd harmonic ensures audibility on laptop & phone speakers
      const sig = Math.tanh((Math.sin(phase) * 0.85 + Math.sin(phase * 2) * 0.24) * 1.35) * env;
      L[i] = sig;
      R[i] = sig;
    }
    return finalizeStereo(L, R, -4.5, 2.0, 22.0);
  },

  // 18. register-dissolve-swell (0.64s): 18-frame OKLCH register bridge breath & warm fifth swell
  "register-dissolve-swell.wav": () => {
    const N = Math.floor(0.64 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rngL = mulberry32(7118);
    const rngR = mulberry32(7119);
    const pL = new PinkNoise(rngL);
    const pR = new PinkNoise(rngR);
    const lpL = createBiquadFilter();
    const lpR = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const env = u < 0.48 ? 0.5 * (1 - Math.cos((Math.PI * u) / 0.48)) : 0.5 * (1 + Math.cos((Math.PI * (u - 0.48)) / 0.52));
      const chord =
        Math.sin(2 * Math.PI * 110 * t) * 0.35 +
        Math.sin(2 * Math.PI * 165 * t) * 0.24 +
        Math.sin(2 * Math.PI * 220.4 * t) * 0.14;
      const fc = 180 + 520 * env;
      const airL = lpL.process(pL.next(), fc, 0.9, "lpf") * 0.32;
      const airR = lpR.process(pR.next(), fc * 1.03, 0.9, "lpf") * 0.32;
      L[i] = (chord + airL) * env;
      R[i] = (chord + airR) * env;
    }
    return finalizeStereo(L, R, -8.5, 4.0, 16.0);
  },

  // 19. room-tone-library (4.00s): click-free equal-power crossfaded Reading Room tone
  "room-tone-library.wav": () => {
    const loopSec = 4.0;
    const xfadeSec = 0.8;
    const N = Math.floor(loopSec * SAMPLE_RATE);
    const X = Math.floor(xfadeSec * SAMPLE_RATE);
    const rawL = new Float32Array(N + X);
    const rawR = new Float32Array(N + X);
    const pL = new PinkNoise(mulberry32(4242));
    const pR = new PinkNoise(mulberry32(4243));
    const hpL = createBiquadFilter();
    const hpR = createBiquadFilter();
    const lpL = createBiquadFilter();
    const lpR = createBiquadFilter();
    const mL = createBiquadFilter();
    const mR = createBiquadFilter();
    for (let i = 0; i < N + X; i++) {
      const sL = hpL.process(pL.next(), 52, 0.707, "hpf");
      const sR = hpR.process(pR.next(), 52, 0.707, "hpf");
      rawL[i] = lpL.process(sL + mL.process(sL, 118, 2.2, "bpf") * 0.24, 1550, 0.707, "lpf");
      rawR[i] = lpR.process(sR + mR.process(sR, 121, 2.2, "bpf") * 0.24, 1550, 0.707, "lpf");
    }
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      if (i < X) {
        const u = i / X;
        L[i] = Math.sin(0.5 * Math.PI * u) * rawL[i] + Math.cos(0.5 * Math.PI * u) * rawL[N + i];
        R[i] = Math.sin(0.5 * Math.PI * u) * rawR[i] + Math.cos(0.5 * Math.PI * u) * rawR[N + i];
      } else {
        L[i] = rawL[i];
        R[i] = rawR[i];
      }
    }
    return finalizeStereo(L, R, -24.0, 4.0, 4.0);
  },

  // -----------------------------------------------------------------------
  // 28 COMPLEMENTARY STUDIO FOLEY CUES (COMPLETING 8 FAMILIES x 12 = 96)
  // -----------------------------------------------------------------------

  // Optical Glass extensions (8)
  "glass-loupe-click.wav": () => {
    const N = Math.floor(0.2 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const modes = [
      [1420, 0.022, 0.55],
      [3180, 0.032, 0.65],
      [5840, 0.014, 0.28],
    ];
    for (let i = 0; i < N; i++) buf[i] = modalBankSample(i / SAMPLE_RATE, modes, 1.0);
    return finalizeMono(buf, -7.5, 0.6, 8.0);
  },

  "glass-shimmer-sweep.wav": () => {
    const N = Math.floor(0.42 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const pink = new PinkNoise(mulberry32(8102));
    const bp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const env = Math.sin(Math.PI * u);
      const air = bp.process(pink.next(), 2400 + 2200 * u, 3.8, "bpf") * 0.45;
      const bell = (Math.sin(2 * Math.PI * 1760 * t) + Math.sin(2 * Math.PI * 2640 * t) * 0.45) * 0.22;
      L[i] = (air + bell) * env * (1.06 - 0.12 * u);
      R[i] = (air + bell) * env * (0.94 + 0.12 * u);
    }
    return finalizeStereo(L, R, -9.0, 3.0, 12.0);
  },

  "glass-pill-tick.wav": () => {
    const N = Math.floor(0.08 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      buf[i] =
        (Math.sin(2 * Math.PI * 2150 * t) * 0.7 + Math.sin(2 * Math.PI * 4300 * t) * 0.25) *
        Math.exp(-t * 58);
    }
    return finalizeMono(buf, -8.0, 0.6, 5.0);
  },

  "glass-toast-warn.wav": () => {
    const N = Math.floor(0.34 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const n1 = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 16);
      const n2 = t >= 0.095 ? Math.sin(2 * Math.PI * 659.25 * (t - 0.095)) * Math.exp(-(t - 0.095) * 12) : 0;
      buf[i] = n1 * 0.65 + n2 * 0.75;
    }
    return finalizeMono(buf, -7.0, 1.0, 10.0);
  },

  "glass-prism-lock.wav": () => {
    const N = Math.floor(0.28 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const lock = Math.sin(2 * Math.PI * 1567.98 * t) * Math.exp(-t * 18) * 0.65;
      const fifth = Math.sin(2 * Math.PI * 2349.32 * t) * Math.exp(-t * 24) * 0.35;
      const sub = Math.sin(2 * Math.PI * 196 * t) * Math.exp(-t * 22) * 0.3;
      buf[i] = lock + fifth + sub;
    }
    return finalizeMono(buf, -7.5, 1.0, 10.0);
  },

  "glass-frosted-slide.wav": () => {
    const N = Math.floor(0.32 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const pink = new PinkNoise(mulberry32(8106));
    const bp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const env = Math.pow(Math.sin(Math.PI * u), 1.3);
      buf[i] = bp.process(pink.next(), 2800 - 900 * u, 2.2, "bpf") * env;
    }
    return finalizeMono(buf, -9.0, 2.0, 10.0);
  },

  "glass-triptych-cascade.wav": () => {
    const N = Math.floor(0.36 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const freqs = [1174.66, 1479.98, 1760.0];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      let s = 0;
      for (let k = 0; k < 3; k++) {
        const dt = t - k * 0.068;
        if (dt >= 0) s += Math.sin(2 * Math.PI * freqs[k] * dt) * Math.exp(-dt * 22) * 0.5;
      }
      buf[i] = s;
    }
    return finalizeMono(buf, -7.5, 1.0, 12.0);
  },

  "glass-evaporate-soft.wav": () => {
    const N = Math.floor(0.26 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const pink = new PinkNoise(mulberry32(8108));
    const hp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      buf[i] =
        (hp.process(pink.next(), 3600 + 1800 * u, 0.9, "hpf") * 0.65 +
          Math.sin(2 * Math.PI * (1900 + 800 * u) * t) * 0.18) *
        Math.exp(-t * 14);
    }
    return finalizeMono(buf, -9.5, 1.5, 10.0);
  },

  // Archival Paper & Ink extensions (4)
  "paper-tear-crisp.wav": () => {
    const N = Math.floor(0.33 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const rng = mulberry32(8201);
    const pink = new PinkNoise(rng);
    const bp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const rip = rng() < 4800 / SAMPLE_RATE ? (rng() * 2 - 1) * 0.9 : 0;
      const env = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 1.1);
      buf[i] = bp.process(pink.next() * 0.6 + rip, 2400 + 1900 * u, 1.7, "bpf") * env;
    }
    return finalizeMono(buf, -6.5, 1.5, 10.0);
  },

  "blueprint-unroll.wav": () => {
    const N = Math.floor(0.52 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(8202);
    const pink = new PinkNoise(rng);
    const bp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const wave = 0.65 + 0.35 * Math.sin(2 * Math.PI * 7.5 * t);
      const env = Math.sin(Math.PI * u) * wave;
      const s = bp.process(pink.next(), 950 + 650 * u, 1.4, "bpf") * env;
      L[i] = s * (1.06 - 0.12 * u);
      R[i] = s * (0.94 + 0.12 * u);
    }
    return finalizeStereo(L, R, -7.5, 3.0, 14.0);
  },

  "redaction-tape-pull.wav": () => {
    const N = Math.floor(0.3 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const rng = mulberry32(8203);
    const pink = new PinkNoise(rng);
    const bp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const peel = rng() < 3600 / SAMPLE_RATE ? (rng() - 0.5) * 1.2 : 0;
      const cut = u > 0.88 ? Math.sin(2 * Math.PI * 1800 * ((u - 0.88) * 0.3)) * 0.5 : 0;
      buf[i] = bp.process(pink.next() * 0.5 + peel, 3200 + 900 * u, 2.4, "bpf") * Math.sin(Math.PI * u) + cut;
    }
    return finalizeMono(buf, -7.5, 1.5, 8.0);
  },

  "microfilm-whir.wav": () => {
    const N = Math.floor(0.44 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const rng = mulberry32(8204);
    const pink = new PinkNoise(rng);
    const bp = createBiquadFilter();
    let phase = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const env = Math.sin(Math.PI * u);
      const f = 280 + 460 * Math.sin(Math.PI * u);
      phase += (2 * Math.PI * f) / SAMPLE_RATE;
      const stopClick = u > 0.88 ? Math.sin(2 * Math.PI * 1650 * (t - 0.88 * 0.44)) * Math.exp(-(t - 0.88 * 0.44) * 90) * 0.6 : 0;
      buf[i] = (Math.sin(phase) * 0.28 + bp.process(pink.next(), f * 3, 2.5, "bpf") * 0.5) * env + stopClick;
    }
    return finalizeMono(buf, -7.5, 2.0, 10.0);
  },

  // Mechanical & Industrial extensions (4)
  "pendulum-escapement-tick.wav": () => {
    const N = Math.floor(0.09 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const modes = [
      [880, 0.008, 0.5],
      [2740, 0.005, 0.75],
      [6120, 0.0022, 0.45],
    ];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const tick1 = modalBankSample(t, modes, 1.0);
      const tick2 = t >= 0.022 ? modalBankSample(t - 0.022, modes, 0.94) * 0.42 : 0;
      buf[i] = tick1 + tick2;
    }
    return finalizeMono(buf, -7.0, 0.5, 6.0);
  },

  "ratchet-winch-click.wav": () => {
    const N = Math.floor(0.36 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const modes = [
      [620, 0.009, 0.55],
      [1950, 0.005, 0.75],
      [4100, 0.0025, 0.35],
    ];
    const hits = [0.0, 0.052, 0.108, 0.168, 0.234, 0.305];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      let s = 0;
      for (let h = 0; h < hits.length; h++) {
        const dt = t - hits[h];
        if (dt >= 0 && dt < 0.05) s += modalBankSample(dt, modes, 1 + h * 0.025) * (0.75 + h * 0.04);
      }
      buf[i] = s;
    }
    return finalizeMono(buf, -6.5, 0.8, 10.0);
  },

  "balance-scale-creak.wav": () => {
    const N = Math.floor(0.46 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    let phase = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const f = 320 + 75 * Math.sin(2 * Math.PI * 5.5 * t) * Math.exp(-t * 3.2);
      phase += (2 * Math.PI * f) / SAMPLE_RATE;
      const brass = Math.sin(phase) * 0.45 + Math.sin(phase * 2.02) * 0.22 + Math.sin(phase * 3.05) * 0.1;
      buf[i] = brass * Math.sin(Math.PI * u) * Math.exp(-t * 2.6);
    }
    return finalizeMono(buf, -8.5, 3.0, 14.0);
  },

  "domino-clack-chain.wav": () => {
    const N = Math.floor(0.44 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const modes = [
      [760, 0.011, 0.65],
      [2140, 0.006, 0.8],
      [4480, 0.0025, 0.35],
    ];
    const hits = [0.0, 0.068, 0.128, 0.182, 0.232, 0.278, 0.322];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      for (let h = 0; h < hits.length; h++) {
        const dt = t - hits[h];
        if (dt >= 0 && dt < 0.06) {
          const clack = modalBankSample(dt, modes, 0.96 + h * 0.018);
          const pan = -0.35 + (h / (hits.length - 1)) * 0.7;
          L[i] += clack * (0.5 - pan * 0.5);
          R[i] += clack * (0.5 + pan * 0.5);
        }
      }
    }
    return finalizeStereo(L, R, -6.5, 0.8, 12.0);
  },

  // Data, Tickers & Terminals extensions (4)
  "basis-point-blip.wav": () => {
    const N = Math.floor(0.09 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      buf[i] =
        (Math.sin(2 * Math.PI * 1396.91 * t) * 0.7 + Math.sin(2 * Math.PI * 2793.83 * t) * 0.2) *
        Math.exp(-t * 46);
    }
    return finalizeMono(buf, -8.0, 0.8, 6.0);
  },

  "nsf-decline-buzz.wav": () => {
    const N = Math.floor(0.32 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const active = (t < 0.12) || (t >= 0.16 && t < 0.29) ? 1 : 0;
      const reed =
        Math.sin(2 * Math.PI * 164.81 * t) * 0.55 +
        Math.sin(2 * Math.PI * 174.61 * t) * 0.35 +
        Math.sin(2 * Math.PI * 329.63 * t) * 0.18;
      buf[i] = Math.tanh(reed * 1.3) * active * Math.exp(-Math.max(0, t - 0.22) * 14);
    }
    return finalizeMono(buf, -7.5, 2.0, 10.0);
  },

  "calculator-ribbon-print.wav": () => {
    const N = Math.floor(0.24 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const rng = mulberry32(8403);
    const pink = new PinkNoise(rng);
    const bp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const stepper = Math.sin(2 * Math.PI * 440 * t + Math.sin(2 * Math.PI * 38 * t) * 2.2) * 0.32;
      const head = bp.process(pink.next(), 2900, 2.4, "bpf") * (0.5 + 0.5 * Math.sin(2 * Math.PI * 42 * t)) * 0.65;
      buf[i] = (stepper + head) * Math.sin(Math.PI * u);
    }
    return finalizeMono(buf, -7.5, 1.5, 8.0);
  },

  "audit-row-lock.wav": () => {
    const N = Math.floor(0.12 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const c1 = Math.sin(2 * Math.PI * 987.77 * t) * Math.exp(-t * 48) * 0.55;
      const c2 = t >= 0.032 ? Math.sin(2 * Math.PI * 1479.98 * (t - 0.032)) * Math.exp(-(t - 0.032) * 36) * 0.65 : 0;
      buf[i] = c1 + c2;
    }
    return finalizeMono(buf, -7.5, 0.8, 6.0);
  },

  // Grid, Silicon & Tactical extensions (5)
  "high-voltage-arc-snap.wav": () => {
    const N = Math.floor(0.22 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const rng = mulberry32(8501);
    const pink = new PinkNoise(rng);
    const bp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const crackle = (rng() < 5200 / SAMPLE_RATE ? (rng() * 2 - 1) : 0) + pink.next() * 0.5;
      const buzz = Math.sin(2 * Math.PI * 120 * t) * 0.35 + Math.sin(2 * Math.PI * 240 * t) * 0.25;
      buf[i] = (bp.process(crackle, 3800, 1.6, "bpf") * 0.9 + buzz) * Math.exp(-t * 16);
    }
    return finalizeMono(buf, -6.0, 0.6, 8.0);
  },

  "watt-meter-whir.wav": () => {
    const N = Math.floor(0.5 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    let phase = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const f = 180 + 340 * Math.pow(u, 0.8);
      phase += (2 * Math.PI * f) / SAMPLE_RATE;
      const eddy = Math.sin(phase) * 0.5 + Math.sin(phase * 2) * 0.2;
      const tick = Math.sin(2 * Math.PI * 2400 * t) * Math.pow(Math.max(0, Math.sin(2 * Math.PI * (8 + 14 * u) * t)), 16) * 0.35;
      buf[i] = (eddy + tick) * Math.sin(Math.PI * u);
    }
    return finalizeMono(buf, -8.0, 3.0, 12.0);
  },

  "euv-laser-pulse.wav": () => {
    const N = Math.floor(0.18 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const chirp = Math.sin(2 * Math.PI * (3200 - 1900 * (t / 0.18)) * t) * Math.exp(-t * 28);
      const pulseTrain = 0.65 + 0.35 * Math.cos(2 * Math.PI * 95 * t);
      buf[i] = chirp * pulseTrain;
    }
    return finalizeMono(buf, -7.5, 0.6, 8.0);
  },

  "breaker-trip-clunk.wav": () => {
    const N = Math.floor(0.32 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    const modes = [
      [94, 0.055, 0.85],
      [280, 0.032, 0.65],
      [1260, 0.012, 0.55],
      [3450, 0.005, 0.45],
    ];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const main = modalBankSample(t, modes, 1.0);
      const bounce = t >= 0.038 ? modalBankSample(t - 0.038, modes, 1.08) * 0.38 : 0;
      buf[i] = Math.tanh((main + bounce) * 1.3);
    }
    return finalizeMono(buf, -5.0, 0.6, 12.0);
  },

  "anchor-chain-scrape.wav": () => {
    const N = Math.floor(0.68 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const rng = mulberry32(8505);
    const pink = new PinkNoise(rng);
    const bpScrape = createBiquadFilter();
    const modes = [
      [240, 0.035, 0.5],
      [710, 0.025, 0.65],
      [1690, 0.014, 0.4],
    ];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const env = Math.sin(Math.PI * u);
      const grit = bpScrape.process(pink.next(), 620 + 480 * Math.sin(t * 14), 1.8, "bpf") * env * 0.7;
      let links = 0;
      for (let k = 0; k < 5; k++) {
        const dt = t - (0.06 + k * 0.11);
        if (dt >= 0 && dt < 0.09) links += modalBankSample(dt, modes, 0.95 + k * 0.03) * 0.5;
      }
      L[i] = grit + links * 1.05;
      R[i] = grit * 0.94 + links * 0.95;
    }
    return finalizeStereo(L, R, -6.5, 4.0, 16.0);
  },

  // Cinematic Transitions extensions (3)
  "tape-stop-drop.wav": () => {
    const N = Math.floor(0.48 * SAMPLE_RATE);
    const buf = new Float32Array(N);
    let phase = 0;
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const speed = Math.pow(1 - u, 2.2);
      const freq = 32 + 390 * speed;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      buf[i] = Math.tanh((Math.sin(phase) * 0.7 + Math.sin(phase * 1.5) * 0.3) * 1.2) * Math.pow(1 - u, 0.55);
    }
    return finalizeMono(buf, -6.0, 2.0, 14.0);
  },

  "reverse-glass-suck.wav": () => {
    const N = Math.floor(0.46 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    const pink = new PinkNoise(mulberry32(8602));
    const bp = createBiquadFilter();
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const u = i / N;
      const env = Math.pow(u, 2.6) * (u > 0.94 ? Math.cos(((u - 0.94) / 0.06) * 0.5 * Math.PI) : 1);
      const bell = Math.sin(2 * Math.PI * 1318.5 * t) * 0.5 + Math.sin(2 * Math.PI * 1975.5 * t) * 0.25;
      const air = bp.process(pink.next(), 900 + 2800 * u * u, 2.2, "bpf") * 0.55;
      L[i] = (bell + air) * env;
      R[i] = (bell * 0.97 + air * 1.05) * env;
    }
    return finalizeStereo(L, R, -6.5, 4.0, 6.0);
  },

  "resolve-chord-warm.wav": () => {
    const N = Math.floor(1.4 * SAMPLE_RATE);
    const L = new Float32Array(N);
    const R = new Float32Array(N);
    // Restrained warm D Dorian / Asus4 fifth resolution
    const freqs = [146.83, 220.0, 293.66, 329.63, 440.0];
    for (let i = 0; i < N; i++) {
      const t = i / SAMPLE_RATE;
      const att = t < 0.025 ? 0.5 * (1 - Math.cos((Math.PI * t) / 0.025)) : 1;
      const dec = Math.exp(-t * 2.4);
      let sL = 0;
      let sR = 0;
      for (let k = 0; k < freqs.length; k++) {
        const pan = (k - 2) * 0.16;
        const v = Math.sin(2 * Math.PI * freqs[k] * t) * Math.exp(-t * (1.8 + k * 0.45)) * 0.24;
        sL += v * (0.5 - pan * 0.5);
        sR += v * (0.5 + pan * 0.5);
      }
      L[i] = Math.tanh(sL * 1.2) * att * dec;
      R[i] = Math.tanh(sR * 1.2) * att * dec;
    }
    return finalizeStereo(L, R, -8.5, 4.0, 30.0);
  },
});

export function buildAllSfx(outDir = SFX_DIR) {
  fs.mkdirSync(outDir, { recursive: true });
  const entries = Object.entries(SFX);
  if (entries.length !== 96) {
    throw new Error(`Expected exactly 96 SFX definitions, found ${entries.length}`);
  }
  const written = [];
  for (const [filename, generator] of entries) {
    const result = generator();
    const wavBuffer = encodeWav(result, SAMPLE_RATE);
    const targetPath = path.join(outDir, filename);
    fs.writeFileSync(targetPath, wavBuffer);
    const numFrames = result.L ? result.L.length : result.length;
    written.push({
      filename,
      samples: numFrames,
      durationSec: numFrames / SAMPLE_RATE,
      bytes: wavBuffer.length,
    });
  }
  return written;
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  console.log(`Generating ${Object.keys(SFX).length} procedural 48kHz Studio Foley WAVs into ${SFX_DIR}...`);
  const generated = buildAllSfx(SFX_DIR);
  console.log(`✓ Generated ${generated.length} WAV files (${generated.reduce((a, b) => a + b.bytes, 0)} bytes total).`);
}
