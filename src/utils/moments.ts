import type { CollectionEntry } from "astro:content";

export type MomentEntry = CollectionEntry<"moments">;
export type DailyNoteEntry = CollectionEntry<"dailyNotes">;

export interface MomentRecord {
  kind: "moment";
  entry: MomentEntry;
  createdAt: Date;
  dayKey: string;
  timeLabel: string;
  hour: number;
  tone: "morning" | "day" | "evening" | "night";
}

export interface DailyNoteRecord {
  kind: "note";
  entry: DailyNoteEntry;
  createdAt: Date;
  dayKey: string;
  timeLabel: string;
  hour: number;
}

export type DailyRecord = MomentRecord | DailyNoteRecord;

export interface DailyDay {
  key: string;
  date: Date;
  items: DailyRecord[];
  moments: MomentRecord[];
  notes: DailyNoteRecord[];
  weather?: string;
  tags: string[];
}

const TIMED_ENTRY_ID =
  /(?:^|\/)(\d{4})\/(\d{2})\/(\d{2})\/(\d{2})-(\d{2})(?:-(\d{2}))?(?:\.(?:md|mdx))?$/;

function toneForHour(hour: number): MomentRecord["tone"] {
  if (hour < 11) return "morning";
  if (hour < 17) return "day";
  if (hour < 21) return "evening";
  return "night";
}

function parseTimedEntryId(id: string, label: string) {
  const normalizedId = id.replaceAll("\\", "/");
  const match = normalizedId.match(TIMED_ENTRY_ID);

  if (!match) {
    throw new Error(
      `${label}文件路径必须是 YYYY/MM/DD/HH-mm-ss.md，当前为：${id}`,
    );
  }

  const [, year, month, day, hourText, minute, second = "00"] = match;
  const dayKey = `${year}-${month}-${day}`;
  const timeLabel = `${hourText}:${minute}`;
  const hour = Number(hourText);

  return {
    dayKey,
    timeLabel,
    hour,
    createdAt: new Date(`${dayKey}T${hourText}:${minute}:${second}+08:00`),
  };
}

export function toMomentRecord(entry: MomentEntry): MomentRecord {
  const time = parseTimedEntryId(entry.id, "状态");

  return {
    kind: "moment",
    entry,
    ...time,
    tone: toneForHour(time.hour),
  };
}

export function toDailyNoteRecord(entry: DailyNoteEntry): DailyNoteRecord {
  return {
    kind: "note",
    entry,
    ...parseTimedEntryId(entry.id, "随记"),
  };
}

export function sortMoments(entries: MomentEntry[]): MomentRecord[] {
  return entries
    .map(toMomentRecord)
    .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
}

export function groupDailyEntriesByDay(
  momentEntries: MomentEntry[],
  noteEntries: DailyNoteEntry[],
): DailyDay[] {
  const records: DailyRecord[] = [
    ...momentEntries.map(toMomentRecord),
    ...noteEntries.map(toDailyNoteRecord),
  ].sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
  const groups = new Map<string, DailyRecord[]>();

  for (const record of records) {
    const day = groups.get(record.dayKey) ?? [];
    day.push(record);
    groups.set(record.dayKey, day);
  }

  return Array.from(groups, ([key, recordsForDay]) => {
    const items = recordsForDay.slice().reverse();
    const moments = items.filter(
      (item): item is MomentRecord => item.kind === "moment",
    );
    const notes = items.filter(
      (item): item is DailyNoteRecord => item.kind === "note",
    );

    return {
      key,
      date: new Date(`${key}T12:00:00+08:00`),
      items,
      moments,
      notes,
      weather: moments.find(({ entry }) => entry.data.weather)?.entry.data.weather,
      tags: Array.from(
        new Set(items.flatMap(({ entry }) => entry.data.tags)),
      ),
    };
  });
}

export function groupMomentsByDay(entries: MomentEntry[]): DailyDay[] {
  return groupDailyEntriesByDay(entries, []);
}
