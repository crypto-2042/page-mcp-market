export function DocsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold mb-3">Documentation</h1>
        <p className="text-text-muted-light dark:text-text-muted-dark text-base">
          这里包含市场使用者与开发者的核心说明，覆盖插件安装、仓库安装、MCP 资源定义规范与仓库文件规范。
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">面向使用者</h2>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">安装插件</h3>
          <ul className="list-disc pl-5 space-y-2 text-text-muted-light dark:text-text-muted-dark">
            <li>在浏览器扩展商店搜索并安装 page-mcp 插件。</li>
            <li>安装完成后刷新市场页面，右上角会显示插件已就绪提示。</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-2">安装市场的仓库</h3>
          <ul className="list-disc pl-5 space-y-2 text-text-muted-light dark:text-text-muted-dark">
            <li>进入仓库详情页，选择需要的版本。</li>
            <li>点击“安装”按钮，插件会拉取并安装对应 MCP 资源。</li>
            <li>安装成功后，浏览器会记录已安装版本，后续可一键更新。</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">面向开发者</h2>

        <div className="mb-8">
          <h3 className="text-xl font-medium mb-2">MCP 资源定义规范</h3>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-3">
            资源结构基于 `@page-mcp/protocol`，并在市场中扩展 `path`（正则匹配）。
            `tool` 需要包含 `execute` 脚本内容。
          </p>

          <div className="grid gap-4">
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4">
              <div className="text-sm font-semibold mb-2">Prompt</div>
              <pre className="text-xs whitespace-pre-wrap">{`{
  "name": "issue-triage",
  "description": "Draft an issue triage summary",
  "arguments": [{ "name": "severity", "description": "focus", "required": false }],
  "messages": [{ "role": "system", "content": { "type": "text", "text": "Summarize issues." } }],
  "path": "^/[^/]+/[^/]+/issues(?:/.*)?$"
}`}</pre>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4">
              <div className="text-sm font-semibold mb-2">Resource</div>
              <pre className="text-xs whitespace-pre-wrap">{`{
  "name": "repo-issue-context",
  "description": "Repository issue context payload",
  "uri": "resource://github/repo-issue-context",
  "mimeType": "application/json",
  "path": "^/[^/]+/[^/]+/issues(?:/.*)?$"
}`}</pre>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4">
              <div className="text-sm font-semibold mb-2">Tool</div>
              <pre className="text-xs whitespace-pre-wrap">{`{
  "name": "search-products",
  "description": "Search products by keyword",
  "inputSchema": { "type": "object", "properties": { "keyword": { "type": "string" } } },
  "execute": "return searchProducts(input.keyword);",
  "path": "^/products/.+$"
}`}</pre>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-2">MCP 仓库文件规范</h3>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-3">
            仓库根目录必须包含以下文件，所有 MCP 资源以数组形式存放：
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted-light dark:text-text-muted-dark">
            <li>`repository.json`：仓库描述信息与版本信息。</li>
            <li>`mcp/prompts.json`：Prompt 列表。</li>
            <li>`mcp/resources.json`：Resource 列表。</li>
            <li>`mcp/tools.json`：Tool 列表（含 `execute`）。</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
