# 🚀 MongoDB - Sistema de Autenticação e Autorização Customizado

Sistema completo de controle de acesso baseado em permissões granulares para MongoDB, com inicialização automática de dados e interface gráfica desktop.

## 📑 Índice

- [Descrição da Arquitetura](#-descrição-da-arquitetura)
- [Fluxo de Inicialização](#-fluxo-de-inicialização)
- [Ingestão Automática de Dados](#-ingestão-automática-de-dados)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Uso da Aplicação](#-uso-da-aplicação)
- [Testes de Autenticação e Autorização](#-testes-de-autenticação-e-autorização)
- [Reset do Ambiente](#-reset-do-ambiente)
- [Troubleshooting](#-troubleshooting)

---

## 🏗 Descrição da Arquitetura

### Visão Geral

O sistema implementa um modelo de controle de acesso customizado que opera **sobre** a infraestrutura nativa do MongoDB, proporcionando permissões granulares por coleção e operação.

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APLICAÇÃO                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         mongo_client.py (Interface Gráfica)           │  │
│  │  • Login customizado                                  │  │
│  │  • Validação de permissões                            │  │
│  │  • Terminal interativo MongoDB                        │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Autenticação customizada
                       │ (db.users / db.roles)
┌──────────────────────▼──────────────────────────────────────┐
│              CAMADA DE CONTROLE DE ACESSO                    │
│  ┌────────────────────┐      ┌──────────────────────────┐   │
│  │  Collection: users │      │  Collection: roles       │   │
│  │  ┌──────────────┐  │      │  ┌────────────────────┐  │   │
│  │  │ username     │  │      │  │ roleName           │  │   │
│  │  │ password     │  │      │  │ admin: boolean     │  │   │
│  │  │ roles: []    │  │      │  │ permissions: [     │  │   │
│  │  │ active       │  │      │  │   {tableName,      │  │   │
│  │  └──────────────┘  │      │  │    read, create,   │  │   │
│  └────────────────────┘      │  │    delete, update} │  │   │
│                               │  │ ]                  │  │   │
│                               │  └────────────────────┘  │   │
│                               └──────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Infraestrutura
                       │ (admin/admin)
┌──────────────────────▼──────────────────────────────────────┐
│                  CAMADA DE INFRAESTRUTURA                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           MongoDB Server (Container Docker)           │  │
│  │  • Autenticação nativa habilitada (--auth)            │  │
│  │  • Usuário root: admin/admin                          │  │
│  │  • Banco: pokeAPI                                     │  │
│  │  • Collections: pokemons, users, roles                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principais

#### 1. **MongoDB Server (Container Docker)**
- **Imagem**: `mongo:latest`
- **Autenticação**: Habilitada via `MONGO_INITDB_ROOT_USERNAME` e `MONGO_INITDB_ROOT_PASSWORD`
- **Porta**: 27017
- **Banco Principal**: `pokeAPI`
- **Volume**: `mongo-data` para persistência

#### 2. **Sistema de Permissões Customizado**

**Coleção `roles`:**
```json
{
  "roleName": "pokeReader",
  "admin": false,
  "permissions": [
    {
      "tableName": "pokemons",
      "read": true,
      "create": false,
      "delete": false,
      "update": false
    }
  ]
}
```

**Coleção `users`:**
```json
{
  "username": "viewer",
  "password": "viewPass123",
  "roles": ["pokeReader"],
  "active": true
}
```

#### 3. **Aplicação Cliente (mongo_client.py)**
- **Framework GUI**: CustomTkinter (interface moderna e responsiva)
- **Driver**: PyMongo
- **Funcionalidades**:
  - Login baseado em coleção `users`
  - Carregamento dinâmico de roles
  - Validação de permissões antes de cada operação
  - Terminal interativo com syntax highlighting
  - Comando `help` integrado

### Princípios de Autorização

O sistema opera sob o modelo de **Privilégio Mínimo** e **True Override**:

1. **Default Deny**: Nenhum usuário possui permissão inerente
2. **True Override**: Se um usuário possui múltiplas roles, `true` sempre prevalece sobre `false`
3. **Admin Override**: Usuários com `admin: true` têm acesso pleno a todas as coleções
4. **Restrição de Metadados**: Apenas admins podem acessar coleções `users` e `roles`
5. **Expurgo em Drop**: Ao deletar uma coleção, suas permissões são removidas de todas as roles

### Fluxo de Autenticação

```
┌─────────────┐
│   Usuário   │
│   Informa   │
│ user/senha  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│ Aplicação conecta como admin    │
│ (infraestrutura)                │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Busca em db.users:              │
│ {username: "viewer"}            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Valida senha                    │
│ (plaintext em dev, bcrypt prod) │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Carrega roles do usuário:       │
│ db.roles.find({roleName: {$in}})│
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Armazena em memória:            │
│ - user_data                     │
│ - user_roles_data               │
│ - is_admin (cache)              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Interface principal liberada    │
└─────────────────────────────────┘
```

---

## 🔄 Fluxo de Inicialização

### 1. Inicialização do MongoDB via Docker

Quando o container é criado pela primeira vez, o MongoDB executa automaticamente todos os scripts `.js` presentes no diretório `init-db/`, montado em `/docker-entrypoint-initdb.d/`.

```yaml
# docker-compose.yml
volumes:
  - ./init-db:/docker-entrypoint-initdb.d:ro
```

### 2. Ordem de Execução dos Scripts

Os scripts são executados em **ordem alfabética**:

```
init-db/
├── 01-create-roles.js      → Cria sistema de roles customizadas
├── 02-create-users.js      → Cria usuários com roles atribuídas
└── 03-create-collections.js → Cria coleções e insere dados iniciais
```

### 3. Detalhamento de Cada Script

#### **01-create-roles.js**
```javascript
// Conecta ao banco pokeAPI
db = db.getSiblingDB('pokeAPI');

// Cria coleção de roles
db.createCollection("roles");

// Insere role admin
db.roles.insertOne({
  roleName: "admin",
  admin: true,
  permissions: []  // Admin tem acesso pleno
});

// Insere role pokeReader (somente leitura)
db.roles.insertOne({
  roleName: "pokeReader",
  admin: false,
  permissions: [
    {
      tableName: "pokemons",
      read: true,
      create: false,
      delete: false,
      update: false
    }
  ]
});

// Cria índice único em roleName
db.roles.createIndex({ roleName: 1 }, { unique: true });
```

**Resultado:**
- ✅ 2 roles criadas: `admin` e `pokeReader`
- ✅ Índice único em `roleName` para evitar duplicatas

#### **02-create-users.js**
```javascript
db = db.getSiblingDB('pokeAPI');

// Cria coleção de usuários
db.createCollection("users");

// Usuário administrador
db.users.insertOne({
  username: "admin",
  password: "admin",
  roles: ["admin"],
  active: true
});

// Usuário com somente leitura
db.users.insertOne({
  username: "viewer",
  password: "viewPass123",
  roles: ["pokeReader"],
  active: true
});

// Índice único em username
db.users.createIndex({ username: 1 }, { unique: true });
```

**Resultado:**
- ✅ 2 usuários criados: `admin` e `viewer`
- ✅ Índice único em `username`

#### **03-create-collections.js**
```javascript
db = db.getSiblingDB('pokeAPI');

// Criar coleção pokemons
db.createCollection("pokemons");

// Inserir dados de exemplo
db.pokemons.insertMany([
  {
    name: "pikachu",
    type: "electric",
    level: 25,
    moves: ["thunder", "quick-attack"]
  },
  {
    name: "charizard",
    type: "fire",
    level: 36,
    moves: ["flamethrower", "fly"]
  }
  // ... mais dados
]);
```

**Resultado:**
- ✅ Coleção `pokemons` criada
- ✅ Dados iniciais inseridos

### 4. Diagrama de Sequência da Inicialização

```
docker-compose up
       │
       ▼
┌─────────────────────────────────────────┐
│ MongoDB Container Startup               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Cria usuário root (admin/admin)         │
│ via MONGO_INITDB_ROOT_USERNAME/PASSWORD │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Executa scripts em init-db/ em ordem:  │
│ 01-create-roles.js                      │
│ 02-create-users.js                      │
│ 03-create-collections.js                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ MongoDB pronto para conexões            │
│ - Autenticação habilitada               │
│ - 2 roles criadas                       │
│ - 2 usuários criados                    │
│ - Coleção pokemons com dados            │
└─────────────────────────────────────────┘
```

---

## 📥 Ingestão Automática de Dados

### Mecanismo do Docker

O MongoDB oficial (`mongo:latest`) possui suporte nativo para inicialização via diretório especial:

```
/docker-entrypoint-initdb.d/
```

**Como funciona:**
1. Na **primeira inicialização** (quando o volume `mongo-data` está vazio)
2. O MongoDB executa **todos os arquivos** `.sh` e `.js` presentes
3. Scripts `.js` são executados via `mongosh` com usuário root
4. Ordem de execução: **alfabética**
5. Após execução, o MongoDB cria um arquivo de controle para **não reexecutar** nas próximas vezes

### Dados Inseridos

**Coleção `pokemons` (exemplo):**
```json
[
  {
    "_id": ObjectId("..."),
    "name": "pikachu",
    "type": "electric",
    "level": 25,
    "moves": ["thunder", "quick-attack"],
    "stats": {
      "hp": 35,
      "attack": 55,
      "defense": 40
    }
  },
  {
    "_id": ObjectId("..."),
    "name": "charizard",
    "type": "fire",
    "level": 36,
    "moves": ["flamethrower", "fly", "slash"],
    "stats": {
      "hp": 78,
      "attack": 84,
      "defense": 78
    }
  }
]
```

**Collections criadas automaticamente:**
- `roles` - Sistema de permissões
- `users` - Usuários da aplicação
- `pokemons` - Dados de Pokémons

### Verificação da Ingestão

**Via mongosh:**
```bash
# Conectar como admin
docker exec -it mongo-pokeapi mongosh -u admin -p admin --authenticationDatabase admin

# Verificar banco
use pokeAPI

# Listar coleções
show collections
# Output: pokemons, roles, users

# Contar documentos
db.pokemons.countDocuments()
# Output: (número de pokémons inseridos)

db.roles.countDocuments()
# Output: 2

db.users.countDocuments()
# Output: 2
```

---

## 💻 Instalação e Configuração

### Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Python 3.11+** (para executar aplicação localmente)
- **Git** (para clonar o repositório)

### Instalação Rápida

**Windows (PowerShell):**
```powershell
# 1. Clonar repositório
git clone https://github.com/Muril0S4lvador/banco_de_Dados_II.git
cd mongo

# 2. Subir ambiente completo
docker-compose up -d

# 3. Aguardar inicialização (15-20 segundos)
Start-Sleep -Seconds 20

# 4. Verificar logs
docker-compose logs mongo

# 5. Testar conexão
docker exec -it mongo-pokeapi mongosh -u admin -p admin --eval "db.version()"
```

**Linux/Mac:**
```bash
# 1. Clonar repositório
git clone <seu-repositorio>
cd mongo

# 2. Subir ambiente
docker-compose up -d

# 3. Aguardar inicialização
sleep 20

# 4. Verificar status
docker-compose ps

# 5. Ver logs
docker-compose logs -f mongo
```

### Verificar Inicialização Bem-Sucedida

```bash
# Conectar ao MongoDB
docker exec -it mongo-pokeapi mongosh -u admin -p admin --authenticationDatabase admin

# No mongosh:
use pokeAPI

# Verificar roles criadas
db.roles.find().pretty()
# Deve mostrar: admin e pokeReader

# Verificar usuários criados
db.users.find({}, {password: 0}).pretty()
# Deve mostrar: admin e viewer

# Verificar dados inseridos
db.pokemons.countDocuments()
# Deve retornar número > 0
```

### Executar Aplicação GUI

**Opção 1: Localmente (Recomendado)**
```powershell
# Instalar dependências
pip install -r requirements.txt

# Executar aplicação
python mongo_client.py
```

**Opção 2: Via Docker (Requer X11)**
```bash
# Ver instruções em DOCKER_GUI.md
docker-compose --profile client up
```

---

## 🎮 Uso da Aplicação

### Tela de Login

**Credenciais disponíveis:**
- **Admin**: `admin` / `admin` (acesso total)
- **Viewer**: `viewer` / `viewPass123` (somente leitura)

### Comandos Disponíveis

**Ver todos os comandos:**
```javascript
help
```

**Exemplo de comandos:**
```javascript
// Listar coleções
show collections

// Buscar todos os pokémons
db.pokemons.find()

// Buscar pokémon específico
db.pokemons.findOne({name: "pikachu"})

// Inserir novo pokémon (requer permissão create)
db.pokemons.insertOne({name: "bulbasaur", type: "grass", level: 5})

// Atualizar pokémon (requer permissão update)
db.pokemons.updateOne({name: "pikachu"}, {$set: {level: 50}})

// Deletar pokémon (requer permissão delete)
db.pokemons.deleteOne({name: "test"})

// Criar coleção (requer admin)
db.createCollection("trainers")

// Remover coleção (requer admin)
db.trainers.drop()
```

---

## 🧪 Testes de Autenticação e Autorização

### Teste 1: Login com Usuário Admin

**Objetivo**: Verificar acesso total ao sistema

**Passos:**
```
1. Executar: python mongo_client.py
2. Login: admin / admin
3. Verificar header mostra "[ADMIN]"
4. Digitar: show collections
   ✅ Deve mostrar: pokemons, roles, users

5. Digitar: db.users.find()
   ✅ Deve listar todos os usuários
   
6. Digitar: db.roles.find()
   ✅ Deve listar todas as roles
```

**Resultado Esperado:**
```
✓ Login bem-sucedido
✓ Acesso a todas as coleções
✓ Permissão para operações administrativas
```

---

### Teste 2: Login com Usuário Viewer (Somente Leitura)

**Objetivo**: Verificar restrições de permissão

**Passos:**
```
1. Logout do admin
2. Login: viewer / viewPass123
3. Verificar header mostra "Roles: pokeReader"
4. Digitar: show collections
   ✅ Deve mostrar apenas: pokemons

5. Digitar: db.pokemons.find()
   ✅ Deve retornar lista de pokémons
   
6. Digitar: db.pokemons.insertOne({name: "test", type: "fire"})
   ❌ PERMISSÃO NEGADA: Você não tem permissão 'create' na coleção 'pokemons'
   
7. Digitar: db.users.find()
   ❌ PERMISSÃO NEGADA: Você não tem permissão 'read' na coleção 'users'
```

**Resultado Esperado:**
```
✓ Login bem-sucedido
✓ Acesso apenas à coleção pokemons
✓ Operações de leitura permitidas
✗ Operações de escrita bloqueadas
✗ Acesso a users/roles bloqueado
```

---

### Teste 3: Criar Role e Usuário Customizados

**Objetivo**: Testar criação de novas roles e usuários

**Passos (como admin):**
```javascript
// 1. Criar nova role
db.roles.insertOne({
  roleName: "pokeWriter",
  admin: false,
  permissions: [
    {
      tableName: "pokemons",
      read: true,
      create: true,
      delete: false,
      update: true
    }
  ]
})
// ✅ Role criada com sucesso

// 2. Criar novo usuário
db.users.insertOne({
  username: "writer",
  password: "writerPass123",
  roles: ["pokeWriter"],
  active: true
})
// ✅ Usuário criado com sucesso

// 3. Verificar criação
db.roles.findOne({roleName: "pokeWriter"})
db.users.findOne({username: "writer"})
```

**Teste do novo usuário:**
```
1. Logout do admin
2. Login: writer / writerPass123
3. Testar comandos:

db.pokemons.find()
✅ Permitido (read: true)

db.pokemons.insertOne({name: "squirtle", type: "water"})
✅ Permitido (create: true)

db.pokemons.updateOne({name: "squirtle"}, {$set: {level: 10}})
✅ Permitido (update: true)

db.pokemons.deleteOne({name: "squirtle"})
❌ PERMISSÃO NEGADA (delete: false)
```

---

### Teste 4: True Override (Múltiplas Roles)

**Objetivo**: Verificar comportamento de True Override

**Cenário:**
```javascript
// Usuário com 2 roles
db.users.insertOne({
  username: "multi",
  password: "multi123",
  roles: ["restrictedReader", "pokeWriter"],
  active: true
})

// restrictedReader: read=true, create=false, update=false, delete=false
// pokeWriter: read=true, create=true, update=true, delete=false
```

**Comportamento esperado:**
```
Permissões finais (True Override):
- read: true (ambas têm true)
- create: true (pokeWriter tem true)
- update: true (pokeWriter tem true)
- delete: false (ambas têm false)
```

**Teste:**
```javascript
db.pokemons.insertOne({name: "test"})
✅ Permitido (pelo menos uma role tem create: true)

db.pokemons.updateOne({name: "test"}, {$set: {level: 1}})
✅ Permitido (True Override)

db.pokemons.deleteOne({name: "test"})
❌ PERMISSÃO NEGADA (nenhuma role tem delete: true)
```

---

### Teste 5: Expurgo em Drop

**Objetivo**: Verificar remoção automática de permissões ao deletar coleção

**Passos (como admin):**
```javascript
// 1. Criar coleção de teste
db.createCollection("testCollection")

// 2. Adicionar permissão em uma role
db.roles.updateOne(
  {roleName: "pokeReader"},
  {$push: {permissions: {
    tableName: "testCollection",
    read: true,
    create: false,
    delete: false,
    update: false
  }}}
)

// 3. Verificar permissão adicionada
db.roles.findOne({roleName: "pokeReader"})
// ✅ permissions agora contém testCollection

// 4. Deletar a coleção
db.testCollection.drop()

// 5. Verificar permissão removida automaticamente
db.roles.findOne({roleName: "pokeReader"})
// ✅ permissions NÃO contém mais testCollection (Expurgo automático)
```

**Resultado:**
```
✓ Coleção deletada
✓ Permissões removidas automaticamente de TODAS as roles
✓ Sistema mantém integridade (sem permissões órfãs)
```

---

### Teste 6: Via MongoDB Shell (mongosh)

**Teste direto no MongoDB:**

```bash
# Terminal 1: Conectar como admin
docker exec -it mongo-pokeapi mongosh -u admin -p admin --authenticationDatabase admin

use pokeAPI

# Listar todas as coleções (admin pode ver tudo)
show collections
# Output: pokemons, roles, users

# Ver roles
db.roles.find().pretty()

# Ver usuários (sem senhas)
db.users.find({}, {password: 0}).pretty()

# Buscar pokémons
db.pokemons.find().limit(3).pretty()

# Estatísticas
db.pokemons.countDocuments()
```

---

## 🔄 Reset do Ambiente

### Reset Completo (Limpar Tudo)

**Windows (PowerShell):**
```powershell
# 1. Parar e remover containers + volumes
docker-compose down -v

# 2. Verificar que volumes foram removidos
docker volume ls | Select-String "mongo"

# 3. Subir novamente (scripts de init executam)
docker-compose up -d

# 4. Aguardar inicialização
Start-Sleep -Seconds 20

# 5. Verificar logs
docker-compose logs mongo | Select-String "init process complete"
```

**Linux/Mac:**
```bash
# Reset completo
docker-compose down -v

# Verificar volumes removidos
docker volume ls | grep mongo

# Subir novamente
docker-compose up -d

# Aguardar
sleep 20

# Verificar
docker-compose logs mongo | grep "init"
```

### Reset Parcial (Manter Volumes)

```bash
# Apenas reiniciar containers (mantém dados)
docker-compose restart

# Ou parar e iniciar
docker-compose stop
docker-compose start
```

### Verificar Reset Bem-Sucedido

```bash
docker exec -it mongo-pokeapi mongosh -u admin -p admin --authenticationDatabase admin

use pokeAPI

# Verificar coleções
show collections

# Contar documentos
db.roles.countDocuments()   # Deve ser 2
db.users.countDocuments()   # Deve ser 2
db.pokemons.countDocuments() # Deve ter dados iniciais
```

### Remover Apenas Dados de Aplicação (Preservar Schema)

```javascript
// Como admin
use pokeAPI

// Limpar pokemons mas manter users/roles
db.pokemons.deleteMany({})

// Reinserir dados iniciais
db.pokemons.insertMany([
  {name: "pikachu", type: "electric", level: 25},
  {name: "charizard", type: "fire", level: 36}
])
```

---

## 🐛 Troubleshooting

### Problema: "não consigo criar coleção"

**Sintoma:**
```
❌ PERMISSÃO NEGADA: Comandos administrativos de banco requerem permissão admin
```

**Causa:** Usuário não possui flag `admin: true`

**Solução:**
```javascript
// Como admin, verificar role do usuário
db.users.findOne({username: "seu-usuario"})

// Se necessário, adicionar role admin
db.users.updateOne(
  {username: "seu-usuario"},
  {$push: {roles: "admin"}}
)
```

---

### Problema: "Erro ao executar operação: document must be an instance of dict"

**Sintoma:**
```javascript
db.users.insertOne({..., createdAt: new Date()})
❌ Erro: document must be an instance of dict
```

**Causa:** `new Date()` é JavaScript, não funciona no Python client

**Solução:**
```javascript
// Remover new Date()
db.users.insertOne({
  username: "test",
  password: "123",
  roles: ["pokeReader"],
  active: true
})
```

---

### Problema: "Connection refused" ao acessar MongoDB

**Sintoma:**
```
❌ Não foi possível conectar ao MongoDB
```

**Verificações:**
```powershell
# 1. Container está rodando?
docker-compose ps

# 2. Porta 27017 está aberta?
netstat -an | Select-String "27017"

# 3. Logs mostram erros?
docker-compose logs mongo

# 4. Healthcheck está OK?
docker inspect mongo-pokeapi | Select-String "Health"
```

**Solução:**
```powershell
# Restart completo
docker-compose restart mongo

# Ou rebuild
docker-compose down
docker-compose up -d
```

---

### Problema: Scripts de inicialização não executaram

**Sintoma:** Coleções `users` e `roles` não existem

**Causa:** Volume já existia (scripts só rodam na primeira vez)

**Solução:**
```powershell
# ATENÇÃO: Isso apaga TODOS os dados!
docker-compose down -v
docker-compose up -d
```

---

### Problema: "duplicate key error" ao criar usuário/role

**Sintoma:**
```
E11000 duplicate key error collection: pokeAPI.users index: username_1
```

**Causa:** Usuário/role já existe

**Solução:**
```javascript
// Verificar se existe
db.users.findOne({username: "nome"})

// Se existir, atualizar ao invés de inserir
db.users.updateOne(
  {username: "nome"},
  {$set: {password: "nova-senha"}},
  {upsert: true}
)
```

---


## 📚 Referências

### Documentação Oficial
- [MongoDB Authentication](https://docs.mongodb.com/manual/core/authentication/)
- [MongoDB Authorization](https://docs.mongodb.com/manual/core/authorization/)
- [Docker MongoDB Image](https://hub.docker.com/_/mongo)

### Arquivos do Projeto
- [PERMISSION.md](PERMISSION.md) - Especificação completa do sistema de permissões
- [COMANDOS.md](COMANDOS.md) - Referência rápida de comandos

---

## 👥 Usuários Padrão

| Usuário | Senha | Roles | Permissões |
|---------|-------|-------|------------|
| `admin` | `admin` | admin | Acesso total ao sistema |
| `viewer` | `viewPass123` | pokeReader | Somente leitura em pokemons |

---

## 🔐 Notas de Segurança

⚠️ **IMPORTANTE**: Este projeto usa senhas em texto plano para fins de **demonstração e desenvolvimento**.

---

## 📄 Licença

Este projeto é fornecido como material educacional para o curso de Banco de Dados.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com 💙 para aprendizado de MongoDB e Sistemas de Permissões**
