import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const iconsDir = path.join(root, "public", "icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Brand SVG with Wrench icon and sleek blue gradient
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="url(#paint0_linear)"/>
  <path d="M370 142C344 116 304 110 272 126L316 170L290 196L246 152C230 184 236 224 262 250C282 270 310 278 336 274L212 398C204 406 192 406 184 398L114 328C106 320 106 308 114 300L238 176C234 202 242 230 262 250Z" fill="white"/>
  <defs>
    <linearGradient id="paint0_linear" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1E3A5F"/>
      <stop offset="1" stop-color="#0F2138"/>
    </linearGradient>
  </defs>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  console.log("🎨 Generating PWA icons & favicon...");
  const svgBuffer = Buffer.from(svgIcon);

  for (const size of sizes) {
    const dest = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer).resize(size, size).toFile(dest);
    console.log(`   ✓ Created icon-${size}x${size}.png`);
  }

  // Generate favicon.ico
  const faviconDest = path.join(root, "public", "favicon.ico");
  await sharp(svgBuffer).resize(32, 32).toFile(faviconDest);
  console.log("   ✓ Created favicon.ico");
  console.log("✨ All PWA icons created successfully!");
}

generate().catch(console.error);
