import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PARENT_ID = "3c91c663-3ba9-814c-af31-cca51276eef8"

sprints = [
    {
        "title": "Sprint 0 — Descoberta, design e arquitetura",
        "status": "Concluída",
        "objective": "Reduzir riscos de produto, experiência e integração antes de implementar o editor.",
        "scope": "Pesquisa de MindMeister, Xmind e Miro; requisitos; modelo de domínio; design móvel 9:16; estratégia offline-first; backlog e definição de pronto.",
        "deliveries": "design.md, research-notes.md, requirements-architecture.md e sprint-plan.md.",
        "validation": "Decisões confrontadas com documentação oficial do Expo, Firebase, Apple HIG e Android Accessibility.",
        "retro": "Separar AsyncStorage da nuvem tornou o MVP utilizável mesmo sem configuração externa e reduziu o risco da integração Firebase.",
    },
    {
        "title": "Sprint 1 — Biblioteca e persistência offline",
        "status": "Concluída",
        "objective": "Entregar uma biblioteca funcional sem cadastro e uma base de estado confiável.",
        "scope": "Navegação por abas, Biblioteca, busca, filtros, modelos, favoritos, duplicação, lixeira, reducer, histórico e AsyncStorage.",
        "deliveries": "Contexto global, domínio TypeScript, quatro modelos e telas Biblioteca, Organização, Sincronização e Ajustes.",
        "validation": "Testes de criação, validade, duplicação, remoção de descendentes e desfazer/refazer foram aprovados.",
        "retro": "O estado controlado precisou aceitar valores vazios intermediários para permitir substituição de texto sem concatenação; a correção recebeu teste de regressão.",
    },
    {
        "title": "Sprint 2 — Editor visual",
        "status": "Concluída",
        "objective": "Completar o ciclo criar, estruturar, editar, salvar e retomar.",
        "scope": "Canvas SVG, conexões curvas, seleção, arrasto, zoom, pan, enquadramento, minimapa, inspetor e estrutura em lista.",
        "deliveries": "Editor responsivo com dock de ações, painel lateral em telas amplas e folha inferior em celulares.",
        "validation": "O fluxo Web criou um mapa de estudo, adicionou uma ramificação, renomeou o tópico e retornou à Biblioteca com seis tópicos persistidos.",
        "retro": "Controles visíveis para zoom, adicionar e lista semântica reduziram a dependência de gestos ocultos e melhoraram a acessibilidade.",
    },
    {
        "title": "Sprint 3 — Firebase e multiplataforma",
        "status": "Concluída com pendência externa",
        "objective": "Preparar continuidade entre dispositivos sem comprometer o modo local.",
        "scope": "Firebase Auth, Firestore, sessão local, merge conservador, conflitos, manifesto PWA, service worker, tablets, tema e atalhos Web.",
        "deliveries": "Integração via APIs REST oficiais, regras Firestore, PWA instalável e tela de ajuda acessível.",
        "validation": "Merge, conflito e configuração incompleta possuem testes; o fallback local foi validado no preview. A execução contra um projeto Firebase real ficou pendente porque os valores foram recusados.",
        "retro": "A Firebase JS SDK elevou o consumo de memória durante o export estático. A migração para REST preservou os serviços solicitados e permitiu concluir o build.",
    },
    {
        "title": "Sprint 4 — Qualidade, marca e entrega",
        "status": "Concluída",
        "objective": "Consolidar a versão demonstrável, reproduzível e documentada.",
        "scope": "Ícone exclusivo, marca, testes, TypeScript, lint, export PWA, correções de runtime, README e documentação no Notion.",
        "deliveries": "Ícones móveis e PWA, 15 rotas estáticas, 14 testes aprovados, documentos técnicos e páginas de sprints/features.",
        "validation": "TypeScript e ESLint concluíram sem erros; a PWA foi exportada e o fluxo principal foi validado no preview Web.",
        "retro": "A verificação por fluxo encontrou um problema real de edição que não aparecia nos testes iniciais, reforçando a utilidade de combinar testes puros e validação interativa.",
    },
]

features = [
    {
        "id": "F01", "title": "Navegação adaptativa", "sprint": "Sprint 1", "status": "Concluída",
        "story": "Como pessoa usuária, quero acessar biblioteca, organização, sincronização e ajustes por uma navegação previsível.",
        "behavior": "Quatro abas ficam próximas ao polegar no celular. Editor, novo mapa e ajuda usam rotas dedicadas sem expor nomes técnicos.",
        "implementation": "app/(tabs)/_layout.tsx, app/_layout.tsx e componentes/ui/icon-symbol.tsx.",
        "acceptance": "Todas as abas possuem ícone, título, área de toque e rota funcional.",
        "accessibility": "Os itens usam função de aba, rótulo textual e cor de seleção fornecida pelo tema.",
        "tests": "Tipagem e navegação Biblioteca → Novo mapa → Editor verificadas no preview.",
    },
    {
        "id": "F02", "title": "Biblioteca de mapas", "sprint": "Sprint 1", "status": "Concluída",
        "story": "Como estudante, quero encontrar e retomar meus mapas rapidamente.",
        "behavior": "Busca por título/etiqueta, filtros, cartão de continuidade, resumo visual, favorito, duplicação e lixeira.",
        "implementation": "app/(tabs)/index.tsx, components/map-card.tsx e selectVisibleMaps no reducer.",
        "acceptance": "Mapas criados aparecem com título, quantidade de tópicos e data relativa; busca e filtros atualizam a lista.",
        "accessibility": "Cada cartão anuncia título e quantidade de tópicos; favorito e mais ações possuem rótulos únicos.",
        "tests": "Biblioteca vazia e biblioteca com mapa persistido foram verificadas no preview.",
    },
    {
        "id": "F03", "title": "Modelos de mapa", "sprint": "Sprint 1", "status": "Concluída",
        "story": "Como iniciante, quero começar por uma estrutura didática em vez de uma tela vazia.",
        "behavior": "Modelos Em branco, Estudo, Projeto e Brainstorm criam nós e conexões válidos ao redor da ideia central.",
        "implementation": "app/new-map.tsx e createMindMap em lib/mind-map/domain.ts.",
        "acceptance": "Cada modelo gera exatamente uma raiz e todas as conexões apontam para nós existentes.",
        "accessibility": "Modelos usam função de rádio, estado selecionado, título e descrição completa.",
        "tests": "Criação do modelo Estudo e validação estrutural aprovadas em Vitest e no preview.",
    },
    {
        "id": "F04", "title": "Domínio e histórico", "sprint": "Sprint 1", "status": "Concluída",
        "story": "Como pessoa usuária, quero corrigir alterações sem perder o restante do mapa.",
        "behavior": "Operações puras adicionam, atualizam, movem e removem nós; histórico mantém até quarenta instantâneos.",
        "implementation": "types/mind-map.ts, lib/mind-map/domain.ts e lib/mind-map/reducer.ts.",
        "acceptance": "Desfazer restaura o mapa anterior e refazer reaplica a alteração; seleção e zoom não poluem o histórico.",
        "accessibility": "Desfazer e refazer têm rótulos e estado desabilitado explícito.",
        "tests": "Seis testes do domínio aprovados, incluindo regressão da substituição de títulos.",
    },
    {
        "id": "F05", "title": "Persistência local offline-first", "sprint": "Sprint 1", "status": "Concluída",
        "story": "Como pessoa usuária, quero editar sem rede ou cadastro e retomar depois.",
        "behavior": "AsyncStorage persiste biblioteca, mapa ativo, preferências, versão do schema e horário do último salvamento.",
        "implementation": "lib/mind-map/storage.ts e context/mind-map-context.tsx.",
        "acceptance": "Mudanças são salvas com debounce e carregadas sem sobrescrever dados antes da hidratação.",
        "accessibility": "Estado de salvamento é comunicado por texto, não apenas por cor.",
        "tests": "Retorno Editor → Biblioteca exibiu mapa e seis tópicos após o salvamento automático.",
    },
    {
        "id": "F06", "title": "Canvas e conexões", "sprint": "Sprint 2", "status": "Concluída",
        "story": "Como pessoa visual, quero compreender a hierarquia por cartões conectados.",
        "behavior": "SVG renderiza curvas coloridas entre centros dos nós sobre um canvas de 1400 × 900 com grade opcional.",
        "implementation": "components/editor/mind-map-canvas.tsx.",
        "acceptance": "Todos os nós do modelo aparecem conectados; seleção enfatiza as relações relevantes.",
        "accessibility": "O canvas possui alternativa por lista semântica dos tópicos.",
        "tests": "Editor do modelo Estudo foi validado visualmente com cinco nós e conexões corretas.",
    },
    {
        "id": "F07", "title": "Edição de nós", "sprint": "Sprint 2", "status": "Concluída",
        "story": "Como estudante, quero expandir e personalizar ideias sem sair do mapa.",
        "behavior": "Selecionar abre inspetor; é possível adicionar filho, editar título/nota, escolher cor/formato, mover e excluir subárvore.",
        "implementation": "components/editor/node-inspector.tsx, mind-map-canvas.tsx e ações do reducer.",
        "acceptance": "Nó raiz não pode ser excluído; exclusão de outro nó remove descendentes e conexões inválidas.",
        "accessibility": "Campos possuem rótulos; cores e formatos são rádios; ações destrutivas indicam estado.",
        "tests": "Adicionar e renomear “Arquiteturas CNN” foi concluído no preview; remoção de descendentes possui teste unitário.",
    },
    {
        "id": "F08", "title": "Navegação do canvas", "sprint": "Sprint 2", "status": "Concluída",
        "story": "Como pessoa usuária, quero navegar em mapas maiores por toque, mouse e teclado.",
        "behavior": "Pan, pinça, zoom por botões, enquadramento e minimapa funcionam entre 45% e 180%.",
        "implementation": "Gestures e câmera em components/editor/mind-map-canvas.tsx; atalhos em app/editor/[id].tsx.",
        "acceptance": "Botões +, − e enquadrar fornecem alternativa aos gestos; 0 enquadra na Web.",
        "accessibility": "Cada controle tem finalidade anunciada e alvo de 46–48 pontos.",
        "tests": "Controles apareceram habilitados no preview e o enquadramento inicial acomodou o modelo de estudo.",
    },
    {
        "id": "F09", "title": "Organização", "sprint": "Sprint 2", "status": "Concluída",
        "story": "Como pessoa com muitos mapas, quero destacar e recuperar conteúdo rapidamente.",
        "behavior": "Coleções Recentes, Favoritos e Lixeira usam filtros do domínio; etiquetas participam da busca.",
        "implementation": "app/(tabs)/organize.tsx, Biblioteca e reducer.",
        "acceptance": "Contagens refletem o estado atual; lixeira usa exclusão lógica e oferece base para restauração.",
        "accessibility": "Coleções anunciam nome e quantidade de mapas.",
        "tests": "Contagens e navegação para filtros foram verificadas por tipagem e fluxo de tela.",
    },
    {
        "id": "F10", "title": "Autenticação Firebase", "sprint": "Sprint 3", "status": "Implementada; configuração pendente",
        "story": "Como pessoa que deseja sincronizar, quero entrar ou criar conta sem tornar o cadastro obrigatório.",
        "behavior": "Identity Toolkit REST cria conta, entra e redefine senha; Secure Token renova a sessão persistida.",
        "implementation": "lib/firebase/rest-auth.ts e context/firebase-sync-context.tsx.",
        "acceptance": "Com seis valores públicos configurados, a tela alterna entre entrar, criar conta, sincronizar e sair.",
        "accessibility": "Formulário tem rótulos, mensagens amigáveis e botão com estado ocupado.",
        "tests": "Configuração completa/incompleta possui testes. Chamada real ficou pendente porque os valores foram recusados.",
    },
    {
        "id": "F11", "title": "Sincronização Firestore", "sprint": "Sprint 3", "status": "Implementada; configuração pendente",
        "story": "Como pessoa com vários dispositivos, quero manter uma cópia remota sem perder edições locais.",
        "behavior": "Firestore REST lê e grava documentos privados por UID; merge compara versão, data e base remota, duplicando conflitos.",
        "implementation": "lib/firebase/sync.ts, firestore.rules e firebase.json.",
        "acceptance": "Mapa local ausente na nuvem é enviado; mapa remoto novo é baixado; alterações concorrentes produzem duas cópias.",
        "accessibility": "Estados local, sincronizando, sincronizado, offline, conflito e erro possuem texto e não dependem da cor.",
        "tests": "Três cenários de merge aprovados; execução real aguarda configuração Firebase.",
    },
    {
        "id": "F12", "title": "PWA e responsividade", "sprint": "Sprint 3", "status": "Concluída",
        "story": "Como pessoa em qualquer tela, quero instalar e usar o mesmo produto com layout apropriado.",
        "behavior": "Manifesto, service worker network-first, HTML em pt-BR e breakpoints de uma, duas e três colunas.",
        "implementation": "app/+html.tsx, public/manifest.json, public/sw.js e layouts responsivos.",
        "acceptance": "Export estático gera 15 rotas; manifesto contém ícones 192/512 e display standalone.",
        "accessibility": "Viewport usa safe area; HTML define idioma; foco e controles permanecem acessíveis na Web.",
        "tests": "Três testes PWA aprovados e expo export concluído. Fonte: https://docs.expo.dev/guides/progressive-web-apps/",
    },
    {
        "id": "F13", "title": "Acessibilidade e ajuda", "sprint": "Sprint 3", "status": "Concluída",
        "story": "Como pessoa que usa diferentes formas de interação, quero alternativas aos gestos e instruções claras.",
        "behavior": "Rótulos semânticos, alvos amplos, lista de tópicos, estados selecionados/desabilitados e tela de ajuda.",
        "implementation": "app/help.tsx e propriedades accessibility* nas telas e componentes.",
        "acceptance": "Ações essenciais são alcançáveis por botões; conteúdo espacial pode ser percorrido em lista.",
        "accessibility": "A feature materializa recomendações da Apple e do Android para contraste, descrição e alvos de toque.",
        "tests": "Rótulos e papéis foram inspecionados no preview. Fontes: https://developer.apple.com/design/human-interface-guidelines/accessibility e https://developer.android.com/guide/topics/ui/accessibility/apps",
    },
    {
        "id": "F14", "title": "Identidade visual", "sprint": "Sprint 4", "status": "Concluída",
        "story": "Como pessoa usuária, quero reconhecer o produto rapidamente no launcher e no navegador.",
        "behavior": "Símbolo de ramificações em forma de cérebro usa violeta, branco e um nó coral, sem texto ou máscara embutida.",
        "implementation": "assets/images, public/logo192.png, public/logo512.png, theme.config.js e app.config.ts.",
        "acceptance": "Ícone principal é replicado para splash, favicon e foreground Android; PWA usa dimensões exatas.",
        "accessibility": "Alto contraste e formas espessas mantêm reconhecimento em tamanhos reduzidos.",
        "tests": "Teste PWA confirma arquivos declarados; app.config não contém placeholders.",
    },
    {
        "id": "F15", "title": "Testes e documentação", "sprint": "Sprint 4", "status": "Concluída",
        "story": "Como desenvolvedora, quero uma base verificável e documentada para continuar evoluindo o produto.",
        "behavior": "Vitest cobre domínio, Firebase e PWA; TypeScript, ESLint e export são executáveis por scripts; decisões vivem em docs e Notion.",
        "implementation": "tests/, docs/, README.md, vitest.config.ts e package.json.",
        "acceptance": "14 testes aprovados, TypeScript e lint sem erros e 15 rotas exportadas.",
        "accessibility": "QA inclui rótulos, estados e alternativas aos gestos, não apenas aparência.",
        "tests": "Resultado detalhado registrado em docs/qa-notes.md.",
    },
]


def table(rows):
    output = ['<table fit-page-width="true" header-row="true">']
    for row in rows:
        output.append("\t<tr>")
        for cell in row:
            output.append(f"\t\t<td>{cell}</td>")
        output.append("\t</tr>")
    output.append("</table>")
    return "\n".join(output)


pages = []
for sprint in sprints:
    content = "\n".join([
        f'<callout icon="✓" color="green_bg">\n\tStatus: {sprint["status"]}\n</callout>',
        "## Objetivo",
        sprint["objective"],
        "## Execução",
        table([
            ["Dimensão", "Registro"],
            ["Escopo", sprint["scope"]],
            ["Entregas", sprint["deliveries"]],
            ["Validação", sprint["validation"]],
        ]),
        "## Retrospectiva",
        sprint["retro"],
        "## Definição de pronto",
        "O escopo foi considerado pronto após fluxo funcional, acessibilidade, persistência adequada, verificação TypeScript, testes aplicáveis e documentação atualizada.",
    ])
    pages.append({"properties": {"title": sprint["title"]}, "content": content})

for feature in features:
    content = "\n".join([
        f'<callout icon="✓" color="purple_bg">\n\t{feature["status"]} · {feature["sprint"]}\n</callout>',
        "## História da pessoa usuária",
        feature["story"],
        "## Comportamento entregue",
        feature["behavior"],
        "## Registro técnico",
        table([
            ["Campo", "Detalhe"],
            ["Implementação", feature["implementation"]],
            ["Critério de aceite", feature["acceptance"]],
            ["Acessibilidade", feature["accessibility"]],
            ["Testes e evidências", feature["tests"]],
        ]),
        "## Estado final",
        "A feature está integrada ao fluxo do MapaMente. Pendências externas, quando existentes, estão explicitadas no status e não bloqueiam o modo local.",
    ])
    pages.append({"properties": {"title": f'{feature["id"]} — {feature["title"]}'}, "content": content})

payload = {
    "allow_async": False,
    "parent": {"page_id": PARENT_ID},
    "pages": pages,
}

(ROOT / "docs" / "notion-create-children.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Payload criado com {len(pages)} páginas")
