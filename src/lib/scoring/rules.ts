import { DEFAULT_RULES, type ScoringRules } from "./engine";

// pools.scoring_rules guarda formatos legacy ({version, rules:{group_match_*}})
// anteriores al scoring v2. El engine usa claves planas (match_sign…).
// Misma lógica replicada en supabase/functions/poll-results/index.ts.
export function normalizePoolRules(raw: unknown): ScoringRules {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.match_sign === "number") {
      return { ...DEFAULT_RULES, ...(obj as Partial<ScoringRules>) };
    }
    const legacy = obj.rules as Record<string, unknown> | undefined;
    if (legacy && typeof legacy.group_match_sign === "number") {
      return {
        ...DEFAULT_RULES,
        match_sign: legacy.group_match_sign as number,
        match_exact:
          (legacy.group_match_exact as number) ?? DEFAULT_RULES.match_exact,
      };
    }
  }
  return DEFAULT_RULES;
}
