import fs from "fs";
import path from "path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

if (fs.existsSync(standalone)) {
  console.log("📦 Copying static assets to .next/standalone...");

  const publicSrc = path.join(root, "public");
  const publicDest = path.join(standalone, "public");
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
  }

  const staticSrc = path.join(root, ".next", "static");
  const staticDest = path.join(standalone, ".next", "static");
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
  }

  console.log("✅ Static assets copied to standalone successfully!");
}
