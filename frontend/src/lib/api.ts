import type {
  InstallSnapshotResponse,
  RepositoryContentResponse,
  RepositoryDetail,
  RepositoryRelease,
  SearchRepositoriesResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function searchRepositories(params: { q?: string; domain?: string }): Promise<SearchRepositoriesResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.domain) query.set('domain', params.domain);
  query.set('page', '1');
  query.set('pageSize', '30');

  return requestJson<SearchRepositoriesResponse>(`/repositories/search?${query.toString()}`);
}

export async function getRepository(repositoryId: string): Promise<RepositoryDetail> {
  return requestJson<RepositoryDetail>(`/repositories/${repositoryId}`);
}

export async function getRepositoryReleases(repositoryId: string): Promise<RepositoryRelease[]> {
  const result = await requestJson<{ items: RepositoryRelease[] }>(`/repositories/${repositoryId}/releases`);
  return result.items;
}

export async function getRepositoryContent(repositoryId: string, release?: string): Promise<RepositoryContentResponse> {
  const query = new URLSearchParams();
  if (release) query.set('release', release);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestJson<RepositoryContentResponse>(`/repositories/${repositoryId}/content${suffix}`);
}

export async function getRepositoryInstallSnapshot(
  repositoryId: string,
  release?: string
): Promise<InstallSnapshotResponse> {
  const query = new URLSearchParams();
  if (release) query.set('release', release);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestJson<InstallSnapshotResponse>(`/repositories/${repositoryId}/install${suffix}`);
}
