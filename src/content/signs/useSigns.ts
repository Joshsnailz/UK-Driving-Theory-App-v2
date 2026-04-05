import { useMemo } from "react";
import type { SignGroup, TrafficSign } from "../../types";
import signsJson from "./signs.json";

const SIGNS = signsJson as TrafficSign[];
const SIGN_INDEX = new Map(SIGNS.map((s) => [s.id, s]));

export const SIGN_GROUP_LABEL: Record<SignGroup, string> = {
  warning: "Warning signs",
  regulatory: "Signs giving orders",
  speed: "Speed limit signs",
  low_bridge: "Low bridge signs",
  level_crossing: "Level crossing signs and signals",
  tram: "Tram signs, signals and road markings",
  bus_cycle: "Bus and cycle signs and road markings",
  pedestrian_zone: "Pedestrian zone signs",
  parking: "On-street parking control signs and road markings",
  road_markings: "Road markings",
  traffic_calming: "Traffic calming",
  motorway: "Motorway signs, signals and road markings",
  direction: "Direction signs on all-purpose roads",
  cyclist_pedestrian: "Direction signs for cyclists and pedestrians",
  information: "Information signs",
  traffic_signals: "Traffic signals",
  tidal_flow: "Tidal flow lane control signs and signals",
  crossings: "Pedestrian, cycle and equestrian crossings",
  roadworks: "Signs for road works and temporary situations",
  miscellaneous: "Miscellaneous signs",
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
