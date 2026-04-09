import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";

interface SandboxOptions {
  enable?: boolean;
  disable?: boolean;
}

export async function sandboxCommand(options: SandboxOptions) {
  console.log(chalk.blue.bold("\n🏖️  @drew/billing sandbox\n"));

  const envPath = path.join(process.cwd(), ".env.local");

  // Read current env
  let envContent = "";
  try {
    envContent = await fs.readFile(envPath, "utf-8");
  } catch (error) {
    // File doesn't exist, that's okay
  }

  // Determine new state
  let newSandboxState: boolean;

  if (options.enable) {
    newSandboxState = true;
  } else if (options.disable) {
    newSandboxState = false;
  } else {
    // Toggle mode - check current state
    const currentMatch = envContent.match(/BILLING_SANDBOX_MODE=(true|false)/);
    const currentState = currentMatch ? currentMatch[1] === "true" : false;
    newSandboxState = !currentState;
  }

  // Update env file
  const spinner = ora(
    newSandboxState ? "Enabling sandbox mode..." : "Disabling sandbox mode..."
  ).start();

  try {
    if (envContent.includes("BILLING_SANDBOX_MODE=")) {
      envContent = envContent.replace(
        /BILLING_SANDBOX_MODE=(true|false)/,
        `BILLING_SANDBOX_MODE=${newSandboxState}`
      );
    } else {
      envContent += `\n# Sandbox mode - no real charges\nBILLING_SANDBOX_MODE=${newSandboxState}\n`;
    }

    await fs.writeFile(envPath, envContent);
    spinner.succeed();
  } catch (error) {
    spinner.fail("Failed to update sandbox mode");
    console.log(error);
    process.exit(1);
  }

  // Print status
  if (newSandboxState) {
    console.log(chalk.green.bold("\n✅ Sandbox mode ENABLED\n"));
    console.log(chalk.gray("What this means:"));
    console.log(chalk.gray("  • No real charges will be processed"));
    console.log(chalk.gray("  • Stripe test mode API keys used"));
    console.log(chalk.gray("  • Webhooks simulated locally"));
    console.log(chalk.gray("  • Usage tracked but not billed"));
    console.log();
    console.log(chalk.yellow("Perfect for development and testing!"));
  } else {
    console.log(chalk.yellow.bold("\n⚠️  Sandbox mode DISABLED\n"));
    console.log(chalk.gray("What this means:"));
    console.log(chalk.gray("  • Real charges will be processed"));
    console.log(chalk.gray("  • Stripe live mode API keys required"));
    console.log(chalk.gray("  • Production webhooks active"));
    console.log();
    console.log(chalk.red("Make sure you have live Stripe keys configured!"));
  }

  console.log();
  console.log(chalk.gray("Switch back anytime:"));
  console.log(chalk.cyan(`  npx drew-billing-cli sandbox`));
  console.log();
}
