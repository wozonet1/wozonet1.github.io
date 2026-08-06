import { createPublicEntry } from "./public-entry-files.mjs";

try {
  console.log(await createPublicEntry({ kind: "daily-notes" }));
} catch (error) {
  console.error(error?.message ?? String(error));
  process.exit(1);
}
