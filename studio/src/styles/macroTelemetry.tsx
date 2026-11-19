import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fitSvgTextToWidth, FontMetricFamily, wrapSvgTextLines } from "../design/fitText";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import { HighlighterStroke, ReadingRoomStage } from "../design/optics";
import {
  CINEMA_SPRINGS,
  LAYOUT,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  RegisterId,
  REGISTERS,
  resolveRegisterPalette,
} from "../design/tokens";

export type TelemetryPaletteMode = "page" | "over-footage";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export interface BaseTelemetryProps {
  title?: string;
  subtitle?: string;
  kicker?: string;
  heroBadge?: string;
  sourceCitation?: string;
  register?: RegisterId;
  paletteMode?: TelemetryPaletteMode;
  atFrame?: number;
}

export interface TelemetryRenderContext {
  progress: number;
  curveProgress: number;
  labelProgress: number;
  enter: number;
  elapsed: number;
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
  surfaceElevated: string;
  surfaceRecessed: string;
  riskFill: string;
  riskBorder: string;
  highlighterWash: string;
  solidBarInk: string;
}

interface TelemetryShellProps extends BaseTelemetryProps {
  defaultTitle: string;
  defaultSubtitle: string;
  defaultKicker: string;
  defaultHeroBadge: string;
  defaultCitation: string;
  children: (ctx: TelemetryRenderContext) => React.ReactNode;
}

interface FittedSvgTextProps {
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
  tabular?: boolean;
  italic?: boolean;
  uppercase?: boolean;
  opacity?: number;
}

const FittedSvgText: React.FC<FittedSvgTextProps> = ({
  text,
  x,
  y,
  maxWidth,
  fontSize,
  minFontSize,
  fontKind = "sans",
  fontFamily,
  fontWeight = 700,
  fill,
  textAnchor = "start",
  tabular = true,
  italic = false,
  uppercase = false,
  opacity = 1,
}) => {
  const fitted = fitSvgTextToWidth(
    text,
    Math.max(12, maxWidth),
    fontSize,
    minFontSize ?? Math.max(9, fontSize * 0.68),
    fontKind,
    { fontWeight, italic, uppercase }
  );
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fontFamily={fontFamily}
      fontSize={fitted.fontSize}
      fontWeight={fontWeight}
      fontStyle={italic ? "italic" : "normal"}
      fill={fill}
      opacity={opacity}
      style={tabular ? TABULAR_NUM_STYLE : undefined}
    >
      {fitted.text}
    </text>
  );
};

interface WrappedSvgTextProps {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  minFontSize?: number;
  maxLines?: number;
  lineHeight?: number;
  fontKind?: FontMetricFamily;
  fontFamily: string;
  fontWeight?: number | string;
  fill: string;
  textAnchor?: "start" | "middle" | "end";
  tabular?: boolean;
  italic?: boolean;
  opacity?: number;
}

const WrappedSvgText: React.FC<WrappedSvgTextProps> = ({
  text,
  x,
  y,
  maxWidth,
  fontSize,
  minFontSize,
  maxLines = 2,
  lineHeight = 1.18,
  fontKind = "sans",
  fontFamily,
  fontWeight = 600,
  fill,
  textAnchor = "start",
  tabular = false,
  italic = false,
  opacity = 1,
}) => {
  const wrapped = wrapSvgTextLines(
    text,
    Math.max(24, maxWidth),
    fontSize,
    fontKind,
    maxLines,
    {
      minFontSize: minFontSize ?? Math.max(9, fontSize * 0.7),
      lineHeight,
      fontWeight,
      italic,
    }
  );
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fontFamily={fontFamily}
      fontSize={wrapped.fontSize}
      fontWeight={fontWeight}
      fontStyle={italic ? "italic" : "normal"}
      fill={fill}
      opacity={opacity}
      style={tabular ? TABULAR_NUM_STYLE : undefined}
    >
      {wrapped.lines.map((line, idx) => (
        <tspan key={`wl-${idx}`} x={x} dy={idx === 0 ? 0 : wrapped.lineHeightPx}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

const TelemetryShell: React.FC<TelemetryShellProps> = ({
  title,
  subtitle,
  kicker,
  heroBadge,
  sourceCitation,
  register = "page_editorial",
  paletteMode = "page",
  atFrame = 0,
  defaultTitle,
  defaultSubtitle,
  defaultKicker,
  defaultHeroBadge,
  defaultCitation,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < atFrame) return null;

  const elapsed = frame - atFrame;
  const enter = spring({
    frame: elapsed,
    fps,
    config: CINEMA_SPRINGS.editorialSnap,
  });
  const progress = interpolate(elapsed, [4, 42], [0, 1], CLAMP);
  const curveProgress = interpolate(progress, [0.06, 0.56], [0, 1], CLAMP);
  const labelProgress = interpolate(progress, [0.4, 0.62], [0, 1], CLAMP);

  const resolvedTitle = title ?? defaultTitle;
  const resolvedSubtitle = subtitle ?? defaultSubtitle;
  const resolvedKicker = kicker ?? defaultKicker;
  const resolvedHero = heroBadge ?? defaultHeroBadge;
  const resolvedCitation = sourceCitation ?? defaultCitation;

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
          backdropFilter: "blur(12px) saturate(165%) brightness(0.70)",
          WebkitBackdropFilter: "blur(12px) saturate(165%) brightness(0.70)",
          border: `1.5px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
          borderRadius: "18px",
          padding: "24px 26px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 24px 52px rgba(15, 25, 35, 0.44)",
          opacity: enter,
          transform: `translate3d(${((1 - enter) * 32).toFixed(2)}px, 0, 0)`,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: OVER_FOOTAGE_PALETTE.accentPrimary,
                textTransform: "uppercase",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {resolvedKicker}
            </span>
            <span
              style={{
                backgroundColor: OVER_FOOTAGE_PALETTE.brickRedFill,
                color: OVER_FOOTAGE_PALETTE.textHeadline,
                fontFamily: FONTS.mono,
                fontSize: "12.5px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "5px",
                flexShrink: 0,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {resolvedHero}
            </span>
          </div>
          <h2
            style={{
              margin: "10px 0 4px 0",
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
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: "14px",
              lineHeight: 1.38,
              color: OVER_FOOTAGE_PALETTE.textBody,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {resolvedSubtitle}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            marginTop: "14px",
            marginBottom: "12px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {children({
            progress,
            curveProgress,
            labelProgress,
            enter,
            elapsed,
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
            surfaceElevated: OVER_FOOTAGE_PALETTE.glassDarkWell,
            surfaceRecessed: "rgba(15, 25, 35, 0.62)",
            riskFill: OVER_FOOTAGE_PALETTE.riskFill,
            riskBorder: OVER_FOOTAGE_PALETTE.riskBorder,
            highlighterWash: OVER_FOOTAGE_PALETTE.highlightSweep,
            solidBarInk: "#0F1923",
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
            ...TABULAR_NUM_STYLE,
          }}
        >
          § {resolvedCitation}
        </div>
      </div>
    );
  }

  const pal = resolveRegisterPalette(register);
  const cardShadow = pal.isDark
    ? "0 24px 52px -14px rgba(4, 8, 14, 0.56), 0 4px 16px rgba(4, 8, 14, 0.36)"
    : "0 24px 52px -14px rgba(28, 43, 58, 0.16), 0 4px 16px rgba(28, 43, 58, 0.06)";
  const riskFill = pal.isDark ? "rgba(232, 93, 78, 0.16)" : PAGE_PALETTE.riskFill;
  const riskBorder = pal.isDark ? pal.accent.liabilityStroke : PAGE_PALETTE.riskBorder;
  const badgeBg = pal.isDark ? pal.accent.liabilityStroke : pal.rule.oxford;
  const cardTranslateY = interpolate(enter, [0, 1], [32, 0]);

  return (
    <ReadingRoomStage
      register={pal}
      chapterTitle={resolvedKicker}
      folioLabel={resolvedHero}
      sourceCitation={resolvedCitation}
      cameraMove="static"
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
          transform: `translate3d(0, ${cardTranslateY.toFixed(2)}px, 0)`,
          userSelect: "none",
        }}
      >
        {/* Elevated TreasuryTable9-grade Broadcast Card */}
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            backgroundColor: pal.bg.elevated,
            border: `1px solid ${pal.rule.hairline}`,
            borderRadius: "12px",
            boxShadow: cardShadow,
            padding: "28px 42px 22px 42px",
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

          {/* Card Editorial Header */}
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
                {resolvedKicker}
              </div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: FONTS.serif,
                  fontSize: "38px",
                  fontWeight: 700,
                  lineHeight: 1.13,
                  letterSpacing: "-0.01em",
                  color: pal.ink.primary,
                }}
              >
                {resolvedTitle}
              </h1>
              <div
                style={{
                  marginTop: "6px",
                  fontFamily: FONTS.sans,
                  fontSize: "17.5px",
                  lineHeight: 1.35,
                  color: pal.ink.secondary,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {resolvedSubtitle}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                flexShrink: 0,
                gap: "6px",
              }}
            >
              <div
                style={{
                  backgroundColor: badgeBg,
                  color: "#FAF8F3",
                  padding: "7px 16px",
                  borderRadius: "6px",
                  fontFamily: FONTS.mono,
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {resolvedHero}
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
                {resolvedCitation}
              </div>
            </div>
          </div>

          {/* Primary Visualization Canvas */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              paddingTop: "16px",
              paddingBottom: "8px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children({
              progress,
              curveProgress,
              labelProgress,
              enter,
              elapsed,
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
              surfaceElevated: pal.bg.elevated,
              surfaceRecessed: pal.bg.recessed,
              riskFill,
              riskBorder,
              highlighterWash: pal.accent.highlighterWash,
              solidBarInk: pal.isDark ? "#111315" : "#FAF8F3",
            })}
          </div>
        </div>
      </div>
    </ReadingRoomStage>
  );
};

function pointsToPath(pts: ReadonlyArray<[number, number]>): string {
  if (pts.length === 0) return "";
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  }
  return d;
}

// ============================================================================
// 1. DivergingJawsChart (Productivity vs Lagging Pay + Truman 53% Share Gauge)
// ============================================================================
export interface DivergingJawsChartProps extends BaseTelemetryProps {
  years?: string[];
  upperSeries?: number[];
  lowerSeries?: number[];
  upperLabel?: string;
  lowerLabel?: string;
  floorValue?: number;
  floorLabel?: string;
}

interface ResolvedJawsDataset {
  years: string[];
  upperSeries: number[];
  lowerSeries: number[];
  upperLabel: string;
  lowerLabel: string;
  baseYear: string;
  isPost1973: boolean;
}

function buildCoherentJawsDataset(
  props: Pick<
    DivergingJawsChartProps,
    "years" | "upperSeries" | "lowerSeries" | "upperLabel" | "lowerLabel" | "title" | "subtitle"
  >
): ResolvedJawsDataset {
  const hasExplicitSeries = Boolean(
    props.years &&
      props.upperSeries &&
      props.lowerSeries &&
      props.years.length >= 2 &&
      props.upperSeries.length === props.years.length &&
      props.lowerSeries.length === props.years.length
  );

  if (hasExplicitSeries && props.years && props.upperSeries && props.lowerSeries) {
    const u0 = props.upperSeries[0] || 100;
    const uN = props.upperSeries[props.upperSeries.length - 1];
    const l0 = props.lowerSeries[0] || 100;
    const lN = props.lowerSeries[props.lowerSeries.length - 1];
    const uPct = ((uN - u0) / Math.max(1, Math.abs(u0))) * 100;
    const lPct = ((lN - l0) / Math.max(1, Math.abs(l0))) * 100;
    return {
      years: props.years,
      upperSeries: props.upperSeries,
      lowerSeries: props.lowerSeries,
      upperLabel: props.upperLabel ?? `Productivity (${uPct >= 0 ? "+" : ""}${uPct.toFixed(1)}%)`,
      lowerLabel: props.lowerLabel ?? `Real Hourly Pay (${lPct >= 0 ? "+" : ""}${lPct.toFixed(1)}%)`,
      baseYear: props.years[0] ?? "BASE",
      isPost1973: props.years[0] === "1973" || uN > 200,
    };
  }

  const hint = `${props.title ?? ""} ${props.subtitle ?? ""}`;
  if (/1973|278|119/i.test(hint)) {
    const pctMatches = hint.match(/\+?\d+(?:\.\d+)?%/g);
    const upVal = pctMatches && pctMatches[0] ? parseFloat(pctMatches[0]) : 278;
    const loVal = pctMatches && pctMatches[1] ? parseFloat(pctMatches[1]) : 119;
    const safeUp = Number.isFinite(upVal) && upVal > 0 ? upVal : 278;
    const safeLo = Number.isFinite(loVal) && loVal >= 0 ? loVal : 119;
    const weights = [0, 0.065, 0.187, 0.41, 0.698, 1];
    const loWeights = [0, 0.017, 0.076, 0.286, 0.597, 1];
    return {
      years: ["1973", "1983", "1993", "2003", "2013", "2026"],
      upperSeries: weights.map((w) => Number((100 + safeUp * w).toFixed(1))),
      lowerSeries: loWeights.map((w) => Number((100 + safeLo * w).toFixed(1))),
      upperLabel: props.upperLabel ?? `Productivity (+${safeUp.toFixed(0)}%)`,
      lowerLabel: props.lowerLabel ?? `Real Hourly Pay (+${safeLo.toFixed(0)}%)`,
      baseYear: "1973",
      isPost1973: true,
    };
  }

  return {
    years: ["2017", "2019", "2021", "2023", "2025", "2026"],
    upperSeries: [100.0, 104.2, 109.5, 113.8, 117.6, 120.4],
    lowerSeries: [100.0, 101.4, 102.1, 102.6, 103.2, 103.5],
    upperLabel: props.upperLabel ?? "Output / Hour (+20.4%)",
    lowerLabel: props.lowerLabel ?? "Real Hourly Pay (+3.5%)",
    baseYear: "2017",
    isPost1973: false,
  };
}

export const DivergingJawsChart: React.FC<DivergingJawsChartProps> = ({
  years,
  upperSeries,
  lowerSeries,
  upperLabel,
  lowerLabel,
  floorValue,
  floorLabel = "BASELINE = 100.0",
  ...base
}) => {
  const dataset = buildCoherentJawsDataset({
    years,
    upperSeries,
    lowerSeries,
    upperLabel,
    lowerLabel,
    title: base.title,
    subtitle: base.subtitle,
  });

  const upStart = dataset.upperSeries[0] || 100;
  const upEnd = dataset.upperSeries[dataset.upperSeries.length - 1];
  const loStart = dataset.lowerSeries[0] || 100;
  const loEnd = dataset.lowerSeries[dataset.lowerSeries.length - 1];
  const upPct = ((upEnd - upStart) / Math.max(1, Math.abs(upStart))) * 100;
  const loPct = ((loEnd - loStart) / Math.max(1, Math.abs(loStart))) * 100;
  const spreadPctPts = upPct - loPct;

  const resolvedFloorVal = floorValue ?? Math.min(upStart, loStart);
  const rawHero = base.heroBadge?.trim();
  const formattedHero = rawHero
    ? /^\d+(?:\.\d+)?%$/.test(rawHero)
      ? `${rawHero} WAGE TAX BASE`
      : rawHero
    : `JAWS GAP: +${spreadPctPts.toFixed(1)} PTS`;

  return (
    <TelemetryShell
      defaultKicker="MACRO TELEMETRY · LABOR SHARE DECOUPLING"
      defaultTitle="The Diverging Jaws: Output Per Hour vs. Real Take-Home Pay"
      defaultSubtitle="Nonfarm business output per hour surges while real hourly compensation lags, compressing labor's postwar share of national income below 53.0%."
      defaultHeroBadge={formattedHero}
      defaultCitation="BLS Nonfarm Productivity & Costs; BEA National Income Table 1.12"
      {...base}
      heroBadge={formattedHero}
    >
      {(ctx) => {
        const lastIdx = dataset.years.length - 1;
        const allVals = dataset.upperSeries.concat(dataset.lowerSeries).concat([resolvedFloorVal]);
        const rawMin = Math.min(...allVals);
        const rawMax = Math.max(...allVals);
        const padSpan = Math.max(4, (rawMax - rawMin) * 0.12);
        const minV = Math.floor((rawMin - padSpan * 0.4) / 5) * 5;
        const maxV = Math.ceil((rawMax + padSpan) / 5) * 5;
        const span = Math.max(1, maxV - minV);

        const yTicks: number[] = [];
        for (let t = 0; t <= 4; t++) {
          yTicks.push(minV + (t / 4) * span);
        }

        if (ctx.isGlass) {
          const w = ctx.viewW;
          const h = 265;
          const padL = 56;
          const padR = 138;
          const padT = 22;
          const padB = 42;
          const plotW = w - padL - padR;
          const plotH = h - padT - padB;
          const xAt = (i: number): number =>
            padL + (i / Math.max(1, dataset.years.length - 1)) * plotW;
          const yAt = (v: number): number =>
            padT + (1 - (v - minV) / span) * plotH;

          const upPts: Array<[number, number]> = dataset.upperSeries.map((v, i) => [xAt(i), yAt(v)]);
          const loPts: Array<[number, number]> = dataset.lowerSeries.map((v, i) => [xAt(i), yAt(v)]);
          const upPath = pointsToPath(upPts);
          const loPath = pointsToPath(loPts);
          const upEv = evolvePath(ctx.curveProgress, upPath);
          const loEv = evolvePath(ctx.curveProgress, loPath);
          const polyPts = upPts
            .concat(loPts.slice().reverse())
            .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
            .join(" ");

          const upEndY = upPts[lastIdx][1];
          let loEndY = loPts[lastIdx][1];
          if (Math.abs(loEndY - upEndY) < 34) {
            loEndY = upEndY + 34;
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%", justifyContent: "space-between" }}>
              <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "265px", display: "block" }}>
                {yTicks.map((val, idx) => {
                  const gy = yAt(val);
                  return (
                    <g key={`djg-g-${idx}`}>
                      <line x1={padL} y1={gy} x2={w - padR} y2={gy} stroke={ctx.ruleHairline} strokeWidth="1" />
                      <FittedSvgText
                        text={val.toFixed(0)}
                        x={padL - 8}
                        y={gy + 5}
                        maxWidth={44}
                        fontSize={15}
                        minFontSize={13}
                        fontKind="mono"
                        fontFamily={FONTS.mono}
                        fontWeight={600}
                        fill={ctx.inkMuted}
                        textAnchor="end"
                      />
                    </g>
                  );
                })}
                <polygon points={polyPts} fill={ctx.accentLiability} opacity={0.18 * ctx.curveProgress} />
                <path
                  d={upPath}
                  fill="none"
                  stroke={ctx.accentSolvent}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={upEv.strokeDasharray}
                  strokeDashoffset={upEv.strokeDashoffset}
                />
                <path
                  d={loPath}
                  fill="none"
                  stroke={ctx.accentLiability}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={loEv.strokeDasharray}
                  strokeDashoffset={loEv.strokeDashoffset}
                />
                {dataset.years.map((yr, i) => {
                  if (i !== 0 && i !== lastIdx && i !== Math.floor(lastIdx / 2)) return null;
                  return (
                    <FittedSvgText
                      key={`djg-y-${i}`}
                      text={yr}
                      x={xAt(i)}
                      y={h - 10}
                      maxWidth={68}
                      fontSize={15.5}
                      minFontSize={14}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={ctx.inkSecondary}
                      textAnchor="middle"
                    />
                  );
                })}
                <g opacity={ctx.labelProgress}>
                  <circle cx={upPts[lastIdx][0]} cy={upPts[lastIdx][1]} r={6} fill={ctx.accentSolvent} />
                  <rect x={upPts[lastIdx][0] + 10} y={upEndY - 16} width={124} height={30} rx={5} fill={ctx.surfaceElevated} stroke={ctx.accentSolvent} strokeWidth="1.5" />
                  <FittedSvgText
                    text={`+${upPct.toFixed(1)}%`}
                    x={upPts[lastIdx][0] + 72}
                    y={upEndY + 5}
                    maxWidth={112}
                    fontSize={16}
                    minFontSize={14}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={ctx.accentSolvent}
                    textAnchor="middle"
                  />
                  <circle cx={loPts[lastIdx][0]} cy={loPts[lastIdx][1]} r={6} fill={ctx.accentLiability} />
                  <rect x={loPts[lastIdx][0] + 10} y={loEndY - 16} width={124} height={30} rx={5} fill={ctx.surfaceElevated} stroke={ctx.accentLiability} strokeWidth="1.5" />
                  <FittedSvgText
                    text={`+${loPct.toFixed(1)}%`}
                    x={loPts[lastIdx][0] + 72}
                    y={loEndY + 5}
                    maxWidth={112}
                    fontSize={16}
                    minFontSize={14}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={ctx.accentLiability}
                    textAnchor="middle"
                  />
                </g>
              </svg>

              {/* Compact 3-Column KPI Strip in Over-Footage Glass */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <div style={{ backgroundColor: ctx.surfaceElevated, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "8px", padding: "10px 10px" }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "10.5px", fontWeight: 700, color: ctx.inkMuted }}>PRODUCTIVITY</div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "19px", fontWeight: 700, color: ctx.accentSolvent, marginTop: "3px", ...TABULAR_NUM_STYLE }}>
                    +{upPct.toFixed(0)}%
                  </div>
                </div>
                <div style={{ backgroundColor: ctx.surfaceElevated, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "8px", padding: "10px 10px" }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "10.5px", fontWeight: 700, color: ctx.inkMuted }}>HOURLY PAY</div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "19px", fontWeight: 700, color: ctx.accentLiability, marginTop: "3px", ...TABULAR_NUM_STYLE }}>
                    +{loPct.toFixed(0)}%
                  </div>
                </div>
                <div style={{ backgroundColor: ctx.riskFill, border: `1px solid ${ctx.riskBorder}`, borderRadius: "8px", padding: "10px 10px" }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "10.5px", fontWeight: 700, color: ctx.accentLiability }}>JAWS SPREAD</div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "19px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "3px", ...TABULAR_NUM_STYLE }}>
                    +{spreadPctPts.toFixed(0)} pts
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Fullscreen Page Broadcast Layout
        const svgW = 1140;
        const svgH = 440;
        const padL = 86;
        const padR = 236;
        const padT = 34;
        const padB = 56;
        const plotW = svgW - padL - padR;
        const plotH = svgH - padT - padB;

        const xAt = (i: number): number =>
          padL + (i / Math.max(1, dataset.years.length - 1)) * plotW;
        const yAt = (v: number): number =>
          padT + (1 - (v - minV) / span) * plotH;

        const upPts: Array<[number, number]> = dataset.upperSeries.map((v, i) => [xAt(i), yAt(v)]);
        const loPts: Array<[number, number]> = dataset.lowerSeries.map((v, i) => [xAt(i), yAt(v)]);
        const upPath = pointsToPath(upPts);
        const loPath = pointsToPath(loPts);

        const polyPts = upPts
          .concat(loPts.slice().reverse())
          .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
          .join(" ");

        const upEv = evolvePath(ctx.curveProgress, upPath);
        const loEv = evolvePath(ctx.curveProgress, loPath);
        const upEndY = upPts[lastIdx][1];
        let loEndY = loPts[lastIdx][1];
        if (Math.abs(loEndY - upEndY) < 48) {
          loEndY = upEndY + 48;
        }

        const gaugeHeightPct = interpolate(ctx.curveProgress, [0, 1], [64.8, 51.7], CLAMP);

        return (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", gap: "14px" }}>
            <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 330px", gap: "22px", alignItems: "stretch" }}>
              {/* Main Dual-Line Chart */}
              <div style={{ backgroundColor: ctx.surfaceRecessed, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center" }}>
                <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "100%" }}>
                  <FittedSvgText
                    text={`INDEX (${dataset.baseYear} = ${upStart.toFixed(0)})`}
                    x={padL}
                    y={18}
                    maxWidth={260}
                    fontSize={12.5}
                    minFontSize={10}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={ctx.inkMuted}
                  />

                  {yTicks.map((val, idx) => {
                    const gy = yAt(val);
                    return (
                      <g key={`dj-g-${idx}`}>
                        <line
                          x1={padL}
                          y1={gy}
                          x2={svgW - padR}
                          y2={gy}
                          stroke={ctx.ruleHairline}
                          strokeWidth="1.2"
                          strokeDasharray={idx === 0 ? undefined : "4 4"}
                        />
                        <FittedSvgText
                          text={val.toFixed(0)}
                          x={padL - 12}
                          y={gy + 5}
                          maxWidth={68}
                          fontSize={14}
                          minFontSize={11}
                          fontKind="mono"
                          fontFamily={FONTS.mono}
                          fontWeight={600}
                          fill={ctx.inkMuted}
                          textAnchor="end"
                        />
                      </g>
                    );
                  })}

                  {/* Baseline Reference Line */}
                  <line
                    x1={padL}
                    y1={yAt(resolvedFloorVal)}
                    x2={svgW - padR}
                    y2={yAt(resolvedFloorVal)}
                    stroke={ctx.ruleOxford}
                    strokeWidth="1.8"
                    strokeDasharray="7 5"
                  />
                  <FittedSvgText
                    text={floorLabel}
                    x={padL + 10}
                    y={yAt(resolvedFloorVal) - 8}
                    maxWidth={260}
                    fontSize={12}
                    minFontSize={10}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={ctx.inkMuted}
                  />

                  {/* Shaded Jaws Wedge */}
                  <polygon points={polyPts} fill={ctx.accentLiability} opacity={0.14 * ctx.curveProgress} />

                  {/* Upper Productivity Curve */}
                  <path
                    d={upPath}
                    fill="none"
                    stroke={ctx.accentSolvent}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={upEv.strokeDasharray}
                    strokeDashoffset={upEv.strokeDashoffset}
                  />

                  {/* Lower Real Pay Curve */}
                  <path
                    d={loPath}
                    fill="none"
                    stroke={ctx.accentLiability}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={loEv.strokeDasharray}
                    strokeDashoffset={loEv.strokeDashoffset}
                  />

                  {/* X-Axis Year Ticks */}
                  {dataset.years.map((yr, i) => (
                    <g key={`dj-yr-${i}`}>
                      <line x1={xAt(i)} y1={svgH - padB} x2={xAt(i)} y2={svgH - padB + 6} stroke={ctx.ruleOxford} strokeWidth="1.5" />
                      <FittedSvgText
                        text={yr}
                        x={xAt(i)}
                        y={svgH - 22}
                        maxWidth={84}
                        fontSize={14.5}
                        minFontSize={11}
                        fontKind="mono"
                        fontFamily={FONTS.mono}
                        fontWeight={700}
                        fill={ctx.inkSecondary}
                        textAnchor="middle"
                      />
                    </g>
                  ))}

                  {/* Endpoint Callout Pills (100% visible by frame 30) */}
                  <g opacity={ctx.labelProgress}>
                    <circle cx={upPts[lastIdx][0]} cy={upPts[lastIdx][1]} r={9} fill={ctx.accentSolvent} opacity={0.22} />
                    <circle cx={upPts[lastIdx][0]} cy={upPts[lastIdx][1]} r={5.5} fill={ctx.accentSolvent} />
                    <rect
                      x={upPts[lastIdx][0] + 14}
                      y={upEndY - 22}
                      width={208}
                      height={42}
                      rx={6}
                      fill={ctx.surfaceElevated}
                      stroke={ctx.accentSolvent}
                      strokeWidth="1.8"
                    />
                    <FittedSvgText
                      text={dataset.upperLabel}
                      x={upPts[lastIdx][0] + 24}
                      y={upEndY - 4}
                      maxWidth={188}
                      fontSize={13.5}
                      minFontSize={10.5}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={ctx.accentSolvent}
                    />
                    <FittedSvgText
                      text={`INDEX ${upEnd.toFixed(1)}`}
                      x={upPts[lastIdx][0] + 24}
                      y={upEndY + 13}
                      maxWidth={188}
                      fontSize={11.5}
                      minFontSize={9.5}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fontWeight={600}
                      fill={ctx.inkMuted}
                    />

                    <circle cx={loPts[lastIdx][0]} cy={loPts[lastIdx][1]} r={9} fill={ctx.accentLiability} opacity={0.22} />
                    <circle cx={loPts[lastIdx][0]} cy={loPts[lastIdx][1]} r={5.5} fill={ctx.accentLiability} />
                    <rect
                      x={loPts[lastIdx][0] + 14}
                      y={loEndY - 22}
                      width={208}
                      height={42}
                      rx={6}
                      fill={ctx.surfaceElevated}
                      stroke={ctx.accentLiability}
                      strokeWidth="1.8"
                    />
                    <FittedSvgText
                      text={dataset.lowerLabel}
                      x={loPts[lastIdx][0] + 24}
                      y={loEndY - 4}
                      maxWidth={188}
                      fontSize={13.5}
                      minFontSize={10.5}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={ctx.accentLiability}
                    />
                    <FittedSvgText
                      text={`INDEX ${loEnd.toFixed(1)}`}
                      x={loPts[lastIdx][0] + 24}
                      y={loEndY + 13}
                      maxWidth={188}
                      fontSize={11.5}
                      minFontSize={9.5}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fontWeight={600}
                      fill={ctx.inkMuted}
                    />
                  </g>
                </svg>
              </div>

              {/* Dedicated Right-Hand Truman 1947->2026 Labor Share Gauge Panel */}
              <div
                style={{
                  backgroundColor: ctx.surfaceRecessed,
                  border: `1px solid ${ctx.ruleHairline}`,
                  borderRadius: "10px",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", color: ctx.accentLiability }}>
                    1947 → 2026 LABOR SHARE GAUGE
                  </div>
                  <div style={{ fontFamily: FONTS.serif, fontSize: "20px", fontWeight: 700, color: ctx.inkPrimary, marginTop: "4px", lineHeight: 1.2 }}>
                    Truman 53.0% Floor Pierced
                  </div>
                </div>

                <svg viewBox="0 0 290 170" style={{ width: "100%", height: "170px" }}>
                  {/* 70% top, 40% bottom scale */}
                  {[70, 60, 53, 45].map((pct) => {
                    const gy = 148 - ((pct - 42) / 30) * 124;
                    const isFloor = pct === 53;
                    return (
                      <g key={`lsg-${pct}`}>
                        <line
                          x1={48}
                          y1={gy}
                          x2={278}
                          y2={gy}
                          stroke={isFloor ? ctx.accentLiability : ctx.ruleHairline}
                          strokeWidth={isFloor ? "2.2" : "1"}
                          strokeDasharray={isFloor ? "5 4" : undefined}
                        />
                        <FittedSvgText
                          text={`${pct}%`}
                          x={42}
                          y={gy + 4}
                          maxWidth={38}
                          fontSize={11.5}
                          minFontSize={9.5}
                          fontKind="mono"
                          fontFamily={FONTS.mono}
                          fontWeight={isFloor ? 700 : 500}
                          fill={isFloor ? ctx.accentLiability : ctx.inkMuted}
                          textAnchor="end"
                        />
                      </g>
                    );
                  })}

                  {/* 1947 Bar */}
                  <rect x={68} y={148 - ((64.8 - 42) / 30) * 124} width={56} height={((64.8 - 42) / 30) * 124} rx={4} fill={ctx.accentStatutory} />
                  <FittedSvgText text="64.8%" x={96} y={148 - ((64.8 - 42) / 30) * 124 - 7} maxWidth={68} fontSize={13} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.inkPrimary} textAnchor="middle" />
                  <FittedSvgText text="1947" x={96} y={165} maxWidth={56} fontSize={12} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.inkSecondary} textAnchor="middle" />

                  {/* 2026 Pierced Bar */}
                  <rect
                    x={172}
                    y={148 - ((gaugeHeightPct - 42) / 30) * 124}
                    width={56}
                    height={Math.max(8, ((gaugeHeightPct - 42) / 30) * 124)}
                    rx={4}
                    fill={ctx.accentLiability}
                  />
                  <FittedSvgText
                    text={`${gaugeHeightPct.toFixed(1)}%`}
                    x={200}
                    y={148 - ((gaugeHeightPct - 42) / 30) * 124 - 7}
                    maxWidth={68}
                    fontSize={13.5}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.accentLiability}
                    textAnchor="middle"
                  />
                  <FittedSvgText text="2026" x={200} y={165} maxWidth={56} fontSize={12} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentLiability} textAnchor="middle" />
                </svg>

                <div style={{ borderTop: `1px solid ${ctx.ruleHairline}`, paddingTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: "12px", ...TABULAR_NUM_STYLE }}>
                    <span style={{ color: ctx.inkMuted }}>FLOOR BREACH</span>
                    <span style={{ color: ctx.accentLiability, fontWeight: 700 }}>53.0% → 51.7%</span>
                  </div>
                  {rawHero && /^\d+(?:\.\d+)?%$/.test(rawHero) && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: "12px", ...TABULAR_NUM_STYLE }}>
                      <span style={{ color: ctx.inkMuted }}>PAYROLL TAX SHARE</span>
                      <span style={{ color: ctx.inkPrimary, fontWeight: 700 }}>{rawHero}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom 3-Column Quantitative KPI Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px", flexShrink: 0 }}>
              <div style={{ backgroundColor: ctx.surfaceRecessed, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "8px", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: ctx.inkMuted }}>PRODUCTIVITY ({dataset.baseYear}–{dataset.years[lastIdx]})</div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: "14px", color: ctx.inkSecondary, marginTop: "2px", ...TABULAR_NUM_STYLE }}>
                    Index {upStart.toFixed(0)} → {upEnd.toFixed(1)}
                  </div>
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "28px", fontWeight: 700, color: ctx.accentSolvent, ...TABULAR_NUM_STYLE }}>
                  +{upPct.toFixed(1)}%
                </div>
              </div>

              <div style={{ backgroundColor: ctx.surfaceRecessed, border: `1px solid ${ctx.ruleHairline}`, borderRadius: "8px", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: ctx.inkMuted }}>REAL COMPENSATION</div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: "14px", color: ctx.inkSecondary, marginTop: "2px", ...TABULAR_NUM_STYLE }}>
                    Index {loStart.toFixed(0)} → {loEnd.toFixed(1)}
                  </div>
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "28px", fontWeight: 700, color: ctx.accentLiability, ...TABULAR_NUM_STYLE }}>
                  +{loPct.toFixed(1)}%
                </div>
              </div>

              <div style={{ position: "relative", backgroundColor: ctx.riskFill, border: `1px solid ${ctx.riskBorder}`, borderRadius: "8px", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", overflow: "hidden" }}>
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: ctx.accentLiability }}>DECOUPLING SPREAD</div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: "14px", color: ctx.inkPrimary, marginTop: "2px", fontWeight: 600 }}>
                    Uncompensated Output Wedge
                  </div>
                </div>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", padding: "2px 6px" }}>
                  <div style={{ position: "absolute", left: -4, top: 0, zIndex: 0 }}>
                    <HighlighterStroke width={148} height={30} progress={ctx.labelProgress} register={ctx.registerId} seed={71} />
                  </div>
                  <span style={{ position: "relative", zIndex: 1, fontFamily: FONTS.mono, fontSize: "28px", fontWeight: 700, color: ctx.inkPrimary, ...TABULAR_NUM_STYLE }}>
                    +{spreadPctPts.toFixed(1)} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 2. NegativeFcfWaterfall ($740B-$820B Capex Plunging Below $0 into -$42B FCF)
// ============================================================================
export interface WaterfallStepItem {
  label: string;
  start: number;
  end: number;
  displayValue: string;
  tone: "positive" | "deduction" | "negative-net";
}

export interface NegativeFcfWaterfallProps extends BaseTelemetryProps {
  steps?: WaterfallStepItem[];
}

export const NegativeFcfWaterfall: React.FC<NegativeFcfWaterfallProps> = ({
  steps = [
    { label: "Operating Cash Flow", start: 0, end: 738, displayValue: "+$738B", tone: "positive" },
    { label: "AI Silicon & Fab Capex", start: 738, end: 218, displayValue: "-$520B", tone: "deduction" },
    { label: "Power & Land PPAs", start: 218, end: -42, displayValue: "-$260B", tone: "deduction" },
    { label: "Net Free Cash Flow", start: 0, end: -42, displayValue: "-$42B", tone: "negative-net" },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="CASH-FLOW BRIDGE · HYPERSCALER CAPEX CYCLE"
      defaultTitle="From Cash Machine to Deficit: $780B Capex Plunges FCF Below Zero"
      defaultSubtitle="Combined operating cash inflows (+$738B) are completely consumed by $740B–$820B of AI data-center & power commitments, submerging net FCF to -$42B."
      defaultHeroBadge="NET FCF: -$42B"
      defaultCitation="SEC Form 10-K Cash Flow Statements & Consensus Capex Ledger"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const allPts = steps.flatMap((s) => [s.start, s.end]);
        const maxV = Math.max(840, ...allPts) + 60;
        const minV = Math.min(-160, ...allPts) - 40;
        const span = Math.max(1, maxV - minV);
        const padL = ctx.isGlass ? 26 : 86;
        const padR = ctx.isGlass ? 26 : 86;
        const padT = ctx.isGlass ? 32 : 48;
        const padB = ctx.isGlass ? 54 : 68;
        const plotH = h - padT - padB;
        const yAt = (v: number): number => padT + ((maxV - v) / span) * plotH;
        const zeroY = yAt(0);
        const usableW = w - padL - padR;
        const colW = ctx.isGlass ? Math.min(96, usableW / Math.max(1, steps.length) - 18) : 210;
        const gap = (usableW - steps.length * colW) / Math.max(1, steps.length - 1);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {/* Y Gridlines in Page Mode */}
            {!ctx.isGlass &&
              [0, 250, 500, 750].map((gv) => (
                <g key={`wf-g-${gv}`}>
                  <line x1={padL} y1={yAt(gv)} x2={w - padR} y2={yAt(gv)} stroke={ctx.ruleHairline} strokeWidth="1.2" strokeDasharray="4 4" />
                  <FittedSvgText
                    text={`$${gv}B`}
                    x={padL - 10}
                    y={yAt(gv) + 4}
                    maxWidth={70}
                    fontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkMuted}
                    textAnchor="end"
                  />
                </g>
              ))}

            <rect
              x={padL}
              y={zeroY}
              width={usableW}
              height={Math.max(0, yAt(minV) - zeroY)}
              fill={ctx.accentLiability}
              opacity={0.09}
            />
            <line
              x1={padL}
              y1={zeroY}
              x2={w - padR}
              y2={zeroY}
              stroke={ctx.ruleOxford}
              strokeWidth="2.2"
            />
            <FittedSvgText
              text="$0 BREAKEVEN LINE"
              x={padL + 6}
              y={zeroY - 8}
              maxWidth={220}
              fontSize={ctx.isGlass ? 13 : 13.5}
              minFontSize={11}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={ctx.inkPrimary}
            />

            {steps.map((st, i) => {
              const x = padL + i * (colW + gap);
              const topVal = Math.max(st.start, st.end);
              const botVal = Math.min(st.start, st.end);
              const rawY = yAt(topVal);
              const rawH = Math.max(10, yAt(botVal) - rawY);
              const animH = rawH * ctx.curveProgress;
              const rectY = st.end < 0 && st.start === 0 ? zeroY : rawY + (rawH - animH);
              const valY = st.end < 0 ? Math.min(h - padB - 8, yAt(botVal) + (ctx.isGlass ? 22 : 28)) : Math.max(20, rawY - 12);

              const fill =
                st.tone === "positive"
                  ? ctx.accentStatutory
                  : st.tone === "negative-net"
                  ? ctx.accentLiability
                  : ctx.accentCapital;

              return (
                <g key={`wf-${i}`}>
                  <rect x={x} y={rectY} width={colW} height={animH} rx={6} fill={fill} />
                  <FittedSvgText
                    text={st.displayValue}
                    x={x + colW / 2}
                    y={valY}
                    maxWidth={colW + 24}
                    fontSize={ctx.isGlass ? 17 : 22}
                    minFontSize={14}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={st.tone === "negative-net" ? ctx.accentLiability : ctx.inkPrimary}
                    textAnchor="middle"
                  />
                  <WrappedSvgText
                    text={st.label}
                    x={x + colW / 2}
                    y={h - padB + 22}
                    maxWidth={colW + gap * 0.72}
                    fontSize={ctx.isGlass ? 15 : 16}
                    minFontSize={12.5}
                    maxLines={2}
                    fontKind="sans"
                    fontFamily={FONTS.sans}
                    fontWeight={600}
                    fill={ctx.inkSecondary}
                    textAnchor="middle"
                  />
                  {i < steps.length - 1 && (
                    <line
                      x1={x + colW}
                      y1={yAt(st.end)}
                      x2={x + colW + gap}
                      y2={yAt(st.end)}
                      stroke={ctx.inkMuted}
                      strokeWidth="1.6"
                      strokeDasharray="5 5"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 3. WealthDecileMonoliths (Top 10% = 90% vs Bottom 50% = 1% + Magnifier Inset)
// ============================================================================
export interface WealthDecileItem {
  cohort: string;
  sharePct: number;
  note: string;
}

export interface WealthDecileMonolithsProps extends BaseTelemetryProps {
  deciles?: WealthDecileItem[];
}

export const WealthDecileMonoliths: React.FC<WealthDecileMonolithsProps> = ({
  deciles = [
    { cohort: "Top 10% Households", sharePct: 90.2, note: "Equities & Corporate Claims" },
    { cohort: "Next 40% (50th–90th)", sharePct: 8.8, note: "401(k) & Retirement Accounts" },
    { cohort: "Bottom 50% (167M Americans)", sharePct: 1.0, note: "1.0% Sliver · Wage Dependent" },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="FEDERAL RESERVE DFA · EQUITY OWNERSHIP CONCENTRATION"
      defaultTitle="Capital Monoliths: Top 10% Hold 90.2% vs. Bottom 50% Hold 1.0%"
      defaultSubtitle="When labor income decouples from corporate asset appreciation, 90% of equity upside flows to the top decile while the bottom half holds a 1% sliver."
      defaultHeroBadge="90.2% VS. 1.0%"
      defaultCitation="Federal Reserve Distributional Financial Accounts (DFA), Corporate Equities"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const baseLineY = ctx.isGlass ? 304 : 500;
        const maxBarH = ctx.isGlass ? 226 : 410;
        const count = Math.max(1, deciles.length);

        if (ctx.isGlass) {
          const padL = 24;
          const step = (w - 48) / count;
          const barW = Math.min(110, step * 0.62);
          return (
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
              <line x1={padL} y1={baseLineY} x2={w - padL} y2={baseLineY} stroke={ctx.ruleOxford} strokeWidth="2" />
              {deciles.map((d, i) => {
                const cx = padL + step * (i + 0.5);
                const x = cx - barW / 2;
                const hPx = Math.max(6, (d.sharePct / 100) * maxBarH * ctx.curveProgress);
                const isSliver = d.sharePct <= 2;
                const fill = i === 0 ? ctx.accentStatutory : isSliver ? ctx.accentLiability : ctx.accentCapital;
                return (
                  <g key={`wdg-${i}`}>
                    <rect x={x} y={baseLineY - hPx} width={barW} height={hPx} rx={5} fill={fill} />
                    <FittedSvgText
                      text={`${d.sharePct.toFixed(1)}%`}
                      x={cx}
                      y={baseLineY - hPx - 12}
                      maxWidth={step - 12}
                      fontSize={22}
                      minFontSize={16}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fill={isSliver ? ctx.accentLiability : ctx.inkPrimary}
                      textAnchor="middle"
                    />
                    <WrappedSvgText
                      text={d.cohort}
                      x={cx}
                      y={baseLineY + 24}
                      maxWidth={step - 12}
                      fontSize={15}
                      minFontSize={13.5}
                      maxLines={2}
                      fontKind="sans"
                      fontFamily={FONTS.sans}
                      fontWeight={700}
                      fill={ctx.inkPrimary}
                      textAnchor="middle"
                    />
                  </g>
                );
              })}

              {/* Compact Top-Right Optical Loupe Badge */}
              <g opacity={ctx.labelProgress}>
                <rect x={312} y={24} width={264} height={96} rx={10} fill={ctx.surfaceRecessed} stroke="#B08D57" strokeWidth="2.5" />
                <FittedSvgText text="8.0X OPTICAL LOUPE" x={444} y={50} maxWidth={240} fontSize={14} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.inkMuted} textAnchor="middle" />
                <FittedSvgText text="1.0% SLIVER" x={444} y={82} maxWidth={240} fontSize={24} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentLiability} textAnchor="middle" />
                <FittedSvgText text="Bottom 50% Combined" x={444} y={105} maxWidth={240} fontSize={14.5} fontKind="sans" fontFamily={FONTS.sans} fontWeight={600} fill={ctx.inkSecondary} textAnchor="middle" />
              </g>
            </svg>
          );
        }

        const padL = 90;
        const barsZoneW = 1030;
        const step = barsZoneW / count;
        const barW = Math.min(220, step * 0.66);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={padL} y1={baseLineY} x2={padL + barsZoneW} y2={baseLineY} stroke={ctx.ruleOxford} strokeWidth="2.5" />

            {deciles.map((d, i) => {
              const cx = padL + step * (i + 0.5);
              const x = cx - barW / 2;
              const hPx = Math.max(5, (d.sharePct / 100) * maxBarH * ctx.curveProgress);
              const isSliver = d.sharePct <= 2;
              const fill = i === 0 ? ctx.accentStatutory : isSliver ? ctx.accentLiability : ctx.accentCapital;

              return (
                <g key={`wd-${i}`}>
                  <rect x={x} y={baseLineY - hPx} width={barW} height={hPx} rx={4} fill={fill} />
                  <FittedSvgText
                    text={`${d.sharePct.toFixed(1)}%`}
                    x={cx}
                    y={baseLineY - hPx - 16}
                    maxWidth={step - 24}
                    fontSize={28}
                    minFontSize={18}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={isSliver ? ctx.accentLiability : ctx.inkPrimary}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={d.cohort}
                    x={cx}
                    y={baseLineY + 32}
                    maxWidth={step - 20}
                    fontSize={16}
                    minFontSize={12}
                    fontKind="sans"
                    fontFamily={FONTS.sans}
                    fontWeight={700}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={d.note}
                    x={cx}
                    y={baseLineY + 56}
                    maxWidth={step - 20}
                    fontSize={13}
                    minFontSize={10.5}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fontWeight={500}
                    fill={ctx.inkMuted}
                    textAnchor="middle"
                  />
                </g>
              );
            })}

            {/* Optical Brass Magnifier Callout Inspecting the 1.0% Sliver */}
            <g opacity={ctx.labelProgress}>
              <line
                x1={padL + step * (count - 0.5)}
                y1={baseLineY - 6}
                x2={1210}
                y2={285}
                stroke={ctx.accentLiability}
                strokeWidth="2.2"
                strokeDasharray="6 5"
              />
              <circle cx={1330} cy={245} r={138} fill={ctx.surfaceRecessed} stroke="#B08D57" strokeWidth="6" />
              <line x1={1224} y1={305} x2={1436} y2={305} stroke={ctx.ruleOxford} strokeWidth="2" />
              <rect x={1265} y={269} width={130} height={36} rx={4} fill={ctx.accentLiability} />
              <FittedSvgText text="8.0X OPTICAL LOUPE" x={1330} y={175} maxWidth={210} fontSize={13} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.inkMuted} textAnchor="middle" />
              <FittedSvgText text="1.0% SHARE" x={1330} y={218} maxWidth={228} fontSize={32} minFontSize={20} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentLiability} textAnchor="middle" />
              <FittedSvgText text="Bottom 50% Combined" x={1330} y={248} maxWidth={220} fontSize={14} fontKind="sans" fontFamily={FONTS.sans} fontWeight={600} fill={ctx.inkSecondary} textAnchor="middle" />
            </g>
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 4. AuctionPriceShockwave ($28.92 -> $269.92/MW-day, +833% Step Eruption)
// ============================================================================
export interface AuctionStepDatum {
  deliveryYear: string;
  priceMwDay: number;
}

export interface AuctionPriceShockwaveProps extends BaseTelemetryProps {
  auctions?: AuctionStepDatum[];
}

export const AuctionPriceShockwave: React.FC<AuctionPriceShockwaveProps> = ({
  auctions = [
    { deliveryYear: "2022/23", priceMwDay: 50.0 },
    { deliveryYear: "2023/24", priceMwDay: 34.13 },
    { deliveryYear: "2024/25", priceMwDay: 28.92 },
    { deliveryYear: "2025/26", priceMwDay: 269.92 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="PJM INTERCONNECTION · BASE RESIDUAL AUCTION"
      defaultTitle="Grid Capacity Eruption: $28.92 to $269.92 / MW-Day (+833%)"
      defaultSubtitle="Data-center 24/7 firm load collides with thermal plant retirements across the 13-state PJM grid, triggering a vertical clearing-price shockwave."
      defaultHeroBadge="+833% SPIKE"
      defaultCitation="PJM Base Residual Auction Clearing Report (2025/2026 Delivery Year)"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 66 : 110;
        const padR = ctx.isGlass ? 32 : 140;
        const baseY = ctx.isGlass ? 322 : 515;
        const maxH = ctx.isGlass ? 250 : 410;
        const maxP = Math.max(300, ...auctions.map((a) => a.priceMwDay * 1.12));
        const stepW = (w - padL - padR) / Math.max(1, auctions.length);

        const stepCoords: string[] = [];
        for (let i = 0; i < auctions.length; i++) {
          const x0 = padL + i * stepW;
          const x1 = x0 + stepW;
          const y = baseY - (auctions[i].priceMwDay / maxP) * maxH;
          stepCoords.push(`${i === 0 ? "M" : "L"} ${x0.toFixed(1)} ${y.toFixed(1)} L ${x1.toFixed(1)} ${y.toFixed(1)}`);
        }
        const fullStepPath = stepCoords.join(" ");
        const ev = evolvePath(ctx.curveProgress, fullStepPath);

        const spikeX = padL + (auctions.length - 0.5) * stepW;
        const spikeY = baseY - (auctions[auctions.length - 1].priceMwDay / maxP) * maxH;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[0, 100, 200, 300].map((val) => {
              const gy = baseY - (val / maxP) * maxH;
              return (
                <g key={`ap-g-${val}`}>
                  <line x1={padL} y1={gy} x2={w - padR} y2={gy} stroke={ctx.ruleHairline} strokeWidth="1.2" />
                  <FittedSvgText
                    text={`$${val}`}
                    x={padL - 10}
                    y={gy + 5}
                    maxWidth={padL - 16}
                    fontSize={ctx.isGlass ? 15 : 15}
                    minFontSize={12}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkMuted}
                    textAnchor="end"
                  />
                </g>
              );
            })}

            {ctx.curveProgress > 0.65 && (
              <g opacity={interpolate(ctx.curveProgress, [0.65, 1], [0.85, 0.3], CLAMP)}>
                <circle cx={spikeX} cy={spikeY} r={(ctx.isGlass ? 18 : 30) + ctx.progress * 28} fill="none" stroke={ctx.accentLiability} strokeWidth="2.5" />
                <circle cx={spikeX} cy={spikeY} r={(ctx.isGlass ? 10 : 16) + ctx.progress * 14} fill="none" stroke={ctx.accentLiability} strokeWidth="3" />
              </g>
            )}

            <path
              d={fullStepPath}
              fill="none"
              stroke={ctx.accentLiability}
              strokeWidth={ctx.isGlass ? "4.5" : "6"}
              strokeLinejoin="miter"
              strokeDasharray={ev.strokeDasharray}
              strokeDashoffset={ev.strokeDashoffset}
            />

            {auctions.map((a, i) => {
              const cx = padL + (i + 0.5) * stepW;
              const cy = baseY - (a.priceMwDay / maxP) * maxH;
              const isSpike = i === auctions.length - 1;
              return (
                <g key={`ap-lbl-${i}`}>
                  <FittedSvgText
                    text={a.deliveryYear}
                    x={cx}
                    y={baseY + (ctx.isGlass ? 28 : 34)}
                    maxWidth={stepW - 8}
                    fontSize={ctx.isGlass ? 15 : 16}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkSecondary}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={`$${a.priceMwDay.toFixed(2)}`}
                    x={cx}
                    y={Math.max(24, cy - 16)}
                    maxWidth={stepW + 16}
                    fontSize={isSpike ? (ctx.isGlass ? 20 : 28) : ctx.isGlass ? 15.5 : 19}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={isSpike ? ctx.accentLiability : ctx.inkPrimary}
                    textAnchor="middle"
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 5. JevonsDeflationCurve (-99% Unit Token Cost Plunge vs Automated Volume Surge)
// ============================================================================
export interface JevonsDeflationCurveProps extends BaseTelemetryProps {
  periods?: string[];
  unitCostIndex?: number[];
  volumeIndex?: number[];
}

export const JevonsDeflationCurve: React.FC<JevonsDeflationCurveProps> = ({
  periods = ["2023 Q1", "2023 Q4", "2024 Q3", "2025 Q2", "2026 Q1", "2026 Q4"],
  unitCostIndex = [100, 42, 16, 5.5, 1.8, 1.0],
  volumeIndex = [4, 12, 29, 54, 82, 100],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="JEVONS PARADOX · COGNITIVE DEFLATION"
      defaultTitle="Unit Inference Cost Plunges -99% While Agentic Token Volume Rockets 25x"
      defaultSubtitle="Collapsing marginal cost per million tokens triggers hyper-elastic enterprise automation rather than reducing aggregate compute expenditure."
      defaultHeroBadge="-99% / UNIT"
      defaultCitation="Epoch AI Inference Price Index & Hyperscaler Token Telemetry"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 54 : 100;
        const padR = ctx.isGlass ? 30 : 120;
        const padT = ctx.isGlass ? 42 : 56;
        const plotH = ctx.isGlass ? 268 : 440;
        const plotW = w - padL - padR;

        const xAt = (i: number): number => padL + (i / Math.max(1, periods.length - 1)) * plotW;
        const yAt = (v: number): number => padT + (1 - v / 105) * plotH;

        const costPath = pointsToPath(unitCostIndex.map((v, i) => [xAt(i), yAt(v)]));
        const volPath = pointsToPath(volumeIndex.map((v, i) => [xAt(i), yAt(v)]));
        const costEv = evolvePath(ctx.curveProgress, costPath);
        const volEv = evolvePath(ctx.curveProgress, volPath);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={`jv-${v}`}>
                <line x1={padL} y1={yAt(v)} x2={w - padR} y2={yAt(v)} stroke={ctx.ruleHairline} strokeWidth="1.2" />
                <FittedSvgText
                  text={`${v}`}
                  x={padL - 10}
                  y={yAt(v) + 5}
                  maxWidth={padL - 14}
                  fontSize={ctx.isGlass ? 14.5 : 14}
                  minFontSize={12}
                  fontKind="mono"
                  fontFamily={FONTS.mono}
                  fill={ctx.inkMuted}
                  textAnchor="end"
                />
              </g>
            ))}

            <path d={costPath} fill="none" stroke={ctx.accentSolvent} strokeWidth={ctx.isGlass ? "4.5" : "5.5"} strokeLinecap="round" strokeDasharray={costEv.strokeDasharray} strokeDashoffset={costEv.strokeDashoffset} />
            <path d={volPath} fill="none" stroke={ctx.accentLiability} strokeWidth={ctx.isGlass ? "4.5" : "5.5"} strokeLinecap="round" strokeDasharray={volEv.strokeDasharray} strokeDashoffset={volEv.strokeDashoffset} />

            {periods.map((p, i) => {
              if (ctx.isGlass && i % 2 !== 0 && i !== periods.length - 1) return null;
              return (
                <FittedSvgText
                  key={`jv-p-${i}`}
                  text={p}
                  x={xAt(i)}
                  y={h - (ctx.isGlass ? 14 : 26)}
                  maxWidth={ctx.isGlass ? 96 : 150}
                  fontSize={ctx.isGlass ? 14.5 : 14.5}
                  minFontSize={12}
                  fontKind="mono"
                  fontFamily={FONTS.mono}
                  fill={ctx.inkSecondary}
                  textAnchor="middle"
                />
              );
            })}

            <FittedSvgText
              text="UNIT PRICE INDEX (100 → 1.0)"
              x={xAt(0) + 10}
              y={Math.max(22, yAt(unitCostIndex[0]) - 14)}
              maxWidth={plotW * 0.65}
              fontSize={ctx.isGlass ? 15 : 16}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentSolvent}
              opacity={ctx.labelProgress}
            />
            <FittedSvgText
              text="AUTOMATED VOLUME (25X SURGE)"
              x={xAt(periods.length - 1) - 10}
              y={Math.max(22, yAt(volumeIndex[volumeIndex.length - 1]) - 14)}
              maxWidth={plotW * 0.65}
              fontSize={ctx.isGlass ? 15 : 16}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentLiability}
              textAnchor="end"
              opacity={ctx.labelProgress}
            />
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 6. SovereignSpreadFlip (France 4.93% OAT Crossing Above Greece 4.26% +67 bps)
// ============================================================================
export interface SovereignSpreadFlipProps extends BaseTelemetryProps {
  quarters?: string[];
  franceYields?: number[];
  greeceYields?: number[];
}

export const SovereignSpreadFlip: React.FC<SovereignSpreadFlipProps> = ({
  quarters = ["2021", "2022", "2023", "2024", "2025", "2026"],
  franceYields = [0.2, 2.45, 3.12, 3.38, 4.18, 4.93],
  greeceYields = [1.35, 4.58, 3.95, 3.32, 3.84, 4.26],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="EUROZONE SOVEREIGN BOND DESK · 10Y BENCHMARK INVERSION"
      defaultTitle="Core-Periphery Flip: France 10Y OAT (4.93%) Trades Above Greece (4.26%)"
      defaultSubtitle="Bond vigilantes reprice structural fiscal deficits: French 10-year yields cross +67 bps above Greek sovereign paper."
      defaultHeroBadge="SPREAD: +67 BPS"
      defaultCitation="Bloomberg / MTS Eurozone Sovereign Benchmark Yields"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 58 : 100;
        const padR = ctx.isGlass ? 148 : 240;
        const padT = ctx.isGlass ? 26 : 48;
        const plotH = ctx.isGlass ? 290 : 450;
        const plotW = w - padL - padR;
        const maxY = Math.max(5.6, ...franceYields, ...greeceYields) + 0.3;

        const xAt = (i: number): number => padL + (i / Math.max(1, quarters.length - 1)) * plotW;
        const yAt = (v: number): number => padT + (1 - v / maxY) * plotH;

        const frPts: Array<[number, number]> = franceYields.map((v, i) => [xAt(i), yAt(v)]);
        const grPts: Array<[number, number]> = greeceYields.map((v, i) => [xAt(i), yAt(v)]);
        const frPath = pointsToPath(frPts);
        const grPath = pointsToPath(grPts);

        const frEv = evolvePath(ctx.curveProgress, frPath);
        const grEv = evolvePath(ctx.curveProgress, grPath);
        const last = quarters.length - 1;

        const frY = frPts[last][1];
        let grY = grPts[last][1];
        if (Math.abs(grY - frY) < 30) {
          grY = frY + (grY >= frY ? 30 : -30);
        }

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[0, 1, 2, 3, 4, 5].map((yVal) => (
              <g key={`ssf-${yVal}`}>
                <line x1={padL} y1={yAt(yVal)} x2={w - padR} y2={yAt(yVal)} stroke={ctx.ruleHairline} strokeWidth="1.2" />
                <FittedSvgText
                  text={`${yVal.toFixed(1)}%`}
                  x={padL - 10}
                  y={yAt(yVal) + 5}
                  maxWidth={padL - 14}
                  fontSize={15}
                  minFontSize={12}
                  fontKind="mono"
                  fontFamily={FONTS.mono}
                  fill={ctx.inkMuted}
                  textAnchor="end"
                />
              </g>
            ))}

            <path d={grPath} fill="none" stroke={ctx.accentSolvent} strokeWidth="4.5" strokeDasharray={grEv.strokeDasharray} strokeDashoffset={grEv.strokeDashoffset} />
            <path d={frPath} fill="none" stroke={ctx.accentLiability} strokeWidth="5.5" strokeDasharray={frEv.strokeDasharray} strokeDashoffset={frEv.strokeDashoffset} />

            {quarters.map((q, i) => {
              if (ctx.isGlass && i % 2 !== 0 && i !== last) return null;
              return (
                <FittedSvgText
                  key={`ssf-q-${i}`}
                  text={q}
                  x={xAt(i)}
                  y={h - (ctx.isGlass ? 14 : 24)}
                  maxWidth={80}
                  fontSize={15}
                  minFontSize={12}
                  fontKind="mono"
                  fontFamily={FONTS.mono}
                  fill={ctx.inkSecondary}
                  textAnchor="middle"
                />
              );
            })}

            <g opacity={ctx.labelProgress}>
              <line x1={frPts[last][0]} y1={frPts[last][1]} x2={grPts[last][0]} y2={grPts[last][1]} stroke={ctx.accentLiability} strokeWidth="3" strokeDasharray="4 4" />
              <circle cx={frPts[last][0]} cy={frPts[last][1]} r={5} fill={ctx.accentLiability} />
              <circle cx={grPts[last][0]} cy={grPts[last][1]} r={5} fill={ctx.accentSolvent} />
              <FittedSvgText
                text={ctx.isGlass ? `FR · ${franceYields[last].toFixed(2)}%` : `FRANCE OAT · ${franceYields[last].toFixed(2)}%`}
                x={frPts[last][0] + 12}
                y={frY + 5}
                maxWidth={padR - 18}
                fontSize={ctx.isGlass ? 16 : 17}
                minFontSize={13}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill={ctx.accentLiability}
              />
              <FittedSvgText
                text={ctx.isGlass ? `GR · ${greeceYields[last].toFixed(2)}%` : `GREECE GGB · ${greeceYields[last].toFixed(2)}%`}
                x={grPts[last][0] + 12}
                y={grY + 5}
                maxWidth={padR - 18}
                fontSize={ctx.isGlass ? 16 : 17}
                minFontSize={13}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill={ctx.accentSolvent}
              />
            </g>
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 7. DebtDeflationJaws1933 (Irving Fisher Falling Wages vs Frozen Nominal Debt)
// ============================================================================
export interface DebtDeflationJaws1933Props extends BaseTelemetryProps {
  years?: string[];
  nominalWageIndex?: number[];
  realDebtBurdenIndex?: number[];
}

export const DebtDeflationJaws1933: React.FC<DebtDeflationJaws1933Props> = ({
  years = ["1929", "1930", "1931", "1932", "1933"],
  nominalWageIndex = [100, 89, 76, 61, 52],
  realDebtBurdenIndex = [100, 112, 128, 154, 174],
  register = REGISTERS.archival_parchment.id,
  ...base
}) => {
  return (
    <TelemetryShell
      register={register}
      defaultKicker="IRVING FISHER PARADOX · 1929–1933 DEBT DEFLATION"
      defaultTitle="Prices & Wages Collapse (-48%) Against an Immovable Nominal Debt Bar"
      defaultSubtitle="Contractual mortgages stay frozen at 100 nominal cents on the dollar, causing the real debt burden per bushel and paycheck to swell +74%."
      defaultHeroBadge="REAL BURDEN: +74%"
      defaultCitation="Irving Fisher, Econometrica Vol. 1 (1933) & NBER Historical Series"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 54 : 100;
        const padR = ctx.isGlass ? 136 : 220;
        const padT = ctx.isGlass ? 26 : 48;
        const plotH = ctx.isGlass ? 290 : 450;
        const plotW = w - padL - padR;
        const yAt = (v: number): number => padT + ((190 - v) / 150) * plotH;
        const xAt = (i: number): number => padL + (i / Math.max(1, years.length - 1)) * plotW;

        const wagePath = pointsToPath(nominalWageIndex.map((v, i) => [xAt(i), yAt(v)]));
        const realPath = pointsToPath(realDebtBurdenIndex.map((v, i) => [xAt(i), yAt(v)]));
        const wEv = evolvePath(ctx.curveProgress, wagePath);
        const rEv = evolvePath(ctx.curveProgress, realPath);
        const last = years.length - 1;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[50, 100, 150, 175].map((gv) => (
              <g key={`dd-g-${gv}`}>
                <line x1={padL} y1={yAt(gv)} x2={w - padR} y2={yAt(gv)} stroke={ctx.ruleHairline} strokeWidth="1" />
                <FittedSvgText text={`${gv}`} x={padL - 10} y={yAt(gv) + 4} maxWidth={padL - 14} fontSize={14} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.inkMuted} textAnchor="end" />
              </g>
            ))}

            <rect x={padL} y={yAt(100) - 6} width={plotW} height={12} rx={3} fill={ctx.ruleOxford} opacity={0.85} />
            <FittedSvgText
              text={ctx.isGlass ? "FROZEN DEBT (100)" : "FROZEN NOMINAL DEBT CONTRACT (INDEX = 100.0)"}
              x={padL + 10}
              y={yAt(100) - 12}
              maxWidth={plotW - 20}
              fontSize={ctx.isGlass ? 14 : 15}
              minFontSize={11}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.inkPrimary}
            />

            <path d={wagePath} fill="none" stroke={ctx.accentSolvent} strokeWidth="5" strokeDasharray={wEv.strokeDasharray} strokeDashoffset={wEv.strokeDashoffset} />
            <path d={realPath} fill="none" stroke={ctx.accentLiability} strokeWidth="5.5" strokeDasharray={rEv.strokeDasharray} strokeDashoffset={rEv.strokeDashoffset} />

            {years.map((yr, i) => (
              <FittedSvgText
                key={`dd33-${i}`}
                text={yr}
                x={xAt(i)}
                y={h - (ctx.isGlass ? 14 : 26)}
                maxWidth={68}
                fontSize={15}
                minFontSize={12}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill={ctx.inkSecondary}
                textAnchor="middle"
              />
            ))}

            <g opacity={ctx.labelProgress}>
              <FittedSvgText
                text={`REAL DEBT (${realDebtBurdenIndex[last]})`}
                x={xAt(last) + 12}
                y={yAt(realDebtBurdenIndex[last]) + 5}
                maxWidth={padR - 18}
                fontSize={ctx.isGlass ? 15.5 : 16}
                minFontSize={13}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill={ctx.accentLiability}
              />
              <FittedSvgText
                text={`WAGES (${nominalWageIndex[last]})`}
                x={xAt(last) + 12}
                y={yAt(nominalWageIndex[last]) + 5}
                maxWidth={padR - 18}
                fontSize={ctx.isGlass ? 15.5 : 16}
                minFontSize={13}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill={ctx.accentSolvent}
              />
            </g>
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 8. GoldVsFiatFedCorridor (1933 Gold Lock vs 2% CPI Liquidity Pump)
// ============================================================================
export interface GoldVsFiatFedCorridorProps extends BaseTelemetryProps {
  leftRegimeTitle?: string;
  rightRegimeTitle?: string;
  goldRatioPct?: number;
  fiatExpansionMultiple?: number;
}

export const GoldVsFiatFedCorridor: React.FC<GoldVsFiatFedCorridorProps> = ({
  leftRegimeTitle = "1933 GOLD RESERVE LOCK",
  rightRegimeTitle = "POST-1971 FIAT LIQUIDITY CORRIDOR",
  goldRatioPct = 40,
  fiatExpansionMultiple = 9.4,
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="MONETARY REGIME ARCHITECTURE · 1933 VS. 2026"
      defaultTitle="Why Deflation Stopped: Gold Reserve Ceiling vs. 2% CPI Liquidity Pump"
      defaultSubtitle="In 1933, statutory 40% gold backing capped money creation; today, any deflationary shock triggers automatic balance-sheet expansion."
      defaultHeroBadge="2.0% CPI FLOOR"
      defaultCitation="Federal Reserve Act §16 (1913) vs. FOMC Statement on Longer-Run Goals"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;

        if (ctx.isGlass) {
          return (
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
              {/* Top Panel: 1933 */}
              <rect x={16} y={14} width={568} height={164} rx={10} fill={ctx.surfaceRecessed} stroke={ctx.ruleOxford} strokeWidth="1.8" />
              <FittedSvgText text={leftRegimeTitle} x={34} y={44} maxWidth={532} fontSize={15.5} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentCapital} />
              <line x1={34} y1={84} x2={566} y2={84} stroke={ctx.accentCapital} strokeWidth="3.5" />
              <FittedSvgText text={`STATUTORY GOLD CEILING (${goldRatioPct}% COVER)`} x={34} y={74} maxWidth={532} fontSize={14} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentCapital} />
              <rect x={34} y={92} width={532 * ctx.curveProgress} height={68} rx={6} fill={ctx.accentStatutory} opacity={0.85} />
              <FittedSvgText text="Credit Collapses Inside Vault Limit" x={300} y={133} maxWidth={500} fontSize={18} fontKind="serif" fontFamily={FONTS.serif} fill={ctx.solidBarInk} textAnchor="middle" />

              {/* Bottom Panel: Post-1971 */}
              <rect x={16} y={196} width={568} height={170} rx={10} fill={ctx.surfaceRecessed} stroke={ctx.accentLiability} strokeWidth="1.8" />
              <FittedSvgText text={rightRegimeTitle} x={34} y={226} maxWidth={380} fontSize={15.5} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentLiability} />
              <FittedSvgText text={`${fiatExpansionMultiple.toFixed(1)}x M2`} x={566} y={232} maxWidth={160} fontSize={22} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentLiability} textAnchor="end" />
              <path d="M 40 326 Q 190 318 320 280 T 556 244" fill="none" stroke={ctx.accentLiability} strokeWidth="5" strokeLinecap="round" opacity={ctx.curveProgress} />
              <line x1={34} y1={326} x2={566} y2={326} stroke={ctx.accentSolvent} strokeWidth="2" strokeDasharray="7 5" />
              <FittedSvgText text="2.0% TARGET FLOOR · ZERO BULLION CAP" x={34} y={350} maxWidth={532} fontSize={14.5} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentSolvent} />
            </svg>
          );
        }

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {/* Left Regime Box: 1933 Hard Gold Ceiling */}
            <rect x={70} y={50} width={660} height={490} rx={10} fill={ctx.surfaceRecessed} stroke={ctx.ruleOxford} strokeWidth="2" />
            <FittedSvgText text={leftRegimeTitle} x={110} y={102} maxWidth={580} fontSize={16} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentCapital} />
            <line x1={110} y1={210} x2={690} y2={210} stroke={ctx.accentCapital} strokeWidth="4" />
            <FittedSvgText
              text={`HARD STATUTORY GOLD CEILING (${goldRatioPct}% COVER)`}
              x={110}
              y={192}
              maxWidth={580}
              fontSize={15}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentCapital}
            />
            <rect x={160} y={224} width={480} height={260 * ctx.curveProgress} rx={6} fill={ctx.accentStatutory} opacity={0.86} />
            <WrappedSvgText
              text="Credit Collapses Inside Vault Limit"
              x={400}
              y={346}
              maxWidth={430}
              fontSize={24}
              minFontSize={16}
              maxLines={2}
              fontKind="serif"
              fontFamily={FONTS.serif}
              fontWeight={700}
              fill={ctx.solidBarInk}
              textAnchor="middle"
              opacity={ctx.labelProgress}
            />

            {/* Right Regime Box: Fiat Liquidity Corridor */}
            <rect x={830} y={50} width={660} height={490} rx={10} fill={ctx.surfaceRecessed} stroke={ctx.accentLiability} strokeWidth="2" />
            <FittedSvgText text={rightRegimeTitle} x={870} y={102} maxWidth={580} fontSize={16} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentLiability} />
            <path
              d="M 880 460 Q 1060 440 1180 310 T 1440 135"
              fill="none"
              stroke={ctx.accentLiability}
              strokeWidth="6"
              strokeLinecap="round"
              opacity={ctx.curveProgress}
            />
            <line x1={870} y1={430} x2={1450} y2={430} stroke={ctx.accentSolvent} strokeWidth="2.5" strokeDasharray="8 6" />
            <FittedSvgText
              text="2.0% TARGET FLOOR · ZERO BULLION CAP"
              x={870}
              y={464}
              maxWidth={580}
              fontSize={15}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentSolvent}
            />
            <FittedSvgText
              text={`${fiatExpansionMultiple.toFixed(1)}x M2 / BASE`}
              x={1440}
              y={186}
              maxWidth={340}
              fontSize={34}
              minFontSize={22}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentLiability}
              textAnchor="end"
              opacity={ctx.labelProgress}
            />
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 9. GenerationalHorizonRule (Age 18 -> Age 28, 2026–2056 Liability vs Assets)
// ============================================================================
export interface GenerationalMilestone {
  year: number;
  ageLabel: string;
  debtServiceSharePct: number;
  assetAccessPct: number;
}

export interface GenerationalHorizonRuleProps extends BaseTelemetryProps {
  milestones?: GenerationalMilestone[];
}

export const GenerationalHorizonRule: React.FC<GenerationalHorizonRuleProps> = ({
  milestones = [
    { year: 2026, ageLabel: "Age 18", debtServiceSharePct: 18, assetAccessPct: 28 },
    { year: 2031, ageLabel: "Age 23", debtServiceSharePct: 24, assetAccessPct: 21 },
    { year: 2036, ageLabel: "Age 28", debtServiceSharePct: 31, assetAccessPct: 14 },
    { year: 2046, ageLabel: "Age 38", debtServiceSharePct: 42, assetAccessPct: 11 },
    { year: 2056, ageLabel: "Age 48", debtServiceSharePct: 54, assetAccessPct: 9 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="30-YEAR GENERATIONAL RULER · 2026 TO 2056"
      defaultTitle="Age 18 to Age 28+: Compounding Federal Liability vs. Entry Asset Access"
      defaultSubtitle="Every cohort entering the workforce inherits pre-committed interest & entitlement claims before accumulating their first equity dollar."
      defaultHeroBadge="2026 → 2056"
      defaultCitation="CBO Long-Term Budget Outlook (2026–2056) & NAR First-Time Buyer Series"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const rulerY = ctx.isGlass ? 196 : 300;
        const x0 = ctx.isGlass ? 66 : 130;
        const x1 = w - (ctx.isGlass ? 66 : 130);
        const spanW = x1 - x0;
        const barW = ctx.isGlass ? 40 : 68;
        const scale = ctx.isGlass ? 2.1 : 3.6;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={x0} y1={rulerY} x2={x0 + spanW * ctx.curveProgress} y2={rulerY} stroke={ctx.ruleOxford} strokeWidth={ctx.isGlass ? "3" : "4"} />

            {milestones.map((m, i) => {
              const cx = x0 + (i / Math.max(1, milestones.length - 1)) * spanW;
              const topBarH = m.debtServiceSharePct * scale * ctx.curveProgress;
              const botBarH = m.assetAccessPct * scale * ctx.curveProgress;
              const gapStep = spanW / Math.max(1, milestones.length - 1);

              return (
                <g key={`ghr-${m.year}`}>
                  <rect x={cx - barW / 2} y={rulerY - 22 - topBarH} width={barW} height={topBarH} rx={4} fill={ctx.accentLiability} />
                  <FittedSvgText
                    text={`${m.debtServiceSharePct}%`}
                    x={cx}
                    y={rulerY - 30 - topBarH}
                    maxWidth={gapStep - 8}
                    fontSize={ctx.isGlass ? 16 : 18}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.accentLiability}
                    textAnchor="middle"
                  />

                  <circle cx={cx} cy={rulerY} r={ctx.isGlass ? 6 : 8} fill={ctx.inkPrimary} />
                  <FittedSvgText
                    text={ctx.isGlass ? `${m.year}` : `${m.year} · ${m.ageLabel}`}
                    x={cx}
                    y={rulerY + 22}
                    maxWidth={gapStep - 6}
                    fontSize={ctx.isGlass ? 15 : 16}
                    minFontSize={12}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />

                  <rect x={cx - barW / 2} y={rulerY + 34} width={barW} height={botBarH} rx={4} fill={ctx.accentSolvent} />
                  <FittedSvgText
                    text={`${m.assetAccessPct}%`}
                    x={cx}
                    y={rulerY + 54 + botBarH}
                    maxWidth={gapStep - 8}
                    fontSize={ctx.isGlass ? 16 : 17}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.accentSolvent}
                    textAnchor="middle"
                  />
                </g>
              );
            })}

            <FittedSvgText
              text="▲ STATUTORY INTEREST + ENTITLEMENT CLAIM ON REVENUE"
              x={x0 - 20}
              y={ctx.isGlass ? 26 : 52}
              maxWidth={w - 60}
              fontSize={ctx.isGlass ? 14.5 : 14.5}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentLiability}
            />
            <FittedSvgText
              text="▼ MEDIAN COHORT HOME & EQUITY ENTRY SHARE"
              x={x0 - 20}
              y={h - (ctx.isGlass ? 14 : 32)}
              maxWidth={w - 60}
              fontSize={ctx.isGlass ? 14.5 : 14.5}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentSolvent}
            />
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 10. StackedShareShift (100% Stacked Composition Shift: 84% Payroll vs 7% Corp)
// ============================================================================
export interface StackedShareColumn {
  era: string;
  primaryPct: number;
  secondaryPct: number;
  otherPct: number;
}

export interface StackedShareShiftProps extends BaseTelemetryProps {
  columns?: StackedShareColumn[];
  primaryLabel?: string;
  secondaryLabel?: string;
}

export const StackedShareShift: React.FC<StackedShareShiftProps> = ({
  columns = [
    { era: "1952", primaryPct: 49, secondaryPct: 32, otherPct: 19 },
    { era: "1980", primaryPct: 71, secondaryPct: 12, otherPct: 17 },
    { era: "2005", primaryPct: 77, secondaryPct: 13, otherPct: 10 },
    { era: "2026", primaryPct: 84, secondaryPct: 7, otherPct: 9 },
  ],
  primaryLabel = "Individual Income + FICA Payroll (84%)",
  secondaryLabel = "Corporate Income Tax (7%)",
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="STRUCTURAL TAX COMPOSITION · 1952–2026"
      defaultTitle="Human Paychecks Carry 84% of Federal Receipts; Corporate Share Fell to 7%"
      defaultSubtitle="Over seven decades, federal revenue locked onto human wage withholding right before autonomous software began displacing payrolls."
      defaultHeroBadge="84% PAYCHECK SHARE"
      defaultCitation="OMB Historical Tables 2.1–2.2 & U.S. Treasury Table 9"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 32 : 120;
        const usableW = w - padL * 2;
        const step = usableW / Math.max(1, columns.length);
        const bw = Math.min(ctx.isGlass ? 88 : 190, step * 0.65);
        const barH = ctx.isGlass ? 240 : 380;
        const baseY = ctx.isGlass ? 275 : 480;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {columns.map((c, i) => {
              const cx = padL + step * (i + 0.5);
              const x = cx - bw / 2;
              const h1 = (c.primaryPct / 100) * barH * ctx.curveProgress;
              const h2 = (c.secondaryPct / 100) * barH * ctx.curveProgress;
              const h3 = (c.otherPct / 100) * barH * ctx.curveProgress;
              return (
                <g key={`sss-${c.era}`}>
                  <rect x={x} y={baseY - h1} width={bw} height={h1} fill={ctx.accentLiability} />
                  <rect x={x} y={baseY - h1 - h2} width={bw} height={h2} fill={ctx.accentSolvent} />
                  <rect x={x} y={baseY - h1 - h2 - h3} width={bw} height={h3} fill={ctx.ruleOxford} opacity={0.45} />
                  <FittedSvgText
                    text={`${c.primaryPct}%`}
                    x={cx}
                    y={baseY - h1 / 2 + 7}
                    maxWidth={bw - 10}
                    fontSize={ctx.isGlass ? 18 : 22}
                    minFontSize={14}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.solidBarInk}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={c.era}
                    x={cx}
                    y={baseY + (ctx.isGlass ? 28 : 36)}
                    maxWidth={step - 10}
                    fontSize={ctx.isGlass ? 16 : 18}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />
                </g>
              );
            })}
            <FittedSvgText
              text={`■ ${primaryLabel}`}
              x={padL}
              y={ctx.isGlass ? 336 : 565}
              maxWidth={ctx.isGlass ? w - padL * 2 : 580}
              fontSize={ctx.isGlass ? 15 : 15}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentLiability}
            />
            <FittedSvgText
              text={`■ ${secondaryLabel}`}
              x={ctx.isGlass ? padL : 740}
              y={ctx.isGlass ? 362 : 565}
              maxWidth={ctx.isGlass ? w - padL * 2 : 580}
              fontSize={ctx.isGlass ? 15 : 15}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentSolvent}
            />
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 11. CapexVsDepreciationGap (Cash GPU Capex vs Stretched 6-Year Depreciation)
// ============================================================================
export interface CapexDepreciationYear {
  year: string;
  cashCapexB: number;
  bookDeprecB: number;
}

export interface CapexVsDepreciationGapProps extends BaseTelemetryProps {
  rows?: CapexDepreciationYear[];
}

export const CapexVsDepreciationGap: React.FC<CapexVsDepreciationGapProps> = ({
  rows = [
    { year: "2023", cashCapexB: 148, bookDeprecB: 96 },
    { year: "2024", cashCapexB: 236, bookDeprecB: 124 },
    { year: "2025", cashCapexB: 342, bookDeprecB: 158 },
    { year: "2026E", cashCapexB: 465, bookDeprecB: 194 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="GAAP EARNINGS QUALITY · DEPRECIATION OVERHANG"
      defaultTitle="Cash GPU Capex ($465B) Doubles Past Reported Book Depreciation ($194B)"
      defaultSubtitle="Extending server useful-life assumptions from 3 years to 6 years defers $271B of annual hardware obsolescence off income statements."
      defaultHeroBadge="GAP: $271B / YR"
      defaultCitation="Hyperscaler Form 10-K Note 1 (Property & Equipment Useful Lives)"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 48 : 110;
        const padR = ctx.isGlass ? 24 : 90;
        const baseY = ctx.isGlass ? 275 : 505;
        const maxH = ctx.isGlass ? 210 : 410;
        const maxV = Math.max(520, ...rows.flatMap((r) => [r.cashCapexB, r.bookDeprecB])) * 1.1;
        const usableW = w - padL - padR;
        const step = usableW / Math.max(1, rows.length);
        const singleW = Math.min(ctx.isGlass ? 46 : 92, step * 0.38);
        const pairGap = ctx.isGlass ? 6 : 12;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={padL} y1={baseY} x2={w - padR} y2={baseY} stroke={ctx.ruleOxford} strokeWidth="2" />
            {rows.map((r, i) => {
              const cx = padL + step * (i + 0.5);
              const gx = cx - singleW - pairGap / 2;
              const hCap = (r.cashCapexB / maxV) * maxH * ctx.curveProgress;
              const hDep = (r.bookDeprecB / maxV) * maxH * ctx.curveProgress;
              return (
                <g key={`cdg-${r.year}`}>
                  <rect x={gx} y={baseY - hCap} width={singleW} height={hCap} rx={4} fill={ctx.accentLiability} />
                  <rect x={gx + singleW + pairGap} y={baseY - hDep} width={singleW} height={hDep} rx={4} fill={ctx.accentStatutory} />
                  <FittedSvgText
                    text={`$${r.cashCapexB}B`}
                    x={gx + singleW / 2}
                    y={baseY - hCap - 10}
                    maxWidth={singleW + 22}
                    fontSize={ctx.isGlass ? 14.5 : 18}
                    minFontSize={11.5}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.accentLiability}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={`$${r.bookDeprecB}B`}
                    x={gx + singleW * 1.5 + pairGap}
                    y={baseY - hDep - 10}
                    maxWidth={singleW + 22}
                    fontSize={ctx.isGlass ? 14.5 : 18}
                    minFontSize={11.5}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.accentStatutory}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={r.year}
                    x={cx}
                    y={baseY + (ctx.isGlass ? 26 : 34)}
                    maxWidth={step - 10}
                    fontSize={ctx.isGlass ? 15.5 : 17}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />
                </g>
              );
            })}
            <FittedSvgText
              text="■ CASH CAPITAL EXPENDITURE ($B)"
              x={padL}
              y={ctx.isGlass ? 334 : 575}
              maxWidth={ctx.isGlass ? w - padL * 2 : 440}
              fontSize={15}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentLiability}
            />
            <FittedSvgText
              text="■ GAAP BOOK DEPRECIATION EXPENSE ($B)"
              x={ctx.isGlass ? padL : 620}
              y={ctx.isGlass ? 360 : 575}
              maxWidth={ctx.isGlass ? w - padL * 2 : 520}
              fontSize={15}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentStatutory}
            />
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 12. ForeignHolderRollover ($9.2T Sovereign Maturity Wall & Buyer Shift)
// ============================================================================
export interface RolloverBucket {
  bucket: string;
  trillions: number;
  refiRatePct: number;
}

export interface ForeignHolderRolloverProps extends BaseTelemetryProps {
  buckets?: RolloverBucket[];
}

export const ForeignHolderRollover: React.FC<ForeignHolderRolloverProps> = ({
  buckets = [
    { bucket: "Next 12 Months", trillions: 9.2, refiRatePct: 4.35 },
    { bucket: "Years 2–3", trillions: 7.4, refiRatePct: 4.18 },
    { bucket: "Years 4–5", trillions: 5.1, refiRatePct: 4.22 },
    { bucket: "Years 6–10+", trillions: 6.8, refiRatePct: 4.48 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="TREASURY MATURITY WALL · ROLLOVER EXPOSURE"
      defaultTitle="$9.2 Trillion of Marketable U.S. Debt Matures Within 12 Months"
      defaultSubtitle="Short-duration T-bill issuance forces almost a third of marketable public debt to refinance annually at prevailing 4.3%+ rates."
      defaultHeroBadge="$9.2T 12M WALL"
      defaultCitation="U.S. Treasury Monthly Statement of the Public Debt (MSPD)"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 30 : 90;
        const baseY = ctx.isGlass ? 290 : 500;
        const maxH = ctx.isGlass ? 225 : 400;
        const maxT = Math.max(10.5, ...buckets.map((b) => b.trillions * 1.12));
        const usableW = w - padL * 2;
        const step = usableW / Math.max(1, buckets.length);
        const bw = Math.min(ctx.isGlass ? 92 : 220, step * 0.68);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={padL} y1={baseY} x2={w - padL} y2={baseY} stroke={ctx.ruleOxford} strokeWidth="2.5" />
            {buckets.map((b, i) => {
              const cx = padL + step * (i + 0.5);
              const x = cx - bw / 2;
              const bh = (b.trillions / maxT) * maxH * ctx.curveProgress;
              const isFront = i === 0;
              return (
                <g key={`fhr-${b.bucket}`}>
                  <rect x={x} y={baseY - bh} width={bw} height={bh} rx={6} fill={isFront ? ctx.accentLiability : ctx.accentStatutory} />
                  <FittedSvgText
                    text={`$${b.trillions.toFixed(1)}T`}
                    x={cx}
                    y={baseY - bh - 14}
                    maxWidth={step - 10}
                    fontSize={ctx.isGlass ? 19 : 26}
                    minFontSize={15}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={isFront ? ctx.accentLiability : ctx.inkPrimary}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={b.bucket}
                    x={cx}
                    y={baseY + (ctx.isGlass ? 26 : 34)}
                    maxWidth={step - 10}
                    fontSize={ctx.isGlass ? 15 : 17}
                    minFontSize={12.5}
                    fontKind="sans"
                    fontFamily={FONTS.sans}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={`REFI @ ${b.refiRatePct.toFixed(2)}%`}
                    x={cx}
                    y={baseY + (ctx.isGlass ? 48 : 58)}
                    maxWidth={step - 10}
                    fontSize={ctx.isGlass ? 13.5 : 14}
                    minFontSize={11.5}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fontWeight={500}
                    fill={ctx.inkMuted}
                    textAnchor="middle"
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 13. ReserveAttestationBar (Segmented Stablecoin / Custodial T-Bill Backing)
// ============================================================================
export interface ReserveSegment {
  asset: string;
  pct: number;
}

export interface ReserveAttestationBarProps extends BaseTelemetryProps {
  segments?: ReserveSegment[];
}

export const ReserveAttestationBar: React.FC<ReserveAttestationBarProps> = ({
  segments = [
    { asset: "Short-Term U.S. T-Bills (<90d)", pct: 81.5 },
    { asset: "Overnight Reverse Repo", pct: 11.2 },
    { asset: "Cash & Bank Deposits", pct: 7.3 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="STATUTORY RESERVE ATTESTATION · PRIVATE DOLLAR RAIL"
      defaultTitle="81.5% of Private Stablecoin Reserves Captively Parked in U.S. T-Bills"
      defaultSubtitle="Regulatory reserve mandates convert global digital dollar adoption directly into captive front-end Treasury bill demand."
      defaultHeroBadge="81.5% T-BILLS"
      defaultCitation="GENIUS Act Reserve Standards & Quarterly Attestation Reports"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const barX = ctx.isGlass ? 26 : 90;
        const barW = w - barX * 2;
        const barY = ctx.isGlass ? 68 : 185;
        const barH = ctx.isGlass ? 96 : 140;
        let cursor = barX;

        const fills = [ctx.accentStatutory, ctx.accentSolvent, ctx.accentCapital];

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <FittedSvgText
              text="100.0% ATTESTED RESERVE BACKING COMPOSITION"
              x={barX}
              y={ctx.isGlass ? 46 : 160}
              maxWidth={barW}
              fontSize={ctx.isGlass ? 15 : 15}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.inkMuted}
            />
            {segments.map((seg, i) => {
              const sw = (seg.pct / 100) * barW * ctx.curveProgress;
              const x = cursor;
              cursor += sw;
              const legX = ctx.isGlass ? barX : barX + i * (barW / Math.max(1, segments.length));
              const legY = ctx.isGlass ? 208 + i * 56 : 430;
              const legMaxW = ctx.isGlass ? barW - 110 : barW / Math.max(1, segments.length) - 24;

              return (
                <g key={`rab-${i}`}>
                  <rect x={x} y={barY} width={Math.max(0, sw - 4)} height={barH} rx={6} fill={fills[i % fills.length]} />
                  {seg.pct >= 12 && sw >= 68 && (
                    <FittedSvgText
                      text={`${seg.pct.toFixed(1)}%`}
                      x={x + sw / 2}
                      y={barY + barH / 2 + 9}
                      maxWidth={sw - 12}
                      fontSize={ctx.isGlass ? 20 : 28}
                      minFontSize={14}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fill={ctx.solidBarInk}
                      textAnchor="middle"
                    />
                  )}
                  <FittedSvgText
                    text={`■ ${seg.asset}`}
                    x={legX}
                    y={legY}
                    maxWidth={legMaxW}
                    fontSize={ctx.isGlass ? 15.5 : 18}
                    minFontSize={13}
                    fontKind="sans"
                    fontFamily={FONTS.sans}
                    fill={fills[i % fills.length]}
                  />
                  <FittedSvgText
                    text={`${seg.pct.toFixed(1)}% Share`}
                    x={ctx.isGlass ? w - barX : legX}
                    y={ctx.isGlass ? legY : legY + 32}
                    maxWidth={ctx.isGlass ? 105 : legMaxW}
                    fontSize={ctx.isGlass ? 16 : 22}
                    minFontSize={13.5}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkPrimary}
                    textAnchor={ctx.isGlass ? "end" : "start"}
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 14. TrustFundDepletionCurve (OASI Reserve Exhaustion Cliff & -23% Cut)
// ============================================================================
export interface TrustFundDepletionCurveProps extends BaseTelemetryProps {
  years?: string[];
  reserveTrillions?: number[];
  automaticCutPct?: string;
}

export const TrustFundDepletionCurve: React.FC<TrustFundDepletionCurveProps> = ({
  years = ["2024", "2026", "2028", "2030", "2031", "2032"],
  reserveTrillions = [2.72, 2.38, 1.84, 1.12, 0.54, 0.0],
  automaticCutPct = "-23% STATUTORY BENEFIT CUT",
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="ACTUARIAL SOLVENCY CLIFF · OASI TRUST FUND"
      defaultTitle="Social Security OASI Reserves Hit $0.00 Exhaustion Horizon by 2032"
      defaultSubtitle="Absent payroll-cap or general-fund intervention, trust-fund depletion triggers an automatic statutory benefit reduction."
      defaultHeroBadge="2032 EXHAUSTION"
      defaultCitation="Social Security Trustees Report & CBO Trust Fund Baseline"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 54 : 100;
        const padR = ctx.isGlass ? 38 : 160;
        const zeroY = ctx.isGlass ? 316 : 500;
        const maxH = ctx.isGlass ? 260 : 400;
        const plotW = w - padL - padR;
        const maxT = Math.max(3.0, ...reserveTrillions);
        const xAt = (i: number): number => padL + (i / Math.max(1, years.length - 1)) * plotW;
        const yAt = (v: number): number => zeroY - (v / maxT) * maxH;

        const pts: Array<[number, number]> = reserveTrillions.map((v, i) => [xAt(i), yAt(v)]);
        const curvePath = pointsToPath(pts);
        const ev = evolvePath(ctx.curveProgress, curvePath);
        const lastX = xAt(years.length - 1);
        const badgeW = ctx.isGlass ? 276 : 360;
        const badgeX = Math.max(padL + 10, Math.min(w - badgeW - 20, lastX - badgeW + 30));

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[0, 1, 2, 3].map((tVal) => (
              <g key={`tfd-g-${tVal}`}>
                <line x1={padL} y1={yAt(tVal)} x2={w - padR} y2={yAt(tVal)} stroke={ctx.ruleHairline} strokeWidth="1" />
                <FittedSvgText text={`$${tVal}T`} x={padL - 10} y={yAt(tVal) + 5} maxWidth={padL - 14} fontSize={14} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.inkMuted} textAnchor="end" />
              </g>
            ))}

            <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke={ctx.accentLiability} strokeWidth="3" />
            <FittedSvgText
              text="$0.0T STATUTORY INSOLVENCY FLOOR"
              x={padL + 10}
              y={zeroY - 12}
              maxWidth={plotW - 20}
              fontSize={ctx.isGlass ? 13.5 : 14}
              minFontSize={11}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentLiability}
            />

            <path d={curvePath} fill="none" stroke={ctx.accentLiability} strokeWidth={ctx.isGlass ? "4.5" : "6"} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />

            {years.map((yr, i) => {
              if (ctx.isGlass && i % 2 !== 0 && i !== years.length - 1) return null;
              return (
                <g key={`tfd-${yr}`}>
                  <circle cx={pts[i][0]} cy={pts[i][1]} r={ctx.isGlass ? 5 : 6} fill={ctx.accentLiability} opacity={ctx.curveProgress} />
                  <FittedSvgText
                    text={yr}
                    x={pts[i][0]}
                    y={zeroY + (ctx.isGlass ? 28 : 34)}
                    maxWidth={80}
                    fontSize={ctx.isGlass ? 15 : 16}
                    minFontSize={12}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />
                </g>
              );
            })}

            <g opacity={ctx.labelProgress}>
              <rect x={badgeX} y={zeroY - (ctx.isGlass ? 102 : 114)} width={badgeW} height={ctx.isGlass ? 54 : 64} rx={8} fill={ctx.accentLiabilityStroke} />
              <FittedSvgText
                text={automaticCutPct}
                x={badgeX + badgeW / 2}
                y={zeroY - (ctx.isGlass ? 69 : 74)}
                maxWidth={badgeW - 24}
                fontSize={ctx.isGlass ? 15.5 : 18}
                minFontSize={12}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill="#FAF8F3"
                textAnchor="middle"
              />
            </g>
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 15. DemographicCliffPyramid (Worker-to-Beneficiary Ratio 3.3:1 -> 2.1:1)
// ============================================================================
export interface AgeBandRow {
  band: string;
  leftPct: number;
  rightPct: number;
}

export interface DemographicCliffPyramidProps extends BaseTelemetryProps {
  bands?: AgeBandRow[];
}

export const DemographicCliffPyramid: React.FC<DemographicCliffPyramidProps> = ({
  bands = [
    { band: "75+ Senior", leftPct: 6.2, rightPct: 7.4 },
    { band: "60–74 Retiree", leftPct: 9.8, rightPct: 10.6 },
    { band: "40–59 Peak Wage", leftPct: 12.4, rightPct: 12.6 },
    { band: "20–39 Entry Wage", leftPct: 11.2, rightPct: 10.8 },
    { band: "0–19 Birth Cohort", leftPct: 8.1, rightPct: 7.7 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="DEMOGRAPHIC INVERSION · PAYROLL SUPPORT PYRAMID"
      defaultTitle="Inverted Age Pyramid Compresses Worker-to-Retiree Ratio to 2.1 : 1"
      defaultSubtitle="Top-heavy retiree cohorts expand while sub-replacement birth cohorts narrow the future FICA contributor base."
      defaultHeroBadge="2.1 : 1 RATIO"
      defaultCitation="U.S. Census Bureau Population Projections & SSA Actuarial Tables"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const cx = w / 2;
        const gutterHalf = ctx.isGlass ? 68 : 96;
        const maxBarW = ctx.isGlass ? 150 : 480;
        const maxPct = Math.max(13, ...bands.flatMap((b) => [b.leftPct, b.rightPct]));
        const rowStep = ctx.isGlass ? 66 : 94;
        const barH = ctx.isGlass ? 42 : 54;
        const startY = ctx.isGlass ? 26 : 64;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={cx} y1={startY - 12} x2={cx} y2={startY + bands.length * rowStep - 12} stroke={ctx.ruleOxford} strokeWidth="2" />
            {bands.map((b, i) => {
              const y = startY + i * rowStep;
              const lw = (b.leftPct / maxPct) * maxBarW * ctx.curveProgress;
              const rw = (b.rightPct / maxPct) * maxBarW * ctx.curveProgress;
              const isSenior = i <= 1;
              const color = isSenior ? ctx.accentLiability : ctx.accentStatutory;
              return (
                <g key={`dcp-${b.band}`}>
                  <rect x={cx - gutterHalf - lw} y={y} width={lw} height={barH} rx={4} fill={color} />
                  <rect x={cx + gutterHalf} y={y} width={rw} height={barH} rx={4} fill={color} opacity={0.85} />
                  <FittedSvgText
                    text={b.band}
                    x={cx}
                    y={y + barH / 2 + 5}
                    maxWidth={gutterHalf * 2 - 12}
                    fontSize={ctx.isGlass ? 14.5 : 15}
                    minFontSize={10.5}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={`${b.leftPct.toFixed(1)}%`}
                    x={cx - gutterHalf - lw - 10}
                    y={y + barH / 2 + 6}
                    maxWidth={cx - gutterHalf - lw - 18}
                    fontSize={ctx.isGlass ? 15 : 16}
                    minFontSize={12}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={color}
                    textAnchor="end"
                  />
                  <FittedSvgText
                    text={`${b.rightPct.toFixed(1)}%`}
                    x={cx + gutterHalf + rw + 10}
                    y={y + barH / 2 + 6}
                    maxWidth={w - (cx + gutterHalf + rw + 18)}
                    fontSize={ctx.isGlass ? 15 : 16}
                    minFontSize={12}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={color}
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 16. CostExchangeRatioBar ($20k Drone vs $4.0M Interceptor 200:1 Asymmetry)
// ============================================================================
export interface CostExchangeRatioBarProps extends BaseTelemetryProps {
  lowCostLabel?: string;
  lowCostUsd?: number;
  highCostLabel?: string;
  highCostUsd?: number;
}

export const CostExchangeRatioBar: React.FC<CostExchangeRatioBarProps> = ({
  lowCostLabel = "One-Way Expendable Drone",
  lowCostUsd = 20000,
  highCostLabel = "Fleet Naval SM-6 Interceptor",
  highCostUsd = 4000000,
  ...base
}) => {
  const ratio = Math.max(1, Math.round(highCostUsd / Math.max(1, lowCostUsd)));
  return (
    <TelemetryShell
      defaultKicker="ASYMMETRIC ATTRITION ARITHMETIC · COST EXCHANGE"
      defaultTitle={`Asymmetric Cost-Exchange Trap: $${lowCostUsd.toLocaleString()} Threat vs. $${(highCostUsd / 1000000).toFixed(1)}M Interceptor`}
      defaultSubtitle="Firing multi-million-dollar precision interceptors at commodity autonomous airframes exhausts fiscal and industrial magazines simultaneously."
      defaultHeroBadge={`${ratio} : 1 RATIO`}
      defaultCitation="DoD Comptroller FY2026 Munitions Procurement Justification Book"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 26 : 110;
        const maxBarW = ctx.isGlass ? 360 : 960;
        const fullW = maxBarW * ctx.curveProgress;
        const tinyW = Math.max(14, (lowCostUsd / Math.max(1, highCostUsd)) * maxBarW);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <FittedSvgText
              text={lowCostLabel}
              x={padL}
              y={ctx.isGlass ? 66 : 152}
              maxWidth={w - padL * 2}
              fontSize={ctx.isGlass ? 18 : 21}
              minFontSize={14}
              fontKind="sans"
              fontFamily={FONTS.sans}
              fill={ctx.inkPrimary}
            />
            <rect x={padL} y={ctx.isGlass ? 82 : 172} width={tinyW} height={ctx.isGlass ? 54 : 74} rx={4} fill={ctx.accentSolvent} />
            <FittedSvgText
              text={`$${lowCostUsd.toLocaleString()}`}
              x={padL + tinyW + 16}
              y={ctx.isGlass ? 117 : 220}
              maxWidth={w - (padL + tinyW + 26)}
              fontSize={ctx.isGlass ? 22 : 28}
              minFontSize={16}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentSolvent}
            />

            <FittedSvgText
              text={highCostLabel}
              x={padL}
              y={ctx.isGlass ? 216 : 342}
              maxWidth={w - padL * 2}
              fontSize={ctx.isGlass ? 18 : 21}
              minFontSize={14}
              fontKind="sans"
              fontFamily={FONTS.sans}
              fill={ctx.inkPrimary}
            />
            <rect x={padL} y={ctx.isGlass ? 232 : 362} width={fullW} height={ctx.isGlass ? 68 : 104} rx={6} fill={ctx.accentLiability} />
            <FittedSvgText
              text={`$${highCostUsd.toLocaleString()}`}
              x={padL + fullW + 16}
              y={ctx.isGlass ? 276 : 426}
              maxWidth={w - (padL + fullW + 24)}
              fontSize={ctx.isGlass ? 22 : 32}
              minFontSize={16}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentLiability}
            />
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 17. BandwidthConcentrationBar (Top-3 Cloud / Subsea Corridor Share Spectrum)
// ============================================================================
export interface ConcentrationEntity {
  name: string;
  sharePct: number;
}

export interface BandwidthConcentrationBarProps extends BaseTelemetryProps {
  entities?: ConcentrationEntity[];
}

export const BandwidthConcentrationBar: React.FC<BandwidthConcentrationBarProps> = ({
  entities = [
    { name: "Operator A (Hyperscale Lit Fiber)", sharePct: 34 },
    { name: "Operator B (Private Subsea Trunk)", sharePct: 24 },
    { name: "Operator C (Cloud Backbone)", sharePct: 14 },
    { name: "All Remaining 140+ Carriers", sharePct: 28 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="INFRASTRUCTURE OLIGOPOLY · SUBSEA & CLOUD BACKBONE"
      defaultTitle="Three Hyperscale Balance Sheets Control 72% of Transoceanic Lit Capacity"
      defaultSubtitle="Global data routing has shifted from public telecom consortia onto three private balance sheets."
      defaultHeroBadge="TOP 3: 72% SHARE"
      defaultCitation="TeleGeography Global Bandwidth Research Service"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 24 : 110;
        const barW = w - padL * 2;
        const barY = ctx.isGlass ? 54 : 150;
        const barH = ctx.isGlass ? 96 : 150;
        let xCursor = padL;
        const paletteList = [ctx.accentLiability, ctx.accentStatutory, ctx.accentCapital, ctx.ruleOxford];

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {entities.map((ent, i) => {
              const segW = (ent.sharePct / 100) * barW * ctx.curveProgress;
              const sx = xCursor;
              xCursor += segW;
              const legX = ctx.isGlass ? padL : padL + (i % 2) * 680;
              const legY = ctx.isGlass ? 200 + i * 44 : 390 + Math.floor(i / 2) * 80;
              const legMaxW = ctx.isGlass ? barW : 640;

              return (
                <g key={`bcb-${i}`}>
                  <rect x={sx} y={barY} width={Math.max(0, segW - 4)} height={barH} rx={6} fill={paletteList[i % paletteList.length]} />
                  {segW >= 54 && (
                    <FittedSvgText
                      text={`${ent.sharePct}%`}
                      x={sx + segW / 2}
                      y={barY + barH / 2 + 9}
                      maxWidth={segW - 10}
                      fontSize={ctx.isGlass ? 18 : 28}
                      minFontSize={13}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fill={ctx.solidBarInk}
                      textAnchor="middle"
                    />
                  )}
                  <FittedSvgText
                    text={`■ ${ent.name} (${ent.sharePct}%)`}
                    x={legX}
                    y={legY}
                    maxWidth={legMaxW}
                    fontSize={ctx.isGlass ? 15.5 : 19}
                    minFontSize={13}
                    fontKind="sans"
                    fontFamily={FONTS.sans}
                    fill={paletteList[i % paletteList.length]}
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 18. EscrowShockBreakdown (Monthly Mortgage P&I vs Tax & Insurance Surge)
// ============================================================================
export interface EscrowYearColumn {
  year: string;
  principalInterest: number;
  propertyTax: number;
  hazardInsurance: number;
}

export interface EscrowShockBreakdownProps extends BaseTelemetryProps {
  columns?: EscrowYearColumn[];
}

export const EscrowShockBreakdown: React.FC<EscrowShockBreakdownProps> = ({
  columns = [
    { year: "2020 Lock", principalInterest: 1420, propertyTax: 410, hazardInsurance: 165 },
    { year: "2023 Renewal", principalInterest: 1420, propertyTax: 525, hazardInsurance: 340 },
    { year: "2026 Shock", principalInterest: 1420, propertyTax: 640, hazardInsurance: 695 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="HOUSEHOLD ESCROW SQUEEZE · FIXED 3% MORTGAGE ILLUSION"
      defaultTitle="Even With a Fixed Mortgage, Non-Negotiable Escrow Surges +132%"
      defaultSubtitle="Homeowners locked into fixed principal & interest still face monthly payment shock from repriced hazard insurance and county tax assessments."
      defaultHeroBadge="+$760 / MO ESCROW"
      defaultCitation="ICE Mortgage Monitor & State Department of Insurance Filings"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 32 : 100;
        const baseY = ctx.isGlass ? 268 : 505;
        const maxTotal = Math.max(2800, ...columns.map((c) => c.principalInterest + c.propertyTax + c.hazardInsurance)) * 1.1;
        const maxH = ctx.isGlass ? 210 : 410;
        const usableW = w - padL * 2;
        const step = usableW / Math.max(1, columns.length);
        const bw = Math.min(ctx.isGlass ? 110 : 240, step * 0.62);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={padL} y1={baseY} x2={w - padL} y2={baseY} stroke={ctx.ruleOxford} strokeWidth="2.5" />
            {columns.map((c, i) => {
              const cx = padL + step * (i + 0.5);
              const x = cx - bw / 2;
              const total = c.principalInterest + c.propertyTax + c.hazardInsurance;
              const hPi = (c.principalInterest / maxTotal) * maxH * ctx.curveProgress;
              const hTx = (c.propertyTax / maxTotal) * maxH * ctx.curveProgress;
              const hIn = (c.hazardInsurance / maxTotal) * maxH * ctx.curveProgress;
              return (
                <g key={`esb-${c.year}`}>
                  <rect x={x} y={baseY - hPi} width={bw} height={hPi} fill={ctx.accentStatutory} />
                  <rect x={x} y={baseY - hPi - hTx} width={bw} height={hTx} fill={ctx.accentCapital} />
                  <rect x={x} y={baseY - hPi - hTx - hIn} width={bw} height={hIn} fill={ctx.accentLiability} />
                  <FittedSvgText
                    text={`$${total.toLocaleString()}/mo`}
                    x={cx}
                    y={baseY - hPi - hTx - hIn - 12}
                    maxWidth={step - 10}
                    fontSize={ctx.isGlass ? 17 : 24}
                    minFontSize={13.5}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={i === columns.length - 1 ? ctx.accentLiability : ctx.inkPrimary}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={c.year}
                    x={cx}
                    y={baseY + (ctx.isGlass ? 26 : 36)}
                    maxWidth={step - 10}
                    fontSize={ctx.isGlass ? 15.5 : 17}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />
                </g>
              );
            })}
            <FittedSvgText text="■ FIXED P&I" x={padL} y={ctx.isGlass ? 336 : 576} maxWidth={ctx.isGlass ? 170 : 380} fontSize={14.5} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentStatutory} />
            <FittedSvgText text="■ PROPERTY TAX" x={ctx.isGlass ? 205 : 630} y={ctx.isGlass ? 336 : 576} maxWidth={ctx.isGlass ? 180 : 300} fontSize={14.5} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentCapital} />
            <FittedSvgText text="■ HAZARD INSURANCE" x={ctx.isGlass ? 395 : 960} y={ctx.isGlass ? 336 : 576} maxWidth={ctx.isGlass ? 185 : 460} fontSize={14.5} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentLiability} />
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 19. MineralRefiningDominance (Mining Dispersion vs 88% Refining Monopoly)
// ============================================================================
export interface MineralStageRow {
  mineral: string;
  miningTopSharePct: number;
  refiningTopSharePct: number;
}

export interface MineralRefiningDominanceProps extends BaseTelemetryProps {
  minerals?: MineralStageRow[];
}

export const MineralRefiningDominance: React.FC<MineralRefiningDominanceProps> = ({
  minerals = [
    { mineral: "Rare Earth Magnet Oxides", miningTopSharePct: 68, refiningTopSharePct: 91 },
    { mineral: "Battery-Grade Graphite", miningTopSharePct: 77, refiningTopSharePct: 94 },
    { mineral: "Refined Copper Smelting", miningTopSharePct: 16, refiningTopSharePct: 47 },
    { mineral: "Refined Gallium / Germanium", miningTopSharePct: 62, refiningTopSharePct: 89 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="CRITICAL SUPPLY CHOKEPOINT · EXTRACTION VS. REFINING"
      defaultTitle="Ore Is Mined Globally, But Midstream Refining Concentrates Above 90%"
      defaultSubtitle="Opening new mines takes 17 years, yet the acute strategic bottleneck sits in midstream chemical smelting and refining capacity."
      defaultHeroBadge="91%–94% REFINING"
      defaultCitation="IEA Global Critical Minerals Outlook & USGS Mineral Commodity Summaries"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const barStart = ctx.isGlass ? 24 : 430;
        const maxBarW = ctx.isGlass ? 420 : 900;
        const rowStep = ctx.isGlass ? 90 : 116;
        const startY = ctx.isGlass ? 26 : 78;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {minerals.map((m, i) => {
              const y = startY + i * rowStep;
              const wMine = (m.miningTopSharePct / 100) * maxBarW * ctx.curveProgress;
              const wRef = (m.refiningTopSharePct / 100) * maxBarW * ctx.curveProgress;

              if (ctx.isGlass) {
                return (
                  <g key={`mrdg-${i}`}>
                    <FittedSvgText text={m.mineral} x={barStart} y={y + 14} maxWidth={w - 48} fontSize={15.5} minFontSize={13} fontKind="sans" fontFamily={FONTS.sans} fill={ctx.inkPrimary} />
                    <rect x={barStart} y={y + 22} width={wMine} height={20} rx={4} fill={ctx.accentSolvent} />
                    <FittedSvgText text={`Mine ${m.miningTopSharePct}%`} x={barStart + wMine + 10} y={y + 37} maxWidth={w - (barStart + wMine + 18)} fontSize={14.5} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentSolvent} />
                    <rect x={barStart} y={y + 46} width={wRef} height={22} rx={4} fill={ctx.accentLiability} />
                    <FittedSvgText text={`Refine ${m.refiningTopSharePct}%`} x={barStart + wRef + 10} y={y + 62} maxWidth={w - (barStart + wRef + 18)} fontSize={14.5} fontKind="mono" fontFamily={FONTS.mono} fill={ctx.accentLiability} />
                  </g>
                );
              }

              return (
                <g key={`mrd-${i}`}>
                  <FittedSvgText
                    text={m.mineral}
                    x={barStart - 24}
                    y={y + 36}
                    maxWidth={barStart - 48}
                    fontSize={18}
                    minFontSize={13}
                    fontKind="sans"
                    fontFamily={FONTS.sans}
                    fill={ctx.inkPrimary}
                    textAnchor="end"
                  />
                  <rect x={barStart} y={y} width={wMine} height={26} rx={4} fill={ctx.accentSolvent} />
                  <FittedSvgText
                    text={`Mining ${m.miningTopSharePct}%`}
                    x={barStart + wMine + 12}
                    y={y + 19}
                    maxWidth={w - (barStart + wMine + 20)}
                    fontSize={15}
                    minFontSize={12}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.accentSolvent}
                  />
                  <rect x={barStart} y={y + 34} width={wRef} height={30} rx={4} fill={ctx.accentLiability} />
                  <FittedSvgText
                    text={`Refining ${m.refiningTopSharePct}%`}
                    x={barStart + wRef + 12}
                    y={y + 55}
                    maxWidth={w - (barStart + wRef + 20)}
                    fontSize={16}
                    minFontSize={12}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.accentLiability}
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 20. WaitlistQueueHistogram (32 wks -> 184 wks Large Power Transformer Queue)
// ============================================================================
export interface QueueYearBin {
  year: string;
  leadTimeWeeks: number;
}

export interface WaitlistQueueHistogramProps extends BaseTelemetryProps {
  bins?: QueueYearBin[];
}

export const WaitlistQueueHistogram: React.FC<WaitlistQueueHistogramProps> = ({
  bins = [
    { year: "2019", leadTimeWeeks: 36 },
    { year: "2021", leadTimeWeeks: 58 },
    { year: "2023", leadTimeWeeks: 118 },
    { year: "2025", leadTimeWeeks: 156 },
    { year: "2026", leadTimeWeeks: 188 },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="PHYSICAL BOTTLENECK · HIGH-VOLTAGE TRANSFORMER BACKLOG"
      defaultTitle="Large Power Transformer Delivery Lead Times Stretch Past 188 Weeks"
      defaultSubtitle="Grain-oriented electrical steel and skilled winding labor cannot be printed by central banks or compiled by AI agents."
      defaultHeroBadge="188 WKS WAIT"
      defaultCitation="Wood Mackenzie / NERC Large Power Transformer Supply Assessment"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 30 : 100;
        const baseY = ctx.isGlass ? 314 : 505;
        const maxH = ctx.isGlass ? 248 : 410;
        const maxWks = Math.max(210, ...bins.map((b) => b.leadTimeWeeks * 1.12));
        const usableW = w - padL * 2;
        const step = usableW / Math.max(1, bins.length);
        const bw = Math.min(ctx.isGlass ? 76 : 185, step * 0.7);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={padL} y1={baseY} x2={w - padL} y2={baseY} stroke={ctx.ruleOxford} strokeWidth="2.5" />
            {bins.map((b, i) => {
              const cx = padL + step * (i + 0.5);
              const x = cx - bw / 2;
              const bh = (b.leadTimeWeeks / maxWks) * maxH * ctx.curveProgress;
              const isSevere = b.leadTimeWeeks >= 120;
              return (
                <g key={`wqh-${b.year}`}>
                  <rect x={x} y={baseY - bh} width={bw} height={bh} rx={5} fill={isSevere ? ctx.accentLiability : ctx.accentStatutory} />
                  <FittedSvgText
                    text={ctx.isGlass ? `${b.leadTimeWeeks}w` : `${b.leadTimeWeeks} wks`}
                    x={cx}
                    y={baseY - bh - 12}
                    maxWidth={step - 8}
                    fontSize={ctx.isGlass ? 16.5 : 24}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={isSevere ? ctx.accentLiability : ctx.inkPrimary}
                    textAnchor="middle"
                  />
                  <FittedSvgText
                    text={b.year}
                    x={cx}
                    y={baseY + (ctx.isGlass ? 28 : 36)}
                    maxWidth={step - 8}
                    fontSize={ctx.isGlass ? 15.5 : 17}
                    minFontSize={13}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={ctx.inkPrimary}
                    textAnchor="middle"
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 21. RealVsNominalShrink ($100 Nominal Face Value vs $61 Real Claim)
// ============================================================================
export interface RealVsNominalShrinkProps extends BaseTelemetryProps {
  nominalAmount?: number;
  realAmount?: number;
  horizonText?: string;
}

export const RealVsNominalShrink: React.FC<RealVsNominalShrinkProps> = ({
  nominalAmount = 100,
  realAmount = 61,
  horizonText = "CUMULATIVE ESSENTIAL BASKET EROSION",
  ...base
}) => {
  const lossPct = Math.round(((nominalAmount - realAmount) / Math.max(1, nominalAmount)) * 100);
  return (
    <TelemetryShell
      defaultKicker="MONETARY ILLUSION · NOMINAL PAR VS. REAL PURCHASING POWER"
      defaultTitle={`$${nominalAmount} Nominal Paystub Buys $${realAmount} of Shelter, Power & Insurance`}
      defaultSubtitle="Keeping every nominal dollar intact avoids 1933 bank runs while silently transferring purchasing power out of fixed wages."
      defaultHeroBadge={`-${lossPct}% REAL CLAIM`}
      defaultCitation="BLS CPI-U Shelter, Motor Vehicle Insurance & Electricity Sub-Indices"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const realScale = Math.sqrt(Math.max(0.05, realAmount / Math.max(1, nominalAmount)));

        if (ctx.isGlass) {
          const outerS = 180;
          const innerS = outerS * (1 - (1 - realScale) * ctx.curveProgress);
          const ox = 210;
          const oy = 48;
          return (
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
              <FittedSvgText
                text={`NOMINAL FACE VALUE · $${nominalAmount}.00`}
                x={w / 2}
                y={28}
                maxWidth={w - 40}
                fontSize={15}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill={ctx.inkSecondary}
                textAnchor="middle"
              />
              <rect x={ox} y={oy} width={outerS} height={outerS} rx={10} fill="none" stroke={ctx.ruleOxford} strokeWidth="3" strokeDasharray="8 6" />
              <rect x={ox + (outerS - innerS) / 2} y={oy + (outerS - innerS) / 2} width={innerS} height={innerS} rx={8} fill={ctx.accentLiability} />
              <FittedSvgText
                text={`$${realAmount}`}
                x={ox + outerS / 2}
                y={oy + outerS / 2 + 14}
                maxWidth={innerS - 12}
                fontSize={38}
                minFontSize={22}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill={ctx.solidBarInk}
                textAnchor="middle"
              />
              <FittedSvgText
                text={horizonText}
                x={w / 2}
                y={264}
                maxWidth={w - 48}
                fontSize={14.5}
                minFontSize={12}
                fontKind="mono"
                fontFamily={FONTS.mono}
                fill={ctx.accentLiability}
                textAnchor="middle"
              />
              <FittedSvgText
                text={`-${lossPct}% Silent Haircut`}
                x={w / 2}
                y={300}
                maxWidth={w - 48}
                fontSize={28}
                minFontSize={20}
                fontKind="serif"
                fontFamily={FONTS.serif}
                fill={ctx.inkPrimary}
                textAnchor="middle"
              />
              <WrappedSvgText
                text="Nominal par remains 100%, yet scarce non-automatable essentials reprice upward."
                x={w / 2}
                y={334}
                maxWidth={w - 56}
                fontSize={15.5}
                minFontSize={13.5}
                maxLines={2}
                fontKind="sans"
                fontFamily={FONTS.sans}
                fill={ctx.inkSecondary}
                textAnchor="middle"
              />
            </svg>
          );
        }

        const outerS = 390;
        const innerS = outerS * (1 - (1 - realScale) * ctx.curveProgress);
        const boxX = 160;
        const boxY = 105;
        const textX = 640;
        const maxTextW = w - textX - 60;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <rect x={boxX} y={boxY} width={outerS} height={outerS} rx={10} fill="none" stroke={ctx.ruleOxford} strokeWidth="3.5" strokeDasharray="10 8" />
            <FittedSvgText
              text={`NOMINAL FACE VALUE · $${nominalAmount}.00`}
              x={boxX + outerS / 2}
              y={boxY - 22}
              maxWidth={outerS + 80}
              fontSize={17}
              minFontSize={13}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.inkSecondary}
              textAnchor="middle"
            />

            <rect x={boxX + (outerS - innerS) / 2} y={boxY + (outerS - innerS) / 2} width={innerS} height={innerS} rx={8} fill={ctx.accentLiability} />
            <FittedSvgText
              text={`$${realAmount}`}
              x={boxX + outerS / 2}
              y={boxY + outerS / 2 + 18}
              maxWidth={Math.max(48, innerS - 20)}
              fontSize={54}
              minFontSize={26}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.solidBarInk}
              textAnchor="middle"
            />

            <FittedSvgText
              text={horizonText}
              x={textX}
              y={205}
              maxWidth={maxTextW}
              fontSize={16}
              minFontSize={12}
              fontKind="mono"
              fontFamily={FONTS.mono}
              fill={ctx.accentLiability}
            />
            <FittedSvgText
              text={`-${lossPct}% Silent Haircut`}
              x={textX}
              y={278}
              maxWidth={maxTextW}
              fontSize={44}
              minFontSize={26}
              fontKind="serif"
              fontFamily={FONTS.serif}
              fill={ctx.inkPrimary}
            />
            <WrappedSvgText
              text="Nominal par remains 100%, yet scarce non-automatable essentials reprice upward."
              x={textX}
              y={342}
              maxWidth={maxTextW}
              fontSize={22}
              minFontSize={16}
              maxLines={3}
              lineHeight={1.32}
              fontKind="sans"
              fontFamily={FONTS.sans}
              fontWeight={500}
              fill={ctx.inkSecondary}
            />
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// 22. MarginBidComparison (Hyperscaler 45% Margin PPA Bid vs Household Ceiling)
// ============================================================================
export interface BidBidder {
  bidder: string;
  maxMwhBid: number;
  operatingMarginNote: string;
  isWinner?: boolean;
}

export interface MarginBidComparisonProps extends BaseTelemetryProps {
  bidders?: BidBidder[];
}

export const MarginBidComparison: React.FC<MarginBidComparisonProps> = ({
  bidders = [
    { bidder: "Residential & Municipal Utility Pool", maxMwhBid: 64, operatingMarginNote: "Wage-Constrained Household Budget" },
    { bidder: "Domestic Smelting & Manufacturing", maxMwhBid: 72, operatingMarginNote: "8%–11% Industrial Margin Ceiling" },
    { bidder: "Hyperscale AI Nuclear / Firm PPA", maxMwhBid: 118, operatingMarginNote: "45%+ Software Operating Margin", isWinner: true },
  ],
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="AUCTION CLEARING LADDER · FIRM MEGAVOLT BIDDING POWER"
      defaultTitle="45%-Margin Software Balance Sheets Outbid Households for Baseload Power"
      defaultSubtitle="When firm 24/7 nuclear and gas generation is auctioned, high-margin AI balance sheets lock 20-year PPAs well above residential rate ceilings."
      defaultHeroBadge="$118 / MWH PPA"
      defaultCitation="Constellation / Microsoft Crane Clean Energy PPA & FERC Wholesale Filings"
      {...base}
    >
      {(ctx) => {
        const w = ctx.viewW;
        const h = ctx.viewH;
        const padL = ctx.isGlass ? 24 : 110;
        const maxBid = Math.max(135, ...bidders.map((b) => b.maxMwhBid * 1.12));
        const maxBarW = ctx.isGlass ? 390 : 980;
        const rowStep = ctx.isGlass ? 114 : 155;
        const startY = ctx.isGlass ? 36 : 95;
        const barH = ctx.isGlass ? 42 : 68;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {bidders.map((b, i) => {
              const y = startY + i * rowStep;
              const bw = (b.maxMwhBid / maxBid) * maxBarW * ctx.curveProgress;
              const fill = b.isWinner ? ctx.accentLiability : ctx.accentStatutory;
              const valMaxW = w - (padL + bw + 24);

              return (
                <g key={`mbc-${i}`}>
                  <FittedSvgText
                    text={ctx.isGlass ? b.bidder : `${b.bidder} · ${b.operatingMarginNote}`}
                    x={padL}
                    y={y - 10}
                    maxWidth={w - padL - 24}
                    fontSize={ctx.isGlass ? 15.5 : 19}
                    minFontSize={13}
                    fontKind="sans"
                    fontFamily={FONTS.sans}
                    fill={ctx.inkPrimary}
                  />
                  {ctx.isGlass && (
                    <FittedSvgText
                      text={b.operatingMarginNote}
                      x={padL}
                      y={y + barH + 22}
                      maxWidth={w - padL - 24}
                      fontSize={14}
                      minFontSize={12}
                      fontKind="mono"
                      fontFamily={FONTS.mono}
                      fontWeight={500}
                      fill={ctx.inkMuted}
                    />
                  )}
                  <rect x={padL} y={y + 4} width={bw} height={barH} rx={6} fill={fill} />
                  <FittedSvgText
                    text={`$${b.maxMwhBid}/MWh`}
                    x={padL + bw + 14}
                    y={y + (ctx.isGlass ? 32 : 48)}
                    maxWidth={Math.max(88, valMaxW)}
                    fontSize={ctx.isGlass ? 18 : 28}
                    minFontSize={14}
                    fontKind="mono"
                    fontFamily={FONTS.mono}
                    fill={fill}
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </TelemetryShell>
  );
};

// ============================================================================
// MACRO_TELEMETRY_STYLES Registry (22 FT / Bloomberg / Boyle Cinema Charts)
// ============================================================================
export interface MacroTelemetryStyleRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
}

export const MACRO_TELEMETRY_STYLES: readonly MacroTelemetryStyleRecipe[] = [
  { id: "macro-diverging-jaws", name: "Productivity vs. Pay Diverging Jaws", componentName: "DivergingJawsChart", defaultFraming: "fullscreen-cutaway", description: "2017–2026 output/hr (+20.4%) vs stagnant pay piercing the 1947 Truman labor-share floor." },
  { id: "macro-negative-fcf-waterfall", name: "Negative Free Cash Flow Capex Waterfall", componentName: "NegativeFcfWaterfall", defaultFraming: "fullscreen-cutaway", description: "$740B–$820B AI infrastructure capex bridge plunging cash flow below $0 into -$42B FCF." },
  { id: "macro-wealth-decile-monoliths", name: "90% vs. 1% Equity Monoliths + Optical Loupe", componentName: "WealthDecileMonoliths", defaultFraming: "fullscreen-cutaway", description: "Top 10% (90.2%) monolith vs Bottom 50% (1.0%) sliver with 8x brass magnifier inset." },
  { id: "macro-auction-price-shockwave", name: "+833% Grid Capacity Clearing Shockwave", componentName: "AuctionPriceShockwave", defaultFraming: "fullscreen-cutaway", description: "PJM $28.92 to $269.92/MW-day vertical step wall with concentric shockwave rings." },
  { id: "macro-jevons-deflation-curve", name: "Jevons -99% Unit Price vs. Volume Surge", componentName: "JevonsDeflationCurve", defaultFraming: "fullscreen-cutaway", description: "Dual crossing trajectories showing unit token deflation fueling exponential automated volume." },
  { id: "macro-sovereign-spread-flip", name: "France OAT vs. Greece Sovereign Spread Flip", componentName: "SovereignSpreadFlip", defaultFraming: "fullscreen-cutaway", description: "France 4.93% 10Y benchmark crossing +67 bps above Greece 4.26%." },
  { id: "macro-debt-deflation-jaws-1933", name: "1933 Irving Fisher Debt-Deflation Jaws", componentName: "DebtDeflationJaws1933", defaultFraming: "fullscreen-cutaway", description: "Falling wages (-48%) against an immovable nominal debt beam swelling real debt +74%." },
  { id: "macro-gold-vs-fiat-corridor", name: "1933 Gold Lock vs. 2% CPI Liquidity Corridor", componentName: "GoldVsFiatFedCorridor", defaultFraming: "fullscreen-cutaway", description: "Bilateral monetary regime plate contrasting statutory gold caps with fiat liquidity floors." },
  { id: "macro-generational-horizon-rule", name: "2026–2056 Generational Liability Ruler", componentName: "GenerationalHorizonRule", defaultFraming: "fullscreen-cutaway", description: "Age 18 to Age 28+ horizon ruler contrasting compounding federal debt service with asset access." },
  { id: "macro-stacked-share-shift", name: "100% Stacked Tax Share Shift (84% Payroll)", componentName: "StackedShareShift", defaultFraming: "fullscreen-cutaway", description: "Multi-era 100% stacked bars showing human paychecks rising to 84% of federal receipts." },
  { id: "macro-capex-vs-depreciation-gap", name: "Cash Capex vs. Book Depreciation Overhang", componentName: "CapexVsDepreciationGap", defaultFraming: "fullscreen-cutaway", description: "Paired multi-year columns exposing the $271B gap between cash GPU capex and stretched depreciation." },
  { id: "macro-foreign-holder-rollover", name: "$9.2T 12-Month Sovereign Maturity Wall", componentName: "ForeignHolderRollover", defaultFraming: "fullscreen-cutaway", description: "Marketable debt rollover schedule showing front-loaded T-bill refinancing exposure." },
  { id: "macro-reserve-attestation-bar", name: "Segmented T-Bill Reserve Attestation Bar", componentName: "ReserveAttestationBar", defaultFraming: "fullscreen-cutaway", description: "100% attested reserve backing bar highlighting 81.5% captive short-term T-bill allocation." },
  { id: "macro-trust-fund-depletion-curve", name: "2032 OASI Trust Fund Exhaustion Cliff", componentName: "TrustFundDepletionCurve", defaultFraming: "fullscreen-cutaway", description: "Actuarial reserve curve hitting $0.00 insolvency floor with -23% statutory benefit cut badge." },
  { id: "macro-demographic-cliff-pyramid", name: "2.1:1 Worker-to-Retiree Demographic Pyramid", componentName: "DemographicCliffPyramid", defaultFraming: "fullscreen-cutaway", description: "Bilateral age-cohort pyramid illustrating payroll contributor compression." },
  { id: "macro-cost-exchange-ratio-bar", name: "200:1 Asymmetric Cost-Exchange Scale", componentName: "CostExchangeRatioBar", defaultFraming: "fullscreen-cutaway", description: "$20,000 expendable drone vs $4.0M naval interceptor asymmetric attrition bar." },
  { id: "macro-bandwidth-concentration-bar", name: "Top-3 Subsea & Cloud Bandwidth Concentration", componentName: "BandwidthConcentrationBar", defaultFraming: "fullscreen-cutaway", description: "Horizontal spectrum bar showing 72% transoceanic capacity held by three hyperscalers." },
  { id: "macro-escrow-shock-breakdown", name: "Household Mortgage Escrow Surge Stack", componentName: "EscrowShockBreakdown", defaultFraming: "fullscreen-cutaway", description: "Stacked monthly housing outlay showing hazard insurance & property tax surging +132%." },
  { id: "macro-mineral-refining-dominance", name: "Extraction vs. 90%+ Refining Monopoly Bars", componentName: "MineralRefiningDominance", defaultFraming: "fullscreen-cutaway", description: "Paired horizontal supply-chain bars contrasting dispersed mining with concentrated refining." },
  { id: "macro-waitlist-queue-histogram", name: "188-Week Transformer Lead-Time Histogram", componentName: "WaitlistQueueHistogram", defaultFraming: "fullscreen-cutaway", description: "Discrete delivery backlog histogram for high-voltage large power transformers." },
  { id: "macro-real-vs-nominal-shrink", name: "Nominal Par vs. Real Purchasing-Power Core", componentName: "RealVsNominalShrink", defaultFraming: "fullscreen-cutaway", description: "Concentric area comparison showing $100 nominal paystub shrinking to $61 real claim." },
  { id: "macro-margin-bid-comparison", name: "Hyperscaler PPA vs. Household Bid Ladder", componentName: "MarginBidComparison", defaultFraming: "fullscreen-cutaway", description: "Wholesale power bid ladder contrasting 45%-margin software PPAs with residential utility ceilings." },
] as const;
