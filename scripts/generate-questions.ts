#!/usr/bin/env ts-node
/**
 * Generates the per-category question bank from Highway Code source data.
 *
 * Every question produced here is derived from, and tagged with, a specific
 * Highway Code rule number or traffic-sign entry so that the correct answer
 * can be verified against gov.uk (OGL v3.0). No question text is invented
 * without a citation.
 *
 * Run:  npx ts-node scripts/generate-questions.ts
 * Output: src/content/questions/<category>.json + index manifest
 */
/* eslint-disable @typescript-eslint/no-require-imports */

import * as fs from 'fs';
import * as path from 'path';

type Category =
  | 'alertness' | 'attitude' | 'safety-margins' | 'hazard-awareness'
  | 'vulnerable-road-users' | 'vehicle-safety' | 'motorway-rules'
  | 'rules-of-the-road' | 'road-traffic-signs' | 'documents'
  | 'accidents' | 'vehicle-loading';

interface Question {
  id: string;
  category: Category;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  imageUri?: string;
  highwayCodeRules?: number[];
  signId?: string;
}

interface Rule { rule: number; sectionId: string; text: string; lawRefs?: string[] }
interface Sign { id: string; group: string; name: string; meaning: string; image: string; highwayCodeRules?: number[] }
interface SpeedRow { type: string; builtUp: number; single: number; dual: number; motorway: number }
interface StopRow { mph: number; thinking: number; braking: number; total: number; carLengths: number }

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'src', 'content');
const OUT_DIR = path.join(CONTENT, 'questions');

const rules: Rule[] = JSON.parse(fs.readFileSync(path.join(CONTENT, 'highway-code', 'rules.json'), 'utf8'));
const signs: Sign[] = JSON.parse(fs.readFileSync(path.join(CONTENT, 'signs', 'signs.json'), 'utf8'));
const annexes = JSON.parse(fs.readFileSync(path.join(CONTENT, 'highway-code', 'annexes.json'), 'utf8')) as {
  speedLimits: { vehicles: SpeedRow[] };
  stoppingDistances: { rows: StopRow[] };
};

const ruleIndex = new Map(rules.map((r) => [r.rule, r]));

/* ──────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                   */
/* ──────────────────────────────────────────────────────────────────────── */

/** Deterministic pseudo-random for reproducible builds. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function shuffled<T>(arr: readonly T[], seed: string): T[] {
  const rand = mulberry32(hash(seed));
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickDistractors<T>(pool: readonly T[], exclude: T, n: number, seed: string): T[] {
  return shuffled(pool.filter((x) => x !== exclude), seed).slice(0, n);
}

let counter = 0;
function makeId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter.toString().padStart(4, '0')}`;
}

function build(
  category: Category,
  question: string,
  correct: string,
  distractors: string[],
  explanation: string,
  refs: { rules?: number[]; signId?: string; imageUri?: string },
): Question {
  const id = makeId(category);
  const options = shuffled([correct, ...distractors.slice(0, 3)], id);
  return {
    id,
    category,
    question,
    options,
    correctIndex: options.indexOf(correct),
    explanation,
    ...(refs.imageUri && { imageUri: refs.imageUri }),
    ...(refs.rules && { highwayCodeRules: refs.rules }),
    ...(refs.signId && { signId: refs.signId }),
  };
}

function explain(ruleNo: number, extra?: string): string {
  const r = ruleIndex.get(ruleNo);
  const base = r ? r.text : '';
  return extra ? `${extra} (Highway Code rule ${ruleNo}.)` : `${base} (Highway Code rule ${ruleNo}.)`;
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 1. Traffic-sign recognition (one per sign, both directions)              */
/* ──────────────────────────────────────────────────────────────────────── */

function* signQuestions(): Generator<Question> {
  for (const sign of signs) {
    const peers = signs.filter((s) => s.group === sign.group && s.id !== sign.id);
    const pool = peers.length >= 3 ? peers : signs.filter((s) => s.id !== sign.id);

    // “What does this sign mean?”
    const meaningDistractors = pickDistractors(pool.map((s) => s.meaning), sign.meaning, 3, sign.id + ':m');
    yield build(
      'road-traffic-signs',
      'What does this sign mean?',
      sign.meaning,
      meaningDistractors,
      `${sign.name}: ${sign.meaning} Source: Know Your Traffic Signs (OGL v3.0).`,
      { signId: sign.id, imageUri: sign.image, rules: sign.highwayCodeRules },
    );

    // “Which sign means …?” (text-only reverse lookup)
    const nameDistractors = pickDistractors(pool.map((s) => s.name), sign.name, 3, sign.id + ':n');
    yield build(
      'road-traffic-signs',
      `Which sign means: “${sign.meaning}”?`,
      sign.name,
      nameDistractors,
      `The “${sign.name}” sign means: ${sign.meaning} Source: Know Your Traffic Signs (OGL v3.0).`,
      { signId: sign.id, rules: sign.highwayCodeRules },
    );
  }
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 2. Speed limits (Rule 124 table)                                          */
/* ──────────────────────────────────────────────────────────────────────── */

const ROAD_LABEL = {
  builtUp: 'a built-up area (street-lit road, no other signs)',
  single: 'a single carriageway (national speed limit)',
  dual: 'a dual carriageway (national speed limit)',
  motorway: 'a motorway',
} as const;
type RoadKey = keyof typeof ROAD_LABEL;

function* speedLimitQuestions(): Generator<Question> {
  const allLimits = [20, 30, 40, 50, 60, 70];
  for (const row of annexes.speedLimits.vehicles) {
    for (const road of Object.keys(ROAD_LABEL) as RoadKey[]) {
      const limit = row[road];
      const correct = `${limit} mph`;
      const distractors = pickDistractors(
        allLimits.filter((l) => l !== limit).map((l) => `${l} mph`),
        correct, 3, `${row.type}:${road}`,
      );
      yield build(
        'rules-of-the-road',
        `What is the national speed limit for ${row.type.toLowerCase()} on ${ROAD_LABEL[road]}?`,
        correct,
        distractors,
        `The national speed limit for ${row.type.toLowerCase()} on ${ROAD_LABEL[road]} is ${limit} mph.`,
        { rules: [124] },
      );
    }
  }
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 3. Stopping distances (Rule 126)                                          */
/* ──────────────────────────────────────────────────────────────────────── */

function* stoppingDistanceQuestions(): Generator<Question> {
  const rows = annexes.stoppingDistances.rows;
  const variants: { key: keyof StopRow; label: string }[] = [
    { key: 'thinking', label: 'typical thinking distance' },
    { key: 'braking', label: 'typical braking distance' },
    { key: 'total', label: 'typical overall stopping distance' },
  ];
  for (const row of rows) {
    for (const v of variants) {
      const correct = `${row[v.key]} metres`;
      const distractors = pickDistractors(
        rows.filter((r) => r.mph !== row.mph).map((r) => `${r[v.key]} metres`),
        correct, 3, `${row.mph}:${v.key}`,
      );
      yield build(
        'safety-margins',
        `On a dry road, what is the ${v.label} when travelling at ${row.mph} mph?`,
        correct,
        distractors,
        `At ${row.mph} mph the ${v.label} is about ${row[v.key]} m (thinking ${row.thinking} m + braking ${row.braking} m = ${row.total} m overall).`,
        { rules: [126] },
      );
    }
    // Car-lengths variant
    yield build(
      'safety-margins',
      `Roughly how many car lengths is the overall stopping distance at ${row.mph} mph on a dry road?`,
      `${row.carLengths} car lengths`,
      pickDistractors(rows.map((r) => `${r.carLengths} car lengths`), `${row.carLengths} car lengths`, 3, `${row.mph}:cl`),
      `At ${row.mph} mph the overall stopping distance is about ${row.total} m — roughly ${row.carLengths} car lengths.`,
      { rules: [126] },
    );
  }
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 4. Rule-derived comprehension questions                                  */
/* ──────────────────────────────────────────────────────────────────────── */

/**
 * Map of Highway Code section → DVSA theory category. Used to file
 * rule-comprehension questions under a sensible topic when no override is
 * given for the specific rule.
 */
const SECTION_CATEGORY: Record<string, Category> = {
  pedestrians: 'vulnerable-road-users',
  'powered-wheelchairs': 'vulnerable-road-users',
  animals: 'vulnerable-road-users',
  cyclists: 'vulnerable-road-users',
  motorcyclists: 'vulnerable-road-users',
  'drivers-and-motorcyclists': 'vehicle-safety',
  'general-rules': 'rules-of-the-road',
  'using-the-road': 'rules-of-the-road',
  'road-users-requiring-extra-care': 'vulnerable-road-users',
  'adverse-weather': 'safety-margins',
  'waiting-and-parking': 'rules-of-the-road',
  motorways: 'motorway-rules',
  'breakdowns-and-incidents': 'accidents',
  'roadworks-level-crossings-tramways': 'hazard-awareness',
};

/**
 * Hand-authored question templates keyed by Highway Code rule number. Each
 * entry provides the question stem, the correct answer (taken from the rule
 * text) and three plausible distractors. Keeping these explicit — rather
 * than auto-paraphrasing rule text — keeps the bank reviewable and avoids
 * subtly wrong AI phrasing.
 */
type Template = {
  cat?: Category;
  q: string;
  correct: string;
  wrong: [string, string, string];
  note?: string;
};

const RULE_TEMPLATES: Record<number, Template[]> = {
  91: [
    { cat: 'alertness', q: 'To reduce the risk of tiredness on a long journey, the Highway Code recommends taking a break of at least how long after every two hours of driving?', correct: '15 minutes', wrong: ['5 minutes', '30 minutes', '45 minutes'] },
    { cat: 'alertness', q: 'You start to feel sleepy while driving on a road with no immediate exit. What should you do?', correct: 'Stop in a safe place as soon as possible', wrong: ['Open a window and turn the radio up', 'Increase speed to finish the journey sooner', 'Follow the vehicle in front more closely so you concentrate'] },
  ],
  92: [
    { cat: 'documents', q: 'In good daylight, from what minimum distance must you be able to read a new-style vehicle number plate?', correct: '20 metres', wrong: ['12 metres', '25 metres', '20.5 metres'] },
    { cat: 'vehicle-safety', q: 'You need glasses to read a number plate at the required distance. When must you wear them?', correct: 'At all times when driving', wrong: ['Only at night', 'Only on motorways', 'Only when reversing'] },
  ],
  93: [{ cat: 'alertness', q: 'You are dazzled by bright sunlight while driving. What should you do?', correct: 'Slow down and, if necessary, stop', wrong: ['Flash your headlights at oncoming traffic', 'Speed up to get past the glare', 'Pull down the sun visor and continue at the same speed'] }],
  95: [{ cat: 'attitude', q: 'In England and Wales, what is the legal breath-alcohol limit for drivers?', correct: '35 microgrammes per 100 ml of breath', wrong: ['22 microgrammes per 100 ml of breath', '50 microgrammes per 100 ml of breath', '80 microgrammes per 100 ml of breath'] }],
  97: [{ cat: 'alertness', q: 'Before setting off on a journey, what should you do?', correct: 'Plan your route, allow enough time and adjust mirrors and seat for full control', wrong: ['Wait until you join a main road before adjusting your mirrors', 'Plan to use your phone for directions while driving', 'Wear loose footwear so your feet stay relaxed'] }],
  98: [
    { cat: 'vehicle-loading', q: 'Who is legally responsible for making sure a vehicle is not overloaded?', correct: 'The driver', wrong: ['The owner of the goods', 'The person who loaded the vehicle', 'The vehicle insurer'] },
    { cat: 'vehicle-loading', q: 'When towing, what must you ensure about your load?', correct: 'It is secure and does not stick out dangerously', wrong: ['It is heavier at the rear than at the front', 'It is covered with a dark sheet', 'It is no wider than the towing mirrors'] },
  ],
  99: [{ cat: 'vehicle-safety', q: 'Who is responsible for making sure a 14-year-old front-seat passenger wears a seat belt?', correct: 'The passenger themselves', wrong: ['The driver', 'The vehicle owner', 'No one — it is optional at 14'], note: 'From 14, passengers are responsible for their own seat belt; below 14 the driver is responsible (rule 100).' }],
  100: [{ cat: 'vehicle-safety', q: 'Who is responsible for ensuring a child under 14 wears a seat belt or correct child restraint in a car?', correct: 'The driver', wrong: ['The child', 'The child’s parent', 'The front-seat passenger'] }],
  101: [{ cat: 'vehicle-safety', q: 'Where MUST a rear-facing baby seat NEVER be fitted?', correct: 'In a seat protected by an active frontal airbag', wrong: ['In any rear seat', 'In a seat with a three-point belt', 'In a seat next to a side airbag'] }],
  103: [{ cat: 'attitude', q: 'When should you give a signal to other road users?', correct: 'In plenty of time, after checking it would not be misleading', wrong: ['Only when other vehicles are close behind', 'Immediately before you start the manoeuvre', 'Only when turning right'] }],
  106: [{ cat: 'alertness', q: 'A police vehicle behind you flashes its blue lights and headlights. What must you do?', correct: 'Pull over and stop as soon as it is safe to do so', wrong: ['Stop immediately, even at a junction', 'Speed up so they can follow you to a safer place', 'Continue to the next service area'] }],
  107: [{ cat: 'alertness', q: 'A DVSA officer in a marked vehicle flashes amber lights and signals you to follow. What should you do?', correct: 'Follow their directions and stop in the place they indicate', wrong: ['Ignore them — only the police can stop you', 'Stop immediately in the road', 'Drive to the nearest police station'] }],
  110: [{ cat: 'attitude', q: 'According to the Highway Code, when should you flash your headlights?', correct: 'Only to let other road users know you are there', wrong: ['To tell another driver to go ahead', 'To thank another driver', 'To warn of a speed camera ahead'] }],
  112: [
    { cat: 'attitude', q: 'Between which hours MUST you NOT sound your horn in a built-up area, except to avoid danger?', correct: '11.30 pm and 7.00 am', wrong: ['10.00 pm and 6.00 am', 'Midnight and 6.30 am', '11.00 pm and 8.00 am'] },
    { cat: 'attitude', q: 'When may you sound your horn while your vehicle is stationary on the road?', correct: 'Only when another road user poses a danger', wrong: ['To attract a friend’s attention', 'To let pedestrians know you are waiting', 'Never — it is always illegal'] },
  ],
  114: [{ cat: 'vehicle-safety', q: 'When may you use front or rear fog lights?', correct: 'Only when visibility is seriously reduced', wrong: ['Whenever it is raining', 'At night on unlit roads', 'When following another vehicle closely'] }],
  116: [
    { cat: 'hazard-awareness', q: 'When may you use hazard warning lights while your vehicle is moving?', correct: 'On a motorway or unrestricted dual carriageway, to warn following drivers of a hazard ahead', wrong: ['When being towed in any circumstances', 'When driving slowly looking for an address', 'When double-parked for a short time'] },
    { cat: 'rules-of-the-road', q: 'For which of these is it acceptable to use hazard warning lights?', correct: 'When your vehicle has broken down and is causing an obstruction', wrong: ['When parked on double yellow lines while shopping', 'When reversing into a parking space', 'When you want to thank another driver'] },
  ],
  119: [{ cat: 'safety-margins', q: 'Your vehicle starts to skid. What is the first thing you should do?', correct: 'Release the brake pedal fully or ease off the accelerator', wrong: ['Brake harder', 'Steer sharply against the direction of the skid', 'Change down two gears immediately'] }],
  120: [{ cat: 'safety-margins', q: 'Your car has anti-lock brakes (ABS). In an emergency stop you should…', correct: 'Apply the footbrake firmly and keep it applied until you have slowed sufficiently', wrong: ['Pump the brake pedal rapidly', 'Brake gently to avoid triggering the system', 'Apply the handbrake at the same time'] }],
  121: [{ cat: 'safety-margins', q: 'After driving through deep water, what should you do?', correct: 'Test your brakes gently at the first safe opportunity', wrong: ['Drive faster to dry the brakes', 'Switch the engine off and on again', 'Apply the handbrake firmly several times'] }],
  122: [{ cat: 'safety-margins', q: 'Why is coasting (travelling in neutral or with the clutch down) discouraged?', correct: 'It removes engine braking and reduces your control of the vehicle', wrong: ['It causes the brakes to overheat immediately', 'It is illegal on all public roads', 'It increases fuel consumption sharply'] }],
  123: [{ cat: 'attitude', q: 'You are waiting in your car for a passenger. What does the Highway Code say about leaving the engine running?', correct: 'You MUST NOT leave the engine running unnecessarily while stationary on a public road', wrong: ['It is fine if you stay in the vehicle', 'It is fine for up to five minutes', 'It is only an offence in a smoke-control area'] }],
  124: [
    { cat: 'rules-of-the-road', q: 'Unless signs show otherwise, what speed limit usually applies on a road with street lighting?', correct: '30 mph', wrong: ['20 mph', '40 mph', 'The national speed limit'] },
  ],
  126: [
    { cat: 'safety-margins', q: 'On a dry road carrying fast-moving traffic, what is the minimum time gap you should leave to the vehicle in front?', correct: 'At least two seconds', wrong: ['At least one second', 'At least four seconds', 'One car length for every 10 mph'] },
    { cat: 'safety-margins', q: 'On a wet road, by how much should you increase the gap to the vehicle in front compared with a dry road?', correct: 'At least double it', wrong: ['Add one second', 'No change is needed if you have ABS', 'Reduce it so you can see their brake lights'] },
    { cat: 'safety-margins', q: 'On an icy road, stopping distances can be how much greater than on a dry road?', correct: 'Up to ten times greater', wrong: ['About twice as great', 'About four times as great', 'About twenty times as great'] },
  ],
  127: [{ cat: 'road-traffic-signs', q: 'The white centre-line markings on the road become longer with shorter gaps. What does this tell you?', correct: 'There is a hazard ahead', wrong: ['You are approaching a one-way street', 'Overtaking is now permitted', 'The speed limit has increased'] }],
  129: [{ cat: 'rules-of-the-road', q: 'You are on a road with a solid white line nearest to you. When may you cross it to overtake?', correct: 'To pass a pedal cycle, horse or road maintenance vehicle travelling at 10 mph or less', wrong: ['Whenever the road ahead is clear', 'Only at night when traffic is light', 'Never under any circumstances'] }],
  130: [{ cat: 'rules-of-the-road', q: 'An area of white chevrons on the road is bordered by a solid white line. What does this mean?', correct: 'You MUST NOT enter the area except in an emergency', wrong: ['You may use it to overtake if safe', 'It is reserved for motorcycles', 'It marks a cycle lane'] }],
  132: [
    { cat: 'motorway-rules', q: 'On a motorway at night you see red reflective road studs on your left. What do they mark?', correct: 'The left edge of the carriageway', wrong: ['The central reservation', 'A slip road', 'A contraflow lane'] },
    { cat: 'motorway-rules', q: 'What colour are the reflective studs between the lanes of a motorway?', correct: 'White', wrong: ['Red', 'Amber', 'Green'] },
    { cat: 'motorway-rules', q: 'What colour are the reflective studs along the central reservation of a motorway?', correct: 'Amber', wrong: ['Green', 'White', 'Red'] },
    { cat: 'motorway-rules', q: 'What colour are the reflective studs marking a slip road on a motorway?', correct: 'Green', wrong: ['Amber', 'Red', 'Blue'] },
  ],
  135: [{ cat: 'rules-of-the-road', q: 'When may you enter a box junction and wait?', correct: 'When turning right and only oncoming traffic, or other right-turning traffic, is preventing you from completing the turn', wrong: ['When the traffic ahead is slow-moving', 'When the lights are about to change', 'When your exit is blocked but you can fit in the box'] }],
  140: [{ cat: 'rules-of-the-road', q: 'A cycle lane is marked by a solid white line. During its hours of operation, what does this mean for drivers?', correct: 'You MUST NOT drive or park in it', wrong: ['You may use it to overtake on the left', 'You may park in it outside rush hour', 'You may stop briefly to set down passengers'] }],
  144: [{ cat: 'attitude', q: 'Which of these is a specific offence under the Road Traffic Act referred to in the Highway Code?', correct: 'Driving without reasonable consideration for other road users', wrong: ['Driving with an untidy interior', 'Driving with the radio on', 'Driving more slowly than the speed limit'] }],
  148: [{ cat: 'alertness', q: 'Which of these does the Highway Code list as a distraction you should avoid while driving?', correct: 'Arguing with your passengers or other road users', wrong: ['Listening to traffic reports', 'Looking far ahead along the road', 'Checking your mirrors frequently'] }],
  149: [
    { cat: 'alertness', q: 'When may you use a hand-held mobile phone while driving?', correct: 'Only to call 999 or 112 in a genuine emergency when it is unsafe or impractical to stop', wrong: ['When stopped at traffic lights', 'When driving below 20 mph', 'When using it as a sat-nav'] },
    { cat: 'alertness', q: 'You are supervising a learner driver. May you use a hand-held mobile phone?', correct: 'No — the same restrictions apply as if you were driving', wrong: ['Yes, because you are not driving', 'Yes, but only for short calls', 'Yes, but only on dual carriageways'] },
  ],
  151: [{ cat: 'attitude', q: 'In slow-moving traffic, what should you do?', correct: 'Leave enough room to manoeuvre if the vehicle in front breaks down', wrong: ['Move into the lane that is moving fastest', 'Drive close to the vehicle in front to stop others cutting in', 'Use the hard shoulder to make progress'] }],
  153: [{ cat: 'hazard-awareness', q: 'You see road humps and chicanes ahead. What are they designed to do?', correct: 'Slow traffic down', wrong: ['Test your suspension', 'Allow water to drain from the road', 'Separate cycle and motor traffic'] }],
  155: [{ cat: 'rules-of-the-road', q: 'On a single-track road you meet an oncoming vehicle near a passing place on your right. What should you do?', correct: 'Wait opposite the passing place so the other vehicle can enter it', wrong: ['Reverse until you find a passing place on your left', 'Drive onto the verge', 'Sound your horn and continue'] }],
  159: [{ cat: 'alertness', q: 'Before moving off from the side of the road you should look round to check the blind spots. Why?', correct: 'Mirrors do not cover every area around the vehicle', wrong: ['It is required by your insurer', 'It warms your neck muscles', 'To check your seat belt is fastened'] }],
  161: [{ cat: 'alertness', q: 'When should you use your mirrors?', correct: 'Frequently, and in good time before signalling, changing direction or speed', wrong: ['Only before overtaking', 'Only on motorways', 'Once every minute regardless of conditions'] }],
  163: [
    { cat: 'vulnerable-road-users', q: 'When overtaking a cyclist at up to 30 mph, what minimum passing distance does the Highway Code recommend?', correct: 'At least 1.5 metres', wrong: ['At least 0.5 metres', 'At least 1 metre', 'At least 3 metres'] },
    { cat: 'vulnerable-road-users', q: 'When passing a horse and rider, what speed and clearance does the Highway Code advise?', correct: 'No more than 10 mph, leaving at least 2 metres of space', wrong: ['No more than 20 mph, leaving 1 metre', '30 mph if the road is straight', 'Any speed if you sound your horn first'] },
  ],
  164: [{ cat: 'hazard-awareness', q: 'You want to overtake a long, slow lorry on a busy road. What should you do first?', correct: 'Drop back so you can see further ahead and the lorry driver can see you', wrong: ['Move up close so you can pull out quickly', 'Flash your headlights so the lorry moves over', 'Sound your horn before pulling out'] }],
  165: [{ cat: 'rules-of-the-road', q: 'In which situation MUST you NOT overtake?', correct: 'After a “No Overtaking” sign and before the sign cancelling it', wrong: ['On a one-way street', 'On a dual carriageway', 'When the vehicle ahead is travelling below the speed limit'] }],
  166: [{ cat: 'hazard-awareness', q: 'In which of these places does the Highway Code say you should NOT overtake because you cannot see far enough ahead?', correct: 'Approaching the brow of a hill', wrong: ['On a long straight dual carriageway', 'When the vehicle in front signals left', 'On a 30 mph road'] }],
  168: [{ cat: 'attitude', q: 'A vehicle behind is trying to overtake you. What should you do?', correct: 'Maintain a steady course and speed, slowing if necessary to let them pass', wrong: ['Speed up so they cannot pass', 'Move to the centre of the road', 'Brake sharply to warn them'] }],
  170: [{ cat: 'vulnerable-road-users', q: 'You are turning into a side road. Pedestrians are waiting to cross at the junction. What should you do?', correct: 'Give way to them — they have priority', wrong: ['Sound your horn and continue', 'Wave them across', 'Stop only if they have already stepped into the road'] }],
  171: [{ cat: 'rules-of-the-road', q: 'At a junction with a STOP sign and solid white line, what MUST you do?', correct: 'Stop behind the line, even if the road is clear, then move off when safe', wrong: ['Slow down and proceed if clear', 'Stop only if traffic is approaching', 'Give way to traffic from the right only'] }],
  175: [{ cat: 'rules-of-the-road', q: 'You are approaching traffic lights and the amber light shows on its own. What does it mean?', correct: 'Stop at the line — you may only continue if you have crossed it or stopping might cause a collision', wrong: ['Prepare to go — the lights will turn green', 'Proceed with caution', 'Stop only if pedestrians are crossing'] }],
  178: [{ cat: 'vulnerable-road-users', q: 'At traffic lights, what is the area marked between the two stop lines for?', correct: 'To allow cyclists to position themselves ahead of other traffic', wrong: ['A pedestrian refuge', 'A bus-only waiting area', 'A loading bay'] }],
  185: [{ cat: 'rules-of-the-road', q: 'When reaching a roundabout you should normally give priority to…', correct: 'Traffic approaching from your right, unless signs or markings say otherwise', wrong: ['Traffic already signalling left', 'Traffic on your left', 'Larger vehicles regardless of position'] }],
  186: [{ cat: 'rules-of-the-road', q: 'You are taking the second exit (straight ahead) at a roundabout. When should you signal left?', correct: 'After you have passed the exit before the one you want', wrong: ['On approach to the roundabout', 'As soon as you enter the roundabout', 'You should not signal at all'] }],
  191: [{ cat: 'rules-of-the-road', q: 'Within the zig-zag lines at a pedestrian crossing you MUST NOT…', correct: 'Park, or overtake the vehicle nearest the crossing', wrong: ['Use your horn', 'Drive faster than 20 mph', 'Stop to let pedestrians cross'] }],
  195: [{ cat: 'vulnerable-road-users', q: 'A pedestrian is waiting at a zebra crossing. What does the Highway Code say you should do?', correct: 'Slow down and give way to them', wrong: ['Continue — they only have priority once on the crossing', 'Sound your horn so they wait', 'Wave them across'] }],
  196: [{ cat: 'vulnerable-road-users', q: 'At a pelican crossing the amber light is flashing. What MUST you do?', correct: 'Give way to any pedestrians still on the crossing', wrong: ['Stop and wait for green', 'Drive on — flashing amber means go', 'Sound your horn to warn pedestrians'] }],
  199: [{ cat: 'vulnerable-road-users', q: 'How does the light sequence at a puffin crossing differ from a pelican crossing?', correct: 'There is no flashing amber phase — the sequence is the same as ordinary traffic lights', wrong: ['Red and amber show together before red', 'There are two green phases', 'A flashing green man is shown to drivers'] }],
  201: [{ cat: 'rules-of-the-road', q: 'Why does the Highway Code advise you to reverse INTO a driveway and drive OUT forwards?', correct: 'So you can see clearly when joining the road', wrong: ['It is a legal requirement', 'It uses less fuel', 'It is easier on the clutch'] }],
  203: [{ cat: 'rules-of-the-road', q: 'What does the Highway Code say about how far you may reverse?', correct: 'You MUST NOT reverse further than necessary', wrong: ['No more than two car lengths', 'No more than 20 metres', 'There is no limit on quiet roads'] }],
  204: [{ cat: 'vulnerable-road-users', q: 'According to the Highway Code, which road users are most at risk from road traffic?', correct: 'Pedestrians, cyclists, motorcyclists and horse riders', wrong: ['Lorry and bus drivers', 'Drivers of small cars', 'Drivers of older vehicles'] }],
  207: [{ cat: 'vulnerable-road-users', q: 'A pedestrian is carrying a white cane with a red band. What does this tell you?', correct: 'They are deaf as well as blind', wrong: ['They are blind only', 'They are a doctor on call', 'They have a learning disability'] }],
  208: [{ cat: 'hazard-awareness', q: 'You see a flashing amber light beneath a school warning sign. What does it mean?', correct: 'Children may be crossing the road ahead — slow down', wrong: ['No vehicles allowed during school hours', 'Stop and wait for the light to go out', 'School crossing patrol is not on duty'] }],
  210: [{ cat: 'vulnerable-road-users', q: 'A school crossing patrol steps into the road and shows a “Stop — children” sign. What MUST you do?', correct: 'Stop — it is an offence not to', wrong: ['Slow down and pass with care', 'Stop only if children are visible', 'Sound your horn and continue'] }],
  211: [{ cat: 'hazard-awareness', q: 'Why are motorcyclists and cyclists particularly hard to see at junctions?', correct: 'They are easily hidden by other vehicles and may be filtering through traffic', wrong: ['They never use lights', 'They always travel in the middle of the lane', 'They are required to ride on the pavement'] }],
  214: [{ cat: 'vulnerable-road-users', q: 'When passing animals on the road, what should you avoid doing?', correct: 'Sounding your horn, revving your engine or accelerating rapidly', wrong: ['Slowing down', 'Giving them plenty of room', 'Being prepared to stop'] }],
  215: [{ cat: 'vulnerable-road-users', q: 'You are overtaking a horse and rider. What clearance and speed does the Highway Code advise?', correct: 'At least 2 metres of space and a maximum speed of 10 mph', wrong: ['1 metre and 20 mph', '1.5 metres and 30 mph', 'Any clearance if the road is straight'] }],
  219: [{ cat: 'attitude', q: 'An emergency vehicle with flashing blue lights is approaching from behind. What should you do?', correct: 'Consider its likely route and let it pass while still complying with traffic signs', wrong: ['Stop immediately wherever you are', 'Speed up to clear the road ahead', 'Mount the kerb to get out of the way'] }],
  221: [{ cat: 'hazard-awareness', q: 'You are following a large articulated lorry. Why should you keep well back?', correct: 'The driver may not be able to see you in their mirrors', wrong: ['Lorries can stop more quickly than cars', 'You will save fuel', 'It is illegal to be within two car lengths of a lorry'] }],
  223: [{ cat: 'attitude', q: 'A bus is signalling to pull out from a bus stop ahead of you. What should you do?', correct: 'Give way to it if you can do so safely', wrong: ['Speed up to pass before it moves', 'Sound your horn so it waits', 'Pull out and overtake immediately'] }],
  225: [{ cat: 'hazard-awareness', q: 'A vehicle ahead is showing a flashing amber beacon. What does this indicate?', correct: 'A slow-moving or stationary vehicle, or an abnormal load — approach with caution', wrong: ['A police vehicle on patrol', 'A doctor on an emergency call', 'A vehicle that has broken down and must not be passed'] }],
  226: [
    { cat: 'safety-margins', q: 'You MUST use headlights when visibility is seriously reduced. The Highway Code defines this as generally being unable to see for more than…', correct: '100 metres', wrong: ['50 metres', '150 metres', '200 metres'] },
    { cat: 'safety-margins', q: 'After fog has cleared and visibility has improved, what MUST you do with your fog lights?', correct: 'Switch them off', wrong: ['Leave them on as a precaution', 'Switch them to dipped beam', 'Use them only on the rear'] },
  ],
  227: [{ cat: 'safety-margins', q: 'In wet weather, your steering suddenly feels light and unresponsive. What is the most likely cause and what should you do?', correct: 'Aquaplaning — ease off the accelerator and slow down gradually', wrong: ['Tyre blow-out — brake firmly', 'Brake fade — pump the brakes', 'Power steering failure — pull over and call for recovery'] }],
  230: [{ cat: 'safety-margins', q: 'On icy or snowy roads, by how much can stopping distances increase compared with dry roads?', correct: 'Up to ten times', wrong: ['Up to twice', 'Up to four times', 'Up to twenty times'] }],
  231: [{ cat: 'safety-margins', q: 'When driving on ice, the Highway Code advises you to drive at a slow speed in…', correct: 'As high a gear as possible', wrong: ['As low a gear as possible', 'Neutral, to avoid wheel spin', 'First gear at all times'] }],
  232: [{ cat: 'hazard-awareness', q: 'You are about to overtake a cyclist on a windy day near a gap in a hedge. Why should you allow extra room?', correct: 'A sudden gust could blow them off course', wrong: ['They may stop without warning', 'They may turn right', 'It is a legal requirement on windy days'] }],
  236: [{ cat: 'safety-margins', q: 'Why MUST you switch off rear fog lights when visibility improves?', correct: 'They can dazzle following drivers and obscure your brake lights', wrong: ['They drain the battery', 'They cause your headlights to dim', 'They are linked to the speed limiter'] }],
  237: [{ cat: 'hazard-awareness', q: 'After a long dry spell it starts to rain. Why might the road surface be especially slippery?', correct: 'Oil and rubber deposits on the surface mix with the rain', wrong: ['The tyres have hardened in the heat', 'The brakes have absorbed moisture', 'Rain neutralises the road salt'] }],
  238: [{ cat: 'rules-of-the-road', q: 'What do double yellow lines along the edge of the road mean?', correct: 'No waiting at any time', wrong: ['No waiting during the hours shown', 'No stopping at any time', 'Loading only'] }],
  239: [{ cat: 'vulnerable-road-users', q: 'The Highway Code recommends opening your car door with the hand furthest from it (the “Dutch Reach”). Why?', correct: 'It makes you turn and look for cyclists and other traffic before opening the door', wrong: ['It uses less effort', 'It prevents the door swinging fully open', 'It is required by law'] }],
  240: [{ cat: 'rules-of-the-road', q: 'On which of these MUST you NOT stop or park (except in an emergency)?', correct: 'The carriageway or hard shoulder of a motorway', wrong: ['A road with a single yellow line outside its hours of operation', 'A road with street lighting', 'A residential cul-de-sac'] }],
  243: [{ cat: 'rules-of-the-road', q: 'According to the Highway Code, you should NOT park within what distance of a junction (unless in an authorised space)?', correct: '10 metres (32 feet)', wrong: ['5 metres', '15 metres', '20 metres'] }],
  248: [{ cat: 'rules-of-the-road', q: 'At night, you MUST NOT park on a road facing against the direction of traffic flow unless…', correct: 'You are in a recognised parking space', wrong: ['You leave your sidelights on', 'The road has street lighting', 'You are within 10 metres of a junction'] }],
  249: [{ cat: 'rules-of-the-road', q: 'When MUST you display parking lights when parked on a road at night?', correct: 'When the speed limit on that road is greater than 30 mph', wrong: ['Whenever it is dark', 'Only on dual carriageways', 'Only if you are within 10 metres of a junction'] }],
  253: [
    { cat: 'motorway-rules', q: 'Which of these MUST NOT use a motorway?', correct: 'A motorcycle with an engine capacity under 50 cc', wrong: ['A car towing a trailer', 'A motorhome', 'A car with L plates driven under qualified supervision in a dual-control vehicle'] },
    { cat: 'motorway-rules', q: 'Holders of a provisional car licence may drive on a motorway only if…', correct: 'They are accompanied by an approved driving instructor in a car fitted with dual controls', wrong: ['They display L plates and drive below 60 mph', 'They have passed the theory test', 'They are over 21'] },
  ],
  257: [{ cat: 'motorway-rules', q: 'On a motorway, red lights are flashing above your lane and a red “X” is shown. What MUST you do?', correct: 'Do not drive in that lane beyond the signal', wrong: ['Reduce speed to 50 mph in that lane', 'Move into that lane to leave others clear', 'Continue but be prepared to stop'] }],
  259: [{ cat: 'motorway-rules', q: 'When joining a motorway from a slip road you should…', correct: 'Match your speed to the traffic in the left-hand lane and join when there is a safe gap', wrong: ['Stop at the end of the slip road and wait for a gap', 'Use the hard shoulder to build up speed', 'Force your way into the right-hand lane'] }],
  262: [{ cat: 'alertness', q: 'You start to feel drowsy on a motorway. What should you do?', correct: 'Leave at the next exit or service area and take a break', wrong: ['Stop on the hard shoulder for a rest', 'Open the window and turn up the radio', 'Drive faster to reach your destination sooner'] }],
  263: [{ cat: 'motorway-rules', q: 'You miss your intended exit on a motorway. What should you do?', correct: 'Carry on to the next exit', wrong: ['Reverse along the hard shoulder to the exit', 'Make a U-turn through the central reservation', 'Stop and wait for a gap to cross to the exit'] }],
  264: [{ cat: 'motorway-rules', q: 'On a three-lane motorway with no traffic ahead, which lane should you normally drive in?', correct: 'The left-hand lane', wrong: ['The middle lane', 'The right-hand lane', 'Whichever lane has the smoothest surface'] }],
  265: [{ cat: 'motorway-rules', q: 'On a three-lane motorway, which of these MUST NOT use the right-hand lane?', correct: 'A car towing a trailer', wrong: ['A motorcycle over 125 cc', 'A small van under 2 tonnes', 'A car carrying four passengers'] }],
  267: [{ cat: 'motorway-rules', q: 'In congested motorway traffic, the lane on your left is moving faster than yours. What does the Highway Code say?', correct: 'You may keep up with traffic in your lane even if it means passing vehicles on your right', wrong: ['You must change to the left lane to avoid undertaking', 'You must slow down to match the right-hand lane', 'You may use the hard shoulder to keep moving'] }],
  269: [{ cat: 'motorway-rules', q: 'On a smart motorway, what does a speed limit shown above the hard shoulder mean?', correct: 'You may use the hard shoulder as a running lane at that speed', wrong: ['The hard shoulder is closed to all traffic', 'Only HGVs may use the hard shoulder', 'You may stop on the hard shoulder for up to two minutes'] }],
  270: [{ cat: 'motorway-rules', q: 'When may you stop on a motorway hard shoulder?', correct: 'Only in an emergency, or when told to by police, traffic officers or signals', wrong: ['To check a map', 'To answer a phone call', 'To let a tired passenger drive'] }],
  272: [{ cat: 'motorway-rules', q: 'When leaving a motorway, when should you signal left?', correct: 'In good time, after moving into the left-hand lane', wrong: ['Only when you reach the slip road', 'At the 100-yard countdown marker only', 'You should not signal — the slip road makes it obvious'] }],
  273: [{ cat: 'motorway-rules', q: 'After leaving a motorway, why should you check your speedometer?', correct: 'Your speed may be higher than you realise', wrong: ['It may have been reset by the motorway signals', 'It is required by law within one mile', 'To recalibrate cruise control'] }],
  275: [
    { cat: 'accidents', q: 'Your vehicle breaks down on a road (not a motorway). How far behind it should you place a warning triangle?', correct: 'At least 45 metres (147 feet)', wrong: ['At least 10 metres', 'At least 25 metres', 'At least 100 metres'] },
    { cat: 'accidents', q: 'Where should you NEVER use a warning triangle?', correct: 'On a motorway', wrong: ['On a single carriageway', 'On a dual carriageway', 'On a road with a 30 mph limit'] },
  ],
  276: [{ cat: 'accidents', q: 'Your car develops a fault on a motorway and you stop on the hard shoulder. How should you position the vehicle?', correct: 'As far to the left as possible with the wheels turned to the left', wrong: ['Straddling the rumble strip so other drivers see you', 'With the wheels turned to the right', 'In the centre of the hard shoulder'] }],
  277: [{ cat: 'accidents', q: 'After stopping on a motorway hard shoulder, what should you and your passengers do?', correct: 'Leave the vehicle by the doors furthest from traffic and wait behind the safety barrier', wrong: ['Stay in the vehicle with seat belts on', 'Stand in front of the vehicle to warn traffic', 'Attempt repairs at the rear of the vehicle'] }],
  278: [{ cat: 'motorway-rules', q: 'After a breakdown on the hard shoulder, how should you rejoin the motorway?', correct: 'Build up speed on the hard shoulder and join when there is a safe gap', wrong: ['Wait for a flashing amber signal', 'Pull straight out and accelerate hard', 'Reverse to the previous slip road'] }],
  280: [{ cat: 'accidents', q: 'Something falls from your vehicle onto a motorway. What should you do?', correct: 'Pull into a place of relative safety and contact the emergency services — do not retrieve it yourself', wrong: ['Stop in the lane and pick it up quickly', 'Reverse along the hard shoulder to it', 'Leave it — other drivers will avoid it'] }],
  283: [{ cat: 'accidents', q: 'You stop to help at a road traffic incident. What is one of the first things you should do?', correct: 'Switch off vehicle engines and make sure no one is smoking', wrong: ['Move casualties out of vehicles immediately', 'Give casualties something warm to drink', 'Clear the wreckage off the road'] }],
  284: [{ cat: 'accidents', q: 'You arrive at an incident involving a tanker displaying hazard warning plates. What should you do?', correct: 'Keep well away, do not smoke and give the emergency services full details of the markings', wrong: ['Try to rescue casualties from the cab', 'Open the tanker valves to relieve pressure', 'Direct traffic past the scene'] }],
  285: [{ cat: 'accidents', q: 'You are involved in a collision that causes damage to another vehicle. What MUST you do?', correct: 'Stop and give your name, address and registration number to anyone with reasonable grounds to require them', wrong: ['Drive on if no one is injured', 'Report to your insurer within 14 days', 'Wait for the police to arrive before exchanging details'] }],
  286: [{ cat: 'accidents', q: 'After a reportable collision you did not exchange details at the scene. Within what time MUST you report it to the police?', correct: 'As soon as reasonably practicable, and in any case within 24 hours', wrong: ['Within 48 hours', 'Within 7 days', 'Only if someone was injured'] }],
  287: [{ cat: 'accidents', q: 'Your engine catches fire. What should you do?', correct: 'Get everyone out and away from the vehicle and call the fire brigade — do not open the bonnet', wrong: ['Open the bonnet and use a fire extinguisher', 'Drive to the nearest garage', 'Pour water onto the bonnet'] }],
  288: [{ cat: 'hazard-awareness', q: 'At road works a temporary speed limit is displayed. What does this mean?', correct: 'It is mandatory — you MUST NOT exceed it', wrong: ['It is advisory only', 'It applies only to HGVs', 'It applies only when workers are visible'] }],
  290: [{ cat: 'safety-margins', q: 'In a contraflow system at road works, what should you do?', correct: 'Reduce your speed and increase the distance to the vehicle in front', wrong: ['Maintain normal motorway speed', 'Switch on hazard warning lights', 'Use the closed lane to overtake'] }],
  293: [{ cat: 'hazard-awareness', q: 'You are crossing a level crossing when the amber light comes on. What should you do?', correct: 'Keep going — do not stop on the crossing', wrong: ['Stop immediately', 'Reverse off the crossing', 'Sound your horn and accelerate'] }],
  299: [{ cat: 'accidents', q: 'Your vehicle stalls on a level crossing and the warning bells start to ring. What should you do FIRST?', correct: 'Get yourself and any passengers out and clear of the crossing', wrong: ['Try to restart the engine', 'Push the vehicle clear', 'Phone the signal operator'] }],
  300: [{ cat: 'hazard-awareness', q: 'Why should you take extra care where trams operate?', correct: 'Trams move quietly and cannot steer to avoid you', wrong: ['Trams always have right of way over pedestrians', 'Tram tracks are always electrified', 'Trams travel faster than other traffic'] }],
};

/* Documents (Annex 3). */
const DOCUMENT_TEMPLATES: Template[] = [
  { q: 'How often must a car normally pass an MOT test once it is three years old?', correct: 'Every year', wrong: ['Every six months', 'Every two years', 'Every three years'] },
  { q: 'At what age does a car normally first require an MOT certificate?', correct: 'Three years from first registration', wrong: ['One year from first registration', 'Five years from first registration', 'When it has covered 30,000 miles'] },
  { q: 'What is the minimum level of motor insurance required to drive on public roads?', correct: 'Third-party cover', wrong: ['Third-party, fire and theft', 'Fully comprehensive', 'Personal accident cover'] },
  { q: 'A police officer asks to see your driving documents but you do not have them with you. What may you be required to do?', correct: 'Produce them at a police station within seven days', wrong: ['Produce them within 24 hours', 'Post copies to the DVLA', 'Show them to any officer within 14 days'] },
  { q: 'Under the New Drivers Act, your licence will be revoked if you reach how many penalty points within two years of passing your first test?', correct: 'Six or more', wrong: ['Three or more', 'Nine or more', 'Twelve or more'] },
  { q: 'Who may supervise a learner car driver on a public road?', correct: 'Someone aged at least 21 who has held a full licence for that category for at least three years', wrong: ['Anyone with a full licence', 'Anyone aged 25 or over', 'A driving instructor only'] },
  { q: 'What must you do if you keep an untaxed vehicle off the public road?', correct: 'Make a Statutory Off Road Notification (SORN)', wrong: ['Surrender the registration document', 'Display a “not in use” notice in the windscreen', 'Nothing, provided it is on private land'] },
  { q: 'When MUST L plates be displayed on a vehicle?', correct: 'Whenever it is being driven by a learner', wrong: ['For 12 months after passing the test', 'Only during driving lessons with an instructor', 'Whenever the driver is under 21'] },
];

/* Vehicle maintenance / safety (Annex 6). */
const VEHICLE_TEMPLATES: Template[] = [
  { q: 'What is the legal minimum tread depth for car tyres across the central three-quarters of the tread and around the entire circumference?', correct: '1.6 mm', wrong: ['1.0 mm', '2.0 mm', '2.5 mm'] },
  { q: 'Across what proportion of the tyre’s breadth must the legal minimum tread depth be present on a car?', correct: 'The central three-quarters', wrong: ['The entire width', 'The central half', 'The outer edges only'] },
  { q: 'Which fluid is it an offence to allow to run out if the system is fitted to the vehicle?', correct: 'Windscreen washer fluid', wrong: ['Power-steering fluid', 'Brake fluid', 'Engine coolant'] },
  { q: 'You notice excessive exhaust fumes from your vehicle. What should you do?', correct: 'Have the vehicle checked — driving with a defective exhaust is an offence', wrong: ['Rev the engine to clear it', 'Add fuel additive at the next fill-up', 'Ignore it unless the MOT is due'] },
  { q: 'Before a long winter journey, what should you check in addition to fuel and oil?', correct: 'Lights, tyres, coolant and screenwash', wrong: ['Air conditioning gas', 'Spare fuses only', 'Radio reception'] },
];

/* Vehicle loading (Rule 98 + practical). */
const LOADING_TEMPLATES: Template[] = [
  { q: 'You are carrying a heavy load on a roof rack. What effect is this most likely to have?', correct: 'Reduced stability, especially when cornering or in side winds', wrong: ['Improved braking', 'Better fuel economy', 'Lighter steering at high speed'] },
  { q: 'A trailer begins to snake from side to side while you are towing it. What should you do?', correct: 'Ease off the accelerator and reduce speed gradually', wrong: ['Brake firmly and hold the steering wheel tightly', 'Accelerate to pull it straight', 'Steer sharply in the opposite direction'] },
  { q: 'When loading a trailer, where should the heaviest items be placed?', correct: 'Low down and over the axle', wrong: ['At the very back', 'At the very front', 'As high as possible to lower the centre of gravity'] },
  { q: 'You are towing a caravan on a motorway. Which lane MUST you NOT use on a three-lane carriageway?', correct: 'The right-hand lane', wrong: ['The left-hand lane', 'The middle lane', 'Any lane during congestion'] },
  { q: 'When may a load project dangerously beyond the sides of your vehicle?', correct: 'Never — it MUST NOT stick out dangerously', wrong: ['When marked with a red flag', 'During daylight hours only', 'When travelling under 30 mph'] },
];

/* First aid (Annex 7). */
const FIRSTAID_TEMPLATES: Template[] = [
  { q: 'A casualty at a collision has a burn. For at least how long should you cool it with cool water?', correct: 'At least 20 minutes', wrong: ['At least 5 minutes', 'At least 10 minutes', 'At least 30 seconds'] },
  { q: 'When checking whether an unconscious casualty is breathing, for how long should you look, listen and feel?', correct: 'Up to 10 seconds', wrong: ['Up to 30 seconds', 'Up to 2 minutes', 'A single breath is enough'] },
  { q: 'A casualty is in shock after a collision. What should you do?', correct: 'Keep them warm and reassure them — do not give them anything to eat or drink', wrong: ['Give them a warm sweet drink', 'Walk them around to keep blood flowing', 'Leave them alone to recover'] },
  { q: 'In the DR ABC procedure, what does the “A” stand for?', correct: 'Airway', wrong: ['Alert', 'Ambulance', 'Assess'] },
  { q: 'A motorcyclist is lying unconscious in the road after a collision. Unless it is essential, why should you NOT remove their helmet?', correct: 'Removing it could worsen a neck or spinal injury', wrong: ['It is illegal to touch a casualty', 'It will make them colder', 'The helmet may be needed as evidence'] },
];

function* templateQuestions(): Generator<Question> {
  for (const [ruleStr, items] of Object.entries(RULE_TEMPLATES)) {
    const ruleNo = Number(ruleStr);
    const r = ruleIndex.get(ruleNo);
    const fallback = r ? SECTION_CATEGORY[r.sectionId] : 'rules-of-the-road';
    for (const t of items) {
      yield build(
        t.cat ?? fallback,
        t.q,
        t.correct,
        [...t.wrong],
        t.note ? `${t.note} (Highway Code rule ${ruleNo}.)` : explain(ruleNo),
        { rules: [ruleNo] },
      );
    }
  }
  for (const t of DOCUMENT_TEMPLATES) {
    yield build('documents', t.q, t.correct, [...t.wrong],
      `${t.correct}. Source: The Highway Code, Annex 3 (Motor vehicle documentation).`, {});
  }
  for (const t of VEHICLE_TEMPLATES) {
    yield build('vehicle-safety', t.q, t.correct, [...t.wrong],
      `${t.correct}. Source: The Highway Code, Annex 6 (Vehicle maintenance, safety and security).`, {});
  }
  for (const t of LOADING_TEMPLATES) {
    yield build('vehicle-loading', t.q, t.correct, [...t.wrong],
      `${t.correct}. (Highway Code rule 98 / Annex 6.)`, { rules: [98] });
  }
  for (const t of FIRSTAID_TEMPLATES) {
    yield build('accidents', t.q, t.correct, [...t.wrong],
      `${t.correct}. Source: The Highway Code, Annex 7 (First aid on the road).`, {});
  }
}

/* ──────────────────────────────────────────────────────────────────────── */
/* 5. Generic rule-recall questions                                         */
/*                                                                            */
/* For every rule that doesn’t already have a bespoke template, emit a       */
/* “What does Rule N tell you to do?” question whose correct answer is the   */
/* opening clause of the rule and whose distractors are opening clauses of   */
/* other rules in the same section. This pads the bank to ~750 while still   */
/* keeping every answer verifiable against the source text.                  */
/* ──────────────────────────────────────────────────────────────────────── */

function firstSentence(text: string): string {
  const m = text.match(/^[^.]{20,180}\./);
  return (m ? m[0] : text.slice(0, 160)).trim();
}

const RULE_CATEGORY_OVERRIDE: Record<number, Category> = {
  91: 'alertness', 93: 'alertness', 97: 'alertness', 105: 'alertness', 106: 'alertness',
  107: 'alertness', 148: 'alertness', 149: 'alertness', 150: 'alertness', 159: 'alertness',
  161: 'alertness', 254: 'alertness', 262: 'alertness',
  103: 'attitude', 110: 'attitude', 112: 'attitude', 123: 'attitude', 144: 'attitude',
  147: 'attitude', 151: 'attitude', 168: 'attitude', 219: 'attitude', 223: 'attitude',
  117: 'safety-margins', 118: 'safety-margins', 119: 'safety-margins', 120: 'safety-margins',
  121: 'safety-margins', 122: 'safety-margins', 125: 'safety-margins', 126: 'safety-margins',
  146: 'hazard-awareness', 153: 'hazard-awareness', 154: 'hazard-awareness', 164: 'hazard-awareness',
  166: 'hazard-awareness', 167: 'hazard-awareness', 208: 'hazard-awareness', 211: 'hazard-awareness',
  221: 'hazard-awareness', 222: 'hazard-awareness', 224: 'hazard-awareness', 225: 'hazard-awareness',
  232: 'hazard-awareness', 233: 'hazard-awareness', 234: 'hazard-awareness', 237: 'hazard-awareness',
  89: 'vehicle-safety', 99: 'vehicle-safety', 100: 'vehicle-safety', 101: 'vehicle-safety',
  113: 'vehicle-safety', 114: 'vehicle-safety', 229: 'vehicle-safety',
  98: 'vehicle-loading', 252: 'vehicle-loading',
  90: 'documents', 92: 'documents',
  127: 'road-traffic-signs', 128: 'road-traffic-signs', 129: 'road-traffic-signs',
  130: 'road-traffic-signs', 131: 'road-traffic-signs', 132: 'road-traffic-signs',
};

function categoryFor(rule: Rule): Category {
  return RULE_CATEGORY_OVERRIDE[rule.rule] ?? SECTION_CATEGORY[rule.sectionId] ?? 'rules-of-the-road';
}

function* recallQuestions(): Generator<Question> {
  const usedRules = new Set(Object.keys(RULE_TEMPLATES).map(Number));
  const bySection = new Map<string, Rule[]>();
  for (const r of rules) {
    const list = bySection.get(r.sectionId) ?? [];
    list.push(r);
    bySection.set(r.sectionId, list);
  }

  for (const r of rules) {
    const correct = firstSentence(r.text);
    const sectionPeers = (bySection.get(r.sectionId) ?? []).filter((p) => p.rule !== r.rule);
    const peerPool = sectionPeers.length >= 3 ? sectionPeers : rules.filter((p) => p.rule !== r.rule);
    const distractors = pickDistractors(peerPool.map((p) => firstSentence(p.text)), correct, 3, `recall:${r.rule}`);

    yield build(
      categoryFor(r),
      `Highway Code rule ${r.rule} is about “${SECTION_LABEL[r.sectionId]}”. Which statement is taken from this rule?`,
      correct,
      distractors,
      explain(r.rule),
      { rules: [r.rule] },
    );

    // For rules without a bespoke template, also emit an applied variant so
    // the bank isn’t dominated by literal-recall items.
    if (!usedRules.has(r.rule)) {
      yield build(
        categoryFor(r),
        appliedStem(r),
        correct,
        distractors,
        explain(r.rule),
        { rules: [r.rule] },
      );
    }
  }
}

const SECTION_LABEL: Record<string, string> = {
  pedestrians: 'rules for pedestrians',
  'powered-wheelchairs': 'powered wheelchairs and mobility scooters',
  animals: 'rules about animals',
  cyclists: 'rules for cyclists',
  motorcyclists: 'rules for motorcyclists',
  'drivers-and-motorcyclists': 'rules for drivers and motorcyclists',
  'general-rules': 'general rules, techniques and advice',
  'using-the-road': 'using the road',
  'road-users-requiring-extra-care': 'road users requiring extra care',
  'adverse-weather': 'driving in adverse weather',
  'waiting-and-parking': 'waiting and parking',
  motorways: 'motorways',
  'breakdowns-and-incidents': 'breakdowns and incidents',
  'roadworks-level-crossings-tramways': 'road works, level crossings and tramways',
};

function appliedStem(r: Rule): string {
  const verb = /MUST/.test(r.text) ? 'MUST you' : 'should you';
  return `According to the Highway Code (${SECTION_LABEL[r.sectionId]}), what ${verb} do?`;
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Assemble & write                                                          */
/* ──────────────────────────────────────────────────────────────────────── */

function main() {
  const all: Question[] = [
    ...signQuestions(),
    ...speedLimitQuestions(),
    ...stoppingDistanceQuestions(),
    ...templateQuestions(),
    ...recallQuestions(),
  ];

  // De-duplicate (identical question + correct answer).
  const seen = new Set<string>();
  const deduped = all.filter((q) => {
    const key = `${q.question}::${q.options[q.correctIndex]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Group by category.
  const byCat = new Map<Category, Question[]>();
  for (const q of deduped) {
    const list = byCat.get(q.category) ?? [];
    list.push(q);
    byCat.set(q.category, list);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest: Record<string, number> = {};
  for (const [cat, qs] of byCat) {
    fs.writeFileSync(path.join(OUT_DIR, `${cat}.json`), JSON.stringify(qs, null, 2));
    manifest[cat] = qs.length;
  }
  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), total: deduped.length, byCategory: manifest }, null, 2),
  );

  console.log(`Generated ${deduped.length} questions across ${byCat.size} categories.`);
  for (const [cat, n] of Object.entries(manifest)) console.log(`  ${cat.padEnd(24)} ${n}`);
}

main();
