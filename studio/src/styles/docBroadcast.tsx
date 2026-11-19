import React from "react";
import { noise2D } from "@remotion/noise";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EditorialBackdrop } from "../components/EditorialBackdrop";
import { SfxCue } from "../components/SfxCue";
import { SourceBadge } from "../components/SourceBadge";
import { fitAndBalanceText, formatTabularFigure } from "../design/fitText";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import { HighlighterStroke, ReadingRoomStage } from "../design/optics";
import {
  CINEMA_SPRINGS,
  COLORS,
  LAYOUT,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  REGISTERS,
  STYLE_FAMILIES,
} from "../design/tokens";
import type { DirectorTableRow } from "../director/schema";
import { PropVaultRenderer } from "../registry/props";

export type BroadcastPaletteMode = "page" | "over-footage";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// ============================================================================
// 1. NewsPackageLowerThird (Over Footage Navy Glass Bar + Page Monitor Mode)
// ============================================================================
export interface NewsPackageLowerThirdProps {
  title: string;
  source: string;
  category?: string;
  mode?: "LIVE" | "ANALYSIS" | "REPLAY";
  subheadline?: string;
  metricBadge?: string;
  timestamp?: string;
  paletteMode?: BroadcastPaletteMode;
  enableSfx?: boolean;
  atFrame?: number;
}

export const NewsPackageLowerThird: React.FC<NewsPackageLowerThirdProps> = ({
  title,
  source,
  category = "Fiscal Report",
  mode = "ANALYSIS",
  subheadline,
  metricBadge,
  timestamp,
  paletteMode = "over-footage",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const enter = spring({
    frame: elapsed,
    fps,
    config: CINEMA_SPRINGS.editorialSnap,
  });

  const modeColors = {
    LIVE: OVER_FOOTAGE_PALETTE.brickRedText,
    ANALYSIS: OVER_FOOTAGE_PALETTE.accentPrimary,
    REPLAY: OVER_FOOTAGE_PALETTE.chartSecondary,
  };

  if (paletteMode === "page") {
    const fittedTitle = fitAndBalanceText({
      text: title,
      fontFamily: "serif",
      fontWeight: 700,
      maxWidth: 1120,
      maxHeight: 160,
      maxLines: 2,
      minFontSize: 38,
      maxFontSize: 58,
    });

    return (
      <ReadingRoomStage
        register="page_editorial"
        chapterTitle={category}
        folioLabel={`${mode} DISPATCH${timestamp ? ` · ${timestamp}` : ""}`}
        sourceCitation={source}
        cameraMove="static"
      >
        <div
          style={{
            position: "absolute",
            left: LAYOUT.safeMargin,
            right: LAYOUT.safeMargin,
            top: 132,
            bottom: 108,
            display: "grid",
            gridTemplateRows: "1fr auto",
            gap: "28px",
            opacity: enter,
            transform: `translate3d(0, ${((1 - enter) * 24).toFixed(2)}px, 0)`,
            userSelect: "none",
          }}
        >
          <div
            style={{
              backgroundColor: PAGE_PALETTE.paper,
              border: `1.5px solid ${PAGE_PALETTE.navy}`,
              borderRadius: "14px",
              padding: "52px 60px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 20px 48px rgba(28, 43, 58, 0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span
                  style={{
                    backgroundColor: mode === "LIVE" ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy,
                    color: PAGE_PALETTE.paperLight,
                    fontFamily: FONTS.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    padding: "5px 12px",
                    borderRadius: "5px",
                  }}
                >
                  {category}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: mode === "LIVE" ? PAGE_PALETTE.brickRed : PAGE_PALETTE.muted,
                    letterSpacing: "0.08em",
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  ● {mode}
                </span>
              </div>
              {metricBadge && (
                <div
                  style={{
                    backgroundColor: PAGE_PALETTE.riskFill,
                    border: `1.5px solid ${PAGE_PALETTE.riskBorder}`,
                    color: PAGE_PALETTE.brickRed,
                    fontFamily: FONTS.mono,
                    fontSize: "24px",
                    fontWeight: 700,
                    padding: "8px 18px",
                    borderRadius: "8px",
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {metricBadge}
                </div>
              )}
            </div>

            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: FONTS.serif,
                  fontSize: `${fittedTitle.fontSize}px`,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: PAGE_PALETTE.navy,
                }}
              >
                {fittedTitle.lines.join(" ")}
              </h1>
              {subheadline && (
                <p
                  style={{
                    margin: "18px 0 0 0",
                    fontFamily: FONTS.sans,
                    fontSize: "22px",
                    lineHeight: 1.5,
                    color: REGISTERS.page_editorial.ink.secondary,
                    maxWidth: "1240px",
                  }}
                >
                  {subheadline}
                </p>
              )}
            </div>

            <div
              style={{
                borderTop: `1px solid ${PAGE_PALETTE.paperBorder}`,
                paddingTop: "18px",
                display: "flex",
                justifyContent: "space-between",
                fontFamily: FONTS.mono,
                fontSize: "13px",
                color: REGISTERS.page_editorial.ink.muted,
                ...TABULAR_NUM_STYLE,
              }}
            >
              <span>PRIMARY RECORD · {source}</span>
              <span>{timestamp ?? "READING ROOM BROADCAST DESK"}</span>
            </div>
          </div>
        </div>
      </ReadingRoomStage>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: `${LAYOUT.overFootageSafeZones.bottomDock.bottom}px`,
        left: "64px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transform: `translate3d(0, ${((1 - enter) * 28).toFixed(2)}px, 0)`,
        opacity: enter,
        zIndex: 50,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            backgroundColor:
              mode === "LIVE" ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy,
            color: OVER_FOOTAGE_PALETTE.textHeadline,
            border: "1px solid rgba(250, 248, 243, 0.28)",
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: "6px",
            boxShadow: "0 6px 16px rgba(15, 25, 35, 0.35)",
          }}
        >
          {category}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "rgba(15, 25, 35, 0.52)",
            backdropFilter: "blur(9px) saturate(175%)",
            WebkitBackdropFilter: "blur(9px) saturate(175%)",
            border: `1px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontFamily: FONTS.mono,
            fontWeight: 700,
            color: OVER_FOOTAGE_PALETTE.textHeadline,
            textShadow: OVER_FOOTAGE_PALETTE.textShadow,
            ...TABULAR_NUM_STYLE,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: modeColors[mode],
            }}
          />
          {mode}
          {timestamp ? ` · ${timestamp}` : ""}
        </div>
        {metricBadge && (
          <div
            style={{
              backgroundColor: OVER_FOOTAGE_PALETTE.glassDarkWell,
              border: `1px solid ${OVER_FOOTAGE_PALETTE.accentPrimary}`,
              padding: "4px 12px",
              borderRadius: "6px",
              fontFamily: FONTS.mono,
              fontSize: "12px",
              fontWeight: 700,
              color: OVER_FOOTAGE_PALETTE.textHeadline,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {metricBadge}
          </div>
        )}
      </div>

      <div
        style={{
          position: "relative",
          background: OVER_FOOTAGE_PALETTE.glassPrimary,
          backdropFilter: "blur(12px) saturate(165%) brightness(0.68)",
          WebkitBackdropFilter: "blur(12px) saturate(165%) brightness(0.68)",
          border: `1.25px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
          borderLeft: `4px solid ${
            mode === "LIVE" ? PAGE_PALETTE.brickRed : OVER_FOOTAGE_PALETTE.accentPrimary
          }`,
          padding: "16px 26px",
          borderRadius: "14px",
          boxShadow:
            "0 20px 44px rgba(15, 25, 35, 0.42), inset 0 1px 2px rgba(250, 248, 243, 0.28)",
          maxWidth: "920px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: FONTS.sans,
            fontWeight: 700,
            fontSize: "24px",
            lineHeight: 1.25,
            color: OVER_FOOTAGE_PALETTE.textHeadline,
            textShadow: OVER_FOOTAGE_PALETTE.textShadow,
            ...TABULAR_NUM_STYLE,
          }}
        >
          {title}
        </div>
        {subheadline && (
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: "14.5px",
              color: OVER_FOOTAGE_PALETTE.textBody,
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            {subheadline}
          </div>
        )}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: FONTS.mono,
            fontSize: "12px",
            fontWeight: 500,
            color: OVER_FOOTAGE_PALETTE.textMuted,
            marginTop: "6px",
            textShadow: OVER_FOOTAGE_PALETTE.textShadow,
            ...TABULAR_NUM_STYLE,
          }}
        >
          Source · {source}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CaptionNewsCard (Editorial Summary Card + Full-Page Dispatch Stage)
// ============================================================================
export interface CaptionNewsCardProps {
  headline: string;
  body: string;
  dateline?: string;
  metric?: string;
  metricLabel?: string;
  bullets?: string[];
  tableRows?: DirectorTableRow[];
  propIds?: string[];
  sourceCitation?: string;
  paletteMode?: BroadcastPaletteMode;
  fullScene?: boolean;
  atFrame?: number;
}

export const CaptionNewsCard: React.FC<CaptionNewsCardProps> = ({
  headline,
  body,
  dateline = "Washington, D.C.",
  metric,
  metricLabel = "KEY FIGURE",
  bullets,
  tableRows,
  propIds,
  sourceCitation,
  paletteMode = "over-footage",
  fullScene = false,
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const enter = spring({
    frame: elapsed,
    fps,
    config: CINEMA_SPRINGS.editorialSnap,
  });

  const cleanMetric = metric?.replace(/\s+/g, " ").trim();
  const displayMetric =
    cleanMetric && cleanMetric.length > 0
      ? /\d/.test(cleanMetric) && cleanMetric.length <= 20
        ? formatTabularFigure(cleanMetric).formatted || cleanMetric
        : cleanMetric
      : undefined;

  if (paletteMode === "page" || fullScene) {
    const primaryPropId = propIds && propIds.length > 0 ? propIds[0] : undefined;
    const hasSideExhibit = Boolean(primaryPropId);
    const fittedHeadline = fitAndBalanceText({
      text: headline,
      fontFamily: "serif",
      fontWeight: 700,
      maxWidth: displayMetric ? 840 : 1140,
      maxHeight: 132,
      maxLines: 2,
      minFontSize: 32,
      maxFontSize: 50,
      lineHeight: 1.15,
    });
    const fittedMetric = displayMetric
      ? fitAndBalanceText({
          text: displayMetric,
          fontFamily: "mono",
          fontWeight: 800,
          maxWidth: 260,
          maxHeight: 56,
          maxLines: 1,
          minFontSize: 20,
          maxFontSize: 40,
          lineHeight: 1.08,
        })
      : null;

    const highlightSweep = interpolate(elapsed, [10, 32], [0, 1], CLAMP);

    const comparativeRows: DirectorTableRow[] =
      tableRows && tableRows.length > 0
        ? tableRows.slice(0, 4)
        : bullets && bullets.length > 0
          ? bullets.slice(0, 4).map((b, i) => ({
              label: `Record 0${i + 1}`,
              value: b,
              isHighlight: i === 0,
            }))
          : [
              ...(displayMetric
                ? [
                    {
                      label: metricLabel || "Reported Figure",
                      value: displayMetric,
                      delta: "Primary Metric",
                      isHighlight: true,
                    },
                  ]
                : []),
              {
                label: "Dossier Subject",
                value: headline,
                delta: dateline,
              },
              {
                label: "Primary Filing",
                value: sourceCitation || "Reading Room Editorial Archive",
                delta: "Verified Record",
              },
            ];

    return (
      <AbsoluteFill style={{ overflow: "hidden", fontFamily: FONTS.sans }}>
        <EditorialBackdrop
          driftSpeed={0.18}
          showGrid={true}
          tone="light"
          register="page_editorial"
        />

        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "52px 72px 86px 72px",
          }}
        >
          <div
            style={{
              width: "1320px",
              maxWidth: "100%",
              backgroundColor: COLORS.paper,
              color: COLORS.paperInk,
              borderRadius: "12px",
              border: `1px solid ${COLORS.paperBorder}`,
              boxShadow:
                "0 24px 52px -14px rgba(28, 43, 58, 0.16), 0 4px 16px rgba(28, 43, 58, 0.06)",
              padding: "44px 52px",
              position: "relative",
              overflow: "hidden",
              opacity: enter,
              transform: `translate3d(0, ${((1 - enter) * 28).toFixed(2)}px, 0)`,
              userSelect: "none",
            }}
          >
            {/* 4px Navy Top Accent Bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                backgroundColor: COLORS.navy,
              }}
            />

            {/* Masthead Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "32px",
                borderBottom: `2px solid ${COLORS.navy}`,
                paddingBottom: "20px",
                marginBottom: "26px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "12.5px",
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: PAGE_PALETTE.brickRed,
                    marginBottom: "8px",
                  }}
                >
                  {dateline} · EDITORIAL DOSSIER
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: FONTS.serif,
                    fontSize: `${fittedHeadline.fontSize}px`,
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "-0.015em",
                    color: COLORS.navy,
                  }}
                >
                  {fittedHeadline.lines.map((line, i) => (
                    <React.Fragment key={`cn-hl-${i}`}>
                      {i > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </h1>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "10px",
                  maxWidth: "300px",
                }}
              >
                <span
                  style={{
                    backgroundColor: COLORS.navy,
                    color: COLORS.paperLight,
                    fontFamily: FONTS.mono,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    padding: "5px 12px",
                    borderRadius: "5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  PRIMARY RECORD
                </span>

                {displayMetric && fittedMetric && (
                  <div
                    style={{
                      backgroundColor: COLORS.paperLight,
                      border: `1px solid ${COLORS.paperBorder}`,
                      borderLeft: `4px solid ${PAGE_PALETTE.brickRed}`,
                      borderRadius: "8px",
                      padding: "10px 16px",
                      textAlign: "right",
                      maxWidth: "280px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "10.5px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: REGISTERS.page_editorial.ink.muted,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {metricLabel}
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: `${fittedMetric.fontSize}px`,
                        fontWeight: 800,
                        color: COLORS.navy,
                        lineHeight: 1.1,
                        marginTop: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        ...TABULAR_NUM_STYLE,
                      }}
                    >
                      {displayMetric}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Body Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: hasSideExhibit ? "1.32fr 0.68fr" : "1fr",
                gap: "32px",
                alignItems: "stretch",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
                {/* Highlighted Prose Excerpt */}
                <div
                  style={{
                    backgroundColor: COLORS.paperLight,
                    border: `1px solid ${COLORS.paperBorder}`,
                    borderLeft: `4px solid ${PAGE_PALETTE.brickRed}`,
                    borderRadius: "8px",
                    padding: "22px 26px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "-6px",
                        top: "-3px",
                        pointerEvents: "none",
                      }}
                    >
                      <HighlighterStroke
                        width={185}
                        height={22}
                        progress={highlightSweep}
                        register="page_editorial"
                        seed={19}
                      />
                    </div>
                    <span
                      style={{
                        position: "relative",
                        fontFamily: FONTS.mono,
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        color: COLORS.navy,
                      }}
                    >
                      RECORDED EXCERPT
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontFamily: FONTS.sans,
                      fontSize: body.length > 210 ? "19.5px" : "22px",
                      fontWeight: 500,
                      lineHeight: 1.54,
                      color: COLORS.navy,
                      ...TABULAR_NUM_STYLE,
                    }}
                  >
                    {body}
                  </p>
                </div>

                {/* Comparative Figures / Table Rows Grid */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    borderTop: `1px solid ${COLORS.paperBorder}`,
                    paddingTop: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.1fr 1.2fr 0.7fr",
                      gap: "16px",
                      padding: "0 18px 4px 18px",
                      fontFamily: FONTS.mono,
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: REGISTERS.page_editorial.ink.muted,
                    }}
                  >
                    <span>LEDGER LINE</span>
                    <span>RECORDED VALUE</span>
                    <span style={{ textAlign: "right" }}>STATUS</span>
                  </div>

                  {comparativeRows.map((row, idx) => {
                    const rowProgress = interpolate(
                      elapsed,
                      [8 + idx * 5, 18 + idx * 5],
                      [0, 1],
                      CLAMP
                    );
                    const isFlag = Boolean(row.isFlagged);
                    const isHi = Boolean(row.isHighlight);
                    return (
                      <div
                        key={`cn-row-${idx}-${row.label}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.1fr 1.2fr 0.7fr",
                          gap: "16px",
                          alignItems: "center",
                          padding: "13px 18px",
                          borderRadius: "8px",
                          backgroundColor: isFlag
                            ? PAGE_PALETTE.riskFill
                            : isHi
                              ? "rgba(227, 194, 111, 0.18)"
                              : COLORS.paperLight,
                          border: `1px solid ${
                            isFlag ? PAGE_PALETTE.riskBorder : COLORS.paperBorder
                          }`,
                          opacity: rowProgress,
                          transform: `translate3d(0, ${((1 - rowProgress) * 10).toFixed(1)}px, 0)`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONTS.sans,
                            fontSize: "16px",
                            fontWeight: 700,
                            color: COLORS.navy,
                            minWidth: 0,
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          style={{
                            fontFamily: FONTS.mono,
                            fontSize: row.value.length > 26 ? "14.5px" : "18px",
                            fontWeight: 700,
                            color: isFlag ? PAGE_PALETTE.brickRed : COLORS.navy,
                            minWidth: 0,
                            ...TABULAR_NUM_STYLE,
                          }}
                        >
                          {row.value}
                        </span>
                        <span
                          style={{
                            fontFamily: FONTS.mono,
                            fontSize: "12px",
                            fontWeight: 700,
                            color: isFlag
                              ? PAGE_PALETTE.brickRed
                              : REGISTERS.page_editorial.ink.secondary,
                            textAlign: "right",
                            minWidth: 0,
                            ...TABULAR_NUM_STYLE,
                          }}
                        >
                          {row.delta || (isFlag ? "Flagged" : isHi ? "Primary" : "Logged")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasSideExhibit && primaryPropId && (
                <div
                  style={{
                    backgroundColor: COLORS.paperLight,
                    border: `1px solid ${COLORS.paperBorder}`,
                    borderRadius: "10px",
                    padding: "22px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: `1px solid ${COLORS.paperBorder}`,
                      paddingBottom: "8px",
                      fontFamily: FONTS.mono,
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: REGISTERS.page_editorial.ink.muted,
                    }}
                  >
                    <span>EXHIBIT SPECIMEN</span>
                    <span style={{ color: PAGE_PALETTE.brickRed }}>FIG. 01</span>
                  </div>

                  <PropVaultRenderer
                    propId={primaryPropId}
                    width={320}
                    height={230}
                    paletteMode="page"
                    frame={elapsed}
                  />

                  <div
                    style={{
                      width: "100%",
                      borderTop: `1px solid ${COLORS.paperBorder}`,
                      paddingTop: "10px",
                      fontFamily: FONTS.mono,
                      fontSize: "11.5px",
                      color: REGISTERS.page_editorial.ink.secondary,
                      textAlign: "center",
                      ...TABULAR_NUM_STYLE,
                    }}
                  >
                    {displayMetric ? `${metricLabel} · ${displayMetric}` : dateline}
                  </div>
                </div>
              )}
            </div>
          </div>
        </AbsoluteFill>

        <SourceBadge
          sourceText={sourceCitation || "Reading Room Editorial Archive"}
          paletteMode="page"
          startFrame={Math.max(0, atFrame + 8)}
        />
      </AbsoluteFill>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "64px",
        left: "64px",
        maxWidth: "520px",
        backgroundColor: COLORS.paperLight,
        border: `1px solid ${COLORS.paperBorder}`,
        borderTop: `3px solid ${COLORS.navy}`,
        borderRadius: "12px",
        padding: "28px 32px",
        boxShadow: "0 18px 40px rgba(28, 43, 58, 0.14)",
        transform: `translate3d(${((1 - enter) * -36).toFixed(2)}px, 0, 0)`,
        opacity: enter,
        zIndex: 45,
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            color: COLORS.brickRed,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {dateline}
        </span>
        {displayMetric && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "13px",
              fontWeight: 700,
              color: COLORS.navy,
              backgroundColor: COLORS.paper,
              padding: "2px 8px",
              borderRadius: "4px",
              border: `1px solid ${COLORS.paperBorder}`,
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              ...TABULAR_NUM_STYLE,
            }}
          >
            {displayMetric}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: FONTS.serif,
          fontSize: "24px",
          fontWeight: 700,
          color: COLORS.navy,
          lineHeight: 1.25,
          marginBottom: "10px",
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: "14.5px",
          color: COLORS.navy,
          lineHeight: 1.55,
          ...TABULAR_NUM_STYLE,
        }}
      >
        {body}
      </div>
      {bullets && bullets.length > 0 && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: `1px solid ${COLORS.paperBorder}`,
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          {bullets.slice(0, 3).map((item, idx) => (
            <div
              key={`c-bul-${idx}`}
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                color: REGISTERS.page_editorial.ink.secondary,
                ...TABULAR_NUM_STYLE,
              }}
            >
              · {item}
            </div>
          ))}
        </div>
      )}
      {sourceCitation && (
        <div
          style={{
            marginTop: "12px",
            fontFamily: FONTS.mono,
            fontSize: "11px",
            color: REGISTERS.page_editorial.ink.muted,
          }}
        >
          § {sourceCitation}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. VisualInvestigationBoard (Page Milk Evidence Desk + Connector Pins)
// ============================================================================
export interface InvestigationEvidenceItem {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  delta?: string;
  isFlagged?: boolean;
}

export interface VisualInvestigationBoardProps {
  evidenceItems: InvestigationEvidenceItem[];
  pointerTargetId?: string;
  boardTitle?: string;
  caseCode?: string;
  summaryNote?: string;
  sourceCitation?: string;
  paletteMode?: BroadcastPaletteMode;
  atFrame?: number;
}

export const VisualInvestigationBoard: React.FC<VisualInvestigationBoardProps> = ({
  evidenceItems,
  pointerTargetId,
  boardTitle = "Case Notes · Key Figures",
  caseCode = "EXHIBIT BOARD 01",
  summaryNote,
  sourceCitation,
  paletteMode = "page",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - atFrame);

  if (paletteMode === "over-footage") {
    const enter = spring({ frame: elapsed, fps, config: CINEMA_SPRINGS.editorialSnap });
    return (
      <div
        style={{
          position: "absolute",
          right: "64px",
          top: "108px",
          width: "560px",
          background: OVER_FOOTAGE_PALETTE.glassPrimary,
          backdropFilter: "blur(12px) saturate(165%) brightness(0.70)",
          WebkitBackdropFilter: "blur(12px) saturate(165%) brightness(0.70)",
          border: `1.25px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
          borderRadius: "16px",
          padding: "26px 28px",
          opacity: enter,
          transform: `translate3d(${((1 - enter) * 32).toFixed(2)}px, 0, 0)`,
          userSelect: "none",
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: OVER_FOOTAGE_PALETTE.brickRedText,
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          {boardTitle}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {evidenceItems.map((item) => {
            const isTarget = item.id === pointerTargetId || item.isFlagged;
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: isTarget
                    ? OVER_FOOTAGE_PALETTE.riskFill
                    : OVER_FOOTAGE_PALETTE.glassDarkWell,
                  border: `1px solid ${
                    isTarget ? OVER_FOOTAGE_PALETTE.riskBorder : OVER_FOOTAGE_PALETTE.glassInnerHairline
                  }`,
                  borderRadius: "10px",
                  padding: "14px 18px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isTarget ? OVER_FOOTAGE_PALETTE.brickRedText : OVER_FOOTAGE_PALETTE.textMuted,
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "26px",
                    fontWeight: 700,
                    color: OVER_FOOTAGE_PALETTE.textHeadline,
                    marginTop: "4px",
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const crossDissolveOpacity = elapsed < 4 ? 0.88 + (elapsed / 4) * 0.12 : 1.0;
  const luminanceDipAlpha = elapsed < 4 ? 0.14 * (1 - elapsed / 4) : 0;
  const connectorDraw = interpolate(elapsed, [10, 32], [0, 1], CLAMP);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.paperLight,
        opacity: crossDissolveOpacity,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {elapsed === 0 && <SfxCue cue="paper-slide" atFrame={atFrame} volume={0.6} />}

      {/* Subtle Page Coordinate Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${STYLE_FAMILIES.visualInvestigation.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${STYLE_FAMILIES.visualInvestigation.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Soft Milk Canvas Radial Depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 88% 82% at 50% 45%, rgba(250, 248, 243, 0.25) 0%, rgba(242, 240, 234, 0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {luminanceDipAlpha > 0.001 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(28, 43, 58, ${luminanceDipAlpha.toFixed(3)})`,
            pointerEvents: "none",
            zIndex: 80,
          }}
        />
      )}

      {/* Editorial Header & Case Metadata */}
      <div
        style={{
          position: "absolute",
          top: "48px",
          left: "72px",
          right: "72px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          borderBottom: `1px solid ${COLORS.paperBorder}`,
          paddingBottom: "14px",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "13px",
            fontWeight: 700,
            color: COLORS.brickRed,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          {boardTitle}
        </span>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "12px",
            fontWeight: 600,
            color: REGISTERS.page_editorial.ink.muted,
            letterSpacing: "0.1em",
            ...TABULAR_NUM_STYLE,
          }}
        >
          {caseCode}
        </span>
      </div>

      {/* SVG Evidence Connector Threads */}
      {evidenceItems.length >= 2 && (
        <svg
          viewBox="0 0 1920 1080"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <line
            x1={380}
            y1={235}
            x2={380 + 1160 * connectorDraw}
            y2={235}
            stroke={COLORS.brickRed}
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity={0.42}
          />
        </svg>
      )}

      {/* Evidence Items Container */}
      <div
        style={{
          position: "absolute",
          top: "148px",
          left: "72px",
          right: "72px",
          display: "flex",
          gap: "28px",
          flexWrap: "wrap",
          alignItems: "stretch",
          zIndex: 4,
        }}
      >
        {evidenceItems.map((item, idx) => {
          const isTarget = item.id === pointerTargetId || item.isFlagged;
          const itemStart = atFrame + 4 + idx * 4;
          if (frame < itemStart) return null;
          const cardPop = spring({
            frame: frame - itemStart,
            fps,
            config: CINEMA_SPRINGS.editorialSnap,
          });

          return (
            <div
              key={item.id}
              style={{
                position: "relative",
                minWidth: "300px",
                flex: "1 1 340px",
                maxWidth: "560px",
                backgroundColor: isTarget ? COLORS.riskFill : COLORS.paperLight,
                border: isTarget
                  ? `2px solid ${COLORS.riskBorder}`
                  : `1px solid ${COLORS.paperBorder}`,
                boxShadow: isTarget
                  ? "0 18px 36px rgba(163, 64, 46, 0.12)"
                  : "0 14px 30px rgba(28, 43, 58, 0.08)",
                padding: "28px 32px",
                borderRadius: "12px",
                opacity: cardPop,
                transform: `translate3d(0, ${((1 - cardPop) * 14).toFixed(2)}px, 0)`,
              }}
            >
              {isTarget && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    right: "16px",
                    backgroundColor: COLORS.brickRed,
                    color: COLORS.paperLight,
                    fontFamily: FONTS.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "4px",
                    letterSpacing: "0.08em",
                  }}
                >
                  KEY RISK
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: isTarget ? COLORS.brickRed : REGISTERS.page_editorial.ink.muted,
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </span>
                {item.delta && (
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: isTarget ? COLORS.brickRed : COLORS.chartSecondary,
                      ...TABULAR_NUM_STYLE,
                    }}
                  >
                    {item.delta}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: item.value.length > 16 ? "24px" : "34px",
                  fontWeight: 700,
                  lineHeight: 1.22,
                  color: COLORS.navy,
                  overflowWrap: "break-word",
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {item.value}
              </div>
              {item.sublabel && (
                <div
                  style={{
                    marginTop: "10px",
                    fontFamily: FONTS.sans,
                    fontSize: "14px",
                    lineHeight: 1.45,
                    color: REGISTERS.page_editorial.ink.secondary,
                  }}
                >
                  {item.sublabel}
                </div>
              )}

              {isTarget && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-34px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: COLORS.brickRed,
                    fontSize: "22px",
                    fontWeight: 900,
                  }}
                >
                  ▲
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(summaryNote || sourceCitation) && (
        <div
          style={{
            position: "absolute",
            left: "72px",
            right: "72px",
            bottom: "44px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${COLORS.paperBorder}`,
            paddingTop: "14px",
            fontFamily: FONTS.mono,
            fontSize: "13px",
            color: REGISTERS.page_editorial.ink.muted,
            ...TABULAR_NUM_STYLE,
          }}
        >
          <span>{summaryNote ?? ""}</span>
          {sourceCitation && <span>§ {sourceCitation}</span>}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. ArchiveLightTable (Backlit Reading Room Light Table + Millimeter Scales)
// ============================================================================
export interface ArchiveLightTableProps {
  children?: React.ReactNode;
  folioCode?: string;
  title?: string;
  caption?: string;
  illuminationKelvin?: number;
  sourceCitation?: string;
}

export const ArchiveLightTable: React.FC<ArchiveLightTableProps> = ({
  children,
  folioCode = "PLATEN 04 · 5000K DAYLIGHT",
  title = "Archival Primary Exhibit Platen",
  caption,
  illuminationKelvin = 5000,
  sourceCitation,
}) => {
  const ticks: number[] = [];
  for (let i = 0; i <= 24; i++) {
    ticks.push(i);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.paper,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Backlit Milk Canvas Platen Surface */}
      <div
        style={{
          position: "absolute",
          top: "7%",
          left: "7%",
          width: "86%",
          height: "84%",
          borderRadius: "20px",
          background:
            "radial-gradient(circle at 50% 50%, rgba(253, 251, 247, 0.98) 0%, rgba(242, 240, 234, 0.78) 78%, rgba(225, 222, 213, 0.45) 100%)",
          border: `1.5px solid ${COLORS.paperBorder}`,
          boxShadow:
            "0 24px 56px rgba(28, 43, 58, 0.10), inset 0 0 40px rgba(250, 248, 243, 0.85)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Top Millimeter Witness Scale */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "28px",
            right: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            opacity: 0.55,
          }}
        >
          {ticks.map((t) => (
            <div
              key={`lt-tick-${t}`}
              style={{
                width: "1px",
                height: t % 4 === 0 ? "12px" : "6px",
                backgroundColor: COLORS.navy,
              }}
            />
          ))}
        </div>

        {/* Platen Metadata Strip */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "28px",
            right: "28px",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: FONTS.mono,
            fontSize: "11.5px",
            color: REGISTERS.page_editorial.ink.muted,
            letterSpacing: "0.08em",
            ...TABULAR_NUM_STYLE,
          }}
        >
          <span>{folioCode}</span>
          <span>
            CRI 98 · {illuminationKelvin}K{sourceCitation ? ` · § ${sourceCitation}` : ""}
          </span>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children ?? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "120px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                maxWidth: "960px",
                backgroundColor: COLORS.paperLight,
                border: `1.5px solid ${COLORS.navy}`,
                borderRadius: "12px",
                padding: "48px 56px",
                boxShadow: "0 20px 44px rgba(28, 43, 58, 0.10)",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: COLORS.brickRed,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {folioCode}
              </div>
              <h2
                style={{
                  margin: "12px 0 0 0",
                  fontFamily: FONTS.serif,
                  fontSize: "44px",
                  color: COLORS.navy,
                  lineHeight: 1.16,
                }}
              >
                {title}
              </h2>
              {caption && (
                <p
                  style={{
                    margin: "16px 0 0 0",
                    fontFamily: FONTS.sans,
                    fontSize: "20px",
                    lineHeight: 1.5,
                    color: REGISTERS.page_editorial.ink.secondary,
                  }}
                >
                  {caption}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 5. LiveCountdownSplit (Dynamic Split-Screen Timeline & Metric Horizon)
// ============================================================================
export interface LiveCountdownSplitProps {
  leftTitle: string;
  rightTitle: string;
  startYear?: number;
  endYear?: number;
  leftLabel?: string;
  rightLabel?: string;
  horizonLabel?: string;
  metric?: string;
  leftMetric?: string;
  rightMetric?: string;
  sourceCitation?: string;
  paletteMode?: BroadcastPaletteMode;
  atFrame?: number;
  duration?: number;
}

export const LiveCountdownSplit: React.FC<LiveCountdownSplitProps> = ({
  leftTitle,
  rightTitle,
  startYear = 2026,
  endYear = 2036,
  leftLabel = "BASELINE",
  rightLabel = "PROJECTED OUTCOME",
  horizonLabel = "TIMELINE HORIZON",
  metric,
  leftMetric,
  rightMetric,
  sourceCitation,
  paletteMode = "page",
  atFrame = 0,
  duration = 90,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - atFrame,
    [0, Math.max(1, duration)],
    [0, 1],
    CLAMP
  );
  const currentYear = Math.round(startYear + (endYear - startYear) * progress);

  const isGlass = paletteMode === "over-footage";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* Left Slice: Baseline */}
      <div
        style={{
          flex: 1,
          backgroundColor: isGlass ? "rgba(15, 25, 35, 0.72)" : COLORS.paperLight,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 48px",
          borderRight: `2px solid ${isGlass ? OVER_FOOTAGE_PALETTE.glassBorder : COLORS.navy}`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "12.5px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: isGlass ? OVER_FOOTAGE_PALETTE.textMuted : REGISTERS.page_editorial.ink.muted,
            textTransform: "uppercase",
            ...TABULAR_NUM_STYLE,
          }}
        >
          {leftLabel} · {startYear}
        </span>
        <h2
          style={{
            fontFamily: FONTS.serif,
            fontSize: "34px",
            fontWeight: 700,
            color: isGlass ? OVER_FOOTAGE_PALETTE.textHeadline : COLORS.navy,
            margin: "12px 0 0 0",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {leftTitle}
        </h2>
        {leftMetric && (
          <div
            style={{
              marginTop: "16px",
              fontFamily: FONTS.mono,
              fontSize: "28px",
              fontWeight: 700,
              color: isGlass ? OVER_FOOTAGE_PALETTE.accentPrimary : COLORS.navy,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {leftMetric}
          </div>
        )}
      </div>

      {/* Right Slice: Horizon Outcome */}
      <div
        style={{
          flex: 1,
          backgroundColor: isGlass ? OVER_FOOTAGE_PALETTE.riskFill : COLORS.riskFill,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 48px",
          borderLeft: `2px solid ${isGlass ? OVER_FOOTAGE_PALETTE.glassBorder : COLORS.navy}`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "12.5px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: isGlass ? OVER_FOOTAGE_PALETTE.brickRedText : COLORS.brickRed,
            textTransform: "uppercase",
            ...TABULAR_NUM_STYLE,
          }}
        >
          {rightLabel} · {endYear}
        </span>
        <h2
          style={{
            fontFamily: FONTS.serif,
            fontSize: "34px",
            fontWeight: 700,
            color: isGlass ? OVER_FOOTAGE_PALETTE.textHeadline : COLORS.navy,
            margin: "12px 0 0 0",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {rightTitle}
        </h2>
        {(rightMetric || metric) && (
          <div
            style={{
              marginTop: "16px",
              fontFamily: FONTS.mono,
              fontSize: "28px",
              fontWeight: 700,
              color: isGlass ? OVER_FOOTAGE_PALETTE.brickRedText : COLORS.brickRed,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {rightMetric ?? metric}
          </div>
        )}
      </div>

      {/* Center Year Horizon Badge + Progress Track */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: isGlass ? PAGE_PALETTE.navyDeep : COLORS.paperLight,
          border: `2px solid ${isGlass ? OVER_FOOTAGE_PALETTE.accentPrimary : COLORS.navy}`,
          borderRadius: "14px",
          padding: "16px 28px",
          boxShadow: "0 18px 38px rgba(28, 43, 58, 0.20)",
          textAlign: "center",
          minWidth: "164px",
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: isGlass ? OVER_FOOTAGE_PALETTE.textMuted : REGISTERS.page_editorial.ink.muted,
            textTransform: "uppercase",
          }}
        >
          {horizonLabel}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "44px",
            fontWeight: 700,
            color: isGlass ? OVER_FOOTAGE_PALETTE.textHeadline : COLORS.navy,
            lineHeight: 1.1,
            marginTop: "4px",
            ...TABULAR_NUM_STYLE,
          }}
        >
          {currentYear}
        </div>
        <div
          style={{
            marginTop: "8px",
            width: "100%",
            height: "4px",
            backgroundColor: isGlass ? "rgba(191, 214, 234, 0.2)" : COLORS.paperBorder,
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(progress * 100).toFixed(1)}%`,
              height: "100%",
              backgroundColor: COLORS.brickRed,
            }}
          />
        </div>
      </div>

      {sourceCitation && (
        <div
          style={{
            position: "absolute",
            bottom: "18px",
            left: "32px",
            fontFamily: FONTS.mono,
            fontSize: "12px",
            color: isGlass ? OVER_FOOTAGE_PALETTE.textMuted : REGISTERS.page_editorial.ink.muted,
            ...TABULAR_NUM_STYLE,
          }}
        >
          § {sourceCitation}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. TelestratorOverlay (Dynamic Shapes + Underlying Evidence Framing Support)
// ============================================================================
export type TelestratorHighlightShape = "ellipse" | "box" | "bracket" | "underline";

export interface TelestratorEvidenceRow {
  label: string;
  value: string;
  flagged?: boolean;
}

export interface TelestratorOverlayProps {
  circleTarget?: { cx: number; cy: number; r: number; label?: string };
  arrowTarget?: { x1: number; y1: number; x2: number; y2: number };
  targetLabel?: string;
  calloutText?: string;
  highlightShape?: TelestratorHighlightShape;
  evidenceTitle?: string;
  evidenceSubtitle?: string;
  evidenceRows?: TelestratorEvidenceRow[];
  sourceCitation?: string;
  showEvidenceBackdrop?: boolean;
  color?: string;
  atFrame?: number;
  duration?: number;
}

export const TelestratorOverlay: React.FC<TelestratorOverlayProps> = ({
  circleTarget,
  arrowTarget,
  targetLabel,
  calloutText,
  highlightShape = "ellipse",
  evidenceTitle,
  evidenceSubtitle,
  evidenceRows,
  sourceCitation,
  showEvidenceBackdrop,
  color = OVER_FOOTAGE_PALETTE.accentPrimary,
  atFrame = 0,
  duration = 24,
}) => {
  const frame = useCurrentFrame();

  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const drawProgress = interpolate(
    elapsed,
    [0, Math.max(1, duration)],
    [0, 1],
    CLAMP
  );
  const labelOpacity = interpolate(drawProgress, [0.45, 0.85], [0, 1], CLAMP);

  // Auto-enable underlying evidence framing when standalone (neither circleTarget nor arrowTarget given)
  // or when evidence props are explicitly passed, while keeping pure overlay transparency when
  // composited over another board (such as StudioShowcase).
  const renderEvidenceFrame =
    showEvidenceBackdrop !== undefined
      ? showEvidenceBackdrop
      : (!circleTarget && !arrowTarget) ||
        Boolean(evidenceTitle || (evidenceRows && evidenceRows.length > 0));

  const resolvedCircle = circleTarget ?? {
    cx: 1220,
    cy: 470,
    r: 165,
    label: targetLabel ?? "KEY STATUTORY ANOMALY",
  };
  const resolvedLabel = targetLabel ?? resolvedCircle.label;
  const strokeColor = renderEvidenceFrame && color === OVER_FOOTAGE_PALETTE.accentPrimary
    ? PAGE_PALETTE.brickRed
    : color;

  const wobbleX = noise2D("tel-x", 0.35, 11) * 3.5;
  const wobbleY = noise2D("tel-y", 0.35, 23) * 2.8;

  const defaultRows: TelestratorEvidenceRow[] = evidenceRows ?? [
    { label: "Baseline Operating Allocation", value: "$874.0B" },
    {
      label: resolvedLabel ?? "Flagged Ledger Line",
      value: "$882.4B",
      flagged: true,
    },
    { label: "Statutory Variance Ratio", value: "+104.2%" },
  ];

  const perimeter = 2 * Math.PI * resolvedCircle.r;

  return (
    <>
      {frame === atFrame && <SfxCue cue="telestrator-draw" atFrame={atFrame} volume={0.6} />}

      {/* Underlying Primary-Source Evidence Framing when standalone */}
      {renderEvidenceFrame && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: PAGE_PALETTE.paperLight,
            padding: "88px 96px",
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            gap: "56px",
            alignItems: "center",
            userSelect: "none",
            zIndex: 55,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12.5px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: PAGE_PALETTE.brickRed,
                textTransform: "uppercase",
              }}
            >
              FORENSIC TELESTRATOR INSPECTION
            </div>
            <h1
              style={{
                margin: "12px 0 0 0",
                fontFamily: FONTS.serif,
                fontSize: "48px",
                lineHeight: 1.12,
                color: PAGE_PALETTE.navy,
              }}
            >
              {evidenceTitle ?? resolvedLabel ?? "Audited Schedule Line"}
            </h1>
            {(calloutText || evidenceSubtitle) && (
              <p
                style={{
                  margin: "18px 0 0 0",
                  fontFamily: FONTS.sans,
                  fontSize: "20px",
                  lineHeight: 1.5,
                  color: REGISTERS.page_editorial.ink.secondary,
                }}
              >
                {calloutText ?? evidenceSubtitle}
              </p>
            )}
            {sourceCitation && (
              <div
                style={{
                  marginTop: "28px",
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  color: REGISTERS.page_editorial.ink.muted,
                }}
              >
                § {sourceCitation}
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: PAGE_PALETTE.paper,
              border: `1.5px solid ${PAGE_PALETTE.navy}`,
              borderRadius: "12px",
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxShadow: "0 18px 42px rgba(28, 43, 58, 0.08)",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                color: REGISTERS.page_editorial.ink.muted,
                letterSpacing: "0.08em",
                borderBottom: `1px solid ${PAGE_PALETTE.paperBorder}`,
                paddingBottom: "10px",
              }}
            >
              SCHEDULE EXTRACT · VERIFIED FIGURES
            </div>
            {defaultRows.map((row, idx) => (
              <div
                key={`tel-row-${idx}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderRadius: "8px",
                  backgroundColor: row.flagged ? PAGE_PALETTE.riskFill : PAGE_PALETTE.paperLight,
                  border: `1px solid ${
                    row.flagged ? PAGE_PALETTE.riskBorder : PAGE_PALETTE.paperBorder
                  }`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "18px",
                    fontWeight: row.flagged ? 700 : 500,
                    color: PAGE_PALETTE.navy,
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "26px",
                    fontWeight: 700,
                    color: row.flagged ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <svg
        viewBox="0 0 1920 1080"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 60,
        }}
      >
        {(circleTarget || renderEvidenceFrame) && highlightShape === "ellipse" && (
          <g>
            <ellipse
              cx={resolvedCircle.cx}
              cy={resolvedCircle.cy}
              rx={resolvedCircle.r}
              ry={resolvedCircle.r * 0.56}
              fill="none"
              stroke={strokeColor}
              strokeWidth="5"
              strokeDasharray={perimeter}
              strokeDashoffset={perimeter * (1 - drawProgress)}
              strokeLinecap="round"
              filter="drop-shadow(0 2px 6px rgba(15, 25, 35, 0.36))"
            />
            <ellipse
              cx={resolvedCircle.cx + wobbleX}
              cy={resolvedCircle.cy + wobbleY}
              rx={resolvedCircle.r * 1.03}
              ry={resolvedCircle.r * 0.59}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.2"
              strokeDasharray={perimeter}
              strokeDashoffset={perimeter * (1 - drawProgress)}
              strokeLinecap="round"
              opacity={0.58}
            />
          </g>
        )}

        {(circleTarget || renderEvidenceFrame) && highlightShape === "box" && (
          <rect
            x={resolvedCircle.cx - resolvedCircle.r}
            y={resolvedCircle.cy - resolvedCircle.r * 0.45}
            width={resolvedCircle.r * 2}
            height={resolvedCircle.r * 0.9}
            rx={10}
            fill="none"
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeDasharray={resolvedCircle.r * 6}
            strokeDashoffset={resolvedCircle.r * 6 * (1 - drawProgress)}
          />
        )}

        {(circleTarget || renderEvidenceFrame) && highlightShape === "underline" && (
          <line
            x1={resolvedCircle.cx - resolvedCircle.r}
            y1={resolvedCircle.cy + resolvedCircle.r * 0.34}
            x2={
              resolvedCircle.cx -
              resolvedCircle.r +
              resolvedCircle.r * 2 * drawProgress
            }
            y2={resolvedCircle.cy + resolvedCircle.r * 0.34}
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}

        {(circleTarget || renderEvidenceFrame) && highlightShape === "bracket" && (
          <path
            d={`M ${resolvedCircle.cx - resolvedCircle.r} ${
              resolvedCircle.cy - 48
            } L ${resolvedCircle.cx - resolvedCircle.r - 18} ${
              resolvedCircle.cy - 48
            } L ${resolvedCircle.cx - resolvedCircle.r - 18} ${
              resolvedCircle.cy + 48
            } L ${resolvedCircle.cx - resolvedCircle.r} ${resolvedCircle.cy + 48}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            opacity={drawProgress}
          />
        )}

        {arrowTarget && (
          <g>
            <line
              x1={arrowTarget.x1}
              y1={arrowTarget.y1}
              x2={arrowTarget.x1 + (arrowTarget.x2 - arrowTarget.x1) * drawProgress}
              y2={arrowTarget.y1 + (arrowTarget.y2 - arrowTarget.y1) * drawProgress}
              stroke={strokeColor}
              strokeWidth="5"
              strokeLinecap="round"
              filter="drop-shadow(0 2px 6px rgba(15, 25, 35, 0.42))"
            />
            {drawProgress > 0.85 && (
              <circle
                cx={arrowTarget.x2}
                cy={arrowTarget.y2}
                r={7}
                fill={strokeColor}
              />
            )}
          </g>
        )}
      </svg>

      {/* Crisp #1C2B3A Backing Pill with Label + Optional Callout Subline */}
      {resolvedLabel && drawProgress > 0.45 && (
        <div
          style={{
            position: "absolute",
            left: `${resolvedCircle.cx}px`,
            top: `${Math.max(42, resolvedCircle.cy - resolvedCircle.r * 0.68)}px`,
            transform: "translate(-50%, -100%)",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            maxWidth: "440px",
            backgroundColor: PAGE_PALETTE.navy,
            border: `1.5px solid ${OVER_FOOTAGE_PALETTE.accentPrimary}`,
            color: OVER_FOOTAGE_PALETTE.textHeadline,
            padding: calloutText && !renderEvidenceFrame ? "10px 18px" : "8px 16px",
            borderRadius: "14px",
            boxShadow: "0 12px 28px rgba(15, 25, 35, 0.36)",
            opacity: labelOpacity,
            pointerEvents: "none",
            zIndex: 62,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: FONTS.mono,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              maxWidth: "400px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              ...TABULAR_NUM_STYLE,
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: strokeColor,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {resolvedLabel}
            </span>
          </div>
          {calloutText && !renderEvidenceFrame && (
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: "12px",
                color: OVER_FOOTAGE_PALETTE.textBody,
                maxWidth: "340px",
                textAlign: "center",
              }}
            >
              {calloutText}
            </div>
          )}
        </div>
      )}
    </>
  );
};

// ============================================================================
// 7. KinoMontageStrip (Constructivist Geometric Reading Room Composition)
// ============================================================================
export interface KinoMontageStripProps {
  numberText: string;
  headerText: string;
  subtitle?: string;
  category?: string;
  deltaText?: string;
  sourceCitation?: string;
  fullScene?: boolean;
  paletteMode?: BroadcastPaletteMode;
  atFrame?: number;
}

export const KinoMontageStrip: React.FC<KinoMontageStripProps> = ({
  numberText,
  headerText,
  subtitle,
  category = "Opening Hook",
  deltaText,
  sourceCitation,
  fullScene = false,
  paletteMode,
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const enter = spring({
    frame: elapsed,
    fps,
    config: CINEMA_SPRINGS.editorialSnap,
  });

  const renderFull = fullScene || paletteMode === "page";

  if (renderFull) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: COLORS.paperLight,
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Constructivist Diagonal & Structural Geometric Bands */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "110px",
            width: "320px",
            height: "1320px",
            backgroundColor: COLORS.navy,
            transform: `skewX(-16deg) translate3d(${((1 - enter) * 80).toFixed(2)}px, 0, 0)`,
            opacity: 0.94,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "140px",
            left: 0,
            width: "100%",
            height: "18px",
            backgroundColor: COLORS.navy,
            transform: `scaleX(${enter.toFixed(4)})`,
            transformOrigin: "left center",
            opacity: 0.88,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "150px",
            left: 0,
            width: "46%",
            height: "28px",
            backgroundColor: COLORS.brickRed,
            transform: `translate3d(${((1 - enter) * -90).toFixed(2)}px, 0, 0)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "180px",
            left: "112px",
            width: "24px",
            height: "160px",
            backgroundColor: COLORS.brickRed,
            opacity: enter,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "210px",
            right: "185px",
            width: "150px",
            height: "150px",
            border: `6px solid ${COLORS.navy}`,
            transform: `rotate(12deg) scale(${(0.85 + 0.15 * enter).toFixed(4)})`,
            opacity: 0.85 * enter,
          }}
        />

        {/* Balanced Editorial Centerpiece Lockup */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "156px",
            right: "360px",
            transform: `translateY(-50%) translate3d(0, ${((1 - enter) * 28).toFixed(2)}px, 0)`,
            opacity: enter,
            backgroundColor: COLORS.paper,
            border: `2px solid ${COLORS.navy}`,
            borderRadius: "14px",
            padding: "44px 52px",
            boxShadow: "0 24px 52px rgba(28, 43, 58, 0.16)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
            <div
              style={{
                display: "inline-block",
                backgroundColor: COLORS.brickRed,
                color: COLORS.paperLight,
                fontFamily: FONTS.mono,
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "5px 12px",
                borderRadius: "4px",
              }}
            >
              {category}
            </div>
            {deltaText && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "14px",
                  fontWeight: 700,
                  color: COLORS.brickRed,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {deltaText}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              marginBottom: subtitle ? "22px" : "0px",
            }}
          >
            <div
              style={{
                backgroundColor: COLORS.navy,
                color: COLORS.goldWarm,
                fontFamily: FONTS.condensed,
                fontSize: "88px",
                fontWeight: 700,
                lineHeight: 1,
                padding: "16px 28px",
                borderRadius: "10px",
                borderLeft: `6px solid ${COLORS.brickRed}`,
                flexShrink: 0,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {numberText}
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: FONTS.serif,
                fontSize: "52px",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.015em",
                color: COLORS.navy,
              }}
            >
              {headerText}
            </h1>
          </div>

          {subtitle && (
            <div
              style={{
                borderTop: `1.5px solid ${COLORS.paperBorder}`,
                paddingTop: "18px",
                fontFamily: FONTS.sans,
                fontSize: "20px",
                lineHeight: 1.45,
                color: COLORS.navy,
                fontWeight: 500,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {subtitle}
            </div>
          )}

          {sourceCitation && (
            <div
              style={{
                marginTop: "14px",
                fontFamily: FONTS.mono,
                fontSize: "12px",
                color: REGISTERS.page_editorial.ink.muted,
              }}
            >
              § {sourceCitation}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: COLORS.brickRed,
        color: COLORS.paperLight,
        border: `2px solid ${COLORS.navy}`,
        borderRadius: "10px",
        padding: "18px 36px",
        boxShadow: "0 18px 36px rgba(28, 43, 58, 0.16)",
        transform: `scale(${(0.92 + 0.08 * enter).toFixed(4)})`,
        opacity: enter,
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontFamily: FONTS.condensed,
          fontSize: "68px",
          fontWeight: 700,
          marginRight: "22px",
          lineHeight: 1,
          color: COLORS.paperLight,
          ...TABULAR_NUM_STYLE,
        }}
      >
        {numberText}
      </span>
      <span
        style={{
          fontFamily: FONTS.serif,
          fontSize: "26px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: COLORS.paper,
        }}
      >
        {headerText}
      </span>
    </div>
  );
};

// ============================================================================
// 8. CitySymphonyFrame (Clean Editorial Crop Marks, Timecode & Optional Slate)
// ============================================================================
export interface CitySymphonyFrameProps {
  timecode?: string;
  locationTag?: string;
  reelCode?: string;
  title?: string;
  metric?: string;
  children?: React.ReactNode;
}

export const CitySymphonyFrame: React.FC<CitySymphonyFrameProps> = ({
  timecode = "00:04:18:22",
  locationTag,
  reelCode = "35MM · 1.78:1",
  title,
  metric,
  children,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: "36px",
        border: `1px solid ${COLORS.paperBorder}`,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 40,
      }}
    >
      {/* Corner Crop Marks */}
      <div
        style={{
          position: "absolute",
          top: "-1px",
          left: "-1px",
          width: "18px",
          height: "18px",
          borderTop: `2px solid ${COLORS.navy}`,
          borderLeft: `2px solid ${COLORS.navy}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-1px",
          right: "-1px",
          width: "18px",
          height: "18px",
          borderTop: `2px solid ${COLORS.navy}`,
          borderRight: `2px solid ${COLORS.navy}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-1px",
          left: "-1px",
          width: "18px",
          height: "18px",
          borderBottom: `2px solid ${COLORS.navy}`,
          borderLeft: `2px solid ${COLORS.navy}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-1px",
          right: "-1px",
          width: "18px",
          height: "18px",
          borderBottom: `2px solid ${COLORS.navy}`,
          borderRight: `2px solid ${COLORS.navy}`,
        }}
      />

      {locationTag && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            fontFamily: FONTS.mono,
            fontSize: "11.5px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: COLORS.navy,
            backgroundColor: "rgba(250, 248, 243, 0.90)",
            padding: "4px 10px",
            borderRadius: "4px",
            border: `1px solid ${COLORS.paperBorder}`,
            textTransform: "uppercase",
          }}
        >
          {locationTag}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          fontFamily: FONTS.mono,
          fontSize: "11px",
          letterSpacing: "0.08em",
          color: REGISTERS.page_editorial.ink.muted,
          ...TABULAR_NUM_STYLE,
        }}
      >
        {reelCode}
      </div>

      {children}

      {title && !children && (
        <div
          style={{
            position: "absolute",
            inset: "72px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: FONTS.serif,
              fontSize: "52px",
              color: COLORS.navy,
            }}
          >
            {title}
          </h2>
          {metric && (
            <div
              style={{
                marginTop: "16px",
                fontFamily: FONTS.mono,
                fontSize: "36px",
                fontWeight: 700,
                color: COLORS.brickRed,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {metric}
            </div>
          )}
        </div>
      )}

      {/* Subtle Timecode HUD */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          fontFamily: FONTS.mono,
          fontSize: "12px",
          letterSpacing: "0.08em",
          color: REGISTERS.page_editorial.ink.muted,
          backgroundColor: "rgba(250, 248, 243, 0.90)",
          padding: "4px 10px",
          borderRadius: "4px",
          border: `1px solid ${COLORS.paperBorder}`,
          ...TABULAR_NUM_STYLE,
        }}
      >
        {timecode}
      </div>
    </div>
  );
};

// ============================================================================
// 9. SplitScreenFrame (Broadcast Dual-Channel A/B Quantitative Frame)
// ============================================================================
export interface SplitScreenFrameProps {
  leftTitle: string;
  rightTitle: string;
  leftKicker?: string;
  rightKicker?: string;
  leftMetric?: string;
  rightMetric?: string;
  leftBody?: string;
  rightBody?: string;
  dividerBadge?: string;
  sourceCitation?: string;
  paletteMode?: BroadcastPaletteMode;
  atFrame?: number;
}

export const SplitScreenFrame: React.FC<SplitScreenFrameProps> = ({
  leftTitle,
  rightTitle,
  leftKicker = "CHANNEL A · RECORDED CLAIM",
  rightKicker = "CHANNEL B · AUDITED OUTCOME",
  leftMetric,
  rightMetric,
  leftBody,
  rightBody,
  dividerBadge = "VS",
  sourceCitation,
  paletteMode = "page",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < atFrame) return null;
  const enter = spring({
    frame: frame - atFrame,
    fps,
    config: CINEMA_SPRINGS.editorialSnap,
  });

  if (paletteMode === "over-footage") {
    return (
      <div
        style={{
          position: "absolute",
          right: "64px",
          top: "136px",
          width: "640px",
          background: OVER_FOOTAGE_PALETTE.glassPrimary,
          backdropFilter: "blur(12px) saturate(165%) brightness(0.68)",
          WebkitBackdropFilter: "blur(12px) saturate(165%) brightness(0.68)",
          border: `1.25px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
          borderRadius: "16px",
          padding: "28px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
          opacity: enter,
          transform: `translate3d(${((1 - enter) * 28).toFixed(2)}px, 0, 0)`,
          userSelect: "none",
        }}
      >
        <div
          style={{
            backgroundColor: OVER_FOOTAGE_PALETTE.glassDarkWell,
            borderRadius: "10px",
            padding: "18px",
            border: `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`,
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: "10.5px", color: OVER_FOOTAGE_PALETTE.textMuted }}>
            {leftKicker}
          </div>
          <div style={{ fontFamily: FONTS.serif, fontSize: "21px", fontWeight: 700, color: OVER_FOOTAGE_PALETTE.textHeadline, marginTop: "6px" }}>
            {leftTitle}
          </div>
          {leftMetric && (
            <div style={{ fontFamily: FONTS.mono, fontSize: "28px", fontWeight: 700, color: OVER_FOOTAGE_PALETTE.accentPrimary, marginTop: "10px", ...TABULAR_NUM_STYLE }}>
              {leftMetric}
            </div>
          )}
        </div>
        <div
          style={{
            backgroundColor: OVER_FOOTAGE_PALETTE.riskFill,
            borderRadius: "10px",
            padding: "18px",
            border: `1px solid ${OVER_FOOTAGE_PALETTE.riskBorder}`,
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: "10.5px", color: OVER_FOOTAGE_PALETTE.brickRedText }}>
            {rightKicker}
          </div>
          <div style={{ fontFamily: FONTS.serif, fontSize: "21px", fontWeight: 700, color: OVER_FOOTAGE_PALETTE.textHeadline, marginTop: "6px" }}>
            {rightTitle}
          </div>
          {rightMetric && (
            <div style={{ fontFamily: FONTS.mono, fontSize: "28px", fontWeight: 700, color: OVER_FOOTAGE_PALETTE.brickRedText, marginTop: "10px", ...TABULAR_NUM_STYLE }}>
              {rightMetric}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ReadingRoomStage
      register="page_editorial"
      chapterTitle="DUAL-CHANNEL BROADCAST COMPARISON"
      folioLabel="SPLIT EXHIBIT"
      sourceCitation={sourceCitation}
      cameraMove="static"
    >
      <div
        style={{
          position: "absolute",
          left: LAYOUT.safeMargin,
          right: LAYOUT.safeMargin,
          top: 124,
          bottom: 104,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "36px",
          opacity: enter,
          userSelect: "none",
        }}
      >
        <div
          style={{
            backgroundColor: PAGE_PALETTE.paperLight,
            border: `1.5px solid ${PAGE_PALETTE.navy}`,
            borderRadius: "14px",
            padding: "44px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: REGISTERS.page_editorial.ink.muted, letterSpacing: "0.09em" }}>
              {leftKicker}
            </div>
            <h2 style={{ margin: "14px 0 0 0", fontFamily: FONTS.serif, fontSize: "42px", color: PAGE_PALETTE.navy, lineHeight: 1.15 }}>
              {leftTitle}
            </h2>
            {leftBody && (
              <p style={{ margin: "18px 0 0 0", fontFamily: FONTS.sans, fontSize: "19px", lineHeight: 1.5, color: REGISTERS.page_editorial.ink.secondary }}>
                {leftBody}
              </p>
            )}
          </div>
          {leftMetric && (
            <div style={{ fontFamily: FONTS.mono, fontSize: "58px", fontWeight: 700, color: PAGE_PALETTE.navy, ...TABULAR_NUM_STYLE }}>
              {leftMetric}
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: PAGE_PALETTE.riskFill,
            border: `2px solid ${PAGE_PALETTE.riskBorder}`,
            borderRadius: "14px",
            padding: "44px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "12px", fontWeight: 700, color: PAGE_PALETTE.brickRed, letterSpacing: "0.09em" }}>
              {rightKicker}
            </div>
            <h2 style={{ margin: "14px 0 0 0", fontFamily: FONTS.serif, fontSize: "42px", color: PAGE_PALETTE.navy, lineHeight: 1.15 }}>
              {rightTitle}
            </h2>
            {rightBody && (
              <p style={{ margin: "18px 0 0 0", fontFamily: FONTS.sans, fontSize: "19px", lineHeight: 1.5, color: REGISTERS.page_editorial.ink.secondary }}>
                {rightBody}
              </p>
            )}
          </div>
          {rightMetric && (
            <div style={{ fontFamily: FONTS.mono, fontSize: "58px", fontWeight: 700, color: PAGE_PALETTE.brickRed, ...TABULAR_NUM_STYLE }}>
              {rightMetric}
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: PAGE_PALETTE.navy,
            color: PAGE_PALETTE.paperLight,
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "10px 18px",
            borderRadius: "999px",
            border: `2px solid ${PAGE_PALETTE.paperLight}`,
            boxShadow: "0 12px 28px rgba(15, 25, 35, 0.24)",
          }}
        >
          {dividerBadge}
        </div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// 10. QuoteHighlightCard (Testimony Pull-Quote + Chisel-Nib Marker Sweep)
// ============================================================================
export interface QuoteHighlightCardProps {
  quote: string;
  speaker: string;
  role?: string;
  dateLabel?: string;
  highlightPhrase?: string;
  sourceCitation?: string;
  paletteMode?: BroadcastPaletteMode;
  atFrame?: number;
}

export const QuoteHighlightCard: React.FC<QuoteHighlightCardProps> = ({
  quote,
  speaker,
  role = "Official Testimony",
  dateLabel,
  sourceCitation,
  paletteMode = "page",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const enter = spring({ frame: elapsed, fps, config: CINEMA_SPRINGS.editorialSnap });
  const sweepProgress = interpolate(elapsed, [12, 34], [0, 1], CLAMP);

  if (paletteMode === "over-footage") {
    return (
      <div
        style={{
          position: "absolute",
          right: "64px",
          top: "148px",
          width: "580px",
          background: OVER_FOOTAGE_PALETTE.glassPrimary,
          backdropFilter: "blur(12px) saturate(165%) brightness(0.68)",
          WebkitBackdropFilter: "blur(12px) saturate(165%) brightness(0.68)",
          border: `1.25px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
          borderLeft: `4px solid ${OVER_FOOTAGE_PALETTE.accentWarm}`,
          borderRadius: "16px",
          padding: "28px 32px",
          opacity: enter,
          transform: `translate3d(${((1 - enter) * 30).toFixed(2)}px, 0, 0)`,
          userSelect: "none",
        }}
      >
        <div style={{ fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, color: OVER_FOOTAGE_PALETTE.accentPrimary, letterSpacing: "0.08em" }}>
          TRANSCRIPT EXTRACT{dateLabel ? ` · ${dateLabel}` : ""}
        </div>
        <div
          style={{
            position: "relative",
            marginTop: "14px",
            fontFamily: FONTS.serif,
            fontStyle: "italic",
            fontSize: "24px",
            lineHeight: 1.38,
            color: OVER_FOOTAGE_PALETTE.textHeadline,
          }}
        >
          “{quote}”
        </div>
        <div style={{ marginTop: "16px", fontFamily: FONTS.mono, fontSize: "12.5px", color: OVER_FOOTAGE_PALETTE.textMuted }}>
          — {speaker}, {role}
        </div>
      </div>
    );
  }

  return (
    <ReadingRoomStage
      register="archival_parchment"
      chapterTitle="VERBATIM TRANSCRIPT EXHIBIT"
      folioLabel={dateLabel ?? "RECORDED STATEMENT"}
      sourceCitation={sourceCitation}
      cameraMove="dolly-creep"
    >
      <div
        style={{
          position: "absolute",
          left: 156,
          right: 156,
          top: 164,
          bottom: 140,
          backgroundColor: REGISTERS.archival_parchment.bg.elevated,
          border: `1.5px solid ${REGISTERS.archival_parchment.rule.oxford}`,
          borderRadius: "12px",
          padding: "64px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: enter,
          boxShadow: "0 22px 50px rgba(24, 22, 20, 0.10)",
          userSelect: "none",
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 700, color: REGISTERS.archival_parchment.accent.liability, letterSpacing: "0.1em" }}>
            SWORN / PUBLIC RECORD QUOTE
          </div>
          <div style={{ position: "relative", marginTop: "28px" }}>
            <div style={{ position: "absolute", left: "-6px", top: "10px", zIndex: 0 }}>
              <HighlighterStroke
                width={Math.min(1180, Math.max(360, quote.length * 14))}
                height={48}
                progress={sweepProgress}
                register="archival_parchment"
              />
            </div>
            <blockquote
              style={{
                position: "relative",
                zIndex: 1,
                margin: 0,
                fontFamily: FONTS.serif,
                fontStyle: "italic",
                fontSize: quote.length > 140 ? "36px" : "44px",
                lineHeight: 1.32,
                color: REGISTERS.archival_parchment.ink.primary,
              }}
            >
              “{quote}”
            </blockquote>
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${REGISTERS.archival_parchment.rule.hairline}`,
            paddingTop: "22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div>
            <div style={{ fontFamily: FONTS.sans, fontSize: "20px", fontWeight: 700, color: REGISTERS.archival_parchment.ink.primary }}>
              {speaker}
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: "13px", color: REGISTERS.archival_parchment.ink.secondary, marginTop: "4px" }}>
              {role}
            </div>
          </div>
          {dateLabel && (
            <div style={{ fontFamily: FONTS.mono, fontSize: "13px", fontWeight: 600, color: REGISTERS.archival_parchment.ink.muted, ...TABULAR_NUM_STYLE }}>
              {dateLabel}
            </div>
          )}
        </div>
      </div>
    </ReadingRoomStage>
  );
};

// ============================================================================
// 11. DataCalloutLowerThird (Quantitative Lower-Third + Sparkline Strip)
// ============================================================================
export interface DataCalloutLowerThirdProps {
  value: string;
  label: string;
  delta?: string;
  sublabel?: string;
  source?: string;
  sparklineValues?: number[];
  paletteMode?: BroadcastPaletteMode;
  atFrame?: number;
}

export const DataCalloutLowerThird: React.FC<DataCalloutLowerThirdProps> = ({
  value,
  label,
  delta,
  sublabel,
  source = "Primary Ledger",
  sparklineValues = [28, 34, 41, 49, 63, 84],
  paletteMode = "over-footage",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const enter = spring({ frame: elapsed, fps, config: CINEMA_SPRINGS.editorialSnap });
  const barGrow = interpolate(elapsed, [4, 24], [0, 1], CLAMP);

  const maxSpark = Math.max(1, ...sparklineValues);
  const formattedVal = formatTabularFigure(value);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "56px",
        left: paletteMode === "page" ? "96px" : "120px",
        right: paletteMode === "page" ? "96px" : undefined,
        minWidth: "740px",
        maxWidth: "1280px",
        background:
          paletteMode === "page"
            ? PAGE_PALETTE.paperLight
            : OVER_FOOTAGE_PALETTE.glassPrimary,
        backdropFilter:
          paletteMode === "over-footage"
            ? "blur(12px) saturate(165%) brightness(0.68)"
            : undefined,
        WebkitBackdropFilter:
          paletteMode === "over-footage"
            ? "blur(12px) saturate(165%) brightness(0.68)"
            : undefined,
        border: `1.5px solid ${
          paletteMode === "page" ? PAGE_PALETTE.navy : OVER_FOOTAGE_PALETTE.glassBorder
        }`,
        borderRadius: "16px",
        padding: "20px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "28px",
        boxShadow: "0 20px 44px rgba(15, 25, 35, 0.32)",
        opacity: enter,
        transform: `translate3d(0, ${((1 - enter) * 26).toFixed(2)}px, 0)`,
        zIndex: 52,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div
          style={{
            backgroundColor:
              paletteMode === "page" ? PAGE_PALETTE.paper : OVER_FOOTAGE_PALETTE.glassDarkWell,
            border: `1px solid ${
              paletteMode === "page"
                ? PAGE_PALETTE.paperBorder
                : OVER_FOOTAGE_PALETTE.glassInnerHairline
            }`,
            padding: "12px 22px",
            borderRadius: "10px",
            fontFamily: FONTS.mono,
            fontSize: "40px",
            fontWeight: 700,
            color:
              paletteMode === "page"
                ? PAGE_PALETTE.navy
                : OVER_FOOTAGE_PALETTE.textHeadline,
            lineHeight: 1,
            ...TABULAR_NUM_STYLE,
          }}
        >
          {formattedVal.formatted}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: "22px",
                fontWeight: 700,
                color:
                  paletteMode === "page"
                    ? PAGE_PALETTE.navy
                    : OVER_FOOTAGE_PALETTE.textHeadline,
              }}
            >
              {label}
            </span>
            {delta && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "12.5px",
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: "4px",
                  backgroundColor: PAGE_PALETTE.brickRed,
                  color: OVER_FOOTAGE_PALETTE.textHeadline,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {delta}
              </span>
            )}
          </div>
          <div
            style={{
              marginTop: "5px",
              fontFamily: FONTS.mono,
              fontSize: "12px",
              color:
                paletteMode === "page"
                  ? REGISTERS.page_editorial.ink.muted
                  : OVER_FOOTAGE_PALETTE.textMuted,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {sublabel ? `${sublabel} · ` : ""}§ {source}
          </div>
        </div>
      </div>

      {/* Mini Tabular Bar Sparkline */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "5px",
          height: "46px",
          paddingLeft: "16px",
        }}
      >
        {sparklineValues.map((v, i) => {
          const h = Math.max(6, (v / maxSpark) * 44 * barGrow);
          const isLast = i === sparklineValues.length - 1;
          return (
            <div
              key={`spk-${i}`}
              style={{
                width: "9px",
                height: `${h.toFixed(1)}px`,
                borderRadius: "2px",
                backgroundColor: isLast
                  ? PAGE_PALETTE.brickRed
                  : paletteMode === "page"
                  ? PAGE_PALETTE.navy
                  : OVER_FOOTAGE_PALETTE.accentPrimary,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 12. BreakingBanner (High-Authority Fiscal & Statutory Alert Ribbon)
// ============================================================================
export interface BreakingBannerProps {
  headline: string;
  kicker?: string;
  subheadline?: string;
  keyFigure?: string;
  tickerItems?: string[];
  timestamp?: string;
  paletteMode?: BroadcastPaletteMode;
  atFrame?: number;
}

export const BreakingBanner: React.FC<BreakingBannerProps> = ({
  headline,
  kicker = "STATUTORY DISPATCH",
  subheadline,
  keyFigure,
  tickerItems = ["TREASURY TABLE 9", "CBO BASELINE UPDATE", "PRIMARY DEALERDESK"],
  timestamp = "UTC VERIFIED",
  paletteMode = "over-footage",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const enter = spring({ frame: elapsed, fps, config: CINEMA_SPRINGS.editorialSnap });

  if (paletteMode === "page") {
    return (
      <ReadingRoomStage
        register="page_editorial"
        chapterTitle={kicker}
        folioLabel={timestamp}
        sourceCitation={tickerItems.join(" · ")}
        cameraMove="verdict-slam"
      >
        <div
          style={{
            position: "absolute",
            left: LAYOUT.safeMargin,
            right: LAYOUT.safeMargin,
            top: 180,
            bottom: 160,
            backgroundColor: PAGE_PALETTE.riskFill,
            border: `2.5px solid ${PAGE_PALETTE.brickRed}`,
            borderRadius: "14px",
            padding: "56px 64px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: enter,
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                backgroundColor: PAGE_PALETTE.brickRed,
                color: PAGE_PALETTE.paperLight,
                fontFamily: FONTS.mono,
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                padding: "6px 14px",
                borderRadius: "4px",
                textTransform: "uppercase",
              }}
            >
              {kicker}
            </span>
            {keyFigure && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "44px",
                  fontWeight: 700,
                  color: PAGE_PALETTE.brickRed,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {keyFigure}
              </span>
            )}
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: FONTS.serif,
                fontSize: "56px",
                lineHeight: 1.12,
                color: PAGE_PALETTE.navy,
              }}
            >
              {headline}
            </h1>
            {subheadline && (
              <p
                style={{
                  margin: "18px 0 0 0",
                  fontFamily: FONTS.sans,
                  fontSize: "22px",
                  lineHeight: 1.48,
                  color: REGISTERS.page_editorial.ink.secondary,
                }}
              >
                {subheadline}
              </p>
            )}
          </div>

          <div
            style={{
              borderTop: `1px solid ${PAGE_PALETTE.riskBorder}`,
              paddingTop: "16px",
              display: "flex",
              gap: "28px",
              fontFamily: FONTS.mono,
              fontSize: "13px",
              fontWeight: 600,
              color: PAGE_PALETTE.brickRed,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {tickerItems.map((t, idx) => (
              <span key={`bb-tk-${idx}`}>◆ {t}</span>
            ))}
          </div>
        </div>
      </ReadingRoomStage>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "96px",
        right: "96px",
        top: "44px",
        background: OVER_FOOTAGE_PALETTE.glassPrimary,
        backdropFilter: "blur(12px) saturate(165%) brightness(0.66)",
        WebkitBackdropFilter: "blur(12px) saturate(165%) brightness(0.66)",
        border: `1.5px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
        borderLeft: `6px solid ${PAGE_PALETTE.brickRed}`,
        borderRadius: "14px",
        padding: "16px 26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        boxShadow: "0 20px 44px rgba(15, 25, 35, 0.42)",
        opacity: enter,
        transform: `translate3d(0, ${((1 - enter) * -24).toFixed(2)}px, 0)`,
        zIndex: 55,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span
          style={{
            backgroundColor: PAGE_PALETTE.brickRed,
            color: OVER_FOOTAGE_PALETTE.textHeadline,
            fontFamily: FONTS.mono,
            fontSize: "11.5px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "5px 11px",
            borderRadius: "5px",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {kicker}
        </span>
        <div>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: "20px",
              fontWeight: 700,
              color: OVER_FOOTAGE_PALETTE.textHeadline,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {headline}
          </div>
          {subheadline && (
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                color: OVER_FOOTAGE_PALETTE.textMuted,
                marginTop: "2px",
              }}
            >
              {subheadline}
            </div>
          )}
        </div>
      </div>

      {keyFigure && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "26px",
            fontWeight: 700,
            color: OVER_FOOTAGE_PALETTE.brickRedText,
            flexShrink: 0,
            ...TABULAR_NUM_STYLE,
          }}
        >
          {keyFigure}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DOC_BROADCAST_STYLES Registry (12 Broadcast & Investigative Style Recipes)
// ============================================================================
export interface DocBroadcastStyleRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
}

export const DOC_BROADCAST_STYLES: readonly DocBroadcastStyleRecipe[] = [
  {
    id: "doc-news-package",
    name: "Broadcast News Package Lower-Third & Monitor",
    componentName: "NewsPackageLowerThird",
    defaultFraming: "over-footage",
    description: "Smoked-navy optical glass lower-third or full-screen broadcast desk monitor with live mode chip.",
  },
  {
    id: "doc-caption-news",
    name: "Editorial Dispatch & Caption Briefing Card",
    componentName: "CaptionNewsCard",
    defaultFraming: "over-footage",
    description: "Warm parchment dateline dispatch with optional tabular figure column and structured bullet points.",
  },
  {
    id: "doc-visual-investigation",
    name: "Visual Investigation Evidence Desk",
    componentName: "VisualInvestigationBoard",
    defaultFraming: "fullscreen-cutaway",
    description: "Milk-paper coordinate desk with pinned evidence cards, connector threads, and brick-red risk pointer.",
  },
  {
    id: "doc-archive-light-table",
    name: "5000K Archival Contact Light Table",
    componentName: "ArchiveLightTable",
    defaultFraming: "fullscreen-cutaway",
    description: "Backlit milk platen with millimeter witness scales and CRI 98 inspection metadata.",
  },
  {
    id: "doc-live-countdown-split",
    name: "Dynamic Horizon Countdown Split Stage",
    componentName: "LiveCountdownSplit",
    defaultFraming: "fullscreen-cutaway",
    description: "Bilateral baseline-vs-outcome split screen with dynamic year/metric horizon counter.",
  },
  {
    id: "doc-telestrator",
    name: "Grease-Pencil Telestrator & Exhibit Inspection",
    componentName: "TelestratorOverlay",
    defaultFraming: "over-footage",
    description: "Double-stroke SVG ellipse/box/bracket/underline telestrator with automatic standalone evidence framing.",
  },
  {
    id: "doc-kino-montage",
    name: "Constructivist Geometric Number Lockup",
    componentName: "KinoMontageStrip",
    defaultFraming: "fullscreen-cutaway",
    description: "Architectural diagonal bands framing a condensed hero statistic and serif thesis.",
  },
  {
    id: "doc-city-symphony",
    name: "35mm Crop-Mark & SMPTE Timecode Frame",
    componentName: "CitySymphonyFrame",
    defaultFraming: "over-footage",
    description: "Precision optical crop marks with location tag, aspect ratio badge, and tabular SMPTE timecode.",
  },
  {
    id: "doc-split-screen-frame",
    name: "Dual-Channel A/B Broadcast Split Frame",
    componentName: "SplitScreenFrame",
    defaultFraming: "fullscreen-cutaway",
    description: "Side-by-side claim-vs-outcome broadcast frame with central comparison badge.",
  },
  {
    id: "doc-quote-highlight",
    name: "Sworn Testimony Pull-Quote & Highlighter Stage",
    componentName: "QuoteHighlightCard",
    defaultFraming: "fullscreen-cutaway",
    description: "Archival parchment transcript pull-quote with animated chisel-nib marker sweep.",
  },
  {
    id: "doc-data-callout-lower-third",
    name: "Quantitative Sparkline Lower-Third",
    componentName: "DataCalloutLowerThird",
    defaultFraming: "over-footage",
    description: "Tabular hero figure paired with delta badge, source citation, and animated mini bar strip.",
  },
  {
    id: "doc-breaking-banner",
    name: "Statutory Dispatch Alert Banner",
    componentName: "BreakingBanner",
    defaultFraming: "over-footage",
    description: "High-authority top-bar or full-page fiscal bulletin using brick-red and deep navy ink.",
  },
] as const;
