# Performance

## Otimizações Implementadas

- Spatial hash grid para busca local de vizinhos.
- Flocking com frequência reduzida e limite de vizinhos.
- Reuso de arrays para minimizar garbage collection.
- Paleta de matiz pré-calculada no renderer.
- Atualização de métricas de UI em intervalo fixo.
- Limite de DPR (`MAX_DPR`) para reduzir custo em telas densas.

## Próximos Passos Técnicos

- Simulação opcional em Web Worker.
- Automação de benchmark reproduzível.
- Instrumentação mais detalhada de frame time.
