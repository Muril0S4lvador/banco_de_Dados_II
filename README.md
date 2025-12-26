# Sistema de Gerenciamento Bancário com Controle de Acesso

Sistema completo de gerenciamento de dados bancários com autenticação JWT e sistema granular de permissões baseado em roles. O projeto implementa um CRUD para entidades bancárias (Account, Branch, Customer, Loan, Borrower, Depositor) com controle de acesso por tabela e operação.

## 📋 Sumário

- [Descrição do Sistema](#descrição-do-sistema)
- [Arquitetura](#arquitetura)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Sistema de Permissões](#sistema-de-permissões)
- [Instruções de Execução](#instruções-de-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Exemplos de Uso](#exemplos-de-uso)
- [Testes de Privilégios](#testes-de-privilégios)

## 📖 Descrição do Sistema

O sistema é uma aplicação web full-stack para gerenciamento de dados bancários com foco em segurança e controle de acesso. Foi desenvolvido utilizando uma arquitetura moderna com separação clara entre frontend, backend e banco de dados NoSQL.

### Funcionalidades Principais

1. **Autenticação e Autorização**
   - Login com JWT (JSON Web Tokens)
   - Sessões seguras com tokens armazenados no banco
   - Middleware de autenticação em todas as rotas protegidas

2. **Gerenciamento de Usuários e Roles**
   - CRUD completo de usuários
   - Sistema de roles (papéis) personalizáveis
   - Usuários podem ter múltiplas roles
   - Role especial "admin" com acesso total

3. **Sistema de Permissões Granulares**
   - Permissões por tabela e por operação
   - Três níveis de permissão: `allowedView`, `allowedEdit`, `allowedDelete`
   - Permissões independentes (não hierárquicas)
   - Agregação de permissões (se qualquer role permite, usuário tem acesso)

4. **CRUD de Entidades Bancárias**
   - **Account**: Contas bancárias
   - **Branch**: Agências
   - **Customer**: Clientes
   - **Loan**: Empréstimos
   - **Borrower**: Tomadores de empréstimo
   - **Depositor**: Depositantes

5. **Interface Web Responsiva**
   - Dashboard com listagem de tabelas baseada em permissões
   - Formulários dinâmicos com validação
   - Controle de UI baseado em permissões (botões aparecem/desaparecem)
   - Feedback visual para ações do usuário

## 🏗 Arquitetura

### Visão Geral

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │  HTTP   │                 │  AWS    │                 │
│   Frontend      ├────────►│   Backend       ├────────►│   DynamoDB      │
│   React + TS    │         │   Express + TS  │   SDK   │   Local         │
│   Port: 3000    │         │   Port: 4444    │         │   Port: 8000    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Backend (API REST)

**Tecnologia**: Node.js + Express + TypeScript

**Padrão Arquitetural**: MVC (Model-View-Controller) modificado

**Camadas**:

1. **Router** (`router.ts`): Define todas as rotas e aplica middlewares
2. **Controllers**: Processam requisições e retornam respostas
   - AuthController: Login e informações do usuário
   - UserController: CRUD de usuários
   - RoleController: CRUD de roles
   - Entidades: AccountController, BranchController, etc.
3. **Repositories**: Comunicação com DynamoDB
4. **Entities**: Representação das tabelas do banco
5. **Middlewares**: 
   - `AuthMiddleware`: Valida JWT e popula req.user
   - `PermissionMiddleware`: Verifica permissões por tabela/operação

**Estratégias Implementadas**:

- **Middleware em Cascata**: AuthMiddleware → PermissionMiddleware → Controller
- **Singleton Pattern**: Conexão única com DynamoDB reutilizada
- **Repository Pattern**: Abstração da camada de dados
- **JWT com Blacklist**: Tokens armazenados no banco para controle de sessão
- **Hash de Senhas**: bcrypt com salt rounds para segurança

### Frontend (SPA)

**Tecnologia**: React 18 + TypeScript + Vite

**Padrão Arquitetural**: Component-Based Architecture

**Gerenciamento de Estado**:

- **Context API**: 
  - `AuthContext`: Estado global de autenticação
  - `PermissionContext`: Estado global de permissões do usuário

**Estratégias de Roteamento**:

- `ProtectedRoute`: HOC que protege rotas autenticadas
- `AdminRoute`: HOC adicional para rotas exclusivas de admin
- Rotas específicas para cada entidade bancária

**Serviços**:

- **Axios**: Cliente HTTP centralizado com interceptors
- **Services**: Camada de abstração para chamadas à API
  - accountService, branchService, customerService, etc.
  - permissionService: Busca permissões do usuário
  - roleService, userService: Gerenciamento de acesso

**UI/UX**:

- Renderização condicional baseada em permissões
- Feedback visual (loading states, mensagens de erro/sucesso)
- Formulários reativos com validação

### Banco de Dados (DynamoDB)

**Tecnologia**: AWS DynamoDB Local

**Modelagem NoSQL**:

- **Tabelas**: Users, Roles, Tokens, Account, Branch, Customer, Loan, Borrower, Depositor
- **Chave Primária**: `__id` (Partition Key)
- **Sem chaves de ordenação**: Acesso direto por ID

**Estrutura da Role** (contém permissões embutidas):
```json
{
  "roleId": "role_admin",
  "roleName": "Administrador",
  "permissions": [
    {
      "tableName": "account",
      "allowedView": true,
      "allowedEdit": true,
      "allowedDelete": true
    }
  ]
}
```

**Estrutura do User**:
```json
{
  "userId": "user_123",
  "username": "joao",
  "name": "João Silva",
  "password": "$2a$10$hash...",
  "roleIds": ["role_admin", "role_viewer"]
}
```

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js 18+**: Runtime JavaScript
- **TypeScript**: Superset tipado do JavaScript
- **Express.js**: Framework web minimalista
- **AWS SDK v3**: Cliente DynamoDB
- **jsonwebtoken**: Geração e validação de JWT
- **bcryptjs**: Hash de senhas
- **cors**: Controle de acesso cross-origin
- **swagger**: Documentação automática da API

### Frontend
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool moderna
- **React Router v6**: Roteamento SPA
- **Axios**: Cliente HTTP
- **CSS3**: Estilização

### Infraestrutura
- **Docker**: Containerização
- **Docker Compose**: Orquestração de containers
- **DynamoDB Local**: Banco NoSQL para desenvolvimento
- **DynamoDB Admin**: Interface web para visualizar dados

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

1. **Login** (`POST /login`):
   ```typescript
   // Request
   {
     "username": "admin",
     "password": "admin123"
   }
   
   // Response
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": {
         "userId": "user_admin",
         "username": "admin",
         "name": "Administrador",
         "roleIds": ["admin"]
       }
     }
   }
   ```

2. **Armazenamento do Token**:
   - Frontend: `localStorage.setItem('token', token)`
   - Backend: Registro na tabela `Tokens` para controle de sessão

3. **Requisições Autenticadas**:
   - Header: `Authorization: Bearer <token>`
   - AuthMiddleware valida token e busca usuário
   - `req.user` populado com dados do usuário

4. **Validação do Token**:
   ```typescript
   // AuthMiddleware.ts
   const decoded = jwt.verify(token, process.env.JWT_SECRET)
   const tokenFound = await tokenRepository.findToken(token)
   const user = await userRepository.findUserByUserId(decoded.userId)
   
   req.user = {
     userId: user.userId,
     username: user.username,
     name: user.name,
     roleIds: user.roleIds
   }
   ```

### Segurança Implementada

- **JWT Secret**: Chave secreta em variável de ambiente
- **Token Expiration**: Tokens podem expirar (configurável)
- **Password Hashing**: bcrypt com 10 salt rounds
- **Token Storage**: Tokens salvos no banco para revogação
- **CORS**: Configurado para aceitar apenas origens permitidas

## 🔑 Sistema de Permissões

### Arquitetura de Permissões

O sistema utiliza **permissões embutidas em Roles** (embedded documents), não uma tabela separada.

**Estrutura de Permissão**:
```typescript
interface RolePermission {
  tableName: string      // 'account', 'branch', 'customer', etc.
  allowedView: boolean   // Pode visualizar registros
  allowedEdit: boolean   // Pode criar/editar registros
  allowedDelete: boolean // Pode deletar registros
}
```

### Estratégia de Agregação

Quando um usuário possui múltiplas roles:

```typescript
// Usuário com roleIds: ['role_manager', 'role_viewer']
// 
// role_manager.permissions = [
//   { tableName: 'account', allowedView: true, allowedEdit: true, allowedDelete: false }
// ]
// 
// role_viewer.permissions = [
//   { tableName: 'account', allowedView: true, allowedEdit: false, allowedDelete: false },
//   { tableName: 'customer', allowedView: true, allowedEdit: false, allowedDelete: false }
// ]
//
// Permissões resultantes (OR lógico):
// account: { view: true, edit: true, delete: false }
// customer: { view: true, edit: false, delete: false }
```

**Lógica de Agregação**: Se **qualquer role** concede uma permissão, o usuário tem acesso.

### Fluxo de Verificação

1. **Backend** (PermissionMiddleware):
   ```typescript
   // Para cada roleId do usuário
   for (const roleId of user.roleIds) {
     const role = await roleRepo.findRoleByRoleId(roleId)
     const tablePermission = role.permissions.find(p => p.tableName === tableName)
     
     if (tablePermission.allowedView) hasPermission = true
   }
   ```

2. **Frontend** (PermissionContext):
   ```typescript
   // Busca permissões agregadas do backend
   const permissions = await permissionService.getMyPermissions()
   // { account: { allowedView: true, allowedEdit: false, ... }, ... }
   
   // Uso no componente
   const canEdit = hasPermission('account', 'edit')
   ```

### Permissões Especiais

**Role "admin"**:
- Bypass total do sistema de permissões
- Acesso irrestrito a todas as tabelas e operações
- Verificação: `if (user.roleIds.includes('admin')) return true`

### Aplicação no Frontend

**Renderização Condicional**:
```tsx
// AccountList.tsx
const { hasPermission } = usePermission()
const canEdit = hasPermission('account', 'edit')
const canDelete = hasPermission('account', 'delete')

return (
  <>
    {canEdit && <button onClick={handleCreate}>Criar</button>}
    {canDelete && <button onClick={handleDelete}>Deletar</button>}
  </>
)
```

**Filtro de Tabelas**:
```tsx
// Home.tsx
const visibleTables = tables.filter(table => 
  hasPermission(table.name, 'view')
)
```

## 🚀 Instruções de Execução

### Pré-requisitos

- **Docker Desktop** instalado
- **Docker Compose** instalado
- Portas disponíveis: 3000, 4444, 8000, 8001

### 1. Clonar o Repositório

```bash
git clone https://github.com/Muril0S4lvador/banco_de_Dados_II.git bd
cd bd
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado com valores padrão:

```env
SERVER_PORT=4444
CLIENT_PORT=3000
COMMAND=/bin/sh /app/start.sh
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
DYNAMODB_ENDPOINT=http://dynamodb-local:8000
JWT_SECRET=seu-segredo-jwt-super-secreto
```

### 3. Iniciar os Containers

```bash
docker-compose up --build
```

Isso iniciará:
- **dynamodb-local**: Banco de dados (porta 8000)
- **dynamodb-admin**: Interface web do banco (porta 8001)
- **database-api**: Backend + Frontend servido (porta 4444)

### 4. Criação e População de Tabelas

Os seguintes scripts serão executados após a inicialização:

```bash
# Criar tabelas
/app/scripts_tables/create_tables.py

# Popular com dados iniciais
/app/scripts_tables/populate_tables.py
```

### 5. Acessar o Sistema

- **Aplicação Web**: http://localhost:3000
- **Swagger API Docs**: http://localhost:4444/swagger
- **DynamoDB Admin**: http://localhost:8001

### 6. Credenciais Padrão

**Administrador**:
- Username: `admin`
- Password: `admin`
- RoleIds: `["admin"]`

### 7. Verificar Logs

```bash
# Ver logs em tempo real
docker-compose logs -f database-api

# Ver logs de uma vez
docker-compose logs database-api
```

### 8. Parar o Sistema

```bash
# Parar containers (mantém dados)
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar, remover e limpar volumes (APAGA DADOS)
docker-compose down -v
```

## 📁 Estrutura do Projeto

```
bd/
├── api/                          # Backend API
│   ├── src/
│   │   ├── config/              # Configurações (DB, Swagger)
│   │   │   ├── database.ts      # Cliente DynamoDB
│   │   │   └── swagger.ts       # Config Swagger
│   │   ├── controller/          # Controllers REST
│   │   │   ├── AuthController.ts           # Login e autenticação
│   │   │   ├── UserController.ts           # CRUD usuários
│   │   │   ├── RoleController.ts           # CRUD roles
│   │   │   ├── AccountController.ts        # CRUD contas
│   │   │   ├── BranchController.ts         # CRUD agências
│   │   │   ├── CustomerController.ts       # CRUD clientes
│   │   │   ├── LoanController.ts           # CRUD empréstimos
│   │   │   ├── BorrowerController.ts       # CRUD tomadores
│   │   │   ├── DepositorController.ts      # CRUD depositantes
│   │   │   └── UserPermissionsController.ts # Permissões do usuário
│   │   ├── entity/              # Entidades do banco
│   │   │   ├── User.ts          # Usuário
│   │   │   ├── Role.ts          # Role (com permissions[])
│   │   │   ├── Token.ts         # Token JWT
│   │   │   ├── Account.ts       # Conta bancária
│   │   │   ├── Branch.ts        # Agência
│   │   │   ├── Customer.ts      # Cliente
│   │   │   ├── Loan.ts          # Empréstimo
│   │   │   ├── Borrower.ts      # Tomador
│   │   │   └── Depositor.ts     # Depositante
│   │   ├── middleware/          # Middlewares
│   │   │   ├── AuthMiddleware.ts        # Autenticação JWT
│   │   │   └── PermissionMiddleware.ts  # Verificação de permissões
│   │   ├── repository/          # Camada de dados
│   │   │   ├── UserRepository.ts
│   │   │   ├── RoleRepository.ts
│   │   │   └── TokenRepository.ts
│   │   ├── helpers/
│   │   │   └── RouteResponse.ts # Padronização de respostas
│   │   ├── model/
│   │   │   └── interfaces/
│   │   │       └── auth/
│   │   │           └── LoginRequestBody.ts
│   │   ├── app.ts               # Configuração Express
│   │   └── router.ts            # Definição de rotas
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── Login.tsx        # Tela de login
│   │   │   ├── Home.tsx         # Dashboard principal
│   │   │   ├── Header.tsx       # Barra de navegação
│   │   │   ├── ProtectedRoute.tsx   # HOC proteção de rota
│   │   │   ├── AdminRoute.tsx       # HOC rota admin
│   │   │   ├── RolesList.tsx        # Lista de roles
│   │   │   ├── RoleForm.tsx         # Formulário de role
│   │   │   ├── UsersList.tsx        # Lista de usuários
│   │   │   ├── AccountList.tsx      # Lista de contas
│   │   │   ├── AccountForm.tsx      # Formulário de conta
│   │   │   ├── BranchList.tsx       # Lista de agências
│   │   │   ├── BranchForm.tsx       # Formulário de agência
│   │   │   ├── CustomerList.tsx     # Lista de clientes
│   │   │   ├── CustomerForm.tsx     # Formulário de cliente
│   │   │   ├── LoanList.tsx         # Lista de empréstimos
│   │   │   ├── LoanForm.tsx         # Formulário de empréstimo
│   │   │   ├── BorrowerList.tsx     # Lista de tomadores
│   │   │   ├── BorrowerForm.tsx     # Formulário de tomador
│   │   │   ├── DepositorList.tsx    # Lista de depositantes
│   │   │   └── DepositorForm.tsx    # Formulário de depositante
│   │   ├── contexts/            # Context API
│   │   │   ├── AuthContext.tsx          # Estado de autenticação
│   │   │   └── PermissionContext.tsx    # Estado de permissões
│   │   ├── services/            # Serviços HTTP
│   │   │   ├── accountService.ts
│   │   │   ├── branchService.ts
│   │   │   ├── customerService.ts
│   │   │   ├── loanService.ts
│   │   │   ├── borrowerService.ts
│   │   │   ├── depositorService.ts
│   │   │   ├── userService.ts
│   │   │   ├── roleService.ts
│   │   │   ├── permissionService.ts
│   │   │   └── tableItemService.ts
│   │   ├── lib/
│   │   │   └── axios.ts         # Cliente HTTP configurado
│   │   ├── App.tsx              # Componente raiz
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── scripts_tables/               # Scripts Python
│   ├── create_tables.py         # Cria tabelas no DynamoDB
│   └── populate_tables.py       # Popula dados iniciais
│
├── tables/                       # Dados JSON
│   ├── account_batch.json
│   ├── branch_batch.json
│   ├── customer_batch.json
│   ├── loan_batch.json
│   ├── borrower_batch.json
│   ├── depositor_batch.json
│   ├── role_batch.json
│   ├── user_batch.json
│   └── tables.json
│
├── docker-compose.yml           # Orquestração Docker
├── Dockerfile                   # Build do DynamoDB
├── Dockerfile.api               # Build do Backend+Frontend
├── .env                         # Variáveis de ambiente
└── README.md                    # Esta documentação
```

## 💻 Exemplos de Uso

### Autenticação via API

**1. Fazer Login**

```bash
curl -X POST http://localhost:4444/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyX2FkbWluIiwiaWF0IjoxNzAwMDAwMDAwfQ.xyz...",
    "user": {
      "userId": "user_admin",
      "username": "admin",
      "name": "Administrador",
      "roleIds": ["admin"]
    }
  },
  "message": "Login realizado com sucesso"
}
```

**2. Obter Informações do Usuário Logado**

```bash
TOKEN="seu-token-jwt"

curl -X GET http://localhost:4444/me \
  -H "Authorization: Bearer $TOKEN"
```

**3. Buscar Permissões do Usuário**

```bash
curl -X GET http://localhost:4444/user/permissions \
  -H "Authorization: Bearer $TOKEN"
```

Resposta:
```json
{
  "success": true,
  "data": {
    "account": {
      "allowedView": true,
      "allowedEdit": true,
      "allowedDelete": true
    },
    "branch": {
      "allowedView": true,
      "allowedEdit": true,
      "allowedDelete": true
    },
    "customer": {
      "allowedView": true,
      "allowedEdit": false,
      "allowedDelete": false
    }
  }
}
```

### CRUD de Entidades

**1. Listar Contas (Account)**

```bash
curl -X GET http://localhost:4444/account \
  -H "Authorization: Bearer $TOKEN"
```

**2. Criar Nova Conta**

```bash
curl -X POST http://localhost:4444/account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "A-999",
    "branch_name": "Downtown",
    "balance": 5000.00
  }'
```

**3. Atualizar Conta**

```bash
curl -X PUT http://localhost:4444/account/A-999 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "balance": 7500.00
  }'
```

**4. Deletar Conta**

```bash
curl -X DELETE http://localhost:4444/account/A-999 \
  -H "Authorization: Bearer $TOKEN"
```

### Gerenciamento de Roles

**1. Criar Nova Role**

```bash
curl -X POST http://localhost:4444/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "role_accountant",
    "roleName": "Contador",
    "permissions": [
      {
        "tableName": "account",
        "allowedView": true,
        "allowedEdit": false,
        "allowedDelete": false
      },
      {
        "tableName": "loan",
        "allowedView": true,
        "allowedEdit": false,
        "allowedDelete": false
      }
    ]
  }'
```

**2. Atualizar Permissões de uma Role**

```bash
curl -X PUT http://localhost:4444/role/role_accountant \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [
      {
        "tableName": "account",
        "allowedView": true,
        "allowedEdit": true,
        "allowedDelete": false
      }
    ]
  }'
```

### Gerenciamento de Usuários

**1. Criar Novo Usuário**

```bash
curl -X POST http://localhost:4444/user \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria",
    "password": "senha456",
    "name": "Maria Silva",
    "roleIds": ["role_accountant", "role_viewer"]
  }'
```

**2. Atualizar Roles do Usuário**

```bash
curl -X PUT http://localhost:4444/user/user_maria \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleIds": ["role_accountant"]
  }'
```

## 🧪 Testes de Privilégios

### Cenário 1: Usuário Administrador

**Setup**:
```bash
# Login como admin
TOKEN_ADMIN=$(curl -s -X POST http://localhost:4444/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')
```

**Testes**:

1. **Visualizar todas as tabelas** ✅
```bash
curl -X GET http://localhost:4444/account -H "Authorization: Bearer $TOKEN_ADMIN"
curl -X GET http://localhost:4444/branch -H "Authorization: Bearer $TOKEN_ADMIN"
curl -X GET http://localhost:4444/customer -H "Authorization: Bearer $TOKEN_ADMIN"
# Deve retornar dados de todas as tabelas
```

2. **Criar registros em qualquer tabela** ✅
```bash
curl -X POST http://localhost:4444/account \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"account_number":"A-TEST","branch_name":"Test","balance":1000}'
# Deve criar com sucesso
```

3. **Deletar registros** ✅
```bash
curl -X DELETE http://localhost:4444/account/A-TEST \
  -H "Authorization: Bearer $TOKEN_ADMIN"
# Deve deletar com sucesso
```

4. **Acessar rotas de gerenciamento** ✅
```bash
curl -X GET http://localhost:4444/user -H "Authorization: Bearer $TOKEN_ADMIN"
curl -X GET http://localhost:4444/role -H "Authorization: Bearer $TOKEN_ADMIN"
# Deve retornar listas completas
```

### Cenário 2: Usuário com Permissões Limitadas

**Setup**:
```bash
# Criar role limitada
curl -X POST http://localhost:4444/role \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "role_readonly",
    "roleName": "Somente Leitura",
    "permissions": [
      {"tableName": "account", "allowedView": true, "allowedEdit": false, "allowedDelete": false},
      {"tableName": "customer", "allowedView": true, "allowedEdit": false, "allowedDelete": false}
    ]
  }'

# Criar usuário com essa role
curl -X POST http://localhost:4444/user \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "leitor",
    "password": "senha789",
    "name": "Usuario Leitor",
    "roleIds": ["role_readonly"]
  }'

# Login como usuário limitado
TOKEN_READONLY=$(curl -s -X POST http://localhost:4444/login \
  -H "Content-Type: application/json" \
  -d '{"username":"leitor","password":"senha789"}' \
  | jq -r '.data.token')
```

**Testes**:

1. **Visualizar tabelas permitidas** ✅
```bash
curl -X GET http://localhost:4444/account -H "Authorization: Bearer $TOKEN_READONLY"
# Retorna: 200 OK com dados
curl -X GET http://localhost:4444/customer -H "Authorization: Bearer $TOKEN_READONLY"
# Retorna: 200 OK com dados
```

2. **Visualizar tabelas não permitidas** ❌
```bash
curl -X GET http://localhost:4444/loan -H "Authorization: Bearer $TOKEN_READONLY"
# Retorna: 403 Forbidden
# {"success": false, "message": "Você não tem permissão para visualizar esta tabela"}
```

3. **Tentar criar registro** ❌
```bash
curl -X POST http://localhost:4444/account \
  -H "Authorization: Bearer $TOKEN_READONLY" \
  -H "Content-Type: application/json" \
  -d '{"account_number":"A-FAIL","branch_name":"Test","balance":1000}'
# Retorna: 403 Forbidden
# {"success": false, "message": "Você não tem permissão para editar esta tabela"}
```

4. **Tentar deletar registro** ❌
```bash
curl -X DELETE http://localhost:4444/account/A-101 \
  -H "Authorization: Bearer $TOKEN_READONLY"
# Retorna: 403 Forbidden
# {"success": false, "message": "Você não tem permissão para deletar esta tabela"}
```

5. **Tentar acessar gerenciamento de usuários** ❌
```bash
curl -X GET http://localhost:4444/user -H "Authorization: Bearer $TOKEN_READONLY"
# Frontend: Link "Usuários" não aparece no menu (apenas para admin)
# API: Se tentar acessar, funciona pois não há PermissionMiddleware nessa rota
# (considerado recurso administrativo protegido por AdminRoute no frontend)
```

### Cenário 3: Usuário com Múltiplas Roles (Agregação)

**Setup**:
```bash
# Criar duas roles complementares
curl -X POST http://localhost:4444/role \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "role_viewer",
    "roleName": "Visualizador",
    "permissions": [
      {"tableName": "account", "allowedView": true, "allowedEdit": false, "allowedDelete": false},
      {"tableName": "branch", "allowedView": true, "allowedEdit": false, "allowedDelete": false}
    ]
  }'

curl -X POST http://localhost:4444/role \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "role_editor",
    "roleName": "Editor",
    "permissions": [
      {"tableName": "account", "allowedView": false, "allowedEdit": true, "allowedDelete": false}
    ]
  }'

# Criar usuário com ambas as roles
curl -X POST http://localhost:4444/user \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "joao",
    "password": "senha321",
    "name": "Joao Santos",
    "roleIds": ["role_viewer", "role_editor"]
  }'

# Login
TOKEN_MULTI=$(curl -s -X POST http://localhost:4444/login \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"senha321"}' \
  | jq -r '.data.token')
```

**Testes de Agregação**:

1. **Verificar permissões agregadas** ✅
```bash
curl -X GET http://localhost:4444/user/permissions \
  -H "Authorization: Bearer $TOKEN_MULTI"
# Resultado esperado:
# {
#   "account": {
#     "allowedView": true,    // De role_viewer
#     "allowedEdit": true,    // De role_editor
#     "allowedDelete": false  // Nenhuma role permite
#   },
#   "branch": {
#     "allowedView": true,    // De role_viewer
#     "allowedEdit": false,
#     "allowedDelete": false
#   }
# }
```

2. **Visualizar account** ✅ (role_viewer permite)
```bash
curl -X GET http://localhost:4444/account -H "Authorization: Bearer $TOKEN_MULTI"
# Retorna: 200 OK
```

3. **Editar account** ✅ (role_editor permite)
```bash
curl -X PUT http://localhost:4444/account/A-101 \
  -H "Authorization: Bearer $TOKEN_MULTI" \
  -H "Content-Type: application/json" \
  -d '{"balance": 9999}'
# Retorna: 200 OK
```

4. **Deletar account** ❌ (nenhuma role permite)
```bash
curl -X DELETE http://localhost:4444/account/A-101 \
  -H "Authorization: Bearer $TOKEN_MULTI"
# Retorna: 403 Forbidden
```

5. **Editar branch** ❌ (apenas view permitido)
```bash
curl -X POST http://localhost:4444/branch \
  -H "Authorization: Bearer $TOKEN_MULTI" \
  -H "Content-Type: application/json" \
  -d '{"branch_name":"New","branch_city":"Test"}'
# Retorna: 403 Forbidden
```

### Cenário 4: Usuário sem Token (Não Autenticado)

**Testes**:

1. **Acessar rota protegida sem token** ❌
```bash
curl -X GET http://localhost:4444/account
# Retorna: 401 Unauthorized
# {"success": false, "message": "Token inválido ou ausente"}
```

2. **Acessar com token inválido** ❌
```bash
curl -X GET http://localhost:4444/account \
  -H "Authorization: Bearer token-invalido"
# Retorna: 401 Unauthorized
# {"success": false, "message": "Token inválido ou expirado"}
```

3. **Acessar rota de login** ✅
```bash
curl -X POST http://localhost:4444/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Retorna: 200 OK com token
```

### Validação no Frontend

**Interface Adaptativa por Permissão**:

1. **Dashboard (Home)**:
   - Admin vê: Account, Branch, Customer, Loan, Borrower, Depositor
   - role_readonly vê: Apenas Account e Customer
   - role_viewer vê: Account e Branch

2. **Botões de Ação**:
   - `allowedView=false`: Tabela não aparece na lista
   - `allowedEdit=false`: Botão "Criar" não aparece, formulários read-only
   - `allowedDelete=false`: Botão "Deletar" não aparece nas linhas

3. **Menu de Navegação**:
   - Links "Usuários" e "Roles": Apenas para admin (AdminRoute)
   - Links das entidades: Baseado em `allowedView`

4. **Redirecionamento**:
   - Tentar acessar rota sem permissão → Redirect para /home
   - Não autenticado → Redirect para /login

## 📚 Documentação Adicional

### Swagger API

Acesse a documentação interativa da API:
```
http://localhost:4444/swagger
```

### DynamoDB Admin

Visualize e manipule diretamente os dados do banco:
```
http://localhost:8001
```

### Estrutura das Tabelas

**Users**:
- `__id`: userId (PK)
- `username`: string (unique)
- `password`: string (hashed)
- `name`: string
- `roleIds`: string[]

**Roles**:
- `__id`: roleId (PK)
- `roleName`: string
- `permissions`: RolePermission[]
  - `tableName`: string
  - `allowedView`: boolean
  - `allowedEdit`: boolean
  - `allowedDelete`: boolean

**Tokens**:
- `__id`: token (PK)
- `userId`: string
- `createdAt`: timestamp

**Account**:
- `__id`: account_number (PK)
- `branch_name`: string
- `balance`: number

**Branch**:
- `__id`: branch_name (PK)
- `branch_city`: string
- `assets`: number

**Customer**:
- `__id`: customer_name (PK)
- `customer_street`: string
- `customer_city`: string

**Loan**:
- `__id`: loan_number (PK)
- `branch_name`: string
- `amount`: number

**Borrower**:
- `__id`: gerado pelo sistema (PK)
- `customer_name`: string
- `loan_number`: string

**Depositor**:
- `__id`: `customer_name::account_number` (PK)
- `customer_name`: string
- `account_number`: string

## 🔧 Troubleshooting

### Containers não iniciam
```bash
docker-compose down -v
docker-compose up -d --build
```

### Tabelas não foram criadas
```bash
docker exec database-api python3 /app/scripts_tables/create_tables.py
docker exec database-api python3 /app/scripts_tables/populate_tables.py
```

### Erro de autenticação
- Verifique se o token está sendo enviado no header `Authorization: Bearer <token>`
- Verifique se o token não expirou
- Reautentique com `/login`

### Erro 403 (Forbidden)
- Verifique as permissões do usuário em `/user/permissions`
- Confirme que a role tem permissão para a operação desejada
- Verifique se não é uma rota exclusiva de admin

### Frontend não carrega
```bash
docker exec database-api sh -c "cd /app/frontend && npm run build"
docker-compose restart database-api
```

## 👥 Autores

Projeto desenvolvido para a disciplina de Banco de Dados II - UFES

## 📄 Licença

Este projeto é acadêmico e de código aberto.
