import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, TABULAR_NUM_STYLE, getOpticalTracking } from "../design/fonts";
import { fitSvgTextToWidth, wrapSvgTextLines } from "../design/fitText";
import {
  COLORS,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  REGISTERS,
  RegisterId,
  RegisterPalette,
  studioSpring,
} from "../design/tokens";

export type SimulatorDisplayMode = "page" | "over-footage" | "card";

export interface SystemSimulatorRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
}

export interface SimulatorBaseProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  sourceCitation?: string;
  summaryMetric?: string;
  summaryLabel?: string;
  paletteMode?: "page" | "over-footage";
  mode?: SimulatorDisplayMode;
  register?: RegisterId;
  atFrame?: number;
}

interface SimulatorShellTheme {
  isGlass: boolean;
  isCompact: boolean;
  isDark: boolean;
  inkHeadline: string;
  inkBody: string;
  inkMuted: string;
  navyInk: string;
  accentAlert: string;
  accentTeal: string;
  accentCapital: string;
  accentSlate: string;
  panelBg: string;
  panelBorder: string;
  wellBg: string;
  solidPanelBg: string;
  solidPanelInk: string;
  solidPanelMuted: string;
  riskBg: string;
  riskBorder: string;
  highlightWash: string;
}

function resolveSimulatorRegister(register?: RegisterId): RegisterPalette {
  return REGISTERS[register ?? "page_editorial"];
}

function getSimulatorTheme(
  isGlass: boolean,
  isCompact: boolean,
  reg: RegisterPalette
): SimulatorShellTheme {
  if (isGlass) {
    return {
      isGlass: true,
      isCompact,
      isDark: true,
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline,
      inkBody: OVER_FOOTAGE_PALETTE.textBody,
      inkMuted: OVER_FOOTAGE_PALETTE.textMuted,
      navyInk: OVER_FOOTAGE_PALETTE.accentPrimary,
      accentAlert: OVER_FOOTAGE_PALETTE.brickRedText,
      accentTeal: OVER_FOOTAGE_PALETTE.chartSecondary,
      accentCapital: OVER_FOOTAGE_PALETTE.accentWarm,
      accentSlate: OVER_FOOTAGE_PALETTE.accentPrimary,
      panelBg: "rgba(15, 25, 35, 0.56)",
      panelBorder: OVER_FOOTAGE_PALETTE.glassBorder,
      wellBg: OVER_FOOTAGE_PALETTE.glassDarkWell,
      solidPanelBg: PAGE_PALETTE.navyDeep,
      solidPanelInk: OVER_FOOTAGE_PALETTE.textHeadline,
      solidPanelMuted: OVER_FOOTAGE_PALETTE.textBody,
      riskBg: OVER_FOOTAGE_PALETTE.riskFill,
      riskBorder: OVER_FOOTAGE_PALETTE.brickRedText,
      highlightWash: OVER_FOOTAGE_PALETTE.highlightSweep,
    };
  }
  return {
    isGlass: false,
    isCompact,
    isDark: reg.isDark,
    inkHeadline: reg.ink.primary,
    inkBody: reg.ink.secondary,
    inkMuted: reg.ink.muted,
    navyInk: reg.isDark ? reg.accent.statutory : reg.rule.oxford,
    accentAlert: reg.accent.liability,
    accentTeal: reg.accent.solvent,
    accentCapital: reg.accent.capital,
    accentSlate: reg.accent.statutory,
    panelBg: reg.bg.elevated,
    panelBorder: reg.rule.hairline,
    wellBg: reg.bg.recessed,
    solidPanelBg: reg.isDark ? reg.bg.recessed : PAGE_PALETTE.navyDeep,
    solidPanelInk: reg.isDark ? reg.ink.primary : OVER_FOOTAGE_PALETTE.textHeadline,
    solidPanelMuted: reg.isDark ? reg.ink.secondary : OVER_FOOTAGE_PALETTE.textBody,
    riskBg: reg.isDark ? "rgba(163, 64, 46, 0.24)" : PAGE_PALETTE.riskFill,
    riskBorder: reg.accent.liability,
    highlightWash: reg.accent.highlighterWash,
  };
}

interface FittedSvgTextProps {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  minFontSize?: number;
  fontFamily: string;
  fontWeight?: number | string;
  fill: string;
  textAnchor?: "start" | "middle" | "end";
  dominantBaseline?: "auto" | "central" | "hanging";
  style?: React.CSSProperties;
}

const FittedSvgText: React.FC<FittedSvgTextProps> = ({
  text,
  x,
  y,
  maxWidth,
  fontSize,
  minFontSize,
  fontFamily,
  fontWeight = 700,
  fill,
  textAnchor = "start",
  dominantBaseline,
  style,
}) => {
  const fitted = fitSvgTextToWidth(
    text,
    maxWidth,
    fontSize,
    minFontSize ?? Math.max(10, fontSize * 0.66),
    fontFamily,
    { fontWeight }
  );
  return (
    <text
      x={x}
      y={y}
      fontFamily={fontFamily}
      fontSize={fitted.fontSize}
      fontWeight={fontWeight}
      fill={fill}
      textAnchor={textAnchor}
      dominantBaseline={dominantBaseline}
      style={style}
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
  fontFamily: string;
  fontWeight?: number | string;
  fill: string;
  textAnchor?: "start" | "middle" | "end";
  verticalCenter?: boolean;
  style?: React.CSSProperties;
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
  fontFamily,
  fontWeight = 700,
  fill,
  textAnchor = "start",
  verticalCenter = false,
  style,
}) => {
  const wrapped = wrapSvgTextLines(text, maxWidth, fontSize, fontFamily, maxLines, {
    minFontSize: minFontSize ?? Math.max(10, fontSize * 0.66),
    lineHeight,
    fontWeight,
  });
  if (wrapped.lines.length === 0) return null;
  const totalHeight = (wrapped.lines.length - 1) * wrapped.lineHeightPx;
  const startY = verticalCenter ? y - totalHeight * 0.5 : y;

  return (
    <text
      x={x}
      y={startY}
      fontFamily={fontFamily}
      fontSize={wrapped.fontSize}
      fontWeight={fontWeight}
      fill={fill}
      textAnchor={textAnchor}
      dominantBaseline={verticalCenter ? "central" : undefined}
      style={style}
    >
      {wrapped.lines.map((line, idx) => (
        <tspan key={`sim-wl-${idx}`} x={x} dy={idx === 0 ? 0 : wrapped.lineHeightPx}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

interface SimulatorShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  sourceCitation: string;
  summaryMetric?: string;
  summaryLabel?: string;
  mode?: SimulatorDisplayMode;
  paletteMode?: "page" | "over-footage";
  register?: RegisterId;
  atFrame?: number;
  renderGraphic: (theme: SimulatorShellTheme, elapsed: number, fps: number) => React.ReactNode;
}

const SimulatorShell: React.FC<SimulatorShellProps> = ({
  eyebrow,
  title,
  subtitle,
  sourceCitation,
  summaryMetric,
  summaryLabel = "KEY SYSTEM READOUT",
  mode,
  paletteMode = "page",
  register,
  atFrame = 0,
  renderGraphic,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - atFrame);
  const enter = interpolate(
    studioSpring(elapsed, fps, "editorialSnap", 0),
    [0, 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const highlightSweep = interpolate(elapsed, [10, 40], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const resolvedMode: SimulatorDisplayMode =
    mode ?? (paletteMode === "over-footage" ? "over-footage" : "page");
  const isGlass = resolvedMode === "over-footage";
  const isCompact = resolvedMode !== "page";
  const reg = resolveSimulatorRegister(register);
  const theme = getSimulatorTheme(isGlass, isCompact, reg);

  if (resolvedMode !== "page") {
    return (
      <div
        style={{
          position: "relative",
          width: "640px",
          background: isGlass ? OVER_FOOTAGE_PALETTE.glassPrimary : reg.bg.elevated,
          backdropFilter: isGlass ? "blur(14px) saturate(155%)" : undefined,
          WebkitBackdropFilter: isGlass ? "blur(14px) saturate(155%)" : undefined,
          border: `1px solid ${isGlass ? OVER_FOOTAGE_PALETTE.glassBorder : reg.rule.hairline}`,
          borderRadius: "16px",
          padding: "24px 26px 20px 26px",
          boxSizing: "border-box",
          boxShadow: isGlass
            ? "0 24px 52px -12px rgba(15, 25, 35, 0.52)"
            : "0 24px 52px -14px rgba(28, 43, 58, 0.16), 0 4px 16px rgba(28, 43, 58, 0.06)",
          opacity: enter,
          transform: `translate3d(0, ${((1 - enter) * 16).toFixed(1)}px, 0)`,
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
            backgroundColor: isGlass
              ? OVER_FOOTAGE_PALETTE.chartSecondary
              : reg.isDark
              ? reg.accent.statutory
              : reg.rule.oxford,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: getOpticalTracking(12, "mono"),
              textTransform: "uppercase",
              color: theme.accentAlert,
            }}
          >
            {eyebrow}
          </span>
          {summaryMetric && (
            <span
              style={{
                ...TABULAR_NUM_STYLE,
                fontFamily: FONTS.mono,
                fontSize: "15px",
                fontWeight: 700,
                color: theme.accentTeal,
                backgroundColor: isGlass ? OVER_FOOTAGE_PALETTE.glassDarkWell : reg.bg.recessed,
                border: `1px solid ${isGlass ? OVER_FOOTAGE_PALETTE.glassInnerHairline : reg.rule.hairline}`,
                padding: "3px 10px",
                borderRadius: "4px",
                flexShrink: 0,
              }}
            >
              {summaryMetric}
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: "23px",
            fontWeight: 700,
            lineHeight: 1.18,
            color: theme.inkHeadline,
            marginBottom: "14px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: "100%",
            borderRadius: "12px",
            backgroundColor: theme.panelBg,
            border: `1px solid ${isGlass ? OVER_FOOTAGE_PALETTE.glassInnerHairline : reg.rule.hairline}`,
            padding: "11px",
            boxSizing: "border-box",
          }}
        >
          {renderGraphic(theme, elapsed, fps)}
        </div>
        <div
          style={{
            marginTop: "10px",
            paddingTop: "8px",
            borderTop: `1px solid ${isGlass ? OVER_FOOTAGE_PALETTE.glassInnerHairline : reg.rule.hairline}`,
            fontFamily: FONTS.mono,
            fontSize: "11px",
            color: theme.inkMuted,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ...TABULAR_NUM_STYLE,
          }}
        >
          {sourceCitation}
        </div>
      </div>
    );
  }

  const topAccentColor = reg.isDark ? reg.accent.statutory : reg.rule.oxford;
  const dualShadow = reg.isDark
    ? "0 24px 52px -14px rgba(3, 9, 18, 0.56), 0 4px 16px rgba(3, 9, 18, 0.30)"
    : "0 24px 52px -14px rgba(28, 43, 58, 0.16), 0 4px 16px rgba(28, 43, 58, 0.06)";

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: reg.bg.canvas,
        padding: "54px 88px 46px 88px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      {/* Masthead */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderBottom: `2px solid ${topAccentColor}`,
          paddingBottom: "18px",
          gap: "32px",
        }}
      >
        <div style={{ maxWidth: "1260px" }}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: reg.accent.liability,
              marginBottom: "6px",
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: FONTS.serif,
              fontSize: "46px",
              fontWeight: 700,
              lineHeight: 1.08,
              color: reg.ink.primary,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: "8px 0 0 0",
              fontFamily: FONTS.sans,
              fontSize: "19px",
              lineHeight: 1.4,
              color: reg.ink.muted,
            }}
          >
            {subtitle}
          </p>
        </div>

        {summaryMetric && (
          <div
            style={{
              backgroundColor: reg.bg.elevated,
              border: `1px solid ${reg.rule.hairline}`,
              borderLeft: `4px solid ${reg.accent.liability}`,
              borderRadius: "8px",
              padding: "12px 22px",
              textAlign: "right",
              boxShadow: dualShadow,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: reg.ink.muted,
              }}
            >
              {summaryLabel}
            </div>
            <div
              style={{
                position: "relative",
                display: "inline-block",
                marginTop: "4px",
                padding: "0 4px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "2px",
                  height: "18px",
                  width: `${highlightSweep}%`,
                  backgroundColor: reg.accent.highlighterWash,
                  borderRadius: "3px",
                  zIndex: 0,
                }}
              />
              <span
                style={{
                  ...TABULAR_NUM_STYLE,
                  position: "relative",
                  zIndex: 1,
                  fontFamily: FONTS.mono,
                  fontSize: "30px",
                  fontWeight: 700,
                  color: reg.ink.primary,
                }}
              >
                {summaryMetric}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Mechanical Schematic Stage */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          margin: "22px 0",
          backgroundColor: reg.bg.elevated,
          border: `1px solid ${reg.rule.hairline}`,
          borderRadius: "10px",
          padding: "26px 32px 22px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: dualShadow,
          opacity: enter,
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
            backgroundColor: topAccentColor,
          }}
        />
        {renderGraphic(theme, elapsed, fps)}
      </div>

      {/* Footer Citation Bar */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${reg.rule.hairline}`,
          paddingTop: "12px",
          fontFamily: FONTS.mono,
          fontSize: "12.5px",
          color: reg.ink.muted,
          ...TABULAR_NUM_STYLE,
        }}
      >
        <span>{sourceCitation}</span>
        <span>READING ROOM MECHANICAL SCHEMATIC · DETERMINISTIC FRAME LOCK</span>
      </div>
    </div>
  );
};

// ============================================================================
// 1. SupplyChainBomStrip ($120 Shoe Decomposed -> 80% Labor Vaporized -> $24 Plinth)
// ============================================================================
export interface BomSliceSpec {
  label: string;
  dollars: number;
  isLabor: boolean;
  detail: string;
}

export interface SupplyChainBomStripProps extends SimulatorBaseProps {
  retailPrice?: number;
  slices?: BomSliceSpec[];
}

export const SupplyChainBomStrip: React.FC<SupplyChainBomStripProps> = ({
  retailPrice = 120,
  slices = [
    { label: "Retail, Brand & Ad Hours", dollars: 42, isLabor: true, detail: "Storefront, media & design wages" },
    { label: "Freight, Port & Customs Labor", dollars: 22, isLabor: true, detail: "Trucking, brokerage & warehousing" },
    { label: "Upper Stitching & Assembly", dollars: 18, isLabor: true, detail: "44 manual operations per pair" },
    { label: "Sub-Tier Milling & Dyeing", dollars: 14, isLabor: true, detail: "Textile loom & chemical supervision" },
    { label: "Raw Atoms & Baseload kWh", dollars: 24, isLabor: false, detail: "EVA foam, vulcanized rubber, 18 kWh" },
  ],
  eyebrow = "BILL-OF-MATERIALS X-RAY",
  title = "The $120 Retail Price Is 80% Human Hours in Disguise",
  subtitle = "When autonomous robotics & software vaporize embedded wage layers, price collapses toward the electricity and raw-mineral plinth.",
  sourceCitation = "SOURCE: MANUFACTURING BOM DECOMPOSITION · BUREAU OF ECONOMIC ANALYSIS INPUT-OUTPUT TABLES",
  summaryMetric = "$120 -> $24 PLINTH",
  summaryLabel = "80% WAGE VAPORIZATION",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => {
  return (
    <SimulatorShell
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      sourceCitation={sourceCitation}
      summaryMetric={summaryMetric}
      summaryLabel={summaryLabel}
      mode={mode}
      paletteMode={paletteMode}
      register={register}
      atFrame={atFrame}
      renderGraphic={(theme, elapsed, fps) => {
        const vapor = interpolate(
          studioSpring(elapsed, fps, "cameraGlide", 18),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const currentPrice = Math.round(retailPrice - (retailPrice - 24) * vapor);

        if (theme.isCompact) {
          return (
            <svg width="100%" height="100%" viewBox="0 0 564 348">
              <rect x="8" y="8" width="548" height="86" rx="10" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
              <FittedSvgText text="X-RAY CLEARING PRICE" x={24} y={36} maxWidth={250} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} />
              <text x="24" y="76" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill={theme.inkHeadline} style={TABULAR_NUM_STYLE}>
                ${currentPrice}
              </text>
              <FittedSvgText
                text={`${Math.round((1 - vapor * 0.8) * 100)}% of $${retailPrice} MSRP`}
                x={540}
                y={64}
                maxWidth={260}
                fontSize={16}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={theme.accentTeal}
                textAnchor="end"
                style={TABULAR_NUM_STYLE}
              />
              {slices.slice(0, 4).map((sl, idx) => {
                const y = 104 + idx * 48;
                const isLast = idx === 3;
                const rowItem = isLast ? slices[slices.length - 1] ?? sl : sl;
                const val = rowItem.isLabor ? Math.round(rowItem.dollars * (1 - vapor * 0.92)) : rowItem.dollars;
                return (
                  <g key={`c-bom-${idx}`} transform={`translate(8, ${y})`} opacity={rowItem.isLabor ? Math.max(0.32, 1 - vapor * 0.65) : 1}>
                    <rect
                      width="548"
                      height="40"
                      rx="7"
                      fill={rowItem.isLabor ? theme.wellBg : theme.solidPanelBg}
                      stroke={rowItem.isLabor ? theme.riskBorder : theme.accentTeal}
                      strokeWidth="1.6"
                    />
                    <FittedSvgText
                      text={rowItem.label}
                      x={16}
                      y={26}
                      maxWidth={390}
                      fontSize={15}
                      fontFamily={FONTS.sans}
                      fontWeight={700}
                      fill={rowItem.isLabor ? theme.inkHeadline : theme.solidPanelInk}
                    />
                    <FittedSvgText
                      text={`$${val}`}
                      x={532}
                      y={26}
                      maxWidth={110}
                      fontSize={16}
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={rowItem.isLabor ? theme.accentAlert : theme.accentTeal}
                      textAnchor="end"
                      style={TABULAR_NUM_STYLE}
                    />
                  </g>
                );
              })}
              <FittedSvgText
                text="Labor layers compress to $24 raw atoms + 18 kWh plinth."
                x={282}
                y={330}
                maxWidth={532}
                fontSize={15}
                fontFamily={FONTS.sans}
                fontWeight={600}
                fill={theme.inkMuted}
                textAnchor="middle"
              />
            </svg>
          );
        }

        return (
          <svg width="100%" height="100%" viewBox="0 0 1560 640">
            {/* Left X-Ray Silhouette & Live Price Tag */}
            <rect
              x="48"
              y="68"
              width="430"
              height="504"
              rx="14"
              fill={theme.wellBg}
              stroke={theme.navyInk}
              strokeWidth="2"
            />
            <FittedSvgText
              text="X-RAY UNIT COST AUDIT"
              x={84}
              y={118}
              maxWidth={358}
              fontSize={14}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.accentAlert}
            />
            <text
              x="84"
              y="196"
              fontFamily={FONTS.mono}
              fontSize="74"
              fontWeight="700"
              fill={theme.inkHeadline}
              style={TABULAR_NUM_STYLE}
            >
              ${currentPrice}
            </text>
            <FittedSvgText
              text={`Effective Clearing Price (${Math.round((1 - vapor * 0.8) * 100)}% of 2025 MSRP)`}
              x={84}
              y={232}
              maxWidth={358}
              fontSize={17}
              fontFamily={FONTS.sans}
              fontWeight={600}
              fill={theme.inkMuted}
            />

            {/* Technical Shoe Cross-Section Vector */}
            <g transform="translate(86, 290)">
              <path
                d="M 20 155 L 330 155 Q 352 155 348 132 Q 338 98 270 92 L 185 52 L 142 68 Q 112 96 58 84 L 24 102 Z"
                fill="none"
                stroke={theme.navyInk}
                strokeWidth="3"
                strokeDasharray={vapor > 0.4 ? "7 5" : undefined}
              />
              <rect
                x="18"
                y="155"
                width="332"
                height="28"
                rx="8"
                fill={PAGE_PALETTE.navy}
              />
              <FittedSvgText
                text="$24 ATOMS + 18 kWh SOLE PLINTH"
                x={184}
                y={174}
                maxWidth={310}
                fontSize={12}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={OVER_FOOTAGE_PALETTE.textHeadline}
                textAnchor="middle"
              />
            </g>

            {/* Right Decomposed Stack */}
            {slices.map((sl, idx) => {
              const baseY = 72 + idx * 102;
              const lift = sl.isLabor ? vapor * (36 - idx * 6) : 0;
              const op = sl.isLabor ? Math.max(0.22, 1 - vapor * 0.76) : 1;
              const barWidth = Math.round((sl.dollars / 45) * 560);

              return (
                <g
                  key={`bom-sl-${idx}`}
                  transform={`translate(540, ${(baseY - lift).toFixed(1)})`}
                  opacity={op}
                >
                  <rect
                    x="0"
                    y="0"
                    width="960"
                    height="84"
                    rx="10"
                    fill={sl.isLabor ? theme.wellBg : PAGE_PALETTE.navy}
                    stroke={sl.isLabor ? theme.accentAlert : theme.accentTeal}
                    strokeWidth={sl.isLabor ? "1.8" : "3"}
                    strokeDasharray={sl.isLabor && vapor > 0.35 ? "8 6" : undefined}
                  />
                  <rect
                    x="14"
                    y="14"
                    width={barWidth}
                    height="56"
                    rx="6"
                    fill={
                      sl.isLabor
                        ? "rgba(163, 64, 46, 0.16)"
                        : PAGE_PALETTE.chartSecondary
                    }
                  />
                  <FittedSvgText
                    text={sl.label}
                    x={32}
                    y={40}
                    maxWidth={760}
                    fontSize={20}
                    fontFamily={FONTS.sans}
                    fontWeight={700}
                    fill={sl.isLabor ? theme.inkHeadline : OVER_FOOTAGE_PALETTE.textHeadline}
                  />
                  <FittedSvgText
                    text={sl.detail}
                    x={32}
                    y={63}
                    maxWidth={760}
                    fontSize={13}
                    fontFamily={FONTS.mono}
                    fontWeight={500}
                    fill={sl.isLabor ? theme.inkMuted : OVER_FOOTAGE_PALETTE.accentPrimary}
                  />
                  <text
                    x="928"
                    y="50"
                    textAnchor="end"
                    fontFamily={FONTS.mono}
                    fontSize="28"
                    fontWeight="700"
                    fill={
                      sl.isLabor
                        ? theme.accentAlert
                        : OVER_FOOTAGE_PALETTE.textHeadline
                    }
                    style={TABULAR_NUM_STYLE}
                  >
                    ${sl.isLabor ? Math.round(sl.dollars * (1 - vapor * 0.92)) : sl.dollars}
                  </text>
                </g>
              );
            })}
          </svg>
        );
      }}
    />
  );
};

// ============================================================================
// 2. PaloAltoWhiteboardFlip (3D Y-Axis Flip: Abundance Whiteboard -> Iron Debt)
// ============================================================================
export interface PaloAltoWhiteboardFlipProps extends SimulatorBaseProps {
  frontFormula?: string;
  frontSubtext?: string;
  backDebtLabel?: string;
  backMonthlyPayment?: string;
  flipFrameOffset?: number;
}

export const PaloAltoWhiteboardFlip: React.FC<PaloAltoWhiteboardFlipProps> = ({
  frontFormula = "FALLING PRICES = ABUNDANCE",
  frontSubtext = "Palo Alto Seminar Thesis: Marginal Cost -> $0.00 Lifts Real Purchasing Power",
  backDebtLabel = "30-YEAR FIXED MORTGAGE CONTRACT",
  backMonthlyPayment = "$3,400 / MO LOCKED",
  flipFrameOffset = 28,
  eyebrow = "DEFLATIONARY COLLISION",
  title = "Software Deflation Meets Unyielding Nominal Debt",
  subtitle = "Goods and wages can reprice toward zero overnight; a thirty-year fixed lien bolted to yesterday's price level never shrinks.",
  sourceCitation = "SOURCE: IRVING FISHER DEBT-DEFLATION IDENTITY (1933) · HOUSEHOLD BALANCE SHEET MODEL",
  summaryMetric = "$3,400 FIXED",
  summaryLabel = "NON-DEFLATING LIABILITY",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => {
  return (
    <SimulatorShell
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      sourceCitation={sourceCitation}
      summaryMetric={summaryMetric}
      summaryLabel={summaryLabel}
      mode={mode}
      paletteMode={paletteMode}
      register={register}
      atFrame={atFrame}
      renderGraphic={(theme, elapsed, fps) => {
        const flipProg = interpolate(
          studioSpring(elapsed, fps, "archivalSettle", flipFrameOffset),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const deg = flipProg * 180;
        const showBack = deg >= 90;

        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              minHeight: theme.isCompact ? "286px" : "340px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              perspective: "1800px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: theme.isCompact ? "98%" : "92%",
                height: theme.isCompact ? "270px" : "84%",
                minHeight: theme.isCompact ? "270px" : "300px",
                transformStyle: "preserve-3d",
                transform: `rotateY(${deg.toFixed(2)}deg)`,
              }}
            >
              {!showBack ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: PAGE_PALETTE.paperLight,
                    border: `${theme.isCompact ? "4px" : "8px"} solid ${PAGE_PALETTE.paperBorder}`,
                    borderRadius: "14px",
                    padding: theme.isCompact ? "22px 24px" : "40px 52px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 24px 48px rgba(28, 43, 58, 0.14)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: theme.isCompact ? "13px" : "14px",
                      fontWeight: 700,
                      color: PAGE_PALETTE.chartSecondary,
                      letterSpacing: "0.08em",
                    }}
                  >
                    SIDE A · SAND HILL ROAD WHITEBOARD
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: theme.isCompact ? "28px" : "54px",
                        fontWeight: 700,
                        lineHeight: 1.12,
                        color: PAGE_PALETTE.navy,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {frontFormula}
                    </div>
                    <div
                      style={{
                        marginTop: theme.isCompact ? "10px" : "14px",
                        fontFamily: FONTS.sans,
                        fontSize: theme.isCompact ? "16px" : "22px",
                        lineHeight: 1.35,
                        color: PAGE_PALETTE.muted,
                      }}
                    >
                      {frontSubtext}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div style={{ width: theme.isCompact ? "48px" : "88px", height: "10px", borderRadius: "6px", backgroundColor: PAGE_PALETTE.chartSecondary }} />
                    <div style={{ width: theme.isCompact ? "48px" : "88px", height: "10px", borderRadius: "6px", backgroundColor: PAGE_PALETTE.brickRed }} />
                    <span style={{ fontFamily: FONTS.mono, fontSize: theme.isCompact ? "12px" : "13px", color: PAGE_PALETTE.muted }}>
                      ASSUMES ZERO NOMINAL LIABILITIES
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: "rotateY(180deg)",
                    backgroundColor: PAGE_PALETTE.navyDeep,
                    border: `4px solid ${PAGE_PALETTE.brickRed}`,
                    borderRadius: "14px",
                    padding: theme.isCompact ? "22px 24px" : "40px 52px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 28px 56px rgba(15, 25, 35, 0.45)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: FONTS.mono,
                      fontSize: theme.isCompact ? "12px" : "14px",
                      fontWeight: 700,
                      color: OVER_FOOTAGE_PALETTE.brickRedText,
                    }}
                  >
                    <span>SIDE B · CAST-IRON LIEN</span>
                    <span>RIVETED PRINCIPAL</span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: theme.isCompact ? "14px" : "20px",
                        fontWeight: 700,
                        color: OVER_FOOTAGE_PALETTE.accentPrimary,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {backDebtLabel}
                    </div>
                    <div
                      style={{
                        ...TABULAR_NUM_STYLE,
                        fontFamily: FONTS.mono,
                        fontSize: theme.isCompact ? "34px" : "68px",
                        fontWeight: 700,
                        color: OVER_FOOTAGE_PALETTE.textHeadline,
                        marginTop: "8px",
                      }}
                    >
                      {backMonthlyPayment}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: theme.isCompact ? "13px" : "15px",
                      color: OVER_FOOTAGE_PALETTE.textBody,
                      borderTop: "1px solid rgba(191,214,234,0.28)",
                      paddingTop: "12px",
                    }}
                  >
                    360 SCHEDULED PAYMENTS · ZERO DEFLATION INDEXATION
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
};

// ============================================================================
// 3. DualTaxPlumbingSchematic (Brass & Steel Mechanical Tax Manifold)
// ============================================================================
export interface DualTaxPlumbingSchematicProps extends SimulatorBaseProps {
  w2GrossLabel?: string;
  w2SkimLabel?: string;
  bypassRoutes?: readonly [string, string, string];
}

export const DualTaxPlumbingSchematic: React.FC<DualTaxPlumbingSchematicProps> = ({
  w2GrossLabel = "W-2 PAYROLL PIPE · 84% OF FEDERAL RECEIPTS",
  w2SkimLabel = "AUTOMATIC WITHHOLDING GUILLOTINE (-28.4%)",
  bypassRoutes = [
    "100% CAPEX WRITE-OFF",
    "IRELAND IP ROUTING",
    "0%-TAX STOCK MARGIN LOANS",
  ],
  eyebrow = "FISCAL PLUMBING CROSS-SECTION",
  title = "Why Payroll Carries the State While Capital Bypasses the Meter",
  subtitle = "Human wages are intercepted upstream before hitting a checking account; capital and compute route through three statutory bypass valves.",
  sourceCitation = "SOURCE: U.S. TREASURY MONTHLY STATEMENT · CBO REVENUE BY SOURCE",
  summaryMetric = "84% vs 7%",
  summaryLabel = "PAYROLL vs CORP SHARE",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed, fps) => {
      const bladeDrop = interpolate(
        Math.sin(elapsed * 0.16),
        [-1, 1],
        [0, 32],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const flowShift = (elapsed * 4.2) % 48;
      const wheelDeg = (elapsed * 2.6) % 360;
      const needleOsc = Math.sin(elapsed * 0.12) * 14;
      const enter = studioSpring(elapsed, fps, "editorialSnap", 4);

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348" opacity={enter}>
            {/* Top W-2 Guillotine Channel */}
            <rect x="8" y="8" width="548" height="122" rx="10" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="1.8" />
            <FittedSvgText text="W-2 PAYROLL · 84% SHARE" x={22} y={32} maxWidth={290} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} />
            <FittedSvgText text="-28.4% INTERCEPT" x={542} y={32} maxWidth={200} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} textAnchor="end" style={TABULAR_NUM_STYLE} />

            {/* Pipe & Guillotine Shear */}
            <rect x="22" y="54" width="218" height="36" rx="5" fill={PAGE_PALETTE.navy} />
            <line x1="32" y1="72" x2="232" y2="72" stroke={OVER_FOOTAGE_PALETTE.accentPrimary} strokeWidth="4" strokeDasharray="12 12" strokeDashoffset={-flowShift} />
            {/* Guillotine Housing */}
            <rect x="242" y="42" width="44" height="62" rx="4" fill="#354656" stroke={theme.inkHeadline} strokeWidth="1.8" />
            <g transform={`translate(248, ${(44 + bladeDrop * 0.45).toFixed(1)})`}>
              <rect width="32" height="22" fill={PAGE_PALETTE.brickRed} />
              <polygon points="0,22 32,22 32,34 0,25" fill="#E27358" />
            </g>
            {/* Downspout to IRS */}
            <rect x="254" y="102" width="20" height="22" fill={PAGE_PALETTE.brickRed} />
            <rect x="290" y="60" width="252" height="24" rx="4" fill={theme.accentSlate} />
            <FittedSvgText text="NET DEPOSIT (71.6%)" x={416} y={76} maxWidth={230} fontSize={13} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} textAnchor="middle" />
            <FittedSvgText text="IRS TREASURY VAULT" x={264} y={120} maxWidth={230} fontSize={12.5} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} textAnchor="middle" />

            {/* Bottom 3-Valve Bypass Manifold */}
            <rect x="8" y="142" width="548" height="148" rx="10" fill={theme.wellBg} stroke={theme.accentTeal} strokeWidth="1.8" />
            <FittedSvgText text="CAPITAL & COMPUTE BYPASS VALVES" x={22} y={166} maxWidth={350} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentTeal} />
            <FittedSvgText text="0.0% TAX" x={542} y={166} maxWidth={140} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentTeal} textAnchor="end" style={TABULAR_NUM_STYLE} />

            {bypassRoutes.map((route, idx) => {
              const vy = 180 + idx * 35;
              return (
                <g key={`c-valve-${idx}`} transform={`translate(22, ${vy})`}>
                  <line x1="0" y1="14" x2="520" y2="14" stroke={theme.accentTeal} strokeWidth="4" opacity={0.45} />
                  <circle cx="22" cy="14" r="12" fill={PAGE_PALETTE.navy} stroke="#C5A367" strokeWidth="2" />
                  <g transform={`translate(22, 14) rotate(${(wheelDeg + idx * 45).toFixed(1)})`}>
                    <line x1="-8" y1="0" x2="8" y2="0" stroke="#F7C35C" strokeWidth="2" />
                    <line x1="0" y1="-8" x2="0" y2="8" stroke="#F7C35C" strokeWidth="2" />
                  </g>
                  <rect x="44" y="0" width="476" height="28" rx="6" fill={theme.panelBg} stroke={theme.accentTeal} strokeWidth="1.4" />
                  <FittedSvgText
                    text={`V0${idx + 1} · ${route}`}
                    x={58}
                    y={19}
                    maxWidth={448}
                    fontSize={14}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={theme.inkHeadline}
                  />
                </g>
              );
            })}

            {/* Bottom Effective Rate Meter Bar */}
            <rect x="8" y="300" width="548" height="40" rx="8" fill={theme.solidPanelBg} stroke={theme.navyInk} strokeWidth="1.6" />
            <rect x="14" y="306" width="380" height="28" rx="5" fill={PAGE_PALETTE.brickRed} />
            <FittedSvgText text="W-2 SHEAR: -28.4%" x={26} y={325} maxWidth={240} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE} />
            <FittedSvgText text="EQUITY: 0.0%" x={542} y={325} maxWidth={148} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.chartSecondary} textAnchor="end" style={TABULAR_NUM_STYLE} />
          </svg>
        );
      }

      const brassStroke = "#B08D57";
      const pipeSteel = "#24374A";
      const pipeHighlight = "#3E5A74";

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620" opacity={enter}>
          {/* =============================================================== */}
          {/* TOP CHANNEL: RIVETED W-2 PAYROLL PIPE & GUILLOTINE SHEAR        */}
          {/* =============================================================== */}
          {/* Clean non-overlapping top label bar */}
          <FittedSvgText
            text={w2GrossLabel}
            x={48}
            y={32}
            maxWidth={560}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
          <rect x="816" y="10" width="440" height="32" rx="6" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="1.6" />
          <FittedSvgText
            text={w2SkimLabel}
            x={1036}
            y={31}
            maxWidth={416}
            fontSize={13.5}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />

          {/* Main Riveted W-2 Pressure Pipe */}
          <rect x="48" y="88" width="584" height="72" rx="8" fill={pipeSteel} stroke={theme.navyInk} strokeWidth="2.2" />
          <rect x="48" y="96" width="584" height="10" fill={pipeHighlight} opacity={0.45} />
          {/* Pipe Flange Collars & Rivets */}
          {[140, 340, 540].map((fx) => (
            <g key={`fl-${fx}`}>
              <rect x={fx - 8} y="80" width="16" height="88" rx="3" fill={brassStroke} stroke={PAGE_PALETTE.navyDeep} strokeWidth="1.5" />
              <circle cx={fx} cy="92" r="3" fill={PAGE_PALETTE.navyDeep} />
              <circle cx={fx} cy="156" r="3" fill={PAGE_PALETTE.navyDeep} />
            </g>
          ))}
          {/* Animated Dollar Flow Pulses Inside W-2 Pipe */}
          <line
            x1="72"
            y1="124"
            x2="618"
            y2="124"
            stroke={OVER_FOOTAGE_PALETTE.accentPrimary}
            strokeWidth="6"
            strokeDasharray="20 28"
            strokeDashoffset={-flowShift}
          />
          {[0, 1, 2, 3, 4].map((pIdx) => {
            const px = 86 + ((elapsed * 3.8 + pIdx * 110) % 520);
            return (
              <g key={`wpulse-${pIdx}`} transform={`translate(${px.toFixed(1)}, 124)`}>
                <circle r="11" fill={PAGE_PALETTE.chartSecondary} stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontFamily={FONTS.mono} fontSize="11" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
                  $
                </text>
              </g>
            );
          })}

          {/* Guided Vertical Steel Guillotine Shear Frame */}
          <rect x="634" y="44" width="114" height="134" rx="6" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2.5" />
          {/* Vertical Guide Rails */}
          <rect x="642" y="52" width="12" height="118" fill={pipeSteel} />
          <rect x="728" y="52" width="12" height="118" fill={pipeSteel} />
          {/* Steel Crosshead Cap */}
          <rect x="630" y="38" width="122" height="16" rx="4" fill={brassStroke} stroke={PAGE_PALETTE.navyDeep} strokeWidth="1.8" />
          {/* Reciprocating Honed Guillotine Blade */}
          <g transform={`translate(656, ${(58 + bladeDrop).toFixed(1)})`}>
            <rect x="0" y="0" width="70" height="44" rx="3" fill={PAGE_PALETTE.brickRed} stroke={PAGE_PALETTE.navyDeep} strokeWidth="2" />
            <polygon points="0,44 70,44 70,70 0,52" fill="#D46550" stroke={PAGE_PALETTE.navyDeep} strokeWidth="1.8" />
            <text x="35" y="28" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
              -28.4%
            </text>
          </g>

          {/* Intercept Downspout -> Itemized IRS Treasury Vault Tank */}
          <rect x="664" y="178" width="54" height="44" fill={PAGE_PALETTE.brickRed} stroke={theme.navyInk} strokeWidth="2" />
          <line x1="691" y1="184" x2="691" y2="218" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="4" strokeDasharray="8 10" strokeDashoffset={-flowShift * 0.7} />
          <path d="M 691 222 L 691 236 L 788 236" fill="none" stroke={PAGE_PALETTE.brickRed} strokeWidth="18" strokeLinejoin="round" />
          <path d="M 691 222 L 691 236 L 788 236" fill="none" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="3.5" strokeDasharray="10 14" strokeDashoffset={-flowShift} />

          {/* Itemized IRS Treasury Vault Tank with Live Analog Gauge */}
          <g transform="translate(788, 194)">
            <rect width="388" height="78" rx="10" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="2.4" />
            <rect x="10" y="10" width="84" height="58" rx="6" fill={PAGE_PALETTE.navyDeep} stroke={brassStroke} strokeWidth="1.6" />
            {/* Live Analog Pressure Dial */}
            <circle cx="52" cy="39" r="22" fill="#FAF8F3" stroke={brassStroke} strokeWidth="2.5" />
            <path d="M 36 44 A 18 18 0 0 1 68 44" fill="none" stroke={PAGE_PALETTE.brickRed} strokeWidth="3" />
            <line
              x1="52"
              y1="42"
              x2={(52 + Math.cos(((225 + needleOsc) * Math.PI) / 180) * 15).toFixed(1)}
              y2={(42 + Math.sin(((225 + needleOsc) * Math.PI) / 180) * 15).toFixed(1)}
              stroke={PAGE_PALETTE.brickRed}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="52" cy="42" r="3" fill={PAGE_PALETTE.navyDeep} />
            <FittedSvgText
              text="IRS TREASURY VAULT"
              x={110}
              y={34}
              maxWidth={264}
              fontSize={14}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.accentAlert}
            />
            <FittedSvgText
              text="84% RECEIPTS · UPSTREAM SKIM"
              x={110}
              y={58}
              maxWidth={264}
              fontSize={13}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.inkHeadline}
              style={TABULAR_NUM_STYLE}
            />
          </g>

          {/* Narrowed Post-Guillotine Worker Pipe -> Net Deposit */}
          <rect x="748" y="106" width="444" height="36" rx="5" fill={theme.accentSlate} stroke={theme.navyInk} strokeWidth="1.8" />
          <line x1="760" y1="124" x2="1182" y2="124" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="3.5" strokeDasharray="14 18" strokeDashoffset={-flowShift} />
          <rect x="1192" y="88" width="320" height="72" rx="10" fill={PAGE_PALETTE.navy} stroke={theme.accentSlate} strokeWidth="2.4" />
          <FittedSvgText
            text="NET CHECKING DEPOSIT"
            x={1352}
            y={118}
            maxWidth={288}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
          />
          <FittedSvgText
            text="71.6% POST-WITHHOLDING"
            x={1352}
            y={142}
            maxWidth={288}
            fontSize={12.5}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.accentPrimary}
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />

          {/* Horizontal Hairline Divider */}
          <line x1="48" y1="286" x2="1512" y2="286" stroke={theme.panelBorder} strokeWidth="2" strokeDasharray="8 8" />

          {/* =============================================================== */}
          {/* BOTTOM CHANNEL: 3 ROTARY BRASS/TEAL MECHANICAL BYPASS VALVES    */}
          {/* =============================================================== */}
          <FittedSvgText
            text="AUTONOMOUS COMPUTE & EQUITY MANIFOLD · THREE STATUTORY BYPASS VALVES"
            x={48}
            y={316}
            maxWidth={1100}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentTeal}
          />

          {/* Gross Operating Cash Intake Manifold */}
          <rect x="48" y="366" width="248" height="114" rx="10" fill={PAGE_PALETTE.chartSecondary} stroke={theme.navyInk} strokeWidth="2.4" />
          <rect x="290" y="378" width="14" height="90" rx="3" fill={brassStroke} stroke={PAGE_PALETTE.navyDeep} strokeWidth="1.5" />
          <WrappedSvgText
            text="GROSS OPERATING CASH"
            x={172}
            y={414}
            maxWidth={210}
            fontSize={17}
            maxLines={2}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
            verticalCenter
          />
          <FittedSvgText
            text="100% UNTAXED INFLOW"
            x={172}
            y={458}
            maxWidth={216}
            fontSize={12}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textBody}
            textAnchor="middle"
          />

          {/* Three Smooth Cubic-Bezier Conduit Loops + Animated Rotary Valves */}
          {bypassRoutes.map((route, idx) => {
            const cy = 352 + idx * 72;
            const particleX = 594 + ((elapsed * 3.4 + idx * 96) % 440);
            const needleAng = 210 + Math.sin(elapsed * 0.1 + idx * 1.4) * 24;
            return (
              <g key={`byp-${idx}`}>
                <path
                  d={`M 304 424 C 378 424, 378 ${cy}, 456 ${cy} L 1094 ${cy} C 1146 ${cy}, 1146 424, 1196 424`}
                  fill="none"
                  stroke={PAGE_PALETTE.chartSecondary}
                  strokeWidth="14"
                />
                <path
                  d={`M 304 424 C 378 424, 378 ${cy}, 456 ${cy} L 1094 ${cy} C 1146 ${cy}, 1146 424, 1196 424`}
                  fill="none"
                  stroke={OVER_FOOTAGE_PALETTE.textHeadline}
                  strokeWidth="3"
                  strokeDasharray="12 18"
                  strokeDashoffset={-flowShift}
                  opacity={0.7}
                />

                {/* Animated Bypass Particle */}
                <circle cx={particleX} cy={cy} r="6.5" fill="#F7C35C" stroke={PAGE_PALETTE.navyDeep} strokeWidth="1.5" />

                {/* Rotary Brass/Teal Valve Housing + Spinning 6-Spoke Handwheel */}
                <g transform={`translate(492, ${cy})`}>
                  <rect x="-28" y="-22" width="56" height="44" rx="6" fill={pipeSteel} stroke={brassStroke} strokeWidth="2.2" />
                  <circle r="21" fill={PAGE_PALETTE.navyDeep} stroke={brassStroke} strokeWidth="2.6" />
                  <g transform={`rotate(${(wheelDeg + idx * 40).toFixed(1)})`}>
                    <line x1="-15" y1="0" x2="15" y2="0" stroke="#F7C35C" strokeWidth="2.5" />
                    <line x1="-7.5" y1="-13" x2="7.5" y2="13" stroke="#F7C35C" strokeWidth="2.5" />
                    <line x1="-7.5" y1="13" x2="7.5" y2="-13" stroke="#F7C35C" strokeWidth="2.5" />
                  </g>
                  <circle r="5" fill={brassStroke} />
                </g>

                {/* Brass-Trimmed Valve Specification Plaque */}
                <rect x="540" y={cy - 24} width="470" height="48" rx="7" fill={theme.wellBg} stroke={brassStroke} strokeWidth="2" />
                <FittedSvgText
                  text={`VALVE 0${idx + 1} · ${route}`}
                  x={560}
                  y={cy + 5}
                  maxWidth={378}
                  fontSize={14.5}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.inkHeadline}
                />

                {/* Mini Analog Bypass Gauge */}
                <g transform={`translate(1038, ${cy})`}>
                  <circle r="17" fill="#FAF8F3" stroke={brassStroke} strokeWidth="2.2" />
                  <path d="M -11 4 A 12 12 0 0 1 11 4" fill="none" stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2.5" />
                  <line
                    x1="0"
                    y1="2"
                    x2={(Math.cos((needleAng * Math.PI) / 180) * 11).toFixed(1)}
                    y2={(Math.sin((needleAng * Math.PI) / 180) * 11).toFixed(1)}
                    stroke={PAGE_PALETTE.navyDeep}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle r="2.5" fill={PAGE_PALETTE.navyDeep} />
                </g>
              </g>
            );
          })}

          {/* Compounding Equity Accumulator Tank */}
          <g transform="translate(1196, 336)">
            <rect width="316" height="174" rx="12" fill={PAGE_PALETTE.navyDeep} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="3" />
            {/* Fluid Sight-Glass Bar on Right Edge */}
            <rect x="282" y="18" width="18" height="138" rx="4" fill="#162E47" stroke={brassStroke} strokeWidth="1.4" />
            <rect x="284" y="42" width="14" height="112" rx="3" fill={PAGE_PALETTE.chartSecondary} />
            <FittedSvgText
              text="COMPOUNDING EQUITY"
              x={144}
              y={58}
              maxWidth={248}
              fontSize={16}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.textHeadline}
              textAnchor="middle"
            />
            <FittedSvgText
              text="0.0% REALIZED"
              x={144}
              y={104}
              maxWidth={248}
              fontSize={24}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.chartSecondary}
              textAnchor="middle"
              style={TABULAR_NUM_STYLE}
            />
            <FittedSvgText
              text="STATUTORY TAX EVENT"
              x={144}
              y={132}
              maxWidth={248}
              fontSize={13}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.accentPrimary}
              textAnchor="middle"
            />
          </g>

          {/* =============================================================== */}
          {/* BOTTOM COMPARATIVE EFFECTIVE-RATE METER BAR                     */}
          {/* =============================================================== */}
          <rect x="48" y="556" width="1464" height="48" rx="8" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="1.8" />
          <FittedSvgText
            text="EFFECTIVE WITHHOLDING RATE:"
            x={68}
            y={585}
            maxWidth={240}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkMuted}
          />
          <rect x="316" y="566" width="480" height="28" rx="5" fill={PAGE_PALETTE.brickRed} />
          <FittedSvgText
            text="W-2 PAYROLL: 28.4% AUTOMATIC SHEAR"
            x={556}
            y={585}
            maxWidth={450}
            fontSize={13.5}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />
          <rect x="820" y="566" width="674" height="28" rx="5" fill={PAGE_PALETTE.navy} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="1.6" />
          <rect x="822" y="568" width="18" height="24" rx="3" fill={PAGE_PALETTE.chartSecondary} />
          <FittedSvgText
            text="CAPITAL & COMPUTE BYPASS: 0.0% REALIZED TAX EVENT"
            x={1157}
            y={585}
            maxWidth={630}
            fontSize={13.5}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.chartSecondary}
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 4. SovereignPrioritySpillway (3-Tier Dam: Bondholders -> Statutory -> Citizen)
// ============================================================================
export interface SovereignPrioritySpillwayProps extends SimulatorBaseProps {
  tier1Label?: string;
  tier1Amount?: string;
  tier2Label?: string;
  tier2Amount?: string;
  tier3Label?: string;
}

export const SovereignPrioritySpillway: React.FC<SovereignPrioritySpillwayProps> = ({
  tier1Label = "SPILLWAY 01 · SOVEREIGN BONDHOLDERS (NET INTEREST)",
  tier1Amount = "$2.1T / YR FIRST LIEN",
  tier2Label = "SPILLWAY 02 · DEFENSE, SOCIAL SECURITY & MEDICARE",
  tier2Amount = "$4.6T STATUTORY LOCK",
  tier3Label = "BASIN 03 · UNIVERSAL CITIZEN DIVIDEND TROUGH (DRY)",
  eyebrow = "SOVEREIGN CASH-FLOW WATERFALL",
  title = "Three-Tier Fiscal Dam: Who Gets Paid Before a Universal Check",
  subtitle = "Bond coupons and existing statutory entitlements drain the federal reservoir at the top two spillways, leaving the citizen basin dry.",
  sourceCitation = "SOURCE: CONGRESSIONAL BUDGET OFFICE LONG-TERM BUDGET OUTLOOK (2026–2036)",
  summaryMetric = "$2.1T INTEREST",
  summaryLabel = "SENIOR CREDITOR GATE",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const streamDash = (elapsed * 3.5) % 36;

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            {[
              { label: tier1Label, amt: `${tier1Amount} · SENIOR LIEN`, col: theme.accentAlert, bg: theme.riskBg, border: theme.riskBorder, dry: false },
              { label: tier2Label, amt: `${tier2Amount} · MANDATORY`, col: theme.accentTeal, bg: theme.wellBg, border: theme.accentTeal, dry: false },
              { label: tier3Label, amt: "$0.00 SURPLUS WITHOUT MONETIZATION", col: theme.accentAlert, bg: theme.wellBg, border: theme.panelBorder, dry: true },
            ].map((tier, idx) => {
              const y = 12 + idx * 112;
              return (
                <g key={`c-sp-${idx}`} transform={`translate(8, ${y})`}>
                  <rect
                    width="548"
                    height="98"
                    rx="10"
                    fill={tier.bg}
                    stroke={tier.border}
                    strokeWidth="2"
                    strokeDasharray={tier.dry ? "6 5" : undefined}
                  />
                  <FittedSvgText text={tier.label} x={20} y={36} maxWidth={508} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={tier.dry ? theme.inkMuted : tier.col} />
                  <FittedSvgText text={tier.amt} x={20} y={74} maxWidth={508} fontSize={19} fontFamily={FONTS.mono} fontWeight={700} fill={tier.dry ? theme.accentAlert : theme.inkHeadline} style={TABULAR_NUM_STYLE} />
                </g>
              );
            })}
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Upstream Reservoir */}
          <rect x="56" y="88" width="330" height="460" rx="12" fill={PAGE_PALETTE.navy} />
          <rect x="74" y="168" width="294" height="364" rx="8" fill={PAGE_PALETTE.gold} opacity={0.85} />
          <FittedSvgText
            text="DEPLETING TAX RESERVOIR"
            x={221}
            y={136}
            maxWidth={290}
            fontSize={14}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
          />

          {/* Concrete Stepped Dam Wall */}
          <polygon points="386,74 470,74 548,548 386,548" fill={PAGE_PALETTE.paperBorder} stroke={PAGE_PALETTE.navy} strokeWidth="3" />

          {/* Tier 1 Senior Bondholder Spillway */}
          <path d="M 386 156 L 720 156" stroke={PAGE_PALETTE.brickRed} strokeWidth="34" />
          <path d="M 386 156 L 720 156" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="6" strokeDasharray="16 20" strokeDashoffset={-streamDash} />
          <rect x="720" y="106" width="776" height="104" rx="10" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="2.5" />
          <FittedSvgText text={tier1Label} x={752} y={148} maxWidth={716} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} />
          <FittedSvgText
            text={`${tier1Amount} · DEFAULT = TREASURY MARKET FREEZE`}
            x={752}
            y={186}
            maxWidth={716}
            fontSize={26}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
            style={TABULAR_NUM_STYLE}
          />

          {/* Tier 2 Statutory Penstock */}
          <path d="M 426 318 L 720 318" stroke={PAGE_PALETTE.chartSecondary} strokeWidth="28" />
          <path d="M 426 318 L 720 318" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="5" strokeDasharray="14 22" strokeDashoffset={-streamDash} />
          <rect x="720" y="268" width="776" height="104" rx="10" fill={theme.wellBg} stroke={theme.accentTeal} strokeWidth="2" />
          <FittedSvgText text={tier2Label} x={752} y={310} maxWidth={716} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentTeal} />
          <FittedSvgText
            text={`${tier2Amount} · MANDATORY OUTLAYS`}
            x={752}
            y={348}
            maxWidth={716}
            fontSize={26}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
            style={TABULAR_NUM_STYLE}
          />

          {/* Tier 3 Starved Citizen Trough */}
          <line x1="478" y1="484" x2="720" y2="484" stroke={theme.inkMuted} strokeWidth="4" strokeDasharray="6 10" />
          <rect x="720" y="432" width="776" height="108" rx="10" fill={theme.wellBg} stroke={theme.inkMuted} strokeWidth="2" strokeDasharray="8 6" />
          <FittedSvgText text={tier3Label} x={752} y={476} maxWidth={716} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkMuted} />
          <FittedSvgText
            text="RESIDUAL FLOW: $0.00 SURPLUS WITHOUT MONETIZATION"
            x={752}
            y={514}
            maxWidth={716}
            fontSize={23}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
            style={TABULAR_NUM_STYLE}
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 5. SplitEraStrikeDiptych (1955 Frozen Pier vs 2034 99.9%-Uptime Robotic Port)
// ============================================================================
export interface SplitEraStrikeDiptychProps extends SimulatorBaseProps {
  leftEra?: string;
  rightEra?: string;
}

export const SplitEraStrikeDiptych: React.FC<SplitEraStrikeDiptychProps> = ({
  leftEra = "1955 · ROTTERDAM / DETROIT WALKOUT",
  rightEra = "2034 · AUTONOMOUS PORT + CAPITOL MARCH",
  eyebrow = "BARGAINING LEVERAGE DECAY",
  title = "When Walking Off the Pier No Longer Stops the Crane",
  subtitle = "Twentieth-century social contracts rested on labor's power to halt owner cash flow in forty-eight hours; lights-out robotics sever that lever.",
  sourceCitation = "SOURCE: MARITIME AUTOMATION TELEMETRY & INDUSTRIAL LABOR HISTORY",
  summaryMetric = "99.9% UPTIME",
  summaryLabel = "2034 ROBOTIC THROUGHPUT",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const trolleyX = 960 + Math.sin(elapsed * 0.08) * 140;

      if (theme.isCompact) {
        const miniTrolley = 340 + Math.sin(elapsed * 0.08) * 48;
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="8" width="264" height="332" rx="12" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
            <FittedSvgText text="1955 · WALKOUT" x={24} y={36} maxWidth={232} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} />
            <path d="M 48 184 L 70 84 L 210 84 M 90 184 L 70 84" fill="none" stroke={theme.navyInk} strokeWidth="5" />
            <rect x="132" y="96" width="74" height="34" rx="4" fill={PAGE_PALETTE.brickRed} />
            <FittedSvgText text="HALTED" x={169} y={118} maxWidth={66} fontSize={13} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} textAnchor="middle" />
            <rect x="20" y="216" width="240" height="108" rx="8" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="1.6" />
            <FittedSvgText text="-$1.4M / DAY BLEED" x={34} y={248} maxWidth={212} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} />
            <WrappedSvgText text="Worker leverage: CRITICAL (0% output)." x={34} y={286} maxWidth={212} fontSize={15} maxLines={2} fontFamily={FONTS.sans} fontWeight={700} fill={theme.inkHeadline} verticalCenter />

            <rect x="292" y="8" width="264" height="332" rx="12" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2" />
            <FittedSvgText text="2034 · ROBOTIC PORT" x={308} y={36} maxWidth={232} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentTeal} />
            <path d="M 320 184 L 320 84 L 528 84 L 528 184" fill="none" stroke={OVER_FOOTAGE_PALETTE.accentPrimary} strokeWidth="5" />
            <rect x={miniTrolley} y="96" width="84" height="34" rx="4" fill={PAGE_PALETTE.chartSecondary} />
            <FittedSvgText text="AGV 99.9%" x={miniTrolley + 42} y={118} maxWidth={76} fontSize={12.5} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} textAnchor="middle" />
            <rect x="304" y="216" width="240" height="108" rx="8" fill="rgba(28, 43, 58, 0.9)" stroke={OVER_FOOTAGE_PALETTE.glassBorder} strokeWidth="1.4" />
            <FittedSvgText text="CASH FLOW: 24/7" x={318} y={248} maxWidth={212} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.chartSecondary} />
            <WrappedSvgText text="Shutdown leverage: 0.0%." x={318} y={286} maxWidth={212} fontSize={15} maxLines={2} fontFamily={FONTS.sans} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} verticalCenter />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left Panel: 1955 Frozen Pier */}
          <rect x="40" y="44" width="716" height="532" rx="14" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2.5" />
          <FittedSvgText
            text={leftEra}
            x={76}
            y={92}
            maxWidth={644}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
          {/* Frozen Gantry Crane */}
          <path d="M 140 420 L 180 180 L 520 180 M 220 420 L 180 180" fill="none" stroke={theme.navyInk} strokeWidth="8" />
          <rect x="330" y="210" width="96" height="58" fill={PAGE_PALETTE.brickRed} />
          <FittedSvgText
            text="HALTED"
            x={378}
            y={244}
            maxWidth={84}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
          />
          <rect x="76" y="438" width="644" height="108" rx="8" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="2" />
          <FittedSvgText
            text="OWNER REVENUE BLEED: -$1.4M / DAY"
            x={104}
            y={474}
            maxWidth={588}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
          />
          <WrappedSvgText
            text="Worker Leverage: CRITICAL (Production = 0% Without Labor)"
            x={104}
            y={512}
            maxWidth={588}
            fontSize={18}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.inkHeadline}
            verticalCenter
          />

          {/* Right Panel: 2034 Robotic Port */}
          <rect x="804" y="44" width="716" height="532" rx="14" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2.5" />
          <FittedSvgText
            text={rightEra}
            x={840}
            y={92}
            maxWidth={644}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.chartSecondary}
          />
          {/* Moving Robotic Gantry */}
          <path d="M 880 420 L 880 176 L 1440 176 L 1440 420" fill="none" stroke={OVER_FOOTAGE_PALETTE.accentPrimary} strokeWidth="7" />
          <rect x={trolleyX} y="190" width="110" height="54" rx="4" fill={PAGE_PALETTE.chartSecondary} />
          <FittedSvgText
            text="AGV · 99.9%"
            x={trolleyX + 55}
            y={223}
            maxWidth={96}
            fontSize={12}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
          />
          <rect x="840" y="438" width="644" height="108" rx="8" fill="rgba(28, 43, 58, 0.9)" stroke={OVER_FOOTAGE_PALETTE.glassBorder} strokeWidth="1.5" />
          <FittedSvgText
            text="OWNER CASH FLOW: UNINTERRUPTED (24/7 LIGHTS-OUT)"
            x={868}
            y={474}
            maxWidth={588}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.chartSecondary}
          />
          <WrappedSvgText
            text="Protest Shifted to Capitol Steps · Economic Shutdown Leverage: 0.0%"
            x={868}
            y={512}
            maxWidth={588}
            fontSize={18}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            verticalCenter
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 6. LogarithmicWattageLadder (10W Charger -> 1kW Microwave -> 1GW -> 5GW AI)
// ============================================================================
export interface WattageRungSpec {
  wattage: string;
  exponent: string;
  objectLabel: string;
  equivalence: string;
  barWidth: number;
  tone: "slate" | "teal" | "navy" | "brick";
}

export interface LogarithmicWattageLadderProps extends SimulatorBaseProps {
  rungs?: readonly WattageRungSpec[];
}

export const LogarithmicWattageLadder: React.FC<LogarithmicWattageLadderProps> = ({
  rungs = [
    { wattage: "10 W", exponent: "10^1 W", objectLabel: "USB-C Phone Brick", equivalence: "1 Pocket Device", barWidth: 120, tone: "slate" },
    { wattage: "1 kW", exponent: "10^3 W", objectLabel: "Kitchen Microwave", equivalence: "100x Phone Chargers", barWidth: 320, tone: "teal" },
    { wattage: "1 GW", exponent: "10^9 W", objectLabel: "1 Nuclear Reactor Unit", equivalence: "1,000,000 Microwaves · 1 Major City", barWidth: 680, tone: "navy" },
    { wattage: "5 GW", exponent: "5×10^9 W", objectLabel: "Single Frontier AI Campus", equivalence: "5 Major Cities Continuous 24/7 Baseload", barWidth: 980, tone: "brick" },
  ],
  eyebrow = "LOGARITHMIC POWER SCALE",
  title = "Eight Orders of Magnitude Between a Charger and an AI Cluster",
  subtitle = "Human intuition breaks across million-fold jumps: one frontier training campus draws the continuous firm electricity of five metropolitan grids.",
  sourceCitation = "SOURCE: DOE / EPRI DATA-CENTER LOAD PROJECTIONS & NUCLEAR NRC RATED CAPACITY",
  summaryMetric = "5.0 GW = 5 CITIES",
  summaryLabel = "CAMPUS BASELOAD DRAW",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed, fps) => {
      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            {rungs.slice(0, 4).map((r, idx) => {
              const prog = interpolate(
                studioSpring(elapsed, fps, "editorialSnap", idx * 6),
                [0, 1],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const y = 10 + idx * 84;
              const fill =
                r.tone === "brick"
                  ? PAGE_PALETTE.brickRed
                  : r.tone === "navy"
                  ? PAGE_PALETTE.navy
                  : r.tone === "teal"
                  ? PAGE_PALETTE.chartSecondary
                  : PAGE_PALETTE.gold;
              const barW = Math.round((r.barWidth / 980) * 392 * prog);
              return (
                <g key={`c-watt-${idx}`} transform={`translate(8, ${y})`} opacity={prog}>
                  <rect width="120" height="72" rx="8" fill={theme.wellBg} stroke={fill} strokeWidth="2" />
                  <FittedSvgText text={r.wattage} x={60} y={34} maxWidth={104} fontSize={20} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} textAnchor="middle" style={TABULAR_NUM_STYLE} />
                  <FittedSvgText text={r.exponent} x={60} y={56} maxWidth={104} fontSize={12.5} fontFamily={FONTS.mono} fontWeight={600} fill={theme.inkMuted} textAnchor="middle" style={TABULAR_NUM_STYLE} />

                  <rect x="132" y="0" width="416" height="72" rx="8" fill={theme.wellBg} stroke={theme.panelBorder} strokeWidth="1.4" />
                  <rect x="132" y="0" width={Math.max(12, barW)} height="72" rx="8" fill={fill} opacity={0.28} />
                  <rect x="132" y="0" width={Math.max(10, barW)} height="8" rx="4" fill={fill} />
                  <FittedSvgText text={r.objectLabel} x={148} y={34} maxWidth={384} fontSize={16} fontFamily={FONTS.sans} fontWeight={700} fill={theme.inkHeadline} />
                  <FittedSvgText text={r.equivalence} x={148} y={56} maxWidth={384} fontSize={13.5} fontFamily={FONTS.mono} fontWeight={600} fill={theme.inkMuted} />
                </g>
              );
            })}
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {rungs.map((r, idx) => {
            const prog = interpolate(
              studioSpring(elapsed, fps, "editorialSnap", idx * 7),
              [0, 1],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const y = 56 + idx * 134;
            const fill =
              r.tone === "brick"
                ? PAGE_PALETTE.brickRed
                : r.tone === "navy"
                ? PAGE_PALETTE.navy
                : r.tone === "teal"
                ? PAGE_PALETTE.chartSecondary
                : PAGE_PALETTE.gold;
            const activeBarW = Math.max(36, r.barWidth * 1.18 * prog);

            return (
              <g key={`watt-${idx}`} transform={`translate(56, ${y})`} opacity={prog}>
                <rect x="0" y="0" width="220" height="104" rx="10" fill={theme.wellBg} stroke={fill} strokeWidth="2.5" />
                <FittedSvgText
                  text={r.wattage}
                  x={110}
                  y={48}
                  maxWidth={196}
                  fontSize={30}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.inkHeadline}
                  textAnchor="middle"
                  style={TABULAR_NUM_STYLE}
                />
                <FittedSvgText
                  text={r.exponent}
                  x={110}
                  y={80}
                  maxWidth={196}
                  fontSize={13}
                  fontFamily={FONTS.mono}
                  fontWeight={600}
                  fill={theme.inkMuted}
                  textAnchor="middle"
                  style={TABULAR_NUM_STYLE}
                />

                {/* Full-width recessed track ensures high-contrast legibility for short & long bars alike */}
                <rect x="248" y="8" width="1200" height="88" rx="10" fill={theme.wellBg} stroke={theme.panelBorder} strokeWidth="1.6" />
                <rect x="248" y="8" width={Math.min(1200, activeBarW)} height="88" rx="10" fill={fill} opacity={0.22} />
                <rect x="248" y="8" width={Math.min(1200, activeBarW)} height="10" rx="5" fill={fill} />
                <FittedSvgText
                  text={r.objectLabel}
                  x={276}
                  y={48}
                  maxWidth={820}
                  fontSize={22}
                  fontFamily={FONTS.sans}
                  fontWeight={700}
                  fill={theme.inkHeadline}
                />
                <FittedSvgText
                  text={r.equivalence}
                  x={276}
                  y={76}
                  maxWidth={820}
                  fontSize={14.5}
                  fontFamily={FONTS.mono}
                  fontWeight={600}
                  fill={theme.inkMuted}
                />
                <FittedSvgText
                  text={`${r.wattage} RATED`}
                  x={1420}
                  y={58}
                  maxWidth={220}
                  fontSize={16}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={r.tone === "brick" ? theme.accentAlert : theme.inkHeadline}
                  textAnchor="end"
                  style={TABULAR_NUM_STYLE}
                />
              </g>
            );
          })}
        </svg>
      );
    }}
  />
);

// ============================================================================
// 7. VelocityMismatchChronometer (6-Mo Agent Cycle vs 5–10 Yr 765kV Permitting)
// ============================================================================
export interface VelocityMismatchChronometerProps extends SimulatorBaseProps {
  fastTrackLabel?: string;
  slowTrackLabel?: string;
  checkpoints?: readonly string[];
}

export const VelocityMismatchChronometer: React.FC<VelocityMismatchChronometerProps> = ({
  fastTrackLabel = "SOFTWARE CLOCK · 6-MONTH FRONTIER AGENT DOUBLING",
  slowTrackLabel = "COPPER & STEEL CLOCK · 5 TO 10 YEAR 765kV TRANSMISSION PERMITTING",
  checkpoints = [
    "YR 1–2 · INTERCONNECTION STUDY",
    "YR 3–5 · NEPA EIS & LITIGATION",
    "YR 6–8 · COUNTY EMINENT DOMAIN",
    "YR 9–10 · HV TRANSFORMER DELIVERY",
  ],
  eyebrow = "CLOCK-SPEED COLLISION",
  title = "Six-Month Model Releases Collide With Ten-Year High-Voltage Steel",
  subtitle = "Code ships twenty model generations in the time it takes to permit, litigate, and energize a single interstate 765-kilovolt line.",
  sourceCitation = "SOURCE: LBNL QUEUED UP REPORT & FERC TRANSMISSION SITING TIMELINES",
  summaryMetric = "6 MO vs 10 YR",
  summaryLabel = "20:1 CLOCK RATIO",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const fastAngle = elapsed * 9.5;
      const slowAngle = elapsed * 0.45;
      const slowProgress = Math.min(1, elapsed / 240);

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="8" width="548" height="156" rx="10" fill={theme.wellBg} stroke={theme.accentTeal} strokeWidth="1.8" />
            <g transform="translate(64, 86)">
              <circle r="36" fill="none" stroke={theme.accentTeal} strokeWidth="4" strokeDasharray="8 6" />
              <line
                x1="0"
                y1="0"
                x2={(Math.cos((fastAngle * Math.PI) / 180) * 28).toFixed(1)}
                y2={(Math.sin((fastAngle * Math.PI) / 180) * 28).toFixed(1)}
                stroke={theme.accentTeal}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle r="5" fill={theme.accentTeal} />
            </g>
            <FittedSvgText text={fastTrackLabel} x={118} y={40} maxWidth={424} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentTeal} />
            {[0, 1, 2].map((gen) => (
              <g key={`c-gen-${gen}`} transform={`translate(${118 + gen * 144}, 60)`}>
                <rect width="134" height="78" rx="7" fill={PAGE_PALETTE.navy} />
                <FittedSvgText text={`GEN ${gen + 1}.0`} x={67} y={36} maxWidth={118} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.chartSecondary} textAnchor="middle" />
                <FittedSvgText text={`+${gen * 6} MO`} x={67} y={60} maxWidth={118} fontSize={13} fontFamily={FONTS.mono} fontWeight={600} fill={OVER_FOOTAGE_PALETTE.textBody} textAnchor="middle" />
              </g>
            ))}

            <rect x="8" y="180" width="548" height="160" rx="10" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="1.8" />
            <g transform="translate(64, 260)">
              <circle r="36" fill="none" stroke={theme.accentAlert} strokeWidth="4" />
              <line
                x1="0"
                y1="0"
                x2={(Math.cos((slowAngle * Math.PI) / 180) * 26).toFixed(1)}
                y2={(Math.sin((slowAngle * Math.PI) / 180) * 26).toFixed(1)}
                stroke={theme.accentAlert}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle r="5" fill={theme.accentAlert} />
            </g>
            <FittedSvgText text={slowTrackLabel} x={118} y={212} maxWidth={424} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} />
            <rect x="118" y="226" width="424" height="12" rx="6" fill={theme.panelBorder} />
            <rect x="118" y="226" width={Math.max(18, 96 * slowProgress)} height="12" rx="6" fill={PAGE_PALETTE.brickRed} />
            {checkpoints.slice(0, 2).map((cp, idx) => (
              <g key={`c-cp-${idx}`} transform={`translate(${118 + idx * 216}, 252)`}>
                <rect width="208" height="72" rx="7" fill={idx === 0 ? theme.riskBg : theme.panelBg} stroke={theme.riskBorder} strokeWidth="1.5" />
                <FittedSvgText text={`GATE 0${idx + 1} · LOCKED`} x={104} y={26} maxWidth={188} fontSize={12.5} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} textAnchor="middle" />
                <WrappedSvgText text={cp} x={104} y={50} maxWidth={188} fontSize={13.5} maxLines={2} fontFamily={FONTS.sans} fontWeight={700} fill={theme.inkHeadline} textAnchor="middle" verticalCenter />
              </g>
            ))}
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Top High-RPM Software Track */}
          <rect x="56" y="54" width="1448" height="220" rx="14" fill={theme.wellBg} stroke={theme.accentTeal} strokeWidth="2.5" />
          <g transform="translate(170, 164)">
            <circle r="68" fill="none" stroke={PAGE_PALETTE.chartSecondary} strokeWidth="6" strokeDasharray="12 8" />
            <line
              x1="0"
              y1="0"
              x2={(Math.cos((fastAngle * Math.PI) / 180) * 54).toFixed(1)}
              y2={(Math.sin((fastAngle * Math.PI) / 180) * 54).toFixed(1)}
              stroke={PAGE_PALETTE.chartSecondary}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle r="8" fill={PAGE_PALETTE.chartSecondary} />
          </g>
          <FittedSvgText
            text={fastTrackLabel}
            x={284}
            y={110}
            maxWidth={1172}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentTeal}
          />
          {[0, 1, 2, 3, 4].map((gen) => (
            <g key={`gen-${gen}`} transform={`translate(${284 + gen * 232}, 138)`}>
              <rect width="212" height="92" rx="8" fill={PAGE_PALETTE.navy} />
              <FittedSvgText
                text={`GEN ${gen + 1}.0 SHIPPED`}
                x={106}
                y={42}
                maxWidth={188}
                fontSize={15}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={OVER_FOOTAGE_PALETTE.chartSecondary}
                textAnchor="middle"
              />
              <FittedSvgText
                text={`+${gen * 6} MONTHS`}
                x={106}
                y={68}
                maxWidth={188}
                fontSize={12}
                fontFamily={FONTS.mono}
                fontWeight={600}
                fill={OVER_FOOTAGE_PALETTE.textBody}
                textAnchor="middle"
              />
            </g>
          ))}

          {/* Bottom Glacial Grid Permitting Track */}
          <rect x="56" y="328" width="1448" height="238" rx="14" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="2.5" />
          <g transform="translate(170, 447)">
            <circle r="68" fill="none" stroke={PAGE_PALETTE.brickRed} strokeWidth="6" />
            <line
              x1="0"
              y1="0"
              x2={(Math.cos((slowAngle * Math.PI) / 180) * 50).toFixed(1)}
              y2={(Math.sin((slowAngle * Math.PI) / 180) * 50).toFixed(1)}
              stroke={PAGE_PALETTE.brickRed}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle r="9" fill={PAGE_PALETTE.brickRed} />
          </g>
          <FittedSvgText
            text={slowTrackLabel}
            x={284}
            y={380}
            maxWidth={1172}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
          />
          <rect x="284" y="400" width="1172" height="18" rx="9" fill={theme.panelBorder} />
          <rect x="284" y="400" width={Math.max(28, 260 * slowProgress)} height="18" rx="9" fill={PAGE_PALETTE.brickRed} />
          {checkpoints.slice(0, 4).map((cp, idx) => (
            <g key={`cp-${idx}`} transform={`translate(${284 + idx * 296}, 436)`}>
              <rect width="276" height="96" rx="8" fill={idx === 0 ? theme.riskBg : theme.panelBg} stroke={theme.riskBorder} strokeWidth="1.8" />
              <FittedSvgText
                text={`GATE 0${idx + 1} · LOCKED`}
                x={138}
                y={36}
                maxWidth={244}
                fontSize={13}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={theme.accentAlert}
                textAnchor="middle"
              />
              <WrappedSvgText
                text={cp}
                x={138}
                y={68}
                maxWidth={244}
                fontSize={14}
                maxLines={2}
                fontFamily={FONTS.sans}
                fontWeight={700}
                fill={theme.inkHeadline}
                textAnchor="middle"
                verticalCenter
              />
            </g>
          ))}
        </svg>
      );
    }}
  />
);

// ============================================================================
// 8. CircularAccountingLoop (Nvidia <-> CoreWeave <-> Cloud SPV Carousel)
// ============================================================================
export interface CircularAccountingLoopProps extends SimulatorBaseProps {
  nodeA?: string;
  nodeB?: string;
  nodeC?: string;
}

export const CircularAccountingLoop: React.FC<CircularAccountingLoopProps> = ({
  nodeA = "CHIP VENDOR (NVIDIA)",
  nodeB = "NEOCLOUD SPV (COREWEAVE)",
  nodeC = "GPU-BACKED DEBT FACILITY",
  eyebrow = "ROUND-TRIP VENDOR FINANCING",
  title = "The Self-Referential AI Revenue & Collateral Carousel",
  subtitle = "Equity stakes seed SPV cloud buyers who pledge those same GPUs as debt collateral to wire booked hardware revenue back to the vendor.",
  sourceCitation = "SOURCE: SEC 10-K / S-1 RELATED-PARTY DISCLOSURES & PRIVATE CREDIT FACILITY FILINGS",
  summaryMetric = "3-NODE LOOP",
  summaryLabel = "COLLATERAL RE-USE",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const orbitDeg = (elapsed * 2.2) % 360;
      const orbitRad = (orbitDeg * Math.PI) / 180;
      const px = 780 + Math.cos(orbitRad) * 320;
      const py = 320 + Math.sin(orbitRad) * 195;

      if (theme.isCompact) {
        const cx = 282 + Math.cos(orbitRad) * 158;
        const cy = 178 + Math.sin(orbitRad) * 96;
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <ellipse cx="282" cy="178" rx="158" ry="96" fill="none" stroke={theme.accentAlert} strokeWidth="4" strokeDasharray="10 8" />
            <circle cx={cx} cy={cy} r="9" fill={PAGE_PALETTE.brickRed} stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="2" />

            <rect x="172" y="136" width="220" height="84" rx="10" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="2" />
            <FittedSvgText text="END-USER CASH CHECK" x={282} y={168} maxWidth={196} fontSize={13} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} textAnchor="middle" />
            <FittedSvgText text="GPUs Depreciate 3–4 Yrs" x={282} y={196} maxWidth={196} fontSize={15} fontFamily={FONTS.sans} fontWeight={700} fill={theme.inkHeadline} textAnchor="middle" />

            <rect x="142" y="12" width="280" height="62" rx="9" fill={PAGE_PALETTE.navy} />
            <FittedSvgText text={nodeA} x={282} y={38} maxWidth={256} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} textAnchor="middle" />
            <FittedSvgText text="1. Equity + Backstop" x={282} y={58} maxWidth={256} fontSize={13} fontFamily={FONTS.mono} fontWeight={600} fill={OVER_FOOTAGE_PALETTE.chartSecondary} textAnchor="middle" />

            <rect x="292" y="272" width="260" height="66" rx="9" fill={PAGE_PALETTE.chartSecondary} />
            <FittedSvgText text={nodeB} x={422} y={298} maxWidth={236} fontSize={14.5} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} textAnchor="middle" />
            <FittedSvgText text="2. Pledges Racks" x={422} y={320} maxWidth={236} fontSize={13} fontFamily={FONTS.mono} fontWeight={600} fill={OVER_FOOTAGE_PALETTE.textBody} textAnchor="middle" />

            <rect x="12" y="272" width="260" height="66" rx="9" fill={PAGE_PALETTE.brickRed} />
            <FittedSvgText text={nodeC} x={142} y={298} maxWidth={236} fontSize={14.5} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} textAnchor="middle" />
            <FittedSvgText text="3. Buys Vendor GPUs" x={142} y={320} maxWidth={236} fontSize={13} fontFamily={FONTS.mono} fontWeight={600} fill={OVER_FOOTAGE_PALETTE.textBody} textAnchor="middle" />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          <ellipse
            cx="780"
            cy="320"
            rx="320"
            ry="195"
            fill="none"
            stroke={theme.accentAlert}
            strokeWidth="5"
            strokeDasharray="14 10"
          />
          <circle cx={px} cy={py} r="14" fill={PAGE_PALETTE.brickRed} stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="3" />

          {/* Center Audit Box */}
          <rect x="610" y="258" width="340" height="124" rx="12" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="2.5" />
          <FittedSvgText
            text="EXTERNAL END-USER CASH CHECK"
            x={780}
            y={306}
            maxWidth={308}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
            textAnchor="middle"
          />
          <FittedSvgText
            text="GPUs Depreciate in 3–4 Yrs"
            x={780}
            y={346}
            maxWidth={308}
            fontSize={19}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.inkHeadline}
            textAnchor="middle"
          />

          {/* Node A Top */}
          <rect x="570" y="42" width="420" height="104" rx="12" fill={PAGE_PALETTE.navy} />
          <FittedSvgText
            text={nodeA}
            x={780}
            y={88}
            maxWidth={388}
            fontSize={18}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
          />
          <FittedSvgText
            text="1. Equity Check + Offtake Backstop"
            x={780}
            y={118}
            maxWidth={388}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={600}
            fill={OVER_FOOTAGE_PALETTE.chartSecondary}
            textAnchor="middle"
          />

          {/* Node B Bottom Right */}
          <rect x="980" y="446" width="440" height="108" rx="12" fill={PAGE_PALETTE.chartSecondary} />
          <FittedSvgText
            text={nodeB}
            x={1200}
            y={492}
            maxWidth={404}
            fontSize={18}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
          />
          <FittedSvgText
            text="2. Pledges H100/B200 Racks as Collateral"
            x={1200}
            y={522}
            maxWidth={404}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={600}
            fill={OVER_FOOTAGE_PALETTE.textBody}
            textAnchor="middle"
          />

          {/* Node C Bottom Left */}
          <rect x="140" y="446" width="440" height="108" rx="12" fill={PAGE_PALETTE.brickRed} />
          <FittedSvgText
            text={nodeC}
            x={360}
            y={492}
            maxWidth={404}
            fontSize={18}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
          />
          <FittedSvgText
            text="3. Debt Proceeds Buy More Vendor GPUs"
            x={360}
            y={522}
            maxWidth={404}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={600}
            fill={OVER_FOOTAGE_PALETTE.textBody}
            textAnchor="middle"
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 9. AsymmetricExchangeSimulator ($20k Drone vs $13B Carrier / $4M VLS Cells)
// ============================================================================
export interface AsymmetricExchangeSimulatorProps extends SimulatorBaseProps {
  droneUnitCost?: string;
  interceptorUnitCost?: string;
  carrierAssetValue?: string;
}

export const AsymmetricExchangeSimulator: React.FC<AsymmetricExchangeSimulatorProps> = ({
  droneUnitCost = "$20,000 ONE-WAY DRONE",
  interceptorUnitCost = "$4.2M SM-6 INTERCEPTOR",
  carrierAssetValue = "$13.0B CARRIER HULL",
  eyebrow = "ATTRITION COST-EXCHANGE RATIO",
  title = "Twenty-Thousand-Dollar Drones Draining Four-Million-Dollar VLS Cells",
  subtitle = "Even a 100% intercept rate bankrupts the defender's magazine when every radar kill trades a $4M missile for a lawnmower-engine drone.",
  sourceCitation = "SOURCE: CONGRESSIONAL RESEARCH SERVICE · RED SEA NAVAL MUNITIONS EXPENDITURE",
  summaryMetric = "210 : 1 RATIO",
  summaryLabel = "INTERCEPT COST SKEW",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const firedCount = Math.min(28, Math.floor(elapsed / 6));
      const cells: number[] = [];
      for (let i = 0; i < 32; i++) cells.push(i);

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="8" width="244" height="332" rx="10" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="2" />
            <FittedSvgText text="INBOUND SWARM" x={22} y={36} maxWidth={216} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} />
            <FittedSvgText text={droneUnitCost} x={22} y={56} maxWidth={216} fontSize={13} fontFamily={FONTS.mono} fontWeight={600} fill={theme.inkMuted} />
            {[0, 1, 2, 3].map((d) => {
              const dx = 36 + ((elapsed * 2.4 + d * 42) % 165);
              const dy = 104 + d * 42;
              return (
                <g key={`c-drn-${d}`} transform={`translate(${dx.toFixed(1)}, ${dy})`}>
                  <polygon points="0,-8 22,0 0,8 5,0" fill={PAGE_PALETTE.brickRed} />
                </g>
              );
            })}
            <FittedSvgText text="28 DRONES: $560K" x={22} y={316} maxWidth={216} fontSize={16} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} style={TABULAR_NUM_STYLE} />

            <rect x="264" y="8" width="292" height="332" rx="10" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2" />
            <FittedSvgText text="VLS MAGAZINE (32)" x={280} y={36} maxWidth={260} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.chartSecondary} />
            <FittedSvgText text={interceptorUnitCost} x={280} y={56} maxWidth={260} fontSize={13} fontFamily={FONTS.mono} fontWeight={600} fill={OVER_FOOTAGE_PALETTE.textBody} />
            {cells.slice(0, 16).map((idx) => {
              const col = idx % 4;
              const row = Math.floor(idx / 4);
              const isDep = idx < Math.min(16, Math.floor(firedCount * 0.57));
              return (
                <g key={`c-vls-${idx}`} transform={`translate(${280 + col * 66}, ${76 + row * 50})`}>
                  <rect width="58" height="40" rx="5" fill={isDep ? "rgba(163, 64, 46, 0.34)" : PAGE_PALETTE.chartSecondary} stroke={isDep ? OVER_FOOTAGE_PALETTE.brickRedText : OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="1.4" />
                  <text x="29" y="25" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
                    {isDep ? "OUT" : `C${idx + 1}`}
                  </text>
                </g>
              );
            })}
            <FittedSvgText text={`DRAIN: $${(firedCount * 4.2).toFixed(1)}M`} x={280} y={316} maxWidth={260} fontSize={17} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.brickRedText} style={TABULAR_NUM_STYLE} />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left Swarm Wave */}
          <rect x="48" y="64" width="620" height="492" rx="14" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="2.5" />
          <FittedSvgText
            text={`INBOUND SWARM · ${droneUnitCost}`}
            x={84}
            y={114}
            maxWidth={548}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
          />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => {
            const dx = 110 + ((elapsed * 3.2 + d * 68) % 460);
            const dy = 176 + (d % 4) * 82 + Math.sin(elapsed * 0.1 + d) * 8;
            return (
              <g key={`drn-${d}`} transform={`translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`}>
                <polygon points="0,-10 26,0 0,10 6,0" fill={PAGE_PALETTE.brickRed} />
                <text x="-8" y="-14" fontFamily={FONTS.mono} fontSize="11" fontWeight="700" fill={theme.accentAlert}>
                  $20K
                </text>
              </g>
            );
          })}
          <FittedSvgText
            text={`SWARM EXPENDITURE (28 UNITS): $${(28 * 20).toLocaleString()}K TOTAL`}
            x={84}
            y={518}
            maxWidth={548}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
            style={TABULAR_NUM_STYLE}
          />

          {/* Right Mk 41 VLS Magazine */}
          <rect x="736" y="64" width="776" height="492" rx="14" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2.5" />
          <FittedSvgText
            text={`MK 41 VLS MAGAZINE (32 CELLS) · ${carrierAssetValue}`}
            x={774}
            y={114}
            maxWidth={700}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.chartSecondary}
          />
          <FittedSvgText
            text={`${interceptorUnitCost} · RELOAD AT SEA: IMPOSSIBLE`}
            x={774}
            y={144}
            maxWidth={700}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={600}
            fill={OVER_FOOTAGE_PALETTE.textBody}
          />

          {cells.map((idx) => {
            const col = idx % 8;
            const row = Math.floor(idx / 8);
            const isDepleted = idx < firedCount;
            return (
              <g key={`vls-${idx}`} transform={`translate(${774 + col * 86}, ${178 + row * 72})`}>
                <rect
                  width="70"
                  height="56"
                  rx="6"
                  fill={isDepleted ? "rgba(163, 64, 46, 0.34)" : PAGE_PALETTE.chartSecondary}
                  stroke={isDepleted ? OVER_FOOTAGE_PALETTE.brickRedText : OVER_FOOTAGE_PALETTE.textHeadline}
                  strokeWidth="1.8"
                />
                <text
                  x="35"
                  y="34"
                  textAnchor="middle"
                  fontFamily={FONTS.mono}
                  fontSize="12"
                  fontWeight="700"
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                  style={TABULAR_NUM_STYLE}
                >
                  {isDepleted ? "EMPTY" : `C${idx + 1}`}
                </text>
              </g>
            );
          })}

          <FittedSvgText
            text={`DEFENDER DRAIN (${firedCount} CELLS FIRED): $${(firedCount * 4.2).toFixed(1)}M EXPENDED`}
            x={774}
            y={518}
            maxWidth={700}
            fontSize={18}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.brickRedText}
            style={TABULAR_NUM_STYLE}
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 10. SubseaCableCrossSection (550 Garden-Hose Cables · $10T/Day + Anchor Cut)
// ============================================================================
export interface SubseaCableCrossSectionProps extends SimulatorBaseProps {
  cableCountLabel?: string;
  dailySettlementLabel?: string;
}

export const SubseaCableCrossSection: React.FC<SubseaCableCrossSectionProps> = ({
  cableCountLabel = "~550 ACTIVE SUBSEA CABLES WORLDWIDE",
  dailySettlementLabel = "$10.0T / DAY SWIFT & CLOUD TRAFFIC",
  eyebrow = "SEABED FIBER ANATOMY",
  title = "Ten Trillion Dollars a Day Inside a Garden-Hose Glass Core",
  subtitle = "Ninety-nine percent of intercontinental financial clearing rides through hair-thin silica fibers vulnerable to a single dragged ship anchor.",
  sourceCitation = "SOURCE: TELEGEOGRAPHY SUBMARINE CABLE MAP & FEDERAL RESERVE WIRE CLEARING DATA",
  summaryMetric = "21mm CORE",
  summaryLabel = "$10T DAILY CLEARING",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed, fps) => {
      const anchorDrop = interpolate(
        studioSpring(elapsed, fps, "heavyStamp", 26),
        [0, 1],
        [0, 145],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const isSevered = anchorDrop > 110;

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <g transform="translate(106, 154)">
              <circle r="86" fill={PAGE_PALETTE.navy} stroke={theme.inkHeadline} strokeWidth="2.5" />
              <circle r="64" fill="#465A6E" stroke={OVER_FOOTAGE_PALETTE.accentPrimary} strokeWidth="1.5" />
              <circle r="44" fill="#9E7B54" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="1.5" />
              <circle r="22" fill={isSevered ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary} stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="2" />
            </g>
            <FittedSvgText text="21mm GLASS CORE" x={106} y={272} maxWidth={184} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} textAnchor="middle" />

            <rect x="216" y="12" width="340" height="324" rx="10" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
            <FittedSvgText text={dailySettlementLabel} x={232} y={42} maxWidth={308} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} />
            <rect x="232" y="164" width="308" height="24" rx="12" fill={PAGE_PALETTE.navy} />
            <line x1="240" y1="176" x2={isSevered ? "386" : "532"} y2="176" stroke={isSevered ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary} strokeWidth="5" strokeDasharray="10 8" />
            <g transform={`translate(390, ${(82 + anchorDrop * 0.56).toFixed(1)})`}>
              <line x1="0" y1="-34" x2="0" y2="24" stroke={PAGE_PALETTE.brickRed} strokeWidth="6" />
              <path d="M -22 12 Q 0 38 22 12" fill="none" stroke={PAGE_PALETTE.brickRed} strokeWidth="6" strokeLinecap="round" />
            </g>
            <rect x="232" y="232" width="308" height="86" rx="8" fill={isSevered ? theme.riskBg : theme.panelBg} stroke={theme.riskBorder} strokeWidth="1.6" />
            <FittedSvgText text={isSevered ? "FAULT · ANCHOR CUT" : "NOMINAL CARRIER"} x={246} y={262} maxWidth={280} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} />
            <WrappedSvgText text="Repair ship mobilization: 3 to 8 weeks." x={246} y={292} maxWidth={280} fontSize={14.5} maxLines={2} fontFamily={FONTS.sans} fontWeight={700} fill={theme.inkHeadline} verticalCenter />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Concentric Cross-Section Left */}
          <g transform="translate(330, 310)">
            <circle r="210" fill={PAGE_PALETTE.navy} stroke={theme.inkHeadline} strokeWidth="3" />
            <circle r="160" fill="#465A6E" stroke={OVER_FOOTAGE_PALETTE.accentPrimary} strokeWidth="2" />
            <circle r="108" fill="#9E7B54" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="2" />
            <circle r="54" fill={isSevered ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary} stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="3" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((f) => {
              const a = (f * Math.PI) / 4;
              return (
                <circle
                  key={`fib-${f}`}
                  cx={(Math.cos(a) * 26).toFixed(1)}
                  cy={(Math.sin(a) * 26).toFixed(1)}
                  r="6"
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                />
              );
            })}
          </g>

          {/* Right Longitudinal Seabed Conduit + Dragging Anchor */}
          <rect x="640" y="72" width="860" height="476" rx="14" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
          <FittedSvgText
            text={`${cableCountLabel} · ${dailySettlementLabel}`}
            x={680}
            y={122}
            maxWidth={780}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
          />

          {/* Cable Run */}
          <rect x="680" y="328" width="780" height="36" rx="18" fill={PAGE_PALETTE.navy} />
          <line
            x1="690"
            y1="346"
            x2={isSevered ? "1050" : "1450"}
            y2="346"
            stroke={isSevered ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary}
            strokeWidth="8"
            strokeDasharray="18 14"
          />

          {/* Dragged Anchor */}
          <g transform={`translate(1060, ${(165 + anchorDrop).toFixed(1)})`}>
            <line x1="0" y1="-80" x2="0" y2="42" stroke={PAGE_PALETTE.brickRed} strokeWidth="8" />
            <path d="M -38 22 Q 0 64 38 22" fill="none" stroke={PAGE_PALETTE.brickRed} strokeWidth="9" strokeLinecap="round" />
          </g>

          <rect x="680" y="424" width="780" height="88" rx="8" fill={isSevered ? theme.riskBg : theme.panelBg} stroke={theme.riskBorder} strokeWidth="2" />
          <FittedSvgText
            text={isSevered ? "FAULT DETECTED · ANCHOR SEVERANCE AT SEABED CHOKEPOINT" : "NOMINAL OPTICAL CARRIER · 8 FIBER PAIRS"}
            x={710}
            y={462}
            maxWidth={720}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
          />
          <FittedSvgText
            text="Outer Diameter: 21mm (Garden Hose) · Repair Ship Mobilization: 3 to 8 Weeks"
            x={710}
            y={492}
            maxWidth={720}
            fontSize={17}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 11. LithographyNodeLock (Phoenix 4nm vs Taiwan 2nm/A16 + EUV Kill-Switch)
// ============================================================================
export interface LithographyNodeLockProps extends SimulatorBaseProps {
  trailingFabLabel?: string;
  frontierFabLabel?: string;
}

export const LithographyNodeLock: React.FC<LithographyNodeLockProps> = ({
  trailingFabLabel = "PHOENIX FAB 21 · 4nm FINFET (N4)",
  frontierFabLabel = "HSINCHU / KAOHSIUNG · 2nm / A16 NANOSHEET",
  eyebrow = "SILICON SOVEREIGNTY GAP",
  title = "Trailing Domestic Packaging vs Frontier 2nm & EUV Remote Lock",
  subtitle = "Leading-edge gate-all-around logic and CoWoS packaging remain concentrated in Taiwan, backed by remotely serviceable ASML EUV scanners.",
  sourceCitation = "SOURCE: SEMI WORLD FAB FORECAST, TSMC ROADMAP & ASML EUV TELEMETRY",
  summaryMetric = "2nm + EUV LOCK",
  summaryLabel = "FRONTIER NODE GAP",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <SimulatorShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    summaryMetric={summaryMetric}
    summaryLabel={summaryLabel}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderGraphic={(theme, elapsed, fps) => {
      const switchTrip = studioSpring(elapsed, fps, "mechanicalTick", 32) > 0.6;

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="10" width="174" height="328" rx="10" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
            <FittedSvgText text="PHOENIX FAB 21" x={95} y={42} maxWidth={150} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} textAnchor="middle" />
            <circle cx="95" cy="158" r="56" fill={theme.panelBg} stroke={theme.navyInk} strokeWidth="2.5" />
            <FittedSvgText text="4nm N4" x={95} y={165} maxWidth={96} fontSize={20} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} textAnchor="middle" style={TABULAR_NUM_STYLE} />
            <WrappedSvgText text="Ships back to Asia for CoWoS." x={95} y={276} maxWidth={148} fontSize={14} maxLines={2} fontFamily={FONTS.sans} fontWeight={700} fill={theme.inkMuted} textAnchor="middle" verticalCenter />

            <rect x="195" y="10" width="174" height="328" rx="10" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2" />
            <FittedSvgText text="TAIWAN FRONTIER" x={282} y={42} maxWidth={150} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.chartSecondary} textAnchor="middle" />
            <circle cx="282" cy="158" r="56" fill="#18364A" stroke={OVER_FOOTAGE_PALETTE.chartSecondary} strokeWidth="2.5" />
            <FittedSvgText text="2nm / A16" x={282} y={165} maxWidth={96} fontSize={19} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textHeadline} textAnchor="middle" style={TABULAR_NUM_STYLE} />
            <WrappedSvgText text="92% global frontier share." x={282} y={276} maxWidth={148} fontSize={14} maxLines={2} fontFamily={FONTS.sans} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.textBody} textAnchor="middle" verticalCenter />

            <rect x="382" y="10" width="174" height="328" rx="10" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="2" />
            <FittedSvgText text="ASML EUV LOCK" x={469} y={42} maxWidth={150} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} textAnchor="middle" />
            <rect x="398" y="102" width="142" height="112" rx="8" fill={switchTrip ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy} />
            <WrappedSvgText
              text={switchTrip ? "LASER LOCKED" : "ARMED"}
              x={469}
              y={158}
              maxWidth={126}
              fontSize={16}
              maxLines={2}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.accentWarm}
              textAnchor="middle"
              verticalCenter
            />
            <WrappedSvgText text="Zero yield on firmware cut." x={469} y={276} maxWidth={148} fontSize={14} maxLines={2} fontFamily={FONTS.sans} fontWeight={700} fill={theme.inkHeadline} textAnchor="middle" verticalCenter />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left: Phoenix 4nm */}
          <rect x="48" y="64" width="460" height="492" rx="14" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2.5" />
          <FittedSvgText
            text={trailingFabLabel}
            x={80}
            y={114}
            maxWidth={396}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
          <circle cx="278" cy="300" r="126" fill={theme.panelBg} stroke={theme.navyInk} strokeWidth="3" />
          <FittedSvgText
            text="4nm N4"
            x={278}
            y={310}
            maxWidth={210}
            fontSize={34}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />
          <WrappedSvgText
            text="1–2 Generations Behind · Ships Back to Asia for CoWoS"
            x={80}
            y={496}
            maxWidth={396}
            fontSize={16}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.inkMuted}
          />

          {/* Center: Frontier 2nm/A16 */}
          <rect x="550" y="64" width="460" height="492" rx="14" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2.5" />
          <FittedSvgText
            text={frontierFabLabel}
            x={582}
            y={114}
            maxWidth={396}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.chartSecondary}
          />
          <circle cx="780" cy="300" r="126" fill="#18364A" stroke={OVER_FOOTAGE_PALETTE.chartSecondary} strokeWidth="3" />
          <FittedSvgText
            text="2nm / A16"
            x={780}
            y={310}
            maxWidth={210}
            fontSize={34}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />
          <WrappedSvgText
            text="92% Global Frontier Share · Co-Located CoWoS-L"
            x={582}
            y={496}
            maxWidth={396}
            fontSize={16}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textBody}
          />

          {/* Right: ASML EUV Remote Kill-Switch */}
          <rect x="1052" y="64" width="460" height="492" rx="14" fill={theme.wellBg} stroke={theme.riskBorder} strokeWidth="2.5" />
          <FittedSvgText
            text="ASML HIGH-NA EUV ($380M SCANNER)"
            x={1084}
            y={114}
            maxWidth={396}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
          />
          <rect x="1120" y="200" width="324" height="196" rx="12" fill={switchTrip ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy} />
          <FittedSvgText
            text="REMOTE TELEMETRY BREAKER"
            x={1282}
            y={282}
            maxWidth={292}
            fontSize={19}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="middle"
          />
          <FittedSvgText
            text={switchTrip ? "LASER SOURCE LOCKED" : "CALIBRATION ARMED"}
            x={1282}
            y={328}
            maxWidth={292}
            fontSize={24}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.accentWarm}
            textAnchor="middle"
          />
          <WrappedSvgText
            text="Zero Usable Yield Within Days of Firmware Cut"
            x={1084}
            y={496}
            maxWidth={396}
            fontSize={16}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// Parameterized Physical, Hydraulic & Industrial Simulation Engine (#12–#26)
// ============================================================================
export type MechanicalArchetype =
  | "balance-beam"
  | "industrial-queue"
  | "hydraulic-reservoir"
  | "rotary-governor"
  | "cascade-ratchet"
  | "truss-tollgate";

export interface ParametricMechanicalStageSpec {
  label: string;
  metric: string;
  detail: string;
  tone: "navy" | "brick" | "teal" | "slate";
}

export interface ParametricSimulatorProps extends SimulatorBaseProps {
  leftMetric?: string;
  rightMetric?: string;
  stages?: readonly ParametricMechanicalStageSpec[];
}

function createParametricSimulator(config: {
  archetype: MechanicalArchetype;
  defaultEyebrow: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultSource: string;
  defaultMetric: string;
  defaultLabel: string;
  defaultLeftMetric: string;
  defaultRightMetric: string;
  defaultStages: readonly ParametricMechanicalStageSpec[];
}): React.FC<ParametricSimulatorProps> {
  const Component: React.FC<ParametricSimulatorProps> = ({
    eyebrow = config.defaultEyebrow,
    title = config.defaultTitle,
    subtitle = config.defaultSubtitle,
    sourceCitation = config.defaultSource,
    summaryMetric = config.defaultMetric,
    summaryLabel = config.defaultLabel,
    leftMetric = config.defaultLeftMetric,
    rightMetric = config.defaultRightMetric,
    stages = config.defaultStages,
    mode,
    paletteMode,
    register,
    atFrame = 0,
  }) => (
    <SimulatorShell
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      sourceCitation={sourceCitation}
      summaryMetric={summaryMetric}
      summaryLabel={summaryLabel}
      mode={mode}
      paletteMode={paletteMode}
      register={register}
      atFrame={atFrame}
      renderGraphic={(theme, elapsed, fps) => {
        const settle = interpolate(
          studioSpring(elapsed, fps, "archivalSettle", 8),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const pulse = Math.sin(elapsed * 0.08);
        const dash = (elapsed * 3.2) % 40;
        const brass = "#B08D57";

        if (theme.isCompact) {
          return (
            <svg width="100%" height="100%" viewBox="0 0 564 348">
              {/* Compact Left Mechanical Dial / Apparatus Summary */}
              <rect x="8" y="8" width="548" height="94" rx="10" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
              <FittedSvgText
                text={leftMetric}
                x={24}
                y={42}
                maxWidth={220}
                fontSize={16}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={theme.accentTeal}
                style={TABULAR_NUM_STYLE}
              />
              <FittedSvgText
                text="->"
                x={282}
                y={44}
                maxWidth={36}
                fontSize={18}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={theme.inkMuted}
                textAnchor="middle"
              />
              <FittedSvgText
                text={rightMetric}
                x={540}
                y={42}
                maxWidth={220}
                fontSize={16}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={theme.accentAlert}
                textAnchor="end"
                style={TABULAR_NUM_STYLE}
              />
              <rect x="24" y="64" width="516" height="18" rx="6" fill={theme.panelBorder} />
              <rect x="24" y="64" width={Math.max(32, 340 * settle)} height="18" rx="6" fill={PAGE_PALETTE.brickRed} />
              <circle cx={24 + 340 * settle} cy="73" r="11" fill={brass} stroke={PAGE_PALETTE.navyDeep} strokeWidth="2" />

              {/* Compact 3-Stage Mechanical Telemetry Stack */}
              {stages.slice(0, 3).map((st, idx) => {
                const sy = 116 + idx * 76;
                const borderCol =
                  st.tone === "brick"
                    ? theme.riskBorder
                    : st.tone === "teal"
                    ? theme.accentTeal
                    : theme.navyInk;
                const labelCol =
                  st.tone === "brick"
                    ? theme.accentAlert
                    : st.tone === "teal"
                    ? theme.accentTeal
                    : theme.inkMuted;
                return (
                  <g key={`c-pst-${idx}`} transform={`translate(8, ${sy})`}>
                    <rect width="548" height="66" rx="8" fill={st.tone === "brick" ? theme.riskBg : theme.wellBg} stroke={borderCol} strokeWidth="1.6" />
                    <FittedSvgText
                      text={`0${idx + 1} · ${st.label.toUpperCase()}`}
                      x={16}
                      y={26}
                      maxWidth={318}
                      fontSize={14}
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={labelCol}
                    />
                    <FittedSvgText
                      text={st.metric}
                      x={532}
                      y={28}
                      maxWidth={190}
                      fontSize={17}
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={theme.inkHeadline}
                      textAnchor="end"
                      style={TABULAR_NUM_STYLE}
                    />
                    <FittedSvgText
                      text={st.detail}
                      x={16}
                      y={50}
                      maxWidth={516}
                      fontSize={14}
                      fontFamily={FONTS.sans}
                      fontWeight={600}
                      fill={theme.inkMuted}
                    />
                  </g>
                );
              })}
            </svg>
          );
        }

        return (
          <svg width="100%" height="100%" viewBox="0 0 1560 620">
            {/* Left Mechanical Apparatus */}
            <rect
              x="44"
              y="48"
              width="790"
              height="524"
              rx="14"
              fill={theme.wellBg}
              stroke={theme.navyInk}
              strokeWidth="2.2"
            />
            {/* Corner Brass Calibration Rivets */}
            {[
              [64, 68],
              [814, 68],
              [64, 552],
              [814, 552],
            ].map(([rx, ry], rIdx) => (
              <circle key={`rv-${rIdx}`} cx={rx} cy={ry} r="5" fill={brass} stroke={PAGE_PALETTE.navyDeep} strokeWidth="1.2" />
            ))}

            {config.archetype === "balance-beam" && (
              <g transform="translate(439, 340)">
                <line x1="-320" y1="150" x2="320" y2="150" stroke={theme.panelBorder} strokeWidth="3" />
                <polygon points="-64,150 64,150 0,18" fill={PAGE_PALETTE.navy} stroke={brass} strokeWidth="2.5" />
                <g transform={`rotate(${(13.5 * settle + pulse * 0.8).toFixed(2)})`}>
                  <rect x="-306" y="-12" width="612" height="22" rx="6" fill={brass} stroke={PAGE_PALETTE.navyDeep} strokeWidth="2" />
                  <line x1="-210" y1="-12" x2="-210" y2="-22" stroke={PAGE_PALETTE.navyDeep} strokeWidth="5" />
                  <rect x="-296" y="-114" width="172" height="94" rx="8" fill={PAGE_PALETTE.chartSecondary} stroke={PAGE_PALETTE.navyDeep} strokeWidth="2" />
                  <WrappedSvgText
                    text={leftMetric}
                    x={-210}
                    y={-67}
                    maxWidth={148}
                    fontSize={17}
                    minFontSize={12}
                    maxLines={2}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={OVER_FOOTAGE_PALETTE.textHeadline}
                    textAnchor="middle"
                    verticalCenter
                    style={TABULAR_NUM_STYLE}
                  />
                  <line x1="218" y1="-12" x2="218" y2="-22" stroke={PAGE_PALETTE.navyDeep} strokeWidth="5" />
                  <rect x="124" y="-142" width="188" height="122" rx="8" fill={PAGE_PALETTE.brickRed} stroke={PAGE_PALETTE.navyDeep} strokeWidth="2" />
                  <WrappedSvgText
                    text={rightMetric}
                    x={218}
                    y={-81}
                    maxWidth={164}
                    fontSize={19}
                    minFontSize={13}
                    maxLines={2}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={OVER_FOOTAGE_PALETTE.textHeadline}
                    textAnchor="middle"
                    verticalCenter
                    style={TABULAR_NUM_STYLE}
                  />
                </g>
                <circle cx="0" cy="0" r="14" fill={brass} stroke={PAGE_PALETTE.navyDeep} strokeWidth="3" />
              </g>
            )}

            {config.archetype === "industrial-queue" && (
              <g transform="translate(88, 114)">
                <FittedSvgText
                  text={`SERIAL BOTTLENECK · ${leftMetric} -> ${rightMetric}`}
                  x={0}
                  y={4}
                  maxWidth={700}
                  fontSize={15}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.accentAlert}
                />
                {[0, 1, 2, 3, 4].map((slot) => (
                  <g key={`q-${slot}`} transform={`translate(${slot * 136}, 46)`}>
                    <rect
                      width="118"
                      height="218"
                      rx="8"
                      fill={slot < 4 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary}
                      stroke={PAGE_PALETTE.navyDeep}
                      strokeWidth="2"
                      opacity={slot < 4 ? 0.9 : 1}
                    />
                    <rect x="10" y="14" width="98" height="14" rx="4" fill={PAGE_PALETTE.navyDeep} opacity={0.35} />
                    <circle cx="59" cy="58" r="14" fill={PAGE_PALETTE.navyDeep} stroke={brass} strokeWidth="2" />
                    <text x="59" y="63" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
                      0{slot + 1}
                    </text>
                    <FittedSvgText
                      text={slot < 4 ? `QUEUE #${slot + 1}` : "ACTIVE BAY"}
                      x={59}
                      y={122}
                      maxWidth={102}
                      fontSize={15}
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={OVER_FOOTAGE_PALETTE.textHeadline}
                      textAnchor="middle"
                    />
                    <FittedSvgText
                      text={slot < 4 ? "BACKLOGGED" : "ENERGIZED"}
                      x={59}
                      y={152}
                      maxWidth={102}
                      fontSize={12}
                      fontFamily={FONTS.mono}
                      fontWeight={600}
                      fill={OVER_FOOTAGE_PALETTE.textBody}
                      textAnchor="middle"
                    />
                  </g>
                ))}
                {/* Conveyor Rail & Rollers */}
                <rect x="0" y="302" width="664" height="16" rx="8" fill={PAGE_PALETTE.navy} />
                <line x1="12" y1="310" x2="652" y2="310" stroke={brass} strokeWidth="5" strokeDasharray="16 14" strokeDashoffset={-dash} />
              </g>
            )}

            {config.archetype === "hydraulic-reservoir" && (
              <g transform="translate(92, 108)">
                <rect x="0" y="36" width="260" height="340" rx="12" fill={PAGE_PALETTE.navy} stroke={brass} strokeWidth="2.5" />
                <rect
                  x="16"
                  y={36 + 110 * settle}
                  width="228"
                  height={Math.max(48, 320 - 110 * settle)}
                  rx="8"
                  fill={PAGE_PALETTE.chartSecondary}
                />
                {/* Tank Sight-Glass Graduations */}
                {[0, 1, 2, 3, 4].map((gTick) => (
                  <line key={`hg-${gTick}`} x1="216" y1={86 + gTick * 60} x2="236" y2={86 + gTick * 60} stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="2" />
                ))}
                <FittedSvgText
                  text={leftMetric}
                  x={130}
                  y={20}
                  maxWidth={256}
                  fontSize={15}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.inkHeadline}
                  textAnchor="middle"
                />
                <path
                  d="M 260 196 C 340 196, 350 96, 420 96 L 610 96"
                  fill="none"
                  stroke={PAGE_PALETTE.brickRed}
                  strokeWidth="22"
                />
                <path
                  d="M 260 196 C 340 196, 350 96, 420 96 L 610 96"
                  fill="none"
                  stroke={OVER_FOOTAGE_PALETTE.textHeadline}
                  strokeWidth="4"
                  strokeDasharray="14 18"
                  strokeDashoffset={-dash}
                />
                <circle cx="345" cy="146" r="18" fill={PAGE_PALETTE.navyDeep} stroke={brass} strokeWidth="2.5" />
                <rect x="420" y="176" width="260" height="200" rx="12" fill={PAGE_PALETTE.brickRed} stroke={brass} strokeWidth="2.5" />
                <WrappedSvgText
                  text={rightMetric}
                  x={550}
                  y={276}
                  maxWidth={228}
                  fontSize={20}
                  minFontSize={13}
                  maxLines={2}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                  textAnchor="middle"
                  verticalCenter
                />
              </g>
            )}

            {config.archetype === "rotary-governor" && (
              <g transform="translate(439, 304)">
                <circle r="172" fill="none" stroke={theme.navyInk} strokeWidth="14" />
                <circle r="134" fill="none" stroke={PAGE_PALETTE.brickRed} strokeWidth="5" strokeDasharray="16 12" />
                {/* Graduated Perimeter Ticks */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((ang) => {
                  const rad = (ang * Math.PI) / 180;
                  return (
                    <line
                      key={`rt-${ang}`}
                      x1={(Math.cos(rad) * 150).toFixed(1)}
                      y1={(Math.sin(rad) * 150).toFixed(1)}
                      x2={(Math.cos(rad) * 164).toFixed(1)}
                      y2={(Math.sin(rad) * 164).toFixed(1)}
                      stroke={brass}
                      strokeWidth="3"
                    />
                  );
                })}
                <g transform={`rotate(${(elapsed * 3.4).toFixed(1)})`}>
                  <line x1="-144" y1="0" x2="144" y2="0" stroke={PAGE_PALETTE.chartSecondary} strokeWidth="10" strokeLinecap="round" />
                  <line x1="0" y1="-144" x2="0" y2="144" stroke={PAGE_PALETTE.chartSecondary} strokeWidth="10" strokeLinecap="round" />
                  <circle cx="136" cy="0" r="10" fill={brass} />
                  <circle cx="-136" cy="0" r="10" fill={brass} />
                </g>
                <circle r="58" fill={PAGE_PALETTE.navyDeep} stroke={brass} strokeWidth="3" />
                <WrappedSvgText
                  text={leftMetric}
                  x={0}
                  y={0}
                  maxWidth={96}
                  fontSize={15}
                  minFontSize={10.5}
                  maxLines={2}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                  textAnchor="middle"
                  verticalCenter
                  style={TABULAR_NUM_STYLE}
                />
                <FittedSvgText
                  text={`TRIP THRESHOLD · ${rightMetric}`}
                  x={0}
                  y={216}
                  maxWidth={680}
                  fontSize={16}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.accentAlert}
                  textAnchor="middle"
                  style={TABULAR_NUM_STYLE}
                />
              </g>
            )}

            {config.archetype === "cascade-ratchet" && (
              <g transform="translate(96, 136)">
                {[0, 1, 2, 3, 4].map((blk) => {
                  const tilt = Math.min(48, Math.max(0, (settle * 5 - blk * 0.65) * 28));
                  return (
                    <g
                      key={`dom-${blk}`}
                      transform={`translate(${blk * 132 + 44}, 310) rotate(${tilt.toFixed(1)})`}
                    >
                      <rect
                        x="-26"
                        y="-190"
                        width="52"
                        height="190"
                        rx="6"
                        fill={blk >= 3 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy}
                        stroke={brass}
                        strokeWidth="2"
                      />
                      <circle cx="0" cy="-160" r="6" fill={brass} />
                    </g>
                  );
                })}
                <line x1="0" y1="316" x2="680" y2="316" stroke={theme.navyInk} strokeWidth="5" />
                <FittedSvgText
                  text={`${leftMetric} -> ${rightMetric}`}
                  x={0}
                  y={28}
                  maxWidth={680}
                  fontSize={16}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.accentAlert}
                />
              </g>
            )}

            {config.archetype === "truss-tollgate" && (
              <g transform="translate(92, 118)">
                <polygon points="40,60 640,60 580,148 100,148" fill={PAGE_PALETTE.brickRed} stroke={PAGE_PALETTE.navyDeep} strokeWidth="2.5" />
                <FittedSvgText
                  text={`OVERHEAD LOAD · ${rightMetric}`}
                  x={340}
                  y={112}
                  maxWidth={460}
                  fontSize={18}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                  textAnchor="middle"
                />
                {/* Structural Truss Web Diagonals */}
                <line x1="172" y1="148" x2="340" y2="358" stroke={brass} strokeWidth="5" />
                <line x1="508" y1="148" x2="340" y2="358" stroke={brass} strokeWidth="5" />
                {[0, 1, 2].map((col) => (
                  <rect
                    key={`tr-col-${col}`}
                    x={148 + col * 168}
                    y="148"
                    width="48"
                    height="210"
                    rx="4"
                    fill={PAGE_PALETTE.navy}
                    stroke={brass}
                    strokeWidth="2"
                  />
                ))}
                <rect x="40" y="358" width="600" height="44" rx="6" fill={PAGE_PALETTE.chartSecondary} stroke={PAGE_PALETTE.navyDeep} strokeWidth="2" />
                <FittedSvgText
                  text={`SUPPORT BASE · ${leftMetric}`}
                  x={340}
                  y={386}
                  maxWidth={560}
                  fontSize={15}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                  textAnchor="middle"
                />
              </g>
            )}

            {/* Right Tabular Mechanical Telemetry Stack */}
            {stages.map((st, idx) => {
              const sy = 56 + idx * 172;
              const borderCol =
                st.tone === "brick"
                  ? theme.riskBorder
                  : st.tone === "teal"
                  ? theme.accentTeal
                  : theme.navyInk;
              const accentCol =
                st.tone === "brick"
                  ? theme.accentAlert
                  : st.tone === "teal"
                  ? theme.accentTeal
                  : theme.inkMuted;
              return (
                <g key={`p-st-${idx}`} transform={`translate(874, ${sy})`}>
                  <rect
                    width="640"
                    height="148"
                    rx="12"
                    fill={st.tone === "brick" ? theme.riskBg : theme.wellBg}
                    stroke={borderCol}
                    strokeWidth="2.2"
                  />
                  <rect x="0" y="16" width="5" height="116" rx="2.5" fill={borderCol} />
                  <FittedSvgText
                    text={`STAGE 0${idx + 1} · ${st.label.toUpperCase()}`}
                    x={28}
                    y={42}
                    maxWidth={584}
                    fontSize={13.5}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={accentCol}
                  />
                  <FittedSvgText
                    text={st.metric}
                    x={28}
                    y={90}
                    maxWidth={584}
                    fontSize={34}
                    minFontSize={20}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={theme.inkHeadline}
                    style={TABULAR_NUM_STYLE}
                  />
                  <FittedSvgText
                    text={st.detail}
                    x={28}
                    y={124}
                    maxWidth={584}
                    fontSize={16}
                    minFontSize={12}
                    fontFamily={FONTS.sans}
                    fontWeight={600}
                    fill={theme.inkMuted}
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    />
  );
  return Component;
}

export const CantileverBalanceScale = createParametricSimulator({
  archetype: "balance-beam",
  defaultEyebrow: "TORQUE EQUILIBRIUM",
  defaultTitle: "Asset-Deflation Fulcrum: Nominal Liabilities Overpower Shrinking Cash",
  defaultSubtitle: "Fixed debt sits farther out on the lever arm as household cash inflows compress.",
  defaultSource: "SOURCE: FEDERAL RESERVE Z.1 FINANCIAL ACCOUNTS OF THE UNITED STATES",
  defaultMetric: "3.4x LEVERAGE",
  defaultLabel: "FULCRUM IMBALANCE",
  defaultLeftMetric: "SHRUNK WAGES",
  defaultRightMetric: "FIXED DEBT",
  defaultStages: [
    { label: "Wage Arm Compression", metric: "-42% REAL", detail: "White-collar median fee compression", tone: "teal" },
    { label: "Fulcrum Threshold", metric: "43% DTI", detail: "Qualified mortgage underwriting ceiling", tone: "navy" },
    { label: "Fixed Lien Moment", metric: "100% PAR", detail: "Principal contractually immune to CPI drop", tone: "brick" },
  ],
});

export const TransformerQueueBottleneck = createParametricSimulator({
  archetype: "industrial-queue",
  defaultEyebrow: "GRAIN-ORIENTED STEEL BACKLOG",
  defaultTitle: "Large Power Transformer Lead Times Lock Substation Expansion",
  defaultSubtitle: "Custom 500 MVA high-voltage transformers face four-year factory queues and domestic steel shortages.",
  defaultSource: "SOURCE: NERC / DOE LARGE POWER TRANSFORMER SUPPLY CHAIN ASSESSMENT",
  defaultMetric: "48–60 MONTHS",
  defaultLabel: "TRANSFORMER LEAD TIME",
  defaultLeftMetric: "2022: 11 MO",
  defaultRightMetric: "2026: 54 MO",
  defaultStages: [
    { label: "GOES Core Lamination", metric: "1 DOMESTIC MILL", detail: "Grain-oriented electrical steel bottleneck", tone: "brick" },
    { label: "HV Winding Labor", metric: "36 MO TRAINING", detail: "Hand-wound paper-insulated copper coils", tone: "navy" },
    { label: "Substation Energization", metric: "2,600 GW QUEUED", detail: "Projects waiting on step-up hardware", tone: "teal" },
  ],
});

export const WaterCoolingEvaporationTower = createParametricSimulator({
  archetype: "hydraulic-reservoir",
  defaultEyebrow: "THERMAL DISSIPATION DRAW",
  defaultTitle: "Hyperscale Evaporative Cooling Competes With Municipal Aquifers",
  defaultSubtitle: "High-density liquid-to-air heat rejection vaporizes millions of potable gallons daily during summer peaks.",
  defaultSource: "SOURCE: MUNICIPAL WATER AUTHORITY PERMITS & ASHRAE DATA-CENTER THERMAL DATA",
  defaultMetric: "4.8M GAL / DAY",
  defaultLabel: "PEAK EVAPORATIVE LOSS",
  defaultLeftMetric: "MUNICIPAL AQUIFER",
  defaultRightMetric: "PLUME LOSS",
  defaultStages: [
    { label: "Chiller Loop Intake", metric: "1.8 L / kWh", detail: "Consumptive water intensity at 98°F wet-bulb", tone: "teal" },
    { label: "Blowdown Salinity", metric: "3.5x CYCLES", detail: "Concentrated mineral discharge to sewer", tone: "navy" },
    { label: "Drought Curtain Allocation", metric: "TIER-1 INDUSTRIAL", detail: "Contractual priority over residential lawns", tone: "brick" },
  ],
});

export const ContainerChokepointLock = createParametricSimulator({
  archetype: "industrial-queue",
  defaultEyebrow: "MARITIME CANAL LOCKAGE",
  defaultTitle: "Stepped Canal Lock Draft Limits & Daily Slot Auctions",
  defaultSubtitle: "Freshwater lock levels cap Neo-Panamax draft depth and force multi-million-dollar queue-jumping bids.",
  defaultSource: "SOURCE: PANAMA CANAL AUTHORITY & CLARKSONS SHIPPING TELEMETRY",
  defaultMetric: "24 SLOTS / DAY",
  defaultLabel: "RESTRICTED TRANSITS",
  defaultLeftMetric: "38 NORMAL",
  defaultRightMetric: "24 DROUGHT",
  defaultStages: [
    { label: "Gatun Lake Fresh Intake", metric: "52M GAL / SHIP", detail: "Freshwater flushed to ocean per transit", tone: "teal" },
    { label: "Slot Auction Clearing", metric: "$4.0M BID", detail: "Priority passage fee paid by LNG tankers", tone: "brick" },
    { label: "Cape Horn Detour", metric: "+18 DAYS", detail: "Working-capital lockup on rerouted hulls", tone: "navy" },
  ],
});

export const StrategicReserveCaverns = createParametricSimulator({
  archetype: "hydraulic-reservoir",
  defaultEyebrow: "SALT-DOME BUFFER",
  defaultTitle: "Strategic Petroleum Caverns: Rapid Drawdown vs Multi-Year Refill",
  defaultSubtitle: "Brine-displacement salt domes release emergency barrels far faster than cavern integrity allows reinjection.",
  defaultSource: "SOURCE: U.S. ENERGY INFORMATION ADMINISTRATION WEEKLY SPR STOCKS",
  defaultMetric: "375M BBL",
  defaultLabel: "SALT-DOME INVENTORY",
  defaultLeftMetric: "714M CAPACITY",
  defaultRightMetric: "DRAWDOWN",
  defaultStages: [
    { label: "Max Release Rate", metric: "4.4M BBL / DAY", detail: "Emergency presidential drawdown ceiling", tone: "brick" },
    { label: "Cavern Creep Constraint", metric: "GEOMECHANICAL", detail: "Salt wall closure narrows storage volume", tone: "navy" },
    { label: "Reinjection Throttle", metric: "~100K BBL / DAY", detail: "Asymmetric refill pace at Gulf terminals", tone: "teal" },
  ],
});

export const GridFrequencyDroopGovernor = createParametricSimulator({
  archetype: "rotary-governor",
  defaultEyebrow: "SYNCHRONOUS INERTIA",
  defaultTitle: "60.00 Hz Turbine Flywheel Inertia vs Under-Frequency Load Shed",
  defaultSubtitle: "Retiring spinning steam turbines thins rotational inertia, narrowing the milliseconds before automatic blackouts.",
  defaultSource: "SOURCE: ERCOT & NERC FREQUENCY RESPONSE ANNUAL TELEMETRY",
  defaultMetric: "59.40 Hz TRIP",
  defaultLabel: "STABILITY MARGIN",
  defaultLeftMetric: "60.00 Hz",
  defaultRightMetric: "59.40 Hz",
  defaultStages: [
    { label: "Spinning Mass Buffer", metric: "148 GW·s", detail: "Kinetic energy stored in synchronous rotors", tone: "navy" },
    { label: "RoCoF Decay Slope", metric: "-0.45 Hz / s", detail: "Rate of change of frequency after plant trip", tone: "brick" },
    { label: "UFLS Relay Relay", metric: "400 ms", detail: "Automatic feeder disconnect to save grid", tone: "teal" },
  ],
});

export const FlywheelMomentumClutch = createParametricSimulator({
  archetype: "rotary-governor",
  defaultEyebrow: "CAPITAL-LABOR DECOUPLING",
  defaultTitle: "Compounding Equity Flywheel Disengaged From Household Wage Shaft",
  defaultSubtitle: "Once productive output decouples from headcount, corporate earnings spin faster while the payroll clutch slips.",
  defaultSource: "SOURCE: BLS PRODUCTIVITY vs REAL HOURLY COMPENSATION SERIES",
  defaultMetric: "0.08 COUPLING",
  defaultLabel: "SLIP-CLUTCH RATIO",
  defaultLeftMetric: "S&P EPS +19%",
  defaultRightMetric: "WAGE +0.4%",
  defaultStages: [
    { label: "Compute CapEx Torque", metric: "$320B / YR", detail: "Hyperscaler autonomous infrastructure spend", tone: "teal" },
    { label: "Headcount Elasticity", metric: "DECOUPLED", detail: "Revenue per employee hits $2.8M+", tone: "brick" },
    { label: "Buyback Re-Injection", metric: "$980B / YR", detail: "Earnings recycled directly into share count", tone: "navy" },
  ],
});

export const HydraulicSiphonValve = createParametricSimulator({
  archetype: "hydraulic-reservoir",
  defaultEyebrow: "VENTURI VALUE EXTRACTION",
  defaultTitle: "Platform Toll Siphon: Automatic Fee Skim Across Captive Rails",
  defaultSubtitle: "Once merchant switching costs cross the prime threshold, platform take-rates extract margin passively.",
  defaultSource: "SOURCE: ANTITRUST MARKETPLACE FEE DISCLOSURES & MERCHANT FILINGS",
  defaultMetric: "30% TAKE RATE",
  defaultLabel: "PASSIVE SIPHON SKIM",
  defaultLeftMetric: "MERCHANT POOL",
  defaultRightMetric: "30% RENT",
  defaultStages: [
    { label: "App & Ad Tax", metric: "15%–30%", detail: "Mandatory in-app billing & sponsored placement", tone: "brick" },
    { label: "Switching Lock-In", metric: "94% RETENTION", detail: "Customer graph trapped inside ecosystem", tone: "navy" },
    { label: "Net Merchant Margin", metric: "6.2% RESIDUAL", detail: "Operating cash left to physical supplier", tone: "teal" },
  ],
});

export const MarginCallDominoCascade = createParametricSimulator({
  archetype: "cascade-ratchet",
  defaultEyebrow: "FORCED DELEVERAGING",
  defaultTitle: "Cross-Collateralized Margin Dominoes Topple Into Illiquid Bids",
  defaultSubtitle: "Automated mark-to-market collateral calls trigger forced selling across progressively higher leverage tiers.",
  defaultSource: "SOURCE: BIS QUARTERLY REVIEW & PRIME BROKERAGE MARGIN TELEMETRY",
  defaultMetric: "20x -> FORCED",
  defaultLabel: "LIQUIDATION CASCADE",
  defaultLeftMetric: "5x TIER",
  defaultRightMetric: "20x WIPEOUT",
  defaultStages: [
    { label: "Initial Haircut Breach", metric: "-8% SPOT", detail: "Variation margin call issued within 2 hours", tone: "navy" },
    { label: "Bid-Ask Liquidity Vacuum", metric: "4.8x SPREAD", detail: "Market makers widen quotes during stress", tone: "brick" },
    { label: "Cross-Asset Contagion", metric: "CORR -> 0.96", detail: "Liquid winners sold to cover illiquid marks", tone: "teal" },
  ],
});

export const EscapementRatchetPawn = createParametricSimulator({
  archetype: "cascade-ratchet",
  defaultEyebrow: "ONE-WAY NOMINAL RATCHET",
  defaultTitle: "Pawl-and-Ratchet Pricing: Upward Surges Lock, Downward Resets Block",
  defaultSubtitle: "Insurance, property taxes, and debt contracts click upward during booms while mechanical pawls block downward relief.",
  defaultSource: "SOURCE: BUREAU OF LABOR STATISTICS STICKY-PRICE CPI SERIES",
  defaultMetric: "0% ROLLBACK",
  defaultLabel: "DOWNWARD RIGIDITY",
  defaultLeftMetric: "UPWARD CLICK",
  defaultRightMetric: "PAWL LOCKED",
  defaultStages: [
    { label: "Municipal Assessment", metric: "+38% LOCK", detail: "Taxable value ratchets on peak comps", tone: "brick" },
    { label: "Contractual Escalator", metric: "+3.5% / YR", detail: "Built-in lease & SaaS renewal step-ups", tone: "navy" },
    { label: "Wage-Price Divergence", metric: "-19% GAP", detail: "Household income falls behind sticky fixed bills", tone: "teal" },
  ],
});

export const EurodollarOffshoreFunnel = createParametricSimulator({
  archetype: "hydraulic-reservoir",
  defaultEyebrow: "SHADOW DOLLAR PLUMBING",
  defaultTitle: "Offshore Eurodollar Ledger: Multi-Trillion Dollar Debt Outside Fed Sight",
  defaultSubtitle: "Foreign banks create dollar-denominated liabilities offshore, scrambling domestic liquidity when FX swaps tighten.",
  defaultSource: "SOURCE: BANK FOR INTERNATIONAL SETTLEMENTS GLOBAL LIQUIDITY INDICATORS",
  defaultMetric: "$65T+ SWAP DEBT",
  defaultLabel: "OFF-BALANCE FX OBLIGATIONS",
  defaultLeftMetric: "ONSHORE FED",
  defaultRightMetric: "EURODOLLAR",
  defaultStages: [
    { label: "FX Swap Footnote Debt", metric: "$65.0T+", detail: "Unrecorded on standard GAAP balance sheets", tone: "brick" },
    { label: "Collateral Velocity", metric: "2.7x RE-USE", detail: "Same Treasury bill pledged across repo chains", tone: "navy" },
    { label: "Central Bank Swap Line", metric: "EMERGENCY", detail: "Fed backstop required when offshore bids vanish", tone: "teal" },
  ],
});

export const MineralRefiningBottleneck = createParametricSimulator({
  archetype: "industrial-queue",
  defaultEyebrow: "MIDSTREAM CHEMICAL CHOKEPOINT",
  defaultTitle: "Dispersed Mine-Head Ore Funnels Into 85% Single-Country Refining",
  defaultSubtitle: "Opening new lithium, cobalt, or rare-earth mines still routes concentrate through the same midstream solvent-extraction furnaces.",
  defaultSource: "SOURCE: INTERNATIONAL ENERGY AGENCY CRITICAL MINERALS OUTLOOK",
  defaultMetric: "87% REFINING",
  defaultLabel: "MIDSTREAM CONCENTRATION",
  defaultLeftMetric: "GLOBAL MINES",
  defaultRightMetric: "SINGLE FURNACE",
  defaultStages: [
    { label: "Rare-Earth Separation", metric: "90% SHARE", detail: "Heavy dysprosium & terbium solvent stages", tone: "brick" },
    { label: "Anode GraphiteSpherical", metric: "93% SHARE", detail: "Hydrofluoric purification for EV & grid cells", tone: "navy" },
    { label: "Western Refinery Permit", metric: "7–12 YEARS", detail: "Tailings & chemical discharge approval lag", tone: "teal" },
  ],
});

export const DemographicDependencyPyramid = createParametricSimulator({
  archetype: "truss-tollgate",
  defaultEyebrow: "ACTUARIAL LOAD TRUSS",
  defaultTitle: "Inverted Demographic Truss: Two Workers Supporting Each Retiree",
  defaultSubtitle: "Pay-as-you-go entitlement math built for five workers per retiree fractures as fertility drops and longevity rises.",
  defaultSource: "SOURCE: SOCIAL SECURITY TRUSTEES REPORT & UN POPULATION DIVISION",
  defaultMetric: "2.1 : 1 RATIO",
  defaultLabel: "WORKER-TO-BENEFICIARY",
  defaultLeftMetric: "SHRINKING PAYROLL",
  defaultRightMetric: "GROWING COHORT",
  defaultStages: [
    { label: "1960 Baseline Truss", metric: "5.1 : 1", detail: "Five covered W-2 workers per retiree check", tone: "teal" },
    { label: "2033 Trust Depletion", metric: "-21% AUTO-CUT", detail: "Statutory benefit haircut absent new funding", tone: "brick" },
    { label: "AI Payroll Erosion", metric: "ACCELERATED", detail: "Fewer human hours shrink FICA tax base faster", tone: "navy" },
  ],
});

export const InsuranceRiskPoolOverflow = createParametricSimulator({
  archetype: "hydraulic-reservoir",
  defaultEyebrow: "ACTUARIAL INSOLVENCY SPILLWAY",
  defaultTitle: "Private Carriers Exit High-Risk ZIP Codes Into State FAIR Plans",
  defaultSubtitle: "Reinsurance repricing and Replacement-Cost surges push uninsurable tail exposure onto public balance sheets.",
  defaultSource: "SOURCE: NAIC PROPERTY CASUALTY REPORT & STATE FAIR PLAN EXPOSURE DATA",
  defaultMetric: "$458B EXPOSED",
  defaultLabel: "STATE BACKSTOP POOL",
  defaultLeftMetric: "PRIVATE POOL",
  defaultRightMetric: "FAIR PLAN",
  defaultStages: [
    { label: "Reinsurance Treaty Hike", metric: "+37% RATE", detail: "Global catastrophe capital reprices tail events", tone: "brick" },
    { label: "Non-Renewal Surge", metric: "2.9x EXITS", detail: "Admitted carriers halt new policies", tone: "navy" },
    { label: "Mortgage Escrow Shock", metric: "+$410 / MO", detail: "Forced-placed coverage hits fixed-debt owners", tone: "teal" },
  ],
});

export const MunicipalBondTollgate = createParametricSimulator({
  archetype: "truss-tollgate",
  defaultEyebrow: "SENIOR REVENUE COVENANT",
  defaultTitle: "Municipal Infrastructure Tollgate: Senior Debt Skims Before Repairs",
  defaultSubtitle: "Gross-pledge revenue covenants divert utility and transit fees to bondholders ahead of deferred physical maintenance.",
  defaultSource: "SOURCE: MSRB EMMA OFFICIAL STATEMENTS & ASCE INFRASTRUCTURE REPORT",
  defaultMetric: "1.25x DSCR",
  defaultLabel: "COVENANT COVERAGE LOCK",
  defaultLeftMetric: "RATEPAYER FEES",
  defaultRightMetric: "BOND TRUSTEE",
  defaultStages: [
    { label: "Trustee Lockbox Skim", metric: "FIRST LIEN", detail: "Gross receipts swept prior to O&M payroll", tone: "brick" },
    { label: "Deferred Capex Backlog", metric: "$2.6T GAP", detail: "Aging water mains, substations & bridge decks", tone: "navy" },
    { label: "Tax-Base Shrinkage Risk", metric: "DOWNGRADE", detail: "Commercial vacancy widens per-household burden", tone: "teal" },
  ],
});

export const SYSTEM_SIMULATOR_STYLES: readonly SystemSimulatorRecipe[] = [
  { id: "supply-chain-bom-strip", name: "Supply-Chain BOM Wage Vaporizer", componentName: "SupplyChainBomStrip", defaultFraming: "fullscreen-cutaway", description: "$120 retail bill-of-materials decomposed into 80% human hours vaporizing down to the $24 raw-atom and electricity plinth." },
  { id: "palo-alto-whiteboard-flip", name: "Palo Alto Whiteboard to Cast-Iron Debt Flip", componentName: "PaloAltoWhiteboardFlip", defaultFraming: "fullscreen-cutaway", description: "3D Y-axis mechanical flip from 'Falling Prices = Abundance' whiteboard to bolted 30-year fixed loan contract." },
  { id: "dual-tax-plumbing-schematic", name: "Dual Tax Plumbing & Withholding Guillotine", componentName: "DualTaxPlumbingSchematic", defaultFraming: "fullscreen-cutaway", description: "Top W-2 payroll pipe sliced by automatic withholding guillotine vs bottom corporate pipe routing through 3 statutory bypass valves." },
  { id: "sovereign-priority-spillway", name: "Three-Tier Sovereign Priority Spillway Dam", componentName: "SovereignPrioritySpillway", defaultFraming: "fullscreen-cutaway", description: "Hydroelectric fiscal dam paying $2.1T bondholders and statutory defense/entitlements first, starving citizen dividend basin below." },
  { id: "split-era-strike-diptych", name: "1955 Pier Walkout vs 2034 Robotic Port Diptych", componentName: "SplitEraStrikeDiptych", defaultFraming: "fullscreen-cutaway", description: "Synchronized comparison between 1955 frozen pier bleeding owner cash and 2034 99.9%-uptime automated port." },
  { id: "logarithmic-wattage-ladder", name: "Logarithmic Wattage Scale Comparator", componentName: "LogarithmicWattageLadder", defaultFraming: "fullscreen-cutaway", description: "10W phone brick to 1kW microwave to 1GW nuclear unit to 5GW frontier AI campus (= 5 major cities)." },
  { id: "velocity-mismatch-chronometer", name: "Software vs 765kV Grid Velocity Chronometer", componentName: "VelocityMismatchChronometer", defaultFraming: "fullscreen-cutaway", description: "6-month coding agent release clock racing against 5-to-10-year high-voltage transmission permitting checkpoints." },
  { id: "circular-accounting-loop", name: "Circular AI Vendor Financing Carousel", componentName: "CircularAccountingLoop", defaultFraming: "fullscreen-cutaway", description: "Closed 3-node Nvidia <-> Neocloud SPV <-> GPU-backed debt revenue and collateral loop." },
  { id: "asymmetric-exchange-simulator", name: "Asymmetric Naval Cost-Exchange Simulator", componentName: "AsymmetricExchangeSimulator", defaultFraming: "fullscreen-cutaway", description: "$20k drone swarm waves depleting a $13B carrier strike group's $4.2M VLS interceptor magazine." },
  { id: "subsea-cable-cross-section", name: "Subsea Fiber Armor Cross-Section & Anchor Cut", componentName: "SubseaCableCrossSection", defaultFraming: "fullscreen-cutaway", description: "Concentric 21mm submarine cable anatomy carrying $10T/day across ~550 cables with anchor severance animation." },
  { id: "lithography-node-lock", name: "Lithography Node Gap & EUV Remote Lock", componentName: "LithographyNodeLock", defaultFraming: "fullscreen-cutaway", description: "Phoenix 4nm trailing fab vs Taiwan 2nm/A16 nanosheet fab paired with ASML EUV remote telemetry breaker." },
  { id: "cantilever-balance-scale", name: "Asset-Deflation Cantilever Fulcrum Scale", componentName: "CantileverBalanceScale", defaultFraming: "fullscreen-cutaway", description: "Precision torque balance tipping under fixed nominal debt as real household cash inflows compress." },
  { id: "transformer-queue-bottleneck", name: "Large Power Transformer Manufacturing Queue", componentName: "TransformerQueueBottleneck", defaultFraming: "fullscreen-cutaway", description: "500 MVA step-up transformer 48–60 month lead-time backlog and GOES electrical steel bottleneck." },
  { id: "water-cooling-evaporation-tower", name: "Hyperscale Evaporative Cooling Aquifer Draw", componentName: "WaterCoolingEvaporationTower", defaultFraming: "fullscreen-cutaway", description: "Data-center chiller evaporative plume draw competing directly against municipal potable aquifers." },
  { id: "container-chokepoint-lock", name: "Maritime Canal Lock Draft & Slot Auction", componentName: "ContainerChokepointLock", defaultFraming: "fullscreen-cutaway", description: "Stepped freshwater canal lock capacity cap with priority transit bid clearing and detour penalty." },
  { id: "strategic-reserve-caverns", name: "Strategic Salt-Dome Reserve Drawdown Manifold", componentName: "StrategicReserveCaverns", defaultFraming: "fullscreen-cutaway", description: "Subterranean salt-dome storage caverns contrasting rapid emergency release against slow geomechanical refill." },
  { id: "grid-frequency-droop-governor", name: "60Hz Synchronous Inertia & Droop Governor", componentName: "GridFrequencyDroopGovernor", defaultFraming: "fullscreen-cutaway", description: "Spinning turbine rotor inertia gauge approaching the 59.40 Hz automatic load-shedding relay threshold." },
  { id: "flywheel-momentum-clutch", name: "Capital-Labor Decoupling Slip-Clutch Flywheel", componentName: "FlywheelMomentumClutch", defaultFraming: "over-footage", description: "High-RPM compounding equity flywheel mechanically disengaged from a stagnant household payroll shaft." },
  { id: "hydraulic-siphon-valve", name: "Platform Take-Rate Venturi Siphon", componentName: "HydraulicSiphonValve", defaultFraming: "over-footage", description: "Captive marketplace Venturi siphon passively skimming 30% rent from merchant cash pools." },
  { id: "margin-call-domino-cascade", name: "Cross-Collateralized Margin Domino Cascade", componentName: "MarginCallDominoCascade", defaultFraming: "fullscreen-cutaway", description: "Leveraged collateral blocks toppling sequentially from 5x to 20x into illiquid order books." },
  { id: "escapement-ratchet-pawn", name: "One-Way Nominal Price & Tax Ratchet", componentName: "EscapementRatchetPawn", defaultFraming: "over-footage", description: "Pawl-and-ratchet gear clicking upward on assessments and insurance while blocking downward resets." },
  { id: "eurodollar-offshore-funnel", name: "Offshore Eurodollar FX Swap Plumbing", componentName: "EurodollarOffshoreFunnel", defaultFraming: "fullscreen-cutaway", description: "$65T+ off-balance-sheet FX swap dollar debt and Treasury collateral re-use outside domestic reserve sight." },
  { id: "mineral-refining-bottleneck", name: "Critical Mineral Midstream Refining Furnace", componentName: "MineralRefiningBottleneck", defaultFraming: "fullscreen-cutaway", description: "Multi-continent mine-head ore converging through an 87% single-country chemical refining chokepoint." },
  { id: "demographic-dependency-pyramid", name: "Inverted Demographic Load-Bearing Truss", componentName: "DemographicDependencyPyramid", defaultFraming: "fullscreen-cutaway", description: "2.1-to-1 worker-to-beneficiary structural truss straining under expanding pay-as-you-go obligations." },
  { id: "insurance-risk-pool-overflow", name: "Actuarial Carrier Exit & FAIR Plan Spillway", componentName: "InsuranceRiskPoolOverflow", defaultFraming: "fullscreen-cutaway", description: "Private property insurance basin overflowing tail risk onto state insurer-of-last-resort pools." },
  { id: "municipal-bond-tollgate", name: "Municipal Gross-Pledge Debt Service Tollgate", componentName: "MunicipalBondTollgate", defaultFraming: "over-footage", description: "Bond trustee lockbox skimming ratepayer utility receipts ahead of deferred physical maintenance." },
] as const;
