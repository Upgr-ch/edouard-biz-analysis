import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const projectRoot = new URL("..", import.meta.url);
const buildEnvironment = {
  ...process.env,
  PORT: process.env.PORT || "3000",
};

for (const directory of ["dist-spa", "dist-vike", "dist-tmp"]) {
  rmSync(new URL(`../${directory}`, import.meta.url), {
    force: true,
    recursive: true,
  });
}

function run(label, command, args, extraEnvironment = {}) {
  console.log(`\n[production-build] ${label}`);

  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: {
      ...buildEnvironment,
      ...extraEnvironment,
    },
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
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