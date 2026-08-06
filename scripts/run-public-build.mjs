import path from "node:path";
import { spawnSync } from "node:child_process";

const astroCli = path.join(
  process.cwd(),
  "node_modules",
  "astro",
  "bin",
  "astro.mjs",
);
const publicEnv = {
  ...process.env,
  WOZONET_SITE_MODE: "public",
  PUBLIC_SITE_MODE: "public",
};
delete publicEnv.WOZONET_CONTENT_ROOT;
delete publicEnv.WOZONET_DAYLOG_ROOT;
delete publicEnv.WOZONET_LIFE_ROOT;
delete publicEnv.WOZONET_DIARY_ROOT;

for (const command of ["check", "build"]) {
  const result = spawnSync(process.execPath, [astroCli, command], {
    cwd: process.cwd(),
    env: publicEnv,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
