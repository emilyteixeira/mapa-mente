# PWA e adaptação multiplataforma

O MapaMente usa a saída estática do Expo Router, um manifesto em `public/manifest.json` e um service worker de estratégia network-first. O manifesto define nome, orientação flexível, cores e ícones instaláveis. O service worker guarda o shell e respostas bem-sucedidas do mesmo domínio, mas sempre tenta a rede primeiro para reduzir o risco de versões antigas ficarem presas no cache, conforme a cautela indicada pela documentação do Expo [1].

| Contexto | Adaptação |
| --- | --- |
| Celular | Biblioteca em uma coluna, tab bar inferior, inspetor do nó em folha inferior e ações próximas ao polegar |
| Tablet | Biblioteca em duas colunas, canvas amplo e inspetor lateral a partir de 900 px |
| Desktop/PWA | Até três colunas, suporte a mouse, atalhos de teclado e instalação pelo manifesto |
| Leitor de tela | Biblioteca com nomes únicos, canvas complementado por lista semântica e ações com finalidade explícita |

## Reference

[1]: https://docs.expo.dev/guides/progressive-web-apps/ "Expo — Progressive web apps"
