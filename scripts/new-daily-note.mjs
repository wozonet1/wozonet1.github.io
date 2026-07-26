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

const parts = Object.fromEntries(
  formatter
    .formatToParts(new Date())
    .filter(({ type }) => type !== "literal")
    .map(({ type, value }) => [type, value]),
);

const directory = path.join(
  process.cwd(),
  "src",
  "content",
  "daily-notes",
  parts.year,
  parts.month,
  parts.day,
);
const file = path.join(directory, `${parts.hour}-${parts.minute}-${parts.second}.md`);

await mkdir(directory, { recursive: true });
await writeFile(file, "", { encoding: "utf8", flag: "wx" });

console.log(file);
