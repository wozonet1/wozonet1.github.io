import { createPublicEntry } from "./public-entry-files.mjs";

const content = process.argv.slice(2).join(" ").trim();
if (!content) {
  console.error('请提供公开状态内容，例如：moment-public "今天重新整理了首页"');
  process.exit(1);
}

try {
  const file = await createPublicEntry({ kind: "moments", content });
  console.log(file);
  console.log("已创建公开状态，但尚未暂存、提交或推送。请检查内容后运行 moment-sync-public。");
} catch (error) {
  console.error(error?.message ?? String(error));
  process.exit(1);
}
