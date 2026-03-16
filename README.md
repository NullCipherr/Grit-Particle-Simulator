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

## ⚡ Visão Geral

O **WebGL Particle Simulator** é uma aplicação interativa construída com React + TypeScript que simula sistemas de partículas em tempo real com aceleração via **WebGL2**.  
O projeto combina uma interface moderna com um motor de simulação otimizado para alta quantidade de partículas, suportando presets visuais, colisões, flocking e obstáculos dinâmicos.

## ✨ Principais Recursos

- **Renderização via GPU (WebGL2)**:
  - Renderização em lote com instancing para até **50.000 partículas**.
  - Efeito de bloom opcional e trilhas suaves com fade entre frames.
- **Física em tempo real**:
  - Gravidade, atrito, atração/repulsão por ponteiro.
  - Colisão partícula-partícula e partícula-obstáculo.
  - Integração com delta time para comportamento estável.
- **Otimizações de desempenho**:
  - Spatial Hash Grid para busca de vizinhos.
  - Reuso de buffers/arrays para reduzir garbage collection.
  - Atualizações de UI desacopladas do loop principal.
- **Controles interativos**:
  - Criar matéria com clique/arrasto.
  - Alternar pausa, reset da cena e modo obstáculo.
  - Painel de parâmetros com sliders e toggles.
- **Biblioteca de presets**:
  - Coleção de modos como `Nebula`, `Black Hole`, `Firestorm`, `Quantum`, `Cyberpunk`, entre outros.

## 🛠️ Stack Tecnológica

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build**: [Vite 6](https://vitejs.dev/)
- **UI / Motion**: [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/)
- **Deploy**: Cloudflare Pages (com guia em `docs/`)

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

<div align="center">
  <p>Desenvolvido por <a href="https://github.com/NullCipherr">NullCipherr</a></p>
</div>
