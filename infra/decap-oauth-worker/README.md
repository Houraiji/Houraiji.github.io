# Decap CMS GitHub OAuth Worker

GitHub Pages can host the static Decap CMS admin page, but it cannot run the OAuth callback Decap needs for GitHub login. Deploy this Cloudflare Worker as the small OAuth proxy for `/admin/`.

## 1. Create a GitHub OAuth App

In GitHub Developer Settings, create an OAuth App:

- Homepage URL: `https://Houraiji.github.io`
- Authorization callback URL: `https://<your-worker-domain>/callback`

Copy the client ID and client secret.

## 2. Deploy the Worker

Install Wrangler and deploy from this folder:

```bash
npm create cloudflare@latest houraiji-decap-oauth
```

Replace the generated worker entry with `src/worker.js`, then set secrets:

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

Optional environment variables:

```text
ALLOWED_ORIGIN=https://Houraiji.github.io
CMS_PATH=/admin/
ALLOWED_GITHUB_LOGIN=Houraiji
```

`ALLOWED_GITHUB_LOGIN` is the hard gate for CMS access. When it is set, the worker exchanges the OAuth code, calls the GitHub `/user` API, and only allows the listed login(s) to complete the Decap sign-in flow. You can provide a single login such as `Houraiji` or a comma-separated allowlist if you ever need a backup maintainer.

Deploy:

```bash
wrangler deploy
```

## 3. Update Decap config

After deployment, replace this placeholder in `public/admin/config.yml`:

```yaml
base_url: https://houraiji-decap-oauth.example.workers.dev
```

with your real Worker origin, for example:

```yaml
base_url: https://houraiji-decap-oauth.<your-subdomain>.workers.dev
```

With `ALLOWED_GITHUB_LOGIN=Houraiji`, only that GitHub account can finish login to `/admin/`. Repo push permission is still required for publishing, so the worker allowlist and GitHub repo permissions protect different layers.
