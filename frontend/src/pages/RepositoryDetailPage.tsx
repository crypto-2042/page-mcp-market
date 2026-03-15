import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExpandableCode } from '../components/ExpandableCode';
import {
  getRepository,
  getRepositoryContent,
  getRepositoryInstallSnapshot,
  getRepositoryReleases,
} from '../lib/api';
import type {
  GroupedMcpResponse,
  McpPrompt,
  McpResource,
  McpTool,
  RepositoryDetail,
  RepositoryRelease,
} from '../lib/types';

type ToastState = { type: 'success' | 'error'; message: string } | null;

const EMPTY_MCP: GroupedMcpResponse = {
  prompts: [],
  resources: [],
  tools: [],
};

function readInstalledReleaseMeta(): string {
  return (
    document.querySelector('meta[name="page-mcp-installed-release"]')?.getAttribute('content')?.trim() ??
    ''
  );
}

function writeInstalledReleaseMeta(version: string): void {
  let meta = document.querySelector('meta[name="page-mcp-installed-release"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'page-mcp-installed-release');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', version);
}

function PathBadge({ path }: { path: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark bg-gray-50 dark:bg-gray-800">
      {path}
    </span>
  );
}

function PromptCard({ item }: { item: McpPrompt }) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <h4 className="text-lg font-bold text-primary mt-0">{item.name}</h4>
        <PathBadge path={item.path} />
      </div>
      <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-3">
        {item.description}
      </p>
      <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
        Arguments: {item.arguments?.length ?? 0} | Messages: {item.messages?.length ?? 0}
      </div>
      {item.messages && item.messages.length > 0 ? (
        <ExpandableCode label="messages" content={JSON.stringify(item.messages, null, 2)} />
      ) : null}
    </div>
  );
}

function ResourceCard({ item }: { item: McpResource }) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <h4 className="text-lg font-bold text-primary mt-0">{item.name}</h4>
        <PathBadge path={item.path} />
      </div>
      <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-3">
        {item.description}
      </p>
      <div className="text-sm text-text-muted-light dark:text-text-muted-dark space-y-1">
        <div>URI: {item.uri}</div>
        <div>MIME: {item.mimeType ?? 'unknown'}</div>
      </div>
    </div>
  );
}

function ToolCard({ item }: { item: McpTool }) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <h4 className="text-lg font-bold text-primary mt-0">{item.name}</h4>
        <PathBadge path={item.path} />
      </div>
      <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-3">
        {item.description}
      </p>
      {item.inputSchema ? (
        <ExpandableCode label="inputSchema" content={JSON.stringify(item.inputSchema, null, 2)} />
      ) : null}
      <ExpandableCode label="execute" content={item.execute} />
    </div>
  );
}

export function RepositoryDetailPage() {
  const { repositoryId = '' } = useParams();
  const [detail, setDetail] = useState<RepositoryDetail | null>(null);
  const [releases, setReleases] = useState<RepositoryRelease[]>([]);
  const [selectedRelease, setSelectedRelease] = useState('');
  const [mcp, setMcp] = useState<GroupedMcpResponse>(EMPTY_MCP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installedRelease, setInstalledRelease] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  async function handleInstall() {
    if (!detail) return;

    const extId = document.querySelector('meta[name="page-mcp-extension-id"]')?.getAttribute('content');
    if (!extId) {
      setToast({ type: 'error', message: '未找到插件，请确保已安装 page-mcp 插件。' });
      return;
    }

    setInstalling(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

    try {
      const installSnapshot = await getRepositoryInstallSnapshot(detail.id, selectedRelease || undefined);
      const payload = {
        repositoryId: detail.id,
        repositoryName: detail.name,
        siteDomain: detail.siteDomain || '',
        release: selectedRelease,
        apiBase: API_BASE_URL,
        marketOrigin: window.location.origin,
        marketDetailUrl: window.location.href,
        installSnapshot,
        integrity: installSnapshot.integrity,
      };

      await new Promise((resolve, reject) => {
        const chrome = (window as Window & { chrome?: any }).chrome;
        if (!chrome?.runtime?.sendMessage) {
          reject(new Error('当前浏览器不支持或插件未安装'));
          return;
        }

        chrome.runtime.sendMessage(extId, { type: 'INSTALL_REPOSITORY', payload }, (resp: any) => {
          const runtimeError = chrome.runtime.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message));
            return;
          }
          if (!resp?.ok) {
            reject(new Error(resp?.error || '安装失败'));
            return;
          }
          resolve(resp.record);
        });
      });

      const newInstalledRelease = installSnapshot.release.version || selectedRelease;
      writeInstalledReleaseMeta(newInstalledRelease);
      setInstalledRelease(newInstalledRelease);
      setToast({ type: 'success', message: `安装成功：${newInstalledRelease}` });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : '安装失败' });
    } finally {
      setInstalling(false);
    }
  }

  useEffect(() => {
    const syncFromMeta = () => setInstalledRelease(readInstalledReleaseMeta());
    syncFromMeta();

    const observer = new MutationObserver(() => syncFromMeta());
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['content', 'name'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        const [repoDetail, repoReleases] = await Promise.all([
          getRepository(repositoryId),
          getRepositoryReleases(repositoryId),
        ]);
        if (cancelled) return;
        setDetail(repoDetail);
        setReleases(repoReleases);
        setSelectedRelease(repoReleases[0]?.version ?? '');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [repositoryId]);

  useEffect(() => {
    let cancelled = false;
    if (!repositoryId) return;

    async function loadContent() {
      setLoading(true);
      try {
        const content = await getRepositoryContent(repositoryId, selectedRelease || undefined);
        if (cancelled) return;
        setMcp(content.mcp);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadContent();
    return () => {
      cancelled = true;
    };
  }, [repositoryId, selectedRelease]);

  const totalItems = mcp.prompts.length + mcp.resources.length + mcp.tools.length;
  const isEmptyRelease = totalItems === 0;
  const installActionLabel = installing
    ? '安装中...'
    : !installedRelease
      ? '安装'
      : installedRelease === selectedRelease
        ? '已安装'
        : '更新';
  const installActionIcon = installing
    ? 'hourglass_empty'
    : !installedRelease
      ? 'download'
      : installedRelease === selectedRelease
        ? 'check_circle'
        : 'upgrade';
  const installDisabled = installing || (installedRelease !== '' && installedRelease === selectedRelease);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 w-full">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <Link
            to="/"
            className="text-primary hover:underline text-sm font-medium flex items-center gap-1 mb-6 transition-colors"
          >
            <span className="material-icons text-sm">arrow_back</span> Back to repositories
          </Link>
        </div>

        <div className="mb-8 border-b border-border-light dark:border-border-dark pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-semibold flex items-center flex-wrap gap-3">
              <span>{detail?.name ?? 'Repository Detail'}</span>
              {selectedRelease ? (
                <span className="text-sm px-2 py-0.5 mt-1 rounded-full border border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark bg-gray-50 dark:bg-gray-800">
                  {selectedRelease}
                </span>
              ) : null}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                disabled={installDisabled}
                className={`flex items-center px-3 py-1.5 border rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  installedRelease && installedRelease === selectedRelease
                    ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/20'
                    : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[#21262d]'
                }`}
              >
                <span className="material-icons text-sm mr-1">{installActionIcon}</span> {installActionLabel}
              </button>
              {toast ? (
                <div
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                    toast.type === 'success'
                      ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700'
                      : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700'
                  }`}
                >
                  {toast.message}
                </div>
              ) : null}
            </div>
          </div>
          <p className="text-lg text-text-muted-light dark:text-text-muted-dark mb-6">
            {detail?.description ?? 'No description provided.'}
          </p>
        </div>

        {loading ? <p className="text-text-muted-light dark:text-text-muted-dark py-4">Loading content...</p> : null}
        {error ? <p className="text-red-500 py-4">{error}</p> : null}

        <article className="prose dark:prose-invert max-w-none">
          {isEmptyRelease && !loading && !error ? (
            <div className="text-center py-12 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg my-8">
              <span className="material-icons text-4xl mb-4 text-text-muted-light dark:text-text-muted-dark opacity-80">
                extension_off
              </span>
              <p className="text-text-muted-light dark:text-text-muted-dark mb-0">
                This release has no MCP items yet.
              </p>
            </div>
          ) : null}

          {mcp.tools.length > 0 ? (
            <div className="mb-10">
              <h2 className="text-2xl font-semibold border-b border-border-light dark:border-border-dark pb-2 mt-8 mb-6">
                Tools ({mcp.tools.length})
              </h2>
              <div className="space-y-6">
                {mcp.tools.map((item) => (
                  <ToolCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : null}

          {mcp.resources.length > 0 ? (
            <div className="mb-10">
              <h2 className="text-2xl font-semibold border-b border-border-light dark:border-border-dark pb-2 mt-8 mb-6">
                Resources ({mcp.resources.length})
              </h2>
              <div className="space-y-6">
                {mcp.resources.map((item) => (
                  <ResourceCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : null}

          {mcp.prompts.length > 0 ? (
            <div className="mb-10">
              <h2 className="text-2xl font-semibold border-b border-border-light dark:border-border-dark pb-2 mt-8 mb-6">
                Prompts ({mcp.prompts.length})
              </h2>
              <div className="space-y-6">
                {mcp.prompts.map((item) => (
                  <PromptCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </div>

      <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
        {releases.length > 0 ? (
          <div className="border-b border-border-light dark:border-border-dark pb-6">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-text-muted-light dark:text-text-muted-dark">
              Releases
            </h3>
            <div className="flex flex-col gap-2">
              {releases.map((release) => (
                <button
                  key={release.id}
                  className={`text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                    release.version === selectedRelease
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                  }`}
                  onClick={() => setSelectedRelease(release.version)}
                  type="button"
                >
                  {release.version}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {detail ? (
          <div className="border-b border-border-light dark:border-border-dark pb-6">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-text-muted-light dark:text-text-muted-dark">
              Repository Details
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-text-muted-light dark:text-text-muted-dark font-semibold mb-1">
                  Author
                </div>
                <div className="text-sm font-medium">{detail.author.name}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted-light dark:text-text-muted-dark font-semibold mb-1">
                  Domain
                </div>
                <div className="text-sm font-medium">
                  {detail.siteDomain ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {detail.siteDomain}
                    </span>
                  ) : (
                    'Global'
                  )}
                </div>
              </div>
              {detail.score !== undefined ? (
                <div>
                  <div className="text-xs text-text-muted-light dark:text-text-muted-dark font-semibold mb-1">
                    Score
                  </div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <span className="material-icons text-sm text-yellow-500">star</span> {detail.score.toFixed(1)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </main>
  );
}
