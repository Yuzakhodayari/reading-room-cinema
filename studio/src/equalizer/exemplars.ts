import {
  BEAT_ARCHETYPES,
  BeatArchetype,
  BeatNode,
  StoryboardIR,
} from "./storyboardIR";

/**
 * Pillar #15 — Curated Gold StoryboardIR Exemplars (`exemplars.ts`)
 *
 * Concrete, zero-coordinate, schema-locked gold exemplars across all 20
 * `BeatArchetype` variants grounded in Episode 01 ("The Allowance").
 * Injected into Pass 4 single-beat slot hydration and Tier-2 surgical repair prompts.
 */

export const GOLD_BEAT_EXEMPLARS: Readonly<Record<BeatArchetype, BeatNode>> = {
  DUAL_SERIES_DIVERGENCE: {
    beatId: "B013",
    actId: "ACT_3",
    sentenceRange: ["S031", "S032"],
    register: "CLINICAL_EVIDENCE",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "DUAL_SERIES_DIVERGENCE",
      chartTitle: "Output Versus Worker Share",
      upperSeriesLabel: "Hourly Worker Output",
      upperFactRef: "F019",
      lowerSeriesLabel: "Labor Share Floor",
      lowerFactRef: "F020",
      horizonStartFactRef: "F018",
      horizonEndFactRef: "F021",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S031.T01",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "chartTitle",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S031.T12",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "upperSeriesLabel",
        factRef: "F019",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S032.T09",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "lowerSeriesLabel",
        factRef: "F020",
      },
    ],
  },

  COMPOSITION_STACK: {
    beatId: "B001",
    actId: "ACT_1",
    sentenceRange: ["S001", "S002"],
    register: "CLINICAL_EVIDENCE",
    presenterMode: "FULL_PAGE_CUTAWAY",
    continuity: {
      introduces: ["ENT_SOVEREIGN_DEBT_WALL"],
    },
    payload: {
      archetype: "COMPOSITION_STACK",
      stackTitle: "Federal Tax Receipt Base",
      segments: [
        {
          segmentKey: "paycheck_withholding",
          label: "Paycheck Withholding",
          factRef: "F001",
          semanticRole: "solvent",
        },
        {
          segmentKey: "individual_filings",
          label: "Regular Taxpayer Share",
          factRef: "F002",
          semanticRole: "statutory",
        },
      ],
      totalCompareFactRef: "F004",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S001.T02",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "paycheck_withholding",
        factRef: "F001",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S002.T13",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "individual_filings",
        factRef: "F002",
      },
    ],
  },

  THRESHOLD_CROSSING: {
    beatId: "B048",
    actId: "ACT_6",
    sentenceRange: ["S095", "S096"],
    register: "HARD_REVEAL",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "THRESHOLD_CROSSING",
      metricTitle: "PJM Capacity Price",
      baselineLabel: "Prior Clearing Rate",
      baselineFactRef: "F041",
      crossingLabel: "Current Grid Auction",
      crossingFactRef: "F042",
      deltaBadgeFactRef: "F043",
      geoCorridorRef: "PJM_GRID",
      sourceAttributionFactRef: "F040",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S095.T01",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "metricTitle",
        factRef: "F040",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S095.T18",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "baselineLabel",
        factRef: "F041",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S096.T03",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "crossingLabel",
        factRef: "F043",
      },
    ],
  },

  MULTIPLIER_SCALE_LADDER: {
    beatId: "B046",
    actId: "ACT_6",
    sentenceRange: ["S090", "S093"],
    register: "TENSION_BUILD",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "MULTIPLIER_SCALE_LADDER",
      ladderTitle: "Physical Power Scale",
      rungs: [
        {
          rungKey: "charger_rung",
          objectLabel: "Wall Phone Charger",
          factRef: "F035",
          propVaultId: "grid-energy-mining/10w-charger",
        },
        {
          rungKey: "microwave_rung",
          objectLabel: "Kitchen Microwave",
          factRef: "F036",
          propVaultId: "grid-energy-mining/1kw-microwave",
        },
        {
          rungKey: "city_rung",
          objectLabel: "Major City Baseload",
          factRef: "F037",
          propVaultId: "grid-energy-mining/1gw-city",
        },
        {
          rungKey: "campus_rung",
          objectLabel: "Single Server Campus",
          factRef: "F038",
          propVaultId: "grid-energy-mining/5gw-ai-campus",
        },
      ],
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S090.T05",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "charger_rung",
        factRef: "F035",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S091.T07",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "microwave_rung",
        factRef: "F036",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S092.T10",
        intent: "ANNOTATE_CAUSE",
        targetSlotKey: "city_rung",
        factRef: "F037",
      },
      {
        stepId: "ST04",
        anchorTokenId: "S093.T14",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "campus_rung",
        factRef: "F038",
      },
    ],
  },

  FLOW_SANKEY: {
    beatId: "B022",
    actId: "ACT_3",
    sentenceRange: ["S043", "S045"],
    register: "IRONIC_CONTRAST",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "FLOW_SANKEY",
      systemTitle: "Federal Tax Plumbing",
      inflowLabel: "National Income Stream",
      branches: [
        {
          branchKey: "friday_payroll",
          routeLabel: "Automatic Paycheck Cut",
          flowStatus: "WITHHELD",
        },
        {
          branchKey: "hardware_deduction",
          routeLabel: "Upfront Chip Writeoff",
          flowStatus: "BYPASSED",
        },
        {
          branchKey: "portfolio_borrow",
          routeLabel: "Untaxed Margin Borrowing",
          flowStatus: "BYPASSED",
        },
      ],
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S043.T01",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "friday_payroll",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S044.T03",
        intent: "ANNOTATE_CAUSE",
        targetSlotKey: "hardware_deduction",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S045.T04",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "portfolio_borrow",
      },
    ],
  },

  DOCUMENT_LEDGER_HIGHLIGHT: {
    beatId: "B020",
    actId: "ACT_3",
    sentenceRange: ["S038", "S040"],
    register: "CLINICAL_EVIDENCE",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "DOCUMENT_LEDGER_HIGHLIGHT",
      documentCiteFactRef: "F024",
      sectionLabel: "Federal Receipt Share",
      highlightedRows: [
        {
          rowKey: "individual_row",
          lineLabel: "Individual Payroll Taxes",
          factRef: "F026",
          calloutIntent: "PRIMARY_RECEIPT",
        },
        {
          rowKey: "corporate_row",
          lineLabel: "Corporate Income Taxes",
          factRef: "F028",
          calloutIntent: "ANOMALY_DROP",
        },
      ],
      loupeFocusRowKey: "corporate_row",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S038.T02",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "individual_row",
        factRef: "F024",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S039.T10",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "individual_row",
        factRef: "F026",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S040.T11",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "corporate_row",
        factRef: "F028",
      },
    ],
  },

  SOCIAL_POST_EXHIBIT: {
    beatId: "B002",
    actId: "ACT_1",
    sentenceRange: ["S004", "S006"],
    register: "IRONIC_CONTRAST",
    presenterMode: "OVER_FOOTAGE_GLASS",
    payload: {
      archetype: "SOCIAL_POST_EXHIBIT",
      speakerLabel: "Musk Abundance Post",
      dateFactRef: "F005",
      claimSummaryLabel: "Saving Money Pointless",
      counterpartyLabel: "First Month Landlord",
      collisionVerdict: "REJECTED_AT_BANK",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S004.T02",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "speakerLabel",
        factRef: "F005",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S005.T05",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "counterpartyLabel",
      },
    ],
  },

  COURT_RULING_EXHIBIT: {
    beatId: "B032",
    actId: "ACT_4",
    sentenceRange: ["S062", "S064"],
    register: "HARD_REVEAL",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "COURT_RULING_EXHIBIT",
      caseCiteFactRef: "F030",
      courtLabel: "Alaska Supreme Court",
      yearFactRef: "F031",
      holdingLabel: "Vetoable Annual Budget Line",
      beforeCutFactRef: "F032",
      afterCutFactRef: "F033",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S062.T08",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "courtLabel",
        factRef: "F030",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S063.T05",
        intent: "ANNOTATE_CAUSE",
        targetSlotKey: "holdingLabel",
        factRef: "F031",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S064.T03",
        intent: "ISOLATE_VERDICT",
        targetSlotKey: "afterCutFactRef",
        factRef: "F033",
      },
    ],
  },

  HEADLINE_DOSSIER: {
    beatId: "B036",
    actId: "ACT_5",
    sentenceRange: ["S070", "S072"],
    register: "TENSION_BUILD",
    presenterMode: "OVER_FOOTAGE_GLASS",
    payload: {
      archetype: "HEADLINE_DOSSIER",
      outletLabel: "Corporate Compute Burn",
      subjectLabel: "Monthly Agent Spend Cap",
      primaryFactRef: "F034",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S070.T04",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "outletLabel",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S071.T16",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "subjectLabel",
        factRef: "F034",
      },
    ],
  },

  CAUSAL_CHAIN: {
    beatId: "B007",
    actId: "ACT_2",
    sentenceRange: ["S016", "S019"],
    register: "CLINICAL_EVIDENCE",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "CAUSAL_CHAIN",
      mechanismTitle: "Unit Cost Compression",
      nodes: [
        {
          nodeKey: "retail_shoe",
          stageLabel: "Paid Human Hours",
          stateTag: "HUMAN_LABOR",
          factRef: "F010",
        },
        {
          nodeKey: "robot_swap",
          stageLabel: "Autonomous Factory Swap",
          stateTag: "AUTOMATED_SWAP",
          factRef: "F011",
        },
        {
          nodeKey: "price_floor",
          stageLabel: "Near Electricity Floor",
          stateTag: "PRICE_DROP",
        },
      ],
      geoCorridorRef: "MEMPHIS_FREIGHT_HUB",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S016.T03",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "retail_shoe",
        factRef: "F010",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S018.T02",
        intent: "ANNOTATE_CAUSE",
        targetSlotKey: "robot_swap",
        factRef: "F011",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S019.T04",
        intent: "ISOLATE_VERDICT",
        targetSlotKey: "price_floor",
      },
    ],
  },

  CLOSED_LOOP_TRAP: {
    beatId: "B040",
    actId: "ACT_5",
    sentenceRange: ["S079", "S081"],
    register: "IRONIC_CONTRAST",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "CLOSED_LOOP_TRAP",
      loopTitle: "Captive Compute Wallet",
      issuedAssetLabel: "Cloud Compute Credits",
      captiveVenueLabel: "Approved Partner Network",
      exitGateLabel: "External Bank Cashout",
      insideFaceFactRef: "F035",
      exitPenaltyFactRef: "F036",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S079.T06",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "issuedAssetLabel",
        factRef: "F035",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S081.T07",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "captiveVenueLabel",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S081.T18",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "exitGateLabel",
        factRef: "F036",
      },
    ],
  },

  SPLIT_COMPARISON: {
    beatId: "B028",
    actId: "ACT_4",
    sentenceRange: ["S053", "S056"],
    register: "IRONIC_CONTRAST",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "SPLIT_COMPARISON",
      comparisonTitle: "Industrial Strike Leverage",
      leftSide: {
        eraOrRegimeLabel: "Manual Port Walkout",
        mechanismLabel: "Idle Cranes Bleed Cash",
        factRef: "F028",
        geoCorridorRef: "ROTTERDAM_PORT",
      },
      rightSide: {
        eraOrRegimeLabel: "Autonomous Port Uptime",
        mechanismLabel: "Robotic Cranes Keep Running",
        factRef: "F029",
      },
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S053.T03",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "leftSide",
        factRef: "F028",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S055.T02",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "rightSide",
        factRef: "F029",
      },
    ],
  },

  THREE_PILLAR_ROADMAP: {
    beatId: "B006",
    actId: "ACT_1",
    sentenceRange: ["S011", "S013"],
    register: "TENSION_BUILD",
    presenterMode: "FULL_PAGE_CUTAWAY",
    continuity: {
      introduces: ["ENT_ESCAPE_HATCH_BOARD"],
      roadmapUpdate: {
        roadmapId: "ROADMAP_ESCAPE_HATCHES",
        activePillarIndex: 0,
        pillarStatuses: ["PENDING", "PENDING", "PENDING"],
      },
    },
    payload: {
      archetype: "THREE_PILLAR_ROADMAP",
      roadmapId: "ROADMAP_ESCAPE_HATCHES",
      boardTitle: "Three Escape Hatches",
      pillars: [
        {
          pillarKey: "hatch_dividend",
          title: "Federal Dividend Check",
          status: "PENDING",
        },
        {
          pillarKey: "hatch_compute",
          title: "Universal Compute Slice",
          status: "PENDING",
        },
        {
          pillarKey: "hatch_printing",
          title: "Sovereign Money Printing",
          status: "PENDING",
        },
      ],
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S011.T08",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "hatch_dividend",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S012.T14",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "hatch_compute",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S013.T01",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "hatch_printing",
      },
    ],
  },

  CHARACTER_BALANCE_SHEET: {
    beatId: "B011",
    actId: "ACT_2",
    sentenceRange: ["S021", "S024"],
    register: "HUMAN_STAKES",
    presenterMode: "FULL_PAGE_CUTAWAY",
    continuity: {
      introduces: ["ENT_CLAIRE_AUSTIN"],
    },
    payload: {
      archetype: "CHARACTER_BALANCE_SHEET",
      personaEntityId: "ENT_CLAIRE_AUSTIN",
      eraTagFactRef: "F012",
      locationCorridorRef: "AUSTIN_TEXAS",
      ledgerRows: [
        {
          rowKey: "INCOME",
          label: "Software Engineering Pay",
          factRef: "F014",
          qualitativeState: "COLLAPSED",
        },
        {
          rowKey: "FIXED_DEBT",
          label: "Fixed Austin Mortgage",
          factRef: "F013",
          qualitativeState: "LOCKED_NOMINAL",
        },
      ],
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S021.T02",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "FIXED_DEBT",
        factRef: "F012",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S022.T15",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "FIXED_DEBT",
        factRef: "F013",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S024.T14",
        intent: "MUTATE_ENTITY_STATE",
        targetSlotKey: "INCOME",
        factRef: "F014",
      },
    ],
  },

  HISTORICAL_PARALLEL_CARD: {
    beatId: "B042",
    actId: "ACT_5",
    sentenceRange: ["S082", "S084"],
    register: "CLINICAL_EVIDENCE",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "HISTORICAL_PARALLEL_CARD",
      eraFactRef: "F037",
      placeLabel: "West Virginia Coalfields",
      precedentTitle: "Company Store Brass Scrip",
      lessonLabel: "Cashout Discount Trap",
      constraintFactRef: "F036",
      statuteOrDocFactRef: "F038",
      geoCorridorRef: "LOGAN_COUNTY_WV",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S082.T04",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "precedentTitle",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S083.T16",
        intent: "ANNOTATE_CAUSE",
        targetSlotKey: "lessonLabel",
        factRef: "F036",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S084.T14",
        intent: "ISOLATE_VERDICT",
        targetSlotKey: "placeLabel",
        factRef: "F038",
      },
    ],
  },

  KINETIC_THESIS_STRIKE: {
    beatId: "B057",
    actId: "ACT_7",
    sentenceRange: ["S113", "S114"],
    register: "THESIS_VERDICT",
    presenterMode: "FULL_PAGE_CUTAWAY",
    continuity: {
      recalls: [
        {
          entityId: "ENT_PAYCHECK_TO_ALLOWANCE",
          mutation: "CALLBACK_PAYOFF",
        },
      ],
    },
    payload: {
      archetype: "KINETIC_THESIS_STRIKE",
      strikeTokenSpan: ["S114.T01", "S114.T05"],
      emphasisRole: "PAYCHECK_TO_ALLOWANCE",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S113.T01",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "strikeTokenSpan",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S114.T01",
        intent: "ISOLATE_VERDICT",
        targetSlotKey: "emphasisRole",
      },
    ],
  },

  QUESTION_PIVOT: {
    beatId: "B014",
    actId: "ACT_2",
    sentenceRange: ["S027", "S028"],
    register: "HUMAN_STAKES",
    presenterMode: "OVER_FOOTAGE_GLASS",
    continuity: {
      recalls: [
        {
          entityId: "ENT_CLAIRE_AUSTIN",
          mutation: "STRESS_TEST",
        },
      ],
    },
    payload: {
      archetype: "QUESTION_PIVOT",
      questionTokenSpan: ["S027.T01", "S027.T04"],
      pivotMode: "BUDGET_RERUN",
      callbackEntityId: "ENT_CLAIRE_AUSTIN",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S027.T01",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "questionTokenSpan",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S028.T01",
        intent: "MUTATE_ENTITY_STATE",
        targetSlotKey: "pivotMode",
      },
    ],
  },

  STAT_MONOLITH: {
    beatId: "B004",
    actId: "ACT_1",
    sentenceRange: ["S009", "S009"],
    register: "HARD_REVEAL",
    presenterMode: "FULL_PAGE_CUTAWAY",
    payload: {
      archetype: "STAT_MONOLITH",
      heroFactRef: "F008",
      contextLabel: "Annual Debt Interest Wall",
      sourceAttributionFactRef: "F007",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S009.T06",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "heroFactRef",
        factRef: "F008",
      },
    ],
  },

  CUSTOM_CONTRAPTION_BLUEPRINT: {
    beatId: "B025",
    actId: "ACT_4",
    sentenceRange: ["S065", "S068"],
    register: "HARD_REVEAL",
    presenterMode: "FULL_PAGE_CUTAWAY",
    isShowstopperPeak: true,
    continuity: {
      recalls: [
        {
          entityId: "ENT_SOVEREIGN_DEBT_WALL",
          mutation: "STRESS_TEST",
        },
        {
          entityId: "ENT_ESCAPE_HATCH_BOARD",
          mutation: "COLLAPSE",
        },
      ],
    },
    payload: {
      archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
      contraptionTitle: "Bondholder Priority Spillway",
      presetSetPieceId: "federal-bond-priority-spillway",
      physicsRule: "SPILLWAY_OVERFLOW",
      actors: [
        {
          actorKey: "treasury_inflow",
          kind: "fluid-tank",
          zone: "top-header",
          label: "Federal Tax Basin",
          propVaultId: "treasury-sovereign/TreasuryBondVault",
          semanticRole: "solvent",
        },
        {
          actorKey: "bond_tier_one",
          kind: "prop-rig",
          zone: "center-hero",
          label: "Senior Bond Interest",
          propVaultId: "treasury-sovereign/SpillwayDam3Tier",
          factRef: "F034",
          semanticRole: "capital",
        },
        {
          actorKey: "citizen_dividend",
          kind: "verdict-stamp",
          zone: "bottom-ledger",
          label: "Household Dividend Pipe",
          propVaultId: "legal-governance/GovernorVetoFountainPen",
          semanticRole: "liability",
        },
      ],
      connectors: [
        {
          fromActorKey: "treasury_inflow",
          toActorKey: "bond_tier_one",
          kind: "flow-pipe",
          triggerTokenId: "S067.T12",
        },
        {
          fromActorKey: "bond_tier_one",
          toActorKey: "citizen_dividend",
          kind: "guillotine-cut",
          triggerTokenId: "S068.T08",
        },
      ],
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S065.T02",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "treasury_inflow",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S067.T12",
        intent: "REVEAL_BASELINE",
        targetSlotKey: "bond_tier_one",
        factRef: "F034",
      },
      {
        stepId: "ST03",
        anchorTokenId: "S068.T08",
        intent: "ISOLATE_VERDICT",
        targetSlotKey: "citizen_dividend",
      },
    ],
  },

  DEPTH_SANDWICH_STAGE: {
    beatId: "B003",
    actId: "ACT_1",
    sentenceRange: ["S003", "S003"],
    register: "HARD_REVEAL",
    presenterMode: "DEPTH_SANDWICH",
    isShowstopperPeak: true,
    continuity: {
      recalls: [
        {
          entityId: "ENT_SOVEREIGN_DEBT_WALL",
          mutation: "INITIALIZE",
        },
      ],
    },
    payload: {
      archetype: "DEPTH_SANDWICH_STAGE",
      sandwichPreset: "behind-shoulder-billboard",
      midgroundBehindPresenter: "RISING_DEBT_WALL",
      foregroundGlassPreset: "GlassTelemetryStrip",
      foregroundPlacement: "right-third",
      headlineLabel: "Sovereign Debt Horizon",
      primaryFactRef: "F004",
      secondaryFactRef: "F003",
      propVaultId: "treasury-sovereign/DebtMonolithWall",
    },
    steps: [
      {
        stepId: "ST01",
        anchorTokenId: "S003.T01",
        intent: "ESTABLISH_FRAME",
        targetSlotKey: "headlineLabel",
        factRef: "F003",
      },
      {
        stepId: "ST02",
        anchorTokenId: "S003.T15",
        intent: "STRIKE_ANOMALY",
        targetSlotKey: "primaryFactRef",
        factRef: "F004",
      },
    ],
  },
};

/**
 * Returns the canonical gold `BeatNode` exemplar for a specific `BeatArchetype`.
 */
export function getGoldExemplar(archetype: BeatArchetype): BeatNode {
  return GOLD_BEAT_EXEMPLARS[archetype];
}

/**
 * Returns two distinct gold `BeatNode` exemplars for few-shot slot hydration:
 * the primary archetype exemplar plus a contrasting structural peer.
 */
export function getGoldExemplarPair(
  archetype: BeatArchetype,
): readonly [BeatNode, BeatNode] {
  const primary = GOLD_BEAT_EXEMPLARS[archetype];
  const idx = BEAT_ARCHETYPES.indexOf(archetype);
  const secondaryArchetype =
    BEAT_ARCHETYPES[(idx + 7) % BEAT_ARCHETYPES.length];
  return [primary, GOLD_BEAT_EXEMPLARS[secondaryArchetype]];
}

/**
 * Complete gold opening `StoryboardIR` fixture demonstrating multi-beat continuity,
 * pruned archetype variety, and zero-CSS pointer discipline.
 */
export const EXEMPLAR_EPISODE_01_OPENING_IR: StoryboardIR = {
  irVersion: "1.0.0",
  scriptSha256:
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  strategyPresetId: "STR-GEN-EXPLAINER",
  forbiddenEngines: ["clocked", "street", "field"],
  entities: [
    {
      entityId: "ENT_SOVEREIGN_DEBT_WALL",
      kind: "INSTITUTION",
      canonicalTitle: "Federal Debt Wall",
      iconSemantic: "TREASURY_LEDGER",
      anchorFactRefs: ["F002", "F004"],
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
      anchorFactRefs: ["F012", "F013"],
    },
    {
      entityId: "ENT_PAYCHECK_TO_ALLOWANCE",
      kind: "INSTITUTION",
      canonicalTitle: "Friday Paycheck Truce",
      iconSemantic: "PAYCHECK",
      anchorFactRefs: ["F001"],
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
  beats: [
    GOLD_BEAT_EXEMPLARS.COMPOSITION_STACK,
    GOLD_BEAT_EXEMPLARS.DEPTH_SANDWICH_STAGE,
    GOLD_BEAT_EXEMPLARS.SOCIAL_POST_EXHIBIT,
    GOLD_BEAT_EXEMPLARS.THREE_PILLAR_ROADMAP,
  ],
};
