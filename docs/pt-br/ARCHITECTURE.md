# Arquitetura

## Visão Geral

O simulador é dividido em duas camadas principais:

1. **Camada de orquestração de UI** (`src/components`)
2. **Pacote de engine de simulação e renderização** (`@nullcipherr/grit-engine`)

Essa divisão evita acoplamento entre estado/UX em React e lógica de física/renderização.

## Fluxo de Execução

1. `main.tsx` monta a aplicação React.
2. `App.tsx` cria o container full-screen.
3. `ParticleSimulator.tsx` instancia `GritEngine` com `canvas`, `overlayCanvas`, `config` e callback de métricas (`onStats`).
4. Presets e controles de UI atualizam o `SimConfig`.
5. Eventos de ponteiro chamam os métodos imperativos da engine (`spawnAt`, `addObstacle`, `setPointer`, `clearPointer`).
6. O pacote `@nullcipherr/grit-engine` executa o loop da simulação e renderização.

## Fronteira de Responsabilidade

- O app consome apenas a API pública da engine (`GritEngine`, `DEFAULT_SIM_CONFIG`, `SimConfig`).
- Implementações internas de física, grid espacial, colisão e renderer ficam no repositório da engine.
- Esse contrato reduz impacto de manutenção no front-end quando houver evolução interna da engine.
