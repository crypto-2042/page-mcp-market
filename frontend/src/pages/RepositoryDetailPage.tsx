import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExpandableCode } from '../components/ExpandableCode';
import { useI18n } from '../i18n/I18nProvider';
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
type TFunc = (key: string) => string;

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
  return <span className="path-badge">{path}</span>;
}

function PromptCard({ item, t }: { item: McpPrompt; t: TFunc }) {
  return (
    <article className="mcp-card">
      <div className="mcp-card__header">
        <h3 className="mcp-card__title">{item.name}</h3>
        <PathBadge path={item.path} />
      </div>
      <p className="mcp-card__description">{item.description}</p>
      <div className="mcp-card__meta">
        {t('repo.prompt.arguments')}: {item.arguments?.length ?? 0} | {t('repo.prompt.messages')}:{' '}
        {item.messages?.length ?? 0}
      </div>
      {item.messages && item.messages.length > 0 ? (
        <ExpandableCode label={t('repo.code.messages')} content={JSON.stringify(item.messages, null, 2)} />
      ) : null}
    </article>
  );
}

function ResourceCard({ item, t }: { item: McpResource; t: TFunc }) {
  return (
    <article className="mcp-card">
      <div className="mcp-card__header">
        <h3 className="mcp-card__title">{item.name}</h3>
        <PathBadge path={item.path} />
      </div>
      <p className="mcp-card__description">{item.description}</p>
      <div className="mcp-card__stack">
        <div className="mcp-card__meta-row">
          <span className="mcp-card__meta-label">{t('repo.resource.uri')}</span>
          <span className="mcp-card__meta-value">{item.uri}</span>
        </div>
        <div className="mcp-card__meta-row">
          <span className="mcp-card__meta-label">{t('repo.resource.mime')}</span>
          <span className="mcp-card__meta-value">{item.mimeType ?? t('repo.resource.unknown')}</span>
        </div>
      </div>
    </article>
  );
}

function ToolCard({ item, t }: { item: McpTool; t: TFunc }) {
  return (
    <article className="mcp-card">
      <div className="mcp-card__header">
        <h3 className="mcp-card__title">{item.name}</h3>
        <PathBadge path={item.path} />
      </div>
      <p className="mcp-card__description">{item.description}</p>
      {item.inputSchema ? (
        <ExpandableCode label={t('repo.tool.inputSchema')} content={JSON.stringify(item.inputSchema, null, 2)} />
      ) : null}
      <ExpandableCode label={t('repo.tool.execute')} content={item.execute} />
    </article>
  );
}

export function RepositoryDetailPage() {
  const { t } = useI18n();
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
      setToast({ type: 'error', message: t('repo.install.notFound') });
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
          reject(new Error(t('repo.install.unsupported')));
          return;
        }

        chrome.runtime.sendMessage(extId, { type: 'INSTALL_REPOSITORY', payload }, (resp: any) => {
          const runtimeError = chrome.runtime.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message));
            return;
          }
          if (!resp?.ok) {
            reject(new Error(resp?.error || t('repo.install.failed')));
            return;
          }
          resolve(resp.record);
        });
      });

      const newInstalledRelease = installSnapshot.release.version || selectedRelease;
      writeInstalledReleaseMeta(newInstalledRelease);
      setInstalledRelease(newInstalledRelease);
      setToast({ type: 'success', message: `${t('repo.install.success')}${newInstalledRelease}` });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : t('repo.install.failed') });
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
          setError(err instanceof Error ? err.message : t('error.unknown'));
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
          setError(err instanceof Error ? err.message : t('error.unknown'));
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
    ? t('repo.install.action.installing')
    : !installedRelease
      ? t('repo.install.action.install')
      : installedRelease === selectedRelease
        ? t('repo.install.action.installed')
        : t('repo.install.action.update');
  const installActionIcon = installing
    ? 'hourglass_empty'
    : !installedRelease
      ? 'download'
      : installedRelease === selectedRelease
        ? 'check_circle'
        : 'upgrade';
  const installDisabled = installing || (installedRelease !== '' && installedRelease === selectedRelease);

  return (
    <main className="repository-page">
      <section className="page-section page-section--light repository-hero">
        <div className="shell-container repository-hero__inner">
          <Link
            to="/"
            className="back-link"
          >
            <span className="material-icons">arrow_back</span>
            {t('repo.backToList')}
          </Link>

          <div className="repository-hero__summary">
            <div className="repository-hero__copy">
              <h1 className="page-title">{detail?.name ?? t('repo.title.fallback')}</h1>
              {selectedRelease ? (
                <span className="version-pill">{selectedRelease}</span>
              ) : null}
              <p className="page-copy">{detail?.description ?? t('repo.description.empty')}</p>
            </div>

            <div className="repository-hero__actions">
              <button
                onClick={handleInstall}
                disabled={installDisabled}
                className={installDisabled ? 'site-button is-disabled' : 'site-button'}
              >
                <span className="material-icons">{installActionIcon}</span>
                {installActionLabel}
              </button>
              {toast ? <div className={`toast toast--${toast.type}`}>{toast.message}</div> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--light repository-content">
        <div className="shell-container repository-layout">
          <aside className="repository-sidebar">
            {releases.length > 0 ? (
              <section className="repository-sidebar__section">
                <div className="repository-sidebar__eyebrow">{t('repo.sidebar.releases')}</div>
                <div className="release-list">
                  {releases.map((release) => (
                    <button
                      key={release.id}
                      className={release.version === selectedRelease ? 'release-button is-active' : 'release-button'}
                      onClick={() => setSelectedRelease(release.version)}
                      type="button"
                    >
                      {release.version}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {detail ? (
              <section className="repository-sidebar__section">
                <div className="repository-sidebar__eyebrow">{t('repo.sidebar.details')}</div>
                <div className="repository-sidebar__meta">
                  <div className="repository-meta">
                    <div className="repository-meta__label">{t('repo.sidebar.author')}</div>
                    <div className="repository-meta__value">{detail.author.name}</div>
                  </div>
                  <div className="repository-meta">
                    <div className="repository-meta__label">{t('repo.sidebar.domain')}</div>
                    <div className="repository-meta__value">
                      {detail.siteDomain ? (
                        <span className="repository-chip repository-chip--muted">{detail.siteDomain}</span>
                      ) : (
                        t('repo.sidebar.global')
                      )}
                    </div>
                  </div>
                  {detail.score !== undefined ? (
                    <div className="repository-meta">
                      <div className="repository-meta__label">{t('repo.sidebar.score')}</div>
                      <div className="repository-meta__value repository-score">
                        <span className="material-icons">star</span>
                        {detail.score.toFixed(1)}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </aside>

          <div className="repository-content__main">
            {loading ? <p className="state-message">{t('repo.loading')}</p> : null}
            {error ? <p className="state-message state-message--error">{error}</p> : null}

            {isEmptyRelease && !loading && !error ? (
              <section className="repository-section">
                <div className="empty-state">
                  <span className="material-icons empty-state__icon">extension_off</span>
                  <p>{t('repo.emptyRelease')}</p>
                </div>
              </section>
            ) : null}

            {mcp.tools.length > 0 ? (
              <section className="repository-section">
                <div className="section-heading">
                  <h2>{t('repo.section.tools')}</h2>
                  <span className="repository-section__count">{mcp.tools.length}</span>
                </div>
                <div className="repository-section__stack">
                  {mcp.tools.map((item) => (
                    <ToolCard key={item.id} item={item} t={t} />
                  ))}
                </div>
              </section>
            ) : null}

            {mcp.resources.length > 0 ? (
              <section className="repository-section">
                <div className="section-heading">
                  <h2>{t('repo.section.resources')}</h2>
                  <span className="repository-section__count">{mcp.resources.length}</span>
                </div>
                <div className="repository-section__stack">
                  {mcp.resources.map((item) => (
                    <ResourceCard key={item.id} item={item} t={t} />
                  ))}
                </div>
              </section>
            ) : null}

            {mcp.prompts.length > 0 ? (
              <section className="repository-section">
                <div className="section-heading">
                  <h2>{t('repo.section.prompts')}</h2>
                  <span className="repository-section__count">{mcp.prompts.length}</span>
                </div>
                <div className="repository-section__stack">
                  {mcp.prompts.map((item) => (
                    <PromptCard key={item.id} item={item} t={t} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
