# Deploy no Cloudflare Pages (via GitHub)

Este guia rápido foi mantido por compatibilidade. Para a versão completa, consulte:

- `docs/en/DEPLOYMENT.md`
- `docs/pt-br/DEPLOYMENT.md`

## 1) Publicar no GitHub

```bash
git init
git add .
git commit -m "chore: prepare project for cloudflare pages"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

## 2) Conectar no Cloudflare Pages

1. Acesse Cloudflare Dashboard > Workers & Pages > Create > Pages.
2. Selecione **Connect to Git** e escolha o repositório.
3. Configure:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `22`
4. Clique em **Save and Deploy**.

## 3) Variáveis de ambiente

Se necessário, configure em **Settings > Environment variables** no projeto do Pages.

## 4) SPA routing

O arquivo `public/_redirects` já está configurado para fallback de rotas:

```text
/* /index.html 200
```
