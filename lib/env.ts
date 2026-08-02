// ============================================================
// Tashgheel — Environment Variables Type Safety
// ============================================================

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tashgheel_db?sslmode=disable",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "tashgheel_default_access_secret_key_min_32_chars_2026_super_secure",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "tashgheel_default_refresh_secret_key_min_32_chars_2026_super_secure",
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "public/uploads",
  APP_NAME: process.env.APP_NAME || "تشغيل للتصنيع",
  APP_VERSION: process.env.APP_VERSION || "1.0.0",
} as const;
