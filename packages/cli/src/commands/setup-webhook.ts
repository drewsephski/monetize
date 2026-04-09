import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import { updateEnvFile } from "../utils/env.js";

interface SetupWebhookOptions {
  production?: boolean;
  skipInstall?: boolean;
}

/**
 * Guides users through proper Stripe webhook setup following best practices:
 * 1. Deploy to Vercel first to get production URL
 * 2. Create webhook endpoint in Stripe with that URL
 * 3. Configure webhook secret in environment
 * 4. Test webhook locally using Stripe CLI
 */
export async function setupWebhookCommand(_options: SetupWebhookOptions) {
  console.log(chalk.blue.bold("\n🔗 Stripe Webhook Setup Wizard\n"));
  console.log(chalk.gray("This wizard helps you set up Stripe webhooks correctly."));
  console.log(chalk.gray("Webhooks are REQUIRED for production to keep subscription data in sync.\n"));

  const cwd = process.cwd();
  await fs.pathExists(path.join(cwd, "vercel.json"));
  
  // Check current environment
  const envSpinner = ora("Checking environment...").start();
  const hasStripeSecret = !!process.env.STRIPE_SECRET_KEY;
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
  envSpinner.succeed(`Environment check complete`);

  console.log(chalk.blue("\n📋 Current Status:"));
  console.log(`  Stripe Secret Key: ${hasStripeSecret ? chalk.green("✓ Set") : chalk.red("✗ Missing")}`);
  console.log(`  Webhook Secret: ${hasWebhookSecret ? chalk.green("✓ Set") : chalk.red("✗ Missing")}`);
  console.log();

  if (!hasStripeSecret) {
    console.log(chalk.red("❌ STRIPE_SECRET_KEY not found in environment."));
    console.log(chalk.gray("Run: npx drew-billing-cli init  to set up your Stripe keys first.\n"));
    return;
  }

  // Determine deployment status
  const deploymentChoice = await inquirer.prompt([
    {
      type: "list",
      name: "deploymentStage",
      message: "What's your deployment status?",
      choices: [
        { name: "🖥️  Local development only (use Stripe CLI for testing)", value: "local" },
        { name: "🚀 Deployed to Vercel (production webhook setup)", value: "production" },
        { name: "📋 Show me the complete deployment checklist", value: "checklist" },
      ],
      default: "local",
    },
  ]);

  if (deploymentChoice.deploymentStage === "checklist") {
    printDeploymentChecklist();
    return;
  }

  if (deploymentChoice.deploymentStage === "local") {
    await setupLocalWebhook(cwd);
  } else {
    await setupProductionWebhook(cwd);
  }
}

async function setupLocalWebhook(_cwd: string) {
  console.log(chalk.blue("\n🖥️  Local Development Webhook Setup\n"));
  
  // Check for Stripe CLI
  const cliSpinner = ora("Checking for Stripe CLI...").start();
  try {
    await execa("stripe", ["--version"]);
    cliSpinner.succeed("Stripe CLI found");
  } catch {
    cliSpinner.fail("Stripe CLI not found");
    console.log(chalk.yellow("\n⚠️  Stripe CLI is required for local webhook testing."));
    console.log(chalk.gray("Install it:"));
    console.log(chalk.gray("  macOS: brew install stripe/stripe-cli/stripe"));
    console.log(chalk.gray("  Windows: scoop install stripe"));
    console.log(chalk.gray("  Other: https://docs.stripe.com/stripe-cli\n"));
    return;
  }

  // Check login status
  const loginSpinner = ora("Checking Stripe CLI login status...").start();
  try {
    await execa("stripe", ["config", "--list"]);
    loginSpinner.succeed("Stripe CLI authenticated");
  } catch {
    loginSpinner.fail("Not logged in to Stripe CLI");
    console.log(chalk.yellow("\n⚠️  Please login first:"));
    console.log(chalk.gray("  stripe login\n"));
    return;
  }

  console.log(chalk.green("\n✅ Ready to test webhooks locally!\n"));
  console.log(chalk.blue("Next steps:"));
  console.log("1. Start your Next.js dev server:");
  console.log(chalk.gray("   npm run dev"));
  console.log();
  console.log("2. In a new terminal, forward webhooks to your local server:");
  console.log(chalk.gray("   stripe listen --forward-to localhost:3000/api/billing/webhook"));
  console.log();
  console.log("3. The CLI will output a webhook signing secret.");
  console.log("   Add it to your .env.local as STRIPE_WEBHOOK_SECRET");
  console.log();
  console.log("4. Test a checkout flow - the webhook will fire automatically.");
  console.log();

  // Offer to set up webhook secret
  const { setSecret } = await inquirer.prompt([
    {
      type: "confirm",
      name: "setSecret",
      message: "Do you have a webhook secret from stripe listen?",
      default: false,
    },
  ]);

  if (setSecret) {
    const { secret } = await inquirer.prompt([
      {
        type: "input",
        name: "secret",
        message: "Paste your webhook secret (whsec_...):",
        validate: (input: string) =>
          input.startsWith("whsec_") ? true : "Must start with whsec_",
      },
    ]);

    const envSpinner = ora("Updating .env.local...").start();
    await updateEnvFile({ STRIPE_WEBHOOK_SECRET: secret });
    envSpinner.succeed("Webhook secret saved to .env.local");
  }

  console.log(chalk.gray("\n💡 Tip: Use 'stripe trigger checkout.session.completed' to test webhooks manually.\n"));
}

async function setupProductionWebhook(_cwd: string) {
  console.log(chalk.blue("\n🚀 Production Webhook Setup\n"));
  
  console.log(chalk.yellow("⚠️  Important: You must deploy to Vercel FIRST to get a production URL."));
  console.log(chalk.gray("Without a deployed URL, you can't configure Stripe webhooks.\n"));

  const { hasDeployed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "hasDeployed",
      message: "Have you deployed your app to Vercel?",
      default: false,
    },
  ]);

  if (!hasDeployed) {
    console.log(chalk.blue("\n📋 Deployment Steps:"));
    console.log();
    console.log("1. Push your code to GitHub:");
    console.log(chalk.gray("   git add ."));
    console.log(chalk.gray("   git commit -m 'Initial commit'"));
    console.log(chalk.gray("   git push origin main"));
    console.log();
    console.log("2. Connect to Vercel:");
    console.log(chalk.gray("   - Go to https://vercel.com/new"));
    console.log(chalk.gray("   - Import your GitHub repository"));
    console.log(chalk.gray("   - Add environment variables from .env.local"));
    console.log();
    console.log("3. Once deployed, copy your production URL:");
    console.log(chalk.gray("   https://your-app.vercel.app"));
    console.log();
    console.log("4. Run this wizard again and select 'Deployed to Vercel'\n");
    return;
  }

  // Get production URL
  const { productionUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "productionUrl",
      message: "Enter your production URL (e.g., https://your-app.vercel.app):",
      validate: (input: string) => {
        if (!input) return "URL is required";
        if (!input.startsWith("https://")) return "Must start with https://";
        return true;
      },
    },
  ]);

  const webhookUrl = `${productionUrl}/api/billing/webhook`;
  
  console.log(chalk.blue("\n🔗 Configure this webhook endpoint in your Stripe Dashboard:"));
  console.log(chalk.gray(`   URL: ${webhookUrl}`));
  console.log();
  console.log("1. Go to: https://dashboard.stripe.com/webhooks");
  console.log("2. Click 'Add endpoint'");
  console.log(`3. Enter URL: ${webhookUrl}`);
  console.log("4. Select these events:");
  console.log(chalk.gray("   - checkout.session.completed"));
  console.log(chalk.gray("   - customer.subscription.created"));
  console.log(chalk.gray("   - customer.subscription.updated"));
  console.log(chalk.gray("   - customer.subscription.deleted"));
  console.log(chalk.gray("   - invoice.paid"));
  console.log(chalk.gray("   - invoice.payment_failed"));
  console.log("5. Click 'Add endpoint'");
  console.log("6. Copy the 'Signing secret' (whsec_...)");
  console.log();

  // Set production webhook secret
  const { hasSecret } = await inquirer.prompt([
    {
      type: "confirm",
      name: "hasSecret",
      message: "Do you have the webhook signing secret from Stripe Dashboard?",
      default: false,
    },
  ]);

  if (hasSecret) {
    const { secret } = await inquirer.prompt([
      {
        type: "input",
        name: "secret",
        message: "Paste your webhook signing secret (whsec_...):",
        validate: (input: string) =>
          input.startsWith("whsec_") ? true : "Must start with whsec_",
      },
    ]);

    const envSpinner = ora("Updating environment...").start();
    await updateEnvFile({ STRIPE_WEBHOOK_SECRET: secret });
    envSpinner.succeed("Webhook secret saved");

    console.log(chalk.yellow("\n⚠️  Remember to add STRIPE_WEBHOOK_SECRET to your Vercel environment variables!"));
    console.log(chalk.gray("   Vercel Dashboard → Project → Settings → Environment Variables\n"));
  }

  console.log(chalk.green("\n✅ Production webhook setup complete!"));
  console.log(chalk.gray("Test a checkout flow to verify everything works.\n"));
}

function printDeploymentChecklist() {
  console.log(chalk.blue.bold("\n📋 Complete Production Deployment Checklist\n"));
  
  console.log(chalk.yellow("Phase 1: Local Development"));
  console.log("[ ] Run: npx drew-billing-cli init");
  console.log("[ ] Set up local database (Neon or local Postgres)");
  console.log("[ ] Run: npm run dev");
  console.log("[ ] Install Stripe CLI: brew install stripe/stripe-cli/stripe");
  console.log("[ ] Login to Stripe CLI: stripe login");
  console.log("[ ] Forward webhooks: stripe listen --forward-to localhost:3000/api/billing/webhook");
  console.log("[ ] Add webhook secret to .env.local");
  console.log("[ ] Test checkout flow locally");
  console.log();
  
  console.log(chalk.yellow("Phase 2: Deploy to Vercel"));
  console.log("[ ] Push code to GitHub");
  console.log("[ ] Create Vercel project: https://vercel.com/new");
  console.log("[ ] Add environment variables in Vercel Dashboard:");
  console.log(chalk.gray("    - STRIPE_SECRET_KEY"));
  console.log(chalk.gray("    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"));
  console.log(chalk.gray("    - NEXT_PUBLIC_STRIPE_PRICE_PRO"));
  console.log(chalk.gray("    - NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE"));
  console.log(chalk.gray("    - DATABASE_URL"));
  console.log("[ ] Deploy and copy production URL");
  console.log();
  
  console.log(chalk.yellow("Phase 3: Configure Production Webhook"));
  console.log("[ ] Go to: https://dashboard.stripe.com/webhooks");
  console.log("[ ] Add endpoint with production URL + /api/billing/webhook");
  console.log("[ ] Select events: checkout.session.completed, customer.subscription.*, invoice.*");
  console.log("[ ] Copy signing secret");
  console.log("[ ] Add STRIPE_WEBHOOK_SECRET to Vercel environment variables");
  console.log("[ ] Redeploy Vercel project to apply new env vars");
  console.log();
  
  console.log(chalk.yellow("Phase 4: Production Testing"));
  console.log("[ ] Test checkout with real card (then refund)");
  console.log("[ ] Verify webhook events appear in logs");
  console.log("[ ] Check database records subscription data");
  console.log("[ ] Test subscription cancellation");
  console.log();
  
  console.log(chalk.green("✨ Once all checks pass, you're ready for launch!\n"));
}
