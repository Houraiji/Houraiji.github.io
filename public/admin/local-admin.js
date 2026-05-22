const API_ROOT = "http://127.0.0.1:4323/api";

const editorRoot = document.querySelector("#editor-root");
const statusNode = document.querySelector("#server-status");
const articleButtons = document.querySelector("#article-buttons");
const reloadAllButton = document.querySelector("#reload-all");
const sectionButtons = [...document.querySelectorAll("[data-section]")];

let articleList = [];
let currentSection = "profile";
let currentArticleSlug = "";

const setStatus = (text, tone = "") => {
  statusNode.textContent = text;
  statusNode.className = `status ${tone}`.trim();
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  const type = response.headers.get("content-type") || "";
  return type.includes("application/json") ? response.json() : response.text();
};

const pretty = (value) => JSON.stringify(value, null, 2);

const renderJsonEditor = async (label, path) => {
  const data = await request(path);

  editorRoot.innerHTML = `
    <div class="toolbar">
      <div>
        <div class="eyebrow">${label}</div>
        <h2>${label}</h2>
      </div>
      <div class="toolbar-actions">
        <button type="button" id="save-json">保存</button>
      </div>
    </div>
    <label>
      <span class="muted">直接编辑 JSON 内容</span>
      <textarea id="json-editor" class="json-area"></textarea>
    </label>
    <div id="editor-status" class="status"></div>
  `;

  const textarea = document.querySelector("#json-editor");
  const editorStatus = document.querySelector("#editor-status");
  textarea.value = pretty(data);

  document.querySelector("#save-json").addEventListener("click", async () => {
    try {
      const parsed = JSON.parse(textarea.value);
      await request(path, {
        method: "PUT",
        body: JSON.stringify(parsed),
      });
      editorStatus.textContent = "已保存到本地文件。";
      editorStatus.className = "status ok";
    } catch (error) {
      editorStatus.textContent = `保存失败：${error.message}`;
      editorStatus.className = "status warn";
    }
  });
};

const renderArticleButtons = () => {
  articleButtons.innerHTML = "";

  articleList.forEach((article) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "list-button";
    button.textContent = article.title || article.slug;
    if (article.slug === currentArticleSlug) {
      button.classList.add("is-active");
    }
    button.addEventListener("click", async () => {
      currentSection = "article";
      currentArticleSlug = article.slug;
      updateSectionButtons();
      renderArticleButtons();
      await renderArticleEditor(article.slug);
    });
    articleButtons.appendChild(button);
  });
};

const renderArticleEditor = async (slug) => {
  const article = await request(`/articles/${slug}`);

  editorRoot.innerHTML = `
    <div class="toolbar">
      <div>
        <div class="eyebrow">Markdown Article</div>
        <h2>${article.title || slug}</h2>
        <p class="muted">slug: ${slug}</p>
      </div>
      <div class="toolbar-actions">
        <button type="button" id="save-article">保存文章</button>
      </div>
    </div>
    <label>
      <span class="muted">直接编辑完整 Markdown 文件（包含 frontmatter）</span>
      <textarea id="article-editor"></textarea>
    </label>
    <div id="editor-status" class="status"></div>
  `;

  const textarea = document.querySelector("#article-editor");
  const editorStatus = document.querySelector("#editor-status");
  textarea.value = article.content;

  document.querySelector("#save-article").addEventListener("click", async () => {
    try {
      await request(`/articles/${slug}`, {
        method: "PUT",
        body: JSON.stringify({ content: textarea.value }),
      });
      editorStatus.textContent = "文章已保存。";
      editorStatus.className = "status ok";
      await loadArticles();
    } catch (error) {
      editorStatus.textContent = `保存失败：${error.message}`;
      editorStatus.className = "status warn";
    }
  });
};

const updateSectionButtons = () => {
  sectionButtons.forEach((button) => {
    const section = button.dataset.section;
    const active =
      section === currentSection ||
      (section === "article-list" && currentSection === "article");
    button.classList.toggle("is-active", active);
  });
};

const loadArticles = async () => {
  articleList = await request("/articles");
  if (!currentArticleSlug && articleList[0]) {
    currentArticleSlug = articleList[0].slug;
  }
  renderArticleButtons();
};

const renderCurrentSection = async () => {
  try {
    setStatus("本地管理服务已连接。", "ok");

    if (currentSection === "profile") {
      await renderJsonEditor("个人资料 JSON", "/profile");
      return;
    }

    if (currentSection === "growth") {
      await renderJsonEditor("成长路线 JSON", "/growth");
      return;
    }

    if (currentSection === "projects") {
      await renderJsonEditor("项目档案 JSON", "/projects");
      return;
    }

    if (currentSection === "article-list" || currentSection === "article") {
      if (!articleList.length) {
        await loadArticles();
      }
      currentSection = "article";
      currentArticleSlug = currentArticleSlug || articleList[0]?.slug || "";
      updateSectionButtons();
      renderArticleButtons();

      if (!currentArticleSlug) {
        editorRoot.innerHTML = "<p class='muted'>还没有文章文件。</p>";
        return;
      }

      await renderArticleEditor(currentArticleSlug);
    }
  } catch (error) {
    setStatus(`本地管理服务未连接：${error.message}`, "warn");
    editorRoot.innerHTML = `
      <div class="stack">
        <h2>无法连接本地管理服务</h2>
        <p class="muted">请先启动本地服务：</p>
        <pre>npm run admin:local</pre>
        <p class="muted">然后刷新当前页面。</p>
      </div>
    `;
  }
};

sectionButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    currentSection = button.dataset.section;
    updateSectionButtons();
    await renderCurrentSection();
  });
});

reloadAllButton?.addEventListener("click", async () => {
  articleList = [];
  await loadArticles();
  await renderCurrentSection();
});

await loadArticles().catch(() => {});
updateSectionButtons();
await renderCurrentSection();
