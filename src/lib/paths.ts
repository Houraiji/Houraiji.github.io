const baseUrl = import.meta.env.BASE_URL || "/";

export const siteBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

export const withBase = (href = "/") => {
  if (!href) return siteBase;
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;

  const cleanHref = href.startsWith("/") ? href.slice(1) : href;
  return cleanHref ? `${siteBase}${cleanHref}` : siteBase;
};

export const withoutBase = (pathname = "/") => {
  const basePath = siteBase === "/" ? "" : siteBase.replace(/\/$/, "");
  if (!basePath || !pathname.startsWith(basePath)) return pathname;

  const stripped = pathname.slice(basePath.length);
  return stripped || "/";
};
