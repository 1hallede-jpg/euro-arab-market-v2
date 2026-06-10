import "dotenv/config";

function getEnv(name: string, defaultValue: string = ""): string {
  return process.env[name] ?? defaultValue;
}

function detectIsProduction(): boolean {
  // Render sets PORT but not always NODE_ENV
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.PORT) return true; // Render provides PORT
  if (process.env.RENDER) return true; // Render-specific
  return false;
}

export const env = {
  appId: getEnv("APP_ID", "euro-arab-market"),
  appSecret: getEnv("APP_SECRET", "sk-euro-arab-secret-2024"),
  isProduction: detectIsProduction(),
  databaseUrl: getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/euroarabmarket"),
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", ""),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", ""),
  ownerUnionId: getEnv("OWNER_UNION_ID", ""),
};
