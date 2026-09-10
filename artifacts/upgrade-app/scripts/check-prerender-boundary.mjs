import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const artifactRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(artifactRoot, "src");

const forbiddenPackages = [
  "@clerk/",
  "jspdf",
  "pdfjs-dist",
];

const forbiddenPaths = [
  "/src/client/",
  "/src/components/ChatPanel.",
  "/src/hooks/useAuth.",
  "/src/lib/analytics.",
  "/src/lib/anonymousChat.",
  "/src/lib/generateReport.",
  "/src/pages/Admin.",
  "/src/App.",
  "/src/main.",
];

const forbiddenSyntax = [
  { label: "window", pattern: /\bwindow\b/ },
  { label: "document", pattern: /\bdocument\b/ },
  { label: "localStorage", pattern: /\blocalStorage\b/ },
  { label: "sessionStorage", pattern: /\bsessionStorage\b/ },
  { label: "network fetch", pattern: /\bfetch\s*\(/ },
  { label: "Clerk hook/provider", pattern: /\b(?:ClerkProvider|useClerk|useUser)\b/ },
];

const importPattern =
  /(?:import|export)\s+(?:[^"'()]*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

function normalize(filePath) {
  return filePath.split(path.sep).join("/");
}

function lineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function resolveLocalImport(importer, specifier) {
  let candidate;
  if (specifier.startsWith("@/")) {
    candidate = path.join(sourceRoot, specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    candidate = path.resolve(path.dirname(importer), specifier);
  } else {
    return null;
  }

  const candidates = [
    candidate,
    `${candidate}.ts`,
    `${candidate}.tsx`,
    `${candidate}.js`,
    `${candidate}.jsx`,
    `${candidate}.mjs`,
    path.join(candidate, "index.ts"),
    path.join(candidate, "index.tsx"),
    path.join(candidate, "index.js"),
  ];

  return candidates.find((filePath) => fs.existsSync(filePath)) ?? null;
}

function scanGraph(entryFiles) {
  const queue = [...entryFiles];
  const visited = new Set();
  const violations = [];

  while (queue.length > 0) {
    const filePath = queue.shift();
    if (visited.has(filePath)) continue;
    visited.add(filePath);

    const source = fs.readFileSync(filePath, "utf8");
    const normalizedFile = normalize(filePath);

    for (const rule of forbiddenSyntax) {
      const match = rule.pattern.exec(source);
      rule.pattern.lastIndex = 0;
      if (match) {
        violations.push({
          file: normalizedFile,
          line: lineNumber(source, match.index),
          reason: `forbidden server syntax: ${rule.label}`,
        });
      }
    }

    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2];
      const forbiddenPackage = forbiddenPackages.find((prefix) =>
        specifier.startsWith(prefix),
      );
      if (forbiddenPackage) {
        violations.push({
          file: normalizedFile,
          line: lineNumber(source, match.index),
          reason: `forbidden package import: ${specifier}`,
        });
      }

      const resolved = resolveLocalImport(filePath, specifier);
      if (!resolved) continue;

      const normalizedResolved = normalize(resolved);
      const forbiddenPath = forbiddenPaths.find((fragment) =>
        normalizedResolved.includes(fragment),
      );
      if (forbiddenPath) {
        violations.push({
          file: normalizedFile,
          line: lineNumber(source, match.index),
          reason: `forbidden client import: ${specifier}`,
        });
        continue;
      }

      queue.push(resolved);
    }
  }

  return { filesChecked: visited.size, violations };
}

function printReport(label, result) {
  console.log(`Prerender boundary check: ${label}`);
  console.log(`Files checked: ${result.filesChecked}`);
  console.log(`Violations: ${result.violations.length}`);

  for (const violation of result.violations) {
    console.log(
      `KO ${violation.file}:${violation.line} — ${violation.reason}`,
    );
  }

  console.log(result.violations.length === 0 ? "RESULT: OK" : "RESULT: KO");
}

function runSelfTest() {
  const safeSource = 'import React from "react";\nexport const value = 1;\n';
  const unsafeSource =
    'import { ClerkProvider } from "@clerk/react";\nfetch("/api/chat");\n';
  const temporaryDirectory = fs.mkdtempSync(
    path.join(process.env.TMPDIR ?? "/tmp", "edouard-boundary-"),
  );
  const safeFile = path.join(temporaryDirectory, "safe.ts");
  const unsafeFile = path.join(temporaryDirectory, "unsafe.ts");

  try {
    fs.writeFileSync(safeFile, safeSource);
    fs.writeFileSync(unsafeFile, unsafeSource);

    const safeResult = scanGraph([safeFile]);
    const unsafeResult = scanGraph([unsafeFile]);
    printReport("self-test safe fixture", safeResult);
    printReport("self-test forbidden fixture", unsafeResult);

    if (
      safeResult.violations.length !== 0 ||
      unsafeResult.violations.length < 2
    ) {
      console.error("SELF-TEST: KO");
      process.exitCode = 1;
      return;
    }

    console.log("SELF-TEST: OK");
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

const argumentsList = process.argv.slice(2);

if (argumentsList.includes("--self-test")) {
  runSelfTest();
} else if (argumentsList.length === 0) {
  console.error(
    "Usage: node scripts/check-prerender-boundary.mjs <entry-file...> | --self-test",
  );
  process.exitCode = 2;
} else {
  const entries = argumentsList.map((entry) => path.resolve(artifactRoot, entry));
  const missing = entries.filter((entry) => !fs.existsSync(entry));

  if (missing.length > 0) {
    for (const filePath of missing) {
      console.error(`Missing entry file: ${normalize(filePath)}`);
    }
    process.exitCode = 2;
  } else {
    const result = scanGraph(entries);
    printReport("application graph", result);
    if (result.violations.length > 0) process.exitCode = 1;
  }
}