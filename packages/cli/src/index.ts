#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { verifyCommand } from "./commands/verify.js";
import { sandboxCommand } from "./commands/sandbox.js";
import { whoamiCommand } from "./commands/whoami.js";
import { telemetryCommand } from "./commands/telemetry.js";
import { doctorCommand } from "./commands/doctor.js";

const program = new Command();

program
  .name("drew-billing-cli")
  .description("CLI for drew-billing - Add subscriptions to your app in 10 minutes")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize @drew/billing in your Next.js project")
  .option("--skip-stripe", "Skip Stripe product creation")
  .option("--template <type>", "Template type (saas, api, usage)", "saas")
  .option("--yes", "Skip prompts and use defaults")
  .action(initCommand);

program
  .command("add <component>")
  .description("Add a billing component (pricing-table, upgrade-button, usage-meter)")
  .option("--path <path>", "Custom installation path")
  .action(addCommand);

program
  .command("verify")
  .description("Verify your billing setup is working correctly")
  .action(verifyCommand);

program
  .command("sandbox")
  .description("Toggle sandbox mode for testing without real charges")
  .option("--enable", "Enable sandbox mode")
  .option("--disable", "Disable sandbox mode")
  .action(sandboxCommand);

program
  .command("whoami")
  .description("Show current billing configuration")
  .action(whoamiCommand);

program
  .command("telemetry")
  .description("Manage anonymous usage telemetry")
  .option("--enable", "Enable telemetry")
  .option("--disable", "Disable telemetry")
  .action(telemetryCommand);

program
  .command("doctor")
  .description("Diagnose billing setup issues")
  .action(doctorCommand);

// Default help
if (process.argv.length === 2) {
  console.log(chalk.blue.bold("\n⚡ drew-billing-cli\n"));
  console.log("Add subscriptions to your app in 10 minutes.\n");
  console.log(chalk.gray("Quick start:"));
  console.log("  npx drew-billing-cli init\n");
  console.log(chalk.gray("Commands:"));
  console.log("  init       Initialize billing in your project");
  console.log("  add        Add prebuilt UI components");
  console.log("  verify     Verify your setup");
  console.log("  sandbox    Toggle sandbox mode");
  console.log("  whoami     Show current configuration");
  console.log("  doctor     Diagnose setup issues");
  console.log("  telemetry  Manage usage telemetry\n");
  console.log(chalk.gray("Documentation:"));
  console.log("  https://billing.drew.dev/docs\n");
}

program.parse();
