import fs from "fs-extra";
import path from "path";
import { execa } from "execa";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export async function detectPackageManager(): Promise<PackageManager> {
  const cwd = process.cwd();

  // Check for lock files
  if (await fs.pathExists(path.join(cwd, "bun.lockb")) || await fs.pathExists(path.join(cwd, "bun.lock"))) {
    return "bun";
  }
  if (await fs.pathExists(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (await fs.pathExists(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  // Default to npm
  return "npm";
}

export function getInstallCommand(pkgManager: PackageManager): string {
  switch (pkgManager) {
    case "yarn":
      return "add";
    case "pnpm":
      return "add";
    case "bun":
      return "add";
    default:
      return "install";
  }
}

export function getRunCommand(pkgManager: PackageManager): string {
  switch (pkgManager) {
    case "npm":
      return "npx";
    default:
      return `${pkgManager} dlx`;
  }
}

export async function installDependencies(
  packages: string[],
  options: { dev?: boolean } = {}
): Promise<void> {
  const pkgManager = await detectPackageManager();
  const installCmd = getInstallCommand(pkgManager);
  const args = [installCmd, ...packages];

  if (options.dev) {
    if (pkgManager === "npm") {
      args.push("--save-dev");
    } else {
      args.push("-D");
    }
  }

  await execa(pkgManager, args, {
    cwd: process.cwd(),
    stdio: "pipe",
  });
}
