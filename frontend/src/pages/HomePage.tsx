import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchRepositories } from '../lib/api';
import type { RepositorySummary } from '../lib/types';

export function HomePage() {
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
      setError(err instanceof Error ? err.message : 'Unknown error');
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
    <main className="flex-grow flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 gap-8">
      <div className="w-full">
        <form className="mb-12 text-center md:text-left" onSubmit={onSubmit}>
          <h1 className="text-3xl font-bold mb-4">Find MCP Skills &amp; Tools</h1>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-8 max-w-3xl">
            Discover, install, and integrate pre-built tools and workflows to enhance your AI agents via the Model Context Protocol.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
            <div className="relative sm:w-48 flex-shrink-0">
              <select
                value={searchType}
                onChange={(event) => setSearchType(event.target.value as 'name' | 'domain')}
                className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark rounded-full py-4 px-6 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-base h-full cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="domain">Domain</option>
              </select>
            </div>
            <div className="relative flex-grow">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">search</span>
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark rounded-full py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-lg"
                placeholder={searchType === 'name' ? 'Search by repository name...' : 'Search by domain...'}
                type="text"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition-colors hidden sm:block">
              Search
            </button>
            <button
              type="button"
              onClick={onReset}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-full transition-colors hidden sm:block">
              Reset
            </button>
          </div>
        </form>

        {loading ? <p className="text-text-muted-light dark:text-text-muted-dark mb-4">Loading repositories...</p> : null}
        {error ? <p className="text-red-500 mb-4">{error}</p> : null}

        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Featured Repositories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((repo) => (
              <Link to={`/repositories/${repo.id}`} key={repo.id} className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-6 flex flex-col h-full hover:border-gray-400 dark:hover:border-gray-500 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-primary hover:underline cursor-pointer">{repo.name}</h3>
                </div>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-6 flex-grow leading-relaxed">
                  {repo.description ?? 'No description'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {repo.siteDomain && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {repo.siteDomain}
                    </span>
                  )}
                  {repo.latestReleaseVersion && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {repo.latestReleaseVersion}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-light dark:border-border-dark">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                      {repo.author.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm text-text-muted-light dark:text-text-muted-dark font-medium">{repo.author.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-muted-light dark:text-text-muted-dark">
                    {repo.score !== undefined && (
                      <span className="flex items-center gap-1.5"><span className="material-icons text-[16px]">star</span> {repo.score.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {items.length === 0 && !loading && !error && (
            <div className="text-center py-12 text-text-muted-light dark:text-text-muted-dark">
              <span className="material-icons text-4xl mb-4 opacity-50">search_off</span>
              <p>No repositories found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
