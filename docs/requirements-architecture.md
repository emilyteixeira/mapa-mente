# Requisitos e arquitetura — MapaMente

**Autor:** Manus AI  
**Plataformas:** iOS, Android e Web/PWA  
**Base:** Expo SDK 54, React Native 0.81, React 19 e TypeScript

## Visão do produto

O MapaMente transforma ideias em estruturas visuais editáveis, com uso imediato sem cadastro obrigatório. O objetivo do MVP é tornar o fluxo **criar, ramificar, reorganizar, salvar e retomar** rápido em telas pequenas, sem impedir o uso mais amplo em tablets e navegadores. A sincronização será opcional: o dispositivo mantém uma cópia local funcional e o Firebase replica os mapas quando há configuração, sessão e conectividade.

## Requisitos funcionais priorizados

| Prioridade | Capacidade | Critério de aceite resumido |
| --- | --- | --- |
| P0 | Biblioteca de mapas | O usuário cria, abre, busca, favorita, duplica e exclui mapas sem cadastro |
| P0 | Editor de nós | O usuário adiciona, renomeia, move, recolore e remove tópicos conectados |
| P0 | Salvamento automático local | Alterações reaparecem após fechar e reabrir o aplicativo |
| P0 | Histórico | O usuário desfaz e refaz alterações estruturais durante a sessão |
| P0 | Canvas navegável | Toque/mouse seleciona; arrasto move; controles permitem zoom e centralização |
| P0 | Adaptação multiplataforma | Os fluxos essenciais funcionam em celular, tablet e Web sem conteúdo inacessível |
| P1 | Modelos | O usuário inicia mapas de estudo, projeto, brainstorming e planejamento semanal |
| P1 | Organização | Favoritos, etiquetas, recentes e lixeira permitem localizar e recuperar conteúdo |
| P1 | Firebase | O usuário entra e sincroniza seus mapas em uma coleção privada por UID |
| P1 | Estado de sincronização | A interface diferencia dados locais, pendentes, sincronizados e em conflito |
| P1 | Acessibilidade | Ações possuem rótulos, alvos amplos, contraste e alternativa a gestos ocultos |
| P2 | Compartilhamento/exportação | O usuário exporta ou compartilha uma representação do mapa |
| Futuro | Colaboração e IA | A arquitetura admite cursores, permissões e geração assistida sem incluí-los no MVP |

## Requisitos não funcionais

| Categoria | Requisito |
| --- | --- |
| Desempenho | A Biblioteca deve permanecer fluida com dezenas de mapas; o canvas deve evitar reconstruções desnecessárias |
| Resiliência | Nenhuma edição local deve depender da disponibilidade do Firebase |
| Privacidade | A nuvem é opcional, mapas remotos ficam sob `users/{uid}/mindMaps/{mapId}` e regras devem restringir acesso ao proprietário |
| Portabilidade | Tipos e operações de domínio não devem importar APIs de UI ou Firebase |
| Usabilidade | Toda ação crítica deve ter retorno visual e nenhum botão pode terminar em fluxo sem saída |
| Acessibilidade | Controles terão no mínimo 48 × 48 dp, rótulos semânticos e informação não dependente apenas de cor [3] [4] |
| Compatibilidade | A aplicação deve usar a Firebase JS SDK, indicada pelo Expo para aplicativos universais Android, iOS e Web e compatível com Expo Go [1] |

## Arquitetura escolhida

> O armazenamento local é a fonte operacional do aplicativo; o Firebase é uma camada opcional de identidade e réplica remota.

A Firebase JS SDK será utilizada por ser a alternativa oficial do Expo para uma aplicação universal, sem exigir código nativo customizado [1]. O Firestore fornece sincronização e semântica offline em plataformas suportadas, adotando “last write wins” para múltiplas alterações do mesmo documento [2]. Como a persistência do SDK pode variar entre os ambientes do React Native e a PWA, o MapaMente não dependerá dela: o estado será salvo explicitamente no AsyncStorage e uma fila local registrará operações pendentes. Esse desenho reduz o acoplamento e mantém a experiência íntegra em Expo Go.

| Camada | Responsabilidade | Dependências permitidas |
| --- | --- | --- |
| Apresentação | Telas, componentes, gestos, canvas, acessibilidade e feedback | React Native, Expo Router, SVG e hooks de aplicação |
| Aplicação | Casos de uso, reducer, histórico, seleção, modelos e estado de sincronização | Tipos e portas do domínio |
| Domínio | Entidades, invariantes, operações puras e serialização | TypeScript puro |
| Persistência local | Carregar/salvar biblioteca, preferências e fila pendente | AsyncStorage |
| Integração Firebase | Autenticação, upload, download, assinatura e resolução de conflito | Firebase Auth e Firestore |

## Modelo de dados

| Entidade | Campos principais | Regras |
| --- | --- | --- |
| `MindMap` | `id`, `title`, `description`, `nodes`, `edges`, `tags`, `favorite`, `createdAt`, `updatedAt`, `version`, `syncState` | Deve possuir exatamente um nó raiz; exclusão lógica precede remoção definitiva |
| `MindNode` | `id`, `parentId`, `text`, `note`, `x`, `y`, `color`, `shape`, `collapsed`, `createdAt`, `updatedAt` | Nó raiz tem `parentId = null`; demais nós apontam para um nó existente |
| `MindEdge` | `id`, `sourceId`, `targetId`, `color`, `style` | Origem e destino devem existir; não pode conectar nó a si mesmo |
| `EditorHistory` | `past`, `present`, `future` | Limite de instantâneos evita crescimento indefinido |
| `AppPreferences` | `theme`, `showGrid`, `snapToGrid`, `reducedMotion`, `defaultNodeColor` | Preferências são locais por dispositivo |
| `SyncOperation` | `id`, `mapId`, `type`, `payload`, `enqueuedAt`, `attempts` | Uma operação confirmada é removida; falhas mantêm os dados locais |

## Estado e histórico

O estado global será um `MindMapProvider` com `useReducer`. Operações estruturais serão comandos puros — por exemplo, `ADD_NODE`, `MOVE_NODE`, `UPDATE_NODE`, `DELETE_NODE` e `SET_MAP_META`. Antes de uma operação mutável, o mapa atual entra em `past`; uma nova edição limpa `future`. Mudanças de seleção, abertura de painel e zoom não entram no histórico para evitar comportamento inesperado.

## Persistência e sincronização

| Evento | Ação local | Ação remota |
| --- | --- | --- |
| Edição | Atualiza reducer e agenda persistência com debounce | Enfileira `upsert` quando houver sessão |
| Abertura | Carrega biblioteca do AsyncStorage | Busca metadados remotos e compara versões |
| Login | Mantém dados locais intactos | Oferece sincronização e associa os mapas ao UID |
| Reconexão | Continua permitindo edição | Processa fila por ordem e atualiza `syncState` |
| Conflito | Preserva as duas versões | Marca conflito e permite escolher local, nuvem ou duplicar |
| Exclusão | Move para lixeira local | Grava `deletedAt` antes da remoção definitiva |

A estratégia de conflito usará `updatedAt`, `version` e `deviceId`. Alterações sem concorrência avançam normalmente. Se a versão remota mudou depois da base conhecida e o mapa local também mudou, o aplicativo cria uma cópia “Conflito” em vez de sobrescrever silenciosamente. O comportamento é mais conservador que o padrão “last write wins” do Firestore [2].

## Estrutura Firestore proposta

| Caminho | Conteúdo |
| --- | --- |
| `users/{uid}` | Perfil mínimo, datas e preferências de sincronização |
| `users/{uid}/mindMaps/{mapId}` | Metadados e documento serializado do mapa |
| `users/{uid}/devices/{deviceId}` | Nome da plataforma e última sincronização |

As regras de segurança devem exigir `request.auth.uid == uid`. Os índices iniciais cobrirão `updatedAt`, `favorite` e `deletedAt`. O Firebase Authentication ficará desacoplado da navegação principal: a Biblioteca é pública/local e a tela de Sincronização apresenta login e criação de conta apenas quando o usuário deseja usar a nuvem.

## Decisão entre alternativas

| Abordagem | Trade-offs | Custo operacional | Complexidade de configuração |
| --- | --- | --- | --- |
| Local + Firebase JS SDK opcional | Universal, compatível com Expo Go e resiliente; exige fila e resolução de conflitos | Firestore/Auth conforme uso | Média |
| Apenas armazenamento local | Implementação mais simples, porém sem múltiplos dispositivos | Sem backend | Baixa |
| SDK nativo React Native Firebase | Mais recursos nativos e persistência nativa; exige development build e configuração por plataforma [1] | Firebase conforme uso | Alta |

Para o escopo solicitado, foi escolhida a primeira alternativa. Ela preserva a stack desejada, mantém o PWA e permite validar o produto antes de assumir o custo de configuração e manutenção do SDK nativo.

## References

[1]: https://docs.expo.dev/guides/using-firebase/ "Expo — Using Firebase"
[2]: https://firebase.google.com/docs/firestore/manage-data/enable-offline "Firebase — Access data offline"
[3]: https://developer.apple.com/design/human-interface-guidelines/accessibility "Apple Human Interface Guidelines — Accessibility"
[4]: https://developer.android.com/guide/topics/ui/accessibility/apps "Android Developers — Make apps more accessible"
