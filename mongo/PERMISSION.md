1. Permission Levels
    Somente os comandos abaixo serão permitidos na interface visual, qualquer outro será negado. Os comandos serão agrupados em grupos conforme a categoria, afim de facilitar na hora de validar com a role o comando que o usuario possui permissao para usar. Todos os comandos devem estar no painel de ajuda, ao digitar 'help'

    A. Create
        Dexcription: Estes métodos adicionam novos documentos a uma coleção. Se a coleção não existir, o MongoDB a cria automaticamente.

        Commands:
        - insertOne: Insere um único documento.
        - insertMany: Insere múltiplos documentos em uma única operação de rede.

    B. Read
        Description: Utilizados para buscar e filtrar dados. É onde a lógica de consulta (query) se concentra.

        Commands:
        - find: Retorna um cursor para todos os documentos que coincidem com o filtro.
        - findOne: Retorna o primeiro documento que satisfaz o critério (útil para buscas por ID).
        - countDocuments: Retorna a quantidade de documentos que atendem ao filtro.
        - distinct: Retorna uma lista de valores únicos para um campo específico.


    C. Update
        Description: Alteram documentos existentes. Por padrão, o MongoDB utiliza operadores como $set para modificar campos sem substituir o documento inteiro.

        Commands:
        - updateOne: Altera apenas o primeiro documento encontrado.
        - updateMany: Altera todos os documentos que coincidem com o filtro.
        - replaceOne: Substitui o documento inteiro (exceto o _id) por um novo.

    D. Delete (Remoção)
        Description: Excluem permanentemente documentos de uma coleção.

        Commands:
        - deleteOne: Remove o primeiro documento que coincide com o filtro.
        - deleteMany: Remove todos os documentos que coincidem com o filtro.
        - findOneAndDelete: Remove o documento e o retorna para a aplicação (útil para filas de processamento).

    E. Admin
        Description: Comandos para gerenciar o banco de dados, coleções e performance (índices).

        Commands:
        - db.createCollection("nome"): Cria uma coleção explicitamente.
        - db.collection.drop(): Remove uma coleção inteira e seus índices.
    
    F. Geral
        Description: Comando que TODOS os usuários do sistema poderão usar, independente da role possuida.

        Commands:
        - show collections: Mostra todas as coleções do sistema.
        - use <collection>: Permite a conexão á coleção, mas nao garante acesso de leitura.
        - help: Exibe painel de ajuda.
        - exit: Sai da aplicação.

2. Organização da Tabela ROLES
    Cada role tera um nível de permissão em cada tabela. as permissoes devem ter: 
        <tableName>, <read>, <create>, <delete>, <update> e <admin>.
    sendo string, bool, bool, bool, bool, bool.
    TableName, read, create, delete e update dizem respeito a uma collection em especifico, isto é, se um usuário possui uma role que possui ("pokemon", "true", "false", "false", "true"), significa que o usuário pode relizar ações de leitura e update na coleção pokemon. admin diz respeito ao banco de dados, não é direcionado à uma tabela em específico. Exemplo, caso role possua admin true, o usuário pode criar e deletar coleções.
    Cada Role pode possuir vários atributos com tablename diferentes, que dizem respeito somente à tabela especificada em tablename.

    Expurgo em Drop: Ao executar drop() em uma coleção, o registro correspondente a essa coleção deve ser removido de todas as Roles existentes no sistema para evitar resíduos de permissões.

    Escopo Admin: Usuários com admin: true possuem permissão plena e absoluta (leitura, escrita, deleção e alteração) em todas as coleções do banco, ignorando quaisquer restrições de nível de tabela.

3. Restrições de Roles
    Somente admin podem ter acesso á role 'users' e 'roles'. Sendo assim, ao realizar uma alteração em users e roles, nao importa se possui uma role com ("users", true, true, true, true), o que importa é caso o usuário possua uma role em que admin: true.
    Usuários com admin: true possuem por padrão e obrigação acesso a todas as coleções. Exemplo: caso possua roles com ("pokemons", false, false, false, false), ainda assim poderá realizar ações de leitura, escrita, update e delete na coleção.
    Restrição de Metadados: Somente usuários com admin: true podem acessar ou modificar as coleções críticas users e roles.

4. Usuários
    Cada usuário pode ter mais que uma role, o que importa é que dentre as roles que o usuário possua, pelo menos uma tem que garantir a ação que ele está executando.
    Exemplo: meu banco de dados possui as coleções: [users, trainers, pokemons, roles] e meu usuário X possui as roles [role1, admin].
    role1:
        admin: false, 
        [
            ("users", true, true, true, true),
            ("trainers", true, false, true, false),
            ("pokemons", false, true, false, true)
            ("roles", false, false, false, false)
        ]
    admin:
        admin: true
    
    Devido à role admin ele pode realizar todas as ações possíveis em todas as tabelas. Caso eu remova a role admin e mantenha a role1, ele poderá apenas realizar ações específicas em trainers e em pokemons.

5. Painel de ajuda
    Ao digitar 'help' abrirá a tela de ajuda que deve conter TODOS os comandos aceitos pelo sistema. Deve manter a forma: 
    '''
        Comandos disponíveis:
            - db.COLLECTION.find()              : Buscar documentos
            - db.COLLECTION.find({"campo": "valor"})  : Buscar com filtro
            - db.COLLECTION.insertOne({"campo": "valor"})  : Inserir documento
            - db.COLLECTION.updateOne({}, {"$set": {}})  : Atualizar documento
            - db.COLLECTION.deleteOne({"campo": "valor"})  : Deletar documento
            - show collections                  : Listar coleções
            - help                              : Mostrar ajuda
    '''

6. Princípios de Autorização
    O sistema opera sob o modelo de Privilégio Mínimo e True Override.

    Default Deny: Nenhum usuário possui permissão inerente. O acesso deve ser explicitamente concedido por uma Role.

    True Override: Se um usuário possuir múltiplas Roles, o valor true sempre terá precedência sobre o false. Basta que uma única Role autorize a ação para que ela seja permitida.

    Escopo Admin: Usuários com a flag admin: true possuem acesso pleno e irrestrito a todas as coleções do banco de dados, ignorando quaisquer restrições individuais de tabela.

        Restrição de Metadados: Somente usuários com admin: true podem acessar ou modificar as coleções críticas users e roles.

7. Json de roles
    Exemplo de uma role em json:
    {
        "roleName": "desenvolvedor_frontend",
        "admin": false,
        "permissions": [
            {
            "tableName": "pokemons",
            "read": true,
            "create": true,
            "delete": false,
            "update": true
            },
            {
            "tableName": "trainers",
            "read": true,
            "create": false,
            "delete": false,
            "update": false
            }
        ]
    }

    role admin:
    {
        "roleName": "admin",
        "admin": true,
        "permissions": [] 
    }
