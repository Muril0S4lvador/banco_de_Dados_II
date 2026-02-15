Objetivo geral: Implementar uma solução de autenticação, autorização e inicialização automática de dados utilizando exclusivamente os mecanismos nativos do MongoDB, em ambiente local via Docker. A solução deve permitir a criação de usuários, papéis (roles), definição de privilégios e durante a inicialização do banco, simulando um ambiente realista de banco de dados com controle de acesso semelhante ao de SGBDs relacionais e serviços gerenciados como o MongoDB Atlas.

Contexto
Em bancos de dados relacionais, o controle de acesso é tradicionalmente baseado em , enquanto a criação de esquemas e a carga inicial de dados fazem parte do processo de do banco.

O MongoDB, embora NoSQL e orientado a documentos, oferece:
Autenticação e autorização nativas baseadas em usuários e roles;
Suporte à criação de papéis customizados;
Execução automática de scripts de inicialização quando utilizado via Docker, por meio do diretório docker-entrypoint-initdb.d.
Esse trabalho explora , destacando:
Segurança (quem pode acessar o quê);
Administração (quem cria usuários, roles e coleções);
Inicialização automática de dados (quem pode ler, escrever ou modificar os dados carregados).
Implementação (Requisitos mínimos)

1. Autenticação nativa do MongoDB
Inicializar o MongoDB com autenticação habilitada (--auth);
Criar um usuário administrador inicial via variáveis de ambiente ou script;
Criar usuários adicionais utilizando db.createUser(...);
Demonstrar acesso permitido e negado via mongosh.
2. Autorização baseada em roles
Utilizar papéis padrão do MongoDB (ex.: read, readWrite, dbAdmin);
                - Criar com db.createRole(...);
                - Definir permissões considerando:
                - Bancos específicos;
                - Coleções específicas;
                - Ações permitidas (find, insert, update, remove, etc.);
Associar usuários a um ou mais papéis;
Demonstrar bloqueio automático de operações não autorizadas.
3. Ingestão automática de coleções e dados
Utilizar o diretório docker-entrypoint-initdb.d para:
                - Criação de bancos e coleções;
                - Inserção de dados iniciais;
Os dados devem ser inseridos automaticamente do contêiner;
A carga inicial deve ser feita por scripts .js executados pelo mongosh;
Os scripts devem considerar:
                - Ordem de execução (ex.: criação de coleções antes da inserção);
                - Uso de um usuário com privilégios adequados (ex.: administrador);
Após a inicialização:
                - Usuários com permissão de leitura conseguem consultar os dados;
                - Usuários sem permissão adequada não conseguem acessá-los.

4. Contêineres e inicialização
Uso obrigatório de Docker;
Arquivo docker-compose.yml contendo:
                - Serviço MongoDB;
                - Volume para persistência dos dados;
                - Montagem do diretório docker-entrypoint-initdb.d;
Scripts de inicialização organizados, por exemplo:
                - 01-create-roles.js
                - 02-create-users.js
                - 03-create-collections.js
                - 04-insert-data.js

Entrega
Repositório GitHub contendo:
Diretório docker-entrypoint-initdb.d/ com:
                - Scripts de criação de roles;
                - Scripts de criação de usuários;
                - Scripts de criação de coleções;
                - Scripts de ingestão de dados;
Arquivos:
                - docker-compose.yml;
                - Dockerfile (se aplicável);
Exemplos de uso via mongosh, demonstrando:
                - Login com diferentes usuários;
                - Operações permitidas e negadas;
Arquivo README.md completo com:
                - Descrição da arquitetura;
                - Fluxo de inicialização do MongoDB;
                - Explicação da ingestão automática de dados;
                - Instruções para reset do ambiente (ex.: remoção de volumes);
                - Exemplos de testes de autenticação e autorização;
                - Capturas de tela do processo.

Critérios de avaliação: Funcionamento básico, Robustez, Criatividade, Documentação, Qualidade do código, Testes e exemplos.