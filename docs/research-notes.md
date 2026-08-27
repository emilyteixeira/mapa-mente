# Pesquisa de produto — editores de mapas mentais

## Evidências iniciais

O levantamento competitivo mostra que os produtos mais estabelecidos tratam o mapa mental como uma ferramenta de **captura, organização e comunicação visual**, e não apenas como um diagrama. O MindMeister destaca personalização, colaboração em tempo real, captura de ideias, estudo e reuniões. O Xmind enfatiza estruturas visuais, modelos, uso em Web, desktop e dispositivos móveis e continuidade do processo de raciocínio.

| Referência | Evidências observadas | Implicação para o MapaMente |
| --- | --- | --- |
| MindMeister | Personalização, colaboração em tempo real, criação rápida, educação, brainstorming e organização de informação complexa | Priorizar criação rápida, modelos, compartilhamento posterior e linguagem acessível para estudantes |
| Xmind | Experiência multiplataforma, modelos, organização visual e continuidade entre captura e desenvolvimento de ideias | Projetar um domínio flexível, editor consistente e adaptação de toque para mouse/teclado |
| Miro | Fluxo guiado por conceito central, ramificações, organização e customização; forte ênfase em construção colaborativa | Fazer o primeiro mapa nascer com um nó central pronto e oferecer ações claras de ramificação |

## Hipóteses de priorização

O MVP deve resolver com qualidade o ciclo **criar → estruturar → editar → salvar → retomar**. Colaboração simultânea, geração por IA e apresentações são diferenciais relevantes do mercado, porém elevam significativamente a complexidade. Para a primeira versão, o MapaMente priorizará um editor offline-first, sincronização individual entre dispositivos, modelos educacionais, busca, favoritos, histórico de desfazer/refazer e ajuda contextual. A arquitetura deve deixar colaboração e IA como extensões futuras sem bloquear o MVP.

## Diretrizes de acessibilidade adotadas

A documentação da Apple recomenda suporte a ampliação de texto, contraste mínimo consistente em temas claro e escuro e comunicação que não dependa apenas da cor. A documentação do Android recomenda alvos de toque de pelo menos 48 × 48 dp, descrições únicas orientadas à finalidade e controles simples. Essas evidências sustentam alvos mínimos de 48 pontos no MapaMente, rótulos acessíveis, Dynamic Type, contraste AA e ícones ou texto para complementar toda indicação por cor.

| Requisito | Decisão de implementação |
| --- | --- |
| Texto legível | Base de 16–17 pt, pesos legíveis e suporte à escala do sistema |
| Contraste | Verificação das combinações principais em claro e escuro, visando 4,5:1 para textos comuns |
| Alvos de toque | Botões e áreas interativas com pelo menos 48 × 48 dp |
| Leitores de tela | `accessibilityLabel`, função semântica e descrição de resultado nas ações do editor |
| Diferenciação | Seleção, sincronização e alertas comunicados por ícone, texto e cor |
| Movimento | Animações curtas, funcionais e respeitando redução de movimento |

## Fontes

[1]: https://www.mindmeister.com/pt "MindMeister — Crie mapas mentais online e grátis"
[2]: https://xmind.com/ "Xmind — Mind Map Maker & AI Brainstorming Tool"
[3]: https://miro.com/mind-map/ "Miro — Mind Map Maker"
[4]: https://developer.apple.com/design/human-interface-guidelines/accessibility "Apple Human Interface Guidelines — Accessibility"
[5]: https://developer.android.com/guide/topics/ui/accessibility/apps "Android Developers — Make apps more accessible"
