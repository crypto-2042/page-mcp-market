import { useI18n } from '../i18n/I18nProvider';

export function DocsPage() {
  const { t } = useI18n();

  return (
    <main className="docs-page">
      <section className="page-section page-section--light docs-intro">
        <div className="shell-container docs-intro__inner">
          <div className="eyebrow">{t('docs.eyebrow')}</div>
          <h1 className="page-title">{t('docs.title')}</h1>
          <p className="page-copy">{t('docs.subtitle')}</p>
        </div>
      </section>

      <section className="page-section page-section--light docs-content">
        <div className="shell-container docs-layout">
          <section className="docs-section">
            <h2>{t('docs.user.title')}</h2>

            <div className="docs-block">
              <h3>{t('docs.user.installExtension.title')}</h3>
              <ul className="docs-list">
                <li>{t('docs.user.installExtension.step1')}</li>
                <li>{t('docs.user.installExtension.step2')}</li>
              </ul>
            </div>

            <div className="docs-block">
              <h3>{t('docs.user.installRepo.title')}</h3>
              <ul className="docs-list">
                <li>{t('docs.user.installRepo.step1')}</li>
                <li>{t('docs.user.installRepo.step2')}</li>
                <li>{t('docs.user.installRepo.step3')}</li>
              </ul>
            </div>
          </section>

          <section className="docs-section">
            <h2>{t('docs.dev.title')}</h2>

            <div className="docs-block">
              <h3>{t('docs.dev.mcpDef.title')}</h3>
              <p className="docs-copy">
                {t('docs.dev.mcpDef.intro')} <code>@page-mcp/protocol</code>
                {t('docs.dev.mcpDef.extend')}
              </p>
              <p className="docs-copy">
                {t('docs.dev.mcpDef.pathIntro')} <code>path</code>
                {t('docs.dev.mcpDef.pathOutro')} {t('docs.dev.mcpDef.toolIntro')} <code>execute</code>
                {t('docs.dev.mcpDef.toolOutro')}
              </p>
            </div>

            <div className="docs-example-grid">
              <article className="docs-example-card">
                <h3 className="docs-example-card__label">{t('docs.dev.mcpDef.prompt')}</h3>
                <pre>{t('docs.dev.mcpDef.example.prompt')}</pre>
              </article>

              <article className="docs-example-card">
                <h3 className="docs-example-card__label">{t('docs.dev.mcpDef.resource')}</h3>
                <pre>{t('docs.dev.mcpDef.example.resource')}</pre>
              </article>

              <article className="docs-example-card">
                <h3 className="docs-example-card__label">{t('docs.dev.mcpDef.tool')}</h3>
                <pre>{t('docs.dev.mcpDef.example.tool')}</pre>
              </article>
            </div>

            <div className="docs-block">
              <h3>{t('docs.dev.repoFiles.title')}</h3>
              <p className="docs-copy">{t('docs.dev.repoFiles.intro')}</p>
              <ul className="docs-list">
                <li>
                  <code>repository.json</code>
                  {t('docs.dev.repoFiles.repository')}
                </li>
                <li>
                  <code>mcp/prompts.json</code>
                  {t('docs.dev.repoFiles.prompts')}
                </li>
                <li>
                  <code>mcp/resources.json</code>
                  {t('docs.dev.repoFiles.resources')}
                </li>
                <li>
                  <code>mcp/tools.json</code>
                  {t('docs.dev.repoFiles.tools')}
                </li>
              </ul>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
