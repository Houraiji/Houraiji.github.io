# Houraiji Blog

一个中文为主的个人成长博客，用来记录真实的成长线，也可以作为低调的个人展示站点。

当前版本是一个 Astro 静态站点骨架，风格方向是“成长存档 / Visual Novel Archive”：干净克制的个人网站里加入轻量动漫、RPG 档案、存档槽、成长路线和札记书架等元素。

## 功能

- 首页：展示“我是谁 + 我正在成长”，带读取存档过场动效
- 成长线：以 checkpoint route map 的方式展示阶段节点
- 项目：以记录档案形式展示项目经历
- 文章：Markdown 内容驱动的文章列表和详情页
- 关于：角色资料卡、当前章节、能力树、兴趣和联系方式
- 主题：支持浅色 / 深色切换，并在本地保存偏好
- 内容结构：文章、成长节点、项目、个人状态都与页面组件分离，方便后续接 CMS

## 技术栈

- [Astro](https://astro.build/)
- TypeScript
- Markdown Content Collections
- CSS animations

## 本地运行

```bash
npm install
npm run dev
```

默认访问：

```text
http://127.0.0.1:4321/
```

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run check    # Astro 类型和内容检查
npm run build    # 构建静态站点
npm run preview  # 预览构建结果
```

## 目录结构

```text
src/
├─ components/          # Header、Footer、文章卡片、主题切换等组件
├─ content/
│  └─ articles/         # Markdown 文章
├─ data/                # 个人资料、成长节点、项目数据
├─ layouts/             # 全站布局
├─ pages/               # 首页、成长线、项目、文章、关于等页面
└─ styles/              # 全局样式和动效

public/
└─ assets/              # SVG 插图和站点视觉资产

openspec/
└─ changes/create-growth-blog/
   ├─ proposal.md
   ├─ design.md
   ├─ tasks.md
   └─ specs/
```

## 内容替换

文章内容放在：

```text
src/content/articles/
```

成长线节点放在：

```text
src/data/growth.ts
```

项目记录放在：

```text
src/data/projects.ts
```

个人资料、当前章节、联系方式和能力树放在：

```text
src/data/profile.ts
```

## 环境变量

如果后续需要调用图片生成或其他 API，可以创建本地环境文件：

```text
.env.local
```

示例见：

```text
.env.example
```

不要提交真实密钥。`.env` 和 `.env.*` 已经在 `.gitignore` 中忽略。

## 部署

这是静态 Astro 项目，可以部署到 Vercel、Netlify、Cloudflare Pages 或 GitHub Pages。

构建命令：

```bash
npm run build
```

构建输出目录：

```text
dist/
```

## 后续计划

- 替换真实成长内容
- 增加更多原创动漫风格视觉资产
- 接入轻量 CMS 管理文章、项目和成长节点
- 丰富文章分类、标签和归档页面
- 完善移动端细节和视觉动效
