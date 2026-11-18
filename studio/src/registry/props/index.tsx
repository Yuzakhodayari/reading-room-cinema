import React from "react";
import { DOMAIN_BLUEPRINTS, DOMAIN_CATALOG_BY_ID, DOMAIN_CATALOG_ENTRIES } from "./domainCatalogs";
import { HERO_CONTRAPTION_ENTRIES, HERO_CONTRAPTIONS } from "./heroContraptions";
import { PropRenderProps, PropSearchOptions, PropVaultEntry } from "./propTypes";

export * from "./propTypes";
export * from "./parametricBuilders";
export * from "./heroContraptions";
export * from "./domainCatalogs";

// ============================================================================
// Unified 545-Item Prop & Contraption Vault
// ============================================================================

export const PROP_VAULT_LIST: readonly PropVaultEntry[] = ([] as PropVaultEntry[]).concat(
  HERO_CONTRAPTION_ENTRIES,
  DOMAIN_CATALOG_ENTRIES
);

const vaultById: Record<string, PropVaultEntry> = {};
const aliasLookup: Record<string, PropVaultEntry> = {};

function toKebabSlug(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

for (let i = 0; i < PROP_VAULT_LIST.length; i++) {
  const entry = PROP_VAULT_LIST[i];
  vaultById[entry.id] = entry;
  aliasLookup[entry.id.toLowerCase()] = entry;
  const strippedHero = entry.id.replace(/^hero-/, "");
  aliasLookup[strippedHero] = entry;
  if (entry.componentName) {
    aliasLookup[entry.componentName.toLowerCase()] = entry;
    aliasLookup[toKebabSlug(entry.componentName)] = entry;
  }
}

// Explicit alias for TetherTBillBarrelStack -> hero-tether-tbill-stack
if (vaultById["hero-tether-tbill-stack"]) {
  aliasLookup["tethertbillbarrelstack"] = vaultById["hero-tether-tbill-stack"];
  aliasLookup["tether-tbill-barrel-stack"] = vaultById["hero-tether-tbill-stack"];
}

export const PROP_VAULT: Readonly<Record<string, PropVaultEntry>> = vaultById;

export function getPropCount(): number {
  return PROP_VAULT_LIST.length;
}

export function getHeroPropCount(): number {
  return HERO_CONTRAPTION_ENTRIES.length;
}

export function getParametricPropCount(): number {
  return DOMAIN_CATALOG_ENTRIES.length;
}

export function getPropById(propId: string): PropVaultEntry | undefined {
  if (!propId) return undefined;
  if (vaultById[propId]) return vaultById[propId];
  const clean = propId.trim();
  if (vaultById[clean]) return vaultById[clean];
  const lower = clean.toLowerCase();
  if (aliasLookup[lower]) return aliasLookup[lower];
  const tail = lower.indexOf("/") !== -1 ? lower.slice(lower.lastIndexOf("/") + 1) : lower;
  if (aliasLookup[tail]) return aliasLookup[tail];
  const kebab = toKebabSlug(tail);
  return aliasLookup[kebab];
}

// ============================================================================
// Deterministic Semantic Tag, Domain & Keyword Search
// ============================================================================

function tokenizeQuery(tagsOrQuery: string | readonly string[]): string[] {
  const rawList = typeof tagsOrQuery === "string" ? [tagsOrQuery] : tagsOrQuery;
  const tokens: string[] = [];
  for (let i = 0; i < rawList.length; i++) {
    const parts = rawList[i]
      .toLowerCase()
      .split(/[\s,;/|]+/)
      .filter((s) => s.length > 0);
    for (let j = 0; j < parts.length; j++) {
      if (tokens.indexOf(parts[j]) === -1) {
        tokens.push(parts[j]);
      }
    }
  }
  return tokens;
}

function scoreEntryAgainstTokens(entry: PropVaultEntry, tokens: readonly string[]): number {
  if (tokens.length === 0) {
    return entry.kind === "hero-contraption" ? 2 : 1;
  }
  const idLower = entry.id.toLowerCase();
  const titleLower = entry.title.toLowerCase();
  const compLower = (entry.componentName ?? "").toLowerCase();
  const catLower = entry.category.toLowerCase();
  const domLower = (entry.domain ?? "").toLowerCase();
  const metricLower = (entry.blueprint?.primaryMetric ?? "").toLowerCase();
  const secLower = (entry.blueprint?.secondaryLabel ?? "").toLowerCase();

  let score = 0;
  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t];
    if (idLower === tok || compLower === tok) score += 40;
    else if (idLower.indexOf(tok) !== -1) score += 16;

    if (domLower === tok || catLower === tok) score += 20;
    else if (domLower.indexOf(tok) !== -1 || catLower.indexOf(tok) !== -1) score += 8;

    for (let k = 0; k < entry.keywords.length; k++) {
      const kw = entry.keywords[k].toLowerCase();
      if (kw === tok) score += 22;
      else if (kw.indexOf(tok) !== -1 || tok.indexOf(kw) !== -1) score += 9;
    }

    for (let e = 0; e < entry.episodeTags.length; e++) {
      if (entry.episodeTags[e].toLowerCase() === tok) score += 18;
    }

    if (titleLower.indexOf(tok) !== -1) score += 12;
    if (metricLower.indexOf(tok) !== -1 || secLower.indexOf(tok) !== -1) score += 7;
  }

  if (score > 0 && entry.kind === "hero-contraption") {
    score += 3;
  }
  return score;
}

export function searchPropsBySemanticTags(
  tagsOrQuery: string | readonly string[],
  options?: PropSearchOptions
): PropVaultEntry[] {
  const tokens = tokenizeQuery(tagsOrQuery);
  const limit = options?.limit ?? 25;
  const scored: Array<{ entry: PropVaultEntry; score: number }> = [];

  for (let i = 0; i < PROP_VAULT_LIST.length; i++) {
    const entry = PROP_VAULT_LIST[i];
    if (options?.kind && entry.kind !== options.kind) continue;
    if (options?.category && entry.category !== options.category) continue;
    if (options?.domain && entry.domain !== options.domain) continue;
    if (options?.episodeTag && entry.episodeTags.indexOf(options.episodeTag) === -1) continue;

    const score = scoreEntryAgainstTokens(entry, tokens);
    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.id < b.entry.id ? -1 : a.entry.id > b.entry.id ? 1 : 0;
  });

  return scored.slice(0, Math.max(1, limit)).map((item) => item.entry);
}

// ============================================================================
// Declarative PropVaultRenderer & renderPropAtom Helper
// ============================================================================

export interface PropVaultRendererProps extends PropRenderProps {
  propId: string;
  fallbackPropId?: string;
}

export const PropVaultRenderer: React.FC<PropVaultRendererProps> = ({
  propId,
  fallbackPropId,
  ...renderProps
}) => {
  const resolved =
    getPropById(propId) ??
    (fallbackPropId ? getPropById(fallbackPropId) : undefined) ??
    searchPropsBySemanticTags(propId, { limit: 1 })[0] ??
    PROP_VAULT_LIST[0];

  if (!resolved) return null;
  const TargetComponent = resolved.Component;
  return <TargetComponent {...renderProps} />;
};

export function renderPropAtom(
  propIdOrConfig: string | PropVaultRendererProps,
  renderProps?: PropRenderProps
): React.ReactElement {
  if (typeof propIdOrConfig === "string") {
    return <PropVaultRenderer propId={propIdOrConfig} {...renderProps} />;
  }
  return <PropVaultRenderer {...propIdOrConfig} />;
}

// Keep explicit references alive for tree-shaking / strict unused checks
export const PROP_VAULT_SUMMARY = {
  total: PROP_VAULT_LIST.length,
  heroCount: HERO_CONTRAPTION_ENTRIES.length,
  parametricCount: DOMAIN_BLUEPRINTS.length,
  hasCatalogIndex: Boolean(DOMAIN_CATALOG_BY_ID["fiscal-tbill-4w-auction-note"]),
  hasHeroIndex: Boolean(HERO_CONTRAPTIONS.W2WithholdingGuillotine),
} as const;
