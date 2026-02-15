📋 Plano de Ação: Autenticação e Ingestão Nativa MongoDB
Este plano está dividido em fases sequenciais para garantir que a infraestrutura suba corretamente antes da aplicação das regras de segurança e dados.

Fase 1: Estruturação do Ambiente Docker
O alicerce do projeto. O MongoDB no Docker requer variáveis específicas para ativar a autenticação no primeiro boot.

Tarefa 1.1: Criar o arquivo docker-compose.yml.

Utilizar imagem oficial mongo:latest.

Configurar variáveis MONGO_INITDB_ROOT_USERNAME e MONGO_INITDB_ROOT_PASSWORD (Admin Master).

Mapear o volume local ./init-db:/docker-entrypoint-initdb.d.

Configurar volume de persistência para os dados do banco.

Tarefa 1.2: Criar a estrutura de pastas local:

Plaintext
├── project-root/
│   ├── docker-compose.yml
│   ├── init-db/           <-- Scripts .js entram aqui
│   └── README.md
Fase 2: Desenvolvimento dos Scripts de Inicialização (init-db/)
O MongoDB executa os scripts em ordem alfanumérica. A ordem proposta abaixo garante que permissões existam antes dos usuários, e usuários existam antes da carga de dados.

Tarefa 2.1: 01-create-roles.js

Script para db.createRole() definindo permissões granulares (ex: readOnlyLimited com restrição a coleções específicas).

Tarefa 2.2: 02-create-users.js

Script para db.createUser(). Criar pelo menos dois perfis: um AppAdmin (privilégios de escrita) e um Viewer (apenas leitura).

Tarefa 2.3: 03-create-collections-and-data.js

Script para realizar o db.createCollection() e insertMany().

Dica de robustez: Utilizar db.getSiblingDB('nome_do_banco') no início de cada script para garantir que os dados caiam no banco correto e não no admin.

Fase 3: Validação e Testes (Operações Permitidas vs. Negadas)
O agente deve provar que a segurança está funcionando conforme o especificado.

Tarefa 3.1: Criar um guia de comandos mongosh para o README:

Teste A: Login como Admin -> Criar documento (Sucesso esperado).

Teste B: Login como Viewer -> Tentar db.collection.insertOne() (Erro de autorização esperado).

Teste C: Login como Viewer -> db.collection.find() (Sucesso esperado).

Tarefa 3.2: Capturar logs e prints da inicialização do Docker para comprovar que o entrypoint processou os scripts.

Fase 3.5: Escrever intermediario que lidara com a validação das permissões
Tarefa 3.5.1: Quero que crie uma interface gráfica que faça login de acordo com a tabela users e disponibilize as permissões de acordo com a tabela roles. Cada usuário deve realizar as ações permitidas em sua ROLE, como select, insert, update e delete.

A interface gráfica deve, além do login, ter uma interface de terminal em que irá executar os comandos mongodb.

Como meio de validação, a aplicação deve interceptar o comando e verificar se ele corresponde a permissao da role.

O usuario somente podera ver as tabelas em que possui SELECT.

Somente o ADMIN tera permissoes sobre a tabela de USUARIOS e ROLES.

Para interface grafica, sugiro usar o customtkinter

Fase 4: Documentação Final (Entrega)
O diferencial para os critérios de "Qualidade" e "Documentação".

Tarefa 4.1: Escrever o README.md.

Incluir o diagrama lógico da solução (como o Docker interage com o script de boot).

Instruções claras de Reset: docker-compose down -v (explicando que sem remover o volume, o script de inicialização não roda novamente).

Tarefa 4.2: Revisão de código. Verificar se as senhas não estão expostas de forma insegura (ou orientar o uso de um arquivo .env).


Observações:
A parte principal desse trabaçho é a autorização de roles. Permissões em visualizar, deletar, update e criar tabelas. 

Os arquivos devem ser divididos em:
- 01-create-roles.js > Criação de roles, no caso a admin, que sera a inicial
- 02-create-users.js > Criação de usuários, no caso o admin com a role admin
- 03-create-collections.js > sera o mongo-init, por favor troque o nome do arquivo

