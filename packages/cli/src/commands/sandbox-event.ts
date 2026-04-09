#!/usr/bin/env node
// Sandbox Event Command - Trigger simulated Stripe events
// Usage: npx drew-billing-cli sandbox event <event-type>

import chalk from "chalk";
import ora from "ora";
import { Command } from "commander";
import {
  simulateEvent,
  listAvailableEvents,
  type SandboxEventType,
} from "../sandbox-types.js";

export function createSandboxEventCommand(): Command {
  const command = new Command("event")
    .description("Trigger a simulated Stripe event")
    .argument("[event-type]", "Type of event to simulate")
    .option("--params <params>", "Event parameters as JSON")
    .option("--list", "List all available event types")
    .action(async (eventType: string | undefined, options) => {
      console.log(chalk.blue.bold("\n🎭 Sandbox Event Simulator\n"));

      // List mode
      if (options.list || !eventType) {
        console.log(chalk.white("Available events:\n"));
        const events = listAvailableEvents();

        events.forEach((e) => {
          console.log(chalk.cyan(`  ${e.type}`));
          console.log(chalk.gray(`    ${e.description}`));
          if (e.params.length > 0) {
            console.log(chalk.gray(`    params: ${e.params.join(", ")}`));
          }
          console.log();
        });

        console.log(chalk.gray("Usage:"));
        console.log(chalk.white("  npx drew-billing-cli sandbox event checkout.session.completed"));
        console.log(chalk.white("  npx drew-billing-cli sandbox event customer.subscription.created --params '{\"customer_id\":\"cus_123\"}'"));
        return;
      }

      // Validate event type
      const validEvents = listAvailableEvents().map((e) => e.type);
      if (!validEvents.includes(eventType as SandboxEventType)) {
        console.log(chalk.red(`\n❌ Unknown event type: ${eventType}\n`));
        console.log(chalk.gray("Run with --list to see available events\n"));
        process.exit(1);
      }

      // Parse params
      let params: Record<string, string> = {};
      if (options.params) {
        try {
          params = JSON.parse(options.params);
        } catch (error) {
          console.log(chalk.red("\n❌ Invalid JSON in --params\n"));
          process.exit(1);
        }
      }

      // Simulate the event
      const spinner = ora(`Triggering ${eventType}...`).start();

      try {
        const result = await simulateEvent(eventType as SandboxEventType, params);
        spinner.succeed(`Event triggered: ${eventType}`);

        console.log(chalk.green("\n✅ Event simulated successfully\n"));
        console.log(chalk.gray("Result:"));
        console.log(JSON.stringify(result, null, 2));
        console.log();

        // Show next steps
        console.log(chalk.gray("Next steps:"));
        console.log("  • Check your webhook endpoint");
        console.log("  • View sandbox dashboard: http://localhost:3001");
        console.log("  • Verify the event in your app\n");
      } catch (error: any) {
        spinner.fail(`Failed to trigger event: ${eventType}`);
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
        process.exit(1);
      }
    });

  return command;
}

// Main entry point for standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const program = new Command()
    .name("sandbox-event")
    .description("Trigger simulated Stripe events")
    .version("1.0.0");

  program.addCommand(createSandboxEventCommand());
  program.parse();
}
