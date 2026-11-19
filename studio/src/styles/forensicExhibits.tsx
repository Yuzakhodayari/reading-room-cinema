import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fitSvgTextToWidth, FontMetricFamily } from "../design/fitText";
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

export interface ForensicRenderContext {
  elapsed: number;
  enter: number;
  progress: number;
  settleProgress: number;
  isGlass: boolean;
  isDark: boolean;
  registerId: RegisterId;
  viewW: number;
  viewH: number;
  inkPrimary: string;
  inkSecondary: string;
  inkMuted: string;
  ruleHairline: string;
  ruleOxford: string;
  accentLiability: string;
  accentLiabilityStroke: string;
  accentSolvent: string;
  accentCapital: string;
  accentStatutory: string;
  bgElevated: string;
  bgRecessed: string;
  riskFill: string;
  riskBorder: string;
  highlighterWash: string;
  solidBadgeInk: string;
}

interface ForensicStageFrameProps extends BaseForensicProps {
  defaultTitle: string;
  defaultSubtitle?: string;
  defaultDocket: string;
  defaultVerdict: string;
  defaultCitation: string;
  panVerticalPx?: number;
  children: (ctx: ForensicRenderContext) => React.ReactNode;
}

interface FittedSvgLabelProps {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  minFontSize?: number;
  fontKind?: FontMetricFamily;
  fontFamily: string;
  fontWeight?: number | string;
  fill: string;
  textAnchor?: "start" | "middle" | "end";
  opacity?: number;
}

const FittedSvgLabel: React.FC<FittedSvgLabelProps> = ({
  text,
  x,
  y,
  maxWidth,
  fontSize,
  minFontSize,
  fontKind = "mono",
  fontFamily,
  fontWeight = 700,
  fill,
  textAnchor = "start",
  opacity = 1,
}) => {
  const fitted = fitSvgTextToWidth(
    text,
    Math.max(16, maxWidth),
    fontSize,
    minFontSize ?? Math.max(9, fontSize * 0.68),
    fontKind,
    { fontWeight }
  );
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fontFamily={fontFamily}
      fontSize={fitted.fontSize}
      fontWeight={fontWeight}
      fill={fill}
      opacity={opacity}
      style={TABULAR_NUM_STYLE}
    >
      {fitted.text}
    </text>
  );
};

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
  const settleProgress = interpolate(progress, [0.1, 0.56], [0, 1], CLAMP);

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
          padding: "24px 26px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 24px 52px rgba(15, 25, 35, 0.44)",
          opacity: enter,
          transform: `translate3d(${((1 - enter) * 30).toFixed(2)}px, 0, 0)`,
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: OVER_FOOTAGE_PALETTE.accentPrimary,
            opacity: 0.72,
          }}
        />
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11.5px",
                fontWeight: 700,
                color: OVER_FOOTAGE_PALETTE.accentPrimary,
                letterSpacing: "0.08em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {resolvedDocket}
            </span>
            <span
              style={{
                backgroundColor: OVER_FOOTAGE_PALETTE.brickRedFill,
                color: OVER_FOOTAGE_PALETTE.textHeadline,
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 9px",
                borderRadius: "4px",
                flexShrink: 0,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {resolvedVerdict}
            </span>
          </div>
          <h2
            style={{
              margin: "10px 0 0 0",
              fontFamily: FONTS.serif,
              fontSize: "24px",
              fontWeight: 700,
              lineHeight: 1.18,
              color: OVER_FOOTAGE_PALETTE.textHeadline,
              textShadow: OVER_FOOTAGE_PALETTE.textShadow,
            }}
          >
            {resolvedTitle}
          </h2>
          {resolvedSub && (
            <div style={{ marginTop: "5px", fontFamily: FONTS.sans, fontSize: "14px", color: OVER_FOOTAGE_PALETTE.textBody, lineHeight: 1.38 }}>
              {resolvedSub}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 0, marginTop: "14px", marginBottom: "12px", overflow: "hidden", position: "relative" }}>
          {children({
            elapsed,
            enter,
            progress,
            settleProgress,
            isGlass: true,
            isDark: true,
            registerId: register,
            viewW: 600,
            viewH: 380,
            inkPrimary: OVER_FOOTAGE_PALETTE.textHeadline,
            inkSecondary: OVER_FOOTAGE_PALETTE.textBody,
            inkMuted: OVER_FOOTAGE_PALETTE.textMuted,
            ruleHairline: OVER_FOOTAGE_PALETTE.glassInnerHairline,
            ruleOxford: OVER_FOOTAGE_PALETTE.accentPrimary,
            accentLiability: OVER_FOOTAGE_PALETTE.brickRedText,
            accentLiabilityStroke: OVER_FOOTAGE_PALETTE.brickRedFill,
            accentSolvent: OVER_FOOTAGE_PALETTE.chartSecondary,
            accentCapital: OVER_FOOTAGE_PALETTE.accentWarm,
            accentStatutory: OVER_FOOTAGE_PALETTE.accentPrimary,
            bgElevated: OVER_FOOTAGE_PALETTE.glassDarkWell,
            bgRecessed: "rgba(15, 25, 35, 0.62)",
            riskFill: OVER_FOOTAGE_PALETTE.riskFill,
            riskBorder: OVER_FOOTAGE_PALETTE.riskBorder,
            highlighterWash: OVER_FOOTAGE_PALETTE.highlightSweep,
            solidBadgeInk: "#FFF6E5",
          })}
        </div>

        <div
          style={{
            borderTop: `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`,
            paddingTop: "10px",
            fontFamily: FONTS.mono,
            fontSize: "11.5px",
            color: OVER_FOOTAGE_PALETTE.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          § {resolvedCite}
        </div>
      </div>
    );
  }

  const pal = resolveRegisterPalette(register);
  const panY = interpolate(progress, [0, 1], [0, panVerticalPx], CLAMP);
  const enterY = interpolate(enter, [0, 1], [28, 0]);
  const cardShadow = pal.isDark
    ? "0 24px 52px -14px rgba(4, 8, 14, 0.56), 0 4px 16px rgba(4, 8, 14, 0.36)"
    : "0 24px 52px -14px rgba(28, 43, 58, 0.16), 0 4px 16px rgba(28, 43, 58, 0.06)";
  const riskFill = pal.isDark ? "rgba(232, 93, 78, 0.16)" : PAGE_PALETTE.riskFill;
  const riskBorder = pal.isDark ? pal.accent.liabilityStroke : PAGE_PALETTE.riskBorder;
  const badgeFill = pal.isDark ? pal.accent.liabilityStroke : pal.rule.oxford;

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
          top: 94,
          bottom: 70,
          display: "flex",
          flexDirection: "column",
          opacity: enter,
          transform: `translate3d(0, ${(enterY + panY).toFixed(2)}px, 0)`,
          userSelect: "none",
        }}
      >
        {/* Elevated Broadcast Exhibit Card */}
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            backgroundColor: pal.bg.elevated,
            border: `1px solid ${pal.rule.hairline}`,
            borderRadius: "12px",
            boxShadow: cardShadow,
            padding: "28px 42px 24px 42px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* 4px Top Accent Rule */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              backgroundColor: pal.isDark ? pal.accent.statutory : pal.rule.oxford,
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "32px",
              paddingBottom: "16px",
              borderBottom: `2px solid ${pal.rule.oxford}`,
              flexShrink: 0,
            }}
          >
            <div style={{ maxWidth: "1240px", minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: pal.accent.liability,
                  marginBottom: "5px",
                  textTransform: "uppercase",
                }}
              >
                {resolvedDocket}
              </div>
              <h1 style={{ margin: 0, fontFamily: FONTS.serif, fontSize: "38px", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.01em", color: pal.ink.primary }}>
                {resolvedTitle}
              </h1>
              {resolvedSub && (
                <div style={{ marginTop: "6px", fontFamily: FONTS.sans, fontSize: "17.5px", color: pal.ink.secondary, lineHeight: 1.35, ...TABULAR_NUM_STYLE }}>
                  {resolvedSub}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
              <div
                style={{
                  backgroundColor: badgeFill,
                  color: "#FAF8F3",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontFamily: FONTS.mono,
                  fontSize: "19px",
                  fontWeight: 700,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {resolvedVerdict}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  color: pal.ink.muted,
                  maxWidth: "340px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {resolvedCite}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, marginTop: "20px", position: "relative" }}>
            {children({
              elapsed,
              enter,
              progress,
              settleProgress,
              isGlass: false,
              isDark: pal.isDark,
              registerId: pal.id,
              viewW: 1560,
              viewH: 620,
              inkPrimary: pal.ink.primary,
              inkSecondary: pal.ink.secondary,
              inkMuted: pal.ink.muted,
              ruleHairline: pal.rule.hairline,
              ruleOxford: pal.rule.oxford,
              accentLiability: pal.accent.liability,
              accentLiabilityStroke: pal.accent.liabilityStroke,
              accentSolvent: pal.accent.solvent,
              accentCapital: pal.accent.capital,
              accentStatutory: pal.accent.statutory,
              bgElevated: pal.bg.elevated,
              bgRecessed: pal.bg.recessed,
              riskFill,
              riskBorder,
              highlighterWash: pal.accent.highlighterWash,
              solidBadgeInk: "#FAF8F3",
            })}
          </div>
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
      {(ctx) => {
        if (ctx.isGlass) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%", justifyContent: "space-between" }}>
              {rows.map((r, i) => (
                <div
                  key={`fltg-${r.lineCode}-${i}`}
                  style={{
                    backgroundColor: r.highlighted ? ctx.riskFill : ctx.bgElevated,
                    border: `1px solid ${r.highlighted ? ctx.riskBorder : ctx.ruleHairline}`,
                    borderRadius: "8px",
                    padding: "11px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, color: ctx.inkMuted }}>
                      {r.lineCode}{r.statuteNote ? ` · ${r.statuteNote}` : ""}
                    </div>
                    <div style={{ fontFamily: FONTS.sans, fontSize: "15px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "2px", lineHeight: 1.25 }}>
                      {r.category}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: "18px", fontWeight: 700, color: r.highlighted ? ctx.accentLiability : ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
                      {r.currentValue}
                    </div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: "11.5px", fontWeight: 700, color: r.highlighted ? ctx.accentLiability : ctx.inkMuted, ...TABULAR_NUM_STYLE }}>
                      {r.deltaBadge}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        return (
          <div style={{ backgroundColor: ctx.bgRecessed, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "10px", padding: "22px 28px", display: "flex", flexDirection: "column", gap: "10px", height: "100%", boxSizing: "border-box", justifyContent: "space-between" }}>
            <div style={{ display: "grid", gridTemplateColumns: "90px 1.6fr 0.7fr 0.7fr 0.85fr", paddingBottom: "10px", borderBottom: `2px solid ${ctx.ruleOxford}`, fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.inkMuted, letterSpacing: "0.08em" }}>
              <span>CODE</span>
              <span>STATUTORY LINE ITEM</span>
              <span style={{ textAlign: "right" }}>PRIOR FY</span>
              <span style={{ textAlign: "right" }}>AUDITED</span>
              <span style={{ textAlign: "right" }}>DELTA / SHARE</span>
            </div>

            {rows.map((r, i) => {
              const rowSweep = interpolate(ctx.elapsed, [8 + i * 4, 24 + i * 4], [0, 1], CLAMP);
              return (
                <div
                  key={`flt-${r.lineCode}-${i}`}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "90px 1.6fr 0.7fr 0.7fr 0.85fr",
                    alignItems: "center",
                    padding: "16px 12px",
                    borderRadius: "6px",
                    backgroundColor: r.highlighted ? ctx.bgElevated : "transparent",
                    borderBottom: `1px solid ${ctx.ruleHairline}`,
                  }}
                >
                  {r.highlighted && (
                    <div style={{ position: "absolute", left: "96px", top: "10px", zIndex: 0 }}>
                      <HighlighterStroke width={520} height={34} progress={rowSweep} register={ctx.registerId} seed={17 + i} />
                    </div>
                  )}
                  <span style={{ position: "relative", zIndex: 1, fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: ctx.inkMuted, ...TABULAR_NUM_STYLE }}>
                    {r.lineCode}
                  </span>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontFamily: FONTS.sans, fontSize: "20px", fontWeight: 700, color: ctx.inkPrimary }}>
                      {r.category}
                    </div>
                    {r.statuteNote && (
                      <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: ctx.accentStatutory, marginTop: "2px" }}>
                        {r.statuteNote}
                      </div>
                    )}
                  </div>
                  <span style={{ position: "relative", zIndex: 1, textAlign: "right", fontFamily: FONTS.mono, fontSize: "21px", color: ctx.inkSecondary, ...TABULAR_NUM_STYLE }}>
                    {r.priorValue}
                  </span>
                  <span style={{ position: "relative", zIndex: 1, textAlign: "right", fontFamily: FONTS.mono, fontSize: "24px", fontWeight: 700, color: r.highlighted ? ctx.accentLiability : ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
                    {r.currentValue}
                  </span>
                  <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        backgroundColor: r.highlighted ? ctx.accentLiabilityStroke : ctx.bgRecessed,
                        border: `1px solid ${r.highlighted ? ctx.accentLiabilityStroke : ctx.ruleHairline}`,
                        color: r.highlighted ? "#FAF8F3" : ctx.inkSecondary,
                        fontFamily: FONTS.mono,
                        fontSize: "12.5px",
                        fontWeight: 700,
                        ...TABULAR_NUM_STYLE,
                      }}
                    >
                      {r.deltaBadge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }}
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
        const collide = interpolate(ctx.settleProgress, [0, 0.85], [38, 0], CLAMP);
        return (
          <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr", gap: ctx.isGlass ? "14px" : "28px", height: "100%", alignItems: "stretch", position: "relative" }}>
            <div
              style={{
                backgroundColor: ctx.bgRecessed,
                border: `1.5px solid ${ctx.ruleOxford}`,
                borderRadius: "12px",
                padding: ctx.isGlass ? "16px 18px" : "34px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: `translate3d(${(-collide).toFixed(1)}px, 0, 0)`,
              }}
            >
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentStatutory, letterSpacing: "0.08em" }}>
                  ● {speakerHandle}
                </div>
                <div style={{ fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "17px" : "21px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "6px" }}>
                  {speakerName}
                </div>
                <blockquote style={{ margin: ctx.isGlass ? "10px 0 0 0" : "22px 0 0 0", fontFamily: FONTS.serif, fontStyle: "italic", fontSize: ctx.isGlass ? "16px" : "29px", lineHeight: 1.35, color: ctx.inkPrimary }}>
                  {claimText}
                </blockquote>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: ctx.inkMuted, marginTop: "8px" }}>
                {claimDate}
              </div>
            </div>

            <div
              style={{
                backgroundColor: ctx.riskFill,
                border: `2px solid ${ctx.accentLiabilityStroke}`,
                borderRadius: "12px",
                padding: ctx.isGlass ? "16px 18px" : "34px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: `translate3d(${collide.toFixed(1)}px, 0, 0)`,
              }}
            >
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentLiability, letterSpacing: "0.1em" }}>
                  ■ {realityTitle}
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "21px" : "38px", fontWeight: 700, color: ctx.accentLiability, marginTop: ctx.isGlass ? "8px" : "16px", lineHeight: 1.14, overflowWrap: "break-word", ...TABULAR_NUM_STYLE }}>
                  {realityFigure}
                </div>
                <p style={{ margin: ctx.isGlass ? "8px 0 0 0" : "18px 0 0 0", fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "14.5px" : "20px", lineHeight: 1.46, color: ctx.inkPrimary }}>
                  {realityDetail}
                </p>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentLiability, marginTop: "8px" }}>
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
// 3. SupremeCourtSyllabusStage (Museum-Grade Judicial Exhibit + PFD Sparkline)
// ============================================================================
export interface SupremeCourtSyllabusStageProps extends BaseForensicProps {
  caseCaption?: string;
  citationNumber?: string;
  voteSplit?: string;
  holdingSummary?: string;
  formulaPayout?: number;
  actualPayout?: number;
}

const JudicialBalanceSealSvg: React.FC<{ stroke: string; accent: string; size?: number }> = ({
  stroke,
  accent,
  size = 52,
}) => (
  <svg width={size} height={size} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
    <circle cx={28} cy={28} r={25} fill="none" stroke={accent} strokeWidth="2" />
    <circle cx={28} cy={28} r={21} fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="3 2" />
    {/* Balance Beam */}
    <line x1={28} y1={12} x2={28} y2={42} stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
    <line x1={18} y1={42} x2={38} y2={42} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
    <line x1={14} y1={20} x2={42} y2={20} stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
    {/* Left & Right Pans */}
    <path d="M 14 20 L 10 30 L 18 30 Z" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M 10 30 Q 14 34 18 30" fill={accent} opacity={0.45} stroke={stroke} strokeWidth="1.4" />
    <path d="M 42 20 L 38 30 L 46 30 Z" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M 38 30 Q 42 34 46 30" fill={accent} opacity={0.45} stroke={stroke} strokeWidth="1.4" />
    <circle cx={28} cy={14} r={2.4} fill={accent} />
  </svg>
);

export const SupremeCourtSyllabusStage: React.FC<SupremeCourtSyllabusStageProps> = ({
  caseCaption = "Wielechowski v. State of Alaska",
  citationNumber = "403 P.3d 1141 (Alaska 2017)",
  voteSplit,
  holdingSummary = "Statutory dividend formulas do not bind annual legislative appropriations; resource dividends remain subject to executive line-item veto whenever state fiscal deficits widen.",
  formulaPayout,
  actualPayout,
  ...base
}) => {
  // Align 2016 Wielechowski ($2,052 -> $1,022, -50%) vs 2025 ($3,900 -> $1,000, -74%) coherently
  const badgeOrTitleHints2016 =
    base.verdictBadge?.includes("-50") ||
    voteSplit?.includes("-50") ||
    /2016/.test(`${caseCaption} ${base.title ?? ""} ${base.sourceCitation ?? ""}`);

  const resolvedFormula =
    formulaPayout !== undefined
      ? formulaPayout
      : badgeOrTitleHints2016 && actualPayout === undefined
      ? 2052
      : 3900;

  const resolvedActual =
    actualPayout !== undefined
      ? actualPayout
      : badgeOrTitleHints2016 && formulaPayout === undefined
      ? 1022
      : 1000;

  const cutPct = Math.round(((resolvedActual - resolvedFormula) / Math.max(1, resolvedFormula)) * 100);
  const cutLabel = `${cutPct}%`;
  const resolvedVerdict =
    base.verdictBadge && !/^-?\d+%$/.test(base.verdictBadge.trim())
      ? base.verdictBadge
      : voteSplit && !/^-?\d+%$/.test(voteSplit.trim())
      ? voteSplit
      : `VETO CUT: ${cutLabel}`;

  const sparkMilestones: ReadonlyArray<{ yr: string; usd: number }> = [
    { yr: "1982", usd: 1000 },
    { yr: "2008", usd: 2069 },
    { yr: "2015", usd: 2072 },
    { yr: "2016", usd: 1022 },
    { yr: "2025", usd: 1000 },
  ];

  return (
    <ForensicStageFrame
      defaultDocket={`SUPREME COURT SYLLABUS · ${citationNumber}`}
      defaultTitle={caseCaption}
      defaultVerdict={resolvedVerdict}
      defaultCitation={`${caseCaption}, ${citationNumber} · Permanent Fund Dividend Veto`}
      {...base}
      verdictBadge={resolvedVerdict}
    >
      {(ctx) => {
        const dropMix = interpolate(ctx.progress, [0.12, 0.56], [0, 1], CLAMP);
        const currentBarVal = Math.round(resolvedFormula - (resolvedFormula - resolvedActual) * dropMix);
        const sweepProgress = interpolate(ctx.progress, [0.22, 0.58], [0, 1], CLAMP);

        if (ctx.isGlass) {
          const barW = 540;
          const barH = 165;
          const leftBarH = 104;
          const rightBarH = Math.max(22, (currentBarVal / Math.max(1, resolvedFormula)) * leftBarH);

          return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", gap: "10px" }}>
              {/* Compact Docket Header & 3-Row Ledger */}
              <div style={{ backgroundColor: ctx.bgElevated, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <JudicialBalanceSealSvg stroke={ctx.inkPrimary} accent={ctx.accentCapital} size={36} />
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, color: ctx.accentStatutory }}>ALASKA SUPREME COURT (EN BANC)</div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: ctx.inkMuted, ...TABULAR_NUM_STYLE }}>{citationNumber}</div>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${ctx.ruleHairline}`, paddingTop: "6px", fontFamily: FONTS.mono, fontSize: "11.5px", color: ctx.accentCapital }}>
                  CLAUSE: Alaska Const. art. IX, § 15
                </div>
                <p style={{ margin: "8px 0 0 0", fontFamily: FONTS.serif, fontSize: "14.5px", lineHeight: 1.38, color: ctx.inkPrimary }}>
                  {holdingSummary}
                </p>
              </div>

              {/* Compact Comparative Bar Drop + Sparkline Readout */}
              <div style={{ backgroundColor: ctx.bgRecessed, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "8px", padding: "10px 12px" }}>
                <svg viewBox={`0 0 ${barW} ${barH}`} style={{ width: "100%", height: "152px", display: "block" }}>
                  <line x1={24} y1={134} x2={barW - 24} y2={134} stroke={ctx.ruleOxford} strokeWidth="2" />
                  {/* Statutory Bar */}
                  <rect x={84} y={134 - leftBarH} width={116} height={leftBarH} rx={5} fill={ctx.accentStatutory} />
                  <FittedSvgLabel text={`$${resolvedFormula.toLocaleString()}`} x={142} y={134 - leftBarH - 8} maxWidth={140} fontSize={18} fontFamily={FONTS.mono} fill={ctx.inkPrimary} textAnchor="middle" />
                  <FittedSvgLabel text="STATUTORY" x={142} y={156} maxWidth={150} fontSize={14.5} fontFamily={FONTS.mono} fill={ctx.inkSecondary} textAnchor="middle" />

                  {/* Reference Line */}
                  <line x1={200} y1={134 - leftBarH} x2={340} y2={134 - leftBarH} stroke={ctx.accentLiability} strokeWidth="1.6" strokeDasharray="5 4" />

                  {/* Appropriated Veto Bar */}
                  <rect x={340} y={134 - rightBarH} width={116} height={rightBarH} rx={5} fill={ctx.accentLiability} />
                  <FittedSvgLabel text={`$${currentBarVal.toLocaleString()}`} x={398} y={134 - rightBarH - 8} maxWidth={140} fontSize={19} fontFamily={FONTS.mono} fill={ctx.accentLiability} textAnchor="middle" />
                  <FittedSvgLabel text={`AFTER VETO (${cutLabel})`} x={398} y={156} maxWidth={190} fontSize={14.5} fontFamily={FONTS.mono} fill={ctx.accentLiability} textAnchor="middle" />
                </svg>
                <div style={{ borderTop: `1px solid ${ctx.ruleHairline}`, paddingTop: "6px", fontFamily: FONTS.mono, fontSize: "11.5px", color: ctx.inkMuted, textAlign: "center", ...TABULAR_NUM_STYLE }}>
                  PFD EROSION: 2015 $2,072 → 2016 $1,022 → 2025 $1,000
                </div>
              </div>
            </div>
          );
        }

        // Fullscreen Museum-Grade Judicial Exhibit (Page Mode)
        const barSvgW = 480;
        const barSvgH = 264;
        const barBaseY = 224;
        const maxBarH = 160;
        const leftH = maxBarH;
        const rightH = Math.max(26, (currentBarVal / Math.max(1, resolvedFormula)) * maxBarH);

        const spW = 480;
        const spH = 148;
        const spPadL = 36;
        const spPadR = 36;
        const spBaseY = 104;
        const spTopY = 28;
        const spMaxUsd = 2300;
        const spX = (idx: number): number => spPadL + (idx / (sparkMilestones.length - 1)) * (spW - spPadL - spPadR);
        const spY = (usd: number): number => spBaseY - (usd / spMaxUsd) * (spBaseY - spTopY);
        const spPts = sparkMilestones.map((m, idx) => `${idx === 0 ? "M" : "L"} ${spX(idx).toFixed(1)} ${spY(m.usd).toFixed(1)}`).join(" ");
        const spEv = evolvePath(ctx.settleProgress, spPts);

        return (
          <div style={{ display: "grid", gridTemplateColumns: "1.22fr 0.78fr", gap: "28px", height: "100%" }}>
            {/* LEFT COLUMN: Official Judicial Docket & Syllabus Plate */}
            <div
              style={{
                backgroundColor: ctx.bgRecessed,
                border: `1.5px solid ${ctx.ruleOxford}`,
                borderRadius: "10px",
                padding: "26px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              {/* Court Header + Brass/Ink Balance Seal */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${ctx.ruleOxford}`, paddingBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <JudicialBalanceSealSvg stroke={ctx.ruleOxford} accent={ctx.accentCapital} size={54} />
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: ctx.accentStatutory }}>
                      SUPREME COURT OF THE STATE OF ALASKA
                    </div>
                    <div style={{ fontFamily: FONTS.serif, fontSize: "22px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "2px" }}>
                      Syllabus of the Court · Constitutional Appropriations Clause
                    </div>
                  </div>
                </div>
              </div>

              {/* Structured 3-Row Docket Ledger */}
              <div
                style={{
                  backgroundColor: ctx.bgElevated,
                  border: `1px solid ${ctx.ruleHairline}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {[
                  { k: "COURT", v: "Alaska Supreme Court (En Banc · Slip Opinion)" },
                  { k: "DOCKET / CITATION", v: citationNumber },
                  { k: "CONTROLLING CLAUSE", v: "Alaska Const. art. IX, § 15 (Dedicated Funds & Veto Power)" },
                ].map((row, idx) => (
                  <div
                    key={`sc-row-${row.k}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "190px 1fr",
                      alignItems: "center",
                      padding: "10px 16px",
                      borderBottom: idx < 2 ? `1px solid ${ctx.ruleHairline}` : "none",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontFamily: FONTS.mono, fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", color: ctx.inkMuted }}>
                      {row.k}
                    </span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: "14px", fontWeight: 700, color: idx === 2 ? ctx.accentLiability : ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>

              {/* Syllabus Holding With Animated Yellow Highlighter Sweep */}
              <div
                style={{
                  position: "relative",
                  backgroundColor: ctx.bgElevated,
                  border: `1px solid ${ctx.ruleHairline}`,
                  borderLeft: `5px solid ${ctx.accentStatutory}`,
                  borderRadius: "8px",
                  padding: "20px 24px",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div style={{ position: "relative", width: "100%" }}>
                  <div style={{ position: "absolute", left: 0, top: "42px", zIndex: 0 }}>
                    <HighlighterStroke width={680} height={34} progress={sweepProgress} register={ctx.registerId} seed={33} />
                  </div>
                  <p style={{ position: "relative", zIndex: 1, margin: 0, fontFamily: FONTS.serif, fontSize: "23.5px", lineHeight: 1.44, color: ctx.inkPrimary }}>
                    “{holdingSummary}”
                  </p>
                </div>
              </div>

              {/* Precedent Rule Callout */}
              <div
                style={{
                  backgroundColor: ctx.riskFill,
                  border: `1px solid ${ctx.riskBorder}`,
                  borderRadius: "6px",
                  padding: "12px 16px",
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: ctx.accentLiability,
                  letterSpacing: "0.04em",
                }}
              >
                PRECEDENT: SOVEREIGN DEFICITS OVERRIDE UNIVERSAL DIVIDEND FORMULAS
              </div>
            </div>

            {/* RIGHT COLUMN: Comparative Payout Drop + 1982-2025 PFD Erosion Sparkline */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
              {/* Comparative Bar Drop Card */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: ctx.bgRecessed,
                  border: `1.5px solid ${ctx.ruleOxford}`,
                  borderRadius: "10px",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: ctx.inkMuted }}>
                    STATUTORY FORMULA VS. APPROPRIATED PAYOUT
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>
                    {cutLabel} CUT
                  </span>
                </div>

                <svg viewBox={`0 0 ${barSvgW} ${barSvgH}`} style={{ width: "100%", height: "252px" }}>
                  {[0, 0.5, 1].map((u, idx) => {
                    const gy = barBaseY - u * maxBarH;
                    const gVal = Math.round(u * resolvedFormula);
                    return (
                      <g key={`sc-bg-${idx}`}>
                        <line x1={68} y1={gy} x2={barSvgW - 24} y2={gy} stroke={ctx.ruleHairline} strokeWidth="1" strokeDasharray={idx === 0 ? undefined : "4 4"} />
                        <FittedSvgLabel text={`$${gVal.toLocaleString()}`} x={60} y={gy + 4} maxWidth={56} fontSize={12} fontFamily={FONTS.mono} fontWeight={500} fill={ctx.inkMuted} textAnchor="end" />
                      </g>
                    );
                  })}

                  <line x1={68} y1={barBaseY} x2={barSvgW - 24} y2={barBaseY} stroke={ctx.ruleOxford} strokeWidth="2" />

                  {/* Statutory Bar */}
                  <rect x={118} y={barBaseY - leftH} width={104} height={leftH} rx={5} fill={ctx.accentStatutory} />
                  <FittedSvgLabel text={`$${resolvedFormula.toLocaleString()}`} x={170} y={barBaseY - leftH - 12} maxWidth={140} fontSize={22} fontFamily={FONTS.mono} fill={ctx.inkPrimary} textAnchor="middle" />
                  <FittedSvgLabel text="STATUTORY" x={170} y={barBaseY + 26} maxWidth={140} fontSize={13.5} fontFamily={FONTS.mono} fill={ctx.inkSecondary} textAnchor="middle" />

                  {/* Dashed Drop Guide + Arrow */}
                  <line x1={222} y1={barBaseY - leftH} x2={382} y2={barBaseY - leftH} stroke={ctx.accentLiability} strokeWidth="1.8" strokeDasharray="5 4" />
                  <line x1={330} y1={barBaseY - leftH + 6} x2={330} y2={barBaseY - rightH - 8} stroke={ctx.accentLiability} strokeWidth="2" opacity={dropMix} />

                  {/* Vetoed Bar */}
                  <rect x={278} y={barBaseY - rightH} width={104} height={rightH} rx={5} fill={ctx.accentLiability} />
                  <FittedSvgLabel text={`$${currentBarVal.toLocaleString()}`} x={330} y={barBaseY - rightH - 12} maxWidth={140} fontSize={24} fontFamily={FONTS.mono} fill={ctx.accentLiability} textAnchor="middle" />
                  <FittedSvgLabel text={`AFTER VETO (${cutLabel})`} x={330} y={barBaseY + 26} maxWidth={180} fontSize={13.5} fontFamily={FONTS.mono} fill={ctx.accentLiability} textAnchor="middle" />
                </svg>
              </div>

              {/* 1982–2025 PFD Erosion Mini-Sparkline Strip */}
              <div
                style={{
                  backgroundColor: ctx.bgElevated,
                  border: `1px solid ${ctx.ruleHairline}`,
                  borderRadius: "10px",
                  padding: "16px 20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", color: ctx.inkMuted }}>
                    1982–2025 PFD PAYOUT EROSION STRIP
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: "11.5px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>
                    2015: $2,072 → 2016: $1,022 → 2025: $1,000
                  </span>
                </div>

                <svg viewBox={`0 0 ${spW} ${spH}`} style={{ width: "100%", height: "136px", display: "block" }}>
                  <line x1={spPadL} y1={spBaseY} x2={spW - spPadR} y2={spBaseY} stroke={ctx.ruleHairline} strokeWidth="1.2" />
                  <path
                    d={spPts}
                    fill="none"
                    stroke={ctx.accentLiability}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={spEv.strokeDasharray}
                    strokeDashoffset={spEv.strokeDashoffset}
                  />
                  {sparkMilestones.map((m, idx) => {
                    const cx = spX(idx);
                    const cy = spY(m.usd);
                    const isVeto = m.yr === "2016" || m.yr === "2025";
                    return (
                      <g key={`pfd-sp-${m.yr}`} opacity={ctx.settleProgress}>
                        <circle cx={cx} cy={cy} r={isVeto ? 5.5 : 4.5} fill={isVeto ? ctx.accentLiability : ctx.accentStatutory} />
                        <FittedSvgLabel
                          text={`$${m.usd.toLocaleString()}`}
                          x={cx}
                          y={cy - 10}
                          maxWidth={78}
                          fontSize={12.5}
                          fontFamily={FONTS.mono}
                          fill={isVeto ? ctx.accentLiability : ctx.inkPrimary}
                          textAnchor="middle"
                        />
                        <FittedSvgLabel
                          text={m.yr}
                          x={cx}
                          y={spH - 12}
                          maxWidth={64}
                          fontSize={12.5}
                          fontFamily={FONTS.mono}
                          fill={ctx.inkMuted}
                          textAnchor="middle"
                        />
                      </g>
                    );
                  })}
                </svg>
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
        <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr 1fr", gap: ctx.isGlass ? "10px" : "24px", height: "100%" }}>
          {bays.map((bay, idx) => {
            const isPriorLocked = idx < activeBayIndex && bay.isFailed;
            const isCurrentSlam = idx === activeBayIndex && bay.isFailed;
            const stampScale = isPriorLocked
              ? 1
              : isCurrentSlam
              ? spring({ frame: Math.max(0, frame - (base.atFrame ?? 0) - 10), fps, config: CINEMA_SPRINGS.heavyStamp })
              : 0;

            return (
              <div
                key={`ehs-${bay.bayNumber}`}
                style={{
                  position: "relative",
                  backgroundColor: bay.isFailed ? ctx.riskFill : ctx.bgElevated,
                  border: `2px solid ${bay.isFailed ? ctx.accentLiabilityStroke : ctx.ruleOxford}`,
                  borderRadius: "10px",
                  padding: ctx.isGlass ? "12px 16px" : "28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: ctx.isGlass ? "8px" : "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentLiability, letterSpacing: "0.1em", ...TABULAR_NUM_STYLE }}>
                      {bay.bayNumber}
                    </span>
                    {ctx.isGlass && stampScale > 0.02 && (
                      <span style={{ border: `2px solid ${ctx.accentLiabilityStroke}`, color: ctx.accentLiability, padding: "2px 8px", borderRadius: "4px", fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700 }}>
                        ✗ {bay.stampText}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: ctx.isGlass ? "4px 0 0 0" : "12px 0 0 0", fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "17.5px" : "29px", lineHeight: 1.18, color: ctx.inkPrimary }}>
                    {bay.title}
                  </h3>
                  <p style={{ margin: ctx.isGlass ? "4px 0 0 0" : "14px 0 0 0", fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "13.5px" : "18px", lineHeight: 1.44, color: ctx.inkSecondary }}>
                    {bay.mechanism}
                  </p>
                </div>

                {!ctx.isGlass && stampScale > 0.02 && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      border: `3px solid ${ctx.accentLiabilityStroke}`,
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
        const stampedCount = Math.round(interpolate(ctx.settleProgress, [0, 1], [2, redeemedCoupons], CLAMP));

        if (ctx.isGlass) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%", justifyContent: "space-between" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "7px", backgroundColor: ctx.bgElevated, border: `1.5px dashed ${ctx.ruleOxford}`, borderRadius: "8px", padding: "12px", flex: 1 }}>
                {cells.map((idx) => {
                  const isUsed = idx < stampedCount;
                  return (
                    <div
                      key={`rb41g-${idx}`}
                      style={{
                        border: `1.2px dashed ${isUsed ? ctx.accentLiability : ctx.ruleOxford}`,
                        borderRadius: "5px",
                        backgroundColor: isUsed ? ctx.bgRecessed : ctx.bgElevated,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5px 4px",
                        opacity: isUsed ? 0.68 : 1,
                      }}
                    >
                      <span style={{ fontFamily: FONTS.mono, fontSize: "11px", color: ctx.inkMuted, ...TABULAR_NUM_STYLE }}>
                        U{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: isUsed ? ctx.accentLiability : ctx.accentSolvent, marginTop: "2px" }}>
                        {isUsed ? "VOID" : "VALID"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ backgroundColor: ctx.bgRecessed, border: `1px solid ${ctx.ruleOxford}`, borderRadius: "8px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <div style={{ fontFamily: FONTS.sans, fontSize: "13px", fontWeight: 700, color: ctx.inkSecondary, lineHeight: 1.25 }}>
                  {cashBalanceLabel}
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "20px", fontWeight: 700, color: ctx.accentLiability, flexShrink: 0, ...TABULAR_NUM_STYLE }}>
                  {count - stampedCount}/{count} LEFT
                </div>
              </div>
            </div>
          );
        }

        return (
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "32px", height: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", backgroundColor: ctx.bgRecessed, border: `2px dashed ${ctx.ruleOxford}`, borderRadius: "10px", padding: "22px" }}>
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
                      opacity: isUsed ? 0.65 : 1,
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

            <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: "34px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.inkMuted }}>
                  UNSPENT NOMINAL CURRENCY
                </div>
                <div style={{ fontFamily: FONTS.serif, fontSize: "29px", fontWeight: 700, color: ctx.inkSecondary, marginTop: "14px", lineHeight: 1.25 }}>
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
        const peel = interpolate(ctx.settleProgress, [0.1, 0.95], [1, 0], CLAMP);
        const blackoutColor = ctx.isDark ? ctx.ruleOxford : PAGE_PALETTE.navyDeep;

        return (
          <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "18px 20px" : "38px 46px", display: "flex", flexDirection: "column", gap: ctx.isGlass ? "14px" : "24px", height: "100%", boxSizing: "border-box", justifyContent: "center" }}>
            {clauses.map((cl, i) => (
              <div key={`foia-${i}`} style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "14.5px" : "21px", lineHeight: 1.58, color: ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
                <span>{cl.prefix}</span>
                <span style={{ position: "relative", display: "inline-block", padding: "2px 8px", backgroundColor: cl.declassify ? ctx.highlighterWash : "transparent", fontWeight: 700, color: cl.declassify ? ctx.accentLiability : ctx.inkPrimary }}>
                  {cl.classifiedSpan}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: blackoutColor,
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
        const stretchPct = interpolate(ctx.settleProgress, [0, 1], [50, 100], CLAMP);
        const barTextColor = ctx.isDark ? "#111315" : "#FAF8F3";

        return (
          <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "18px 20px" : "36px 42px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", boxSizing: "border-box" }}>
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "11.5px" : "13px", fontWeight: 700, color: ctx.inkMuted }}>
                PHYSICAL SILICON OBSOLESCENCE CADENCE (18–36 MONTHS)
              </div>
              <div style={{ marginTop: "10px", width: "50%", minWidth: "210px", height: ctx.isGlass ? "44px" : "52px", backgroundColor: ctx.accentStatutory, borderRadius: "6px", display: "flex", alignItems: "center", paddingLeft: "16px", paddingRight: "12px", boxSizing: "border-box", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "14.5px" : "17px", fontWeight: 700, color: barTextColor, ...TABULAR_NUM_STYLE }}>
                PRIOR · {priorLifeYears} YEARS
              </div>

              <div style={{ marginTop: ctx.isGlass ? "22px" : "34px", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "11.5px" : "13px", fontWeight: 700, color: ctx.accentLiability }}>
                REVISED ACCOUNTING FOOTNOTE SCHEDULE
              </div>
              <div style={{ marginTop: "10px", width: `${stretchPct.toFixed(1)}%`, height: ctx.isGlass ? "50px" : "60px", backgroundColor: ctx.accentLiability, borderRadius: "6px", display: "flex", alignItems: "center", paddingLeft: "16px", paddingRight: "12px", boxSizing: "border-box", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "15px" : "18px", fontWeight: 700, color: barTextColor, ...TABULAR_NUM_STYLE }}>
                STRETCHED · {newLifeYears} YEARS
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${ctx.ruleHairline}`, paddingTop: "14px", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "16px" : "22px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>
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
        <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "14px" : "28px 34px", display: "flex", flexDirection: "column", gap: ctx.isGlass ? "10px" : "16px", height: "100%", boxSizing: "border-box", justifyContent: "center" }}>
          {loans.map((ln, i) => (
            <div key={`pik-${i}`} style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr auto" : "1.4fr 1fr 0.6fr 0.9fr", alignItems: "center", padding: ctx.isGlass ? "12px 14px" : "18px 20px", borderRadius: "8px", backgroundColor: ctx.bgElevated, border: `1px solid ${ctx.ruleHairline}`, gap: "12px" }}>
              <div>
                <div style={{ fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "15.5px" : "19px", fontWeight: 700, color: ctx.inkPrimary }}>{ln.borrower}</div>
                {ctx.isGlass && (
                  <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: ctx.accentCapital, fontWeight: 700, marginTop: "3px", ...TABULAR_NUM_STYLE }}>
                    {ln.couponSpec} · {ln.pikStatus}
                  </div>
                )}
              </div>
              {!ctx.isGlass && <span style={{ fontFamily: FONTS.mono, fontSize: "15px", color: ctx.accentCapital, fontWeight: 700, ...TABULAR_NUM_STYLE }}>{ln.couponSpec}</span>}
              <span style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "17px" : "20px", fontWeight: 700, color: ctx.inkPrimary, textAlign: "right", ...TABULAR_NUM_STYLE }}>{ln.parMillions}</span>
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
          <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "20px 22px" : "44px 52px", position: "relative" }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "12.5px" : "14px", fontWeight: 700, color: ctx.accentStatutory, letterSpacing: "0.08em" }}>
              § {statuteHeading}
            </div>
            <div style={{ position: "relative", marginTop: ctx.isGlass ? "14px" : "24px" }}>
              {!ctx.isGlass && (
                <div style={{ position: "absolute", left: 0, top: "6px", zIndex: 0 }}>
                  <HighlighterStroke width={1040} height={42} progress={ctx.settleProgress} register={ctx.registerId} />
                </div>
              )}
              <p style={{ position: "relative", zIndex: 1, margin: 0, fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "18px" : "33px", lineHeight: 1.45, color: ctx.inkPrimary }}>
                {clauseText}
              </p>
            </div>
          </div>
        );

        return (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {inner}
            {enableLoupe && !ctx.isGlass && ctx.settleProgress > 0.55 && (
              <OpticalLoupe x={1140} y={200} radius={130} zoom={1.95} register={ctx.registerId} label="OPERATIVE CLAUSE" enterFrame={18}>
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
        <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "18px 20px" : "38px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", boxSizing: "border-box", gap: ctx.isGlass ? "12px" : "20px" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "12px" : "13.5px", fontWeight: 700, color: ctx.accentLiability }}>
            ▲ {inspectionFlag}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr", gap: ctx.isGlass ? "12px" : "28px" }}>
            <div style={{ backgroundColor: ctx.bgElevated, border: `1px solid ${ctx.ruleHairline}`, padding: ctx.isGlass ? "14px 16px" : "28px", borderRadius: "8px" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: ctx.inkMuted }}>PRIOR ANNUAL PREMIUM</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "26px" : "46px", fontWeight: 700, color: ctx.inkSecondary, marginTop: "6px", ...TABULAR_NUM_STYLE }}>{priorPremium}</div>
            </div>
            <div style={{ backgroundColor: ctx.riskFill, border: `2px solid ${ctx.accentLiabilityStroke}`, padding: ctx.isGlass ? "14px 16px" : "28px", borderRadius: "8px" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentLiability }}>RENEWAL / DICTATED ESCROW</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "26px" : "46px", fontWeight: 700, color: ctx.accentLiability, marginTop: "6px", ...TABULAR_NUM_STYLE }}>{renewalPremium}</div>
            </div>
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "14.5px" : "18px", color: ctx.inkSecondary, lineHeight: 1.38 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr", gap: ctx.isGlass ? "12px" : "28px", height: "100%" }}>
          <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "16px 18px" : "34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentStatutory }}>LINE 5a/5c · EMPLOYEE WITHHOLDING</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "18px" : "32px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "8px", ...TABULAR_NUM_STYLE }}>{employeeShare}</div>
            <div style={{ marginTop: ctx.isGlass ? "14px" : "28px", fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentCapital }}>EMPLOYER MATCHING PAYROLL TAX</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "18px" : "32px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "8px", ...TABULAR_NUM_STYLE }}>{employerShare}</div>
          </div>
          <div style={{ backgroundColor: ctx.riskFill, border: `2px solid ${ctx.accentLiabilityStroke}`, borderRadius: "10px", padding: ctx.isGlass ? "16px 18px" : "34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentLiability }}>HUMAN VS. SILICON TAX WEDGE</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "22px" : "40px", fontWeight: 700, color: ctx.accentLiability, marginTop: "10px", lineHeight: 1.15, ...TABULAR_NUM_STYLE }}>{combinedRate}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "14.5px" : "18px", color: ctx.accentSolvent, marginTop: "14px", fontWeight: 700 }}>CLOUD GPU INFERENCE API · 0.00% FICA</div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: ctx.isGlass ? "12px" : "18px", height: "100%", justifyContent: "center" }}>
          {events.map((ev, i) => (
            <div key={`ssil-${i}`} style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "92px 1fr" : "150px 1.2fr 0.7fr 1.1fr", alignItems: "center", padding: ctx.isGlass ? "14px 16px" : "22px 26px", backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "8px", fontFamily: FONTS.mono, gap: "10px", ...TABULAR_NUM_STYLE }}>
              <span style={{ fontSize: ctx.isGlass ? "13.5px" : "16px", fontWeight: 700, color: ctx.accentCapital }}>{ev.utcTime}</span>
              <div>
                <div style={{ fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "16px" : "20px", fontWeight: 700, color: ctx.inkPrimary }}>{ev.cableName}</div>
                {ctx.isGlass && (
                  <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentLiability, marginTop: "3px" }}>
                    {ev.depthMeters} · {ev.status}
                  </div>
                )}
              </div>
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
      <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.ruleOxford}`, borderLeft: `8px solid ${ctx.accentLiabilityStroke}`, borderRadius: "10px", padding: ctx.isGlass ? "22px 24px" : "44px 52px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: ctx.accentLiability }}>
          SWORN CONGRESSIONAL RECORD · OFFICIAL TRANSCRIPT
        </div>
        <blockquote style={{ margin: 0, fontFamily: FONTS.serif, fontStyle: "italic", fontSize: ctx.isGlass ? "19px" : "35px", lineHeight: 1.4, color: ctx.inkPrimary }}>
          {swornExcerpt}
        </blockquote>
        <div style={{ borderTop: `1px solid ${ctx.ruleHairline}`, paddingTop: "12px", fontFamily: FONTS.mono, fontSize: "12.5px", color: ctx.inkMuted }}>
          WITNESS: {witnessName.toUpperCase()} · {committee}
        </div>
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
      <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr", gap: ctx.isGlass ? "14px" : "28px", height: "100%" }}>
        <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "18px 20px" : "36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.inkMuted }}>OFFICIAL SOVEREIGN RESERVE SHARE</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "20px" : "28px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "12px", lineHeight: 1.3, ...TABULAR_NUM_STYLE }}>{officialShare}</div>
        </div>
        <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.accentSolvent}`, borderRadius: "10px", padding: ctx.isGlass ? "18px 20px" : "36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", color: ctx.accentSolvent, fontWeight: 700 }}>CAPTIVE PRIVATE T-BILL CUSTODIANS</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "20px" : "28px", fontWeight: 700, color: ctx.accentSolvent, marginTop: "12px", lineHeight: 1.3, ...TABULAR_NUM_STYLE }}>{privateRailShare}</div>
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
      <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr 1fr", gap: ctx.isGlass ? "12px" : "24px", alignItems: "stretch", height: "100%" }}>
        {nodes.map((nd, i) => (
          <div
            key={`spv-${i}`}
            style={{
              backgroundColor: i === 2 ? ctx.riskFill : ctx.bgRecessed,
              border: `2px solid ${i === 2 ? ctx.accentLiabilityStroke : ctx.ruleOxford}`,
              borderRadius: "10px",
              padding: ctx.isGlass ? "16px 18px" : "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span style={{ fontFamily: FONTS.mono, fontSize: "11.5px", fontWeight: 700, color: i === 2 ? ctx.accentLiability : ctx.inkMuted }}>
              STEP 0{i + 1} {i === 2 ? "· REVENUE RECOGNIZED" : "→"}
            </span>
            <div style={{ fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "15.5px" : "22px", fontWeight: 700, color: ctx.inkPrimary, lineHeight: 1.32, ...TABULAR_NUM_STYLE }}>
              {nd}
            </div>
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
      <div style={{ display: "flex", flexDirection: "column", gap: ctx.isGlass ? "12px" : "18px", height: "100%", justifyContent: "center" }}>
        {covenantChecks.map((ck, i) => (
          <div
            key={`fmc-${i}`}
            style={{
              display: "flex",
              flexDirection: ctx.isGlass ? "column" : "row",
              justifyContent: "space-between",
              alignItems: ctx.isGlass ? "flex-start" : "center",
              gap: ctx.isGlass ? "6px" : "18px",
              padding: ctx.isGlass ? "14px 16px" : "22px 28px",
              backgroundColor: ck.breached ? ctx.riskFill : ctx.bgRecessed,
              border: `1.5px solid ${ck.breached ? ctx.accentLiabilityStroke : ctx.ruleOxford}`,
              borderRadius: "8px",
            }}
          >
            <span style={{ fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "16px" : "20px", fontWeight: 700, color: ctx.inkPrimary }}>{ck.requirement}</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "13.5px" : "15px", fontWeight: 700, color: ck.breached ? ctx.accentLiability : ctx.accentSolvent, flexShrink: 0 }}>{ck.status}</span>
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
      <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "20px 22px" : "40px 48px", display: "flex", flexDirection: "column", gap: ctx.isGlass ? "18px" : "28px", height: "100%", boxSizing: "border-box", justifyContent: "center" }}>
        <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "16.5px" : "27px", color: ctx.inkMuted, textDecoration: "line-through", lineHeight: 1.4 }}>
          {deletedClause}
        </div>
        <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "17.5px" : "29px", fontWeight: 700, color: ctx.accentLiability, borderLeft: `5px solid ${ctx.accentLiabilityStroke}`, paddingLeft: "18px", lineHeight: 1.4 }}>
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
      <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "22px" : "44px 52px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: ctx.accentCapital, letterSpacing: "0.08em" }}>
          ARCHIVAL SPECIFICATION · CLAIM 1
        </div>
        <p style={{ margin: 0, fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "19px" : "32px", lineHeight: 1.48, color: ctx.inkPrimary }}>
          {claimExcerpt}
        </p>
        <div style={{ borderTop: `1px solid ${ctx.ruleHairline}`, paddingTop: "12px", fontFamily: FONTS.mono, fontSize: "12px", color: ctx.inkMuted }}>
          {patentId}
        </div>
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
      <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1fr 1fr", borderTop: `4px solid ${ctx.ruleOxford}`, backgroundColor: ctx.bgRecessed, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "0 0 10px 10px", height: "100%" }}>
        <div style={{ padding: ctx.isGlass ? "18px 20px" : "36px", borderRight: ctx.isGlass ? "none" : `2px solid ${ctx.ruleOxford}`, borderBottom: ctx.isGlass ? `2px solid ${ctx.ruleOxford}` : "none", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentLiability }}>ASSETS (MARK-TO-MARKET)</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "18.5px" : "30px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "12px", lineHeight: 1.3, ...TABULAR_NUM_STYLE }}>{assetSide}</div>
        </div>
        <div style={{ padding: ctx.isGlass ? "18px 20px" : "36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "12.5px", fontWeight: 700, color: ctx.accentStatutory }}>LIABILITIES & CAPITAL</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "18.5px" : "30px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "12px", lineHeight: 1.3, ...TABULAR_NUM_STYLE }}>{liabilitySide}</div>
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
      <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "22px 24px" : "44px 52px", position: "relative", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ position: "relative", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "16px" : "24px", lineHeight: 1.4, color: ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
          {originalLine}
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "4px", backgroundColor: ctx.accentLiabilityStroke, transform: `scaleX(${ctx.settleProgress.toFixed(3)})`, transformOrigin: "left center" }} />
        </div>
        <div style={{ marginTop: "24px", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "15.5px" : "22px", fontWeight: 700, color: ctx.accentLiability, lineHeight: 1.38, ...TABULAR_NUM_STYLE }}>
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
      <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "18px 20px" : "30px 38px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: ctx.isGlass ? "10px" : "14px", height: "100%", boxSizing: "border-box", fontFamily: FONTS.mono, ...TABULAR_NUM_STYLE }}>
        <div style={{ fontSize: ctx.isGlass ? "17px" : "20px", fontWeight: 700, color: ctx.accentSolvent, paddingBottom: "10px", borderBottom: `1px solid ${ctx.ruleHairline}` }}>
          {grossDeposit}
        </div>
        {drafts.map((d, i) => (
          <div key={`ach-${i}`} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: ctx.isGlass ? "14px" : "19px", color: ctx.inkPrimary }}>
            <span>{d.payee}</span>
            <span style={{ color: ctx.accentLiability, fontWeight: 700, flexShrink: 0 }}>{d.amount}</span>
          </div>
        ))}
        <div style={{ marginTop: "6px", paddingTop: "12px", borderTop: `2px solid ${ctx.ruleOxford}`, fontSize: ctx.isGlass ? "17.5px" : "24px", fontWeight: 700, color: ctx.accentLiability }}>
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
      <div style={{ backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.accentLiabilityStroke}`, borderRadius: "10px", padding: ctx.isGlass ? "20px 22px" : "38px 46px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {[
            { grade: "AAA", era: "1941–2011", active: false },
            { grade: "AA+", era: "2011–2023", active: false },
            { grade: "AA-", era: "DOWNGRADE WATCH", active: true },
          ].map((step) => (
            <div
              key={`cr-${step.grade}`}
              style={{
                backgroundColor: step.active ? ctx.riskFill : ctx.bgElevated,
                border: `1.5px solid ${step.active ? ctx.accentLiabilityStroke : ctx.ruleHairline}`,
                borderRadius: "8px",
                padding: ctx.isGlass ? "10px" : "14px 18px",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "20px" : "26px", fontWeight: 700, color: step.active ? ctx.accentLiability : ctx.inkMuted, ...TABULAR_NUM_STYLE }}>
                {step.grade}
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "11px", color: step.active ? ctx.accentLiability : ctx.inkMuted, marginTop: "2px" }}>
                {step.era}
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontFamily: FONTS.sans, fontSize: ctx.isGlass ? "16px" : "25px", lineHeight: 1.48, color: ctx.inkPrimary }}>
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
    defaultTitle="Evidentiary Discovery: Bottleneck Pricing Power"
    defaultVerdict={exhibitNumber}
    defaultCitation="DOJ / FTC Federal Antitrust Trial Evidentiary Record"
    {...base}
  >
    {(ctx) => (
      <div style={{ display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr" : "1.3fr 0.7fr", gap: ctx.isGlass ? "14px" : "28px", height: "100%" }}>
        <div style={{ backgroundColor: ctx.bgRecessed, border: `1.5px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "18px 20px" : "38px", fontFamily: FONTS.serif, fontStyle: "italic", fontSize: ctx.isGlass ? "18px" : "30px", lineHeight: 1.4, color: ctx.inkPrimary, display: "flex", alignItems: "center" }}>
          {internalQuote}
        </div>
        <div style={{ backgroundColor: ctx.riskFill, border: `2px solid ${ctx.accentLiabilityStroke}`, borderRadius: "10px", padding: ctx.isGlass ? "18px 20px" : "38px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "24px" : "34px", fontWeight: 700, color: ctx.accentLiability, textAlign: "center", ...TABULAR_NUM_STYLE }}>
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
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: ctx.isGlass ? "1fr 1fr" : "repeat(4, 1fr)", gap: ctx.isGlass ? "12px" : "22px", alignItems: "center", height: "100%" }}>
        {!ctx.isGlass && (
          <svg viewBox="0 0 1560 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <line x1={160} y1={180} x2={160 + 1240 * ctx.settleProgress} y2={180} stroke={ctx.accentLiabilityStroke} strokeWidth="3.5" />
          </svg>
        )}
        {pins.map((p, i) => (
          <div key={`ecc-${p.year}-${i}`} style={{ position: "relative", zIndex: 1, backgroundColor: ctx.bgRecessed, border: `2px solid ${ctx.ruleOxford}`, borderRadius: "10px", padding: ctx.isGlass ? "14px 12px" : "28px", textAlign: "center" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: ctx.accentLiabilityStroke, margin: "0 auto 10px auto" }} />
            <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "19px" : "24px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>{p.year}</div>
            <div style={{ fontFamily: FONTS.serif, fontSize: ctx.isGlass ? "16px" : "22px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "6px", lineHeight: 1.2 }}>{p.event}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: ctx.isGlass ? "13.5px" : "15px", color: ctx.inkSecondary, marginTop: "8px", ...TABULAR_NUM_STYLE }}>{p.figure}</div>
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
  { id: "forensic-supreme-court-syllabus", name: "Supreme Court Syllabus & Veto Bar Drop", componentName: "SupremeCourtSyllabusStage", defaultFraming: "fullscreen-cutaway", description: "Judicial holding (Wielechowski v. State) paired with statutory vs. vetoed payout bar drop and 1982–2025 PFD sparkline." },
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
