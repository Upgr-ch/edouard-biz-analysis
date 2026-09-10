import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const generatedDirectories = ["dist-spa", "dist-vike", "dist-tmp"];

for (const directory of generatedDirectories) {
  rmSync(new URL(`../${directory}`, import.meta.url), {
    force: true,
    recursive: true,
  });
}

function run(label, command, args, extraEnvironment = {}) {
  console.log(`\n[production-build] ${label}`);

  const result = spawnSync(command, args, {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      ...extraEnvironment,
    },
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(
  "Building the historical SPA fallback",
  "pnpm",
  ["exec", "vite", "build", "--config", "vite.config.ts"],
  { LEGACY_FALLBACK_BUILD: "1" },
);

run(
  "Building the Vike static site",
  "pnpm",
  ["exec", "vike", "build"],
  { VIKE_PARALLEL_BUILD: "1" },
);

run(
  "Assembling and validating static output",
  process.execPath,
  ["scripts/publish-static-output.mjs"],
);