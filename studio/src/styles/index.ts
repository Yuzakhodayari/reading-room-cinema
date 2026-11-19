import React from "react";
import { z } from "zod";
import {
  GLASS_PRESET_IDS,
  GLASS_PRESET_REGISTRY,
  GlassBottomDock,
  GlassCard,
  GlassCompareScale,
  GlassCornerPill,
  GlassDossierStack,
  GlassEvidenceRail,
  GlassFloatingToolbar,
  GlassMagnifierCard,
  GlassMapCallout,
  GlassPresetId,
  GlassQuoteCitation,
  GlassReceiptTicker,
  GlassSplitModal,
  GlassStatTriptych,
  GlassTelemetryStrip,
  GlassTerminalConsole,
  GlassTimelineScrubber,
  GlassToastAlert,
  GlassVerdictSeal,
} from "../components/glass/LiquidGlassPresets";
import { PresenterDepthStage } from "../components/glass/PresenterDepthStage";
import { TreasuryOverlayCard } from "../compositions/TreasuryOverlayCard";
import { TreasuryTable9Scene } from "../compositions/TreasuryTable9Scene";
import { RegisterId } from "../design/tokens";
import {
  CameraFraming,
  DirectorExhibitData,
  DirectorSeriesPoint,
  DirectorTableRow,
  StyleEngineFamily,
  StyleRecipe,
} from "../director/schema";
import { BlueprintThemeRegister } from "../generative/blueprintTypes";
import { IsometricDiorama3D } from "../generative/IsometricDiorama3D";
import { SceneBlueprintRenderer } from "../generative/SceneBlueprintRenderer";
import { CorridorId, resolveGeoQuery } from "../maps";
import { DataTicker } from "../typography/DataTicker";
import { EditorialHeadline } from "../typography/EditorialHeadline";
import { isTypographyMode, KineticText, KineticTextMode } from "../typography/KineticText";
import {
  BlobSimulation,
  CorridorArcMatrixCard,
  CorridorLedgerMetric,
  DATA_MAPS_3D_STYLES,
  DataPhysicalCard,
  IsometricModelBlock,
  IsometricStrataCutaway3D,
  MapExplainer,
  PhysicalColumnSpec,
  StrataLayerSpec,
  WhiteModel3D,
} from "./dataMaps3D";
import {
  CollageCutout as DiagramCollageCutout,
  DIAGRAM_METAPHOR_STYLES,
  InstructionManualCard,
  IsometricScene,
  ManualStepItem,
  PatentCalloutPart,
  PatentExplodedDiagram,
  StickerCutout,
  StickFigureStage,
} from "./diagramMetaphor";
import {
  ArchiveLightTable,
  BreakingBanner,
  CaptionNewsCard,
  CitySymphonyFrame,
  DOC_BROADCAST_STYLES,
  DataCalloutLowerThird,
  KinoMontageStrip,
  LiveCountdownSplit,
  NewsPackageLowerThird,
  QuoteHighlightCard,
  SplitScreenFrame,
  TelestratorOverlay,
  VisualInvestigationBoard,
} from "./docBroadcast";
import {
  AchAutopayDraftReceipt,
  AntitrustMarketExhibit,
  ArchivalRationBook1941,
  BankCallReportTAccount,
  BaseForensicProps,
  BdcPikScheduleExhibit,
  ClaimVsRealityCollision,
  CongressionalHearingSlate,
  CreditRatingDowngradeMemo,
  EscapeHatchSwitchboard,
  EvidenceCorkboardChronology,
  FORENSIC_EXHIBIT_STYLES,
  FannieMaeCovenantExhibit,
  FiscalLedgerRow,
  FiscalLedgerTableStage,
  FoiaRedactionDeclassify,
  InsuranceRateHikeNotice,
  IrsForm941FicaSplit,
  PatentFiling1910Stage,
  RedlineContractDiffStage,
  Sec10KFootnoteStretch,
  SpvCircularFlowSheet,
  StatutoryClauseHighlighter,
  SubseaSabotageIncidentLog,
  SupremeCourtSyllabusStage,
  TreasuryTicLedgerExhibit,
  VetoPenBudgetLedger,
} from "./forensicExhibits";
import {
  AuctionPriceShockwave,
  AuctionStepDatum,
  BandwidthConcentrationBar,
  BaseTelemetryProps,
  CapexVsDepreciationGap,
  CostExchangeRatioBar,
  DebtDeflationJaws1933,
  DemographicCliffPyramid,
  DivergingJawsChart,
  EscrowShockBreakdown,
  ForeignHolderRollover,
  GenerationalHorizonRule,
  GoldVsFiatFedCorridor,
  JevonsDeflationCurve,
  MACRO_TELEMETRY_STYLES,
  MarginBidComparison,
  MineralRefiningDominance,
  NegativeFcfWaterfall,
  RealVsNominalShrink,
  ReserveAttestationBar,
  SovereignSpreadFlip,
  StackedShareShift,
  TrustFundDepletionCurve,
  WaitlistQueueHistogram,
  WealthDecileMonoliths,
} from "./macroTelemetry";
import {
  AsymmetricExchangeSimulator,
  CantileverBalanceScale,
  CircularAccountingLoop,
  ContainerChokepointLock,
  DemographicDependencyPyramid,
  DualTaxPlumbingSchematic,
  EscapementRatchetPawn,
  EurodollarOffshoreFunnel,
  FlywheelMomentumClutch,
  GridFrequencyDroopGovernor,
  HydraulicSiphonValve,
  InsuranceRiskPoolOverflow,
  LithographyNodeLock,
  LogarithmicWattageLadder,
  MarginCallDominoCascade,
  MineralRefiningBottleneck,
  MunicipalBondTollgate,
  PaloAltoWhiteboardFlip,
  SYSTEM_SIMULATOR_STYLES,
  SimulatorBaseProps,
  SovereignPrioritySpillway,
  SplitEraStrikeDiptych,
  StrategicReserveCaverns,
  SubseaCableCrossSection,
  SupplyChainBomStrip,
  TransformerQueueBottleneck,
  VelocityMismatchChronometer,
  WaterCoolingEvaporationTower,
} from "./systemSimulators";
import {
  AlgorithmicCreditScoreDrop,
  AutomatedCobraSeveranceForm,
  BuyNowPayLaterMicroLedger,
  CaptivePartnerCatalogGrid,
  CivicDossierRedactionPlate,
  ClosedComputeScripWallet,
  CoalScripVsDigitalYuan,
  CompanyTownStoreLedger,
  DynamicSurgeMeterTag,
  ExpirationCountdownToast,
  FourEscapeHatchesBoard,
  FountainPenVetoSlash,
  GeoFencedSpendMapCard,
  HingedBrassJawCutout,
  LongitudinalHouseholdDossier,
  PerishableSeatVsComputeSplit,
  ProgrammableRuleBuilderUI,
  RefinanceDenialModal,
  RoofDroneEscrowShock,
  SatireLineItem,
  SubscriptionTrapStack,
  TermsOfServiceScrollTrap,
  ThermalReceiptInflationRoll,
  UI_SATIRE_COLLAGE_STYLES,
  UiSatireBaseProps,
  UnwrittenTruceToAllowance,
  ViewerGameQuizCard,
} from "./uiSatireAndCollage";
import {
  BrettonWoodsCable,
  BroadsheetFrontpage,
  CollageCutout,
  CompanyScripVoucher,
  DepressionLedger1930s,
  LedgerLine1930,
  MicroficheReaderStage,
  Newsreel1920s,
  SilentFilmCard,
  SpyTitleSequence,
  StainedGlassFrame,
  VINTAGE_EDITORIAL_STYLES,
} from "./vintageEditorial";

// Collision-free re-exports across all 8 style modules
export * from "./docBroadcast";
export * from "./vintageEditorial";
export * from "./macroTelemetry";
export * from "./forensicExhibits";
export * from "./dataMaps3D";
export * from "./systemSimulators";
export * from "./uiSatireAndCollage";
export {
  DIAGRAM_METAPHOR_STYLES,
  CollageCutout as DiagramCollageCutout,
  InstructionManualCard,
  IsometricScene,
  PatentExplodedDiagram,
  StickFigureStage,
  StickerCutout,
} from "./diagramMetaphor";
export type {
  CollageCutoutProps as DiagramCollageCutoutProps,
  DiagramDisplayMode,
  DiagramMetaphorRecipe,
  InstructionManualCardProps,
  IsometricSceneProps,
  ManualStepItem,
  PatentCalloutPart,
  PatentExplodedDiagramProps,
  StickerCutoutProps,
  StickFigureStageProps,
  StickPose,
} from "./diagramMetaphor";

// ============================================================================
// 1. Ten Named Style Worlds & Legacy 24-Recipe Backward Compatibility Contract
// ============================================================================

export const STYLE_WORLDS = [
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

export type StyleWorldId = (typeof STYLE_WORLDS)[number];
export const StyleWorldIdSchema = z.enum(STYLE_WORLDS);

export const STYLE_RECIPE_DOMAIN_TAGS = [
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

export type StyleRecipeDomainTag = (typeof STYLE_RECIPE_DOMAIN_TAGS)[number];

export type StyleRecipeEmotionalBeat =
  | "clinical-evidence"
  | "tension-build"
  | "hard-reveal"
  | "human-stakes"
  | "ironic-contrast"
  | "thesis-verdict";

export type StyleRecipeVisualWeight = "light" | "medium" | "heavy" | "showstopper";

export interface StyleWorldDescriptor {
  id: StyleWorldId;
  label: string;
  legacyStyleFamily: StyleEngineFamily;
  defaultRegister: RegisterId | "over_footage";
  defaultPaletteMode: "page" | "over-footage";
  description: string;
}

export const STYLE_WORLD_METADATA: Readonly<Record<StyleWorldId, StyleWorldDescriptor>> = {
  "liquid-glass": {
    id: "liquid-glass",
    label: "Smoked-Navy Apple Liquid Glass",
    legacyStyleFamily: "liquid-glass",
    defaultRegister: "over_footage",
    defaultPaletteMode: "over-footage",
    description: "Over-footage optical refraction cards, docks, magnifiers, and telemetry ribbons.",
  },
  "doc-broadcast": {
    id: "doc-broadcast",
    label: "Documentary Broadcast & Investigation",
    legacyStyleFamily: "doc-broadcast",
    defaultRegister: "page_editorial",
    defaultPaletteMode: "page",
    description: "Investigative evidence desks, contact light tables, telestrators, and broadcast slates.",
  },
  "vintage-editorial": {
    id: "vintage-editorial",
    label: "Vintage Archival & Historical Press",
    legacyStyleFamily: "vintage-editorial",
    defaultRegister: "archival_parchment",
    defaultPaletteMode: "page",
    description: "1912–1971 silver-nitrate newsreels, double-entry cotton ledgers, scrip vouchers, and microfiche.",
  },
  "macro-telemetry": {
    id: "macro-telemetry",
    label: "Institutional Macro & Quantitative Telemetry",
    legacyStyleFamily: "data-maps-3d",
    defaultRegister: "midnight_telemetry",
    defaultPaletteMode: "page",
    description: "FT/Bloomberg/Boyle precision quantitative charts, waterfalls, pyramids, and spread inversions.",
  },
  "forensic-exhibits": {
    id: "forensic-exhibits",
    label: "Primary-Source Legal & Statutory Exhibits",
    legacyStyleFamily: "doc-broadcast",
    defaultRegister: "archival_parchment",
    defaultPaletteMode: "page",
    description: "SEC 10-K footnotes, Supreme Court syllabi, IRS Form 941 splits, FOIA unseals, and Treasury ledgers.",
  },
  "diagram-metaphor": {
    id: "diagram-metaphor",
    label: "Architectural Diagram & Tactile Metaphor",
    legacyStyleFamily: "diagram-metaphor",
    defaultRegister: "page_editorial",
    defaultPaletteMode: "page",
    description: "IKEA assembly schematics, exploded U.S. patent blueprints, isometric grids, and articulated figures.",
  },
  "data-maps-3d": {
    id: "data-maps-3d",
    label: "Cartographic Atlas & Isometric 3D Strata",
    legacyStyleFamily: "data-maps-3d",
    defaultRegister: "page_editorial",
    defaultPaletteMode: "page",
    description: "Offline 208-country / 51-state D3 cartography, chokepoint corridors, and isometric massing.",
  },
  "system-simulators": {
    id: "system-simulators",
    label: "Mechanical & Hydraulic System Simulators",
    legacyStyleFamily: "diagram-metaphor",
    defaultRegister: "drafting_blueprint",
    defaultPaletteMode: "page",
    description: "Tax-plumbing guillotines, sovereign spillways, circular SPV loops, and grid droop governors.",
  },
  "ui-satire-collage": {
    id: "ui-satire-collage",
    label: "Household Balance-Sheet & Programmable UI Satire",
    legacyStyleFamily: "vintage-editorial",
    defaultRegister: "page_editorial",
    defaultPaletteMode: "page",
    description: "Claire's longitudinal Austin dossier, scrip wallets, thermal inflation rolls, and DTI denial modals.",
  },
  "generative-setpiece": {
    id: "generative-setpiece",
    label: "Declarative Physics & 3D Set-Piece Stages",
    legacyStyleFamily: "diagram-metaphor",
    defaultRegister: "page_editorial",
    defaultPaletteMode: "page",
    description: "Zero-coordinate spatial solver + 2D physics contraptions, 3D dioramas, and 5-plane depth stages.",
  },
};

/**
 * Exact 24 original commit `534d89a` style IDs from `studio/src/director/planner.ts`.
 * 100% guaranteed to resolve in `STYLE_RECIPE_BY_ID`, `resolveStyleRecipe()`, and `renderStyleRecipe()`.
 */
export const LEGACY_24_STYLE_IDS = [
  "liquid-glass-card",
  "liquid-glass-dock",
  "liquid-glass-toast",
  "doc-news-package",
  "doc-caption-news",
  "doc-visual-investigation",
  "doc-archive-light-table",
  "doc-live-countdown-split",
  "doc-telestrator",
  "doc-kino-montage",
  "doc-city-symphony",
  "vintage-newsreel",
  "vintage-silent-film",
  "vintage-collage",
  "vintage-spy-titles",
  "vintage-stained-glass",
  "diagram-sticker",
  "diagram-stick-figure",
  "diagram-instruction-manual",
  "diagram-isometric",
  "data-map-explainer",
  "data-physical-card",
  "data-white-model-3d",
  "data-blob-simulation",
] as const;

export type Legacy24StyleId = (typeof LEGACY_24_STYLE_IDS)[number];

export interface StyleRecipeRenderProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  headline?: string;
  body?: string;
  metric?: string;
  secondaryMetric?: string;
  delta?: string;
  sourceCitation?: string;
  paletteMode?: "page" | "over-footage";
  atFrame?: number;
  duration?: number;
  enableSfx?: boolean;
  blueprintId?: string;
  corridorId?: CorridorId;
  geoQuery?: string;
  spokenText?: string;
  register?: RegisterId | (string & {});
  propIds?: string[];
  tableRows?: DirectorTableRow[];
  seriesData?: DirectorSeriesPoint[];
  exhibitData?: DirectorExhibitData;
  data?: Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
}

export interface UnifiedStyleRecipe {
  id: string;
  name: string;
  styleWorld: StyleWorldId;
  legacyStyleFamily: StyleEngineFamily;
  componentName: string;
  defaultFraming: CameraFraming;
  defaultPaletteMode: "page" | "over-footage";
  motionAction: string;
  typographyMode: string;
  defaultSfx: string;
  secondarySfx?: string;
  paceProfile: "snappy" | "balanced" | "calm-hold";
  domainTags: readonly StyleRecipeDomainTag[];
  emotionalBeat: StyleRecipeEmotionalBeat;
  visualWeight: StyleRecipeVisualWeight;
  description: string;
  aliases: readonly string[];
  isLegacy24: boolean;
  peakOnly?: boolean;
  glassPresetId?: GlassPresetId;
  render: (props?: StyleRecipeRenderProps) => React.ReactElement;
}

// ============================================================================
// 2. Strongly-Typed Zero-`any` Renderers Across All 10 Style Worlds
// ============================================================================

function inferDomainTagsFromText(
  id: string,
  name: string,
  desc: string,
  fallback: StyleRecipeDomainTag
): readonly StyleRecipeDomainTag[] {
  const hay = `${id} ${name} ${desc}`.toLowerCase();
  const out: StyleRecipeDomainTag[] = [];
  const pushUnique = (tag: StyleRecipeDomainTag) => {
    if (out.indexOf(tag) === -1) out.push(tag);
  };

  if (/treasury|debt|bond|fiscal|tax|yield|spread|deficit|budget|rollover|oasi|trust-fund|credit|pik|fcf|capex| eurodollar|gold|fiat/.test(hay)) {
    pushUnique("fiscal");
  }
  if (/ai|gpu|compute|token|cloud|server|euv|lithography|fab|spv|jevons|agent|algorithm/.test(hay)) {
    pushUnique("ai-compute");
  }
  if (/grid|watt|power|transformer|frequency|droop|60hz|cooling|aquifer|mineral|refining|pjm|surge|kwh|mwh/.test(hay)) {
    pushUnique("energy-grid");
  }
  if (/wage|payroll|w-2|fica|labor|strike|pier|port|worker|severance|cobra|unwritten-truce|headcount/.test(hay)) {
    pushUnique("labor");
  }
  if (/court|syllabus|statutory|statute|clause|veto|foia|sec|10-k|covenant|antitrust|terms-of-service|redline|hearing|patent/.test(hay)) {
    pushUnique("legal");
  }
  if (/corridor|map|subsea|cable|naval|carrier|drone|chokepoint|canal|sabotage|strait|foreign|tic|reserve-caverns/.test(hay)) {
    pushUnique("geopolitics");
  }
  if (/household|claire|mortgage|escrow|insurance|ach|autopay|scrip|allowance|receipt|bnpl|refinance|demographic|expiration/.test(hay)) {
    pushUnique("household");
  }
  if (/1910|1912|1920|1930|1933|1941|1944|1955|1971|vintage|newsreel|silent-film|archival|microfiche|broadsheet|bretton|ration/.test(hay)) {
    pushUnique("history");
  }
  if (/satire|jaw|quiz|sticker|stick-figure|toast|trap|meme|collage/.test(hay)) {
    pushUnique("comedy-gag");
  }

  if (out.length === 0) {
    out.push(fallback);
  }
  return out;
}

function isPlainRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function readDataRecord(p?: StyleRecipeRenderProps): Record<string, unknown> | undefined {
  return isPlainRecord(p?.data) ? p.data : undefined;
}

function readStr(rec: Record<string, unknown> | undefined, key: string): string | undefined {
  if (!rec) return undefined;
  const v = rec[key];
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

function readNum(rec: Record<string, unknown> | undefined, key: string): number | undefined {
  if (!rec) return undefined;
  const v = rec[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function readStrArray(rec: Record<string, unknown> | undefined, key: string): string[] | undefined {
  if (!rec) return undefined;
  const v = rec[key];
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return out.length > 0 ? out : undefined;
}

function readNumArray(rec: Record<string, unknown> | undefined, key: string): number[] | undefined {
  if (!rec) return undefined;
  const v = rec[key];
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
  return out.length > 0 ? out : undefined;
}

function readTableRows(p?: StyleRecipeRenderProps): DirectorTableRow[] | undefined {
  const raw = Array.isArray(p?.tableRows)
    ? p.tableRows
    : Array.isArray(p?.data?.tableRows)
      ? p.data.tableRows
      : undefined;
  if (!raw || raw.length === 0) return undefined;
  const out: DirectorTableRow[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (isPlainRecord(item) && typeof item.label === "string" && typeof item.value === "string") {
      out.push({
        label: item.label,
        value: item.value,
        ...(typeof item.delta === "string" ? { delta: item.delta } : {}),
        ...(typeof item.isFlagged === "boolean" ? { isFlagged: item.isFlagged } : {}),
        ...(typeof item.isHighlight === "boolean" ? { isHighlight: item.isHighlight } : {}),
      });
    }
  }
  return out.length > 0 ? out : undefined;
}

function readSeriesData(p?: StyleRecipeRenderProps): DirectorSeriesPoint[] | undefined {
  const raw = Array.isArray(p?.seriesData)
    ? p.seriesData
    : Array.isArray(p?.data?.seriesData)
      ? p.data.seriesData
      : undefined;
  if (!raw || raw.length === 0) return undefined;
  const out: DirectorSeriesPoint[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (
      isPlainRecord(item) &&
      typeof item.xLabel === "string" &&
      typeof item.primary === "number" &&
      Number.isFinite(item.primary)
    ) {
      out.push({
        xLabel: item.xLabel,
        primary: item.primary,
        ...(typeof item.secondary === "number" && Number.isFinite(item.secondary)
          ? { secondary: item.secondary }
          : {}),
        ...(typeof item.unit === "string" ? { unit: item.unit } : {}),
        ...(typeof item.isThreshold === "boolean" ? { isThreshold: item.isThreshold } : {}),
      });
    }
  }
  return out.length > 0 ? out : undefined;
}

function readExhibitData(p?: StyleRecipeRenderProps): DirectorExhibitData | undefined {
  const raw = isPlainRecord(p?.exhibitData)
    ? p.exhibitData
    : isPlainRecord(p?.data?.exhibitData)
      ? p.data.exhibitData
      : undefined;
  if (!raw) return undefined;
  return {
    ...(typeof raw.exhibitCode === "string" ? { exhibitCode: raw.exhibitCode } : {}),
    ...(typeof raw.filingTitle === "string" ? { filingTitle: raw.filingTitle } : {}),
    ...(typeof raw.statuteOrDocket === "string" ? { statuteOrDocket: raw.statuteOrDocket } : {}),
    ...(typeof raw.highlightedClause === "string" ? { highlightedClause: raw.highlightedClause } : {}),
    ...(typeof raw.stampLabel === "string" ? { stampLabel: raw.stampLabel } : {}),
    ...(typeof raw.effectiveDate === "string" ? { effectiveDate: raw.effectiveDate } : {}),
  };
}

function resolveValidRegisterId(raw?: string): RegisterId | undefined {
  if (!raw) return undefined;
  const norm = raw.trim().toLowerCase();
  if (norm === "archival_parchment" || norm === "archival-light-table") return "archival_parchment";
  if (
    norm === "midnight_telemetry" ||
    norm === "geospatial-telemetry" ||
    norm === "investigation-switchboard"
  ) {
    return "midnight_telemetry";
  }
  if (norm === "drafting_blueprint" || norm === "blueprint-schematic") return "drafting_blueprint";
  if (norm === "vintage_newsreel" || norm === "silver-gelatin-chronicle") return "vintage_newsreel";
  if (
    norm === "page_editorial" ||
    norm === "paper_editorial" ||
    norm === "milk-page-editorial" ||
    norm === "restraint-vellum"
  ) {
    return "page_editorial";
  }
  return undefined;
}

function resolveBlueprintRegister(raw?: string): BlueprintThemeRegister | undefined {
  return resolveValidRegisterId(raw);
}

function resolveMetricTuple(p?: StyleRecipeRenderProps): {
  primary: string;
  secondary: string;
  delta?: string;
  hasExplicitPrimary: boolean;
  hasExplicitSecondary: boolean;
} {
  const dataRec = readDataRecord(p);
  const rows = readTableRows(p);
  const rawPrimary = p?.metric ?? readStr(dataRec, "primaryMetric") ?? rows?.[0]?.value;
  const rawSecondary = p?.secondaryMetric ?? readStr(dataRec, "secondaryMetric") ?? rows?.[1]?.value;
  const delta = p?.delta ?? readStr(dataRec, "deltaLabel") ?? rows?.[0]?.delta;
  return {
    primary: rawPrimary ?? "84.1%",
    secondary: rawSecondary ?? "7.1%",
    delta,
    hasExplicitPrimary: Boolean(rawPrimary),
    hasExplicitSecondary: Boolean(rawSecondary),
  };
}

function parseLeadingNum(raw?: string): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/,/g, "");
  const m = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!m) return undefined;
  const val = Number(m[0]);
  return Number.isFinite(val) ? val : undefined;
}

function renderGlassPresetById(
  presetId: GlassPresetId,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const title = p?.title ?? p?.headline ?? "Primary Fiscal Record";
  const sub = p?.subtitle ?? p?.body ?? p?.spokenText ?? "Verified primary-source ledger metric";
  const rows = readTableRows(p);
  const series = readSeriesData(p);
  const exhibit = readExhibitData(p);
  const { primary: metric, secondary: secMetric, delta } = resolveMetricTuple(p);
  const cite = exhibit?.filingTitle ?? p?.sourceCitation ?? "U.S. Treasury Monthly Statement, Table 9";

  const row0 = rows?.[0];
  const row1 = rows?.[1];
  const row2 = rows?.[2];

  switch (presetId) {
    case "card":
      return React.createElement(GlassCard, {
        title,
        badge: p?.eyebrow ?? exhibit?.stampLabel ?? "Key Record",
        subtitle: sub,
        metric: {
          value: metric,
          label: row0?.label ?? "Primary Share",
          delta,
        },
        citation: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "corner-pill":
      return React.createElement(GlassCornerPill, {
        label: title,
        value: metric,
        badge: p?.eyebrow ?? exhibit?.stampLabel ?? "LIVE",
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "bottom-dock":
      return React.createElement(GlassBottomDock, {
        caption: p?.eyebrow ?? "LEDGER SPLIT",
        items: [
          { label: row0?.label ?? title, value: row0?.value ?? metric, active: true },
          { label: row1?.label ?? "Counterpart", value: row1?.value ?? secMetric },
          { label: row2?.label ?? "Source Record", value: row2?.value ?? (delta ?? "Verified") },
        ],
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "floating-toolbar":
      return React.createElement(GlassFloatingToolbar, {
        prefix: p?.eyebrow ?? "ACT",
        items: [
          { tag: "I", label: row0?.label ?? title },
          { tag: "II", label: row1?.label ?? "Mechanism" },
          { tag: "III", label: row2?.label ?? "Verdict" },
        ],
        rightSlot: metric,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "toast-alert":
      return React.createElement(GlassToastAlert, {
        title,
        message: exhibit?.highlightedClause ?? sub,
        variant: "warning",
        tag: p?.eyebrow ?? exhibit?.stampLabel ?? "Risk Flag",
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "split-modal":
      return React.createElement(GlassSplitModal, {
        title,
        eyebrow: p?.eyebrow ?? "Bilateral Comparison",
        left: { label: row0?.label ?? "Baseline", value: row0?.value ?? metric, highlight: true },
        right: { label: row1?.label ?? "Counterpart", value: row1?.value ?? secMetric, isRisk: true },
        footer: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "dossier-stack":
      return React.createElement(GlassDossierStack, {
        heading: p?.eyebrow ?? "Archival Dossier",
        sheets: [
          {
            exhibitCode: exhibit?.exhibitCode ?? "EX-01",
            title: row0?.label ?? title,
            excerpt: exhibit?.highlightedClause ?? sub,
            metricValue: row0?.value ?? metric,
            stamp: exhibit?.stampLabel ?? "VERIFIED",
          },
          {
            exhibitCode: "EX-02",
            title: row1?.label ?? "Counter-Record",
            excerpt: cite,
            metricValue: row1?.value ?? secMetric,
            isRisk: Boolean(row1?.isFlagged ?? true),
          },
        ],
        citation: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "evidence-rail":
      return React.createElement(GlassEvidenceRail, {
        title,
        eyebrow: p?.eyebrow ?? "Evidence Chain",
        nodes: [
          {
            code: "01",
            label: row0?.label ?? "Baseline Lock",
            value: row0?.value ?? metric,
            status: row0?.isFlagged ? "risk" : "verified",
          },
          {
            code: "02",
            label: row1?.label ?? "Structural Shift",
            value: row1?.value ?? secMetric,
            status: "risk",
          },
          {
            code: "03",
            label: row2?.label ?? "Primary Source",
            detail: row2?.value ?? cite,
            status: "verified",
          },
        ],
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "magnifier-card":
      return React.createElement(GlassMagnifierCard, {
        title,
        clauseCode: exhibit?.statuteOrDocket ?? exhibit?.exhibitCode ?? p?.eyebrow ?? "STATUTORY ZOOM",
        focusedSnippet: exhibit?.highlightedClause ?? sub,
        citation: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "telemetry-strip":
      return React.createElement(GlassTelemetryStrip, {
        tag: p?.eyebrow ?? "LIVE TELEMETRY",
        channels: [
          { label: row0?.label ?? "Primary", value: row0?.value ?? metric, delta: row0?.delta ?? delta },
          { label: row1?.label ?? "Secondary", value: row1?.value ?? secMetric, isRisk: true },
          { label: row2?.label ?? "Reference", value: row2?.value ?? (exhibit?.effectiveDate ?? cite), isRisk: Boolean(row2?.isFlagged) },
        ],
        sourceTag: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "verdict-seal":
      return React.createElement(GlassVerdictSeal, {
        stampLabel: exhibit?.stampLabel ?? p?.eyebrow ?? "STATUTORY LOCK",
        headline: title,
        docketOrStatute: exhibit?.statuteOrDocket ?? cite,
        impactFigure: metric,
        impactSubtext: exhibit?.highlightedClause ?? sub,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "compare-scale": {
      const wLeft = Math.max(5, Math.abs(series?.[0]?.primary ?? parseLeadingNum(row0?.value ?? metric) ?? 84));
      const wRight = Math.max(5, Math.abs(series?.[1]?.primary ?? parseLeadingNum(row1?.value ?? secMetric) ?? 7));
      return React.createElement(GlassCompareScale, {
        title,
        eyebrow: p?.eyebrow ?? "Asymmetric Scale",
        leftPan: { label: row0?.label ?? "Baseline", displayValue: row0?.value ?? metric, weight: wLeft },
        rightPan: {
          label: row1?.label ?? "Counterpart",
          displayValue: row1?.value ?? secMetric,
          weight: wRight,
          isRisk: true,
        },
        fulcrumLabel: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    }
    case "timeline-scrubber": {
      const milestones =
        series && series.length >= 2
          ? series.slice(0, 4).map((pt, idx) => ({
              year: pt.xLabel,
              label: rows?.[idx]?.label ?? (idx === series.length - 1 ? title : `Stage ${idx + 1}`),
              value: `${pt.primary}${pt.unit ?? ""}`,
              isRisk: Boolean(pt.isThreshold || idx === series.length - 1),
            }))
          : [
              { year: exhibit?.effectiveDate ?? "Baseline", label: row0?.label ?? "Origin", value: row0?.value ?? metric },
              { year: "Shift", label: row1?.label ?? "Transition", value: row1?.value ?? secMetric },
              { year: "Current", label: title, value: metric, isRisk: true },
            ];
      return React.createElement(GlassTimelineScrubber, {
        title: p?.eyebrow ?? "CHRONOLOGY",
        milestones,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    }
    case "receipt-ticker":
      return React.createElement(GlassReceiptTicker, {
        headerTitle: title,
        lines:
          rows && rows.length >= 2
            ? rows.slice(0, 4).map((r, idx) => ({
                label: r.label,
                amount: r.value,
                isDeduction: Boolean(r.isFlagged),
                highlight: idx === 0 || Boolean(r.isHighlight),
              }))
            : [
                { label: row0?.label ?? "Primary Figure", amount: metric, highlight: true },
                { label: row1?.label ?? "Offset", amount: secMetric, isDeduction: true },
                { label: sub, amount: delta ?? metric },
              ],
        totalAmount: metric,
        totalIsRisk: true,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "terminal-console":
      return React.createElement(GlassTerminalConsole, {
        sessionHeader: p?.eyebrow ?? "MACRO FEED // DESK-01",
        rows: [
          {
            tickerOrKey: "PRIMARY",
            field: row0?.label ?? title,
            value: row0?.value ?? metric,
            status: "alert",
          },
          {
            tickerOrKey: "OFFSET",
            field: row1?.label ?? "Counterpart",
            value: row1?.value ?? secMetric,
            status: "nominal",
          },
          { tickerOrKey: "SOURCE", field: "Filing", value: cite, status: "muted" },
        ],
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "map-callout":
      return React.createElement(GlassMapCallout, {
        locationName: p?.geoQuery ? title : title,
        corridorTag: p?.corridorId ?? p?.eyebrow ?? "CORRIDOR TELEMETRY",
        primaryMetric: metric,
        summary: sub,
        isChokepointAlert: true,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "stat-triptych":
      return React.createElement(GlassStatTriptych, {
        eyebrow: p?.eyebrow ?? "PRIMARY LEDGER",
        title,
        stats: [
          {
            label: row0?.label ?? "Primary",
            value: row0?.value ?? metric,
            delta: row0?.delta ?? delta,
            isRisk: true,
          },
          {
            label: row1?.label ?? "Counterpart",
            value: row1?.value ?? secMetric,
            delta: row1?.delta,
          },
          {
            label: row2?.label ?? "Context",
            value: row2?.value ?? (exhibit?.effectiveDate ?? "Verified"),
            delta: row2?.delta,
            isRisk: Boolean(row2?.isFlagged),
          },
        ],
        citation: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "quote-citation":
      return React.createElement(GlassQuoteCitation, {
        quote: exhibit?.highlightedClause ?? sub,
        author: title,
        roleOrSource: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
  }
}

const MACRO_COMPONENT_BY_NAME: Readonly<
  Record<string, React.ComponentType<BaseTelemetryProps>>
> = {
  DivergingJawsChart,
  NegativeFcfWaterfall,
  WealthDecileMonoliths,
  AuctionPriceShockwave,
  JevonsDeflationCurve,
  SovereignSpreadFlip,
  DebtDeflationJaws1933,
  GoldVsFiatFedCorridor,
  GenerationalHorizonRule,
  StackedShareShift,
  CapexVsDepreciationGap,
  ForeignHolderRollover,
  ReserveAttestationBar,
  TrustFundDepletionCurve,
  DemographicCliffPyramid,
  CostExchangeRatioBar,
  BandwidthConcentrationBar,
  EscrowShockBreakdown,
  MineralRefiningDominance,
  WaitlistQueueHistogram,
  RealVsNominalShrink,
  MarginBidComparison,
};

const FORENSIC_COMPONENT_BY_NAME: Readonly<
  Record<string, React.ComponentType<BaseForensicProps>>
> = {
  FiscalLedgerTableStage,
  ClaimVsRealityCollision,
  SupremeCourtSyllabusStage,
  EscapeHatchSwitchboard,
  ArchivalRationBook1941,
  FoiaRedactionDeclassify,
  Sec10KFootnoteStretch,
  BdcPikScheduleExhibit,
  StatutoryClauseHighlighter,
  InsuranceRateHikeNotice,
  IrsForm941FicaSplit,
  SubseaSabotageIncidentLog,
  CongressionalHearingSlate,
  TreasuryTicLedgerExhibit,
  SpvCircularFlowSheet,
  FannieMaeCovenantExhibit,
  RedlineContractDiffStage,
  PatentFiling1910Stage,
  BankCallReportTAccount,
  VetoPenBudgetLedger,
  AchAutopayDraftReceipt,
  CreditRatingDowngradeMemo,
  AntitrustMarketExhibit,
  EvidenceCorkboardChronology,
};

const SIMULATOR_COMPONENT_BY_NAME: Readonly<
  Record<string, React.ComponentType<SimulatorBaseProps>>
> = {
  SupplyChainBomStrip,
  PaloAltoWhiteboardFlip,
  DualTaxPlumbingSchematic,
  SovereignPrioritySpillway,
  SplitEraStrikeDiptych,
  LogarithmicWattageLadder,
  VelocityMismatchChronometer,
  CircularAccountingLoop,
  AsymmetricExchangeSimulator,
  SubseaCableCrossSection,
  LithographyNodeLock,
  CantileverBalanceScale,
  TransformerQueueBottleneck,
  WaterCoolingEvaporationTower,
  ContainerChokepointLock,
  StrategicReserveCaverns,
  GridFrequencyDroopGovernor,
  FlywheelMomentumClutch,
  HydraulicSiphonValve,
  MarginCallDominoCascade,
  EscapementRatchetPawn,
  EurodollarOffshoreFunnel,
  MineralRefiningBottleneck,
  DemographicDependencyPyramid,
  InsuranceRiskPoolOverflow,
  MunicipalBondTollgate,
};

const UI_SATIRE_COMPONENT_BY_NAME: Readonly<
  Record<string, React.ComponentType<UiSatireBaseProps>>
> = {
  LongitudinalHouseholdDossier,
  PerishableSeatVsComputeSplit,
  ClosedComputeScripWallet,
  CoalScripVsDigitalYuan,
  FountainPenVetoSlash,
  UnwrittenTruceToAllowance,
  RoofDroneEscrowShock,
  ThermalReceiptInflationRoll,
  RefinanceDenialModal,
  HingedBrassJawCutout,
  ViewerGameQuizCard,
  TermsOfServiceScrollTrap,
  DynamicSurgeMeterTag,
  FourEscapeHatchesBoard,
  SubscriptionTrapStack,
  AlgorithmicCreditScoreDrop,
  CompanyTownStoreLedger,
  GeoFencedSpendMapCard,
  ExpirationCountdownToast,
  AutomatedCobraSeveranceForm,
  BuyNowPayLaterMicroLedger,
  CaptivePartnerCatalogGrid,
  ProgrammableRuleBuilderUI,
  CivicDossierRedactionPlate,
};

function renderDocBroadcastByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const title = p?.title ?? p?.headline ?? "Individual Payroll Taxes Reach 84.1% of Receipts";
  const sub =
    p?.subtitle ??
    p?.body ??
    p?.spokenText ??
    "Corporate income tax collections declined to 7.1% across the same fiscal window.";
  const rows = readTableRows(p);
  const series = readSeriesData(p);
  const exhibit = readExhibitData(p);
  const dataRec = readDataRecord(p);
  const cite = exhibit?.filingTitle ?? p?.sourceCitation ?? "U.S. Treasury Monthly Statement, Table 9";
  const { primary: metric, secondary: secMetric, delta } = resolveMetricTuple(p);
  const mode = p?.paletteMode;

  switch (componentName) {
    case "NewsPackageLowerThird":
      return React.createElement(NewsPackageLowerThird, {
        title,
        source: cite,
        category: p?.eyebrow ?? exhibit?.stampLabel ?? "Fiscal Report",
        subheadline: sub,
        metricBadge: metric,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "CaptionNewsCard":
      return React.createElement(CaptionNewsCard, {
        headline: title,
        body: exhibit?.highlightedClause ?? sub,
        dateline: exhibit?.exhibitCode ?? p?.eyebrow ?? "TREASURY DISPATCH",
        metric,
        metricLabel: rows?.[0]?.label,
        bullets: rows && rows.length >= 2 ? rows.slice(0, 3).map((r) => `${r.label}: ${r.value}`) : undefined,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "VisualInvestigationBoard": {
      const evidenceItems =
        rows && rows.length > 0
          ? rows.slice(0, 3).map((r, idx) => ({
              id: `ev-${idx + 1}`,
              label: r.label,
              value: r.value,
              delta: r.delta ?? (idx === 0 ? delta : undefined),
              isFlagged: Boolean(r.isFlagged ?? idx === 0),
            }))
          : [
              { id: "ev-1", label: "Primary Figure", value: metric, delta: delta ?? "+2.3%", isFlagged: true },
              { id: "ev-2", label: "Counterpart", value: secMetric, isFlagged: false },
              { id: "ev-3", label: "Filing", value: exhibit?.effectiveDate ?? cite, isFlagged: true },
            ];
      return React.createElement(VisualInvestigationBoard, {
        boardTitle: title,
        caseCode: exhibit?.exhibitCode ?? p?.eyebrow ?? "EXHIBIT BOARD 01",
        summaryNote: exhibit?.highlightedClause ?? sub,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
        evidenceItems,
      });
    }
    case "ArchiveLightTable":
      return React.createElement(ArchiveLightTable, {
        folioCode: exhibit?.exhibitCode ?? p?.eyebrow ?? "PLATEN 04 · 5000K DAYLIGHT",
        title,
        caption: exhibit?.highlightedClause ?? sub,
        sourceCitation: cite,
      });
    case "LiveCountdownSplit": {
      const yr0 = parseLeadingNum(series?.[0]?.xLabel ?? readStrArray(dataRec, "years")?.[0]);
      const yr1 = parseLeadingNum(
        series?.[series.length - 1]?.xLabel ??
          readStrArray(dataRec, "years")?.[readStrArray(dataRec, "years")!.length - 1]
      );
      return React.createElement(LiveCountdownSplit, {
        leftTitle: rows?.[0]?.label ?? title,
        rightTitle: rows?.[1]?.label ?? sub,
        startYear: yr0 && yr0 >= 1900 ? yr0 : undefined,
        endYear: yr1 && yr1 >= 1900 ? yr1 : undefined,
        metric,
        leftMetric: rows?.[0]?.value ?? metric,
        rightMetric: rows?.[1]?.value ?? secMetric,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
        duration: p?.duration,
      });
    }
    case "TelestratorOverlay":
      return React.createElement(TelestratorOverlay, {
        targetLabel: exhibit?.stampLabel ?? p?.eyebrow ?? "STATUTORY ANOMALY",
        calloutText: metric,
        evidenceTitle: title,
        evidenceSubtitle: sub,
        evidenceRows: rows
          ? rows.slice(0, 3).map((r) => ({ label: r.label, value: r.value, flagged: r.isFlagged }))
          : undefined,
        sourceCitation: cite,
        showEvidenceBackdrop: mode !== "over-footage",
        atFrame: p?.atFrame,
        duration: p?.duration,
      });
    case "KinoMontageStrip":
      return React.createElement(KinoMontageStrip, {
        numberText: metric,
        headerText: title,
        subtitle: sub,
        category: p?.eyebrow,
        deltaText: delta,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "CitySymphonyFrame":
      return React.createElement(CitySymphonyFrame, {
        locationTag: p?.geoQuery ? (readStr(dataRec, "highlightLabel") ?? p?.eyebrow) : p?.eyebrow ?? "FEDERAL RECORD",
        title,
        metric,
      });
    case "SplitScreenFrame":
      return React.createElement(SplitScreenFrame, {
        leftTitle: rows?.[0]?.label ?? title,
        rightTitle: rows?.[1]?.label ?? sub,
        leftMetric: rows?.[0]?.value ?? metric,
        rightMetric: rows?.[1]?.value ?? secMetric,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "QuoteHighlightCard":
      return React.createElement(QuoteHighlightCard, {
        quote: exhibit?.highlightedClause ?? sub,
        speaker: title,
        dateLabel: exhibit?.effectiveDate,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "DataCalloutLowerThird":
      return React.createElement(DataCalloutLowerThird, {
        value: metric,
        label: rows?.[0]?.label ?? title,
        delta,
        sublabel: sub,
        source: cite,
        sparklineValues: series && series.length >= 3 ? series.map((pt) => pt.primary) : undefined,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    default:
      return React.createElement(BreakingBanner, {
        headline: title,
        kicker: p?.eyebrow ?? "STATUTORY BULLETIN",
        subheadline: sub,
        keyFigure: metric,
        tickerItems: rows ? rows.slice(0, 3).map((r) => `${r.label}: ${r.value}`) : undefined,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
  }
}

function renderVintageEditorialByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const title = p?.title ?? p?.headline ?? "1933 Debt-Deflation Archive";
  const sub =
    p?.subtitle ??
    p?.body ??
    p?.spokenText ??
    "Nominal contracts remained fixed at par while farm and wage receipts contracted sharply.";
  const rows = readTableRows(p);
  const exhibit = readExhibitData(p);
  const cite = exhibit?.filingTitle ?? p?.sourceCitation ?? "National Archives Primary Collection";
  const { primary: metric, secondary: secMetric } = resolveMetricTuple(p);

  switch (componentName) {
    case "Newsreel1920s":
      return React.createElement(Newsreel1920s, {
        headline: title,
        tickerCaption: exhibit?.highlightedClause ?? sub,
        metricBadge: metric,
        placeDate: exhibit?.effectiveDate ?? p?.eyebrow ?? "ARCHIVE · 1929",
        atFrame: p?.atFrame,
      });
    case "SilentFilmCard":
      return React.createElement(SilentFilmCard, {
        title,
        dialogue: exhibit?.highlightedClause ?? sub,
        actLabel: p?.eyebrow ?? exhibit?.exhibitCode ?? "ACT II",
        yearTag: exhibit?.effectiveDate,
        sourceNote: cite,
        atFrame: p?.atFrame,
      });
    case "CollageCutout":
      return React.createElement(CollageCutout, {
        eyebrow: p?.eyebrow ?? "ARCHIVE CLIPPING",
        title,
        metric,
        caption: exhibit?.highlightedClause ?? sub,
        sourceCitation: cite,
        paletteMode: p?.paletteMode ?? "page",
        atFrame: p?.atFrame,
      });
    case "SpyTitleSequence":
      return React.createElement(SpyTitleSequence, {
        title,
        subtitle: exhibit?.highlightedClause ?? sub,
        dossierId: exhibit?.exhibitCode,
        clearance: exhibit?.stampLabel ?? p?.eyebrow ?? "DECLASSIFIED DOSSIER",
        subjectMetric: metric,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    case "StainedGlassFrame":
      return React.createElement(StainedGlassFrame, {
        eyebrow: p?.eyebrow,
        title,
        body: sub,
        metric,
        sourceCitation: cite,
      });
    case "DepressionLedger1930s": {
      const ledgerLines: LedgerLine1930[] | undefined =
        rows && rows.length >= 2
          ? rows.slice(0, 4).map((r) => ({
              account: r.label,
              debit: r.isFlagged ? r.value : "—",
              credit: r.isFlagged ? "—" : r.value,
              isRedInk: Boolean(r.isFlagged),
            }))
          : undefined;
      return React.createElement(DepressionLedger1930s, {
        title,
        folioYear: exhibit?.effectiveDate,
        lines: ledgerLines,
        summaryCallout: exhibit?.highlightedClause ?? sub,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    }
    case "CompanyScripVoucher":
      return React.createElement(CompanyScripVoucher, {
        issuerName: title,
        denomination: metric,
        serialNumber: exhibit?.exhibitCode,
        restrictionClause: exhibit?.highlightedClause ?? sub,
        deductionSummary: secMetric,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    case "BrettonWoodsCable":
      return React.createElement(BrettonWoodsCable, {
        subject: title,
        cableDate: exhibit?.effectiveDate,
        messageLines: rows ? rows.slice(0, 3).map((r) => `${r.label}: ${r.value}`) : undefined,
        parityFigure: metric,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    case "BroadsheetFrontpage":
      return React.createElement(BroadsheetFrontpage, {
        editionDate: exhibit?.effectiveDate,
        bannerHeadline: title,
        leadBody: exhibit?.highlightedClause ?? sub,
        sideMetricLabel: rows?.[0]?.label,
        sideMetricValue: metric,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    default:
      return React.createElement(MicroficheReaderStage, {
        rollIndex: exhibit?.exhibitCode ?? p?.eyebrow ?? "MICROFILM REEL 88-C",
        documentTitle: title,
        keyExcerpt: exhibit?.highlightedClause ?? sub,
        keyFigure: metric,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
  }
}

function renderDiagramMetaphorByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const title = p?.title ?? p?.headline ?? "Structural Mechanism Schematic";
  const sub = p?.subtitle ?? p?.body ?? p?.spokenText ?? "Step-by-step physical and statutory constraint flow.";
  const rows = readTableRows(p);
  const exhibit = readExhibitData(p);
  const cite = exhibit?.filingTitle ?? p?.sourceCitation ?? "Reading Room Technical Schematic";
  const displayMode = p?.paletteMode === "over-footage" ? "over-footage" : "page";

  switch (componentName) {
    case "StickerCutout":
      return React.createElement(StickerCutout, {
        mode: p?.paletteMode === "over-footage" ? "card" : "page",
        eyebrow: p?.eyebrow ?? "EDITORIAL CUTOUT",
        title,
        caption: sub,
        footnote: cite,
        atFrame: p?.atFrame,
        className: p?.className,
        style: p?.style,
      });
    case "StickFigureStage":
      return React.createElement(StickFigureStage, {
        mode: displayMode,
        eyebrow: p?.eyebrow ?? "HOUSEHOLD MECHANICS",
        title,
        subtitle: sub,
        metricValue: p?.metric ?? rows?.[0]?.value,
        metricLabel: rows?.[0]?.label,
        caption: cite,
        atFrame: p?.atFrame,
      });
    case "InstructionManualCard": {
      const steps: ManualStepItem[] | undefined =
        rows && rows.length >= 2
          ? rows.slice(0, 3).map((r, idx) => ({
              stepNumber: idx + 1,
              label: r.label,
              fromLabel: r.value,
              toLabel: r.delta ?? (r.isFlagged ? "LOCKED" : "ROUTED"),
            }))
          : undefined;
      return React.createElement(InstructionManualCard, {
        title,
        subtitle: sub,
        eyebrow: p?.eyebrow ?? "SPEC MANUAL · REV 04",
        leftLabel: rows?.[0]?.label,
        rightLabel: rows?.[1]?.label ?? rows?.[0]?.value,
        steps,
        footnote: cite,
        mode: displayMode,
        atFrame: p?.atFrame,
      });
    }
    case "CollageCutout":
      return React.createElement(DiagramCollageCutout, {
        mode: p?.paletteMode === "over-footage" ? "card" : "page",
        eyebrow: p?.eyebrow ?? "ARCHIVAL CLIPPING",
        title,
        subtitle: sub,
        stampText: p?.metric ?? exhibit?.stampLabel ?? "EXHIBIT A",
        atFrame: p?.atFrame,
      });
    case "IsometricScene":
      return React.createElement(IsometricScene, {
        eyebrow: p?.eyebrow ?? "ISOMETRIC ELEVATION",
        title,
        subtitle: sub,
        footnote: cite,
      });
    default: {
      const parts: PatentCalloutPart[] | undefined =
        rows && rows.length >= 2
          ? rows.slice(0, 4).map((r, idx) => ({
              refNumber: idx + 1,
              partName: r.label,
              specValue: r.value,
            }))
          : undefined;
      return React.createElement(PatentExplodedDiagram, {
        patentNumber: exhibit?.exhibitCode ?? p?.eyebrow ?? "U.S. PATENT SPEC · EXPLODED VIEW",
        title,
        subtitle: sub,
        parts,
        atFrame: p?.atFrame,
      });
    }
  }
}

function renderDataMaps3DByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps,
  forceTransitCorridor?: boolean
): React.ReactElement {
  const title = p?.title ?? p?.headline;
  const sub = p?.subtitle ?? p?.body ?? p?.spokenText;
  const rows = readTableRows(p);
  const series = readSeriesData(p);
  const exhibit = readExhibitData(p);
  const cite = exhibit?.filingTitle ?? p?.sourceCitation;
  const displayMode = p?.paletteMode === "over-footage" ? "over-footage" : "page";
  const { primary, hasExplicitPrimary } = resolveMetricTuple(p);

  const geoQueryText = p?.geoQuery ?? p?.spokenText;
  const hasGeoInputs = Boolean(p?.corridorId || geoQueryText);
  const geoScene = hasGeoInputs
    ? resolveGeoQuery({
        corridorId: p?.corridorId,
        query: p?.geoQuery,
        spokenText: p?.spokenText,
        title,
      })
    : undefined;
  const isRealGeoMatch = Boolean(
    geoScene && geoScene.matchedBy !== "world-overview-fallback"
  );

  const buildPhysicalBlocks = (): PhysicalColumnSpec[] | undefined => {
    if (!rows || rows.length < 2) return undefined;
    const tones: Array<"navy" | "brick" | "teal" | "slate"> = ["navy", "brick", "teal", "slate"];
    const blocks: PhysicalColumnSpec[] = [];
    for (let i = 0; i < Math.min(4, rows.length); i++) {
      const numVal = parseLeadingNum(rows[i].value);
      if (numVal !== undefined) {
        blocks.push({
          label: rows[i].label,
          value: Math.abs(numVal),
          tone: rows[i].isFlagged ? "brick" : tones[i % tones.length],
        });
      }
    }
    return blocks.length >= 2 ? blocks : undefined;
  };

  switch (componentName) {
    case "MapExplainer": {
      if (hasGeoInputs && !isRealGeoMatch) {
        // Never render world:overview or Texas fallback on non-geographic sentences
        return React.createElement(DataPhysicalCard, {
          mode: displayMode,
          eyebrow: p?.eyebrow ?? "STRUCTURAL TELEMETRY",
          title,
          subtitle: sub,
          blocks: buildPhysicalBlocks(),
          sourceCitation: cite,
          atFrame: p?.atFrame,
        });
      }
      return React.createElement(MapExplainer, {
        corridorId:
          p?.corridorId ??
          geoScene?.corridorId ??
          (forceTransitCorridor && !geoQueryText ? "PJM_GRID" : undefined),
        query: p?.geoQuery,
        spokenText: p?.spokenText,
        region: geoScene ? (geoScene.atlasDataset === "usa" ? "us" : "world") : undefined,
        highlightStatesFips: geoScene
          ? geoScene.atlasDataset === "usa"
            ? geoScene.primaryStateFips
            : geoScene.primaryCountryIds
          : undefined,
        highlightLabel: isRealGeoMatch ? geoScene?.title : undefined,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        metricValue: hasExplicitPrimary ? primary : undefined,
        sourceCitation: cite,
        paletteMode: p?.paletteMode ?? "page",
        atFrame: p?.atFrame,
      });
    }
    case "DataPhysicalCard": {
      const blocks = buildPhysicalBlocks();
      const v1 = series?.[0]?.primary ?? parseLeadingNum(rows?.[0]?.value);
      const v2 = series?.[1]?.primary ?? parseLeadingNum(rows?.[1]?.value);
      return React.createElement(DataPhysicalCard, {
        mode: displayMode,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        ...(blocks ? { blocks } : {}),
        ...(rows?.[0]?.label ? { label1: rows[0].label } : {}),
        ...(v1 !== undefined ? { value1: Math.max(1, Math.abs(v1)) } : {}),
        ...(rows?.[1]?.label ? { label2: rows[1].label } : {}),
        ...(v2 !== undefined ? { value2: Math.max(1, Math.abs(v2)) } : {}),
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    }
    case "WhiteModel3D": {
      const tones: Array<"navy" | "brick" | "teal" | "slate" | "paper"> = [
        "navy",
        "brick",
        "teal",
        "slate",
      ];
      let isoBlocks: IsometricModelBlock[] | undefined;
      if (rows && rows.length >= 2) {
        const numericRows = rows
          .slice(0, 4)
          .map((r) => ({ row: r, num: parseLeadingNum(r.value) }))
          .filter((item): item is { row: DirectorTableRow; num: number } => item.num !== undefined);
        if (numericRows.length >= 2) {
          const maxAbs = Math.max(1, ...numericRows.map((x) => Math.abs(x.num)));
          isoBlocks = numericRows.map((item, idx) => ({
            id: `wm-${idx + 1}`,
            label: item.row.label,
            valueLabel: item.row.value,
            gx: -2.4 + idx * 1.6,
            gy: idx % 2 === 0 ? -0.6 : 0.6,
            gw: 1.2,
            gd: 1.2,
            heightUnits: Math.max(0.8, Number(((Math.abs(item.num) / maxAbs) * 4.5).toFixed(2))),
            tone: item.row.isFlagged ? "brick" : tones[idx % tones.length],
          }));
        }
      }
      return React.createElement(WhiteModel3D, {
        mode: displayMode,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        blocks: isoBlocks,
        datumLabel: hasExplicitPrimary ? `${primary} · ${cite ?? "PRIMARY RECORD"}` : cite,
        atFrame: p?.atFrame,
      });
    }
    case "BlobSimulation":
      return React.createElement(BlobSimulation, {
        mode: displayMode,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        inflowLabel: rows?.[0]?.label,
        outflowLabel: rows?.[1]?.label,
        throughputMetric: hasExplicitPrimary ? primary : undefined,
        atFrame: p?.atFrame,
      });
    case "CorridorArcMatrixCard": {
      const resolvedCorridorId = p?.corridorId ?? geoScene?.corridorId;
      const corrMetrics: CorridorLedgerMetric[] | undefined =
        rows && rows.length >= 2
          ? rows.slice(0, 3).map((r) => ({ label: r.label, value: r.value, delta: r.delta }))
          : undefined;
      if (hasGeoInputs && !resolvedCorridorId) {
        if (isRealGeoMatch) {
          // Real geographic entity without a named corridor (e.g. Ireland, Japan): render MapExplainer instead of Taiwan fallback
          return React.createElement(MapExplainer, {
            query: p?.geoQuery ?? p?.spokenText,
            spokenText: p?.spokenText,
            region: geoScene?.atlasDataset === "usa" ? "us" : "world",
            highlightStatesFips:
              geoScene?.atlasDataset === "usa"
                ? geoScene.primaryStateFips
                : geoScene?.primaryCountryIds,
            highlightLabel: geoScene?.title,
            eyebrow: p?.eyebrow,
            title,
            subtitle: sub,
            metricValue: hasExplicitPrimary ? primary : undefined,
            sourceCitation: cite,
            paletteMode: p?.paletteMode ?? "page",
            atFrame: p?.atFrame,
          });
        }
        // Non-geographic sentence: never fall back to TAIWAN_STRAIT_2NM
        return React.createElement(DataPhysicalCard, {
          mode: displayMode,
          eyebrow: p?.eyebrow ?? "STRUCTURAL TELEMETRY",
          title,
          subtitle: sub,
          blocks: buildPhysicalBlocks(),
          sourceCitation: cite,
          atFrame: p?.atFrame,
        });
      }
      return React.createElement(CorridorArcMatrixCard, {
        corridorId: resolvedCorridorId,
        query: p?.geoQuery,
        eyebrow: p?.eyebrow,
        title,
        metrics: corrMetrics,
        paletteMode: p?.paletteMode ?? "page",
        atFrame: p?.atFrame,
      });
    }
    default: {
      const strataTones: Array<"navy" | "brick" | "teal" | "paper"> = ["brick", "navy", "teal", "paper"];
      const layers: StrataLayerSpec[] | undefined =
        rows && rows.length >= 3
          ? rows.slice(0, 4).map((r, idx) => ({
              label: r.label,
              share: r.value,
              note: r.delta ?? "Verified Layer",
              tone: r.isFlagged ? "brick" : strataTones[idx % strataTones.length],
            }))
          : undefined;
      return React.createElement(IsometricStrataCutaway3D, {
        mode: displayMode,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        layers,
        atFrame: p?.atFrame,
      });
    }
  }
}

// ============================================================================
// 3. Complete 10-World Style Recipe Builders (162 Unique Canonical Recipes)
// ============================================================================

const LEGACY_24_SET = new Set<string>(LEGACY_24_STYLE_IDS as readonly string[]);

function buildLiquidGlassRecipes(): UnifiedStyleRecipe[] {
  const out: UnifiedStyleRecipe[] = [];
  for (let i = 0; i < GLASS_PRESET_IDS.length; i++) {
    const presetId = GLASS_PRESET_IDS[i];
    const meta = GLASS_PRESET_REGISTRY[presetId];
    const canonicalId =
      presetId === "card"
        ? "liquid-glass-card"
        : presetId === "bottom-dock"
          ? "liquid-glass-dock"
          : presetId === "toast-alert"
            ? "liquid-glass-toast"
            : `liquid-glass-${presetId}`;

    const aliases: string[] = [presetId, meta.componentName, `LiquidGlassObject:${presetId}`];
    if (presetId === "bottom-dock") {
      aliases.push("liquid-glass-bottom-dock", "dock", "LiquidGlassObject:dock");
    } else if (presetId === "toast-alert") {
      aliases.push("liquid-glass-toast-alert", "toast", "LiquidGlassObject:toast");
    } else if (presetId === "corner-pill") {
      aliases.push("liquid-glass-pill", "pill", "LiquidGlassObject:pill");
    } else if (presetId === "magnifier-card") {
      aliases.push("liquid-glass-footnote-loupe", "GlassFootnoteLoupe");
    } else if (presetId === "telemetry-strip") {
      aliases.push("liquid-glass-ledger-ribbon", "GlassLedgerRibbon");
    } else if (presetId === "stat-triptych") {
      aliases.push("liquid-glass-metric-triptych", "GlassMetricTriptych");
    } else if (presetId === "terminal-console") {
      aliases.push("doc-bloomberg-terminal-clean");
    }

    const framing: CameraFraming =
      presetId === "toast-alert" ? "talking-head-punch-in" : "talking-head-with-glass";

    out.push({
      id: canonicalId,
      name: meta.displayName,
      styleWorld: "liquid-glass",
      legacyStyleFamily: "liquid-glass",
      componentName: meta.componentName,
      defaultFraming: framing,
      defaultPaletteMode: "over-footage",
      motionAction:
        presetId === "toast-alert"
          ? "pop-out -> nudge -> pop-down"
          : presetId === "bottom-dock"
            ? "slide-up -> highlight-sweep -> fade-out"
            : "slide-left -> glow-rim -> fade-blur-out",
      typographyMode: presetId === "toast-alert" ? "red-correction" : "marker-sweep",
      defaultSfx: presetId === "bottom-dock" ? "glass-dock" : "glass-enter",
      secondarySfx: presetId === "toast-alert" ? "alert-ping" : "data-tick",
      paceProfile: presetId === "toast-alert" ? "snappy" : "balanced",
      domainTags: inferDomainTagsFromText(canonicalId, meta.displayName, meta.category, "fiscal"),
      emotionalBeat:
        meta.category === "forensic"
          ? "clinical-evidence"
          : meta.category === "telemetry"
            ? "tension-build"
            : "hard-reveal",
      visualWeight: presetId === "corner-pill" ? "light" : "medium",
      description: `Smoked-navy optical Liquid Glass ${meta.displayName} (${meta.safePlacement} safe zone).`,
      aliases,
      isLegacy24: LEGACY_24_SET.has(canonicalId),
      glassPresetId: presetId,
      render: (p) => renderGlassPresetById(presetId, p),
    });
  }

  out.push({
    id: "liquid-glass-treasury-overlay",
    name: "Treasury Table 9 Smoked-Navy Alpha Overlay",
    styleWorld: "liquid-glass",
    legacyStyleFamily: "liquid-glass",
    componentName: "TreasuryOverlayCard",
    defaultFraming: "talking-head-with-glass",
    defaultPaletteMode: "over-footage",
    motionAction: "slide-left -> audit-row-step -> fade-blur-out",
    typographyMode: "ledger-tabular-rollup",
    defaultSfx: "glass-enter",
    secondarySfx: "odometer-tick",
    paceProfile: "balanced",
    domainTags: ["fiscal", "labor"],
    emotionalBeat: "clinical-evidence",
    visualWeight: "medium",
    description: "Right-third transparent ProRes 4444 smoked-navy Treasury receipt gap card.",
    aliases: ["treasury-overlay-card", "TreasuryOverlayCard", "TreasuryTable9-Overlay"],
    isLegacy24: false,
    render: () => React.createElement(TreasuryOverlayCard),
  });

  return out;
}

function buildDocBroadcastRecipes(): UnifiedStyleRecipe[] {
  const out: UnifiedStyleRecipe[] = [];
  for (let i = 0; i < DOC_BROADCAST_STYLES.length; i++) {
    const item = DOC_BROADCAST_STYLES[i];
    const isOver = item.defaultFraming === "over-footage";
    const framing: CameraFraming =
      item.id === "doc-live-countdown-split" ||
      item.id === "doc-telestrator" ||
      item.id === "doc-split-screen-frame"
        ? "split-screen"
        : isOver
          ? "talking-head-with-glass"
          : "fullscreen-cutaway";

    const aliases: string[] = [item.componentName];
    if (item.id === "doc-split-screen-frame") {
      aliases.push("doc-split-fact-check", "split-screen-frame");
    } else if (item.id === "doc-archive-light-table") {
      aliases.push("archive-lighttable");
    }

    out.push({
      id: item.id,
      name: item.name,
      styleWorld: "doc-broadcast",
      legacyStyleFamily: "doc-broadcast",
      componentName: item.componentName,
      defaultFraming: framing,
      defaultPaletteMode: isOver ? "over-footage" : "page",
      motionAction:
        item.id === "doc-telestrator"
          ? "pop-out -> circle-telestrator -> fade-out"
          : item.id === "doc-visual-investigation"
            ? "blur-snap -> pulse-warning -> fade-blur-out"
            : "paper-unfold -> highlight-sweep -> fade-out",
      typographyMode: item.id === "doc-archive-light-table" ? "typewriter" : "marker-sweep",
      defaultSfx: isOver ? "glass-enter" : "paper-slide",
      secondarySfx: "marker-sweep",
      paceProfile: item.id === "doc-kino-montage" ? "snappy" : "calm-hold",
      domainTags: inferDomainTagsFromText(item.id, item.name, item.description, "fiscal"),
      emotionalBeat: item.id === "doc-visual-investigation" ? "hard-reveal" : "clinical-evidence",
      visualWeight: isOver ? "medium" : "heavy",
      description: item.description,
      aliases,
      isLegacy24: LEGACY_24_SET.has(item.id),
      peakOnly: item.id === "doc-visual-investigation",
      render: (p) => renderDocBroadcastByComponent(item.componentName, p),
    });
  }

  out.push(
    {
      id: "doc-kinetic-statement",
      name: "Cinema Stenography Kinetic Thesis Stage",
      styleWorld: "doc-broadcast",
      legacyStyleFamily: "doc-broadcast",
      componentName: "KineticText",
      defaultFraming: "fullscreen-cutaway",
      defaultPaletteMode: "page",
      motionAction: "pneumatic-stamp-in -> chisel-edge-hold -> fade-blur-out",
      typographyMode: "chisel-highlighter-sweep",
      defaultSfx: "felt-highlighter",
      secondarySfx: "typewriter-strike",
      paceProfile: "snappy",
      domainTags: ["fiscal", "legal"],
      emotionalBeat: "thesis-verdict",
      visualWeight: "heavy",
      description: "Full-frame Whisper-synced 32-mode kinetic typography and stenography statement stage.",
      aliases: ["KineticText", "kinetic-statement", "kinetic-thesis"],
      isLegacy24: false,
      render: (p) => {
        const dataRec = readDataRecord(p);
        const rawMode = readStr(dataRec, "typographyMode");
        const mode: KineticTextMode =
          rawMode && isTypographyMode(rawMode) ? rawMode : "chisel-highlighter-sweep";
        return React.createElement(KineticText, {
          text:
            p?.spokenText ??
            p?.body ??
            p?.title ??
            p?.headline ??
            "Nominal debt holds par while real wages adjust.",
          mode,
          paletteMode: p?.paletteMode ?? "page",
          atFrame: p?.atFrame,
          duration: p?.duration,
          enableSfx: p?.enableSfx,
          className: p?.className,
          style: p?.style,
        });
      },
    },
    {
      id: "doc-chapter-headline-card",
      name: "Architectural Act & Chapter Title Plate",
      styleWorld: "doc-broadcast",
      legacyStyleFamily: "doc-broadcast",
      componentName: "EditorialHeadline",
      defaultFraming: "fullscreen-cutaway",
      defaultPaletteMode: "page",
      motionAction: "curtain-wipe -> archive-page-breath -> fade-out",
      typographyMode: "chapter-roman-folio",
      defaultSfx: "chapter-chime",
      paceProfile: "calm-hold",
      domainTags: ["history", "fiscal"],
      emotionalBeat: "tension-build",
      visualWeight: "medium",
      description: "Orphan-balanced serif chapter card and newspaper cutout headline plate.",
      aliases: ["EditorialHeadline", "chapter-headline-card"],
      isLegacy24: false,
      render: (p) =>
        React.createElement(EditorialHeadline, {
          variant: "chapter-card",
          title: p?.title ?? p?.headline ?? "Act I · The Tax Plumbing Split",
          subtitle: p?.subtitle ?? p?.body ?? p?.spokenText,
          category: p?.eyebrow ?? "SPECIAL INVESTIGATION",
          paletteMode: p?.paletteMode ?? "page",
          atFrame: p?.atFrame,
          duration: p?.duration,
          enableSfx: p?.enableSfx,
          className: p?.className,
          style: p?.style,
        }),
    }
  );

  return out;
}

function buildVintageEditorialRecipes(): UnifiedStyleRecipe[] {
  return VINTAGE_EDITORIAL_STYLES.map((item) => {
    const isOver = item.defaultFraming === "over-footage";
    return {
      id: item.id,
      name: item.name,
      styleWorld: "vintage-editorial",
      legacyStyleFamily: "vintage-editorial",
      componentName: item.componentName,
      defaultFraming:
        item.id === "vintage-stained-glass"
          ? "split-screen"
          : isOver
            ? "talking-head-punch-in"
            : "fullscreen-cutaway",
      defaultPaletteMode: isOver ? "over-footage" : "page",
      motionAction:
        item.id === "vintage-newsreel"
          ? "iris-reveal -> ken-burns -> fade-out"
          : item.id === "vintage-collage"
            ? "pop-out -> nudge -> fade-out"
            : "dossier-slide-desk -> microfilm-frame-step -> fade-out",
      typographyMode: "typewriter-1941-ribbon",
      defaultSfx: item.id === "vintage-newsreel" ? "newsreel-click" : "paper-slide",
      secondarySfx: "typewriter-strike",
      paceProfile: item.id === "vintage-collage" ? "snappy" : "calm-hold",
      domainTags: inferDomainTagsFromText(item.id, item.name, item.description, "history"),
      emotionalBeat: item.id === "vintage-collage" ? "ironic-contrast" : "clinical-evidence",
      visualWeight: isOver ? "medium" : "heavy",
      description: item.description,
      aliases: [item.componentName],
      isLegacy24: LEGACY_24_SET.has(item.id),
      render: (p) => renderVintageEditorialByComponent(item.componentName, p),
    };
  });
}

function renderMacroTelemetryByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const dataRec = readDataRecord(p);
  const rows = readTableRows(p);
  const series = readSeriesData(p);
  const exhibit = readExhibitData(p);
  const { primary, secondary, hasExplicitPrimary } = resolveMetricTuple(p);
  const validReg = resolveValidRegisterId(p?.register);

  const baseProps: BaseTelemetryProps = {
    kicker: p?.eyebrow,
    title: p?.title ?? p?.headline,
    subtitle: p?.subtitle ?? p?.body ?? p?.spokenText,
    heroBadge: hasExplicitPrimary ? primary : undefined,
    sourceCitation: exhibit?.filingTitle ?? p?.sourceCitation,
    ...(validReg ? { register: validReg } : {}),
    paletteMode: p?.paletteMode,
    atFrame: p?.atFrame,
  };

  const years = readStrArray(dataRec, "years");
  const upperSeries = readNumArray(dataRec, "upperSeries");
  const lowerSeries = readNumArray(dataRec, "lowerSeries");
  const hasMatchedDualSeries = Boolean(
    years &&
      upperSeries &&
      lowerSeries &&
      years.length >= 2 &&
      upperSeries.length === years.length &&
      lowerSeries.length === years.length
  );

  switch (componentName) {
    case "DivergingJawsChart": {
      if (hasMatchedDualSeries && years && upperSeries && lowerSeries) {
        const minVal = Math.min(...upperSeries, ...lowerSeries);
        return React.createElement(DivergingJawsChart, {
          ...baseProps,
          years,
          upperSeries,
          lowerSeries,
          upperLabel: readStr(dataRec, "upperLabel") ?? rows?.[0]?.label,
          lowerLabel: readStr(dataRec, "lowerLabel") ?? rows?.[1]?.label,
          floorValue: readNum(dataRec, "floorValue") ?? minVal,
          floorLabel: readStr(dataRec, "floorLabel") ?? "BASELINE REFERENCE FLOOR",
        });
      }
      return React.createElement(DivergingJawsChart, baseProps);
    }
    case "AuctionPriceShockwave": {
      if (series && series.length >= 2 && series.every((pt) => pt.primary >= 0 && pt.primary <= 300)) {
        const auctions: AuctionStepDatum[] = series.slice(0, 5).map((pt) => ({
          deliveryYear: pt.xLabel,
          priceMwDay: pt.primary,
        }));
        return React.createElement(AuctionPriceShockwave, { ...baseProps, auctions });
      }
      return React.createElement(AuctionPriceShockwave, baseProps);
    }
    case "JevonsDeflationCurve": {
      if (
        hasMatchedDualSeries &&
        years &&
        upperSeries &&
        lowerSeries &&
        upperSeries.every((v) => v >= 0 && v <= 105) &&
        lowerSeries.every((v) => v >= 0 && v <= 105)
      ) {
        return React.createElement(JevonsDeflationCurve, {
          ...baseProps,
          periods: years,
          unitCostIndex: upperSeries,
          volumeIndex: lowerSeries,
        });
      }
      return React.createElement(JevonsDeflationCurve, baseProps);
    }
    case "SovereignSpreadFlip": {
      if (
        hasMatchedDualSeries &&
        years &&
        upperSeries &&
        lowerSeries &&
        upperSeries.every((v) => v >= 0 && v <= 5.6) &&
        lowerSeries.every((v) => v >= 0 && v <= 5.6)
      ) {
        return React.createElement(SovereignSpreadFlip, {
          ...baseProps,
          quarters: years,
          franceYields: upperSeries,
          greeceYields: lowerSeries,
        });
      }
      return React.createElement(SovereignSpreadFlip, baseProps);
    }
    case "DebtDeflationJaws1933": {
      if (
        hasMatchedDualSeries &&
        years &&
        upperSeries &&
        lowerSeries &&
        upperSeries.every((v) => v >= 40 && v <= 190) &&
        lowerSeries.every((v) => v >= 40 && v <= 190)
      ) {
        return React.createElement(DebtDeflationJaws1933, {
          ...baseProps,
          years,
          nominalWageIndex: lowerSeries,
          realDebtBurdenIndex: upperSeries,
        });
      }
      return React.createElement(DebtDeflationJaws1933, baseProps);
    }
    case "TrustFundDepletionCurve": {
      if (
        years &&
        upperSeries &&
        years.length >= 2 &&
        upperSeries.length === years.length &&
        upperSeries.every((v) => v >= 0 && v <= 3.0)
      ) {
        return React.createElement(TrustFundDepletionCurve, {
          ...baseProps,
          years,
          reserveTrillions: upperSeries,
          automaticCutPct: readStr(dataRec, "deltaLabel") ?? undefined,
        });
      }
      return React.createElement(TrustFundDepletionCurve, baseProps);
    }
    case "CostExchangeRatioBar": {
      const n1 = parseLeadingNum(rows?.[0]?.value ?? primary);
      const n2 = parseLeadingNum(rows?.[1]?.value ?? secondary);
      if (n1 !== undefined && n2 !== undefined && n1 > 0 && n2 > 0) {
        const low = n1 <= n2 ? { lbl: rows?.[0]?.label ?? "Low Cost", val: n1 } : { lbl: rows?.[1]?.label ?? "Low Cost", val: n2 };
        const high = n1 <= n2 ? { lbl: rows?.[1]?.label ?? "High Cost", val: n2 } : { lbl: rows?.[0]?.label ?? "High Cost", val: n1 };
        return React.createElement(CostExchangeRatioBar, {
          ...baseProps,
          lowCostLabel: low.lbl,
          lowCostUsd: low.val,
          highCostLabel: high.lbl,
          highCostUsd: high.val,
        });
      }
      return React.createElement(CostExchangeRatioBar, baseProps);
    }
    case "RealVsNominalShrink": {
      const nom = readNum(dataRec, "formulaPayout") ?? parseLeadingNum(rows?.[0]?.value);
      const real = readNum(dataRec, "actualPayout") ?? parseLeadingNum(rows?.[1]?.value);
      return React.createElement(RealVsNominalShrink, {
        ...baseProps,
        ...(nom && nom > 0 ? { nominalAmount: nom } : {}),
        ...(real && real > 0 ? { realAmount: real } : {}),
        horizonText: exhibit?.effectiveDate,
      });
    }
    default: {
      const Comp = MACRO_COMPONENT_BY_NAME[componentName] ?? DivergingJawsChart;
      return React.createElement(Comp, baseProps);
    }
  }
}

function buildMacroTelemetryRecipes(): UnifiedStyleRecipe[] {
  const out: UnifiedStyleRecipe[] = MACRO_TELEMETRY_STYLES.map((item) => ({
    id: item.id,
    name: item.name,
    styleWorld: "macro-telemetry",
    legacyStyleFamily: "data-maps-3d",
    componentName: item.componentName,
    defaultFraming: "fullscreen-cutaway",
    defaultPaletteMode: "page",
    motionAction: "orthographic-extrude -> audit-row-step -> fade-blur-out",
    typographyMode: "ledger-tabular-rollup",
    defaultSfx: "odometer-tick",
    secondarySfx: "basis-point-blip",
    paceProfile: "calm-hold",
    domainTags: inferDomainTagsFromText(item.id, item.name, item.description, "fiscal"),
    emotionalBeat: /shockwave|flip|cliff|jaws|shrink/.test(item.id)
      ? "hard-reveal"
      : "clinical-evidence",
    visualWeight: "heavy",
    description: item.description,
    aliases: [item.componentName],
    isLegacy24: false,
    render: (p) => renderMacroTelemetryByComponent(item.componentName, p),
  }));

  out.push({
    id: "macro-data-ticker-monolith",
    name: "Tabular Hero Counter & Basis-Point Odometer",
    styleWorld: "macro-telemetry",
    legacyStyleFamily: "data-maps-3d",
    componentName: "DataTicker",
    defaultFraming: "fullscreen-cutaway",
    defaultPaletteMode: "page",
    motionAction: "zoom-burst -> debt-clock-blur -> fade-blur-out",
    typographyMode: "debt-odometer-inline",
    defaultSfx: "odometer-tick",
    secondarySfx: "audit-row-lock",
    paceProfile: "snappy",
    domainTags: ["fiscal", "energy-grid"],
    emotionalBeat: "hard-reveal",
    visualWeight: "heavy",
    description: "Precision tabular numeric counter supporting negative currencies, ratios, and compound units.",
    aliases: ["DataTicker", "dataviz-ticker"],
    isLegacy24: false,
    render: (p) => {
      const { primary, delta } = resolveMetricTuple(p);
      return React.createElement(DataTicker, {
        value: primary,
        label: p?.title ?? p?.headline ?? "Federal Gross Debt",
        delta: delta ? { value: delta } : undefined,
        paletteMode: p?.paletteMode ?? "page",
        atFrame: p?.atFrame,
        duration: p?.duration,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    },
  });

  return out;
}

function renderForensicExhibitByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const dataRec = readDataRecord(p);
  const rows = readTableRows(p);
  const exhibit = readExhibitData(p);
  const { primary, secondary, delta, hasExplicitPrimary, hasExplicitSecondary } = resolveMetricTuple(p);
  const validReg = resolveValidRegisterId(p?.register);
  const sub = p?.subtitle ?? p?.body ?? p?.spokenText;

  const baseProps: BaseForensicProps = {
    docketCode: exhibit?.exhibitCode ?? p?.eyebrow,
    title: p?.title ?? p?.headline,
    subtitle: sub,
    verdictBadge: exhibit?.stampLabel ?? (hasExplicitPrimary ? primary : undefined),
    sourceCitation: exhibit?.filingTitle ?? p?.sourceCitation,
    ...(validReg ? { register: validReg } : {}),
    paletteMode: p?.paletteMode,
    atFrame: p?.atFrame,
  };

  switch (componentName) {
    case "FiscalLedgerTableStage": {
      const ledgerRows: FiscalLedgerRow[] | undefined =
        rows && rows.length >= 2
          ? rows.slice(0, 4).map((r, idx) => ({
              lineCode: `LN 0${idx + 1}`,
              category: r.label,
              priorValue: exhibit?.effectiveDate ?? "BASELINE",
              currentValue: r.value,
              deltaBadge: r.delta ?? (r.isFlagged ? "FLAGGED" : r.isHighlight ? "PRIMARY" : "AUDITED"),
              statuteNote: exhibit?.statuteOrDocket,
              highlighted: Boolean(r.isHighlight || r.isFlagged),
            }))
          : undefined;
      return React.createElement(FiscalLedgerTableStage, {
        ...baseProps,
        ...(ledgerRows ? { rows: ledgerRows } : {}),
      });
    }
    case "ClaimVsRealityCollision":
      return React.createElement(ClaimVsRealityCollision, {
        ...baseProps,
        claimText: exhibit?.highlightedClause ?? sub,
        ...(hasExplicitPrimary ? { realityFigure: primary } : {}),
        realityDetail: sub,
      });
    case "SupremeCourtSyllabusStage": {
      const formulaPayout = readNum(dataRec, "formulaPayout");
      const actualPayout = readNum(dataRec, "actualPayout");
      return React.createElement(SupremeCourtSyllabusStage, {
        ...baseProps,
        caseCaption: readStr(dataRec, "caseCaption") ?? p?.title,
        citationNumber: exhibit?.statuteOrDocket,
        voteSplit: exhibit?.stampLabel,
        holdingSummary: readStr(dataRec, "holdingSummary") ?? exhibit?.highlightedClause ?? sub,
        ...(formulaPayout !== undefined && formulaPayout > 0 ? { formulaPayout } : {}),
        ...(actualPayout !== undefined && actualPayout >= 0 ? { actualPayout } : {}),
      });
    }
    case "ArchivalRationBook1941": {
      const totalCoupons = readNum(dataRec, "totalCoupons");
      const redeemedCoupons = readNum(dataRec, "redeemedCoupons");
      return React.createElement(ArchivalRationBook1941, {
        ...baseProps,
        ...(totalCoupons !== undefined && totalCoupons >= 4 ? { totalCoupons } : {}),
        ...(redeemedCoupons !== undefined ? { redeemedCoupons } : {}),
        cashBalanceLabel: exhibit?.highlightedClause,
      });
    }
    case "StatutoryClauseHighlighter":
      return React.createElement(StatutoryClauseHighlighter, {
        ...baseProps,
        statuteHeading: exhibit?.statuteOrDocket ?? exhibit?.filingTitle,
        clauseText: exhibit?.highlightedClause ?? sub,
      });
    case "VetoPenBudgetLedger":
      return React.createElement(VetoPenBudgetLedger, {
        ...baseProps,
        originalLine:
          readStr(dataRec, "originalLine") ??
          (rows?.[0] ? `${rows[0].label}: ${rows[0].value}` : undefined),
        vetoedLine:
          readStr(dataRec, "vetoedLine") ??
          (rows?.[1] ? `${rows[1].label}: ${rows[1].value}` : undefined),
      });
    case "TreasuryTicLedgerExhibit":
      return React.createElement(TreasuryTicLedgerExhibit, {
        ...baseProps,
        ...(hasExplicitPrimary ? { officialShare: `${rows?.[0]?.label ?? "Primary"}: ${primary}` } : {}),
        ...(hasExplicitSecondary ? { privateRailShare: `${rows?.[1]?.label ?? "Counterpart"}: ${secondary}` } : {}),
      });
    case "InsuranceRateHikeNotice":
      return React.createElement(InsuranceRateHikeNotice, {
        ...baseProps,
        ...(hasExplicitPrimary ? { priorPremium: primary } : {}),
        ...(hasExplicitSecondary ? { renewalPremium: secondary } : {}),
        inspectionFlag: exhibit?.highlightedClause,
      });
    case "SpvCircularFlowSheet": {
      const bNodes = readStrArray(dataRec, "bottomNodes");
      const nodes: [string, string, string] | undefined =
        bNodes && bNodes.length >= 3 ? [bNodes[0], bNodes[1], bNodes[2]] : undefined;
      return React.createElement(SpvCircularFlowSheet, {
        ...baseProps,
        ...(nodes ? { nodes } : {}),
      });
    }
    case "CongressionalHearingSlate":
      return React.createElement(CongressionalHearingSlate, {
        ...baseProps,
        committee: exhibit?.filingTitle,
        witnessName: p?.title,
        swornExcerpt: exhibit?.highlightedClause ?? sub,
      });
    case "CreditRatingDowngradeMemo":
      return React.createElement(CreditRatingDowngradeMemo, {
        ...baseProps,
        ratingShift: delta ?? (hasExplicitPrimary ? primary : undefined),
        rationale: exhibit?.highlightedClause ?? sub,
      });
    case "AntitrustMarketExhibit":
      return React.createElement(AntitrustMarketExhibit, {
        ...baseProps,
        exhibitNumber: exhibit?.exhibitCode,
        internalQuote: exhibit?.highlightedClause ?? sub,
        ...(hasExplicitPrimary ? { marketShareFigure: primary } : {}),
      });
    default: {
      const Comp = FORENSIC_COMPONENT_BY_NAME[componentName] ?? FiscalLedgerTableStage;
      return React.createElement(Comp, baseProps);
    }
  }
}

function buildForensicExhibitRecipes(): UnifiedStyleRecipe[] {
  const out: UnifiedStyleRecipe[] = FORENSIC_EXHIBIT_STYLES.map((item) => {
    const extraAliases: string[] = [item.componentName];
    if (item.id === "forensic-archival-ration-book-1941") {
      extraAliases.push("vintage-1941-ration-booklet");
    }
    return {
      id: item.id,
      name: item.name,
      styleWorld: "forensic-exhibits",
      legacyStyleFamily: "doc-broadcast",
      componentName: item.componentName,
      defaultFraming: "fullscreen-cutaway",
      defaultPaletteMode: "page",
      motionAction: "dossier-slide-desk -> loupe-scan-row -> fade-out",
      typographyMode: "statute-clause-box",
      defaultSfx: "archival-stamp",
      secondarySfx: "felt-highlighter",
      paceProfile: "calm-hold",
      domainTags: inferDomainTagsFromText(item.id, item.name, item.description, "legal"),
      emotionalBeat: /collision|veto|sabotage|downgrade|breach/.test(item.id)
        ? "thesis-verdict"
        : "clinical-evidence",
      visualWeight: "heavy",
      description: item.description,
      aliases: extraAliases,
      isLegacy24: false,
      render: (p) => renderForensicExhibitByComponent(item.componentName, p),
    };
  });

  out.push({
    id: "forensic-treasury-table-9",
    name: "U.S. Treasury Table 9 Receipts Full-Scene Exhibit",
    styleWorld: "forensic-exhibits",
    legacyStyleFamily: "doc-broadcast",
    componentName: "TreasuryTable9Scene",
    defaultFraming: "fullscreen-cutaway",
    defaultPaletteMode: "page",
    motionAction: "paper-unfold -> loupe-scan-row -> fade-out",
    typographyMode: "ledger-tabular-rollup",
    defaultSfx: "paper-slide",
    secondarySfx: "felt-highlighter",
    paceProfile: "calm-hold",
    domainTags: ["fiscal", "labor", "legal"],
    emotionalBeat: "clinical-evidence",
    visualWeight: "showstopper",
    description: "Full 1920x1080 Treasury Monthly Statement Table 9 scene with camera zoom and highlighter sweep.",
    aliases: ["treasury-table-9", "TreasuryTable9Scene", "TreasuryTable9-Full", "dataviz"],
    isLegacy24: false,
    render: () => React.createElement(TreasuryTable9Scene),
  });

  return out;
}

function buildDiagramMetaphorRecipes(): UnifiedStyleRecipe[] {
  return DIAGRAM_METAPHOR_STYLES.map((item) => {
    let canonicalId = item.id;
    const aliases: string[] = [item.componentName];
    if (item.id === "sticker-cutout") {
      canonicalId = "diagram-sticker";
      aliases.push("sticker-cutout");
    } else if (item.id === "stick-figure-stage") {
      canonicalId = "diagram-stick-figure";
      aliases.push("stick-figure-stage", "stick-explainer");
    } else if (item.id === "instruction-manual-card") {
      canonicalId = "diagram-instruction-manual";
      aliases.push("instruction-manual-card", "instruction-manual");
    } else if (item.id === "isometric-scene") {
      canonicalId = "diagram-isometric";
      aliases.push("isometric-scene", "isometric-picture-book");
    } else if (item.id === "collage-cutout") {
      canonicalId = "diagram-collage-cutout";
      aliases.push("collage-cutout", "DiagramCollageCutout");
    } else if (item.id === "patent-exploded-diagram") {
      aliases.push("diagram-patent-exploded");
    }

    const isOver = item.defaultFraming === "over-footage";
    return {
      id: canonicalId,
      name: item.name,
      styleWorld: "diagram-metaphor",
      legacyStyleFamily: "diagram-metaphor",
      componentName: item.componentName,
      defaultFraming: isOver ? "talking-head-punch-in" : "fullscreen-cutaway",
      defaultPaletteMode: isOver ? "over-footage" : "page",
      motionAction:
        canonicalId === "diagram-sticker"
          ? "elastic-open -> nudge -> pop-down"
          : canonicalId === "diagram-instruction-manual"
            ? "paper-unfold -> underline-draw -> fade-out"
            : "isometric-rise -> orthographic-explode-layers -> fade-out",
      typographyMode: "blueprint-dimension-callout",
      defaultSfx: isOver ? "sticker-pop" : "blueprint-unroll",
      secondarySfx: "telestrator-draw",
      paceProfile: isOver ? "snappy" : "balanced",
      domainTags: inferDomainTagsFromText(canonicalId, item.name, item.description, "household"),
      emotionalBeat: isOver ? "ironic-contrast" : "tension-build",
      visualWeight: isOver ? "light" : "heavy",
      description: item.description,
      aliases,
      isLegacy24: LEGACY_24_SET.has(canonicalId),
      render: (p) => renderDiagramMetaphorByComponent(item.componentName, p),
    };
  });
}

function buildDataMaps3DRecipes(): UnifiedStyleRecipe[] {
  const out: UnifiedStyleRecipe[] = DATA_MAPS_3D_STYLES.map((item) => {
    let canonicalId = item.id;
    const aliases: string[] = [item.componentName];
    if (item.id === "map-explainer") {
      canonicalId = "data-map-explainer";
      aliases.push("map-explainer");
    } else if (item.id === "white-model-3d") {
      canonicalId = "data-white-model-3d";
      aliases.push("white-model-3d", "white-model");
    } else if (item.id === "blob-simulation") {
      canonicalId = "data-blob-simulation";
      aliases.push("blob-simulation", "pip-simulation");
    } else if (item.id === "data-physical-card") {
      aliases.push("data-physical");
    } else if (item.id === "corridor-arc-matrix-card") {
      aliases.push("data-corridor-arc-matrix");
    } else if (item.id === "isometric-strata-cutaway-3d") {
      aliases.push("data-isometric-strata-3d");
    }

    const isOver = item.defaultFraming === "over-footage";
    return {
      id: canonicalId,
      name: item.name,
      styleWorld: "data-maps-3d",
      legacyStyleFamily: "data-maps-3d",
      componentName: item.componentName,
      defaultFraming: "fullscreen-cutaway",
      defaultPaletteMode: isOver ? "over-footage" : "page",
      motionAction:
        canonicalId === "data-map-explainer"
          ? "blur-snap -> circle-telestrator -> fade-out"
          : "isometric-rise -> parallax-hover -> fade-blur-out",
      typographyMode: "blueprint-dimension-callout",
      defaultSfx: canonicalId === "data-map-explainer" ? "map-whoosh" : "data-tick",
      secondarySfx: "radar-sonar-ping",
      paceProfile: "calm-hold",
      domainTags: inferDomainTagsFromText(canonicalId, item.name, item.description, "geopolitics"),
      emotionalBeat: "tension-build",
      visualWeight: "heavy",
      description: item.description,
      aliases,
      isLegacy24: LEGACY_24_SET.has(canonicalId),
      render: (p) => renderDataMaps3DByComponent(item.componentName, p, false),
    };
  });

  out.splice(1, 0, {
    id: "data-transit-map",
    name: "Geopolitical Corridor & Geodesic Transit Arc Map",
    styleWorld: "data-maps-3d",
    legacyStyleFamily: "data-maps-3d",
    componentName: "MapExplainer",
    defaultFraming: "fullscreen-cutaway",
    defaultPaletteMode: "page",
    motionAction: "radar-sweep-reveal -> cable-packet-pulse -> fade-out",
    typographyMode: "blueprint-dimension-callout",
    defaultSfx: "map-whoosh",
    secondarySfx: "radar-sonar-ping",
    paceProfile: "calm-hold",
    domainTags: ["geopolitics", "energy-grid", "ai-compute"],
    emotionalBeat: "tension-build",
    visualWeight: "heavy",
    description: "Animated corridor arc & chokepoint pin layer over D3 NaturalEarth1 / AlbersUsa cartography.",
    aliases: ["transit-map"],
    isLegacy24: false,
    render: (p) => renderDataMaps3DByComponent("MapExplainer", p, true),
  });

  return out;
}

function renderSystemSimulatorByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const dataRec = readDataRecord(p);
  const rows = readTableRows(p);
  const exhibit = readExhibitData(p);
  const { primary, secondary, hasExplicitPrimary } = resolveMetricTuple(p);
  const topStream = readStr(dataRec, "topStream");
  const bottomNodes = readStrArray(dataRec, "bottomNodes");

  const baseProps: SimulatorBaseProps = {
    eyebrow: p?.eyebrow,
    title: p?.title ?? p?.headline,
    subtitle: p?.subtitle ?? p?.body ?? p?.spokenText,
    summaryMetric: hasExplicitPrimary ? primary : undefined,
    summaryLabel: rows?.[0]?.label,
    sourceCitation: exhibit?.filingTitle ?? p?.sourceCitation,
    paletteMode: p?.paletteMode,
    atFrame: p?.atFrame,
  };

  switch (componentName) {
    case "SupplyChainBomStrip": {
      const retailPrice = readNum(dataRec, "retailPrice") ?? parseLeadingNum(rows?.[0]?.value);
      return React.createElement(SupplyChainBomStrip, {
        ...baseProps,
        ...(retailPrice && retailPrice > 0 ? { retailPrice } : {}),
      });
    }
    case "PaloAltoWhiteboardFlip":
      return React.createElement(PaloAltoWhiteboardFlip, {
        ...baseProps,
        frontFormula: topStream,
        backMonthlyPayment: hasExplicitPrimary ? primary : undefined,
      });
    case "DualTaxPlumbingSchematic": {
      const bypassRoutes: readonly [string, string, string] | undefined =
        bottomNodes && bottomNodes.length >= 3
          ? [bottomNodes[0], bottomNodes[1], bottomNodes[2]]
          : undefined;
      return React.createElement(DualTaxPlumbingSchematic, {
        ...baseProps,
        w2GrossLabel: topStream,
        ...(bypassRoutes ? { bypassRoutes } : {}),
      });
    }
    case "SovereignPrioritySpillway":
      return React.createElement(SovereignPrioritySpillway, {
        ...baseProps,
        tier1Label: bottomNodes?.[0] ?? rows?.[0]?.label,
        tier1Amount: rows?.[0]?.value,
        tier2Label: bottomNodes?.[1] ?? rows?.[1]?.label,
        tier2Amount: rows?.[1]?.value,
        tier3Label: bottomNodes?.[2] ?? rows?.[2]?.label,
      });
    case "SplitEraStrikeDiptych":
      return React.createElement(SplitEraStrikeDiptych, {
        ...baseProps,
        leftEra: bottomNodes?.[0] ?? rows?.[0]?.label,
        rightEra: bottomNodes?.[1] ?? rows?.[1]?.label,
      });
    case "VelocityMismatchChronometer":
      return React.createElement(VelocityMismatchChronometer, {
        ...baseProps,
        fastTrackLabel: rows?.[0] ? `${rows[0].label}: ${rows[0].value}` : undefined,
        slowTrackLabel: rows?.[1] ? `${rows[1].label}: ${rows[1].value}` : undefined,
        checkpoints: bottomNodes && bottomNodes.length >= 2 ? bottomNodes : undefined,
      });
    case "CircularAccountingLoop":
      return React.createElement(CircularAccountingLoop, {
        ...baseProps,
        nodeA: bottomNodes?.[0],
        nodeB: bottomNodes?.[1],
        nodeC: bottomNodes?.[2],
      });
    case "AsymmetricExchangeSimulator":
      return React.createElement(AsymmetricExchangeSimulator, {
        ...baseProps,
        droneUnitCost: rows?.[0]?.value,
        interceptorUnitCost: rows?.[1]?.value,
        carrierAssetValue: rows?.[2]?.value,
      });
    case "SubseaCableCrossSection":
      return React.createElement(SubseaCableCrossSection, {
        ...baseProps,
        cableCountLabel: rows?.[0] ? `${rows[0].value} · ${rows[0].label}` : undefined,
        dailySettlementLabel: rows?.[1]?.value,
      });
    case "LithographyNodeLock":
      return React.createElement(LithographyNodeLock, {
        ...baseProps,
        trailingFabLabel: rows?.[0] ? `${rows[0].label}: ${rows[0].value}` : undefined,
        frontierFabLabel: rows?.[1] ? `${rows[1].label}: ${rows[1].value}` : undefined,
      });
    case "CantileverBalanceScale":
    case "TransformerQueueBottleneck":
    case "WaterCoolingEvaporationTower":
    case "ContainerChokepointLock":
    case "StrategicReserveCaverns":
    case "GridFrequencyDroopGovernor":
    case "FlywheelMomentumClutch":
    case "HydraulicSiphonValve":
    case "MarginCallDominoCascade":
    case "EscapementRatchetPawn":
    case "EurodollarOffshoreFunnel":
    case "MineralRefiningBottleneck":
    case "DemographicDependencyPyramid":
    case "InsuranceRiskPoolOverflow":
    case "MunicipalBondTollgate": {
      const ParamComp = SIMULATOR_COMPONENT_BY_NAME[componentName] ?? TransformerQueueBottleneck;
      const paramProps = {
        ...baseProps,
        ...(hasExplicitPrimary ? { leftMetric: primary } : {}),
        ...(secondary && p?.secondaryMetric ? { rightMetric: secondary } : rows?.[1]?.value ? { rightMetric: rows[1].value } : {}),
      };
      return React.createElement(ParamComp, paramProps);
    }
    default: {
      const Comp = SIMULATOR_COMPONENT_BY_NAME[componentName] ?? SupplyChainBomStrip;
      return React.createElement(Comp, baseProps);
    }
  }
}

function buildSystemSimulatorRecipes(): UnifiedStyleRecipe[] {
  return SYSTEM_SIMULATOR_STYLES.map((item) => {
    const isOver = item.defaultFraming === "over-footage";
    const aliases: string[] = [item.componentName];
    if (item.id === "dual-tax-plumbing-schematic") {
      aliases.push("diagram-hydraulic-plumbing");
    }
    return {
      id: item.id,
      name: item.name,
      styleWorld: "system-simulators",
      legacyStyleFamily: "diagram-metaphor",
      componentName: item.componentName,
      defaultFraming: isOver ? "talking-head-with-glass" : "fullscreen-cutaway",
      defaultPaletteMode: isOver ? "over-footage" : "page",
      motionAction: "blueprint-unroll-x -> gear-mesh-cw -> fade-blur-out",
      typographyMode: "blueprint-dimension-callout",
      defaultSfx: "hydraulic-press",
      secondarySfx: "ratchet-winch-click",
      paceProfile: "balanced",
      domainTags: inferDomainTagsFromText(item.id, item.name, item.description, "energy-grid"),
      emotionalBeat: /spillway|guillotine|cascade|cut|lock/.test(item.id)
        ? "hard-reveal"
        : "tension-build",
      visualWeight: isOver ? "medium" : "showstopper",
      description: item.description,
      aliases,
      isLegacy24: false,
      render: (p) => renderSystemSimulatorByComponent(item.componentName, p),
    };
  });
}

function renderUiSatireByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const dataRec = readDataRecord(p);
  const rows = readTableRows(p);
  const exhibit = readExhibitData(p);
  const { primary, secondary, hasExplicitPrimary, hasExplicitSecondary } = resolveMetricTuple(p);
  const sub = p?.subtitle ?? p?.body ?? p?.spokenText;

  const baseProps: UiSatireBaseProps = {
    eyebrow: p?.eyebrow,
    title: p?.title ?? p?.headline,
    subtitle: sub,
    badgeText: exhibit?.stampLabel ?? (hasExplicitPrimary ? primary : undefined),
    sourceCitation: exhibit?.filingTitle ?? p?.sourceCitation,
    paletteMode: p?.paletteMode,
    atFrame: p?.atFrame,
  };

  switch (componentName) {
    case "LongitudinalHouseholdDossier": {
      const stage = readNum(dataRec, "activeStage");
      const activeStage: 0 | 1 | 2 | 3 | undefined =
        stage === 0 || stage === 1 || stage === 2 || stage === 3 ? stage : undefined;
      return React.createElement(LongitudinalHouseholdDossier, {
        ...baseProps,
        ...(activeStage !== undefined ? { activeStage } : {}),
      });
    }
    case "PerishableSeatVsComputeSplit":
      return React.createElement(PerishableSeatVsComputeSplit, {
        ...baseProps,
        seatCode: rows?.[0]?.label,
        gpuWindowLabel: rows?.[1]?.label,
      });
    case "ClosedComputeScripWallet":
      return React.createElement(ClosedComputeScripWallet, {
        ...baseProps,
        ...(hasExplicitPrimary ? { creditBalance: primary } : {}),
        ...(hasExplicitSecondary ? { cashHaircutPct: secondary } : {}),
      });
    case "CoalScripVsDigitalYuan":
      return React.createElement(CoalScripVsDigitalYuan, {
        ...baseProps,
        leftArtifact: rows?.[0] ? `${rows[0].label}: ${rows[0].value}` : undefined,
        rightArtifact: rows?.[1] ? `${rows[1].label}: ${rows[1].value}` : undefined,
      });
    case "FountainPenVetoSlash":
      return React.createElement(FountainPenVetoSlash, {
        ...baseProps,
        ...(hasExplicitPrimary ? { originalAmount: primary } : {}),
        ...(hasExplicitSecondary ? { slashedAmount: secondary } : {}),
        clauseText: exhibit?.highlightedClause,
      });
    case "UnwrittenTruceToAllowance":
      return React.createElement(UnwrittenTruceToAllowance, {
        ...baseProps,
        oldTerm: readStr(dataRec, "oldTerm"),
        newTerm: readStr(dataRec, "newTerm"),
      });
    case "RoofDroneEscrowShock":
    case "ThermalReceiptInflationRoll":
    case "RefinanceDenialModal":
    case "HingedBrassJawCutout":
    case "ViewerGameQuizCard":
    case "TermsOfServiceScrollTrap":
    case "DynamicSurgeMeterTag":
    case "FourEscapeHatchesBoard":
    case "SubscriptionTrapStack":
    case "AlgorithmicCreditScoreDrop":
    case "CompanyTownStoreLedger":
    case "GeoFencedSpendMapCard":
    case "ExpirationCountdownToast":
    case "AutomatedCobraSeveranceForm":
    case "BuyNowPayLaterMicroLedger":
    case "CaptivePartnerCatalogGrid":
    case "ProgrammableRuleBuilderUI":
    case "CivicDossierRedactionPlate": {
      const SatireComp = UI_SATIRE_COMPONENT_BY_NAME[componentName] ?? LongitudinalHouseholdDossier;
      const items: SatireLineItem[] | undefined =
        rows && rows.length >= 2
          ? rows.slice(0, 4).map((r, idx) => ({
              label: r.label,
              value: r.value,
              note: r.delta ?? exhibit?.filingTitle ?? "Verified Record",
              isAlert: Boolean(r.isFlagged ?? idx === 0),
            }))
          : undefined;
      const satProps = {
        ...baseProps,
        ...(hasExplicitPrimary ? { heroCallout: primary } : {}),
        ...(exhibit?.highlightedClause ? { subCallout: exhibit.highlightedClause } : {}),
        ...(items ? { items } : {}),
      };
      return React.createElement(SatireComp, satProps);
    }
    default: {
      const Comp = UI_SATIRE_COMPONENT_BY_NAME[componentName] ?? LongitudinalHouseholdDossier;
      return React.createElement(Comp, baseProps);
    }
  }
}

function buildUiSatireRecipes(): UnifiedStyleRecipe[] {
  return UI_SATIRE_COLLAGE_STYLES.map((item) => {
    const isOver = item.defaultFraming === "over-footage";
    return {
      id: item.id,
      name: item.name,
      styleWorld: "ui-satire-collage",
      legacyStyleFamily: "vintage-editorial",
      componentName: item.componentName,
      defaultFraming: isOver ? "talking-head-with-glass" : "fullscreen-cutaway",
      defaultPaletteMode: isOver ? "over-footage" : "page",
      motionAction: "receipt-feed-up -> paycheck-erode-pulse -> fade-blur-out",
      typographyMode: "veto-fountain-strike",
      defaultSfx: "nsf-decline-buzz",
      secondarySfx: "calculator-ribbon-print",
      paceProfile: isOver ? "snappy" : "balanced",
      domainTags: inferDomainTagsFromText(item.id, item.name, item.description, "household"),
      emotionalBeat: /dossier|escrow|severance|bnpl|subscription/.test(item.id)
        ? "human-stakes"
        : "ironic-contrast",
      visualWeight: isOver ? "medium" : "heavy",
      description: item.description,
      aliases: [item.componentName],
      isLegacy24: false,
      render: (p) => renderUiSatireByComponent(item.componentName, p),
    };
  });
}

function buildGenerativeSetPieceRecipes(): UnifiedStyleRecipe[] {
  const blueprintArchetypes: ReadonlyArray<{
    id: string;
    name: string;
    defaultBlueprintId: string;
    domains: readonly StyleRecipeDomainTag[];
    beat: StyleRecipeEmotionalBeat;
    sfx: string;
    desc: string;
  }> = [
    {
      id: "setpiece-bom-vaporizer",
      name: "Declarative BOM Wage-Slice Vaporizer Stage",
      defaultBlueprintId: "SP01_SHOE_LABOR_VAPORIZER",
      domains: ["labor", "ai-compute", "household"],
      beat: "hard-reveal",
      sfx: "hydraulic-press",
      desc: "Physics-driven bill-of-materials stack stripping intermediate wage layers down to physical kWh floor.",
    },
    {
      id: "setpiece-torque-balance",
      name: "Declarative Torque Fulcrum & 180° Debt Flip Stage",
      defaultBlueprintId: "SP02_PALO_ALTO_WHITEBOARD_FLIP",
      domains: ["fiscal", "household"],
      beat: "ironic-contrast",
      sfx: "anvil-iron-clank",
      desc: "2D angular-momentum balance and card-flip contraption contrasting tech deflation with fixed nominal debt.",
    },
    {
      id: "setpiece-hydraulic-spillway",
      name: "Declarative Sovereign Priority Spillway Dam Stage",
      defaultBlueprintId: "SP07_SOVEREIGN_BOND_SPILLWAY",
      domains: ["fiscal", "legal"],
      beat: "thesis-verdict",
      sfx: "vault-bolt-lock",
      desc: "Multi-weir hydraulic dam routing treasury cash to senior bondholders ahead of household dividends.",
    },
    {
      id: "setpiece-circular-spv-carousel",
      name: "Declarative Circular Vendor-SPV Financing Stage",
      defaultBlueprintId: "SP16_NVIDIA_COREWEAVE_SPV_LOOP",
      domains: ["ai-compute", "fiscal", "legal"],
      beat: "clinical-evidence",
      sfx: "ratchet-winch-click",
      desc: "Closed 3-node equity-to-compute-to-GPU-debt round-trip capital carousel.",
    },
    {
      id: "setpiece-wattage-scale-ladder",
      name: "Declarative 10W-to-5GW Logarithmic Power Ladder",
      defaultBlueprintId: "SP11_10W_TO_5GW_POWER_LADDER",
      domains: ["energy-grid", "ai-compute"],
      beat: "tension-build",
      sfx: "substation-60hz-buzz",
      desc: "Order-of-magnitude physical power comparator scaling from consumer brick to 5GW AI nuclear campus.",
    },
    {
      id: "setpiece-subsea-tension-snap",
      name: "Declarative Subsea Cable Tension & Severance Stage",
      defaultBlueprintId: "SP22_550_SUBSEA_CABLE_ANCHOR",
      domains: ["geopolitics", "ai-compute", "energy-grid"],
      beat: "hard-reveal",
      sfx: "subsea-cable-snap",
      desc: "Hookean catenary tension-and-snap contraption for transoceanic fiber and SWIFT settlement chokepoints.",
    },
  ];

  const out: UnifiedStyleRecipe[] = blueprintArchetypes.map((sp) => ({
    id: sp.id,
    name: sp.name,
    styleWorld: "generative-setpiece",
    legacyStyleFamily: "diagram-metaphor",
    componentName: "SceneBlueprintRenderer",
    defaultFraming: "fullscreen-cutaway",
    defaultPaletteMode: "page",
    motionAction: "isometric-rise -> gear-mesh-cw -> fade-blur-out",
    typographyMode: "chisel-highlighter-sweep",
    defaultSfx: sp.sfx,
    secondarySfx: "felt-highlighter",
    paceProfile: "calm-hold",
    domainTags: sp.domains,
    emotionalBeat: sp.beat,
    visualWeight: "showstopper",
    description: sp.desc,
    aliases: [sp.defaultBlueprintId],
    isLegacy24: false,
    peakOnly: true,
    render: (p) =>
      React.createElement(SceneBlueprintRenderer, {
        blueprintId: p?.blueprintId ?? sp.defaultBlueprintId,
        paletteMode: p?.paletteMode,
        themeRegister: resolveBlueprintRegister(p?.register),
        className: p?.className,
        style: p?.style,
      }),
  }));

  out.push(
    {
      id: "setpiece-isometric-diorama-3d",
      name: "Parametric Zero-WebGL 3D Isometric Diorama Stage",
      styleWorld: "generative-setpiece",
      legacyStyleFamily: "data-maps-3d",
      componentName: "IsometricDiorama3D",
      defaultFraming: "fullscreen-cutaway",
      defaultPaletteMode: "page",
      motionAction: "isometric-rise -> camera-isometric-orbit-cw -> fade-blur-out",
      typographyMode: "blueprint-dimension-callout",
      defaultSfx: "glass-expand",
      secondarySfx: "odometer-tick",
      paceProfile: "calm-hold",
      domainTags: ["energy-grid", "ai-compute", "fiscal"],
      emotionalBeat: "tension-build",
      visualWeight: "showstopper",
      description: "Memory-safe axonometric 3D architectural massing diorama with orbital sway and elevation callouts.",
      aliases: ["IsometricDiorama3D", "isometric-diorama-3d"],
      isLegacy24: false,
      render: (p) =>
        React.createElement(IsometricDiorama3D, {
          eyebrow: p?.eyebrow ?? "AXONOMETRIC TELEMETRY",
          title: p?.title ?? p?.headline ?? "Physical Infrastructure Massing",
          subtitle: p?.subtitle ?? p?.body ?? p?.spokenText,
          overFootage: p?.paletteMode === "over-footage",
        }),
    },
    {
      id: "setpiece-presenter-depth-sandwich",
      name: "Five-Plane Presenter Occlusion Depth-Sandwich Stage",
      styleWorld: "generative-setpiece",
      legacyStyleFamily: "liquid-glass",
      componentName: "PresenterDepthStage",
      defaultFraming: "talking-head-with-glass",
      defaultPaletteMode: "over-footage",
      motionAction: "depth-pass-behind-shoulders -> behind-presenter-monolith -> fade-blur-out",
      typographyMode: "behind-presenter-monolith",
      defaultSfx: "sub-bass-drop",
      secondarySfx: "glass-enter",
      paceProfile: "calm-hold",
      domainTags: ["fiscal", "household", "geopolitics"],
      emotionalBeat: "hard-reveal",
      visualWeight: "showstopper",
      description: "True 5-plane depth stage placing monolithic figures behind the presenter matte and smoked glass in front.",
      aliases: ["PresenterDepthStage", "presenter-depth-sandwich", "depth-sandwich-stage"],
      isLegacy24: false,
      peakOnly: true,
      render: (p) => {
        const { primary } = resolveMetricTuple(p);
        return React.createElement(PresenterDepthStage, {
          preset: "behind-shoulder-billboard",
          heroBackdropFigure: {
            figure: primary,
            eyebrow: p?.eyebrow ?? "SOVEREIGN DEBT MONOLITH",
            sublabel: p?.title ?? p?.headline ?? "Compounding Faster Than Payroll Receipts",
            tone: "liability",
          },
          className: p?.className,
          style: p?.style,
        });
      },
    }
  );

  return out;
}

// ============================================================================
// 4. Unified Registry Assembly, O(1) Lookup Maps & Public Resolver API
// ============================================================================

export const STYLE_RECIPES_BY_WORLD: Readonly<
  Record<StyleWorldId, readonly UnifiedStyleRecipe[]>
> = {
  "liquid-glass": buildLiquidGlassRecipes(),
  "doc-broadcast": buildDocBroadcastRecipes(),
  "vintage-editorial": buildVintageEditorialRecipes(),
  "macro-telemetry": buildMacroTelemetryRecipes(),
  "forensic-exhibits": buildForensicExhibitRecipes(),
  "diagram-metaphor": buildDiagramMetaphorRecipes(),
  "data-maps-3d": buildDataMaps3DRecipes(),
  "system-simulators": buildSystemSimulatorRecipes(),
  "ui-satire-collage": buildUiSatireRecipes(),
  "generative-setpiece": buildGenerativeSetPieceRecipes(),
};

export const ALL_STYLE_RECIPES: readonly UnifiedStyleRecipe[] = ([] as UnifiedStyleRecipe[]).concat(
  STYLE_RECIPES_BY_WORLD["liquid-glass"],
  STYLE_RECIPES_BY_WORLD["doc-broadcast"],
  STYLE_RECIPES_BY_WORLD["vintage-editorial"],
  STYLE_RECIPES_BY_WORLD["macro-telemetry"],
  STYLE_RECIPES_BY_WORLD["forensic-exhibits"],
  STYLE_RECIPES_BY_WORLD["diagram-metaphor"],
  STYLE_RECIPES_BY_WORLD["data-maps-3d"],
  STYLE_RECIPES_BY_WORLD["system-simulators"],
  STYLE_RECIPES_BY_WORLD["ui-satire-collage"],
  STYLE_RECIPES_BY_WORLD["generative-setpiece"]
);

function normalizeStyleSlug(raw: string): string {
  return raw
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9:_-]+/g, "-")
    .replace(/_/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const canonicalById: Record<string, UnifiedStyleRecipe> = {};
const recipeByIdAndAlias: Record<string, UnifiedStyleRecipe> = {};
const normalizedLookup: Record<string, UnifiedStyleRecipe> = {};

for (let i = 0; i < ALL_STYLE_RECIPES.length; i++) {
  const recipe = ALL_STYLE_RECIPES[i];
  canonicalById[recipe.id] = recipe;
  recipeByIdAndAlias[recipe.id] = recipe;
  normalizedLookup[normalizeStyleSlug(recipe.id)] = recipe;
  normalizedLookup[recipe.componentName.toLowerCase()] = recipe;
  normalizedLookup[normalizeStyleSlug(recipe.componentName)] = recipe;

  for (let a = 0; a < recipe.aliases.length; a++) {
    const alias = recipe.aliases[a];
    if (recipeByIdAndAlias[alias] === undefined) {
      recipeByIdAndAlias[alias] = recipe;
    }
    const normAlias = normalizeStyleSlug(alias);
    if (normalizedLookup[normAlias] === undefined) {
      normalizedLookup[normAlias] = recipe;
    }
  }
}

export const CANONICAL_STYLE_RECIPE_BY_ID: Readonly<Record<string, UnifiedStyleRecipe>> =
  canonicalById;

/**
 * O(1) dictionary resolving all 162 canonical recipe IDs AND all 24 original commit `534d89a`
 * legacy IDs, unprefixed module IDs, and component names.
 */
export const STYLE_RECIPE_BY_ID: Readonly<Record<string, UnifiedStyleRecipe>> =
  recipeByIdAndAlias;

export function getStyleRecipeCount(): number {
  return ALL_STYLE_RECIPES.length;
}

export function getStyleCountsByWorld(): Record<StyleWorldId, number> {
  return {
    "liquid-glass": STYLE_RECIPES_BY_WORLD["liquid-glass"].length,
    "doc-broadcast": STYLE_RECIPES_BY_WORLD["doc-broadcast"].length,
    "vintage-editorial": STYLE_RECIPES_BY_WORLD["vintage-editorial"].length,
    "macro-telemetry": STYLE_RECIPES_BY_WORLD["macro-telemetry"].length,
    "forensic-exhibits": STYLE_RECIPES_BY_WORLD["forensic-exhibits"].length,
    "diagram-metaphor": STYLE_RECIPES_BY_WORLD["diagram-metaphor"].length,
    "data-maps-3d": STYLE_RECIPES_BY_WORLD["data-maps-3d"].length,
    "system-simulators": STYLE_RECIPES_BY_WORLD["system-simulators"].length,
    "ui-satire-collage": STYLE_RECIPES_BY_WORLD["ui-satire-collage"].length,
    "generative-setpiece": STYLE_RECIPES_BY_WORLD["generative-setpiece"].length,
  };
}

export function findStyleRecipe(styleId?: string): UnifiedStyleRecipe | undefined {
  if (!styleId) return undefined;
  const trimmed = styleId.trim();
  if (!trimmed) return undefined;
  if (recipeByIdAndAlias[trimmed]) return recipeByIdAndAlias[trimmed];
  const lower = trimmed.toLowerCase();
  if (normalizedLookup[lower]) return normalizedLookup[lower];
  const slug = normalizeStyleSlug(trimmed);
  if (normalizedLookup[slug]) return normalizedLookup[slug];
  return undefined;
}

export function isRegisteredStyleId(styleId: string): boolean {
  return findStyleRecipe(styleId) !== undefined;
}

/**
 * Deterministically resolves any canonical, legacy (`534d89a`), component-hint, or fuzzy
 * style token into a valid `UnifiedStyleRecipe`. Never throws or returns `undefined`.
 */
export function resolveStyleRecipe(styleId?: string): UnifiedStyleRecipe {
  const exact = findStyleRecipe(styleId);
  if (exact) return exact;

  if (styleId) {
    const tokens = normalizeStyleSlug(styleId)
      .split("-")
      .filter((t) => t.length >= 2);
    let bestRecipe: UnifiedStyleRecipe | undefined;
    let bestScore = 0;

    for (let i = 0; i < ALL_STYLE_RECIPES.length; i++) {
      const candidate = ALL_STYLE_RECIPES[i];
      const hay = `${candidate.id} ${candidate.name} ${candidate.componentName} ${candidate.styleWorld}`.toLowerCase();
      let score = 0;
      for (let t = 0; t < tokens.length; t++) {
        const tok = tokens[t];
        if (candidate.id.indexOf(tok) !== -1) score += 12;
        else if (hay.indexOf(tok) !== -1) score += 5;
      }
      if (score > bestScore) {
        bestScore = score;
        bestRecipe = candidate;
      }
    }
    if (bestRecipe && bestScore > 0) {
      return bestRecipe;
    }
    if (/glass|overlay|dock|pill|toast/i.test(styleId)) {
      return canonicalById["liquid-glass-card"];
    }
  }

  return canonicalById["doc-caption-news"] ?? ALL_STYLE_RECIPES[0];
}

export function renderStyleRecipe(
  styleId: string,
  props?: StyleRecipeRenderProps
): React.ReactElement {
  const recipe = resolveStyleRecipe(styleId);
  return recipe.render(props);
}

export interface StyleRecipeRendererProps extends StyleRecipeRenderProps {
  styleId: string;
}

export const StyleRecipeRenderer: React.FC<StyleRecipeRendererProps> = ({
  styleId,
  ...renderProps
}) => {
  return renderStyleRecipe(styleId, renderProps);
};

/**
 * Converts any `UnifiedStyleRecipe` into the legacy `director/schema.ts` `StyleRecipe` shape
 * so `planner.ts` and `strategyPresets.ts` (`R43–R47` guardrails) work without modification.
 */
export function toLegacyPlannerStyleRecipe(recipe: UnifiedStyleRecipe): StyleRecipe {
  const validGlass =
    recipe.glassPresetId === "card" ||
    recipe.glassPresetId === "split-modal"
      ? recipe.glassPresetId
      : recipe.glassPresetId === "corner-pill"
        ? "pill"
        : recipe.glassPresetId === "bottom-dock"
          ? "dock"
          : recipe.glassPresetId === "toast-alert"
            ? "toast"
            : undefined;

  return {
    id: recipe.id,
    styleFamily: recipe.legacyStyleFamily,
    componentHint: recipe.componentName,
    framing: recipe.defaultFraming,
    motionAction: recipe.motionAction,
    ...(validGlass ? { glassPreset: validGlass } : {}),
    typographyMode: recipe.typographyMode,
    defaultSfx: recipe.defaultSfx,
    ...(recipe.secondarySfx ? { secondarySfx: recipe.secondarySfx } : {}),
    paceProfile: recipe.paceProfile,
    ...(recipe.peakOnly ? { peakOnly: true } : {}),
  };
}
