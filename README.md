# MapaMente

O **MapaMente** é um editor multiplataforma de mapas mentais construído com **Expo 54, React Native, TypeScript e Expo Router**. O produto funciona primeiro no dispositivo: criar, editar, pesquisar e organizar mapas não exige conta nem conexão. Quando um projeto Firebase é configurado, a pessoa usuária pode autenticar-se e sincronizar a Biblioteca entre dispositivos.

> A sincronização remota é opcional. A ausência de credenciais Firebase nunca bloqueia o editor ou o salvamento local.

## Entregas do MVP

| Área | Recursos |
| --- | --- |
| Biblioteca | Busca, Recentes, Favoritos, cartões de retomada, duplicação e lixeira |
| Criação | Mapa em branco e modelos Estudo, Projeto e Brainstorm |
| Editor | Nós e conexões SVG, seleção, arrasto, pan, zoom, enquadramento, minimapa e grade |
| Conteúdo | Título, notas, cores, formatos, ramificações e exclusão de subárvores |
| Histórico | Desfazer e refazer com limite de 40 instantâneos |
| Offline | Persistência automática em AsyncStorage e hidratação segura |
| Firebase | E-mail/senha, renovação de sessão, Firestore REST e conflito preservado como cópia |
| PWA | Manifesto, service worker network-first, shell offline e 15 rotas estáticas |
| Acessibilidade | Rótulos semânticos, alvos amplos, lista alternativa ao canvas, ajuda e atalhos Web |
| Adaptação | Uma coluna no celular, duas no tablet e até três no desktop; inspetor inferior ou lateral |

## Arquitetura

O domínio é independente da interface. Operações como criar, mover, editar, duplicar e excluir retornam novos mapas imutáveis. O reducer adiciona histórico, seleção, filtros e preferências. O contexto hidrata o estado local, aplica debounce de salvamento e fornece seletores às telas.

```text
Telas e componentes
        │
        ▼
MindMapProvider + reducer + histórico
        │
        ├── AsyncStorage (fonte operacional offline)
        │
        └── FirebaseSyncProvider (opcional)
                 │
                 ├── Identity Toolkit REST
                 ├── Secure Token REST
                 └── Firestore REST v1
```

| Diretório | Responsabilidade |
| --- | --- |
| `app/` | Rotas Expo Router, abas, editor, ajuda e criação |
| `components/editor/` | Canvas, nós, minimapa e inspetor |
| `context/` | Estado global offline e sessão/sincronização Firebase |
| `lib/mind-map/` | Domínio, reducer e persistência |
| `lib/firebase/` | Configuração, Auth REST e merge/Firestore REST |
| `types/` | Contratos de mapas, nós, conexões e preferências |
| `tests/` | Domínio, configuração Firebase, conflitos e PWA |
| `docs/` | Pesquisa, requisitos, sprints, marca, PWA, QA e vínculo do Notion |

## Requisitos locais

Use Node.js 22 e pnpm. Para testar em dispositivo, instale o Expo Go compatível com SDK 54. O projeto não depende de Firebase para iniciar.

```bash
pnpm install
pnpm dev
```

Os comandos principais são:

| Comando | Finalidade |
| --- | --- |
| `pnpm dev` | Inicia API auxiliar e Metro Web |
| `pnpm android` | Abre o Metro para Android |
| `pnpm ios` | Abre o Metro para iOS |
| `pnpm check` | Executa verificação TypeScript |
| `pnpm lint` | Executa Expo ESLint |
| `pnpm test` | Executa Vitest |
| `pnpm build:web` | Exporta a PWA estática para `dist/` |

## Configuração do Firebase

Crie um projeto no [Firebase Console](https://console.firebase.google.com/), registre um **aplicativo Web**, habilite **Authentication → E-mail/senha** e crie um banco **Cloud Firestore**. Em seguida, adicione os valores públicos pela área **Secrets** do projeto, usando os nomes abaixo. O Expo recomenda a Firebase JS SDK quando o aplicativo deve funcionar no Expo Go e na Web; este projeto usa os mesmos serviços pelas APIs REST oficiais para reduzir o bundle da exportação estática [1].

| Variável | Campo do `firebaseConfig` |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` |

Publique o arquivo `firestore.rules` no projeto Firebase antes de habilitar sincronização para usuários. As regras permitem leitura e escrita somente quando o UID autenticado coincide com o caminho `users/{userId}`.

### Estratégia de sincronização

Cada mapa possui `version`, `remoteVersion` e `syncState`. O cliente lê a coleção privada, mescla os conjuntos e envia as versões locais necessárias. Se o mapa local e o remoto mudaram desde a mesma base, ambos são preservados; a cópia da nuvem recebe um novo identificador e o sufixo **“versão da nuvem”**, evitando perda silenciosa. O Firestore pode manter cache offline em clientes compatíveis, mas o MapaMente não depende desse cache: AsyncStorage continua sendo a fonte operacional [2].

## PWA

O manifesto fica em `public/manifest.json`, e o HTML raiz registra `public/sw.js`. O service worker usa **network-first** para reduzir o risco de uma versão antiga ficar presa no cache; quando a rede falha, ele responde do cache e usa `/` como fallback do shell. A documentação do Expo alerta que service workers agressivos podem dificultar atualizações, por isso esta implementação evita uma política cache-first global [3].

```bash
pnpm build:web
```

O resultado fica em `dist/` e pode ser hospedado em um serviço estático com HTTPS. Para aplicativos nativos, use o botão **Publish** da interface do projeto para gerar a compilação, incluindo o APK, em vez de realizar um build Android manual no sandbox.

## Acessibilidade e adaptação

Os fluxos essenciais possuem alternativas visíveis aos gestos. O canvas pode ser percorrido pela lista **Estrutura**, e adicionar, editar, excluir, desfazer, refazer e controlar zoom não exigem pinça ou arrasto. Os alvos principais usam aproximadamente 44–48 pontos, em linha com as orientações de plataformas móveis [4] [5].

| Contexto | Composição |
| --- | --- |
| Celular | Biblioteca em uma coluna; tab bar inferior; inspetor como folha inferior |
| Tablet | Biblioteca em duas colunas; editor amplo; inspetor lateral a partir de 900 px |
| Desktop/PWA | Até três colunas; mouse, teclado e atalhos de zoom/histórico |

## Qualidade

Na entrega atual, `tsc --noEmit` e `expo lint` concluíram sem erros. O Vitest aprovou **14 testes**, cobrindo criação, validade, edição, exclusão recursiva, histórico, configuração Firebase, merge conservador e PWA. A exportação estática gerou **15 rotas**. Evidências e limites estão em [`docs/qa-notes.md`](docs/qa-notes.md).

## Documentação de produto

A documentação detalhada está no [Notion — MapaMente: Produto e Desenvolvimento](https://app.notion.com/p/3c91c6633ba9814caf31cca51276eef8?pvs=204). Ela contém cinco páginas de sprint e quinze páginas de feature, cada uma com história da pessoa usuária, comportamento, implementação, critério de aceite, acessibilidade e evidências.

Os principais arquivos locais são [`design.md`](design.md), [`docs/requirements-architecture.md`](docs/requirements-architecture.md), [`docs/sprint-plan.md`](docs/sprint-plan.md), [`docs/pwa.md`](docs/pwa.md), [`docs/firebase-rest.md`](docs/firebase-rest.md), [`docs/brand.md`](docs/brand.md) e [`docs/qa-notes.md`](docs/qa-notes.md).

## Limitações conhecidas

A integração Firebase real não foi exercitada porque os seis valores públicos foram recusados durante o desenvolvimento; o comportamento de configuração, sessão e merge está testado, mas ainda requer validação com um projeto Firebase da responsável. iOS e Android devem ser conferidos em dispositivos físicos pelo Expo Go, especialmente arrasto, pinça, teclado e safe areas. Colaboração simultânea em tempo real, anexos, exportação PDF/imagem e compartilhamento público permanecem fora do escopo do MVP.

## References

[1]: https://docs.expo.dev/guides/using-firebase/ "Expo — Using Firebase"
[2]: https://firebase.google.com/docs/firestore/manage-data/enable-offline "Firebase — Access data offline"
[3]: https://docs.expo.dev/guides/progressive-web-apps/ "Expo — Progressive web apps"
[4]: https://developer.apple.com/design/human-interface-guidelines/accessibility "Apple — Accessibility"
[5]: https://developer.android.com/guide/topics/ui/accessibility/apps "Android — Make apps more accessible"
