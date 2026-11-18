import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import { HighlighterStroke, OpticalLoupe, ReadingRoomStage } from "../design/optics";
import {
  CINEMA_SPRINGS,
  LAYOUT,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  RegisterId,
  REGISTERS,
  resolveRegisterPalette,
} from "../design/tokens";

export type ForensicPaletteMode = "page" | "over-footage";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export interface BaseForensicProps {
  title?: string;
  subtitle?: string;
  docketCode?: string;
  verdictBadge?: string;
  sourceCitation?: string;
  register?: RegisterId;
  paletteMode?: ForensicPaletteMode;
  atFrame?: number;
}

interface ForensicStageFrameProps extends BaseForensicProps {
  defaultTitle: string;
  defaultSubtitle?: string;
  defaultDocket: string;
  defaultVerdict: string;
  defaultCitation: string;
  panVerticalPx?: number;
  children: (ctx: {
    elapsed: number;
    enter: number;
    progress: number;
    isGlass: boolean;
    inkPrimary: string;
    inkSecondary: string;
    inkMuted: string;
    ruleHairline: string;
    ruleOxford: string;
    accentLiability: string;
    accentSolvent: string;
    accentCapital: string;
    accentStatutory: string;
    bgElevated: string;
    bgRecessed: string;
  }) => React.ReactNode;
}

const ForensicStageFrame: React.FC<ForensicStageFrameProps> = ({
  title,
  subtitle,
  docketCode,
  verdictBadge,
  sourceCitation,
  register = "archival_parchment",
  paletteMode = "page",
  atFrame = 0,
  defaultTitle,
  defaultSubtitle,
  defaultDocket,
  defaultVerdict,
  defaultCitation,
  panVerticalPx = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < atFrame) return null;

  const elapsed = frame - atFrame;
  const enter = spring({ frame: elapsed, fps, config: CINEMA_SPRINGS.editorialSnap });
  const progress = interpolate(elapsed, [4, 40], [0, 1], CLAMP);

  const resolvedTitle = title ?? defaultTitle;
  const resolvedSub = subtitle ?? defaultSubtitle;
  const resolvedDocket = docketCode ?? defaultDocket;
  const resolvedVerdict = verdictBadge ?? defaultVerdict;
  const resolvedCite = sourceCitation ?? defaultCitation;

  if (paletteMode === "over-footage") {
    const zone = LAYOUT.overFootageSafeZones.rightThird;
    return (
      <div
        style={{
          position: "absolute",
          left: zone.left,
          top: zone.top,
          width: zone.width,
          height: zone.height,
          background: OVER_FOOTAGE_PALETTE.glassPrimary,
          backdropFilter: "blur(12px) saturate(165%) brightness(0.68)",
          WebkitBackdropFilter: "blur(12px) saturate(165%) brightness(0.68)",
          border: `1.5px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
          borderRadius: "18px",
          padding: "26px 28px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 24px 52px rgba(15, 25, 35, 0.44)",
          opacity: enter,
          transform: `translate3d(${((1 - enter) * 30).toFixed(2)}px, 0, 0)`,
          userSelect: "none",
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, color: OVER_FOOTAGE_PALETTE.accentPrimary, letterSpacing: "0.09em" }}>
              {resolvedDocket}
            </span>
            <span style={{ backgroundColor: OVER_FOOTAGE_PALETTE.brickRedFill, color: OVER_FOOTAGE_PALETTE.textHeadline, fontFamily: FONTS.mono, fontSize: "11.5px", fontWeight: 700, padding: "3px 9px", borderRadius: "4px", ...TABULAR_NUM_STYLE }}>
              {resolvedVerdict}
            </span>
          </div>
          <h2 style={{ margin: "10px 0 0 0", fontFamily: FONTS.serif, fontSize: "25px", lineHeight: 1.18, color: OVER_FOOTAGE_PALETTE.textHeadline }}>
            {resolvedTitle}
          </h2>
          {resolvedSub && (
            <div style={{ marginTop: "5px", fontFamily: FONTS.sans, fontSize: "13.5px", color: OVER_FOOTAGE_PALETTE.textBody, lineHeight: 1.4 }}>
              {resolvedSub}
            </div>
          )}
        </div>

        <div style={{ flex: 1, marginTop: "16px", marginBottom: "14px", overflow: "hidden", position: "relative" }}>
          {children({
            elapsed,
            enter,
            progress,
            isGlass: true,
            inkPrimary: OVER_FOOTAGE_PALETTE.textHeadline,
            inkSecondary: OVER_FOOTAGE_PALETTE.textBody,
            inkMuted: OVER_FOOTAGE_PALETTE.textMuted,
            ruleHairline: OVER_FOOTAGE_PALETTE.glassInnerHairline,
            ruleOxford: OVER_FOOTAGE_PALETTE.accentPrimary,
            accentLiability: OVER_FOOTAGE_PALETTE.brickRedText,
            accentSolvent: OVER_FOOTAGE_PALETTE.chartSecondary,
            accentCapital: OVER_FOOTAGE_PALETTE.accentWarm,
            accentStatutory: OVER_FOOTAGE_PALETTE.accentPrimary,
            bgElevated: OVER_FOOTAGE_PALETTE.glassDarkWell,
            bgRecessed: "rgba(15, 25, 35, 0.62)",
          })}
        </div>

        <div style={{ borderTop: `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`, paddingTop: "10px", fontFamily: FONTS.mono, fontSize: "11px", color: OVER_FOOTAGE_PALETTE.textMuted }}>
          § {resolvedCite}
        </div>
      </div>
    );
  }

  const pal = resolveRegisterPalette(register);
  const panY = interpolate(progress, [0, 1], [0, panVerticalPx], CLAMP);

  return (
    <ReadingRoomStage
      register={pal}
      chapterTitle={resolvedDocket}
      folioLabel={resolvedVerdict}
      sourceCitation={resolvedCite}
      cameraMove="dolly-creep"
    >
      <div
        style={{
          position: "absolute",
          left: LAYOUT.safeMargin,
          right: LAYOUT.safeMargin,
          top: 98,
          bottom: 76,
          display: "flex",
          flexDirection: "column",
          opacity: enter,
          transform: `translate3d(0, ${panY.toFixed(2)}px, 0)`,
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "16px", borderBottom: `2px solid ${pal.rule.oxford}` }}>
          <div style={{ maxWidth: "1260px" }}>
            <h1 style={{ margin: 0, fontFamily: FONTS.serif, fontSize: "42px", fontWeight: 700, lineHeight: 1.12, color: pal.ink.primary }}>
              {resolvedTitle}
            </h1>
            {resolvedSub && (
              <div style={{ marginTop: "6px", fontFamily: FONTS.sans, fontSize: "18px", color: pal.ink.secondary, ...TABULAR_NUM_STYLE }}>
                {resolvedSub}
              </div>
            )}
          </div>
          <div style={{ backgroundColor: pal.bg.elevated, border: `2px solid ${pal.accent.liabilityStroke}`, padding: "8px 18px", borderRadius: "6px", fontFamily: FONTS.mono, fontSize: "18px", fontWeight: 700, color: pal.accent.liability, flexShrink: 0, ...TABULAR_NUM_STYLE }}>
            {resolvedVerdict}
          </div>
        </div>

        <div style={{ flex: 1, marginTop: "20px", position: "relative" }}>
          {children({
            elapsed,
            enter,
            progress,
            isGlass: false,
            inkPrimary: pal.ink.primary,
            inkSecondary: pal.ink.secondary,
            inkMuted: pal.ink.muted,
            ruleHairline: pal.rule.hairline,
            ruleOxford: pal.rule.oxford,
            accentLiability: pal.accent.liability,
            accentSolvent: pal.accent.solvent,
            accentCapital: pal.accent.capital,
            accentStatutory: pal.accent.statutory,
            bgElevated: pal.bg.elevated,
            bgRecessed: pal.bg.recessed,
          })}
        </div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// 1. FiscalLedgerTableStage (Multi-Row Treasury/CBO/10-K Inspector + Sweep)
// ============================================================================
export interface FiscalLedgerRow {
  lineCode: string;
  category: string;
  priorValue: string;
  currentValue: string;
  deltaBadge: string;
  statuteNote?: string;
  highlighted?: boolean;
}

export interface FiscalLedgerTableStageProps extends BaseForensicProps {
  rows?: FiscalLedgerRow[];
}

export const FiscalLedgerTableStage: React.FC<FiscalLedgerTableStageProps> = ({
  rows = [
    { lineCode: "LN 01", category: "Individual Income + FICA Withholding", priorValue: "$3.82T", currentValue: "$4.14T", deltaBadge: "84.1% SHARE", statuteNote: "26 U.S.C. §3101", highlighted: true },
    { lineCode: "LN 02", category: "Corporate Income Tax Receipts", priorValue: "$420B", currentValue: "$348B", deltaBadge: "7.1% SHARE", statuteNote: "26 U.S.C. §11" },
    { lineCode: "LN 03", category: "Customs Duties & Excise Receipts", priorValue: "$192B", currentValue: "$214B", deltaBadge: "4.3% SHARE" },
    { lineCode: "LN 04", category: "Net Interest on Public Debt (Outlay)", priorValue: "$659B", currentValue: "$952B", deltaBadge: "+44.5% YOY", statuteNote: "31 U.S.C. §3123", highlighted: true },
  ],
  ...base
}) => {
  return (
    <ForensicStageFrame
      defaultDocket="TREASURY MONTHLY STATEMENT · TABLE 9 AUDIT"
      defaultTitle="Primary Receipt & Mandatory Debt-Service Ledger"
      defaultSubtitle="Line-by-line inspection of federal receipts versus pre-committed statutory interest claims."
      defaultVerdict="84.1% WAGE LOCK"
      defaultCitation="U.S. Department of the Treasury, Monthly Treasury Statement Table 9"
      panVerticalPx={-10}
      {...base}
    >
      {(ctx) => (
        <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "24px 30px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1.6fr 0.7fr 0.7fr 0.8fr", paddingBottom: "12px", borderBottom: `2px solid ${ctx.ruleOxford}`, fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.inkMuted, letterSpacing: "0.08em" }}>
            <span>CODE</span>
            <span>STATUTORY LINE ITEM</span>
            <span style={{ textAlign: "right" }}>PRIOR FY</span>
            <span style={{ textAlign: "right" }}>AUDITED</span>
            <span style={{ textAlign: "right" }}>DELTA / SHARE</span>
          </div>

          {rows.map((r, i) => {
            const rowSweep = interpolate(ctx.elapsed, [8 + i * 5, 26 + i * 5], [0, 1], CLAMP);
            return (
              <div
                key={`flt-${r.lineCode}-${i}`}
                style={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: "90px 1.6fr 0.7fr 0.7fr 0.8fr",
                  alignItems: "center",
                  padding: "18px 12px",
                  borderRadius: "6px",
                  backgroundColor: r.highlighted ? ctx.bgRecessed : "transparent",
                  borderBottom: `1px solid ${ctx.ruleHairline}`,
                }}
              >
                {r.highlighted && !ctx.isGlass && (
                  <div style={{ position: "absolute", left: "96px", top: "12px", zIndex: 0 }}>
                    <HighlighterStroke width={520} height={34} progress={rowSweep} register="archival_parchment" seed={17 + i} />
                  </div>
                )}
                <span style={{ position: "relative", zIndex: 1, fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.inkMuted, ...TABULAR_NUM_STYLE }}>
                  {r.lineCode}
                </span>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "15px" : "20px", fontWeight: 700, color: ctx.inkPrimary }}>
                    {r.category}
                  </div>
                  {r.statuteNote && (
                    <div style={{ fontFamily: FONTS.mono, fontSize: "11.5px", color: ctx.accentStatutory, marginTop: "2px" }}>
                      {r.statuteNote}
                    </div>
                  )}
                </div>
                <span style={{ position: "relative", zIndex: 1, textAlign: "right", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "15px" : "21px", color: ctx.inkSecondary, ...TABULAR_NUM_STYLE }}>
                  {r.priorValue}
                </span>
                <span style={{ position: "relative", zIndex: 1, textAlign: "right", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "17px" : "24px", fontWeight: 700, color: r.highlighted ? ctx.accentLiability : ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
                  {r.currentValue}
                </span>
                <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
                  <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "4px", backgroundColor: r.highlighted ? PAGE_PALETTE.brickRed : ctx.bgRecessed, color: r.highlighted ? "#FAF8F3" : ctx.inkSecondary, fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, ...TABULAR_NUM_STYLE }}>
                    {r.deltaBadge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 2. ClaimVsRealityCollision (Public Post/Podcast Claim vs Hard Ledger Wall)
// ============================================================================
export interface ClaimVsRealityCollisionProps extends BaseForensicProps {
  speakerHandle?: string;
  speakerName?: string;
  claimText?: string;
  claimDate?: string;
  realityTitle?: string;
  realityFigure?: string;
  realityDetail?: string;
}

export const ClaimVsRealityCollision: React.FC<ClaimVsRealityCollisionProps> = ({
  speakerHandle = "@VerifiedFuturist · Podcast Clip",
  speakerName = "Universal High Income Promise",
  claimText = "“Autonomous abundance will make money obsolete—everyone receives effortless universal high income.”",
  claimDate = "PUBLIC BROADCAST CLAIM",
  realityTitle = "HARD CONTRACTUAL REALITY",
  realityFigure = "$2.1T / YR INTEREST + ACH RENT DRAFT",
  realityDetail = "Landlords do not accept cloud compute credits; CBO projects $2.1T annual cash debt service locked in nominal dollars.",
  ...base
}) => {
  return (
    <ForensicStageFrame
      register="page_editorial"
      defaultDocket="MEDIA CONFRONTATION · CLAIM VS. CONTRACTUAL LEDGER"
      defaultTitle="Utopian Broadcast Rhetoric Collides With Nominal Dollar Obligations"
      defaultVerdict="REALITY CHECK"
      defaultCitation="CBO Long-Term Budget Baseline & Residential ACH Clearing Rules"
      {...base}
    >
      {(ctx) => {
        const collide = interpolate(ctx.progress, [0, 0.65], [48, 0], CLAMP);
        return (
          <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr", gap: "32px", height: "100%", alignItems: "stretch", position: "relative" }}>
            {/* Left Verified Post / Podcast Card */}
            <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "12px", padding: "36px", display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `translate3d(${(-collide).toFixed(1)}px, 0, 0)` }}>
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentStatutory, letterSpacing: "0.08em" }}>
                  ● {speakerHandle}
                </div>
                <div style={{ fontFamily: FONTS.sans, fontSize: "21px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "6px" }}>
                  {speakerName}
                </div>
                <blockquote style={{ margin: "24px 0 0 0", fontFamily: FONTS.serif, fontStyle: "italic", fontSize: ctx.isGlass ? "19px" : "30px", lineHeight: 1.34, color: ctx.inkPrimary }}>
                  {claimText}
                </blockquote>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: ctx.inkMuted }}>
                {claimDate}
              </div>
            </div>

            {/* Right Brick-Red Hard Ledger Wall */}
            <div style={{ backgroundColor: ctx.isGlass ? OVER_FOOTAGE_PALETTE.riskFill : PAGE_PALETTE.riskFill, border: `2.5px solid ${PAGE_PALETTE.brickRed}`, borderRadius: "12px", padding: "36px", display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `translate3d(${collide.toFixed(1)}px, 0, 0)` }}>
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentLiability, letterSpacing: "0.1em" }}>
                  ■ {realityTitle}
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "26px" : "42px", fontWeight: 700, color: ctx.accentLiability, marginTop: "18px", lineHeight: 1.12, ...TABULAR_NUM_STYLE }}>
                  {realityFigure}
                </div>
                <p style={{ margin: "20px 0 0 0", fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "14.5px" : "20px", lineHeight: 1.5, color: ctx.inkPrimary }}>
                  {realityDetail}
                </p>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentLiability }}>
                VERDICT: NON-NEGOTIABLE CASH SETTLEMENT REQUIRED
              </div>
            </div>
          </div>
        );
      }}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 3. SupremeCourtSyllabusStage (Wielechowski v. State · $3,900 -> $1,000 Drop)
// ============================================================================
export interface SupremeCourtSyllabusStageProps extends BaseForensicProps {
  caseCaption?: string;
  citationNumber?: string;
  voteSplit?: string;
  holdingSummary?: string;
  formulaPayout?: number;
  actualPayout?: number;
}

export const SupremeCourtSyllabusStage: React.FC<SupremeCourtSyllabusStageProps> = ({
  caseCaption = "Wielechowski v. State of Alaska",
  citationNumber = "403 P.3d 1141 (Alaska 2017)",
  voteSplit = "UNANIMOUS HOLDING",
  holdingSummary = "Statutory dividend formulas do not bind annual legislative appropriations; resource dividends remain subject to executive line-item veto whenever state fiscal deficits widen.",
  formulaPayout = 3900,
  actualPayout = 1000,
  ...base
}) => {
  return (
    <ForensicStageFrame
      defaultDocket={`SUPREME COURT SYLLABUS · ${citationNumber}`}
      defaultTitle={caseCaption}
      defaultVerdict={voteSplit}
      defaultCitation={`${caseCaption}, ${citationNumber} · Permanent Fund Dividend Veto`}
      {...base}
    >
      {(ctx) => {
        const dropMix = interpolate(ctx.progress, [0.25, 0.85], [0, 1], CLAMP);
        const currentBarVal = Math.round(formulaPayout - (formulaPayout - actualPayout) * dropMix);
        return (
          <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1.2fr 0.8fr", gap: "36px", height: "100%" }}>
            <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "36px 42px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentStatutory, letterSpacing: "0.1em" }}>
                  SYLLABUS OF THE COURT · CONSTITUTIONAL APPROPRIATIONS CLAUSE
                </div>
                <p style={{ margin: "22px 0 0 0", fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "18px" : "26px", lineHeight: 1.48, color: ctx.inkPrimary }}>
                  {holdingSummary}
                </p>
              </div>
              <div style={{ borderTop: `1px solid ${ctx.ruleHairline}`, paddingTop: "16px", fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.accentLiability }}>
                PRECEDENT: SOVEREIGN DEFICITS OVERRIDE UNIVERSAL DIVIDEND FORMULAS
              </div>
            </div>

            <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "32px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.inkMuted }}>
                STATUTORY FORMULA VS. APPROPRIATED PAYOUT
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "300px", paddingBottom: "12px", borderBottom: `2px solid ${ctx.ruleOxford}` }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "20px", fontWeight: 700, color: ctx.inkSecondary, marginBottom: "8px", ...TABULAR_NUM_STYLE }}>
                    ${formulaPayout.toLocaleString()}
                  </div>
                  <div style={{ width: "96px", height: "230px", backgroundColor: ctx.accentStatutory, borderRadius: "4px" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "24px", fontWeight: 700, color: ctx.accentLiability, marginBottom: "8px", ...TABULAR_NUM_STYLE }}>
                    ${currentBarVal.toLocaleString()}
                  </div>
                  <div style={{ width: "96px", height: `${Math.max(36, (currentBarVal / Math.max(1, formulaPayout)) * 230).toFixed(1)}px`, backgroundColor: ctx.accentLiability, borderRadius: "4px" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.inkPrimary }}>
                <span>STATUTORY</span>
                <span style={{ color: ctx.accentLiability }}>AFTER VETO (-74%)</span>
              </div>
            </div>
          </div>
        );
      }}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 4. EscapeHatchSwitchboard (Persistent 3-Bay Board Locking Red Failure Stamps)
// ============================================================================
export interface EscapeHatchBay {
  bayNumber: string;
  title: string;
  mechanism: string;
  stampText: string;
  isFailed: boolean;
}

export interface EscapeHatchSwitchboardProps extends BaseForensicProps {
  bays?: EscapeHatchBay[];
  activeBayIndex?: number;
}

export const EscapeHatchSwitchboard: React.FC<EscapeHatchSwitchboardProps> = ({
  bays = [
    { bayNumber: "BAY 01", title: "Tax the Robots / Corporate Windfall", mechanism: "Capital & IP shift across jurisdictions; deficits swallow revenue first.", stampText: "DIVERTED TO DEFICIT", isFailed: true },
    { bayNumber: "BAY 02", title: "Universal Sovereign Dividend", mechanism: "Subject to annual appropriations & line-item veto under fiscal stress.", stampText: "VETOED / RATIONED", isFailed: true },
    { bayNumber: "BAY 03", title: "Buy Equity Before Displacement", mechanism: "Bottom 50% hold 1.0% of equities; escrow & rent consume investable surplus.", stampText: "PRICED OUT", isFailed: true },
  ],
  activeBayIndex = 2,
  ...base
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <ForensicStageFrame
      register="page_editorial"
      defaultDocket="CONTINUITY SWITCHBOARD · THREE ESCAPE HATCHES"
      defaultTitle="Systematic Elimination of Policy Escape Hatches"
      defaultSubtitle="Prior bays retain locked failure stamps permanently while the investigation advances."
      defaultVerdict="3 / 3 SEALED"
      defaultCitation="Episode Continuity Switchboard · Cumulative Structural Audit"
      {...base}
    >
      {(ctx) => (
        <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr 1fr", gap: "26px", height: "100%" }}>
          {bays.map((bay, idx) => {
            const isPriorLocked = idx < activeBayIndex && bay.isFailed;
            const isCurrentSlam = idx === activeBayIndex && bay.isFailed;
            const stampScale = isPriorLocked
              ? 1
              : isCurrentSlam
              ? spring({ frame: Math.max(0, frame - (base.atFrame ?? 0) - 14), fps, config: CINEMA_SPRINGS.heavyStamp })
              : 0;

            return (
              <div
                key={`ehs-${bay.bayNumber}`}
                style={{
                  position: "relative",
                  backgroundColor: bay.isFailed ? (ctx.isGlass ? OVER_FOOTAGE_PALETTE.riskFill : PAGE_PALETTE.riskFill) : ctx.bgElevated,
                  border: `2px solid ${bay.isFailed ? PAGE_PALETTE.brickRed : ctx.ruleOxford}`,
                  borderRadius: "12px",
                  padding: "30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentLiability, letterSpacing: "0.1em", ...TABULAR_NUM_STYLE }}>
                    {bay.bayNumber}
                  </div>
                  <h3 style={{ margin: "12px 0 0 0", fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "20px" : "30px", lineHeight: 1.18, color: ctx.inkPrimary }}>
                    {bay.title}
                  </h3>
                  <p style={{ margin: "16px 0 0 0", fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "13.5px" : "18px", lineHeight: 1.5, color: ctx.inkSecondary }}>
                    {bay.mechanism}
                  </p>
                </div>

                {stampScale > 0.02 && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      border: `3px solid ${PAGE_PALETTE.brickRed}`,
                      color: ctx.accentLiability,
                      padding: "8px 16px",
                      borderRadius: "4px",
                      fontFamily: FONTS.mono,
                      fontSize: "15px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      transform: `rotate(-3deg) scale(${(2 - stampScale).toFixed(3)})`,
                      opacity: Math.min(1, stampScale * 1.4),
                    }}
                  >
                    ✗ {bay.stampText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 5. ArchivalRationBook1941 (16 Coupons Ticking Down While Cash Sits Unusable)
// ============================================================================
export interface ArchivalRationBook1941Props extends BaseForensicProps {
  totalCoupons?: number;
  redeemedCoupons?: number;
  cashBalanceLabel?: string;
}

export const ArchivalRationBook1941: React.FC<ArchivalRationBook1941Props> = ({
  totalCoupons = 16,
  redeemedCoupons = 14,
  cashBalanceLabel = "£42 10s STERLING CASH IN POCKET — UNUSABLE WITHOUT COUPON",
  ...base
}) => {
  const count = Math.max(4, Math.min(16, totalCoupons));
  const cells: number[] = [];
  for (let i = 0; i < count; i++) cells.push(i);

  return (
    <ForensicStageFrame
      defaultDocket="MINISTRY OF FOOD · NATIONAL RATION BOOK R.B.1 (1941)"
      defaultTitle="When Money Stops Clearing: 16 Ration Coupons Supersede Cash"
      defaultSubtitle="Under physical scarcity or programmable allowance rules, unspent currency sits idle once monthly allocation units expire."
      defaultVerdict="COUPONS EXHAUSTED"
      defaultCitation="U.K. Ministry of Food Rationing Order (1941) · Imperial War Museum Archive"
      {...base}
    >
      {(ctx) => {
        const stampedCount = Math.round(interpolate(ctx.progress, [0.1, 0.9], [2, redeemedCoupons], CLAMP));
        return (
          <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1.15fr 0.85fr", gap: "36px", height: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", backgroundColor: ctx.bgElevated, border: `2px dashed ${ctx.ruleOxford}`, borderRadius: "10px", padding: "24px" }}>
              {cells.map((idx) => {
                const isUsed = idx < stampedCount;
                return (
                  <div
                    key={`rb41-${idx}`}
                    style={{
                      border: `1.5px dashed ${isUsed ? ctx.accentLiability : ctx.ruleOxford}`,
                      borderRadius: "6px",
                      backgroundColor: isUsed ? ctx.bgRecessed : ctx.bgElevated,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px",
                      opacity: isUsed ? 0.62 : 1,
                    }}
                  >
                    <span style={{ fontFamily: FONTS.mono, fontSize: "12px", color: ctx.inkMuted, ...TABULAR_NUM_STYLE }}>
                      UNIT {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: "15px", fontWeight: 700, color: isUsed ? ctx.accentLiability : ctx.accentSolvent, marginTop: "4px" }}>
                      {isUsed ? "VOID" : "VALID"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.inkMuted }}>
                  UNSPENT NOMINAL CURRENCY
                </div>
                <div style={{ fontFamily: FONTS.serif, fontSize: "30px", fontWeight: 700, color: ctx.inkSecondary, marginTop: "14px", lineHeight: 1.25 }}>
                  {cashBalanceLabel}
                </div>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "32px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>
                {count - stampedCount} / {count} UNITS LEFT
              </div>
            </div>
          </div>
        );
      }}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 6. FoiaRedactionDeclassify (Selective FOIA Exemption Blackout Lift)
// ============================================================================
export interface FoiaClauseLine {
  prefix: string;
  classifiedSpan: string;
  suffix: string;
  declassify?: boolean;
}

export interface FoiaRedactionDeclassifyProps extends BaseForensicProps {
  clauses?: FoiaClauseLine[];
}

export const FoiaRedactionDeclassify: React.FC<FoiaRedactionDeclassifyProps> = ({
  clauses = [
    { prefix: "1. Counterparty facility shall receive priority access to ", classifiedSpan: "2,400 MW firm baseload substation capacity", suffix: " ahead of municipal tariff queues.", declassify: true },
    { prefix: "2. Ratepayer infrastructure upgrades totaling ", classifiedSpan: "$4.85 billion in transmission capex", suffix: " shall be socialized across residential riders.", declassify: true },
    { prefix: "3. Security protocol annex ", classifiedSpan: "[REDACTED PER 5 U.S.C. §552(b)(4)]", suffix: " remains sealed.", declassify: false },
  ],
  ...base
}) => {
  return (
    <ForensicStageFrame
      defaultDocket="FOIA PRODUCTION · EXEMPTION (b)(4) DECLASSIFICATION"
      defaultTitle="Unredacted Utility & Sovereign Offtake Memorandum"
      defaultVerdict="PARTIAL UNSEAL"
      defaultCitation="Freedom of Information Act Production Docket · Public Utility Commission"
      {...base}
    >
      {(ctx) => {
        const peel = interpolate(ctx.progress, [0.2, 0.85], [1, 0], CLAMP);
        return (
          <div style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "42px 48px", display: "flex", flexDirection: "column", gap: "26px" }}>
            {clauses.map((cl, i) => (
              <div key={`foia-${i}`} style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "14.5px" : "21px", lineHeight: 1.65, color: ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
                <span>{cl.prefix}</span>
                <span style={{ position: "relative", display: "inline-block", padding: "2px 8px", backgroundColor: cl.declassify ? "rgba(233, 196, 106, 0.35)" : "transparent", fontWeight: 700, color: cl.declassify ? ctx.accentLiability : ctx.inkPrimary }}>
                  {cl.classifiedSpan}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: PAGE_PALETTE.navyDeep,
                      transform: `scaleX(${(cl.declassify ? peel : 1).toFixed(4)})`,
                      transformOrigin: "right center",
                    }}
                  />
                </span>
                <span>{cl.suffix}</span>
              </div>
            ))}
          </div>
        );
      }}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 7. Sec10KFootnoteStretch (3 Yrs -> 6 Yrs Useful-Life Depreciation Stretch)
// ============================================================================
export interface Sec10KFootnoteStretchProps extends BaseForensicProps {
  priorLifeYears?: number;
  newLifeYears?: number;
  epsBoostB?: string;
}

export const Sec10KFootnoteStretch: React.FC<Sec10KFootnoteStretchProps> = ({
  priorLifeYears = 3,
  newLifeYears = 6,
  epsBoostB = "+$14.8B PAPER OPERATING INCOME BOOST",
  ...base
}) => {
  return (
    <ForensicStageFrame
      defaultDocket="SEC FORM 10-K · NOTE 1 ACCOUNTING POLICY CHANGE"
      defaultTitle="Useful-Life Stretch: Server Amortization Extended From 3 to 6 Years"
      defaultSubtitle="Even as new AI silicon architectures ship every 12 months, extending book depreciation doubles paper longevity to flatter GAAP earnings."
      defaultVerdict="3 YRS → 6 YRS"
      defaultCitation="SEC EDGAR Form 10-K Filings (Property & Equipment Useful Lives)"
      {...base}
    >
      {(ctx) => {
        const stretchW = interpolate(ctx.progress, [0.15, 0.85], [420, 840], CLAMP);
        return (
          <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "38px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", boxSizing: "border-box" }}>
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.inkMuted }}>
                PHYSICAL SILICON OBSOLESCENCE CADENCE (18–36 MONTHS)
              </div>
              <div style={{ marginTop: "10px", width: "420px", height: "48px", backgroundColor: ctx.accentStatutory, borderRadius: "6px", display: "flex", alignItems: "center", paddingLeft: "18px", fontFamily: FONTS.mono, fontSize: "17px", fontWeight: 700, color: "#FAF8F3", ...TABULAR_NUM_STYLE }}>
                PRIOR SCHEDULE · {priorLifeYears} YEARS
              </div>

              <div style={{ marginTop: "34px", fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.accentLiability }}>
                REVISED ACCOUNTING FOOTNOTE SCHEDULE
              </div>
              <div style={{ marginTop: "10px", width: `${ctx.isGlass ? Math.min(500, stretchW) : stretchW}px`, height: "58px", backgroundColor: ctx.accentLiability, borderRadius: "6px", display: "flex", alignItems: "center", paddingLeft: "18px", fontFamily: FONTS.mono, fontSize: "18px", fontWeight: 700, color: "#FAF8F3", ...TABULAR_NUM_STYLE }}>
                STRETCHED SCHEDULE · {newLifeYears} YEARS
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${ctx.ruleHairline}`, paddingTop: "18px", fontFamily: FONTS.mono, fontSize: "22px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>
              {epsBoostB}
            </div>
          </div>
        );
      }}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 8. BdcPikScheduleExhibit (Private Credit Schedule of Investments · PIK Toggle)
// ============================================================================
export interface PikLoanItem {
  borrower: string;
  couponSpec: string;
  parMillions: string;
  pikStatus: string;
}

export interface BdcPikScheduleExhibitProps extends BaseForensicProps {
  loans?: PikLoanItem[];
}

export const BdcPikScheduleExhibit: React.FC<BdcPikScheduleExhibitProps> = ({
  loans = [
    { borrower: "Enterprise Workflow SaaS HoldCo", couponSpec: "SOFR + 650 (11.8% PIK)", parMillions: "$412.4M", pikStatus: "CASH → PIK TOGGLED" },
    { borrower: "Legacy Seat-Licensed CRM Corp", couponSpec: "SOFR + 600 (11.3% PIK)", parMillions: "$289.0M", pikStatus: "100% CAPITALIZED" },
    { borrower: "Middle-Market Dental Rollup LP", couponSpec: "SOFR + 575 (11.0% PIK)", parMillions: "$194.6M", pikStatus: "ACCRUING TO PAR" },
  ],
  ...base
}) => {
  return (
    <ForensicStageFrame
      defaultDocket="FORM 10-Q · BDC SCHEDULE OF INVESTMENTS"
      defaultTitle="Shadow Default Masking: Payment-in-Kind (PIK) Interest Snowball"
      defaultSubtitle="Cash-strapped software borrowers pay interest with more IOUs, booking phantom investment income while principal compounds toward maturity."
      defaultVerdict="11.5% PIK IOUs"
      defaultCitation="BDC Quarterly Schedule of Investments Filings (SEC Form 10-Q)"
      {...base}
    >
      {(ctx) => (
        <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "30px 36px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {loans.map((ln, i) => (
            <div key={`pik-${i}`} style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr auto" : "1.4fr 1fr 0.6fr 0.9fr", alignItems: "center", padding: "18px 20px", borderRadius: "8px", backgroundColor: ctx.bgRecessed, border: `1px solid ${ctx.ruleHairline}`, gap: "14px" }}>
              <span style={{ fontFamily: FONTS.sans, fontSize: "19px", fontWeight: 700, color: ctx.inkPrimary }}>{ln.borrower}</span>
              {!ctx.isGlass && <span style={{ fontFamily: FONTS.mono, fontSize: "15px", color: ctx.accentCapital, fontWeight: 700, ...TABULAR_NUM_STYLE }}>{ln.couponSpec}</span>}
              <span style={{ fontFamily: FONTS.mono, fontSize: "20px", fontWeight: 700, color: ctx.inkPrimary, textAlign: "right", ...TABULAR_NUM_STYLE }}>{ln.parMillions}</span>
              {!ctx.isGlass && <span style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.accentLiability, textAlign: "right" }}>{ln.pikStatus}</span>}
            </div>
          ))}
        </div>
      )}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 9. StatutoryClauseHighlighter (Engraved Statute + Highlighter + Brass Loupe)
// ============================================================================
export interface StatutoryClauseHighlighterProps extends BaseForensicProps {
  statuteHeading?: string;
  clauseText?: string;
  enableLoupe?: boolean;
}

export const StatutoryClauseHighlighter: React.FC<StatutoryClauseHighlighterProps> = ({
  statuteHeading = "31 U.S.C. § 3123 — PAYMENT OF PRINCIPAL AND INTEREST",
  clauseText = "The faith of the United States Government is pledged to pay, in legal tender, principal and interest on the obligations of the Government issued under this chapter before discretionary outlays.",
  enableLoupe = true,
  ...base
}) => {
  const pal = REGISTERS.archival_parchment;
  return (
    <ForensicStageFrame
      register={pal.id}
      defaultDocket="UNITED STATES CODE · STATUTORY PRIORITY PROVISO"
      defaultTitle={statuteHeading}
      defaultVerdict="SENIOR CLAIM"
      defaultCitation="Title 31, Money and Finance, United States Code §3123"
      {...base}
    >
      {(ctx) => {
        const inner = (
          <div style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "48px 56px", position: "relative" }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: "14px", fontWeight: 700, color: ctx.accentStatutory, letterSpacing: "0.1em" }}>
              § {statuteHeading}
            </div>
            <div style={{ position: "relative", marginTop: "24px" }}>
              {!ctx.isGlass && (
                <div style={{ position: "absolute", left: 0, top: "6px", zIndex: 0 }}>
                  <HighlighterStroke width={1040} height={42} progress={ctx.progress} register="archival_parchment" />
                </div>
              )}
              <p style={{ position: "relative", zIndex: 1, margin: 0, fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "20px" : "34px", lineHeight: 1.45, color: ctx.inkPrimary }}>
                {clauseText}
              </p>
            </div>
          </div>
        );

        return (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {inner}
            {enableLoupe && !ctx.isGlass && ctx.progress > 0.55 && (
              <OpticalLoupe x={1180} y={210} radius={130} zoom={1.95} register="archival_parchment" label="OPERATIVE CLAUSE" enterFrame={18}>
                {inner}
              </OpticalLoupe>
            )}
          </div>
        );
      }}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 10. InsuranceRateHikeNotice (Non-Renewal / FAIR Plan +222% Premium Notice)
// ============================================================================
export interface InsuranceRateHikeNoticeProps extends BaseForensicProps {
  priorPremium?: string;
  renewalPremium?: string;
  inspectionFlag?: string;
}

export const InsuranceRateHikeNotice: React.FC<InsuranceRateHikeNoticeProps> = ({
  priorPremium = "$2,140 / YR",
  renewalPremium = "$6,890 / YR",
  inspectionFlag = "AERIAL DRONE ROOF SCORE: NON-RENEWAL TRIGGERED → STATE FAIR PLAN",
  ...base
}) => {
  return (
    <ForensicStageFrame
      defaultDocket="POLICYHOLDER NOTICE · HAZARD UNDERWRITING REPRICING"
      defaultTitle="Admitted Carrier Withdrawal & Force-Placed Premium Shock"
      defaultVerdict="+222% PREMIUM"
      defaultCitation="State Department of Insurance Rate Filings & FAIR Plan Docket"
      {...base}
    >
      {(ctx) => (
        <div style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "40px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", boxSizing: "border-box" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "13.5px", fontWeight: 700, color: ctx.accentLiability }}>
            ▲ {inspectionFlag}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
            <div style={{ backgroundColor: ctx.bgRecessed, padding: "28px", borderRadius: "8px" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: ctx.inkMuted }}>PRIOR ANNUAL PREMIUM</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "26px" : "46px", fontWeight: 700, color: ctx.inkSecondary, marginTop: "8px", ...TABULAR_NUM_STYLE }}>{priorPremium}</div>
            </div>
            <div style={{ backgroundColor: PAGE_PALETTE.riskFill, border: `2px solid ${PAGE_PALETTE.brickRed}`, padding: "28px", borderRadius: "8px" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: PAGE_PALETTE.brickRed }}>RENEWAL / DICTATED ESCROW</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "26px" : "46px", fontWeight: 700, color: PAGE_PALETTE.brickRed, marginTop: "8px", ...TABULAR_NUM_STYLE }}>{renewalPremium}</div>
            </div>
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: "18px", color: ctx.inkSecondary }}>
            Mortgage covenant mandates continuous replacement-cost coverage; non-payment triggers technical loan default.
          </div>
        </div>
      )}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 11. IrsForm941FicaSplit (IRS Form 941 Employee + Employer 15.3% FICA Split)
// ============================================================================
export interface IrsForm941FicaSplitProps extends BaseForensicProps {
  employeeShare?: string;
  employerShare?: string;
  combinedRate?: string;
}

export const IrsForm941FicaSplit: React.FC<IrsForm941FicaSplitProps> = ({
  employeeShare = "7.65% (6.2% OASDI + 1.45% HI)",
  employerShare = "7.65% (6.2% OASDI + 1.45% HI)",
  combinedRate = "15.30% GROSS PAYROLL EXTRACTION",
  ...base
}) => {
  return (
    <ForensicStageFrame
      defaultDocket="OMB NO. 1545-0029 · IRS FORM 941 QUARTERLY RETURN"
      defaultTitle="Employer’s Quarterly Federal Tax Return: The 15.3% Wage Gate"
      defaultSubtitle="Autonomous API tokens pay 0.0% on Form 941; every human W-2 hire triggers bilateral 15.3% statutory payroll withholding."
      defaultVerdict="15.3% FICA GATE"
      defaultCitation="Internal Revenue Service Form 941, Part 1 Lines 5a–5d"
      {...base}
    >
      {(ctx) => (
        <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr", gap: "28px", height: "100%" }}>
          <div style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "34px" }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentStatutory }}>LINE 5a/5c · EMPLOYEE WITHHOLDING</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "34px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "14px", ...TABULAR_NUM_STYLE }}>{employeeShare}</div>
            <div style={{ marginTop: "28px", fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentCapital }}>EMPLOYER MATCHING PAYROLL TAX</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "34px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "14px", ...TABULAR_NUM_STYLE }}>{employerShare}</div>
          </div>
          <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.accentLiability}`, borderRadius: "10px", padding: "34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.accentLiability }}>HUMAN VS. SILICON TAX WEDGE</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "28px" : "42px", fontWeight: 700, color: ctx.accentLiability, marginTop: "14px", ...TABULAR_NUM_STYLE }}>{combinedRate}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "18px", color: ctx.accentSolvent, marginTop: "18px", fontWeight: 700 }}>CLOUD GPU INFERENCE API · 0.00% FICA</div>
          </div>
        </div>
      )}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 12. SubseaSabotageIncidentLog (AIS Anchor-Drag & Optical dB Drop Log)
// ============================================================================
export interface SubseaEventEntry {
  utcTime: string;
  cableName: string;
  depthMeters: string;
  status: string;
}

export interface SubseaSabotageIncidentLogProps extends BaseForensicProps {
  events?: SubseaEventEntry[];
}

export const SubseaSabotageIncidentLog: React.FC<SubseaSabotageIncidentLogProps> = ({
  events = [
    { utcTime: "02:04 UTC", cableName: "BCS East-West Interlink", depthMeters: "108m Seabed", status: "OPTICAL LOSS -38 dB · SEVERED" },
    { utcTime: "13:58 UTC", cableName: "C-Lion1 Helsinki–Rostock", depthMeters: "114m Seabed", status: "ANCHOR DRAG TRACK · SEVERED" },
    { utcTime: "14:12 UTC", cableName: "AIS Transponder Anomaly", depthMeters: "7.2 kt Drift", status: "DARK VESSEL CORRELATION" },
  ],
  ...base
}) => {
  return (
    <ForensicStageFrame
      register="drafting_blueprint"
      defaultDocket="MARITIME TELEMETRY LOG · SUBSEA FIBER FAULT AUDIT"
      defaultTitle="Garden-Hose Vulnerability: 99% of Intercontinental Data on Unarmored Seabed"
      defaultVerdict="SIGNAL SEVERED"
      defaultCitation="ICPC Cable Fault Registry & Baltic Maritime AIS Track Audit"
      {...base}
    >
      {(ctx) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {events.map((ev, i) => (
            <div key={`ssil-${i}`} style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "90px 1fr" : "150px 1.2fr 0.7fr 1.1fr", alignItems: "center", padding: "22px 26px", backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "8px", fontFamily: FONTS.mono, ...TABULAR_NUM_STYLE }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: ctx.accentCapital }}>{ev.utcTime}</span>
              <span style={{ fontFamily: FONTS.sans, fontSize: "20px", fontWeight: 700, color: ctx.inkPrimary }}>{ev.cableName}</span>
              {!ctx.isGlass && <span style={{ fontSize: "16px", color: ctx.inkSecondary }}>{ev.depthMeters}</span>}
              {!ctx.isGlass && <span style={{ fontSize: "15px", fontWeight: 700, color: ctx.accentLiability, textAlign: "right" }}>{ev.status}</span>}
            </div>
          ))}
        </div>
      )}
    </ForensicStageFrame>
  );
};

// ============================================================================
// 13. CongressionalHearingSlate (Senate Finance Committee Sworn Testimony)
// ============================================================================
export interface CongressionalHearingSlateProps extends BaseForensicProps {
  committee?: string;
  witnessName?: string;
  witnessTitle?: string;
  swornExcerpt?: string;
}

export const CongressionalHearingSlate: React.FC<CongressionalHearingSlateProps> = ({
  committee = "U.S. SENATE COMMITTEE ON FINANCE",
  witnessName = "Congressional Budget Office Director",
  witnessTitle = "Sworn Fiscal Baseline Testimony",
  swornExcerpt = "“Net interest outlays now exceed the entire defense budget and grow automatically regardless of discretionary spending freezes.”",
  ...base
}) => (
  <ForensicStageFrame
    register="page_editorial"
    defaultDocket={committee}
    defaultTitle={witnessName}
    defaultSubtitle={witnessTitle}
    defaultVerdict="ON THE RECORD"
    defaultCitation="Senate Finance Committee Hearing Transcript · U.S. GPO"
    {...base}
  >
    {(ctx) => (
      <div style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.ruleOxford}`, borderLeft: `8px solid ${ctx.accentLiability}`, borderRadius: "10px", padding: "48px 56px" }}>
        <blockquote style={{ margin: 0, fontFamily: FONTS.serif, fontStyle: "italic", fontSize: ctx.isGlass ? "20px" : "36px", lineHeight: 1.4, color: ctx.inkPrimary }}>
          {swornExcerpt}
        </blockquote>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 14. TreasuryTicLedgerExhibit (Foreign Official vs Private Custodial T-Bills)
// ============================================================================
export interface TreasuryTicLedgerExhibitProps extends BaseForensicProps {
  officialShare?: string;
  privateRailShare?: string;
}

export const TreasuryTicLedgerExhibit: React.FC<TreasuryTicLedgerExhibitProps> = ({
  officialShare = "Foreign Central Banks: 71% → 52% Share",
  privateRailShare = "Money Funds & Stablecoin Custodians: +$1.4T Surge",
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket="TREASURY INTERNATIONAL CAPITAL (TIC) · TABLE A"
    defaultTitle="Buyer Rotation: Central Banks Step Back as Private Dollar Rails Step In"
    defaultVerdict="BUYER SHIFT"
    defaultCitation="U.S. Treasury TIC System Major Foreign Holders Schedule"
    {...base}
  >
    {(ctx) => (
      <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr", gap: "28px" }}>
        <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "36px" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "13px", color: ctx.inkMuted }}>OFFICIAL SOVEREIGN RESERVE SHARE</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: "28px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "14px", ...TABULAR_NUM_STYLE }}>{officialShare}</div>
        </div>
        <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.accentSolvent}`, borderRadius: "10px", padding: "36px" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "13px", color: ctx.accentSolvent, fontWeight: 700 }}>CAPTIVE PRIVATE T-BILL CUSTODIANS</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: "28px", fontWeight: 700, color: ctx.accentSolvent, marginTop: "14px", ...TABULAR_NUM_STYLE }}>{privateRailShare}</div>
        </div>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 15. SpvCircularFlowSheet (Off-Balance-Sheet GPU Collateral & Lease Loop)
// ============================================================================
export interface SpvCircularFlowSheetProps extends BaseForensicProps {
  nodes?: [string, string, string];
}

export const SpvCircularFlowSheet: React.FC<SpvCircularFlowSheetProps> = ({
  nodes = [
    "1. Vendor Equity Injection ($2.0B)",
    "2. Off-Balance-Sheet SPV Borrows $12B Against GPUs",
    "3. SPV Purchases Vendor Chips & Books Immediate Revenue",
  ],
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket="FORENSIC DEAL DIAGRAM · SPECIAL PURPOSE VEHICLE"
    defaultTitle="Circular Compute Financing: Vendor Equity Becomes Booked Hardware Sales"
    defaultVerdict="ROUND-TRIP LOOP"
    defaultCitation="Private Debt Offering Memoranda & Related-Party Footnotes"
    {...base}
  >
    {(ctx) => (
      <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr 1fr", gap: "24px", alignItems: "stretch", height: "100%" }}>
        {nodes.map((nd, i) => (
          <div key={`spv-${i}`} style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${i === 2 ? ctx.accentLiability : ctx.ruleOxford}`, borderRadius: "10px", padding: "32px", display: "flex", alignItems: "center", fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "16px" : "22px", fontWeight: 700, color: ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
            {nd}
          </div>
        ))}
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 16. FannieMaeCovenantExhibit (Agency MBS Hazard-Insurance Covenant Audit)
// ============================================================================
export interface FannieMaeCovenantExhibitProps extends BaseForensicProps {
  covenantChecks?: Array<{ requirement: string; status: string; breached?: boolean }>;
}

export const FannieMaeCovenantExhibit: React.FC<FannieMaeCovenantExhibitProps> = ({
  covenantChecks = [
    { requirement: "100% Replacement Cost Hazard Coverage", status: "CARRIER EXITED ZIP", breached: true },
    { requirement: "Maximum Deductible Cap (<= 5% Coverage A)", status: "10% WIND/HAIL DEDUCTIBLE", breached: true },
    { requirement: "Admitted AM Best B+ Rated Underwriter", status: "FORCE-PLACED SURPLUS", breached: true },
  ],
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket="FANNIE MAE SELLING GUIDE · B7-3-02 COVENANT CHECKLIST"
    defaultTitle="Secondary Mortgage Market Collateral Insurance Breach"
    defaultVerdict="COVENANT BREACH"
    defaultCitation="Fannie Mae Single-Family Selling Guide Subpart B7-3"
    {...base}
  >
    {(ctx) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {covenantChecks.map((ck, i) => (
          <div key={`fmc-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px", backgroundColor: ctx.bgElevated, border: `1.5px solid ${ck.breached ? ctx.accentLiability : ctx.ruleOxford}`, borderRadius: "8px" }}>
            <span style={{ fontFamily: FONTS.sans, fontSize: "20px", fontWeight: 700, color: ctx.inkPrimary }}>{ck.requirement}</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: "15px", fontWeight: 700, color: ck.breached ? ctx.accentLiability : ctx.accentSolvent }}>{ck.status}</span>
          </div>
        ))}
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 17. RedlineContractDiffStage (Legal Blackline Strikeout & Insertion Diff)
// ============================================================================
export interface RedlineContractDiffStageProps extends BaseForensicProps {
  deletedClause?: string;
  insertedClause?: string;
}

export const RedlineContractDiffStage: React.FC<RedlineContractDiffStageProps> = ({
  deletedClause = "Dividend distributions shall be paid in unrestricted United States Dollars transferable to any depository account.",
  insertedClause = "Allocations shall issue as non-transferable platform compute & utility credits expiring 30 days after grant.",
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket="BLACKLINE AMENDMENT · TERMS OF DISTRIBUTION DIFF"
    defaultTitle="From Unrestricted Cash to Expiring Allowance Credits"
    defaultVerdict="CLAUSE AMENDED"
    defaultCitation="Comparative Statutory & Platform Terms Redline"
    {...base}
  >
    {(ctx) => (
      <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "40px 48px", display: "flex", flexDirection: "column", gap: "26px" }}>
        <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "18px" : "27px", color: ctx.inkMuted, textDecoration: "line-through", lineHeight: 1.4 }}>
          {deletedClause}
        </div>
        <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "19px" : "29px", fontWeight: 700, color: ctx.accentLiability, borderLeft: `5px solid ${ctx.accentLiability}`, paddingLeft: "22px", lineHeight: 1.4 }}>
          + {insertedClause}
        </div>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 18. PatentFiling1910Stage (Archival U.S. Patent Specification & Royalty Lock)
// ============================================================================
export interface PatentFiling1910StageProps extends BaseForensicProps {
  patentId?: string;
  claimExcerpt?: string;
}

export const PatentFiling1910Stage: React.FC<PatentFiling1910StageProps> = ({
  patentId = "U.S. PATENT OFFICE · SPEC. NO. 1,049,218",
  claimExcerpt = "All output produced upon said automated loom accrues to the holder of the machine patent; operator toll reduces strictly to subsistence maintenance.",
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket={patentId}
    defaultTitle="Ownership of the Machine Captures the Surplus"
    defaultVerdict="ROYALTY ASSIGNED"
    defaultCitation="U.S. Patent & Trademark Office Historical Gazette"
    {...base}
  >
    {(ctx) => (
      <div style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "48px 56px" }}>
        <p style={{ margin: 0, fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "20px" : "32px", lineHeight: 1.48, color: ctx.inkPrimary }}>
          {claimExcerpt}
        </p>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 19. BankCallReportTAccount (FDIC Schedule RC Assets vs Unrealized HTM Loss)
// ============================================================================
export interface BankCallReportTAccountProps extends BaseForensicProps {
  assetSide?: string;
  liabilitySide?: string;
}

export const BankCallReportTAccount: React.FC<BankCallReportTAccountProps> = ({
  assetSide = "Held-to-Maturity Bonds: -$482B Unrealized Duration Loss",
  liabilitySide = "Uninsured Sight Deposits + Thin 8.4% Tier-1 Equity Cushion",
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket="FDIC CALL REPORT · SCHEDULE RC BALANCE SHEET"
    defaultTitle="Duration Mismatch T-Account: Par Accounting vs. Market Reality"
    defaultVerdict="-$482B HTM GAP"
    defaultCitation="FDIC Quarterly Banking Profile, Unrealized Securities Losses"
    {...base}
  >
    {(ctx) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `4px solid ${ctx.ruleOxford}`, backgroundColor: ctx.bgElevated, borderRadius: "0 0 10px 10px", height: "100%" }}>
        <div style={{ padding: "36px", borderRight: `2px solid ${ctx.ruleOxford}` }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.accentLiability }}>ASSETS (MARK-TO-MARKET)</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "20px" : "30px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "18px", ...TABULAR_NUM_STYLE }}>{assetSide}</div>
        </div>
        <div style={{ padding: "36px" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.accentStatutory }}>LIABILITIES & CAPITAL</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "20px" : "30px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "18px", ...TABULAR_NUM_STYLE }}>{liabilitySide}</div>
        </div>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 20. VetoPenBudgetLedger (Executive Line-Item Veto Strike Slashing Payouts)
// ============================================================================
export interface VetoPenBudgetLedgerProps extends BaseForensicProps {
  originalLine?: string;
  vetoedLine?: string;
}

export const VetoPenBudgetLedger: React.FC<VetoPenBudgetLedgerProps> = ({
  originalLine = "Sec. 14(a) Statutory Citizen Dividend Appropriation .......... $3,900.00",
  vetoedLine = "EXECUTIVE VETO OVERRIDE: REDUCED TO $1,000.00 TO PLUG GENERAL DEFICIT",
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket="ENROLLED APPROPRIATIONS BILL · EXECUTIVE LINE-ITEM VETO"
    defaultTitle="Red Ink Veto: Sovereign Fiscal Stress Cuts Citizen Payouts First"
    defaultVerdict="LINE VETOED"
    defaultCitation="Enrolled State Operating Budget & Veto Message"
    {...base}
  >
    {(ctx) => (
      <div style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "44px 52px", position: "relative" }}>
        <div style={{ position: "relative", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "16px" : "25px", color: ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
          {originalLine}
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "5px", backgroundColor: PAGE_PALETTE.brickRed, transform: `scaleX(${ctx.progress.toFixed(3)})`, transformOrigin: "left center" }} />
        </div>
        <div style={{ marginTop: "28px", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "16px" : "23px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>
          ✎ {vetoedLine}
        </div>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 21. AchAutopayDraftReceipt (Household Checking Ledger Drained by Fixed Drafts)
// ============================================================================
export interface AchDraftItem {
  payee: string;
  amount: string;
}

export interface AchAutopayDraftReceiptProps extends BaseForensicProps {
  grossDeposit?: string;
  drafts?: AchDraftItem[];
  remainingBalance?: string;
}

export const AchAutopayDraftReceipt: React.FC<AchAutopayDraftReceiptProps> = ({
  grossDeposit = "+$4,420.00 NET DEPOSIT",
  drafts = [
    { payee: "ACH DEBIT · RESIDENTIAL LEASE / ESCROW", amount: "-$2,280.00" },
    { payee: "ACH DEBIT · ERCOT / GRID ELECTRIC DELIVERY", amount: "-$348.00" },
    { payee: "ACH DEBIT · AUTO & HEALTH DEDUCTIBLE", amount: "-$1,190.00" },
  ],
  remainingBalance = "$602.00 DISCRETIONARY ALLOWANCE",
  ...base
}) => (
  <ForensicStageFrame
    register="page_editorial"
    defaultDocket="HOUSEHOLD CHECKING CLEARINGHOUSE · MONTHLY AUTOPAY"
    defaultTitle="Paycheck to Allowance: Fixed Pre-Authorized Drafts Drain Surplus"
    defaultVerdict="$602 REMAINING"
    defaultCitation="Household Cash-Flow Ledger & Federal Reserve ACH Settlement"
    {...base}
  >
    {(ctx) => (
      <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "30px 38px", display: "flex", flexDirection: "column", gap: "14px", fontFamily: FONTS.mono, ...TABULAR_NUM_STYLE }}>
        <div style={{ fontSize: "20px", fontWeight: 700, color: ctx.accentSolvent, paddingBottom: "10px", borderBottom: `1px solid ${ctx.ruleHairline}` }}>
          {grossDeposit}
        </div>
        {drafts.map((d, i) => (
          <div key={`ach-${i}`} style={{ display: "flex", justifyContent: "space-between", fontSize: ctx.isGlass ? "14px" : "19px", color: ctx.inkPrimary }}>
            <span>{d.payee}</span>
            <span style={{ color: ctx.accentLiability, fontWeight: 700 }}>{d.amount}</span>
          </div>
        ))}
        <div style={{ marginTop: "10px", paddingTop: "14px", borderTop: `2px solid ${ctx.ruleOxford}`, fontSize: "24px", fontWeight: 700, color: ctx.accentLiability }}>
          ENDING BALANCE · {remainingBalance}
        </div>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 22. CreditRatingDowngradeMemo (Sovereign Credit Action AA+ -> AA-)
// ============================================================================
export interface CreditRatingDowngradeMemoProps extends BaseForensicProps {
  ratingShift?: string;
  rationale?: string;
}

export const CreditRatingDowngradeMemo: React.FC<CreditRatingDowngradeMemoProps> = ({
  ratingShift = "AAA → AA+ → AA- (NEGATIVE OUTLOOK)",
  rationale = "Structural primary deficits persist through economic expansions while mandatory interest-to-revenue ratios breach historical peer thresholds.",
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket="SOVEREIGN CREDIT COMMITTEE · RATING ACTION MEMORANDUM"
    defaultTitle={ratingShift}
    defaultVerdict="OUTLOOK NEGATIVE"
    defaultCitation="Sovereign Rating Action Commentary & Fiscal Sustainability Metrics"
    {...base}
  >
    {(ctx) => (
      <div style={{ backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.accentLiability}`, borderRadius: "10px", padding: "44px 52px" }}>
        <p style={{ margin: 0, fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "17px" : "26px", lineHeight: 1.5, color: ctx.inkPrimary }}>
          {rationale}
        </p>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 23. AntitrustMarketExhibit (GOVT. EX. 402 Trial Exhibit & Bottleneck Lock)
// ============================================================================
export interface AntitrustMarketExhibitProps extends BaseForensicProps {
  exhibitNumber?: string;
  internalQuote?: string;
  marketShareFigure?: string;
}

export const AntitrustMarketExhibit: React.FC<AntitrustMarketExhibitProps> = ({
  exhibitNumber = "GOVT. TRIAL EX. 402",
  internalQuote = "“Once enterprise workflows embed our proprietary tollbooth layer, switching costs exceed annual payroll savings.”",
  marketShareFigure = "89.4% BOTTLENECK SHARE",
  ...base
}) => (
  <ForensicStageFrame
    register="page_editorial"
    defaultDocket={`U.S. DISTRICT COURT · ${exhibitNumber}`}
    defaultTitle=" evidentiary Discovery: Bottleneck Pricing Power"
    defaultVerdict={exhibitNumber}
    defaultCitation="DOJ / FTC Federal Antitrust Trial Evidentiary Record"
    {...base}
  >
    {(ctx) => (
      <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1.3fr 0.7fr", gap: "28px", height: "100%" }}>
        <div style={{ backgroundColor: ctx.bgElevated, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "38px", fontFamily: FONTS.serif, fontStyle: "italic", fontSize: ctx.isGlass ? "19px" : "30px", lineHeight: 1.4, color: ctx.inkPrimary }}>
          {internalQuote}
        </div>
        <div style={{ backgroundColor: PAGE_PALETTE.riskFill, border: `2px solid ${PAGE_PALETTE.brickRed}`, borderRadius: "10px", padding: "38px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.mono, fontSize: "34px", fontWeight: 700, color: PAGE_PALETTE.brickRed, textAlign: "center", ...TABULAR_NUM_STYLE }}>
          {marketShareFigure}
        </div>
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// 24. EvidenceCorkboardChronology (4-Pin Dated Chronology + Taut Red String)
// ============================================================================
export interface ChronologyPin {
  year: string;
  event: string;
  figure: string;
}

export interface EvidenceCorkboardChronologyProps extends BaseForensicProps {
  pins?: ChronologyPin[];
}

export const EvidenceCorkboardChronology: React.FC<EvidenceCorkboardChronologyProps> = ({
  pins = [
    { year: "1971", event: "Gold Window Closed", figure: "$35/oz Ended" },
    { year: "2008", event: "QE Balance-Sheet Floor", figure: "$4.5T Base" },
    { year: "2020", event: "Fiscal-Monetary Merge", figure: "+$9.0T Surge" },
    { year: "2026", event: "AI Wage Replacement", figure: "84% Tax Trap" },
  ],
  ...base
}) => (
  <ForensicStageFrame
    defaultDocket="CHRONOLOGICAL CAUSAL CHAIN · PRIMARY RECEIPTS"
    defaultTitle="Four Structural Locks Leading to the Allowance Economy"
    defaultVerdict="CAUSAL CHAIN"
    defaultCitation="Reading Room Primary-Source Synthesis"
    {...base}
  >
    {(ctx) => (
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr 1fr" : "repeat(4, 1fr)", gap: "22px", alignItems: "center", height: "100%" }}>
        {!ctx.isGlass && (
          <svg viewBox="0 0 1560 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <line x1={160} y1={180} x2={160 + 1240 * ctx.progress} y2={180} stroke={PAGE_PALETTE.brickRed} strokeWidth="3.5" />
          </svg>
        )}
        {pins.map((p, i) => (
          <div key={`ecc-${p.year}-${i}`} style={{ position: "relative", zIndex: 1, backgroundColor: ctx.bgElevated, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "28px", textAlign: "center" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: PAGE_PALETTE.brickRed, margin: "0 auto 12px auto" }} />
            <div style={{ fontFamily: FONTS.mono, fontSize: "24px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>{p.year}</div>
            <div style={{ fontFamily: FONTS.serif, fontSize: "22px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "8px" }}>{p.event}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "15px", color: ctx.inkSecondary, marginTop: "10px", ...TABULAR_NUM_STYLE }}>{p.figure}</div>
          </div>
        ))}
      </div>
    )}
  </ForensicStageFrame>
);

// ============================================================================
// FORENSIC_EXHIBIT_STYLES Registry (24 Legal, Primary-Source & Collision Stages)
// ============================================================================
export interface ForensicExhibitStyleRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
}

export const FORENSIC_EXHIBIT_STYLES: readonly ForensicExhibitStyleRecipe[] = [
  { id: "forensic-fiscal-ledger-table", name: "Treasury & CBO Multi-Row Ledger Stage", componentName: "FiscalLedgerTableStage", defaultFraming: "fullscreen-cutaway", description: "Multi-row statutory table inspector with chisel-nib row sweep, delta badges, and vertical pan." },
  { id: "forensic-claim-vs-reality-collision", name: "Claim vs. Contractual Reality Collision", componentName: "ClaimVsRealityCollision", defaultFraming: "fullscreen-cutaway", description: "Public post/podcast promise colliding against nominal ACH drafts and CBO $2.1T interest wall." },
  { id: "forensic-supreme-court-syllabus", name: "Supreme Court Syllabus & Veto Bar Drop", componentName: "SupremeCourtSyllabusStage", defaultFraming: "fullscreen-cutaway", description: "Judicial holding (Wielechowski v. State) paired with $3,900 -> $1,000 payout bar drop." },
  { id: "forensic-escape-hatch-switchboard", name: "Persistent 3-Bay Escape-Hatch Switchboard", componentName: "EscapeHatchSwitchboard", defaultFraming: "fullscreen-cutaway", description: "Monotonic 3-bay investigation board locking heavy brick-red failure stamps onto prior bays." },
  { id: "forensic-archival-ration-book-1941", name: "1941 16-Coupon Ration Book vs. Idle Cash", componentName: "ArchivalRationBook1941", defaultFraming: "fullscreen-cutaway", description: "16 perforated ration coupons stamping VOID while unspent sterling notes sit unusable." },
  { id: "forensic-foia-redaction-declassify", name: "FOIA Exemption (b)(4) Selective Unseal", componentName: "FoiaRedactionDeclassify", defaultFraming: "fullscreen-cutaway", description: "Declassified government memorandum peeling back redaction bars over key dollar commitments." },
  { id: "forensic-sec-10k-footnote-stretch", name: "SEC Form 10-K Useful-Life Footnote Stretch", componentName: "Sec10KFootnoteStretch", defaultFraming: "fullscreen-cutaway", description: "Accounting policy footnote stretching server depreciation from 3 years to 6 years." },
  { id: "forensic-bdc-pik-schedule", name: "Private Credit BDC PIK Schedule Exhibit", componentName: "BdcPikScheduleExhibit", defaultFraming: "fullscreen-cutaway", description: "Form 10-Q Schedule of Investments exposing 11.5% Payment-in-Kind capitalized IOUs." },
  { id: "forensic-statutory-clause-highlighter", name: "Engraved Statutory Clause + Brass Loupe", componentName: "StatutoryClauseHighlighter", defaultFraming: "fullscreen-cutaway", description: "U.S. Code statutory text with chisel-nib highlighter sweep and 2x achromatic optical loupe." },
  { id: "forensic-insurance-rate-hike-notice", name: "Carrier Non-Renewal & +222% Escrow Notice", componentName: "InsuranceRateHikeNotice", defaultFraming: "fullscreen-cutaway", description: "Aerial roof-score non-renewal notice showing $2,140 to $6,890 hazard premium jump." },
  { id: "forensic-irs-form-941-fica-split", name: "IRS Form 941 Bilateral 15.3% FICA Gate", componentName: "IrsForm941FicaSplit", defaultFraming: "fullscreen-cutaway", description: "Official quarterly payroll tax return contrasting 15.3% human FICA with 0% API compute." },
  { id: "forensic-subsea-sabotage-incident-log", name: "Subsea Fiber Cut & AIS Anchor-Drag Log", componentName: "SubseaSabotageIncidentLog", defaultFraming: "fullscreen-cutaway", description: "UTC maritime fault log correlating -38 dB optical loss with seabed anchor-drag tracks." },
  { id: "forensic-congressional-hearing-slate", name: "Senate Finance Sworn Testimony Slate", componentName: "CongressionalHearingSlate", defaultFraming: "fullscreen-cutaway", description: "Committee hearing record framing sworn fiscal baseline testimony." },
  { id: "forensic-treasury-tic-ledger", name: "Treasury TIC Foreign vs. Custodial Ledger", componentName: "TreasuryTicLedgerExhibit", defaultFraming: "fullscreen-cutaway", description: "TIC Schedule comparing central-bank reserve retreat against private stablecoin T-bill demand." },
  { id: "forensic-spv-circular-flow", name: "Off-Balance-Sheet SPV Circular Deal Sheet", componentName: "SpvCircularFlowSheet", defaultFraming: "fullscreen-cutaway", description: "Three-node forensic audit of vendor-equity-to-GPU-debt round-trip revenue." },
  { id: "forensic-fannie-mae-covenant", name: "Fannie Mae Hazard Covenant Breach Audit", componentName: "FannieMaeCovenantExhibit", defaultFraming: "fullscreen-cutaway", description: "Secondary mortgage collateral insurance compliance checklist." },
  { id: "forensic-redline-contract-diff", name: "Blackline Statutory & Terms Diff Stage", componentName: "RedlineContractDiffStage", defaultFraming: "fullscreen-cutaway", description: "Legal strikeout-and-insertion redline replacing unrestricted cash with expiring credits." },
  { id: "forensic-patent-filing-1910", name: "Archival Patent Royalty Assignment Plate", componentName: "PatentFiling1910Stage", defaultFraming: "fullscreen-cutaway", description: "Historical patent specification proving machine ownership captures surplus." },
  { id: "forensic-bank-call-report-t-account", name: "FDIC Schedule RC HTM Loss T-Account", componentName: "BankCallReportTAccount", defaultFraming: "fullscreen-cutaway", description: "Bilateral banking T-account contrasting -$482B unrealized bond losses with Tier-1 equity." },
  { id: "forensic-veto-pen-budget-ledger", name: "Executive Line-Item Veto Appropriations Bill", componentName: "VetoPenBudgetLedger", defaultFraming: "fullscreen-cutaway", description: "Red veto pen strike slashing statutory dividend appropriations to plug deficits." },
  { id: "forensic-ach-autopay-draft-receipt", name: "Household ACH Autopay Settlement Receipt", componentName: "AchAutopayDraftReceipt", defaultFraming: "fullscreen-cutaway", description: "Monthly checking clearinghouse slip showing fixed drafts draining gross pay." },
  { id: "forensic-credit-rating-downgrade-memo", name: "Sovereign Credit Downgrade Memorandum", componentName: "CreditRatingDowngradeMemo", defaultFraming: "fullscreen-cutaway", description: "Credit committee downgrade action memo citing interest-to-revenue thresholds." },
  { id: "forensic-antitrust-market-exhibit", name: "Federal Antitrust Trial Exhibit 402", componentName: "AntitrustMarketExhibit", defaultFraming: "fullscreen-cutaway", description: "Evidentiary discovery quote paired with 89.4% bottleneck share lock." },
  { id: "forensic-evidence-corkboard-chronology", name: "Four-Pin Causal Chronology String Board", componentName: "EvidenceCorkboardChronology", defaultFraming: "fullscreen-cutaway", description: "Dated primary-source receipts linked across decades by taut brick-red vector string." },
] as const;
