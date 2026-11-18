import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SfxCue } from "../components/SfxCue";
import {
  FONTS,
  getOpticalTracking,
  splitNumberUnit,
  TABULAR_NUM_STYLE,
} from "../design/fonts";
import { OVER_FOOTAGE_PALETTE, PAGE_PALETTE } from "../design/tokens";
import { countUpValue } from "../motion/primitives";

export interface DataTickerDelta {
  value: string | number;
  isPositive?: boolean;
  label?: string;
}

export interface DataTickerProps {
  startValue?: number;
  /** Target numeric figure or formatted expression (e.g. `38.4`, `-42`, `"-$42B"`, `"100:1"`, `"+67 bps"`) */
  endValue?: number | string;
  /** Optional shorthand alias for `endValue` accepting raw formatted strings like `"$269.92/MW-day"` */
  value?: string | number;
  /** Optional ratio denominator (e.g. `1` to render `100:1` when `endValue={100}`) */
  ratioDenominator?: number | string;
  showPlusSign?: boolean;
  atFrame?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label?: string;
  delta?: DataTickerDelta;
  fontSize?: number | string;
  fontFamily?: string;
  color?: string;
  accentColor?: string;
  darkSurface?: boolean;
  paletteMode?: "page" | "over-footage";
  enableSfx?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface FormattedTickerParts {
  signPrefix: string;
  currencyPrefix: string;
  numberText: string;
  ratioTail: string;
  unitSuffix: string;
  spaceBeforeUnit: boolean;
  isCompoundRateUnit: boolean;
  fullText: string;
}

const SPACED_UNITS = new Set<string>([
  "bps",
  "gw",
  "gwh",
  "twh",
  "mw",
  "mwh",
  "kw",
  "kwh",
  "mbps",
  "gbps",
  "pts",
  "yrs",
]);

function inferFractionDigits(n: number): number {
  if (!Number.isFinite(n) || Number.isInteger(n)) return 0;
  const str = String(Math.abs(n));
  const dotIdx = str.indexOf(".");
  if (dotIdx === -1) return 0;
  return Math.min(4, str.length - dotIdx - 1);
}

/**
 * Pure deterministic formatter handling negative currencies (`-$42B`), basis points (`+67 bps`),
 * ratios (`100:1`), multipliers (`+833%`), and compound rate suffixes (`$269.92/MW-day`)
 * without ever clamping or misplacing minus/currency symbols.
 */
export function formatDataTickerParts(params: {
  currentNumeric: number;
  rawInput?: string | number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  ratioDenominator?: number | string;
  showPlusSign?: boolean;
}): FormattedTickerParts {
  const {
    currentNumeric,
    rawInput,
    prefix = "",
    suffix = "",
    decimals,
    ratioDenominator,
    showPlusSign = false,
  } = params;

  const parsedFromRaw =
    typeof rawInput === "string" ? splitNumberUnit(rawInput) : null;

  // Extract sign & currency from explicit `prefix` OR parsed string without duplicating signs
  const rawPrefix = prefix || parsedFromRaw?.prefix || "";
  const explicitPlus =
    showPlusSign ||
    rawPrefix.indexOf("+") !== -1 ||
    parsedFromRaw?.sign === "+";
  const explicitMinusInPrefix =
    rawPrefix.indexOf("-") !== -1 || rawPrefix.indexOf("−") !== -1;

  const currencyMatch = rawPrefix.match(/[$€£¥]/);
  const approxMatch = rawPrefix.match(/[~≈]/);
  const currencyPrefix =
    (approxMatch ? approxMatch[0] : "") +
    (currencyMatch ? currencyMatch[0] : parsedFromRaw?.currency ?? "");

  // Resolve target decimals accurately when omitted
  const resolvedDecimals =
    decimals !== undefined
      ? Math.max(0, decimals)
      : parsedFromRaw && typeof rawInput === "string"
      ? parsedFromRaw.decimals
      : typeof rawInput === "number"
      ? inferFractionDigits(rawInput)
      : inferFractionDigits(currentNumeric);

  const factor = Math.pow(10, resolvedDecimals);
  const roundedVal = Math.round(currentNumeric * factor) / factor;
  const isNeg =
    roundedVal < 0 || (roundedVal === 0 && currentNumeric < 0 && explicitMinusInPrefix);

  const absVal = Math.abs(roundedVal);
  const numberText = absVal.toLocaleString("en-US", {
    minimumFractionDigits: resolvedDecimals,
    maximumFractionDigits: resolvedDecimals,
  });

  const signPrefix = isNeg ? "-" : explicitPlus && roundedVal > 0 ? "+" : "";

  const resolvedRatioDenom =
    ratioDenominator !== undefined
      ? String(ratioDenominator)
      : parsedFromRaw?.isRatio && parsedFromRaw.secondaryRatioValue !== null
      ? String(parsedFromRaw.secondaryRatioValue)
      : "";
  const ratioTail = resolvedRatioDenom ? `:${resolvedRatioDenom}` : "";

  const rawSuffixCandidate =
    suffix !== "" ? suffix : parsedFromRaw?.rawSuffix ?? "";
  const trimmedUnit = rawSuffixCandidate.trim();
  const hasExplicitLeadingSpace = /^\s+/.test(rawSuffixCandidate);
  const isCompoundRateUnit = trimmedUnit.startsWith("/");
  const spaceBeforeUnit =
    Boolean(trimmedUnit) &&
    !isCompoundRateUnit &&
    (hasExplicitLeadingSpace ||
      Boolean(parsedFromRaw?.hasSpaceBeforeSuffix) ||
      SPACED_UNITS.has(trimmedUnit.toLowerCase()));

  const fullText = `${signPrefix}${currencyPrefix}${numberText}${ratioTail}${
    trimmedUnit ? (spaceBeforeUnit ? ` ${trimmedUnit}` : trimmedUnit) : ""
  }`;

  return {
    signPrefix,
    currencyPrefix,
    numberText,
    ratioTail,
    unitSuffix: trimmedUnit,
    spaceBeforeUnit,
    isCompoundRateUnit,
    fullText,
  };
}

/**
 * DataTicker Component
 * Animated tabular-numerals counter supporting negative currencies (`-$42B`),
 * basis points (`+67 bps`), ratios (`100:1`), multipliers (`+833%`), and grid/energy
 * rate units (`GW`, `TWh`, `/MW-day`) with WCAG AAA Dual-Palette contrast.
 */
export const DataTicker: React.FC<DataTickerProps> = ({
  startValue,
  endValue,
  value,
  ratioDenominator,
  showPlusSign = false,
  atFrame = 0,
  duration = 30,
  prefix = "",
  suffix = "",
  decimals,
  label,
  delta,
  fontSize = 54,
  fontFamily = FONTS.mono,
  color,
  accentColor,
  darkSurface,
  paletteMode,
  enableSfx = true,
  className,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isOverFootage =
    paletteMode === "over-footage" ||
    (paletteMode === undefined && Boolean(darkSurface));

  const resolvedInput = value !== undefined ? value : endValue ?? 0;
  const parsedInput =
    typeof resolvedInput === "string" ? splitNumberUnit(resolvedInput) : null;

  let targetNumeric =
    typeof resolvedInput === "number"
      ? resolvedInput
      : parsedInput?.numericValue ?? 0;

  // If caller passed `prefix="-$"` with unsigned `endValue={42}`, honor the negative sign cleanly
  if (
    typeof resolvedInput === "number" &&
    resolvedInput > 0 &&
    (prefix.indexOf("-") !== -1 || prefix.indexOf("−") !== -1)
  ) {
    targetNumeric = -resolvedInput;
  }

  const defaultStart =
    startValue !== undefined
      ? startValue
      : parsedInput?.isRatio || ratioDenominator !== undefined
      ? 1
      : 0;

  const currentNumeric = countUpValue(
    frame,
    atFrame,
    duration,
    defaultStart,
    targetNumeric,
    fps
  );

  const parts = formatDataTickerParts({
    currentNumeric,
    rawInput: resolvedInput,
    prefix,
    suffix,
    decimals,
    ratioDenominator,
    showPlusSign,
  });

  // WCAG AAA contrast palette (>= 7.5:1 on both #FAF8F3 page and #0F1923 glass)
  const resolvedPrimaryColor =
    color ??
    (isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.navy);
  const resolvedAccentColor =
    accentColor ??
    (isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : PAGE_PALETTE.navy);
  const labelColor = isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : "#384858";
  const textShadow = isOverFootage ? OVER_FOOTAGE_PALETTE.textShadow : undefined;

  const isCounting = frame >= atFrame && frame < atFrame + Math.max(1, duration);
  const shouldPlayTick = enableSfx && isCounting && frame % 4 === 0;

  // WCAG AAA delta chip styling
  const deltaPositive = Boolean(delta?.isPositive);
  const deltaBg = isOverFootage
    ? deltaPositive
      ? "rgba(15, 25, 35, 0.84)"
      : "#842B1C"
    : deltaPositive
    ? "#E3F2F1"
    : PAGE_PALETTE.riskFill;
  const deltaFg = isOverFootage
    ? deltaPositive
      ? "#B8F0EC"
      : OVER_FOOTAGE_PALETTE.textHeadline
    : deltaPositive
    ? "#13524F"
    : "#7E281A";
  const deltaBorder = isOverFootage
    ? deltaPositive
      ? "rgba(79, 179, 174, 0.56)"
      : OVER_FOOTAGE_PALETTE.riskBorder
    : deltaPositive
    ? "rgba(19, 82, 79, 0.32)"
    : PAGE_PALETTE.riskBorder;

  return (
    <>
      {shouldPlayTick && (
        <SfxCue cue="data-tick" atFrame={frame} volume={0.4} />
      )}

      <div
        className={className}
        style={{
          display: "inline-flex",
          flexDirection: "column",
          gap: "5px",
          fontFamily,
          userSelect: "none",
          ...TABULAR_NUM_STYLE,
          ...style,
        }}
      >
        {label && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: getOpticalTracking(12, "mono"),
              color: labelColor,
              textTransform: "uppercase",
              textShadow,
            }}
          >
            {label}
          </span>
        )}

        <div
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              fontSize,
              fontWeight: 700,
              color: resolvedPrimaryColor,
              letterSpacing: getOpticalTracking(fontSize, "mono"),
              lineHeight: 1,
              whiteSpace: "nowrap",
              textShadow,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {parts.signPrefix && (
              <span
                style={{
                  color:
                    parts.signPrefix === "-"
                      ? isOverFootage
                        ? "#F29B86"
                        : "#842B1C"
                      : resolvedAccentColor,
                  marginRight: "0.02em",
                }}
              >
                {parts.signPrefix}
              </span>
            )}
            {parts.currencyPrefix && (
              <span
                style={{
                  color: resolvedAccentColor,
                  fontSize: "0.82em",
                  marginRight: "0.04em",
                }}
              >
                {parts.currencyPrefix}
              </span>
            )}
            <span>{parts.numberText}</span>
            {parts.ratioTail && (
              <span
                style={{
                  color: resolvedAccentColor,
                  fontWeight: 600,
                }}
              >
                {parts.ratioTail}
              </span>
            )}
            {parts.unitSuffix && (
              <span
                style={{
                  color: resolvedAccentColor,
                  fontSize: parts.isCompoundRateUnit
                    ? "0.52em"
                    : parts.spaceBeforeUnit
                    ? "0.58em"
                    : "0.78em",
                  fontWeight: 700,
                  letterSpacing: parts.spaceBeforeUnit ? "0.04em" : "-0.01em",
                  marginLeft: parts.spaceBeforeUnit ? "0.22em" : "0.05em",
                }}
              >
                {parts.unitSuffix}
              </span>
            )}
          </span>

          {delta && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "6px",
                whiteSpace: "nowrap",
                backgroundColor: deltaBg,
                color: deltaFg,
                border: `1px solid ${deltaBorder}`,
                textShadow: isOverFootage ? textShadow : undefined,
                ...TABULAR_NUM_STYLE,
              }}
            >
              <span>{deltaPositive ? "▲" : "▼"}</span>
              <span>{delta.value}</span>
              {delta.label && (
                <span
                  style={{
                    opacity: 0.92,
                    fontSize: "10.5px",
                    marginLeft: "3px",
                  }}
                >
                  {delta.label}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </>
  );
};
