export interface VarContext {
  branding?: { displayName?: string | null; phone?: string | null; zalo?: string | null };
  project?: { name?: string | null; view360Url?: string | null };
}

type Source = (c: VarContext) => string | null | undefined;

const VARIABLE_SOURCES: Record<string, Source> = {
  TEN_SALE: (c) => c.branding?.displayName,
  SDT: (c) => c.branding?.phone,
  ZALO: (c) => c.branding?.zalo,
  LINK_360: (c) => c.project?.view360Url,
  TEN_DU_AN: (c) => c.project?.name,
};

// Variables that MUST resolve; if a block uses one with no value it's unusable.
const REQUIRED = new Set(["TEN_SALE", "SDT"]);

export interface SubstituteResult {
  text: string;
  missing: string[]; // required vars referenced but unresolved
}

// Replace [VAR] tokens; report missing required variables.
export function substitute(text: string, ctx: VarContext): SubstituteResult {
  const missing = new Set<string>();
  const out = text.replace(/\[([A-Z0-9_]+)\]/g, (whole, name: string) => {
    const src = VARIABLE_SOURCES[name];
    if (!src) return whole; // unknown token left as-is
    const val = src(ctx);
    if (val == null || val === "") {
      if (REQUIRED.has(name)) missing.add(name);
      return whole;
    }
    return val;
  });
  return { text: out, missing: [...missing] };
}
