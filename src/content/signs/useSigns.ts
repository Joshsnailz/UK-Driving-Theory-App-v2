import { useMemo } from 'react';
import type { SignGroup, TrafficSign } from '../../types';
import signsJson from './signs.json';

const SIGNS = signsJson as TrafficSign[];
const SIGN_INDEX = new Map(SIGNS.map((s) => [s.id, s]));

export const SIGN_GROUP_LABEL: Record<SignGroup, string> = {
  warning: 'Warning signs',
  regulatory: 'Signs giving orders',
  speed: 'Speed limits',
  information: 'Information signs',
  direction: 'Direction signs',
  roadworks: 'Road works signs',
  markings: 'Road markings',
};

export function useSigns() {
  return useMemo(
    () => ({
      all: SIGNS,
      groups: Object.keys(SIGN_GROUP_LABEL) as SignGroup[],
      byGroup(group: SignGroup): TrafficSign[] {
        return SIGNS.filter((s) => s.group === group);
      },
      get(id: string): TrafficSign | undefined {
        return SIGN_INDEX.get(id);
      },
    }),
    [],
  );
}
