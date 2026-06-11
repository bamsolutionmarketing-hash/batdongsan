import "server-only";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

// Serverless runtimes (Vercel/Lambda) ship no fonts + no fontconfig, so Sharp's
// librsvg renders our SVG text as blank — captions/branding vanish from every
// generated image. We bundle DejaVu Sans (covers Vietnamese diacritics) under
// ./fonts and point fontconfig at it, aliasing the generic "sans-serif" the
// SVGs use. Idempotent; runs once on first import of any render module.
let done = false;

export function ensureFonts(): void {
  if (done) return;
  done = true;
  try {
    const fontsDir = path.join(process.cwd(), "fonts");
    if (!existsSync(path.join(fontsDir, "DejaVuSans.ttf"))) return; // dev w/o bundle → use system
    const cacheDir = "/tmp/fontconfig";
    const confPath = "/tmp/nhapilot-fonts.conf";
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(
      confPath,
      `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontsDir}</dir>
  <dir>/usr/share/fonts</dir>
  <cachedir>${cacheDir}</cachedir>
  <alias><family>sans-serif</family><prefer><family>DejaVu Sans</family></prefer></alias>
  <alias><family>serif</family><prefer><family>DejaVu Sans</family></prefer></alias>
</fontconfig>
`,
    );
    // Only set if unset, so a host that already configured fonts wins.
    if (!process.env.FONTCONFIG_FILE) process.env.FONTCONFIG_FILE = confPath;
  } catch {
    /* fall back to whatever fonts the host provides */
  }
}

// Side-effect on import: env must be set before librsvg initialises fontconfig
// (lazy, on first text render) — every render module imports this at the top.
ensureFonts();
