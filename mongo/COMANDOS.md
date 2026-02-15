# 🚀 Referência Rápida de Comandos

Guia com comandos mais utilizados para trabalhar com o projeto MongoDB Authentication.

## 📑 Índice
- [Setup Inicial](#setup-inicial)
- [Docker Commands](#docker-commands)
- [Python Application](#python-application)
- [MongoDB Shell (mongosh)](#mongodb-shell-mongosh)
- [Comandos MongoDB](#comandos-mongodb)
- [Troubleshooting](#troubleshooting)

---

## Setup Inicial

### Executar Setup Automático

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
python setup.py
```

### Setup Manual

```bash
# 1. Instalar dependências Python
pip install -r requirements.txt

# 2. Iniciar containers
docker-compose up -d

# 3. Verificar status
docker-compose ps

# 4. Ver logs de inicialização
docker-compose logs -f mongo
```

---

## Docker Commands

### Iniciar/Parar Containers

```bash
# Iniciar containers em segundo plano
docker-compose up -d

# Iniciar e ver logs
docker-compose up

# Parar containers (mantém dados)
docker-compose stop

# Parar e remover containers (mantém dados)
docker-compose down

# Parar e remover TUDO (incluindo volumes - RESET COMPLETO)
docker-compose down -v
```

### Verificar Status

```bash
# Listar containers ativos
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs

# Ver logs apenas do MongoDB
docker-compose logs mongo

# Ver logs em tempo real
docker-compose logs -f

# Ver últimas 50 linhas
docker-compose logs --tail=50 mongo
```

### Acessar Containers

```bash
# Entrar no container MongoDB
docker exec -it mongo-pokeapi bash

# Executar mongosh diretamente
docker exec -it mongo-pokeapi mongosh -u admin -p admin --authenticationDatabase admin

# Verificar versão do MongoDB
docker exec mongo-pokeapi mongosh --version
```

### Gerenciar Volumes

```bash
# Listar volumes
docker volume ls

# Inspecionar volume de dados
docker volume inspect mongo_mongo-data

# Remover volume específico (CUIDADO: perde dados!)
docker volume rm mongo_mongo-data

# Remover todos os volumes não utilizados
docker volume prune
```

### Resetar Ambiente

```bash
# Reset completo - executa scripts de init novamente
docker-compose down -v
docker-compose up -d

# Aguardar inicialização
timeout /t 15  # Windows
sleep 15       # Linux/Mac

# Verificar logs
docker-compose logs mongo
```

---

## Python Application

### Executar Interface Gráfica

```bash
# Método padrão
python mongo_client.py

# Com ambiente virtual (recomendado)
# Windows
venv\Scripts\activate
python mongo_client.py

# Linux/Mac
source venv/bin/activate
python mongo_client.py
```

### Gerenciar Ambiente Virtual

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar
# Windows PowerShell
venv\Scripts\Activate.ps1
# Windows CMD
venv\Scripts\activate.bat
# Linux/Mac
source venv/bin/activate

# Desativar
deactivate

# Instalar dependências no venv
pip install -r requirements.txt

# Listar pacotes instalados
pip list

# Atualizar pip
python -m pip install --upgrade pip
```

---

## MongoDB Shell (mongosh)

### Conectar ao MongoDB

```bash
# Como admin root
mongosh "mongodb://admin:admin@localhost:27017/?authSource=admin"

# Como usuário da aplicação (viewer)
mongosh "mongodb://viewer:viewPass123@localhost:27017/pokeAPI?authSource=pokeAPI"

# Como dataEntry (escrita)
mongosh "mongodb://dataEntry:entryPass123@localhost:27017/pokeAPI?authSource=pokeAPI"
```

### Comandos Básicos no mongosh

```javascript
// Mostrar bancos de dados
show dbs

// Selecionar banco de dados
use pokeAPI

// Mostrar coleções
show collections

// Sair
exit
quit()
```

---

## Comandos MongoDB

### Consultas (Find)

```javascript
// Buscar todos os documentos (limite 20)
db.pokemons.find()

// Com limite específico
db.pokemons.find().limit(5)

// Buscar um documento específico
db.pokemons.findOne({name: "pikachu"})

// Buscar com filtro
db.pokemons.find({name: "bulbasaur"})

// Buscar com múltiplos filtros
db.pokemons.find({
  name: "charizard",
  height: {$gt: 10}
})

// Projeção (selecionar campos)
db.pokemons.find({}, {name: 1, height: 1, _id: 0}).limit(10)

// Ordenar resultados
db.pokemons.find().sort({name: 1}).limit(10)

// Contar documentos
db.pokemons.countDocuments()
db.pokemons.countDocuments({name: "pikachu"})
```

### Inserção (Insert)

```javascript
// Inserir um documento
db.pokemons.insertOne({name: "new-pokemon",type: "fire",level: 1,moves: ["tackle"]})

// Inserir múltiplos documentos
db.pokemons.insertMany([
  {name: "pokemon1", type: "water"},
  {name: "pokemon2", type: "grass"},
  {name: "pokemon3", type: "fire"}
])
```

### Atualização (Update)

```javascript
// Atualizar um documento
db.pokemons.updateOne({name: "new-pokemon"},{$set: {level: 50, evolved: true}})

// Atualizar múltiplos documentos
db.pokemons.updateMany(
  {type: "fire"},
  {$set: {category: "fire-type"}}
)

// Adicionar item a array
db.pokemons.updateOne(
  {name: "pikachu"},
  {$push: {moves: "thunder"}}
)

// Incrementar valor numérico
db.pokemons.updateOne({name: "pikachu"},{$inc: {level: 1}})
```

### Remoção (Delete)

```javascript
// Deletar um documento
db.pokemons.deleteOne({name: "new-pokemon"})

// Deletar múltiplos documentos
db.pokemons.deleteMany({level: {$lt: 5}})

// Deletar todos os documentos de uma coleção (CUIDADO!)
db.pokemons.deleteMany({})
```

### Agregação

```javascript
// Agrupar por tipo e contar
db.pokemons.aggregate([
  {$unwind: "$types"},
  {$group: {_id: "$types", count: {$sum: 1}}},
  {$sort: {count: -1}}
])

// Calcular estatísticas
db.pokemons.aggregate([
  {$group: {
    _id: null,
    avgHeight: {$avg: "$height"},
    maxHeight: {$max: "$height"},
    minHeight: {$min: "$height"}
  }}
])
```

### Gerenciamento de Coleções

```javascript
// Criar coleção
db.createCollection("new_collection")

// Listar coleções
db.getCollectionNames()

// Estatísticas da coleção
db.pokemons.stats()

// Remover coleção (CUIDADO!)
db.new_collection.drop()
```

---

## Comandos de Administração (SOMENTE ADMIN)

### ⚠ IMPORTANTE
**SOMENTE o usuário `admin/admin` (root) pode criar/gerenciar usuários e roles!**

### Conectar como Admin

```bash
# Via mongosh
mongosh "mongodb://admin:admin@localhost:27017/?authSource=admin"

# Ou via docker exec
docker exec -it mongo-pokeapi mongosh -u admin -p admin --authenticationDatabase admin
```

### Criar Roles Customizadas

```javascript
// Conectar ao banco onde a role será criada
use pokeAPI

// Exemplo 1: Role com permissão de leitura em uma coleção específica
db.createRole({
  role: "customReader",
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "pokemons" },
      actions: ["find"]
    }
  ],
  roles: []  // Sem herdar outras roles
})

// Exemplo 2: Role com múltiplas permissões
db.createRole({
  role: "customEditor",
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "pokemons" },
      actions: ["find", "insert", "update"]
    },
    {
      resource: { db: "pokeAPI", collection: "trainers" },
      actions: ["find"]
    }
  ],
  roles: []
})

// Exemplo 3: Role que herda de outras roles
db.createRole({
  role: "superEditor",
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "pokemons" },
      actions: ["remove"]  // Adiciona permissão de remover
    }
  ],
  roles: [
    { role: "customEditor", db: "pokeAPI" }  // Herda permissões de customEditor
  ]
})

// Exemplo 4: Role admin de coleção específica
db.createRole({
  role: "pokemonsAdmin",
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "pokemons" },
      actions: ["find", "insert", "update", "remove", "createIndex", "dropIndex"]
    }
  ],
  roles: []
})

// Exemplo 5: Role para agregações e estatísticas
db.createRole({
  role: "dataAnalyst",
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "" },  // Todas as coleções
      actions: ["find", "collStats", "dbStats"]
    }
  ],
  roles: []
})
```

### Criar Usuários

```javascript
// Conectar ao banco onde o usuário será criado
use pokeAPI

// Exemplo 1: Usuário básico com uma role
db.createUser({
  user: "newuser",
  pwd: "securePassword123",
  roles: [
    { role: "pokeReader", db: "pokeAPI" }
  ]
})

// Exemplo 2: Usuário com múltiplas roles
db.createUser({
  user: "poweruser",
  pwd: "strongPass456",
  roles: [
    { role: "pokeReader", db: "pokeAPI" },
    { role: "pokeWriter", db: "pokeAPI" }
  ]
})

// Exemplo 3: Usuário com role customizada
db.createUser({
  user: "customuser",
  pwd: "myPass789",
  roles: [
    { role: "customEditor", db: "pokeAPI" }
  ]
})

// Exemplo 4: Usuário temporário/teste
db.createUser({
  user: "testuser",
  pwd: "testpass123",
  roles: [
    { role: "pokemonsOnlyReader", db: "pokeAPI" }
  ]
})
```

### Gerenciar Roles de Usuários

```javascript
// Adicionar role a um usuário existente
db.grantRolesToUser("username", [
  { role: "pokeWriter", db: "pokeAPI" }
])

// Remover role de um usuário
db.revokeRolesFromUser("username", [
  { role: "pokeReader", db: "pokeAPI" }
])

// Substituir todas as roles de um usuário (CUIDADO!)
db.updateUser("username", {
  roles: [
    { role: "newRole", db: "pokeAPI" }
  ]
})
```

### Ver Informações de Roles e Usuários

```javascript
// Ver todas as roles do banco
db.getRoles()

// Ver detalhes de uma role específica
db.getRole("pokeAdmin")

// Ver role com todos os privilégios
db.getRole("pokeAdmin", { showPrivileges: true })

// Ver todas as roles incluindo as built-in
db.getRoles({ showBuiltinRoles: true })

// Ver todos os usuários
db.getUsers()

// Ver detalhes de um usuário específico
db.getUser("viewer")

// Ver privilégios do usuário atual
db.runCommand({ connectionStatus: 1, showPrivileges: true })
```

### Modificar Roles e Usuários

```javascript
// Alterar senha de usuário
db.changeUserPassword("username", "newSecurePassword")

// Atualizar privilégios de uma role
db.updateRole("customRole", {
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "pokemons" },
      actions: ["find", "insert", "update", "remove"]  // Agora com remove
    }
  ]
})

// Adicionar privilégios a uma role existente
db.grantPrivilegesToRole("customRole", [
  {
    resource: { db: "pokeAPI", collection: "trainers" },
    actions: ["find"]
  }
])

// Remover privilégios de uma role
db.revokePrivilegesFromRole("customRole", [
  {
    resource: { db: "pokeAPI", collection: "trainers" },
    actions: ["find"]
  }
])
```

### Remover Roles e Usuários

```javascript
// Remover um usuário
db.dropUser("username")

// Remover uma role
db.dropRole("customRole")

// Verificar se usuário foi removido
db.getUsers()

// Verificar se role foi removida
db.getRoles()
```

### Exemplo Completo: Criar Nova Role e Usuário

```javascript
// 1. Conectar como admin
use pokeAPI

// 2. Criar role customizada
db.createRole({
  role: "trainerManager",
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "trainers" },
      actions: ["find", "insert", "update", "remove"]
    },
    {
      resource: { db: "pokeAPI", collection: "pokemons" },
      actions: ["find"]  // Apenas leitura de pokémons
    }
  ],
  roles: []
})

// 3. Criar usuário com essa role
db.createUser({
  user: "traineradmin",
  pwd: "trainerPass123",
  roles: [
    { role: "trainerManager", db: "pokeAPI" }
  ]
})

// 4. Verificar criação
db.getRole("trainerManager", { showPrivileges: true })
db.getUser("traineradmin")

// 5. Testar conexão com novo usuário
// (em um novo terminal)
// mongosh "mongodb://traineradmin:trainerPass123@localhost:27017/pokeAPI?authSource=pokeAPI"
```

### Ver Todas as Coleções (Como Admin)

```javascript
// Admin pode ver TODAS as coleções de TODOS os bancos
use pokeAPI
show collections  // Mostra coleções do pokeAPI

use admin
show collections  // Mostra coleções do admin (system.users, system.roles, etc)

// Listar todos os bancos de dados
show dbs

// Ver coleções de sistema (usuários e roles)
use admin
db.system.users.find()
db.system.roles.find()

// Ou no banco pokeAPI
use pokeAPI
db.system.users.find()
db.system.roles.find()
```

### Ações Disponíveis para Roles

```javascript
// Ações de Leitura
"find"              // Consultar documentos
"listCollections"   // Listar coleções
"listIndexes"       // Listar índices
"collStats"         // Estatísticas de coleção
"dbStats"           // Estatísticas do banco

// Ações de Escrita
"insert"            // Inserir documentos
"update"            // Atualizar documentos
"remove"            // Remover documentos

// Ações de Gerenciamento
"createCollection"  // Criar coleções
"dropCollection"    // Remover coleções
"createIndex"       // Criar índices
"dropIndex"         // Remover índices

// Ações Administrativas (requer privilégios especiais)
"userAdmin"         // Gerenciar usuários
"dbAdmin"           // Administrar banco
"readWrite"         // Leitura e escrita completa
```

---

## Comandos de Administração

### Usuários (Comandos de Consulta)

```javascript
// NOTA: Estes são comandos de CONSULTA que o admin pode executar
// Para CRIAR usuários e roles, veja a seção "Comandos de Administração (SOMENTE ADMIN)" acima

// Mudar para banco pokeAPI
use pokeAPI

// Listar usuários
db.getUsers()

// Ver detalhes de um usuário
db.getUser("viewer")

// Ver informações de conexão atual
db.runCommand({connectionStatus: 1})

// Ver privilégios do usuário atual
db.runCommand({connectionStatus: 1, showPrivileges: true})

// Alterar senha de usuário (requer privilégios admin)
db.changeUserPassword("username", "newpassword")

// Remover usuário (requer privilégios admin)
db.dropUser("username")
```

### Roles (Comandos de Consulta)

```javascript
// NOTA: Estes são comandos de CONSULTA que qualquer usuário pode executar
// Para CRIAR roles, veja a seção "Comandos de Administração (SOMENTE ADMIN)" acima

// Listar roles
db.getRoles()

// Ver detalhes de uma role
db.getRole("pokeAdmin", {showPrivileges: true})

// Listar roles incluindo built-in
db.getRoles({showBuiltinRoles: true})
```

### Banco de Dados

```javascript
// Estatísticas do banco
db.stats()

// Versão do MongoDB
db.version()

// Informações do servidor
db.serverStatus()

// Comandos disponíveis
db.listCommands()

// Verificar conexão
db.adminCommand({ping: 1})
```

---

## Troubleshooting

### Verificar se MongoDB está Rodando

```bash
# Verificar containers
docker-compose ps

# Verificar porta
# Windows
netstat -an | findstr "27017"
# Linux/Mac
netstat -an | grep 27017

# Testar conexão
docker exec mongo-pokeapi mongosh --eval "db.version()"
```

### Logs de Erro

```bash
# Ver logs recentes
docker-compose logs --tail=100 mongo

# Buscar por erros
docker-compose logs mongo | grep -i error

# Ver logs em tempo real
docker-compose logs -f mongo
```

### Reset de Autenticação

```bash
# 1. Parar tudo
docker-compose down -v

# 2. Verificar que volume foi removido
docker volume ls | grep mongo

# 3. Iniciar novamente (scripts de init executam)
docker-compose up -d

# 4. Aguardar inicialização
# Windows
timeout /t 15
# Linux/Mac
sleep 15

# 5. Verificar usuários
docker exec -it mongo-pokeapi mongosh -u admin -p admin --eval "use pokeAPI; db.getUsers()"
```

### Problemas de Permissão

```javascript
// Verificar permissões do usuário atual
use pokeAPI
db.runCommand({connectionStatus: 1, showPrivileges: true})

// Ver roles do usuário
db.getUser("username")

// Ver privilégios da role
db.getRole("rolename", {showPrivileges: true})
```

### Limpar Dados de Teste

```javascript
// Remover documentos de teste
db.pokemons.deleteMany({name: /^(test|new|dev|hack)/i})

// Verificar quantos foram removidos
db.pokemons.countDocuments({name: /^(test|new|dev|hack)/i})
```

---

## Atalhos Úteis

### Interface Gráfica

| Ação | Atalho |
|------|--------|
| Executar comando | `Enter` no campo de comando |
| Limpar terminal | Botão "Limpar" |
| Logout | Botão "Sair" |
| Fechar aplicação | `Alt+F4` ou fechar janela |

### mongosh

| Comando | Descrição |
|---------|-----------|
| `Ctrl+C` | Cancelar operação atual |
| `Ctrl+D` ou `exit` | Sair do mongosh |
| `Ctrl+L` | Limpar tela |
| `↑` `↓` | Navegar histórico de comandos |
| `Tab` | Auto-completar |

---

## Comandos para Demonstração/Apresentação

```javascript
// ========================================
// DEMONSTRAÇÃO 1: Conectar como Admin e Ver Estrutura
// ========================================
// Conectar: mongosh -u admin -p admin --authenticationDatabase admin

// Ver todos os bancos de dados
show dbs

// Selecionar banco pokeAPI
use pokeAPI

// Ver todas as coleções (admin vê TUDO)
show collections

// ========================================
// DEMONSTRAÇÃO 2: Ver Usuários e Roles
// ========================================
// Mostrar todos os usuários e suas roles
db.getUsers()

// Mostrar todas as roles customizadas
db.getRoles({showPrivileges: false})

// Ver detalhes de uma role específica
db.getRole("pokeAdmin", {showPrivileges: true})

// ========================================
// DEMONSTRAÇÃO 3: Consultar Dados
// ========================================
// Contar Pokémons
db.pokemons.countDocuments()

// Mostrar primeiros 5 Pokémons
db.pokemons.find().limit(5)

// Buscar Pikachu
db.pokemons.findOne({name: "pikachu"})

// ========================================
// DEMONSTRAÇÃO 4: Criar Nova Role e Usuário
// ========================================
// Criar role customizada
db.createRole({
  role: "demoRole",
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "pokemons" },
      actions: ["find"]
    }
  ],
  roles: []
})

// Criar usuário com essa role
db.createUser({
  user: "demouser",
  pwd: "demo123",
  roles: [
    { role: "demoRole", db: "pokeAPI" }
  ]
})

// Verificar criação
db.getUser("demouser")

// ========================================
// DEMONSTRAÇÃO 5: Testar Permissões
// ========================================
// (Em novo terminal, conectar como viewer)
// mongosh -u viewer -p viewPass123 --authenticationDatabase pokeAPI pokeAPI

// Como viewer, pode consultar
db.pokemons.findOne({name: "bulbasaur"})  // ✓ Funciona

// Mas não pode inserir
db.pokemons.insertOne({name: "test"})  // ✗ Erro de permissão

// ========================================
// DEMONSTRAÇÃO 6: Ver Coleções de Sistema
// ========================================
// (Como admin)
use admin
show collections  // Mostra system.users, system.roles, etc

// Ver usuários de sistema
use pokeAPI
db.system.users.find()

// Ver roles de sistema
db.system.roles.find()

// ========================================
// DEMONSTRAÇÃO 7: Verificar Privilégios
// ========================================
// Ver privilégios do usuário atual
db.runCommand({connectionStatus: 1, showPrivileges: true})
```

---

## Quick Reference

```bash
# Início rápido (ordem recomendada)
docker-compose up -d
docker-compose logs -f mongo  # Esperar "init process complete"
python mongo_client.py

# Reset rápido
docker-compose down -v && docker-compose up -d

# Teste rápido de conexão
docker exec -it mongo-pokeapi mongosh -u admin -p admin --eval "db.version()"

# Ver usuários
docker exec -it mongo-pokeapi mongosh -u admin -p admin --eval "use pokeAPI; db.getUsers()"

# Acessar Mongo Express
# http://localhost:8081 (admin/admin)
```

---

**💡 Dica:** Adicione este arquivo aos favoritos do seu editor para acesso rápido durante o desenvolvimento!

**📚 Ver também:**
- [README.md](README.md) - Documentação completa
- [TESTES.md](TESTES.md) - Guia de testes detalhado
- [ESPECIFICACAO.md](ESPECIFICACAO.md) - Especificação do projeto
