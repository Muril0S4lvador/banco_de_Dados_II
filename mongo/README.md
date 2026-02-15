# ========================================
# MongoDB Authentication & Authorization
# Sistema de Controle de Acesso com Roles
# ========================================

## 📋 Visão Geral

Este projeto implementa um sistema completo de **autenticação**, **autorização** e **ingestão automática de dados** utilizando os mecanismos nativos do MongoDB em ambiente Docker. O projeto simula um ambiente realista de banco de dados com controle de acesso granular baseado em roles (papéis), similar aos SGBDs relacionais e serviços gerenciados como MongoDB Atlas.

### 🎯 Objetivos do Projeto

- ✅ Implementar autenticação nativa do MongoDB com múltiplos usuários
- ✅ Criar roles customizados com permissões granulares
- ✅ Inicialização automática de dados via Docker
- ✅ Interface gráfica para validação de permissões em tempo real
- ✅ Demonstrar operações permitidas e negadas por role

### 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Compose                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────────┐  │
│  │   MongoDB Container  │      │ Mongo Express (UI Web)   │  │
│  │   - Port: 27017      │◄────►│   - Port: 8081           │  │
│  │   - Auth Enabled     │      │   - Admin Interface      │  │
│  └──────────────────────┘      └──────────────────────────┘  │
│            │                                                   │
│            │ Volume Mount                                      │
│            ▼                                                   │
│  ┌──────────────────────┐                                     │
│  │  docker-entrypoint-  │                                     │
│  │     initdb.d/        │                                     │
│  │                      │                                     │
│  │ 01-create-roles.js   │ ◄─── Executado na primeira         │
│  │ 02-create-users.js   │      inicialização apenas          │
│  │ 03-create-collections│                                     │
│  │         .js          │                                     │
│  └──────────────────────┘                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────┐
         │   Python Client Application        │
         │   (CustomTkinter GUI)              │
         │                                    │
         │   - Login com usuários/roles      │
         │   - Terminal MongoDB interativo    │
         │   - Validação de permissões       │
         └────────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Docker e Docker Compose instalados
- Python 3.8+ (para a interface gráfica)
- Git (para clonar o repositório)

### 1. Iniciar o MongoDB

```bash
# Subir os containers
docker-compose up -d

# Verificar logs da inicialização
docker-compose logs -f mongo
```

**Importante:** Os scripts de inicialização (`init-db/*.js`) são executados **apenas na primeira vez** que o container é criado. Para reinicializar:

```bash
# Parar e remover containers com volumes
docker-compose down -v

# Subir novamente (vai executar os scripts)
docker-compose up -d
```

### 2. Instalar Dependências Python

```bash
# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Executar a Interface Gráfica

```bash
python mongo_client.py
```

## 👥 Usuários e Permissões

### Usuário Root (Administrador do Sistema)

| Usuário | Senha | Role | Descrição |
|---------|-------|------|-----------|
| `admin` | `admin` | `root` | ⚠️ **Administrador root** - TODAS as permissões (gerenciar usuários, roles, bancos) |

### Usuários da Aplicação

| Usuário | Senha | Role(s) | Permissões |
|---------|-------|---------|------------|
| `viewer` | `viewPass123` | `pokeReader` | Somente leitura em todas as coleções |
| `dataEntry` | `entryPass123` | `pokeWriter` | Leitura, inserção e atualização (sem delete) |
| `analyst` | `analystPass123` | `pokeAnalyst` | Leitura e estatísticas avançadas |
| `restrictedUser` | `restrictPass123` | `pokemonsOnlyReader` | Leitura APENAS na coleção `pokemons` |

> **⚠️ IMPORTANTE:** Apenas o usuário `admin` pode criar/gerenciar roles e usuários.

### Roles Customizados

#### 1. **pokeAdmin** - Administrador Completo
```javascript
{
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "" },
      actions: [
        "find", "insert", "update", "remove",
        "createCollection", "dropCollection",
        "createIndex", "dropIndex",
        "collStats", "dbStats"
      ]
    }
  ]
}
```

#### 2. **pokeReader** - Leitor
```javascript
{
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "" },
      actions: ["find", "collStats"]
    }
  ]
}
```

#### 3. **pokeWriter** - Escritor (sem delete)
```javascript
{
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "" },
      actions: ["find", "insert", "update", "collStats"]
    }
  ]
}
```

#### 4. **pokeAnalyst** - Analista
```javascript
{
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "" },
      actions: ["find", "collStats", "dbStats", "indexStats"]
    }
  ]
}
```

#### 5. **pokemonsOnlyReader** - Leitor Restrito
```javascript
{
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "pokemons" },
      actions: ["find"]
    }
  ]
}
```

## 🧪 Testes e Validação

### Teste 1: Login e Acesso Básico

#### Teste com Usuário Admin (Sucesso Esperado)
```bash
# Na interface gráfica:
Usuário: admin
Senha: admin

# No terminal MongoDB:
> db.pokemons.find().limit(2)
✓ Resultado: 2 documentos retornados

> db.pokemons.insertOne({"name": "test", "type": "test"})
✓ Resultado: Documento inserido com sucesso

> show collections
✓ Resultado: Mostra TODAS as coleções (incluindo system.users, system.roles)
```

#### Teste com Usuário Viewer (Negado para Insert)
```bash
# Na interface gráfica:
Usuário: viewer
Senha: viewPass123

# No terminal MongoDB:
> db.pokemons.find().limit(2)
✓ Resultado: 2 documentos retornados (PERMITIDO)

> db.pokemons.insertOne({"name": "test", "type": "test"})
🚫 ACESSO NEGADO! Você não tem permissão para 'insert' na coleção 'pokemons'.
```

### Teste 2: Acesso Restrito a Coleções Específicas

```bash
# Login como restrictedUser
Usuário: restrictedUser
Senha: restrictPass123

# Listar coleções disponíveis
> show collections
📁 Coleções com permissão de leitura (1):
  - pokemons (1010 documentos)

# Tentar acessar outra coleção (se existir)
> db.outraColecao.find()
🚫 ACESSO NEGADO!
```

### Teste 3: Operações de Escrita (Writer vs Reader)

```bash
# Login como dataEntry (Writer)
Usuário: dataEntry
Senha: entryPass123

> db.pokemons.updateOne({"name": "pikachu"}, {"$set": {"level": 50}})
✓ Resultado: 1 documento(s) atualizado(s)

> db.pokemons.deleteOne({"name": "test"})
🚫 ACESSO NEGADO! Você não tem permissão para 'remove'
```

### Teste 4: Verificação via mongosh (linha de comando)

```bash
# Conectar via mongosh como diferentes usuários
mongosh "mongodb://viewer:viewPass123@localhost:27017/pokeAPI?authSource=pokeAPI"

# Dentro do mongosh
pokeAPI> db.pokemons.countDocuments()
1010  // ✓ Permitido

pokeAPI> db.pokemons.insertOne({name: "hack"})
MongoServerError: not authorized  // ✓ Bloqueado corretamente
```

## 📊 Estrutura do Banco de Dados

### Database: pokeAPI

#### Coleção: pokemons
Contém dados completos de Pokémons da PokéAPI com os seguintes campos:
- `name`: Nome do Pokémon
- `abilities`: Array de habilidades
- `game_indices`: Jogos em que aparece
- `height`: Altura
- `weight`: Peso
- `moves`: Array de movimentos
- `types`: Array de tipos
- `stats`: Estatísticas base
- E muitos outros campos...

**Total de documentos:** ~1010 Pokémons

## 🔧 Comandos Úteis

### Docker

```bash
# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f mongo

# Parar containers
docker-compose down

# Resetar completamente (remove volumes)
docker-compose down -v

# Verificar status
docker-compose ps

# Entrar no container MongoDB
docker exec -it mongo-pokeapi mongosh -u admin -p admin --authenticationDatabase admin
```

### MongoDB Shell (mongosh)

```bash
# Conectar como admin root
mongosh "mongodb://admin:admin@localhost:27017/?authSource=admin"

# Conectar como usuário da aplicação (exemplo: viewer)
mongosh "mongodb://viewer:viewPass123@localhost:27017/pokeAPI?authSource=pokeAPI"

# Verificar usuários
use pokeAPI
db.getUsers()

# Verificar roles
db.getRoles({showPrivileges: true})

# Verificar permissões do usuário atual
db.runCommand({connectionStatus: 1, showPrivileges: true})
```

### Python Client

```bash
# Executar interface gráfica
python mongo_client.py

# Com ambiente virtual
venv\Scripts\activate  # Windows
python mongo_client.py
```

## 🌐 Acessar Mongo Express (Interface Web)

O Mongo Express é uma interface web para gerenciar o MongoDB:

- **URL:** http://localhost:8081
- **Usuário:** admin
- **Senha:** admin

⚠️ **Nota:** O Mongo Express usa o usuário root, então tem acesso completo ao banco.

## 📁 Estrutura do Projeto

```
project-root/
├── docker-compose.yml          # Configuração do Docker
├── init-db/                    # Scripts de inicialização
│   ├── 01-create-roles.js     # Criação de roles customizados
│   ├── 02-create-users.js     # Criação de usuários
│   └── 03-create-collections.js  # Criação de coleções e dados
├── mongo_client.py            # Interface gráfica Python
├── requirements.txt           # Dependências Python
├── .env.example              # Exemplo de variáveis de ambiente
├── README.md                 # Esta documentação
├── ESPECIFICACAO.md          # Especificação do projeto
└── AGENT.md                  # Plano de ação
```

## 🔐 Segurança

### ⚠️ IMPORTANTE - Uso em Produção

Este projeto usa credenciais hardcoded para fins **educacionais** e de **demonstração**. Para uso em produção:

1. **Use variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com credenciais fortes
   ```

2. **Gere senhas fortes:**
   ```bash
   # Use geradores de senha
   openssl rand -base64 32
   ```

3. **Nunca commite credenciais:**
   ```bash
   # Adicione ao .gitignore
   echo ".env" >> .gitignore
   ```

4. **Use TLS/SSL:**
   - Configure certificados SSL para o MongoDB
   - Use conexões criptografadas

5. **Limite acesso à rede:**
   - Não exponha a porta 27017 publicamente
   - Use firewall e VPN

## 🐛 Troubleshooting

### Problema: Scripts de inicialização não executam

**Solução:** Os scripts só executam na primeira inicialização. Para forçar:
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Recria tudo
```

### Problema: Erro de autenticação

**Solução:** Verifique:
1. Usuário e senha estão corretos
2. authSource está correto (geralmente `pokeAPI` ou `admin`)
3. MongoDB está rodando: `docker-compose ps`

### Problema: Interface gráfica não conecta

**Solução:**
1. Verifique se o MongoDB está acessível: `docker-compose ps`
2. Teste conexão via mongosh primeiro
3. Verifique se as dependências estão instaladas: `pip list`

### Problema: Permissão negada inesperadamente

**Solução:**
1. Verifique as roles do usuário no mongosh:
   ```javascript
   use pokeAPI
   db.getUser("seuUsuario")
   ```
2. Verifique os privilégios da role:
   ```javascript
   db.getRole("suaRole", {showPrivileges: true})
   ```

## 📚 Recursos Adicionais

### Documentação Oficial

- [MongoDB Authentication](https://docs.mongodb.com/manual/core/authentication/)
- [MongoDB Authorization](https://docs.mongodb.com/manual/core/authorization/)
- [Built-in Roles](https://docs.mongodb.com/manual/reference/built-in-roles/)
- [Custom Roles](https://docs.mongodb.com/manual/core/security-user-defined-roles/)
- [Docker Hub - MongoDB](https://hub.docker.com/_/mongo)

### Conceitos Importantes

**Autenticação vs Autorização:**
- **Autenticação:** Verifica a identidade (quem você é)
- **Autorização:** Verifica permissões (o que você pode fazer)

**RBAC (Role-Based Access Control):**
- Controle de acesso baseado em papéis
- Usuários recebem roles
- Roles definem permissões granulares

**Privilégios no MongoDB:**
```javascript
{
  resource: { db: "database", collection: "collection" },
  actions: ["find", "insert", "update", "remove", ...]
}
```

## 🎓 Critérios de Avaliação

Este projeto atende aos seguintes critérios:

✅ **Funcionamento Básico:**
- Autenticação nativa MongoDB funcional
- Roles customizados criados
- Usuários com diferentes permissões
- Ingestão automática de dados

✅ **Robustez:**
- Validação de permissões em tempo real
- Tratamento de erros
- Scripts de inicialização ordenados
- Healthcheck do Docker

✅ **Criatividade:**
- Interface gráfica moderna com CustomTkinter
- Terminal MongoDB interativo
- Validação visual de permissões
- Múltiplos cenários de teste

✅ **Documentação:**
- README completo com exemplos
- Comentários nos scripts
- Diagrama de arquitetura
- Guia de troubleshooting

✅ **Qualidade do Código:**
- Código organizado e comentado
- Boas práticas Python
- Scripts MongoDB bem estruturados
- Type hints no Python

✅ **Testes e Exemplos:**
- Múltiplos cenários de teste
- Demonstração de operações permitidas/negadas
- Exemplos práticos de uso
- Validação via interface gráfica

## 👨‍💻 Desenvolvimento

### Adicionar Nova Role

1. Edite `init-db/01-create-roles.js`:
```javascript
db.createRole({
  role: "novaRole",
  privileges: [
    {
      resource: { db: "pokeAPI", collection: "coleção" },
      actions: ["find", "insert"]
    }
  ],
  roles: []
});
```

2. Reinicialize o banco:
```bash
docker-compose down -v
docker-compose up -d
```

### Adicionar Novo Usuário

1. Edite `init-db/02-create-users.js`:
```javascript
db.createUser({
  user: "novoUsuario",
  pwd: "senhaForte123",
  roles: [
    { role: "novaRole", db: "pokeAPI" }
  ]
});
```

2. Reinicialize o banco

### Adicionar Nova Coleção

1. Edite `init-db/03-create-collections.js`:
```javascript
db.createCollection('novaColecao');
db.novaColecao.insertMany([
  { campo: "valor1" },
  { campo: "valor2" }
]);
```

## 📝 Licença

Este projeto é para fins educacionais como parte de um trabalho acadêmico sobre Banco de Dados.

## 🤝 Contribuições

Este é um projeto acadêmico. Para sugestões ou melhorias, entre em contato.

---

**Desenvolvido como parte do curso de Banco de Dados - UFES**

**Tema:** Autenticação, Autorização e Ingestão Automática no MongoDB
