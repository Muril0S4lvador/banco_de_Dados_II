# ⚡ Quick Start - 5 Minutos para Começar

Comece a usar o projeto MongoDB Authentication em menos de 5 minutos!

## 🎯 Objetivo

Este projeto demonstra autenticação, autorização e controle de acesso baseado em roles no MongoDB.

---

## 📋 Pré-requisitos (Apenas isso!)

- ✅ Docker Desktop instalado e rodando
- ✅ Python 3.8+ instalado
- ✅ Git (para clonar o repositório)

---

## 🚀 Início em 4 Passos

### 1️⃣ Clone e Entre no Diretório
```bash
# Se ainda não clonou
git clone <seu-repositorio>
cd mongo

# Ou navegue até o diretório do projeto
cd c:\Users\dalmo\ufes\bd\mongo
```

### 2️⃣ Execute o Setup (Opcional mas Recomendado)

**Windows PowerShell:**
```powershell
.\setup.ps1
```

**Ou manualmente:**
```bash
pip install -r requirements.txt
docker-compose up -d
```

### 3️⃣ Aguarde ~15 segundos
```bash
# Ver logs da inicialização
docker-compose logs -f mongo
# Quando ver "MongoDB init process complete", está pronto!
# Pressione Ctrl+C para sair dos logs
```

### 4️⃣ Abra a Interface Gráfica
```bash
python mongo_client.py
```

**🎉 Pronto! Agora você pode fazer login e testar.**

---

## 👤 Primeiro Login

Na interface que abriu:

```
Usuário: appAdmin
Senha: adminPass123
```

Clique em **Entrar**

---

## 💻 Primeiros Comandos

Teste estes comandos no terminal da interface:

### 1. Ver coleções disponíveis
```
show collections
```

### 2. Buscar pokémons
```
db.pokemons.find().limit(5)
```

### 3. Buscar Pikachu
```
db.pokemons.find({"name": "pikachu"})
```

### 4. Contar total de pokémons
```
db.pokemons.countDocuments({})
```

### 5. Inserir um novo pokémon
```
db.pokemons.insertOne({"name": "test-pokemon", "type": "electric", "level": 1})
```

### 6. Ver ajuda
```
help
```

---

## 🔐 Testar Controle de Acesso

### Cenário: Usuário com Permissão Limitada

1. **Clique em "Sair"** na interface

2. **Faça login como viewer:**
   ```
   Usuário: viewer
   Senha: viewPass123
   ```

3. **Tente buscar (deve funcionar):**
   ```
   db.pokemons.find().limit(3)
   ```

4. **Tente inserir (deve falhar!):**
   ```
   db.pokemons.insertOne({"name": "hack"})
   ```

   **Resultado esperado:** 🚫 ACESSO NEGADO!

✅ **Permissões funcionando!** O viewer não pode inserir dados.

---

## 🌐 Interface Web (Mongo Express)

Abra o navegador:

```
http://localhost:8081
```

**Login:**
- Usuário: `admin`
- Senha: `admin`

Explore o banco visualmente!

---

## 📊 Usuários Disponíveis

| Usuário | Senha | O que pode fazer |
|---------|-------|------------------|
| `appAdmin` | `adminPass123` | ✅ TUDO (Admin completo) |
| `viewer` | `viewPass123` | 👁️ Apenas ver dados |
| `dataEntry` | `entryPass123` | ✏️ Ver, inserir e editar |
| `developer` | `devPass123` | 💻 Ver, inserir e editar |
| `restrictedUser` | `restrictPass123` | 🔒 Ver apenas coleção `pokemons` |

---

## 🧪 Teste Completo Rápido (2 minutos)

### Teste 1: Admin pode tudo
```bash
Login: appAdmin / adminPass123

# Inserir
db.pokemons.insertOne({"name": "admin-test", "level": 1})

# Consultar
db.pokemons.find({"name": "admin-test"})

# Atualizar
db.pokemons.updateOne({"name": "admin-test"}, {"$set": {"level": 50}})

# Deletar
db.pokemons.deleteOne({"name": "admin-test"})
```
✅ **Tudo deve funcionar!**

### Teste 2: Viewer não pode escrever
```bash
Login: viewer / viewPass123

# Ver (OK)
db.pokemons.find().limit(3)

# Inserir (NEGADO)
db.pokemons.insertOne({"name": "hack"})
```
✅ **Inserção deve ser bloqueada!**

---

## 🛠️ Comandos Essenciais

### Parar tudo
```bash
docker-compose down
```

### Reiniciar (mantém dados)
```bash
docker-compose restart
```

### Reset completo (perde dados!)
```bash
docker-compose down -v
docker-compose up -d
# Aguardar 15 segundos
```

### Ver status
```bash
docker-compose ps
```

### Ver logs
```bash
docker-compose logs -f
```

---

## ❓ Problemas Comuns

### MongoDB não inicia
```bash
# Verificar se Docker está rodando
docker ps

# Ver logs de erro
docker-compose logs mongo

# Tentar restart
docker-compose restart
```

### Interface não conecta
```bash
# Verificar se containers estão rodando
docker-compose ps

# Deve mostrar:
# mongo-pokeapi      running
```

### "Acesso negado" inesperado
- Verifique se está usando o usuário e senha corretos
- Verifique se especificou o banco correto (pokeAPI)
- Tente resetar: `docker-compose down -v && docker-compose up -d`

### Scripts de init não executam
```bash
# IMPORTANTE: Remover volumes para forçar re-execução
docker-compose down -v
docker-compose up -d
```

---

## 📚 Próximos Passos

Agora que está funcionando:

1. **Leia a documentação completa:** [README.md](README.md)
2. **Explore os testes:** [TESTES.md](TESTES.md)
3. **Referência de comandos:** [COMANDOS.md](COMANDOS.md)
4. **Entenda a especificação:** [ESPECIFICACAO.md](ESPECIFICACAO.md)

---

## 🎓 O que Você Aprendeu

Em 5 minutos você:

✅ Configurou um MongoDB com autenticação  
✅ Criou usuários com diferentes permissões  
✅ Testou controle de acesso baseado em roles  
✅ Executou comandos MongoDB através de uma interface  
✅ Validou que permissões funcionam corretamente  

---

## 💡 Dicas Profissionais

### Dica 1: Use o comando `help`
No terminal da interface, digite:
```
help
```
Para ver todos os comandos disponíveis!

### Dica 2: Atalho Enter
Pressione `Enter` no campo de comando para executar rapidamente.

### Dica 3: Explore o Mongo Express
A interface web em http://localhost:8081 permite visualizar dados de forma mais amigável.

### Dica 4: Leia os logs
Quando algo não funcionar, sempre verifique:
```bash
docker-compose logs -f mongo
```

### Dica 5: Reset quando necessário
Se algo der errado, o reset completo sempre resolve:
```bash
docker-compose down -v && docker-compose up -d
```

---

## 🏆 Desafios

Teste suas habilidades:

### Nível Iniciante
- [ ] Fazer login com todos os 5 usuários
- [ ] Buscar um Pokémon específico
- [ ] Inserir um novo documento
- [ ] Ver as coleções disponíveis

### Nível Intermediário
- [ ] Criar um usuário restrito via mongosh
- [ ] Testar que o novo usuário tem permissões limitadas
- [ ] Fazer uma consulta com filtro complexo
- [ ] Usar agregação para estatísticas

### Nível Avançado
- [ ] Criar uma nova role customizada
- [ ] Modificar privilégios de uma role existente
- [ ] Implementar rotação de senhas
- [ ] Adicionar TLS/SSL ao MongoDB

---

## 📞 Ajuda

Se precisar de ajuda:

1. Verifique [TESTES.md](TESTES.md) - seção Troubleshooting
2. Veja [COMANDOS.md](COMANDOS.md) - comandos úteis
3. Leia [README.md](README.md) - documentação completa
4. Verifique logs: `docker-compose logs -f mongo`

---

## ⭐ Status do Sistema

Para verificar se está tudo funcionando:

```bash
# 1. Containers rodando?
docker-compose ps
# Esperado: 2 containers "Up"

# 2. MongoDB respondendo?
docker exec mongo-pokeapi mongosh --eval "db.version()"
# Esperado: Versão do MongoDB

# 3. Usuários criados?
docker exec -it mongo-pokeapi mongosh -u admin -p admin --eval "use pokeAPI; db.getUsers().length"
# Esperado: 6 (número de usuários)

# 4. Dados carregados?
docker exec -it mongo-pokeapi mongosh -u admin -p admin --eval "use pokeAPI; db.pokemons.countDocuments()"
# Esperado: ~1010 (número de pokémons)
```

Se todos os comandos acima funcionarem: **✅ Sistema 100% operacional!**

---

## 🎯 Checklist Final

Antes de finalizar, certifique-se:

- [ ] Docker está rodando
- [ ] Containers iniciados (`docker-compose ps`)
- [ ] Interface gráfica abre (`python mongo_client.py`)
- [ ] Login funciona
- [ ] Comandos executam
- [ ] Permissões são validadas
- [ ] Mongo Express acessível (http://localhost:8081)

**Tudo certo? Parabéns! 🎉**

Você está pronto para explorar o projeto completo!

---

**⏱️ Tempo total:** ~5 minutos  
**🎓 Dificuldade:** Iniciante  
**✅ Pré-requisitos:** Docker + Python

[← Voltar ao README](README.md) | [Ver Testes Completos →](TESTES.md)
