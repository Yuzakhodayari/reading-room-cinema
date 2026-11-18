import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../../design/fonts";
import { BlueprintPlateFrame } from "./parametricBuilders";
import {
  AccentColorRole,
  clamp01,
  describeArc,
  detRand,
  gearPathD,
  polarToCartesian,
  PropRenderProps,
  PropVaultEntry,
  regularPolygonPoints,
  ResolvedPropPalette,
  resolveAnimState,
  resolvePropPalette,
  rosetteSealPathD,
} from "./propTypes";

// ============================================================================
// Shared Hero Rig Hook & Helper
// ============================================================================

interface HeroStageState {
  frame: number;
  fps: number;
  progress: number;
  palette: ResolvedPropPalette;
  sw: number;
  width: number;
  height: number;
  showAnnotations: boolean;
}

function useHeroStage(
  props: PropRenderProps,
  defaultAccent: AccentColorRole = "brick",
  rampFrames: number = 42
): HeroStageState {
  const contextFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = props.frame !== undefined ? props.frame : contextFrame;
  const sp = spring({
    frame: Math.max(0, f),
    fps,
    config: { damping: 24, mass: 0.9, stiffness: 112, overshootClamping: true },
    durationInFrames: rampFrames,
  });
  const lin = interpolate(f, [0, rampFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const autoP = clamp01(sp * 0.72 + lin * 0.28);
  const anim = resolveAnimState(contextFrame, props.frame, props.progress ?? autoP, rampFrames);
  const palette = resolvePropPalette(props, defaultAccent);

  return {
    frame: anim.frame,
    fps,
    progress: anim.progress,
    palette,
    sw: props.strokeScale ?? 1,
    width: props.width ?? 380,
    height: props.height ?? 285,
    showAnnotations: props.showAnnotations ?? true,
  };
}

// ============================================================================
// 1. W2WithholdingGuillotine (Ep 1 & Ep 11: Automatic Payroll Tax Slicer)
// ============================================================================

export const W2WithholdingGuillotine: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 36);
  const { palette: pal, progress: p, sw } = st;
  const bladeDrop = p * 64;
  const severedDrop = p > 0.55 ? (p - 0.55) * 38 : 0;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.A // FORM W-2 AUTOMATIC WITHHOLDING"
      title={props.labelOverride ?? "W-2 Paycheck Withholding Guillotine"}
      primaryMetric={props.metricOverride ?? "86.1% FED REV"}
      secondaryLabel="IRS + 12.4% FICA OFF TOP"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Timber & Brass Guillotine Uprights */}
      <rect x={148} y={52} width={12} height={168} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2 * sw} />
      <rect x={240} y={52} width={12} height={168} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2 * sw} />
      <rect x={138} y={44} width={124} height={12} rx={2} fill={pal.paper} stroke={pal.ink} strokeWidth={2 * sw} />
      <line x1={88} y1={220} x2={312} y2={220} stroke={pal.ink} strokeWidth={2.4 * sw} />

      {/* Friday Paycheck Entering Left Feed Chute */}
      <rect x={68} y={148} width={132} height={36} rx={2} fill={pal.paper} stroke={pal.ink} strokeWidth={1.8 * sw} />
      <text x={78} y={164} fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        GROSS FRIDAY W-2
      </text>
      <text x={78} y={177} fill={pal.secondary} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
        NET TAKE-HOME
      </text>

      {/* Severed Tax Slice Falling Into Treasury Hopper */}
      <g transform={`translate(0, ${severedDrop.toFixed(1)})`}>
        <rect
          x={202}
          y={148}
          width={76}
          height={36}
          rx={2}
          fill={pal.highlightWash}
          stroke={pal.accent}
          strokeWidth={1.8 * sw}
        />
        <text x={240} y={165} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
          IRS + FICA
        </text>
        <text x={240} y={177} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
          -36.4% CUT
        </text>
      </g>

      {/* Treasury Collection Hopper */}
      <polygon
        points="206,204 294,204 280,248 220,248"
        fill={pal.surfaceSubtle}
        stroke={pal.ink}
        strokeWidth={1.8 * sw}
      />
      <text x={250} y={232} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        US TREASURY
      </text>

      {/* Angled Steel Withholding Blade + Hoist Rope */}
      <line x1={200} y1={56} x2={200} y2={66 + bladeDrop} stroke={pal.muted} strokeWidth={1.4 * sw} strokeDasharray="3 2" />
      <g transform={`translate(0, ${bladeDrop.toFixed(1)})`}>
        <polygon
          points="162,66 238,66 238,108 162,90"
          fill={pal.accent}
          fillOpacity={0.26}
          stroke={pal.accent}
          strokeWidth={2.2 * sw}
        />
        <line x1={162} y1={90} x2={238} y2={108} stroke={pal.ink} strokeWidth={2.4 * sw} />
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 2. TreasuryBondVault (Ep 1 & Ep 2: $40.5T Sovereign Debt & Coupon Vault)
// ============================================================================

export const TreasuryBondVault: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "slate", 44);
  const { palette: pal, progress: p, frame, sw } = st;
  const wheelAngle = p * 120 + frame * 0.4;
  const boltExtend = 6 + p * 10;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.B // US SOVEREIGN BOND CUSTODY"
      title={props.labelOverride ?? "Treasury Bond Custody Vault"}
      primaryMetric={props.metricOverride ?? "$40.5T DEBT"}
      secondaryLabel="$2.1T/YR 2036 INTEREST"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Vault Steel Bulkhead Frame */}
      <rect x={68} y={52} width={264} height={196} rx={10} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2.3 * sw} />
      {/* Ledger Stack Readout Panel (Left) */}
      <rect x={84} y={70} width={82} height={160} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={1.5 * sw} />
      {Array.from({ length: 6 }).map((_, idx) => (
        <g key={`bd-${idx}`}>
          <rect
            x={92}
            y={82 + idx * 22}
            width={66}
            height={15}
            rx={1.5}
            fill={idx < 2 ? pal.highlightWash : pal.surfaceSubtle}
            stroke={pal.ink}
            strokeWidth={1.1 * sw}
          />
          <line x1={98} y1={89 + idx * 22} x2={150} y2={89 + idx * 22} stroke={pal.accent} strokeWidth={1 * sw} />
        </g>
      ))}
      <text x={125} y={222} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        PAID FIRST
      </text>

      {/* Circular Planetary Vault Door (Right) */}
      <g transform="translate(244, 150)">
        <circle cx={0} cy={0} r={72} fill={pal.paper} stroke={pal.ink} strokeWidth={2.4 * sw} />
        <circle cx={0} cy={0} r={58} stroke={pal.muted} strokeWidth={1.1 * sw} strokeDasharray="4 3" />
        {/* 6 Radial Locking Pistons */}
        {Array.from({ length: 6 }).map((_, b) => {
          const ang = b * 60;
          return (
            <g key={`blt-${b}`} transform={`rotate(${ang})`}>
              <rect
                x={-4}
                y={-56 - boltExtend}
                width={8}
                height={20}
                rx={1.5}
                fill={pal.accent}
                fillOpacity={0.35}
                stroke={pal.ink}
                strokeWidth={1.4 * sw}
              />
            </g>
          );
        })}
        {/* Central Planetary Gear & Tri-Spoke Spin Wheel */}
        <path
          d={gearPathD(0, 0, 34, 27, 14, wheelAngle)}
          fill={pal.surfaceSubtle}
          stroke={pal.ink}
          strokeWidth={1.4 * sw}
        />
        <g transform={`rotate(${(-wheelAngle * 1.4).toFixed(1)})`}>
          {[0, 120, 240].map((a) => {
            const pt = polarToCartesian(0, 0, 24, a);
            return <line key={a} x1={0} y1={0} x2={pt.x} y2={pt.y} stroke={pal.accent} strokeWidth={2.4 * sw} />;
          })}
          <circle cx={0} cy={0} r={7} fill={pal.ink} />
        </g>
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 3. DebtMonolithWall (Ep 1: CBO 2036 $40.5T Brick Wall & $2.1T Interest Cap)
// ============================================================================

export const DebtMonolithWall: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, sw } = st;
  const courses = 7;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.C // CBO 2036 FISCAL FORECAST WALL"
      title={props.labelOverride ?? "2036 National Debt Monolith Wall"}
      primaryMetric={props.metricOverride ?? "$2.1T/YR INT"}
      secondaryLabel="CBO 2036 DEBT BRICK WALL"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <line x1={58} y1={242} x2={342} y2={242} stroke={pal.ink} strokeWidth={2.4 * sw} />
      {Array.from({ length: courses }).map((_, row) => {
        const courseNorm = (row + 1) / courses;
        const active = courseNorm <= p + 0.14;
        const y = 242 - (row + 1) * 24;
        const isInterestTop = row >= 5;
        const cols = 5;
        const wallX = 88;
        const wallW = 212;
        return (
          <g key={`cr-${row}`} opacity={active ? 1 : 0.22}>
            {Array.from({ length: cols }).map((__, col) => {
              const offset = row % 2 === 1 ? (wallW / cols) * 0.5 : 0;
              const bx = wallX + col * (wallW / cols) + (col === 0 ? 0 : offset * 0.2);
              const bw = wallW / cols - 2;
              return (
                <rect
                  key={`br-${row}-${col}`}
                  x={bx}
                  y={y}
                  width={bw}
                  height={22}
                  fill={isInterestTop ? pal.riskFill : pal.paper}
                  stroke={isInterestTop ? pal.accent : pal.ink}
                  strokeWidth={1.5 * sw}
                />
              );
            })}
          </g>
        );
      })}
      {/* Architectural Plumb Line & 2036 Elevation Callout */}
      <line x1={318} y1={74} x2={318} y2={242} stroke={pal.accent} strokeWidth={1.4 * sw} strokeDasharray="4 3" />
      <polygon points="318,238 313,226 323,226" fill={pal.accent} />
      <rect x={118} y={102} width={152} height={30} rx={2} fill={pal.paper} stroke={pal.ink} strokeWidth={1.8 * sw} />
      <text x={194} y={121} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="11.5" fontWeight="700">
        2036: $40.5 TRILLION
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 4. SpillwayDam3Tier (Ep 1: Statutory Payment Priority 3-Tier Fiscal Dam)
// ============================================================================

export const SpillwayDam3Tier: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 45);
  const { palette: pal, progress: p, frame, sw } = st;
  const reservoirDrop = p * 34;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.D // STATUTORY APPROPRIATION CASCADE"
      title={props.labelOverride ?? "Three-Tier Fiscal Priority Spillway"}
      primaryMetric={props.metricOverride ?? "TIER 3 STARVED"}
      secondaryLabel="BONDS -> DEFENSE -> DIVIDEND"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left Tax Reservoir */}
      <rect x={54} y={64} width={78} height={176} fill={pal.paper} stroke={pal.ink} strokeWidth={2 * sw} />
      <rect
        x={56}
        y={82 + reservoirDrop}
        width={74}
        height={156 - reservoirDrop}
        fill={pal.secondary}
        fillOpacity={0.24}
      />
      <text x={93} y={168} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        TAX POOL
      </text>

      {/* Concrete Gravity Dam Wedge */}
      <polygon points="132,60 156,60 184,240 132,240" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2.1 * sw} />

      {/* 3 Priority Spillway Conduits */}
      {[
        { y: 86, label: "1. BONDHOLDERS ($2.1T)", active: true, color: pal.secondary },
        { y: 142, label: "2. DEFENSE & OASI", active: true, color: pal.ink },
        { y: 198, label: "3. CITIZEN CHECK (VETOED)", active: p < 0.45, color: pal.accent },
      ].map((tier, idx) => (
        <g key={tier.label}>
          <rect x={172} y={tier.y} width={172} height={32} rx={3} fill={pal.paper} stroke={tier.color} strokeWidth={1.6 * sw} />
          <line
            x1={178}
            y1={tier.y + 24}
            x2={336}
            y2={tier.y + 24}
            stroke={tier.active ? tier.color : pal.border}
            strokeWidth={2 * sw}
            strokeDasharray={tier.active ? "8 4" : "2 5"}
            strokeDashoffset={tier.active ? -(frame * (2.2 - idx * 0.4)) : 0}
          />
          <text x={182} y={tier.y + 15} fill={tier.color} fontFamily={FONTS.mono} fontSize="8.8" fontWeight="700">
            {tier.label}
          </text>
        </g>
      ))}
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 5. CircularGpuSpvCarousel (Ep 3: Nvidia / CoreWeave / Hyperscaler SPV Loop)
// ============================================================================

export const CircularGpuSpvCarousel: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 48);
  const { palette: pal, frame, sw } = st;
  const cx = 200;
  const cy = 152;
  const orbitDeg = frame * 1.1;

  const nodes = [
    { label: "NVIDIA", sub: "$30B EQUITY", ang: 0 },
    { label: "GPU SPV", sub: "$66.2B DEBT", ang: 90 },
    { label: "CLOUD 10-K", sub: "6-YR LIFE", ang: 180 },
    { label: "8-K BACKSTOP", sub: "$6.3B CAP", ang: 270 },
  ];

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 03.A // CIRCULAR GPU SPV REVENUE LOOP"
      title={props.labelOverride ?? "Circular GPU Debt & Revenue Carousel"}
      primaryMetric={props.metricOverride ?? "$176B PAPER"}
      secondaryLabel="COREWEAVE / XAI / HYPERSCALER"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Orbital Conveyor Ring */}
      <circle cx={cx} cy={cy} r={76} stroke={pal.ink} strokeWidth={2 * sw} strokeDasharray="8 5" strokeDashoffset={-(frame * 1.6)} />
      <circle cx={cx} cy={cy} r={58} stroke={pal.border} strokeWidth={1.1 * sw} />

      {/* Central Planetary Gear */}
      <path
        d={gearPathD(cx, cy, 30, 23, 12, orbitDeg)}
        fill={pal.highlightWash}
        stroke={pal.accent}
        strokeWidth={1.6 * sw}
      />
      <text x={cx} y={cy + 3} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        SPV LOOP
      </text>

      {/* 4 Orbiting Counterparty Stations */}
      {nodes.map((nd) => {
        const pos = polarToCartesian(cx, cy, 76, nd.ang + orbitDeg * 0.22);
        return (
          <g key={nd.label} transform={`translate(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`}>
            <rect x={-42} y={-17} width={84} height={34} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={1.7 * sw} />
            <text x={0} y={-3} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
              {nd.label}
            </text>
            <text x={0} y={10} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8" fontWeight="600">
              {nd.sub}
            </text>
          </g>
        );
      })}
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 6. PikDebtSnowball (Ep 4: $2.5T Private Credit Payment-In-Kind Compounding)
// ============================================================================

export const PikDebtSnowball: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 44);
  const { palette: pal, progress: p, sw } = st;
  const ballX = 104 + p * 168;
  const ballY = 96 + p * 84;
  const ballR = 20 + p * 26;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 04.A // BDC SCHEDULE OF INVESTMENTS (PIK)"
      title={props.labelOverride ?? "PIK Toggle Shadow-Debt Snowball"}
      primaryMetric={props.metricOverride ?? "88% MASKED"}
      secondaryLabel="$2.5T PRIVATE CREDIT / 6.3% DEF"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* SaaS Buyout Incline Ramp */}
      <polygon points="62,108 338,246 62,246" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2.1 * sw} />
      <text x={84} y={228} fill={pal.muted} fontFamily={FONTS.mono} fontSize="9" fontWeight="600">
        PER-SEAT SAAS HEADCOUNT EROSION
      </text>

      {/* Rolling Concentric PIK Debt Sphere */}
      <g transform={`translate(${ballX.toFixed(1)}, ${(ballY - ballR * 0.45).toFixed(1)}) rotate(${(p * 290).toFixed(1)})`}>
        <circle cx={0} cy={0} r={ballR} fill={pal.riskFill} stroke={pal.accent} strokeWidth={2.2 * sw} />
        <circle cx={0} cy={0} r={ballR * 0.72} stroke={pal.ink} strokeWidth={1.3 * sw} strokeDasharray="4 3" />
        <circle cx={0} cy={0} r={ballR * 0.42} fill={pal.paper} stroke={pal.ink} strokeWidth={1.4 * sw} />
        <line x1={-ballR} y1={0} x2={ballR} y2={0} stroke={pal.accent} strokeWidth={1.1 * sw} />
      </g>
      <text x={294} y={92} textAnchor="end" fill={pal.accent} fontFamily={FONTS.mono} fontSize="10" fontWeight="700">
        PAYING DEBT WITH DEBT
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 7. BondVigilanteScale (Ep 10: France 4.93% OAT vs Greece 4.26% Yield Scale)
// ============================================================================

export const BondVigilanteScale: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, sw } = st;
  const tiltDeg = -14 * p; // Left side (France 4.93%) weighed down heavier!
  const rad = (tiltDeg * Math.PI) / 180;
  const lx = 200 - Math.cos(rad) * 104;
  const ly = 104 - Math.sin(rad) * 104;
  const rx = 200 + Math.cos(rad) * 104;
  const ry = 104 + Math.sin(rad) * 104;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 10.A // EUROPEAN SOVEREIGN YIELD INVERSION"
      title={props.labelOverride ?? "Bond Vigilante Sovereign Yield Scale"}
      primaryMetric={props.metricOverride ?? "+67 BPS FR>GR"}
      secondaryLabel="FRANCE 4.93% VS GREECE 4.26%"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <polygon points="188,242 212,242 204,96 196,96" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2 * sw} />
      <path d={describeArc(200, 104, 42, -35, 35)} stroke={pal.muted} strokeWidth={1.2 * sw} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={pal.ink} strokeWidth={3 * sw} strokeLinecap="round" />
      <circle cx={200} cy={104} r={7} fill={pal.accent} stroke={pal.ink} strokeWidth={1.6 * sw} />

      {/* France 10Y OAT Pan (Heavy -5.4% Deficit) */}
      <g transform={`translate(${lx.toFixed(1)}, ${ly.toFixed(1)})`}>
        <line x1={0} y1={0} x2={-26} y2={58} stroke={pal.ink} strokeWidth={1.2 * sw} />
        <line x1={0} y1={0} x2={26} y2={58} stroke={pal.ink} strokeWidth={1.2 * sw} />
        <rect x={-36} y={30} width={72} height={28} rx={2} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
        <text x={0} y={43} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
          FR OAT 4.93%
        </text>
        <text x={0} y={54} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="7.5">
          -5.4% DEFICIT
        </text>
      </g>

      {/* Greece 10Y Pan (+2.0% Primary Surplus) */}
      <g transform={`translate(${rx.toFixed(1)}, ${ry.toFixed(1)})`}>
        <line x1={0} y1={0} x2={-26} y2={58} stroke={pal.ink} strokeWidth={1.2 * sw} />
        <line x1={0} y1={0} x2={26} y2={58} stroke={pal.ink} strokeWidth={1.2 * sw} />
        <rect x={-36} y={36} width={72} height={22} rx={2} fill={pal.paper} stroke={pal.secondary} strokeWidth={1.7 * sw} />
        <text x={0} y={50} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
          GR 10Y 4.26%
        </text>
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 8. SocialSecurity2032Dial (Ep 11: OASI Q4 2032 Exhaustion & 0% GPU FICA)
// ============================================================================

export const SocialSecurity2032Dial: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 45);
  const { palette: pal, progress: p, sw } = st;
  const cx = 166;
  const cy = 152;
  const deg = -125 + p * 238;
  const tip = polarToCartesian(cx, cy, 58, deg);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 11.A // CBO OASI TRUST FUND DEPLETION"
      title={props.labelOverride ?? "Social Security Q4 2032 Cliff Dial"}
      primaryMetric={props.metricOverride ?? "-24% AUTO CUT"}
      secondaryLabel="HUMAN 12.4% FICA VS GPU 0%"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <circle cx={cx} cy={cy} r={76} fill={pal.paper} stroke={pal.ink} strokeWidth={2.2 * sw} />
      <path d={describeArc(cx, cy, 64, -125, 125)} stroke={pal.ink} strokeWidth={1.6 * sw} />
      <path d={describeArc(cx, cy, 64, 72, 125)} stroke={pal.accent} strokeWidth={5 * sw} />
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={pal.accent} strokeWidth={2.8 * sw} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill={pal.ink} />
      <text x={cx} y={cy + 44} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="11" fontWeight="700">
        Q4 2032 CLIFF
      </text>

      {/* Right Side IRS Form 941 FICA Comparison Conduits */}
      <rect x={260} y={88} width={96} height={48} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={1.6 * sw} />
      <text x={308} y={107} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        W-2 PAYROLL
      </text>
      <text x={308} y={124} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="11" fontWeight="700">
        12.4% FICA
      </text>

      <rect x={260} y={156} width={96} height={48} rx={4} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
      <text x={308} y={175} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        AI SERVER CLUSTER
      </text>
      <text x={308} y={192} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="11.5" fontWeight="700">
        0.0% FICA
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 9. TetherTBillBarrelStack (Ep 2: Tokyo Exit vs GENIUS Act Stablecoin T-Bills)
// ============================================================================

export const TetherTBillBarrelStack: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 44);
  const { palette: pal, progress: p, frame, sw } = st;
  const japanH = 128 - p * 34;
  const tetherDrums = 4;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 02.A // TIC FOREIGN HOLDERS & GENIUS ACT"
      title={props.labelOverride ?? "Stablecoin 90-Day T-Bill Barrel Stack"}
      primaryMetric={props.metricOverride ?? "$132.4B BILLS"}
      secondaryLabel="TOKYO 4% JGB EXIT -> TETHER/CIRCLE"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left: Shrinking Tokyo Long-Bond Column */}
      <rect x={68} y={232 - japanH} width={86} height={japanH} rx={3} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.9 * sw} />
      <text x={111} y={216} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
        JAPAN TIC
      </text>
      <text x={111} y={92} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
        -$171B EXIT
      </text>

      {/* Transfer Siphon Arrow */}
      <path
        d="M 162 152 L 214 152"
        stroke={pal.secondary}
        strokeWidth={2.2 * sw}
        strokeDasharray="6 4"
        strokeDashoffset={-(frame * 1.5)}
      />

      {/* Right: Stacking 90-Day Stablecoin Reserve Barrels */}
      {Array.from({ length: tetherDrums }).map((_, d) => {
        const dy = 202 - d * 34;
        const visible = (d + 1) / tetherDrums <= p + 0.25;
        return (
          <g key={`dr-${d}`} opacity={visible ? 1 : 0.2}>
            <rect x={226} y={dy} width={104} height={28} rx={6} fill={pal.paper} stroke={pal.secondary} strokeWidth={1.8 * sw} />
            <line x1={232} y1={dy + 9} x2={324} y2={dy + 9} stroke={pal.ink} strokeWidth={1 * sw} />
            <text x={278} y={dy + 21} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
              {d === 3 ? "GENIUS ACT 90D" : "T-BILL RESERVE"}
            </text>
          </g>
        );
      })}
    </BlueprintPlateFrame>
  );
};

export const TetherTBillStack = TetherTBillBarrelStack;

// ============================================================================
// 10. FedFiatPrintingPress (Ep 1: 1933 Gold Lock vs Modern Fed Web Press)
// ============================================================================

export const FedFiatPrintingPress: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "slate", 42);
  const { palette: pal, frame, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.E // CENTRAL BANK MONETARY EXPANSION"
      title={props.labelOverride ?? "Federal Reserve Rotary Liquidity Press"}
      primaryMetric={props.metricOverride ?? "2.0% TARGET"}
      secondaryLabel="1933 GOLD CHAIN VS FIAT WEB"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <rect x={84} y={76} width={156} height={154} rx={6} fill={pal.paper} stroke={pal.ink} strokeWidth={2.2 * sw} />
      {[126, 186].map((rcx, idx) => (
        <g key={rcx} transform={`translate(${rcx}, 150) rotate(${frame * (idx === 0 ? 4 : -4)})`}>
          <circle cx={0} cy={0} r={26} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.9 * sw} />
          <line x1={-22} y1={0} x2={22} y2={0} stroke={pal.accent} strokeWidth={1.6 * sw} />
          <line x1={0} y1={-22} x2={0} y2={22} stroke={pal.accent} strokeWidth={1.6 * sw} />
        </g>
      ))}
      {/* Continuous Liquidity Sheet Stream */}
      <path
        d="M 240 144 Q 286 128 338 148"
        stroke={pal.secondary}
        strokeWidth={14 * sw}
        strokeOpacity={0.22}
        fill="none"
      />
      <path
        d="M 240 144 Q 286 128 338 148"
        stroke={pal.ink}
        strokeWidth={2 * sw}
        strokeDasharray="12 5"
        strokeDashoffset={-(frame * 2.4)}
        fill="none"
      />
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 11. GpuServerRackTower (Ep 1 & Ep 3: 42U AI Rack + Blinking LED + Heat Shimmer)
// ============================================================================

export const GpuServerRackTower: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 40);
  const { palette: pal, frame, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.F // HYPERSCALE AI COMPUTE CABINET"
      title={props.labelOverride ?? "42U Liquid-Cooled GPU Server Tower"}
      primaryMetric={props.metricOverride ?? "$820B CAPEX"}
      secondaryLabel="99.9% UPTIME // NEGATIVE FCF"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Rising Thermal Exhaust Heat Shimmer Waves */}
      {[156, 200, 244].map((hx, i) => {
        const wave = Math.sin(frame * 0.22 + i) * 5;
        return (
          <path
            key={hx}
            d={`M ${hx} 66 Q ${hx + wave} 54 ${hx} 44`}
            stroke={pal.accent}
            strokeWidth={1.5 * sw}
            fill="none"
          />
        );
      })}

      {/* 42U Cabinet Frame + Coolant Manifold Pipes */}
      <rect x={122} y={70} width={156} height={178} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={2.3 * sw} />
      <line x1={110} y1={78} x2={110} y2={242} stroke={pal.secondary} strokeWidth={3.2 * sw} />
      <line x1={290} y1={78} x2={290} y2={242} stroke={pal.accent} strokeWidth={3.2 * sw} />

      {/* 7 Blade Node Trays + Deterministic Blinking LED Matrix */}
      {Array.from({ length: 7 }).map((_, row) => {
        const ry = 80 + row * 23;
        return (
          <g key={`srv-${row}`}>
            <rect x={132} y={ry} width={136} height={18} rx={1.5} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.2 * sw} />
            {Array.from({ length: 8 }).map((__, led) => {
              const on = (Math.floor(frame * 0.3) + Math.floor(detRand("gpu-rack", row * 11 + led) * 9)) % 3 !== 0;
              return (
                <circle
                  key={`ld-${led}`}
                  cx={142 + led * 15}
                  cy={ry + 9}
                  r={2.4}
                  fill={on ? (led === 7 ? pal.accent : pal.secondary) : pal.border}
                />
              );
            })}
          </g>
        );
      })}
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 12. IrsForm941Slicer (Ep 11: Human 12.4% FICA Slicer vs 0% GPU Bypass)
// ============================================================================

export const IrsForm941Slicer: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 40);
  const { palette: pal, progress: p, frame, sw } = st;
  const bladeY = 74 + p * 36;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 11.B // IRS FORM 941 EMPLOYER QUARTERLY RETURN"
      title={props.labelOverride ?? "Form 941 FICA Slicer vs GPU Bypass"}
      primaryMetric={props.metricOverride ?? "12.4% VS 0.0%"}
      secondaryLabel="W-2 SLICED // AI COMPUTE EXEMPT"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Upper Track: Human W-2 Payroll Hit by Slicer */}
      <rect x={58} y={96} width={284} height={36} rx={3} fill={pal.paper} stroke={pal.ink} strokeWidth={1.8 * sw} />
      <line
        x1={66}
        y1={114}
        x2={334}
        y2={114}
        stroke={pal.secondary}
        strokeWidth={2 * sw}
        strokeDasharray="8 4"
        strokeDashoffset={-(frame * 1.6)}
      />
      <text x={72} y={109} fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        LINE 5A: HUMAN W-2 WAGES
      </text>
      <polygon
        points={`192,${bladeY - 22} 228,${bladeY - 22} 228,${bladeY + 8} 192,${bladeY - 2}`}
        fill={pal.riskFill}
        stroke={pal.accent}
        strokeWidth={2 * sw}
      />
      <rect x={238} y={99} width={96} height={30} rx={2} fill={pal.highlightWash} stroke={pal.accent} strokeWidth={1.5 * sw} />
      <text x={286} y={118} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
        -12.4% OASI CUT
      </text>

      {/* Lower Track: GPU Cluster Express Bypass */}
      <rect x={58} y={168} width={284} height={40} rx={3} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.8 * sw} />
      <line
        x1={66}
        y1={194}
        x2={334}
        y2={194}
        stroke={pal.accent}
        strokeWidth={2.4 * sw}
        strokeDasharray="10 4"
        strokeDashoffset={-(frame * 2.8)}
      />
      <text x={72} y={184} fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        AI GPU CLUSTER OUTPUT
      </text>
      <rect x={238} y={173} width={96} height={30} rx={2} fill={pal.paper} stroke={pal.secondary} strokeWidth={1.6 * sw} />
      <text x={286} y={192} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
        0.0% FICA TAX
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 13. RepoRateValve (Ep 2 & Ep 4: Overnight Repo & SOFR Collateral Manifold)
// ============================================================================

export const RepoRateValve: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 42);
  const { palette: pal, progress: p, frame, sw } = st;
  const wheelRot = p * 160 + frame * 0.8;
  const gaugeDeg = -110 + p * 195;
  const gTip = polarToCartesian(200, 88, 20, gaugeDeg);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 02.B // OVERNIGHT GENERAL COLLATERAL REPO"
      title={props.labelOverride ?? "SOFR & Overnight Repo Collateral Valve"}
      primaryMetric={props.metricOverride ?? "90D ROLLOVER"}
      secondaryLabel="TREASURY HAIRCUT & DEALER PIPE"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Flanged Horizontal Manifold Pipe */}
      <rect x={54} y={152} width={292} height={36} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2.2 * sw} />
      <line
        x1={62}
        y1={170}
        x2={338}
        y2={170}
        stroke={pal.secondary}
        strokeWidth={2.4 * sw}
        strokeDasharray="10 5"
        strokeDashoffset={-(frame * 2.1)}
      />
      {[118, 282].map((fx) => (
        <rect key={fx} x={fx - 5} y={144} width={10} height={52} rx={2} fill={pal.paper} stroke={pal.ink} strokeWidth={1.8 * sw} />
      ))}

      {/* Central Valve Bonnet + Pressure Dial */}
      <rect x={176} y={122} width={48} height={76} rx={5} fill={pal.paper} stroke={pal.ink} strokeWidth={2.1 * sw} />
      <circle cx={200} cy={88} r={28} fill={pal.paper} stroke={pal.ink} strokeWidth={2 * sw} />
      <path d={describeArc(200, 88, 22, -110, 110)} stroke={pal.muted} strokeWidth={1.4 * sw} />
      <line x1={200} y1={88} x2={gTip.x} y2={gTip.y} stroke={pal.accent} strokeWidth={2.2 * sw} strokeLinecap="round" />

      {/* Rotating Brass Handwheel */}
      <g transform={`translate(200, 218) rotate(${wheelRot.toFixed(1)})`}>
        <circle cx={0} cy={0} r={24} stroke={pal.accent} strokeWidth={3.2 * sw} fill="none" />
        {[0, 60, 120].map((a) => {
          const p1 = polarToCartesian(0, 0, 24, a);
          const p2 = polarToCartesian(0, 0, 24, a + 180);
          return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={pal.ink} strokeWidth={1.8 * sw} />;
        })}
        <circle cx={0} cy={0} r={5} fill={pal.ink} />
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 14. CentralBankLiquidityPump (Ep 1 & Ep 10: QE Piston vs Flat Wage Tank)
// ============================================================================

export const CentralBankLiquidityPump: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "slate", 42);
  const { palette: pal, progress: p, frame, sw } = st;
  const strokeA = Math.sin(frame * 0.16) * 18;
  const strokeB = Math.sin(frame * 0.16 + Math.PI) * 18;
  const assetFillH = 44 + p * 86;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.G // BALANCE-SHEET LIQUIDITY INJECTION"
      title={props.labelOverride ?? "Central Bank Dual-Piston Liquidity Pump"}
      primaryMetric={props.metricOverride ?? "90% TOP DECIL"}
      secondaryLabel="ASSET INFLATION VS WAGE FLOOR"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Dual Reciprocating Pump Cylinders */}
      {[92, 152].map((cx, i) => {
        const dy = i === 0 ? strokeA : strokeB;
        return (
          <g key={cx}>
            <rect x={cx - 20} y={96} width={40} height={116} rx={3} fill={pal.paper} stroke={pal.ink} strokeWidth={1.9 * sw} />
            <line x1={cx} y1={62} x2={cx} y2={136 + dy} stroke={pal.ink} strokeWidth={2.4 * sw} />
            <rect x={cx - 16} y={136 + dy} width={32} height={16} rx={2} fill={pal.accent} stroke={pal.ink} strokeWidth={1.5 * sw} />
          </g>
        );
      })}
      <line x1={112} y1={202} x2={236} y2={202} stroke={pal.secondary} strokeWidth={3.5 * sw} />

      {/* Right Tank: Rising Equity/Asset Column vs Stagnant Wage Line */}
      <rect x={236} y={72} width={96} height={164} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={2 * sw} />
      <rect
        x={240}
        y={232 - assetFillH}
        width={88}
        height={assetFillH}
        fill={pal.secondary}
        fillOpacity={0.28}
      />
      <line x1={236} y1={206} x2={332} y2={206} stroke={pal.accent} strokeWidth={1.8 * sw} strokeDasharray="4 3" />
      <text x={284} y={92} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        EQUITY VALUATION
      </text>
      <text x={284} y={222} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        MEDIAN W-2 FLAT
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 15. TokenDeflationFurnace (Ep 1: -99% Token Unit Price Collapse Furnace)
// ============================================================================

export const TokenDeflationFurnace: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, frame, sw } = st;
  const priceBarH = 112 * (1 - p * 0.92);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.H // UNIVERSAL BASIC COMPUTE DEFLATION"
      title={props.labelOverride ?? "AI Token Unit-Price Deflation Furnace"}
      primaryMetric={props.metricOverride ?? "-99% $/TOKEN"}
      secondaryLabel="UBER $1,500/MO ENG CAP HIT"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left: Industrial Token Burner Chamber */}
      <polygon points="74,76 196,76 180,234 90,234" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2.2 * sw} />
      <rect x={106} y={134} width={58} height={68} rx={4} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
      {[0, 1, 2].map((fIdx) => {
        const fy = 122 - ((frame * 1.4 + fIdx * 18) % 42);
        return (
          <rect
            key={fIdx}
            x={116 + fIdx * 14}
            y={fy}
            width={10}
            height={10}
            fill={pal.paper}
            stroke={pal.secondary}
            strokeWidth={1.2 * sw}
          />
        );
      })}
      <text x={135} y={222} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        TOKEN FURNACE
      </text>

      {/* Right: Collapsing Unit Dollar Value Column */}
      <rect x={232} y={84} width={96} height={150} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={1.8 * sw} />
      <rect
        x={252}
        y={224 - priceBarH}
        width={56}
        height={Math.max(6, priceBarH)}
        fill={pal.accent}
        fillOpacity={0.35}
        stroke={pal.accent}
        strokeWidth={1.6 * sw}
      />
      <text x={280} y={102} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
        UNIT CASH VALUE
      </text>
      <text x={280} y={116} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="8">
        NEW CHIP = CRASH
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 16. ClosedScripWalletRig (Ep 1: 0% Partner Loop vs -20% Cashout Toll)
// ============================================================================

export const ClosedScripWalletRig: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 40);
  const { palette: pal, progress: p, frame, sw } = st;
  const gateDrop = p * 28;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.I // WALLED-GARDEN COMPUTE SCRIP"
      title={props.labelOverride ?? "Closed Platform Scrip & 20% Exit Gate"}
      primaryMetric={props.metricOverride ?? "-20% EXIT FEE"}
      secondaryLabel="PARTNER FREE // OUTSIDE BANK TAXED"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left Wallet Hub */}
      <rect x={54} y={96} width={94} height={112} rx={8} fill={pal.paper} stroke={pal.ink} strokeWidth={2.1 * sw} />
      <text x={101} y={138} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        COMPUTE
      </text>
      <text x={101} y={152} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
        WALLET APP
      </text>

      {/* Top Conduit: Partner Ecosystem (0% Fee) */}
      <line
        x1={148}
        y1={122}
        x2={232}
        y2={104}
        stroke={pal.secondary}
        strokeWidth={2.4 * sw}
        strokeDasharray="8 4"
        strokeDashoffset={-(frame * 2)}
      />
      <rect x={232} y={82} width={114} height={44} rx={4} fill={pal.paper} stroke={pal.secondary} strokeWidth={1.7 * sw} />
      <text x={289} y={102} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.2" fontWeight="700">
        PARTNER HOUSING
      </text>
      <text x={289} y={116} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        0% FEE (LOCKED IN)
      </text>

      {/* Bottom Conduit: Outside Bank Cashout Hit by 20% Toll Gate */}
      <line x1={148} y1={182} x2={232} y2={198} stroke={pal.accent} strokeWidth={2.2 * sw} />
      <rect x={182} y={162 + gateDrop * 0.4} width={22} height={42} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
      <rect x={232} y={176} width={114} height={46} rx={4} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
      <text x={289} y={196} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.2" fontWeight="700">
        OUTSIDE USD BANK
      </text>
      <text x={289} y={211} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
        -20% TOLL PENALTY
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 17. EmptyAirlineGate14A (Ep 1: Perishable Tuesday Compute / Departing Seat)
// ============================================================================

export const EmptyAirlineGate14A: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "slate", 44);
  const { palette: pal, progress: p, sw } = st;
  const jetShiftX = p * 54;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.J // PERISHABLE CAPACITY SPOILAGE"
      title={props.labelOverride ?? "Departing Gate 14A Perishable Seat"}
      primaryMetric={props.metricOverride ?? "$0 AT PUSHBACK"}
      secondaryLabel="IDLE TUESDAY GPU SPOILS AT 12AM"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left Terminal Gate & Retracting Jetbridge */}
      <rect x={52} y={84} width={74} height={148} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2 * sw} />
      <text x={89} y={110} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
        GATE 14A
      </text>
      <rect x={126} y={136} width={44 - p * 18} height={18} fill={pal.paper} stroke={pal.ink} strokeWidth={1.6 * sw} />

      {/* Departing Fuselage Cutaway Showing Empty Seat 14A */}
      <g transform={`translate(${jetShiftX.toFixed(1)}, 0)`}>
        <path
          d="M 176 118 L 288 118 Q 326 146 288 174 L 176 174 Z"
          fill={pal.paper}
          stroke={pal.ink}
          strokeWidth={2.1 * sw}
        />
        <polygon points="222,118 250,74 264,74 252,118" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.6 * sw} />
        <polygon points="222,174 250,218 264,218 252,174" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.6 * sw} />
        {/* Highlighted Empty Seat 14A */}
        <rect x={208} y={132} width={28} height={28} rx={3} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
        <text x={222} y={150} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
          14A
        </text>
      </g>
      <text x={246} y={240} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="600">
        CANNOT JAR JULY IDLE COMPUTE FOR DEC TAXES
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 18. ShenzhenExpiringWallet (Ep 1: Oct 2020 6-Day Digital Yuan Voucher Timer)
// ============================================================================

export const ShenzhenExpiringWallet: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, sw } = st;
  const remainingArc = Math.max(8, (1 - p * 0.88) * 280);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.K // SHENZHEN OCT 2020 E-CNY PILOT"
      title={props.labelOverride ?? "Programmable 6-Day Expiring Voucher"}
      primaryMetric={props.metricOverride ?? "6-DAY EXPIRY"}
      secondaryLabel="3,000 APPROVED STORES ONLY"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Smartphone Frame */}
      <rect x={136} y={50} width={128} height={200} rx={14} fill={pal.paper} stroke={pal.ink} strokeWidth={2.3 * sw} />
      <line x1={182} y1={62} x2={218} y2={62} stroke={pal.muted} strokeWidth={2 * sw} strokeLinecap="round" />

      {/* Countdown Ring */}
      <circle cx={200} cy={132} r={42} stroke={pal.border} strokeWidth={3 * sw} />
      <path d={describeArc(200, 132, 42, -140, -140 + remainingArc)} stroke={pal.accent} strokeWidth={4.2 * sw} />
      <text x={200} y={130} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="11" fontWeight="700">
        {Math.max(0, Math.ceil((1 - p) * 6))}D LEFT
      </text>
      <text x={200} y={144} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="7.8">
        AUTO-VAPORIZE
      </text>

      {/* Evaporating Balance Bar */}
      <rect x={154} y={194} width={92} height={14} rx={2} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.2 * sw} />
      <rect x={156} y={196} width={Math.max(4, 88 * (1 - p * 0.9))} height={10} fill={pal.accent} />
      <text x={200} y={226} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        3,000 WHITELIST SHOPS
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 19. AsmlEuvKillSwitchRig (Ep 7: 13.5nm EUV Laser Mirror + Remote Disable)
// ============================================================================

export const AsmlEuvKillSwitchRig: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, sw } = st;
  const tripped = p > 0.52;
  const switchDeg = tripped ? -38 : 0;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 07.A // HIGH-NA EUV REMOTE DISABLE RELAY"
      title={props.labelOverride ?? "ASML EUV Scanner & Remote Kill-Switch"}
      primaryMetric={props.metricOverride ?? "$10T SHOCK"}
      secondaryLabel="13.5NM LASER // MUTUAL LOCKOUT"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left EUV Vacuum Optics Chamber */}
      <rect x={58} y={70} width={174} height={164} rx={6} fill={pal.paper} stroke={pal.ink} strokeWidth={2.2 * sw} />
      {/* Zeiss Multi-Layer Bragg Mirrors */}
      <ellipse cx={106} cy={106} rx={22} ry={8} transform="rotate(-24 106 106)" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.6 * sw} />
      <ellipse cx={182} cy={138} rx={22} ry={8} transform="rotate(24 182 138)" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.6 * sw} />
      {/* Wafer Chuck */}
      <rect x={102} y={206} width={88} height={14} rx={2} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.6 * sw} />

      {/* 13.5nm EUV Laser Path (Severed When Kill-Switch Trips) */}
      <polyline
        points="82,192 106,106 182,138 146,206"
        fill="none"
        stroke={tripped ? pal.border : pal.secondary}
        strokeWidth={2.4 * sw}
        strokeDasharray={tripped ? "3 6" : "none"}
      />

      {/* Right Remote Telemetry Kill-Switch Knife Relay */}
      <rect x={252} y={88} width={92} height={128} rx={4} fill={pal.riskFill} stroke={pal.accent} strokeWidth={2 * sw} />
      <g transform={`translate(298, 156) rotate(${switchDeg})`}>
        <line x1={0} y1={0} x2={0} y2={-38} stroke={pal.accent} strokeWidth={3.4 * sw} strokeLinecap="round" />
        <circle cx={0} cy={-38} r={5} fill={pal.accent} />
      </g>
      <circle cx={298} cy={156} r={5} fill={pal.ink} />
      <text x={298} y={196} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        {tripped ? "EUV DISABLED" : "VELDHOVEN LINK"}
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 20. SiliconWaferNodeCompare (Ep 7: Phoenix 4nm N4 vs Taiwan 2nm N2 / A16)
// ============================================================================

export const SiliconWaferNodeCompare: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 42);
  const { palette: pal, progress: p, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 07.B // TSMC NODE TOPOLOGY SPLIT"
      title={props.labelOverride ?? "Phoenix 4nm vs Taiwan 2nm Wafer Split"}
      primaryMetric={props.metricOverride ?? "$14T EXPOSED"}
      secondaryLabel="AZ 4NM N4 VS TW 2NM N2 / A16"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left Hemisphere: Phoenix Fab 21 (Coarser 4nm N4 Grid) */}
      <circle cx={128} cy={150} r={66} fill={pal.paper} stroke={pal.ink} strokeWidth={2 * sw} />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((__, c) => (
          <rect
            key={`az-${r}-${c}`}
            x={92 + c * 18}
            y={114 + r * 18}
            width={14}
            height={14}
            fill={pal.surfaceSubtle}
            stroke={pal.ink}
            strokeWidth={1 * sw}
          />
        ))
      )}
      <text x={128} y={234} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        PHOENIX 4NM ($265B)
      </text>

      {/* Right Hemisphere: Taiwan Hsinchu (Ultra-Dense 2nm N2 / 1.6nm A16 GAA) */}
      <circle cx={272} cy={150} r={66} fill={pal.highlightWash} stroke={pal.accent} strokeWidth={2.2 * sw} />
      {Array.from({ length: 7 }).map((_, r) =>
        Array.from({ length: 7 }).map((__, c) => (
          <rect
            key={`tw-${r}-${c}`}
            x={234 + c * 11}
            y={112 + r * 11}
            width={8.5}
            height={8.5}
            fill={p > 0.3 ? pal.accent : pal.secondary}
            fillOpacity={0.32}
            stroke={pal.ink}
            strokeWidth={0.8 * sw}
          />
        ))
      )}
      <text x={272} y={234} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        TAIWAN 2NM / A16 (90%)
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 21. AutonomousAgentTerminal (Ep 1 & Ep 4: Coding Agents vs SaaS Seat Count)
// ============================================================================

export const AutonomousAgentTerminal: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 40);
  const { palette: pal, progress: p, frame, sw } = st;
  const seatsLeft = Math.round(500 - p * 460);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 04.B // AUTONOMOUS CODING AGENT SWARM"
      title={props.labelOverride ?? "Autonomous Coding Terminal & Seat Drop"}
      primaryMetric={props.metricOverride ?? `${seatsLeft} SEATS`}
      secondaryLabel="500 -> 40 PER-SEAT SAAS EROSION"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Terminal Window */}
      <rect x={58} y={64} width={182} height={172} rx={6} fill={pal.paper} stroke={pal.ink} strokeWidth={2.1 * sw} />
      <line x1={58} y1={84} x2={240} y2={84} stroke={pal.ink} strokeWidth={1.3 * sw} />
      {Array.from({ length: 7 }).map((_, ln) => {
        const w = 48 + ((ln * 29 + Math.floor(frame * 0.6)) % 98);
        return (
          <rect
            key={`ast-${ln}`}
            x={72}
            y={96 + ln * 18}
            width={w}
            height={8}
            rx={1.5}
            fill={ln % 3 === 0 ? pal.secondary : pal.surfaceSubtle}
            stroke={pal.ink}
            strokeWidth={0.9 * sw}
          />
        );
      })}

      {/* Right SaaS Buyout Per-Seat Ratchet */}
      <rect x={256} y={88} width={88} height={124} rx={4} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.9 * sw} />
      <text x={300} y={114} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.2" fontWeight="700">
        HUMAN SEATS
      </text>
      <text x={300} y={152} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="20" fontWeight="700">
        {seatsLeft}
      </text>
      <text x={300} y={188} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        -70% SWE PAY
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 22. CloudCreditTollgate (Ep 1: $100k Cloud Credits vs $0 USD Chase Rent)
// ============================================================================

export const CloudCreditTollgate: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 38);
  const { palette: pal, progress: p, sw } = st;
  const barAngle = -52 * (1 - p);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.L // NON-FUNGIBLE CLOUD CREDIT WALL"
      title={props.labelOverride ?? "Cloud Credit Rent Clearinghouse Gate"}
      primaryMetric={props.metricOverride ?? "$0 FOR RENT"}
      secondaryLabel="$100K AWS CREDIT != BANK CASH"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left: $100,000 Cloud Credit Voucher */}
      <rect x={54} y={108} width={114} height={78} rx={5} fill={pal.paper} stroke={pal.secondary} strokeWidth={2 * sw} />
      <text x={111} y={138} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="11" fontWeight="700">
        $100,000
      </text>
      <text x={111} y={156} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.2" fontWeight="700">
        COMPUTE CREDITS
      </text>

      {/* Center: Dropping Tollgate Arm */}
      <rect x={190} y={136} width={18} height={96} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2 * sw} />
      <g transform={`translate(199, 144) rotate(${barAngle.toFixed(1)})`}>
        <rect x={0} y={-6} width={132} height={12} rx={2} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
      </g>

      {/* Right: Bank Mortgage / Rent Clearing Window */}
      <rect x={248} y={96} width={98} height={116} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={2 * sw} />
      <text x={297} y={126} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        JPMORGAN CHASE
      </text>
      <text x={297} y={158} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="13" fontWeight="700">
        $0.00 USD
      </text>
      <text x={297} y={182} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        RENT REJECTED
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 23. WattageApplianceNode (Ep 1: 10W Charger -> 1kW -> 1GW City -> 5GW Campus)
// ============================================================================

export const WattageApplianceNode: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 44);
  const { palette: pal, progress: p, sw } = st;
  const tiers = [
    { label: "10W", sub: "CHARGER", h: 24, x: 58 },
    { label: "1KW", sub: "MICROWAVE", h: 58, x: 136 },
    { label: "1GW", sub: "1M HOMES", h: 108, x: 214 },
    { label: "5GW", sub: "AI CAMPUS", h: 162, x: 292 },
  ];

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.M // PHYSICAL GRID LOAD LADDER"
      title={props.labelOverride ?? "Wattage Scale Ladder: 10W to 5GW AI"}
      primaryMetric={props.metricOverride ?? "5GW CAMPUS"}
      secondaryLabel="5 US CITIES FOR 1 SERVER COMPLEX"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <line x1={48} y1={232} x2={356} y2={232} stroke={pal.ink} strokeWidth={2.2 * sw} />
      {tiers.map((t, idx) => {
        const active = p >= idx * 0.22 || props.stateVariant === t.label;
        const barH = t.h * (active ? 1 : 0.35);
        const isTop = idx === 3;
        return (
          <g key={t.label}>
            <rect
              x={t.x}
              y={232 - barH}
              width={56}
              height={barH}
              rx={3}
              fill={isTop ? pal.riskFill : pal.paper}
              stroke={isTop ? pal.accent : pal.ink}
              strokeWidth={1.9 * sw}
            />
            <text x={t.x + 28} y={224 - barH} textAnchor="middle" fill={isTop ? pal.accent : pal.ink} fontFamily={FONTS.mono} fontSize="10" fontWeight="700">
              {t.label}
            </text>
            <text x={t.x + 28} y={248} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="7.8" fontWeight="700">
              {t.sub}
            </text>
          </g>
        );
      })}
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 24. HighVoltageSubstationRig (Ep 1 & Ep 6: M4 Substation Housing Lockout)
// ============================================================================

export const HighVoltageSubstationRig: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, frame, sw } = st;
  const breakerOpen = p > 0.45;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.N // SUBSTATION QUEUE PRIORITY"
      title={props.labelOverride ?? "Substation Busbar & Housing Lockout"}
      primaryMetric={props.metricOverride ?? "94GW SHORT"}
      secondaryLabel="AI RESERVED // HOMES DELAYED 2030S"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left Substation Transformer & Ceramic Insulator Sheds */}
      <rect x={60} y={108} width={96} height={112} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={2.2 * sw} />
      {[78, 108, 138].map((ix) => (
        <g key={ix}>
          <line x1={ix} y1={68} x2={ix} y2={108} stroke={pal.ink} strokeWidth={3 * sw} />
          {[76, 86, 96].map((iy) => (
            <line key={iy} x1={ix - 9} y1={iy} x2={ix + 9} y2={iy} stroke={pal.ink} strokeWidth={2 * sw} />
          ))}
        </g>
      ))}

      {/* Upper Energized Feeder -> Hyperscale AI Campus */}
      <line
        x1={156}
        y1={132}
        x2={244}
        y2={104}
        stroke={pal.secondary}
        strokeWidth={2.6 * sw}
        strokeDasharray="9 4"
        strokeDashoffset={-(frame * 2.4)}
      />
      <rect x={244} y={82} width={102} height={42} rx={3} fill={pal.paper} stroke={pal.secondary} strokeWidth={1.8 * sw} />
      <text x={295} y={107} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        AI CAMPUS: 100%
      </text>

      {/* Lower Tripped Breaker -> Housing Hookups */}
      <line x1={156} y1={192} x2={194} y2={192} stroke={pal.ink} strokeWidth={2 * sw} />
      <line x1={194} y1={192} x2={220} y2={breakerOpen ? 170 : 192} stroke={pal.accent} strokeWidth={2.4 * sw} />
      <line x1={222} y1={192} x2={244} y2={192} stroke={pal.border} strokeWidth={2 * sw} />
      <rect x={244} y={172} width={102} height={44} rx={3} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
      <text x={295} y={198} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        HOMES: 2030S WAIT
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 25. Transformer128WeekQueue (Ep 6: 500kV LPT Waitlist & 60% China Share)
// ============================================================================

export const Transformer128WeekQueue: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 44);
  const { palette: pal, progress: p, sw } = st;
  const creepX = p * 22;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 06.A // LARGE POWER TRANSFORMER BACKLOG"
      title={props.labelOverride ?? "500kV Transformer 128-Week Waitlist"}
      primaryMetric={props.metricOverride ?? "128-WK WAIT"}
      secondaryLabel="60% CHINA CAPACITY // GOES STEEL"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <line x1={52} y1={226} x2={348} y2={226} stroke={pal.ink} strokeWidth={2.4 * sw} />
      {/* Heavy Rail Flatcar Carrying Finned 500kV Transformer */}
      <g transform={`translate(${creepX.toFixed(1)}, 0)`}>
        <rect x={72} y={114} width={128} height={88} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={2.2 * sw} />
        {Array.from({ length: 7 }).map((_, fin) => (
          <line key={fin} x1={88 + fin * 16} y1={122} x2={88 + fin * 16} y2={194} stroke={pal.muted} strokeWidth={2 * sw} />
        ))}
        {[96, 136, 176].map((bx) => (
          <polygon key={bx} points={`${bx - 7},114 ${bx + 7},114 ${bx + 3},82 ${bx - 3},82`} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.5 * sw} />
        ))}
        <rect x={62} y={202} width={148} height={12} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.8 * sw} />
        {[84, 112, 160, 188].map((wx) => (
          <circle key={wx} cx={wx} cy={219} r={7} fill={pal.paper} stroke={pal.ink} strokeWidth={1.8 * sw} />
        ))}
      </g>

      {/* Queue Stop Barrier */}
      <rect x={256} y={96} width={84} height={130} rx={4} fill={pal.riskFill} stroke={pal.accent} strokeWidth={2 * sw} />
      <text x={298} y={138} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="12" fontWeight="700">
        128 WKS
      </text>
      <text x={298} y={158} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        DELIVERY QUEUE
      </text>
      <text x={298} y={196} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        60% CN SUPPLY
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 26. NuclearCoolingTowerLock (Ep 1: Three Mile Island Unit 1 20-Yr PPA Lock)
// ============================================================================

export const NuclearCoolingTowerLock: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "slate", 42);
  const { palette: pal, progress: p, frame, sw } = st;
  const shackleDrop = p * 12;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.O // THREE MILE ISLAND UNIT 1 PPA"
      title={props.labelOverride ?? "Nuclear Reactor 20-Year Single-Buyer Lock"}
      primaryMetric={props.metricOverride ?? "20-YR LOCK"}
      secondaryLabel="100% OUTPUT -> 1 TECH BUYER"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Hyperbolic Cooling Tower Silhouette */}
      <path
        d="M 96 238 Q 124 156 112 86 L 188 86 Q 176 156 204 238 Z"
        fill={pal.paper}
        stroke={pal.ink}
        strokeWidth={2.3 * sw}
      />
      {/* Vapor Plume */}
      <path
        d={`M 134 78 Q ${150 + Math.sin(frame * 0.15) * 8} 54 168 66`}
        stroke={pal.muted}
        strokeWidth={2 * sw}
        fill="none"
      />

      {/* Heavy Brass Padlock Clamping Output Busbar */}
      <g transform="translate(278, 158)">
        <path
          d={`M -20 ${-22 - 12 + shackleDrop} A 20 20 0 0 1 20 ${-22 - 12 + shackleDrop} L 20 -12`}
          stroke={pal.ink}
          strokeWidth={4 * sw}
          fill="none"
        />
        <rect x={-36} y={-16} width={72} height={60} rx={6} fill={pal.riskFill} stroke={pal.accent} strokeWidth={2.2 * sw} />
        <text x={0} y={12} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
          20-YR PPA
        </text>
        <text x={0} y={28} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
          PRIVATE BUS
        </text>
      </g>
      <line x1={194} y1={164} x2={242} y2={164} stroke={pal.accent} strokeWidth={3 * sw} />
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 27. CopperOpenPitClock (Ep 6: 17.5-Yr Mine Timeline & 72% Refining Trap)
// ============================================================================

export const CopperOpenPitClock: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 44);
  const { palette: pal, progress: p, sw } = st;
  const handTip = polarToCartesian(200, 150, 58, -90 + p * 265);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 06.B // IEA COPPER MINE LEAD-TIME CLOCK"
      title={props.labelOverride ?? "17.5-Year Open-Pit Copper Mine Clock"}
      primaryMetric={props.metricOverride ?? "17.5 YEARS"}
      secondaryLabel="-25% CU DEFICIT // 72% CN REFINE"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Concentric Stepped Open-Pit Mine Terraces */}
      {[84, 68, 52, 36, 20].map((r, idx) => (
        <circle
          key={r}
          cx={200}
          cy={150}
          r={r}
          fill={idx % 2 === 0 ? pal.paper : pal.surfaceSubtle}
          stroke={pal.ink}
          strokeWidth={1.6 * sw}
        />
      ))}
      <line x1={200} y1={150} x2={handTip.x} y2={handTip.y} stroke={pal.accent} strokeWidth={3 * sw} strokeLinecap="round" />
      <circle cx={200} cy={150} r={5} fill={pal.accent} />
      <text x={200} y={248} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
        DISCOVERY TO FIRST CATHODE: 17.5 YRS
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 28. PjmAuctionMeter (Ep 1 & Ep 6: $28.92 -> $269.92/+833% Capacity Surge)
// ============================================================================

export const PjmAuctionMeter: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 40);
  const { palette: pal, progress: p, sw } = st;
  const surgeH = 18 + p * 138;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.P // PJM 13-STATE CAPACITY AUCTION"
      title={props.labelOverride ?? "PJM Wholesale Capacity +833% Surge"}
      primaryMetric={props.metricOverride ?? "+833% SPIKE"}
      secondaryLabel="$28.92 -> $269.92 / $329 CAP"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <line x1={68} y1={230} x2={332} y2={230} stroke={pal.ink} strokeWidth={2.2 * sw} />
      {/* Prior Year Bar ($28.92) */}
      <rect x={102} y={212} width={74} height={18} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.8 * sw} />
      <text x={139} y={204} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
        $28.92
      </text>
      <text x={139} y={246} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        PRIOR AUCTION
      </text>

      {/* Surge Bar ($269.92 -> $329.17 Cap) */}
      <rect x={224} y={230 - surgeH} width={74} height={surgeH} fill={pal.riskFill} stroke={pal.accent} strokeWidth={2.2 * sw} />
      <text x={261} y={222 - surgeH} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="10.5" fontWeight="700">
        $269.92
      </text>
      <text x={261} y={246} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        MW-DAY (+833%)
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 29. TransmissionTower765kV (Ep 1 & Ep 6: 765kV Pylon & 10-Yr Permitting Lag)
// ============================================================================

export const TransmissionTower765kV: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 42);
  const { palette: pal, progress: p, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.Q // EHV TRANSMISSION PERMITTING LAG"
      title={props.labelOverride ?? "765kV Lattice Pylon & 10-Year Queue"}
      primaryMetric={props.metricOverride ?? "5-10 YR LAG"}
      secondaryLabel="AGENTS: 6 MOS // HV LINES: 10 YRS"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* 765kV Steel Lattice Pylon */}
      <polygon points="104,236 156,236 140,68 120,68" fill={pal.paper} stroke={pal.ink} strokeWidth={2 * sw} />
      <line x1={82} y1={96} x2={178} y2={96} stroke={pal.ink} strokeWidth={2.2 * sw} />
      <line x1={90} y1={132} x2={170} y2={132} stroke={pal.ink} strokeWidth={2 * sw} />
      <line x1={112} y1={236} x2={140} y2={132} stroke={pal.muted} strokeWidth={1.2 * sw} />
      <line x1={148} y1={236} x2={120} y2={132} stroke={pal.muted} strokeWidth={1.2 * sw} />

      {/* Right Timeline Lag Bars */}
      <rect x={208} y={96} width={132} height={36} rx={3} fill={pal.paper} stroke={pal.secondary} strokeWidth={1.7 * sw} />
      <text x={218} y={118} fill={pal.secondary} fontFamily={FONTS.mono} fontSize="8.8" fontWeight="700">
        AI ROLLOUT: 6 MOS
      </text>
      <rect x={208} y={156} width={132} height={48} rx={3} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.9 * sw} />
      <rect x={214} y={184} width={Math.max(8, 118 * p * 0.25)} height={10} fill={pal.accent} />
      <text x={218} y={176} fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.8" fontWeight="700">
        765KV PERMIT: 10 YRS
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 30. CarrierVsDroneExchange (Ep 8: $13B Carrier + $4M SM-6 vs $20k Drone)
// ============================================================================

export const CarrierVsDroneExchange: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, sw } = st;
  const spentCells = Math.floor(p * 10);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 08.A // RED SEA MUNITION COST INVERSION"
      title={props.labelOverride ?? "100:1 Carrier VLS vs $20k Drone Exchange"}
      primaryMetric={props.metricOverride ?? "100:1 RATIO"}
      secondaryLabel="$4M SM-6 SHOT VS $20K DRONE"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left: Carrier Flight Deck + 12-Cell Mk 41 VLS Magazine Cutaway */}
      <polygon points="52,188 214,188 198,226 66,226" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2.1 * sw} />
      <rect x={148} y={156} width={34} height={32} fill={pal.paper} stroke={pal.ink} strokeWidth={1.7 * sw} />
      {Array.from({ length: 12 }).map((_, c) => {
        const col = c % 4;
        const row = Math.floor(c / 4);
        const depleted = c < spentCells;
        return (
          <rect
            key={`vls-${c}`}
            x={72 + col * 15}
            y={193 + row * 10}
            width={11}
            height={7}
            fill={depleted ? pal.riskFill : pal.secondary}
            stroke={pal.ink}
            strokeWidth={0.9 * sw}
          />
        );
      })}
      <text x={133} y={244} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.2" fontWeight="700">
        $13B CARRIER // $4M SM-6
      </text>

      {/* Interceptor Arc vs Incoming $20,000 Delta Drone */}
      <path d="M 110 186 Q 196 86 286 122" stroke={pal.accent} strokeWidth={2 * sw} strokeDasharray="5 3" fill="none" />
      <polygon points="282,122 328,108 316,136" fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.9 * sw} />
      <text x={306} y={156} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
        $20K DRONE
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 31. SubseaCableAnchorCut (Ep 9: 550 Seabed Fiber Cables & Dragging Anchor)
// ============================================================================

export const SubseaCableAnchorCut: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 44);
  const { palette: pal, progress: p, frame, sw } = st;
  const severed = p > 0.56;
  const anchorX = 128 + p * 74;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 09.A // BALTIC & RED SEA SEABED TRUNK"
      title={props.labelOverride ?? "Subsea Fiber Trunk & Dragged Anchor Cut"}
      primaryMetric={props.metricOverride ?? "$10T / DAY"}
      secondaryLabel="550 GARDEN-HOSE CABLES // 99% DATA"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Seabed Trench Floor */}
      <path d="M 48 214 Q 140 226 200 212 Q 280 198 352 216 L 352 246 L 48 246 Z" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.8 * sw} />

      {/* 17mm Garden-Hose Fiber Cable + SWIFT Pulses */}
      <line x1={54} y1={198} x2={194} y2={198} stroke={pal.secondary} strokeWidth={4 * sw} />
      <line
        x1={severed ? 214 : 194}
        y1={severed ? 204 : 198}
        x2={346}
        y2={198}
        stroke={severed ? pal.muted : pal.secondary}
        strokeWidth={4 * sw}
      />
      {!severed && (
        <line
          x1={58}
          y1={198}
          x2={342}
          y2={198}
          stroke={pal.paper}
          strokeWidth={1.6 * sw}
          strokeDasharray="6 12"
          strokeDashoffset={-(frame * 3)}
        />
      )}

      {/* Dragging Ship Anchor Fluke */}
      <g transform={`translate(${anchorX.toFixed(1)}, 142) rotate(22)`}>
        <line x1={0} y1={-66} x2={0} y2={48} stroke={pal.ink} strokeWidth={2.8 * sw} />
        <path d="M -22 34 Q 0 58 22 34" stroke={pal.accent} strokeWidth={3.2 * sw} fill="none" />
      </g>
      {severed && (
        <circle cx={204} cy={198} r={10} fill={pal.riskFill} stroke={pal.accent} strokeWidth={2 * sw} />
      )}
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 32. AutonomousPortGantry2034 (Ep 1: 2034 Nighttime Robotic Crane 99.9% Uptime)
// ============================================================================

export const AutonomousPortGantry2034: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 40);
  const { palette: pal, frame, sw } = st;
  const trolleyX = 166 + Math.sin(frame * 0.12) * 56;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.R // 2034 AUTONOMOUS TERMINAL"
      title={props.labelOverride ?? "2034 Automated STS Gantry & AGV Fleet"}
      primaryMetric={props.metricOverride ?? "99.9% UPTIME"}
      secondaryLabel="ZERO WALKOUT LEVERAGE"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <line x1={52} y1={232} x2={348} y2={232} stroke={pal.ink} strokeWidth={2.3 * sw} />
      {/* Automated STS Gantry Frame */}
      <line x1={112} y1={232} x2={126} y2={78} stroke={pal.ink} strokeWidth={2.6 * sw} />
      <line x1={178} y1={232} x2={164} y2={78} stroke={pal.ink} strokeWidth={2.6 * sw} />
      <line x1={82} y1={86} x2={316} y2={86} stroke={pal.secondary} strokeWidth={3.4 * sw} />

      {/* Cycling Robotic Trolley + Container */}
      <g transform={`translate(${trolleyX.toFixed(1)}, 86)`}>
        <rect x={-12} y={-6} width={24} height={12} fill={pal.ink} />
        <line x1={-6} y1={6} x2={-6} y2={58} stroke={pal.ink} strokeWidth={1.3 * sw} />
        <line x1={6} y1={6} x2={6} y2={58} stroke={pal.ink} strokeWidth={1.3 * sw} />
        <rect x={-26} y={58} width={52} height={24} fill={pal.paper} stroke={pal.secondary} strokeWidth={1.9 * sw} />
      </g>

      {/* Driverless AGV Truck */}
      <rect x={218} y={208} width={74} height={16} rx={3} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.7 * sw} />
      <text x={255} y={220} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="7.8" fontWeight="700">
        NO DRIVER CAB
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 33. IdlePier1955 (Ep 1: 1955 Rotterdam / Detroit Walkout Bargaining Lever)
// ============================================================================

export const IdlePier1955: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "slate", 40);
  const { palette: pal, progress: p, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.S // 1955 INDUSTRIAL STRIKE LEVERAGE"
      title={props.labelOverride ?? "1955 Idle Strike Pier & Locked Boom"}
      primaryMetric={props.metricOverride ?? "CASH BLEED"}
      secondaryLabel="WORKERS WALK -> MACHINES STOP"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <line x1={52} y1={226} x2={348} y2={226} stroke={pal.ink} strokeWidth={2.3 * sw} />
      {/* Parked Manual Derrick Boom Raised & Chained */}
      <line x1={108} y1={226} x2={108} y2={92} stroke={pal.ink} strokeWidth={2.8 * sw} />
      <line x1={108} y1={134} x2={186} y2={68} stroke={pal.ink} strokeWidth={2.4 * sw} />
      <line x1={186} y1={68} x2={186} y2={138} stroke={pal.muted} strokeWidth={1.5 * sw} strokeDasharray="4 3" />

      {/* Idle Freighter Hull + Strike Gate Sign */}
      <polygon points="196,192 332,192 316,226 210,226" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2 * sw} />
      <rect x={218} y={114} width={116} height={46} rx={3} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.9 * sw} opacity={0.4 + p * 0.6} />
      <text x={276} y={135} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="9" fontWeight="700">
        PIER SHUT DOWN
      </text>
      <text x={276} y={150} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        FRIDAY RAISE WON
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 34. PanamaxContainerShip (Ep 7 & Ep 9: Container Hull + Pulled War Insurance)
// ============================================================================

export const PanamaxContainerShip: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 07.C // MARITIME WAR-RISK UNDERWRITING"
      title={props.labelOverride ?? "Panamax Vessel & Pulled War-Risk Seal"}
      primaryMetric={props.metricOverride ?? "COVER VOID"}
      secondaryLabel="MONDAY INSURANCE WITHDRAWAL"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Vessel Hull + Stacked TEU Containers */}
      <polygon points="56,184 344,184 322,222 76,222" fill={pal.paper} stroke={pal.ink} strokeWidth={2.2 * sw} />
      <rect x={282} y={134} width={34} height={50} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.8 * sw} />
      {Array.from({ length: 5 }).map((_, col) =>
        Array.from({ length: 3 }).map((__, row) => (
          <rect
            key={`teu-${col}-${row}`}
            x={82 + col * 38}
            y={166 - row * 16}
            width={34}
            height={14}
            fill={pal.surfaceSubtle}
            stroke={pal.ink}
            strokeWidth={1.1 * sw}
          />
        ))
      )}
      {/* Cancelled Lloyd's Rosette Medallion */}
      <g transform={`translate(200, 108) scale(${0.85 + p * 0.15})`}>
        <path d={rosetteSealPathD(0, 0, 32, 16, 4, p * 20)} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.8 * sw} />
        <text x={0} y={3} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
          VOID WAR
        </text>
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 35. ChokepointRadarArray (Ep 6-9: Strait Chokepoint Sweep Scope)
// ============================================================================

export const ChokepointRadarArray: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 40);
  const { palette: pal, frame, sw } = st;
  const sweepDeg = (frame * 3.2) % 360;
  const tip = polarToCartesian(200, 152, 78, sweepDeg);

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 08.B // MARITIME CHOKEPOINT SURVEILLANCE"
      title={props.labelOverride ?? "Strait Chokepoint Coastal Radar Scope"}
      primaryMetric={props.metricOverride ?? "STRAIT LOCK"}
      secondaryLabel="TAIWAN // BAB EL-MANDEB // BALTIC"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {[80, 56, 32].map((r) => (
        <circle key={r} cx={200} cy={152} r={r} fill="none" stroke={pal.ink} strokeWidth={1.4 * sw} />
      ))}
      <line x1={116} y1={152} x2={284} y2={152} stroke={pal.border} strokeWidth={1 * sw} />
      <line x1={200} y1={68} x2={200} y2={236} stroke={pal.border} strokeWidth={1 * sw} />
      <line x1={200} y1={152} x2={tip.x} y2={tip.y} stroke={pal.secondary} strokeWidth={2.4 * sw} />
      {[
        { x: 168, y: 118 },
        { x: 234, y: 136 },
        { x: 214, y: 184 },
      ].map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={4} fill={pal.accent} />
      ))}
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 36. ClaireAustinHouseRig (Ep 1 & Ep 5: Austin Home + Meter + AC + $3,400/mo)
// ============================================================================

export const ClaireAustinHouseRig: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 44);
  const { palette: pal, frame, sw } = st;
  const era = props.stateVariant ?? "2036";
  const fanDeg = frame * 7;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode={`FIG 01.T // AUSTIN TX HOUSEHOLD (${era})`}
      title={props.labelOverride ?? "Claire's Austin Home & $3,400 Mortgage"}
      primaryMetric={props.metricOverride ?? "$3,400 / MO"}
      secondaryLabel="LOCKED UNTIL 2055 // AUGUST AC SPIKE"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <line x1={52} y1={232} x2={348} y2={232} stroke={pal.ink} strokeWidth={2.3 * sw} />
      {/* Pitched Bungalow Elevation */}
      <polygon points="78,128 176,68 274,128" fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2.2 * sw} />
      <rect x={92} y={128} width={168} height={104} fill={pal.paper} stroke={pal.ink} strokeWidth={2.2 * sw} />
      <rect x={160} y={168} width={32} height={64} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.6 * sw} />
      <rect x={108} y={148} width={34} height={30} fill={pal.highlightWash} stroke={pal.ink} strokeWidth={1.4 * sw} />

      {/* Spinning Utility kWh Smart Meter on Wall */}
      <circle cx={244} cy={156} r={12} fill={pal.paper} stroke={pal.accent} strokeWidth={1.7 * sw} />
      <line x1={236} y1={156} x2={252} y2={156} stroke={pal.accent} strokeWidth={2 * sw} strokeDasharray="3 2" strokeDashoffset={-(frame * 1.8)} />

      {/* Exterior A/C Condenser Unit */}
      <rect x={274} y={184} width={48} height={48} rx={3} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.9 * sw} />
      <g transform={`translate(298, 208) rotate(${fanDeg})`}>
        <circle cx={0} cy={0} r={14} stroke={pal.ink} strokeWidth={1.3 * sw} fill="none" />
        <line x1={-12} y1={0} x2={12} y2={0} stroke={pal.accent} strokeWidth={2 * sw} />
        <line x1={0} y1={-12} x2={0} y2={12} stroke={pal.accent} strokeWidth={2 * sw} />
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 37. RunningShoeExplodedStack (Ep 1: $120 Running Shoe 5-Layer Wage BOM)
// ============================================================================

export const RunningShoeExplodedStack: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 42);
  const { palette: pal, progress: p, sw } = st;
  const spread = 28 - p * 14;
  const layers = [
    "1. UPPER STITCH LABOR",
    "2. CORPORATE PAYROLL",
    "3. MEMPHIS FREIGHT",
    "4. WAREHOUSE PICK",
    "5. ATOMS & ELECTRICITY",
  ];

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.U // $120 CONSUMER UNIT-COST BOM"
      title={props.labelOverride ?? "$120 Running Shoe Exploded Labor Stack"}
      primaryMetric={props.metricOverride ?? "-80% HOURS"}
      secondaryLabel="HUMAN TIME -> ELECTRICITY FLOOR"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {layers.map((lbl, idx) => {
        const y = 76 + idx * spread;
        const isAtoms = idx === 4;
        return (
          <g key={lbl} opacity={isAtoms ? 1 : Math.max(0.28, 1 - p * 0.65)}>
            <rect
              x={84}
              y={y}
              width={232}
              height={20}
              rx={4}
              fill={isAtoms ? pal.highlightWash : pal.paper}
              stroke={isAtoms ? pal.secondary : pal.ink}
              strokeWidth={1.6 * sw}
            />
            <text x={96} y={y + 13} fill={isAtoms ? pal.secondary : pal.ink} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
              {lbl}
            </text>
          </g>
        );
      })}
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 38. PaloAltoFlipWhiteboard (Ep 1: Abundance Whiteboard vs 30-Yr Fixed Debt)
// ============================================================================

export const PaloAltoFlipWhiteboard: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, sw } = st;
  const flipped = p > 0.5;
  const scaleY = Math.max(0.18, Math.abs(Math.cos(p * Math.PI)));

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.V // FISHER 1933 DEBT-DEFLATION FLIP"
      title={props.labelOverride ?? "Palo Alto Whiteboard vs 30-Year Loan"}
      primaryMetric={props.metricOverride ?? "DEBT FROZEN"}
      secondaryLabel="PRICES FALL // OLD LOANS STAY FIXED"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Studio A-Frame Stand */}
      <line x1={82} y1={78} x2={72} y2={238} stroke={pal.ink} strokeWidth={2.4 * sw} />
      <line x1={318} y1={78} x2={328} y2={238} stroke={pal.ink} strokeWidth={2.4 * sw} />
      <line x1={64} y1={138} x2={336} y2={138} stroke={pal.muted} strokeWidth={1.6 * sw} />

      {/* Revolving Board */}
      <g transform={`translate(200, 138) scale(1, ${scaleY.toFixed(2)})`}>
        <rect
          x={-114}
          y={-56}
          width={228}
          height={112}
          rx={4}
          fill={flipped ? pal.riskFill : pal.paper}
          stroke={flipped ? pal.accent : pal.ink}
          strokeWidth={2.2 * sw}
        />
        <text x={0} y={-12} textAnchor="middle" fill={flipped ? pal.accent : pal.secondary} fontFamily={FONTS.mono} fontSize="10.5" fontWeight="700">
          {flipped ? "30-YR FIXED MORTGAGE" : "PALO ALTO WHITEBOARD"}
        </text>
        <text x={0} y={18} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
          {flipped ? "$3,400/MO UNTIL 2055" : "UNIT COST -> $0 ABUNDANCE"}
        </text>
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 39. RoofScanInsuranceDrone (Ep 5: LiDAR Shingle Grid & FAIR Plan +29.1%)
// ============================================================================

export const RoofScanInsuranceDrone: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 40);
  const { palette: pal, progress: p, frame, sw } = st;
  const droneX = 156 + Math.sin(frame * 0.1) * 38;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 05.A // AERIAL ROOF SCORE NON-RENEWAL"
      title={props.labelOverride ?? "Underwriting Roof-Scan LiDAR Drone"}
      primaryMetric={props.metricOverride ?? "+29.1% HIKE"}
      secondaryLabel="$13.4T MORTGAGES // ESCROW SHOCK"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Home Gable Roof with Shingle Risk Grid */}
      <polygon points="74,226 200,148 326,226" fill={pal.paper} stroke={pal.ink} strokeWidth={2.2 * sw} />
      <rect x={166} y={184} width={68} height={32} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.6 * sw} opacity={0.45 + p * 0.55} />
      <text x={200} y={204} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.2" fontWeight="700">
        FORCE-PLACED
      </text>

      {/* Hovering Quadcopter + LiDAR Cone */}
      <g transform={`translate(${droneX.toFixed(1)}, 86)`}>
        <polygon points="0,12 -52,96 52,96" fill={pal.highlightWash} stroke={pal.accent} strokeWidth={1.2 * sw} strokeDasharray="4 3" />
        <line x1={-34} y1={0} x2={34} y2={0} stroke={pal.ink} strokeWidth={2.6 * sw} />
        <rect x={-12} y={-6} width={24} height={12} rx={3} fill={pal.paper} stroke={pal.ink} strokeWidth={1.8 * sw} />
        <line x1={-44} y1={-6} x2={-24} y2={-6} stroke={pal.secondary} strokeWidth={2.2 * sw} />
        <line x1={24} y1={-6} x2={44} y2={-6} stroke={pal.secondary} strokeWidth={2.2 * sw} />
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 40. CoalScripBrassToken1912 (Ep 1: 1912 Island Creek Coal Brass Scrip)
// ============================================================================

export const CoalScripBrassToken1912: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "slate", 42);
  const { palette: pal, progress: p, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.W // 1912 WEST VIRGINIA COMPANY SCRIP"
      title={props.labelOverride ?? "1912 Island Creek Brass Scrip Token"}
      primaryMetric={props.metricOverride ?? "-25% CASH"}
      secondaryLabel="COMPANY STORE ONLY // 1938 FLSA BAN"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Octagonal Stamped Brass Token */}
      <polygon
        points={regularPolygonPoints(142, 152, 68, 8, 22.5)}
        fill={pal.paper}
        stroke={pal.ink}
        strokeWidth={2.3 * sw}
      />
      <circle cx={142} cy={152} r={50} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.5 * sw} strokeDasharray="4 2" />
      <text x={142} y={146} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="13" fontWeight="700">
        50 CENTS
      </text>
      <text x={142} y={164} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="7.8" fontWeight="700">
        MDSE ONLY 1912
      </text>

      {/* Outside Cash Exchange Haircut Card */}
      <rect x={232} y={98} width={114} height={108} rx={4} fill={pal.riskFill} stroke={pal.accent} strokeWidth={1.9 * sw} opacity={0.45 + p * 0.55} />
      <text x={289} y={128} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8.2" fontWeight="700">
        OUTSIDE USD RAIL
      </text>
      <text x={289} y={158} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="14" fontWeight="700">
        $0.37 USD
      </text>
      <text x={289} y={182} textAnchor="middle" fill={pal.muted} fontFamily={FONTS.mono} fontSize="7.8" fontWeight="700">
        LOGAN COUNTY EXIT
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 41. BritishRationBook1941 (Ep 1: Dec 1, 1941 UK 16-Point Ration Booklet)
// ============================================================================

export const BritishRationBook1941: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 44);
  const { palette: pal, progress: p, sw } = st;
  const usedPoints = Math.min(16, Math.floor(p * 16.9));

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.X // DEC 1, 1941 MINISTRY OF FOOD"
      title={props.labelOverride ?? "1941 British 16-Point Ration Booklet"}
      primaryMetric={props.metricOverride ?? `${16 - usedPoints}/16 PTS`}
      secondaryLabel="CASH UNSPENDABLE AT ZERO POINTS"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <rect x={68} y={66} width={176} height={172} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={2.1 * sw} />
      {Array.from({ length: 16 }).map((_, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const cx = 82 + col * 38;
        const cy = 80 + row * 38;
        const cancelled = idx < usedPoints;
        return (
          <g key={`cp-${idx}`}>
            <rect
              x={cx}
              y={cy}
              width={32}
              height={32}
              fill={cancelled ? pal.riskFill : pal.surfaceSubtle}
              stroke={pal.ink}
              strokeWidth={1.1 * sw}
              strokeDasharray="3 2"
            />
            {cancelled && (
              <line x1={cx + 4} y1={cy + 4} x2={cx + 28} y2={cy + 28} stroke={pal.accent} strokeWidth={2 * sw} />
            )}
          </g>
        );
      })}
      <rect x={260} y={108} width={86} height={88} rx={3} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.7 * sw} />
      <text x={303} y={142} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
        £ POUNDS
      </text>
      <text x={303} y={164} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="8.5" fontWeight="700">
        NO MORE TINS
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 42. GovernorVetoFountainPen (Ep 1: June 2016 Alaska PFD -50% Veto Slash)
// ============================================================================

export const GovernorVetoFountainPen: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 38);
  const { palette: pal, progress: p, sw } = st;
  const slashEnd = 96 + p * 184;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.Y // ALASKA JUNE 2016 LINE-ITEM VETO"
      title={props.labelOverride ?? "Executive Veto Fountain Pen ($2,052 -> $1,022)"}
      primaryMetric={props.metricOverride ?? "-50% VETO"}
      secondaryLabel="ONE SIGNATURE // -$4,120 PER FAMILY"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Citizen Dividend Check */}
      <rect x={68} y={96} width={264} height={116} rx={4} fill={pal.paper} stroke={pal.ink} strokeWidth={2.1 * sw} />
      <text x={88} y={136} fill={pal.ink} fontFamily={FONTS.mono} fontSize="13" fontWeight="700">
        FORMULA: $2,052.00
      </text>
      <line x1={88} y1={132} x2={slashEnd} y2={132} stroke={pal.accent} strokeWidth={3.4 * sw} />
      <text x={88} y={178} fill={pal.accent} fontFamily={FONTS.mono} fontSize="14" fontWeight="700">
        PAID: $1,022.00
      </text>

      {/* Angled Steel Nib Pen */}
      <g transform={`translate(${slashEnd.toFixed(1)}, 128) rotate(-32)`}>
        <polygon points="0,0 14,-8 14,8" fill={pal.accent} stroke={pal.ink} strokeWidth={1.3 * sw} />
        <rect x={14} y={-7} width={76} height={14} rx={2} fill={pal.ink} />
      </g>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 43. SupremeCourtBenchGavel (Ep 1: Wielechowski v. State 2017 Ruling)
// ============================================================================

export const SupremeCourtBenchGavel: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "slate", 38);
  const { palette: pal, progress: p, sw } = st;
  const gavelRot = -34 + p * 34;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.Z // WIELECHOWSKI V. STATE (2017)"
      title={props.labelOverride ?? "Supreme Court Appropriations Gavel"}
      primaryMetric={props.metricOverride ?? "UNANIMOUS"}
      secondaryLabel="DIVIDEND = REGULAR BUDGET LINE"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Sounding Block */}
      <rect x={86} y={196} width={116} height={24} rx={3} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={2.2 * sw} />
      {/* Striking Gavel */}
      <g transform={`translate(238, 178) rotate(${gavelRot.toFixed(1)})`}>
        <rect x={-96} y={-6} width={96} height={12} rx={2} fill={pal.paper} stroke={pal.ink} strokeWidth={1.8 * sw} />
        <rect x={-118} y={-24} width={28} height={48} rx={4} fill={pal.accent} stroke={pal.ink} strokeWidth={2 * sw} />
      </g>
      <text x={200} y={96} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="10" fontWeight="700">
        BONDS & AGENCIES PAID FIRST
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 44. MortgageDeed30YrIron (Ep 1 & Ep 5: $19.1T Fixed-Debt Cast-Iron Deed)
// ============================================================================

export const MortgageDeed30YrIron: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "brick", 42);
  const { palette: pal, progress: p, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 05.B // $19.1T HOUSEHOLD DEBT LOCK"
      title={props.labelOverride ?? "Cast-Iron 30-Year Fixed Mortgage Deed"}
      primaryMetric={props.metricOverride ?? "2025-2055"}
      secondaryLabel="70% FIXED MORTGAGE // NO REFI"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      <rect x={84} y={62} width={232} height={176} rx={6} fill={pal.paper} stroke={pal.ink} strokeWidth={2.6 * sw} />
      {[96, 304].map((rx) =>
        [76, 150, 224].map((ry) => <circle key={`${rx}-${ry}`} cx={rx} cy={ry} r={3.5} fill={pal.ink} />)
      )}
      <text x={200} y={108} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="11" fontWeight="700">
        PROMISSORY NOTE: 360 MOS
      </text>
      <text x={200} y={134} textAnchor="middle" fill={pal.accent} fontFamily={FONTS.mono} fontSize="13" fontWeight="700">
        $3,400.00 DUE 1ST
      </text>
      <path
        d={rosetteSealPathD(200, 188, 26, 14, 3.5, p * 24)}
        fill={pal.riskFill}
        stroke={pal.accent}
        strokeWidth={1.7 * sw}
      />
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// 45. PunchClock1955VsApiKey (Ep 1: 53% Labor Share Clock vs Bearer API Key)
// ============================================================================

export const PunchClock1955VsApiKey: React.FC<PropRenderProps> = (props) => {
  const st = useHeroStage(props, "teal", 42);
  const { palette: pal, frame, sw } = st;

  return (
    <BlueprintPlateFrame
      width={st.width}
      height={st.height}
      palette={pal}
      strokeScale={sw}
      datumCode="FIG 01.AA // 1947-2026 LABOR SHARE FLOOR"
      title={props.labelOverride ?? "1955 Factory Timeclock vs Bearer API Key"}
      primaryMetric={props.metricOverride ?? "53% SHARE"}
      secondaryLabel="LOWEST SINCE TRUMAN 1947"
      showAnnotations={st.showAnnotations}
      className={props.className}
      style={props.style}
    >
      {/* Left: 1955 Factory Punch Clock */}
      <rect x={66} y={76} width={108} height={152} rx={6} fill={pal.paper} stroke={pal.ink} strokeWidth={2.1 * sw} />
      <circle cx={120} cy={132} r={34} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.7 * sw} />
      <line x1={120} y1={132} x2={120} y2={106} stroke={pal.ink} strokeWidth={2 * sw} />
      <line x1={120} y1={132} x2={140} y2={132} stroke={pal.accent} strokeWidth={2 * sw} />
      <rect x={92} y={184} width={56} height={28} fill={pal.surfaceSubtle} stroke={pal.ink} strokeWidth={1.4 * sw} />

      {/* Right: Rotating Cryptographic API Key Ring */}
      <g transform={`translate(282, 152) rotate(${(frame * 1.4).toFixed(1)})`}>
        <path d={gearPathD(0, 0, 52, 42, 16, 0)} fill={pal.highlightWash} stroke={pal.secondary} strokeWidth={1.8 * sw} />
      </g>
      <text x={282} y={149} textAnchor="middle" fill={pal.secondary} fontFamily={FONTS.mono} fontSize="9.5" fontWeight="700">
        SK-LIVE-API
      </text>
      <text x={282} y={163} textAnchor="middle" fill={pal.ink} fontFamily={FONTS.mono} fontSize="8" fontWeight="700">
        24/7 ZERO W-2
      </text>
    </BlueprintPlateFrame>
  );
};

// ============================================================================
// Hero Contraption Registry Exports (45 Multi-Part Animated Hero Rigs)
// ============================================================================

interface HeroEntrySeed {
  id: string;
  componentName: string;
  title: string;
  domain: NonNullable<PropVaultEntry["domain"]>;
  category: PropVaultEntry["category"];
  episodeTags: string[];
  keywords: string[];
  animatableParts: string[];
  defaultMotion: PropVaultEntry["defaultMotion"];
  Component: React.FC<PropRenderProps>;
}

const HERO_SEEDS: readonly HeroEntrySeed[] = [
  {
    id: "hero-w2-withholding-guillotine",
    componentName: "W2WithholdingGuillotine",
    title: "W-2 Paycheck Withholding Guillotine",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep01", "ep11"],
    keywords: ["w2", "paycheck", "withholding", "guillotine", "irs", "fica", "payroll", "fiscal"],
    animatableParts: ["blade", "hoist-rope", "tax-slice"],
    defaultMotion: "guillotine-drop",
    Component: W2WithholdingGuillotine,
  },
  {
    id: "hero-treasury-bond-vault",
    componentName: "TreasuryBondVault",
    title: "Treasury Bond Custody Vault",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep01", "ep02", "ep10"],
    keywords: ["treasury", "bond", "vault", "40.5t", "debt", "custody", "coupon", "fiscal"],
    animatableParts: ["planetary-gear", "locking-pistons", "tri-spoke-wheel"],
    defaultMotion: "rotor-spin",
    Component: TreasuryBondVault,
  },
  {
    id: "hero-debt-monolith-wall",
    componentName: "DebtMonolithWall",
    title: "2036 National Debt Monolith Wall",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep01", "ep02"],
    keywords: ["cbo", "2036", "monolith", "brick-wall", "40.5t", "2.1t-interest", "debt", "fiscal"],
    animatableParts: ["masonry-courses", "plumb-line", "interest-cap"],
    defaultMotion: "ledger-tick",
    Component: DebtMonolithWall,
  },
  {
    id: "hero-spillway-dam-3tier",
    componentName: "SpillwayDam3Tier",
    title: "Three-Tier Fiscal Priority Spillway",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep01", "ep11"],
    keywords: ["spillway", "dam", "priority", "bondholders", "defense", "dividend", "fiscal"],
    animatableParts: ["reservoir-level", "tier1-conduit", "tier2-conduit", "tier3-starved"],
    defaultMotion: "wave-propagate",
    Component: SpillwayDam3Tier,
  },
  {
    id: "hero-circular-gpu-spv-carousel",
    componentName: "CircularGpuSpvCarousel",
    title: "Circular GPU Debt & Revenue Carousel",
    domain: "ai-compute",
    category: "compute-chips",
    episodeTags: ["ep03"],
    keywords: ["nvidia", "coreweave", "spv", "carousel", "circular", "176b", "depreciation", "ai-compute"],
    animatableParts: ["orbital-ring", "planetary-gear", "counterparty-pods"],
    defaultMotion: "carousel-loop",
    Component: CircularGpuSpvCarousel,
  },
  {
    id: "hero-pik-debt-snowball",
    componentName: "PikDebtSnowball",
    title: "PIK Toggle Shadow-Debt Snowball",
    domain: "fiscal",
    category: "credit-markets",
    episodeTags: ["ep04"],
    keywords: ["pik", "private-credit", "snowball", "bdc", "saas", "2.5t", "default", "fiscal"],
    animatableParts: ["compounding-sphere", "incline-ramp"],
    defaultMotion: "snowball-compound",
    Component: PikDebtSnowball,
  },
  {
    id: "hero-bond-vigilante-scale",
    componentName: "BondVigilanteScale",
    title: "Bond Vigilante Sovereign Yield Scale",
    domain: "geopolitics",
    category: "fiscal-debt",
    episodeTags: ["ep10"],
    keywords: ["france", "greece", "oat", "yield", "vigilante", "scale", "4.93%", "geopolitics", "fiscal"],
    animatableParts: ["balance-beam", "france-pan", "greece-pan"],
    defaultMotion: "scale-tilt",
    Component: BondVigilanteScale,
  },
  {
    id: "hero-social-security-2032-dial",
    componentName: "SocialSecurity2032Dial",
    title: "Social Security Q4 2032 Cliff Dial",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep11"],
    keywords: ["social-security", "oasi", "2032", "cliff", "fica", "dial", "trust-fund", "fiscal"],
    animatableParts: ["cliff-needle", "danger-arc", "fica-conduits"],
    defaultMotion: "dial-sweep",
    Component: SocialSecurity2032Dial,
  },
  {
    id: "hero-tether-tbill-stack",
    componentName: "TetherTBillStack",
    title: "Stablecoin 90-Day T-Bill Barrel Stack",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep02"],
    keywords: ["tether", "circle", "stablecoin", "genius-act", "tbill", "japan", "tic", "132.4b", "fiscal"],
    animatableParts: ["japan-column", "siphon-pipe", "tbill-barrels"],
    defaultMotion: "conveyor-shift",
    Component: TetherTBillBarrelStack,
  },
  {
    id: "hero-fed-fiat-printing-press",
    componentName: "FedFiatPrintingPress",
    title: "Federal Reserve Rotary Liquidity Press",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep01", "ep02", "ep10"],
    keywords: ["fed", "printing-press", "fiat", "inflation", "1933", "liquidity", "fiscal"],
    animatableParts: ["rotary-rollers", "currency-web"],
    defaultMotion: "rotor-spin",
    Component: FedFiatPrintingPress,
  },
  {
    id: "hero-gpu-server-rack-tower",
    componentName: "GpuServerRackTower",
    title: "42U Liquid-Cooled GPU Server Tower",
    domain: "ai-compute",
    category: "compute-chips",
    episodeTags: ["ep01", "ep03", "ep06"],
    keywords: ["gpu", "server", "rack", "42u", "capex", "820b", "hyperscaler", "ai-compute"],
    animatableParts: ["led-matrix", "thermal-shimmer", "coolant-manifolds"],
    defaultMotion: "thermal-shimmer",
    Component: GpuServerRackTower,
  },
  {
    id: "hero-irs-form-941-slicer",
    componentName: "IrsForm941Slicer",
    title: "Form 941 FICA Slicer vs GPU Bypass",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep01", "ep11"],
    keywords: ["form-941", "irs", "fica", "12.4%", "gpu-exempt", "payroll", "slicer", "fiscal", "labor"],
    animatableParts: ["slicer-blade", "w2-conduit", "gpu-bypass-lane"],
    defaultMotion: "guillotine-drop",
    Component: IrsForm941Slicer,
  },
  {
    id: "hero-repo-rate-valve",
    componentName: "RepoRateValve",
    title: "SOFR & Overnight Repo Collateral Valve",
    domain: "fiscal",
    category: "credit-markets",
    episodeTags: ["ep02", "ep04"],
    keywords: ["repo", "sofr", "valve", "collateral", "rollover", "manifold", "fiscal"],
    animatableParts: ["handwheel", "pressure-needle", "collateral-stream"],
    defaultMotion: "rotor-spin",
    Component: RepoRateValve,
  },
  {
    id: "hero-central-bank-liquidity-pump",
    componentName: "CentralBankLiquidityPump",
    title: "Central Bank Dual-Piston Liquidity Pump",
    domain: "fiscal",
    category: "fiscal-debt",
    episodeTags: ["ep01", "ep10"],
    keywords: ["central-bank", "qe", "liquidity", "pump", "piston", "wealth-gap", "fiscal"],
    animatableParts: ["piston-a", "piston-b", "asset-tank"],
    defaultMotion: "piston-cycle",
    Component: CentralBankLiquidityPump,
  },
  {
    id: "hero-token-deflation-furnace",
    componentName: "TokenDeflationFurnace",
    title: "AI Token Unit-Price Deflation Furnace",
    domain: "ai-compute",
    category: "compute-chips",
    episodeTags: ["ep01"],
    keywords: ["token", "deflation", "furnace", "ubc", "uber", "99%", "compute", "ai-compute"],
    animatableParts: ["token-hopper", "price-bar"],
    defaultMotion: "thermal-shimmer",
    Component: TokenDeflationFurnace,
  },
  {
    id: "hero-closed-scrip-wallet-rig",
    componentName: "ClosedScripWalletRig",
    title: "Closed Platform Scrip & 20% Exit Gate",
    domain: "ai-compute",
    category: "labor-household",
    episodeTags: ["ep01"],
    keywords: ["scrip", "wallet", "20%-fee", "exit-tax", "walled-garden", "platform", "ai-compute"],
    animatableParts: ["partner-stream", "exit-toll-gate"],
    defaultMotion: "guillotine-drop",
    Component: ClosedScripWalletRig,
  },
  {
    id: "hero-empty-airline-gate-14a",
    componentName: "EmptyAirlineGate14A",
    title: "Departing Gate 14A Perishable Seat",
    domain: "ai-compute",
    category: "history-archive",
    episodeTags: ["ep01"],
    keywords: ["airline", "gate-14a", "seat", "perishable", "spoilage", "compute", "ai-compute"],
    animatableParts: ["jetbridge", "fuselage-pushback", "seat-14a"],
    defaultMotion: "conveyor-shift",
    Component: EmptyAirlineGate14A,
  },
  {
    id: "hero-shenzhen-expiring-wallet",
    componentName: "ShenzhenExpiringWallet",
    title: "Programmable 6-Day Expiring Voucher",
    domain: "ai-compute",
    category: "history-archive",
    episodeTags: ["ep01"],
    keywords: ["shenzhen", "digital-yuan", "ecny", "expiring", "6-day", "wallet", "ai-compute", "history"],
    animatableParts: ["countdown-arc", "balance-meter"],
    defaultMotion: "dial-sweep",
    Component: ShenzhenExpiringWallet,
  },
  {
    id: "hero-asml-euv-kill-switch-rig",
    componentName: "AsmlEuvKillSwitchRig",
    title: "ASML EUV Scanner & Remote Kill-Switch",
    domain: "ai-compute",
    category: "compute-chips",
    episodeTags: ["ep07"],
    keywords: ["asml", "euv", "kill-switch", "taiwan", "lithography", "13.5nm", "ai-compute", "geopolitics"],
    animatableParts: ["laser-path", "kill-switch-knife", "bragg-mirrors"],
    defaultMotion: "beam-scan",
    Component: AsmlEuvKillSwitchRig,
  },
  {
    id: "hero-silicon-wafer-node-compare",
    componentName: "SiliconWaferNodeCompare",
    title: "Phoenix 4nm vs Taiwan 2nm Wafer Split",
    domain: "ai-compute",
    category: "compute-chips",
    episodeTags: ["ep07"],
    keywords: ["tsmc", "wafer", "2nm", "4nm", "a16", "phoenix", "taiwan", "apple", "ai-compute"],
    animatableParts: ["az-4nm-die", "tw-2nm-die"],
    defaultMotion: "pulse-signal",
    Component: SiliconWaferNodeCompare,
  },
  {
    id: "hero-autonomous-agent-terminal",
    componentName: "AutonomousAgentTerminal",
    title: "Autonomous Coding Terminal & Seat Drop",
    domain: "ai-compute",
    category: "compute-chips",
    episodeTags: ["ep01", "ep04"],
    keywords: ["coding-agent", "terminal", "saas", "per-seat", "headcount", "claire", "ai-compute"],
    animatableParts: ["ast-lines", "seat-counter"],
    defaultMotion: "ledger-tick",
    Component: AutonomousAgentTerminal,
  },
  {
    id: "hero-cloud-credit-tollgate",
    componentName: "CloudCreditTollgate",
    title: "Cloud Credit Rent Clearinghouse Gate",
    domain: "ai-compute",
    category: "compute-chips",
    episodeTags: ["ep01"],
    keywords: ["aws", "cloud-credits", "100k", "chase", "rent", "tollgate", "ai-compute"],
    animatableParts: ["barrier-arm", "credit-voucher"],
    defaultMotion: "guillotine-drop",
    Component: CloudCreditTollgate,
  },
  {
    id: "hero-wattage-appliance-node",
    componentName: "WattageApplianceNode",
    title: "Wattage Scale Ladder: 10W to 5GW AI",
    domain: "energy-grid",
    category: "energy-grid",
    episodeTags: ["ep01", "ep06"],
    keywords: ["10w", "microwave", "1kw", "1gw", "5gw", "nextera", "wattage", "energy-grid"],
    animatableParts: ["load-columns", "campus-peak"],
    defaultMotion: "ledger-tick",
    Component: WattageApplianceNode,
  },
  {
    id: "hero-high-voltage-substation-rig",
    componentName: "HighVoltageSubstationRig",
    title: "Substation Busbar & Housing Lockout",
    domain: "energy-grid",
    category: "energy-grid",
    episodeTags: ["ep01", "ep06"],
    keywords: ["substation", "m4-london", "housing-delay", "busbar", "breaker", "94gw", "energy-grid"],
    animatableParts: ["ai-feeder", "housing-breaker"],
    defaultMotion: "pulse-signal",
    Component: HighVoltageSubstationRig,
  },
  {
    id: "hero-transformer-128-week-queue",
    componentName: "Transformer128WeekQueue",
    title: "500kV Transformer 128-Week Waitlist",
    domain: "energy-grid",
    category: "energy-grid",
    episodeTags: ["ep06"],
    keywords: ["transformer", "lpt", "128-week", "waitlist", "china-60%", "steel", "energy-grid"],
    animatableParts: ["rail-flatcar", "radiator-fins", "queue-gate"],
    defaultMotion: "conveyor-shift",
    Component: Transformer128WeekQueue,
  },
  {
    id: "hero-nuclear-cooling-tower-lock",
    componentName: "NuclearCoolingTowerLock",
    title: "Nuclear Reactor 20-Year Single-Buyer Lock",
    domain: "energy-grid",
    category: "energy-grid",
    episodeTags: ["ep01", "ep06"],
    keywords: ["three-mile-island", "nuclear", "cooling-tower", "microsoft", "20-yr-ppa", "padlock", "energy-grid"],
    animatableParts: ["vapor-plume", "ppa-shackle"],
    defaultMotion: "stamp-press",
    Component: NuclearCoolingTowerLock,
  },
  {
    id: "hero-copper-open-pit-clock",
    componentName: "CopperOpenPitClock",
    title: "17.5-Year Open-Pit Copper Mine Clock",
    domain: "energy-grid",
    category: "minerals-industrial",
    episodeTags: ["ep06"],
    keywords: ["copper", "open-pit", "17.5-years", "iea", "china-72%", "refining", "energy-grid", "geopolitics"],
    animatableParts: ["mine-terraces", "chronometer-hand"],
    defaultMotion: "dial-sweep",
    Component: CopperOpenPitClock,
  },
  {
    id: "hero-pjm-auction-meter",
    componentName: "PjmAuctionMeter",
    title: "PJM Wholesale Capacity +833% Surge",
    domain: "energy-grid",
    category: "energy-grid",
    episodeTags: ["ep01", "ep06"],
    keywords: ["pjm", "auction", "833%", "269.92", "329.17", "utility-bill", "capacity", "energy-grid"],
    animatableParts: ["baseline-bar", "surge-column"],
    defaultMotion: "ledger-tick",
    Component: PjmAuctionMeter,
  },
  {
    id: "hero-transmission-tower-765kv",
    componentName: "TransmissionTower765kV",
    title: "765kV Lattice Pylon & 10-Year Queue",
    domain: "energy-grid",
    category: "energy-grid",
    episodeTags: ["ep01", "ep06"],
    keywords: ["765kv", "transmission", "pylon", "permitting", "10-years", "grid", "energy-grid"],
    animatableParts: ["lattice-tower", "permitting-bar"],
    defaultMotion: "draw-blueprint",
    Component: TransmissionTower765kV,
  },
  {
    id: "hero-carrier-vs-drone-exchange",
    componentName: "CarrierVsDroneExchange",
    title: "100:1 Carrier VLS vs $20k Drone Exchange",
    domain: "maritime-defense",
    category: "defense-maritime",
    episodeTags: ["ep08"],
    keywords: ["carrier", "drone", "vls", "sm-6", "100-to-1", "red-sea", "pentagon", "maritime-defense"],
    animatableParts: ["vls-cells", "interceptor-arc", "delta-drone"],
    defaultMotion: "pulse-signal",
    Component: CarrierVsDroneExchange,
  },
  {
    id: "hero-subsea-cable-anchor-cut",
    componentName: "SubseaCableAnchorCut",
    title: "Subsea Fiber Trunk & Dragged Anchor Cut",
    domain: "maritime-defense",
    category: "subsea-telecom",
    episodeTags: ["ep09"],
    keywords: ["subsea", "cable", "550-cables", "10t-swift", "anchor", "baltic", "red-sea", "maritime-defense"],
    animatableParts: ["fiber-pulses", "dragging-anchor", "sever-arc"],
    defaultMotion: "anchor-drag",
    Component: SubseaCableAnchorCut,
  },
  {
    id: "hero-autonomous-port-gantry-2034",
    componentName: "AutonomousPortGantry2034",
    title: "2034 Automated STS Gantry & AGV Fleet",
    domain: "labor",
    category: "defense-maritime",
    episodeTags: ["ep01"],
    keywords: ["port", "gantry", "crane", "2034", "autonomous", "agv", "strike", "labor", "maritime-defense"],
    animatableParts: ["trolley-spreader", "agv-chassis"],
    defaultMotion: "conveyor-shift",
    Component: AutonomousPortGantry2034,
  },
  {
    id: "hero-idle-pier-1955",
    componentName: "IdlePier1955",
    title: "1955 Idle Strike Pier & Locked Boom",
    domain: "labor",
    category: "labor-household",
    episodeTags: ["ep01"],
    keywords: ["1955", "rotterdam", "detroit", "pier", "strike", "walkout", "bargaining", "labor", "history"],
    animatableParts: ["locked-derrick", "strike-placard"],
    defaultMotion: "stamp-press",
    Component: IdlePier1955,
  },
  {
    id: "hero-panamax-container-ship",
    componentName: "PanamaxContainerShip",
    title: "Panamax Vessel & Pulled War-Risk Seal",
    domain: "maritime-defense",
    category: "defense-maritime",
    episodeTags: ["ep07", "ep09"],
    keywords: ["panamax", "container-ship", "insurance", "war-risk", "taiwan-strait", "maritime-defense"],
    animatableParts: ["teu-stack", "void-seal"],
    defaultMotion: "stamp-press",
    Component: PanamaxContainerShip,
  },
  {
    id: "hero-chokepoint-radar-array",
    componentName: "ChokepointRadarArray",
    title: "Strait Chokepoint Coastal Radar Scope",
    domain: "maritime-defense",
    category: "defense-maritime",
    episodeTags: ["ep06", "ep07", "ep08", "ep09"],
    keywords: ["radar", "chokepoint", "strait", "taiwan", "red-sea", "baltic", "maritime-defense", "geopolitics"],
    animatableParts: ["sweep-beam", "transponder-blips"],
    defaultMotion: "beam-scan",
    Component: ChokepointRadarArray,
  },
  {
    id: "hero-claire-austin-house-rig",
    componentName: "ClaireAustinHouseRig",
    title: "Claire's Austin Home & $3,400 Mortgage",
    domain: "household",
    category: "housing-insurance",
    episodeTags: ["ep01", "ep05"],
    keywords: ["claire", "austin", "house", "3400", "mortgage", "ac-condenser", "smart-meter", "household"],
    animatableParts: ["kwh-meter", "ac-fan", "elevation-state"],
    defaultMotion: "rotor-spin",
    Component: ClaireAustinHouseRig,
  },
  {
    id: "hero-running-shoe-exploded-stack",
    componentName: "RunningShoeExplodedStack",
    title: "$120 Running Shoe Exploded Labor Stack",
    domain: "household",
    category: "labor-household",
    episodeTags: ["ep01"],
    keywords: ["running-shoe", "120", "bom", "unit-cost", "memphis", "labor-hours", "household", "labor"],
    animatableParts: ["bom-layers", "electricity-floor"],
    defaultMotion: "piston-cycle",
    Component: RunningShoeExplodedStack,
  },
  {
    id: "hero-palo-alto-flip-whiteboard",
    componentName: "PaloAltoFlipWhiteboard",
    title: "Palo Alto Whiteboard vs 30-Year Loan",
    domain: "household",
    category: "housing-insurance",
    episodeTags: ["ep01"],
    keywords: ["whiteboard", "palo-alto", "abundance", "debt-deflation", "fisher", "30-year-loan", "household"],
    animatableParts: ["revolving-slate", "a-frame"],
    defaultMotion: "scale-tilt",
    Component: PaloAltoFlipWhiteboard,
  },
  {
    id: "hero-roof-scan-insurance-drone",
    componentName: "RoofScanInsuranceDrone",
    title: "Underwriting Roof-Scan LiDAR Drone",
    domain: "household",
    category: "housing-insurance",
    episodeTags: ["ep05"],
    keywords: ["drone", "roof-scan", "insurance", "fair-plan", "29.1%", "escrow", "13.4t", "household"],
    animatableParts: ["quadcopter", "lidar-cone", "force-placed-grid"],
    defaultMotion: "beam-scan",
    Component: RoofScanInsuranceDrone,
  },
  {
    id: "hero-coal-scrip-brass-token-1912",
    componentName: "CoalScripBrassToken1912",
    title: "1912 Island Creek Brass Scrip Token",
    domain: "history",
    category: "history-archive",
    episodeTags: ["ep01"],
    keywords: ["coal-scrip", "1912", "west-virginia", "island-creek", "brass-token", "flsa", "history", "labor"],
    animatableParts: ["brass-medallion", "discount-card"],
    defaultMotion: "stamp-press",
    Component: CoalScripBrassToken1912,
  },
  {
    id: "hero-british-ration-book-1941",
    componentName: "BritishRationBook1941",
    title: "1941 British 16-Point Ration Booklet",
    domain: "history",
    category: "history-archive",
    episodeTags: ["ep01"],
    keywords: ["ration-book", "1941", "britain", "16-points", "ministry-of-food", "bottleneck", "history"],
    animatableParts: ["coupon-grid", "cancellation-slashes"],
    defaultMotion: "ledger-tick",
    Component: BritishRationBook1941,
  },
  {
    id: "hero-governor-veto-fountain-pen",
    componentName: "GovernorVetoFountainPen",
    title: "Executive Veto Fountain Pen ($2,052 -> $1,022)",
    domain: "legal",
    category: "legal-filings",
    episodeTags: ["ep01"],
    keywords: ["alaska", "pfd", "veto", "fountain-pen", "bill-walker", "2016", "allowance", "legal"],
    animatableParts: ["fountain-nib", "crimson-slash"],
    defaultMotion: "draw-blueprint",
    Component: GovernorVetoFountainPen,
  },
  {
    id: "hero-supreme-court-bench-gavel",
    componentName: "SupremeCourtBenchGavel",
    title: "Supreme Court Appropriations Gavel",
    domain: "legal",
    category: "legal-filings",
    episodeTags: ["ep01"],
    keywords: ["supreme-court", "gavel", "wielechowski", "alaska", "constitution", "appropriation", "legal"],
    animatableParts: ["gavel-arm", "sounding-block"],
    defaultMotion: "stamp-press",
    Component: SupremeCourtBenchGavel,
  },
  {
    id: "hero-mortgage-deed-30yr-iron",
    componentName: "MortgageDeed30YrIron",
    title: "Cast-Iron 30-Year Fixed Mortgage Deed",
    domain: "household",
    category: "housing-insurance",
    episodeTags: ["ep01", "ep05"],
    keywords: ["mortgage", "deed", "30-year", "19.1t", "fixed-rate", "2055", "household", "legal"],
    animatableParts: ["rivet-plate", "rosette-seal"],
    defaultMotion: "stamp-press",
    Component: MortgageDeed30YrIron,
  },
  {
    id: "hero-punch-clock-1955-vs-api-key",
    componentName: "PunchClock1955VsApiKey",
    title: "1955 Factory Timeclock vs Bearer API Key",
    domain: "labor",
    category: "labor-household",
    episodeTags: ["ep01"],
    keywords: ["timeclock", "1955", "1947", "53%-labor-share", "api-key", "truman", "labor"],
    animatableParts: ["clock-hands", "api-gear-ring"],
    defaultMotion: "rotor-spin",
    Component: PunchClock1955VsApiKey,
  },
];

export const HERO_CONTRAPTION_ENTRIES: readonly PropVaultEntry[] = HERO_SEEDS.map((s) => ({
  id: s.id,
  title: s.title,
  label: s.title,
  componentName: s.componentName,
  kind: "hero-contraption",
  domain: s.domain,
  category: s.category,
  episodeTags: s.episodeTags,
  keywords: s.keywords,
  animatableParts: s.animatableParts,
  defaultMotion: s.defaultMotion,
  aspectRatio: "4:3",
  viewBox: "0 0 400 300",
  Component: s.Component,
}));

const heroMapRecord: Record<string, React.FC<PropRenderProps>> = {
  TetherTBillBarrelStack,
};
for (let i = 0; i < HERO_SEEDS.length; i++) {
  const item = HERO_SEEDS[i];
  heroMapRecord[item.id] = item.Component;
  heroMapRecord[item.componentName] = item.Component;
}

export const HERO_CONTRAPTIONS: Readonly<Record<string, React.FC<PropRenderProps>>> = heroMapRecord;
