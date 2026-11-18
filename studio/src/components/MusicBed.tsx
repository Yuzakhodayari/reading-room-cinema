import React, { useMemo } from "react";
import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";
import {
  DEFAULT_MUSIC_STEM_ID,
  MUSIC_STEM_IDS,
  MUSIC_STEM_REGISTRY,
  resolveMusicStem,
  type MusicEnergyLevel,
  type MusicMood,
  type MusicStemEntry,
  type MusicStemId,
} from "../audio/soundRegistry";

export {
  DEFAULT_MUSIC_STEM_ID,
  MUSIC_STEM_IDS,
  MUSIC_STEM_REGISTRY,
  resolveMusicStem,
};
export type { MusicEnergyLevel, MusicMood, MusicStemEntry, MusicStemId };

export interface SpeechRange {
  startFrame: number;
  endFrame: number;
}

export interface MusicBedProps {
  /** Explicit path under studio/public/ or URL/staticFile result (overrides trackId/mood when set). */
  src?: string;
  /** Bundled documentary stem ID (defaults to `"02-ledger-investigation"` -> `music/02-ledger-investigation.wav`). */
  trackId?: MusicStemId | (string & {});
  /** Shorthand alias for `trackId` or relative stem path. */
  track?: MusicStemId | (string & {});
  /** Documentary mood selector (`"investigative"`, `"archival"`, `"telemetry"`, `"clockwork"`, `"subsea"`, etc.). */
  mood?: MusicMood | (string & {});
  /** Director beat energy selector (`"calm"`, `"pulse"`, `"tense"`, `"drop-silence"`). */
  musicEnergy?: MusicEnergyLevel | (string & {});
  /** Optional subject domain hint for stem auto-matching (`"treasury"`, `"grid"`, `"subsea"`, etc.). */
  domain?: string;
  /** Composition frame where the music bed begins (default 0). */
  from?: number;
  /** Duration in frames (defaults to remaining composition duration). */
  durationInFrames?: number;
  /** Loop the 8.0s equal-power crossfaded stem seamlessly across arbitrary video lengths (default true). */
  loop?: boolean;
  /** Un-ducked volume in [0, 1] (default 0.25). */
  baseVolume?: number;
  /** Ducked volume while speech is active (default 0.06). */
  duckVolume?: number;
  /** Composition-frame speech intervals during which the bed ducks smoothly. */
  speechRanges?: SpeechRange[];
  /** Frames before speech start to ramp down into duckVolume (default 8). */
  attackFrames?: number;
  /** Frames after speech end to ramp back up to baseVolume (default 8). */
  releaseFrames?: number;
  /** Fade-in length in frames at bed start (default 24). */
  fadeInFrames?: number;
  /** Fade-out length in frames at bed end (default 30). */
  fadeOutFrames?: number;
  /** Playback speed multiplier (default 1.0). */
  playbackRate?: number;
}

function smoothCosine(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 0.5 * (1 - Math.cos(Math.PI * clamped));
}

export function resolveMusicBedSrc(options: {
  src?: string;
  trackId?: string;
  track?: string;
  mood?: string;
  musicEnergy?: string;
  domain?: string;
}): string {
  const { src, trackId, track, mood, musicEnergy, domain } = options;
  if (src) {
    if (/^(https?:|data:|blob:|\/)/.test(src)) {
      return src;
    }
    return staticFile(src);
  }

  const explicitTrack = trackId || track;
  if (explicitTrack && /\.(wav|mp3|ogg|m4a|aac)$/i.test(explicitTrack) && explicitTrack.indexOf("/") !== -1) {
    if (/^(https?:|data:|blob:|\/)/.test(explicitTrack)) {
      return explicitTrack;
    }
    return staticFile(explicitTrack);
  }

  const entry = resolveMusicStem({
    trackId: trackId ? String(trackId) : undefined,
    track: track ? String(track) : undefined,
    mood: mood ? String(mood) : undefined,
    musicEnergy: musicEnergy ? String(musicEnergy) : undefined,
    domain,
  });
  return staticFile(entry.path);
}

/**
 * Compute music bed volume at a given composition frame with smooth cosine attack/release
 * speech ducking and bed-level fade-in/out.
 */
export function computeMusicBedVolume(
  globalFrame: number,
  options: {
    from: number;
    durationInFrames: number;
    baseVolume: number;
    duckVolume: number;
    speechRanges: SpeechRange[];
    attackFrames: number;
    releaseFrames: number;
    fadeInFrames: number;
    fadeOutFrames: number;
  }
): number {
  const {
    from,
    durationInFrames,
    baseVolume,
    duckVolume,
    speechRanges,
    attackFrames,
    releaseFrames,
    fadeInFrames,
    fadeOutFrames,
  } = options;

  const localFrame = globalFrame - from;
  if (localFrame < 0 || localFrame >= durationInFrames) {
    return 0;
  }

  let duckFactor = 0;
  for (const range of speechRanges) {
    const { startFrame, endFrame } = range;
    if (endFrame < startFrame) continue;

    if (globalFrame >= startFrame && globalFrame <= endFrame) {
      duckFactor = 1;
      break;
    }

    if (attackFrames > 0 && globalFrame >= startFrame - attackFrames && globalFrame < startFrame) {
      const progress = (globalFrame - (startFrame - attackFrames)) / attackFrames;
      duckFactor = Math.max(duckFactor, smoothCosine(progress));
    } else if (
      releaseFrames > 0 &&
      globalFrame > endFrame &&
      globalFrame <= endFrame + releaseFrames
    ) {
      const progress = 1 - (globalFrame - endFrame) / releaseFrames;
      duckFactor = Math.max(duckFactor, smoothCosine(progress));
    }
  }

  const duckedLevel = baseVolume + (duckVolume - baseVolume) * duckFactor;

  let edgeEnvelope = 1;
  if (fadeInFrames > 0 && localFrame < fadeInFrames) {
    edgeEnvelope = Math.min(edgeEnvelope, smoothCosine(localFrame / fadeInFrames));
  }
  if (fadeOutFrames > 0 && localFrame > durationInFrames - fadeOutFrames) {
    const remaining = Math.max(0, durationInFrames - localFrame);
    edgeEnvelope = Math.min(edgeEnvelope, smoothCosine(remaining / fadeOutFrames));
  }

  return Math.max(0, Math.min(1, duckedLevel * edgeEnvelope));
}

/**
 * Remotion documentary score bed defaulting to bundled `music/02-ledger-investigation.wav`
 * (or any of the 12 stems via `trackId`, `track`, `mood`, or `musicEnergy`), looping seamlessly
 * across arbitrary video durations with smooth cosine speech-range ducking.
 */
export const MusicBed: React.FC<MusicBedProps> = ({
  src,
  trackId,
  track,
  mood,
  musicEnergy,
  domain,
  from = 0,
  durationInFrames,
  loop = true,
  baseVolume = 0.25,
  duckVolume = 0.06,
  speechRanges = [],
  attackFrames = 8,
  releaseFrames = 8,
  fadeInFrames = 24,
  fadeOutFrames = 30,
  playbackRate = 1.0,
}) => {
  const { durationInFrames: compDuration } = useVideoConfig();
  const effectiveDuration = durationInFrames ?? Math.max(1, compDuration - from);
  const resolvedSrc = useMemo(
    () =>
      resolveMusicBedSrc({
        src,
        trackId: trackId ? String(trackId) : undefined,
        track: track ? String(track) : undefined,
        mood: mood ? String(mood) : undefined,
        musicEnergy: musicEnergy ? String(musicEnergy) : undefined,
        domain,
      }),
    [src, trackId, track, mood, musicEnergy, domain]
  );

  return (
    <Audio
      src={resolvedSrc}
      from={from}
      durationInFrames={effectiveDuration}
      loop={loop}
      loopVolumeCurveBehavior="extend"
      playbackRate={playbackRate}
      volume={(localFrame) =>
        computeMusicBedVolume(from + localFrame, {
          from,
          durationInFrames: effectiveDuration,
          baseVolume,
          duckVolume,
          speechRanges,
          attackFrames,
          releaseFrames,
          fadeInFrames,
          fadeOutFrames,
        })
      }
    />
  );
};
