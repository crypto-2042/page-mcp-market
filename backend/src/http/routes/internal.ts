import { Hono } from 'hono';
import { AppError } from '../error.js';
import type { SyncService } from '../../services/sync.service.js';

function getBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function registerInternalRoutes(app: Hono, syncService: SyncService, syncSecret: string): void {
  app.post('/sync', async (c) => {
    const token = getBearerToken(c.req.header('authorization'));
    if (!syncSecret || token !== syncSecret) {
      throw new AppError(403, 'FORBIDDEN', 'Invalid sync credentials');
    }

    const body = (await c.req.json().catch(() => ({}))) as {
      dryRun?: boolean;
      repositoryId?: string;
      triggeredBy?: 'cron' | 'manual';
    };

    const result = await syncService.runSync({
      dryRun: body.dryRun ?? false,
      repositoryId: body.repositoryId,
      triggeredBy: body.triggeredBy ?? 'cron',
    });

    return c.json(result);
  });
}
