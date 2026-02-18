# 🚀 Referência Rápida de Comandos

Guia com comandos mais utilizados para trabalhar com o projeto MongoDB Authentication.

## 📑 Índice
- [Comandos do PERMISSION.md](#comandos-do-permissionmd)
- [Setup Inicial](#setup-inicial)
- [Docker Commands](#docker-commands)
- [Python Application](#python-application)
- [MongoDB Shell (mongosh)](#mongodb-shell-mongosh)
- [Comandos MongoDB](#comandos-mongodb)
- [Troubleshooting](#troubleshooting)

---

## Comandos do PERMISSION.md

Exemplos práticos de todos os comandos permitidos pelo sistema de permissões:

### A. Create (Criação)

```javascript
db.pokemons.insertOne({name: "PokemonTesteAdd", type: "electric", level:25})
db.pokemons.insertMany([{name: "bulbasaur", type: "grass"}, {name:"charmander", type: "fire"}])
```

### B. Read (Leitura)

```javascript
db.pokemons.find({type: "electric"})
db.pokemons.findOne({name: "pikachu"})
db.pokemons.countDocuments({type: "fire"})
db.pokemons.distinct("type")
```

### C. Update (Atualização)

```javascript
db.pokemons.updateOne({name: "pikachu"}, {$set: {level: 50}})
db.pokemons.updateMany({type: "fire"}, {$set: {category: "fire-type"}})
db.pokemons.replaceOne({name: "pikachu"}, {name: "pikachu", type: "electric", level: 100, evolved: true})
```

### D. Delete (Remoção)

```javascript
db.pokemons.deleteOne({name: "test-pokemon"})
db.pokemons.deleteMany({level: {$lt: 5}})
db.pokemons.findOneAndDelete({name: "temporary"})
```

### E. Admin (Administração)

```javascript
db.createCollection("trainers")
db.trainers.drop()
```

### F. Geral (Comandos Gerais)

```javascript
show collections
use pokeAPI
help
exit
```

### G. Exemplo Completo: Criar Role e Usuário

**⚠️ IMPORTANTE: Estes comandos devem ser executados como admin (admin/admin)**

```javascript
// 1. Conectar ao banco de dados
use pokeAPI

// 2. Criar a role roleTest com permissões personalizadas
db.roles.insertOne({roleName: "roleTest", admin: false, permissions: [{tableName:"pokemons", read: true, create: true, delete: false, update: true},{tableName:"users", read: true, create: true, delete: false, update: true}]})

// 3. Criar o usuário usuarioTeste com senha 123 e role roleTest
db.users.insertOne({username: "usuarioTeste", password: "123", roles: ["roleTest"], active: true})

// 4. Verificar criação da role
db.roles.findOne({roleName: "roleTest"})

// 5. Verificar criação do usuário
db.users.findOne({username: "usuarioTeste"})
```

**Resultado esperado:**
- Role `roleTest` criada com permissões de leitura, criação e atualização na coleção `pokemons`
- Usuário `usuarioTeste` criado com acesso via role `roleTest`
- Login disponível: usuarioTeste/123
