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

  await copyTemplateDirectory(path.join(templateRoot, "common"), cwd, tokens);
  await copyTemplateDirectory(path.join(templateRoot, template), cwd, tokens);

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

function resolveTemplateRoot() {
  const currentFile = fileURLToPath(import.meta.url);
  const packageRoot = path.resolve(path.dirname(currentFile), "..", "..");
  return path.join(packageRoot, "templates");
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
    return;
  }

  const files = await globby(["**/*"], {
    cwd: fromDir,
    dot: true,
    onlyFiles: true,
  });

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
}

function isTextFile(filePath: string) {
  return TEXT_EXTENSIONS.has(path.extname(filePath));
}

function replaceTokens(content: string, tokens: Record<string, string>) {
  return Object.entries(tokens).reduce((value, [token, replacement]) => {
    return value.split(token).join(replacement);
  }, content);
}
