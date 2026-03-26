<div align="center">
  <h1>🌌 WebGL Particle Simulator</h1>
  <p><i>Um laboratório interativo de partículas com física em tempo real e renderização acelerada por GPU</i></p>

  <p>
    <img src="https://img.shields.io/badge/React-19.0-cyan?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-6.2-purple?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/WebGL-2.0-black?style=for-the-badge" alt="WebGL2" />
  </p>
</div>

---

## 🎥 Preview

<p align="center">
  <img src="./docs/demo.gif" width="800" />
</p>

---

## ⚡ Visão Geral

O **WebGL Particle Simulator** é uma aplicação interativa que simula sistemas de partículas em tempo real com aceleração via **WebGL2**.

A simulação é executada em um **motor imperativo independente**, enquanto o React atua exclusivamente como camada de interface e controle, garantindo alta performance e desacoplamento arquitetural.

O projeto combina computação gráfica, física em tempo real e otimizações de baixo nível para suportar grandes volumes de partículas com fluidez.

---

## ✨ Principais Recursos

### 🖥️ Renderização via GPU (WebGL2)
- Instancing para renderização em lote
- Suporte a até **50.000 partículas**
- Trilhas com fade temporal entre frames
- Efeito de bloom opcional

### ⚙️ Física em tempo real
- Gravidade, atrito e forças dinâmicas
- Atração/repulsão baseada no ponteiro
- Colisões:
  - Partícula-partícula
  - Partícula-obstáculo
- Integração baseada em **delta time**

### 🚀 Otimizações de desempenho
- Spatial Hash Grid para busca eficiente de vizinhos *(O(n²) → O(n))*
- Reuso de buffers para evitar garbage collection
- Loop de simulação desacoplado da UI
- Minimização de draw calls via batching

### 🎮 Controles interativos
- Spawn de partículas via clique/arrasto
- Pausar / resetar simulação
- Criação de obstáculos dinâmicos
- Painel de controle com sliders e toggles

### 🎨 Biblioteca de presets
- `Nebula`
- `Black Hole`
- `Firestorm`
- `Quantum`
- `Cyberpunk`
- e outros modos visuais

---

## 🧠 Arquitetura do Sistema

O projeto é dividido em três camadas principais:

- **Engine (Simulação)**  
  Responsável por toda a lógica física, colisões e atualização de estado.  
  Totalmente desacoplada da interface.

- **Renderer (WebGL2)**  
  Gerencia buffers, shaders e draw calls.  
  Utiliza instancing para renderização altamente eficiente.

- **UI (React)**  
  Interface de controle e interação com o usuário.  
  Não interfere diretamente no loop da simulação.

---

## 📊 Performance

- Até **50.000 partículas** em tempo real
- ~60 FPS em máquinas modernas
- Redução de complexidade de colisão: **O(n²) → O(n)**
- Uso otimizado de memória com buffers reutilizáveis

---

## 🧩 Desafios Técnicos

- Evitar gargalo de colisões *(O(n²))* → uso de **Spatial Hash Grid**
- Minimizar garbage collection → reuso de estruturas de dados
- Separação entre loop imperativo e React
- Controle de estabilidade física com delta time
- Redução de draw calls com instancing

---

## 🔮 Roadmap

- [ ] Paralelização com Web Workers
- [ ] Migração para WebGPU
- [ ] Exportação de simulações (GIF / JSON)
- [ ] Editor de presets customizados
- [ ] Sistema de partículas em 3D

---

## 🛠️ Stack Tecnológica

- **Core**: React 19 + TypeScript
- **Build**: Vite 6
- **UI / Motion**: Tailwind CSS 4, Lucide, Motion
- **Rendering**: WebGL2
- **Deploy**: Cloudflare Pages

---

## 📂 Estrutura do Projeto

```text
src/
├── components/
│   ├── ParticleSimulator.tsx   # UI principal + orchestration do loop
│   └── SettingsPanel.tsx       # Controles de parâmetros da simulação
├── constants/
│   └── presets.ts              # Presets visuais/comportamentais
├── engine/
│   ├── Particle.ts             # Física de partículas
│   ├── Obstacle.ts             # Obstáculos e colisão com partículas
│   ├── SpatialGrid.ts          # Particionamento espacial (vizinhança)
│   └── WebGLRenderer.ts        # Pipeline WebGL2
├── types/
│   └── simulation.ts           # Tipos da configuração
├── App.tsx
└── main.tsx
```

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/NullCipherr/WebGL-Particle-Simulator.git
   cd WebGL-Particle-Simulator
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie em modo desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra no navegador:
   - `http://localhost:3000`

## 📦 Build de Produção

```bash
npm run build
npm run preview
```

## ☁️ Deploy

O projeto está preparado para deploy no **Cloudflare Pages**.

- Guia completo: [docs/deploy-cloudflare-pages.md](./docs/deploy-cloudflare-pages.md)
- Configuração principal:
  - Build command: `npm run build`
  - Output directory: `dist`

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">
  <p>Desenvolvido por <a href="https://github.com/NullCipherr">Andrei Costa</a></p>
</div>
