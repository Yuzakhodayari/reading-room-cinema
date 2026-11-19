#!/usr/bin/env node
/**
 * Wave D3B — Pillar #16 Visual Verification Exam, 9-Panel Contact Sheet & Standalone MP4 Proof
 * (`studio/scripts/cinema-exam.mjs`)
 *
 * Executes 3 deterministic end-to-end verification suites:
 *   - Suite 1: 16-Pillar Asset & Registry Audit
 *              (96 SFX .wav @ 48kHz, 12 stereo music .wav stems @ 48kHz, 12 3D .cube LUTs,
 *               30-episode novelty vault, and >=1,400-element TypeScript Creative Catalog).
 *   - Suite 2: Episode 01 Compilation, Equalizer 30-Gate QC, Novelty Cooldown & 4-Lane FCPXML v1.9
 *              (ai_director.mjs --deterministic + plan-edit.mjs on video_01_the_allowance.md,
 *               >=96/100 score, zero forbidden CSS/hex leaks, 10/10 Style Worlds, Episode 02
 *               novelty cooldown shift, and DTD-ordered V1..V4 + A1..A3 FCPXML v1.9 export).
 *   - Suite 3: Live Chromium Visual Contact Sheet & Standalone Master .mp4 Render
 *              (9 chapters of Cinema16PillarShowcase + 1 ReadingRoomEpisodeMaster4K 3840x2160 still,
 *               RGB pixel variance & dimension verification, 2880x1620 FFmpeg 3x3 contact sheet
 *               in docs/cinema-16-pillar-contact-sheet.png [<2.5MB], and 90-frame 3.0s standalone
 *               ReadingRoomEpisodeMaster H.264 + 48kHz stereo MP4 in studio/out/master-proof.mp4).
 *
 * Usage:
 *   node scripts/cinema-exam.mjs [--skip-renders]
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STUDIO_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(STUDIO_DIR, "..");
const SRC_DIR = path.join(STUDIO_DIR, "src");
const OUT_DIR = path.join(STUDIO_DIR, "out");
const EXAM_DIR = path.join(OUT_DIR, "cinema-exam");
const COMPILED_DIR = path.join(EXAM_DIR, ".compiled");
const STILLS_DIR = path.join(EXAM_DIR, "stills");
const BUNDLE_DIR = path.join(EXAM_DIR, "bundle");
const PLANS_DIR = path.join(EXAM_DIR, "plans");

const DOCS_CONTACT_SHEET = path.join(REPO_ROOT, "docs", "cinema-16-pillar-contact-sheet.png");
const BRAIN_CONTACT_SHEET =
  "C:\\Users\\youza\\.gemini\\antigravity\\brain\\da096bbe-d8c7-47ae-96be-6f418ff8511b\\cinema-16-pillar-contact-sheet.png";
const MASTER_PROOF_MP4 = path.join(OUT_DIR, "master-proof.mp4");
const EP01_SCRIPT_PATH = path.join(REPO_ROOT, "scripts", "video_01_the_allowance.md");
const VAULT_PATH = path.join(STUDIO_DIR, "episodes-vault.json");
const SFX_DIR = path.join(STUDIO_DIR, "public", "sfx");
const MUSIC_DIR = path.join(STUDIO_DIR, "public", "music");
const LUTS_DIR = path.join(STUDIO_DIR, "luts");
const REMOTION_CLI = path.join(STUDIO_DIR, "node_modules", "@remotion", "cli", "remotion-cli.js");

const require = createRequire(import.meta.url);
const esbuild = require(path.join(STUDIO_DIR, "node_modules", "esbuild"));
const {
  openBrowser,
  selectComposition,
  renderStill,
  RenderInternals,
} = require(path.join(STUDIO_DIR, "node_modules", "@remotion", "renderer"));
const { setPropsAndEnv } = require(
  path.join(STUDIO_DIR, "node_modules", "@remotion", "renderer", "dist", "set-props-and-env")
);
const { seekToFrame } = require(
  path.join(STUDIO_DIR, "node_modules", "@remotion", "renderer", "dist", "seek-to-frame")
);

const SHOWCASE_9_CHAPTERS = [
  { index: 1, frame: 30, slug: "depth_sandwich", label: "Depth Sandwich" },
  { index: 2, frame: 90, slug: "setpiece_contraption", label: "Set-Piece Contraption" },
  { index: 3, frame: 150, slug: "macro_telemetry_jaws", label: "Macro Telemetry Jaws" },
  { index: 4, frame: 210, slug: "forensic_syllabus", label: "Forensic Syllabus" },
  { index: 5, frame: 270, slug: "war_room_corridor_atlas", label: "War-Room Corridor Atlas" },
  { index: 6, frame: 330, slug: "mechanical_plumbing_simulator", label: "Mechanical Plumbing Simulator" },
  { index: 7, frame: 390, slug: "ui_satire_scrip_wallet", label: "UI Satire Scrip Wallet" },
  { index: 8, frame: 450, slug: "18_glass_rigs", label: "18-Glass Rigs" },
  { index: 9, frame: 510, slug: "32_mode_stenography", label: "32-Mode Stenography" },
];

const EXPECTED_10_STYLE_WORLDS = [
  "liquid-glass",
  "doc-broadcast",
  "vintage-editorial",
  "macro-telemetry",
  "forensic-exhibits",
  "diagram-metaphor",
  "data-maps-3d",
  "system-simulators",
  "ui-satire-collage",
  "generative-setpiece",
];

function printUsage() {
  console.log(`Usage:
  node scripts/cinema-exam.mjs [--skip-renders]

Options:
  --skip-renders   Run Suites 1 & 2 (Asset/Catalog Audit + Ep01/Ep02/FCPXML) without Chromium rendering
  -h, --help       Show help`);
}

function ensureExamDirs() {
  for (const dir of [OUT_DIR, EXAM_DIR, COMPILED_DIR, STILLS_DIR, PLANS_DIR, path.dirname(DOCS_CONTACT_SHEET)]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function findMediaBinary(name) {
  const probeCmd = process.platform === "win32" ? "where.exe" : "which";
  const res = spawnSync(probeCmd, [name], { encoding: "utf8" });
  if (res.status === 0 && res.stdout) {
    const first = res.stdout.split(/\r?\n/).find((l) => l.trim().length > 0);
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
          if (ent.isFile() && ent.name.toLowerCase() === `${name}.exe`) {
            return full;
          }
          if (ent.isDirectory() && depth < 5) {
            stack.push({ dir: full, depth: depth + 1 });
          }
        }
      }
    }
  }
  return null;
}

function runCmd(cmd, args, cwd = STUDIO_DIR, timeoutMs = 600_000) {
  const t0 = performance.now();
  let actualCmd = cmd;
  let actualArgs = args;

  if (cmd === "npx" && args[0] === "remotion") {
    actualCmd = process.execPath;
    actualArgs = [REMOTION_CLI, ...args.slice(1)];
  } else if (cmd === "node") {
    actualCmd = process.execPath;
  }

  const res = spawnSync(actualCmd, actualArgs, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: false,
    timeout: timeoutMs,
  });
  const wallSec = Number(((performance.now() - t0) / 1000).toFixed(3));
  return {
    status: res.status ?? -1,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
    error: res.error ? String(res.error) : null,
    wallSec,
  };
}

function createCheckRecorder(suiteName) {
  const checks = [];
  function check(name, condition, detail) {
    const passed = Boolean(condition);
    checks.push({ name, passed, detail });
    const icon = passed ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${name}: ${detail}`);
  }
  function finalize() {
    const passedCount = checks.filter((c) => c.passed).length;
    const failed = checks.filter((c) => !c.passed);
    return {
      suite: suiteName,
      passed: failed.length === 0,
      passedCount,
      totalCount: checks.length,
      checks,
      failures: failed,
    };
  }
  return { check, finalize };
}

function parseWavHeaderAndPeak(wavPath) {
  const buf = fs.readFileSync(wavPath);
  if (buf.length < 44) {
    return { valid: false, reason: "File smaller than 44-byte WAV header" };
  }
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    return { valid: false, reason: "Missing RIFF/WAVE header" };
  }

  let offset = 12;
  let audioFormat = 0;
  let channels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let byteRate = 0;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === "fmt " && offset + 24 <= buf.length) {
      audioFormat = buf.readUInt16LE(offset + 8);
      channels = buf.readUInt16LE(offset + 10);
      sampleRate = buf.readUInt32LE(offset + 12);
      byteRate = buf.readUInt32LE(offset + 16);
      bitsPerSample = buf.readUInt16LE(offset + 22);
    } else if (chunkId === "data") {
      dataOffset = offset + 8;
      dataSize = Math.min(chunkSize, buf.length - dataOffset);
      break;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  if (dataOffset < 0 || dataSize <= 0 || sampleRate <= 0 || byteRate <= 0) {
    return { valid: false, reason: "Missing fmt or data chunk" };
  }

  // Sample up to 4096 16-bit PCM frames evenly across file to confirm non-zero signal
  let peakAbs = 0;
  if (bitsPerSample === 16 && dataSize >= 2) {
    const totalSamples = Math.floor(dataSize / 2);
    const step = Math.max(1, Math.floor(totalSamples / 4096));
    for (let s = 0; s < totalSamples; s += step) {
      const val = Math.abs(buf.readInt16LE(dataOffset + s * 2));
      if (val > peakAbs) peakAbs = val;
    }
  } else {
    peakAbs = 1;
  }

  return {
    valid: audioFormat === 1 && peakAbs > 0,
    audioFormat,
    channels,
    sampleRate,
    bitsPerSample,
    dataSize,
    durationSec: Number((dataSize / byteRate).toFixed(3)),
    peakAbs,
  };
}

function parseCubeLut(cubePath) {
  const raw = fs.readFileSync(cubePath, "utf8");
  const lines = raw.split(/\r?\n/);
  let size3d = 0;
  let tripleCount = 0;
  let outOfRange = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    const sizeMatch = line.match(/^LUT_3D_SIZE\s+(\d+)/i);
    if (sizeMatch) {
      size3d = Number(sizeMatch[1]);
      continue;
    }
    if (/^(TITLE|DOMAIN_MIN|DOMAIN_MAX|LUT_1D_SIZE)/i.test(line)) continue;
    const parts = line.split(/\s+/);
    if (parts.length === 3) {
      const r = Number(parts[0]);
      const g = Number(parts[1]);
      const b = Number(parts[2]);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        tripleCount += 1;
        if (r < -0.05 || r > 1.05 || g < -0.05 || g > 1.05 || b < -0.05 || b > 1.05) {
          outOfRange += 1;
        }
      }
    }
  }

  const expectedTriples = size3d > 0 ? size3d * size3d * size3d : 0;
  return {
    valid: size3d >= 17 && tripleCount === expectedTriples && outOfRange === 0,
    size3d,
    tripleCount,
    expectedTriples,
    outOfRange,
  };
}

async function compileCatalogBundle() {
  const entryPath = path.join(COMPILED_DIR, "_catalog_exam_entry.ts");
  fs.writeFileSync(
    entryPath,
    [
      `export * from ${JSON.stringify(path.join(SRC_DIR, "registry", "catalog.ts"))};`,
      `export * from ${JSON.stringify(path.join(SRC_DIR, "audio", "soundRegistry.ts"))};`,
      `export { STYLE_WORLDS, STYLE_RECIPE_BY_ID, resolveStyleRecipe } from ${JSON.stringify(path.join(SRC_DIR, "styles", "index.ts"))};`,
    ].join("\n"),
    "utf8"
  );

  const outPath = path.join(COMPILED_DIR, "catalog_exam_bundle.mjs");
  await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: outPath,
    logLevel: "silent",
    banner: {
      js: `import { createRequire } from "node:module"; const require = createRequire(import.meta.url);`,
    },
  });

  return import(`${pathToFileURL(outPath).href}?t=${Date.now()}`);
}

// ============================================================================
// SUITE 1: 16-Pillar Asset & Registry Audit
// ============================================================================
function runSuite1AssetAndCatalogAudit(catalogMod) {
  console.log("\n=== SUITE 1: 16-Pillar Asset & Registry Audit ===");
  const rec = createCheckRecorder("Suite 1 — 16-Pillar Asset & Registry Audit");

  // 1. 96 SFX .wav files in studio/public/sfx/
  const sfxFiles = fs.existsSync(SFX_DIR)
    ? fs.readdirSync(SFX_DIR).filter((f) => f.toLowerCase().endsWith(".wav")).sort()
    : [];
  let validSfxWavs = 0;
  for (const f of sfxFiles) {
    const info = parseWavHeaderAndPeak(path.join(SFX_DIR, f));
    if (info.valid && info.sampleRate === 48000 && info.dataSize > 512) {
      validSfxWavs += 1;
    }
  }
  const missingRegisteredSfx = (catalogMod.SFX_IDS || []).filter(
    (id) => !fs.existsSync(path.join(SFX_DIR, `${id}.wav`))
  );
  rec.check(
    "SFX Foley WAV Vault (studio/public/sfx)",
    sfxFiles.length >= 96 && validSfxWavs === sfxFiles.length && missingRegisteredSfx.length === 0,
    `${validSfxWavs}/${sfxFiles.length} valid 48kHz PCM .wav files (>=96 required, ${missingRegisteredSfx.length} missing registry IDs)`
  );

  // 2. 12 Music .wav stems in studio/public/music/
  const musicFiles = fs.existsSync(MUSIC_DIR)
    ? fs.readdirSync(MUSIC_DIR).filter((f) => f.toLowerCase().endsWith(".wav")).sort()
    : [];
  let validMusicStems = 0;
  for (const f of musicFiles) {
    const info = parseWavHeaderAndPeak(path.join(MUSIC_DIR, f));
    if (info.valid && info.sampleRate === 48000 && info.channels === 2 && info.durationSec >= 6.0) {
      validMusicStems += 1;
    }
  }
  const missingRegisteredMusic = (catalogMod.MUSIC_STEM_IDS || []).filter(
    (id) => !fs.existsSync(path.join(MUSIC_DIR, `${id}.wav`))
  );
  rec.check(
    "Documentary Music Stems (studio/public/music)",
    musicFiles.length >= 12 && validMusicStems === musicFiles.length && missingRegisteredMusic.length === 0,
    `${validMusicStems}/${musicFiles.length} valid 48kHz stereo .wav stems (>=12 required, ${missingRegisteredMusic.length} missing registry stems)`
  );

  // 3. 12 .cube 3D LUTs in studio/luts/
  const lutFiles = fs.existsSync(LUTS_DIR)
    ? fs.readdirSync(LUTS_DIR).filter((f) => f.toLowerCase().endsWith(".cube")).sort()
    : [];
  let validLuts = 0;
  for (const f of lutFiles) {
    const parsed = parseCubeLut(path.join(LUTS_DIR, f));
    if (parsed.valid) validLuts += 1;
  }
  const missingRegisteredLuts = (catalogMod.LUT_IDS || []).filter(
    (id) => !fs.existsSync(path.join(LUTS_DIR, `${id}.cube`))
  );
  rec.check(
    "3D Color Grading LUTs (studio/luts)",
    lutFiles.length >= 12 && validLuts === lutFiles.length && missingRegisteredLuts.length === 0,
    `${validLuts}/${lutFiles.length} valid 3D .cube LUT tables (>=12 required, ${missingRegisteredLuts.length} missing registry LUTs)`
  );

  // 4. studio/episodes-vault.json (30 season slots)
  const vault = fs.existsSync(VAULT_PATH) ? JSON.parse(fs.readFileSync(VAULT_PATH, "utf8")) : null;
  const slots = Array.isArray(vault?.seasonSlots) ? vault.seasonSlots : [];
  const uniqueEpNums = new Set(slots.map((s) => s.episodeNumber));
  const allSlotsWellFormed =
    slots.length === 30 &&
    uniqueEpNums.size === 30 &&
    slots.every(
      (s, idx) =>
        s.episodeNumber === idx + 1 &&
        typeof s.strategyId === "string" &&
        s.strategyId.startsWith("STR-") &&
        typeof s.preferredLutId === "string" &&
        Array.isArray(s.reservedShowstoppers) &&
        s.reservedShowstoppers.length >= 3
    );
  rec.check(
    "30-Episode Novelty Vault (studio/episodes-vault.json)",
    Boolean(vault) && vault.targetSeasonEpisodes === 30 && allSlotsWellFormed && Number(vault.cooldownHalfLifeTau) > 0,
    `${slots.length}/30 season slots verified, tau=${vault?.cooldownHalfLifeTau}, recordedEpisodes=${vault?.episodes?.length ?? 0}`
  );

  // 5. Creative Catalog Integrity & Wave D3B Pillar Thresholds
  const integrity = catalogMod.verifyCatalogIntegrity();
  const summary = catalogMod.getCatalogSummary();
  const up = summary.upstreamVerifiedCounts;

  rec.check(
    "Creative Catalog Schema & Zero-Duplicate Integrity",
    integrity.ok && integrity.duplicateCompositeKeys.length === 0 && integrity.legacy24StyleResolutionPassed,
    `ok=${integrity.ok}, totalElements=${summary.totalElements}, duplicates=${integrity.duplicateCompositeKeys.length}, legacy24=${integrity.legacy24StyleResolutionPassed}`
  );

  const inventoryChecks = [
    ["Motion Primitives (>=220)", up.motionPrimitives, 220, `${up.motionPrimitives} primitives (+${up.motionAliases} aliases)`],
    ["Style Recipes (>=160)", up.styleRecipes, 160, `${up.styleRecipes} recipes across ${summary.styleWorldCount} Style Worlds`],
    ["Vector/3D Props (>=540)", up.props, 540, `${up.props} bespoke props`],
    ["Offline World Countries (>=210)", up.countries, 210, `${up.countries} countries`],
    ["Offline U.S. States + DC (>=51)", up.usStates, 51, `${up.usStates} states/DC (+${up.usTerritories} territories)`],
    ["Geopolitical Corridors (>=24)", up.corridors, 24, `${up.corridors} corridors`],
    ["Kinetic Typography Modes (>=32)", up.typographyModes, 32, `${up.typographyModes} prosody modes`],
    ["Liquid Glass Presets (>=18)", up.glassStages, 18, `${up.glassStages} smoked-navy glass rigs`],
    ["Signature Set-Pieces (>=24)", up.setPieces, 24, `${up.setPieces} physics/contraption blueprints`],
    ["Total Catalog Elements (>=1,400)", summary.totalElements, 1400, `${summary.totalElements} unified catalog entries`],
  ];

  for (const [label, actual, min, msg] of inventoryChecks) {
    rec.check(label, actual >= min, `${msg} [min ${min}]`);
  }

  return {
    ...rec.finalize(),
    metrics: {
      sfxWavCount: sfxFiles.length,
      musicStemCount: musicFiles.length,
      lutCubeCount: lutFiles.length,
      seasonSlots: slots.length,
      totalCatalogElements: summary.totalElements,
      upstreamCounts: up,
    },
  };
}

// ============================================================================
// SUITE 2: Episode 01 Compilation, Equalizer Gates, Cooldown & 4-Lane FCPXML
// ============================================================================
const FORBIDDEN_BEAT_CSS_KEY_RE =
  /^(top|left|right|bottom|margin|padding|gap|fontSize|lineHeight|color|background|backgroundColor|opacity|borderRadius|transform|viewBox|stiffness|damping|mass)$/i;
const FORBIDDEN_HEX_TOKEN_RE = /#[0-9a-f]{3,8}\b/i;
const FORBIDDEN_CSS_EXPR_RE = /\b\d+px\b|\btranslate3d\(|\bspring\(/i;

function scanPlanForForbiddenLeaks(plan, { ignoreProseRationale = false } = {}) {
  const leaks = [];

  function walk(node, keyPath, insideCompilerBox) {
    if (node === null || node === undefined) return;
    if (typeof node === "string") {
      if (FORBIDDEN_HEX_TOKEN_RE.test(node)) {
        leaks.push(`Raw hex token "${node}" at ${keyPath}`);
      }
      if (FORBIDDEN_CSS_EXPR_RE.test(node)) {
        leaks.push(`Raw CSS/motion expression "${node}" at ${keyPath}`);
      }
      return;
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        walk(node[i], `${keyPath}[${i}]`, insideCompilerBox);
      }
      return;
    }
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node)) {
        if (ignoreProseRationale && (k === "cutReason" || k === "spokenText" || k === "gluedSpokenText")) {
          continue;
        }
        const nextInsideBox = insideCompilerBox || k === "spatialLayout";
        if (!nextInsideBox && FORBIDDEN_BEAT_CSS_KEY_RE.test(k)) {
          leaks.push(`Forbidden CSS layout key "${k}" at ${keyPath}.${k}`);
        }
        walk(v, `${keyPath}.${k}`, nextInsideBox);
      }
    }
  }

  walk(plan.beats || [], "beats", false);
  return leaks;
}

function validateFcpxmlDocument(xmlText) {
  const issues = [];
  if (!xmlText.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    issues.push("Missing XML 1.0 UTF-8 declaration");
  }
  if (!xmlText.includes("<!DOCTYPE fcpxml>")) {
    issues.push("Missing <!DOCTYPE fcpxml>");
  }
  if (!xmlText.includes('<fcpxml version="1.9">')) {
    issues.push('Missing <fcpxml version="1.9"> root');
  }

  // Verify unescaped ampersands do not exist
  const badAmp = xmlText.match(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g);
  if (badAmp && badAmp.length > 0) {
    issues.push(`Found ${badAmp.length} unescaped '&' entity token(s)`);
  }

  // Stack-based XML tag balance + FCPXML v1.9 <asset-clip> DTD child order check
  const stack = [];
  const tagRegex = /<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->|<\/?([a-zA-Z0-9_-]+)(?:\s[^>]*)?\/?>/g;
  let match;
  let dtdOrderViolations = 0;

  while ((match = tagRegex.exec(xmlText)) !== null) {
    const fullTag = match[0];
    if (fullTag.startsWith("<?") || fullTag.startsWith("<!")) continue;
    const tagName = match[1];
    const isClosing = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>");

    if (!isClosing && stack.length > 0) {
      const parent = stack[stack.length - 1];
      if (parent.name === "asset-clip") {
        if (tagName === "asset-clip") {
          parent.seenConnectedClip = true;
        } else if (
          (tagName === "adjust-transform" || tagName === "adjust-volume") &&
          parent.seenConnectedClip
        ) {
          dtdOrderViolations += 1;
        }
      }
    }

    if (isClosing) {
      const top = stack.pop();
      if (!top || top.name !== tagName) {
        issues.push(`Mismatched closing tag </${tagName}> (expected </${top?.name ?? "NONE"}>)`);
        break;
      }
    } else if (!isSelfClosing) {
      stack.push({ name: tagName, seenConnectedClip: false });
    }
  }

  if (stack.length > 0) {
    issues.push(`Unclosed XML tags remaining on stack: ${stack.map((s) => s.name).join(", ")}`);
  }
  if (dtdOrderViolations > 0) {
    issues.push(`${dtdOrderViolations} FCPXML v1.9 DTD child-order violation(s) inside <asset-clip>`);
  }

  const countMatches = (re) => (xmlText.match(re) || []).length;

  return {
    wellFormed: issues.length === 0,
    issues,
    spineDialogueClips: countMatches(/<asset-clip\s+ref="r_aroll"[^>]*audioRole="dialogue"/g),
    cameraTransforms: countMatches(/<adjust-transform\b/g),
    lane1BehindOrOverlayClips: countMatches(/<asset-clip\s+ref="r_ov_[^"]+"\s+lane="1"/g),
    lane2PresenterAlphaClips: countMatches(/<asset-clip\s+ref="r_person_alpha"\s+lane="2"/g),
    lane3ForegroundGlassClips: countMatches(/<asset-clip\s+ref="r_fg_[^"]+"\s+lane="3"/g),
    laneMinus1SfxClips: countMatches(/<asset-clip\s+ref="r_sfx_[^"]+"\s+lane="-1"/g),
    laneMinus2MusicClips: countMatches(/<asset-clip\s+ref="r_music_bed"\s+lane="-2"/g),
    volumeDuckKeyframes: countMatches(/<adjust-volume\b/g),
  };
}

function auditPlanDataWiring(plan) {
  const beats = Array.isArray(plan?.beats) ? plan.beats : [];
  const total = beats.length;
  let dataCount = 0;
  let tableRowsCount = 0;
  let propIdsCount = 0;
  let timedWordsCount = 0;
  const nonGeoMapBeats = [];

  for (const b of beats) {
    if (b.data && typeof b.data === "object" && Object.keys(b.data).length > 0) {
      dataCount += 1;
    }
    if (
      (Array.isArray(b.tableRows) && b.tableRows.length > 0) ||
      (Array.isArray(b.data?.tableRows) && b.data.tableRows.length > 0)
    ) {
      tableRowsCount += 1;
    }
    if (Array.isArray(b.propIds) && b.propIds.length > 0) {
      propIdsCount += 1;
    }
    if (Array.isArray(b.timedWords) && b.timedWords.length > 0) {
      timedWordsCount += 1;
    }
    if (b.componentHint === "MapExplainer" || b.recipeId === "data-corridor-arc-matrix") {
      const isGeo =
        Boolean(b.geoCorridor) || Boolean(b.geoQuery) || b.category === "map-geopolitics";
      if (!isGeo) {
        nonGeoMapBeats.push(b.id || "unknown-beat");
      }
    }
  }

  const pct = (n) => (total > 0 ? Number(((n / total) * 100).toFixed(1)) : 0);
  const dataPct = pct(dataCount);
  const tableRowsPct = pct(tableRowsCount);
  const propIdsPct = pct(propIdsCount);
  const timedWordsPct = pct(timedWordsCount);

  return {
    total,
    dataCount,
    dataPct,
    tableRowsCount,
    tableRowsPct,
    propIdsCount,
    propIdsPct,
    timedWordsCount,
    timedWordsPct,
    nonGeoMapBeats,
    passed:
      total > 0 &&
      dataPct >= 90 &&
      tableRowsPct >= 80 &&
      propIdsPct >= 40 &&
      timedWordsCount === total &&
      nonGeoMapBeats.length === 0,
  };
}

function runSuite2EpisodeCompilationAndFcpxml(catalogMod) {
  console.log("\n=== SUITE 2: Episode 01 Compilation, Equalizer Gates, Cooldown & 4-Lane FCPXML ===");
  const rec = createCheckRecorder(
    "Suite 2 — End-to-End Episode 01 Compilation, Equalizer Gates, Novelty Cooldown & 4-Lane FCPXML"
  );

  rec.check(
    "Episode 01 Spoken Script Present",
    fs.existsSync(EP01_SCRIPT_PATH),
    path.relative(REPO_ROOT, EP01_SCRIPT_PATH)
  );

  const aiDirectorScript = path.join(REPO_ROOT, "tools", "ai_director.mjs");
  const planEditScript = path.join(STUDIO_DIR, "scripts", "plan-edit.mjs");
  const exportFcpxmlScript = path.join(STUDIO_DIR, "scripts", "export-fcpxml.mjs");

  const ep1EqPath = path.join(PLANS_DIR, "ep01-equalizer-plan.json");
  const ep2EqPath = path.join(PLANS_DIR, "ep02-equalizer-plan.json");
  const tempVaultPath = path.join(PLANS_DIR, "temp-episodes-vault.json");
  const ep1PlanPath = path.join(PLANS_DIR, "ep01-director-plan.json");
  const ep2PlanPath = path.join(PLANS_DIR, "ep02-director-plan.json");
  const fcpxmlPath = path.join(PLANS_DIR, "ep01-depth-sandwich.fcpxml");

  // 1. Run tools/ai_director.mjs --deterministic on Episode 01 (and record into tempVaultPath)
  const eq1Res = runCmd("node", [
    aiDirectorScript,
    EP01_SCRIPT_PATH,
    "--deterministic",
    "--episode",
    "1",
    "--vault",
    VAULT_PATH,
    "--record-vault",
    tempVaultPath,
    "--out",
    ep1EqPath,
  ]);
  const eq1 = eq1Res.status === 0 && fs.existsSync(ep1EqPath)
    ? JSON.parse(fs.readFileSync(ep1EqPath, "utf8"))
    : null;

  rec.check(
    "AI Director Deterministic Compilation (Episode 01)",
    eq1Res.status === 0 &&
      Boolean(eq1) &&
      eq1.qualityGate?.passed === true &&
      Number(eq1.qualityGate?.score) >= 96 &&
      eq1.qualityGate?.zeroCollisionVerified === true &&
      eq1.audit?.repetitionWarnings?.length === 0,
    eq1
      ? `score=${eq1.qualityGate.score}/100 (${eq1.qualityGate.gatesPassed}/${eq1.qualityGate.totalGates} gates, H=${eq1.qualityGate.shannonEntropyBits} bits, ${eq1.beats.length} beats in ${eq1Res.wallSec}s)`
      : `Failed (exit ${eq1Res.status}): ${eq1Res.stderr.trim()}`
  );

  // 2. Run studio/scripts/plan-edit.mjs on Episode 01
  const pl1Res = runCmd("node", [
    planEditScript,
    EP01_SCRIPT_PATH,
    "--episode",
    "1",
    "--vault",
    VAULT_PATH,
    "--out",
    ep1PlanPath,
  ]);
  const pl1 = pl1Res.status === 0 && fs.existsSync(ep1PlanPath)
    ? JSON.parse(fs.readFileSync(ep1PlanPath, "utf8"))
    : null;

  rec.check(
    "Showrunner Planner Compilation (plan-edit.mjs Episode 01)",
    pl1Res.status === 0 &&
      Boolean(pl1) &&
      Number(pl1.audit?.styleDiversityScore) >= 96 &&
      pl1.audit?.repetitionWarnings?.length === 0,
    pl1
      ? `diversity=${pl1.audit.styleDiversityScore}/100, warnings=${pl1.audit.repetitionWarnings.length}, beats=${pl1.beats.length}, talkingHead=${pl1.audit.talkingHeadSharePercent}%`
      : `Failed (exit ${pl1Res.status}): ${pl1Res.stderr.trim()}`
  );

  // 3. Zero forbidden CSS / hex leaks across both plans
  const eqLeaks = eq1 ? scanPlanForForbiddenLeaks(eq1, { ignoreProseRationale: false }) : ["Missing eq1 plan"];
  const plLeaks = pl1 ? scanPlanForForbiddenLeaks(pl1, { ignoreProseRationale: true }) : ["Missing pl1 plan"];
  rec.check(
    "Zero Forbidden CSS / Raw Hex Token Leaks",
    eqLeaks.length === 0 && plLeaks.length === 0,
    `equalizerLeaks=${eqLeaks.length}, plannerStyleTokenLeaks=${plLeaks.length}${eqLeaks[0] ? ` (${eqLeaks[0]})` : ""}${plLeaks[0] ? ` (${plLeaks[0]})` : ""}`
  );

  // 4. Multi-world diversity across all 10 Style Worlds
  const plannerWorlds = new Set((pl1?.beats || []).map((b) => b.styleWorld).filter(Boolean));
  const eqWorlds = new Set();
  for (const b of eq1?.beats || []) {
    if (b.styleWorld) eqWorlds.add(b.styleWorld);
    const resolved = catalogMod.resolveStyleRecipe(b.recipeId || b.componentHint);
    if (resolved?.styleWorld) eqWorlds.add(resolved.styleWorld);
    if (b.setPieceId) eqWorlds.add("generative-setpiece");
  }
  const missingPlannerWorlds = EXPECTED_10_STYLE_WORLDS.filter((w) => !plannerWorlds.has(w));
  const missingEqWorlds = EXPECTED_10_STYLE_WORLDS.filter((w) => !eqWorlds.has(w));
  rec.check(
    "Multi-World Visual Diversity Across All 10 Style Worlds",
    missingPlannerWorlds.length === 0 && missingEqWorlds.length === 0,
    `plan-edit=${plannerWorlds.size}/10 worlds, ai_director=${eqWorlds.size}/10 worlds (${eq1?.qualityGate?.uniqueRecipesUsed ?? 0} unique recipes, ${eq1?.qualityGate?.uniqueTypographyModesUsed ?? 0}/32 kinetic modes)`
  );

  // 4b. Data-Wiring Parity Check (ai_director.mjs & plan-edit.mjs)
  const eqWiring = eq1 ? auditPlanDataWiring(eq1) : null;
  const plWiring = pl1 ? auditPlanDataWiring(pl1) : null;
  rec.check(
    "Episode 01 Data-Wiring Parity (ai_director.mjs & plan-edit.mjs)",
    Boolean(eqWiring?.passed && plWiring?.passed),
    eqWiring && plWiring
      ? `eq[data=${eqWiring.dataPct}%, rows=${eqWiring.tableRowsPct}%, props=${eqWiring.propIdsPct}%, timed=${eqWiring.timedWordsPct}%, nonGeoMap=${eqWiring.nonGeoMapBeats.length}] | plan[data=${plWiring.dataPct}%, rows=${plWiring.tableRowsPct}%, props=${plWiring.propIdsPct}%, timed=${plWiring.timedWordsPct}%, nonGeoMap=${plWiring.nonGeoMapBeats.length}]`
      : "Missing compiled plans for data-wiring parity audit"
  );

  // 5. Episode 02 Novelty Cooldown Shift
  const eq2Res = runCmd("node", [
    aiDirectorScript,
    EP01_SCRIPT_PATH,
    "--deterministic",
    "--episode",
    "2",
    "--vault",
    tempVaultPath,
    "--out",
    ep2EqPath,
  ]);
  const pl2Res = runCmd("node", [
    planEditScript,
    EP01_SCRIPT_PATH,
    "--episode",
    "2",
    "--vault",
    tempVaultPath,
    "--out",
    ep2PlanPath,
  ]);
  const eq2 = eq2Res.status === 0 && fs.existsSync(ep2EqPath)
    ? JSON.parse(fs.readFileSync(ep2EqPath, "utf8"))
    : null;
  const pl2 = pl2Res.status === 0 && fs.existsSync(ep2PlanPath)
    ? JSON.parse(fs.readFileSync(ep2PlanPath, "utf8"))
    : null;

  const eqShiftedBeats =
    eq1 && eq2
      ? eq1.beats.filter(
          (b, i) =>
            eq2.beats[i] &&
            (b.recipeId !== eq2.beats[i].recipeId || b.musicTrackId !== eq2.beats[i].musicTrackId)
        ).length
      : 0;
  const plShiftedBeats =
    pl1 && pl2
      ? pl1.beats.filter(
          (b, i) =>
            pl2.beats[i] &&
            (b.recipeId !== pl2.beats[i].recipeId || b.lutId !== pl2.beats[i].lutId)
        ).length
      : 0;

  const cooldownShifted =
    Boolean(eq1 && eq2 && pl1 && pl2) &&
    eq1.strategyId !== eq2.strategyId &&
    eq1.lutId !== eq2.lutId &&
    eq1.musicStem !== eq2.musicStem &&
    pl1.lutId !== pl2.lutId &&
    eqShiftedBeats >= 25 &&
    plShiftedBeats >= 25 &&
    Number(eq2.qualityGate?.score) >= 96;

  rec.check(
    "Episode 02 Cross-Episode Novelty Cooldown Shift",
    cooldownShifted,
    eq1 && eq2
      ? `strategy ${eq1.strategyId}->${eq2.strategyId}, LUT ${eq1.lutId}->${eq2.lutId}, stem ${eq1.musicStem}->${eq2.musicStem}, shiftedBeats(eq=${eqShiftedBeats}, plan=${plShiftedBeats}), ep02Score=${eq2.qualityGate?.score}/100`
      : "Episode 02 compilation failed"
  );

  // 6. 4-Lane Depth-Sandwich DaVinci Resolve FCPXML v1.9 Export
  const fcpxmlRes = runCmd("node", [
    exportFcpxmlScript,
    ep1EqPath,
    "--depth-sandwich",
    "--out",
    fcpxmlPath,
  ]);
  const xmlText =
    fcpxmlRes.status === 0 && fs.existsSync(fcpxmlPath)
      ? fs.readFileSync(fcpxmlPath, "utf8")
      : "";
  const xmlAudit = xmlText ? validateFcpxmlDocument(xmlText) : null;

  rec.check(
    "4-Lane Depth-Sandwich DaVinci Resolve FCPXML v1.9 Export",
    Boolean(xmlAudit) &&
      xmlAudit.wellFormed &&
      xmlAudit.spineDialogueClips >= 150 &&
      xmlAudit.cameraTransforms >= 20 &&
      xmlAudit.lane1BehindOrOverlayClips >= 100 &&
      xmlAudit.lane2PresenterAlphaClips >= 10 &&
      xmlAudit.lane3ForegroundGlassClips >= 10 &&
      xmlAudit.laneMinus1SfxClips >= 100 &&
      xmlAudit.laneMinus2MusicClips >= 10,
    xmlAudit
      ? `wellFormed=${xmlAudit.wellFormed}, V1=${xmlAudit.spineDialogueClips} (${xmlAudit.cameraTransforms} cam-keyframes), V2=${xmlAudit.lane1BehindOrOverlayClips}, V3(alpha)=${xmlAudit.lane2PresenterAlphaClips}, V4(glass)=${xmlAudit.lane3ForegroundGlassClips}, A2(sfx)=${xmlAudit.laneMinus1SfxClips}, A3(music)=${xmlAudit.laneMinus2MusicClips}`
      : `FCPXML export failed: ${fcpxmlRes.stderr.trim()}`
  );

  return {
    ...rec.finalize(),
    metrics: {
      equalizerScore: eq1?.qualityGate?.score ?? 0,
      equalizerGatesPassed: eq1?.qualityGate?.gatesPassed ?? 0,
      plannerDiversityScore: pl1?.audit?.styleDiversityScore ?? 0,
      plannerStyleWorlds: plannerWorlds.size,
      equalizerStyleWorlds: eqWorlds.size,
      dataWiringParity: {
        equalizer: eqWiring,
        planner: plWiring,
      },
      ep02ShiftedEqualizerBeats: eqShiftedBeats,
      fcpxml: xmlAudit,
    },
  };
}

// ============================================================================
// SUITE 3: Live Chromium Visual Contact Sheet & Standalone Master .mp4 Render
// ============================================================================
function inspectPngDimensionsAndVariance(pngPath, ffmpegBin) {
  if (!fs.existsSync(pngPath)) {
    return { valid: false, reason: "File does not exist" };
  }
  const buf = fs.readFileSync(pngPath);
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 32 || !buf.subarray(0, 8).equals(pngSig)) {
    return { valid: false, reason: "Invalid PNG magic bytes" };
  }
  const ihdrTag = buf.toString("ascii", 12, 16);
  if (ihdrTag !== "IHDR") {
    return { valid: false, reason: `Expected IHDR chunk, got ${ihdrTag}` };
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const fileBytes = buf.length;

  // Decode 320x180 RGB24 sample grid via FFmpeg to compute pixel luminance variance,
  // bucket diversity, and active non-background pixel coverage.
  const rawRes = spawnSync(
    ffmpegBin,
    ["-v", "error", "-i", pngPath, "-vf", "scale=320:180:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    { maxBuffer: 8 * 1024 * 1024 }
  );
  if (rawRes.status !== 0 || !rawRes.stdout || rawRes.stdout.length < 320 * 180 * 3) {
    return {
      valid: false,
      width,
      height,
      fileBytes,
      reason: `FFmpeg rawvideo decode failed: ${rawRes.stderr?.toString("utf8") || "empty buffer"}`,
    };
  }

  const gridW = 320;
  const gridH = 180;
  const rgb = rawRes.stdout;
  const pixelCount = gridW * gridH;

  // Determine dominant corner background color from 4x4 patches in all 4 corners
  const cornerBuckets = new Map();
  const cornerPatches = [
    [0, 0],
    [gridW - 4, 0],
    [0, gridH - 4],
    [gridW - 4, gridH - 4],
  ];
  for (const [px, py] of cornerPatches) {
    for (let dy = 0; dy < 4; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        const idx = ((py + dy) * gridW + (px + dx)) * 3;
        const r = rgb[idx];
        const g = rgb[idx + 1];
        const b = rgb[idx + 2];
        const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
        let entry = cornerBuckets.get(key);
        if (!entry) {
          entry = { count: 0, sr: 0, sg: 0, sb: 0 };
          cornerBuckets.set(key, entry);
        }
        entry.count += 1;
        entry.sr += r;
        entry.sg += g;
        entry.sb += b;
      }
    }
  }
  let domBg = { count: 1, sr: rgb[0], sg: rgb[1], sb: rgb[2] };
  for (const entry of cornerBuckets.values()) {
    if (entry.count > domBg.count) domBg = entry;
  }
  const bgR = domBg.sr / domBg.count;
  const bgG = domBg.sg / domBg.count;
  const bgB = domBg.sb / domBg.count;

  let sumY = 0;
  let sumY2 = 0;
  let activePixels = 0;
  const buckets = new Set();

  for (let i = 0; i < pixelCount * 3; i += 3) {
    const r = rgb[i];
    const g = rgb[i + 1];
    const b = rgb[i + 2];
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sumY += y;
    sumY2 += y * y;
    buckets.add(((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4));
    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    if (Math.sqrt(dr * dr + dg * dg + db * db) > 16) {
      activePixels += 1;
    }
  }

  const meanLuma = sumY / pixelCount;
  const variance = Math.max(0, sumY2 / pixelCount - meanLuma * meanLuma);
  const lumaStdDev = Math.sqrt(variance);
  const activeCoveragePct = Number(((activePixels / pixelCount) * 100).toFixed(2));

  return {
    valid: true,
    width,
    height,
    fileBytes,
    fileKB: Number((fileBytes / 1024).toFixed(1)),
    meanLuma: Number(meanLuma.toFixed(2)),
    lumaStdDev: Number(lumaStdDev.toFixed(2)),
    uniqueColorBuckets: buckets.size,
    dominantBgRgb: [Math.round(bgR), Math.round(bgG), Math.round(bgB)],
    activeCoveragePct,
  };
}

function probeMasterMp4(mp4Path, ffprobeBin, ffmpegBin) {
  if (!fs.existsSync(mp4Path)) {
    return { valid: false, reason: "MP4 file missing" };
  }
  const fileBytes = fs.statSync(mp4Path).size;
  const pRes = spawnSync(
    ffprobeBin,
    ["-v", "error", "-show_format", "-show_streams", "-of", "json", mp4Path],
    { encoding: "utf8" }
  );
  if (pRes.status !== 0 || !pRes.stdout) {
    return { valid: false, reason: `ffprobe failed: ${pRes.stderr}` };
  }

  const parsed = JSON.parse(pRes.stdout);
  const streams = parsed.streams || [];
  const vStream = streams.find((s) => s.codec_type === "video") || null;
  const aStream = streams.find((s) => s.codec_type === "audio") || null;
  const durationSec = Number(parsed.format?.duration || vStream?.duration || 0);

  // Decode 48kHz stereo PCM s16le to confirm real non-silent audio signal in master MP4
  let audioRmsNorm = 0;
  let audioPeakAbs = 0;
  if (aStream && ffmpegBin) {
    const pcmRes = spawnSync(
      ffmpegBin,
      ["-v", "error", "-i", mp4Path, "-f", "s16le", "-acodec", "pcm_s16le", "-"],
      { maxBuffer: 32 * 1024 * 1024 }
    );
    if (pcmRes.status === 0 && pcmRes.stdout && pcmRes.stdout.length >= 4) {
      const pcm = pcmRes.stdout;
      const sampleCount = Math.floor(pcm.length / 2);
      const step = Math.max(1, Math.floor(sampleCount / 24000));
      let sumSq = 0;
      let counted = 0;
      for (let i = 0; i < sampleCount; i += step) {
        const s = pcm.readInt16LE(i * 2);
        const abs = Math.abs(s);
        if (abs > audioPeakAbs) audioPeakAbs = abs;
        sumSq += (s / 32768) * (s / 32768);
        counted += 1;
      }
      if (counted > 0) {
        audioRmsNorm = Number(Math.sqrt(sumSq / counted).toFixed(5));
      }
    }
  }

  return {
    valid: Boolean(vStream && aStream),
    fileBytes,
    fileMB: Number((fileBytes / (1024 * 1024)).toFixed(3)),
    durationSec: Number(durationSec.toFixed(3)),
    video: vStream
      ? {
          codec: vStream.codec_name,
          profile: vStream.profile,
          width: Number(vStream.width),
          height: Number(vStream.height),
          pixFmt: vStream.pix_fmt,
          nbFrames: Number(vStream.nb_frames || 0),
          rFrameRate: vStream.r_frame_rate,
        }
      : null,
    audio: aStream
      ? {
          codec: aStream.codec_name,
          sampleRate: Number(aStream.sample_rate),
          channels: Number(aStream.channels),
          channelLayout: aStream.channel_layout || "stereo",
          rmsNorm: audioRmsNorm,
          peakInt16: audioPeakAbs,
        }
      : null,
  };
}

function selectEpisode01DiverseBeats(ep1Plan) {
  const beats = Array.isArray(ep1Plan?.beats) ? ep1Plan.beats : [];
  const usedIds = new Set();

  function pickFirst(label, slug, predicate) {
    const found = beats.find((b) => !usedIds.has(b.id) && predicate(b));
    if (!found) return null;
    usedIds.add(found.id);
    const midFrame = Math.max(
      0,
      Math.round((Number(found.startFrame || 0) + Number(found.endFrame || 0)) / 2)
    );
    return {
      label,
      slug,
      beat: found,
      frame: midFrame,
      fileName: `ep01_beat_${slug}_${found.id}_f${midFrame}.png`,
    };
  }

  return [
    pickFirst(
      "Forensic/Macro Cutaway",
      "01_forensic_cutaway",
      (b) =>
        b.framing === "fullscreen-cutaway" &&
        (String(b.recipeId || "").startsWith("forensic-") ||
          String(b.recipeId || "").startsWith("macro-") ||
          b.styleFamily === "macro-telemetry" ||
          b.styleFamily === "forensic-exhibits")
    ),
    pickFirst(
      "Set-Piece Contraption",
      "02_setpiece",
      (b) => Boolean(b.setPieceId) || b.styleFamily === "generative-setpiece"
    ),
    pickFirst(
      "Corridor/Atlas Map",
      "03_map",
      (b) =>
        b.componentHint === "MapExplainer" &&
        (b.recipeId === "data-map-explainer" || String(b.recipeId || "").startsWith("atlas-"))
    ),
    pickFirst(
      "Depth-Sandwich Presenter",
      "04_depth_sandwich",
      (b) => Boolean(b.depthSandwich?.enabled) || b.layering === "behind-presenter"
    ),
  ].filter(Boolean);
}

function evaluateDomSvgGeometryInPage() {
  function isVisible(el) {
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const cs = getComputedStyle(cur);
      if (
        cs.display === "none" ||
        cs.visibility === "hidden" ||
        parseFloat(cs.opacity) <= 0.05
      ) {
        return false;
      }
      cur = cur.parentElement;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0.5 && r.height > 0.5;
  }

  function describe(el) {
    const id = el.id ? `#${el.id}` : "";
    const cls =
      typeof el.className === "string" && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
        : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  }

  const htmlIssues = [];
  const htmlEls = Array.from(
    document.querySelectorAll(
      "div,span,p,h1,h2,h3,h4,h5,h6,td,th,li,label,button,a,code,pre"
    )
  );
  for (const el of htmlEls) {
    if (el.closest("svg")) continue;
    if (!isVisible(el)) continue;
    const txt = (el.textContent || "").trim();
    if (!txt) continue;

    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width >= window.innerWidth - 20 && rect.height >= window.innerHeight - 20) {
      continue;
    }

    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    );

    if (
      (cs.overflowX === "hidden" ||
        cs.overflowX === "clip" ||
        cs.whiteSpace === "nowrap") &&
      el.clientWidth > 0 &&
      el.scrollWidth > el.clientWidth + 4
    ) {
      // Confirm an actual visible text-bearing element overflows (ignore decorative pointer-events:none layers)
      const textDescendants = hasDirectText
        ? [el]
        : Array.from(el.querySelectorAll("*")).filter((ch) => {
            if (ch.closest("svg") || !isVisible(ch)) return false;
            return Array.from(ch.childNodes).some(
              (n) => n.nodeType === 3 && n.textContent.trim().length > 0
            );
          });
      const textOverflows = textDescendants.some((td) => {
        const tr = td.getBoundingClientRect();
        return (
          tr.right > rect.right + 4 ||
          tr.left < rect.left - 4 ||
          td.scrollWidth > td.clientWidth + 4
        );
      });
      if (textOverflows) {
        htmlIssues.push({
          type: "HTML_SCROLL_OVERFLOW",
          selector: describe(el),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          text: txt.slice(0, 80),
        });
      }
    }

    if (hasDirectText) {
      let anc = el.parentElement;
      while (anc && anc !== document.body) {
        const acs = getComputedStyle(anc);
        const arect = anc.getBoundingClientRect();
        const isCardOrBox =
          arect.width < window.innerWidth - 40 &&
          (parseFloat(acs.borderTopWidth) > 0 ||
            parseFloat(acs.borderLeftWidth) > 0 ||
            (acs.backgroundColor &&
              acs.backgroundColor !== "rgba(0, 0, 0, 0)" &&
              acs.backgroundColor !== "transparent"));
        if (isCardOrBox) {
          if (rect.right > arect.right + 4 || rect.left < arect.left - 4) {
            htmlIssues.push({
              type: "HTML_CARD_BORDER_OVERFLOW",
              selector: describe(el),
              parentSelector: describe(anc),
              rect: [Math.round(rect.left), Math.round(rect.right)],
              parentRect: [Math.round(arect.left), Math.round(arect.right)],
              text: txt.slice(0, 80),
            });
          }
          break;
        }
        anc = anc.parentElement;
      }
    }
  }

  const svgOverflow = [];
  const svgCollisions = [];
  const calloutCollisions = [];

  for (const svg of document.querySelectorAll("svg")) {
    if (!isVisible(svg)) continue;
    const sr = svg.getBoundingClientRect();
    if (sr.width < 10 || sr.height < 10) continue;

    const texts = [];
    for (const t of svg.querySelectorAll("text")) {
      if (t.closest("defs,clipPath,mask,pattern")) continue;
      if (!isVisible(t)) continue;
      const txt = (t.textContent || "").trim();
      if (!txt) continue;
      const cs = getComputedStyle(t);
      const fontSize = parseFloat(cs.fontSize);
      if (!(fontSize >= 8)) continue;
      const r = t.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;

      if (
        r.left < sr.left - 2 ||
        r.right > sr.right + 2 ||
        r.top < sr.top - 2 ||
        r.bottom > sr.bottom + 2
      ) {
        svgOverflow.push({
          type: "SVG_TEXT_OVERFLOW",
          selector: describe(t),
          text: txt.slice(0, 80),
          rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)],
          svgRect: [Math.round(sr.left), Math.round(sr.top), Math.round(sr.right), Math.round(sr.bottom)],
        });
      }
      texts.push({ selector: describe(t), text: txt, r });
    }

    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i].r;
        const b = texts[j].r;
        const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const area = ix * iy;
        if (area > 12) {
          svgCollisions.push({
            type: "SVG_TEXT_COLLISION",
            areaPx2: Math.round(area),
            a: texts[i].text.slice(0, 60),
            b: texts[j].text.slice(0, 60),
          });
        }
      }
    }

    // Callout card <g> collision check (distinct card groups with rect + text)
    const cards = [];
    for (const g of svg.querySelectorAll("g")) {
      if (g.closest("defs,clipPath,mask,pattern") || !isVisible(g)) continue;
      const directRect = Array.from(g.children).find(
        (ch) => ch.tagName.toLowerCase() === "rect"
      );
      if (!directRect) continue;
      const rr = directRect.getBoundingClientRect();
      if (
        rr.width < 60 ||
        rr.height < 28 ||
        rr.width > sr.width * 0.55 ||
        rr.height > sr.height * 0.55
      ) {
        continue;
      }
      const gTexts = Array.from(g.querySelectorAll("text"))
        .map((x) => (x.textContent || "").trim())
        .filter(Boolean);
      if (gTexts.length === 0) continue;
      cards.push({
        g,
        rr,
        label: gTexts.slice(0, 2).join(" | ").slice(0, 70),
      });
    }

    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        if (cards[i].g.contains(cards[j].g) || cards[j].g.contains(cards[i].g)) continue;
        const a = cards[i].rr;
        const b = cards[j].rr;
        const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const area = ix * iy;
        if (area > 12) {
          calloutCollisions.push({
            type: "SVG_CALLOUT_CARD_COLLISION",
            areaPx2: Math.round(area),
            a: cards[i].label,
            b: cards[j].label,
          });
        }
      }
    }
  }

  return { htmlIssues, svgOverflow, svgCollisions, calloutCollisions };
}

async function auditCompositionFramesDomSvg({
  browser,
  server,
  composition,
  inputProps = {},
  frameSpecs,
}) {
  const page = await browser.newPage({
    context: server.sourceMap,
    logLevel: "error",
    indent: false,
    pageIndex: 0,
    onBrowserLog: null,
    onLog: () => {},
  });

  const findings = [];
  try {
    await page.setViewport({
      width: composition.width,
      height: composition.height,
      deviceScaleFactor: 1,
    });
    const initialFrame = frameSpecs[0]?.frame ?? 0;
    await setPropsAndEnv({
      serializedInputPropsWithCustomSchema: JSON.stringify(inputProps),
      envVariables: {},
      page,
      serveUrl: server.serveUrl,
      initialFrame,
      attempt: 1,
      timeoutInMilliseconds: 60_000,
      proxyPort: null,
      retriesRemaining: 2,
      audioEnabled: false,
      videoEnabled: true,
      indent: false,
      logLevel: "error",
      onServeUrlVisited: () => {},
      isMainTab: true,
      mediaCacheSizeInBytes: null,
      preferredEffectBackend: "auto",
      initialMemoryAvailable: 1024 * 1024 * 1024,
      darkMode: false,
      sampleRate: 48000,
    });
    await page.evaluate((c) => {
      window.remotion_setBundleMode({
        type: "composition",
        compositionName: c.id,
        serializedResolvedPropsWithSchema: JSON.stringify(c.props || {}),
        compositionDurationInFrames: c.durationInFrames,
        compositionFps: c.fps,
        compositionHeight: c.height,
        compositionWidth: c.width,
        compositionDefaultCodec: c.defaultCodec,
        compositionDefaultOutName: c.defaultOutName,
        compositionDefaultVideoImageFormat: c.defaultVideoImageFormat,
        compositionDefaultPixelFormat: c.defaultPixelFormat,
        compositionDefaultProResProfile: c.defaultProResProfile,
        compositionDefaultSampleRate: c.defaultSampleRate,
      });
    }, composition);

    for (const spec of frameSpecs) {
      await seekToFrame({
        frame: spec.frame,
        videoEnabled: true,
        audioEnabled: false,
        page,
        composition: composition.id,
        timeoutInMilliseconds: 60_000,
        indent: false,
        logLevel: "error",
        attempt: 0,
      });
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            document.fonts.ready.then(() => {
              requestAnimationFrame(() => requestAnimationFrame(resolve));
            });
          })
      );
      const res = await page.evaluate(evaluateDomSvgGeometryInPage);
      const issues = [
        ...res.htmlIssues,
        ...res.svgOverflow,
        ...res.svgCollisions,
        ...res.calloutCollisions,
      ];
      if (issues.length > 0) {
        findings.push({
          tag: spec.tag,
          frame: spec.frame,
          issues,
        });
      }
    }
  } finally {
    await page.close();
  }
  return findings;
}

function formatDomSvgFindings(findings) {
  const parts = [];
  for (const f of findings) {
    for (const iss of f.issues) {
      if (iss.type === "HTML_SCROLL_OVERFLOW") {
        parts.push(
          `[${f.tag} @ f${f.frame}] ${iss.type} ${iss.selector} (${iss.scrollWidth}>${iss.clientWidth}px): "${iss.text}"`
        );
      } else if (iss.type === "HTML_CARD_BORDER_OVERFLOW") {
        parts.push(
          `[${f.tag} @ f${f.frame}] ${iss.type} ${iss.selector} past ${iss.parentSelector} (${iss.rect.join("..")} vs ${iss.parentRect.join("..")}): "${iss.text}"`
        );
      } else if (iss.type === "SVG_TEXT_OVERFLOW") {
        parts.push(
          `[${f.tag} @ f${f.frame}] ${iss.type} ${iss.selector} ([${iss.rect.join(",")}] vs svg [${iss.svgRect.join(",")}]): "${iss.text}"`
        );
      } else {
        parts.push(
          `[${f.tag} @ f${f.frame}] ${iss.type} (${iss.areaPx2}px^2): "${iss.a}" <-> "${iss.b}"`
        );
      }
    }
  }
  return parts;
}

async function runSuite3ChromiumVisualAndMasterProof(ffmpegBin, ffprobeBin) {
  console.log("\n=== SUITE 3: Live Chromium Visual Contact Sheet & Standalone Master .mp4 Render ===");
  const rec = createCheckRecorder(
    "Suite 3 — Live Chromium Visual Contact Sheet & Standalone Master .mp4 Render"
  );

  rec.check(
    "FFmpeg & FFprobe Media Toolchain",
    Boolean(ffmpegBin && ffprobeBin),
    `ffmpeg=${ffmpegBin ? path.basename(ffmpegBin) : "MISSING"}, ffprobe=${ffprobeBin ? path.basename(ffprobeBin) : "MISSING"}`
  );
  if (!ffmpegBin || !ffprobeBin) {
    return rec.finalize();
  }

  // 1. Pre-bundle Remotion Studio once for deterministic high-speed renders
  console.log(`  Bundling Remotion project -> ${path.relative(REPO_ROOT, BUNDLE_DIR)} ...`);
  const bundleRes = runCmd("npx", [
    "remotion",
    "bundle",
    "src/index.ts",
    "--out-dir",
    BUNDLE_DIR,
    "--quiet",
  ]);
  rec.check(
    "Remotion Production Bundle",
    bundleRes.status === 0 && fs.existsSync(path.join(BUNDLE_DIR, "index.html")),
    bundleRes.status === 0 ? `bundled in ${bundleRes.wallSec}s` : `bundle failed: ${bundleRes.stderr.slice(-300)}`
  );
  if (bundleRes.status !== 0) {
    return rec.finalize();
  }

  const ep1EqPath = path.join(PLANS_DIR, "ep01-equalizer-plan.json");
  const ep1Eq = fs.existsSync(ep1EqPath)
    ? JSON.parse(fs.readFileSync(ep1EqPath, "utf8"))
    : null;
  const ep1Props4kPath = path.join(PLANS_DIR, "ep01-equalizer-4k.props.json");
  if (ep1Eq) {
    fs.writeFileSync(
      ep1Props4kPath,
      JSON.stringify({ plan: ep1Eq, renderAudio: false, resolution: "4k" }, null, 2),
      "utf8"
    );
  }

  const chapterResults = [];
  const ep1BeatResults = [];
  let stats4k = { valid: false, reason: "Not run" };
  let wall4kSec = 0;
  let showcaseDomFindings = [];
  let ep1DomFindings = [];

  const server = await RenderInternals.prepareServer({
    webpackConfigOrServeUrl: BUNDLE_DIR,
    port: null,
    remotionRoot: STUDIO_DIR,
    offthreadVideoThreads: 1,
    logLevel: "error",
    indent: false,
    offthreadVideoCacheSizeInBytes: null,
    binariesDirectory: null,
    forceIPv4: true,
    sampleRate: 48000,
  });
  const browser = await openBrowser("chrome", { logLevel: "error" });

  try {
    // 2. Render all 9 Cinema16PillarShowcase chapters
    const showcaseComp = await selectComposition({
      serveUrl: server.serveUrl,
      id: "Cinema16PillarShowcase",
      puppeteerInstance: browser,
    });

    for (const ch of SHOWCASE_9_CHAPTERS) {
      const seqFile = path.join(STILLS_DIR, `ch_${String(ch.index).padStart(2, "0")}.png`);
      const namedFile = path.join(
        STILLS_DIR,
        `${String(ch.index).padStart(2, "0")}_${ch.slug}_f${String(ch.frame).padStart(3, "0")}.png`
      );
      console.log(`  Rendering Showcase Ch ${ch.index}/9 (frame ${ch.frame}: ${ch.label}) ...`);
      const t0 = performance.now();
      let renderErr = null;
      try {
        await renderStill({
          composition: showcaseComp,
          serveUrl: server.serveUrl,
          output: seqFile,
          frame: ch.frame,
          imageFormat: "png",
          overwrite: true,
          puppeteerInstance: browser,
          logLevel: "error",
        });
        if (fs.existsSync(seqFile)) {
          fs.copyFileSync(seqFile, namedFile);
        }
      } catch (err) {
        renderErr = String(err);
      }
      const wallSec = Number(((performance.now() - t0) / 1000).toFixed(3));
      const stats = inspectPngDimensionsAndVariance(seqFile, ffmpegBin);
      const ok =
        !renderErr &&
        stats.valid &&
        stats.width === 1920 &&
        stats.height === 1080 &&
        stats.lumaStdDev >= 8.0 &&
        stats.meanLuma > 4.0 &&
        stats.meanLuma < 251.0 &&
        stats.uniqueColorBuckets >= 24 &&
        stats.activeCoveragePct >= 14.0;

      rec.check(
        `Showcase Ch 0${ch.index} @ f${ch.frame} (${ch.label})`,
        ok,
        stats.valid
          ? `${stats.width}x${stats.height}, stdDev=${stats.lumaStdDev}, meanY=${stats.meanLuma}, active=${stats.activeCoveragePct}%, buckets=${stats.uniqueColorBuckets}, ${stats.fileKB}KB (${wallSec}s)`
          : `Render/PNG failed: ${stats.reason || renderErr}`
      );
      chapterResults.push({ ...ch, pngPath: namedFile, wallSec, stats });
    }

    // 3. Render 1 ReadingRoomEpisodeMaster4K (3840x2160 UHD) still using compiled ep01-equalizer-plan.json
    const master4kPng = path.join(STILLS_DIR, "master_4k_3840x2160_f045.png");
    const ep1InputProps4k = ep1Eq
      ? { plan: ep1Eq, renderAudio: false, resolution: "4k" }
      : { renderAudio: false, resolution: "4k" };
    console.log(
      "  Rendering ReadingRoomEpisodeMaster4K UHD still (frame 45, 3840x2160, ep01-equalizer-plan.json) ..."
    );
    const t4k = performance.now();
    let err4k = null;
    try {
      const comp4k = await selectComposition({
        serveUrl: server.serveUrl,
        id: "ReadingRoomEpisodeMaster4K",
        inputProps: ep1InputProps4k,
        puppeteerInstance: browser,
      });
      await renderStill({
        composition: comp4k,
        serveUrl: server.serveUrl,
        inputProps: ep1InputProps4k,
        output: master4kPng,
        frame: 45,
        imageFormat: "png",
        overwrite: true,
        puppeteerInstance: browser,
        logLevel: "error",
      });
    } catch (err) {
      err4k = String(err);
    }
    wall4kSec = Number(((performance.now() - t4k) / 1000).toFixed(3));
    stats4k = inspectPngDimensionsAndVariance(master4kPng, ffmpegBin);
    rec.check(
      "ReadingRoomEpisodeMaster4K Native UHD Still (3840x2160, Ep01 Compiled Plan)",
      !err4k &&
        stats4k.valid &&
        stats4k.width === 3840 &&
        stats4k.height === 2160 &&
        stats4k.lumaStdDev >= 10.0 &&
        stats4k.uniqueColorBuckets >= 32 &&
        stats4k.activeCoveragePct >= 14.0,
      stats4k.valid
        ? `${stats4k.width}x${stats4k.height}, stdDev=${stats4k.lumaStdDev}, meanY=${stats4k.meanLuma}, active=${stats4k.activeCoveragePct}%, buckets=${stats4k.uniqueColorBuckets}, ${stats4k.fileKB}KB (${wall4kSec}s)`
        : `4K still failed: ${stats4k.reason || err4k}`
    );

    // 4. Render 4 diverse real Episode 01 beats from ep01-equalizer-plan.json via ReadingRoomEpisodeMaster
    const selectedEp1Beats = selectEpisode01DiverseBeats(ep1Eq);
    const ep1InputProps1080 = ep1Eq
      ? { plan: ep1Eq, renderAudio: false, resolution: "1080p" }
      : { renderAudio: false, resolution: "1080p" };
    const ep1MasterComp = await selectComposition({
      serveUrl: server.serveUrl,
      id: "ReadingRoomEpisodeMaster",
      inputProps: ep1InputProps1080,
      puppeteerInstance: browser,
    });

    for (const item of selectedEp1Beats) {
      const outPng = path.join(STILLS_DIR, item.fileName);
      console.log(
        `  Rendering Ep01 ${item.label} (${item.beat.id} @ f${item.frame}: ${item.beat.recipeId}) ...`
      );
      const tb = performance.now();
      let beatErr = null;
      try {
        await renderStill({
          composition: ep1MasterComp,
          serveUrl: server.serveUrl,
          inputProps: ep1InputProps1080,
          output: outPng,
          frame: item.frame,
          imageFormat: "png",
          overwrite: true,
          puppeteerInstance: browser,
          logLevel: "error",
        });
      } catch (err) {
        beatErr = String(err);
      }
      const wallSec = Number(((performance.now() - tb) / 1000).toFixed(3));
      const bStats = inspectPngDimensionsAndVariance(outPng, ffmpegBin);
      const bOk =
        !beatErr &&
        bStats.valid &&
        bStats.width === 1920 &&
        bStats.height === 1080 &&
        bStats.lumaStdDev >= 8.0 &&
        bStats.uniqueColorBuckets >= 24 &&
        bStats.activeCoveragePct >= 14.0;
      rec.check(
        `Ep01 Compiled Still (${item.label}: ${item.beat.id} @ f${item.frame})`,
        bOk,
        bStats.valid
          ? `${bStats.width}x${bStats.height}, recipe=${item.beat.recipeId}, stdDev=${bStats.lumaStdDev}, active=${bStats.activeCoveragePct}%, buckets=${bStats.uniqueColorBuckets}, ${bStats.fileKB}KB (${wallSec}s)`
          : `Ep01 beat still failed: ${bStats.reason || beatErr}`
      );
      ep1BeatResults.push({
        label: item.label,
        beatId: item.beat.id,
        recipeId: item.beat.recipeId,
        frame: item.frame,
        pngPath: path.relative(REPO_ROOT, outPng),
        wallSec,
        ...bStats,
      });
    }

    // 5. Real Headless Chromium DOM & SVG Geometry Audit
    console.log("  Running Chromium DOM & SVG Geometry Audit across Showcase (9 chapters) ...");
    showcaseDomFindings = await auditCompositionFramesDomSvg({
      browser,
      server,
      composition: showcaseComp,
      inputProps: {},
      frameSpecs: SHOWCASE_9_CHAPTERS.map((ch) => ({
        tag: `Showcase Ch0${ch.index} (${ch.label})`,
        frame: ch.frame,
      })),
    });
    const showcaseDomMessages = formatDomSvgFindings(showcaseDomFindings);
    for (const msg of showcaseDomMessages) {
      console.log(`    [DOM/SVG AUDIT] ${msg}`);
    }
    rec.check(
      "Chromium DOM/SVG Overflow & Collision Audit (Cinema16PillarShowcase 9 Chapters)",
      showcaseDomMessages.length === 0,
      showcaseDomMessages.length === 0
        ? "0 HTML/SVG overflows, 0 SVG text/callout collisions across all 9 chapter frames"
        : `${showcaseDomMessages.length} issue(s): ${showcaseDomMessages.join(" | ")}`
    );

    console.log("  Running Chromium DOM & SVG Geometry Audit across Episode 01 Compiled Beats ...");
    ep1DomFindings =
      selectedEp1Beats.length > 0
        ? await auditCompositionFramesDomSvg({
            browser,
            server,
            composition: ep1MasterComp,
            inputProps: ep1InputProps1080,
            frameSpecs: selectedEp1Beats.map((item) => ({
              tag: `Ep01 ${item.beat.id} (${item.beat.recipeId})`,
              frame: item.frame,
            })),
          })
        : [];
    const ep1DomMessages = formatDomSvgFindings(ep1DomFindings);
    for (const msg of ep1DomMessages) {
      console.log(`    [DOM/SVG AUDIT] ${msg}`);
    }
    rec.check(
      "Chromium DOM/SVG Overflow & Collision Audit (Episode 01 Compiled Beats)",
      selectedEp1Beats.length === 4 && ep1DomMessages.length === 0,
      ep1DomMessages.length === 0
        ? `0 HTML/SVG overflows, 0 SVG text/callout collisions across ${selectedEp1Beats.length} Episode 01 beats`
        : `${ep1DomMessages.length} issue(s): ${ep1DomMessages.join(" | ")}`
    );
  } finally {
    await browser.close({ silent: true });
    await server.closeServer(true);
  }

  // 6. Stitch 3x3 Contact Sheet -> docs/cinema-16-pillar-contact-sheet.png (2880x1620, <2.5MB)
  console.log(`  Stitching 3x3 Contact Sheet -> ${path.relative(REPO_ROOT, DOCS_CONTACT_SHEET)} ...`);
  const rawSheetPath = path.join(STILLS_DIR, "_contact_sheet_raw_24bit.png");
  const seqPattern = path.join(STILLS_DIR, "ch_%02d.png");
  const tileFilter =
    "scale=960:540:flags=lanczos,tile=3x3,drawgrid=w=960:h=540:t=2:c=0x0F1923@0.92";

  const stitchRes = runCmd(ffmpegBin, [
    "-y",
    "-v",
    "error",
    "-framerate",
    "1",
    "-start_number",
    "1",
    "-i",
    seqPattern,
    "-vf",
    tileFilter,
    "-frames:v",
    "1",
    "-pred",
    "mixed",
    "-compression_level",
    "9",
    rawSheetPath,
  ]);

  const maxContactBytes = Math.floor(2.45 * 1024 * 1024); // Strictly < 2.5MB
  if (stitchRes.status === 0 && fs.existsSync(rawSheetPath)) {
    const rawSize = fs.statSync(rawSheetPath).size;
    if (rawSize <= maxContactBytes) {
      fs.copyFileSync(rawSheetPath, DOCS_CONTACT_SHEET);
    } else {
      // High-precision 256-color Sierra dithering keeps crisp 2880x1620 text/charts well under 2.5MB
      runCmd(ffmpegBin, [
        "-y",
        "-v",
        "error",
        "-i",
        rawSheetPath,
        "-vf",
        "split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=single[p];[s1][p]paletteuse=dither=sierra2_4a",
        "-compression_level",
        "9",
        DOCS_CONTACT_SHEET,
      ]);
    }
  }

  if (fs.existsSync(DOCS_CONTACT_SHEET)) {
    fs.mkdirSync(path.dirname(BRAIN_CONTACT_SHEET), { recursive: true });
    fs.copyFileSync(DOCS_CONTACT_SHEET, BRAIN_CONTACT_SHEET);
  }

  const sheetStats = inspectPngDimensionsAndVariance(DOCS_CONTACT_SHEET, ffmpegBin);
  const sheetMaxLimitBytes = Math.floor(2.5 * 1024 * 1024);
  rec.check(
    "9-Panel 3x3 Contact Sheet (docs/cinema-16-pillar-contact-sheet.png)",
    sheetStats.valid &&
      sheetStats.width === 2880 &&
      sheetStats.height === 1620 &&
      sheetStats.fileBytes > 100 * 1024 &&
      sheetStats.fileBytes < sheetMaxLimitBytes &&
      sheetStats.lumaStdDev >= 20.0 &&
      fs.existsSync(BRAIN_CONTACT_SHEET),
    sheetStats.valid
      ? `${sheetStats.width}x${sheetStats.height}, ${(sheetStats.fileBytes / (1024 * 1024)).toFixed(2)}MB (<2.50MB), stdDev=${sheetStats.lumaStdDev}, active=${sheetStats.activeCoveragePct}%, buckets=${sheetStats.uniqueColorBuckets}`
      : `Contact sheet failed: ${sheetStats.reason || stitchRes.stderr}`
  );

  // 7. Render 90-frame (3.0s) standalone ReadingRoomEpisodeMaster MP4 -> studio/out/master-proof.mp4
  const masterPropsPath = path.join(EXAM_DIR, "master-proof-90f.props.json");
  const masterProofProps = {
    renderAudio: true,
    resolution: "1080p",
    plan: {
      title: "Reading Room Cinema — 90-Frame Standalone Master Proof",
      fps: 30,
      totalFrames: 90,
      musicStemId: "02-ledger-investigation",
      lutId: "editorial-warm",
      beats: [
        {
          id: "proof-beat-001",
          startFrame: 0,
          endFrame: 45,
          durationSec: 1.5,
          category: "hook",
          spokenText:
            "Over 84.1% of federal taxes come from individual paychecks while national debt hits $40.5T.",
          framing: "talking-head-with-glass",
          paletteMode: "over-footage",
          styleFamily: "liquid-glass",
          recipeId: "glass-dossier-stack",
          componentHint: "LiquidGlassObject:card",
          glassPreset: "card",
          glassRig: "dossier-stack",
          typographyMode: "behind-presenter-monolith",
          depthSandwich: {
            enabled: true,
            preset: "behind-shoulder-billboard",
            heroFigure: "$40.5T",
            foregroundGlass: true,
          },
          layering: "behind-presenter",
          propIds: ["DebtMonolithWall"],
          motionAction: "slide-left -> glow-rim -> fade-blur-out",
          sfxCues: [{ cue: "glass-enter", offsetFrame: 0, volume: 0.68 }],
          musicEnergy: "pulse",
          sourceCitation: "U.S. Treasury Monthly Statement, Table 9",
        },
        {
          id: "proof-beat-002",
          startFrame: 45,
          endFrame: 90,
          durationSec: 1.5,
          category: "metaphor-story",
          spokenText:
            "When AI vaporizes intermediate labor on a $120 running shoe, unit prices fall toward electricity cost.",
          framing: "fullscreen-cutaway",
          paletteMode: "page",
          styleFamily: "diagram-metaphor",
          recipeId: "setpiece-bom-vaporizer",
          setPieceId: "SP01_SHOE_LABOR_VAPORIZER",
          componentHint: "IsometricScene",
          motionAction: "isometric-rise -> gear-mesh-cw -> fade-blur-out",
          sfxCues: [{ cue: "hydraulic-press", offsetFrame: 2, volume: 0.66 }],
          musicEnergy: "calm",
        },
      ],
    },
  };
  fs.writeFileSync(masterPropsPath, JSON.stringify(masterProofProps, null, 2), "utf8");

  console.log(`  Rendering 90-frame standalone MP4 -> ${path.relative(REPO_ROOT, MASTER_PROOF_MP4)} ...`);
  const mp4Res = runCmd("npx", [
    "remotion",
    "render",
    BUNDLE_DIR,
    "ReadingRoomEpisodeMaster",
    MASTER_PROOF_MP4,
    `--props=${masterPropsPath}`,
    "--codec=h264",
    "--crf=18",
    "--audio-codec=aac",
  ]);

  const mp4Probe = probeMasterMp4(MASTER_PROOF_MP4, ffprobeBin, ffmpegBin);
  const mp4Ok =
    mp4Res.status === 0 &&
    mp4Probe.valid &&
    mp4Probe.video?.codec === "h264" &&
    mp4Probe.video?.width === 1920 &&
    mp4Probe.video?.height === 1080 &&
    mp4Probe.video?.nbFrames === 90 &&
    mp4Probe.audio?.sampleRate === 48000 &&
    mp4Probe.audio?.channels === 2 &&
    mp4Probe.durationSec >= 2.95 &&
    mp4Probe.audio?.peakInt16 > 100;

  rec.check(
    "Standalone Master MP4 (studio/out/master-proof.mp4 via ffprobe)",
    mp4Ok,
    mp4Probe.valid
      ? `video=${mp4Probe.video.codec} ${mp4Probe.video.width}x${mp4Probe.video.height} (${mp4Probe.video.nbFrames}f), audio=${mp4Probe.audio.codec} ${mp4Probe.audio.sampleRate}Hz ${mp4Probe.audio.channels}ch (peak=${mp4Probe.audio.peakInt16}, rms=${mp4Probe.audio.rmsNorm}), dur=${mp4Probe.durationSec}s, ${mp4Probe.fileMB}MB (${mp4Res.wallSec}s)`
      : `MP4 render/probe failed: ${mp4Probe.reason || mp4Res.stderr.slice(-300)}`
  );

  return {
    ...rec.finalize(),
    metrics: {
      bundleWallSec: bundleRes.wallSec,
      chaptersRendered: chapterResults.length,
      chapterStills: chapterResults.map((c) => ({
        index: c.index,
        frame: c.frame,
        label: c.label,
        wallSec: c.wallSec,
        ...c.stats,
      })),
      master4kStill: { wallSec: wall4kSec, ...stats4k },
      episode01BeatStills: ep1BeatResults,
      domSvgAudit: {
        showcaseFindings: showcaseDomFindings,
        episode01Findings: ep1DomFindings,
      },
      contactSheet: {
        path: path.relative(REPO_ROOT, DOCS_CONTACT_SHEET),
        ...sheetStats,
      },
      masterProofMp4: {
        path: path.relative(REPO_ROOT, MASTER_PROOF_MP4),
        wallSec: mp4Res.wallSec,
        ...mp4Probe,
      },
    },
  };
}

// ============================================================================
// CLI Entrypoint
// ============================================================================
async function main() {
  const tStart = performance.now();
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help")) {
    printUsage();
    process.exit(0);
  }
  const skipRenders = argv.includes("--skip-renders");

  console.log("========================================================================");
  console.log(
    `Reading Room Cinema — 16-Pillar Verification Exam (${skipRenders ? "FAST --skip-renders" : "FULL CHROMIUM RENDER"})`
  );
  console.log("========================================================================");

  ensureExamDirs();
  const catalogMod = await compileCatalogBundle();

  const suite1 = runSuite1AssetAndCatalogAudit(catalogMod);
  const suite2 = runSuite2EpisodeCompilationAndFcpxml(catalogMod);
  const suite3 = skipRenders
    ? {
        suite: "Suite 3 — Live Chromium Visual Contact Sheet & Standalone Master .mp4 Render",
        skipped: true,
        passed: true,
        passedCount: 0,
        totalCount: 0,
        checks: [],
        failures: [],
      }
    : await runSuite3ChromiumVisualAndMasterProof(
        findMediaBinary("ffmpeg"),
        findMediaBinary("ffprobe")
      );

  const suites = [suite1, suite2, suite3];
  const totalPassed = suites.reduce((acc, s) => acc + s.passedCount, 0);
  const totalChecks = suites.reduce((acc, s) => acc + s.totalCount, 0);
  const allPassed = suites.every((s) => s.passed);
  const elapsedSec = Number(((performance.now() - tStart) / 1000).toFixed(2));

  const reportPayload = {
    generatedAt: new Date().toISOString(),
    mode: skipRenders ? "skip-renders" : "full-chromium",
    elapsedSec,
    allPassed,
    totalPassed,
    totalChecks,
    suites,
  };
  const reportPath = path.join(EXAM_DIR, "cinema-exam-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(reportPayload, null, 2) + "\n", "utf8");

  console.log("\n========================================================================");
  console.log(`CINEMA EXAM SUMMARY (${elapsedSec}s) -> ${path.relative(REPO_ROOT, reportPath)}`);
  for (const s of suites) {
    if (s.skipped) {
      console.log(`  [SKIP] ${s.suite} (--skip-renders)`);
    } else {
      console.log(`  [${s.passed ? "PASS" : "FAIL"}] ${s.suite}: ${s.passedCount}/${s.totalCount}`);
    }
  }
  console.log(`  TOTAL CHECKS: ${totalPassed}/${totalChecks} PASSED`);
  console.log("========================================================================");

  if (!allPassed) {
    for (const s of suites) {
      for (const f of s.failures) {
        console.error(`FAILED [${s.suite}] ${f.name}: ${f.detail}`);
      }
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error in cinema-exam.mjs:", err);
  process.exit(1);
});
