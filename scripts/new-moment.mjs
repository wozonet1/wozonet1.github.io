import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const shouldPublish = args[0] === "--publish";
const content = (shouldPublish ? args.slice(1) : args).join(" ").trim();

if (shouldPublish && !content) {
  console.error('请提供状态内容，例如：moment "今天重新整理了首页"');
  process.exit(1);
}

if (shouldPublish) {
  try {
    execFileSync(
      "git",
      ["cat-file", "-e", "@{upstream}:src/utils/moments.ts"],
      { stdio: "ignore" },
    );
  } catch {
    console.error(
      "远端网站还没有状态系统。请先提交并推送当前的日常页面基础版本，再使用 moment 快速发布。",
    );
    process.exit(1);
  }
}

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
  "moments",
  parts.year,
  parts.month,
  parts.day,
);
const file = path.join(directory, `${parts.hour}-${parts.minute}-${parts.second}.md`);

await mkdir(directory, { recursive: true });
await writeFile(file, content ? `${content}\n` : "", {
  encoding: "utf8",
  flag: "wx",
});

const relativeFile = path.relative(process.cwd(), file);
console.log(`已创建 ${relativeFile}`);

if (shouldPublish) {
  const commitMessage = `moment: ${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;

  execFileSync("git", ["add", "--", relativeFile], { stdio: "inherit" });
  execFileSync(
    "git",
    ["commit", "--only", "-m", commitMessage, "--", relativeFile],
    { stdio: "inherit" },
  );
  execFileSync("git", ["push"], { stdio: "inherit" });

  console.log("状态已推送，GitHub Actions 会自动更新网站。");
}
