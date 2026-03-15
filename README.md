# Page MCP Market

[English](README.md) | [简体中文](README.zh-CN.md)

Welcome to the **Page MCP Market**, the official registry and marketplace for [Page MCP](https://github.com/ModelContextProtocol) compliant repositories. This project is built to support the **Page MCP Plugin** by providing a centralized hub where users can discover and install powerful context-aware tools, prompts, and resources tailored for specific websites.

## What is Page MCP?

Page MCP brings the power of the **Model Context Protocol (MCP)** directly into the user's browser. Instead of running MCP servers natively on your machine, Page MCP allows AI tools to dynamically execute scripts, extract DOM resources, and provide contextual prompts directly within the web page you are viewing.

## Purpose of this Market

This repository serves as both the **Backend API Registry** and the **Frontend Web Interface** for the Page MCP ecosystem.

- **For Users**: Browse the market to find plugins/repositories for your favorite websites, allowing your AI assistant to seamlessly interact with those sites.
- **For the Page MCP Plugin**: Acts as the central registry to fetch, parse, and install site-specific MCP manifests securely.
- **For Developers**: A place to showcase and distribute your own Page MCP repositories. 

## Supported Repositories (Example)

Any repository that complies with the `page-mcp` directory structure specification can be indexed in this market.

A reference example is the **[GitHub Assistant](https://github.com/crypto-2042/github-assistant)** repository. It provides tailored tools and prompts that activate when the user navigates to `github.com`. It features:
- **Tools**: Create issues, merge pull requests, list actions.
- **Resources**: Extract repository details directly from the DOM using XPath/Selectors.
- **Prompts**: Context-aware prompts for summarizing issues or reviewing code.

## Project Structure

This is a monorepo consisting of:

- `/frontend`: A React + Vite Single Page Application (SPA) where users can search, browse, and view details about available MCP packages.
- `/backend`: A Bun + Hono backend powered by PostgreSQL. It provides the REST APIs for searching packages, fetching MCP JSON configurations, and synchronizing external GitHub repositories.

## Running Locally

### Prerequisites
- [Bun](https://bun.sh/) >= 1.3
- PostgreSQL database

### Backend Setup
```bash
cd backend
bun install
cp .env.example .env

# Set your DATABASE_URL in .env, then initialize the database:
bun run db:init

# Start the API server on http://localhost:3000
bun run dev
```

### Frontend Setup
```bash
cd frontend
npm install # or bun install
cp .env.example .env

# Start the Vite development server
npm run dev
```

## Contributing

We welcome contributions! Whether you are building a new Page MCP repository for a specific site, or you want to improve this Market platform itself, feel free to open issues and submit pull requests.

## License

MIT License
