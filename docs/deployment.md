# 部署说明

这个项目目前按静态 Astro 站点部署。线上站点负责展示内容；内容编辑仍在本地完成，然后通过 Git 推送触发重新部署。

## 推荐部署方式

可以部署到任意静态托管平台：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

通用配置：

```text
Build command: npm run build
Output directory: dist
Node version: 20 或更高
```

环境变量：

```text
SITE_URL=https://你的域名
BASE_PATH=/
```

如果部署到 GitHub Pages 的项目站，例如 `https://Houraiji.github.io/houraiji_blog/`，需要把 `BASE_PATH` 设为：

```text
BASE_PATH=/houraiji_blog
```

如果部署到自定义域名或 Vercel / Netlify / Cloudflare Pages 的根路径，保持：

```text
BASE_PATH=/
```

## 本地后台不会部署上线

`public/admin/` 里的页面只服务于本地编辑。它依赖 `npm run admin:local` 启动的本地 API，并不会在托管平台上写文件。

为了避免线上出现不可用的后台入口，`npm run build` 会在 Astro 构建完成后执行：

```bash
node scripts/strip-local-admin.mjs
```

这个脚本会删除：

```text
dist/admin/
```

也就是说，生产环境不会包含：

- `/admin/index.html`
- `/admin/local-admin.js`
- `/admin/config.yml`

## 内容更新流程

实际更新内容时，推荐这样做：

1. 本地启动前台：

   ```bash
   npm run dev
   ```

2. 本地启动内容管理 API：

   ```bash
   npm run admin:local
   ```

3. 打开本地后台：

   ```text
   http://127.0.0.1:4321/admin/index.html
   ```

4. 修改内容并检查前台页面。

5. 运行生产构建：

   ```bash
   npm run build
   ```

6. 提交并推送改动，让部署平台重新构建。

## 如果以后需要线上编辑

当前本地后台不是线上 CMS，也没有登录、权限、数据库或云端文件写入能力。

如果之后确实需要在线编辑，建议重新设计其中一种方案：

- Git-based CMS：例如 Decap CMS，但要重新配置稳定的登录和 Git 网关
- Headless CMS：例如 Sanity、Contentful、Strapi、Directus
- 自建后台：需要认证、API、存储、备份和部署环境

在这些方案落地前，线上站点应保持静态只读。
