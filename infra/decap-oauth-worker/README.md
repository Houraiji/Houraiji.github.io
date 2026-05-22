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
```

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

Only GitHub users with push permission to `Houraiji/Houraiji.github.io` can publish changes through the CMS.
