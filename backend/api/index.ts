import { createApp } from '../src/app.js';
import { getConfig } from '../src/config.js';
import { getDbClient } from '../src/db/client.js';
import { PostgresRepositoryStore } from '../src/repositories/repository.repo.js';
import { RepositoryService } from '../src/services/repository.service.js';
import { SyncService } from '../src/services/sync.service.js';

const store = new PostgresRepositoryStore(getDbClient());
const service = new RepositoryService(store);
const config = getConfig();
const syncService = new SyncService(store, config.githubToken);

export default createApp(service, { syncService, syncSecret: config.syncSecret }).fetch;
