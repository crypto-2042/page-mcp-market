import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { toErrorResponse } from './http/error.js';
import { registerInternalRoutes } from './http/routes/internal.js';
import { registerRepositoryRoutes } from './http/routes/repositories.js';
import { RepositoryService } from './services/repository.service.js';
import type { SyncService } from './services/sync.service.js';

export function createApp(
  service: RepositoryService,
  options?: { syncService?: SyncService; syncSecret?: string }
): Hono {
  const app = new Hono();

  app.use('*', cors());
  app.onError((error, c) => {
    const response = toErrorResponse(error, crypto.randomUUID());
    return c.json(response.body, response.status as 400);
  });

  app.get('/api/v1/health', (c) => c.json({ ok: true }));

  const api = new Hono();
  registerRepositoryRoutes(api, service);
  app.route('/api/v1', api);

  if (options?.syncService && options.syncSecret) {
    const internal = new Hono();
    registerInternalRoutes(internal, options.syncService, options.syncSecret);
    app.route('/api/internal', internal);
  }

  return app;
}
