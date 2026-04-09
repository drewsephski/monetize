import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import type { Ora } from "ora";
import { detectFramework } from "../utils/detect.js";
import { createStripeProducts } from "../utils/stripe.js";
import { installTemplates } from "../utils/templates.js";
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
  console.log(chalk.blue.bold("\n⚡ @drew/billing init\n"));

  // Track init started
  trackFunnel(FunnelStage.INIT_STARTED, { template: options.template });
  const initStartTime = Date.now();

  const cwd = process.cwd();
  const isEmptyDir = await isDirectoryEmpty(cwd);
  const hasPackageJson = await fs.pathExists(path.join(cwd, "package.json"));

  let pkgManager: PackageManager = "npm";
  let projectName = path.basename(cwd);
  let detectedFramework: { name: string; version?: string } = { name: "nextjs" };

  // STEP 0: Scaffold Next.js project if directory is empty
  if (isEmptyDir || !hasPackageJson) {
    console.log(chalk.yellow("📁 No existing project detected."));
    
    const { shouldScaffold } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldScaffold",
        message: "Create a new Next.js project here?",
        default: true,
      },
    ]);

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
    console.log(chalk.green(`\n✅ Created Next.js project: ${projectName}\n`));
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
        type: "list",
        name: "template",
        message: "Choose your template:",
        choices: [
          { name: "SaaS Starter (pricing page + auth + dashboard)", value: "saas" },
          { name: "API Billing (usage-based pricing)", value: "api" },
          { name: "Simple Usage (metered billing)", value: "usage" },
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

  // Setup steps
  console.log(chalk.blue.bold("\n📦 Setting up @drew/billing...\n"));

  const results: InitResults = {
    projectScaffolded: isEmptyDir || !hasPackageJson,
    dependencies: false,
    stripeProducts: false,
    database: false,
    templates: false,
    env: false,
  };

  const errors: string[] = [];

  // 1. Install dependencies with retry logic
  const depsSpinner = ora("Installing dependencies...").start();
  try {
    // Try with different package managers if one fails
    await installWithRetry(["@drew/billing-sdk", "stripe"], pkgManager, depsSpinner);
    depsSpinner.succeed("Dependencies installed");
    results.dependencies = true;
  } catch (error) {
    depsSpinner.fail("Failed to install dependencies");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Dependencies: ${errorMsg}`);
    console.log(chalk.gray(`Run manually: ${pkgManager} ${pkgManager === "npm" ? "install" : "add"} @drew/billing-sdk stripe`));
  }

  // 1b. Install additional required dependencies
  if (results.dependencies) {
    const addDepsSpinner = ora("Installing additional dependencies...").start();
    try {
      await installWithRetry([
        "drizzle-orm", 
        "@neondatabase/serverless", 
        "drizzle-kit", 
        "@types/node", 
        "typescript", 
        "stripe"
      ], pkgManager, addDepsSpinner, true);
      addDepsSpinner.succeed("Additional dependencies installed");
    } catch {
      addDepsSpinner.warn("Some additional dependencies may need manual installation");
      console.log(chalk.gray("You can install them later if needed."));
    }
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
    
    await installTemplates(config.template, products);
    templateSpinner.succeed(`Template installed`);
    results.templates = true;
  } catch (error) {
    templateSpinner.fail("Template installation failed");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Templates: ${errorMsg}`);
    console.log(chalk.gray("Try running:"));
    console.log(chalk.gray("  npx @drew/billing add all"));
  }

  // 5. Update environment variables (with fallback for DB URL)
  const envSpinner = ora("Updating environment variables...").start();
  try {
    const envVars: Record<string, string> = {
      STRIPE_SECRET_KEY: config.stripeSecretKey,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: config.stripePublishableKey,
      STRIPE_WEBHOOK_SECRET: config.webhookSecret || "whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",
      BILLING_API_URL: "http://localhost:3000",
    };

    // Add placeholder DATABASE_URL if not present
    const envPath = path.join(cwd, ".env.local");
    const existingEnv = await fs.readFile(envPath, "utf-8").catch(() => "");
    if (!existingEnv.includes("DATABASE_URL=")) {
      envVars.DATABASE_URL = "postgresql://username:password@localhost:5432/database_name";
    }

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

  // Summary
  console.log(chalk.green.bold("\n✅ Setup complete!\n"));

  // Show any errors
  if (errors.length > 0) {
    console.log(chalk.yellow("⚠️  Some steps failed:"));
    errors.forEach(err => console.log(chalk.gray(`  • ${err}`)));
    console.log();
  }

  // Show project-specific next steps
  console.log(chalk.white("Next steps:\n"));
  
  if (results.projectScaffolded) {
    console.log(chalk.gray("1."), "Navigate to your project:", chalk.cyan(`cd ${projectName}`));
    console.log(chalk.gray("2."), "Start your dev server:", chalk.cyan(`${pkgManager === "npm" ? "npm run" : pkgManager} dev`));
    console.log(chalk.gray("3."), "Start Stripe webhook listener:", chalk.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"));
  } else {
    console.log(chalk.gray("1."), "Start your dev server:", chalk.cyan(`${pkgManager === "npm" ? "npm run" : pkgManager} dev`));
    console.log(chalk.gray("2."), "Start Stripe webhook listener:", chalk.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"));
  }
  
  if (results.templates) {
    const stepNum = results.projectScaffolded ? "4" : "3";
    console.log(chalk.gray(`${stepNum}.`), "Visit", chalk.cyan("http://localhost:3000/pricing"));
  }
  
  if (!results.database) {
    console.log(chalk.gray("\n⚠️  Database not configured. Add DATABASE_URL to .env.local and run:"));
    console.log(chalk.gray("   npx drizzle-kit push"));
  }
  
  console.log();
  console.log(chalk.gray("Documentation:"), chalk.underline("https://billing.drew.dev/docs"));
  console.log(chalk.gray("Diagnostics:"), chalk.cyan("npx @drew/billing doctor"));
  console.log(chalk.gray("Support:"), chalk.underline("https://github.com/drew/billing/issues"));
  console.log();

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
  console.log(chalk.blue("📊 Help improve @drew/billing"));
  console.log(chalk.gray("Enable anonymous telemetry to help us fix bugs faster."));
  console.log(chalk.gray("Run: npx @drew/billing telemetry --enable\n"));

  // Feedback collection
  await promptForFeedback("init_completed", {
    template: config.template,
    framework: detectedFramework.name,
    durationMs: initDuration,
    results,
  });
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
  const parentDir = path.dirname(cwd);
  
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
      projectName,
      "--typescript",
      "--tailwind",
      "--eslint",
      "--app",
      "--src-dir=false",
      "--import-alias", "@/*",
      ...(yesMode ? ["--yes"] : []),
    ];

    // Run create-next-app in the parent directory
    await execa(createNextAppCmd, args, {
      cwd: parentDir,
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
          projectName,
          "--typescript",
          "--tailwind",
          "--eslint",
          "--app",
          "--src-dir=false",
          "--import-alias", "@/*",
          ...(yesMode ? ["--yes"] : []),
        ], {
          cwd: parentDir,
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
  maxRetries: number = 2
): Promise<void> {
  const installCmd = pkgManager === "npm" ? "install" : "add";
  const devFlag = dev ? (pkgManager === "npm" ? "--save-dev" : "-D") : "";
  const args = [installCmd, ...packages, ...(devFlag ? [devFlag] : [])];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      spinner.text = `Installing dependencies (attempt ${attempt}/${maxRetries})...`;
      
      await execa(pkgManager, args, {
        cwd: process.cwd(),
        stdio: "pipe",
        timeout: 120000, // 2 minute timeout
      });
      
      return; // Success
    } catch (error) {
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
