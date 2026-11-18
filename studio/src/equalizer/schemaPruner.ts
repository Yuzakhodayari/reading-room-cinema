import {
  ExtractedFact,
  ScriptLock,
  SentenceLock,
  getSentenceSpan,
} from "./scriptLock";
import {
  ARCHETYPE_FAMILY_MAP,
  ArchetypeFamily,
  ArchetypePayload,
  BEAT_ARCHETYPES,
  BeatArchetype,
  BeatNode,
  EMOTIONAL_REGISTERS,
  EmotionalRegister,
  IRNarrativeEngine,
  StoryboardIR,
  SubBeatStep,
} from "./storyboardIR";

/**
 * Pillar #15 — Dynamic Schema Pruner & Creativity Escalator (`schemaPruner.ts`)
 *
 * 1. `computeAllowedChoices(...)`: Masks ineligible and recently used archetypes
 *    BEFORE LLM decoding so smaller models cannot repeat templates or violate R43–R47.
 * 2. `escalateFlatBeats(...)`: Promotes generic/flat cards from weaker drafts into
 *    bespoke animated contraptions, split-era diptychs, plumbing schematics,
 *    cartographic stages, or behind-presenter depth sandwiches.
 */

export interface CandidateBeatContext {
  readonly beatId?: string;
  readonly sentences: readonly SentenceLock[];
  readonly facts: readonly ExtractedFact[];
  readonly normalizedPosition?: number;
  readonly hasEntityCallback?: boolean;
  readonly forbiddenEngines?: readonly IRNarrativeEngine[];
}

export interface RecentBeatChoice {
  readonly beatId: string;
  readonly archetype: BeatArchetype;
  readonly styleRecipeId?: string;
}

export interface EpisodeVaultCooldownEntry {
  readonly lastUsedEpisodesAgo: number;
  readonly usageCountLast5Episodes: number;
}

export type EpisodeVaultCooldownMap = Readonly<
  Record<string, EpisodeVaultCooldownEntry>
>;

export interface AllowedChoicesResult {
  readonly allowedArchetypes: readonly BeatArchetype[];
  readonly allowedFamilies: readonly ArchetypeFamily[];
  readonly allowedRegisters: readonly EmotionalRegister[];
  readonly recommendedSetPieceIds: readonly string[];
  readonly prunedReasons: Readonly<Record<string, string>>;
  readonly jsonSchemaMask: {
    readonly type: "string";
    readonly enum: readonly BeatArchetype[];
  };
}

export interface EscalationLogEntry {
  readonly beatId: string;
  readonly fromArchetype: BeatArchetype;
  readonly toArchetype: BeatArchetype;
  readonly reason: string;
}

export interface EscalationResult {
  readonly ir: StoryboardIR;
  readonly escalatedBeatIds: readonly string[];
  readonly log: readonly EscalationLogEntry[];
}

// ============================================================================
// Shannon Entropy & Vault Decay Math
// ============================================================================

export function computeShannonEntropy(items: readonly string[]): number {
  if (items.length <= 1) {
    return 0;
  }
  const counts: Record<string, number> = {};
  for (let i = 0; i < items.length; i++) {
    const key = items[i];
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const keys = Object.keys(counts);
  let entropy = 0;
  const total = items.length;
  for (let i = 0; i < keys.length; i++) {
    const p = counts[keys[i]] / total;
    if (p > 0) {
      entropy -= p * (Math.log(p) / Math.LN2);
    }
  }
  return entropy;
}

export function computeCrossEpisodeCooldownPenalty(
  entry: EpisodeVaultCooldownEntry | undefined,
): number {
  if (!entry || entry.usageCountLast5Episodes <= 0) {
    return 0;
  }
  const deltaEp = Math.max(1, entry.lastUsedEpisodesAgo);
  const decay = Math.exp(-deltaEp / 2.5);
  return Math.min(1, decay * (0.45 + 0.2 * entry.usageCountLast5Episodes));
}

// ============================================================================
// Geographic & Mechanical Cue Detectors
// ============================================================================

export function detectGeoCorridorFromText(verbatimText: string): string | undefined {
  if (/\bPJM\b|Illinois to New Jersey|Three Mile Island/i.test(verbatimText)) {
    return "PJM_GRID";
  }
  if (/West London|M4 corridor/i.test(verbatimText)) {
    return "WEST_LONDON_M4";
  }
  if (/Austin,\s*Texas|Austin August/i.test(verbatimText)) {
    return "AUSTIN_TEXAS";
  }
  if (/Paint Creek|Logan County|West Virginia/i.test(verbatimText)) {
    return "LOGAN_COUNTY_WV";
  }
  if (/Alaska|Juneau/i.test(verbatimText)) {
    return "ALASKA_JUNEAU";
  }
  if (/Rotterdam/i.test(verbatimText)) {
    return "ROTTERDAM_PORT";
  }
  if (/Detroit/i.test(verbatimText)) {
    return "DETROIT_AUTO";
  }
  if (/Memphis/i.test(verbatimText)) {
    return "MEMPHIS_FREIGHT_HUB";
  }
  if (/Shenzhen/i.test(verbatimText)) {
    return "SHENZHEN_DELTA";
  }
  if (/Palo Alto|Silicon Valley/i.test(verbatimText)) {
    return "SILICON_VALLEY_PALO_ALTO";
  }
  if (/Taiwan|TSMC/i.test(verbatimText)) {
    return "TAIWAN_STRAIT_2NM";
  }
  return undefined;
}

export function recommendSetPiecesForText(verbatimText: string): string[] {
  const recs: string[] = [];
  if (/running shoes|dental X-ray|unit costs/i.test(verbatimText)) {
    recs.push("running-shoe-80pct-labor-vaporizer");
  }
  if (/whiteboard|thirty-year loan/i.test(verbatimText)) {
    recs.push("palo-alto-whiteboard-180-loan-flip");
  }
  if (/tax plumbing|withholding|Ireland|borrow cash/i.test(verbatimText)) {
    recs.push("w2-guillotine-vs-ireland-tax-plumbing");
  }
  if (/dockworkers|robotic cranes|driverless trucks/i.test(verbatimText)) {
    recs.push("1955-pier-vs-2034-robotic-port");
  }
  if (/veto pen|Walker|cut every check in half/i.test(verbatimText)) {
    recs.push("alaska-governor-veto-pen-slash");
  }
  if (/bondholders always get paid first|debt-ceiling/i.test(verbatimText)) {
    recs.push("federal-bond-priority-spillway");
  }
  if (/plane pushes back|empty seat|spoils on the clock/i.test(verbatimText)) {
    recs.push("empty-gate-14a-expiring-compute");
  }
  if (/cloud credits|twenty percent fee|scrip|yuan/i.test(verbatimText)) {
    recs.push("closed-scrip-wallet-20pct-exit-toll");
  }
  if (/phone charger|microwaves|five gigawatts/i.test(verbatimText)) {
    recs.push("10w-charger-to-5gw-power-ladder");
  }
  if (/six months|permitting|five to ten years/i.test(verbatimText)) {
    recs.push("6mo-agent-vs-10yr-permitting-race");
  }
  if (/ration points|Ministry of Food/i.test(verbatimText)) {
    recs.push("1941-uk-16-point-ration-counter");
  }
  return recs;
}

// ============================================================================
// Dynamic Schema Pruner (`computeAllowedChoices`)
// ============================================================================

/**
 * Deterministically prunes ineligible, recently used, or entropy-degrading
 * archetypes prior to LLM decoding.
 */
export function computeAllowedChoices(
  beat: CandidateBeatContext,
  recentHistory: readonly RecentBeatChoice[],
  episodeVaultCooldowns?: EpisodeVaultCooldownMap,
): AllowedChoicesResult {
  const prunedReasons: Record<string, string> = {};
  const allowedSet = new Set<BeatArchetype>(BEAT_ARCHETYPES);

  const remove = (arch: BeatArchetype, reason: string): void => {
    if (allowedSet.has(arch)) {
      allowedSet.delete(arch);
      prunedReasons[arch] = reason;
    }
  };

  const totalWords = beat.sentences.reduce((acc, s) => acc + s.wordCount, 0);
  const singleStaccato =
    beat.sentences.length === 1 &&
    beat.sentences[0].cadenceClass === "STACCATO_PUNCH" &&
    totalWords <= 6;

  const numericFacts = beat.facts.filter(
    (f) =>
      f.kind === "CURRENCY" ||
      f.kind === "PERCENT" ||
      f.kind === "PHYSICAL_UNIT" ||
      f.kind === "MULTIPLIER",
  );
  const docCiteFacts = beat.facts.filter((f) => f.kind === "LEGAL_OR_DOC_CITE");
  const fullText = beat.sentences.map((s) => s.verbatim).join(" ");

  // 1. Cadence Gate (<= 6w Staccato Punch)
  if (singleStaccato) {
    for (let i = 0; i < BEAT_ARCHETYPES.length; i++) {
      const arch = BEAT_ARCHETYPES[i];
      const keepForPunch =
        arch === "KINETIC_THESIS_STRIKE" ||
        arch === "QUESTION_PIVOT" ||
        (arch === "STAT_MONOLITH" && numericFacts.length >= 1);
      if (!keepForPunch) {
        remove(arch, "Single <=6w STACCATO_PUNCH restricted to kinetic strike/pivot");
      }
    }
  } else {
    // 2. Fact-Arity Gate
    if (numericFacts.length === 0) {
      remove("DUAL_SERIES_DIVERGENCE", "Requires >= 2 numeric facts");
      remove("COMPOSITION_STACK", "Requires >= 2 numeric facts");
      remove("THRESHOLD_CROSSING", "Requires >= 2 numeric facts");
      remove("MULTIPLIER_SCALE_LADDER", "Requires >= 3 numeric/unit facts");
      remove("STAT_MONOLITH", "Requires >= 1 numeric fact");
      remove("DEPTH_SANDWICH_STAGE", "Requires >= 1 primary numeric fact");
    } else if (numericFacts.length < 2) {
      remove("DUAL_SERIES_DIVERGENCE", "Requires >= 2 comparable numeric facts");
      remove("COMPOSITION_STACK", "Requires >= 2 stack facts");
      remove("THRESHOLD_CROSSING", "Requires baseline + crossing numeric facts");
      remove("MULTIPLIER_SCALE_LADDER", "Requires >= 3 scale rung facts");
    } else if (numericFacts.length < 3) {
      remove("MULTIPLIER_SCALE_LADDER", "Requires >= 3 scale rung facts");
    }

    if (docCiteFacts.length === 0) {
      remove("COURT_RULING_EXHIBIT", "Requires LEGAL_OR_DOC_CITE fact");
      remove("DOCUMENT_LEDGER_HIGHLIGHT", "Requires LEGAL_OR_DOC_CITE fact");
    } else if (!/\bv\.\s+[A-Z]|Supreme Court|ruling|sued/i.test(fullText)) {
      remove("COURT_RULING_EXHIBIT", "No judicial case citation in beat");
    }

    if (totalWords > 16) {
      remove("STAT_MONOLITH", "STAT_MONOLITH banned on >16w analytical spans (A42)");
    }
  }

  // 3. Forbidden-Engine Guardrails (R43–R47)
  const forbidden = beat.forbiddenEngines ?? ["clocked", "street", "field"];
  const normPos = beat.normalizedPosition ?? 0.5;
  if (forbidden.indexOf("ladder") !== -1 && normPos < 0.12) {
    remove(
      "MULTIPLIER_SCALE_LADDER",
      "R45: Abstract scale ladder banned in opening hook (< 0.12)",
    );
  }
  if (forbidden.indexOf("artifact") !== -1 && docCiteFacts.length === 0) {
    remove("DOCUMENT_LEDGER_HIGHLIGHT", "R47: Artifact banned without primary filing");
    remove("COURT_RULING_EXHIBIT", "R47: Artifact banned without primary ruling");
  }

  // 4. Recency & Sliding-Window Shannon Entropy Mask
  const histLen = recentHistory.length;
  if (histLen >= 1) {
    const prevArch = recentHistory[histLen - 1].archetype;
    remove(prevArch, `Adjacent repeat banned (used in ${recentHistory[histLen - 1].beatId})`);
  }

  // Mask last 4 beats on non-punch spans so 8-beat windows always carry >= 5 distinct types (H >= 2.25)
  if (!singleStaccato && histLen >= 2) {
    const recent4Start = Math.max(0, histLen - 4);
    for (let i = recent4Start; i < histLen - 1; i++) {
      remove(
        recentHistory[i].archetype,
        `4-beat recency cooldown (used in ${recentHistory[i].beatId})`,
      );
    }
  }

  // A42 STAT_MONOLITH 8-beat cooldown
  const lookback8Start = Math.max(0, histLen - 8);
  for (let i = lookback8Start; i < histLen; i++) {
    if (recentHistory[i].archetype === "STAT_MONOLITH") {
      remove("STAT_MONOLITH", "A42 cooldown: STAT_MONOLITH used within last 8 beats");
      break;
    }
  }

  // Family 2-run cooldown
  if (histLen >= 2) {
    const fam1 = ARCHETYPE_FAMILY_MAP[recentHistory[histLen - 1].archetype];
    const fam2 = ARCHETYPE_FAMILY_MAP[recentHistory[histLen - 2].archetype];
    if (fam1 === fam2) {
      for (let i = 0; i < BEAT_ARCHETYPES.length; i++) {
        const cand = BEAT_ARCHETYPES[i];
        if (ARCHETYPE_FAMILY_MAP[cand] === fam1) {
          if (cand === "CHARACTER_BALANCE_SHEET" && beat.hasEntityCallback) {
            continue;
          }
          remove(cand, `Family ${fam1} appeared twice consecutively`);
        }
      }
    }
  }

  // 8-beat window entropy lookahead (H >= 2.25 bits)
  if (histLen >= 7) {
    const window7 = recentHistory.slice(histLen - 7).map((h) => h.archetype);
    for (let i = 0; i < BEAT_ARCHETYPES.length; i++) {
      const cand = BEAT_ARCHETYPES[i];
      if (!allowedSet.has(cand)) {
        continue;
      }
      const projectedEntropy = computeShannonEntropy([...window7, cand]);
      if (projectedEntropy < 2.25) {
        remove(
          cand,
          `8-beat window Shannon entropy would drop to ${projectedEntropy.toFixed(2)} < 2.25 bits`,
        );
      }
    }
  }

  // 5. Cross-Episode Novelty Vault Cooldowns
  if (episodeVaultCooldowns) {
    for (let i = 0; i < BEAT_ARCHETYPES.length; i++) {
      const cand = BEAT_ARCHETYPES[i];
      if (!allowedSet.has(cand) || allowedSet.size <= 3) {
        continue;
      }
      const penalty = computeCrossEpisodeCooldownPenalty(episodeVaultCooldowns[cand]);
      if (penalty > 0.68) {
        remove(
          cand,
          `Cross-episode vault cooldown penalty ${penalty.toFixed(2)} > 0.68`,
        );
      }
    }
  }

  // 6. Guaranteed Non-Empty Safety Net (>= 2 valid choices, avoiding recent 4-beat window)
  const recent4Used = new Set<BeatArchetype>(
    recentHistory.slice(Math.max(0, histLen - 4)).map((h) => h.archetype),
  );
  const immediatePrev = histLen >= 1 ? recentHistory[histLen - 1].archetype : undefined;
  const safeFallbacks: readonly BeatArchetype[] = singleStaccato
    ? ["KINETIC_THESIS_STRIKE", "QUESTION_PIVOT", "CAUSAL_CHAIN", "HISTORICAL_PARALLEL_CARD"]
    : [
        "CAUSAL_CHAIN",
        "SPLIT_COMPARISON",
        "CUSTOM_CONTRAPTION_BLUEPRINT",
        "HISTORICAL_PARALLEL_CARD",
        "FLOW_SANKEY",
        "CLOSED_LOOP_TRAP",
        "HEADLINE_DOSSIER",
        "SOCIAL_POST_EXHIBIT",
        "KINETIC_THESIS_STRIKE",
        "QUESTION_PIVOT",
      ];

  for (let i = 0; i < safeFallbacks.length && allowedSet.size < 2; i++) {
    const fb = safeFallbacks[i];
    if (!recent4Used.has(fb)) {
      allowedSet.add(fb);
      delete prunedReasons[fb];
    }
  }
  for (let i = 0; i < safeFallbacks.length && allowedSet.size < 2; i++) {
    const fb = safeFallbacks[i];
    if (fb !== immediatePrev) {
      allowedSet.add(fb);
      delete prunedReasons[fb];
    }
  }

  const allowedArchetypes = BEAT_ARCHETYPES.filter((a) => allowedSet.has(a));
  const famSet = new Set<ArchetypeFamily>();
  for (let i = 0; i < allowedArchetypes.length; i++) {
    famSet.add(ARCHETYPE_FAMILY_MAP[allowedArchetypes[i]]);
  }

  const allowedRegisters: EmotionalRegister[] = singleStaccato
    ? ["HARD_REVEAL", "THESIS_VERDICT", "IRONIC_CONTRAST"]
    : [...EMOTIONAL_REGISTERS];

  return {
    allowedArchetypes,
    allowedFamilies: Array.from(famSet),
    allowedRegisters,
    recommendedSetPieceIds: recommendSetPiecesForText(fullText),
    prunedReasons,
    jsonSchemaMask: {
      type: "string",
      enum: allowedArchetypes,
    },
  };
}

/**
 * Builds a compact JSON Schema object restricting `payload.archetype` to `allowedArchetypes`.
 */
export function buildRestrictedBeatJsonSchema(
  allowedArchetypes: readonly BeatArchetype[],
): Readonly<Record<string, unknown>> {
  return {
    type: "object",
    additionalProperties: false,
    required: ["beatId", "actId", "sentenceRange", "register", "payload", "steps"],
    properties: {
      beatId: { type: "string", pattern: "^B\\d{3,4}$" },
      actId: { type: "string", pattern: "^ACT_\\d{1,2}$" },
      sentenceRange: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: { type: "string", pattern: "^S\\d{3,4}$" },
      },
      register: { type: "string", enum: [...EMOTIONAL_REGISTERS] },
      payload: {
        type: "object",
        required: ["archetype"],
        properties: {
          archetype: { type: "string", enum: [...allowedArchetypes] },
        },
      },
      steps: {
        type: "array",
        minItems: 1,
        maxItems: 6,
      },
    },
  };
}

// ============================================================================
// Deterministic Grounded Payload Synthesizer (Used by Escalator & Auto-Healer)
// ============================================================================

function cleanLabelWords(raw: string, fallback: string): string {
  const words = raw
    .replace(/[^A-Za-z\s-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  if (words.length === 0) {
    return fallback;
  }
  const picked = words.slice(0, 3).join(" ");
  if (picked.length < 2) {
    return fallback;
  }
  return picked.length > 26 ? picked.slice(0, 26).trim() : picked;
}

export function synthesizeStepsForBeat(
  sentences: readonly SentenceLock[],
  facts: readonly ExtractedFact[],
  primarySlotKey: string,
  secondarySlotKey?: string,
): SubBeatStep[] {
  const firstToken = sentences[0]?.tokens[0]?.id ?? "S001.T01";
  const steps: SubBeatStep[] = [
    {
      stepId: "ST01",
      anchorTokenId: firstToken,
      intent: "ESTABLISH_FRAME",
      targetSlotKey: primarySlotKey,
      ...(facts[0] ? { factRef: facts[0].id } : {}),
    },
  ];

  if (facts.length >= 2) {
    const secondFactToken = facts[1].tokenSpan[0];
    if (secondFactToken !== firstToken) {
      steps.push({
        stepId: "ST02",
        anchorTokenId: secondFactToken,
        intent: "STRIKE_ANOMALY",
        targetSlotKey: secondarySlotKey ?? primarySlotKey,
        factRef: facts[1].id,
      });
    }
  } else if (sentences.length >= 2) {
    const midSent = sentences[Math.floor(sentences.length / 2)];
    const midTok = midSent.tokens[0]?.id;
    if (midTok && midTok !== firstToken) {
      steps.push({
        stepId: "ST02",
        anchorTokenId: midTok,
        intent: "ANNOTATE_CAUSE",
        targetSlotKey: secondarySlotKey ?? primarySlotKey,
      });
    }
  }

  if (sentences.length >= 3) {
    const lastSent = sentences[sentences.length - 1];
    const lastTok = lastSent.tokens[0]?.id;
    const prevAnchor = steps[steps.length - 1].anchorTokenId;
    if (lastTok && lastTok !== prevAnchor) {
      const lastFact = facts.length >= 3 ? facts[facts.length - 1] : undefined;
      steps.push({
        stepId: `ST0${steps.length + 1}`,
        anchorTokenId: lastFact ? lastFact.tokenSpan[0] : lastTok,
        intent: "ISOLATE_VERDICT",
        targetSlotKey: secondarySlotKey ?? primarySlotKey,
        ...(lastFact ? { factRef: lastFact.id } : {}),
      });
    }
  }

  return steps;
}

/**
 * Deterministically constructs a 100% schema-valid `ArchetypePayload` + `SubBeatStep[]`
 * grounded strictly in the beat's `SentenceLock[]` and `ExtractedFact[]`.
 */
export function buildBeatPayloadForArchetype(
  archetype: BeatArchetype,
  sentences: readonly SentenceLock[],
  facts: readonly ExtractedFact[],
): { readonly payload: ArchetypePayload; readonly steps: SubBeatStep[] } {
  const fullText = sentences.map((s) => s.verbatim).join(" ");
  const geoCorridor = detectGeoCorridorFromText(fullText);
  const setPieces = recommendSetPiecesForText(fullText);

  const numericFacts = facts.filter(
    (f) =>
      f.kind === "CURRENCY" ||
      f.kind === "PERCENT" ||
      f.kind === "PHYSICAL_UNIT" ||
      f.kind === "MULTIPLIER",
  );
  const docFacts = facts.filter((f) => f.kind === "LEGAL_OR_DOC_CITE");
  const dateFacts = facts.filter((f) => f.kind === "YEAR_OR_DATE");

  const f0 = numericFacts[0] ?? facts[0];
  const f1 = numericFacts[1] ?? facts[1] ?? f0;
  const f2 = numericFacts[2] ?? facts[2] ?? f1;
  const docRef = docFacts[0]?.id;

  const firstSent = sentences[0];
  const lastSent = sentences[sentences.length - 1] ?? firstSent;
  const firstTok = firstSent?.tokens[0]?.id ?? "S001.T01";
  const lastTok =
    lastSent?.tokens[lastSent.tokens.length - 1]?.id ?? firstTok;

  switch (archetype) {
    case "CUSTOM_CONTRAPTION_BLUEPRINT": {
      const rule = /spillway|bondholders|paid first/i.test(fullText)
        ? "SPILLWAY_OVERFLOW"
        : /withholding|plumbing|veto|cut/i.test(fullText)
          ? "GUILLOTINE_SLICE"
          : /shoes|unit costs|hours/i.test(fullText)
            ? "BOM_VAPORIZER"
            : /spoils|plane|scrip|yuan|vanished/i.test(fullText)
              ? "PERISHABLE_DECAY"
              : /six months|permitting/i.test(fullText)
                ? "DUAL_SPEED_RACE"
                : "TORQUE_SCALE";

      const payload: ArchetypePayload = {
        archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
        contraptionTitle: cleanLabelWords(firstSent?.verbatim ?? "", "System Mechanism Rig"),
        ...(setPieces[0] ? { presetSetPieceId: setPieces[0] } : {}),
        physicsRule: rule,
        actors: [
          {
            actorKey: "primary_driver",
            kind: "prop-rig",
            zone: "left-stage",
            label: "Primary Input Stream",
            propVaultId: "telestrator-drafting/hydraulic-pipe",
            ...(f0 ? { factRef: f0.id } : {}),
            semanticRole: "solvent",
          },
          {
            actorKey: "mechanism_gate",
            kind: "balance-scale",
            zone: "center-hero",
            label: "Structural Constraint Gate",
            propVaultId: "telestrator-drafting/debt-vs-payroll",
            ...(f1 && f1.id !== f0?.id ? { factRef: f1.id } : {}),
            semanticRole: "capital",
          },
          {
            actorKey: "outcome_verdict",
            kind: "verdict-stamp",
            zone: "right-stage",
            label: "Downstream Balance Impact",
            ...(f2 && f2.id !== f1?.id ? { factRef: f2.id } : {}),
            semanticRole: "liability",
          },
        ],
        connectors: [
          {
            fromActorKey: "primary_driver",
            toActorKey: "mechanism_gate",
            kind: "flow-pipe",
            triggerTokenId: firstTok,
          },
          {
            fromActorKey: "mechanism_gate",
            toActorKey: "outcome_verdict",
            kind: rule === "GUILLOTINE_SLICE" ? "guillotine-cut" : "veto-slash",
            triggerTokenId: lastSent?.tokens[0]?.id ?? firstTok,
          },
        ],
        ...(geoCorridor ? { geoCorridorRef: geoCorridor } : {}),
        ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "primary_driver",
          "outcome_verdict",
        ),
      };
    }

    case "DEPTH_SANDWICH_STAGE": {
      if (f0) {
        const payload: ArchetypePayload = {
          archetype: "DEPTH_SANDWICH_STAGE",
          sandwichPreset: geoCorridor
            ? "colossus-prop-backdrop"
            : "behind-shoulder-billboard",
          midgroundBehindPresenter: geoCorridor
            ? "CARTOGRAPHIC_WAR_MAP"
            : "RISING_DEBT_WALL",
          foregroundGlassPreset: "GlassTelemetryStrip",
          foregroundPlacement: "right-third",
          headlineLabel: "Sovereign Balance Pressure",
          primaryFactRef: f0.id,
          ...(f1 && f1.id !== f0.id ? { secondaryFactRef: f1.id } : {}),
          propVaultId: "treasury-sovereign/DebtMonolithWall",
          ...(geoCorridor ? { geoCorridorRef: geoCorridor } : {}),
          ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
        };
        return {
          payload,
          steps: synthesizeStepsForBeat(
            sentences,
            facts,
            "headlineLabel",
            "primaryFactRef",
          ),
        };
      }
      break;
    }

    case "THRESHOLD_CROSSING": {
      if (f0 && f1) {
        const payload: ArchetypePayload = {
          archetype: "THRESHOLD_CROSSING",
          metricTitle: "Threshold Shift Audit",
          baselineLabel: "Prior Baseline Level",
          baselineFactRef: f0.id,
          crossingLabel: "Post Shock Level",
          crossingFactRef: f1.id,
          ...(f2 && f2.id !== f1.id ? { deltaBadgeFactRef: f2.id } : {}),
          ...(geoCorridor ? { geoCorridorRef: geoCorridor } : {}),
          ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
        };
        return {
          payload,
          steps: synthesizeStepsForBeat(
            sentences,
            facts,
            "baselineLabel",
            "crossingLabel",
          ),
        };
      }
      break;
    }

    case "DUAL_SERIES_DIVERGENCE": {
      if (f0 && f1) {
        const payload: ArchetypePayload = {
          archetype: "DUAL_SERIES_DIVERGENCE",
          chartTitle: "Macro Trajectory Split",
          upperSeriesLabel: "Expanding Capital Line",
          upperFactRef: f0.id,
          lowerSeriesLabel: "Lagging Household Share",
          lowerFactRef: f1.id,
          ...(dateFacts[0] ? { horizonStartFactRef: dateFacts[0].id } : {}),
          ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
        };
        return {
          payload,
          steps: synthesizeStepsForBeat(
            sentences,
            facts,
            "upperSeriesLabel",
            "lowerSeriesLabel",
          ),
        };
      }
      break;
    }

    case "COMPOSITION_STACK": {
      if (f0 && f1) {
        const payload: ArchetypePayload = {
          archetype: "COMPOSITION_STACK",
          stackTitle: "Revenue Share Breakdown",
          segments: [
            {
              segmentKey: "primary_slice",
              label: "Primary Contributor Share",
              factRef: f0.id,
              semanticRole: "solvent",
            },
            {
              segmentKey: "secondary_slice",
              label: "Residual Counter Share",
              factRef: f1.id,
              semanticRole: "liability",
            },
          ],
          ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
        };
        return {
          payload,
          steps: synthesizeStepsForBeat(
            sentences,
            facts,
            "primary_slice",
            "secondary_slice",
          ),
        };
      }
      break;
    }

    case "MULTIPLIER_SCALE_LADDER": {
      if (numericFacts.length >= 3) {
        const payload: ArchetypePayload = {
          archetype: "MULTIPLIER_SCALE_LADDER",
          ladderTitle: "Physical Load Escalation",
          rungs: [
            {
              rungKey: "rung_one",
              objectLabel: "Baseline Unit Load",
              factRef: numericFacts[0].id,
            },
            {
              rungKey: "rung_two",
              objectLabel: "Intermediate Scale Load",
              factRef: numericFacts[1].id,
            },
            {
              rungKey: "rung_three",
              objectLabel: "Hyperscale Peak Demand",
              factRef: numericFacts[2].id,
            },
          ],
          ...(geoCorridor ? { geoCorridorRef: geoCorridor } : {}),
          ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
        };
        return {
          payload,
          steps: synthesizeStepsForBeat(
            sentences,
            facts,
            "rung_one",
            "rung_three",
          ),
        };
      }
      break;
    }

    case "FLOW_SANKEY": {
      const payload: ArchetypePayload = {
        archetype: "FLOW_SANKEY",
        systemTitle: "Capital Routing Channels",
        inflowLabel: "Aggregate Gross Inflow",
        ...(f0 ? { inflowFactRef: f0.id } : {}),
        branches: [
          {
            branchKey: "taxed_channel",
            routeLabel: "Withheld Payroll Channel",
            flowStatus: "WITHHELD",
            ...(f0 ? { factRef: f0.id } : {}),
          },
          {
            branchKey: "bypass_channel",
            routeLabel: "Shielded Capital Conduit",
            flowStatus: "BYPASSED",
            ...(f1 && f1.id !== f0?.id ? { factRef: f1.id } : {}),
          },
        ],
        ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "taxed_channel",
          "bypass_channel",
        ),
      };
    }

    case "DOCUMENT_LEDGER_HIGHLIGHT": {
      if (docRef && f0) {
        const payload: ArchetypePayload = {
          archetype: "DOCUMENT_LEDGER_HIGHLIGHT",
          documentCiteFactRef: docRef,
          sectionLabel: "Primary Filing Verification",
          highlightedRows: [
            {
              rowKey: "ledger_line_alpha",
              lineLabel: "Verified Statutory Entry",
              factRef: f0.id,
              calloutIntent: "PRIMARY_RECEIPT",
            },
            ...(f1 && f1.id !== f0.id
              ? [
                  {
                    rowKey: "ledger_line_beta",
                    lineLabel: "Divergent Outlay Entry",
                    factRef: f1.id,
                    calloutIntent: "ANOMALY_DROP" as const,
                  },
                ]
              : []),
          ],
          loupeFocusRowKey: "ledger_line_alpha",
        };
        return {
          payload,
          steps: synthesizeStepsForBeat(
            sentences,
            facts,
            "ledger_line_alpha",
            "ledger_line_beta",
          ),
        };
      }
      break;
    }

    case "COURT_RULING_EXHIBIT": {
      if (docRef) {
        const payload: ArchetypePayload = {
          archetype: "COURT_RULING_EXHIBIT",
          caseCiteFactRef: docRef,
          courtLabel: "Appellate Bench Holding",
          ...(dateFacts[0] ? { yearFactRef: dateFacts[0].id } : {}),
          holdingLabel: "Unprotected Budget Line",
          ...(f0 ? { beforeCutFactRef: f0.id } : {}),
          ...(f1 && f1.id !== f0?.id ? { afterCutFactRef: f1.id } : {}),
        };
        return {
          payload,
          steps: synthesizeStepsForBeat(
            sentences,
            facts,
            "courtLabel",
            "holdingLabel",
          ),
        };
      }
      break;
    }

    case "SOCIAL_POST_EXHIBIT": {
      const payload: ArchetypePayload = {
        archetype: "SOCIAL_POST_EXHIBIT",
        speakerLabel: "Public Abundance Claim",
        ...(dateFacts[0] ? { dateFactRef: dateFacts[0].id } : {}),
        claimSummaryLabel: "Projected Post Scarcity",
        counterpartyLabel: "Fixed Monthly Obligation",
        ...(f0 ? { counterpartyFactRef: f0.id } : {}),
        collisionVerdict: "CONTRADICTED_BY_LEDGER",
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "speakerLabel",
          "counterpartyLabel",
        ),
      };
    }

    case "HEADLINE_DOSSIER": {
      const payload: ArchetypePayload = {
        archetype: "HEADLINE_DOSSIER",
        outletLabel: "Institutional Wire Dossier",
        subjectLabel: "Verified Market Filing",
        ...(f0 ? { primaryFactRef: f0.id } : {}),
        ...(f1 && f1.id !== f0?.id ? { secondaryFactRef: f1.id } : {}),
        ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "outletLabel",
          "subjectLabel",
        ),
      };
    }

    case "CLOSED_LOOP_TRAP": {
      const payload: ArchetypePayload = {
        archetype: "CLOSED_LOOP_TRAP",
        loopTitle: "Closed Platform Loop",
        issuedAssetLabel: "Restricted Internal Credit",
        captiveVenueLabel: "Approved Partner Vendors",
        exitGateLabel: "External Dollar Exit",
        ...(f0 ? { insideFaceFactRef: f0.id } : {}),
        ...(f1 && f1.id !== f0?.id ? { exitPenaltyFactRef: f1.id } : {}),
        ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "issuedAssetLabel",
          "exitGateLabel",
        ),
      };
    }

    case "SPLIT_COMPARISON": {
      const payload: ArchetypePayload = {
        archetype: "SPLIT_COMPARISON",
        comparisonTitle: "Structural Regime Contrast",
        leftSide: {
          eraOrRegimeLabel: "Baseline Historical Regime",
          mechanismLabel: "Direct Labor Leverage",
          ...(f0 ? { factRef: f0.id } : {}),
          ...(geoCorridor ? { geoCorridorRef: geoCorridor } : {}),
        },
        rightSide: {
          eraOrRegimeLabel: "Automated Machine Regime",
          mechanismLabel: "Decoupled Capital Output",
          ...(f1 && f1.id !== f0?.id ? { factRef: f1.id } : {}),
        },
        ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "leftSide",
          "rightSide",
        ),
      };
    }

    case "THREE_PILLAR_ROADMAP": {
      const payload: ArchetypePayload = {
        archetype: "THREE_PILLAR_ROADMAP",
        roadmapId: "ROADMAP_ESCAPE_HATCHES",
        boardTitle: "Three Escape Hatches",
        pillars: [
          {
            pillarKey: "pillar_one",
            title: "Federal Dividend Check",
            status: "ACTIVE",
          },
          {
            pillarKey: "pillar_two",
            title: "Universal Compute Slice",
            status: "PENDING",
          },
          {
            pillarKey: "pillar_three",
            title: "Sovereign Money Printing",
            status: "PENDING",
          },
        ],
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "pillar_one",
          "pillar_three",
        ),
      };
    }

    case "CHARACTER_BALANCE_SHEET": {
      const payload: ArchetypePayload = {
        archetype: "CHARACTER_BALANCE_SHEET",
        personaEntityId: "ENT_CLAIRE_AUSTIN",
        ...(dateFacts[0] ? { eraTagFactRef: dateFacts[0].id } : {}),
        locationCorridorRef: geoCorridor ?? "AUSTIN_TEXAS",
        ledgerRows: [
          {
            rowKey: "INCOME",
            label: "Monthly Household Pay",
            ...(f0 ? { factRef: f0.id } : {}),
            qualitativeState: "COLLAPSED",
          },
          {
            rowKey: "FIXED_DEBT",
            label: "Fixed Monthly Mortgage",
            ...(f1 && f1.id !== f0?.id ? { factRef: f1.id } : {}),
            qualitativeState: "LOCKED_NOMINAL",
          },
        ],
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(sentences, facts, "INCOME", "FIXED_DEBT"),
      };
    }

    case "HISTORICAL_PARALLEL_CARD": {
      const payload: ArchetypePayload = {
        archetype: "HISTORICAL_PARALLEL_CARD",
        ...(dateFacts[0] ? { eraFactRef: dateFacts[0].id } : {}),
        placeLabel: "Archival Case Precedent",
        precedentTitle: "Historical Ledger Test",
        lessonLabel: "Binding Structural Limit",
        ...(f0 ? { constraintFactRef: f0.id } : {}),
        ...(docRef ? { statuteOrDocFactRef: docRef } : {}),
        ...(geoCorridor ? { geoCorridorRef: geoCorridor } : {}),
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "precedentTitle",
          "lessonLabel",
        ),
      };
    }

    case "QUESTION_PIVOT": {
      const qSent = sentences[0];
      const qEnd = qSent?.tokens[qSent.tokens.length - 1]?.id ?? firstTok;
      const payload: ArchetypePayload = {
        archetype: "QUESTION_PIVOT",
        questionTokenSpan: [firstTok, qEnd],
        pivotMode: "REBUTTAL_TURN",
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "questionTokenSpan",
          "pivotMode",
        ),
      };
    }

    case "STAT_MONOLITH": {
      if (f0) {
        const payload: ArchetypePayload = {
          archetype: "STAT_MONOLITH",
          heroFactRef: f0.id,
          contextLabel: "Primary Balance Figure",
          ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
        };
        return {
          payload,
          steps: synthesizeStepsForBeat(sentences, facts, "heroFactRef"),
        };
      }
      break;
    }

    case "KINETIC_THESIS_STRIKE": {
      const payload: ArchetypePayload = {
        archetype: "KINETIC_THESIS_STRIKE",
        strikeTokenSpan: [firstTok, lastTok],
        emphasisRole: /allowance/i.test(fullText)
          ? "PAYCHECK_TO_ALLOWANCE"
          : "VERDICT_SLAM",
        ...(f0 ? { supportingFactRef: f0.id } : {}),
      };
      return {
        payload,
        steps: synthesizeStepsForBeat(
          sentences,
          facts,
          "strikeTokenSpan",
          "emphasisRole",
        ),
      };
    }

    case "CAUSAL_CHAIN":
    default:
      break;
  }

  // Universal grounded fallback: CAUSAL_CHAIN
  const fallbackPayload: ArchetypePayload = {
    archetype: "CAUSAL_CHAIN",
    mechanismTitle: "Causal Mechanism Chain",
    nodes: [
      {
        nodeKey: "stage_alpha",
        stageLabel: "Initial Economic Trigger",
        stateTag: "HUMAN_LABOR",
        ...(f0 ? { factRef: f0.id } : {}),
      },
      {
        nodeKey: "stage_beta",
        stageLabel: "Downstream Balance Shift",
        stateTag: "DEBT_COLLISION",
        ...(f1 && f1.id !== f0?.id ? { factRef: f1.id } : {}),
      },
    ],
    ...(geoCorridor ? { geoCorridorRef: geoCorridor } : {}),
    ...(docRef ? { sourceAttributionFactRef: docRef } : {}),
  };
  return {
    payload: fallbackPayload,
    steps: synthesizeStepsForBeat(
      sentences,
      facts,
      "stage_alpha",
      "stage_beta",
    ),
  };
}

// ============================================================================
// The Creativity Escalator (`escalateFlatBeats`)
// ============================================================================

function isLowKineticGenericArchetype(arch: BeatArchetype): boolean {
  return (
    arch === "STAT_MONOLITH" ||
    arch === "HEADLINE_DOSSIER" ||
    arch === "KINETIC_THESIS_STRIKE" ||
    arch === "QUESTION_PIVOT"
  );
}

function selectEscalatedArchetype(
  sentences: readonly SentenceLock[],
  facts: readonly ExtractedFact[],
  prevArchetype: BeatArchetype | undefined,
  existingSetpieceCount: number,
  targetSetpieceMin: number,
): { archetype: BeatArchetype; reason: string } | undefined {
  const fullText = sentences.map((s) => s.verbatim).join(" ");
  const totalWords = sentences.reduce((acc, s) => acc + s.wordCount, 0);
  const singlePunch =
    sentences.length === 1 &&
    sentences[0].cadenceClass === "STACCATO_PUNCH" &&
    totalWords <= 6;

  if (singlePunch) {
    return undefined;
  }

  const numericFacts = facts.filter(
    (f) =>
      f.kind === "CURRENCY" ||
      f.kind === "PERCENT" ||
      f.kind === "PHYSICAL_UNIT" ||
      f.kind === "MULTIPLIER",
  );
  const setPieces = recommendSetPiecesForText(fullText);

  // 1. Bespoke Contraption cues (shoes BOM, tax plumbing, veto, spillway, scrip, permitting race)
  if (
    setPieces.length > 0 &&
    prevArchetype !== "CUSTOM_CONTRAPTION_BLUEPRINT" &&
    existingSetpieceCount < targetSetpieceMin + 2
  ) {
    return {
      archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
      reason: `High-stakes mechanical metaphor ("${setPieces[0]}") promoted to bespoke contraption`,
    };
  }

  // 2. Behind-Presenter Depth Sandwich on sovereign/macro shock figures
  if (
    numericFacts.length >= 1 &&
    /trillion|billion|833\s*percent|capacity auction/i.test(fullText) &&
    prevArchetype !== "DEPTH_SANDWICH_STAGE" &&
    existingSetpieceCount < targetSetpieceMin
  ) {
    return {
      archetype: "DEPTH_SANDWICH_STAGE",
      reason: "Monumental sovereign/grid shock figure promoted to 5-plane Presenter Depth Sandwich",
    };
  }

  // 3. Multi-order physical wattage/energy scale ladder
  if (
    numericFacts.length >= 3 &&
    /watts|kilowatt|gigawatt|terawatt/i.test(fullText) &&
    prevArchetype !== "MULTIPLIER_SCALE_LADDER"
  ) {
    return {
      archetype: "MULTIPLIER_SCALE_LADDER",
      reason: "Multi-order physical energy progression promoted to logarithmic scale ladder",
    };
  }

  // 4. Split-Era / Regime Diptych
  if (
    /1955|2034|1933|gold|Juneau|whiteboard|thirty-year loan/i.test(fullText) &&
    prevArchetype !== "SPLIT_COMPARISON"
  ) {
    return {
      archetype: "SPLIT_COMPARISON",
      reason: "Cross-era structural contrast promoted to split-era diptych",
    };
  }

  // 5. Tax / Capital Plumbing Schematic
  if (
    /plumbing|withholding|writes off|borrow cash|exchange rate|credits/i.test(fullText) &&
    prevArchetype !== "FLOW_SANKEY" &&
    prevArchetype !== "CLOSED_LOOP_TRAP"
  ) {
    return {
      archetype: /credits|scrip|wallet|fee/i.test(fullText)
        ? "CLOSED_LOOP_TRAP"
        : "FLOW_SANKEY",
      reason: "Routing/wallet mechanism promoted to flow plumbing schematic",
    };
  }

  // 6. Cartographic Threshold Crossing
  if (
    numericFacts.length >= 2 &&
    detectGeoCorridorFromText(fullText) !== undefined &&
    prevArchetype !== "THRESHOLD_CROSSING"
  ) {
    return {
      archetype: "THRESHOLD_CROSSING",
      reason: "Geographic auction/grid shock promoted to cartographic threshold stage",
    };
  }

  // 7. Generic >16w text-card demotion
  if (totalWords > 16) {
    const fallback: BeatArchetype =
      prevArchetype !== "CAUSAL_CHAIN" ? "CAUSAL_CHAIN" : "SPLIT_COMPARISON";
    return {
      archetype: fallback,
      reason: "Long analytical span (>16w) promoted out of static text/monolith card",
    };
  }

  return undefined;
}

/**
 * **The Creativity Escalator**: Scans a draft `StoryboardIR` (e.g., from DeepSeek
 * or a quantized local LLM) and promotes flat text/monolith cards on high-stakes
 * mechanism, metaphor, cartographic, or macro-shock beats into rich animated
 * contraptions, depth sandwiches, diptychs, and schematics.
 */
export function escalateFlatBeats(
  ir: StoryboardIR,
  scriptLock: ScriptLock,
): EscalationResult {
  const escalatedBeats: BeatNode[] = [];
  const escalatedBeatIds: string[] = [];
  const log: EscalationLogEntry[] = [];

  const targetSetpieceMin = ir.beats.length >= 12 ? 4 : Math.max(1, Math.floor(ir.beats.length / 3));
  let setpieceCount = 0;
  for (let i = 0; i < ir.beats.length; i++) {
    const a = ir.beats[i].payload.archetype;
    if (a === "CUSTOM_CONTRAPTION_BLUEPRINT" || a === "DEPTH_SANDWICH_STAGE") {
      setpieceCount++;
    }
  }

  for (let i = 0; i < ir.beats.length; i++) {
    const beat = ir.beats[i];
    const currentArch = beat.payload.archetype;
    const prevArch =
      escalatedBeats.length > 0
        ? escalatedBeats[escalatedBeats.length - 1].payload.archetype
        : undefined;
    const nextOrigArch =
      i + 1 < ir.beats.length ? ir.beats[i + 1].payload.archetype : undefined;

    const sentences = getSentenceSpan(scriptLock, beat.sentenceRange);
    const beatFacts: ExtractedFact[] = [];
    for (let s = 0; s < sentences.length; s++) {
      for (let f = 0; f < sentences[s].factIds.length; f++) {
        const factObj = scriptLock.facts[sentences[s].factIds[f]];
        if (factObj) {
          beatFacts.push(factObj);
        }
      }
    }

    const totalWords = sentences.reduce((acc, s) => acc + s.wordCount, 0);
    const needsEscalation =
      (isLowKineticGenericArchetype(currentArch) && totalWords > 10) ||
      (currentArch === "STAT_MONOLITH" && totalWords > 8) ||
      (setpieceCount < targetSetpieceMin &&
        isLowKineticGenericArchetype(currentArch));

    if (needsEscalation && sentences.length > 0) {
      const decision = selectEscalatedArchetype(
        sentences,
        beatFacts,
        prevArch,
        setpieceCount,
        targetSetpieceMin,
      );

      if (
        decision &&
        decision.archetype !== currentArch &&
        decision.archetype !== prevArch &&
        decision.archetype !== nextOrigArch
      ) {
        const built = buildBeatPayloadForArchetype(
          decision.archetype,
          sentences,
          beatFacts,
        );
        const isPeak =
          decision.archetype === "CUSTOM_CONTRAPTION_BLUEPRINT" ||
          decision.archetype === "DEPTH_SANDWICH_STAGE";
        if (isPeak) {
          setpieceCount++;
        }

        const upgraded: BeatNode = {
          ...beat,
          presenterMode:
            decision.archetype === "DEPTH_SANDWICH_STAGE"
              ? "DEPTH_SANDWICH"
              : beat.presenterMode ?? "FULL_PAGE_CUTAWAY",
          ...(isPeak ? { isShowstopperPeak: true } : {}),
          payload: built.payload,
          steps: built.steps,
        };

        escalatedBeats.push(upgraded);
        escalatedBeatIds.push(beat.beatId);
        log.push({
          beatId: beat.beatId,
          fromArchetype: currentArch,
          toArchetype: decision.archetype,
          reason: decision.reason,
        });
        continue;
      }
    }

    escalatedBeats.push(beat);
  }

  return {
    ir: {
      ...ir,
      beats: escalatedBeats,
    },
    escalatedBeatIds,
    log,
  };
}
