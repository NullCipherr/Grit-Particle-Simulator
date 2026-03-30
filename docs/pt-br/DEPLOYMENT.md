# Deploy

## Cloudflare Pages (via GitHub)

1. Publicar o repositório no GitHub.
2. Criar um projeto em Cloudflare Pages.
3. Conectar o repositório.
4. Configurar:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: `22`
5. Fazer deploy.

## Rotas SPA

O fallback está pronto em `public/_redirects`:

```text
/* /index.html 200
```
