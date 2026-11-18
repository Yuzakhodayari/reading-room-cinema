# DEEPSEEK_EQUALIZER.md: Zero-Degradation Playbook for Open-Weights & Chat UIs

Open-weights models (`deepseek-chat`, `deepseek-reasoner`, Qwen, local Ollama/vLLM builds) and manual browser chat sessions achieve `96+/100` broadcast parity when every prompt enforces strict JSON decoding, small micro-windows, and pruned enums. Follow this protocol whenever running `tools/ai_director.mjs --provider deepseek | ollama | pack` or pasting tasks into a web chat window.

## Context Pointers

- Reach [AGENTS.md](file:///d:/Youtube%20channel/reading-room-cinema/AGENTS.md) for the overall Stage 0 through Step 5 episode build order.
- Reach [exemplars.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/exemplars.ts) when copying gold JSON payload examples into custom prompts.
- Reach [schemaPruner.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/schemaPruner.ts) when inspecting how `computeAllowedChoices` and `escalateFlatBeats` upgrade generic drafts automatically.

## Inference Decoding Parameters

Lock sampling parameters on every API or local server call:

- `temperature`: `0.0`
- `top_p`: `1.0`
- `response_format`: `{ "type": "json_object" }` (or `{ "type": "json_schema" }` / GBNF grammar produced by [`buildRestrictedBeatJsonSchema`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/schemaPruner.ts))
- `max_tokens`: `550` on Passes 1 to 3; `320` on Pass 4 single-beat slot hydration
- Reasoning budget (`deepseek-reasoner` / thinking models): cap Pass 4 reasoning under `256` tokens so latency stays low on typed slot filling.

## Four Cardinal Rules for Prompted Beat Authoring

Paste these four rules verbatim at the top of any manual chat session:

1. **Copy IDs Character-for-Character**: Copy `SentenceId` (`"S095"`), `TokenId` (`"S095.T18"`), `FactId` (`"F041"`), and `EntityId` (`"ENT_CLAIRE_AUSTIN"`) directly from the task input. Invented IDs fail Gate `G02` immediately.
2. **Keep Semantic Labels Digit-Free and Short**: Every `ShortLabel` (`metricTitle`, `chartTitle`, `label`, `stageLabel`) uses 2 to 4 plain English words (`<= 28` characters) with zero digits and zero `#hex` strings. Put all numbers into `*FactRef` fields.
3. **Anchor Steps Inside the Beat Window**: Every `steps[k].anchorTokenId` points to a token inside the beat's `sentenceRange`. When a step highlights a statistic (`factRef: "F043"`), set `anchorTokenId` to that fact's opening token (`tokenSpan[0]`).
4. **Isolate Six-Word Punches**: Whenever a sentence has 6 words or fewer (`cadenceClass === "STACCATO_PUNCH"`, such as `"All three of them break."` or `"We call that an allowance."`), give that sentence its own beat using `KINETIC_THESIS_STRIKE` or `QUESTION_PIVOT`. Keep analytical beats at 1 to 3 sentences (`<= 13s`).

## Offline Copy-Paste Workbook Workflow (`--export-pack` / `--import-pack`)

When running without API keys:

### Step 1: Export the Prompt Pack

Run `node tools/ai_director.mjs --script scripts/video_01_the_allowance.md --export-pack .studio/pack`. The exporter runs [`createScriptLock`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/scriptLock.ts) and writes bounded markdown prompt files (`01_macro_plan.md`, `02_segmentation.md`, `03_classification.md`, `04_hydration_*.md`), each under 1,800 tokens with embedded pruned enums and two gold exemplars.

- **Completion criterion**: `.studio/pack/` contains `script.lock.json` and numbered prompt workbooks.

### Step 2: Run Prompts & Save Raw JSON Replies

Paste each workbook into DeepSeek Web (or any chat UI) and save the returned JSON block into `.studio/pack/out/` under the matching filename. Raw JSON fences strip cleanly during import.

- **Completion criterion**: Every prompt file has a corresponding `.json` response in `.studio/pack/out/`.

### Step 3: Import, Escalate, and Auto-Heal to `96+/100`

Run `node tools/ai_director.mjs --import-pack .studio/pack` (which invokes [`parseStrictStoryboardIR`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/storyboardIR.ts) and [`healStoryboard`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/qualityGateAndHealer.ts)):

1. **Creativity Escalator**: If the chat model selected flat cards (`STAT_MONOLITH`, `HEADLINE_DOSSIER`) on physical metaphors (running shoe BOM, tax withholding guillotine, 1955 vs 2034 port strike, Walker veto pen, `$2.1T` bond spillway, expiring compute seat, or `10W -> 5GW` power scale), [`escalateFlatBeats`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/schemaPruner.ts) upgrades them into `CUSTOM_CONTRAPTION_BLUEPRINT`, `DEPTH_SANDWICH_STAGE`, `SPLIT_COMPARISON`, or `MULTIPLIER_SCALE_LADDER` payloads automatically.
2. **Tier-1 AST Self-Healer**: Repairs contiguous sentence bounds, rebinds `anchorTokenId` onto exact `FactId` onset tokens, attaches missing `Table 9` / `Wielechowski v. State` source badges, wires `ENT_CLAIRE_AUSTIN` and `ROADMAP_ESCAPE_HATCHES` callbacks, and resolves any window entropy dip via [`computeAllowedChoices`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/schemaPruner.ts).
3. **Tier-2 Single-Beat Micro-Prompt (Rare Fallback)**: If any gate still sits below target, [`generateSingleBeatRepairPrompt`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/qualityGateAndHealer.ts) writes a `< 350`-token single-beat JSON task (`99_repairs.md`), or [`synthesizeFallbackBeat`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/qualityGateAndHealer.ts) closes it deterministically.

- **Completion criterion**: `finalScore.totalScore >= 96.0` across all 35 broadcast gates with `0` hard blockers.

## Gold Single-Beat Reference (`CUSTOM_CONTRAPTION_BLUEPRINT`)

```json
{
  "beatId": "B025",
  "actId": "ACT_4",
  "sentenceRange": ["S065", "S068"],
  "register": "HARD_REVEAL",
  "presenterMode": "FULL_PAGE_CUTAWAY",
  "isShowstopperPeak": true,
  "payload": {
    "archetype": "CUSTOM_CONTRAPTION_BLUEPRINT",
    "contraptionTitle": "Bondholder Priority Spillway",
    "presetSetPieceId": "federal-bond-priority-spillway",
    "physicsRule": "SPILLWAY_OVERFLOW",
    "actors": [
      {
        "actorKey": "treasury_inflow",
        "kind": "fluid-tank",
        "zone": "top-header",
        "label": "Federal Tax Basin",
        "propVaultId": "treasury-sovereign/TreasuryBondVault",
        "semanticRole": "solvent"
      },
      {
        "actorKey": "bond_tier_one",
        "kind": "prop-rig",
        "zone": "center-hero",
        "label": "Senior Bond Interest",
        "propVaultId": "treasury-sovereign/SpillwayDam3Tier",
        "factRef": "F034",
        "semanticRole": "capital"
      },
      {
        "actorKey": "citizen_dividend",
        "kind": "verdict-stamp",
        "zone": "bottom-ledger",
        "label": "Household Dividend Pipe",
        "propVaultId": "legal-governance/GovernorVetoFountainPen",
        "semanticRole": "liability"
      }
    ],
    "connectors": [
      {
        "fromActorKey": "treasury_inflow",
        "toActorKey": "bond_tier_one",
        "kind": "flow-pipe",
        "triggerTokenId": "S067.T12"
      },
      {
        "fromActorKey": "bond_tier_one",
        "toActorKey": "citizen_dividend",
        "kind": "guillotine-cut",
        "triggerTokenId": "S068.T08"
      }
    ]
  },
  "steps": [
    {
      "stepId": "ST01",
      "anchorTokenId": "S065.T02",
      "intent": "ESTABLISH_FRAME",
      "targetSlotKey": "treasury_inflow"
    },
    {
      "stepId": "ST02",
      "anchorTokenId": "S067.T12",
      "intent": "REVEAL_BASELINE",
      "targetSlotKey": "bond_tier_one",
      "factRef": "F034"
    },
    {
      "stepId": "ST03",
      "anchorTokenId": "S068.T08",
      "intent": "ISOLATE_VERDICT",
      "targetSlotKey": "citizen_dividend"
    }
  ]
}
```
