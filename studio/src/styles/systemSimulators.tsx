import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, TABULAR_NUM_STYLE, getOpticalTracking } from "../design/fonts";
import {
  COLORS,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
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
  atFrame?: number;
}

interface SimulatorShellTheme {
  isGlass: boolean;
  inkHeadline: string;
  inkBody: string;
  inkMuted: string;
  navyInk: string;
  accentAlert: string;
  accentTeal: string;
  accentSlate: string;
  panelBg: string;
  panelBorder: string;
  wellBg: string;
}

function getSimulatorTheme(isGlass: boolean): SimulatorShellTheme {
  if (isGlass) {
    return {
      isGlass: true,
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline,
      inkBody: OVER_FOOTAGE_PALETTE.textBody,
      inkMuted: OVER_FOOTAGE_PALETTE.textMuted,
      navyInk: OVER_FOOTAGE_PALETTE.accentPrimary,
      accentAlert: OVER_FOOTAGE_PALETTE.brickRedText,
      accentTeal: OVER_FOOTAGE_PALETTE.chartSecondary,
      accentSlate: OVER_FOOTAGE_PALETTE.accentPrimary,
      panelBg: "rgba(15, 25, 35, 0.56)",
      panelBorder: OVER_FOOTAGE_PALETTE.glassBorder,
      wellBg: OVER_FOOTAGE_PALETTE.glassDarkWell,
    };
  }
  return {
    isGlass: false,
    inkHeadline: PAGE_PALETTE.navy,
    inkBody: PAGE_PALETTE.navy,
    inkMuted: PAGE_PALETTE.muted,
    navyInk: PAGE_PALETTE.navy,
    accentAlert: PAGE_PALETTE.brickRed,
    accentTeal: PAGE_PALETTE.chartSecondary,
    accentSlate: PAGE_PALETTE.gold,
    panelBg: PAGE_PALETTE.paper,
    panelBorder: PAGE_PALETTE.paperBorder,
    wellBg: PAGE_PALETTE.paperLight,
  };
}

interface SimulatorShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  sourceCitation: string;
  summaryMetric?: string;
  summaryLabel?: string;
  mode?: SimulatorDisplayMode;
  paletteMode?: "page" | "over-footage";
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

  const resolvedMode: SimulatorDisplayMode =
    mode ?? (paletteMode === "over-footage" ? "over-footage" : "page");
  const isGlass = resolvedMode === "over-footage";
  const theme = getSimulatorTheme(isGlass);

  if (resolvedMode !== "page") {
    return (
      <div
        style={{
          width: "640px",
          background: isGlass
            ? OVER_FOOTAGE_PALETTE.glassPrimary
            : PAGE_PALETTE.paperLight,
          backdropFilter: isGlass ? "blur(14px) saturate(155%)" : undefined,
          WebkitBackdropFilter: isGlass ? "blur(14px) saturate(155%)" : undefined,
          border: `1px solid ${
            isGlass ? OVER_FOOTAGE_PALETTE.glassBorder : PAGE_PALETTE.paperBorder
          }`,
          borderRadius: "18px",
          padding: "24px 28px",
          boxSizing: "border-box",
          boxShadow: isGlass
            ? "0 22px 48px rgba(15, 25, 35, 0.48)"
            : "0 20px 44px rgba(28, 43, 58, 0.12)",
          opacity: enter,
          transform: `translate3d(0, ${((1 - enter) * 16).toFixed(1)}px, 0)`,
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: getOpticalTracking(11, "mono"),
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
              }}
            >
              {summaryMetric}
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: "24px",
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
            border: `1px solid ${theme.panelBorder}`,
            padding: "12px",
            boxSizing: "border-box",
          }}
        >
          {renderGraphic(theme, elapsed, fps)}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: PAGE_PALETTE.paperLight,
        padding: "56px 88px 48px 88px",
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
            linear-gradient(to right, ${COLORS.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${COLORS.gridLine} 1px, transparent 1px)
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
          borderBottom: `2.5px solid ${PAGE_PALETTE.navy}`,
          paddingBottom: "20px",
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
              color: PAGE_PALETTE.brickRed,
              marginBottom: "8px",
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: FONTS.serif,
              fontSize: "48px",
              fontWeight: 700,
              lineHeight: 1.08,
              color: PAGE_PALETTE.navy,
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
              color: PAGE_PALETTE.muted,
            }}
          >
            {subtitle}
          </p>
        </div>

        {summaryMetric && (
          <div
            style={{
              backgroundColor: PAGE_PALETTE.paper,
              border: `1.5px solid ${PAGE_PALETTE.navy}`,
              borderLeft: `5px solid ${PAGE_PALETTE.brickRed}`,
              borderRadius: "10px",
              padding: "14px 22px",
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: PAGE_PALETTE.muted,
              }}
            >
              {summaryLabel}
            </div>
            <div
              style={{
                ...TABULAR_NUM_STYLE,
                fontFamily: FONTS.mono,
                fontSize: "32px",
                fontWeight: 700,
                color: PAGE_PALETTE.navy,
                marginTop: "4px",
              }}
            >
              {summaryMetric}
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
          margin: "24px 0",
          backgroundColor: PAGE_PALETTE.paper,
          border: `2px solid ${PAGE_PALETTE.navy}`,
          borderRadius: "16px",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 44px rgba(28, 43, 58, 0.09)",
          opacity: enter,
        }}
      >
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
          fontFamily: FONTS.mono,
          fontSize: "12.5px",
          color: PAGE_PALETTE.muted,
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
      atFrame={atFrame}
      renderGraphic={(theme, elapsed, fps) => {
        const vapor = interpolate(
          studioSpring(elapsed, fps, "cameraGlide", 18),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const currentPrice = Math.round(retailPrice - (retailPrice - 24) * vapor);

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
            <text
              x="84"
              y="118"
              fontFamily={FONTS.mono}
              fontSize="14"
              fontWeight="700"
              fill={theme.accentAlert}
            >
              X-RAY UNIT COST AUDIT
            </text>
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
            <text
              x="84"
              y="232"
              fontFamily={FONTS.sans}
              fontSize="17"
              fontWeight="600"
              fill={theme.inkMuted}
            >
              Effective Clearing Price ({Math.round((1 - vapor * 0.8) * 100)}% of 2025 MSRP)
            </text>

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
              <text
                x="184"
                y="174"
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontSize="12"
                fontWeight="700"
                fill={OVER_FOOTAGE_PALETTE.textHeadline}
              >
                $24 ATOMS + 18 kWh SOLE PLINTH
              </text>
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
                  <text
                    x="32"
                    y="40"
                    fontFamily={FONTS.sans}
                    fontSize="20"
                    fontWeight="700"
                    fill={
                      sl.isLabor
                        ? theme.inkHeadline
                        : OVER_FOOTAGE_PALETTE.textHeadline
                    }
                  >
                    {sl.label}
                  </text>
                  <text
                    x="32"
                    y="63"
                    fontFamily={FONTS.mono}
                    fontSize="13"
                    fill={
                      sl.isLabor
                        ? theme.inkMuted
                        : OVER_FOOTAGE_PALETTE.accentPrimary
                    }
                  >
                    {sl.detail}
                  </text>
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
      atFrame={atFrame}
      renderGraphic={(_theme, elapsed, fps) => {
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
              minHeight: "340px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              perspective: "1800px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "92%",
                height: "84%",
                minHeight: "300px",
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
                    border: `8px solid ${PAGE_PALETTE.paperBorder}`,
                    borderRadius: "16px",
                    padding: "40px 52px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 24px 48px rgba(28, 43, 58, 0.14)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "14px",
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
                        fontSize: "54px",
                        fontWeight: 700,
                        color: PAGE_PALETTE.navy,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {frontFormula}
                    </div>
                    <div
                      style={{
                        marginTop: "14px",
                        fontFamily: FONTS.sans,
                        fontSize: "22px",
                        color: PAGE_PALETTE.muted,
                      }}
                    >
                      {frontSubtext}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
                    <div style={{ width: "88px", height: "12px", borderRadius: "6px", backgroundColor: PAGE_PALETTE.chartSecondary }} />
                    <div style={{ width: "88px", height: "12px", borderRadius: "6px", backgroundColor: PAGE_PALETTE.brickRed }} />
                    <span style={{ fontFamily: FONTS.mono, fontSize: "13px", color: PAGE_PALETTE.muted }}>
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
                    borderRadius: "16px",
                    padding: "40px 52px",
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
                      fontSize: "14px",
                      fontWeight: 700,
                      color: OVER_FOOTAGE_PALETTE.brickRedText,
                    }}
                  >
                    <span>SIDE B · CAST-IRON PROMISSORY LIEN</span>
                    <span>RIVETED FIXED PRINCIPAL</span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "20px",
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
                        fontSize: "68px",
                        fontWeight: 700,
                        color: OVER_FOOTAGE_PALETTE.textHeadline,
                        marginTop: "10px",
                      }}
                    >
                      {backMonthlyPayment}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "15px",
                      color: OVER_FOOTAGE_PALETTE.textBody,
                      borderTop: "1px solid rgba(191,214,234,0.28)",
                      paddingTop: "14px",
                    }}
                  >
                    360 SCHEDULED PAYMENTS · ZERO DEFLATION INDEXATION · DEFAULT = FORECLOSURE
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
// 3. DualTaxPlumbingSchematic (W-2 Withholding Guillotine vs Corporate Bypass)
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed, fps) => {
      const bladeDrop = interpolate(
        Math.sin(elapsed * 0.16),
        [-1, 1],
        [0, 38],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const flowShift = (elapsed * 4) % 48;
      const enter = studioSpring(elapsed, fps, "editorialSnap", 4);

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620" opacity={enter}>
          {/* Top Conduit: W-2 Payroll Pipe */}
          <text x="64" y="72" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.inkHeadline}>
            {w2GrossLabel}
          </text>
          <rect x="64" y="94" width="600" height="78" rx="8" fill={PAGE_PALETTE.navy} />
          <line
            x1="84"
            y1="133"
            x2="650"
            y2="133"
            stroke={OVER_FOOTAGE_PALETTE.accentPrimary}
            strokeWidth="6"
            strokeDasharray="22 26"
            strokeDashoffset={-flowShift}
          />
          {/* Narrowed Post-Guillotine Worker Pipe */}
          <rect x="740" y="114" width="750" height="44" rx="6" fill={theme.accentSlate} />
          <text x="1115" y="142" textAnchor="middle" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            NET CHECKING DEPOSIT (POST-WITHHOLDING)
          </text>

          {/* Treasury Skim Downspout */}
          <rect x="668" y="152" width="56" height="108" fill={PAGE_PALETTE.brickRed} />
          <text x="744" y="218" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={theme.accentAlert}>
            IRS TREASURY INTERCEPT
          </text>

          {/* Reciprocating Guillotine Gate */}
          <g transform={`translate(656, ${(44 + bladeDrop).toFixed(1)})`}>
            <rect x="0" y="0" width="80" height="58" rx="4" fill={PAGE_PALETTE.brickRed} stroke={theme.inkHeadline} strokeWidth="2.5" />
            <polygon points="0,58 80,58 80,86 0,68" fill="#C76250" stroke={theme.inkHeadline} strokeWidth="2" />
          </g>
          <text x="700" y="42" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={theme.accentAlert}>
            {w2SkimLabel}
          </text>

          {/* Divider */}
          <line x1="64" y1="292" x2="1496" y2="292" stroke={theme.panelBorder} strokeWidth="2" strokeDasharray="8 8" />

          {/* Bottom Conduit: Corporate & Asset Manifold */}
          <text x="64" y="342" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.accentTeal}>
            AUTONOMOUS COMPUTE & EQUITY MANIFOLD · THREE LEGAL BYPASS LOOPS
          </text>
          <rect x="64" y="370" width="280" height="92" rx="10" fill={PAGE_PALETTE.chartSecondary} />
          <text x="204" y="422" textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            GROSS OPERATING CASH
          </text>

          {bypassRoutes.map((route, idx) => {
            const ry = 352 + idx * 82;
            return (
              <g key={`byp-${idx}`}>
                <path
                  d={`M 344 416 C 430 416, 430 ${ry + 24}, 510 ${ry + 24} L 1060 ${ry + 24} C 1140 ${ry + 24}, 1140 416, 1216 416`}
                  fill="none"
                  stroke={PAGE_PALETTE.chartSecondary}
                  strokeWidth="16"
                />
                <rect x="536" y={ry} width="500" height="48" rx="8" fill={theme.wellBg} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2" />
                <text x="786" y={ry + 30} textAnchor="middle" fontFamily={FONTS.mono} fontSize="14.5" fontWeight="700" fill={theme.inkHeadline}>
                  VALVE 0{idx + 1} · {route}
                </text>
              </g>
            );
          })}

          <rect x="1216" y="370" width="280" height="92" rx="10" fill={PAGE_PALETTE.navy} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="3" />
          <text x="1356" y="412" textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            COMPOUNDING EQUITY
          </text>
          <text x="1356" y="438" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
            0.0% REALIZED TAX EVENT
          </text>
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const streamDash = (elapsed * 3.5) % 36;
      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Upstream Reservoir */}
          <rect x="56" y="88" width="330" height="460" rx="12" fill={PAGE_PALETTE.navy} />
          <rect x="74" y="168" width="294" height="364" rx="8" fill={PAGE_PALETTE.gold} opacity={0.85} />
          <text x="221" y="136" textAnchor="middle" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            DEPLETING TAX RESERVOIR
          </text>

          {/* Concrete Stepped Dam Wall */}
          <polygon points="386,74 470,74 548,548 386,548" fill={PAGE_PALETTE.paperBorder} stroke={PAGE_PALETTE.navy} strokeWidth="3" />

          {/* Tier 1 Senior Bondholder Spillway */}
          <path d="M 386 156 L 720 156" stroke={PAGE_PALETTE.brickRed} strokeWidth="34" />
          <path d="M 386 156 L 720 156" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="6" strokeDasharray="16 20" strokeDashoffset={-streamDash} />
          <rect x="720" y="106" width="776" height="104" rx="10" fill={theme.wellBg} stroke={PAGE_PALETTE.brickRed} strokeWidth="2.5" />
          <text x="752" y="148" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.accentAlert}>
            {tier1Label}
          </text>
          <text x="752" y="186" fontFamily={FONTS.mono} fontSize="28" fontWeight="700" fill={theme.inkHeadline} style={TABULAR_NUM_STYLE}>
            {tier1Amount} · DEFAULT = TREASURY MARKET FREEZE
          </text>

          {/* Tier 2 Statutory Penstock */}
          <path d="M 426 318 L 720 318" stroke={PAGE_PALETTE.chartSecondary} strokeWidth="28" />
          <path d="M 426 318 L 720 318" stroke={OVER_FOOTAGE_PALETTE.textHeadline} strokeWidth="5" strokeDasharray="14 22" strokeDashoffset={-streamDash} />
          <rect x="720" y="268" width="776" height="104" rx="10" fill={theme.wellBg} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2" />
          <text x="752" y="310" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.accentTeal}>
            {tier2Label}
          </text>
          <text x="752" y="348" fontFamily={FONTS.mono} fontSize="26" fontWeight="700" fill={theme.inkHeadline} style={TABULAR_NUM_STYLE}>
            {tier2Amount} · MANDATORY OUTLAYS
          </text>

          {/* Tier 3 Starved Citizen Trough */}
          <line x1="478" y1="484" x2="720" y2="484" stroke={theme.inkMuted} strokeWidth="4" strokeDasharray="6 10" />
          <rect x="720" y="432" width="776" height="108" rx="10" fill={theme.wellBg} stroke={theme.inkMuted} strokeWidth="2" strokeDasharray="8 6" />
          <text x="752" y="476" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.inkMuted}>
            {tier3Label}
          </text>
          <text x="752" y="514" fontFamily={FONTS.mono} fontSize="24" fontWeight="700" fill={theme.accentAlert} style={TABULAR_NUM_STYLE}>
            RESIDUAL FLOW: $0.00 SURPLUS WITHOUT MONETIZATION
          </text>
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const trolleyX = 960 + Math.sin(elapsed * 0.08) * 140;
      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left Panel: 1955 Frozen Pier */}
          <rect x="40" y="44" width="716" height="532" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.navy} strokeWidth="2.5" />
          <text x="76" y="92" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={theme.inkHeadline}>
            {leftEra}
          </text>
          {/* Frozen Gantry Crane */}
          <path d="M 140 420 L 180 180 L 520 180 M 220 420 L 180 180" fill="none" stroke={PAGE_PALETTE.navy} strokeWidth="8" />
          <rect x="330" y="210" width="96" height="58" fill={PAGE_PALETTE.brickRed} />
          <text x="378" y="244" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            HALTED
          </text>
          <rect x="76" y="448" width="644" height="96" rx="8" fill={PAGE_PALETTE.riskFill} stroke={PAGE_PALETTE.brickRed} strokeWidth="2" />
          <text x="104" y="486" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
            OWNER REVENUE BLEED: -$1.4M / DAY
          </text>
          <text x="104" y="518" fontFamily={FONTS.sans} fontSize="18" fontWeight="700" fill={PAGE_PALETTE.navy}>
            Worker Leverage: CRITICAL (Production = 0% Without Labor)
          </text>

          {/* Right Panel: 2034 Robotic Port */}
          <rect x="804" y="44" width="716" height="532" rx="14" fill={PAGE_PALETTE.navyDeep} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2.5" />
          <text x="840" y="92" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
            {rightEra}
          </text>
          {/* Moving Robotic Gantry */}
          <path d="M 880 420 L 880 176 L 1440 176 L 1440 420" fill="none" stroke={OVER_FOOTAGE_PALETTE.accentPrimary} strokeWidth="7" />
          <rect x={trolleyX} y="190" width="110" height="54" rx="4" fill={PAGE_PALETTE.chartSecondary} />
          <text x={trolleyX + 55} y="223" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            AGV · 99.9%
          </text>
          <rect x="840" y="448" width="644" height="96" rx="8" fill="rgba(28, 43, 58, 0.9)" stroke={OVER_FOOTAGE_PALETTE.glassBorder} strokeWidth="1.5" />
          <text x="868" y="486" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
            OWNER CASH FLOW: UNINTERRUPTED (24/7 LIGHTS-OUT)
          </text>
          <text x="868" y="518" fontFamily={FONTS.sans} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            Protest Shifted to Capitol Steps · Economic Shutdown Leverage: 0.0%
          </text>
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed, fps) => (
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

          return (
            <g key={`watt-${idx}`} transform={`translate(56, ${y})`} opacity={prog}>
              <rect x="0" y="0" width="220" height="104" rx="10" fill={theme.wellBg} stroke={fill} strokeWidth="2.5" />
              <text x="110" y="48" textAnchor="middle" fontFamily={FONTS.mono} fontSize="30" fontWeight="700" fill={theme.inkHeadline} style={TABULAR_NUM_STYLE}>
                {r.wattage}
              </text>
              <text x="110" y="80" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="600" fill={theme.inkMuted} style={TABULAR_NUM_STYLE}>
                {r.exponent}
              </text>

              <rect x="248" y="10" width={Math.max(40, r.barWidth * prog)} height="84" rx="10" fill={fill} />
              <text
                x={276}
                y="48"
                fontFamily={FONTS.sans}
                fontSize="21"
                fontWeight="700"
                fill={OVER_FOOTAGE_PALETTE.textHeadline}
              >
                {r.objectLabel}
              </text>
              <text
                x={276}
                y="76"
                fontFamily={FONTS.mono}
                fontSize="14"
                fontWeight="600"
                fill={OVER_FOOTAGE_PALETTE.textBody}
              >
                {r.equivalence}
              </text>
            </g>
          );
        })}
      </svg>
    )}
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const fastAngle = elapsed * 9.5;
      const slowAngle = elapsed * 0.45;
      const slowProgress = Math.min(1, elapsed / 240);

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Top High-RPM Software Track */}
          <rect x="56" y="54" width="1448" height="220" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2.5" />
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
          <text x="284" y="110" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={theme.accentTeal}>
            {fastTrackLabel}
          </text>
          {[0, 1, 2, 3, 4].map((gen) => (
            <g key={`gen-${gen}`} transform={`translate(${284 + gen * 232}, 138)`}>
              <rect width="212" height="92" rx="8" fill={PAGE_PALETTE.navy} />
              <text x="106" y="42" textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
                GEN {gen + 1}.0 SHIPPED
              </text>
              <text x="106" y="68" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={OVER_FOOTAGE_PALETTE.textBody}>
                +{gen * 6} MONTHS
              </text>
            </g>
          ))}

          {/* Bottom Glacial Grid Permitting Track */}
          <rect x="56" y="328" width="1448" height="238" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.brickRed} strokeWidth="2.5" />
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
          <text x="284" y="380" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={theme.accentAlert}>
            {slowTrackLabel}
          </text>
          <rect x="284" y="400" width="1172" height="18" rx="9" fill={PAGE_PALETTE.paperBorder} />
          <rect x="284" y="400" width={Math.max(28, 260 * slowProgress)} height="18" rx="9" fill={PAGE_PALETTE.brickRed} />
          {checkpoints.map((cp, idx) => (
            <g key={`cp-${idx}`} transform={`translate(${284 + idx * 296}, 436)`}>
              <rect width="276" height="96" rx="8" fill={idx === 0 ? PAGE_PALETTE.riskFill : theme.panelBg} stroke={PAGE_PALETTE.brickRed} strokeWidth="1.8" />
              <text x="138" y="44" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
                GATE 0{idx + 1} · LOCKED
              </text>
              <text x="138" y="70" textAnchor="middle" fontFamily={FONTS.sans} fontSize="14" fontWeight="700" fill={PAGE_PALETTE.navy}>
                {cp}
              </text>
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const orbitDeg = (elapsed * 2.2) % 360;
      const orbitRad = (orbitDeg * Math.PI) / 180;
      const px = 780 + Math.cos(orbitRad) * 320;
      const py = 320 + Math.sin(orbitRad) * 195;

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
          <rect x="610" y="258" width="340" height="124" rx="12" fill={theme.wellBg} stroke={PAGE_PALETTE.brickRed} strokeWidth="2.5" />
          <text x="780" y="306" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={theme.accentAlert}>
            EXTERNAL END-USER CASH CHECK
          </text>
          <text x="780" y="346" textAnchor="middle" fontFamily={FONTS.sans} fontSize="19" fontWeight="700" fill={theme.inkHeadline}>
            GPUs Depreciate in 3–4 Yrs
          </text>

          {/* Node A Top */}
          <rect x="570" y="42" width="420" height="104" rx="12" fill={PAGE_PALETTE.navy} />
          <text x="780" y="88" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            {nodeA}
          </text>
          <text x="780" y="118" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
            1. Equity Check + Offtake Backstop
          </text>

          {/* Node B Bottom Right */}
          <rect x="980" y="446" width="440" height="108" rx="12" fill={PAGE_PALETTE.chartSecondary} />
          <text x="1200" y="492" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            {nodeB}
          </text>
          <text x="1200" y="522" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fill={OVER_FOOTAGE_PALETTE.textBody}>
            2. Pledges H100/B200 Racks as Collateral
          </text>

          {/* Node C Bottom Left */}
          <rect x="140" y="446" width="440" height="108" rx="12" fill={PAGE_PALETTE.brickRed} />
          <text x="360" y="492" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            {nodeC}
          </text>
          <text x="360" y="522" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fill={OVER_FOOTAGE_PALETTE.textBody}>
            3. Debt Proceeds Buy More Vendor GPUs
          </text>
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed) => {
      const firedCount = Math.min(28, Math.floor(elapsed / 6));
      const cells: number[] = [];
      for (let i = 0; i < 32; i++) cells.push(i);

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left Swarm Wave */}
          <rect x="48" y="64" width="620" height="492" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.brickRed} strokeWidth="2.5" />
          <text x="84" y="114" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={theme.accentAlert}>
            INBOUND SWARM · {droneUnitCost}
          </text>
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
          <text x="84" y="518" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.inkHeadline} style={TABULAR_NUM_STYLE}>
            SWARM EXPENDITURE (28 UNITS): ${(28 * 20).toLocaleString()}K TOTAL
          </text>

          {/* Right Mk 41 VLS Magazine */}
          <rect x="736" y="64" width="776" height="492" rx="14" fill={PAGE_PALETTE.navyDeep} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2.5" />
          <text x="774" y="114" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
            MK 41 VLS MAGAZINE (32 CELLS) · {carrierAssetValue}
          </text>
          <text x="774" y="144" fontFamily={FONTS.mono} fontSize="13" fill={OVER_FOOTAGE_PALETTE.textBody}>
            {interceptorUnitCost} · RELOAD AT SEA: IMPOSSIBLE
          </text>

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

          <text x="774" y="518" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.brickRedText} style={TABULAR_NUM_STYLE}>
            DEFENDER DRAIN ({firedCount} CELLS FIRED): ${(firedCount * 4.2).toFixed(1)}M EXPENDED
          </text>
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed, fps) => {
      const anchorDrop = interpolate(
        studioSpring(elapsed, fps, "heavyStamp", 26),
        [0, 1],
        [0, 145],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const isSevered = anchorDrop > 110;

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
          <rect x="640" y="72" width="860" height="476" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.navy} strokeWidth="2" />
          <text x="680" y="122" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={theme.inkHeadline}>
            {cableCountLabel} · {dailySettlementLabel}
          </text>

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

          <rect x="680" y="424" width="780" height="88" rx="8" fill={isSevered ? PAGE_PALETTE.riskFill : theme.panelBg} stroke={PAGE_PALETTE.brickRed} strokeWidth="2" />
          <text x="710" y="462" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
            {isSevered ? "FAULT DETECTED · ANCHOR SEVERANCE AT SEABED CHOKEPOINT" : "NOMINAL OPTICAL CARRIER · 8 FIBER PAIRS"}
          </text>
          <text x="710" y="492" fontFamily={FONTS.sans} fontSize="17" fontWeight="700" fill={PAGE_PALETTE.navy}>
            Outer Diameter: 21mm (Garden Hose) · Repair Ship Mobilization: 3 to 8 Weeks
          </text>
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
    atFrame={atFrame}
    renderGraphic={(theme, elapsed, fps) => {
      const switchTrip = studioSpring(elapsed, fps, "mechanicalTick", 32) > 0.6;
      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left: Phoenix 4nm */}
          <rect x="48" y="64" width="460" height="492" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.navy} strokeWidth="2.5" />
          <text x="80" y="114" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.inkHeadline}>
            {trailingFabLabel}
          </text>
          <circle cx="278" cy="300" r="126" fill={PAGE_PALETTE.paper} stroke={PAGE_PALETTE.navy} strokeWidth="3" />
          <text x="278" y="308" textAnchor="middle" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill={PAGE_PALETTE.navy} style={TABULAR_NUM_STYLE}>
            4nm N4
          </text>
          <text x="80" y="508" fontFamily={FONTS.sans} fontSize="16" fontWeight="700" fill={theme.inkMuted}>
            1–2 Generations Behind · Ships Back to Asia for CoWoS
          </text>

          {/* Center: Frontier 2nm/A16 */}
          <rect x="550" y="64" width="460" height="492" rx="14" fill={PAGE_PALETTE.navyDeep} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2.5" />
          <text x="582" y="114" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
            {frontierFabLabel}
          </text>
          <circle cx="780" cy="300" r="126" fill="#18364A" stroke={OVER_FOOTAGE_PALETTE.chartSecondary} strokeWidth="3" />
          <text x="780" y="308" textAnchor="middle" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
            2nm / A16
          </text>
          <text x="582" y="508" fontFamily={FONTS.sans} fontSize="16" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textBody}>
            92% Global Frontier Share · Co-Located CoWoS-L
          </text>

          {/* Right: ASML EUV Remote Kill-Switch */}
          <rect x="1052" y="64" width="460" height="492" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.brickRed} strokeWidth="2.5" />
          <text x="1084" y="114" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.accentAlert}>
            ASML HIGH-NA EUV ($380M SCANNER)
          </text>
          <rect x="1120" y="200" width="324" height="196" rx="12" fill={switchTrip ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy} />
          <text x="1282" y="286" textAnchor="middle" fontFamily={FONTS.mono} fontSize="20" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            REMOTE TELEMETRY BREAKER
          </text>
          <text x="1282" y="328" textAnchor="middle" fontFamily={FONTS.mono} fontSize="26" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.accentWarm}>
            {switchTrip ? "LASER SOURCE LOCKED" : "CALIBRATION ARMED"}
          </text>
          <text x="1084" y="508" fontFamily={FONTS.sans} fontSize="16" fontWeight="700" fill={theme.inkHeadline}>
            Zero Usable Yield Within Days of Firmware Cut
          </text>
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
              stroke={PAGE_PALETTE.navy}
              strokeWidth="2.2"
            />

            {config.archetype === "balance-beam" && (
              <g transform="translate(439, 340)">
                <polygon points="-58,150 58,150 0,20" fill={PAGE_PALETTE.navy} />
                <g transform={`rotate(${(13.5 * settle + pulse * 0.8).toFixed(2)})`}>
                  <rect x="-300" y="-10" width="600" height="20" rx="6" fill={PAGE_PALETTE.gold} />
                  <rect x="-290" y="-110" width="160" height="92" rx="8" fill={PAGE_PALETTE.chartSecondary} />
                  <text x="-210" y="-56" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
                    {leftMetric}
                  </text>
                  <rect x="130" y="-138" width="176" height="120" rx="8" fill={PAGE_PALETTE.brickRed} />
                  <text x="218" y="-70" textAnchor="middle" fontFamily={FONTS.mono} fontSize="20" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
                    {rightMetric}
                  </text>
                </g>
              </g>
            )}

            {config.archetype === "industrial-queue" && (
              <g transform="translate(88, 120)">
                <text x="0" y="0" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.accentAlert}>
                  SERIAL BOTTLENECK · {leftMetric} {"->"} {rightMetric}
                </text>
                {[0, 1, 2, 3, 4].map((slot) => (
                  <g key={`q-${slot}`} transform={`translate(${slot * 136}, 48)`}>
                    <rect
                      width="118"
                      height="210"
                      rx="8"
                      fill={slot < 4 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary}
                      opacity={slot < 4 ? 0.88 : 1}
                    />
                    <text x="59" y="106" textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
                      {slot < 4 ? `QUEUE #${slot + 1}` : "ACTIVE BAY"}
                    </text>
                    <text x="59" y="136" textAnchor="middle" fontFamily={FONTS.mono} fontSize="12" fill={OVER_FOOTAGE_PALETTE.textBody}>
                      {slot < 4 ? "BACKLOGGED" : "ENERGIZED"}
                    </text>
                  </g>
                ))}
                <line x1="0" y1="312" x2="680" y2="312" stroke={PAGE_PALETTE.navy} strokeWidth="6" strokeDasharray="18 14" strokeDashoffset={-dash} />
              </g>
            )}

            {config.archetype === "hydraulic-reservoir" && (
              <g transform="translate(92, 108)">
                <rect x="0" y="36" width="260" height="340" rx="12" fill={PAGE_PALETTE.navy} />
                <rect
                  x="16"
                  y={36 + 110 * settle}
                  width="228"
                  height={Math.max(48, 320 - 110 * settle)}
                  rx="8"
                  fill={PAGE_PALETTE.chartSecondary}
                />
                <text x="130" y="20" textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.inkHeadline}>
                  {leftMetric}
                </text>
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
                <rect x="420" y="176" width="260" height="200" rx="12" fill={PAGE_PALETTE.brickRed} />
                <text x="550" y="282" textAnchor="middle" fontFamily={FONTS.mono} fontSize="20" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
                  {rightMetric}
                </text>
              </g>
            )}

            {config.archetype === "rotary-governor" && (
              <g transform="translate(439, 308)">
                <circle r="168" fill="none" stroke={PAGE_PALETTE.navy} strokeWidth="14" />
                <circle r="132" fill="none" stroke={PAGE_PALETTE.brickRed} strokeWidth="5" strokeDasharray="16 12" />
                <g transform={`rotate(${(elapsed * 3.4).toFixed(1)})`}>
                  <line x1="-148" y1="0" x2="148" y2="0" stroke={PAGE_PALETTE.chartSecondary} strokeWidth="10" />
                  <line x1="0" y1="-148" x2="0" y2="148" stroke={PAGE_PALETTE.chartSecondary} strokeWidth="10" />
                </g>
                <circle r="54" fill={PAGE_PALETTE.navyDeep} />
                <text x="0" y="6" textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
                  {leftMetric}
                </text>
                <text x="0" y="218" textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={theme.accentAlert} style={TABULAR_NUM_STYLE}>
                  TRIP THRESHOLD · {rightMetric}
                </text>
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
                      />
                    </g>
                  );
                })}
                <line x1="0" y1="316" x2="680" y2="316" stroke={PAGE_PALETTE.navy} strokeWidth="5" />
                <text x="0" y="28" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={theme.accentAlert}>
                  {leftMetric} {"->"} {rightMetric}
                </text>
              </g>
            )}

            {config.archetype === "truss-tollgate" && (
              <g transform="translate(92, 118)">
                <polygon points="40,60 640,60 580,148 100,148" fill={PAGE_PALETTE.brickRed} />
                <text x="340" y="112" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
                  OVERHEAD LOAD · {rightMetric}
                </text>
                {[0, 1, 2].map((col) => (
                  <rect
                    key={`tr-col-${col}`}
                    x={148 + col * 168}
                    y="148"
                    width="48"
                    height="210"
                    rx="4"
                    fill={PAGE_PALETTE.navy}
                  />
                ))}
                <rect x="40" y="358" width="600" height="44" rx="6" fill={PAGE_PALETTE.chartSecondary} />
                <text x="340" y="386" textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
                  SUPPORT BASE · {leftMetric}
                </text>
              </g>
            )}

            {/* Right Tabular Mechanical Telemetry Stack */}
            {stages.map((st, idx) => {
              const sy = 56 + idx * 172;
              const borderCol =
                st.tone === "brick"
                  ? PAGE_PALETTE.brickRed
                  : st.tone === "teal"
                  ? PAGE_PALETTE.chartSecondary
                  : PAGE_PALETTE.navy;
              return (
                <g key={`p-st-${idx}`} transform={`translate(874, ${sy})`}>
                  <rect
                    width="640"
                    height="148"
                    rx="12"
                    fill={theme.wellBg}
                    stroke={borderCol}
                    strokeWidth="2.2"
                  />
                  <text x="28" y="44" fontFamily={FONTS.mono} fontSize="13.5" fontWeight="700" fill={borderCol}>
                    STAGE 0{idx + 1} · {st.label.toUpperCase()}
                  </text>
                  <text x="28" y="92" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill={theme.inkHeadline} style={TABULAR_NUM_STYLE}>
                    {st.metric}
                  </text>
                  <text x="28" y="124" fontFamily={FONTS.sans} fontSize="16" fontWeight="600" fill={theme.inkMuted}>
                    {st.detail}
                  </text>
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
