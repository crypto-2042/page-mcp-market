import type { AnthropicMcpPromptArgument, AnthropicMcpPromptMessage, JsonSchema } from '@page-mcp/protocol';
import { z } from 'zod';

const intFromString = z
  .string()
  .optional()
  .transform((value) => (value ? Number(value) : undefined));

const jsonSchema = z.custom<JsonSchema>((value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return typeof (value as { type?: unknown }).type === 'string';
});

const promptArgumentSchema = z.custom<AnthropicMcpPromptArgument>((value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return typeof (value as { name?: unknown }).name === 'string';
});

const promptMessageSchema = z.custom<AnthropicMcpPromptMessage>((value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const candidate = value as { role?: unknown; content?: { type?: unknown; text?: unknown } };
  return (
    typeof candidate.role === 'string' &&
    !!candidate.content &&
    candidate.content.type === 'text' &&
    typeof candidate.content.text === 'string'
  );
});

export const searchRepositoriesQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  domain: z.string().trim().min(1).optional(),
  authorId: z.string().trim().min(1).optional(),
  page: intFromString.transform((value) => value ?? 1),
  pageSize: intFromString.transform((value) => value ?? 20),
});

export const repositoryIdParamSchema = z.object({
  repositoryId: z.string().trim().min(1),
});

export const repositoryVersionParamSchema = z.object({
  repositoryId: z.string().trim().min(1),
  version: z.string().trim().min(1),
});

export const repositoryItemParamSchema = z.object({
  repositoryId: z.string().trim().min(1),
  itemId: z.string().trim().min(1),
});

export const repositoryContentQuerySchema = z.object({
  path: z.string().trim().min(1).optional(),
  release: z.string().trim().min(1).optional(),
});

export const rankingsQuerySchema = z.object({
  window: z.enum(['1d', '7d', '30d']).optional(),
  limit: intFromString.transform((value) => value ?? 50),
  domain: z.string().trim().min(1).optional(),
});

export const createRepositoryBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  siteDomain: z.string().trim().min(1),
  authorId: z.string().trim().min(1),
  authorName: z.string().trim().min(1),
});

export const createReleaseBodySchema = z.object({
  version: z.string().trim().min(1),
  name: z.string().trim().min(1).optional(),
  changelog: z.string().trim().min(1).optional(),
  isLatest: z.boolean().optional(),
});

export const createPromptBodySchema = z.object({
  release: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  arguments: z.array(promptArgumentSchema).optional(),
  messages: z.array(promptMessageSchema).optional(),
  path: z.string().trim().min(1),
});

export const createResourceBodySchema = z.object({
  release: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  uri: z.string().trim().min(1),
  mimeType: z.string().trim().min(1).optional(),
  path: z.string().trim().min(1),
});

export const createToolBodySchema = z.object({
  release: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  inputSchema: jsonSchema.optional(),
  execute: z.string().trim().min(1),
  path: z.string().trim().min(1),
});

export const updateRepositoryBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  siteDomain: z.string().trim().min(1).optional(),
});

export const updateReleaseBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  changelog: z.string().trim().min(1).optional(),
  isLatest: z.boolean().optional(),
});

export const updatePromptBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  arguments: z.array(promptArgumentSchema).optional(),
  messages: z.array(promptMessageSchema).optional(),
  path: z.string().trim().min(1).optional(),
});

export const updateResourceBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  uri: z.string().trim().min(1).optional(),
  mimeType: z.string().trim().min(1).optional(),
  path: z.string().trim().min(1).optional(),
});

export const updateToolBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  inputSchema: jsonSchema.optional(),
  execute: z.string().trim().min(1).optional(),
  path: z.string().trim().min(1).optional(),
});
