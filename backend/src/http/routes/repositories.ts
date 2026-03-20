import { Hono } from 'hono';
import { z } from 'zod';
import type { RepositoryService } from '../../services/repository.service.js';
import { AppError } from '../error.js';
import {
  createPromptBodySchema,
  createReleaseBodySchema,
  createRepositoryBodySchema,
  createResourceBodySchema,
  createToolBodySchema,
  rankingsQuerySchema,
  repositoryContentQuerySchema,
  repositoryIdParamSchema,
  repositoryItemParamSchema,
  repositoryVersionParamSchema,
  searchRepositoriesQuerySchema,
  updatePromptBodySchema,
  updateReleaseBodySchema,
  updateRepositoryBodySchema,
  updateResourceBodySchema,
  updateToolBodySchema,
} from '../schemas.js';

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(400, 'BAD_REQUEST', result.error.issues.map((issue) => issue.message).join('; '));
  }
  return result.data;
}

export function registerRepositoryRoutes(app: Hono, service: RepositoryService): void {
  app.post('/repositories', async (c) => {
    const body = parseWithSchema(createRepositoryBodySchema, await c.req.json());
    const data = await service.createRepository(body);
    return c.json(data, 201);
  });

  app.get('/repositories/:repositoryId/releases', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const data = await service.getReleases(params.repositoryId);
    return c.json({ items: data });
  });

  app.get('/repositories/:repositoryId/install', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const query = parseWithSchema(repositoryContentQuerySchema, c.req.query());
    const data = await service.getInstallSnapshot({
      repositoryId: params.repositoryId,
      release: query.release,
    });
    return c.json(data);
  });

  app.get('/repositories/search', async (c) => {
    const query = parseWithSchema(searchRepositoriesQuerySchema, c.req.query());
    const data = await service.search(query);
    return c.json(data);
  });

  app.get('/repositories/rankings', async (c) => {
    const query = parseWithSchema(rankingsQuerySchema, c.req.query());
    const data = await service.rankings({ limit: query.limit, domain: query.domain });
    return c.json({ items: data });
  });

  app.get('/repositories/:repositoryId/content', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const query = parseWithSchema(repositoryContentQuerySchema, c.req.query());
    const data = await service.getContent({
      repositoryId: params.repositoryId,
      path: query.path,
      release: query.release,
    });
    return c.json(data);
  });

  app.get('/repositories/:repositoryId', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const data = await service.getRepository(params.repositoryId);
    return c.json(data);
  });
}
