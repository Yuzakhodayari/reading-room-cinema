import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fitSvgTextToWidth } from "../../design/fitText";
import { FONTS } from "../../design/fonts";
import {
  ArchivalArtifactParams,
  ArchitecturalElevationParams,
  BalanceLedgerParams,
  BanknoteBondParams,
  ChartInstrumentParams,
  ConsumerExplodedBomParams,
  clamp01,
  clampRange,
  describeArc,
  detRand,
  gearPathD,
  GridApparatusParams,
  IndustrialPlantParams,
  LegalDossierParams,
  MaritimeDefenseParams,
  ParametricPropBlueprint,
  PrecisionDialParams,
  PropRenderProps,
  regularPolygonPoints,
  ResolvedPropPalette,
  resolveAnimState,
  resolvePropPalette,
  rosetteSealPathD,
  RotaryValveParams,
  SemiconductorDieParams,
  ServerChassisParams,
  SubseaNetworkParams,
  TelestratorAnnotationParams,
  polarToCartesian,
} from "./propTypes";

// ============================================================================
// Shared Blueprint Drafting Plate & Technical Telemetry Frame
// ============================================================================

export interface BlueprintStageContext {
  frame: number;
  fps: number;
  progress: number;
  phaseRad: number;
  palette: ResolvedPropPalette;
  sw: number;
  seed: string;
}

export interface BlueprintPlateFrameProps {
  width: number;
  height: number;
  palette: ResolvedPropPalette;
  strokeScale: number;
  datumCode: string;
  title: string;
  primaryMetric: string;
  secondaryLabel: string;
  showAnnotations: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const BlueprintPlateFrame: React.FC<BlueprintPlateFrameProps> = ({
  width,
  height,
  palette,
  strokeScale,
  datumCode,
  title,
  primaryMetric,
  secondaryLabel,
  showAnnotations,
  className,
  style,
  children,
}) => {
  const sw = strokeScale;
  const plateSpan = 352; // x=24..376 inside 400x300 viewBox
  const minColumnGap = 24; // >= 19px even at 320px plate width

  const fittedMetric = fitSvgTextToWidth(primaryMetric, 134, 10.5, 7.5, "mono", {
    fontWeight: 700,
    letterSpacingEm: 0.05,
  });
  const leftDatumMaxW = Math.max(120, plateSpan - minColumnGap - fittedMetric.estimatedWidth);
  const fittedDatum = fitSvgTextToWidth(datumCode.toUpperCase(), leftDatumMaxW, 9.2, 7.2, "mono", {
    fontWeight: 600,
    letterSpacingEm: 0.06,
  });

  const fittedSecondary = fitSvgTextToWidth(secondaryLabel, 152, 9.0, 7.2, "mono", {
    fontWeight: 500,
  });
  const leftTitleMaxW = Math.max(120, plateSpan - minColumnGap - fittedSecondary.estimatedWidth);
  const fittedTitle = fitSvgTextToWidth(title, leftTitleMaxW, 10.5, 7.8, "sans", {
    fontWeight: 600,
    letterSpacingEm: 0.02,
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: "block",
        overflow: "visible",
        fontVariantNumeric: "tabular-nums lining-nums",
        ...style,
      }}
    >
      {/* Subtle architectural drafting registration marks */}
      <g stroke={palette.border} strokeWidth={0.9 * sw}>
        <path d="M 14 26 L 14 14 L 26 14" />
        <path d="M 374 14 L 386 14 L 386 26" />
        <path d="M 14 274 L 14 286 L 26 286" />
        <path d="M 374 286 L 386 286 L 386 274" />
        <line x1="196" y1="14" x2="204" y2="14" />
        <line x1="196" y1="286" x2="204" y2="286" />
        <line x1="14" y1="146" x2="14" y2="154" />
        <line x1="386" y1="146" x2="386" y2="154" />
      </g>

      {showAnnotations && (
        <g>
          {/* Top technical datum eyebrow + right metric with guaranteed >=24-unit clearance */}
          <text
            x="24"
            y="27"
            fill={palette.muted}
            fontFamily={FONTS.mono}
            fontSize={fittedDatum.fontSize}
            fontWeight="600"
            letterSpacing="0.06em"
          >
            {fittedDatum.text}
          </text>
          <text
            x="376"
            y="27"
            textAnchor="end"
            fill={palette.accent}
            fontFamily={FONTS.mono}
            fontSize={fittedMetric.fontSize}
            fontWeight="700"
            letterSpacing="0.05em"
          >
            {fittedMetric.text}
          </text>
          <line
            x1="24"
            y1="34"
            x2="376"
            y2="34"
            stroke={palette.border}
            strokeWidth={0.85 * sw}
          />

          {/* Bottom title & secondary engineering note */}
          <line
            x1="24"
            y1="266"
            x2="376"
            y2="266"
            stroke={palette.border}
            strokeWidth={0.85 * sw}
          />
          <text
            x="24"
            y="280"
            fill={palette.ink}
            fontFamily={FONTS.sans}
            fontSize={fittedTitle.fontSize}
            fontWeight="600"
            letterSpacing="0.02em"
          >
            {fittedTitle.text}
          </text>
          <text
            x="376"
            y="280"
            textAnchor="end"
            fill={palette.muted}
            fontFamily={FONTS.mono}
            fontSize={fittedSecondary.fontSize}
            fontWeight="500"
          >
            {fittedSecondary.text}
          </text>
        </g>
      )}

      {/* Main schematic viewport */}
      <g>{children}</g>
    </svg>
  );
};

// ============================================================================
// Builder 1: Precision Dial Gauge (Chronometers, Yield Dials, Spread Meters)
// ============================================================================

function renderPrecisionDialGauge(
  spec: PrecisionDialParams,
  ctx: BlueprintStageContext,
  metricText: string
): React.ReactNode {
  const { palette, progress, frame, sw } = ctx;
  const cx = 200;
  const cy = 152;
  const rOuter = 86;
  const halfSweep = clampRange(spec.arcSweepDeg, 160, 310) / 2;
  const startDeg = -halfSweep;
  const endDeg = halfSweep;
  const dangerStartDeg = startDeg + (endDeg - startDeg) * clampRange(spec.dangerZoneStartPct, 0.45, 0.92);

  const needleNorm = clamp01(spec.targetNorm * progress);
  const jitter =
    needleNorm >= spec.dangerZoneStartPct
      ? Math.sin(frame * 0.55) * 1.6 * (needleNorm - spec.dangerZoneStartPct + 0.2)
      : 0;
  const needleAngle = startDeg + (endDeg - startDeg) * needleNorm + jitter;
  const secondaryNorm =
    spec.secondaryNorm !== undefined ? clamp01(spec.secondaryNorm * progress) : undefined;
  const secondaryAngle =
    secondaryNorm !== undefined ? startDeg + (endDeg - startDeg) * secondaryNorm : 0;

  const majorCount = Math.max(4, Math.min(18, spec.majorTicks));
  const minorSubs = Math.max(2, Math.min(5, spec.minorSubdivisions));
  const ticks: React.ReactNode[] = [];
  const totalSteps = majorCount * minorSubs;
  for (let i = 0; i <= totalSteps; i++) {
    const frac = i / totalSteps;
    const deg = startDeg + (endDeg - startDeg) * frac;
    const isMajor = i % minorSubs === 0;
    const p1 = polarToCartesian(cx, cy, rOuter - 10, deg);
    const p2 = polarToCartesian(cx, cy, rOuter - (isMajor ? 22 : 15), deg);
    const inDanger = frac >= spec.dangerZoneStartPct;
    ticks.push(
      <line
        key={`t-${i}`}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={inDanger ? palette.accent : isMajor ? palette.ink : palette.muted}
        strokeWidth={(isMajor ? 1.8 : 0.9) * sw}
        strokeLinecap="round"
      />
    );
  }

  const tip = polarToCartesian(cx, cy, rOuter - 20, needleAngle);
  const tail = polarToCartesian(cx, cy, -18, needleAngle);
  const leftWing = polarToCartesian(cx, cy, 5, needleAngle - 90);
  const rightWing = polarToCartesian(cx, cy, 5, needleAngle + 90);

  return (
    <g>
      {/* Outer Bezel */}
      {spec.bezelStyle === "octagonal-bolted" && (
        <g>
          <polygon
            points={regularPolygonPoints(cx, cy, rOuter + 12, 8, 22.5)}
            fill={palette.surfaceSubtle}
            fillOpacity={0.55}
            stroke={palette.ink}
            strokeWidth={2 * sw}
          />
          {Array.from({ length: 8 }).map((_, idx) => {
            const b = polarToCartesian(cx, cy, rOuter + 5, 22.5 + idx * 45);
            return (
              <circle
                key={`b-${idx}`}
                cx={b.x}
                cy={b.y}
                r={2.4}
                fill={palette.paper}
                stroke={palette.ink}
                strokeWidth={1.1 * sw}
              />
            );
          })}
        </g>
      )}
      {spec.bezelStyle === "square-panel" && (
        <rect
          x={cx - 98}
          y={cy - 94}
          width={196}
          height={188}
          rx={10}
          fill={palette.surfaceSubtle}
          fillOpacity={0.48}
          stroke={palette.ink}
          strokeWidth={2 * sw}
        />
      )}
      {spec.bezelStyle === "flanged-brass" && (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={rOuter + 11}
            fill={palette.surfaceSubtle}
            fillOpacity={0.5}
            stroke={palette.ink}
            strokeWidth={2 * sw}
          />
          {[45, 135, 225, 315].map((ang) => {
            const lug = polarToCartesian(cx, cy, rOuter + 13, ang);
            return (
              <circle
                key={ang}
                cx={lug.x}
                cy={lug.y}
                r={5.5}
                fill={palette.paper}
                stroke={palette.ink}
                strokeWidth={1.4 * sw}
              />
            );
          })}
        </g>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={rOuter}
        fill={palette.paper}
        fillOpacity={0.85}
        stroke={palette.ink}
        strokeWidth={2.1 * sw}
      />
      <circle
        cx={cx}
        cy={cy}
        r={rOuter - 6}
        stroke={palette.border}
        strokeWidth={1 * sw}
      />

      {/* Scale Arc + Danger Threshold Sector */}
      <path
        d={describeArc(cx, cy, rOuter - 10, startDeg, endDeg)}
        stroke={palette.ink}
        strokeWidth={1.4 * sw}
      />
      <path
        d={describeArc(cx, cy, rOuter - 13, dangerStartDeg, endDeg)}
        stroke={palette.accent}
        strokeWidth={4.5 * sw}
        strokeOpacity={0.75}
      />

      {ticks}

      {/* Sub-dials */}
      {spec.subDialCount >= 1 && (
        <g>
          <circle
            cx={spec.subDialCount === 2 ? cx - 28 : cx}
            cy={cy + 28}
            r={16}
            fill={palette.surfaceSubtle}
            stroke={palette.muted}
            strokeWidth={1.1 * sw}
          />
          <line
            x1={spec.subDialCount === 2 ? cx - 28 : cx}
            y1={cy + 28}
            x2={
              (spec.subDialCount === 2 ? cx - 28 : cx) +
              Math.cos(frame * 0.14) * 11
            }
            y2={cy + 28 + Math.sin(frame * 0.14) * 11}
            stroke={palette.secondary}
            strokeWidth={1.3 * sw}
          />
        </g>
      )}
      {spec.subDialCount === 2 && (
        <g>
          <circle
            cx={cx + 28}
            cy={cy + 28}
            r={16}
            fill={palette.surfaceSubtle}
            stroke={palette.muted}
            strokeWidth={1.1 * sw}
          />
          <line
            x1={cx + 28}
            y1={cy + 28}
            x2={cx + 28 + Math.cos(-frame * 0.09 + 1) * 11}
            y2={cy + 28 + Math.sin(-frame * 0.09 + 1) * 11}
            stroke={palette.accent}
            strokeWidth={1.3 * sw}
          />
        </g>
      )}

      {/* Optional Dual Comparison Needle */}
      {secondaryNorm !== undefined && (
        <line
          x1={cx}
          y1={cy}
          x2={polarToCartesian(cx, cy, rOuter - 24, secondaryAngle).x}
          y2={polarToCartesian(cx, cy, rOuter - 24, secondaryAngle).y}
          stroke={palette.secondary}
          strokeWidth={2 * sw}
          strokeDasharray="4 2"
          strokeLinecap="round"
        />
      )}

      {/* Primary Needle */}
      {spec.needleStyle === "tapered" || spec.needleStyle === "vernier-dual" ? (
        <polygon
          points={`${leftWing.x.toFixed(1)},${leftWing.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${rightWing.x.toFixed(1)},${rightWing.y.toFixed(1)} ${tail.x.toFixed(1)},${tail.y.toFixed(1)}`}
          fill={palette.accent}
          stroke={palette.ink}
          strokeWidth={1 * sw}
        />
      ) : (
        <g>
          <line
            x1={tail.x}
            y1={tail.y}
            x2={tip.x}
            y2={tip.y}
            stroke={palette.accent}
            strokeWidth={2.5 * sw}
            strokeLinecap="round"
          />
          <circle
            cx={tail.x}
            cy={tail.y}
            r={4.5}
            fill={palette.paper}
            stroke={palette.accent}
            strokeWidth={1.5 * sw}
          />
        </g>
      )}

      {/* Center Cap & Digital Odometer Window */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={palette.ink}
        stroke={palette.paper}
        strokeWidth={1.6 * sw}
      />
      <rect
        x={cx - 42}
        y={cy + 50}
        width={84}
        height={20}
        rx={3}
        fill={palette.surfaceSubtle}
        stroke={palette.ink}
        strokeWidth={1.2 * sw}
      />
      <text
        x={cx}
        y={cy + 64}
        textAnchor="middle"
        fill={palette.ink}
        fontFamily={FONTS.mono}
        fontSize="10.5"
        fontWeight="700"
      >
        {metricText.slice(0, 11)}
      </text>
    </g>
  );
}

// ============================================================================
// Builder 2: Rotary Valve & Hydraulic Plumbing Manifold
// ============================================================================

function renderRotaryValveManifold(
  spec: RotaryValveParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, progress, frame, sw } = ctx;
  const cx = 200;
  const cy = 156;
  const flowDashOffset = -(frame * 1.8) % 24;
  const wheelRot = progress * 165;
  const gateLift = progress * 22;

  const renderFlange = (fx: number, fy: number, vertical: boolean) => (
    <g key={`fl-${fx}-${fy}`}>
      <rect
        x={vertical ? fx - 22 : fx - 4}
        y={vertical ? fy - 4 : fy - 22}
        width={vertical ? 44 : 8}
        height={vertical ? 8 : 44}
        rx={1.5}
        fill={palette.surfaceSubtle}
        stroke={palette.ink}
        strokeWidth={1.6 * sw}
      />
    </g>
  );

  return (
    <g>
      {/* Bypass Conduit */}
      {spec.bypassLoop && (
        <path
          d="M 110 156 L 110 226 L 290 226 L 290 156"
          stroke={palette.secondary}
          strokeWidth={7 * sw}
          strokeOpacity={0.25}
          fill="none"
        />
      )}
      {spec.bypassLoop && (
        <path
          d="M 110 156 L 110 226 L 290 226 L 290 156"
          stroke={palette.secondary}
          strokeWidth={1.5 * sw}
          strokeDasharray="5 4"
          strokeDashoffset={flowDashOffset}
          fill="none"
        />
      )}

      {/* Inlet Pipes (Left) */}
      {Array.from({ length: spec.inletPipes }).map((_, idx) => {
        const span = (spec.inletPipes - 1) * 26;
        const py = cy - span / 2 + idx * 26;
        return (
          <g key={`in-${idx}`}>
            <rect
              x={54}
              y={py - 10}
              width={96}
              height={20}
              fill={palette.surfaceSubtle}
              stroke={palette.ink}
              strokeWidth={1.8 * sw}
            />
            <line
              x1={60}
              y1={py}
              x2={146}
              y2={py}
              stroke={palette.secondary}
              strokeWidth={2 * sw}
              strokeDasharray="7 5"
              strokeDashoffset={flowDashOffset}
            />
            {renderFlange(68, py, false)}
          </g>
        );
      })}

      {/* Outlet Pipes (Right) */}
      {Array.from({ length: spec.outletPipes }).map((_, idx) => {
        const span = (spec.outletPipes - 1) * 26;
        const py = cy - span / 2 + idx * 26;
        return (
          <g key={`out-${idx}`}>
            <rect
              x={250}
              y={py - 10}
              width={96}
              height={20}
              fill={palette.surfaceSubtle}
              stroke={palette.ink}
              strokeWidth={1.8 * sw}
            />
            <line
              x1={254}
              y1={py}
              x2={342}
              y2={py}
              stroke={palette.accent}
              strokeWidth={2 * sw}
              strokeDasharray="7 5"
              strokeDashoffset={flowDashOffset}
            />
            {renderFlange(332, py, false)}
          </g>
        );
      })}

      {/* Central Valve Chamber */}
      <rect
        x={cx - 52}
        y={cy - 44}
        width={104}
        height={88}
        rx={12}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={2.2 * sw}
      />

      {/* Internal Sliding Gate Baffle */}
      <rect
        x={cx - 12}
        y={cy - 34 - gateLift * 0.6}
        width={24}
        height={56}
        rx={2}
        fill={palette.accent}
        fillOpacity={0.22}
        stroke={palette.accent}
        strokeWidth={1.8 * sw}
      />

      {/* Sight Glass Flow Window */}
      {spec.flowMeterWindow && (
        <g>
          <circle
            cx={cx}
            cy={cy + 14}
            r={18}
            fill={palette.surfaceSubtle}
            stroke={palette.ink}
            strokeWidth={1.5 * sw}
          />
          <path
            d={`M ${cx - 14} ${cy + 16} Q ${cx - 6} ${cy + 10 + Math.sin(frame * 0.2) * 4} ${cx} ${cy + 16} T ${cx + 14} ${cy + 16}`}
            stroke={palette.secondary}
            strokeWidth={1.8 * sw}
            fill="none"
          />
        </g>
      )}

      {/* Bonnet Stem & Rotary Handwheel */}
      <rect
        x={cx - 6}
        y={cy - 82}
        width={12}
        height={38}
        fill={palette.surfaceSubtle}
        stroke={palette.ink}
        strokeWidth={1.6 * sw}
      />
      <g transform={`translate(${cx}, ${cy - 88}) rotate(${wheelRot.toFixed(1)})`}>
        <circle
          cx={0}
          cy={0}
          r={30}
          stroke={palette.ink}
          strokeWidth={4 * sw}
          fill="none"
        />
        <circle
          cx={0}
          cy={0}
          r={27}
          stroke={palette.accent}
          strokeWidth={1.2 * sw}
          fill="none"
        />
        {Array.from({ length: Math.max(3, spec.handwheelSpokes) }).map((_, i) => {
          const ang = (360 / Math.max(3, spec.handwheelSpokes)) * i;
          const pt = polarToCartesian(0, 0, 27, ang);
          return (
            <line
              key={`sp-${i}`}
              x1={0}
              y1={0}
              x2={pt.x}
              y2={pt.y}
              stroke={palette.ink}
              strokeWidth={2 * sw}
            />
          );
        })}
        <circle cx={0} cy={0} r={6} fill={palette.accent} stroke={palette.ink} strokeWidth={1.4 * sw} />
      </g>

      {/* Pressure Relief Stack */}
      {spec.pressureReliefStack && (
        <g>
          <rect
            x={cx + 32}
            y={cy - 70}
            width={14}
            height={26}
            fill={palette.surfaceSubtle}
            stroke={palette.ink}
            strokeWidth={1.4 * sw}
          />
          <circle
            cx={cx + 39}
            cy={cy - 78}
            r={9}
            fill={palette.paper}
            stroke={palette.accent}
            strokeWidth={1.4 * sw}
          />
        </g>
      )}
    </g>
  );
}

// ============================================================================
// Builder 3: Banknote, Sovereign Bond & Bearer Scrip Instrument
// ============================================================================

function renderBanknoteBondInstrument(
  spec: BanknoteBondParams,
  ctx: BlueprintStageContext,
  metricText: string,
  datumCode: string
): React.ReactNode {
  const { palette, progress, frame, sw } = ctx;
  const noteW = spec.couponStubs > 0 ? 250 : 292;
  const noteX = 54;
  const noteY = 74;
  const noteH = 148;

  const waves: string[] = [];
  const waveSteps = Math.max(10, spec.borderGuillocheWaves * 2);
  for (let i = 0; i <= waveSteps; i++) {
    const x = noteX + 12 + ((noteW - 24) * i) / waveSteps;
    const y = noteY + 12 + Math.sin((i / waveSteps) * Math.PI * spec.borderGuillocheWaves) * 3.2;
    waves.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  const sealCx =
    spec.sealPosition === "left"
      ? noteX + 64
      : spec.sealPosition === "right"
        ? noteX + noteW - 64
        : noteX + noteW / 2;
  const sealCy = noteY + noteH / 2 + 4;

  return (
    <g>
      {/* Underlying stacked sheet shadow */}
      <rect
        x={noteX + 5}
        y={noteY + 5}
        width={noteW}
        height={noteH}
        rx={4}
        fill={palette.surfaceSubtle}
        stroke={palette.border}
        strokeWidth={1.2 * sw}
      />
      {/* Main Engraved Certificate Body */}
      <rect
        x={noteX}
        y={noteY}
        width={noteW}
        height={noteH}
        rx={4}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={2.1 * sw}
      />
      {/* Inner Guilloche Frame */}
      <rect
        x={noteX + 8}
        y={noteY + 8}
        width={noteW - 16}
        height={noteH - 16}
        rx={2}
        stroke={palette.ink}
        strokeWidth={0.9 * sw}
      />
      <path d={waves.join(" ")} stroke={palette.secondary} strokeWidth={1 * sw} fill="none" />

      {/* Corner Denomination Counters */}
      {[
        [noteX + 22, noteY + 24],
        [noteX + noteW - 22, noteY + 24],
        [noteX + 22, noteY + noteH - 24],
        [noteX + noteW - 22, noteY + noteH - 24],
      ].map(([cx, cy], idx) => (
        <g key={`cn-${idx}`}>
          {spec.cornerFrame === "octagon" ? (
            <polygon
              points={regularPolygonPoints(cx, cy, 11, 8, 22.5)}
              fill={palette.surfaceSubtle}
              stroke={palette.ink}
              strokeWidth={1.1 * sw}
            />
          ) : spec.cornerFrame === "diamond" ? (
            <polygon
              points={regularPolygonPoints(cx, cy, 11, 4, 0)}
              fill={palette.surfaceSubtle}
              stroke={palette.ink}
              strokeWidth={1.1 * sw}
            />
          ) : (
            <ellipse
              cx={cx}
              cy={cy}
              rx={12}
              ry={9}
              fill={palette.surfaceSubtle}
              stroke={palette.ink}
              strokeWidth={1.1 * sw}
            />
          )}
        </g>
      ))}

      {/* Central Watermark & Denomination Typography */}
      <circle
        cx={noteX + noteW / 2}
        cy={noteY + noteH / 2}
        r={34}
        stroke={palette.border}
        strokeWidth={1.1 * sw}
        strokeDasharray="3 3"
      />
      <text
        x={noteX + noteW / 2}
        y={noteY + 42}
        textAnchor="middle"
        fill={palette.muted}
        fontFamily={FONTS.serif}
        fontSize="10"
        fontWeight="600"
        letterSpacing="0.14em"
      >
        {datumCode.toUpperCase()}
      </text>
      <text
        x={noteX + noteW / 2}
        y={noteY + 84}
        textAnchor="middle"
        fill={palette.ink}
        fontFamily={FONTS.serif}
        fontSize="24"
        fontWeight="700"
      >
        {metricText}
      </text>

      {/* Scalloped Treasury / Sovereign Rosette Seal */}
      <path
        d={rosetteSealPathD(sealCx, sealCy + 10, 18, spec.sealSpikes, 3.2, frame * 0.25)}
        fill={palette.accent}
        fillOpacity={0.18}
        stroke={palette.accent}
        strokeWidth={1.3 * sw}
      />
      {spec.sealPosition === "dual" && (
        <path
          d={rosetteSealPathD(noteX + 54, sealCy + 10, 15, spec.sealSpikes, 2.6, -frame * 0.25)}
          fill={palette.secondary}
          fillOpacity={0.16}
          stroke={palette.secondary}
          strokeWidth={1.2 * sw}
        />
      )}

      {/* Signature Lines */}
      {Array.from({ length: spec.signatureLines }).map((_, sIdx) => {
        const sx = noteX + 42 + sIdx * 66;
        return (
          <line
            key={`sig-${sIdx}`}
            x1={sx}
            y1={noteY + noteH - 22}
            x2={sx + 48}
            y2={noteY + noteH - 22}
            stroke={palette.muted}
            strokeWidth={1 * sw}
          />
        );
      })}

      {/* Perforated Detachable Coupon Stubs */}
      {spec.couponStubs > 0 && (
        <g>
          <line
            x1={noteX + noteW}
            y1={noteY + 4}
            x2={noteX + noteW}
            y2={noteY + noteH - 4}
            stroke={palette.accent}
            strokeWidth={1.5 * sw}
            strokeDasharray="3 4"
          />
          {Array.from({ length: Math.min(6, spec.couponStubs) }).map((_, cIdx) => {
            const count = Math.min(6, spec.couponStubs);
            const ch = noteH / count;
            const detachedShift = cIdx === 0 ? progress * 8 : 0;
            return (
              <g key={`cp-${cIdx}`} transform={`translate(${detachedShift.toFixed(1)}, 0)`}>
                <rect
                  x={noteX + noteW + 2}
                  y={noteY + cIdx * ch + 1}
                  width={44}
                  height={ch - 2}
                  rx={2}
                  fill={cIdx === 0 ? palette.highlightWash : palette.surfaceSubtle}
                  stroke={palette.ink}
                  strokeWidth={1.2 * sw}
                />
                <line
                  x1={noteX + noteW + 10}
                  y1={noteY + cIdx * ch + ch / 2}
                  x2={noteX + noteW + 38}
                  y2={noteY + cIdx * ch + ch / 2}
                  stroke={palette.muted}
                  strokeWidth={1 * sw}
                />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
}

// ============================================================================
// Builder 4: Legal Dossier, SEC 10-K / IRS Form & Regulatory Filing
// ============================================================================

function renderLegalDossierFiling(
  spec: LegalDossierParams,
  ctx: BlueprintStageContext,
  datumCode: string
): React.ReactNode {
  const { palette, progress, sw } = ctx;
  const baseX = 114;
  const baseY = 52;
  const docW = 172;
  const docH = 196;

  const rows = Math.max(3, Math.min(8, spec.tableRows));
  const rowH = 112 / rows;
  const hiRow = spec.highlightedRow % rows;

  return (
    <g>
      {/* Background Stacked Pages */}
      {Array.from({ length: spec.pageStackCount - 1 }).map((_, idx) => {
        const offset = (spec.pageStackCount - 1 - idx) * 6;
        return (
          <rect
            key={`pg-${idx}`}
            x={baseX + offset}
            y={baseY - offset * 0.7}
            width={docW}
            height={docH}
            rx={3}
            fill={palette.surfaceSubtle}
            stroke={palette.ink}
            strokeWidth={1.2 * sw}
          />
        );
      })}

      {/* Primary Filing Sheet */}
      <rect
        x={baseX}
        y={baseY}
        width={docW}
        height={docH}
        rx={3}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={2 * sw}
      />

      {/* Binder Punch Holes */}
      {spec.binderHoles === "top-two" && (
        <g>
          <circle cx={baseX + 56} cy={baseY + 10} r={3.2} stroke={palette.muted} strokeWidth={1.1 * sw} />
          <circle cx={baseX + 116} cy={baseY + 10} r={3.2} stroke={palette.muted} strokeWidth={1.1 * sw} />
        </g>
      )}
      {spec.binderHoles === "left-three" && (
        <g>
          {[42, 100, 158].map((hy) => (
            <circle key={hy} cx={baseX + 9} cy={baseY + hy} r={3} stroke={palette.muted} strokeWidth={1.1 * sw} />
          ))}
        </g>
      )}

      {/* Filing Masthead */}
      <rect
        x={baseX + 14}
        y={baseY + 18}
        width={docW - 28}
        height={24}
        fill={spec.headerStyle === "irs-boxed" ? palette.surfaceSubtle : "none"}
        stroke={palette.ink}
        strokeWidth={1.3 * sw}
      />
      <text
        x={baseX + 20}
        y={baseY + 34}
        fill={palette.ink}
        fontFamily={FONTS.mono}
        fontSize="9.5"
        fontWeight="700"
      >
        {datumCode.slice(0, 18)}
      </text>

      {/* Tabular Schedule Grid + Animated Marker Highlight Sweep */}
      {Array.from({ length: rows }).map((_, rIdx) => {
        const ry = baseY + 52 + rIdx * rowH;
        const isHi = rIdx === hiRow;
        return (
          <g key={`r-${rIdx}`}>
            {isHi && (
              <rect
                x={baseX + 14}
                y={ry + 1}
                width={(docW - 28) * progress}
                height={rowH - 2}
                fill={palette.highlightWash}
              />
            )}
            <line
              x1={baseX + 14}
              y1={ry + rowH}
              x2={baseX + docW - 14}
              y2={ry + rowH}
              stroke={isHi ? palette.accent : palette.border}
              strokeWidth={(isHi ? 1.4 : 0.9) * sw}
            />
            {Array.from({ length: spec.tableCols }).map((__, cIdx) => {
              const colW = (docW - 32) / spec.tableCols;
              const cx = baseX + 16 + cIdx * colW;
              const isRedacted =
                spec.redactionBars > 0 &&
                (rIdx + cIdx) % 3 === 0 &&
                rIdx < spec.redactionBars + 1 &&
                !isHi;
              return (
                <rect
                  key={`c-${cIdx}`}
                  x={cx + 2}
                  y={ry + rowH * 0.28}
                  width={colW * (cIdx === 0 ? 0.82 : 0.64)}
                  height={isRedacted ? rowH * 0.48 : 2.6}
                  rx={1}
                  fill={isRedacted ? palette.ink : isHi ? palette.accent : palette.muted}
                  fillOpacity={isRedacted ? 0.85 : isHi ? 0.9 : 0.55}
                />
              );
            })}
          </g>
        );
      })}

      {/* Official Seal / Stamp */}
      {spec.officialStamp === "circular-seal" && (
        <g transform={`translate(${baseX + docW - 38}, ${baseY + docH - 30}) scale(${0.85 + 0.15 * progress})`}>
          <circle
            cx={0}
            cy={0}
            r={18}
            fill={palette.accent}
            fillOpacity={0.14}
            stroke={palette.accent}
            strokeWidth={1.6 * sw}
          />
          <circle cx={0} cy={0} r={13} stroke={palette.accent} strokeWidth={0.9 * sw} strokeDasharray="2 2" />
        </g>
      )}
      {spec.officialStamp === "boxed-stamp" && (
        <g transform={`translate(${baseX + docW - 52}, ${baseY + docH - 30}) rotate(-8)`}>
          <rect
            x={-28}
            y={-11}
            width={56}
            height={22}
            rx={2}
            fill={palette.accent}
            fillOpacity={0.12}
            stroke={palette.accent}
            strokeWidth={1.8 * sw}
          />
          <line x1={-20} y1={0} x2={20} y2={0} stroke={palette.accent} strokeWidth={2 * sw} />
        </g>
      )}
      {spec.officialStamp === "notary-ribbon" && (
        <g transform={`translate(${baseX + 36}, ${baseY + docH - 26})`}>
          <polygon points="-6,10 -12,28 -2,22 4,28" fill={palette.accent} />
          <circle cx={0} cy={4} r={12} fill={palette.paper} stroke={palette.accent} strokeWidth={1.8 * sw} />
        </g>
      )}
    </g>
  );
}

// ============================================================================
// Builder 5: Semiconductor Die, CoWoS Interposer & Lithography Reticle
// ============================================================================

function renderSemiconductorDieReticle(
  spec: SemiconductorDieParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, frame, progress, sw, seed } = ctx;
  const cx = 200;
  const cy = 152;
  const pkgW = spec.packageShape === "rect-interposer" || spec.packageShape === "pcie-card" ? 212 : 168;
  const pkgH = spec.packageShape === "pcie-card" ? 132 : 168;
  const px = cx - pkgW / 2;
  const py = cy - pkgH / 2;

  const pins = Math.max(5, Math.min(18, spec.substratePinsPerSide));
  const cols = Math.max(2, Math.min(8, spec.coreGridCols));
  const rows = Math.max(2, Math.min(8, spec.coreGridRows));
  const dieW = pkgW * 0.52;
  const dieH = pkgH * 0.54;
  const dx = cx - dieW / 2;
  const dy = cy - dieH / 2;
  const activeIdx = Math.floor(frame * 0.35) % (cols * rows);

  return (
    <g>
      {/* Perimeter BGA / Interposer Pins */}
      {Array.from({ length: pins }).map((_, idx) => {
        const tx = px + 14 + ((pkgW - 28) * idx) / (pins - 1);
        const ty = py + 14 + ((pkgH - 28) * idx) / (pins - 1);
        return (
          <g key={`pin-${idx}`}>
            <line x1={tx} y1={py - 10} x2={tx} y2={py} stroke={palette.ink} strokeWidth={1.3 * sw} />
            <line x1={tx} y1={py + pkgH} x2={tx} y2={py + pkgH + 10} stroke={palette.ink} strokeWidth={1.3 * sw} />
            {spec.packageShape !== "pcie-card" && (
              <>
                <line x1={px - 10} y1={ty} x2={px} y2={ty} stroke={palette.ink} strokeWidth={1.3 * sw} />
                <line x1={px + pkgW} y1={ty} x2={px + pkgW + 10} y2={ty} stroke={palette.ink} strokeWidth={1.3 * sw} />
              </>
            )}
          </g>
        );
      })}

      {/* Substrate Package */}
      {spec.packageShape === "wafer-sector" ? (
        <circle
          cx={cx}
          cy={cy}
          r={92}
          fill={palette.paper}
          stroke={palette.ink}
          strokeWidth={2.1 * sw}
        />
      ) : (
        <rect
          x={px}
          y={py}
          width={pkgW}
          height={pkgH}
          rx={6}
          fill={palette.paper}
          stroke={palette.ink}
          strokeWidth={2.1 * sw}
        />
      )}

      {/* Flanking HBM Memory Stacks */}
      {spec.hbmStacks > 0 &&
        Array.from({ length: Math.min(8, spec.hbmStacks) }).map((_, hIdx) => {
          const leftSide = hIdx % 2 === 0;
          const slot = Math.floor(hIdx / 2);
          const countPerSide = Math.ceil(Math.min(8, spec.hbmStacks) / 2);
          const hh = (dieH - (countPerSide - 1) * 6) / countPerSide;
          const hx = leftSide ? dx - 26 : dx + dieW + 6;
          const hy = dy + slot * (hh + 6);
          return (
            <rect
              key={`hbm-${hIdx}`}
              x={hx}
              y={hy}
              width={20}
              height={Math.max(10, hh)}
              rx={2}
              fill={palette.secondary}
              fillOpacity={0.22}
              stroke={palette.secondary}
              strokeWidth={1.4 * sw}
            />
          );
        })}

      {/* Central Compute Die */}
      <rect
        x={dx}
        y={dy}
        width={dieW}
        height={dieH}
        rx={3}
        fill={palette.surfaceSubtle}
        stroke={palette.ink}
        strokeWidth={1.8 * sw}
      />

      {/* Compute Tensor Core Array */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const idx = r * cols + c;
          const cw = (dieW - 12) / cols;
          const ch = (dieH - 12) / rows;
          const isLit = idx === activeIdx || detRand(seed, idx) > 1 - progress * 0.45;
          return (
            <rect
              key={`core-${r}-${c}`}
              x={dx + 6 + c * cw + 1.2}
              y={dy + 6 + r * ch + 1.2}
              width={Math.max(3, cw - 2.4)}
              height={Math.max(3, ch - 2.4)}
              rx={1}
              fill={isLit ? palette.accent : palette.paper}
              fillOpacity={isLit ? 0.55 : 0.8}
              stroke={palette.ink}
              strokeWidth={0.85 * sw}
            />
          );
        })
      )}
    </g>
  );
}

// ============================================================================
// Builder 6: Server Compute Chassis, Cooling Rack & Mainframe Array
// ============================================================================

function renderServerComputeChassis(
  spec: ServerChassisParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, frame, sw, seed } = ctx;
  const rx = 86;
  const ry = 54;
  const rw = 228;
  const rh = 192;
  const units = Math.max(2, Math.min(7, spec.rackUnitsU));
  const unitH = (rh - 20) / units;

  return (
    <g>
      {/* Rack Cabinet Outer Posts */}
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        rx={5}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={2.2 * sw}
      />
      {spec.powerBusBars && (
        <g>
          <line x1={rx - 10} y1={ry + 12} x2={rx - 10} y2={ry + rh - 12} stroke={palette.accent} strokeWidth={3 * sw} />
          <line x1={rx + rw + 10} y1={ry + 12} x2={rx + rw + 10} y2={ry + rh - 12} stroke={palette.secondary} strokeWidth={3 * sw} />
        </g>
      )}

      {/* U-Bay Blades */}
      {Array.from({ length: units }).map((_, u) => {
        const uy = ry + 10 + u * unitH;
        const bays = Math.max(3, Math.min(10, spec.driveBaysPerRow));
        const bayW = (rw - 36) / bays;
        return (
          <g key={`u-${u}`}>
            <rect
              x={rx + 10}
              y={uy + 2}
              width={rw - 20}
              height={unitH - 4}
              rx={2}
              fill={palette.surfaceSubtle}
              stroke={palette.ink}
              strokeWidth={1.3 * sw}
            />
            {spec.frontPanelStyle === "led-matrix" &&
              Array.from({ length: bays }).map((__, b) => {
                const blink = (Math.floor(frame * 0.25) + Math.floor(detRand(seed, u * 13 + b) * 10)) % 4 === 0;
                return (
                  <g key={`b-${b}`}>
                    <rect
                      x={rx + 18 + b * bayW}
                      y={uy + 6}
                      width={Math.max(4, bayW - 4)}
                      height={unitH - 12}
                      rx={1}
                      fill={palette.paper}
                      stroke={palette.muted}
                      strokeWidth={0.85 * sw}
                    />
                    <circle
                      cx={rx + 22 + b * bayW}
                      cy={uy + unitH / 2}
                      r={2}
                      fill={blink ? palette.accent : palette.secondary}
                    />
                  </g>
                );
              })}

            {spec.frontPanelStyle === "liquid-manifold" && (
              <path
                d={`M ${rx + 18} ${uy + unitH / 2} L ${rx + rw - 18} ${uy + unitH / 2}`}
                stroke={u % 2 === 0 ? palette.secondary : palette.accent}
                strokeWidth={2.4 * sw}
                strokeDasharray="8 4"
                strokeDashoffset={-(frame * 1.4)}
              />
            )}

            {spec.frontPanelStyle === "patch-cables" &&
              Array.from({ length: 4 }).map((__, pIdx) => {
                const sx = rx + 26 + pIdx * 46;
                return (
                  <path
                    key={`pc-${pIdx}`}
                    d={`M ${sx} ${uy + 7} Q ${sx + 18} ${uy + unitH + 2} ${sx + 34} ${uy + 7}`}
                    stroke={pIdx % 2 === 0 ? palette.accent : palette.secondary}
                    strokeWidth={1.4 * sw}
                    fill="none"
                  />
                );
              })}

            {spec.frontPanelStyle === "tape-reels" && u < 2 && (
              <g>
                {[rx + 66, rx + rw - 66].map((tcx, idx) => (
                  <g key={tcx} transform={`translate(${tcx}, ${uy + unitH / 2}) rotate(${frame * (idx === 0 ? 3 : -3)})`}>
                    <circle cx={0} cy={0} r={Math.min(14, unitH * 0.38)} stroke={palette.ink} strokeWidth={1.4 * sw} fill={palette.paper} />
                    <line x1={-8} y1={0} x2={8} y2={0} stroke={palette.ink} strokeWidth={1.1 * sw} />
                    <line x1={0} y1={-8} x2={0} y2={8} stroke={palette.ink} strokeWidth={1.1 * sw} />
                  </g>
                ))}
              </g>
            )}
          </g>
        );
      })}

      {/* Bottom Fan Rotors */}
      {spec.fanRotors > 0 &&
        Array.from({ length: spec.fanRotors }).map((_, fIdx) => {
          const span = rw - 56;
          const fx = rx + 28 + (spec.fanRotors === 1 ? span / 2 : (span * fIdx) / (spec.fanRotors - 1));
          const fy = ry + rh - 20;
          return (
            <g key={`fn-${fIdx}`} transform={`translate(${fx}, ${fy}) rotate(${frame * 6})`}>
              <circle cx={0} cy={0} r={11} fill={palette.paper} stroke={palette.ink} strokeWidth={1.3 * sw} />
              <line x1={-8} y1={0} x2={8} y2={0} stroke={palette.accent} strokeWidth={1.5 * sw} />
              <line x1={0} y1={-8} x2={0} y2={8} stroke={palette.accent} strokeWidth={1.5 * sw} />
            </g>
          );
        })}
    </g>
  );
}

// ============================================================================
// Builder 7: Grid Power Apparatus (Transformers, Pylons, Turbines, BESS)
// ============================================================================

function renderGridPowerApparatus(
  spec: GridApparatusParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, frame, progress, sw } = ctx;

  if (spec.apparatusForm === "lattice-pylon") {
    const tiers = Math.max(2, Math.min(5, spec.trussTiers));
    return (
      <g>
        {/* Transmission Steel Lattice Tower */}
        <polygon
          points="200,52 152,244 248,244"
          fill={palette.surfaceSubtle}
          fillOpacity={0.35}
          stroke={palette.ink}
          strokeWidth={2 * sw}
        />
        {Array.from({ length: tiers }).map((_, t) => {
          const ty = 82 + t * 34;
          const armW = 74 - t * 8;
          return (
            <g key={`tr-${t}`}>
              <line x1={200 - armW} y1={ty} x2={200 + armW} y2={ty} stroke={palette.ink} strokeWidth={1.8 * sw} />
              <line x1={200 - armW} y1={ty} x2={200 - armW} y2={ty + 12} stroke={palette.secondary} strokeWidth={2 * sw} />
              <line x1={200 + armW} y1={ty} x2={200 + armW} y2={ty + 12} stroke={palette.secondary} strokeWidth={2 * sw} />
              <path
                d={`M ${64} ${ty + 18} Q ${130} ${ty + 34} ${200 - armW} ${ty + 12}`}
                stroke={palette.accent}
                strokeWidth={1.3 * sw}
                fill="none"
              />
              <path
                d={`M ${200 + armW} ${ty + 12} Q ${270} ${ty + 34} ${336} ${ty + 18}`}
                stroke={palette.accent}
                strokeWidth={1.3 * sw}
                fill="none"
              />
            </g>
          );
        })}
      </g>
    );
  }

  if (spec.apparatusForm === "turbine-nacelle") {
    const blades = Math.max(3, spec.insulatorStacks);
    return (
      <g>
        <polygon points="194,132 206,132 214,248 186,248" fill={palette.paper} stroke={palette.ink} strokeWidth={2 * sw} />
        <g transform={`translate(200, 128) rotate(${frame * 3.2})`}>
          {Array.from({ length: blades }).map((_, b) => {
            const ang = (360 / blades) * b;
            return (
              <g key={`bl-${b}`} transform={`rotate(${ang})`}>
                <path d="M 0 0 L -6 -68 L 2 -74 L 6 -12 Z" fill={palette.surfaceSubtle} stroke={palette.ink} strokeWidth={1.5 * sw} />
              </g>
            );
          })}
          <circle cx={0} cy={0} r={10} fill={palette.accent} stroke={palette.ink} strokeWidth={1.8 * sw} />
        </g>
      </g>
    );
  }

  // Default: High-Voltage Substation Transformer / Breaker / BESS Tank
  const stacks = Math.max(2, Math.min(6, spec.insulatorStacks));
  const sheds = Math.max(3, Math.min(9, spec.insulatorSheds));
  const fins = Math.max(4, Math.min(12, spec.radiatorFins));

  return (
    <g>
      {/* Ceramic Bushing Insulator Stacks */}
      {Array.from({ length: stacks }).map((_, s) => {
        const sx = 128 + (144 * s) / Math.max(1, stacks - 1);
        return (
          <g key={`ins-${s}`}>
            <line x1={sx} y1={58} x2={sx} y2={122} stroke={palette.ink} strokeWidth={2.2 * sw} />
            {Array.from({ length: sheds }).map((__, sh) => {
              const sy = 68 + (46 * sh) / sheds;
              return (
                <ellipse
                  key={`sh-${sh}`}
                  cx={sx}
                  cy={sy}
                  rx={10}
                  ry={2.8}
                  fill={palette.paper}
                  stroke={palette.ink}
                  strokeWidth={1.1 * sw}
                />
              );
            })}
            {spec.coronaArcs && (
              <circle
                cx={sx}
                cy={56}
                r={4 + Math.sin(frame * 0.3 + s) * 2}
                stroke={palette.accent}
                strokeWidth={1.1 * sw}
              />
            )}
          </g>
        );
      })}

      {/* Main Steel Tank */}
      <rect
        x={96}
        y={122}
        width={208}
        height={116}
        rx={6}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={2.2 * sw}
      />
      {/* Cooling Radiator Fins */}
      {Array.from({ length: fins }).map((_, f) => {
        const fx = 112 + (176 * f) / Math.max(1, fins - 1);
        return (
          <line
            key={`fin-${f}`}
            x1={fx}
            y1={134}
            x2={fx}
            y2={226}
            stroke={f / fins <= progress ? palette.accent : palette.muted}
            strokeWidth={2 * sw}
          />
        );
      })}
      {/* Grounding Plinth */}
      <line x1={74} y1={242} x2={326} y2={242} stroke={palette.ink} strokeWidth={2.4 * sw} />
    </g>
  );
}

// ============================================================================
// Builder 8: Industrial Plant, Smelter, Excavator & Robotic Rig
// ============================================================================

function renderIndustrialPlantRig(
  spec: IndustrialPlantParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, frame, progress, sw } = ctx;

  if (spec.rigForm === "articulated-arm") {
    const j1 = -24 + Math.sin(frame * 0.08) * 16 * progress;
    const j2 = 48 + Math.cos(frame * 0.08) * 22 * progress;
    return (
      <g>
        <rect x={110} y={226} width={180} height={16} rx={2} fill={palette.surfaceSubtle} stroke={palette.ink} strokeWidth={2 * sw} />
        <rect x={156} y={198} width={52} height={28} rx={3} fill={palette.paper} stroke={palette.ink} strokeWidth={2 * sw} />
        <g transform={`translate(182, 198) rotate(${j1.toFixed(1)})`}>
          <rect x={-9} y={-82} width={18} height={82} rx={4} fill={palette.paper} stroke={palette.ink} strokeWidth={2 * sw} />
          <circle cx={0} cy={0} r={9} fill={palette.accent} stroke={palette.ink} strokeWidth={1.6 * sw} />
          <g transform={`translate(0, -78) rotate(${j2.toFixed(1)})`}>
            <rect x={-7} y={-68} width={14} height={68} rx={3} fill={palette.surfaceSubtle} stroke={palette.ink} strokeWidth={1.8 * sw} />
            <circle cx={0} cy={0} r={7} fill={palette.secondary} stroke={palette.ink} strokeWidth={1.5 * sw} />
            {/* End-effector claw */}
            <path d="M -10 -68 L -14 -84 M 10 -68 L 14 -84" stroke={palette.accent} strokeWidth={2.2 * sw} strokeLinecap="round" />
          </g>
        </g>
      </g>
    );
  }

  const rollers = Math.max(4, Math.min(9, spec.conveyorRollers));
  return (
    <g>
      {/* Exhaust Chimneys */}
      {Array.from({ length: spec.chimneyCount }).map((_, c) => {
        const cx = 114 + c * 32;
        return (
          <g key={`ch-${c}`}>
            <polygon
              points={`${cx - 9},134 ${cx - 6},62 ${cx + 6},62 ${cx + 9},134`}
              fill={palette.surfaceSubtle}
              stroke={palette.ink}
              strokeWidth={1.7 * sw}
            />
            <path
              d={`M ${cx} 56 Q ${cx + 8} ${46 - (frame % 12) * 0.4} ${cx + 18} 42`}
              stroke={palette.muted}
              strokeWidth={1.3 * sw}
              fill="none"
            />
          </g>
        );
      })}

      {/* Feed Hopper Cone */}
      {spec.hopperCone && (
        <polygon
          points="244,72 308,72 288,128 264,128"
          fill={palette.surfaceSubtle}
          stroke={palette.ink}
          strokeWidth={1.8 * sw}
        />
      )}

      {/* Main Plant Housing + Meshed Drive Gear */}
      <rect x={92} y={128} width={216} height={74} rx={5} fill={palette.paper} stroke={palette.ink} strokeWidth={2.1 * sw} />
      <path
        d={gearPathD(146, 165, 25, 19, spec.gearTeeth, frame * 2.2)}
        fill={palette.accent}
        fillOpacity={0.2}
        stroke={palette.ink}
        strokeWidth={1.4 * sw}
      />
      <circle cx={146} cy={165} r={7} fill={palette.paper} stroke={palette.ink} strokeWidth={1.4 * sw} />

      {/* Reciprocating Pistons */}
      {Array.from({ length: spec.pistonCount }).map((_, p) => {
        const px = 204 + p * 24;
        const py = 144 + Math.sin(frame * 0.22 + p * 1.4) * 9;
        return (
          <g key={`ps-${p}`}>
            <rect x={px - 7} y={138} width={14} height={48} rx={2} stroke={palette.muted} strokeWidth={1.1 * sw} />
            <rect x={px - 5} y={py} width={10} height={18} fill={palette.secondary} stroke={palette.ink} strokeWidth={1.2 * sw} />
          </g>
        );
      })}

      {/* Conveyor Belt & Rollers */}
      <rect x={78} y={212} width={244} height={24} rx={12} fill={palette.surfaceSubtle} stroke={palette.ink} strokeWidth={1.9 * sw} />
      {Array.from({ length: rollers }).map((_, r) => {
        const rx = 96 + (208 * r) / Math.max(1, rollers - 1);
        return (
          <circle
            key={`rl-${r}`}
            cx={rx}
            cy={224}
            r={6}
            fill={palette.paper}
            stroke={palette.ink}
            strokeWidth={1.3 * sw}
          />
        );
      })}
    </g>
  );
}

// ============================================================================
// Builder 9: Maritime Vessel, Naval Warship, UAV Drone & Interceptor Stage
// ============================================================================

function renderMaritimeDefenseVessel(
  spec: MaritimeDefenseParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, frame, progress, sw } = ctx;

  if (spec.craftClass === "delta-uav") {
    const bankDeg = Math.sin(frame * 0.1) * 4;
    return (
      <g transform={`translate(200, 152) rotate(${bankDeg.toFixed(1)})`}>
        {/* Shahed / Low-Cost One-Way Delta Wing Blueprint */}
        <polygon
          points="0,-78 -86,56 -24,42 0,68 24,42 86,56"
          fill={palette.paper}
          stroke={palette.ink}
          strokeWidth={2.1 * sw}
        />
        <line x1={0} y1={-78} x2={0} y2={68} stroke={palette.ink} strokeWidth={1.3 * sw} />
        <line x1={-86} y1={56} x2={-18} y2={-14} stroke={palette.muted} strokeWidth={1 * sw} />
        <line x1={86} y1={56} x2={18} y2={-14} stroke={palette.muted} strokeWidth={1 * sw} />
        {/* Pusher prop */}
        <line
          x1={-16 * Math.cos(frame * 0.7)}
          y1={72}
          x2={16 * Math.cos(frame * 0.7)}
          y2={72}
          stroke={palette.accent}
          strokeWidth={2.4 * sw}
        />
        <circle cx={0} cy={-26} r={7} fill={palette.accent} fillOpacity={0.25} stroke={palette.accent} strokeWidth={1.4 * sw} />
      </g>
    );
  }

  if (spec.craftClass === "missile-stage") {
    const lift = progress * 14;
    return (
      <g transform={`translate(200, ${158 - lift})`}>
        <path
          d="M 0 -86 Q 16 -54 16 -24 L 16 54 L -16 54 L -16 -24 Q -16 -54 0 -86 Z"
          fill={palette.paper}
          stroke={palette.ink}
          strokeWidth={2.1 * sw}
        />
        <polygon points="-16,28 -32,54 -16,50" fill={palette.surfaceSubtle} stroke={palette.ink} strokeWidth={1.5 * sw} />
        <polygon points="16,28 32,54 16,50" fill={palette.surfaceSubtle} stroke={palette.ink} strokeWidth={1.5 * sw} />
        {Array.from({ length: Math.min(5, spec.cargoBaysOrCells) }).map((_, idx) => (
          <line
            key={`st-${idx}`}
            x1={-16}
            y1={-22 + idx * 16}
            x2={16}
            y2={-22 + idx * 16}
            stroke={palette.accent}
            strokeWidth={1.2 * sw}
          />
        ))}
        <path
          d={`M -9 56 L 0 ${78 + Math.sin(frame * 0.6) * 5} L 9 56`}
          stroke={palette.accent}
          strokeWidth={1.8 * sw}
          fill={palette.accent}
          fillOpacity={0.22}
        />
      </g>
    );
  }

  // Surface Hull or Submarine Profile
  const hullW = clampRange(spec.hullLengthRatio, 0.6, 0.95) * 280;
  const hx = 200 - hullW / 2;
  const hy = 176;
  const cells = Math.max(2, Math.min(10, spec.cargoBaysOrCells));
  const superX =
    spec.superstructurePos === "aft"
      ? hx + 22
      : spec.superstructurePos === "forward"
        ? hx + hullW - 76
        : 174;

  return (
    <g>
      {/* Superstructure / Bridge / Radar Masts */}
      <rect
        x={superX}
        y={hy - 46}
        width={48}
        height={46}
        rx={2}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={1.9 * sw}
      />
      {Array.from({ length: spec.radarMasts }).map((_, m) => {
        const mx = superX + 14 + m * 16;
        return (
          <g key={`ms-${m}`}>
            <line x1={mx} y1={hy - 46} x2={mx} y2={hy - 72} stroke={palette.ink} strokeWidth={1.5 * sw} />
            <line
              x1={mx - 9 * Math.cos(frame * 0.16 + m)}
              y1={hy - 72}
              x2={mx + 9 * Math.cos(frame * 0.16 + m)}
              y2={hy - 72}
              stroke={palette.accent}
              strokeWidth={1.8 * sw}
            />
          </g>
        );
      })}

      {/* Cargo Container Stacks / Tank Domes / VLS Cells */}
      {Array.from({ length: cells }).map((_, c) => {
        const cw = (hullW - 88) / cells;
        const cx = (spec.superstructurePos === "aft" ? hx + 76 : hx + 16) + c * cw;
        return (
          <rect
            key={`cg-${c}`}
            x={cx + 2}
            y={spec.craftClass === "warship-vls" ? hy - 14 : hy - 28}
            width={Math.max(6, cw - 4)}
            height={spec.craftClass === "warship-vls" ? 14 : 28}
            rx={spec.craftClass === "tanker-hull" ? 6 : 1}
            fill={c / cells < progress ? palette.accent : palette.surfaceSubtle}
            fillOpacity={c / cells < progress ? 0.25 : 0.7}
            stroke={palette.ink}
            strokeWidth={1.2 * sw}
          />
        );
      })}

      {/* Main Naval / Merchant Hull */}
      <polygon
        points={`${hx},${hy} ${hx + hullW},${hy} ${hx + hullW - 22},${hy + 34} ${hx + 14},${hy + 34}`}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={2.2 * sw}
      />
      <line x1={hx + 8} y1={hy + 18} x2={hx + hullW - 14} y2={hy + 18} stroke={palette.accent} strokeWidth={1.4 * sw} />

      {/* Animated Sea Level Wake Lines */}
      {Array.from({ length: Math.max(2, spec.wakeWaves) }).map((_, w) => {
        const wy = hy + 34 + w * 8;
        return (
          <path
            key={`wk-${w}`}
            d={`M 54 ${wy} Q 128 ${wy - 4 * Math.sin(frame * 0.12 + w)} 200 ${wy} T 346 ${wy}`}
            stroke={palette.secondary}
            strokeWidth={1.2 * sw}
            strokeDasharray={w === 0 ? undefined : "6 4"}
            fill="none"
          />
        );
      })}
    </g>
  );
}

// ============================================================================
// Builder 10: Subsea Fiber Cable Cross-Section, Repeater & Landing Vault
// ============================================================================

function renderSubseaNetworkNode(
  spec: SubseaNetworkParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, frame, progress, sw } = ctx;
  const cx = 200;
  const cy = 152;

  if (spec.nodeForm === "inline-repeater" || spec.nodeForm === "branching-y") {
    return (
      <g>
        {/* Armored Seafloor Trunk Line */}
        <line x1={48} y1={cy} x2={352} y2={cy} stroke={palette.ink} strokeWidth={8 * sw} />
        <line
          x1={48}
          y1={cy}
          x2={352}
          y2={cy}
          stroke={palette.accent}
          strokeWidth={2.2 * sw}
          strokeDasharray="10 8"
          strokeDashoffset={-(frame * 2.4)}
        />
        {spec.nodeForm === "branching-y" && (
          <path
            d={`M 210 ${cy} Q 250 ${cy + 8} 316 ${cy + 68}`}
            stroke={palette.ink}
            strokeWidth={6 * sw}
            fill="none"
          />
        )}
        {/* Pressurized Beryllium-Copper Optical Amplifier Housing */}
        <rect
          x={cx - 64}
          y={cy - 26}
          width={128}
          height={52}
          rx={24}
          fill={palette.paper}
          stroke={palette.ink}
          strokeWidth={2.2 * sw}
        />
        {Array.from({ length: Math.min(8, spec.fiberPairCount) }).map((_, f) => {
          const fy = cy - 14 + (28 * f) / Math.max(1, Math.min(8, spec.fiberPairCount) - 1);
          return (
            <line key={`fp-${f}`} x1={cx - 42} y1={fy} x2={cx + 42} y2={fy} stroke={palette.secondary} strokeWidth={1.1 * sw} />
          );
        })}
      </g>
    );
  }

  // Radial Cross-Section of Undersea Armored Garden-Hose Cable
  const wires = Math.max(8, Math.min(24, spec.armorWireCount));
  const fibers = Math.max(4, Math.min(16, spec.fiberPairCount));
  const activeFiber = Math.floor(frame * 0.3) % fibers;

  return (
    <g>
      {Array.from({ length: spec.sheathLayers }).map((_, l) => (
        <circle
          key={`sh-${l}`}
          cx={cx}
          cy={cy}
          r={88 - l * 14}
          fill={l === 0 ? palette.paper : "none"}
          stroke={l === 1 ? palette.secondary : palette.ink}
          strokeWidth={(l === 0 ? 2.2 : 1.3) * sw}
        />
      ))}
      {/* Galvanized Steel Armor Wire Ring */}
      {Array.from({ length: wires }).map((_, w) => {
        const pt = polarToCartesian(cx, cy, 68, (360 / wires) * w);
        return (
          <circle
            key={`aw-${w}`}
            cx={pt.x}
            cy={pt.y}
            r={6.2}
            fill={palette.surfaceSubtle}
            stroke={palette.ink}
            strokeWidth={1.2 * sw}
          />
        );
      })}
      {/* Central Copper Power Tube + Optical Glass Fiber Pairs */}
      <circle cx={cx} cy={cy} r={30} fill={palette.surfaceSubtle} stroke={palette.accent} strokeWidth={1.8 * sw} />
      {Array.from({ length: fibers }).map((_, f) => {
        const pt = polarToCartesian(cx, cy, 17, (360 / fibers) * f + progress * 45);
        const lit = f === activeFiber;
        return (
          <circle
            key={`fb-${f}`}
            cx={pt.x}
            cy={pt.y}
            r={lit ? 4.2 : 3}
            fill={lit ? palette.accent : palette.paper}
            stroke={lit ? palette.accent : palette.ink}
            strokeWidth={1.2 * sw}
          />
        );
      })}
    </g>
  );
}

// ============================================================================
// Builder 11: Architectural Elevation (Residential, Cleanroom, Civic, Port)
// ============================================================================

function renderArchitecturalElevation(
  spec: ArchitecturalElevationParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, frame, progress, sw } = ctx;
  const bldgW = spec.wingExtension ? 228 : 192;
  const bldgH = clampRange(spec.stories * 26 + 34, 78, 152);
  const bx = 200 - bldgW / 2;
  const by = 232 - bldgH;

  const stories = Math.max(1, Math.min(5, spec.stories));
  const cols = Math.max(2, Math.min(7, spec.windowCols));

  return (
    <g>
      {/* Roof Silhouette */}
      {spec.roofProfile === "pitched-gable" && (
        <polygon
          points={`${bx - 10},${by} 200,${by - 42} ${bx + bldgW + 10},${by}`}
          fill={palette.surfaceSubtle}
          stroke={palette.ink}
          strokeWidth={2.1 * sw}
        />
      )}
      {spec.roofProfile === "classical-pediment" && (
        <g>
          <polygon
            points={`${bx - 8},${by} 200,${by - 36} ${bx + bldgW + 8},${by}`}
            fill={palette.paper}
            stroke={palette.ink}
            strokeWidth={2.1 * sw}
          />
          <circle cx={200} cy={by - 15} r={7} stroke={palette.ink} strokeWidth={1.2 * sw} />
        </g>
      )}
      {spec.roofProfile === "sawtooth-factory" && (
        <path
          d={`M ${bx} ${by} L ${bx} ${by - 26} L ${bx + bldgW / 3} ${by} L ${bx + bldgW / 3} ${by - 26} L ${bx + (2 * bldgW) / 3} ${by} L ${bx + (2 * bldgW) / 3} ${by - 26} L ${bx + bldgW} ${by} Z`}
          fill={palette.surfaceSubtle}
          stroke={palette.ink}
          strokeWidth={1.9 * sw}
        />
      )}
      {spec.roofProfile === "vaulted-hangar" && (
        <path
          d={`M ${bx} ${by} Q 200 ${by - 56} ${bx + bldgW} ${by} Z`}
          fill={palette.surfaceSubtle}
          stroke={palette.ink}
          strokeWidth={2 * sw}
        />
      )}

      {/* Rooftop / Side HVAC Condenser Units */}
      {spec.hvacUnits > 0 &&
        Array.from({ length: Math.min(4, spec.hvacUnits) }).map((_, h) => {
          const hx = bx + 22 + h * 44;
          return (
            <g key={`hv-${h}`}>
              <rect x={hx} y={by - 18} width={28} height={18} fill={palette.paper} stroke={palette.ink} strokeWidth={1.4 * sw} />
              <circle cx={hx + 14} cy={by - 9} r={6} stroke={palette.secondary} strokeWidth={1.1 * sw} />
              <line
                x1={hx + 14 - 4 * Math.cos(frame * 0.35)}
                y1={by - 9 - 4 * Math.sin(frame * 0.35)}
                x2={hx + 14 + 4 * Math.cos(frame * 0.35)}
                y2={by - 9 + 4 * Math.sin(frame * 0.35)}
                stroke={palette.accent}
                strokeWidth={1.3 * sw}
              />
            </g>
          );
        })}

      {/* Main Facade */}
      <rect
        x={bx}
        y={by}
        width={bldgW}
        height={bldgH}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={2.1 * sw}
      />

      {/* Neoclassical Pillars OR Fenestration Grid */}
      {spec.columnsCount >= 2 ? (
        Array.from({ length: Math.min(6, spec.columnsCount) }).map((_, c) => {
          const cx = bx + 22 + ((bldgW - 44) * c) / (Math.min(6, spec.columnsCount) - 1);
          return (
            <rect
              key={`cl-${c}`}
              x={cx - 6}
              y={by + 8}
              width={12}
              height={bldgH - 8}
              fill={palette.surfaceSubtle}
              stroke={palette.ink}
              strokeWidth={1.4 * sw}
            />
          );
        })
      ) : (
        Array.from({ length: stories }).map((_, s) =>
          Array.from({ length: cols }).map((__, c) => {
            const ww = (bldgW - 36) / cols;
            const wh = (bldgH - 34) / stories;
            const wx = bx + 18 + c * ww + 4;
            const wy = by + 12 + s * wh + 3;
            const lit = (s * cols + c) / (stories * cols) < progress;
            return (
              <rect
                key={`w-${s}-${c}`}
                x={wx}
                y={wy}
                width={Math.max(8, ww - 8)}
                height={Math.max(8, wh - 7)}
                fill={lit ? palette.highlightWash : palette.surfaceSubtle}
                stroke={palette.ink}
                strokeWidth={1.1 * sw}
              />
            );
          })
        )
      )}

      {/* Stepped Plinth Foundation */}
      {Array.from({ length: spec.foundationSteps }).map((_, st) => (
        <rect
          key={`fd-${st}`}
          x={bx - 8 - st * 6}
          y={232 + st * 5}
          width={bldgW + 16 + st * 12}
          height={5}
          fill={palette.surfaceSubtle}
          stroke={palette.ink}
          strokeWidth={1.3 * sw}
        />
      ))}
    </g>
  );
}

// ============================================================================
// Builder 12: Consumer / Industrial Exploded Bill-of-Materials (BOM) Stack
// ============================================================================

function renderConsumerExplodedBom(
  spec: ConsumerExplodedBomParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, progress, sw } = ctx;
  const layers = spec.explodedLayers;
  const spread = clampRange(spec.layerSpreadPx, 14, 30) * (0.35 + 0.65 * progress);
  const centerIdx = (layers - 1) / 2;

  return (
    <g>
      {/* Vertical Assembly Axis Guide Lines */}
      {[-54, 0, 54].slice(0, spec.fastenerAxisLines).map((dx) => (
        <line
          key={`ax-${dx}`}
          x1={190 + dx}
          y1={62}
          x2={190 + dx}
          y2={242}
          stroke={palette.muted}
          strokeWidth={1 * sw}
          strokeDasharray="3 4"
        />
      ))}

      {/* Isometric Exploded Plates */}
      {Array.from({ length: layers }).map((_, idx) => {
        const cy = 152 + (idx - centerIdx) * spread;
        const isTop = idx === 0;
        return (
          <g key={`ly-${idx}`}>
            <polygon
              points={`190,${cy - 22} 274,${cy} 190,${cy + 22} 106,${cy}`}
              fill={isTop ? palette.highlightWash : palette.paper}
              stroke={idx === layers - 1 ? palette.accent : palette.ink}
              strokeWidth={(isTop ? 2 : 1.6) * sw}
            />
            {/* Callout leader tick */}
            <line
              x1={274}
              y1={cy}
              x2={316}
              y2={cy}
              stroke={palette.muted}
              strokeWidth={1 * sw}
            />
            <circle cx={318} cy={cy} r={2.5} fill={idx === 0 ? palette.accent : palette.secondary} />
          </g>
        );
      })}
    </g>
  );
}

// ============================================================================
// Builder 13: Analytical Balance Scale & Fiscal Seesaw Contraption
// ============================================================================

function renderBalanceLedgerContraption(
  spec: BalanceLedgerParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, progress, sw } = ctx;
  const tilt = spec.beamTiltDeg * progress;
  const rad = (tilt * Math.PI) / 180;
  const armR = 98;
  const lx = 200 - Math.cos(rad) * armR;
  const ly = 104 - Math.sin(rad) * armR;
  const rx = 200 + Math.cos(rad) * armR;
  const ry = 104 + Math.sin(rad) * armR;

  return (
    <g>
      {/* Central Pedestal & Graduated Vernier Arc */}
      <polygon points="188,242 212,242 204,96 196,96" fill={palette.surfaceSubtle} stroke={palette.ink} strokeWidth={2 * sw} />
      <rect x={156} y={242} width={88} height={10} rx={2} fill={palette.paper} stroke={palette.ink} strokeWidth={1.8 * sw} />
      <path d={describeArc(200, 104, 38, -32, 32)} stroke={palette.muted} strokeWidth={1.2 * sw} />

      {/* Tilted Beam */}
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={palette.ink} strokeWidth={3 * sw} strokeLinecap="round" />
      <circle cx={200} cy={104} r={7} fill={palette.accent} stroke={palette.ink} strokeWidth={1.6 * sw} />

      {/* Left Pan (Always Plumb) */}
      <g transform={`translate(${lx.toFixed(1)}, ${ly.toFixed(1)})`}>
        <line x1={0} y1={0} x2={-22} y2={58} stroke={palette.ink} strokeWidth={1.2 * sw} />
        <line x1={0} y1={0} x2={22} y2={58} stroke={palette.ink} strokeWidth={1.2 * sw} />
        <path d="M -28 58 L 28 58 L 22 66 L -22 66 Z" fill={palette.paper} stroke={palette.ink} strokeWidth={1.7 * sw} />
        {Array.from({ length: spec.leftWeights }).map((_, w) => (
          <rect
            key={`lw-${w}`}
            x={-16}
            y={46 - w * 11}
            width={32}
            height={10}
            rx={1.5}
            fill={palette.secondary}
            fillOpacity={0.35}
            stroke={palette.ink}
            strokeWidth={1.2 * sw}
          />
        ))}
      </g>

      {/* Right Pan (Always Plumb) */}
      <g transform={`translate(${rx.toFixed(1)}, ${ry.toFixed(1)})`}>
        <line x1={0} y1={0} x2={-22} y2={58} stroke={palette.ink} strokeWidth={1.2 * sw} />
        <line x1={0} y1={0} x2={22} y2={58} stroke={palette.ink} strokeWidth={1.2 * sw} />
        <path d="M -28 58 L 28 58 L 22 66 L -22 66 Z" fill={palette.paper} stroke={palette.ink} strokeWidth={1.7 * sw} />
        {Array.from({ length: spec.rightWeights }).map((_, w) => (
          <rect
            key={`rw-${w}`}
            x={-16}
            y={46 - w * 11}
            width={32}
            height={10}
            rx={1.5}
            fill={palette.accent}
            fillOpacity={0.35}
            stroke={palette.ink}
            strokeWidth={1.2 * sw}
          />
        ))}
      </g>
    </g>
  );
}

// ============================================================================
// Builder 14: Archival Artifact Engraving (Coins, Ration Sheets, Ingots, Punch Cards)
// ============================================================================

function renderArchivalArtifactEngraving(
  spec: ArchivalArtifactParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, progress, sw } = ctx;

  if (spec.artifactShape === "coupon-sheet" || spec.artifactShape === "punch-card") {
    const cols = Math.max(2, Math.min(5, spec.perforationCols));
    return (
      <g>
        <rect x={88} y={66} width={224} height={168} rx={4} fill={palette.paper} stroke={palette.ink} strokeWidth={2.1 * sw} />
        {Array.from({ length: cols }).map((_, c) =>
          Array.from({ length: 3 }).map((__, r) => {
            const cw = 200 / cols;
            const ch = 46;
            const idx = r * cols + c;
            const stamped = idx / (cols * 3) < progress;
            return (
              <g key={`cp-${c}-${r}`}>
                <rect
                  x={100 + c * cw + 2}
                  y={82 + r * ch}
                  width={cw - 4}
                  height={ch - 6}
                  fill={stamped ? palette.surfaceSubtle : palette.paper}
                  stroke={palette.ink}
                  strokeWidth={1.1 * sw}
                  strokeDasharray="3 2"
                />
                {stamped && (
                  <line
                    x1={106 + c * cw}
                    y1={88 + r * ch}
                    x2={94 + (c + 1) * cw}
                    y2={70 + (r + 1) * ch}
                    stroke={palette.accent}
                    strokeWidth={1.6 * sw}
                  />
                )}
              </g>
            );
          })
        )}
      </g>
    );
  }

  if (spec.artifactShape === "ingot-trapezoid") {
    return (
      <g>
        <polygon points="124,114 276,114 308,194 92,194" fill={palette.paper} stroke={palette.ink} strokeWidth={2.2 * sw} />
        <polygon points="138,128 262,128 282,178 118,178" fill={palette.highlightWash} stroke={palette.ink} strokeWidth={1.4 * sw} />
        <text x={200} y={159} textAnchor="middle" fill={palette.ink} fontFamily={FONTS.mono} fontSize="14" fontWeight="700">
          {spec.eraYear}
        </text>
      </g>
    );
  }

  // Engraved Medallion / Scrip Coin / Wax Seal
  return (
    <g>
      <path
        d={rosetteSealPathD(200, 152, 82, Math.max(12, spec.rimSerrations), 2.5, progress * 18)}
        fill={palette.paper}
        stroke={palette.ink}
        strokeWidth={2 * sw}
      />
      <circle cx={200} cy={152} r={66} stroke={palette.ink} strokeWidth={1.3 * sw} />
      {Array.from({ length: Math.min(16, spec.engravingHatchLines) }).map((_, h) => {
        const hy = 104 + h * 6;
        return (
          <line key={`ht-${h}`} x1={148} y1={hy} x2={252} y2={hy} stroke={palette.border} strokeWidth={0.85 * sw} />
        );
      })}
      <text x={200} y={158} textAnchor="middle" fill={palette.accent} fontFamily={FONTS.serif} fontSize="22" fontWeight="700">
        {spec.eraYear}
      </text>
    </g>
  );
}

// ============================================================================
// Builder 15: Chart Instrument & Telemetry Scope Frame
// ============================================================================

function renderChartInstrumentFrame(
  spec: ChartInstrumentParams,
  ctx: BlueprintStageContext
): React.ReactNode {
  const { palette, progress, sw, seed } = ctx;
  const gx = 72;
  const gy = 64;
  const gw = 256;
  const gh = 172;
  const n = Math.max(5, Math.min(14, spec.dataPointsCount));

  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = gx + 14 + (gw - 28) * t;
    let normY = 0.5;
    if (spec.curveProfile === "exponential-cliff") {
      normY = Math.pow(t, 2.4) * 0.85 + 0.08;
    } else if (spec.curveProfile === "step-ratchet") {
      normY = Math.floor(t * 4) / 4 * 0.72 + 0.14;
    } else if (spec.curveProfile === "inversion-spread") {
      normY = 0.25 + Math.sin(t * Math.PI * 1.4) * 0.52;
    } else {
      normY = 0.18 + t * 0.62 + (detRand(seed, i) - 0.5) * 0.16;
    }
    pts.push({ x, y: gy + gh - 14 - normY * (gh - 28) });
  }

  const visibleCount = Math.max(2, Math.ceil(pts.length * clampRange(progress, 0.15, 1)));
  const polyPoints = pts
    .slice(0, visibleCount)
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const threshY = gy + gh - spec.thresholdLinePct * gh;
  const focusPt = pts[Math.min(pts.length - 1, spec.calloutIndex % pts.length)];

  return (
    <g>
      <rect x={gx} y={gy} width={gw} height={gh} rx={4} fill={palette.paper} stroke={palette.ink} strokeWidth={2 * sw} />
      {Array.from({ length: spec.gridDivisionsX - 1 }).map((_, ix) => {
        const lx = gx + ((ix + 1) * gw) / spec.gridDivisionsX;
        return <line key={`gx-${ix}`} x1={lx} y1={gy} x2={lx} y2={gy + gh} stroke={palette.border} strokeWidth={0.85 * sw} />;
      })}
      {Array.from({ length: spec.gridDivisionsY - 1 }).map((_, iy) => {
        const ly = gy + ((iy + 1) * gh) / spec.gridDivisionsY;
        return <line key={`gy-${iy}`} x1={gx} y1={ly} x2={gx + gw} y2={ly} stroke={palette.border} strokeWidth={0.85 * sw} />;
      })}

      {/* Critical Threshold Datum */}
      <line x1={gx} y1={threshY} x2={gx + gw} y2={threshY} stroke={palette.accent} strokeWidth={1.3 * sw} strokeDasharray="5 4" />

      {spec.curveProfile === "pyramid-bars" || spec.curveProfile === "waterfall-steps" ? (
        pts.map((pt, idx) => (
          <rect
            key={`bar-${idx}`}
            x={pt.x - 7}
            y={pt.y}
            width={14}
            height={Math.max(4, gy + gh - 10 - pt.y) * progress}
            fill={idx >= pts.length - 2 ? palette.accent : palette.secondary}
            fillOpacity={0.35}
            stroke={palette.ink}
            strokeWidth={1.2 * sw}
          />
        ))
      ) : (
        <polyline points={polyPoints} fill="none" stroke={palette.ink} strokeWidth={2.4 * sw} strokeLinecap="round" strokeLinejoin="round" />
      )}

      <circle cx={focusPt.x} cy={focusPt.y} r={5} fill={palette.accent} stroke={palette.paper} strokeWidth={1.5 * sw} />
    </g>
  );
}

// ============================================================================
// Builder 16: Editorial Telestrator, Vernier Caliper & Audit Stamp Rig
// ============================================================================

function renderTelestratorAnnotationRig(
  spec: TelestratorAnnotationParams,
  ctx: BlueprintStageContext,
  metricText: string
): React.ReactNode {
  const { palette, progress, sw } = ctx;

  if (spec.rigVariant === "vernier-caliper") {
    const jawX = 124 + progress * 108;
    return (
      <g>
        {/* Fixed Main Vernier Scale Beam */}
        <rect x={68} y={128} width={264} height={22} fill={palette.paper} stroke={palette.ink} strokeWidth={2 * sw} />
        {Array.from({ length: spec.tickSubdivisions }).map((_, t) => {
          const tx = 78 + (244 * t) / Math.max(1, spec.tickSubdivisions - 1);
          return <line key={`vt-${t}`} x1={tx} y1={128} x2={tx} y2={t % 2 === 0 ? 140 : 135} stroke={palette.ink} strokeWidth={1 * sw} />;
        })}
        {/* Fixed Left Jaw */}
        <polygon points="68,128 88,128 88,214 68,196" fill={palette.surfaceSubtle} stroke={palette.ink} strokeWidth={2 * sw} />
        {/* Sliding Vernier Jaw */}
        <polygon
          points={`${jawX},124 ${jawX + 26},124 ${jawX + 26},214 ${jawX},196`}
          fill={palette.highlightWash}
          stroke={palette.accent}
          strokeWidth={2 * sw}
        />
        <line x1={88} y1={186} x2={jawX} y2={186} stroke={palette.accent} strokeWidth={1.4 * sw} strokeDasharray="4 3" />
      </g>
    );
  }

  if (spec.rigVariant === "loupe-reticle") {
    return (
      <g>
        <circle cx={200} cy={152} r={74} fill={palette.highlightWash} fillOpacity={0.2} stroke={palette.ink} strokeWidth={2.2 * sw} />
        <circle cx={200} cy={152} r={56} stroke={palette.accent} strokeWidth={1.3 * sw} strokeDasharray="6 4" />
        <line x1={112} y1={152} x2={288} y2={152} stroke={palette.ink} strokeWidth={1 * sw} />
        <line x1={200} y1={64} x2={200} y2={240} stroke={palette.ink} strokeWidth={1 * sw} />
      </g>
    );
  }

  // Rubber Stamp / Curly Brace / Dimension Span
  return (
    <g transform={`translate(200, 152) rotate(${spec.rotationDeg}) scale(${0.9 + 0.1 * progress})`}>
      <rect x={-118} y={-44} width={236} height={88} rx={4} fill={palette.paper} stroke={palette.accent} strokeWidth={2.6 * sw} />
      {spec.doubleBorder && (
        <rect x={-111} y={-37} width={222} height={74} rx={2} stroke={palette.accent} strokeWidth={1.2 * sw} />
      )}
      <text x={0} y={8} textAnchor="middle" fill={palette.accent} fontFamily={FONTS.mono} fontSize="20" fontWeight="700" letterSpacing="0.08em">
        {metricText}
      </text>
    </g>
  );
}

// ============================================================================
// Dispatcher Component & Factory for 500+ Parametric Blueprints
// ============================================================================

export interface ParametricBlueprintSvgProps extends PropRenderProps {
  blueprint: ParametricPropBlueprint;
}

export const ParametricBlueprintSvg: React.FC<ParametricBlueprintSvgProps> = ({
  blueprint,
  ...renderProps
}) => {
  const contextFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const f = renderProps.frame !== undefined ? renderProps.frame : contextFrame;
  const springProgress = spring({
    frame: Math.max(0, f),
    fps,
    config: { damping: 24, mass: 0.9, stiffness: 110, overshootClamping: true },
    durationInFrames: 36,
  });
  const clampedInterp = interpolate(f, [0, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const baseProgress = clamp01(springProgress * 0.7 + clampedInterp * 0.3);
  const anim = resolveAnimState(contextFrame, renderProps.frame, renderProps.progress ?? baseProgress, 36);

  const palette = resolvePropPalette(renderProps, blueprint.accentRole);
  const strokeScale = renderProps.strokeScale ?? 1;
  const width = renderProps.width ?? 360;
  const height = renderProps.height ?? 270;
  const showAnnotations = renderProps.showAnnotations ?? true;
  const title = renderProps.labelOverride ?? blueprint.title;
  const metric = renderProps.metricOverride ?? blueprint.primaryMetric;

  const ctx: BlueprintStageContext = {
    frame: anim.frame,
    fps,
    progress: anim.progress,
    phaseRad: anim.phaseRad,
    palette,
    sw: strokeScale,
    seed: blueprint.id,
  };

  const geom = blueprint.geometry;
  let body: React.ReactNode = null;
  switch (geom.archetype) {
    case "precision-dial-gauge":
      body = renderPrecisionDialGauge(geom, ctx, metric);
      break;
    case "rotary-valve-manifold":
      body = renderRotaryValveManifold(geom, ctx);
      break;
    case "banknote-bond-instrument":
      body = renderBanknoteBondInstrument(geom, ctx, metric, blueprint.datumCode);
      break;
    case "legal-dossier-filing":
      body = renderLegalDossierFiling(geom, ctx, blueprint.datumCode);
      break;
    case "semiconductor-die-reticle":
      body = renderSemiconductorDieReticle(geom, ctx);
      break;
    case "server-compute-chassis":
      body = renderServerComputeChassis(geom, ctx);
      break;
    case "grid-power-apparatus":
      body = renderGridPowerApparatus(geom, ctx);
      break;
    case "industrial-plant-rig":
      body = renderIndustrialPlantRig(geom, ctx);
      break;
    case "maritime-defense-vessel":
      body = renderMaritimeDefenseVessel(geom, ctx);
      break;
    case "subsea-network-node":
      body = renderSubseaNetworkNode(geom, ctx);
      break;
    case "architectural-elevation":
      body = renderArchitecturalElevation(geom, ctx);
      break;
    case "consumer-exploded-bom":
      body = renderConsumerExplodedBom(geom, ctx);
      break;
    case "balance-ledger-contraption":
      body = renderBalanceLedgerContraption(geom, ctx);
      break;
    case "archival-artifact-engraving":
      body = renderArchivalArtifactEngraving(geom, ctx);
      break;
    case "chart-instrument-frame":
      body = renderChartInstrumentFrame(geom, ctx);
      break;
    case "telestrator-annotation-rig":
      body = renderTelestratorAnnotationRig(geom, ctx, metric);
      break;
  }

  return (
    <BlueprintPlateFrame
      width={width}
      height={height}
      palette={palette}
      strokeScale={strokeScale}
      datumCode={blueprint.datumCode}
      title={title}
      primaryMetric={metric}
      secondaryLabel={blueprint.secondaryLabel}
      showAnnotations={showAnnotations}
      className={renderProps.className}
      style={renderProps.style}
    >
      {body}
    </BlueprintPlateFrame>
  );
};

export function createParametricPropComponent(
  blueprint: ParametricPropBlueprint
): React.FC<PropRenderProps> {
  const BoundParametricProp: React.FC<PropRenderProps> = (props) => (
    <ParametricBlueprintSvg blueprint={blueprint} {...props} />
  );
  BoundParametricProp.displayName = `ParametricProp(${blueprint.id})`;
  return BoundParametricProp;
}
