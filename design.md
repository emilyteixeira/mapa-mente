# Plano de Design — MapaMente

## Direção do produto

O **MapaMente** será um editor visual offline-first de mapas mentais para estudo, planejamento e organização de ideias. A experiência principal será otimizada para orientação vertical 9:16 e uso com uma mão, mantendo uma adaptação progressiva para tablets e Web/PWA. A interface seguirá padrões familiares do iOS: hierarquia tipográfica clara, barras de navegação discretas, ações primárias próximas ao polegar, áreas de toque amplas, menus contextuais e feedback imediato.

## Lista de telas

| Tela | Conteúdo principal | Funções essenciais |
| --- | --- | --- |
| Biblioteca | Saudação, busca, filtros, cartão de continuidade, grade/lista de mapas e botão flutuante | Criar, abrir, favoritar, duplicar, excluir e pesquisar mapas |
| Novo mapa | Modelos visuais, cores iniciais e campo de título | Criar mapa em branco ou a partir de um modelo |
| Editor | Canvas, conexões, nós, minimapa, barra superior e dock de ferramentas | Criar, mover, editar, recolorir e excluir nós; desfazer/refazer; zoom e pan |
| Detalhes do nó | Formulário em folha inferior com texto, descrição, cor e estilo | Atualizar conteúdo e aparência do nó selecionado |
| Organização | Filtros por favoritos, recentes e etiquetas | Encontrar rapidamente mapas salvos |
| Sincronização | Estado local/nuvem, sessão, última sincronização e ação de sincronizar | Entrar, sair e controlar sincronização Firebase |
| Configurações | Tema, acessibilidade, grade, conexão e preferências do editor | Personalizar a experiência e revisar dados locais |
| Ajuda | Gestos, atalhos, dicas e explicação do modo offline | Ensinar o uso de forma didática e acessível |

## Conteúdo e layout por tamanho

Em celulares, a Biblioteca usará uma única coluna com cabeçalho compacto e tab bar inferior. O Editor será imersivo: a barra superior concentrará voltar, título e menu; o dock inferior reunirá adicionar tópico, desfazer e refazer; o inspetor será uma folha inferior. Em tablets, a Biblioteca passará a duas ou três colunas, e o Editor poderá exibir o inspetor lateral sem ocultar o canvas. Na Web/PWA, o conteúdo terá largura máxima controlada, navegação lateral em telas largas e suporte a mouse/teclado além dos gestos por toque.

## Fluxos principais

| Fluxo | Passos |
| --- | --- |
| Criar um mapa | Biblioteca → botão “Novo mapa” → escolher modelo ou branco → informar título → Editor com nó central selecionado |
| Expandir uma ideia | Selecionar nó → “Adicionar tópico” → novo nó conectado → digitar texto → confirmar |
| Reorganizar | Pressionar e arrastar nó → visualizar conexão atualizada → soltar na nova posição → salvar automaticamente |
| Retomar estudo | Biblioteca → cartão “Continue de onde parou” → Editor na última posição conhecida |
| Trabalhar offline | Editar sem conexão → salvar localmente → exibir indicador “Neste dispositivo” → sincronizar ao recuperar conexão e sessão |
| Sincronizar dispositivos | Sincronização → entrar no Firebase → enviar mapas locais → acompanhar estado → acessar em outro dispositivo |
| Corrigir uma ação | Editor → tocar em desfazer → revisar mudança → tocar em refazer, se necessário |

## Cores e identidade

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| Primária | `#5B5CE2` | `#8B8CF8` | Ações principais e seleção |
| Fundo | `#F7F7FB` | `#101116` | Plano de fundo das telas |
| Superfície | `#FFFFFF` | `#1A1C24` | Cartões, folhas e barras |
| Texto | `#191A23` | `#F5F5F7` | Títulos e conteúdo |
| Texto secundário | `#6E7180` | `#A5A8B6` | Metadados e ajuda |
| Borda | `#E4E5EC` | `#30323D` | Separadores e estados neutros |
| Sucesso | `#2E9B73` | `#55C69B` | Sincronização concluída |
| Aviso | `#D9852B` | `#F3AB61` | Alterações locais pendentes |

A paleta combina violeta para foco e criatividade com superfícies neutras de baixo contraste. As categorias de nós poderão usar coral, âmbar, verde, azul e violeta, sempre acompanhadas de contraste textual adequado e não dependerão apenas da cor para comunicar estado.

## Tipografia, espaçamento e acessibilidade

Os títulos usarão pesos semibold ou bold; textos corridos terão no mínimo 16 pt; rótulos auxiliares, no mínimo 13 pt. Os alvos de toque terão pelo menos 44 × 44 pontos. O layout respeitará áreas seguras, tamanho de texto ampliado, contraste, foco visível na Web e rótulos de acessibilidade. Animações serão curtas e funcionais, com alternativa reduzida quando configurada pelo sistema.

## Princípios do canvas

O canvas deve priorizar compreensão e controle. Um toque seleciona, toque duplo edita, arrastar move, pinça controla zoom e arrastar o plano desloca a área visível. A posição dos nós será persistida. Conexões curvas usarão SVG, e nenhum gesto essencial dependerá exclusivamente de um gesto oculto: as ações também estarão disponíveis nos botões e menus.

## Estados de interface

Todos os fluxos terão estados explícitos de vazio, carregamento, sucesso, indisponibilidade de rede e erro recuperável. A Biblioteca vazia ensinará a criar o primeiro mapa. O Editor indicará salvamento automático sem interromper o usuário. A sincronização explicará claramente quando os dados estão apenas no dispositivo ou também na nuvem.
