import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const vikeClientDirectory = join(projectRoot, "dist-vike", "client");
const legacyDirectory = join(projectRoot, "dist-spa");
const temporaryDirectory = join(projectRoot, "dist-tmp");
const publicDirectory = join(projectRoot, "dist", "public");
const backupDirectory = join(projectRoot, "dist", "public-backup");

const prerenderedDocuments = [
  "index.html",
  "mentions-legales/index.html",
  "cgu/index.html",
  "cgv/index.html",
  "confidentialite/index.html",
  "cookies/index.html",
];

const pageContexts = [
  "index.pageContext.json",
  "mentions-legales/index.pageContext.json",
  "cgu/index.pageContext.json",
  "cgv/index.pageContext.json",
  "confidentialite/index.pageContext.json",
  "cookies/index.pageContext.json",
];

const mandatoryPublicFiles = [
  "robots.txt",
  "llms.txt",
  "sitemap.xml",
  "favicon.ico",
  "favicon.svg",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "og-image.png",
  "opengraph.jpg",
  "placeholder.svg",
];

const historicalAssetDigests = {
  "assets/index-DPnulqQV.css":
    "509af79ea8633b6429b37b8823050eba3bb8e1657422519afd28cd3f0996a7ba",
  "assets/index-BStk2gEK.js":
    "97c8e033e0cbdc4cc02f1e0d1eeaccbec7acceeb9a4f0fee7de67c762c4dd5dc",
};

function fail(message) {
  throw new Error(`[publish-static-output] ${message}`);
}

function assertFile(root, relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    fail(`Missing required file: ${relative(root, filePath)}`);
  }
}

function digest(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function copyWithCollisionCheck(source, destination) {
  if (existsSync(destination)) {
    if (digest(source) !== digest(destination)) {
      fail(`Asset collision with different content: ${relative(temporaryDirectory, destination)}`);
    }
    return;
  }

  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolutePath) : [absolutePath];
  });
}

function validateOutput() {
  for (const document of prerenderedDocuments) {
    assertFile(temporaryDirectory, document);
  }

  for (const pageContext of pageContexts) {
    assertFile(temporaryDirectory, pageContext);
  }

  for (const publicFile of mandatoryPublicFiles) {
    assertFile(temporaryDirectory, publicFile);
  }

  assertFile(temporaryDirectory, "legacy-spa.html");

  for (const [asset, expectedDigest] of Object.entries(
    historicalAssetDigests,
  )) {
    assertFile(temporaryDirectory, asset);
    const actualDigest = digest(join(temporaryDirectory, asset));
    if (actualDigest !== expectedDigest) {
      fail(`Historical asset changed: ${asset}`);
    }
  }

  const legacyDigest = digest(join(temporaryDirectory, "legacy-spa.html"));
  for (const document of prerenderedDocuments) {
    if (digest(join(temporaryDirectory, document)) === legacyDigest) {
      fail(`Prerendered document was replaced by the SPA fallback: ${document}`);
    }
  }

  const htmlFiles = walkFiles(temporaryDirectory).filter((filePath) =>
    filePath.endsWith(".html"),
  );

  for (const htmlFile of htmlFiles) {
    const html = readFileSync(htmlFile, "utf8");
    const localAssetReferences = [
      ...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g),
    ].map((match) => match[1]);

    for (const assetReference of localAssetReferences) {
      assertFile(temporaryDirectory, assetReference.slice(1));
    }
  }
}

function promoteOutput() {
  mkdirSync(dirname(publicDirectory), { recursive: true });
  rmSync(backupDirectory, { force: true, recursive: true });

  if (existsSync(publicDirectory)) {
    renameSync(publicDirectory, backupDirectory);
  }

  try {
    renameSync(temporaryDirectory, publicDirectory);
    rmSync(backupDirectory, { force: true, recursive: true });
  } catch (error) {
    rmSync(publicDirectory, { force: true, recursive: true });
    if (existsSync(backupDirectory)) {
      renameSync(backupDirectory, publicDirectory);
    }
    throw error;
  }
}

if (!existsSync(vikeClientDirectory)) {
  fail("The Vike client build is missing.");
}

assertFile(legacyDirectory, "index.html");

rmSync(temporaryDirectory, { force: true, recursive: true });
mkdirSync(temporaryDirectory, { recursive: true });
cpSync(vikeClientDirectory, temporaryDirectory, { recursive: true });

const legacyAssetsDirectory = join(legacyDirectory, "assets");
if (!existsSync(legacyAssetsDirectory)) {
  fail("The historical SPA assets directory is missing.");
}

for (const source of walkFiles(legacyAssetsDirectory)) {
  const destination = join(
    temporaryDirectory,
    "assets",
    relative(legacyAssetsDirectory, source),
  );
  copyWithCollisionCheck(source, destination);
}

copyFileSync(
  join(legacyDirectory, "index.html"),
  join(temporaryDirectory, "legacy-spa.html"),
);

validateOutput();
promoteOutput();

console.log(
  `[publish-static-output] Validated and promoted ${prerenderedDocuments.length} prerendered HTML documents, the historical SPA fallback, and all required public files.`,
);