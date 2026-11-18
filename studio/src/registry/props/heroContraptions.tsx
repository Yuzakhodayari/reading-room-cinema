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
  ResolvedPropPalette,
  resolveAnimState,
  resolvePropPalette,
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
