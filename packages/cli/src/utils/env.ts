import fs from "fs-extra";
import path from "path";

export async function updateEnvFile(
  vars: Record<string, string>
): Promise<void> {
  const envPath = path.join(process.cwd(), ".env.local");
  let content = "";

  // Read existing content
  try {
    content = await fs.readFile(envPath, "utf-8");
  } catch {
    // File doesn't exist, start fresh
  }

  // Add/update each variable
  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;

    if (content.includes(`${key}=`)) {
      // Update existing
      content = content.replace(new RegExp(`${key}=.*`), line);
    } else {
      // Add new
      content += content.endsWith("\n") ? "" : "\n";
      content += `${line}\n`;
    }
  }

  await fs.writeFile(envPath, content);
}
