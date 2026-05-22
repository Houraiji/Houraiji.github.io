export const estimateReadingMinutes = (body = "") => {
  const compactLength = body.replace(/\s+/g, "").length;
  return Math.max(1, Math.ceil(compactLength / 700));
};

export const getArticleSummary = (article: { data: { description?: string; summary?: string } }) =>
  article.data.description ?? article.data.summary ?? "";

export const getArticleReadingTime = (article: { body?: string; data: { readingTime?: string } }) =>
  article.data.readingTime ?? `约 ${estimateReadingMinutes(article.body ?? "")} 分钟`;

export const normalizeRef = (value = "") =>
  value
    .toLowerCase()
    .replace(/\.md$/, "")
    .replace(/^articles\//, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "");

export const findProjectByRef = <T extends { id?: string; name?: string; title?: string }>(
  projects: T[],
  ref: string,
) => {
  const normalized = normalizeRef(ref);
  return projects.find((project) =>
    [project.id, project.name, project.title].filter(Boolean).some((value) => normalizeRef(value) === normalized),
  );
};

export const articleRefToSlug = (ref = "") =>
  ref
    .replace(/^articles\//, "")
    .replace(/\.md$/, "");
