# Modelo de Simulação

## Contrato de Configuração

`SimConfig` é exportado por `@nullcipherr/grit-engine` e consumido diretamente pela UI.
Campos expostos atualmente:

- `gravity`
- `friction`
- `attraction`
- `repulsion`
- `particleLife`
- `particleSize`
- `vortex`
- `bloom`
- `flocking`
- `collisions`
- `obstacleMode`

## Pipeline de Atualização

Para cada partícula:

1. Força do ponteiro (atração/repulsão + vórtice opcional)
2. Flocking (alinhamento + coesão)
3. Colisão partícula-partícula
4. Colisão partícula-obstáculo
5. Integração Euler com delta time
6. Limites de tela e decaimento de vida
