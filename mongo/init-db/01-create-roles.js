// ========================================
// Script de Criação de Sistema de Roles Customizado
// ========================================
// Este script cria o sistema de permissões customizado conforme PERMISSION.md
// Baseado em JSON com estrutura: tableName, read, create, delete, update, admin

print('========================================');
print('Iniciando criação do sistema de roles customizado');
print('========================================');

// Conectar ao banco de dados pokeAPI
db = db.getSiblingDB('pokeAPI');

// ========================================
// 1. Criar coleção de roles (se não existir)
// ========================================
try {
  db.createCollection("roles");
  print('✓ Coleção "roles" criada com sucesso');
} catch (error) {
  print('⚠ Coleção "roles" já existe ou erro: ' + error.message);
}

// ========================================
// 2. Limpar roles existentes (para ambiente de desenvolvimento)
// ========================================
db.roles.deleteMany({});
print('✓ Roles anteriores removidas');

// ========================================
// Role 1: admin
// Descrição: Administrador com acesso total ao sistema
// Permissões: admin: true (acesso pleno a tudo)
// ========================================
db.roles.insertOne({
  roleName: "admin",
  admin: true,
  permissions: []
});
print('✓ Role "admin" criada - Acesso total ao sistema');

// ========================================
// Role 2: pokeReader
// Descrição: Leitor com acesso de leitura a todas as coleções
// Permissões: Somente leitura (read) em pokemons
// ========================================
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
print('✓ Role "pokeReader" criada - Leitura em pokemons');

// ========================================
// Verificação: Listar todas as roles criadas
// ========================================
print('\n========================================');
print('Roles customizadas criadas no banco pokeAPI:');
print('========================================');
const roles = db.roles.find().toArray();
roles.forEach(function(role) {
  print('- ' + role.roleName + ' (admin: ' + role.admin + ')');
  if (role.permissions.length > 0) {
    role.permissions.forEach(function(perm) {
      print('  → ' + perm.tableName + ': read=' + perm.read + ', create=' + perm.create + ', delete=' + perm.delete + ', update=' + perm.update);
    });
  }
});

print('\n========================================');
print('Sistema de roles customizado criado com sucesso!');
print('Total de roles: ' + db.roles.countDocuments());
print('========================================\n');
