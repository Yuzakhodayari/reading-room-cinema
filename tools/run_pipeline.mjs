#!/usr/bin/env node
/**
 * Pillar #11 — Master End-to-End Studio Pipeline Orchestrator (`tools/run_pipeline.mjs`)
 *
 * Orchestrates the 6-stage Reading Room Cinema production pipeline:
 *   1. A-Roll Prep & Broadcast Audio Master (`prep-aroll.mjs` + optional `master-audio.mjs` @ -14 LUFS)
 *   2. Speech Alignment (`transcribe.py` faster-whisper OR `--script-only` deterministic syllable prosody)
 *   3. Showrunner & Equalizer Compilation (`tools/ai_director.mjs` + 30/35-Gate QC & `episodes-vault.json`,
 *      with deterministic / `plan-edit.mjs` bridge fallback)
 *   4. Optional Presenter Alpha Matte (`room_object_swap.py export-person-matte` when `--depth-sandwich`)
 *   5. Parallel SHA-256 Cached Beat Rendering (`render-overlays.mjs`) &/OR Standalone Full-Episode Master
 *      MP4 (`ReadingRoomEpisodeMaster` 1080p / `ReadingRoomEpisodeMaster4K` 4K)
 *   6. Multi-Lane DaVinci Resolve FCPXML v1.9 Export (`export-fcpxml.mjs`) + `run-manifest.json`
 *
 * Usage:
 *   # Post-shoot A-roll -> DaVinci Resolve timeline + ProRes/VP9 overlays:
 *   node tools/run_pipeline.mjs raw_aroll.mp4 --name ep01 --script scripts/video_01_the_allowance.md --lut editorial-warm --cut-silence --render
 *
 *   # Pre-shoot script-only simulation (zero A-roll required):
 *   node tools/run_pipeline.mjs --script scripts/video_01_the_allowance.md --script-only --skip-render
 *
 *   # Full Depth-Sandwich + DeepSeek / Frontier AI Director + Standalone 4K MP4:
 *   node tools/run_pipeline.mjs --aroll raw_aroll.mp4 --script scripts/video_01_the_allowance.md --episode 1 --provider deepseek --depth-sandwich --standalone-mp4 --4k
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

import { segmentScriptText } from "../studio/scripts/plan-edit.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const STUDIO_DIR = path.join(REPO_ROOT, "studio");
const PROJECTS_ROOT = path.join(REPO_ROOT, "projects");

const PREP_AROLL = path.join(STUDIO_DIR, "scripts", "prep-aroll.mjs");
const MASTER_AUDIO = path.join(STUDIO_DIR, "scripts", "master-audio.mjs");
const TRANSCRIBE_PY = path.join(REPO_ROOT, "tools", "transcribe.py");
const AI_DIRECTOR = path.join(REPO_ROOT, "tools", "ai_director.mjs");
const PLAN_EDIT = path.join(STUDIO_DIR, "scripts", "plan-edit.mjs");
const ROOM_SWAP_PY = path.join(REPO_ROOT, "tools", "room_object_swap.py");
const RENDER_OVERLAYS = path.join(STUDIO_DIR, "scripts", "render-overlays.mjs");
const EXPORT_FCPXML = path.join(STUDIO_DIR, "scripts", "export-fcpxml.mjs");
const REMOTION_CLI = path.join(STUDIO_DIR, "node_modules", "@remotion", "cli", "remotion-cli.js");
const DEFAULT_VAULT_PATH = path.join(STUDIO_DIR, "episodes-vault.json");

function resolveVenvPython() {
  const winPy = path.join(REPO_ROOT, "tools", ".venv", "Scripts", "python.exe");
  if (fs.existsSync(winPy)) return winPy;
  const nixPy = path.join(REPO_ROOT, "tools", ".venv", "bin", "python");
  if (fs.existsSync(nixPy)) return nixPy;
  return process.platform === "win32" ? "python" : "python3";
}

function slugify(name) {
  return (
    String(name || "project")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "project"
  );
}

export function printUsage() {
  console.log(`Usage:
  node tools/run_pipeline.mjs <raw-aroll.mp4> [options]
  node tools/run_pipeline.mjs --aroll <raw-aroll.mp4> [--script <script.md>] [options]
  node tools/run_pipeline.mjs --script <script.md> --script-only [options]

Workspace & Input Options:
  --aroll <path>            Source camera A-roll video (or pass as first positional argument)
  --script <path>           Spoken documentary script (.md or .txt)
  --script-only             Pre-shoot simulation mode: synthesize syllable-prosody timing without A-roll
  --words <path>            Reuse an existing Whisper words.json alignment file
  --plan <path>             Reuse an existing director-plan.json (skips Stage 3 compilation)
  --name <name>             Project slug under projects/<name>/ (default: A-roll or script basename)
  --out, --out-dir <path>   Custom output workspace directory (default: projects/<name>)

Stage 1 & 2 — A-Roll Prep, -14 LUFS Mastering & Transcription:
  --lut <name-or-path>      3D .cube LUT applied in prep-aroll.mjs (e.g. editorial-warm, midnight-desk)
  --cut-silence             Trim pauses > 0.65s below -34dB with 120ms natural padding
  --master-audio            Run 2-pass linear EBU R128 mastering (-14.0 LUFS, -1.0 dBTP, LRA=7.0)
  --lufs <number>           Target integrated loudness for master-audio.mjs (default: -14.0)
  --music-duck              Mix & sidechain-duck documentary score into mastered audio stem
  --whisper-model <size>    faster-whisper model size: tiny | base | small | medium | large-v3 (default: small)
  --fps <number>            Timeline framerate (default: 30)
  --wpm <number>            Speaking rate for --script-only prosody synthesis (default: 150)
  --skip-prep               Skip prep-aroll.mjs and use input A-roll directly
  --skip-transcribe         Skip transcribe.py and reuse existing transcript/words.json

Stage 3 — Showrunner / Equalizer AI Director & 30-Episode Vault:
  --provider <name>         deepseek | openai | gemini | anthropic | ollama | pack | deterministic (default: deterministic)
  --model <model-id>        Provider model override (e.g. deepseek-reasoner, gpt-4.1, gemini-2.5-flash)
  --deterministic           Force offline <2s Equalizer compilation (zero API calls)
  --episode <1..30>         Season episode slot in studio/episodes-vault.json (default: 1)
  --strategy <STR-*>        Channel strategy preset lock (e.g. STR-GEN-EXPLAINER, STR-FISHER-ARTIFACT)
  --vault <path>            Path to episodes-vault.json (default: studio/episodes-vault.json)
  --update-vault            Persist compiled episode novelty vector back into --vault
  --legacy-planner          Use legacy studio/scripts/plan-edit.mjs instead of tools/ai_director.mjs

Stage 4, 5 & 6 — Depth-Sandwich, Parallel Remotion Render, Standalone 4K MP4 & FCPXML:
  --depth-sandwich          Extract presenter alpha matte (V3) + dual-pass V2/V4 overlays + 4-lane FCPXML
  --no-depth-sandwich       Disable Depth-Sandwich lanes
  --person-alpha <path>     Supply pre-rendered presenter alpha matte (.mov / .webm) for V3
  --render                  Render beat clips via parallel cached render-overlays.mjs
  --skip-render, --no-render Skip Remotion beat & master rendering
  --codec <prores|vp9>      Transparent overlay codec: prores (4444 .mov) | vp9 (.webm) (default: prores)
  --workers <N>             Parallel Remotion worker processes in render-overlays.mjs
  --concurrency <N>         Internal Chromium tab concurrency per Remotion worker
  --cache / --no-cache      Toggle deterministic SHA-256 beat skip cache (default: --cache)
  --limit <N>               Render at most N graphic/cutaway beats
  --standalone-mp4          Render full standalone episode MP4 (ReadingRoomEpisodeMaster)
  --4k                      Target 3840x2160 4K master composition (ReadingRoomEpisodeMaster4K)
  --music <stem-or-path>    Bundled documentary score stem for FCPXML A3 / master (e.g. 02-ledger-investigation)
  --no-music                Omit A3 documentary music lane in timeline.fcpxml
  --dry-run                 Print all planned stages & commands without executing heavy media tools
  -h, --help                Show help`);
}

export function parseArgs(argv) {
  const opts = {
    input: null,
    name: null,
    outDir: null,
    script: null,
    scriptOnly: false,
    words: null,
    plan: null,
    lut: null,
    cutSilence: false,
    masterAudio: false,
    lufs: -14.0,
    musicDuck: false,
    fps: 30,
    wpm: 150,
    whisperModel: "small",
    provider: "deterministic",
    model: null,
    episode: 1,
    strategy: null,
    vault: DEFAULT_VAULT_PATH,
    updateVault: false,
    legacyPlanner: false,
    depthSandwich: null, // null = auto
    personAlpha: null,
    render: false,
    skipRender: false,
    codec: "prores",
    workers: null,
    concurrency: null,
    cache: true,
    limit: null,
    standaloneMp4: false,
    fourK: false,
    masterComp: null,
    masterOut: null,
    music: null,
    enableMusic: true,
    skipPrep: false,
    skipTranscribe: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    } else if (arg === "--aroll" || arg === "--input") {
      opts.input = path.resolve(argv[++i]);
    } else if (arg === "--name") {
      opts.name = argv[++i];
    } else if (arg === "--out-dir" || arg === "--out") {
      opts.outDir = path.resolve(argv[++i]);
    } else if (arg === "--script") {
      opts.script = path.resolve(argv[++i]);
    } else if (arg === "--script-only") {
      opts.scriptOnly = true;
    } else if (arg === "--words") {
      opts.words = path.resolve(argv[++i]);
    } else if (arg === "--plan") {
      opts.plan = path.resolve(argv[++i]);
    } else if (arg === "--lut") {
      opts.lut = argv[++i];
    } else if (arg === "--cut-silence") {
      opts.cutSilence = true;
    } else if (arg === "--master-audio") {
      opts.masterAudio = true;
    } else if (arg === "--lufs") {
      opts.lufs = Number(argv[++i]);
      opts.masterAudio = true;
    } else if (arg === "--music-duck") {
      opts.musicDuck = true;
      opts.masterAudio = true;
    } else if (arg === "--fps") {
      opts.fps = Number(argv[++i]);
    } else if (arg === "--wpm") {
      opts.wpm = Number(argv[++i]) || 150;
    } else if (arg === "--whisper-model") {
      opts.whisperModel = argv[++i];
    } else if (arg === "--provider") {
      opts.provider = String(argv[++i] || "deterministic").toLowerCase();
    } else if (arg === "--model") {
      opts.model = argv[++i];
    } else if (arg === "--deterministic") {
      opts.provider = "deterministic";
    } else if (arg === "--episode") {
      opts.episode = Math.max(1, Number(argv[++i]) || 1);
    } else if (arg === "--strategy") {
      opts.strategy = argv[++i];
    } else if (arg === "--vault") {
      opts.vault = path.resolve(argv[++i]);
    } else if (arg === "--update-vault" || arg === "--record-vault") {
      opts.updateVault = true;
    } else if (arg === "--legacy-planner") {
      opts.legacyPlanner = true;
    } else if (arg === "--depth-sandwich") {
      opts.depthSandwich = true;
    } else if (arg === "--no-depth-sandwich") {
      opts.depthSandwich = false;
    } else if (arg === "--person-alpha") {
      opts.personAlpha = path.resolve(argv[++i]);
      if (opts.depthSandwich === null) opts.depthSandwich = true;
    } else if (arg === "--render") {
      opts.render = true;
    } else if (arg === "--skip-render" || arg === "--no-render") {
      opts.skipRender = true;
    } else if (arg === "--codec") {
      opts.codec = String(argv[++i] || "prores").toLowerCase();
    } else if (arg === "--workers") {
      opts.workers = Number(argv[++i]);
    } else if (arg === "--concurrency") {
      opts.concurrency = Number(argv[++i]);
    } else if (arg === "--cache") {
      opts.cache = true;
    } else if (arg === "--no-cache") {
      opts.cache = false;
    } else if (arg === "--limit") {
      opts.limit = Number(argv[++i]);
    } else if (arg === "--standalone-mp4" || arg === "--render-master") {
      opts.standaloneMp4 = true;
    } else if (arg === "--4k") {
      opts.fourK = true;
      opts.standaloneMp4 = true;
    } else if (arg === "--master-comp") {
      opts.masterComp = argv[++i];
      opts.standaloneMp4 = true;
    } else if (arg === "--master-out") {
      opts.masterOut = path.resolve(argv[++i]);
      opts.standaloneMp4 = true;
    } else if (arg === "--music") {
      opts.music = argv[++i];
      opts.enableMusic = true;
    } else if (arg === "--no-music") {
      opts.enableMusic = false;
    } else if (arg === "--skip-prep") {
      opts.skipPrep = true;
    } else if (arg === "--skip-transcribe") {
      opts.skipTranscribe = true;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (!arg.startsWith("-") && !opts.input) {
      const resolved = path.resolve(arg);
      if (/\.(md|txt)$/i.test(resolved) && !opts.script) {
        opts.script = resolved;
      } else {
        opts.input = resolved;
      }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (opts.scriptOnly && !opts.script && !opts.words && !opts.plan) {
    const defaultEp01 = path.join(REPO_ROOT, "scripts", "video_01_the_allowance.md");
    if (fs.existsSync(defaultEp01)) {
      opts.script = defaultEp01;
    } else {
      throw new Error("--script-only requires --script <script.md> (or --plan <director-plan.json>).");
    }
  }

  if (!opts.scriptOnly && !opts.input) {
    throw new Error(
      "Missing required A-roll video: pass <raw-aroll.mp4> / --aroll <path>, or pass --script <script.md> --script-only for pre-shoot simulation."
    );
  }

  if (!Number.isFinite(opts.fps) || opts.fps <= 0) {
    throw new Error(`Invalid --fps value: ${opts.fps}`);
  }

  return opts;
}

function formatCmd(bin, args) {
  const q = (s) => (/[\s"]/g.test(String(s)) ? `"${String(s).replace(/"/g, '\\"')}"` : String(s));
  return [q(bin), ...args.map(q)].join(" ");
}

function runStep(label, bin, args, cwd, dryRun, { allowFailure = false } = {}) {
  const t0 = performance.now();
  console.log(`\n==> ${label}`);
  console.log(`    ${formatCmd(bin, args)}`);
  if (dryRun) {
    return { status: 0, wallSec: 0, skipped: false, dryRun: true };
  }

  const res = spawnSync(bin, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });
  const wallSec = Number(((performance.now() - t0) / 1000).toFixed(2));
  if (res.error) {
    if (allowFailure) return { status: -1, wallSec, error: res.error.message };
    throw res.error;
  }
  if (res.status !== 0 && !allowFailure) {
    throw new Error(`Step "${label}" failed with exit code ${res.status}`);
  }
  return { status: res.status ?? 0, wallSec, skipped: false, dryRun: false };
}

function formatSrtTimestamp(seconds) {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hrs = Math.floor(totalMs / 3_600_000);
  const rem1 = totalMs % 3_600_000;
  const mins = Math.floor(rem1 / 60_000);
  const rem2 = rem1 % 60_000;
  const secs = Math.floor(rem2 / 1000);
  const ms = rem2 % 1000;
  const pad2 = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");
  return `${pad2(hrs)}:${pad2(mins)}:${pad2(secs)},${pad3(ms)}`;
}

/**
 * Deterministic syllable-weighted prosody synthesizer for `--script-only` pre-shoot mode.
 * Produces frame-locked `words.json` and `captions.srt` matching `transcribe.py` schema.
 */
export function synthesizeScriptProsodyTranscript(scriptPath, transcriptDir, fps = 30, wpm = 150) {
  const rawScript = fs.readFileSync(scriptPath, "utf8").replace(/^\uFEFF/, "");
  const segments = segmentScriptText(rawScript, wpm);

  const words = [];
  const whisperSegments = [];

  for (let sIdx = 0; sIdx < segments.length; sIdx++) {
    const seg = segments[sIdx];
    const text = String(seg.text || "").trim();
    if (!text) continue;

    const startSec = Number(seg.startSec || 0);
    const endSec = Math.max(startSec + 0.3, Number(seg.endSec || startSec + 2.5));
    const spanSec = endSec - startSec;
    const tokens = text.split(/\s+/).filter(Boolean);

    const weights = tokens.map((tok) => {
      const alpha = tok.replace(/[^a-zA-Z0-9]/g, "");
      const syllables = Math.max(1, Math.ceil(alpha.length / 3));
      const numBoost = /\d/.test(tok) ? 1.45 : 1.0;
      const pauseBoost = /[.!?]["']?$/.test(tok) ? 1.35 : /[,;:\u2014]$/.test(tok) ? 1.2 : 1.0;
      return syllables * numBoost * pauseBoost;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

    let cursorSec = startSec;
    const segWords = [];
    for (let wIdx = 0; wIdx < tokens.length; wIdx++) {
      const tok = tokens[wIdx];
      const wDur =
        wIdx === tokens.length - 1
          ? Math.max(0.04, endSec - cursorSec)
          : Math.max(0.04, (weights[wIdx] / totalWeight) * spanSec);
      const wStart = Number(cursorSec.toFixed(3));
      const wEnd = Number(Math.min(endSec, cursorSec + wDur).toFixed(3));
      cursorSec = wEnd;

      const wordEntry = {
        word: tok,
        startSec: wStart,
        endSec: wEnd,
        startFrame: Math.round(wStart * fps),
        endFrame: Math.max(Math.round(wStart * fps) + 1, Math.round(wEnd * fps)),
        probability: 1.0,
      };
      words.push(wordEntry);
      segWords.push(wordEntry);
    }

    whisperSegments.push({
      id: sIdx,
      startSec: Number(startSec.toFixed(3)),
      endSec: Number(endSec.toFixed(3)),
      text,
      words: segWords,
    });
  }

  const durationSec =
    whisperSegments.length > 0 ? whisperSegments[whisperSegments.length - 1].endSec : 0;

  const wordsPayload = {
    source: path.basename(scriptPath),
    alignmentMode: "SYNTHETIC_SYLLABLE_PROSODY",
    language: "en",
    fps,
    wpm,
    durationSec,
    text: whisperSegments.map((s) => s.text).join(" "),
    words,
    segments: whisperSegments,
  };

  // Build readable <=42-char / <=7-word SubRip (.srt) cues
  const srtCues = [];
  let cueBuf = [];
  let cueChars = 0;
  const flushCue = () => {
    if (cueBuf.length === 0) return;
    srtCues.push({
      startSec: cueBuf[0].startSec,
      endSec: cueBuf[cueBuf.length - 1].endSec,
      text: cueBuf.map((x) => x.word).join(" "),
    });
    cueBuf = [];
    cueChars = 0;
  };

  for (const w of words) {
    const projected = cueChars + (cueBuf.length > 0 ? 1 : 0) + w.word.length;
    const prevEnded =
      cueBuf.length > 0 && /[.!?]["']?$/.test(cueBuf[cueBuf.length - 1].word);
    if (cueBuf.length >= 7 || projected > 42 || prevEnded) {
      flushCue();
    }
    cueBuf.push(w);
    cueChars += (cueBuf.length > 1 ? 1 : 0) + w.word.length;
  }
  flushCue();

  const srtContent =
    srtCues
      .map(
        (c, idx) =>
          `${idx + 1}\n${formatSrtTimestamp(c.startSec)} --> ${formatSrtTimestamp(c.endSec)}\n${c.text}\n`
      )
      .join("\n") + "\n";

  fs.mkdirSync(transcriptDir, { recursive: true });
  const wordsPath = path.join(transcriptDir, "words.json");
  const srtPath = path.join(transcriptDir, "captions.srt");
  fs.writeFileSync(wordsPath, JSON.stringify(wordsPayload, null, 2) + "\n", "utf8");
  fs.writeFileSync(srtPath, srtContent, "utf8");

  return {
    wordsPath,
    srtPath,
    wordCount: words.length,
    segmentCount: whisperSegments.length,
    durationSec,
  };
}

function readJsonSafe(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

export function runPipeline(opts) {
  const tPipelineStart = performance.now();

  if (!opts.scriptOnly && !opts.dryRun && !fs.existsSync(opts.input)) {
    throw new Error(`Input A-roll file not found: ${opts.input}`);
  }
  if (opts.script && !opts.dryRun && !fs.existsSync(opts.script)) {
    throw new Error(`Input script file not found: ${opts.script}`);
  }

  const baseNameSource = opts.name
    ? opts.name
    : opts.input
      ? path.parse(opts.input).name
      : opts.script
        ? path.parse(opts.script).name
        : `episode_${String(opts.episode).padStart(2, "0")}`;

  const projectName = slugify(baseNameSource);
  const projectDir = opts.outDir || path.join(PROJECTS_ROOT, projectName);
  const transcriptDir = path.join(projectDir, "transcript");
  const wordsJson = path.join(transcriptDir, "words.json");
  const captionsSrt = path.join(transcriptDir, "captions.srt");
  const directorPlan = path.join(projectDir, "director-plan.json");
  const overlaysDir = path.join(projectDir, "overlays");
  const fcpxmlPath = path.join(projectDir, "timeline.fcpxml");
  const loudnessQcPath = path.join(projectDir, "loudness-qc.json");
  const runManifestPath = path.join(projectDir, "run-manifest.json");

  let activeAroll = opts.scriptOnly
    ? path.join(projectDir, "aroll_placeholder.mp4")
    : opts.skipPrep
      ? opts.input
      : path.join(projectDir, "aroll_prepped.mp4");

  console.log(`=== Reading Room Cinema Pipeline ===`);
  console.log(`  Project Workspace : ${projectDir}`);
  console.log(
    `  Execution Mode    : ${opts.scriptOnly ? "PRE-SHOOT SCRIPT SIMULATION (--script-only)" : "LIVE A-ROLL PRODUCTION"}${opts.dryRun ? " [DRY RUN]" : ""}`
  );
  console.log(
    `  Episode & AI Mode : Episode ${opts.episode} | Provider=${opts.legacyPlanner ? "legacy-plan-edit" : opts.provider}${opts.strategy ? ` | Strategy=${opts.strategy}` : ""}`
  );

  if (!opts.dryRun) {
    fs.mkdirSync(projectDir, { recursive: true });
    fs.mkdirSync(transcriptDir, { recursive: true });
    fs.mkdirSync(overlaysDir, { recursive: true });
  }

  const stageResults = {};

  // ==========================================================================
  // STAGE 1/6: A-Roll Prep (`prep-aroll.mjs`) + Optional `-14 LUFS` Mastering
  // ==========================================================================
  if (opts.scriptOnly) {
    console.log(`\n==> Stage 1/6: Skipped A-roll prep (--script-only pre-shoot simulation)`);
    stageResults.arollPrep = { skipped: true, reason: "script-only" };
  } else if (opts.skipPrep) {
    console.log(`\n==> Stage 1/6: Skipped (--skip-prep), using raw A-roll ${activeAroll}`);
    stageResults.arollPrep = { skipped: true, reason: "skip-prep", output: activeAroll };
  } else {
    const prepArgs = [
      PREP_AROLL,
      opts.input,
      "--out",
      activeAroll,
      "--fps",
      String(opts.fps),
    ];
    if (opts.lut) prepArgs.push("--lut", opts.lut);
    if (opts.cutSilence) prepArgs.push("--cut-silence");

    const prepRes = runStep(
      "Stage 1/6: Prepare A-roll CFR + LUT + -14 LUFS (prep-aroll.mjs)",
      process.execPath,
      prepArgs,
      STUDIO_DIR,
      opts.dryRun
    );
    stageResults.arollPrep = { ...prepRes, output: activeAroll };

    if (opts.masterAudio) {
      const masteredAroll = path.join(projectDir, "aroll_mastered.mp4");
      const masterArgs = [
        MASTER_AUDIO,
        activeAroll,
        "--out",
        masteredAroll,
        "--lufs",
        String(opts.lufs),
        "--report",
        loudnessQcPath,
      ];
      if (opts.musicDuck && opts.music) {
        masterArgs.push("--music", opts.music);
      }
      const mRes = runStep(
        "Stage 1b/6: Broadcast EBU R128 2-Pass Master (master-audio.mjs)",
        process.execPath,
        masterArgs,
        STUDIO_DIR,
        opts.dryRun
      );
      activeAroll = masteredAroll;
      stageResults.audioMaster = { ...mRes, output: masteredAroll, qcReport: loudnessQcPath };
    }
  }

  // ==========================================================================
  // STAGE 2/6: Whisper Word Transcription OR `--script-only` Syllable Prosody
  // ==========================================================================
  let usedWhisperWords = false;
  if (opts.words) {
    if (!opts.dryRun && path.resolve(opts.words) !== path.resolve(wordsJson)) {
      fs.copyFileSync(opts.words, wordsJson);
    }
    usedWhisperWords = true;
    console.log(`\n==> Stage 2/6: Using provided Whisper alignment -> ${wordsJson}`);
    stageResults.transcription = { skipped: true, mode: "provided-words", wordsJson };
  } else if (opts.scriptOnly) {
    console.log(`\n==> Stage 2/6: Synthesize deterministic syllable prosody (${opts.wpm} WPM)`);
    if (opts.dryRun) {
      console.log(`    [dry-run] synthesizeScriptProsodyTranscript(${opts.script}) -> ${wordsJson}, ${captionsSrt}`);
      stageResults.transcription = { dryRun: true, mode: "synthetic-syllable-prosody", wordsJson, captionsSrt };
    } else if (opts.script) {
      const synth = synthesizeScriptProsodyTranscript(opts.script, transcriptDir, opts.fps, opts.wpm);
      console.log(
        `    Generated ${synth.wordCount} timed words across ${synth.segmentCount} sentences (${synth.durationSec.toFixed(1)}s) -> ${synth.wordsPath}`
      );
      stageResults.transcription = {
        skipped: false,
        mode: "synthetic-syllable-prosody",
        wordsJson: synth.wordsPath,
        captionsSrt: synth.srtPath,
        wordCount: synth.wordCount,
        durationSec: synth.durationSec,
      };
    }
  } else if (opts.skipTranscribe) {
    usedWhisperWords = fs.existsSync(wordsJson);
    console.log(`\n==> Stage 2/6: Skipped (--skip-transcribe), reusing ${usedWhisperWords ? wordsJson : opts.script}`);
    stageResults.transcription = { skipped: true, mode: "reused", wordsJson };
  } else {
    const pyBin = resolveVenvPython();
    const trArgs = [
      TRANSCRIBE_PY,
      activeAroll,
      "--out-dir",
      transcriptDir,
      "--model",
      opts.whisperModel,
      "--fps",
      String(opts.fps),
    ];
    const trRes = runStep(
      "Stage 2/6: Transcribe word-level timestamps (transcribe.py)",
      pyBin,
      trArgs,
      REPO_ROOT,
      opts.dryRun
    );
    usedWhisperWords = true;
    stageResults.transcription = { ...trRes, mode: "faster-whisper", wordsJson, captionsSrt };
  }

  // ==========================================================================
  // STAGE 3/6: Showrunner / Equalizer Compilation (`ai_director.mjs` + QC)
  // ==========================================================================
  if (opts.plan) {
    if (!opts.dryRun && path.resolve(opts.plan) !== path.resolve(directorPlan)) {
      fs.copyFileSync(opts.plan, directorPlan);
    }
    console.log(`\n==> Stage 3/6: Reusing provided edit plan -> ${directorPlan}`);
    stageResults.director = { skipped: true, reusedPlan: opts.plan, output: directorPlan };
  } else if (!opts.legacyPlanner && fs.existsSync(AI_DIRECTOR)) {
    const buildDirectorArgs = (providerName) => {
      const args = [
        AI_DIRECTOR,
        "--provider",
        providerName,
        "--episode",
        String(opts.episode),
        "--vault",
        opts.vault,
        "--fps",
        String(opts.fps),
        "--wpm",
        String(opts.wpm),
        "--title",
        opts.name || projectName,
        "--out",
        directorPlan,
      ];
      if (opts.model && providerName !== "deterministic") {
        args.push("--model", opts.model);
      }
      if (opts.strategy) {
        args.push("--strategy", opts.strategy);
      }
      if (opts.updateVault) {
        args.push("--record-vault", opts.vault);
      }
      if (opts.depthSandwich === false) {
        args.push("--no-depth-sandwich");
      } else if (opts.depthSandwich === true) {
        args.push("--depth-sandwich");
      }
      if (usedWhisperWords && (opts.dryRun || fs.existsSync(wordsJson))) {
        args.push("--words", wordsJson);
      }
      if (opts.script) {
        args.push("--script", opts.script);
      }
      return args;
    };

    const primaryArgs = buildDirectorArgs(opts.provider);
    const allowLiveFallback = opts.provider !== "deterministic" && opts.provider !== "pack";
    const dirRes = runStep(
      `Stage 3/6: Compile Equalizer Showrunner Plan & 30-Gate QC (ai_director.mjs --provider ${opts.provider})`,
      process.execPath,
      primaryArgs,
      REPO_ROOT,
      opts.dryRun,
      { allowFailure: allowLiveFallback }
    );

    if (dirRes.status !== 0 && allowLiveFallback) {
      console.warn(
        `[warn] Live provider "${opts.provider}" failed; auto-healing via deterministic Equalizer compiler...`
      );
      const fallbackRes = runStep(
        "Stage 3b/6: Deterministic Equalizer Auto-Heal Fallback (ai_director.mjs --deterministic)",
        process.execPath,
        buildDirectorArgs("deterministic"),
        REPO_ROOT,
        opts.dryRun
      );
      stageResults.director = {
        ...fallbackRes,
        engine: "ai_director",
        provider: "deterministic-fallback",
        output: directorPlan,
      };
    } else {
      stageResults.director = {
        ...dirRes,
        engine: "ai_director",
        provider: opts.provider,
        output: directorPlan,
      };
    }
  } else {
    const planInput =
      usedWhisperWords && (opts.dryRun || fs.existsSync(wordsJson))
        ? wordsJson
        : opts.script || wordsJson;
    const planArgs = [
      PLAN_EDIT,
      planInput,
      "--out",
      directorPlan,
      "--title",
      projectName,
      "--fps",
      String(opts.fps),
    ];
    const legacyRes = runStep(
      "Stage 3/6: Plan editorial beats (plan-edit.mjs)",
      process.execPath,
      planArgs,
      STUDIO_DIR,
      opts.dryRun
    );
    stageResults.director = { ...legacyRes, engine: "plan-edit", output: directorPlan };
  }

  const compiledPlan = readJsonSafe(directorPlan);

  // ==========================================================================
  // STAGE 4/6: Optional Presenter Alpha Matte (`room_object_swap.py export-person-matte`)
  // ==========================================================================
  let personAlphaPath = opts.personAlpha || null;
  if (opts.depthSandwich === true) {
    if (personAlphaPath) {
      console.log(`\n==> Stage 4/6: Reusing provided presenter alpha matte -> ${personAlphaPath}`);
      stageResults.personMatte = { skipped: true, output: personAlphaPath };
    } else if (opts.scriptOnly) {
      console.log(
        `\n==> Stage 4/6: Skipped live presenter matte extraction (--script-only mode; Depth-Sandwich V2/V4 layers remain active)`
      );
      stageResults.personMatte = { skipped: true, reason: "script-only" };
    } else {
      const pyBin = resolveVenvPython();
      const matteCodec = opts.codec === "vp9" ? "webm" : "prores";
      const matteExt = matteCodec === "webm" ? ".webm" : ".mov";
      personAlphaPath = path.join(projectDir, `aroll_person_alpha${matteExt}`);
      const matteArgs = [
        ROOM_SWAP_PY,
        "export-person-matte",
        activeAroll,
        "--out",
        personAlphaPath,
        "--codec",
        matteCodec,
      ];
      const matteRes = runStep(
        "Stage 4/6: Extract RGBA Presenter Matte for V3 Depth Sandwich (room_object_swap.py)",
        pyBin,
        matteArgs,
        REPO_ROOT,
        opts.dryRun
      );
      stageResults.personMatte = { ...matteRes, output: personAlphaPath, codec: matteCodec };
    }
  } else {
    console.log(`\n==> Stage 4/6: Presenter alpha matte skipped (pass --depth-sandwich to extract V3 matte)`);
    stageResults.personMatte = { skipped: true };
  }

  // ==========================================================================
  // STAGE 5/6: Parallel Cached Beat Rendering &/OR Standalone 4K/1080p Master
  // ==========================================================================
  let standaloneMasterPath = null;
  if (opts.skipRender || (!opts.render && !opts.standaloneMp4)) {
    const skipNote = opts.skipRender
      ? "--skip-render"
      : "pass --render for NLE overlays or --standalone-mp4 [--4k] for full episode MP4";
    console.log(`\n==> Stage 5/6: Remotion rendering skipped (${skipNote})`);
    stageResults.render = { skipped: true, reason: skipNote };
  } else {
    stageResults.render = {};

    if (opts.render) {
      const renderArgs = [
        RENDER_OVERLAYS,
        directorPlan,
        "--out-dir",
        overlaysDir,
        "--codec",
        opts.codec,
        opts.cache ? "--cache" : "--no-cache",
      ];
      if (opts.workers) renderArgs.push("--workers", String(opts.workers));
      if (opts.concurrency) renderArgs.push("--concurrency", String(opts.concurrency));
      if (opts.limit) renderArgs.push("--limit", String(opts.limit));
      if (opts.depthSandwich === true) renderArgs.push("--depth-sandwich");
      if (opts.depthSandwich === false) renderArgs.push("--no-depth-sandwich");
      if (personAlphaPath) renderArgs.push("--person-alpha", personAlphaPath);

      const ovRes = runStep(
        "Stage 5a/6: Parallel SHA-256 Cached Remotion Beat Render (render-overlays.mjs)",
        process.execPath,
        renderArgs,
        STUDIO_DIR,
        opts.dryRun
      );
      stageResults.render.overlays = {
        ...ovRes,
        overlaysDir,
        manifestPath: path.join(overlaysDir, "overlay-manifest.json"),
      };
    }

    if (opts.standaloneMp4) {
      const masterCompId =
        opts.masterComp ||
        (opts.fourK ? "ReadingRoomEpisodeMaster4K" : "ReadingRoomEpisodeMaster");
      const resTag = opts.fourK ? "4k" : "1080p";
      standaloneMasterPath =
        opts.masterOut || path.join(projectDir, `${projectName}_master_${resTag}.mp4`);
      const masterPropsPath = path.join(projectDir, ".master-episode.props.json");
      const bundleDir = path.join(STUDIO_DIR, "out", ".bundle");

      const masterPropsPayload = {
        plan: compiledPlan || undefined,
        planPath: directorPlan,
        cameraSrc: !opts.scriptOnly ? activeAroll : undefined,
        presenterAlphaSrc: personAlphaPath || undefined,
        musicStem: opts.music || compiledPlan?.musicStem || "02-ledger-investigation",
        renderAudio: true,
        resolution: resTag,
      };

      if (!opts.dryRun) {
        fs.writeFileSync(
          masterPropsPath,
          JSON.stringify(masterPropsPayload, null, 2) + "\n",
          "utf8"
        );
        if (!opts.render || !fs.existsSync(path.join(bundleDir, "index.html"))) {
          runStep(
            "Stage 5b/6: Bundle Remotion Studio for Standalone Master",
            process.execPath,
            [REMOTION_CLI, "bundle", "src/index.ts", "--out-dir", bundleDir, "--quiet"],
            STUDIO_DIR,
            opts.dryRun
          );
        }
      }

      const masterRenderArgs = [
        REMOTION_CLI,
        "render",
        bundleDir,
        masterCompId,
        standaloneMasterPath,
        `--props=${masterPropsPath}`,
        "--codec=h264",
        "--crf=16",
        "--pixel-format=yuv420p",
      ];
      if (opts.concurrency) {
        masterRenderArgs.push(`--concurrency=${opts.concurrency}`);
      }

      const masterRes = runStep(
        `Stage 5b/6: Render Standalone Episode Master (${masterCompId} -> ${path.basename(standaloneMasterPath)})`,
        process.execPath,
        masterRenderArgs,
        STUDIO_DIR,
        opts.dryRun
      );

      if (opts.masterAudio) {
        const loudMasterOut = standaloneMasterPath.replace(/\.mp4$/i, ".lufs14.mp4");
        runStep(
          "Stage 5c/6: Master Standalone Episode MP4 to -14.0 LUFS (master-audio.mjs)",
          process.execPath,
          [
            MASTER_AUDIO,
            standaloneMasterPath,
            "--out",
            loudMasterOut,
            "--lufs",
            String(opts.lufs),
            "--report",
            loudnessQcPath,
          ],
          STUDIO_DIR,
          opts.dryRun
        );
        standaloneMasterPath = loudMasterOut;
      }

      stageResults.render.standaloneMaster = {
        ...masterRes,
        compositionId: masterCompId,
        resolution: opts.fourK ? "3840x2160" : "1920x1080",
        output: standaloneMasterPath,
      };
    }
  }

  // ==========================================================================
  // STAGE 6/6: Export Multi-Lane DaVinci Resolve FCPXML v1.9 + Run Manifest
  // ==========================================================================
  const fcpxmlArgs = [
    EXPORT_FCPXML,
    directorPlan,
    "--aroll",
    activeAroll,
    "--overlays-dir",
    overlaysDir,
    "--out",
    fcpxmlPath,
  ];
  if (personAlphaPath) fcpxmlArgs.push("--person-alpha", personAlphaPath);
  if (opts.depthSandwich === true) fcpxmlArgs.push("--depth-sandwich");
  if (opts.depthSandwich === false) fcpxmlArgs.push("--no-depth-sandwich");
  if (!opts.enableMusic) {
    fcpxmlArgs.push("--no-music");
  } else if (opts.music) {
    fcpxmlArgs.push("--music", opts.music);
  }

  const fcpxmlRes = runStep(
    "Stage 6/6: Export DaVinci Resolve FCPXML v1.9 Timeline (export-fcpxml.mjs)",
    process.execPath,
    fcpxmlArgs,
    STUDIO_DIR,
    opts.dryRun
  );
  stageResults.fcpxml = { ...fcpxmlRes, output: fcpxmlPath };

  const totalWallSec = Number(((performance.now() - tPipelineStart) / 1000).toFixed(2));
  const overlayManifest = readJsonSafe(path.join(overlaysDir, "overlay-manifest.json"));

  const runManifest = {
    schemaVersion: "2.0.0",
    generatedAt: new Date().toISOString(),
    projectName,
    projectDir,
    mode: opts.scriptOnly ? "script-only" : "aroll-production",
    dryRun: opts.dryRun,
    totalWallSec,
    episode: {
      episodeNumber: opts.episode,
      episodeCode: compiledPlan?.episodeCode || `S01E${String(opts.episode).padStart(2, "0")}`,
      strategyId: compiledPlan?.strategyId || opts.strategy || null,
      lutId: opts.lut || compiledPlan?.lutId || null,
      musicStem: opts.enableMusic
        ? opts.music || compiledPlan?.musicStem || "02-ledger-investigation"
        : null,
    },
    qualityAudit: compiledPlan?.qualityGate || compiledPlan?.audit || null,
    timelineSummary: compiledPlan
      ? {
          fps: compiledPlan.fps || opts.fps,
          totalFrames: compiledPlan.totalFrames || 0,
          durationSec: Number(((compiledPlan.totalFrames || 0) / (compiledPlan.fps || opts.fps)).toFixed(2)),
          totalBeats: Array.isArray(compiledPlan.beats) ? compiledPlan.beats.length : 0,
        }
      : null,
    overlayRenderStats: overlayManifest?.stats || null,
    artifacts: {
      arollInput: opts.input,
      arollActive: !opts.scriptOnly ? activeAroll : null,
      personAlphaMatte: personAlphaPath,
      scriptPath: opts.script,
      wordsJson: fs.existsSync(wordsJson) || opts.dryRun ? wordsJson : null,
      captionsSrt: fs.existsSync(captionsSrt) || opts.dryRun ? captionsSrt : null,
      directorPlan,
      overlaysDir,
      overlayManifest: overlayManifest ? path.join(overlaysDir, "overlay-manifest.json") : null,
      standaloneMasterMp4: standaloneMasterPath,
      fcpxmlTimeline: fcpxmlPath,
      loudnessQcReport: fs.existsSync(loudnessQcPath) ? loudnessQcPath : null,
    },
    stages: stageResults,
  };

  if (!opts.dryRun) {
    fs.writeFileSync(runManifestPath, JSON.stringify(runManifest, null, 2) + "\n", "utf8");
  }

  console.log(`\n${opts.dryRun ? "[dry-run] " : ""}Pipeline complete in ${totalWallSec}s!`);
  console.log(`  Director Plan   : ${directorPlan}`);
  console.log(`  DaVinci FCPXML  : ${fcpxmlPath}`);
  if (standaloneMasterPath) {
    console.log(`  Standalone MP4  : ${standaloneMasterPath}`);
  }
  if (!opts.dryRun) {
    console.log(`  Run Manifest    : ${runManifestPath}`);
  }

  return runManifest;
}

const isEntrypoint =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isEntrypoint) {
  try {
    runPipeline(parseArgs(process.argv.slice(2)));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
