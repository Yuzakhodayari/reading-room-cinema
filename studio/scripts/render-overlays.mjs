#!/usr/bin/env node
/**
 * Pillar #11 — Parallel Chunked Remotion Renderer & Deterministic SHA-256 Beat Cache
 * (`studio/scripts/render-overlays.mjs`)
 *
 * Capabilities:
 *   1. Deterministic SHA-256 Beat Caching (`--cache` default on, `--no-cache` to force):
 *      Hashes studio/src tree + canonicalized beat JSON + codec/pass parameters so unchanged
 *      beats skip re-rendering in <5ms during iterative script or timeline edits.
 *   2. Parallel Worker-Chunked Rendering (`--workers <N>`, `--concurrency <C>`):
 *      Pre-bundles `src/index.ts` once, partitions cache-miss jobs across N parallel Remotion
 *      worker processes, and persists `.beat-cache.json` atomically after every clip completes.
 *   3. Multi-Codec + Pillar #10 Depth-Sandwich Dual-Pass Alpha Stems:
 *      - Full-frame `page` cutaways -> H.264 `.mp4` (CRF 14)
 *      - Smoked-navy glass overlays -> ProRes 4444 `.mov` (`yuva444p10le`) or VP9 `.webm` (`yuva420p`)
 *      - Depth-Sandwich beats (`--depth-sandwich` or auto-detected presenter matte) ->
 *          Pass V2 (`<beatId>_behind.mov|.webm`, `depthMode: "behind-only-alpha"`)
 *          Pass V4 (`<beatId>_front.mov|.webm`,  `depthMode: "front-only-alpha"`)
 *
 * Usage:
 *   node scripts/render-overlays.mjs <director-plan.json> [--out-dir out/overlays]
 *     [--codec prores|vp9] [--workers 2] [--concurrency 4] [--depth-sandwich]
 *     [--cache|--no-cache] [--limit N] [--beats beat-001,beat-004] [--dry-run]
 */

import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STUDIO_DIR = path.resolve(__dirname, "..");
const SRC_DIR = path.join(STUDIO_DIR, "src");
const REMOTION_CLI = path.join(
  STUDIO_DIR,
  "node_modules",
  "@remotion",
  "cli",
  "remotion-cli.js"
);
const DEFAULT_BUNDLE_DIR = path.join(STUDIO_DIR, "out", ".bundle");
const CACHE_SCHEMA_VERSION = "2.0.0";

function defaultWorkerCount() {
  const cpuCount = Array.isArray(os.cpus()) ? os.cpus().length : 4;
  return Math.max(1, Math.min(3, Math.floor(cpuCount / 4) || 1));
}

export function printUsage() {
  console.log(`Usage:
  node scripts/render-overlays.mjs <director-plan.json> [options]
  node scripts/render-overlays.mjs --plan <director-plan.json> [options]

Options:
  --plan <path>          Input director-plan.json / edit-plan.json (or pass as first positional arg)
  --out-dir <dir>        Output directory for clips, .beat-cache.json & overlay-manifest.json (default: out/overlays)
  --codec <codec>        Transparent overlay codec: prores | vp9 | h264 (default: prores)
  --workers <N>          Parallel Remotion worker processes across beats (default: ${defaultWorkerCount()})
  --concurrency <N>      Internal Chromium tab concurrency per Remotion worker
  --cache                Enable deterministic SHA-256 beat-hash skip cache (default: enabled)
  --no-cache             Force re-render of all selected beats, ignoring SHA-256 cache
  --cache-file <path>    Custom beat cache JSON path (default: <out-dir>/.beat-cache.json)
  --depth-sandwich       Enable Pillar #10 dual-pass renders (V2 behind-only-alpha + V4 front-only-alpha)
  --no-depth-sandwich    Disable dual-pass Depth-Sandwich stems (render single combined overlay per beat)
  --person-alpha <path>  Optional presenter alpha matte hint (activates --depth-sandwich automatically)
  --limit <N>            Render at most N non-talking-head beats
  --beats <id1,id2,...>  Render only specific comma-separated beat IDs
  --bundle-dir <dir>     Custom Remotion Webpack bundle path (default: out/.bundle)
  --reuse-bundle         Reuse existing bundle in --bundle-dir if index.html exists
  --no-audio             Mute embedded SFX inside rendered beat clips (FCPXML uses Lane A2 WAVs)
  --dry-run              Print SHA-256 cache audit, worker chunks & Remotion CLI args without rendering
  -h, --help             Show help`);
}

export function parseArgs(argv) {
  const opts = {
    planPath: null,
    outDir: path.join(STUDIO_DIR, "out", "overlays"),
    codec: "prores",
    workers: defaultWorkerCount(),
    concurrency: null,
    cache: true,
    cacheFile: null,
    depthSandwich: null, // null = auto-detect from person-alpha matte or plan flag
    personAlphaPath: null,
    limit: null,
    beatFilter: null,
    bundleDir: DEFAULT_BUNDLE_DIR,
    reuseBundle: false,
    renderAudio: true,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    } else if (arg === "--plan") {
      opts.planPath = path.resolve(argv[++i]);
    } else if (arg === "--out-dir" || arg === "--out") {
      opts.outDir = path.resolve(argv[++i]);
    } else if (arg === "--codec") {
      const val = String(argv[++i] || "").toLowerCase();
      if (val !== "prores" && val !== "vp9" && val !== "h264") {
        throw new Error(`Invalid --codec "${val}". Supported values: prores, vp9, h264`);
      }
      opts.codec = val;
    } else if (arg === "--workers") {
      const w = Number(argv[++i]);
      if (!Number.isInteger(w) || w < 1 || w > 32) {
        throw new Error(`Invalid --workers value "${w}". Expected integer in [1, 32].`);
      }
      opts.workers = w;
    } else if (arg === "--concurrency") {
      const c = Number(argv[++i]);
      if (!Number.isInteger(c) || c < 1 || c > 64) {
        throw new Error(`Invalid --concurrency value "${c}". Expected integer in [1, 64].`);
      }
      opts.concurrency = c;
    } else if (arg === "--cache") {
      opts.cache = true;
    } else if (arg === "--no-cache") {
      opts.cache = false;
    } else if (arg === "--cache-file") {
      opts.cacheFile = path.resolve(argv[++i]);
    } else if (arg === "--depth-sandwich") {
      opts.depthSandwich = true;
    } else if (arg === "--no-depth-sandwich") {
      opts.depthSandwich = false;
    } else if (arg === "--person-alpha") {
      opts.personAlphaPath = path.resolve(argv[++i]);
    } else if (arg === "--limit") {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n <= 0) {
        throw new Error(`Invalid --limit value: ${n}`);
      }
      opts.limit = n;
    } else if (arg === "--beat" || arg === "--beats") {
      const raw = String(argv[++i] || "");
      const ids = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        opts.beatFilter = new Set([...(opts.beatFilter || []), ...ids]);
      }
    } else if (arg === "--bundle-dir") {
      opts.bundleDir = path.resolve(argv[++i]);
    } else if (arg === "--reuse-bundle") {
      opts.reuseBundle = true;
    } else if (arg === "--no-audio" || arg === "--no-render-audio") {
      opts.renderAudio = false;
    } else if (arg === "--render-audio") {
      opts.renderAudio = true;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (!arg.startsWith("-") && !opts.planPath) {
      opts.planPath = path.resolve(arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!opts.planPath) {
    throw new Error("Missing required input: pass <director-plan.json> or --plan <path>");
  }
  return opts;
}

function sanitizeId(raw) {
  return String(raw || "beat").replace(/[^a-zA-Z0-9._-]+/g, "_");
}

/**
 * Canonical recursive JSON stringifier with sorted object keys for 100% stable SHA-256 hashing.
 */
export function canonicalizeJson(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeJson(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalizeJson(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(String(value));
}

/**
 * Compute deterministic SHA-256 over all source files in `studio/src/` so edits to any TSX/TS
 * style or component automatically invalidate stale cached beat clips.
 */
export function computeSourceTreeHash(srcRoot = SRC_DIR) {
  const hash = crypto.createHash("sha256");
  hash.update(`cache-schema:${CACHE_SCHEMA_VERSION}\n`);

  if (!fs.existsSync(srcRoot)) {
    return hash.digest("hex");
  }

  const files = [];
  const stack = [srcRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.isFile() && /\.(tsx?|css|json)$/i.test(ent.name)) {
        files.push(full);
      }
    }
  }

  files.sort((a, b) => a.localeCompare(b));
  for (const filePath of files) {
    const rel = path.relative(srcRoot, filePath).replace(/\\/g, "/");
    hash.update(`file:${rel}\n`);
    hash.update(fs.readFileSync(filePath));
    hash.update("\n");
  }
  return hash.digest("hex");
}

export function computeBeatRenderHash({
  sourceTreeSha256,
  compId,
  fps,
  durationFrames,
  codecName,
  codecArgs,
  pass,
  payload,
}) {
  const canonical = canonicalizeJson({
    cacheSchemaVersion: CACHE_SCHEMA_VERSION,
    sourceTreeSha256,
    compId,
    fps,
    durationFrames,
    codecName,
    codecArgs,
    pass,
    payload,
  });
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function isDepthSandwichBeat(beat) {
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

function wantsForegroundGlassPass(beat) {
  if (!beat) return false;
  if (beat.depthSandwich && typeof beat.depthSandwich === "object") {
    if (beat.depthSandwich.foregroundGlass === false) return false;
    if (beat.depthSandwich.foregroundGlass === true) return true;
  }
  return Boolean(beat.glassPreset || beat.glassRig);
}

function resolveDepthSandwichActive(opts, plan) {
  if (opts.depthSandwich === false) return false;
  if (opts.depthSandwich === true) return true;
  if (opts.personAlphaPath) return true;
  if (plan?.depthSandwichDualPass === true) return true;

  const planDir = path.dirname(opts.planPath);
  const parentOutDir = path.dirname(opts.outDir);
  const candidateFiles = ["aroll_person_alpha.mov", "aroll_person_alpha.webm"];
  for (const dir of [planDir, parentOutDir]) {
    for (const name of candidateFiles) {
      if (fs.existsSync(path.join(dir, name))) {
        return true;
      }
    }
  }
  return false;
}

function resolveAlphaCodecSpec(codecOpt) {
  if (codecOpt === "vp9") {
    return {
      ext: ".webm",
      codecName: "vp9",
      codecArgs: ["--codec=vp9", "--image-format=png", "--pixel-format=yuva420p"],
    };
  }
  if (codecOpt === "h264") {
    return {
      ext: ".mp4",
      codecName: "h264",
      codecArgs: ["--codec=h264", "--crf=14"],
    };
  }
  return {
    ext: ".mov",
    codecName: "prores",
    codecArgs: [
      "--codec=prores",
      "--prores-profile=4444",
      "--image-format=png",
      "--pixel-format=yuva444p10le",
    ],
  };
}

function resolveRemotionRenderArgs(bundleDir, compId, outPath, propsPath, codecArgs, concurrency) {
  const args = [
    REMOTION_CLI,
    "render",
    bundleDir,
    compId,
    outPath,
    `--props=${propsPath}`,
    ...codecArgs,
  ];
  if (concurrency) {
    args.push(`--concurrency=${concurrency}`);
  }
  return args;
}

function formatCmdForLog(bin, args) {
  const q = (s) => (/[\s"]/g.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s);
  return [q(bin), ...args.map(q)].join(" ");
}

function runRemotionSync(args, label) {
  const res = spawnSync(process.execPath, args, {
    cwd: STUDIO_DIR,
    stdio: "inherit",
    shell: false,
  });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    throw new Error(`${label} failed (exit ${res.status})`);
  }
}

function runRemotionAsync(args, label) {
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    const child = spawn(process.execPath, args, {
      cwd: STUDIO_DIR,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      const wallSec = Number(((performance.now() - t0) / 1000).toFixed(2));
      if (code !== 0) {
        const tail = (stderr || stdout).trim().split(/\r?\n/).slice(-18).join("\n");
        reject(new Error(`${label} failed (exit ${code}):\n${tail}`));
        return;
      }
      resolve({ wallSec, stdout, stderr });
    });
  });
}

function loadBeatCache(cacheFilePath) {
  if (!fs.existsSync(cacheFilePath)) {
    return { schemaVersion: CACHE_SCHEMA_VERSION, entries: {} };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
    if (
      parsed &&
      parsed.schemaVersion === CACHE_SCHEMA_VERSION &&
      parsed.entries &&
      typeof parsed.entries === "object"
    ) {
      return parsed;
    }
  } catch {
    // Ignore corrupted cache file and rebuild cleanly
  }
  return { schemaVersion: CACHE_SCHEMA_VERSION, entries: {} };
}

function saveBeatCacheAtomic(cacheFilePath, cacheState) {
  const tmpPath = `${cacheFilePath}.tmp.${process.pid}`;
  const body =
    JSON.stringify(
      {
        schemaVersion: CACHE_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        entries: cacheState.entries,
      },
      null,
      2
    ) + "\n";
  fs.writeFileSync(tmpPath, body, "utf8");
  fs.renameSync(tmpPath, cacheFilePath);
}

function buildRenderJobsForBeat({ beat, fps, opts, depthSandwichActive, propsDir, sourceTreeSha256 }) {
  const safeId = sanitizeId(beat.id);
  const isFullscreen = beat.framing === "fullscreen-cutaway";
  const durationFrames = Math.max(
    1,
    (beat.endFrame ?? 0) - (beat.startFrame ?? 0) ||
      Math.round((beat.durationSec || 5) * fps)
  );

  // Dual-pass Pillar #10 Depth-Sandwich stems (V2 behind-only-alpha + V4 front-only-alpha)
  if (!isFullscreen && depthSandwichActive && isDepthSandwichBeat(beat)) {
    const alphaSpec = resolveAlphaCodecSpec(opts.codec);
    const jobs = [];

    const behindStem = `${safeId}_behind`;
    const behindFile = `${behindStem}${alphaSpec.ext}`;
    const behindOutPath = path.join(opts.outDir, behindFile);
    const behindPropsPath = path.join(propsDir, `${behindStem}.props.json`);
    const behindBeat = {
      ...beat,
      layering: "behind-presenter",
      depthSandwich: {
        ...(typeof beat.depthSandwich === "object" && beat.depthSandwich ? beat.depthSandwich : {}),
        enabled: true,
        mode: "behind-only-alpha",
        renderPass: "behind-only-alpha",
      },
    };
    const behindPayload = {
      beat: behindBeat,
      previewMode: "transparent",
      depthMode: "behind-only-alpha",
      renderAudio: false,
    };
    const behindSha = computeBeatRenderHash({
      sourceTreeSha256,
      compId: "DirectorBeat",
      fps,
      durationFrames,
      codecName: alphaSpec.codecName,
      codecArgs: alphaSpec.codecArgs,
      pass: "behind-only-alpha",
      payload: behindPayload,
    });

    jobs.push({
      beat,
      beatId: beat.id,
      jobKey: `${beat.id}:behind`,
      aliasPrimaryBeatId: true,
      pass: "behind-only-alpha",
      laneHint: "V2",
      durationFrames,
      previewMode: "transparent",
      depthMode: "behind-only-alpha",
      codecName: alphaSpec.codecName,
      codecArgs: alphaSpec.codecArgs,
      fileName: behindFile,
      outClipPath: behindOutPath,
      propsPath: behindPropsPath,
      payload: behindPayload,
      sha256: behindSha,
    });

    if (wantsForegroundGlassPass(beat)) {
      const frontStem = `${safeId}_front`;
      const frontFile = `${frontStem}${alphaSpec.ext}`;
      const frontOutPath = path.join(opts.outDir, frontFile);
      const frontPropsPath = path.join(propsDir, `${frontStem}.props.json`);
      const frontBeat = {
        ...beat,
        layering: "behind-presenter",
        depthSandwich: {
          ...(typeof beat.depthSandwich === "object" && beat.depthSandwich ? beat.depthSandwich : {}),
          enabled: true,
          mode: "front-only-alpha",
          renderPass: "front-only-alpha",
        },
      };
      const frontPayload = {
        beat: frontBeat,
        previewMode: "transparent",
        depthMode: "front-only-alpha",
        renderAudio: false,
      };
      const frontSha = computeBeatRenderHash({
        sourceTreeSha256,
        compId: "DirectorBeat",
        fps,
        durationFrames,
        codecName: alphaSpec.codecName,
        codecArgs: alphaSpec.codecArgs,
        pass: "front-only-alpha",
        payload: frontPayload,
      });

      jobs.push({
        beat,
        beatId: beat.id,
        jobKey: `${beat.id}:front`,
        aliasPrimaryBeatId: false,
        pass: "front-only-alpha",
        laneHint: "V4",
        durationFrames,
        previewMode: "transparent",
        depthMode: "front-only-alpha",
        codecName: alphaSpec.codecName,
        codecArgs: alphaSpec.codecArgs,
        fileName: frontFile,
        outClipPath: frontOutPath,
        propsPath: frontPropsPath,
        payload: frontPayload,
        sha256: frontSha,
      });
    }

    return jobs;
  }

  // Standard single-pass clip: full-frame Page cutaway (.mp4 H.264) or transparent glass overlay (.mov/.webm)
  const previewMode = isFullscreen ? "light-editorial" : "transparent";
  const spec = isFullscreen
    ? { ext: ".mp4", codecName: "h264", codecArgs: ["--codec=h264", "--crf=14"] }
    : resolveAlphaCodecSpec(opts.codec);

  const fileName = `${safeId}${spec.ext}`;
  const outClipPath = path.join(opts.outDir, fileName);
  const propsPath = path.join(propsDir, `${safeId}.props.json`);
  const payload = {
    beat,
    previewMode,
    renderAudio: opts.renderAudio,
  };
  const sha256 = computeBeatRenderHash({
    sourceTreeSha256,
    compId: "DirectorBeat",
    fps,
    durationFrames,
    codecName: spec.codecName,
    codecArgs: spec.codecArgs,
    pass: "single",
    payload,
  });

  return [
    {
      beat,
      beatId: beat.id,
      jobKey: beat.id,
      aliasPrimaryBeatId: true,
      pass: "single",
      laneHint: "V2",
      durationFrames,
      previewMode,
      depthMode: null,
      codecName: spec.codecName,
      codecArgs: spec.codecArgs,
      fileName,
      outClipPath,
      propsPath,
      payload,
      sha256,
    },
  ];
}

export async function renderOverlaysBatch(opts) {
  const tStart = performance.now();

  if (!fs.existsSync(opts.planPath)) {
    throw new Error(`Director plan file not found: ${opts.planPath}`);
  }
  if (!fs.existsSync(REMOTION_CLI)) {
    throw new Error(`Remotion CLI script not found: ${REMOTION_CLI}`);
  }

  const rawJson = fs.readFileSync(opts.planPath, "utf8").replace(/^\uFEFF/, "");
  const plan = JSON.parse(rawJson);
  const fps = Math.round(Number(plan.fps) || 30);
  const allBeats = Array.isArray(plan.beats) ? plan.beats : [];

  let renderBeats = allBeats.filter((b) => b.framing !== "talking-head-full");
  if (opts.beatFilter && opts.beatFilter.size > 0) {
    renderBeats = renderBeats.filter((b) => opts.beatFilter.has(b.id));
  }
  const totalMatchingBeats = renderBeats.length;
  if (opts.limit) {
    renderBeats = renderBeats.slice(0, opts.limit);
  }

  const depthSandwichActive = resolveDepthSandwichActive(opts, plan);
  const sourceTreeSha256 = computeSourceTreeHash(SRC_DIR);
  const propsDir = path.join(opts.outDir, ".props");
  const cacheFilePath = opts.cacheFile || path.join(opts.outDir, ".beat-cache.json");
  const cacheState = loadBeatCache(cacheFilePath);

  const jobs = [];
  for (const beat of renderBeats) {
    const beatJobs = buildRenderJobsForBeat({
      beat,
      fps,
      opts,
      depthSandwichActive,
      propsDir,
      sourceTreeSha256,
    });
    for (const job of beatJobs) {
      const cachedEntry = cacheState.entries[job.jobKey];
      const fileExistsAndNonEmpty =
        fs.existsSync(job.outClipPath) && fs.statSync(job.outClipPath).size > 1024;
      const isCacheHit =
        Boolean(opts.cache) &&
        fileExistsAndNonEmpty &&
        cachedEntry?.sha256 === job.sha256;

      job.cached = isCacheHit;
      job.cliArgs = resolveRemotionRenderArgs(
        opts.bundleDir,
        "DirectorBeat",
        job.outClipPath,
        job.propsPath,
        job.codecArgs,
        opts.concurrency
      );
      jobs.push(job);
    }
  }

  const cacheHits = jobs.filter((j) => j.cached);
  const cacheMisses = jobs.filter((j) => !j.cached);
  const activeWorkers = Math.max(1, Math.min(opts.workers, Math.max(1, cacheMisses.length)));

  console.log(
    `Plan  : "${plan.title || path.basename(opts.planPath)}" (${allBeats.length} total beats, ` +
      `${totalMatchingBeats} graphic/cutaway beats, selected ${renderBeats.length} -> ${jobs.length} render clip job(s))`
  );
  console.log(
    `Config: out=${opts.outDir} | codec=${opts.codec} | depthSandwich=${depthSandwichActive} | ` +
      `workers=${activeWorkers} | cache=${opts.cache ? `ON (${cacheHits.length} hit, ${cacheMisses.length} miss)` : "OFF"} | ` +
      `srcHash=${sourceTreeSha256.slice(0, 12)}`
  );

  const bundleIndexHtml = path.join(opts.bundleDir, "index.html");
  const canReuseBundle = opts.reuseBundle && fs.existsSync(bundleIndexHtml);
  const bundleArgs = [
    REMOTION_CLI,
    "bundle",
    "src/index.ts",
    "--out-dir",
    opts.bundleDir,
    "--quiet",
  ];

  if (!opts.dryRun) {
    fs.mkdirSync(opts.outDir, { recursive: true });
    fs.mkdirSync(propsDir, { recursive: true });
    if (cacheMisses.length > 0) {
      if (canReuseBundle) {
        console.log(`Reusing existing Remotion bundle -> ${opts.bundleDir}`);
      } else {
        fs.mkdirSync(path.dirname(opts.bundleDir), { recursive: true });
        console.log(`Pre-bundling src/index.ts -> ${opts.bundleDir}...`);
        runRemotionSync(bundleArgs, "Remotion pre-bundle");
      }
    } else if (jobs.length > 0) {
      console.log("All selected beat clips matched SHA-256 cache; skipping Webpack bundle & Remotion workers.");
    }
  } else {
    console.log(`[dry-run] Pre-bundle: ${formatCmdForLog(process.execPath, bundleArgs)}`);
  }

  if (opts.dryRun) {
    jobs.forEach((job, idx) => {
      const workerSlot = (idx % activeWorkers) + 1;
      const statusTag = job.cached ? "CACHE-HIT" : `WORKER-${workerSlot}/${activeWorkers}`;
      console.log(
        `[dry-run][${statusTag}] ${job.jobKey} (${job.beat.framing}, pass=${job.pass}, ${job.durationFrames}f, sha256=${job.sha256.slice(0, 10)}) -> ${job.fileName}`
      );
      if (!job.cached) {
        console.log(`          ${formatCmdForLog(process.execPath, job.cliArgs)}`);
      }
    });
  } else {
    for (const hit of cacheHits) {
      console.log(
        `[cache-hit] ${hit.jobKey} (${hit.fileName}, sha256=${hit.sha256.slice(0, 10)}) — skipped re-render`
      );
    }

    if (cacheMisses.length > 0) {
      // Write all props JSON files up front before worker pool starts
      for (const job of cacheMisses) {
        fs.writeFileSync(job.propsPath, JSON.stringify(job.payload, null, 2) + "\n", "utf8");
      }

      if (activeWorkers === 1) {
        for (let i = 0; i < cacheMisses.length; i++) {
          const job = cacheMisses[i];
          console.log(
            `[1/1] (${i + 1}/${cacheMisses.length}) Rendering ${job.jobKey} (${job.beat.framing}, pass=${job.pass}, ${job.durationFrames}f) -> ${job.fileName}...`
          );
          const tClip = performance.now();
          runRemotionSync(job.cliArgs, `Remotion render for "${job.jobKey}"`);
          job.renderWallSec = Number(((performance.now() - tClip) / 1000).toFixed(2));
          cacheState.entries[job.jobKey] = {
            sha256: job.sha256,
            fileName: job.fileName,
            codec: job.codecName,
            pass: job.pass,
            durationFrames: job.durationFrames,
            renderedAt: new Date().toISOString(),
          };
          saveBeatCacheAtomic(cacheFilePath, cacheState);
        }
      } else {
        // Parallel chunked / work-stealing worker pool across `activeWorkers` processes
        let cursor = 0;
        let completed = 0;
        const workerLoop = async (workerId) => {
          while (cursor < cacheMisses.length) {
            const idx = cursor++;
            const job = cacheMisses[idx];
            console.log(
              `[worker ${workerId}/${activeWorkers}] (${idx + 1}/${cacheMisses.length}) Starting ${job.jobKey} (${job.codecName}, pass=${job.pass}, ${job.durationFrames}f) -> ${job.fileName}`
            );
            const { wallSec } = await runRemotionAsync(
              job.cliArgs,
              `Worker ${workerId} render for "${job.jobKey}"`
            );
            job.renderWallSec = wallSec;
            completed += 1;
            cacheState.entries[job.jobKey] = {
              sha256: job.sha256,
              fileName: job.fileName,
              codec: job.codecName,
              pass: job.pass,
              durationFrames: job.durationFrames,
              renderedAt: new Date().toISOString(),
            };
            saveBeatCacheAtomic(cacheFilePath, cacheState);
            console.log(
              `[worker ${workerId}/${activeWorkers}] (${completed}/${cacheMisses.length}) Finished ${job.fileName} in ${wallSec}s`
            );
          }
        };

        await Promise.all(
          Array.from({ length: activeWorkers }, (_, wIdx) => workerLoop(wIdx + 1))
        );
      }
    }
  }

  const clips = [];
  const byBeatId = {};

  for (const job of jobs) {
    const beat = job.beat;
    clips.push({
      beatId: beat.id,
      jobKey: job.jobKey,
      pass: job.pass,
      laneHint: job.laneHint,
      startFrame: beat.startFrame ?? 0,
      endFrame: beat.endFrame ?? (beat.startFrame ?? 0) + job.durationFrames,
      durationFrames: job.durationFrames,
      framing: beat.framing,
      styleFamily: beat.styleFamily,
      componentHint: beat.componentHint,
      previewMode: job.previewMode,
      ...(job.depthMode ? { depthMode: job.depthMode } : {}),
      codec: job.codecName,
      sha256: job.sha256,
      cached: job.cached,
      ...(job.renderWallSec !== undefined ? { renderWallSec: job.renderWallSec } : {}),
      fileName: job.fileName,
      path: job.outClipPath,
      rendered: !opts.dryRun,
    });

    byBeatId[job.jobKey] = job.outClipPath;
    if (job.aliasPrimaryBeatId) {
      byBeatId[beat.id] = job.outClipPath;
    }
  }

  const totalWallSec = Number(((performance.now() - tStart) / 1000).toFixed(2));
  const manifestPath = path.join(opts.outDir, "overlay-manifest.json");
  const manifest = {
    generatedAt: new Date().toISOString(),
    planPath: opts.planPath,
    title: plan.title || path.basename(opts.planPath, ".json"),
    fps,
    outDir: opts.outDir,
    codec: opts.codec,
    depthSandwichActive,
    cacheEnabled: opts.cache,
    workers: activeWorkers,
    sourceTreeSha256,
    dryRun: opts.dryRun,
    stats: {
      totalJobs: jobs.length,
      cacheHits: cacheHits.length,
      cacheMisses: cacheMisses.length,
      renderedCount: opts.dryRun ? 0 : cacheMisses.length,
      wallSec: totalWallSec,
    },
    clips,
    byBeatId,
  };

  if (opts.dryRun) {
    console.log(
      `\n[dry-run] Planned overlay manifest (${clips.length} clips, ${cacheHits.length} cached, ${cacheMisses.length} to render): ${manifestPath}`
    );
  } else {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    console.log(
      `\nOverlay manifest written: ${manifestPath} (${clips.length} clips: ${cacheHits.length} cached, ${cacheMisses.length} rendered in ${totalWallSec}s)`
    );
  }

  return manifest;
}

const isEntrypoint =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isEntrypoint) {
  renderOverlaysBatch(parseArgs(process.argv.slice(2))).catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
