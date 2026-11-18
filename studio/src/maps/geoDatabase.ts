import { z } from "zod";

// ============================================================================
// Pillar #3 Cartography — Offline World, US States & War-Room Corridor Database
// ============================================================================

export const LonLatSchema = z.tuple([z.number(), z.number()]);
export type LonLat = [number, number];

export const GeoBoundingBoxSchema = z.tuple([LonLatSchema, LonLatSchema]);
export type GeoBoundingBox = [LonLat, LonLat];

export const MAP_SCOPES = [
  "world",
  "usa",
  "europe",
  "east-asia",
  "middle-east",
  "americas",
  "bbox",
] as const;
export const MapScopeSchema = z.enum(MAP_SCOPES);
export type MapScope = (typeof MAP_SCOPES)[number];

export const MAP_VISUAL_REGISTERS = [
  "page-editorial",
  "midnight-telemetry",
  "drafting-blueprint",
  "over-footage-glass",
] as const;
export const MapVisualRegisterSchema = z.enum(MAP_VISUAL_REGISTERS);
export type MapVisualRegister = (typeof MAP_VISUAL_REGISTERS)[number];

export const MAP_TONES = ["primary", "secondary", "alert", "capital"] as const;
export const MapToneSchema = z.enum(MAP_TONES);
export type MapTone = (typeof MAP_TONES)[number];

export const MAP_PIN_KINDS = [
  "city",
  "capital",
  "port",
  "substation",
  "nuclear",
  "fab",
  "datacenter",
  "chokepoint",
  "cable-landing",
  "mine",
  "financial-center",
  "historical",
] as const;
export const MapPinKindSchema = z.enum(MAP_PIN_KINDS);
export type MapPinKind = (typeof MAP_PIN_KINDS)[number];

export const MAP_ARC_KINDS = [
  "shipping",
  "submarine-cable",
  "capital-flow",
  "power-grid",
  "supply-chain",
  "air-corridor",
] as const;
export const MapArcKindSchema = z.enum(MAP_ARC_KINDS);
export type MapArcKind = (typeof MAP_ARC_KINDS)[number];

export const MAP_WARNING_KINDS = [
  "cable-cut",
  "blockade",
  "chokepoint-alert",
  "grid-stress",
  "tariff-gate",
  "insurance-void",
] as const;
export const MapWarningKindSchema = z.enum(MAP_WARNING_KINDS);
export type MapWarningKind = (typeof MAP_WARNING_KINDS)[number];

export const CORRIDOR_IDS = [
  "PJM_GRID",
  "WEST_LONDON_M4",
  "AUSTIN_TEXAS",
  "LOGAN_COUNTY_WV",
  "ALASKA_JUNEAU",
  "SILICON_VALLEY_PALO_ALTO",
  "MEMPHIS_FREIGHT_HUB",
  "DETROIT_AUTO",
  "ROTTERDAM_PORT",
  "SHENZHEN_DELTA",
  "TAIWAN_STRAIT_2NM",
  "RED_SEA_CHOKEPOINT",
  "BALTIC_CABLES",
  "TRANSATLANTIC_CABLES",
  "EURO_SOVEREIGN_SPREAD",
  "TOKYO_JGB_FLOW",
  "ARIZONA_FAB_CORRIDOR",
  "CALIFORNIA_FAIR_INSURANCE",
  "FLORIDA_INSURANCE",
  "STRAIT_OF_HORMUZ",
  "MALACCA_STRAIT",
  "SUEZ_CORRIDOR",
  "PANAMA_CANAL",
  "CHILE_PERU_COPPER_BELT",
] as const;
export const CorridorIdSchema = z.enum(CORRIDOR_IDS);
export type CorridorId = (typeof CORRIDOR_IDS)[number];

export const MapPinSpecSchema = z.object({
  id: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
  metric: z.string().optional(),
  coordinates: LonLatSchema,
  kind: MapPinKindSchema,
  tone: MapToneSchema.optional(),
  pulse: z.boolean().optional(),
});
export type MapPinSpec = z.infer<typeof MapPinSpecSchema>;

export const MapArcSpecSchema = z.object({
  id: z.string(),
  from: LonLatSchema,
  to: LonLatSchema,
  fromLabel: z.string().optional(),
  toLabel: z.string().optional(),
  label: z.string().optional(),
  kind: MapArcKindSchema,
  tone: MapToneSchema.optional(),
  dashed: z.boolean().optional(),
  severedAt: z.number().min(0).max(1).optional(),
});
export type MapArcSpec = z.infer<typeof MapArcSpecSchema>;

export const MapWarningSpecSchema = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string().optional(),
  coordinates: LonLatSchema,
  kind: MapWarningKindSchema,
  radiusDeg: z.number().optional(),
});
export type MapWarningSpec = z.infer<typeof MapWarningSpecSchema>;

export type ContinentRegion =
  | "north-america"
  | "south-america"
  | "europe"
  | "asia"
  | "middle-east"
  | "africa"
  | "oceania"
  | "antarctica";

export interface CountryRecord {
  isoNumeric: string;
  atlasName?: string;
  has110mPolygon: boolean;
  iso2: string;
  iso3: string;
  name: string;
  aliases: readonly string[];
  continent: ContinentRegion;
  defaultScope: Exclude<MapScope, "usa">;
  centroid: LonLat;
  capital?: string;
  capitalCoords?: LonLat;
  defaultZoom: number;
}

export interface UsStateCity {
  name: string;
  coordinates: LonLat;
  role?: string;
  aliases?: readonly string[];
}

export interface UsStateRecord {
  fips: string;
  postal: string;
  name: string;
  aliases: readonly string[];
  centroid: LonLat;
  capital: string;
  capitalCoords: LonLat;
  majorCities: readonly UsStateCity[];
  defaultZoom: number;
}

export interface UsTerritoryRecord {
  fips: string;
  postal: string;
  name: string;
  isoNumeric: string;
  centroid: LonLat;
  aliases: readonly string[];
}

export interface GlobalCityHub {
  id: string;
  name: string;
  countryIsoNumeric: string;
  stateFips?: string;
  coordinates: LonLat;
  kind: MapPinKind;
  scope: MapScope;
  aliases: readonly string[];
  sublabel?: string;
  defaultZoom: number;
}

export interface GeopoliticalCorridor {
  id: CorridorId;
  title: string;
  eyebrow: string;
  subtitle: string;
  episodeTag: string;
  scope: MapScope;
  center: LonLat;
  bbox: GeoBoundingBox;
  targetZoom: number;
  rotateLon?: number;
  defaultRegister?: MapVisualRegister;
  routeTone: MapTone;
  primaryCountryIds: readonly string[];
  secondaryCountryIds: readonly string[];
  alertCountryIds?: readonly string[];
  primaryStateFips: readonly string[];
  secondaryStateFips?: readonly string[];
  alertStateFips?: readonly string[];
  pins: readonly MapPinSpec[];
  arcs: readonly MapArcSpec[];
  warnings: readonly MapWarningSpec[];
  keywords: readonly string[];
  sourceNote?: string;
}

// Compact tuple factory for WORLD_COUNTRIES so 211 entries stay crisp & readable
type CountrySeed = readonly [
  isoNumeric: string,
  iso2: string,
  iso3: string,
  name: string,
  atlasName: string | null,
  has110m: boolean,
  continent: ContinentRegion,
  scope: Exclude<MapScope, "usa">,
  lon: number,
  lat: number,
  zoom: number,
  capital: string,
  capLon: number,
  capLat: number,
  aliases: readonly string[],
];

function buildCountries(seeds: readonly CountrySeed[]): CountryRecord[] {
  const out: CountryRecord[] = [];
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    out.push({
      isoNumeric: s[0],
      atlasName: s[4] ?? undefined,
      has110mPolygon: s[5],
      iso2: s[1],
      iso3: s[2],
      name: s[3],
      aliases: s[14],
      continent: s[6],
      defaultScope: s[7],
      centroid: [s[8], s[9]],
      defaultZoom: s[10],
      capital: s[11] || undefined,
      capitalCoords: s[11] ? [s[12], s[13]] : undefined,
    });
  }
  return out;
}

const COUNTRY_SEEDS_PART_A: readonly CountrySeed[] = [
  // Americas (North, Central, Caribbean, South)
  ["840", "US", "USA", "United States", "United States of America", true, "north-america", "americas", -98.58, 39.83, 2.0, "Washington, D.C.", -77.04, 38.9, ["united states of america", "usa", "america", "u.s.", "u.s.a."]],
  ["124", "CA", "CAN", "Canada", "Canada", true, "north-america", "americas", -96.4, 58.2, 1.8, "Ottawa", -75.7, 45.42, ["canadian"]],
  ["484", "MX", "MEX", "Mexico", "Mexico", true, "north-america", "americas", -102.22, 23.91, 2.3, "Mexico City", -99.13, 19.43, ["united mexican states", "mexican"]],
  ["304", "GL", "GRL", "Greenland", "Greenland", true, "north-america", "world", -41.96, 72.0, 2.0, "Nuuk", -51.72, 64.18, ["kalaallit nunaat"]],
  ["044", "BS", "BHS", "Bahamas", "Bahamas", true, "north-america", "americas", -77.93, 25.03, 3.2, "Nassau", -77.35, 25.05, ["the bahamas"]],
  ["192", "CU", "CUB", "Cuba", "Cuba", true, "north-america", "americas", -78.93, 21.65, 3.0, "Havana", -82.37, 23.11, ["havana"]],
  ["332", "HT", "HTI", "Haiti", "Haiti", true, "north-america", "americas", -72.66, 18.9, 3.4, "Port-au-Prince", -72.34, 18.54, []],
  ["214", "DO", "DOM", "Dominican Republic", "Dominican Rep.", true, "north-america", "americas", -70.46, 18.89, 3.4, "Santo Domingo", -69.93, 18.49, ["dominican rep.", "santo domingo"]],
  ["388", "JM", "JAM", "Jamaica", "Jamaica", true, "north-america", "americas", -77.32, 18.14, 3.5, "Kingston", -76.79, 18.0, []],
  ["630", "PR", "PRI", "Puerto Rico", "Puerto Rico", true, "north-america", "americas", -66.48, 18.24, 3.6, "San Juan", -66.11, 18.47, ["san juan"]],
  ["780", "TT", "TTO", "Trinidad and Tobago", "Trinidad and Tobago", true, "south-america", "americas", -61.33, 10.43, 3.5, "Port of Spain", -61.52, 10.66, ["trinidad"]],
  ["084", "BZ", "BLZ", "Belize", "Belize", true, "north-america", "americas", -88.7, 17.19, 3.3, "Belmopan", -88.77, 17.25, []],
  ["320", "GT", "GTM", "Guatemala", "Guatemala", true, "north-america", "americas", -90.37, 15.7, 3.1, "Guatemala City", -90.51, 14.63, []],
  ["340", "HN", "HND", "Honduras", "Honduras", true, "north-america", "americas", -86.59, 14.83, 3.1, "Tegucigalpa", -87.21, 14.07, []],
  ["222", "SV", "SLV", "El Salvador", "El Salvador", true, "north-america", "americas", -88.87, 13.73, 3.4, "San Salvador", -89.22, 13.69, []],
  ["558", "NI", "NIC", "Nicaragua", "Nicaragua", true, "north-america", "americas", -85.02, 12.85, 3.1, "Managua", -86.25, 12.14, []],
  ["188", "CR", "CRI", "Costa Rica", "Costa Rica", true, "north-america", "americas", -84.17, 9.97, 3.3, "San Jose", -84.09, 9.93, []],
  ["591", "PA", "PAN", "Panama", "Panama", true, "north-america", "americas", -80.11, 8.53, 3.4, "Panama City", -79.52, 8.98, ["panamanian"]],
  ["170", "CO", "COL", "Colombia", "Colombia", true, "south-america", "americas", -73.07, 3.92, 2.5, "Bogota", -74.07, 4.71, ["colombian"]],
  ["862", "VE", "VEN", "Venezuela", "Venezuela", true, "south-america", "americas", -66.15, 7.16, 2.6, "Caracas", -66.9, 10.48, ["venezuelan"]],
  ["328", "GY", "GUY", "Guyana", "Guyana", true, "south-america", "americas", -58.97, 4.79, 2.9, "Georgetown", -58.16, 6.8, []],
  ["740", "SR", "SUR", "Suriname", "Suriname", true, "south-america", "americas", -55.91, 4.12, 3.0, "Paramaribo", -55.2, 5.85, []],
  ["218", "EC", "ECU", "Ecuador", "Ecuador", true, "south-america", "americas", -78.38, -1.45, 2.9, "Quito", -78.47, -0.18, []],
  ["604", "PE", "PER", "Peru", "Peru", true, "south-america", "americas", -74.43, -9.15, 2.4, "Lima", -77.04, -12.05, ["peruvian"]],
  ["076", "BR", "BRA", "Brazil", "Brazil", true, "south-america", "americas", -53.17, -10.66, 1.9, "Brasilia", -47.88, -15.79, ["brazilian", "brasil"]],
  ["068", "BO", "BOL", "Bolivia", "Bolivia", true, "south-america", "americas", -64.65, -16.7, 2.5, "La Paz", -68.12, -16.49, ["bolivian"]],
  ["600", "PY", "PRY", "Paraguay", "Paraguay", true, "south-america", "americas", -58.43, -23.23, 2.7, "Asuncion", -57.58, -25.26, []],
  ["152", "CL", "CHL", "Chile", "Chile", true, "south-america", "americas", -71.18, -33.45, 2.2, "Santiago", -70.67, -33.45, ["chilean"]],
  ["032", "AR", "ARG", "Argentina", "Argentina", true, "south-america", "americas", -64.75, -34.74, 2.1, "Buenos Aires", -58.38, -34.6, ["argentine", "argentinian"]],
  ["858", "UY", "URY", "Uruguay", "Uruguay", true, "south-america", "americas", -56.01, -32.77, 2.9, "Montevideo", -56.16, -34.9, []],
  ["238", "FK", "FLK", "Falkland Islands", "Falkland Is.", true, "south-america", "americas", -59.42, -51.72, 3.2, "Stanley", -57.85, -51.69, ["falkland is.", "malvinas"]],

  // Europe & Eurasia
  ["826", "GB", "GBR", "United Kingdom", "United Kingdom", true, "europe", "europe", -2.2, 53.5, 2.4, "London", -0.13, 51.51, ["uk", "u.k.", "great britain", "britain", "england", "british", "scotland", "wales"]],
  ["372", "IE", "IRL", "Ireland", "Ireland", true, "europe", "europe", -8.02, 53.17, 2.8, "Dublin", -6.26, 53.35, ["republic of ireland", "irish"]],
  ["352", "IS", "ISL", "Iceland", "Iceland", true, "europe", "europe", -18.77, 65.08, 2.5, "Reykjavik", -21.94, 64.15, ["reykjavik"]],
  ["578", "NO", "NOR", "Norway", "Norway", true, "europe", "europe", 9.5, 61.5, 2.1, "Oslo", 10.75, 59.91, ["norwegian"]],
  ["752", "SE", "SWE", "Sweden", "Sweden", true, "europe", "europe", 15.6, 61.2, 2.1, "Stockholm", 18.07, 59.33, ["swedish"]],
  ["246", "FI", "FIN", "Finland", "Finland", true, "europe", "europe", 25.8, 62.9, 2.2, "Helsinki", 24.94, 60.17, ["finnish"]],
  ["208", "DK", "DNK", "Denmark", "Denmark", true, "europe", "europe", 9.89, 56.06, 2.8, "Copenhagen", 12.57, 55.68, ["danish", "copenhagen"]],
  ["233", "EE", "EST", "Estonia", "Estonia", true, "europe", "europe", 25.83, 58.64, 2.9, "Tallinn", 24.75, 59.44, ["estonian"]],
  ["428", "LV", "LVA", "Latvia", "Latvia", true, "europe", "europe", 24.84, 56.82, 2.9, "Riga", 24.11, 56.95, ["latvian", "riga"]],
  ["440", "LT", "LTU", "Lithuania", "Lithuania", true, "europe", "europe", 23.89, 55.28, 2.9, "Vilnius", 25.28, 54.69, ["lithuanian", "vilnius"]],
  ["528", "NL", "NLD", "Netherlands", "Netherlands", true, "europe", "europe", 5.29, 52.13, 3.0, "Amsterdam", 4.9, 52.37, ["holland", "dutch", "the netherlands"]],
  ["056", "BE", "BEL", "Belgium", "Belgium", true, "europe", "europe", 4.59, 50.65, 3.1, "Brussels", 4.35, 50.85, ["belgian", "brussels"]],
  ["442", "LU", "LUX", "Luxembourg", "Luxembourg", true, "europe", "europe", 5.97, 49.76, 3.4, "Luxembourg", 6.13, 49.61, []],
  ["250", "FR", "FRA", "France", "France", true, "europe", "europe", 2.21, 46.6, 2.3, "Paris", 2.35, 48.86, ["french", "french republic"]],
  ["276", "DE", "DEU", "Germany", "Germany", true, "europe", "europe", 10.27, 51.08, 2.4, "Berlin", 13.4, 52.52, ["german", "bundesrepublik"]],
  ["756", "CH", "CHE", "Switzerland", "Switzerland", true, "europe", "europe", 8.12, 46.79, 3.0, "Bern", 7.45, 46.95, ["swiss"]],
  ["040", "AT", "AUT", "Austria", "Austria", true, "europe", "europe", 14.06, 47.62, 2.9, "Vienna", 16.37, 48.21, ["austrian", "vienna"]],
  ["620", "PT", "PRT", "Portugal", "Portugal", true, "europe", "europe", -8.06, 39.61, 2.7, "Lisbon", -9.14, 38.72, ["portuguese", "lisbon"]],
  ["724", "ES", "ESP", "Spain", "Spain", true, "europe", "europe", -3.62, 40.32, 2.4, "Madrid", -3.7, 40.42, ["spanish"]],
  ["380", "IT", "ITA", "Italy", "Italy", true, "europe", "europe", 12.27, 42.67, 2.4, "Rome", 12.5, 41.9, ["italian", "rome"]],
  ["616", "PL", "POL", "Poland", "Poland", true, "europe", "europe", 19.34, 52.13, 2.5, "Warsaw", 21.01, 52.23, ["polish"]],
  ["203", "CZ", "CZE", "Czechia", "Czechia", true, "europe", "europe", 15.34, 49.78, 2.9, "Prague", 14.44, 50.08, ["czech republic", "czech", "prague"]],
  ["703", "SK", "SVK", "Slovakia", "Slovakia", true, "europe", "europe", 19.5, 48.73, 3.0, "Bratislava", 17.11, 48.15, ["slovak", "bratislava"]],
  ["348", "HU", "HUN", "Hungary", "Hungary", true, "europe", "europe", 19.34, 47.2, 2.9, "Budapest", 19.04, 47.5, ["hungarian", "budapest"]],
  ["705", "SI", "SVN", "Slovenia", "Slovenia", true, "europe", "europe", 14.93, 46.13, 3.2, "Ljubljana", 14.51, 46.06, ["slovenian"]],
  ["191", "HR", "HRV", "Croatia", "Croatia", true, "europe", "europe", 16.57, 45.01, 2.9, "Zagreb", 15.98, 45.82, ["croatian", "zagreb"]],
  ["070", "BA", "BIH", "Bosnia and Herzegovina", "Bosnia and Herz.", true, "europe", "europe", 17.82, 44.18, 3.1, "Sarajevo", 18.41, 43.86, ["bosnia", "bosnia and herz.", "sarajevo"]],
  ["688", "RS", "SRB", "Serbia", "Serbia", true, "europe", "europe", 20.84, 44.22, 2.9, "Belgrade", 20.46, 44.81, ["serbian", "belgrade"]],
  ["499", "ME", "MNE", "Montenegro", "Montenegro", true, "europe", "europe", 19.29, 42.79, 3.3, "Podgorica", 19.26, 42.44, []],
  ["X01", "XK", "XKX", "Kosovo", "Kosovo", true, "europe", "europe", 20.9, 42.58, 3.4, "Pristina", 21.17, 42.66, ["pristina"]],
  ["008", "AL", "ALB", "Albania", "Albania", true, "europe", "europe", 20.03, 41.13, 3.2, "Tirana", 19.82, 41.33, ["albanian", "tirana"]],
  ["807", "MK", "MKD", "North Macedonia", "Macedonia", true, "europe", "europe", 21.7, 41.61, 3.2, "Skopje", 21.43, 42.0, ["macedonia", "skopje"]],
  ["300", "GR", "GRC", "Greece", "Greece", true, "europe", "europe", 22.72, 39.04, 2.6, "Athens", 23.73, 37.98, ["greek", "hellenic republic"]],
  ["100", "BG", "BGR", "Bulgaria", "Bulgaria", true, "europe", "europe", 25.19, 42.76, 2.8, "Sofia", 23.32, 42.7, ["bulgarian", "sofia"]],
  ["642", "RO", "ROU", "Romania", "Romania", true, "europe", "europe", 24.95, 45.85, 2.6, "Bucharest", 26.1, 44.43, ["romanian", "bucharest"]],
  ["498", "MD", "MDA", "Moldova", "Moldova", true, "europe", "europe", 28.42, 47.2, 3.1, "Chisinau", 28.86, 47.01, ["chisinau"]],
  ["804", "UA", "UKR", "Ukraine", "Ukraine", true, "europe", "europe", 31.29, 49.19, 2.2, "Kyiv", 30.52, 50.45, ["ukrainian", "kiev"]],
  ["112", "BY", "BLR", "Belarus", "Belarus", true, "europe", "europe", 27.96, 53.5, 2.6, "Minsk", 27.56, 53.9, ["belarusian", "minsk"]],
  ["643", "RU", "RUS", "Russia", "Russia", true, "europe", "world", 60.0, 58.0, 1.6, "Moscow", 37.62, 55.76, ["russian federation", "russian", "moscow"]],
  ["196", "CY", "CYP", "Cyprus", "Cyprus", true, "europe", "middle-east", 33.04, 34.91, 3.4, "Nicosia", 33.38, 35.19, ["cypriot", "nicosia"]],
  ["X02", "XC", "XNC", "Northern Cyprus", "N. Cyprus", true, "europe", "middle-east", 33.56, 35.27, 3.5, "North Nicosia", 33.36, 35.2, ["n. cyprus"]],
  ["268", "GE", "GEO", "Georgia", "Georgia", true, "europe", "middle-east", 43.5, 42.17, 3.0, "Tbilisi", 44.79, 41.72, ["tbilisi", "republic of georgia"]],
  ["051", "AM", "ARM", "Armenia", "Armenia", true, "europe", "middle-east", 45.01, 40.21, 3.2, "Yerevan", 44.51, 40.18, ["armenian", "yerevan"]],
  ["031", "AZ", "AZE", "Azerbaijan", "Azerbaijan", true, "europe", "middle-east", 47.56, 40.22, 3.0, "Baku", 49.87, 40.41, ["azerbaijani", "baku"]],

  // Middle East & Central Asia
  ["792", "TR", "TUR", "Turkey", "Turkey", true, "middle-east", "middle-east", 35.12, 39.15, 2.3, "Ankara", 32.86, 39.93, ["turkiye", "türkiye", "turkish", "ankara"]],
  ["760", "SY", "SYR", "Syria", "Syria", true, "middle-east", "middle-east", 38.52, 35.01, 2.8, "Damascus", 36.29, 33.51, ["syrian", "damascus"]],
  ["422", "LB", "LBN", "Lebanon", "Lebanon", true, "middle-east", "middle-east", 35.87, 33.91, 3.4, "Beirut", 35.5, 33.89, ["lebanese", "beirut"]],
  ["376", "IL", "ISR", "Israel", "Israel", true, "middle-east", "middle-east", 35.0, 31.48, 3.2, "Jerusalem", 35.21, 31.77, ["israeli"]],
  ["275", "PS", "PSE", "Palestine", "Palestine", true, "middle-east", "middle-east", 35.27, 31.94, 3.4, "Ramallah", 35.2, 31.9, ["palestinian territories", "west bank"]],
  ["400", "JO", "JOR", "Jordan", "Jordan", true, "middle-east", "middle-east", 36.77, 31.24, 3.0, "Amman", 35.93, 31.95, ["jordanian", "amman"]],
  ["368", "IQ", "IRQ", "Iraq", "Iraq", true, "middle-east", "middle-east", 43.79, 33.01, 2.6, "Baghdad", 44.37, 33.31, ["iraqi", "baghdad"]],
  ["414", "KW", "KWT", "Kuwait", "Kuwait", true, "middle-east", "middle-east", 47.6, 29.31, 3.3, "Kuwait City", 47.98, 29.38, ["kuwaiti"]],
  ["682", "SA", "SAU", "Saudi Arabia", "Saudi Arabia", true, "middle-east", "middle-east", 44.64, 24.09, 2.1, "Riyadh", 46.72, 24.69, ["ksa", "kingdom of saudi arabia", "saudi"]],
  ["634", "QA", "QAT", "Qatar", "Qatar", true, "middle-east", "middle-east", 51.18, 25.32, 3.4, "Doha", 51.53, 25.29, ["qatari", "doha"]],
  ["784", "AE", "ARE", "United Arab Emirates", "United Arab Emirates", true, "middle-east", "middle-east", 54.2, 23.87, 3.0, "Abu Dhabi", 54.37, 24.45, ["uae", "u.a.e.", "emirates", "abu dhabi"]],
  ["512", "OM", "OMN", "Oman", "Oman", true, "middle-east", "middle-east", 56.07, 20.59, 2.7, "Muscat", 58.41, 23.59, ["omani", "muscat"]],
  ["887", "YE", "YEM", "Yemen", "Yemen", true, "middle-east", "middle-east", 47.52, 15.92, 2.6, "Sanaa", 44.21, 15.35, ["yemeni", "sanaa", "houthi"]],
  ["364", "IR", "IRN", "Iran", "Iran", true, "middle-east", "middle-east", 54.45, 32.47, 2.2, "Tehran", 51.39, 35.69, ["iranian", "tehran", "persia"]],
  ["398", "KZ", "KAZ", "Kazakhstan", "Kazakhstan", true, "asia", "world", 67.24, 48.41, 2.1, "Astana", 71.45, 51.17, ["kazakh", "astana"]],
  ["860", "UZ", "UZB", "Uzbekistan", "Uzbekistan", true, "asia", "world", 63.37, 41.77, 2.6, "Tashkent", 69.24, 41.3, ["uzbek", "tashkent"]],
  ["795", "TM", "TKM", "Turkmenistan", "Turkmenistan", true, "asia", "middle-east", 59.35, 39.1, 2.7, "Ashgabat", 58.38, 37.96, ["ashgabat"]],
  ["417", "KG", "KGZ", "Kyrgyzstan", "Kyrgyzstan", true, "asia", "world", 74.59, 41.52, 2.9, "Bishkek", 74.59, 42.87, ["bishkek"]],
  ["762", "TJ", "TJK", "Tajikistan", "Tajikistan", true, "asia", "world", 71.05, 38.59, 3.0, "Dushanbe", 68.78, 38.56, ["dushanbe"]],
  ["004", "AF", "AFG", "Afghanistan", "Afghanistan", true, "asia", "middle-east", 66.0, 33.84, 2.6, "Kabul", 69.17, 34.53, ["afghan", "kabul"]],
];

const COUNTRY_SEEDS_PART_B: readonly CountrySeed[] = [
  // South, East & Southeast Asia
  ["586", "PK", "PAK", "Pakistan", "Pakistan", true, "asia", "world", 69.23, 29.91, 2.4, "Islamabad", 73.05, 33.68, ["pakistani", "islamabad", "karachi"]],
  ["356", "IN", "IND", "India", "India", true, "asia", "world", 79.54, 22.82, 2.0, "New Delhi", 77.21, 28.61, ["indian", "new delhi"]],
  ["524", "NP", "NPL", "Nepal", "Nepal", true, "asia", "world", 84.04, 28.25, 3.0, "Kathmandu", 85.32, 27.72, ["kathmandu"]],
  ["064", "BT", "BTN", "Bhutan", "Bhutan", true, "asia", "world", 90.47, 27.43, 3.3, "Thimphu", 89.64, 27.47, ["thimphu"]],
  ["050", "BD", "BGD", "Bangladesh", "Bangladesh", true, "asia", "east-asia", 90.28, 23.83, 3.0, "Dhaka", 90.41, 23.81, ["bangladeshi", "dhaka"]],
  ["144", "LK", "LKA", "Sri Lanka", "Sri Lanka", true, "asia", "world", 80.67, 7.7, 3.2, "Colombo", 79.86, 6.93, ["colombo"]],
  ["104", "MM", "MMR", "Myanmar", "Myanmar", true, "asia", "east-asia", 96.51, 20.94, 2.6, "Naypyidaw", 96.13, 19.76, ["burma", "yangon"]],
  ["764", "TH", "THA", "Thailand", "Thailand", true, "asia", "east-asia", 101.0, 14.98, 2.6, "Bangkok", 100.5, 13.76, ["thai", "bangkok"]],
  ["418", "LA", "LAO", "Laos", "Laos", true, "asia", "east-asia", 103.79, 18.43, 2.9, "Vientiane", 102.63, 17.98, ["vientiane"]],
  ["116", "KH", "KHM", "Cambodia", "Cambodia", true, "asia", "east-asia", 104.87, 12.68, 3.0, "Phnom Penh", 104.92, 11.56, ["phnom penh"]],
  ["704", "VN", "VNM", "Vietnam", "Vietnam", true, "asia", "east-asia", 106.33, 16.56, 2.6, "Hanoi", 105.83, 21.03, ["vietnamese", "hanoi", "ho chi minh city"]],
  ["458", "MY", "MYS", "Malaysia", "Malaysia", true, "asia", "east-asia", 102.2, 4.2, 2.7, "Kuala Lumpur", 101.69, 3.14, ["malaysian", "kuala lumpur"]],
  ["096", "BN", "BRN", "Brunei", "Brunei", true, "asia", "east-asia", 114.92, 4.69, 3.5, "Bandar Seri Begawan", 114.95, 4.9, []],
  ["360", "ID", "IDN", "Indonesia", "Indonesia", true, "asia", "east-asia", 117.36, -2.27, 2.0, "Jakarta", 106.85, -6.21, ["indonesian", "jakarta"]],
  ["626", "TL", "TLS", "Timor-Leste", "Timor-Leste", true, "asia", "east-asia", 125.97, -8.77, 3.4, "Dili", 125.57, -8.56, ["east timor", "dili"]],
  ["608", "PH", "PHL", "Philippines", "Philippines", true, "asia", "east-asia", 122.94, 11.72, 2.5, "Manila", 120.98, 14.6, ["philippine", "filipino", "manila"]],
  ["156", "CN", "CHN", "China", "China", true, "asia", "east-asia", 105.0, 35.0, 1.9, "Beijing", 116.41, 39.9, ["people's republic of china", "prc", "chinese", "mainland china"]],
  ["158", "TW", "TWN", "Taiwan", "Taiwan", true, "asia", "east-asia", 120.97, 23.74, 3.2, "Taipei", 121.57, 25.03, ["republic of china", "roc", "taiwanese"]],
  ["496", "MN", "MNG", "Mongolia", "Mongolia", true, "asia", "east-asia", 103.02, 46.95, 2.3, "Ulaanbaatar", 106.91, 47.89, ["ulaanbaatar"]],
  ["408", "KP", "PRK", "North Korea", "North Korea", true, "asia", "east-asia", 127.13, 40.13, 2.9, "Pyongyang", 125.76, 39.04, ["dprk", "pyongyang"]],
  ["410", "KR", "KOR", "South Korea", "South Korea", true, "asia", "east-asia", 127.82, 36.42, 2.9, "Seoul", 126.98, 37.57, ["republic of korea", "rok", "korean"]],
  ["392", "JP", "JPN", "Japan", "Japan", true, "asia", "east-asia", 138.25, 36.2, 2.5, "Tokyo", 139.77, 35.68, ["japanese"]],

  // Africa
  ["504", "MA", "MAR", "Morocco", "Morocco", true, "africa", "europe", -7.1, 31.8, 2.6, "Rabat", -6.85, 34.02, ["moroccan", "rabat", "casablanca"]],
  ["732", "EH", "ESH", "Western Sahara", "W. Sahara", true, "africa", "world", -12.19, 24.28, 2.9, "Laayoune", -13.2, 27.15, ["w. sahara"]],
  ["012", "DZ", "DZA", "Algeria", "Algeria", true, "africa", "world", 2.61, 28.09, 2.2, "Algiers", 3.06, 36.75, ["algerian", "algiers"]],
  ["788", "TN", "TUN", "Tunisia", "Tunisia", true, "africa", "europe", 9.54, 34.14, 2.9, "Tunis", 10.18, 36.81, ["tunisian", "tunis"]],
  ["434", "LY", "LBY", "Libya", "Libya", true, "africa", "middle-east", 18.03, 26.99, 2.3, "Tripoli", 13.19, 32.89, ["libyan", "tripoli"]],
  ["818", "EG", "EGY", "Egypt", "Egypt", true, "africa", "middle-east", 29.86, 26.47, 2.5, "Cairo", 31.24, 30.04, ["egyptian"]],
  ["729", "SD", "SDN", "Sudan", "Sudan", true, "africa", "middle-east", 29.83, 15.97, 2.4, "Khartoum", 32.56, 15.5, ["sudanese", "khartoum"]],
  ["728", "SS", "SSD", "South Sudan", "S. Sudan", true, "africa", "world", 30.2, 7.29, 2.7, "Juba", 31.58, 4.86, ["s. sudan", "juba"]],
  ["232", "ER", "ERI", "Eritrea", "Eritrea", true, "africa", "middle-east", 38.69, 15.43, 2.9, "Asmara", 38.93, 15.32, ["asmara"]],
  ["262", "DJ", "DJI", "Djibouti", "Djibouti", true, "africa", "middle-east", 42.5, 11.77, 3.4, "Djibouti", 43.15, 11.59, []],
  ["706", "SO", "SOM", "Somalia", "Somalia", true, "africa", "middle-east", 45.7, 4.74, 2.5, "Mogadishu", 45.32, 2.05, ["somali", "mogadishu"]],
  ["X03", "XS", "XSL", "Somaliland", "Somaliland", true, "africa", "middle-east", 46.23, 9.76, 3.0, "Hargeisa", 44.06, 9.56, ["hargeisa"]],
  ["231", "ET", "ETH", "Ethiopia", "Ethiopia", true, "africa", "middle-east", 39.56, 8.65, 2.5, "Addis Ababa", 38.76, 9.03, ["ethiopian", "addis ababa"]],
  ["478", "MR", "MRT", "Mauritania", "Mauritania", true, "africa", "world", -10.35, 20.18, 2.5, "Nouakchott", -15.96, 18.07, []],
  ["466", "ML", "MLI", "Mali", "Mali", true, "africa", "world", -3.59, 17.24, 2.4, "Bamako", -8.0, 12.64, ["bamako"]],
  ["562", "NE", "NER", "Niger", "Niger", true, "africa", "world", 9.27, 17.34, 2.4, "Niamey", 2.13, 13.51, ["niamey"]],
  ["148", "TD", "TCD", "Chad", "Chad", true, "africa", "world", 18.57, 15.28, 2.4, "N'Djamena", 15.05, 12.13, []],
  ["686", "SN", "SEN", "Senegal", "Senegal", true, "africa", "world", -14.51, 14.35, 3.0, "Dakar", -17.47, 14.72, ["dakar"]],
  ["270", "GM", "GMB", "Gambia", "Gambia", true, "africa", "world", -15.43, 13.48, 3.5, "Banjul", -16.58, 13.45, ["the gambia"]],
  ["624", "GW", "GNB", "Guinea-Bissau", "Guinea-Bissau", true, "africa", "world", -15.11, 12.02, 3.3, "Bissau", -15.6, 11.86, []],
  ["324", "GN", "GIN", "Guinea", "Guinea", true, "africa", "world", -11.06, 10.45, 2.9, "Conakry", -13.58, 9.64, ["conakry"]],
  ["694", "SL", "SLE", "Sierra Leone", "Sierra Leone", true, "africa", "world", -11.8, 8.53, 3.2, "Freetown", -13.23, 8.47, ["freetown"]],
  ["430", "LR", "LBR", "Liberia", "Liberia", true, "africa", "world", -9.41, 6.43, 3.1, "Monrovia", -10.8, 6.3, ["monrovia"]],
  ["384", "CI", "CIV", "Ivory Coast", "Côte d'Ivoire", true, "africa", "world", -5.61, 7.55, 2.8, "Yamoussoukro", -5.28, 6.82, ["cote d'ivoire", "côte d'ivoire", "abidjan"]],
  ["854", "BF", "BFA", "Burkina Faso", "Burkina Faso", true, "africa", "world", -1.78, 12.31, 2.9, "Ouagadougou", -1.52, 12.37, []],
  ["288", "GH", "GHA", "Ghana", "Ghana", true, "africa", "world", -1.24, 7.92, 2.9, "Accra", -0.19, 5.6, ["ghanaian", "accra"]],
  ["768", "TG", "TGO", "Togo", "Togo", true, "africa", "world", 1.0, 8.43, 3.2, "Lome", 1.23, 6.13, []],
  ["204", "BJ", "BEN", "Benin", "Benin", true, "africa", "world", 2.34, 9.64, 3.1, "Porto-Novo", 2.63, 6.5, []],
  ["566", "NG", "NGA", "Nigeria", "Nigeria", true, "africa", "world", 7.99, 9.54, 2.5, "Abuja", 7.49, 9.08, ["nigerian", "abuja"]],
  ["120", "CM", "CMR", "Cameroon", "Cameroon", true, "africa", "world", 12.61, 5.65, 2.7, "Yaounde", 11.5, 3.85, []],
  ["140", "CF", "CAF", "Central African Republic", "Central African Rep.", true, "africa", "world", 20.37, 6.55, 2.6, "Bangui", 18.56, 4.39, ["central african rep.", "bangui"]],
  ["226", "GQ", "GNQ", "Equatorial Guinea", "Eq. Guinea", true, "africa", "world", 10.37, 1.65, 3.3, "Malabo", 8.78, 3.75, ["eq. guinea"]],
  ["266", "GA", "GAB", "Gabon", "Gabon", true, "africa", "world", 11.69, -0.65, 2.9, "Libreville", 9.45, 0.42, ["libreville"]],
  ["178", "CG", "COG", "Republic of the Congo", "Congo", true, "africa", "world", 15.14, -0.84, 2.8, "Brazzaville", 15.28, -4.27, ["congo-brazzaville", "brazzaville"]],
  ["180", "CD", "COD", "Democratic Republic of the Congo", "Dem. Rep. Congo", true, "africa", "world", 23.58, -2.84, 2.2, "Kinshasa", 15.32, -4.32, ["dem. rep. congo", "drc", "dr congo", "kinshasa", "katanga"]],
  ["800", "UG", "UGA", "Uganda", "Uganda", true, "africa", "world", 32.36, 1.3, 2.9, "Kampala", 32.58, 0.35, ["kampala"]],
  ["404", "KE", "KEN", "Kenya", "Kenya", true, "africa", "world", 37.79, 0.6, 2.7, "Nairobi", 36.82, -1.29, ["kenyan"]],
  ["646", "RW", "RWA", "Rwanda", "Rwanda", true, "africa", "world", 29.92, -2.01, 3.4, "Kigali", 30.06, -1.94, ["kigali"]],
  ["108", "BI", "BDI", "Burundi", "Burundi", true, "africa", "world", 29.91, -3.38, 3.4, "Gitega", 29.93, -3.43, []],
  ["834", "TZ", "TZA", "Tanzania", "Tanzania", true, "africa", "world", 34.74, -6.25, 2.5, "Dodoma", 35.75, -6.16, ["dar es salaam"]],
  ["024", "AO", "AGO", "Angola", "Angola", true, "africa", "world", 17.47, -12.23, 2.4, "Luanda", 13.23, -8.84, ["luanda"]],
  ["894", "ZM", "ZMB", "Zambia", "Zambia", true, "africa", "world", 27.76, -13.39, 2.6, "Lusaka", 28.28, -15.39, ["zambian", "lusaka"]],
  ["454", "MW", "MWI", "Malawi", "Malawi", true, "africa", "world", 34.19, -13.16, 2.9, "Lilongwe", 33.79, -13.96, []],
  ["508", "MZ", "MOZ", "Mozambique", "Mozambique", true, "africa", "world", 35.54, -17.15, 2.4, "Maputo", 32.57, -25.97, ["maputo"]],
  ["716", "ZW", "ZWE", "Zimbabwe", "Zimbabwe", true, "africa", "world", 29.79, -18.9, 2.8, "Harare", 31.05, -17.83, ["harare"]],
  ["072", "BW", "BWA", "Botswana", "Botswana", true, "africa", "world", 23.78, -22.08, 2.7, "Gaborone", 25.92, -24.63, ["gaborone"]],
  ["516", "NA", "NAM", "Namibia", "Namibia", true, "africa", "world", 17.14, -22.04, 2.5, "Windhoek", 17.08, -22.56, ["windhoek"]],
  ["710", "ZA", "ZAF", "South Africa", "South Africa", true, "africa", "world", 25.16, -28.92, 2.3, "Pretoria", 28.19, -25.75, ["south african", "cape town"]],
  ["426", "LS", "LSO", "Lesotho", "Lesotho", true, "africa", "world", 28.17, -29.62, 3.4, "Maseru", 27.48, -29.32, []],
  ["748", "SZ", "SWZ", "Eswatini", "eSwatini", true, "africa", "world", 31.4, -26.49, 3.4, "Mbabane", 31.13, -26.31, ["swaziland"]],
  ["450", "MG", "MDG", "Madagascar", "Madagascar", true, "africa", "world", 46.73, -19.3, 2.5, "Antananarivo", 47.51, -18.88, []],

  // Oceania & Polar (110m polygons)
  ["036", "AU", "AUS", "Australia", "Australia", true, "oceania", "world", 134.31, -25.76, 1.9, "Canberra", 149.13, -35.28, ["australian"]],
  ["554", "NZ", "NZL", "New Zealand", "New Zealand", true, "oceania", "world", 172.95, -41.55, 2.6, "Wellington", 174.78, -41.29, ["wellington", "auckland"]],
  ["598", "PG", "PNG", "Papua New Guinea", "Papua New Guinea", true, "oceania", "east-asia", 145.31, -6.46, 2.7, "Port Moresby", 147.18, -9.44, []],
  ["090", "SB", "SLB", "Solomon Islands", "Solomon Is.", true, "oceania", "world", 159.96, -8.85, 3.1, "Honiara", 159.97, -9.43, ["solomon is."]],
  ["548", "VU", "VUT", "Vanuatu", "Vanuatu", true, "oceania", "world", 167.07, -15.54, 3.2, "Port Vila", 168.33, -17.73, []],
  ["540", "NC", "NCL", "New Caledonia", "New Caledonia", true, "oceania", "world", 165.53, -21.26, 3.2, "Noumea", 166.46, -22.28, ["noumea"]],
  ["242", "FJ", "FJI", "Fiji", "Fiji", true, "oceania", "world", 178.57, -17.32, 3.2, "Suva", 178.44, -18.14, ["suva"]],
  ["260", "TF", "ATF", "French Southern Territories", "Fr. S. Antarctic Lands", true, "antarctica", "world", 69.53, -49.31, 2.8, "", 0, 0, ["fr. s. antarctic lands"]],
  ["010", "AQ", "ATA", "Antarctica", "Antarctica", true, "antarctica", "world", 0.0, -82.0, 1.4, "", 0, 0, ["south pole"]],

  // Sovereign Microstates, City-States & Strategic Financial/Maritime Territories (no 110m polygon -> high-craft Sovereign Pin)
  ["702", "SG", "SGP", "Singapore", null, false, "asia", "east-asia", 103.82, 1.35, 3.6, "Singapore", 103.82, 1.35, ["republic of singapore", "singaporean"]],
  ["344", "HK", "HKG", "Hong Kong", null, false, "asia", "east-asia", 114.17, 22.32, 3.5, "Hong Kong", 114.17, 22.32, ["hksar"]],
  ["446", "MO", "MAC", "Macau", null, false, "asia", "east-asia", 113.54, 22.2, 3.6, "Macau", 113.54, 22.2, ["macao"]],
  ["048", "BH", "BHR", "Bahrain", null, false, "middle-east", "middle-east", 50.56, 26.07, 3.6, "Manama", 50.59, 26.23, ["manama"]],
  ["470", "MT", "MLT", "Malta", null, false, "europe", "europe", 14.44, 35.89, 3.6, "Valletta", 14.51, 35.9, ["valletta"]],
  ["492", "MC", "MCO", "Monaco", null, false, "europe", "europe", 7.42, 43.74, 3.8, "Monaco", 7.42, 43.74, ["monte carlo"]],
  ["438", "LI", "LIE", "Liechtenstein", null, false, "europe", "europe", 9.55, 47.17, 3.7, "Vaduz", 9.52, 47.14, ["vaduz"]],
  ["020", "AD", "AND", "Andorra", null, false, "europe", "europe", 1.52, 42.51, 3.7, "Andorra la Vella", 1.52, 42.51, []],
  ["674", "SM", "SMR", "San Marino", null, false, "europe", "europe", 12.46, 43.94, 3.8, "San Marino", 12.46, 43.94, []],
  ["336", "VA", "VAT", "Vatican City", null, false, "europe", "europe", 12.45, 41.9, 3.8, "Vatican City", 12.45, 41.9, ["holy see", "vatican"]],
  ["292", "GI", "GIB", "Gibraltar", null, false, "europe", "europe", -5.35, 36.14, 3.6, "Gibraltar", -5.35, 36.14, ["strait of gibraltar"]],
  ["480", "MU", "MUS", "Mauritius", null, false, "africa", "world", 57.55, -20.28, 3.5, "Port Louis", 57.5, -20.16, ["port louis"]],
  ["690", "SC", "SYC", "Seychelles", null, false, "africa", "world", 55.45, -4.68, 3.5, "Victoria", 55.45, -4.62, []],
  ["462", "MV", "MDV", "Maldives", null, false, "asia", "world", 73.51, 4.18, 3.4, "Male", 73.51, 4.18, []],
  ["132", "CV", "CPV", "Cabo Verde", null, false, "africa", "world", -23.61, 15.11, 3.4, "Praia", -23.51, 14.93, ["cape verde"]],
  ["174", "KM", "COM", "Comoros", null, false, "africa", "world", 43.33, -11.65, 3.5, "Moroni", 43.26, -11.7, []],
  ["678", "ST", "STP", "Sao Tome and Principe", null, false, "africa", "world", 6.61, 0.24, 3.5, "Sao Tome", 6.73, 0.34, ["são tomé and príncipe"]],
  ["052", "BB", "BRB", "Barbados", null, false, "north-america", "americas", -59.54, 13.19, 3.6, "Bridgetown", -59.62, 13.1, ["bridgetown"]],
  ["028", "AG", "ATG", "Antigua and Barbuda", null, false, "north-america", "americas", -61.8, 17.08, 3.6, "Saint John's", -61.85, 17.12, []],
  ["212", "DM", "DMA", "Dominica", null, false, "north-america", "americas", -61.37, 15.41, 3.6, "Roseau", -61.39, 15.3, []],
  ["308", "GD", "GRD", "Grenada", null, false, "north-america", "americas", -61.68, 12.12, 3.6, "Saint George's", -61.75, 12.05, []],
  ["659", "KN", "KNA", "Saint Kitts and Nevis", null, false, "north-america", "americas", -62.75, 17.33, 3.6, "Basseterre", -62.72, 17.3, []],
  ["662", "LC", "LCA", "Saint Lucia", null, false, "north-america", "americas", -60.98, 13.91, 3.6, "Castries", -60.99, 14.01, []],
  ["670", "VC", "VCT", "Saint Vincent and the Grenadines", null, false, "north-america", "americas", -61.2, 13.25, 3.6, "Kingstown", -61.22, 13.16, []],
  ["136", "KY", "CYM", "Cayman Islands", null, false, "north-america", "americas", -81.25, 19.31, 3.6, "George Town", -81.38, 19.29, ["grand cayman"]],
  ["060", "BM", "BMU", "Bermuda", null, false, "north-america", "americas", -64.75, 32.31, 3.6, "Hamilton", -64.78, 32.29, ["reinsurance bermuda"]],
  ["882", "WS", "WSM", "Samoa", null, false, "oceania", "world", -172.1, -13.76, 3.5, "Apia", -171.76, -13.83, ["apia"]],
  ["776", "TO", "TON", "Tonga", null, false, "oceania", "world", -175.2, -21.18, 3.5, "Nuku'alofa", -175.2, -21.14, []],
  ["296", "KI", "KIR", "Kiribati", null, false, "oceania", "world", -157.36, 1.87, 3.2, "Tarawa", 172.98, 1.33, []],
  ["583", "FM", "FSM", "Micronesia", null, false, "oceania", "world", 158.16, 6.92, 3.3, "Palikir", 158.16, 6.92, ["federated states of micronesia"]],
  ["584", "MH", "MHL", "Marshall Islands", null, false, "oceania", "world", 171.18, 7.13, 3.3, "Majuro", 171.38, 7.09, ["majuro"]],
  ["585", "PW", "PLW", "Palau", null, false, "oceania", "east-asia", 134.58, 7.51, 3.5, "Ngerulmud", 134.62, 7.5, []],
  ["520", "NR", "NRU", "Nauru", null, false, "oceania", "world", 166.93, -0.52, 3.6, "Yaren", 166.92, -0.55, []],
  ["798", "TV", "TUV", "Tuvalu", null, false, "oceania", "world", 179.19, -8.52, 3.5, "Funafuti", 179.2, -8.52, []],
];

export const WORLD_COUNTRIES: readonly CountryRecord[] = buildCountries([
  ...COUNTRY_SEEDS_PART_A,
  ...COUNTRY_SEEDS_PART_B,
]);

// ============================================================================
// All 50 US States + Washington D.C. (51 FIPS entries matching us-atlas/states-10m.json)
// ============================================================================

type UsCitySeed = readonly [name: string, lon: number, lat: number, role?: string];
type UsStateSeed = readonly [
  fips: string,
  postal: string,
  name: string,
  lon: number,
  lat: number,
  zoom: number,
  capital: string,
  capLon: number,
  capLat: number,
  aliases: readonly string[],
  cities: readonly UsCitySeed[],
];

function buildUsStates(seeds: readonly UsStateSeed[]): UsStateRecord[] {
  const out: UsStateRecord[] = [];
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    const cities: UsStateCity[] = [];
    for (let j = 0; j < s[10].length; j++) {
      const c = s[10][j];
      cities.push({
        name: c[0],
        coordinates: [c[1], c[2]],
        role: c[3],
      });
    }
    out.push({
      fips: s[0],
      postal: s[1],
      name: s[2],
      centroid: [s[3], s[4]],
      defaultZoom: s[5],
      capital: s[6],
      capitalCoords: [s[7], s[8]],
      aliases: s[9],
      majorCities: cities,
    });
  }
  return out;
}

const US_STATE_SEEDS: readonly UsStateSeed[] = [
  ["01", "AL", "Alabama", -86.83, 32.78, 2.5, "Montgomery", -86.3, 32.38, [], [["Birmingham", -86.8, 33.52, "Steel & Grid"], ["Huntsville", -86.59, 34.73, "Aerospace & Defense"], ["Mobile", -88.04, 30.69, "Gulf Port"]]],
  ["02", "AK", "Alaska", -152.38, 63.92, 2.7, "Juneau", -134.42, 58.3, ["permanent fund"], [["Anchorage", -149.9, 61.22, "Air Cargo Hub"], ["Juneau", -134.42, 58.3, "State Capitol"], ["Prudhoe Bay", -148.34, 70.26, "North Slope Oil"]]],
  ["04", "AZ", "Arizona", -111.66, 34.27, 2.3, "Phoenix", -112.07, 33.45, [], [["Phoenix", -112.07, 33.45, "TSMC Fab 21"], ["Chandler", -111.84, 33.31, "Intel Foundry"], ["Tucson", -110.97, 32.22, "Defense Aerospace"]]],
  ["05", "AR", "Arkansas", -92.44, 34.89, 2.6, "Little Rock", -92.29, 34.75, [], [["Little Rock", -92.29, 34.75, "River Hub"], ["Bentonville", -94.21, 36.37, "Retail Logistics"]]],
  ["06", "CA", "California", -119.47, 37.18, 2.0, "Sacramento", -121.49, 38.58, ["golden state"], [["Los Angeles", -118.24, 34.05, "San Pedro Port"], ["San Francisco", -122.42, 37.77, "Frontier AI"], ["Palo Alto", -122.14, 37.44, "Silicon Valley"], ["San Diego", -117.16, 32.72, "Naval Base"]]],
  ["08", "CO", "Colorado", -105.55, 39.0, 2.3, "Denver", -104.99, 39.74, [], [["Denver", -104.99, 39.74, "Mountain Grid"], ["Colorado Springs", -104.82, 38.83, "Space Command"]]],
  ["09", "CT", "Connecticut", -72.73, 41.62, 3.2, "Hartford", -72.68, 41.76, [], [["Hartford", -72.68, 41.76, "Insurance Capital"], ["Stamford", -73.54, 41.05, "Credit & Hedge Funds"], ["Groton", -72.08, 41.35, "Submarine Yard"]]],
  ["10", "DE", "Delaware", -75.5, 38.99, 3.3, "Dover", -75.52, 39.16, [], [["Wilmington", -75.55, 39.74, "Corporate Charter"], ["Dover", -75.52, 39.16, "PJM East"]]],
  ["11", "DC", "District of Columbia", -77.02, 38.9, 3.6, "Washington", -77.04, 38.9, ["washington dc", "washington d.c.", "washington, d.c.", "capitol hill", "u.s. treasury"], [["Washington, D.C.", -77.04, 38.9, "US Treasury & Fed"]]],
  ["12", "FL", "Florida", -82.45, 28.61, 2.2, "Tallahassee", -84.28, 30.44, ["sunshine state"], [["Miami", -80.19, 25.76, "Wind Risk Zone"], ["Tampa", -82.46, 27.95, "Gulf Port"], ["Jacksonville", -81.66, 30.33, "Atlantic Rail"], ["Orlando", -81.38, 28.54, "Central Corridor"]]],
  ["13", "GA", "Georgia", -83.44, 32.64, 2.4, "Atlanta", -84.39, 33.75, ["state of georgia", "georgia usa"], [["Atlanta", -84.39, 33.75, "Southeast Air/Data"], ["Savannah", -81.09, 32.08, "Container Port"], ["Vogtle", -81.76, 33.14, "Nuclear Units 3 & 4"]]],
  ["15", "HI", "Hawaii", -156.34, 20.25, 3.0, "Honolulu", -157.86, 21.31, [], [["Honolulu", -157.86, 21.31, "INDOPACOM"], ["Pearl Harbor", -157.95, 21.35, "Pacific Fleet"]]],
  ["16", "ID", "Idaho", -114.61, 44.35, 2.3, "Boise", -116.2, 43.62, [], [["Boise", -116.2, 43.62, "DRAM Memory Fab"], ["Idaho Falls", -112.03, 43.49, "INL Nuclear Lab"]]],
  ["17", "IL", "Illinois", -89.2, 40.04, 2.4, "Springfield", -89.65, 39.8, [], [["Chicago", -87.63, 41.88, "CME & ComEd PJM"], ["Joliet", -88.08, 41.53, "Inland Intermodal"]]],
  ["18", "IN", "Indiana", -86.28, 39.89, 2.6, "Indianapolis", -86.16, 39.77, [], [["Indianapolis", -86.16, 39.77, "Midwest Freight"], ["Gary", -87.35, 41.59, "Blast Furnace Steel"], ["New Carlisle", -86.51, 41.71, "Hyperscale Campus"]]],
  ["19", "IA", "Iowa", -93.5, 42.08, 2.5, "Des Moines", -93.61, 41.59, [], [["Des Moines", -93.61, 41.59, "Wind & AI Cluster"], ["Council Bluffs", -95.86, 41.26, "Cloud Campus"]]],
  ["20", "KS", "Kansas", -98.38, 38.49, 2.4, "Topeka", -95.68, 39.05, [], [["Wichita", -97.33, 37.69, "Airframe Mfg"], ["Kansas City", -94.63, 39.11, "Rail Center"]]],
  ["21", "KY", "Kentucky", -85.3, 37.54, 2.6, "Frankfort", -84.87, 38.2, [], [["Louisville", -85.76, 38.25, "UPS Worldport"], ["Lexington", -84.5, 38.04, "Bluegrass Grid"]]],
  ["22", "LA", "Louisiana", -91.96, 31.04, 2.5, "Baton Rouge", -91.19, 30.45, [], [["New Orleans", -90.07, 29.95, "Grain Export"], ["Sabine Pass", -93.87, 29.73, "LNG Export Terminal"]]],
  ["23", "ME", "Maine", -69.24, 45.35, 2.6, "Augusta", -69.78, 44.31, [], [["Portland", -70.26, 43.66, "North Atlantic Port"], ["Bath", -69.82, 43.91, "Destroyer Shipyard"]]],
  ["24", "MD", "Maryland", -76.76, 39.03, 3.0, "Annapolis", -76.49, 38.98, [], [["Baltimore", -76.61, 39.29, "PJM Port & Grid"], ["Calvert Cliffs", -76.44, 38.43, "Nuclear Station"]]],
  ["25", "MA", "Massachusetts", -71.79, 42.25, 3.0, "Boston", -71.06, 42.36, [], [["Boston", -71.06, 42.36, "Biotech & Asset Mgmt"], ["Cambridge", -71.11, 42.37, "MIT Research"]]],
  ["26", "MI", "Michigan", -85.38, 44.32, 2.3, "Lansing", -84.56, 42.73, [], [["Detroit", -83.05, 42.33, "Auto Industrial Core"], ["Dearborn", -83.18, 42.32, "River Rouge"], ["Palisades", -86.32, 42.32, "Nuclear Restart"]]],
  ["27", "MN", "Minnesota", -94.31, 46.28, 2.3, "Saint Paul", -93.09, 44.95, [], [["Minneapolis", -93.27, 44.98, "Agri-Clearing"], ["Duluth", -92.1, 46.79, "Iron Ore Port"]]],
  ["28", "MS", "Mississippi", -89.67, 32.73, 2.5, "Jackson", -90.18, 32.3, [], [["Pascagoula", -88.56, 30.37, "Naval Shipyard"], ["Jackson", -90.18, 32.3, "Entergy Grid"]]],
  ["29", "MO", "Missouri", -92.46, 38.36, 2.4, "Jefferson City", -92.17, 38.58, [], [["St. Louis", -90.2, 38.63, "Barge Confluence"], ["Kansas City", -94.58, 39.1, "Fed District 10"]]],
  ["30", "MT", "Montana", -109.63, 47.05, 2.2, "Helena", -112.04, 46.59, [], [["Butte", -112.53, 46.0, "Historic Copper Pit"], ["Billings", -108.5, 45.78, "Energy Basin"]]],
  ["31", "NE", "Nebraska", -99.79, 41.54, 2.4, "Lincoln", -96.7, 40.81, [], [["Omaha", -95.94, 41.26, "Insurance & Rail"], ["North Platte", -100.77, 41.14, "Bailey Rail Yard"]]],
  ["32", "NV", "Nevada", -116.63, 39.33, 2.3, "Carson City", -119.77, 39.16, [], [["Reno", -119.81, 39.53, "Tahoe-Reno Gigafactory"], ["Las Vegas", -115.14, 36.17, "Southwest Solar"], ["Thacker Pass", -118.04, 41.7, "Lithium Clay"]]],
  ["33", "NH", "New Hampshire", -71.58, 43.68, 2.9, "Concord", -71.54, 43.21, [], [["Manchester", -71.45, 42.99, "Precision Mfg"], ["Portsmouth", -70.76, 43.07, "Naval Yard"]]],
  ["34", "NJ", "New Jersey", -74.66, 40.18, 3.0, "Trenton", -74.76, 40.22, [], [["Newark", -74.17, 40.74, "Port Newark-Elizabeth"], ["Secaucus", -74.06, 40.79, "Equinix NY4 Matching"], ["Salem", -75.54, 39.46, "Nuclear PJM"]]],
  ["35", "NM", "New Mexico", -106.11, 34.41, 2.3, "Santa Fe", -105.94, 35.69, [], [["Albuquerque", -106.65, 35.08, "Sandia & Packaging"], ["Los Alamos", -106.3, 35.88, "National Lab"], ["Hobbs", -103.14, 32.7, "Permian West"]]],
  ["36", "NY", "New York", -75.51, 42.94, 2.4, "Albany", -73.76, 42.65, [], [["New York City", -74.01, 40.71, "Wall Street & Primary Dealers"], ["Albany", -73.76, 42.65, "NanoTech R&D"], ["Clay", -76.18, 43.18, "Megafab Site"]]],
  ["37", "NC", "North Carolina", -79.36, 35.55, 2.4, "Raleigh", -78.64, 35.78, [], [["Charlotte", -80.84, 35.23, "Bank Balance Center"], ["Raleigh", -78.64, 35.78, "Research Triangle"]]],
  ["38", "ND", "North Dakota", -100.47, 47.45, 2.4, "Bismarck", -100.78, 46.81, [], [["Williston", -103.62, 48.15, "Bakken Shale & Flare Gas"], ["Fargo", -96.79, 46.88, "Northern Corridor"]]],
  ["39", "OH", "Ohio", -82.79, 40.29, 2.5, "Columbus", -83.0, 39.96, [], [["Columbus", -83.0, 39.96, "New Albany AI & Fab"], ["Cleveland", -81.69, 41.5, "Great Lakes Steel"], ["Cincinnati", -84.51, 39.1, "Ohio River Freight"]]],
  ["40", "OK", "Oklahoma", -97.49, 35.59, 2.4, "Oklahoma City", -97.52, 35.47, [], [["Cushing", -96.77, 35.99, "WTI Crude Hub"], ["Tulsa", -95.99, 36.15, "Midcontinent Pipe"]]],
  ["41", "OR", "Oregon", -120.56, 43.93, 2.3, "Salem", -123.04, 44.94, [], [["Hillsboro", -122.99, 45.52, "Gordon Moore Litho R&D"], ["The Dalles", -121.18, 45.59, "Columbia Hydro Data"]]],
  ["42", "PA", "Pennsylvania", -77.8, 40.88, 2.5, "Harrisburg", -76.88, 40.27, ["commonwealth of pennsylvania"], [["Philadelphia", -75.17, 39.95, "PJM East"], ["Pittsburgh", -80.0, 40.44, "Grid & Robotics"], ["Three Mile Island", -76.73, 40.15, "835 MW AI PPA"], ["Susquehanna", -76.15, 41.09, "Behind-the-Meter Nuclear"]]],
  ["44", "RI", "Rhode Island", -71.55, 41.68, 3.5, "Providence", -71.41, 41.82, [], [["Providence", -71.41, 41.82, "Offshore Wind Port"], ["Quonset", -71.42, 41.59, "Submarine Hull Modules"]]],
  ["45", "SC", "South Carolina", -80.89, 33.91, 2.6, "Columbia", -81.03, 34.0, [], [["Charleston", -79.93, 32.78, "Deepwater Port"], ["Greer", -82.23, 34.94, "Inland Port & Auto"]]],
  ["46", "SD", "South Dakota", -100.23, 44.44, 2.4, "Pierre", -100.35, 44.37, [], [["Sioux Falls", -96.73, 43.55, "Trust & Card Domicile"]]],
  ["47", "TN", "Tennessee", -86.35, 35.86, 2.5, "Nashville", -86.78, 36.16, [], [["Memphis", -90.05, 35.15, "xAI Colossus & FedEx Hub"], ["Oak Ridge", -84.27, 36.01, "Uranium & Frontier HPC"], ["Nashville", -86.78, 36.16, "TVA Grid"]]],
  ["48", "TX", "Texas", -99.32, 31.46, 1.9, "Austin", -97.74, 30.27, ["lone star state"], [["Austin", -97.74, 30.27, "Housing & Silicon Hills"], ["Houston", -95.37, 29.76, "Energy & Ship Channel"], ["Dallas", -96.8, 32.78, "ERCOT North"], ["Abilene", -99.73, 32.45, "AI Megacampus"]]],
  ["49", "UT", "Utah", -111.67, 39.31, 2.4, "Salt Lake City", -111.89, 40.76, [], [["Salt Lake City", -111.89, 40.76, "Bingham Canyon Copper"], ["Bluffdale", -111.94, 40.48, "Data Center Corridor"]]],
  ["50", "VT", "Vermont", -72.67, 44.07, 3.0, "Montpelier", -72.58, 44.26, [], [["Burlington", -73.21, 44.48, "Specialty Wafer Fab"]]],
  ["51", "VA", "Virginia", -78.82, 37.52, 2.5, "Richmond", -77.44, 37.54, ["commonwealth of virginia"], [["Ashburn", -77.49, 39.04, "Loudoun Data Center Alley"], ["Norfolk", -76.29, 36.85, "Atlantic Carrier Base"], ["Virginia Beach", -75.98, 36.85, "Subsea Cable Landing"]]],
  ["53", "WA", "Washington", -120.46, 47.38, 2.4, "Olympia", -122.9, 47.04, ["washington state"], [["Seattle", -122.33, 47.61, "Hyperscale Cloud HQ"], ["Quincy", -119.85, 47.23, "Mid-Columbia Hydro Data"], ["Tacoma", -122.44, 47.25, "Pacific Port"]]],
  ["54", "WV", "West Virginia", -80.63, 38.64, 2.8, "Charleston", -81.63, 38.35, ["appalachian coal"], [["Logan", -81.99, 37.85, "Island Creek Coal Scrip"], ["Paint Creek", -81.39, 38.09, "1912 Coal Strike"], ["Charleston", -81.63, 38.35, "AEP Corridor"]]],
  ["55", "WI", "Wisconsin", -89.99, 44.63, 2.4, "Madison", -89.4, 43.07, [], [["Milwaukee", -87.91, 43.04, "Switchgear & Transformers"], ["Mount Pleasant", -87.89, 42.72, "Lake Michigan AI Campus"]]],
  ["56", "WY", "Wyoming", -107.55, 43.0, 2.4, "Cheyenne", -104.82, 41.14, [], [["Cheyenne", -104.82, 41.14, "High-Altitude Data"], ["Kemmerer", -110.54, 41.79, "Natrium SMR Site"], ["Gillette", -105.5, 44.29, "Powder River Basin"]]],
];

export const US_STATES: readonly UsStateRecord[] = buildUsStates(US_STATE_SEEDS);

export const US_TERRITORIES: readonly UsTerritoryRecord[] = [
  { fips: "72", postal: "PR", name: "Puerto Rico", isoNumeric: "630", centroid: [-66.46, 18.22], aliases: ["san juan"] },
  { fips: "66", postal: "GU", name: "Guam", isoNumeric: "316", centroid: [144.77, 13.44], aliases: ["andersen afb", "apra harbor"] },
  { fips: "78", postal: "VI", name: "U.S. Virgin Islands", isoNumeric: "850", centroid: [-64.82, 18.01], aliases: ["united states virgin islands", "usvi"] },
  { fips: "60", postal: "AS", name: "American Samoa", isoNumeric: "016", centroid: [-170.41, -14.28], aliases: ["pago pago"] },
  { fips: "69", postal: "MP", name: "Northern Mariana Islands", isoNumeric: "580", centroid: [145.62, 15.67], aliases: ["saipan", "commonwealth of the northern mariana islands"] },
];

// ============================================================================
// Global Economic, Silicon, Port, Cable & Financial Hubs
// ============================================================================

type HubSeed = readonly [
  id: string,
  name: string,
  countryIso: string,
  stateFips: string | null,
  lon: number,
  lat: number,
  kind: MapPinKind,
  scope: MapScope,
  zoom: number,
  sublabel: string,
  aliases: readonly string[],
];

const GLOBAL_HUB_SEEDS: readonly HubSeed[] = [
  ["veldhoven-asml", "Veldhoven (ASML)", "528", null, 5.4, 51.42, "fab", "europe", 3.2, "High-NA EUV Monopoly", ["veldhoven", "eindhoven", "asml"]],
  ["frankfurt-ecb", "Frankfurt", "276", null, 8.68, 50.11, "financial-center", "europe", 3.0, "ECB & DE-CIX Backbone", ["frankfurt", "european central bank"]],
  ["zurich-bis", "Zurich & Basel", "756", null, 8.54, 47.38, "financial-center", "europe", 3.1, "BIS & Swiss Clearing", ["zurich", "basel", "geneva"]],
  ["dublin-docklands", "Dublin", "372", null, -6.26, 53.35, "datacenter", "europe", 3.0, "EU IP Conduit & Grid Cap", ["dublin", "irish ip"]],
  ["london-city", "London", "826", null, -0.09, 51.51, "financial-center", "europe", 2.9, "Gilts & Lloyd's Maritime", ["city of london", "canary wharf"]],
  ["paris-aft", "Paris", "250", null, 2.35, 48.86, "financial-center", "europe", 2.8, "OAT Sovereign Issuance", ["paris"]],
  ["athens-pdma", "Athens & Piraeus", "300", null, 23.73, 37.98, "port", "europe", 2.9, "GGB Debt & Piraeus Port", ["athens", "piraeus"]],
  ["milan-bursa", "Milan", "380", null, 9.19, 45.46, "financial-center", "europe", 2.9, "BTP Industrial North", ["milan", "torino"]],
  ["madrid-grid", "Madrid", "724", null, -3.7, 40.42, "city", "europe", 2.8, "Iberian Solar & Data", ["madrid", "barcelona"]],
  ["warsaw-hub", "Warsaw", "616", null, 21.01, 52.23, "city", "europe", 2.8, "Eastern Flank Logistics", ["warsaw", "gdansk"]],
  ["kyiv-grid", "Kyiv", "804", null, 30.52, 50.45, "substation", "europe", 2.6, "750kV Substation Defense", ["kyiv", "odesa", "odessa"]],
  ["istanbul-bosphorus", "Istanbul & Bosphorus", "792", null, 28.98, 41.01, "chokepoint", "middle-east", 2.8, "Turkish Straits Grain/Oil", ["istanbul", "bosphorus", "dardanelles"]],
  ["tel-aviv-silicon", "Tel Aviv & Haifa", "376", null, 34.78, 32.09, "fab", "middle-east", 3.2, "R&D & East Med Port", ["tel aviv", "haifa"]],
  ["dubai-jebel-ali", "Dubai & Jebel Ali", "784", null, 55.27, 25.2, "port", "middle-east", 3.1, "Gulf Entrepot & Bullion", ["dubai", "jebel ali"]],
  ["riyadh-pif", "Riyadh", "682", null, 46.72, 24.69, "capital", "middle-east", 2.6, "Sovereign Capital & Crude", ["riyadh", "dhahran", "ras tanura"]],
  ["mumbai-nse", "Mumbai", "356", null, 72.88, 19.08, "financial-center", "world", 2.6, "JNPT Port & Subsea Landing", ["mumbai", "bengaluru", "bangalore", "chennai"]],
  ["shanghai-yangshan", "Shanghai & Yangshan", "156", null, 121.47, 31.23, "port", "east-asia", 2.7, "World #1 Container Throughput", ["shanghai", "ningbo", "yangshan"]],
  ["beijing-pboc", "Beijing", "156", null, 116.41, 39.9, "capital", "east-asia", 2.5, "PBOC & State Grid HQ", ["beijing"]],
  ["seoul-icheon", "Seoul & Pyeongtaek", "410", null, 126.98, 37.57, "fab", "east-asia", 3.0, "HBM3E/HBM4 Memory Monopoly", ["seoul", "pyeongtaek", "icheon", "busan"]],
  ["tokyo-boj", "Tokyo", "392", null, 139.77, 35.68, "financial-center", "east-asia", 2.8, "BOJ & JGB Yield Curve", ["tokyo", "yokohama", "osaka", "kumamoto"]],
  ["hsinchu-tsmc", "Hsinchu Science Park", "158", null, 121.0, 24.78, "fab", "east-asia", 3.5, "TSMC 2nm GAA Fab 20", ["hsinchu", "tainan", "kaohsiung"]],
  ["sydney-port", "Sydney", "036", null, 151.21, -33.87, "financial-center", "world", 2.5, "ASX & Pilbara Iron", ["sydney", "melbourne", "pilbara", "perth"]],
  ["toronto-bay", "Toronto", "124", null, -79.38, 43.65, "financial-center", "americas", 2.5, "Bay Street & Ontario Nuclear", ["toronto", "montreal", "vancouver", "calgary"]],
  ["monterrey-nearshore", "Monterrey", "484", null, -100.32, 25.69, "city", "americas", 2.7, "USMCA Nearshoring Mfg", ["monterrey", "ciudad juarez", "laredo"]],
  ["sao-paulo-santos", "Sao Paulo & Santos", "076", null, -46.63, -23.55, "port", "americas", 2.4, "B3 Clearing & Santos Soy/Iron", ["sao paulo", "são paulo", "rio de janeiro"]],
  ["johannesburg-rand", "Johannesburg", "710", null, 28.05, -26.2, "mine", "world", 2.6, "PGM & Deep-Level Gold", ["johannesburg", "durban"]],
  ["lagos-lekki", "Lagos", "566", null, 3.38, 6.52, "cable-landing", "world", 2.7, "2Africa & Equiano Landing", ["lagos"]],
];

export const GLOBAL_HUBS: readonly GlobalCityHub[] = GLOBAL_HUB_SEEDS.map((h) => ({
  id: h[0],
  name: h[1],
  countryIsoNumeric: h[2],
  stateFips: h[3] ?? undefined,
  coordinates: [h[4], h[5]],
  kind: h[6],
  scope: h[7],
  defaultZoom: h[8],
  sublabel: h[9],
  aliases: h[10],
}));

// ============================================================================
// 24 Named Geopolitical & Infrastructure Corridors (Episode 01 + Season 1 + Chokepoints)
// ============================================================================

export const PJM_THIRTEEN_STATE_FIPS = [
  "17", // IL
  "18", // IN
  "26", // MI
  "39", // OH
  "21", // KY
  "54", // WV
  "51", // VA
  "42", // PA
  "24", // MD
  "10", // DE
  "34", // NJ
  "37", // NC
  "47", // TN
  "11", // DC
] as const;

const CORRIDORS_PART_A: readonly GeopoliticalCorridor[] = [
  {
    id: "PJM_GRID",
    title: "PJM 13-State Capacity Grid & Three Mile Island",
    eyebrow: "Regional Transmission Corridor • 65M Ratepayers",
    subtitle: "Capacity auction cleared +833% ($269.92/MW-day) as Loudoun & nuclear PPAs lock baseload",
    episodeTag: "EP01 / EP06",
    scope: "usa",
    center: [-80.4, 39.2],
    bbox: [[-91.5, 34.8], [-73.8, 44.8]],
    targetZoom: 1.72,
    routeTone: "alert",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: PJM_THIRTEEN_STATE_FIPS,
    alertStateFips: ["51", "42", "24"],
    pins: [
      { id: "tmi-unit1", label: "Three Mile Island", sublabel: "Crane Clean Energy Center", metric: "835 MW AI PPA", coordinates: [-76.725, 40.153], kind: "nuclear", tone: "alert", pulse: true },
      { id: "ashburn-alley", label: "Loudoun Data Alley", sublabel: "Ashburn, Virginia", metric: "4.5+ GW Load", coordinates: [-77.487, 39.044], kind: "datacenter", tone: "alert", pulse: true },
      { id: "pjm-valley-forge", label: "PJM Dispatch HQ", sublabel: "Valley Forge, PA", metric: "$269.92/MW-day", coordinates: [-75.456, 40.101], kind: "substation", tone: "primary" },
      { id: "comed-chicago", label: "ComEd West Hub", sublabel: "Chicago Basin", metric: "500kV Tie", coordinates: [-87.629, 41.878], kind: "substation", tone: "secondary" },
      { id: "aep-columbus", label: "AEP Central Hub", sublabel: "New Albany, Ohio", metric: "765kV Backbone", coordinates: [-82.999, 39.961], kind: "substation", tone: "secondary" },
    ],
    arcs: [
      { id: "pjm-west-central", from: [-87.629, 41.878], to: [-82.999, 39.961], kind: "power-grid", tone: "secondary", dashed: true, label: "765kV West-East Transfer" },
      { id: "pjm-central-tmi", from: [-82.999, 39.961], to: [-76.725, 40.153], kind: "power-grid", tone: "alert", dashed: true },
      { id: "pjm-tmi-ashburn", from: [-76.725, 40.153], to: [-77.487, 39.044], kind: "power-grid", tone: "alert", dashed: false, label: "Baseload Lockup" },
      { id: "pjm-ashburn-vf", from: [-77.487, 39.044], to: [-75.456, 40.101], kind: "power-grid", tone: "primary", dashed: true },
    ],
    warnings: [
      { id: "pjm-spike", label: "+833% Capacity Clearing", detail: "DOM & BGE zones hit price cap", coordinates: [-77.1, 39.4], kind: "grid-stress", radiusDeg: 1.6 },
    ],
    keywords: ["pjm", "pjm interconnection", "three mile island", "tmi", "269.92", "833%", "13 states", "loudoun", "ashburn", "data center alley"],
    sourceNote: "PJM Base Residual Auction 2025/2026 Report",
  },
  {
    id: "WEST_LONDON_M4",
    title: "West London & M4 Hyperscale Grid Bottleneck",
    eyebrow: "UK National Grid • Thames Valley Corridor",
    subtitle: "Slough & Hillingdon substation saturation delays new housing connections into the 2030s",
    episodeTag: "EP01 / EP06",
    scope: "europe",
    center: [-0.85, 51.5],
    bbox: [[-6.5, 49.6], [3.8, 54.6]],
    targetZoom: 3.1,
    routeTone: "alert",
    primaryCountryIds: ["826"],
    secondaryCountryIds: ["372", "528", "250"],
    primaryStateFips: [],
    pins: [
      { id: "slough-m4", label: "Slough Trading Estate", sublabel: "Europe #1 Data Hub", metric: "1.1+ GW Demand", coordinates: [-0.635, 51.522], kind: "datacenter", tone: "alert", pulse: true },
      { id: "west-london-sub", label: "West London 275kV", sublabel: "Hillingdon / Hounslow", metric: "2035 Housing Queue", coordinates: [-0.38, 51.5], kind: "substation", tone: "alert" },
      { id: "city-of-london", label: "City of London", sublabel: "Financial Docklands", coordinates: [-0.09, 51.515], kind: "financial-center", tone: "primary" },
      { id: "bristol-m4", label: "Bristol M4 West", sublabel: "Severn Grid Node", coordinates: [-2.587, 51.454], kind: "city", tone: "secondary" },
    ],
    arcs: [
      { id: "m4-spine", from: [-2.587, 51.454], to: [-0.635, 51.522], kind: "power-grid", tone: "secondary", dashed: true, label: "M4 Fiber & 400kV Spine" },
      { id: "slough-london", from: [-0.635, 51.522], to: [-0.09, 51.515], kind: "submarine-cable", tone: "alert", dashed: false },
    ],
    warnings: [
      { id: "wl-moratorium", label: "Substation Queue Freeze", detail: "GLA West London capacity alert", coordinates: [-0.48, 51.51], kind: "grid-stress", radiusDeg: 0.55 },
    ],
    keywords: ["west london", "m4 corridor", "slough", "hillingdon", "hounslow", "thames valley", "uk housing queue"],
    sourceNote: "Greater London Authority & NESO Grid Queue Filing",
  },
  {
    id: "AUSTIN_TEXAS",
    title: "Austin Metro & ERCOT Peak Load Basin",
    eyebrow: "Texas Grid & Household Escrow Squeeze",
    subtitle: "Fixed mortgage meets variable property tax, wind/hail insurance & August ERCOT air-conditioning",
    episodeTag: "EP01 / EP05",
    scope: "usa",
    center: [-97.9, 30.8],
    bbox: [[-106.7, 25.8], [-93.4, 36.5]],
    targetZoom: 2.15,
    routeTone: "secondary",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["48"],
    secondaryStateFips: ["40", "22", "35"],
    pins: [
      { id: "austin-claire", label: "Austin, Texas", sublabel: "Travis County Household", metric: "$3,400/mo PITI", coordinates: [-97.743, 30.267], kind: "city", tone: "primary", pulse: true },
      { id: "taylor-fab", label: "Taylor Silicon Cluster", sublabel: "Williamson County", metric: "4nm Foundry", coordinates: [-97.409, 30.571], kind: "fab", tone: "secondary" },
      { id: "ercot-houston", label: "Houston Ship Channel", sublabel: "ERCOT Coastal Load", metric: "85+ GW Summer Peak", coordinates: [-95.369, 29.76], kind: "port", tone: "secondary" },
      { id: "abilene-ai", label: "Abilene West Campus", sublabel: "Lancium / AI Compute", metric: "1.2 GW Behind-Meter", coordinates: [-99.733, 32.449], kind: "datacenter", tone: "alert" },
    ],
    arcs: [
      { id: "ercot-west-austin", from: [-99.733, 32.449], to: [-97.743, 30.267], kind: "power-grid", tone: "secondary", dashed: true, label: "ERCOT 345kV West-South" },
      { id: "ercot-austin-houston", from: [-97.743, 30.267], to: [-95.369, 29.76], kind: "power-grid", tone: "primary", dashed: true },
    ],
    warnings: [],
    keywords: ["austin", "austin texas", "travis county", "ercot", "claire", "silicon hills", "taylor texas"],
    sourceNote: "ERCOT Seasonal Assessment & Travis Central Appraisal District",
  },
  {
    id: "LOGAN_COUNTY_WV",
    title: "Logan County & Paint Creek Coal Scrip Basin (1912)",
    eyebrow: "Historical Company-Town Ledger • West Virginia",
    subtitle: "Island Creek brass tokens & non-transferable company-store credit locked miners inside closed loops",
    episodeTag: "EP01",
    scope: "usa",
    center: [-81.1, 38.4],
    bbox: [[-84.5, 36.5], [-77.5, 40.6]],
    targetZoom: 2.75,
    routeTone: "alert",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["54"],
    secondaryStateFips: ["21", "51", "39"],
    pins: [
      { id: "paint-creek", label: "Paint Creek & Cabin Creek", sublabel: "Kanawha Coalfield", metric: "1912 Strike Zone", coordinates: [-81.39, 38.09], kind: "historical", tone: "alert", pulse: true },
      { id: "logan-scrip", label: "Logan County", sublabel: "Island Creek Coal Co.", metric: "Closed-Loop Scrip", coordinates: [-81.993, 37.848], kind: "mine", tone: "primary" },
      { id: "charleston-wv", label: "Charleston", sublabel: "Kanawha River Rail", coordinates: [-81.633, 38.35], kind: "capital", tone: "secondary" },
    ],
    arcs: [
      { id: "coal-rail", from: [-81.993, 37.848], to: [-81.39, 38.09], kind: "supply-chain", tone: "alert", dashed: true, label: "C&O Coal Spur" },
    ],
    warnings: [],
    keywords: ["logan county", "paint creek", "cabin creek", "island creek", "coal scrip", "company scrip", "1912", "blair mountain"],
    sourceNote: "U.S. Senate Paint Creek Coalfields Hearings (1913) & FLSA 1938",
  },
  {
    id: "ALASKA_JUNEAU",
    title: "Juneau Capitol & Alaska Permanent Fund Dividend",
    eyebrow: "Sovereign Resource Dividend Stress Test",
    subtitle: "2016 oil fiscal deficit triggered unilateral executive line-item veto cutting statutory PFD payouts in half",
    episodeTag: "EP01",
    scope: "usa",
    center: [-149.0, 62.5],
    bbox: [[-168.0, 54.0], [-130.0, 71.4]],
    targetZoom: 2.55,
    routeTone: "alert",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["02"],
    pins: [
      { id: "juneau-veto", label: "Juneau State Capitol", sublabel: "Executive Budget Veto", metric: "-50% PFD Cut (2016)", coordinates: [-134.42, 58.302], kind: "capital", tone: "alert", pulse: true },
      { id: "prudhoe-slope", label: "Prudhoe Bay", sublabel: "North Slope Royalty Feed", metric: "TAPS Crude", coordinates: [-148.337, 70.255], kind: "mine", tone: "primary" },
      { id: "anchorage-hub", label: "Anchorage", sublabel: "60% Population Core", coordinates: [-149.9, 61.218], kind: "city", tone: "secondary" },
    ],
    arcs: [
      { id: "taps-pipe", from: [-148.337, 70.255], to: [-149.9, 61.218], kind: "supply-chain", tone: "primary", dashed: true, label: "Trans-Alaska Royalty Pipe" },
      { id: "pfd-juneau", from: [-149.9, 61.218], to: [-134.42, 58.302], kind: "capital-flow", tone: "alert", dashed: true },
    ],
    warnings: [],
    keywords: ["juneau", "alaska permanent fund", "pfd", "governor walker", "wielechowski", "prudhoe bay"],
    sourceNote: "Wielechowski v. State of Alaska, 403 P.3d 1141 (2017)",
  },
  {
    id: "SILICON_VALLEY_PALO_ALTO",
    title: "Silicon Valley Frontier Compute & Venture Corridor",
    eyebrow: "Bay Area • $740B Hyperscale CapEx Allocation",
    subtitle: "Model labs & venture allocators convert equity capital into cloud tokens and out-of-state GPU clusters",
    episodeTag: "EP01 / EP03",
    scope: "usa",
    center: [-121.9, 37.45],
    bbox: [[-124.5, 33.5], [-116.5, 40.8]],
    targetZoom: 2.55,
    routeTone: "primary",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["06"],
    secondaryStateFips: ["32", "41"],
    pins: [
      { id: "palo-alto", label: "Palo Alto & Sand Hill", sublabel: "Venture & Compute Credits", metric: "Cloud Token Loop", coordinates: [-122.143, 37.442], kind: "datacenter", tone: "primary", pulse: true },
      { id: "santa-clara", label: "Santa Clara", sublabel: "GPU Architecture HQ", metric: "B200 / R100 Design", coordinates: [-121.955, 37.354], kind: "fab", tone: "secondary" },
      { id: "sf-frontier", label: "San Francisco", sublabel: "Frontier Model Labs", coordinates: [-122.419, 37.775], kind: "financial-center", tone: "primary" },
    ],
    arcs: [
      { id: "sv-reno", from: [-121.955, 37.354], to: [-119.814, 39.53], kind: "power-grid", tone: "secondary", dashed: true, label: "Out-of-State GW Offload" },
    ],
    warnings: [],
    keywords: ["silicon valley", "palo alto", "sand hill", "santa clara", "cupertino", "mountain view", "bay area"],
    sourceNote: "SEC Form 10-K Hyperscale CapEx Disclosures",
  },
  {
    id: "MEMPHIS_FREIGHT_HUB",
    title: "Memphis Intermodal & Gigawatt Compute Hub",
    eyebrow: "Mid-South Rail, Air Cargo & TVA Power Node",
    subtitle: "5 Class-I railroads, global air-express superhub & rapid turbine-backed 100k+ GPU cluster",
    episodeTag: "EP01 / EP06",
    scope: "usa",
    center: [-89.5, 35.4],
    bbox: [[-96.8, 30.8], [-80.8, 41.9]],
    targetZoom: 2.25,
    routeTone: "secondary",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["47"],
    secondaryStateFips: ["05", "28", "17", "13"],
    pins: [
      { id: "memphis-hub", label: "Memphis Superhub", sublabel: "Air Cargo + Colossus Compute", metric: "TVA + Gas Turbines", coordinates: [-90.049, 35.149], kind: "datacenter", tone: "primary", pulse: true },
      { id: "chicago-rail", label: "Chicago CN/BNSF", sublabel: "Northern Rail Gate", coordinates: [-87.629, 41.878], kind: "port", tone: "secondary" },
      { id: "savannah-port", label: "Port of Savannah", sublabel: "Atlantic Container Feed", coordinates: [-81.091, 32.081], kind: "port", tone: "secondary" },
    ],
    arcs: [
      { id: "mem-chi", from: [-90.049, 35.149], to: [-87.629, 41.878], kind: "supply-chain", tone: "secondary", dashed: true, label: "Midcontinent Rail Spine" },
      { id: "mem-sav", from: [-90.049, 35.149], to: [-81.091, 32.081], kind: "supply-chain", tone: "primary", dashed: true },
    ],
    warnings: [],
    keywords: ["memphis", "colossus", "fedex superhub", "tva grid", "mid-south freight"],
    sourceNote: "TVA Integrated Resource Plan & Surface Transportation Board",
  },
  {
    id: "DETROIT_AUTO",
    title: "Detroit River Rouge & Great Lakes Auto Belt",
    eyebrow: "Industrial Bargaining Benchmark • Michigan–Ohio",
    subtitle: "From the 1955 Treaty of Detroit wage-productivity pact to lights-out robotic body-in-white lines",
    episodeTag: "EP01",
    scope: "usa",
    center: [-83.6, 42.4],
    bbox: [[-88.5, 39.2], [-79.5, 45.8]],
    targetZoom: 2.5,
    routeTone: "primary",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["26"],
    secondaryStateFips: ["39", "18"],
    pins: [
      { id: "detroit-rouge", label: "Detroit & Dearborn", sublabel: "River Rouge Complex", metric: "1955 UAW Benchmark", coordinates: [-83.046, 42.331], kind: "historical", tone: "primary", pulse: true },
      { id: "toledo-stamp", label: "Toledo Powertrain", sublabel: "I-75 Supplier Corridor", coordinates: [-83.538, 41.653], kind: "city", tone: "secondary" },
      { id: "cleveland-steel", label: "Cleveland Hot-Strip", sublabel: "Lake Erie Flat-Rolled Steel", coordinates: [-81.694, 41.499], kind: "port", tone: "secondary" },
    ],
    arcs: [
      { id: "det-cle", from: [-81.694, 41.499], to: [-83.046, 42.331], kind: "supply-chain", tone: "primary", dashed: true, label: "Great Lakes Auto Supply" },
    ],
    warnings: [],
    keywords: ["detroit", "river rouge", "dearborn", "treaty of detroit", "uaw", "motor city"],
    sourceNote: "BLS Manufacturing Payrolls & 1955 GM-UAW Contract Archive",
  },
  {
    id: "ROTTERDAM_PORT",
    title: "Port of Rotterdam Maasvlakte II Automated Terminal",
    eyebrow: "North Sea–Rhine Gateway • Europe's Largest Port",
    subtitle: "Autonomous STS gantry cranes & AGVs decouple container throughput from dockworker headcount",
    episodeTag: "EP01",
    scope: "europe",
    center: [4.5, 51.8],
    bbox: [[-2.5, 49.0], [11.5, 55.2]],
    targetZoom: 2.85,
    routeTone: "secondary",
    primaryCountryIds: ["528"],
    secondaryCountryIds: ["276", "056", "826"],
    primaryStateFips: [],
    pins: [
      { id: "maasvlakte-2", label: "Rotterdam Maasvlakte II", sublabel: "Automated Deepsea Quays", metric: "13.5M+ TEU/yr", coordinates: [4.025, 51.958], kind: "port", tone: "primary", pulse: true },
      { id: "antwerp-bruges", label: "Antwerp-Bruges", sublabel: "Petrochemical & Box Hub", coordinates: [4.402, 51.219], kind: "port", tone: "secondary" },
      { id: "duisburg-inland", label: "Duisburg Ruhrort", sublabel: "Rhine Inland Rail/Barge", coordinates: [6.762, 51.434], kind: "port", tone: "secondary" },
      { id: "veldhoven-litho", label: "Veldhoven (ASML)", sublabel: "Brabant Cleanroom Cluster", coordinates: [5.404, 51.417], kind: "fab", tone: "capital" },
    ],
    arcs: [
      { id: "rhine-barge", from: [4.025, 51.958], to: [6.762, 51.434], kind: "shipping", tone: "primary", dashed: true, label: "Rhine Industrial Artery" },
    ],
    warnings: [],
    keywords: ["rotterdam", "maasvlakte", "dutch port", "europort", "rhine barge"],
    sourceNote: "Port of Rotterdam Authority Throughput Statistics",
  },
  {
    id: "SHENZHEN_DELTA",
    title: "Shenzhen & Pearl River Delta Programmable Yuan Pilot",
    eyebrow: "Greater Bay Area • Manufacturing & e-CNY Sandbox",
    subtitle: "Time-expiring digital consumption vouchers paired with world-scale electronics & port automation",
    episodeTag: "EP01 / EP06",
    scope: "east-asia",
    center: [113.9, 22.7],
    bbox: [[105.0, 17.5], [123.0, 29.5]],
    targetZoom: 2.75,
    routeTone: "alert",
    primaryCountryIds: ["156"],
    secondaryCountryIds: ["344", "446", "158", "704"],
    primaryStateFips: [],
    pins: [
      { id: "shenzhen-luohu", label: "Shenzhen", sublabel: "Luohu e-CNY Voucher Pilot", metric: "Expiring Smart-Wallet", coordinates: [114.058, 22.543], kind: "financial-center", tone: "alert", pulse: true },
      { id: "yantian-port", label: "Yantian & Shekou Ports", sublabel: "Export Megaterminal", coordinates: [114.276, 22.575], kind: "port", tone: "primary" },
      { id: "hong-kong-fx", label: "Hong Kong", sublabel: "Offshore USD/CNH Clearing", metric: "mBridge Node", coordinates: [114.169, 22.319], kind: "financial-center", tone: "secondary" },
      { id: "guangzhou-mfg", label: "Guangzhou & Dongguan", sublabel: "Factory Robotics Belt", coordinates: [113.264, 23.129], kind: "city", tone: "secondary" },
    ],
    arcs: [
      { id: "prd-export", from: [113.264, 23.129], to: [114.276, 22.575], kind: "supply-chain", tone: "primary", dashed: true },
      { id: "sz-hk-bridge", from: [114.058, 22.543], to: [114.169, 22.319], kind: "capital-flow", tone: "alert", dashed: false },
    ],
    warnings: [],
    keywords: ["shenzhen", "pearl river delta", "digital yuan", "e-cny", "expiring yuan", "guangdong", "dongguan", "luohu"],
    sourceNote: "PBOC Digital Currency Institute & Shenzhen Municipal Finance Bureau",
  },
  {
    id: "TAIWAN_STRAIT_2NM",
    title: "Taiwan Strait 2nm Silicon Shield & Trans-Pacific Gap",
    eyebrow: "180km Chokepoint • 92% Leading-Edge Logic Concentration",
    subtitle: "Hsinchu N2/A16 & Tainan CoWoS packaging vs lagging US Phoenix Fab 21 capacity and maritime war-risk",
    episodeTag: "EP07",
    scope: "east-asia",
    center: [120.8, 24.2],
    bbox: [[113.0, 18.0], [131.5, 31.5]],
    targetZoom: 2.85,
    defaultRegister: "midnight-telemetry",
    routeTone: "alert",
    primaryCountryIds: ["158"],
    secondaryCountryIds: ["392", "608", "410"],
    alertCountryIds: ["156"],
    primaryStateFips: [],
    pins: [
      { id: "hsinchu-n2", label: "Hsinchu Fab 20", sublabel: "TSMC Global R&D & 2nm GAA", metric: "N2 / A16 Node", coordinates: [120.999, 24.78], kind: "fab", tone: "primary", pulse: true },
      { id: "tainan-fab18", label: "Tainan Science Park", sublabel: "Fab 18 • 3nm & CoWoS", metric: "EUV Fleet Core", coordinates: [120.273, 23.112], kind: "fab", tone: "secondary" },
      { id: "kaohsiung-port", label: "Kaohsiung & Fab 22", sublabel: "LNG Import & 2nm Expansion", coordinates: [120.301, 22.627], kind: "port", tone: "secondary" },
      { id: "taipei-hq", label: "Taipei", sublabel: "Luzon/Miyako Subsea Landings", coordinates: [121.565, 25.033], kind: "capital", tone: "primary" },
    ],
    arcs: [
      { id: "silicon-spine", from: [120.273, 23.112], to: [120.999, 24.78], kind: "supply-chain", tone: "primary", dashed: false, label: "West Coast EUV Spine" },
      { id: "transpacific-phoenix", from: [120.999, 24.78], to: [139.77, 35.68], kind: "supply-chain", tone: "secondary", dashed: true, label: "To Kumamoto & Phoenix AZ" },
    ],
    warnings: [
      { id: "strait-war-risk", label: "180km Strait Insurance Zone", detail: "Lloyd's Joint War Committee exclusion trigger", coordinates: [119.55, 24.35], kind: "blockade", radiusDeg: 1.3 },
    ],
    keywords: ["taiwan strait", "tsmc", "hsinchu", "tainan", "2nm", "silicon shield", "cowos", "euv kill switch"],
    sourceNote: "SEMI World Fab Forecast & CSIS Maritime Blockade Modeling",
  },
  {
    id: "RED_SEA_CHOKEPOINT",
    title: "Bab el-Mandeb Subsea Cable & Naval Cost-Exchange",
    eyebrow: "Red Sea Funnel • 16 Subsea Cables + 12% Seaborne Trade",
    subtitle: "29km strait compresses Europe–Asia fiber bundles alongside $20k drone vs $4M interceptor naval math",
    episodeTag: "EP08 / EP09",
    scope: "middle-east",
    center: [42.2, 16.8],
    bbox: [[31.0, 9.5], [54.5, 31.8]],
    targetZoom: 2.35,
    defaultRegister: "midnight-telemetry",
    routeTone: "alert",
    primaryCountryIds: ["818", "682", "262"],
    secondaryCountryIds: ["232", "512", "706"],
    alertCountryIds: ["887"],
    primaryStateFips: [],
    pins: [
      { id: "bab-el-mandeb", label: "Bab el-Mandeb", sublabel: "29km Maritime & Fiber Funnel", metric: "16 Subsea Cables", coordinates: [43.33, 12.58], kind: "chokepoint", tone: "alert", pulse: true },
      { id: "jeddah-landing", label: "Jeddah CLS", sublabel: "Red Sea Fiber Landing", metric: "AAE-1 / 2Africa", coordinates: [39.192, 21.486], kind: "cable-landing", tone: "primary" },
      { id: "djibouti-hub", label: "Djibouti", sublabel: "12-Cable East Africa Junction", coordinates: [43.146, 11.589], kind: "port", tone: "secondary" },
      { id: "suez-south", label: "Suez Gulf", sublabel: "Northern Red Sea Gate", coordinates: [32.55, 29.967], kind: "chokepoint", tone: "secondary" },
    ],
    arcs: [
      { id: "red-sea-cable", from: [32.55, 29.967], to: [39.192, 21.486], kind: "submarine-cable", tone: "primary", dashed: false },
      { id: "jeddah-mandeb-cut", from: [39.192, 21.486], to: [45.03, 12.78], kind: "submarine-cable", tone: "alert", dashed: true, severedAt: 0.68, label: "AAE-1 / Seacom Shallow Trench" },
    ],
    warnings: [
      { id: "rubymar-cut", label: "Anchor-Drag Cable Severance", detail: "3-cable Red Sea cut & Cape reroute", coordinates: [42.65, 14.2], kind: "cable-cut", radiusDeg: 1.2 },
    ],
    keywords: ["red sea", "bab el-mandeb", "bab el mandeb", "jeddah cable", "houthi", "sm-6", "rubymar", "aden"],
    sourceNote: "TeleGeography Submarine Cable Map & USNI Fleet Tracker",
  },
];

const CORRIDORS_PART_B: readonly GeopoliticalCorridor[] = [
  {
    id: "BALTIC_CABLES",
    title: "Baltic Sea Shallow-Shelf Fiber & Power Cable Corridor",
    eyebrow: "55m Average Seabed Depth • Hybrid Sabotage Zone",
    subtitle: "Finland–Estonia–Germany–Sweden subsea HVDC and telecom links exposed to shadow-fleet anchor dragging",
    episodeTag: "EP09",
    scope: "europe",
    center: [20.5, 57.8],
    bbox: [[9.0, 53.0], [31.5, 65.5]],
    targetZoom: 2.35,
    defaultRegister: "drafting-blueprint",
    routeTone: "alert",
    primaryCountryIds: ["246", "233", "276", "752"],
    secondaryCountryIds: ["440", "428", "208", "616"],
    alertCountryIds: ["643"],
    primaryStateFips: [],
    pins: [
      { id: "helsinki-porkkala", label: "Helsinki / Porkkala", sublabel: "C-Lion1 & Estlink 2 North", metric: "650 MW HVDC", coordinates: [24.938, 60.17], kind: "cable-landing", tone: "primary", pulse: true },
      { id: "tallinn-estlink", label: "Tallinn / Püssi", sublabel: "Estonia Grid Tie", coordinates: [24.754, 59.437], kind: "cable-landing", tone: "primary" },
      { id: "rostock-clion", label: "Rostock CLS", sublabel: "1,173km C-Lion1 South", coordinates: [12.099, 54.092], kind: "cable-landing", tone: "secondary" },
      { id: "gotland-bcs", label: "Gotland Junction", sublabel: "BCS East-West Link", coordinates: [18.295, 57.635], kind: "cable-landing", tone: "secondary" },
    ],
    arcs: [
      { id: "estlink-2", from: [24.938, 60.17], to: [24.754, 59.437], kind: "power-grid", tone: "alert", dashed: false, severedAt: 0.5, label: "Estlink 2" },
      { id: "c-lion1", from: [24.938, 60.17], to: [12.099, 54.092], kind: "submarine-cable", tone: "alert", dashed: true, severedAt: 0.45, label: "C-Lion1 Fiber" },
      { id: "bcs-lithuania", from: [18.295, 57.635], to: [21.13, 55.71], kind: "submarine-cable", tone: "secondary", dashed: true },
    ],
    warnings: [
      { id: "baltic-anchor", label: "Anchor-Drag Trench Cut", detail: "100km seabed scar across HVDC & fiber", coordinates: [20.4, 57.1], kind: "cable-cut", radiusDeg: 1.1 },
    ],
    keywords: ["baltic cables", "baltic sea", "estlink", "c-lion1", "eagle s", "finland estonia cable", "gotland"],
    sourceNote: "Fingrid & NATO Critical Undersea Infrastructure Cell",
  },
  {
    id: "TRANSATLANTIC_CABLES",
    title: "North Atlantic Big-Tech Subsea Trunk & $10T/Day SWIFT Artery",
    eyebrow: "Virginia Beach / NY to Cornwall / Vendée • 90% Hyperscaler Capacity",
    subtitle: "Dunant, Grace Hopper, MAREA & Amitié carry transatlantic interbank clearing and AI training replication",
    episodeTag: "EP09",
    scope: "bbox",
    center: [-38.0, 44.5],
    bbox: [[-82.0, 31.0], [10.0, 58.5]],
    targetZoom: 1.55,
    defaultRegister: "drafting-blueprint",
    routeTone: "primary",
    primaryCountryIds: ["840", "826", "250", "372"],
    secondaryCountryIds: ["724", "620"],
    primaryStateFips: ["51", "36", "34"],
    pins: [
      { id: "va-beach-cls", label: "Virginia Beach", sublabel: "MAREA & Dunant US Landing", metric: "450+ Tbps", coordinates: [-75.978, 36.853], kind: "cable-landing", tone: "primary", pulse: true },
      { id: "ny-bellport", label: "Long Island, NY", sublabel: "Grace Hopper & AEC-1", metric: "$10T/day SWIFT", coordinates: [-72.886, 40.76], kind: "cable-landing", tone: "capital" },
      { id: "bude-uk", label: "Bude, Cornwall", sublabel: "UK Transatlantic Trench", coordinates: [-4.544, 50.826], kind: "cable-landing", tone: "primary" },
      { id: "vendee-fr", label: "Saint-Hilaire, France", sublabel: "Dunant EU Terminus", coordinates: [-1.946, 46.721], kind: "cable-landing", tone: "secondary" },
      { id: "cork-ie", label: "Cork, Ireland", sublabel: "Celtic Shelf Landing", coordinates: [-8.476, 51.899], kind: "cable-landing", tone: "secondary" },
    ],
    arcs: [
      { id: "dunant-arc", from: [-75.978, 36.853], to: [-1.946, 46.721], kind: "submarine-cable", tone: "primary", dashed: false, label: "Dunant (250 Tbps)" },
      { id: "grace-hopper-arc", from: [-72.886, 40.76], to: [-4.544, 50.826], kind: "submarine-cable", tone: "capital", dashed: false, label: "Grace Hopper / SWIFT" },
      { id: "aec-cork", from: [-72.886, 40.76], to: [-8.476, 51.899], kind: "submarine-cable", tone: "secondary", dashed: true },
      { id: "marea-bilbao", from: [-75.978, 36.853], to: [-3.01, 43.38], kind: "submarine-cable", tone: "secondary", dashed: true, label: "MAREA" },
    ],
    warnings: [],
    keywords: ["transatlantic cable", "transatlantic cables", "marea", "dunant", "grace hopper", "bude", "virginia beach cable", "swift cable"],
    sourceNote: "FCC Submarine Cable Landing Licenses & SWIFT Traffic Ledger",
  },
  {
    id: "EURO_SOVEREIGN_SPREAD",
    title: "Eurozone Sovereign Yield Inversion: France vs Greece & Bunds",
    eyebrow: "OAT–Bund Spread Widening • Fiscal Vigilante Repricing",
    subtitle: "French 10Y OAT risk premium crosses Peripheral Greece as deficit math challenges core Eurozone hierarchy",
    episodeTag: "EP10",
    scope: "europe",
    center: [10.5, 45.2],
    bbox: [[-6.5, 35.0], [28.5, 55.5]],
    targetZoom: 2.05,
    routeTone: "alert",
    primaryCountryIds: ["276"],
    secondaryCountryIds: ["300", "380"],
    alertCountryIds: ["250"],
    primaryStateFips: [],
    pins: [
      { id: "paris-oat", label: "Paris (10Y OAT)", sublabel: "Agence France Trésor", metric: "Spread > Greece", coordinates: [2.352, 48.857], kind: "financial-center", tone: "alert", pulse: true },
      { id: "athens-ggb", label: "Athens (10Y GGB)", sublabel: "Primary Surplus Compression", metric: "Tighter Yield", coordinates: [23.728, 37.984], kind: "financial-center", tone: "secondary" },
      { id: "frankfurt-bund", label: "Frankfurt (ECB / Bund)", sublabel: "Euro Risk-Free Benchmark", metric: "TPI Backstop Test", coordinates: [8.682, 50.111], kind: "financial-center", tone: "primary" },
      { id: "rome-btp", label: "Rome (10Y BTP)", sublabel: "Debt-to-GDP Watch", coordinates: [12.496, 41.903], kind: "capital", tone: "secondary" },
    ],
    arcs: [
      { id: "bund-oat", from: [8.682, 50.111], to: [2.352, 48.857], kind: "capital-flow", tone: "alert", dashed: false, label: "OAT–Bund Spread Widening" },
      { id: "bund-ggb", from: [8.682, 50.111], to: [23.728, 37.984], kind: "capital-flow", tone: "secondary", dashed: true, label: "GGB Spread Inversion" },
    ],
    warnings: [],
    keywords: ["france greece", "france vs greece", "france and greece", "oat bund", "french yield", "euro sovereign", "french bond", "eurozone debt", "paris athens"],
    sourceNote: "ECB Statistical Data Warehouse & Bloomberg Sovereign Curves",
  },
  {
    id: "TOKYO_JGB_FLOW",
    title: "Tokyo JGB Liftoff & Trans-Pacific US Treasury Repatriation",
    eyebrow: "$1.1T Foreign Official Holder • Yen Carry Unwind",
    subtitle: "Rising 30Y Japanese Government Bond yields pull institutional life-insurer capital home from US Treasuries",
    episodeTag: "EP02 / EP10",
    scope: "world",
    center: [-168.0, 36.0],
    bbox: [[128.0, 22.0], [-68.0, 52.0]],
    targetZoom: 1.55,
    routeTone: "capital",
    primaryCountryIds: ["392", "840"],
    secondaryCountryIds: [],
    primaryStateFips: ["11", "36"],
    pins: [
      { id: "tokyo-nihonbashi", label: "Tokyo (BOJ & Lifers)", sublabel: "30Y JGB Yield Breakout", metric: "$1.1T UST Stack", coordinates: [139.767, 35.681], kind: "financial-center", tone: "alert", pulse: true },
      { id: "dc-treasury", label: "Washington, D.C.", sublabel: "US Treasury Table 9 / TIC", metric: "$40.5T Rollover", coordinates: [-77.037, 38.898], kind: "capital", tone: "primary", pulse: true },
      { id: "ny-fed-desk", label: "New York Primary Desk", sublabel: "FX Swap & Repo Clearing", coordinates: [-74.006, 40.713], kind: "financial-center", tone: "capital" },
    ],
    arcs: [
      { id: "jgb-repatriation", from: [-77.037, 38.898], to: [139.767, 35.681], kind: "capital-flow", tone: "alert", dashed: false, label: "UST -> JGB Repatriation Pull" },
    ],
    warnings: [],
    keywords: ["tokyo jgb", "japan jgb", "jgb yield", "bank of japan", "boj", "yen carry", "japanese bond", "tic report", "japanese treasury"],
    sourceNote: "U.S. Treasury TIC Major Foreign Holders & Ministry of Finance Japan",
  },
  {
    id: "ARIZONA_FAB_CORRIDOR",
    title: "Arizona Silicon Desert: Phoenix Fab 21 & Chandler Foundry",
    eyebrow: "CHIPS Act Onshoring • Power & Ultrapure Water Basin",
    subtitle: "North Phoenix N4 production ramps while advanced CoWoS packaging & 2nm nodes remain anchored in Taiwan",
    episodeTag: "EP03 / EP07",
    scope: "usa",
    center: [-111.9, 33.9],
    bbox: [[-116.5, 31.2], [-107.0, 37.5]],
    targetZoom: 2.55,
    routeTone: "primary",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["04"],
    secondaryStateFips: ["06", "35", "48"],
    pins: [
      { id: "phoenix-fab21", label: "Phoenix TSMC Fab 21", sublabel: "Sonoran Cleanroom Campus", metric: "4nm Live / N2 Lag", coordinates: [-112.135, 33.782], kind: "fab", tone: "primary", pulse: true },
      { id: "chandler-ocotillo", label: "Chandler Ocotillo", sublabel: "Intel Fab 52 & 62", metric: "18A Node Ramp", coordinates: [-111.885, 33.243], kind: "fab", tone: "secondary" },
      { id: "palo-verde-nuc", label: "Palo Verde Nuclear", sublabel: "Largest US Clean Generator", metric: "3.93 GW Baseload", coordinates: [-112.862, 33.388], kind: "nuclear", tone: "capital" },
    ],
    arcs: [
      { id: "pv-phoenix-grid", from: [-112.862, 33.388], to: [-112.135, 33.782], kind: "power-grid", tone: "primary", dashed: true, label: "500kV Cleanroom Feed" },
      { id: "phoenix-chandler", from: [-112.135, 33.782], to: [-111.885, 33.243], kind: "supply-chain", tone: "secondary", dashed: false },
    ],
    warnings: [],
    keywords: ["phoenix fab", "fab 21", "silicon desert", "chandler", "ocotillo", "palo verde", "arizona fab", "arizona tsmc"],
    sourceNote: "NIST CHIPS Program Office & Arizona Commerce Authority",
  },
  {
    id: "CALIFORNIA_FAIR_INSURANCE",
    title: "California FAIR Plan Surge & Drone Roof Non-Renewal",
    eyebrow: "State Insurer of Last Resort • Wildfire WUI Exposure",
    subtitle: "Private carrier exits push hundreds of billions into the FAIR Plan pool alongside +29.1% rate shock",
    episodeTag: "EP05",
    scope: "usa",
    center: [-119.6, 36.8],
    bbox: [[-124.6, 32.4], [-114.0, 42.1]],
    targetZoom: 2.25,
    routeTone: "alert",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["06"],
    alertStateFips: ["06"],
    pins: [
      { id: "la-palisades", label: "Los Angeles Foothills", sublabel: "Brush Concentration Zone", metric: "$458B+ Pool Exposure", coordinates: [-118.526, 34.048], kind: "city", tone: "alert", pulse: true },
      { id: "sacramento-doi", label: "Sacramento CDI", sublabel: "Reinsurance Cost Pass-Through", metric: "+29.1% Hike Filing", coordinates: [-121.494, 38.582], kind: "capital", tone: "primary" },
      { id: "sierra-wui", label: "Sierra Nevada WUI", sublabel: "Aerial LiDAR Roof Audits", metric: "Non-Renewal Wave", coordinates: [-120.804, 38.729], kind: "city", tone: "alert" },
    ],
    arcs: [
      { id: "fair-assessment", from: [-118.526, 34.048], to: [-121.494, 38.582], kind: "capital-flow", tone: "alert", dashed: true, label: "Statewide Assessment Liability" },
    ],
    warnings: [
      { id: "ca-fair-void", label: "Private Underwriting Retreat", detail: "FAIR Plan policy count doubled since 2020", coordinates: [-119.2, 35.6], kind: "insurance-void", radiusDeg: 1.5 },
    ],
    keywords: ["fair plan", "california insurance", "pacific palisades", "wildfire insurance", "drone roof", "29.1%"],
    sourceNote: "California FAIR Plan Association & Dept. of Insurance Filings",
  },
  {
    id: "FLORIDA_INSURANCE",
    title: "Florida Hurricane Wind/Flood Escrow & Reinsurance Squeeze",
    eyebrow: "Citizens Property Pool • Coastal Mortgage Stress",
    subtitle: "Bermuda cat-reinsurance pricing & flood remapping turn 3% fixed mortgages into variable monthly shocks",
    episodeTag: "EP05",
    scope: "usa",
    center: [-81.7, 27.8],
    bbox: [[-87.7, 24.4], [-79.5, 31.2]],
    targetZoom: 2.45,
    routeTone: "alert",
    primaryCountryIds: ["840"],
    secondaryCountryIds: [],
    primaryStateFips: ["12"],
    alertStateFips: ["12"],
    pins: [
      { id: "miami-wind", label: "Miami-Dade Coast", sublabel: "High-Velocity Hurricane Zone", metric: "3x National Avg Premium", coordinates: [-80.192, 25.762], kind: "city", tone: "alert", pulse: true },
      { id: "tampa-surge", label: "Tampa Bay Basin", sublabel: "Storm-Surge & Condo Reserve", metric: "Escrow Shock", coordinates: [-82.457, 27.951], kind: "port", tone: "alert" },
      { id: "tallahassee-oir", label: "Tallahassee OIR", sublabel: "Citizens Depopulation Mandate", coordinates: [-84.281, 30.438], kind: "capital", tone: "primary" },
    ],
    arcs: [
      { id: "fl-reins-loop", from: [-80.192, 25.762], to: [-82.457, 27.951], kind: "capital-flow", tone: "alert", dashed: true },
    ],
    warnings: [
      { id: "fl-escrow-zone", label: "Coastal Escrow Spike", detail: "Taxes + wind + flood exceed P&I on legacy loans", coordinates: [-81.3, 26.7], kind: "insurance-void", radiusDeg: 1.3 },
    ],
    keywords: ["florida insurance", "citizens property", "tampa surge", "miami insurance", "hurricane escrow"],
    sourceNote: "Florida Office of Insurance Regulation & First Street Foundation",
  },
  {
    id: "STRAIT_OF_HORMUZ",
    title: "Strait of Hormuz Energy & LNG Maritime Chokepoint",
    eyebrow: "33km Strait • 21M bbl/d Crude + 20% Global Seaborne LNG",
    subtitle: "Two 3km-wide shipping lanes carry one-fifth of global petroleum consumption with minimal pipeline bypass",
    episodeTag: "EP08 / CHOKEPOINT",
    scope: "middle-east",
    center: [55.2, 26.2],
    bbox: [[46.5, 21.0], [62.0, 31.5]],
    targetZoom: 2.6,
    defaultRegister: "midnight-telemetry",
    routeTone: "alert",
    primaryCountryIds: ["512", "784", "682", "634"],
    secondaryCountryIds: ["414", "368"],
    alertCountryIds: ["364"],
    primaryStateFips: [],
    pins: [
      { id: "hormuz-narrows", label: "Strait of Hormuz", sublabel: "Two 3km TSS Tanker Lanes", metric: "21M bbl/d Oil", coordinates: [56.25, 26.57], kind: "chokepoint", tone: "alert", pulse: true },
      { id: "ras-laffan", label: "Ras Laffan, Qatar", sublabel: "North Field LNG Megaplant", metric: "20% World LNG", coordinates: [51.536, 25.925], kind: "port", tone: "primary" },
      { id: "fujairah-bypass", label: "Fujairah Terminal", sublabel: "Habshan Bypass Outlet", metric: "1.5M bbl/d Cap", coordinates: [56.357, 25.129], kind: "port", tone: "secondary" },
      { id: "bandar-abbas", label: "Bandar Abbas", sublabel: "Northern Littoral Base", coordinates: [56.266, 27.183], kind: "port", tone: "alert" },
    ],
    arcs: [
      { id: "hormuz-tanker-track", from: [51.536, 25.925], to: [56.25, 26.57], kind: "shipping", tone: "alert", dashed: false, label: "VLCC & Q-Max Track" },
      { id: "hormuz-arabian", from: [56.25, 26.57], to: [59.5, 23.8], kind: "shipping", tone: "primary", dashed: true },
    ],
    warnings: [
      { id: "hormuz-alert", label: "3km Navigable Tanker Separation", detail: "80%+ bound for Asian refineries", coordinates: [56.25, 26.57], kind: "chokepoint-alert", radiusDeg: 0.9 },
    ],
    keywords: ["strait of hormuz", "hormuz", "ras laffan", "fujairah", "persian gulf oil", "bandar abbas"],
    sourceNote: "U.S. EIA World Oil Transit Chokepoints",
  },
  {
    id: "MALACCA_STRAIT",
    title: "Strait of Malacca & Singapore Phillips Channel Funnel",
    eyebrow: "2.8km Narrows • 90,000+ Vessels/Yr Indo-Pacific Artery",
    subtitle: "Primary maritime bridge linking Middle East crude and European containers to China, Japan & South Korea",
    episodeTag: "EP07 / CHOKEPOINT",
    scope: "east-asia",
    center: [102.6, 2.6],
    bbox: [[94.0, -5.0], [114.0, 11.5]],
    targetZoom: 2.55,
    routeTone: "primary",
    primaryCountryIds: ["702", "458", "360"],
    secondaryCountryIds: ["764"],
    primaryStateFips: [],
    pins: [
      { id: "singapore-phillips", label: "Singapore Strait", sublabel: "Phillips Channel Narrows", metric: "2.8km Funnel", coordinates: [103.82, 1.265], kind: "chokepoint", tone: "alert", pulse: true },
      { id: "tuas-megaport", label: "Tuas Automated Port", sublabel: "Republic of Singapore", metric: "40M+ TEU/yr", coordinates: [103.63, 1.29], kind: "port", tone: "primary" },
      { id: "port-klang", label: "Port Klang", sublabel: "Selangor West Coast", coordinates: [101.393, 3.0], kind: "port", tone: "secondary" },
    ],
    arcs: [
      { id: "malacca-lane", from: [97.5, 5.6], to: [103.82, 1.265], kind: "shipping", tone: "primary", dashed: false, label: "Malacca Main Fairway" },
      { id: "scs-exit", from: [103.82, 1.265], to: [108.5, 5.2], kind: "shipping", tone: "secondary", dashed: true },
    ],
    warnings: [
      { id: "phillips-narrows", label: "Phillips Channel Bottleneck", detail: "16M bbl/d crude + container trunk", coordinates: [103.75, 1.18], kind: "chokepoint-alert", radiusDeg: 0.7 },
    ],
    keywords: ["malacca", "strait of malacca", "phillips channel", "tuas port", "port klang", "singapore strait"],
    sourceNote: "Maritime and Port Authority of Singapore & UNCTAD Review",
  },
  {
    id: "SUEZ_CORRIDOR",
    title: "Suez Canal Trench & Egypt Terrestrial Fiber Crossing",
    eyebrow: "193km Sea-Level Cut • Europe–Asia Maritime & Data Bridge",
    subtitle: "Single-lane convoy segments & Nile-Sinai terrestrial fiber ducts concentrate intercontinental latency and freight",
    episodeTag: "EP08 / EP09",
    scope: "middle-east",
    center: [32.3, 29.8],
    bbox: [[25.5, 23.5], [39.5, 34.8]],
    targetZoom: 2.75,
    routeTone: "primary",
    primaryCountryIds: ["818"],
    secondaryCountryIds: ["376", "682", "300"],
    primaryStateFips: [],
    pins: [
      { id: "port-said", label: "Port Said", sublabel: "Mediterranean Convoy Entry", metric: "12% World Trade", coordinates: [32.302, 31.265], kind: "chokepoint", tone: "primary", pulse: true },
      { id: "bitter-lake", label: "Great Bitter Lake", sublabel: "Passing Basin", coordinates: [32.345, 30.335], kind: "chokepoint", tone: "secondary" },
      { id: "port-tewfik", label: "Port Tewfik (Suez)", sublabel: "Southern Canal Gate", coordinates: [32.55, 29.967], kind: "port", tone: "primary" },
      { id: "zafarana-cls", label: "Zafarana & Abu Talat", sublabel: "17+ Subsea Cable Crossing", metric: "EU-Asia Latency Link", coordinates: [32.65, 29.11], kind: "cable-landing", tone: "alert" },
    ],
    arcs: [
      { id: "suez-cut", from: [32.55, 29.967], to: [32.302, 31.265], kind: "shipping", tone: "primary", dashed: false, label: "193km Suez Transit" },
    ],
    warnings: [],
    keywords: ["suez canal", "suez corridor", "port said", "great bitter lake", "ever given", "zafarana"],
    sourceNote: "Suez Canal Authority & IMF PortWatch",
  },
  {
    id: "PANAMA_CANAL",
    title: "Panama Canal Gatun Freshwater Locks & US East Coast Artery",
    eyebrow: "82km Isthmus Lock System • 40% of US Container Traffic",
    subtitle: "Each Neopanamax transit flushes ~52M gallons of Gatun Lake rainwater, linking hydro-climate directly to freight rates",
    episodeTag: "CHOKEPOINT",
    scope: "americas",
    center: [-79.8, 9.1],
    bbox: [[-92.0, 2.0], [-68.0, 19.5]],
    targetZoom: 2.9,
    routeTone: "alert",
    primaryCountryIds: ["591"],
    secondaryCountryIds: ["170", "188", "840"],
    primaryStateFips: [],
    pins: [
      { id: "gatun-locks", label: "Gatun Lake & Locks", sublabel: "26m Freshwater Lift", metric: "52M Gal / Ship", coordinates: [-79.922, 9.273], kind: "chokepoint", tone: "alert", pulse: true },
      { id: "balboa-pac", label: "Balboa / Cocoli", sublabel: "Pacific Neopanamax Gate", coordinates: [-79.566, 8.952], kind: "port", tone: "primary" },
      { id: "colon-atl", label: "Colón / Agua Clara", sublabel: "Caribbean LNG & Box Gate", coordinates: [-79.901, 9.359], kind: "port", tone: "secondary" },
    ],
    arcs: [
      { id: "panama-transit", from: [-79.566, 8.952], to: [-79.901, 9.359], kind: "shipping", tone: "alert", dashed: false, label: "Interoceanic Lock Cut" },
    ],
    warnings: [
      { id: "gatun-draft", label: "Freshwater Draft Ceiling", detail: "El Niño reservoir level restricts daily slots", coordinates: [-79.85, 9.16], kind: "chokepoint-alert", radiusDeg: 0.65 },
    ],
    keywords: ["panama canal", "gatun lake", "gatun locks", "neopanamax", "balboa", "agua clara"],
    sourceNote: "Autoridad del Canal de Panamá Transit Advisories",
  },
  {
    id: "CHILE_PERU_COPPER_BELT",
    title: "Andean Copper Porphyry Belt & 17.5-Year Mine Bottleneck",
    eyebrow: "Chile & Peru • ~36% of Global Mined Copper Supply",
    subtitle: "Aging Atacama ore grades & 17.5-year mine permitting timelines collide with AI grid & transformer demand",
    episodeTag: "EP06",
    scope: "americas",
    center: [-70.8, -20.5],
    bbox: [[-84.0, -38.5], [-58.0, -6.0]],
    targetZoom: 2.1,
    routeTone: "primary",
    primaryCountryIds: ["152", "604"],
    secondaryCountryIds: ["068", "032"],
    primaryStateFips: [],
    pins: [
      { id: "escondida-pit", label: "Escondida (Atacama)", sublabel: "World #1 Copper Porphyry", metric: "1.1M+ t/yr Cu", coordinates: [-69.068, -24.27], kind: "mine", tone: "primary", pulse: true },
      { id: "chuquicamata", label: "Chuquicamata", sublabel: "Codelco Underground Shift", metric: "17.5-Yr New Mine Lag", coordinates: [-68.902, -22.29], kind: "mine", tone: "alert" },
      { id: "cerro-verde", label: "Cerro Verde & Las Bambas", sublabel: "Southern Peru Copper Belt", coordinates: [-71.58, -16.53], kind: "mine", tone: "secondary" },
      { id: "antofagasta-port", label: "Antofagasta & Mejillones", sublabel: "Concentrate Export Quays", metric: "72% Smelted in China", coordinates: [-70.404, -23.651], kind: "port", tone: "capital" },
    ],
    arcs: [
      { id: "andes-slurry", from: [-69.068, -24.27], to: [-70.404, -23.651], kind: "supply-chain", tone: "primary", dashed: false, label: "Concentrate Slurry & Rail" },
      { id: "peru-chile-spine", from: [-71.58, -16.53], to: [-68.902, -22.29], kind: "supply-chain", tone: "secondary", dashed: true, label: "Andean Porphyry Arc" },
    ],
    warnings: [],
    keywords: ["escondida", "chuquicamata", "atacama copper", "chile copper", "peru copper", "copper belt", "codelco", "las bambas"],
    sourceNote: "IEA Global Critical Minerals Outlook & S&P Mine Lead-Time Study",
  },
];

export const GEOPOLITICAL_CORRIDORS: readonly GeopoliticalCorridor[] = [
  ...CORRIDORS_PART_A,
  ...CORRIDORS_PART_B,
];

// ============================================================================
// O(1) Lookup Maps & Canonical Registry Counts
// ============================================================================

export const COUNTRY_BY_ISO_NUMERIC: ReadonlyMap<string, CountryRecord> = new Map(
  WORLD_COUNTRIES.map((c) => [c.isoNumeric, c])
);

export const US_STATE_BY_FIPS: ReadonlyMap<string, UsStateRecord> = new Map(
  US_STATES.map((s) => [s.fips, s])
);

export const US_STATE_BY_POSTAL: ReadonlyMap<string, UsStateRecord> = new Map(
  US_STATES.map((s) => [s.postal.toUpperCase(), s])
);

export const CORRIDOR_BY_ID: ReadonlyMap<CorridorId, GeopoliticalCorridor> = new Map(
  GEOPOLITICAL_CORRIDORS.map((c) => [c.id, c])
);

export function getCountryCount(): number {
  return WORLD_COUNTRIES.length;
}

export function getUsStateCount(): number {
  return US_STATES.length;
}

export function getUsTerritoryCount(): number {
  return US_TERRITORIES.length;
}

export function getCorridorCount(): number {
  return GEOPOLITICAL_CORRIDORS.length;
}
