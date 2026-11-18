import { z } from "zod";
import {
  LUT_IDS,
  LUT_REGISTRY,
  MUSIC_STEM_REGISTRY,
  SFX_IDS,
  SOUND_REGISTRY,
  getLutCount,
  getMusicStemCount,
  getSfxCount,
} from "../audio/soundRegistry";
import {
  GLASS_PRESET_IDS,
  GLASS_PRESET_REGISTRY,
} from "../components/glass/LiquidGlassPresets";
import { DepthSandwichPreset } from "../components/glass/PresenterDepthStage";
import { CameraMovePreset } from "../design/optics";
import { REGISTER_IDS, REGISTERS } from "../design/tokens";
import { BEAT_ARCHETYPES } from "../equalizer/storyboardIR";
import { CAMERA_TRAJECTORY_IDS } from "../equalizer/viterbiChoreographer";
import { PRESET_SET_PIECE_LIST, getSetPieceCount } from "../generative";
import {
  GEOPOLITICAL_CORRIDORS,
  US_STATES,
  WORLD_COUNTRIES,
  getCorridorCount,
  getCountryCount,
  getUsStateCount,
  getUsTerritoryCount,
} from "../maps";
import {
  CAMERA_ACTIONS,
  MOTION_ALIASES,
  MOTION_PRIMITIVE_CATALOG,
  MotionDomainTag,
  MotionIntensity,
  getMotionAliasCount,
  getMotionPrimitiveCount,
} from "../motion/primitives";
import { STRATEGY_PRESET_IDS } from "../novelty/strategyPresets";
import {
  ALL_STYLE_RECIPES,
  LEGACY_24_STYLE_IDS,
  STYLE_RECIPE_BY_ID,
  STYLE_WORLDS,
  StyleWorldId,
  getStyleRecipeCount,
  resolveStyleRecipe,
} from "../styles";
import { TYPOGRAPHY_MODES } from "../typography/KineticText";
import { PROP_VAULT_LIST, PropCategory, getPropCount } from "./props";

// ============================================================================
// 1. Canonical Taxonomy Enums, Interfaces & Zod Runtime Schemas
// ============================================================================

export const CATALOG_ENTRY_KINDS = [
  "motion-primitive",
  "style-recipe",
  "prop-contraption",
  "geo-country",
  "geo-us-state",
  "geo-corridor",
  "sfx-cue",
  "music-stem",
  "color-lut",
  "typography-mode",
  "glass-stage",
  "depth-stage",
  "color-register",
  "camera-trajectory",
  "set-piece",
] as const;

export type CatalogEntryKind = (typeof CATALOG_ENTRY_KINDS)[number];
export const CatalogEntryKindSchema = z.enum(CATALOG_ENTRY_KINDS);

export const CATALOG_DOMAIN_TAGS = [
  "fiscal",
  "ai-compute",
  "energy-grid",
  "labor",
  "legal",
  "geopolitics",
  "household",
  "history",
  "comedy-gag",
] as const;

export type CatalogDomainTag = (typeof CATALOG_DOMAIN_TAGS)[number];
export const CatalogDomainTagSchema = z.enum(CATALOG_DOMAIN_TAGS);

export const CATALOG_EMOTIONAL_BEATS = [
  "clinical-evidence",
  "tension-build",
  "hard-reveal",
  "human-stakes",
  "ironic-contrast",
  "thesis-verdict",
] as const;

export type CatalogEmotionalBeat = (typeof CATALOG_EMOTIONAL_BEATS)[number];
export const CatalogEmotionalBeatSchema = z.enum(CATALOG_EMOTIONAL_BEATS);

export const CATALOG_VISUAL_WEIGHTS = [
  "light",
  "medium",
  "heavy",
  "showstopper",
] as const;

export type CatalogVisualWeight = (typeof CATALOG_VISUAL_WEIGHTS)[number];
export const CatalogVisualWeightSchema = z.enum(CATALOG_VISUAL_WEIGHTS);

export interface CreativeCatalogEntry {
  id: string;
  kind: CatalogEntryKind;
  label: string;
  description: string;
  domainTags: readonly CatalogDomainTag[];
  emotionalBeat: CatalogEmotionalBeat;
  visualWeight: CatalogVisualWeight;
  keywords: readonly string[];
  sourceModule: string;
  styleWorld?: StyleWorldId;
  canonicalToken?: string;
  isLegacy?: boolean;
}

export const CreativeCatalogEntrySchema = z.object({
  id: z.string().min(1),
  kind: CatalogEntryKindSchema,
  label: z.string().min(1),
  description: z.string().min(1),
  domainTags: z.array(CatalogDomainTagSchema).min(1),
  emotionalBeat: CatalogEmotionalBeatSchema,
  visualWeight: CatalogVisualWeightSchema,
  keywords: z.array(z.string()),
  sourceModule: z.string().min(1),
  styleWorld: z.enum(STYLE_WORLDS).optional(),
  canonicalToken: z.string().optional(),
  isLegacy: z.boolean().optional(),
});

// ============================================================================
// 2. Deterministic Normalization & Cross-Pillar Taxonomy Mappers
// ============================================================================

function toHumanLabel(slug: string): string {
  const parts = slug
    .replace(/^exit:/, "Exit ")
    .replace(/[_:/-]+/g, " ")
    .trim()
    .split(/\s+/);
  const formatted: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i];
    if (!w) continue;
    if (/^(3d|2d|ai|us|uk|spv|pik|ach|irs|sec|cbo|pjm|euv|vls|lut|sfx|gw|mw|kw|kwh|mwh|bps|gdp|dti|foia|oat|jgb)$/i.test(w)) {
      formatted.push(w.toUpperCase());
    } else {
      formatted.push(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    }
  }
  return formatted.join(" ");
}

function addUniqueDomain(
  target: CatalogDomainTag[],
  tag: CatalogDomainTag
): void {
  if (target.indexOf(tag) === -1) {
    target.push(tag);
  }
}

function mapMotionDomains(
  tags: readonly MotionDomainTag[],
  id: string
): readonly CatalogDomainTag[] {
  const out: CatalogDomainTag[] = [];
  for (let i = 0; i < tags.length; i++) {
    const t = tags[i];
    if (t === "fiscal") addUniqueDomain(out, "fiscal");
    else if (t === "compute") addUniqueDomain(out, "ai-compute");
    else if (t === "grid") addUniqueDomain(out, "energy-grid");
    else if (t === "legal" || t === "verdict") addUniqueDomain(out, "legal");
    else if (t === "geopolitics" || t === "maritime") addUniqueDomain(out, "geopolitics");
    else if (t === "household") addUniqueDomain(out, "household");
    else if (t === "archival") addUniqueDomain(out, "history");
    else if (t === "mechanical") addUniqueDomain(out, "labor");
  }
  if (/bounce|rubber|elastic|sticker|flip/.test(id)) {
    addUniqueDomain(out, "comedy-gag");
  }
  if (out.length === 0) {
    out.push("fiscal");
  }
  return out;
}

function mapMotionIntensityToWeight(intensity: MotionIntensity): CatalogVisualWeight {
  if (intensity === "subtle") return "light";
  if (intensity === "moderate") return "medium";
  if (intensity === "kinetic") return "heavy";
  return "showstopper";
}

function mapMotionToBeat(
  kind: string,
  intensity: MotionIntensity,
  id: string
): CatalogEmotionalBeat {
  if (intensity === "peak" || /verdict|guillotine|slam|veto/.test(id)) {
    return "thesis-verdict";
  }
  if (/bounce|elastic|rubber|flip/.test(id)) {
    return "ironic-contrast";
  }
  if (intensity === "kinetic") {
    return "hard-reveal";
  }
  if (kind === "camera") {
    return "tension-build";
  }
  return "clinical-evidence";
}

function mapPropCategoryToDomains(
  category: PropCategory,
  keywords: readonly string[],
  title: string
): readonly CatalogDomainTag[] {
  const out: CatalogDomainTag[] = [];
  if (category === "fiscal-debt" || category === "credit-markets") {
    addUniqueDomain(out, "fiscal");
  } else if (category === "compute-chips") {
    addUniqueDomain(out, "ai-compute");
  } else if (category === "energy-grid" || category === "minerals-industrial") {
    addUniqueDomain(out, "energy-grid");
  } else if (category === "defense-maritime" || category === "subsea-telecom") {
    addUniqueDomain(out, "geopolitics");
  } else if (category === "housing-insurance") {
    addUniqueDomain(out, "household");
  } else if (category === "labor-household") {
    addUniqueDomain(out, "labor");
    addUniqueDomain(out, "household");
  } else if (category === "history-archive") {
    addUniqueDomain(out, "history");
  } else if (category === "legal-filings") {
    addUniqueDomain(out, "legal");
  } else if (category === "telestrator-schematic") {
    addUniqueDomain(out, "fiscal");
    addUniqueDomain(out, "legal");
  }

  const hay = `${title} ${keywords.join(" ")}`.toLowerCase();
  if (/satire|cartoon|jaw|sticker|gag|whiteboard/.test(hay)) {
    addUniqueDomain(out, "comedy-gag");
  }
  if (out.length === 0) {
    out.push("fiscal");
  }
  return out;
}

function inferDomainsFromTokenList(
  tokens: readonly string[],
  fallback: CatalogDomainTag
): readonly CatalogDomainTag[] {
  const hay = tokens.join(" ").toLowerCase();
  const out: CatalogDomainTag[] = [];
  if (/fiscal|debt|treasury|bond|capex|yield|finance|macro|ledger|tax|credit/.test(hay)) {
    addUniqueDomain(out, "fiscal");
  }
  if (/silicon|compute|tech|cleanroom|ai|server|euv|fab|data|terminal/.test(hay)) {
    addUniqueDomain(out, "ai-compute");
  }
  if (/grid|energy|transformer|power|watt|substation|copper|mineral|nuclear/.test(hay)) {
    addUniqueDomain(out, "energy-grid");
  }
  if (/labor|port|payroll|industrial|worker|freight|auto/.test(hay)) {
    addUniqueDomain(out, "labor");
  }
  if (/court|legal|verdict|veto|ruling|statute|audit|stamp|gavel/.test(hay)) {
    addUniqueDomain(out, "legal");
  }
  if (/subsea|maritime|naval|strait|corridor|cables|radar|drone|global|chokepoint/.test(hay)) {
    addUniqueDomain(out, "geopolitics");
  }
  if (/household|claire|housing|mortgage|insurance|austin|pension|allowance|scrip/.test(hay)) {
    addUniqueDomain(out, "household");
  }
  if (/1912|1933|1941|newsreel|archival|history|ration|parchment|typewriter/.test(hay)) {
    addUniqueDomain(out, "history");
  }
  if (/playful|toy-model|marimba|sticker|joke|gag|satire/.test(hay)) {
    addUniqueDomain(out, "comedy-gag");
  }
  if (out.length === 0) {
    out.push(fallback);
  }
  return out;
}

// ============================================================================
// 3. Complete 15-Kind Pillar Indexers (1,400+ Real Addressable Elements)
// ============================================================================

const DEPTH_SANDWICH_CATALOG_SPECS: ReadonlyArray<{
  id: DepthSandwichPreset;
  label: string;
  domains: readonly CatalogDomainTag[];
  beat: CatalogEmotionalBeat;
  weight: CatalogVisualWeight;
  description: string;
}> = [
  {
    id: "behind-shoulder-billboard",
    label: "Behind-Shoulder Monolith Billboard",
    domains: ["fiscal", "household"],
    beat: "hard-reveal",
    weight: "showstopper",
    description: "5-plane depth stage placing giant tabular figures in Plane 1 behind presenter head and shoulders.",
  },
  {
    id: "dual-shoulder-wings",
    label: "Dual-Shoulder Bilateral Depth Wings",
    domains: ["fiscal", "labor", "legal"],
    beat: "ironic-contrast",
    weight: "heavy",
    description: "Symmetric left-and-right shoulder wing panes occluded cleanly by presenter silhouette.",
  },
  {
    id: "halo-arc-gauge",
    label: "Concentric Halo Arc Telemetry Gauge",
    domains: ["energy-grid", "ai-compute"],
    beat: "tension-build",
    weight: "showstopper",
    description: "Radial instrument arc ring framing presenter torso with live megawatt or debt load.",
  },
  {
    id: "pass-through-conveyor",
    label: "Z-Plane Pass-Through Ledger Conveyor",
    domains: ["labor", "fiscal"],
    beat: "clinical-evidence",
    weight: "heavy",
    description: "Horizontal evidence stream traversing behind presenter shoulders across the midground plane.",
  },
  {
    id: "over-shoulder-dossier-stack",
    label: "Over-Shoulder Archival Dossier Stack",
    domains: ["legal", "history"],
    beat: "clinical-evidence",
    weight: "heavy",
    description: "Layered primary-source filing stack anchored behind right shoulder with foreground glass seal.",
  },
  {
    id: "subsea-horizon-split",
    label: "Subsea Bathymetric Horizon Depth Split",
    domains: ["geopolitics", "ai-compute"],
    beat: "tension-build",
    weight: "showstopper",
    description: "Cross-sectional ocean waterline and seabed cable trench behind presenter foreground.",
  },
  {
    id: "colossus-prop-backdrop",
    label: "Colossus Mechanical Prop Backdrop",
    domains: ["energy-grid", "fiscal", "labor"],
    beat: "hard-reveal",
    weight: "showstopper",
    description: "Oversized mechanical contraption or monolith centered in Plane 1 with room-dimming vignette.",
  },
  {
    id: "spotlight-dim-sandwich",
    label: "Investigative Room-Dim Verdict Sandwich",
    domains: ["legal", "household"],
    beat: "thesis-verdict",
    weight: "heavy",
    description: "High-contrast dimmed backdrop isolating presenter key light and crisp smoked-glass verdict.",
  },
];

const STAGE_CAMERA_PRESET_SPECS: ReadonlyArray<{
  id: CameraMovePreset;
  label: string;
  domains: readonly CatalogDomainTag[];
  beat: CatalogEmotionalBeat;
  weight: CatalogVisualWeight;
  description: string;
}> = [
  {
    id: "static",
    label: "Locked Tripod Archival Frame",
    domains: ["legal", "fiscal"],
    beat: "clinical-evidence",
    weight: "light",
    description: "Zero-drift locked optical platen for dense statutory and tabular inspection.",
  },
  {
    id: "dolly-creep",
    label: "Exponential 4.2% Documentary Dolly Creep",
    domains: ["fiscal", "history", "household"],
    beat: "tension-build",
    weight: "light",
    description: "Imperceptible 1.00x to 1.042x optical push across 3-plane Z-parallax.",
  },
  {
    id: "dolly-pullback",
    label: "Contextual Scale Pullback Reveal",
    domains: ["geopolitics", "energy-grid"],
    beat: "hard-reveal",
    weight: "medium",
    description: "Smooth optical pull-back revealing full macro scale around initial detail.",
  },
  {
    id: "pan-ledger-right",
    label: "Horizontal Ledger Inspection Pan Right",
    domains: ["fiscal", "legal"],
    beat: "clinical-evidence",
    weight: "medium",
    description: "2.5D parallax lateral camera glide left-to-right across multi-column exhibits.",
  },
  {
    id: "pan-ledger-left",
    label: "Horizontal Ledger Inspection Pan Left",
    domains: ["fiscal", "history"],
    beat: "clinical-evidence",
    weight: "medium",
    description: "2.5D parallax lateral camera glide right-to-left across historical timelines.",
  },
  {
    id: "rack-focus-fg",
    label: "Thin-Lens Rack Focus to Foreground Plane",
    domains: ["legal", "household"],
    beat: "human-stakes",
    weight: "medium",
    description: "Shifts f/5.6 focal plane from z=-120 background to z=+85 foreground clause.",
  },
  {
    id: "rack-focus-bg",
    label: "Thin-Lens Rack Focus to Background Plane",
    domains: ["geopolitics", "fiscal"],
    beat: "tension-build",
    weight: "medium",
    description: "Transfers optical sharpness from foreground badge to deep z=-120 map or monolith.",
  },
  {
    id: "dutch-disequilibrium",
    label: "Clamped 1.15° Dutch Disequilibrium Cant",
    domains: ["fiscal", "geopolitics"],
    beat: "tension-build",
    weight: "medium",
    description: "Subtle 1.15-degree investigative cant restoring to level via fluidCameraSpring.",
  },
  {
    id: "verdict-slam",
    label: "Anvil-Recoil Verdict Camera Slam",
    domains: ["legal", "fiscal"],
    beat: "thesis-verdict",
    weight: "heavy",
    description: "Critically-damped impulse recoil reserved strictly for <=6-word staccato verdict strikes.",
  },
];

function buildAllCatalogEntries(): CreativeCatalogEntry[] {
  const entries: CreativeCatalogEntry[] = [];
  const seenMotionIds = new Set<string>();

  // 1. Motion Primitives (234 canonical entries across entry, exit, in-place, camera)
  for (let i = 0; i < MOTION_PRIMITIVE_CATALOG.length; i++) {
    const m = MOTION_PRIMITIVE_CATALOG[i];
    const uniqueId = seenMotionIds.has(m.id) ? `${m.kind}:${m.id}` : m.id;
    seenMotionIds.add(m.id);

    entries.push({
      id: uniqueId,
      kind: "motion-primitive",
      label: `${toHumanLabel(uniqueId)} (${toHumanLabel(m.kind)})`,
      description: m.description,
      domainTags: mapMotionDomains(m.domainTags, m.id),
      emotionalBeat: mapMotionToBeat(m.kind, m.intensity, m.id),
      visualWeight: mapMotionIntensityToWeight(m.intensity),
      keywords: [m.id, m.kind, m.intensity, m.recommendedSfx].concat(m.domainTags),
      sourceModule: "motion/primitives",
      canonicalToken: m.id,
      isLegacy: i < 21,
    });
  }

  // 2. Style Recipes (162 canonical recipes across all 10 named Style Worlds)
  for (let i = 0; i < ALL_STYLE_RECIPES.length; i++) {
    const r = ALL_STYLE_RECIPES[i];
    entries.push({
      id: r.id,
      kind: "style-recipe",
      label: r.name,
      description: r.description,
      domainTags: r.domainTags,
      emotionalBeat: r.emotionalBeat,
      visualWeight: r.visualWeight,
      keywords: [r.id, r.componentName, r.styleWorld, r.defaultPaletteMode, r.typographyMode].concat(
        r.aliases
      ),
      sourceModule: `styles/${r.styleWorld}`,
      styleWorld: r.styleWorld,
      isLegacy: r.isLegacy24,
    });
  }

  // 3. Prop & Contraption Vault (545 bespoke hero rigs + parametric domain blueprints)
  for (let i = 0; i < PROP_VAULT_LIST.length; i++) {
    const p = PROP_VAULT_LIST[i];
    const isHero = p.kind === "hero-contraption";
    entries.push({
      id: p.id,
      kind: "prop-contraption",
      label: p.title,
      description: p.blueprint
        ? `${p.title} (${p.blueprint.datumCode} · ${p.blueprint.primaryMetric})`
        : `Hero mechanical contraption rig: ${p.title} (${p.defaultMotion}).`,
      domainTags: mapPropCategoryToDomains(p.category, p.keywords, p.title),
      emotionalBeat: isHero ? "hard-reveal" : "clinical-evidence",
      visualWeight: isHero ? "showstopper" : "medium",
      keywords: [p.id, p.category, p.defaultMotion, p.domain ?? ""]
        .concat(p.keywords)
        .concat(p.episodeTags)
        .filter((s) => s.length > 0),
      sourceModule: isHero
        ? "registry/props/heroContraptions"
        : "registry/props/domainCatalogs",
    });
  }

  // 4. World Countries (208+ offline NaturalEarth / ISO sovereign & territory records)
  for (let i = 0; i < WORLD_COUNTRIES.length; i++) {
    const c = WORLD_COUNTRIES[i];
    const countryDomains: CatalogDomainTag[] = ["geopolitics"];
    if (/^(USA|CHN|JPN|DEU|GBR|FRA|TWN|CHE|LUX|IRL|SGP|KOR)$/.test(c.iso3)) {
      addUniqueDomain(countryDomains, "fiscal");
    }
    if (/^(TWN|KOR|NLD|USA|JPN|MYS)$/.test(c.iso3)) {
      addUniqueDomain(countryDomains, "ai-compute");
    }
    if (/^(SAU|ARE|QAT|NOR|CHL|PER|COD|AUS|RUS|IRN)$/.test(c.iso3)) {
      addUniqueDomain(countryDomains, "energy-grid");
    }

    entries.push({
      id: `country-${c.iso3.toLowerCase()}`,
      kind: "geo-country",
      label: `${c.name} (${c.iso3})`,
      description: `Offline cartographic country polygon ${c.name} (ISO ${c.isoNumeric}/${c.iso2}, ${c.continent}${c.capital ? `, capital ${c.capital}` : ""}).`,
      domainTags: countryDomains,
      emotionalBeat: "clinical-evidence",
      visualWeight: "medium",
      keywords: [c.iso2, c.iso3, c.isoNumeric, c.name, c.continent, c.capital ?? ""]
        .concat(c.aliases)
        .filter((s) => s.length > 0),
      sourceModule: "maps/geoDatabase",
      canonicalToken: c.iso3,
    });
  }

  // 5. US States + D.C. (51 AlbersUsa FIPS cartographic records)
  for (let i = 0; i < US_STATES.length; i++) {
    const s = US_STATES[i];
    const stateDomains: CatalogDomainTag[] = ["geopolitics", "household"];
    if (/^(TX|CA|PA|VA|OH|IL|NJ|NY|WA|AZ)$/.test(s.postal)) {
      addUniqueDomain(stateDomains, "energy-grid");
    }
    if (/^(NY|DC|DE|CA|TX|FL|AK)$/.test(s.postal)) {
      addUniqueDomain(stateDomains, "fiscal");
    }

    const cityNames = s.majorCities.map((mc) => mc.name);
    entries.push({
      id: `us-state-${s.postal.toLowerCase()}`,
      kind: "geo-us-state",
      label: `${s.name} (${s.postal} · FIPS ${s.fips})`,
      description: `U.S. state cartographic geometry for ${s.name} (capital ${s.capital}; hubs: ${cityNames.join(", ")}).`,
      domainTags: stateDomains,
      emotionalBeat: "human-stakes",
      visualWeight: "medium",
      keywords: [s.fips, s.postal, s.name, s.capital].concat(s.aliases).concat(cityNames),
      sourceModule: "maps/geoDatabase",
      canonicalToken: s.fips,
    });
  }

  // 6. Geopolitical & Infrastructure Corridors (24 war-room & supply-chain corridors)
  for (let i = 0; i < GEOPOLITICAL_CORRIDORS.length; i++) {
    const cor = GEOPOLITICAL_CORRIDORS[i];
    entries.push({
      id: cor.id,
      kind: "geo-corridor",
      label: cor.title,
      description: `${cor.eyebrow}: ${cor.subtitle}`,
      domainTags: inferDomainsFromTokenList(
        [cor.id, cor.title, cor.subtitle].concat(cor.keywords),
        "geopolitics"
      ),
      emotionalBeat: cor.warnings.length > 0 ? "hard-reveal" : "tension-build",
      visualWeight: "heavy",
      keywords: [cor.id, cor.episodeTag, cor.scope].concat(cor.keywords),
      sourceModule: "maps/geoDatabase",
    });
  }

  // 7. Procedural Studio Foley SFX Cues (96 cues across 8 acoustic families)
  for (let i = 0; i < SFX_IDS.length; i++) {
    const id = SFX_IDS[i];
    const sfx = SOUND_REGISTRY[id];
    entries.push({
      id: sfx.id,
      kind: "sfx-cue",
      label: `${toHumanLabel(sfx.id)} (${toHumanLabel(sfx.family)})`,
      description: `Procedural studio foley ${sfx.path} (${sfx.durationSec.toFixed(2)}s, ${sfx.family}, min spacing ${sfx.minOnsetSpacingMs}ms).`,
      domainTags: inferDomainsFromTokenList(
        ([sfx.id, sfx.family] as string[]).concat(sfx.domains),
        "fiscal"
      ),
      emotionalBeat:
        sfx.moods.indexOf("verdict") !== -1 || sfx.family === "stamps-gavels-locks"
          ? "thesis-verdict"
          : sfx.moods.indexOf("tense") !== -1
            ? "tension-build"
            : "clinical-evidence",
      visualWeight: sfx.defaultVolume >= 0.72 ? "medium" : "light",
      keywords: ([sfx.id, sfx.family] as string[]).concat(sfx.domains).concat(sfx.moods),
      sourceModule: "audio/soundRegistry",
      isLegacy: Boolean(sfx.isLegacy),
    });
  }

  // 8. Loopable Music Stems (12 stems)
  const musicIds = Object.keys(MUSIC_STEM_REGISTRY);
  for (let i = 0; i < musicIds.length; i++) {
    const stem = MUSIC_STEM_REGISTRY[musicIds[i] as keyof typeof MUSIC_STEM_REGISTRY];
    entries.push({
      id: stem.id,
      kind: "music-stem",
      label: `${stem.title} (${stem.keySignature} · ${stem.bpm} BPM)`,
      description: `Seamless ${stem.durationSec.toFixed(1)}s documentary score stem (${stem.energy} energy, ${stem.mood} mood).`,
      domainTags: inferDomainsFromTokenList(
        ([stem.id, stem.mood] as string[]).concat(stem.domains),
        "fiscal"
      ),
      emotionalBeat:
        stem.energy === "drop-silence"
          ? "thesis-verdict"
          : stem.energy === "tense"
            ? "tension-build"
            : stem.mood === "toy-model"
              ? "ironic-contrast"
              : "clinical-evidence",
      visualWeight: "medium",
      keywords: ([stem.id, stem.title, stem.mood, stem.energy, stem.keySignature] as string[]).concat(
        stem.domains
      ),
      sourceModule: "audio/soundRegistry",
    });
  }

  // 9. Cinema 3D Color Grading LUTs (12 .cube files)
  for (let i = 0; i < LUT_IDS.length; i++) {
    const lut = LUT_REGISTRY[LUT_IDS[i]];
    entries.push({
      id: lut.id,
      kind: "color-lut",
      label: `${lut.title} (${lut.latticeSize}³ 3D LUT)`,
      description: `3D .cube color grade ${lut.file} paired with ${lut.registerAffinity} substrate.`,
      domainTags: inferDomainsFromTokenList(
        ([lut.id, lut.registerAffinity] as string[]).concat(lut.domains),
        "history"
      ),
      emotionalBeat:
        lut.id === "verdict-high-contrast"
          ? "thesis-verdict"
          : lut.moods.indexOf("tense") !== -1
            ? "tension-build"
            : "clinical-evidence",
      visualWeight: "light",
      keywords: ([lut.id, lut.title, lut.registerAffinity] as string[]).concat(lut.domains).concat(lut.moods),
      sourceModule: "audio/soundRegistry",
      isLegacy: Boolean(lut.isLegacy),
    });
  }

  // 10. Kinetic Typography & Cinema Stenography Modes (32 Whisper-synced modes)
  for (let i = 0; i < TYPOGRAPHY_MODES.length; i++) {
    const mode = TYPOGRAPHY_MODES[i];
    entries.push({
      id: mode,
      kind: "typography-mode",
      label: toHumanLabel(mode),
      description: `Whisper word-level prosody-synced kinetic typography mode '${mode}'.`,
      domainTags: inferDomainsFromTokenList([mode], "legal"),
      emotionalBeat: /slam|veto|verdict|silent-black|strike/.test(mode)
        ? "thesis-verdict"
        : /antithesis|question|red-correction/.test(mode)
          ? "ironic-contrast"
          : "clinical-evidence",
      visualWeight: /monolith|slam|staccato|solari/.test(mode) ? "heavy" : "medium",
      keywords: [mode, "kinetic-text", "stenography", "whisper-sync"],
      sourceModule: "typography/KineticText",
      isLegacy: i < 7,
    });
  }

  // 11. Smoked-Navy Apple Liquid Glass Stage Presets (18 presets)
  for (let i = 0; i < GLASS_PRESET_IDS.length; i++) {
    const gid = GLASS_PRESET_IDS[i];
    const g = GLASS_PRESET_REGISTRY[gid];
    entries.push({
      id: g.id,
      kind: "glass-stage",
      label: `${g.displayName} (${g.componentName})`,
      description: `Over-footage smoked-navy Apple Liquid Glass preset in ${g.safePlacement} safe zone (${g.defaultWidth}px).`,
      domainTags: inferDomainsFromTokenList([g.id, g.displayName, g.category], "fiscal"),
      emotionalBeat: g.category === "forensic" ? "clinical-evidence" : "tension-build",
      visualWeight: g.id === "corner-pill" ? "light" : "medium",
      keywords: [g.id, g.componentName, g.safePlacement, g.category, "liquid-glass"],
      sourceModule: "components/glass/LiquidGlassPresets",
      isLegacy: i < 6,
    });
  }

  // 12. 5-Plane Presenter Occlusion Depth-Sandwich Presets (8 presets)
  for (let i = 0; i < DEPTH_SANDWICH_CATALOG_SPECS.length; i++) {
    const ds = DEPTH_SANDWICH_CATALOG_SPECS[i];
    entries.push({
      id: ds.id,
      kind: "depth-stage",
      label: ds.label,
      description: ds.description,
      domainTags: ds.domains,
      emotionalBeat: ds.beat,
      visualWeight: ds.weight,
      keywords: [ds.id, "depth-sandwich", "presenter-occlusion", "5-plane"],
      sourceModule: "components/glass/PresenterDepthStage",
    });
  }

  // 13. Optical Color Registers (6 WCAG AAA >= 7.0:1 verified substrates)
  for (let i = 0; i < REGISTER_IDS.length; i++) {
    const rid = REGISTER_IDS[i];
    const reg = REGISTERS[rid];
    entries.push({
      id: reg.id,
      kind: "color-register",
      label: reg.label,
      description: `WCAG 2.1 AAA (>=7.0:1) ${reg.isDark ? "dark" : "light"} optical register (canvas ${reg.bg.canvas}, primary ink ${reg.ink.primary}).`,
      domainTags: inferDomainsFromTokenList([reg.id, reg.label], "fiscal"),
      emotionalBeat: reg.isDark ? "tension-build" : "clinical-evidence",
      visualWeight: "light",
      keywords: [reg.id, reg.label, reg.isDark ? "dark-register" : "light-register", "wcag-aaa"],
      sourceModule: "design/tokens",
    });
  }
  entries.push({
    id: "over_footage",
    kind: "color-register",
    label: "Smoked-Navy Over-Footage Optical Glass Register",
    description: "Translucent smoked-navy crystal glass substrate (#0F1923 well / #FFF6E5 warm cream ink) over live A-roll.",
    domainTags: ["fiscal", "household"],
    emotionalBeat: "human-stakes",
    visualWeight: "light",
    keywords: ["over_footage", "over-footage", "navy-glass", "liquid-glass", "wcag-aaa"],
    sourceModule: "design/tokens",
    isLegacy: true,
  });

  // 14. 2.5D Stage & Viterbi Camera Rig Trajectories (16 trajectories)
  for (let i = 0; i < STAGE_CAMERA_PRESET_SPECS.length; i++) {
    const cam = STAGE_CAMERA_PRESET_SPECS[i];
    entries.push({
      id: cam.id,
      kind: "camera-trajectory",
      label: cam.label,
      description: cam.description,
      domainTags: cam.domains,
      emotionalBeat: cam.beat,
      visualWeight: cam.weight,
      keywords: [cam.id, "camera-rig", "2.5d-optics", "parallax"],
      sourceModule: "design/optics",
    });
  }
  for (let i = 0; i < CAMERA_TRAJECTORY_IDS.length; i++) {
    const vid = CAMERA_TRAJECTORY_IDS[i];
    entries.push({
      id: vid,
      kind: "camera-trajectory",
      label: `Viterbi Solver · ${toHumanLabel(vid)}`,
      description: `Global dynamic-programming Viterbi camera trajectory '${vid}' with triplet-repetition ban.`,
      domainTags: inferDomainsFromTokenList([vid], "geopolitics"),
      emotionalBeat: vid === "DEPTH_DOLLY_SANDWICH" ? "hard-reveal" : "tension-build",
      visualWeight: vid === "STATIC_LOCK" ? "light" : "medium",
      keywords: [vid, "viterbi-camera", "choreographer"],
      sourceModule: "equalizer/viterbiChoreographer",
    });
  }

  // 15. Flagship Generative Set-Piece Blueprints (24 SP01..SP24 declarative contraptions)
  for (let i = 0; i < PRESET_SET_PIECE_LIST.length; i++) {
    const sp = PRESET_SET_PIECE_LIST[i];
    entries.push({
      id: sp.id,
      kind: "set-piece",
      label: sp.title,
      description: sp.subtitle ?? sp.title,
      domainTags: inferDomainsFromTokenList(
        [sp.id, sp.title, sp.subtitle ?? "", sp.polish?.sourceCitation ?? ""],
        "fiscal"
      ),
      emotionalBeat: sp.episode === 1 ? "hard-reveal" : "thesis-verdict",
      visualWeight: "showstopper",
      keywords: [sp.id, `ep${sp.episode}`, sp.themeRegister, sp.surfaceMode ?? "page"],
      sourceModule: "generative/presetSetPieces",
    });
  }

  return entries;
}
// ============================================================================
// 4. Unified Catalog Singleton, Summary Accessors & Semantic Search Engine
// ============================================================================

export const CREATIVE_CATALOG: readonly CreativeCatalogEntry[] = buildAllCatalogEntries();

const compositeIndex: Record<string, CreativeCatalogEntry> = {};
for (let i = 0; i < CREATIVE_CATALOG.length; i++) {
  const item = CREATIVE_CATALOG[i];
  const key = `${item.kind}:${item.id}`;
  if (compositeIndex[key] === undefined) {
    compositeIndex[key] = item;
  }
}

export const CATALOG_BY_COMPOSITE_KEY: Readonly<Record<string, CreativeCatalogEntry>> =
  compositeIndex;

export function getTotalCreativeElementCount(): number {
  return CREATIVE_CATALOG.length;
}

export interface CreativeCatalogSummary {
  totalElements: number;
  motionAliasCount: number;
  unifiedMotionAliasMapKeys: number;
  cameraMotionPrimitiveCount: number;
  styleWorldCount: number;
  legacy24StyleCount: number;
  countsByKind: Record<CatalogEntryKind, number>;
  countsByDomain: Record<CatalogDomainTag, number>;
  countsByEmotionalBeat: Record<CatalogEmotionalBeat, number>;
  countsByVisualWeight: Record<CatalogVisualWeight, number>;
  countsByStyleWorld: Record<StyleWorldId, number>;
  upstreamVerifiedCounts: {
    motionPrimitives: number;
    motionAliases: number;
    styleRecipes: number;
    props: number;
    countries: number;
    usStates: number;
    usTerritories: number;
    corridors: number;
    sfxCues: number;
    musicStems: number;
    colorLuts: number;
    typographyModes: number;
    glassStages: number;
    setPieces: number;
    strategyPresets: number;
    storyboardArchetypes: number;
  };
}

export function getCatalogSummary(): CreativeCatalogSummary {
  const countsByKind: Record<CatalogEntryKind, number> = {
    "motion-primitive": 0,
    "style-recipe": 0,
    "prop-contraption": 0,
    "geo-country": 0,
    "geo-us-state": 0,
    "geo-corridor": 0,
    "sfx-cue": 0,
    "music-stem": 0,
    "color-lut": 0,
    "typography-mode": 0,
    "glass-stage": 0,
    "depth-stage": 0,
    "color-register": 0,
    "camera-trajectory": 0,
    "set-piece": 0,
  };

  const countsByDomain: Record<CatalogDomainTag, number> = {
    fiscal: 0,
    "ai-compute": 0,
    "energy-grid": 0,
    labor: 0,
    legal: 0,
    geopolitics: 0,
    household: 0,
    history: 0,
    "comedy-gag": 0,
  };

  const countsByEmotionalBeat: Record<CatalogEmotionalBeat, number> = {
    "clinical-evidence": 0,
    "tension-build": 0,
    "hard-reveal": 0,
    "human-stakes": 0,
    "ironic-contrast": 0,
    "thesis-verdict": 0,
  };

  const countsByVisualWeight: Record<CatalogVisualWeight, number> = {
    light: 0,
    medium: 0,
    heavy: 0,
    showstopper: 0,
  };

  const countsByStyleWorld: Record<StyleWorldId, number> = {
    "liquid-glass": 0,
    "doc-broadcast": 0,
    "vintage-editorial": 0,
    "macro-telemetry": 0,
    "forensic-exhibits": 0,
    "diagram-metaphor": 0,
    "data-maps-3d": 0,
    "system-simulators": 0,
    "ui-satire-collage": 0,
    "generative-setpiece": 0,
  };

  for (let i = 0; i < CREATIVE_CATALOG.length; i++) {
    const e = CREATIVE_CATALOG[i];
    countsByKind[e.kind] += 1;
    countsByEmotionalBeat[e.emotionalBeat] += 1;
    countsByVisualWeight[e.visualWeight] += 1;
    if (e.styleWorld) {
      countsByStyleWorld[e.styleWorld] += 1;
    }
    for (let d = 0; d < e.domainTags.length; d++) {
      countsByDomain[e.domainTags[d]] += 1;
    }
  }

  return {
    totalElements: CREATIVE_CATALOG.length,
    motionAliasCount: getMotionAliasCount(),
    unifiedMotionAliasMapKeys: Object.keys(MOTION_ALIASES).length,
    cameraMotionPrimitiveCount: CAMERA_ACTIONS.length,
    styleWorldCount: STYLE_WORLDS.length,
    legacy24StyleCount: LEGACY_24_STYLE_IDS.length,
    countsByKind,
    countsByDomain,
    countsByEmotionalBeat,
    countsByVisualWeight,
    countsByStyleWorld,
    upstreamVerifiedCounts: {
      motionPrimitives: getMotionPrimitiveCount(),
      motionAliases: getMotionAliasCount(),
      styleRecipes: getStyleRecipeCount(),
      props: getPropCount(),
      countries: getCountryCount(),
      usStates: getUsStateCount(),
      usTerritories: getUsTerritoryCount(),
      corridors: getCorridorCount(),
      sfxCues: getSfxCount(),
      musicStems: getMusicStemCount(),
      colorLuts: getLutCount(),
      typographyModes: TYPOGRAPHY_MODES.length,
      glassStages: GLASS_PRESET_IDS.length,
      setPieces: getSetPieceCount(),
      strategyPresets: STRATEGY_PRESET_IDS.length,
      storyboardArchetypes: BEAT_ARCHETYPES.length,
    },
  };
}

export interface CatalogSearchOptions {
  query?: string;
  kind?: CatalogEntryKind | readonly CatalogEntryKind[];
  domain?: CatalogDomainTag | string;
  emotionalBeat?: CatalogEmotionalBeat | string;
  visualWeight?: CatalogVisualWeight | string;
  styleWorld?: StyleWorldId;
  limit?: number;
  excludeIds?: readonly string[];
}

function normalizeFilterToken(raw?: string): string {
  if (!raw) return "";
  return raw.trim().toLowerCase().replace(/[_\s]+/g, "-");
}

function resolveDomainFilter(raw?: string): CatalogDomainTag | undefined {
  const norm = normalizeFilterToken(raw);
  if (!norm) return undefined;
  const aliases: Record<string, CatalogDomainTag> = {
    fiscal: "fiscal",
    debt: "fiscal",
    finance: "fiscal",
    "ai-compute": "ai-compute",
    compute: "ai-compute",
    ai: "ai-compute",
    "energy-grid": "energy-grid",
    grid: "energy-grid",
    energy: "energy-grid",
    labor: "labor",
    wages: "labor",
    legal: "legal",
    court: "legal",
    verdict: "legal",
    geopolitics: "geopolitics",
    maritime: "geopolitics",
    map: "geopolitics",
    household: "household",
    housing: "household",
    history: "history",
    archival: "history",
    "comedy-gag": "comedy-gag",
    satire: "comedy-gag",
    gag: "comedy-gag",
  };
  return aliases[norm];
}

function resolveEmotionalBeatFilter(raw?: string): CatalogEmotionalBeat | undefined {
  const norm = normalizeFilterToken(raw);
  if (!norm) return undefined;
  for (let i = 0; i < CATALOG_EMOTIONAL_BEATS.length; i++) {
    if (CATALOG_EMOTIONAL_BEATS[i] === norm) {
      return CATALOG_EMOTIONAL_BEATS[i];
    }
  }
  return undefined;
}

function resolveVisualWeightFilter(raw?: string): CatalogVisualWeight | undefined {
  const norm = normalizeFilterToken(raw);
  if (!norm) return undefined;
  const map: Record<string, CatalogVisualWeight> = {
    light: "light",
    subtle: "light",
    medium: "medium",
    moderate: "medium",
    heavy: "heavy",
    kinetic: "heavy",
    showstopper: "showstopper",
    peak: "showstopper",
  };
  return map[norm];
}

export function searchCatalog(options: CatalogSearchOptions = {}): CreativeCatalogEntry[] {
  const kindFilterSet = options.kind
    ? new Set<CatalogEntryKind>(
        typeof options.kind === "string" ? [options.kind] : options.kind
      )
    : undefined;
  const domainFilter = resolveDomainFilter(options.domain);
  const beatFilter = resolveEmotionalBeatFilter(options.emotionalBeat);
  const weightFilter = resolveVisualWeightFilter(options.visualWeight);
  const excludedSet = new Set<string>(options.excludeIds ?? []);

  const tokens = (options.query ?? "")
    .toLowerCase()
    .split(/[\s,;|/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const scored: Array<{ entry: CreativeCatalogEntry; score: number }> = [];

  for (let i = 0; i < CREATIVE_CATALOG.length; i++) {
    const entry = CREATIVE_CATALOG[i];
    if (kindFilterSet && !kindFilterSet.has(entry.kind)) continue;
    if (options.styleWorld && entry.styleWorld !== options.styleWorld) continue;
    if (excludedSet.has(entry.id) || excludedSet.has(`${entry.kind}:${entry.id}`)) continue;
    if (domainFilter && entry.domainTags.indexOf(domainFilter) === -1) continue;
    if (beatFilter && entry.emotionalBeat !== beatFilter) continue;
    if (weightFilter && entry.visualWeight !== weightFilter) continue;

    if (tokens.length === 0) {
      const baseWeight =
        entry.visualWeight === "showstopper"
          ? 4
          : entry.visualWeight === "heavy"
            ? 3
            : entry.visualWeight === "medium"
              ? 2
              : 1;
      scored.push({ entry, score: baseWeight });
      continue;
    }

    const idLow = entry.id.toLowerCase();
    const labelLow = entry.label.toLowerCase();
    const descLow = entry.description.toLowerCase();
    let score = 0;

    for (let t = 0; t < tokens.length; t++) {
      const tok = tokens[t];
      if (idLow === tok || (entry.canonicalToken && entry.canonicalToken.toLowerCase() === tok)) {
        score += 50;
      } else if (idLow.indexOf(tok) !== -1) {
        score += 20;
      }
      if (labelLow.indexOf(tok) !== -1) {
        score += 15;
      }
      for (let k = 0; k < entry.keywords.length; k++) {
        const kw = entry.keywords[k].toLowerCase();
        if (kw === tok) score += 24;
        else if (kw.indexOf(tok) !== -1) score += 8;
      }
      for (let d = 0; d < entry.domainTags.length; d++) {
        if (entry.domainTags[d].indexOf(tok) !== -1) score += 12;
      }
      if (descLow.indexOf(tok) !== -1) {
        score += 6;
      }
    }

    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.entry.kind !== b.entry.kind) return a.entry.kind < b.entry.kind ? -1 : 1;
    return a.entry.id < b.entry.id ? -1 : a.entry.id > b.entry.id ? 1 : 0;
  });

  const maxItems = options.limit !== undefined ? Math.max(1, options.limit) : 50;
  return scored.slice(0, maxItems).map((s) => s.entry);
}

// ============================================================================
// 5. Multi-Pillar Beat Bundle Recommender & Runtime Integrity Verifier
// ============================================================================

export interface BeatBundleContext {
  query?: string;
  spokenText?: string;
  domain?: CatalogDomainTag | string;
  emotionalBeat?: CatalogEmotionalBeat | string;
  visualWeight?: CatalogVisualWeight | string;
  framing?: "page" | "over-footage" | "depth-sandwich";
  isPeakBeat?: boolean;
  excludeIds?: readonly string[];
  seed?: number;
}

export interface RecommendedBeatBundle {
  styleRecipe: CreativeCatalogEntry;
  motionChain: {
    enter: CreativeCatalogEntry;
    inPlace: CreativeCatalogEntry;
    exit: CreativeCatalogEntry;
    composedAction: string;
  };
  cameraTrajectory: CreativeCatalogEntry;
  typographyMode: CreativeCatalogEntry;
  primaryProp: CreativeCatalogEntry;
  supportingProps: readonly CreativeCatalogEntry[];
  glassStage: CreativeCatalogEntry;
  depthStage: CreativeCatalogEntry;
  colorRegister: CreativeCatalogEntry;
  colorLut: CreativeCatalogEntry;
  sfxPrimary: CreativeCatalogEntry;
  sfxSecondary: CreativeCatalogEntry;
  musicStem: CreativeCatalogEntry;
  geoTarget?: CreativeCatalogEntry;
  setPiece?: CreativeCatalogEntry;
}

function pickFromKind(
  kind: CatalogEntryKind,
  queryText: string,
  domain: CatalogDomainTag | undefined,
  beat: CatalogEmotionalBeat | undefined,
  weight: CatalogVisualWeight | undefined,
  excludeIds: readonly string[] | undefined,
  styleWorld?: StyleWorldId,
  offset: number = 0
): CreativeCatalogEntry {
  const exact = searchCatalog({
    query: queryText,
    kind,
    domain,
    emotionalBeat: beat,
    visualWeight: weight,
    styleWorld,
    excludeIds,
    limit: 8,
  });
  if (exact.length > 0) {
    return exact[offset % exact.length];
  }

  const byDomain = searchCatalog({
    kind,
    domain,
    styleWorld,
    excludeIds,
    limit: 8,
  });
  if (byDomain.length > 0) {
    return byDomain[offset % byDomain.length];
  }

  const anyOfKind = searchCatalog({ kind, excludeIds, limit: 8 });
  if (anyOfKind.length > 0) {
    return anyOfKind[offset % anyOfKind.length];
  }

  return CREATIVE_CATALOG[0];
}

export function recommendBeatBundle(
  context: BeatBundleContext = {}
): RecommendedBeatBundle {
  const combinedText = `${context.query ?? ""} ${context.spokenText ?? ""}`.trim();
  const inferredDomain =
    resolveDomainFilter(context.domain) ??
    inferDomainsFromTokenList([combinedText], "fiscal")[0];
  const beat = resolveEmotionalBeatFilter(context.emotionalBeat);
  const weight =
    resolveVisualWeightFilter(context.visualWeight) ??
    (context.isPeakBeat ? "showstopper" : undefined);
  const seedOffset = Math.abs(Math.floor(context.seed ?? 0));

  const preferredWorld: StyleWorldId | undefined =
    context.framing === "over-footage"
      ? "liquid-glass"
      : context.framing === "depth-sandwich" || context.isPeakBeat
        ? "generative-setpiece"
        : undefined;

  const styleRecipe = pickFromKind(
    "style-recipe",
    combinedText,
    inferredDomain,
    beat,
    weight,
    context.excludeIds,
    preferredWorld,
    seedOffset
  );

  const enter = pickFromKind(
    "motion-primitive",
    "slide-up blur-snap paper-unfold",
    inferredDomain,
    beat,
    undefined,
    context.excludeIds,
    undefined,
    seedOffset
  );
  const inPlace = pickFromKind(
    "motion-primitive",
    "highlight-sweep loupe-scan-row audit-row-step",
    inferredDomain,
    undefined,
    undefined,
    [enter.id].concat(context.excludeIds ?? []),
    undefined,
    seedOffset + 1
  );
  const exit = pickFromKind(
    "motion-primitive",
    "fade-blur-out fade-out",
    inferredDomain,
    undefined,
    "light",
    [enter.id, inPlace.id].concat(context.excludeIds ?? []),
    undefined,
    seedOffset
  );

  const propsMatches = searchCatalog({
    query: combinedText,
    kind: "prop-contraption",
    domain: inferredDomain,
    excludeIds: context.excludeIds,
    limit: 4,
  });
  const fallbackProps =
    propsMatches.length > 0
      ? propsMatches
      : searchCatalog({ kind: "prop-contraption", domain: inferredDomain, limit: 4 });
  const primaryProp = fallbackProps[0] ?? pickFromKind("prop-contraption", "", inferredDomain, undefined, undefined, context.excludeIds);
  const supportingProps = fallbackProps.slice(1, 3);

  const sfxPrimary = pickFromKind(
    "sfx-cue",
    combinedText,
    inferredDomain,
    beat,
    undefined,
    context.excludeIds,
    undefined,
    seedOffset
  );
  const sfxSecondary = pickFromKind(
    "sfx-cue",
    "highlighter tick slide",
    inferredDomain,
    undefined,
    undefined,
    [sfxPrimary.id].concat(context.excludeIds ?? []),
    undefined,
    seedOffset + 1
  );

  const wantsGeo =
    inferredDomain === "geopolitics" ||
    /\b(pjm|austin|texas|taiwan|london|shenzhen|rotterdam|panama|suez|hormuz|baltic|france|greece|japan|china)\b/i.test(
      combinedText
    );
  const geoTarget = wantsGeo
    ? searchCatalog({
        query: combinedText,
        kind: ["geo-corridor", "geo-us-state", "geo-country"],
        excludeIds: context.excludeIds,
        limit: 1,
      })[0]
    : undefined;

  const setPiece =
    context.isPeakBeat || weight === "showstopper"
      ? pickFromKind(
          "set-piece",
          combinedText,
          inferredDomain,
          beat,
          "showstopper",
          context.excludeIds,
          undefined,
          seedOffset
        )
      : undefined;

  return {
    styleRecipe,
    motionChain: {
      enter,
      inPlace,
      exit,
      composedAction: `${enter.canonicalToken ?? enter.id} -> ${inPlace.canonicalToken ?? inPlace.id} -> ${exit.canonicalToken ?? exit.id}`,
    },
    cameraTrajectory: pickFromKind(
      "camera-trajectory",
      combinedText,
      inferredDomain,
      beat,
      undefined,
      context.excludeIds,
      undefined,
      seedOffset
    ),
    typographyMode: pickFromKind(
      "typography-mode",
      combinedText,
      inferredDomain,
      beat,
      undefined,
      context.excludeIds,
      undefined,
      seedOffset
    ),
    primaryProp,
    supportingProps,
    glassStage: pickFromKind(
      "glass-stage",
      combinedText,
      inferredDomain,
      beat,
      undefined,
      context.excludeIds,
      undefined,
      seedOffset
    ),
    depthStage: pickFromKind(
      "depth-stage",
      combinedText,
      inferredDomain,
      beat,
      undefined,
      context.excludeIds,
      undefined,
      seedOffset
    ),
    colorRegister: pickFromKind(
      "color-register",
      context.framing === "over-footage" ? "over_footage" : combinedText,
      inferredDomain,
      beat,
      undefined,
      context.excludeIds,
      undefined,
      seedOffset
    ),
    colorLut: pickFromKind(
      "color-lut",
      combinedText,
      inferredDomain,
      beat,
      undefined,
      context.excludeIds,
      undefined,
      seedOffset
    ),
    sfxPrimary,
    sfxSecondary,
    musicStem: pickFromKind(
      "music-stem",
      combinedText,
      inferredDomain,
      beat,
      undefined,
      context.excludeIds,
      undefined,
      seedOffset
    ),
    ...(geoTarget ? { geoTarget } : {}),
    ...(setPiece ? { setPiece } : {}),
  };
}

export interface PillarThresholdCheck {
  pillar: string;
  actual: number;
  minimum: number;
  passed: boolean;
}

export interface CatalogIntegrityReport {
  ok: boolean;
  totalElements: number;
  motionAliasCount: number;
  duplicateCompositeKeys: readonly string[];
  legacy24StyleResolutionPassed: boolean;
  thresholdChecks: readonly PillarThresholdCheck[];
  violations: readonly string[];
}

export function verifyCatalogIntegrity(): CatalogIntegrityReport {
  const violations: string[] = [];
  const duplicates: string[] = [];
  const seenKeys = new Set<string>();

  for (let i = 0; i < CREATIVE_CATALOG.length; i++) {
    const entry = CREATIVE_CATALOG[i];
    const compKey = `${entry.kind}:${entry.id}`;
    if (seenKeys.has(compKey)) {
      duplicates.push(compKey);
      violations.push(`Duplicate (kind, id) key: ${compKey}`);
    } else {
      seenKeys.add(compKey);
    }

    const parsed = CreativeCatalogEntrySchema.safeParse(entry);
    if (!parsed.success) {
      violations.push(`Invalid schema on ${compKey}: ${parsed.error.message}`);
    }
  }

  let legacy24Passed = true;
  for (let i = 0; i < LEGACY_24_STYLE_IDS.length; i++) {
    const legacyId = LEGACY_24_STYLE_IDS[i];
    if (!STYLE_RECIPE_BY_ID[legacyId] || !resolveStyleRecipe(legacyId)) {
      legacy24Passed = false;
      violations.push(`Missing legacy 534d89a style resolution: ${legacyId}`);
    }
  }

  const summary = getCatalogSummary();
  const c = summary.countsByKind;

  const thresholdChecks: PillarThresholdCheck[] = [
    { pillar: "motion-primitive", actual: c["motion-primitive"], minimum: 216, passed: c["motion-primitive"] >= 216 },
    { pillar: "style-recipe", actual: c["style-recipe"], minimum: 120, passed: c["style-recipe"] >= 120 },
    { pillar: "prop-contraption", actual: c["prop-contraption"], minimum: 520, passed: c["prop-contraption"] >= 520 },
    { pillar: "geo-country", actual: c["geo-country"], minimum: 195, passed: c["geo-country"] >= 195 },
    { pillar: "geo-us-state", actual: c["geo-us-state"], minimum: 50, passed: c["geo-us-state"] >= 50 },
    { pillar: "geo-corridor", actual: c["geo-corridor"], minimum: 24, passed: c["geo-corridor"] >= 24 },
    { pillar: "sfx-cue", actual: c["sfx-cue"], minimum: 96, passed: c["sfx-cue"] >= 96 },
    { pillar: "music-stem", actual: c["music-stem"], minimum: 12, passed: c["music-stem"] >= 12 },
    { pillar: "color-lut", actual: c["color-lut"], minimum: 12, passed: c["color-lut"] >= 12 },
    { pillar: "typography-mode", actual: c["typography-mode"], minimum: 32, passed: c["typography-mode"] >= 32 },
    { pillar: "glass-stage", actual: c["glass-stage"], minimum: 18, passed: c["glass-stage"] >= 18 },
    { pillar: "depth-stage", actual: c["depth-stage"], minimum: 8, passed: c["depth-stage"] >= 8 },
    { pillar: "color-register", actual: c["color-register"], minimum: 5, passed: c["color-register"] >= 5 },
    { pillar: "camera-trajectory", actual: c["camera-trajectory"], minimum: 12, passed: c["camera-trajectory"] >= 12 },
    { pillar: "set-piece", actual: c["set-piece"], minimum: 24, passed: c["set-piece"] >= 24 },
    { pillar: "total-elements", actual: summary.totalElements, minimum: 1380, passed: summary.totalElements >= 1380 },
  ];

  for (let i = 0; i < thresholdChecks.length; i++) {
    const chk = thresholdChecks[i];
    if (!chk.passed) {
      violations.push(
        `Pillar '${chk.pillar}' below blueprint minimum: actual ${chk.actual} < minimum ${chk.minimum}`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(`Creative catalog integrity check failed:\n${violations.join("\n")}`);
  }

  return {
    ok: true,
    totalElements: summary.totalElements,
    motionAliasCount: summary.motionAliasCount,
    duplicateCompositeKeys: duplicates,
    legacy24StyleResolutionPassed: legacy24Passed,
    thresholdChecks,
    violations,
  };
}
