import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("configuração PWA e marca", () => {
  it("expõe manifesto instalável e ícones declarados", () => {
    const manifest = JSON.parse(readFileSync(resolve(root, "public/manifest.json"), "utf8")) as {
      name: string;
      display: string;
      icons: { src: string; sizes: string }[];
    };
    expect(manifest.name).toContain("MapaMente");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(["192x192", "512x512"]);
    manifest.icons.forEach((icon) => expect(existsSync(resolve(root, "public", icon.src.replace(/^\//, "")))).toBe(true));
  });

  it("registra service worker com fallback para o shell", () => {
    const html = readFileSync(resolve(root, "app/+html.tsx"), "utf8");
    const serviceWorker = readFileSync(resolve(root, "public/sw.js"), "utf8");
    expect(html).toContain("navigator.serviceWorker.register");
    expect(serviceWorker).toContain("caches.match(\"/\")");
  });

  it("não mantém placeholders do scaffold na configuração", () => {
    const config = readFileSync(resolve(root, "app.config.ts"), "utf8");
    expect(config).toContain('appName: "MapaMente"');
    expect(config).not.toMatch(/\{\{[^}]+\}\}/);
  });
});
