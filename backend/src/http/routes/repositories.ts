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

  app.post('/repositories/:repositoryId/releases', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const body = parseWithSchema(createReleaseBodySchema, await c.req.json());
    const data = await service.createRelease({
      repositoryId: params.repositoryId,
      version: body.version,
      name: body.name,
      changelog: body.changelog,
      isLatest: body.isLatest,
    });
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

  app.post('/repositories/:repositoryId/prompts', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const body = parseWithSchema(createPromptBodySchema, await c.req.json());
    const data = await service.createPrompt({
      repositoryId: params.repositoryId,
      releaseVersion: body.release,
      name: body.name,
      description: body.description,
      arguments: body.arguments,
      messages: body.messages,
      path: body.path,
    });
    return c.json(data, 201);
  });

  app.post('/repositories/:repositoryId/resources', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const body = parseWithSchema(createResourceBodySchema, await c.req.json());
    const data = await service.createResource({
      repositoryId: params.repositoryId,
      releaseVersion: body.release,
      name: body.name,
      description: body.description,
      uri: body.uri,
      mimeType: body.mimeType,
      path: body.path,
    });
    return c.json(data, 201);
  });

  app.post('/repositories/:repositoryId/tools', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const body = parseWithSchema(createToolBodySchema, await c.req.json());
    const data = await service.createTool({
      repositoryId: params.repositoryId,
      releaseVersion: body.release,
      name: body.name,
      description: body.description,
      inputSchema: body.inputSchema,
      execute: body.execute,
      path: body.path,
    });
    return c.json(data, 201);
  });

  app.patch('/repositories/:repositoryId', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    const body = parseWithSchema(updateRepositoryBodySchema, await c.req.json());
    const data = await service.updateRepository({ repositoryId: params.repositoryId, ...body });
    return c.json(data);
  });

  app.delete('/repositories/:repositoryId', async (c) => {
    const params = parseWithSchema(repositoryIdParamSchema, c.req.param());
    await service.deleteRepository(params.repositoryId);
    return c.body(null, 204);
  });

  app.patch('/repositories/:repositoryId/releases/:version', async (c) => {
    const params = parseWithSchema(repositoryVersionParamSchema, c.req.param());
    const body = parseWithSchema(updateReleaseBodySchema, await c.req.json());
    const data = await service.updateRelease({
      repositoryId: params.repositoryId,
      version: params.version,
      ...body,
    });
    return c.json(data);
  });

  app.delete('/repositories/:repositoryId/releases/:version', async (c) => {
    const params = parseWithSchema(repositoryVersionParamSchema, c.req.param());
    await service.deleteRelease(params.repositoryId, params.version);
    return c.body(null, 204);
  });

  app.patch('/repositories/:repositoryId/prompts/:itemId', async (c) => {
    const params = parseWithSchema(repositoryItemParamSchema, c.req.param());
    const body = parseWithSchema(updatePromptBodySchema, await c.req.json());
    const data = await service.updatePrompt({
      repositoryId: params.repositoryId,
      itemId: params.itemId,
      ...body,
    });
    return c.json(data);
  });

  app.delete('/repositories/:repositoryId/prompts/:itemId', async (c) => {
    const params = parseWithSchema(repositoryItemParamSchema, c.req.param());
    await service.deletePrompt(params.repositoryId, params.itemId);
    return c.body(null, 204);
  });

  app.patch('/repositories/:repositoryId/resources/:itemId', async (c) => {
    const params = parseWithSchema(repositoryItemParamSchema, c.req.param());
    const body = parseWithSchema(updateResourceBodySchema, await c.req.json());
    const data = await service.updateResource({
      repositoryId: params.repositoryId,
      itemId: params.itemId,
      ...body,
    });
    return c.json(data);
  });

  app.delete('/repositories/:repositoryId/resources/:itemId', async (c) => {
    const params = parseWithSchema(repositoryItemParamSchema, c.req.param());
    await service.deleteResource(params.repositoryId, params.itemId);
    return c.body(null, 204);
  });

  app.patch('/repositories/:repositoryId/tools/:itemId', async (c) => {
    const params = parseWithSchema(repositoryItemParamSchema, c.req.param());
    const body = parseWithSchema(updateToolBodySchema, await c.req.json());
    const data = await service.updateTool({
      repositoryId: params.repositoryId,
      itemId: params.itemId,
      ...body,
    });
    return c.json(data);
  });

  app.delete('/repositories/:repositoryId/tools/:itemId', async (c) => {
    const params = parseWithSchema(repositoryItemParamSchema, c.req.param());
    await service.deleteTool(params.repositoryId, params.itemId);
    return c.body(null, 204);
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
