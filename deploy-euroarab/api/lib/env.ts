import "dotenv/config";

function getEnv(name: string, defaultValue: string = ""): string {
  return process.env[name] ?? defaultValue;
}

export const env = {
  appId: getEnv("APP_ID", "euro-arab-market"),
  appSecret: getEnv("APP_SECRET", "sk-euro-arab-secret-2024"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/euroarabmarket"),
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", ""),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", ""),
  ownerUnionId: getEnv("OWNER_UNION_ID", ""),
};
