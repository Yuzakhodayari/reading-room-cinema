import { z } from "zod";
import type { SceneBlueprint } from "../generative/blueprintTypes";
import type { GeoQueryTarget } from "../maps/atlasResolver";
import type { TimedWord } from "../typography/prosodySync";

export const BEAT_CATEGORIES = [
  "hook",
  "thesis-promise",
  "receipt-proof",
  "metaphor-story",
  "good-work-punchline",
  "history-archive",
  "map-geopolitics",
  "warning-escalation",
  "claire-ledger",
  "open-loop",
  "takeaway",
] as const;

export type BeatCategory = (typeof BEAT_CATEGORIES)[number];
export const BeatCategorySchema = z.enum(BEAT_CATEGORIES);

export const STYLE_ENGINE_FAMILIES = [
  "liquid-glass",
  "doc-broadcast",
  "vintage-editorial",
  "diagram-metaphor",
  "data-maps-3d",
] as const;

export type StyleEngineFamily = (typeof STYLE_ENGINE_FAMILIES)[number];
export const StyleEngineFamilySchema = z.enum(STYLE_ENGINE_FAMILIES);

export const STYLE_WORLD_IDS = [
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
] as const;

export type StyleWorldId = (typeof STYLE_WORLD_IDS)[number];
export const StyleWorldIdSchema = z.enum(STYLE_WORLD_IDS);

export const CAMERA_FRAMINGS = [
  "talking-head-full",
  "talking-head-punch-in",
  "talking-head-with-glass",
  "fullscreen-cutaway",
  "split-screen",
] as const;

export type CameraFraming = (typeof CAMERA_FRAMINGS)[number];
export const CameraFramingSchema = z.enum(CAMERA_FRAMINGS);

export const GLASS_PRESETS = [
  "card",
  "pill",
  "dock",
  "toast",
  "split-modal",
  "toolbar",
  "corner-pill",
  "bottom-dock",
  "floating-toolbar",
  "toast-alert",
  "dossier-stack",
  "evidence-rail",
  "magnifier-card",
  "telemetry-strip",
  "verdict-seal",
  "compare-scale",
  "timeline-scrubber",
  "receipt-ticker",
  "terminal-console",
  "map-callout",
  "stat-triptych",
  "quote-citation",
] as const;

export type GlassPreset = (typeof GLASS_PRESETS)[number];
export const GlassPresetSchema = z.enum(GLASS_PRESETS);

export const PALETTE_MODES = ["page", "over-footage"] as const;
export type PaletteMode = (typeof PALETTE_MODES)[number];
export const PaletteModeSchema = z.enum(PALETTE_MODES);

export const CINEMA_REGISTERS = [
  "page_editorial",
  "archival_parchment",
  "midnight_telemetry",
  "drafting_blueprint",
  "vintage_newsreel",
  "over_footage",
  "milk-page-editorial",
  "smoked-navy-glass",
  "archival-light-table",
  "investigation-switchboard",
  "blueprint-schematic",
  "silver-gelatin-chronicle",
  "geospatial-telemetry",
  "restraint-vellum",
] as const;

export type CinemaRegister = (typeof CINEMA_REGISTERS)[number];
export const CinemaRegisterSchema = z.enum(CINEMA_REGISTERS);

export const DEPTH_RENDER_MODES = [
  "masked-video",
  "simulated-depth",
  "behind-only-alpha",
  "front-only-alpha",
] as const;

export type DepthRenderMode = (typeof DEPTH_RENDER_MODES)[number];
export const DepthRenderModeSchema = z.enum(DEPTH_RENDER_MODES);

export const MUSIC_ENERGIES = ["calm", "pulse", "tense", "drop-silence"] as const;
export type MusicEnergy = (typeof MUSIC_ENERGIES)[number];
export const MusicEnergySchema = z.enum(MUSIC_ENERGIES);

export interface DirectorSfxCue {
  cue: string;
  offsetFrame: number;
  volume?: number;
}

export const DirectorSfxCueSchema = z.object({
  cue: z.string().min(1),
  offsetFrame: z.number(),
  volume: z.number().min(0).max(2).optional(),
});

export interface DirectorTableRow {
  label: string;
  value: string;
  delta?: string;
  isFlagged?: boolean;
  isHighlight?: boolean;
}

export const DirectorTableRowSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string().optional(),
  isFlagged: z.boolean().optional(),
  isHighlight: z.boolean().optional(),
});

export interface DirectorSeriesPoint {
  xLabel: string;
  primary: number;
  secondary?: number;
  unit?: string;
  isThreshold?: boolean;
}

export const DirectorSeriesPointSchema = z.object({
  xLabel: z.string(),
  primary: z.number(),
  secondary: z.number().optional(),
  unit: z.string().optional(),
  isThreshold: z.boolean().optional(),
});

export interface DirectorExhibitData {
  exhibitCode?: string;
  filingTitle?: string;
  statuteOrDocket?: string;
  highlightedClause?: string;
  stampLabel?: string;
  effectiveDate?: string;
}

export const DirectorExhibitDataSchema = z.object({
  exhibitCode: z.string().optional(),
  filingTitle: z.string().optional(),
  statuteOrDocket: z.string().optional(),
  highlightedClause: z.string().optional(),
  stampLabel: z.string().optional(),
  effectiveDate: z.string().optional(),
});

export interface DepthSandwichConfig {
  enabled?: boolean;
  mode?: DepthRenderMode;
  renderPass?: DepthRenderMode;
  preset?: string;
  heroFigure?: string;
  eyebrow?: string;
  sublabel?: string;
  foregroundGlass?: boolean;
}

export const DepthSandwichConfigSchema = z.object({
  enabled: z.boolean().optional(),
  mode: DepthRenderModeSchema.optional(),
  renderPass: DepthRenderModeSchema.optional(),
  preset: z.string().optional(),
  heroFigure: z.string().optional(),
  eyebrow: z.string().optional(),
  sublabel: z.string().optional(),
  foregroundGlass: z.boolean().optional(),
});

export type DepthSandwichSpec = boolean | DepthSandwichConfig;
export const DepthSandwichSpecSchema = z.union([z.boolean(), DepthSandwichConfigSchema]);

export interface DirectorSubBeat {
  index?: number;
  offsetFrame: number;
  endOffsetFrame?: number;
  action?: string;
  label?: string;
}

export const DirectorSubBeatSchema = z.object({
  index: z.number().int().optional(),
  offsetFrame: z.number(),
  endOffsetFrame: z.number().optional(),
  action: z.string().optional(),
  label: z.string().optional(),
});

export const DirectorTimedWordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number().optional(),
  startFrame: z.number().optional(),
  endFrame: z.number().optional(),
  startSec: z.number().optional(),
  endSec: z.number().optional(),
  syllables: z.number().optional(),
  pauseAfterFrames: z.number().optional(),
  isNumeric: z.boolean().optional(),
  isEmphasis: z.boolean().optional(),
});

export interface DirectorBeatDataPayload {
  primaryMetric?: string;
  secondaryMetric?: string;
  deltaLabel?: string;
  tableRows?: DirectorTableRow[];
  seriesData?: DirectorSeriesPoint[];
  exhibitData?: DirectorExhibitData;
  geoQuery?: string;
  setPieceId?: string;
  propIds?: string[];
  continuityStage?: string;
  depthSandwich?: DepthSandwichSpec;
  layering?: string;
  [key: string]: unknown;
}

export const DirectorBeatDataPayloadSchema = z
  .object({
    primaryMetric: z.string().optional(),
    secondaryMetric: z.string().optional(),
    deltaLabel: z.string().optional(),
    tableRows: z.array(DirectorTableRowSchema).optional(),
    seriesData: z.array(DirectorSeriesPointSchema).optional(),
    exhibitData: DirectorExhibitDataSchema.optional(),
    geoQuery: z.string().optional(),
    setPieceId: z.string().optional(),
    propIds: z.array(z.string()).optional(),
    continuityStage: z.string().optional(),
    depthSandwich: DepthSandwichSpecSchema.optional(),
    layering: z.string().optional(),
  })
  .catchall(z.unknown());

export interface DirectorBeat {
  id: string;
  startFrame: number;
  endFrame: number;
  durationSec: number;
  category: BeatCategory;
  spokenText: string;
  framing: CameraFraming;
  paletteMode?: PaletteMode;
  styleFamily: StyleEngineFamily;
  componentHint: string;
  motionAction: string;
  glassPreset?: GlassPreset;
  typographyMode?: string;
  sfxCues: Array<{ cue: string; offsetFrame: number; volume?: number }>;
  musicEnergy: MusicEnergy;
  cutReason: string;
  sourceCitation?: string;

  // Extended Grand Unification Cinema Fields (100% Optional & Backward-Compatible)
  recipeId?: string;
  styleWorld?: StyleWorldId;
  register?: CinemaRegister | (string & {});
  visualRegister?: string;
  glassRig?: string;
  depthSandwich?: DepthSandwichSpec;
  depthMode?: DepthRenderMode;
  layering?: "standard" | "behind-presenter" | "depth-sandwich" | (string & {});
  personAlphaSrc?: string;
  personMaskSrc?: string;
  arollSrc?: string;
  setPieceId?: string;
  setPieceSlug?: string;
  sceneBlueprint?: SceneBlueprint | string;
  propIds?: string[];
  mapTarget?: GeoQueryTarget;
  geoQuery?: string;
  geoCorridor?: string;
  mapRegion?: "us" | "usa" | "world";
  highlightLabel?: string;
  tableRows?: DirectorTableRow[];
  seriesData?: DirectorSeriesPoint[];
  exhibitData?: DirectorExhibitData;
  timedWords?: TimedWord[];
  continuityEntityId?: string;
  continuityEntities?: string[];
  lutId?: string;
  musicStemId?: string;
  musicTrackId?: string;
  cameraAction?: string;
  cameraTrajectory?: string;
  title?: string;
  headline?: string;
  headlineLabel?: string;
  subtitle?: string;
  text?: string;
  gluedSpokenText?: string;
  subBeats?: DirectorSubBeat[];
  data?: DirectorBeatDataPayload;
}

export const DirectorMapTargetSchema = z
  .object({
    corridorId: z.string().optional(),
    query: z.string().optional(),
    label: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    spokenText: z.string().optional(),
    region: z.enum(["us", "usa", "world"]).optional(),
    sourceNote: z.string().optional(),
  })
  .catchall(z.unknown());

export const DirectorBeatSchema = z
  .object({
    id: z.string().min(1),
    startFrame: z.number(),
    endFrame: z.number(),
    durationSec: z.number(),
    category: BeatCategorySchema,
    spokenText: z.string(),
    framing: CameraFramingSchema,
    paletteMode: PaletteModeSchema.optional(),
    styleFamily: StyleEngineFamilySchema,
    componentHint: z.string().min(1),
    motionAction: z.string(),
    glassPreset: GlassPresetSchema.optional(),
    typographyMode: z.string().optional(),
    sfxCues: z.array(DirectorSfxCueSchema),
    musicEnergy: MusicEnergySchema,
    cutReason: z.string(),
    sourceCitation: z.string().optional(),

    // Extended Cinema Fields
    recipeId: z.string().optional(),
    styleWorld: StyleWorldIdSchema.optional(),
    register: z.string().optional(),
    visualRegister: z.string().optional(),
    glassRig: z.string().optional(),
    depthSandwich: DepthSandwichSpecSchema.optional(),
    depthMode: DepthRenderModeSchema.optional(),
    layering: z.string().optional(),
    personAlphaSrc: z.string().optional(),
    personMaskSrc: z.string().optional(),
    arollSrc: z.string().optional(),
    setPieceId: z.string().optional(),
    setPieceSlug: z.string().optional(),
    sceneBlueprint: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
    propIds: z.array(z.string()).optional(),
    mapTarget: DirectorMapTargetSchema.optional(),
    geoQuery: z.string().optional(),
    geoCorridor: z.string().optional(),
    mapRegion: z.enum(["us", "usa", "world"]).optional(),
    highlightLabel: z.string().optional(),
    tableRows: z.array(DirectorTableRowSchema).optional(),
    seriesData: z.array(DirectorSeriesPointSchema).optional(),
    exhibitData: DirectorExhibitDataSchema.optional(),
    timedWords: z.array(DirectorTimedWordSchema).optional(),
    continuityEntityId: z.string().optional(),
    continuityEntities: z.array(z.string()).optional(),
    lutId: z.string().optional(),
    musicStemId: z.string().optional(),
    musicTrackId: z.string().optional(),
    cameraAction: z.string().optional(),
    cameraTrajectory: z.string().optional(),
    title: z.string().optional(),
    headline: z.string().optional(),
    subtitle: z.string().optional(),
    text: z.string().optional(),
    gluedSpokenText: z.string().optional(),
    subBeats: z.array(DirectorSubBeatSchema).optional(),
    data: DirectorBeatDataPayloadSchema.optional(),
  })
  .catchall(z.unknown());

export interface DirectorAudit {
  avgShotDurationSec: number;
  styleDiversityScore: number;
  repetitionWarnings: string[];
  heroPeakPercent: number;
  talkingHeadSharePercent: number;
  uniqueStyleWorlds?: number;
  uniqueRecipesUsed?: number;
  uniqueTypographyModes?: number;
  setPieceCount?: number;
  depthSandwichCount?: number;
  strategyId?: string;
}

export const DirectorAuditSchema = z.object({
  avgShotDurationSec: z.number(),
  styleDiversityScore: z.number(),
  repetitionWarnings: z.array(z.string()),
  heroPeakPercent: z.number(),
  talkingHeadSharePercent: z.number(),
  uniqueStyleWorlds: z.number().int().optional(),
  uniqueRecipesUsed: z.number().int().optional(),
  uniqueTypographyModes: z.number().int().optional(),
  setPieceCount: z.number().int().optional(),
  depthSandwichCount: z.number().int().optional(),
  strategyId: z.string().optional(),
});

export interface DirectorPlan {
  title: string;
  fps: number;
  totalFrames: number;
  beats: DirectorBeat[];
  audit: DirectorAudit;
  episodeNumber?: number;
  episodeCode?: string;
  strategyId?: string;
  lutId?: string;
  musicStem?: string;
  musicStemId?: string;
  musicStems?: string[];
  depthSandwichDualPass?: boolean;
}

export const DirectorPlanSchema = z
  .object({
    title: z.string(),
    fps: z.number().positive(),
    totalFrames: z.number().min(0),
    beats: z.array(DirectorBeatSchema),
    audit: DirectorAuditSchema,
    episodeNumber: z.number().int().min(1).optional(),
    episodeCode: z.string().optional(),
    strategyId: z.string().optional(),
    lutId: z.string().optional(),
    musicStem: z.string().optional(),
    musicStemId: z.string().optional(),
    musicStems: z.array(z.string()).optional(),
    depthSandwichDualPass: z.boolean().optional(),
  })
  .catchall(z.unknown());

export interface TranscriptSegment {
  id?: string;
  text: string;
  startSec: number;
  endSec: number;
  sourceCitation?: string;
  paragraphIndex?: number;
  timedWords?: TimedWord[];
}

export const TranscriptSegmentSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  startSec: z.number(),
  endSec: z.number(),
  sourceCitation: z.string().optional(),
  paragraphIndex: z.number().int().optional(),
  timedWords: z.array(DirectorTimedWordSchema).optional(),
});

export interface DirectorOptions {
  title?: string;
  fps?: number;
  wpm?: number;
  targetTalkingHeadShare?: number;
  heroStartPct?: number;
  heroEndPct?: number;
  episodeNumber?: number;
  strategyId?: string;
  enableDepthSandwich?: boolean;
  lutId?: string;
  musicStemId?: string;
  vaultStyleWeights?: Readonly<Record<string, number>>;
  vaultGlassWeights?: Readonly<Record<string, number>>;
  vaultTypographyWeights?: Readonly<Record<string, number>>;
  reservedSetPieces?: readonly string[];
}

export const DirectorOptionsSchema = z.object({
  title: z.string().optional(),
  fps: z.number().positive().optional(),
  wpm: z.number().positive().optional(),
  targetTalkingHeadShare: z.number().min(0).max(1).optional(),
  heroStartPct: z.number().min(0).max(1).optional(),
  heroEndPct: z.number().min(0).max(1).optional(),
  episodeNumber: z.number().int().min(1).optional(),
  strategyId: z.string().optional(),
  enableDepthSandwich: z.boolean().optional(),
  lutId: z.string().optional(),
  musicStemId: z.string().optional(),
  vaultStyleWeights: z.record(z.string(), z.number()).optional(),
  vaultGlassWeights: z.record(z.string(), z.number()).optional(),
  vaultTypographyWeights: z.record(z.string(), z.number()).optional(),
  reservedSetPieces: z.array(z.string()).optional(),
});

export interface StyleRecipe {
  id: string;
  styleFamily: StyleEngineFamily;
  componentHint: string;
  framing: CameraFraming;
  motionAction: string;
  glassPreset?: GlassPreset;
  typographyMode?: string;
  defaultSfx: string;
  secondarySfx?: string;
  paceProfile: "snappy" | "balanced" | "calm-hold";
  peakOnly?: boolean;
  styleWorld?: StyleWorldId;
  register?: CinemaRegister;
  glassRig?: GlassPreset;
  depthSandwichEligible?: boolean;
  setPieceId?: string;
}

export const StyleRecipeSchema = z.object({
  id: z.string().min(1),
  styleFamily: StyleEngineFamilySchema,
  componentHint: z.string().min(1),
  framing: CameraFramingSchema,
  motionAction: z.string().min(1),
  glassPreset: GlassPresetSchema.optional(),
  typographyMode: z.string().optional(),
  defaultSfx: z.string().min(1),
  secondarySfx: z.string().optional(),
  paceProfile: z.enum(["snappy", "balanced", "calm-hold"]),
  peakOnly: z.boolean().optional(),
  styleWorld: StyleWorldIdSchema.optional(),
  register: CinemaRegisterSchema.optional(),
  glassRig: GlassPresetSchema.optional(),
  depthSandwichEligible: z.boolean().optional(),
  setPieceId: z.string().optional(),
});

export function parseDirectorBeat(raw: unknown): DirectorBeat {
  return DirectorBeatSchema.parse(raw) as unknown as DirectorBeat;
}

export function parseDirectorPlan(raw: unknown): DirectorPlan {
  return DirectorPlanSchema.parse(raw) as unknown as DirectorPlan;
}
