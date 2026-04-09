import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const templateRoot = path.join(repoRoot, "packages", "cli", "templates");

const DOCS_URL = "https://billing.drew.dev/docs";
const GITHUB_URL = "https://github.com/drewsephski/monetize";

const examples = [
  {
    key: "saas",
    target: path.join(repoRoot, "examples", "saas-starter"),
    appName: "SaaS Starter",
    eyebrow: "Subscription product",
    examplesUrl: `${GITHUB_URL}/tree/main/examples/saas-starter`,
    proPriceId: "price_placeholder_pro",
    enterprisePriceId: "price_placeholder_enterprise",
  },
  {
    key: "api",
    target: path.join(repoRoot, "examples", "api-product"),
    appName: "API Product",
    eyebrow: "Usage-based API",
    examplesUrl: `${GITHUB_URL}/tree/main/examples/api-product`,
    proPriceId: "price_placeholder_pro",
    enterprisePriceId: "price_placeholder_enterprise",
  },
  {
    key: "usage",
    target: path.join(repoRoot, "examples", "ai-credits"),
    appName: "AI Credits",
    eyebrow: "AI credits product",
    examplesUrl: `${GITHUB_URL}/tree/main/examples/ai-credits`,
    proPriceId: "price_placeholder_pro",
    enterprisePriceId: "price_placeholder_enterprise",
  },
];

const textExtensions = new Set([
  ".css",
  ".env",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
]);

for (const example of examples) {
  await clearGeneratedOverlay(example.target);

  const tokens = {
    __APP_NAME__: example.appName,
    __APP_EYEBROW__: example.eyebrow,
    __DOCS_URL__: DOCS_URL,
    __GITHUB_URL__: GITHUB_URL,
    __EXAMPLES_URL__: example.examplesUrl,
    __PRO_PRICE_ID__: example.proPriceId,
    __ENTERPRISE_PRICE_ID__: example.enterprisePriceId,
  };

  await copyTemplateDirectory(path.join(templateRoot, "common"), example.target, tokens);
  await copyTemplateDirectory(path.join(templateRoot, example.key), example.target, tokens);
}

async function clearGeneratedOverlay(targetDir) {
  for (const relativePath of ["app", "components", "lib", "middleware.ts", "proxy.ts"]) {
    await fs.rm(path.join(targetDir, relativePath), {
      force: true,
      recursive: true,
    });
  }
}

async function copyTemplateDirectory(sourceDir, targetDir, tokens) {
  const files = await collectFiles(sourceDir);

  for (const relativeFile of files) {
    const sourcePath = path.join(sourceDir, relativeFile);
    const destinationPath = path.join(targetDir, relativeFile);

    await fs.mkdir(path.dirname(destinationPath), { recursive: true });

    if (textExtensions.has(path.extname(sourcePath))) {
      const content = await fs.readFile(sourcePath, "utf8");
      await fs.writeFile(destinationPath, replaceTokens(content, tokens), "utf8");
      continue;
    }

    await fs.copyFile(sourcePath, destinationPath);
  }
}

async function collectFiles(sourceDir, baseDir = sourceDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, baseDir)));
      continue;
    }

    files.push(path.relative(baseDir, fullPath));
  }

  return files;
}

function replaceTokens(content, tokens) {
  return Object.entries(tokens).reduce((value, [token, replacement]) => {
    return value.split(token).join(replacement);
  }, content);
}
