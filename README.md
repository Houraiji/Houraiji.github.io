# Houraiji Blog

一个中文个人成长博客，用 Astro 做成静态站点。当前公开版本以 Houraiji 为展示身份，记录 AI 应用开发、RAG、Agent、多模态文档理解和垂直领域大模型工程的学习路线、项目档案和文章归档。

线上目标地址：

```text
https://Houraiji.github.io/
```

## 页面

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 成长存档入口、精选项目、最近文章和技能树 |
| 个人资料 | `/about/` | 公开资料、方向关键词、邮箱和 GitHub 链接 |
| 成长路线 | `/growth/` | 按 2023、2024、2025-2026 展示成长节点 |
| 项目档案 | `/projects/` | 正式项目、实习项目、学习痕迹和兴趣实验 |
| 文章归档 | `/articles/` | Markdown 文章列表和详情页 |
| 线上后台 | `/admin/` | Decap CMS，使用 GitHub OAuth 登录后提交内容 |
| 本地后台 | `/local-admin/index.html` | 本地专用编辑页，配合 `npm run admin:local` 直接写入文件 |

## 页面预览

![首页预览](docs/screenshots/home.png)

![成长路线预览](docs/screenshots/growth.png)

![项目页预览](docs/screenshots/projects.png)

![文章页预览](docs/screenshots/articles.png)

![关于页预览](docs/screenshots/about.png)

![本地后台预览](docs/screenshots/admin.png)

## 技术栈

- Astro
- TypeScript
- Astro Content Collections
- Markdown
- Decap CMS
- GitHub Pages
- Cloudflare Worker OAuth proxy

## 本地运行

安装依赖：

```bash
npm install
```

启动前台：

```bash
npm run dev
```

默认访问：

```text
http://127.0.0.1:4321/
```

## 本地内容管理

本地后台不走 GitHub 登录，适合开发时直接改 `src/data` 和 `src/content`。

先启动 Astro：

```bash
npm run dev
```

再启动本地内容 API：

```bash
npm run admin:local
```

打开本地后台：

```text
http://127.0.0.1:4321/local-admin/index.html
```

本地后台可以编辑：

- `src/data/profile.json`
- `src/data/growth.json`
- `src/data/projects.json`
- `src/content/articles/*.md`

生产构建会删除 `dist/local-admin/`，所以线上不会暴露这个直接写本地文件的后台。

## 线上内容管理

线上 `/admin/` 是 Decap CMS。它通过 GitHub backend 写入当前仓库的 `main` 分支，提交后由 GitHub Actions 自动重新部署 GitHub Pages。

当前配置文件：

```text
public/admin/config.yml
```

上线前需要把其中的 OAuth proxy 占位域名替换成实际 Cloudflare Worker 域名：

```yaml
backend:
  name: github
  repo: Houraiji/Houraiji.github.io
  branch: main
  base_url: https://你的-worker.workers.dev
  auth_endpoint: auth
```

GitHub OAuth App 的 callback URL 设置为：

```text
https://你的-worker.workers.dev/callback
```

Cloudflare Worker 只保存运行环境里的 secrets，不提交到仓库：

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `ALLOWED_ORIGIN=https://Houraiji.github.io`
- `CMS_PATH=/admin/`

只有对 `Houraiji/Houraiji.github.io` 有 push 权限的 GitHub 账号才能通过 CMS 写内容。

## GitHub Pages 部署

仓库已经包含 GitHub Actions 工作流：

```text
.github/workflows/deploy.yml
```

工作流使用 Astro 官方 GitHub Action 构建，并部署到 GitHub Pages。环境变量固定为：

```text
SITE_URL=https://Houraiji.github.io
BASE_PATH=/
```

GitHub 仓库设置里需要进入 `Settings -> Pages`，把 `Source` 设置为 `GitHub Actions`。

本地模拟 GitHub Pages 构建：

```powershell
$env:SITE_URL="https://Houraiji.github.io"
$env:BASE_PATH="/"
npm run build
```

构建后应满足：

- `dist/admin/index.html` 存在，线上 Decap CMS 会发布
- `dist/admin/config.yml` 存在
- `dist/local-admin/` 不存在
- 站内链接和静态资源路径使用根路径 base

## 内容结构

文章：

```text
src/content/articles/
```

站点数据：

```text
src/data/profile.json
src/data/growth.json
src/data/projects.json
```

内容包备份：

```text
my_content/blog-content/
```

当前线上发布源是 `src/data` 和 `src/content`，`my_content/` 只作为内容包和备份，不接入 Decap CMS。

## 目录结构

```text
src/
  components/          页面组件
  content/articles/    Markdown 文章
  data/                profile / growth / projects JSON
  layouts/             全站布局
  lib/                 内容与路径工具
  pages/               首页、资料、成长路线、项目、文章
  styles/              全局样式
public/
  admin/               线上 Decap CMS
  local-admin/         本地专用后台
  assets/              视觉资源
scripts/
  local-admin-server.mjs
  strip-local-admin.mjs
infra/
  decap-oauth-worker/  Cloudflare Worker OAuth proxy 模板
```

更详细的部署和后台说明见 [docs/deployment.md](docs/deployment.md)。
