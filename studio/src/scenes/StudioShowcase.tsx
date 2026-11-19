import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraPreviewStage } from "../components/glass/CameraPreviewStage";
import { EditorialBackdrop } from "../components/EditorialBackdrop";
import { LiquidGlassObject } from "../components/glass/LiquidGlassObject";
import {
  GlassMagnifierCard,
  GlassStatTriptych,
  GlassTelemetryStrip,
  GlassVerdictSeal,
} from "../components/glass/LiquidGlassPresets";
import { PresenterDepthStage } from "../components/glass/PresenterDepthStage";
import { ObjectLayer, ObjectLayerStage } from "../components/layers/ObjectLayerStage";
import { SfxCue, SfxTimeline } from "../components/SfxCue";
import { SourceBadge } from "../components/SourceBadge";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import { COLORS, OVER_FOOTAGE_PALETTE, PAGE_PALETTE } from "../design/tokens";
import { SceneBlueprintRenderer } from "../generative";
import { ObjectAnimator } from "../motion/ObjectAnimator";
import { PropVaultRenderer } from "../registry/props";
import { renderStyleRecipe } from "../styles";
import {
  DataPhysicalCard,
  MapExplainer,
  WhiteModel3D,
} from "../styles/dataMaps3D";
import {
  LiveCountdownSplit,
  NewsPackageLowerThird,
  TelestratorOverlay,
  VisualInvestigationBoard,
} from "../styles/docBroadcast";
import {
  CollageCutout,
  Newsreel1920s,
} from "../styles/vintageEditorial";
import {
  StickFigureStage,
  StickerCutout,
} from "../styles/diagramMetaphor";
import { DataTicker } from "../typography/DataTicker";
import { KineticText, synthesizeTimedWords } from "../typography/KineticText";

/**
 * StudioShowcase (600 frames / 20 seconds @ 30 fps)
 * Classic 4-chapter studio showcase preserved 100% for backward-compatible
 * Dual-Palette & optical refraction benchmarks (`StudioShowcase` @ frame 70).
 */
export const StudioShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paperLight, overflow: "hidden" }}>
      {/* CHAPTER 1: Frames 0 - 150 (Crystal Smoked-Navy Apple Liquid Glass) */}
      {frame < 150 && (
        <CameraPreviewStage previewMode="simulated-room">
          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "16%",
              width: "68%",
              height: "640px",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "110px",
                left: 0,
                width: "100%",
                height: "12px",
                background: `linear-gradient(90deg, rgba(191, 214, 234, 0.25) 0%, ${OVER_FOOTAGE_PALETTE.accentWarm} 42%, ${OVER_FOOTAGE_PALETTE.chartSecondary} 78%, rgba(226, 115, 88, 0.72) 100%)`,
                borderRadius: "6px",
                opacity: 0.78,
              }}
            />
            <svg width="100%" height="640" viewBox="0 0 1100 640" fill="none">
              <path
                d="M 0 135 Q 280 55 560 118 T 1100 88"
                stroke={OVER_FOOTAGE_PALETTE.accentPrimary}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.72"
              />
              <path
                d="M 0 535 Q 320 455 620 518 T 1100 445"
                stroke={OVER_FOOTAGE_PALETTE.chartSecondary}
                strokeWidth="6.5"
                strokeLinecap="round"
                opacity="0.78"
              />
              <path
                d="M 0 570 Q 340 495 660 558 T 1100 490"
                stroke={OVER_FOOTAGE_PALETTE.brickRedText}
                strokeWidth="4.5"
                strokeDasharray="12 8"
                opacity="0.78"
              />
            </svg>
          </div>

          <ObjectLayerStage>
            <ObjectLayer
              id="glass-card-main"
              lifecycle={{
                enterFrame: 8,
                enterDuration: 14,
                focusFrame: 45,
                focusDuration: 12,
                highlightFrame: 70,
                highlightDuration: 16,
                dockFrame: 100,
                dockDuration: 16,
                exitFrame: 138,
                exitDuration: 10,
                entered: { x: 0, y: 0, scale: 1.0 },
                focused: { scale: 1.04, focusGlow: 1.0 },
                docked: { x: 460, y: 210, scale: 0.76 },
              }}
              position={{ left: "34%", top: "24%" }}
              zIndex={10}
            >
              <LiquidGlassObject
                width={640}
                borderRadius={28}
                tint="navy-glass"
                enableOpticalRefraction={true}
                enableSpecularSweep={true}
                enableSfx={true}
              >
                <div style={{ padding: "36px 40px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "18px",
                      borderBottom: `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`,
                      paddingBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "12px",
                        color: OVER_FOOTAGE_PALETTE.accentWarm,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        textShadow: OVER_FOOTAGE_PALETTE.textShadow,
                      }}
                    >
                      Treasury Statement · Table 9
                    </span>
                    <span
                      style={{
                        backgroundColor: OVER_FOOTAGE_PALETTE.brickRedFill,
                        color: OVER_FOOTAGE_PALETTE.textHeadline,
                        fontFamily: FONTS.mono,
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${OVER_FOOTAGE_PALETTE.riskBorder}`,
                      }}
                    >
                      LIVE DATA
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: FONTS.serif,
                      fontSize: "28px",
                      fontWeight: 700,
                      color: OVER_FOOTAGE_PALETTE.textHeadline,
                      textShadow: OVER_FOOTAGE_PALETTE.textShadow,
                      margin: 0,
                      lineHeight: 1.24,
                    }}
                  >
                    Receipts Balance & Debt Trajectory
                  </h3>

                  <p
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: "15px",
                      fontWeight: 500,
                      color: OVER_FOOTAGE_PALETTE.textBody,
                      textShadow: OVER_FOOTAGE_PALETTE.textShadow,
                      marginTop: "10px",
                      lineHeight: 1.55,
                    }}
                  >
                    Curved optical refraction bends underlying trends cleanly while preserving full legibility.
                  </p>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "16px 20px",
                      borderRadius: "16px",
                      backgroundColor: "rgba(15, 25, 35, 0.44)",
                      border: `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`,
                    }}
                  >
                    <DataTicker
                      startValue={12.4}
                      endValue={38.4}
                      prefix="$"
                      suffix="T"
                      atFrame={24}
                      duration={40}
                      decimals={1}
                      fontSize={44}
                      color={OVER_FOOTAGE_PALETTE.textHeadline}
                      accentColor={OVER_FOOTAGE_PALETTE.brickRedText}
                      darkSurface={true}
                      label="NATIONAL FISCAL BALANCE"
                      delta={{ value: "+210%", isPositive: false, label: "VS BASELINE" }}
                    />
                  </div>
                </div>
              </LiquidGlassObject>
            </ObjectLayer>

            <ObjectLayer
              id="ch1-title"
              lifecycle={{ enterFrame: 4, exitFrame: 140 }}
              position={{ left: "64px", top: "54px" }}
              zIndex={20}
            >
              <LiquidGlassObject
                borderRadius={999}
                tint="navy-glass"
                blurAmount={9}
                enableSfx={false}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "10px 22px",
                    userSelect: "none",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: PAGE_PALETTE.navy,
                      color: OVER_FOOTAGE_PALETTE.textHeadline,
                      border: "1px solid rgba(191, 214, 234, 0.36)",
                      fontFamily: FONTS.mono,
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "4px 11px",
                      borderRadius: "999px",
                    }}
                  >
                    PART 01
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: "17px",
                      fontWeight: 700,
                      color: OVER_FOOTAGE_PALETTE.textHeadline,
                      textShadow: OVER_FOOTAGE_PALETTE.textShadow,
                      letterSpacing: "0.01em",
                    }}
                  >
                    Liquid Glass Overlay
                  </span>
                </div>
              </LiquidGlassObject>
            </ObjectLayer>
          </ObjectLayerStage>
        </CameraPreviewStage>
      )}

      {/* CHAPTER 2: Frames 150 - 300 (Case Notes & Broadcast Lower Third) */}
      {frame >= 150 && frame < 300 && (
        <AbsoluteFill>
          <VisualInvestigationBoard
            atFrame={150}
            evidenceItems={[
              { id: "e1", label: "CBO Reported Deficit", value: "$1.83T" },
              { id: "e2", label: "Net Interest Payments", value: "$882B", isFlagged: true },
              { id: "e3", label: "Defense Outlays", value: "$874B" },
            ]}
            pointerTargetId="e2"
          />

          <TelestratorOverlay
            atFrame={175}
            duration={24}
            color={COLORS.brickRed}
            circleTarget={{
              cx: 960,
              cy: 225,
              r: 140,
              label: "INTEREST SURPASSES DEFENSE",
            }}
          />

          <NewsPackageLowerThird
            atFrame={160}
            category="Fiscal Analysis"
            title="Interest Costs Cross Historical Parity Threshold"
            source="U.S. Treasury Monthly Statement, Table 9"
            mode="ANALYSIS"
          />

          {frame >= 220 && (
            <div
              style={{
                position: "absolute",
                bottom: "160px",
                right: "64px",
                width: "680px",
                height: "260px",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 20px 44px rgba(28, 43, 58, 0.16)",
                border: `2px solid ${COLORS.navy}`,
              }}
            >
              <LiveCountdownSplit
                atFrame={220}
                duration={70}
                leftTitle="Historical Baseline"
                rightTitle="Accelerated Trajectory"
                startYear={2026}
                endYear={2036}
              />
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* CHAPTER 3: Frames 300 - 450 (1920s Newsreel & Stick Figure Metaphor) */}
      {frame >= 300 && frame < 450 && (
        <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "64px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ width: "680px", height: "420px", borderRadius: "12px", overflow: "hidden" }}>
                <Newsreel1920s
                  atFrame={302}
                  placeDate="WASHINGTON · 1929"
                  headline="CONGRESS ENACTS DEFICIT MEASURES"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#EFE6CF",
                      fontFamily: FONTS.serif,
                      fontSize: "22px",
                      textAlign: "center",
                      padding: "36px",
                    }}
                  >
                    &ldquo;The Treasury balance hangs in delicate equilibrium upon the speaker&apos;s gavel.&rdquo;
                  </div>
                </Newsreel1920s>
              </div>

              <CollageCutout rotation={-2} atFrame={315}>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: COLORS.navy,
                    padding: "8px 16px",
                  }}
                >
                  Archive Clipping · 1929
                </div>
              </CollageCutout>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <StickerCutout atFrame={310} outlineWidth={10} rotation={2}>
                <div style={{ backgroundColor: PAGE_PALETTE.paperLight, padding: "16px 24px" }}>
                  <StickFigureStage
                    pose="crushed-by-debt"
                    caption="Obligations Outpace Payroll"
                    accentColor={COLORS.brickRed}
                  />
                </div>
              </StickerCutout>

              <div style={{ marginTop: "24px" }}>
                <KineticText
                  text="$1.8 TRILLION"
                  correctionText="$40.5 TRILLION"
                  mode="red-correction"
                  atFrame={315}
                  fontSize={28}
                  fontFamily={FONTS.mono}
                  color={COLORS.navy}
                />
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* CHAPTER 4: Frames 450 - 600 (Page Mode D3 Map, 3D Physical & Text) */}
      {frame >= 450 && (
        <AbsoluteFill style={{ backgroundColor: COLORS.paperLight }}>
          <MapExplainer
            atFrame={452}
            query="PJM Eastern Grid Corridor"
            corridorId="PJM_GRID"
            highlightLabel="PJM 13-State Grid"
            zoomState={true}
          />

          <div
            style={{
              position: "absolute",
              top: "84px",
              left: "64px",
              zIndex: 30,
            }}
          >
            <ObjectAnimator enter="slide-right" atFrame={460} duration={130}>
              <DataPhysicalCard
                atFrame={462}
                label1="Individual Payroll & Income"
                value1={84}
                label2="Corporate Income"
                value2={7}
              />
            </ObjectAnimator>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "64px",
              right: "64px",
              zIndex: 35,
            }}
          >
            <ObjectAnimator enter="blur-snap" atFrame={475} duration={120}>
              <WhiteModel3D width={460} height={300} />
            </ObjectAnimator>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "54px",
              left: "64px",
              maxWidth: "800px",
              backgroundColor: "rgba(250, 248, 243, 0.95)",
              padding: "14px 24px",
              borderRadius: "10px",
              border: `1px solid ${COLORS.paperBorder}`,
              borderLeft: `4px solid ${COLORS.navy}`,
              boxShadow: "0 14px 32px rgba(28, 43, 58, 0.12)",
              zIndex: 40,
            }}
          >
            <KineticText
              text="Individual taxpayers supply eighty-four percent of all federal revenue."
              mode="karaoke-highlight"
              atFrame={470}
              duration={110}
              fontSize={22}
              color={COLORS.navy}
              highlightColor={COLORS.brickRed}
            />
          </div>
        </AbsoluteFill>
      )}

      {frame === 150 && <SfxCue cue="paper-slide" atFrame={150} volume={0.6} />}
      {frame === 300 && <SfxCue cue="paper-slide" atFrame={300} volume={0.6} />}
      {frame === 450 && <SfxCue cue="map-whoosh" atFrame={450} volume={0.6} />}
    </AbsoluteFill>
  );
};

export interface CinemaPillarChapterSpec {
  index: number;
  id: string;
  pillars: string;
  title: string;
  startFrame: number;
  endFrame: number;
  sampleFrame: number;
}

export const CINEMA_16_PILLAR_CHAPTERS: readonly CinemaPillarChapterSpec[] = [
  {
    index: 1,
    id: "depth-sandwich",
    pillars: "PILLARS 01 · 10",
    title: "5-Plane Presenter Depth-Sandwich Stage",
    startFrame: 0,
    endFrame: 60,
    sampleFrame: 32,
  },
  {
    index: 2,
    id: "setpiece-physics",
    pillars: "PILLARS 12 · 13",
    title: "Declarative Set-Piece Physics Contraption",
    startFrame: 60,
    endFrame: 120,
    sampleFrame: 92,
  },
  {
    index: 3,
    id: "macro-telemetry-jaws",
    pillars: "PILLARS 03 · 06",
    title: "Macro Telemetry Diverging Jaws (Midnight Register)",
    startFrame: 120,
    endFrame: 180,
    sampleFrame: 152,
  },
  {
    index: 4,
    id: "forensic-syllabus",
    pillars: "PILLARS 03 · 08",
    title: "Primary-Source Supreme Court Syllabus Exhibit",
    startFrame: 180,
    endFrame: 240,
    sampleFrame: 212,
  },
  {
    index: 5,
    id: "war-room-corridor-atlas",
    pillars: "PILLARS 03 · 11",
    title: "Offline 211-Country & 24-Corridor War-Room Atlas",
    startFrame: 240,
    endFrame: 300,
    sampleFrame: 272,
  },
  {
    index: 6,
    id: "mechanical-plumbing-simulator",
    pillars: "PILLARS 02 · 12",
    title: "Mechanical Tax Plumbing Guillotine Simulator",
    startFrame: 300,
    endFrame: 360,
    sampleFrame: 332,
  },
  {
    index: 7,
    id: "ui-satire-scrip-wallet",
    pillars: "PILLARS 14 · 15",
    title: "Stateful Continuity & Closed Compute Scrip Wallet",
    startFrame: 360,
    endFrame: 420,
    sampleFrame: 392,
  },
  {
    index: 8,
    id: "eighteen-glass-rigs",
    pillars: "PILLARS 01 · 09",
    title: "18-Preset Smoked-Navy Liquid Glass Optical Rigs",
    startFrame: 420,
    endFrame: 480,
    sampleFrame: 452,
  },
  {
    index: 9,
    id: "thirty-two-mode-stenography",
    pillars: "PILLARS 04 · 05 · 07 · 16",
    title: "32-Mode Prosody Stenography & 96-Cue Studio Foley",
    startFrame: 480,
    endFrame: 540,
    sampleFrame: 512,
  },
];

const StenographyChapterStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heroSentence =
    "Individual paychecks fund 84.1% of federal revenue while corporate receipts fell to 7.1%.";
  const chiselWords = useMemo(
    () => synthesizeTimedWords(heroSentence, 44, fps),
    [fps]
  );
  const verdictWords = useMemo(
    () => synthesizeTimedWords("WE CALL THAT AN ALLOWANCE.", 46, fps),
    [fps]
  );

  const prosodyPills = chiselWords.slice(0, 12);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <EditorialBackdrop driftSpeed={0.2} showGrid tone="light" />
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "1480px",
            backgroundColor: PAGE_PALETTE.paper,
            color: PAGE_PALETTE.navy,
            borderRadius: "10px",
            border: `1px solid ${PAGE_PALETTE.paperBorder}`,
            boxShadow:
              "0 24px 52px -14px rgba(28, 43, 58, 0.16), 0 4px 16px rgba(28, 43, 58, 0.06)",
            padding: "40px 52px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box",
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
              backgroundColor: PAGE_PALETTE.navy,
            }}
          />

          {/* 1. Masthead */}
          <div
            style={{
              borderBottom: `2px solid ${PAGE_PALETTE.navy}`,
              paddingBottom: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: PAGE_PALETTE.brickRed,
              }}
            >
              CINEMA STENOGRAPHY · 32 WHISPER-SYNCED MODES
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12.5px",
                fontWeight: 600,
                color: PAGE_PALETTE.muted,
                ...TABULAR_NUM_STYLE,
              }}
            >
              SYLLABLE PROSODY CLOCK · -14.0 LUFS
            </span>
          </div>

          {/* 2. Hero Chisel Highlighter Sweep */}
          <div
            style={{
              backgroundColor: PAGE_PALETTE.paperLight,
              border: `1px solid ${PAGE_PALETTE.paperBorder}`,
              borderRadius: "8px",
              padding: "24px 30px",
            }}
          >
            <KineticText
              text={heroSentence}
              timedWords={chiselWords}
              mode="chisel-highlighter-sweep"
              atFrame={0}
              duration={44}
              fontSize={38}
              paletteMode="page"
              color={PAGE_PALETTE.navy}
              highlightColor={PAGE_PALETTE.brickRed}
              enableSfx={false}
            />
          </div>

          {/* 3. Middle 2-Column Comparative Stage */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.08fr 0.92fr",
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            {/* Left: Solari Split-Flap Telemetry Board */}
            <div
              style={{
                padding: "24px 28px",
                borderRadius: "10px",
                backgroundColor: PAGE_PALETTE.navyDeep,
                border: `1px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: OVER_FOOTAGE_PALETTE.accentPrimary,
                }}
              >
                SOLARI SPLIT-FLAP TELEMETRY BOARD
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <KineticText
                  text="PAYROLL 84.1% · CORP 7.1%"
                  mode="solari-split-flap"
                  atFrame={0}
                  duration={42}
                  fontSize={22}
                  paletteMode="over-footage"
                  color={OVER_FOOTAGE_PALETTE.textHeadline}
                  enableSfx={false}
                />
                <KineticText
                  text="2036 INTEREST $2.1T"
                  mode="solari-split-flap"
                  atFrame={6}
                  duration={40}
                  fontSize={22}
                  paletteMode="over-footage"
                  color={OVER_FOOTAGE_PALETTE.textHeadline}
                  enableSfx={false}
                />
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11.5px",
                  color: OVER_FOOTAGE_PALETTE.textMuted,
                  borderTop: "1px solid rgba(191, 214, 234, 0.2)",
                  paddingTop: "10px",
                  ...TABULAR_NUM_STYLE,
                }}
              >
                TREASURY TABLE 9 · CBO BASELINE PROJECTION
              </div>
            </div>

            {/* Right: Veto Fountain Strike + Prosody Word-Pill Timeline */}
            <div
              style={{
                padding: "24px 28px",
                borderRadius: "10px",
                backgroundColor: PAGE_PALETTE.paperLight,
                border: `1px solid ${PAGE_PALETTE.paperBorder}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: PAGE_PALETTE.brickRed,
                }}
              >
                VETO FOUNTAIN STRIKE · WHISPER WORD SYNC
              </div>

              <KineticText
                text="FRIDAY PAYCHECK -> SOVEREIGN ALLOWANCE"
                mode="veto-fountain-strike"
                atFrame={0}
                duration={44}
                fontSize={26}
                paletteMode="page"
                color={PAGE_PALETTE.navy}
                highlightColor={PAGE_PALETTE.brickRed}
                enableSfx={false}
              />

              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "14px",
                  lineHeight: 1.45,
                  color: PAGE_PALETTE.muted,
                }}
              >
                Nominal household obligations stay locked while discretionary pay erodes.
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  paddingTop: "8px",
                  borderTop: `1px solid ${PAGE_PALETTE.paperBorder}`,
                }}
              >
                {prosodyPills.map((w, idx) => {
                  const isActive = frame >= w.startFrame && frame <= w.endFrame;
                  const isSpoken = frame > w.endFrame;
                  return (
                    <span
                      key={`pill-${idx}`}
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "11px",
                        fontWeight: isActive ? 700 : 600,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: isActive
                          ? PAGE_PALETTE.brickRed
                          : isSpoken
                            ? PAGE_PALETTE.navy
                            : PAGE_PALETTE.paper,
                        color:
                          isActive || isSpoken
                            ? PAGE_PALETTE.paperLight
                            : PAGE_PALETTE.muted,
                        border: `1px solid ${
                          isActive ? PAGE_PALETTE.brickRed : PAGE_PALETTE.paperBorder
                        }`,
                        ...TABULAR_NUM_STYLE,
                      }}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Footer Verdict Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              padding: "18px 26px",
              borderRadius: "10px",
              backgroundColor: PAGE_PALETTE.paperLight,
              border: `2px solid ${PAGE_PALETTE.brickRed}`,
            }}
          >
            <KineticText
              text="WE CALL THAT AN ALLOWANCE."
              timedWords={verdictWords}
              mode="verdict-anvil-slam"
              atFrame={4}
              duration={46}
              fontSize={30}
              paletteMode="page"
              color={PAGE_PALETTE.brickRed}
              enableSfx={false}
            />
            <SourceBadge
              sourceText="U.S. Treasury Monthly Statement · Table 9"
              startFrame={4}
              paletteMode="page"
              style={{ position: "relative", bottom: "auto", left: "auto" }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Cinema16PillarShowcase (540 frames / 18s @ 30fps)
 * Flagship rapid inspection reel cycling across all 16 Reading Room Cinema pillars
 * in 9 crisp 60-frame (2.0s) chapters for `cinema-exam.mjs` and Remotion Studio.
 */
export const Cinema16PillarShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const activeChapter =
    CINEMA_16_PILLAR_CHAPTERS[
      Math.min(
        CINEMA_16_PILLAR_CHAPTERS.length - 1,
        Math.max(0, Math.floor(frame / 60))
      )
    ];

  const transitionCues = useMemo(
    () => [
      { cue: "sub-bass-drop", frame: 0, volume: 0.58 },
      { cue: "hydraulic-press", frame: 60, volume: 0.56 },
      { cue: "odometer-tick", frame: 120, volume: 0.56 },
      { cue: "gavel-wood-hit", frame: 180, volume: 0.6 },
      { cue: "map-whoosh", frame: 240, volume: 0.58 },
      { cue: "guillotine-slice", frame: 300, volume: 0.58 },
      { cue: "coin-brass-clink", frame: 360, volume: 0.58 },
      { cue: "glass-loupe-click", frame: 420, volume: 0.58 },
      { cue: "fountain-pen-slash", frame: 480, volume: 0.62 },
    ],
    []
  );

  return (
    <AbsoluteFill style={{ backgroundColor: PAGE_PALETTE.navyDeep, overflow: "hidden" }}>
      <SfxTimeline cues={transitionCues} seed="cinema-16-pillars" />

      {/* 1. Pillar #10 Depth-Sandwich Stage */}
      <Sequence durationInFrames={60}>
        <PresenterDepthStage
          mode="simulated-depth"
          preset="behind-shoulder-billboard"
          heroBackdropFigure={{
            figure: "$40.5T",
            eyebrow: "SOVEREIGN DEBT MONOLITH",
            sublabel: "Compounding Behind Presenter Matte While Payroll Supplies 84.1%",
            tone: "liability",
          }}
          behindPresenter={
            <div style={{ position: "absolute", right: "72px", bottom: "60px" }}>
              <PropVaultRenderer
                propId="DebtMonolithWall"
                width={430}
                height={295}
                paletteMode="over-footage"
              />
            </div>
          }
          foregroundGlass={
            <div style={{ position: "absolute", right: "68px", top: "170px" }}>
              <GlassVerdictSeal
                stampLabel="DEPTH SANDWICH"
                headline="4-Plane Presenter Occlusion"
                docketOrStatute="U.S. Treasury Table 9 · V1-V4"
                impactFigure="84.1%"
                impactSubtext="Foreground Smoked-Navy Glass + Plane 1 Monolith"
                enableSfx={false}
              />
            </div>
          }
        />
      </Sequence>

      {/* 2. Pillar #13 Set-Piece Physics Contraption */}
      <Sequence from={60} durationInFrames={60}>
        <SceneBlueprintRenderer
          blueprintId="SP01_SHOE_LABOR_VAPORIZER"
          surfaceMode="page"
          themeRegister="paper_editorial"
        />
      </Sequence>

      {/* 3. Pillar #3 Macro Telemetry Jaws */}
      <Sequence from={120} durationInFrames={60}>
        {renderStyleRecipe("DivergingJawsChart", {
          eyebrow: "MACRO TELEMETRY · MIDNIGHT REGISTER",
          title: "Productivity (+278%) vs Real Hourly Pay (+119%)",
          subtitle: "Post-1973 decoupling across U.S. nonfarm payrolls",
          metric: "DIV +159 PTS",
          register: "midnight_telemetry",
          sourceCitation: "U.S. Bureau of Labor Statistics (BLS)",
          paletteMode: "page",
          atFrame: 0,
          duration: 60,
          enableSfx: false,
        })}
      </Sequence>

      {/* 4. Pillar #3 Forensic Statutory Syllabus */}
      <Sequence from={180} durationInFrames={60}>
        {renderStyleRecipe("SupremeCourtSyllabusStage", {
          eyebrow: "FORENSIC EXHIBIT · ARCHIVAL PARCHMENT",
          title: "Wielechowski v. State (Alaska 2016)",
          subtitle: "Statutory dividend formulas yield to annual executive budget vetoes.",
          metric: "-74%",
          register: "archival_parchment",
          data: { formulaPayout: 3900, actualPayout: 1000 },
          sourceCitation: "Alaska Supreme Court, 403 P.3d 1141",
          paletteMode: "page",
          atFrame: 0,
          duration: 60,
          enableSfx: false,
        })}
      </Sequence>

      {/* 5. Pillar #3 War-Room Corridor Atlas */}
      <Sequence from={240} durationInFrames={60}>
        <MapExplainer
          query="PJM 13-State Eastern Grid Corridor"
          corridorId="PJM_GRID"
          title="PJM 13-State Capacity Shock (+833%)"
          subtitle="Hyperscale load & transformer bottleneck from Illinois to New Jersey"
          metricValue="$269.92/MW-day"
          routeTone="alert"
          sourceCitation="PJM Interconnection 2025/2026 Auction"
          atFrame={0}
        />
      </Sequence>

      {/* 6. Pillar #2 Mechanical Tax Plumbing Simulator */}
      <Sequence from={300} durationInFrames={60}>
        {renderStyleRecipe("DualTaxPlumbingSchematic", {
          eyebrow: "SYSTEM SIMULATOR · DRAFTING BLUEPRINT",
          title: "W-2 Payroll Guillotine vs IP Margin-Loan Loop",
          subtitle: "Automatic Friday withholding versus untaxed equity collateral borrowing",
          metric: "84.1% vs 7%",
          sourceCitation: "U.S. Treasury Monthly Statement, Table 9",
          paletteMode: "page",
          atFrame: 0,
          duration: 60,
          enableSfx: false,
        })}
      </Sequence>

      {/* 7. Pillar #14 UI Satire Scrip Wallet */}
      <Sequence from={360} durationInFrames={60}>
        {renderStyleRecipe("ClosedComputeScripWallet", {
          eyebrow: "STATEFUL CONTINUITY · UI SATIRE",
          title: "Closed Compute Scrip Wallet (20% Exit Toll)",
          subtitle: "Non-transferable vendor tokens vs fixed USD mortgage obligations",
          metric: "-20% FEE",
          sourceCitation: "Fair Labor Standards Act (1938) / Cloud Credit Terms",
          paletteMode: "page",
          atFrame: 0,
          duration: 60,
          enableSfx: false,
        })}
      </Sequence>

      {/* 8. Pillar #1 18-Preset Smoked-Navy Liquid Glass Rigs */}
      <Sequence from={420} durationInFrames={60}>
        <CameraPreviewStage previewMode="simulated-room">
          <div style={{ position: "absolute", left: "68px", top: "96px" }}>
            <GlassStatTriptych
              width={840}
              eyebrow="EPISODE 01 · FISCAL TELEMETRY"
              title="Federal Receipts vs. Sovereign Balance"
              stats={[
                { label: "Payroll Share", value: "84.1%", delta: "Individual W-2 & FICA" },
                { label: "Corporate Tax", value: "7.1%", delta: "-3.7 pts FY25", isRisk: true },
                { label: "Federal Debt", value: "$40.5T", delta: "Compounding Baseline", isRisk: true },
              ]}
              citation="U.S. Treasury Monthly Statement, Table 9"
              enableSfx={false}
            />
          </div>
          <div style={{ position: "absolute", right: "68px", top: "96px" }}>
            <GlassMagnifierCard
              width={580}
              title="SEC Form 10-K Footnote 14"
              clauseCode="FILING EXCERPT"
              focusedSnippet="Useful server depreciation schedules extended from 3 years to 6 years, lifting reported operating income."
              citation="SEC EDGAR Quarterly Filings"
              enableSfx={false}
            />
          </div>
          <div style={{ position: "absolute", right: "68px", top: "454px" }}>
            <GlassVerdictSeal
              width={580}
              docketOrStatute="TREASURY TABLE 9"
              stampLabel="VERIFIED FILING"
              headline="Net Interest Overtakes Discretionary Outlays"
              impactFigure="$2.1T"
              impactSubtext="Annual CBO Debt Interest by 2036"
              enableSfx={false}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "44px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <GlassTelemetryStrip
              width={1440}
              tag="18 GLASS RIGS"
              channels={[
                {
                  id: "payroll",
                  label: "Payroll Share",
                  value: "84.1%",
                  delta: "+2.3%",
                  sparkline: [0.68, 0.72, 0.75, 0.78, 0.81, 0.83, 0.86],
                },
                {
                  id: "corp",
                  label: "Corporate Tax",
                  value: "7.1%",
                  delta: "-3.7%",
                  isRisk: true,
                  sparkline: [0.84, 0.76, 0.68, 0.56, 0.44, 0.34, 0.24],
                },
                {
                  id: "debt",
                  label: "Federal Debt",
                  value: "$40.5T",
                  delta: "+6.8%",
                  isRisk: true,
                  sparkline: [0.24, 0.32, 0.43, 0.56, 0.69, 0.82, 0.94],
                },
                {
                  id: "interest",
                  label: "2036 Interest",
                  value: "$2.1T",
                  delta: "CBO Est.",
                  isRisk: true,
                  sparkline: [0.18, 0.25, 0.35, 0.48, 0.63, 0.79, 0.95],
                },
              ]}
              sourceTag="U.S. Treasury Fiscal Data"
              enableSfx={false}
            />
          </div>
        </CameraPreviewStage>
      </Sequence>

      {/* 9. Pillar #4 & #5 32-Mode Prosody Stenography */}
      <Sequence from={480} durationInFrames={60}>
        <StenographyChapterStage />
      </Sequence>

      {/* Top-Center Non-Intrusive Showcase Index Badge */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "4px 14px",
          borderRadius: "999px",
          backgroundColor: "rgba(15, 25, 35, 0.82)",
          border: "1px solid rgba(191, 214, 234, 0.34)",
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 90,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            color: OVER_FOOTAGE_PALETTE.accentWarm,
            letterSpacing: "0.08em",
            ...TABULAR_NUM_STYLE,
          }}
        >
          0{activeChapter.index}/09 · {activeChapter.pillars}
        </span>
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: "12px",
            fontWeight: 600,
            color: OVER_FOOTAGE_PALETTE.textHeadline,
          }}
        >
          {activeChapter.title}
        </span>
      </div>
    </AbsoluteFill>
  );
};
