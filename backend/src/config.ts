export interface AppConfig {
  databaseUrl: string;
  port: number;
  syncSecret: string;
  githubToken: string;
}

export function getConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  return {
    databaseUrl: env.DATABASE_URL ?? '',
    port: Number(env.PORT ?? 3000),
    syncSecret: env.SYNC_SECRET ?? '',
    githubToken: env.GITHUB_TOKEN ?? '',
  };
}
