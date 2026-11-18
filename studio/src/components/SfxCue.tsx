import React, { useMemo } from "react";
import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";
import {
  filterByMinOnsetSpacing,
  isValidSfxCue,
  resolveSfxCue,
  SFX_IDS,
  SFX_VARIANT_FAMILIES,
  SOUND_REGISTRY,
  type LegacySfxId,
  type SfxAcousticFamily,
  type SfxCueId,
  type SfxVariantFamilyBase,
} from "../audio/soundRegistry";

export {
  filterByMinOnsetSpacing,
  isValidSfxCue,
  resolveSfxCue,
  SFX_IDS,
  SFX_VARIANT_FAMILIES,
  SOUND_REGISTRY,
};
export type { LegacySfxId, SfxAcousticFamily, SfxCueId, SfxVariantFamilyBase };

/** All 96 procedural 48kHz Studio Foley cue identifiers (superset of original 20 cues). */
export type SfxName = SfxCueId;

/** Minimum onset spacing in milliseconds (72ms = max ~13.8 hits/sec) to prevent robotic chatter. */
export const MIN_SFX_ONSET_SPACING_MS = 72;

export function getMinOnsetSpacingFrames(
  fps: number,
  minSpacingMs: number = MIN_SFX_ONSET_SPACING_MS
): number {
  const safeFps = fps > 0 ? fps : 30;
  return Math.max(1, Math.ceil((Math.max(0, minSpacingMs) / 1000) * safeFps));
}

export interface SfxCueProps {
  /** Canonical SFX cue ID (or legacy/underscored alias resolved deterministically). */
  cue: SfxName | (string & {});
  /** Frame offset within the active sequence/composition (default 0). */
  atFrame?: number;
  /** Playback gain or frame-driven volume callback (default from SOUND_REGISTRY or 0.7). */
  volume?: number | ((frame: number) => number);
  /** Playback rate multiplier (default 1.0). */
  playbackRate?: number;
  /** Optional deterministic seed (number or string) for `_v1.._v4` variant selection. */
  seed?: number | string;
  /** Rotate across `_v1.._v4` detuned micro-variants via `(seed + frame) % 4` (default true). */
  useVariants?: boolean;
  /** Optional previous onset frame in the same cue family to enforce the 72ms spacing guard. */
  lastOnsetFrame?: number;
  /** Minimum onset spacing in milliseconds when `lastOnsetFrame` is supplied (default 72ms). */
  minOnsetSpacingMs?: number;
}

/**
 * Deterministic 96-cue Studio Foley trigger with `(seed + frame) % 4` variant selection
 * and 72ms minimum onset spacing guard.
 */
export const SfxCue: React.FC<SfxCueProps> = ({
  cue,
  atFrame = 0,
  volume = 0.7,
  playbackRate = 1.0,
  seed,
  useVariants = true,
  lastOnsetFrame,
  minOnsetSpacingMs = MIN_SFX_ONSET_SPACING_MS,
}) => {
  const { fps } = useVideoConfig();
  const safeAtFrame = Math.max(0, Math.floor(atFrame));

  const resolvedCueId = useMemo(
    () =>
      resolveSfxCue(String(cue), {
        seed,
        frame: safeAtFrame,
        enableVariants: useVariants,
      }),
    [cue, seed, safeAtFrame, useVariants]
  );

  if (lastOnsetFrame !== undefined && minOnsetSpacingMs > 0) {
    const minFrames = getMinOnsetSpacingFrames(fps, minOnsetSpacingMs);
    if (Math.abs(safeAtFrame - lastOnsetFrame) < minFrames) {
      return null;
    }
  }

  return (
    <Audio
      src={staticFile(`sfx/${resolvedCueId}.wav`)}
      from={safeAtFrame}
      volume={volume}
      playbackRate={playbackRate}
    />
  );
};

export interface SfxTimelineItem {
  cue: SfxName | (string & {});
  frame: number;
  volume?: number;
  playbackRate?: number;
  seed?: number | string;
  useVariants?: boolean;
}

export interface SfxTimelineProps {
  cues: SfxTimelineItem[];
  masterVolume?: number;
  /** Seed mixed with item index & frame for deterministic variant rotation across multi-hit bursts. */
  seed?: number | string;
  /** Minimum onset spacing guard in milliseconds per cue family (default 72ms). */
  minOnsetSpacingMs?: number;
}

/**
 * Choreographed multi-cue timeline renderer with automatic 72ms onset spacing guard
 * and deterministic `_v1.._v4` micro-variant rotation.
 */
export const SfxTimeline: React.FC<SfxTimelineProps> = ({
  cues,
  masterVolume = 1.0,
  seed,
  minOnsetSpacingMs = MIN_SFX_ONSET_SPACING_MS,
}) => {
  const { fps } = useVideoConfig();

  const spacedCues = useMemo(
    () =>
      minOnsetSpacingMs > 0
        ? filterByMinOnsetSpacing(cues, fps, minOnsetSpacingMs)
        : cues,
    [cues, fps, minOnsetSpacingMs]
  );

  return (
    <>
      {spacedCues.map((item, idx) => {
        const effectiveSeed =
          item.seed !== undefined
            ? item.seed
            : seed !== undefined
            ? `${String(seed)}:${idx}`
            : idx;
        return (
          <SfxCue
            key={`${item.cue}-${item.frame}-${idx}`}
            cue={item.cue}
            atFrame={item.frame}
            volume={(item.volume ?? 0.7) * masterVolume}
            playbackRate={item.playbackRate ?? 1.0}
            seed={effectiveSeed}
            useVariants={item.useVariants ?? true}
          />
        );
      })}
    </>
  );
};
