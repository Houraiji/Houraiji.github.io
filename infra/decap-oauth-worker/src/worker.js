const githubAuthorizeUrl = "https://github.com/login/oauth/authorize";
const githubTokenUrl = "https://github.com/login/oauth/access_token";
const githubUserUrl = "https://api.github.com/user";

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

const getAllowedGitHubLogins = (env) =>
  (env.ALLOWED_GITHUB_LOGIN || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const fetchGitHubViewer = async (accessToken) => {
  const response = await fetch(githubUserUrl, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.github+json",
      "user-agent": "houraiji-decap-oauth-worker",
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub user lookup failed (${response.status}): ${details}`);
  }

  return response.json();
};

const callbackHtml = (provider, payload, targetOrigin, cmsUrl) => `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <p>Authentication complete. Finalizing CMS sign-in...</p>
    <script>
      (function () {
        var message = "authorization:${provider}:success:" + ${JSON.stringify(JSON.stringify(payload))};
        var targetOrigin = ${JSON.stringify(targetOrigin)};
        var cmsUrl = ${JSON.stringify(cmsUrl)};
        var parentWindow = window.opener || (window.parent !== window ? window.parent : null);

        if (parentWindow) {
          var receiveMessage = function (event) {
            parentWindow.postMessage(message, event.origin || targetOrigin);
            window.removeEventListener("message", receiveMessage, false);
            window.close();
          };

          window.addEventListener("message", receiveMessage, false);
          parentWindow.postMessage("authorizing:${provider}", "*");
        } else {
          document.body.textContent = "Authentication complete. Return to the CMS to continue.";
          if (cmsUrl) {
            setTimeout(function () {
              window.location.replace(cmsUrl);
            }, 1200);
          }
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
    const allowedGitHubLogins = getAllowedGitHubLogins(env);

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

      if (allowedGitHubLogins.length > 0) {
        try {
          const viewer = await fetchGitHubViewer(token.access_token);
          const viewerLogin = typeof viewer.login === "string" ? viewer.login.toLowerCase() : "";

          if (!allowedGitHubLogins.includes(viewerLogin)) {
            return html("This GitHub account is not allowed to access this CMS.", 403);
          }
        } catch (error) {
          return json(
            {
              error: "GitHub user verification failed.",
              details: error instanceof Error ? error.message : String(error),
            },
            502,
          );
        }
      }

      return html(
        callbackHtml(
          "github",
          { token: token.access_token, provider: "github" },
          origin,
          `${origin}${cmsPath}`,
        ),
      );
    }

    if (url.pathname === "/" || url.pathname === "") {
      return Response.redirect(`${origin}${cmsPath}`, 302);
    }

    return json({ error: "Not found" }, 404);
  },
};
