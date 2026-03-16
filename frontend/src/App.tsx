import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DocsPage } from './pages/DocsPage';
import { RepositoryDetailPage } from './pages/RepositoryDetailPage';
import { Layout } from './components/Layout';
import { I18nProvider } from './i18n/I18nProvider';

export function App() {
  return (
    <I18nProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/repositories/:repositoryId" element={<RepositoryDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </I18nProvider>
  );
}
