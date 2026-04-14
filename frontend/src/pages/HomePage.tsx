import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchRepositories } from '../lib/api';
import type { RepositorySummary } from '../lib/types';
import { useI18n } from '../i18n/I18nProvider';

export function HomePage() {
  const { t } = useI18n();
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'domain'>('name');
  const [items, setItems] = useState<RepositorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData(nextSearchValue?: string, nextSearchType?: 'name' | 'domain') {
    setLoading(true);
    setError(null);
    try {
      const val = nextSearchValue ?? searchValue;
      const type = nextSearchType ?? searchType;

      const q = type === 'name' ? val.trim() : '';
      const domain = type === 'domain' ? val.trim() : '';

      const result = await searchRepositories({ q, domain });
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.unknown'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void loadData();
  }

  function onReset() {
    setSearchValue('');
    setSearchType('name');
    void loadData('', 'name');
  }

  return (
    <main className="home-page">
      <section className="page-section page-section--dark home-hero">
        <div className="shell-container home-hero__inner">
          <div className="eyebrow">MCP Marketplace</div>
          <h1 className="hero-title">{t('home.hero.title')}</h1>
          <p className="hero-copy">{t('home.hero.subtitle')}</p>

          <form className="search-panel" onSubmit={onSubmit}>
            <label className="search-panel__field search-panel__field--select">
              <span className="search-panel__label">{t('home.search.type.name')}</span>
              <select
                value={searchType}
                onChange={(event) => setSearchType(event.target.value as 'name' | 'domain')}
                className="site-select"
              >
                <option value="name">{t('home.search.type.name')}</option>
                <option value="domain">{t('home.search.type.domain')}</option>
              </select>
            </label>

            <label className="search-panel__field search-panel__field--input">
              <span className="search-panel__label">{t('home.search.submit')}</span>
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="site-input"
                placeholder={
                  searchType === 'name'
                    ? t('home.search.placeholder.name')
                    : t('home.search.placeholder.domain')
                }
                type="text"
              />
            </label>

            <div className="search-panel__actions">
              <button type="submit" className="site-button">
                {t('home.search.submit')}
              </button>
              <button type="button" onClick={onReset} className="site-button--secondary">
                {t('home.search.reset')}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="page-section page-section--light home-results">
        <div className="shell-container">
          <div className="section-heading">
            <h2>{t('home.featured.title')}</h2>
          </div>

          {loading ? <p className="state-message">{t('home.loading')}</p> : null}
          {error ? <p className="state-message state-message--error">{error}</p> : null}

          <div className="repository-grid">
            {items.map((repo) => (
              <Link to={`/repositories/${repo.id}`} key={repo.id} className="repository-card">
                <div className="repository-card__header">
                  <h3>{repo.name}</h3>
                </div>
                <p className="repository-card__description">
                  {repo.description ?? t('home.repository.noDescription')}
                </p>
                <div className="repository-card__meta">
                  {repo.siteDomain ? <span className="repository-chip">{repo.siteDomain}</span> : null}
                  {repo.latestReleaseVersion ? (
                    <span className="repository-chip repository-chip--muted">
                      {repo.latestReleaseVersion}
                    </span>
                  ) : null}
                </div>
                <div className="repository-card__footer">
                  <div className="repository-card__author">
                    <div className="repository-card__avatar">
                      {repo.author.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{repo.author.name}</span>
                  </div>
                  {repo.score !== undefined ? (
                    <div className="repository-card__score">
                      <span className="material-icons">star</span>
                      <span>{repo.score.toFixed(1)}</span>
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          {items.length === 0 && !loading && !error ? (
            <div className="empty-state">
              <span className="material-icons empty-state__icon">search_off</span>
              <p>{t('home.empty')}</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
