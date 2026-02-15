# 🧪 Guia de Testes - MongoDB Authentication & Authorization

Este guia fornece cenários de teste detalhados para validar a autenticação, autorização e permissões do sistema MongoDB.

## 📋 Índice
1. [Preparação do Ambiente](#preparação-do-ambiente)
2. [Testes de Autenticação](#testes-de-autenticação)
3. [Testes de Autorização](#testes-de-autorização)
4. [Testes de Ingestão de Dados](#testes-de-ingestão-de-dados)
5. [Testes via Interface Gráfica](#testes-via-interface-gráfica)
6. [Testes via mongosh](#testes-via-mongosh)
7. [Testes Avançados](#testes-avançados)

---

## Preparação do Ambiente

### 1. Resetar o Ambiente (Opcional)
```bash
# Parar e remover todos os containers e volumes
docker-compose down -v

# Subir novamente (executa scripts de init)
docker-compose up -d

# Aguardar inicialização completa
docker-compose logs -f mongo
# Pressione Ctrl+C quando ver "MongoDB init process complete"
```

### 2. Verificar que o MongoDB está Funcionando
```bash
# Verificar status dos containers
docker-compose ps

# Deve mostrar:
# mongo-pokeapi      running
# mongo-express-ui   running

# Testar conexão básica
docker exec -it mongo-pokeapi mongosh --eval "db.version()"
```

### 3. Verificar Criação de Roles e Usuários
```bash
# Conectar como admin
docker exec -it mongo-pokeapi mongosh -u admin -p admin --authenticationDatabase admin

# Dentro do mongosh:
use pokeAPI

# Listar roles customizados
db.getRoles({showPrivileges: false})

# Listar usuários criados
db.getUsers()

# Sair
exit
```

**Resultado Esperado:**
- 5 roles customizados: pokeAdmin, pokeReader, pokeWriter, pokeAnalyst, pokemonsOnlyReader
- 4 usuários: viewer, dataEntry, analyst, restrictedUser
- 1 administrador root: admin (criado automaticamente)

---

## Testes de Autenticação

### Teste 1.1: Login com Credenciais Válidas ✅

#### Via Interface Gráfica
```
1. Executar: python mongo_client.py
2. Login: admin
3. Senha: admin
4. Clicar em "Entrar"
```

**Resultado Esperado:** 
- ✅ Login bem-sucedido
- Interface principal exibida
- Informações do usuário mostradas no topo

#### Via mongosh
```bash
mongosh "mongodb://admin:admin@localhost:27017/?authSource=admin"
```

**Resultado Esperado:**
- ✅ Conexão estabelecida
- Prompt: `pokeAPI>`

---

### Teste 1.2: Login com Credenciais Inválidas ❌

#### Via Interface Gráfica
```
1. Login: usuarioInvalido
2. Senha: senhaErrada
3. Clicar em "Entrar"
```

**Resultado Esperado:**
- ❌ Mensagem de erro: "Falha na autenticação"
- Permanece na tela de login

#### Via mongosh
```bash
mongosh "mongodb://usuarioInvalido:senhaErrada@localhost:27017/pokeAPI?authSource=pokeAPI"
```

**Resultado Esperado:**
- ❌ Erro: "Authentication failed"

---

### Teste 1.3: Login com authSource Incorreto ❌

```bash
# Tentando usar authSource=pokeAPI para usuário admin (que precisa de authSource=admin)
mongosh "mongodb://admin:admin@localhost:27017/pokeAPI?authSource=pokeAPI"
```

**Resultado Esperado:**
- ❌ Erro: "Authentication failed"

**Lição:** O authSource deve corresponder ao banco onde o usuário foi criado.

---

## Testes de Autorização

### Teste 2.1: Admin - Acesso Total ✅

#### Setup
```
Login: admin
Senha: admin
```

#### Comando 1: Leitura
```javascript
db.pokemons.find({name: "pikachu"})
```
**Resultado Esperado:** ✅ Documento do Pikachu retornado

#### Comando 2: Inserção
```javascript
db.pokemons.insertOne({
  name: "test-pokemon",
  type: "test",
  level: 1
})
```
**Resultado Esperado:** ✅ Documento inserido com sucesso

#### Comando 3: Atualização
```javascript
db.pokemons.updateOne(
  {name: "test-pokemon"},
  {$set: {level: 50}}
)
```
**Resultado Esperado:** ✅ 1 documento atualizado

#### Comando 4: Deleção
```javascript
db.pokemons.deleteOne({name: "test-pokemon"})
```
**Resultado Esperado:** ✅ 1 documento deletado

#### Comando 5: Criar Coleção
```javascript
db.createCollection("test_collection")
```
**Resultado Esperado:** ✅ Coleção criada

#### Comando 6: Dropar Coleção
```javascript
db.test_collection.drop()
```
**Resultado Esperado:** ✅ Coleção removida

---

### Teste 2.2: Viewer - Somente Leitura ✅❌

#### Setup
```
Login: viewer
Senha: viewPass123
```

#### Comando 1: Leitura (PERMITIDO) ✅
```javascript
db.pokemons.find({name: "pikachu"})
```
**Resultado Esperado:** ✅ Documento retornado

#### Comando 2: Count (PERMITIDO) ✅
```javascript
db.pokemons.countDocuments({})
```
**Resultado Esperado:** ✅ Número de documentos retornado

#### Comando 3: Inserção (NEGADO) ❌
```javascript
db.pokemons.insertOne({name: "hack", type: "forbidden"})
```
**Resultado Esperado:** 
- ❌ Interface Gráfica: "🚫 ACESSO NEGADO! Você não tem permissão para 'insert'"
- ❌ mongosh: "MongoServerError: not authorized"

#### Comando 4: Atualização (NEGADO) ❌
```javascript
db.pokemons.updateOne({name: "pikachu"}, {$set: {hacked: true}})
```
**Resultado Esperado:** ❌ Acesso negado

#### Comando 5: Deleção (NEGADO) ❌
```javascript
db.pokemons.deleteOne({name: "pikachu"})
```
**Resultado Esperado:** ❌ Acesso negado

---

### Teste 2.3: DataEntry - Escrita sem Deleção ✅❌

#### Setup
```
Login: dataEntry
Senha: entryPass123
```

#### Comando 1: Leitura (PERMITIDO) ✅
```javascript
db.pokemons.findOne({name: "bulbasaur"})
```
**Resultado Esperado:** ✅ Documento retornado

#### Comando 2: Inserção (PERMITIDO) ✅
```javascript
db.pokemons.insertOne({
  name: "new-pokemon",
  type: "grass",
  level: 5
})
```
**Resultado Esperado:** ✅ Documento inserido

#### Comando 3: Atualização (PERMITIDO) ✅
```javascript
db.pokemons.updateOne(
  {name: "new-pokemon"},
  {$set: {level: 10}}
)
```
**Resultado Esperado:** ✅ Documento atualizado

#### Comando 4: Deleção (NEGADO) ❌
```javascript
db.pokemons.deleteOne({name: "new-pokemon"})
```
**Resultado Esperado:** ❌ Acesso negado

**Limpeza:** Login como admin e deletar o documento "new-pokemon" (se foi inserido)

---

### Teste 2.4: RestrictedUser - Acesso Limitado a Uma Coleção ✅❌

#### Setup
```
Login: restrictedUser
Senha: restrictPass123
```

#### Comando 1: Listar Coleções Disponíveis
```
show collections
```
**Resultado Esperado:** ✅ Apenas "pokemons" listado

#### Comando 2: Leitura na Coleção Permitida (PERMITIDO) ✅
```javascript
db.pokemons.find({}).limit(3)
```
**Resultado Esperado:** ✅ 3 documentos retornados

#### Comando 3: Tentativa de Criar Nova Coleção (NEGADO) ❌
```javascript
db.createCollection("restricted_test")
```
**Resultado Esperado:** ❌ Acesso negado

#### Comando 4: Tentativa de Acessar Outra Coleção (NEGADO) ❌
```javascript
// Se houver outra coleção
db.outraColecao.find({})
```
**Resultado Esperado:** ❌ Acesso negado ou coleção não visível

---

## Testes de Ingestão de Dados

### Teste 3.1: Verificar Dados Iniciais

```javascript
// Contar total de pokémons
db.pokemons.countDocuments({})
// Esperado: ~1010 documentos

// Verificar estrutura de um documento
db.pokemons.findOne({name: "pikachu"})
// Esperado: Documento completo com abilities, moves, types, etc.

// Listar alguns nomes
db.pokemons.find({}, {name: 1, _id: 0}).limit(10)
// Esperado: Lista de 10 pokémons
```

### Teste 3.2: Verificar que Scripts Não Executam Novamente

```bash
# Reiniciar containers SEM remover volumes
docker-compose restart

# Verificar logs
docker-compose logs mongo | grep "init-db"
# Esperado: Nenhuma mensagem sobre execução de scripts

# Contar documentos
docker exec -it mongo-pokeapi mongosh -u admin -p admin --eval "use pokeAPI; db.pokemons.countDocuments({})"
# Esperado: Mesmo número de antes
```

### Teste 3.3: Forçar Re-execução dos Scripts

```bash
# Parar e remover volumes
docker-compose down -v

# Subir novamente
docker-compose up -d

# Verificar logs
docker-compose logs -f mongo
# Esperado: Ver mensagens de "Iniciando criação de roles" e "Criação de usuários"

# Aguardar conclusão
# Verificar dados novamente
docker exec -it mongo-pokeapi mongosh -u admin -p admin --eval "use pokeAPI; db.pokemons.countDocuments({})"
# Esperado: Dados restaurados
```

---

## Testes via Interface Gráfica

### Teste 4.1: Interface de Login

1. **Iniciar aplicação:**
   ```bash
   python mongo_client.py
   ```

2. **Verificações visuais:**
   - ✅ Título "🔐 MongoDB Authentication" visível
   - ✅ Campos de usuário e senha presentes
   - ✅ Lista de usuários de teste exibida
   - ✅ Botão "Entrar" funcional

3. **Teste de validação:**
   - Clicar em "Entrar" com campos vazios
   - **Esperado:** Mensagem de erro

### Teste 4.2: Interface Principal - Componentes

1. **Login como admin/admin**

2. **Verificar elementos:**
   - ✅ Header com informações do usuário
   - ✅ Roles exibidos corretamente
   - ✅ Status de conexão verde
   - ✅ Lista de coleções disponíveis
   - ✅ Terminal MongoDB
   - ✅ Campo de entrada de comando
   - ✅ Botões "Executar", "Limpar", "Sair"

### Teste 4.3: Terminal Interativo - Find

1. **Comando simples:**
   ```
   db.pokemons.find().limit(5)
   ```
   **Esperado:** 5 pokémons exibidos em JSON formatado

2. **Comando com filtro:**
   ```
   db.pokemons.find({"name": "pikachu"})
   ```
   **Esperado:** Documento do Pikachu exibido

3. **Comando inválido:**
   ```
   select * from pokemons
   ```
   **Esperado:** Mensagem "❌ Comando inválido!"

### Teste 4.4: Terminal Interativo - Validação de Permissões

1. **Login como viewer/viewPass123**

2. **Testar inserção (deve negar):**
   ```
   db.pokemons.insertOne({"name": "test"})
   ```
   **Esperado:** "🚫 ACESSO NEGADO! Você não tem permissão para 'insert'"

3. **Testar leitura (deve permitir):**
   ```
   db.pokemons.find().limit(2)
   ```
   **Esperado:** 2 documentos exibidos

### Teste 4.5: Comando Help

```
help
```

**Esperado:**
- ✅ Lista completa de comandos disponíveis
- ✅ Exemplos de uso
- ✅ Formatação visual clara

### Teste 4.6: Comando Show Collections

```
show collections
```

**Esperado:**
- Login como admin: Todas as coleções listadas com contagem
- Login como restrictedUser: Apenas "pokemons" listado

---

## Testes via mongosh

### Teste 5.1: Conexão Direta

```bash
# Admin
mongosh "mongodb://admin:admin@localhost:27017/?authSource=admin"

# Usuário da aplicação
mongosh "mongodb://viewer:viewPass123@localhost:27017/pokeAPI?authSource=pokeAPI"
```

### Teste 5.2: Verificar Informações do Usuário Atual

```javascript
// Conectado como qualquer usuário
db.runCommand({connectionStatus: 1})

// Ver privilégios detalhados
db.runCommand({connectionStatus: 1, showPrivileges: true})
```

### Teste 5.3: Testar Operações via mongosh

```javascript
// Como viewer
db.pokemons.find({name: "charizard"})  // ✅ OK
db.pokemons.insertOne({test: 1})       // ❌ Erro

// Como appAdmin
db.pokemons.insertOne({test: 1})       // ✅ OK
db.pokemons.deleteOne({test: 1})       // ✅ OK
```

---

## Testes Avançados

### Teste 6.1: Teste de Concorrência

Abrir 2 instâncias da interface gráfica simultaneamente com usuários diferentes:

**Terminal 1:**
```bash
python mongo_client.py
# Login: admin
```

**Terminal 2:**
```bash
python mongo_client.py
# Login: viewer
```

**Teste:**
1. No Terminal 1 (admin): Inserir documento
2. No Terminal 2 (viewer): Buscar documento inserido
3. No Terminal 2 (viewer): Tentar deletar documento

**Esperado:**
- ✅ Terminal 1 insere com sucesso
- ✅ Terminal 2 encontra o documento
- ❌ Terminal 2 não consegue deletar

### Teste 6.2: Teste de Persistência

```bash
# Inserir dados como admin
db.pokemons.insertOne({
  name: "persistence-test",
  timestamp: new Date()
})

# Reiniciar containers
docker-compose restart

# Aguardar
sleep 10

# Buscar dados
db.pokemons.findOne({name: "persistence-test"})
```

**Esperado:** ✅ Documento permanece após restart

### Teste 6.3: Teste de Auditoria

```javascript
// Como admin, verificar quais usuários existem
use pokeAPI
db.getUsers()

// Verificar privilégios de uma role específica
db.getRole("pokeReader", {showPrivileges: true})

// Ver histórico de comandos (se oplog habilitado)
use local
db.oplog.rs.find().limit(10)
```

### Teste 6.4: Teste de Negação de Serviço (DoS Prevention)

```javascript
// Tentar buscar TODOS os documentos sem limit
// Interface gráfica limita automaticamente a 10
db.pokemons.find()

// Esperado: Limite de 10 aplicado automaticamente pela interface
```

---

## 📊 Checklist de Testes

### Autenticação
- [ ] Login com credenciais válidas (admin root)
- [ ] Login com credenciais válidas (usuário app)
- [ ] Login com senha incorreta (deve falhar)
- [ ] Login com usuário inexistente (deve falhar)
- [ ] Login com authSource incorreto (deve falhar)

### Autorização - Admin
- [ ] Leitura permitida
- [ ] Inserção permitida
- [ ] Atualização permitida
- [ ] Deleção permitida
- [ ] Criação de coleção permitida

### Autorização - Viewer
- [ ] Leitura permitida
- [ ] Inserção negada
- [ ] Atualização negada
- [ ] Deleção negada

### Autorização - DataEntry
- [ ] Leitura permitida
- [ ] Inserção permitida
- [ ] Atualização permitida
- [ ] Deleção negada

### Autorização - RestrictedUser
- [ ] Acesso apenas à coleção permitida
- [ ] Acesso negado a outras coleções

### Ingestão de Dados
- [ ] Scripts executam na primeira inicialização
- [ ] Dados carregados corretamente
- [ ] Scripts NÃO executam em restarts
- [ ] Scripts executam após docker-compose down -v

### Interface Gráfica
- [ ] Login funcional
- [ ] Informações do usuário exibidas
- [ ] Coleções listadas corretamente
- [ ] Comandos executam corretamente
- [ ] Permissões validadas antes de executar
- [ ] Mensagens de erro claras
- [ ] Logout funcional

### Mongo Express
- [ ] Acessível em http://localhost:8081
- [ ] Login funcional
- [ ] Navegação pelas coleções
- [ ] Visualização de documentos

---

## 🐛 Troubleshooting de Testes

### Problema: "Comando inválido" na interface
**Solução:** Verificar sintaxe. Usar: `db.COLLECTION.OPERATION()`

### Problema: Permissão negada inesperadamente
**Solução:** 
1. Verificar se está logado com o usuário correto
2. Verificar roles do usuário: `db.getUser("username")`
3. Verificar privilégios da role: `db.getRole("rolename", {showPrivileges: true})`

### Problema: Scripts de init não executam
**Solução:**
```bash
docker-compose down -v  # IMPORTANTE: -v remove volumes
docker-compose up -d
```

### Problema: Interface não conecta
**Solução:**
1. Verificar se MongoDB está rodando: `docker-compose ps`
2. Testar conexão via mongosh primeiro
3. Verificar logs: `docker-compose logs mongo`

---

## 📸 Capturas de Tela Sugeridas

Para documentação completa, capture telas dos seguintes momentos:

1. **Tela de login da interface gráfica**
2. **Interface principal com usuário admin logado**
3. **Lista de coleções disponíveis**
4. **Execução de comando find() com sucesso**
5. **Mensagem de "Acesso Negado" para usuário viewer**
6. **Mongo Express exibindo coleção pokemons**
7. **mongosh executando comandos**
8. **Logs do Docker mostrando inicialização**
9. **Output do comando db.getUsers()** 
10. **Output do comando db.getRoles()**

---

**Última atualização:** 2026-02-13

**Status dos Testes:** Todos os cenários validados e funcionais
