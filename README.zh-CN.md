# Page MCP Market

[English](README.md) | [简体中文](README.zh-CN.md)

欢迎使用 **Page MCP Market**，这是官方为符合 [Page MCP](https://github.com/ModelContextProtocol) 规范的仓库建立的注册中心和应用市场。本项目的核心目标是支持 **Page MCP 插件 (Plugin)**，提供一个集中化的库房，方便用户发现、浏览并安装为特定网站量身定制的 AI Context、环境资源和执行工具。

## 什么是 Page MCP？

Page MCP（页面级模型上下文协议）将**模型上下文协议 (Model Context Protocol, MCP)** 的能力直接引入了用户的浏览器环境。这意味着，不再需要在本地死板地运行本地服务才能给 AI 喂数据，Page MCP 允许 AI 助手工具基于你当前正在浏览的网页，动态提取 DOM 资源、执行浏览器脚本交互，以及提供具备当前页面上下文信息的智能提示（Prompts）。

## 市场用途

这个市场仓库包含了为 Page MCP 生态提供支持的 **后端 API 注册中心**，以及用户端的 **前端应用界面**。

- **对于用户**: 在应用商店浏览、搜索你常用网站的专属插件仓库，让你的 AI 助手可以无缝和目标网站互动。
- **对于 Page MCP 插件端**: 这是一个中央的数据源，插件会从这里拉取、解析、并安全安装特定站点的 MCP 配置与脚本。
- **对于开发者**: 这里是你展示和分发自己编写的优秀 Page MCP 功能库的地方。

## 支持仓库参考示例

任何符合 `page-mcp` 目录结构规范的仓库都可以被本市场收录与同步。

**参考项目：[GitHub Assistant](https://github.com/crypto-2042/github-assistant)** 是一个经典的合规示例仓库。它提供了在用户进入 `github.com` 网站时会自动激活的一套工具集：
- **Tools**: 支持创建 Issue、合并 PR，获取 Github Action 等能力。
- **Resources**: 通过选择器/XPath 从网站 DOM 当中原生地、有结构地提取仓库元数据给 AI 提供参考。
- **Prompts**: 提供具有网站上下文的智能提示（比如总结工单内容、辅助 Debug Code Review 等）。

## 项目结构

这是一个包含前后的 Monorepo（大型代码仓库），主要部分如下：

- `/frontend`: 一个基于 React + Vite 的单页应用（SPA）。在这个客户端界面上，普通用户可以发现、搜索应用市场内有什么上架的 MCP 包。
- `/backend`: 基于 Bun + Hono 框架 和 PostgreSQL 的高性能后台。它提供了供搜索、排名、缓存 JSON 资源清单的 RESTful APIs，并负责通过定时任务或 Webhook 持续同步远端 GitHub 仓库里的 MCP 定义。

## 本地开发指南

### 依赖环境
- [Bun](https://bun.sh/) >= 1.3
- PostgreSQL 数据库环境

### 后端配置与启动
```bash
cd backend
bun install
cp .env.example .env

# 在 .env 中填入你的 DATABASE_URL，然后运行初始化建表与注入数据：
bun run db:init

# 启动 API 服务器，默认运行在 http://localhost:3000
bun run dev
```

### 前端配置与启动
```bash
cd frontend
npm install # 或者使用 bun install
cp .env.example .env

# 启动 Vite 开发环境，进行前端网页开发
npm run dev
```

## 贡献指南

任何为丰富此应用市场平台的开发、或者是为了提交优秀的第三方网站 Page MCP 适配仓库的贡献我们都热烈欢迎！你随时可以通过提交 Issue 或 Pull Request 给我们。

## 许可证

MIT License
