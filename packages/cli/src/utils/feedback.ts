import chalk from "chalk";
import inquirer from "inquirer";
import { trackEvent } from "./telemetry.js";

export interface FeedbackData {
  rating: "positive" | "negative" | "neutral";
  feedback?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
}

/**
 * Prompt user for feedback after CLI operations
 */
export async function promptForFeedback(eventType: string, metadata?: Record<string, unknown>): Promise<void> {
  console.log(); // Empty line for spacing
  console.log(chalk.blue.bold("📣 Quick Feedback"));
  console.log(chalk.gray("Your feedback helps us improve."));
  console.log();

  try {
    const { wasEasy } = await inquirer.prompt([
      {
        type: "confirm",
        name: "wasEasy",
        message: "Was this easy to set up?",
        default: true,
      },
    ]);

    let feedbackText: string | undefined;

    if (!wasEasy) {
      const { feedback } = await inquirer.prompt([
        {
          type: "input",
          name: "feedback",
          message: "What was difficult? (optional, 1 sentence)",
        },
      ]);
      feedbackText = feedback;
    }

    // Track the feedback via telemetry
    trackEvent("feedback_collected", {
      eventType,
      rating: wasEasy ? "positive" : "negative",
      feedback: feedbackText,
      ...metadata,
    });

    // Thank the user
    console.log();
    if (wasEasy) {
      console.log(chalk.green("✨ Thanks! Glad it went smoothly."));
    } else {
      console.log(chalk.yellow("📝 Thanks for the feedback — we'll use it to improve."));
    }
    console.log();

  } catch {
    // Silently ignore feedback errors — don't block the user
  }
}

/**
 * Track passive feedback signals (like doctor command usage)
 */
export function trackPassiveFeedback(
  eventType: string,
  data: Record<string, unknown>
): void {
  trackEvent("passive_feedback", {
    eventType,
    ...data,
    timestamp: new Date().toISOString(),
  });
}
