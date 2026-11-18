#!/usr/bin/env node
/**
 * Pillar #6 — Broadcast Loudness Master & Speech-Sidechain Ducking Mixer (`studio/scripts/master-audio.mjs`)
 *
 * Implements Two-Pass Linear EBU R128 / ITU-R BS.1770-4 loudness normalization via FFmpeg:
 *   - Target Integrated Loudness : -14.0 LUFS
 *   - Maximum True Peak          : -1.0 dBTP
 *   - Target Loudness Range      : 7.0 LU (LRA=7.0)
 *   - Output Delivery Specs      : 48kHz 320kbps AAC (for .mp4/.mov/.m4a/.aac) or 48kHz PCM WAV (.wav)
 *
 * Optional Multi-Stem Speech-Sidechain Mixer:
 *   - Loops a bundled documentary music stem (`--music 02-ledger-investigation` or path)
 *   - Ducks music smoothly beneath speech using FFmpeg `sidechaincompress`
 *   - Optionally mixes a foley stem (`--sfx <stem.wav>`) prior to 2-pass linear mastering
 *
 * Usage:
 *   node scripts/master-audio.mjs <input.wav|input.mp4> --out <master.wav|master.mp4>
 *     [--music 02-ledger-investigation] [--sfx foley.wav] [--lufs -14.0] [--tp -1.0] [--lra 7.0] [--dry-run]
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STUDIO_DIR = path.resolve(__dirname, "..");
const MUSIC_DIR = path.join(STUDIO_DIR, "public", "music");

function printUsage() {
  console.log(`Usage:
  node scripts/master-audio.mjs <input.wav_or_video.mp4> [options]

Broadcast Loudness Options:
  --out <path>           Output file path (.wav, .m4a, .aac, .mp4, .mov; default: <input>.mastered.<ext>)
  --lufs <number>        Target integrated loudness in LUFS (default: -14.0)
  --tp <number>          Maximum True Peak ceiling in dBTP (default: -1.0)
  --lra <number>         Target Loudness Range LRA in LU (default: 7.0)
  --sample-rate <hz>     Output sample rate in Hz (default: 48000)
  --bitrate <rate>       AAC audio bitrate for MP4/MOV/M4A/AAC outputs (default: 320k)
  --bit-depth <16|24>    PCM bit depth for WAV outputs (default: 24)
  --no-rumble-filter     Disable 24Hz subsonic high-pass filter

Optional Speech-Sidechain Ducking Mixer:
  --music <stem-or-path> Bundled music stem ID (e.g. 02-ledger-investigation) or audio file path
  --music-gain <0..2>    Un-ducked music linear gain before sidechain ducking (default: 0.26)
  --duck-ratio <number>  Speech sidechain compression ratio on music bed (default: 6.0)
  --sfx <path>           Optional foley stem WAV/MP3 mixed into master bus
  --sfx-gain <0..2>      Foley stem linear gain (default: 0.85)
  --report <json-path>   Write JSON loudness QC certificate to <json-path>
  --dry-run              Print Pass 1 & Pass 2 FFmpeg filtergraphs & args without running FFmpeg
  -h, --help             Show help`);
}

export function parseArgs(argv) {
  const opts = {
    input: null,
    out: null,
    lufs: -14.0,
    tp: -1.0,
    lra: 7.0,
    sampleRate: 48000,
    bitrate: "320k",
    bitDepth: 24,
    rumbleFilter: true,
    music: null,
    musicGain: 0.26,
    duckRatio: 6.0,
    sfx: null,
    sfxGain: 0.85,
    report: null,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    } else if (arg === "--out") {
      opts.out = path.resolve(argv[++i]);
    } else if (arg === "--lufs") {
      opts.lufs = Number(argv[++i]);
    } else if (arg === "--tp") {
      opts.tp = Number(argv[++i]);
    } else if (arg === "--lra") {
      opts.lra = Number(argv[++i]);
    } else if (arg === "--sample-rate") {
      opts.sampleRate = Math.round(Number(argv[++i]));
    } else if (arg === "--bitrate") {
      opts.bitrate = String(argv[++i]);
    } else if (arg === "--bit-depth") {
      opts.bitDepth = Number(argv[++i]) === 16 ? 16 : 24;
    } else if (arg === "--no-rumble-filter") {
      opts.rumbleFilter = false;
    } else if (arg === "--music") {
      opts.music = argv[++i];
    } else if (arg === "--music-gain") {
      opts.musicGain = Number(argv[++i]);
    } else if (arg === "--duck-ratio") {
      opts.duckRatio = Math.max(1.5, Number(argv[++i]));
    } else if (arg === "--sfx") {
      opts.sfx = path.resolve(argv[++i]);
    } else if (arg === "--sfx-gain") {
      opts.sfxGain = Number(argv[++i]);
    } else if (arg === "--report") {
      opts.report = path.resolve(argv[++i]);
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (!arg.startsWith("-") && !opts.input) {
      opts.input = path.resolve(arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!opts.input) {
    throw new Error("Missing required positional argument: <input.wav_or_video.mp4>");
  }
  if (!Number.isFinite(opts.lufs) || opts.lufs < -36 || opts.lufs > -5) {
    throw new Error(`Invalid --lufs target (${opts.lufs}). Expected range [-36, -5].`);
  }
  if (!Number.isFinite(opts.tp) || opts.tp < -9 || opts.tp > 0) {
    throw new Error(`Invalid --tp ceiling (${opts.tp}). Expected range [-9.0, 0.0].`);
  }
  if (!Number.isFinite(opts.lra) || opts.lra < 1 || opts.lra > 20) {
    throw new Error(`Invalid --lra value (${opts.lra}). Expected range [1.0, 20.0].`);
  }
  return opts;
}

function findExecutableOnPath(name) {
  const locator = process.platform === "win32" ? "where.exe" : "which";
  const res = spawnSync(locator, [name], { encoding: "utf8" });
  if (res.status === 0 && res.stdout) {
    const first = res.stdout.split(/\r?\n/).find((l) => l.trim().length > 0);
    if (first && fs.existsSync(first.trim())) return first.trim();
  }
  return null;
}

function findInDirRecursive(rootDir, targetFile, maxDepth = 4) {
  if (!rootDir || !fs.existsSync(rootDir) || maxDepth < 0) return null;
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(rootDir, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === targetFile.toLowerCase()) {
      return full;
    }
  }
  if (maxDepth === 0) return null;
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findInDirRecursive(path.join(rootDir, entry.name), targetFile, maxDepth - 1);
      if (found) return found;
    }
  }
  return null;
}

export function resolveMediaBinaries() {
  const resolveOne = (envKey, exeName) => {
    if (process.env[envKey] && fs.existsSync(process.env[envKey])) {
      return process.env[envKey];
    }
    const onPath = findExecutableOnPath(exeName);
    if (onPath) return onPath;
    if (process.platform === "win32" && process.env.LOCALAPPDATA) {
      const wingetPkgs = path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages");
      const found = findInDirRecursive(wingetPkgs, `${exeName}.exe`, 4);
      if (found) return found;
    }
    throw new Error(
      `Could not locate ${exeName}. Install via WinGet (Gyan.FFmpeg), add to PATH, or set ${envKey}.`
    );
  };
  return {
    ffmpeg: resolveOne("FFMPEG_PATH", "ffmpeg"),
    ffprobe: resolveOne("FFPROBE_PATH", "ffprobe"),
  };
}

function runBin(bin, args, { allowFailure = false } = {}) {
  const res = spawnSync(bin, args, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (res.error) throw res.error;
  if (!allowFailure && res.status !== 0) {
    throw new Error(
      `Command failed (${res.status}): ${path.basename(bin)} ${args.join(" ")}\n${res.stderr}`
    );
  }
  return res;
}

function resolveMusicPath(musicArg) {
  if (!musicArg) return null;
  const candidates = [
    path.resolve(musicArg),
    path.join(MUSIC_DIR, musicArg),
    path.join(MUSIC_DIR, `${musicArg.replace(/\.wav$/i, "")}.wav`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  throw new Error(`Music stem not found: "${musicArg}" (checked ${MUSIC_DIR})`);
}

function probeMediaInfo(ffprobe, inputPath) {
  const res = runBin(ffprobe, [
    "-v",
    "error",
    "-show_format",
    "-show_streams",
    "-of",
    "json",
    inputPath,
  ]);
  const info = JSON.parse(res.stdout || "{}");
  const videoStream = info.streams?.find((s) => s.codec_type === "video") || null;
  const audioStream = info.streams?.find((s) => s.codec_type === "audio") || null;
  const durationSec = Number(
    info.format?.duration || audioStream?.duration || videoStream?.duration || 0
  );
  return {
    hasVideo: Boolean(videoStream),
    hasAudio: Boolean(audioStream),
    durationSec,
    channels: Number(audioStream?.channels || 2),
    sampleRate: Number(audioStream?.sample_rate || 48000),
  };
}

export function parseLoudnormJson(stderrText) {
  const matches = String(stderrText || "").match(/\{\s*"input_i"\s*:[\s\S]*?\}/g);
  if (!matches || matches.length === 0) return null;
  try {
    return JSON.parse(matches[matches.length - 1]);
  } catch {
    return null;
  }
}

function buildInputArgsAndMixGraph(opts, musicPath, durationSec) {
  const inputArgs = ["-i", opts.input];
  const filterChains = [];
  let nextIdx = 1;
  let musicIdx = -1;
  let sfxIdx = -1;

  if (musicPath) {
    inputArgs.push("-stream_loop", "-1", "-i", musicPath);
    musicIdx = nextIdx++;
  }
  if (opts.sfx) {
    inputArgs.push("-i", opts.sfx);
    sfxIdx = nextIdx++;
  }

  const sr = opts.sampleRate;
  const hp = opts.rumbleFilter ? "highpass=f=24:poles=2," : "";
  const safeDur = Math.max(0.5, Number(durationSec) || 10);
  const fadeOutStart = Math.max(0, Number((safeDur - 1.0).toFixed(3)));

  if (musicIdx === -1 && sfxIdx === -1) {
    filterChains.push(
      `[0:a]${hp}aformat=sample_fmts=fltp:sample_rates=${sr}:channel_layouts=stereo[pre_ln]`
    );
    return { inputArgs, preMixChain: filterChains.join(";") };
  }

  if (musicIdx !== -1) {
    filterChains.push(
      `[0:a]${hp}aformat=sample_fmts=fltp:sample_rates=${sr}:channel_layouts=stereo,asplit=2[dlg_main][dlg_sc]`
    );
    filterChains.push(
      `[${musicIdx}:a]atrim=0:${safeDur.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_fmts=fltp:sample_rates=${sr}:channel_layouts=stereo,volume=${opts.musicGain.toFixed(3)},afade=t=in:st=0:d=0.8,afade=t=out:st=${fadeOutStart}:d=1.0[mus_raw]`
    );
    filterChains.push(
      `[mus_raw][dlg_sc]sidechaincompress=threshold=0.018:ratio=${opts.duckRatio.toFixed(1)}:attack=35:release=320:makeup=1[mus_ducked]`
    );
  } else {
    filterChains.push(
      `[0:a]${hp}aformat=sample_fmts=fltp:sample_rates=${sr}:channel_layouts=stereo[dlg_main]`
    );
  }

  if (sfxIdx !== -1) {
    filterChains.push(
      `[${sfxIdx}:a]atrim=0:${safeDur.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_fmts=fltp:sample_rates=${sr}:channel_layouts=stereo,volume=${opts.sfxGain.toFixed(3)}[sfx_bus]`
    );
  }

  const mixInputs = ["[dlg_main]"];
  if (musicIdx !== -1) mixInputs.push("[mus_ducked]");
  if (sfxIdx !== -1) mixInputs.push("[sfx_bus]");

  // Use normalize=0 in amix so dialogue loudness isn't scaled down by 1/N before EBU R128 pass
  filterChains.push(
    `${mixInputs.join("")}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=0:normalize=0[pre_ln]`
  );

  return { inputArgs, preMixChain: filterChains.join(";") };
}

function buildOutputCodecArgs(outPath, hasVideoIn, opts) {
  const ext = path.extname(outPath).toLowerCase();
  const isVideoOut = ext === ".mp4" || ext === ".mov" || ext === ".mkv";
  const isWavOut = ext === ".wav";

  const args = [];
  if (isVideoOut && hasVideoIn) {
    args.push("-map", "0:v:0", "-map", "[aout]", "-c:v", "copy");
  } else {
    args.push("-map", "[aout]", "-vn");
  }

  if (isWavOut) {
    args.push(
      "-c:a",
      opts.bitDepth === 16 ? "pcm_s16le" : "pcm_s24le",
      "-ar",
      String(opts.sampleRate)
    );
  } else {
    args.push(
      "-c:a",
      "aac",
      "-b:a",
      opts.bitrate,
      "-ar",
      String(opts.sampleRate)
    );
    if (ext === ".mp4" || ext === ".m4a" || ext === ".mov") {
      args.push("-movflags", "+faststart");
    }
  }
  return args;
}

export function masterAudio(opts) {
  const parsedIn = path.parse(opts.input);
  const defaultExt = [".mp4", ".mov", ".mkv", ".m4a", ".aac", ".wav"].includes(
    parsedIn.ext.toLowerCase()
  )
    ? parsedIn.ext
    : ".wav";
  const outPath =
    opts.out || path.join(parsedIn.dir, `${parsedIn.name}.mastered${defaultExt}`);

  const musicPath = opts.music ? resolveMusicPath(opts.music) : null;
  if (opts.sfx && !opts.dryRun && !fs.existsSync(opts.sfx)) {
    throw new Error(`SFX stem file not found: ${opts.sfx}`);
  }
  if (!opts.dryRun && !fs.existsSync(opts.input)) {
    throw new Error(`Input file not found: ${opts.input}`);
  }

  const { ffmpeg, ffprobe } = resolveMediaBinaries();
  const media = fs.existsSync(opts.input)
    ? probeMediaInfo(ffprobe, opts.input)
    : { hasVideo: false, hasAudio: true, durationSec: 12.0, channels: 2, sampleRate: 48000 };

  if (!media.hasAudio) {
    throw new Error(`Input media contains no audio stream: ${opts.input}`);
  }

  const { inputArgs, preMixChain } = buildInputArgsAndMixGraph(
    opts,
    musicPath,
    media.durationSec
  );

  const lnTarget = `I=${opts.lufs.toFixed(1)}:TP=${opts.tp.toFixed(1)}:LRA=${opts.lra.toFixed(1)}`;
  const pass1Graph = `${preMixChain};[pre_ln]loudnorm=${lnTarget}:print_format=json[anull]`;
  const pass1Args = [
    "-hide_banner",
    ...inputArgs,
    "-filter_complex",
    pass1Graph,
    "-map",
    "[anull]",
    "-vn",
    "-f",
    "null",
    "-",
  ];

  const codecArgs = buildOutputCodecArgs(outPath, media.hasVideo, opts);

  if (opts.dryRun) {
    const samplePass2Graph = `${preMixChain};[pre_ln]loudnorm=${lnTarget}:measured_I=-18.50:measured_TP=-3.20:measured_LRA=6.80:measured_thresh=-28.90:offset=0.20:linear=true:print_format=json,aresample=${opts.sampleRate}[aout]`;
    console.log("=== Broadcast Loudness Master (Dry Run) ===");
    console.log(`  FFmpeg      : ${ffmpeg}`);
    console.log(`  Input       : ${opts.input} (${media.durationSec.toFixed(2)}s)`);
    console.log(`  Music Duck  : ${musicPath ? `${path.basename(musicPath)} (ratio=${opts.duckRatio}:1)` : "none"}`);
    console.log(`  Target Spec : ${opts.lufs.toFixed(1)} LUFS | ${opts.tp.toFixed(1)} dBTP | LRA=${opts.lra.toFixed(1)} | ${opts.sampleRate}Hz`);
    console.log(`  Output      : ${outPath}`);
    console.log(`  Pass 1 Graph: ${pass1Graph}`);
    console.log(`  Pass 2 Graph: ${samplePass2Graph}`);
    console.log(`  Output Args : ${codecArgs.join(" ")}`);
    return { dryRun: true, outPath, pass1Args, codecArgs };
  }

  console.log(`Pass 1/2: Measuring ITU-R BS.1770-4 / EBU R128 loudness (${lnTarget})...`);
  const pass1Res = runBin(ffmpeg, pass1Args);
  const measured = parseLoudnormJson(pass1Res.stderr);

  const measuredI = measured ? Number(measured.input_i) : NaN;
  let pass2LnFilter;
  if (measured && Number.isFinite(measuredI) && measuredI > -70) {
    console.log(
      `  Measured  : I=${measured.input_i} LUFS | TP=${measured.input_tp} dBTP | LRA=${measured.input_lra} LU | Offset=${measured.target_offset} dB`
    );
    pass2LnFilter = [
      `loudnorm=${lnTarget}`,
      `measured_I=${measured.input_i}`,
      `measured_TP=${measured.input_tp}`,
      `measured_LRA=${measured.input_lra}`,
      `measured_thresh=${measured.input_thresh}`,
      `offset=${measured.target_offset}`,
      "linear=true",
      "print_format=json",
    ].join(":");
  } else {
    console.warn("[warn] Input is near-silent or unmeasurable; falling back to single-pass dynamic loudnorm.");
    pass2LnFilter = `loudnorm=${lnTarget}:print_format=json`;
  }

  const pass2Graph = `${preMixChain};[pre_ln]${pass2LnFilter},aresample=${opts.sampleRate}[aout]`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  // Write filtergraph to temp script if long to avoid Windows command-line limits
  const useScript = pass2Graph.length > 3000;
  const tmpScript = useScript
    ? path.join(os.tmpdir(), `master-audio-${Date.now()}.txt`)
    : null;
  if (tmpScript) fs.writeFileSync(tmpScript, pass2Graph, "utf8");

  let pass2Stats = null;
  try {
    const pass2Args = [
      "-y",
      "-hide_banner",
      ...inputArgs,
      ...(tmpScript ? ["-filter_complex_script", tmpScript] : ["-filter_complex", pass2Graph]),
      ...codecArgs,
      outPath,
    ];
    console.log(`Pass 2/2: Mastering linear broadcast audio -> ${outPath}`);
    const pass2Res = runBin(ffmpeg, pass2Args);
    pass2Stats = parseLoudnormJson(pass2Res.stderr);
  } finally {
    if (tmpScript) fs.rmSync(tmpScript, { force: true });
  }

  const outI = pass2Stats ? Number(pass2Stats.output_i) : NaN;
  const outTp = pass2Stats ? Number(pass2Stats.output_tp) : NaN;
  const qcPassed =
    !Number.isFinite(outI) ||
    (Math.abs(outI - opts.lufs) <= 1.2 && (!Number.isFinite(outTp) || outTp <= opts.tp + 0.3));

  const report = {
    generatedAt: new Date().toISOString(),
    input: opts.input,
    output: outPath,
    musicStem: musicPath,
    sfxStem: opts.sfx,
    targets: { lufs: opts.lufs, truePeakDbtp: opts.tp, lra: opts.lra, sampleRate: opts.sampleRate },
    pass1Measured: measured,
    pass2Output: pass2Stats,
    qcPassed,
  };

  if (opts.report) {
    fs.mkdirSync(path.dirname(opts.report), { recursive: true });
    fs.writeFileSync(opts.report, JSON.stringify(report, null, 2) + "\n", "utf8");
  }

  console.log(`Broadcast Master Complete -> ${outPath}`);
  if (pass2Stats) {
    console.log(
      `  Output QC : I=${pass2Stats.output_i} LUFS (target ${opts.lufs.toFixed(1)}) | TP=${pass2Stats.output_tp} dBTP (ceil ${opts.tp.toFixed(1)}) | LRA=${pass2Stats.output_lra} LU | Mode=${pass2Stats.normalization_type || "linear"} | PASS=${qcPassed}`
    );
  }
  return report;
}

const isEntrypoint =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isEntrypoint) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    masterAudio(opts);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
