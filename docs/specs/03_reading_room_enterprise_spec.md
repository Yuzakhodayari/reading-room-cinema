# The Reading Room Studio (Enterprise / Cinema Edition)
## Visual Identity, Optical Rendering Stack, Typography, Motion Physics, and Procedural Audio Specification

Workspace target: greenfield Remotion studio engine for [video_01_script.md](file:///d:/Youtube%20channel/video_01_script.md) (`1920x1080` master reference coordinate grid, scalable via `unit = width / 1920` to `3840x2160` 4K cinema masters at `30fps` or `60fps`).

---

## 1. Multi-Register Aesthetic System (`src/design-system/tokens/colors.ts`)

### 1.1 Architectural Invariants ("The Reading Room" DNA)
Three physical substrates share one invariant editorial skeleton so tonal shifts read as moving from a library folio table to an instrument lamp to an engineering drafting plate inside the same room.
- **Zero Pure Extremes**: `#000000`, `#FFFFFF`, neon cyan/magenta gradients, and CSS frosted glass blur cards are excluded at the token layer. Even dark registers carry warm lamp-lit undertones (`#F2ECE1` bone ink on `#111315` warm slate).
- **Shared Spatial Skeleton**: Outer safe margin stays fixed at `96px` (`1080p`) / `192px` (`4K`). Masthead folio bar (`y = 44px`), `1px` hairline divider (`y = 76px`), and source-citation baseline (`y = 1040px`) occupy identical coordinates in all three registers.
- **Perceptual OKLCH Cross-Dissolve (`RegisterBridge`)**: Register switches run across `18 frames` (`0.60s @ 30fps`) by interpolating surface colors in cylindrical OKLCH (`L`, `C`, shortest-arc `H`) paired with a `6%` exposure dip at frame `9`, avoiding muddy sRGB mid-gray dead zones. Hard register cuts occur only on gavel/veto impact frames (`heavyStamp`).

### 1.2 Verified Color Tokens & WCAG 2.1 Relative Luminance Contrast Matrix
Every primary ink, secondary ink, muted footnote ink, and primary numeric figure accent meets **WCAG AAA ($\ge 7.0:1$)** against its register canvas (`bg.canvas`).

#### Register I: `archival_parchment` (Court Rulings, Treasury Table 9, 1912 Coal Scrip, 1941 Ration Books)
| Token Role | Hex | OKLCH | Rel. Luminance $L$ | Contrast vs `bg.canvas` | Editorial Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg.canvas` | `#F4EFE6` | `oklch(95.1% 0.014 82.5)` | `0.8668` | `1.00 : 1` | Aged cotton rag base sheet |
| `bg.elevated` | `#FAF7F1` | `oklch(97.5% 0.009 84.0)` | `0.9284` | `1.07 : 1` | Mounted vellum slip / court excerpt card |
| `bg.recessed` | `#EAE2D3` | `oklch(91.4% 0.022 81.2)` | `0.7789` | `1.11 : 1` | Ledger column header well |
| `ink.primary` | `#181614` | `oklch(20.1% 0.006 67.0)` | `0.0082` | **`15.75 : 1` (AAA)** | Headlines, primary ledger figures, rulings |
| `ink.secondary` | `#3D3832` | `oklch(34.2% 0.012 68.5)` | `0.0405` | **`10.13 : 1` (AAA)** | Subheads, axis labels, body excerpts |
| `ink.muted` | `#544D44` | `oklch(42.2% 0.015 68.0)` | `0.0762` | **`7.27 : 1` (AAA)** | Source citations, margin folios, dates |
| `rule.hairline` | `#D4C9B8` | `oklch(84.0% 0.022 79.5)` | `0.6012` | `1.41 : 1` | `1px` ledger row dividers & outer grid |
| `rule.oxford` | `#2B2723` | `oklch(27.5% 0.009 67.5)` | `0.0198` | `13.14 : 1` | `2.5px` masthead & table top-border rule |
| `accent.liability` | `#8C1D18` | `oklch(41.8% 0.148 26.5)` | `0.0652` | **`7.96 : 1` (AAA)** | Deficit crimson: vetoes, cuts, 25% scrip loss |
| `accent.capital` | `#6E450B` | `oklch(41.5% 0.092 70.0)` | `0.0757` | **`7.29 : 1` (AAA)** | Antique bronze: scrip face value, interest |
| `accent.solvent` | `#1B4D3E` | `oklch(38.6% 0.064 168.0)` | `0.0589` | **`8.42 : 1` (AAA)** | Treasury forest: paycheck receipts, solvent flow |
| `accent.statutory` | `#1D3557` | `oklch(33.4% 0.076 255.0)` | `0.0350` | **`10.79 : 1` (AAA)** | Prussian ink: statutory formulas, judicial cites |
| `accent.wash` | `#E9C46A` | `oklch(83.2% 0.122 86.0)` | `0.5890` | **`13.89 : 1` (AAA)**\* | Felt highlighter (`multiply @ 0.55` under `#181614`) |

*\*Measured `#181614` ink over `#EFE0B9` composite multiply wash ($L = 0.758$).*

#### Register II: `midnight_telemetry` ($40.5T Debt, CBO Interest, Hyperscaler Capex, PJM +833% Auctions)
| Token Role | Hex | OKLCH | Rel. Luminance $L$ | Contrast vs `bg.canvas` | Editorial Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg.canvas` | `#111315` | `oklch(18.5% 0.005 248.0)` | `0.0064` | `1.00 : 1` | Warm obsidian desk surface |
| `bg.elevated` | `#191C20` | `oklch(22.6% 0.007 250.0)` | `0.0116` | `1.09 : 1` | Smoked telemetry card (`AAA >= 7.23:1` kept) |
| `bg.recessed` | `#0B0C0E` | `oklch(15.2% 0.004 252.0)` | `0.0036` | `1.05 : 1` | Chart plot well |
| `ink.primary` | `#F2ECE1` | `oklch(94.2% 0.015 83.0)` | `0.8431` | **`15.84 : 1` (AAA)** | Primary macro figures, chart titles |
| `ink.secondary` | `#B8B0A2` | `oklch(75.8% 0.018 82.0)` | `0.4385` | **`8.66 : 1` (AAA)** | Axis labels, series legends, units |
| `ink.muted` | `#A79F91` | `oklch(70.2% 0.018 81.5)` | `0.3512` | **`7.11 : 1` (AAA)** | Source footnotes, minor tick labels |
| `rule.hairline` | `#262A30` | `oklch(28.4% 0.009 252.0)` | `0.0221` | `1.28 : 1` | `1px` telemetry reticle grid |
| `rule.oxford` | `#4A4F57` | `oklch(42.5% 0.011 252.0)` | `0.0768` | `2.25 : 1` | Zero-axis baseline & card frame |
| `accent.liability` | `#F48C7F` | `oklch(72.4% 0.138 28.5)` | `0.3953` | **`7.90 : 1` (AAA)** | Signal coral: `-$42B` FCF, `+833%` shock, debt |
| `accent.capital` | `#E5A93C` | `oklch(76.8% 0.148 78.5)` | `0.4536` | **`8.93 : 1` (AAA)** | Telemetry brass: `$820B` capex, `$2.1T` interest |
| `accent.solvent` | `#6CC4A1` | `oklch(76.2% 0.098 164.0)` | `0.4524` | **`8.91 : 1` (AAA)** | Verdigris mint: `+20%` productivity, real output |
| `accent.statutory` | `#8AB4D8` | `oklch(75.0% 0.074 244.0)` | `0.4300` | **`8.51 : 1` (AAA)** | Iceberg steel: 1947 baseline, CBO forecast band |

#### Register III: `drafting_blueprint` (Circular Flow Toy Model, Escape-Hatch State Machines, 5GW Grid Bottlenecks)
| Token Role | Hex | OKLCH | Rel. Luminance $L$ | Contrast vs `bg.canvas` | Editorial Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bg.canvas` | `#0F2236` | `oklch(25.2% 0.052 248.5)` | `0.0151` | `1.00 : 1` | Prussian cyanotype drafting plate |
| `bg.elevated` | `#162E47` | `oklch(29.8% 0.058 248.5)` | `0.0258` | `1.16 : 1` | Schematic node box & callout block |
| `bg.recessed` | `#0A1726` | `oklch(20.4% 0.044 249.0)` | `0.0085` | `1.11 : 1` | Diazo valve trench |
| `ink.primary` | `#F4F1EA` | `oklch(95.8% 0.009 85.0)` | `0.8808` | **`14.29 : 1` (AAA)** | Node titles, equations, primary flow rates |
| `ink.secondary` | `#BFD3E6` | `oklch(85.4% 0.035 242.0)` | `0.6338` | **`10.50 : 1` (AAA)** | Pipe dimensions, state labels |
| `ink.muted` | `#94B2CC` | `oklch(74.6% 0.050 243.0)` | `0.4250` | **`7.29 : 1` (AAA)** | Scale ticks, schematic footnotes |
| `rule.hairline` | `#234161` | `oklch(37.2% 0.062 248.0)` | `0.0482` | `1.51 : 1` | `24px` minor architectural grid |
| `rule.oxford` | `#335980` | `oklch(45.5% 0.072 247.5)` | `0.0914` | `2.17 : 1` | `120px` major grid & dimension witness lines |
| `accent.liability` | `#FF9B82` | `oklch(76.4% 0.132 34.0)` | `0.4631` | **`7.88 : 1` (AAA)** | Luminous vermilion chalk: primary bottleneck figures |
| `accent.liabilityStroke` | `#E04F33` | `oklch(62.8% 0.188 32.0)` | `0.2440` | `4.51 : 1` (Gfx AA+) | Red-lead grease pencil: `3px` blocked valve strokes |
| `accent.capital` | `#F7C35C` | `oklch(83.6% 0.138 83.5)` | `0.5958` | **`9.92 : 1` (AAA)** | Drafting amber: `5GW` load, `945 TWh` demand |
| `accent.solvent` | `#7CE0E6` | `oklch(84.8% 0.094 198.0)` | `0.6334` | **`10.49 : 1` (AAA)** | Circuit cyan: permitted flow, closed-loop nominal |
| `accent.statutory` | `#BFD3E6` | `oklch(85.4% 0.035 242.0)` | `0.6338` | **`10.50 : 1` (AAA)** | Blueprint vellum: statutory rules & tolerances |

### 1.3 Semantic Accent Locks (Cross-Register Invariance)
Components never request raw colors (`amber`, `red`, `green`). Scene components bind strictly to four semantic keys (`SemanticRole = 'liability' | 'capital' | 'solvent' | 'statutory'`), and maximum two semantic accents may appear on screen simultaneously:
1. **`liability`**: Debt principal, fiscal deficit, veto cuts, negative FCF, 20% compute-scrip exit penalty, 5-to-10-year transformer queue bottleneck.
2. **`capital`**: Hyperscaler capex, net debt interest service, token budget allowance, megawatt load demand.
3. **`solvent`**: W-2 paycheck tax receipts, real output productivity, cleared grid capacity.
4. **`statutory`**: Court holdings (*Wielechowski v. State*), statutory PFD formula, historical baseline series.

```ts
// src/design-system/tokens/colors.ts
export type RegisterId = 'archival_parchment' | 'midnight_telemetry' | 'drafting_blueprint';
export type SemanticRole = 'liability' | 'capital' | 'solvent' | 'statutory';

export interface RegisterPalette {
  id: RegisterId;
  bg: { canvas: string; elevated: string; recessed: string };
  ink: { primary: string; secondary: string; muted: string };
  rule: { hairline: string; oxford: string };
  accent: Record<SemanticRole, string> & {
    liabilityStroke: string;
    highlighterWash: string;
    highlighterBlend: 'multiply' | 'screen';
  };
  vignetteRgba: string;
  grainOpacity: number;
}

export const REGISTERS: Record<RegisterId, RegisterPalette> = {
  archival_parchment: {
    id: 'archival_parchment',
    bg: { canvas: '#F4EFE6', elevated: '#FAF7F1', recessed: '#EAE2D3' },
    ink: { primary: '#181614', secondary: '#3D3832', muted: '#544D44' },
    rule: { hairline: '#D4C9B8', oxford: '#2B2723' },
    accent: {
      liability: '#8C1D18',
      liabilityStroke: '#8C1D18',
      capital: '#6E450B',
      solvent: '#1B4D3E',
      statutory: '#1D3557',
      highlighterWash: 'rgba(233, 196, 106, 0.55)',
      highlighterBlend: 'multiply',
    },
    vignetteRgba: 'rgba(28, 22, 16, 0.14)',
    grainOpacity: 0.034,
  },
  midnight_telemetry: {
    id: 'midnight_telemetry',
    bg: { canvas: '#111315', elevated: '#191C20', recessed: '#0B0C0E' },
    ink: { primary: '#F2ECE1', secondary: '#B8B0A2', muted: '#A79F91' },
    rule: { hairline: '#262A30', oxford: '#4A4F57' },
    accent: {
      liability: '#F48C7F',
      liabilityStroke: '#E85D4E',
      capital: '#E5A93C',
      solvent: '#6CC4A1',
      statutory: '#8AB4D8',
      highlighterWash: 'rgba(229, 169, 60, 0.20)',
      highlighterBlend: 'screen',
    },
    vignetteRgba: 'rgba(4, 6, 10, 0.26)',
    grainOpacity: 0.030,
  },
  drafting_blueprint: {
    id: 'drafting_blueprint',
    bg: { canvas: '#0F2236', elevated: '#162E47', recessed: '#0A1726' },
    ink: { primary: '#F4F1EA', secondary: '#BFD3E6', muted: '#94B2CC' },
    rule: { hairline: '#234161', oxford: '#335980' },
    accent: {
      liability: '#FF9B82',
      liabilityStroke: '#E04F33',
      capital: '#F7C35C',
      solvent: '#7CE0E6',
      statutory: '#BFD3E6',
      highlighterWash: 'rgba(247, 195, 92, 0.22)',
      highlighterBlend: 'screen',
    },
    vignetteRgba: 'rgba(3, 9, 18, 0.26)',
    grainOpacity: 0.032,
  },
};
```

---

## 2. Typography & Optical Micro-Craft (`src/design-system/typography/`)

### 2.1 Deterministic Font Triad (Offline WOFF2 + `@remotion/google-fonts` Dual Lock)
1. **Editorial Serif Display & Judicial/Historical Excerpts**: **`Newsreader`** (`@remotion/google-fonts/Newsreader` + `@fontsource-variable/newsreader`)
   - Variable optical size axis `opsz 6..72` sharpens hairlines on `72px–96px` chapter theses (`'opsz' 64`) while thickening serifs on `22px` court excerpts (`'opsz' 18`). True italic cut handles case citations (*Wielechowski v. State*) and periodical titles (*The Economist*).
2. **Institutional UI / Axis / Callout Grotesque**: **`IBM Plex Sans`** (`@remotion/google-fonts/IBMPlexSans` + `@fontsource/ibm-plex-sans`)
   - Shares identical x-height (`0.528`), cap-height (`0.698`), and ascender/descender metrics with `IBM Plex Mono`, enabling zero-shift inline mixing of prose labels and tabular figures.
3. **Archival Ledger & Financial Telemetry Monospace**: **`IBM Plex Mono`** (`@remotion/google-fonts/IBMPlexMono` + `@fontsource/ibm-plex-mono`)
   - Crisp `tnum` width lock (`0.60em` per glyph), distinct slashed zero (`zero`), and archival typewriter authority without terminal-hacker clichés.

#### 100% Deterministic Offline/Online Loader (`src/design-system/typography/fonts.ts`)
`@remotion/google-fonts` fetches subsets over HTTPS unless local binaries are bundled. To guarantee bit-identical renders across offline machines and multi-worker CI farms without network timeouts, bundle WOFF2 subsets via `@fontsource` imports at root entry and gate Remotion frame rendering on `document.fonts.ready` with `@remotion/google-fonts` fallback:

```ts
// src/design-system/typography/fonts.ts
import '@fontsource-variable/newsreader';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import { continueRender, delayRender } from 'remotion';

export const FONT_FAMILIES = {
  serif: '"Newsreader Variable", "Newsreader", Georgia, serif',
  sans: '"IBM Plex Sans", -apple-system, sans-serif',
  mono: '"IBM Plex Mono", monospace',
} as const;

let fontsLoaded = false;
export function ensureStudioFontsLoaded(): void {
  if (fontsLoaded || typeof document === 'undefined') return;
  const handle = delayRender('Load Reading Room WOFF2 Typefaces');
  Promise.all([
    document.fonts.load('600 72px "Newsreader Variable"'),
    document.fonts.load('italic 400 32px "Newsreader Variable"'),
    document.fonts.load('500 24px "IBM Plex Sans"'),
    document.fonts.load('600 64px "IBM Plex Mono"'),
    document.fonts.ready,
  ])
    .then(() => {
      fontsLoaded = true;
      continueRender(handle);
    })
    .catch((err) => {
      continueRender(handle);
      throw err;
    });
}
```

### 2.2 Optical Tracking, OpenType Locks, & Editorial Furniture
- **Continuous Optical Tracking Formula** (for non-uppercase text at pixel size $s$):
  $$\text{tracking}(s) = \text{clamp}\!\left(-0.030,\; -0.006 - 0.022 \cdot \frac{s - 20}{100},\; +0.008\right)\text{ em}$$
- **Type Scale & OpenType Feature Table (`1920x1080` reference)**:
  - `heroFigure` (`IBM Plex Mono 600`, `112px`, `lh: 0.96`, `ls: -0.030em`): `fontVariantNumeric: 'tabular-nums lining-nums slashed-zero'`, `fontFeatureSettings: '"tnum" 1, "lnum" 1, "zero" 1'`. Currency symbols (`$`) and unit suffixes (`T`, `%`, `/MW-day`) render at `0.58em` super-aligned (`verticalAlign: '0.24em'`) with `0.06em` tighter kerning so digits dominate visual mass.
  - `displayThesis` (`Newsreader 500`, `68px`, `lh: 1.06`, `ls: -0.020em`): `fontVariationSettings: '"opsz" 64'`, `fontFeatureSettings: '"kern" 1, "liga" 1, "lnum" 1'`.
  - `archivalQuote` (`Newsreader 400 Italic`, `34px`, `lh: 1.32`, `ls: -0.008em`): `fontVariationSettings: '"opsz" 28'`, `paddingInline: '0.08em'` (prevents italic overhang clipping).
  - `dataLabel` (`IBM Plex Sans 500`, `22px`, `lh: 1.35`, `ls: -0.004em`): `fontFeatureSettings: '"tnum" 1, "lnum" 1'`.
  - `chapterBug` & `marginFolio` (`IBM Plex Mono 500`, `13px` UPPERCASE, `lh: 1.20`, `ls: +0.13em`): Positioned at `(x: 96, y: 44)` (`[ CH. 03 // ESCAPE HATCH II: COMPUTE SCRIP ]`) and right-aligned at `(x: 1824, y: 44)` (`FOLIO 021 / 038`), separated from the stage by a `1728px` hairline at `y = 76px`.
  - `sourceFootnote` (`IBM Plex Sans 400`, `13.5px`, `lh: 1.30`, `ls: +0.01em`, `ink.muted`): Locked at `(x: 96, y: 1036)`, prefixed with `§ ` in `IBM Plex Mono`.
  - **Diagonal Fractions (`<EditorialFraction num={2} denom={3} />`)**: Uses OpenType `fontFeatureSettings: '"frac" 1'` on single-digit ratios (`2/3`), falling back for multi-digit ratios (`16/28`) to numerator at `0.62em` (`verticalAlign: '0.34em'`), fraction slash `\u2044` (`marginInline: '-0.06em'`), and denominator at `0.62em` (`verticalAlign: '-0.08em'`).

### 2.3 Anti-Clipping Auto-Fit & Balanced Rag Math (`src/design-system/typography/fitText.ts`)
Uses `@remotion/layout-utils` (`measureText`) inside a 10-step deterministic binary search with safety factor $\tau = 0.965$ (`3.5%` subpixel & italic-swash guard) plus minimum raggedness line balancing so headlines never orphan a trailing year or unit:

```ts
// src/design-system/typography/fitText.ts
import { measureText } from '@remotion/layout-utils';

export interface FitTextSpec {
  text: string;
  fontFamily: string;
  fontWeight: number | string;
  maxWidth: number;
  maxHeight: number;
  maxLines: number;
  minFontSize?: number;
  maxFontSize: number;
  lineHeight: number;
  letterSpacingEm?: number;
}

export function fitAndBalanceText(spec: FitTextSpec): { fontSize: number; lines: string[] } {
  const safety = 0.965;
  const targetW = spec.maxWidth * safety;
  const targetH = spec.maxHeight * safety;
  const words = spec.text.trim().split(/\s+/);

  const layoutAtSize = (size: number): { fits: boolean; lines: string[] } => {
    const lsPx = `${((spec.letterSpacingEm ?? -0.015) * size).toFixed(2)}px`;
    const measure = (str: string) =>
      measureText({
        text: str,
        fontFamily: spec.fontFamily,
        fontSize: size,
        fontWeight: spec.fontWeight,
        letterSpacing: lsPx,
      }).width;

    // Greedy check for line count feasibility
    const greedy: string[] = [];
    let current = '';
    for (const w of words) {
      const candidate = current ? `${current} ${w}` : w;
      if (measure(candidate) <= targetW) {
        current = candidate;
      } else {
        if (!current || measure(w) > targetW) return { fits: false, lines: [] };
        greedy.push(current);
        current = w;
      }
    }
    if (current) greedy.push(current);
    const totalH = greedy.length * size * spec.lineHeight;
    if (greedy.length > spec.maxLines || totalH > targetH) return { fits: false, lines: [] };

    // Dynamic programming minimum-raggedness (Knuth-Plass quadratic penalty, prevents 1-word orphans)
    const n = words.length;
    const L = greedy.length;
    const idealW = targetW * 0.88;
    const dp: number[] = Array(n + 1).fill(Infinity);
    const nextIdx: number[] = Array(n + 1).fill(n);
    dp[n] = 0;

    for (let i = n - 1; i >= 0; i--) {
      for (let j = i + 1; j <= n; j++) {
        const slice = words.slice(i, j).join(' ');
        const w = measure(slice);
        if (w > targetW) break;
        const isLastLine = j === n;
        const orphanPenalty = isLastLine && j - i === 1 && n > 2 ? (targetW * 0.45) ** 2 : 0;
        const slackPenalty = isLastLine ? (Math.max(0, idealW * 0.55 - w)) ** 2 : (idealW - w) ** 2;
        const cost = slackPenalty + orphanPenalty + dp[j];
        if (cost < dp[i]) {
          dp[i] = cost;
          nextIdx[i] = j;
        }
      }
    }

    const balanced: string[] = [];
    let cursor = 0;
    while (cursor < n) {
      balanced.push(words.slice(cursor, nextIdx[cursor]).join(' '));
      cursor = nextIdx[cursor];
    }
    return {
      fits: balanced.length <= spec.maxLines && balanced.length * size * spec.lineHeight <= targetH,
      lines: balanced.length <= spec.maxLines ? balanced : greedy,
    };
  };

  let lo = spec.minFontSize ?? Math.round(spec.maxFontSize * 0.52);
  let hi = spec.maxFontSize;
  let bestSize = lo;
  let bestLines = [spec.text];

  for (let iter = 0; iter < 10; iter++) {
    const mid = (lo + hi) * 0.5;
    const res = layoutAtSize(mid);
    if (res.fits) {
      bestSize = mid;
      bestLines = res.lines;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { fontSize: Math.floor(bestSize * 2) / 2, lines: bestLines };
}
```

---

## 3. Optical Post-Processing & 2.5D Camera Rig (`src/design-system/optics/`)

### 3.1 Six-Plane Atmospheric Compositing Stack (`<ReadingRoomStage>`)
Rendered back-to-front inside `AbsoluteFill`:
1. **Plane 0 (Substrate Illumination)**: `palette.bg.canvas` + radial tungsten key-light (`radial-gradient(115% 90% at 50% 40%, rgba(255,250,240,0.04) 0%, transparent 72%)`).
2. **Plane 1 (Ruled Archival / Telemetry / Blueprint Gridlines)**: Moves at `0.94x` camera pan parallax.
   - `archival_parchment`: `48px` horizontal ruled hairlines (`opacity: 0.26`) + double vertical accounting margin rule at `x = 96px` & `x = 101px` (`opacity: 0.20`).
   - `midnight_telemetry`: `120px × 120px` hairline grid (`#262A30`) with `7px` `+` reticles at vertices (`opacity: 0.48`).
   - `drafting_blueprint`: `120px` major rule (`#335980`) + `24px` minor rule (`#234161`) + `6px` perimeter millimeter ticks along the `96px` outer frame.
3. **Plane 2 (2.5D Camera Rig & Three Depth Planes)**:
   - `DepthPlane z = -120` (`parallax: 0.88x`, background archival ledger / context map)
   - `DepthPlane z = 0` (`parallax: 1.00x`, primary chart / court ruling / schematic)
   - `DepthPlane z = +85` (`parallax: 1.08x`, callout annotations / verdict stamps)
4. **Plane 3 (Achromatic Glass Loupe `<OpticalLoupe>`)**:
   - Clipped circle of radius $R \in [190\text{px}, 260\text{px}]$ at focal point $(x_L, y_L)$ rendering a cloned scene subtree with magnification $M \in [1.85, 2.50]$:
     $$\text{transform}_{\text{magnified}} = \text{translate}(x_L, y_L)\;\text{scale}(M)\;\text{translate}(-x_L, -y_L)$$
   - Exterior stage dims by `18%` and blurs by `3.2px`. Rim stack: `4px` brushed brass bezel (`#B08D57` in Reg I/II, `#7A9BB8` steel in Reg III), `1.5px` opposing warm/cool chromatic dispersion inset rings, `135deg` crescent glass reflection (`opacity: 0.13`), and dual-elevation shadow (`0 28px 56px rgba(8,10,14,0.42)`).
5. **Plane 4 (Chisel-Nib Ink Highlighter `<HighlighterStroke>`)**:
   - Uses `@remotion/paths` `evolvePath(progress, pathD)` on a `14deg` beveled stroke whose control points carry deterministic `@remotion/noise` `noise2D('nib', i * 0.35, seed) * 1.4` baseline wobble and `-1.8px` mid-stroke wrist arc.
   - SVG filter applies `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" />` + `<feDisplacementMap scale="1.5" />` so wet ink catches paper fibers, composited via `palette.accent.highlighterBlend` (`multiply` on parchment, `screen` underlay box on dark registers).
6. **Plane 5 (2-Frame Stepped 16mm Grain + $\cos^4 \theta$ Natural Vignette)**:
   - **Celluloid Micro-Grain**: Monochrome SVG `<feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="2" seed={(Math.floor(frame / 2) * 37) % 997} />` -> `<feColorMatrix type="saturate" values="0" />` at `palette.grainOpacity` (`0.030–0.034`). Stepping `Math.floor(frame / 2)` holds grain on 2s so YouTube's VP9/AV1 encoder preserves filmic texture instead of smearing frame-by-frame digital noise.
   - **$\cos^4 \theta$ Optical Vignette**: Approximates lens corner illumination falloff $I(r) = \cos^4(0.52 r)$ via a multi-stop `radial-gradient(ellipse 82% 78% at 50% 48%, transparent 46%, ... 100%)` ending at `palette.vignetteRgba`.

### 3.2 2.5D Camera Rig Equations (`src/design-system/optics/CameraRig25D.tsx`)
For frame $f$, frame rate $\text{fps}$, and depth plane $z_i \in \{-120, 0, +85\}$:
1. **Logarithmic `dollyPush` (Constant Optical Velocity)**:
   Linear scale interpolation visually decelerates as $S$ grows. Optical focal push interpolates exponentially:
   $$S(p) = S_0 \cdot \left(\frac{S_1}{S_0}\right)^{p}, \quad \text{standard documentary creep: } S_0 = 1.000,\; S_1 = 1.042$$
2. **Depth-Adjusted `pan` + Optional Micro-Float**:
   $$\text{parallax}_i = 1 + \frac{z_i}{1000}, \quad X_i(f) = -\text{panX}(f) \cdot \text{parallax}_i + A_{\text{float}} \cdot \text{noise2D}(\text{'cx'}, f / (6.5 \cdot \text{fps}), \text{seed})$$
   where $A_{\text{float}} = 2.0\text{px}$ on archival vignettes and $0.0\text{px}$ on precision telemetry charts.
3. **`dutchMicro`**:
   $$\theta_z(f) \in [-1.15^\circ, +1.15^\circ]$$
   Applied strictly during structural disequilibrium reveals and restored to $0.00^\circ$ via `cameraGlide`.
4. **`focusPull` (Thin-Lens Circle of Confusion)**:
   $$\sigma_i(f) = \min\!\left(14.0,\; \frac{|z_i - z_{\text{focus}}(f)|}{f_{\text{stop}} \cdot 12.5}\right)\text{ px}, \quad \text{filter}_i = \sigma_i > 0.15 \;\text{?}\; \text{\`blur(}\sigma_i\text{px)\`} : \text{'none'}$$
   Thresholding at `0.15px` guarantees the in-focus plane ($z_i = z_{\text{focus}}$) bypasses Chromium blur rasterization completely, keeping vector text razor-sharp.
5. **`shakeImpact` (Damped Multi-Harmonic Verdict Impulse)**:
   Triggered at $f_{\text{hit}}$ with normalized intensity $I \in [0.4, 1.0]$, elapsed time $u = \max(0, (f - f_{\text{hit}}) / \text{fps})$:
   $$\Delta x(u) = 6.5 I \cdot e^{-16 u} \sin(46 u)\text{ px}, \quad \Delta y(u) = -8.8 I \cdot e^{-16 u} \cos(62 u)\text{ px}, \quad \Delta \theta(u) = 0.22^\circ I \cdot e^{-18 u} \sin(34 u)$$
   Decays below `0.08px` in `280ms` (`8.4 frames @ 30fps`) with deterministic directional anvil recoil.

---

## 4. Critically-Damped Motion Physics Library (`src/design-system/physics/springs.ts`)

### 4.1 Oscillator Verification & Zero-Overshoot Law
Remotion's `spring()` solves $m\ddot{x} + c\dot{x} + k(x - 1) = 0$. Critical damping occurs at $c_{\text{crit}} = 2\sqrt{k m}$, giving damping ratio:
$$\zeta = \frac{c}{2\sqrt{k m}}, \quad \omega_n = \sqrt{\frac{k}{m}}$$
**Hard Studio Rule**: Every preset enforces $\zeta \ge 1.00$ (`0.00%` cartoon bounce overshoot) verified at module boot via `assertCriticallyDamped()`.

| Preset Name | `mass` $m$ | `stiffness` $k$ | `damping` $c$ | `overshootClamping` | Ratio $\zeta$ | $\omega_n$ (rad/s) | $T_{99}$ Settle (`@30fps` / `@60fps`) | Choreographic Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `editorialSnap` | `1.00` | `310` | `36.0` | `false` | **`1.022`** | `17.61` | `385ms` (`12f` / `23f`) | Headlines, stat callouts, lower-thirds, axis labels |
| `archivalSettle` | `1.40` | `165` | `33.0` | `false` | **`1.086`** | `10.86` | `635ms` (`19f` / `38f`) | Ledger sheets, court filings, coal scrip, ration books |
| `heavyStamp` | `0.85` | `1180` | `64.0` | `true` | **`1.010`** | `37.26` | `178ms` (`5.5f` / `11f`) | Verdict seals (`VETOED`, `FLSA 1938`) from `scale 1.30 -> 1.00` |
| `mechanicalTick` | `0.55` | `1320` | `54.0` | `true` | **`1.002`** | `48.99` | `136ms` (`4f` / `8f`) | Odometer digits, fiscal year flips, ration point step-downs |
| `cameraGlide` | `2.20` | `105` | `33.5` | `false` | **`1.102`** | `6.91` | `1020ms` (`31f` / `61f`) | 2.5D camera pans, loupe relocation, rack-focus transitions |
| `inkSweep` | `1.10` | `195` | `31.0` | `true` | **`1.058`** | `13.31` | `515ms` (`15.5f` / `31f`) | SVG curve evolution, felt-tip highlights, hairline rules |

### 4.2 Jerk-Free Fluid-Head Camera Wrapper & Bounded Logarithmic Stagger
A raw 2nd-order spring starts with peak acceleration $\ddot{x}(0) = k/m$ on frame `0`, causing a visible startle on wide camera pans. `fluidCameraSpring()` blends a 6-frame ($200\text{ms}$) smoothstep velocity ramp into `cameraGlide` (equivalent to an OConnor fluid-head drag engage), eliminating frame-0 jerk while preserving the exact $\zeta = 1.102$ deceleration tail.

```ts
// src/design-system/physics/springs.ts
import { spring, SpringConfig } from 'remotion';

export const SPRING_PRESETS = {
  editorialSnap:  { mass: 1.00, stiffness: 310,  damping: 36.0, overshootClamping: false },
  archivalSettle: { mass: 1.40, stiffness: 165,  damping: 33.0, overshootClamping: false },
  heavyStamp:     { mass: 0.85, stiffness: 1180, damping: 64.0, overshootClamping: true  },
  mechanicalTick: { mass: 0.55, stiffness: 1320, damping: 54.0, overshootClamping: true  },
  cameraGlide:    { mass: 2.20, stiffness: 105,  damping: 33.5, overshootClamping: false },
  inkSweep:       { mass: 1.10, stiffness: 195,  damping: 31.0, overshootClamping: true  },
} as const satisfies Record<string, SpringConfig>;

export type SpringPresetName = keyof typeof SPRING_PRESETS;

// Boot-time physics invariant check: bans underdamped cartoon springs (zeta < 1.0)
for (const [name, cfg] of Object.entries(SPRING_PRESETS)) {
  const zeta = cfg.damping / (2 * Math.sqrt(cfg.stiffness * cfg.mass));
  if (zeta < 1.0) {
    throw new Error(`[ReadingRoomPhysics] Preset "${name}" is underdamped (zeta=${zeta.toFixed(3)} < 1.0).`);
  }
}

export function studioSpring(frame: number, fps: number, preset: SpringPresetName, delayFrames = 0): number {
  return spring({
    frame: frame - delayFrames,
    fps,
    config: SPRING_PRESETS[preset],
  });
}

// Eliminates t=0 acceleration step on 2.5D camera moves (OConnor fluid-head S-curve)
export function fluidCameraSpring(frame: number, fps: number, delayFrames = 0): number {
  const localFrame = Math.max(0, frame - delayFrames);
  const raw = studioSpring(frame, fps, 'cameraGlide', delayFrames);
  const rampFrames = Math.round(0.20 * fps);
  const u = Math.min(1, localFrame / Math.max(1, rampFrames));
  const easeIn = u * u * (3 - 2 * u);
  return raw * easeIn;
}

// Bounded logarithmic stagger: prevents 12-row Treasury tables from lagging behind voiceover
export function staggerDelayFrames(
  index: number,
  fps: number,
  stepSec = 0.10,
  maxTotalSec = 0.54,
  compression = 0.35
): number {
  if (index <= 0) return 0;
  const baseStep = stepSec * fps;
  const maxFrames = maxTotalSec * fps;
  const compressed = baseStep * (Math.log(1 + compression * index) / Math.log(1 + compression));
  return Math.round(Math.min(maxFrames, compressed));
}
```

### 4.3 Mandatory Choreographic Stagger Sequence
Every data card, ledger table, or toy-model block builds in four causal beats (`@30fps` offsets):
1. **`+0f` (Structural Rule)**: Hairline border / axis rule draws from `0 -> 100%` via `inkSweep`.
2. **`+3f` (Contextual Label)**: Header, unit, and axis labels enter via `editorialSnap` (`translateY: 10px -> 0px`, `opacity: 0 -> 1` clamped over first `6 frames`).
3. **`+6f` (Primary Figure)**: Hero figure enters (`editorialSnap`) and rolls final `12%` of numeric delta via `mechanicalTick` (`tnum` locked).
4. **`+14f` (Semantic Verdict)**: Highlighter sweep (`inkSweep`) or bottleneck callout locks onto the exact narration stress word.

---

## 5. Procedural Foley & Broadcast Audio Engine (`scripts/generate-sfx.ts` & `scripts/master-audio.mjs`)

### 5.1 Zero-Asset Deterministic Node PCM WAV Synthesizer (`48kHz / 24-bit Stereo`)
Remotion does not capture live browser `AudioContext` output during headless frame rendering; all sound cues must exist as deterministic audio files mounted via `<Audio src={staticFile(...)} />`. `scripts/generate-sfx.ts` synthesizes **24-bit, 48,000 Hz stereo RIFF WAV** cues directly in pure Node.js (`zero` npm audio dependencies, `zero` paid packs) using a seeded `mulberry32` PRNG, Direct-Form-II-Transposed Robert Bristow-Johnson biquad filters, and physical modal resonators. Each cue generates **4 deterministic micro-variants** (`v0..v3`, $\pm 3.5\%$ formant/pitch jitter) selected via `variant = (sceneIndex + cueIndex) % 4` to prevent ear fatigue.

#### Synthesis Specifications (`f_s = 48,000 Hz`)
| Cue ID | Duration | Peak Target | Physical DSP Model |
| :--- | :--- | :--- | :--- |
| `paper_slide` | `340 ms` | `-18.0 dBFS` | 70% Kellet 3-pole pink noise + 30% velvet fiber impulses (`2200 imp/s`) -> dual swept BPF (`620->1100 Hz Q=2.4` body + `3900->2400 Hz Q=1.6` cotton air) -> HPF `180 Hz`, LPF `7.2 kHz`, $\sin^{1.4}(\pi t/T)$ stick-slip envelope. |
| `felt_highlight` | `390 ms` | `-20.0 dBFS` | `8 ms` nib contact transient (`1150 Hz` damped cosine) + pink noise through narrowband capillary friction BPF sweeping `3600->4150 Hz (Q=3.8)` + `950 Hz (Q=1.8)` paper resonance, stereo pan `-0.08 -> +0.08`. |
| `odometer_tick` | `26 ms` | `-19.0 dBFS` | `1.2 ms` impulse + HPF noise burst (`2.8 kHz`) exciting 3-mode brass/polycarbonate escapement (`420 Hz tau=4.5ms`, `1880 Hz tau=3.2ms`, `4650 Hz tau=1.6ms`), vocal-band dipped around `1.2 kHz`. Throttled to $\Delta t \ge 72\text{ ms}$ (`max 13.8 ticks/s`). |
| `archival_stamp` | `440 ms` | `-12.0 dBFS` | `35 ms` pre-impact air whoosh (`LPF 200->900 Hz`, offset `-1 frame` before visual hit) + desk sub-thud pitch drop $f(t)=46+92e^{-t/0.022}\text{ Hz}$ ($\tanh(1.6x)$ warm 2nd/3rd harmonics) + `780 Hz` wood slap + `2650 Hz` paper crush. |
| `sub_swell` | `1600 ms` | `-15.0 dBFS` | Dual detuned analog sines (`55.0 Hz` + `55.35 Hz`) + `110 Hz` 2nd harmonic (`-11 dB` for laptop/phone speaker translation) + pink noise through swept LPF (`140->420->120 Hz`), asymmetric Hann envelope peaking at `t = 0.72 s` (`frame 9` of register bridge). |
| `room_tone` | `12.0 s` loop | `-44.0 dBFS` RMS | Decorrelated L/R pink-brown noise -> HPF `52 Hz`, library room modes (`118 Hz +1.8dB Q=2.2`, `285 Hz +1.2dB Q=1.5`), 2-pole dark velvet LPF `1650 Hz`, click-free `2.0 s` equal-power $\cos/\sin$ loop crossfade. |

#### Complete Node Generator (`scripts/generate-sfx.ts`)
```ts
// scripts/generate-sfx.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SR = 48_000;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class BiquadDF2T {
  private z1 = 0;
  private z2 = 0;
  process(x: number, mode: 'lpf' | 'hpf' | 'bpf', fc: number, q: number): number {
    const w0 = (2 * Math.PI * Math.max(20, Math.min(SR * 0.45, fc))) / SR;
    const cosW = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * Math.max(0.1, q));
    let b0 = 0, b1 = 0, b2 = 0;
    if (mode === 'lpf') {
      b1 = 1 - cosW; b0 = b1 * 0.5; b2 = b0;
    } else if (mode === 'hpf') {
      b0 = (1 + cosW) * 0.5; b1 = -(1 + cosW); b2 = b0;
    } else {
      b0 = alpha; b1 = 0; b2 = -alpha;
    }
    const invA0 = 1 / (1 + alpha);
    const a1 = -2 * cosW * invA0;
    const a2 = (1 - alpha) * invA0;
    const y = b0 * invA0 * x + this.z1;
    this.z1 = b1 * invA0 * x - a1 * y + this.z2;
    this.z2 = b2 * invA0 * x - a2 * y;
    return y;
  }
}

class PinkNoise {
  private b0 = 0; private b1 = 0; private b2 = 0;
  constructor(private rng: () => number) {}
  next(): number {
    const w = this.rng() * 2 - 1;
    this.b0 = 0.99765 * this.b0 + w * 0.099046;
    this.b1 = 0.96300 * this.b1 + w * 0.2965164;
    this.b2 = 0.57000 * this.b2 + w * 1.0526913;
    return (this.b0 + this.b1 + this.b2 + w * 0.1848) * 0.22;
  }
}

function normalizePeakDb(L: Float32Array, R: Float32Array, targetDb: number): void {
  let peak = 1e-9;
  for (let i = 0; i < L.length; i++) {
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const gain = Math.pow(10, targetDb / 20) / peak;
  for (let i = 0; i < L.length; i++) {
    L[i] *= gain;
    R[i] *= gain;
  }
}

function writeWav24Stereo(path: string, L: Float32Array, R: Float32Array): void {
  const numSamples = L.length;
  const dataBytes = numSamples * 2 * 3;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);      // Linear PCM
  buf.writeUInt16LE(2, 22);      // Stereo
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 6, 28); // ByteRate
  buf.writeUInt16LE(6, 32);      // BlockAlign
  buf.writeUInt16LE(24, 34);     // 24-bit
  buf.write('data', 36);
  buf.writeUInt32LE(dataBytes, 40);

  let o = 44;
  for (let i = 0; i < numSamples; i++) {
    for (const s of [L[i], R[i]]) {
      const clamped = Math.max(-1, Math.min(1, s));
      const v = Math.round(clamped * 8388607);
      buf[o] = v & 0xff;
      buf[o + 1] = (v >> 8) & 0xff;
      buf[o + 2] = (v >> 16) & 0xff;
      o += 3;
    }
  }
  writeFileSync(path, buf);
}

export function buildAllSfx(outDir = join(process.cwd(), 'public', 'sfx')): void {
  mkdirSync(outDir, { recursive: true });

  for (let v = 0; v < 4; v++) {
    const detune = 1 + (v - 1.5) * 0.022;
    const rng = mulberry32(1000 + v * 97);

    // 1. paper_slide (340ms, -18 dBFS)
    {
      const N = Math.floor(0.34 * SR);
      const L = new Float32Array(N), R = new Float32Array(N);
      const pink = new PinkNoise(rng);
      const fBody = new BiquadDF2T(), fAir = new BiquadDF2T(), hp = new BiquadDF2T(), lp = new BiquadDF2T();
      for (let i = 0; i < N; i++) {
        const u = i / N;
        const velvet = rng() < 2200 / SR ? (rng() > 0.5 ? 0.6 : -0.6) : 0;
        const src = pink.next() * 0.7 + velvet * 0.3;
        const body = fBody.process(src, 'bpf', (620 + 480 * Math.sin(Math.PI * u)) * detune, 2.4);
        const air = fAir.process(src, 'bpf', (3900 - 1500 * u * u) * detune, 1.6);
        const env = Math.pow(Math.sin(Math.PI * u), 1.4) * (1 + 0.12 * Math.sin(2 * Math.PI * 19 * (i / SR)));
        const sig = lp.process(hp.process((body + air * 0.65) * env, 'hpf', 180, 0.707), 'lpf', 7200, 0.707);
        L[i] = sig * 0.96; R[i] = sig * 1.04;
      }
      normalizePeakDb(L, R, -18.0);
      writeWav24Stereo(join(outDir, `paper_slide_${v}.wav`), L, R);
    }

    // 2. felt_highlight (390ms, -20 dBFS)
    {
      const N = Math.floor(0.39 * SR);
      const L = new Float32Array(N), R = new Float32Array(N);
      const pink = new PinkNoise(rng);
      const fNib = new BiquadDF2T(), fPaper = new BiquadDF2T();
      for (let i = 0; i < N; i++) {
        const t = i / SR, u = i / N;
        const touch = Math.exp(-t / 0.003) * Math.cos(2 * Math.PI * 1150 * detune * t) * 0.25;
        const p = pink.next();
        const nib = fNib.process(p, 'bpf', (3600 + 550 * u) * detune, 3.8);
        const pap = fPaper.process(p, 'bpf', 950 * detune, 1.8) * 0.35;
        const attack = Math.min(1, t / 0.012);
        const release = u > 0.92 ? 0.5 * (1 + Math.cos(Math.PI * ((u - 0.92) / 0.08))) : 1;
        const sig = touch + (nib + pap) * attack * release;
        const pan = -0.08 + 0.16 * u;
        L[i] = sig * (0.5 - pan * 0.5); R[i] = sig * (0.5 + pan * 0.5);
      }
      normalizePeakDb(L, R, -20.0);
      writeWav24Stereo(join(outDir, `felt_highlight_${v}.wav`), L, R);
    }

    // 3. odometer_tick (26ms, -19 dBFS)
    {
      const N = Math.floor(0.026 * SR);
      const L = new Float32Array(N), R = new Float32Array(N);
      const hp = new BiquadDF2T();
      for (let i = 0; i < N; i++) {
        const t = i / SR;
        const click = hp.process((rng() * 2 - 1) * Math.exp(-t / 0.0018), 'hpf', 2800, 0.8) * 0.4;
        const m1 = 0.45 * Math.exp(-t / 0.0045) * Math.sin(2 * Math.PI * 420 * detune * t);
        const m2 = 0.75 * Math.exp(-t / 0.0032) * Math.sin(2 * Math.PI * 1880 * detune * t);
        const m3 = 0.35 * Math.exp(-t / 0.0016) * Math.sin(2 * Math.PI * 4650 * detune * t);
        L[i] = R[i] = click + m1 + m2 + m3;
      }
      normalizePeakDb(L, R, -19.0);
      writeWav24Stereo(join(outDir, `odometer_tick_${v}.wav`), L, R);
    }

    // 4. archival_stamp (440ms including 35ms pre-roll air whoosh, -12 dBFS)
    {
      const N = Math.floor(0.44 * SR);
      const hitIdx = Math.floor(0.035 * SR);
      const L = new Float32Array(N), R = new Float32Array(N);
      const pink = new PinkNoise(rng);
      const fWhoosh = new BiquadDF2T(), fWood = new BiquadDF2T(), fSnap = new BiquadDF2T();
      let phase = 0;
      for (let i = 0; i < N; i++) {
        if (i < hitIdx) {
          const u = i / hitIdx;
          const w = fWhoosh.process(pink.next(), 'lpf', 200 + 700 * u * u, 1.1) * u * u * 0.28;
          L[i] = R[i] = w;
        } else {
          const t = (i - hitIdx) / SR;
          const fInst = (46 + 92 * Math.exp(-t / 0.022)) * detune;
          phase += (2 * Math.PI * fInst) / SR;
          const thud = Math.tanh(1.6 * Math.sin(phase)) * Math.exp(-t / 0.085) * 0.85;
          const n = pink.next();
          const wood = fWood.process(n, 'bpf', 780 * detune, 1.2) * Math.exp(-t / 0.014) * 0.9;
          const snap = fSnap.process(n, 'bpf', 2650 * detune, 1.5) * Math.exp(-t / 0.006) * 0.6;
          L[i] = (thud + wood + snap) * 1.02;
          R[i] = (thud + wood * 0.96 + snap * 1.04) * 0.98;
        }
      }
      normalizePeakDb(L, R, -12.0);
      writeWav24Stereo(join(outDir, `archival_stamp_${v}.wav`), L, R);
    }

    // 5. sub_swell (1600ms, -15 dBFS)
    {
      const N = Math.floor(1.60 * SR);
      const L = new Float32Array(N), R = new Float32Array(N);
      const pinkL = new PinkNoise(rng), pinkR = new PinkNoise(rng);
      const lpL = new BiquadDF2T(), lpR = new BiquadDF2T();
      for (let i = 0; i < N; i++) {
        const t = i / SR, u = i / N;
        const env = u < 0.45
          ? 0.5 * (1 - Math.cos((Math.PI * u) / 0.45))
          : 0.5 * (1 + Math.cos((Math.PI * (u - 0.45)) / 0.55));
        const sub = (Math.sin(2 * Math.PI * 55.0 * t) + Math.sin(2 * Math.PI * 55.35 * t)) * 0.42
                  + Math.sin(2 * Math.PI * 110.0 * t) * 0.12;
        const fc = 120 + 300 * env;
        const airL = lpL.process(pinkL.next(), 'lpf', fc, 0.9) * 0.18;
        const airR = lpR.process(pinkR.next(), 'lpf', fc, 0.9) * 0.18;
        L[i] = (sub + airL) * env; R[i] = (sub + airR) * env;
      }
      normalizePeakDb(L, R, -15.0);
      writeWav24Stereo(join(outDir, `sub_swell_${v}.wav`), L, R);
    }
  }

  // 6. room_tone.wav (12.0s zero-click crossfaded loop, -44 dBFS RMS)
  {
    const rng = mulberry32(4242);
    const loopSec = 12.0, xfadeSec = 2.0;
    const N = Math.floor(loopSec * SR), X = Math.floor(xfadeSec * SR);
    const rawL = new Float32Array(N + X), rawR = new Float32Array(N + X);
    const pL = new PinkNoise(rng), pR = new PinkNoise(rng);
    const hpL = new BiquadDF2T(), hpR = new BiquadDF2T();
    const lpL = new BiquadDF2T(), lpR = new BiquadDF2T();
    const mL = new BiquadDF2T(), mR = new BiquadDF2T();

    for (let i = 0; i < N + X; i++) {
      const sL = hpL.process(pL.next(), 'hpf', 52, 0.707);
      const sR = hpR.process(pR.next(), 'hpf', 52, 0.707);
      rawL[i] = lpL.process(sL + mL.process(sL, 'bpf', 118, 2.2) * 0.22, 'lpf', 1650, 0.707);
      rawR[i] = lpR.process(sR + mR.process(sR, 'bpf', 121, 2.2) * 0.22, 'lpf', 1650, 0.707);
    }

    const L = new Float32Array(N), R = new Float32Array(N);
    let sumSq = 0;
    for (let i = 0; i < N; i++) {
      if (i < X) {
        const u = i / X;
        L[i] = Math.sin(0.5 * Math.PI * u) * rawL[i] + Math.cos(0.5 * Math.PI * u) * rawL[N + i];
        R[i] = Math.sin(0.5 * Math.PI * u) * rawR[i] + Math.cos(0.5 * Math.PI * u) * rawR[N + i];
      } else {
        L[i] = rawL[i]; R[i] = rawR[i];
      }
      sumSq += 0.5 * (L[i] * L[i] + R[i] * R[i]);
    }
    const rms = Math.sqrt(sumSq / N);
    const targetRms = Math.pow(10, -44.0 / 20);
    const g = targetRms / Math.max(1e-9, rms);
    for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; }
    writeWav24Stereo(join(outDir, 'room_tone.wav'), L, R);
  }
}

if (require.main === module) buildAllSfx();
```

### 5.2 Broadcast Stem Hierarchy & Two-Pass FFmpeg `-14.0 LUFS` Mastering (`scripts/master-audio.mjs`)
Single-pass `loudnorm` acts as a real-time AGC compressor that pumps room tone during vocal pauses. Broadcast delivery requires **two-pass ITU-R BS.1770-4 / EBU R128 linear normalization** (`I = -14.0 LUFS`, `TP = -1.0 dBTP`, `LRA = 7.0 LU`), plus vocal-ducked foley mixing:

1. **Pre-Master Mix Bus (`ffmpeg` filter_complex stem merge)**:
   - `vo.wav`: High-passed at `80 Hz`, gentle `3:1` leveling, `-16 LUFS` speech anchor.
   - `sfx_bus.wav` (rendered by Remotion `npx remotion render ... --audio-only`): Sidechain-ducked `-2.5 dB` by `vo.wav` (`sidechaincompress=threshold=0.025:ratio=2.2:attack=8:release=140`) so paper slides and ticks sit tucked beneath consonants. Note: `archival_stamp` triggers at `frame_hit - Math.round(0.035 * fps)` so its `35ms` air whoosh lands the impact peak precisely on `frame_hit`.
   - `room_tone.wav`: Looped across full timeline (`-stream_loop -1`) at `-44 dBFS`.
2. **Exact Two-Pass Mastering Commands**:
   - **Pass 1 (Measure Integrated Loudness, True Peak, LRA, Threshold)**:
     ```bash
     ffmpeg -hide_banner -i raw_render.mp4 -vn \
       -af "loudnorm=I=-14.0:TP=-1.0:LRA=7.0:print_format=json" \
       -f null -
     ```
   - **Pass 2 (Linear Normalization + `-1.0 dBTP` True-Peak Limiter, Video Stream Copied Losslessly)**:
     ```bash
     ffmpeg -y -i raw_render.mp4 \
       -c:v copy \
       -af "aresample=48000,loudnorm=I=-14.0:TP=-1.0:LRA=7.0:measured_I=${M_I}:measured_TP=${M_TP}:measured_LRA=${M_LRA}:measured_thresh=${M_THRESH}:offset=${M_OFFSET}:linear=true:print_format=summary" \
       -c:a aac -b:a 320k -ar 48000 \
       master_youtube_14lufs.mp4
     ```

---

## 6. Recommended Greenfield Module Tree (`d:\Youtube channel`)
```text
d:\Youtube channel\
├── public/
│   └── sfx/                         # Generated by `npm run prebuild` (scripts/generate-sfx.ts)
├── scripts/
│   ├── generate-sfx.ts              # Deterministic 48kHz/24-bit stereo WAV DSP synthesizer
│   └── master-audio.mjs             # Two-pass FFmpeg -14.0 LUFS / -1.0 dBTP broadcast master
├── src/
│   ├── design-system/
│   │   ├── tokens/
│   │   │   ├── colors.ts            # 3-Register OKLCH/Hex palettes + SemanticRole locks
│   │   │   └── registerBridge.ts    # 18-frame cylindrical OKLCH cross-dissolve + exposure dip
│   │   ├── typography/
│   │   │   ├── fonts.ts             # @fontsource WOFF2 + delayRender deterministic lock
│   │   │   ├── fitText.ts           # Binary-search measureText + quadratic rag balancer
│   │   │   └── EditorialChrome.tsx  # Margin Folio, Chapter Bug, Oxford Rule, Footnote, Fraction
│   │   ├── optics/
│   │   │   ├── ReadingRoomStage.tsx # 6-plane compositor, SubstrateGrid, 2f grain, cos^4 vignette
│   │   │   ├── CameraRig25D.tsx     # Log dollyPush, parallax pan, dutchMicro, focusPull, shakeImpact
│   │   │   ├── OpticalLoupe.tsx     # Clipped M=1.85..2.50 doublet magnifier + brass/steel rim
│   │   │   └── HighlighterStroke.tsx# evolvePath + noise2D nib wobble + fiber displacement filter
│   │   ├── physics/
│   │   │   └── springs.ts           # 6 zeta >= 1.0 presets + fluidCameraSpring + staggerDelayFrames
│   │   └── audio/
│   │       └── FoleyCue.tsx         # Frame-accurate <Audio>, 4x variant cycling, 72ms tick gate
│   └── episodes/
│       └── ep01-money-2036/         # Scene compositions mapped to video_01_script.md
```

---

## 7. Turnkey Optical, Camera, & Foley Component Specs

### 7.1 Perceptual OKLCH Register Interpolator (`src/design-system/tokens/registerBridge.ts`)
```ts
// src/design-system/tokens/registerBridge.ts
export interface OklchTuple { l: number; c: number; h: number }

export function mixOklchCss(a: OklchTuple, b: OklchTuple, t: number, exposureDip = 0.06): string {
  const u = Math.max(0, Math.min(1, t));
  const dip = 1 - exposureDip * Math.sin(Math.PI * u);
  const l = (a.l + (b.l - a.l) * u) * dip;
  const c = a.c + (b.c - a.c) * u;
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = (a.h + dh * u + 360) % 360;
  return `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)})`;
}
```

### 7.2 2.5D Camera & Rack-Focus Rig (`src/design-system/optics/CameraRig25D.tsx`)
```tsx
// src/design-system/optics/CameraRig25D.tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';

export interface CameraRigProps {
  panX?: number;
  panY?: number;
  dollyStart?: number;
  dollyEnd?: number;
  dollyProgress?: number;
  dutchDeg?: number;
  focusDepthZ?: number;     // -120 (bg), 0 (hero), +85 (annotations)
  apertureFStop?: number;   // default 2.8; higher = deeper DOF
  ambientFloatPx?: number;  // 2.0 on archival scenes, 0 on macro charts
  hitFrame?: number;        // triggers damped multi-harmonic verdict recoil
  hitIntensity?: number;    // 0..1
  sceneSeed?: number;
  bgPlane?: React.ReactNode;
  heroPlane: React.ReactNode;
  fgPlane?: React.ReactNode;
}

export const CameraRig25D: React.FC<CameraRigProps> = ({
  panX = 0,
  panY = 0,
  dollyStart = 1.0,
  dollyEnd = 1.042,
  dollyProgress = 0,
  dutchDeg = 0,
  focusDepthZ = 0,
  apertureFStop = 2.8,
  ambientFloatPx = 0,
  hitFrame,
  hitIntensity = 0.75,
  sceneSeed = 1,
  bgPlane,
  heroPlane,
  fgPlane,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = dollyStart * Math.pow(dollyEnd / dollyStart, Math.max(0, Math.min(1, dollyProgress)));
  const floatX = ambientFloatPx > 0 ? noise2D('cx', frame / (6.5 * fps), sceneSeed) * ambientFloatPx : 0;
  const floatY = ambientFloatPx > 0 ? noise2D('cy', frame / (7.2 * fps), sceneSeed + 19) * ambientFloatPx : 0;

  let shakeX = 0, shakeY = 0, shakeRot = 0;
  if (hitFrame !== undefined && frame >= hitFrame) {
    const u = (frame - hitFrame) / fps;
    if (u < 0.45) {
      shakeX = 6.5 * hitIntensity * Math.exp(-16 * u) * Math.sin(46 * u);
      shakeY = -8.8 * hitIntensity * Math.exp(-16 * u) * Math.cos(62 * u);
      shakeRot = 0.22 * hitIntensity * Math.exp(-18 * u) * Math.sin(34 * u);
    }
  }

  const renderDepthPlane = (z: number, node: React.ReactNode) => {
    if (!node) return null;
    const parallax = 1 + z / 1000;
    const sigma = Math.min(14, Math.abs(z - focusDepthZ) / (apertureFStop * 12.5));
    const tx = (-panX + floatX) * parallax + shakeX;
    const ty = (-panY + floatY) * parallax + shakeY;
    return (
      <AbsoluteFill
        style={{
          transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(5)}) rotate(${(dutchDeg + shakeRot).toFixed(3)}deg)`,
          transformOrigin: '50% 50%',
          filter: sigma > 0.15 ? `blur(${sigma.toFixed(2)}px)` : 'none',
          willChange: 'transform',
        }}
      >
        {node}
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {renderDepthPlane(-120, bgPlane)}
      {renderDepthPlane(0, heroPlane)}
      {renderDepthPlane(85, fgPlane)}
    </AbsoluteFill>
  );
};
```

### 7.3 Organic Chisel-Nib Ink Highlighter (`src/design-system/optics/HighlighterStroke.tsx`)
```tsx
// src/design-system/optics/HighlighterStroke.tsx
import React, { useMemo } from 'react';
import { evolvePath } from '@remotion/paths';
import { noise2D } from '@remotion/noise';

export interface HighlighterProps {
  x: number;
  y: number;
  width: number;
  height?: number;
  progress: number; // driven by studioSpring(frame, fps, 'inkSweep', delay)
  color: string;
  blendMode: 'multiply' | 'screen';
  seed?: number;
}

export const HighlighterStroke: React.FC<HighlighterProps> = ({
  x, y, width, height = 34, progress, color, blendMode, seed = 7,
}) => {
  const filterId = `nib-tooth-${seed}-${Math.round(x)}`;
  const d = useMemo(() => {
    const steps = 12;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const px = x + width * u;
      const arc = -1.8 * Math.sin(Math.PI * u);
      const wobble = noise2D('nib', i * 0.42, seed) * 1.35;
      const py = y + height * 0.5 + arc + wobble;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [x, y, width, height, seed]);

  if (progress <= 0.002) return null;
  const evolved = evolvePath(Math.min(1, progress), d);

  return (
    <svg
      width="1920"
      height="1080"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: blendMode }}
    >
      <defs>
        <filter id={filterId} x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={1.5} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={height}
        strokeLinecap="butt"
        filter={`url(#${filterId})`}
        strokeDasharray={evolved.strokeDasharray}
        strokeDashoffset={evolved.strokeDashoffset}
      />
    </svg>
  );
};
```

### 7.4 Frame-Accurate Polyphony-Throttled Foley Component (`src/design-system/audio/FoleyCue.tsx`)
```tsx
// src/design-system/audio/FoleyCue.tsx
import React from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';

export type FoleyType = 'paper_slide' | 'felt_highlight' | 'odometer_tick' | 'archival_stamp' | 'sub_swell';

export interface FoleyEvent {
  frame: number;
  type: FoleyType;
  volume?: number;
}

// Enforces >= 72ms spacing between odometer ticks & pre-rolls archival_stamp air whoosh by 35ms
export const FoleyTrack: React.FC<{ events: FoleyEvent[]; sceneIndex: number }> = ({ events, sceneIndex }) => {
  const { fps } = useVideoConfig();
  const minTickGapFrames = Math.ceil(0.072 * fps);
  const stampPreRollFrames = Math.round(0.035 * fps);

  let lastTickFrame = -9999;
  const filtered = events.filter((ev) => {
    if (ev.type !== 'odometer_tick') return true;
    if (ev.frame - lastTickFrame < minTickGapFrames) return false;
    lastTickFrame = ev.frame;
    return true;
  });

  return (
    <>
      {filtered.map((ev, idx) => {
        const variant = (sceneIndex * 7 + idx) % 4;
        const startFrame = ev.type === 'archival_stamp' ? Math.max(0, ev.frame - stampPreRollFrames) : ev.frame;
        return (
          <Sequence key={`${ev.type}-${ev.frame}-${idx}`} from={startFrame} layout="none">
            <Audio src={staticFile(`sfx/${ev.type}_${variant}.wav`)} volume={ev.volume ?? 1.0} />
          </Sequence>
        );
      })}
    </>
  );
};
```
