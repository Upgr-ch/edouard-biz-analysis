import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distSpa = path.join(root, "dist-spa");
const distVike = path.join(root, "dist-vike");
const distTmp = path.join(root, "dist-tmp");
const distPublic = path.join(root, "dist", "public");
const distBackup = path.join(root, "dist", "public-before-option-c");
const requiredVikePages = [
  "index.html",
  "cgu/index.html",
  "cgv/index.html",
  "mentions-legales/index.html",
  "confidentialite/index.html",
  "cookies/index.html",
];
const requiredPublicFiles = [
  "robots.txt",
  "llms.txt",
  "sitemap.xml",
  "favicon.ico",
  "favicon.svg",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
];

function fail(message) {
  throw new Error(message);
}

function assertNonEmpty(filePath) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    fail(`Missing required file: ${path.relative(root, filePath)}`);
  }
  if (statSync(filePath).size === 0) {
    fail(`Required file is empty: ${path.relative(root, filePath)}`);
  }
}

function run(label, command, args, env) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
  if (result.status !== 0) {
    fail(`${label} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute) : [absolute];
  });
}

function validateReferences(htmlPath) {
  const html = readFileSync(htmlPath, "utf8");
  const references = [
    ...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g),
  ].map((match) => match[1]);

  for (const reference of references) {
    if (
      reference.startsWith("#") ||
      reference.startsWith("http://") ||
      reference.startsWith("https://") ||
      reference.startsWith("mailto:") ||
      reference.startsWith("tel:") ||
      reference.startsWith("data:")
    ) {
      continue;
    }

    const cleanReference = reference.split(/[?#]/, 1)[0];
    if (!cleanReference) continue;

    let target;
    if (cleanReference.startsWith("/assets/")) {
      target = path.join(distTmp, cleanReference.slice(1));
    } else if (cleanReference.startsWith("./") || cleanReference.startsWith("../")) {
      target = path.resolve(path.dirname(htmlPath), cleanReference);
    } else {
      continue;
    }

    if (!existsSync(target)) {
      fail(
        `Broken reference in ${path.relative(distTmp, htmlPath)}: ${reference}`,
      );
    }
  }
}

function resolveStaticRoute(urlPath) {
  const pathname = urlPath.replace(/\/+$/, "") || "/";
  const exact = pathname === "/"
    ? path.join(distTmp, "index.html")
    : path.join(distTmp, pathname.slice(1), "index.html");
  return existsSync(exact) ? exact : path.join(distTmp, "legacy-spa.html");
}

function validateRouting() {
  const cases = [
    ["/", "index.html"],
    ["/cgu", "cgu/index.html"],
    ["/cgv", "cgv/index.html"],
    ["/mentions-legales", "mentions-legales/index.html"],
    ["/confidentialite", "confidentialite/index.html"],
    ["/cookies", "cookies/index.html"],
    ["/auth", "legacy-spa.html"],
    ["/auth/sign-up", "legacy-spa.html"],
    ["/admin", "legacy-spa.html"],
    ["/route-inconnue", "legacy-spa.html"],
  ];

  console.log("\n== Routing validation on dist-tmp ==");
  console.log("URL\tEXPECTED\tOBTAINED\tSTATUS");
  for (const [url, expected] of cases) {
    const obtained = path.relative(distTmp, resolveStaticRoute(url));
    const status = obtained === expected ? "PASS" : "FAIL";
    console.log(`${url}\t${expected}\t${obtained}\t${status}`);
    if (status === "FAIL") {
      fail(`Routing validation failed for ${url}.`);
    }
  }
}

if (!process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim()) {
  fail("Preflight failed: VITE_CLERK_PUBLISHABLE_KEY is required.");
}

rmSync(distSpa, { force: true, recursive: true });
rmSync(distVike, { force: true, recursive: true });
rmSync(distTmp, { force: true, recursive: true });
rmSync(distBackup, { force: true, recursive: true });

run(
  "Historical SPA build",
  "pnpm",
  ["exec", "vite", "build", "--config", "vite.config.build.ts"],
  { UPGRADE_BUILD_TARGET: "spa" },
);
run(
  "Vike SSG build",
  "pnpm",
  ["exec", "vike", "build"],
  {
    UPGRADE_BUILD_TARGET: "vike",
    VITE_CONFIG: "vite.config.build.ts",
  },
);

const vikeClient = path.join(distVike, "client");
assertNonEmpty(path.join(distSpa, "index.html"));
if (!existsSync(vikeClient)) {
  fail("Vike client output is missing.");
}

mkdirSync(distTmp, { recursive: true });
cpSync(vikeClient, distTmp, { recursive: true });
cpSync(path.join(distSpa, "index.html"), path.join(distTmp, "legacy-spa.html"));
if (existsSync(path.join(distSpa, "assets"))) {
  cpSync(path.join(distSpa, "assets"), path.join(distTmp, "assets"), {
    recursive: true,
  });
}

for (const page of requiredVikePages) {
  assertNonEmpty(path.join(distTmp, page));
}
assertNonEmpty(path.join(distTmp, "legacy-spa.html"));
for (const publicFile of requiredPublicFiles) {
  assertNonEmpty(path.join(distTmp, publicFile));
}

const assetFiles = listFiles(path.join(distTmp, "assets"));
const spaAssets = listFiles(path.join(distSpa, "assets"));
const vikeAssets = listFiles(path.join(vikeClient, "assets"));
if (spaAssets.length === 0 || vikeAssets.length === 0 || assetFiles.length === 0) {
  fail("SPA and Vike assets must all be present.");
}

for (const htmlFile of [
  ...requiredVikePages,
  "legacy-spa.html",
].map((file) => path.join(distTmp, file))) {
  validateReferences(htmlFile);
}
validateRouting();

console.log("\n== Atomic swap ==");
let publicMoved = false;
try {
  if (existsSync(distPublic)) {
    renameSync(distPublic, distBackup);
    publicMoved = true;
  }
  renameSync(distTmp, distPublic);
  rmSync(distBackup, { force: true, recursive: true });
} catch (error) {
  if (existsSync(distPublic)) {
    rmSync(distPublic, { force: true, recursive: true });
  }
  if (publicMoved && existsSync(distBackup)) {
    renameSync(distBackup, distPublic);
  }
  throw error;
}

console.log("Production output assembled and swapped successfully.");