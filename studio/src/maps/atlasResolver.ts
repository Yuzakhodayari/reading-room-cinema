import { z } from "zod";
import {
  CORRIDOR_BY_ID,
  CORRIDOR_IDS,
  COUNTRY_BY_ISO_NUMERIC,
  CorridorId,
  CorridorIdSchema,
  CountryRecord,
  GEOPOLITICAL_CORRIDORS,
  GLOBAL_HUBS,
  GeoBoundingBox,
  GeoBoundingBoxSchema,
  GeopoliticalCorridor,
  GlobalCityHub,
  LonLat,
  LonLatSchema,
  MapArcSpec,
  MapArcSpecSchema,
  MapPinSpec,
  MapPinSpecSchema,
  MapScope,
  MapScopeSchema,
  MapTone,
  MapToneSchema,
  MapVisualRegister,
  MapVisualRegisterSchema,
  MapWarningSpec,
  MapWarningSpecSchema,
  US_STATES,
  US_STATE_BY_FIPS,
  US_STATE_BY_POSTAL,
  US_TERRITORIES,
  UsStateCity,
  UsStateRecord,
  WORLD_COUNTRIES,
  getCorridorCount,
  getCountryCount,
  getUsStateCount,
  getUsTerritoryCount,
} from "./geoDatabase";

// ============================================================================
// Pillar #3 Cartography — Deterministic Offline Atlas & Entity Resolver
// ============================================================================

export const GeoQueryTargetSchema = z.object({
  corridorId: CorridorIdSchema.optional(),
  query: z.string().optional(),
  label: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  spokenText: z.string().optional(),
  scope: MapScopeSchema.optional(),
  region: z.enum(["us", "usa", "world"]).optional(),
  register: MapVisualRegisterSchema.optional(),
  routeTone: MapToneSchema.optional(),
  countryIds: z.array(z.string()).optional(),
  secondaryCountryIds: z.array(z.string()).optional(),
  alertCountryIds: z.array(z.string()).optional(),
  stateFips: z.array(z.string()).optional(),
  highlightStateFips: z.string().optional(),
  highlightStatesFips: z.array(z.string()).optional(),
  center: LonLatSchema.optional(),
  bbox: GeoBoundingBoxSchema.optional(),
  zoom: z.number().min(0.8).max(8).optional(),
  pins: z.array(MapPinSpecSchema).optional(),
  arcs: z.array(MapArcSpecSchema).optional(),
  warnings: z.array(MapWarningSpecSchema).optional(),
  sourceNote: z.string().optional(),
});

export type GeoQueryTarget = z.infer<typeof GeoQueryTargetSchema>;

export type GeoMatchSource =
  | "corridor"
  | "explicit-target"
  | "global-hub"
  | "us-city"
  | "us-state"
  | "country"
  | "multi-region"
  | "world-overview-fallback";

export interface ResolvedGeoScene {
  id: string;
  matchedBy: GeoMatchSource;
  corridorId?: CorridorId;
  scope: MapScope;
  atlasDataset: "world" | "usa";
  title: string;
  eyebrow: string;
  subtitle: string;
  sourceNote?: string;
  center: LonLat;
  bbox: GeoBoundingBox;
  rotateLon?: number;
  initialZoom: number;
  targetZoom: number;
  register: MapVisualRegister;
  routeTone: MapTone;
  primaryCountryIds: string[];
  secondaryCountryIds: string[];
  alertCountryIds: string[];
  primaryStateFips: string[];
  secondaryStateFips: string[];
  alertStateFips: string[];
  pins: MapPinSpec[];
  arcs: MapArcSpec[];
  warnings: MapWarningSpec[];
}

function pad3(numStr: string): string {
  const s = numStr.trim();
  if (s.length === 1) return `00${s}`;
  if (s.length === 2) return `0${s}`;
  return s;
}

function pad2(numStr: string): string {
  const s = numStr.trim();
  if (s.length === 1) return `0${s}`;
  return s;
}

function normalizePhrase(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/[\u2013\u2014/|_]+/g, " ")
    .replace(/[^a-z0-9'.%+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWholePhrase(haystackNorm: string, phraseNorm: string): boolean {
  if (!haystackNorm || !phraseNorm) return false;
  if (haystackNorm === phraseNorm) return true;
  const pattern = new RegExp(`(?:^|\\s)${escapeRegex(phraseNorm)}(?:$|\\s)`);
  return pattern.test(haystackNorm);
}

function hasTexasIntent(norm: string): boolean {
  const txTerms = [
    "texas",
    "austin",
    "houston",
    "dallas",
    "fort worth",
    "san antonio",
    "abilene",
    "ercot",
    "travis county",
    "lone star",
    "permian",
    "claire",
  ];
  for (let i = 0; i < txTerms.length; i++) {
    if (containsWholePhrase(norm, txTerms[i])) return true;
  }
  return false;
}

export function computeGeoBoundingBox(
  points: readonly LonLat[],
  padDeg = 5.5
): GeoBoundingBox {
  if (points.length === 0) {
    return [
      [-165, -52],
      [175, 72],
    ];
  }
  let minLon = points[0][0];
  let maxLon = points[0][0];
  let minLat = points[0][1];
  let maxLat = points[0][1];

  for (let i = 1; i < points.length; i++) {
    const lon = points[i][0];
    const lat = points[i][1];
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return [
    [Math.max(-179.5, minLon - padDeg), Math.max(-84, minLat - padDeg * 0.75)],
    [Math.min(179.5, maxLon + padDeg), Math.min(84, maxLat + padDeg * 0.75)],
  ];
}

function inferScopeFromCountries(countries: readonly CountryRecord[]): MapScope {
  if (countries.length === 0) return "world";
  const first = countries[0].defaultScope;
  for (let i = 1; i < countries.length; i++) {
    if (countries[i].defaultScope !== first) {
      return "world";
    }
  }
  return first;
}

// Pre-sorted longest-first phrase index for deterministic entity scanning
interface PhraseEntry<T> {
  phrase: string;
  item: T;
  weight: number;
}

const CORRIDOR_PHRASES: readonly PhraseEntry<GeopoliticalCorridor>[] = (() => {
  const list: PhraseEntry<GeopoliticalCorridor>[] = [];
  for (let i = 0; i < GEOPOLITICAL_CORRIDORS.length; i++) {
    const c = GEOPOLITICAL_CORRIDORS[i];
    const idNorm = normalizePhrase(c.id.replace(/_/g, " "));
    list.push({ phrase: idNorm, item: c, weight: idNorm.length + 25 });
    for (let k = 0; k < c.keywords.length; k++) {
      const kw = normalizePhrase(c.keywords[k]);
      if (kw.length >= 3) {
        list.push({ phrase: kw, item: c, weight: kw.length + 10 });
      }
    }
  }
  list.sort((a, b) => b.weight - a.weight);
  return list;
})();

const HUB_PHRASES: readonly PhraseEntry<GlobalCityHub>[] = (() => {
  const list: PhraseEntry<GlobalCityHub>[] = [];
  for (let i = 0; i < GLOBAL_HUBS.length; i++) {
    const h = GLOBAL_HUBS[i];
    const base = normalizePhrase(h.name);
    if (base.length >= 3) list.push({ phrase: base, item: h, weight: base.length + 6 });
    for (let a = 0; a < h.aliases.length; a++) {
      const al = normalizePhrase(h.aliases[a]);
      if (al.length >= 3) list.push({ phrase: al, item: h, weight: al.length + 5 });
    }
  }
  list.sort((a, b) => b.weight - a.weight);
  return list;
})();

interface UsCityEntry {
  state: UsStateRecord;
  city: UsStateCity;
}

const US_CITY_PHRASES: readonly PhraseEntry<UsCityEntry>[] = (() => {
  const list: PhraseEntry<UsCityEntry>[] = [];
  for (let i = 0; i < US_STATES.length; i++) {
    const st = US_STATES[i];
    for (let c = 0; c < st.majorCities.length; c++) {
      const city = st.majorCities[c];
      const cn = normalizePhrase(city.name);
      if (cn.length >= 4) {
        list.push({ phrase: cn, item: { state: st, city }, weight: cn.length + 4 });
      }
    }
  }
  list.sort((a, b) => b.weight - a.weight);
  return list;
})();

const US_STATE_PHRASES: readonly PhraseEntry<UsStateRecord>[] = (() => {
  const list: PhraseEntry<UsStateRecord>[] = [];
  for (let i = 0; i < US_STATES.length; i++) {
    const st = US_STATES[i];
    const sn = normalizePhrase(st.name);
    list.push({ phrase: sn, item: st, weight: sn.length + 8 });
    for (let a = 0; a < st.aliases.length; a++) {
      const al = normalizePhrase(st.aliases[a]);
      if (al.length >= 3) {
        list.push({ phrase: al, item: st, weight: al.length + 6 });
      }
    }
  }
  list.sort((a, b) => b.weight - a.weight);
  return list;
})();

const COUNTRY_PHRASES: readonly PhraseEntry<CountryRecord>[] = (() => {
  const list: PhraseEntry<CountryRecord>[] = [];
  for (let i = 0; i < WORLD_COUNTRIES.length; i++) {
    const c = WORLD_COUNTRIES[i];
    const cn = normalizePhrase(c.name);
    list.push({ phrase: cn, item: c, weight: cn.length + 8 });
    if (c.atlasName) {
      const an = normalizePhrase(c.atlasName);
      if (an !== cn && an.length >= 3) {
        list.push({ phrase: an, item: c, weight: an.length + 7 });
      }
    }
    if (c.capital) {
      const cap = normalizePhrase(c.capital);
      if (cap.length >= 4 && cap !== "washington d.c.") {
        list.push({ phrase: cap, item: c, weight: cap.length + 3 });
      }
    }
    for (let a = 0; a < c.aliases.length; a++) {
      const al = normalizePhrase(c.aliases[a]);
      if (al.length >= 2) {
        list.push({ phrase: al, item: c, weight: al.length + 6 });
      }
    }
  }
  list.sort((a, b) => b.weight - a.weight);
  return list;
})();

export function getCorridorById(
  idOrName: CorridorId | string
): GeopoliticalCorridor | undefined {
  const trimmed = idOrName.trim().toUpperCase().replace(/[\s-]+/g, "_");
  for (let i = 0; i < CORRIDOR_IDS.length; i++) {
    if (CORRIDOR_IDS[i] === trimmed) {
      return CORRIDOR_BY_ID.get(CORRIDOR_IDS[i]);
    }
  }
  return undefined;
}

export function getCountryByIsoOrName(query: string): CountryRecord | undefined {
  const raw = query.trim();
  if (!raw) return undefined;

  if (/^\d{1,3}$/.test(raw)) {
    const byNum = COUNTRY_BY_ISO_NUMERIC.get(pad3(raw));
    if (byNum) return byNum;
  }

  const upper = raw.toUpperCase();
  if (upper.length === 2 || upper.length === 3) {
    for (let i = 0; i < WORLD_COUNTRIES.length; i++) {
      const c = WORLD_COUNTRIES[i];
      if (c.iso2 === upper || c.iso3 === upper || c.isoNumeric === upper) {
        return c;
      }
    }
  }

  const norm = normalizePhrase(raw);
  for (let i = 0; i < COUNTRY_PHRASES.length; i++) {
    if (COUNTRY_PHRASES[i].phrase === norm) {
      return COUNTRY_PHRASES[i].item;
    }
  }
  return undefined;
}

export function getUsStateByFipsOrName(query: string): UsStateRecord | undefined {
  const raw = query.trim();
  if (!raw) return undefined;

  if (/^\d{1,2}$/.test(raw)) {
    const byFips = US_STATE_BY_FIPS.get(pad2(raw));
    if (byFips) return byFips;
  }

  const upper = raw.toUpperCase().replace(/\./g, "");
  const byPostal = US_STATE_BY_POSTAL.get(upper);
  if (byPostal) return byPostal;

  const norm = normalizePhrase(raw);
  for (let i = 0; i < US_STATE_PHRASES.length; i++) {
    if (US_STATE_PHRASES[i].phrase === norm) {
      return US_STATE_PHRASES[i].item;
    }
  }
  return undefined;
}

function corridorToScene(
  corridor: GeopoliticalCorridor,
  overrides?: Partial<GeoQueryTarget>
): ResolvedGeoScene {
  return {
    id: corridor.id,
    matchedBy: "corridor",
    corridorId: corridor.id,
    scope: overrides?.scope ?? corridor.scope,
    atlasDataset: (overrides?.scope ?? corridor.scope) === "usa" ? "usa" : "world",
    title: overrides?.title ?? overrides?.label ?? corridor.title,
    eyebrow: corridor.eyebrow,
    subtitle: overrides?.subtitle ?? corridor.subtitle,
    sourceNote: overrides?.sourceNote ?? corridor.sourceNote,
    center: overrides?.center ?? corridor.center,
    bbox: overrides?.bbox ?? corridor.bbox,
    rotateLon: corridor.rotateLon,
    initialZoom: 1.0,
    targetZoom: overrides?.zoom ?? corridor.targetZoom,
    register: overrides?.register ?? corridor.defaultRegister ?? "page-editorial",
    routeTone: overrides?.routeTone ?? corridor.routeTone,
    primaryCountryIds: [...corridor.primaryCountryIds],
    secondaryCountryIds: [...corridor.secondaryCountryIds],
    alertCountryIds: corridor.alertCountryIds ? [...corridor.alertCountryIds] : [],
    primaryStateFips: [...corridor.primaryStateFips],
    secondaryStateFips: corridor.secondaryStateFips ? [...corridor.secondaryStateFips] : [],
    alertStateFips: corridor.alertStateFips ? [...corridor.alertStateFips] : [],
    pins: overrides?.pins && overrides.pins.length > 0 ? [...overrides.pins] : [...corridor.pins],
    arcs: overrides?.arcs && overrides.arcs.length > 0 ? [...overrides.arcs] : [...corridor.arcs],
    warnings:
      overrides?.warnings && overrides.warnings.length > 0
        ? [...overrides.warnings]
        : [...corridor.warnings],
  };
}

function buildCountryScene(
  countries: readonly CountryRecord[],
  overrides?: Partial<GeoQueryTarget>,
  hub?: GlobalCityHub
): ResolvedGeoScene {
  const primary = countries[0];
  const secondary = countries.slice(1);
  const points: LonLat[] = [];
  const pins: MapPinSpec[] = [];
  const arcs: MapArcSpec[] = [];

  if (hub) {
    points.push(hub.coordinates);
    pins.push({
      id: `hub-${hub.id}`,
      label: hub.name,
      sublabel: hub.sublabel ?? primary.name,
      coordinates: hub.coordinates,
      kind: hub.kind,
      tone: overrides?.routeTone ?? "primary",
      pulse: true,
    });
  }

  for (let i = 0; i < countries.length; i++) {
    const c = countries[i];
    const pinCoord = c.capitalCoords ?? c.centroid;
    points.push(c.centroid);
    points.push(pinCoord);
    if (!hub || i > 0) {
      pins.push({
        id: `country-${c.isoNumeric}`,
        label: c.capital ? `${c.capital}, ${c.name}` : c.name,
        sublabel: c.has110mPolygon ? `${c.iso3} Sovereign Territory` : `${c.iso3} Sovereign City-State`,
        coordinates: pinCoord,
        kind: c.capital ? "capital" : "city",
        tone: i === 0 ? "primary" : "secondary",
        pulse: i === 0,
      });
    }
  }

  if (countries.length >= 2) {
    for (let i = 0; i < countries.length - 1; i++) {
      const a = countries[i].capitalCoords ?? countries[i].centroid;
      const b = countries[i + 1].capitalCoords ?? countries[i + 1].centroid;
      arcs.push({
        id: `corridor-${countries[i].iso3}-${countries[i + 1].iso3}`,
        from: a,
        to: b,
        fromLabel: countries[i].name,
        toLabel: countries[i + 1].name,
        kind: "capital-flow",
        tone: overrides?.routeTone ?? "secondary",
        dashed: true,
      });
    }
  }

  const center: LonLat =
    overrides?.center ??
    (hub
      ? hub.coordinates
      : [
          points.reduce((s, p) => s + p[0], 0) / points.length,
          points.reduce((s, p) => s + p[1], 0) / points.length,
        ]);

  const scope =
    overrides?.scope ??
    (hub ? hub.scope : inferScopeFromCountries(countries));

  const titleDefault = hub
    ? `${hub.name}, ${primary.name}`
    : countries.length > 1
      ? countries.map((c) => c.name).join(" • ")
      : primary.name;

  return {
    id: hub ? `hub:${hub.id}` : `country:${countries.map((c) => c.iso3).join("-")}`,
    matchedBy: hub ? "global-hub" : countries.length > 1 ? "multi-region" : "country",
    scope,
    atlasDataset: "world",
    title: overrides?.title ?? overrides?.label ?? titleDefault,
    eyebrow:
      countries.length > 1
        ? "Cross-Border Geopolitical Focus"
        : `${primary.continent.replace("-", " ").toUpperCase()} • ISO ${primary.iso3}`,
    subtitle:
      overrides?.subtitle ??
      (hub?.sublabel
        ? `${hub.sublabel} (${primary.name})`
        : primary.capital
          ? `Capital: ${primary.capital} • Coordinates ${primary.centroid[1].toFixed(1)}°, ${primary.centroid[0].toFixed(1)}°`
          : `Sovereign focus on ${primary.name}`),
    sourceNote: overrides?.sourceNote,
    center,
    bbox: overrides?.bbox ?? computeGeoBoundingBox(points, countries.length > 1 ? 8 : 6.5),
    initialZoom: 1.0,
    targetZoom:
      overrides?.zoom ??
      (hub ? hub.defaultZoom : countries.length > 1 ? 1.85 : primary.defaultZoom),
    register: overrides?.register ?? "page-editorial",
    routeTone: overrides?.routeTone ?? "primary",
    primaryCountryIds: [primary.isoNumeric],
    secondaryCountryIds: secondary.map((c) => c.isoNumeric),
    alertCountryIds: overrides?.alertCountryIds ? [...overrides.alertCountryIds] : [],
    primaryStateFips: [],
    secondaryStateFips: [],
    alertStateFips: [],
    pins: overrides?.pins && overrides.pins.length > 0 ? [...overrides.pins] : pins,
    arcs: overrides?.arcs && overrides.arcs.length > 0 ? [...overrides.arcs] : arcs,
    warnings: overrides?.warnings ? [...overrides.warnings] : [],
  };
}

function buildUsStatesScene(
  states: readonly UsStateRecord[],
  overrides?: Partial<GeoQueryTarget>,
  cityMatch?: UsStateCity
): ResolvedGeoScene {
  const primary = states[0];
  const points: LonLat[] = [];
  const pins: MapPinSpec[] = [];
  const arcs: MapArcSpec[] = [];

  if (cityMatch) {
    points.push(cityMatch.coordinates);
    pins.push({
      id: `us-city-${normalizePhrase(cityMatch.name).replace(/\s+/g, "-")}`,
      label: `${cityMatch.name}, ${primary.postal}`,
      sublabel: cityMatch.role ?? primary.name,
      coordinates: cityMatch.coordinates,
      kind: "city",
      tone: overrides?.routeTone ?? "primary",
      pulse: true,
    });
  }

  for (let i = 0; i < states.length; i++) {
    const st = states[i];
    points.push(st.centroid);
    points.push(st.capitalCoords);
    if (!cityMatch || i > 0) {
      const leadCity = st.majorCities[0];
      pins.push({
        id: `state-${st.fips}`,
        label: leadCity ? `${leadCity.name}, ${st.postal}` : `${st.capital}, ${st.postal}`,
        sublabel: leadCity?.role ?? `${st.name} (${st.postal})`,
        coordinates: leadCity ? leadCity.coordinates : st.capitalCoords,
        kind: "city",
        tone: i === 0 ? "primary" : "secondary",
        pulse: i === 0,
      });
    }
  }

  if (states.length >= 2) {
    const sorted = [...states].sort((a, b) => a.centroid[0] - b.centroid[0]);
    for (let i = 0; i < sorted.length - 1; i++) {
      arcs.push({
        id: `us-arc-${sorted[i].postal}-${sorted[i + 1].postal}`,
        from: sorted[i].centroid,
        to: sorted[i + 1].centroid,
        kind: "power-grid",
        tone: overrides?.routeTone ?? "secondary",
        dashed: true,
      });
    }
  }

  const center: LonLat =
    overrides?.center ??
    (cityMatch
      ? cityMatch.coordinates
      : [
          points.reduce((s, p) => s + p[0], 0) / points.length,
          points.reduce((s, p) => s + p[1], 0) / points.length,
        ]);

  const titleDefault = cityMatch
    ? `${cityMatch.name}, ${primary.name}`
    : states.length > 3
      ? `${states.length}-State Regional Corridor (${states
          .slice(0, 4)
          .map((s) => s.postal)
          .join(", ")}…)`
      : states.map((s) => s.name).join(" • ");

  return {
    id: cityMatch
      ? `us-city:${primary.postal}-${normalizePhrase(cityMatch.name)}`
      : `us-states:${states.map((s) => s.postal).join("-")}`,
    matchedBy: cityMatch ? "us-city" : states.length > 1 ? "multi-region" : "us-state",
    scope: "usa",
    atlasDataset: "usa",
    title: overrides?.title ?? overrides?.label ?? titleDefault,
    eyebrow:
      states.length > 1
        ? `U.S. Multi-State Atlas • ${states.length} Jurisdictions`
        : `United States • FIPS ${primary.fips} (${primary.postal})`,
    subtitle:
      overrides?.subtitle ??
      (cityMatch?.role
        ? `${cityMatch.role} • ${primary.name}`
        : `Capital: ${primary.capital} • ${primary.majorCities.map((c) => c.name).join(", ")}`),
    sourceNote: overrides?.sourceNote,
    center,
    bbox: overrides?.bbox ?? computeGeoBoundingBox(points, states.length > 2 ? 4.5 : 3.2),
    initialZoom: 1.0,
    targetZoom:
      overrides?.zoom ??
      (states.length >= 6 ? 1.68 : states.length >= 2 ? 1.95 : primary.defaultZoom),
    register: overrides?.register ?? "page-editorial",
    routeTone: overrides?.routeTone ?? "primary",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    alertCountryIds: [],
    primaryStateFips: states.map((s) => s.fips),
    secondaryStateFips: [],
    alertStateFips: [],
    pins: overrides?.pins && overrides.pins.length > 0 ? [...overrides.pins] : pins,
    arcs: overrides?.arcs && overrides.arcs.length > 0 ? [...overrides.arcs] : arcs,
    warnings: overrides?.warnings ? [...overrides.warnings] : [],
  };
}

function scanFreeTextForGeo(
  rawText: string,
  overrides?: Partial<GeoQueryTarget>
): ResolvedGeoScene | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  // 1. Direct Corridor ID check
  const directCorridor = getCorridorById(trimmed);
  if (directCorridor) {
    return corridorToScene(directCorridor, overrides);
  }

  // 2. Exact standalone short code check (e.g. "WV", "TW", "JP", "NL", "SG", "54", "158")
  if (trimmed.length <= 4 && /^[A-Za-z0-9.]+$/.test(trimmed)) {
    const exactState = getUsStateByFipsOrName(trimmed);
    if (exactState && overrides?.region !== "world") {
      if (exactState.fips === "48" && normalizePhrase(trimmed) === "tx") {
        return buildUsStatesScene([exactState], overrides);
      }
      return buildUsStatesScene([exactState], overrides);
    }
    const exactCountry = getCountryByIsoOrName(trimmed);
    if (exactCountry) {
      return buildCountryScene([exactCountry], overrides);
    }
  }

  const norm = normalizePhrase(trimmed);
  if (!norm) return null;

  // 3. Named Geopolitical Corridors (longest keyword phrase wins)
  for (let i = 0; i < CORRIDOR_PHRASES.length; i++) {
    const entry = CORRIDOR_PHRASES[i];
    if (containsWholePhrase(norm, entry.phrase)) {
      return corridorToScene(entry.item, overrides);
    }
  }

  // 4. Multi-country Eurozone / Asia / Global combinations (e.g. "France and Greece")
  const matchedCountries: CountryRecord[] = [];
  const seenCountryIso = new Set<string>();
  let remainingNorm = ` ${norm} `;

  // Disambiguate "Georgia": Caucasus context vs US state context
  const caucasusSignal =
    containsWholePhrase(norm, "tbilisi") ||
    containsWholePhrase(norm, "caucasus") ||
    containsWholePhrase(norm, "armenia") ||
    containsWholePhrase(norm, "azerbaijan") ||
    containsWholePhrase(norm, "black sea") ||
    containsWholePhrase(norm, "russia");

  // 5. Check Global City/Silicon/Port Hubs first if exact landmark named
  for (let i = 0; i < HUB_PHRASES.length; i++) {
    const hp = HUB_PHRASES[i];
    if (containsWholePhrase(norm, hp.phrase)) {
      const parentCountry = COUNTRY_BY_ISO_NUMERIC.get(hp.item.countryIsoNumeric);
      if (parentCountry) {
        return buildCountryScene([parentCountry], overrides, hp.item);
      }
    }
  }

  // 6. Check US Cities & US States (consume matched spans so "West Virginia" never also triggers "Virginia"!)
  const matchedStates: UsStateRecord[] = [];
  const seenStateFips = new Set<string>();
  let matchedCity: { state: UsStateRecord; city: UsStateCity } | null = null;

  for (let i = 0; i < US_CITY_PHRASES.length; i++) {
    const cp = US_CITY_PHRASES[i];
    if (containsWholePhrase(norm, cp.phrase)) {
      matchedCity = cp.item;
      if (!seenStateFips.has(cp.item.state.fips)) {
        seenStateFips.add(cp.item.state.fips);
        matchedStates.push(cp.item.state);
      }
      break;
    }
  }

  // Check explicit uppercase ", ST" postal suffix in raw text (e.g. "Phoenix, AZ", "Logan, WV")
  const postalCommaMatch = trimmed.match(/,\s*([A-Z]{2})(?:\b|$)/);
  if (postalCommaMatch) {
    const stFromPostal = US_STATE_BY_POSTAL.get(postalCommaMatch[1]);
    if (stFromPostal && !seenStateFips.has(stFromPostal.fips)) {
      seenStateFips.add(stFromPostal.fips);
      matchedStates.push(stFromPostal);
    }
  }

  for (let i = 0; i < US_STATE_PHRASES.length; i++) {
    const sp = US_STATE_PHRASES[i];
    if (sp.item.fips === "13" && caucasusSignal) continue;
    const pat = new RegExp(`(?:^|\\s)${escapeRegex(sp.phrase)}(?:$|\\s)`);
    if (pat.test(remainingNorm)) {
      if (!seenStateFips.has(sp.item.fips)) {
        seenStateFips.add(sp.item.fips);
        matchedStates.push(sp.item);
      }
      remainingNorm = remainingNorm.replace(pat, " ");
    }
  }

  // Check US Territories (Puerto Rico, Guam, USVI, American Samoa, Mariana Islands)
  for (let i = 0; i < US_TERRITORIES.length; i++) {
    const terr = US_TERRITORIES[i];
    if (containsWholePhrase(norm, normalizePhrase(terr.name))) {
      const cRec = COUNTRY_BY_ISO_NUMERIC.get(terr.isoNumeric);
      if (cRec) return buildCountryScene([cRec], overrides);
      return {
        id: `territory:${terr.postal}`,
        matchedBy: "country",
        scope: "world",
        atlasDataset: "world",
        title: overrides?.title ?? overrides?.label ?? terr.name,
        eyebrow: `U.S. Pacific / Caribbean Territory • ${terr.postal}`,
        subtitle: overrides?.subtitle ?? `Coordinates ${terr.centroid[1].toFixed(2)}°, ${terr.centroid[0].toFixed(2)}°`,
        center: terr.centroid,
        bbox: computeGeoBoundingBox([terr.centroid], 5),
        initialZoom: 1.0,
        targetZoom: overrides?.zoom ?? 3.2,
        register: overrides?.register ?? "page-editorial",
        routeTone: overrides?.routeTone ?? "primary",
        primaryCountryIds: [terr.isoNumeric],
        secondaryCountryIds: [],
        alertCountryIds: [],
        primaryStateFips: [],
        secondaryStateFips: [],
        alertStateFips: [],
        pins: [
          {
            id: `terr-${terr.postal}`,
            label: terr.name,
            coordinates: terr.centroid,
            kind: "port",
            tone: "primary",
            pulse: true,
          },
        ],
        arcs: [],
        warnings: [],
      };
    }
  }

  // 7. Scan World Countries (longest phrase first, consuming matched tokens so "South Korea" never triggers "North Korea")
  for (let i = 0; i < COUNTRY_PHRASES.length; i++) {
    const cp = COUNTRY_PHRASES[i];
    // Guard short 2-letter aliases like "uk", "us" carefully with word boundaries (already enforced by pat)
    if (cp.item.isoNumeric === "268" && !caucasusSignal && seenStateFips.has("13")) {
      continue;
    }
    const pat = new RegExp(`(?:^|\\s)${escapeRegex(cp.phrase)}(?:$|\\s)`);
    if (pat.test(remainingNorm)) {
      if (!seenCountryIso.has(cp.item.isoNumeric)) {
        seenCountryIso.add(cp.item.isoNumeric);
        matchedCountries.push(cp.item);
      }
      remainingNorm = remainingNorm.replace(pat, " ");
    }
  }

  // Prioritize specific US state/city match unless non-US sovereign countries were also named
  const nonUsCountries = matchedCountries.filter((c) => c.isoNumeric !== "840");
  if (nonUsCountries.length > 0 && matchedStates.length === 0) {
    return buildCountryScene(nonUsCountries, overrides);
  }
  if (matchedStates.length > 0 && nonUsCountries.length === 0) {
    if (
      matchedStates.length === 1 &&
      matchedStates[0].fips === "48" &&
      matchedCity?.city.name === "Austin"
    ) {
      return corridorToScene(CORRIDOR_BY_ID.get("AUSTIN_TEXAS")!, overrides);
    }
    return buildUsStatesScene(matchedStates, overrides, matchedCity?.city);
  }
  if (nonUsCountries.length > 0 && matchedStates.length > 0) {
    // Transoceanic hybrid mention (e.g. "Taiwan and Arizona" or "Japan and Washington")
    const usRec = COUNTRY_BY_ISO_NUMERIC.get("840")!;
    return buildCountryScene([...nonUsCountries, usRec], {
      ...overrides,
      scope: "world",
    });
  }
  if (matchedCountries.length > 0) {
    return buildCountryScene(matchedCountries, overrides);
  }

  return null;
}

/**
 * Deterministically resolves a structured `GeoQueryTarget` OR free-text query/script sentence
 * into an exact cartographic scene (`ResolvedGeoScene`).
 *
 * Anti-Austin Invariant:
 * - NEVER silently falls back to Austin, Texas ("48") when another real country, US state,
 *   city, or corridor is named, or when no place is named at all!
 * - Even if legacy caller props pass `highlightStateFips: "48"` + `region: "us"`, any non-Texas
 *   place in `query`, `label`, `title`, or `spokenText` overrides the legacy default.
 */
export function resolveGeoQuery(
  textOrTarget?: string | GeoQueryTarget | null
): ResolvedGeoScene {
  if (typeof textOrTarget === "string") {
    const matched = scanFreeTextForGeo(textOrTarget);
    if (matched) return matched;
    return buildWorldOverviewFallback(textOrTarget);
  }

  if (!textOrTarget) {
    return buildWorldOverviewFallback();
  }

  // 1. Explicit CorridorId always wins immediately
  if (textOrTarget.corridorId) {
    const corr = CORRIDOR_BY_ID.get(textOrTarget.corridorId);
    if (corr) return corridorToScene(corr, textOrTarget);
  }

  // 2. Scan combined semantic text fields (`query`, `label`, `title`, `subtitle`, `spokenText`)
  const combinedText = [
    textOrTarget.query,
    textOrTarget.label,
    textOrTarget.title,
    textOrTarget.subtitle,
    textOrTarget.spokenText,
  ]
    .filter((s): s is string => Boolean(s && s.trim()))
    .join(" — ");

  const combinedNorm = normalizePhrase(combinedText);

  // Check if explicit non-default IDs were passed
  const rawFipsList =
    textOrTarget.stateFips && textOrTarget.stateFips.length > 0
      ? textOrTarget.stateFips
      : textOrTarget.highlightStatesFips && textOrTarget.highlightStatesFips.length > 0
        ? textOrTarget.highlightStatesFips
        : textOrTarget.highlightStateFips
          ? [textOrTarget.highlightStateFips]
          : [];

  const isLegacySingleTexasDefault =
    rawFipsList.length === 1 &&
    pad2(rawFipsList[0]) === "48" &&
    !hasTexasIntent(combinedNorm);

  // If text names a real place, let text resolution override legacy "48" default!
  if (combinedText && (rawFipsList.length === 0 || isLegacySingleTexasDefault)) {
    const fromText = scanFreeTextForGeo(combinedText, textOrTarget);
    if (fromText) return fromText;
  }

  // 3. Explicit Country ISO IDs
  const explicitCountryIds =
    textOrTarget.countryIds && textOrTarget.countryIds.length > 0
      ? textOrTarget.countryIds
      : textOrTarget.region === "world" && rawFipsList.length > 0
        ? rawFipsList
        : [];

  if (explicitCountryIds.length > 0) {
    const resolvedCountries: CountryRecord[] = [];
    for (let i = 0; i < explicitCountryIds.length; i++) {
      const c = getCountryByIsoOrName(explicitCountryIds[i]);
      if (c) resolvedCountries.push(c);
    }
    if (resolvedCountries.length > 0) {
      return buildCountryScene(resolvedCountries, textOrTarget);
    }
  }

  // 4. Explicit US State FIPS / Postal Codes (when genuine!)
  if (rawFipsList.length > 0 && !isLegacySingleTexasDefault) {
    // Check if exact 13-state PJM set was passed
    if (rawFipsList.length >= 10 && rawFipsList.indexOf("42") !== -1 && rawFipsList.indexOf("51") !== -1) {
      return corridorToScene(CORRIDOR_BY_ID.get("PJM_GRID")!, textOrTarget);
    }
    const resolvedStates: UsStateRecord[] = [];
    for (let i = 0; i < rawFipsList.length; i++) {
      const st = getUsStateByFipsOrName(rawFipsList[i]);
      if (st) resolvedStates.push(st);
    }
    if (resolvedStates.length > 0) {
      if (
        resolvedStates.length === 1 &&
        resolvedStates[0].fips === "48" &&
        containsWholePhrase(combinedNorm, "austin")
      ) {
        return corridorToScene(CORRIDOR_BY_ID.get("AUSTIN_TEXAS")!, textOrTarget);
      }
      return buildUsStatesScene(resolvedStates, textOrTarget);
    }
  }

  // 5. Secondary text scan if explicit IDs were empty or unmatched
  if (combinedText) {
    const fallbackTextMatch = scanFreeTextForGeo(combinedText, textOrTarget);
    if (fallbackTextMatch) return fallbackTextMatch;
  }

  // 6. Explicit custom coordinates/pins without named country/state
  if (textOrTarget.center || (textOrTarget.pins && textOrTarget.pins.length > 0)) {
    const pts: LonLat[] = [];
    if (textOrTarget.center) pts.push(textOrTarget.center);
    if (textOrTarget.pins) {
      for (let i = 0; i < textOrTarget.pins.length; i++) {
        pts.push(textOrTarget.pins[i].coordinates);
      }
    }
    const center = textOrTarget.center ?? pts[0];
    const scope = textOrTarget.scope ?? (textOrTarget.region === "us" || textOrTarget.region === "usa" ? "usa" : "world");
    return {
      id: "custom:explicit-coordinates",
      matchedBy: "explicit-target",
      scope,
      atlasDataset: scope === "usa" ? "usa" : "world",
      title: textOrTarget.title ?? textOrTarget.label ?? "Strategic Coordinate Focus",
      eyebrow: "Cartographic Telemetry Plate",
      subtitle:
        textOrTarget.subtitle ??
        `${center[1].toFixed(2)}° ${center[1] >= 0 ? "N" : "S"}, ${Math.abs(center[0]).toFixed(2)}° ${center[0] >= 0 ? "E" : "W"}`,
      sourceNote: textOrTarget.sourceNote,
      center,
      bbox: textOrTarget.bbox ?? computeGeoBoundingBox(pts, 6),
      initialZoom: 1.0,
      targetZoom: textOrTarget.zoom ?? 2.2,
      register: textOrTarget.register ?? "page-editorial",
      routeTone: textOrTarget.routeTone ?? "primary",
      primaryCountryIds: [],
      secondaryCountryIds: textOrTarget.secondaryCountryIds ? [...textOrTarget.secondaryCountryIds] : [],
      alertCountryIds: textOrTarget.alertCountryIds ? [...textOrTarget.alertCountryIds] : [],
      primaryStateFips: [],
      secondaryStateFips: [],
      alertStateFips: [],
      pins: textOrTarget.pins ? [...textOrTarget.pins] : [],
      arcs: textOrTarget.arcs ? [...textOrTarget.arcs] : [],
      warnings: textOrTarget.warnings ? [...textOrTarget.warnings] : [],
    };
  }

  // 7. If caller explicitly asked for "48" with zero conflicting non-Texas text at all
  if (rawFipsList.length === 1 && pad2(rawFipsList[0]) === "48" && !combinedText) {
    return corridorToScene(CORRIDOR_BY_ID.get("AUSTIN_TEXAS")!, textOrTarget);
  }

  return buildWorldOverviewFallback(combinedText, textOrTarget);
}

function buildWorldOverviewFallback(
  rawLabel?: string,
  overrides?: Partial<GeoQueryTarget>
): ResolvedGeoScene {
  const cleanTitle =
    overrides?.title ??
    overrides?.label ??
    (rawLabel && rawLabel.trim().length > 0 && rawLabel.trim().length <= 64
      ? rawLabel.trim()
      : "Global Geopolitical & Trade Overview");

  return {
    id: "world:overview",
    matchedBy: "world-overview-fallback",
    scope: overrides?.scope ?? "world",
    atlasDataset: overrides?.scope === "usa" ? "usa" : "world",
    title: cleanTitle,
    eyebrow: "Global Macro Cartography • Natural Earth 1:110m",
    subtitle:
      overrides?.subtitle ??
      "Sovereign capital, energy chokepoints, semiconductor fabs & subsea fiber corridors",
    sourceNote: overrides?.sourceNote,
    center: [12, 22],
    bbox: [
      [-165, -52],
      [175, 72],
    ],
    initialZoom: 1.0,
    targetZoom: overrides?.zoom ?? 1.08,
    register: overrides?.register ?? "page-editorial",
    routeTone: overrides?.routeTone ?? "primary",
    primaryCountryIds: [],
    secondaryCountryIds: [],
    alertCountryIds: [],
    primaryStateFips: [],
    secondaryStateFips: [],
    alertStateFips: [],
    pins: overrides?.pins ? [...overrides.pins] : [],
    arcs: overrides?.arcs ? [...overrides.arcs] : [],
    warnings: overrides?.warnings ? [...overrides.warnings] : [],
  };
}

export { getCountryCount, getUsStateCount, getUsTerritoryCount, getCorridorCount };
