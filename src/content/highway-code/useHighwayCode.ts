import { useMemo } from 'react';
import type { HighwayCodeRule, HighwayCodeSection } from '../../types';
import sectionsJson from './sections.json';
import rulesJson from './rules.json';

const SECTIONS = sectionsJson as HighwayCodeSection[];
const RULES = rulesJson as HighwayCodeRule[];

const RULE_INDEX = new Map(RULES.map((r) => [r.rule, r]));

/** Lightweight, memoised access to bundled Highway Code content. */
export function useHighwayCode() {
  return useMemo(
    () => ({
      sections: SECTIONS,
      rules: RULES,

      getSection(id: string): HighwayCodeSection | undefined {
        return SECTIONS.find((s) => s.id === id);
      },

      getSectionForRule(rule: number): HighwayCodeSection | undefined {
        return SECTIONS.find((s) => rule >= s.ruleStart && rule <= s.ruleEnd);
      },

      getRule(rule: number): HighwayCodeRule | undefined {
        return RULE_INDEX.get(rule);
      },

      rulesForSection(sectionId: string): HighwayCodeRule[] {
        return RULES.filter((r) => r.sectionId === sectionId);
      },

      search(query: string): HighwayCodeRule[] {
        const q = query.trim().toLowerCase();
        if (q.length < 2) return [];
        return RULES.filter((r) => r.text.toLowerCase().includes(q));
      },
    }),
    [],
  );
}
