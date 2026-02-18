// ========================================
// Script de Criação de Usuários Customizado
// ========================================
// Este script cria usuários no sistema customizado de permissões
// armazenando credenciais na coleção "users" com roles customizadas

print('========================================');
print('Iniciando criação de usuários customizados');
print('========================================');

// Conectar ao banco de dados pokeAPI
db = db.getSiblingDB('pokeAPI');

// ========================================
// 1. Criar coleção de users (se não existir)
// ========================================
try {
  db.createCollection("users");
  print('✓ Coleção "users" criada com sucesso');
} catch (error) {
  print('⚠ Coleção "users" já existe ou erro: ' + error.message);
}

// ========================================
// 2. Limpar usuários existentes (para ambiente de desenvolvimento)
// ========================================
db.users.deleteMany({});
print('✓ Usuários anteriores removidos');

// ========================================
// Usuário 1: admin
// Roles: [admin]
// Descrição: Administrador root com acesso total ao sistema
// NOTA: Senha em texto plano apenas para desenvolvimento/demonstração
// ========================================
db.users.insertOne({
  username: "admin",
  password: "admin", // Em produção, usar hash bcrypt ou similar
  roles: ["admin"],
  active: true,
  createdAt: new Date()
});
print('✓ Usuário "admin" criado com sucesso');
print('  - Roles: [admin]');
print('  - Permissões: Acesso total ao sistema');

// ========================================
// Usuário 2: viewer
// Roles: [pokeReader]
// Descrição: Usuário com acesso somente leitura
// ========================================
db.users.insertOne({
  username: "viewer",
  password: "viewPass123",
  roles: ["pokeReader"],
  active: true,
  createdAt: new Date()
});
print('✓ Usuário "viewer" criado com sucesso');
print('  - Roles: [pokeReader]');
print('  - Permissões: Somente leitura em pokemons');

// ========================================
// 3. Criar índice único no username para evitar duplicatas
// ========================================
try {
  db.users.createIndex({ username: 1 }, { unique: true });
  print('✓ Índice único criado em username');
} catch (error) {
  print('⚠ Erro ao criar índice: ' + error.message);
}

// ========================================
// Verificação: Listar todos os usuários criados
// ========================================
print('\n========================================');
print('Usuários criados no banco pokeAPI:');
print('========================================');
const users = db.users.find({}, { password: 0 }).toArray();
users.forEach(function(user) {
  print('- ' + user.username);
  print('  Roles: ' + JSON.stringify(user.roles));
  print('  Ativo: ' + user.active);
});

print('\n========================================');
print('RESUMO DE CREDENCIAIS:');
print('========================================');
print('ADMIN: admin / admin - Acesso total ao sistema');
print('========================================');
print('USUÁRIOS DA APLICAÇÃO:');
print('1. viewer / viewPass123 - Somente leitura');
print('========================================');
print('Total de usuários: ' + db.users.countDocuments());
print('========================================\n');
