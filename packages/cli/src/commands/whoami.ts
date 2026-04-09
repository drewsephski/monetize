import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";

export async function whoamiCommand() {
  console.log(chalk.blue.bold("\n👤 drew-billing-cli whoami\n"));

  // Read package.json for project info
  try {
    const packageJson = await fs.readJson(path.join(process.cwd(), "package.json"));
    console.log(chalk.gray("Project:"), chalk.white(packageJson.name || "Unknown"));
    console.log(chalk.gray("Version:"), chalk.white(packageJson.version || "Unknown"));
  } catch (error) {
    console.log(chalk.gray("Project:"), chalk.yellow("Could not read package.json"));
  }

  // Read environment configuration
  const envPath = path.join(process.cwd(), ".env.local");
  const envVars: Record<string, string> = {};

  try {
    const envContent = await fs.readFile(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        envVars[match[1]] = match[2].replace(/^["']/, "").replace(/["']$/, "");
      }
    });
  } catch (error) {
    // No env file
  }

  console.log();
  console.log(chalk.gray("Environment:"));

  // Stripe mode
  const stripeKey = envVars.STRIPE_SECRET_KEY || "";
  const isTestMode = stripeKey.startsWith("sk_test_");
  const isLiveMode = stripeKey.startsWith("sk_live_");

  if (isTestMode) {
    console.log(chalk.gray("  Stripe:"), chalk.yellow("TEST MODE"));
  } else if (isLiveMode) {
    console.log(chalk.gray("  Stripe:"), chalk.green("LIVE MODE ⚠️"));
  } else {
    console.log(chalk.gray("  Stripe:"), chalk.red("Not configured"));
  }

  // Sandbox mode
  const sandboxMode = envVars.BILLING_SANDBOX_MODE === "true";
  console.log(
    chalk.gray("  Sandbox:"),
    sandboxMode ? chalk.green("Enabled") : chalk.gray("Disabled")
  );

  // API URL
  const apiUrl = envVars.NEXT_PUBLIC_BILLING_API_URL || envVars.BILLING_API_URL;
  console.log(chalk.gray("  API URL:"), apiUrl || chalk.red("Not set"));

  // SDK version
  try {
    const packageJson = await fs.readJson(path.join(process.cwd(), "package.json"));
    const sdkVersion =
      packageJson.dependencies?.["@drewsepsi/billing-sdk"] ||
      packageJson.devDependencies?.["@drewsepsi/billing-sdk"];

    if (sdkVersion) {
      console.log(chalk.gray("  SDK:"), sdkVersion);
    } else {
      console.log(chalk.gray("  SDK:"), chalk.red("Not installed"));
    }
  } catch (error) {
    // ignore
  }

  console.log();

  // Check installed components
  const componentsPath = path.join(process.cwd(), "components/billing");
  try {
    const components = await fs.readdir(componentsPath);
    const componentFiles = components.filter((f) => f.endsWith(".tsx"));

    if (componentFiles.length > 0) {
      console.log(chalk.gray("Installed Components:"));
      componentFiles.forEach((file) => {
        console.log(chalk.gray("  •"), file.replace(".tsx", ""));
      });
    } else {
      console.log(chalk.gray("Components:"), chalk.yellow("None installed"));
      console.log(chalk.gray("  Install with: npx drew-billing-cli add <component>"));
    }
  } catch (error) {
    console.log(chalk.gray("Components:"), chalk.yellow("None installed"));
  }

  console.log();

  // Database status
  const hasDrizzleConfig = await fs.pathExists(
    path.join(process.cwd(), "drizzle.config.ts")
  );
  console.log(
    chalk.gray("Database:"),
    hasDrizzleConfig ? chalk.green("Configured") : chalk.yellow("Not configured")
  );

  // API routes
  const apiDir = path.join(process.cwd(), "app/api");
  const hasCheckout = await fs.pathExists(path.join(apiDir, "checkout/route.ts"));
  const hasWebhooks = await fs.pathExists(path.join(apiDir, "webhooks/stripe/route.ts"));

  console.log(chalk.gray("API Routes:"));
  console.log(chalk.gray("  /api/checkout"), hasCheckout ? chalk.green("✓") : chalk.red("✗"));
  console.log(chalk.gray("  /api/webhooks/stripe"), hasWebhooks ? chalk.green("✓") : chalk.red("✗"));

  console.log();
  console.log(chalk.gray("Commands:"));
  console.log(chalk.gray("  init       Initialize billing"));
  console.log(chalk.gray("  add        Add UI components"));
  console.log(chalk.gray("  verify     Verify setup"));
  console.log(chalk.gray("  sandbox    Toggle sandbox mode"));
  console.log();
}
