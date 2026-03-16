import { useI18n } from '../i18n/I18nProvider';

export function DocsPage() {
  const { t } = useI18n();

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold mb-3">{t('docs.title')}</h1>
        <p className="text-text-muted-light dark:text-text-muted-dark text-base">
          {t('docs.subtitle')}
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">{t('docs.user.title')}</h2>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">{t('docs.user.installExtension.title')}</h3>
          <ul className="list-disc pl-5 space-y-2 text-text-muted-light dark:text-text-muted-dark">
            <li>{t('docs.user.installExtension.step1')}</li>
            <li>{t('docs.user.installExtension.step2')}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-2">{t('docs.user.installRepo.title')}</h3>
          <ul className="list-disc pl-5 space-y-2 text-text-muted-light dark:text-text-muted-dark">
            <li>{t('docs.user.installRepo.step1')}</li>
            <li>{t('docs.user.installRepo.step2')}</li>
            <li>{t('docs.user.installRepo.step3')}</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t('docs.dev.title')}</h2>

        <div className="mb-8">
          <h3 className="text-xl font-medium mb-2">{t('docs.dev.mcpDef.title')}</h3>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-3">
            {t('docs.dev.mcpDef.intro')} <code>@page-mcp/protocol</code>
            {t('docs.dev.mcpDef.extend')}
          </p>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-3">
            {t('docs.dev.mcpDef.pathIntro')} <code>path</code>
            {t('docs.dev.mcpDef.pathOutro')} {t('docs.dev.mcpDef.toolIntro')} <code>execute</code>
            {t('docs.dev.mcpDef.toolOutro')}
          </p>

          <div className="grid gap-4">
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4">
              <div className="text-sm font-semibold mb-2">{t('docs.dev.mcpDef.prompt')}</div>
              <pre className="text-xs whitespace-pre-wrap">{t('docs.dev.mcpDef.example.prompt')}</pre>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4">
              <div className="text-sm font-semibold mb-2">{t('docs.dev.mcpDef.resource')}</div>
              <pre className="text-xs whitespace-pre-wrap">{t('docs.dev.mcpDef.example.resource')}</pre>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4">
              <div className="text-sm font-semibold mb-2">{t('docs.dev.mcpDef.tool')}</div>
              <pre className="text-xs whitespace-pre-wrap">{t('docs.dev.mcpDef.example.tool')}</pre>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-2">{t('docs.dev.repoFiles.title')}</h3>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-3">
            {t('docs.dev.repoFiles.intro')}
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted-light dark:text-text-muted-dark">
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
    </main>
  );
}
