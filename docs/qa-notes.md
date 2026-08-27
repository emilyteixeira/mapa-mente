# Evidências de validação — MapaMente

## Preview Web

| Data | Rota | Resultado |
| --- | --- | --- |
| 27 ago. 2026 | `/` | Biblioteca carregou com hierarquia clara, busca, filtros, estado vazio, ação primária e quatro abas acessíveis |
| 27 ago. 2026 | `/new-map` | Modal exibiu título, quatro modelos, seleção por rádio, campo de ideia central e ação “Criar e começar” |
| 27 ago. 2026 | `/new-map` — formulário | Campo aceitou “Visão Computacional” e o modelo “Estudo” atualizou corretamente o estado selecionado |
| 27 ago. 2026 | `/editor/new` | O modelo de estudo criou a ideia central e quatro tópicos coloridos, com conexões, minimapa, controles de zoom, histórico e inspetor lateral |
| 27 ago. 2026 | `/editor/new` — adicionar | “Adicionar ramificação” criou e selecionou um novo tópico conectado; desfazer foi habilitado e excluir ficou disponível apenas para tópico não raiz |
| 27 ago. 2026 | `/editor/new` — editar | A primeira substituição concatenou o texto porque o domínio rejeitava o estado vazio intermediário; após a correção, “Arquiteturas CNN” substituiu integralmente o valor anterior e apareceu no canvas e no rótulo acessível |
| 27 ago. 2026 | `/` — retomada | Ao voltar do editor, a Biblioteca exibiu “Visão Computacional”, 6 tópicos e o cartão “Continue de onde parou”, confirmando persistência local e atualização do resumo |
| 27 ago. 2026 | `/sync` | O modo local informou 1 mapa disponível offline e explicou de forma explícita que a configuração Firebase foi recusada, sem bloquear qualquer fluxo local |

A ferramenta de captura integrada não conseguiu obter imagens do preview, mas a abertura direta no navegador confirmou que o bundle Web carrega e que a navegação Biblioteca → Novo mapa funciona. O fluxo continuará sendo testado pela interação direta no preview.

## Resultados automatizados finais

| Verificação | Resultado |
| --- | --- |
| TypeScript | `tsc --noEmit` concluído sem erros |
| ESLint | `expo lint` concluído sem erros ou avisos de código do projeto |
| Vitest | 14 testes aprovados; 1 teste legado de logout ignorado pelo scaffold |
| Exportação PWA | 15 rotas estáticas exportadas para `dist`; bundle Web principal de 2,57 MB antes da otimização REST e menor após a remoção da SDK monolítica |
| Fluxo principal Web | Criar mapa → escolher modelo → adicionar tópico → renomear → voltar à Biblioteca → retomar, concluído |
| Firebase sem configuração | Fallback local visível e funcional; nenhum fluxo local bloqueado |

O primeiro `expo export` foi interrompido por pressão de memória ao incluir a Firebase JS SDK completa. A integração foi migrada para as APIs REST oficiais do Firebase Auth e Firestore, preservando autenticação e sincronização e reduzindo o bundle. Após a mudança, a exportação estática foi concluída com sucesso.

## Limites de validação

A interface Web/PWA foi validada diretamente em viewport ampla, incluindo o modo de inspetor lateral. A composição móvel usa uma coluna, tab bar inferior e inspetor em folha inferior por breakpoints verificados na tipagem e no código, mas ainda deve ser conferida em dispositivos físicos iOS e Android pelo Expo Go. A sincronização remota está implementada e testada no nível de merge, porém não foi executada contra um projeto real porque a solicitação dos valores Firebase foi recusada.
