const githubAuthorizeUrl = "https://github.com/login/oauth/authorize";
const githubTokenUrl = "https://github.com/login/oauth/access_token";

const html = (body, status = 200) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const callbackHtml = (provider, payload, targetOrigin) => `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <script>
      (function () {
        var message = "authorization:${provider}:success:" + ${JSON.stringify(JSON.stringify(payload))};
        if (window.opener) {
          window.opener.postMessage(message, ${JSON.stringify(targetOrigin)});
          window.close();
        } else {
          document.body.textContent = "Authentication complete. You can close this window.";
        }
      })();
    </script>
  </body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const clientId = env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET;
    const configuredSite = new URL(env.ALLOWED_ORIGIN || "https://Houraiji.github.io");
    const origin = configuredSite.origin;
    const sitePath = configuredSite.pathname === "/" ? "" : configuredSite.pathname.replace(/\/$/, "");
    const cmsPath = env.CMS_PATH || `${sitePath}/admin/`;

    if (!clientId || !clientSecret) {
      return json({ error: "Missing GitHub OAuth worker secrets." }, 500);
    }

    if (url.pathname === "/auth") {
      const redirectUri = `${url.origin}/callback`;
      const state = crypto.randomUUID();
      const authUrl = new URL(githubAuthorizeUrl);
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", "repo,user");
      authUrl.searchParams.set("state", state);

      return Response.redirect(authUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return html("Missing GitHub OAuth code.", 400);
      }

      const tokenResponse = await fetch(githubTokenUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const token = await tokenResponse.json();
      if (!token.access_token) {
        return json({ error: "GitHub token exchange failed.", details: token }, 502);
      }

      return html(callbackHtml("github", { token: token.access_token, provider: "github" }, origin));
    }

    if (url.pathname === "/" || url.pathname === "") {
      return Response.redirect(`${origin}${cmsPath}`, 302);
    }

    return json({ error: "Not found" }, 404);
  },
};
