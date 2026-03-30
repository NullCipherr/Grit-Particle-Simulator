# Arquitetura

## Visão Geral

O simulador é dividido em duas camadas principais:

1. **Camada de orquestração de UI** (`src/components`)
2. **Camada de simulação e renderização** (`src/engine`)

Essa divisão evita acoplamento entre regras de física/render e renderização React.

## Fluxo de Execução

1. `main.tsx` monta a aplicação React.
2. `App.tsx` cria o container full-screen.
3. `ParticleSimulator.tsx` gerencia loop, inputs e estado visual.
4. `SpatialGrid` indexa partículas a cada frame.
5. `Particle` aplica forças e resolve interações.
6. `WebGLRenderer` envia instâncias para GPU e renderiza.
