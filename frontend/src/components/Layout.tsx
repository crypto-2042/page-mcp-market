import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { locale, setLocale, t } = useI18n();
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(68);

  useLayoutEffect(() => {
    const header = headerRef.current;

    if (!header) {
      return;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(header.getBoundingClientRect().height);
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(header);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const shellStyle = {
    '--site-header-height': `${headerHeight}px`,
  } as CSSProperties;

  return (
    <div className="app-shell" style={shellStyle}>
      <header ref={headerRef} className="site-header">
        <div className="shell-container site-header__inner">
          <div className="site-brand">
            <span className="material-icons site-brand__mark">hub</span>
            <Link to="/" className="site-brand__link">
              {t('brand.name')}
            </Link>
          </div>

          <nav className="site-nav" aria-label="Primary">
            <Link className="site-nav__link" to="/">
              {t('nav.explore')}
            </Link>
            <Link className="site-nav__link" to="/docs">
              {t('nav.documentation')}
            </Link>
          </nav>

          <div className="site-header__actions">
            <div className="locale-switch" role="group" aria-label="Language switcher">
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={locale === 'en' ? 'locale-switch__button is-active' : 'locale-switch__button'}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('zh')}
                className={locale === 'zh' ? 'locale-switch__button is-active' : 'locale-switch__button'}
              >
                中文
              </button>
            </div>

            <a
              aria-label={t('aria.githubRepository')}
              className="icon-link"
              href="https://github.com/crypto-2042/page-mcp-plugin"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg className="icon-link__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div className="site-main">{children}</div>

      <footer className="site-footer">
        <div className="shell-container site-footer__inner">
          <div className="site-footer__brand">
            <span className="material-icons site-footer__mark">hub</span>
            <span>{t('footer.copyright')}</span>
          </div>
          <div className="site-footer__links">
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.security')}</a>
            <a href="#">{t('footer.status')}</a>
            <Link to="/docs">{t('footer.docs')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
