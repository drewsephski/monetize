import fs from "fs-extra";
import path from "path";

export interface Framework {
  name: "nextjs" | "react" | "vue" | "svelte" | "express" | "unknown";
  version?: string;
  type?: "app" | "pages";
}

export async function detectFramework(): Promise<Framework> {
  const cwd = process.cwd();

  // Check for Next.js
  const packageJsonPath = path.join(cwd, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.next) {
      // Check for app vs pages router
      const hasAppDir = await fs.pathExists(path.join(cwd, "app"));
      const hasPagesDir = await fs.pathExists(path.join(cwd, "pages"));

      return {
        name: "nextjs",
        version: deps.next,
        type: hasAppDir ? "app" : hasPagesDir ? "pages" : "app",
      };
    }

    if (deps.react) {
      return { name: "react", version: deps.react };
    }

    if (deps.vue || deps["@vue/core"]) {
      return { name: "vue", version: deps.vue || deps["@vue/core"] };
    }

    if (deps.express) {
      return { name: "express", version: deps.express };
    }
  }

  // Check for config files
  if (await fs.pathExists(path.join(cwd, "next.config.js")) ||
      await fs.pathExists(path.join(cwd, "next.config.ts")) ||
      await fs.pathExists(path.join(cwd, "next.config.mjs"))) {
    return { name: "nextjs", type: "app" };
  }

  if (await fs.pathExists(path.join(cwd, "vite.config.ts"))) {
    return { name: "react" };
  }

  return { name: "unknown" };
}

export function isTypeScriptProject(): Promise<boolean> {
  return fs.pathExists(path.join(process.cwd(), "tsconfig.json"));
}
