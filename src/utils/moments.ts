import type { CollectionEntry } from "astro:content";

export type MomentEntry = CollectionEntry<"moments">;

export interface MomentRecord {
  entry: MomentEntry;
  createdAt: Date;
  dayKey: string;
  timeLabel: string;
  hour: number;
  tone: "morning" | "day" | "evening" | "night";
}

export interface MomentDay {
  key: string;
  date: Date;
  moments: MomentRecord[];
  weather?: string;
  tags: string[];
}

const MOMENT_ID =
  /(?:^|\/)(\d{4})\/(\d{2})\/(\d{2})\/(\d{2})-(\d{2})(?:-(\d{2}))?(?:\.(?:md|mdx))?$/;

function toneForHour(hour: number): MomentRecord["tone"] {
  if (hour < 11) return "morning";
  if (hour < 17) return "day";
  if (hour < 21) return "evening";
  return "night";
}

export function toMomentRecord(entry: MomentEntry): MomentRecord {
  const normalizedId = entry.id.replaceAll("\\", "/");
  const match = normalizedId.match(MOMENT_ID);

  if (!match) {
    throw new Error(
      `状态文件路径必须是 moments/YYYY/MM/DD/HH-mm-ss.md，当前为：${entry.id}`,
    );
  }

  const [, year, month, day, hourText, minute, second = "00"] = match;
  const dayKey = `${year}-${month}-${day}`;
  const timeLabel = `${hourText}:${minute}`;
  const hour = Number(hourText);

  return {
    entry,
    dayKey,
    timeLabel,
    hour,
    tone: toneForHour(hour),
    createdAt: new Date(`${dayKey}T${hourText}:${minute}:${second}+08:00`),
  };
}

export function sortMoments(entries: MomentEntry[]): MomentRecord[] {
  return entries
    .map(toMomentRecord)
    .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
}

export function groupMomentsByDay(entries: MomentEntry[]): MomentDay[] {
  const groups = new Map<string, MomentRecord[]>();

  for (const moment of sortMoments(entries)) {
    const day = groups.get(moment.dayKey) ?? [];
    day.push(moment);
    groups.set(moment.dayKey, day);
  }

  return Array.from(groups, ([key, moments]) => {
    const chronologicalMoments = moments.slice().reverse();

    return {
      key,
      date: new Date(`${key}T12:00:00+08:00`),
      moments: chronologicalMoments,
      weather: moments.find(({ entry }) => entry.data.weather)?.entry.data.weather,
      tags: Array.from(
        new Set(chronologicalMoments.flatMap(({ entry }) => entry.data.tags)),
      ),
    };
  });
}
