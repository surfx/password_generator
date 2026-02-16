# Configuração do Password Generator Extension

Para que a extensão funcione corretamente e se comunique com o sistema de arquivos local (para salvar senhas), é necessário registrar o **Native Messaging Host**.

## Passos para Instalação

1.  **Execute o registro**:
    *   Dê um duplo clique no arquivo `register_host.bat` localizado na raiz deste projeto.
    *   Isso executará o script de configuração que registra o host no Windows Registry para o usuário atual.
    *   Se aparecer alguma mensagem de erro, verifique se você tem permissões.

2.  **Reinicie o Chrome**:
    *   Após o registro, feche e abra o Google Chrome.

3.  **Recarregue a Extensão**:
    *   Vá em `chrome://extensions`.
    *   Encontre "Password Generator".
    *   Clique no ícone de "Recarregar" (seta circular).

## Solução de Problemas

*   **Erro "Specified native messaging host not found"**:
    *   Isso significa que o registro não foi feito corretamente ou o caminho mudou. Execute:

    ```ps1
    cd D:\projetos\javascript\plugins\password_generator\server\native_host\
    .\install_host.ps1 kngehbelineohghkkmkbhmkcolkonaif
    ```

*   **Erro "Uncaught ReferenceError"**:
    *   Isso foi corrigido na última atualização do código `DataAux.js`. Recarregue a extensão.

*   **Lista de senhas vazia**:
    *   Certifique-se de que está logado na extensão.
    *   Se o problema persistir, verifique se o arquivo `server/meu-servidor-rest/db_json/pass_gen_db.json` existe e tem permissão de escrita.

## Sobre a Arquitetura

Esta extensão utiliza **Native Messaging** para comunicar diretamente com um script Python (`native_host.py`). Não é necessário rodar um servidor HTTP separadamente, pois o Chrome inicia o script Python automaticamente quando necessário.
