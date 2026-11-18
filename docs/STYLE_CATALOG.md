# Style Worlds & Composable Creative Inventory

`studio/src/styles/index.ts` unifies **162 renderable style recipes** across **10 named Style Worlds**. `studio/src/registry/catalog.ts` indexes **1,451 unique addressable creative elements** across 15 typed element kinds, alongside **434 motion alias tokens** (`661` total resolvable motion tokens when combined with canonical self-tokens).

Every original commit `534d89a` style ID from `studio/src/director/planner.ts` (`24` legacy IDs) resolves directly through `STYLE_RECIPE_BY_ID`, `resolveStyleRecipe()`, and `renderStyleRecipe()`.

---

## 1. Verified Inventory Counts (`getCatalogSummary()` & `verifyCatalogIntegrity()`)

| Pillar / Catalog `kind` | Source Module | Blueprint Minimum | Actual Count | Notes |
|---|---|---:|---:|---|
| `motion-primitive` | `studio/src/motion/primitives.ts` | `216` | **234** | 58 entries, 42 exits, 98 in-place loops, 36 camera/physics moves |
| *(Motion Aliases)* | `studio/src/motion/primitives.ts` | — | **434** | Tracked outside `CREATIVE_CATALOG` (`661` total resolvable tokens) |
| `style-recipe` | `studio/src/styles/index.ts` | `120` | **162** | Spanning 10 Style Worlds; includes all 24 legacy `534d89a` IDs |
| `prop-contraption` | `studio/src/registry/props/index.tsx` | `520` | **545** | 25 bespoke hero contraptions + 520 parametric domain blueprints |
| `geo-country` | `studio/src/maps/index.ts` | `195` | **211** | Offline NaturalEarth / ISO numeric, alpha-2, and alpha-3 polygons |
| `geo-us-state` | `studio/src/maps/index.ts` | `50` | **51** | 50 U.S. states + District of Columbia (`us-atlas` FIPS geometry) |
| `geo-corridor` | `studio/src/maps/index.ts` | `24` | **24** | Chokepoint, grid, subsea cable, and sovereign flow corridors |
| `sfx-cue` | `studio/src/audio/soundRegistry.ts` | `96` | **96** | 8 acoustic families x 12 procedural foley WAV cues (`72ms` guard) |
| `music-stem` | `studio/src/audio/soundRegistry.ts` | `12` | **12** | Loopable 60 BPM documentary score stems with speech ducking |
| `color-lut` | `studio/src/audio/soundRegistry.ts` | `12` | **12** | 17³ `.cube` 3D LUTs paired to optical substrate registers |
| `typography-mode` | `studio/src/typography/KineticText.tsx` | `32` | **32** | Whisper word-level prosody-synced kinetic & stenography modes |
| `glass-stage` | `studio/src/components/glass/LiquidGlassPresets.tsx` | `18` | **18** | Smoked-navy Apple Liquid Glass presets in presenter-safe zones |
| `depth-stage` | `studio/src/components/glass/PresenterDepthStage.tsx` | `8` | **8** | 5-plane presenter matte occlusion depth-sandwich presets |
| `color-register` | `studio/src/design/tokens.ts` | `5` | **6** | 5 WCAG AAA (`>= 7.0:1`) page substrates + `over_footage` glass |
| `camera-trajectory` | `studio/src/design/optics.tsx` + `equalizer/viterbiChoreographer.ts` | `12` | **16** | 9 2.5D stage optical moves + 7 Viterbi choreographer trajectories |
| `set-piece` | `studio/src/generative/presetSetPieces.ts` | `24` | **24** | Declarative `SP01`–`SP24` spatial-solver & 2D physics contraptions |
| **Total Unique Elements** | `studio/src/registry/catalog.ts` | **`1,380`** | **`1,451`** | Zero duplicate `(kind, id)` keys verified at runtime |

### Domain Tag Distribution (`countsByDomain`)

Entries carry one or more of the 9 canonical semantic domain tags:
`geopolitics` (**495**), `fiscal` (**413**), `legal` (**276**), `household` (**259**), `ai-compute` (**223**), `history` (**204**), `energy-grid` (**191**), `labor` (**167**), and `comedy-gag` (**42**).

---

## 2. The 10 Style Worlds (`STYLE_WORLDS`)

| # | Style World ID | Recipes | Default Substrate | Primary Module | Purpose |
|---|---|---:|---|---|---|
| 1 | `liquid-glass` | **19** | `over_footage` | `components/glass/LiquidGlassPresets.tsx` | Smoked-navy optical glass cards, docks, magnifiers, and ProRes 4444 overlays |
| 2 | `doc-broadcast` | **14** | `page_editorial` | `styles/docBroadcast.tsx` | Broadcast lower-thirds, contact light tables, telestrators, and kinetic statements |
| 3 | `vintage-editorial` | **10** | `archival_parchment` | `styles/vintageEditorial.tsx` | 1912–1971 nitrate newsreels, silent intertitles, cotton ledgers, and microfiche |
| 4 | `macro-telemetry` | **23** | `midnight_telemetry` | `styles/macroTelemetry.tsx` | Quantitative jaws, FCF waterfalls, maturity walls, pyramids, and ticker monoliths |
| 5 | `forensic-exhibits` | **25** | `archival_parchment` | `styles/forensicExhibits.tsx` | SEC 10-K footnotes, Supreme Court syllabi, Form 941 splits, and Treasury Table 9 |
| 6 | `diagram-metaphor` | **6** | `page_editorial` | `styles/diagramMetaphor.tsx` | Assembly manuals, patent exploded views, isometric grids, and articulated figures |
| 7 | `data-maps-3d` | **7** | `page_editorial` | `styles/dataMaps3D.tsx` | Offline D3 world/state cartography, transit arcs, and isometric 3D strata |
| 8 | `system-simulators` | **26** | `drafting_blueprint` | `styles/systemSimulators.tsx` | Tax-plumbing guillotines, hydraulic spillways, SPV loops, and 60Hz droop governors |
| 9 | `ui-satire-collage` | **24** | `page_editorial` | `styles/uiSatireAndCollage.tsx` | Longitudinal household dossiers, scrip wallets, thermal rolls, and DTI modals |
| 10 | `generative-setpiece` | **8** | `page_editorial` | `generative/SceneBlueprintRenderer.tsx` | Physics-solved BOM vaporizers, torque scales, 3D dioramas, and depth sandwiches |

---

## 3. Complete 162 Style Recipe ID Reference

### World 1: `liquid-glass` (`19` Recipes)

| Recipe ID | Component | Mode | Legacy / Aliases |
|---|---|---|---|
| `liquid-glass-card` | `GlassCard` | `over-footage` | **Legacy 24**, `card`, `LiquidGlassObject:card` |
| `liquid-glass-corner-pill` | `GlassCornerPill` | `over-footage` | `corner-pill`, `liquid-glass-pill`, `pill` |
| `liquid-glass-dock` | `GlassBottomDock` | `over-footage` | **Legacy 24**, `bottom-dock`, `liquid-glass-bottom-dock`, `dock` |
| `liquid-glass-floating-toolbar` | `GlassFloatingToolbar` | `over-footage` | `floating-toolbar` |
| `liquid-glass-toast` | `GlassToastAlert` | `over-footage` | **Legacy 24**, `toast-alert`, `liquid-glass-toast-alert`, `toast` |
| `liquid-glass-split-modal` | `GlassSplitModal` | `over-footage` | `split-modal`, `LiquidGlassObject:split-modal` |
| `liquid-glass-dossier-stack` | `GlassDossierStack` | `over-footage` | `dossier-stack` |
| `liquid-glass-evidence-rail` | `GlassEvidenceRail` | `over-footage` | `evidence-rail` |
| `liquid-glass-magnifier-card` | `GlassMagnifierCard` | `over-footage` | `magnifier-card`, `liquid-glass-footnote-loupe` |
| `liquid-glass-telemetry-strip` | `GlassTelemetryStrip` | `over-footage` | `telemetry-strip`, `liquid-glass-ledger-ribbon` |
| `liquid-glass-verdict-seal` | `GlassVerdictSeal` | `over-footage` | `verdict-seal` |
| `liquid-glass-compare-scale` | `GlassCompareScale` | `over-footage` | `compare-scale` |
| `liquid-glass-timeline-scrubber` | `GlassTimelineScrubber` | `over-footage` | `timeline-scrubber` |
| `liquid-glass-receipt-ticker` | `GlassReceiptTicker` | `over-footage` | `receipt-ticker` |
| `liquid-glass-terminal-console` | `GlassTerminalConsole` | `over-footage` | `terminal-console`, `doc-bloomberg-terminal-clean` |
| `liquid-glass-map-callout` | `GlassMapCallout` | `over-footage` | `map-callout` |
| `liquid-glass-stat-triptych` | `GlassStatTriptych` | `over-footage` | `stat-triptych`, `liquid-glass-metric-triptych` |
| `liquid-glass-quote-citation` | `GlassQuoteCitation` | `over-footage` | `quote-citation` |
| `liquid-glass-treasury-overlay` | `TreasuryOverlayCard` | `over-footage` | `treasury-overlay-card`, `TreasuryTable9-Overlay` |

### World 2: `doc-broadcast` (`14` Recipes)

| Recipe ID | Component | Mode | Legacy / Aliases |
|---|---|---|---|
| `doc-news-package` | `NewsPackageLowerThird` | `over-footage` | **Legacy 24** |
| `doc-caption-news` | `CaptionNewsCard` | `over-footage` | **Legacy 24** |
| `doc-visual-investigation` | `VisualInvestigationBoard` | `page` | **Legacy 24** |
| `doc-archive-light-table` | `ArchiveLightTable` | `page` | **Legacy 24**, `archive-lighttable` |
| `doc-live-countdown-split` | `LiveCountdownSplit` | `page` | **Legacy 24** |
| `doc-telestrator` | `TelestratorOverlay` | `over-footage` | **Legacy 24** |
| `doc-kino-montage` | `KinoMontageStrip` | `page` | **Legacy 24** |
| `doc-city-symphony` | `CitySymphonyFrame` | `over-footage` | **Legacy 24** |
| `doc-split-screen-frame` | `SplitScreenFrame` | `page` | `doc-split-fact-check` |
| `doc-quote-highlight` | `QuoteHighlightCard` | `page` | `QuoteHighlightCard` |
| `doc-data-callout-lower-third` | `DataCalloutLowerThird` | `over-footage` | `DataCalloutLowerThird` |
| `doc-breaking-banner` | `BreakingBanner` | `over-footage` | `BreakingBanner` |
| `doc-kinetic-statement` | `KineticText` | `page` | `kinetic-statement`, `kinetic-thesis` |
| `doc-chapter-headline-card` | `EditorialHeadline` | `page` | `chapter-headline-card` |

### World 3: `vintage-editorial` (`10` Recipes)

| Recipe ID | Component | Mode | Legacy / Aliases |
|---|---|---|---|
| `vintage-newsreel` | `Newsreel1920s` | `page` | **Legacy 24** |
| `vintage-silent-film` | `SilentFilmCard` | `page` | **Legacy 24** |
| `vintage-collage` | `CollageCutout` | `over-footage` | **Legacy 24** |
| `vintage-spy-titles` | `SpyTitleSequence` | `page` | **Legacy 24** |
| `vintage-stained-glass` | `StainedGlassFrame` | `page` | **Legacy 24** |
| `vintage-1930s-depression-ledger` | `DepressionLedger1930s` | `page` | `DepressionLedger1930s` |
| `vintage-company-scrip-voucher` | `CompanyScripVoucher` | `page` | `CompanyScripVoucher` |
| `vintage-bretton-woods-cable` | `BrettonWoodsCable` | `page` | `BrettonWoodsCable` |
| `vintage-broadsheet-frontpage` | `BroadsheetFrontpage` | `page` | `BroadsheetFrontpage` |
| `vintage-microfiche-reader` | `MicroficheReaderStage` | `page` | `MicroficheReaderStage` |

### World 4: `macro-telemetry` (`23` Recipes)

| Recipe ID | Component | Mode |
|---|---|---|
| `macro-diverging-jaws` | `DivergingJawsChart` | `page` |
| `macro-negative-fcf-waterfall` | `NegativeFcfWaterfall` | `page` |
| `macro-wealth-decile-monoliths` | `WealthDecileMonoliths` | `page` |
| `macro-auction-price-shockwave` | `AuctionPriceShockwave` | `page` |
| `macro-jevons-deflation-curve` | `JevonsDeflationCurve` | `page` |
| `macro-sovereign-spread-flip` | `SovereignSpreadFlip` | `page` |
| `macro-debt-deflation-jaws-1933` | `DebtDeflationJaws1933` | `page` |
| `macro-gold-vs-fiat-corridor` | `GoldVsFiatFedCorridor` | `page` |
| `macro-generational-horizon-rule` | `GenerationalHorizonRule` | `page` |
| `macro-stacked-share-shift` | `StackedShareShift` | `page` |
| `macro-capex-vs-depreciation-gap` | `CapexVsDepreciationGap` | `page` |
| `macro-foreign-holder-rollover` | `ForeignHolderRollover` | `page` |
| `macro-reserve-attestation-bar` | `ReserveAttestationBar` | `page` |
| `macro-trust-fund-depletion-curve` | `TrustFundDepletionCurve` | `page` |
| `macro-demographic-cliff-pyramid` | `DemographicCliffPyramid` | `page` |
| `macro-cost-exchange-ratio-bar` | `CostExchangeRatioBar` | `page` |
| `macro-bandwidth-concentration-bar` | `BandwidthConcentrationBar` | `page` |
| `macro-escrow-shock-breakdown` | `EscrowShockBreakdown` | `page` |
| `macro-mineral-refining-dominance` | `MineralRefiningDominance` | `page` |
| `macro-waitlist-queue-histogram` | `WaitlistQueueHistogram` | `page` |
| `macro-real-vs-nominal-shrink` | `RealVsNominalShrink` | `page` |
| `macro-margin-bid-comparison` | `MarginBidComparison` | `page` |
| `macro-data-ticker-monolith` | `DataTicker` | `page` |

### World 5: `forensic-exhibits` (`25` Recipes)

| Recipe ID | Component | Mode | Legacy / Aliases |
|---|---|---|---|
| `forensic-fiscal-ledger-table` | `FiscalLedgerTableStage` | `page` | `FiscalLedgerTableStage` |
| `forensic-claim-vs-reality-collision` | `ClaimVsRealityCollision` | `page` | `ClaimVsRealityCollision` |
| `forensic-supreme-court-syllabus` | `SupremeCourtSyllabusStage` | `page` | `SupremeCourtSyllabusStage` |
| `forensic-escape-hatch-switchboard` | `EscapeHatchSwitchboard` | `page` | `EscapeHatchSwitchboard` |
| `forensic-archival-ration-book-1941` | `ArchivalRationBook1941` | `page` | `vintage-1941-ration-booklet` |
| `forensic-foia-redaction-declassify` | `FoiaRedactionDeclassify` | `page` | `FoiaRedactionDeclassify` |
| `forensic-sec-10k-footnote-stretch` | `Sec10KFootnoteStretch` | `page` | `Sec10KFootnoteStretch` |
| `forensic-bdc-pik-schedule` | `BdcPikScheduleExhibit` | `page` | `BdcPikScheduleExhibit` |
| `forensic-statutory-clause-highlighter` | `StatutoryClauseHighlighter` | `page` | `StatutoryClauseHighlighter` |
| `forensic-insurance-rate-hike-notice` | `InsuranceRateHikeNotice` | `page` | `InsuranceRateHikeNotice` |
| `forensic-irs-form-941-fica-split` | `IrsForm941FicaSplit` | `page` | `IrsForm941FicaSplit` |
| `forensic-subsea-sabotage-incident-log` | `SubseaSabotageIncidentLog` | `page` | `SubseaSabotageIncidentLog` |
| `forensic-congressional-hearing-slate` | `CongressionalHearingSlate` | `page` | `CongressionalHearingSlate` |
| `forensic-treasury-tic-ledger` | `TreasuryTicLedgerExhibit` | `page` | `TreasuryTicLedgerExhibit` |
| `forensic-spv-circular-flow` | `SpvCircularFlowSheet` | `page` | `SpvCircularFlowSheet` |
| `forensic-fannie-mae-covenant` | `FannieMaeCovenantExhibit` | `page` | `FannieMaeCovenantExhibit` |
| `forensic-redline-contract-diff` | `RedlineContractDiffStage` | `page` | `RedlineContractDiffStage` |
| `forensic-patent-filing-1910` | `PatentFiling1910Stage` | `page` | `PatentFiling1910Stage` |
| `forensic-bank-call-report-t-account` | `BankCallReportTAccount` | `page` | `BankCallReportTAccount` |
| `forensic-veto-pen-budget-ledger` | `VetoPenBudgetLedger` | `page` | `VetoPenBudgetLedger` |
| `forensic-ach-autopay-draft-receipt` | `AchAutopayDraftReceipt` | `page` | `AchAutopayDraftReceipt` |
| `forensic-credit-rating-downgrade-memo` | `CreditRatingDowngradeMemo` | `page` | `CreditRatingDowngradeMemo` |
| `forensic-antitrust-market-exhibit` | `AntitrustMarketExhibit` | `page` | `AntitrustMarketExhibit` |
| `forensic-evidence-corkboard-chronology` | `EvidenceCorkboardChronology` | `page` | `EvidenceCorkboardChronology` |
| `forensic-treasury-table-9` | `TreasuryTable9Scene` | `page` | `treasury-table-9`, `TreasuryTable9-Full`, `dataviz` |

### World 6: `diagram-metaphor` (`6` Recipes)

| Recipe ID | Component | Mode | Legacy / Aliases |
|---|---|---|---|
| `diagram-sticker` | `StickerCutout` | `over-footage` | **Legacy 24**, `sticker-cutout` |
| `diagram-stick-figure` | `StickFigureStage` | `page` | **Legacy 24**, `stick-figure-stage`, `stick-explainer` |
| `diagram-instruction-manual` | `InstructionManualCard` | `page` | **Legacy 24**, `instruction-manual-card`, `instruction-manual` |
| `diagram-collage-cutout` | `DiagramCollageCutout` | `over-footage` | `collage-cutout` |
| `diagram-isometric` | `IsometricScene` | `page` | **Legacy 24**, `isometric-scene`, `isometric-picture-book` |
| `patent-exploded-diagram` | `PatentExplodedDiagram` | `page` | `diagram-patent-exploded` |

### World 7: `data-maps-3d` (`7` Recipes)

| Recipe ID | Component | Mode | Legacy / Aliases |
|---|---|---|---|
| `data-map-explainer` | `MapExplainer` | `page` | **Legacy 24**, `map-explainer` |
| `data-transit-map` | `MapExplainer` | `page` | `transit-map` |
| `data-physical-card` | `DataPhysicalCard` | `over-footage` | **Legacy 24**, `data-physical` |
| `data-white-model-3d` | `WhiteModel3D` | `over-footage` | **Legacy 24**, `white-model-3d`, `white-model` |
| `data-blob-simulation` | `BlobSimulation` | `over-footage` | **Legacy 24**, `blob-simulation`, `pip-simulation` |
| `corridor-arc-matrix-card` | `CorridorArcMatrixCard` | `page` | `data-corridor-arc-matrix` |
| `isometric-strata-cutaway-3d` | `IsometricStrataCutaway3D` | `page` | `data-isometric-strata-3d` |

### World 8: `system-simulators` (`26` Recipes)

| Recipe ID | Component | Mode | Aliases |
|---|---|---|---|
| `supply-chain-bom-strip` | `SupplyChainBomStrip` | `page` | `SupplyChainBomStrip` |
| `palo-alto-whiteboard-flip` | `PaloAltoWhiteboardFlip` | `page` | `PaloAltoWhiteboardFlip` |
| `dual-tax-plumbing-schematic` | `DualTaxPlumbingSchematic` | `page` | `diagram-hydraulic-plumbing` |
| `sovereign-priority-spillway` | `SovereignPrioritySpillway` | `page` | `SovereignPrioritySpillway` |
| `split-era-strike-diptych` | `SplitEraStrikeDiptych` | `page` | `SplitEraStrikeDiptych` |
| `logarithmic-wattage-ladder` | `LogarithmicWattageLadder` | `page` | `LogarithmicWattageLadder` |
| `velocity-mismatch-chronometer` | `VelocityMismatchChronometer` | `page` | `VelocityMismatchChronometer` |
| `circular-accounting-loop` | `CircularAccountingLoop` | `page` | `CircularAccountingLoop` |
| `asymmetric-exchange-simulator` | `AsymmetricExchangeSimulator` | `page` | `AsymmetricExchangeSimulator` |
| `subsea-cable-cross-section` | `SubseaCableCrossSection` | `page` | `SubseaCableCrossSection` |
| `lithography-node-lock` | `LithographyNodeLock` | `page` | `LithographyNodeLock` |
| `cantilever-balance-scale` | `CantileverBalanceScale` | `page` | `CantileverBalanceScale` |
| `transformer-queue-bottleneck` | `TransformerQueueBottleneck` | `page` | `TransformerQueueBottleneck` |
| `water-cooling-evaporation-tower` | `WaterCoolingEvaporationTower` | `page` | `WaterCoolingEvaporationTower` |
| `container-chokepoint-lock` | `ContainerChokepointLock` | `page` | `ContainerChokepointLock` |
| `strategic-reserve-caverns` | `StrategicReserveCaverns` | `page` | `StrategicReserveCaverns` |
| `grid-frequency-droop-governor` | `GridFrequencyDroopGovernor` | `page` | `GridFrequencyDroopGovernor` |
| `flywheel-momentum-clutch` | `FlywheelMomentumClutch` | `over-footage` | `FlywheelMomentumClutch` |
| `hydraulic-siphon-valve` | `HydraulicSiphonValve` | `over-footage` | `HydraulicSiphonValve` |
| `margin-call-domino-cascade` | `MarginCallDominoCascade` | `page` | `MarginCallDominoCascade` |
| `escapement-ratchet-pawn` | `EscapementRatchetPawn` | `over-footage` | `EscapementRatchetPawn` |
| `eurodollar-offshore-funnel` | `EurodollarOffshoreFunnel` | `page` | `EurodollarOffshoreFunnel` |
| `mineral-refining-bottleneck` | `MineralRefiningBottleneck` | `page` | `MineralRefiningBottleneck` |
| `demographic-dependency-pyramid` | `DemographicDependencyPyramid` | `page` | `DemographicDependencyPyramid` |
| `insurance-risk-pool-overflow` | `InsuranceRiskPoolOverflow` | `page` | `InsuranceRiskPoolOverflow` |
| `municipal-bond-tollgate` | `MunicipalBondTollgate` | `over-footage` | `MunicipalBondTollgate` |

### World 9: `ui-satire-collage` (`24` Recipes)

| Recipe ID | Component | Mode |
|---|---|---|
| `longitudinal-household-dossier` | `LongitudinalHouseholdDossier` | `page` |
| `perishable-seat-vs-compute-split` | `PerishableSeatVsComputeSplit` | `page` |
| `closed-compute-scrip-wallet` | `ClosedComputeScripWallet` | `page` |
| `coal-scrip-vs-digital-yuan` | `CoalScripVsDigitalYuan` | `page` |
| `fountain-pen-veto-slash` | `FountainPenVetoSlash` | `page` |
| `unwritten-truce-to-allowance` | `UnwrittenTruceToAllowance` | `page` |
| `roof-drone-escrow-shock` | `RoofDroneEscrowShock` | `over-footage` |
| `thermal-receipt-inflation-roll` | `ThermalReceiptInflationRoll` | `over-footage` |
| `refinance-denial-modal` | `RefinanceDenialModal` | `over-footage` |
| `hinged-brass-jaw-cutout` | `HingedBrassJawCutout` | `over-footage` |
| `viewer-game-quiz-card` | `ViewerGameQuizCard` | `page` |
| `terms-of-service-scroll-trap` | `TermsOfServiceScrollTrap` | `over-footage` |
| `dynamic-surge-meter-tag` | `DynamicSurgeMeterTag` | `over-footage` |
| `four-escape-hatches-board` | `FourEscapeHatchesBoard` | `page` |
| `subscription-trap-stack` | `SubscriptionTrapStack` | `over-footage` |
| `algorithmic-credit-score-drop` | `AlgorithmicCreditScoreDrop` | `over-footage` |
| `company-town-store-ledger` | `CompanyTownStoreLedger` | `page` |
| `geo-fenced-spend-map-card` | `GeoFencedSpendMapCard` | `over-footage` |
| `expiration-countdown-toast` | `ExpirationCountdownToast` | `over-footage` |
| `automated-cobra-severance-form` | `AutomatedCobraSeveranceForm` | `page` |
| `buy-now-pay-later-micro-ledger` | `BuyNowPayLaterMicroLedger` | `over-footage` |
| `captive-partner-catalog-grid` | `CaptivePartnerCatalogGrid` | `page` |
| `programmable-rule-builder-ui` | `ProgrammableRuleBuilderUI` | `page` |
| `civic-dossier-redaction-plate` | `CivicDossierRedactionPlate` | `page` |

### World 10: `generative-setpiece` (`8` Recipes)

| Recipe ID | Component | Mode | Default Blueprint / Preset |
|---|---|---|---|
| `setpiece-bom-vaporizer` | `SceneBlueprintRenderer` | `page` | `SP01_SHOE_LABOR_VAPORIZER` |
| `setpiece-torque-balance` | `SceneBlueprintRenderer` | `page` | `SP02_PALO_ALTO_WHITEBOARD_FLIP` |
| `setpiece-hydraulic-spillway` | `SceneBlueprintRenderer` | `page` | `SP07_SOVEREIGN_BOND_SPILLWAY` |
| `setpiece-circular-spv-carousel` | `SceneBlueprintRenderer` | `page` | `SP16_NVIDIA_COREWEAVE_SPV_LOOP` |
| `setpiece-wattage-scale-ladder` | `SceneBlueprintRenderer` | `page` | `SP11_10W_TO_5GW_POWER_LADDER` |
| `setpiece-subsea-tension-snap` | `SceneBlueprintRenderer` | `page` | `SP22_550_SUBSEA_CABLE_ANCHOR` |
| `setpiece-isometric-diorama-3d` | `IsometricDiorama3D` | `page` | `DEFAULT_DIORAMA_BLOCKS` |
| `setpiece-presenter-depth-sandwich` | `PresenterDepthStage` | `over-footage` | `behind-shoulder-billboard` |

---

## 4. Query & Composition Examples

### Resolving & Rendering Style Recipes (`studio/src/styles/index.ts`)

```tsx
import {
  getStyleCountsByWorld,
  getStyleRecipeCount,
  renderStyleRecipe,
  resolveStyleRecipe,
  StyleRecipeRenderer,
} from "./styles";

// Resolves canonical IDs, legacy 534d89a IDs, and component hints
const totalStyles = getStyleRecipeCount(); // 162
const countsByWorld = getStyleCountsByWorld();
const legacyResolved = resolveStyleRecipe("diagram-sticker"); // -> StickerCutout recipe

// Direct JSX component or functional helper
const element = renderStyleRecipe("macro-diverging-jaws", {
  eyebrow: "BLS PRODUCTIVITY VS. PAY",
  title: "Output Rose 20.4% While Real Pay Flatlined",
  metric: "-8.2% GAP",
  sourceCitation: "Bureau of Labor Statistics Major Sector Productivity",
});

export const ExampleBeat = () => (
  <StyleRecipeRenderer
    styleId="forensic-irs-form-941-fica-split"
    title="15.3% Human FICA vs. 0% API Compute"
    metric="84.1% SHARE"
  />
);
```

### Searching & Bundling Creative Elements (`studio/src/registry/catalog.ts`)

```ts
import {
  getCatalogSummary,
  recommendBeatBundle,
  searchCatalog,
  verifyCatalogIntegrity,
} from "./registry/catalog";

// 1. Boot-time zero-duplicate & pillar threshold check
const report = verifyCatalogIntegrity(); // ok: true, totalElements: 1451

// 2. Multi-filter semantic search with anti-repetition exclusions
const guillotineMatches = searchCatalog({
  query: "withholding guillotine",
  domain: "fiscal",
  visualWeight: "showstopper",
  excludeIds: ["doc-archive-light-table"],
  limit: 5,
});

// 3. Full multi-pillar beat recommendation (style + motion + prop + audio + LUT + set-piece)
const bundle = recommendBeatBundle({
  query: "PJM grid capacity auction spike",
  spokenText: "Wholesale capacity prices jumped 833 percent in a single summer auction.",
  domain: "energy-grid",
  emotionalBeat: "hard-reveal",
  framing: "page",
  isPeakBeat: true,
});

const summary = getCatalogSummary();
// summary.totalElements === 1451, summary.unifiedMotionAliasMapKeys === 434
```
