import { z } from "zod";
import {
  NarrativeEngine,
  NarrativeEngineSchema,
  StrategyPresetId,
  StrategyPresetIdSchema,
  STRATEGY_PRESETS,
} from "./strategyPresets";
import {
  CinemaLutId,
  CinemaLutIdSchema,
  MechanicalMotifId,
  MechanicalMotifIdSchema,
} from "./episodeVault";
import {
  ContinuityEngine,
  createEpisode01ContinuityEngine,
  defineContinuityEntity,
} from "./continuityEngine";

/**
 * Pillar #14 — Season 1 Viral Roadmap & 30-Episode Strategy Registry (`seasonRoadmap.ts`)
 *
 * Pre-wires Episode 01 (*The Allowance: AI vs $40.5T Debt*) + Episodes 02 through 11
 * verbatim from `season_01_roadmap.md` (100/100 linted titles, backup A/B titles,
 * thumbnail text pairs, `STR-*` engine locks, verified primary artifacts, key stats,
 * 15-second cold opens, and bespoke signature set-pieces), plus extensible Season-1
 * blueprint slots through Episode 30.
 */

export const SEASON_01_PLAYLIST_TITLE =
  "AI, National Debt & Global Power Explained" as const;

export const EPISODE_ROADMAP_TIERS = [
  "flagship-locked",
  "verified-roadmap",
  "season-expansion",
] as const;

export type EpisodeRoadmapTier = (typeof EPISODE_ROADMAP_TIERS)[number];

export const EpisodeRoadmapTierSchema = z.enum(EPISODE_ROADMAP_TIERS);

export interface SeasonEpisodeDossier {
  readonly episodeNumber: number;
  readonly episodeCode: string;
  readonly tier: EpisodeRoadmapTier;
  readonly winningTitle: string;
  readonly backupTitle: string;
  readonly thumbnailTextPair: readonly [string, string];
  readonly strategyId: StrategyPresetId;
  readonly strategyVariantNote?: string;
  readonly forbiddenEngines: readonly NarrativeEngine[];
  readonly stakes: "wallet" | "civic" | "wonder" | "geopolitical" | "valuation";
  readonly hasDatedHourTimeline: boolean;
  readonly primaryArtifacts: readonly string[];
  readonly keyVerifiedStats: readonly string[];
  readonly coldOpenVerbatim: string;
  readonly signatureSetPieces: readonly string[];
  readonly recommendedLutId: CinemaLutId;
  readonly recommendedMotif: MechanicalMotifId;
  readonly closingBridgeNextQuestion: string;
}

export const SeasonEpisodeDossierSchema = z.object({
  episodeNumber: z.number().int().min(1).max(60),
  episodeCode: z.string().regex(/^S\d{2}E\d{2}$/),
  tier: EpisodeRoadmapTierSchema,
  winningTitle: z.string().min(10).max(60),
  backupTitle: z.string().min(10).max(60),
  thumbnailTextPair: z.tuple([z.string().min(2), z.string().min(2)]),
  strategyId: StrategyPresetIdSchema,
  strategyVariantNote: z.string().optional(),
  forbiddenEngines: z.array(NarrativeEngineSchema).min(1),
  stakes: z.enum(["wallet", "civic", "wonder", "geopolitical", "valuation"]),
  hasDatedHourTimeline: z.boolean(),
  primaryArtifacts: z.array(z.string().min(1)).min(1),
  keyVerifiedStats: z.array(z.string().min(1)).min(1),
  coldOpenVerbatim: z.string().min(20),
  signatureSetPieces: z.array(z.string().min(1)).min(3).max(5),
  recommendedLutId: CinemaLutIdSchema,
  recommendedMotif: MechanicalMotifIdSchema,
  closingBridgeNextQuestion: z.string().min(10),
});

const EPISODES_01_TO_06: readonly SeasonEpisodeDossier[] = [
  {
    episodeNumber: 1,
    episodeCode: "S01E01",
    tier: "flagship-locked",
    winningTitle: "The Allowance: AI vs $40.5T Debt",
    backupTitle: "Who Pays $40.5T Debt If AI Cuts Jobs?",
    thumbnailTextPair: ["NO PAYCHECKS?", "$40.5T TRAP"],
    strategyId: "STR-GEN-EXPLAINER",
    strategyVariantNote:
      "Fused with Max Fisher numbered board & AI In Context near-future restraint",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "wallet",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "Monthly Treasury Statement Table 9 (>86% individual/payroll vs 7.1% corporate tax; FY26 Net Interest > $1T)",
      "CBO 2036 Long-Term Budget Outlook ($40.5T national debt; $2.1T/yr net interest wall)",
      "Alaska Permanent Fund June 2016 Gov. Walker Veto ($2,052 -> $1,022) & 2017 Wielechowski v. State",
      "IEA 945 TWh AI Grid Forecast + PJM 2025/2026 Capacity Auction ($28.92 -> $269.92/MW-day, +833%)",
      "UK Ministry of Food Dec 1, 1941 16-Point Wartime Ration Book",
    ],
    keyVerifiedStats: [
      ">86% of federal tax cash comes from individual income & payroll withholding while corporate share fell from 10.8% (FY24) to 7.1% (FY26).",
      "$19.1T US household debt (~70% fixed-rate mortgages) collides with coding-agent wage compression while CBO projects $2.1T/yr federal interest by 2036.",
      "Workers' share of GDP hit ~53% (lowest since 1947) as Alphabet, Amazon, Meta, Microsoft, and Oracle push AI capex past $820B/yr.",
      "PJM wholesale capacity spiked +833% ($28.92 to $269.92/MW-day) while Microsoft locked up Three Mile Island Unit 1 for 20 years.",
    ],
    coldOpenVerbatim:
      "Over eighty-six percent of Washington's tax revenue comes out of human paychecks and individual income taxes. Meanwhile, the Congressional Budget Office projects America's national debt will hit $40.5 trillion by 2036. So if AI wipes out a huge share of those paychecks before 2036, who's going to pay off $40.5 trillion in national debt?",
    signatureSetPieces: [
      "sp-ep01-shoe-bom-vaporizer",
      "sp-ep01-whiteboard-iron-loan-flip",
      "sp-ep01-port-1955-vs-2034-diptych",
      "sp-ep01-wattage-10w-to-5gw-ladder",
      "sp-ep01-walker-veto-allowance-slam",
    ],
    recommendedLutId: "editorial-warm",
    recommendedMotif: "hydraulic-spillway-and-veto-slash",
    closingBridgeNextQuestion:
      "If foreign central banks see Washington printing to cover shrinking payroll taxes, who is still buying America's $40 trillion debt right now?",
  },
  {
    episodeNumber: 2,
    episodeCode: "S01E02",
    tier: "verified-roadmap",
    winningTitle: "Who Buys America's $40T Debt Now?",
    backupTitle: "Stablecoins vs Japan: $40T Debt Shift",
    thumbnailTextPair: ["TOKYO OUT", "CRYPTO BUYER?"],
    strategyId: "STR-FISHER-ARTIFACT",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "geopolitical",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "US Treasury TIC Foreign Holders Table (Japan $1,239B -> $1,068B)",
      "Tether Q3 2026 BDO Reserve Attestation ($132.4B US Treasury bills)",
      "July 2025 GENIUS Act statutory T-bill reserve mandate",
    ],
    keyVerifiedStats: [
      "BOJ hiked to 1.25% (Sept 2026) and 30Y JGB yields hit ~4.0%, pulling Japan's Treasury holdings from $1,239B down to $1,068B.",
      "US FY26 net interest ($1.052T) surpassed defense ($965B).",
      "Tether ($132.4B T-bills, ahead of Germany and South Korea) + Circle (~$68B) absorb short-dated bills under the GENIUS Act, concentrating rollover risk in 90-day paper.",
    ],
    coldOpenVerbatim:
      "Look at this Treasury table. For years, Tokyo bought Washington's debt without blinking. Now Japanese long-term yields are pushing four percent, and that cash is heading home. So who's buying the bills instead? A crypto firm holding $132 billion in T-bills. Congress even wrote the GENIUS Act to lock it in.",
    signatureSetPieces: [
      "sp-ep02-tether-vs-tokyo-tbill-shift",
      "sp-ep02-90day-rollover-conveyor",
      "sp-ep02-genius-act-statutory-lock",
      "sp-ep02-interest-overtakes-defense-scale",
    ],
    recommendedLutId: "archival-parchment",
    recommendedMotif: "rollover-conveyor-and-treasury-scale",
    closingBridgeNextQuestion:
      "If Silicon Valley's AI boom is supposed to outgrow that debt wall, why did Big Tech stretch server lifespans to manufacture $176 billion in paper profit?",
  },
  {
    episodeNumber: 3,
    episodeCode: "S01E03",
    tier: "verified-roadmap",
    winningTitle: "Big Tech's $176B AI Profit Trick?",
    backupTitle: "Nvidia's 2026 Circular AI Revenue Loop",
    thumbnailTextPair: ["PAPER PROFITS", "6-YEAR LIE"],
    strategyId: "STR-BOYLE-CHAPTERED",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "valuation",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "Hyperscaler Form 10-K server useful-life footnotes (3 years stretched to 5-6 years)",
      "CoreWeave Q3 2026 Form 10-Q ($46.9B debt + $19.3B leases = $66.2B)",
      "Form 8-K ($6.3B Nvidia residual capacity backstop) + xAI $20B off-balance-sheet GPU SPV",
    ],
    keyVerifiedStats: [
      "$720B-$828B 2026 CapEx runs 3x-4x book depreciation.",
      "5-6 year schedules vs 12-24 month Nvidia chip cycles understate 2026-2028 depreciation by ~$176B (Burry estimate).",
      "Circular GPU debt SPVs include CoreWeave's $66.2B debt/leases, Nvidia's ~$30B OpenAI equity stake, and xAI's $20B off-balance-sheet GPU SPV.",
    ],
    coldOpenVerbatim:
      "Nvidia ships a new AI chip generation roughly every eighteen months, yet Big Tech's annual filings stretched server lifespans from three years out to six. That single accounting footnote manufactured $176 billion in paper profit. Then came the side vehicles. They're borrowing tens of billions against those same GPUs.",
    signatureSetPieces: [
      "sp-ep03-nvidia-coreweave-spv-carousel",
      "sp-ep03-server-lifespan-3yr-to-6yr-stretch",
      "sp-ep03-176b-paper-profit-footnote-loupe",
      "sp-ep03-off-balance-sheet-gpu-collateral-box",
    ],
    recommendedLutId: "midnight-desk",
    recommendedMotif: "circular-spv-carousel-and-depreciation-ledger",
    closingBridgeNextQuestion:
      "While hyperscalers hide hardware depreciation off balance sheet, what happens to the $2.5 trillion private credit market holding $500 billion in legacy SaaS buyout debt?",
  },
  {
    episodeNumber: 4,
    episodeCode: "S01E04",
    tier: "verified-roadmap",
    winningTitle: "How AI Agents Break $2.5T Private Credit",
    backupTitle: "AI Coding Agents vs $2.5T Private Credit",
    thumbnailTextPair: ["SAAS DEFAULT", "HIDDEN DEBT"],
    strategyId: "STR-HMW-PRIMER",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "valuation",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "BDC Form 10-Q Schedules of Investments (ARCC ~28% software, BXSL ~21%, OBDC ~17%+) showing PIK toggles",
      "Fitch 2026 US Private Credit Default Report (6.3% record default rate; 88% masked via PIK & extensions)",
    ],
    keyVerifiedStats: [
      "$2.1T-$2.6T private credit market holds $500B+ in SaaS buyout loans built on per-seat human pricing.",
      "Fitch US Private Credit Default Rate hit a record 6.3% in 2026, with 88% masked via PIK toggles (~50%) and distressed extensions (~38%).",
    ],
    coldOpenVerbatim:
      "Private credit grew into a $2.5 trillion shadow banking market on one simple pitch. Software companies never lose customers. So funds loaded $500 billion in buyout debt onto firms charging per human seat. Now AI coding agents are cutting headcount. Borrowers can't pay cash, so they're paying with more debt.",
    signatureSetPieces: [
      "sp-ep04-saas-pik-debt-snowball",
      "sp-ep04-per-seat-license-evaporator",
      "sp-ep04-bdc-10q-masked-default-unveil",
      "sp-ep04-shadow-bank-tranche-cascade",
    ],
    recommendedLutId: "documentary-slate",
    recommendedMotif: "pik-toggle-valve-and-snowball",
    closingBridgeNextQuestion:
      "Shadow-bank covenants aren't the only hidden variable clause: how can rising home insurance break a thirty-year fixed-rate mortgage?",
  },
  {
    episodeNumber: 5,
    episodeCode: "S01E05",
    tier: "verified-roadmap",
    winningTitle: "How Insurance Breaks $13.4T Mortgages?",
    backupTitle: "Why Home Insurance Breaks $13T Loans",
    thumbnailTextPair: ["ESCROW SHOCK", "DROPPED"],
    strategyId: "STR-GEN-EXPLAINER",
    strategyVariantNote: "AIC restraint",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "wallet",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "California FAIR Plan +29.1% rate-hike approval (Oct 2026, ~700k policies)",
      "Standard Fannie Mae / Freddie Mac uniform mortgage continuous-insurance default covenant",
    ],
    keyVerifiedStats: [
      "$13.4T US mortgages (~92% fixed-rate) still carry uncapped variable property-insurance escrow risk.",
      "Florida averages $8,400+/yr, aerial drone roof scoring triggers non-renewals, and lender force-placed policies multiply premiums while protecting zero homeowner equity.",
    ],
    coldOpenVerbatim:
      "You'd think a thirty-year fixed mortgage locks your monthly payment, until you open California's FAIR Plan notice after a 29.1 percent hike. Across $13.4 trillion in US mortgages, escrow bills can jump overnight. Lose your private policy, and your bank buys force-placed coverage on your dime.",
    signatureSetPieces: [
      "sp-ep05-california-lidar-roof-drone",
      "sp-ep05-fixed-mortgage-variable-escrow-wedge",
      "sp-ep05-fair-plan-29pct-shock-notice",
      "sp-ep05-force-placed-zero-equity-trap",
    ],
    recommendedLutId: "austin-august-heat",
    recommendedMotif: "lidar-roof-scan-and-escrow-thermometer",
    closingBridgeNextQuestion:
      "Grid heat and storm risk aren't the only physical bottleneck hitting households: why is America's 94-gigawatt AI grid trapped behind Chinese copper and a 128-week transformer queue?",
  },
  {
    episodeNumber: 6,
    episodeCode: "S01E06",
    tier: "verified-roadmap",
    winningTitle: "China's 2026 Copper Trap for AI Grids",
    backupTitle: "America's 94 GW Power Wall for AI",
    thumbnailTextPair: ["NO TRANSFORMERS", "SUPPLY LOCK"],
    strategyId: "STR-FISHER-ARTIFACT",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "geopolitical",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "IEA Critical Mineral Refining Share Table (China 72% average refining, 90% rare earths, 60% transformer capacity)",
      "US DOE / Utility Large Power Transformer Waitlist Ledger (100-160 weeks) + PJM 2026/2027 $329.17/MW-day cap filing",
    ],
    keyVerifiedStats: [
      "US AI data centers seek ~280 GW vs ~186 GW grid capacity (94 GW gap; PJM 2026/2027 auction hit $329.17/MW-day cap).",
      "IEA projects a 25% global copper deficit by 2035 with 17.5-year mine discovery-to-production timelines; China's Nov 27, 2026 export-ban truce deadline keeps the supply chain on a hair trigger.",
    ],
    coldOpenVerbatim:
      "America's AI grid faces a 94-gigawatt power gap, yet this utility supply table shows the hardware isn't coming fast. Large transformers carry a 128-week waitlist while new copper mines take 17.5 years. Meanwhile, China controls 72 percent of key mineral refining and 60 percent of transformer capacity.",
    signatureSetPieces: [
      "sp-ep06-transformer-128wk-copper-trap",
      "sp-ep06-17p5yr-copper-mine-chronometer",
      "sp-ep06-china-72pct-refining-chokepoint",
      "sp-ep06-pjm-94gw-deficit-breaker",
    ],
    recommendedLutId: "blueprint-cyanotype",
    recommendedMotif: "transformer-waitlist-and-smelter-funnel",
    closingBridgeNextQuestion:
      "Even if Washington wires the power, why won't $265 billion in Arizona chip fabs save Apple and Nvidia from Taiwan?",
  },
];

const EPISODES_07_TO_11: readonly SeasonEpisodeDossier[] = [
  {
    episodeNumber: 7,
    episodeCode: "S01E07",
    tier: "verified-roadmap",
    winningTitle: "Why $265B Won't Save Apple From Taiwan",
    backupTitle: "$265B Arizona Fabs Can't Replace Taiwan",
    thumbnailTextPair: ["STILL TRAPPED", "CHIP ILLUSION"],
    strategyId: "STR-AIC-SPECULATIVE",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "geopolitical",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "TSMC 2026 Global Node Map (Phoenix N4 4nm vs Hsinchu/Kaohsiung 2nm N2 & 1.6nm A16)",
      "Bloomberg Economics $10T Taiwan Blockade Shock Model",
      "ASML EUV Lithography Remote-Disable Technical Disclosures",
    ],
    keyVerifiedStats: [
      "$265B committed in Arizona still leaves 80%-90%+ of sub-5nm and 100% of 2nm/A16 volume in Taiwan, backing $14T+ in top-10 customer market cap ($5.1T Apple, $4.0T Nvidia).",
      "ASML's remote EUV kill-switch prevents intact fab seizure while guaranteeing mutual advanced-node supply loss.",
    ],
    coldOpenVerbatim:
      "Picture a Monday morning when maritime shipping insurance for Taiwan vanishes. Over $14 trillion in US stock market value rides on Taiwan's 2-nanometer and A16 chips, and a blockade risks a $10 trillion global shock. Washington backed $265 billion in Phoenix fabs. None of that beats ASML's remote kill-switch.",
    signatureSetPieces: [
      "sp-ep07-taiwan-2nm-euv-killswitch",
      "sp-ep07-maritime-insurance-monday-pull",
      "sp-ep07-phoenix-4nm-vs-hsinchu-a16-die-split",
      "sp-ep07-10t-blockade-market-cap-domino",
    ],
    recommendedLutId: "kodak-2383-print",
    recommendedMotif: "wafer-lithography-and-euv-killswitch",
    closingBridgeNextQuestion:
      "If deterrence in the Strait rests on US naval power, what happens when a $20,000 autonomous drone forces a $13 billion carrier to fire a $4 million missile?",
  },
  {
    episodeNumber: 8,
    episodeCode: "S01E08",
    tier: "verified-roadmap",
    winningTitle: "How $20,000 Drones Break a $1T Budget",
    backupTitle: "Why $20,000 Drones Beat $1T Defense",
    thumbnailTextPair: ["WAR MATH", "OBSOLETE"],
    strategyId: "STR-MAX-ESSAY",
    forbiddenEngines: ["clocked", "street", "field"],
    stakes: "geopolitical",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "US Navy Red Sea Interceptor Expenditure Ledger ($2.1M SM-2 / $4M+ SM-6 & Patriot vs $20,000 drones)",
      "DoD FY26/FY27 $965B-$1T+ Procurement & Munitions Replenishment Queue Table",
    ],
    keyVerifiedStats: [
      "100:1 cost-exchange inversion burned $1B-$2B in Red Sea interceptors.",
      "Shallow Mk 41 VLS magazines and multi-year solid-rocket-motor restock queues expose $13B carriers to attrition math.",
    ],
    coldOpenVerbatim:
      "A $1 trillion Pentagon budget looks unstoppable until a $20,000 autonomous drone flies at a $13 billion carrier, forcing the ship to fire a $4 million interceptor. That's a 100-to-1 trade. From Ukraine to the Red Sea, cheap drones are breaking modern warfare math.",
    signatureSetPieces: [
      "sp-ep08-drone-20k-vs-carrier-vls-drain",
      "sp-ep08-100-to-1-interceptor-balance-scale",
      "sp-ep08-96-cell-vls-magazine-depletion",
      "sp-ep08-multiyear-missile-restock-queue",
    ],
    recommendedLutId: "clean-room-pop",
    recommendedMotif: "cost-exchange-scale-and-vls-matrix",
    closingBridgeNextQuestion:
      "Surface fleets guard the sea lanes above, yet 99 percent of global data and $10 trillion a day in bank settlements cross 550 garden-hose cables on the ocean floor.",
  },
  {
    episodeNumber: 9,
    episodeCode: "S01E09",
    tier: "verified-roadmap",
    winningTitle: "How 550 Cables Carry $10T a Day",
    backupTitle: "Why 550 Undersea Cables Move $10T Daily",
    thumbnailTextPair: ["ONE CUT AWAY", "FRAGILE PIPES"],
    strategyId: "STR-FISHER-ARTIFACT",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "geopolitical",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "TeleGeography Global Submarine Cable Map (550-600+ active subsea systems)",
      "SWIFT / Fedwire $10T/day Cross-Border Settlement Benchmark",
      "Red Sea (Sept 2025 Jeddah) & Baltic Sea (Eagle S, Fitburg) Anchor-Drag Sabotage Logs",
    ],
    keyVerifiedStats: [
      ">99% of intercontinental data and ~$10T-$12T/day in financial messaging cross 550-600+ seabed cables.",
      "Google, Meta, Microsoft, and Amazon now control ~75% of international subsea bandwidth (~90% trans-Atlantic).",
    ],
    coldOpenVerbatim:
      "Look at this map. Everything you call the cloud runs through roughly 550 undersea cables as thin as garden hoses. They move 99 percent of intercontinental data and help settle $10 trillion a day across global banks. Now check the Baltic and Red Sea cuts. Four tech giants own the new ocean floor.",
    signatureSetPieces: [
      "sp-ep09-subsea-550-cable-anchor-cut",
      "sp-ep09-17mm-garden-hose-core-cutaway",
      "sp-ep09-swift-10t-daily-settlement-pulse",
      "sp-ep09-hyperscaler-90pct-atlantic-monopoly",
    ],
    recommendedLutId: "subsea-sodium",
    recommendedMotif: "bathymetry-trench-and-anchor-sever",
    closingBridgeNextQuestion:
      "Across those same financial wires, bond vigilantes just pulled off a shock in Europe: why is France now paying a higher borrowing rate than Greece?",
  },
  {
    episodeNumber: 10,
    episodeCode: "S01E10",
    tier: "verified-roadmap",
    winningTitle: "France's 4.93% Debt Cost vs Greece?",
    backupTitle: "Why France Pays Higher Rates Than Greece",
    thumbnailTextPair: ["YIELD SPIKE", "VIGILANTES"],
    strategyId: "STR-BOYLE-CHAPTERED",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "valuation",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "French 10Y OAT (4.93% Nov 2026) vs Greek 10Y (4.26%) Sovereign Yield Ledger",
      "Eurostat Primary Budget Balance Table (-5.4% France deficit vs +2.0% Greece surplus)",
      "MOF / BOJ Japan 204%-237% Debt-to-GDP & 10Y JGB (~2.9%) Schedule",
    ],
    keyVerifiedStats: [
      "Bond vigilantes charged France 67 bps more than Greece (173-177 bps over Germany, widest since 2011).",
      "Japan carries 204%-237% debt-to-GDP as 10Y JGB yields climb toward 2.9%.",
    ],
    coldOpenVerbatim:
      "Pull up European government bond yields and check one line that looks like a typo. France now pays 4.93 percent to borrow, sixty-seven basis points worse than Greece. Over in Tokyo, Japan carries over 200 percent debt-to-GDP as yields climb. G7 governments thought status protected them. Bond vigilantes disagree.",
    signatureSetPieces: [
      "sp-ep10-france-greece-vigilante-flip",
      "sp-ep10-67bps-spread-inversion-caliper",
      "sp-ep10-tokyo-237pct-debt-jgb-pressure",
      "sp-ep10-g7-status-shield-shatter",
    ],
    recommendedLutId: "verdict-high-contrast",
    recommendedMotif: "sovereign-spread-caliper-and-orderbook",
    closingBridgeNextQuestion:
      "And back in Washington, an automatic statutory cliff arrives even sooner than 2036: why does Social Security run dry in the fourth quarter of 2032?",
  },
  {
    episodeNumber: 11,
    episodeCode: "S01E11",
    tier: "verified-roadmap",
    winningTitle: "Why Social Security Runs Dry in 2032",
    backupTitle: "Social Security 2032 Cliff in AI Boom",
    thumbnailTextPair: ["EMPTY VAULT", "MISSING TAX"],
    strategyId: "STR-AIC-SPECULATIVE",
    forbiddenEngines: ["clocked", "street", "field", "ladder"],
    stakes: "wallet",
    hasDatedHourTimeline: false,
    primaryArtifacts: [
      "2026 Social Security Trustees Report & CBO OASI Depletion Table (Q4 2032 exhaustion -> automatic 22%-26% cut)",
      "IRS Form 941 Employer Quarterly Payroll Tax Schedule (12.4% FICA on human W-2 wages vs 0% on GPU clusters)",
    ],
    keyVerifiedStats: [
      "Q4 2032 OASI trust-fund exhaustion triggers an automatic statutory 22%-26% benefit cut without a congressional vote.",
      "~$30T 75-year unfunded shortfall collides with East Asian demographic previews (0.72 South Korea fertility rate) and AI shifting income off FICA-taxed W-2 payrolls.",
    ],
    coldOpenVerbatim:
      "In the fourth quarter of 2032, federal law triggers an automatic 22 to 26 percent cut to Social Security checks without a single vote in Congress. Every benefit dollar depends on a 12.4 percent payroll tax pulled from human wages. AI servers pay zero.",
    signatureSetPieces: [
      "sp-ep11-oasi-2032-vault-exhaustion",
      "sp-ep11-form-941-human-12p4pct-vs-gpu-zero",
      "sp-ep11-q4-2032-automatic-24pct-guillotine",
      "sp-ep11-south-korea-0p72-demographic-mirror",
    ],
    recommendedLutId: "cold-2030-deflation",
    recommendedMotif: "trust-vault-hourglass-and-payroll-siphon",
    closingBridgeNextQuestion:
      "Outside Washington's tax borders sits an even larger unrecorded dollar machine: how did offshore Eurodollars build a shadow Federal Reserve?",
  },
];

interface ExpansionSeed {
  readonly ep: number;
  readonly winningTitle: string;
  readonly backupTitle: string;
  readonly thumb: readonly [string, string];
  readonly strategyId: StrategyPresetId;
  readonly stakes: "wallet" | "civic" | "wonder" | "geopolitical" | "valuation";
  readonly clockedOk: boolean;
  readonly fieldOk: boolean;
  readonly artifact: string;
  readonly stat: string;
  readonly coldOpen: string;
  readonly lut: CinemaLutId;
  readonly motif: MechanicalMotifId;
  readonly setPieces: readonly string[];
  readonly bridge: string;
}

const EXPANSION_SEEDS_12_TO_20: readonly ExpansionSeed[] = [
  {
    ep: 12,
    winningTitle: "How Eurodollars Built a Shadow Fed",
    backupTitle: "The $14T Offshore Dollar Machine",
    thumb: ["SHADOW FED", "OFFSHORE USD"],
    strategyId: "STR-AOTP-LADDER",
    stakes: "wonder",
    clockedOk: false,
    fieldOk: false,
    artifact: "BIS International Banking Statistics Offshore USD Table & 1957 Bank of England Archive",
    stat: "Over $14T in dollar-denominated liabilities circulate outside US reserve jurisdiction via offshore repo chains.",
    coldOpen: "Most of the dollars moving world trade never touch an American bank vault. Starting in 1957 London, offshore ledgers built a multi-trillion-dollar credit machine that the Federal Reserve neither prints nor directly regulates.",
    lut: "silver-gelatin-1941",
    motif: "split-century-archival-chronometer",
    setPieces: ["sp-ep12-1957-london-dollar-ledger-rung", "sp-ep12-offshore-repo-collateral-chain", "sp-ep12-fed-swap-line-emergency-valve"],
    bridge: "When mobile banking met unhedged Treasury duration, how did $42 billion flee Silicon Valley Bank in forty-two hours?",
  },
  {
    ep: 13,
    winningTitle: "42 Hours: Inside SVB's $42B Mobile Run",
    backupTitle: "How Smartphone Runs Killed SVB in 42h",
    thumb: ["$42B GONE", "42 HOURS"],
    strategyId: "STR-AIC-CLOCKED",
    stakes: "civic",
    clockedOk: true,
    fieldOk: false,
    artifact: "Federal Reserve Michael Barr SVB Post-Mortem Timestamped Wire Log (March 9-10, 2023)",
    stat: "$42B exited SVB on March 9 alone (~$1M/sec peak) with $100B more queued for Friday morning against $15B unbooked HTM bond losses.",
    coldOpen: "At 8:28 a.m. Pacific on Thursday, March 9, venture founders began forwarding one Slack warning. By Friday morning, depositors had tried to pull $142 billion out of Silicon Valley Bank using smartphone banking apps.",
    lut: "midnight-desk",
    motif: "hydraulic-spillway-and-veto-slash",
    setPieces: ["sp-ep13-svb-slack-channel-deposit-drain", "sp-ep13-hold-to-maturity-bond-duration-trap", "sp-ep13-fedwire-cutoff-solvency-gate"],
    bridge: "Opaque balance-sheet plumbing also runs American medicine: how did three middlemen lock up 80 percent of US prescriptions?",
  },
  {
    ep: 14,
    winningTitle: "Why 3 PBMs Control 80% of US Drug Prices",
    backupTitle: "How 3 Middlemen Rig US Prescription Pay",
    thumb: ["REBATE TRAP", "3 MIDDLEMEN"],
    strategyId: "STR-MAX-ESSAY",
    stakes: "wallet",
    clockedOk: false,
    fieldOk: false,
    artifact: "FTC Interim Staff Report on Prescription Drug Middlemen (Caremark, Express Scripts, OptumRx)",
    stat: "3 vertically integrated insurer-PBMs process ~80% of US prescriptions, widening list-to-net rebate spreads.",
    coldOpen: "A generic cancer pill costs pennies to press in a factory, yet patients receive four-figure pharmacy bills. Sitting between the drugmaker and your counter are three corporate middlemen processing eighty percent of America's prescriptions.",
    lut: "editorial-warm",
    motif: "pik-toggle-valve-and-snowball",
    setPieces: ["sp-ep14-pbm-rebate-siphon-spread", "sp-ep14-list-vs-net-insulin-staircase", "sp-ep14-vertical-insurer-pharmacy-loop"],
    bridge: "Physical maritime chokepoints price goods the same way: what happens when Panama's freshwater locks and Suez stall together?",
  },
  {
    ep: 15,
    winningTitle: "Panama vs Suez: Who Prices World Trade?",
    backupTitle: "Why 2 Canals Hold Global Freight Hostage",
    thumb: ["TWO LOCKS", "TRADE CHOKE"],
    strategyId: "STR-FISHER-ARTIFACT",
    stakes: "geopolitical",
    clockedOk: false,
    fieldOk: false,
    artifact: "Panama Canal Authority Gatun Lake Water-Level Ledger & Clarksons Cape Reroute Ton-Mile Index",
    stat: "Each Panama transit flushes ~50M gallons of freshwater while Red Sea reroutes add 3,500 nautical miles around Africa.",
    coldOpen: "Open the Panama Canal Authority's water table. Every container ship crossing those locks flushes fifty million gallons of rainwater into the ocean. When drought in Panama collided with Red Sea missile fire, global shipping lost both shortcuts at once.",
    lut: "subsea-sodium",
    motif: "bathymetry-trench-and-anchor-sever",
    setPieces: ["sp-ep15-gatun-lake-freshwater-lock-meter", "sp-ep15-cape-of-good-hope-reroute-burn", "sp-ep15-container-slot-auction-bidding-war"],
    bridge: "Back on Main Street, why does your neighborhood vet clinic still carry its family sign after Wall Street bought it?",
  },
  {
    ep: 16,
    winningTitle: "How Private Equity Rolls Up Your Vet",
    backupTitle: "Why Wall Street Bought Local Vet Clinics",
    thumb: ["HIDDEN OWNER", "VET ROLLUP"],
    strategyId: "STR-HMW-PRIMER",
    stakes: "wallet",
    clockedOk: false,
    fieldOk: false,
    artifact: "Private Equity Veterinary Roll-Up Debt Offering Memo & FTC Roll-Up Consent Decrees",
    stat: "Corporate consolidators bought ~30% of US general vet practices and >70% of specialty/emergency clinics via multiple arbitrage.",
    coldOpen: "Walk into three neighborhood veterinary clinics in the same town and compare their emergency surgery quotes. Different family names hang out front, yet the credit-card terminal routes all three bills to the same private equity parent.",
    lut: "archival-parchment",
    motif: "circular-spv-carousel-and-depreciation-ledger",
    setPieces: ["sp-ep16-clinic-multiple-arbitrage-stack", "sp-ep16-sale-leaseback-rent-extraction", "sp-ep16-local-brand-camouflage-wall"],
    bridge: "Cheap leverage funded roll-ups worldwide, anchored in Tokyo: what happens as Japan's 35-year yen carry trade unwinds?",
  },
  {
    ep: 17,
    winningTitle: "Japan's 35-Year Carry Trade Unwind?",
    backupTitle: "How Cheap Yen Leverage Wired US Tech",
    thumb: ["YEN UNWIND", "HIDDEN LEVER"],
    strategyId: "STR-BOYLE-CHAPTERED",
    stakes: "valuation",
    clockedOk: false,
    fieldOk: false,
    artifact: "BIS Cross-Border Yen Borrowing Table & Bank of Japan Balance Sheet Filing",
    stat: "Over $1T+ in cross-border yen claims funded higher-yielding US/EM assets during three decades of near-zero BOJ rates.",
    coldOpen: "For thirty-five years, global funds ran the simplest trade in finance: borrow Japanese yen near zero percent, convert into dollars, and buy higher-yielding assets abroad. Now the Bank of Japan is raising rates into a mountain of leverage.",
    lut: "kodak-2383-print",
    motif: "rollover-conveyor-and-treasury-scale",
    setPieces: ["sp-ep17-yen-borrow-nasdaq-leverage-bridge", "sp-ep17-boj-yield-cap-spring-release", "sp-ep17-mrs-watanabe-fx-margin-cascade"],
    bridge: "Even debt-free Americans face an uncapped annual lien at home: why are property taxes pricing out paid-off retirees?",
  },
  {
    ep: 18,
    winningTitle: "Why Property Taxes Break Fixed Retirees",
    backupTitle: "Paid-Off Home, Priced Out by Tax Liens",
    thumb: ["NEVER OWNED?", "TAX RATCHET"],
    strategyId: "STR-GEN-EXPLAINER",
    stakes: "wallet",
    clockedOk: false,
    fieldOk: false,
    artifact: "County Appraisal District Revaluation Roll & Tyler v. Hennepin County Supreme Court Opinion",
    stat: "Post-2020 home-value surges lifted annual municipal tax levies 40%-70% in uncapped counties against fixed retiree income.",
    coldOpen: "Spend thirty years paying off every dollar of your home mortgage, then miss two county property-tax installments. Your county courthouse still holds first lien on the deed, and reassessments just jumped.",
    lut: "austin-august-heat",
    motif: "lidar-roof-scan-and-escrow-thermometer",
    setPieces: ["sp-ep18-municipal-assessment-ratchet", "sp-ep18-paid-off-home-tax-lien-trap", "sp-ep18-school-bond-levy-waterfall"],
    bridge: "Modern infrastructure relies on invisible timing signals too: how does cheap ground spoofing blind commercial airliners' GPS?",
  },
  {
    ep: 19,
    winningTitle: "Why GPS Spoofing Breaks Civil Aviation",
    backupTitle: "How $400 Transmitters Blind Airliner GPS",
    thumb: ["FAKE SKY", "GPS BLIND"],
    strategyId: "STR-AOTP-LADDER",
    stakes: "wonder",
    clockedOk: false,
    fieldOk: false,
    artifact: "OPSGROUP Civil Aviation GPS Spoofing Incident Bulletin & Navstar Link-Budget Spec",
    stat: "GPS satellites broadcast at ~20-50 watts from 20,200 km altitude, arriving weaker than a car headlight across a continent.",
    coldOpen: "Twenty thousand kilometers overhead, a GPS satellite broadcasts its atomic clock with roughly the wattage of a refrigerator bulb. Near conflict zones, ground transmitters overpower that whisper and convince airliner cockpits they are miles off course.",
    lut: "blueprint-cyanotype",
    motif: "wafer-lithography-and-euv-killswitch",
    setPieces: ["sp-ep19-20-watt-satellite-signal-budget", "sp-ep19-inertial-drift-vs-fake-sky-cone", "sp-ep19-black-sea-cockpit-clock-jump"],
    bridge: "Physical bottlenecks concentrate global food the same way: how did four private desks come to move 70 percent of world grain?",
  },
  {
    ep: 20,
    winningTitle: "How 4 Traders Move 70% of World Grain",
    backupTitle: "Inside the 4 Firms Pricing Global Food",
    thumb: ["4 GRAIN GIANTS", "FOOD CHOKE"],
    strategyId: "STR-FISHER-ARTIFACT",
    stakes: "geopolitical",
    clockedOk: false,
    fieldOk: false,
    artifact: "USDA / UNCTAD Global Grain Merchandising Concentration Filing (ADM, Bunge, Cargill, Louis Dreyfus)",
    stat: "Four 'ABCD' houses control ~70% of cross-border grain elevator, barge, and ocean bulk logistics.",
    coldOpen: "Every loaf of bread depends on a narrow chain of river barges, port elevators, and bulk ships. Four century-old trading houses control roughly seventy percent of that corridor, profiting most when harvests and wars turn volatile.",
    lut: "documentary-slate",
    motif: "transformer-waitlist-and-smelter-funnel",
    setPieces: ["sp-ep20-abcd-grain-silo-corridor-map", "sp-ep20-fertilizer-natural-gas-feedstock-pipe", "sp-ep20-port-elevator-basis-spread"],
    bridge: "AI labs face their own raw-material wall: what happens when frontier models exhaust high-quality human writing?",
  },
];

const EXPANSION_SEEDS_21_TO_30: readonly ExpansionSeed[] = [
  {
    ep: 21,
    winningTitle: "When AI Models Run Out of Human Text",
    backupTitle: "The 2028 Human Data Wall for Frontier AI",
    thumb: ["DATA WALL", "MODEL COLLAPSE"],
    strategyId: "STR-AIC-SPECULATIVE",
    stakes: "wonder",
    clockedOk: false,
    fieldOk: false,
    artifact: "Epoch AI Public Human Text Stock Projection & Nature Model-Autophagy Paper",
    stat: "Frontier pre-training exhausts indexed public human text between 2026 and 2028, shifting spend to RL verifiers and licensed archives.",
    coldOpen: "Every frontier language model grew smart by reading decades of human writing scraped from the open web. Research labs calculate that public human text stock runs dry before 2029, forcing AI into a synthetic feedback loop.",
    lut: "clean-room-pop",
    motif: "circular-spv-carousel-and-depreciation-ledger",
    setPieces: ["sp-ep21-synthetic-data-inbreeding-collapse", "sp-ep21-publisher-paywall-licensing-fortress", "sp-ep21-verifier-compute-scaling-wall"],
    bridge: "Unfunded promises compound quietly inside state budgets too: how big is America's $1.2 trillion municipal pension hole?",
  },
  {
    ep: 22,
    winningTitle: "America's $1.2T Municipal Pension Hole",
    backupTitle: "How 7% Return Targets Hide Pension Debt",
    thumb: ["7% MIRAGE", "CITY DEBT"],
    strategyId: "STR-BOYLE-CHAPTERED",
    stakes: "civic",
    clockedOk: false,
    fieldOk: false,
    artifact: "State & Local ACFR Pension Footnotes (GASB 67/68 Discount Rate Assumptions)",
    stat: "$1.2T-$1.5T unfunded public pension liabilities rely on ~7.0% assumed returns, pushing funds into illiquid private credit and PE.",
    coldOpen: "Open a city government's annual financial report and turn to the pension discount footnote. Assuming seven percent returns every year lets mayors balance today's budget while pushing a trillion-dollar shortfall onto future taxpayers.",
    lut: "silver-gelatin-1941",
    motif: "trust-vault-hourglass-and-payroll-siphon",
    setPieces: ["sp-ep22-7pct-assumed-return-mirage-bar", "sp-ep22-private-credit-pension-allocation-shift", "sp-ep22-city-service-cut-priority-blade"],
    bridge: "Household transport credit is cracking faster still: why did $800 billion in auto loans hit record repossessions?",
  },
  {
    ep: 23,
    winningTitle: "Why $800B Auto Loans Hit Record Repo",
    backupTitle: "Inside America's 84-Month Car Loan Trap",
    thumb: ["REPO SURGE", "84-MONTH TRAP"],
    strategyId: "STR-MAX-ESSAY",
    stakes: "wallet",
    clockedOk: false,
    fieldOk: false,
    artifact: "NY Fed Household Debt Auto Delinquency Series & Subprime Auto ABS Prospectus",
    stat: "$1.6T total US auto debt carries record $740+ average new monthly payments and rising negative-equity trade-in rollovers.",
    coldOpen: "Stretch a car loan out to eighty-four months at eleven percent interest, and you owe thousands more than the vehicle is worth the day you drive off the lot. License-plate camera trucks are now logging record repossessions.",
    lut: "cold-2030-deflation",
    motif: "pik-toggle-valve-and-snowball",
    setPieces: ["sp-ep23-84-month-negative-equity-rollover", "sp-ep23-subprime-abs-tranche-delinquency-meter", "sp-ep23-lpr-tow-truck-scan-grid"],
    bridge: "Now step onto the physical ground where AI meets household electric bills: inside Northern Virginia's 4-gigawatt Data Center Alley.",
  },
  {
    ep: 24,
    winningTitle: "Inside Virginia's 4 GW Data Center Alley",
    backupTitle: "On Site Where AI Eats Residential Power",
    thumb: ["4 GW ALLEY", "YOUR BILL"],
    strategyId: "STR-GEN-FIELD",
    stakes: "wallet",
    clockedOk: false,
    fieldOk: true,
    artifact: "Virginia JLARC Data Center Grid Impact Audit & Loudoun County Substation Map",
    stat: "Northern Virginia concentrates ~4+ GW of hyperscale load, requiring multi-billion-dollar 500kV transmission upgrades billed across regional ratepayers.",
    coldOpen: "Stand along Loudoun County's transmission corridor in Northern Virginia and count the windowless concrete halls. Roughly seventy percent of global internet traffic passes through this county, and local families are getting the grid upgrade bill.",
    lut: "editorial-warm",
    motif: "transformer-waitlist-and-smelter-funnel",
    setPieces: ["sp-ep24-loudoun-substation-corridor-walk", "sp-ep24-diesel-backup-generator-row-test", "sp-ep24-residential-ratepayer-transmission-bill"],
    bridge: "Who actually votes the shares of those utilities and tech giants? Three passive index managers holding twenty percent of the S&P 500.",
  },
  {
    ep: 25,
    winningTitle: "How Passive Index Funds Lock Up Voting",
    backupTitle: "Why 3 Index Giants Vote 20% of S&P 500",
    thumb: ["3 VOTERS", "INDEX LOCK"],
    strategyId: "STR-HMW-PRIMER",
    stakes: "valuation",
    clockedOk: false,
    fieldOk: false,
    artifact: "SEC Form 13F & N-PX Proxy Voting Filings (BlackRock, Vanguard, State Street)",
    stat: "Passive vehicles surpassed active AUM while inelastic-market multipliers amplify every retirement auto-contribution.",
    coldOpen: "Every two weeks, millions of 401(k) paychecks buy the exact same index funds regardless of price. That quiet plumbing concentrated roughly twenty percent of S&P 500 corporate voting power inside three asset managers.",
    lut: "archival-parchment",
    motif: "sovereign-spread-caliper-and-orderbook",
    setPieces: ["sp-ep25-big-three-proxy-vote-funnel", "sp-ep25-inelastic-market-multiplier-spring", "sp-ep25-s-and-p-inclusion-liquidity-wave"],
    bridge: "Automated order books can vanish in minutes when liquidity reverses: reconstruct the 36-minute 2010 trillion-dollar Flash Crash.",
  },
  {
    ep: 26,
    winningTitle: "36 Minutes: The 2010 Trillion Flash Crash",
    backupTitle: "When Algorithms Wiped $1T in 36 Minutes",
    thumb: ["$1T VANISHED", "36 MINUTES"],
    strategyId: "STR-AIC-CLOCKED",
    stakes: "valuation",
    clockedOk: true,
    fieldOk: false,
    artifact: "CFTC-SEC May 6, 2010 Millisecond Audit Trail Report (2:32 p.m. - 3:08 p.m. EDT)",
    stat: "A $4.1B E-mini sell algorithm triggered HFT hot-potato volume, executing blue-chip Accenture shares at one penny inside 36 minutes.",
    coldOpen: "At 2:32 p.m. Eastern on May 6, 2010, a mutual fund desk launched one automated sell program without a price floor. Thirteen minutes later, a trillion dollars in US stock value vanished as blue-chip shares traded for a single penny.",
    lut: "verdict-high-contrast",
    motif: "split-century-archival-chronometer",
    setPieces: ["sp-ep26-e-mini-spoofing-orderbook-avalanche", "sp-ep26-hot-potato-hft-liquidity-vanish", "sp-ep26-stub-quote-one-penny-execution"],
    bridge: "Off-exchange shadow routing now runs physical oil too: how does a 600-ship dark tanker fleet bypass Western maritime insurance?",
  },
  {
    ep: 27,
    winningTitle: "Russia's 600-Ship Shadow Oil Tanker Map",
    backupTitle: "How 600 Ageing Tankers Bypass Sanctions",
    thumb: ["DARK FLEET", "600 TANKERS"],
    strategyId: "STR-FISHER-ARTIFACT",
    stakes: "geopolitical",
    clockedOk: false,
    fieldOk: false,
    artifact: "KSE / Lloyd's List Shadow Tanker Registry & Danish Straits Uninsured AIS Track Log",
    stat: "600+ ageing shadow tankers move sanctioned crude outside G7 P&I club insurance using ship-to-ship transfers.",
    coldOpen: "Check this satellite AIS track off Greece and the Danish Straits. Two twenty-year-old oil tankers turn off their transponders, lash their hulls together at sea, and pump millions of barrels outside Western maritime insurance.",
    lut: "subsea-sodium",
    motif: "bathymetry-trench-and-anchor-sever",
    setPieces: ["sp-ep27-ais-dark-ship-to-ship-transfer", "sp-ep27-g7-price-cap-attestation-loophole", "sp-ep27-danish-straits-uninsured-hull-risk"],
    bridge: "Nuclear power promised clean domestic independence for AI data centers, yet enriched uranium enrichment hit its own geopolitical choke.",
  },
  {
    ep: 28,
    winningTitle: "Why Enriched Uranium Hitting a Wall?",
    backupTitle: "The Nuclear Fuel Bottleneck Behind AI",
    thumb: ["NO FUEL", "URANIUM GAP"],
    strategyId: "STR-AOTP-LADDER",
    stakes: "geopolitical",
    clockedOk: false,
    fieldOk: false,
    artifact: "US EIA Uranium Marketing Annual Report & DOE HALEU 19.75% Enrichment Ledger",
    stat: "Russia's Rosatom held ~44% of global uranium enrichment capacity while next-gen SMRs lack commercial domestic HALEU supply.",
    coldOpen: "Tech giants signed nuclear reactor deals to power twenty-four-seven AI clusters, assuming fuel was abundant. Uranium ore in the ground is common, yet turning it into reactor fuel requires gas centrifuge cascades America stopped building decades ago.",
    lut: "blueprint-cyanotype",
    motif: "wafer-lithography-and-euv-killswitch",
    setPieces: ["sp-ep28-gas-centrifuge-swu-cascade-ladder", "sp-ep28-haleu-19p75pct-smr-fuel-gap", "sp-ep28-megatons-to-megawatts-depletion"],
    bridge: "At checkout counters back home, another unrecorded ledger hides household strain: Buy-Now-Pay-Later phantom debt.",
  },
  {
    ep: 29,
    winningTitle: "How Buy-Now-Pay-Later Hides Consumer Debt",
    backupTitle: "America's Unreported BNPL Debt Stack",
    thumb: ["PHANTOM DEBT", "4 PAYMENTS"],
    strategyId: "STR-BOYLE-CHAPTERED",
    stakes: "wallet",
    clockedOk: false,
    fieldOk: false,
    artifact: "CFPB Buy-Now-Pay-Later Borrower Stacked-Loan Survey & Affirm/Klarna ABS Filings",
    stat: ">60% of BNPL borrowers hold multiple simultaneous installment plans largely invisible to traditional FICO credit files.",
    coldOpen: "Split a grocery order into four interest-free installments on your phone, and traditional credit bureaus barely see the loan. Millions of households are stacking multiple invisible checkout plans at once.",
    lut: "midnight-desk",
    motif: "pik-toggle-valve-and-snowball",
    setPieces: ["sp-ep29-phantom-four-installment-stack", "sp-ep29-credit-bureau-blindspot-ledger", "sp-ep29-merchant-discount-fee-squeeze"],
    bridge: "Put all twenty-nine pieces on one table: across history, governments only have four ways out of a sovereign debt wall.",
  },
  {
    ep: 30,
    winningTitle: "The 2035 Sovereign Debt Endgame Matrix",
    backupTitle: "Only 4 Ways Washington Pays $40T Debt",
    thumb: ["FOUR EXITS", "2035 ENDGAME"],
    strategyId: "STR-GEN-EXPLAINER",
    stakes: "wallet",
    clockedOk: false,
    fieldOk: false,
    artifact: "IMF Historical Public Debt Reduction Dataset (1945 Financial Repression vs 2035 CBO Baseline)",
    stat: "Across two centuries of sovereign debt peaks, governments resolve >120% debt-to-GDP exclusively via growth, austerity, default, or financial repression.",
    coldOpen: "Across two hundred years of financial history, every superpower trapped above one hundred twenty percent debt-to-GDP faced the same four doors: outgrow it, cut spending, default, or cap interest rates below inflation.",
    lut: "kodak-2383-print",
    motif: "rollover-conveyor-and-treasury-scale",
    setPieces: ["sp-ep30-four-endgame-levers-master-board", "sp-ep30-financial-repression-real-yield-clamp", "sp-ep30-household-real-asset-shield-ledger", "sp-ep30-season-one-callback-synthesis-wall"],
    bridge: "Season 2 opens where financial repression meets global currency blocs: what replaces the petrodollar settlement system?",
  },
];

function expandSeedsToDossiers(
  seeds: readonly ExpansionSeed[]
): readonly SeasonEpisodeDossier[] {
  const out: SeasonEpisodeDossier[] = [];
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    const epStr = s.ep < 10 ? "0" + String(s.ep) : String(s.ep);
    const preset = STRATEGY_PRESETS[s.strategyId];
    const forbidden: NarrativeEngine[] = [];
    for (let f = 0; f < preset.defaultForbiddenEngines.length; f++) {
      const eng = preset.defaultForbiddenEngines[f];
      if (eng === "clocked" && s.clockedOk) {
        continue;
      }
      if (eng === "field" && s.fieldOk) {
        continue;
      }
      forbidden.push(eng);
    }
    if (!s.clockedOk && forbidden.indexOf("clocked") === -1) {
      forbidden.push("clocked");
    }
    if (!s.fieldOk && forbidden.indexOf("street") === -1) {
      forbidden.push("street");
    }

    out.push(
      SeasonEpisodeDossierSchema.parse({
        episodeNumber: s.ep,
        episodeCode: "S01E" + epStr,
        tier: "season-expansion",
        winningTitle: s.winningTitle,
        backupTitle: s.backupTitle,
        thumbnailTextPair: s.thumb,
        strategyId: s.strategyId,
        forbiddenEngines: forbidden,
        stakes: s.stakes,
        hasDatedHourTimeline: s.clockedOk,
        primaryArtifacts: [s.artifact],
        keyVerifiedStats: [s.stat],
        coldOpenVerbatim: s.coldOpen,
        signatureSetPieces: s.setPieces,
        recommendedLutId: s.lut,
        recommendedMotif: s.motif,
        closingBridgeNextQuestion: s.bridge,
      })
    );
  }
  return out;
}

export const SEASON_01_ROADMAP: readonly SeasonEpisodeDossier[] = [
  ...EPISODES_01_TO_06,
  ...EPISODES_07_TO_11,
  ...expandSeedsToDossiers(EXPANSION_SEEDS_12_TO_20),
  ...expandSeedsToDossiers(EXPANSION_SEEDS_21_TO_30),
];

export function getSeasonEpisodeDossier(
  episodeNumber: number
): SeasonEpisodeDossier | undefined {
  for (let i = 0; i < SEASON_01_ROADMAP.length; i++) {
    if (SEASON_01_ROADMAP[i].episodeNumber === episodeNumber) {
      return SEASON_01_ROADMAP[i];
    }
  }
  return undefined;
}

/**
 * Returns Episode 01 + verified Season 1 Episodes 02–11 (`11` flagship dossiers).
 */
export function getVerifiedCoreSeasonEpisodes(): readonly SeasonEpisodeDossier[] {
  return SEASON_01_ROADMAP.filter((ep) => ep.episodeNumber <= 11);
}

/**
 * Immutably overrides or appends an episode dossier in a season roadmap list.
 */
export function registerSeasonEpisodeOverride(
  roadmap: readonly SeasonEpisodeDossier[],
  dossier: SeasonEpisodeDossier
): readonly SeasonEpisodeDossier[] {
  const validated = SeasonEpisodeDossierSchema.parse(dossier);
  const next: SeasonEpisodeDossier[] = [];
  let replaced = false;
  for (let i = 0; i < roadmap.length; i++) {
    if (roadmap[i].episodeNumber === validated.episodeNumber) {
      next.push(validated);
      replaced = true;
    } else {
      next.push(roadmap[i]);
    }
  }
  if (!replaced) {
    next.push(validated);
  }
  next.sort((a, b) => a.episodeNumber - b.episodeNumber);
  return next;
}

/**
 * Builds a ready-to-evaluate `ContinuityEngine` for any Season 1 episode:
 * returns the full 4-entity flagship graph for Episode 01, or constructs a
 * declarative primary-artifact + set-piece callback graph for Episodes 02–30.
 */
export function createEpisodeContinuityScaffold(
  episodeNumber: number
): ContinuityEngine {
  if (episodeNumber === 1) {
    return createEpisode01ContinuityEngine();
  }
  const dossier = getSeasonEpisodeDossier(episodeNumber);
  if (!dossier) {
    throw new Error(
      `createEpisodeContinuityScaffold: Episode ${episodeNumber} not found in SEASON_01_ROADMAP`
    );
  }

  const preset = STRATEGY_PRESETS[dossier.strategyId];
  const primaryReg = preset.preferredRegisters[0] ?? "archival-light-table";
  const secondaryReg = preset.preferredRegisters[1] ?? "milk-page-editorial";

  const primaryArtifactEntity = defineContinuityEntity({
    entityId: `ENT_${dossier.episodeCode}_PRIMARY_ARTIFACT`,
    episodeNumber: dossier.episodeNumber,
    name: `${dossier.episodeCode} Primary Source Platen`,
    kind: "sovereign-ledger",
    geometryLock: {
      geometryLockId: `${dossier.episodeCode.toLowerCase()}-artifact-platen-v1`,
      aspectRatio: "16:9",
      architecturalSeed: dossier.episodeNumber * 1009,
      preservedAnchors: [
        "primary-filing-header",
        "key-metric-callout-row",
        "source-provenance-footer",
      ],
      layoutColumns: ["left-filing-62pct", "right-telemetry-38pct"],
      invariantRule:
        "Preserve identical document header and row geometry from cold-open plant through final verdict callback.",
    },
    enforceMonotonicStamps: true,
  })
    .addStage({
      stageId: "cold-open-artifact-plant",
      phase: "plant",
      triggerFrac: 0.01,
      paragraphRef: "P01",
      sequenceRef: "SEQ-01",
      eraLabel: "Cold Open Exhibit",
      headlineStatus: dossier.winningTitle,
      dockZone: "none",
      archetypeId: "ARCH-01",
      colors: {
        surfaceHex: "#FAF8F3",
        inkHex: "#1C2B3A",
        accentHex: "#2F8F8B",
        warningHex: "#A3402E",
        registerId: primaryReg,
        lutHint: dossier.recommendedLutId,
      },
      numericMetrics: { exhibitStage: 1 },
      displayFields: {
        primaryArtifact: dossier.primaryArtifacts[0],
        headlineStat: dossier.keyVerifiedStats[0],
      },
      callbackTokens: [`${dossier.episodeCode.toLowerCase()}-cold-open-plant`],
      notes: "Plants verified primary filing/map inside the first 15 seconds.",
    })
    .addStage({
      stageId: "mid-act-stress-mutation",
      phase: "mutate",
      triggerFrac: 0.52,
      paragraphRef: "P24",
      sequenceRef: "SEQ-20",
      eraLabel: "Mechanism Stress-Test",
      headlineStatus: dossier.signatureSetPieces[0],
      dockZone: "top-right-pin",
      archetypeId: "ARCH-04",
      colors: {
        surfaceHex: "#152231",
        inkHex: "#FAF8F3",
        accentHex: "#4FB3AE",
        warningHex: "#E27358",
        registerId: secondaryReg,
        lutHint: dossier.recommendedLutId,
      },
      numericMetrics: { exhibitStage: 2 },
      displayFields: {
        primaryArtifact: dossier.primaryArtifacts[0],
        headlineStat: dossier.keyVerifiedStats[0],
      },
      callbackTokens: [`${dossier.episodeCode.toLowerCase()}-mid-act-pin`],
      notes: "Pins exhibit state during mid-film adversary concession & set-piece.",
    })
    .addStage({
      stageId: "verdict-bookend-payoff",
      phase: "payoff",
      triggerFrac: 0.92,
      paragraphRef: "P48",
      sequenceRef: "SEQ-38",
      eraLabel: "Bookend Verdict & Next-Episode Bridge",
      headlineStatus: dossier.closingBridgeNextQuestion,
      dockZone: "none",
      archetypeId: "ARCH-13",
      colors: {
        surfaceHex: "#14161A",
        inkHex: "#FAF8F3",
        accentHex: "#A9C4DE",
        warningHex: "#A3402E",
        registerId: "restraint-vellum",
        lutHint: "verdict-high-contrast",
      },
      numericMetrics: { exhibitStage: 3 },
      displayFields: {
        primaryArtifact: dossier.primaryArtifacts[0],
        headlineStat: dossier.closingBridgeNextQuestion,
      },
      callbackTokens: [`${dossier.episodeCode.toLowerCase()}-verdict-bridge`],
      notes: "Closes primary artifact arc and plants the unresolved next-video question.",
    })
    .build();

  return new ContinuityEngine(dossier.episodeNumber, [primaryArtifactEntity]);
}

export interface SeasonRoadmapAuditReport {
  readonly valid: boolean;
  readonly episodeCount: number;
  readonly uniqueShowstopperCount: number;
  readonly strategyDistribution: Readonly<Record<StrategyPresetId, number>>;
  readonly violations: readonly string[];
}

/**
 * Audits all 30 episodes in `roadmap` for packaging hygiene (zero "Part 2" labels),
 * R43–R47 guardrail alignment, and 100% globally unique showstopper set-pieces.
 */
export function auditSeasonRoadmap(
  roadmap: readonly SeasonEpisodeDossier[] = SEASON_01_ROADMAP
): SeasonRoadmapAuditReport {
  const violations: string[] = [];
  const seenShowstoppers = new Set<string>();
  const strategyDistribution: Record<StrategyPresetId, number> = {
    "STR-GEN-EXPLAINER": 0,
    "STR-AIC-CLOCKED": 0,
    "STR-AIC-SPECULATIVE": 0,
    "STR-FISHER-ARTIFACT": 0,
    "STR-MAX-ESSAY": 0,
    "STR-AOTP-LADDER": 0,
    "STR-BOYLE-CHAPTERED": 0,
    "STR-HMW-PRIMER": 0,
    "STR-GEN-FIELD": 0,
  };

  for (let i = 0; i < roadmap.length; i++) {
    const ep = roadmap[i];
    strategyDistribution[ep.strategyId] =
      (strategyDistribution[ep.strategyId] ?? 0) + 1;

    if (/\bpart\s*[2-9]\b/i.test(ep.winningTitle) || /\bpart\s*[2-9]\b/i.test(ep.backupTitle)) {
      violations.push(
        `${ep.episodeCode}: Title contains forbidden "Part N" label ("${ep.winningTitle}").`
      );
    }
    if (ep.forbiddenEngines.length === 0) {
      violations.push(`${ep.episodeCode}: R43 violation — empty forbiddenEngines.`);
    }
    if (!ep.hasDatedHourTimeline && ep.forbiddenEngines.indexOf("clocked") === -1) {
      violations.push(
        `${ep.episodeCode}: R44 violation — lacks hour timeline yet does not forbid "clocked".`
      );
    }
    for (let j = 0; j < ep.signatureSetPieces.length; j++) {
      const sp = ep.signatureSetPieces[j];
      if (seenShowstoppers.has(sp)) {
        violations.push(
          `${ep.episodeCode}: Duplicate showstopper "${sp}" across season roadmap.`
        );
      }
      seenShowstoppers.add(sp);
    }
  }

  return {
    valid: violations.length === 0,
    episodeCount: roadmap.length,
    uniqueShowstopperCount: seenShowstoppers.size,
    strategyDistribution,
    violations,
  };
}
