/**
 * Doctor command - Self-diagnosis for billing setup
 * Usage: npx @drew/billing doctor
 */

import chalk from "chalk";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execa } from "execa";
import { detectFramework } from "../utils/detect.js";

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  fix?: string;
}

export async function doctorCommand() {
  console.log(chalk.blue.bold("\n🔍 @drew/billing doctor\n"));
  console.log(chalk.gray("Running diagnostics...\n"));

  const checks: CheckResult[] = [];

  // Check 1: Environment variables
  checks.push(await checkEnvironmentVariables());

  // Check 2: API connectivity
  checks.push(await checkApiConnectivity());

  // Check 3: Webhook configuration
  checks.push(await checkWebhookConfig());

  // Check 4: Database connection
  checks.push(await checkDatabaseConnection());

  // Check 5: Stripe configuration
  checks.push(await checkStripeConfig());

  // Check 6: Dependencies
  checks.push(await checkDependencies());

  // Check 7: Framework compatibility
  checks.push(await checkFramework());

  // Display results
  displayResults(checks);
}

async function checkEnvironmentVariables(): Promise<CheckResult> {
  const envPath = join(process.cwd(), ".env.local");
  const envExamplePath = join(process.cwd(), ".env.example");
  
  let envContent = "";
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, "utf-8");
  } else if (existsSync(join(process.cwd(), ".env"))) {
    envContent = readFileSync(join(process.cwd(), ".env"), "utf-8");
  }

  const requiredVars = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];

  const missingVars = requiredVars.filter(v => !envContent.includes(v));

  if (missingVars.length === 0) {
    return {
      name: "Environment Variables",
      status: "pass",
      message: "All required variables configured",
    };
  }

  const hasExample = existsSync(envExamplePath);
  
  return {
    name: "Environment Variables",
    status: "fail",
    message: `Missing: ${missingVars.join(", ")}`,
    fix: hasExample 
      ? `cp .env.example .env.local && edit with your Stripe keys`
      : `Create .env.local with:\n${requiredVars.map(v => `${v}=...`).join("\n")}`,
  };
}

async function checkApiConnectivity(): Promise<CheckResult> {
  try {
    // Check if dev server is running
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch("http://localhost:3000/api/health", {
      signal: controller.signal,
    }).catch(() => null);
    
    clearTimeout(timeoutId);

    if (response?.ok) {
      return {
        name: "API Connectivity",
        status: "pass",
        message: "Billing API responding at localhost:3000",
      };
    }

    return {
      name: "API Connectivity",
      status: "warn",
      message: "Dev server not running or API not accessible",
      fix: "Start dev server: npm run dev",
    };
  } catch {
    return {
      name: "API Connectivity",
      status: "warn",
      message: "Could not connect to localhost:3000",
      fix: "Start dev server: npm run dev",
    };
  }
}

async function checkWebhookConfig(): Promise<CheckResult> {
  const envPath = join(process.cwd(), ".env.local");
  let webhookSecret = "";
  
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(/STRIPE_WEBHOOK_SECRET=(.+)/);
    if (match) webhookSecret = match[1].trim();
  }

  if (!webhookSecret || webhookSecret === "whsec_...") {
    return {
      name: "Webhook Configuration",
      status: "fail",
      message: "Webhook secret not configured",
      fix: "1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook\n2. Copy webhook secret to .env.local",
    };
  }

  if (webhookSecret.startsWith("whsec_")) {
    return {
      name: "Webhook Configuration",
      status: "pass",
      message: "Webhook secret configured",
    };
  }

  return {
    name: "Webhook Configuration",
    status: "warn",
    message: "Webhook secret format looks unusual",
    fix: "Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'",
  };
}

async function checkDatabaseConnection(): Promise<CheckResult> {
  try {
    // Check for drizzle config
    const hasDrizzleConfig = existsSync(join(process.cwd(), "drizzle.config.ts"));
    
    if (!hasDrizzleConfig) {
      return {
        name: "Database Connection",
        status: "fail",
        message: "No Drizzle config found",
        fix: "Run: npx @drew/billing init to set up database",
      };
    }

    // Try to run a quick db check
    try {
      await execa("npx", ["drizzle-kit", "check"], { 
        cwd: process.cwd(),
        timeout: 10000,
        reject: false,
      });
      
      return {
        name: "Database Connection",
        status: "pass",
        message: "Database configuration found",
      };
    } catch {
      return {
        name: "Database Connection",
        status: "warn",
        message: "Database config exists but connection not verified",
        fix: "Run: npx drizzle-kit push to sync schema",
      };
    }
  } catch {
    return {
      name: "Database Connection",
      status: "warn",
      message: "Could not verify database connection",
    };
  }
}

async function checkStripeConfig(): Promise<CheckResult> {
  const envPath = join(process.cwd(), ".env.local");
  let stripeKey = "";
  
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(/STRIPE_SECRET_KEY=(.+)/);
    if (match) stripeKey = match[1].trim();
  }

  if (!stripeKey) {
    return {
      name: "Stripe Configuration",
      status: "fail",
      message: "STRIPE_SECRET_KEY not found",
      fix: "Add STRIPE_SECRET_KEY=sk_test_... to .env.local",
    };
  }

  if (stripeKey.startsWith("sk_test_")) {
    return {
      name: "Stripe Configuration",
      status: "pass",
      message: "Test mode Stripe key configured",
    };
  }

  if (stripeKey.startsWith("sk_live_")) {
    return {
      name: "Stripe Configuration",
      status: "warn",
      message: "⚠️ Live Stripe key detected",
      fix: "Use test keys for development: https://dashboard.stripe.com/test/apikeys",
    };
  }

  return {
    name: "Stripe Configuration",
    status: "fail",
    message: "Invalid Stripe key format",
    fix: "Key should start with sk_test_ or sk_live_",
  };
}

async function checkDependencies(): Promise<CheckResult> {
  const packagePath = join(process.cwd(), "package.json");
  
  if (!existsSync(packagePath)) {
    return {
      name: "Dependencies",
      status: "fail",
      message: "No package.json found",
      fix: "Run: npm init",
    };
  }

  try {
    const pkg = JSON.parse(readFileSync(packagePath, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    const required = ["stripe", "drizzle-orm"];
    const missing = required.filter(d => !deps[d]);

    if (missing.length === 0) {
      return {
        name: "Dependencies",
        status: "pass",
        message: "All required packages installed",
      };
    }

    return {
      name: "Dependencies",
      status: "fail",
      message: `Missing: ${missing.join(", ")}`,
      fix: `npm install ${missing.join(" ")}`,
    };
  } catch {
    return {
      name: "Dependencies",
      status: "warn",
      message: "Could not parse package.json",
    };
  }
}

async function checkFramework(): Promise<CheckResult> {
  const framework = await detectFramework();

  if (framework.name === "nextjs") {
    return {
      name: "Framework Support",
      status: "pass",
      message: `Next.js ${framework.version || ""} detected`,
    };
  }

  return {
    name: "Framework Support",
    status: "warn",
    message: `${framework.name} detected (limited support)`,
    fix: "Next.js is fully supported. Other frameworks have basic support.",
  };
}

function displayResults(checks: CheckResult[]) {
  const passed = checks.filter(c => c.status === "pass").length;
  const failed = checks.filter(c => c.status === "fail").length;
  const warnings = checks.filter(c => c.status === "warn").length;

  console.log(chalk.white.bold("Results:\n"));

  for (const check of checks) {
    const icon = check.status === "pass" 
      ? chalk.green("✓") 
      : check.status === "fail" 
        ? chalk.red("✗") 
        : chalk.yellow("⚠");
    
    console.log(`${icon} ${chalk.white(check.name)}`);
    console.log(`  ${chalk.gray(check.message)}`);
    
    if (check.fix) {
      console.log(`  ${chalk.cyan("Fix:")} ${check.fix}`);
    }
    console.log();
  }

  // Summary
  console.log(chalk.white.bold("Summary:"));
  console.log(`  ${chalk.green(`${passed} passing`)}`);
  if (failed > 0) console.log(`  ${chalk.red(`${failed} failing`)}`);
  if (warnings > 0) console.log(`  ${chalk.yellow(`${warnings} warnings`)}`);

  if (failed === 0 && warnings === 0) {
    console.log(chalk.green.bold("\n✅ All checks passed! Your billing setup looks good.\n"));
  } else if (failed === 0) {
    console.log(chalk.yellow("\n⚠️  Some warnings - review above.\n"));
  } else {
    console.log(chalk.red(`\n❌ ${failed} issue(s) need attention. Run the suggested fixes above.\n`));
    console.log(chalk.gray("Need help? https://github.com/drewsephski/monetize/issues\n"));
  }
}
