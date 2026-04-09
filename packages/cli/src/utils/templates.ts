import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { globby } from "globby";
import { fileURLToPath } from "node:url";

type StripeProduct = { id: string; name: string; priceId: string };

type TemplateKey = "saas" | "api" | "usage";

const DOCS_URL = "https://billing.drew.dev/docs";
const GITHUB_URL = "https://github.com/drewsephski/monetize";
const TEMPLATE_INFO: Record<
  TemplateKey,
  {
    appName: string;
    eyebrow: string;
    examplesPath: string;
  }
> = {
  saas: {
    appName: "SaaS Starter",
    eyebrow: "Subscription product",
    examplesPath: "examples/saas-starter",
  },
  api: {
    appName: "API Product",
    eyebrow: "Usage-based API",
    examplesPath: "examples/api-product",
  },
  usage: {
    appName: "AI Credits",
    eyebrow: "AI credits product",
    examplesPath: "examples/ai-credits",
  },
};

const TEXT_EXTENSIONS = new Set([
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

const REQUIRED_TEMPLATE_FILES: Record<TemplateKey, string[]> = {
  saas: [
    "app/layout.tsx",
    "app/page.tsx",
    "app/pricing/page.tsx",
    "app/dashboard/page.tsx",
    "components/example-kit.tsx",
    "lib/site.ts",
  ],
  api: [
    "app/layout.tsx",
    "app/page.tsx",
    "app/pricing/page.tsx",
    "app/dashboard/page.tsx",
    "app/api-keys/page.tsx",
    "components/example-kit.tsx",
    "lib/site.ts",
  ],
  usage: [
    "app/layout.tsx",
    "app/page.tsx",
    "app/pricing/page.tsx",
    "app/dashboard/page.tsx",
    "app/usage/page.tsx",
    "components/example-kit.tsx",
    "lib/site.ts",
  ],
};

export async function installTemplates(
  templateType: string,
  products: StripeProduct[],
  projectCwd?: string
): Promise<void> {
  const template = normalizeTemplate(templateType);
  const cwd = projectCwd || process.cwd();
  const templateRoot = resolveTemplateRoot();
  const tokens = getTemplateTokens(template, products);

  console.log(chalk.blue(`\n📄 Installing ${tokens.__APP_NAME__} template assets...`));

  const commonFiles = await copyTemplateDirectory(path.join(templateRoot, "common"), cwd, tokens);
  const templateFiles = await copyTemplateDirectory(path.join(templateRoot, template), cwd, tokens);
  const totalFiles = commonFiles + templateFiles;

  if (totalFiles === 0) {
    throw new Error(`Template installation copied 0 files from ${templateRoot}`);
  }

  const missingRequiredFiles = await getMissingRequiredFiles(template, cwd);
  if (missingRequiredFiles.length > 0) {
    throw new Error(
      `Template installation incomplete. Missing required files: ${missingRequiredFiles.join(", ")}`
    );
  }

  console.log(chalk.green(`✅ ${tokens.__APP_NAME__} template installed\n`));
}

export function normalizeTemplate(templateType: string): TemplateKey {
  const normalized = templateType.trim().toLowerCase();

  if (normalized === "ai-credits") {
    return "usage";
  }

  if (normalized === "saas" || normalized === "api" || normalized === "usage") {
    return normalized;
  }

  throw new Error(`Unknown template: ${templateType}`);
}

export function getTemplateLabel(templateType: string) {
  const template = normalizeTemplate(templateType);
  return TEMPLATE_INFO[template].appName;
}

export function resolveTemplateRoot(currentFilePath = fileURLToPath(import.meta.url)) {
  const currentDir = path.dirname(currentFilePath);
  const candidateRoots = [
    path.resolve(currentDir, ".."),
    path.resolve(currentDir, "..", ".."),
  ];

  for (const candidateRoot of candidateRoots) {
    const templateRoot = path.join(candidateRoot, "templates");
    const commonTemplateDir = path.join(templateRoot, "common");
    if (fs.existsSync(commonTemplateDir)) {
      return templateRoot;
    }
  }

  throw new Error(
    `Could not locate CLI templates relative to ${currentFilePath}. Checked: ${candidateRoots
      .map((root) => path.join(root, "templates"))
      .join(", ")}`
  );
}

function getTemplateTokens(template: TemplateKey, products: StripeProduct[]) {
  const info = TEMPLATE_INFO[template];
  const repoTreeUrl = `${GITHUB_URL}/tree/main/${info.examplesPath}`;
  const proProduct = products.find((product) => /pro|growth|studio/i.test(product.name));
  const enterpriseProduct = products.find((product) => /enterprise|scale/i.test(product.name));

  return {
    __APP_NAME__: info.appName,
    __APP_EYEBROW__: info.eyebrow,
    __DOCS_URL__: DOCS_URL,
    __GITHUB_URL__: GITHUB_URL,
    __EXAMPLES_URL__: repoTreeUrl,
    __PRO_PRICE_ID__: proProduct?.priceId || "price_placeholder_pro",
    __ENTERPRISE_PRICE_ID__: enterpriseProduct?.priceId || "price_placeholder_enterprise",
  };
}

async function copyTemplateDirectory(
  fromDir: string,
  targetDir: string,
  tokens: Record<string, string>
) {
  if (!(await fs.pathExists(fromDir))) {
    throw new Error(`Template source directory not found: ${fromDir}`);
  }

  const files = await globby(["**/*"], {
    cwd: fromDir,
    dot: true,
    onlyFiles: true,
  });

  if (files.length === 0) {
    throw new Error(`Template source directory is empty: ${fromDir}`);
  }

  for (const relativeFile of files) {
    const sourcePath = path.join(fromDir, relativeFile);
    const destinationPath = path.join(targetDir, relativeFile);

    await fs.ensureDir(path.dirname(destinationPath));

    if (isTextFile(sourcePath)) {
      const content = await fs.readFile(sourcePath, "utf8");
      await fs.writeFile(destinationPath, replaceTokens(content, tokens), "utf8");
      continue;
    }

    await fs.copyFile(sourcePath, destinationPath);
  }

  return files.length;
}

function isTextFile(filePath: string) {
  return TEXT_EXTENSIONS.has(path.extname(filePath));
}

function replaceTokens(content: string, tokens: Record<string, string>) {
  return Object.entries(tokens).reduce((value, [token, replacement]) => {
    return value.split(token).join(replacement);
  }, content);
}

async function getMissingRequiredFiles(template: TemplateKey, targetDir: string) {
  const checks = await Promise.all(
    REQUIRED_TEMPLATE_FILES[template].map(async (relativePath) => ({
      relativePath,
      exists: await fs.pathExists(path.join(targetDir, relativePath)),
    }))
  );

  return checks.filter((check) => !check.exists).map((check) => check.relativePath);
}
