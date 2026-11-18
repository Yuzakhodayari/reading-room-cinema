import "./index.css";
import React, { useMemo } from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DEFAULT_DIRECTOR_BEAT,
  DirectorBeat,
  DirectorBeatRenderer,
  DirectorBeatRendererProps,
  DirectorPlan,
  FlexibleBeatInput,
  normalizeDirectorBeat,
  resolvePlayableMediaSrc,
} from "./components/DirectorBeatRenderer";
import { PresenterDepthStage } from "./components/glass/PresenterDepthStage";
import { MusicBed, SpeechRange } from "./components/MusicBed";
import { TreasuryOverlayCard } from "./compositions/TreasuryOverlayCard";
import { TreasuryTable9Scene } from "./compositions/TreasuryTable9Scene";
import { FONTS } from "./design/fonts";
import { OVER_FOOTAGE_PALETTE, PAGE_PALETTE } from "./design/tokens";
import { Cinema16PillarShowcase, StudioShowcase } from "./scenes/StudioShowcase";

export type EpisodeMasterProps = {
  plan?: {
    title?: string;
    fps?: number;
    totalFrames?: number;
    beats?: FlexibleBeatInput[];
    musicStem?: string;
    musicStemId?: string;
    lutId?: string;
  };
  planPath?: string;
  cameraSrc?: string;
  presenterAlphaSrc?: string;
  personMaskSrc?: string;
  musicStem?: string;
  renderAudio?: boolean;
  resolution?: "1080p" | "4k" | string;
};

export const DEFAULT_EPISODE_MASTER_PLAN: DirectorPlan = {
  title: "Reading Room Cinema — Episode 01 Standalone Preview",
  fps: 30,
  totalFrames: 540,
  musicStemId: "02-ledger-investigation",
  lutId: "editorial-warm",
  beats: [
    normalizeDirectorBeat({
      id: "ep-beat-001",
      startFrame: 0,
      endFrame: 90,
      durationSec: 3,
      category: "hook",
      spokenText:
        "Over 84.1% of federal taxes come from individual paychecks while national debt hits $40.5T.",
      framing: "talking-head-with-glass",
      paletteMode: "over-footage",
      styleFamily: "liquid-glass",
      recipeId: "glass-dossier-stack",
      componentHint: "LiquidGlassObject:card",
      glassPreset: "card",
      glassRig: "dossier-stack",
      typographyMode: "behind-presenter-monolith",
      depthSandwich: {
        enabled: true,
        preset: "behind-shoulder-billboard",
        heroFigure: "$40.5T",
        foregroundGlass: true,
      },
      layering: "behind-presenter",
      propIds: ["DebtMonolithWall"],
      motionAction: "slide-left -> glow-rim -> fade-blur-out",
      sfxCues: [{ cue: "glass-enter", offsetFrame: 0, volume: 0.64 }],
      musicEnergy: "pulse",
      cutReason: "Opening Depth-Sandwich claim-vs-receipt collision",
      sourceCitation: "U.S. Treasury Monthly Statement, Table 9",
    }),
    normalizeDirectorBeat({
      id: "ep-beat-002",
      startFrame: 90,
      endFrame: 180,
      durationSec: 3,
      category: "metaphor-story",
      spokenText:
        "When AI vaporizes intermediate labor on a $120 running shoe, unit prices fall toward electricity cost.",
      framing: "fullscreen-cutaway",
      paletteMode: "page",
      styleFamily: "diagram-metaphor",
      recipeId: "setpiece-bom-vaporizer",
      setPieceId: "SP01_SHOE_LABOR_VAPORIZER",
      componentHint: "IsometricScene",
      motionAction: "isometric-rise -> gear-mesh-cw -> fade-blur-out",
      sfxCues: [{ cue: "hydraulic-press", offsetFrame: 0, volume: 0.6 }],
      musicEnergy: "calm",
      cutReason: "Signature physics contraption cutaway",
    }),
    normalizeDirectorBeat({
      id: "ep-beat-003",
      startFrame: 180,
      endFrame: 270,
      durationSec: 3,
      category: "thesis-promise",
      spokenText:
        "Yet household mortgages stay locked in nominal dollars for thirty years.",
      framing: "talking-head-full",
      paletteMode: "over-footage",
      styleFamily: "liquid-glass",
      componentHint: "LiquidGlassObject:card",
      motionAction: "slide-up -> float-idle -> fade-out",
      sfxCues: [],
      musicEnergy: "drop-silence",
      cutReason: "Quiet presenter room breath before grid shock",
    }),
    normalizeDirectorBeat({
      id: "ep-beat-004",
      startFrame: 270,
      endFrame: 360,
      durationSec: 3,
      category: "map-geopolitics",
      spokenText:
        "Across thirteen states on the PJM eastern grid, capacity auction prices spiked 833%.",
      framing: "fullscreen-cutaway",
      paletteMode: "page",
      styleFamily: "data-maps-3d",
      recipeId: "data-map-explainer",
      componentHint: "MapExplainer",
      geoQuery: "PJM thirteen states eastern grid",
      geoCorridor: "PJM_GRID",
      motionAction: "blur-snap -> circle-telestrator -> fade-out",
      sfxCues: [{ cue: "map-whoosh", offsetFrame: 0, volume: 0.62 }],
      musicEnergy: "tense",
      cutReason: "Dynamic corridor cartography cutaway",
      sourceCitation: "PJM Interconnection 2025/2026 Capacity Auction",
    }),
    normalizeDirectorBeat({
      id: "ep-beat-005",
      startFrame: 360,
      endFrame: 450,
      durationSec: 3,
      category: "history-archive",
      spokenText:
        "In Wielechowski v. State, one governor's veto pen sliced Alaska's dividend check in half.",
      framing: "fullscreen-cutaway",
      paletteMode: "page",
      styleFamily: "doc-broadcast",
      recipeId: "SupremeCourtSyllabusStage",
      componentHint: "CaptionNewsCard",
      motionAction: "paper-unfold -> ink-highlighter-double -> fade-out",
      sfxCues: [{ cue: "gavel-wood-hit", offsetFrame: 0, volume: 0.64 }],
      musicEnergy: "tense",
      cutReason: "Primary-source judicial syllabus exhibit",
      sourceCitation: "Alaska Supreme Court (2016)",
    }),
    normalizeDirectorBeat({
      id: "ep-beat-006",
      startFrame: 450,
      endFrame: 540,
      durationSec: 3,
      category: "takeaway",
      spokenText:
        "Money you cannot negotiate is no longer a paycheck. We call that an allowance.",
      framing: "fullscreen-cutaway",
      paletteMode: "page",
      styleFamily: "vintage-editorial",
      recipeId: "UnwrittenTruceToAllowance",
      componentHint: "SilentFilmCard",
      motionAction: "wax-seal-press -> veto-ink-slash -> fade-out",
      sfxCues: [{ cue: "fountain-pen-slash", offsetFrame: 0, volume: 0.66 }],
      musicEnergy: "drop-silence",
      cutReason: "Bookend verdict close",
    }),
  ],
};

function computePlanTotalFrames(plan?: EpisodeMasterProps["plan"]): {
  fps: number;
  durationInFrames: number;
} {
  const fps = Math.max(1, Math.round(Number(plan?.fps) || 30));
  const rawBeats = Array.isArray(plan?.beats) ? plan.beats : DEFAULT_EPISODE_MASTER_PLAN.beats;
  let maxEndFrame = Number(plan?.totalFrames) || 0;
  for (let i = 0; i < rawBeats.length; i++) {
    const b = rawBeats[i];
    const sf = Math.max(0, Math.round(Number(b.startFrame) || 0));
    const ef = Math.max(
      sf + 1,
      Math.round(Number(b.endFrame) || sf + Math.round((Number(b.durationSec) || 4) * fps))
    );
    if (ef > maxEndFrame) maxEndFrame = ef;
  }
  return {
    fps,
    durationInFrames: Math.max(30, maxEndFrame || DEFAULT_EPISODE_MASTER_PLAN.totalFrames),
  };
}

const calculateDirectorBeatMetadata: CalculateMetadataFunction<
  DirectorBeatRendererProps
> = ({ props }) => {
  const beat = normalizeDirectorBeat(props?.beat ?? DEFAULT_DIRECTOR_BEAT);
  const frameSpan = (beat.endFrame ?? 0) - (beat.startFrame ?? 0);
  const durationInFrames = Math.max(
    1,
    frameSpan > 0 ? frameSpan : Math.round((beat.durationSec || 5) * 30)
  );
  return {
    durationInFrames,
    fps: 30,
    width: 1920,
    height: 1080,
  };
};

const calculateEpisodeMasterMetadata: CalculateMetadataFunction<EpisodeMasterProps> = ({
  props,
}) => {
  const { fps, durationInFrames } = computePlanTotalFrames(props?.plan);
  return {
    durationInFrames,
    fps,
    width: 1920,
    height: 1080,
  };
};

const calculateEpisodeMaster4KMetadata: CalculateMetadataFunction<EpisodeMasterProps> = ({
  props,
}) => {
  const { fps, durationInFrames } = computePlanTotalFrames(props?.plan);
  return {
    durationInFrames,
    fps,
    width: 3840,
    height: 2160,
  };
};

function computeCameraTransformForBeat(
  beat: DirectorBeat | undefined,
  localFrame: number,
  beatFrames: number
): string {
  if (!beat || beat.framing === "fullscreen-cutaway") {
    return "scale(1)";
  }
  const ramp = Math.max(1, Math.min(12, Math.floor(beatFrames * 0.35)));
  if (beat.framing === "talking-head-punch-in") {
    const s = interpolate(localFrame, [0, ramp], [1.0, 1.12], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const ty = interpolate(localFrame, [0, ramp], [0, -18], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
  }
  if (beat.framing === "split-screen") {
    const tx = interpolate(localFrame, [0, ramp], [0, -220], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return `translate3d(${tx.toFixed(1)}px, 0, 0) scale(1.04)`;
  }
  const creep = interpolate(localFrame, [0, Math.max(1, beatFrames)], [1.0, 1.038], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return `scale(${creep.toFixed(4)})`;
}

/**
 * Pillar #16 — ReadingRoomEpisodeMaster (1920x1080 @ 30fps)
 * Complete standalone episode compositor sequencing every beat across A-roll /
 * 4-plane PresenterDepthStage, 5-register cutaways, 18 smoked-navy glass rigs,
 * 96-cue foley hits, and continuous speech-ducked documentary score.
 */
export const ReadingRoomEpisodeMaster: React.FC<EpisodeMasterProps> = ({
  plan,
  cameraSrc,
  presenterAlphaSrc,
  personMaskSrc,
  musicStem,
  renderAudio = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const normalizedBeats: DirectorBeat[] = useMemo(() => {
    const raw =
      plan?.beats && plan.beats.length > 0 ? plan.beats : DEFAULT_EPISODE_MASTER_PLAN.beats;
    return raw.map((b) => normalizeDirectorBeat(b));
  }, [plan]);

  const playableCamera = resolvePlayableMediaSrc(cameraSrc);
  const playableAlpha = resolvePlayableMediaSrc(presenterAlphaSrc);
  const playableMask = resolvePlayableMediaSrc(personMaskSrc);

  const activeBeatInfo = useMemo(() => {
    for (let i = 0; i < normalizedBeats.length; i++) {
      const b = normalizedBeats[i];
      if (frame >= b.startFrame && frame < b.endFrame) {
        return {
          beat: b,
          localFrame: frame - b.startFrame,
          beatFrames: Math.max(1, b.endFrame - b.startFrame),
        };
      }
    }
    const last = normalizedBeats[normalizedBeats.length - 1];
    return {
      beat: last,
      localFrame: 0,
      beatFrames: last ? Math.max(1, last.endFrame - last.startFrame) : 90,
    };
  }, [frame, normalizedBeats]);

  const speechRanges: SpeechRange[] = useMemo(() => {
    const ranges: SpeechRange[] = [];
    for (let i = 0; i < normalizedBeats.length; i++) {
      const b = normalizedBeats[i];
      if (b.spokenText && b.spokenText.trim().length > 0) {
        ranges.push({
          startFrame: Math.max(0, b.startFrame),
          endFrame: Math.max(b.startFrame + 1, b.endFrame),
        });
      }
    }
    return ranges;
  }, [normalizedBeats]);

  const activeMusicStem =
    musicStem ||
    plan?.musicStemId ||
    plan?.musicStem ||
    DEFAULT_EPISODE_MASTER_PLAN.musicStemId ||
    "02-ledger-investigation";

  const spineTransform = computeCameraTransformForBeat(
    activeBeatInfo.beat,
    activeBeatInfo.localFrame,
    activeBeatInfo.beatFrames
  );

  return (
    <AbsoluteFill style={{ backgroundColor: PAGE_PALETTE.navyDeep, overflow: "hidden" }}>
      {/* Continuous Spine V1: Playable A-Roll Video OR Simulated Presenter Studio Stage */}
      <AbsoluteFill
        style={{
          transform: spineTransform,
          transformOrigin: "center center",
        }}
      >
        {playableCamera ? (
          <Video
            src={playableCamera}
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <PresenterDepthStage mode="simulated-depth" preset="behind-shoulder-billboard" />
        )}
      </AbsoluteFill>

      {/* Sequenced Timeline Beats (V2-V4 Cutaways, Depth-Sandwich & Smoked-Navy Glass) */}
      {normalizedBeats.map((beat) => {
        const beatFrames = Math.max(1, beat.endFrame - beat.startFrame);

        if (beat.framing === "talking-head-full") {
          return (
            <Sequence
              key={beat.id}
              from={Math.max(0, beat.startFrame)}
              durationInFrames={beatFrames}
            >
              {beat.spokenText && (
                <div
                  style={{
                    position: "absolute",
                    left: "96px",
                    bottom: "58px",
                    maxWidth: "860px",
                    padding: "12px 22px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(15, 25, 35, 0.76)",
                    border: `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`,
                    borderLeft: `3px solid ${OVER_FOOTAGE_PALETTE.accentWarm}`,
                    fontFamily: FONTS.sans,
                    fontSize: "19px",
                    fontWeight: 500,
                    lineHeight: 1.45,
                    color: OVER_FOOTAGE_PALETTE.textHeadline,
                    textShadow: OVER_FOOTAGE_PALETTE.textShadow,
                  }}
                >
                  {beat.spokenText}
                </div>
              )}
            </Sequence>
          );
        }

        const isFullscreen = beat.framing === "fullscreen-cutaway";
        const isDepthBeat =
          Boolean(beat.depthSandwich) ||
          beat.layering === "behind-presenter" ||
          beat.typographyMode === "behind-presenter-monolith";

        return (
          <Sequence
            key={beat.id}
            from={Math.max(0, beat.startFrame)}
            durationInFrames={beatFrames}
          >
            <DirectorBeatRenderer
              beat={beat}
              previewMode={
                isFullscreen
                  ? "light-editorial"
                  : isDepthBeat
                    ? "simulated-room"
                    : "transparent"
              }
              depthMode={
                !isFullscreen && isDepthBeat
                  ? playableCamera || playableAlpha
                    ? "masked-video"
                    : "simulated-depth"
                  : undefined
              }
              cameraSrc={playableCamera}
              presenterAlphaSrc={playableAlpha}
              personMaskSrc={playableMask}
              renderAudio={renderAudio}
            />
          </Sequence>
        );
      })}

      {/* Continuous A3 Documentary Score Stem with Cosine Speech-Range Ducking */}
      {renderAudio && durationInFrames > 0 && fps > 0 && (
        <MusicBed
          trackId={activeMusicStem}
          from={0}
          durationInFrames={durationInFrames}
          loop={true}
          baseVolume={0.24}
          duckVolume={0.055}
          speechRanges={speechRanges}
        />
      )}
    </AbsoluteFill>
  );
};

/**
 * Pillar #16 — ReadingRoomEpisodeMaster4K (3840x2160 @ 30fps)
 * Crisp vector/DOM 2x scale compositor preserving 1920x1080 logical layout coordinates
 * via `<Sequence width={1920} height={1080} />` while rasterizing at native 3840x2160 UHD.
 */
export const ReadingRoomEpisodeMaster4K: React.FC<EpisodeMasterProps> = (props) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        width: 3840,
        height: 2160,
        backgroundColor: PAGE_PALETTE.navyDeep,
        overflow: "hidden",
      }}
    >
      <Sequence
        durationInFrames={durationInFrames}
        width={1920}
        height={1080}
        style={{
          width: 1920,
          height: 1080,
          transform: "scale(2)",
          transformOrigin: "top left",
        }}
      >
        <ReadingRoomEpisodeMaster {...props} resolution="4k" />
      </Sequence>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Full-Screen 15-second Investigative Documentary Scene */}
      <Composition
        id="TreasuryTable9-Full"
        component={TreasuryTable9Scene}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Alias ID for TreasuryTable9 */}
      <Composition
        id="TreasuryTable9"
        component={TreasuryTable9Scene}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 2. Transparent 10-second PiP Overlay Card for Video Editor Composite */}
      <Composition
        id="TreasuryTable9-Overlay"
        component={TreasuryOverlayCard}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 3. Studio Interactive Showcase (600 frames = 20s @ 30fps) */}
      <Composition
        id="StudioShowcase"
        component={StudioShowcase}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 4. Parameterized Director Beat Renderer (ProRes 4444 / VP9 / MP4 / Depth-Sandwich) */}
      <Composition
        id="DirectorBeat"
        component={DirectorBeatRenderer}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          beat: DEFAULT_DIRECTOR_BEAT,
          previewMode: "simulated-room",
        }}
        calculateMetadata={calculateDirectorBeatMetadata}
      />

      {/* 5. Pillar #16 Standalone 1080p Full-Episode Master Compositor */}
      <Composition
        id="ReadingRoomEpisodeMaster"
        component={ReadingRoomEpisodeMaster}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          plan: DEFAULT_EPISODE_MASTER_PLAN,
          renderAudio: true,
          resolution: "1080p",
        }}
        calculateMetadata={calculateEpisodeMasterMetadata}
      />

      {/* 6. Pillar #16 Standalone 4K (3840x2160) Full-Episode Master Compositor */}
      <Composition
        id="ReadingRoomEpisodeMaster4K"
        component={ReadingRoomEpisodeMaster4K}
        durationInFrames={540}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          plan: DEFAULT_EPISODE_MASTER_PLAN,
          renderAudio: true,
          resolution: "4k",
        }}
        calculateMetadata={calculateEpisodeMaster4KMetadata}
      />

      {/* 7. Cinema 16-Pillar Flagship Inspection Showcase (540f = 18s @ 30fps) */}
      <Composition
        id="Cinema16PillarShowcase"
        component={Cinema16PillarShowcase}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
