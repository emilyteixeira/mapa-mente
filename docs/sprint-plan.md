# Plano de sprints — MapaMente

**Autor:** Manus AI  
**Método:** entregas verticais curtas, cada uma com funcionalidade, acessibilidade, teste e documentação

## Visão dos sprints

| Sprint | Objetivo | Entregáveis | Saída verificável |
| --- | --- | --- | --- |
| Sprint 0 — Descoberta | Reduzir riscos de produto e arquitetura | Pesquisa, requisitos, modelo de domínio, estratégia offline-first, design e backlog | Documentos aprováveis e projeto Expo inicializado |
| Sprint 1 — Biblioteca offline | Permitir criar e administrar mapas sem conta | Design system, navegação, biblioteca, modelos, reducer, persistência local e configurações | Mapa criado e reaberto após reiniciar o aplicativo |
| Sprint 2 — Editor visual | Completar o ciclo principal de edição | Canvas, SVG, nós, conexões, seleção, edição, movimento, zoom, pan, minimapa e histórico | Usuário cria e reorganiza um mapa com múltiplos níveis |
| Sprint 3 — Nuvem e multiplataforma | Habilitar continuidade e adaptação | Firebase, sessão opcional, fila de sincronização, PWA, tablet, atalhos e acessibilidade | Edição local funciona sem rede e sincroniza quando disponível |
| Sprint 4 — Qualidade e entrega | Consolidar produto e documentação | Ícone, marca, testes, lint, validação visual, README e Notion | Versão reproduzível, testada e documentada |

## Critérios de pronto

Uma feature só será considerada concluída quando possuir fluxo funcional sem saída morta, estado vazio ou erro recuperável quando aplicável, rótulos de acessibilidade, persistência adequada, verificação TypeScript e registro no Notion. Mudanças de domínio deverão incluir teste unitário. Funcionalidades visuais serão verificadas em viewport móvel e ampla.

## Catálogo de features

| ID | Feature | Sprint | Critérios de aceite |
| --- | --- | --- | --- |
| F01 | Navegação adaptativa | 1 | Tab bar no celular e layout utilizável em telas amplas |
| F02 | Biblioteca | 1 | Criar, abrir, buscar, favoritar, duplicar e excluir |
| F03 | Modelos de mapa | 1 | Criar ao menos quatro estruturas iniciais válidas |
| F04 | Domínio e histórico | 1 | Operações puras, seleção e desfazer/refazer |
| F05 | Persistência local | 1 | Biblioteca e preferências sobrevivem ao reinício |
| F06 | Canvas e conexões | 2 | Nós e curvas renderizam de forma consistente |
| F07 | Edição de nós | 2 | Adicionar, renomear, mover, recolorir e excluir |
| F08 | Navegação do canvas | 2 | Zoom, pan, centralização e visão geral acessíveis por controles |
| F09 | Organização | 2 | Favoritos, etiquetas e lixeira integrados à Biblioteca |
| F10 | Autenticação Firebase | 3 | Sessão opcional com estados de entrada e saída |
| F11 | Sincronização Firestore | 3 | Upload/download, fila, indicador e conflito conservador |
| F12 | PWA e responsividade | 3 | Manifesto/configuração Web e layouts para celular, tablet e desktop |
| F13 | Acessibilidade | 3 | Rótulos, foco, contraste, alvos, texto escalável e alternativas a gestos |
| F14 | Identidade visual | 4 | Ícone exclusivo e marca aplicada em todas as plataformas |
| F15 | Testes e documentação | 4 | Testes, lint, TypeScript, README e páginas do Notion atualizadas |

## Riscos e mitigação

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Gestos divergentes entre Web e nativo | Alto | Disponibilizar controles explícitos e usar gestos progressivamente |
| Persistência Firebase inconsistente no Expo Go | Alto | AsyncStorage como fonte local e sincronização por adaptador |
| Canvas pesado em mapas grandes | Médio | Componentes memorizados, domínio normalizado e limites de renderização |
| Conflitos entre dispositivos | Médio | Versão, data, deviceId e duplicação segura em conflito |
| Configuração Firebase ausente | Médio | Modo local completo e tela explicativa de configuração |
| Acessibilidade em conteúdo espacial | Alto | Ordem semântica alternativa e lista navegável dos tópicos |

## Estrutura documental no Notion

A página principal conterá visão do produto, arquitetura, status atual, decisões e links. Cada sprint terá uma subpágina com objetivo, escopo, decisões, entregas, testes, riscos e retrospectiva. Cada feature terá uma subpágina com problema, história do usuário, comportamento, modelo técnico, critérios de aceite, acessibilidade, testes e estado final. A documentação será atualizada após a implementação para refletir o código real, não apenas o planejamento.
