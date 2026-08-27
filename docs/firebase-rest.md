# Integração Firebase com baixo consumo de memória

O MapaMente usa as APIs REST oficiais do **Firebase Authentication** e do **Cloud Firestore**. Essa decisão preserva os serviços Firebase solicitados e reduz significativamente o número de módulos incluídos no bundle do Expo, evitando estouro de memória durante a renderização estática da PWA.

| Serviço | Endpoint | Uso |
| --- | --- | --- |
| Firebase Auth | Identity Toolkit REST | Criar conta, entrar e redefinir senha |
| Secure Token | Secure Token REST | Renovar a sessão persistida |
| Cloud Firestore | Firestore REST v1 | Ler e gravar documentos sob o UID autenticado |

Cada mapa é serializado em um campo `payload`, acompanhado de `version`, `updatedAt` e `deleted`. As regras Firestore continuam restringindo todas as operações ao `request.auth.uid` correspondente ao caminho do usuário. A Biblioteca local em AsyncStorage permanece a fonte operacional e funciona mesmo quando os endpoints estão indisponíveis.
