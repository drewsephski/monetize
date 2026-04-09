import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import type { Ora } from "ora";
import { detectFramework } from "../utils/detect.js";
import { createStripeProducts } from "../utils/stripe.js";
import { getTemplateLabel, installTemplates, normalizeTemplate } from "../utils/templates.js";
import { updateEnvFile } from "../utils/env.js";
import { detectPackageManager, type PackageManager } from "../utils/package-manager.js";
import { trackTiming, trackFunnel, FunnelStage } from "../utils/telemetry.js";
import { promptForFeedback } from "../utils/feedback.js";

interface InitOptions {
  skipStripe?: boolean;
  template?: string;
  yes?: boolean;
}

interface InitConfig {
  stripeSecretKey: string;
  stripePublishableKey: string;
  webhookSecret: string;
  databaseUrl: string;
  template: string;
  createProducts: boolean;
}

interface InitResults {
  projectScaffolded: boolean;
  dependencies: boolean;
  stripeProducts: boolean;
  database: boolean;
  templates: boolean;
  env: boolean;
}

export async function initCommand(options: InitOptions) {
  console.log(chalk.blue.bold("\n⚡ drew-billing-cli init\n"));

  // Track init started
  trackFunnel(FunnelStage.INIT_STARTED, { template: options.template });
  const initStartTime = Date.now();

  const cwd = process.cwd();
  const isEmptyDir = await isDirectoryEmpty(cwd);
  const hasPackageJson = await fs.pathExists(path.join(cwd, "package.json"));

  let pkgManager: PackageManager = "npm";
  let projectName = path.basename(cwd);
  let detectedFramework: { name: string; version?: string } = { name: "nextjs" };
  let projectScaffolded = false;

  // STEP 0: Scaffold Next.js project if directory is empty
  if (isEmptyDir || !hasPackageJson) {
    console.log(chalk.yellow("📁 No existing project detected."));
    
    // Auto-confirm if --yes flag is passed
    let shouldScaffold = options.yes;
    
    if (!options.yes) {
      const answer = await inquirer.prompt([
        {
          type: "confirm",
          name: "shouldScaffold",
          message: "Create a new Next.js project here?",
          default: true,
        },
      ]);
      shouldScaffold = answer.shouldScaffold;
    }

    if (!shouldScaffold) {
      console.log(chalk.gray("\nAborted. Please run this in an existing Next.js project directory.\n"));
      process.exit(0);
    }

    const scaffoldResult = await scaffoldNextJsProject(cwd, options.yes);
    if (!scaffoldResult.success) {
      console.log(chalk.red("\n❌ Failed to scaffold Next.js project."));
      console.log(chalk.gray("Please try manually: npx create-next-app@latest .\n"));
      process.exit(1);
    }
    
    pkgManager = scaffoldResult.pkgManager;
    projectName = scaffoldResult.projectName;
    projectScaffolded = true;
    detectedFramework = { name: "nextjs", version: "latest" };
    console.log(chalk.green(`\n✅ Created Next.js project: ${projectName}\n`));
    
    // Re-check for package.json after scaffolding
    const hasPackageJsonAfter = await fs.pathExists(path.join(cwd, "package.json"));
    if (!hasPackageJsonAfter) {
      console.log(chalk.red("\n❌ Scaffolded project missing package.json"));
      process.exit(1);
    }
  } else {
    // Detect existing framework
    const spinner = ora("Detecting framework...").start();
    const framework = await detectFramework();
    detectedFramework = { name: framework.name as "nextjs", version: framework.version };

    if (framework.name !== "nextjs") {
      spinner.warn(`Detected: ${framework.name} (limited support)`);
      console.log(chalk.yellow("\n⚠️  Currently only Next.js is fully supported."));
      console.log(chalk.gray("Other frameworks coming soon: React, Vue, Svelte, Express\n"));

      const { continueAnyway } = await inquirer.prompt([
        {
          type: "confirm",
          name: "continueAnyway",
          message: "Continue with manual setup?",
          default: false,
        },
      ]);

      if (!continueAnyway) {
        console.log(chalk.gray("\nAborted.\n"));
        process.exit(0);
      }
    } else {
      spinner.succeed(`Detected: ${chalk.green("Next.js")} ${framework.version || ""}`);
    }

    pkgManager = await detectPackageManager();
  }

  console.log(chalk.gray(`Using package manager: ${pkgManager}\n`));

  // Collect configuration
  let config: InitConfig;

  if (options.yes) {
    // Use defaults + env if available
    config = {
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
      databaseUrl: process.env.DATABASE_URL || "",
      template: options.template || "saas",
      createProducts: !options.skipStripe,
    };
  } else {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "stripeSecretKey",
        message: "Stripe Secret Key (sk_test_...):",
        default: process.env.STRIPE_SECRET_KEY,
        validate: (input: string) =>
          input.startsWith("sk_test_") || input.startsWith("sk_live_")
            ? true
            : "Must start with sk_test_ or sk_live_",
      },
      {
        type: "input",
        name: "stripePublishableKey",
        message: "Stripe Publishable Key (pk_test_...):",
        default: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        validate: (input: string) =>
          input.startsWith("pk_test_") || input.startsWith("pk_live_")
            ? true
            : "Must start with pk_test_ or pk_live_",
      },
      {
        type: "input",
        name: "databaseUrl",
        message: "Database URL (postgresql://...):",
        default: process.env.DATABASE_URL,
        validate: (input: string) => {
          if (!input || input.trim() === "") {
            return "Database URL is required (use your Neon or local Postgres URL)";
          }
          if (!input.startsWith("postgresql://") && !input.startsWith("postgres://")) {
            return "Must start with postgresql:// or postgres://";
          }
          return true;
        },
      },
      {
        type: "list",
        name: "template",
        message: "Choose your template:",
        choices: [
          { name: "SaaS Starter (overview + pricing + dashboard)", value: "saas" },
          { name: "API Billing (usage-based pricing)", value: "api" },
          { name: "AI Credits / Usage (credits + top-ups + dashboard)", value: "usage" },
          { name: "Minimal (just the SDK)", value: "minimal" },
        ],
        default: options.template || "saas",
      },
      {
        type: "confirm",
        name: "createProducts",
        message: "Create Stripe products automatically?",
        default: !options.skipStripe,
      },
    ]);

    config = { ...answers, webhookSecret: "" };
  }

  console.log(chalk.blue.bold("\n📦 Setting up drew-billing-cli...\n"));

  const results: InitResults = {
    projectScaffolded,
    dependencies: false,
    stripeProducts: false,
    database: false,
    templates: false,
    env: false,
  };

  const errors: string[] = [];

  // 1. Install core dependencies first (stripe and lucide-react are essential)
  const depsSpinner = ora("Installing core dependencies...").start();
  try {
    await installWithRetry(["stripe", "lucide-react"], pkgManager, depsSpinner, false, 2, cwd);
    depsSpinner.succeed("Core dependencies installed");
    results.dependencies = true;
  } catch (error) {
    depsSpinner.fail("Failed to install core dependencies");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Dependencies: ${errorMsg}`);
    console.log(chalk.gray(`Run manually: ${pkgManager} ${pkgManager === "npm" ? "install" : "add"} stripe lucide-react`));
  }

  // 1b. Install database dependencies (drizzle-kit must be installed before push)
  const dbDepsSpinner = ora("Installing database dependencies...").start();
  try {
    await installWithRetry(
      ["drizzle-orm", "@neondatabase/serverless", "drizzle-kit"],
      pkgManager,
      dbDepsSpinner,
      false,
      2,
      cwd
    );
    dbDepsSpinner.succeed("Database dependencies installed");
  } catch (error) {
    dbDepsSpinner.fail("Failed to install database dependencies");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`DB Dependencies: ${errorMsg}`);
    console.log(chalk.gray(`Run manually: ${pkgManager} ${pkgManager === "npm" ? "install" : "add"} drizzle-orm @neondatabase/serverless drizzle-kit`));
  }

  // 1c. Install dev dependencies
  const devDepsSpinner = ora("Installing dev dependencies...").start();
  try {
    await installWithRetry(["@types/node", "typescript"], pkgManager, devDepsSpinner, true, 2, cwd);
    devDepsSpinner.succeed("Dev dependencies installed");
  } catch {
    devDepsSpinner.warn("Some dev dependencies may need manual installation");
  }

  // 2. Create Stripe products (with better error handling)
  let products: Array<{ id: string; name: string; priceId: string }> = [];
  if (config.createProducts && config.stripeSecretKey) {
    const productSpinner = ora("Creating Stripe products...").start();
    try {
      // Validate Stripe key format first
      if (!config.stripeSecretKey.startsWith("sk_test_") && !config.stripeSecretKey.startsWith("sk_live_")) {
        throw new Error("Invalid Stripe secret key format");
      }
      
      products = await createStripeProducts(config.stripeSecretKey);
      productSpinner.succeed(`Created ${products.length} Stripe products`);
      results.stripeProducts = true;
    } catch (error) {
      productSpinner.fail("Failed to create Stripe products");
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Stripe products: ${errorMsg}`);
      console.log(chalk.gray("You can create them manually in the Stripe Dashboard"));
      console.log(chalk.gray("Then update the price IDs in your code"));
      
      // Provide fallback product IDs for development
      products = [
        { id: "prod_fallback", name: "Pro", priceId: "price_fallback_pro" },
        { id: "prod_fallback_2", name: "Enterprise", priceId: "price_fallback_enterprise" },
      ];
    }
  }

  // 3. Setup database (create drizzle config if missing)
  const dbSpinner = ora("Setting up database...").start();
  try {
    // First ensure drizzle config exists
    await ensureDrizzleConfig(cwd);
    
    // Setup database schema
    await setupDatabaseWithFallback(cwd, pkgManager, dbSpinner);
    dbSpinner.succeed("Database configured");
    results.database = true;
  } catch (error) {
    dbSpinner.fail("Database setup failed");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Database: ${errorMsg}`);
    console.log(chalk.gray("You can set up the database later by running:"));
    console.log(chalk.gray("  npx drizzle-kit push"));
    console.log(chalk.gray("\nMake sure to set DATABASE_URL in your .env.local file"));
  }

  // 4. Install templates (ensure directories exist first)
  const templateSpinner = ora(`Installing ${config.template} template...`).start();
  try {
    // Ensure app directory exists for Next.js App Router
    await fs.ensureDir(path.join(cwd, "app"));
    await fs.ensureDir(path.join(cwd, "components"));
    
    await installTemplates(config.template, products, cwd);
    templateSpinner.succeed(`Template installed`);
    results.templates = true;
  } catch (error) {
    templateSpinner.fail("Template installation failed");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Templates: ${errorMsg}`);
    console.log(chalk.gray("Try running:"));
    console.log(chalk.gray("  npx drew-billing-cli add all"));
  }

  // 5. Update environment variables (with fallback for DB URL)
  const envSpinner = ora("Updating environment variables...").start();
  try {
    const envVars: Record<string, string> = {
      STRIPE_SECRET_KEY: config.stripeSecretKey,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: config.stripePublishableKey,
      STRIPE_WEBHOOK_SECRET: config.webhookSecret || "whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",
      DATABASE_URL: config.databaseUrl || "postgresql://username:password@localhost:5432/database_name",
      BILLING_API_URL: "http://localhost:3000",
    };

    await updateEnvFile(envVars);
    envSpinner.succeed("Environment variables configured");
    results.env = true;
  } catch (error) {
    envSpinner.fail("Failed to update .env");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Environment: ${errorMsg}`);
  }

  // Track init completed
  const initDuration = Date.now() - initStartTime;
  trackFunnel(FunnelStage.INIT_COMPLETED, { 
    template: config.template,
    durationMs: initDuration,
    framework: detectedFramework.name,
    success: Object.values(results).every(r => r),
  });
  trackTiming("init_complete", initDuration);

  const templateLabel =
    config.template === "minimal" ? "Minimal SDK" : getTemplateLabel(normalizeTemplate(config.template));
  printSuccessPanel({
    errors,
    pkgManager,
    projectName,
    projectScaffolded: results.projectScaffolded,
    templateLabel,
    templateKey: config.template,
    dependenciesReady: results.dependencies,
    sandboxReady: results.templates,
  });

  if (products.length > 0 && results.stripeProducts) {
    console.log(chalk.gray("Created Stripe products:"));
    products.forEach((p) => {
      console.log(chalk.gray(`  • ${p.name}: ${p.priceId}`));
    });
    console.log();
  } else if (products.length > 0) {
    console.log(chalk.gray("Placeholder product IDs (update these in your code):"));
    products.forEach((p) => {
      console.log(chalk.gray(`  • ${p.name}: ${p.priceId}`));
    });
    console.log();
  }

  // Telemetry prompt
  console.log(chalk.blue("📊 Help improve drew-billing-cli"));
  console.log(chalk.gray("Enable anonymous telemetry to help us fix bugs faster."));
  console.log(chalk.gray("Run: npx drew-billing-cli telemetry --enable\n"));

  // Feedback collection
  await promptForFeedback("init_completed", {
    template: config.template,
    framework: detectedFramework.name,
    durationMs: initDuration,
    results,
  });
}

function printSuccessPanel({
  errors,
  pkgManager,
  projectName,
  projectScaffolded,
  templateLabel,
  templateKey,
  dependenciesReady,
  sandboxReady,
}: {
  errors: string[];
  pkgManager: PackageManager;
  projectName: string;
  projectScaffolded: boolean;
  templateLabel: string;
  templateKey: string;
  dependenciesReady: boolean;
  sandboxReady: boolean;
}) {
  const sandboxCommand = getRunScriptCommand(pkgManager, "billing:sandbox");
  const installCommand = getInstallCommand(pkgManager);
  const localUrls = getLocalUrls(templateKey);
  const nextSteps: string[] = [];

  if (projectScaffolded) {
    nextSteps.push(`cd ${projectName}`);
  }

  if (!dependenciesReady) {
    nextSteps.push(installCommand);
  }

  nextSteps.push(sandboxCommand);

  const line = (label: string, value: string) =>
    `${chalk.gray(label.padEnd(20))}${chalk.white(value)}`;

  console.log(chalk.green.bold("\n◆ Setup Complete\n"));
  console.log(line("Created", templateLabel));
  console.log(line("Template key", templateKey));
  console.log(line("Package manager", pkgManager));
  console.log(line("Dependencies", dependenciesReady ? "Installed" : `Needs manual step (${installCommand})`));
  console.log(line("Sandbox mode", sandboxReady ? "Ready" : "Template install incomplete"));
  console.log(line("First action", "Open /pricing and complete checkout"));

  console.log(chalk.white("\nNext steps"));
  nextSteps.forEach((step, index) => {
    console.log(chalk.gray(`${index + 1}.`), chalk.cyan(step));
  });

  console.log(chalk.white("\nLocal URLs"));
  Object.entries(localUrls).forEach(([label, url]) => {
    console.log(chalk.gray(`- ${label}:`), chalk.cyan(url));
  });

  if (errors.length > 0) {
    console.log(chalk.yellow("\nWarnings"));
    errors.forEach((error) => {
      console.log(chalk.gray(`- ${error}`));
    });
  }

  console.log();
  console.log(chalk.gray("Docs:"), chalk.underline("https://billing.drew.dev/docs"));
  console.log(chalk.gray("Diagnostics:"), chalk.cyan("npx drew-billing-cli doctor"));
  console.log(chalk.gray("Support:"), chalk.underline("https://github.com/drewsephski/monetize/issues"));
  console.log();
}

function getInstallCommand(pkgManager: PackageManager) {
  switch (pkgManager) {
    case "bun":
      return "bun install";
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn install";
    default:
      return "npm install";
  }
}

function getRunScriptCommand(pkgManager: PackageManager, script: string) {
  switch (pkgManager) {
    case "bun":
      return `bun run ${script}`;
    case "pnpm":
      return `pnpm ${script}`;
    case "yarn":
      return `yarn ${script}`;
    default:
      return `npm run ${script}`;
  }
}

function getLocalUrls(templateKey: string) {
  const urls: Record<string, string> = {
    App: "http://localhost:3000",
    Pricing: "http://localhost:3000/pricing",
    Dashboard: "http://localhost:3000/dashboard",
  };

  if (templateKey === "api") {
    urls["API Keys"] = "http://localhost:3000/api-keys";
    urls["Usage"] = "http://localhost:3000/usage";
  }

  if (templateKey === "usage" || templateKey === "ai-credits") {
    urls["Usage"] = "http://localhost:3000/usage";
  }

  return urls;
}

// Helper: Check if directory is empty
async function isDirectoryEmpty(dir: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dir);
    // Filter out common hidden files that don't count as project files
    const relevantFiles = files.filter(f => !f.startsWith('.') && f !== 'node_modules');
    return relevantFiles.length === 0;
  } catch {
    return true;
  }
}

// Helper: Scaffold Next.js project using create-next-app
interface ScaffoldResult {
  success: boolean;
  pkgManager: PackageManager;
  projectName: string;
}

async function scaffoldNextJsProject(cwd: string, yesMode: boolean = false): Promise<ScaffoldResult> {
  const projectName = path.basename(cwd);
  
  // Check which package manager is available
  let pkgManager: PackageManager = "npm";
  try {
    await execa("bun", ["--version"], { stdio: "pipe" });
    pkgManager = "bun";
  } catch {
    try {
      await execa("pnpm", ["--version"], { stdio: "pipe" });
      pkgManager = "pnpm";
    } catch {
      try {
        await execa("yarn", ["--version"], { stdio: "pipe" });
        pkgManager = "yarn";
      } catch {
        // Default to npm
      }
    }
  }

  const spinner = ora(`Creating Next.js project with ${pkgManager}...`).start();

  try {
    // Build create-next-app command with appropriate flags
    const createNextAppCmd = pkgManager === "npm" ? "npx" : pkgManager;
    const args = [
      ...(pkgManager === "npm" ? ["create-next-app@latest"] : ["create", "next-app"]),
      ".", // Use current directory, not a subdirectory
      "--typescript",
      "--tailwind",
      "--eslint",
      "--app",
      "--src-dir=false",
      "--import-alias", "@/*",
      ...(yesMode ? ["--yes"] : []),
    ];

    // Run create-next-app in the current directory
    await execa(createNextAppCmd, args, {
      cwd,
      stdio: "pipe",
      timeout: 300000, // 5 minute timeout
    });

    spinner.succeed("Next.js project created");
    return { success: true, pkgManager, projectName };
  } catch {
    spinner.fail("Failed to create Next.js project");
    
    // If failed with bun/yarn/pnpm, fallback to npm
    if (pkgManager !== "npm") {
      spinner.text = "Retrying with npm...";
      spinner.start();
      
      try {
        await execa("npx", [
          "create-next-app@latest",
          ".", // Use current directory
          "--typescript",
          "--tailwind",
          "--eslint",
          "--app",
          "--src-dir=false",
          "--import-alias", "@/*",
          ...(yesMode ? ["--yes"] : []),
        ], {
          cwd,
          stdio: "pipe",
          timeout: 300000,
        });
        
        spinner.succeed("Next.js project created with npm");
        return { success: true, pkgManager: "npm", projectName };
      } catch {
        spinner.fail("All attempts failed");
        return { success: false, pkgManager: "npm", projectName };
      }
    }
    
    return { success: false, pkgManager, projectName };
  }
}

// Helper: Install dependencies with retry logic
async function installWithRetry(
  packages: string[], 
  pkgManager: PackageManager, 
  spinner: Ora,
  dev: boolean = false,
  maxRetries: number = 2,
  projectCwd?: string
): Promise<void> {
  const installCmd = pkgManager === "npm" ? "install" : "add";
  const devFlag = dev ? (pkgManager === "npm" ? "--save-dev" : "-D") : "";
  const args = [installCmd, ...packages, ...(devFlag ? [devFlag] : [])];
  const cwd = projectCwd || process.cwd();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      spinner.text = `Installing dependencies (attempt ${attempt}/${maxRetries})...`;
      
      await execa(pkgManager, args, {
        cwd,
        stdio: "pipe",
        timeout: 120000, // 2 minute timeout
      });
      
      return; // Success
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(chalk.gray(`  Install attempt ${attempt} failed: ${errorMsg.substring(0, 100)}`));
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Helper: Ensure drizzle config exists
async function ensureDrizzleConfig(cwd: string): Promise<void> {
  const drizzleConfigPath = path.join(cwd, "drizzle.config.ts");
  
  if (await fs.pathExists(drizzleConfigPath)) {
    return;
  }

  // Check for .js version
  if (await fs.pathExists(path.join(cwd, "drizzle.config.js"))) {
    return;
  }

  // Create a basic drizzle config
  const configContent = `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`;

  await fs.writeFile(drizzleConfigPath, configContent);
  
  // Also create the schema directory and a basic schema
  const schemaDir = path.join(cwd, "drizzle");
  await fs.ensureDir(schemaDir);
  
  const schemaContent = `import { pgTable, serial, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("inactive"),
  plan: varchar("plan", { length: 50 }).notNull().default("free"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usageRecords = pgTable("usage_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  feature: varchar("feature", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  recordedAt: timestamp("recorded_at").defaultNow(),
  metadata: jsonb("metadata"),
});
`;

  await fs.writeFile(path.join(schemaDir, "schema.ts"), schemaContent);
}

// Helper: Setup database with fallback
async function setupDatabaseWithFallback(
  cwd: string, 
  _pkgManager: PackageManager, 
  spinner: Ora
): Promise<void> {
  try {
    // Try to run drizzle-kit push
    spinner.text = "Running database migrations...";
    
    await execa("npx", ["drizzle-kit", "push", "--force"], {
      cwd,
      stdio: "pipe",
      timeout: 60000,
      env: { ...process.env, SKIP_ENV_VALIDATION: "true" },
    });
  } catch (error) {
    // If drizzle-kit fails, check if it's because of missing DATABASE_URL
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    if (errorMsg.includes("DATABASE_URL") || errorMsg.includes("database")) {
      throw new Error("DATABASE_URL not configured. Please add it to .env.local");
    }
    
    // Re-throw for other errors
    throw error;
  }
}
