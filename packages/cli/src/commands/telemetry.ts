/**
 * Telemetry command for CLI
 * Enable/disable anonymous usage tracking
 */

import chalk from "chalk";
import {
  loadTelemetryConfig,
  enableTelemetry,
  disableTelemetry,
  trackEvent,
} from "../utils/telemetry.js";

interface TelemetryOptions {
  enable?: boolean;
  disable?: boolean;
  status?: boolean;
}

export async function telemetryCommand(options: TelemetryOptions) {
  console.log(chalk.blue.bold("\n📊 Telemetry Settings\n"));

  const config = loadTelemetryConfig();

  if (options.enable) {
    enableTelemetry();
    console.log(chalk.green("✅ Anonymous telemetry enabled"));
    console.log(chalk.gray("\nWe collect:"));
    console.log(chalk.gray("  • Command usage (init, add, verify, etc.)"));
    console.log(chalk.gray("  • Performance metrics (timing)"));
    console.log(chalk.gray("  • Error reports (no stack traces with PII)"));
    console.log(chalk.gray("\nWe NEVER collect:"));
    console.log(chalk.gray("  • Personal information"));
    console.log(chalk.gray("  • Stripe keys or API credentials"));
    console.log(chalk.gray("  • Code or project details"));
    console.log(chalk.gray("  • IP addresses"));
    
    trackEvent("telemetry_enabled");
    return;
  }

  if (options.disable) {
    disableTelemetry();
    console.log(chalk.yellow("❌ Anonymous telemetry disabled"));
    console.log(chalk.gray("You can re-enable anytime with: npx @drew/billing telemetry --enable"));
    return;
  }

  // Show status
  console.log(chalk.white("Current status:"));
  console.log(`  Enabled: ${config.enabled ? chalk.green("Yes") : chalk.red("No")}`);
  
  if (config.machineId) {
    console.log(`  Machine ID: ${chalk.gray(config.machineId)}`);
  }
  
  if (config.optedInAt) {
    console.log(`  Decision date: ${chalk.gray(config.optedInAt)}`);
  }

  console.log(chalk.gray("\nUsage:"));
  console.log(chalk.gray("  npx @drew/billing telemetry --enable   # Enable telemetry"));
  console.log(chalk.gray("  npx @drew/billing telemetry --disable  # Disable telemetry"));
  console.log(chalk.gray("  npx @drew/billing telemetry            # Show status\n"));

  if (!config.optedInAt) {
    console.log(chalk.blue("💡 Why enable telemetry?"));
    console.log(chalk.gray("Anonymous data helps us improve the CLI and catch bugs faster."));
    console.log(chalk.gray("No personal information is ever collected.\n"));
  }
}
