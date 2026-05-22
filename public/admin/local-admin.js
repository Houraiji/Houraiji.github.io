const API_ROOT = "http://127.0.0.1:4323/api";

const editorRoot = document.querySelector("#editor-root");
const statusNode = document.querySelector("#server-status");
const articleButtons = document.querySelector("#article-buttons");
const reloadAllButton = document.querySelector("#reload-all");
const sectionButtons = [...document.querySelectorAll("[data-section]")];

let articleList = [];
let currentSection = "profile";
let currentArticleSlug = "";

const nowText = () => new Date().toLocaleTimeString("zh-CN", { hour12: false });

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

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const byId = (id) => document.getElementById(id);

const splitList = (value) =>
  String(value || "")
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);

const clampLevel = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const normalizeSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const setEditorStatus = (node, text, tone = "") => {
  node.textContent = text;
  node.className = `status ${tone}`.trim();
};

const renderQuietLinkRow = (link = {}) => `
  <div class="repeater-row">
    <label>
      <span>名称</span>
      <input data-field="label" value="${escapeHtml(link.label)}" placeholder="GitHub" />
    </label>
    <label>
      <span>链接</span>
      <input data-field="href" value="${escapeHtml(link.href)}" placeholder="https://github.com/" />
    </label>
    <button type="button" class="button-compact" data-remove-row>删除</button>
  </div>
`;

const renderSkillRow = (skill = {}) => `
  <div class="repeater-row skill-row">
    <label>
      <span>技能</span>
      <input data-field="name" value="${escapeHtml(skill.name)}" placeholder="前端基础" />
    </label>
    <label>
      <span>熟练度</span>
      <input data-field="level" type="number" min="0" max="100" value="${escapeHtml(skill.level ?? 50)}" />
    </label>
    <label>
      <span>备注</span>
      <input data-field="note" value="${escapeHtml(skill.note)}" placeholder="一句话说明能力状态" />
    </label>
    <button type="button" class="button-compact" data-remove-row>删除</button>
  </div>
`;

const renderProfileEditor = async () => {
  let data = await request("/profile");
  const profile = data.profile || {};
  const quietLinks = Array.isArray(profile.quietLinks) ? profile.quietLinks : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const currentFocus = Array.isArray(profile.currentFocus) ? profile.currentFocus : [];
  const interests = Array.isArray(data.interests) ? data.interests : [];

  editorRoot.innerHTML = `
    <div class="toolbar">
      <div>
        <div class="eyebrow">Profile</div>
        <h2>个人资料</h2>
      </div>
      <div class="toolbar-actions">
        <button type="button" id="save-profile" class="button-primary">保存资料</button>
        <button type="button" id="edit-profile-json">编辑 JSON</button>
      </div>
    </div>
    <form id="profile-form" class="stack">
      <section class="form-section">
        <h3>基础信息</h3>
        <div class="form-grid">
          <label>
            <span>显示名称</span>
            <input id="profile-display-name" value="${escapeHtml(profile.displayName)}" />
          </label>
          <label>
            <span>副标题</span>
            <input id="profile-handle" value="${escapeHtml(profile.handle)}" />
          </label>
          <label class="field-full">
            <span>短简介</span>
            <textarea id="profile-short-intro" class="textarea-compact">${escapeHtml(profile.shortIntro)}</textarea>
          </label>
          <label>
            <span>当前章节</span>
            <input id="profile-current-chapter" value="${escapeHtml(profile.currentChapter)}" />
          </label>
          <label>
            <span>状态</span>
            <input id="profile-status" value="${escapeHtml(profile.status)}" />
          </label>
          <label class="field-full">
            <span>当前关注</span>
            <textarea id="profile-current-focus" class="textarea-compact">${escapeHtml(currentFocus.join("\n"))}</textarea>
          </label>
        </div>
      </section>

      <section class="form-section">
        <div class="toolbar">
          <h3>安静链接</h3>
          <button type="button" id="add-quiet-link">添加链接</button>
        </div>
        <div id="quiet-links" class="repeater">
          ${quietLinks.map(renderQuietLinkRow).join("") || renderQuietLinkRow()}
        </div>
      </section>

      <section class="form-section">
        <div class="toolbar">
          <h3>技能树</h3>
          <button type="button" id="add-skill">添加技能</button>
        </div>
        <div id="skills-editor" class="repeater">
          ${skills.map(renderSkillRow).join("") || renderSkillRow()}
        </div>
      </section>

      <section class="form-section">
        <h3>兴趣</h3>
        <label>
          <span>兴趣列表</span>
          <textarea id="profile-interests" class="textarea-compact">${escapeHtml(interests.join("\n"))}</textarea>
        </label>
      </section>
      <div id="editor-status" class="status"></div>
    </form>
  `;

  const form = byId("profile-form");
  const editorStatus = byId("editor-status");

  byId("edit-profile-json").addEventListener("click", async () => {
    await renderJsonEditor("个人资料 JSON", "/profile");
  });

  byId("add-quiet-link").addEventListener("click", () => {
    byId("quiet-links").insertAdjacentHTML("beforeend", renderQuietLinkRow());
  });

  byId("add-skill").addEventListener("click", () => {
    byId("skills-editor").insertAdjacentHTML("beforeend", renderSkillRow());
  });

  form.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-row]");
    if (removeButton) {
      removeButton.closest(".repeater-row")?.remove();
    }
  });

  byId("save-profile").addEventListener("click", async () => {
    const nextQuietLinks = [...document.querySelectorAll("#quiet-links .repeater-row")]
      .map((row) => ({
        label: row.querySelector('[data-field="label"]').value.trim(),
        href: row.querySelector('[data-field="href"]').value.trim(),
      }))
      .filter((link) => link.label || link.href);

    const nextSkills = [...document.querySelectorAll("#skills-editor .repeater-row")]
      .map((row) => ({
        name: row.querySelector('[data-field="name"]').value.trim(),
        level: clampLevel(row.querySelector('[data-field="level"]').value),
        note: row.querySelector('[data-field="note"]').value.trim(),
      }))
      .filter((skill) => skill.name || skill.note);

    const nextData = {
      ...data,
      profile: {
        ...profile,
        displayName: byId("profile-display-name").value.trim(),
        handle: byId("profile-handle").value.trim(),
        shortIntro: byId("profile-short-intro").value.trim(),
        currentChapter: byId("profile-current-chapter").value.trim(),
        currentFocus: splitList(byId("profile-current-focus").value),
        status: byId("profile-status").value.trim(),
        quietLinks: nextQuietLinks,
      },
      skills: nextSkills,
      interests: splitList(byId("profile-interests").value),
    };

    try {
      setEditorStatus(editorStatus, "正在保存个人资料...");
      await request("/profile", {
        method: "PUT",
        body: JSON.stringify(nextData),
      });
      data = nextData;
      setEditorStatus(editorStatus, `个人资料已保存。${nowText()}`, "ok");
    } catch (error) {
      setEditorStatus(editorStatus, `保存失败：${error.message}`, "warn");
    }
  });
};

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
      setEditorStatus(editorStatus, "正在保存到本地文件...");
      const parsed = JSON.parse(textarea.value);
      await request(path, {
        method: "PUT",
        body: JSON.stringify(parsed),
      });
      setEditorStatus(editorStatus, `已保存到本地文件。${nowText()}`, "ok");
    } catch (error) {
      setEditorStatus(editorStatus, `保存失败：${error.message}`, "warn");
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
      setEditorStatus(editorStatus, "正在保存文章...");
      await request(`/articles/${slug}`, {
        method: "PUT",
        body: JSON.stringify({ content: textarea.value }),
      });
      setEditorStatus(editorStatus, `文章已保存。${nowText()}`, "ok");
      await loadArticles();
    } catch (error) {
      setEditorStatus(editorStatus, `保存失败：${error.message}`, "warn");
    }
  });
};

const renderNewArticleEditor = () => {
  editorRoot.innerHTML = `
    <div class="toolbar">
      <div>
        <div class="eyebrow">New Markdown Article</div>
        <h2>新建文章</h2>
        <p class="muted">填写基础信息后会在 src/content/articles/ 下创建新的 Markdown 文件。</p>
      </div>
      <div class="toolbar-actions">
        <button type="button" id="create-article" class="button-primary">创建文章</button>
      </div>
    </div>
    <form id="new-article-form" class="stack">
      <div class="form-grid">
        <label>
          <span>标题</span>
          <input id="new-title" required placeholder="例如：一次阶段复盘" />
        </label>
        <label>
          <span>Slug</span>
          <input id="new-slug" required placeholder="stage-reflection" />
        </label>
        <label class="field-full">
          <span>摘要</span>
          <input id="new-description" placeholder="一句话说明这篇文章记录什么" />
        </label>
        <label>
          <span>分类</span>
          <input id="new-category" value="阶段记录" />
        </label>
        <label>
          <span>标签</span>
          <input id="new-tags" value="成长线, 复盘" />
        </label>
        <label>
          <span>阅读时间</span>
          <input id="new-reading-time" value="3 分钟" />
        </label>
        <label class="checkbox-row">
          <input id="new-featured" type="checkbox" />
          <span>设为精选文章</span>
        </label>
      </div>
      <label>
        <span>正文初稿</span>
        <textarea id="new-content">从这里开始写正文。</textarea>
      </label>
      <div id="editor-status" class="status"></div>
    </form>
  `;

  const form = document.querySelector("#new-article-form");
  const titleInput = document.querySelector("#new-title");
  const slugInput = document.querySelector("#new-slug");
  const editorStatus = document.querySelector("#editor-status");

  titleInput.addEventListener("input", () => {
    if (!slugInput.dataset.touched) {
      slugInput.value = normalizeSlug(titleInput.value);
    }
  });

  slugInput.addEventListener("input", () => {
    slugInput.dataset.touched = "true";
    slugInput.value = normalizeSlug(slugInput.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const slug = normalizeSlug(slugInput.value);
    if (!slug) {
      setEditorStatus(editorStatus, "请填写 slug，只能使用英文、数字、连字符或下划线。", "warn");
      return;
    }

    try {
      setEditorStatus(editorStatus, "正在创建文章...");
      const created = await request("/articles", {
        method: "POST",
        body: JSON.stringify({
          slug,
          title: titleInput.value.trim() || "未命名札记",
          description: document.querySelector("#new-description").value.trim(),
          category: document.querySelector("#new-category").value.trim(),
          tags: document.querySelector("#new-tags").value,
          readingTime: document.querySelector("#new-reading-time").value.trim(),
          featured: document.querySelector("#new-featured").checked,
          content: document.querySelector("#new-content").value,
        }),
      });

      currentSection = "article";
      currentArticleSlug = created.slug;
      await loadArticles();
      updateSectionButtons();
      await renderArticleEditor(created.slug);
      setStatus(`文章已创建：${created.slug}`, "ok");
    } catch (error) {
      setEditorStatus(editorStatus, `创建失败：${error.message}`, "warn");
    }
  });

  document.querySelector("#create-article").addEventListener("click", () => {
    form.requestSubmit();
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
      await renderProfileEditor();
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

    if (currentSection === "new-article") {
      renderNewArticleEditor();
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
