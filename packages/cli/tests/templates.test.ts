import { describe, expect, it } from "bun:test";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { installTemplates, resolveTemplateRoot } from "../src/utils/templates";

describe("resolveTemplateRoot", () => {
  it("finds templates when running from the bundled dist entrypoint", async () => {
    const workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), "drew-cli-dist-"));
    const packageDir = path.join(workspaceDir, "node_modules", "drew-billing-cli");
    const templateDir = path.join(packageDir, "templates", "common");

    try {
      await fs.ensureDir(templateDir);

      const templateRoot = resolveTemplateRoot(path.join(packageDir, "dist", "index.js"));
      expect(templateRoot).toBe(path.join(packageDir, "templates"));
    } finally {
      await fs.remove(workspaceDir);
    }
  });

  it("finds templates when running from source", async () => {
    const workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), "drew-cli-src-"));
    const packageDir = path.join(workspaceDir, "packages", "cli");
    const templateDir = path.join(packageDir, "templates", "common");

    try {
      await fs.ensureDir(templateDir);

      const templateRoot = resolveTemplateRoot(path.join(packageDir, "src", "utils", "templates.ts"));
      expect(templateRoot).toBe(path.join(packageDir, "templates"));
    } finally {
      await fs.remove(workspaceDir);
    }
  });
});

describe("installTemplates", () => {
  it("copies the full SaaS template into the target project", async () => {
    const targetDir = await fs.mkdtemp(path.join(os.tmpdir(), "drew-cli-template-"));

    try {
      await installTemplates(
        "saas",
        [
          { id: "prod_pro", name: "Pro", priceId: "price_pro" },
          { id: "prod_enterprise", name: "Enterprise", priceId: "price_enterprise" },
        ],
        targetDir
      );

      const requiredFiles = [
        "app/page.tsx",
        "app/pricing/page.tsx",
        "app/dashboard/page.tsx",
        "components/example-kit.tsx",
        "lib/site.ts",
      ];

      for (const relativePath of requiredFiles) {
        expect(await fs.pathExists(path.join(targetDir, relativePath))).toBe(true);
      }

      const siteConfig = await fs.readFile(path.join(targetDir, "lib/site.ts"), "utf8");
      expect(siteConfig).toContain("price_pro");
      expect(siteConfig).toContain("price_enterprise");
    } finally {
      await fs.remove(targetDir);
    }
  });
});
