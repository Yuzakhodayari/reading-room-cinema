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

export type UiSatireDisplayMode = "page" | "over-footage" | "card";

export interface UiSatireRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
}

export interface UiSatireBaseProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  sourceCitation?: string;
  badgeText?: string;
  paletteMode?: "page" | "over-footage";
  mode?: UiSatireDisplayMode;
  register?: RegisterId;
  atFrame?: number;
}

interface UiSatireTheme {
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
  cardBg: string;
  cardBorder: string;
  wellBg: string;
  solidPanelBg: string;
  solidPanelInk: string;
  solidPanelMuted: string;
  riskBg: string;
  riskBorder: string;
  highlightWash: string;
}

function resolveSatireRegister(register?: RegisterId): RegisterPalette {
  return REGISTERS[register ?? "page_editorial"];
}

function getUiSatireTheme(
  isGlass: boolean,
  isCompact: boolean,
  reg: RegisterPalette
): UiSatireTheme {
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
      cardBg: "rgba(15, 25, 35, 0.58)",
      cardBorder: OVER_FOOTAGE_PALETTE.glassBorder,
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
    cardBg: reg.bg.elevated,
    cardBorder: reg.rule.hairline,
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
        <tspan key={`sat-wl-${idx}`} x={x} dy={idx === 0 ? 0 : wrapped.lineHeightPx}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

interface UiSatireShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  sourceCitation: string;
  badgeText?: string;
  mode?: UiSatireDisplayMode;
  paletteMode?: "page" | "over-footage";
  register?: RegisterId;
  atFrame?: number;
  renderStage: (theme: UiSatireTheme, elapsed: number, fps: number) => React.ReactNode;
}

const UiSatireShell: React.FC<UiSatireShellProps> = ({
  eyebrow,
  title,
  subtitle,
  sourceCitation,
  badgeText,
  mode,
  paletteMode = "page",
  register,
  atFrame = 0,
  renderStage,
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

  const resolvedMode: UiSatireDisplayMode =
    mode ?? (paletteMode === "over-footage" ? "over-footage" : "page");
  const isGlass = resolvedMode === "over-footage";
  const isCompact = resolvedMode !== "page";
  const reg = resolveSatireRegister(register);
  const theme = getUiSatireTheme(isGlass, isCompact, reg);

  if (resolvedMode !== "page") {
    return (
      <div
        style={{
          position: "relative",
          width: "640px",
          background: isGlass ? OVER_FOOTAGE_PALETTE.glassPrimary : reg.bg.elevated,
          backdropFilter: isGlass ? "blur(14px) saturate(160%)" : undefined,
          WebkitBackdropFilter: isGlass ? "blur(14px) saturate(160%)" : undefined,
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
          {badgeText && (
            <span
              style={{
                ...TABULAR_NUM_STYLE,
                fontFamily: FONTS.mono,
                fontSize: "13px",
                fontWeight: 700,
                color: theme.accentTeal,
                backgroundColor: isGlass ? OVER_FOOTAGE_PALETTE.glassDarkWell : reg.bg.recessed,
                border: `1px solid ${isGlass ? OVER_FOOTAGE_PALETTE.glassInnerHairline : reg.rule.hairline}`,
                padding: "3px 10px",
                borderRadius: "4px",
                flexShrink: 0,
              }}
            >
              {badgeText}
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
            backgroundColor: theme.cardBg,
            border: `1px solid ${isGlass ? OVER_FOOTAGE_PALETTE.glassInnerHairline : reg.rule.hairline}`,
            borderRadius: "12px",
            padding: "11px",
          }}
        >
          {renderStage(theme, elapsed, fps)}
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
        <div style={{ maxWidth: "1300px" }}>
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

        {badgeText && (
          <div
            style={{
              position: "relative",
              padding: "12px 22px",
              backgroundColor: reg.bg.elevated,
              border: `1px solid ${reg.rule.hairline}`,
              borderLeft: `4px solid ${reg.accent.liability}`,
              borderRadius: "8px",
              fontFamily: FONTS.mono,
              fontSize: "18px",
              fontWeight: 700,
              color: reg.accent.liability,
              boxShadow: dualShadow,
              flexShrink: 0,
              ...TABULAR_NUM_STYLE,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "14px",
                bottom: "10px",
                height: "14px",
                width: `calc(${highlightSweep}% - 28px)`,
                maxWidth: "calc(100% - 28px)",
                backgroundColor: reg.accent.highlighterWash,
                borderRadius: "3px",
                zIndex: 0,
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>{badgeText}</span>
          </div>
        )}
      </div>

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
        {renderStage(theme, elapsed, fps)}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${reg.rule.hairline}`,
          paddingTop: "12px",
          fontFamily: FONTS.mono,
          fontSize: "12.5px",
          color: reg.ink.muted,
          ...TABULAR_NUM_STYLE,
        }}
      >
        <span>{sourceCitation}</span>
        <span>EXHIBIT ARCHIVE · HOUSEHOLD & CONSUMER MECHANICS</span>
      </div>
    </div>
  );
};

// ============================================================================
// 1. LongitudinalHouseholdDossier (Claire's Austin House + 2025->2036 T-Account)
// ============================================================================
export interface HouseholdEraSnapshot {
  year: string;
  statusTag: string;
  monthlyInflow: string;
  fixedMortgageLock: string;
  auxiliaryShock: string;
  verdictNote: string;
}

export interface LongitudinalHouseholdDossierProps extends UiSatireBaseProps {
  activeStage?: 0 | 1 | 2 | 3;
  snapshots?: readonly HouseholdEraSnapshot[];
}

const CLAIRE_AUSTIN_SNAPSHOTS: readonly HouseholdEraSnapshot[] = [
  {
    year: "2025 BASELINE",
    statusTag: "PRIME BORROWER · 28% DTI",
    monthlyInflow: "$11,830 / MO W-2",
    fixedMortgageLock: "$3,400 / MO FIXED LOCK",
    auxiliaryShock: "ESCROW + TAXES NORMAL",
    verdictNote: "30-yr Austin lien signed against white-collar salary.",
  },
  {
    year: "2030 REPRICING",
    statusTag: "-70% FEE CUT · REFI DENIED",
    monthlyInflow: "$3,550 / MO COMPRESSED",
    fixedMortgageLock: "$3,400 / MO UNCHANGED",
    auxiliaryShock: "REFI REJECTED (DTI 95.8%)",
    verdictNote: "Income reprices to AI rate; mortgage principal refuses to budge.",
  },
  {
    year: "2032 LOCKBOX",
    statusTag: "$45K 401(k) PENALTY WALL",
    monthlyInflow: "$3,550 / MO",
    fixedMortgageLock: "$3,400 / MO",
    auxiliaryShock: "$45K LOCKED (-10% + TAX)",
    verdictNote: "Retirement savings trapped behind early-withdrawal statutory haircut.",
  },
  {
    year: "OCT 2036",
    statusTag: "HOUSE KEPT · AUGUST A/C SHOCK",
    monthlyInflow: "$3,800 STIPEND FLOOR",
    fixedMortgageLock: "$3,400 / MO",
    auxiliaryShock: "$610 / MO AUSTIN 106°F ERCOT",
    verdictNote: "Solvent on paper until August peak kWh surge breaks zero-margin budget.",
  },
];

export const LongitudinalHouseholdDossier: React.FC<LongitudinalHouseholdDossierProps> = ({
  activeStage,
  snapshots = CLAIRE_AUSTIN_SNAPSHOTS,
  eyebrow = "CASE FILE ENT_CLAIRE_AUSTIN · TRAVIS COUNTY, TX",
  title = "Claire's Balance Sheet (2025–2036): Deflating Wages vs $3,400 Fixed Lien",
  subtitle = "Tracking one Austin homeowner across eleven years of white-collar repricing, refinance denial, locked 401(k) equity, and ERCOT summer bills.",
  sourceCitation = "SOURCE: COMPOSITE HOUSEHOLD BALANCE-SHEET SIMULATION · TRAVIS COUNTY TAX & ERCOT TARIFFS",
  badgeText = "CASE #TX-2025-36",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <UiSatireShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    badgeText={badgeText}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderStage={(theme, elapsed) => {
      const stageIdx =
        activeStage !== undefined
          ? activeStage
          : (Math.min(3, Math.floor(elapsed / 42)) as 0 | 1 | 2 | 3);

      if (theme.isCompact) {
        const cur = snapshots[stageIdx] ?? snapshots[0];
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="8" width="548" height="106" rx="10" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="2" />
            <FittedSvgText
              text={`${cur.year} · ${cur.statusTag}`}
              x={24}
              y={34}
              maxWidth={516}
              fontSize={15}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.accentAlert}
            />
            <FittedSvgText
              text={`IN: ${cur.monthlyInflow}`}
              x={24}
              y={66}
              maxWidth={250}
              fontSize={18}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.accentTeal}
              style={TABULAR_NUM_STYLE}
            />
            <FittedSvgText
              text={`OUT: ${cur.fixedMortgageLock}`}
              x={540}
              y={66}
              maxWidth={250}
              fontSize={18}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.accentAlert}
              textAnchor="end"
              style={TABULAR_NUM_STYLE}
            />
            <FittedSvgText
              text={cur.auxiliaryShock}
              x={24}
              y={96}
              maxWidth={516}
              fontSize={15}
              fontFamily={FONTS.sans}
              fontWeight={700}
              fill={theme.inkHeadline}
            />
            {snapshots.map((sn, idx) => {
              const y = 130 + idx * 54;
              const isCur = idx === stageIdx;
              return (
                <g key={`cl-c-${idx}`} transform={`translate(8, ${y})`}>
                  <rect
                    width="548"
                    height="46"
                    rx="8"
                    fill={isCur ? theme.solidPanelBg : theme.wellBg}
                    stroke={isCur ? theme.accentAlert : theme.cardBorder}
                    strokeWidth={isCur ? "2" : "1.2"}
                  />
                  <FittedSvgText
                    text={sn.year}
                    x={16}
                    y={28}
                    maxWidth={154}
                    fontSize={15}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={isCur ? theme.solidPanelInk : theme.inkHeadline}
                  />
                  <FittedSvgText
                    text={sn.monthlyInflow}
                    x={365}
                    y={28}
                    maxWidth={165}
                    fontSize={15}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={isCur ? theme.accentTeal : theme.inkMuted}
                    textAnchor="end"
                    style={TABULAR_NUM_STYLE}
                  />
                  <FittedSvgText
                    text={sn.fixedMortgageLock.replace(" FIXED LOCK", "")}
                    x={532}
                    y={28}
                    maxWidth={155}
                    fontSize={15}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={theme.accentAlert}
                    textAnchor="end"
                    style={TABULAR_NUM_STYLE}
                  />
                </g>
              );
            })}
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left: Austin House Architectural Elevation */}
          <rect x="36" y="42" width="560" height="536" rx="14" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2.2" />
          <FittedSvgText
            text="PROPERTY ELEVATION · SOUTH AUSTIN BUNGALOW"
            x={68}
            y={88}
            maxWidth={496}
            fontSize={14}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
          />

          {/* Gabled Roof + Austin Sun / A/C Condenser */}
          <polygon points="110,270 316,142 522,270" fill={PAGE_PALETTE.navy} />
          <rect x="146" y="270" width="340" height="190" fill={theme.cardBg} stroke={theme.navyInk} strokeWidth="3" />
          <rect x="286" y="346" width="60" height="114" fill={theme.accentSlate} />
          <rect x="180" y="308" width="68" height="58" fill={stageIdx === 3 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary} opacity={0.85} />
          <rect x="384" y="308" width="68" height="58" fill={stageIdx === 3 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary} opacity={0.85} />

          {/* Exterior HVAC Condenser Unit */}
          <rect x="494" y="396" width="52" height="64" rx="4" fill={stageIdx === 3 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy} />
          <FittedSvgText
            text={`LIEN: $3,400/MO · ${snapshots[stageIdx].year}`}
            x={316}
            y={506}
            maxWidth={496}
            fontSize={18}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />
          <FittedSvgText
            text={snapshots[stageIdx].auxiliaryShock}
            x={316}
            y={538}
            maxWidth={496}
            fontSize={15}
            fontFamily={FONTS.sans}
            fontWeight={600}
            fill={theme.accentAlert}
            textAnchor="middle"
          />

          {/* Right: 4-Stage Longitudinal T-Account Ledger */}
          {snapshots.map((sn, idx) => {
            const isCurrent = idx === stageIdx;
            const y = 42 + idx * 136;
            return (
              <g key={`cl-era-${idx}`} transform={`translate(636, ${y})`}>
                <rect
                  width="888"
                  height="122"
                  rx="10"
                  fill={isCurrent ? (idx >= 1 ? theme.riskBg : theme.wellBg) : theme.wellBg}
                  stroke={isCurrent ? theme.riskBorder : theme.cardBorder}
                  strokeWidth={isCurrent ? "2.6" : "1.4"}
                />
                <FittedSvgText
                  text={`${sn.year} · ${sn.statusTag}`}
                  x={26}
                  y={34}
                  maxWidth={836}
                  fontSize={14}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={isCurrent ? theme.accentAlert : theme.inkMuted}
                />
                <FittedSvgText
                  text={`IN: ${sn.monthlyInflow}`}
                  x={26}
                  y={72}
                  maxWidth={396}
                  fontSize={22}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.accentTeal}
                  style={TABULAR_NUM_STYLE}
                />
                <FittedSvgText
                  text={`OUT: ${sn.fixedMortgageLock}`}
                  x={450}
                  y={72}
                  maxWidth={412}
                  fontSize={22}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.accentAlert}
                  style={TABULAR_NUM_STYLE}
                />
                <FittedSvgText
                  text={sn.verdictNote}
                  x={26}
                  y={104}
                  maxWidth={836}
                  fontSize={15}
                  fontFamily={FONTS.sans}
                  fontWeight={600}
                  fill={theme.inkHeadline}
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
// 2. PerishableSeatVsComputeSplit (Empty Seat 14A vs Expiring Tuesday GPU Clock)
// ============================================================================
export interface PerishableSeatVsComputeSplitProps extends UiSatireBaseProps {
  seatCode?: string;
  gpuWindowLabel?: string;
}

export const PerishableSeatVsComputeSplit: React.FC<PerishableSeatVsComputeSplitProps> = ({
  seatCode = "SEAT 14A · CABIN DOOR LOCKED",
  gpuWindowLabel = "TUESDAY 02:00–06:00 GPU CLUSTER SLICE",
  eyebrow = "ZERO-INVENTORY ECONOMICS",
  title = "Why Compute Scrip Expires: An Unsold GPU Hour Is Airline Seat 14A",
  subtitle = "Once the jet pushes back from the gate, empty seat 14A can never be warehoused; idle H100 cycles vanish identically every second.",
  sourceCitation = "SOURCE: AIRLINE YIELD MANAGEMENT & HYPERSCALE CLUSTER UTILIZATION MODELS",
  badgeText = "PERISHABLE CAPACITY",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <UiSatireShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    badgeText={badgeText}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderStage={(theme, elapsed) => {
      const pushbackX = Math.min(90, elapsed * 0.8);
      const secLeft = Math.max(0, 59 - Math.floor(elapsed / 4));
      const padSec = secLeft < 10 ? `0${secLeft}` : `${secLeft}`;

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="8" width="264" height="332" rx="12" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
            <FittedSvgText
              text={seatCode}
              x={24}
              y={38}
              maxWidth={232}
              fontSize={15}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.inkHeadline}
            />
            {["14A", "14B"].map((st, idx) => {
              const isEmpty = st === "14A";
              return (
                <g key={`c-st-${st}`} transform={`translate(${28 + idx * 116}, 68)`}>
                  <rect
                    width="104"
                    height="156"
                    rx="12"
                    fill={isEmpty ? theme.riskBg : theme.solidPanelBg}
                    stroke={isEmpty ? theme.riskBorder : theme.navyInk}
                    strokeWidth="2.5"
                    strokeDasharray={isEmpty ? "6 5" : undefined}
                  />
                  <text x="52" y="76" textAnchor="middle" fontFamily={FONTS.mono} fontSize="24" fontWeight="700" fill={isEmpty ? theme.accentAlert : theme.solidPanelInk}>
                    {st}
                  </text>
                  <FittedSvgText
                    text={isEmpty ? "UNSOLD $0" : "OCCUPIED"}
                    x={52}
                    y={114}
                    maxWidth={90}
                    fontSize={14}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={isEmpty ? theme.accentAlert : theme.accentTeal}
                    textAnchor="middle"
                  />
                </g>
              );
            })}
            <WrappedSvgText
              text="Cannot be stored in a warehouse for Friday peak."
              x={24}
              y={268}
              maxWidth={232}
              fontSize={15}
              maxLines={2}
              fontFamily={FONTS.sans}
              fontWeight={700}
              fill={theme.accentAlert}
            />

            <rect x="292" y="8" width="264" height="332" rx="12" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2" />
            <FittedSvgText
              text={gpuWindowLabel}
              x={308}
              y={38}
              maxWidth={232}
              fontSize={15}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.accentTeal}
            />
            <circle cx="424" cy="148" r="68" fill="none" stroke={OVER_FOOTAGE_PALETTE.brickRedText} strokeWidth="6" strokeDasharray="12 8" />
            <text x="424" y="152" textAnchor="middle" fontFamily={FONTS.mono} fontSize="24" fontWeight="700" fill={theme.solidPanelInk} style={TABULAR_NUM_STYLE}>
              00:00:{padSec}
            </text>
            <FittedSvgText
              text="TOKENS EVAPORATE"
              x={424}
              y={180}
              maxWidth={118}
              fontSize={13}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.brickRedText}
              textAnchor="middle"
            />
            <WrappedSvgText
              text="Dumps idle off-peak cycles at near-zero marginal cost."
              x={308}
              y={268}
              maxWidth={232}
              fontSize={15}
              maxLines={2}
              fontFamily={FONTS.sans}
              fontWeight={700}
              fill={theme.solidPanelInk}
            />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left: Airliner Cabin Row 14 */}
          <rect x="40" y="44" width="716" height="532" rx="14" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2.5" />
          <FittedSvgText
            text={`FLIGHT PUSHBACK · ${seatCode}`}
            x={76}
            y={92}
            maxWidth={644}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
          <g transform={`translate(${(110 + pushbackX).toFixed(1)}, 168)`}>
            {["14A", "14B", "14C"].map((st, idx) => {
              const isEmpty = st === "14A";
              return (
                <g key={st} transform={`translate(${idx * 164}, 0)`}>
                  <rect
                    width="138"
                    height="184"
                    rx="16"
                    fill={isEmpty ? theme.riskBg : theme.solidPanelBg}
                    stroke={isEmpty ? theme.riskBorder : theme.navyInk}
                    strokeWidth="3"
                    strokeDasharray={isEmpty ? "8 6" : undefined}
                  />
                  <text
                    x="69"
                    y="86"
                    textAnchor="middle"
                    fontFamily={FONTS.mono}
                    fontSize="26"
                    fontWeight="700"
                    fill={isEmpty ? theme.accentAlert : theme.solidPanelInk}
                  >
                    {st}
                  </text>
                  <FittedSvgText
                    text={isEmpty ? "UNSOLD · $0" : "OCCUPIED"}
                    x={69}
                    y={124}
                    maxWidth={118}
                    fontSize={13}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={isEmpty ? theme.accentAlert : OVER_FOOTAGE_PALETTE.accentPrimary}
                    textAnchor="middle"
                  />
                </g>
              );
            })}
          </g>
          <WrappedSvgText
            text="Cannot Be Stored in a Warehouse for Friday Peak Demand"
            x={76}
            y={496}
            maxWidth={644}
            fontSize={19}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.accentAlert}
          />

          {/* Right: Expiring Off-Peak GPU Window */}
          <rect x="804" y="44" width="716" height="532" rx="14" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2.5" />
          <FittedSvgText
            text={gpuWindowLabel}
            x={840}
            y={92}
            maxWidth={644}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.chartSecondary}
          />
          <circle cx="1162" cy="276" r="126" fill="none" stroke={OVER_FOOTAGE_PALETTE.brickRedText} strokeWidth="8" strokeDasharray="16 10" />
          <text x="1162" y="266" textAnchor="middle" fontFamily={FONTS.mono} fontSize="42" fontWeight="700" fill={theme.solidPanelInk} style={TABULAR_NUM_STYLE}>
            00:00:{padSec}
          </text>
          <FittedSvgText
            text="UNBURNED TOKENS EVAPORATE"
            x={1162}
            y={308}
            maxWidth={212}
            fontSize={14}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.brickRedText}
            textAnchor="middle"
          />
          <WrappedSvgText
            text="Issuing Expiring Credits Dumps Idle Off-Peak Cycles at Near-Zero Marginal Cost"
            x={840}
            y={490}
            maxWidth={644}
            fontSize={19}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.solidPanelInk}
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 3. ClosedComputeScripWallet (Documentary Wallet & Company-Scrip Satire Exhibit)
// ============================================================================
export interface ClosedComputeScripWalletProps extends UiSatireBaseProps {
  creditBalance?: string;
  cashHaircutPct?: string;
}

export const ClosedComputeScripWallet: React.FC<ClosedComputeScripWalletProps> = ({
  creditBalance = "100,000 COMPUTE CREDITS",
  cashHaircutPct = "-20% TOLLGATE HAIRCUT",
  eyebrow = "CLOSED-LOOP MONETARY RAILS",
  title = "Rich in API Tokens, Broke at the First-of-Month Mortgage Debit",
  subtitle = "Ecosystem credits clear at par inside captive partner walls, bounce at Chase rent ACH, and forfeit twenty percent at the exit booth.",
  sourceCitation = "SOURCE: CLOUD MARKETPLACE CREDIT TERMS & SECONDARY LIQUIDITY DISCOUNTS",
  badgeText = "$0.00 LEGAL TENDER",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <UiSatireShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    badgeText={badgeText}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderStage={(theme, elapsed, fps) => {
      const gaugeProg = interpolate(
        studioSpring(elapsed, fps, "cameraGlide", 14),
        [0, 1],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            {/* Compact Mobile Wallet Header */}
            <rect x="8" y="8" width="548" height="84" rx="10" fill={theme.solidPanelBg} stroke={theme.accentTeal} strokeWidth="2" />
            <FittedSvgText
              text="WALLET BALANCE · NON-TRANSFERABLE"
              x={24}
              y={34}
              maxWidth={310}
              fontSize={13}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.accentPrimary}
            />
            <FittedSvgText
              text={creditBalance}
              x={24}
              y={70}
              maxWidth={340}
              fontSize={22}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.solidPanelInk}
              style={TABULAR_NUM_STYLE}
            />
            <rect x="374" y="24" width="166" height="52" rx="8" fill="rgba(197, 163, 103, 0.22)" stroke="#C5A367" strokeWidth="1.5" />
            <FittedSvgText
              text="1912 COAL SCRIP"
              x={457}
              y={45}
              maxWidth={148}
              fontSize={12.5}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill="#F7C35C"
              textAnchor="middle"
            />
            <FittedSvgText
              text="-25% CASH DISCOUNT"
              x={457}
              y={65}
              maxWidth={148}
              fontSize={12.5}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.textHeadline}
              textAnchor="middle"
            />

            {/* Compact Itemized Decline Log */}
            {[
              { label: "Mortgage ACH", status: "DECLINED $0.00", alert: true },
              { label: "Property Tax", status: "BLOCKED", alert: true },
              { label: "Partner Delivery", status: "100% PAR", alert: false },
            ].map((row, idx) => {
              const ry = 104 + idx * 48;
              return (
                <g key={`c-wrow-${idx}`} transform={`translate(8, ${ry})`}>
                  <rect
                    width="548"
                    height="40"
                    rx="7"
                    fill={row.alert ? theme.riskBg : theme.wellBg}
                    stroke={row.alert ? theme.riskBorder : theme.accentTeal}
                    strokeWidth="1.5"
                  />
                  <FittedSvgText
                    text={row.label}
                    x={16}
                    y={26}
                    maxWidth={270}
                    fontSize={15}
                    fontFamily={FONTS.sans}
                    fontWeight={700}
                    fill={theme.inkHeadline}
                  />
                  <FittedSvgText
                    text={row.status}
                    x={532}
                    y={26}
                    maxWidth={220}
                    fontSize={15}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={row.alert ? theme.accentAlert : theme.accentTeal}
                    textAnchor="end"
                    style={TABULAR_NUM_STYLE}
                  />
                </g>
              );
            })}

            {/* Compact Captive-Rail Exit Gauge */}
            <rect x="8" y="254" width="548" height="86" rx="10" fill={theme.wellBg} stroke={theme.cardBorder} strokeWidth="1.6" />
            <FittedSvgText
              text="$1.00 Credit -> $0.80 Cash (-20% Toll)"
              x={24}
              y={280}
              maxWidth={516}
              fontSize={15}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.inkHeadline}
              style={TABULAR_NUM_STYLE}
            />
            <rect x="24" y="294" width="516" height="24" rx="6" fill={theme.cardBorder} />
            <rect x="24" y="294" width={412 * gaugeProg} height="24" rx="6" fill={theme.accentTeal} />
            <rect x={24 + 412 * gaugeProg} y="294" width={Math.max(0, 104 * gaugeProg)} height="24" rx="4" fill={theme.accentAlert} />
            <FittedSvgText
              text="$0.80 USD"
              x={36}
              y={312}
              maxWidth={140}
              fontSize={14}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.textHeadline}
            />
          </svg>
        );
      }

      const declineRows = [
        { item: "Mortgage ACH · Chase", result: "DECLINED $0.00", sub: "Error 402: Compute Scrip Not Accepted by County Tax or Bank", isAlert: true },
        { item: "Property Tax · Travis Co.", result: "BLOCKED", sub: "Statutory USD Treasury Settlement Only", isAlert: true },
        { item: "Partner Delivery & Cloud", result: "100% PAR", sub: "0.0% Fee Inside Approved Captive Wall", isAlert: false },
      ];

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left Realistic Mobile Scrip Wallet Bezel */}
          <rect x="36" y="20" width="504" height="580" rx="30" fill={PAGE_PALETTE.navyDeep} stroke={theme.navyInk} strokeWidth="3.5" />
          {/* Phone Top Speaker Notch & Status Bar */}
          <rect x="228" y="34" width="120" height="10" rx="5" fill="#2A3F54" />
          <FittedSvgText
            text="09:41 · CLOUDSCRIP OS"
            x={70}
            y={52}
            maxWidth={160}
            fontSize={11}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.accentPrimary}
          />
          <FittedSvgText
            text="CLOSED RAIL"
            x={506}
            y={52}
            maxWidth={120}
            fontSize={11}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.brickRedText}
            textAnchor="end"
          />

          {/* Balance Card inside Mobile Wallet */}
          <rect x="64" y="68" width="448" height="118" rx="14" fill="#162E47" stroke={OVER_FOOTAGE_PALETTE.accentPrimary} strokeWidth="1.5" />
          <FittedSvgText
            text="WALLET BALANCE · NON-TRANSFERABLE"
            x={88}
            y={98}
            maxWidth={400}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.accentPrimary}
          />
          <FittedSvgText
            text={creditBalance}
            x={88}
            y={146}
            maxWidth={400}
            fontSize={31}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            style={TABULAR_NUM_STYLE}
          />
          <FittedSvgText
            text="EXPIRES END OF BILLING QUARTER · NO ROLLOVER"
            x={88}
            y={172}
            maxWidth={400}
            fontSize={11.5}
            fontFamily={FONTS.mono}
            fontWeight={600}
            fill={OVER_FOOTAGE_PALETTE.textMuted}
          />

          {/* Itemized Decline Log Header */}
          <FittedSvgText
            text="SETTLEMENT ATTEMPT LEDGER"
            x={64}
            y={214}
            maxWidth={448}
            fontSize={12.5}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.accentWarm}
          />

          {/* 3 Itemized Decline / Approval Rows */}
          {declineRows.map((row, idx) => {
            const ry = 228 + idx * 100;
            return (
              <g key={`w-log-${idx}`} transform={`translate(64, ${ry})`}>
                <rect
                  width="448"
                  height="88"
                  rx="10"
                  fill={row.isAlert ? "rgba(163, 64, 46, 0.34)" : "rgba(47, 143, 139, 0.24)"}
                  stroke={row.isAlert ? OVER_FOOTAGE_PALETTE.brickRedText : OVER_FOOTAGE_PALETTE.chartSecondary}
                  strokeWidth="1.8"
                />
                <FittedSvgText
                  text={row.item}
                  x={18}
                  y={30}
                  maxWidth={228}
                  fontSize={16}
                  fontFamily={FONTS.sans}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                />
                <FittedSvgText
                  text={row.result}
                  x={430}
                  y={30}
                  maxWidth={176}
                  fontSize={16}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={row.isAlert ? OVER_FOOTAGE_PALETTE.brickRedText : OVER_FOOTAGE_PALETTE.chartSecondary}
                  textAnchor="end"
                  style={TABULAR_NUM_STYLE}
                />
                <WrappedSvgText
                  text={row.sub}
                  x={18}
                  y={54}
                  maxWidth={412}
                  fontSize={13}
                  minFontSize={10.5}
                  maxLines={2}
                  lineHeight={1.2}
                  fontFamily={FONTS.sans}
                  fontWeight={500}
                  fill={OVER_FOOTAGE_PALETTE.textBody}
                />
              </g>
            );
          })}

          {/* 1912 Coal Scrip Mini Parallel Badge inside Wallet Footer */}
          <rect x="64" y="534" width="448" height="46" rx="8" fill="rgba(197, 163, 103, 0.16)" stroke="#C5A367" strokeWidth="1.4" />
          <circle cx="90" cy="557" r="12" fill="#C5A367" stroke="#6E5225" strokeWidth="2" />
          <text x="90" y="561" textAnchor="middle" fontFamily={FONTS.mono} fontSize="10" fontWeight="700" fill="#271E15">
            ¢
          </text>
          <FittedSvgText
            text="1912 COAL SCRIP PARALLEL · -25% COMMISSARY DISCOUNT"
            x={112}
            y={562}
            maxWidth={386}
            fontSize={12.5}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill="#F7C35C"
          />

          {/* Right Top: Rail A (Captive Partners) */}
          <rect x="576" y="20" width="948" height="176" rx="14" fill={theme.wellBg} stroke={theme.accentTeal} strokeWidth="2.4" />
          <FittedSvgText
            text="RAIL A · CAPTIVE ECOSYSTEM PARTNERS (0.0% FEE)"
            x={612}
            y={58}
            maxWidth={876}
            fontSize={14}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentTeal}
          />
          <WrappedSvgText
            text="100% Face Value Inside Approved Cloud & Delivery Apps"
            x={612}
            y={104}
            maxWidth={876}
            fontSize={30}
            minFontSize={20}
            maxLines={2}
            lineHeight={1.16}
            fontFamily={FONTS.serif}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
          <FittedSvgText
            text="Revenue stays trapped on the issuer's consolidated income statement."
            x={612}
            y={170}
            maxWidth={876}
            fontSize={17}
            fontFamily={FONTS.sans}
            fontWeight={500}
            fill={theme.inkMuted}
          />

          {/* Right Middle: Rail B (External Fiat Exit Booth) */}
          <rect x="576" y="216" width="948" height="176" rx="14" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="2.4" />
          <FittedSvgText
            text={`RAIL B · EXTERNAL FIAT EXIT BOOTH (${cashHaircutPct})`}
            x={612}
            y={254}
            maxWidth={876}
            fontSize={14}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
          />
          <WrappedSvgText
            text="$0.80 on the Dollar Secondary Broker Conversion"
            x={612}
            y={300}
            maxWidth={876}
            fontSize={30}
            minFontSize={20}
            maxLines={2}
            lineHeight={1.16}
            fontFamily={FONTS.serif}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
          <FittedSvgText
            text="Paying off external bank debt triggers an immediate twenty-percent haircut."
            x={612}
            y={366}
            maxWidth={876}
            fontSize={17}
            fontFamily={FONTS.sans}
            fontWeight={600}
            fill={theme.inkBody}
          />

          {/* Right Bottom: Illustrated Captive-Rail Exit Gauge ($1.00 Credit -> $0.80 Cash) */}
          <rect x="576" y="414" width="948" height="186" rx="14" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2.2" />
          <FittedSvgText
            text="CAPTIVE-RAIL EXIT CONVERSION GAUGE"
            x={612}
            y={450}
            maxWidth={440}
            fontSize={13.5}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkMuted}
          />
          <FittedSvgText
            text="$1.00 Credit -> $0.80 Cash (-20% Toll)"
            x={1488}
            y={450}
            maxWidth={440}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.accentAlert}
            textAnchor="end"
            style={TABULAR_NUM_STYLE}
          />

          {/* Calibrated Gauge Bar */}
          <rect x="612" y="476" width="876" height="52" rx="8" fill={theme.cardBg} stroke={theme.cardBorder} strokeWidth="1.5" />
          <rect
            x="614"
            y="478"
            width={Math.max(4, 698 * gaugeProg)}
            height="48"
            rx="6"
            fill={PAGE_PALETTE.chartSecondary}
          />
          <rect
            x={614 + 698 * gaugeProg}
            y="478"
            width={Math.max(0, 174 * gaugeProg)}
            height="48"
            rx="6"
            fill={PAGE_PALETTE.brickRed}
          />
          <FittedSvgText
            text="NET CASH CLEARED: $0.80 USD (80%)"
            x={634}
            y={508}
            maxWidth={480}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            style={TABULAR_NUM_STYLE}
          />
          <FittedSvgText
            text="-20% TOLL"
            x={1474}
            y={508}
            maxWidth={150}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.textHeadline}
            textAnchor="end"
            style={TABULAR_NUM_STYLE}
          />

          {/* Gauge Ticks */}
          {[0, 0.25, 0.5, 0.8, 1].map((tick) => {
            const tx = 614 + tick * 872;
            const label = `$${tick.toFixed(2)}`;
            return (
              <g key={`gtick-${tick}`}>
                <line x1={tx} y1="532" x2={tx} y2="544" stroke={theme.inkMuted} strokeWidth="2" />
                <text
                  x={tx}
                  y="564"
                  textAnchor={tick === 1 ? "end" : tick === 0 ? "start" : "middle"}
                  fontFamily={FONTS.mono}
                  fontSize="13"
                  fontWeight="700"
                  fill={tick === 0.8 ? theme.accentAlert : theme.inkMuted}
                  style={TABULAR_NUM_STYLE}
                >
                  {label}
                </text>
              </g>
            );
          })}
          <FittedSvgText
            text="1912 Company Store Scrip Discount: -25%  |  2034 Compute Credit Exit Toll: -20%"
            x={612}
            y={586}
            maxWidth={876}
            fontSize={13.5}
            fontFamily={FONTS.mono}
            fontWeight={600}
            fill={theme.inkMuted}
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 4. CoalScripVsDigitalYuan (1912 Island Creek Brass Coin vs 2020 Shenzhen App)
// ============================================================================
export interface CoalScripVsDigitalYuanProps extends UiSatireBaseProps {
  leftArtifact?: string;
  rightArtifact?: string;
}

export const CoalScripVsDigitalYuan: React.FC<CoalScripVsDigitalYuanProps> = ({
  leftArtifact = "1912 · ISLAND CREEK COAL CO. BRASS SCRIP",
  rightArtifact = "2020 · SHENZHEN DIGITAL YUAN (e-CNY) PILOT",
  eyebrow = "HISTORICAL RHYME · COMPANY SCRIP 2.0",
  title = "Stamped Brass Tokens in 1912, Six-Day Expiring Wallets in 2020",
  subtitle = "A century separates West Virginia commissary coins from programmable smartphone vouchers, yet both enforce where and how fast you spend.",
  sourceCitation = "SOURCE: SMITHSONIAN NUMISMATIC COLLECTION & PBOC SHENZHEN LUOHU PILOT REPORT",
  badgeText = "108-YEAR RHYME",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <UiSatireShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    badgeText={badgeText}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderStage={(theme) => {
      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="8" width="264" height="332" rx="12" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
            <FittedSvgText text="1912 · COAL SCRIP" x={24} y={36} maxWidth={232} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkHeadline} />
            <circle cx="140" cy="146" r="78" fill="#C5A367" stroke="#6E5225" strokeWidth="5" />
            <circle cx="140" cy="146" r="64" fill="none" stroke="#6E5225" strokeWidth="1.5" strokeDasharray="5 5" />
            <FittedSvgText text="$1.00 SCRIP" x={140} y={142} maxWidth={112} fontSize={18} fontFamily={FONTS.mono} fontWeight={700} fill="#271E15" textAnchor="middle" />
            <FittedSvgText text="-25% CASH" x={140} y={168} maxWidth={112} fontSize={13} fontFamily={FONTS.mono} fontWeight={700} fill={PAGE_PALETTE.brickRed} textAnchor="middle" />
            <WrappedSvgText
              text="Valid only at company store. Outlawed 1938."
              x={24}
              y={268}
              maxWidth={232}
              fontSize={15}
              maxLines={2}
              fontFamily={FONTS.sans}
              fontWeight={700}
              fill={theme.inkHeadline}
            />

            <rect x="292" y="8" width="264" height="332" rx="12" fill={theme.solidPanelBg} stroke={theme.accentAlert} strokeWidth="2" />
            <FittedSvgText text="2020 · DIGITAL YUAN" x={308} y={36} maxWidth={232} fontSize={15} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.brickRedText} />
            <rect x="322" y="64" width="204" height="162" rx="14" fill="rgba(163, 64, 46, 0.28)" stroke={OVER_FOOTAGE_PALETTE.glassBorder} strokeWidth="1.5" />
            <text x="424" y="128" textAnchor="middle" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill={theme.solidPanelInk} style={TABULAR_NUM_STYLE}>
              ¥200.00
            </text>
            <FittedSvgText text="EXPIRES IN 6 DAYS" x={424} y={168} maxWidth={180} fontSize={14} fontFamily={FONTS.mono} fontWeight={700} fill={OVER_FOOTAGE_PALETTE.brickRedText} textAnchor="middle" />
            <FittedSvgText text="3,389 MERCHANTS" x={424} y={196} maxWidth={180} fontSize={13} fontFamily={FONTS.mono} fontWeight={600} fill={theme.solidPanelMuted} textAnchor="middle" />
            <WrappedSvgText
              text="Zero savings; unspent funds auto-reclaimed."
              x={308}
              y={268}
              maxWidth={232}
              fontSize={15}
              maxLines={2}
              fontFamily={FONTS.sans}
              fontWeight={700}
              fill={theme.solidPanelInk}
            />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left 1912 Brass Token */}
          <rect x="44" y="48" width="712" height="524" rx="14" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2.5" />
          <FittedSvgText
            text={leftArtifact}
            x={80}
            y={96}
            maxWidth={640}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
          />
          <circle cx="400" cy="292" r="138" fill="#C5A367" stroke="#6E5225" strokeWidth="6" />
          <circle cx="400" cy="292" r="116" fill="none" stroke="#6E5225" strokeWidth="2" strokeDasharray="6 6" />
          <FittedSvgText
            text="ISLAND CREEK COAL"
            x={400}
            y={268}
            maxWidth={210}
            fontSize={22}
            fontFamily={FONTS.serif}
            fontWeight={700}
            fill="#271E15"
            textAnchor="middle"
          />
          <FittedSvgText
            text="$1.00 IN MERCHANDISE"
            x={400}
            y={308}
            maxWidth={214}
            fontSize={26}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill="#271E15"
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />
          <FittedSvgText
            text="NOT TRANSFERABLE · -25% CASH"
            x={400}
            y={346}
            maxWidth={198}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={PAGE_PALETTE.brickRed}
            textAnchor="middle"
          />
          <WrappedSvgText
            text="Valid Only at Company Store · Outlawed by Fair Labor Standards Act (1938)"
            x={80}
            y={496}
            maxWidth={640}
            fontSize={18}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.inkHeadline}
          />

          {/* Right 2020 Shenzhen Vanishing App */}
          <rect x="804" y="48" width="712" height="524" rx="14" fill={theme.solidPanelBg} stroke={theme.riskBorder} strokeWidth="2.5" />
          <FittedSvgText
            text={rightArtifact}
            x={840}
            y={96}
            maxWidth={640}
            fontSize={15}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.brickRedText}
          />
          <rect x="976" y="144" width="368" height="296" rx="22" fill="rgba(163, 64, 46, 0.28)" stroke={OVER_FOOTAGE_PALETTE.glassBorder} strokeWidth="2" />
          <FittedSvgText
            text="LUOHU STIMULUS RED PACKET"
            x={1160}
            y={212}
            maxWidth={324}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.accentWarm}
            textAnchor="middle"
          />
          <FittedSvgText
            text="¥200.00"
            x={1160}
            y={274}
            maxWidth={320}
            fontSize={48}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.solidPanelInk}
            textAnchor="middle"
            style={TABULAR_NUM_STYLE}
          />
          <FittedSvgText
            text="VANISHES IN 6 DAYS 00:00"
            x={1160}
            y={328}
            maxWidth={324}
            fontSize={18}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={OVER_FOOTAGE_PALETTE.brickRedText}
            textAnchor="middle"
          />
          <FittedSvgText
            text="3,389 WHITELISTED MERCHANTS ONLY"
            x={1160}
            y={372}
            maxWidth={324}
            fontSize={13}
            fontFamily={FONTS.mono}
            fontWeight={600}
            fill={theme.solidPanelMuted}
            textAnchor="middle"
          />
          <WrappedSvgText
            text="Zero Savings Conversion · Unspent Balance Automatically Reclaimed by Issuer"
            x={840}
            y={496}
            maxWidth={640}
            fontSize={18}
            maxLines={2}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.solidPanelInk}
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 5. FountainPenVetoSlash (Executive Pen Slicing $2,052 -> $1,022 / -50% Cut)
// ============================================================================
export interface FountainPenVetoSlashProps extends UiSatireBaseProps {
  originalAmount?: string;
  slashedAmount?: string;
  clauseText?: string;
}

export const FountainPenVetoSlash: React.FC<FountainPenVetoSlashProps> = ({
  originalAmount = "$2,052 / MO",
  slashedAmount = "$1,022 / MO",
  clauseText = "SECTION 402(b) · MONTHLY HOUSEHOLD COMPUTE & CASH ALLOCATION",
  eyebrow = "EXECUTIVE LINE-ITEM VETO",
  title = "One Signature Cuts Every Household Wallet in Half by Dawn",
  subtitle = "From Wisconsin line-item digit strikes to programmable stipend tables, policy-granted income shrinks at the stroke of a pen.",
  sourceCitation = "SOURCE: WISCONSIN LEGISLATIVE REFERENCE BUREAU VETO ARCHIVE & FISCAL STATUTE MODELS",
  badgeText = "-50.2% INSTANT CUT",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <UiSatireShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    badgeText={badgeText}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderStage={(theme, elapsed, fps) => {
      const slash = interpolate(
        studioSpring(elapsed, fps, "inkSweep", 16),
        [0, 1],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="8" width="548" height="332" rx="12" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
            <FittedSvgText text={clauseText} x={26} y={42} maxWidth={512} fontSize={13.5} fontFamily={FONTS.mono} fontWeight={700} fill={theme.inkMuted} />
            <line x1="26" y1="58" x2="538" y2="58" stroke={theme.cardBorder} strokeWidth="1.5" />

            <FittedSvgText
              text={originalAmount}
              x={26}
              y={142}
              maxWidth={240}
              fontSize={38}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.inkHeadline}
              style={TABULAR_NUM_STYLE}
            />
            <line
              x1="20"
              y1="146"
              x2={20 + 236 * slash}
              y2={146 - 32 * slash}
              stroke={PAGE_PALETTE.brickRed}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <g opacity={slash}>
              <FittedSvgText text="AMENDED 00:01" x={300} y={102} maxWidth={238} fontSize={13.5} fontFamily={FONTS.mono} fontWeight={700} fill={theme.accentAlert} />
              <FittedSvgText
                text={slashedAmount}
                x={300}
                y={148}
                maxWidth={238}
                fontSize={38}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={theme.accentAlert}
                style={TABULAR_NUM_STYLE}
              />
            </g>

            <rect x="26" y="216" width="512" height="100" rx="8" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="1.8" />
            <WrappedSvgText
              text="Zero collective bargaining. Instant server-side balance update."
              x={44}
              y={266}
              maxWidth={476}
              fontSize={16}
              maxLines={2}
              fontFamily={FONTS.serif}
              fontWeight={700}
              fill={theme.inkHeadline}
              verticalCenter
            />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Statutory Ledger Sheet */}
          <rect x="110" y="54" width="1340" height="512" rx="10" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2.5" />
          <FittedSvgText
            text={clauseText}
            x={170}
            y={124}
            maxWidth={1220}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkMuted}
          />
          <line x1="170" y1="154" x2="1390" y2="154" stroke={theme.cardBorder} strokeWidth="2" />

          {/* Original Amount + Crimson Fountain-Pen Slash */}
          <FittedSvgText
            text={originalAmount}
            x={170}
            y={306}
            maxWidth={540}
            fontSize={86}
            minFontSize={42}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkHeadline}
            style={TABULAR_NUM_STYLE}
          />
          <line
            x1="156"
            y1="322"
            x2={156 + 550 * slash}
            y2={322 - 78 * slash}
            stroke={PAGE_PALETTE.brickRed}
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Fountain Pen Nib Icon */}
          <g transform={`translate(${(156 + 550 * slash).toFixed(1)}, ${(322 - 78 * slash).toFixed(1)}) rotate(-25)`}>
            <polygon points="0,0 44,-16 62,0 44,16" fill={PAGE_PALETTE.navyDeep} />
            <circle cx="24" cy="0" r="4" fill={OVER_FOOTAGE_PALETTE.textHeadline} />
          </g>

          {/* Revised Slashed Amount */}
          <g opacity={slash}>
            <FittedSvgText
              text="AMENDED BY EXECUTIVE ORDER · EFFECTIVE 00:01"
              x={840}
              y={224}
              maxWidth={560}
              fontSize={16}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.accentAlert}
            />
            <FittedSvgText
              text={slashedAmount}
              x={840}
              y={312}
              maxWidth={550}
              fontSize={86}
              minFontSize={42}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.accentAlert}
              style={TABULAR_NUM_STYLE}
            />
          </g>

          <rect x="170" y="418" width="1220" height="96" rx="8" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="2" />
          <WrappedSvgText
            text="Zero Collective Bargaining · Zero Strike Leverage · Instant Server-Side Balance Update"
            x={780}
            y={466}
            maxWidth={1148}
            fontSize={25}
            minFontSize={16}
            maxLines={2}
            fontFamily={FONTS.serif}
            fontWeight={700}
            fill={theme.inkHeadline}
            textAnchor="middle"
            verticalCenter
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// 6. UnwrittenTruceToAllowance (PAYCHECK -> Strikethrough -> ALLOWANCE)
// ============================================================================
export interface UnwrittenTruceToAllowanceProps extends UiSatireBaseProps {
  oldTerm?: string;
  newTerm?: string;
}

export const UnwrittenTruceToAllowance: React.FC<UnwrittenTruceToAllowanceProps> = ({
  oldTerm = "PAYCHECK",
  newTerm = "ALLOWANCE",
  eyebrow = "THE TWO-HUNDRED-YEAR TRUCE",
  title = "When Needed Labor Ends, a Paycheck Morphs Into an Allowance",
  subtitle = "For two centuries capital shared productivity gains because a forty-eight-hour walkout froze the factory; without that lever, income becomes discretionary.",
  sourceCitation = "SOURCE: INDUSTRIAL BARGAINING ARCHIVE · EPISODE 01 THESIS MONOLITH",
  badgeText = "STRUCTURAL SHIFT",
  mode,
  paletteMode,
  register,
  atFrame = 0,
}) => (
  <UiSatireShell
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    sourceCitation={sourceCitation}
    badgeText={badgeText}
    mode={mode}
    paletteMode={paletteMode}
    register={register}
    atFrame={atFrame}
    renderStage={(theme, elapsed, fps) => {
      const strike = interpolate(
        studioSpring(elapsed, fps, "heavyStamp", 20),
        [0, 1],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      if (theme.isCompact) {
        return (
          <svg width="100%" height="100%" viewBox="0 0 564 348">
            <rect x="8" y="8" width="548" height="332" rx="12" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="2" />
            <FittedSvgText
              text="1825–2025 INDUSTRIAL COMPACT"
              x={282}
              y={42}
              maxWidth={500}
              fontSize={14}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={theme.inkMuted}
              textAnchor="middle"
            />
            <g opacity={1 - strike * 0.45}>
              <FittedSvgText
                text={oldTerm}
                x={282}
                y={128}
                maxWidth={460}
                fontSize={58}
                fontFamily={FONTS.condensed}
                fontWeight={700}
                fill={theme.inkHeadline}
                textAnchor="middle"
              />
            </g>
            <line
              x1="120"
              y1="108"
              x2={120 + 324 * strike}
              y2="108"
              stroke={PAGE_PALETTE.brickRed}
              strokeWidth="10"
            />
            <g opacity={strike} transform="translate(282, 224) rotate(-2)">
              <rect x="-180" y="-44" width="360" height="84" rx="8" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="3.5" />
              <FittedSvgText
                text={newTerm}
                x={0}
                y={16}
                maxWidth={332}
                fontSize={54}
                fontFamily={FONTS.condensed}
                fontWeight={700}
                fill={theme.accentAlert}
                textAnchor="middle"
              />
            </g>
            <WrappedSvgText
              text="Paycheck = owed because they need you. Allowance = granted until budget tightens."
              x={282}
              y={308}
              maxWidth={510}
              fontSize={15}
              maxLines={2}
              fontFamily={FONTS.sans}
              fontWeight={700}
              fill={theme.inkHeadline}
              textAnchor="middle"
              verticalCenter
            />
          </svg>
        );
      }

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          <rect x="96" y="44" width="1368" height="532" rx="14" fill={theme.wellBg} stroke={theme.navyInk} strokeWidth="3" />
          <FittedSvgText
            text="1825–2025 INDUSTRIAL COMPACT · BACKED BY 48-HOUR WALKOUT THREAT"
            x={780}
            y={114}
            maxWidth={1260}
            fontSize={16}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={theme.inkMuted}
            textAnchor="middle"
          />

          {/* Strikethrough PAYCHECK */}
          <g opacity={1 - strike * 0.45}>
            <FittedSvgText
              text={oldTerm}
              x={780}
              y={256}
              maxWidth={960}
              fontSize={118}
              minFontSize={52}
              fontFamily={FONTS.condensed}
              fontWeight={700}
              fill={theme.inkHeadline}
              textAnchor="middle"
            />
          </g>
          <line
            x1="470"
            y1="216"
            x2={470 + 620 * strike}
            y2="216"
            stroke={PAGE_PALETTE.brickRed}
            strokeWidth="16"
          />

          {/* Stamped ALLOWANCE */}
          <g opacity={strike} transform="translate(780, 418) rotate(-2)">
            <rect x="-350" y="-88" width="700" height="128" rx="10" fill={theme.riskBg} stroke={theme.riskBorder} strokeWidth="5" />
            <FittedSvgText
              text={newTerm}
              x={0}
              y={6}
              maxWidth={636}
              fontSize={104}
              minFontSize={46}
              fontFamily={FONTS.condensed}
              fontWeight={700}
              fill={theme.accentAlert}
              textAnchor="middle"
            />
          </g>

          <FittedSvgText
            text="Paycheck = Owed Because They Need You · Allowance = Granted Until the Budget Tightens"
            x={780}
            y={534}
            maxWidth={1260}
            fontSize={20}
            fontFamily={FONTS.sans}
            fontWeight={700}
            fill={theme.inkHeadline}
            textAnchor="middle"
          />
        </svg>
      );
    }}
  />
);

// ============================================================================
// Parameterized UI Satire, Cutout, Receipt, Quiz & Wallet Engine (#7–#24)
// ============================================================================
export type SatireArchetype =
  | "thermal-receipt"
  | "bank-modal"
  | "hinged-cutout"
  | "viewer-quiz"
  | "pinboard-stamps"
  | "wallet-console";

export interface SatireLineItem {
  label: string;
  value: string;
  note: string;
  isAlert?: boolean;
}

export interface ParametricUiSatireProps extends UiSatireBaseProps {
  heroCallout?: string;
  subCallout?: string;
  items?: readonly SatireLineItem[];
}

function createParametricUiSatire(config: {
  archetype: SatireArchetype;
  defaultEyebrow: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultSource: string;
  defaultBadge: string;
  defaultHeroCallout: string;
  defaultSubCallout: string;
  defaultItems: readonly SatireLineItem[];
}): React.FC<ParametricUiSatireProps> {
  const Component: React.FC<ParametricUiSatireProps> = ({
    eyebrow = config.defaultEyebrow,
    title = config.defaultTitle,
    subtitle = config.defaultSubtitle,
    sourceCitation = config.defaultSource,
    badgeText = config.defaultBadge,
    heroCallout = config.defaultHeroCallout,
    subCallout = config.defaultSubCallout,
    items = config.defaultItems,
    mode,
    paletteMode,
    register,
    atFrame = 0,
  }) => (
    <UiSatireShell
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      sourceCitation={sourceCitation}
      badgeText={badgeText}
      mode={mode}
      paletteMode={paletteMode}
      register={register}
      atFrame={atFrame}
      renderStage={(theme, elapsed, fps) => {
        const snap = interpolate(
          studioSpring(elapsed, fps, "editorialSnap", 8),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const jawY = Math.abs(Math.sin(elapsed * 0.22)) * 16;
        const pulseBar = interpolate(
          Math.sin(elapsed * 0.12),
          [-1, 1],
          [0.35, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (theme.isCompact) {
          const compactRows = items.slice(0, 3);
          return (
            <svg width="100%" height="100%" viewBox="0 0 564 348">
              <rect
                x="8"
                y="8"
                width="548"
                height="112"
                rx="10"
                fill={config.archetype === "wallet-console" ? theme.solidPanelBg : theme.riskBg}
                stroke={config.archetype === "wallet-console" ? theme.accentTeal : theme.riskBorder}
                strokeWidth="2"
              />
              <FittedSvgText
                text={heroCallout}
                x={26}
                y={48}
                maxWidth={512}
                fontSize={28}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fill={config.archetype === "wallet-console" ? theme.solidPanelInk : theme.accentAlert}
                style={TABULAR_NUM_STYLE}
              />
              <WrappedSvgText
                text={subCallout}
                x={26}
                y={78}
                maxWidth={512}
                fontSize={15}
                maxLines={2}
                fontFamily={FONTS.sans}
                fontWeight={600}
                fill={config.archetype === "wallet-console" ? theme.solidPanelMuted : theme.inkHeadline}
              />
              {compactRows.map((it, idx) => {
                const ry = 132 + idx * 70;
                return (
                  <g key={`c-sat-${idx}`} transform={`translate(8, ${ry})`} opacity={snap}>
                    <rect
                      width="548"
                      height="60"
                      rx="8"
                      fill={it.isAlert ? theme.riskBg : theme.wellBg}
                      stroke={it.isAlert ? theme.riskBorder : theme.cardBorder}
                      strokeWidth="1.6"
                    />
                    <FittedSvgText
                      text={it.label}
                      x={16}
                      y={26}
                      maxWidth={330}
                      fontSize={15.5}
                      fontFamily={FONTS.sans}
                      fontWeight={700}
                      fill={theme.inkHeadline}
                    />
                    <FittedSvgText
                      text={it.value}
                      x={532}
                      y={28}
                      maxWidth={184}
                      fontSize={16}
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={it.isAlert ? theme.accentAlert : theme.accentTeal}
                      textAnchor="end"
                      style={TABULAR_NUM_STYLE}
                    />
                    <FittedSvgText
                      text={it.note}
                      x={16}
                      y={48}
                      maxWidth={516}
                      fontSize={13.5}
                      fontFamily={FONTS.mono}
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
            {/* Left Satire / UI Exhibit */}
            <rect
              x="44"
              y="44"
              width="660"
              height="532"
              rx="16"
              fill={
                config.archetype === "wallet-console"
                  ? PAGE_PALETTE.navyDeep
                  : theme.wellBg
              }
              stroke={theme.navyInk}
              strokeWidth="2.5"
            />

            {config.archetype === "thermal-receipt" && (
              <g transform={`translate(154, ${(64 - (1 - snap) * 28).toFixed(1)})`}>
                {/* Sawtooth Thermal Paper Strip */}
                <polygon
                  points="0,12 18,0 36,12 54,0 72,12 90,0 108,12 126,0 144,12 162,0 180,12 198,0 216,12 234,0 252,12 270,0 288,12 306,0 324,12 342,0 360,12 378,0 396,12 414,0 440,12 440,468 414,480 396,468 378,480 360,468 342,480 324,468 306,480 288,468 270,480 252,468 234,480 216,468 198,480 180,468 162,480 144,468 126,480 108,468 90,480 72,468 54,480 36,468 18,480 0,468"
                  fill={PAGE_PALETTE.paperLight}
                  stroke={PAGE_PALETTE.navy}
                  strokeWidth="2"
                />
                <FittedSvgText
                  text="THERMAL AUDIT TAPE · REG #04"
                  x={220}
                  y={52}
                  maxWidth={372}
                  fontSize={16}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={PAGE_PALETTE.navy}
                  textAnchor="middle"
                />
                <line x1="36" y1="74" x2="404" y2="74" stroke={PAGE_PALETTE.navy} strokeWidth="1.5" strokeDasharray="4 4" />
                <FittedSvgText
                  text="TXN TIMESTAMP · DAY 01 00:01"
                  x={220}
                  y={104}
                  maxWidth={372}
                  fontSize={12}
                  fontFamily={FONTS.mono}
                  fontWeight={600}
                  fill={PAGE_PALETTE.muted}
                  textAnchor="middle"
                />
                <rect x="34" y="132" width="372" height="92" rx="6" fill={PAGE_PALETTE.riskFill} stroke={PAGE_PALETTE.brickRed} strokeWidth="1.5" />
                <FittedSvgText
                  text={heroCallout}
                  x={220}
                  y={192}
                  maxWidth={348}
                  fontSize={40}
                  minFontSize={22}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={PAGE_PALETTE.brickRed}
                  textAnchor="middle"
                  style={TABULAR_NUM_STYLE}
                />
                <WrappedSvgText
                  text={subCallout}
                  x={220}
                  y={268}
                  maxWidth={372}
                  fontSize={15}
                  maxLines={2}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={PAGE_PALETTE.muted}
                  textAnchor="middle"
                  verticalCenter
                />
                <line x1="36" y1="322" x2="404" y2="322" stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                {/* Deterministic Barcode Strip */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((b) => (
                  <rect
                    key={`bc-${b}`}
                    x={92 + b * 14}
                    y="342"
                    width={b % 3 === 0 ? 7 : 3}
                    height="44"
                    fill={PAGE_PALETTE.navy}
                  />
                ))}
                <FittedSvgText
                  text="THANK YOU FOR YOUR COMPLIANCE"
                  x={220}
                  y={422}
                  maxWidth={372}
                  fontSize={14}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={PAGE_PALETTE.navy}
                  textAnchor="middle"
                />
              </g>
            )}

            {config.archetype === "bank-modal" && (
              <g transform="translate(88, 92)">
                <rect width="572" height="436" rx="12" fill={PAGE_PALETTE.paperLight} stroke={PAGE_PALETTE.brickRed} strokeWidth="3" />
                <rect width="572" height="54" rx="10" fill={PAGE_PALETTE.navy} />
                {/* Window Chrome Dots */}
                <circle cx="28" cy="27" r="6" fill="#E27358" />
                <circle cx="48" cy="27" r="6" fill="#F7C35C" />
                <circle cx="68" cy="27" r="6" fill="#4FB3AE" />
                <FittedSvgText
                  text="AUTOMATED UNDERWRITING ENGINE v9.4"
                  x={92}
                  y={32}
                  maxWidth={456}
                  fontSize={13.5}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                />
                {/* Warning Shield */}
                <path d="M 286 78 L 316 90 L 312 122 L 286 138 L 260 122 L 256 90 Z" fill={PAGE_PALETTE.riskFill} stroke={PAGE_PALETTE.brickRed} strokeWidth="2.5" />
                <text x="286" y="116" textAnchor="middle" fontFamily={FONTS.mono} fontSize="22" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
                  !
                </text>
                <FittedSvgText
                  text={heroCallout}
                  x={286}
                  y={192}
                  maxWidth={516}
                  fontSize={38}
                  minFontSize={22}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={PAGE_PALETTE.brickRed}
                  textAnchor="middle"
                  style={TABULAR_NUM_STYLE}
                />
                <WrappedSvgText
                  text={subCallout}
                  x={286}
                  y={248}
                  maxWidth={512}
                  fontSize={17}
                  maxLines={2}
                  fontFamily={FONTS.sans}
                  fontWeight={700}
                  fill={PAGE_PALETTE.navy}
                  textAnchor="middle"
                  verticalCenter
                />
                {/* Animated Underwriting Gate Progress */}
                <rect x="76" y="294" width="420" height="10" rx="5" fill={PAGE_PALETTE.paperBorder} />
                <rect x="76" y="294" width={420 * snap} height="10" rx="5" fill={PAGE_PALETTE.brickRed} />
                <rect x="156" y="330" width="260" height="54" rx="8" fill={PAGE_PALETTE.paperBorder} stroke={PAGE_PALETTE.muted} strokeWidth="1.5" />
                <FittedSvgText
                  text="APPEAL DISABLED"
                  x={286}
                  y={363}
                  maxWidth={228}
                  fontSize={15}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={PAGE_PALETTE.muted}
                  textAnchor="middle"
                />
              </g>
            )}

            {config.archetype === "hinged-cutout" && (
              <g transform="translate(374, 248)">
                {/* Archival Collage Bust + Articulated Brass Rivet Jaw */}
                <circle cx="0" cy="-64" r="88" fill={PAGE_PALETTE.paper} stroke={PAGE_PALETTE.navy} strokeWidth="4" />
                <circle cx="-26" cy="-84" r="7" fill={PAGE_PALETTE.navy} />
                <circle cx="26" cy="-84" r="7" fill={PAGE_PALETTE.navy} />
                <rect x="-58" y="-32" width="116" height="44" rx="6" fill={PAGE_PALETTE.paperLight} stroke={PAGE_PALETTE.navy} strokeWidth="3" transform={`translate(0, ${jawY.toFixed(1)})`} />
                <circle cx="-54" cy="-24" r="7" fill="#C5A367" stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                <circle cx="54" cy="-24" r="7" fill="#C5A367" stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                <path d="M -130 148 L -90 32 L 90 32 L 130 148 Z" fill={PAGE_PALETTE.navy} />
                <polygon points="-24,32 24,32 0,88" fill={PAGE_PALETTE.brickRed} />
                <rect x="-290" y="168" width="580" height="122" rx="10" fill={theme.cardBg} stroke={theme.cardBorder} strokeWidth="1.8" />
                <FittedSvgText
                  text={`"${heroCallout}"`}
                  x={0}
                  y={208}
                  maxWidth={540}
                  fontSize={18}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.accentAlert}
                  textAnchor="middle"
                />
                <WrappedSvgText
                  text={`Translation: ${subCallout}`}
                  x={0}
                  y={252}
                  maxWidth={540}
                  fontSize={15}
                  maxLines={2}
                  fontFamily={FONTS.sans}
                  fontWeight={600}
                  fill={theme.inkHeadline}
                  textAnchor="middle"
                  verticalCenter
                />
              </g>
            )}

            {config.archetype === "viewer-quiz" && (
              <g transform="translate(88, 84)">
                <FittedSvgText
                  text="AUDIENCE PREDICTION LOCK · PICK ONE"
                  x={0}
                  y={26}
                  maxWidth={572}
                  fontSize={16}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.accentAlert}
                />
                <circle cx="286" cy="196" r="126" fill="none" stroke={theme.accentTeal} strokeWidth="5" strokeDasharray="16 10" />
                <circle cx="286" cy="196" r="112" fill={PAGE_PALETTE.navy} />
                <WrappedSvgText
                  text={heroCallout}
                  x={286}
                  y={196}
                  maxWidth={184}
                  fontSize={32}
                  minFontSize={18}
                  maxLines={2}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                  textAnchor="middle"
                  verticalCenter
                  style={TABULAR_NUM_STYLE}
                />
                <WrappedSvgText
                  text={subCallout}
                  x={286}
                  y={374}
                  maxWidth={548}
                  fontSize={18}
                  maxLines={2}
                  fontFamily={FONTS.sans}
                  fontWeight={700}
                  fill={theme.inkHeadline}
                  textAnchor="middle"
                  verticalCenter
                />
                <rect x="64" y="422" width="444" height="32" rx="16" fill={theme.cardBg} stroke={theme.cardBorder} strokeWidth="1.5" />
                <FittedSvgText
                  text="A / B / C POLL LOCKED · PRIMARY SOURCE REVEAL"
                  x={286}
                  y={443}
                  maxWidth={410}
                  fontSize={12.5}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={theme.inkMuted}
                  textAnchor="middle"
                />
              </g>
            )}

            {config.archetype === "pinboard-stamps" && (
              <g transform="translate(84, 84)">
                <rect width="580" height="452" rx="10" fill={PAGE_PALETTE.paper} stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                {/* Corkboard Corner Pushpins & Investigation Thread */}
                <circle cx="32" cy="32" r="9" fill={PAGE_PALETTE.brickRed} stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                <circle cx="548" cy="32" r="9" fill={PAGE_PALETTE.brickRed} stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                <line x1="32" y1="32" x2="290" y2="148" stroke={PAGE_PALETTE.brickRed} strokeWidth="2" strokeDasharray="5 5" opacity={0.65} />
                <line x1="548" y1="32" x2="290" y2="148" stroke={PAGE_PALETTE.brickRed} strokeWidth="2" strokeDasharray="5 5" opacity={0.65} />
                <g transform="translate(290, 214) rotate(-6)">
                  <rect x="-224" y="-72" width="448" height="144" rx="8" fill={PAGE_PALETTE.riskFill} stroke={PAGE_PALETTE.brickRed} strokeWidth="5" />
                  <rect x="-214" y="-62" width="428" height="124" rx="5" fill="none" stroke={PAGE_PALETTE.brickRed} strokeWidth="1.5" strokeDasharray="6 4" />
                  <FittedSvgText
                    text={heroCallout}
                    x={0}
                    y={12}
                    maxWidth={396}
                    fontSize={52}
                    minFontSize={24}
                    fontFamily={FONTS.condensed}
                    fontWeight={700}
                    fill={PAGE_PALETTE.brickRed}
                    textAnchor="middle"
                  />
                </g>
                <WrappedSvgText
                  text={subCallout}
                  x={290}
                  y={392}
                  maxWidth={516}
                  fontSize={16}
                  maxLines={2}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={PAGE_PALETTE.navy}
                  textAnchor="middle"
                  verticalCenter
                />
              </g>
            )}

            {config.archetype === "wallet-console" && (
              <g transform="translate(84, 84)">
                <circle cx="10" cy="24" r="6" fill={OVER_FOOTAGE_PALETTE.chartSecondary} opacity={pulseBar} />
                <FittedSvgText
                  text="PROGRAMMABLE MONETARY RULE ENGINE"
                  x={26}
                  y={30}
                  maxWidth={536}
                  fontSize={14}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.chartSecondary}
                />
                <FittedSvgText
                  text={heroCallout}
                  x={0}
                  y={132}
                  maxWidth={572}
                  fontSize={44}
                  minFontSize={24}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                  style={TABULAR_NUM_STYLE}
                />
                <rect x="0" y="182" width="580" height="176" rx="12" fill="rgba(163, 64, 46, 0.32)" stroke={OVER_FOOTAGE_PALETTE.brickRedText} strokeWidth="2" />
                <WrappedSvgText
                  text={subCallout}
                  x={28}
                  y={270}
                  maxWidth={524}
                  fontSize={18}
                  minFontSize={13}
                  maxLines={3}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={OVER_FOOTAGE_PALETTE.textBody}
                  verticalCenter
                />
                {/* Policy Toggle Pills */}
                {["RULE LOCK: ON", "EXIT PORTABILITY: $0", "API PUSH < 200ms"].map((pill, pIdx) => (
                  <g key={`wp-${pIdx}`} transform={`translate(${pIdx * 196}, 388)`}>
                    <rect width="184" height="42" rx="6" fill="#162E47" stroke={OVER_FOOTAGE_PALETTE.accentPrimary} strokeWidth="1.2" />
                    <FittedSvgText
                      text={pill}
                      x={92}
                      y={26}
                      maxWidth={164}
                      fontSize={12}
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fill={OVER_FOOTAGE_PALETTE.accentPrimary}
                      textAnchor="middle"
                    />
                  </g>
                ))}
              </g>
            )}

            {/* Right Ledger / Itemized Breakdown */}
            {items.map((it, idx) => {
              const y = 44 + idx * 136;
              return (
                <g key={`sat-it-${idx}`} transform={`translate(748, ${y})`} opacity={snap}>
                  <rect
                    width="768"
                    height="120"
                    rx="12"
                    fill={it.isAlert ? theme.riskBg : theme.wellBg}
                    stroke={it.isAlert ? theme.riskBorder : theme.navyInk}
                    strokeWidth="2"
                  />
                  <FittedSvgText
                    text={it.label}
                    x={28}
                    y={46}
                    maxWidth={460}
                    fontSize={20}
                    minFontSize={14}
                    fontFamily={FONTS.sans}
                    fontWeight={700}
                    fill={theme.inkHeadline}
                  />
                  <FittedSvgText
                    text={it.value}
                    x={740}
                    y={48}
                    maxWidth={224}
                    fontSize={25}
                    minFontSize={16}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={it.isAlert ? theme.accentAlert : theme.accentTeal}
                    textAnchor="end"
                    style={TABULAR_NUM_STYLE}
                  />
                  <FittedSvgText
                    text={it.note}
                    x={28}
                    y={88}
                    maxWidth={712}
                    fontSize={14.5}
                    minFontSize={11}
                    fontFamily={FONTS.mono}
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

export const RoofDroneEscrowShock = createParametricUiSatire({
  archetype: "bank-modal",
  defaultEyebrow: "AERIAL UNDERWRITING SCAN",
  defaultTitle: "Insurer Roof-Drone Telemetry Triggers Automated Escrow Spike",
  defaultSubtitle: "Satellite and drone granule-loss algorithms issue non-renewals without an adjuster ever stepping on a ladder.",
  defaultSource: "SOURCE: STATE DEPARTMENT OF INSURANCE AERIAL IMAGERY FILINGS",
  defaultBadge: "+$410 / MO ESCROW",
  defaultHeroCallout: "POLICY NON-RENEWED",
  defaultSubCallout: "Granule Anomaly Detected · Forced-Placed Rate Applied",
  defaultItems: [
    { label: "Prior Homeowners Premium", value: "$2,280 / YR", note: "Bundled 2023 Escrowed Policy" },
    { label: "Aerial LiDAR Roof Score", value: "FAIL (AGE 11)", note: "Automated shingle curl flag", isAlert: true },
    { label: "Lender Forced-Placed Escrow", value: "$7,200 / YR", note: "Zero personal property coverage included", isAlert: true },
    { label: "New Monthly Mortgage Draft", value: "$3,810 / MO", note: "Fixed principal + repriced insurance tax", isAlert: true },
  ],
});

export const ThermalReceiptInflationRoll = createParametricUiSatire({
  archetype: "thermal-receipt",
  defaultEyebrow: "BIFURCATED PRICE BASKET",
  defaultTitle: "Free Chatbots at the Top, Sticky Fixed Essentials at the Bottom",
  defaultSubtitle: "Deflation in pixels and software masks relentless compounding across shelter, kWh delivery, and municipal fees.",
  defaultSource: "SOURCE: BLS CONSUMER PRICE INDEX FLEXIBLE vs STICKY SUB-INDICES",
  defaultBadge: "+41% ESSENTIALS",
  defaultHeroCallout: "$3,942.18 DUE",
  defaultSubCallout: "Software: $0.00 · Physical Survival Floor: +41%",
  defaultItems: [
    { label: "Frontier AI Summary & Search", value: "$0.00", note: "-98% Marginal Token Deflation" },
    { label: "ERCOT Transmission + Delivery", value: "$418.40", note: "+52% Grid Infrastructure Rider", isAlert: true },
    { label: "County Property Tax Escrow", value: "$892.00", note: "Assessed on 2024 Peak Valuation", isAlert: true },
    { label: "Family High-Deductible Health", value: "$1,410.00", note: "$9,200 Out-of-Pocket Floor Before Care", isAlert: true },
  ],
});

export const RefinanceDenialModal = createParametricUiSatire({
  archetype: "bank-modal",
  defaultEyebrow: "ILLIQUID EQUITY PARADOX",
  defaultTitle: "Three Hundred Thousand in Home Equity, Rejected for a Refinance",
  defaultSubtitle: "Automated debt-to-income gates ignore paper home equity the moment W-2 cash flow drops below forty-three percent.",
  defaultSource: "SOURCE: FANNIE MAE AUTOMATED UNDERWRITING SYSTEM (DU) GUIDELINES",
  defaultBadge: "DTI 95.8% · REJECT",
  defaultHeroCallout: "APPLICATION DENIED",
  defaultSubCallout: "Reason Code 04: Insufficient Verifiable W-2 Income",
  defaultItems: [
    { label: "Appraised Austin Home Value", value: "$685,000", note: "$310,000 Untappable Paper Equity" },
    { label: "Current Note Rate Lock", value: "6.75% FIXED", note: "$3,400/mo P&I + Escrow" },
    { label: "Post-AI Compressed Income", value: "$3,550 / MO", note: "Down 70% from 2025 Origination", isAlert: true },
    { label: "Cash-Out / Rate-Term Verdict", value: "INELIGIBLE", note: "Must sell into distressed market to unlock", isAlert: true },
  ],
});

export const HingedBrassJawCutout = createParametricUiSatire({
  archetype: "hinged-cutout",
  defaultEyebrow: "INSTITUTIONAL EUPHEMISM DECODER",
  defaultTitle: "Official Press-Release Language vs Kitchen-Table Arithmetic",
  defaultSubtitle: "Translating polished policy euphemisms into plain balance-sheet realities with zero PR varnish.",
  defaultSource: "SOURCE: FEDERAL OPEN MARKET COMMITTEE & CORPORATE EARNINGS TRANSCRIPTS",
  defaultBadge: "PLAIN-ENGLISH AUDIT",
  defaultHeroCallout: "WORKFORCE RIGHT-SIZING",
  defaultSubCallout: "Permanent replacement of W-2 headcount with API seats.",
  defaultItems: [
    { label: "\"Productivity Transition Dividend\"", value: "MARGIN +640 bps", note: "Captured 100% by equity buybacks" },
    { label: "\"Flexible Gig Empowerment\"", value: "$0 BENEFITS", note: "FICA & health risk shifted onto worker", isAlert: true },
    { label: "\"Targeted Fiscal Calibration\"", value: "-50% STIPEND", note: "Automated budget-deficit haircut", isAlert: true },
    { label: "\"Frictionless Digital Rails\"", value: "GEO-FENCED", note: "Programmable expiration & MCC allowlist", isAlert: true },
  ],
});

export const ViewerGameQuizCard = createParametricUiSatire({
  archetype: "viewer-quiz",
  defaultEyebrow: "TREASURY REALITY CHECK",
  defaultTitle: "Guess What Share of Federal Taxes Comes From Human Paychecks",
  defaultSubtitle: "Most voters assume giant corporations fund half the federal budget; Treasury Table 9 tells a starkly different story.",
  defaultSource: "SOURCE: U.S. TREASURY MONTHLY STATEMENT TABLE 9 · FY RECEIPTS",
  defaultBadge: "ANSWER: 84%",
  defaultHeroCallout: "84% PAYROLL",
  defaultSubCallout: "Individual Income + FICA Payroll = $4.1T of $4.9T",
  defaultItems: [
    { label: "Option A · 35% Individual / 65% Corp", value: "MYTH", note: "Common public polling estimate" },
    { label: "Option B · 50% / 50% Split", value: "1945 ERA", note: "Last true during World War II mobilization" },
    { label: "Option C · 84% Human Paychecks", value: "ACTUAL DATA", note: "Income withholding + Social Security/Medicare", isAlert: true },
    { label: "Corporate Income Tax Share", value: "ONLY ~7%–9%", note: "Before autonomous CapEx write-offs", isAlert: true },
  ],
});

export const TermsOfServiceScrollTrap = createParametricUiSatire({
  archetype: "wallet-console",
  defaultEyebrow: "UNILATERAL CONTRACT AMENDMENT",
  defaultTitle: "Page 47, Clause 19.4: Your Allocation Tier May Be Modified Anytime",
  defaultSubtitle: "Clicking Accept on updated digital wallet terms waives recourse when compute or stipend quotas tighten.",
  defaultSource: "SOURCE: STANDARD FINTECH & CLOUD PLATFORM MASTER SERVICE AGREEMENTS",
  defaultBadge: "DECLINE GREYED OUT",
  defaultHeroCallout: "CLAUSE 19.4 ACTIVE",
  defaultSubCallout: "Continued survival-rail access constitutes binding consent.",
  defaultItems: [
    { label: "Mandatory Binding Arbitration", value: "WAIVED JURY", note: "Class-action opt-out buried in Sec. 22", isAlert: true },
    { label: "Rate-Limit Throttle Right", value: "UNILATERAL", note: "Peak-hour compute rationed without credit" },
    { label: "Account Freeze Trigger", value: "ALGORITHMIC", note: "Automated compliance flag locks balance", isAlert: true },
    { label: "Exit Portability", value: "$0.00 CASH", note: "Credits void upon account closure", isAlert: true },
  ],
});

export const DynamicSurgeMeterTag = createParametricUiSatire({
  archetype: "wallet-console",
  defaultEyebrow: "REAL-TIME SURGE TARIFF",
  defaultTitle: "106°F Austin Afternoon: Smart Meter Reprices Cooling by the Minute",
  defaultSubtitle: "Residential households compete directly against hyperscale data-center power-purchase bids during peak summer load.",
  defaultSource: "SOURCE: ERCOT REAL-TIME SETTLEMENT POINT PRICES & RETAIL TIME-OF-USE PLANS",
  defaultBadge: "4:45 PM PEAK SURGE",
  defaultHeroCallout: "$0.68 / kWh PEAK",
  defaultSubCallout: "4.8x Normal Rate · A/C Compressor Drawing 4.2 kW",
  defaultItems: [
    { label: "Off-Peak 03:00 AM Tariff", value: "$0.11 / kWh", note: "Wind surplus overnight baseline" },
    { label: "Data-Center Firm PPA Lock", value: "$0.065 FIXED", note: "20-year institutional baseload hedge" },
    { label: "4:00–7:00 PM Residential Peak", value: "$0.68 / kWh", note: "Spot congestion passed to households", isAlert: true },
    { label: "August Billing Cycle Shock", value: "$612.40 DUE", note: "Auto-drafted on 15th of month", isAlert: true },
  ],
});

export const FourEscapeHatchesBoard = createParametricUiSatire({
  archetype: "pinboard-stamps",
  defaultEyebrow: "EPISODE CONTINUITY BOARD · ENT_ESCAPE_HATCH",
  defaultTitle: "Testing All Four Classic Middle-Class Escape Hatches",
  defaultSubtitle: "Retraining, belt-tightening, refinancing, and tapping retirement each hit a structural wall under simultaneous wage deflation.",
  defaultSource: "SOURCE: HOUSEHOLD STRESS-TEST MATRIX · EPISODE 01 ACT II",
  defaultBadge: "4 OF 4 BLOCKED",
  defaultHeroCallout: "4 / 4 SEALED",
  defaultSubCallout: "Every traditional textbook adjustment fails nominal debt math.",
  defaultItems: [
    { label: "Hatch 01 · Retrain Into New Skill", value: "BLOCKED", note: "6-month AI model cycle outruns 2-year degree", isAlert: true },
    { label: "Hatch 02 · Cut Discretionary Spend", value: "BLOCKED", note: "$3,400 fixed mortgage + tax leaves 0% fat", isAlert: true },
    { label: "Hatch 03 · Refinance the House", value: "DENIED", note: "Compressed W-2 income fails 43% DTI gate", isAlert: true },
    { label: "Hatch 04 · Liquidate 401(k)", value: "-32% HAIRCUT", note: "10% penalty + income withholding trap", isAlert: true },
  ],
});

export const SubscriptionTrapStack = createParametricUiSatire({
  archetype: "thermal-receipt",
  defaultEyebrow: "PRE-COMMITTED MONTHLY FLOOR",
  defaultTitle: "Thirty-Four Hundred Dollars Gone on the First of Every Month",
  defaultSubtitle: "Fixed debt, property tax, insurance, and utility base charges clear automatically before a household buys groceries.",
  defaultSource: "SOURCE: CONSUMER EXPENDITURE SURVEY FIXED-OBLIGATION SHARE",
  defaultBadge: "DAY-1 AUTO-DEBIT",
  defaultHeroCallout: "$3,400 LOCKED",
  defaultSubCallout: "Zero Elasticity · Non-Cancelable Without Losing Shelter",
  defaultItems: [
    { label: "1st · Fixed Principal & Interest", value: "$2,190 / MO", note: "30-Year Note · Non-Deflating", isAlert: true },
    { label: "1st · County & School Tax Escrow", value: "$640 / MO", note: "Statutory Tax Lien Priority", isAlert: true },
    { label: "1st · Homeowners Hazard Escrow", value: "$380 / MO", note: "Mandatory Lender Covenant", isAlert: true },
    { label: "5th · Water, Trash & Grid Base", value: "$190 / MO", note: "Fixed meter connection charges" },
  ],
});

export const AlgorithmicCreditScoreDrop = createParametricUiSatire({
  archetype: "bank-modal",
  defaultEyebrow: "FICO CLIFF FEEDBACK LOOP",
  defaultTitle: "One Utilization Spike Punishes Credit Across Insurance & Car Loans",
  defaultSubtitle: "Bridging a ninety-day income gap on revolving cards drops credit tiers, raising auto insurance and borrowing costs simultaneously.",
  defaultSource: "SOURCE: CFPB CONSUMER CREDIT PANEL & INSURANCE CREDIT-SCORING RULES",
  defaultBadge: "780 -> 612 CLIFF",
  defaultHeroCallout: "-168 PTS DROP",
  defaultSubCallout: "Revolving Utilization > 65% · Tier Downgraded Overnight",
  defaultItems: [
    { label: "20-Year On-Time Mortgage Streak", value: "100% PAID", note: "Weighted less than sudden card balance" },
    { label: "Card APR Penalty Reset", value: "29.99% APR", note: "Compounding monthly interest trap", isAlert: true },
    { label: "Auto Insurance Renewal Hike", value: "+$94 / MO", note: "Credit-based insurance score surcharge", isAlert: true },
    { label: "Security Deposit Requirement", value: "2x MONTHS", note: "Triggered on utility & lease switches", isAlert: true },
  ],
});

export const CompanyTownStoreLedger = createParametricUiSatire({
  archetype: "thermal-receipt",
  defaultEyebrow: "1912 PULLMAN & APPALACHIAN LEDGER",
  defaultTitle: "Company Commissary Passbook: Deducting Rent Before Payday",
  defaultSubtitle: "Historical payroll ledgers netted company-owned housing, coal, and doctor fees directly against scrip wages.",
  defaultSource: "SOURCE: U.S. COAL COMMISSION ARCHIVAL PAYROLL STUBS (1912–1923)",
  defaultBadge: "NET DUE: $0.00",
  defaultHeroCallout: "BALANCE $0.00",
  defaultSubCallout: "Gross Tonnage Credit Fully Offset by Company Deductions",
  defaultItems: [
    { label: "Gross Coal Tonnage Mined", value: "+$48.50", note: "Fourteen-day shift tally" },
    { label: "Company Shanty Rent Deduction", value: "-$18.00", note: "Withheld prior to payout", isAlert: true },
    { label: "Commissary Flour & Lamp Oil", value: "-$24.50", note: "+28% Markup Over Outside Town", isAlert: true },
    { label: "Tool Sharpening & Doctor Fee", value: "-$6.00", note: "Mandatory payroll checkoff", isAlert: true },
  ],
});

export const GeoFencedSpendMapCard = createParametricUiSatire({
  archetype: "wallet-console",
  defaultEyebrow: "SPATIAL MERCHANT LOCK",
  defaultTitle: "Geo-Fenced Stipend Radius: Valid Within 5.0 km Approved Zone",
  defaultSubtitle: "Programmable municipal vouchers verify GPS and Merchant Category Codes before clearing every tap-to-pay transaction.",
  defaultSource: "SOURCE: PROGRAMMABLE VOUCHER & CBDC SMART-CONTRACT TECHNICAL PILOTS",
  defaultBadge: "MCC + GPS LOCK",
  defaultHeroCallout: "RADIUS 5.0 KM",
  defaultSubCallout: "Out-of-Zone Wire, Equity Purchase & Debt Service Blocked",
  defaultItems: [
    { label: "MCC 5411 · Local Grocery", value: "APPROVED", note: "Clears instantly inside municipal polygon" },
    { label: "MCC 6211 · Brokerage / Gold", value: "BLOCKED", note: "Capital accumulation prohibited on stipend", isAlert: true },
    { label: "Out-of-State Travel Spend", value: "DECLINED", note: "GPS coordinate outside registered census tract", isAlert: true },
    { label: "Peer-to-Peer Cash Transfer", value: "DISABLED", note: "Non-transferable identity-bound wallet", isAlert: true },
  ],
});

export const ExpirationCountdownToast = createParametricUiSatire({
  archetype: "wallet-console",
  defaultEyebrow: "NEGATIVE-CARRY VELOCITY FORCING",
  defaultTitle: "Sunday 23:59:59 Sweep: Spend Your Allowance or Watch It Zero Out",
  defaultSubtitle: "Expiring digital stipends guarantee consumer velocity while preventing households from building independent cash buffers.",
  defaultSource: "SOURCE: MONETARY VELOCITY & EXPIRING VOUCHER DESIGN PAPERS",
  defaultBadge: "ZERO SAVINGS",
  defaultHeroCallout: "EXPIRES 23:59",
  defaultSubCallout: "$482.10 Unspent Stipend Reverts to Treasury at Midnight",
  defaultItems: [
    { label: "Emergency Rainy-Day Buffer", value: "$0.00 MAX", note: "Rollover mathematically disabled", isAlert: true },
    { label: "Forced Month-End Consumption", value: "99.4% BURN", note: "Panic-buying perishable goods before sweep" },
    { label: "Down-Payment Accumulation", value: "IMPOSSIBLE", note: "Cannot save toward productive assets", isAlert: true },
    { label: "Household Bargaining Independence", value: "0 DAYS", note: "Next month's survival requires next month's grant", isAlert: true },
  ],
});

export const AutomatedCobraSeveranceForm = createParametricUiSatire({
  archetype: "pinboard-stamps",
  defaultEyebrow: "HR OFFBOARDING PACKET",
  defaultTitle: "Thank You for Twelve Years: Here Is COBRA and a Pro AI Login",
  defaultSubtitle: "Corporate transition packages pair sixty days of severance with full-freight health premiums and an AI reskilling brochure.",
  defaultSource: "SOURCE: WARN ACT LAYOFF NOTICES & CORPORATE SEVERANCE DISCLOSURES",
  defaultBadge: "POSITION SUNSET",
  defaultHeroCallout: "ROLE AUTOMATED",
  defaultSubCallout: "Effective Friday 17:00 · Badge & Slack Access Revoked",
  defaultItems: [
    { label: "Severance Bridge (8 Weeks)", value: "$14,200", note: "Subject to supplemental tax withholding" },
    { label: "COBRA Family Continuation", value: "$2,180 / MO", note: "102% of full unsubsidized group premium", isAlert: true },
    { label: "Complimentary AI Upskill Seat", value: "12 MONTHS", note: "Expires into $200/mo paid tier", isAlert: true },
    { label: "Non-Disparagement Release", value: "MANDATORY", note: "Required signature to release severance", isAlert: true },
  ],
});

export const BuyNowPayLaterMicroLedger = createParametricUiSatire({
  archetype: "thermal-receipt",
  defaultEyebrow: "PHANTOM INSTALLMENT DEBT",
  defaultTitle: "Splitting Tuesday's Groceries Into Four Overlapping Auto-Drafts",
  defaultSubtitle: "Unreported micro-installment plans stack silently across paydays until simultaneous auto-debits trigger bank NSF cascades.",
  defaultSource: "SOURCE: CFPB BUY-NOW-PAY-LATER MARKET MONITORING REPORT",
  defaultBadge: "4x MICRO-LIENS",
  defaultHeroCallout: "14 ACTIVE PLANS",
  defaultSubCallout: "Unreported on Standard Credit Bureaus Until Default",
  defaultItems: [
    { label: "Grocery Basket #1 (1/4)", value: "$41.00", note: "Auto-debit Friday 06:00" },
    { label: "Utility Bridge Plan (3/4)", value: "$88.50", note: "Stacked on same checking account", isAlert: true },
    { label: "Late-Fee + Bank Overdraft", value: "$35.00 + $15", note: "Effective APR > 180% on $41 slice", isAlert: true },
    { label: "True Disposable Remainder", value: "-$62.40", note: "Next month's income pre-spent", isAlert: true },
  ],
});

export const CaptivePartnerCatalogGrid = createParametricUiSatire({
  archetype: "viewer-quiz",
  defaultEyebrow: "COMPANY STOREFRONT 2034",
  defaultTitle: "What 100,000 Compute Credits Actually Buy Outside the Cloud",
  defaultSubtitle: "High nominal token grants mask strict redemption walls between abundant digital goods and scarce physical essentials.",
  defaultSource: "SOURCE: CLOUD CREDIT REDEMPTION SCHEDULES & ECOSYSTEM TERMS",
  defaultBadge: "PAR vs $0.00",
  defaultHeroCallout: "1.0x vs 0.0x",
  defaultSubCallout: "Infinite Pixels, Zero Kilowatt-Hours or Shelter",
  defaultItems: [
    { label: "Batch LLM Inference & Storage", value: "100% PAR", note: "Zero marginal cash cost to issuer" },
    { label: "Partner Streaming & Gaming", value: "100% PAR", note: "Bundled digital retention perk" },
    { label: "County Property Tax Lien", value: "$0.00 VALID", note: "Statutory US Dollars required", isAlert: true },
    { label: "Municipal Water & kWh Delivery", value: "$0.00 VALID", note: "Hard physical utility settlement", isAlert: true },
  ],
});

export const ProgrammableRuleBuilderUI = createParametricUiSatire({
  archetype: "wallet-console",
  defaultEyebrow: "POLICY CONSOLE · MONETARY API",
  defaultTitle: "Fiscal Policy as a JSON Config Push to 130 Million Wallets",
  defaultSubtitle: "When household income routes through programmable rails, stimulus, demurrage, and category locks become live toggles.",
  defaultSource: "SOURCE: BIS PROJECT ROSALIND & PROGRAMMABLE LEDGER ARCHITECTURES",
  defaultBadge: "LIVE POLICY PUSH",
  defaultHeroCallout: "DEMURRAGE: ON",
  defaultSubCallout: "if (balance_age > 30d) apply_decay(-4.5%);",
  defaultItems: [
    { label: "Toggle 01 · Monthly Expiry", value: "30 DAYS", note: "Forces 100% consumption velocity", isAlert: true },
    { label: "Toggle 02 · Carbon / kWh Cap", value: "450 kWh / MO", note: "Surcharge multiplier above quota", isAlert: true },
    { label: "Toggle 03 · Asset-Exit Block", value: "ACTIVE", note: "Blocks conversion to gold, FX, or land", isAlert: true },
    { label: "Deployment Latency", value: "< 200 ms", note: "Zero legislative floor debate required" },
  ],
});

export const CivicDossierRedactionPlate = createParametricUiSatire({
  archetype: "pinboard-stamps",
  defaultEyebrow: "DECLASSIFIED KITCHEN-TABLE MEMO",
  defaultTitle: "What Macro Whitepapers Leave Inside the Footnote",
  defaultSubtitle: "Side-by-side reading of optimistic aggregate GDP slides against household balance-sheet solvency constraints.",
  defaultSource: "SOURCE: READING ROOM ARCHIVAL SYNTHESIS · EPISODE 01",
  defaultBadge: "FOOTNOTE #14",
  defaultHeroCallout: "GDP UP · SOLVENCY DOWN",
  defaultSubCallout: "Aggregate output surges while median debt-service fails.",
  defaultItems: [
    { label: "Headline Real GDP Growth", value: "+6.8% / YR", note: "Driven by autonomous cluster output" },
    { label: "Labor Share of National Income", value: "58% -> 34%", note: "Steepest structural drop on record", isAlert: true },
    { label: "Household Nominal Liabilities", value: "$18.0T FIXED", note: "Anchored to pre-deflation wages", isAlert: true },
    { label: "Fiscal Bridge Requirement", value: "PERMANENT", note: "Temporary relief solidifies into allowance", isAlert: true },
  ],
});

export const UI_SATIRE_COLLAGE_STYLES: readonly UiSatireRecipe[] = [
  { id: "longitudinal-household-dossier", name: "Claire's 2025–2036 Austin Household Dossier", componentName: "LongitudinalHouseholdDossier", defaultFraming: "fullscreen-cutaway", description: "Stateful Austin house elevation + 4-era T-account tracking $3,400 mortgage lock, -70% pay cut, refi denial, locked 401(k), and August A/C shock." },
  { id: "perishable-seat-vs-compute-split", name: "Perishable Seat 14A vs Expiring GPU Window", componentName: "PerishableSeatVsComputeSplit", defaultFraming: "fullscreen-cutaway", description: "Pushing-back airliner empty seat 14A paired with expiring Tuesday off-peak GPU cluster clock." },
  { id: "closed-compute-scrip-wallet", name: "Closed-Loop Compute Scrip Wallet & Tollgate", componentName: "ClosedComputeScripWallet", defaultFraming: "fullscreen-cutaway", description: "100,000 cloud credits declining at $0.00 on Chase mortgage ACH vs 0% captive partner rails and -20% cash-out haircut." },
  { id: "coal-scrip-vs-digital-yuan", name: "1912 Coal Brass Scrip vs 2020 Shenzhen e-CNY", componentName: "CoalScripVsDigitalYuan", defaultFraming: "fullscreen-cutaway", description: "1912 Island Creek Coal brass token (-25% cash haircut) paired with 2020 Shenzhen 6-day expiring digital yuan pilot." },
  { id: "fountain-pen-veto-slash", name: "Executive Fountain-Pen Line-Item Veto Slash", componentName: "FountainPenVetoSlash", defaultFraming: "fullscreen-cutaway", description: "Executive fountain-pen nib slicing statutory household allocation from $2,052 to $1,022 (-50.2% instant cut)." },
  { id: "unwritten-truce-to-allowance", name: "200-Year Paycheck to Allowance Strikethrough", componentName: "UnwrittenTruceToAllowance", defaultFraming: "fullscreen-cutaway", description: "Industrial 48-hour-walkout social contract morphing via heavy crimson strikethrough from PAYCHECK to ALLOWANCE." },
  { id: "roof-drone-escrow-shock", name: "Insurer Roof-Drone Non-Renewal & Escrow Spike", componentName: "RoofDroneEscrowShock", defaultFraming: "over-footage", description: "Aerial LiDAR roof-granule scan triggering automated policy non-renewal and +$410/mo forced mortgage escrow jump." },
  { id: "thermal-receipt-inflation-roll", name: "Thermal Receipt Bifurcated Price Roll", componentName: "ThermalReceiptInflationRoll", defaultFraming: "over-footage", description: "Unspooling thermal receipt contrasting $0.00 software deflation at top against +41% sticky shelter, grid, and tax floor." },
  { id: "refinance-denial-modal", name: "Automated DTI Refinance Denial Modal", componentName: "RefinanceDenialModal", defaultFraming: "over-footage", description: "Banking underwriting dialog rejecting $310k paper home equity due to post-AI 95.8% debt-to-income ratio." },
  { id: "hinged-brass-jaw-cutout", name: "Hinged Brass-Rivet Paper Cutout Decoder", componentName: "HingedBrassJawCutout", defaultFraming: "over-footage", description: "Archival hinged paper-cutout bust with deterministic brass-rivet jaw translating institutional PR into balance-sheet math." },
  { id: "viewer-game-quiz-card", name: "Audience Prediction Quiz & Treasury Reveal", componentName: "ViewerGameQuizCard", defaultFraming: "fullscreen-cutaway", description: "Three-option viewer retention prediction card revealing 84% payroll share vs 7%–9% corporate tax share." },
  { id: "terms-of-service-scroll-trap", name: "Clause 19.4 Revocable Allocation Scroll Trap", componentName: "TermsOfServiceScrollTrap", defaultFraming: "over-footage", description: "Digital wallet master service agreement with greyed-out Decline button and unilateral rate-limit amendment." },
  { id: "dynamic-surge-meter-tag", name: "106°F Austin Real-Time Surge Meter UI", componentName: "DynamicSurgeMeterTag", defaultFraming: "over-footage", description: "ERCOT peak afternoon smart-meter tariff jumping to $0.68/kWh while data-center PPAs stay hedged." },
  { id: "four-escape-hatches-board", name: "Four Sealed Middle-Class Escape Hatches Pinboard", componentName: "FourEscapeHatchesBoard", defaultFraming: "fullscreen-cutaway", description: "Episode continuity pinboard stamping Retrain, Cut Spend, Refinance, and Tap 401(k) as structurally blocked." },
  { id: "subscription-trap-stack", name: "First-of-Month Pre-Committed Debit Stack", componentName: "SubscriptionTrapStack", defaultFraming: "over-footage", description: "Day-1 non-cancelable mortgage, property tax, hazard escrow, and grid connection charges totaling $3,400/mo." },
  { id: "algorithmic-credit-score-drop", name: "Algorithmic Credit-Cliff Feedback Gauge", componentName: "AlgorithmicCreditScoreDrop", defaultFraming: "over-footage", description: "780-to-612 credit-tier drop repricing APRs and auto insurance despite 20 years of on-time mortgage payments." },
  { id: "company-town-store-ledger", name: "1912 Company Commissary Deduction Passbook", componentName: "CompanyTownStoreLedger", defaultFraming: "fullscreen-cutaway", description: "Double-column 1912 coal company passbook netting shanty rent and commissary markups down to $0.00 cash due." },
  { id: "geo-fenced-spend-map-card", name: "Geo-Fenced 5km Programmable Stipend Card", componentName: "GeoFencedSpendMapCard", defaultFraming: "over-footage", description: "MCC and GPS polygon rule card approving local consumption while blocking brokerage, gold, or out-of-zone spend." },
  { id: "expiration-countdown-toast", name: "Midnight Stipend Expiration Countdown Toast", componentName: "ExpirationCountdownToast", defaultFraming: "over-footage", description: "Sunday 23:59:59 wallet sweep toast warning unspent monthly allowance reverts to issuer with zero savings rollover." },
  { id: "automated-cobra-severance-form", name: "Automated Role-Sunset & COBRA Offboarding Packet", componentName: "AutomatedCobraSeveranceForm", defaultFraming: "fullscreen-cutaway", description: "HR severance packet pairing $2,180/mo COBRA health continuation with a 12-month promotional AI login." },
  { id: "buy-now-pay-later-micro-ledger", name: "Stacked Grocery BNPL Micro-Lien Ledger", componentName: "BuyNowPayLaterMicroLedger", defaultFraming: "over-footage", description: "Fourteen overlapping biweekly grocery and utility micro-installments triggering bank overdraft cascades." },
  { id: "captive-partner-catalog-grid", name: "Captive Cloud Catalog vs Physical Survival Grid", componentName: "CaptivePartnerCatalogGrid", defaultFraming: "fullscreen-cutaway", description: "1.0x par value on LLM tokens and streaming vs $0.00 acceptance on property taxes and municipal kWh." },
  { id: "programmable-rule-builder-ui", name: "Central-Bank Programmable Wallet Policy Console", componentName: "ProgrammableRuleBuilderUI", defaultFraming: "fullscreen-cutaway", description: "Live JSON policy console toggling 30-day demurrage decay, kWh quotas, and asset-exit blocks in <200ms." },
  { id: "civic-dossier-redaction-plate", name: "Macro GDP vs Household Solvency Dossier Plate", componentName: "CivicDossierRedactionPlate", defaultFraming: "fullscreen-cutaway", description: "Declassified archival memo contrasting +6.8% autonomous GDP growth against $18T fixed household liabilities." },
] as const;
