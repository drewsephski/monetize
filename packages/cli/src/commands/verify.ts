import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export async function verifyCommand() {
  console.log(chalk.blue.bold("\n🔍 @drewsepsi/billing verify\n"));
  console.log(chalk.gray("Checking your billing setup...\n"));

  const results: CheckResult[] = [];

  // Check 1: Environment variables
  const envSpinner = ora("Checking environment variables...").start();
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const envExists = await fs.pathExists(envPath);

    if (!envExists) {
      results.push({
        name: "Environment File",
        status: "fail",
        message: ".env.local not found",
      });
      envSpinner.fail();
    } else {
      const envContent = await fs.readFile(envPath, "utf-8");
      const requiredVars = [
        "STRIPE_SECRET_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      ];
      const missing = requiredVars.filter((v) => !envContent.includes(v));

      if (missing.length > 0) {
        results.push({
          name: "Environment Variables",
          status: "fail",
          message: `Missing: ${missing.join(", ")}`,
        });
        envSpinner.fail();
      } else {
        results.push({
          name: "Environment Variables",
          status: "pass",
          message: "All required variables present",
        });
        envSpinner.succeed();
      }
    }
  } catch {
    results.push({
      name: "Environment Variables",
      status: "fail",
      message: "Could not read .env file",
    });
    envSpinner.fail();
  }

  // Check 2: Stripe API connection
  const stripeSpinner = ora("Checking Stripe connection...").start();
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });

    const account = await stripe.accounts.retrieve();
    results.push({
      name: "Stripe API",
      status: "pass",
      message: `Connected to ${account.settings?.dashboard?.display_name || "Stripe account"}`,
    });
    stripeSpinner.succeed();
  } catch {
    results.push({
      name: "Stripe API",
      status: "fail",
      message: "Could not connect to Stripe API",
    });
    stripeSpinner.fail();
  }

  // Check 3: Database connection
  const dbSpinner = ora("Checking database...").start();
  try {
    // Check for drizzle config or schema file
    const hasDrizzleConfig = await fs.pathExists(
      path.join(process.cwd(), "drizzle.config.ts")
    );
    const hasSchema = await fs.pathExists(
      path.join(process.cwd(), "drizzle/schema.ts")
    );

    if (hasDrizzleConfig && hasSchema) {
      results.push({
        name: "Database Setup",
        status: "pass",
        message: "Drizzle ORM configured",
      });
      dbSpinner.succeed();
    } else {
      results.push({
        name: "Database Setup",
        status: "warn",
        message: "Database configuration not detected",
      });
      dbSpinner.warn();
    }
  } catch {
    results.push({
      name: "Database Setup",
      status: "warn",
      message: "Could not verify database setup",
    });
    dbSpinner.warn();
  }

  // Check 4: API routes
  const apiSpinner = ora("Checking API routes...").start();
  try {
    const requiredRoutes = [
      "api/checkout/route.ts",
      "api/webhooks/stripe/route.ts",
      "api/entitlements/[userId]/route.ts",
    ];

    const appDir = path.join(process.cwd(), "app");
    const missingRoutes: string[] = [];

    for (const route of requiredRoutes) {
      const fullPath = path.join(appDir, route);
      if (!(await fs.pathExists(fullPath))) {
        missingRoutes.push(route);
      }
    }

    if (missingRoutes.length > 0) {
      results.push({
        name: "API Routes",
        status: "warn",
        message: `Missing routes: ${missingRoutes.length}`,
      });
      apiSpinner.warn();
    } else {
      results.push({
        name: "API Routes",
        status: "pass",
        message: "All required routes present",
      });
      apiSpinner.succeed();
    }
  } catch {
    results.push({
      name: "API Routes",
      status: "warn",
      message: "Could not verify API routes",
    });
    apiSpinner.warn();
  }

  // Check 5: SDK installation
  const sdkSpinner = ora("Checking SDK...").start();
  try {
    const packageJson = await fs.readJson(path.join(process.cwd(), "package.json"));
    // Check for stripe SDK (required for billing)
    const hasStripe =
      packageJson.dependencies?.["stripe"] ||
      packageJson.devDependencies?.["stripe"];

    if (hasStripe) {
      results.push({
        name: "Stripe SDK",
        status: "pass",
        message: "stripe SDK installed",
      });
      sdkSpinner.succeed();
    } else {
      results.push({
        name: "Stripe SDK",
        status: "fail",
        message: "Stripe SDK not found in dependencies",
      });
      sdkSpinner.fail();
    }
  } catch {
    results.push({
      name: "SDK Installation",
      status: "fail",
      message: "Could not check package.json",
    });
    sdkSpinner.fail();
  }

  // Summary
  console.log(chalk.blue.bold("\n📊 Summary\n"));

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;

  results.forEach((result) => {
    const icon =
      result.status === "pass"
        ? chalk.green("✓")
        : result.status === "fail"
          ? chalk.red("✗")
          : chalk.yellow("⚠");
    const color =
      result.status === "pass"
        ? chalk.green
        : result.status === "fail"
          ? chalk.red
          : chalk.yellow;

    console.log(`${icon} ${color(result.name)}`);
    console.log(chalk.gray(`  ${result.message}`));
  });

  console.log();

  if (failed === 0) {
    console.log(chalk.green.bold("✅ All checks passed!"));
    console.log(chalk.gray("Your billing setup looks good."));
  } else if (failed > 0 && passed > 0) {
    console.log(chalk.yellow.bold("⚠️  Some checks failed"));
    console.log(chalk.gray("Review the issues above to complete your setup."));
  } else {
    console.log(chalk.red.bold("❌ Setup incomplete"));
    console.log(chalk.gray("Run: npx drew-billing-cli init"));
  }

  console.log();
  console.log(chalk.gray("Next steps:"));
  console.log(chalk.gray("  • Start dev server: npm run dev"));
  console.log(chalk.gray("  • Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe"));
  console.log(chalk.gray("  • View docs: https://github.com/drewsephski/monetize/tree/main/packages/cli#readme"));
  console.log();
}
