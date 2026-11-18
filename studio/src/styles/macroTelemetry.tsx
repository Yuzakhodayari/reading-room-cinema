import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import { ReadingRoomStage } from "../design/optics";
import {
  CINEMA_SPRINGS,
  LAYOUT,
  OVER_FOOTAGE_PALETTE,
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

interface TelemetryShellProps extends BaseTelemetryProps {
  defaultTitle: string;
  defaultSubtitle: string;
  defaultKicker: string;
  defaultHeroBadge: string;
  defaultCitation: string;
  children: (ctx: {
    progress: number;
    enter: number;
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
    surfaceElevated: string;
    surfaceRecessed: string;
  }) => React.ReactNode;
}

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
          padding: "28px 30px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 24px 52px rgba(15, 25, 35, 0.44)",
          opacity: enter,
          transform: `translate3d(${((1 - enter) * 32).toFixed(2)}px, 0, 0)`,
          userSelect: "none",
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.09em",
                color: OVER_FOOTAGE_PALETTE.accentPrimary,
                textTransform: "uppercase",
              }}
            >
              {resolvedKicker}
            </span>
            <span
              style={{
                backgroundColor: OVER_FOOTAGE_PALETTE.brickRedFill,
                color: OVER_FOOTAGE_PALETTE.textHeadline,
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "5px",
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
              fontSize: "26px",
              lineHeight: 1.18,
              color: OVER_FOOTAGE_PALETTE.textHeadline,
            }}
          >
            {resolvedTitle}
          </h2>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: "13.5px",
              lineHeight: 1.4,
              color: OVER_FOOTAGE_PALETTE.textBody,
            }}
          >
            {resolvedSubtitle}
          </div>
        </div>

        <div style={{ flex: 1, marginTop: "18px", marginBottom: "14px", position: "relative" }}>
          {children({
            progress,
            enter,
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
            surfaceElevated: OVER_FOOTAGE_PALETTE.glassDarkWell,
            surfaceRecessed: "rgba(15, 25, 35, 0.62)",
          })}
        </div>

        <div
          style={{
            borderTop: `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`,
            paddingTop: "10px",
            fontFamily: FONTS.mono,
            fontSize: "11px",
            color: OVER_FOOTAGE_PALETTE.textMuted,
            ...TABULAR_NUM_STYLE,
          }}
        >
          § {resolvedCitation}
        </div>
      </div>
    );
  }

  const pal = resolveRegisterPalette(register);

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
          top: 98,
          bottom: 76,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: enter,
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "36px",
            paddingBottom: "18px",
            borderBottom: `2px solid ${pal.rule.oxford}`,
          }}
        >
          <div style={{ maxWidth: "1260px" }}>
            <h1
              style={{
                margin: 0,
                fontFamily: FONTS.serif,
                fontSize: "44px",
                fontWeight: 700,
                lineHeight: 1.12,
                color: pal.ink.primary,
              }}
            >
              {resolvedTitle}
            </h1>
            <div
              style={{
                marginTop: "8px",
                fontFamily: FONTS.sans,
                fontSize: "18.5px",
                color: pal.ink.secondary,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {resolvedSubtitle}
            </div>
          </div>

          <div
            style={{
              backgroundColor: pal.bg.elevated,
              border: `2px solid ${pal.accent.liabilityStroke}`,
              padding: "10px 20px",
              borderRadius: "8px",
              fontFamily: FONTS.mono,
              fontSize: "24px",
              fontWeight: 700,
              color: pal.accent.liability,
              flexShrink: 0,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {resolvedHero}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            marginTop: "22px",
            backgroundColor: pal.bg.elevated,
            border: `1.5px solid ${pal.rule.hairline}`,
            borderRadius: "12px",
            padding: "28px 36px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {children({
            progress,
            enter,
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
            surfaceElevated: pal.bg.elevated,
            surfaceRecessed: pal.bg.recessed,
          })}
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
// 1. DivergingJawsChart (Productivity +20% vs Lagging Pay / 53% Labor Share Floor)
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

export const DivergingJawsChart: React.FC<DivergingJawsChartProps> = ({
  years = ["2017", "2019", "2021", "2023", "2025", "2026"],
  upperSeries = [100, 104.2, 109.5, 113.8, 117.6, 120.4],
  lowerSeries = [100, 101.4, 102.1, 102.6, 103.2, 103.5],
  upperLabel = "Real Output / Hour (+20.4%)",
  lowerLabel = "Real Median Hourly Pay (+3.5%)",
  floorValue = 100,
  floorLabel = "1947 TRUMAN LABOR SHARE FLOOR (53.0% PIERCE)",
  ...base
}) => {
  return (
    <TelemetryShell
      defaultKicker="MACRO TELEMETRY · LABOR SHARE DECOUPLING"
      defaultTitle="The Diverging Jaws: Output Per Hour vs. Real Take-Home Pay"
      defaultSubtitle="Nonfarm business output per hour surges +20.4% (2017=100) while real hourly compensation stagnates, piercing the postwar 53% labor-share floor."
      defaultHeroBadge="JAWS GAP: +16.9 PTS"
      defaultCitation="BLS Nonfarm Productivity & Costs; BEA National Income Table 1.12"
      {...base}
    >
      {(ctx) => {
        const w = 1560;
        const h = 620;
        const padL = 90;
        const padR = 260;
        const padT = 48;
        const padB = 72;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        const allVals = upperSeries.concat(lowerSeries).concat([floorValue - 4]);
        const minV = Math.min(...allVals);
        const maxV = Math.max(...allVals) + 3;
        const span = Math.max(1, maxV - minV);

        const xAt = (i: number): number =>
          padL + (i / Math.max(1, years.length - 1)) * plotW;
        const yAt = (v: number): number =>
          padT + (1 - (v - minV) / span) * plotH;

        const upPts: Array<[number, number]> = upperSeries.map((v, i) => [xAt(i), yAt(v)]);
        const loPts: Array<[number, number]> = lowerSeries.map((v, i) => [xAt(i), yAt(v)]);
        const upPath = pointsToPath(upPts);
        const loPath = pointsToPath(loPts);

        const polyPts = upPts
          .concat(loPts.slice().reverse())
          .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
          .join(" ");

        const upEv = evolvePath(ctx.progress, upPath);
        const loEv = evolvePath(ctx.progress, loPath);
        const lastIdx = years.length - 1;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[0, 0.25, 0.5, 0.75, 1].map((u, idx) => {
              const gy = padT + u * plotH;
              const val = maxV - u * span;
              return (
                <g key={`dj-g-${idx}`}>
                  <line x1={padL} y1={gy} x2={w - padR} y2={gy} stroke={ctx.ruleHairline} strokeWidth="1.2" />
                  <text x={padL - 14} y={gy + 5} textAnchor="end" fontFamily={FONTS.mono} fontSize="15" fill={ctx.inkMuted} style={TABULAR_NUM_STYLE}>
                    {val.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Truman Historical Floor Reference Line */}
            <line
              x1={padL}
              y1={yAt(floorValue)}
              x2={w - padR}
              y2={yAt(floorValue)}
              stroke={ctx.accentLiability}
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            <text
              x={padL + 12}
              y={yAt(floorValue) + 22}
              fontFamily={FONTS.mono}
              fontSize="13.5"
              fontWeight="700"
              fill={ctx.accentLiability}
            >
              {floorLabel}
            </text>

            {/* Shaded Jaws Wedge */}
            <polygon
              points={polyPts}
              fill={ctx.accentLiability}
              opacity={0.14 * ctx.progress}
            />

            {/* Upper Productivity Curve */}
            <path
              d={upPath}
              fill="none"
              stroke={ctx.accentSolvent}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={upEv.strokeDasharray}
              strokeDashoffset={upEv.strokeDashoffset}
            />

            {/* Lower Real Wage Curve */}
            <path
              d={loPath}
              fill="none"
              stroke={ctx.accentLiability}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={loEv.strokeDasharray}
              strokeDashoffset={loEv.strokeDashoffset}
            />

            {years.map((yr, i) => (
              <text
                key={`dj-yr-${i}`}
                x={xAt(i)}
                y={h - 20}
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontSize="15"
                fontWeight="600"
                fill={ctx.inkSecondary}
                style={TABULAR_NUM_STYLE}
              >
                {yr}
              </text>
            ))}

            {ctx.progress > 0.7 && (
              <g opacity={interpolate(ctx.progress, [0.7, 1], [0, 1], CLAMP)}>
                <circle cx={upPts[lastIdx][0]} cy={upPts[lastIdx][1]} r={7} fill={ctx.accentSolvent} />
                <text x={upPts[lastIdx][0] + 16} y={upPts[lastIdx][1] + 5} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentSolvent}>
                  {upperLabel}
                </text>
                <circle cx={loPts[lastIdx][0]} cy={loPts[lastIdx][1]} r={7} fill={ctx.accentLiability} />
                <text x={loPts[lastIdx][0] + 16} y={loPts[lastIdx][1] + 5} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentLiability}>
                  {lowerLabel}
                </text>
              </g>
            )}
          </svg>
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
        const w = 1560;
        const h = 620;
        const maxV = 840;
        const minV = -160;
        const span = maxV - minV;
        const padT = 56;
        const plotH = 460;
        const yAt = (v: number): number => padT + ((maxV - v) / span) * plotH;
        const zeroY = yAt(0);
        const colW = 210;
        const gap = (w - 220 - steps.length * colW) / Math.max(1, steps.length - 1);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {/* Zero Baseline */}
            <rect
              x={80}
              y={zeroY}
              width={w - 160}
              height={yAt(minV) - zeroY}
              fill={ctx.accentLiability}
              opacity={0.08}
            />
            <line
              x1={80}
              y1={zeroY}
              x2={w - 80}
              y2={zeroY}
              stroke={ctx.ruleOxford}
              strokeWidth="2.5"
            />
            <text x={88} y={zeroY - 10} fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={ctx.inkPrimary}>
              $0 BREAKEVEN LINE
            </text>

            {steps.map((st, i) => {
              const x = 110 + i * (colW + gap);
              const topVal = Math.max(st.start, st.end);
              const botVal = Math.min(st.start, st.end);
              const rawY = yAt(topVal);
              const rawH = Math.max(10, yAt(botVal) - rawY);
              const animH = rawH * ctx.progress;

              const fill =
                st.tone === "positive"
                  ? ctx.accentStatutory
                  : st.tone === "negative-net"
                  ? ctx.accentLiability
                  : ctx.accentCapital;

              return (
                <g key={`wf-${i}`}>
                  <rect
                    x={x}
                    y={st.end < 0 && st.start === 0 ? zeroY : rawY + (rawH - animH)}
                    width={colW}
                    height={animH}
                    rx={6}
                    fill={fill}
                  />
                  <text
                    x={x + colW / 2}
                    y={st.end < 0 ? yAt(botVal) + 28 : rawY - 14}
                    textAnchor="middle"
                    fontFamily={FONTS.mono}
                    fontSize="22"
                    fontWeight="700"
                    fill={st.tone === "negative-net" ? ctx.accentLiability : ctx.inkPrimary}
                    style={TABULAR_NUM_STYLE}
                  >
                    {st.displayValue}
                  </text>
                  <text
                    x={x + colW / 2}
                    y={h - 24}
                    textAnchor="middle"
                    fontFamily={FONTS.sans}
                    fontSize="16"
                    fontWeight="600"
                    fill={ctx.inkSecondary}
                  >
                    {st.label}
                  </text>
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
        const w = 1560;
        const h = 620;
        const baseLineY = 520;
        const maxBarH = 430;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={80} y1={baseLineY} x2={1120} y2={baseLineY} stroke={ctx.ruleOxford} strokeWidth="2.5" />

            {deciles.map((d, i) => {
              const x = 130 + i * 330;
              const barW = 220;
              const hPx = Math.max(4.5, (d.sharePct / 100) * maxBarH * ctx.progress);
              const isSliver = d.sharePct <= 2;
              const fill = i === 0 ? ctx.accentStatutory : isSliver ? ctx.accentLiability : ctx.accentCapital;

              return (
                <g key={`wd-${i}`}>
                  <rect
                    x={x}
                    y={baseLineY - hPx}
                    width={barW}
                    height={hPx}
                    rx={4}
                    fill={fill}
                  />
                  <text
                    x={x + barW / 2}
                    y={baseLineY - hPx - 16}
                    textAnchor="middle"
                    fontFamily={FONTS.mono}
                    fontSize="28"
                    fontWeight="700"
                    fill={isSliver ? ctx.accentLiability : ctx.inkPrimary}
                    style={TABULAR_NUM_STYLE}
                  >
                    {d.sharePct.toFixed(1)}%
                  </text>
                  <text
                    x={x + barW / 2}
                    y={baseLineY + 32}
                    textAnchor="middle"
                    fontFamily={FONTS.sans}
                    fontSize="16"
                    fontWeight="700"
                    fill={ctx.inkPrimary}
                  >
                    {d.cohort}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={baseLineY + 54}
                    textAnchor="middle"
                    fontFamily={FONTS.mono}
                    fontSize="12.5"
                    fill={ctx.inkMuted}
                  >
                    {d.note}
                  </text>
                </g>
              );
            })}

            {/* Optical Brass Magnifier Callout Inspecting the 1.0% Sliver */}
            <g opacity={interpolate(ctx.progress, [0.45, 0.9], [0, 1], CLAMP)}>
              <line
                x1={900}
                y1={baseLineY - 4}
                x2={1220}
                y2={285}
                stroke={ctx.accentLiability}
                strokeWidth="2.2"
                strokeDasharray="6 5"
              />
              <circle
                cx={1330}
                cy={245}
                r={138}
                fill={ctx.surfaceRecessed}
                stroke="#B08D57"
                strokeWidth="6"
              />
              <line x1={1220} y1={305} x2={1440} y2={305} stroke={ctx.ruleOxford} strokeWidth="2" />
              <rect x={1265} y={269} width={130} height={36} rx={4} fill={ctx.accentLiability} />
              <text x={1330} y={175} textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={ctx.inkMuted}>
                8.0X OPTICAL LOUPE
              </text>
              <text x={1330} y={218} textAnchor="middle" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill={ctx.accentLiability} style={TABULAR_NUM_STYLE}>
                1.0% SHARE
              </text>
              <text x={1330} y={248} textAnchor="middle" fontFamily={FONTS.sans} fontSize="14" fill={ctx.inkSecondary}>
                Bottom 50% Combined
              </text>
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
        const w = 1560;
        const h = 620;
        const padL = 110;
        const padR = 160;
        const baseY = 515;
        const maxH = 410;
        const maxP = 300;
        const stepW = (w - padL - padR) / auctions.length;

        const stepCoords: string[] = [];
        for (let i = 0; i < auctions.length; i++) {
          const x0 = padL + i * stepW;
          const x1 = x0 + stepW;
          const y = baseY - (auctions[i].priceMwDay / maxP) * maxH;
          stepCoords.push(`${i === 0 ? "M" : "L"} ${x0.toFixed(1)} ${y.toFixed(1)} L ${x1.toFixed(1)} ${y.toFixed(1)}`);
        }
        const fullStepPath = stepCoords.join(" ");
        const ev = evolvePath(ctx.progress, fullStepPath);

        const spikeX = padL + (auctions.length - 0.5) * stepW;
        const spikeY = baseY - (auctions[auctions.length - 1].priceMwDay / maxP) * maxH;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[0, 100, 200, 300].map((val) => {
              const gy = baseY - (val / maxP) * maxH;
              return (
                <g key={`ap-g-${val}`}>
                  <line x1={padL} y1={gy} x2={w - padR} y2={gy} stroke={ctx.ruleHairline} strokeWidth="1.2" />
                  <text x={padL - 16} y={gy + 5} textAnchor="end" fontFamily={FONTS.mono} fontSize="15" fill={ctx.inkMuted} style={TABULAR_NUM_STYLE}>
                    ${val}
                  </text>
                </g>
              );
            })}

            {/* Concentric Shockwave Rings at Eruption Apex */}
            {ctx.progress > 0.68 && (
              <g opacity={interpolate(ctx.progress, [0.68, 1], [0.85, 0.25], CLAMP)}>
                <circle cx={spikeX} cy={spikeY} r={32 + ctx.progress * 44} fill="none" stroke={ctx.accentLiability} strokeWidth="2.5" />
                <circle cx={spikeX} cy={spikeY} r={18 + ctx.progress * 22} fill="none" stroke={ctx.accentLiability} strokeWidth="3" />
              </g>
            )}

            <path
              d={fullStepPath}
              fill="none"
              stroke={ctx.accentLiability}
              strokeWidth="6"
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
                  <text x={cx} y={baseY + 34} textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.inkSecondary} style={TABULAR_NUM_STYLE}>
                    {a.deliveryYear}
                  </text>
                  <text x={cx} y={cy - 18} textAnchor="middle" fontFamily={FONTS.mono} fontSize={isSpike ? "28" : "19"} fontWeight="700" fill={isSpike ? ctx.accentLiability : ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    ${a.priceMwDay.toFixed(2)}
                  </text>
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
        const w = 1560;
        const h = 620;
        const padL = 100;
        const padR = 120;
        const padT = 56;
        const plotH = 440;
        const plotW = w - padL - padR;

        const xAt = (i: number): number => padL + (i / Math.max(1, periods.length - 1)) * plotW;
        const yAt = (v: number): number => padT + (1 - v / 105) * plotH;

        const costPath = pointsToPath(unitCostIndex.map((v, i) => [xAt(i), yAt(v)]));
        const volPath = pointsToPath(volumeIndex.map((v, i) => [xAt(i), yAt(v)]));
        const costEv = evolvePath(ctx.progress, costPath);
        const volEv = evolvePath(ctx.progress, volPath);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[0, 25, 50, 75, 100].map((v) => (
              <line key={`jv-${v}`} x1={padL} y1={yAt(v)} x2={w - padR} y2={yAt(v)} stroke={ctx.ruleHairline} strokeWidth="1.2" />
            ))}

            <path d={costPath} fill="none" stroke={ctx.accentSolvent} strokeWidth="5.5" strokeLinecap="round" strokeDasharray={costEv.strokeDasharray} strokeDashoffset={costEv.strokeDashoffset} />
            <path d={volPath} fill="none" stroke={ctx.accentLiability} strokeWidth="5.5" strokeLinecap="round" strokeDasharray={volEv.strokeDasharray} strokeDashoffset={volEv.strokeDashoffset} />

            {periods.map((p, i) => (
              <text key={`jv-p-${i}`} x={xAt(i)} y={h - 26} textAnchor="middle" fontFamily={FONTS.mono} fontSize="14.5" fill={ctx.inkSecondary} style={TABULAR_NUM_STYLE}>
                {p}
              </text>
            ))}

            <text x={xAt(0) + 12} y={yAt(unitCostIndex[0]) - 14} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentSolvent}>
              UNIT PRICE INDEX (100 → 1.0)
            </text>
            <text x={xAt(periods.length - 1) - 16} y={yAt(volumeIndex[volumeIndex.length - 1]) - 14} textAnchor="end" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentLiability}>
              AUTOMATED VOLUME (25X SURGE)
            </text>
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
        const w = 1560;
        const h = 620;
        const padL = 100;
        const padR = 230;
        const padT = 48;
        const plotH = 450;
        const plotW = w - padL - padR;
        const maxY = 5.6;

        const xAt = (i: number): number => padL + (i / Math.max(1, quarters.length - 1)) * plotW;
        const yAt = (v: number): number => padT + (1 - v / maxY) * plotH;

        const frPts: Array<[number, number]> = franceYields.map((v, i) => [xAt(i), yAt(v)]);
        const grPts: Array<[number, number]> = greeceYields.map((v, i) => [xAt(i), yAt(v)]);
        const frPath = pointsToPath(frPts);
        const grPath = pointsToPath(grPts);

        const frEv = evolvePath(ctx.progress, frPath);
        const grEv = evolvePath(ctx.progress, grPath);
        const last = quarters.length - 1;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {[0, 1, 2, 3, 4, 5].map((yVal) => (
              <g key={`ssf-${yVal}`}>
                <line x1={padL} y1={yAt(yVal)} x2={w - padR} y2={yAt(yVal)} stroke={ctx.ruleHairline} strokeWidth="1.2" />
                <text x={padL - 14} y={yAt(yVal) + 5} textAnchor="end" fontFamily={FONTS.mono} fontSize="15" fill={ctx.inkMuted} style={TABULAR_NUM_STYLE}>
                  {yVal.toFixed(1)}%
                </text>
              </g>
            ))}

            <path d={grPath} fill="none" stroke={ctx.accentSolvent} strokeWidth="4.5" strokeDasharray={grEv.strokeDasharray} strokeDashoffset={grEv.strokeDashoffset} />
            <path d={frPath} fill="none" stroke={ctx.accentLiability} strokeWidth="5.5" strokeDasharray={frEv.strokeDasharray} strokeDashoffset={frEv.strokeDashoffset} />

            {quarters.map((q, i) => (
              <text key={`ssf-q-${i}`} x={xAt(i)} y={h - 24} textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fill={ctx.inkSecondary} style={TABULAR_NUM_STYLE}>
                {q}
              </text>
            ))}

            {ctx.progress > 0.72 && (
              <g>
                <line x1={frPts[last][0]} y1={frPts[last][1]} x2={grPts[last][0]} y2={grPts[last][1]} stroke={ctx.accentLiability} strokeWidth="3" strokeDasharray="4 4" />
                <text x={frPts[last][0] + 16} y={frPts[last][1] + 5} fontFamily={FONTS.mono} fontSize="17" fontWeight="700" fill={ctx.accentLiability} style={TABULAR_NUM_STYLE}>
                  FRANCE OAT · {franceYields[last].toFixed(2)}%
                </text>
                <text x={grPts[last][0] + 16} y={grPts[last][1] + 5} fontFamily={FONTS.mono} fontSize="17" fontWeight="700" fill={ctx.accentSolvent} style={TABULAR_NUM_STYLE}>
                  GREECE GGB · {greeceYields[last].toFixed(2)}%
                </text>
              </g>
            )}
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
        const w = 1560;
        const h = 620;
        const padL = 100;
        const padR = 220;
        const plotW = w - padL - padR;
        const yAt = (v: number): number => 520 - ((v - 40) / 150) * 440;
        const xAt = (i: number): number => padL + (i / Math.max(1, years.length - 1)) * plotW;

        const wagePath = pointsToPath(nominalWageIndex.map((v, i) => [xAt(i), yAt(v)]));
        const realPath = pointsToPath(realDebtBurdenIndex.map((v, i) => [xAt(i), yAt(v)]));
        const wEv = evolvePath(ctx.progress, wagePath);
        const rEv = evolvePath(ctx.progress, realPath);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {/* Frozen Nominal Debt Iron Beam at Index = 100 */}
            <rect x={padL} y={yAt(100) - 8} width={plotW} height={16} rx={3} fill={ctx.ruleOxford} opacity={0.88} />
            <text x={padL + 16} y={yAt(100) - 16} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.inkPrimary}>
              FROZEN NOMINAL DEBT CONTRACT (INDEX = 100.0)
            </text>

            <path d={wagePath} fill="none" stroke={ctx.accentSolvent} strokeWidth="5" strokeDasharray={wEv.strokeDasharray} strokeDashoffset={wEv.strokeDashoffset} />
            <path d={realPath} fill="none" stroke={ctx.accentLiability} strokeWidth="5.5" strokeDasharray={rEv.strokeDasharray} strokeDashoffset={rEv.strokeDashoffset} />

            {years.map((yr, i) => (
              <text key={`dd33-${i}`} x={xAt(i)} y={575} textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.inkSecondary} style={TABULAR_NUM_STYLE}>
                {yr}
              </text>
            ))}

            <text x={xAt(years.length - 1) + 14} y={yAt(realDebtBurdenIndex[years.length - 1]) + 5} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentLiability} style={TABULAR_NUM_STYLE}>
              REAL DEBT (174)
            </text>
            <text x={xAt(years.length - 1) + 14} y={yAt(nominalWageIndex[years.length - 1]) + 5} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentSolvent} style={TABULAR_NUM_STYLE}>
              WAGES (52)
            </text>
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
        const w = 1560;
        const h = 620;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {/* Left Regime Box: 1933 Hard Gold Ceiling */}
            <rect x={70} y={50} width={660} height={490} rx={10} fill={ctx.surfaceRecessed} stroke={ctx.ruleOxford} strokeWidth="2" />
            <text x={110} y={102} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentCapital}>
              {leftRegimeTitle}
            </text>
            <line x1={110} y1={210} x2={690} y2={210} stroke={ctx.accentCapital} strokeWidth="4" />
            <text x={110} y={194} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.accentCapital} style={TABULAR_NUM_STYLE}>
              HARD STATUTORY GOLD CEILING ({goldRatioPct}% COVER)
            </text>
            <rect x={180} y={220} width={440} height={260 * ctx.progress} rx={6} fill={ctx.accentStatutory} opacity={0.78} />
            <text x={400} y={370} textAnchor="middle" fontFamily={FONTS.serif} fontSize="24" fontWeight="700" fill={ctx.surfaceElevated}>
              Credit Collapses Inside Vault Limit
            </text>

            {/* Right Regime Box: Fiat Liquidity Corridor */}
            <rect x={830} y={50} width={660} height={490} rx={10} fill={ctx.surfaceRecessed} stroke={ctx.accentLiability} strokeWidth="2" />
            <text x={870} y={102} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentLiability}>
              {rightRegimeTitle}
            </text>
            <path
              d="M 880 460 Q 1060 440 1180 310 T 1440 135"
              fill="none"
              stroke={ctx.accentLiability}
              strokeWidth="6"
              strokeLinecap="round"
              opacity={ctx.progress}
            />
            <line x1={870} y1={430} x2={1450} y2={430} stroke={ctx.accentSolvent} strokeWidth="2.5" strokeDasharray="8 6" />
            <text x={870} y={462} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.accentSolvent}>
              2.0% TARGET FLOOR · ZERO BULLION CAP
            </text>
            <text x={1430} y={185} textAnchor="end" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill={ctx.accentLiability} style={TABULAR_NUM_STYLE}>
              {fiatExpansionMultiple.toFixed(1)}x M2 / BASE
            </text>
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
        const w = 1560;
        const h = 620;
        const rulerY = 300;
        const x0 = 130;
        const x1 = 1430;
        const spanW = x1 - x0;

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {/* Central Steel Timeline Ruler */}
            <line x1={x0} y1={rulerY} x2={x0 + spanW * ctx.progress} y2={rulerY} stroke={ctx.ruleOxford} strokeWidth="4" />

            {milestones.map((m, i) => {
              const cx = x0 + (i / Math.max(1, milestones.length - 1)) * spanW;
              const topBarH = m.debtServiceSharePct * 3.6 * ctx.progress;
              const botBarH = m.assetAccessPct * 3.6 * ctx.progress;

              return (
                <g key={`ghr-${m.year}`}>
                  <rect x={cx - 34} y={rulerY - 26 - topBarH} width={68} height={topBarH} rx={4} fill={ctx.accentLiability} />
                  <text x={cx} y={rulerY - 36 - topBarH} textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={ctx.accentLiability} style={TABULAR_NUM_STYLE}>
                    {m.debtServiceSharePct}%
                  </text>

                  <circle cx={cx} cy={rulerY} r={8} fill={ctx.inkPrimary} />
                  <text x={cx} y={rulerY + 26} textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    {m.year} · {m.ageLabel}
                  </text>

                  <rect x={cx - 34} y={rulerY + 42} width={68} height={botBarH} rx={4} fill={ctx.accentSolvent} />
                  <text x={cx} y={rulerY + 66 + botBarH} textAnchor="middle" fontFamily={FONTS.mono} fontSize="17" fontWeight="700" fill={ctx.accentSolvent} style={TABULAR_NUM_STYLE}>
                    {m.assetAccessPct}%
                  </text>
                </g>
              );
            })}

            <text x={x0} y={54} fontFamily={FONTS.mono} fontSize="14.5" fontWeight="700" fill={ctx.accentLiability}>
              ▲ STATUTORY INTEREST + ENTITLEMENT CLAIM ON REVENUE
            </text>
            <text x={x0} y={584} fontFamily={FONTS.mono} fontSize="14.5" fontWeight="700" fill={ctx.accentSolvent}>
              ▼ MEDIAN COHORT HOME & EQUITY ENTRY SHARE
            </text>
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
        const w = 1560;
        const h = 620;
        const barH = 380;
        const baseY = 480;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {columns.map((c, i) => {
              const x = 140 + i * 310;
              const bw = 190;
              const h1 = (c.primaryPct / 100) * barH * ctx.progress;
              const h2 = (c.secondaryPct / 100) * barH * ctx.progress;
              const h3 = (c.otherPct / 100) * barH * ctx.progress;
              return (
                <g key={`sss-${c.era}`}>
                  <rect x={x} y={baseY - h1} width={bw} height={h1} fill={ctx.accentLiability} />
                  <rect x={x} y={baseY - h1 - h2} width={bw} height={h2} fill={ctx.accentSolvent} />
                  <rect x={x} y={baseY - h1 - h2 - h3} width={bw} height={h3} fill={ctx.ruleOxford} opacity={0.45} />
                  <text x={x + bw / 2} y={baseY - h1 / 2 + 7} textAnchor="middle" fontFamily={FONTS.mono} fontSize="22" fontWeight="700" fill="#FAF8F3" style={TABULAR_NUM_STYLE}>
                    {c.primaryPct}%
                  </text>
                  <text x={x + bw / 2} y={baseY + 36} textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    {c.era}
                  </text>
                </g>
              );
            })}
            <text x={140} y={565} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.accentLiability}>
              ■ {primaryLabel}
            </text>
            <text x={720} y={565} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.accentSolvent}>
              ■ {secondaryLabel}
            </text>
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
        const w = 1560;
        const h = 620;
        const baseY = 505;
        const maxV = 520;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={90} y1={baseY} x2={w - 90} y2={baseY} stroke={ctx.ruleOxford} strokeWidth="2" />
            {rows.map((r, i) => {
              const gx = 160 + i * 330;
              const hCap = (r.cashCapexB / maxV) * 410 * ctx.progress;
              const hDep = (r.bookDeprecB / maxV) * 410 * ctx.progress;
              return (
                <g key={`cdg-${r.year}`}>
                  <rect x={gx} y={baseY - hCap} width={92} height={hCap} rx={4} fill={ctx.accentLiability} />
                  <rect x={gx + 104} y={baseY - hDep} width={92} height={hDep} rx={4} fill={ctx.accentStatutory} />
                  <text x={gx + 46} y={baseY - hCap - 12} textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={ctx.accentLiability} style={TABULAR_NUM_STYLE}>
                    ${r.cashCapexB}B
                  </text>
                  <text x={gx + 150} y={baseY - hDep - 12} textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={ctx.accentStatutory} style={TABULAR_NUM_STYLE}>
                    ${r.bookDeprecB}B
                  </text>
                  <text x={gx + 98} y={baseY + 34} textAnchor="middle" fontFamily={FONTS.mono} fontSize="17" fontWeight="700" fill={ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    {r.year}
                  </text>
                </g>
              );
            })}
            <text x={160} y={575} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.accentLiability}>
              ■ CASH CAPITAL EXPENDITURE ($B)
            </text>
            <text x={620} y={575} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.accentStatutory}>
              ■ GAAP BOOK DEPRECIATION EXPENSE ($B)
            </text>
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
        const w = 1560;
        const h = 620;
        const baseY = 500;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={90} y1={baseY} x2={w - 90} y2={baseY} stroke={ctx.ruleOxford} strokeWidth="2.5" />
            {buckets.map((b, i) => {
              const x = 140 + i * 330;
              const bh = (b.trillions / 10.5) * 400 * ctx.progress;
              const isFront = i === 0;
              return (
                <g key={`fhr-${b.bucket}`}>
                  <rect x={x} y={baseY - bh} width={220} height={bh} rx={6} fill={isFront ? ctx.accentLiability : ctx.accentStatutory} />
                  <text x={x + 110} y={baseY - bh - 16} textAnchor="middle" fontFamily={FONTS.mono} fontSize="26" fontWeight="700" fill={isFront ? ctx.accentLiability : ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    ${b.trillions.toFixed(1)}T
                  </text>
                  <text x={x + 110} y={baseY + 34} textAnchor="middle" fontFamily={FONTS.sans} fontSize="17" fontWeight="700" fill={ctx.inkPrimary}>
                    {b.bucket}
                  </text>
                  <text x={x + 110} y={baseY + 58} textAnchor="middle" fontFamily={FONTS.mono} fontSize="14" fill={ctx.inkMuted} style={TABULAR_NUM_STYLE}>
                    REFI @ {b.refiRatePct.toFixed(2)}%
                  </text>
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
        const w = 1560;
        const h = 620;
        const barX = 90;
        const barW = 1380;
        let cursor = barX;

        const fills = [ctx.accentStatutory, ctx.accentSolvent, ctx.accentCapital];

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <text x={barX} y={170} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.inkMuted}>
              100.0% ATTESTED RESERVE BACKING COMPOSITION
            </text>
            {segments.map((seg, i) => {
              const sw = (seg.pct / 100) * barW * ctx.progress;
              const x = cursor;
              cursor += sw;
              return (
                <g key={`rab-${i}`}>
                  <rect x={x} y={195} width={Math.max(0, sw - 4)} height={140} rx={6} fill={fills[i % fills.length]} />
                  {seg.pct >= 10 && (
                    <text x={x + sw / 2} y={274} textAnchor="middle" fontFamily={FONTS.mono} fontSize="28" fontWeight="700" fill="#FAF8F3" style={TABULAR_NUM_STYLE}>
                      {seg.pct.toFixed(1)}%
                    </text>
                  )}
                  <text x={barX + i * 470} y={435} fontFamily={FONTS.sans} fontSize="18" fontWeight="700" fill={fills[i % fills.length]}>
                    ■ {seg.asset}
                  </text>
                  <text x={barX + i * 470} y={465} fontFamily={FONTS.mono} fontSize="22" fontWeight="700" fill={ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    {seg.pct.toFixed(1)}% Share
                  </text>
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
        const w = 1560;
        const h = 620;
        const padL = 100;
        const padR = 180;
        const zeroY = 500;
        const plotW = w - padL - padR;
        const xAt = (i: number): number => padL + (i / Math.max(1, years.length - 1)) * plotW;
        const yAt = (v: number): number => zeroY - (v / 3.0) * 400;

        const pts: Array<[number, number]> = reserveTrillions.map((v, i) => [xAt(i), yAt(v)]);
        const curvePath = pointsToPath(pts);
        const ev = evolvePath(ctx.progress, curvePath);
        const lastX = xAt(years.length - 1);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke={ctx.accentLiability} strokeWidth="3" />
            <text x={padL + 10} y={zeroY - 12} fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={ctx.accentLiability}>
              $0.0T STATUTORY INSOLVENCY FLOOR
            </text>

            <path d={curvePath} fill="none" stroke={ctx.accentLiability} strokeWidth="6" strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />

            {years.map((yr, i) => (
              <g key={`tfd-${yr}`}>
                <circle cx={pts[i][0]} cy={pts[i][1]} r={6} fill={ctx.accentLiability} opacity={ctx.progress} />
                <text x={pts[i][0]} y={zeroY + 34} textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                  {yr}
                </text>
              </g>
            ))}

            {ctx.progress > 0.75 && (
              <g>
                <rect x={lastX - 280} y={zeroY - 110} width={340} height={64} rx={8} fill={ctx.accentLiability} />
                <text x={lastX - 110} y={zeroY - 70} textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill="#FAF8F3">
                  {automaticCutPct}
                </text>
              </g>
            )}
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
        const w = 1560;
        const h = 620;
        const cx = w / 2;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={cx} y1={48} x2={cx} y2={530} stroke={ctx.ruleOxford} strokeWidth="2" />
            {bands.map((b, i) => {
              const y = 70 + i * 92;
              const lw = b.leftPct * 36 * ctx.progress;
              const rw = b.rightPct * 36 * ctx.progress;
              const isSenior = i <= 1;
              const color = isSenior ? ctx.accentLiability : ctx.accentStatutory;
              return (
                <g key={`dcp-${b.band}`}>
                  <rect x={cx - 80 - lw} y={y} width={lw} height={54} rx={4} fill={color} />
                  <rect x={cx + 80} y={y} width={rw} height={54} rx={4} fill={color} opacity={0.85} />
                  <text x={cx} y={y + 33} textAnchor="middle" fontFamily={FONTS.mono} fontSize="14.5" fontWeight="700" fill={ctx.inkPrimary}>
                    {b.band}
                  </text>
                  <text x={cx - 94 - lw} y={y + 34} textAnchor="end" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={color} style={TABULAR_NUM_STYLE}>
                    {b.leftPct.toFixed(1)}%
                  </text>
                  <text x={cx + 94 + rw} y={y + 34} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={color} style={TABULAR_NUM_STYLE}>
                    {b.rightPct.toFixed(1)}%
                  </text>
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
        const w = 1560;
        const h = 620;
        const fullW = 1140 * ctx.progress;
        const tinyW = Math.max(12, (lowCostUsd / Math.max(1, highCostUsd)) * 1140);
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <text x={110} y={155} fontFamily={FONTS.sans} fontSize="21" fontWeight="700" fill={ctx.inkPrimary}>
              {lowCostLabel}
            </text>
            <rect x={110} y={175} width={tinyW} height={74} rx={4} fill={ctx.accentSolvent} />
            <text x={110 + tinyW + 18} y={222} fontFamily={FONTS.mono} fontSize="28" fontWeight="700" fill={ctx.accentSolvent} style={TABULAR_NUM_STYLE}>
              ${lowCostUsd.toLocaleString()}
            </text>

            <text x={110} y={345} fontFamily={FONTS.sans} fontSize="21" fontWeight="700" fill={ctx.inkPrimary}>
              {highCostLabel}
            </text>
            <rect x={110} y={365} width={fullW} height={104} rx={6} fill={ctx.accentLiability} />
            <text x={110 + fullW + 18} y={428} fontFamily={FONTS.mono} fontSize="32" fontWeight="700" fill={ctx.accentLiability} style={TABULAR_NUM_STYLE}>
              ${highCostUsd.toLocaleString()}
            </text>
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
        const w = 1560;
        const h = 620;
        const barW = 1340;
        let xCursor = 110;
        const paletteList = [ctx.accentLiability, ctx.accentStatutory, ctx.accentCapital, ctx.ruleOxford];
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {entities.map((ent, i) => {
              const segW = (ent.sharePct / 100) * barW * ctx.progress;
              const sx = xCursor;
              xCursor += segW;
              return (
                <g key={`bcb-${i}`}>
                  <rect x={sx} y={160} width={Math.max(0, segW - 5)} height={150} rx={6} fill={paletteList[i % paletteList.length]} />
                  <text x={sx + segW / 2} y={246} textAnchor="middle" fontFamily={FONTS.mono} fontSize="28" fontWeight="700" fill="#FAF8F3" style={TABULAR_NUM_STYLE}>
                    {ent.sharePct}%
                  </text>
                  <text x={110 + (i % 2) * 680} y={395 + Math.floor(i / 2) * 80} fontFamily={FONTS.sans} fontSize="19" fontWeight="700" fill={paletteList[i % paletteList.length]}>
                    ■ {ent.name} ({ent.sharePct}%)
                  </text>
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
        const w = 1560;
        const h = 620;
        const baseY = 505;
        const scale = 0.14;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={100} y1={baseY} x2={w - 100} y2={baseY} stroke={ctx.ruleOxford} strokeWidth="2.5" />
            {columns.map((c, i) => {
              const x = 210 + i * 420;
              const bw = 240;
              const hPi = c.principalInterest * scale * ctx.progress;
              const hTx = c.propertyTax * scale * ctx.progress;
              const hIn = c.hazardInsurance * scale * ctx.progress;
              const total = c.principalInterest + c.propertyTax + c.hazardInsurance;
              return (
                <g key={`esb-${c.year}`}>
                  <rect x={x} y={baseY - hPi} width={bw} height={hPi} fill={ctx.accentStatutory} />
                  <rect x={x} y={baseY - hPi - hTx} width={bw} height={hTx} fill={ctx.accentCapital} />
                  <rect x={x} y={baseY - hPi - hTx - hIn} width={bw} height={hIn} fill={ctx.accentLiability} />
                  <text x={x + bw / 2} y={baseY - hPi - hTx - hIn - 16} textAnchor="middle" fontFamily={FONTS.mono} fontSize="24" fontWeight="700" fill={i === columns.length - 1 ? ctx.accentLiability : ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    ${total.toLocaleString()}/mo
                  </text>
                  <text x={x + bw / 2} y={baseY + 36} textAnchor="middle" fontFamily={FONTS.mono} fontSize="17" fontWeight="700" fill={ctx.inkPrimary}>
                    {c.year}
                  </text>
                </g>
              );
            })}
            <text x={210} y={576} fontFamily={FONTS.mono} fontSize="14.5" fontWeight="700" fill={ctx.accentStatutory}>
              ■ FIXED PRINCIPAL & INTEREST
            </text>
            <text x={630} y={576} fontFamily={FONTS.mono} fontSize="14.5" fontWeight="700" fill={ctx.accentCapital}>
              ■ PROPERTY TAX
            </text>
            <text x={960} y={576} fontFamily={FONTS.mono} fontSize="14.5" fontWeight="700" fill={ctx.accentLiability}>
              ■ HAZARD INSURANCE SURGE
            </text>
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
    { mineral: "RefinedGallium / Germanium", miningTopSharePct: 62, refiningTopSharePct: 89 },
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
        const w = 1560;
        const h = 620;
        const barStart = 430;
        const maxBarW = 980;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {minerals.map((m, i) => {
              const y = 78 + i * 116;
              const wMine = (m.miningTopSharePct / 100) * maxBarW * ctx.progress;
              const wRef = (m.refiningTopSharePct / 100) * maxBarW * ctx.progress;
              return (
                <g key={`mrd-${i}`}>
                  <text x={barStart - 24} y={y + 34} textAnchor="end" fontFamily={FONTS.sans} fontSize="18" fontWeight="700" fill={ctx.inkPrimary}>
                    {m.mineral}
                  </text>
                  <rect x={barStart} y={y} width={wMine} height={26} rx={4} fill={ctx.accentSolvent} />
                  <text x={barStart + wMine + 12} y={y + 19} fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={ctx.accentSolvent} style={TABULAR_NUM_STYLE}>
                    Mining {m.miningTopSharePct}%
                  </text>
                  <rect x={barStart} y={y + 34} width={wRef} height={30} rx={4} fill={ctx.accentLiability} />
                  <text x={barStart + wRef + 12} y={y + 55} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentLiability} style={TABULAR_NUM_STYLE}>
                    Refining {m.refiningTopSharePct}%
                  </text>
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
        const w = 1560;
        const h = 620;
        const baseY = 505;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            <line x1={100} y1={baseY} x2={w - 100} y2={baseY} stroke={ctx.ruleOxford} strokeWidth="2.5" />
            {bins.map((b, i) => {
              const x = 140 + i * 265;
              const bh = (b.leadTimeWeeks / 210) * 410 * ctx.progress;
              const isSevere = b.leadTimeWeeks >= 120;
              return (
                <g key={`wqh-${b.year}`}>
                  <rect x={x} y={baseY - bh} width={185} height={bh} rx={5} fill={isSevere ? ctx.accentLiability : ctx.accentStatutory} />
                  <text x={x + 92} y={baseY - bh - 16} textAnchor="middle" fontFamily={FONTS.mono} fontSize="24" fontWeight="700" fill={isSevere ? ctx.accentLiability : ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    {b.leadTimeWeeks} wks
                  </text>
                  <text x={x + 92} y={baseY + 36} textAnchor="middle" fontFamily={FONTS.mono} fontSize="17" fontWeight="700" fill={ctx.inkPrimary} style={TABULAR_NUM_STYLE}>
                    {b.year}
                  </text>
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
        const w = 1560;
        const h = 620;
        const realScale = Math.sqrt(realAmount / Math.max(1, nominalAmount));
        const outerS = 390;
        const innerS = outerS * (1 - (1 - realScale) * ctx.progress);

        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {/* Nominal Par Outer Frame */}
            <rect x={220} y={95} width={outerS} height={outerS} rx={10} fill="none" stroke={ctx.ruleOxford} strokeWidth="3.5" strokeDasharray="10 8" />
            <text x={415} y={72} textAnchor="middle" fontFamily={FONTS.mono} fontSize="17" fontWeight="700" fill={ctx.inkSecondary} style={TABULAR_NUM_STYLE}>
              NOMINAL FACE VALUE · ${nominalAmount}.00
            </text>

            {/* Shrinking Real Purchasing Power Core */}
            <rect x={220 + (outerS - innerS) / 2} y={95 + (outerS - innerS) / 2} width={innerS} height={innerS} rx={8} fill={ctx.accentLiability} />
            <text x={415} y={300} textAnchor="middle" fontFamily={FONTS.mono} fontSize="54" fontWeight="700" fill="#FAF8F3" style={TABULAR_NUM_STYLE}>
              ${realAmount}
            </text>

            {/* Right Explanatory Breakdown */}
            <text x={760} y={210} fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={ctx.accentLiability}>
              {horizonText}
            </text>
            <text x={760} y={285} fontFamily={FONTS.serif} fontSize="42" fontWeight="700" fill={ctx.inkPrimary}>
              -{lossPct}% Silent Haircut
            </text>
            <text x={760} y={345} fontFamily={FONTS.sans} fontSize="20" fill={ctx.inkSecondary}>
              Nominal par remains 100%, yet scarce non-automatable essentials reprice upward.
            </text>
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
        const w = 1560;
        const h = 620;
        return (
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
            {bidders.map((b, i) => {
              const y = 95 + i * 155;
              const bw = (b.maxMwhBid / 135) * 980 * ctx.progress;
              const fill = b.isWinner ? ctx.accentLiability : ctx.accentStatutory;
              return (
                <g key={`mbc-${i}`}>
                  <text x={110} y={y - 12} fontFamily={FONTS.sans} fontSize="20" fontWeight="700" fill={ctx.inkPrimary}>
                    {b.bidder} · <tspan fontFamily={FONTS.mono} fontSize="15" fill={ctx.inkMuted}>{b.operatingMarginNote}</tspan>
                  </text>
                  <rect x={110} y={y + 4} width={bw} height={68} rx={6} fill={fill} />
                  <text x={110 + bw + 18} y={y + 48} fontFamily={FONTS.mono} fontSize="28" fontWeight="700" fill={fill} style={TABULAR_NUM_STYLE}>
                    ${b.maxMwhBid}/MWh
                  </text>
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
