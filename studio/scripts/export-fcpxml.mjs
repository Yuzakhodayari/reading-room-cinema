#!/usr/bin/env node
/**
 * Upgraded DaVinci Resolve Free FCPXML v1.9 Multi-Lane Bridge (`studio/scripts/export-fcpxml.mjs`)
 *
 * Timeline Track Architecture (100% FCPXML v1.9 DTD compliant):
 *   - Spine V1 + A1 : Blade-cut A-roll clips with real `<adjust-transform>` camera keyframes
 *                     (`talking-head-punch-in` 100%->112%, `split-screen` left-shift,
 *                     and subtle 100%->104% tension creeps) + -14 LUFS `dialogue` role.
 *   - Lane +1 (V2)  : Graphic / cutaway / Behind-Presenter Layer (`<beatId>.mov|.mp4|.webm`).
 *   - Lane +2 (V3)  : Foreground Alpha-Masked Presenter (`aroll_person_alpha.mov|.webm`) on
 *                     Pillar #10 Depth-Sandwich beats (pixel-locked to V1 camera transforms;
 *                     falls back cleanly to V1+V2 when no person-alpha file is supplied).
 *   - Lane +3 (V4)  : Foreground Smoked-Navy Liquid Glass HUD on Depth-Sandwich beats.
 *   - Lane -1 (A2)  : Sample-accurate 96-WAV procedural studio foley cues (`public/sfx/`).
 *   - Lane -2 (A3)  : Bundled documentary score stem (`public/music/02-ledger-investigation.wav`
 *                     or plan-selected stem) tiled seamlessly with speech-ducking `<adjust-volume>`
 *                     keyframes.
 *
 * Usage:
 *   node scripts/export-fcpxml.mjs <director-plan.json> [--aroll path/to/aroll.mp4]
 *     [--person-alpha path/to/aroll_person_alpha.mov] [--depth-sandwich]
 *     [--music 02-ledger-investigation] [--overlays-dir out/overlays] [--out out/timeline.fcpxml]
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STUDIO_DIR = path.resolve(__dirname, "..");
const SFX_DIR = path.join(STUDIO_DIR, "public", "sfx");
const MUSIC_DIR = path.join(STUDIO_DIR, "public", "music");
const DEFAULT_MUSIC_STEM = "02-ledger-investigation";

const SFX_ALIAS_FALLBACKS = {
  paper_slide: "paper-slide",
  felt_highlight: "felt-highlighter",
  "highlighter-sweep": "felt-highlighter",
  odometer_tick: "odometer-tick",
  "ticker-roll": "odometer-tick",
  archival_stamp: "archival-stamp",
  "stamp-slam": "archival-stamp",
  sub_swell: "register-dissolve-swell",
  room_tone: "room-tone-library",
  "gavel-slam": "gavel-wood-hit",
  "gavel-wood-crack": "gavel-wood-hit",
  "guillotine-slice-thud": "guillotine-slice",
  "vault-bolt-clank": "vault-bolt-lock",
  "brass-scrip-clink": "coin-brass-clink",
  "sonar-active-ping": "radar-sonar-ping",
  "fiber-cable-snap-sub": "subsea-cable-snap",
  "vls-hatch-pop-whoosh": "vls-launch-whoosh",
  "drone-prop-buzz-pass": "drone-pass-by",
  "transformer-60hz-hum": "substation-60hz-buzz",
  "sub-bass-cliff-drop": "sub-bass-drop",
  "silence-vacuum-gate": "crowd-cut-mute",
  "tape-stop-pitch-drop": "tape-stop-drop",
};

function printUsage() {
  console.log(`Usage:
  node scripts/export-fcpxml.mjs <director-plan.json> [options]

Options:
  --aroll <path>         Path to prepped A-roll MP4 (placed on Spine V1/A1)
  --person-alpha <path>  Alpha presenter matte (.mov ProRes 4444 or .webm VP9) for V3 Depth Sandwich
  --depth-sandwich       Force 4-lane Depth-Sandwich layout (V1 BG, V2 Behind, V3 Person, V4 Glass)
  --no-depth-sandwich    Disable V3/V4 Depth-Sandwich lanes even if person-alpha exists
  --music <stem-or-path> Bundled music stem ID or .wav path for A3 (default: 02-ledger-investigation)
  --no-music             Omit A3 music stem lane
  --overlays-dir <dir>   Directory containing rendered overlays and/or overlay-manifest.json
  --out <path>           Output .fcpxml file path (default: out/timeline.fcpxml)
  -h, --help             Show help`);
}

export function parseArgs(argv) {
  const opts = {
    planPath: null,
    arollPath: null,
    personAlphaPath: null,
    depthSandwich: null, // null = auto-detect from personAlpha file presence
    musicArg: null,
    enableMusic: true,
    overlaysDir: path.join(STUDIO_DIR, "out", "overlays"),
    outPath: path.join(STUDIO_DIR, "out", "timeline.fcpxml"),
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    } else if (arg === "--aroll") {
      opts.arollPath = path.resolve(argv[++i]);
    } else if (arg === "--person-alpha") {
      opts.personAlphaPath = path.resolve(argv[++i]);
    } else if (arg === "--depth-sandwich") {
      opts.depthSandwich = true;
    } else if (arg === "--no-depth-sandwich") {
      opts.depthSandwich = false;
    } else if (arg === "--music") {
      opts.musicArg = argv[++i];
    } else if (arg === "--no-music") {
      opts.enableMusic = false;
    } else if (arg === "--overlays-dir") {
      opts.overlaysDir = path.resolve(argv[++i]);
    } else if (arg === "--out") {
      opts.outPath = path.resolve(argv[++i]);
    } else if (!arg.startsWith("-") && !opts.planPath) {
      opts.planPath = path.resolve(arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!opts.planPath) {
    throw new Error("Missing required positional argument: <director-plan.json>");
  }
  return opts;
}

function escapeXml(val) {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeId(raw) {
  return String(raw || "item").replace(/[^a-zA-Z0-9._-]+/g, "_");
}

export function toRationalTime(frames, fps) {
  const cleanFrames = Math.max(0, Math.round(frames));
  if (cleanFrames === 0) return "0s";
  const den = Math.round(fps) * 100;
  const num = cleanFrames * 100;
  return `${num}/${den}s`;
}

function linearGainToDb(gain) {
  if (!Number.isFinite(gain) || gain <= 0.0001) return "-96.00";
  return (20 * Math.log10(gain)).toFixed(2);
}

export function readWavDurationFrames(wavPath, fps, fallbackSec = 0.35) {
  if (!fs.existsSync(wavPath)) {
    return Math.max(1, Math.round(fallbackSec * fps));
  }
  try {
    const buf = fs.readFileSync(wavPath);
    if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF") {
      return Math.max(1, Math.round(fallbackSec * fps));
    }
    const byteRate = buf.readUInt32LE(28);
    let offset = 12;
    let dataSize = 0;
    while (offset + 8 <= buf.length) {
      const chunkId = buf.toString("ascii", offset, offset + 4);
      const chunkSize = buf.readUInt32LE(offset + 4);
      if (chunkId === "data") {
        dataSize = chunkSize;
        break;
      }
      offset += 8 + chunkSize + (chunkSize % 2);
    }
    if (byteRate > 0 && dataSize > 0) {
      const sec = dataSize / byteRate;
      return Math.max(1, Math.round(sec * fps));
    }
  } catch {
    // Fallback below
  }
  return Math.max(1, Math.round(fallbackSec * fps));
}

function findFfprobe() {
  const probeCmd = process.platform === "win32" ? "where.exe" : "which";
  const onPath = spawnSync(probeCmd, ["ffprobe"], { encoding: "utf8" });
  if (onPath.status === 0 && onPath.stdout) {
    const first = onPath.stdout.split(/\r?\n/).find((l) => l.trim().length > 0);
    if (first && fs.existsSync(first.trim())) return first.trim();
  }
  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    const wingetRoot = path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages");
    if (fs.existsSync(wingetRoot)) {
      const stack = [{ dir: wingetRoot, depth: 0 }];
      while (stack.length > 0) {
        const { dir, depth } = stack.pop();
        for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, ent.name);
          if (ent.isFile() && ent.name.toLowerCase() === "ffprobe.exe") return full;
          if (ent.isDirectory() && depth < 4) stack.push({ dir: full, depth: depth + 1 });
        }
      }
    }
  }
  return null;
}

function probeMediaDurationFrames(ffprobeBin, mediaPath, fps, fallbackFrames) {
  if (!ffprobeBin || !fs.existsSync(mediaPath)) return fallbackFrames;
  const res = spawnSync(
    ffprobeBin,
    ["-v", "error", "-show_entries", "format=duration", "-of", "json", mediaPath],
    { encoding: "utf8" }
  );
  if (res.status !== 0 || !res.stdout) return fallbackFrames;
  try {
    const parsed = JSON.parse(res.stdout);
    const sec = Number(parsed?.format?.duration || 0);
    if (Number.isFinite(sec) && sec > 0) {
      return Math.max(1, Math.round(sec * fps));
    }
  } catch {
    // ignore
  }
  return fallbackFrames;
}

function resolvePersonAlphaInfo(opts, arollPath, planDir) {
  if (opts.depthSandwich === false) {
    return { active: false, path: null };
  }
  if (opts.personAlphaPath) {
    return { active: true, path: opts.personAlphaPath };
  }
  const searchDirs = [path.dirname(arollPath), planDir];
  const candidateNames = [
    "aroll_person_alpha.mov",
    "aroll_person_alpha.webm",
    `${path.parse(arollPath).name}_person_alpha.mov`,
    `${path.parse(arollPath).name}_person_alpha.webm`,
  ];
  for (const dir of searchDirs) {
    for (const name of candidateNames) {
      const full = path.join(dir, name);
      if (fs.existsSync(full)) {
        return { active: true, path: full };
      }
    }
  }
  if (opts.depthSandwich === true) {
    return { active: true, path: path.join(path.dirname(arollPath), "aroll_person_alpha.mov") };
  }
  return { active: false, path: null };
}

function isDepthSandwichBeat(beat) {
  if (!beat) return false;
  if (beat.layering === "behind-presenter" || beat.layering === "depth-sandwich") return true;
  if (beat.depthSandwich && (beat.depthSandwich === true || beat.depthSandwich.enabled !== false)) {
    return true;
  }
  if (beat.framing === "behind-presenter" || beat.framing === "depth-sandwich") return true;
  if (beat.typographyMode === "behind-presenter-monolith") return true;
  if (beat.data?.depthSandwich || beat.data?.layering === "behind-presenter") return true;
  return false;
}

function resolveOverlayClipPath(beat, overlaysDir, manifestById, variantSuffix = "") {
  const manifestKey = variantSuffix ? `${beat.id}:${variantSuffix}` : beat.id;
  if (manifestById[manifestKey]) {
    return path.resolve(manifestById[manifestKey]);
  }
  if (!variantSuffix && manifestById[beat.id]) {
    return path.resolve(manifestById[beat.id]);
  }
  const safeId = sanitizeId(beat.id);
  const stem = variantSuffix ? `${safeId}_${variantSuffix}` : safeId;
  const candidates =
    beat.framing === "fullscreen-cutaway" && !variantSuffix
      ? [`${stem}.mp4`, `${stem}.mov`, `${stem}.webm`]
      : [`${stem}.mov`, `${stem}.webm`, `${stem}.mp4`];

  for (const name of candidates) {
    const candidate = path.join(overlaysDir, name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  if (variantSuffix === "behind") {
    return resolveOverlayClipPath(beat, overlaysDir, manifestById, "");
  }
  return path.join(overlaysDir, candidates[0]);
}

function resolveSfxWavPath(rawCue) {
  const clean = String(rawCue || "").trim();
  const mapped = SFX_ALIAS_FALLBACKS[clean] || clean;
  const primaryPath = path.join(SFX_DIR, `${mapped}.wav`);
  if (fs.existsSync(primaryPath)) return { cueId: mapped, wavPath: primaryPath };
  const rawPath = path.join(SFX_DIR, `${clean}.wav`);
  return { cueId: clean, wavPath: rawPath };
}

function resolveMusicStemPath(musicArg, plan) {
  const chosen =
    musicArg ||
    plan?.musicStem ||
    plan?.visualSignature?.scorePalette?.[0] ||
    (Array.isArray(plan?.musicStems) ? plan.musicStems[0] : null) ||
    DEFAULT_MUSIC_STEM;

  const candidates = [
    path.resolve(String(chosen)),
    path.join(MUSIC_DIR, String(chosen)),
    path.join(MUSIC_DIR, `${String(chosen).replace(/\.wav$/i, "")}.wav`),
    path.join(MUSIC_DIR, `${DEFAULT_MUSIC_STEM}.wav`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }
  return path.join(MUSIC_DIR, `${DEFAULT_MUSIC_STEM}.wav`);
}

/**
 * Build FCPXML v1.9 `<adjust-transform>` camera keyframes for V1 A-roll & V3 Person Alpha.
 * Keyframe `time` inside an `<asset-clip start="S" duration="D">` uses clip media time `[S, S+D]`.
 */
export function buildCameraTransformXml(beat, clipStartFrame, durFrames, fps, indent = "              ") {
  if (!beat || beat.framing === "fullscreen-cutaway" || durFrames < 2) {
    return [];
  }

  const rampFrames = Math.max(1, Math.min(10, Math.floor(durFrames * 0.35)));
  const t0 = toRationalTime(clipStartFrame, fps);
  const tRamp = toRationalTime(clipStartFrame + rampFrames, fps);
  const tEnd = toRationalTime(clipStartFrame + durFrames, fps);

  if (beat.framing === "talking-head-punch-in") {
    return [
      `${indent}<adjust-transform position="0 -3" scale="1.12 1.12">`,
      `${indent}  <param name="position" value="0 -3">`,
      `${indent}    <keyframeAnimation>`,
      `${indent}      <keyframe time="${t0}" value="0 0" curve="smooth"/>`,
      `${indent}      <keyframe time="${tRamp}" value="0 -3" curve="smooth"/>`,
      ...(durFrames > rampFrames
        ? [`${indent}      <keyframe time="${tEnd}" value="0 -3" curve="linear"/>`]
        : []),
      `${indent}    </keyframeAnimation>`,
      `${indent}  </param>`,
      `${indent}  <param name="scale" value="1.12 1.12">`,
      `${indent}    <keyframeAnimation>`,
      `${indent}      <keyframe time="${t0}" value="1 1" curve="smooth"/>`,
      `${indent}      <keyframe time="${tRamp}" value="1.12 1.12" curve="smooth"/>`,
      ...(durFrames > rampFrames
        ? [`${indent}      <keyframe time="${tEnd}" value="1.12 1.12" curve="linear"/>`]
        : []),
      `${indent}    </keyframeAnimation>`,
      `${indent}  </param>`,
      `${indent}</adjust-transform>`,
    ];
  }

  if (beat.framing === "split-screen") {
    return [
      `${indent}<adjust-transform position="-38 0" scale="1.04 1.04">`,
      `${indent}  <param name="position" value="-38 0">`,
      `${indent}    <keyframeAnimation>`,
      `${indent}      <keyframe time="${t0}" value="0 0" curve="smooth"/>`,
      `${indent}      <keyframe time="${tRamp}" value="-38 0" curve="smooth"/>`,
      ...(durFrames > rampFrames
        ? [`${indent}      <keyframe time="${tEnd}" value="-38 0" curve="linear"/>`]
        : []),
      `${indent}    </keyframeAnimation>`,
      `${indent}  </param>`,
      `${indent}  <param name="scale" value="1.04 1.04">`,
      `${indent}    <keyframeAnimation>`,
      `${indent}      <keyframe time="${t0}" value="1 1" curve="smooth"/>`,
      `${indent}      <keyframe time="${tRamp}" value="1.04 1.04" curve="smooth"/>`,
      ...(durFrames > rampFrames
        ? [`${indent}      <keyframe time="${tEnd}" value="1.04 1.04" curve="linear"/>`]
        : []),
      `${indent}    </keyframeAnimation>`,
      `${indent}  </param>`,
      `${indent}</adjust-transform>`,
    ];
  }

  const wantsTensionCreep =
    beat.musicEnergy === "tense" ||
    beat.category === "warning-escalation" ||
    beat.cameraTrajectory === "PUSH_IN_104" ||
    durFrames >= Math.round(4.0 * fps);

  if (wantsTensionCreep) {
    return [
      `${indent}<adjust-transform position="0 0" scale="1.04 1.04">`,
      `${indent}  <param name="scale" value="1.04 1.04">`,
      `${indent}    <keyframeAnimation>`,
      `${indent}      <keyframe time="${t0}" value="1 1" curve="linear"/>`,
      `${indent}      <keyframe time="${tEnd}" value="1.04 1.04" curve="linear"/>`,
      `${indent}    </keyframeAnimation>`,
      `${indent}  </param>`,
      `${indent}</adjust-transform>`,
    ];
  }

  return [];
}

/**
 * Compute global timeline ducking control points `(globalFrame, dbString)` for A3 Music Stem.
 */
function computeGlobalMusicEnvelopeDb(beats, timelineFrames, fps) {
  const baseDb = linearGainToDb(0.25); // -12.04 dB (un-ducked documentary crest)
  const duckDb = linearGainToDb(0.06); // -24.44 dB (speech-ducked bed)
  const silenceDb = "-38.00"; // drop-silence breath before peak/verdict
  const fadeFloorDb = "-60.00";

  const pts = new Map();
  const setPt = (f, db) => {
    const cf = Math.max(0, Math.min(timelineFrames, Math.round(f)));
    pts.set(cf, db);
  };

  const fadeInEnd = Math.min(timelineFrames, 24);
  const fadeOutStart = Math.max(fadeInEnd, timelineFrames - 30);

  setPt(0, fadeFloorDb);
  if (fadeInEnd > 0) {
    const firstHasSpeech = beats.length > 0 && Boolean(beats[0].spokenText?.trim());
    setPt(fadeInEnd, firstHasSpeech ? duckDb : baseDb);
  }

  const attack = 8;
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const sf = Math.max(0, Math.round(Number(b.startFrame) || 0));
    const ef = Math.min(timelineFrames, Math.max(sf + 1, Math.round(Number(b.endFrame) || sf + fps)));
    if (sf <= fadeInEnd || sf >= fadeOutStart) continue;

    const hasSpeech = Boolean(b.spokenText && String(b.spokenText).trim().length > 0);
    const targetDb =
      b.musicEnergy === "drop-silence"
        ? silenceDb
        : hasSpeech
          ? duckDb
          : baseDb;

    if (sf - attack > fadeInEnd) {
      const prevBeat = beats[i - 1];
      const prevDb =
        prevBeat?.musicEnergy === "drop-silence"
          ? silenceDb
          : prevBeat?.spokenText?.trim()
            ? duckDb
            : baseDb;
      if (prevDb !== targetDb) {
        setPt(sf - attack, prevDb);
      }
    }
    setPt(sf, targetDb);
    if (ef < fadeOutStart) {
      setPt(ef, targetDb);
    }
  }

  if (fadeOutStart < timelineFrames) {
    setPt(fadeOutStart, duckDb);
    setPt(timelineFrames, fadeFloorDb);
  }

  return Array.from(pts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([frame, db]) => ({ frame, db }));
}

function interpolateDbAtFrame(sortedPts, targetFrame) {
  if (sortedPts.length === 0) return "-24.44";
  if (targetFrame <= sortedPts[0].frame) return sortedPts[0].db;
  const last = sortedPts[sortedPts.length - 1];
  if (targetFrame >= last.frame) return last.db;

  for (let i = 0; i < sortedPts.length - 1; i++) {
    const a = sortedPts[i];
    const b = sortedPts[i + 1];
    if (targetFrame >= a.frame && targetFrame <= b.frame) {
      const span = Math.max(1, b.frame - a.frame);
      const t = (targetFrame - a.frame) / span;
      const val = Number(a.db) + (Number(b.db) - Number(a.db)) * t;
      return val.toFixed(2);
    }
  }
  return "-24.44";
}

function buildMusicLaneClipsXml(musicAssetId, musicStemName, stemDurFrames, timelineFrames, beats, fps, indent = "              ") {
  if (timelineFrames <= 0 || stemDurFrames <= 0) return { lines: [], tileCount: 0 };

  const globalPts = computeGlobalMusicEnvelopeDb(beats, timelineFrames, fps);
  const lines = [];
  let cursor = 0;
  let tileIdx = 0;

  while (cursor < timelineFrames) {
    const tileDur = Math.min(stemDurFrames, timelineFrames - cursor);
    const tileEnd = cursor + tileDur;
    const offsetAttr = toRationalTime(cursor, fps);
    const durAttr = toRationalTime(tileDur, fps);

    const localKfs = new Map();
    localKfs.set(0, `${interpolateDbAtFrame(globalPts, cursor)}dB`);
    for (const pt of globalPts) {
      if (pt.frame > cursor && pt.frame < tileEnd) {
        localKfs.set(pt.frame - cursor, `${pt.db}dB`);
      }
    }
    localKfs.set(tileDur, `${interpolateDbAtFrame(globalPts, tileEnd)}dB`);

    const sortedLocal = Array.from(localKfs.entries()).sort((a, b) => a[0] - b[0]);
    const nominalDb = `${interpolateDbAtFrame(globalPts, cursor + Math.floor(tileDur / 2))}dB`;

    tileIdx += 1;
    lines.push(
      `${indent}<asset-clip ref="${escapeXml(musicAssetId)}" lane="-2" offset="${offsetAttr}" name="${escapeXml(`${musicStemName} [Loop ${tileIdx}]`)}" start="0s" duration="${durAttr}" audioRole="music">`,
      `${indent}  <adjust-volume amount="${nominalDb}">`,
      `${indent}    <param name="amount" value="${nominalDb}">`,
      `${indent}      <keyframeAnimation>`,
      ...sortedLocal.map(
        ([localFrame, dbVal]) =>
          `${indent}        <keyframe time="${toRationalTime(localFrame, fps)}" value="${dbVal}"/>`
      ),
      `${indent}      </keyframeAnimation>`,
      `${indent}    </param>`,
      `${indent}  </adjust-volume>`,
      `${indent}</asset-clip>`
    );

    cursor += tileDur;
  }

  return { lines, tileCount: tileIdx };
}

export function exportFcpxml(opts) {
  if (!fs.existsSync(opts.planPath)) {
    throw new Error(`Director plan file not found: ${opts.planPath}`);
  }

  const rawPlan = fs.readFileSync(opts.planPath, "utf8").replace(/^\uFEFF/, "");
  const plan = JSON.parse(rawPlan);
  const fps = Math.round(Number(plan.fps) || 30);
  const rawBeats = Array.isArray(plan.beats) ? plan.beats : [];
  const planDir = path.dirname(opts.planPath);

  const maxBeatFrame = rawBeats.reduce((acc, b) => Math.max(acc, Number(b.endFrame) || 0), 0);
  const totalFrames = Math.max(1, Number(plan.totalFrames) || maxBeatFrame || fps * 10);

  const arollPath = opts.arollPath || path.join(planDir, "aroll_prepped.mp4");
  const ffprobeBin = findFfprobe();
  const arollFrames = probeMediaDurationFrames(ffprobeBin, arollPath, fps, totalFrames);
  const timelineFrames = Math.max(totalFrames, arollFrames);
  const arollAssetFrames = Math.max(timelineFrames, arollFrames);

  const personAlphaInfo = resolvePersonAlphaInfo(opts, arollPath, planDir);

  // Load overlay-manifest.json if available
  const manifestPath = path.join(opts.overlaysDir, "overlay-manifest.json");
  let manifestById = {};
  if (fs.existsSync(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      if (m && typeof m.byBeatId === "object" && m.byBeatId) {
        manifestById = m.byBeatId;
      }
    } catch {
      // ignore invalid manifest
    }
  }

  const formatDenom = fps * 100;
  const frameDurationAttr = `100/${formatDenom}s`;
  const timelineDurationAttr = toRationalTime(timelineFrames, fps);
  const arollDurationAttr = toRationalTime(arollAssetFrames, fps);

  const assetLines = [];
  const seenAssets = new Set(["r_aroll"]);
  const seenSfxAssets = new Map();

  // 1. Primary A-Roll Asset (V1 + A1 Dialogue @ -14 LUFS)
  const arollUrl = pathToFileURL(path.resolve(arollPath)).href;
  assetLines.push(
    `    <asset id="r_aroll" name="${escapeXml(path.basename(arollPath))}" start="0s" duration="${arollDurationAttr}" hasVideo="1" hasAudio="1" format="r1" audioSources="1" audioChannels="2" audioRate="48000">`,
    `      <media-rep kind="original-media" src="${escapeXml(arollUrl)}"/>`,
    `    </asset>`
  );

  // 2. Optional Alpha Presenter Matte Asset (V3 Depth Sandwich)
  let hasPersonAlphaAsset = false;
  if (personAlphaInfo.active && personAlphaInfo.path) {
    const alphaUrl = pathToFileURL(path.resolve(personAlphaInfo.path)).href;
    assetLines.push(
      `    <asset id="r_person_alpha" name="${escapeXml(path.basename(personAlphaInfo.path))}" start="0s" duration="${arollDurationAttr}" hasVideo="1" hasAudio="0" format="r1">`,
      `      <media-rep kind="original-media" src="${escapeXml(alphaUrl)}"/>`,
      `    </asset>`
    );
    seenAssets.add("r_person_alpha");
    hasPersonAlphaAsset = true;
  }

  // 3. Optional Bundled Documentary Music Stem Asset (A3 lane="-2")
  let musicStemPath = null;
  let musicStemFrames = 0;
  const musicAssetId = "r_music_bed";
  if (opts.enableMusic) {
    musicStemPath = resolveMusicStemPath(opts.musicArg, plan);
    musicStemFrames = readWavDurationFrames(musicStemPath, fps, 8.0);
    const musicDurAttr = toRationalTime(musicStemFrames, fps);
    const musicUrl = pathToFileURL(path.resolve(musicStemPath)).href;
    assetLines.push(
      `    <asset id="${musicAssetId}" name="${escapeXml(path.basename(musicStemPath))}" start="0s" duration="${musicDurAttr}" hasVideo="0" hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000">`,
      `      <media-rep kind="original-media" src="${escapeXml(musicUrl)}"/>`,
      `    </asset>`
    );
    seenAssets.add(musicAssetId);
  }

  // Normalize contiguous Spine segments from [0 .. timelineFrames]
  const sortedBeats = rawBeats
    .map((b, idx) => {
      const sf = Math.max(0, Math.round(Number(b.startFrame) || 0));
      const ef = Math.max(
        sf + 1,
        Math.round(Number(b.endFrame) || sf + Math.round((Number(b.durationSec) || 3) * fps))
      );
      return { beat: b, idx, startFrame: sf, endFrame: Math.min(timelineFrames, ef) };
    })
    .filter((item) => item.endFrame > item.startFrame)
    .sort((a, b) => a.startFrame - b.startFrame);

  const spineSegments = [];
  let cursorFrame = 0;
  for (const item of sortedBeats) {
    const segStart = Math.max(cursorFrame, item.startFrame);
    if (segStart > cursorFrame) {
      spineSegments.push({ startFrame: cursorFrame, endFrame: segStart, beat: null });
    }
    if (item.endFrame > segStart) {
      spineSegments.push({ startFrame: segStart, endFrame: item.endFrame, beat: item.beat });
      cursorFrame = item.endFrame;
    }
  }
  if (cursorFrame < timelineFrames || spineSegments.length === 0) {
    spineSegments.push({ startFrame: cursorFrame, endFrame: timelineFrames, beat: null });
  }

  let v1KeyframeCount = 0;
  let v2OverlayCount = 0;
  let v3DepthCount = 0;
  let v4GlassCount = 0;
  let a2SfxCount = 0;
  let a3MusicTileCount = 0;

  const spineXmlLines = [];

  for (let sIdx = 0; sIdx < spineSegments.length; sIdx++) {
    const seg = spineSegments[sIdx];
    const durFrames = Math.max(1, seg.endFrame - seg.startFrame);
    const startAttr = toRationalTime(seg.startFrame, fps);
    const durAttr = toRationalTime(durFrames, fps);
    const beat = seg.beat;

    const clipName = beat
      ? `${path.basename(arollPath)} [${beat.id}: ${beat.framing}]`
      : `${path.basename(arollPath)}`;

    // Child ordering inside <asset-clip> per FCPXML v1.9 DTD:
    //   1) <adjust-transform>  2) <adjust-volume>  3) connected <asset-clip lane="...">
    const transformLines = beat
      ? buildCameraTransformXml(beat, seg.startFrame, durFrames, fps, "              ")
      : [];
    if (transformLines.length > 0) v1KeyframeCount += 1;

    const connectedLines = [];

    if (beat && beat.framing !== "talking-head-full") {
      const safeId = sanitizeId(beat.id);
      const useDepthLanes = hasPersonAlphaAsset && isDepthSandwichBeat(beat);

      // V2 (lane="1"): Overlay / Cutaway / Behind-Presenter Layer
      v2OverlayCount += 1;
      const v2AssetId = `r_ov_${safeId}`;
      const v2ClipPath = resolveOverlayClipPath(
        beat,
        opts.overlaysDir,
        manifestById,
        useDepthLanes ? "behind" : ""
      );
      if (!seenAssets.has(v2AssetId)) {
        seenAssets.add(v2AssetId);
        assetLines.push(
          `    <asset id="${escapeXml(v2AssetId)}" name="${escapeXml(path.basename(v2ClipPath))}" start="0s" duration="${durAttr}" hasVideo="1" hasAudio="0" format="r1">`,
          `      <media-rep kind="original-media" src="${escapeXml(pathToFileURL(v2ClipPath).href)}"/>`,
          `    </asset>`
        );
      }
      const v2Label = useDepthLanes
        ? `${beat.id} [Behind-Presenter: ${beat.componentHint || beat.typographyMode || "Monolith"}]`
        : `${beat.id} [${beat.glassPreset || beat.componentHint || beat.framing}]`;

      connectedLines.push(
        `              <asset-clip ref="${escapeXml(v2AssetId)}" lane="1" offset="${startAttr}" name="${escapeXml(v2Label)}" start="0s" duration="${durAttr}" format="r1" tcFormat="NDF"/>`
      );

      // V3 (lane="2") + V4 (lane="3"): True Pillar #10 Depth-Sandwich Lanes
      if (useDepthLanes) {
        v3DepthCount += 1;
        const v3Transform = buildCameraTransformXml(
          beat,
          seg.startFrame,
          durFrames,
          fps,
          "                "
        );
        if (v3Transform.length > 0) {
          connectedLines.push(
            `              <asset-clip ref="r_person_alpha" lane="2" offset="${startAttr}" name="${escapeXml(`${beat.id} [Foreground Presenter Alpha]`)}" start="${startAttr}" duration="${durAttr}" format="r1" tcFormat="NDF">`,
            ...v3Transform,
            `              </asset-clip>`
          );
        } else {
          connectedLines.push(
            `              <asset-clip ref="r_person_alpha" lane="2" offset="${startAttr}" name="${escapeXml(`${beat.id} [Foreground Presenter Alpha]`)}" start="${startAttr}" duration="${durAttr}" format="r1" tcFormat="NDF"/>`
          );
        }

        const wantsForegroundGlass =
          Boolean(beat.glassPreset) ||
          Boolean(beat.glassRig) ||
          beat.depthSandwich?.foregroundGlass !== false;

        if (wantsForegroundGlass) {
          v4GlassCount += 1;
          const v4AssetId = `r_fg_${safeId}`;
          const v4ClipPath = resolveOverlayClipPath(beat, opts.overlaysDir, manifestById, "front");
          if (!seenAssets.has(v4AssetId)) {
            seenAssets.add(v4AssetId);
            assetLines.push(
              `    <asset id="${escapeXml(v4AssetId)}" name="${escapeXml(path.basename(v4ClipPath))}" start="0s" duration="${durAttr}" hasVideo="1" hasAudio="0" format="r1">`,
              `      <media-rep kind="original-media" src="${escapeXml(pathToFileURL(v4ClipPath).href)}"/>`,
              `    </asset>`
            );
          }
          connectedLines.push(
            `              <asset-clip ref="${escapeXml(v4AssetId)}" lane="3" offset="${startAttr}" name="${escapeXml(`${beat.id} [Foreground Liquid Glass: ${beat.glassRig || beat.glassPreset || "card"}]`)}" start="0s" duration="${durAttr}" format="r1" tcFormat="NDF"/>`
          );
        }
      }
    }

    // A2 (lane="-1"): Sample-accurate 96-WAV studio foley cues
    if (beat && Array.isArray(beat.sfxCues)) {
      for (const cueObj of beat.sfxCues) {
        if (!cueObj || !cueObj.cue) continue;
        const { cueId, wavPath } = resolveSfxWavPath(cueObj.cue);
        if (!cueId) continue;

        const wavDurFrames = readWavDurationFrames(wavPath, fps, 0.35);
        const wavDurAttr = toRationalTime(wavDurFrames, fps);
        let sfxAssetId = seenSfxAssets.get(cueId);
        if (!sfxAssetId) {
          sfxAssetId = `r_sfx_${sanitizeId(cueId)}`;
          seenSfxAssets.set(cueId, sfxAssetId);
          seenAssets.add(sfxAssetId);
          assetLines.push(
            `    <asset id="${escapeXml(sfxAssetId)}" name="${escapeXml(`${cueId}.wav`)}" start="0s" duration="${wavDurAttr}" hasVideo="0" hasAudio="1" audioSources="1" audioChannels="1" audioRate="48000">`,
            `      <media-rep kind="original-media" src="${escapeXml(pathToFileURL(wavPath).href)}"/>`,
            `    </asset>`
          );
        }

        const cueFrame = Math.min(
          timelineFrames - 1,
          Math.max(0, seg.startFrame + Math.round(Number(cueObj.offsetFrame) || 0))
        );
        const cueOffsetAttr = toRationalTime(cueFrame, fps);
        const vol = cueObj.volume !== undefined ? Number(cueObj.volume) : 0.7;

        a2SfxCount += 1;
        if (Number.isFinite(vol) && vol > 0 && Math.abs(vol - 1.0) > 0.02) {
          const db = linearGainToDb(vol);
          connectedLines.push(
            `              <asset-clip ref="${escapeXml(sfxAssetId)}" lane="-1" offset="${cueOffsetAttr}" name="${escapeXml(cueId)}" start="0s" duration="${wavDurAttr}" audioRole="effects">`,
            `                <adjust-volume amount="${db}dB"/>`,
            `              </asset-clip>`
          );
        } else {
          connectedLines.push(
            `              <asset-clip ref="${escapeXml(sfxAssetId)}" lane="-1" offset="${cueOffsetAttr}" name="${escapeXml(cueId)}" start="0s" duration="${wavDurAttr}" audioRole="effects"/>`
          );
        }
      }
    }

    // A3 (lane="-2"): Attach seamless looped music bed + speech-ducking keyframes to first spine clip
    if (sIdx === 0 && opts.enableMusic && musicStemPath) {
      const musicBuilt = buildMusicLaneClipsXml(
        musicAssetId,
        path.basename(musicStemPath, ".wav"),
        musicStemFrames,
        timelineFrames,
        rawBeats,
        fps,
        "              "
      );
      connectedLines.push(...musicBuilt.lines);
      a3MusicTileCount = musicBuilt.tileCount;
    }

    if (transformLines.length === 0 && connectedLines.length === 0) {
      spineXmlLines.push(
        `            <asset-clip ref="r_aroll" offset="${startAttr}" name="${escapeXml(clipName)}" start="${startAttr}" duration="${durAttr}" format="r1" tcFormat="NDF" audioRole="dialogue"/>`
      );
    } else {
      spineXmlLines.push(
        `            <asset-clip ref="r_aroll" offset="${startAttr}" name="${escapeXml(clipName)}" start="${startAttr}" duration="${durAttr}" format="r1" tcFormat="NDF" audioRole="dialogue">`,
        ...transformLines,
        ...connectedLines,
        `            </asset-clip>`
      );
    }
  }

  const projectTitle = plan.title || path.basename(opts.planPath, ".json");
  const xmlLines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!DOCTYPE fcpxml>`,
    `<fcpxml version="1.9">`,
    `  <resources>`,
    `    <format id="r1" name="FFVideoFormat1080p${fps}" frameDuration="${frameDurationAttr}" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>`,
    ...assetLines,
    `  </resources>`,
    `  <library>`,
    `    <event name="${escapeXml(projectTitle)}">`,
    `      <project name="${escapeXml(projectTitle)}">`,
    `        <sequence format="r1" duration="${timelineDurationAttr}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">`,
    `          <spine>`,
    ...spineXmlLines,
    `          </spine>`,
    `        </sequence>`,
    `      </project>`,
    `    </event>`,
    `  </library>`,
    `</fcpxml>`,
    ``,
  ];

  fs.mkdirSync(path.dirname(opts.outPath), { recursive: true });
  fs.writeFileSync(opts.outPath, xmlLines.join("\n"), "utf8");

  return {
    outPath: opts.outPath,
    timelineFrames,
    fps,
    arollPath,
    personAlphaPath: hasPersonAlphaAsset ? personAlphaInfo.path : null,
    musicStemPath,
    spineCount: spineSegments.length,
    v1KeyframeCount,
    v2OverlayCount,
    v3DepthCount,
    v4GlassCount,
    a2SfxCount,
    uniqueSfxCount: seenSfxAssets.size,
    a3MusicTileCount,
  };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const summary = exportFcpxml(opts);

  console.log(`Exported FCPXML v1.9 -> ${summary.outPath}`);
  console.log(
    `  Timeline : ${summary.timelineFrames} frames @ ${summary.fps}fps (${(summary.timelineFrames / summary.fps).toFixed(2)}s)\n` +
      `  V1/A1    : ${summary.arollPath} (${summary.spineCount} blade cuts, ${summary.v1KeyframeCount} camera-keyframed clips, -14 LUFS dialogue)\n` +
      `  V2 Clips : ${summary.v2OverlayCount} overlay/cutaway/behind-presenter beat(s)\n` +
      `  V3/V4    : ${summary.personAlphaPath ? `${summary.v3DepthCount} foreground presenter alpha clip(s) + ${summary.v4GlassCount} foreground glass clip(s)` : "Fallback V1+V2 (pass --person-alpha or --depth-sandwich for V1..V4 Depth Sandwich)"}\n` +
      `  A2 SFX   : ${summary.a2SfxCount} synced foley cue(s) (${summary.uniqueSfxCount} unique .wav files)\n` +
      `  A3 Music : ${summary.musicStemPath ? `${path.basename(summary.musicStemPath)} (${summary.a3MusicTileCount} seamless ducked loop tile(s))` : "disabled"}`
  );
}

const isEntrypoint =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isEntrypoint) {
  try {
    main();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
