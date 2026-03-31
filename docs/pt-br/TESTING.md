# Testes

## Validações Automatizadas Atuais

- `npm run typecheck`
- `npm run build`
- Pipeline de CI (`.github/workflows/ci.yml`)

## Fluxo Recomendado Local

```bash
npm run typecheck
npm run build
npm run preview
```

## Matriz Manual

- Spawn por clique/arrasto.
- Criação de obstáculos e colisões.
- Troca de preset com simulação ativa.
- Pausa, retomada e reset.
- Compatibilidade em navegadores com aceleração de hardware habilitada.

## Próximos Testes Recomendados

- Testes de contrato da integração com `@nullcipherr/grit-engine` (atualização de config, ponteiro e pausa/retomada).
- Testes de integração de UI (ex.: Playwright) para controles e fluxos principais.
- Linha de base de regressão de performance por preset.
