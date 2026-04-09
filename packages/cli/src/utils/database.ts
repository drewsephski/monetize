import { execa } from "execa";
import fs from "fs-extra";
import path from "path";

export async function setupDatabase(): Promise<void> {
  const cwd = process.cwd();

  // Check if drizzle is configured
  const hasDrizzleConfig = await fs.pathExists(path.join(cwd, "drizzle.config.ts")) ||
                           await fs.pathExists(path.join(cwd, "drizzle.config.js"));

  if (!hasDrizzleConfig) {
    throw new Error(
      "Drizzle ORM not configured. " +
      "Please set up Drizzle first: https://orm.drizzle.team/docs/get-started"
    );
  }

  // Check if drizzle-kit is installed
  try {
    await execa("npx", ["drizzle-kit", "--version"], {
      cwd,
      stdio: "pipe",
    });
  } catch {
    throw new Error(
      "drizzle-kit not found. Install it with: npm install -D drizzle-kit"
    );
  }

  // Check if database URL is configured
  const envLocal = await fs.readFile(path.join(cwd, ".env.local"), "utf-8").catch(() => "");
  const env = await fs.readFile(path.join(cwd, ".env"), "utf-8").catch(() => "");
  
  const hasDbUrl = envLocal.includes("DATABASE_URL=") || env.includes("DATABASE_URL=");
  
  if (!hasDbUrl) {
    throw new Error(
      "DATABASE_URL not found in .env or .env.local. " +
      "Please add your database connection string."
    );
  }

  // Run drizzle push
  try {
    const result = await execa("npx", ["drizzle-kit", "push", "--force"], {
      cwd,
      stdio: "pipe",
      timeout: 60000, // 1 minute timeout
    });

    if (result.stderr && result.stderr.includes("error")) {
      throw new Error(`Database push failed: ${result.stderr}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a timeout
      if (error.message.includes("timeout")) {
        throw new Error("Database push timed out. Please check your database connection.");
      }
      throw new Error(`Database push failed: ${error.message}`);
    }
    throw new Error("Database push failed. Run 'npx drizzle-kit push' manually to see details.");
  }
}
