import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { execa } from "execa";
import { detectFramework } from "../utils/detect.js";
import { createStripeProducts } from "../utils/stripe.js";
import { installTemplates } from "../utils/templates.js";
import { updateEnvFile } from "../utils/env.js";
import { setupDatabase } from "../utils/database.js";
import { trackTiming, trackFunnel, FunnelStage } from "../utils/telemetry.js";
import { promptForFeedback } from "../utils/feedback.js";

interface InitOptions {
  skipStripe?: boolean;
  template?: string;
  yes?: boolean;
}

export async function initCommand(options: InitOptions) {
  console.log(chalk.blue.bold("\n⚡ @drew/billing init\n"));

  // Track init started
  trackFunnel(FunnelStage.INIT_STARTED, { template: options.template });
  const initStartTime = Date.now();

  const spinner = ora("Detecting framework...").start();
  const framework = await detectFramework();
  spinner.succeed(`Detected: ${chalk.green(framework.name)} ${framework.version || ""}`);

  if (framework.name !== "nextjs") {
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
  }

  // Collect configuration
  let config: {
    stripeSecretKey: string;
    stripePublishableKey: string;
    webhookSecret: string;
    template: string;
    createProducts: boolean;
  };

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

  // 1. Install dependencies
  const depsSpinner = ora("Installing dependencies...").start();
  try {
    await execa("npm", ["install", "@drew/billing-sdk", "stripe"], {
      cwd: process.cwd(),
      stdio: "pipe",
    });
    depsSpinner.succeed("Dependencies installed");
  } catch (error) {
    depsSpinner.fail("Failed to install dependencies");
    console.log(chalk.gray("Run manually: npm install @drew/billing-sdk stripe"));
  }

  // 2. Create Stripe products
  let products: Array<{ id: string; name: string; priceId: string }> = [];
  if (config.createProducts) {
    const productSpinner = ora("Creating Stripe products...").start();
    try {
      products = await createStripeProducts(config.stripeSecretKey);
      productSpinner.succeed(`Created ${products.length} products in Stripe`);
    } catch (error) {
      productSpinner.fail("Failed to create Stripe products");
      console.log(chalk.gray("You can create them manually in the Stripe Dashboard"));
    }
  }

  // 3. Setup database
  const dbSpinner = ora("Setting up database...").start();
  try {
    await setupDatabase();
    dbSpinner.succeed("Database configured");
  } catch (error) {
    dbSpinner.fail("Database setup failed");
    console.log(chalk.gray("Run: npx drizzle-kit push"));
  }

  // 4. Install templates
  const templateSpinner = ora(`Installing ${config.template} template...`).start();
  try {
    await installTemplates(config.template, products);
    templateSpinner.succeed(`Template installed`);
  } catch (error) {
    templateSpinner.fail("Template installation failed");
  }

  // 5. Update environment variables
  const envSpinner = ora("Updating environment variables...").start();
  try {
    await updateEnvFile({
      STRIPE_SECRET_KEY: config.stripeSecretKey,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: config.stripePublishableKey,
      STRIPE_WEBHOOK_SECRET: config.webhookSecret || "whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",
      BILLING_API_URL: "http://localhost:3000",
    });
    envSpinner.succeed("Environment variables configured");
  } catch (error) {
    envSpinner.fail("Failed to update .env");
  }

  // Track init completed
  const initDuration = Date.now() - initStartTime;
  trackFunnel(FunnelStage.INIT_COMPLETED, { 
    template: config.template,
    durationMs: initDuration,
    framework: framework.name,
  });
  trackTiming("init_complete", initDuration);

  // Success message
  console.log(chalk.green.bold("\n✅ Setup complete!\n"));
  console.log(chalk.white("Next steps:\n"));
  console.log(chalk.gray("1."), "Start your dev server:", chalk.cyan("npm run dev"));
  console.log(chalk.gray("2."), "Start Stripe webhook listener:", chalk.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"));
  console.log(chalk.gray("3."), "Visit", chalk.cyan("http://localhost:3000/pricing"));
  console.log();
  console.log(chalk.gray("Documentation:"), chalk.underline("https://billing.drew.dev/docs"));
  console.log(chalk.gray("Diagnostics:"), chalk.cyan("npx @drew/billing doctor"));
  console.log(chalk.gray("Support:"), chalk.underline("https://github.com/drew/billing/issues"));
  console.log();

  if (products.length > 0) {
    console.log(chalk.gray("Created Stripe products:"));
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
    framework: framework.name,
    durationMs: initDuration,
  });
}
