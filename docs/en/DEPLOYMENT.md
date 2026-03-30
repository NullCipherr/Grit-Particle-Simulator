# Deployment

## Cloudflare Pages (GitHub Integration)

1. Push the repository to GitHub.
2. In Cloudflare Dashboard, create a new Pages project.
3. Connect the Git repository.
4. Configure build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `22`
5. Trigger deploy.

## SPA Routing

The file `public/_redirects` already provides SPA fallback:

```text
/* /index.html 200
```

## Headers

Use `public/_headers` for static response headers managed by Cloudflare Pages.
