import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, TABULAR_NUM_STYLE, getOpticalTracking } from "../design/fonts";
import {
  COLORS,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
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
  atFrame?: number;
}

interface UiSatireTheme {
  isGlass: boolean;
  inkHeadline: string;
  inkBody: string;
  inkMuted: string;
  navyInk: string;
  accentAlert: string;
  accentTeal: string;
  cardBg: string;
  cardBorder: string;
  wellBg: string;
}

function getUiSatireTheme(isGlass: boolean): UiSatireTheme {
  if (isGlass) {
    return {
      isGlass: true,
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline,
      inkBody: OVER_FOOTAGE_PALETTE.textBody,
      inkMuted: OVER_FOOTAGE_PALETTE.textMuted,
      navyInk: OVER_FOOTAGE_PALETTE.accentPrimary,
      accentAlert: OVER_FOOTAGE_PALETTE.brickRedText,
      accentTeal: OVER_FOOTAGE_PALETTE.chartSecondary,
      cardBg: "rgba(15, 25, 35, 0.58)",
      cardBorder: OVER_FOOTAGE_PALETTE.glassBorder,
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
    cardBg: PAGE_PALETTE.paper,
    cardBorder: PAGE_PALETTE.paperBorder,
    wellBg: PAGE_PALETTE.paperLight,
  };
}

interface UiSatireShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  sourceCitation: string;
  badgeText?: string;
  mode?: UiSatireDisplayMode;
  paletteMode?: "page" | "over-footage";
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

  const resolvedMode: UiSatireDisplayMode =
    mode ?? (paletteMode === "over-footage" ? "over-footage" : "page");
  const isGlass = resolvedMode === "over-footage";
  const theme = getUiSatireTheme(isGlass);

  if (resolvedMode !== "page") {
    return (
      <div
        style={{
          width: "640px",
          background: isGlass
            ? OVER_FOOTAGE_PALETTE.glassPrimary
            : PAGE_PALETTE.paperLight,
          backdropFilter: isGlass ? "blur(14px) saturate(160%)" : undefined,
          WebkitBackdropFilter: isGlass ? "blur(14px) saturate(160%)" : undefined,
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
            alignItems: "center",
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
          {badgeText && (
            <span
              style={{
                ...TABULAR_NUM_STYLE,
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                color: theme.accentTeal,
              }}
            >
              {badgeText}
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
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "12px",
            padding: "12px",
          }}
        >
          {renderStage(theme, elapsed, fps)}
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
        <div style={{ maxWidth: "1300px" }}>
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

        {badgeText && (
          <div
            style={{
              padding: "12px 22px",
              backgroundColor: PAGE_PALETTE.riskFill,
              border: `2px solid ${PAGE_PALETTE.brickRed}`,
              borderRadius: "8px",
              fontFamily: FONTS.mono,
              fontSize: "18px",
              fontWeight: 700,
              color: PAGE_PALETTE.brickRed,
              transform: "rotate(-1.5deg)",
              ...TABULAR_NUM_STYLE,
            }}
          >
            {badgeText}
          </div>
        )}
      </div>

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
        {renderStage(theme, elapsed, fps)}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: FONTS.mono,
          fontSize: "12.5px",
          color: PAGE_PALETTE.muted,
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
    atFrame={atFrame}
    renderStage={(theme, elapsed) => {
      const stageIdx =
        activeStage !== undefined
          ? activeStage
          : (Math.min(3, Math.floor(elapsed / 42)) as 0 | 1 | 2 | 3);

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left: Austin House Architectural Elevation */}
          <rect x="36" y="42" width="560" height="536" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.navy} strokeWidth="2.2" />
          <text x="68" y="88" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={theme.accentAlert}>
            PROPERTY ELEVATION · SOUTH AUSTIN BUNGALOW
          </text>

          {/* Gabled Roof + Austin Sun / A/C Condenser */}
          <polygon points="110,270 316,142 522,270" fill={PAGE_PALETTE.navy} />
          <rect x="146" y="270" width="340" height="190" fill={PAGE_PALETTE.paper} stroke={PAGE_PALETTE.navy} strokeWidth="3" />
          <rect x="286" y="346" width="60" height="114" fill={PAGE_PALETTE.gold} />
          <rect x="180" y="308" width="68" height="58" fill={stageIdx === 3 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary} opacity={0.85} />
          <rect x="384" y="308" width="68" height="58" fill={stageIdx === 3 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary} opacity={0.85} />

          {/* Exterior HVAC Condenser Unit */}
          <rect x="494" y="396" width="52" height="64" rx="4" fill={stageIdx === 3 ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy} />
          <text x="316" y="508" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={theme.inkHeadline} style={TABULAR_NUM_STYLE}>
            LIEN: $3,400/MO · {snapshots[stageIdx].year}
          </text>
          <text x="316" y="540" textAnchor="middle" fontFamily={FONTS.sans} fontSize="15" fontWeight="600" fill={theme.accentAlert}>
            {snapshots[stageIdx].auxiliaryShock}
          </text>

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
                  fill={isCurrent ? (idx >= 1 ? PAGE_PALETTE.riskFill : theme.wellBg) : theme.wellBg}
                  stroke={isCurrent ? PAGE_PALETTE.brickRed : PAGE_PALETTE.paperBorder}
                  strokeWidth={isCurrent ? "3" : "1.5"}
                />
                <text x="26" y="36" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={isCurrent ? PAGE_PALETTE.brickRed : theme.inkMuted}>
                  {sn.year} · {sn.statusTag}
                </text>
                <text x="26" y="74" fontFamily={FONTS.mono} fontSize="22" fontWeight="700" fill={PAGE_PALETTE.chartSecondary} style={TABULAR_NUM_STYLE}>
                  IN: {sn.monthlyInflow}
                </text>
                <text x="450" y="74" fontFamily={FONTS.mono} fontSize="22" fontWeight="700" fill={PAGE_PALETTE.brickRed} style={TABULAR_NUM_STYLE}>
                  OUT: {sn.fixedMortgageLock}
                </text>
                <text x="26" y="104" fontFamily={FONTS.sans} fontSize="15" fontWeight="600" fill={PAGE_PALETTE.navy}>
                  {sn.verdictNote}
                </text>
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
    atFrame={atFrame}
    renderStage={(theme, elapsed) => {
      const pushbackX = Math.min(90, elapsed * 0.8);
      const secLeft = Math.max(0, 59 - Math.floor(elapsed / 4));
      const padSec = secLeft < 10 ? `0${secLeft}` : `${secLeft}`;

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Left: Airliner Cabin Row 14 */}
          <rect x="40" y="44" width="716" height="532" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.navy} strokeWidth="2.5" />
          <text x="76" y="92" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={theme.inkHeadline}>
            FLIGHT PUSHBACK · {seatCode}
          </text>
          <g transform={`translate(${(110 + pushbackX).toFixed(1)}, 168)`}>
            {["14A", "14B", "14C"].map((st, idx) => {
              const isEmpty = st === "14A";
              return (
                <g key={st} transform={`translate(${idx * 164}, 0)`}>
                  <rect
                    width="138"
                    height="184"
                    rx="16"
                    fill={isEmpty ? PAGE_PALETTE.riskFill : PAGE_PALETTE.navy}
                    stroke={isEmpty ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy}
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
                    fill={isEmpty ? PAGE_PALETTE.brickRed : OVER_FOOTAGE_PALETTE.textHeadline}
                  >
                    {st}
                  </text>
                  <text
                    x="69"
                    y="124"
                    textAnchor="middle"
                    fontFamily={FONTS.mono}
                    fontSize="13"
                    fontWeight="700"
                    fill={isEmpty ? PAGE_PALETTE.brickRed : OVER_FOOTAGE_PALETTE.accentPrimary}
                  >
                    {isEmpty ? "UNSOLD · $0" : "OCCUPIED"}
                  </text>
                </g>
              );
            })}
          </g>
          <text x="76" y="514" fontFamily={FONTS.sans} fontSize="19" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
            Cannot Be Stored in a Warehouse for Friday Peak Demand
          </text>

          {/* Right: Expiring Off-Peak GPU Window */}
          <rect x="804" y="44" width="716" height="532" rx="14" fill={PAGE_PALETTE.navyDeep} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2.5" />
          <text x="840" y="92" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
            {gpuWindowLabel}
          </text>
          <circle cx="1162" cy="284" r="126" fill="none" stroke={OVER_FOOTAGE_PALETTE.brickRedText} strokeWidth="8" strokeDasharray="16 10" />
          <text x="1162" y="274" textAnchor="middle" fontFamily={FONTS.mono} fontSize="42" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
            00:00:{padSec}
          </text>
          <text x="1162" y="316" textAnchor="middle" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.brickRedText}>
            UNBURNED TOKENS EVAPORATE
          </text>
          <text x="840" y="514" fontFamily={FONTS.sans} fontSize="19" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
            Issuing Expiring Credits Dumps Idle Off-Peak Cycles at Near-Zero Marginal Cost
          </text>
        </svg>
      );
    }}
  />
);

// ============================================================================
// 3. ClosedComputeScripWallet ($100k Credits = $0 Rent vs -20% Cash-Out Toll)
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
    atFrame={atFrame}
    renderStage={(theme) => (
      <svg width="100%" height="100%" viewBox="0 0 1560 620">
        {/* Left Mobile Scrip Wallet UI */}
        <rect x="52" y="38" width="520" height="544" rx="28" fill={PAGE_PALETTE.navyDeep} stroke={PAGE_PALETTE.navy} strokeWidth="4" />
        <text x="96" y="102" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.accentPrimary}>
          WALLET BALANCE · NON-TRANSFERABLE
        </text>
        <text x="96" y="158" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
          {creditBalance}
        </text>
        <rect x="88" y="204" width="448" height="156" rx="14" fill="rgba(163, 64, 46, 0.34)" stroke={OVER_FOOTAGE_PALETTE.brickRedText} strokeWidth="2" />
        <text x="114" y="248" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.brickRedText}>
          ACH PAYMENT ATTEMPT · CHASE MORTGAGE
        </text>
        <text x="114" y="296" fontFamily={FONTS.mono} fontSize="28" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
          DECLINED · $0.00 USD
        </text>
        <text x="114" y="332" fontFamily={FONTS.sans} fontSize="14" fill={OVER_FOOTAGE_PALETTE.textBody}>
          Error 402: Compute Scrip Not Accepted by County Tax or Bank
        </text>
        <text x="96" y="520" fontFamily={FONTS.mono} fontSize="13" fill={OVER_FOOTAGE_PALETTE.textMuted}>
          EXPIRES END OF BILLING QUARTER · NO ROLLOVER
        </text>

        {/* Right Routing Comparison */}
        <rect x="636" y="76" width="872" height="214" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.chartSecondary} strokeWidth="2.5" />
        <text x="676" y="130" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={PAGE_PALETTE.chartSecondary}>
          RAIL A · CAPTIVE ECOSYSTEM PARTNERS (0.0% FEE)
        </text>
        <text x="676" y="182" fontFamily={FONTS.serif} fontSize="34" fontWeight="700" fill={PAGE_PALETTE.navy}>
          100% Face Value Inside Approved Cloud & Delivery Apps
        </text>
        <text x="676" y="232" fontFamily={FONTS.sans} fontSize="18" fill={PAGE_PALETTE.muted}>
          Revenue stays trapped on the issuer&apos;s consolidated income statement.
        </text>

        <rect x="636" y="330" width="872" height="214" rx="14" fill={PAGE_PALETTE.riskFill} stroke={PAGE_PALETTE.brickRed} strokeWidth="2.5" />
        <text x="676" y="384" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
          RAIL B · EXTERNAL FIAT EXIT BOOTH ({cashHaircutPct})
        </text>
        <text x="676" y="436" fontFamily={FONTS.serif} fontSize="34" fontWeight="700" fill={PAGE_PALETTE.navy}>
          $0.80 on the Dollar Secondary Broker Conversion
        </text>
        <text x="676" y="486" fontFamily={FONTS.sans} fontSize="18" fill={PAGE_PALETTE.navy}>
          Paying off external bank debt triggers an immediate twenty-percent haircut.
        </text>
      </svg>
    )}
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
    atFrame={atFrame}
    renderStage={(theme) => (
      <svg width="100%" height="100%" viewBox="0 0 1560 620">
        {/* Left 1912 Brass Token */}
        <rect x="44" y="48" width="712" height="524" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.navy} strokeWidth="2.5" />
        <text x="80" y="96" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={PAGE_PALETTE.navy}>
          {leftArtifact}
        </text>
        <circle cx="400" cy="296" r="138" fill="#C5A367" stroke="#6E5225" strokeWidth="6" />
        <circle cx="400" cy="296" r="116" fill="none" stroke="#6E5225" strokeWidth="2" strokeDasharray="6 6" />
        <text x="400" y="276" textAnchor="middle" fontFamily={FONTS.serif} fontSize="24" fontWeight="700" fill="#271E15">
          ISLAND CREEK COAL
        </text>
        <text x="400" y="318" textAnchor="middle" fontFamily={FONTS.mono} fontSize="34" fontWeight="700" fill="#271E15" style={TABULAR_NUM_STYLE}>
          $1.00 IN MERCHANDISE
        </text>
        <text x="400" y="352" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
          NOT TRANSFERABLE · -25% CASH DISCOUNT
        </text>
        <text x="80" y="518" fontFamily={FONTS.sans} fontSize="18" fontWeight="700" fill={PAGE_PALETTE.navy}>
          Valid Only at Company Store · Outlawed by Fair Labor Standards Act (1938)
        </text>

        {/* Right 2020 Shenzhen Vanishing App */}
        <rect x="804" y="48" width="712" height="524" rx="14" fill={PAGE_PALETTE.navyDeep} stroke={PAGE_PALETTE.brickRed} strokeWidth="2.5" />
        <text x="840" y="96" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.brickRedText}>
          {rightArtifact}
        </text>
        <rect x="976" y="148" width="368" height="296" rx="22" fill="rgba(163, 64, 46, 0.28)" stroke={OVER_FOOTAGE_PALETTE.glassBorder} strokeWidth="2" />
        <text x="1160" y="216" textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.accentWarm}>
          LUOHU STIMULUS RED PACKET
        </text>
        <text x="1160" y="276" textAnchor="middle" fontFamily={FONTS.mono} fontSize="48" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
          ¥200.00
        </text>
        <text x="1160" y="332" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.brickRedText}>
          VANISHES IN 6 DAYS 00:00
        </text>
        <text x="1160" y="376" textAnchor="middle" fontFamily={FONTS.mono} fontSize="13" fill={OVER_FOOTAGE_PALETTE.textBody}>
          3,389 WHITELISTED MERCHANTS ONLY
        </text>
        <text x="840" y="518" fontFamily={FONTS.sans} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
          Zero Savings Conversion · Unspent Balance Automatically Reclaimed by Issuer
        </text>
      </svg>
    )}
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
    atFrame={atFrame}
    renderStage={(theme, elapsed, fps) => {
      const slash = interpolate(
        studioSpring(elapsed, fps, "inkSweep", 16),
        [0, 1],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          {/* Statutory Ledger Sheet */}
          <rect x="110" y="54" width="1340" height="512" rx="10" fill={theme.wellBg} stroke={PAGE_PALETTE.navy} strokeWidth="2.5" />
          <text x="170" y="128" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={PAGE_PALETTE.muted}>
            {clauseText}
          </text>
          <line x1="170" y1="154" x2="1390" y2="154" stroke={PAGE_PALETTE.paperBorder} strokeWidth="2" />

          {/* Original Amount + Crimson Fountain-Pen Slash */}
          <text x="170" y="308" fontFamily={FONTS.mono} fontSize="96" fontWeight="700" fill={PAGE_PALETTE.navy} style={TABULAR_NUM_STYLE}>
            {originalAmount}
          </text>
          <line
            x1="156"
            y1="322"
            x2={156 + 630 * slash}
            y2={322 - 86 * slash}
            stroke={PAGE_PALETTE.brickRed}
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Fountain Pen Nib Icon */}
          <g transform={`translate(${(156 + 630 * slash).toFixed(1)}, ${(322 - 86 * slash).toFixed(1)}) rotate(-25)`}>
            <polygon points="0,0 44,-16 62,0 44,16" fill={PAGE_PALETTE.navyDeep} />
            <circle cx="24" cy="0" r="4" fill={OVER_FOOTAGE_PALETTE.textHeadline} />
          </g>

          {/* Revised Slashed Amount */}
          <g opacity={slash}>
            <text x="880" y="232" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
              AMENDED BY EXECUTIVE ORDER · EFFECTIVE 00:01
            </text>
            <text x="880" y="318" fontFamily={FONTS.mono} fontSize="96" fontWeight="700" fill={PAGE_PALETTE.brickRed} style={TABULAR_NUM_STYLE}>
              {slashedAmount}
            </text>
          </g>

          <rect x="170" y="418" width="1220" height="96" rx="8" fill={PAGE_PALETTE.riskFill} stroke={PAGE_PALETTE.brickRed} strokeWidth="2" />
          <text x="206" y="474" fontFamily={FONTS.serif} fontSize="26" fontWeight="700" fill={PAGE_PALETTE.navy}>
            Zero Collective Bargaining · Zero Strike Leverage · Instant Server-Side Balance Update
          </text>
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
    atFrame={atFrame}
    renderStage={(theme, elapsed, fps) => {
      const strike = interpolate(
        studioSpring(elapsed, fps, "heavyStamp", 20),
        [0, 1],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      return (
        <svg width="100%" height="100%" viewBox="0 0 1560 620">
          <rect x="96" y="44" width="1368" height="532" rx="14" fill={theme.wellBg} stroke={PAGE_PALETTE.navy} strokeWidth="3" />
          <text x="780" y="114" textAnchor="middle" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={PAGE_PALETTE.muted}>
            1825–2025 INDUSTRIAL COMPACT · BACKED BY 48-HOUR WALKOUT THREAT
          </text>

          {/* Strikethrough PAYCHECK */}
          <text
            x="780"
            y="256"
            textAnchor="middle"
            fontFamily={FONTS.condensed}
            fontSize="118"
            fontWeight="700"
            fill={PAGE_PALETTE.navy}
            opacity={1 - strike * 0.45}
          >
            {oldTerm}
          </text>
          <line
            x1="470"
            y1="216"
            x2={470 + 620 * strike}
            y2="216"
            stroke={PAGE_PALETTE.brickRed}
            strokeWidth="16"
          />

          {/* Stamped ALLOWANCE */}
          <g opacity={strike} transform={`translate(780, 418) rotate(-2)`}>
            <rect x="-350" y="-88" width="700" height="128" rx="10" fill={PAGE_PALETTE.riskFill} stroke={PAGE_PALETTE.brickRed} strokeWidth="5" />
            <text
              x="0"
              y="6"
              textAnchor="middle"
              fontFamily={FONTS.condensed}
              fontSize="104"
              fontWeight="700"
              fill={PAGE_PALETTE.brickRed}
            >
              {newTerm}
            </text>
          </g>

          <text x="780" y="534" textAnchor="middle" fontFamily={FONTS.sans} fontSize="20" fontWeight="700" fill={PAGE_PALETTE.navy}>
            Paycheck = Owed Because They Need You · Allowance = Granted Until the Budget Tightens
          </text>
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
      atFrame={atFrame}
      renderStage={(theme, elapsed, fps) => {
        const snap = interpolate(
          studioSpring(elapsed, fps, "editorialSnap", 8),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const jawY = Math.abs(Math.sin(elapsed * 0.22)) * 16;

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
              stroke={PAGE_PALETTE.navy}
              strokeWidth="2.5"
            />

            {config.archetype === "thermal-receipt" && (
              <g transform={`translate(154, ${(74 - (1 - snap) * 32).toFixed(1)})`}>
                <rect width="440" height="464" fill={PAGE_PALETTE.paperLight} stroke={PAGE_PALETTE.navy} strokeWidth="2" strokeDasharray="8 4" />
                <text x="220" y="54" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={PAGE_PALETTE.navy}>
                  THERMAL AUDIT TAPE
                </text>
                <line x1="36" y1="78" x2="404" y2="78" stroke={PAGE_PALETTE.navy} strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="220" y="216" textAnchor="middle" fontFamily={FONTS.mono} fontSize="42" fontWeight="700" fill={PAGE_PALETTE.brickRed} style={TABULAR_NUM_STYLE}>
                  {heroCallout}
                </text>
                <text x="220" y="268" textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={PAGE_PALETTE.muted}>
                  {subCallout}
                </text>
                <line x1="36" y1="360" x2="404" y2="360" stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                <text x="220" y="410" textAnchor="middle" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={PAGE_PALETTE.navy}>
                  THANK YOU FOR YOUR COMPLIANCE
                </text>
              </g>
            )}

            {config.archetype === "bank-modal" && (
              <g transform="translate(88, 96)">
                <rect width="572" height="420" rx="12" fill={PAGE_PALETTE.paperLight} stroke={PAGE_PALETTE.brickRed} strokeWidth="3" />
                <rect width="572" height="54" rx="10" fill={PAGE_PALETTE.navy} />
                <text x="24" y="34" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline}>
                  AUTOMATED UNDERWRITING ENGINE v9.4
                </text>
                <text x="286" y="196" textAnchor="middle" fontFamily={FONTS.mono} fontSize="40" fontWeight="700" fill={PAGE_PALETTE.brickRed} style={TABULAR_NUM_STYLE}>
                  {heroCallout}
                </text>
                <text x="286" y="246" textAnchor="middle" fontFamily={FONTS.sans} fontSize="18" fontWeight="700" fill={PAGE_PALETTE.navy}>
                  {subCallout}
                </text>
                <rect x="156" y="318" width="260" height="54" rx="8" fill={PAGE_PALETTE.paperBorder} />
                <text x="286" y="352" textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={PAGE_PALETTE.muted}>
                  APPEAL DISABLED
                </text>
              </g>
            )}

            {config.archetype === "hinged-cutout" && (
              <g transform="translate(374, 270)">
                {/* Archival Collage Bust + Brass Rivet Jaw */}
                <circle cx="0" cy="-54" r="88" fill={PAGE_PALETTE.paper} stroke={PAGE_PALETTE.navy} strokeWidth="4" />
                <rect x="-58" y="-22" width="116" height="44" rx="6" fill={PAGE_PALETTE.paperLight} stroke={PAGE_PALETTE.navy} strokeWidth="3" transform={`translate(0, ${jawY.toFixed(1)})`} />
                <circle cx="-54" cy="-14" r="7" fill="#C5A367" stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                <circle cx="54" cy="-14" r="7" fill="#C5A367" stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                <path d="M -130 180 L -90 52 L 90 52 L 130 180 Z" fill={PAGE_PALETTE.navy} />
                <text x="0" y="226" textAnchor="middle" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
                  &ldquo;{heroCallout}&rdquo;
                </text>
                <text x="0" y="256" textAnchor="middle" fontFamily={FONTS.sans} fontSize="15" fontWeight="600" fill={PAGE_PALETTE.muted}>
                  Translation: {subCallout}
                </text>
              </g>
            )}

            {config.archetype === "viewer-quiz" && (
              <g transform="translate(88, 88)">
                <text x="0" y="28" fontFamily={FONTS.mono} fontSize="16" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
                  AUDIENCE PREDICTION LOCK · PICK ONE
                </text>
                <circle cx="286" cy="204" r="108" fill={PAGE_PALETTE.navy} />
                <text x="286" y="216" textAnchor="middle" fontFamily={FONTS.mono} fontSize="36" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
                  {heroCallout}
                </text>
                <text x="286" y="378" textAnchor="middle" fontFamily={FONTS.sans} fontSize="19" fontWeight="700" fill={PAGE_PALETTE.navy}>
                  {subCallout}
                </text>
              </g>
            )}

            {config.archetype === "pinboard-stamps" && (
              <g transform="translate(84, 88)">
                <rect width="580" height="436" rx="10" fill={PAGE_PALETTE.paper} stroke={PAGE_PALETTE.navy} strokeWidth="2" />
                <g transform="translate(290, 218) rotate(-6)">
                  <rect x="-220" y="-68" width="440" height="136" rx="8" fill={PAGE_PALETTE.riskFill} stroke={PAGE_PALETTE.brickRed} strokeWidth="5" />
                  <text x="0" y="10" textAnchor="middle" fontFamily={FONTS.condensed} fontSize="58" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
                    {heroCallout}
                  </text>
                </g>
                <text x="290" y="392" textAnchor="middle" fontFamily={FONTS.mono} fontSize="15" fontWeight="700" fill={PAGE_PALETTE.navy}>
                  {subCallout}
                </text>
              </g>
            )}

            {config.archetype === "wallet-console" && (
              <g transform="translate(84, 88)">
                <text x="0" y="32" fontFamily={FONTS.mono} fontSize="14" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.chartSecondary}>
                  PROGRAMMABLE MONETARY RULE ENGINE
                </text>
                <text x="0" y="148" fontFamily={FONTS.mono} fontSize="44" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textHeadline} style={TABULAR_NUM_STYLE}>
                  {heroCallout}
                </text>
                <rect x="0" y="204" width="580" height="168" rx="12" fill="rgba(163, 64, 46, 0.32)" stroke={OVER_FOOTAGE_PALETTE.brickRedText} strokeWidth="2" />
                <text x="28" y="294" fontFamily={FONTS.mono} fontSize="18" fontWeight="700" fill={OVER_FOOTAGE_PALETTE.textBody}>
                  {subCallout}
                </text>
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
                    fill={it.isAlert ? PAGE_PALETTE.riskFill : theme.wellBg}
                    stroke={it.isAlert ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy}
                    strokeWidth="2"
                  />
                  <text x="28" y="44" fontFamily={FONTS.sans} fontSize="20" fontWeight="700" fill={PAGE_PALETTE.navy}>
                    {it.label}
                  </text>
                  <text x="740" y="48" textAnchor="end" fontFamily={FONTS.mono} fontSize="26" fontWeight="700" fill={it.isAlert ? PAGE_PALETTE.brickRed : PAGE_PALETTE.chartSecondary} style={TABULAR_NUM_STYLE}>
                    {it.value}
                  </text>
                  <text x="28" y="88" fontFamily={FONTS.mono} fontSize="14" fontWeight="600" fill={PAGE_PALETTE.muted}>
                    {it.note}
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
