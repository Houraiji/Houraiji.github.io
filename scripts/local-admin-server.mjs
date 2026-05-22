import { createServer } from "node:http";
import { access, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const host = "127.0.0.1";
const port = 4323;

const files = {
  profile: path.join(root, "src", "data", "profile.json"),
  growth: path.join(root, "src", "data", "growth.json"),
  projects: path.join(root, "src", "data", "projects.json"),
  articlesDir: path.join(root, "src", "content", "articles"),
};

const json = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
};

const text = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(payload);
};

const readJsonFile = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));
const writeJsonFile = async (filePath, data) => {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const articlePathFromSlug = (slug) => {
  const safe = slug.replace(/[^a-z0-9-_]/gi, "");
  return path.join(files.articlesDir, `${safe}.md`);
};

const normalizeSlug = (slug) =>
  String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const assertArticleSlug = (slug) => {
  if (!slug) {
    throw new Error("Slug is required. Use lowercase letters, numbers, hyphens, or underscores.");
  }

  if (slug.length > 80) {
    throw new Error("Slug is too long. Keep it under 80 characters.");
  }
};

const fileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const parseTitle = (content) => {
  const match = content.match(/title:\s*"([^"]+)"/);
  return match?.[1] || "";
};

const escapeFrontmatter = (value) => String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const createArticleMarkdown = ({ title, description, category, tags, readingTime, featured, content }) => {
  const tagList = Array.isArray(tags)
    ? tags
    : String(tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  const today = new Date().toISOString().slice(0, 10);

  return `---
title: "${escapeFrontmatter(title || "未命名札记")}"
description: "${escapeFrontmatter(description || "这里写这篇文章的简短摘要。")}"
date: "${today}"
category: "${escapeFrontmatter(category || "阶段记录")}"
tags: ${JSON.stringify(tagList.length ? tagList : ["未分类"])}
readingTime: "${escapeFrontmatter(readingTime || "3 分钟")}"
featured: ${Boolean(featured)}
---

${content || "从这里开始写正文。\n"}
`;
};

const collectBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
};

const server = createServer(async (req, res) => {
  if (!req.url) {
    text(res, 400, "Missing URL");
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${host}:${port}`);
  const { pathname } = url;

  try {
    if (req.method === "GET" && pathname === "/api/status") {
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && pathname === "/api/profile") {
      json(res, 200, await readJsonFile(files.profile));
      return;
    }

    if (req.method === "PUT" && pathname === "/api/profile") {
      await writeJsonFile(files.profile, await collectBody(req));
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && pathname === "/api/growth") {
      json(res, 200, await readJsonFile(files.growth));
      return;
    }

    if (req.method === "PUT" && pathname === "/api/growth") {
      await writeJsonFile(files.growth, await collectBody(req));
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && pathname === "/api/projects") {
      json(res, 200, await readJsonFile(files.projects));
      return;
    }

    if (req.method === "PUT" && pathname === "/api/projects") {
      await writeJsonFile(files.projects, await collectBody(req));
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && pathname === "/api/articles") {
      const entries = await readdir(files.articlesDir, { withFileTypes: true });
      const articles = [];

      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
        const slug = entry.name.replace(/\.md$/, "");
        const content = await readFile(path.join(files.articlesDir, entry.name), "utf8");
        articles.push({ slug, title: parseTitle(content) || slug });
      }

      json(res, 200, articles);
      return;
    }

    if (req.method === "POST" && pathname === "/api/articles") {
      const body = await collectBody(req);
      const slug = normalizeSlug(body.slug);
      assertArticleSlug(slug);

      const filePath = articlePathFromSlug(slug);
      if (await fileExists(filePath)) {
        text(res, 409, "Article slug already exists");
        return;
      }

      const content = createArticleMarkdown(body);
      await writeFile(filePath, content, "utf8");
      json(res, 201, { slug, title: body.title || "未命名札记", content });
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/articles/")) {
      const slug = pathname.replace("/api/articles/", "");
      const content = await readFile(articlePathFromSlug(slug), "utf8");
      json(res, 200, { slug, title: parseTitle(content), content });
      return;
    }

    if (req.method === "PUT" && pathname.startsWith("/api/articles/")) {
      const slug = pathname.replace("/api/articles/", "");
      const body = await collectBody(req);
      await writeFile(articlePathFromSlug(slug), body.content ?? "", "utf8");
      json(res, 200, { ok: true });
      return;
    }

    text(res, 404, "Not found");
  } catch (error) {
    text(res, 500, error instanceof Error ? error.message : "Unknown error");
  }
});

server.listen(port, host, () => {
  console.log(`Local admin server running at http://${host}:${port}`);
});
