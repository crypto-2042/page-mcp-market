export type Locale = 'en' | 'zh';

export const messages: Record<Locale, Record<string, string>> = {
  en: {
    'brand.name': 'MCP Marketplace',
    'nav.explore': 'Explore',
    'nav.documentation': 'Documentation',
    'aria.toggleDarkMode': 'Toggle dark mode',
    'aria.githubRepository': 'GitHub Repository',
    'footer.copyright': '© 2024 MCP Marketplace',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
    'footer.security': 'Security',
    'footer.status': 'Status',
    'footer.docs': 'Docs',
  },
  zh: {
    'brand.name': 'MCP 市场',
    'nav.explore': '探索',
    'nav.documentation': '文档',
    'aria.toggleDarkMode': '切换深色模式',
    'aria.githubRepository': 'GitHub 仓库',
    'footer.copyright': '© 2024 MCP 市场',
    'footer.terms': '条款',
    'footer.privacy': '隐私',
    'footer.security': '安全',
    'footer.status': '状态',
    'footer.docs': '文档',
  },
};
