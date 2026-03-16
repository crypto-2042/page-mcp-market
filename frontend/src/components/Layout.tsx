import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(true);
  const { locale, setLocale, t } = useI18n();

  // Toggle Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <>
      <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="material-icons text-text-light dark:text-text-dark text-3xl">hub</span>
            <Link to="/" className="font-semibold text-xl tracking-tight hover:text-primary transition-colors">
              {t('brand.name')}
            </Link>
          </div>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link className="text-sm font-medium hover:text-primary transition-colors" to="/">{t('nav.explore')}</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors text-text-muted-light dark:text-text-muted-dark" to="/docs">{t('nav.documentation')}</Link>
          </nav>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-full border border-border-light dark:border-border-dark text-xs font-semibold overflow-hidden">
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-3 py-1 transition-colors ${
                  locale === 'en'
                    ? 'bg-primary text-white'
                    : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('zh')}
                className={`px-3 py-1 transition-colors ${
                  locale === 'zh'
                    ? 'bg-primary text-white'
                    : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                中文
              </button>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label={t('aria.toggleDarkMode')}
              className="text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors flex items-center p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none"
            >
              <span className="material-icons">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <a aria-label={t('aria.githubRepository')} className="text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors flex items-center" href="https://github.com/page-mcp-sdk" rel="noopener noreferrer" target="_blank">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col">
        {children}
      </div>

      <footer className="border-t border-border-light dark:border-border-dark py-8 mt-auto mt-12 bg-surface-light dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark text-sm">
            <span className="material-icons text-xl">hub</span>
            <span>{t('footer.copyright')}</span>
          </div>
          <div className="flex gap-6 text-sm text-text-muted-light dark:text-text-muted-dark">
            <a className="hover:text-primary transition-colors" href="#">{t('footer.terms')}</a>
            <a className="hover:text-primary transition-colors" href="#">{t('footer.privacy')}</a>
            <a className="hover:text-primary transition-colors" href="#">{t('footer.security')}</a>
            <a className="hover:text-primary transition-colors" href="#">{t('footer.status')}</a>
            <Link className="hover:text-primary transition-colors" to="/docs">{t('footer.docs')}</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
