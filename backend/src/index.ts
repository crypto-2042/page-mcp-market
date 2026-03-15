import { createApp } from './app.js';
import { getConfig } from './config.js';
import { getDbClient } from './db/client.js';
import { PostgresRepositoryStore } from './repositories/repository.repo.js';
import { RepositoryService } from './services/repository.service.js';
import { SyncService } from './services/sync.service.js';

const config = getConfig();
const db = getDbClient();
const store = new PostgresRepositoryStore(db);
const service = new RepositoryService(store);
const syncService = new SyncService(store, config.githubToken);
const app = createApp(service, { syncService, syncSecret: config.syncSecret });

if (import.meta.main) {
  Bun.serve({
    port: config.port,
    fetch: app.fetch,
  });

  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${config.port}`);
}
