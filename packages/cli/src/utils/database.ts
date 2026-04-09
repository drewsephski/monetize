import { execa } from "execa";

export async function setupDatabase(): Promise<void> {
  // Check if drizzle is already configured
  try {
    await execa("npx", ["drizzle-kit", "push", "--force"], {
      cwd: process.cwd(),
      stdio: "pipe",
    });
  } catch (error) {
    // If drizzle isn't configured, that's okay - user will do it manually
    throw new Error("Database push failed. Run 'npx drizzle-kit push' manually.");
  }
}
