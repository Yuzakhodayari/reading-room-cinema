import {
  CreateScriptLockOptions,
  ExtractedFact,
  ScriptLock,
  SentenceLock,
  TimedWordInput,
  createScriptLock,
  padDigits,
} from "./scriptLock";
import {
  EpisodeVaultCooldownMap,
  RecentBeatChoice,
  computeAllowedChoices,
} from "./schemaPruner";
import {
  BeatNode,
  IRNarrativeEngine,
  IRStrategyPresetId,
  StoryboardIR,
} from "./storyboardIR";
import {
  HealStoryboardResult,
  healStoryboard,
  synthesizeFallbackBeat,
} from "./qualityGateAndHealer";

export * from "./scriptLock";
export * from "./storyboardIR";
export * from "./exemplars";
export * from "./schemaPruner";
export * from "./viterbiChoreographer";
export * from "./qualityGateAndHealer";

export interface DeterministicPipelineOptions extends CreateScriptLockOptions {
  readonly timedWords?: readonly TimedWordInput[];
  readonly strategyPresetId?: IRStrategyPresetId;
  readonly forbiddenEngines?: readonly IRNarrativeEngine[];
  readonly episodeVaultCooldowns?: EpisodeVaultCooldownMap;
  readonly draftIR?: StoryboardIR;
  readonly targetScore?: number;
}

/**
 * Segments a `ScriptLock` deterministically into clause-aligned beats
 * (isolating `<=6w` `STACCATO_PUNCH` sentences into dedicated slam beats and
 * grouping analytical sentences into `5s–13s` windows) and hydrates initial
 * pruned semantic payloads.
 */
export function buildDeterministicStoryboardIR(
  scriptLock: ScriptLock,
  options?: {
    readonly strategyPresetId?: IRStrategyPresetId;
    readonly forbiddenEngines?: readonly IRNarrativeEngine[];
    readonly episodeVaultCooldowns?: EpisodeVaultCooldownMap;
  },
): StoryboardIR {
  const forbiddenEngines: IRNarrativeEngine[] = options?.forbiddenEngines
    ? [...options.forbiddenEngines]
    : ["clocked", "street", "field"];

  const groups: SentenceLock[][] = [];
  let buffer: SentenceLock[] = [];
  let bufferDurMs = 0;

  for (let i = 0; i < scriptLock.sentences.length; i++) {
    const sent = scriptLock.sentences[i];
    const sentDurMs = Math.max(600, sent.endMs - sent.startMs);
    const isPunch = sent.cadenceClass === "STACCATO_PUNCH" && sent.wordCount <= 6;

    if (isPunch) {
      if (buffer.length > 0) {
        groups.push(buffer);
        buffer = [];
        bufferDurMs = 0;
      }
      groups.push([sent]);
      continue;
    }

    const paragraphChanged =
      buffer.length > 0 &&
      buffer[buffer.length - 1].paragraphIndex !== sent.paragraphIndex;

    if (
      buffer.length >= 3 ||
      (buffer.length > 0 && bufferDurMs + sentDurMs > 12500) ||
      (paragraphChanged && bufferDurMs >= 4200)
    ) {
      groups.push(buffer);
      buffer = [];
      bufferDurMs = 0;
    }

    buffer.push(sent);
    bufferDurMs += sentDurMs;
  }

  if (buffer.length > 0) {
    groups.push(buffer);
  }

  const totalGroups = Math.max(1, groups.length);
  const history: RecentBeatChoice[] = [];
  const beats: BeatNode[] = [];

  for (let g = 0; g < groups.length; g++) {
    const span = groups[g];
    const beatId = `B${padDigits(g + 1, 3)}`;
    const actNum = Math.min(7, Math.floor((g / totalGroups) * 7) + 1);
    const actId = `ACT_${actNum}`;

    const facts: ExtractedFact[] = [];
    for (let s = 0; s < span.length; s++) {
      for (let f = 0; f < span[s].factIds.length; f++) {
        const fo = scriptLock.facts[span[s].factIds[f]];
        if (fo) {
          facts.push(fo);
        }
      }
    }

    const allowed = computeAllowedChoices(
      {
        beatId,
        sentences: span,
        facts,
        normalizedPosition: g / totalGroups,
        forbiddenEngines,
      },
      history,
      options?.episodeVaultCooldowns,
    );

    const builtBeat = synthesizeFallbackBeat(
      beatId,
      actId,
      span,
      facts,
      allowed.allowedArchetypes,
    );

    beats.push(builtBeat);
    history.push({ beatId, archetype: builtBeat.payload.archetype });
  }

  return {
    irVersion: "1.0.0",
    scriptSha256: scriptLock.scriptSha256,
    strategyPresetId: options?.strategyPresetId ?? "STR-GEN-EXPLAINER",
    forbiddenEngines,
    entities: [
      {
        entityId: "ENT_SOVEREIGN_DEBT_WALL",
        kind: "INSTITUTION",
        canonicalTitle: "Federal Debt Wall",
        iconSemantic: "TREASURY_LEDGER",
        anchorFactRefs: [],
      },
      {
        entityId: "ENT_ESCAPE_HATCH_BOARD",
        kind: "ESCAPE_HATCH",
        canonicalTitle: "Three Escape Hatches",
        iconSemantic: "GAVEL",
        anchorFactRefs: [],
      },
      {
        entityId: "ENT_CLAIRE_AUSTIN",
        kind: "PERSONA",
        canonicalTitle: "Claire Austin Ledger",
        iconSemantic: "HOUSE_MORTGAGE",
        anchorFactRefs: [],
      },
      {
        entityId: "ENT_PAYCHECK_TO_ALLOWANCE",
        kind: "INSTITUTION",
        canonicalTitle: "Friday Paycheck Truce",
        iconSemantic: "PAYCHECK",
        anchorFactRefs: [],
      },
    ],
    roadmaps: [
      {
        roadmapId: "ROADMAP_ESCAPE_HATCHES",
        title: "Three Escape Hatches",
        pillars: [
          "Federal Dividend Check",
          "Universal Compute Slice",
          "Sovereign Money Printing",
        ],
      },
    ],
    beats,
  };
}

/**
 * End-to-end deterministic Equalizer runner:
 * `markdownText` -> `ScriptLock` -> `draftIR` (or deterministic synthesis) ->
 * Creativity Escalator + Viterbi Solver + 35-Gate Self-Healer (`>= 96/100`).
 */
export function runEqualizerPipeline(
  markdownText: string,
  options?: DeterministicPipelineOptions,
): {
  readonly scriptLock: ScriptLock;
  readonly healResult: HealStoryboardResult;
} {
  const scriptLock = createScriptLock(markdownText, options?.timedWords, {
    fps: options?.fps,
    wordsPerMinute: options?.wordsPerMinute,
    initialLeadInMs: options?.initialLeadInMs,
  });

  const baseIR =
    options?.draftIR ??
    buildDeterministicStoryboardIR(scriptLock, {
      strategyPresetId: options?.strategyPresetId,
      forbiddenEngines: options?.forbiddenEngines,
      episodeVaultCooldowns: options?.episodeVaultCooldowns,
    });

  const healResult = healStoryboard(baseIR, scriptLock, {
    targetScore: options?.targetScore ?? 96,
    episodeVaultCooldowns: options?.episodeVaultCooldowns,
  });

  return { scriptLock, healResult };
}
