# 部署说明

这个项目按 GitHub Pages 用户站部署，目标地址是：

```text
https://Houraiji.github.io/
```

前台是 Astro 静态站点；线上 `/admin/` 是 Decap CMS；本地直接写文件的后台移动到 `/local-admin/`，并在生产构建后移除。

## GitHub Pages

仓库已添加：

```text
.github/workflows/deploy.yml
```

工作流使用 Astro 官方 GitHub Action 构建，并通过 GitHub Pages 发布。固定环境变量：

```text
SITE_URL=https://Houraiji.github.io
BASE_PATH=/
```

上线前在 GitHub 仓库中设置：

1. 打开 `Settings -> Pages`
2. 将 `Source` 设置为 `GitHub Actions`
3. 推送到 `main` 后等待 workflow 完成

本地可用同样的环境变量模拟构建：

```powershell
$env:SITE_URL="https://Houraiji.github.io"
$env:BASE_PATH="/"
npm run build
```

构建后检查：

```text
dist/admin/index.html
dist/admin/config.yml
```

这两个文件应该存在；本地后台目录不应该存在：

```text
dist/local-admin/
```

## Base Path

`Houraiji.github.io` 是 GitHub Pages 用户站仓库，站点部署在根路径 `/`。代码里仍通过 `src/lib/paths.ts` 统一处理站内链接和 public 资源路径，后续如果再迁移到项目页也不用大面积改页面：

```ts
withBase("/articles/")
```

在当前用户站构建中会输出：

```text
/articles/
```

CSS 背景图由 `BaseLayout.astro` 注入 CSS 变量，避免在子路径部署时 public 资源 404。

## 线上后台

线上后台入口：

```text
https://Houraiji.github.io/admin/
```

它加载 Decap CMS，并读取：

```text
public/admin/config.yml
```

当前 CMS 映射的内容源：

- `src/data/profile.json`
- `src/data/growth.json`
- `src/data/projects.json`
- `src/content/articles/*.md`

文章字段保持当前 Astro schema：

```text
title
date
category
tags
worldline
tone
relatedProjects
summary
body
```

Decap CMS 会把编辑结果提交到 `main` 分支，GitHub Actions 随后重新部署站点。

## OAuth Worker

GitHub backend 需要 OAuth proxy。仓库提供 Cloudflare Worker 模板：

```text
infra/decap-oauth-worker/
```

部署步骤概要：

1. 在 GitHub 创建 OAuth App
2. 将 callback URL 设置为 `https://你的-worker.workers.dev/callback`
3. 部署 `infra/decap-oauth-worker/src/worker.js`
4. 在 Cloudflare Worker 环境变量中配置 secrets：

   ```text
   GITHUB_CLIENT_ID
   GITHUB_CLIENT_SECRET
   ALLOWED_ORIGIN=https://Houraiji.github.io
   CMS_PATH=/admin/
   ALLOWED_GITHUB_LOGIN=Houraiji
   ```

5. 把 `public/admin/config.yml` 中的占位值替换为真实 Worker 域名：

   ```yaml
   backend:
     name: github
     repo: Houraiji/Houraiji.github.io
     branch: main
     base_url: https://你的-worker.workers.dev
     auth_endpoint: auth
   ```

OAuth Worker 不存储内容，只完成 GitHub OAuth 登录和 token 回传。设置 `ALLOWED_GITHUB_LOGIN=Houraiji` 后，只有该 GitHub 账号能完成 `/admin/` 登录；最终能否写入仓库仍取决于登录账号是否有 `Houraiji/Houraiji.github.io` 的 push 权限。

## 本地后台

本地后台入口：

```text
http://127.0.0.1:4321/local-admin/index.html
```

使用方式：

```bash
npm run dev
npm run admin:local
```

本地后台通过 `scripts/local-admin-server.mjs` 暴露本机 API，直接写入项目中的 JSON 和 Markdown 文件。它不需要 GitHub 登录，也不应该发布到线上。

生产构建最后会运行：

```bash
node scripts/strip-local-admin.mjs
```

该脚本删除：

```text
dist/local-admin/
```

注意：`dist/admin/` 不会被删除，因为它是线上 Decap CMS 后台。

## 发布流程

推荐实际流程：

1. 本地开发和预览页面
2. 如需本地直接编辑内容，打开 `/local-admin/index.html`
3. 运行 GitHub Pages 环境变量下的 `npm run build`
4. 提交并推送到 `main`
5. GitHub Actions 自动部署
6. 线上内容小改可以通过 `/admin/` 登录 Decap CMS 后直接提交

## 验证清单

- 首页、个人资料、成长路线、项目档案、文章归档可打开
- 至少 5 篇文章详情页可打开
- GitHub、Email、项目链接可点击
- `/admin/` 能加载 Decap CMS
- `/local-admin/` 线上不可访问
- 构建产物中没有错误的根路径资源引用
