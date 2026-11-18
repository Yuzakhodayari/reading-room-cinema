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
import { CameraFraming, StyleEngineFamily, StyleRecipe } from "../director/schema";
import { IsometricDiorama3D } from "../generative/IsometricDiorama3D";
import { SceneBlueprintRenderer } from "../generative/SceneBlueprintRenderer";
import { CorridorId } from "../maps";
import { DataTicker } from "../typography/DataTicker";
import { EditorialHeadline } from "../typography/EditorialHeadline";
import { KineticText } from "../typography/KineticText";
import {
  BlobSimulation,
  CorridorArcMatrixCard,
  DATA_MAPS_3D_STYLES,
  DataPhysicalCard,
  IsometricStrataCutaway3D,
  MapExplainer,
  WhiteModel3D,
} from "./dataMaps3D";
import {
  CollageCutout as DiagramCollageCutout,
  DIAGRAM_METAPHOR_STYLES,
  InstructionManualCard,
  IsometricScene,
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

function renderGlassPresetById(
  presetId: GlassPresetId,
  p?: StyleRecipeRenderProps
): React.ReactElement {
  const title = p?.title ?? p?.headline ?? "Primary Fiscal Record";
  const sub = p?.subtitle ?? p?.body ?? "Verified primary-source ledger metric";
  const metric = p?.metric ?? "84.1%";
  const secMetric = p?.secondaryMetric ?? "7.1%";
  const cite = p?.sourceCitation ?? "U.S. Treasury Monthly Statement, Table 9";

  switch (presetId) {
    case "card":
      return React.createElement(GlassCard, {
        title,
        badge: p?.eyebrow ?? "Key Record",
        subtitle: sub,
        metric: { value: metric, label: "Primary Share", delta: p?.delta },
        citation: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "corner-pill":
      return React.createElement(GlassCornerPill, {
        label: title,
        value: metric,
        badge: p?.eyebrow ?? "LIVE",
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "bottom-dock":
      return React.createElement(GlassBottomDock, {
        caption: p?.eyebrow ?? "FISCAL SPLIT",
        items: [
          { label: title, value: metric, active: true },
          { label: "Corporate Share", value: secMetric },
          { label: "Debt Service", value: "$1.18T" },
        ],
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "floating-toolbar":
      return React.createElement(GlassFloatingToolbar, {
        prefix: p?.eyebrow ?? "ACT",
        items: [
          { tag: "I", label: title },
          { tag: "II", label: "Mechanism" },
          { tag: "III", label: "Verdict" },
        ],
        rightSlot: metric,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "toast-alert":
      return React.createElement(GlassToastAlert, {
        title,
        message: sub,
        variant: "warning",
        tag: p?.eyebrow ?? "Risk Flag",
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "split-modal":
      return React.createElement(GlassSplitModal, {
        title,
        eyebrow: p?.eyebrow ?? "Bilateral Comparison",
        left: { label: "Payroll Share", value: metric, highlight: true },
        right: { label: "Corporate Share", value: secMetric, isRisk: true },
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
            exhibitCode: "EX-01",
            title,
            excerpt: sub,
            metricValue: metric,
            stamp: "VERIFIED",
          },
          {
            exhibitCode: "EX-02",
            title: "Statutory Counter-Record",
            excerpt: cite,
            metricValue: secMetric,
            isRisk: true,
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
          { code: "01", label: "Baseline Lock", value: metric, status: "verified" },
          { code: "02", label: "Structural Shift", value: secMetric, status: "risk" },
          { code: "03", label: "Primary Source", detail: cite, status: "verified" },
        ],
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "magnifier-card":
      return React.createElement(GlassMagnifierCard, {
        title,
        clauseCode: p?.eyebrow ?? "STATUTORY ZOOM",
        focusedSnippet: sub,
        citation: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "telemetry-strip":
      return React.createElement(GlassTelemetryStrip, {
        tag: p?.eyebrow ?? "LIVE TELEMETRY",
        channels: [
          { label: "Primary", value: metric, delta: p?.delta ?? "+2.3%" },
          { label: "Secondary", value: secMetric, isRisk: true },
          { label: "Net Carry", value: "$1.18T", isRisk: true },
        ],
        sourceTag: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "verdict-seal":
      return React.createElement(GlassVerdictSeal, {
        stampLabel: p?.eyebrow ?? "STATUTORY LOCK",
        headline: title,
        docketOrStatute: cite,
        impactFigure: metric,
        impactSubtext: sub,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "compare-scale":
      return React.createElement(GlassCompareScale, {
        title,
        eyebrow: p?.eyebrow ?? "Asymmetric Scale",
        leftPan: { label: "Wage Base", displayValue: metric, weight: 84 },
        rightPan: { label: "Corporate Tax", displayValue: secMetric, weight: 7, isRisk: true },
        fulcrumLabel: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "timeline-scrubber":
      return React.createElement(GlassTimelineScrubber, {
        title: p?.eyebrow ?? "CHRONOLOGY",
        milestones: [
          { year: 1955, label: "Parity", value: "30%" },
          { year: 2000, label: "Decoupling", value: "79%" },
          { year: 2026, label: title, value: metric, isRisk: true },
        ],
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "receipt-ticker":
      return React.createElement(GlassReceiptTicker, {
        headerTitle: title,
        lines: [
          { label: "Gross Inflow", amount: "+$4,420.00" },
          { label: "Fixed Debt & Escrow", amount: "-$3,818.00", isDeduction: true },
          { label: sub, amount: metric, highlight: true },
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
          { tickerOrKey: "PRIMARY", field: title, value: metric, status: "alert" },
          { tickerOrKey: "OFFSET", field: "Secondary", value: secMetric, status: "nominal" },
          { tickerOrKey: "SOURCE", field: "Filing", value: cite, status: "muted" },
        ],
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "map-callout":
      return React.createElement(GlassMapCallout, {
        locationName: title,
        corridorTag: p?.eyebrow ?? "CHOKEPOINT",
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
          { label: "Payroll Share", value: metric, delta: p?.delta ?? "+2.3%", isRisk: true },
          { label: "Corporate Tax", value: secMetric, delta: "-3.7%" },
          { label: "Interest Wall", value: "$1.18T", isRisk: true },
        ],
        citation: cite,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      });
    case "quote-citation":
      return React.createElement(GlassQuoteCitation, {
        quote: sub,
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
    "Corporate income tax collections declined to 7.1% across the same fiscal window.";
  const cite = p?.sourceCitation ?? "U.S. Treasury Monthly Statement, Table 9";
  const metric = p?.metric ?? "84.1%";
  const mode = p?.paletteMode;

  switch (componentName) {
    case "NewsPackageLowerThird":
      return React.createElement(NewsPackageLowerThird, {
        title,
        source: cite,
        category: p?.eyebrow ?? "Fiscal Report",
        subheadline: sub,
        metricBadge: metric,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "CaptionNewsCard":
      return React.createElement(CaptionNewsCard, {
        headline: title,
        body: sub,
        dateline: p?.eyebrow ?? "TREASURY DISPATCH",
        metric,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "VisualInvestigationBoard":
      return React.createElement(VisualInvestigationBoard, {
        boardTitle: title,
        caseCode: p?.eyebrow ?? "EXHIBIT BOARD 01",
        summaryNote: sub,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
        evidenceItems: [
          { id: "ev-1", label: "Payroll Share", value: metric, delta: p?.delta ?? "+2.3%", isFlagged: true },
          { id: "ev-2", label: "Corporate Share", value: p?.secondaryMetric ?? "7.1%", delta: "-3.7%" },
          { id: "ev-3", label: "Net Interest Wall", value: "$1.18T", isFlagged: true },
        ],
      });
    case "ArchiveLightTable":
      return React.createElement(ArchiveLightTable, {
        folioCode: p?.eyebrow ?? "PLATEN 04 · 5000K DAYLIGHT",
        title,
        caption: sub,
        sourceCitation: cite,
      });
    case "LiveCountdownSplit":
      return React.createElement(LiveCountdownSplit, {
        leftTitle: title,
        rightTitle: sub,
        metric,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "TelestratorOverlay":
      return React.createElement(TelestratorOverlay, {
        targetLabel: p?.eyebrow ?? "STATUTORY ANOMALY",
        calloutText: metric,
        evidenceTitle: title,
        evidenceSubtitle: sub,
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
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "CitySymphonyFrame":
      return React.createElement(CitySymphonyFrame, {
        locationTag: p?.eyebrow ?? "WASHINGTON, D.C.",
        title,
        metric,
      });
    case "SplitScreenFrame":
      return React.createElement(SplitScreenFrame, {
        leftTitle: title,
        rightTitle: sub,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "QuoteHighlightCard":
      return React.createElement(QuoteHighlightCard, {
        quote: sub,
        speaker: title,
        sourceCitation: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    case "DataCalloutLowerThird":
      return React.createElement(DataCalloutLowerThird, {
        value: metric,
        label: title,
        delta: p?.delta,
        source: cite,
        paletteMode: mode,
        atFrame: p?.atFrame,
      });
    default:
      return React.createElement(BreakingBanner, {
        headline: title,
        kicker: p?.eyebrow ?? "STATUTORY BULLETIN",
        subheadline: sub,
        keyFigure: metric,
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
    "Nominal contracts remained fixed at par while farm and wage receipts contracted sharply.";
  const cite = p?.sourceCitation ?? "National Archives Primary Collection";
  const metric = p?.metric ?? "-48% WAGES";

  switch (componentName) {
    case "Newsreel1920s":
      return React.createElement(Newsreel1920s, {
        headline: title,
        tickerCaption: sub,
        metricBadge: metric,
        placeDate: p?.eyebrow ?? "NEW YORK · 1929",
        atFrame: p?.atFrame,
      });
    case "SilentFilmCard":
      return React.createElement(SilentFilmCard, {
        title,
        dialogue: sub,
        actLabel: p?.eyebrow ?? "ACT II",
        sourceNote: cite,
        atFrame: p?.atFrame,
      });
    case "CollageCutout":
      return React.createElement(CollageCutout, {
        eyebrow: p?.eyebrow ?? "ARCHIVE CLIPPING",
        title,
        metric,
        caption: sub,
        sourceCitation: cite,
        paletteMode: p?.paletteMode ?? "page",
        atFrame: p?.atFrame,
      });
    case "SpyTitleSequence":
      return React.createElement(SpyTitleSequence, {
        title,
        subtitle: sub,
        clearance: p?.eyebrow ?? "DECLASSIFIED DOSSIER",
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
    case "DepressionLedger1930s":
      return React.createElement(DepressionLedger1930s, {
        title,
        summaryCallout: sub,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    case "CompanyScripVoucher":
      return React.createElement(CompanyScripVoucher, {
        issuerName: title,
        denomination: metric,
        restrictionClause: sub,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    case "BrettonWoodsCable":
      return React.createElement(BrettonWoodsCable, {
        subject: title,
        parityFigure: metric,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    case "BroadsheetFrontpage":
      return React.createElement(BroadsheetFrontpage, {
        bannerHeadline: title,
        leadBody: sub,
        sideMetricValue: metric,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    default:
      return React.createElement(MicroficheReaderStage, {
        rollIndex: p?.eyebrow ?? "MICROFILM REEL 88-C",
        documentTitle: title,
        keyExcerpt: sub,
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
  const sub = p?.subtitle ?? p?.body ?? "Step-by-step physical and statutory constraint flow.";
  const cite = p?.sourceCitation ?? "Reading Room Technical Schematic";
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
        metricValue: p?.metric,
        caption: cite,
        atFrame: p?.atFrame,
      });
    case "InstructionManualCard":
      return React.createElement(InstructionManualCard, {
        title,
        subtitle: sub,
        eyebrow: p?.eyebrow ?? "SPEC MANUAL · REV 04",
        footnote: cite,
        mode: displayMode,
        atFrame: p?.atFrame,
      });
    case "CollageCutout":
      return React.createElement(DiagramCollageCutout, {
        mode: p?.paletteMode === "over-footage" ? "card" : "page",
        eyebrow: p?.eyebrow ?? "ARCHIVAL CLIPPING",
        title,
        subtitle: sub,
        stampText: p?.metric ?? "EXHIBIT A",
        atFrame: p?.atFrame,
      });
    case "IsometricScene":
      return React.createElement(IsometricScene, {
        eyebrow: p?.eyebrow ?? "ISOMETRIC ELEVATION",
        title,
        subtitle: sub,
        footnote: cite,
      });
    default:
      return React.createElement(PatentExplodedDiagram, {
        patentNumber: p?.eyebrow ?? "U.S. PATENT SPEC · EXPLODED VIEW",
        title,
        subtitle: sub,
        atFrame: p?.atFrame,
      });
  }
}

function renderDataMaps3DByComponent(
  componentName: string,
  p?: StyleRecipeRenderProps,
  forceTransitCorridor?: boolean
): React.ReactElement {
  const title = p?.title ?? p?.headline;
  const sub = p?.subtitle ?? p?.body;
  const cite = p?.sourceCitation;
  const displayMode = p?.paletteMode === "over-footage" ? "over-footage" : "page";

  switch (componentName) {
    case "MapExplainer":
      return React.createElement(MapExplainer, {
        corridorId: p?.corridorId ?? (forceTransitCorridor ? "PJM_GRID" : undefined),
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        metricValue: p?.metric,
        sourceCitation: cite,
        paletteMode: p?.paletteMode ?? "page",
        atFrame: p?.atFrame,
      });
    case "DataPhysicalCard":
      return React.createElement(DataPhysicalCard, {
        mode: displayMode,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        sourceCitation: cite,
        atFrame: p?.atFrame,
      });
    case "WhiteModel3D":
      return React.createElement(WhiteModel3D, {
        mode: displayMode,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        datumLabel: cite,
        atFrame: p?.atFrame,
      });
    case "BlobSimulation":
      return React.createElement(BlobSimulation, {
        mode: displayMode,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        throughputMetric: p?.metric,
        atFrame: p?.atFrame,
      });
    case "CorridorArcMatrixCard":
      return React.createElement(CorridorArcMatrixCard, {
        corridorId: p?.corridorId ?? "TAIWAN_STRAIT_2NM",
        eyebrow: p?.eyebrow,
        title,
        paletteMode: p?.paletteMode ?? "page",
        atFrame: p?.atFrame,
      });
    default:
      return React.createElement(IsometricStrataCutaway3D, {
        mode: displayMode,
        eyebrow: p?.eyebrow,
        title,
        subtitle: sub,
        atFrame: p?.atFrame,
      });
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
      render: (p) =>
        React.createElement(KineticText, {
          text: p?.title ?? p?.headline ?? p?.body ?? "Nominal debt holds par while real wages adjust.",
          mode: "chisel-highlighter-sweep",
          paletteMode: p?.paletteMode ?? "page",
          atFrame: p?.atFrame,
          duration: p?.duration,
          enableSfx: p?.enableSfx,
          className: p?.className,
          style: p?.style,
        }),
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
          subtitle: p?.subtitle ?? p?.body,
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

function buildMacroTelemetryRecipes(): UnifiedStyleRecipe[] {
  const out: UnifiedStyleRecipe[] = MACRO_TELEMETRY_STYLES.map((item) => {
    const Comp = MACRO_COMPONENT_BY_NAME[item.componentName] ?? DivergingJawsChart;
    return {
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
      render: (p) =>
        React.createElement(Comp, {
          kicker: p?.eyebrow,
          title: p?.title ?? p?.headline,
          subtitle: p?.subtitle ?? p?.body,
          heroBadge: p?.metric,
          sourceCitation: p?.sourceCitation,
          paletteMode: p?.paletteMode,
          atFrame: p?.atFrame,
        }),
    };
  });

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
    render: (p) =>
      React.createElement(DataTicker, {
        value: p?.metric ?? "$40.5T",
        label: p?.title ?? p?.headline ?? "Federal Gross Debt",
        delta: p?.delta ? { value: p.delta } : undefined,
        paletteMode: p?.paletteMode ?? "page",
        atFrame: p?.atFrame,
        duration: p?.duration,
        enableSfx: p?.enableSfx,
        className: p?.className,
        style: p?.style,
      }),
  });

  return out;
}

function buildForensicExhibitRecipes(): UnifiedStyleRecipe[] {
  const out: UnifiedStyleRecipe[] = FORENSIC_EXHIBIT_STYLES.map((item) => {
    const Comp = FORENSIC_COMPONENT_BY_NAME[item.componentName] ?? FiscalLedgerTableStage;
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
      render: (p) =>
        React.createElement(Comp, {
          docketCode: p?.eyebrow,
          title: p?.title ?? p?.headline,
          subtitle: p?.subtitle ?? p?.body,
          verdictBadge: p?.metric,
          sourceCitation: p?.sourceCitation,
          paletteMode: p?.paletteMode,
          atFrame: p?.atFrame,
        }),
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

function buildSystemSimulatorRecipes(): UnifiedStyleRecipe[] {
  return SYSTEM_SIMULATOR_STYLES.map((item) => {
    const Comp = SIMULATOR_COMPONENT_BY_NAME[item.componentName] ?? SupplyChainBomStrip;
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
      render: (p) =>
        React.createElement(Comp, {
          eyebrow: p?.eyebrow,
          title: p?.title ?? p?.headline,
          subtitle: p?.subtitle ?? p?.body,
          summaryMetric: p?.metric,
          sourceCitation: p?.sourceCitation,
          paletteMode: p?.paletteMode,
          atFrame: p?.atFrame,
        }),
    };
  });
}

function buildUiSatireRecipes(): UnifiedStyleRecipe[] {
  return UI_SATIRE_COLLAGE_STYLES.map((item) => {
    const Comp = UI_SATIRE_COMPONENT_BY_NAME[item.componentName] ?? LongitudinalHouseholdDossier;
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
      render: (p) =>
        React.createElement(Comp, {
          eyebrow: p?.eyebrow,
          title: p?.title ?? p?.headline,
          subtitle: p?.subtitle ?? p?.body,
          badgeText: p?.metric,
          sourceCitation: p?.sourceCitation,
          paletteMode: p?.paletteMode,
          atFrame: p?.atFrame,
        }),
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
          subtitle: p?.subtitle ?? p?.body,
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
      render: (p) =>
        React.createElement(PresenterDepthStage, {
          preset: "behind-shoulder-billboard",
          heroBackdropFigure: {
            figure: p?.metric ?? "$40.5T",
            eyebrow: p?.eyebrow ?? "SOVEREIGN DEBT MONOLITH",
            sublabel: p?.title ?? p?.headline ?? "Compounding Faster Than Payroll Receipts",
            tone: "liability",
          },
          className: p?.className,
          style: p?.style,
        }),
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
