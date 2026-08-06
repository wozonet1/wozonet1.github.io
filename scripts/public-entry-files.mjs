import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function getPublicSiteRoot() {
  return path.resolve(process.env.WOZONET_SITE ?? process.cwd());
}

export async function createPublicEntry({ kind, content = "", date = new Date() }) {
  if (!new Set(["moments", "daily-notes"]).has(kind)) {
    throw new Error(`不支持的公开记录类型：${kind}`);
  }

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
  const directory = path.join(
    getPublicSiteRoot(),
    "src",
    "content",
    kind,
    parts.year,
    parts.month,
    parts.day,
  );
  const file = path.join(directory, `${parts.hour}-${parts.minute}-${parts.second}.md`);

  await mkdir(directory, { recursive: true });
  await writeFile(file, content ? `${content.trim()}\n` : "", {
    encoding: "utf8",
    flag: "wx",
  });
  return file;
}
